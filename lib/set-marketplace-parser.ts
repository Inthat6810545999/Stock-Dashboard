import type {CorporateEvent} from './corporate-events';

export type SetEarningsRow={symbol:string;newsId:string;event:CorporateEvent};
export type SetEarningsFeed={events:SetEarningsRow[];deletedIds:string[]};
const earningsCodes=new Set(['24','66','A9','51','52','53']);
const newsUrl='https://www.set.or.th/en/market/news-and-alert/news?type=8';

function templateCode(row:Record<string,unknown>){
 const values=Array.isArray(row.templateCodes)?row.templateCodes:[];
 return values.map(value=>{
  if(typeof value==='string'||typeof value==='number')return String(value);
  if(value&&typeof value==='object'){
   const item=value as Record<string,unknown>;
   return String(item.templateCode??item.templateCodes??item.code??'');
  }
  return '';
 });
}
function newsSymbols(row:Record<string,unknown>){
 const values=Array.isArray(row.symbol)?row.symbol:[];
 return [...new Set(values.map(value=>{
  if(typeof value==='string')return value.toUpperCase();
  if(value&&typeof value==='object')return String((value as Record<string,unknown>).symbol??'').toUpperCase();
  return '';
 }).filter(symbol=>/^[A-Z0-9&.-]{1,20}$/.test(symbol)))];
}
function announcementDate(value:unknown){
 if(typeof value!=='string'&&typeof value!=='number')return null;
 const time=typeof value==='number'?(value<1e12?value*1000:value):Date.parse(value);
 return Number.isFinite(time)?time:null;
}

/** Parse SET's official all-market Investor Alert feed, keeping result-report codes only. */
export function parseSetEarningsFeed(payload:unknown):SetEarningsFeed{
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Invalid SET marketplace payload');
 const root=payload as Record<string,unknown>;
 if(!Array.isArray(root.news)||!Array.isArray(root.deletedNews))throw Error('Invalid SET marketplace feed');
 const events:SetEarningsRow[]=[];
 for(const value of root.news){
  if(!value||typeof value!=='object'||Array.isArray(value))continue;
  const row=value as Record<string,unknown>;
  if(row.marketId&& !['SET','MAI'].includes(String(row.marketId).toUpperCase()))continue;
  if(!templateCode(row).some(code=>earningsCodes.has(code)))continue;
  const time=announcementDate(row.publishDate),newsId=String(row.newsId??'');
  if(time===null||!newsId)continue;
  for(const symbol of newsSymbols(row))events.push({symbol,newsId,event:{
   kind:'E',time,dateOnly:true,label:'Earnings announcement',estimated:false,
   source:'SET investor alert',sourceUrl:newsUrl,
  }});
 }
 const deletedIds=root.deletedNews.flatMap(value=>value&&typeof value==='object'&&'newsId' in value?[String((value as Record<string,unknown>).newsId)]:[]).filter(Boolean);
 const unique=new Map<string,SetEarningsRow>();
 for(const row of events)unique.set(`${row.symbol}:${row.newsId}`,row);
 return {events:[...unique.values()],deletedIds:[...new Set(deletedIds)]};
}
