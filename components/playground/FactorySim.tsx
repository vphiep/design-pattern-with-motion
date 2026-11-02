'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvas, type CanvasFrame } from '@/lib/canvas/useCanvas';
import { useLocale } from '@/components/LocaleProvider';

type Kind = 'stdout' | 'file' | 'net';

interface Product {
  id: number;
  kind: Kind;
  x: number;
  life: number;
}

const KINDS: { id: Kind; label: string }[] = [
  { id: 'stdout', label: 'StdoutLogger' },
  { id: 'file', label: 'FileLogger' },
  { id: 'net', label: 'NetLogger' }
];

export function FactorySim() {
  const { ui } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const nextId = useRef(1);

  const spawn = (kind: Kind) => {
    setProducts((p) => [...p, { id: nextId.current++, kind, x: 0, life: 1 }]);
  };

  const draw = useCallback(
    ({ ctx, w, h, colors }: CanvasFrame) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(w / 2 - 90, 40, 180, 120);
      ctx.fillRect(w / 2 - 90, 40, 180, 120);
      ctx.fillStyle = colors.text;
      ctx.font = '16px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Logger factory', w / 2, 95);
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = colors.muted;
      ctx.fillText('createDestination()', w / 2, 118);

      products.forEach((p, i) => {
        const x = w / 2 + 130 + (i % 3) * 10;
        const y = 220 + i * 36;
        ctx.fillStyle =
          p.kind === 'stdout' ? colors.accent : p.kind === 'file' ? colors.secondary : colors.text;
        ctx.fillRect(x - 70, y - 16, 140, 32);
        ctx.fillStyle = colors.bg;
        ctx.font = '12px ui-monospace, monospace';
        ctx.fillText(p.kind, x, y + 4);
      });
    },
    [products]
  );

  useCanvas(canvasRef, draw, [products]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => spawn(k.id)}
            className="border-hairline bg-surface px-3 py-1.5 text-sm hover:bg-accent hover:text-bg"
          >
            {ui.playground.factory.request(k.label)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setProducts([])}
          className="border-hairline bg-surface px-3 py-1.5 text-sm hover:bg-bg-elevated"
        >
          {ui.playground.factory.clear}
        </button>
      </div>
      <canvas ref={canvasRef} className="h-[380px] w-full" />
    </div>
  );
}
