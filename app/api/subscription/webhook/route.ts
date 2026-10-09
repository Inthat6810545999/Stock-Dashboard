import type Stripe from 'stripe';
import {epochToIso,getAdmin,getStripe,json} from '@/lib/billing/server';

export const runtime='nodejs';

async function syncSubscription(subscriptionId:string){
 const stripe=getStripe(),admin=getAdmin();
 if(!stripe||!admin)throw new Error('Server billing storage is not configured.');
 const subscription=await stripe.subscriptions.retrieve(subscriptionId);
 const customerId=typeof subscription.customer==='string'?subscription.customer:subscription.customer.id;
 const {data:mapping,error:mappingError}=await admin.from('billing_customers').select('user_id').eq('stripe_customer_id',customerId).maybeSingle();
 if(mappingError)throw new Error('Billing customer mapping unavailable.');
 if(!mapping)return;
 const plan=subscriptionPlanFromStripe(subscription);
 if(!plan)return;
 const item=subscription.items.data[0];
 const currentStart=item?.current_period_start??null;
 const currentEnd=item?.current_period_end??null;
 const needsAttention=['past_due','unpaid','incomplete','incomplete_expired','paused'].includes(subscription.status);
 const {error}=await admin.from('subscriptions').upsert({
  user_id:mapping.user_id,stripe_customer_id:customerId,stripe_subscription_id:subscription.id,
  plan_key:plan,status:subscription.status,current_period_start:epochToIso(currentStart),
  current_period_end:epochToIso(currentEnd),cancel_at_period_end:subscription.cancel_at_period_end,
  canceled_at:epochToIso(subscription.canceled_at),trial_end:epochToIso(subscription.trial_end),
  billing_attention_required:needsAttention,updated_at:new Date().toISOString(),
 },{onConflict:'stripe_subscription_id'});
 if(error)throw new Error('Subscription status could not be saved.');
}

function subscriptionPlanFromStripe(subscription:Stripe.Subscription){
 const ids=subscription.items.data.map(item=>item.price.id);
 if(ids.length!==1)return null;
 if(ids[0]===process.env.STRIPE_PRICE_MONTHLY)return 'monthly';
 if(ids[0]===process.env.STRIPE_PRICE_YEARLY)return 'yearly';
 return null;
}

function invoiceSubscriptionId(invoice:Stripe.Invoice):string|null{
 const value=(invoice as unknown as {parent?:{subscription_details?:{subscription?:string|{id:string}}}|null}).parent?.subscription_details?.subscription;
 return typeof value==='string'?value:value?.id??null;
}

export async function POST(request:Request){
 const signature=request.headers.get('stripe-signature');
 const secret=process.env.STRIPE_WEBHOOK_SECRET;
 const stripe=getStripe();
 if(!signature||!secret||!stripe||!getAdmin())return json({error:'Webhook endpoint is not configured.'},503);
 let event:Stripe.Event;
 try{event=stripe.webhooks.constructEvent(await request.text(),signature,secret)}
 catch{return json({error:'Invalid webhook signature.'},400)}

 try{
  if(event.type.startsWith('customer.subscription.')){
   const subscription=event.data.object as Stripe.Subscription;
   await syncSubscription(subscription.id);
  }else if(event.type==='invoice.paid'||event.type==='invoice.payment_failed'){
   const invoice=event.data.object as Stripe.Invoice;
   const id=invoiceSubscriptionId(invoice);
   if(id)await syncSubscription(id);
  }
  const admin=getAdmin()!;
  const {error}=await admin.from('billing_webhook_events').upsert({
   stripe_event_id:event.id,event_type:event.type,
   stripe_event_created_at:new Date(event.created*1000).toISOString(),processed_at:new Date().toISOString(),
  },{onConflict:'stripe_event_id'});
  if(error)throw new Error('Webhook receipt could not be recorded.');
  return json({received:true});
 }catch{return json({error:'Webhook processing failed; Stripe may retry this event.'},500)}
}
