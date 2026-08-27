import { useEffect, type ReactNode } from 'react';
import type { Coin } from '../data/coins';
import { IconClose } from './Icons';

export function CoinIcon({ coin, large = false }: { coin: Coin; large?: boolean }) {
  return (
    <div
      className={large ? 'coin-icon lg' : 'coin-icon'}
      style={{ background: coin.color }}
      aria-hidden
    >
      {coin.glyph}
    </div>
  );
}

type SheetProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({ title, subtitle, onClose, children }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn ghost" onClick={onClose} aria-label="Schliessen">
            <IconClose />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  );
}

export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={on ? 'switch on' : 'switch'}
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    />
  );
}

/**
 * Optischer Platzhalter-Code zur Adresse. Bewusst kein echter QR-Code: die
 * Adresse ist simuliert und fuehrt zu keiner Blockchain.
 */
export function FakeQr({ seedText }: { seedText: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = 0; i < size * size; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    cells.push(((h >>> 0) % 100) < 47);
  }

  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);

  const rects: ReactNode[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inFinder(x, y)) continue;
      if (!cells[y * size + x]) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} rx={0.22} />);
    }
  }

  const finder = (ox: number, oy: number) => (
    <g key={`f-${ox}-${oy}`}>
      <rect x={ox} y={oy} width={7} height={7} rx={1.6} fill="none" strokeWidth={1} stroke="#0b0b10" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} rx={0.7} />
    </g>
  );

  return (
    <svg className="qr" viewBox={`-1 -1 ${size + 2} ${size + 2}`} fill="#0b0b10" aria-hidden>
      {rects}
      {finder(0, 0)}
      {finder(size - 7, 0)}
      {finder(0, size - 7)}
    </svg>
  );
}
