import type { Coin } from '../data/coins';

/**
 * Deterministische Kurs-Simulation.
 *
 * Der Kurs ist eine reine Funktion aus (Coin, Zeitpunkt). Es gibt keinen
 * gespeicherten Zustand: Chart-Historie und der live tickende Kurs kommen aus
 * derselben Formel, dadurch passt beides immer zusammen und ueberlebt jeden
 * Reload. Aufgebaut aus mehreren Oktaven Gradient-Noise (langsame Zyklen bis
 * Minutenrauschen) plus einem gedaempften Langfrist-Trend.
 */

const YEAR_MS = 365 * 24 * 3600 * 1000;

/** Zeitpunkt, an dem ein Coin exakt seinen basePrice hat. */
const ANCHOR = Date.UTC(2026, 0, 1);

function hashToUnit(seed: number, i: number): number {
  let h = (i | 0) ^ Math.imul(seed | 0, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Gradient in [-1, 1] am Gitterpunkt i. */
function grad(seed: number, i: number): number {
  return hashToUnit(seed, i) * 2 - 1;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** 1D-Gradient-Noise, Ergebnis grob in [-1, 1]. */
function perlin(seed: number, x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const g0 = grad(seed, i);
  const g1 = grad(seed, i + 1);
  const u = fade(f);
  return (g0 * f * (1 - u) + g1 * (f - 1) * u) * 2;
}

function seedFromSymbol(symbol: string): number {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

const seedCache = new Map<string, number>();
function coinSeed(coin: Coin): number {
  let s = seedCache.get(coin.id);
  if (s === undefined) {
    s = seedFromSymbol(coin.id + coin.symbol);
    seedCache.set(coin.id, s);
  }
  return s;
}

/** Periode (in Jahren) und Amplitude je Oktave. */
const OCTAVES: Array<[period: number, amp: number]> = [
  [1.6, 0.52],
  [0.42, 0.3],
  [0.075, 0.17],
  [0.019, 0.1],
  [0.0016, 0.05],
  [0.00019, 0.022],
  [0.000021, 0.009],
];

/** Kurs eines Coins zum Zeitpunkt t (ms), in simulierten US-Dollar. */
export function priceAt(coin: Coin, t: number): number {
  const seed = coinSeed(coin);
  const age = (t - ANCHOR) / YEAR_MS;

  if (coin.stable) {
    const wobble = perlin(seed, age / 0.0016) * coin.volatility;
    return coin.basePrice * (1 + wobble);
  }

  // Gedaempfter Trend: waechst zuerst linear, laeuft langfristig in eine
  // Saettigung, damit der Kurs ueber Jahre nicht explodiert.
  let logP = coin.drift * 2 * Math.tanh(age / 2);

  for (let o = 0; o < OCTAVES.length; o++) {
    const [period, amp] = OCTAVES[o];
    logP += perlin(seed + o * 7919, age / period) * amp * coin.volatility;
  }

  return coin.basePrice * Math.exp(logP);
}

export type Range = '1H' | '1D' | '1W' | '1M' | '1Y' | 'ALL';

export const RANGES: Range[] = ['1H', '1D', '1W', '1M', '1Y', 'ALL'];

const RANGE_SPAN_MS: Record<Range, number> = {
  '1H': 3600_000,
  '1D': 24 * 3600_000,
  '1W': 7 * 24 * 3600_000,
  '1M': 30 * 24 * 3600_000,
  '1Y': 365 * 24 * 3600_000,
  ALL: 5 * 365 * 24 * 3600_000,
};

const RANGE_POINTS: Record<Range, number> = {
  '1H': 60,
  '1D': 96,
  '1W': 84,
  '1M': 90,
  '1Y': 120,
  ALL: 140,
};

export type Point = { t: number; p: number };

/** Kursverlauf ueber den gewaehlten Zeitraum, endend bei `now`. */
export function series(coin: Coin, range: Range, now: number): Point[] {
  const span = RANGE_SPAN_MS[range];
  const n = RANGE_POINTS[range];
  const step = span / (n - 1);
  const start = now - span;
  const out: Point[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = start + i * step;
    out[i] = { t, p: priceAt(coin, t) };
  }
  return out;
}

export type Change = { abs: number; pct: number; up: boolean };

export function changeOver(coin: Coin, range: Range, now: number): Change {
  const then = priceAt(coin, now - RANGE_SPAN_MS[range]);
  const nowP = priceAt(coin, now);
  const abs = nowP - then;
  const pct = then === 0 ? 0 : (abs / then) * 100;
  return { abs, pct, up: abs >= 0 };
}

export function change24h(coin: Coin, now: number): Change {
  return changeOver(coin, '1D', now);
}

/** Fiktive Marktkapitalisierung. */
export function marketCap(coin: Coin, now: number): number {
  return priceAt(coin, now) * coin.supply;
}

/** Fiktives 24h-Handelsvolumen. */
export function volume24h(coin: Coin, now: number): number {
  const seed = coinSeed(coin) ^ 0x5bf03635;
  const age = (now - ANCHOR) / YEAR_MS;
  const swing = 1 + perlin(seed, age / 0.0016) * 0.45;
  const ratio = 0.015 + coin.volatility * 0.05;
  return marketCap(coin, now) * ratio * Math.max(0.2, swing);
}

/** Fiktive Halter-Zahl, waechst langsam und monoton. */
export function holders(coin: Coin, now: number): number {
  const seed = coinSeed(coin) ^ 0x1f2e3d4c;
  const age = (now - ANCHOR) / YEAR_MS;
  const base = 40_000 + hashToUnit(seed, 1) * 4_000_000;
  return Math.round(base * (1 + 0.18 * age + hashToUnit(seed, 2) * 0.05));
}
