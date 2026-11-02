'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function PolymorphismVtableScene({
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
      // Step 0: Metaspace InstanceKlass & vtable Layout (vtable-build)
      tl.addLabel('step-0');
      tl.from('.stack-box-poly', { opacity: 0, x: -20, duration: 0.35 });
      tl.from('.heap-poly-card', { opacity: 0, scale: 0.9, duration: 0.4 });
      tl.from('.metaspace-vtable-box', { opacity: 0, x: 20, duration: 0.45 });
      tl.from('.vtable-slot-row', { opacity: 0, stagger: 0.05, duration: 0.3 });
      tl.to('.vtable-slot-4', { stroke: '#f59e0b', strokeWidth: 1.5, duration: 0.3 });

      // Step 1: invokevirtual dynamic dispatch dereference (dynamic-dispatch)
      tl.addLabel('step-1');
      tl.from('.arrow-poly-stack-heap', { strokeDashoffset: 400, opacity: 0, duration: 0.4 });
      tl.from('.arrow-poly-heap-meta', { strokeDashoffset: 400, opacity: 0, duration: 0.45 });
      tl.to('.klass-pointer-box', { stroke: '#0ea5e9', strokeWidth: 2, duration: 0.3 }, '<');
      tl.to('.vtable-slot-4', { fill: '#b45309', duration: 0.35 });
      tl.from('.dispatch-pulse-badge', { opacity: 0, scale: 0.8, transformOrigin: 'center', duration: 0.3 });

      // Step 2: C2 JIT Monomorphic Inline Caching (monomorphic-inline-cache)
      tl.addLabel('step-2');
      tl.from('.inline-cache-overlay', { opacity: 0, y: -15, duration: 0.45 });
      tl.to('.arrow-poly-heap-meta', { opacity: 0.2, strokeDasharray: '2,4', duration: 0.3 });
      tl.to('.metaspace-vtable-box', { opacity: 0.3, filter: 'grayscale(0.6)', duration: 0.4 }, '<');
      tl.from('.inlined-assembly-box', { scale: 0.9, opacity: 0, duration: 0.35 }, '-=0.1');
      tl.from('.bypass-direct-arrow', { strokeDashoffset: 400, opacity: 0, duration: 0.45 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        JVM DYNAMIC DISPATCH · METASPACE VTABLE ARRAY &amp; JIT INLINE CACHING
      </Caption>

      {/* Stack Frame (Left) */}
      <g className="stack-box-poly" transform="translate(40, 60)">
        <rect
          width={180}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="var(--border-soft, #374151)"
          strokeWidth={1.5}
        />
        <rect width={180} height={28} rx={8} fill="#1f2937" />
        <text x={10} y={18} fill="#9ca3af" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          STACK: executePayment()
        </text>

        {/* Local Var: payment */}
        <g transform="translate(10, 45)">
          <rect width={160} height={60} rx={6} fill="#0c4a6e" stroke="#0ea5e9" strokeWidth={1} />
          <text x={8} y={20} fill="#bae6fd" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            payment: Payment
          </text>
          <text x={8} y={38} fill="#7dd3fc" fontSize={9} fontFamily="monospace" stroke="none">
            Ref: @0xHEAP_CARD
          </text>
          <text x={8} y={52} fill="#38bdf8" fontSize={8} fontFamily="monospace" stroke="none">
            Polymorphic Interface
          </text>
        </g>

        {/* Local Var: amount */}
        <g transform="translate(10, 115)">
          <rect width={160} height={45} rx={6} fill="#064e3b" stroke="#10b981" strokeWidth={1} />
          <text x={8} y={18} fill="#a7f3d0" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            amount: 5000L
          </text>
          <text x={8} y={34} fill="#6ee7b7" fontSize={8.5} fontFamily="monospace" stroke="none">
            Primitive Long (8B)
          </text>
        </g>

        {/* Bytecode Call Site */}
        <g transform="translate(10, 175)">
          <rect width={160} height={185} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1} />
          <text x={8} y={18} fill="#f59e0b" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            BYTECODE CALL SITE:
          </text>
          <text x={8} y={36} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
            0: aload_0
          </text>
          <text x={8} y={54} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
            1: lload_1
          </text>
          <text x={8} y={74} fill="#38bdf8" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            2: invokevirtual #7
          </text>
          <text x={12} y={90} fill="#64748b" fontSize={7.5} fontFamily="monospace" stroke="none">
            ConstantPool #7:
          </text>
          <text x={12} y={105} fill="#64748b" fontSize={7.5} fontFamily="monospace" stroke="none">
            Payment.process(J)V
          </text>
          <text x={12} y={120} fill="#a5b4fc" fontSize={7.5} fontFamily="monospace" stroke="none">
            vtable Slot Index: 4
          </text>
          <rect x={8} y={135} width={144} height={40} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={0.8} />
          <text x={14} y={150} fill="#c7d2fe" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
            O(1) Slot Dispatch
          </text>
          <text x={14} y={165} fill="#a5b4fc" fontSize={7.5} fontFamily="monospace" stroke="none">
            Dual Pointer Lookup
          </text>
        </g>
      </g>

      {/* Java Heap Object (Center) */}
      <g className="heap-poly-card" transform="translate(245, 60)">
        <rect
          width={220}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#4f46e5"
          strokeWidth={1.5}
        />
        <rect width={220} height={28} rx={8} fill="#312e81" />
        <text x={10} y={18} fill="#c7d2fe" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          HEAP: CreditCardPayment
        </text>

        <g transform="translate(10, 45)">
          <rect width={200} height={45} rx={5} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1} />
          <text x={8} y={18} fill="#c7d2fe" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Mark Word (8 Bytes)
          </text>
          <text x={8} y={34} fill="#a5b4fc" fontSize={8} fontFamily="monospace" stroke="none">
            Hash: 0 | Age: 0 | Lock: 01
          </text>
        </g>

        {/* Klass Pointer */}
        <g className="klass-pointer-box" transform="translate(10, 100)">
          <rect width={200} height={55} rx={5} fill="#0c4a6e" stroke="#0ea5e9" strokeWidth={1} />
          <text x={8} y={18} fill="#bae6fd" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Klass Pointer (4 Bytes)
          </text>
          <text x={8} y={34} fill="#7dd3fc" fontSize={8.5} fontFamily="monospace" stroke="none">
            -&gt; InstanceKlass (Metaspace)
          </text>
          <text x={8} y={48} fill="#38bdf8" fontSize={8} fontFamily="monospace" stroke="none">
            Compressed OOP: * 8 Offset
          </text>
        </g>

        {/* Field */}
        <g transform="translate(10, 165)">
          <rect width={200} height={45} rx={5} fill="#1e293b" stroke="#475569" strokeWidth={1} />
          <text x={8} y={18} fill="#e2e8f0" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            Field: cardNumber (4B ref)
          </text>
          <text x={8} y={34} fill="#94a3b8" fontSize={8} fontFamily="monospace" stroke="none">
            Points to String &quot;4111...&quot;
          </text>
        </g>

        {/* Dynamic Dispatch Flow Badge */}
        <g className="dispatch-pulse-badge" transform="translate(10, 230)">
          <rect width={200} height={130} rx={6} fill="#022c22" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={22} fill="#34d399" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            DYNAMIC RESOLUTION:
          </text>
          <text x={10} y={42} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            1. Read Klass: CreditCard
          </text>
          <text x={10} y={62} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            2. Dereference vtable[4]
          </text>
          <text x={10} y={82} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            3. Jump to Overridden Code
          </text>
          <text x={10} y={108} fill="#6ee7b7" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
            Execution Time: ~0.8ns
          </text>
        </g>
      </g>

      {/* Metaspace InstanceKlass vtable (Right) */}
      <g className="metaspace-vtable-box" transform="translate(490, 60)">
        <rect
          width={270}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#d97706"
          strokeWidth={1.5}
        />
        <rect width={270} height={28} rx={8} fill="#78350f" />
        <text x={10} y={18} fill="#fef3c7" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          METASPACE: InstanceKlass vtable
        </text>

        {/* vtable Slots */}
        <g transform="translate(10, 38)">
          {[
            { slot: 0, name: 'Object.hashCode()', target: 'HotSpot Native' },
            { slot: 1, name: 'Object.equals()', target: 'HotSpot Native' },
            { slot: 2, name: 'Object.toString()', target: 'HotSpot Native' },
            { slot: 3, name: 'Payment.validate()', target: 'Inherited Base Code' }
          ].map((item, idx) => (
            <g key={idx} className="vtable-slot-row" transform={`translate(0, ${idx * 46})`}>
              <rect width={250} height={38} rx={4} fill="#1f2937" stroke="#374151" strokeWidth={1} />
              <text x={8} y={16} fill="#9ca3af" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
                Slot {item.slot}: {item.name}
              </text>
              <text x={8} y={30} fill="#6b7280" fontSize={7.5} fontFamily="monospace" stroke="none">
                Entry -&gt; {item.target}
              </text>
            </g>
          ))}

          {/* Overridden Slot 4 */}
          <g className="vtable-slot-4" transform="translate(0, 184)">
            <rect width={250} height={52} rx={5} fill="#78350f" stroke="#f59e0b" strokeWidth={1.5} />
            <text x={8} y={18} fill="#fef3c7" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              ★ Slot 4: Payment.process()
            </text>
            <text x={8} y={34} fill="#fde68a" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              OVERRIDDEN: CreditCard.process()!
            </text>
            <text x={8} y={46} fill="#fbbf24" fontSize={7.5} fontFamily="monospace" stroke="none">
              Native Machine Address: 0x7FFF44C0
            </text>
          </g>

          {/* Unique Slot 5 */}
          <g className="vtable-slot-row" transform="translate(0, 244)">
            <rect width={250} height={38} rx={4} fill="#1f2937" stroke="#374151" strokeWidth={1} />
            <text x={8} y={16} fill="#9ca3af" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              Slot 5: CreditCard.charge()
            </text>
            <text x={8} y={30} fill="#6b7280" fontSize={7.5} fontFamily="monospace" stroke="none">
              Subclass Unique Method
            </text>
          </g>
        </g>
      </g>

      {/* Pointer: Stack payment -> Heap Object */}
      <path
        className="arrow-poly-stack-heap"
        d="M 220 120 C 235 120, 235 120, 245 120"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth={2}
        markerEnd="url(#blue-arrow-poly)"
      />

      {/* Pointer: Heap Klass Pointer -> Metaspace InstanceKlass vtable */}
      <path
        className="arrow-poly-heap-meta"
        d="M 445 125 C 470 125, 470 245, 490 245"
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2}
        markerEnd="url(#amber-arrow-poly)"
      />

      {/* Step 2: C2 JIT Monomorphic Inline Cache (MIC) Overlay */}
      <g className="inline-cache-overlay" transform="translate(200, 310)">
        <rect
          width={400}
          height={130}
          rx={8}
          fill="#0f172a"
          stroke="#10b981"
          strokeWidth={2}
          filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
        />
        <rect width={400} height={26} rx={8} fill="#064e3b" />
        <text x={12} y={17} fill="#a7f3d0" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          ⚡ C2 JIT MONOMORPHIC INLINE CACHING (MIC) ACTIVATED!
        </text>

        <g className="inlined-assembly-box" transform="translate(14, 36)">
          <rect width={372} height={80} rx={4} fill="#022c22" stroke="#059669" strokeWidth={1} />
          <text x={10} y={18} fill="#34d399" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            Generated Assembly: Inlined Call Site (0ns Dispatch)
          </text>
          <text x={10} y={36} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            mov  0x8(%rdi), %r10d        ; Load Klass Word
          </text>
          <text x={10} y={52} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            cmp  $CreditCard.class, %r10d ; Single-cycle type check
          </text>
          <text x={10} y={68} fill="#6ee7b7" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            ; INLINED CreditCard.process() MACHINE CODE DIRECTLY HERE!
          </text>
        </g>
      </g>

      {/* Direct Bypass Arrow for JIT Inlining */}
      <path
        className="bypass-direct-arrow"
        d="M 220 100 C 230 100, 190 330, 200 330"
        fill="none"
        stroke="#10b981"
        strokeWidth={2.5}
        markerEnd="url(#green-arrow-poly)"
      />

      {/* Markers */}
      <defs>
        <marker id="blue-arrow-poly" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#0ea5e9" />
        </marker>
        <marker id="amber-arrow-poly" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#f59e0b" />
        </marker>
        <marker id="green-arrow-poly" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#10b981" />
        </marker>
      </defs>
    </SceneBoard>
  );
}
