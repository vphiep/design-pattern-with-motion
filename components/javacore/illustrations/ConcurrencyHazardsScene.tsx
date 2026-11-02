'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function ConcurrencyHazardsScene({
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
      // Step 0: Lost Update Race Condition Interleaving
      tl.addLabel('step-0');
      tl.from('.race-condition-card', { opacity: 0, x: -25, duration: 0.45 });
      tl.from('.thread-interleaving-timeline', { opacity: 0, scale: 0.95, duration: 0.4 });
      tl.to('.lost-update-badge', { fill: '#b91c1c', stroke: '#ef4444', duration: 0.35 });

      // Step 1: ReentrantLock tryLock Deadlock Prevention
      tl.addLabel('step-1');
      tl.from('.deadlock-solution-card', { opacity: 0, y: 15, duration: 0.4 });
      tl.from('.trylock-flow', { opacity: 0, x: 15, stagger: 0.08, duration: 0.35 });
      tl.to('.safe-release-glow', { stroke: '#10b981', strokeWidth: 2, duration: 0.3 });

      // Step 2: Lock-Free CAS Hardware Instruction (cmpxchg)
      tl.addLabel('step-2');
      tl.from('.atomic-cas-card', { opacity: 0, y: 20, duration: 0.45 });
      tl.from('.cas-cpu-core', { scale: 0.85, opacity: 0, duration: 0.35 });
      tl.to('.cas-success-badge', { stroke: '#10b981', fill: '#064e3b', duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        CONCURRENCY HAZARDS · RACE CONDITIONS, DEADLOCK TIMEOUTS &amp; LOCK-FREE CAS
      </Caption>

      {/* Left Column: Lost Update Interleaving */}
      <g className="race-condition-card" transform="translate(35, 60)">
        <rect
          width={350}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#ef4444"
          strokeWidth={1.5}
        />
        <rect width={350} height={28} rx={8} fill="#991b1b" />
        <text x={12} y={18} fill="#fee2e2" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          RACE CONDITION: count++ (READ-MODIFY-WRITE)
        </text>

        <g className="thread-interleaving-timeline" transform="translate(14, 40)">
          {/* Instruction breakdown */}
          <rect width={322} height={42} rx={4} fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
          <text x={8} y={16} fill="#fca5a5" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
            Bytecode: getfield &gt; iconst_1 &gt; iadd &gt; putfield
          </text>
          <text x={8} y={30} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
            Non-atomic 3-step operation across CPU registers
          </text>

          {/* Interleaving timeline */}
          <g transform="translate(0, 52)">
            {/* Thread 1 */}
            <rect width={322} height={44} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={0.8} />
            <text x={8} y={16} fill="#c7d2fe" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              T1: Reads count=100 &middot; Computes 100+1=101 &middot; Paused by OS
            </text>
            <text x={8} y={32} fill="#a5b4fc" fontSize={7} fontFamily="monospace" stroke="none">
              Local register held in Thread 1 Stack Frame
            </text>
          </g>

          <g transform="translate(0, 104)">
            {/* Thread 2 */}
            <rect width={322} height={44} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
            <text x={8} y={16} fill="#a7f3d0" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              T2: Reads count=100 &middot; Computes 101 &middot; Writes count=101 to Heap
            </text>
            <text x={8} y={32} fill="#6ee7b7" fontSize={7} fontFamily="monospace" stroke="none">
              Thread 2 finishes execution completely
            </text>
          </g>

          <g transform="translate(0, 156)">
            {/* Thread 1 wakes up and overwrites */}
            <rect width={322} height={44} rx={4} fill="#450a0a" stroke="#ef4444" strokeWidth={0.8} />
            <text x={8} y={16} fill="#fca5a5" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              T1 Resumes: Writes 101 to Heap! (Overwrites T2 result!)
            </text>
            <text x={8} y={32} fill="#fecaca" fontSize={7} fontFamily="monospace" stroke="none">
              Expected count = 102, Actual count = 101!
            </text>
          </g>

          {/* Lost update badge */}
          <g className="lost-update-badge" transform="translate(0, 212)">
            <rect width={322} height={40} rx={4} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} />
            <text x={10} y={16} fill="#fee2e2" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              ⚡ 1 Increment Lost Silently!
            </text>
            <text x={10} y={30} fill="#fca5a5" fontSize={7.5} fontFamily="monospace" stroke="none">
              Under high concurrent traffic, accounts silently lose millions.
            </text>
          </g>
        </g>
      </g>

      {/* Right Column: ReentrantLock tryLock (Top) & CAS Hardware Loop (Bottom) */}
      <g className="deadlock-solution-card" transform="translate(410, 60)">
        <rect
          width={355}
          height={180}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#f59e0b"
          strokeWidth={1.5}
        />
        <rect width={355} height={26} rx={8} fill="#b45309" />
        <text x={12} y={17} fill="#fef3c7" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          DEADLOCK DEFENSE: tryLock(timeout)
        </text>

        <g className="trylock-flow" transform="translate(14, 36)">
          <text x={0} y={12} fill="#fbbf24" fontSize={8} fontFamily="monospace" stroke="none">
            Breaks Coffman #4 &quot;Circular Wait&quot; Condition
          </text>

          {/* tryLock logic steps */}
          <g transform="translate(0, 20)">
            <rect width={327} height={50} rx={4} fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
            <text x={8} y={16} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
              boolean acquired = lockA.tryLock(50, TimeUnit.MILLISECONDS);
            </text>
            <text x={8} y={30} fill="#94a3b8" fontSize={7.5} fontFamily="monospace" stroke="none">
              if (acquired) &#123; try &#123; ... &#125; finally &#123; lockA.unlock(); &#125; &#125;
            </text>
            <text x={8} y={42} fill="#f87171" fontSize={7} fontFamily="monospace" stroke="none">
              else: Back off &amp; retry with jittered exponential delay!
            </text>
          </g>

          <g className="safe-release-glow" transform="translate(0, 78)">
            <rect width={327} height={34} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={1} />
            <text x={8} y={14} fill="#a7f3d0" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              ✓ Guaranteed No Indefinite Lock Inversion
            </text>
            <text x={8} y={26} fill="#6ee7b7" fontSize={7} fontFamily="monospace" stroke="none">
              Also supports lockInterruptibly() to break thread hangs
            </text>
          </g>
        </g>
      </g>

      {/* Bottom Right: Atomic CAS Hardware Loop */}
      <g className="atomic-cas-card" transform="translate(410, 255)">
        <rect
          width={355}
          height={185}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect width={355} height={26} rx={8} fill="#047857" />
        <text x={12} y={17} fill="#ecfdf5" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          LOCK-FREE ATOMIC: CPU CMPXCHG INSTRUCTION
        </text>

        <g className="cas-cpu-core" transform="translate(14, 36)">
          <text x={0} y={12} fill="#6ee7b7" fontSize={8} fontFamily="monospace" stroke="none">
            AtomicInteger.incrementAndGet() [jdk.internal.misc.Unsafe]
          </text>

          {/* CAS Loop Diagram */}
          <g transform="translate(0, 20)">
            <rect width={327} height={52} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
            <text x={8} y={16} fill="#d1fae5" fontSize={7.5} fontFamily="monospace" stroke="none">
              do &#123;
            </text>
            <text x={16} y={30} fill="#ffffff" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              expected = get(); next = expected + 1;
            </text>
            <text x={8} y={44} fill="#d1fae5" fontSize={7.5} fontFamily="monospace" stroke="none">
              &#125; while (!compareAndSet(expected, next));
            </text>
          </g>

          {/* Hardware CPU Instruction */}
          <g className="cas-success-badge" transform="translate(0, 80)">
            <rect width={327} height={42} rx={4} fill="#022c22" stroke="#10b981" strokeWidth={1} />
            <text x={8} y={16} fill="#34d399" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
              LOCK CMPXCHG [rdi], rsi (x86 Hardware Bus Lock)
            </text>
            <text x={8} y={30} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              Atomic at hardware level &middot; Zero OS thread context-switch latency
            </text>
          </g>
        </g>
      </g>
    </SceneBoard>
  );
}
