import assert from 'node:assert/strict';
import {aiStages,aiFlows,stagesFor} from '../lib/ai-supply-chain.ts';
import {businesses,supplyLinks} from '../lib/supply-chain.ts';
assert.equal(new Set(aiStages.map(s=>s.id)).size,aiStages.length);
for(const stage of aiStages){
 assert.ok(stage.source.length>0);
 for(const ticker of stage.companies)assert.ok(businesses[ticker],`Missing company ${ticker}`);
 assert.ok(stage.source.every(s=>new URL(s.url).protocol==='https:'));
}
for(const flow of aiFlows){
 assert.ok(aiStages.some(s=>s.id===flow.from)&&aiStages.some(s=>s.id===flow.to));
 assert.notEqual(flow.from,flow.to);
}
assert.deepEqual(stagesFor('GOOG'),stagesFor('GOOGL'));
assert.deepEqual(stagesFor('UNKNOWN'),[]);
assert.ok(stagesFor('NVDA').some(s=>s.id==='design'));
assert.equal(businesses.VAST.usListed,false);
assert.equal(businesses['000660.KS'].usListed,false);
assert.equal(new Set(supplyLinks.map(e=>e.id)).size,supplyLinks.length);
console.log(`${aiStages.length} stages, ${new Set(aiStages.flatMap(s=>s.companies)).size} companies and ${aiFlows.length} industry flows validated.`);
