'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function AcidAnomaliesScene({
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
      // Step 0: [A] Atomicity & [I] Dirty Read Rollback
      tl.addLabel('step-0');
      tl.from('.aa-step0-panel', { opacity: 0, y: -10, duration: 0.35 });
      tl.from('.aa-tx-a', { opacity: 0, x: -15, duration: 0.35 });
      tl.from('.aa-uncommitted-val', { scale: 0.8, opacity: 0, duration: 0.3 });
      tl.from('.aa-tx-b-read', { opacity: 0, x: 15, duration: 0.3 });
      tl.to('.aa-rollback-badge', { opacity: 1, duration: 0.25 });
      tl.to('.aa-undo-restored', { opacity: 1, duration: 0.25 });

      // Step 1: [C] Consistency & [I] Write Skew / Serializable Defense
      tl.addLabel('step-1');
      tl.from('.aa-step1-panel', { opacity: 0, y: 15, duration: 0.4 });
      tl.to('.aa-skew-conflict', { stroke: '#ef4444', strokeWidth: 1.5, duration: 0.3 });
      tl.to('.aa-serial-success', { opacity: 1, duration: 0.35 });

      // Step 2: [D] Durability & WAL fsync Barrier
      tl.addLabel('step-2');
      tl.from('.aa-step2-panel', { opacity: 0, y: 15, duration: 0.4 });
      tl.to('.aa-wal-flush-beam', { opacity: 1, scaleX: 1, duration: 0.35 });
      tl.to('.aa-fsync-barrier', { opacity: 1, duration: 0.3 });
      tl.to('.aa-durable-success', { opacity: 1, scale: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 470">
      <Caption x={35} y={26}>
        ACID KERNEL ARCHITECTURE · ATOMICITY, CONSISTENCY, ISOLATION &amp; DURABILITY
      </Caption>

      {/* =========================================================================
          Step 0: [A] Atomicity & [I] Dirty Read Prevention via Undo Log / Abort Bit
          ========================================================================= */}
      <g className="aa-step0-panel" transform="translate(35, 42)">
        <rect width={730} height={122} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1} />
        
        {/* Pillar Tag */}
        <rect x={12} y={8} width={180} height={18} rx={4} fill="#0284c7" />
        <text x={102} y={21} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8.5} fontWeight="bold">
          [A] ATOMICITY &amp; [I] DIRTY READ
        </text>

        {/* Tx A: Mutates uncommitted */}
        <g className="aa-tx-a" transform="translate(14, 34)">
          <rect width={210} height={76} rx={6} fill="var(--bg-elevated)" stroke="#0284c7" strokeWidth={1.2} />
          <text x={10} y={18} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9.5} fontWeight="bold">
            Tx A (In-Progress)
          </text>
          <text x={10} y={35} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            UPDATE balance = $500
          </text>
          <g className="aa-rollback-badge" opacity={0} transform="translate(10, 47)">
            <rect width={110} height={18} rx={3} fill="#ef4444" />
            <text x={55} y={13} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8.5} fontWeight="bold">
              ↺ CRASH / ROLLBACK
            </text>
          </g>
        </g>

        {/* Central Data Value in RAM vs Undo Log */}
        <g className="aa-uncommitted-val" transform="translate(236, 34)">
          <rect width={245} height={76} rx={6} fill="rgba(239, 68, 68, 0.06)" stroke="#ef4444" strokeWidth={1.2} strokeDasharray="3 2" />
          <text x={122} y={18} textAnchor="middle" fill="#ef4444" fontFamily="var(--font-mono)" fontSize={8.5} fontWeight="bold">
            UNCOMMITTED BUFFER ($500)
          </text>
          <text x={122} y={35} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8.5}>
            Original persisted value: $100
          </text>
          <g className="aa-undo-restored" opacity={0} transform="translate(15, 47)">
            <rect width={215} height={18} rx={3} fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth={1} />
            <text x={107} y={13} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              ✓ Undo Segment restores $100
            </text>
          </g>
        </g>

        {/* Tx B: Isolation Guard */}
        <g className="aa-tx-b-read" transform="translate(493, 34)">
          <rect width={222} height={76} rx={6} fill="var(--bg-elevated)" stroke="#ef4444" strokeWidth={1.2} />
          <text x={10} y={18} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={9.5} fontWeight="bold">
            Tx B (Dirty Read Attempt)
          </text>
          <text x={10} y={35} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            READ balance → Sees $500?
          </text>
          <rect x={10} y={48} width={202} height={18} rx={3} fill="rgba(239, 68, 68, 0.15)" />
          <text x={111} y={61} textAnchor="middle" fill="#ef4444" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            BLOCKED BY READ COMMITTED
          </text>
        </g>
      </g>

      {/* =========================================================================
          Step 1: [C] Consistency & [I] Write Skew / Serializable Defense
          ========================================================================= */}
      <g className="aa-step1-panel" transform="translate(35, 178)">
        <rect width={730} height={122} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1} />

        {/* Pillar Tag */}
        <rect x={12} y={8} width={230} height={18} rx={4} fill="#8b5cf6" />
        <text x={127} y={21} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8.5} fontWeight="bold">
          [C] CONSISTENCY &amp; [I] WRITE SKEW DEFENSE
        </text>

        <text x={260} y={21} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8.5}>
          Invariant Rule: CHECK (count(on_call_doctors) &gt;= 1)
        </text>

        {/* Dr. Alice Tx */}
        <g transform="translate(14, 34)">
          <rect className="aa-skew-conflict" width={225} height={76} rx={6} fill="var(--bg-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={10} y={18} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Tx 1: Dr. Alice Leaves Call
          </text>
          <text x={10} y={35} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8.5}>
            Reads count = 2 on call (OK!)
          </text>
          <text x={10} y={54} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={8.5}>
            UPDATE alice set on_call=false
          </text>
        </g>

        {/* Dr. Bob Tx */}
        <g transform="translate(252, 34)">
          <rect className="aa-skew-conflict" width={225} height={76} rx={6} fill="var(--bg-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={10} y={18} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Tx 2: Dr. Bob Leaves Call
          </text>
          <text x={10} y={35} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8.5}>
            Reads count = 2 on call (OK!)
          </text>
          <text x={10} y={54} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={8.5}>
            UPDATE bob set on_call=false
          </text>
        </g>

        {/* Serializable SSI Engine Resolution */}
        <g className="aa-serial-success" opacity={0} transform="translate(490, 34)">
          <rect width={225} height={76} rx={6} fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" strokeWidth={1.2} />
          <text x={112} y={18} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            ✓ SSI SERIALIZABLE
          </text>
          <text x={112} y={34} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            SIREAD Locks detect rw-cycle
          </text>
          <rect x={12} y={44} width={201} height={22} rx={4} fill="#10b981" />
          <text x={112} y={58} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            ABORT TX 2 · INVARIANT SAVED
          </text>
        </g>
      </g>

      {/* =========================================================================
          Step 2: [D] Durability & WAL fsync Barrier (Sequential Log Flush)
          ========================================================================= */}
      <g className="aa-step2-panel" transform="translate(35, 314)">
        <rect width={730} height={122} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1} />

        {/* Pillar Tag */}
        <rect x={12} y={8} width={220} height={18} rx={4} fill="#10b981" />
        <text x={122} y={21} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8.5} fontWeight="bold">
          [D] DURABILITY · WAL FSYNC BARRIER
        </text>

        <text x={245} y={21} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8.5}>
          WAL Invariant: Log LSN Flushed to Disk BEFORE Commit Ack
        </text>

        {/* Buffer Pool RAM */}
        <g transform="translate(14, 34)">
          <rect width={200} height={76} rx={6} fill="var(--bg-elevated)" stroke="#0284c7" strokeWidth={1} />
          <text x={10} y={18} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            RAM Buffer Pool
          </text>
          <text x={10} y={35} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8.5}>
            Dirty Page #144 (balance=$400)
          </text>
          <text x={10} y={54} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
            PageLSN: 0/01A84F20
          </text>
        </g>

        {/* WAL Flush Stream */}
        <g transform="translate(225, 34)">
          <rect width={260} height={76} rx={6} fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth={1.2} />
          <text x={130} y={18} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            WAL Pipeline &amp; fsync()
          </text>
          
          <g className="aa-wal-flush-beam" opacity={0}>
            <text x={130} y={35} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8.5}>
              COMMIT record appended to WAL
            </text>
            <rect x={15} y={44} width={230} height={20} rx={3} fill="#0f766e" />
            <text x={130} y={58} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              SYS_CALL: fdatasync() / fsync()
            </text>
          </g>
        </g>

        {/* NVMe Disk / Crash Resistance */}
        <g className="aa-durable-success" opacity={0} transform="translate(497, 34)">
          <rect width={218} height={76} rx={6} fill="var(--bg-elevated)" stroke="#10b981" strokeWidth={1.2} />
          <text x={10} y={18} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Persistent NVMe Disk
          </text>
          <text x={10} y={35} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8.5}>
            pg_wal / ib_logfile0: LSN Synced
          </text>
          <rect x={10} y={46} width={198} height={20} rx={3} fill="#10b981" />
          <text x={109} y={60} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            ✓ 100% CRASH-PROOF SURVIVAL
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
