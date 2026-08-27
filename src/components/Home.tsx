import { useMemo } from 'react';
import { COINS, type Coin } from '../data/coins';
import { change24h, priceAt, series } from '../lib/prices';
import { amount, fiat, percent, signedFiat } from '../lib/format';
import { useWallet } from '../store';
import { IconReceive, IconSend, IconSwap } from './Icons';
import { CoinIcon } from './ui';
import { Sparkline } from './Chart';
import { TxRow } from './HistorySheet';

const DAY_MS = 24 * 3600 * 1000;

export function totalValue(balances: Record<string, number>, at: number): number {
  let sum = 0;
  for (const coin of COINS) {
    const held = balances[coin.id] ?? 0;
    if (held > 0) sum += held * priceAt(coin, at);
  }
  return sum;
}

type RowProps = {
  coin: Coin;
  now: number;
  onOpen: (id: string) => void;
  /** Bestandsansicht zeigt die eigene Menge, Marktansicht den Kurs. */
  mode: 'holding' | 'market';
};

function CoinRow({ coin, now, onOpen, mode }: RowProps) {
  const { state } = useWallet();
  const price = priceAt(coin, now);
  const ch = change24h(coin, now);
  const held = state.balances[coin.id] ?? 0;
  const spark = useMemo(() => series(coin, '1D', now), [coin, now]);
  const hidden = state.hideBalances;

  return (
    <button className="coin-row" onClick={() => onOpen(coin.id)}>
      <CoinIcon coin={coin} />
      <div className="coin-main">
        <div className="coin-name">{coin.name}</div>
        <div className="coin-sub">
          {mode === 'holding' ? (hidden ? '•••••' : amount(held, coin.symbol)) : coin.symbol}
        </div>
      </div>
      {mode === 'market' && <Sparkline points={spark} up={ch.up} />}
      <div className="coin-right">
        <div className="coin-value">
          {mode === 'holding'
            ? hidden
              ? '•••••'
              : fiat(held * price, state.currency)
            : fiat(price, state.currency)}
        </div>
        <div className={ch.up ? 'coin-delta up' : 'coin-delta down'}>{percent(ch.pct)}</div>
      </div>
    </button>
  );
}

type TabProps = {
  now: number;
  onOpen: (id: string) => void;
  onSend: () => void;
  onReceive: () => void;
  onSwap: () => void;
};

export function WalletTab({ now, onOpen, onSend, onReceive, onSwap }: TabProps) {
  const { state } = useWallet();

  const total = totalValue(state.balances, now);
  const before = totalValue(state.balances, now - DAY_MS);
  const diff = total - before;
  const pct = before > 0 ? (diff / before) * 100 : 0;

  const held = COINS.filter((c) => (state.balances[c.id] ?? 0) > 0).sort(
    (a, b) =>
      (state.balances[b.id] ?? 0) * priceAt(b, now) - (state.balances[a.id] ?? 0) * priceAt(a, now),
  );

  return (
    <>
      <div className="balance-block">
        <div className="balance-label">Gesamtwert (simuliert)</div>
        <div className="balance-value">
          {state.hideBalances ? '••••••' : fiat(total, state.currency)}
        </div>
        {total > 0 && !state.hideBalances && (
          <div className={diff >= 0 ? 'balance-change up' : 'balance-change down'}>
            {signedFiat(diff, state.currency)} ({percent(pct)}) · 24 h
          </div>
        )}
      </div>

      <div className="actions">
        <button className="action" onClick={onSend}>
          <IconSend />
          Senden
        </button>
        <button className="action" onClick={onReceive}>
          <IconReceive />
          Empfangen
        </button>
        <button className="action" onClick={onSwap}>
          <IconSwap />
          Tauschen
        </button>
      </div>

      <div className="section-head">
        <span className="section-title">Bestände</span>
      </div>

      {held.length === 0 ? (
        <p className="empty">
          Noch keine Bestände.
          <br />
          Trag sie in den Einstellungen ein oder buche einen Eingang.
        </p>
      ) : (
        <div className="coin-list">
          {held.map((coin) => (
            <CoinRow key={coin.id} coin={coin} now={now} onOpen={onOpen} mode="holding" />
          ))}
        </div>
      )}
    </>
  );
}

export function MarketTab({ now, onOpen }: { now: number; onOpen: (id: string) => void }) {
  const { state } = useWallet();
  const favs = COINS.filter((c) => state.favorites.includes(c.id));
  const rest = COINS.filter((c) => !state.favorites.includes(c.id));

  return (
    <>
      {favs.length > 0 && (
        <>
          <div className="section-head">
            <span className="section-title">Merkliste</span>
          </div>
          <div className="coin-list">
            {favs.map((coin) => (
              <CoinRow key={coin.id} coin={coin} now={now} onOpen={onOpen} mode="market" />
            ))}
          </div>
        </>
      )}

      <div className="section-head" style={{ marginTop: 18 }}>
        <span className="section-title">Alle Coins</span>
      </div>
      <div className="coin-list">
        {rest.map((coin) => (
          <CoinRow key={coin.id} coin={coin} now={now} onOpen={onOpen} mode="market" />
        ))}
      </div>

      <p className="footnote">
        Sämtliche Coins, Kurse und Marktdaten sind erfunden und werden lokal berechnet.
      </p>
    </>
  );
}

export function HistoryTab() {
  const { state } = useWallet();
  return (
    <>
      <div className="section-head">
        <span className="section-title">Verlauf</span>
      </div>
      {state.history.length === 0 ? (
        <p className="empty">
          Noch keine Buchungen.
          <br />
          Senden, Empfangen und Tauschen landen hier.
        </p>
      ) : (
        state.history.map((tx) => <TxRow key={tx.id} tx={tx} />)
      )}
    </>
  );
}
