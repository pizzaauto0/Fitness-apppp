import { useMemo, useState } from 'react';
import { coinById, type Coin } from '../data/coins';
import {
  RANGES,
  changeOver,
  holders,
  marketCap,
  priceAt,
  series,
  volume24h,
  type Range,
} from '../lib/prices';
import { amount, fiat, integer, percent, signedFiat } from '../lib/format';
import { useWallet } from '../store';
import { Chart } from './Chart';
import { CoinIcon } from './ui';
import { IconBack, IconReceive, IconSend, IconStar, IconSwap } from './Icons';
import { TxRow } from './HistorySheet';

type Props = {
  coinId: string;
  now: number;
  onBack: () => void;
  onSend: (coinId: string) => void;
  onReceive: (coinId: string) => void;
  onSwap: (coinId: string) => void;
};

export function CoinDetail({ coinId, now, onBack, onSend, onReceive, onSwap }: Props) {
  const { state, dispatch } = useWallet();
  const [range, setRange] = useState<Range>('1D');

  const coin = coinById(coinId) as Coin;
  const points = useMemo(() => series(coin, range, now), [coin, range, now]);
  const ch = changeOver(coin, range, now);
  const price = priceAt(coin, now);
  const held = state.balances[coinId] ?? 0;
  const isFav = state.favorites.includes(coinId);

  const txs = state.history.filter((t) => t.coinId === coinId || t.toCoinId === coinId).slice(0, 6);

  return (
    <>
      <div className="detail-head">
        <button className="icon-btn" onClick={onBack} aria-label="Zurück">
          <IconBack />
        </button>
        <CoinIcon coin={coin} large />
        <div style={{ minWidth: 0 }}>
          <div className="coin-name" style={{ fontSize: 17 }}>
            {coin.symbol}
          </div>
          <div className="coin-sub">{coin.name}</div>
        </div>
        <div className="detail-price">
          <div className="p">{fiat(price, state.currency)}</div>
          <div className={ch.up ? 'd up' : 'd down'}>
            {signedFiat(ch.abs, state.currency)} ({percent(ch.pct)})
          </div>
        </div>
        <button
          className="icon-btn ghost"
          onClick={() => dispatch({ type: 'favorite', coinId })}
          aria-label={isFav ? 'Von Merkliste entfernen' : 'Zur Merkliste'}
          style={isFav ? { color: 'var(--accent-soft)' } : undefined}
        >
          <IconStar filled={isFav} />
        </button>
      </div>

      <Chart points={points} up={ch.up} currencyCode={state.currency} />

      <div className="range-tabs">
        {RANGES.map((r) => (
          <button
            key={r}
            className={r === range ? 'range-tab on' : 'range-tab'}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="holding">
        <div className="lbl">Dein Bestand</div>
        <div>
          <div className="v">
            {state.hideBalances ? '•••••' : fiat(held * price, state.currency)}
          </div>
          <div className="a">{state.hideBalances ? '•••••' : amount(held, coin.symbol)}</div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn" onClick={() => onSend(coinId)}>
          <IconSend size={17} /> Senden
        </button>
        <button className="btn" onClick={() => onReceive(coinId)}>
          <IconReceive size={17} /> Empfangen
        </button>
      </div>

      {txs.length > 0 && (
        <>
          <div className="section-head">
            <span className="section-title">Letzte Buchungen</span>
          </div>
          {txs.map((tx) => (
            <TxRow key={tx.id} tx={tx} />
          ))}
        </>
      )}

      <div className="section-head" style={{ marginTop: 16 }}>
        <span className="section-title">Kennzahlen</span>
      </div>
      <div className="stats-grid">
        <div className="stat">
          <div className="k">Marktkapitalisierung</div>
          <div className="v">{fiat(marketCap(coin, now), state.currency, { compact: true })}</div>
        </div>
        <div className="stat">
          <div className="k">24 h Volumen</div>
          <div className="v">{fiat(volume24h(coin, now), state.currency, { compact: true })}</div>
        </div>
        <div className="stat">
          <div className="k">Umlaufmenge</div>
          <div className="v">{integer(coin.supply)}</div>
        </div>
        <div className="stat">
          <div className="k">Halter</div>
          <div className="v">{integer(holders(coin, now))}</div>
        </div>
      </div>

      <button className="btn primary wide" style={{ marginTop: 22 }} onClick={() => onSwap(coinId)}>
        <IconSwap size={18} /> Tauschen
      </button>

      <p className="footnote">
        {coin.name} ({coin.symbol}) ist eine erfundene Währung. Kurs und Kennzahlen stammen aus einer
        Simulation in dieser App.
      </p>
    </>
  );
}
