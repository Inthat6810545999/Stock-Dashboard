import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const source=await readFile(new URL('../lib/company-ecosystem.ts',import.meta.url),'utf8');
const compiled=stripTypeScriptTypes(source).replaceAll("'./supply-chain'",JSON.stringify(new URL('../lib/supply-chain.ts',import.meta.url).href)).replaceAll("'./ai-supply-chain'",JSON.stringify(new URL('../lib/ai-supply-chain.ts',import.meta.url).href));
const {ecosystemFor,evidenceDatesFor}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const ai=ecosystemFor('NVDA','NVIDIA',true);assert.equal(ai.kind,'industry');assert.equal(ai.stages.length,29);
const apple=ecosystemFor('AAPL','Apple');assert.equal(apple.kind,'company');assert(apple.stages.some(s=>s.companies.includes('GLW')));assert(apple.flows.some(f=>f.to==='company'));
const unknown=ecosystemFor('ZZZZ','Unknown');assert.equal(unknown.stages.length,1);assert.equal(unknown.flows.length,0);assert.equal(unknown.stages[0].companies.length,0);
for(const symbol of ['AAPL','TSLA','WMT','F','NVDA','ZZZZ']){const e=ecosystemFor(symbol,symbol);const ids=new Set(e.stages.map(s=>s.id));for(const f of e.flows){assert(ids.has(f.from));assert(ids.has(f.to))}assert(e.tour.every(id=>ids.has(id)));}
console.log('PASS: issuer-specific sources, AI preservation, valid graph edges and unknown issuer without invented relationships');

const rivian=ecosystemFor('RIVN','Rivian');assert(rivian.stages.some(s=>s.companies.includes('AMZN')));
const starbucks=ecosystemFor('SBUX','Starbucks');assert(starbucks.stages.some(s=>s.companies.includes('NESN.SW')));
assert.equal(ecosystemFor('TSLA','Tesla').flows.length,0);assert(ecosystemFor('TSLA','Tesla',false,false).flows.length>0);

assert.equal(evidenceDatesFor('AAPL').latestPublication,'2026-03-26');
assert.equal(evidenceDatesFor('SBUX').latestPublication,'2026-09-14');
assert.equal(evidenceDatesFor('RIVN').latestPublication,null);
assert.equal(evidenceDatesFor('RIVN').lastReviewed,'2026-10-10');
assert.equal(evidenceDatesFor('ZZZZ').latestPublication,null);

assert.equal(ecosystemFor('ZZZZ','Unknown',true).kind,'industry');
