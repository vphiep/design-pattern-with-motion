'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { ShieldCheck, Flame, Play, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function KafkaTransactionsEosScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [crashed, setCrashed] = useState(false);
  const [isolationLevel, setIsolationLevel] = useState<'read_committed' | 'read_uncommitted'>('read_committed');

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Initialize Transaction (PID Fencing)
      tl.addLabel('step-0');
      tl.from('.tc-coordinator-box', { opacity: 0, scale: 0.95, duration: 0.35 });
      tl.from('.pid-fence-badge', { opacity: 0, y: -5, duration: 0.3 }, '<');

      // Step 1: Atomic Produce to Output Topic
      tl.addLabel('step-1');
      tl.from('.stream-pipeline', { opacity: 0, x: -15, duration: 0.4 });
      tl.from('.uncommitted-tag', { opacity: 0, scale: 0.85, duration: 0.3 }, '<');

      // Step 2: Write Two-Phase Commit Markers
      tl.addLabel('step-2');
      tl.to('.two-phase-marker', { fill: '#10b981', stroke: '#34d399', duration: 0.4 });
      tl.from('.downstream-consumer-box', { opacity: 0, y: 15, duration: 0.35 }, '<');
    }
  });

  return (
    <div className="relative">
      {/* Interactive Toolbar */}
      <div className="absolute top-2.5 right-3 z-20 flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md">
        {/* Crash Simulator */}
        <button
          type="button"
          onClick={() => setCrashed(!crashed)}
          className={cn(
            'px-2 py-0.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1 shadow-sm border',
            crashed
              ? 'bg-rose-500 text-white hover:bg-rose-600 border-rose-600'
              : 'bg-surface-subtle text-text-muted border-border-soft hover:text-text-main'
          )}
        >
          {crashed ? <RefreshCw size={11} className="animate-spin" /> : <Flame size={11} className="text-rose-400" />}
          <span>{crashed ? 'Khôi phục (Abort & Reset)' : 'Crash giữa chừng'}</span>
        </button>

        {/* Downstream Isolation Level */}
        <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border-soft">
          <button
            type="button"
            onClick={() => setIsolationLevel('read_committed')}
            className={cn(
              'px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1',
              isolationLevel === 'read_committed'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <ShieldCheck size={11} />
            <span>read_committed</span>
          </button>
          <button
            type="button"
            onClick={() => setIsolationLevel('read_uncommitted')}
            className={cn(
              'px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1',
              isolationLevel === 'read_uncommitted'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <Play size={11} />
            <span>read_uncommitted</span>
          </button>
        </div>
      </div>

      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={32}>
          KAFKA EXACTLY-ONCE SEMANTICS (EOS) · 2-PHASE COMMIT &amp; CONTROL MARKERS
        </Caption>

        {/* 1. Transaction Coordinator (X: 35, Y: 65, Width: 220, Height: 175) */}
        <g className="tc-coordinator-box">
          <rect
            x={35}
            y={65}
            width={220}
            height={175}
            rx={8}
            fill="#080c16"
            stroke="rgba(139, 92, 246, 0.4)"
            strokeWidth={1.5}
          />
          <text x={48} y={88} fill="#c4b5fd" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            TX COORDINATOR
          </text>
          <text x={48} y={104} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
            tx.id: order-stream-1
          </text>

          {/* PID & Epoch */}
          <g className="pid-fence-badge" transform="translate(48, 115)">
            <rect x={0} y={0} width={194} height={30} rx={4} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
            <text x={10} y={15} fill="#a78bfa" fontSize={8} fontFamily="var(--font-mono)">
              PID: #89421 · Epoch: 2
            </text>
            <text x={10} y={24} fill="#34d399" fontSize={7} fontFamily="var(--font-mono)">
              Zombies Fenced Out
            </text>
          </g>

          <g transform="translate(48, 155)">
            <text x={0} y={12} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              __transaction_state partition 14
            </text>
            <text x={0} y={24} fill={crashed ? '#ef4444' : '#10b981'} fontSize={8} fontFamily="var(--font-mono)" fontWeight="bold">
              State: {crashed ? 'ABORT_IN_PROGRESS' : 'PREPARE_COMMIT → DONE'}
            </text>
          </g>
        </g>

        {/* 2. Atomic Stream Worker (X: 270, Y: 65, Width: 255, Height: 175) */}
        <g className="stream-pipeline" transform="translate(270, 65)">
          <rect
            x={0}
            y={0}
            width={255}
            height={175}
            rx={8}
            fill="#080d1a"
            stroke={crashed ? '#ef4444' : 'rgba(6, 182, 212, 0.4)'}
            strokeWidth={1.5}
          />
          <text
            x={14}
            y={22}
            fill={crashed ? '#f87171' : '#67e8f9'}
            fontSize={10}
            fontFamily="var(--font-mono)"
            fontWeight="bold"
          >
            ATOMIC STREAM WORKER {crashed ? '(CRASHED!)' : '(RUNNING)'}
          </text>

          <g transform="translate(14, 34)">
            <rect x={0} y={0} width={227} height={24} rx={4} fill="#030712" />
            <circle cx={12} cy={12} r={3} fill="#10b981" />
            <text x={22} y={16} fill="#e2e8f0" fontSize={8} fontFamily="var(--font-mono)">
              1. Consume input-orders (#504)
            </text>
          </g>

          <g transform="translate(14, 64)">
            <rect x={0} y={0} width={227} height={24} rx={4} fill="#030712" />
            <circle cx={12} cy={12} r={3} fill={crashed ? '#ef4444' : '#10b981'} />
            <text x={22} y={16} fill={crashed ? '#f87171' : '#e2e8f0'} fontSize={8} fontFamily="var(--font-mono)">
              2. Compute discount &amp; tax
            </text>
          </g>

          <g transform="translate(14, 94)">
            <rect x={0} y={0} width={227} height={24} rx={4} fill="#030712" />
            <circle cx={12} cy={12} r={3} fill={crashed ? '#ef4444' : '#10b981'} />
            <text x={22} y={16} fill={crashed ? '#f87171' : '#e2e8f0'} fontSize={8} fontFamily="var(--font-mono)">
              3. Produce output + Commit offset
            </text>
          </g>

          <g transform="translate(14, 128)">
            <text x={0} y={12} fill="#64748b" fontSize={7} fontFamily="var(--font-mono)">
              transactionManager.commit()
            </text>
          </g>
        </g>

        {/* 3. Output Topic Partition Log (X: 540, Y: 65, Width: 245, Height: 175) */}
        <g transform="translate(540, 65)">
          <rect
            x={0}
            y={0}
            width={245}
            height={175}
            rx={8}
            fill="#030712"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1.5}
          />
          <text x={14} y={22} fill="#94a3b8" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
            TOPIC: output-events [P0]
          </text>
          <text x={14} y={36} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
            Append-only Log + Control Markers
          </text>

          {/* Record In Log */}
          <g transform="translate(14, 46)">
            <rect x={0} y={0} width={217} height={38} rx={4} fill="#0d1424" stroke="rgba(6, 182, 212, 0.3)" />
            <text x={8} y={16} fill="#e2e8f0" fontSize={8} fontFamily="var(--font-mono)">
              Offset 1,029: OrderEnrichedEvent
            </text>
            <text
              x={8}
              y={28}
              className="uncommitted-tag"
              fill={crashed ? '#f87171' : '#38bdf8'}
              fontSize={7}
              fontFamily="var(--font-mono)"
            >
              {crashed ? 'STATUS: ABORTED RECORD' : 'STATUS: UNCOMMITTED'}
            </text>
          </g>

          {/* Two-Phase Commit Marker */}
          <g transform="translate(14, 92)">
            <rect
              className="two-phase-marker"
              x={0}
              y={0}
              width={217}
              height={38}
              rx={4}
              fill={crashed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}
              stroke={crashed ? '#ef4444' : '#10b981'}
              strokeWidth={1.2}
            />
            <text
              x={8}
              y={16}
              fill={crashed ? '#f87171' : '#34d399'}
              fontSize={8}
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              {crashed ? 'CONTROL RECORD: ABORT' : 'CONTROL RECORD: COMMIT'}
            </text>
            <text x={8} y={28} fill="#94a3b8" fontSize={7} fontFamily="var(--font-mono)">
              Two-Phase Commit Control Marker
            </text>
          </g>
        </g>

        {/* 4. Downstream Consumer (X: 35, Y: 255, Width: 750, Height: 85) */}
        <g className="downstream-consumer-box" transform="translate(35, 255)">
          <rect
            x={0}
            y={0}
            width={750}
            height={85}
            rx={8}
            fill="#080c16"
            stroke="rgba(16, 185, 129, 0.35)"
            strokeWidth={1.5}
          />
          <text x={16} y={20} fill="#6ee7b7" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
            DOWNSTREAM CONSUMER · isolation.level = {isolationLevel}
          </text>

          <g transform="translate(16, 32)">
            <rect
              x={0}
              y={0}
              width={718}
              height={42}
              rx={5}
              fill="#030712"
              stroke={
                crashed && isolationLevel === 'read_uncommitted'
                  ? 'rgba(239, 68, 68, 0.5)'
                  : 'rgba(16, 185, 129, 0.3)'
              }
            />
            <text
              x={12}
              y={18}
              fill={crashed && isolationLevel === 'read_uncommitted' ? '#f87171' : '#34d399'}
              fontSize={9}
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              {crashed && isolationLevel === 'read_uncommitted'
                ? '⚠️ DIRTY READ: Đọc dữ liệu từ transaction bị crash/abort! Phá vỡ tính nguyên tử.'
                : crashed && isolationLevel === 'read_committed'
                ? '✅ EOS BẢO TOÀN: LSO (Last Stable Offset) chặn lại, record bị crash được bỏ qua hoàn toàn.'
                : '✅ GIAO DỊCH THÀNH CÔNG: Marker Commit cho phép Consumer đọc an toàn mà không bị lặp hay mất mát.'}
            </text>
            <text x={12} y={32} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              {isolationLevel === 'read_committed'
                ? 'Chỉ đọc tới Last Stable Offset (LSO), an toàn tuyệt đối với mọi luồng streaming.'
                : 'read_uncommitted đọc bản tin chưa commit, rất nguy hiểm trong microservices.'}
            </text>
          </g>
        </g>

        {/* 5. Bottom Architectural Law Bar (X: 35, Y: 355, Width: 750, Height: 95) */}
        <g transform="translate(35, 355)">
          <rect x={0} y={0} width={750} height={95} rx={8} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <g transform="translate(16, 20)">
            <text x={0} y={10} fill="#a78bfa" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
              KAFKA EOS INVARIANT:
            </text>
            <text x={170} y={10} fill="#e2e8f0" fontSize={11} fontFamily="var(--font-mono)">
              Kafka EOS chỉ đảm bảo nguyên tử giữa Kafka Topic $\rightarrow$ Kafka Topic (Consume-Transform-Produce).
            </text>
          </g>
          <g transform="translate(16, 52)">
            <text x={0} y={12} fill="#94a3b8" fontSize={9} fontFamily="var(--font-mono)">
              Khi ghi xuống Database ngoài (Postgres, Oracle), BẮT BUỘC phải dùng Idempotent Consumer (Upsert / Unique Key / Outbox Pattern) vì 2PC của Kafka không hỗ trợ XA transaction với external DB!
            </text>
            <text x={0} y={28} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              PID Fencing: Producer ID mới với Epoch cao hơn sẽ fence (cô lập) zombie producers bị delay mạng, ngăn chặn Split-Brain.
            </text>
          </g>
        </g>
      </SceneBoard>
    </div>
  );
}
