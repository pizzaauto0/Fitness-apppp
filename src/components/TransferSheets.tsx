import { useMemo, useState } from 'react';
import { COINS, coinById, type Coin } from '../data/coins';
import { priceAt } from '../lib/prices';
import { amount as fmtAmount, fiat } from '../lib/format';
import { useNow, useWallet } from '../store';
import { CoinIcon, FakeQr, Sheet } from './ui';
import { IconCopy, IconSwap } from './Icons';

/** Simulierte Swap-Gebühr. */
const FEE = 0.003;

function parseAmount(raw: string): number {
  const n = Number(raw.replace(',', '.').trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function CoinSelect({
  value,
  onChange,
  label,
  id,
  exclude,
}: {
  value: string;
  onChange: (id: string) => void;
  label: string;
  id: string;
  exclude?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {COINS.filter((c) => c.id !== exclude).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}

function PercentChips({ held, onPick }: { held: number; onPick: (v: number) => void }) {
  if (held <= 0) return null;
  return (
    <div className="chips">
      {[25, 50, 100].map((p) => (
        <button key={p} className="chip" onClick={() => onPick((held * p) / 100)}>
          {p === 100 ? 'Max' : `${p} %`}
        </button>
      ))}
    </div>
  );
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ---------------- Senden ---------------- */

export function SendSheet({
  initialCoinId,
  onClose,
  onToast,
}: {
  initialCoinId: string;
  onClose: () => void;
  onToast: (m: string) => void;
}) {
  const { state, dispatch } = useWallet();
  const now = useNow(5000);
  const [coinId, setCoinId] = useState(initialCoinId);
  const [raw, setRaw] = useState('');
  const [address, setAddress] = useState('');

  const coin = coinById(coinId) as Coin;
  const held = state.balances[coinId] ?? 0;
  const value = parseAmount(raw);
  const tooMuch = value > held;
  const ok = value > 0 && !tooMuch && address.trim().length >= 8;

  return (
    <Sheet title="Senden" subtitle="Simulierte Buchung" onClose={onClose}>
      <CoinSelect id="send-coin" label="Coin" value={coinId} onChange={setCoinId} />

      <div className="field">
        <label htmlFor="send-amount">Menge</label>
        <div className="input-row">
          <input
            id="send-amount"
            className="input"
            inputMode="decimal"
            placeholder="0"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <div style={{ color: 'var(--muted)', fontWeight: 600, width: 46 }}>{coin.symbol}</div>
        </div>
        <PercentChips held={held} onPick={(v) => setRaw(String(Number(v.toFixed(8))))} />
        <p className={tooMuch ? 'hint warn' : 'hint'}>
          {tooMuch
            ? `Mehr als vorhanden — Bestand: ${fmtAmount(held, coin.symbol)}`
            : `Verfügbar: ${fmtAmount(held, coin.symbol)} · ${fiat(value * priceAt(coin, now), state.currency)}`}
        </p>
      </div>

      <div className="field">
        <label htmlFor="send-to">Empfängeradresse</label>
        <input
          id="send-to"
          className="input"
          placeholder="sim…"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <p className="hint">
          Die Buchung bleibt in dieser App. Es wird nichts an ein Netzwerk übertragen.
        </p>
      </div>

      <button
        className="btn primary wide"
        disabled={!ok}
        onClick={() => {
          dispatch({ type: 'send', coinId, amount: value, address: address.trim() });
          onToast(`${fmtAmount(value, coin.symbol)} gesendet`);
          onClose();
        }}
      >
        Senden
      </button>
    </Sheet>
  );
}

/* ---------------- Empfangen ---------------- */

export function ReceiveSheet({
  initialCoinId,
  onClose,
  onToast,
}: {
  initialCoinId: string;
  onClose: () => void;
  onToast: (m: string) => void;
}) {
  const { state, dispatch } = useWallet();
  const [coinId, setCoinId] = useState(initialCoinId);
  const [raw, setRaw] = useState('');

  const coin = coinById(coinId) as Coin;
  const value = parseAmount(raw);

  return (
    <Sheet title="Empfangen" subtitle="Simulierte Adresse" onClose={onClose}>
      <FakeQr seedText={state.address} />

      <div className="address-box">{state.address}</div>

      <button
        className="btn wide"
        style={{ marginTop: 12 }}
        onClick={async () => onToast((await copy(state.address)) ? 'Adresse kopiert' : 'Kopieren nicht möglich')}
      >
        <IconCopy /> Adresse kopieren
      </button>

      <p className="hint" style={{ marginBottom: 22 }}>
        Diese Adresse gehört zu keinem Netzwerk. Wer ihr etwas schickt, schickt es ins Leere.
      </p>

      <CoinSelect id="recv-coin" label="Eingang buchen" value={coinId} onChange={setCoinId} />

      <div className="field">
        <label htmlFor="recv-amount">Menge</label>
        <div className="input-row">
          <input
            id="recv-amount"
            className="input"
            inputMode="decimal"
            placeholder="0"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <div style={{ color: 'var(--muted)', fontWeight: 600, width: 46 }}>{coin.symbol}</div>
        </div>
      </div>

      <button
        className="btn primary wide"
        disabled={value <= 0}
        onClick={() => {
          dispatch({ type: 'receive', coinId, amount: value });
          onToast(`${fmtAmount(value, coin.symbol)} gutgeschrieben`);
          onClose();
        }}
      >
        Eingang buchen
      </button>
    </Sheet>
  );
}

/* ---------------- Tauschen ---------------- */

export function SwapSheet({
  initialCoinId,
  onClose,
  onToast,
}: {
  initialCoinId: string;
  onClose: () => void;
  onToast: (m: string) => void;
}) {
  const { state, dispatch } = useWallet();
  const now = useNow(5000);
  const [fromId, setFromId] = useState(initialCoinId);
  const [toId, setToId] = useState(() => (initialCoinId === 'stabler' ? 'bitcorn' : 'stabler'));
  const [raw, setRaw] = useState('');

  const from = coinById(fromId) as Coin;
  const to = coinById(toId) as Coin;
  const held = state.balances[fromId] ?? 0;
  const value = parseAmount(raw);

  const { rate, receive } = useMemo(() => {
    const pFrom = priceAt(from, now);
    const pTo = priceAt(to, now);
    const r = pTo === 0 ? 0 : pFrom / pTo;
    return { rate: r, receive: value * r * (1 - FEE) };
  }, [from, to, now, value]);

  const tooMuch = value > held;
  const ok = value > 0 && !tooMuch && fromId !== toId;

  return (
    <Sheet title="Tauschen" subtitle="Simulierter Kurs" onClose={onClose}>
      <div className="field">
        <label htmlFor="swap-from">Von</label>
        <select id="swap-from" className="select" value={fromId} onChange={(e) => setFromId(e.target.value)}>
          {COINS.filter((c) => c.id !== toId).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.symbol})
            </option>
          ))}
        </select>
        <div className="input-row" style={{ marginTop: 10 }}>
          <input
            className="input"
            inputMode="decimal"
            placeholder="0"
            aria-label="Menge zum Tauschen"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <div style={{ color: 'var(--muted)', fontWeight: 600, width: 46 }}>{from.symbol}</div>
        </div>
        <PercentChips held={held} onPick={(v) => setRaw(String(Number(v.toFixed(8))))} />
        <p className={tooMuch ? 'hint warn' : 'hint'}>
          {tooMuch ? 'Mehr als vorhanden' : `Verfügbar: ${fmtAmount(held, from.symbol)}`}
        </p>
      </div>

      <div className="swap-arrow" aria-hidden>
        <IconSwap size={17} />
      </div>

      <CoinSelect id="swap-to" label="Nach" value={toId} onChange={setToId} exclude={fromId} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <CoinIcon coin={to} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {fmtAmount(receive, to.symbol)}
          </div>
          <div className="coin-sub">{fiat(receive * priceAt(to, now), state.currency)}</div>
        </div>
      </div>

      <div className="quote">
        <span className="k">Kurs</span>
        <span>
          1 {from.symbol} = {fmtAmount(rate, to.symbol)}
        </span>
      </div>
      <div className="quote">
        <span className="k">Gebühr (simuliert)</span>
        <span>{(FEE * 100).toFixed(1)} %</span>
      </div>

      <button
        className="btn primary wide"
        style={{ marginTop: 18 }}
        disabled={!ok}
        onClick={() => {
          dispatch({ type: 'swap', fromId, toId, fromAmount: value, toAmount: receive });
          onToast(`Getauscht in ${to.symbol}`);
          onClose();
        }}
      >
        Tauschen
      </button>
    </Sheet>
  );
}
