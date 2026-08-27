/**
 * Frei erfundene Kryptowaehrungen. Keine dieser Muenzen existiert.
 * Namen, Kuerzel, Kurse und Marktdaten sind komplett fiktiv.
 */
export type Coin = {
  id: string;
  symbol: string;
  name: string;
  color: string;
  glyph: string;
  /** Ankerpreis in USD, um den herum die Simulation schwingt. */
  basePrice: number;
  /** Schwankungsbreite: 0.02 = sehr ruhig, 0.9 = wilder Ritt. */
  volatility: number;
  /** Langfristiger Trend pro Jahr, z. B. 0.4 = +40 %. */
  drift: number;
  /** Fiktive Umlaufmenge, nur fuer die Marktkapitalisierung. */
  supply: number;
  /** Stablecoins bleiben am Dollar kleben. */
  stable?: boolean;
};

export const COINS: Coin[] = [
  {
    id: 'bitcorn',
    symbol: 'BEC',
    name: 'Bitcorn',
    color: '#f2a03d',
    glyph: '◉',
    basePrice: 61250,
    volatility: 0.42,
    drift: 0.35,
    supply: 19_600_000,
  },
  {
    id: 'etherion',
    symbol: 'ETR',
    name: 'Etherion',
    color: '#8f7cf0',
    glyph: '◈',
    basePrice: 2840,
    volatility: 0.5,
    drift: 0.28,
    supply: 120_400_000,
  },
  {
    id: 'solara',
    symbol: 'SLR',
    name: 'Solara',
    color: '#2fd6a5',
    glyph: '◐',
    basePrice: 148.2,
    volatility: 0.68,
    drift: 0.55,
    supply: 465_000_000,
  },
  {
    id: 'trinex',
    symbol: 'TNX',
    name: 'Trinex',
    color: '#ff6b6b',
    glyph: '▲',
    basePrice: 0.128,
    volatility: 0.36,
    drift: 0.1,
    supply: 86_000_000_000,
  },
  {
    id: 'bancoin',
    symbol: 'BNC',
    name: 'Bancoin',
    color: '#ffd166',
    glyph: '✦',
    basePrice: 512.4,
    volatility: 0.44,
    drift: 0.22,
    supply: 148_000_000,
  },
  {
    id: 'avalantis',
    symbol: 'AVX',
    name: 'Avalantis',
    color: '#ef476f',
    glyph: '◭',
    basePrice: 27.35,
    volatility: 0.72,
    drift: 0.18,
    supply: 395_000_000,
  },
  {
    id: 'cardium',
    symbol: 'CDM',
    name: 'Cardium',
    color: '#4d8bf0',
    glyph: '◎',
    basePrice: 0.412,
    volatility: 0.58,
    drift: -0.05,
    supply: 35_800_000_000,
  },
  {
    id: 'polkanet',
    symbol: 'PKN',
    name: 'Polkanet',
    color: '#c46bd1',
    glyph: '⬢',
    basePrice: 6.14,
    volatility: 0.61,
    drift: -0.12,
    supply: 1_420_000_000,
  },
  {
    id: 'ripplo',
    symbol: 'RPL',
    name: 'Ripplo',
    color: '#5ce1e6',
    glyph: '≈',
    basePrice: 0.578,
    volatility: 0.55,
    drift: 0.08,
    supply: 55_000_000_000,
  },
  {
    id: 'shibark',
    symbol: 'SHK',
    name: 'Shibark',
    color: '#9ad34a',
    glyph: '◕',
    basePrice: 0.0000214,
    volatility: 1.15,
    drift: 0.9,
    supply: 589_000_000_000_000,
  },
  {
    id: 'lumen-x',
    symbol: 'LMX',
    name: 'Lumen X',
    color: '#e0e0e8',
    glyph: '✹',
    basePrice: 3.86,
    volatility: 0.8,
    drift: 0.45,
    supply: 780_000_000,
  },
  {
    id: 'stabler',
    symbol: 'STB',
    name: 'Stabler',
    color: '#7f8c9b',
    glyph: '■',
    basePrice: 1,
    volatility: 0.004,
    drift: 0,
    supply: 94_000_000_000,
    stable: true,
  },
];

export const COIN_BY_ID = new Map(COINS.map((c) => [c.id, c]));

export function coinById(id: string): Coin | undefined {
  return COIN_BY_ID.get(id);
}
