import us from '@/data/must-watch-us.json';
import {createClient} from '@supabase/supabase-js';
import {getComplimentaryGrant,getSignedInUser,json} from '@/lib/billing/server';
import {hasComplimentaryEntitlement,hasMembershipEntitlement} from '@/lib/billing/entitlements';
// Daily scanner publishes durable snapshots. Page requests never fan out across a market.
export async function GET(request:Request){
 const auth=await getSignedInUser(request);
 if('response' in auth)return auth.response;
 const client=createClient(auth.url,auth.key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${auth.token}`}}});
 const {data,error}=await client.from('subscriptions')
  .select('status,current_period_end,billing_attention_required')
  .eq('user_id',auth.user.id)
  .eq('stripe_livemode',process.env.VERCEL_ENV==='production')
  .order('updated_at',{ascending:false}).limit(10);
 if(error)return json({error:'Premium membership could not be verified.'},503);
 const entitled=data?.some(subscription=>hasMembershipEntitlement(subscription,Date.now(),false))??false;
 if(!entitled){
  const {grant,error:grantError}=await getComplimentaryGrant(auth.user.id);
  if(grantError)return json({error:'Premium access could not be verified.'},503);
  if(!hasComplimentaryEntitlement(grant))return json({error:'An active Premium membership is required to view Must Watch.',code:'premium_required'},403);
 }
 const market=new URL(request.url).searchParams.get('market');
 if(market&&market!=='us')return json({error:'Only US stocks are supported.'},400);
 const result=us;
 return json({...result,stale:!result.updatedAt||Date.now()-result.updatedAt>36*3600000});
}
