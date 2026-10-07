import type {Point} from './market';

/**
 * Yahoo occasionally returns isolated intraday bars that make the sum exceed
 * its own full-session volume. Hide only extreme bars when the whole series is
 * inconsistent, and leave all price data untouched.
 */
export function filterIntradayVolumeOutliers(points:Point[],sessionVolume:number|null):Point[]{
 if(sessionVolume===null||!Number.isFinite(sessionVolume)||sessionVolume<=0)return points;
 const volumes=points.map(point=>typeof point.volume==='number'&&Number.isFinite(point.volume)?Math.max(0,point.volume):0);
 const total=volumes.reduce((sum,volume)=>sum+volume,0);
 if(total<=sessionVolume*1.5)return points;
 const rejected=new Set<number>();
 for(let index=0;index<volumes.length;index++){
  const neighbors=volumes.slice(Math.max(0,index-5),index).concat(volumes.slice(index+1,index+6)).filter(volume=>volume>0).sort((a,b)=>a-b);
  if(!neighbors.length)continue;
  const median=neighbors[Math.floor(neighbors.length/2)];
  if(volumes[index]>sessionVolume*.1&&volumes[index]>median*20)rejected.add(index);
 }
 if(!rejected.size)return points;
 return points.map((point,index)=>rejected.has(index)?{...point,volume:null}:point);
}
