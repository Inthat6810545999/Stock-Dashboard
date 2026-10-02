/** Preserve the provider's reporting window in the listing's local calendar dates. */
export function earningsSchedule(earnings: {earningsDate?: unknown[];isEarningsDateEstimate?: boolean}|undefined, now=new Date(), timeZone='America/New_York') {
  const isoDay=(date:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  const today=isoDay(now);
  const days=[...new Set((earnings?.earningsDate??[]).flatMap(value=>{
    if(!(value instanceof Date)&&typeof value!=='string'&&typeof value!=='number')return [];
    const date=new Date(typeof value==='number'&&value<1e12?value*1000:value);
    if(!Number.isFinite(date.getTime()))return [];
    const day=isoDay(date);return day>=today?[day]:[];
  }))].sort();
  return {reportDate:days[0]??null,reportDateEnd:days.length>1?days[days.length-1]:null,reportDateEstimated:earnings?.isEarningsDateEstimate!==false};
}
export function displayReportDate(day:string){const [year,month,date]=day.split('-');return `${date}/${month}/${year}`;}
