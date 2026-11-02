'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { cn } from '@/lib/utils/cn';

export function RabbitMqDlxRetryScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Consumer failure detected
      tl.addLabel('step-0');
      tl.from('.main-queue-node', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.failing-packet', { opacity: 0, scale: 0.5, duration: 0.35 });
      tl.to('.error-flash', { opacity: 1, duration: 0.3 });

      // Step 1: Diverted to 5s TTL Retry Queue
      tl.addLabel('step-1');
      tl.to('.failing-packet', { x: 250, y: 50, duration: 0.5, ease: 'power2.inOut' });
      tl.from('.retry-queue-node', { opacity: 0, scale: 0.95, duration: 0.35 }, '-=0.2');
      tl.from('.ttl-countdown', { opacity: 0, duration: 0.3 });

      // Step 2: TTL expires -> Re-injected back into Main Queue
      tl.addLabel('step-2');
      tl.to('.failing-packet', { x: 0, y: 0, duration: 0.6, ease: 'power2.inOut' });
      tl.to('.retry-badge', { stroke: '#f59e0b', duration: 0.3 });

      // Step 3: Max Retries Exceeded -> Quarantine to DLQ
      tl.addLabel('step-3');
      tl.from('.dlq-node', { opacity: 0, y: 20, duration: 0.4 });
      tl.to('.failing-packet', { x: 520, y: 0, duration: 0.6, ease: 'power2.out' });
      tl.to('.dlq-quarantine-badge', { fill: 'rgba(239, 68, 68, 0.2)', stroke: '#ef4444', duration: 0.3 });
    }
  });

  return (
    <div className="relative">
      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={32}>
          DEAD LETTER EXCHANGE · EXPONENTIAL RETRY &amp; QUARANTINE PIPELINE
        </Caption>

        {/* 1. MAIN WORK QUEUE (X: 35, Y: 65, Width: 225, Height: 275) */}
        <g className="main-queue-node" data-step="0">
          <rect x={35} y={65} width={225} height={275} rx={10} fill="#080c16" stroke="#8b5cf6" strokeWidth={1.8} />
          <text x={50} y={92} fill="#a78bfa" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            MAIN WORK QUEUE
          </text>
          <text x={50} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
            orders.main.queue (Normal processing)
          </text>

          {/* Slot */}
          <g transform="translate(50, 122)">
            <rect x={0} y={0} width={195} height={50} rx={5} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <text x={10} y={18} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Order #5091: Payment Request
            </text>
            <text x={10} y={34} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
              State: In-Flight Delivery
            </text>
          </g>

          {/* Consumer Error Flash */}
          <g transform="translate(50, 182)">
            <rect x={0} y={0} width={195} height={60} rx={5} fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" className="error-flash" style={{ opacity: 0 }} />
            <text x={10} y={20} fill="#f87171" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              ! basic.nack(requeue=false)
            </text>
            <text x={10} y={36} fill="#fca5a5" fontFamily="var(--font-mono)" fontSize={8}>
              Third-party gateway timeout
            </text>
            <text x={10} y={50} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={7}>
              Rerouted to DLX orders.retry.dlx
            </text>
          </g>
        </g>

        {/* FAILING PACKET */}
        <g className="failing-packet">
          <circle cx={147} cy={147} r={12} fill="#ef4444" stroke="#ffffff" strokeWidth={2} filter="drop-shadow(0 2px 5px rgba(239,68,68,0.5))" />
          <text x={147} y={151} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            ERR
          </text>
        </g>

        {/* 2. RETRY HOLDING QUEUE (X: 295, Y: 110, Width: 230, Height: 185) */}
        <g className="retry-queue-node" data-step="1">
          <rect
            x={295}
            y={110}
            width={230}
            height={185}
            rx={10}
            fill="#090d18"
            stroke="#f59e0b"
            strokeWidth={1.8}
            className="retry-badge"
          />
          <text x={310} y={135} fill="#fbbf24" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            RETRY DELAY QUEUE (TTL)
          </text>
          <text x={310} y={150} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
            orders.retry.5s (Zero active consumers)
          </text>

          <g className="ttl-countdown" transform="translate(310, 165)">
            <rect x={0} y={0} width={200} height={50} rx={5} fill="#030712" stroke="rgba(245, 158, 11, 0.3)" />
            <text x={10} y={18} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              TTL: 5,000ms Holding Window
            </text>
            <text x={10} y={34} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={8}>
              Header: x-death count = 1
            </text>
          </g>

          <g transform="translate(310, 230)">
            <text x={0} y={12} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
              Hết hạn TTL $\rightarrow$ Dead-Letter tới Exchange gốc
            </text>
            <text x={0} y={24} fill="#64748b" fontFamily="var(--font-mono)" fontSize={7}>
              Tự động tái đẩy vào orders.main.queue
            </text>
          </g>
        </g>

        {/* 3. DEAD LETTER QUARANTINE (X: 560, Y: 65, Width: 225, Height: 275) */}
        <g className="dlq-node" data-step="3">
          <rect
            x={560}
            y={65}
            width={225}
            height={275}
            rx={10}
            fill="#0c0810"
            stroke="#ef4444"
            strokeWidth={1.8}
            className="dlq-quarantine-badge"
          />
          <text x={575} y={92} fill="#f87171" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            DEAD LETTER QUEUE (DLQ)
          </text>
          <text x={575} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
            orders.dlq (Max 3 retries breached)
          </text>

          {/* Quarantined items */}
          <g transform="translate(575, 122)">
            <rect x={0} y={0} width={195} height={60} rx={5} fill="#180e12" stroke="rgba(239, 68, 68, 0.3)" />
            <text x={10} y={18} fill="#f87171" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              Quarantined Poison Message
            </text>
            <text x={10} y={32} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={8}>
              Order #5091 (Permanent defect)
            </text>
            <text x={10} y={48} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={7}>
              Alert trigger $\rightarrow$ PagerDuty / Slack
            </text>
          </g>

          <g transform="translate(575, 195)">
            <rect x={0} y={0} width={195} height={65} rx={5} fill="#030712" />
            <text x={8} y={16} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
              Manual Inspection Tools:
            </text>
            <text x={8} y={30} fill="#64748b" fontFamily="var(--font-mono)" fontSize={7}>
              • RabbitMQ Management UI replay
            </text>
            <text x={8} y={44} fill="#64748b" fontFamily="var(--font-mono)" fontSize={7}>
              • Shovel Plugin to reprocessing
            </text>
          </g>
        </g>

        {/* 4. BOTTOM ARCHITECTURAL LAW (X: 35, Y: 355, Width: 750, Height: 95) */}
        <g transform="translate(35, 355)">
          <rect x={0} y={0} width={750} height={95} rx={8} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <g transform="translate(16, 20)">
            <text x={0} y={10} fill="#f59e0b" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
              EXPONENTIAL BACKOFF FORMULA:
            </text>
            <text x={210} y={10} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={11}>
              T_n = min(T_max, T_0 × 2^n) · T_0 = 1s, T_1 = 2s, T_2 = 4s, T_3 = 8s
            </text>
          </g>
          <g transform="translate(16, 52)">
            <text x={0} y={12} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={9}>
              Poison Message Containment: Nếu không có DLQ, bản tin hỏng sẽ bị nack(requeue=true) liên tục hàng triệu lần mỗi giây (Retry Storm), làm sập toàn bộ cụm RabbitMQ và CPU worker.
            </text>
            <text x={0} y={28} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
              Thiết lập x-dead-letter-exchange kết hợp x-message-ttl tạo thành hàng đợi đệm trễ thông minh mà không cần viết scheduler riêng trong code.
            </text>
          </g>
        </g>
      </SceneBoard>
    </div>
  );
}
