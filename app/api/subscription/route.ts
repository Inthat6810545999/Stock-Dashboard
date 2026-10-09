import {createClient} from '@supabase/supabase-js';
import {checkoutReady,getSignedInUser,json} from '@/lib/billing/server';

export async function GET(request:Request){
 const auth=await getSignedInUser(request);
 if('response' in auth)return auth.response;
 const client=createClient(auth.url,auth.key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${auth.token}`}}});
 const {data,error}=await client.from('subscriptions')
  .select('plan_key,status,current_period_start,current_period_end,cancel_at_period_end,canceled_at,trial_end,billing_attention_required,updated_at')
  .eq('user_id',auth.user.id).order('updated_at',{ascending:false}).limit(10);
 if(error)return json({error:'Membership status could not be loaded.'},503);
 const current=data?.find(row=>['active','trialing','past_due','unpaid','incomplete'].includes(row.status))??data?.[0]??null;
 return json({
  subscription:current,
  plans:{monthly:{available:checkoutReady('monthly')},yearly:{available:checkoutReady('yearly')}},
  portalAvailable:Boolean(process.env.STRIPE_SECRET_KEY&&process.env.SUPABASE_SECRET_KEY||process.env.STRIPE_SECRET_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY),
 });
}
