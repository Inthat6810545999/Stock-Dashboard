import {createClient, type SupabaseClient} from '@supabase/supabase-js';

const rememberKey='moonstar_auth_remember';
const clients:Partial<Record<'remember'|'session',SupabaseClient>>={};

export function getRememberMePreference(){
  try{return window.localStorage.getItem(rememberKey)!=='false'}catch{return true}
}

export function setRememberMePreference(remember:boolean){
  try{window.localStorage.setItem(rememberKey,String(remember))}catch{/* Storage may be unavailable; keep the current page choice. */}
}

function createTabStorage():Pick<Storage,'getItem'|'setItem'|'removeItem'>{
  const storageFor=(key:string)=>key.endsWith('-code-verifier')?window.localStorage:window.sessionStorage;
  return{
    getItem(key){return storageFor(key).getItem(key)},
    setItem(key,value){storageFor(key).setItem(key,value)},
    removeItem(key){storageFor(key).removeItem(key)},
  }
}

export function getSupabaseBrowserClient(remember=getRememberMePreference()){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return null;
  const mode=remember?'remember':'session';
  if(!clients[mode]){
    const projectRef=new URL(url).hostname.split('.')[0];
    const storageKey=`sb-${projectRef}-auth-token${remember?'':'-session'}`;
    clients[mode]=createClient(url,key,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey,storage:remember?window.localStorage:createTabStorage()}});
  }
  return clients[mode];
}
