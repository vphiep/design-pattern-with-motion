'use client';

import { useCallback, useRef, useState } from 'react';
import {
  useCanvas,
  progress,
  easeInOut,
  easeOut,
  lerp,
  type CanvasFrame
} from '@/lib/canvas/useCanvas';
import { useLocale } from '@/components/LocaleProvider';

const LAYERS = ['Italic', 'Bold', 'Underline', 'Code'] as const;
type Layer = (typeof LAYERS)[number];

const TAG: Record<Layer, string> = { Italic: 'i', Bold: 'b', Underline: 'u', Code: 'code' };

/** One leg of the call per layer: inward on render(), outward on return. */
const LEG_MS = 320;
const GROW_MS = 280;

/** `stack[0]` is wrapped first (innermost); the last entry is the outermost decorator. */
function renderStack(stack: readonly Layer[], content = 'hi') {
  return stack.reduce((inner, layer) => `<${TAG[layer]}>${inner}</${TAG[layer]}>`, content);
}

export function DecoratorSim() {
  const { ui } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stack, setStack] = useState<Layer[]>(['Italic', 'Bold']);
  const [calls, setCalls] = useState(0);
  const callStart = useRef(0);
  const addedAt = useRef<Partial<Record<Layer, number>>>({});

  const rendered = renderStack(stack);

  const toggle = (l: Layer) => {
    const now = performance.now();
    if (!stack.includes(l)) addedAt.current[l] = now;
    callStart.current = now;
    setStack((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]));
  };

  const draw = useCallback(
    ({ ctx, w, h, colors, fonts, now, reduced }: CanvasFrame) => {
      const cx = w / 2;
      const cy = h / 2 - 14;
      const layers = ['PlainText', ...stack];
      const n = layers.length;
      // Fit the outermost box into the canvas width.
      const stepW = Math.min(56, Math.max(24, (w - 32 - 120) / Math.max(1, n - 1)));
      const box = (i: number) => ({ ww: 120 + i * stepW, hh: 70 + i * 40 });
      const top = (i: number) => (i < 0 ? cy - 22 : cy - box(i).hh / 2);

      // Call trace: in from the outermost layer to PlainText, then back out.
      const legs = n * 2;
      const p = progress(now, callStart.current, legs * LEG_MS, reduced);
      const legPos = p * legs;
      const leg = Math.min(legs - 1, Math.floor(legPos));
      const legT = easeInOut(legPos - leg);
      const inward = leg < n;
      const activeIdx = inward ? n - 1 - leg : leg - n;
      const done = p >= 1;

      layers.forEach((name, i) => {
        const { ww, hh } = box(i);
        const born = name === 'PlainText' ? 0 : (addedAt.current[name as Layer] ?? 0);
        const g = easeOut(progress(now, born, GROW_MS, reduced));
        const isActive = !done && i === activeIdx;
        const isOuter = i === n - 1;
        ctx.globalAlpha = 0.25 + 0.75 * g;
        ctx.strokeStyle = isActive || (done && isOuter) ? colors.accent : colors.border;
        ctx.lineWidth = isActive ? 2.5 : isOuter ? 2 : 1;
        const sw = ww * lerp(0.92, 1, g);
        const sh = hh * lerp(0.92, 1, g);
        ctx.strokeRect(cx - sw / 2, cy - sh / 2, sw, sh);
        ctx.fillStyle = isActive ? colors.accent : colors.muted;
        ctx.font = `11px ${fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.fillText(name, cx, cy - sh / 2 + 16);
      });
      ctx.globalAlpha = 1;

      // The token travelling through the layers.
      if (!done) {
        const from = inward ? top(activeIdx) + 4 : top(activeIdx - 1);
        const to = inward ? top(activeIdx - 1) : top(activeIdx) + 4;
        const ty = lerp(from, to, legT);
        const tx = cx + Math.min(box(n - 1).ww / 2 - 14, 46);
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `10px ${fonts.mono}`;
        ctx.textAlign = 'left';
        ctx.fillText(inward ? 'render() ↓' : 'return ↑', tx + 9, ty + 3);
      }

      // The content, styled by every layer that is in the stack.
      const has = (l: Layer) => stack.includes(l);
      const weight = has('Bold') ? 'bold ' : '';
      const style = has('Italic') ? 'italic ' : '';
      ctx.font = `${style}${weight}22px ${has('Code') ? fonts.mono : fonts.display}`;
      ctx.textAlign = 'center';
      const tw = ctx.measureText('hi').width;
      if (has('Code')) {
        ctx.fillStyle = colors.bg;
        ctx.fillRect(cx - tw / 2 - 6, cy - 12, tw + 12, 30);
      }
      ctx.fillStyle = colors.text;
      ctx.fillText('hi', cx, cy + 10);
      if (has('Underline')) {
        ctx.fillRect(cx - tw / 2, cy + 14, tw, 1.5);
      }

      // The return value, growing outward one layer at a time.
      const built = done ? n - 1 : inward ? -1 : activeIdx - 1 + (legT > 0.5 ? 1 : 0);
      if (built >= 0) {
        const partial = renderStack(stack.slice(0, built));
        ctx.font = `12px ${fonts.mono}`;
        ctx.fillStyle = done ? colors.text : colors.muted;
        ctx.fillText(`→ ${partial}`, cx, h - 18);
      }

      return (
        !done ||
        layers.some(
          (l) => l !== 'PlainText' && progress(now, addedAt.current[l as Layer] ?? 0, GROW_MS) < 1
        )
      );
    },
    [stack]
  );

  useCanvas(canvasRef, draw, [stack, calls]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3">
        {LAYERS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => toggle(l)}
            aria-pressed={stack.includes(l)}
            className={`border-hairline px-3 py-1.5 text-sm ${stack.includes(l) ? 'bg-accent text-bg' : 'bg-surface hover:bg-bg-elevated'}`}
          >
            {stack.includes(l)
              ? ui.playground.decorator.unwrap(l)
              : ui.playground.decorator.wrap(l)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            callStart.current = performance.now();
            setCalls((c) => c + 1);
          }}
          className="border-hairline bg-surface px-3 py-1.5 font-mono text-sm hover:bg-bg-elevated"
        >
          render()
        </button>
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
