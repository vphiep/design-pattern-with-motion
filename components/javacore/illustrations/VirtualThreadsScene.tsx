'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function VirtualThreadsScene({
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
      // Step 0: Mount Virtual Thread onto Carrier OS Thread
      tl.addLabel('step-0');
      tl.from('.vt-queue', { opacity: 0, y: -20, duration: 0.4 });
      tl.from('.carrier-pool', { opacity: 0, y: 20, duration: 0.4 }, '-=0.2');
      tl.to('.active-vt', { y: 130, duration: 0.5, ease: 'power2.inOut' });
      tl.to('.mount-indicator', { opacity: 1, duration: 0.3 });

      // Step 1: Blocking I/O - Freeze Continuation & Unmount
      tl.addLabel('step-1');
      tl.to('.mount-indicator', { opacity: 0, duration: 0.2 });
      tl.to('.active-vt', {
        x: 270,
        y: 60,
        fill: '#f59e0b',
        duration: 0.55,
        ease: 'power2.inOut'
      });
      tl.from('.frozen-continuation', { opacity: 0, scale: 0.85, duration: 0.35 }, '-=0.2');
      tl.to('.carrier-1-status', { fill: '#10b981', textContent: 'FREE TO SERVE OTHER VTs', duration: 0.2 });
      tl.from('.epoll-wait', { opacity: 0, duration: 0.3 });

      // Step 2: I/O Resumes & Carrier Steals Continuation
      tl.addLabel('step-2');
      tl.to('.epoll-wait', { opacity: 0.2, duration: 0.2 });
      tl.from('.epoll-done', { opacity: 0, scale: 1.2, duration: 0.3 });
      tl.to('.active-vt', {
        x: 270,
        y: 200,
        fill: '#10b981',
        duration: 0.55,
        ease: 'power2.inOut'
      });
      tl.from('.carrier-resumed-badge', { opacity: 0, y: -10, duration: 0.3 }, '-=0.2');
      tl.to('.carrier-2-status', { fill: '#e11d48', textContent: 'EXECUTING VT #42 (RESUMED)', duration: 0.2 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        PROJECT LOOM · VIRTUAL THREAD MULTIPLEXING &amp; CONTINUATION FREEZING
      </Caption>

      {/* Virtual Threads In-Memory Queue (Top Left) */}
      <g className="vt-queue" transform="translate(40, 70)">
        <rect width={320} height={100} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={320} height={26} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={160} y={18} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          1,000,000 VIRTUAL THREADS (Heap Objects)
        </text>

        {/* Queued lightweight VT objects */}
        <g transform="translate(15, 38)">
          <rect width={60} height={45} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={30} y={26} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>VT #40</text>
        </g>
        <g transform="translate(85, 38)">
          <rect width={60} height={45} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={30} y={26} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>VT #41</text>
        </g>
        <g transform="translate(225, 38)">
          <rect width={80} height={45} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeDasharray="3 2" />
          <text x={40} y={26} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>... +999k</text>
        </g>
      </g>

      {/* Heap Frozen Continuation (Top Right) */}
      <g transform="translate(400, 70)">
        <rect width={360} height={130} rx={8} fill="var(--surface)" stroke="#f59e0b" strokeWidth={1.5} />
        <rect width={360} height={26} rx={8} fill="#f59e0b" fillOpacity={0.15} />
        <text x={180} y={18} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          JVM HEAP: FROZEN CONTINUATIONS
        </text>

        <g className="frozen-continuation" opacity={0} transform="translate(15, 38)">
          <rect width={330} height={75} rx={6} fill="var(--surface-elevated)" stroke="#f59e0b" strokeWidth={1} />
          <text x={12} y={20} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Continuation Chunk (Chunked Stack Array)
          </text>
          <text x={12} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            Saved Frames: [httpClient.send() &rarr; parseResponse()]
          </text>
          <text x={12} y={54} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            Size: ~256 bytes (only active frames, not 1MB OS stack!)
          </text>
        </g>

        {/* Epoll / Async Network Poller */}
        <g className="epoll-wait" opacity={0} transform="translate(15, 80)">
          <text x={260} y={35} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Async OS Epoll wait...
          </text>
        </g>
        <g className="epoll-done" opacity={0} transform="translate(230, 92)">
          <rect width={110} height={24} rx={4} fill="#10b981" />
          <text x={55} y={16} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Socket Ready!
          </text>
        </g>
      </g>

      {/* ForkJoinPool Carrier OS Threads (Bottom Half) */}
      <g className="carrier-pool" transform="translate(40, 230)">
        <rect width={720} height={210} rx={8} fill="var(--surface)" stroke="#e11d48" strokeWidth={1.5} />
        <rect width={720} height={30} rx={8} fill="#e11d48" fillOpacity={0.15} />
        <text x={360} y={20} textAnchor="middle" fill="#e11d48" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          CARRIER OS THREAD POOL (ForkJoinPool.commonPool() · Count = CPU Cores)
        </text>

        {/* Carrier Thread 1 */}
        <g transform="translate(20, 45)">
          <rect width={325} height={145} rx={6} fill="var(--surface-elevated)" stroke="#0284c7" strokeWidth={1} />
          <text x={15} y={22} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Carrier Thread #1 (OS pthread: 1MB stack)
          </text>
          <rect x={15} y={35} width={295} height={30} rx={4} fill="var(--surface)" stroke="var(--border-soft)" />
          <text className="carrier-1-status" x={162} y={54} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            RUNNING MOUNTED VT
          </text>

          {/* Mount indicator box */}
          <g className="mount-indicator" opacity={0} transform="translate(15, 75)">
            <rect width={295} height={55} rx={4} fill="#0284c7" fillOpacity={0.15} stroke="#0284c7" />
            <text x={15} y={20} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Continuation.run():
            </text>
            <text x={15} y={35} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
              OS thread executes VT bytecode directly on native CPU core
            </text>
          </g>
        </g>

        {/* Carrier Thread 2 */}
        <g transform="translate(375, 45)">
          <rect width={325} height={145} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={15} y={22} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            Carrier Thread #2 (Work-Stealing Worker)
          </text>
          <rect x={15} y={35} width={295} height={30} rx={4} fill="var(--surface)" stroke="var(--border-soft)" />
          <text className="carrier-2-status" x={162} y={54} textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            IDLE / READY TO STEAL
          </text>

          <g className="carrier-resumed-badge" opacity={0} transform="translate(15, 75)">
            <rect width={295} height={55} rx={4} fill="#10b981" fillOpacity={0.15} stroke="#10b981" />
            <text x={15} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Work-Stealing Success:
            </text>
            <text x={15} y={35} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
              Carrier #2 claims resumed VT #42 &amp; restores stack chunk
            </text>
          </g>
        </g>
      </g>

      {/* The Active Virtual Thread instance moving between Carrier and Heap */}
      <g className="active-vt" transform="translate(195, 108)">
        <rect width={60} height={45} rx={6} fill="#0284c7" stroke="#ffffff" strokeWidth={1.5} />
        <text x={30} y={22} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
          VT #42
        </text>
        <text x={30} y={36} textAnchor="middle" fill="#ffffff" opacity={0.8} fontFamily="var(--font-mono)" fontSize={8}>
          Active
        </text>
      </g>
    </SceneBoard>
  );
}
