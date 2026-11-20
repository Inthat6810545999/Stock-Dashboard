import {readFile,writeFile,rename} from 'node:fs/promises';

export const sources={us:['https://www.nasdaqtrader.com/dynamic/symdir/nasdaqlisted.txt','https://www.nasdaqtrader.com/dynamic/symdir/otherlisted.txt'],th:['https://market.sec.or.th/public/idisc/th/company/listed/']};
const thaiCacheUrl=new URL('../../data/market-universe-th.json',import.meta.url);
const thaiCacheMaxAge=30*24*60*60*1000;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function getText(url){let lastError;for(let attempt=0;attempt<3;attempt++){let response;try{response=await fetch(url,{signal:AbortSignal.timeout(30000)})}catch(error){lastError=error}if(response?.ok)return response.text();if(response){lastError=Object.assign(Error(`Directory HTTP ${response.status}`),{status:response.status,url});if(response.status!==429&&response.status<500)throw lastError;await response.body?.cancel().catch(()=>{})}if(attempt<2){const wait=1500*2**attempt;console.warn(`Directory fetch failed (${attempt+1}/3); retrying in ${wait}ms: ${String(lastError).slice(0,180)}`);await delay(wait)}}throw lastError instanceof Error?lastError:Error('Directory fetch failed')}
export function isThaiDirectoryForbidden(error){return error?.status===403&&typeof error?.url==='string'&&error.url.startsWith('https://market.sec.or.th/public/idisc/')}
export function parseNasdaq(text,other=false){const lines=text.trim().split(/\r?\n/);const headers=lines.shift().split('|');if(!headers.includes('ETF')||!text.includes('File Creation Time:'))throw Error('Incomplete Nasdaq directory');return lines.filter(s=>!s.startsWith('File Creation Time:')).map(line=>Object.fromEntries(line.split('|').map((v,i)=>[headers[i],v]))).filter(r=>r['Test Issue']==='N'&&r.ETF==='N'&&r.NextShares!=='Y').filter(r=>!/(?:warrants?|rights|preferred|depositary shares|debentures|notes|bonds|ETF|ETN|exchange.traded|closed.end|\bfund\b|\bunits\b)/i.test(r['Security Name'])).map(r=>({symbol:(other?r['ACT Symbol']:r.Symbol).replaceAll('.','-'),name:r['Security Name'],exchange:other?r.Exchange:'NASDAQ'})).filter(r=>/^[A-Z0-9][A-Z0-9-]{0,14}$/.test(r.symbol));}
export function thaiPages(html){return [...new Set([...html.matchAll(/href="(\/public\/idisc\/th\/company\/listed\/[A-Z0-9])"/g)].map(m=>'https://market.sec.or.th'+m[1]))]}
export function parseThai(html){return [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap(m=>{const row=m[1];const symbol=row.match(/companyprofile\/listed\/([^"/]+)"/)?.[1];const exchange=row.match(/Sector\/(SET|mai)-/)?.[1];return symbol&&exchange&&/^[A-Z0-9][A-Z0-9&.-]*$/.test(symbol)?[{symbol:symbol+'.BK',name:symbol,exchange}]:[]})}
export function validThaiUniverseCache(cache,now=Date.now()){
 if(!cache||!Number.isFinite(cache.retrievedAt)||cache.retrievedAt>now||now-cache.retrievedAt>thaiCacheMaxAge||!Array.isArray(cache.rows)||cache.rows.length<600)return false;
 if(!Array.isArray(cache.sources)||cache.sources[0]!==sources.th[0])return false;
 const symbols=new Set();
 for(const row of cache.rows){
  if(!row||typeof row.symbol!=='string'||!/^[A-Z0-9][A-Z0-9&.-]*\.BK$/.test(row.symbol)||typeof row.name!=='string'||!['SET','mai'].includes(row.exchange)||symbols.has(row.symbol))return false;
  symbols.add(row.symbol);
 }
 return true;
}
async function loadThaiUniverseCache(){
 const cache=JSON.parse(await readFile(thaiCacheUrl,'utf8'));
 if(!validThaiUniverseCache(cache))throw Error('Thai directory cache is missing, invalid or older than 30 days');
 console.warn(`::warning::Thai SEC directory returned HTTP 403; using the verified ${cache.rows.length}-symbol directory from ${new Date(cache.retrievedAt).toISOString()}.`);
 return {...cache,fallback:true};
}
async function cacheThaiUniverse(universe){
 const temp=new URL('../../data/market-universe-th.json.tmp',import.meta.url);
 await writeFile(temp,JSON.stringify(universe,null,2)+'\n');
 await rename(temp,thaiCacheUrl);
}
export async function discoverUniverse(market){
 let rows;
 if(market==='us')rows=(await Promise.all(sources.us.map(getText))).flatMap((text,i)=>parseNasdaq(text,i===1));
 else{
  try{
   const first=await getText(sources.th[0]);
   const pages=thaiPages(first);
   if(pages.length<26)throw Error('Incomplete SEC directory navigation');
   rows=[];
   for(const page of pages){
    const pageRows=parseThai(await getText(page));
    if(!pageRows.length)throw Error(`Empty SEC directory section ${page}`);
    rows.push(...pageRows);
   }
  }catch(error){
   if(!isThaiDirectoryForbidden(error))throw error;
   return loadThaiUniverseCache().catch(()=>{throw error});
  }
 }
 const unique=[...new Map(rows.map(r=>[r.symbol,r])).values()].sort((a,b)=>a.symbol.localeCompare(b.symbol));
 if(unique.length<(market==='us'?3000:600))throw Error(`Directory unexpectedly short: ${unique.length}`);
 const universe={rows:unique,sources:sources[market],retrievedAt:Date.now()};
 if(market==='th')await cacheThaiUniverse(universe);
 return universe;
}
