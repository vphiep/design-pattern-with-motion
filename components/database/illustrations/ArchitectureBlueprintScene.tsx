'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

interface BlueprintSceneProps extends SceneProps {
  title?: string;
  categoryLabel?: string;
}

export function ArchitectureBlueprintScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep,
  title = 'STORAGE ENGINE · INTERNAL BINARY ARCHITECTURE',
  categoryLabel = 'KERNEL ARCHITECTURE'
}: BlueprintSceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Header & Memory Allocation
      tl.addLabel('step-0');
      tl.from('.bp-stage-0', { opacity: 0, y: -20, duration: 0.4 });
      tl.from('.bp-block-header', { scaleX: 0, transformOrigin: 'left center', duration: 0.35 });

      // Step 1: Disk I/O & Block Access
      tl.addLabel('step-1');
      tl.from('.bp-stage-1', { opacity: 0, scale: 0.95, duration: 0.4 });
      tl.from('.bp-pointer-line', { strokeDashoffset: 100, duration: 0.35 });
      tl.to('.bp-active-glow', { stroke: '#0284c7', strokeWidth: 3, duration: 0.3 });

      // Step 2: Consistency & Commit Guarantee
      tl.addLabel('step-2');
      tl.from('.bp-stage-2', { opacity: 0, y: 20, duration: 0.4 });
      tl.to('.bp-status-badge', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        {title}
      </Caption>

      {/* Blueprint Grid Watermark */}
      <g opacity={0.15}>
        <line x1={40} y1={60} x2={760} y2={60} stroke="#0284c7" strokeDasharray="3 3" />
        <line x1={40} y1={180} x2={760} y2={180} stroke="#0284c7" strokeDasharray="3 3" />
        <line x1={40} y1={300} x2={760} y2={300} stroke="#0284c7" strokeDasharray="3 3" />
      </g>

      {/* Step 0: Header & Meta Block */}
      <g className="bp-stage-0" data-step="0" transform="translate(60, 70)">
        <rect width={680} height={45} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect className="bp-block-header" x={10} y={10} width={140} height={25} rx={6} fill="#0284c7" />
        <text x={80} y={26} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          PAGE HEADER (24B)
        </text>
        <text x={180} y={26} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11}>
          LSN: 0x8A10 · Checksum: CRC32 · Flags: ALLOCATED · Lower: 0x0040 · Upper: 0x1F80
        </text>
      </g>

      {/* Step 1: Memory & Record Block */}
      <g className="bp-stage-1" data-step="1" transform="translate(60, 135)">
        <rect width={680} height={120} rx={10} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
        <text x={20} y={25} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          DISK FRAME BUFFER DATA (4096 / 16384 BYTES)
        </text>

        {/* Pointer slots */}
        <g transform="translate(20, 45)">
          <rect className="bp-active-glow" width={140} height={50} rx={6} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
          <text x={70} y={22} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Slot Pointer #0
          </text>
          <text x={70} y={38} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            offset: 0x1FA0 (Len: 32)
          </text>
        </g>

        <g transform="translate(180, 45)">
          <rect width={140} height={50} rx={6} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={70} y={22} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            Slot Pointer #1
          </text>
          <text x={70} y={38} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            offset: 0x1F60 (Len: 64)
          </text>
        </g>

        {/* Free space gap */}
        <g transform="translate(340, 45)">
          <rect width={180} height={50} rx={6} fill="rgba(2, 132, 199, 0.05)" stroke="#0284c7" strokeWidth={1} strokeDasharray="4 2" />
          <text x={90} y={24} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            CONTIGUOUS FREE SPACE
          </text>
          <text x={90} y={38} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
            Available for insert: 3.4 KB
          </text>
        </g>

        {/* Tuple block */}
        <g transform="translate(540, 45)">
          <rect width={120} height={50} rx={6} fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth={1.5} />
          <text x={60} y={22} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Tuple Data (Row)
          </text>
          <text x={60} y={38} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            Header + Payload
          </text>
        </g>
      </g>

      {/* Step 2: Verification and Disk Sync */}
      <g className="bp-stage-2" data-step="2" transform="translate(60, 275)">
        <rect width={680} height={60} rx={8} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
        <rect x={15} y={15} width={130} height={30} rx={6} fill="#10b981" />
        <text x={80} y={34} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          DURABLE ON DISK
        </text>

        <text x={160} y={34} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11}>
          Direct I/O write completed · Page Checksum verified
        </text>

        <g className="bp-status-badge" opacity={0} transform="translate(545, 18)">
          <rect width={120} height={24} rx={12} fill="#0284c7" />
          <text x={60} y={16} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            ✓ ACID PERSISTED
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
