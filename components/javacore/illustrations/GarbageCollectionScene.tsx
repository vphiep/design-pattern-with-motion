'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function GarbageCollectionScene({
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
      // Step 0: Root Scan & Card Table
      tl.addLabel('step-0');
      tl.from('.gc-roots', { opacity: 0, x: -15, duration: 0.4 });
      tl.from('.card-table-grid', { opacity: 0, duration: 0.35 });
      tl.to('.dirty-card', { fill: '#f59e0b', duration: 0.3 });
      tl.from('.root-scan-rays', { opacity: 0, scaleY: 0, duration: 0.35 }, '-=0.1');

      // Step 1: G1 Regional Evacuation & Compaction
      tl.addLabel('step-1');
      tl.to('.evac-source-dead', { opacity: 0.2, filter: 'grayscale(1)', duration: 0.3 });
      tl.to('.evac-live-obj', {
        x: 290,
        y: 60,
        fill: '#10b981',
        duration: 0.6,
        ease: 'power2.inOut'
      });
      tl.from('.freed-region-badge', { opacity: 0, scale: 0.8, duration: 0.3 }, '-=0.2');

      // Step 2: ZGC Colored Pointers & Load Barrier Self-Healing
      tl.addLabel('step-2');
      tl.from('.zgc-colored-pointer', { opacity: 0, y: 20, duration: 0.4 });
      tl.to('.pointer-bit-remapped', { fill: '#10b981', duration: 0.3 });
      tl.from('.load-barrier-box', { opacity: 0, scale: 0.9, duration: 0.35 }, '-=0.1');
      tl.from('.self-healing-arrow', { opacity: 0, scaleX: 0, duration: 0.35 }, '-=0.1');
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        GARBAGE COLLECTION · G1 REGION EVACUATION &amp; ZGC COLORED POINTER LOAD BARRIER
      </Caption>

      {/* GC Roots & Card Table Area (Left) */}
      <g className="gc-roots" transform="translate(40, 70)">
        <rect width={210} height={370} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
        <rect width={210} height={30} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={105} y={20} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          GC ROOTS &amp; CARD TABLE
        </text>

        {/* GC Roots List */}
        <g transform="translate(15, 42)">
          <rect width={180} height={120} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={12} y={20} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Root References:
          </text>
          <text x={12} y={40} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>&bull; Thread Stack LocalVars</text>
          <text x={12} y={58} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>&bull; JNI Native References</text>
          <text x={12} y={76} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>&bull; System Dictionary Classes</text>
          <text x={12} y={94} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9}>&bull; Static Class Variables</text>
        </g>

        {/* Card Table Byte Array */}
        <g className="card-table-grid" transform="translate(15, 175)">
          <rect width={180} height={175} rx={6} fill="var(--surface-elevated)" stroke="#f59e0b" strokeWidth={1} />
          <text x={12} y={20} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Card Table (512B / card)
          </text>
          <text x={12} y={35} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Tracks Old-to-Young Pointers
          </text>

          {/* Cards 4x3 */}
          <g transform="translate(15, 48)">
            <rect x={0} y={0} width={34} height={25} rx={3} fill="var(--surface)" stroke="var(--border-soft)" />
            <rect x={38} y={0} width={34} height={25} rx={3} fill="var(--surface)" stroke="var(--border-soft)" />
            <rect className="dirty-card" x={76} y={0} width={34} height={25} rx={3} fill="var(--surface)" stroke="#f59e0b" />
            <text x={93} y={16} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">0x01</text>
            <rect x={114} y={0} width={34} height={25} rx={3} fill="var(--surface)" stroke="var(--border-soft)" />

            <rect x={0} y={30} width={34} height={25} rx={3} fill="var(--surface)" stroke="var(--border-soft)" />
            <rect x={38} y={30} width={34} height={25} rx={3} fill="var(--surface)" stroke="var(--border-soft)" />
            <rect x={76} y={30} width={34} height={25} rx={3} fill="var(--surface)" stroke="var(--border-soft)" />
            <rect x={114} y={30} width={34} height={25} rx={3} fill="var(--surface)" stroke="var(--border-soft)" />
          </g>

          <text x={12} y={130} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Card 0x01: Dirty mark
          </text>
          <text x={12} y={145} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Scanned during Minor GC!
          </text>
        </g>
      </g>

      {/* G1 Region Evacuation Area (Top Right) */}
      <g transform="translate(270, 70)">
        <rect width={490} height={190} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={490} height={28} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={245} y={19} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          G1 REGIONAL HEAP EVACUATION &amp; COMPACTION
        </text>

        {/* Region A (Source Region with Fragmentation) */}
        <g transform="translate(20, 42)">
          <rect width={200} height={130} rx={6} fill="var(--surface-elevated)" stroke="#e11d48" strokeWidth={1} />
          <text x={12} y={20} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Region #12 (Eden / Fragmented)
          </text>

          {/* Dead objects */}
          <g className="evac-source-dead">
            <rect x={15} y={35} width={45} height={35} rx={4} fill="var(--surface)" stroke="var(--border-soft)" />
            <text x={37} y={56} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>Dead</text>
            <rect x={70} y={35} width={45} height={35} rx={4} fill="var(--surface)" stroke="var(--border-soft)" />
            <text x={92} y={56} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>Dead</text>
          </g>

          {/* Freed Badge */}
          <g className="freed-region-badge" opacity={0} transform="translate(15, 85)">
            <rect width={170} height={32} rx={4} fill="#10b981" fillOpacity={0.2} stroke="#10b981" />
            <text x={85} y={20} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              REGION RECLAIMED (100% Free)
            </text>
          </g>
        </g>

        {/* Region B (Target Survivor/Compacted Region) */}
        <g transform="translate(270, 42)">
          <rect width={200} height={130} rx={6} fill="var(--surface-elevated)" stroke="#10b981" strokeWidth={1} />
          <text x={12} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Region #48 (Survivor / Compacted)
          </text>
          <text x={12} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Contiguous Memory Allocation
          </text>

          <rect x={15} y={50} width={65} height={40} rx={4} fill="var(--surface)" stroke="#10b981" />
          <text x={47} y={74} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>Live #1</text>
        </g>
      </g>

      {/* Moving Live Object from Region A to Region B */}
      <g className="evac-live-obj" transform="translate(400, 150)">
        <rect width={55} height={40} rx={4} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
        <text x={27} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">Live #2</text>
      </g>

      {/* ZGC Colored Pointer & Load Barrier (Bottom Right) */}
      <g className="zgc-colored-pointer" transform="translate(270, 280)">
        <rect width={490} height={160} rx={8} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={1.5} />
        <rect width={490} height={28} rx={8} fill="#8b5cf6" fillOpacity={0.15} />
        <text x={245} y={19} textAnchor="middle" fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          ZGC 64-BIT COLORED POINTER &amp; LOAD BARRIER (&lt; 1ms PAUSE)
        </text>

        {/* 64-bit Pointer Bits Layout */}
        <g transform="translate(20, 38)">
          <rect width={450} height={42} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />

          {/* Bit slices */}
          <rect x={10} y={8} width={80} height={26} rx={3} fill="#0284c7" />
          <text x={50} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">42-44: Finalizable</text>

          <rect x={95} y={8} width={65} height={26} rx={3} fill="#f59e0b" />
          <text x={127} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">Marked0</text>

          <rect x={165} y={8} width={65} height={26} rx={3} fill="#6366f1" />
          <text x={197} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">Marked1</text>

          <rect className="pointer-bit-remapped" x={235} y={8} width={75} height={26} rx={3} fill="#334155" />
          <text x={272} y={24} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">Remapped</text>

          <rect x={315} y={8} width={125} height={26} rx={3} fill="var(--surface)" stroke="var(--border-soft)" />
          <text x={377} y={24} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>44-bit Object Address</text>
        </g>

        {/* Load Barrier Self-Healing */}
        <g className="load-barrier-box" transform="translate(20, 90)">
          <rect width={450} height={55} rx={6} fill="var(--surface-elevated)" stroke="#8b5cf6" strokeWidth={1} />
          <text x={15} y={20} fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            JIT Injected Load Barrier:
          </text>
          <text x={15} y={38} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            On reference load &rarr; Test Remapped bit &rarr; If not remapped, lookup Forwarding Table &amp; update pointer atomically!
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
