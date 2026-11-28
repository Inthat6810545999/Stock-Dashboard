export type MarketCapBand = 'small' | 'mid' | 'large';
export type MarketCapRankings<T> = Record<MarketCapBand, T[]>;

// Include micro caps in Small so every stock with a known positive cap belongs to one band.
export function marketCapBand(value: number | null | undefined): MarketCapBand | null {
 if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
 if (value < 2_000_000_000) return 'small';
 if (value < 10_000_000_000) return 'mid';
 return 'large';
}

export function rankByMarketCap<T extends {marketCap?: number | null}>(rows: T[], rank: (rows: T[]) => T[]): MarketCapRankings<T> {
 return {
  small: rank(rows.filter(row => marketCapBand(row.marketCap) === 'small')),
  mid: rank(rows.filter(row => marketCapBand(row.marketCap) === 'mid')),
  large: rank(rows.filter(row => marketCapBand(row.marketCap) === 'large')),
 };
}
