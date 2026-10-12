import assert from 'node:assert/strict';
import {getDueGainerSlot} from '../scripts/market-scan/gainer-schedule.mjs';

const us=date=>getDueGainerSlot('us',new Date(date));
assert.equal(us('2026-10-08T13:34:00Z'),null);
const opening=us('2026-10-08T13:35:00Z');
assert.equal(opening,'2026-10-08T09:35[America/New_York]');
assert.equal(us('2026-10-08T13:55:00Z'),opening); // Delayed/retry event uses same slot.
assert.equal(us('2026-10-08T14:04:00Z'),opening);
assert.notEqual(us('2026-10-08T14:05:00Z'),opening);
assert.equal(us('2026-01-08T14:35:00Z'),'2026-01-08T09:35[America/New_York]'); // DST.
assert.equal(us('2026-10-08T20:10:00Z'),'2026-10-08T16:05[America/New_York]');
assert.equal(us('2026-10-08T20:15:00Z'),'2026-10-08T16:15[America/New_York]');
assert.equal(us('2026-10-08T20:24:00Z'),'2026-10-08T16:15[America/New_York]');
assert.equal(us('2026-10-08T20:34:00Z'),'2026-10-08T16:15[America/New_York]');
assert.equal(us('2026-10-08T20:35:00Z'),null);
assert.equal(us('2026-01-08T21:15:00Z'),'2026-01-08T16:15[America/New_York]'); // Winter close confirmation, DST-aware.
assert.equal(us('2026-10-10T14:05:00Z'),null);
assert.equal(getDueGainerSlot('th',new Date('2026-10-08T03:05:00Z')),null);
console.log('PASS: US hourly slots, delayed retries and DST');
