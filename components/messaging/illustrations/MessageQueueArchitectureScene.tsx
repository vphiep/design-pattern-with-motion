'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';

export function MessageQueueArchitectureScene({
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
      // Step 0: Producer creates event
      tl.addLabel('step-0');
      tl.from('.producer-box', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.event-payload', { opacity: 0, scale: 0.8, duration: 0.35 });

      // Step 1: Enqueued into Broker buffer
      tl.addLabel('step-1');
      tl.to('.event-payload', { x: 200, duration: 0.5, ease: 'power2.out' });
      tl.from('.broker-box', { opacity: 0, scale: 0.95, duration: 0.4 }, '-=0.2');
      tl.to('.queue-slot-1', { fill: 'rgba(6, 182, 212, 0.25)', stroke: '#06b6d4', duration: 0.3 });

      // Step 2: Broker returns ACK to Producer
      tl.addLabel('step-2');
      tl.from('.ack-token', { opacity: 0, x: 20, duration: 0.35 });
      tl.to('.producer-badge', { stroke: '#10b981', duration: 0.3 });

      // Step 3: Dequeue to Independent Consumers
      tl.addLabel('step-3');
      tl.from('.consumers-group', { opacity: 0, x: 20, duration: 0.4 });
      tl.to('.event-payload', { x: 440, y: -45, duration: 0.5 });
      tl.from('.event-payload-copy', { opacity: 0, x: 200, duration: 0.2 }, '<');
      tl.to('.event-payload-copy', { x: 440, y: 55, opacity: 1, duration: 0.5 }, '<');
      tl.to('.worker-active-glow', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 820 480">
      <Caption x={35} y={32}>
        MESSAGE QUEUE ARCHITECTURE · ASYNCHRONOUS DECOUPLING PIPELINE
      </Caption>

      {/* 1. PRODUCER SECTION (X: 35, Y: 65, Width: 200, Height: 275) */}
      <g className="producer-box" data-step="0">
        <rect
          x={35}
          y={65}
          width={200}
          height={275}
          rx={10}
          fill="#080c16"
          stroke="#8b5cf6"
          strokeWidth={1.8}
          className="producer-badge"
        />
        <text x={50} y={92} fill="#a78bfa" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          PRODUCER (API GATEWAY)
        </text>
        <text x={50} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
          OrderService (Spring Boot 3)
        </text>

        {/* API response badge */}
        <g transform="translate(50, 122)">
          <rect x={0} y={0} width={170} height={42} rx={5} fill="#030712" stroke="rgba(255,255,255,0.08)" />
          <text x={10} y={16} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            POST /api/orders
          </text>
          <text x={10} y={32} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8}>
            HTTP 202 Accepted (&lt; 4ms)
          </text>
        </g>

        {/* ACK token moving back */}
        <g className="ack-token" style={{ opacity: 0 }} transform="translate(50, 175)">
          <rect x={0} y={0} width={170} height={36} rx={5} fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" />
          <text x={10} y={22} fill="#34d399" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            ✓ BROKER ACK RECEIVED
          </text>
        </g>

        <g transform="translate(50, 240)">
          <text x={0} y={12} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
            Temporal Decoupling:
          </text>
          <text x={0} y={26} fill="#64748b" fontFamily="var(--font-mono)" fontSize={7}>
            Không bị block bởi tốc độ worker
          </text>
        </g>
      </g>

      {/* FLYING PAYLOAD EVENT */}
      <g className="event-payload">
        <rect x={160} y={128} width={90} height={28} rx={4} fill="#8b5cf6" stroke="#ffffff" strokeWidth={1.5} filter="drop-shadow(0 2px 4px rgba(139,92,246,0.4))" />
        <text x={205} y={146} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
          Order #1024
        </text>
      </g>

      {/* COPY PAYLOAD FOR WORKER 2 */}
      <g className="event-payload-copy" style={{ opacity: 0 }}>
        <rect x={160} y={128} width={90} height={28} rx={4} fill="#06b6d4" stroke="#ffffff" strokeWidth={1.5} />
        <text x={205} y={146} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
          Order #1024
        </text>
      </g>

      {/* 2. MESSAGE BROKER BUFFER (X: 260, Y: 65, Width: 255, Height: 275) */}
      <g className="broker-box" data-step="1">
        <rect
          x={260}
          y={65}
          width={255}
          height={275}
          rx={10}
          fill="#090d18"
          stroke="#06b6d4"
          strokeWidth={1.8}
        />
        <text x={275} y={92} fill="#06b6d4" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          MESSAGE BROKER (BUFFER)
        </text>
        <text x={275} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
          Persistent Queue Storage
        </text>

        {/* Queue Slots */}
        <g transform="translate(275, 122)">
          <rect x={0} y={0} width={225} height={28} rx={4} fill="#030712" stroke="rgba(255,255,255,0.08)" className="queue-slot-1" />
          <text x={12} y={18} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
            Slot 0: [In-Flight] OrderCreated
          </text>

          <rect x={0} y={34} width={225} height={28} rx={4} fill="#030712" stroke="rgba(255,255,255,0.08)" />
          <text x={12} y={52} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
            Slot 1: [Queued] OrderCreated #1023
          </text>

          <rect x={0} y={68} width={225} height={28} rx={4} fill="#030712" stroke="rgba(255,255,255,0.08)" />
          <text x={12} y={86} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
            Slot 2: [Queued] OrderCreated #1022
          </text>

          <rect x={0} y={102} width={225} height={28} rx={4} fill="#030712" stroke="rgba(255,255,255,0.08)" />
          <text x={12} y={120} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
            Slot 3: [Available]
          </text>
        </g>

        <g transform="translate(275, 275)">
          <text x={0} y={12} fill="#34d399" fontFamily="var(--font-mono)" fontSize={8}>
            Queue Depth: 3 msgs · RAM Buffer Safe
          </text>
        </g>
      </g>

      {/* 3. INDEPENDENT CONSUMERS (X: 540, Y: 65, Width: 245, Height: 275) */}
      <g className="consumers-group" data-step="3">
        <rect
          x={540}
          y={65}
          width={245}
          height={275}
          rx={10}
          fill="#080c16"
          stroke="rgba(16, 185, 129, 0.4)"
          strokeWidth={1.8}
        />
        <text x={555} y={92} fill="#10b981" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
          CONSUMER POOL (WORKERS)
        </text>
        <text x={555} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
          Independent Scaling &amp; Competing
        </text>

        {/* Worker 1: Payment */}
        <g transform="translate(555, 122)">
          <rect
            x={0}
            y={0}
            width={215}
            height={70}
            rx={6}
            fill="#030712"
            stroke="#10b981"
            strokeWidth={1.2}
          />
          <text x={12} y={20} fill="#34d399" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            PAYMENT CONSUMER POD
          </text>
          <text x={12} y={36} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
            Throughput: 1,200 msg/s
          </text>
          <circle cx={195} cy={16} r={4} fill="#10b981" className="worker-active-glow" style={{ opacity: 0 }} />
          <rect x={12} y={44} width={190} height={18} rx={3} fill="#0d1f18" />
          <text x={20} y={56} fill="#34d399" fontFamily="var(--font-mono)" fontSize={7}>
            Processing: Stripe API Tokenized
          </text>
        </g>

        {/* Worker 2: Shipping */}
        <g transform="translate(555, 202)">
          <rect
            x={0}
            y={0}
            width={215}
            height={70}
            rx={6}
            fill="#030712"
            stroke="#f59e0b"
            strokeWidth={1.2}
          />
          <text x={12} y={20} fill="#fbbf24" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
            SHIPPING WORKER POD
          </text>
          <text x={12} y={36} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
            Throughput: 150 msg/s (Slow)
          </text>
          <circle cx={195} cy={16} r={4} fill="#f59e0b" className="worker-active-glow" style={{ opacity: 0 }} />
          <rect x={12} y={44} width={190} height={18} rx={3} fill="#1e1808" />
          <text x={20} y={56} fill="#fbbf24" fontFamily="var(--font-mono)" fontSize={7}>
            Processing: Warehouse Waybill Print
          </text>
        </g>

        <g transform="translate(555, 290)">
          <text x={0} y={12} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
            Worker chậm không làm nghẽn worker nhanh
          </text>
        </g>
      </g>

      {/* 4. BOTTOM ARCHITECTURAL METRICS (X: 35, Y: 355, Width: 750, Height: 95) */}
      <g transform="translate(35, 355)">
        <rect x={0} y={0} width={750} height={95} rx={8} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
        <g transform="translate(16, 20)">
          <text x={0} y={10} fill="#8b5cf6" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            TEMPORAL &amp; SPATIAL DECOUPLING:
          </text>
          <text x={240} y={10} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={11}>
            API Client Latency: <tspan fill="#34d399">4ms</tspan> · Total Worker Processing: <tspan fill="#38bdf8">850ms</tspan>
          </text>
        </g>
        <g transform="translate(16, 52)">
          <text x={0} y={12} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={9}>
            Không bị ràng buộc đồng bộ: Khách hàng nhận HTTP 202 ngày lập tức sau khi Broker xác nhận đã lưu bản tin vào đĩa, toàn bộ nghiệp vụ thanh toán và xuất kho được xử lý bất đồng bộ phía sau.
          </text>
          <text x={0} y={28} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
            Nếu Shipping Worker bị sập tạm thời, bản tin vẫn được giữ an toàn trong hàng đợi mà không làm mất đơn hàng của khách.
          </text>
        </g>
      </g>
    </SceneBoard>
  );
}
