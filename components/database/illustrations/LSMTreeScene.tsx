'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function LSMTreeScene({
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
      // Step 0: MemTable RAM write & WAL disk append
      tl.addLabel('step-0');
      tl.from('.memtable-box', { opacity: 0, x: -30, duration: 0.4 });
      tl.from('.wal-log', { opacity: 0, y: 30, duration: 0.35 }, '-=0.2');
      tl.from('.entry-token', { scale: 0, stagger: 0.15, duration: 0.3 });

      // Step 1: Freeze & flush to SSTable Level 0
      tl.addLabel('step-1');
      tl.to('.freeze-badge', { opacity: 1, duration: 0.25 });
      tl.from('.sstable-l0', { opacity: 0, y: -20, duration: 0.4 });
      tl.from('.flush-arrow', { scaleX: 0, transformOrigin: 'left center', duration: 0.35 });

      // Step 2: Tiered Compaction into Level 1
      tl.addLabel('step-2');
      tl.from('.compaction-engine', { opacity: 0, scale: 0.8, duration: 0.35 });
      tl.from('.sstable-l1', { opacity: 0, y: 30, duration: 0.45 });
      tl.to('.tombstone-drop', { opacity: 0.2, textDecoration: 'line-through', duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        LSM-TREE · MEMTABLE &amp; COMPACTION
      </Caption>

      {/* Step 0: RAM Area (MemTable) */}
      <g className="memtable-box" data-step="0" transform="translate(35, 70)">
        <rect width={195} height={140} rx={12} fill="var(--surface)" stroke="#059669" strokeWidth={2} />
        <rect x={10} y={10} width={105} height={22} rx={11} fill="#059669" />
        <text x={62} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          RAM MEMTABLE
        </text>

        {/* Entries inside MemTable */}
        <g className="entry-token" transform="translate(10, 45)">
          <rect width={175} height={24} rx={4} fill="var(--bg-elevated)" />
          <text x={8} y={16} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            &quot;u:101&quot; → &quot;Alice&quot;
          </text>
        </g>
        <g className="entry-token" transform="translate(10, 75)">
          <rect width={175} height={24} rx={4} fill="var(--bg-elevated)" />
          <text x={8} y={16} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            &quot;u:102&quot; → &quot;Bob&quot;
          </text>
        </g>
        <g className="entry-token" transform="translate(10, 105)">
          <rect width={175} height={24} rx={4} fill="var(--bg-elevated)" />
          <text x={8} y={16} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            &quot;u:103&quot; → &quot;Charlie&quot;
          </text>
        </g>
      </g>

      {/* WAL Append-Only Log on Disk */}
      <g className="wal-log" data-step="0" transform="translate(35, 225)">
        <rect width={195} height={60} rx={8} fill="var(--surface)" stroke="#d97706" strokeWidth={1.5} />
        <text x={15} y={22} fill="#d97706" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          DISK: WAL APPEND LOG
        </text>
        <line x1={15} y1={34} x2={180} y2={34} stroke="var(--border-soft)" strokeDasharray="3 2" />
        <text x={15} y={48} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
          [#001] PUT | [#002] PUT
        </text>
      </g>

      {/* Step 1: Flush Arrow & Freeze */}
      <g className="flush-arrow" data-step="1">
        <path d="M 235 140 L 290 140" stroke="#059669" strokeWidth={2.5} strokeDasharray="4 2" />
        <polygon points="298,140 288,135 288,145" fill="#059669" />
        <text x={265} y={130} textAnchor="middle" fill="#059669" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          FLUSH
        </text>
      </g>

      <g className="freeze-badge" data-step="1" opacity={0} transform="translate(105, 42)">
        <rect width={110} height={20} rx={10} fill="#0284c7" />
        <text x={55} y={14} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ❄ IMMUTABLE
        </text>
      </g>

      {/* Step 1: SSTables Level 0 */}
      <g className="sstable-l0" data-step="1" transform="translate(305, 70)">
        <rect width={160} height={140} rx={10} fill="var(--surface)" stroke="#0284c7" strokeWidth={2} />
        <rect x={10} y={10} width={90} height={20} rx={10} fill="#0284c7" />
        <text x={55} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          SSTABLE (L0)
        </text>
        <text x={16} y={55} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
          Bloom Filter ✓
        </text>
        <text x={16} y={80} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
          Index Block ✓
        </text>
        <text className="tombstone-drop" x={16} y={105} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={10}>
          u:99 (TOMBSTONE)
        </text>
      </g>

      {/* Step 2: Compaction Engine */}
      <g className="compaction-engine" data-step="2" transform="translate(480, 120)">
        <circle cx={24} cy={20} r={18} fill="#8b5cf6" />
        <text x={24} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          ⚡
        </text>
        <text x={24} y={52} textAnchor="middle" fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
          MERGE
        </text>
      </g>

      {/* Step 2: SSTables Level 1 (Compacted) */}
      <g className="sstable-l1" data-step="2" transform="translate(545, 70)">
        <rect width={215} height={140} rx={10} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={2} />
        <rect x={10} y={10} width={100} height={20} rx={10} fill="#8b5cf6" />
        <text x={60} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          SSTABLE (L1)
        </text>
        <text x={16} y={58} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          ✓ No key overlaps
        </text>
        <text x={16} y={82} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
          ✓ Tombstones purged
        </text>
        <text x={16} y={106} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
          Sorted run persited
        </text>
      </g>
    </SceneBoard>
  );
}
