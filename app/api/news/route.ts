import {fetchThaiNews} from '@/lib/thai-news';
import {validSymbol,marketLocale} from '@/lib/market-locale';
import YahooFinance from 'yahoo-finance2';
type Item={headline:string;source:string;url:string;datetime:number;summary:string};
type YahooNews={relatedTickers?:string[];link?:string;title?:string;publisher?:string;providerPublishTime?:Date|string|number};
type SearchResponse={news?:YahooNews[]};
const cache=new Map<string,{expires:number;items:Item[]}>();
async function description(url:string){try{if(new URL(url).hostname!=='finance.yahoo.com')return '';const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(4000)});if(!r.ok)return '';const html=(await r.text()).slice(0,500000);const tag=html.match(/<meta\b[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*>/i)?.[0];return (tag?.match(/content=["']([\s\S]*?)["']\s*\/?\s*>/i)?.[1]||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").slice(0,450)}catch{return ''}}
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const symbol=(params.get('symbol')||'NVDA').toUpperCase();
 const offset=Number(params.get('offset')||0);
 if(!validSymbol(symbol)||!Number.isInteger(offset)||offset<0||offset>100)return Response.json({error:'Invalid request'},{status:400});
 try{
  let saved=cache.get(symbol);
  if(!saved||saved.expires<Date.now()){
   const yahoo=new YahooFinance({suppressNotices:['yahooSurvey']});
   const thai=marketLocale(symbol).thai;
   const result=thai?{news:[] as YahooNews[]}:await yahoo.search(symbol,{newsCount:100,quotesCount:0},{validateResult:false}) as SearchResponse;
   const seen=new Set<string>();
   const items:Item[]=thai?await fetchThaiNews(symbol):(result.news??[])
    .filter((item):item is YahooNews&{link:string;title:string;publisher:string;providerPublishTime:Date|string|number}=>typeof item.link==='string'&&item.link.startsWith('https://')&&typeof item.title==='string'&&typeof item.publisher==='string'&&item.providerPublishTime!==undefined&&item.relatedTickers?.includes(symbol)===true&&!seen.has(item.link)&&Boolean(seen.add(item.link)))
    .map(item=>({headline:item.title,source:item.publisher,url:item.link,datetime:new Date(item.providerPublishTime).getTime()/1000,summary:''}))
    .sort((a,b)=>b.datetime-a.datetime);
   saved={expires:Date.now()+55000,items};
   if(cache.size>40){const oldest=cache.keys().next().value;if(oldest)cache.delete(oldest)}
   cache.set(symbol,saved);
  }
  const batch=saved.items.slice(offset,offset+6);
  const items=await Promise.all(batch.map(async item=>({...item,summary:item.summary||await description(item.url)})));
  for(const item of items){const existing=saved.items.find(value=>value.url===item.url);if(existing)existing.summary=item.summary}
  return Response.json({items,nextOffset:offset+batch.length<saved.items.length?offset+batch.length:null,total:saved.items.length,checkedAt:Date.now(),mode:marketLocale(symbol).thai?'aggregated':'provider'},{headers:{'Cache-Control':'private, max-age=30'}});
 }catch{return Response.json({error:'News is temporarily unavailable. Please try again.'},{status:503})}
}
