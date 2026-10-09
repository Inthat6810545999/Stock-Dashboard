'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,CheckCircle2} from 'lucide-react';
import {policyVersion} from '@/lib/legal';
import {getSupabaseBrowserClient,setRememberMePreference} from '@/lib/supabase-browser';

function GoogleMark(){return <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18Z"/><path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9A19.7 19.7 0 0 0 24 4 20 20 0 0 0 5.9 15l6.9 5.2c1.6-4.7 6-8.1 11.2-8.1Z"/></svg>}

export function AuthCard({mode}:{mode:'login'|'signup'}){
  const signup=mode==='signup';
  const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const [rememberMe,setRememberMe]=useState(true);
  async function continueWithGoogle(){
    const shouldRemember=signup||rememberMe;setRememberMePreference(shouldRemember);
    const supabase=getSupabaseBrowserClient(shouldRemember);if(!supabase){setError('Sign-in is temporarily unavailable. Please try again later.');return}
    setBusy(true);setError('');const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/auth/callback`}});if(error){setError(error.status===429?'Too many attempts. Please wait before trying again.':'Could not complete sign-in. Please check your email address and try again.');setBusy(false)}
  }
  async function continueWithEmail(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const shouldRemember=signup||rememberMe;setRememberMePreference(shouldRemember);
    const supabase=getSupabaseBrowserClient(shouldRemember);if(!supabase){setError('Sign-in is temporarily unavailable. Please try again later.');return}
    setBusy(true);setError('');setMessage('');const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:true,data:{terms_version:policyVersion,terms_acknowledged_at:new Date().toISOString()},emailRedirectTo:`${window.location.origin}/auth/callback`}});setBusy(false);if(error)setError(error.status===429?'Too many attempts. Please wait before trying again.':'Could not complete sign-in. Please check your email address and try again.');else setMessage(signup?'Check your email for a secure link to verify and finish creating your account.':'Check your email for a secure sign-in link.');
  }
  return <main className={`login-page${signup?' login-page--signup':''}`}><section className="login-card">
    <Link className="login-brand" href="/">✦ <span>MOONSTAR</span></Link>
    <h1>{signup?'Create your MOONSTAR account':'Log in to MOONSTAR'}</h1>
    <p className="login-subtitle">{signup?'Create an account to save your watchlist and access it anywhere.':'Save your watchlist and access it anywhere.'}</p>
    <button className="google-login" onClick={continueWithGoogle} disabled={busy}><GoogleMark/>Continue with Google</button>
    <div className="login-divider"><span>or</span></div>
    <form onSubmit={continueWithEmail}>
      <label className="sr-only" htmlFor="auth-email">Email address</label>
      <input id="auth-email" type="email" autoComplete="email" placeholder="Enter your email" required value={email} onChange={e=>setEmail(e.target.value)}/>
      {!signup&&<label className="remember-me"><input className="remember-me-input" type="checkbox" checked={rememberMe} onChange={e=>{setRememberMe(e.target.checked);setRememberMePreference(e.target.checked)}}/>Remember me</label>}
      <button className="email-login" disabled={busy||!email.trim()}>{busy?'Please wait…':signup?'Create account with email':'Continue'}</button>
    </form>
    <p className="auth-policy">By continuing, you agree to the <Link href="/terms">Terms</Link> and acknowledge the <Link href="/privacy">Privacy notice</Link>. Optional analytics is your choice.</p>
    {message&&<p className="login-success" role="status"><CheckCircle2 size={17}/>{message}</p>}
    {error&&<p className="login-error" role="alert">{error}</p>}
    <p className="login-signup">{signup?'Already have an account? ':'Don’t have an account? '}{signup?<Link href="/login">Log in</Link>:<Link href="/signup">Sign up</Link>}</p>
  </section><Link href="/" className="login-back"><ArrowLeft size={15}/> Back to dashboard</Link></main>
}
