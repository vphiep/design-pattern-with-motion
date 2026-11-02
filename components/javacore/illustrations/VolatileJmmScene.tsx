'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function VolatileJmmScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Write Staged in CPU Store Buffer
      tl.addLabel('step-0');
      tl.from('.core1-container', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.store-buffer-box', { opacity: 0, scale: 0.9, duration: 0.35 });
      tl.to('.store-buffer-val', { textContent: 'isReady = true', fill: '#f59e0b', duration: 0.2 });
      tl.from('.uncommitted-warning', { opacity: 0, duration: 0.3 });

      // Step 1: Memory Barrier Flushes Store Buffer
      tl.addLabel('step-1');
      tl.from('.memory-barrier-banner', { opacity: 0, scaleY: 0, duration: 0.35 });
      tl.to('.store-buffer-val', { textContent: '[FLUSHED]', fill: '#10b981', duration: 0.2 });
      tl.to('.main-ram-val', { textContent: 'isReady = true', fill: '#10b981', duration: 0.3 });
      tl.from('.ram-flush-arrow', { opacity: 0, scaleY: 0, duration: 0.3 }, '-=0.1');

      // Step 2: MESI Invalidation & Coherent Read by Core 2
      tl.addLabel('step-2');
      tl.from('.core2-container', { opacity: 0, x: 20, duration: 0.4 });
      tl.to('.core2-cache-line', { fill: '#e11d48', stroke: '#e11d48', duration: 0.3 });
      tl.to('.mesi-state', { textContent: 'MESI: Invalid (I)', fill: '#ffffff', duration: 0.2 });
      tl.from('.coherent-read-arrow', { opacity: 0, scaleY: 0, duration: 0.35 });
      tl.to('.core2-read-val', { textContent: 'Reads isReady = true', fill: '#10b981', duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        JAVA MEMORY MODEL (JSR-133) · CPU STORE BUFFERS, MEMORY BARRIERS &amp; MESI
      </Caption>

      {/* CPU Core 1 (Left) */}
      <g className="core1-container" transform="translate(40, 70)">
        <rect width={210} height={250} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={210} height={28} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={105} y={19} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          CPU CORE 1 (Writer Thread)
        </text>

        {/* Core 1 L1 Data Cache */}
        <g transform="translate(15, 38)">
          <rect width={180} height={45} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={18} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>L1 Cache Line (MESI: Modified):</text>
          <text x={10} y={34} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">data = 42</text>
        </g>

        {/* CPU Store Buffer */}
        <g className="store-buffer-box" transform="translate(15, 92)">
          <rect width={180} height={85} rx={6} fill="var(--surface-elevated)" stroke="#f59e0b" strokeWidth={1.5} />
          <text x={10} y={20} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Hardware Store Buffer
          </text>
          <text x={10} y={36} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Staged async write:
          </text>
          <text className="store-buffer-val" x={10} y={54} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Empty
          </text>

          {/* Warning badge */}
          <g className="uncommitted-warning" opacity={0} transform="translate(10, 62)">
            <text x={0} y={14} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              Not yet visible to other CPUs!
            </text>
          </g>
        </g>

        {/* Memory Barrier Instruction */}
        <g className="memory-barrier-banner" opacity={0} transform="translate(15, 188)">
          <rect width={180} height={48} rx={4} fill="#10b981" fillOpacity={0.15} stroke="#10b981" />
          <text x={10} y={18} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            StoreLoad Barrier:
          </text>
          <text x={10} y={34} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            lock addl $0,0(%rsp) (MFENCE)
          </text>
        </g>
      </g>

      {/* Main Memory / L3 Shared Cache (Center Bottom) */}
      <g transform="translate(270, 70)">
        <rect width={250} height={250} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
        <rect width={250} height={28} rx={8} fill="var(--surface-elevated)" />
        <text x={125} y={19} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          MAIN RAM &amp; L3 CACHE
        </text>

        <g transform="translate(20, 50)">
          <rect width={210} height={60} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={15} y={22} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            Main Memory Shared Variables:
          </text>
          <text x={15} y={42} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            int data = 42
          </text>
        </g>

        <g transform="translate(20, 125)">
          <rect width={210} height={60} rx={6} fill="var(--surface-elevated)" stroke="#0284c7" strokeWidth={1} />
          <text x={15} y={22} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            volatile boolean isReady:
          </text>
          <text className="main-ram-val" x={15} y={44} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={12} fontWeight="bold">
            isReady = false
          </text>
        </g>

        {/* Flush Arrow from Core 1 */}
        <g className="ram-flush-arrow" opacity={0}>
          <path d="M 0 160 L 20 160" stroke="#10b981" strokeWidth={2} fill="none" />
          <polygon points="20,160 12,156 12,164" fill="#10b981" />
        </g>
      </g>

      {/* CPU Core 2 (Right) */}
      <g className="core2-container" transform="translate(540, 70)">
        <rect width={220} height={250} rx={8} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={1.5} />
        <rect width={220} height={28} rx={8} fill="#8b5cf6" fillOpacity={0.15} />
        <text x={110} y={19} textAnchor="middle" fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          CPU CORE 2 (Reader Thread)
        </text>

        {/* Core 2 L1 Cache Line */}
        <g transform="translate(15, 38)">
          <rect className="core2-cache-line" width={190} height={60} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text className="mesi-state" x={10} y={22} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            MESI: Shared (S)
          </text>
          <text x={10} y={42} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            Stale: isReady = false
          </text>
        </g>

        {/* Invalidation arrow from Core 1 */}
        <g transform="translate(15, 110)">
          <rect width={190} height={65} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            MESI Invalidate Queue:
          </text>
          <text x={10} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Core 1 broadcast invalidate &rarr;
          </text>
          <text x={10} y={52} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            L1 Cache Line Invalidation OK
          </text>
        </g>

        {/* Resulting Coherent Read */}
        <g transform="translate(15, 188)">
          <rect width={190} height={48} rx={4} fill="#10b981" fillOpacity={0.15} stroke="#10b981" />
          <text className="core2-read-val" x={10} y={28} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Waiting for volatile write...
          </text>
        </g>
      </g>

      {/* Bottom Summary Bar */}
      <g transform="translate(40, 340)">
        <rect width={720} height={95} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1} />
        <text x={20} y={28} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          Happens-Before Order (JMM JSR-133):
        </text>
        <text x={20} y={50} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
          1. Program Order: Write &apos;data = 42&apos; happens-before volatile Write &apos;isReady = true&apos;.
        </text>
        <text x={20} y={68} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
          2. Volatile Rule: Volatile Write &apos;isReady = true&apos; happens-before volatile Read &apos;isReady == true&apos;.
        </text>
        <text x={20} y={84} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          3. Transitivity: Reader Core 2 is GUARANTEED to see &apos;data = 42&apos; with zero CPU reordering bugs!
        </text>
      </g>
    </SceneBoard>
  );
}
