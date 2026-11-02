'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function HashMapScene({
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
      // Step 0: Hash Spreading & Bucket Index Masking
      tl.addLabel('step-0');
      tl.from('.hash-calc-box', { opacity: 0, y: -15, duration: 0.4 });
      tl.from('.bucket-table', { opacity: 0, scaleY: 0.9, duration: 0.35 });
      tl.to('.bucket-4', { fill: '#0284c7', duration: 0.3 });
      tl.from('.bucket-arrow-1', { opacity: 0, scaleY: 0, duration: 0.3 }, '-=0.1');

      // Step 1: Singly-Linked Collision Chaining
      tl.addLabel('step-1');
      tl.from('.collision-chain-group', { opacity: 0, x: 20, duration: 0.4 });
      tl.from('.chain-link-1', { opacity: 0, scaleX: 0, duration: 0.25 }, '-=0.1');
      tl.from('.chain-link-2', { opacity: 0, scaleX: 0, duration: 0.25 });
      tl.to('.threshold-counter', { textContent: 'Collision Count: 8 (Threshold Hit!)', fill: '#e11d48', duration: 0.3 });

      // Step 2: Red-Black Treeification
      tl.addLabel('step-2');
      tl.to('.collision-chain-group', { opacity: 0.15, filter: 'grayscale(1)', duration: 0.3 });
      tl.from('.rb-tree-group', { opacity: 0, scale: 0.85, transformOrigin: 'center', duration: 0.5 });
      tl.from('.treeify-badge', { opacity: 0, y: -10, duration: 0.3 }, '-=0.2');
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        HASHMAP INTERNALS · HIGH-BIT SPREADING, COLLISION CHAIN &amp; RED-BLACK TREE
      </Caption>

      {/* Top Hash Calculation Box (Center) */}
      <g className="hash-calc-box" transform="translate(180, 70)">
        <rect width={440} height={95} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={440} height={26} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={220} y={18} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          BITWISE HASH SPREADING &amp; POWER-OF-TWO MASK
        </text>

        <g transform="translate(20, 36)">
          <text x={0} y={16} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            1. Hash Spreading: <tspan fill="var(--text)" fontWeight="bold">hash = (h = key.hashCode()) ^ (h &gt;&gt;&gt; 16)</tspan>
          </text>
          <text x={0} y={34} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            2. Fast Modulo: <tspan fill="#10b981" fontWeight="bold">bucketIndex = (table.length - 1) &amp; hash</tspan>
          </text>
          <text x={0} y={50} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            &rarr; (16 - 1) &amp; 0x7E3A0004 = 4 (Bucket 4)
          </text>
        </g>
      </g>

      {/* Bucket Array Table (Left) */}
      <g className="bucket-table" transform="translate(40, 185)">
        <rect width={160} height={255} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
        <rect width={160} height={28} rx={8} fill="var(--surface-elevated)" />
        <text x={80} y={19} textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          Node&lt;K,V&gt;[] table (16)
        </text>

        {/* Bucket slots */}
        <g transform="translate(15, 38)">
          <rect x={0} y={0} width={130} height={24} rx={3} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={16} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[0] null</text>

          <rect x={0} y={28} width={130} height={24} rx={3} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={44} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[1] null</text>

          <rect x={0} y={56} width={130} height={24} rx={3} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={72} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[2] null</text>

          <rect x={0} y={84} width={130} height={24} rx={3} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={100} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[3] null</text>

          {/* Bucket 4 (Target) */}
          <rect className="bucket-4" x={0} y={112} width={130} height={26} rx={3} fill="#0284c7" />
          <text x={10} y={129} fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">[4] Head Node &rarr;</text>

          <rect x={0} y={142} width={130} height={24} rx={3} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={158} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[5] null</text>

          <rect x={0} y={170} width={130} height={24} rx={3} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={186} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[... 6..15]</text>
        </g>
      </g>

      {/* Pointer arrow from Bucket 4 */}
      <g className="bucket-arrow-1">
        <path d="M 200 310 L 235 310" stroke="#0284c7" strokeWidth={2} fill="none" />
        <polygon points="235,310 228,306 228,314" fill="#0284c7" />
      </g>

      {/* Singly-Linked Collision Chain (Center) */}
      <g className="collision-chain-group" transform="translate(240, 185)">
        <rect width={250} height={255} rx={8} fill="var(--surface)" stroke="#f59e0b" strokeWidth={1.5} />
        <rect width={250} height={28} rx={8} fill="#f59e0b" fillOpacity={0.15} />
        <text x={125} y={19} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          COLLISION CHAIN (Singly-Linked)
        </text>

        {/* Node 1 */}
        <g transform="translate(15, 40)">
          <rect width={220} height={40} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={18} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">Node 1: &quot;orderId1&quot; &rarr; $120</text>
          <text x={10} y={32} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>next &rarr; Node 2</text>
        </g>

        {/* Link 1 arrow */}
        <line className="chain-link-1" x1={125} y1={82} x2={125} y2={98} stroke="#f59e0b" strokeWidth={2} />

        {/* Node 2 */}
        <g transform="translate(15, 100)">
          <rect width={220} height={40} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={18} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">Node 2: &quot;orderId2&quot; &rarr; $340</text>
          <text x={10} y={32} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>next &rarr; Node 3</text>
        </g>

        {/* Link 2 arrow */}
        <line className="chain-link-2" x1={125} y1={142} x2={125} y2={158} stroke="#f59e0b" strokeWidth={2} />

        {/* Node 3 to 8 ellipsis */}
        <g transform="translate(15, 160)">
          <rect width={220} height={45} rx={4} fill="var(--surface-elevated)" stroke="#e11d48" strokeWidth={1} />
          <text x={10} y={18} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">Node 3 ... Node 8</text>
          <text className="threshold-counter" x={10} y={35} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            Collision Count: 8 items
          </text>
        </g>

        <text x={15} y={232} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
          Linear Search O(N) degraded!
        </text>
      </g>

      {/* Red-Black Tree Structure (Right) */}
      <g className="rb-tree-group" transform="translate(510, 185)">
        <rect width={250} height={255} rx={8} fill="var(--surface)" stroke="#e11d48" strokeWidth={1.5} />
        <rect width={250} height={28} rx={8} fill="#e11d48" fillOpacity={0.15} />
        <text x={125} y={19} textAnchor="middle" fill="#e11d48" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          RED-BLACK TREE (treeifyBin)
        </text>

        {/* Treeify badge */}
        <g className="treeify-badge" opacity={0} transform="translate(20, 36)">
          <rect width={210} height={24} rx={4} fill="#10b981" />
          <text x={105} y={16} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Treeified! Search: O(log N)
          </text>
        </g>

        {/* Root Black Node */}
        <g transform="translate(100, 75)">
          <circle cx={25} cy={25} r={20} fill="#1e293b" stroke="#ffffff" strokeWidth={1.5} />
          <text x={25} y={29} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">B: #4</text>
        </g>

        {/* Left Red Branch */}
        <line x1={108} y1={115} x2={60} y2={145} stroke="var(--border-soft)" strokeWidth={1.5} />
        <g transform="translate(35, 145)">
          <circle cx={25} cy={25} r={18} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
          <text x={25} y={29} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">R: #2</text>
        </g>

        {/* Right Red Branch */}
        <line x1={142} y1={115} x2={190} y2={145} stroke="var(--border-soft)" strokeWidth={1.5} />
        <g transform="translate(165, 145)">
          <circle cx={25} cy={25} r={18} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
          <text x={25} y={29} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">R: #6</text>
        </g>

        <text x={20} y={225} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
          TreeNode&lt;K,V&gt; self-balancing
        </text>
        <text x={20} y={240} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
          Untreeifies if count drops &le; 6
        </text>
      </g>
    </SceneBoard>
  );
}
