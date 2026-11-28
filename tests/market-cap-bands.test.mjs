import assert from 'node:assert/strict';
import {marketCapBand,rankByMarketCap} from '../lib/market-cap-bands.ts';
import {rankTodayGainers} from '../lib/today-gainers.ts';
import {rankCandidates} from '../lib/must-watch.ts';
import {priceSnapshot} from '../scripts/market-scan/price-gainers.mjs';

assert.equal(marketCapBand(100_000_000),'small');
assert.equal(marketCapBand(2_000_000_000),'mid');
assert.equal(marketCapBand(10_000_000_000),'large');
for (const cap of [null,undefined,0,-1,NaN]) assert.equal(marketCapBand(cap),null);

const daily=Array.from({length:13},(_,i)=>({symbol:`S${i}`,name:'Small',currency:'USD',price:100,previousClose:50,timestamp:1,percent:100-i,marketCap:1_000_000_000}));
daily.push({symbol:'M',name:'Mid',currency:'USD',price:100,previousClose:50,timestamp:1,percent:1,marketCap:5_000_000_000});
const dailyBands=rankByMarketCap(daily,rankTodayGainers);
assert.equal(dailyBands.small.length,10);
assert.equal(dailyBands.mid[0].symbol,'M','mid cap must rank from the full candidate set, not the overall top 10');
assert.equal(dailyBands.large.length,0);

const growth=[
 {symbol:'SM',name:'Small',currency:'USD',price:10,pe:10,forwardPe:10,salesGrowth:.4,marketCap:1.5e9,timestamp:1,score:0},
 {symbol:'MI',name:'Mid',currency:'USD',price:10,pe:10,forwardPe:10,salesGrowth:.3,marketCap:5e9,timestamp:1,score:0},
 {symbol:'NO',name:'Unknown',currency:'USD',price:10,pe:10,forwardPe:10,salesGrowth:.6,marketCap:null,timestamp:1,score:0},
];
assert.equal(rankCandidates(growth,null).length,3);
assert.deepEqual(rankByMarketCap(growth,rows=>rankCandidates(rows,1e9)).small.map(row=>row.symbol),['SM']);
assert.deepEqual(rankByMarketCap(growth,rows=>rankCandidates(rows,null)).mid.map(row=>row.symbol),['MI']);
const annualState={market:'us',universe:{rows:[{symbol:'M'}]},priceOutcomes:{M:{kind:'eligible',row:{symbol:'M',percent:30}}},todayOutcomes:{M:{kind:'eligible',row:{marketCap:5e9}}}};
assert.equal(priceSnapshot(annualState).priceByMarketCap.mid[0].symbol,'M');
console.log('PASS market-cap boundaries and independent daily/growth rankings');
