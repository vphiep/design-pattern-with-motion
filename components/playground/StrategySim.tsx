'use client';

import { useCallback, useRef, useState } from 'react';
import {
  useCanvas,
  progress,
  easeInOut,
  lerp,
  fitText,
  type CanvasFrame
} from '@/lib/canvas/useCanvas';
import { useLocale } from '@/components/LocaleProvider';

type Strat = 'none' | 'bulk' | 'seasonal';

const STRATS: { id: Strat; label: string; short: string; run: (p: number, q: number) => number }[] =
  [
    { id: 'none', label: 'NoDiscount', short: 'None', run: (p, q) => p * q },
    {
      id: 'bulk',
      label: 'BulkDiscount',
      short: 'Bulk',
      run: (p, q) => p * q * (q >= 10 ? 0.8 : 1)
    },
    { id: 'seasonal', label: 'SeasonalDiscount', short: 'Seasonal', run: (p, q) => p * q * 0.7 }
  ];

/** set(strategy): the slot wire swings to the new card. */
const SWAP_MS = 350;
/** quote(p, q): call goes down to the strategy, result comes back up. */
const LEG_MS = 380;

export function StrategySim() {
  const { ui } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strat, setStrat] = useState<Strat>('bulk');
  const [qty, setQty] = useState(12);
  const price = 10;
  const impl = STRATS.find((s) => s.id === strat)!;
  const total = impl.run(price, qty);

  const swap = useRef({ from: 1, start: 0 });
  const call = useRef(0);

  const quote = () => {
    const now = performance.now();
    // While the slider is dragged, let the running call finish instead of restarting it every tick.
    if (now - call.current > LEG_MS * 2) call.current = now;
  };

  const choose = (id: Strat) => {
    if (id === strat) return;
    const now = performance.now();
    swap.current = { from: STRATS.findIndex((s) => s.id === strat), start: now };
    call.current = now + SWAP_MS;
    setStrat(id);
  };

  const draw = useCallback(
    ({ ctx, w, colors, fonts, now, reduced }: CanvasFrame) => {
      const ctxX = w / 2;
      const ctxY = 72;
      const boxW = Math.min(220, w - 32);
      ctx.strokeStyle = colors.accent;
      ctx.strokeRect(ctxX - boxW / 2, ctxY - 36, boxW, 72);
      ctx.fillStyle = colors.muted;
      ctx.font = `11px ${fonts.mono}`;
      ctx.textAlign = 'center';
      ctx.fillText('Checkout.pricing', ctxX, ctxY - 14);
      ctx.fillStyle = colors.text;
      ctx.font = `18px ${fonts.display}`;
      ctx.fillText(fitText(ctx, impl.label, impl.short, boxW - 12), ctxX, ctxY + 16);

      const cardW = Math.min(150, Math.max(80, (w - 36) / 3 - 6));
      const gap = Math.max(4, Math.min(18, (w - cardW * 3) / 4));
      const startX = Math.max(8, (w - (cardW * 3 + gap * 2)) / 2);
      const cardY = 180;
      const cardCx = (i: number) => startX + i * (cardW + gap) + cardW / 2;
      const activeIdx = STRATS.findIndex((s) => s.id === strat);

      ctx.font = `12px ${fonts.mono}`;
      STRATS.forEach((s, i) => {
        const x = cardCx(i) - cardW / 2;
        ctx.fillStyle = s.id === strat ? colors.accent : colors.surface;
        ctx.strokeStyle = colors.border;
        ctx.fillRect(x, cardY, cardW, 48);
        ctx.strokeRect(x, cardY, cardW, 48);
        ctx.fillStyle = s.id === strat ? colors.bg : colors.text;
        ctx.fillText(fitText(ctx, s.label, s.short, cardW - 8), x + cardW / 2, cardY + 30);
      });

      // The single slot: a wire from the context to whichever strategy is installed.
      const sp = easeInOut(progress(now, swap.current.start, SWAP_MS, reduced));
      const endX = lerp(cardCx(swap.current.from), cardCx(activeIdx), sp);
      const a = { x: ctxX, y: ctxY + 36 };
      const b = { x: endX, y: cardY };
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.lineWidth = 1;

      // quote() → pricing.totalFor(p, q) → result.
      const cp = progress(now, call.current, LEG_MS * 2, reduced);
      const started = reduced || now >= call.current;
      const calling = started && cp < 1;
      if (calling) {
        const down = cp < 0.5;
        const t = easeInOut(down ? cp * 2 : (cp - 0.5) * 2);
        const x = down ? lerp(a.x, b.x, t) : lerp(b.x, a.x, t);
        const y = down ? lerp(a.y, b.y, t) : lerp(b.y, a.y, t);
        ctx.fillStyle = down ? colors.accent : colors.secondary;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `10px ${fonts.mono}`;
        ctx.textAlign = 'left';
        ctx.fillText(down ? `totalFor(${price}, ${qty})` : total.toFixed(2), x + 9, y + 3);
        ctx.textAlign = 'center';
      }

      const text = `$${price} × ${qty}  →  $${total.toFixed(2)}`;
      let size = 28;
      ctx.font = `${size}px ${fonts.display}`;
      const tw = ctx.measureText(text).width;
      if (tw > w - 24) {
        size = Math.floor((size * (w - 24)) / tw);
        ctx.font = `${size}px ${fonts.display}`;
      }
      // The new total lands when the result gets back to the context.
      ctx.fillStyle = calling || !started ? colors.muted : colors.text;
      ctx.fillText(text, w / 2, 320);

      return sp < 1 || !started || calling;
    },
    [impl.label, impl.short, strat, qty, total, price]
  );

  useCanvas(canvasRef, draw, [strat, qty, total]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3">
        {STRATS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => choose(s.id)}
            aria-pressed={strat === s.id}
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
            onChange={(e) => {
              quote();
              setQty(Number(e.target.value));
            }}
          />
          {qty}
        </label>
      </div>
      <canvas ref={canvasRef} className="h-[380px] w-full" />
    </div>
  );
}
