import { COINS } from '../data/coins';
import type { CurrencyCode } from './format';

export type TxKind = 'send' | 'receive' | 'swap';

export type Tx = {
  id: string;
  kind: TxKind;
  t: number;
  coinId: string;
  amount: number;
  /** Nur bei Swap: Ziel-Coin und erhaltene Menge. */
  toCoinId?: string;
  toAmount?: number;
  /** Nur bei Send/Receive. */
  address?: string;
  note?: string;
};

export type WalletState = {
  version: 1;
  name: string;
  currency: CurrencyCode;
  address: string;
  /** coinId -> Menge */
  balances: Record<string, number>;
  favorites: string[];
  history: Tx[];
  hideBalances: boolean;
};

const STORAGE_KEY = 'nova-wallet-sim.v1';
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** Simulierte Adresse. Das Praefix macht sichtbar, dass sie zu nichts fuehrt. */
export function makeAddress(): string {
  let out = 'sim';
  const bytes = new Uint8Array(38);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += B58[b % B58.length];
  return out;
}

export function emptyBalances(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of COINS) out[c.id] = 0;
  return out;
}

export function initialState(): WalletState {
  return {
    version: 1,
    name: 'Meine Wallet',
    currency: 'EUR',
    address: makeAddress(),
    balances: { ...emptyBalances(), bitcorn: 0.5, etherion: 4, solara: 32, stabler: 1250 },
    favorites: ['bitcorn', 'solara'],
    history: [],
    hideBalances: false,
  };
}

export function load(): WalletState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<WalletState>;
    if (parsed.version !== 1) return initialState();
    const base = initialState();
    return {
      ...base,
      ...parsed,
      // Neu hinzugekommene Coins duerfen nicht als undefined durchrutschen.
      balances: { ...emptyBalances(), ...(parsed.balances ?? {}) },
      favorites: parsed.favorites ?? base.favorites,
      history: parsed.history ?? [],
    };
  } catch {
    return initialState();
  }
}

export function save(state: WalletState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Privater Modus o. ae. - die App laeuft auch ohne Speicher weiter.
  }
}


export function txId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export type Action =
  | { type: 'settings'; name: string; currency: CurrencyCode; balances: Record<string, number> }
  | { type: 'send'; coinId: string; amount: number; address: string }
  | { type: 'receive'; coinId: string; amount: number }
  | { type: 'swap'; fromId: string; toId: string; fromAmount: number; toAmount: number }
  | { type: 'favorite'; coinId: string }
  | { type: 'hideBalances'; value: boolean }
  | { type: 'newAddress' }
  | { type: 'reset' };

const MAX_HISTORY = 200;

function withTx(state: WalletState, tx: Tx): Tx[] {
  return [tx, ...state.history].slice(0, MAX_HISTORY);
}

export function reducer(state: WalletState, action: Action): WalletState {
  switch (action.type) {
    case 'settings':
      return {
        ...state,
        name: action.name.trim() || 'Meine Wallet',
        currency: action.currency,
        balances: { ...state.balances, ...action.balances },
      };

    case 'send': {
      const held = state.balances[action.coinId] ?? 0;
      const amount = Math.min(action.amount, held);
      if (!(amount > 0)) return state;
      return {
        ...state,
        balances: { ...state.balances, [action.coinId]: held - amount },
        history: withTx(state, {
          id: txId(),
          kind: 'send',
          t: Date.now(),
          coinId: action.coinId,
          amount,
          address: action.address,
        }),
      };
    }

    case 'receive': {
      if (!(action.amount > 0)) return state;
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.coinId]: (state.balances[action.coinId] ?? 0) + action.amount,
        },
        history: withTx(state, {
          id: txId(),
          kind: 'receive',
          t: Date.now(),
          coinId: action.coinId,
          amount: action.amount,
          address: state.address,
        }),
      };
    }

    case 'swap': {
      const held = state.balances[action.fromId] ?? 0;
      const fromAmount = Math.min(action.fromAmount, held);
      if (!(fromAmount > 0) || action.fromId === action.toId) return state;
      const ratio = fromAmount / action.fromAmount;
      const toAmount = action.toAmount * ratio;
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.fromId]: held - fromAmount,
          [action.toId]: (state.balances[action.toId] ?? 0) + toAmount,
        },
        history: withTx(state, {
          id: txId(),
          kind: 'swap',
          t: Date.now(),
          coinId: action.fromId,
          amount: fromAmount,
          toCoinId: action.toId,
          toAmount,
        }),
      };
    }

    case 'favorite': {
      const on = state.favorites.includes(action.coinId);
      return {
        ...state,
        favorites: on
          ? state.favorites.filter((id) => id !== action.coinId)
          : [...state.favorites, action.coinId],
      };
    }

    case 'hideBalances':
      return { ...state, hideBalances: action.value };

    case 'newAddress':
      return { ...state, address: makeAddress() };

    case 'reset':
      return initialState();
  }
}
