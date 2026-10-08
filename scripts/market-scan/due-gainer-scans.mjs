import {readFile,appendFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {getDueGainerSlot} from './gainer-schedule.mjs';

const root=resolve(import.meta.dirname,'../..');
const now=new Date();
for(const market of ['us','th']){
 const slot=getDueGainerSlot(market,now);
 const snapshot=JSON.parse(await readFile(resolve(root,`data/must-watch-${market}.json`),'utf8'));
 const due=slot!==null&&snapshot.todayScan?.scheduledSlot!==slot;
 console.log(`${market}: ${due?'scan due':slot?'already published':'market closed or no slot due'}${slot?` (${slot})`:''}`);
 if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,`${market}=${due}\n`);
}
