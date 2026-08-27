import { useState } from 'react';
import { COINS } from '../data/coins';
import { CURRENCIES, amount, type CurrencyCode } from '../lib/format';
import { useWallet } from '../store';
import { CoinIcon, Sheet, Switch } from './ui';

export function SettingsSheet({ onClose, onToast }: { onClose: () => void; onToast: (m: string) => void }) {
  const { state, dispatch } = useWallet();
  const [name, setName] = useState(state.name);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(state.currency);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const c of COINS) {
      const v = state.balances[c.id] ?? 0;
      out[c.id] = v === 0 ? '' : String(v);
    }
    return out;
  });
  const [confirmReset, setConfirmReset] = useState(false);

  function submit() {
    const balances: Record<string, number> = {};
    for (const c of COINS) {
      const raw = (drafts[c.id] ?? '').replace(',', '.').trim();
      const n = raw === '' ? 0 : Number(raw);
      balances[c.id] = Number.isFinite(n) && n > 0 ? n : 0;
    }
    dispatch({ type: 'settings', name, currency: currencyCode, balances });
    onToast('Gespeichert');
    onClose();
  }

  return (
    <Sheet title="Einstellungen" subtitle="Nova Wallet Sim" onClose={onClose}>
      <div className="field">
        <label htmlFor="set-name">Name der Wallet</label>
        <input
          id="set-name"
          className="input"
          value={name}
          maxLength={32}
          onChange={(e) => setName(e.target.value)}
          placeholder="Meine Wallet"
        />
      </div>

      <div className="field">
        <label htmlFor="set-cur">Anzeigewährung</label>
        <select
          id="set-cur"
          className="select"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="hint">Umrechnungskurse sind Teil der Simulation, keine Marktdaten.</p>
      </div>

      <div className="field">
        <label>Bestände</label>
        {COINS.map((coin) => (
          <div className="balance-editor" key={coin.id}>
            <CoinIcon coin={coin} />
            <div className="meta">
              <div className="n">{coin.name}</div>
              <div className="s">{coin.symbol}</div>
            </div>
            <input
              className="input"
              inputMode="decimal"
              placeholder="0"
              aria-label={`Bestand ${coin.name}`}
              value={drafts[coin.id] ?? ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [coin.id]: e.target.value }))}
            />
          </div>
        ))}
        <p className="hint">
          Frei wählbare Mengen erfundener Coins. Ein Bestand hier entspricht keinem realen Guthaben.
        </p>
      </div>

      <div className="toggle-row">
        <div className="t">
          <div className="n">Beträge verbergen</div>
          <div className="d">Zeigt ••••• statt Zahlen</div>
        </div>
        <Switch on={state.hideBalances} onChange={(v) => dispatch({ type: 'hideBalances', value: v })} />
      </div>

      <div className="toggle-row">
        <div className="t">
          <div className="n">Neue Adresse</div>
          <div className="d" style={{ wordBreak: 'break-all' }}>
            {state.address.slice(0, 16)}…
          </div>
        </div>
        <button
          className="chip"
          onClick={() => {
            dispatch({ type: 'newAddress' });
            onToast('Neue Adresse erzeugt');
          }}
        >
          Erneuern
        </button>
      </div>

      <div className="toggle-row">
        <div className="t">
          <div className="n">Gesamtwert</div>
          <div className="d">
            {COINS.filter((c) => (state.balances[c.id] ?? 0) > 0).length} Coins mit Bestand ·{' '}
            {amount(state.history.length)} Buchungen
          </div>
        </div>
      </div>

      <button
        className="danger"
        onClick={() => {
          if (!confirmReset) {
            setConfirmReset(true);
            return;
          }
          dispatch({ type: 'reset' });
          onToast('Zurückgesetzt');
          onClose();
        }}
      >
        {confirmReset ? 'Wirklich alles zurücksetzen? Nochmal tippen.' : 'Wallet zurücksetzen'}
      </button>

      <button className="btn primary wide" onClick={submit} style={{ marginTop: 8 }}>
        Speichern
      </button>

      <p className="footnote">
        Nova Wallet Sim · Simulation mit frei erfundenen Coins. Keine Blockchain, keine echten Werte.
      </p>
    </Sheet>
  );
}
