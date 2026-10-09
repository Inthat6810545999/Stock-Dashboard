import assert from 'node:assert/strict';
import {GET,DELETE} from '../app/api/account/route.ts';
process.env.NEXT_PUBLIC_SUPABASE_URL='https://moonstar-test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='test-public-key';
process.env.SUPABASE_SERVICE_ROLE_KEY='test-admin-key';
const originalFetch=globalThis.fetch;
const calls=[];
let valid=true;
let authTimestamp=Date.now();
function token(time=Date.now()){return 'header.'+Buffer.from(JSON.stringify({amr:[{method:'oauth',timestamp:Math.floor(time/1000)}]})).toString('base64url')+'.signature'}
globalThis.fetch=async(input,init={})=>{
 const url=String(input);calls.push({url,method:init.method??'GET'});
 if(url.includes('/auth/v1/user'))return Response.json(valid?{id:'11111111-1111-4111-8111-111111111111',email:'owner@example.test',created_at:'2026-10-01T00:00:00Z',last_sign_in_at:new Date(authTimestamp).toISOString(),app_metadata:{provider:'google'},user_metadata:{},aud:'authenticated'}:{message:'Invalid token'},{status:valid?200:401});
 if(url.includes('/rest/v1/watchlists')){assert.match(url,/user_id=eq.11111111-1111-4111-8111-111111111111/);return Response.json({stocks:[{symbol:'AAPL',name:'Apple'}],updated_at:'2026-10-10T00:00:00Z'})}
 if(url.includes('/auth/v1/logout'))return new Response(null,{status:204});
 if(url.includes('/auth/v1/admin/users/11111111-1111-4111-8111-111111111111'))return Response.json({id:'11111111-1111-4111-8111-111111111111'});
 throw Error('Unexpected outbound request: '+url);
};
const req=(method,body={confirmation:'DELETE'},jwt=token(),origin='http://localhost:3000')=>new Request('http://localhost:3000/api/account',{method,headers:{Authorization:'Bearer '+jwt,Origin:origin,'Content-Type':'application/json'},...(method==='DELETE'?{body:JSON.stringify(body)}:{})});
try{
 assert.equal((await GET(new Request('http://localhost:3000/api/account'))).status,401);
 valid=false;assert.equal((await GET(req('GET'))).status,401);valid=true;
 let response=await GET(req('GET'));assert.equal(response.status,200);const data=await response.json();assert.equal(data.account.email,'owner@example.test');assert.equal(data.watchlist[0].symbol,'AAPL');assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(JSON.stringify(data).includes('signature'),false);
 assert.equal((await DELETE(req('DELETE',undefined,token(),'https://attacker.test'))).status,403);
 assert.equal((await DELETE(req('DELETE',{confirmation:'anything'}))).status,400);
 assert.equal((await DELETE(req('DELETE',undefined,token(Date.now()-11*60*1000)))).status,403);
 authTimestamp=Date.now()-11*60*1000;assert.equal((await DELETE(req('DELETE'))).status,403);authTimestamp=Date.now();
 delete process.env.SUPABASE_SERVICE_ROLE_KEY;assert.equal((await DELETE(req('DELETE'))).status,503);process.env.SUPABASE_SERVICE_ROLE_KEY='test-admin-key';
 response=await DELETE(req('DELETE'));assert.equal(response.status,200);assert.equal((await response.json()).deleted,true);
 const revoke=calls.findIndex(call=>call.url.includes('/auth/v1/logout'));const deletion=calls.findIndex(call=>call.url.includes('/auth/v1/admin/users/'));assert.ok(revoke>=0&&deletion>revoke);
 console.log('Account API checks passed: authenticated export, own-user scope, origin, confirmation, recent session authentication, configuration and revoke-before-delete.');
}finally{globalThis.fetch=originalFetch}
