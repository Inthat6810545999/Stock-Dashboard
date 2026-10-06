import {scbEarningsHistory} from './scb-earnings-history';
import {parseThaiSetEarnings,parseThaiIrEarnings} from './thai-set-event-parser';
import type {CorporateEvent} from './corporate-events';
export type ThaiEarnings={events:CorporateEvent[];status:'available'|'empty'|'unavailable'};
const day=86400000;
const scbEvents=()=>scbEarningsHistory.map(row=>({kind:'E' as const,time:Date.parse(`${row.date}T12:00:00+07:00`),label:'Earnings announcement',estimated:false,dateOnly:true,sourceUrl:row.sourceUrl,source:'SCBX investor news',fiscalQuarterEnd:row.fiscalQuarterEnd})).filter(event=>Number.isFinite(event.time));

async function companyIrHistory(symbol:string,now:number,fetcher:typeof fetch):Promise<CorporateEvent[]>{
 const code=symbol.slice(0,-3),startYear=new Date(now-1825*day).getUTCFullYear(),endYear=new Date(now).getUTCFullYear();
 const ptt=code==='PTT';const events:CorporateEvent[]=[];
 for(let year=endYear;year>=startYear;year--){
  let next:string|undefined=ptt?`https://investor.pttplc.com/en/newsroom/set-announcements?year=${year}&page=1`:`https://${code.toLowerCase()}.listedcompany.com/newsroom_set.html/year/${year}`;
  for(let page=0;next&&page<6;page++){
   const pageUrl:string=next;const parsed=new URL(pageUrl);
   if(parsed.protocol!=='https:'||!(parsed.hostname==='investor.pttplc.com'||parsed.hostname===`${code.toLowerCase()}.listedcompany.com`))break;
   let response:Response;try{response=await fetcher(pageUrl,{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'},signal:AbortSignal.timeout(7000),cache:'no-store'});}catch{break;}
   if(!response.ok||new URL(response.url||pageUrl).hostname!==parsed.hostname)break;
   const html=await response.text();events.push(...parseThaiIrEarnings(html,pageUrl));
   if(ptt){const pages:URL[]=[...html.matchAll(/href=["']([^"']*[?&]year=\d{4}&amp;page=\d+)["']/gi)].map(m=>m[1].replace(/&amp;/g,'&')).map((href:string)=>new URL(href,pageUrl)).filter((candidate:URL)=>candidate.hostname==='investor.pttplc.com');const following:URL|undefined=pages.find((candidate:URL)=>Number(candidate.searchParams.get('page'))===page+2);if(following)following.protocol='https:';next=following?.toString();}
   else {const nextHref=html.match(/href=["']([^"']*\/skip\/\d+)["'][^>]*>\s*Next Page/i)?.[1];if(nextHref){const candidate=new URL(nextHref,pageUrl);if(candidate.hostname===`${code.toLowerCase()}.listedcompany.com`)candidate.protocol='https:';next=candidate.toString();}else next=undefined;}
  }
 }
 return events.filter(event=>event.time>=now-1825*day).sort((a,b)=>a.time-b.time);
}

const calls=new Map<string,{expires:number;value:ThaiEarnings}>();
const pending=new Map<string,Promise<ThaiEarnings>>();
function formatThaiDate(date:Date){return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric'}).format(date);}
export async function thaiEarningsAnnouncements(symbol:string,fetcher:typeof fetch=fetch):Promise<ThaiEarnings>{
 if(!/^[A-Z0-9-]{1,15}\.BK$/.test(symbol))return {events:[],status:'empty'};
 const existing=calls.get(symbol);if(existing&&existing.expires>Date.now())return existing.value;
 const underway=pending.get(symbol);if(underway)return underway;
 const task=(async()=>{
  const now=Date.now(),from=formatThaiDate(new Date(now-1825*day)),to=formatThaiDate(new Date(now));
  const url=new URL('https://www.set.or.th/api/set/news/search');
  url.searchParams.set('sourceId','company');url.searchParams.set('lang','en');url.searchParams.set('symbol',symbol.slice(0,-3));url.searchParams.set('fromDate',from);url.searchParams.set('toDate',to);url.searchParams.set('keyword','Financial Performance');
  let events:CorporateEvent[]=[];
  try{
   const response=await fetcher(url,{headers:{'Accept':'application/json','Accept-Language':'en','Referer':'https://www.set.or.th/en/market/news-and-alert/news?type=8','User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(10000),cache:'no-store'});
   if(!response.ok||new URL(response.url||url).hostname!=='www.set.or.th')throw Error('SET announcements unavailable');
   events=parseThaiSetEarnings(await response.json(),symbol.slice(0,-3));
   if(!events.length)events=await companyIrHistory(symbol,now,fetcher);
   if(symbol==='SCB.BK')events=[...scbEvents(),...events];
   const unique=new Map<string,CorporateEvent>();for(const event of events){const key=new Date(event.time).toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'});if(!unique.has(key))unique.set(key,event);}
   const value:ThaiEarnings={events:[...unique.values()].sort((a,b)=>a.time-b.time),status:events.length?'available':'empty'};
   calls.set(symbol,{expires:now+(value.status==='available'?3600000:300000),value});return value;
  }catch{
   let fallback:CorporateEvent[]=[];try{fallback=await companyIrHistory(symbol,now,fetcher);}catch{/* Keep verified company releases as the final fallback. */}if(symbol==='SCB.BK')fallback=[...scbEvents(),...fallback];
   const value:ThaiEarnings={events:fallback,status:fallback.length?'available':'unavailable'};
   calls.set(symbol,{expires:now+300000,value});return value;
  }
 })();pending.set(symbol,task);try{return await task;}finally{pending.delete(symbol);}
}

export {parseThaiSetEarnings} from './thai-set-event-parser';
