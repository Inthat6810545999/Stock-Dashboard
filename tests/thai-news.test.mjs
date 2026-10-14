import test from 'node:test';
import assert from 'node:assert/strict';
import {parseThaiNews,thaiNewsSearchUrl} from '../lib/thai-news.ts';
const item=(title,url='https://news.google.com/rss/articles/test',date='Sat, 03 Oct 2020 03:00:00 GMT')=>`<item><title><![CDATA[${title} - Publisher]]></title><link>${url}</link><pubDate>${date}</pubDate><source>Publisher</source></item>`;
test('matches exact Thai ticker, not another company prefix',()=>{const news=parseThaiNews('<rss>'+item('หุ้น PTT กำไรโต')+item('หุ้น PTTGC กำไรโต')+'</rss>','PTT.BK');assert.equal(news.length,1);assert.equal(news[0].headline,'หุ้น PTT กำไรโต');assert.equal(news[0].source,'Publisher');});
test('rejects unsafe URLs, invalid dates, deduplicates headlines',()=>{const xml='<rss>'+item('PTT ข่าว')+item('PTT ข่าว')+item('PTT bad','javascript:alert(1)')+item('PTT invalid','https://news.google.com/test','bad')+'</rss>';assert.equal(parseThaiNews(xml,'PTT.BK').length,1);});
test('builds Thai financial query with ticker instead of Yahoo suffix',()=>{const url=new URL(thaiNewsSearchUrl('AOT.BK',true));assert.equal(url.hostname,'news.google.com');assert.match(url.searchParams.get('q'),/^"AOT"/);assert.equal(url.searchParams.get('hl'),'th');});
