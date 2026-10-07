export type TodayGainer={symbol:string;name:string;currency:string;price:number;previousClose:number;timestamp:number;percent:number};

export function rankTodayGainers(rows:TodayGainer[],limit=10){
 return rows.filter(row=>Number.isFinite(row.price)&&row.price>0&&Number.isFinite(row.previousClose)&&row.previousClose>0&&Number.isFinite(row.timestamp)&&Number.isFinite(row.percent)&&row.percent>0)
  .sort((a,b)=>b.percent-a.percent||a.symbol.localeCompare(b.symbol)).slice(0,limit);
}
