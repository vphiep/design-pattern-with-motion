'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Cpu,
  Layers,
  ArrowRight,
  Search,
  Zap,
  Play,
  Terminal,
  ShieldCheck,
  Binary,
  Code2,
  Sparkles,
  GitBranch,
  Clock,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { getAllJavaCoreTopics, JAVA_CORE_CATEGORY_META } from '@/lib/javacore/data';
import type { JavaCoreCategory, JavaCoreLevel } from '@/lib/javacore/types';
import { cn } from '@/lib/utils/cn';

export function JavaCoreHubExperience() {
  const { tx, locale } = useLocale();
  const allTopics = getAllJavaCoreTopics();
  const [selectedLevel, setSelectedLevel] = useState<JavaCoreLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<JavaCoreCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const basicCount = allTopics.filter((t) => t.level === 'basic').length;
  const advancedCount = allTopics.filter((t) => t.level === 'advanced').length;

  const filteredTopics = allTopics.filter((t) => {
    if (selectedLevel !== 'all' && t.level !== selectedLevel) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      tx(t.tagline).toLowerCase().includes(q) ||
      t.productionJvmEngines.some((pe) => pe.jvmEngine.toLowerCase().includes(q))
    );
  });

  const categories: Array<{ id: JavaCoreCategory | 'all'; label: { en: string; vi: string }; icon: any }> = [
    { id: 'all', label: { en: 'All Categories', vi: 'Tất cả Danh mục' }, icon: Cpu },
    { id: 'java-fundamentals', label: JAVA_CORE_CATEGORY_META['java-fundamentals'].label, icon: BookOpen },
    { id: 'jvm-memory', label: JAVA_CORE_CATEGORY_META['jvm-memory'].label, icon: Binary },
    { id: 'concurrency-juc', label: JAVA_CORE_CATEGORY_META['concurrency-juc'].label, icon: Zap },
    { id: 'collections-internals', label: JAVA_CORE_CATEGORY_META['collections-internals'].label, icon: Layers },
    { id: 'advanced-features', label: JAVA_CORE_CATEGORY_META['advanced-features'].label, icon: Code2 }
  ];

  return (
    <div className="relative min-h-screen pb-24 text-text">
      {/* Blueprint Grid Ambient Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-soft)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Hero Section */}
      <section className="mx-auto max-w-wide px-6 pt-16 md:pt-24 pb-12">
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 font-mono text-xs font-medium text-emerald-500">
            <Sparkles size={14} />
            <span>Phase 1 &middot; Java Fundamentals &amp; HotSpot JVM Internals</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-mono">
            Java Core &amp; JVM Internals
          </h1>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            {locale === 'vi'
              ? 'Lộ trình toàn diện từ nền tảng Java Core (Pass-by-Value, String Pool, Đa hình vtable) đến cơ chế sâu nhất của HotSpot JVM: 64-bit Mark Word, JMM CPU memory barriers, AQS, Virtual Threads và ZGC.'
              : 'Complete engineering roadmap from Java Core fundamentals (Pass-by-Value, String Pool, Polymorphism vtable) to deep HotSpot JVM internals: 64-bit Mark Word, JMM CPU barriers, AQS, Virtual Threads, and ZGC.'}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-left">
            <div className="rounded-xl border border-border-soft bg-surface p-4">
              <span className="text-[10px] font-mono text-text-muted uppercase block">Curriculum</span>
              <span className="font-mono text-xl font-bold text-rose-500">{allTopics.length} Core Topics</span>
              <span className="text-[11px] text-text-muted block mt-1">
                {basicCount} Cơ bản &middot; {advancedCount} Nâng cao
              </span>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-4">
              <span className="text-[10px] font-mono text-text-muted uppercase block">Hardware Physics</span>
              <span className="font-mono text-xl font-bold text-amber-500">L1/L2/L3 &amp; Futex</span>
              <span className="text-[11px] text-text-muted block mt-1">CPU Cache &amp; Kernel OS</span>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-4">
              <span className="text-[10px] font-mono text-text-muted uppercase block">Runtime Baseline</span>
              <span className="font-mono text-xl font-bold text-emerald-500">Java 21 LTS</span>
              <span className="text-[11px] text-text-muted block mt-1">HotSpot &middot; ZGC &middot; Loom</span>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-4">
              <span className="text-[10px] font-mono text-text-muted uppercase block">Interview Prep</span>
              <span className="font-mono text-xl font-bold text-sky-500">100% FAANG Q&amp;A</span>
              <span className="text-[11px] text-text-muted block mt-1">Traps &amp; Model Answers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Level Toolbar */}
      <section className="mx-auto max-w-wide px-6 pb-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border-soft pb-6">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Level Switcher (Cơ bản / Nâng cao) Styled like LocaleSwitcher */}
            <div
              role="group"
              aria-label="Level Switcher"
              className="inline-flex rounded-xl border border-border-soft bg-surface p-1 shadow-sm shrink-0"
            >
              <button
                type="button"
                onClick={() => setSelectedLevel('all')}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold transition-all',
                  selectedLevel === 'all'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-text-muted hover:bg-surface-elevated hover:text-text'
                )}
              >
                {locale === 'vi' ? `Tất cả (${allTopics.length})` : `All (${allTopics.length})`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedLevel('basic')}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold transition-all flex items-center gap-1.5',
                  selectedLevel === 'basic'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-text-muted hover:bg-surface-elevated hover:text-text'
                )}
              >
                <span>{locale === 'vi' ? 'Cơ bản' : 'Fundamentals'}</span>
                <span className="text-[10px] opacity-80">({basicCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLevel('advanced')}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold transition-all flex items-center gap-1.5',
                  selectedLevel === 'advanced'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-text-muted hover:bg-surface-elevated hover:text-text'
                )}
              >
                <span>{locale === 'vi' ? 'Nâng cao' : 'Advanced (JVM)'}</span>
                <span className="text-[10px] opacity-80">({advancedCount})</span>
              </button>
            </div>

            <div className="h-6 w-px bg-border-soft hidden sm:block" />

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-medium transition-all',
                      isSelected
                        ? 'bg-surface-elevated text-text border border-rose-500/50 shadow-sm'
                        : 'border border-border-soft bg-surface hover:bg-surface-elevated text-text-muted hover:text-text'
                    )}
                  >
                    <Icon size={13} />
                    <span>{tx(cat.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'vi' ? 'Tìm theo tên, cờ JVM...' : 'Search by name, JVM flags...'}
              className="w-full rounded-xl border border-border-soft bg-surface pl-10 pr-4 py-2 font-mono text-xs text-text placeholder:text-text-muted/60 focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="mx-auto max-w-wide px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic, idx) => {
            const cat = JAVA_CORE_CATEGORY_META[topic.category];
            const isBasic = topic.level === 'basic';
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
              >
                <Link
                  href={`/java-core/${topic.id}`}
                  className="group flex flex-col justify-between h-full rounded-2xl border border-border-soft bg-surface hover:border-rose-500/50 hover:bg-surface-elevated transition-all duration-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Card Header: Level Badge, Category & Read Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                            isBasic
                              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                              : 'border border-rose-500/30 bg-rose-500/10 text-rose-500'
                          )}
                        >
                          {isBasic
                            ? locale === 'vi' ? 'Cơ bản' : 'Fundamentals'
                            : locale === 'vi' ? 'Nâng cao' : 'Advanced'}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted truncate max-w-[130px]">
                          {tx(cat.label)}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-muted">
                        <Clock size={12} />
                        {topic.estimatedMinutes} {locale === 'vi' ? 'phút' : 'min'}
                      </span>
                    </div>

                    {/* Topic Name */}
                    <h2 className="text-lg font-bold font-mono text-text group-hover:text-rose-500 transition-colors line-clamp-2">
                      {topic.name}
                    </h2>

                    {/* Tagline */}
                    <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
                      {tx(topic.tagline)}
                    </p>

                    {/* Step pills preview */}
                    <div className="space-y-1.5 pt-2 border-t border-border-soft/60">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted/80 block">
                        {locale === 'vi' ? '3 Bước Chuyển Động Nhân:' : '3-Step Mechanism Flow:'}
                      </span>
                      <div className="flex flex-col gap-1">
                        {topic.steps.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-2 font-mono text-[11px] text-text-muted"
                          >
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                isBasic ? 'bg-emerald-500' : 'bg-rose-500'
                              )}
                            />
                            <span className="line-clamp-1">{tx(s.title)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Interview Q&A Badge & Action Link */}
                  <div className="pt-6 mt-4 border-t border-border-soft/60 flex items-center justify-between">
                    {topic.interviewQuestions && topic.interviewQuestions.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-500">
                        <GraduationCap size={12} />
                        <span>{topic.interviewQuestions.length} {locale === 'vi' ? 'câu hỏi phỏng vấn' : 'Q&As'}</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-emerald-500 font-bold truncate max-w-[150px]">
                        {topic.productionJvmEngines[0]?.defaultFlags || 'Java 21'}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-rose-500 group-hover:translate-x-1 transition-transform">
                      <span>{locale === 'vi' ? 'Mổ xẻ' : 'Explore'}</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-24 space-y-3">
            <p className="font-mono text-sm text-text-muted">
              {locale === 'vi' ? 'Không tìm thấy chuyên đề phù hợp với bộ lọc.' : 'No topics found matching your active filters.'}
            </p>
            <button
              onClick={() => {
                setSelectedLevel('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="rounded-xl border border-border-soft bg-surface px-4 py-2 font-mono text-xs text-rose-500 hover:bg-surface-elevated"
            >
              {locale === 'vi' ? 'Xóa toàn bộ bộ lọc' : 'Clear all filters'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
