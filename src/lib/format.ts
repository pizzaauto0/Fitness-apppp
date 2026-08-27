export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'JPY';

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  /** Fiktiver Umrechnungskurs, Basis USD. */
  rate: number;
  locale: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', label: 'USD — US-Dollar', rate: 1, locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'EUR — Euro', rate: 0.92, locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'GBP — Pfund', rate: 0.79, locale: 'en-GB' },
  { code: 'CHF', symbol: 'CHF ', label: 'CHF — Franken', rate: 0.88, locale: 'de-CH' },
  { code: 'JPY', symbol: '¥', label: 'JPY — Yen', rate: 152, locale: 'ja-JP' },
];

export const CURRENCY_BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function currency(code: CurrencyCode): Currency {
  return CURRENCY_BY_CODE.get(code) ?? CURRENCIES[0];
}

/** USD-Betrag in die Anzeigewaehrung umrechnen und formatieren. */
export function fiat(usd: number, code: CurrencyCode, opts: { compact?: boolean } = {}): string {
  const cur = currency(code);
  const value = usd * cur.rate;

  if (opts.compact) return cur.symbol + compact(value);

  const abs = Math.abs(value);
  // Sehr kleine Kurse brauchen mehr Nachkommastellen, sonst steht da 0,00.
  let digits = 2;
  if (abs > 0 && abs < 0.01) digits = 8;
  else if (abs < 1) digits = 4;
  if (cur.code === 'JPY' && abs >= 1) digits = 0;

  return (
    cur.symbol +
    value.toLocaleString(cur.locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  );
}

export function compact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}K`;
  return `${sign}${abs.toFixed(2)}`;
}

/** Coin-Menge anzeigen: genug Stellen, aber keine Nullenwueste. */
export function amount(value: number, symbol?: string): string {
  const abs = Math.abs(value);
  let digits = 4;
  if (abs === 0) digits = 0;
  else if (abs >= 1000) digits = 2;
  else if (abs < 0.0001) digits = 8;
  const text = value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
  return symbol ? `${text} ${symbol}` : text;
}

export function percent(pct: number): string {
  const sign = pct >= 0 ? '+' : '−';
  return `${sign}${Math.abs(pct).toFixed(2)} %`;
}

export function signedFiat(usd: number, code: CurrencyCode): string {
  const sign = usd >= 0 ? '+' : '−';
  return sign + fiat(Math.abs(usd), code);
}

export function dateTime(t: number): string {
  return new Date(t).toLocaleString('de-DE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function integer(value: number): string {
  return Math.round(value).toLocaleString('de-DE');
}
