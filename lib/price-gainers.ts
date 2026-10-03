export type PriceGainer={symbol:string;name:string;currency:string;price:number;timestamp:number;startPrice:number;startTime:number;endTime:number;percent:number};
export function annualPriceReturn(points:{time:number;price:number}[],now=Date.now()){
 const valid=points.filter(p=>Number.isFinite(p.time)&&Number.isFinite(p.price)&&p.price>0&&p.time<=now).sort((a,b)=>a.time-b.time);
 const last=valid.at(-1);if(!last||now-last.time>7*86400000)return null;
 const anniversary=new Date(last.time);const month=anniversary.getUTCMonth();anniversary.setUTCFullYear(anniversary.getUTCFullYear()-1);if(anniversary.getUTCMonth()!==month)anniversary.setUTCDate(0);
 anniversary.setUTCHours(23,59,59,999);const target=anniversary.getTime();const first=valid.filter(p=>p.time<=target).at(-1);
 if(!first||target-first.time>7*86400000)return null;
 return {startPrice:first.price,startTime:first.time,endTime:last.time,price:last.price,percent:(last.price/first.price-1)*100};
}
export function rankPriceGainers(rows:PriceGainer[]){return rows.filter(r=>Number.isFinite(r.percent)&&r.percent>0).sort((a,b)=>b.percent-a.percent||a.symbol.localeCompare(b.symbol)).slice(0,10)}
