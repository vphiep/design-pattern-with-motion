'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function MVCCScene({
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
      // Step 0: Snapshot capture
      tl.addLabel('step-0');
      tl.from('.tx-card', { opacity: 0, x: -30, duration: 0.4 });
      tl.from('.snapshot-info', { scale: 0.8, opacity: 0, duration: 0.35 });

      // Step 1: Visibility check
      tl.addLabel('step-1');
      tl.from('.table-row-latest', { opacity: 0, y: 20, duration: 0.4 });
      tl.from('.eval-badge', { opacity: 0, scale: 0.5, stagger: 0.2, duration: 0.3 });

      // Step 2: Undo log roll-pointer traversal
      tl.addLabel('step-2');
      tl.from('.roll-pointer', { scaleY: 0, transformOrigin: 'top center', duration: 0.35 });
      tl.from('.undo-log-entry', { opacity: 0, y: 20, duration: 0.45 });
      tl.to('.consistent-read', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        MVCC · SNAPSHOT ISOLATION &amp; UNDO LOG
      </Caption>

      {/* Step 0: Active Transaction Snapshot */}
      <g className="tx-card" data-step="0" transform="translate(35, 70)">
        <rect width={200} height={120} rx={12} fill="var(--surface)" stroke="#ec4899" strokeWidth={2} />
        <rect x={10} y={10} width={120} height={22} rx={11} fill="#ec4899" />
        <text x={70} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          TRANSACTION T102
        </text>

        <g className="snapshot-info" transform="translate(14, 45)">
          <text x={0} y={15} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11}>
            Snapshot: TxId = 102
          </text>
          <text x={0} y={35} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={10}>
            Active Txs: [ T100, T105 ]
          </text>
          <text x={0} y={55} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Isolation: SNAPSHOT
          </text>
        </g>
      </g>

      {/* Step 1: Latest Tuple in Table Heap */}
      <g className="table-row-latest" data-step="1" transform="translate(255, 70)">
        <rect width={250} height={120} rx={12} fill="var(--surface)" stroke="#f59e0b" strokeWidth={2} />
        <rect x={10} y={10} width={140} height={22} rx={11} fill="#f59e0b" />
        <text x={80} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          PAGE HEAP (LATEST)
        </text>

        <text x={18} y={55} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11}>
          Balance = $1,500
        </text>
        <text x={18} y={75} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={10}>
          xmin: 105 (Still Active!)
        </text>
        <text x={18} y={95} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10}>
          roll_ptr ↓ UndoLog #481
        </text>

        {/* Visibility Evaluation Badge */}
        <g className="eval-badge" transform="translate(155, 48)">
          <rect width={85} height={24} rx={12} fill="#ef4444" />
          <text x={42} y={16} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            INVISIBLE
          </text>
        </g>
      </g>

      {/* Step 2: Roll-Pointer Curve */}
      <g className="roll-pointer" data-step="2">
        <path d="M 380 190 L 380 208" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="3 2" fill="none" />
        <polygon points="380,210 375,202 385,202" fill="#8b5cf6" />
      </g>

      {/* Step 2: Historical Version in Undo Log */}
      <g className="undo-log-entry" data-step="2" transform="translate(255, 215)">
        <rect width={250} height={85} rx={10} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={2} />
        <rect x={10} y={8} width={110} height={20} rx={10} fill="#8b5cf6" />
        <text x={65} y={22} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          UNDO LOG #481
        </text>

        <text x={18} y={48} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          Balance = $1,000
        </text>
        <text x={18} y={68} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10}>
          xmin: 95 (Committed before 102)
        </text>
      </g>

      {/* Consistent Read Result Card */}
      <g className="consistent-read" data-step="2" opacity={0} transform="translate(530, 130)">
        <rect width={225} height={90} rx={12} fill="var(--surface)" stroke="#10b981" strokeWidth={2} />
        <rect x={12} y={10} width={130} height={22} rx={11} fill="#10b981" />
        <text x={77} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ✓ CONSISTENT READ
        </text>
        <text x={18} y={55} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          Returns: $1,000
        </text>
        <text x={18} y={75} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9}>
          Isolated from concurrent T105
        </text>
      </g>
    </SceneBoard>
  );
}
