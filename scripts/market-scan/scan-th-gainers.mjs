import YahooFinance from 'yahoo-finance2';
import {readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {discoverUniverse} from './universe.mjs';
import {getThaiScanWindow,isThaiQuoteUsable} from '../../lib/th-market-session.ts';
import {rankTodayGainers} from '../../lib/today-gainers.ts';

const root=resolve(import.meta.dirname,'../..');
const output=resolve(root,'data/must-watch-th.json');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const num=value=>typeof value==='number'&&Number.isFinite(value)?value:null;
const dayInBangkok=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(value);

async function retry(fn){
 for(let attempt=0;;attempt++){
  try{return await fn()}catch(error){if(attempt>=2)throw error;await sleep(1500*2**attempt)}
 }
}

const force=process.env.FORCE_MARKET_SCAN==='true';
const window=getThaiScanWindow();
if(window==='closed'&&!force){
 console.log('SET/mai session is closed; leaving the latest Thai gainer snapshot unchanged.');
 process.exit(0);
}

const yahoo=new YahooFinance({suppressNotices:['yahooSurvey'],validation:{logErrors:false}});
let benchmark;
if(!force){
 benchmark=await retry(()=>yahoo.quote('^SET.BK',{}, {validateResult:false})).catch(error=>{console.warn(`SET market-state check unavailable: ${String(error).slice(0,180)}`);return null});
 const benchmarkTime=benchmark?.regularMarketTime?new Date(benchmark.regularMarketTime).getTime():null;
 if(!isThaiQuoteUsable(window,benchmark?.marketState,benchmarkTime)){
  console.log(`Yahoo reports SET state ${benchmark?.marketState||'unavailable'} without a usable current-session index quote; leaving the latest Thai gainer snapshot unchanged.`);
  process.exit(0);
 }
}

const previous=JSON.parse(await readFile(output,'utf8'));
const universe=await discoverUniverse('th');
const rows=[];let eligible=0,processed=0,missing=0,failed=0;
for(let offset=0;offset<universe.rows.length;offset+=80){
 const batch=universe.rows.slice(offset,offset+80);
 try{
  const quotes=await retry(()=>yahoo.quote(batch.map(row=>row.symbol),{}, {validateResult:false}));
  const bySymbol=new Map(quotes.map(quote=>[quote.symbol,quote]));
  for(const row of batch){
   const quote=bySymbol.get(row.symbol),price=num(quote?.regularMarketPrice),previousClose=num(quote?.regularMarketPreviousClose);
   const timestamp=quote?.regularMarketTime?new Date(quote.regularMarketTime).getTime():NaN;
   if(price===null||price<=0||previousClose===null||previousClose<=0||!Number.isFinite(timestamp)||dayInBangkok(new Date(timestamp))!==dayInBangkok(new Date())){missing++;continue;}
   eligible++;
   const percent=(price/previousClose-1)*100;
   if(percent>0)rows.push({symbol:row.symbol,name:quote.longName||quote.shortName||row.name||row.symbol,currency:quote.currency||'THB',price,previousClose,timestamp,percent});
  }
 }catch(error){
  failed+=batch.length;
  console.warn(`Thai quote batch ${offset+1}-${offset+batch.length} failed after retries: ${String(error).slice(0,180)}`);
 }
 processed+=batch.length;
 if(processed%400===0||processed===universe.rows.length)console.log(`Thai quotes: ${processed}/${universe.rows.length}; gainers ${rows.length}; missing ${missing}; failed ${failed}`);
 await sleep(250);
}

if(failed>universe.rows.length*.25)throw Error(`Yahoo quote outage: ${failed}/${universe.rows.length} symbols failed. Keeping the last published Thai ranking.`);
const updatedAt=Date.now(),todayGainers=rankTodayGainers(rows),todayCandidates=rankTodayGainers(rows,30);
const todayScan={total:universe.rows.length,processed,eligible,missing,failed,status:'complete',source:'Yahoo Finance · full SET/mai universe',updatedAt};
const result={...previous,todayGainers,todayCandidates,todayScan,todayGainersSource:'Yahoo Finance · full SET/mai universe',todayGainersUpdatedAt:updatedAt};
const temp=output+'.tmp';await writeFile(temp,JSON.stringify(result,null,2)+'\n');await rename(temp,output);
console.log(`Published ${todayGainers.length} Thai daily gainers from ${universe.rows.length} SET/mai symbols at ${new Date(updatedAt).toISOString()}.`);
