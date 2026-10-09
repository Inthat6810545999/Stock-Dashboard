import {writeFile,mkdir} from 'node:fs/promises';
import {discoverUniverse} from '../market-scan/universe.mjs';
const universe=await discoverUniverse('us');
const catalog={retrievedAt:new Date(universe.retrievedAt).toISOString(),sources:universe.sources,scope:'US exchange-listed equities in the market scanner directory; excludes ETFs, test issues and other filtered instruments. Multiple share classes are separate securities. This is not a worldwide company register.',companies:universe.rows};
await mkdir(new URL('../../data/',import.meta.url),{recursive:true});
await writeFile(new URL('../../data/supply-chain-catalog.json',import.meta.url),JSON.stringify(catalog,null,2)+'\n');
console.log(`Saved ${catalog.companies.length} securities; relationships require separate disclosure evidence.`);
