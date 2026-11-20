import assert from 'node:assert/strict';
import {discoverUniverse,getText,isThaiDirectoryForbidden,parseNasdaq,parseThai,thaiPages,validThaiUniverseCache} from '../scripts/market-scan/universe.mjs';
import {readFile} from 'node:fs/promises';
const nasdaq='Symbol|Security Name|Market Category|Test Issue|Financial Status|Round Lot Size|ETF|NextShares\nA|A Common Stock|Q|N|N|100|N|N\nETF|A Fund|Q|N|N|100|Y|N\nAW|A Warrants|Q|N|N|100|N|N\nTEST|A Common Stock|Q|Y|N|100|N|N\nFile Creation Time: 20261002\n';
assert.deepEqual(parseNasdaq(nasdaq).map(r=>r.symbol),['A']);
assert.throws(()=>parseNasdaq(nasdaq.replace('File Creation Time:','truncated')),/Incomplete/);
const other='ACT Symbol|Security Name|Exchange|CQS Symbol|ETF|Round Lot Size|Test Issue|NASDAQ Symbol\nBRK.B|Berkshire Common Stock|N|BRK.B|N|100|N|BRK.B\nFile Creation Time: 20261002';
assert.equal(parseNasdaq(other,true)[0].symbol,'BRK-B');
const html='<a href="/public/idisc/th/company/listed/2">2</a><a href="/public/idisc/th/company/listed/A">A</a><a href="/public/idisc/th/company/listed/A">A</a><tr><td><a href="/public/idisc/th/companyprofile/listed/2S">2S</a></td><td><a href="/Ranking/Listed/Sector/mai-STEEL">Ranking</a></td></tr><tr><td><a href="/public/idisc/th/companyprofile/listed/OLD">Old</a></td></tr>';
assert.equal(thaiPages(html).length,2);assert.deepEqual(parseThai(html).map(r=>r.symbol),['2S.BK']);
const originalFetch=globalThis.fetch;
try{
 globalThis.fetch=async()=>({ok:false,status:403});
 await assert.rejects(getText('https://market.sec.or.th/public/idisc/th/company/listed/'),error=>isThaiDirectoryForbidden(error));
 await assert.rejects(getText('https://www.nasdaqtrader.com/example'),error=>error.status===403&&!isThaiDirectoryForbidden(error));
 const cached=JSON.parse(await readFile(new URL('../data/market-universe-th.json',import.meta.url),'utf8'));
 assert.ok(validThaiUniverseCache(cached,cached.retrievedAt+86400000));
 assert.equal(validThaiUniverseCache(cached,cached.retrievedAt+31*86400000),false);
 const fallback=await discoverUniverse('th');
 assert.equal(fallback.fallback,true);
 assert.equal(fallback.rows.length,cached.rows.length);
}finally{globalThis.fetch=originalFetch}
console.log('PASS: directory scope, ETF/test/warrant exclusions, share-class normalization, truncated source rejection, Thai page discovery and SET/mai classification');
