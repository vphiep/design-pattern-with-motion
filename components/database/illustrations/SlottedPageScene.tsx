'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function SlottedPageScene({
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
      // Step 0: Slot Pointer Allocation
      tl.addLabel('step-0');
      tl.from('.sp-page-frame', { opacity: 0, scale: 0.95, duration: 0.4 });
      tl.from('.sp-header', { opacity: 0, y: -10, duration: 0.35 });
      tl.from('.sp-slot-0', { scale: 0, opacity: 0, duration: 0.3 });

      // Step 1: Tuple Written to Page Bottom
      tl.addLabel('step-1');
      tl.from('.sp-slot-1', { scale: 0, opacity: 0, duration: 0.3 });
      tl.from('.sp-tuple-1', { opacity: 0, y: 30, duration: 0.4 });
      tl.from('.sp-upper-arrow', { opacity: 0, y: -10, duration: 0.3 });
      tl.to('.sp-free-space', { stroke: '#0284c7', duration: 0.3 });

      // Step 2: Delete Tuple & In-Place Compaction
      tl.addLabel('step-2');
      tl.to('.sp-tuple-dead', { opacity: 0.3, fill: '#ef4444', duration: 0.3 });
      tl.to('.sp-compact-shift', { y: 28, duration: 0.45, ease: 'power2.inOut' });
      tl.to('.sp-compact-badge', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        SLOTTED PAGE · LINE POINTERS &amp; IN-PLACE COMPACTION
      </Caption>

      {/* Main 8KB Slotted Page Container (Width: 680, Height: 330) */}
      <g className="sp-page-frame" transform="translate(60, 60)">
        <rect width={680} height={340} rx={12} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={2} />

        {/* Page Header (24 Bytes) */}
        <g className="sp-header" transform="translate(15, 15)">
          <rect width={650} height={42} rx={8} fill="rgba(2, 132, 199, 0.1)" stroke="#0284c7" strokeWidth={1.5} />
          <rect x={10} y={8} width={130} height={24} rx={6} fill="#0284c7" />
          <text x={75} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            PAGE HEADER (24B)
          </text>
          <text x={160} y={24} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            pd_lsn: 0/1A490F0 · pd_checksum: CRC32 · pd_lower: 0x0028 · pd_upper: 0x1F40
          </text>
        </g>

        {/* Slot Array / Line Pointers growing DOWNWARDS */}
        <g transform="translate(15, 70)">
          <text x={5} y={14} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            SLOT ARRAY (GROWING DOWNWARDS ↓)
          </text>

          {/* Slot #0 */}
          <g className="sp-slot-0" transform="translate(0, 22)">
            <rect width={200} height={36} rx={6} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
            <text x={12} y={18} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Slot #0 (ItemPointerData)
            </text>
            <text x={12} y={30} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
              Offset: 0x1F80 · Len: 128B
            </text>
          </g>

          {/* Slot #1 */}
          <g className="sp-slot-1" transform="translate(215, 22)">
            <rect width={200} height={36} rx={6} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
            <text x={12} y={18} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Slot #1 (ItemPointerData)
            </text>
            <text x={12} y={30} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
              Offset: 0x1F00 · Len: 96B
            </text>
          </g>
        </g>

        {/* Free Space Gap in the middle */}
        <g className="sp-free-space" transform="translate(15, 142)">
          <rect width={650} height={50} rx={8} fill="rgba(2, 132, 199, 0.04)" stroke="#0284c7" strokeWidth={1.5} strokeDasharray="5 3" />
          <text x={325} y={25} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            CONTIGUOUS FREE SPACE GAP (pd_lower → pd_upper)
          </text>
          <text x={325} y={38} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            Available for new insertions: 7,816 Bytes
          </text>
        </g>

        {/* Tuples / Rows growing UPWARDS from bottom */}
        <g transform="translate(15, 205)">
          <text x={5} y={14} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            TUPLE STORAGE (GROWING UPWARDS ↑ FROM PAGE BOTTOM)
          </text>

          {/* Tuple #1 (Upper: 0x1F00) */}
          <g className="sp-tuple-1" transform="translate(0, 22)">
            <rect className="sp-tuple-dead" width={315} height={42} rx={6} fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth={1.5} />
            <text x={12} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Tuple #1 (Row 102: Bob)
            </text>
            <text x={12} y={34} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
              Offset: 0x1F00 · [xmin=95, xmax=0, payload=...]
            </text>
          </g>

          {/* Tuple #0 (Bottom: 0x1F80) */}
          <g className="sp-compact-shift" transform="translate(330, 22)">
            <rect width={320} height={42} rx={6} fill="rgba(2, 132, 199, 0.1)" stroke="#0284c7" strokeWidth={1.5} />
            <text x={12} y={20} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Tuple #0 (Row 101: Alice)
            </text>
            <text x={12} y={34} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
              Offset: 0x1F80 · [xmin=90, xmax=0, payload=...]
            </text>
          </g>

          {/* Defragmentation & Compaction Badge */}
          <g className="sp-compact-badge" opacity={0} transform="translate(210, 80)">
            <rect width={230} height={26} rx={13} fill="#10b981" />
            <text x={115} y={17} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              ✓ ZERO-FRAGMENTATION COMPACT
            </text>
          </g>
        </g>
      </g>
    </SceneBoard>
  );
}
