'use client';

import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';

type Subscription={plan_key:'monthly'|'yearly';status:string;current_period_start:string|null;current_period_end:string|null;cancel_at_period_end:boolean;canceled_at:string|null;trial_end:string|null;billing_attention_required:boolean;updated_at:string};
type BillingState={subscription:Subscription|null;plans:{monthly:{available:boolean};yearly:{available:boolean}};portalAvailable:boolean};

function dateLabel(value:string|null){
 if(!value)return null;
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return null;
 return new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeZone:'Asia/Bangkok'}).format(date);
}
function statusLabel(status:string){
 const labels:Record<string,string>={active:'Active',trialing:'Trial',past_due:'Payment needs attention',unpaid:'Unpaid',canceled:'Canceled',incomplete:'Awaiting payment',incomplete_expired:'Checkout expired',paused:'Paused'};
 return labels[status]??'Status unavailable';
}

export function BillingControls(){
 const [state,setState]=useState<BillingState|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{
  setError('');
  try{
   const client=getSupabaseBrowserClient();
   const {data}=await client?.auth.getSession()??{data:{session:null}};
   if(!data.session){setState(null);setLoading(false);return}
   const response=await fetch('/api/subscription',{headers:{Authorization:`Bearer ${data.session.access_token}`},cache:'no-store'});
   const result=await response.json() as BillingState&{error?:string};
   if(!response.ok)throw Error(result.error||'Membership status could not be loaded.');
   setState(result);
  }catch(e){setError(e instanceof Error?e.message:'Membership status could not be loaded.')}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{queueMicrotask(()=>void load())},[load]);

 async function launch(path:'/api/subscription/checkout'|'/api/subscription/portal',body?:unknown){
  setBusy(path);setError('');setNotice('');
  try{
   const client=getSupabaseBrowserClient();
   const {data}=await client?.auth.getSession()??{data:{session:null}};
   if(!data.session)throw Error('Sign in again to continue.');
   const response=await fetch(path,{method:'POST',headers:{Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body??{})});
   const result=await response.json() as {url?:string;error?:string};
   if(!response.ok||!result.url)throw Error(result.error||'The secure billing page is unavailable.');
   window.location.assign(result.url);
  }catch(e){setError(e instanceof Error?e.message:'The secure billing page is unavailable.');setBusy('')}
 }

 if(loading)return <p role="status">Loading membership status…</p>;
 if(!state)return <><p>View your plan, renewal and cancellation details here. Signing in is required to load private billing information.</p><p><Link href="/login">Sign in</Link></p>{error&&<p role="alert" className="billing-error">{error}</p>}</>;
 const sub=state.subscription;
 const periodEnd=dateLabel(sub?.current_period_end??null);
 const canStartPlan=Boolean(sub&&['canceled','incomplete_expired'].includes(sub.status));
 return <section className="billing-controls" aria-live="polite">
  {sub?<div className="settings-block">
   <h3>Current membership</h3>
   <p><strong>{sub.plan_key==='yearly'?'Annual':'Monthly'} membership</strong> · {statusLabel(sub.status)}</p>
   {periodEnd&&<p>{sub.cancel_at_period_end?'Access through':'Current period ends'} {periodEnd} (Bangkok time)</p>}
   {sub.trial_end&&<p>Trial ends {dateLabel(sub.trial_end)||'date unavailable'}.</p>}
   {sub.billing_attention_required&&<p className="billing-error">Payment needs attention. Update your payment method in billing management.</p>}
   {sub.cancel_at_period_end&&<p>Your membership is set to end after the current paid period.</p>}
   {state.portalAvailable&&<button onClick={()=>void launch('/api/subscription/portal')} disabled={Boolean(busy)}>{busy?'Opening secure billing…':'Manage billing'}</button>}
   {canStartPlan&&<><p>You can start a new plan when you are ready.</p><div className="billing-plan-actions"><button disabled={!state.plans.monthly.available||Boolean(busy)} onClick={()=>void launch('/api/subscription/checkout',{plan:'monthly'})}>Monthly plan</button><button disabled={!state.plans.yearly.available||Boolean(busy)} onClick={()=>void launch('/api/subscription/checkout',{plan:'yearly'})}>Annual plan</button></div></>}
  </div>:<div className="settings-block">
   <h3>Membership status</h3><p>No active membership is linked to this account.</p>
   <p>Subscription plans and checkout are being prepared. No payment is being collected, and your existing features remain available.</p>
   <div className="billing-plan-actions">
    <button disabled={!state.plans.monthly.available||Boolean(busy)} onClick={()=>void launch('/api/subscription/checkout',{plan:'monthly'})}>Monthly plan</button>
    <button disabled={!state.plans.yearly.available||Boolean(busy)} onClick={()=>void launch('/api/subscription/checkout',{plan:'yearly'})}>Annual plan</button>
   </div>
   <p className="billing-footnote">Prices, renewal details, cancellation terms and payment setup will be shown before checkout is enabled.</p>
  </div>}
  <div className="billing-footer-actions"><button onClick={()=>{setNotice('Membership status refreshed.');void load()}} disabled={Boolean(busy)}>Refresh status</button></div>
  {notice&&<p role="status">{notice}</p>}{error&&<p role="alert" className="billing-error">{error}</p>}
  <p><Link href="/terms">Read payment and cancellation terms</Link></p>
 </section>;
}
