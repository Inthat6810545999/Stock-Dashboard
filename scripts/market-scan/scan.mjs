import {scanPriceGainers,priceSnapshot} from './price-gainers.mjs';
import YahooFinance from 'yahoo-finance2';
import {mkdir,readFile,writeFile,rename,open,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {discoverUniverse} from './universe.mjs';
import {rankCandidates} from '../../lib/must-watch.ts';
const root=resolve(import.meta.dirname,'../..');const stateDir=resolve(root,'.cache/market-scan');await mkdir(stateDir,{recursive:true});await mkdir(resolve(root,'data'),{recursive:true});
const marketArg=process.argv.find(s=>s.startsWith('--market='))?.split('=')[1];if(marketArg&&!['us','th'].includes(marketArg))throw Error('Use --market=us or --market=th');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const num=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
async function atomic(path,value){const tmp=path+'.tmp';await writeFile(tmp,JSON.stringify(value,null,2)+'\n');await rename(tmp,path)}
async function retry(fn){for(let attempt=0;;attempt++){try{return await fn()}catch(e){if(attempt>=2)throw e;await sleep(1500*2**attempt)}}}
for(const market of marketArg?[marketArg]:['us','th']){
 const lockPath=resolve(stateDir,market+'.lock');let lock;try{lock=await open(lockPath,'wx')}catch{throw Error(`A ${market} scan is already running. If a previous run crashed, remove ${lockPath}.`)}
 try{
 const day=new Date().toISOString().slice(0,10);const path=resolve(stateDir,`${market}-${day}.json`);let state;try{state=JSON.parse(await readFile(path,'utf8'))}catch{}
 if(!state){const universe=await discoverUniverse(market);state={day,market,universe,startedAt:Date.now(),outcomes:{}};await atomic(path,state)}
 // Retry transient failures on same-day resume, while retaining completed symbols.
 for(const [symbol,outcome] of Object.entries(state.outcomes))if(outcome.kind==='failed')delete state.outcomes[symbol];
 const symbols=state.universe.rows.map(r=>r.symbol);const yahoo=new YahooFinance({suppressNotices:['yahooSurvey'],validation:{logErrors:false}});
 const output=resolve(root,'data',`must-watch-${market}.json`);
 async function publish(complete=false){const entries=Object.values(state.outcomes),rows=entries.filter(e=>e.kind==='eligible').map(e=>e.row);const count=k=>entries.filter(e=>e.kind===k).length;const previous=await readFile(output,'utf8').then(JSON.parse).catch(()=>null);const scan={total:symbols.length,processed:entries.length,eligible:count('eligible'),excluded:count('excluded'),missing:count('missing'),failed:count('failed'),startedAt:state.startedAt,directoryAt:state.universe.retrievedAt,sources:state.universe.sources,status:complete?'complete':'scanning'};const result={...priceSnapshot(state),items:rankCandidates(rows),allSizes:rankCandidates(rows,null),checked:entries.length,failed:count('failed'),updatedAt:Date.now(),market,universe:market==='us'?'US exchange-listed equities from Nasdaq Trader; excludes OTC, funds, preferred shares, warrants, rights and units.':'SET/mai company directory from Thailand SEC; excludes entries without a SET/mai classification.',scan};if(!complete&&previous?.scan?.status==='complete'){await atomic(output,{...previous,activeScan:scan});}else await atomic(output,result);}
 await publish();console.log(`${market}: ${symbols.length} symbols, ${Object.keys(state.outcomes).length} already processed`);
 for(let i=0;i<symbols.length;i+=80){const batch=symbols.slice(i,i+80).filter(s=>!state.outcomes[s]);if(!batch.length)continue;let quotes=[];try{quotes=await retry(()=>yahoo.quote(batch,{}, {validateResult:false}))}catch(e){console.warn(`${market}: quote batch unavailable; checking fundamentals individually`)}const quoteMap=new Map(quotes.map(q=>[q.symbol,q]));const pending=[];
 for(const symbol of batch){const q=quoteMap.get(symbol);const pe=num(q?.trailingPE),fpe=num(q?.forwardPE);if(q&&q.quoteType!=='EQUITY'){state.outcomes[symbol]={kind:'excluded',reason:'Not an equity'};continue}if((pe!==null&&(pe<=0||pe>25))||(fpe!==null&&(fpe<=0||fpe>25))){state.outcomes[symbol]={kind:'excluded',reason:'P/E outside criteria'};continue}pending.push(symbol)}
 for(let j=0;j<pending.length;j+=4){await Promise.all(pending.slice(j,j+4).map(async symbol=>{try{const d=await retry(()=>yahoo.quoteSummary(symbol,{modules:['price','summaryDetail','defaultKeyStatistics','financialData']},{validateResult:false}));const p=d.price,s=d.summaryDetail,f=d.financialData;if(p?.quoteType&&p.quoteType!=='EQUITY'){state.outcomes[symbol]={kind:'excluded',reason:'Not an equity'};return}const row={symbol,name:p?.longName||p?.shortName||symbol,currency:p?.currency||(market==='us'?'USD':'THB'),price:num(p?.regularMarketPrice),pe:num(s?.trailingPE),forwardPe:num(s?.forwardPE??d.defaultKeyStatistics?.forwardPE),salesGrowth:num(f?.revenueGrowth),marketCap:num(p?.marketCap),timestamp:p?.regularMarketTime?new Date(p.regularMarketTime).getTime():null,score:0};if([row.price,row.pe,row.forwardPe,row.salesGrowth].some(v=>v===null)){state.outcomes[symbol]={kind:'missing',reason:'Required price, P/E, forward P/E or revenue growth unavailable'};}else if(rankCandidates([row],null).length){state.outcomes[symbol]={kind:'eligible',row};}else{state.outcomes[symbol]={kind:'excluded',reason:'Growth or valuation outside criteria'}}}catch{state.outcomes[symbol]={kind:'failed',reason:'Provider request failed after retries'}}}));await sleep(250)}
 await atomic(path,state);await publish();console.log(`${market}: ${Object.keys(state.outcomes).length}/${symbols.length} checked`);await sleep(250);
 }
 const failed=Object.values(state.outcomes).filter(e=>e.kind==='failed').length;if(failed>symbols.length*.25)throw Error(`Provider outage: ${failed}/${symbols.length} requests failed. Previous completed snapshot preserved.`);
 await scanPriceGainers(state,{save:()=>atomic(path,state),progress:()=>publish(),sleep});
 const priceFailed=Object.values(state.priceOutcomes).filter(o=>o.kind==='failed').length;if(priceFailed>symbols.length*.25)throw Error('Price history provider outage; preserving previous completed ranking');
 await publish(true);console.log(`${market}: complete; ${failed} provider failures; snapshot ${output}`);
 }catch(error){const output=resolve(root,'data',`must-watch-${market}.json`);const previous=await readFile(output,'utf8').then(JSON.parse).catch(()=>null);if(previous?.activeScan)await atomic(output,{...previous,activeScan:{...previous.activeScan,status:'failed'}});else if(previous?.scan?.status==='scanning')await atomic(output,{...previous,scan:{...previous.scan,status:'failed'}});throw error;}finally{await lock.close();await unlink(lockPath)}
}
