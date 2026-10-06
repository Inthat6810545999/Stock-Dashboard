import snapshot from '@/data/alpha-earnings-us.json';
import type {CorporateEvent} from './corporate-events';
import type {AlphaHistory} from './alpha-earnings';

type StoredEarnings={updatedAt:number;events:CorporateEvent[]};
const stored=snapshot as {symbols:Record<string,StoredEarnings>};
const maxAge=600*86400000;

/** Snapshot data is committed by the daily GitHub Action and bundled at deploy time. */
export function getStoredAlphaEarnings(symbol:string,now=Date.now()):AlphaHistory{
 const entry=stored.symbols[symbol];
 if(!entry)return {events:[],earnings:'unavailable'};
 const events=Array.isArray(entry.events)?entry.events:[];
 const age=now-entry.updatedAt;
 return {events,earnings:!events.length?'empty':age>maxAge?'stale':'available'};
}
