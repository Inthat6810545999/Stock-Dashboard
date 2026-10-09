import assert from 'node:assert/strict';
import {orderBySize} from '../lib/company-size.ts';
const symbols=['small','private','large','missing'];
const sizes={small:{marketCapUsd:2},large:{marketCapUsd:100},private:{marketCapUsd:null},missing:{marketCapUsd:NaN}};
assert.deepEqual(orderBySize(symbols,sizes),['large','small','missing','private']);
assert.deepEqual(symbols,['small','private','large','missing']);
assert.deepEqual(orderBySize(['zero','large'],{zero:{marketCapUsd:0},large:{marketCapUsd:100}}),['large','zero']);
console.log('PASS: largest comparable public company first; missing/private values follow without invented values');
