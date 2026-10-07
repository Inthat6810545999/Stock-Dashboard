import assert from 'node:assert/strict';
import {filterIntradayVolumeOutliers} from '../lib/chart-volume.ts';

const normal=Array.from({length:31},(_,index)=>({time:index,price:100,volume:100_000}));
assert.equal(filterIntradayVolumeOutliers(normal,81_000_000),normal);

const inconsistent=normal.map(point=>({...point}));
inconsistent[8].volume=44_000_000;
inconsistent[16].volume=36_000_000;
inconsistent[24].volume=48_000_000;
const cleaned=filterIntradayVolumeOutliers(inconsistent,81_000_000);
assert.equal(cleaned[8].volume,null);
assert.equal(cleaned[16].volume,null);
assert.equal(cleaned[24].volume,null);
assert.equal(cleaned[10].volume,100_000);
assert.equal(cleaned[10].price,100);

const allCleanable=normal.map(point=>({...point,volume:5_000_000}));
assert.equal(filterIntradayVolumeOutliers(allCleanable,81_000_000),allCleanable);
console.log('PASS: ordinary intraday volumes stay intact and isolated Yahoo session-volume anomalies are marked unavailable');
