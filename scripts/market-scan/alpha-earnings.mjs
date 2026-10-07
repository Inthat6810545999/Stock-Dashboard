import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {discoverUniverse} from './universe.mjs';
import {parseAlphaEarnings} from '../../lib/alpha-earnings.ts';

const root=resolve(import.meta.dirname,'../..');
const path=resolve(root,'data/alpha-earnings-us.json');
const key=process.env.ALPHA_VANTAGE_API_KEY?.trim();
if(!key){console.log('Alpha Vantage key missing; skipping daily E snapshot.');process.exit(0);}

const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const atomic=async(value)=>{const temporary=`${path}.tmp`;await writeFile(temporary,JSON.stringify(value,null,2)+'\n');await rename(temporary,path);};
const readJson=async file=>readFile(file,'utf8').then(JSON.parse).catch(()=>null);
await mkdir(resolve(root,'data'),{recursive:true});
const state=await readJson(path)??{version:1,updatedAt:null,cursor:null,symbols:{}};
const universe=await discoverUniverse('us');
const symbols=universe.rows.map(row=>row.symbol);
const fixed=['NVDA','AAPL','MSFT','TSLA'].filter(symbol=>symbols.includes(symbol));
const previousIndex=state.cursor?symbols.indexOf(state.cursor):-1;
const rotating=[];
for(let offset=1;offset<=symbols.length&&rotating.length<16;offset++){
 const symbol=symbols[(Math.max(previousIndex, -1)+offset)%symbols.length];
 if(!fixed.includes(symbol))rotating.push(symbol);
}
const selected=[...fixed,...rotating].slice(0,20);
let completed=0;
for(const symbol of selected){
 try{
  const url=new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function','EARNINGS');url.searchParams.set('symbol',symbol);url.searchParams.set('apikey',key);
  const response=await fetch(url,{signal:AbortSignal.timeout(15000),cache:'no-store'});
  if(!response.ok)throw Error(`HTTP ${response.status}`);
  const payload=await response.json();
  if(payload?.Note||payload?.Information)throw Error('Provider quota or access limit reached');
  const fetched=parseAlphaEarnings(payload,symbol);
  const cutoff=Date.now()-5*365*86400000;
  const events=fetched.filter(event=>event.time>=cutoff);
  state.symbols[symbol]={updatedAt:Date.now(),events};
  state.cursor=symbol;state.updatedAt=Date.now();completed++;
  console.log(`${symbol}: stored ${events.length} E events`);
  await atomic(state);
 }catch(error){
  const message=String(error);
  console.warn(`${symbol}: Alpha Vantage fetch failed (${message.slice(0,140)})`);
  if(/quota|limit|HTTP 429/i.test(message))break;
  state.cursor=symbol;state.updatedAt=Date.now();await atomic(state);
 }
 // Keep request pacing gentle; the daily collector uses at most 20 of the 25 free calls.
 await pause(12000);
}
console.log(`Alpha Vantage E snapshot updated: ${completed}/${selected.length} tickers; ${Object.keys(state.symbols).length} tickers retained.`);
