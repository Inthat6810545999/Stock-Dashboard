import assert from "node:assert/strict";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createAlphaEarnings,parseAlphaEarnings} from "../lib/alpha-earnings.ts";

const payload={quarterlyEarnings:[
 {fiscalDateEnding:"2026-06-30",reportedDate:"2026-08-04",reportedEPS:"1.05",estimatedEPS:"0.98"},
 {fiscalDateEnding:"2026-03-31",reportedDate:"2026-05-05",reportedEPS:"0.92",estimatedEPS:"0.88"},
 {fiscalDateEnding:"2025-12-31",reportedDate:"2026-02-03",reportedEPS:"0.83",estimatedEPS:"0.79"}
]};
const events=parseAlphaEarnings(payload,"NVDA");
assert.equal(events.length,3);
assert.deepEqual(events.map(e=>new Date(e.time).toISOString().slice(0,10)),["2026-02-03","2026-05-05","2026-08-04"]);
assert.equal(events.at(-1).epsActual,1.05);
assert.equal(events.at(-1).epsEstimate,0.98);
console.log("alpha earnings marker test: 4 assertions passed");

const temporary=await mkdtemp(join(tmpdir(),"alpha-earnings-test-"));
try{
 const blockedDirectory=join(temporary,"not-a-directory");
 await writeFile(blockedDirectory,"file");
 let requests=0;
 const get=createAlphaEarnings({directory:blockedDirectory,fetcher:async()=>{requests++;return new Response(JSON.stringify({symbol:"NVDA",quarterlyEarnings:[{fiscalDateEnding:"2026-06-30",reportedDate:"2026-08-04",reportedEPS:"1.05",estimatedEPS:"0.98"}]}));}});
 const first=await get("NVDA","test-key");
 const cached=await get("NVDA","test-key");
 assert.equal(first.earnings,"available");
 assert.equal(first.events.length,1);
 assert.equal(cached.earnings,"available");
 assert.equal(requests,1);
 console.log("alpha earnings memory fallback test: 4 assertions passed");
}finally{await rm(temporary,{recursive:true,force:true});}
