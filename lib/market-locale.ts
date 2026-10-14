export const validUsSymbol=(symbol:string)=>/^[A-Z][A-Z0-9-]{0,9}(?:\.[A-Z])?$/.test(symbol);
export const validThSymbol=(symbol:string)=>/^[A-Z0-9][A-Z0-9-]{0,11}\.BK$/.test(symbol);
export const validSymbol=(symbol:string)=>validUsSymbol(symbol)||validThSymbol(symbol);
export function marketLocale(symbol:string){const thai=validThSymbol(symbol.toUpperCase());return {thai,currency:thai?'THB':'USD',timeZone:thai?'Asia/Bangkok':'America/New_York',zoneLabel:thai?'ICT':'ET',city:thai?'Bangkok':'New York',market:thai?'Thailand':'US'};}
export function formatMoney(value:number|null,currency='USD'){return value===null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency,currencyDisplay:'narrowSymbol',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);}

export const displayTimeZone='Asia/Bangkok';
export function thaiTimestamp(time:number){return new Date(time).toLocaleString('en-GB',{timeZone:displayTimeZone,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})}
