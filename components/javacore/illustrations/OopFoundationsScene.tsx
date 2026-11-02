'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function OopFoundationsScene({
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
      // Step 0: Abstract Class State vs Interface Contract (encapsulation-abstraction)
      tl.addLabel('step-0');
      tl.from('.abstract-class-box', { opacity: 0, x: -20, duration: 0.35 });
      tl.from('.interface-contract-box', { opacity: 0, x: 20, duration: 0.35 });
      tl.from('.subclass-box', { opacity: 0, y: 25, duration: 0.4 });
      tl.to('.abstract-class-rect', { stroke: '#0284c7', strokeWidth: 2, duration: 0.3 });

      // Step 1: Diamond Problem Conflict & Explicit Resolution (diamond-problem-precedence)
      tl.addLabel('step-1');
      tl.from('.diamond-conflict-overlay', { opacity: 0, scale: 0.85, duration: 0.35 });
      tl.to('.diamond-resolve-box', { opacity: 1, scale: 1, duration: 0.4 });
      tl.to('.diamond-conflict-overlay', { opacity: 0.2, duration: 0.25 }, '-=0.1');

      // Step 2: Composition Over Inheritance (SOLID DI) (composition-over-inheritance)
      tl.addLabel('step-2');
      tl.from('.composition-collaborators', { opacity: 0, y: 15, duration: 0.4 });
      tl.from('.di-arrow', { strokeDashoffset: 400, opacity: 0, duration: 0.45 });
      tl.from('.solid-badge', { opacity: 0, scale: 0.8, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        OOP ARCHITECTURE · ABSTRACT CLASS STATE VS INTERFACE DIAMOND PROBLEM
      </Caption>

      {/* Abstract Class (Left) */}
      <g className="abstract-class-box" transform="translate(40, 60)">
        <rect
          className="abstract-class-rect"
          width={220}
          height={165}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#0284c7"
          strokeWidth={1.5}
        />
        <rect width={220} height={26} rx={8} fill="#0369a1" />
        <text x={10} y={17} fill="#e0f2fe" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          ABSTRACT CLASS: BaseOrder
        </text>

        <g transform="translate(10, 35)">
          <rect width={200} height={42} rx={4} fill="#0c4a6e" stroke="#0284c7" strokeWidth={0.8} />
          <text x={8} y={16} fill="#bae6fd" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            HOLDS INSTANCE STATE (Heap):
          </text>
          <text x={8} y={30} fill="#7dd3fc" fontSize={8} fontFamily="monospace" stroke="none">
            - private long orderId (8B)
          </text>
        </g>

        <g transform="translate(10, 85)">
          <rect width={200} height={42} rx={4} fill="#1f2937" stroke="#374151" strokeWidth={0.8} />
          <text x={8} y={16} fill="#9ca3af" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            TEMPLATE ALGORITHM:
          </text>
          <text x={8} y={30} fill="#6b7280" fontSize={8} fontFamily="monospace" stroke="none">
            public abstract void validate();
          </text>
        </g>
      </g>

      {/* Interfaces with Default Methods (Right) */}
      <g className="interface-contract-box" transform="translate(500, 60)">
        <rect
          width={260}
          height={165}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect width={260} height={26} rx={8} fill="#065f46" />
        <text x={10} y={17} fill="#d1fae5" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          INTERFACES (STATELESS CONTRACTS)
        </text>

        <g transform="translate(10, 35)">
          <rect width={240} height={55} rx={4} fill="#022c22" stroke="#10b981" strokeWidth={0.8} />
          <text x={8} y={16} fill="#34d399" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            interface Payable &#123;
          </text>
          <text x={8} y={32} fill="#a7f3d0" fontSize={8} fontFamily="monospace" stroke="none">
            &nbsp;&nbsp;default void printAuditLog() &#123;...&#125;
          </text>
          <text x={8} y={46} fill="#6ee7b7" fontSize={7.5} fontFamily="monospace" stroke="none">
            &#125; (No instance variables allowed!)
          </text>
        </g>

        <g transform="translate(10, 98)">
          <rect width={240} height={55} rx={4} fill="#022c22" stroke="#10b981" strokeWidth={0.8} />
          <text x={8} y={16} fill="#34d399" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            interface Exportable &#123;
          </text>
          <text x={8} y={32} fill="#a7f3d0" fontSize={8} fontFamily="monospace" stroke="none">
            &nbsp;&nbsp;default void printAuditLog() &#123;...&#125;
          </text>
          <text x={8} y={46} fill="#6ee7b7" fontSize={7.5} fontFamily="monospace" stroke="none">
            &#125; (Conflicting Default Method!)
          </text>
        </g>
      </g>

      {/* Subclass Implementing Both (Center Bottom) */}
      <g className="subclass-box" transform="translate(40, 245)">
        <rect
          width={450}
          height={195}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#d97706"
          strokeWidth={1.5}
        />
        <rect width={450} height={26} rx={8} fill="#78350f" />
        <text x={12} y={17} fill="#fef3c7" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          SUBCLASS: EnterpriseOrder extends BaseOrder implements Payable, Exportable
        </text>

        {/* Diamond Conflict Box */}
        <g className="diamond-conflict-overlay" transform="translate(12, 35)">
          <rect width={426} height={60} rx={5} fill="#450a0a" stroke="#ef4444" strokeWidth={1} />
          <text x={10} y={20} fill="#fecaca" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            ⚠ DIAMOND PROBLEM COMPILER AMBIGUITY:
          </text>
          <text x={10} y={36} fill="#fca5a5" fontSize={8.5} fontFamily="monospace" stroke="none">
            Both Payable &amp; Exportable define printAuditLog()!
          </text>
          <text x={10} y={50} fill="#f87171" fontSize={8} fontFamily="monospace" stroke="none">
            Compiler error: inherits unrelated defaults for printAuditLog()
          </text>
        </g>

        {/* Explicit Resolution Box */}
        <g className="diamond-resolve-box" transform="translate(12, 105)" opacity={0}>
          <rect width={426} height={75} rx={5} fill="#064e3b" stroke="#10b981" strokeWidth={1.2} />
          <text x={10} y={18} fill="#a7f3d0" fontSize={9.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            ✓ EXPLICIT DIAMOND RESOLUTION (Rule 3):
          </text>
          <text x={10} y={36} fill="#34d399" fontSize={8.5} fontFamily="monospace" stroke="none">
            @Override public void printAuditLog() &#123;
          </text>
          <text x={10} y={52} fill="#6ee7b7" fontSize={8.5} fontFamily="monospace" stroke="none">
            &nbsp;&nbsp;Payable.super.printAuditLog(); // Explicitly disambiguated!
          </text>
          <text x={10} y={66} fill="#6ee7b7" fontSize={8.5} fontFamily="monospace" stroke="none">
            &#125;
          </text>
        </g>
      </g>

      {/* Composition Over Inheritance (Right Bottom) */}
      <g className="composition-collaborators" transform="translate(505, 245)">
        <rect
          width={255}
          height={195}
          rx={8}
          fill="var(--canvas-bg-card, #111827)"
          stroke="#6366f1"
          strokeWidth={1.5}
        />
        <rect width={255} height={26} rx={8} fill="#312e81" />
        <text x={10} y={17} fill="#c7d2fe" fontSize={10} fontWeight="bold" fontFamily="monospace" stroke="none">
          COMPOSITION OVER INHERITANCE
        </text>

        <g transform="translate(10, 35)">
          <rect width={235} height={50} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={0.8} />
          <text x={8} y={18} fill="#c7d2fe" fontSize={8.5} fontWeight="bold" fontFamily="monospace" stroke="none">
            private final PaymentGateway gateway;
          </text>
          <text x={8} y={34} fill="#a5b4fc" fontSize={8} fontFamily="monospace" stroke="none">
            Injected interface collaborator
          </text>
        </g>

        <g className="solid-badge" transform="translate(10, 95)">
          <rect width={235} height={85} rx={5} fill="#0f172a" stroke="#f59e0b" strokeWidth={1} />
          <text x={10} y={20} fill="#f59e0b" fontSize={9} fontWeight="bold" fontFamily="monospace" stroke="none">
            SOLID PRINCIPLES BENEFIT:
          </text>
          <text x={10} y={38} fill="#94a3b8" fontSize={8} fontFamily="monospace" stroke="none">
            &bull; Single Responsibility (No god classes)
          </text>
          <text x={10} y={54} fill="#94a3b8" fontSize={8} fontFamily="monospace" stroke="none">
            &bull; Open/Closed (Swap gateways)
          </text>
          <text x={10} y={70} fill="#94a3b8" fontSize={8} fontFamily="monospace" stroke="none">
            &bull; Dependency Inversion (Mock for tests)
          </text>
        </g>
      </g>

      {/* DI Arrow */}
      <path className="di-arrow" d="M 490 320 L 505 320" fill="none" stroke="#6366f1" strokeWidth={2} />
    </SceneBoard>
  );
}
