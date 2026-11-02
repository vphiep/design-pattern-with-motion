'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvas, progress, easeInOut, lerp, type CanvasFrame } from '@/lib/canvas/useCanvas';
import { useLocale } from '@/components/LocaleProvider';

interface Node {
  id: string;
  /** Position as a fraction of the canvas, so the scene fits any width. */
  rx: number;
  ry: number;
  label: string;
}

interface Publish {
  id: number;
  start: number;
  /** Subscriber ids in list order at the moment publish() ran. */
  targets: string[];
}

const SUBJECT_R = 28;
const NODE_R = 22;
const MAX_OBSERVERS = 12;
/** publish() walks the list in order; each update(news) is staggered so the order is visible. */
const STAGGER_MS = 180;
const TRAVEL_MS = 450;
const FLASH_MS = 400;

function subjectOf(w: number, h: number) {
  return { x: w * 0.5, y: Math.min(120, h * 0.28) };
}

/** Free-ish grid slot for the n-th observer: five columns, three rows. */
function slotFor(n: number) {
  return { rx: 0.14 + (n % 5) * 0.18, ry: 0.6 + (Math.floor(n / 5) % 3) * 0.14 };
}

export function ObserverSim() {
  const { ui } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'a', rx: 0.22, ry: 0.74, label: 'email' },
    { id: 'b', rx: 0.5, ry: 0.84, label: 'phone' },
    { id: 'c', rx: 0.78, ry: 0.68, label: 'log' }
  ]);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const publishes = useRef<Publish[]>([]);
  const publishId = useRef(0);
  const nodeSeq = useRef(nodes.length);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const draw = useCallback(
    ({ ctx, w, h, colors, fonts, now, reduced }: CanvasFrame) => {
      const subject = subjectOf(w, h);
      const pos = (n: Node) => ({ x: n.rx * w, y: n.ry * h });
      const byId = new Map(nodes.map((n) => [n.id, n]));

      ctx.strokeStyle = colors.border;
      ctx.globalAlpha = 0.12;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Work out, per subscriber, the packet in flight and how recently update() ran.
      const total = (p: Publish) => (p.targets.length - 1) * STAGGER_MS + TRAVEL_MS + FLASH_MS;
      publishes.current = publishes.current.filter(
        (p) => progress(now, p.start, total(p), reduced) < 1
      );
      const packets: { id: string; t: number }[] = [];
      const flash = new Map<string, number>();
      for (const p of publishes.current) {
        p.targets.forEach((id, i) => {
          const sent = p.start + i * STAGGER_MS;
          const arrived = sent + TRAVEL_MS;
          if (now >= sent && now < arrived) packets.push({ id, t: (now - sent) / TRAVEL_MS });
          if (now >= arrived && now < arrived + FLASH_MS) {
            flash.set(id, Math.max(flash.get(id) ?? 0, 1 - (now - arrived) / FLASH_MS));
          }
        });
      }

      // Edges run between the circle rims, whichever way a node was dragged.
      const rim = (n: Node) => {
        const { x, y } = pos(n);
        const dx = x - subject.x;
        const dy = y - subject.y;
        const d = Math.hypot(dx, dy) || 1;
        return {
          ax: subject.x + (dx / d) * SUBJECT_R,
          ay: subject.y + (dy / d) * SUBJECT_R,
          bx: x - (dx / d) * NODE_R,
          by: y - (dy / d) * NODE_R
        };
      };
      for (const n of nodes) {
        const e = rim(n);
        const f = flash.get(n.id) ?? 0;
        ctx.beginPath();
        ctx.moveTo(e.ax, e.ay);
        ctx.lineTo(e.bx, e.by);
        ctx.strokeStyle = f > 0 ? colors.accent : colors.muted;
        ctx.lineWidth = 1 + f;
        ctx.stroke();
      }
      ctx.lineWidth = 1;

      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(subject.x, subject.y, SUBJECT_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = `12px ${fonts.mono}`;
      ctx.textAlign = 'center';
      ctx.fillText('subject', subject.x, subject.y + 4);

      for (const pk of packets) {
        const n = byId.get(pk.id);
        if (!n) continue; // unsubscribed while the event was in flight
        const e = rim(n);
        const t = easeInOut(pk.t);
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(lerp(e.ax, e.bx, t), lerp(e.ay, e.by, t), 5, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const n of nodes) {
        const { x, y } = pos(n);
        const f = flash.get(n.id) ?? 0;
        ctx.fillStyle = colors.surface;
        ctx.strokeStyle = colors.border;
        ctx.beginPath();
        ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (f > 0) {
          ctx.globalAlpha = f;
          ctx.fillStyle = colors.accent;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, NODE_R + 8 * (1 - f), 0, Math.PI * 2);
          ctx.strokeStyle = colors.accent;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = f > 0.5 ? colors.bg : colors.text;
        ctx.fillText(n.label, x, y + 4);
      }

      return publishes.current.length > 0;
    },
    [nodes]
  );

  const [tick, setTick] = useState(0);
  useCanvas(canvasRef, draw, [nodes, tick]);

  const toLocal = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // Topmost (last drawn) node wins.
  const hit = (x: number, y: number, w: number, h: number) =>
    [...nodes].reverse().find((n) => (n.rx * w - x) ** 2 + (n.ry * h - y) ** 2 < NODE_R * NODE_R);

  const notify = () => {
    const id = ++publishId.current;
    publishes.current.push({ id, start: performance.now(), targets: nodes.map((n) => n.id) });
    setLog((l) => [{ id, text: `publish #${id} → ${nodes.length} update()` }, ...l].slice(0, 6));
    setTick((t) => t + 1);
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3">
        <button
          type="button"
          onClick={notify}
          className="border-hairline bg-accent px-3 py-1.5 text-sm text-bg hover:bg-accent-strong"
        >
          {ui.playground.observer.publish}
        </button>
        <button
          type="button"
          disabled={nodes.length >= MAX_OBSERVERS}
          onClick={() => {
            const seq = ++nodeSeq.current;
            setNodes((n) => [...n, { id: `o-${seq}`, ...slotFor(n.length), label: `obs ${seq}` }]);
          }}
          className="border-hairline bg-surface px-3 py-1.5 text-sm hover:bg-bg-elevated disabled:opacity-40"
        >
          {ui.playground.observer.addObserver}
        </button>
        <button
          type="button"
          disabled={nodes.length === 0}
          onClick={() => setNodes((n) => n.slice(0, -1))}
          className="border-hairline bg-surface px-3 py-1.5 text-sm hover:bg-bg-elevated disabled:opacity-40"
        >
          {ui.playground.observer.removeLast}
        </button>
        <span className="caption ml-auto">{ui.playground.observer.dragHint}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
        <canvas
          ref={canvasRef}
          className="h-[380px] w-full cursor-crosshair touch-none"
          onPointerDown={(e) => {
            const p = toLocal(e);
            const rect = e.currentTarget.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const subject = subjectOf(w, h);
            if ((p.x - subject.x) ** 2 + (p.y - subject.y) ** 2 < SUBJECT_R * SUBJECT_R) {
              notify();
              return;
            }
            const n = hit(p.x, p.y, w, h);
            if (n) {
              drag.current = { id: n.id, dx: p.x - n.rx * w, dy: p.y - n.ry * h };
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const p = toLocal(e);
            const rect = e.currentTarget.getBoundingClientRect();
            const { id, dx, dy } = drag.current;
            const rx = Math.min(0.96, Math.max(0.04, (p.x - dx) / rect.width));
            const ry = Math.min(0.94, Math.max(0.08, (p.y - dy) / rect.height));
            setNodes((list) => list.map((n) => (n.id === id ? { ...n, rx, ry } : n)));
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        />
        <aside className="border-t border-border-soft p-4 font-mono text-xs md:border-l md:border-t-0">
          <p className="caption mb-2">{ui.playground.observer.eventLog}</p>
          {log.length === 0 && (
            <p className="text-text-soft">{ui.playground.observer.noPublishes}</p>
          )}
          <ul className="space-y-1 text-text-muted">
            {log.map((l) => (
              <li key={l.id}>{l.text}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
