export type CorporateEvent={kind:'E'|'D';time:number;amount?:number;estimated?:boolean;label:string};
const timestamp=(value:unknown)=>{if(value==null)return null;const n=value instanceof Date?value.getTime():typeof value==='number'?(value<1e12?value*1000:value):typeof value==='string'?new Date(value).getTime():NaN;return Number.isFinite(n)?n:null};
/** Quarter-end dates are not earnings announcement dates. Only use dated calendar/quote events. */
export function corporateEvents(dividends:Record<string,{date?:number;amount?:number}>|undefined,calendar:any,quote:any):CorporateEvent[]{
 const events:CorporateEvent[]=[];
 for(const div of Object.values(dividends??{})){const time=timestamp(div.date);if(time!==null)events.push({kind:'D',time,amount:Number.isFinite(div.amount)?div.amount:undefined,label:'Ex-dividend date'});}
 const ex=timestamp(calendar?.exDividendDate);if(ex!==null&&!events.some(e=>e.kind==='D'&&Math.abs(e.time-ex)<86400000))events.push({kind:'D',time:ex,label:'Ex-dividend date'});
 const dates=calendar?.earnings?.earningsDate??[];
 const reportDates=dates.length?dates:[quote?.earningsTimestamp];
 for(const value of reportDates){const time=timestamp(value);if(time!==null)events.push({kind:'E',time,estimated:calendar?.earnings?.isEarningsDateEstimate!==false,label:dates.length>1?'Earnings announcement window':'Earnings announcement'});}
 return events.sort((a,b)=>a.time-b.time);
}
