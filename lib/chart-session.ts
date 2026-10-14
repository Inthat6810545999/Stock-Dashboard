import type {Point} from './market';
export type Session={start:number;end:number};
// Derive a regular-session fallback from the plotted trading date, including US DST.
// Prefer provider boundaries to preserve shortened trading days.
export function chartSession(points:Point[],symbol:string,provided?:Session):Session|null{
 const last=points.at(-1);if(!last)return provided||null;
 if(provided&&provided.end>provided.start&&last.time>=provided.start&&last.time<=provided.end)return provided;
 const thai=symbol.endsWith('.BK'),zone=thai?'Asia/Bangkok':'America/New_York';
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(last.time).map(p=>[p.type,p.value]));
 const midnight=Date.UTC(+parts.year,+parts.month-1,+parts.day);const localAsUtc=midnight+(+parts.hour*3600 + +parts.minute*60 + +parts.second)*1000;const offset=localAsUtc-Math.floor(last.time/1000)*1000;
 const start=midnight-offset+(thai?10:9.5)*3600000;return {start,end:start+6.5*3600000};
}
export function chartFraction(time:number,session:Session){return Math.max(0,Math.min(1,(time-session.start)/(session.end-session.start)))}
