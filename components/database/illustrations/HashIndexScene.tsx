'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function HashIndexScene({
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
      // Step 0: Hash Directory Lookup
      tl.addLabel('step-0');
      tl.from('.hi-dir-box', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.hi-bucket-0', { opacity: 0, y: -10, duration: 0.35 });
      tl.from('.hi-ptr-line', { scaleX: 0, transformOrigin: 'left center', duration: 0.3 });

      // Step 1: Bucket Collision Overflow
      tl.addLabel('step-1');
      tl.from('.hi-overflow-key', { scale: 0, opacity: 0, duration: 0.35 });
      tl.to('.hi-overflow-badge', { opacity: 1, duration: 0.3 });

      // Step 2: Directory Doubling & Split
      tl.addLabel('step-2');
      tl.from('.hi-dir-double', { opacity: 0, scaleY: 0, transformOrigin: 'top center', duration: 0.4 });
      tl.from('.hi-new-bucket', { opacity: 0, x: 20, duration: 0.4 });
      tl.to('.hi-split-success', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        EXTENDIBLE HASHING · DIRECTORY DOUBLING &amp; BUCKET SPLIT
      </Caption>

      {/* Step 0: Hash Directory (Global Depth D=2) */}
      <g className="hi-dir-box" transform="translate(40, 60)">
        <rect width={220} height={140} rx={10} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect x={10} y={10} width={130} height={20} rx={10} fill="#0284c7" />
        <text x={75} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          DIRECTORY (D = 2)
        </text>

        {/* Directory Entries */}
        <g transform="translate(15, 40)">
          <text x={0} y={14} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            [00] → Bucket A (local d=2)
          </text>
          <text x={0} y={36} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            [01] → Bucket B (local d=2)
          </text>
          <text x={0} y={58} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            [10] → Bucket A (shared)
          </text>
          <text x={0} y={80} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            [11] → Bucket C (OVERFLOW!)
          </text>
        </g>
      </g>

      {/* Pointers connecting directory to buckets */}
      <g className="hi-ptr-line" transform="translate(265, 80)">
        <path d="M 0 35 L 50 35" stroke="#0284c7" strokeWidth={2} strokeDasharray="3 2" />
        <path d="M 0 85 L 50 85" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 2" />
      </g>

      {/* Data Buckets */}
      <g transform="translate(325, 60)">
        {/* Bucket A */}
        <g className="hi-bucket-0" transform="translate(0, 0)">
          <rect width={200} height={60} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
          <text x={12} y={20} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Bucket A (d = 2)
          </text>
          <text x={12} y={36} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            Keys: [ 4, 12 ]
          </text>
        </g>

        {/* Bucket C (Overflown) */}
        <g transform="translate(0, 75)">
          <rect width={200} height={65} rx={8} fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth={1.5} />
          <text x={12} y={20} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Bucket C [FULL] (d = 2)
          </text>
          <text x={12} y={36} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            Keys: [ 3, 7, 11 ]
          </text>

          {/* Incoming collision key */}
          <g className="hi-overflow-key" transform="translate(10, 42)">
            <text x={0} y={12} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              + Insert Key 15 → Collision!
            </text>
          </g>
        </g>
      </g>

      {/* Step 1 Overflow warning badge */}
      <g className="hi-overflow-badge" opacity={0} transform="translate(545, 135)">
        <rect width={160} height={26} rx={13} fill="#ef4444" />
        <text x={80} y={17} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ⚠ LOCAL BUCKET FULL
        </text>
      </g>

      {/* Step 2: Directory Doubling & Bucket Split Panel */}
      <g className="hi-dir-double" transform="translate(40, 215)">
        <rect width={720} height={105} rx={10} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
        <rect x={12} y={10} width={200} height={22} rx={11} fill="#10b981" />
        <text x={112} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          DIRECTORY EXPANSION (D = 3)
        </text>

        <g transform="translate(20, 45)">
          <text x={0} y={15} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10}>
            Global Depth doubles from 4 entries to 8 entries in RAM.
          </text>
          <text x={0} y={35} fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
            Only Bucket C splits into C (011) and C&apos; (111). Buckets A &amp; B remain untouched!
          </text>
        </g>

        {/* New Split Bucket */}
        <g className="hi-new-bucket" transform="translate(460, 28)">
          <rect width={235} height={50} rx={6} fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth={1} />
          <text x={12} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Bucket C&apos; Created (d = 3)
          </text>
          <text x={12} y={35} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            Key 15 cleanly rehashed!
          </text>
        </g>

        {/* Success Badge */}
        <g className="hi-split-success" opacity={0} transform="translate(520, 75)">
          <rect width={160} height={22} rx={11} fill="#10b981" />
          <text x={80} y={15} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            ✓ O(1) LOOKUP PRESERVED
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
