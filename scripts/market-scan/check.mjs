import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
for(const market of ['us','th']){
 const data=JSON.parse(await readFile(new URL(`../../data/must-watch-${market}.json`,import.meta.url),'utf8'));
 const s=data.scan;
 assert.equal(s.status,'complete');assert.equal(s.processed,s.total);assert.equal(s.eligible+s.excluded+s.missing+s.failed,s.total);
 assert.ok(s.total>=(market==='us'?3000:600));
 for(const [key,minimum] of [['items',1e9],['allSizes',0]]){
  const rows=data[key];assert.ok(rows.length<=10);assert.equal(new Set(rows.map(r=>r.symbol)).size,rows.length);
  for(const [i,r] of rows.entries()){
   assert.ok([r.price,r.pe,r.forwardPe,r.salesGrowth,r.score].every(Number.isFinite));assert.ok(r.price>0&&r.pe>0&&r.pe<=25&&r.forwardPe>0&&r.forwardPe<=25&&r.salesGrowth>=.1);
   if(minimum)assert.ok(r.marketCap>=minimum);
   assert.ok(Math.abs(r.score-r.salesGrowth*100/r.forwardPe)<1e-8);
   if(i)assert.ok(rows[i-1].score>=r.score);
  }
 }
 const ps=data.priceScan;assert.equal(ps.status,'complete');assert.equal(ps.total,s.total);assert.equal(ps.processed,ps.total);assert.equal(ps.eligible+ps.excluded+ps.missing+ps.failed,ps.total);
 assert.ok(data.priceGainers.length<=10);assert.equal(new Set(data.priceGainers.map(r=>r.symbol)).size,data.priceGainers.length);
 for(const [i,r] of data.priceGainers.entries()){assert.ok(r.startPrice>0&&r.price>0&&r.endTime>r.startTime&&Number.isFinite(r.percent)&&r.percent>0);assert.ok(Math.abs(r.percent-(r.price/r.startPrice-1)*100)<1e-8);if(i)assert.ok(data.priceGainers[i-1].percent>=r.percent)}
 console.log(`PASS ${market}: ${s.processed}/${s.total} processed, coverage reconciled, both rankings verified`);
}
