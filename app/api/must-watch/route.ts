import us from '@/data/must-watch-us.json';
import th from '@/data/must-watch-th.json';
// Daily scanner publishes durable snapshots. Page requests never fan out across a market.
export async function GET(request:Request){
 const market=new URL(request.url).searchParams.get('market')==='th'?'th':'us';
 const result=market==='th'?th:us;
 return Response.json({...result,stale:!result.updatedAt||Date.now()-result.updatedAt>36*3600000},{headers:{'Cache-Control':'public, max-age=60'}});
}
