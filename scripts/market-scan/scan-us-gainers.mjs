import YahooFinance from 'yahoo-finance2';
import {readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {discoverUniverse} from './universe.mjs';
import {getUsScanWindow} from '../../lib/us-market-session.ts';
import {rankTodayGainers} from '../../lib/today-gainers.ts';
import {getDueGainerSlot} from './gainer-schedule.mjs';

const root=resolve(import.meta.dirname,'../..');
const output=resolve(root,'data/must-watch-us.json');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const num=value=>typeof value==='number'&&Number.isFinite(value)?value:null;

async function retry(fn){
 for(let attempt=0;;attempt++){
  try{return await fn()}catch(error){if(attempt>=2)throw error;await sleep(1500*2**attempt)}
 }
}

const scanWindow=getUsScanWindow();
const previous=JSON.parse(await readFile(output,'utf8'));
const scheduledSlot=getDueGainerSlot('us');
if(process.env.GAINER_SCHEDULED==='true'&&(!scheduledSlot||previous.todayScan?.scheduledSlot===scheduledSlot)){
 console.log(`Scheduled US scan skipped: ${scheduledSlot?'this hourly slot is already published':'no trading slot is due'}.`);
 process.exit(0);
}
if(scanWindow==='closed'){
 console.log('US regular session is closed; leaving the latest gainer snapshot unchanged.');
 process.exit(0);
}

const yahoo=new YahooFinance({suppressNotices:['yahooSurvey'],validation:{logErrors:false}});
const marketState=await retry(()=>yahoo.quote('SPY',{}, {validateResult:false})).then(quote=>quote.marketState).catch(()=>null);
const expectedState=scanWindow==='regular'?'REGULAR':'POST';
if(marketState!==expectedState){
 console.log(`Yahoo reports the US market state as ${marketState||'unavailable'}; leaving the latest gainer snapshot unchanged.`);
 process.exit(0);
}

const universe=await discoverUniverse('us');
const gainers=[];
let eligible=0;
let processed=0,missing=0,failed=0;

for(let offset=0;offset<universe.rows.length;offset+=80){
 const rows=universe.rows.slice(offset,offset+80);
 try{
  const quotes=await retry(()=>yahoo.quote(rows.map(row=>row.symbol),{}, {validateResult:false}));
  const quoteBySymbol=new Map(quotes.map(quote=>[quote.symbol,quote]));
  for(const row of rows){
   const quote=quoteBySymbol.get(row.symbol);
   const price=num(quote?.regularMarketPrice);
   const previousClose=num(quote?.regularMarketPreviousClose);
   const timestamp=quote?.regularMarketTime?new Date(quote.regularMarketTime).getTime():NaN;
   if(price===null||price<=0||previousClose===null||previousClose<=0||!Number.isFinite(timestamp)){
    missing++;
    continue;
   }
   eligible++;
   const percent=(price/previousClose-1)*100;
   if(percent>0)gainers.push({symbol:row.symbol,name:quote.longName||quote.shortName||row.name||row.symbol,currency:quote.currency||'USD',price,previousClose,timestamp,percent});
  }
 }catch(error){
  failed+=rows.length;
  console.warn(`Quote batch ${offset+1}-${offset+rows.length} failed after retries: ${String(error).slice(0,180)}`);
 }
 processed+=rows.length;
 if(processed%800===0||processed===universe.rows.length)console.log(`US quotes: ${processed}/${universe.rows.length}; gainers ${gainers.length}; missing ${missing}; failed ${failed}`);
 await sleep(250);
}

if(failed>universe.rows.length*0.25)throw Error(`Yahoo quote outage: ${failed}/${universe.rows.length} symbols failed. Keeping the last published ranking.`);
const updatedAt=Date.now();
const todayGainers=rankTodayGainers(gainers);
const todayCandidates=rankTodayGainers(gainers,30);
const closingConfirmation=scanWindow==='reconcile';
const source=closingConfirmation?'Yahoo Finance · full US exchange-listed universe · regular-session close confirmed after market close':'Yahoo Finance · full US exchange-listed universe';
const result={...previous,todayGainers,todayCandidates,todayScan:{total:universe.rows.length,processed,eligible,missing,failed,status:'complete',source,priceBasis:'regular-session price vs previous regular-session close',...(closingConfirmation?{closingConfirmation:true}:{}),...(scheduledSlot?{scheduledSlot}:{}),updatedAt},todayGainersSource:source,todayGainersUpdatedAt:updatedAt};
const temp=output+'.tmp';
await writeFile(temp,JSON.stringify(result,null,2)+'\n');
await rename(temp,output);
console.log(`Published ${todayGainers.length} daily gainers from ${universe.rows.length} US-listed symbols at ${new Date(updatedAt).toISOString()}.`);
