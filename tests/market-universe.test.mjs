import assert from 'node:assert/strict';
import {parseNasdaq} from '../scripts/market-scan/universe.mjs';
const nasdaq='Symbol|Security Name|Market Category|Test Issue|Financial Status|Round Lot Size|ETF|NextShares\nA|A Common Stock|Q|N|N|100|N|N\nETF|A Fund|Q|N|N|100|Y|N\nAW|A Warrants|Q|N|N|100|N|N\nTEST|A Common Stock|Q|Y|N|100|N|N\nFile Creation Time: 20261002\n';
assert.deepEqual(parseNasdaq(nasdaq).map(r=>r.symbol),['A']);
assert.throws(()=>parseNasdaq(nasdaq.replace('File Creation Time:','truncated')),/Incomplete/);
const other='ACT Symbol|Security Name|Exchange|CQS Symbol|ETF|Round Lot Size|Test Issue|NASDAQ Symbol\nBRK.B|Berkshire Common Stock|N|BRK.B|N|100|N|BRK.B\nFile Creation Time: 20261002';
assert.equal(parseNasdaq(other,true)[0].symbol,'BRK-B');
assert.equal((await import('../scripts/market-scan/universe.mjs')).sources.us.length,2);
console.log('PASS: US directory scope, ETF/test/warrant exclusions, share-class normalization and truncated source rejection');
