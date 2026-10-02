import assert from 'node:assert/strict';
import {rangePerformance} from '../lib/range-performance.ts';
const points=(a,b,days)=>[{time:0,price:a,volume:0},{time:days*86400000,price:b,volume:0}];
assert.equal(rangePerformance(points(100,150,1825),'5Y').percent,50);
assert.equal(rangePerformance(points(100,80,365),'1Y').label,'Past 1 year');
assert.ok(Math.abs(rangePerformance(points(100,80,365),'1Y').percent+20)<1e-9);
assert.equal(rangePerformance(points(100,150,300),'5Y').label,'Available history');
assert.equal(rangePerformance([],'5Y'),null);
assert.equal(rangePerformance([{time:0,price:0,volume:0}],'5Y'),null);
console.log('PASS: gains, losses, five-year label, partial histories and missing data');

assert.ok(Math.abs(rangePerformance([{time:0,price:102,volume:0}],'1D',100).percent-2)<1e-9,'daily return includes opening gap vs previous close');
