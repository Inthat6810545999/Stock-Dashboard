'use client';
import {useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {formatMoney,thaiTimestamp} from '@/lib/market-locale';
import {earningsOutcome,type CorporateEvent} from '@/lib/corporate-events';
import type {Point} from '@/lib/market';
export function ChartEvents({events,points,left,right,session,currency}:{events:CorporateEvent[];points:Point[];left:number;right:number;session:{start:number;end:number}|null;currency:string}){
 const [selected,setSelected]=useState<CorporateEvent[]|null>(null);
 if(!points.length)return null;
 const start=session?.start??points[0].time,end=session?.end??points.at(-1)!.time;
 const eventDate=(e:CorporateEvent)=>e.dateOnly?new Date(e.time).toLocaleDateString('en-GB',{timeZone:'Asia/Bangkok'}):`${thaiTimestamp(e.time)} ICT`;
 const day=(t:number)=>new Date(t).toISOString().slice(0,10);
 const visible=events.filter(e=>session?day(e.time)===day(start):e.time>=start-86400000&&e.time<=end+86400000);
 const position=(time:number)=>{if(session)return left+Math.max(0,Math.min(1,(time-start)/(end-start)))*(right-left);let i=points.findIndex(p=>p.time>=time);if(i<0)i=points.length-1;const prior=Math.max(0,i-1),span=points[i].time-points[prior].time;const index=span?prior+Math.max(0,Math.min(1,(time-points[prior].time)/span)):i;return left+index/Math.max(1,points.length-1)*(right-left)};
 const groups:{x:number;items:CorporateEvent[]}[]=[];
 for(const event of visible){const x=Math.max(left+11,Math.min(right-11,position(event.time)));const group=groups.find(g=>Math.abs(g.x-x)<24);if(group)group.items.push(event);else groups.push({x,items:[event]});}
 const upcoming=events.filter(e=>e.kind!=='E'&&e.time>end&&e.time>Date.now()).slice(0,2);
 return <><div className="chart-event-markers">{groups.flatMap((group,i)=>group.items.map((event,j)=><button key={`${i}-${j}`} className={`chart-event event-${event.kind} outcome-${earningsOutcome(event)}`} style={{left:Math.max(left+8,Math.min(right-8,group.x+(j-(group.items.length-1)/2)*12)),zIndex:event.kind==='E'?4:3}} onClick={()=>setSelected([event])} aria-label={`${event.label} · ${eventDate(event)}`} title={`${event.label} · ${eventDate(event)}`}><span>{event.kind}</span></button>))}</div>{upcoming.length>0&&<div className="chart-next-events">{upcoming.map((e,i)=><button key={i} onClick={()=>setSelected([e])}>Next {e.kind} · {new Date(e.time).toLocaleDateString('en-GB',{day:'2-digit',month:'short',timeZone:'Asia/Bangkok'})}</button>)}</div>}<Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null)}}><DialogContent><DialogTitle>Company events</DialogTitle><DialogDescription>Company announcements, Alpha Vantage, SET and Yahoo Finance · Bangkok dates (ICT). Historical earnings coverage varies by company.</DialogDescription>{selected?.map((e,i)=><div key={i} className="event-detail"><strong>{e.kind} · {e.label}{e.estimated?' (estimated)':''}</strong>{e.kind==='E'&&<p>{earningsOutcome(e)==='unknown'?'EPS comparison unavailable':`EPS actual ${e.epsActual} · estimate ${e.epsEstimate} · ${earningsOutcome(e)==='beat'?'Beat estimate':'Did not beat estimate'}`}</p>}<p>{e.dateOnly?new Date(e.time).toLocaleDateString('en-GB',{timeZone:'Asia/Bangkok'}):`${thaiTimestamp(e.time)} ICT`}</p>{e.sourceUrl&&<a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">{e.source} ↗</a>}{e.amount!==undefined&&<p>Cash dividend: {formatMoney(e.amount,e.currency??currency)} per share</p>}{e.kind==='D'&&<p>Ex-dividend date, not the payment date.</p>}</div>)}</DialogContent></Dialog></>;
}
