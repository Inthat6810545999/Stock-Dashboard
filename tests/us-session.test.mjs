import assert from 'node:assert/strict';
import {getUsScanWindow} from '../lib/us-market-session.ts';

assert.equal(getUsScanWindow(new Date('2026-10-08T13:30:00Z')),'regular'); // 09:30 EDT, open
assert.equal(getUsScanWindow(new Date('2026-10-08T20:05:00Z')),'closing'); // 16:05 EDT, final close snapshot
assert.equal(getUsScanWindow(new Date('2026-10-08T20:15:00Z')),'reconcile'); // 16:15 EDT, full-universe close confirmation
assert.equal(getUsScanWindow(new Date('2026-10-08T20:34:00Z')),'reconcile'); // delayed retry still uses the same confirmation window
assert.equal(getUsScanWindow(new Date('2026-10-08T20:35:00Z')),'closed'); // confirmation retry window ends
assert.equal(getUsScanWindow(new Date('2026-10-08T13:29:00Z')),'closed'); // before open
assert.equal(getUsScanWindow(new Date('2026-10-10T15:00:00Z')),'closed'); // Saturday
assert.equal(getUsScanWindow(new Date('2026-01-08T14:30:00Z')),'regular'); // 09:30 EST, DST-aware
console.log('US market session timezone and boundaries passed.');
