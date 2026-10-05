import {mkdir,readFile,writeFile,rename,open,unlink,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import type {CorporateEvent} from './corporate-events';
export type AlphaHistory={events:CorporateEvent[];earnings:'available'|'empty'|'not-configured'|'unavailable'|'rate-limited'|'stale'};
const day=86400000;
const numeric=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:typeof v==='string'&&v.trim()!==''&&Number.isFinite(Number(v))?Number(v):undefined;
function date(v:unknown){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return null;const t=Date.parse(`${v}T12:00:00Z`);return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v?t:null;}
export function parseAlphaEarnings(payload:any,symbol:string):CorporateEvent[]{
 if(payload?.symbol!==symbol||!Array.isArray(payload.quarterlyEarnings))throw Error('Invalid earnings response');
 const events:CorporateEvent[]=[];
 for(const row of payload.quarterlyEarnings){
  const time=date(row?.reportedDate);if(time===null)continue;
  events.push({kind:'E',time,dateOnly:true,label:'Earnings announcement',source:'Alpha Vantage',sourceUrl:'https://www.alphavantage.co/documentation/#earnings',fiscalQuarterEnd:date(row.fiscalDateEnding)!==null?row.fiscalDateEnding:undefined,epsActual:numeric(row.reportedEPS),epsEstimate:numeric(row.estimatedEPS)});
 }
 if(payload.quarterlyEarnings.length&&!events.length)throw Error('No valid announcement dates');
 return events.sort((a,b)=>a.time-b.time);
}
type State={calls:number[];blockedUntil:number;entries:Record<string,{updated:number;retryAfter:number;events:CorporateEvent[]}>};
/** Disk cache survives local restarts. A shared directory is required for a multi-instance deployment. */
export function createAlphaEarnings({directory,fetcher=fetch,now=Date.now}:{directory:string;fetcher?:typeof fetch;now?:()=>number}){
 const pending=new Map<string,Promise<AlphaHistory>>();
 return async function get(symbol:string,key?:string):Promise<AlphaHistory>{
  if(!/^[A-Z0-9][A-Z0-9.-]{0,19}$/.test(symbol)||symbol.endsWith('.BK'))return {events:[],earnings:'unavailable'};
  if(!key?.trim())return {events:[],earnings:'not-configured'};
  const id=createHash('sha256').update(key).digest('hex').slice(0,24),requestId=`${id}:${symbol}`;
  const underway=pending.get(requestId);if(underway)return underway;
  const task=(async():Promise<AlphaHistory>=>{
   const file=join(directory,`${id}.json`),lock=`${file}.lock`;
   let acquired=false;
   try{
    await mkdir(directory,{recursive:true});
    try{const info=await stat(lock);if(now()-info.mtimeMs>60000)await unlink(lock);}catch{}
    const handle=await open(lock,'wx');acquired=true;await handle.close();
    let state:State={calls:[],blockedUntil:0,entries:{}};
    try{state=JSON.parse(await readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    const save=async()=>{const temp=`${file}.tmp`;await writeFile(temp,JSON.stringify(state),{mode:0o600});await rename(temp,file);};
    const t=now(),entry=state.entries[symbol];
    const fallback=(status:'unavailable'|'rate-limited'):AlphaHistory=>({events:entry?.events??[],earnings:entry?.events.length?'stale':status});
    if(entry&&t-entry.updated<day)return {events:entry.events,earnings:entry.events.length?'available':'empty'};
    if(entry&&entry.retryAfter>t)return fallback('unavailable');
    state.calls=state.calls.filter(call=>call>t-day);
    if(state.blockedUntil>t||state.calls.length>=25)return fallback('rate-limited');
    // Reserve before network I/O; rejected/timed-out attempts count against the allowance too.
    state.calls.push(t);await save();
    try{
     const url=new URL('https://www.alphavantage.co/query');url.searchParams.set('function','EARNINGS');url.searchParams.set('symbol',symbol);url.searchParams.set('apikey',key!);
     const response=await fetcher(url,{signal:AbortSignal.timeout(8000),cache:'no-store',redirect:'error'});
     if(!response.ok){if(response.status===429)state.blockedUntil=t+day;throw Error('Earnings unavailable');}
     const payload=await response.json();
     if(payload?.Note||payload?.Information){state.blockedUntil=t+day;throw Error('Provider limit or entitlement');}
     const events=parseAlphaEarnings(payload,symbol);
     state.entries[symbol]={updated:t,retryAfter:0,events};await save();return {events,earnings:events.length?'available':'empty'};
    }catch{
     state.entries[symbol]={updated:entry?.updated??0,retryAfter:t+3600000,events:entry?.events??[]};await save();return fallback(state.blockedUntil>t?'rate-limited':'unavailable');
    }
   }catch{return {events:[],earnings:'unavailable'};}
   finally{if(acquired)await unlink(lock).catch(()=>{});}
  })();
  pending.set(requestId,task);try{return await task;}finally{pending.delete(requestId);}
 };
}
export const fetchAlphaEarnings=createAlphaEarnings({directory:process.env.EARNINGS_CACHE_DIR||join(process.env.VERCEL?tmpdir():process.cwd(),'.cache','earnings')});
