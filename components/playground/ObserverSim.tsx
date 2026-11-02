'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvas, type CanvasFrame } from '@/lib/canvas/useCanvas';
import { useLocale } from '@/components/LocaleProvider';

interface Node {
  id: string;
  /** Position as a fraction of the canvas, so the scene fits any width. */
  rx: number;
  ry: number;
  label: string;
  flash: number;
}

function subjectOf(w: number, h: number) {
  return { x: w * 0.5, y: Math.min(120, h * 0.28) };
}

export function ObserverSim() {
  const { ui } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'a', rx: 0.22, ry: 0.74, label: 'email', flash: 0 },
    { id: 'b', rx: 0.5, ry: 0.84, label: 'phone', flash: 0 },
    { id: 'c', rx: 0.78, ry: 0.68, label: 'log', flash: 0 }
  ]);
  const [log, setLog] = useState<string[]>([]);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const draw = useCallback(
    ({ ctx, w, h, colors }: CanvasFrame) => {
      const subject = subjectOf(w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = colors.border;
      ctx.globalAlpha = 0.12;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (const n of nodes) {
        const x = n.rx * w;
        const y = n.ry * h;
        ctx.beginPath();
        ctx.moveTo(subject.x, subject.y + 28);
        ctx.lineTo(x, y - 22);
        ctx.strokeStyle = n.flash > 0 ? colors.accent : colors.muted;
        ctx.lineWidth = n.flash > 0 ? 2 : 1;
        ctx.stroke();
      }

      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(subject.x, subject.y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = '12px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('subject', subject.x, subject.y + 4);

      for (const n of nodes) {
        const x = n.rx * w;
        const y = n.ry * h;
        ctx.fillStyle = n.flash > 0 ? colors.accent : colors.surface;
        ctx.strokeStyle = colors.border;
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = n.flash > 0 ? colors.bg : colors.text;
        ctx.fillText(n.label, x, y + 4);
      }
    },
    [nodes]
  );

  useCanvas(canvasRef, draw, [nodes]);

  const toLocal = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const hit = (x: number, y: number, w: number, h: number) =>
    nodes.find((n) => (n.rx * w - x) ** 2 + (n.ry * h - y) ** 2 < 22 * 22);

  const notify = () => {
    const headline = `ping ${new Date().toLocaleTimeString()}`;
    setLog((l) => [headline, ...l].slice(0, 6));
    let i = 0;
    const ids = nodes.map((n) => n.id);
    const tick = () => {
      const id = ids[i];
      if (!id) return;
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, flash: 1 } : n)));
      setTimeout(() => {
        setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, flash: 0 } : n)));
        i += 1;
        tick();
      }, 220);
    };
    tick();
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
          onClick={() =>
            setNodes((n) => [
              ...n,
              {
                id: `o-${Date.now()}`,
                rx: Math.min(0.9, 0.18 + (n.length % 5) * 0.16),
                ry: 0.62 + Math.floor(n.length / 5) * 0.12,
                label: `obs ${n.length + 1}`,
                flash: 0
              }
            ])
          }
          className="border-hairline bg-surface px-3 py-1.5 text-sm hover:bg-bg-elevated"
        >
          {ui.playground.observer.addObserver}
        </button>
        <button
          type="button"
          onClick={() => setNodes((n) => n.slice(0, -1))}
          className="border-hairline bg-surface px-3 py-1.5 text-sm hover:bg-bg-elevated"
        >
          {ui.playground.observer.removeLast}
        </button>
        <span className="caption ml-auto">{ui.playground.observer.dragHint}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
        <canvas
          ref={canvasRef}
          className="h-[380px] w-full cursor-crosshair"
          onPointerDown={(e) => {
            const p = toLocal(e);
            const rect = e.currentTarget.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const subject = subjectOf(w, h);
            if ((p.x - subject.x) ** 2 + (p.y - subject.y) ** 2 < 28 * 28) {
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
          onPointerUp={() => {
            drag.current = null;
          }}
        />
        <aside className="border-t border-border-soft p-4 font-mono text-xs md:border-l md:border-t-0">
          <p className="caption mb-2">{ui.playground.observer.eventLog}</p>
          {log.length === 0 && (
            <p className="text-text-soft">{ui.playground.observer.noPublishes}</p>
          )}
          <ul className="space-y-1 text-text-muted">
            {log.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
