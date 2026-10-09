import 'server-only';
import {createClient, type User} from '@supabase/supabase-js';
import Stripe from 'stripe';

export const privateHeaders={'Cache-Control':'private, no-store'};
export function json(body:unknown,status=200){return Response.json(body,{status,headers:privateHeaders})}

export async function getSignedInUser(request:Request):Promise<{user:User;token:string;url:string;key:string}|{response:Response}>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return {response:json({error:'Membership services are temporarily unavailable.'},503)};
 const token=request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1];
 if(!token)return {response:json({error:'Sign in to manage membership.'},401)};
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data,error}=await client.auth.getUser(token);
 if(error||!data.user)return {response:json({error:'Your session is no longer valid. Please sign in again.'},401)};
 return {user:data.user,token,url,key};
}

export function getStripe(){
 const secret=process.env.STRIPE_SECRET_KEY;
 if(!secret)return null;
 return new Stripe(secret);
}

export function getAdmin(url=process.env.NEXT_PUBLIC_SUPABASE_URL){
 const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return null;
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export function checkoutReady(plan?:'monthly'|'yearly'){
 const stripeSecret=process.env.STRIPE_SECRET_KEY;
 const secretIsTest=Boolean(stripeSecret?.startsWith('sk_test_'));
 const liveExplicitlyEnabled=process.env.BILLING_LIVE_CHARGING_ENABLED==='true';
 const stripeKeyAllowed=secretIsTest||Boolean(stripeSecret?.startsWith('sk_live_')&&liveExplicitlyEnabled);
 const priceReady=plan
  ?Boolean(plan==='monthly'?process.env.STRIPE_PRICE_MONTHLY:process.env.STRIPE_PRICE_YEARLY)
  :Boolean(process.env.STRIPE_PRICE_MONTHLY&&process.env.STRIPE_PRICE_YEARLY);
 return process.env.BILLING_CHECKOUT_ENABLED==='true'&&stripeKeyAllowed&&Boolean(getAdmin())&&priceReady;
}

export function sameOriginJsonRequest(request:Request){
 return request.headers.get('origin')===new URL(request.url).origin&&Boolean(request.headers.get('content-type')?.toLowerCase().startsWith('application/json'));
}

export function epochToIso(seconds:number|null|undefined){return seconds?new Date(seconds*1000).toISOString():null}

export function subscriptionPlan(priceIds:string[]):'monthly'|'yearly'|null{
 if(priceIds.length!==1)return null;
 if(priceIds[0]===process.env.STRIPE_PRICE_MONTHLY)return 'monthly';
 if(priceIds[0]===process.env.STRIPE_PRICE_YEARLY)return 'yearly';
 return null;
}
