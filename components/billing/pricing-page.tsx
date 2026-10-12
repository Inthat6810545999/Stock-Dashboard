'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Check,LockKeyhole} from 'lucide-react';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';
import {membershipPlans} from '@/lib/billing/plans';
import {CompassMark} from '@/components/market/journal-art';

type Cycle='monthly'|'yearly';
type PricingState={hasPaidAccess:boolean;plans:{monthly:{available:boolean};yearly:{available:boolean}};testMode:boolean};

export function PricingPage(){
 const router=useRouter();
 const [cycle,setCycle]=useState<Cycle>('yearly');
 const [loading,setLoading]=useState(true),[signedIn,setSignedIn]=useState(false),[paid,setPaid]=useState(false),[available,setAvailable]=useState(false),[testMode,setTestMode]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;void(async()=>{try{const client=getSupabaseBrowserClient();const {data}=await client?.auth.getSession()??{data:{session:null}};if(!active)return;setSignedIn(Boolean(data.session));if(!data.session){setAvailable(false);return}const response=await fetch('/api/subscription',{headers:{Authorization:`Bearer ${data.session.access_token}`},cache:'no-store'});const result=await response.json() as PricingState;if(!active)return;if(response.ok){setPaid(result.hasPaidAccess);setAvailable(result.plans[cycle].available);setTestMode(result.testMode)}}catch{if(active)setError('Membership status could not be checked. Please try again.')}finally{if(active)setLoading(false)}})();return()=>{active=false}},[cycle]);
 async function choosePlan(){
  setError('');
  if(!signedIn){router.push('/login');return}
  if(paid){router.push('/settings');return}
  if(!available)return;
  setBusy(true);
  try{const client=getSupabaseBrowserClient();const {data}=await client?.auth.getSession()??{data:{session:null}};if(!data.session)throw Error('Please sign in to continue.');const response=await fetch('/api/subscription/checkout',{method:'POST',headers:{Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({plan:cycle})});const result=await response.json() as {url?:string;error?:string};if(!response.ok||!result.url)throw Error(result.error||'Checkout is not available yet.');window.location.assign(result.url)}catch(e){setError(e instanceof Error?e.message:'Checkout is not available yet.');setBusy(false)}
 }
 const amount=membershipPlans[cycle].amountThb;
 const yearlyMonthly=(membershipPlans.yearly.amountThb/12).toFixed(2);
 return <main className="pricing-page"><header className="pricing-topbar"><Link href="/" className="pricing-brand"><CompassMark className="pricing-brand-mark"/><span>TOPPICKSTOCK</span></Link><nav><Link href="/data-methodology">How it works</Link><a href="#plans">Plans</a>{signedIn?<Link href="/settings">Account</Link>:<Link href="/login">Log in</Link>}</nav></header>
  <section className="pricing-intro"><p className="pricing-kicker">US MARKETS · YOUR INVESTING JOURNAL</p><h1>Choose the plan that fits you</h1><p>Start with TOPPICKSTOCK for free. See the selected membership prices and billing terms before you decide.</p><div className="pricing-cycle" role="group" aria-label="Billing period"><button aria-pressed={cycle==='yearly'} onClick={()=>setCycle('yearly')}>Yearly <span>Save ฿398</span></button><button aria-pressed={cycle==='monthly'} onClick={()=>setCycle('monthly')}>Monthly</button></div></section>
  <section className="pricing-cards" id="plans" aria-label="Membership plans">
   <article className="pricing-card"><div className="pricing-card-heading"><div><p className="pricing-card-label">START HERE</p><h2>Free</h2><p>For exploring the market journal</p></div></div><div className="pricing-amount"><strong>฿0</strong><span>/ forever</span></div><p className="pricing-summary">Use the core TOPPICKSTOCK journal without a subscription.</p><ul><li><Check/>Market dashboard and charts</li><li><Check/>Watchlist and stock search</li><li><Check/>Company research and supply-chain map</li><li><Check/>US stock coverage</li><li><Check/>Must Watch Premium preview</li></ul><Link className="pricing-secondary" href={signedIn?'/':'/signup'}>{signedIn?'Continue with Free':'Create a free account'}</Link></article>
   <article className="pricing-card pricing-card--featured"><div className="pricing-recommended">TOPPICKSTOCK PREMIUM</div><div className="pricing-card-heading"><div><p className="pricing-card-label">SELECTED PLAN</p><h2>Premium</h2><p>For members who want full Must Watch research screens</p></div></div><div className="pricing-amount"><strong>฿{cycle==='monthly'?amount.toLocaleString('en-US'):yearlyMonthly}</strong><span>/{cycle==='monthly'?'month':'month, billed yearly'}</span></div><p className="pricing-summary">{cycle==='yearly'?`฿${membershipPlans.yearly.amountThb.toLocaleString('en-US')} charged once per year.`:`฿${membershipPlans.monthly.amountThb.toLocaleString('en-US')} charged each month.`}</p><ul><li><Check/>Full Must Watch market rankings</li><li><Check/>Daily leaders and one-year price performance</li><li><Check/>Growth and value screens across company sizes</li><li><Check/>Manage or cancel membership from Settings</li></ul><p className="pricing-benefit-note">The dashboard, charts, watchlist, and company map remain available on Free. An active Premium membership unlocks all Must Watch screens. Renewal and cancellation terms are shown before payment.</p>
    <button className="pricing-primary" disabled={loading||busy||(!available&&!paid)} onClick={()=>void choosePlan()}>{loading?'Checking membership…':busy?'Opening secure checkout…':paid?'Manage membership':available?'Choose membership':'Coming soon'}</button>
    {available&&testMode&&<p className="pricing-coming" role="status">Stripe Test mode · no real payment will be collected. Use a Stripe test card only.</p>}
    {!signedIn&&!loading&&<p className="pricing-signin">Already have an account? <Link href="/login">Log in</Link></p>}
    {!available&&!paid&&<p className="pricing-coming">Checkout is not open yet. No payment is being taken.</p>}
    {error&&<p className="pricing-error" role="alert">{error}</p>}
   </article>
  </section>
  <p className="pricing-security"><LockKeyhole size={15}/>Secure payment details will be handled by Stripe Checkout. TOPPICKSTOCK does not store card numbers.</p>
  <footer className="pricing-footer"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/data-methodology">Data & methodology</Link><Link href="/">Back to dashboard</Link><span>Prices in Thai baht · applicable tax and renewal terms shown before any payment.</span></footer>
 </main>
}
