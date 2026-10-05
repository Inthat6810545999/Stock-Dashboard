import type {CorporateEvent} from './corporate-events';

export type HistoryStatus = 'available' | 'empty' | 'unavailable' | 'not-configured' | 'rate-limited' | 'stale';
export type EventHistory = {events:CorporateEvent[];earnings:HistoryStatus;dividends:HistoryStatus};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:undefined;
// Date-only values retain their published calendar date in the Bangkok UI.
function date(value:unknown):number|null {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const time=Date.parse(`${value}T12:00:00Z`);
 return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===value?time:null;
}
export function eventProviderSymbol(symbol:string):string {
 if(!/^[A-Z0-9][A-Z0-9.-]{0,19}$/.test(symbol))throw Error('Invalid symbol');
 return symbol.endsWith('.BK')?symbol:`${symbol.replaceAll('.','-')}.US`;
}
export function parseEarningsHistory(payload:unknown):CorporateEvent[]{
 if(!object(payload)||'error' in payload||'message' in payload)throw Error('Invalid earnings response');
 const events:CorporateEvent[]=[];
 for(const row of Object.values(payload)){
  if(!object(row))throw Error('Invalid earnings row');
  const time=date(row.reportDate);
  // A fiscal period alone does not establish an announcement date.
  if(time===null)continue;
  events.push({kind:'E',time,dateOnly:true,estimated:time>Date.now(),label:'Earnings announcement',
   fiscalQuarterEnd:date(row.date)!==null?String(row.date):undefined,
   epsActual:number(row.epsActual),epsEstimate:number(row.epsEstimate),source:'EODHD',
   sourceUrl:'https://eodhd.com/financial-apis/stock-etfs-fundamental-data-feeds'});
 }
 if(Object.keys(payload).length&&!events.length)throw Error('No valid announcement dates');
 return events.sort((a,b)=>a.time-b.time);
}
export function parseDividendHistory(payload:unknown):CorporateEvent[]{
 if(!Array.isArray(payload))throw Error('Invalid dividends response');
 const events:CorporateEvent[]=[];
 for(const row of payload){
  if(!object(row))throw Error('Invalid dividend row');
  const time=date(row.date);if(time===null)continue;
  events.push({kind:'D',time,dateOnly:true,label:'Ex-dividend date',amount:number(row.value),
   currency:typeof row.currency==='string'&&/^[A-Z]{3}$/.test(row.currency)?row.currency:undefined,
   source:'EODHD',sourceUrl:'https://eodhd.com/financial-apis/api-splits-dividends'});
 }
 if(payload.length&&!events.length)throw Error('No valid ex-dividend dates');
 return events.sort((a,b)=>a.time-b.time);
}

/** Server-side only. Never return/log the token or upstream request URL. */
export function createEventHistoryProvider(fetcher:typeof fetch=fetch,now=Date.now){
 const cache=new Map<string,{expires:number;value:EventHistory}>();
 const pending=new Map<string,Promise<EventHistory>>();
 let currentToken:string|undefined;
 return async (symbol:string,token?:string):Promise<EventHistory>=>{
  const ticker=eventProviderSymbol(symbol);
  if(!token?.trim())return {events:[],earnings:'not-configured',dividends:'not-configured'};
  if(currentToken!==token){cache.clear();pending.clear();currentToken=token;}
  const existing=cache.get(ticker);if(existing&&existing.expires>now())return existing.value;
  const underway=pending.get(ticker);if(underway)return underway;
  const task=(async()=>{
   const request=async(path:string,filter?:string)=>{
    const url=new URL(`https://eodhd.com/api/${path}/${encodeURIComponent(ticker)}`);
    url.searchParams.set('api_token',token);url.searchParams.set('fmt','json');
    if(filter)url.searchParams.set('filter',filter);
    const response=await fetcher(url,{signal:AbortSignal.timeout(8000),cache:'no-store',redirect:'error'});
    if(!response.ok)throw Error('Event history unavailable');
    return response.json() as Promise<unknown>;
   };
   const [e,d]=await Promise.allSettled([
    request('v1.1/fundamentals','Earnings::History').then(parseEarningsHistory),
    request('div').then(parseDividendHistory)
   ]);
   const status=(result:PromiseSettledResult<CorporateEvent[]>):HistoryStatus=>result.status==='rejected'?'unavailable':result.value.length?'available':'empty';
   const value:EventHistory={events:[...(e.status==='fulfilled'?e.value:[]),...(d.status==='fulfilled'?d.value:[])],earnings:status(e),dividends:status(d)};
   // Cache across timeframe switches and coalesce concurrent requests; retry failures after five minutes.
   if(currentToken===token){
    if(cache.size>=200)cache.delete(cache.keys().next().value!);
    cache.set(ticker,{expires:now()+(e.status==='rejected'||d.status==='rejected'?300000:3600000),value});
   }
   return value;
  })();
  pending.set(ticker,task);
  try{return await task;}finally{if(pending.get(ticker)===task)pending.delete(ticker);}
 };
}
export const fetchEventHistory=createEventHistoryProvider();
