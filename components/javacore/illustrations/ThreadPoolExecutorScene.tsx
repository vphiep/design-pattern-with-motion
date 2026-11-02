'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function ThreadPoolExecutorScene({
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
      // Step 0: Task Submission Flow (Core -> Queue -> Max -> Reject)
      tl.addLabel('step-0');
      tl.from('.pool-dispatch-flow', { opacity: 0, x: -25, duration: 0.45 });
      tl.from('.dispatch-step-box', { scale: 0.85, opacity: 0, stagger: 0.08, duration: 0.35 });
      tl.from('.flow-step-arrow', { strokeDashoffset: 150, opacity: 0, duration: 0.35 });

      // Step 1: CallerRunsPolicy Natural Backpressure
      tl.addLabel('step-1');
      tl.from('.backpressure-card', { opacity: 0, y: 15, duration: 0.4 });
      tl.from('.caller-thread-executing', { scale: 0.9, opacity: 0, duration: 0.35 });
      tl.to('.backpressure-alert-glow', { stroke: '#f59e0b', strokeWidth: 2, duration: 0.3 });

      // Step 2: CompletableFuture Non-Blocking Pipeline
      tl.addLabel('step-2');
      tl.from('.completable-future-card', { opacity: 0, y: 20, duration: 0.45 });
      tl.from('.async-stage-box', { opacity: 0, x: 15, stagger: 0.08, duration: 0.35 });
      tl.to('.non-blocking-badge', { stroke: '#10b981', fill: '#064e3b', duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        EXECUTORS &amp; THREADPOOLS · SUBMISSION LIFECYCLE, BACKPRESSURE &amp; ASYNC PIPELINES
      </Caption>

      {/* Left Column: 4-Step Submission Algorithm */}
      <g className="pool-dispatch-flow" transform="translate(35, 60)">
        <rect
          width={350}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#0284c7"
          strokeWidth={1.5}
        />
        <rect width={350} height={28} rx={8} fill="#0369a1" />
        <text x={12} y={18} fill="#e0f2fe" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          THREADPOOLEXECUTOR.EXECUTE(TASK)
        </text>

        <g transform="translate(14, 38)">
          {/* Step 1: Core Pool */}
          <g className="dispatch-step-box" transform="translate(0, 0)">
            <rect width={322} height={52} rx={4} fill="#0c4a6e" stroke="#0284c7" strokeWidth={1} />
            <text x={10} y={16} fill="#bae6fd" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              1. If running &lt; corePoolSize (e.g. 8):
            </text>
            <text x={10} y={32} fill="#e0f2fe" fontSize={7.5} fontFamily="monospace" stroke="none">
              Spawn new Worker Thread immediately to run task
            </text>
          </g>

          {/* Arrow 1 -> 2 */}
          <path className="flow-step-arrow" d="M 161 54 L 161 68" stroke="#38bdf8" strokeWidth={1.5} fill="none" />

          {/* Step 2: Work Queue */}
          <g className="dispatch-step-box" transform="translate(0, 70)">
            <rect width={322} height={52} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1} />
            <text x={10} y={16} fill="#c7d2fe" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              2. Else if workQueue.offer(task) succeeds:
            </text>
            <text x={10} y={32} fill="#e0e7ff" fontSize={7.5} fontFamily="monospace" stroke="none">
              Enqueue into Bounded ArrayBlockingQueue (capacity 500)
            </text>
          </g>

          {/* Arrow 2 -> 3 */}
          <path className="flow-step-arrow" d="M 161 124 L 161 138" stroke="#818cf8" strokeWidth={1.5} fill="none" />

          {/* Step 3: Max Pool */}
          <g className="dispatch-step-box" transform="translate(0, 140)">
            <rect width={322} height={52} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
            <text x={10} y={16} fill="#fde68a" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              3. Else if running &lt; maximumPoolSize (e.g. 32):
            </text>
            <text x={10} y={32} fill="#fef3c7" fontSize={7.5} fontFamily="monospace" stroke="none">
              Spawn temporary non-core Worker (keepAliveTime = 60s)
            </text>
          </g>

          {/* Arrow 3 -> 4 */}
          <path className="flow-step-arrow" d="M 161 194 L 161 208" stroke="#fbbf24" strokeWidth={1.5} fill="none" />

          {/* Step 4: Rejection Handler */}
          <g className="dispatch-step-box" transform="translate(0, 210)">
            <rect width={322} height={60} rx={4} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} />
            <text x={10} y={16} fill="#fca5a5" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              4. Else: Trigger RejectedExecutionHandler!
            </text>
            <text x={10} y={32} fill="#fecaca" fontSize={7.5} fontFamily="monospace" stroke="none">
              AbortPolicy (default throws RejectedExecutionException)
            </text>
            <text x={10} y={46} fill="#f87171" fontSize={7.5} fontFamily="monospace" stroke="none">
              DiscardOldestPolicy / CallerRunsPolicy (Recommended)
            </text>
          </g>
        </g>
      </g>

      {/* Right Column: CallerRuns Backpressure (Top) */}
      <g className="backpressure-card" transform="translate(410, 60)">
        <rect
          width={355}
          height={175}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#f59e0b"
          strokeWidth={1.5}
        />
        <rect width={355} height={26} rx={8} fill="#b45309" />
        <text x={12} y={17} fill="#fef3c7" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          CALLERRUNSPOLICY: AUTOMATIC BACKPRESSURE
        </text>

        <g transform="translate(14, 36)">
          <g className="caller-thread-executing" transform="translate(0, 0)">
            <rect className="backpressure-alert-glow" width={327} height={56} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
            <text x={8} y={16} fill="#fde68a" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
              Tomcat HTTP Thread executes task synchronously:
            </text>
            <text x={8} y={30} fill="#fef3c7" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Caller thread is busy -&gt; cannot accept new TCP sockets!
            </text>
            <text x={8} y={44} fill="#fbbf24" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Incoming client requests slow down naturally at OS TCP layer!
            </text>
          </g>

          <g transform="translate(0, 66)">
            <rect width={327} height={46} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={0.8} />
            <text x={8} y={16} fill="#c7d2fe" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
              ⚠️ NEVER use Executors.newFixedThreadPool() in Prod!
            </text>
            <text x={8} y={32} fill="#a5b4fc" fontSize={7.5} fontFamily="monospace" stroke="none">
              Uses unbounded LinkedBlockingQueue -&gt; OutOfMemoryError under spike!
            </text>
          </g>
        </g>
      </g>

      {/* Right Column: CompletableFuture Async Pipeline (Bottom) */}
      <g className="completable-future-card" transform="translate(410, 250)">
        <rect
          width={355}
          height={190}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect width={355} height={26} rx={8} fill="#047857" />
        <text x={12} y={17} fill="#ecfdf5" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          COMPLETABLEFUTURE: NON-BLOCKING ASYNC PIPELINE
        </text>

        <g transform="translate(14, 36)">
          {/* Async pipeline stages */}
          <g transform="translate(0, 0)">
            <g className="async-stage-box" transform="translate(0, 0)">
              <rect width={96} height={40} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
              <text x={6} y={15} fill="#a7f3d0" fontSize={7} fontFamily="monospace" stroke="none">Stage 1: Async</text>
              <text x={6} y={28} fill="#ffffff" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">fetchUser()</text>
            </g>

            <path d="M 98 20 L 114 20" stroke="#34d399" strokeWidth={1.5} fill="none" />

            <g className="async-stage-box" transform="translate(116, 0)">
              <rect width={96} height={40} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
              <text x={6} y={15} fill="#a7f3d0" fontSize={7} fontFamily="monospace" stroke="none">Stage 2: Pipe</text>
              <text x={6} y={28} fill="#ffffff" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">verifyFraud()</text>
            </g>

            <path d="M 214 20 L 230 20" stroke="#34d399" strokeWidth={1.5} fill="none" />

            <g className="async-stage-box" transform="translate(232, 0)">
              <rect width={96} height={40} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
              <text x={6} y={15} fill="#a7f3d0" fontSize={7} fontFamily="monospace" stroke="none">Stage 3: Save</text>
              <text x={6} y={28} fill="#ffffff" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">chargeCard()</text>
            </g>
          </g>

          {/* Non blocking summary */}
          <g className="non-blocking-badge" transform="translate(0, 52)">
            <rect width={327} height={70} rx={4} fill="#022c22" stroke="#10b981" strokeWidth={1} />
            <text x={8} y={16} fill="#34d399" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
              ✓ thenComposeAsync() + exceptionally():
            </text>
            <text x={8} y={30} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Zero blocking thread.join() or future.get()
            </text>
            <text x={8} y={44} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Uses ForkJoinPool.commonPool() or custom threadpool
            </text>
            <text x={8} y={58} fill="#6ee7b7" fontSize={7.5} fontFamily="monospace" stroke="none">
              &bull; Combines multiple async I/O with CompletableFuture.allOf()
            </text>
          </g>
        </g>
      </g>
    </SceneBoard>
  );
}
