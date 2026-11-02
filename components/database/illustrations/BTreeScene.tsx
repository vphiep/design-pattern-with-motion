'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function BTreeScene({
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
      // Step 0: Root binary search traversal
      tl.addLabel('step-0');
      tl.from('.root-node', { opacity: 0, y: -15, duration: 0.4 });
      tl.from('.pointer-line', { scaleY: 0, transformOrigin: 'top center', duration: 0.35 }, '-=0.1');

      // Step 1: Leaf node insert & overflow trigger
      tl.addLabel('step-1');
      tl.from('.leaf-nodes', { opacity: 0, y: 15, duration: 0.4 });
      tl.from('.incoming-key', { x: -30, opacity: 0, duration: 0.4 });
      tl.to('.overflow-warning', { opacity: 1, duration: 0.3 });

      // Step 2: 50/50 Split & Promote middle key
      tl.addLabel('step-2');
      tl.to('.split-left', { x: -25, duration: 0.45 });
      tl.to('.split-right', { x: 25, duration: 0.45 }, '<');
      tl.from('.promoted-key', { y: 30, opacity: 0, duration: 0.5 }, '-=0.2');
      tl.to('.balance-success', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        B+ TREE · PAGE TRAVERSAL &amp; 50/50 SPLIT
      </Caption>

      {/* Step 0: Root Node Centered at X=400 */}
      <g className="root-node" data-step="0">
        <rect x={300} y={70} width={200} height={50} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={2} />
        <line x1={400} y1={70} x2={400} y2={120} stroke="#0284c7" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={350} y={100} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={13} fontWeight="bold">
          Key: 20
        </text>
        <text x={450} y={100} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={13} fontWeight="bold">
          Key: 50
        </text>
      </g>

      {/* Branch pointers */}
      <g className="pointer-line" data-step="0">
        <path d="M 350 120 L 200 195" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 2" fill="none" />
        <path d="M 450 120 L 600 195" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 2" fill="none" />
      </g>

      {/* Step 1: Leaf Nodes */}
      <g className="leaf-nodes" data-step="1">
        {/* Left Leaf (Overflown) */}
        <g className="split-left" transform="translate(80, 195)">
          <rect width={240} height={55} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={2} />
          <line x1={80} y1={0} x2={80} y2={55} stroke="var(--border-soft)" strokeWidth={1} />
          <line x1={160} y1={0} x2={160} y2={55} stroke="var(--border-soft)" strokeWidth={1} />
          <text x={40} y={32} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={12}>
            [ 05 ]
          </text>
          <text x={120} y={32} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={12}>
            [ 10 ]
          </text>
          <text x={200} y={32} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={12}>
            [ 15 ]
          </text>
        </g>

        {/* Right Leaf */}
        <g className="split-right" transform="translate(480, 195)">
          <rect width={240} height={55} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={2} />
          <line x1={120} y1={0} x2={120} y2={55} stroke="var(--border-soft)" strokeWidth={1} />
          <text x={60} y={32} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={12}>
            [ 25 ]
          </text>
          <text x={180} y={32} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={12}>
            [ 35 ]
          </text>
        </g>
      </g>

      {/* Incoming key triggering overflow */}
      <g className="incoming-key" data-step="1" transform="translate(20, 200)">
        <rect width={50} height={45} rx={6} fill="#ea580c" />
        <text x={25} y={28} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          +12
        </text>
      </g>

      {/* Warning badge on overflow */}
      <g className="overflow-warning" data-step="1" opacity={0} transform="translate(130, 260)">
        <rect width={150} height={24} rx={12} fill="#ef4444" />
        <text x={75} y={16} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          ⚠ OVERFLOW (&gt; 3 KEYS)
        </text>
      </g>

      {/* Step 2: Promoted Key */}
      <g className="promoted-key" data-step="2" opacity={1} transform="translate(370, 25)">
        <rect width={60} height={32} rx={6} fill="#10b981" />
        <text x={30} y={20} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          ↑ 10
        </text>
      </g>

      {/* Success Badge */}
      <g className="balance-success" data-step="2" opacity={0} transform="translate(310, 280)">
        <rect width={180} height={28} rx={14} fill="#10b981" />
        <text x={90} y={18} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          ✓ BALANCED 50/50 SPLIT
        </text>
      </g>
    </SceneBoard>
  );
}
