import type {CorporateEvent} from './corporate-events';
export function isEarningsAnnouncementHeadline(value:string){return /(?:financial\s+performance.{0,80}\bF45\b|\bF45\b|operating\s+results|results\s+of\s+operations|earnings\s+results)/i.test(value);}
function publishedTime(value:unknown):number|null{
 if(typeof value!=='string'&&typeof value!=='number')return null;
 const time=typeof value==='number'?(value<1e12?value*1000:value):Date.parse(value);
 return Number.isFinite(time)?time:null;
}
function resultLink(value:unknown):string|undefined{
 if(typeof value!=='string')return undefined;
 try{const url=new URL(value,'https://www.set.or.th');return url.protocol==='https:'&&url.hostname==='www.set.or.th'?url.toString():undefined;}catch{return undefined;}
}
export function parseThaiSetEarnings(payload:unknown,symbol:string):CorporateEvent[]{
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Invalid SET response');
 const root=payload as Record<string,unknown>;
 if(!Array.isArray(root.news_info_list))throw Error('Invalid SET response');
 const events:CorporateEvent[]=[];
 for(const item of root.news_info_list){
  if(!item||typeof item!=='object'||Array.isArray(item))continue;
  const row=item as Record<string,unknown>;
  if(typeof row.symbol!=='string'||row.symbol.toUpperCase()!==symbol)continue;
  const headline=typeof row.headline==='string'?row.headline:'';
  if(!isEarningsAnnouncementHeadline(headline))continue;
  const time=publishedTime(row.news_datetime);if(time===null)continue;
  events.push({kind:'E',time,dateOnly:true,label:'Earnings announcement',estimated:false,source:'SET company announcements',sourceUrl:resultLink(row.url)});
 }
 const unique=new Map<string,CorporateEvent>();
 for(const event of events){const key=new Date(event.time).toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'});if(!unique.has(key))unique.set(key,event);}
 return [...unique.values()].sort((a,b)=>a.time-b.time);
}

function decode(value:string){return value.replace(/<[^>]*>/g,' ').replace(/&amp;amp;/g,'&').replace(/&amp;/g,'&').replace(/&#0*39;|&apos;/gi,"'").replace(/&quot;/gi,'"').replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim();}
function irDate(value:string){const parsed=Date.parse(`${value.trim()} 12:00:00 GMT`);return Number.isFinite(parsed)?parsed:null;}
/** Parse official Thai issuer IR archive cards/list rows, keeping only result announcement titles. */
export function parseThaiIrEarnings(html:string,archiveUrl:string):CorporateEvent[]{
 const events:CorporateEvent[]=[];
 const anchors=html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi)??[];
 for(const anchor of anchors){
  const ptt=anchor.includes('card--news');
  const dateText=ptt?anchor.match(/class=["'][^"']*card__date[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]:anchor.match(/class=["'][^"']*ir_newsDate[^"']*["'][^>]*>([\s\S]*?)<\/li>/i)?.[1];
  const titleText=ptt?anchor.match(/class=["'][^"']*card__detail[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]:anchor.match(/class=["'][^"']*ir_newsTitle[^"']*["'][^>]*>([\s\S]*?)<\/li>/i)?.[1];
  if(!dateText||!titleText)continue;
  const headline=decode(titleText),time=irDate(decode(dateText));
  if(!isEarningsAnnouncementHeadline(headline)||time===null)continue;
  events.push({kind:'E',time,dateOnly:true,label:'Earnings announcement',estimated:false,source:'Company investor relations',sourceUrl:archiveUrl});
 }
 const unique=new Map<string,CorporateEvent>();for(const event of events){const key=new Date(event.time).toISOString().slice(0,10);if(!unique.has(key))unique.set(key,event);}
 return [...unique.values()].sort((a,b)=>a.time-b.time);
}
