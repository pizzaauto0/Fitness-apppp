import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { load, reducer, save, type Action, type WalletState } from './lib/wallet';

type Store = { state: WalletState; dispatch: (a: Action) => void };

const WalletContext = createContext<Store | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    save(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): Store {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet ausserhalb des WalletProvider benutzt');
  return ctx;
}

/**
 * Tickende Uhr fuer die Kurs-Simulation. Alle Kurse leiten sich aus diesem
 * Zeitstempel ab, damit die ganze Oberflaeche im selben Takt aktualisiert.
 */
export function useNow(intervalMs = 3000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    const onVisible = () => {
      if (!document.hidden) setNow(Date.now());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
  return now;
}
