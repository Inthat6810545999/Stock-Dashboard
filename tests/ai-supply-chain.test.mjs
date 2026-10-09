import assert from 'node:assert/strict';
import {summaryAiStages,summaryAiFlows,aiStages,aiFlows,stagesFor,industryEvidenceDates,phaseNames} from '../lib/ai-supply-chain.ts';
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

// Functional taxonomy and evidence integrity for the end-to-end map.
for(const id of ['finance','energy','construction','operations','dataplatforms','datasets','inference','devtools','safety','simulation','physical','enterprise'])assert(aiStages.some(s=>s.id===id));
for(const stage of aiStages){
 assert.equal(stage.processes.length,3,`Missing process detail: ${stage.id}`);
 assert(stage.phase>=0&&stage.phase<phaseNames.length);
 for(const s of stage.source)for(const d of [s.publicationDate,s.reviewedAt].filter(Boolean))assert(/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<='2026-10-10');
}
assert.equal(industryEvidenceDates().latestPublication,'2026-09-28');
assert.equal(industryEvidenceDates().lastReviewed,'2026-10-10');
for(const stage of aiStages)assert(aiFlows.some(f=>f.from===stage.id||f.to===stage.id),`Disconnected industry layer: ${stage.id}`);

assert.equal(summaryAiStages.length,17);
assert.equal(new Set(summaryAiStages.flatMap(s=>s.companies)).size,49);
assert.ok(summaryAiFlows.every(e=>summaryAiStages.some(s=>s.id===e.from)&&summaryAiStages.some(s=>s.id===e.to)));
