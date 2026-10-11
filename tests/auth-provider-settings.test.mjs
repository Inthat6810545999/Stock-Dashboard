import {test} from 'node:test';
import assert from 'node:assert/strict';
import {googleSignInEnabled} from '../lib/auth-provider-settings.ts';

test('checks the public provider endpoint using the public key',async()=>{
 let received;
 const available=await googleSignInEnabled('https://preview.example/', 'public-key',async(url,options)=>{
  received={url,options};
  return Response.json({external:{google:true,email:true}});
 });
 assert.equal(available,true);
 assert.equal(received.url,'https://preview.example/auth/v1/settings');
 assert.equal(received.options.headers.apikey,'public-key');
 assert.equal(received.options.cache,'no-store');
});

test('disabled Google leaves email sign-in available',async()=>{
 assert.equal(await googleSignInEnabled('https://preview.example','public-key',async()=>Response.json({external:{google:false,email:true}})),false);
});

test('provider service failures do not authorize an OAuth redirect',async()=>{
 await assert.rejects(googleSignInEnabled('https://preview.example','public-key',async()=>new Response('',{status:503})));
 await assert.rejects(googleSignInEnabled('https://preview.example','public-key',async()=>{throw new Error('network unavailable')}));
});

test('missing or malformed provider settings are not treated as enabled',async()=>{
 for(const settings of [{},null,{external:{google:'true'}},{external:{email:true}}]){
  await assert.rejects(googleSignInEnabled('https://preview.example','public-key',async()=>Response.json(settings)));
 }
});
