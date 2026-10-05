import test from 'node:test';
import assert from 'node:assert/strict';
import {createEventHistoryProvider,eventProviderSymbol,parseEarningsHistory,parseDividendHistory} from '../lib/event-history-provider.ts';
import {mergeCorporateEvents,attachEarningsResults} from '../lib/corporate-events.ts';
const history={'2026-06-30':{date:'2026-06-30',reportDate:'2026-07-21',epsActual:2,epsEstimate:1},'2026-03-31':{date:'2026-03-31',reportDate:'2026-04-21',epsActual:null,epsEstimate:null}};
const divs=[{date:'2026-09-01',paymentDate:'2026-09-20',value:1.5,currency:'THB'}];
test('maps arbitrary US, class shares, and Thai symbols without a stock allowlist',()=>{
 assert.equal(eventProviderSymbol('NVDA'),'NVDA.US');assert.equal(eventProviderSymbol('BRK.B'),'BRK-B.US');assert.equal(eventProviderSymbol('PTT.BK'),'PTT.BK');assert.throws(()=>eventProviderSymbol('../secret'));
});
test('keeps all reports, uses announcement dates, and never replaces missing EPS with zero',()=>{
 const events=parseEarningsHistory(history);assert.equal(events.length,2);assert.equal(new Date(events[0].time).toISOString().slice(0,10),'2026-04-21');assert.equal(events[0].epsActual,undefined);assert.equal(events[1].epsActual,2);
 assert.throws(()=>parseEarningsHistory({a:{date:'2026-06-30'}}));assert.throws(()=>parseEarningsHistory({a:{reportDate:'2026-02-30'}}));assert.throws(()=>parseEarningsHistory({error:'Forbidden'}));assert.deepEqual(parseEarningsHistory({}),[]);
});
test('dividends use ex-date, preserve currency, and reject malformed responses',()=>{
 const e=parseDividendHistory(divs)[0];assert.equal(new Date(e.time).toISOString().slice(0,10),'2026-09-01');assert.equal(e.amount,1.5);assert.equal(e.currency,'THB');assert.throws(()=>parseDividendHistory({error:'denied'}));assert.deepEqual(parseDividendHistory([]),[]);
});
test('merges repeated dates across sources without hiding E next to D or overwriting paired EPS',()=>{
 const e=parseEarningsHistory(history)[1];const duplicate={...e,dateOnly:false,time:Date.parse('2026-07-21T20:00:00Z'),epsActual:3};
 const result=mergeCorporateEvents('America/New_York',[e],[duplicate,{...e,kind:'D'}]);assert.equal(result.length,2);assert.equal(result[0].epsActual,2);
 assert.equal(attachEarningsResults([e],[{quarter:'2026-06-30',epsActual:5,epsEstimate:4}])[0].epsActual,2);
});
test('missing key performs no requests and exposes a configuration status',async()=>{
 const p=createEventHistoryProvider(async()=>{throw Error('must not call');});assert.equal((await p('PTT.BK')).earnings,'not-configured');
});
test('fetches full histories once per symbol across concurrent callers and caches both feeds',async()=>{
 const calls=[];const p=createEventHistoryProvider(async(url)=>{calls.push(url);return Response.json(url.pathname.includes('/div/')?divs:history);});
 const [a,b]=await Promise.all([p('PTT.BK','test-token'),p('PTT.BK','test-token')]);assert.equal(calls.length,2);assert.equal(a.events.length,3);assert.deepEqual(a,b);await p('PTT.BK','test-token');assert.equal(calls.length,2);
 assert.equal(calls.find(u=>u.pathname.includes('fundamentals')).searchParams.get('filter'),'Earnings::History');assert.equal(a.earnings,'available');assert.equal(a.dividends,'available');assert.ok(!JSON.stringify(a).includes('test-token'));
});
test('provider denial preserves the independent dividend feed and retries after backoff',async()=>{
 let time=0,calls=0;const p=createEventHistoryProvider(async(url)=>{calls++;return url.pathname.includes('/div/')?Response.json(divs):new Response('denied',{status:403});},()=>time);
 const a=await p('NVDA','test-token');assert.equal(a.earnings,'unavailable');assert.equal(a.dividends,'available');assert.equal(a.events.length,1);await p('NVDA','test-token');assert.equal(calls,2);time=300001;await p('NVDA','test-token');assert.equal(calls,4);
});
test('network failures return no invented events or secrets',async()=>{
 const p=createEventHistoryProvider(async()=>{throw Error('https://example.test/?api_token=test-token');});const a=await p('AAPL','test-token');assert.equal(a.earnings,'unavailable');assert.equal(a.dividends,'unavailable');assert.deepEqual(a.events,[]);assert.ok(!JSON.stringify(a).includes('test-token'));
});
