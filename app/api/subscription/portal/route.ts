import {getAdmin,getSignedInUser,getStripe,json,sameOriginJsonRequest} from '@/lib/billing/server';

export async function POST(request:Request){
 if(!sameOriginJsonRequest(request))return json({error:'This request is not allowed.'},403);
 const auth=await getSignedInUser(request);
 if('response' in auth)return auth.response;
 const admin=getAdmin(auth.url),stripe=getStripe();
 if(!admin||!stripe)return json({error:'Billing management is not configured yet.'},503);
 const {data,error}=await admin.from('billing_customers').select('stripe_customer_id').eq('user_id',auth.user.id).maybeSingle();
 if(error)return json({error:'Your billing profile could not be loaded.'},503);
 if(!data)return json({error:'There is no billing profile to manage.'},404);
 try{
  const origin=process.env.NEXT_PUBLIC_SITE_URL?new URL(process.env.NEXT_PUBLIC_SITE_URL).origin:new URL(request.url).origin;
  const session=await stripe.billingPortal.sessions.create({customer:data.stripe_customer_id,return_url:`${origin}/settings`});
  return json({url:session.url});
 }catch{return json({error:'Billing management is temporarily unavailable.'},502)}
}
