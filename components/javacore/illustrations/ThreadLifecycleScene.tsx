'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function ThreadLifecycleScene({
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
      // Step 0: Thread NEW -> RUNNABLE Transition & Process vs Thread boundary
      tl.addLabel('step-0');
      tl.from('.process-box', { opacity: 0, x: -25, duration: 0.45 });
      tl.from('.thread-stack-box', { scale: 0.85, opacity: 0, stagger: 0.08, duration: 0.35 });
      tl.from('.state-new-node', { opacity: 0, scale: 0.8, duration: 0.3 });
      tl.from('.state-runnable-node', { opacity: 0, scale: 0.8, duration: 0.35 });
      tl.from('.start-arrow', { strokeDashoffset: 150, opacity: 0, duration: 0.35 });

      // Step 1: BLOCKED vs WAITING States
      tl.addLabel('step-1');
      tl.from('.state-blocked-node', { opacity: 0, y: 15, duration: 0.4 });
      tl.from('.state-waiting-node', { opacity: 0, y: 15, duration: 0.4 }, '-=0.2');
      tl.from('.state-timed-waiting-node', { opacity: 0, y: 15, duration: 0.4 }, '-=0.2');
      tl.to('.blocked-lock-glow', { stroke: '#ef4444', strokeWidth: 2, duration: 0.3 });
      tl.to('.waiting-lock-glow', { stroke: '#f59e0b', strokeWidth: 2, duration: 0.3 });

      // Step 2: sleep() vs wait() Physics & TERMINATED
      tl.addLabel('step-2');
      tl.from('.sleep-vs-wait-card', { opacity: 0, y: 20, duration: 0.45 });
      tl.from('.state-terminated-node', { opacity: 0, scale: 0.8, duration: 0.35 });
      tl.to('.lock-release-badge', { fill: '#059669', stroke: '#34d399', duration: 0.35 });
      tl.to('.lock-retain-badge', { fill: '#b91c1c', stroke: '#f87171', duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        JVM THREAD LIFECYCLE · 6 KERNEL STATES &amp; SYNCHRONIZATION BEHAVIOR
      </Caption>

      {/* Top Left: Process vs Thread Memory Topology */}
      <g className="process-box" transform="translate(35, 60)">
        <rect
          width={310}
          height={175}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#0284c7"
          strokeWidth={1.5}
        />
        <rect width={310} height={26} rx={8} fill="#0369a1" />
        <text x={12} y={17} fill="#e0f2fe" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          OS PROCESS (PID 4092) SHARED MEMORY
        </text>

        <g transform="translate(12, 36)">
          {/* Shared Heap */}
          <rect width={286} height={36} rx={4} fill="#082f49" stroke="#0284c7" strokeWidth={0.8} />
          <text x={10} y={15} fill="#7dd3fc" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
            SHARED HEAP &amp; METASPACE:
          </text>
          <text x={10} y={27} fill="#38bdf8" fontSize={7.5} fontFamily="monospace" stroke="none">
            All threads share Objects, Static Fields &amp; JIT Code
          </text>

          {/* Isolated Stacks */}
          <g transform="translate(0, 44)">
            <g className="thread-stack-box" transform="translate(0, 0)">
              <rect width={138} height={42} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={0.8} />
              <text x={6} y={14} fill="#c7d2fe" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">Thread #1 Stack (1MB)</text>
              <text x={6} y={26} fill="#a5b4fc" fontSize={7} fontFamily="monospace" stroke="none">Private PC + StackFrames</text>
            </g>

            <g className="thread-stack-box" transform="translate(148, 0)">
              <rect width={138} height={42} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={0.8} />
              <text x={6} y={14} fill="#c7d2fe" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">Thread #2 Stack (1MB)</text>
              <text x={6} y={26} fill="#a5b4fc" fontSize={7} fontFamily="monospace" stroke="none">Private PC + StackFrames</text>
            </g>
          </g>
        </g>
      </g>

      {/* Top Right: The 6 JVM Thread States Transition Graph */}
      <g transform="translate(365, 60)">
        <rect
          width={400}
          height={230}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#475569"
          strokeWidth={1.5}
        />
        <rect width={400} height={26} rx={8} fill="#334155" />
        <text x={12} y={17} fill="#f1f5f9" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          JAVA THREAD STATE MACHINE (java.lang.Thread.State)
        </text>

        <g transform="translate(14, 38)">
          {/* NEW */}
          <g className="state-new-node" transform="translate(0, 10)">
            <rect width={80} height={36} rx={18} fill="#1e293b" stroke="#64748b" strokeWidth={1.5} />
            <text x={40} y={22} fill="#cbd5e1" fontSize={9} fontWeight="bold" textAnchor="middle" fontFamily="monospace" stroke="none">
              NEW
            </text>
          </g>

          {/* Arrow NEW -> RUNNABLE */}
          <path className="start-arrow" d="M 82 28 L 126 28" stroke="#38bdf8" strokeWidth={1.8} fill="none" />
          <text x={104} y={22} fill="#38bdf8" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">start()</text>

          {/* RUNNABLE */}
          <g className="state-runnable-node" transform="translate(128, 0)">
            <rect width={116} height={56} rx={6} fill="#065f46" stroke="#10b981" strokeWidth={1.5} />
            <text x={58} y={20} fill="#a7f3d0" fontSize={10} fontWeight="bold" textAnchor="middle" fontFamily="monospace" stroke="none">
              RUNNABLE
            </text>
            <text x={58} y={35} fill="#6ee7b7" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">
              READY (OS Queue)
            </text>
            <text x={58} y={47} fill="#6ee7b7" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">
              RUNNING (CPU Core)
            </text>
          </g>

          {/* Arrow RUNNABLE -> TERMINATED */}
          <path d="M 246 28 L 290 28" stroke="#94a3b8" strokeWidth={1.5} fill="none" />
          <text x={268} y={22} fill="#94a3b8" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">run() ends</text>

          {/* TERMINATED */}
          <g className="state-terminated-node" transform="translate(292, 10)">
            <rect width={80} height={36} rx={18} fill="#374151" stroke="#4b5563" strokeWidth={1.5} />
            <text x={40} y={22} fill="#9ca3af" fontSize={8} fontWeight="bold" textAnchor="middle" fontFamily="monospace" stroke="none">
              TERMINATED
            </text>
          </g>

          {/* Sub-row: BLOCKED, WAITING, TIMED_WAITING */}
          <g transform="translate(0, 78)">
            {/* BLOCKED */}
            <g className="state-blocked-node" transform="translate(0, 0)">
              <rect className="blocked-lock-glow" width={115} height={60} rx={6} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} />
              <text x={57} y={18} fill="#fca5a5" fontSize={9} fontWeight="bold" textAnchor="middle" fontFamily="monospace" stroke="none">
                BLOCKED
              </text>
              <text x={57} y={34} fill="#fecaca" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">
                Waiting for Monitor
              </text>
              <text x={57} y={48} fill="#f87171" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">
                synchronized(obj)
              </text>
            </g>

            {/* WAITING */}
            <g className="state-waiting-node" transform="translate(128, 0)">
              <rect className="waiting-lock-glow" width={115} height={60} rx={6} fill="#451a03" stroke="#f59e0b" strokeWidth={1.5} />
              <text x={57} y={18} fill="#fde68a" fontSize={9} fontWeight="bold" textAnchor="middle" fontFamily="monospace" stroke="none">
                WAITING
              </text>
              <text x={57} y={34} fill="#fef3c7" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">
                Indefinite Yield
              </text>
              <text x={57} y={48} fill="#fbbf24" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">
                wait(), park(), join()
              </text>
            </g>

            {/* TIMED_WAITING */}
            <g className="state-timed-waiting-node" transform="translate(256, 0)">
              <rect width={115} height={60} rx={6} fill="#1e1b4b" stroke="#818cf8" strokeWidth={1.5} />
              <text x={57} y={18} fill="#c7d2fe" fontSize={9} fontWeight="bold" textAnchor="middle" fontFamily="monospace" stroke="none">
                TIMED_WAITING
              </text>
              <text x={57} y={34} fill="#e0e7ff" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">
                Timeout Specified
              </text>
              <text x={57} y={48} fill="#a5b4fc" fontSize={7} textAnchor="middle" fontFamily="monospace" stroke="none">
                sleep(ms), wait(ms)
              </text>
            </g>
          </g>
        </g>
      </g>

      {/* Bottom Full-Width: sleep() vs wait() Physics & Interrupt Mechanics */}
      <g className="sleep-vs-wait-card" transform="translate(35, 250)">
        <rect
          width={310}
          height={190}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#e11d48"
          strokeWidth={1.5}
        />
        <rect width={310} height={26} rx={8} fill="#9f1239" />
        <text x={12} y={17} fill="#ffe4e6" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          sleep() VS wait() PHYSICAL DIFFERENCE
        </text>

        <g transform="translate(12, 36)">
          {/* Thread.sleep */}
          <rect width={286} height={65} rx={4} fill="#1f2937" stroke="#4b5563" strokeWidth={1} />
          <text x={10} y={16} fill="#f87171" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Thread.sleep(millis) [Static Method]:
          </text>
          <text x={10} y={32} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
            &bull; Puts current thread to sleep via OS timer
          </text>
          <g className="lock-retain-badge" transform="translate(10, 40)">
            <rect width={266} height={18} rx={3} fill="#450a0a" stroke="#ef4444" strokeWidth={0.8} />
            <text x={8} y={12} fill="#fca5a5" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              ⚠️ DOES NOT RELEASE MONITOR LOCK! Deadlock risk!
            </text>
          </g>

          {/* Object.wait */}
          <g transform="translate(0, 72)">
            <rect width={286} height={65} rx={4} fill="#1f2937" stroke="#4b5563" strokeWidth={1} />
            <text x={10} y={16} fill="#34d399" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              object.wait() [Instance Method on Object]:
            </text>
            <text x={10} y={32} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Must be called inside synchronized(object) block
            </text>
            <g className="lock-release-badge" transform="translate(10, 40)">
              <rect width={266} height={18} rx={3} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
              <text x={8} y={12} fill="#a7f3d0" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
                ✓ ATOMICALLY RELEASES LOCK &amp; enters WaitSet!
              </text>
            </g>
          </g>
        </g>
      </g>

      {/* Bottom Right: Thread vs Runnable vs Callable */}
      <g transform="translate(365, 305)">
        <rect
          width={400}
          height={135}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect width={400} height={24} rx={8} fill="#047857" />
        <text x={12} y={16} fill="#ecfdf5" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          TASK ABSTRACTIONS: RUNNABLE VS CALLABLE&lt;V&gt;
        </text>

        <g transform="translate(14, 34)">
          <g transform="translate(0, 0)">
            <rect width={180} height={80} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
            <text x={8} y={16} fill="#34d399" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
              Runnable:
            </text>
            <text x={8} y={32} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; void run()
            </text>
            <text x={8} y={48} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Cannot return a value
            </text>
            <text x={8} y={64} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Cannot throw checked exceptions
            </text>
          </g>

          <g transform="translate(192, 0)">
            <rect width={180} height={80} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
            <text x={8} y={16} fill="#34d399" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
              Callable&lt;V&gt;:
            </text>
            <text x={8} y={32} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; V call() throws Exception
            </text>
            <text x={8} y={48} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Returns Future&lt;V&gt; on submit
            </text>
            <text x={8} y={64} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Enables non-blocking async piping
            </text>
          </g>
        </g>
      </g>
    </SceneBoard>
  );
}
