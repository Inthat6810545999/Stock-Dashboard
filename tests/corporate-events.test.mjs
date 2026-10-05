import test from 'node:test';
import assert from 'node:assert/strict';
import {corporateEvents} from '../lib/corporate-events.ts';
test('uses actual dividend dates and preserves cash amounts',()=>{const events=corporateEvents({a:{date:1700000000,amount:.25}},null,null);assert.equal(events[0].time,1700000000000);assert.equal(events[0].amount,.25);});
test('does not invent earnings announcements from quarter ends',()=>{assert.deepEqual(corporateEvents(undefined,{earningsHistory:{history:[{quarter:'2026-03-31'}]}},null),[]);});
test('deduplicates calendar dividend and preserves estimated earnings windows',()=>{const events=corporateEvents({a:{date:1700000000,amount:.25}},{exDividendDate:new Date(1700000000000),earnings:{earningsDate:[new Date(1800000000000),new Date(1800086400000)],isEarningsDateEstimate:true}},null);assert.equal(events.filter(e=>e.kind==='D').length,1);assert.equal(events.filter(e=>e.kind==='E').length,2);assert.equal(events[1].estimated,true);});
test('ignores malformed dates',()=>{assert.deepEqual(corporateEvents({a:{date:NaN}},{earnings:{earningsDate:['bad']}},null),[]);});

test('retains the quote announcement alongside a future calendar date',()=>{const events=corporateEvents(undefined,{earnings:{earningsDate:[1800000000]}},{earningsTimestamp:1700000000});assert.deepEqual(events.map(e=>e.time),[1700000000000,1800000000000]);});
test('deduplicates the same earnings announcement from both sources',()=>{assert.equal(corporateEvents(undefined,{earnings:{earningsDate:[1700000000]}},{earningsTimestamp:1700000000}).length,1);});

test('earnings colors require comparable EPS and treat equality as not-beat',async()=>{const {earningsOutcome,attachEarningsResults}=await import('../lib/corporate-events.ts');const e={kind:'E',time:1,label:'E',fiscalQuarterEnd:'2026-06-30'};assert.equal(earningsOutcome(e),'unknown');assert.equal(earningsOutcome({...e,epsActual:2,epsEstimate:1}),'beat');assert.equal(earningsOutcome({...e,epsActual:1,epsEstimate:1}),'not-beat');assert.equal(earningsOutcome({...e,epsActual:-2,epsEstimate:-1}),'not-beat');assert.equal(earningsOutcome(attachEarningsResults([e],[{quarter:'2026-06-30',epsActual:2,epsEstimate:1}])[0]),'beat');assert.equal(earningsOutcome(attachEarningsResults([e],[{quarter:'2026-03-31',epsActual:2,epsEstimate:1}])[0]),'unknown');});
