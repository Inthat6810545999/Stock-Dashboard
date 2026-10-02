import assert from 'node:assert/strict';
import {rankCandidates} from '../lib/must-watch.ts';
const base={symbol:'A',name:'A',currency:'USD',price:100,pe:15,forwardPe:10,salesGrowth:.2,marketCap:2e9,timestamp:0,score:0};
assert.equal(rankCandidates([base,{...base,symbol:'B',salesGrowth:.5}])[0].symbol,'B');
for(const changes of [{pe:0},{pe:-1},{pe:26},{forwardPe:NaN},{salesGrowth:.09},{marketCap:1e8},{price:0}])assert.equal(rankCandidates([{...base,...changes}]).length,0);
assert.equal(rankCandidates(Array.from({length:20},(_,i)=>({...base,symbol:String(i)}))).length,10);
assert.equal(rankCandidates([{...base,price:.5}])[0].score,rankCandidates([base])[0].score,'nominal price must not affect value ranking');
console.log('PASS screen thresholds, missing data, deterministic ranking, top 10 cap, price independence');

assert.equal(rankCandidates([{...base,marketCap:1e6}],null).length,1);
assert.equal(rankCandidates([{...base,marketCap:NaN}],null).length,1);
assert.equal(rankCandidates([{...base,marketCap:1e6,pe:26}],null).length,0);
