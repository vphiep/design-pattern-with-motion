'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function ShardingScene({
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
      // Step 0: Key Hash Position on Ring
      tl.addLabel('step-0');
      tl.from('.hash-ring-circle', { scale: 0.8, opacity: 0, duration: 0.45, transformOrigin: '400px 200px' });
      tl.from('.initial-nodes', { opacity: 0, scale: 0.5, stagger: 0.1, duration: 0.35, transformOrigin: 'center center' });
      tl.from('.incoming-key-card', { opacity: 0, x: -30, duration: 0.4 });
      tl.from('.key-point-on-ring', { scale: 0, opacity: 0, duration: 0.3 });

      // Step 1: Clockwise Search to Successor Node
      tl.addLabel('step-1');
      tl.from('.search-arc-sweep', { strokeDashoffset: 150, duration: 0.5 });
      tl.to('.target-node-pulse', { scale: 1.2, stroke: '#10b981', duration: 0.35, yoyo: true, repeat: 1 });
      tl.to('.routed-badge', { opacity: 1, duration: 0.3 });

      // Step 2: Virtual Node Addition & Key Rebalancing
      tl.addLabel('step-2');
      tl.from('.new-node-d', { scale: 0, opacity: 0, duration: 0.4, transformOrigin: 'center center' });
      tl.from('.migration-indicator', { opacity: 0, y: 15, duration: 0.35 });
      tl.to('.rebalance-success', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        CONSISTENT HASHING · 32-BIT VIRTUAL RING &amp; REBALANCING
      </Caption>

      {/* Incoming Request / Key Hash */}
      <g className="incoming-key-card" data-step="0" transform="translate(40, 70)">
        <rect width={160} height={56} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <text x={80} y={20} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          CLIENT WRITE
        </text>
        <text x={80} y={36} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11}>
          key: &quot;user:9821&quot;
        </text>
        <text x={80} y={48} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
          hash = 0x3F8A2...
        </text>
      </g>

      {/* Main Hash Ring Circle (Center: 400, 200, Radius: 95) */}
      <g className="hash-ring-circle" data-step="0">
        <circle cx={400} cy={200} r={95} fill="none" stroke="var(--border-soft)" strokeWidth={3} strokeDasharray="6 4" />
        <circle cx={400} cy={200} r={5} fill="var(--border-soft)" />
        <text x={400} y={204} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={8}>
          0 / 2³²-1
        </text>
      </g>

      {/* Initial Virtual Nodes on Ring */}
      <g className="initial-nodes" data-step="0">
        {/* Node A (top: (400, 105)) */}
        <g transform="translate(400, 105)">
          <circle cx={0} cy={0} r={16} fill="var(--surface)" stroke="#0284c7" strokeWidth={2} />
          <text x={0} y={4} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            A-1
          </text>
        </g>

        {/* Node B (bottom right: (482, 247)) */}
        <g className="target-node-pulse" transform="translate(482, 247)">
          <circle cx={0} cy={0} r={16} fill="var(--surface)" stroke="#f59e0b" strokeWidth={2} />
          <text x={0} y={4} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            B-1
          </text>
        </g>

        {/* Node C (bottom left: (318, 247)) */}
        <g transform="translate(318, 247)">
          <circle cx={0} cy={0} r={16} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={2} />
          <text x={0} y={4} textAnchor="middle" fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            C-1
          </text>
        </g>
      </g>

      {/* Key point on ring (at 45 deg -> x: 400 + 67 = 467, y: 200 - 67 = 133) */}
      <g className="key-point-on-ring" data-step="0" transform="translate(467, 133)">
        <circle cx={0} cy={0} r={7} fill="#ef4444" />
        <circle cx={0} cy={0} r={11} fill="none" stroke="#ef4444" strokeWidth={1.5} opacity={0.6} />
        <text x={16} y={4} fill="#ef4444" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          Hash(&quot;user:9821&quot;)
        </text>
      </g>

      {/* Step 1: Clockwise Arc Sweep towards Node B-1 */}
      <g className="search-arc-sweep" data-step="1">
        <path
          d="M 467 133 A 95 95 0 0 1 482 247"
          fill="none"
          stroke="#10b981"
          strokeWidth={4}
          strokeDasharray="4 2"
        />
        <polygon points="484,228 478,220 488,220" fill="#10b981" />
      </g>

      <g className="routed-badge" data-step="1" opacity={0} transform="translate(520, 235)">
        <rect width={135} height={26} rx={13} fill="#10b981" />
        <text x={67} y={17} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ✓ ROUTED TO NODE B
        </text>
      </g>

      {/* Step 2: New Node D added to ring */}
      <g className="new-node-d" data-step="2" transform="translate(489, 170)">
        <circle cx={0} cy={0} r={16} fill="var(--surface)" stroke="#06b6d4" strokeWidth={2.5} />
        <text x={0} y={4} textAnchor="middle" fill="#06b6d4" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          D-NEW
        </text>
      </g>

      <g className="migration-indicator" data-step="2" transform="translate(240, 315)">
        <rect width={310} height={44} rx={8} fill="var(--surface)" stroke="#06b6d4" strokeWidth={1.5} />
        <text x={155} y={18} textAnchor="middle" fill="#06b6d4" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ZERO-DOWNTIME REBALANCING
        </text>
        <text x={155} y={32} textAnchor="middle" fill="var(--text-soft)" fontFamily="var(--font-mono)" fontSize={9}>
          Only 1/N partition keys migrated from Node B to Node D
        </text>
      </g>

      <g className="rebalance-success" data-step="2" opacity={0} transform="translate(570, 321)">
        <rect width={130} height={24} rx={12} fill="#06b6d4" />
        <text x={65} y={16} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          ✓ MINIMAL SHIFT
        </text>
      </g>
    </SceneBoard>
  );
}
