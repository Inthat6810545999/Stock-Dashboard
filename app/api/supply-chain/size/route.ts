import YahooFinance from 'yahoo-finance2';
import {businesses} from '@/lib/supply-chain';
import type {CompanySize} from '@/lib/company-size';
const yahoo=new YahooFinance({suppressNotices:['yahooSurvey'],fetch:(input,init={})=>fetch(input,{...init,signal:AbortSignal.timeout(10000)})});
const cache=new Map<string,{expires:number;value:CompanySize[]}>();
const pending=new Map<string,Promise<CompanySize[]>>();
async function sizes(symbols:string[]):Promise<CompanySize[]>{
 const empty=symbols.map(symbol=>({symbol,marketCapUsd:null,quoteAt:null}));
 try{
  const quotes=await yahoo.quote(symbols,{fields:['symbol','marketCap','currency','regularMarketTime']});
  const currencies=[...new Set(quotes.map(q=>q.currency).filter((c):c is string=>!!c&&c!=='USD'))];
  const fx=currencies.length?await yahoo.quote(currencies.map(c=>`${c}USD=X`),{fields:['symbol','regularMarketPrice']}):[];
  return symbols.map(symbol=>{const q=quotes.find(q=>q.symbol===symbol);const rate=q?.currency==='USD'?1:fx.find(f=>f.symbol===`${q?.currency}USD=X`)?.regularMarketPrice;const cap=q?.marketCap;return {symbol,marketCapUsd:typeof cap==='number'&&cap>0&&typeof rate==='number'&&rate>0?cap*rate:null,quoteAt:q?.regularMarketTime instanceof Date?q.regularMarketTime.toISOString():null}});
 }catch{return empty}
}
export async function GET(request:Request){
 const requested=[...new Set((new URL(request.url).searchParams.get('symbols')||'').split(',').filter(Boolean))].sort();
 if(!requested.length||requested.length>12||requested.some(s=>!businesses[s]||businesses[s].listingKind==='private'))return Response.json({error:'Choose up to 12 known public companies'},{status:400});
 const key=requested.join(',');const cached=cache.get(key);let value=cached&&cached.expires>Date.now()?cached.value:null;
 if(!value){let task=pending.get(key);if(!task){task=sizes(requested);pending.set(key,task)}try{value=await task;const valid=value.some(v=>v.marketCapUsd!==null);if(cache.size>200)cache.clear();cache.set(key,{expires:Date.now()+(valid?3600000:60000),value})}finally{pending.delete(key)}}
 return Response.json({sizes:value,source:'Yahoo Finance',comparisonCurrency:'USD',retrievedAt:new Date().toISOString()},{headers:{'Cache-Control':'public, max-age=60, s-maxage=3600'}});
}
