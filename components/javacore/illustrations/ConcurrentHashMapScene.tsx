'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function ConcurrentHashMapScene({
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
      // Step 0: Lock-Free CAS on Empty Bucket Head
      tl.addLabel('step-0');
      tl.from('.chm-table', { opacity: 0, y: -15, duration: 0.4 });
      tl.from('.thread1-cas', { opacity: 0, x: -20, duration: 0.35 });
      tl.to('.bucket-2-slot', { fill: '#10b981', duration: 0.3 });
      tl.from('.cas-success-badge', { opacity: 0, scale: 0.8, duration: 0.3 }, '-=0.1');

      // Step 1: Synchronized Head Node Collision
      tl.addLabel('step-1');
      tl.from('.thread2-sync', { opacity: 0, x: 20, duration: 0.4 });
      tl.to('.head-node-lock', { stroke: '#e11d48', strokeWidth: 2, fill: 'rgba(225, 29, 72, 0.15)', duration: 0.3 });
      tl.from('.head-lock-icon', { opacity: 0, scale: 1.3, duration: 0.25 });
      tl.from('.concurrent-unlocked-banner', { opacity: 0, y: 10, duration: 0.3 });

      // Step 2: ForwardingNode & Collaborative Parallel Resize
      tl.addLabel('step-2');
      tl.from('.forwarding-node-box', { opacity: 0, scale: 0.85, duration: 0.4 });
      tl.to('.bucket-0-slot', { fill: '#8b5cf6', duration: 0.3 });
      tl.from('.help-transfer-arrow', { opacity: 0, scaleX: 0, duration: 0.35 });
      tl.from('.next-table-box', { opacity: 0, x: 20, duration: 0.4 }, '-=0.2');
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        CONCURRENTHASHMAP · CAS EMPTY BUCKET, FINE-GRAINED HEAD SYNC &amp; FORWARDINGNODE
      </Caption>

      {/* Main Node<K,V>[] Table (Top Area) */}
      <g className="chm-table" transform="translate(40, 70)">
        <rect width={720} height={125} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={720} height={26} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={360} y={18} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          CONCURRENT HASH TABLE (table array · volatile Node&lt;K,V&gt;[])
        </text>

        {/* Buckets row */}
        <g transform="translate(20, 36)">
          {/* Bucket 0: MOVED ForwardingNode */}
          <g transform="translate(0, 0)">
            <rect className="bucket-0-slot" width={125} height={70} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
            <text x={10} y={18} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[0] hash = -1</text>
            <text x={10} y={34} fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">ForwardingNode</text>
            <text x={10} y={52} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>&rarr; nextTable (32)</text>
          </g>

          {/* Bucket 1: Unlocked, Empty */}
          <g transform="translate(140, 0)">
            <rect width={125} height={70} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
            <text x={10} y={18} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[1] null</text>
            <text x={10} y={40} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8}>Unlocked</text>
          </g>

          {/* Bucket 2: Step 0 CAS Target */}
          <g transform="translate(280, 0)">
            <rect className="bucket-2-slot" width={125} height={70} rx={6} fill="var(--surface-elevated)" stroke="#0284c7" />
            <text x={10} y={18} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[2] CAS slot</text>
            <text x={10} y={36} fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">Node&lt;K,V&gt;</text>
            <text x={10} y={52} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>Thread 1 (Lock-free)</text>
          </g>

          {/* Bucket 3: Step 1 Head-locked Node */}
          <g transform="translate(420, 0)">
            <rect className="head-node-lock" width={125} height={70} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
            <text x={10} y={18} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[3] Head Node</text>
            <text x={10} y={36} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">synchronized(f)</text>
            <text x={10} y={52} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>Thread 2 locked</text>
            {/* Lock icon */}
            <circle className="head-lock-icon" cx={105} cy={20} r={8} fill="#e11d48" opacity={0} />
          </g>

          {/* Bucket 4: Unlocked */}
          <g transform="translate(560, 0)">
            <rect width={120} height={70} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
            <text x={10} y={18} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>[4..15] Free</text>
            <text x={10} y={40} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8}>100% Concurrent</text>
          </g>
        </g>
      </g>

      {/* Thread 1 (Left): Lock-Free CAS */}
      <g className="thread1-cas" transform="translate(40, 210)">
        <rect width={220} height={230} rx={8} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
        <rect width={220} height={26} rx={8} fill="#10b981" fillOpacity={0.15} />
        <text x={110} y={18} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          THREAD 1 (Lock-Free Write)
        </text>

        <g transform="translate(15, 36)">
          <rect width={190} height={75} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            casTabAt(tab, 2, null, node)
          </text>
          <text x={10} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Atomic Unsafe.compareAndSetReference
          </text>
          <text x={10} y={54} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            Zero mutex overhead!
          </text>
        </g>

        <g className="cas-success-badge" opacity={0} transform="translate(15, 125)">
          <rect width={190} height={32} rx={4} fill="#10b981" />
          <text x={95} y={20} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            CAS Succeeded in &lt; 5ns!
          </text>
        </g>
      </g>

      {/* Thread 2 (Center): Head-Node Lock */}
      <g className="thread2-sync" transform="translate(280, 210)">
        <rect width={230} height={230} rx={8} fill="var(--surface)" stroke="#e11d48" strokeWidth={1.5} />
        <rect width={230} height={26} rx={8} fill="#e11d48" fillOpacity={0.15} />
        <text x={115} y={18} textAnchor="middle" fill="#e11d48" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          THREAD 2 (Head-Node Sync)
        </text>

        <g transform="translate(15, 36)">
          <rect width={200} height={90} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            synchronized(f) &#123;
          </text>
          <text x={10} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Locks ONLY Bucket [3]&apos;s head!
          </text>
          <text x={10} y={54} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Traverses linked list or TreeBin
          </text>
          <text x={10} y={72} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={8}>
            {"} // unlocks immediately"}
          </text>
        </g>

        <g className="concurrent-unlocked-banner" opacity={0} transform="translate(15, 140)">
          <rect width={200} height={45} rx={4} fill="var(--surface-elevated)" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={18} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Massive Throughput:
          </text>
          <text x={10} y={32} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Buckets 0, 1, 2, 4..15 not blocked!
          </text>
        </g>
      </g>

      {/* Collaborative Resizing & ForwardingNode (Right) */}
      <g className="forwarding-node-box" transform="translate(530, 210)">
        <rect width={230} height={230} rx={8} fill="var(--surface)" stroke="#8b5cf6" strokeWidth={1.5} />
        <rect width={230} height={26} rx={8} fill="#8b5cf6" fillOpacity={0.15} />
        <text x={115} y={18} textAnchor="middle" fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          COLLABORATIVE RESIZE
        </text>

        <g transform="translate(15, 36)">
          <rect width={200} height={90} rx={6} fill="var(--surface-elevated)" stroke="#8b5cf6" strokeWidth={1} />
          <text x={10} y={20} fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            helpTransfer(tab, f)
          </text>
          <text x={10} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            When encountering hash == -1
          </text>
          <text x={10} y={54} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            Threads assist in copying buckets
          </text>
          <text x={10} y={72} fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={8}>
            stride = Math.max(16, n &gt;&gt;&gt; 3)
          </text>
        </g>

        {/* Next Table Pointer Box */}
        <g className="next-table-box" transform="translate(15, 140)">
          <rect width={200} height={45} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={18} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Target: nextTable (Size 32)
          </text>
          <text x={10} y={32} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            Parallel Migration in Progress!
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
