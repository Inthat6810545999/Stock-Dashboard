import {businesses,networkFor} from './supply-chain';
import {aiStages,aiFlows,phaseNames,type ChainStage} from './ai-supply-chain';
export function ecosystemFor(symbol:string,name:string,industry=false,currentOnly=true){
 const canonical=symbol==='GOOG'?'GOOGL':symbol==='PSTG'?'P':symbol;
 if(industry)return {title:'AI industry ecosystem',phases:phaseNames,stages:aiStages,flows:aiFlows,tour:aiStages.map(s=>s.id),kind:'industry' as const};
 const discovered=networkFor(canonical);
 const network={...discovered,incoming:discovered.incoming.filter(l=>!currentOnly||l.evidenceStatus==='recent-disclosure'),outgoing:discovered.outgoing.filter(l=>!currentOnly||l.evidenceStatus==='recent-disclosure')};
 const center:ChainStage={id:'company',name:network.company?.name||name,subtitle:canonical,phase:2,x:600,y:210,icon:'factory',companies:network.company?[canonical]:[],description:`${network.company?.name||name} is the focal company. The surrounding layers show only relationships with individual disclosure sources. Missing links mean coverage has not yet been researched, not that the business has no suppliers or customers.`,output:network.company?.role||'Business activities not yet researched',watch:'Review issuer filings and official disclosures before relying on a relationship.',source:[...network.incoming,...network.outgoing].map(l=>({title:`${l.publisher} · ${l.date} · ${l.reviewedAt?'Reviewed '+l.reviewedAt:'Historical — not reconfirmed'}`,url:l.source}))};
 const stages:ChainStage[]=[center];const flows:{from:string;to:string;label:string}[]=[];
 for(const [side,links] of [['inputs',network.incoming],['outputs',network.outgoing]] as const){
  const grouped=links.reduce<Record<string,typeof links>>((acc,l)=>{(acc[l.kind]??=[]).push(l);return acc},{});
  Object.entries(grouped).forEach(([kind,edges],index)=>{
   const id=`${side}-${kind}`;const inbound=side==='inputs';
   stages.push({id,name:kind==='partner'?'Business partnerships':inbound?'Suppliers & technology':'Customers & deployment',subtitle:kind==='partner'?'Disclosed partnerships':'Disclosed company relationships',phase:inbound?0:4,x:inbound?120:1080,y:85+index*125,icon:kind==='partner'?'network':'layers',companies:[...new Set(edges.map(l=>inbound?l.from:l.to))],description:edges.map(l=>`${businesses[inbound?l.from:l.to]?.name}: ${l.detail}`).join('\n\n'),output:edges.map(l=>l.label).join(' · '),watch:'Disclosures are historical evidence. Current contract volumes and continued activity may not be publicly available.',source:edges.map(l=>({title:`${l.publisher} · ${l.date} · ${l.reviewedAt?'Reviewed '+l.reviewedAt:'Historical — not reconfirmed'}`,url:l.source}))});
   flows.push({from:inbound?id:'company',to:inbound?'company':id,label:kind});
  });
 }
 return {title:'Company supply ecosystem',phases:['Inputs','Enabling layers','Selected business','Distribution','Deployment & partners'],stages,flows,tour:stages.map(s=>s.id),kind:'company' as const};
}

/** Publication dates are separate from the date a source was reviewed. */
export function evidenceDatesFor(symbol:string,currentOnly=true){
 const network=networkFor(symbol);
 const links=[...network.incoming,...network.outgoing].filter(l=>!currentOnly||l.evidenceStatus==='recent-disclosure');
 const dates=links.map(l=>l.date).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
 const reviews=links.flatMap(l=>l.reviewedAt?[l.reviewedAt]:[]).sort();
 return {latestPublication:dates.at(-1)||null,lastReviewed:reviews.at(-1)||null,undatedSources:links.filter(l=>!/^\d{4}-\d{2}-\d{2}$/.test(l.date)).length};
}
