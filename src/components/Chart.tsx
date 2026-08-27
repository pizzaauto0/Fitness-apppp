import { useMemo, useRef, useState } from 'react';
import type { Point } from '../lib/prices';
import { dateTime, fiat, type CurrencyCode } from '../lib/format';

const VB_W = 300;
const VB_H = 120;

function project(points: Point[]) {
  let min = Infinity;
  let max = -Infinity;
  for (const p of points) {
    if (p.p < min) min = p.p;
    if (p.p > max) max = p.p;
  }
  // Flache Kurven (z. B. Stablecoins) sonst als Nulllinie mitten im Nichts.
  const pad = (max - min || Math.abs(max) * 0.01 || 1) * 0.12;
  const lo = min - pad;
  const hi = max + pad;
  const n = points.length;
  return points.map((p, i) => ({
    x: n === 1 ? VB_W / 2 : (i / (n - 1)) * VB_W,
    y: VB_H - ((p.p - lo) / (hi - lo)) * VB_H,
  }));
}

function toPath(xy: Array<{ x: number; y: number }>): string {
  return xy.map((q, i) => `${i === 0 ? 'M' : 'L'}${q.x.toFixed(2)} ${q.y.toFixed(2)}`).join(' ');
}

export function Sparkline({ points, up }: { points: Point[]; up: boolean }) {
  const d = useMemo(() => toPath(project(points)), [points]);
  return (
    <svg className="spark" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={up ? 'var(--up)' : 'var(--down)'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type ChartProps = {
  points: Point[];
  up: boolean;
  currencyCode: CurrencyCode;
};

export function Chart({ points, up, currencyCode }: ChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const xy = useMemo(() => project(points), [points]);
  const line = useMemo(() => toPath(xy), [xy]);
  const area = useMemo(
    () => (xy.length ? `${line} L${VB_W} ${VB_H} L0 ${VB_H} Z` : ''),
    [line, xy.length],
  );

  const color = up ? 'var(--up)' : 'var(--down)';
  const gradId = up ? 'grad-up' : 'grad-down';
  const last = xy[xy.length - 1];

  function pick(clientX: number) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (points.length - 1)));
  }

  const active = hover === null ? null : points[hover];
  const activeXY = hover === null ? null : xy[hover];
  // Der Tooltip soll an den Raendern nicht aus dem Chart laufen.
  const labelSide = activeXY && activeXY.x > VB_W * 0.55 ? 'right' : 'left';

  return (
    <div
      className="chart-wrap"
      ref={wrapRef}
      onPointerDown={(e) => pick(e.clientX)}
      onPointerMove={(e) => {
        if (e.pointerType === 'touch' && e.buttons === 0 && hover === null) return;
        pick(e.clientX);
      }}
      onPointerLeave={() => setHover(null)}
      onPointerUp={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" role="img" aria-label="Kursverlauf">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {last && hover === null && (
          <circle cx={last.x} cy={last.y} r={4} fill={color} vectorEffect="non-scaling-stroke" />
        )}
        {activeXY && (
          <>
            <line
              x1={activeXY.x}
              y1={0}
              x2={activeXY.x}
              y2={VB_H}
              stroke="var(--faint)"
              strokeWidth={1}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={activeXY.x} cy={activeXY.y} r={4.5} fill={color} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>

      {active && (
        <div
          className="crosshair-box"
          style={
            labelSide === 'left'
              ? { left: `${(activeXY!.x / VB_W) * 100}%`, transform: 'translateX(6px)' }
              : { left: `${(activeXY!.x / VB_W) * 100}%`, transform: 'translateX(calc(-100% - 6px))' }
          }
        >
          <div>
            <span>Zeit</span>
            {dateTime(active.t)}
          </div>
          <div>
            <span>Kurs</span>
            {fiat(active.p, currencyCode)}
          </div>
        </div>
      )}
    </div>
  );
}
