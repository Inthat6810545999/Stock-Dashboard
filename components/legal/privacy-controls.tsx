"use client";
import {useEffect,useState} from 'react';
import {Analytics} from '@vercel/analytics/next';
import Link from 'next/link';
import './legal.css';
const key='moonstar_privacy_v1';
function allowed(){try{return JSON.parse(localStorage.getItem(key)||'null')?.analytics===true}catch{return false}}
export function PrivacyControls(){
 const [ready,setReady]=useState(false),[open,setOpen]=useState(false),[analytics,setAnalytics]=useState(false);
 useEffect(()=>{const load=()=>{setAnalytics(allowed());try{setOpen(!localStorage.getItem(key))}catch{setOpen(true)}setReady(true)};queueMicrotask(load);window.addEventListener('storage',load);const show=()=>setOpen(true);window.addEventListener('moonstar-open-privacy',show);return()=>{window.removeEventListener('storage',load);window.removeEventListener('moonstar-open-privacy',show)}},[]);
 function choose(allow:boolean){try{localStorage.setItem(key,JSON.stringify({version:1,analytics:allow,updatedAt:new Date().toISOString()}))}catch{/* Optional analytics stays off if the choice cannot be saved. */}setAnalytics(allow&&allowed());setOpen(false)}
 return <>{ready&&analytics&&<Analytics beforeSend={event=>allowed()?event:null}/>}<button className="privacy-settings" onClick={()=>setOpen(true)} aria-expanded={open}>Privacy settings</button>{ready&&open&&<section className="privacy-panel" aria-label="Privacy preferences"><p>Essential storage keeps your login and watchlist working. Optional analytics helps improve MOONSTAR and starts only with your permission. <Link href="/privacy">Read privacy notice</Link></p><div className="privacy-panel-actions"><button onClick={()=>choose(false)}>Essential only</button><button onClick={()=>choose(true)}>Allow analytics</button></div></section>}</>;
}
