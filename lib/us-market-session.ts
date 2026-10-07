export function getUsScanWindow(date=new Date()):'regular'|'closing'|'closed'{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const part=(type:string)=>parts.find(item=>item.type===type)?.value;
 const weekday=part('weekday');
 const minute=Number(part('hour'))*60+Number(part('minute'));
 if(!['Mon','Tue','Wed','Thu','Fri'].includes(weekday??''))return 'closed';
 if(minute>=570&&minute<960)return 'regular';
 if(minute>=960&&minute<975)return 'closing';
 return 'closed';
}
