export const sources={us:['https://www.nasdaqtrader.com/dynamic/symdir/nasdaqlisted.txt','https://www.nasdaqtrader.com/dynamic/symdir/otherlisted.txt']};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function getText(url){let lastError;for(let attempt=0;attempt<3;attempt++){let response;try{response=await fetch(url,{signal:AbortSignal.timeout(30000)})}catch(error){lastError=error}if(response?.ok)return response.text();if(response){lastError=Error(`Directory HTTP ${response.status}`);if(response.status!==429&&response.status<500)throw lastError;await response.body?.cancel().catch(()=>{})}if(attempt<2){const wait=1500*2**attempt;console.warn(`Directory fetch failed (${attempt+1}/3); retrying in ${wait}ms: ${String(lastError).slice(0,180)}`);await delay(wait)}}throw lastError instanceof Error?lastError:Error('Directory fetch failed')}
export function parseNasdaq(text,other=false){const lines=text.trim().split(/\r?\n/);const headers=lines.shift().split('|');if(!headers.includes('ETF')||!text.includes('File Creation Time:'))throw Error('Incomplete Nasdaq directory');return lines.filter(s=>!s.startsWith('File Creation Time:')).map(line=>Object.fromEntries(line.split('|').map((v,i)=>[headers[i],v]))).filter(r=>r['Test Issue']==='N'&&r.ETF==='N'&&r.NextShares!=='Y').filter(r=>!/(?:warrants?|rights|preferred|depositary shares|debentures|notes|bonds|ETF|ETN|exchange.traded|closed.end|\bfund\b|\bunits\b)/i.test(r['Security Name'])).map(r=>({symbol:(other?r['ACT Symbol']:r.Symbol).replaceAll('.','-'),name:r['Security Name'],exchange:other?r.Exchange:'NASDAQ'})).filter(r=>/^[A-Z0-9][A-Z0-9-]{0,14}$/.test(r.symbol));}
export async function discoverUniverse(market){
 if(market!=='us')throw Error('Only US market scans are supported');
 const rows=(await Promise.all(sources.us.map(getText))).flatMap((text,i)=>parseNasdaq(text,i===1));
 const unique=[...new Map(rows.map(r=>[r.symbol,r])).values()].sort((a,b)=>a.symbol.localeCompare(b.symbol));
 if(unique.length<3000)throw Error(`Directory unexpectedly short: ${unique.length}`);
 return {rows:unique,sources:sources.us,retrievedAt:Date.now()};
}
