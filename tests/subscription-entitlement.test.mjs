import test from 'node:test';
import assert from 'node:assert/strict';
import {hasMembershipEntitlement} from '../lib/billing/entitlements.ts';
import {matchesMembershipPrice,membershipPlans} from '../lib/billing/plans.ts';

const now=Date.parse('2026-10-10T00:00:00.000Z');
const record=(overrides={})=>({status:'active',current_period_end:'2026-10-11T00:00:00.000Z',billing_attention_required:false,...overrides});

test('active paid access remains through scheduled cancellation date',()=>{
 assert.equal(hasMembershipEntitlement(record(),now),true);
 assert.equal(hasMembershipEntitlement(record({cancel_at_period_end:true}),now),true);
});
test('access ends exactly at the paid-through timestamp and fails closed without one',()=>{
 assert.equal(hasMembershipEntitlement(record(),Date.parse('2026-10-11T00:00:00.000Z')),false);
 assert.equal(hasMembershipEntitlement(record({current_period_end:null}),now),false);
});
test('payment issues and non-active states never grant access',()=>{
 assert.equal(hasMembershipEntitlement(record({status:'past_due'}),now),false);
 assert.equal(hasMembershipEntitlement(record({billing_attention_required:true}),now),false);
 assert.equal(hasMembershipEntitlement(record({status:'canceled'}),now),false);
});
test('trials require explicit configuration and an unexpired trial end',()=>{
 const trial=record({status:'trialing',trial_end:'2026-10-11T00:00:00.000Z'});
 assert.equal(hasMembershipEntitlement(trial,now,false),false);
 assert.equal(hasMembershipEntitlement(trial,now,true),true);
 assert.equal(hasMembershipEntitlement(trial,Date.parse('2026-10-11T00:00:00.000Z'),true),false);
});

test('monthly and annual plans use the selected THB amounts and intervals',()=>{
 assert.equal(membershipPlans.monthly.amountThb,199);
 assert.equal(membershipPlans.yearly.amountThb,1990);
 assert.equal(matchesMembershipPrice('monthly',{active:true,type:'recurring',currency:'thb',unit_amount:19900,recurring:{interval:'month'}}),true);
 assert.equal(matchesMembershipPrice('yearly',{active:true,type:'recurring',currency:'thb',unit_amount:199000,recurring:{interval:'year'}}),true);
});

test('checkout rejects a Stripe price with the wrong amount, currency or interval',()=>{
 const valid={active:true,type:'recurring',currency:'thb',unit_amount:19900,recurring:{interval:'month'}};
 assert.equal(matchesMembershipPrice('monthly',{...valid,unit_amount:20000}),false);
 assert.equal(matchesMembershipPrice('monthly',{...valid,currency:'usd'}),false);
 assert.equal(matchesMembershipPrice('monthly',{...valid,recurring:{interval:'year'}}),false);
});
