import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parseSetEarningsFeed} from '../../lib/set-marketplace-parser.ts';

const root=resolve(import.meta.dirname,'../..');
const path=resolve(root,'data/alpha-earnings-th.json');
const key=process.env.SET_INVESTOR_ALERT_API_KEY?.trim();
if(!key){console.log('SET Investor Alert API key missing; skipping daily Thai E snapshot.');process.exit(0);}
const readJson=async file=>readFile(file,'utf8').then(JSON.parse).catch(()=>null);
const atomic=async value=>{const temporary=`${path}.tmp`;await writeFile(temporary,JSON.stringify(value,null,2)+'\n');await rename(temporary,path);};
await mkdir(resolve(root,'data'),{recursive:true});
const state=await readJson(path)??{version:1,updatedAt:null,symbols:{}};
const response=await fetch('https://marketplace.set.or.th/api/public/news/alert',{headers:{'api-key':key,'Accept':'application/json'},signal:AbortSignal.timeout(20000),cache:'no-store'});
if(!response.ok)throw Error(`SET Investor Alert API HTTP ${response.status}`);
const feed=parseSetEarningsFeed(await response.json());
for(const newsId of feed.deletedIds){
 for(const record of Object.values(state.symbols))record.events=record.events.filter(event=>event.newsId!==newsId);
}
const cutoff=Date.now()-5*365*86400000;
for(const item of feed.events){
 if(item.event.time<cutoff)continue;
 const record=state.symbols[item.symbol]??{events:[]};
 const existing=record.events.findIndex(event=>event.newsId===item.newsId);
 if(existing>=0)record.events[existing]={...item.event,newsId:item.newsId};
 else record.events.push({...item.event,newsId:item.newsId});
 record.events=record.events.filter(event=>event.time>=cutoff).sort((a,b)=>a.time-b.time);
 state.symbols[item.symbol]=record;
}
state.updatedAt=Date.now();
await atomic(state);
console.log(`SET E snapshot synchronized: ${feed.events.length} earnings notices across ${Object.keys(state.symbols).length} issuers; ${feed.deletedIds.length} removals applied.`);
