import YahooFinance from 'yahoo-finance2';

type SearchQuote={symbol?:unknown;exchange?:unknown;quoteType?:unknown;shortname?:unknown;longname?:unknown;exchDisp?:unknown};
type SearchResponse={quotes?:SearchQuote[]};
type SearchItem={symbol:string;name:string;exchange:string};
const cache=new Map<string,{until:number;data:SearchItem[]}>();

export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const query=(params.get('q')||'').trim().slice(0,60);
 const market=params.get('market')||'all';
 if(!query)return Response.json([]);
 if(!['all','us','th'].includes(market))return Response.json({error:'Invalid market'},{status:400});
 const key=`${market}:${query.toLowerCase()}`;
 const existing=cache.get(key);
 if(existing&&existing.until>Date.now())return Response.json(existing.data);
 try{
  const yahoo=new YahooFinance({suppressNotices:['yahooSurvey']});
  const queries=[query];
  if(market!=='us'&&/^[A-Z0-9-]{1,12}$/i.test(query))queries.push(`${query}.BK`);
  const responses=await Promise.allSettled(queries.map(value=>yahoo.search(value,{quotesCount:30,newsCount:0},{validateResult:false})));
  if(responses.every(response=>response.status==='rejected'))throw Error('Search unavailable');
  const quotes=responses.flatMap(response=>response.status==='fulfilled'?((response.value as SearchResponse).quotes??[]):[]);
  const allowedExchanges=new Set(['NMS','NYQ','NGM','NCM','ASE','BTS','PCX']);
  const results=[...new Map(quotes.filter((quote):quote is SearchQuote&{symbol:string;exchange:string;quoteType:'EQUITY'}=>{
   if(typeof quote.symbol!=='string'||typeof quote.exchange!=='string'||quote.quoteType!=='EQUITY')return false;
   const thai=quote.symbol.endsWith('.BK');
   const us=allowedExchanges.has(quote.exchange);
   return market==='th'?thai:market==='us'?us:thai||us;
  }).map(quote=>[quote.symbol,{symbol:quote.symbol,name:typeof quote.shortname==='string'?quote.shortname:typeof quote.longname==='string'?quote.longname:quote.symbol,exchange:quote.symbol.endsWith('.BK')?'Thailand · THB':`${typeof quote.exchDisp==='string'?quote.exchDisp:quote.exchange} · USD`}])).values()].slice(0,15);
  cache.set(key,{until:Date.now()+300000,data:results});
  return Response.json(results);
 }catch{return Response.json({error:'Search is temporarily unavailable. Please try again.'},{status:503})}
}
