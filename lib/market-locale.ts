// Public stock tools currently cover US-listed equity tickers only.
export const validUsSymbol=(symbol:string)=>/^[A-Z][A-Z0-9-]{0,9}(?:\.[A-Z])?$/.test(symbol);
export function marketLocale(symbol:string){void symbol;return {currency:'USD',timeZone:'America/New_York',zoneLabel:'ET',city:'New York',market:'US'};}
export function formatMoney(value:number|null,currency='USD'){return value===null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency,currencyDisplay:'narrowSymbol',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);}

export const displayTimeZone='Asia/Bangkok';
export function thaiTimestamp(time:number){return new Date(time).toLocaleString('en-GB',{timeZone:displayTimeZone,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})}
