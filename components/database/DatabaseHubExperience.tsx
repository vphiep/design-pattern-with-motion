'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Database,
  Cpu,
  Layers,
  GitFork,
  ArrowRight,
  Search,
  Sparkles,
  Server,
  Play,
  Terminal,
  ShieldCheck,
  Scale,
  Binary,
  HardDrive
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { getAllDatabaseTopics, DATABASE_CATEGORY_META } from '@/lib/database/data';
import type { DatabaseCategory } from '@/lib/database/types';
import { cn } from '@/lib/utils/cn';

export function DatabaseHubExperience() {
  const { tx, locale } = useLocale();
  const allTopics = getAllDatabaseTopics();
  const [selectedCategory, setSelectedCategory] = useState<DatabaseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = allTopics.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      tx(t.tagline).toLowerCase().includes(q) ||
      t.productionEngines.some((pe) => pe.engine.toLowerCase().includes(q))
    );
  });

  const categories: Array<{ id: DatabaseCategory | 'all'; label: { en: string; vi: string }; icon: any }> = [
    { id: 'all', label: { en: 'All 12 Architectures', vi: 'Tất cả 12 Kiến trúc' }, icon: Database },
    { id: 'storage-engines', label: DATABASE_CATEGORY_META['storage-engines'].label, icon: Layers },
    { id: 'indexing-techniques', label: DATABASE_CATEGORY_META['indexing-techniques'].label, icon: Search },
    { id: 'buffer-memory', label: DATABASE_CATEGORY_META['buffer-memory'].label, icon: Cpu },
    { id: 'concurrency-tx', label: DATABASE_CATEGORY_META['concurrency-tx'].label, icon: GitFork },
    { id: 'durability-wal', label: DATABASE_CATEGORY_META['durability-wal'].label, icon: ShieldCheck },
    { id: 'distributed-consensus', label: DATABASE_CATEGORY_META['distributed-consensus'].label, icon: Server }
  ];

  return (
    <div className="relative min-h-screen pb-24 text-text">
      {/* Blueprint Grid Ambient Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-soft)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Hero Section */}
      <section className="mx-auto max-w-wide px-6 pt-16 md:pt-24 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono font-medium mb-6">
          <Sparkles size={13} />
          <span>{locale === 'vi' ? 'HỌC VIỆN NỘI CƠ CSDL · DATABASE INTERNALS & STORAGE' : 'DATABASE INTERNALS & STORAGE ARCHITECTURE ACADEMY'}</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-display text-display-2xl tracking-tight max-w-4xl"
        >
          {locale === 'vi'
            ? 'Bản Chất Vật Lý & Kiến Trúc Lõi Của Các Hệ Quản Trị CSDL'
            : 'Inside the Storage Engine: Hardware Constraints & Core Algorithms'}
        </motion.h1>

        <p className="mt-5 text-lg md:text-xl text-text-soft max-w-3xl leading-relaxed">
          {locale === 'vi'
            ? 'Khám phá lý thuyết chuyên sâu và cấu trúc nhị phân trang đĩa của PostgreSQL, MySQL InnoDB và RocksDB. Từ cấu trúc Slotted Page, nén LSM-Tree, cô lập MVCC, giải thuật phục hồi ARIES đến định tuyến phân mảnh Consistent Hashing qua code Java 21.'
            : 'Deep theoretical deconstruction and binary page layouts of PostgreSQL, MySQL InnoDB, and RocksDB. From Slotted Page layouts, LSM compaction, MVCC visibility, and ARIES recovery to Consistent Hashing via pure Java 21.'}
        </p>

        {/* Action Bar / Playground Banner */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/database/playground"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-sky-500 text-white font-mono text-sm font-bold shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play size={16} fill="currentColor" />
            <span>{locale === 'vi' ? 'Mở Phòng Thí Nghiệm Tương Tác (Live Simulator)' : 'Launch Interactive Storage Simulator'}</span>
          </Link>
          <a
            href="#curriculum"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border-soft bg-surface/50 text-text font-mono text-sm font-medium hover:border-sky-400 hover:text-sky-400 transition-colors"
          >
            <span>{locale === 'vi' ? 'Khám phá 12 Chủ đề Giáo trình ↓' : 'Browse Complete 12 Topics ↓'}</span>
          </a>
        </div>
      </section>

      {/* 6 Thematic Pillars Banner */}
      <section className="mx-auto max-w-wide px-6 py-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold mb-4">
          {locale === 'vi' ? '6 TRỤ CỘT KIẾN TRÚC HỆ THỐNG' : '6 ARCHITECTURAL PILLARS'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5 flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                <Layers size={18} />
              </div>
              <h4 className="text-sm font-bold text-text mb-1.5">
                {locale === 'vi' ? 'Động cơ Lưu trữ & Cấu trúc Trang' : 'Storage Engines & Page Layouts'}
              </h4>
              <p className="text-xs text-text-soft leading-relaxed">
                {locale === 'vi'
                  ? 'B+ Tree, Slotted Page, LSM-Tree MemTable/SSTable và lưu trữ cột Columnar Parquet.'
                  : 'B+ Tree, Slotted Page (Postgres), LSM-Tree MemTable/SSTable, and Columnar Parquet.'}
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-sky-400">4 Chủ đề · B+ Tree, Slotted, LSM, Columnar</span>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5 flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <Search size={18} />
              </div>
              <h4 className="text-sm font-bold text-text mb-1.5">
                {locale === 'vi' ? 'Cấu trúc Chỉ mục & Tối ưu Tra cứu' : 'Indexing & Search Structures'}
              </h4>
              <p className="text-xs text-text-soft leading-relaxed">
                {locale === 'vi'
                  ? 'Băm động Extendible Hash, chỉ mục đảo ngữ Inverted Index và quét Bitmap tăng tốc.'
                  : 'Extendible Hash directory, Inverted Index postings lists, and bitwise Bitmap scans.'}
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-cyan-400">1 Chủ đề · Extendible Hashing</span>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Cpu size={18} />
              </div>
              <h4 className="text-sm font-bold text-text mb-1.5">
                {locale === 'vi' ? 'Quản lý Bộ nhớ đệm & Buffer Pool' : 'Buffer Pool & Cache Management'}
              </h4>
              <p className="text-xs text-text-soft leading-relaxed">
                {locale === 'vi'
                  ? 'Khung nhớ RAM, Page Table hash map, giải thuật hoán đổi Clock (Second Chance) & Direct I/O.'
                  : 'Memory frames, Page Table hash map, Clock (Second Chance) eviction, and O_DIRECT.'}
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-emerald-400">1 Chủ đề · Buffer Pool & Clock</span>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <GitFork size={18} />
              </div>
              <h4 className="text-sm font-bold text-text mb-1.5">
                {locale === 'vi' ? 'Đồng thời, Giao dịch & MVCC' : 'Concurrency & MVCC Transactions'}
              </h4>
              <p className="text-xs text-text-soft leading-relaxed">
                {locale === 'vi'
                  ? 'Dị thường giao dịch (Dirty/Phantom/Write Skew), Khóa Strict 2PL & Đa phiên bản MVCC.'
                  : 'Isolation anomalies, Strict 2PL & Deadlock detection, MVCC snapshots and Undo chains.'}
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-purple-400">3 Chủ đề · MVCC, ACID Anomalies, 2PL</span>
          </div>

          {/* Pillar 5 */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-sm font-bold text-text mb-1.5">
                {locale === 'vi' ? 'Bền vững, Nhật ký WAL & Phục hồi' : 'Durability, WAL & Crash Recovery'}
              </h4>
              <p className="text-xs text-text-soft leading-relaxed">
                {locale === 'vi'
                  ? 'Giao thức ghi trước WAL, LSN checkpointing và 3 giai đoạn phục hồi sự cố ARIES.'
                  : 'Write-Ahead Logging protocol, LSN tracking, and 3-pass ARIES crash recovery.'}
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-amber-400">2 Chủ đề · WAL Logging, ARIES</span>
          </div>

          {/* Pillar 6 */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <Server size={18} />
              </div>
              <h4 className="text-sm font-bold text-text mb-1.5">
                {locale === 'vi' ? 'CSDL Phân tán & Định tuyến Sharding' : 'Distributed Databases & Sharding'}
              </h4>
              <p className="text-xs text-text-soft leading-relaxed">
                {locale === 'vi'
                  ? 'Vòng băm nhất quán Consistent Hashing, Virtual Nodes và tái phân bổ dữ liệu tối thiểu.'
                  : 'Consistent Hash Rings, Virtual Nodes, and minimal partition key redistribution.'}
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-rose-400">1 Chủ đề · Consistent Hashing</span>
          </div>
        </div>
      </section>

      {/* Curriculum Filter & Search Bar */}
      <section id="curriculum" className="mx-auto max-w-wide px-6 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-soft pb-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors',
                    isSelected
                      ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-sm'
                      : 'border-border-soft text-text-soft hover:text-text hover:border-text-soft bg-surface'
                  )}
                >
                  <Icon size={12} />
                  <span>{tx(c.label)}</span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[280px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft" />
            <input
              type="text"
              placeholder={locale === 'vi' ? 'Tìm B-Tree, Slotted Page, ARIES...' : 'Search B-Tree, Slotted Page, ARIES...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border-soft bg-surface text-xs text-text focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>
        </div>
      </section>

      {/* Grid of All 12 Architectural Topics */}
      <section className="mx-auto max-w-wide px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic, idx) => {
            const catMeta = DATABASE_CATEGORY_META[topic.category] || DATABASE_CATEGORY_META['storage-engines'];
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  href={`/database/${topic.id}`}
                  className="group relative flex flex-col justify-between h-full rounded-2xl border border-border-soft bg-surface p-6 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
                >
                  <div>
                    {/* Header meta */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-surface border border-border-soft text-text-soft">
                        № {String(topic.order).padStart(2, '0')} · {tx(catMeta.label).split('&')[0]}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {topic.estimatedMinutes} min · Java 21
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-text group-hover:text-sky-400 transition-colors mb-2">
                      {topic.name}
                    </h2>

                    <p className="text-xs text-text-soft leading-relaxed line-clamp-3 mb-5">
                      {tx(topic.tagline)}
                    </p>

                    {/* Formula snippet badge */}
                    <div className="rounded-lg bg-bg/80 border border-border-soft p-2.5 mb-5 font-mono text-[11px] text-sky-300 truncate">
                      <code>{topic.coreTheory.math.timeComplexity}</code>
                    </div>

                    {/* Real Engine Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {topic.productionEngines.map((pe, pIdx) => (
                        <span
                          key={pIdx}
                          className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border-soft text-text-muted"
                        >
                          <Server size={10} />
                          <span>{pe.engine.split(' ')[0]}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-soft/60 flex items-center justify-between">
                    <span className="text-xs font-mono text-sky-400 font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                      <span>{locale === 'vi' ? 'Khám phá lý thuyết & code' : 'Inspect Theory & Code'}</span>
                      <ArrowRight size={14} />
                    </span>
                    <Terminal size={14} className="text-text-soft group-hover:text-sky-400 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
