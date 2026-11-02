'use client';

import { useCallback, useRef, useState } from 'react';
import {
  useCanvas,
  progress,
  easeInOut,
  easeOut,
  lerp,
  approach,
  fitText,
  type CanvasFrame
} from '@/lib/canvas/useCanvas';
import { useLocale } from '@/components/LocaleProvider';

type CreatorId = 'stdout' | 'file';

/** Mirrors the lesson's Java: each Logger subclass overrides createDestination(). */
const CREATORS: { id: CreatorId; creator: string; product: string; short: string }[] = [
  { id: 'stdout', creator: 'StdoutLogger', product: 'StdoutDestination', short: 'Stdout' },
  { id: 'file', creator: 'FileLogger', product: 'FileDestination', short: 'File' }
];

const MAX_PRODUCTS = 5;
/** Timeline of one `logger.log("hello")` call, in ms from the click. */
const T_CALL = 450; // caller → Logger.log()
const T_CREATE = 800; // createDestination() runs, product appears
const T_WRITE_FROM = 1500; // write(message) reaches the product
const T_WRITE_TO = 2100;
const FADE_MS = 300;

interface Product {
  id: number;
  kind: CreatorId;
  born: number;
  /** Drawn position; eased toward its slot every frame. */
  x: number;
  y: number;
  removedAt?: number;
}

