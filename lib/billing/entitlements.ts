export type MembershipRecord={status:string;current_period_end:string|null;billing_attention_required:boolean;trial_end?:string|null};

/** Access is derived from server-synced provider state, never browser metadata. */
export function hasMembershipEntitlement(record:MembershipRecord|null,now=Date.now(),allowTrials=false){
 if(!record||record.billing_attention_required)return false;
 if(record.status==='active'){
  const end=record.current_period_end?Date.parse(record.current_period_end):NaN;
  return Number.isFinite(end)&&now<end;
 }
 if(record.status==='trialing'&&allowTrials){
  const end=record.trial_end?Date.parse(record.trial_end):NaN;
  return Number.isFinite(end)&&now<end;
 }
 return false;
}
