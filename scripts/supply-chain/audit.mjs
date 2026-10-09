import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {businesses,supplyLinks} from '../../lib/supply-chain.ts';
import {aiStages} from '../../lib/ai-supply-chain.ts';
const catalog=JSON.parse(await readFile(new URL('../../data/supply-chain-catalog.json',import.meta.url),'utf8'));
const urls=[...new Set([...supplyLinks.map(l=>l.source),...aiStages.flatMap(s=>s.source.map(r=>r.url))])];
const results=[];
for(let i=0;i<urls.length;i+=4){results.push(...await Promise.all(urls.slice(i,i+4).map(async url=>{try{const response=await fetch(url,{signal:AbortSignal.timeout(12000)});await response.body?.cancel();return {url,status:response.status,reachable:response.ok,semanticReview:'Required: URL availability does not verify the claim or a current contract.'}}catch(e){return {url,reachable:false,error:e.name,semanticReview:'Required'}}})));}
const symbols=new Set(catalog.companies.map(c=>c.symbol));
const report={checkedAt:new Date().toISOString(),directoryEntries:symbols.size,curatedCompanies:Object.keys(businesses).length,curatedUSMissingFromDirectory:Object.values(businesses).filter(c=>c.usListed&&!symbols.has(c.symbol)).map(c=>({symbol:c.symbol,name:c.name})),outsideUS:Object.values(businesses).filter(c=>!c.usListed),disclosedLinks:supplyLinks.length,industryLayers:aiStages.length,sources:results,limitations:['No claim that all company relationships have been verified.','Private company coverage is selective; a worldwide complete register is not available here.','Historical disclosures do not establish ongoing contracts.','Source reachability is not content verification.']};
await mkdir(new URL('../../docs/audits/',import.meta.url),{recursive:true});
await writeFile(new URL('../../docs/audits/supply-chain-sources.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({directoryEntries:report.directoryEntries,curatedCompanies:report.curatedCompanies,missing:report.curatedUSMissingFromDirectory,sources:results.length,unreachable:results.filter(r=>!r.reachable).length}));
