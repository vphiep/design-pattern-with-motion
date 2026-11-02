'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function HashCodeEqualsScene({
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
      // Step 0: Prime 31 Hash & Bitwise Bucket Routing (compute-hash-bucket)
      tl.addLabel('step-0');
      tl.from('.key-box', { opacity: 0, x: -20, duration: 0.35 });
      tl.from('.hash-calc-box', { opacity: 0, scale: 0.9, duration: 0.4 });
      tl.from('.bucket-table', { opacity: 0, x: 20, duration: 0.45 });
      tl.to('.bucket-2-rect', { stroke: '#0ea5e9', strokeWidth: 2, duration: 0.3 });
      tl.from('.arrow-key-to-bucket', { strokeDashoffset: 400, opacity: 0, duration: 0.5 });

      // Step 1: Collision Chain Traversal & equals() Verification (equals-collision-resolution)
      tl.addLabel('step-1');
      tl.from('.collision-nodes', { opacity: 0, y: 15, duration: 0.4 });
      tl.to('.node-match-rect', { stroke: '#10b981', strokeWidth: 2, fill: '#064e3b', duration: 0.35 });
      tl.from('.equals-success-badge', { opacity: 0, scale: 0.8, duration: 0.3 });

      // Step 2: Mutable Key Disaster (mutable-key-leak-trap)
      tl.addLabel('step-2');
      tl.from('.mutable-strike', { opacity: 0, duration: 0.25 });
      tl.to('.node-name-text', { textContent: 'Bob (MUTATED!)', fill: '#ef4444', duration: 0.3 });
      tl.from('.new-hash-box', { opacity: 0, y: -10, duration: 0.35 });
      tl.from('.arrow-wrong-bucket', { strokeDashoffset: 400, opacity: 0, duration: 0.5 });
      tl.to('.bucket-8-rect', { stroke: '#ef4444', strokeWidth: 2, duration: 0.3 });
      tl.from('.memory-leak-badge', { opacity: 0, scale: 0.8, duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        HASHCODE &amp; EQUALS CONTRACT · BUCKET INDEXING &amp; MUTABLE KEY LEAK
      </Caption>

      {/* Key Object & Hash Calculation (Left) */}
      <g className="key-box" transform="translate(40, 60)">
        <rect
          width={220}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="var(--border-soft, #374151)"
          strokeWidth={1.5}
        />
        <rect width={220} height={28} rx={8} fill="#1f2937" />
        <text x={12} y={18} fill="#9ca3af" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          KEY OBJECT ON HEAP
        </text>

        {/* User instance */}
        <g transform="translate(12, 42)">
          <rect width={196} height={90} rx={6} fill="#0c4a6e" stroke="#0ea5e9" strokeWidth={1} />
          <text x={10} y={20} fill="#bae6fd" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            User Key @ 0x7FFA
          </text>
          <text x={10} y={40} fill="#7dd3fc" fontSize={9} fontFamily="monospace" stroke="none">
            Field: id = 101L
          </text>
          <text className="node-name-text" x={10} y={58} fill="#7dd3fc" fontSize={9} fontFamily="monospace" stroke="none">
            Field: name = &quot;Alice&quot;
          </text>
          <text x={10} y={76} fill="#38bdf8" fontSize={8} fontFamily="monospace" stroke="none">
            hashCode() = 31 * id + name
          </text>
        </g>

        {/* Math Calculation */}
        <g className="hash-calc-box" transform="translate(12, 142)">
          <rect width={196} height={105} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1} />
          <text x={10} y={20} fill="#f59e0b" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            PRIME 31 ARITHMETIC:
          </text>
          <text x={10} y={38} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
            hashCode() = 2,058,492
          </text>
          <text x={10} y={54} fill="#a5b4fc" fontSize={8} fontFamily="monospace" stroke="none">
            High-Bit XOR Spreading:
          </text>
          <text x={10} y={68} fill="#a5b4fc" fontSize={8} fontFamily="monospace" stroke="none">
            h ^ (h &gt;&gt;&gt; 16)
          </text>
          <text x={10} y={86} fill="#34d399" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Bucket = (16 - 1) &amp; hash = 2
          </text>
        </g>

        {/* Step 2 Mutated Hash Box */}
        <g className="new-hash-box" transform="translate(12, 258)" opacity={0}>
          <rect width={196} height={110} rx={6} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} />
          <text x={10} y={20} fill="#fecaca" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            MUTATED HASH CALCULATION:
          </text>
          <text x={10} y={38} fill="#fca5a5" fontSize={8.5} fontFamily="monospace" stroke="none">
            name altered to &quot;Bob&quot;!
          </text>
          <text x={10} y={54} fill="#fca5a5" fontSize={8.5} fontFamily="monospace" stroke="none">
            New hash = 9,842,104
          </text>
          <text x={10} y={72} fill="#f87171" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            New Bucket Index = 8!
          </text>
          <text x={10} y={92} fill="#fca5a5" fontSize={8} fontFamily="monospace" stroke="none">
            Points to wrong empty slot!
          </text>
        </g>
      </g>

      {/* Bucket Array (Center) */}
      <g className="bucket-table" transform="translate(290, 60)">
        <rect
          width={180}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#4f46e5"
          strokeWidth={1.5}
        />
        <rect width={180} height={28} rx={8} fill="#312e81" />
        <text x={10} y={18} fill="#c7d2fe" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          HASHMAP BUCKET TABLE
        </text>

        {/* Buckets 0 to 9 */}
        <g transform="translate(10, 36)">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((bIdx) => {
            const isTarget = bIdx === 2;
            const isMutatedTarget = bIdx === 8;
            return (
              <g key={bIdx} transform={`translate(0, ${bIdx * 34})`}>
                <rect
                  className={isTarget ? 'bucket-2-rect' : isMutatedTarget ? 'bucket-8-rect' : ''}
                  width={160}
                  height={28}
                  rx={4}
                  fill={isTarget ? '#0c4a6e' : '#1f2937'}
                  stroke={isTarget ? '#0ea5e9' : '#374151'}
                  strokeWidth={1}
                />
                <text x={8} y={18} fill={isTarget ? '#bae6fd' : '#9ca3af'} fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
                  Bucket [{bIdx}] {isTarget ? '-> Linked Chain' : isMutatedTarget ? '-> NULL' : '-> null'}
                </text>
              </g>
            );
          })}
        </g>
      </g>

      {/* Collision Chain Nodes & Verification (Right) */}
      <g className="collision-nodes" transform="translate(500, 60)">
        <rect
          width={260}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect width={260} height={28} rx={8} fill="#065f46" />
        <text x={12} y={18} fill="#d1fae5" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          BUCKET 2 COLLISION CHAIN
        </text>

        {/* Node 1 */}
        <g transform="translate(12, 42)">
          <rect width={236} height={60} rx={6} fill="#1f2937" stroke="#374151" strokeWidth={1} />
          <text x={8} y={18} fill="#9ca3af" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Node 1 (hash: 2058492)
          </text>
          <text x={8} y={34} fill="#6b7280" fontSize={8.5} fontFamily="monospace" stroke="none">
            key: User(id=99, name=&quot;Eve&quot;)
          </text>
          <text x={8} y={48} fill="#ef4444" fontSize={8} fontFamily="monospace" stroke="none">
            equals(Alice) == FALSE -&gt; next
          </text>
        </g>

        {/* Node 2: Match */}
        <g transform="translate(12, 115)">
          <rect className="node-match-rect" width={236} height={80} rx={6} fill="#1f2937" stroke="#374151" strokeWidth={1} />
          <text x={8} y={20} fill="#ecfdf5" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            ★ Node 2: Target Key!
          </text>
          <text x={8} y={38} fill="#a7f3d0" fontSize={9} fontFamily="monospace" stroke="none">
            key: User(id=101, name=&quot;Alice&quot;)
          </text>
          <text x={8} y={54} fill="#34d399" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            equals(Alice) == TRUE! Value Returned!
          </text>
          <text x={8} y={70} fill="#6ee7b7" fontSize={8} fontFamily="monospace" stroke="none">
            value: UserAccount @ 0x88BB
          </text>
        </g>

        {/* Success badge */}
        <g className="equals-success-badge" transform="translate(12, 210)">
          <rect width={236} height={40} rx={5} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
          <text x={118} y={24} textAnchor="middle" fill="#ecfdf5" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            ✓ O(1) Contract Guaranteed!
          </text>
        </g>

        {/* Memory Leak Alert Badge */}
        <g className="memory-leak-badge" transform="translate(12, 270)" opacity={0}>
          <rect width={236} height={85} rx={6} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} />
          <text x={12} y={22} fill="#fee2e2" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            ⚠ PERMANENT MEMORY LEAK!
          </text>
          <text x={12} y={40} fill="#fca5a5" fontSize={8.5} fontFamily="monospace" stroke="none">
            Key was mutated to &quot;Bob&quot;!
          </text>
          <text x={12} y={56} fill="#fca5a5" fontSize={8.5} fontFamily="monospace" stroke="none">
            get(&quot;Bob&quot;) looks in Bucket 8 (null)
          </text>
          <text x={12} y={72} fill="#f87171" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
            Object trapped in Bucket 2 forever!
          </text>
        </g>
      </g>

      {/* Pointer arrow: Key -> Bucket 2 */}
      <path className="arrow-key-to-bucket" d="M 260 170 C 275 170, 275 110, 290 110" fill="none" stroke="#0ea5e9" strokeWidth={2} />

      {/* Pointer arrow: Mutated Key -> Bucket 8 */}
      <path className="arrow-wrong-bucket" d="M 260 310 C 275 310, 275 340, 290 340" fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="3,3" opacity={0} />
    </SceneBoard>
  );
}
