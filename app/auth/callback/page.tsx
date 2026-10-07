'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';

export default function AuthCallbackPage(){
  const router=useRouter();const [error,setError]=useState('');
  useEffect(()=>{let active=true;async function finish(){const supabase=getSupabaseBrowserClient();if(!supabase){setError('Supabase login is not configured.');return}const code=new URLSearchParams(window.location.search).get('code');if(!code){router.replace('/');return}const {error}=await supabase.auth.exchangeCodeForSession(code);if(!active)return;if(error)setError(error.message);else router.replace('/')}void finish();return()=>{active=false}},[router]);
  return <main style={{minHeight:'100dvh',display:'grid',placeItems:'center',padding:24,background:'#101c30',color:'#f3e6cb',fontFamily:'Inter,Arial,sans-serif'}}><p>{error?`Could not finish sign in: ${error}`:'Finishing sign in…'}</p></main>
}