export function FactorySim() {
  const { ui } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const products = useRef<Product[]>([]);
  const nextId = useRef(1);
  const [version, setVersion] = useState(0);
  const [lastCreator, setLastCreator] = useState<CreatorId | null>(null);

  const log = (kind: CreatorId) => {
    const now = performance.now();
    products.current.push({ id: nextId.current++, kind, born: now, x: NaN, y: NaN });
    const live = products.current.filter((p) => p.removedAt === undefined);
    live.slice(0, Math.max(0, live.length - MAX_PRODUCTS)).forEach((p) => (p.removedAt = now));
    setLastCreator(kind);
    setVersion((v) => v + 1);
  };

  const clear = () => {
    const now = performance.now();
    products.current.forEach((p) => (p.removedAt ??= now));
    setLastCreator(null);
    setVersion((v) => v + 1);
  };

  const draw = useCallback(
    ({ ctx, w, colors, fonts, now, dt, reduced }: CanvasFrame) => {
      let moving = false;
      const boxW = Math.min(170, w * 0.4);
      const caller = { x: Math.max(boxW / 2 + 12, w * 0.2), y: 70 };
      const creator = { x: Math.min(w - boxW / 2 - 12, w * 0.68), y: 70 };
      const beltY = 250;

      // Caller
      ctx.strokeStyle = colors.border;
      ctx.fillStyle = colors.surface;
      ctx.fillRect(caller.x - boxW / 2, caller.y - 30, boxW, 60);
      ctx.strokeRect(caller.x - boxW / 2, caller.y - 30, boxW, 60);
      ctx.textAlign = 'center';
      ctx.fillStyle = colors.muted;
      ctx.font = `11px ${fonts.mono}`;
      ctx.fillText('caller', caller.x, caller.y - 8);
      ctx.fillStyle = colors.text;
      ctx.fillText(
        fitText(ctx, 'logger.log("hello")', 'log("hello")', boxW - 10),
        caller.x,
        caller.y + 14
      );

      // Creator: abstract Logger + the concrete subclass that was picked.
      const latest = products.current.filter((p) => p.removedAt === undefined).at(-1);
      const creating = latest ? progress(now, latest.born, T_CREATE, reduced) : 1;
      const hot = latest !== undefined && creating > T_CALL / T_CREATE && creating < 1;
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = hot ? colors.accent : colors.border;
      ctx.lineWidth = hot ? 2 : 1;
      ctx.fillRect(creator.x - boxW / 2, creator.y - 40, boxW, 80);
      ctx.strokeRect(creator.x - boxW / 2, creator.y - 40, boxW, 80);
      ctx.lineWidth = 1;
      const sub = CREATORS.find((c) => c.id === lastCreator);
      ctx.fillStyle = colors.muted;
      ctx.font = `11px ${fonts.mono}`;
      ctx.fillText(sub ? `${sub.creator} extends` : 'abstract', creator.x, creator.y - 20);
      ctx.fillStyle = colors.text;
      ctx.font = `16px ${fonts.display}`;
      ctx.fillText('Logger', creator.x, creator.y + 2);
      ctx.font = `11px ${fonts.mono}`;
      ctx.fillStyle = hot ? colors.accent : colors.muted;
      ctx.fillText(
        fitText(ctx, 'createDestination()', 'create…()', boxW - 10),
        creator.x,
        creator.y + 24
      );

      // Caller → creator wire, and the conveyor belt.
      ctx.strokeStyle = colors.muted;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(caller.x + boxW / 2, caller.y);
      ctx.lineTo(creator.x - boxW / 2, creator.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(12, beltY + 26);
      ctx.lineTo(w - 12, beltY + 26);
      ctx.stroke();
      const beltShift = reduced ? 0 : (now / 40) % 16;
      ctx.globalAlpha = 0.4;
      for (let x = 12 + beltShift; x < w - 12; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, beltY + 26);
        ctx.lineTo(x - 6, beltY + 34);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Products
      products.current = products.current.filter(
        (p) => p.removedAt === undefined || progress(now, p.removedAt, FADE_MS, reduced) < 1
      );
      const live = products.current.filter((p) => p.removedAt === undefined);
      const slotW = Math.min(130, (w - 24) / MAX_PRODUCTS);
      const pw = slotW - 8;
      for (const p of products.current) {
        const age = reduced ? Infinity : now - p.born;
        const slot = live.indexOf(p);
        const targetX = 12 + slotW * (slot < 0 ? 0 : slot) + slotW / 2;
        const born = age >= T_CREATE;

        if (age < T_CALL) {
          // The log() call travelling from caller to Logger.
          const t = easeInOut(age / T_CALL);
          const x = lerp(caller.x + boxW / 2, creator.x - boxW / 2, t);
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.arc(x, caller.y, 5, 0, Math.PI * 2);
          ctx.fill();
          moving = true;
          continue;
        }
        if (!born) {
          moving = true;
          continue;
        }

        if (Number.isNaN(p.x)) {
          p.x = creator.x;
          p.y = creator.y + 40;
        }
        const goX = slot < 0 ? p.x : targetX;
        if (reduced) {
          p.x = goX;
          p.y = beltY;
        } else {
          p.x = approach(p.x, goX, dt, 7);
          p.y = approach(p.y, beltY, dt, 9);
        }
        if (Math.abs(p.x - goX) > 0.5 || Math.abs(p.y - beltY) > 0.5) moving = true;

        const grow = easeOut(progress(now, p.born + T_CREATE, 250, reduced));
        const fade =
          p.removedAt === undefined ? 1 : 1 - progress(now, p.removedAt, FADE_MS, reduced);
        if (fade < 1 || grow < 1) moving = true;
        const def = CREATORS.find((c) => c.id === p.kind)!;
        const bw = pw * lerp(0.6, 1, grow);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.kind === 'stdout' ? colors.accent : colors.secondary;
        ctx.fillRect(p.x - bw / 2, p.y - 22, bw, 44);
        ctx.fillStyle = colors.bg;
        ctx.font = `11px ${fonts.mono}`;
        ctx.fillText(fitText(ctx, def.product, def.short, bw - 8), p.x, p.y - 2);

        // write(message) lands on the freshly built product.
        if (age < T_WRITE_TO) {
          moving = true;
          if (age >= T_WRITE_FROM) {
            const t = (age - T_WRITE_FROM) / (T_WRITE_TO - T_WRITE_FROM);
            ctx.globalAlpha = fade * (1 - t);
            ctx.fillStyle = colors.text;
            ctx.fillText('write("hello")', p.x, p.y - 30 - t * 10);
          }
        }
        ctx.globalAlpha = fade;
        ctx.font = `9px ${fonts.mono}`;
        ctx.fillStyle = colors.bg;
        ctx.fillText(`#${p.id}`, p.x, p.y + 14);
        ctx.globalAlpha = 1;
      }

      return moving;
    },
    [lastCreator]
  );

  useCanvas(canvasRef, draw, [version, lastCreator]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3">
        {CREATORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => log(c.id)}
            className="border-hairline bg-surface px-3 py-1.5 text-sm hover:bg-accent hover:text-bg"
          >
            {ui.playground.factory.request(c.creator)}
          </button>
        ))}
        <button
          type="button"
          onClick={clear}
          className="border-hairline bg-surface px-3 py-1.5 text-sm hover:bg-bg-elevated"
        >
          {ui.playground.factory.clear}
        </button>
      </div>
      <canvas ref={canvasRef} className="h-[380px] w-full" />
    </div>
  );
}
