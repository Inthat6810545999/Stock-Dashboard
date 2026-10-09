import {randomUUID} from 'node:crypto';
import {checkoutReady,getAdmin,getSignedInUser,getStripe,json,sameOriginJsonRequest} from '@/lib/billing/server';

export async function POST(request:Request){
 if(!sameOriginJsonRequest(request))return json({error:'This request is not allowed.'},403);
 const auth=await getSignedInUser(request);
 if('response' in auth)return auth.response;
 let body:unknown;try{body=await request.json()}catch{return json({error:'Choose a valid membership plan.'},400)}
 if(!body||typeof body!=='object'||!('plan' in body)||!['monthly','yearly'].includes(String(body.plan)))return json({error:'Choose a valid membership plan.'},400);
 const plan=body.plan as 'monthly'|'yearly';
 if(!checkoutReady(plan))return json({error:'Online membership checkout is not available yet. No payment has been taken.'},503);
 const admin=getAdmin(auth.url),stripe=getStripe();
 if(!admin||!stripe)return json({error:'Membership checkout is not configured.'},503);

 const {data:existing,error:lookupError}=await admin.from('subscriptions').select('status,current_period_end').eq('user_id',auth.user.id).in('status',['active','trialing','past_due','unpaid','incomplete']).limit(10);
 if(lookupError)return json({error:'Your current membership could not be checked.'},503);
 if(existing?.some(item=>['past_due','unpaid','incomplete'].includes(item.status)||(['active','trialing'].includes(item.status)&&(!item.current_period_end||Date.parse(item.current_period_end)>Date.now()))))return json({error:'A membership already exists or needs payment attention. Use Manage billing to resolve it before starting another plan.'},409);

 const priceId=plan==='monthly'?process.env.STRIPE_PRICE_MONTHLY:process.env.STRIPE_PRICE_YEARLY;
 try{
  const price=await stripe.prices.retrieve(priceId!);
  const expectedInterval=plan==='monthly'?'month':'year';
  if(!price.active||price.type!=='recurring'||price.currency!=='thb'||price.recurring?.interval!==expectedInterval){
   return json({error:'The configured membership price does not match the selected plan.'},503);
  }
  const {data:mapping,error:mappingError}=await admin.from('billing_customers').select('stripe_customer_id').eq('user_id',auth.user.id).maybeSingle();
  if(mappingError)return json({error:'Your billing profile could not be checked.'},503);
  let customerId=mapping?.stripe_customer_id;
  if(!customerId){
   const customer=await stripe.customers.create({email:auth.user.email||undefined,metadata:{moonstar_user_id:auth.user.id}},{idempotencyKey:`moonstar-customer-${auth.user.id}`});
   const {error:saveError}=await admin.from('billing_customers').upsert({user_id:auth.user.id,stripe_customer_id:customer.id,updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(saveError)return json({error:'Your billing profile could not be saved.'},503);
   customerId=customer.id;
  }
  const configuredOrigin=process.env.NEXT_PUBLIC_SITE_URL;
  const origin=configuredOrigin?new URL(configuredOrigin).origin:new URL(request.url).origin;
  const nonce=randomUUID();
  const session=await stripe.checkout.sessions.create({
   mode:'subscription',customer:customerId,
   line_items:[{price:price.id,quantity:1}],
   client_reference_id:auth.user.id,
   subscription_data:{metadata:{moonstar_user_id:auth.user.id,moonstar_plan:plan}},
   success_url:`${origin}/settings?billing=return`,cancel_url:`${origin}/settings?billing=canceled`,
   allow_promotion_codes:false,
  },{idempotencyKey:`moonstar-checkout-${auth.user.id}-${nonce}`});
  if(!session.url)return json({error:'The secure payment page could not be created.'},502);
  return json({url:session.url});
 }catch{
  return json({error:'The secure payment page is temporarily unavailable.'},502);
 }
}
