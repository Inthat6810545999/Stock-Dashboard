import assert from 'node:assert/strict';
import {marketLocale,formatMoney,validSymbol,thaiTimestamp} from '../lib/market-locale.ts';
import {earningsSchedule} from '../lib/earnings-calendar.ts';
assert.equal(marketLocale('PTT.BK').timeZone,'Asia/Bangkok');
assert.equal(marketLocale('AAPL').currency,'USD');
assert.equal(formatMoney(41.5,'THB'),'฿41.50');
assert.equal(formatMoney(41.5,'USD'),'$41.50');
assert.equal(formatMoney(null,'THB'),'—');
assert.ok(validSymbol('2S.BK'));assert.ok(validSymbol('BRK-B'));assert.ok(!validSymbol('../PTT'));
const earnings={earningsDate:['2026-11-11T18:00:00Z']};
assert.equal(earningsSchedule(earnings,new Date('2026-10-01'),'Asia/Bangkok').reportDate,'2026-11-12');
assert.equal(earningsSchedule(earnings,new Date('2026-10-01'),'America/New_York').reportDate,'2026-11-11');
console.log('PASS: Thai/US currency, symbols and reporting-date time zones');

assert.equal(thaiTimestamp(Date.parse('2026-10-01T22:05:00Z')),'02/10/2026, 05:05:00');
