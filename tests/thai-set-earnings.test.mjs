import test from 'node:test';
import assert from 'node:assert/strict';
import {parseThaiSetEarnings} from '../lib/thai-set-event-parser.ts';
const payload={news_info_list:[
 {id:'1',symbol:'PTT',news_datetime:'2026-08-13T17:54:00+07:00',headline:'Financial Performance Quarter 2 (F45) (Reviewed)',url:'/en/market/news-and-alert/newsdetails?id=1&symbol=PTT'},
 {id:'2',symbol:'PTT',news_datetime:'2026-08-13T17:54:00+07:00',headline:'Management Discussion and Analysis Quarter 2 Ending 30 Jun 2026'},
 {id:'3',symbol:'PTT',news_datetime:'2026-08-14T08:00:00+07:00',headline:'Financial Statement Quarter 2/2026 (Reviewed)'},
 {id:'4',symbol:'PTTGC',news_datetime:'2026-05-10T10:00:00+07:00',headline:'Financial Performance Quarter 1 (F45)'},
 {id:'5',symbol:'PTT',news_datetime:'2026-05-14T10:00:00+07:00',headline:'Financial Performance Quarter 1 (F45)',url:'/en/market/news-and-alert/newsdetails?id=5&symbol=PTT'}
]};
test('uses published financial-results announcement dates only, filters ticker and deduplicates same day',()=>{
 const events=parseThaiSetEarnings(payload,'PTT');assert.equal(events.length,2);assert.deepEqual(events.map(e=>new Date(e.time).toISOString().slice(0,10)),['2026-05-14','2026-08-13']);assert.ok(events.every(e=>e.kind==='E'&&e.dateOnly));assert.ok(events.every(e=>e.sourceUrl?.startsWith('https://www.set.or.th/')));
});
test('rejects invalid payload and unsafe source links',()=>{
 assert.throws(()=>parseThaiSetEarnings({error:'blocked'},'PTT'));const p={news_info_list:[{symbol:'PTT',news_datetime:'2026-08-13',headline:'Financial Performance Quarter 2 (F45)',url:'https://evil.test/x'}]};assert.equal(parseThaiSetEarnings(p,'PTT')[0].sourceUrl,undefined);
});

test('parses official issuer relations archives for F45 and operating result announcements',async()=>{
 const {parseThaiIrEarnings}=await import('../lib/thai-set-event-parser.ts');
 const html='<a class="card card--news"><div class="card__date">13 Aug 2026</div><div class="card__detail">Financial Performance Quarter 2 (F45) (Reviewed)</div></a><a><div class="card__date">13 Aug 2026</div><div class="card__detail">Announcement of PTT financial statements and operating results</div></a><a class="card card--news"><div class="card__date">14 Aug 2026</div><div class="card__detail">Financial Statement Quarter 2/2026 (Reviewed)</div></a>';
 const events=parseThaiIrEarnings(html,'https://investor.pttplc.com/en/newsroom/set-announcements?year=2026&page=1');assert.equal(events.length,1);assert.equal(new Date(events[0].time).toISOString().slice(0,10),'2026-08-13');
});
