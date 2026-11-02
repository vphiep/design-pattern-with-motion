'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function ClassLoaderScene({
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
      // Step 0: Parent-First Delegation
      tl.addLabel('step-0');
      tl.from('.classloader-tree', { opacity: 0, x: -20, duration: 0.4 });
      tl.to('.delegation-arrow-up', { opacity: 1, scaleY: 1, duration: 0.35 });
      tl.from('.bootstrap-badge', { opacity: 0, scale: 0.8, duration: 0.3 }, '-=0.1');

      // Step 1: Bytecode Verification & Linking
      tl.addLabel('step-1');
      tl.from('.verification-box', { opacity: 0, scale: 0.9, duration: 0.4 });
      tl.to('.cafebabe-hex', { fill: '#10b981', duration: 0.25 });
      tl.from('.metaspace-prep', { opacity: 0, y: 10, duration: 0.3 }, '-=0.1');

      // Step 2: Atomic <clinit> Static Initialization
      tl.addLabel('step-2');
      tl.from('.clinit-box', { opacity: 0, x: 20, duration: 0.4 });
      tl.to('.class-init-lock', { fill: '#10b981', duration: 0.3 });
      tl.from('.clinit-exec-badge', { opacity: 0, scale: 1.2, duration: 0.35 });
      tl.to('.class-status-text', { textContent: 'STATE: FULLY INITIALIZED (READY)', fill: '#10b981', duration: 0.2 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        CLASSLOADING &amp; BYTECODE · PARENT-FIRST DELEGATION &amp; ATOMIC &lt;CLINIT&gt;
      </Caption>

      {/* ClassLoader Delegation Hierarchy (Left) */}
      <g className="classloader-tree" transform="translate(40, 70)">
        <rect width={210} height={370} rx={8} fill="var(--surface)" stroke="#0284c7" strokeWidth={1.5} />
        <rect width={210} height={28} rx={8} fill="#0284c7" fillOpacity={0.15} />
        <text x={105} y={19} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          DELEGATION HIERARCHY
        </text>

        {/* Bootstrap ClassLoader (C++ Native) */}
        <g transform="translate(15, 38)">
          <rect width={180} height={60} rx={6} fill="var(--surface-elevated)" stroke="#0284c7" strokeWidth={1} />
          <text x={12} y={20} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            1. Bootstrap (C++ JVM)
          </text>
          <text x={12} y={36} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>java.base, rt.jar, Object.class</text>
          <text x={12} y={50} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>getClassLoader() == null</text>
        </g>

        {/* Up arrow */}
        <g className="delegation-arrow-up" opacity={0}>
          <line x1={105} y1={135} x2={105} y2={105} stroke="#0284c7" strokeWidth={2} strokeDasharray="3 2" />
          <polygon points="105,103 100,111 110,111" fill="#0284c7" />
        </g>

        {/* Platform ClassLoader */}
        <g transform="translate(15, 140)">
          <rect width={180} height={60} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={12} y={20} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            2. Platform ClassLoader
          </text>
          <text x={12} y={36} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>java.sql, java.net, extensions</text>
          <text x={12} y={50} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>Parent: Bootstrap</text>
        </g>

        {/* Up arrow */}
        <line x1={105} y1={235} x2={105} y2={205} stroke="var(--border-soft)" strokeWidth={1.5} strokeDasharray="3 2" />

        {/* App / System ClassLoader */}
        <g transform="translate(15, 240)">
          <rect width={180} height={65} rx={6} fill="var(--surface-elevated)" stroke="#e11d48" strokeWidth={1.5} />
          <text x={12} y={20} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
            3. App ClassLoader
          </text>
          <text x={12} y={36} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>User Application Classpath</text>
          <text x={12} y={50} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>Spring Beans, Controllers</text>
        </g>

        <text x={15} y={335} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
          Parent-First: Queries parent before looking locally
        </text>
      </g>

      {/* Linking & Verification Box (Center) */}
      <g className="verification-box" transform="translate(270, 70)">
        <rect width={250} height={370} rx={8} fill="var(--surface)" stroke="#10b981" strokeWidth={1.5} />
        <rect width={250} height={28} rx={8} fill="#10b981" fillOpacity={0.15} />
        <text x={125} y={19} textAnchor="middle" fill="#10b981" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          LINKING &amp; VERIFICATION
        </text>

        {/* 0xCAFEBABE Check */}
        <g transform="translate(15, 38)">
          <rect width={220} height={65} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={12} y={20} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Magic Number Check:
          </text>
          <text className="cafebabe-hex" x={12} y={40} fill="#0284c7" fontFamily="var(--font-mono)" fontSize={13} fontWeight="bold">
            0xCAFEBABE
          </text>
          <text x={12} y={55} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>Major 65 = Java 21 LTS</text>
        </g>

        {/* Bytecode Verifier */}
        <g transform="translate(15, 115)">
          <rect width={220} height={85} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={12} y={20} fill="#10b981" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Bytecode Type Verifier:
          </text>
          <text x={12} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>&bull; No stack overflow/underflow</text>
          <text x={12} y={54} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>&bull; Valid opcodes and branch targets</text>
          <text x={12} y={70} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>&bull; Type-safe polymorphic casts</text>
        </g>

        {/* Metaspace Preparation */}
        <g className="metaspace-prep" transform="translate(15, 212)">
          <rect width={220} height={85} rx={6} fill="var(--surface-elevated)" stroke="#8b5cf6" strokeWidth={1} />
          <text x={12} y={20} fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Preparation in Metaspace:
          </text>
          <text x={12} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            Allocates InstanceKlass struct:
          </text>
          <text x={12} y={54} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            static int counter = 0 (default zero)
          </text>
          <text x={12} y={70} fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={8}>
            Off-heap native memory
          </text>
        </g>

        <text x={15} y={335} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
          Resolution: Converts symbolic CP entries to direct memory offsets
        </text>
      </g>

      {/* Atomic <clinit> Static Initialization (Right) */}
      <g className="clinit-box" transform="translate(540, 70)">
        <rect width={220} height={370} rx={8} fill="var(--surface)" stroke="#e11d48" strokeWidth={1.5} />
        <rect width={220} height={28} rx={8} fill="#e11d48" fillOpacity={0.15} />
        <text x={110} y={19} textAnchor="middle" fill="#e11d48" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          INITIALIZATION (&lt;clinit&gt;)
        </text>

        {/* Class Initialization Lock */}
        <g transform="translate(15, 38)">
          <rect width={190} height={70} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            Class Init Lock:
          </text>
          <rect className="class-init-lock" x={10} y={28} width={170} height={26} rx={4} fill="#e11d48" />
          <text x={95} y={45} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            Thread-Safe Mutex Lock
          </text>
        </g>

        {/* Clinit Execution */}
        <g transform="translate(15, 120)">
          <rect width={190} height={100} rx={6} fill="var(--surface-elevated)" stroke="var(--border-soft)" />
          <text x={10} y={20} fill="#e11d48" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            &lt;clinit&gt; Method Body:
          </text>
          <text x={10} y={38} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            static &#123;
          </text>
          <text x={20} y={54} fill="var(--text)" fontFamily="var(--font-mono)" fontSize={8}>
            DB_URL = &quot;jdbc:...&quot;;
          </text>
          <text x={10} y={70} fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize={8}>
            &#125;
          </text>
          <text x={10} y={88} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            Executes exactly ONCE!
          </text>
        </g>

        {/* Status Badge */}
        <g className="clinit-exec-badge" transform="translate(15, 235)">
          <rect width={190} height={40} rx={6} fill="var(--surface-elevated)" stroke="#10b981" strokeWidth={1} />
          <text className="class-status-text" x={95} y={24} textAnchor="middle" fill="#0284c7" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            INITIALIZING...
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
