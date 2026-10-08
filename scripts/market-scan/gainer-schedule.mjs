import {getUsScanWindow} from '../../lib/us-market-session.ts';
import {getThaiScanWindow} from '../../lib/th-market-session.ts';

/** Retries may start late. Publish once per target slot, not once per trigger. */
export function getDueGainerSlot(market,now=new Date()){
 const window=market==='us'?getUsScanWindow(now):getThaiScanWindow(now);
 if(window==='closed')return null;
 const timeZone=market==='us'?'America/New_York':'Asia/Bangkok';
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const part=type=>parts.find(item=>item.type===type)?.value??'';
 const minute=Number(part('hour'))*60+Number(part('minute'));
 if(window==='closing'&&minute<(market==='us'?965:1025))return null;
 if(market==='th'&&minute>=870&&minute<875)return null;
 const slots=market==='us'?[575,605,665,725,785,845,905,965,975]:[605,665,725,875,905,965,1025];
 const slot=slots.filter(value=>value<=minute).at(-1);
 if(slot===undefined)return null;
 return `${part('year')}-${part('month')}-${part('day')}T${String(Math.floor(slot/60)).padStart(2,'0')}:${String(slot%60).padStart(2,'0')}[${timeZone}]`;
}
