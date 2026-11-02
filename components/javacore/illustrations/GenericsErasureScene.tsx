'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function GenericsErasureScene({
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
      // Step 0: Compile-time Type Erasure
      tl.addLabel('step-0');
      tl.from('.source-code-box', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.erased-code-box', { opacity: 0, scale: 0.9, duration: 0.35 });
      tl.to('.generic-tag-crossout', { opacity: 1, duration: 0.25 });
      tl.to('.erased-object-badge', { fill: '#0284c7', duration: 0.3 });

      // Step 1: Synthetic Bridge Method Generation
      tl.addLabel('step-1');
      tl.from('.bridge-method-box', { opacity: 0, y: 20, duration: 0.4 });
      tl.to('.vtable-polymorphic', { stroke: '#10b981', strokeWidth: 1.5, duration: 0.3 });
      tl.from('.bridge-flag-badge', { opacity: 0, scale: 0.8, duration: 0.25 }, '-=0.1');

      // Step 2: Runtime Bytecode checkcast Verification
      tl.addLabel('step-2');
      tl.from('.checkcast-bytecode-box', { opacity: 0, x: 20, duration: 0.4 });
      tl.to('.checkcast-tag', { fill: '#10b981', duration: 0.25 });
      tl.from('.cast-safe-badge', { opacity: 0, scale: 1.2, duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        GENERICS &amp; TYPE ERASURE · UPPER BOUND ERASURE, BRIDGE METHODS &amp; CHECKCAST
      </Caption>

      {/* Java Source Code with Generics (Left) */}
      <g className="source-code-box" transform="translate(40, 70)">
        <rect width={210} height={370} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={210} height={28} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={105} y={19} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          JAVA SOURCE CODE (.java)
        </text>

        <g transform="translate(15, 40)">
          <rect width={180} height={120} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            public class Node&lt;T&gt; &#123;
          </text>
          <text x={15} y={40} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            private T data;
          </text>
          <text x={15} y={60} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            public void setData(T d) &#123;
          </text>
          <text x={20} y={78} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            this.data = d;
          </text>
          <text x={15} y={96} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            &#125;
          </text>
          <text x={10} y={114} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            &#125;
          </text>
        </g>

        {/* Consumer with String type argument */}
        <g transform="translate(15, 175)">
          <rect width={180} height={85} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Caller Invocation:
          </text>
          <text x={10} y={40} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Node&lt;String&gt; n = new Node&lt;&gt;();
          </text>
          <text x={10} y={56} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            n.setData(&quot;Order-101&quot;);
          </text>
          <text x={10} y={72} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            String val = n.getData();
          </text>
        </g>

        <text x={15} y={320} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
          Compile-time Type Safety Verification
        </text>
      </g>

      {/* Erased Bytecode in Class File (Center) */}
      <g className="erased-code-box" transform="translate(270, 70)">
        <rect width={250} height={370} rx={8} fill="var(--surface)" stroke="#f59e0b" strokeWidth={1.5} />
        <rect width={250} height={28} rx={8} fill="#f59e0b" fillOpacity={0.15} />
        <text x={125} y={19} textAnchor="middle" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          ERASED BYTECODE (.class)
        </text>

        {/* Erased class structure */}
        <g transform="translate(15, 40)">
          <rect width={220} height={95} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            public class Node &#123;
          </text>
          <text x={15} y={40} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            private <tspan fill="#0284c7" fontWeight="bold">Object</tspan> data;
          </text>
          <text x={15} y={60} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9}>
            public void setData(<tspan fill="#0284c7" fontWeight="bold">Object</tspan> d) &#123;
          </text>
          <text x={20} y={76} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={9}>
            this.data = d;
          </text>
          <text x={10} y={90} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            &#125;
          </text>
        </g>

        {/* Synthetic Bridge Method */}
        <g className="bridge-method-box" transform="translate(15, 150)">
          <rect className="vtable-polymorphic" width={220} height={105} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Synthetic Bridge Method:
          </text>
          <text x={10} y={36} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            {`// flags: ACC_BRIDGE, ACC_SYNTHETIC`}
          </text>
          <text x={10} y={54} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            public void setData(Object o) &#123;
          </text>
          <text x={20} y={70} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            {`setData((String) o); // invokes real`}
          </text>
          <text x={10} y={86} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            &#125;
          </text>
        </g>

        {/* Bridge Flag Badge */}
        <g className="bridge-flag-badge" opacity={0} transform="translate(15, 270)">
          <rect width={220} height={32} rx={4} fill="#10b981" fillOpacity={0.2} stroke="#10b981" />
          <text x={110} y={20} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            Protects Polymorphic vtable Override!
          </text>
        </g>

        <text x={15} y={335} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
          Signature Attribute stores generic info for reflection!
        </text>
      </g>

      {/* Runtime JVM Execution & checkcast (Right) */}
      <g className="checkcast-bytecode-box" transform="translate(540, 70)">
        <rect width={220} height={370} rx={8} fill="var(--surface)" stroke="#e11d48" strokeWidth={1.5} />
        <rect width={220} height={28} rx={8} fill="#e11d48" fillOpacity={0.15} />
        <text x={110} y={19} textAnchor="middle" fill="#e11d48" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          RUNTIME JIT / CHECKCAST
        </text>

        {/* Bytecode Instructions */}
        <g transform="translate(15, 40)">
          <rect width={190} height={120} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Caller Disassembled Bytecode:
          </text>
          <text x={10} y={40} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            {`0: aload_1 // push node`}
          </text>
          <text x={10} y={56} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>1: invokevirtual getData()</text>
          <rect className="checkcast-tag" x={10} y={64} width={170} height={24} rx={3} fill="#0284c7" />
          <text x={95} y={80} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            3: checkcast java/lang/String
          </text>
          <text x={10} y={108} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            {`6: astore_2 // store in val`}
          </text>
        </g>

        {/* Runtime Safety Badge */}
        <g className="cast-safe-badge" opacity={0} transform="translate(15, 175)">
          <rect width={190} height={60} rx={6} fill="var(--surface-elevated)" stroke="#10b981" strokeWidth={1.5} />
          <text x={10} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Runtime Type Enforcement:
          </text>
          <text x={10} y={36} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            If class != java/lang/String:
          </text>
          <text x={10} y={50} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            Throws ClassCastException!
          </text>
        </g>

        <g transform="translate(15, 250)">
          <rect width={190} height={60} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Heap Pollution Defense:
          </text>
          <text x={10} y={35} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Raw types (List l = new ArrayList())
          </text>
          <text x={10} y={50} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={8}>
            Flagged by javac -Xlint:unchecked
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
