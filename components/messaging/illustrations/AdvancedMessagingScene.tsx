'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Sparkles, Terminal, Activity, Layers, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AdvancedMessagingSceneProps extends SceneProps {
  topicId?: string;
}

export function AdvancedMessagingScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep,
  topicId = 'kafka-log-compaction-cdc'
}: AdvancedMessagingSceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [activeTab, setActiveTab] = useState<'flow' | 'memory' | 'audit'>('flow');

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0
      tl.addLabel('step-0');
      tl.from('.adv-stage-1', { opacity: 0, x: -20, duration: 0.35 });
      tl.from('.stage-marker-0', { opacity: 0, scale: 0.8, duration: 0.3 }, '<');

      // Step 1
      tl.addLabel('step-1');
      tl.from('.adv-stage-2', { opacity: 0, scale: 0.9, duration: 0.35 });
      tl.from('.stage-marker-1', { opacity: 0, scale: 0.8, duration: 0.3 }, '<');

      // Step 2
      tl.addLabel('step-2');
      tl.from('.adv-stage-3', { opacity: 0, x: 20, duration: 0.35 });
      tl.from('.stage-marker-2', { opacity: 0, scale: 0.8, duration: 0.3 }, '<');

      // Step 3 (optional label for topics with 4 steps)
      tl.addLabel('step-3');
      tl.to('.adv-summary-bar', { stroke: '#10b981', duration: 0.35 });
    }
  });

  // Dynamic schematic based on topic
  const getTopicMeta = (id: string) => {
    switch (id) {
      case 'kafka-log-compaction-cdc':
        return {
          title: 'LOG COMPACTION · CLEANER THREAD, SKIMPY-OFFSET-MAP & TOMBSTONES',
          s1: 'Active Log Segment',
          s1sub: 'Append mutations (K1, K2, K3)',
          s2: 'Cleaner Thread',
          s2sub: 'SkimpyOffsetMap in RAM',
          s3: 'Compacted Segment',
          s3sub: 'Only latest values retained',
          metric1: 'RAM Overhead: 24 bytes/key',
          metric2: 'Dirty Ratio: > 50% triggers scan',
          color: '#06b6d4'
        };
      case 'kafka-streams-stateful-processing':
        return {
          title: 'KAFKA STREAMS · EMBEDDED ROCKSDB LSM & CHANGELOG REPLICATION',
          s1: 'Source Stream Topic',
          s1sub: 'KStream/KTable pipeline',
          s2: 'Embedded RocksDB',
          s2sub: 'Microsecond off-heap read/write',
          s3: 'Internal Changelog Topic',
          s3sub: 'Fault-tolerant state sync',
          metric1: 'Window: Tumbling / Sliding',
          metric2: 'Zero RPC overhead to DB',
          color: '#8b5cf6'
        };
      case 'rabbitmq-quorum-queues-raft':
        return {
          title: 'RABBITMQ QUORUM QUEUES · RAFT CONSENSUS MAJORITY (N/2 + 1)',
          s1: 'Raft Leader Node',
          s1sub: 'Appends entry & sends heartbeats',
          s2: 'Follower Quorum (Majority)',
          s2sub: '2 of 3 replicas confirm log write',
          s3: 'Publisher Confirm ACK',
          s3sub: 'Client notified of durability',
          metric1: 'Consensus: Raft state machine',
          metric2: 'Split-Brain: Immune',
          color: '#f97316'
        };
      case 'rabbitmq-streams-log':
        return {
          title: 'RABBITMQ STREAMS · APPEND-ONLY DISK LOG & ZERO-COPY REPLAY',
          s1: 'Stream Publisher',
          s1sub: 'Binary protocol (Port 5552)',
          s2: 'Segmented Commit Log',
          s2sub: 'Append-only on disk storage',
          s3: 'Non-Destructive Consumer',
          s3sub: 'Offset replay from beginning',
          metric1: 'Throughput: > 1,000,000 msg/s',
          metric2: 'Preserves message history',
          color: '#f97316'
        };
      case 'distributed-disaster-recovery-mirrormaker':
        return {
          title: 'DISASTER RECOVERY · ACTIVE-PASSIVE REPLICATION & MIRRORMAKER 2',
          s1: 'Primary DC-1 (US-East)',
          s1sub: 'Active write cluster (< 3ms)',
          s2: 'MirrorMaker 2 Pipeline',
          s2sub: 'Cross-WAN asynchronous sync',
          s3: 'DR Replica DC-2 (EU-West)',
          s3sub: 'Offset translated & failover ready',
          metric1: 'RPO: ~ 2-5 seconds',
          metric2: 'RTO: < 30 seconds',
          color: '#3b82f6'
        };
      case 'transactional-outbox-kafka-eos':
        return {
          title: 'END-TO-END EXACTLY-ONCE · INGRESS GATEWAY + OUTBOX + KAFKA EOS + DEDUP',
          s1: 'Ingress Gateway',
          s1sub: 'X-Idempotency-Key validation',
          s2: 'DB Outbox + Kafka EOS',
          s2sub: 'Atomic commit + read_committed',
          s3: 'Egress Database Deduplication',
          s3sub: 'ON CONFLICT DO NOTHING',
          metric1: 'Duplicates: 0 (Strict)',
          metric2: 'Data Loss: 0 (At-Least-Once)',
          color: '#10b981'
        };
      case 'zero-copy-pagecache-benchmarking':
        return {
          title: 'LINUX ZERO-COPY · SENDFILE() SYSCALL & DMA CONTROLLER PIPELINE',
          s1: 'Disk to OS Page Cache',
          s1sub: 'Read via DMA directly to kernel',
          s2: 'sendfile() Syscall',
          s2sub: 'Zero JVM Heap copying / No GC',
          s3: 'NIC Socket Buffer (DMA)',
          s3sub: 'Direct transfer to network card',
          metric1: 'CPU Overhead: ~ 1-2%',
          metric2: 'Throughput: Line-rate 10GbE',
          color: '#06b6d4'
        };
      case 'security-mtls-acl-multi-tenancy':
        return {
          title: 'ENTERPRISE SECURITY · MUTUAL TLS X.509 + SASL/SCRAM-512 + TENANT QUOTAS',
          s1: 'Mutual TLS Handshake',
          s1sub: 'Client & Broker X.509 certs',
          s2: 'SASL/SCRAM-SHA-512',
          s2sub: 'Cryptographic challenge-response',
          s3: 'ACL & Quota Policy Guard',
          s3sub: 'Tenant rate limit & read/write gates',
          metric1: 'Encryption: TLSv1.3 in-transit',
          metric2: 'Multi-tenant: 50MB/s quota',
          color: '#ec4899'
        };
      default:
        return {
          title: 'DISTRIBUTED MESSAGING & STREAMING ADVANCED ARCHITECTURE',
          s1: 'Input & Ingress Stage',
          s1sub: 'High-speed ingestion',
          s2: 'Distributed Coordination',
          s2sub: 'Consensus & durability log',
          s3: 'Consumption & Egress',
          s3sub: 'Deterministic processing',
          metric1: 'Protocol: Enterprise ready',
          metric2: 'Guarantees: Fault tolerant',
          color: '#8b5cf6'
        };
    }
  };

  const meta = getTopicMeta(topicId);

  return (
    <div className="relative">
      {/* Interactive Tabs */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab('flow')}
          className={cn(
            'px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1',
            activeTab === 'flow' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-text-muted hover:text-text-main'
          )}
        >
          <Activity size={12} />
          <span>Flow</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('memory')}
          className={cn(
            'px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1',
            activeTab === 'memory' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-text-muted hover:text-text-main'
          )}
        >
          <Layers size={12} />
          <span>Memory &amp; Storage</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={cn(
            'px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1',
            activeTab === 'audit' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-text-muted hover:text-text-main'
          )}
        >
          <ShieldCheck size={12} />
          <span>SLA &amp; Audit</span>
        </button>
      </div>

      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={34}>
          {meta.title}
        </Caption>

        {/* 1. STAGE 1 (X: 35, Y: 65, W: 230, H: 275) */}
        <g className="adv-stage-1" transform="translate(35, 65)">
          <rect
            x={0}
            y={0}
            width={230}
            height={275}
            rx={10}
            fill="#080c16"
            stroke={meta.color}
            strokeWidth={1.5}
            strokeOpacity={0.4}
          />
          <text x={14} y={24} fill={meta.color} fontSize={10} fontFamily="monospace" fontWeight="bold">
            STAGE 1 · INGRESS / LOG
          </text>
          <text x={14} y={42} fill="#94a3b8" fontSize={9} fontFamily="monospace">
            {meta.s1}
          </text>

          <g transform="translate(14, 56)">
            <rect x={0} y={0} width={202} height={50} rx={6} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <circle cx={14} cy={25} r={5} className="stage-marker-0" fill={meta.color} />
            <text x={26} y={22} fill="#e2e8f0" fontSize={10} fontFamily="monospace" fontWeight="bold">
              {meta.s1}
            </text>
            <text x={26} y={36} fill="#94a3b8" fontSize={8} fontFamily="monospace">
              {meta.s1sub}
            </text>
          </g>

          <g transform="translate(14, 118)">
            <rect x={0} y={0} width={202} height={142} rx={6} fill="#050811" stroke="rgba(255,255,255,0.04)" />
            <text x={12} y={20} fill="#64748b" fontSize={8} fontFamily="monospace" fontWeight="bold">
              Telemetry &amp; In-Flight State:
            </text>
            <text x={12} y={42} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Protocol: TCP Wire
            </text>
            <text x={12} y={64} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Buffer: RingBuffer
            </text>
            <text x={12} y={86} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Threading: Epoll I/O
            </text>
            <rect x={12} y={104} width={178} height={26} rx={4} fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" />
            <text x={20} y={121} fill="#34d399" fontSize={8} fontFamily="monospace" fontWeight="bold">
              Status: Latency &lt; 1ms
            </text>
          </g>
        </g>

        {/* Connection Arrow 1 -> 2 */}
        <path d="M 270 200 L 290 200" stroke={meta.color} strokeWidth={2} markerEnd="url(#arrow-purple)" />

        {/* 2. STAGE 2 (X: 295, Y: 65, W: 230, H: 275) */}
        <g className="adv-stage-2" transform="translate(295, 65)">
          <rect
            x={0}
            y={0}
            width={230}
            height={275}
            rx={10}
            fill="#090d18"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1.5}
          />
          <text x={14} y={24} fill="#e2e8f0" fontSize={10} fontFamily="monospace" fontWeight="bold">
            STAGE 2 · STATE &amp; SYNC
          </text>
          <text x={14} y={42} fill="#94a3b8" fontSize={9} fontFamily="monospace">
            {meta.s2}
          </text>

          <g transform="translate(14, 56)">
            <rect x={0} y={0} width={202} height={50} rx={6} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <circle cx={14} cy={25} r={5} className="stage-marker-1" fill="#a78bfa" />
            <text x={26} y={22} fill="#c4b5fd" fontSize={10} fontFamily="monospace" fontWeight="bold">
              {meta.s2}
            </text>
            <text x={26} y={36} fill="#94a3b8" fontSize={8} fontFamily="monospace">
              {meta.s2sub}
            </text>
          </g>

          <g transform="translate(14, 118)">
            <rect x={0} y={0} width={202} height={142} rx={6} fill="#050811" stroke="rgba(255,255,255,0.04)" />
            <text x={12} y={20} fill="#64748b" fontSize={8} fontFamily="monospace" fontWeight="bold">
              Engine Invariants:
            </text>
            <text x={12} y={42} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Consistency: Strong
            </text>
            <text x={12} y={64} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Storage: LSM/PageCache
            </text>
            <text x={12} y={86} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Quorum: N/2 + 1 verified
            </text>
            <rect x={12} y={104} width={178} height={26} rx={4} fill="rgba(56, 189, 248, 0.1)" stroke="rgba(56, 189, 248, 0.3)" />
            <text x={20} y={121} fill="#38bdf8" fontSize={8} fontFamily="monospace" fontWeight="bold">
              State: Synchronized
            </text>
          </g>
        </g>

        {/* Connection Arrow 2 -> 3 */}
        <path d="M 530 200 L 550 200" stroke={meta.color} strokeWidth={2} markerEnd="url(#arrow-purple)" />

        {/* 3. STAGE 3 (X: 555, Y: 65, W: 230, H: 275) */}
        <g className="adv-stage-3" transform="translate(555, 65)">
          <rect
            x={0}
            y={0}
            width={230}
            height={275}
            rx={10}
            fill="#080c16"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth={1.5}
          />
          <text x={14} y={24} fill="#10b981" fontSize={10} fontFamily="monospace" fontWeight="bold">
            STAGE 3 · CONSUMPTION &amp; SLA
          </text>
          <text x={14} y={42} fill="#94a3b8" fontSize={9} fontFamily="monospace">
            {meta.s3}
          </text>

          <g transform="translate(14, 56)">
            <rect x={0} y={0} width={202} height={50} rx={6} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <circle cx={14} cy={25} r={5} className="stage-marker-2" fill="#10b981" />
            <text x={26} y={22} fill="#34d399" fontSize={10} fontFamily="monospace" fontWeight="bold">
              {meta.s3}
            </text>
            <text x={26} y={36} fill="#94a3b8" fontSize={8} fontFamily="monospace">
              {meta.s3sub}
            </text>
          </g>

          <g transform="translate(14, 118)">
            <rect x={0} y={0} width={202} height={142} rx={6} fill="#050811" stroke="rgba(255,255,255,0.04)" />
            <text x={12} y={20} fill="#64748b" fontSize={8} fontFamily="monospace" fontWeight="bold">
              Egress Guarantees:
            </text>
            <text x={12} y={42} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Semantics: {meta.metric1.slice(0, 22)}
            </text>
            <text x={12} y={64} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Guard: {meta.metric2.slice(0, 22)}
            </text>
            <text x={12} y={86} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              • Trace: E2E Correlation
            </text>
            <rect x={12} y={104} width={178} height={26} rx={4} fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" />
            <text x={20} y={121} fill="#10b981" fontSize={8} fontFamily="monospace" fontWeight="bold">
              Guarantee: 100% Invariants
            </text>
          </g>
        </g>

        {/* 4. Bottom Production Guarantees Dashboard Bar (X: 35, Y: 355, W: 750, H: 95) */}
        <g className="adv-summary-bar" transform="translate(35, 355)">
          <rect x={0} y={0} width={750} height={95} rx={10} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <g transform="translate(18, 20)">
            <text x={0} y={12} fill={meta.color} fontSize={10} fontFamily="monospace" fontWeight="bold">
              PRODUCTION SPECIFICATIONS:
            </text>
            <text x={190} y={12} fill="#e2e8f0" fontSize={10} fontFamily="monospace">
              Metric: <tspan fill="#34d399" fontWeight="bold">{meta.metric1}</tspan> | Guarantee: <tspan fill="#38bdf8" fontWeight="bold">{meta.metric2}</tspan>
            </text>
          </g>
          <text x={18} y={54} fill="#94a3b8" fontSize={9.5} fontFamily="monospace">
            Kiến trúc đáp ứng tiêu chuẩn Enterprise: chịu lỗi phân tán (Fault Tolerance), không gây nghẽn rác bộ nhớ
          </text>
          <text x={18} y={72} fill="#94a3b8" fontSize={9.5} fontFamily="monospace">
            (Zero-Copy / Off-heap) và bảo toàn tính toàn vẹn trạng thái trong mọi kịch bản sự cố phần cứng.
          </text>
        </g>
      </SceneBoard>
    </div>
  );
}
