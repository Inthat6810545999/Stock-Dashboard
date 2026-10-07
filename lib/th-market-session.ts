export type ThaiScanWindow='regular'|'closing'|'closed';

/** Thailand time has no daylight-saving changes. The hourly workflow runs at :05 ICT. */
export function getThaiScanWindow(date=new Date()):ThaiScanWindow{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const part=(type:string)=>parts.find(item=>item.type===type)?.value;
 if(!['Mon','Tue','Wed','Thu','Fri'].includes(part('weekday')??''))return 'closed';
 const minute=Number(part('hour'))*60+Number(part('minute'));
 if((minute>=600&&minute<750)||(minute>=870&&minute<990))return 'regular';
 if(minute>=1020&&minute<1080)return 'closing';
 return 'closed';
}

/** Require same-session market data during the day and a same-day final quote at close. */
export function isThaiQuoteUsable(window:ThaiScanWindow,marketState:string|undefined,timestamp:number|null,now=new Date()):boolean{
 if(window==='closed'||timestamp===null||!Number.isFinite(timestamp))return false;
 if(window==='regular')return marketState==='REGULAR';
 if(marketState==='REGULAR')return false;
 const date=(value:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
 return date(new Date(timestamp))===date(now);
}
