export type CorporateEvent={kind:'E'|'D';time:number;amount?:number;currency?:string;estimated?:boolean;label:string;dateOnly?:boolean;source?:string;sourceUrl?:string;fiscalQuarterEnd?:string;epsActual?:number;epsEstimate?:number};
const timestamp=(value:unknown)=>{if(value==null)return null;const n=value instanceof Date?value.getTime():typeof value==='number'?(value<1e12?value*1000:value):typeof value==='string'?new Date(value).getTime():NaN;return Number.isFinite(n)?n:null};
/** Quarter-end dates are not earnings announcement dates. Only use dated calendar/quote events. */
export function corporateEvents(dividends:Record<string,{date?:number;amount?:number}>|undefined,calendar:any,quote:any):CorporateEvent[]{
 const events:CorporateEvent[]=[];
 for(const div of Object.values(dividends??{})){const time=timestamp(div.date);if(time!==null)events.push({kind:'D',time,amount:Number.isFinite(div.amount)?div.amount:undefined,label:'Ex-dividend date'});}
 const ex=timestamp(calendar?.exDividendDate);if(ex!==null&&!events.some(e=>e.kind==='D'&&Math.abs(e.time-ex)<86400000))events.push({kind:'D',time:ex,label:'Ex-dividend date'});
 const dates=calendar?.earnings?.earningsDate??[];
 const reportDates=[...dates,quote?.earningsTimestamp];
 for(const value of reportDates){const time=timestamp(value);if(time!==null&&!events.some(e=>e.kind==='E'&&Math.abs(e.time-time)<86400000))events.push({kind:'E',time,estimated:calendar?.earnings?.isEarningsDateEstimate!==false,label:dates.length>1?'Earnings announcement window':'Earnings announcement'});}
 return events.sort((a,b)=>a.time-b.time);
}

export function earningsOutcome(event:CorporateEvent):'beat'|'not-beat'|'unknown'{
 return event.kind==='E'&&Number.isFinite(event.epsActual)&&Number.isFinite(event.epsEstimate)?event.epsActual!>event.epsEstimate!?'beat':'not-beat':'unknown';
}
export function attachEarningsResults(events:CorporateEvent[],history:{quarter:unknown;epsActual?:number;epsEstimate?:number}[]):CorporateEvent[]{
 return events.map(event=>{
  if(event.kind!=='E'||!event.fiscalQuarterEnd||Number.isFinite(event.epsActual)||Number.isFinite(event.epsEstimate))return event;
  const row=history.find(row=>{const t=timestamp(row.quarter);return t!==null&&new Date(t).toISOString().slice(0,10)===event.fiscalQuarterEnd});
  return row?{...event,epsActual:typeof row.epsActual==='number'?row.epsActual:undefined,epsEstimate:typeof row.epsEstimate==='number'?row.epsEstimate:undefined}:event;
 });
}

/** Earlier sources win conflicts. Merge only the same event kind on its market calendar day. */
export function mergeCorporateEvents(timeZone:string,...sources:CorporateEvent[][]):CorporateEvent[]{
 const events=new Map<string,CorporateEvent>();
 for(const event of sources.flat()){
  if(!Number.isFinite(event.time))continue;
  const day=event.dateOnly?new Date(event.time).toISOString().slice(0,10):new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(event.time);
  const key=`${event.kind}:${day}`;
  if(!events.has(key))events.set(key,event);
 }
 return [...events.values()].sort((a,b)=>a.time-b.time);
}
