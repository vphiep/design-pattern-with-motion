'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function PrimitivesReferencesScene({
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
      // Step 0: Stack Primitive Allocation (int age = 25)
      tl.addLabel('step-0');
      tl.from('.main-stack-frame', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.slot-primitive', { scale: 0.9, opacity: 0, transformOrigin: 'left center', duration: 0.35 });
      tl.to('.slot-primitive-rect', { stroke: '#10b981', strokeWidth: 2, duration: 0.3 });
      tl.from('.primitive-raw-bits', { opacity: 0, y: 5, duration: 0.25 });

      // Step 1: Heap Object Instantiation & Reference Pointer Binding (User user = new User("Alice", age))
      tl.addLabel('step-1');
      tl.from('.heap-container', { opacity: 0, x: 20, duration: 0.4 });
      tl.from('.user-heap-object', { scale: 0.85, opacity: 0, transformOrigin: 'center', duration: 0.45 });
      tl.from('.slot-ref', { opacity: 0, scale: 0.9, transformOrigin: 'left center', duration: 0.3 });
      tl.from('.pointer-arrow-1', { strokeDashoffset: 400, opacity: 0, duration: 0.5 });
      tl.to('.slot-ref-rect', { stroke: '#0ea5e9', strokeWidth: 2, duration: 0.3 }, '<');

      // Step 2: Strict Pass-by-Value (modifyValues(age, user))
      tl.addLabel('step-2');
      tl.from('.callee-stack-frame', { opacity: 0, y: 30, duration: 0.4 });
      tl.from('.pointer-arrow-copy', { strokeDashoffset: 400, opacity: 0, duration: 0.45 }, '-=0.1');
      tl.to('.callee-age-val', { textContent: '99', fill: '#ef4444', duration: 0.3 });
      tl.to('.callee-primitive-strike', { opacity: 1, duration: 0.2 }, '<');
      tl.to('.new-user-heap-object', { opacity: 1, scale: 1, duration: 0.4 });
      tl.to('.pointer-arrow-copy', {
        attr: { d: 'M 250 410 C 340 410, 420 380, 520 380' },
        stroke: '#f59e0b',
        duration: 0.5
      });
      tl.from('.pass-by-value-badge', { opacity: 0, scale: 0.8, transformOrigin: 'center', duration: 0.35 });
      tl.from('.main-untouched-badge', { opacity: 0, x: -10, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        JVM MEMORY STACK VS HEAP · STRICT PASS-BY-VALUE COPY PHYSICS
      </Caption>

      {/* Main Thread Stack Frame */}
      <g className="main-stack-frame">
        <rect
          x={40}
          y={60}
          width={240}
          height={210}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="var(--border-soft, #374151)"
          strokeWidth={1.5}
        />
        <rect x={40} y={60} width={240} height={28} rx={8} fill="#1f2937" />
        <text x={52} y={78} fill="#9ca3af" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          THREAD STACK: main()
        </text>

        {/* Slot 0: this */}
        <g transform="translate(50, 96)">
          <rect width={220} height={26} rx={4} fill="#1f2937" opacity={0.6} />
          <text x={8} y={17} fill="#6b7280" fontSize={10} fontFamily="monospace" stroke="none">
            [Slot 0] args: String[]
          </text>
        </g>

        {/* Slot 1: Primitive int age = 25 */}
        <g className="slot-primitive" transform="translate(50, 130)">
          <rect
            className="slot-primitive-rect"
            width={220}
            height={46}
            rx={4}
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth={1}
          />
          <text x={8} y={18} fill="#a7f3d0" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            [Slot 1] int age = 25
          </text>
          <text x={8} y={34} fill="#6ee7b7" fontSize={9} fontFamily="monospace" stroke="none">
            Raw Binary: 0x00000019 (4B)
          </text>
          <rect x={160} y={8} width={50} height={18} rx={3} fill="#10b981" fillOpacity={0.2} />
          <text x={165} y={20} fill="#34d399" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            PRIMITIVE
          </text>
        </g>

        {/* Slot 2: Reference User user = 0x7FFA */}
        <g className="slot-ref" transform="translate(50, 186)">
          <rect
            className="slot-ref-rect"
            width={220}
            height={46}
            rx={4}
            fill="#0c4a6e"
            stroke="#0ea5e9"
            strokeWidth={1}
          />
          <text x={8} y={18} fill="#bae6fd" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            [Slot 2] User user = 0x7FFA
          </text>
          <text x={8} y={34} fill="#7dd3fc" fontSize={9} fontFamily="monospace" stroke="none">
            Compressed OOP: 4-Byte Pointer
          </text>
          <circle cx={200} cy={23} r={5} fill="#0ea5e9" />
        </g>
      </g>

      {/* Main Untouched Safe Badge */}
      <g className="main-untouched-badge" transform="translate(40, 280)">
        <rect width={240} height={24} rx={4} fill="#10b981" fillOpacity={0.15} stroke="#10b981" strokeWidth={1} />
        <text x={120} y={16} textAnchor="middle" fill="#34d399" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          ✓ Original Values Preserved (age=25)
        </text>
      </g>

      {/* Pointer Arrow: Stack Slot 2 -> Heap User Object */}
      <path
        className="pointer-arrow-1"
        d="M 255 209 C 330 209, 390 140, 480 140"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth={2}
        strokeDasharray="4,4"
        markerEnd="url(#blue-arrow)"
      />

      {/* Java Heap Memory Container */}
      <g className="heap-container" transform="translate(480, 60)">
        <rect
          x={0}
          y={0}
          width={280}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#4f46e5"
          strokeWidth={1.5}
        />
        <rect x={0} y={0} width={280} height={28} rx={8} fill="#312e81" />
        <text x={12} y={18} fill="#c7d2fe" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          JAVA HEAP MEMORY (Shared Off-Stack)
        </text>

        {/* User Object @ 0x7FFA */}
        <g className="user-heap-object" transform="translate(16, 42)">
          <rect width={248} height={150} rx={6} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1.5} />
          <rect x={0} y={0} width={248} height={24} rx={6} fill="#4338ca" />
          <text x={8} y={16} fill="#ffffff" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            User @ 0x7FFA (24 Bytes Total)
          </text>

          {/* Mark Word */}
          <g transform="translate(10, 32)">
            <rect width={228} height={22} rx={3} fill="#312e81" />
            <text x={6} y={15} fill="#a5b4fc" fontSize={9} fontFamily="monospace" stroke="none">
              Mark Word (8B): Hash, Age=0, Unlocked
            </text>
          </g>

          {/* Klass Word */}
          <g transform="translate(10, 58)">
            <rect width={228} height={22} rx={3} fill="#312e81" />
            <text x={6} y={15} fill="#a5b4fc" fontSize={9} fontFamily="monospace" stroke="none">
              Klass Pointer (4B): User.class
            </text>
          </g>

          {/* Field: name */}
          <g transform="translate(10, 84)">
            <rect width={228} height={22} rx={3} fill="#1e293b" />
            <text x={6} y={15} fill="#38bdf8" fontSize={9} fontFamily="monospace" stroke="none">
              name (4B ref): -&gt; &quot;Alice&quot; @ StringPool
            </text>
          </g>

          {/* Field: age */}
          <g transform="translate(10, 110)">
            <rect width={228} height={22} rx={3} fill="#064e3b" />
            <text x={6} y={15} fill="#34d399" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
              age (4B int): 25 (Stored inside Heap Object)
            </text>
          </g>
        </g>

        {/* Reassigned User Object @ 0x99BB */}
        <g className="new-user-heap-object" transform="translate(16, 212)" opacity={0}>
          <rect width={248} height={85} rx={6} fill="#451a03" stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={0} y={0} width={248} height={22} rx={6} fill="#b45309" />
          <text x={8} y={15} fill="#fef3c7" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            New User @ 0x99BB (Bob, age=99)
          </text>
          <text x={10} y={40} fill="#fde68a" fontSize={9} fontFamily="monospace" stroke="none">
            Isolated allocation created by callee
          </text>
          <text x={10} y={58} fill="#fde68a" fontSize={8.5} fontFamily="monospace" stroke="none">
            Orphaned &amp; eligible for Minor GC!
          </text>
        </g>
      </g>

      {/* Callee Stack Frame: modifyValues(int, User) */}
      <g className="callee-stack-frame">
        <rect
          x={40}
          y={315}
          width={240}
          height={125}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#ef4444"
          strokeWidth={1.5}
        />
        <rect x={40} y={315} width={240} height={24} rx={8} fill="#991b1b" />
        <text x={52} y={331} fill="#fecaca" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          CALLEE STACK: modifyValues()
        </text>

        {/* Copy Slot: ageVal */}
        <g transform="translate(50, 345)">
          <rect width={220} height={32} rx={4} fill="#450a0a" stroke="#ef4444" strokeWidth={0.8} />
          <text x={8} y={15} fill="#fca5a5" fontSize={9} fontFamily="monospace" stroke="none">
            [Slot 0] ageVal (COPIED BITS):
          </text>
          <text className="callee-age-val" x={155} y={15} fill="#f87171" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            25
          </text>
          <line className="callee-primitive-strike" x1={150} y1={12} x2={175} y2={12} stroke="#f87171" strokeWidth={1.5} opacity={0} />
          <text x={8} y={26} fill="#f87171" fontSize={8} fontFamily="monospace" stroke="none">
            Mutating local copy does NOT affect main!
          </text>
        </g>

        {/* Copy Slot: userRef */}
        <g transform="translate(50, 385)">
          <rect width={220} height={32} rx={4} fill="#0c4a6e" stroke="#0284c7" strokeWidth={0.8} />
          <text x={8} y={15} fill="#7dd3fc" fontSize={9} fontFamily="monospace" stroke="none">
            [Slot 1] userRef (COPIED PTR): 0x7FFA
          </text>
          <text x={8} y={26} fill="#38bdf8" fontSize={8} fontFamily="monospace" stroke="none">
            Reassigning pointer does NOT alter main!
          </text>
        </g>
      </g>

      {/* Pointer Arrow: Callee userRef -> Heap User Object initially */}
      <path
        className="pointer-arrow-copy"
        d="M 250 405 C 330 405, 390 190, 480 190"
        fill="none"
        stroke="#0284c7"
        strokeWidth={1.8}
        strokeDasharray="3,3"
      />

      {/* Pass-by-Value Center Explainer Badge */}
      <g className="pass-by-value-badge" transform="translate(305, 230)">
        <rect width={150} height={50} rx={6} fill="#0f172a" stroke="#f59e0b" strokeWidth={1} />
        <text x={75} y={20} textAnchor="middle" fill="#fbbf24" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          STRICT PASS-BY-VALUE
        </text>
        <text x={75} y={36} textAnchor="middle" fill="#94a3b8" fontSize={8} fontFamily="monospace" stroke="none">
          Passes Bitwise Copies Only
        </text>
      </g>

      {/* Markers */}
      <defs>
        <marker id="blue-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#0ea5e9" />
        </marker>
      </defs>
    </SceneBoard>
  );
}
