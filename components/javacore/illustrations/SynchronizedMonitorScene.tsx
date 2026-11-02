'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function SynchronizedMonitorScene({
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
      // Step 0: Lightweight Lock CAS
      tl.addLabel('step-0');
      tl.from('.thread1-frame', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.header-mark-word', { scale: 0.9, opacity: 0, duration: 0.35 });
      tl.to('.mark-word-tag', { fill: '#10b981', duration: 0.3 });
      tl.to('.tag-text', { textContent: '00 (Thin CAS)', duration: 0.1 });
      tl.from('.cas-arrow', { opacity: 0, scaleY: 0, transformOrigin: 'top', duration: 0.35 }, '-=0.1');

      // Step 1: Thread 2 Adaptive Spin
      tl.addLabel('step-1');
      tl.from('.thread2-container', { opacity: 0, x: 20, duration: 0.4 });
      tl.to('.spin-ring', { rotation: 360, transformOrigin: 'center', repeat: 1, duration: 0.6, ease: 'none' });
      tl.from('.spin-badge', { opacity: 0, scale: 0.8, duration: 0.3 }, '-=0.3');

      // Step 2: Inflate to Heavyweight ObjectMonitor
      tl.addLabel('step-2');
      tl.to('.mark-word-tag', { fill: '#e11d48', duration: 0.3 });
      tl.to('.tag-text', { textContent: '10 (Inflated)', duration: 0.1 });
      tl.from('.object-monitor-box', { opacity: 0, y: 25, duration: 0.45 });
      tl.to('.futex-suspended', { opacity: 1, duration: 0.35 }, '-=0.1');
      tl.to('.os-wait-line', { opacity: 1, strokeDashoffset: 0, duration: 0.4 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        HOTSPOT LOCK INFLATION · MARK WORD (01 &rarr; 00 &rarr; 10) &amp; OBJECTMONITOR
      </Caption>

      {/* Target Java Object in Heap (Center) */}
      <g transform="translate(250, 70)">
        <rect width={300} height={135} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={300} height={28} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={150} y={19} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          JAVA OBJECT IN HEAP (synchronized target)
        </text>

        {/* 64-bit Mark Word */}
        <g className="header-mark-word" transform="translate(15, 38)">
          <rect width={270} height={42} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={12} y={18} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            64-bit Mark Word
          </text>
          <text x={12} y={32} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            0x00007FFF5D829B00
          </text>

          {/* 2-bit Lock Tag indicator */}
          <rect className="mark-word-tag" x={170} y={10} width={90} height={22} rx={4} fill="#0284c7" />
          <text className="tag-text" x={215} y={25} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            01 (Unlocked)
          </text>
        </g>

        {/* 32-bit Klass Word */}
        <g transform="translate(15, 86)">
          <rect width={270} height={36} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={12} y={22} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            Klass Pointer (32-bit compressed): <tspan fill="var(--text)" fontWeight="bold">Order.class</tspan>
          </text>
        </g>
      </g>

      {/* Thread 1 (Left): Acquires Lightweight Lock */}
      <g className="thread1-frame" transform="translate(40, 70)">
        <rect width={180} height={370} rx={8} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
        <rect width={180} height={30} rx={8} fill="#10b981" fillOpacity={0.15} />
        <text x={90} y={20} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          THREAD 1 (Acquired)
        </text>

        {/* Stack Frame BasicObjectLock */}
        <g transform="translate(15, 45)">
          <rect width={150} height={90} rx={6} fill="var(--surface-elevated)" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Lock Record on Stack
          </text>
          <text x={10} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Displaced Mark Word:
          </text>
          <text x={10} y={52} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            0x00000001 (Hash/Age)
          </text>
          <text x={10} y={72} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9}>
            CAS &rarr; Stack Pointer OK
          </text>
        </g>

        {/* CAS Pointer Arrow */}
        <g className="cas-arrow">
          <path d="M 165 90 C 210 90, 210 95, 250 95" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" fill="none" />
          <polygon points="250,95 242,91 242,99" fill="#10b981" />
        </g>

        <rect x={15} y={150} width={150} height={80} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
        <text x={25} y={175} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
          Critical Section:
        </text>
        <text x={25} y={192} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
          order.updateStatus();
        </text>
        <text x={25} y={208} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8}>
          Executing in User Space
        </text>
      </g>

      {/* Thread 2 (Right): Contending Thread */}
      <g className="thread2-container" transform="translate(580, 70)">
        <rect width={180} height={370} rx={8} fill="var(--surface)" stroke="#f59e0b" strokeWidth={1.5} />
        <rect width={180} height={30} rx={8} fill="#f59e0b" fillOpacity={0.15} />
        <text x={90} y={20} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          THREAD 2 (Contending)
        </text>

        {/* Spinning Phase */}
        <g transform="translate(15, 45)">
          <rect width={150} height={95} rx={6} fill="var(--surface-elevated)" stroke="#f59e0b" strokeWidth={1} />
          <text x={10} y={20} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            Adaptive User-Space Spin
          </text>
          <text x={10} y={35} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            CPU PAUSE Loop
          </text>

          {/* Spin Ring visual */}
          <g transform="translate(75, 62)">
            <circle className="spin-ring" r={16} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="18 10" />
            <circle r={4} fill="#f59e0b" />
          </g>
        </g>

        {/* Spin Badge */}
        <g className="spin-badge" opacity={0} transform="translate(15, 150)">
          <rect width={150} height={35} rx={6} fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" />
          <text x={75} y={21} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            Spun 10 Iterations (Exceeded)
          </text>
        </g>

        {/* Futex Suspended on OS */}
        <g className="futex-suspended" opacity={0} transform="translate(15, 200)">
          <rect width={150} height={90} rx={6} fill="#e11d48" fillOpacity={0.15} stroke="#e11d48" strokeWidth={1.5} />
          <text x={10} y={22} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            THREAD PARKED (Futex)
          </text>
          <text x={10} y={40} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Kernel Context Switch
          </text>
          <text x={10} y={55} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            pthread_mutex_lock()
          </text>
          <text x={10} y={72} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            Sleep in OS _cxq Queue
          </text>
        </g>
      </g>

      {/* C++ ObjectMonitor Off-Heap Struct (Bottom Center) */}
      <g className="object-monitor-box" opacity={0} transform="translate(250, 230)">
        <rect width={300} height={210} rx={8} fill="var(--surface)" stroke="#e11d48" strokeWidth={1.5} />
        <rect width={300} height={28} rx={8} fill="#e11d48" fillOpacity={0.15} />
        <text x={150} y={19} textAnchor="middle" fill="#e11d48" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          C++ ObjectMonitor (Off-Heap Inflated Lock)
        </text>

        {/* Fields inside ObjectMonitor */}
        <g transform="translate(15, 38)">
          <rect width={270} height={35} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={15} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>_owner pointer:</text>
          <text x={10} y={27} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Thread 1 (0x00007F1A882)
          </text>
        </g>
        <g transform="translate(15, 80)">
          <rect width={270} height={35} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={15} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>_cxq (Contention FIFO Queue):</text>
          <text x={10} y={27} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Thread 2 &rarr; NULL
          </text>
        </g>
        <g transform="translate(15, 122)">
          <rect width={270} height={35} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={15} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>_EntryList (Ready to awaken):</text>
          <text x={10} y={27} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            Empty
          </text>
        </g>
        <g transform="translate(15, 164)">
          <rect width={270} height={35} rx={4} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={15} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>_WaitSet (wait() callers):</text>
          <text x={10} y={27} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            Empty
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
