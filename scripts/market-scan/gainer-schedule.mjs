import {getUsScanWindow} from '../../lib/us-market-session.ts';
import {getThaiScanWindow} from '../../lib/th-market-session.ts';

/** GitHub's five-minute triggers can run late. Publish once per target slot. */
export function getDueGainerSlot(market,now=new Date()){
 const window=market==='us'?getUsScanWindow(now):getThaiScanWindow(now);
 if(window==='closed')return null;
 const timeZone=market==='us'?'America/New_York':'Asia/Bangkok';
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const part=type=>parts.find(item=>item.type===type)?.value??'';
 const minute=Number(part('hour'))*60+Number(part('minute'));
 let slot;
 if(window==='regular'){
  const first=market==='us'?575:minute<750?605:875;
  if(minute<first)return null;
  slot=Math.floor(minute/5)*5;
 }else if(market==='us'){
  // Keep the post-close reconciliation at 16:15 New York time.
  slot=window==='reconcile'?975:minute>=965?965:undefined;
 }else{
  // SET's final snapshot waits until the provider has settled the close.
  slot=minute>=1035?1035:minute>=1025?1025:undefined;
 }
 if(slot===undefined)return null;
 return `${part('year')}-${part('month')}-${part('day')}T${String(Math.floor(slot/60)).padStart(2,'0')}:${String(slot%60).padStart(2,'0')}[${timeZone}]`;
}
