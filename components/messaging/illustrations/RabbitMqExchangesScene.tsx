'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { cn } from '@/lib/utils/cn';

type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers';

export function RabbitMqExchangesScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [exchangeType, setExchangeType] = useState<ExchangeType>('topic');

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Producer emits payload with Routing Key
      tl.addLabel('step-0');
      tl.from('.producer-node', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.routing-packet', { opacity: 0, scale: 0.8, duration: 0.35 });

      // Step 1: Exchange evaluates bindings
      tl.addLabel('step-1');
      tl.to('.routing-packet', { x: 190, duration: 0.45, ease: 'power2.out' });
      tl.from('.exchange-core', { scale: 0.9, opacity: 0.8, duration: 0.3 }, '-=0.2');
      tl.from('.binding-line', { strokeDashoffset: 100, duration: 0.4 }, '-=0.1');

      // Step 2: Routed to matched queues
      tl.addLabel('step-2');
      tl.to('.dest-queue-matched', { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.12)', duration: 0.4 });
      tl.from('.matched-badge', { opacity: 0, y: 5, duration: 0.3 }, '<');
    }
  });

  // Dynamic matching rules for the 4 Exchange types:
  // Routing Key sent by Producer: "orders.apac.payment"
  const isQueue1Matched =
    exchangeType === 'fanout' ||
    (exchangeType === 'topic' && true) ||
    exchangeType === 'headers';

  const isQueue2Matched =
    exchangeType === 'fanout' ||
    (exchangeType === 'direct' && true) ||
    (exchangeType === 'topic' && true) ||
    exchangeType === 'headers';

  const isQueue3Matched =
    exchangeType === 'fanout';

  const isQueue4Matched = false; // Dead letter / unmatched

  return (
    <div className="relative">
      {/* Interactive Exchange Switcher Pills */}
      <div className="absolute top-2.5 right-3 z-20 flex items-center gap-1 p-1 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md">
        <span className="text-[10px] font-mono font-bold text-text-muted px-1.5 uppercase hidden sm:inline">Exchange:</span>
        {(['topic', 'direct', 'fanout', 'headers'] as ExchangeType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setExchangeType(type)}
            className={cn(
              'px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg transition-all',
              exchangeType === type
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-elevated'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={32}>
          RABBITMQ EXCHANGE ROUTING · INTERACTIVE TYPE SIMULATOR
        </Caption>

        {/* 1. PRODUCER NODE (X: 35, Y: 65, Width: 185, Height: 275) */}
        <g className="producer-node" data-step="0">
          <rect x={35} y={65} width={185} height={275} rx={10} fill="#080c16" stroke="#f97316" strokeWidth={1.8} />
          <text x={50} y={92} fill="#f97316" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            PRODUCER (AMQP 0-9-1)
          </text>
          <text x={50} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
            rabbitTemplate.convertAndSend()
          </text>

          {/* Payload card */}
          <g transform="translate(50, 122)">
            <rect x={0} y={0} width={155} height={60} rx={6} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <text x={10} y={18} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
              Payload: OrderCreatedEvent
            </text>
            <text x={10} y={34} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={9} fontWeight="bold">
              id: 9814 | amt: $250
            </text>
            <text x={10} y={50} fill="#10b981" fontFamily="var(--font-mono)" fontSize={8}>
              delivery_mode: 2 (Persistent)
            </text>
          </g>

          {/* Routing Key Box */}
          <g transform="translate(50, 195)">
            <rect x={0} y={0} width={155} height={60} rx={6} fill="rgba(249, 115, 22, 0.12)" stroke="rgba(249, 115, 22, 0.3)" />
            <text x={10} y={18} fill="#f97316" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              SENT ROUTING KEY:
            </text>
            <text x={10} y={34} fill="#fdba74" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              orders.apac.payment
            </text>
            <text x={10} y={50} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={7}>
              3 dot-delimited tokens
            </text>
          </g>

          {/* Socket status */}
          <g transform="translate(50, 268)">
            <text x={0} y={12} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
              Channel #1: Confirmed ACK (<tspan fill="#34d399">1.8ms</tspan>)
            </text>
          </g>
        </g>

        {/* FLYING ROUTING PACKET */}
        <g className="routing-packet">
          <circle cx={205} cy={180} r={12} fill="#f97316" stroke="#ffffff" strokeWidth={2} filter="drop-shadow(0 2px 4px rgba(249,115,22,0.5))" />
          <text x={205} y={184} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
            MSG
          </text>
        </g>

        {/* 2. EXCHANGE ENGINE (X: 245, Y: 65, Width: 220, Height: 275) */}
        <g className="exchange-core" data-step="1">
          <rect x={245} y={65} width={220} height={275} rx={10} fill="#0b0814" stroke="#f97316" strokeWidth={1.8} />
          <text x={260} y={92} fill="#f97316" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            EXCHANGE: amq.{exchangeType}
          </text>
          <text x={260} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
            Type: {exchangeType.toUpperCase()} · Durable: true
          </text>

          {/* Center Diamond Shape */}
          <polygon
            points="355,130 425,190 355,250 285,190"
            fill="#180e06"
            stroke="#f97316"
            strokeWidth={2}
          />
          <text x={355} y={186} textAnchor="middle" fill="#f97316" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            {exchangeType.toUpperCase()}
          </text>
          <text x={355} y={202} textAnchor="middle" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
            Evaluation Engine
          </text>

          {/* Rule note */}
          <g transform="translate(260, 268)">
            <text x={0} y={12} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={8}>
              {exchangeType === 'topic'
                ? 'Pattern Match: * (1 token), # (0 or more)'
                : exchangeType === 'direct'
                ? 'Exact Match: key == binding.key'
                : exchangeType === 'fanout'
                ? 'Broadcast: ignores routing key completely'
                : 'Headers Match: x-match: all/any headers'}
            </text>
          </g>
        </g>

        {/* 3. BINDING LINES & TARGET QUEUES (X: 495, Width: 285) */}
        <g className="bindings-and-queues" data-step="2">
          {/* Queue 1: orders.# */}
          <g transform="translate(495, 65)">
            <line
              x1={-70}
              y1={125}
              x2={0}
              y2={25}
              stroke={isQueue1Matched ? '#10b981' : 'rgba(255,255,255,0.1)'}
              strokeWidth={isQueue1Matched ? 2 : 1}
              strokeDasharray={isQueue1Matched ? undefined : '3 3'}
              className="binding-line"
            />
            <rect
              x={0}
              y={0}
              width={285}
              height={58}
              rx={8}
              fill="#080c16"
              stroke={isQueue1Matched ? '#10b981' : 'rgba(255,255,255,0.08)'}
              strokeWidth={isQueue1Matched ? 1.5 : 1}
              className={cn(isQueue1Matched && 'dest-queue-matched')}
            />
            <text x={14} y={22} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Queue: orders.all
            </text>
            <text x={14} y={38} fill="#f97316" fontFamily="var(--font-mono)" fontSize={9}>
              Binding: orders.#
            </text>
            <rect x={190} y={14} width={82} height={20} rx={4} fill={isQueue1Matched ? '#10b981' : '#1e293b'} />
            <text x={231} y={28} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              {isQueue1Matched ? 'MATCHED ✓' : 'SKIPPED'}
            </text>
          </g>

          {/* Queue 2: *.apac.* */}
          <g transform="translate(495, 137)">
            <line
              x1={-70}
              y1={53}
              x2={0}
              y2={25}
              stroke={isQueue2Matched ? '#10b981' : 'rgba(255,255,255,0.1)'}
              strokeWidth={isQueue2Matched ? 2 : 1}
              strokeDasharray={isQueue2Matched ? undefined : '3 3'}
              className="binding-line"
            />
            <rect
              x={0}
              y={0}
              width={285}
              height={58}
              rx={8}
              fill="#080c16"
              stroke={isQueue2Matched ? '#10b981' : 'rgba(255,255,255,0.08)'}
              strokeWidth={isQueue2Matched ? 1.5 : 1}
              className={cn(isQueue2Matched && 'dest-queue-matched')}
            />
            <text x={14} y={22} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Queue: region.apac
            </text>
            <text x={14} y={38} fill="#f97316" fontFamily="var(--font-mono)" fontSize={9}>
              Binding: *.apac.*
            </text>
            <rect x={190} y={14} width={82} height={20} rx={4} fill={isQueue2Matched ? '#10b981' : '#1e293b'} />
            <text x={231} y={28} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              {isQueue2Matched ? 'MATCHED ✓' : 'SKIPPED'}
            </text>
          </g>

          {/* Queue 3: billing.urgent.* */}
          <g transform="translate(495, 209)">
            <line
              x1={-70}
              y1={-19}
              x2={0}
              y2={25}
              stroke={isQueue3Matched ? '#10b981' : 'rgba(255,255,255,0.1)'}
              strokeWidth={isQueue3Matched ? 2 : 1}
              strokeDasharray={isQueue3Matched ? undefined : '3 3'}
              className="binding-line"
            />
            <rect
              x={0}
              y={0}
              width={285}
              height={58}
              rx={8}
              fill="#080c16"
              stroke={isQueue3Matched ? '#10b981' : 'rgba(255,255,255,0.08)'}
              strokeWidth={isQueue3Matched ? 1.5 : 1}
              className={cn(isQueue3Matched && 'dest-queue-matched')}
            />
            <text x={14} y={22} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Queue: billing.urgent
            </text>
            <text x={14} y={38} fill="#f97316" fontFamily="var(--font-mono)" fontSize={9}>
              Binding: billing.urgent.*
            </text>
            <rect x={190} y={14} width={82} height={20} rx={4} fill={isQueue3Matched ? '#10b981' : '#1e293b'} />
            <text x={231} y={28} textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              {isQueue3Matched ? 'MATCHED ✓' : 'SKIPPED'}
            </text>
          </g>

          {/* Queue 4: Dead-Letter Queue (DLQ) */}
          <g transform="translate(495, 281)">
            <rect
              x={0}
              y={0}
              width={285}
              height={58}
              rx={8}
              fill="#080c16"
              stroke={isQueue4Matched ? '#ef4444' : 'rgba(255,255,255,0.08)'}
              strokeWidth={1}
            />
            <text x={14} y={22} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Queue: orders.dlq (Dead Letter)
            </text>
            <text x={14} y={38} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
              x-dead-letter-exchange fallback
            </text>
            <rect x={190} y={14} width={82} height={20} rx={4} fill="#1e293b" />
            <text x={231} y={28} textAnchor="middle" fill="#64748b" fontFamily="var(--font-mono)" fontSize={8} fontWeight="bold">
              STANDBY
            </text>
          </g>
        </g>

        {/* 4. BOTTOM ROUTING DASHBOARD (X: 35, Y: 355, Width: 745, Height: 95) */}
        <g transform="translate(35, 355)">
          <rect x={0} y={0} width={745} height={95} rx={8} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <g transform="translate(16, 20)">
            <text x={0} y={10} fill="#f97316" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
              ROUTING DECISION:
            </text>
            <text x={150} y={10} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={11}>
              Key <tspan fill="#fdba74" fontWeight="bold">&quot;orders.apac.payment&quot;</tspan> khớp với: <tspan fill="#34d399" fontWeight="bold">
                {exchangeType === 'fanout'
                  ? '3/3 Queues (Broadcast toàn bộ)'
                  : exchangeType === 'topic'
                  ? 'Queue 1 (orders.#) & Queue 2 (*.apac.*)'
                  : exchangeType === 'direct'
                  ? 'Queue 2 (Nếu binding key chính xác)'
                  : 'Queues có headers thỏa mãn x-match'}
              </tspan>
            </text>
          </g>
          <g transform="translate(16, 52)">
            <text x={0} y={12} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={9}>
              Triết lý Smart Broker của RabbitMQ: Broker gánh toàn bộ chi phí parsing routing key và nhân bản con trỏ bản tin (zero-copy pointer) tới các queue thỏa mãn binding.
            </text>
            <text x={0} y={28} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
              Ngược lại với Kafka (Dumb Broker): Kafka đẩy trách nhiệm tính Hash Partition về phía Producer client nhằm tối đa hóa thông lượng.
            </text>
          </g>
        </g>
      </SceneBoard>
    </div>
  );
}
