import {getUsScanWindow} from '../../lib/us-market-session.ts';

/** Retries may start late. Publish once per target US slot, not once per trigger. */
export function getDueGainerSlot(market,now=new Date()){
 if(market!=='us')return null;
 const window=getUsScanWindow(now);
 if(window==='closed')return null;
 const timeZone='America/New_York';
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const part=type=>parts.find(item=>item.type===type)?.value??'';
 const minute=Number(part('hour'))*60+Number(part('minute'));
 if(window==='closing'&&minute<965)return null;
 const slots=[575,605,665,725,785,845,905,965,975];
 const slot=slots.filter(value=>value<=minute).at(-1);
 if(slot===undefined)return null;
 return `${part('year')}-${part('month')}-${part('day')}T${String(Math.floor(slot/60)).padStart(2,'0')}:${String(slot%60).padStart(2,'0')}[${timeZone}]`;
}
