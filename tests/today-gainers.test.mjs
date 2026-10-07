import assert from 'node:assert/strict';
import {rankTodayGainers} from '../lib/today-gainers.ts';

const row=(symbol,percent)=>({symbol,name:symbol,currency:'USD',price:100,previousClose:100/(1+percent/100),timestamp:1_800_000_000_000,percent});

const ranked=rankTodayGainers([row('AAA',1),row('BBB',8),row('CCC',3),row('NEG',-2),{...row('BAD',9),previousClose:0}]);
assert.deepEqual(ranked.map(item=>item.symbol),['BBB','CCC','AAA']);
assert.equal(rankTodayGainers(Array.from({length:12},(_,i)=>row(`S${String(i).padStart(2,'0')}`,i+1))).length,10);
assert.equal(rankTodayGainers(Array.from({length:40},(_,i)=>row(`S${String(i).padStart(2,'0')}`,i+1)),30).length,30);
assert.equal(rankTodayGainers(Array.from({length:40},(_,i)=>row(`S${String(i).padStart(2,'0')}`,i+1)),30)[0].symbol,'S39');
console.log('PASS daily gainers: positive returns ranked descending; invalid baselines excluded; candidate and display limits applied');
