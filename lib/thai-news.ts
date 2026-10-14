export type NewsItem={headline:string;source:string;url:string;datetime:number;summary:string};
const decode=(s:string)=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return code>0&&code<=0x10ffff?String.fromCodePoint(code):''}).replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const plain=(s:string)=>decode(s).replace(/<[^>]*>/g,'').trim();
export function thaiNewsSearchUrl(symbol:string,rss=false){const ticker=symbol.replace(/\.BK$/i,'');return `https://news.google.com/${rss?'rss/search':'search'}?q=${encodeURIComponent('"'+ticker+'" (หุ้น OR บริษัท OR ตลาดหลักทรัพย์) when:30d')}&hl=th&gl=TH&ceid=TH:th`;}
/** Bounded RSS extraction. Never render feed HTML or execute embedded markup. */
export function parseThaiNews(xml:string,symbol:string):NewsItem[]{
 const ticker=symbol.replace(/\.BK$/i,'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const exact=new RegExp(`(^|[^A-Z0-9])${ticker}([^A-Z0-9]|$)`,'i');
 const seen=new Set<string>(),items:NewsItem[]=[];
 for(const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)){
  const item=match[1];const tag=(name:string)=>item.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'))?.[1]??'';
  const source=plain(tag('source'))||'Google News';if(/facebook|youtube|tiktok|instagram/i.test(source))continue;const title=plain(tag('title'));const headline=title.endsWith(' - '+source)?title.slice(0,-source.length-3):title;
  const url=decode(tag('link')).trim(),date=Date.parse(plain(tag('pubDate')));
  if(!headline||!exact.test(headline)||!Number.isFinite(date)||date>Date.now()+300000)continue;
  try{const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.hostname!=='news.google.com')continue;}catch{continue;}
  const key=headline.toLowerCase();if(seen.has(key))continue;seen.add(key);
  items.push({headline,source,url,datetime:date/1000,summary:''});
 }
 return items.sort((a,b)=>b.datetime-a.datetime).slice(0,100);
}
const cache=new Map<string,{until:number;items:NewsItem[]}>();
export async function fetchThaiNews(symbol:string):Promise<NewsItem[]>{
 const old=cache.get(symbol);if(old&&old.until>Date.now())return old.items;
 const response=await fetch(thaiNewsSearchUrl(symbol,true),{signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Thai news feed unavailable');
 const xml=await response.text();if(!xml.includes('<rss'))throw Error('Invalid news feed');
 const items=parseThaiNews(xml.slice(0,2000000),symbol);
 if(cache.size>100)cache.delete(cache.keys().next().value!);cache.set(symbol,{until:Date.now()+55000,items});return items;
}
