export const membershipPlans={
 monthly:{amountThb:199,amountMinor:19900,interval:'month',label:'Monthly membership'},
 yearly:{amountThb:1990,amountMinor:199000,interval:'year',label:'Annual membership'},
} as const;

export type MembershipPlan=keyof typeof membershipPlans;

export function matchesMembershipPrice(plan:MembershipPlan,price:{active:boolean;type:string;currency:string;unit_amount:number|null;recurring:{interval:string}|null}){
 const expected=membershipPlans[plan];
 return price.active&&price.type==='recurring'&&price.currency==='thb'&&price.unit_amount===expected.amountMinor&&price.recurring?.interval===expected.interval;
}
