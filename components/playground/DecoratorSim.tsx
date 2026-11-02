'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvas, type CanvasFrame } from '@/lib/canvas/useCanvas';
import { useLocale } from '@/components/LocaleProvider';

const LAYERS = ['Italic', 'Bold', 'Underline', 'Code'] as const;

export function DecoratorSim() {
  const { ui } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stack, setStack] = useState<string[]>(['Italic', 'Bold']);

  const rendered = stack.reduceRight((inner, layer) => {
    if (layer === 'Bold') return `<b>${inner}</b>`;
    if (layer === 'Italic') return `<i>${inner}</i>`;
    if (layer === 'Underline') return `<u>${inner}</u>`;
    return `<code>${inner}</code>`;
  }, 'hi');

  const draw = useCallback(
    ({ ctx, w, h, colors }: CanvasFrame) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const layers = ['PlainText', ...stack];
      layers.forEach((name, i) => {
        const ww = 120 + i * 56;
        const hh = 70 + i * 40;
        ctx.strokeStyle = i === layers.length - 1 ? colors.accent : colors.border;
        ctx.lineWidth = i === layers.length - 1 ? 2 : 1;
        ctx.strokeRect(cx - ww / 2, cy - hh / 2, ww, hh);
        ctx.fillStyle = colors.muted;
        ctx.font = '11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(name, cx, cy - hh / 2 + 16);
      });
      ctx.fillStyle = colors.text;
      ctx.font = '20px Georgia, serif';
      ctx.fillText('hi', cx, cy + 8);
    },
    [stack]
  );

  useCanvas(canvasRef, draw, [stack]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3">
        {LAYERS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setStack((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]))}
            className={`border-hairline px-3 py-1.5 text-sm ${stack.includes(l) ? 'bg-accent text-bg' : 'bg-surface hover:bg-bg-elevated'}`}
          >
            {stack.includes(l)
              ? ui.playground.decorator.unwrap(l)
              : ui.playground.decorator.wrap(l)}
          </button>
        ))}
        <span className="caption ml-auto hidden sm:inline">
          {ui.playground.decorator.outermostHint}
        </span>
      </div>
      <canvas ref={canvasRef} className="h-[380px] w-full" />
      <p className="border-t border-border-soft px-4 py-3 font-mono text-sm text-text-muted">
        render() → {rendered}
      </p>
    </div>
  );
}
