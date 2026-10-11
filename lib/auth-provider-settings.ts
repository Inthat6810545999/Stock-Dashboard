// This endpoint exposes public provider availability, never provider credentials.
export async function googleSignInEnabled(url:string,key:string,request:typeof fetch=fetch){
 const response=await request(`${url.replace(/\/$/,'')}/auth/v1/settings`,{
  headers:{apikey:key},signal:AbortSignal.timeout(8000),cache:'no-store',
 });
 if(!response.ok)throw new Error('Auth provider settings unavailable');
 const settings:unknown=await response.json();
 if(!settings||typeof settings!=='object'||!('external' in settings))throw new Error('Invalid auth provider settings');
 const external=settings.external;
 if(!external||typeof external!=='object'||!('google' in external)||typeof external.google!=='boolean')throw new Error('Invalid Google provider setting');
 return external.google;
}
