import {createClient} from '@supabase/supabase-js';
const headers={'Cache-Control':'private, no-store'};
function json(body:unknown,status=200){return Response.json(body,{status,headers})}
async function authenticate(request:Request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return {failure:json({error:'Account services are temporarily unavailable.'},503)};
 const token=request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1];
 if(!token)return {failure:json({error:'Sign in to manage your account.'},401)};
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data,error}=await client.auth.getUser(token);
 if(error||!data.user)return {failure:json({error:'Your session is no longer valid. Please sign in again.'},401)};
 return {client,user:data.user,token,url};
}
export async function GET(request:Request){
 const auth=await authenticate(request);if(auth.failure)return auth.failure;
 const {data,error}=await auth.client.from('watchlists').select('stocks, updated_at').eq('user_id',auth.user.id).maybeSingle();
 if(error)return json({error:'Your account data could not be exported. Please try again.'},503);
 return json({exportedAt:new Date().toISOString(),account:{id:auth.user.id,email:auth.user.email,createdAt:auth.user.created_at,lastSignInAt:auth.user.last_sign_in_at},watchlist:data?.stocks??[],watchlistUpdatedAt:data?.updated_at??null,deletionAvailable:Boolean(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY)});
}
export async function DELETE(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Request origin is not allowed.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'A JSON confirmation is required.'},415);
 let body;try{body=await request.json()}catch{return json({error:'Invalid confirmation.'},400)};
 if(!body||typeof body!=='object'||!('confirmation' in body)||body.confirmation!=='DELETE')return json({error:'Confirm account deletion.'},400);
 const auth=await authenticate(request);if(auth.failure)return auth.failure;
 const lastSignIn=Date.parse(auth.user.last_sign_in_at??'');
 let authenticatedAt=NaN;
 try{const payload=JSON.parse(Buffer.from(auth.token.split('.')[1]??'', 'base64url').toString()) as {amr?:{method?:string;timestamp?:number}[]};authenticatedAt=Math.max(...(payload.amr??[]).filter(item=>['oauth','otp','password','magiclink'].includes(item.method??'')).map(item=>(item.timestamp??NaN)*1000))}catch{/* Reject missing or malformed session-bound authentication evidence. */}
 if(!Number.isFinite(authenticatedAt)||Date.now()-authenticatedAt>10*60*1000||authenticatedAt>Date.now()+60000)return json({error:'Sign out and sign in again before deleting your account.'},403);
 if(!Number.isFinite(lastSignIn)||Date.now()-lastSignIn>10*60*1000||lastSignIn>Date.now()+60000)return json({error:'Sign out and sign in again, then return here within 10 minutes to delete your account.'},403);
 const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!secret)return json({error:'Self-service deletion is not configured yet. Use the operator contact in the privacy notice.'},503);
 const admin=createClient(auth.url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:subscriptions,error:billingLookupError}=await admin.from('subscriptions').select('status,current_period_end').eq('user_id',auth.user.id).in('status',['active','trialing','past_due','unpaid','incomplete']).limit(20);
 if(billingLookupError)return json({error:'Billing status could not be checked. Your account has not been deleted.'},503);
 const paidAccessStatus=Boolean(subscriptions?.some(subscription=>['past_due','unpaid','incomplete'].includes(subscription.status)||!subscription.current_period_end||Date.parse(subscription.current_period_end)>Date.now()));
 if(paidAccessStatus)return json({error:'Please cancel your membership or resolve any payment issue in Settings → Membership & billing before deleting your account. Your account has not been deleted.'},409);
 const {error:revokeError}=await admin.auth.admin.signOut(auth.token,'global');
 if(revokeError)return json({error:'Could not revoke account sessions. Your account has not been deleted.'},503);
 const {error}=await admin.auth.admin.deleteUser(auth.user.id);
 if(error)return json({error:'Could not delete your account. Sessions were revoked; please sign in again and retry.'},503);
 return json({deleted:true});
}
