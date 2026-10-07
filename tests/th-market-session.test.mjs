import assert from 'node:assert/strict';
import {getThaiScanWindow,getThaiTargetTradingDay,isThaiQuoteUsable} from '../lib/th-market-session.ts';

const ict=(day,hour,minute)=>new Date(Date.UTC(2026,9,day,hour-7,minute));
assert.equal(getThaiScanWindow(ict(8,9,59)),'closed');
assert.equal(getThaiScanWindow(ict(8,10,5)),'regular');
assert.equal(getThaiScanWindow(ict(8,12,5)),'regular');
assert.equal(getThaiScanWindow(ict(8,13,5)),'closed');
assert.equal(getThaiScanWindow(ict(8,14,5)),'closed');
assert.equal(getThaiScanWindow(ict(8,14,35)),'regular');
assert.equal(getThaiScanWindow(ict(8,16,5)),'regular');
assert.equal(getThaiScanWindow(ict(8,17,5)),'closing');
assert.equal(getThaiScanWindow(ict(9,10,5)),'regular');
assert.equal(getThaiScanWindow(ict(10,10,5)),'closed');
assert.equal(getThaiScanWindow(ict(11,10,5)),'closed');

const now=ict(8,17,5),today=ict(8,16,30).getTime(),yesterday=ict(7,16,30).getTime();
assert.equal(isThaiQuoteUsable('regular','REGULAR',today,now),true);
assert.equal(isThaiQuoteUsable('regular','CLOSED',today,now),false);
assert.equal(isThaiQuoteUsable('closing','POST',today,now),true);
assert.equal(isThaiQuoteUsable('closing','CLOSED',yesterday,now),false);
assert.equal(isThaiQuoteUsable('closed','REGULAR',today,now),false);
assert.equal(getThaiTargetTradingDay('regular',today,now),'2026-10-08');
assert.equal(getThaiTargetTradingDay('closing',today,now),'2026-10-08');
assert.equal(getThaiTargetTradingDay('regular',yesterday,now),null);
assert.equal(getThaiTargetTradingDay('closed',yesterday,now),'2026-10-07');
assert.equal(getThaiTargetTradingDay('closed',null,now),null);
console.log('PASS: Thai weekday sessions, lunch break, closing snapshot and stale-quote rejection');
