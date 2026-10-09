import {validSymbol,marketLocale} from '@/lib/market-locale';
import {companies} from '@/lib/market';
type YahooChart={chart?:{result?:Array<{meta?:{currency?:string;regularMarketTime?:number;regularMarketPrice?:number;previousClose?:number};indicators?:{quote?:Array<{close?:unknown[]}>}}>}};
type Snapshot={currency?:string;timestamp?:number;price:number|null;percent:number|null;points:number[]};
const cache=new Map<string,{until:number;data:Snapshot}>();
export async function GET(request:Request){
 const symbols=(new URL(request.url).searchParams.get('symbols')||companies.map(company=>company.symbol).join(',')).split(',').filter(symbol=>validSymbol(symbol)).slice(0,24);
 const entries=await Promise.all(symbols.map(async symbol=>{
  const existing=cache.get(symbol);
  if(existing&&existing.until>Date.now())return [symbol,existing.data] as const;
  try{
   const response=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=30m`,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error();
   const json=await response.json() as YahooChart;
   const chart=json.chart?.result?.[0];
   if(!chart?.meta)throw Error();
   const meta=chart.meta;
   const price=typeof meta.regularMarketPrice==='number'?meta.regularMarketPrice:null;
   const previous=typeof meta.previousClose==='number'?meta.previousClose:null;
   const points=(chart.indicators?.quote?.[0]?.close??[]).filter((value):value is number=>typeof value==='number');
   const data:Snapshot={currency:meta.currency||marketLocale(symbol).currency,timestamp:meta.regularMarketTime?meta.regularMarketTime*1000:undefined,price,percent:price!==null&&previous?((price/previous)-1)*100:null,points};
   cache.set(symbol,{until:Date.now()+10000,data});
   return [symbol,data] as const;
  }catch{return [symbol,{price:null,percent:null,points:[]}] as const}
 }));
 return Response.json(Object.fromEntries(entries),{headers:{'Cache-Control':'private, no-store'}});
}
