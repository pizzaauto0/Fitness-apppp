import { coinById } from '../data/coins';
import { amount, dateTime } from '../lib/format';
import type { Tx } from '../lib/wallet';
import { useWallet } from '../store';
import { IconReceive, IconSend, IconSwap } from './Icons';
import { Sheet } from './ui';

function TxRow({ tx }: { tx: Tx }) {
  const coin = coinById(tx.coinId);
  const toCoin = tx.toCoinId ? coinById(tx.toCoinId) : undefined;
  if (!coin) return null;

  const icon =
    tx.kind === 'send' ? <IconSend size={17} /> : tx.kind === 'receive' ? <IconReceive size={17} /> : <IconSwap size={17} />;

  const title =
    tx.kind === 'send'
      ? `${coin.symbol} gesendet`
      : tx.kind === 'receive'
        ? `${coin.symbol} empfangen`
        : `${coin.symbol} → ${toCoin?.symbol ?? '?'}`;

  const detail =
    tx.kind === 'swap'
      ? `${dateTime(tx.t)} · erhalten ${amount(tx.toAmount ?? 0, toCoin?.symbol)}`
      : `${dateTime(tx.t)}${tx.address ? ` · ${tx.address.slice(0, 12)}…` : ''}`;

  const sign = tx.kind === 'receive' ? '+' : '−';
  const cls = tx.kind === 'receive' ? 'tx-amt up' : tx.kind === 'send' ? 'tx-amt down' : 'tx-amt';

  return (
    <div className="tx">
      <div className="tx-icon">{icon}</div>
      <div className="tx-main">
        <div className="n">{title}</div>
        <div className="d">{detail}</div>
      </div>
      <div className={cls}>
        {sign}
        {amount(tx.amount, coin.symbol)}
      </div>
    </div>
  );
}

export function HistorySheet({ onClose }: { onClose: () => void }) {
  const { state } = useWallet();

  return (
    <Sheet title="Verlauf" subtitle="Buchungen in dieser App" onClose={onClose}>
      {state.history.length === 0 ? (
        <p className="empty">
          Noch keine Buchungen.
          <br />
          Senden, Empfangen und Tauschen landen hier.
        </p>
      ) : (
        state.history.map((tx) => <TxRow key={tx.id} tx={tx} />)
      )}
    </Sheet>
  );
}

export { TxRow };
