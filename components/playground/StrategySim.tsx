'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvas, type CanvasFrame } from '@/lib/canvas/useCanvas';
import { useLocale } from '@/components/LocaleProvider';

type Strat = 'none' | 'bulk' | 'seasonal';

const STRATS: { id: Strat; label: string; run: (p: number, q: number) => number }[] = [
  { id: 'none', label: 'NoDiscount', run: (p, q) => p * q },
  { id: 'bulk', label: 'BulkDiscount', run: (p, q) => p * q * (q >= 10 ? 0.8 : 1) },
  { id: 'seasonal', label: 'SeasonalDiscount', run: (p, q) => p * q * 0.7 }
];

export function StrategySim() {
  const { ui } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strat, setStrat] = useState<Strat>('bulk');
  const [qty, setQty] = useState(12);
  const price = 10;
  const impl = STRATS.find((s) => s.id === strat)!;
  const total = impl.run(price, qty);

  const draw = useCallback(
    ({ ctx, w, h, colors }: CanvasFrame) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = colors.accent;
      ctx.strokeRect(w / 2 - 110, 36, 220, 72);
      ctx.fillStyle = colors.muted;
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Checkout.pricing', w / 2, 58);
      ctx.fillStyle = colors.text;
      ctx.font = '18px Georgia, serif';
      ctx.fillText(impl.label, w / 2, 88);

      const cardW = Math.min(150, Math.max(88, (w - 36) / 3 - 6));
      const gap = Math.max(4, Math.min(18, (w - cardW * 3) / 4));
      const startX = Math.max(8, (w - (cardW * 3 + gap * 2)) / 2);
      STRATS.forEach((s, i) => {
        const x = startX + i * (cardW + gap);
        const y = 180;
        ctx.fillStyle = s.id === strat ? colors.accent : colors.surface;
        ctx.strokeStyle = colors.border;
        ctx.fillRect(x, y, cardW, 48);
        ctx.strokeRect(x, y, cardW, 48);
        ctx.fillStyle = s.id === strat ? colors.bg : colors.text;
        ctx.font = '12px ui-monospace, monospace';
        ctx.fillText(s.label, x + cardW / 2, y + 30);
      });

      ctx.fillStyle = colors.text;
      ctx.font = '28px Georgia, serif';
      ctx.fillText(`$${price} × ${qty}  →  $${total.toFixed(2)}`, w / 2, 320);
    },
    [impl.label, strat, qty, total, price]
  );

  useCanvas(canvasRef, draw, [strat, qty, total]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3">
        {STRATS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStrat(s.id)}
            className={`border-hairline px-3 py-1.5 text-sm ${strat === s.id ? 'bg-accent text-bg' : 'bg-surface hover:bg-bg-elevated'}`}
          >
            {s.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 font-mono text-xs text-text-muted">
          {ui.playground.strategy.qty}
          <input
            type="range"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
          {qty}
        </label>
      </div>
      <canvas ref={canvasRef} className="h-[380px] w-full" />
    </div>
  );
}
