import {fetchAlphaEarnings} from '@/lib/alpha-earnings';
import {getStoredAlphaEarnings} from '@/lib/alpha-earnings-snapshot';
import {thaiEarningsAnnouncements} from '@/lib/thai-set-earnings';
import {fetchThaiNews} from '@/lib/thai-news';
import {corporateEvents,attachEarningsResults,mergeCorporateEvents,type CorporateEvent} from '@/lib/corporate-events';
import {validSymbol,marketLocale} from '@/lib/market-locale';
import {earningsSchedule} from '@/lib/earnings-calendar';
import YahooFinance from 'yahoo-finance2';
import {companies,type Market,type Point,type Earnings} from '@/lib/market';

type QuotePrice={regularMarketPrice?:unknown;regularMarketPreviousClose?:unknown;regularMarketChange?:unknown;regularMarketChangePercent?:unknown;marketCap?:unknown;currency?:string;regularMarketTime?:unknown;earningsTimestamp?:unknown;exchangeName?:string;longName?:string;shortName?:string;exchangeDataDelayedBy?:unknown;quoteType?:string};
type SummaryDetail={dividendRate?:unknown;trailingAnnualDividendRate?:unknown;marketCap?:unknown;volume?:unknown;averageVolume?:unknown;trailingPE?:unknown;forwardPE?:unknown};
type EarningsHistoryRow={quarter:unknown;epsActual?:unknown;epsEstimate?:unknown};
type EarningsTrendRow={period?:string;endDate?:unknown;earningsEstimate?:{avg?:unknown}};
type CalendarEvents={exDividendDate?:unknown;earnings?:{earningsDate?:unknown[];isEarningsDateEstimate?:boolean}};
type YahooSummary={price?:QuotePrice;summaryDetail?:SummaryDetail;financialData?:{revenueGrowth?:unknown;targetMeanPrice?:unknown;financialCurrency?:string};defaultKeyStatistics?:{forwardPE?:unknown;trailingPE?:unknown};earningsHistory?:{history?:EarningsHistoryRow[]};earningsTrend?:{trend?:EarningsTrendRow[]};calendarEvents?:CalendarEvents;assetProfile?:{sector?:string;longBusinessSummary?:string}};
type ChartResult={meta?:{regularMarketPrice?:unknown;previousClose?:unknown;chartPreviousClose?:unknown;currentTradingPeriod?:{regular?:{start?:number;end?:number}};currency?:string;exchangeTimezoneName?:string;regularMarketTime?:number;regularMarketVolume?:unknown;longName?:string;fullExchangeName?:string};timestamp?:number[];indicators?:{quote?:Array<{close?:unknown[];volume?:unknown[]}>};events?:{dividends?:Record<string,{date?:number;amount?:number}>}};
type YahooNews={relatedTickers?:string[];link?:string;title?:string;publisher?:string;providerPublishTime?:Date|string|number};
type YahooSearch={news?:YahooNews[]};
type NewsItem={headline:string;summary:string;source:string;url:string;datetime:number};
const cache=new Map<string,{expires:number;value:unknown}>();
async function cached<T>(key:string,ttl:number,fn:()=>Promise<T>):Promise<T>{const existing=cache.get(key);if(existing&&existing.expires>Date.now())return existing.value as T;const value=await fn();cache.set(key,{expires:Date.now()+ttl,value});return value;}
const num=(value:unknown):number|null=>typeof value==='number'&&Number.isFinite(value)?value:null;
const stamp=(value:unknown):number|null=>{if(!(typeof value==='string'||typeof value==='number'||value instanceof Date))return null;const time=new Date(value).getTime();return Number.isFinite(time)?time:null};
function period(value:unknown){const time=stamp(value);if(time===null)return 'Quarter unavailable';const date=new Date(time);return `Q${Math.floor(date.getUTCMonth()/3)+1} ’${String(date.getUTCFullYear()).slice(-2)}`}
function dateKey(value:unknown){const time=typeof value==='number'?(value<1e12?value*1000:value):stamp(value);return time!==null?new Date(time).toISOString().slice(0,10):undefined}
function clean(value:string){return value.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim()}
async function excerpt(url:string){try{const parsed=new URL(url);if(parsed.hostname!=='finance.yahoo.com')return '';const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(5000)});if(!response.ok)return '';const html=(await response.text()).slice(0,500000);const tag=html.match(/<meta\b[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*>/i)?.[0];const value=tag?.match(/content=["']([\s\S]*?)["']\s*\/?\s*>/i)?.[1];return value?clean(value).slice(0,420):''}catch{return ''}}

export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const symbol=(params.get('symbol')||'NVDA').toUpperCase();
 const range=params.get('range')||'1D';
 if(!validSymbol(symbol))return Response.json({error:'Invalid symbol'},{status:400});
 const company=companies.find(item=>item.symbol===symbol)||{name:symbol,sector:marketLocale(symbol).thai?'Thailand equity':'US equity',description:'Company description not supplied.'};
 const ranges:Record<string,[string,string]>={'1D':['1d','1m'],'5D':['5d','30m'],'1M':['1mo','1d'],'6M':['6mo','1d'],'YTD':['ytd','1d'],'1Y':['1y','1d'],'5Y':['5y','1wk']};
 const selectedRange=ranges[range];
 if(!selectedRange)return Response.json({error:'Unsupported range'},{status:400});
 const [yahooRange,interval]=selectedRange;
 const thai=marketLocale(symbol).thai;
 const benchmarkSymbol=thai?'^SET.BK':'^GSPC';
 const yahoo=new YahooFinance({suppressNotices:['yahooSurvey','ripHistorical'],fetch:(input,init={})=>{const timeout=AbortSignal.timeout(10000);const signal=init.signal?AbortSignal.any([init.signal,timeout]):timeout;return fetch(input,{...init,signal})}});
 const summaryKey=`${symbol}:summary`;
 const results=await Promise.allSettled([
  cached<ChartResult>(`${symbol}:chart:${range}`,55000,async()=>{
   const response=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${yahooRange}&events=div`,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error('Price feed unavailable');
   const json=await response.json() as {chart?:{result?:ChartResult[]}};
   const result=json.chart?.result?.[0];
   if(!result)throw Error('No chart data');
   return result;
  }),
  cached<YahooSummary>(summaryKey,55000,async()=>await yahoo.quoteSummary(symbol,{modules:['price','summaryDetail','defaultKeyStatistics','financialData','earningsHistory','earningsTrend','assetProfile','calendarEvents']},{validateResult:false}) as YahooSummary),
  cached<NewsItem[]>(`${symbol}:news`,55000,async()=>{
   if(thai)return (await fetchThaiNews(symbol)).slice(0,3);
   const response=await yahoo.search(symbol,{newsCount:6,quotesCount:0},{validateResult:false}) as YahooSearch;
   return Promise.all((response.news??[]).filter((item):item is YahooNews&{relatedTickers:string[];link:string;title:string;publisher:string;providerPublishTime:Date|string|number}=>item.relatedTickers?.includes(symbol)===true&&typeof item.link==='string'&&/^https:\/\//.test(item.link)&&typeof item.title==='string'&&typeof item.publisher==='string'&&item.providerPublishTime!==undefined).slice(0,3).map(async item=>({headline:item.title,summary:await excerpt(item.link),source:item.publisher,url:item.link,datetime:(stamp(item.providerPublishTime)||0)/1000})));
  }),
  cached<YahooSummary>(`benchmark:${benchmarkSymbol}`,3600000,async()=>await yahoo.quoteSummary(benchmarkSymbol,{modules:['summaryDetail','defaultKeyStatistics']},{validateResult:false}) as YahooSummary),
  cached<QuotePrice>(`${symbol}:events-quote`,55000,async()=>await yahoo.quote(symbol) as QuotePrice),
  thai?thaiEarningsAnnouncements(symbol):Promise.resolve(null),
  thai?Promise.resolve(null):process.env.VERCEL==='1'?Promise.resolve(getStoredAlphaEarnings(symbol)):fetchAlphaEarnings(symbol,process.env.ALPHA_VANTAGE_API_KEY)
 ]);
 const summaryResult=results[1].status==='fulfilled'?results[1].value:null;
 if(results[1].status==='rejected')console.error('Summary fetch:',String(results[1].reason));
 const chart=results[0].status==='fulfilled'?results[0].value:null;
 const summary=summaryResult as YahooSummary|null;
 const news=results[2].status==='fulfilled'?results[2].value:[];
 const priceInfo=summary?.price,detail=summary?.summaryDetail,financial=summary?.financialData,meta=chart?.meta;
 const price=num(meta?.regularMarketPrice)??num(priceInfo?.regularMarketPrice);
 if(price===null)return Response.json({error:'Yahoo Finance is temporarily unavailable. Please try again.'},{status:503});
 const previous=num(priceInfo?.regularMarketPreviousClose)??num(meta?.previousClose)??num(meta?.chartPreviousClose);
 const history=summary?.earningsHistory?.history??[];
 const numericHistory=history.map(item=>({quarter:item.quarter,epsActual:num(item.epsActual)??undefined,epsEstimate:num(item.epsEstimate)??undefined}));
 const alphaHistory=results[6].status==='fulfilled'?results[6].value:null;
 const alphaEvents=alphaHistory?.events??[];
 const earnings:Earnings[]=history.slice(-4).map(item=>{
  const fiscalQuarterEnd=dateKey(item.quarter);
  const event=alphaEvents.find((candidate:CorporateEvent)=>candidate.kind==='E'&&candidate.fiscalQuarterEnd===fiscalQuarterEnd);
  return {period:period(item.quarter),fiscalQuarterEnd,actual:num(event?.epsActual)??num(item.epsActual),estimate:num(event?.epsEstimate)??num(item.epsEstimate)};
 });
 const next=summary?.earningsTrend?.trend?.find(item=>item.period==='0q');
 if(next)earnings.push({period:period(next.endDate),actual:null,estimate:num(next.earningsEstimate?.avg),...earningsSchedule(summary?.calendarEvents?.earnings,new Date(),'Asia/Bangkok')});
 const quote=chart?.indicators?.quote?.[0];
 const points:Point[]=(chart?.timestamp??[]).map((time,index)=>({time:time*1000,price:num(quote?.close?.[index]),volume:num(quote?.volume?.[index])??0})).filter((point):point is Point=>point.price!==null);
 const warnings:string[]=[];
 if(!summary)warnings.push('Valuation, targets, and earnings are temporarily unavailable from Yahoo Finance.');
 if(!news.length)warnings.push('No recent news returned.');
 if(!chart)warnings.push('Historical chart unavailable.');
 const benchmark=results[3].status==='fulfilled'?results[3].value:null;
 const eventsQuote=results[4].status==='fulfilled'?results[4].value:null;
 const thaiEvents=results[5].status==='fulfilled'?results[5].value:null;
 const data:Market={
  symbol,
  eventHistory:{provider:thai?'SET announcements + SCBX history + Yahoo':'Alpha Vantage + Yahoo',earnings:thai?(thaiEvents?.status??'unavailable'):(alphaHistory?.earnings??'unavailable'),dividends:chart?'available':'unavailable'},
  events:attachEarningsResults(mergeCorporateEvents(marketLocale(symbol).timeZone,alphaHistory?.events??[],thaiEvents?.events??[],corporateEvents(chart?.events?.dividends,summary?.calendarEvents,eventsQuote)),numericHistory),
  dividendRate:num(detail?.dividendRate)??num(detail?.trailingAnnualDividendRate),
  dividendBasis:num(detail?.dividendRate)!==null?'indicated annual':'trailing annual',
  dividendUpdatedAt:Date.now(),previousClose:previous,
  session:typeof meta?.currentTradingPeriod?.regular?.start==='number'&&typeof meta.currentTradingPeriod.regular.end==='number'?{start:meta.currentTradingPeriod.regular.start*1000,end:meta.currentTradingPeriod.regular.end*1000}:undefined,
  marketCap:num(priceInfo?.marketCap)??num(detail?.marketCap),salesGrowth:num(financial?.revenueGrowth),
  benchmark:{name:thai?'SET':'S&P 500',pe:num(benchmark?.summaryDetail?.trailingPE),forwardPe:num(benchmark?.summaryDetail?.forwardPE)??num(benchmark?.defaultKeyStatistics?.forwardPE),source:`https://finance.yahoo.com/quote/${encodeURIComponent(benchmarkSymbol)}/`},
  currency:meta?.currency||priceInfo?.currency||marketLocale(symbol).currency,
  timeZone:meta?.exchangeTimezoneName||marketLocale(symbol).timeZone,
  earningsCurrency:financial?.financialCurrency||meta?.currency||marketLocale(symbol).currency,
  name:priceInfo?.longName||priceInfo?.shortName||meta?.longName||company.name,
  sector:summary?.assetProfile?.sector||company.sector,
  description:summary?.assetProfile?.longBusinessSummary?.split(/(?<=\.)\s+/).slice(0,2).join(' ')||company.description,
  price,change:previous!==null?price-previous:num(priceInfo?.regularMarketChange),
  percent:previous?((price/previous)-1)*100:(num(priceInfo?.regularMarketChangePercent)===null?null:(num(priceInfo?.regularMarketChangePercent) as number)*100),
  timestamp:meta?.regularMarketTime?meta.regularMarketTime*1000:stamp(priceInfo?.regularMarketTime),mode:'connected',
  exchange:priceInfo?.exchangeName||meta?.fullExchangeName||marketLocale(symbol).market,
  pe:num(detail?.trailingPE),forwardPe:num(detail?.forwardPE)??num(summary?.defaultKeyStatistics?.forwardPE),
  target:num(financial?.targetMeanPrice),targetDate:null,volume:num(meta?.regularMarketVolume)??num(detail?.volume),averageVolume:num(detail?.averageVolume),
  points,earnings,news,warnings,delayMinutes:num(priceInfo?.exchangeDataDelayedBy),retrievedAt:Date.now()
 };
 return Response.json(data,{headers:{'Cache-Control':'private, max-age=30'}});
}
