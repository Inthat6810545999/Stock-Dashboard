import test from 'node:test';
import assert from 'node:assert/strict';
import {hasMembershipEntitlement} from '../lib/billing/entitlements.ts';
import {matchesMembershipPrice,membershipPlans,scheduledForPeriodEnd,stripeCheckoutKeyAllowed,stripeEventMatchesDeployment,stripeKeyMatchesDeployment,stripeSecretForDeployment} from '../lib/billing/plans.ts';

const now=Date.parse('2026-10-10T00:00:00.000Z');
const record=(overrides={})=>({status:'active',current_period_end:'2026-10-11T00:00:00.000Z',billing_attention_required:false,...overrides});

test('active paid access remains through scheduled cancellation date',()=>{
 assert.equal(hasMembershipEntitlement(record(),now),true);
 assert.equal(hasMembershipEntitlement(record({cancel_at_period_end:true}),now),true);
});
test('recognizes Stripe cancel_at timestamps scheduled for the current period end',()=>{
 const periodEnd=Date.parse('2027-10-10T20:42:18.000Z')/1000;
 assert.equal(scheduledForPeriodEnd(false,periodEnd,periodEnd),true);
 assert.equal(scheduledForPeriodEnd(true,null,periodEnd),true);
 assert.equal(scheduledForPeriodEnd(false,periodEnd-3600,periodEnd),false);
 assert.equal(scheduledForPeriodEnd(false,null,periodEnd),false);
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

test('production checkout requires an explicitly enabled live key and non-production only accepts test keys',()=>{
 assert.equal(stripeCheckoutKeyAllowed('sk_live_secret','production',true),true);
 assert.equal(stripeCheckoutKeyAllowed('rk_live_secret','production',true),true);
 assert.equal(stripeCheckoutKeyAllowed('rk_live_secret','production',false),false);
 assert.equal(stripeCheckoutKeyAllowed('sk_live_secret','production',false),false);
 assert.equal(stripeCheckoutKeyAllowed('sk_test_secret','production',true),false);
 assert.equal(stripeCheckoutKeyAllowed('rk_test_secret','production',true),false);
 assert.equal(stripeCheckoutKeyAllowed('sk_live_secret','preview',true),false);
 assert.equal(stripeCheckoutKeyAllowed('rk_live_secret','preview',true),false);
 assert.equal(stripeCheckoutKeyAllowed('sk_test_secret','preview',false),true);
 assert.equal(stripeCheckoutKeyAllowed('rk_test_secret','preview',false),true);
 assert.equal(stripeCheckoutKeyAllowed('sk_live_secret',undefined,true),false);
});

test('all Stripe API and webhook operations use keys matching the deployment environment',()=>{
 assert.equal(stripeKeyMatchesDeployment('sk_live_secret','production'),true);
 assert.equal(stripeKeyMatchesDeployment('rk_live_secret','production'),true);
 assert.equal(stripeKeyMatchesDeployment('sk_test_secret','production'),false);
 assert.equal(stripeKeyMatchesDeployment('rk_test_secret','production'),false);
 assert.equal(stripeKeyMatchesDeployment('sk_test_secret','preview'),true);
 assert.equal(stripeKeyMatchesDeployment('rk_test_secret','preview'),true);
 assert.equal(stripeKeyMatchesDeployment('sk_live_secret','preview'),false);
 assert.equal(stripeKeyMatchesDeployment('rk_live_secret','preview'),false);
 assert.equal(stripeKeyMatchesDeployment('sk_test_secret',undefined),true);
 assert.equal(stripeKeyMatchesDeployment('sk_live_secret',undefined),false);
});

test('production never falls back to the integration test key',()=>{
 assert.equal(stripeSecretForDeployment('rk_live_secret','sk_test_secret','production'),'rk_live_secret');
 assert.equal(stripeSecretForDeployment(undefined,'sk_test_secret','production'),undefined);
 assert.equal(stripeSecretForDeployment('rk_live_secret','sk_test_secret','preview'),'sk_test_secret');
});

test('signed Stripe events must match the deployment mode',()=>{
 assert.equal(stripeEventMatchesDeployment(true,'production'),true);
 assert.equal(stripeEventMatchesDeployment(false,'production'),false);
 assert.equal(stripeEventMatchesDeployment(false,'preview'),true);
 assert.equal(stripeEventMatchesDeployment(true,'preview'),false);
 assert.equal(stripeEventMatchesDeployment(false,undefined),true);
});
