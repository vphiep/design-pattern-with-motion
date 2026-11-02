'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function ModernJavaFeaturesScene({
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
      // Step 0: invokedynamic Lambda Bootstrap
      tl.addLabel('step-0');
      tl.from('.indy-bootstrap-card', { opacity: 0, x: -25, duration: 0.45 });
      tl.from('.callsite-pointer', { scale: 0.8, opacity: 0, duration: 0.35 });
      tl.from('.anonymous-vs-indy', { opacity: 0, y: 10, duration: 0.3 });

      // Step 1: Lazy Stream Pipeline Fusion
      tl.addLabel('step-1');
      tl.from('.stream-pipeline-card', { opacity: 0, scale: 0.95, duration: 0.4 });
      tl.from('.pipeline-stage', { opacity: 0, x: 15, stagger: 0.08, duration: 0.35 });
      tl.from('.pull-pulse-line', { strokeDashoffset: 300, opacity: 0, duration: 0.4 });

      // Step 2: Record Deconstruction & Pattern Matching Switch
      tl.addLabel('step-2');
      tl.from('.pattern-matching-card', { opacity: 0, y: 20, duration: 0.45 });
      tl.from('.deconstructed-binding', { scale: 0.85, opacity: 0, stagger: 0.08, duration: 0.3 });
      tl.to('.exhaustiveness-pill', { stroke: '#10b981', fill: '#064e3b', duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        MODERN JAVA 8-21 · INVOKEDYNAMIC LAMBDAS, STREAM PIPELINE FUSION &amp; PATTERN MATCHING
      </Caption>

      {/* Left Column: Lambda invokedynamic vs Anonymous Class */}
      <g className="indy-bootstrap-card" transform="translate(35, 60)">
        <rect
          width={350}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#6366f1"
          strokeWidth={1.5}
        />
        <rect width={350} height={28} rx={8} fill="#4338ca" />
        <text x={12} y={18} fill="#e0e7ff" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          JAVA 8: LAMBDAS &amp; INVOKEDYNAMIC
        </text>

        {/* Comparison: Old vs New */}
        <g className="anonymous-vs-indy" transform="translate(14, 40)">
          {/* Legacy Anonymous Inner Class */}
          <rect width={322} height={80} rx={6} fill="#1e1b4b" stroke="#4f46e5" strokeWidth={0.8} />
          <text x={10} y={18} fill="#f87171" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Legacy Anonymous Class (pre-Java 8):
          </text>
          <text x={10} y={34} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
            &bull; Generates separate Main$1.class disk file
          </text>
          <text x={10} y={48} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
            &bull; Allocates new Heap object on every call
          </text>
          <text x={10} y={62} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
            &bull; &apos;this&apos; keyword captures enclosing class instance
          </text>
        </g>

        {/* Modern invokedynamic bootstrap */}
        <g className="callsite-pointer" transform="translate(14, 132)">
          <rect width={322} height={120} rx={6} fill="#0f172a" stroke="#6366f1" strokeWidth={1} />
          <text x={10} y={18} fill="#a5b4fc" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            Modern Lambda via invokedynamic (indy):
          </text>
          <text x={10} y={36} fill="#818cf8" fontSize={8} fontFamily="monospace" stroke="none">
            1. Bytecode: invokedynamic #2, :apply()
          </text>
          <text x={10} y={52} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
            2. Bootstrap: LambdaMetafactory.metafactory(...)
          </text>
          <text x={10} y={68} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
            3. HotSpot dynamically generates in-memory class
          </text>
          <text x={10} y={84} fill="#cbd5e1" fontSize={7.5} fontFamily="monospace" stroke="none">
            4. Non-capturing lambdas reused as singleton constants!
          </text>
          <text x={10} y={102} fill="#34d399" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
            ✓ Zero Class File Overhead &middot; Peak C2 Inlining
          </text>
        </g>

        {/* Optional internals */}
        <g transform="translate(14, 265)">
          <rect width={322} height={95} rx={6} fill="#022c22" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={18} fill="#34d399" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            Optional&lt;T&gt; Golden Rules:
          </text>
          <text x={10} y={36} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
            &bull; RETURN TYPES ONLY: Never use as method arguments!
          </text>
          <text x={10} y={52} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
            &bull; NOT SERIALIZABLE: Never use in JPA entities or fields
          </text>
          <text x={10} y={68} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
            &bull; Avoid .get() without .isPresent(): Use .orElseThrow()
          </text>
          <text x={10} y={84} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
            &bull; Use flatMap() / orElseGet(Supplier) to prevent eager eval
          </text>
        </g>
      </g>

      {/* Right Column: Streams Pipeline (Top) & Pattern Matching (Bottom) */}
      <g className="stream-pipeline-card" transform="translate(410, 60)">
        <rect
          width={355}
          height={180}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#0284c7"
          strokeWidth={1.5}
        />
        <rect width={355} height={26} rx={8} fill="#0369a1" />
        <text x={12} y={17} fill="#e0f2fe" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          STREAMS API: LAZY PIPELINE FUSION
        </text>

        <g transform="translate(14, 36)">
          <text x={0} y={12} fill="#7dd3fc" fontSize={8} fontFamily="monospace" stroke="none">
            orders.stream().filter(o -&gt; o.amount() &gt; 500).map(...).findFirst();
          </text>

          {/* Pipeline stages */}
          <g transform="translate(0, 22)">
            <g className="pipeline-stage" transform="translate(0, 0)">
              <rect width={95} height={42} rx={4} fill="#0c4a6e" stroke="#0284c7" strokeWidth={1} />
              <text x={6} y={15} fill="#bae6fd" fontSize={7.5} fontFamily="monospace" stroke="none">Source Spliterator</text>
              <text x={6} y={30} fill="#ffffff" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">Order Stream</text>
            </g>

            <path className="pull-pulse-line" d="M 98 21 L 115 21" stroke="#38bdf8" strokeWidth={1.5} fill="none" />

            <g className="pipeline-stage" transform="translate(116, 0)">
              <rect width={95} height={42} rx={4} fill="#0c4a6e" stroke="#0284c7" strokeWidth={1} />
              <text x={6} y={15} fill="#bae6fd" fontSize={7.5} fontFamily="monospace" stroke="none">Intermediate</text>
              <text x={6} y={30} fill="#ffffff" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">filter &gt; map</text>
            </g>

            <path className="pull-pulse-line" d="M 214 21 L 231 21" stroke="#38bdf8" strokeWidth={1.5} fill="none" />

            <g className="pipeline-stage" transform="translate(232, 0)">
              <rect width={95} height={42} rx={4} fill="#065f46" stroke="#10b981" strokeWidth={1} />
              <text x={6} y={15} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">Terminal Op</text>
              <text x={6} y={30} fill="#ffffff" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">findFirst()</text>
            </g>
          </g>

          {/* Fusion note */}
          <g transform="translate(0, 76)">
            <rect width={327} height={38} rx={4} fill="#082f49" stroke="#0369a1" strokeWidth={0.8} />
            <text x={8} y={15} fill="#38bdf8" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              ★ Loop Fusion &amp; Short-Circuiting:
            </text>
            <text x={8} y={28} fill="#bae6fd" fontSize={7.5} fontFamily="monospace" stroke="none">
              Zero intermediate ArrayList created; pulls single element matching filter
            </text>
          </g>
        </g>
      </g>

      {/* Java 17-21 Sealed Classes & Pattern Matching */}
      <g className="pattern-matching-card" transform="translate(410, 255)">
        <rect
          width={355}
          height={185}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect width={355} height={26} rx={8} fill="#047857" />
        <text x={12} y={17} fill="#ecfdf5" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
          JAVA 21: RECORDS &amp; PATTERN MATCHING SWITCH
        </text>

        <g transform="translate(14, 36)">
          {/* Code representation */}
          <rect width={327} height={60} rx={4} fill="#064e3b" stroke="#10b981" strokeWidth={0.8} />
          <text x={8} y={16} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
            switch (payment) &#123;
          </text>
          <text x={16} y={30} fill="#ffffff" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            case CreditCard(String cardNum, double amt) -&gt; ...
          </text>
          <text x={16} y={44} fill="#ffffff" fontSize={7.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            case Crypto(String wallet, double amt) when amt &gt; 1000 -&gt; ...
          </text>
          <text x={8} y={54} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
            &#125;
          </text>

          {/* Benefits */}
          <g className="deconstructed-binding" transform="translate(0, 70)">
            <rect className="exhaustiveness-pill" width={327} height={52} rx={4} fill="#022c22" stroke="#10b981" strokeWidth={1} />
            <text x={8} y={18} fill="#34d399" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
              ✓ Record Deconstruction &amp; Guarded Clauses (when)
            </text>
            <text x={8} y={32} fill="#a7f3d0" fontSize={7.5} fontFamily="monospace" stroke="none">
              Eliminates instanceof + explicit cast boilerplate completely.
            </text>
            <text x={8} y={44} fill="#6ee7b7" fontSize={7.5} fontFamily="monospace" stroke="none">
              Compiler enforces exhaustiveness: no default branch needed!
            </text>
          </g>
        </g>
      </g>
    </SceneBoard>
  );
}
