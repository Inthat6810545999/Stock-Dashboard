import {annualPriceReturn,rankPriceGainers} from '../../lib/price-gainers.ts';
export async function scanPriceGainers(state,{save,progress,sleep}){
 state.priceOutcomes??={};for(const [symbol,o] of Object.entries(state.priceOutcomes))if(o.kind==='failed')delete state.priceOutcomes[symbol];
 const now=Date.now();const start=new Date(now);start.setUTCFullYear(start.getUTCFullYear()-1);start.setUTCDate(start.getUTCDate()-14);
 const pending=state.universe.rows.filter(r=>!state.priceOutcomes[r.symbol]);
 for(let i=0;i<pending.length;i+=6){await Promise.all(pending.slice(i,i+6).map(async stock=>{
  for(let attempt=0;attempt<3;attempt++){try{
   const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stock.symbol)}?interval=1d&period1=${Math.floor(+start/1000)}&period2=${Math.floor(now/1000)}`;
   const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(20000)});
   if(response.status===404){state.priceOutcomes[stock.symbol]={kind:'missing',reason:'No chart coverage'};return}if(!response.ok)throw Error(`HTTP ${response.status}`);
   const d=(await response.json()).chart?.result?.[0];if(!d){state.priceOutcomes[stock.symbol]={kind:'missing',reason:'No price history'};return}
   if(d.meta?.instrumentType!=='EQUITY'){state.priceOutcomes[stock.symbol]={kind:'excluded',reason:'Not an equity'};return}
   const prices=d.indicators?.quote?.[0]?.close||[];const points=(d.timestamp||[]).map((t,j)=>({time:t*1000,price:prices[j]}));const result=annualPriceReturn(points,now);
   if(!result){state.priceOutcomes[stock.symbol]={kind:'missing',reason:'Full year or recent price unavailable'};return}
   state.priceOutcomes[stock.symbol]={kind:'eligible',row:{symbol:stock.symbol,name:d.meta.longName||d.meta.shortName||stock.name,currency:d.meta.currency||(state.market==='th'?'THB':'USD'),timestamp:result.endTime,...result}};return;
  }catch{if(attempt===2){state.priceOutcomes[stock.symbol]={kind:'failed',reason:'History request failed'};return}await sleep(1000*2**attempt)}}
 }));if(i%60===0||i+6>=pending.length){await save();await progress();console.log(`${state.market}: annual prices ${Object.keys(state.priceOutcomes).length}/${state.universe.rows.length}`)}await sleep(150)}
}
export function priceSnapshot(state){const outcomes=Object.values(state.priceOutcomes||{}),rows=outcomes.filter(o=>o.kind==='eligible').map(o=>o.row);return {priceGainers:rankPriceGainers(rows),priceScan:{total:state.universe.rows.length,processed:outcomes.length,eligible:rows.length,excluded:outcomes.filter(o=>o.kind==='excluded').length,missing:outcomes.filter(o=>o.kind==='missing').length,failed:outcomes.filter(o=>o.kind==='failed').length,status:outcomes.length===state.universe.rows.length?'complete':'scanning'}}}
