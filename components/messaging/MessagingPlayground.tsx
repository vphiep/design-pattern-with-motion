'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sliders,
  Activity,
  Server,
  Layers,
  Cpu,
  RefreshCw,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/components/LocaleProvider';

type SimulationTab = 'backpressure' | 'exchange' | 'rebalance';

export function MessagingPlayground() {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<SimulationTab>('backpressure');

  // 1. Backpressure Simulator State
  const [lambda, setLambda] = useState(5000); // Producer msg/s
  const [muPod, setMuPod] = useState(1200); // Consumer msg/s per pod
  const [pods, setPods] = useState(3);
  const [autoscale, setAutoscale] = useState(true);

  const effectivePods = autoscale ? Math.min(10, Math.max(1, Math.ceil(lambda / muPod))) : pods;
  const totalConsumerRate = effectivePods * muPod;
  const netRate = lambda - totalConsumerRate; // dQ/dt
  const queueDepthRatio = Math.max(0, Math.min(100, 20 + netRate / 80));

  // 2. Exchange Routing Simulator State
  const [exchangeType, setExchangeType] = useState<'direct' | 'fanout' | 'topic'>('topic');
  const [routingKey, setRoutingKey] = useState('order.created.vn');
  const [sentCount, setSentCount] = useState(0);

  const matchesQueue = (bindingPattern: string, key: string, type: 'direct' | 'fanout' | 'topic') => {
    if (type === 'fanout') return true;
    if (type === 'direct') return key.trim() === bindingPattern.trim();
    // Topic: * (1 word), # (0 or more words)
    const regexPattern = bindingPattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '[^.]+')
      .replace(/#/g, '.*');
    return new RegExp(`^${regexPattern}$`).test(key);
  };

  // 3. Consumer Group Rebalance Simulator State
  const [consumerCount, setConsumerCount] = useState(3);
  const [rebalanceMode, setRebalanceMode] = useState<'cooperative' | 'eager'>('cooperative');
  const [deadPod, setDeadPod] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen pb-24 text-text">
      {/* Subheader */}
      <div className="border-b border-border-soft bg-bg/95 backdrop-blur-md shadow-xs sticky top-14 z-30">
        <div className="mx-auto flex max-w-wide items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/message-queue"
            className="group inline-flex items-center gap-2 text-xs font-mono text-text-muted transition-colors hover:text-purple-400 shrink-0"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            <span className="uppercase tracking-widest hidden sm:inline-block">
              {locale === 'vi' ? 'QUAY LẠI HÀNG ĐỢI & STREAMING' : 'BACK TO MESSAGING'}
            </span>
            <span className="uppercase tracking-widest sm:hidden">MESSAGING</span>
          </Link>

          {/* Simulator Tabs */}
          <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl border border-border-soft">
            <button
              type="button"
              onClick={() => setActiveTab('backpressure')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5',
                activeTab === 'backpressure'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              <Activity size={13} />
              <span>Backpressure (dQ/dt)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exchange')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5',
                activeTab === 'exchange'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              <Layers size={13} />
              <span>RabbitMQ Routing</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rebalance')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5',
                activeTab === 'rebalance'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              <Cpu size={13} />
              <span>Kafka Rebalancing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-wide px-6 py-10 space-y-8">
        {/* TAB 1: BACKPRESSURE & FLOW CONTROL SIMULATOR */}
        {activeTab === 'backpressure' && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono font-medium mb-2">
                <Sparkles size={12} />
                <span>GOVERNING LAW: dQ/dt = λ - μ</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-mono font-bold text-text-main">
                {locale === 'vi'
                  ? 'Mô Phỏng Áp Suất Ngược, Consumer Lag & Tự Động Co Giãn KEDA'
                  : 'Backpressure, Consumer Lag & Elastic KEDA Autoscaling'}
              </h1>
              <p className="text-xs text-text-muted max-w-3xl mt-1 font-sans leading-relaxed">
                Khi tốc độ Producer (λ) vượt quá tốc độ xử lý của Consumer (μ), hàng đợi bắt đầu tích tụ tin (Consumer Lag). Hãy thử điều chỉnh các thanh trượt và quan sát KEDA tự động scale pods trên Kubernetes!
              </p>
            </div>

            {/* Controls Bar */}
            <div className="p-6 rounded-2xl border border-border-soft bg-surface/30 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Lambda Producer Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">Producer Rate (λ):</span>
                  <span className="font-bold">{lambda.toLocaleString()} msg/s</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={12000}
                  step={500}
                  value={lambda}
                  onChange={(e) => setLambda(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-text-soft font-mono block">Lưu lượng ghi đầu vào từ client</span>
              </div>

              {/* Mu Consumer Pod Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-purple-400 font-bold">Pod Throughput (μ_pod):</span>
                  <span className="font-bold">{muPod.toLocaleString()} msg/s</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={2500}
                  step={100}
                  value={muPod}
                  onChange={(e) => setMuPod(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <span className="text-[10px] text-text-soft font-mono block">Khả năng tiêu thụ của 1 worker pod</span>
              </div>

              {/* KEDA Toggle & Pods */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">KEDA Autoscaling:</span>
                  <span className="font-bold">{autoscale ? 'BẬT (Auto)' : 'TẮT (Manual)'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoscale(!autoscale)}
                  className={cn(
                    'w-full py-2 rounded-xl text-xs font-mono font-bold border transition-all',
                    autoscale
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-surface-subtle text-text-muted border-border-soft'
                  )}
                >
                  {autoscale ? `Đang Auto-scale (${effectivePods} Pods)` : 'Chuyển sang Tự động'}
                </button>
                {!autoscale && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 4, 8].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPods(p)}
                        className={cn(
                          'flex-1 py-1 text-xs font-mono rounded border',
                          pods === p ? 'bg-purple-600 text-white' : 'border-border-soft text-text-muted'
                        )}
                      >
                        {p}p
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic dQ/dt Calculation Box */}
              <div className="p-4 rounded-xl bg-[#090d19] border border-border-soft flex flex-col justify-between">
                <span className="text-[10px] font-mono text-text-soft uppercase">Tốc độ biến thiên hàng đợi:</span>
                <div className="text-lg font-mono font-bold">
                  <span className={netRate > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    dQ/dt = {netRate > 0 ? `+${netRate.toLocaleString()}` : netRate.toLocaleString()} msg/s
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  {netRate > 0 ? '⚠️ Tích tụ Lag (Queue phình to)' : '✅ Tiêu thụ cân bằng (Backlog an toàn)'}
                </span>
              </div>
            </div>

            {/* Visual Queue Depth & Consumer Pods Stage */}
            <div className="p-8 rounded-2xl border border-border-soft bg-[#050811] grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Producer Valve */}
              <div className="space-y-3 p-5 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  1. Producer Cluster (λ)
                </span>
                <div className="text-2xl font-mono font-bold text-text-main">
                  {lambda.toLocaleString()} <span className="text-xs text-text-muted font-normal">msg/s</span>
                </div>
                <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (lambda / 12000) * 100)}%` }} />
                </div>
                <p className="text-xs text-text-muted font-mono">
                  Gửi dữ liệu liên tục vào Topic partition commit log.
                </p>
              </div>

              {/* Queue Depth Tank */}
              <div className="space-y-3 p-5 rounded-xl border border-purple-500/30 bg-[#080a14]">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-purple-400 uppercase tracking-wider">
                    2. Queue Depth / Lag
                  </span>
                  <span className="text-text-muted">{Math.round(queueDepthRatio * 450).toLocaleString()} msgs</span>
                </div>
                {/* Tank Visual */}
                <div className="h-28 rounded-lg border border-border-soft bg-surface/20 p-1 flex flex-col justify-end overflow-hidden">
                  <div
                    className={cn(
                      'rounded transition-all duration-300',
                      netRate > 0 ? 'bg-rose-500/60' : 'bg-emerald-500/50'
                    )}
                    style={{ height: `${queueDepthRatio}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-text-soft">
                  Trạng thái: <strong className={netRate > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {netRate > 0 ? 'Backlog Dâng Cao' : 'Bình Ổn / Cạn Hàng Đợi'}
                  </strong>
                </div>
              </div>

              {/* Consumer Cluster Pods */}
              <div className="space-y-3 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider">
                    3. Consumer Cluster (μ)
                  </span>
                  <span className="text-text-muted">Tổng μ: {totalConsumerRate.toLocaleString()}/s</span>
                </div>
                {/* Pod Grid */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const isActive = idx < effectivePods;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-2 rounded-lg border text-center font-mono text-[10px] transition-all',
                          isActive
                            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'border-border-soft bg-surface/10 text-text-soft opacity-30'
                        )}
                      >
                        P{idx + 1}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-text-muted font-mono">
                  {effectivePods} Pods đang tiêu thụ song song (Mỗi pod {muPod.toLocaleString()} msg/s).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RABBITMQ EXCHANGE ROUTING SIMULATOR */}
        {activeTab === 'exchange' && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono font-medium mb-2">
                <Sparkles size={12} />
                <span>SMART BROKER ROUTING ENGINE</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-mono font-bold text-text-main">
                {locale === 'vi'
                  ? 'Mô Phỏng 4 Loại Sàn Giao Dịch RabbitMQ Exchange & Khớp Routing Key'
                  : 'RabbitMQ Exchange Types & Routing Key Matcher'}
              </h1>
              <p className="text-xs text-text-muted max-w-3xl mt-1 font-sans leading-relaxed">
                Nhập routing key tùy ý hoặc chuyển đổi qua lại giữa Direct, Fanout và Topic Exchange để kiểm tra các hàng đợi (Queues) nào nhận được bản tin.
              </p>
            </div>

            {/* Exchange Controls */}
            <div className="p-6 rounded-2xl border border-border-soft bg-surface/30 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type Switcher */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider block">
                  1. Chọn Loại Exchange:
                </span>
                <div className="flex gap-2">
                  {(['topic', 'direct', 'fanout'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setExchangeType(t)}
                      className={cn(
                        'flex-1 py-2 text-xs font-mono rounded-lg border font-bold capitalize transition-all',
                        exchangeType === t
                          ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                          : 'border-border-soft text-text-muted hover:text-text-main'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Routing Key Input */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider block">
                  2. Producer Routing Key:
                </span>
                <input
                  type="text"
                  value={routingKey}
                  onChange={(e) => setRoutingKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-soft bg-surface/60 text-xs font-mono text-text-main"
                  placeholder="ví dụ: order.created.vn"
                />
              </div>

              {/* Send Button */}
              <div className="space-y-2 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setSentCount((c) => c + 1)}
                  className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Gửi Message #{sentCount + 1}</span>
                </button>
              </div>
            </div>

            {/* Visual Delivery Targets */}
            <div className="p-6 rounded-2xl border border-border-soft bg-[#070b14] space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted block">
                Kết quả chuyển tiếp tới các Queues:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'orders.all', binding: 'order.*.*', desc: 'Nhận mọi đơn hàng (order.*.*)' },
                  { name: 'orders.vietnam', binding: 'order.*.vn', desc: 'Chỉ nhận đơn thị trường VN (order.*.vn)' },
                  { name: 'audit.logs', binding: '#', desc: 'Nhận toàn bộ audit log (#)' }
                ].map((q, idx) => {
                  const isDelivered = matchesQueue(q.binding, routingKey, exchangeType);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'p-5 rounded-xl border transition-all space-y-2',
                        isDelivered
                          ? 'border-emerald-500/50 bg-emerald-500/10 shadow-sm'
                          : 'border-border-soft bg-surface/10 opacity-40'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-text-main">{q.name}</span>
                        {isDelivered ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                            DELIVERED ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-text-muted">DROPPED</span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-orange-400">
                        Binding: {exchangeType === 'fanout' ? '(Bỏ qua key - Broadcast)' : q.binding}
                      </div>
                      <p className="text-xs text-text-muted">{q.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KAFKA REBALANCE SIMULATOR */}
        {activeTab === 'rebalance' && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono font-medium mb-2">
                <Sparkles size={12} />
                <span>KAFKA PARTITION OWNERSHIP PROTOCOL</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-mono font-bold text-text-main">
                {locale === 'vi'
                  ? 'Mô Phỏng Tái Cân Bằng (Rebalance): Eager vs Cooperative Sticky'
                  : 'Kafka Consumer Group Rebalance Simulator'}
              </h1>
              <p className="text-xs text-text-muted max-w-3xl mt-1 font-sans leading-relaxed">
                Quan sát sự khác biệt mang tính cách mạng: Giao thức Eager cũ bắt mọi consumer dừng lại (Stop-the-world); trong khi Cooperative Sticky Assignor chỉ di chuyển các partition bị ảnh hưởng!
              </p>
            </div>

            {/* Controls */}
            <div className="p-6 rounded-2xl border border-border-soft bg-surface/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400">Giao thức Rebalance:</span>
                <button
                  type="button"
                  onClick={() => setRebalanceMode('cooperative')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all',
                    rebalanceMode === 'cooperative'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'border-border-soft text-text-muted'
                  )}
                >
                  Cooperative Sticky (Mới - Zero Downtime)
                </button>
                <button
                  type="button"
                  onClick={() => setRebalanceMode('eager')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all',
                    rebalanceMode === 'eager'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'border-border-soft text-text-muted'
                  )}
                >
                  Eager (Cũ - Stop The World)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-muted">Thử crash pod:</span>
                <button
                  type="button"
                  onClick={() => setDeadPod(deadPod === 2 ? null : 2)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1',
                    deadPod === 2 ? 'bg-rose-500 text-white' : 'border-border-soft text-text-muted hover:text-text-main'
                  )}
                >
                  <Flame size={12} />
                  <span>{deadPod === 2 ? 'Khôi phục Consumer 2' : 'Tắt Consumer 2'}</span>
                </button>
              </div>
            </div>

            {/* Partition & Consumer Topology Visualization */}
            <div className="p-6 rounded-2xl border border-border-soft bg-[#050811] space-y-6">
              {/* 4 Partitions */}
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-3">
                  Topic: orders (4 Partitions)
                </span>
                <div className="grid grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((p) => {
                    let owner = '';
                    if (deadPod === 2) {
                      owner = p < 2 ? 'Consumer 1' : 'Consumer 3';
                    } else {
                      owner = p === 0 ? 'Consumer 1' : p === 1 ? 'Consumer 1' : p === 2 ? 'Consumer 2' : 'Consumer 3';
                    }
                    return (
                      <div key={p} className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-center space-y-1">
                        <span className="text-xs font-mono font-bold text-text-main block">Partition {p}</span>
                        <span className="text-[11px] font-mono text-cyan-300 block">Owner: {owner}</span>
                        <span className="text-[10px] text-text-soft font-mono">Offset: 12,840</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Protocol Impact Banner */}
              <div className={cn(
                'p-4 rounded-xl border text-xs font-mono space-y-1',
                rebalanceMode === 'cooperative'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              )}>
                <div className="font-bold uppercase tracking-wider">
                  {rebalanceMode === 'cooperative'
                    ? 'COOPERATIVE REBALANCE: KHÔNG DỪNG TOÀN BỘ CỤM'
                    : 'EAGER REBALANCE: STOP-THE-WORLD (ĐÌNH CHỈ TOÀN BỘ TIÊU THỤ)'}
                </div>
                <p className="text-text-muted font-sans text-xs">
                  {rebalanceMode === 'cooperative'
                    ? 'Consumer 1 và Consumer 3 vẫn tiếp tục tiêu thụ Partition 0 và 3 bình thường, không bị gián đoạn dù Consumer 2 bị crash hay phục hồi!'
                    : 'Tất cả Consumer phải nhả toàn bộ Partition, hủy socket kết nối và chờ Group Coordinator phân bổ lại từ đầu gây nghẽn độ trễ P99!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
