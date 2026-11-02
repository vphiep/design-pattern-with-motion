'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MathFormula } from '@/components/MathFormula';
import { motion } from 'framer-motion';
import {
  Layers,
  ArrowRight,
  Search,
  Sparkles,
  Server,
  Play,
  Terminal,
  ShieldCheck,
  Scale,
  Binary,
  Activity,
  Cpu,
  Clock,
  Zap,
  CheckCircle2,
  Sliders,
  Flame
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { getAllMessagingTopics, MESSAGING_CATEGORY_META } from '@/lib/messaging/data';
import type { MessagingCategory, MessagingLevel } from '@/lib/messaging/types';
import { cn } from '@/lib/utils/cn';

export function MessagingHubExperience() {
  const { tx, locale } = useLocale();
  const allTopics = getAllMessagingTopics();

  const [selectedLevel, setSelectedLevel] = useState<MessagingLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<MessagingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = allTopics.filter((t) => {
    if (selectedLevel !== 'all' && t.level !== selectedLevel) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      tx(t.tagline).toLowerCase().includes(q) ||
      t.chapter.toLowerCase().includes(q)
    );
  });

  const categories: Array<{ id: MessagingCategory | 'all'; label: { en: string; vi: string }; icon: any }> = [
    { id: 'all', label: { en: 'All 20 Topics', vi: 'Tất cả 20 Bài học' }, icon: Layers },
    { id: 'messaging-fundamentals', label: MESSAGING_CATEGORY_META['messaging-fundamentals'].label, icon: Layers },
    { id: 'rabbitmq-broker', label: MESSAGING_CATEGORY_META['rabbitmq-broker'].label, icon: Server },
    { id: 'kafka-streaming', label: MESSAGING_CATEGORY_META['kafka-streaming'].label, icon: Activity },
    { id: 'reliability-backpressure', label: MESSAGING_CATEGORY_META['reliability-backpressure'].label, icon: ShieldCheck },
    { id: 'advanced-streaming', label: MESSAGING_CATEGORY_META['advanced-streaming'].label, icon: Cpu }
  ];

  return (
    <div className="relative min-h-screen pb-24 text-text">
      {/* Blueprint Grid Ambient Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-soft)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Hero Section */}
      <section className="mx-auto max-w-wide px-6 pt-16 md:pt-24 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono font-medium mb-6">
          <Sparkles size={13} />
          <span>{locale === 'vi' ? 'HẠ TẦNG PHÂN TÁN · APACHE KAFKA VS RABBITMQ' : 'DISTRIBUTED MESSAGING & STREAMING ACADEMY'}</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-display text-display-2xl tracking-tight max-w-5xl"
        >
          {locale === 'vi'
            ? 'Giải Quyết Bài Toán Phân Tán với Apache Kafka & RabbitMQ'
            : 'Distributed Systems Invariants: Apache Kafka vs RabbitMQ'}
        </motion.h1>

        <p className="mt-5 text-lg md:text-xl text-text-soft max-w-3xl leading-relaxed font-sans">
          {locale === 'vi'
            ? 'Không chỉ liệt kê API độc lập. Học cách giải quyết các bài toán phân tán kinh điển: phân tách thời gian (temporal decoupling), ngữ nghĩa giao hàng (At-least-once / EOS), chống mất gói tin, kẹt Consumer Lag, kiểm soát áp suất ngược (Backpressure) và bão Rebalance bằng hoạt họa trực quan và Spring Boot 3.'
            : 'Centered on core distributed systems challenges: temporal decoupling, delivery semantics, ordering guarantees, poison message isolation, consumer lag backpressure, and transactional outbox via pure Java 21.'}
        </p>

        {/* Action Bar / Playground Banner */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/message-queue/playground"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm font-bold shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play size={16} fill="currentColor" />
            <span>{locale === 'vi' ? 'Mở Phòng Thí Nghiệm Phân Tán (Live Playground)' : 'Launch Distributed Simulator'}</span>
          </Link>
          <a
            href="#curriculum"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border-soft bg-surface/50 text-text font-mono text-sm font-medium hover:border-purple-400 hover:text-purple-400 transition-colors"
          >
            <span>{locale === 'vi' ? 'Xem 20 Bài học & Lộ trình (~4 Giờ) ↓' : 'Browse Complete Curriculum ↓'}</span>
          </a>
        </div>
      </section>

      {/* 4 Architectural Comparison Pillars Banner */}
      <section className="mx-auto max-w-wide px-6 py-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold mb-4">
          {locale === 'vi' ? '4 TRỤ CỘT ĐỐI NGHỊCH: RABBITMQ (BROKER) VS KAFKA (STREAMING LOG)' : '4 FUNDAMENTAL ARCHITECTURAL DICHOTOMIES'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-orange-400 block mb-1">
                Routing vs Sharding
              </span>
              <h4 className="text-sm font-bold text-text-main mb-1">
                Smart Broker vs Dumb Broker
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                RabbitMQ tính toán routing key phức tạp trên broker; Kafka chuyển gánh nặng tính hash partition sang client producer.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block mb-1">
                Queue vs Commit Log
              </span>
              <h4 className="text-sm font-bold text-text-main mb-1">
                Xóa sau ACK vs Replay Vĩnh viễn
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                RabbitMQ xóa message ngay khi ACK để giải phóng RAM; Kafka lưu trữ append-only trên đĩa và cho phép tua lại (time-travel).
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1">
                Push vs Pull Model
              </span>
              <h4 className="text-sm font-bold text-text-main mb-1">
                Fair Dispatch vs Consumer Polling
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                RabbitMQ chủ động push message theo Prefetch count QoS; Kafka consumer chủ động pull theo nhịp xử lý tránh OOM.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 block mb-1">
                Throughput vs Latency
              </span>
              <h4 className="text-sm font-bold text-text-main mb-1">
                Sub-millisecond vs Zero-Copy Millions
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                RabbitMQ đạt P99 &lt; 2ms cho luồng tin riêng lẻ; Kafka đạt &gt; 1,000,000 msg/s nhờ OS Page Cache và Linux sendfile().
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Filter & Navigation */}
      <section id="curriculum" className="mx-auto max-w-wide px-6 pt-10 pb-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-soft">
          <div>
            <h2 className="text-2xl font-mono font-bold text-text-main">
              {locale === 'vi' ? 'Chương trình Đào tạo Chuyên sâu' : 'Curriculum & Learning Paths'}
            </h2>
            <p className="text-xs font-mono text-text-muted mt-1">
              {locale === 'vi'
                ? 'Gồm 12 bài cốt lõi (~4 giờ học trọng tâm) và 8 chuyên đề nâng cao dành cho Senior / Staff Architect'
                : '12 core topics (~4 hours) and 8 advanced engineering deep dives'}
            </p>
          </div>

          {/* Track Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border-soft bg-surface/50 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all',
                selectedLevel === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              {locale === 'vi' ? 'Tất cả (20 bài)' : 'All 20 Topics'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('core')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all',
                selectedLevel === 'core'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              {locale === 'vi' ? '12 Bài Cốt Lõi (~4h)' : '12 Core Track (~4h)'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('advanced')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all',
                selectedLevel === 'advanced'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              {locale === 'vi' ? '8 Chuyên Đề Nâng Cao' : '8 Advanced Track'}
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all',
                    isSelected
                      ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 shadow-xs'
                      : 'border border-border-soft bg-surface/30 text-text-muted hover:text-text-main hover:border-border-soft/80'
                  )}
                >
                  <Icon size={13} className={isSelected ? 'text-purple-400' : 'text-text-soft'} />
                  <span>{tx(cat.label)}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'vi' ? 'Tìm bài học, công thức, broker...' : 'Search topics, Kafka, RabbitMQ...'}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-soft bg-surface/50 text-xs font-mono text-text-main placeholder:text-text-muted focus:outline-none focus:border-purple-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Topics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredTopics.map((topic) => {
            const catMeta = MESSAGING_CATEGORY_META[topic.category];
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border-soft bg-surface/20 hover:border-purple-500/50 hover:bg-surface/40 transition-all shadow-sm"
              >
                <div>
                  {/* Top Meta Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400">
                      {topic.chapter}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-mono font-semibold',
                          topic.level === 'core'
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        )}
                      >
                        {topic.level === 'core' ? 'Core (~4h)' : 'Advanced'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                        <Clock size={11} />
                        {topic.estimatedMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-mono font-bold text-text-main group-hover:text-purple-300 transition-colors mb-2">
                    {topic.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs text-text-muted font-sans leading-relaxed line-clamp-2 mb-4">
                    {tx(topic.tagline)}
                  </p>

                  {/* Math Formula Preview */}
                  <div className="p-2.5 rounded-lg bg-[#0c0a14] border border-border-soft/60 mb-4 overflow-hidden text-center">
                    <MathFormula
                      formula={topic.coreTheory.math.formula}
                      displayMode={false}
                      className="overflow-hidden whitespace-nowrap text-[11px] text-purple-300/80 [mask-image:linear-gradient(to_right,black_88%,transparent)]"
                    />
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-4 border-t border-border-soft/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-text-soft">
                    {tx(catMeta.label).split(' ')[0]}
                  </span>
                  <Link
                    href={`/message-queue/${topic.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{locale === 'vi' ? 'Học bài này' : 'Explore'}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm font-mono text-text-muted">
              {locale === 'vi' ? 'Không tìm thấy bài học phù hợp với bộ lọc.' : 'No topics matched your search filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedLevel('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-mono text-purple-400 underline hover:text-purple-300"
            >
              {locale === 'vi' ? 'Đặt lại bộ lọc' : 'Reset filters'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
