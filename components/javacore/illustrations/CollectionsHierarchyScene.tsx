'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function CollectionsHierarchyScene({
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
      // Step 0: ArrayList Contiguous Layout & 1.5x Resizing
      tl.addLabel('step-0');
      tl.from('.arraylist-container', { opacity: 0, x: -25, duration: 0.45 });
      tl.from('.array-slot', { scale: 0.8, opacity: 0, stagger: 0.05, duration: 0.3 });
      tl.from('.growth-arrow', { strokeDashoffset: 200, opacity: 0, duration: 0.4 });
      tl.to('.array-capacity-glow', { stroke: '#0284c7', strokeWidth: 2, duration: 0.3 });

      // Step 1: HashSet HashMap Backing & LinkedList Pointer Overhead
      tl.addLabel('step-1');
      tl.from('.hashset-backing-container', { opacity: 0, y: 15, duration: 0.4 });
      tl.from('.hash-bucket-node', { opacity: 0, scale: 0.9, stagger: 0.06, duration: 0.3 });
      tl.from('.linkedlist-nodes', { opacity: 0, x: 20, duration: 0.4 }, '-=0.2');
      tl.from('.pointer-arrows', { opacity: 0, duration: 0.35 });

      // Step 2: Iterator Fail-Fast modCount Verification
      tl.addLabel('step-2');
      tl.from('.iterator-panel', { opacity: 0, y: 20, duration: 0.4 });
      tl.from('.modcount-comparator', { scale: 0.85, opacity: 0, duration: 0.35 });
      tl.to('.cme-alert-box', { stroke: '#ef4444', fill: '#450a0a', duration: 0.35 });
      tl.from('.exception-banner', { opacity: 0, scale: 0.9, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        JAVA COLLECTIONS FRAMEWORK · MEMORY TOPOLOGY &amp; FAIL-FAST MECHANICS
      </Caption>

      {/* Top Left: ArrayList Contiguous Storage */}
      <g className="arraylist-container" transform="translate(35, 60)">
        <rect
          width={350}
          height={180}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#0284c7"
          strokeWidth={1.5}
        />
        <rect width={350} height={26} rx={8} fill="#0369a1" />
        <text x={12} y={17} fill="#e0f2fe" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          ArrayList&lt;E&gt; (Contiguous Object[] elementData)
        </text>

        {/* Array Slots [0..9] */}
        <g transform="translate(14, 38)">
          <text x={0} y={12} fill="#94a3b8" fontSize={9} fontFamily="monospace" stroke="none">
            Index Offset: base + (i &lt;&lt; 2) [O(1) L1/L2 Cache Prefetch]
          </text>

          {/* Slots */}
          <g transform="translate(0, 20)">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
              const isFilled = idx < 5;
              return (
                <g key={idx} className="array-slot" transform={`translate(${idx * 39}, 0)`}>
                  <rect
                    width={36}
                    height={44}
                    rx={4}
                    fill={isFilled ? '#0c4a6e' : '#1e293b'}
                    stroke={isFilled ? '#38bdf8' : '#475569'}
                    strokeWidth={1}
                  />
                  <text x={18} y={18} fill={isFilled ? '#bae6fd' : '#64748b'} fontSize={8} textAnchor="middle" fontFamily="monospace" stroke="none">
                    [{idx}]
                  </text>
                  <text x={18} y={34} fill={isFilled ? '#ffffff' : '#475569'} fontSize={9} fontWeight="bold" textAnchor="middle" fontFamily="monospace" stroke="none">
                    {isFilled ? `obj${idx}` : 'null'}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 1.5x Capacity Growth Box */}
          <g className="growth-arrow" transform="translate(0, 80)">
            <rect className="array-capacity-glow" width={322} height={36} rx={4} fill="#082f49" stroke="#0369a1" strokeWidth={1} />
            <text x={10} y={16} fill="#7dd3fc" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              Capacity Growth: oldCapacity + (oldCapacity &gt;&gt; 1) = 1.5x
            </text>
            <text x={10} y={29} fill="#38bdf8" fontSize={7.5} fontFamily="monospace" stroke="none">
              Arrays.copyOf() reallocates brand new array and copies memory blocks
            </text>
          </g>
        </g>
      </g>

      {/* Top Right: LinkedList vs ArrayDeque Ring Buffer */}
      <g className="linkedlist-nodes" transform="translate(410, 60)">
        <rect
          width={355}
          height={180}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#f59e0b"
          strokeWidth={1.5}
        />
        <rect width={355} height={26} rx={8} fill="#b45309" />
        <text x={12} y={17} fill="#fef3c7" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          LinkedList (Dispersed 24B Node Pointers)
        </text>

        {/* Doubly Linked Nodes */}
        <g transform="translate(14, 38)">
          <text x={0} y={12} fill="#fbbf24" fontSize={8.5} fontFamily="monospace" stroke="none">
            24 Bytes overhead per Node (prev + next + item) &middot; Cache Misses
          </text>

          <g transform="translate(0, 22)">
            {/* Node 0 */}
            <g transform="translate(0, 0)">
              <rect width={88} height={42} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
              <text x={6} y={16} fill="#fde68a" fontSize={7.5} fontFamily="monospace" stroke="none">Node #0</text>
              <text x={6} y={32} fill="#ffffff" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">val: &quot;Alpha&quot;</text>
            </g>

            {/* Pointer 0 -> 1 */}
            <path className="pointer-arrows" d="M 90 15 L 115 15" fill="none" stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arrow)" />
            <path className="pointer-arrows" d="M 115 28 L 90 28" fill="none" stroke="#f59e0b" strokeWidth={1.5} />

            {/* Node 1 */}
            <g transform="translate(118, 0)">
              <rect width={88} height={42} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
              <text x={6} y={16} fill="#fde68a" fontSize={7.5} fontFamily="monospace" stroke="none">Node #1</text>
              <text x={6} y={32} fill="#ffffff" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">val: &quot;Beta&quot;</text>
            </g>

            {/* Pointer 1 -> 2 */}
            <path className="pointer-arrows" d="M 208 15 L 233 15" fill="none" stroke="#f59e0b" strokeWidth={1.5} />
            <path className="pointer-arrows" d="M 233 28 L 208 28" fill="none" stroke="#f59e0b" strokeWidth={1.5} />

            {/* Node 2 */}
            <g transform="translate(236, 0)">
              <rect width={88} height={42} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
              <text x={6} y={16} fill="#fde68a" fontSize={7.5} fontFamily="monospace" stroke="none">Node #2</text>
              <text x={6} y={32} fill="#ffffff" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">val: &quot;Gamma&quot;</text>
            </g>
          </g>

          {/* ArrayDeque Pro-tip */}
          <g transform="translate(0, 80)">
            <rect width={327} height={36} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1} />
            <text x={10} y={16} fill="#c7d2fe" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              ★ Tip: Prefer ArrayDeque over LinkedList for Queue/Stack
            </text>
            <text x={10} y={29} fill="#a5b4fc" fontSize={7.5} fontFamily="monospace" stroke="none">
              ArrayDeque uses primitive circular array with zero node allocation lag
            </text>
          </g>
        </g>
      </g>

      {/* Bottom Left: HashSet Backed by HashMap */}
      <g className="hashset-backing-container" transform="translate(35, 255)">
        <rect
          width={350}
          height={185}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect width={350} height={26} rx={8} fill="#047857" />
        <text x={12} y={17} fill="#ecfdf5" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          HashSet&lt;E&gt; (Delegates to HashMap&lt;E, Object&gt;)
        </text>

        <g transform="translate(14, 38)">
          <text x={0} y={12} fill="#6ee7b7" fontSize={8.5} fontFamily="monospace" stroke="none">
            private transient HashMap&lt;E, Object&gt; map;
          </text>
          <text x={0} y={26} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            private static final Object PRESENT = new Object(); // Shared Dummy
          </text>

          {/* Internal Map Representation */}
          <g transform="translate(0, 36)">
            <rect width={322} height={82} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={1} />
            <text x={10} y={18} fill="#d1fae5" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              map.put(element, PRESENT)
            </text>

            <g className="hash-bucket-node" transform="translate(10, 26)">
              <rect width={95} height={42} rx={4} fill="#022c22" stroke="#34d399" strokeWidth={0.8} />
              <text x={6} y={16} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">Key: &quot;UID-101&quot;</text>
              <text x={6} y={32} fill="#6ee7b7" fontSize={7.5} fontFamily="monospace" stroke="none">Val: PRESENT</text>
            </g>

            <g className="hash-bucket-node" transform="translate(113, 26)">
              <rect width={95} height={42} rx={4} fill="#022c22" stroke="#34d399" strokeWidth={0.8} />
              <text x={6} y={16} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">Key: &quot;UID-102&quot;</text>
              <text x={6} y={32} fill="#6ee7b7" fontSize={7.5} fontFamily="monospace" stroke="none">Val: PRESENT</text>
            </g>

            <g className="hash-bucket-node" transform="translate(216, 26)">
              <rect width={95} height={42} rx={4} fill="#022c22" stroke="#34d399" strokeWidth={0.8} />
              <text x={6} y={16} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">Key: &quot;UID-103&quot;</text>
              <text x={6} y={32} fill="#6ee7b7" fontSize={7.5} fontFamily="monospace" stroke="none">Val: PRESENT</text>
            </g>
          </g>
        </g>
      </g>

      {/* Bottom Right: Fail-Fast modCount Verification */}
      <g className="iterator-panel" transform="translate(410, 255)">
        <rect
          width={355}
          height={185}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#ef4444"
          strokeWidth={1.5}
        />
        <rect width={355} height={26} rx={8} fill="#b91c1c" />
        <text x={12} y={17} fill="#fee2e2" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          Fail-Fast Iterator (modCount Guard)
        </text>

        <g transform="translate(14, 38)">
          <g className="modcount-comparator" transform="translate(0, 0)">
            <rect width={327} height={46} rx={4} fill="#1e293b" stroke="#475569" strokeWidth={1} />
            <text x={10} y={18} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
              Collection modCount: <tspan fill="#ef4444" fontWeight="bold">6</tspan> (list.add(&quot;Bad&quot;))
            </text>
            <text x={10} y={34} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
              Iterator expectedModCount: <tspan fill="#38bdf8" fontWeight="bold">5</tspan>
            </text>
          </g>

          <g className="exception-banner" transform="translate(0, 56)">
            <rect className="cme-alert-box" width={327} height={66} rx={4} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} />
            <text x={10} y={18} fill="#fca5a5" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              ⚡ ConcurrentModificationException!
            </text>
            <text x={10} y={34} fill="#fecaca" fontSize={7.5} fontFamily="monospace" stroke="none">
              if (modCount != expectedModCount) throw new CME();
            </text>
            <text x={10} y={50} fill="#f87171" fontSize={7.5} fontFamily="monospace" stroke="none">
              Fix: Use iterator.remove() OR ConcurrentHashMap / CopyOnWriteArrayList
            </text>
          </g>
        </g>
      </g>
    </SceneBoard>
  );
}
