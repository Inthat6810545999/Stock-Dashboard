'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowLeft,Check,Compass,RefreshCw,Stars} from 'lucide-react';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';
import {CompassMark} from '@/components/market/journal-art';
import './callback.css';

const pendingExchanges=new Map<string,Promise<string|null>>();
function exchangeCodeOnce(code:string,supabase:NonNullable<ReturnType<typeof getSupabaseBrowserClient>>){
  let exchange=pendingExchanges.get(code);
  if(!exchange){
    exchange=supabase.auth.exchangeCodeForSession(code).then(({error})=>error?.message??null).catch(reason=>reason instanceof Error?reason.message:'We could not complete sign-in. Please try again.');
    pendingExchanges.set(code,exchange);
  }
  return exchange;
}

export default function AuthCallbackPage(){
  const router=useRouter();
  const [error,setError]=useState('');

  useEffect(()=>{
    let active=true;
    const timeout=window.setTimeout(()=>{
      if(active)setError('This is taking longer than expected. Please try signing in again.');
    },20000);

    async function finish(){
      const params=new URLSearchParams(window.location.search);
      const providerError=params.get('error_description')||params.get('error');
      if(providerError){if(active)setError(providerError);return}

      const supabase=getSupabaseBrowserClient();
      if(!supabase){if(active)setError('Sign-in is temporarily unavailable. Please try again shortly.');return}

      const code=params.get('code');
      if(!code){
        const {data}=await supabase.auth.getSession();
        if(active&&data.session)router.replace('/');
        else if(active)setError('The sign-in link is missing or has expired. Please start again.');
        return;
      }

      const exchangeError=await exchangeCodeOnce(code,supabase);
      if(!active)return;
      if(exchangeError){
        const {data}=await supabase.auth.getSession();
        if(data.session)router.replace('/');
        else setError(exchangeError);
        return;
      }
      router.replace('/');
    }

    void finish().catch(reason=>{if(active)setError(reason instanceof Error?reason.message:'We could not complete sign-in. Please try again.')}).finally(()=>window.clearTimeout(timeout));
    return()=>{active=false;window.clearTimeout(timeout)};
  },[router]);

  return <main className="auth-callback-page">
    <div className="auth-callback-glow auth-callback-glow-one" aria-hidden="true"/>
    <div className="auth-callback-glow auth-callback-glow-two" aria-hidden="true"/>
    <section className="auth-callback-card" aria-live="polite" aria-busy={!error}>
      <Link className="auth-callback-brand" href="/" aria-label="TOPPICKSTOCK home"><CompassMark/><span>TOPPICKSTOCK</span></Link>
      <div className={`auth-callback-symbol${error?' is-error':''}`} aria-hidden="true">
        {error?<Compass size={27}/>:<><span className="auth-callback-spinner"/><Stars className="auth-callback-sparkle" size={17}/></>}
      </div>
      <p className="auth-callback-eyebrow">{error?'ACCOUNT ACCESS':'SECURE SIGN IN'}</p>
      <h1>{error?'We couldn’t finish signing you in':'Finishing sign in'}</h1>
      <p className="auth-callback-message">{error||'Your account is being verified securely. This should only take a moment.'}</p>
      {!error&&<div className="auth-callback-progress"><span/><i/></div>}
      {error&&<div className="auth-callback-actions"><Link className="auth-callback-primary" href="/login"><RefreshCw size={16}/> Try signing in again</Link><Link className="auth-callback-secondary" href="/"><ArrowLeft size={16}/> Back to TOPPICKSTOCK</Link></div>}
      {!error&&<p className="auth-callback-footnote"><Check size={13}/> Your password stays with your sign-in provider</p>}
    </section>
    <p className="auth-callback-legal">TOPPICKSTOCK <span>·</span> A brighter market perspective</p>
  </main>;
}
