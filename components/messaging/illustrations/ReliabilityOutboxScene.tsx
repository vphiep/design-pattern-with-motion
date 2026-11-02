'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Database, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ReliabilityOutboxScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [dualWriteFail, setDualWriteFail] = useState(false);

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Atomic DB Outbox Commit
      tl.addLabel('step-0');
      tl.from('.postgres-db-box', { opacity: 0, x: -20, duration: 0.35 });
      tl.from('.outbox-row-insert', { opacity: 0, y: 10, duration: 0.3 }, '<');

      // Step 1: Debezium Tails Postgres WAL
      tl.addLabel('step-1');
      tl.from('.debezium-connector-box', { opacity: 0, scale: 0.9, duration: 0.35 });
      tl.from('.wal-stream-arrow', { strokeDashoffset: 50, duration: 0.35 }, '<');

      // Step 2: Stream to Kafka & Bridge to RabbitMQ
      tl.addLabel('step-2');
      tl.from('.kafka-cluster-box', { opacity: 0, x: 15, duration: 0.35 });
      tl.from('.rabbitmq-bridge-box', { opacity: 0, y: 15, duration: 0.35 }, '<0.1');
    }
  });

  return (
    <div className="relative">
      {/* Comparison Switcher */}
      <div className="absolute top-2.5 right-3 z-20 flex items-center">
        <button
          type="button"
          onClick={() => setDualWriteFail(!dualWriteFail)}
          className={cn(
            'px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-sm border',
            dualWriteFail
              ? 'bg-rose-500 text-white hover:bg-rose-600 border-rose-600'
              : 'bg-surface-subtle text-text-muted border-border-soft hover:text-text-main'
          )}
        >
          {dualWriteFail ? <RefreshCw size={11} className="animate-spin" /> : <ShieldCheck size={11} className="text-emerald-400" />}
          <span>{dualWriteFail ? 'Hiển thị: Dual-Write Bug' : 'Chuẩn: Transactional Outbox'}</span>
        </button>
      </div>

      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={32}>
          RELIABILITY ARCHITECTURE · TRANSACTIONAL OUTBOX + DEBEZIUM CDC + KAFKA/RABBITMQ
        </Caption>

        {/* 1. PostgreSQL Database with WAL (X: 35, Y: 65, Width: 200, Height: 275) */}
        <g className="postgres-db-box" transform="translate(35, 65)">
          <rect
            x={0}
            y={0}
            width={200}
            height={275}
            rx={8}
            fill="#080d1a"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth={1.5}
          />
          <text x={14} y={22} fill="#38bdf8" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            POSTGRESQL (ACID)
          </text>
          <text x={14} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
            Single Local Transaction
          </text>

          {/* Table: orders */}
          <g transform="translate(14, 48)">
            <rect x={0} y={0} width={172} height={38} rx={4} fill="#030712" stroke="rgba(255,255,255,0.06)" />
            <text x={8} y={15} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Table: orders
            </text>
            <text x={8} y={28} fill="#38bdf8" fontSize={8} fontFamily="var(--font-mono)">
              id: 9021 | PAID
            </text>
          </g>

          {/* Table: outbox_events */}
          <g className="outbox-row-insert" transform="translate(14, 94)">
            <rect
              x={0}
              y={0}
              width={172}
              height={58}
              rx={4}
              fill={dualWriteFail ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}
              stroke={dualWriteFail ? '#ef4444' : '#10b981'}
              strokeWidth={1.2}
            />
            <text x={8} y={15} fill={dualWriteFail ? '#f87171' : '#34d399'} fontSize={8} fontFamily="var(--font-mono)" fontWeight="bold">
              {dualWriteFail ? 'DUAL-WRITE BUG!' : 'Table: outbox_events'}
            </text>
            <text x={8} y={28} fill="#e2e8f0" fontSize={7} fontFamily="var(--font-mono)">
              id: 9021 | OrderPaidEvent
            </text>
            <text x={8} y={44} fill="#94a3b8" fontSize={7} fontFamily="var(--font-mono)">
              {dualWriteFail ? 'DB commit nhưng gửi broker lỗi!' : 'Commit cùng 1 transaction'}
            </text>
          </g>

          {/* Write-Ahead Log (WAL) */}
          <g transform="translate(14, 162)">
            <rect x={0} y={0} width={172} height={85} rx={4} fill="#050a14" stroke="rgba(56, 189, 248, 0.2)" />
            <text x={8} y={16} fill="#38bdf8" fontSize={8} fontFamily="var(--font-mono)" fontWeight="bold">
              Postgres WAL (Logical Decoding)
            </text>
            <text x={8} y={32} fill="#64748b" fontSize={7} fontFamily="var(--font-mono)">
              Plugin: pgoutput · LSN: 0/16F8920
            </text>
            <text x={8} y={48} fill="#10b981" fontSize={7} fontFamily="var(--font-mono)">
              Zero Polling Overhead
            </text>
            <text x={8} y={64} fill="#94a3b8" fontSize={7} fontFamily="var(--font-mono)">
              Continuous append stream
            </text>
          </g>
        </g>

        {/* 2. Debezium CDC Connector (X: 255, Y: 100, Width: 160, Height: 200) */}
        <g className="debezium-connector-box" transform="translate(255, 100)">
          {/* Connecting Arrow from WAL */}
          <path d="M -20 85 L 0 85" className="wal-stream-arrow" stroke="#38bdf8" strokeWidth={2.5} markerEnd="url(#arrow-cyan)" />

          <rect
            x={0}
            y={0}
            width={160}
            height={200}
            rx={8}
            fill="#090d19"
            stroke="rgba(245, 158, 11, 0.4)"
            strokeWidth={1.5}
          />
          <text x={14} y={22} fill="#fbbf24" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            DEBEZIUM CDC
          </text>
          <text x={14} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
            Kafka Connect Engine
          </text>

          <g transform="translate(10, 48)">
            <rect x={0} y={0} width={140} height={42} rx={4} fill="#030712" />
            <text x={6} y={16} fill="#fbbf24" fontSize={8} fontFamily="var(--font-mono)">
              Tails WAL stream
            </text>
            <text x={6} y={28} fill="#94a3b8" fontSize={7} fontFamily="var(--font-mono)">
              Zero query polling load
            </text>
          </g>

          <g transform="translate(10, 100)">
            <rect x={0} y={0} width={140} height={85} rx={4} fill="#030712" />
            <text x={6} y={16} fill="#34d399" fontSize={8} fontFamily="var(--font-mono)">
              Outbox Event Router:
            </text>
            <text x={6} y={32} fill="#e2e8f0" fontSize={7} fontFamily="var(--font-mono)">
              • Payload extraction
            </text>
            <text x={6} y={48} fill="#94a3b8" fontSize={7} fontFamily="var(--font-mono)">
              • Aggregate ID routing
            </text>
            <text x={6} y={64} fill="#64748b" fontSize={7} fontFamily="var(--font-mono)">
              • Auto tombstone cleanup
            </text>
          </g>
        </g>

        {/* 3. Kafka Core Streaming Backbone (X: 435, Y: 65, Width: 165, Height: 275) */}
        <g className="kafka-cluster-box" transform="translate(435, 65)">
          {/* Arrow from Debezium to Kafka */}
          <path d="M -20 120 L 0 120" stroke="#fbbf24" strokeWidth={2.5} markerEnd="url(#arrow-amber)" />

          <rect
            x={0}
            y={0}
            width={165}
            height={275}
            rx={8}
            fill="#080c16"
            stroke="rgba(6, 182, 212, 0.4)"
            strokeWidth={1.5}
          />
          <text x={14} y={22} fill="#06b6d4" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            APACHE KAFKA
          </text>
          <text x={14} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
            Distributed Event Log
          </text>

          <g transform="translate(10, 52)">
            <rect x={0} y={0} width={145} height={60} rx={4} fill="#030712" stroke="rgba(6, 182, 212, 0.2)" />
            <text x={8} y={15} fill="#67e8f9" fontSize={8} fontFamily="var(--font-mono)">
              Topic: orders.events
            </text>
            <text x={8} y={30} fill="#94a3b8" fontSize={7} fontFamily="var(--font-mono)">
              Partition 0: #10492
            </text>
            <text x={8} y={44} fill="#10b981" fontSize={8} fontFamily="var(--font-mono)">
              OrderPaidEvent
            </text>
          </g>

          <g transform="translate(10, 130)">
            <text x={0} y={14} fill="#64748b" fontSize={7} fontFamily="var(--font-mono)">
              Long-term retention
            </text>
            <text x={0} y={28} fill="#64748b" fontSize={7} fontFamily="var(--font-mono)">
              Time-travel replay
            </text>
            <text x={0} y={42} fill="#64748b" fontSize={7} fontFamily="var(--font-mono)">
              High throughput hub
            </text>
          </g>
        </g>

        {/* 4. RabbitMQ Routing Bridge (X: 620, Y: 65, Width: 165, Height: 275) */}
        <g className="rabbitmq-bridge-box" transform="translate(620, 65)">
          {/* Arrow from Kafka to RabbitMQ */}
          <path d="M -20 120 L 0 120" stroke="#06b6d4" strokeWidth={2.5} markerEnd="url(#arrow-cyan)" />

          <rect
            x={0}
            y={0}
            width={165}
            height={275}
            rx={8}
            fill="#0c0914"
            stroke="rgba(249, 115, 22, 0.4)"
            strokeWidth={1.5}
          />
          <text x={14} y={22} fill="#f97316" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            RABBITMQ BRIDGE
          </text>
          <text x={14} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
            Smart AMQP Routing
          </text>

          <g transform="translate(10, 52)">
            <rect x={0} y={0} width={145} height={42} rx={4} fill="#030712" stroke="rgba(249, 115, 22, 0.2)" />
            <text x={8} y={16} fill="#fb923c" fontSize={8} fontFamily="var(--font-mono)">
              Exchange: notification
            </text>
            <text x={8} y={30} fill="#94a3b8" fontSize={7} fontFamily="var(--font-mono)">
              Key: order.paid.*
            </text>
          </g>

          {/* Queues */}
          <g transform="translate(10, 105)">
            <rect x={0} y={0} width={145} height={26} rx={4} fill="#180e06" />
            <text x={8} y={17} fill="#f97316" fontSize={8} fontFamily="var(--font-mono)">
              Queue: email-service
            </text>
          </g>

          <g transform="translate(10, 138)">
            <rect x={0} y={0} width={145} height={26} rx={4} fill="#180e06" />
            <text x={8} y={17} fill="#f97316" fontSize={8} fontFamily="var(--font-mono)">
              Queue: sms-push
            </text>
          </g>

          <g transform="translate(10, 171)">
            <rect x={0} y={0} width={145} height={26} rx={4} fill="#180e06" />
            <text x={8} y={17} fill="#f97316" fontSize={8} fontFamily="var(--font-mono)">
              Queue: accounting-dlq
            </text>
          </g>
        </g>

        {/* 5. Production Philosophy Bar (X: 35, Y: 355, Width: 750, Height: 95) */}
        <g transform="translate(35, 355)">
          <rect x={0} y={0} width={750} height={95} rx={8} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <g transform="translate(16, 20)">
            <text x={0} y={10} fill="#38bdf8" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
              KIẾN TRÚC TIN CẬY TOÀN DIỆN (ZERO DATA LOSS):
            </text>
            <text x={280} y={10} fill="#e2e8f0" fontSize={11} fontFamily="var(--font-mono)">
              {dualWriteFail
                ? 'Dual-Write Antipattern: Ghi DB rồi gọi broker.send() -> Lỗi mạng dẫn đến mất mát!'
                : 'Mô hình chuẩn: DB Transactional Outbox -> Debezium CDC -> Kafka -> RabbitMQ.'}
            </text>
          </g>
          <g transform="translate(16, 52)">
            <text x={0} y={12} fill="#94a3b8" fontSize={9} fontFamily="var(--font-mono)">
              {dualWriteFail
                ? 'Giải pháp khắc phục: Loại bỏ hoàn toàn Dual-Write. Dùng Outbox Pattern kết hợp Debezium CDC để đạt độ tin cậy At-Least-Once 100%.'
                : 'Sức mạnh kết hợp: Kafka đóng vai trò trung tâm lưu trữ biến động bền vững (Event Log backbone), còn RabbitMQ chịu trách nhiệm chia tải linh hoạt cho các worker theo routing key phức tạp.'}
            </text>
            <text x={0} y={28} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              Debezium đọc nhị phân Logical Decoding từ WAL, không thực hiện bất kỳ lệnh SELECT polling nào, loại bỏ 100% tải phụ lên database nghiệp vụ.
            </text>
          </g>
        </g>
      </SceneBoard>
    </div>
  );
}
