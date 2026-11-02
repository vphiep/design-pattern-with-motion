'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function BufferPoolScene({
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
      // Step 0: Page Table Lookup
      tl.addLabel('step-0');
      tl.from('.page-table-box', { opacity: 0, y: -20, duration: 0.4 });
      tl.from('.incoming-page-req', { opacity: 0, x: -30, duration: 0.35 });
      tl.to('.lookup-hit-pulse', { opacity: 1, scale: 1.02, duration: 0.3 });

      // Step 1: Clock Sweeper & Victim Selection
      tl.addLabel('step-1');
      tl.from('.clock-ring', { opacity: 0, scale: 0.95, duration: 0.4 });
      tl.to('.clock-hand', { rotation: -35, transformOrigin: 'center center', duration: 0.5, ease: 'power2.inOut' });
      tl.to('.cleared-bit', { fill: '#64748b', duration: 0.3 }, '-=0.3');
      tl.to('.victim-target', { stroke: '#ef4444', strokeWidth: 2.5, duration: 0.4 });

      // Step 2: Flush Dirty Frame to Disk & Load New Page
      tl.addLabel('step-2');
      tl.from('.disk-io-path', { strokeDashoffset: 100, duration: 0.45 });
      tl.from('.disk-storage-box', { opacity: 0, y: 20, duration: 0.4 });
      tl.to('.dirty-badge', { fill: '#10b981', duration: 0.3 });
      tl.to('.flushed-indicator', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        BUFFER POOL · PAGE TABLE HASH &amp; CLOCK EVICTION
      </Caption>

      {/* Step 0: Incoming Request */}
      <g className="incoming-page-req" data-step="0" transform="translate(40, 60)">
        <rect width={175} height={60} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect x={10} y={8} width={110} height={18} rx={9} fill="rgba(2, 132, 199, 0.15)" />
        <text x={65} y={20} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          PAGE READ REQ
        </text>
        <text x={14} y={45} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11}>
          Target: Page #42
        </text>
      </g>

      {/* Step 0: Page Table Hash Map */}
      <g className="page-table-box" data-step="0" transform="translate(235, 55)">
        <rect width={525} height={70} rx={10} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
        <rect x={12} y={8} width={140} height={18} rx={9} fill="rgba(2, 132, 199, 0.15)" />
        <text x={82} y={21} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          PAGE TABLE HASH MAP
        </text>

        {/* Rows */}
        <g transform="translate(15, 36)">
          <text x={0} y={14} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10}>
            Page #10 → Frame #0
          </text>
          <text x={160} y={14} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10}>
            Page #18 → Frame #1
          </text>
          <g className="lookup-hit-pulse" opacity={0} transform="translate(320, 0)">
            <rect width={180} height={20} rx={4} fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth={1} />
            <text x={10} y={14} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Page #42 → Frame #2 (HIT)
            </text>
          </g>
        </g>
      </g>

      {/* Step 1: Clock Sweep Ring / Buffer Frame Array */}
      <g className="clock-ring" data-step="1" transform="translate(40, 145)">
        <text x={0} y={14} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          PHYSICAL DRAM BUFFER FRAMES (ARRAY DESCRIPTORS)
        </text>

        {/* Frame 0 */}
        <g transform="translate(0, 25)">
          <rect width={165} height={65} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
          <text x={12} y={22} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Frame #0
          </text>
          <text x={12} y={40} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10}>
            Page #10 (Clean)
          </text>
          <circle className="cleared-bit" cx={145} cy={20} r={6} fill="#10b981" />
          <text x={12} y={55} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            pin: 0 | ref: 1→0
          </text>
        </g>

        {/* Frame 1 */}
        <g transform="translate(180, 25)">
          <rect width={165} height={65} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
          <text x={12} y={22} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Frame #1
          </text>
          <text x={12} y={40} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10}>
            Page #18 (Clean)
          </text>
          <circle cx={145} cy={20} r={6} fill="#0284c7" />
          <text x={12} y={55} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            pin: 2 (PINNED)
          </text>
        </g>

        {/* Frame 2 - Victim candidate */}
        <g className="victim-target" transform="translate(360, 25)">
          <rect width={185} height={65} rx={8} fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth={1.5} />
          <text x={12} y={22} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Frame #2 [VICTIM]
          </text>
          <text x={12} y={40} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            Page #05 (Dirty)
          </text>
          <rect className="dirty-badge" x={120} y={10} width={50} height={16} rx={8} fill="#ef4444" />
          <text x={145} y={21} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            DIRTY
          </text>
          <text x={12} y={55} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            pin: 0 | ref: 0 (EVICT!)
          </text>
        </g>

        {/* Frame 3 */}
        <g transform="translate(560, 25)">
          <rect width={160} height={65} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
          <text x={12} y={22} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Frame #3
          </text>
          <text x={12} y={40} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10}>
            Page #99 (Clean)
          </text>
          <circle cx={140} cy={20} r={6} fill="#10b981" />
          <text x={12} y={55} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            pin: 0 | ref: 1
          </text>
        </g>
      </g>

      {/* Clock hand visual indicator */}
      <g className="clock-hand" data-step="1" transform="translate(450, 250)">
        <polygon points="0,-16 8,8 -8,8" fill="#f59e0b" />
        <circle cx={0} cy={0} r={4} fill="#f59e0b" />
        <text x={0} y={22} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
          CLOCK HAND
        </text>
      </g>

      {/* Step 2: Flush Dirty Page to Disk */}
      <g className="disk-io-path" data-step="2">
        <path
          d="M 452 270 L 452 305"
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="4 2"
          fill="none"
        />
        <polygon points="452,312 447,303 457,303" fill="#ef4444" />
      </g>

      <g className="disk-storage-box" data-step="2" transform="translate(120, 318)">
        <rect width={450} height={50} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect x={12} y={12} width={120} height={26} rx={6} fill="#0284c7" />
        <text x={72} y={28} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          STORAGE ENGINE
        </text>
        <text x={145} y={31} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11}>
          O_DIRECT Flush Page #05 to Block #1024
        </text>
      </g>

      <g className="flushed-indicator" data-step="2" opacity={0} transform="translate(590, 324)">
        <rect width={135} height={38} rx={19} fill="#10b981" />
        <text x={67} y={23} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          ✓ FLUSHED &amp; CLEAN
        </text>
      </g>
    </SceneBoard>
  );
}
