'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function JvmMemoryScene({
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
      // Step 0: Fast TLAB allocation inside Eden (x: 320, y: 175)
      tl.addLabel('step-0');
      tl.set('.new-object-eden', { x: 320, y: 175, scale: 1, opacity: 1 });
      tl.set('.object-rect', { fill: '#e11d48' });
      tl.set('.age-tag', { opacity: 0, scale: 0.5 });
      tl.set('.age-text', { textContent: '+1' });
      tl.from('.thread-stack', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.tlab-box', { opacity: 0, scale: 0.95, transformOrigin: 'center', duration: 0.35 }, '-=0.1');
      tl.from('.bump-pointer', { scaleY: 0, transformOrigin: 'top', duration: 0.3 }, '-=0.1');
      tl.from('.new-object-eden', { scale: 0, opacity: 0, transformOrigin: 'center', duration: 0.4 }, '-=0.1');

      // Step 1: Minor GC Evacuation straight down into Survivor S0 (x: 272, y: 345)
      tl.addLabel('step-1');
      tl.to('.minor-gc-sweep', { opacity: 1, duration: 0.25 });
      tl.to('.dead-objects', { opacity: 0.2, filter: 'grayscale(1)', duration: 0.3 });
      tl.to('.new-object-eden', {
        x: 272,
        y: 345,
        duration: 0.7,
        ease: 'power2.inOut'
      });
      tl.to('.object-rect', {
        fill: '#10b981',
        duration: 0.35
      }, '<');
      tl.to('.age-tag', { opacity: 1, scale: 1, duration: 0.3 }, '-=0.2');

      // Step 2: Tenuring Promotion from Survivor S0 across to Old Generation (x: 608, y: 220)
      tl.addLabel('step-2');
      tl.to('.old-gen-box-rect', { stroke: '#8b5cf6', strokeWidth: 1.5, duration: 0.3 });
      tl.to('.new-object-eden', {
        x: 608,
        y: 220,
        duration: 0.75,
        ease: 'power2.inOut'
      });
      tl.to('.object-rect', {
        fill: '#8b5cf6',
        duration: 0.35
      }, '<');
      tl.to('.age-text', { textContent: '15', duration: 0.2 }, '<');
      tl.from('.old-gen-badge', { opacity: 0, y: -10, duration: 0.3 }, '-=0.2');
      tl.from('.card-table-dirty', { opacity: 0, duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        JVM RUNTIME DATA AREAS · TLAB BUMP &amp; GENERATIONAL EVACUATION
      </Caption>

      {/* Thread Stack Area (Left) */}
      <g className="thread-stack" data-step="0">
        <rect x={40} y={70} width={170} height={370} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
        <rect x={40} y={70} width={170} height={32} rx={8} fill="#e11d48" fillOpacity={0.15} />
        <text x={125} y={92} textAnchor="middle" fill="#e11d48" stroke="none" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          THREAD STACK (Private)
        </text>

        {/* Stack Frames */}
        <g transform="translate(50, 115)">
          <rect width={150} height={60} rx={6} fill="var(--surface-elevated)" stroke="#e11d48" strokeWidth={1} />
          <text x={10} y={22} fill="var(--text)" stroke="none" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">Frame: placeOrder()</text>
          <text x={10} y={40} fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={9}>ref: Order (0x7F9B) 4B</text>
          <text x={10} y={52} fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={9}>primitive: price = 250.0</text>
        </g>
        <g transform="translate(50, 185)">
          <rect width={150} height={50} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={10} y={22} fill="var(--text)" stroke="none" fontFamily="var(--font-mono)" fontSize={10}>Frame: service()</text>
          <text x={10} y={38} fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={9}>LocalVars [3], OpStack [2]</text>
        </g>
        <g transform="translate(50, 245)">
          <rect width={150} height={50} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={10} y={22} fill="var(--text)" stroke="none" fontFamily="var(--font-mono)" fontSize={10}>Frame: main()</text>
          <text x={10} y={38} fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={9}>args: String[]</text>
        </g>

        {/* Pointer arrow to Heap */}
        <path d="M 200 145 C 230 145, 230 135, 250 135" stroke="#e11d48" strokeWidth={2} strokeDasharray="3 2" fill="none" />
      </g>

      {/* Heap Memory Container */}
      <g transform="translate(240, 70)">
        {/* Young Generation */}
        <rect x={0} y={0} width={280} height={370} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect x={0} y={0} width={280} height={32} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={140} y={22} textAnchor="middle" fill="#0284c7" stroke="none" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          YOUNG GENERATION (-Xmn)
        </text>

        {/* Eden Space & TLAB */}
        <g className="tlab-box" data-step="0" transform="translate(15, 45)">
          <rect width={250} height={170} rx={6} fill="var(--surface-elevated)" stroke="#0284c7" strokeWidth={1} />
          <text x={15} y={20} fill="#0284c7" stroke="none" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Eden (80%) · TLAB Buffer
          </text>
          <text x={15} y={35} fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={9}>
            Bump-the-Pointer / Zero Thread Contention
          </text>

          {/* Background dead objects in Eden */}
          <g className="dead-objects">
            <rect x={15} y={50} width={50} height={40} rx={4} fill="var(--surface)" stroke="var(--border-soft)" />
            <text x={40} y={74} textAnchor="middle" fill="var(--text-muted)" stroke="none" fontSize={8} fontFamily="var(--font-mono)">Dead Obj</text>
            <rect x={75} y={50} width={50} height={40} rx={4} fill="var(--surface)" stroke="var(--border-soft)" />
            <text x={100} y={74} textAnchor="middle" fill="var(--text-muted)" stroke="none" fontSize={8} fontFamily="var(--font-mono)">Dead Obj</text>
          </g>

          {/* Allocation Bump Pointer */}
          <line className="bump-pointer" x1={15} y1={105} x2={235} y2={105} stroke="#0284c7" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={230} y={120} textAnchor="end" fill="#0284c7" stroke="none" fontFamily="var(--font-mono)" fontSize={8}>
            top pointer &gt;&gt;
          </text>

          {/* Minor GC Sweep indicator */}
          <g className="minor-gc-sweep" opacity={0}>
            <rect x={10} y={130} width={230} height={26} rx={4} fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" />
            <text x={125} y={147} textAnchor="middle" fill="#f59e0b" stroke="none" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Minor GC Scavenge: Eden Cleared!
            </text>
          </g>
        </g>

        {/* Evacuation flow line: Eden down to Survivor S0 */}
        <path d="M 72 215 L 72 230" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 2" fill="none" opacity={0.6} />

        {/* Survivor Spaces (From S0 / To S1) */}
        <g transform="translate(15, 230)">
          <rect width={118} height={125} rx={6} fill="var(--surface-elevated)" stroke="#10b981" strokeWidth={1.5} />
          <text x={59} y={20} textAnchor="middle" fill="#10b981" stroke="none" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Survivor S0 (From)
          </text>
          <text x={59} y={34} textAnchor="middle" fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={8}>
            Live Evacuation
          </text>

          {/* Survivor S1 */}
          <g transform="translate(132, 0)">
            <rect width={118} height={125} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
            <text x={59} y={20} textAnchor="middle" fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={10}>
              Survivor S1 (To)
            </text>
            <text x={59} y={34} textAnchor="middle" fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={8}>
              Empty for Swap
            </text>
          </g>
        </g>
      </g>

      {/* Promotion flow line: Survivor S0 up-right to Old Gen */}
      <path d="M 370 380 C 470 380, 500 250, 540 250" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="3 2" fill="none" opacity={0.5} />

      {/* Tenured / Old Generation Container (Right) */}
      <g className="old-gen-container" transform="translate(540, 70)">
        <rect className="old-gen-box-rect" width={220} height={370} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
        <rect width={220} height={32} rx={8} fill="#8b5cf6" fillOpacity={0.15} />
        <text x={110} y={22} textAnchor="middle" fill="#8b5cf6" stroke="none" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          OLD / TENURED GENERATION
        </text>

        <text x={20} y={60} fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={9} fontWeight="normal">
          Long-lived Caches / Spring Beans
        </text>
        <text x={20} y={75} fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={9} fontWeight="normal">
          Threshold: MaxTenuringThreshold=15
        </text>

        {/* Promoted badge */}
        <g className="old-gen-badge" opacity={0} transform="translate(20, 95)">
          <rect width={180} height={35} rx={6} fill="#8b5cf6" fillOpacity={0.2} stroke="#8b5cf6" />
          <text x={90} y={22} textAnchor="middle" fill="#8b5cf6" stroke="none" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            PROMOTED: Age &gt; 15 Cycles
          </text>
        </g>

        {/* Card Table Write Barrier indicator */}
        <g className="card-table-dirty" opacity={0} transform="translate(20, 280)">
          <rect width={180} height={75} rx={6} fill="var(--surface-elevated)" stroke="#f59e0b" strokeWidth={1} />
          <text x={15} y={22} fill="#f59e0b" stroke="none" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Card Table (Write Barrier)
          </text>
          <text x={15} y={40} fill="var(--text-muted)" stroke="none" fontFamily="var(--font-mono)" fontSize={8}>
            Tracks Old-to-Young references
          </text>
          <rect x={15} y={50} width={20} height={16} fill="#f59e0b" rx={2} />
          <text x={42} y={62} fill="var(--text)" stroke="none" fontFamily="var(--font-mono)" fontSize={8}>
            Byte 0x01: DIRTY CARD
          </text>
        </g>
      </g>

      {/* Moving Live Object: Order instance */}
      <g className="new-object-eden" transform="translate(0, 0)">
        <rect className="object-rect" width={85} height={45} rx={6} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
        <text x={42} y={20} textAnchor="middle" fill="#ffffff" stroke="none" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          Order #101
        </text>
        <text x={42} y={35} textAnchor="middle" fill="#ffffff" opacity={0.85} stroke="none" fontFamily="var(--font-mono)" fontSize={8}>
          16B (OOPs)
        </text>
        {/* Age increment pill */}
        <g className="age-tag" opacity={0} transform="translate(55, -8)">
          <circle cx={10} cy={10} r={10} fill="#f59e0b" stroke="#ffffff" strokeWidth={1.5} />
          <text className="age-text" x={10} y={13} textAnchor="middle" fill="#ffffff" stroke="none" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            +1
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
