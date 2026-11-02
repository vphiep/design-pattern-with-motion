'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function AriesRecoveryScene({
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
      // Step 0: Analysis Pass
      tl.addLabel('step-0');
      tl.from('.ar-timeline-bar', { scaleX: 0, transformOrigin: 'left center', duration: 0.4 });
      tl.from('.ar-analysis-box', { opacity: 0, y: -20, duration: 0.4 });
      tl.from('.ar-dpt-table', { opacity: 0, x: -20, duration: 0.35 });

      // Step 1: Redo Pass (Repeat History)
      tl.addLabel('step-1');
      tl.from('.ar-redo-arrow', { strokeDashoffset: 150, duration: 0.45 });
      tl.from('.ar-redo-box', { opacity: 0, scale: 0.95, duration: 0.4 });
      tl.to('.ar-repeat-badge', { opacity: 1, duration: 0.3 });

      // Step 2: Undo Pass & CLR Logging
      tl.addLabel('step-2');
      tl.from('.ar-undo-arrow', { strokeDashoffset: 150, duration: 0.45 });
      tl.from('.ar-undo-box', { opacity: 0, y: 20, duration: 0.4 });
      tl.to('.ar-clr-badge', { opacity: 1, duration: 0.3 });
      tl.to('.ar-zero-loss', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        ARIES CRASH RECOVERY · 3-PASS ALGORITHM (ANALYSIS, REDO, UNDO)
      </Caption>

      {/* WAL Timeline Track from Checkpoint to Crash */}
      <g className="ar-timeline-bar" transform="translate(40, 60)">
        <rect width={720} height={38} rx={6} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1} />
        <line x1={80} y1={0} x2={80} y2={38} stroke="#0284c7" strokeWidth={2} />
        <text x={40} y={24} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          CHECKPOINT
        </text>

        <text x={360} y={24} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
          WAL LOG STREAM (LSN 100 → 500)
        </text>

        <line x1={640} y1={0} x2={640} y2={38} stroke="#ef4444" strokeWidth={2} />
        <text x={680} y={24} textAnchor="middle" fill="#ef4444" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          💥 CRASH!
        </text>
      </g>

      {/* 3 Passes Layout */}
      <g transform="translate(40, 110)">
        {/* Pass 1: Analysis */}
        <g className="ar-analysis-box" transform="translate(0, 0)">
          <rect width={225} height={125} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
          <rect x={10} y={10} width={130} height={20} rx={10} fill="#0284c7" />
          <text x={75} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            1. ANALYSIS PASS
          </text>
          <text x={12} y={50} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Scans forward from checkpoint
          </text>
          <text x={12} y={70} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            • Identifies active &quot;Loser&quot; Txs
          </text>
          <text x={12} y={88} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            • Builds Dirty Page Table (DPT)
          </text>
          <text x={12} y={106} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9}>
            • Finds min(RecLSN) for Redo
          </text>
        </g>

        {/* Pass 2: Redo */}
        <g className="ar-redo-box" transform="translate(245, 0)">
          <rect width={230} height={125} rx={8} fill="var(--surface)" stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={10} y={10} width={130} height={20} rx={10} fill="#f59e0b" />
          <text x={75} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            2. REDO PASS
          </text>
          <text x={12} y={50} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Repeats History to Crash!
          </text>
          <text x={12} y={70} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            • Starts from oldest RecLSN
          </text>
          <text x={12} y={88} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            • Re-applies committed &amp; uncommitted
          </text>
          <g className="ar-repeat-badge" opacity={0} transform="translate(10, 96)">
            <rect width={150} height={20} rx={4} fill="#f59e0b" />
            <text x={75} y={14} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              ✓ State at crash restored
            </text>
          </g>
        </g>

        {/* Pass 3: Undo */}
        <g className="ar-undo-box" transform="translate(495, 0)">
          <rect width={225} height={125} rx={8} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={1.5} />
          <rect x={10} y={10} width={130} height={20} rx={10} fill="#8b5cf6" />
          <text x={75} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            3. UNDO PASS
          </text>
          <text x={12} y={50} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Rolls back Loser Transactions
          </text>
          <text x={12} y={70} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            • Scans backward reversing writes
          </text>
          <text x={12} y={88} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            • Writes Compensation Records (CLR)
          </text>
          <g className="ar-clr-badge" opacity={0} transform="translate(10, 96)">
            <rect width={140} height={20} rx={4} fill="#8b5cf6" />
            <text x={70} y={14} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              CLR Prevents Repeated Undo
            </text>
          </g>
        </g>
      </g>

      {/* Recovery Complete Guarantee Card */}
      <g className="ar-zero-loss" opacity={0} transform="translate(40, 250)">
        <rect width={720} height={55} rx={8} fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth={1.5} />
        <rect x={15} y={12} width={160} height={30} rx={6} fill="#10b981" />
        <text x={95} y={31} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ✓ RECOVERY GUARANTEE
        </text>
        <text x={190} y={32} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11}>
          Zero Data Loss: If crash occurs AGAIN during recovery, CLRs guarantee safe idempotency!
        </text>
      </g>
    </SceneBoard>
  );
}
