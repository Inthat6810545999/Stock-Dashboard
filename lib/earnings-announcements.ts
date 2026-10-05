import {scbEarningsHistory} from './scb-earnings-history';
import type {CorporateEvent} from './corporate-events';

// Official release publication dates, never fiscal quarter-end dates.
export function releaseEvent(date:string,sourceUrl:string):CorporateEvent|null {
 const time=Date.parse(`${date}T12:00:00+07:00`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(time)||new Date(time+7*3600000).toISOString().slice(0,10)!==date)return null;
 return {kind:'E',time,label:'Earnings announcement',estimated:false,dateOnly:true,sourceUrl,source:'SCBX investor news'};
}
let cache:{expires:number;events:CorporateEvent[]}|undefined;
export async function earningsAnnouncements(symbol:string):Promise<CorporateEvent[]> {
 if(symbol!=='SCB.BK')return [];
 if(cache&&cache.expires>Date.now())return cache.events;
 const releases=new Map(scbEarningsHistory.map(r=>[r.sourceUrl,r.date]));
 try {
  const response=await fetch('https://www.scbx.com/en/news/',{signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw Error('SCBX news unavailable');
  const html=await response.text();const urls=new Set<string>();
  for(const match of html.matchAll(/<a\b[^>]*href="(https:\/\/www\.scbx\.com\/en\/news\/[^"?#]+\/)"[^>]*>([\s\S]*?)<\/a>/gi)){
   const title=match[2].replace(/<[^>]*>/g,' ');
   if(/(?:announc|reports?).*(?:net |quarter.*)profit/i.test(title)&&!releases.has(match[1]))urls.add(match[1]);
  }
  await Promise.all([...urls].slice(0,8).map(async url=>{
   try {const r=await fetch(url,{signal:AbortSignal.timeout(4000)});if(!r.ok)return;
    const page=await r.text();const date=page.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/);if(date)releases.set(url,date[1]);
   }catch{/* Keep verified historical coverage if the source is unavailable. */}
  }));
 }catch{/* Verified release history remains available during provider outages. */}
 const events=[...releases].map(([url,date]):CorporateEvent|null=>{const event=releaseEvent(date,url);return event?{...event,fiscalQuarterEnd:scbEarningsHistory.find(r=>r.sourceUrl===url)?.fiscalQuarterEnd}:null;}).filter((e):e is CorporateEvent=>e!==null);
 cache={expires:Date.now()+3600000,events};return events;
}
