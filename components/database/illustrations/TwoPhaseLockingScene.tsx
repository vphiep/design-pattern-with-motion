'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function TwoPhaseLockingScene({
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
      // Step 0: Growing Phase
      tl.addLabel('step-0');
      tl.from('.tpl-growing', { opacity: 0, y: -20, duration: 0.4 });
      tl.from('.tpl-lock-token', { scale: 0, opacity: 0, stagger: 0.2, duration: 0.35 });

      // Step 1: Deadlock Wait-For Graph
      tl.addLabel('step-1');
      tl.from('.tpl-wait-graph', { opacity: 0, scale: 0.9, duration: 0.4 });
      tl.from('.tpl-wait-edge', { strokeDashoffset: 100, duration: 0.4 });
      tl.to('.tpl-deadlock-badge', { opacity: 1, duration: 0.3 });

      // Step 2: Shrinking Phase & Deadlock Resolution
      tl.addLabel('step-2');
      tl.from('.tpl-shrinking', { opacity: 0, y: 20, duration: 0.45 });
      tl.to('.tpl-victim-tx', { fill: '#ef4444', duration: 0.3 });
      tl.to('.tpl-lock-release', { opacity: 0.3, duration: 0.3 });
      tl.to('.tpl-commit-badge', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        STRICT 2PL · LOCK PHASES &amp; WAIT-FOR GRAPH DEADLOCK
      </Caption>

      {/* Step 0: Growing Phase (Tx acquires locks, can never release) */}
      <g className="tpl-growing" transform="translate(40, 60)">
        <rect width={340} height={120} rx={10} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect x={12} y={10} width={160} height={22} rx={11} fill="#0284c7" />
        <text x={92} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          1. GROWING PHASE (ACQUIRE)
        </text>

        <g className="tpl-lock-token" transform="translate(18, 45)">
          <rect width={140} height={32} rx={6} fill="rgba(2, 132, 199, 0.15)" stroke="#0284c7" strokeWidth={1} />
          <text x={70} y={20} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            S-Lock (Row A)
          </text>
        </g>

        <g className="tpl-lock-token" transform="translate(175, 45)">
          <rect width={140} height={32} rx={6} fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth={1} />
          <text x={70} y={20} textAnchor="middle" fill="#ef4444" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            X-Lock (Row B)
          </text>
        </g>

        <text x={18} y={102} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
          Rule: Transactions can acquire locks, but CANNOT release any lock!
        </text>
      </g>

      {/* Step 1: Wait-For Graph Deadlock Detection */}
      <g className="tpl-wait-graph" transform="translate(400, 60)">
        <rect width={360} height={120} rx={10} fill="var(--surface)" stroke="#f59e0b" strokeWidth={1.5} />
        <rect x={12} y={10} width={160} height={22} rx={11} fill="#f59e0b" />
        <text x={92} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          2. WAIT-FOR GRAPH (DEADLOCK)
        </text>

        {/* Node Tx1 */}
        <g transform="translate(40, 50)">
          <circle cx={20} cy={20} r={18} fill="var(--surface)" stroke="#0284c7" strokeWidth={2} />
          <text x={20} y={24} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Tx1
          </text>
        </g>

        {/* Directed wait edge Tx1 -> Tx2 */}
        <path
          className="tpl-wait-edge"
          d="M 80 60 C 130 40, 150 40, 200 60"
          stroke="#ef4444"
          strokeWidth={2}
          fill="none"
          strokeDasharray="4 2"
        />

        {/* Directed wait edge Tx2 -> Tx1 (CYCLE!) */}
        <path
          className="tpl-wait-edge"
          d="M 200 80 C 150 100, 130 100, 80 80"
          stroke="#ef4444"
          strokeWidth={2}
          fill="none"
          strokeDasharray="4 2"
        />

        {/* Node Tx2 */}
        <g className="tpl-victim-tx" transform="translate(200, 50)">
          <circle cx={20} cy={20} r={18} fill="var(--surface)" stroke="#ef4444" strokeWidth={2} />
          <text x={20} y={24} textAnchor="middle" fill="#ef4444" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Tx2
          </text>
        </g>

        {/* Deadlock Cycle Badge */}
        <g className="tpl-deadlock-badge" opacity={0} transform="translate(255, 55)">
          <rect width={95} height={26} rx={13} fill="#ef4444" />
          <text x={47} y={17} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            ⚠ CYCLE!
          </text>
        </g>
      </g>

      {/* Step 2: Shrinking Phase & Commit Release */}
      <g className="tpl-shrinking" transform="translate(40, 195)">
        <rect width={720} height={120} rx={10} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
        <rect x={12} y={10} width={180} height={22} rx={11} fill="#10b981" />
        <text x={102} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          3. SHRINKING PHASE (COMMIT)
        </text>

        <g className="tpl-lock-release" transform="translate(20, 45)">
          <rect width={280} height={36} rx={6} fill="var(--bg-elevated)" />
          <text x={12} y={22} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            All locks held until COMMIT / ROLLBACK (Strict 2PL)
          </text>
        </g>

        {/* Deadlock Victim Rollback */}
        <g transform="translate(320, 45)">
          <rect width={200} height={36} rx={6} fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth={1} />
          <text x={100} y={22} textAnchor="middle" fill="#ef4444" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Aborts youngest Tx2 (Victim)
          </text>
        </g>

        {/* Commit success */}
        <g className="tpl-commit-badge" opacity={0} transform="translate(540, 45)">
          <rect width={165} height={36} rx={18} fill="#10b981" />
          <text x={82} y={22} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            ✓ ATOMIC COMMIT
          </text>
        </g>

        <text x={20} y={102} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
          Guarantees Strict Serializability without cascading aborts.
        </text>
      </g>
    </SceneBoard>
  );
}
