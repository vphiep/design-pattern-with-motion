'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function JdkJreJvmScene({
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
      // Step 0: Source to Bytecode Compilation (javac)
      tl.addLabel('step-0');
      tl.from('.jdk-box', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.source-file', { scale: 0.8, opacity: 0, duration: 0.35 });
      tl.from('.javac-compiler', { opacity: 0, y: 10, duration: 0.3 });
      tl.from('.class-bytecode-file', { scale: 0.8, opacity: 0, duration: 0.4 });
      tl.from('.arrow-compile', { strokeDashoffset: 400, opacity: 0, duration: 0.45 });

      // Step 1: ClassLoader & Bytecode Verifier (0xCAFEBABE)
      tl.addLabel('step-1');
      tl.from('.jre-box', { opacity: 0, scale: 0.95, duration: 0.4 });
      tl.from('.classloader-subsystem', { opacity: 0, y: 15, duration: 0.35 });
      tl.from('.verifier-badge', { opacity: 0, scale: 0.8, duration: 0.3 });
      tl.to('.magic-number-box', { stroke: '#10b981', strokeWidth: 2, duration: 0.3 });
      tl.from('.arrow-load', { strokeDashoffset: 400, opacity: 0, duration: 0.45 });

      // Step 2: Tiered JIT Compilation (Interpreter -> C1 -> C2 Peak Native Assembly)
      tl.addLabel('step-2');
      tl.from('.jvm-execution-engine', { opacity: 0, x: 20, duration: 0.45 });
      tl.from('.interpreter-box', { opacity: 0, y: 10, duration: 0.3 });
      tl.from('.c1-jit-box', { opacity: 0, y: 10, duration: 0.3 }, '-=0.15');
      tl.from('.c2-jit-box', { opacity: 0, y: 10, duration: 0.35 }, '-=0.15');
      tl.to('.c2-glow-rect', { stroke: '#e11d48', strokeWidth: 2.5, duration: 0.35 });
      tl.from('.native-code-badge', { opacity: 0, scale: 0.8, duration: 0.3 });
      tl.from('.arrow-jit', { strokeDashoffset: 400, opacity: 0, duration: 0.45 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        JAVA PLATFORM ARCHITECTURE · JDK DEV TOOLS &gt; JRE &gt; HOTSPOT TIERED JIT
      </Caption>

      {/* JDK Box (Left) */}
      <g className="jdk-box" transform="translate(35, 60)">
        <rect
          width={220}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#0284c7"
          strokeWidth={1.5}
        />
        <rect width={220} height={28} rx={8} fill="#0369a1" />
        <text x={12} y={18} fill="#e0f2fe" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          JDK (DEVELOPER KIT)
        </text>

        {/* Source Code */}
        <g className="source-file" transform="translate(12, 42)">
          <rect width={196} height={70} rx={6} fill="#0c4a6e" stroke="#0284c7" strokeWidth={1} />
          <text x={10} y={18} fill="#bae6fd" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            OrderService.java
          </text>
          <text x={10} y={36} fill="#7dd3fc" fontSize={8.5} fontFamily="monospace" stroke="none">
            public class OrderService &#123;
          </text>
          <text x={10} y={50} fill="#7dd3fc" fontSize={8.5} fontFamily="monospace" stroke="none">
            &nbsp;&nbsp;public void pay() &#123;...&#125;
          </text>
        </g>

        {/* javac compiler */}
        <g className="javac-compiler" transform="translate(12, 126)">
          <rect width={196} height={50} rx={6} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1} />
          <text x={10} y={20} fill="#c7d2fe" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            javac Compiler Tool
          </text>
          <text x={10} y={36} fill="#a5b4fc" fontSize={8.5} fontFamily="monospace" stroke="none">
            AST Syntax &middot; Static Checks
          </text>
        </g>

        {/* .class bytecode */}
        <g className="class-bytecode-file" transform="translate(12, 190)">
          <rect className="magic-number-box" width={196} height={80} rx={6} fill="#064e3b" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={20} fill="#a7f3d0" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            OrderService.class
          </text>
          <text x={10} y={38} fill="#34d399" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            Magic: 0xCAFEBABE
          </text>
          <text x={10} y={54} fill="#6ee7b7" fontSize={8.5} fontFamily="monospace" stroke="none">
            Major Version: 65 (Java 21)
          </text>
          <text x={10} y={68} fill="#6ee7b7" fontSize={8} fontFamily="monospace" stroke="none">
            Platform-Independent Virtual Code
          </text>
        </g>

        {/* Developer Utilities */}
        <g transform="translate(12, 284)">
          <rect width={196} height={80} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1} />
          <text x={10} y={20} fill="#94a3b8" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            JDK DIAGNOSTIC CLI:
          </text>
          <text x={10} y={38} fill="#cbd5e1" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; jstack (Thread Dump)
          </text>
          <text x={10} y={54} fill="#cbd5e1" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; jcmd / jmap (Heap Dump)
          </text>
          <text x={10} y={70} fill="#cbd5e1" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; jdeps / jlink (Modular Slim)
          </text>
        </g>
      </g>

      {/* JRE Box (Middle) */}
      <g className="jre-box" transform="translate(280, 60)">
        <rect
          width={220}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect width={220} height={28} rx={8} fill="#065f46" />
        <text x={12} y={18} fill="#d1fae5" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          JRE (RUNTIME ENVIRONMENT)
        </text>

        {/* ClassLoader & Verifier */}
        <g className="classloader-subsystem" transform="translate(12, 42)">
          <rect width={196} height={120} rx={6} fill="#022c22" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={20} fill="#34d399" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            ClassLoader Subsystem
          </text>
          <text x={10} y={38} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            1. Loading (Bootstrap &gt; App)
          </text>
          <text x={10} y={54} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            2. Linking (Verify &gt; Prep &gt; Resolve)
          </text>
          <text x={10} y={70} fill="#a7f3d0" fontSize={8.5} fontFamily="monospace" stroke="none">
            3. Initialization (&lt;clinit&gt;)
          </text>

          <g className="verifier-badge" transform="translate(10, 82)">
            <rect width={176} height={26} rx={4} fill="#047857" />
            <text x={12} y={17} fill="#ecfdf5" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
              ✓ Bytecode Verifier: Safe!
            </text>
          </g>
        </g>

        {/* Core Java Libraries */}
        <g transform="translate(12, 175)">
          <rect width={196} height={190} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1} />
          <text x={10} y={20} fill="#f59e0b" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            CORE MODULE LIBRARIES:
          </text>
          <text x={10} y={40} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; java.base (Object, String)
          </text>
          <text x={10} y={58} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; java.util.concurrent (AQS)
          </text>
          <text x={10} y={76} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; java.sql / java.net
          </text>
          <text x={10} y={94} fill="#94a3b8" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; java.lang.invoke (MethodHandle)
          </text>
          <rect x={10} y={115} width={176} height={60} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={0.8} />
          <text x={18} y={135} fill="#c7d2fe" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Modular Jigsaw System:
          </text>
          <text x={18} y={152} fill="#a5b4fc" fontSize={7.5} fontFamily="monospace" stroke="none">
            jlink builds micro-runtimes
          </text>
          <text x={18} y={165} fill="#a5b4fc" fontSize={7.5} fontFamily="monospace" stroke="none">
            (~35MB Docker Containers)
          </text>
        </g>
      </g>

      {/* HotSpot JVM Box (Right) */}
      <g className="jvm-execution-engine" transform="translate(525, 60)">
        <rect
          width={240}
          height={380}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#e11d48"
          strokeWidth={1.5}
        />
        <rect width={240} height={28} rx={8} fill="#9f1239" />
        <text x={12} y={18} fill="#ffe4e6" fontSize={11} fontWeight="bold" fontFamily="monospace" stroke="none">
          HOTSPOT JVM (EXECUTION ENGINE)
        </text>

        {/* Tier 0: Interpreter */}
        <g className="interpreter-box" transform="translate(12, 42)">
          <rect width={216} height={65} rx={6} fill="#1f2937" stroke="#4b5563" strokeWidth={1} />
          <text x={10} y={20} fill="#f3f4f6" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Tier 0: Bytecode Interpreter
          </text>
          <text x={10} y={38} fill="#9ca3af" fontSize={8.5} fontFamily="monospace" stroke="none">
            Instant Startup &middot; Zero Warmup Lag
          </text>
          <text x={10} y={52} fill="#6b7280" fontSize={7.5} fontFamily="monospace" stroke="none">
            Executes raw bytecode virtual dispatch
          </text>
        </g>

        {/* Tier 1-3: C1 Client JIT */}
        <g className="c1-jit-box" transform="translate(12, 116)">
          <rect width={216} height={65} rx={6} fill="#0c4a6e" stroke="#0ea5e9" strokeWidth={1} />
          <text x={10} y={20} fill="#bae6fd" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Tier 1-3: C1 Client JIT Compiler
          </text>
          <text x={10} y={38} fill="#7dd3fc" fontSize={8.5} fontFamily="monospace" stroke="none">
            Fast compilation + Profiling hooks
          </text>
          <text x={10} y={52} fill="#38bdf8" fontSize={7.5} fontFamily="monospace" stroke="none">
            Counts method invocations &amp; loop trips
          </text>
        </g>

        {/* Tier 4: C2 Server JIT */}
        <g className="c2-jit-box" transform="translate(12, 190)">
          <rect className="c2-glow-rect" width={216} height={95} rx={6} fill="#4c0519" stroke="#e11d48" strokeWidth={1.5} />
          <text x={10} y={22} fill="#fecdd3" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
            ★ Tier 4: C2 Server JIT (Peak Assembly)
          </text>
          <text x={10} y={40} fill="#fda4af" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; Monomorphic Inlining (0ns dispatch)
          </text>
          <text x={10} y={56} fill="#fda4af" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; Loop Unrolling &amp; Vectorization
          </text>
          <text x={10} y={72} fill="#fda4af" fontSize={8.5} fontFamily="monospace" stroke="none">
            &bull; Escape Analysis &amp; Scalar Replacement
          </text>
          <text x={10} y={87} fill="#fb7185" fontSize={8} fontWeight="bold" fontFamily="monospace" stroke="none">
            Stored in Native CodeCache (240MB)
          </text>
        </g>

        {/* Garbage Collector */}
        <g transform="translate(12, 295)">
          <rect width={216} height={65} rx={6} fill="#022c22" stroke="#10b981" strokeWidth={1} />
          <text x={10} y={20} fill="#a7f3d0" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            Garbage Collector Engine
          </text>
          <text x={10} y={38} fill="#6ee7b7" fontSize={8.5} fontFamily="monospace" stroke="none">
            Generational ZGC &middot; G1GC
          </text>
          <text x={10} y={52} fill="#34d399" fontSize={7.5} fontFamily="monospace" stroke="none">
            Sub-millisecond concurrent memory cleanup
          </text>
        </g>
      </g>

      {/* Connecting Flow Arrows */}
      <path className="arrow-compile" d="M 255 220 L 280 220" fill="none" stroke="#0ea5e9" strokeWidth={2} />
      <path className="arrow-load" d="M 500 220 L 525 220" fill="none" stroke="#10b981" strokeWidth={2} />
      <path className="arrow-jit" d="M 645 107 L 645 116" fill="none" stroke="#e11d48" strokeWidth={2} />
    </SceneBoard>
  );
}
