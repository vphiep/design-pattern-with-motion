'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function WALScene({
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
      // Step 0: Append to WAL Buffer
      tl.addLabel('step-0');
      tl.from('.wal-buffer', { opacity: 0, y: -20, duration: 0.4 });
      tl.from('.log-entry-row', { opacity: 0, x: -20, stagger: 0.15, duration: 0.35 });

      // Step 1: fsync to physical disk log
      tl.addLabel('step-1');
      tl.from('.disk-wal', { opacity: 0, y: 30, duration: 0.4 });
      tl.from('.fsync-line', { scaleY: 0, transformOrigin: 'top center', duration: 0.35 });
      tl.to('.durable-badge', { opacity: 1, duration: 0.3 });

      // Step 2: ARIES Crash Recovery pass
      tl.addLabel('step-2');
      tl.from('.crash-marker', { scale: 0, opacity: 0, duration: 0.3 });
      tl.from('.recovery-box', { opacity: 0, x: 30, duration: 0.45 });
      tl.to('.recovery-complete', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        WRITE-AHEAD LOG · LSN &amp; ARIES RECOVERY
      </Caption>

      {/* Step 0: In-Memory WAL Buffer */}
      <g className="wal-buffer" data-step="0" transform="translate(35, 70)">
        <rect width={250} height={120} rx={12} fill="var(--surface)" stroke="#0284c7" strokeWidth={2} />
        <rect x={10} y={10} width={130} height={20} rx={10} fill="#0284c7" />
        <text x={75} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          RAM LOG BUFFER
        </text>

        <g className="log-entry-row" transform="translate(12, 42)">
          <text x={0} y={12} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            [LSN: 101] UPDATE page #5 (old:10, new:25)
          </text>
        </g>
        <g className="log-entry-row" transform="translate(12, 68)">
          <text x={0} y={12} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            [LSN: 102] UPDATE page #9 (old:40, new:80)
          </text>
        </g>
        <g className="log-entry-row" transform="translate(12, 94)">
          <text x={0} y={12} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            [LSN: 103] COMMIT Tx #42 ✓
          </text>
        </g>
      </g>

      {/* Step 1: fsync Pipe */}
      <g className="fsync-line" data-step="1">
        <path d="M 160 190 L 160 230" stroke="#0284c7" strokeWidth={3} strokeDasharray="4 2" />
        <polygon points="160,238 154,228 166,228" fill="#0284c7" />
        <text x={175} y={215} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          fsync()
        </text>
      </g>

      {/* Step 1: Physical Disk WAL File */}
      <g className="disk-wal" data-step="1" transform="translate(35, 240)">
        <rect width={250} height={70} rx={8} fill="var(--surface)" stroke="#10b981" strokeWidth={2} />
        <rect x={10} y={8} width={140} height={18} rx={9} fill="#10b981" />
        <text x={80} y={21} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
          DISK WAL FILE (PERSISTENT)
        </text>
        <text x={12} y={48} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10}>
          Flushed LSN: 103 · Irrevocable
        </text>
      </g>

      <g className="durable-badge" data-step="1" opacity={0} transform="translate(95, 322)">
        <rect width={130} height={24} rx={12} fill="#10b981" />
        <text x={65} y={16} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ✓ DURABLE ON DISK
        </text>
      </g>

      {/* Step 2: Crash Marker */}
      <g className="crash-marker" data-step="2" transform="translate(315, 110)">
        <circle cx={28} cy={28} r={24} fill="#ef4444" />
        <text x={28} y={34} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={16} fontWeight="bold">
          💥
        </text>
        <text x={28} y={68} textAnchor="middle" fill="#ef4444" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          CRASH!
        </text>
      </g>

      {/* Step 2: ARIES Crash Recovery Box */}
      <g className="recovery-box" data-step="2" transform="translate(405, 70)">
        <rect width={355} height={180} rx={12} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={2} />
        <rect x={10} y={10} width={150} height={22} rx={11} fill="#8b5cf6" />
        <text x={85} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ARIES CRASH RECOVERY
        </text>

        <text x={16} y={55} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
          1. ANALYSIS: scan active Txs from Checkpoint
        </text>
        <text x={16} y={80} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          2. REDO: repeat history to crash point
        </text>
        <text x={16} y={105} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          3. UNDO: rollback uncommitted loser Txs
        </text>

        <g className="recovery-complete" opacity={0} transform="translate(16, 130)">
          <rect width={320} height={32} rx={6} fill="#10b981" />
          <text x={160} y={20} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            ✓ ZERO DATA LOSS ACID GUARANTEE
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
