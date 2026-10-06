import snapshot from '@/data/alpha-earnings-th.json';
import type {CorporateEvent} from './corporate-events';
import type {ThaiEarnings} from './thai-set-earnings';

type StoredEvent=CorporateEvent&{newsId?:string};
const stored=snapshot as {updatedAt:number|null;symbols:Record<string,{events:StoredEvent[]}>};
const staleAfter=3*86400000;

/** Snapshot of SET investor alerts accumulated by the daily repository workflow. */
export function getStoredThaiEarnings(symbol:string,now=Date.now()):ThaiEarnings{
 if(!stored.updatedAt)return {events:[],status:'unavailable'};
 const entry=stored.symbols[symbol];
 const events=(entry?.events??[]).map(({newsId:_,...event})=>event);
 const stale=now-stored.updatedAt>staleAfter;
 return {events,status:stale?'stale':events.length?'available':'empty'};
}
