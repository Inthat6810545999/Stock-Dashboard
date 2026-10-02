'use client';
import {useState} from 'react';
import {businesses} from '@/lib/supply-chain';
export function StockLogo({symbol,large=false}:{symbol:string;large?:boolean}){
 const domain=businesses[symbol==='GOOG'?'GOOGL':symbol]?.domain;
 const [failed,setFailed]=useState('');
 return <span className={`stock-logo ${large?'large':''}`} aria-label={`${businesses[symbol]?.name||symbol} logo`}>{failed!==symbol?<img key={symbol} src={domain?`https://www.google.com/s2/favicons?domain=${domain}&sz=128`:`https://financialmodelingprep.com/image-stock/${encodeURIComponent(symbol)}.png`} alt="" onError={()=>setFailed(symbol)} referrerPolicy="no-referrer"/>:<span>{symbol.slice(0,2)}</span>}</span>;
}
