'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function ColumnarStorageScene({
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
      // Step 0: Row Groups & Dictionary Encoding
      tl.addLabel('step-0');
      tl.from('.cs-row-group', { opacity: 0, y: -20, duration: 0.4 });
      tl.from('.cs-col-strip', { scaleY: 0, stagger: 0.15, transformOrigin: 'top center', duration: 0.35 });

      // Step 1: SIMD Vector Execution
      tl.addLabel('step-1');
      tl.from('.cs-simd-register', { opacity: 0, scale: 0.9, duration: 0.4 });
      tl.from('.cs-simd-lane', { opacity: 0, x: -10, stagger: 0.1, duration: 0.3 });
      tl.to('.cs-simd-active', { fill: '#10b981', duration: 0.3 });

      // Step 2: Min/Max Predicate Pushdown Skip
      tl.addLabel('step-2');
      tl.from('.cs-pushdown-filter', { opacity: 0, y: 20, duration: 0.45 });
      tl.to('.cs-skipped-chunk', { opacity: 0.2, stroke: '#ef4444', duration: 0.3 });
      tl.to('.cs-skip-badge', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        COLUMNAR PARQUET · ROW GROUPS &amp; SIMD VECTORIZATION
      </Caption>

      {/* Step 0: Row Group Column Strips */}
      <g className="cs-row-group" transform="translate(40, 60)">
        <rect width={340} height={130} rx={10} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect x={12} y={10} width={180} height={22} rx={11} fill="#0284c7" />
        <text x={102} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          1. PARQUET ROW GROUP
        </text>

        {/* Columns stored contiguously */}
        <g transform="translate(15, 45)">
          <g className="cs-col-strip" transform="translate(0, 0)">
            <rect width={95} height={50} rx={6} fill="rgba(2, 132, 199, 0.1)" stroke="#0284c7" strokeWidth={1} />
            <text x={47} y={18} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              col: id (int)
            </text>
            <text x={47} y={35} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
              [1, 2, 3, 4]
            </text>
          </g>

          <g className="cs-col-strip" transform="translate(105, 0)">
            <rect width={105} height={50} rx={6} fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth={1} />
            <text x={52} y={18} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              col: status (dict)
            </text>
            <text x={52} y={35} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
              [&apos;PAID&apos; → 0]
            </text>
          </g>

          <g className="cs-col-strip" transform="translate(220, 0)">
            <rect width={90} height={50} rx={6} fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeWidth={1} />
            <text x={45} y={18} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              col: amount
            </text>
            <text x={45} y={35} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
              [50, 120, 80]
            </text>
          </g>
        </g>
        <text x={18} y={116} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
          Only requested columns are loaded from physical SSD!
        </text>
      </g>

      {/* Step 1: SIMD Vectorized Execution */}
      <g className="cs-simd-register" transform="translate(400, 60)">
        <rect width={360} height={130} rx={10} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
        <rect x={12} y={10} width={180} height={22} rx={11} fill="#10b981" />
        <text x={102} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          2. CPU SIMD 512-BIT VECTOR
        </text>

        {/* 4 Vector Lanes evaluated simultaneously in 1 CPU cycle */}
        <g transform="translate(15, 45)">
          <g className="cs-simd-lane" transform="translate(0, 0)">
            <rect className="cs-simd-active" width={75} height={42} rx={6} fill="var(--bg-elevated)" />
            <text x={37} y={18} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Lane #0
            </text>
            <text x={37} y={32} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
              50 &gt; 100 ✗
            </text>
          </g>

          <g className="cs-simd-lane" transform="translate(82, 0)">
            <rect className="cs-simd-active" width={75} height={42} rx={6} fill="var(--bg-elevated)" />
            <text x={37} y={18} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Lane #1
            </text>
            <text x={37} y={32} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
              120 &gt; 100 ✓
            </text>
          </g>

          <g className="cs-simd-lane" transform="translate(164, 0)">
            <rect className="cs-simd-active" width={75} height={42} rx={6} fill="var(--bg-elevated)" />
            <text x={37} y={18} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Lane #2
            </text>
            <text x={37} y={32} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
              80 &gt; 100 ✗
            </text>
          </g>

          <g className="cs-simd-lane" transform="translate(246, 0)">
            <rect className="cs-simd-active" width={80} height={42} rx={6} fill="var(--bg-elevated)" />
            <text x={40} y={18} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Lane #3
            </text>
            <text x={40} y={32} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
              250 &gt; 100 ✓
            </text>
          </g>
        </g>
        <text x={18} y={116} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
          Vectorized filtering without branch misprediction stalls!
        </text>
      </g>

      {/* Step 2: Predicate Pushdown & Min/Max Skipping */}
      <g className="cs-pushdown-filter" transform="translate(40, 205)">
        <rect width={720} height={110} rx={10} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={1.5} />
        <rect x={12} y={10} width={220} height={22} rx={11} fill="#8b5cf6" />
        <text x={122} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          3. PREDICATE PUSHDOWN (MIN/MAX)
        </text>

        <g transform="translate(20, 45)">
          {/* Query condition */}
          <text x={0} y={15} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Query Filter: WHERE amount &gt; 1000
          </text>
          <text x={0} y={35} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            Row Group #2 Metadata: [min_amount: 10, max_amount: 450]
          </text>
        </g>

        {/* Skipped Chunk Card */}
        <g className="cs-skipped-chunk" transform="translate(390, 40)">
          <rect width={150} height={48} rx={6} fill="var(--bg-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={75} y={20} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            Row Group #2
          </text>
          <text x={75} y={36} textAnchor="middle" fill="#ef4444" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            SKIPPED (0 IOPS)
          </text>
        </g>

        {/* Skip Badge */}
        <g className="cs-skip-badge" opacity={0} transform="translate(560, 48)">
          <rect width={140} height={32} rx={16} fill="#10b981" />
          <text x={70} y={20} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            ✓ 100% DISK SKIP
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
