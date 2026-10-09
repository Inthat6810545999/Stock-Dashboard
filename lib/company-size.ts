export type CompanySize={symbol:string;marketCapUsd:number|null;quoteAt:string|null};
/** Missing/private values follow comparable public issuers, never rank as zero. */
export function orderBySize(symbols:string[],sizes:Record<string,CompanySize>){return [...symbols].sort((a,b)=>{const av=sizes[a]?.marketCapUsd,bv=sizes[b]?.marketCapUsd;const ak=typeof av==='number'&&Number.isFinite(av)&&av>0,bk=typeof bv==='number'&&Number.isFinite(bv)&&bv>0;return ak&&bk?bv-av:ak?-1:bk?1:a.localeCompare(b)});}
