'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function AqsLockScene({
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
      // Step 0: Atomic CAS State Acquire
      tl.addLabel('step-0');
      tl.from('.state-box', { opacity: 0, scale: 0.9, duration: 0.35 });
      tl.to('.state-val', { textContent: 'state = 1', fill: '#10b981', duration: 0.2 });
      tl.from('.owner-box', { opacity: 0, y: -10, duration: 0.3 }, '-=0.1');

      // Step 1: CLH FIFO Enqueue & Park
      tl.addLabel('step-1');
      tl.from('.clh-queue', { opacity: 0, x: 20, duration: 0.4 });
      tl.from('.thread-b-node', { opacity: 0, scale: 0.8, duration: 0.35 });
      tl.from('.enqueue-arrow', { opacity: 0, scaleX: 0, duration: 0.3 }, '-=0.1');
      tl.to('.thread-b-parked-badge', { opacity: 1, duration: 0.3 });

      // Step 2: Release & Unpark Successor
      tl.addLabel('step-2');
      tl.to('.state-val', { textContent: 'state = 0', fill: '#0284c7', duration: 0.2 });
      tl.to('.owner-name', { textContent: 'Thread B', fill: '#10b981', duration: 0.2 });
      tl.to('.thread-b-parked-badge', { opacity: 0, duration: 0.2 });
      tl.from('.unpark-signal', { opacity: 0, scale: 1.3, duration: 0.3 });
      tl.to('.thread-b-node', {
        x: -160,
        stroke: '#10b981',
        strokeWidth: 2,
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        ABSTRACTQUEUEDSYNCHRONIZER · VOLATILE STATE CAS &amp; CLH FIFO WAITER QUEUE
      </Caption>

      {/* Top Core State Box (Center) */}
      <g className="state-box" transform="translate(250, 70)">
        <rect width={300} height={120} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={300} height={28} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={150} y={19} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          AQS SYNCHRONIZER CORE
        </text>

        {/* Volatile State Integer */}
        <g transform="translate(15, 38)">
          <rect width={270} height={32} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={12} y={20} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            volatile int state:
          </text>
          <text className="state-val" x={255} y={22} textAnchor="end" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={12} fontWeight="bold">
            state = 0
          </text>
        </g>

        {/* Exclusive Owner Thread */}
        <g className="owner-box" transform="translate(15, 76)">
          <rect width={270} height={32} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={12} y={20} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            exclusiveOwnerThread:
          </text>
          <text className="owner-name" x={255} y={22} textAnchor="end" fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Thread A
          </text>
        </g>
      </g>

      {/* Thread A (Left): Holder of the lock */}
      <g transform="translate(40, 70)">
        <rect width={180} height={370} rx={8} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
        <rect width={180} height={30} rx={8} fill="#10b981" fillOpacity={0.15} />
        <text x={90} y={20} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          THREAD A (Active Owner)
        </text>

        <g transform="translate(15, 45)">
          <rect width={150} height={85} rx={6} fill="var(--surface-elevated)" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            compareAndSetState(0, 1)
          </text>
          <text x={10} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Atomic CPU CMPXCHG:
          </text>
          <text x={10} y={54} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            Success &rarr; Enters critical section
          </text>
          <text x={10} y={72} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8}>
            Holds ReentrantLock
          </text>
        </g>

        {/* Unlock Signal */}
        <g transform="translate(15, 145)">
          <rect width={150} height={90} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Step 3: lock.unlock()
          </text>
          <text x={10} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            state = 0 (volatile write)
          </text>
          <text x={10} y={54} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={8}>
            unparkSuccessor(head)
          </text>
          <text x={10} y={70} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8}>
            Wakes up Thread B!
          </text>
        </g>

        {/* Unpark Signal Pulse */}
        <g className="unpark-signal" opacity={0} transform="translate(15, 250)">
          <rect width={150} height={35} rx={4} fill="#10b981" />
          <text x={75} y={22} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            LockSupport.unpark()!
          </text>
        </g>
      </g>

      {/* CLH Doubly-Linked Waiter Queue (Bottom Area) */}
      <g className="clh-queue" transform="translate(250, 220)">
        <rect width={510} height={220} rx={8} fill="var(--surface)" stroke="var(--border-soft)" strokeWidth={1.5} />
        <rect width={510} height={28} rx={8} fill="#f59e0b" fillOpacity={0.15} />
        <text x={255} y={19} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          CLH DOUBLY-LINKED FIFO WAITER QUEUE
        </text>

        {/* Head Sentinel Dummy Node */}
        <g transform="translate(20, 50)">
          <rect width={130} height={110} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={10} y={22} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Head (Dummy Sentinel)
          </text>
          <text x={10} y={42} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>thread = null</text>
          <text x={10} y={60} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>waitStatus = -1 (SIGNAL)</text>
          <text x={10} y={80} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={8}>prev = null</text>
        </g>

        {/* Double-arrow between Head and Node B */}
        <path d="M 155 100 L 195 100" stroke="#f59e0b" strokeWidth={2} fill="none" />
        <polygon points="195,100 188,96 188,104" fill="#f59e0b" />
        <polygon points="155,100 162,96 162,104" fill="#f59e0b" />

        {/* Node B (Thread B in Queue) */}
        <g className="thread-b-node" transform="translate(200, 50)">
          <rect width={150} height={110} rx={6} fill="var(--surface-elevated)" stroke="#e11d48" strokeWidth={1.5} />
          <text x={10} y={22} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Node: Thread B
          </text>
          <text x={10} y={42} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>thread = Thread[Thread-B]</text>
          <text x={10} y={60} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>mode = EXCLUSIVE</text>
          <text x={10} y={80} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>waitStatus = 0</text>

          {/* Parked Badge */}
          <g className="thread-b-parked-badge" opacity={0} transform="translate(10, 85)">
            <rect width={130} height={20} rx={3} fill="#e11d48" />
            <text x={65} y={14} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              LockSupport.park()
            </text>
          </g>
        </g>

        {/* Double-arrow to Tail */}
        <path d="M 355 100 L 385 100" stroke="var(--border-soft)" strokeWidth={1.5} strokeDasharray="3 2" fill="none" />

        {/* Tail Node Pointer indicator */}
        <g transform="translate(390, 50)">
          <rect width={100} height={110} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeDasharray="3 2" />
          <text x={50} y={55} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            Tail pointer &gt;&gt;
          </text>
        </g>

        {/* Description line at bottom */}
        <text x={20} y={190} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
          Non-blocking lock-free enqueue via CAS &middot; Head predecessor unparks successor on release
        </text>
      </g>
    </SceneBoard>
  );
}
