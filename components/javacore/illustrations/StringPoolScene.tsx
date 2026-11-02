'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function StringPoolScene({
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
      // Step 0: String Literal Pooling (String s1 = "Java")
      tl.addLabel('step-0');
      tl.from('.stack-var-s1', { opacity: 0, x: -15, duration: 0.35 });
      tl.from('.string-table-box', { opacity: 0, scale: 0.95, duration: 0.4 });
      tl.from('.pool-node-java', { scale: 0.7, opacity: 0, transformOrigin: 'center', duration: 0.4 });
      tl.from('.arrow-s1-pool', { strokeDashoffset: 400, opacity: 0, duration: 0.5 });
      tl.from('.step0-badge', { opacity: 0, scale: 0.8, duration: 0.3 }, '-=0.2');

      // Step 1: new String() forces distinct Heap allocation (String s2 = new String("Java"))
      tl.addLabel('step-1');
      tl.from('.stack-var-s2', { opacity: 0, x: -15, duration: 0.35 });
      tl.from('.heap-s2-object', { opacity: 0, y: 15, scale: 0.9, duration: 0.45 });
      tl.from('.arrow-s2-heap', { strokeDashoffset: 400, opacity: 0, duration: 0.5 });
      tl.from('.equality-badge-false', { opacity: 0, scale: 0.8, duration: 0.35 }, '-=0.1');

      // Step 2: String.intern() retrieves canonized pooled reference (String s3 = s2.intern())
      tl.addLabel('step-2');
      tl.from('.stack-var-s3', { opacity: 0, x: -15, duration: 0.35 });
      tl.from('.intern-scan-pulse', { opacity: 0, scale: 0.8, transformOrigin: 'center', duration: 0.3 });
      tl.from('.arrow-s3-pool', { strokeDashoffset: 400, opacity: 0, duration: 0.5 });
      tl.from('.equality-badge-true', { opacity: 0, scale: 0.8, duration: 0.35 }, '-=0.1');
      tl.to('.pool-node-java', { stroke: '#10b981', strokeWidth: 2.5, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        JVM STRING CONSTANT POOL (C++ STRINGTABLE) VS HEAP DUPLICATION
      </Caption>

      {/* Thread Stack Frame */}
      <g transform="translate(40, 60)">
        <rect
          width={210}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="var(--border-soft, #374151)"
          strokeWidth={1.5}
        />
        <rect width={210} height={28} rx={8} fill="#1f2937" />
        <text x={12} y={18} fill="#9ca3af" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          THREAD STACK
        </text>

        {/* s1: Literal Ref */}
        <g className="stack-var-s1" transform="translate(12, 45)">
          <rect width={186} height={60} rx={6} fill="#064e3b" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={20} fill="#a7f3d0" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
            s1: String
          </text>
          <text x={10} y={38} fill="#6ee7b7" fontSize={9.5} fontFamily="monospace" stroke="none">
            Points to: @0xPOOL_01
          </text>
          <text x={10} y={52} fill="#34d399" fontSize={8.5} fontFamily="monospace" stroke="none">
            &quot;Java&quot; Literal
          </text>
        </g>

        {/* s2: new String Ref */}
        <g className="stack-var-s2" transform="translate(12, 125)">
          <rect width={186} height={60} rx={6} fill="#7f1d1d" stroke="#ef4444" strokeWidth={1} />
          <text x={10} y={20} fill="#fecaca" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
            s2: String
          </text>
          <text x={10} y={38} fill="#fca5a5" fontSize={9.5} fontFamily="monospace" stroke="none">
            Points to: @0xHEAP_02
          </text>
          <text x={10} y={52} fill="#f87171" fontSize={8.5} fontFamily="monospace" stroke="none">
            new String(&quot;Java&quot;)
          </text>
        </g>

        {/* s3: intern() Ref */}
        <g className="stack-var-s3" transform="translate(12, 205)">
          <rect width={186} height={60} rx={6} fill="#0c4a6e" stroke="#0ea5e9" strokeWidth={1} />
          <text x={10} y={20} fill="#bae6fd" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
            s3: String
          </text>
          <text x={10} y={38} fill="#7dd3fc" fontSize={9.5} fontFamily="monospace" stroke="none">
            Points to: @0xPOOL_01
          </text>
          <text x={10} y={52} fill="#38bdf8" fontSize={8.5} fontFamily="monospace" stroke="none">
            s2.intern() Result
          </text>
        </g>

        {/* Identity Equality Check Summary */}
        <g transform="translate(12, 285)">
          <rect width={186} height={80} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1} />
          <text x={10} y={20} fill="#94a3b8" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            EQUALITY COMPARISON:
          </text>
          <text x={10} y={40} fill="#f87171" fontSize={9} fontFamily="monospace" stroke="none">
            s1 == s2 : FALSE (Diff Addr)
          </text>
          <text x={10} y={58} fill="#34d399" fontSize={9} fontFamily="monospace" stroke="none">
            s1 == s3 : TRUE (Same Addr)
          </text>
          <text x={10} y={74} fill="#38bdf8" fontSize={8.5} fontFamily="monospace" stroke="none">
            s1.equals(s2): TRUE (Chars)
          </text>
        </g>
      </g>

      {/* Heap Memory Shell */}
      <g transform="translate(280, 60)">
        <rect
          width={480}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#4f46e5"
          strokeWidth={1.5}
        />
        <rect width={480} height={28} rx={8} fill="#312e81" />
        <text x={14} y={18} fill="#c7d2fe" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          JAVA HEAP MEMORY (Compact Strings Architecture)
        </text>

        {/* String Constant Pool (StringTable) */}
        <g className="string-table-box" transform="translate(18, 42)">
          <rect
            width={444}
            height={155}
            rx={6}
            fill="#022c22"
            stroke="#10b981"
            strokeWidth={1.5}
          />
          <rect width={444} height={24} rx={6} fill="#065f46" />
          <text x={12} y={16} fill="#d1fae5" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            STRING CONSTANT POOL · Native C++ StringTable Hash Buckets
          </text>

          {/* Interned Node: "Java" */}
          <g className="pool-node-java" transform="translate(16, 36)">
            <rect width={412} height={102} rx={6} fill="#064e3b" stroke="#34d399" strokeWidth={1.5} />
            <text x={12} y={22} fill="#ffffff" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
              String Instance @ 0xPOOL_01
            </text>
            <text x={260} y={22} fill="#6ee7b7" fontSize={9.5} fontFamily="monospace" stroke="none">
              hash: 2301506
            </text>

            {/* Compact Strings byte[] data */}
            <g transform="translate(12, 34)">
              <rect width={388} height={56} rx={4} fill="#022c22" stroke="#059669" strokeWidth={1} />
              <text x={10} y={18} fill="#a7f3d0" fontSize={9.5} fontFamily="monospace" stroke="none">
                Compact byte[] (JEP 254): coder = 0 (LATIN1, 1 byte/char)
              </text>
              <g transform="translate(10, 26)">
                {['J', 'a', 'v', 'a'].map((ch, idx) => (
                  <g key={idx} transform={`translate(${idx * 40}, 0)`}>
                    <rect width={32} height={22} rx={3} fill="#047857" />
                    <text x={16} y={15} textAnchor="middle" fill="#ecfdf5" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
                      {ch}
                    </text>
                  </g>
                ))}
                <text x={180} y={16} fill="#6ee7b7" fontSize={9} fontFamily="monospace" stroke="none">
                  Size: 4 Bytes (Zero UTF-16 bloat!)
                </text>
              </g>
            </g>
          </g>
        </g>

        {/* General Heap Object: new String("Java") */}
        <g className="heap-s2-object" transform="translate(18, 215)">
          <rect width={444} height={145} rx={6} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} />
          <rect width={444} height={24} rx={6} fill="#991b1b" />
          <text x={12} y={16} fill="#fee2e2" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            GENERAL HEAP ALLOCATION · new String(&quot;Java&quot;) @ 0xHEAP_02
          </text>

          <g transform="translate(16, 36)">
            <rect width={412} height={92} rx={6} fill="#7f1d1d" stroke="#f87171" strokeWidth={1} />
            <text x={12} y={20} fill="#fef2f2" fontSize={10.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              Separate Object Shell (24 Bytes Header + Ref)
            </text>
            <text x={12} y={40} fill="#fca5a5" fontSize={9} fontFamily="monospace" stroke="none">
              • Mark Word (8B) + Klass Pointer (4B)
            </text>
            <text x={12} y={58} fill="#fca5a5" fontSize={9} fontFamily="monospace" stroke="none">
              • byte[] value ref: Points to duplicate or pooled array
            </text>
            <text x={12} y={76} fill="#fca5a5" fontSize={9} fontFamily="monospace" stroke="none">
              • coder = 0, hash = 2301506 (Calculated lazily)
            </text>
            <rect x={270} y={35} width={130} height={42} rx={4} fill="#991b1b" />
            <text x={335} y={52} textAnchor="middle" fill="#fee2e2" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              MEMORY OVERHEAD
            </text>
            <text x={335} y={67} textAnchor="middle" fill="#fecaca" fontSize={8} fontFamily="monospace" stroke="none">
              Duplicate Heap Object
            </text>
          </g>
        </g>
      </g>

      {/* Pointer Arrow: s1 -> Pool */}
      <path
        className="arrow-s1-pool"
        d="M 230 135 C 265 135, 275 140, 310 140"
        fill="none"
        stroke="#10b981"
        strokeWidth={2}
        markerEnd="url(#green-arrow)"
      />

      {/* Pointer Arrow: s2 -> Heap Duplicate */}
      <path
        className="arrow-s2-heap"
        d="M 230 215 C 260 215, 270 310, 310 310"
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        markerEnd="url(#red-arrow)"
      />

      {/* Pointer Arrow: s3 -> Pool */}
      <path
        className="arrow-s3-pool"
        d="M 230 295 C 280 295, 280 160, 310 160"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth={2}
        strokeDasharray="4,4"
        markerEnd="url(#blue-arrow-sp)"
      />

      {/* Markers */}
      <defs>
        <marker id="green-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#10b981" />
        </marker>
        <marker id="red-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#ef4444" />
        </marker>
        <marker id="blue-arrow-sp" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#0ea5e9" />
        </marker>
      </defs>
    </SceneBoard>
  );
}
