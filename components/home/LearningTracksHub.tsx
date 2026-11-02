'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Compass,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { LEARNING_MODULES, type LearningModule, type ModuleStatus } from '@/lib/modules/registry';
import { ModuleCardGraphic } from './ModuleCardGraphic';
import { ModuleDevelopmentModal } from './ModuleDevelopmentModal';
import { cn } from '@/lib/utils/cn';

export function LearningTracksHub() {
  const { tx, locale } = useLocale();
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'development'>('all');

  const filteredModules = LEARNING_MODULES.filter((m) => {
    if (filter === 'available') return m.status === 'available';
    if (filter === 'development') return m.status !== 'available';
    return true;
  });

  const handleCardClick = (module: LearningModule) => {
    if (module.status === 'available') {
      router.push(module.href);
    } else {
      setSelectedModule(module);
    }
  };

  return (
    <section className="relative border-b border-border-soft pb-16 pt-12 md:pb-24 md:pt-16">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[var(--accent)]/15 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-wide px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-xs font-mono uppercase tracking-widest text-[var(--text-soft)] mb-4"
          >
            <Compass size={13} className="text-[var(--accent)]" />
            <span>Visual System Architecture Portal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--text)]"
          >
            Khám phá Kiến trúc Hệ thống,{' '}
            <span className="italic text-[var(--accent)]">trực quan.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--text-muted)] font-sans"
          >
            Chọn chủ đề bạn muốn học dưới đây. Mỗi công cụ được minh họa bằng các sơ đồ vector chuyển động 60FPS giúp bạn hiểu tường tận cơ chế hoạt động bên dưới lớp vỏ code.
          </motion.p>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="mt-8 inline-flex items-center p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)]"
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all',
                filter === 'all'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--text-soft)] hover:text-[var(--text)]'
              )}
            >
              Tất cả ({LEARNING_MODULES.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('available')}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all',
                filter === 'available'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-soft)] hover:text-[var(--text)]'
              )}
            >
              Sẵn sàng học (1)
            </button>
            <button
              type="button"
              onClick={() => setFilter('development')}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all',
                filter === 'development'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--text-soft)] hover:text-[var(--text)]'
              )}
            >
              Lộ trình đang phát triển (6)
            </button>
          </motion.div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod, index) => {
            const isAvailable = mod.status === 'available';

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.08, 0.4),
                  ease: [0.2, 0.7, 0.2, 1]
                }}
                whileHover={{ y: -5 }}
                onClick={() => handleCardClick(mod)}
                className={cn(
                  'group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 sm:p-6 cursor-pointer',
                  'transition-all duration-300 ease-editorial bg-[var(--surface)]',
                  isAvailable
                    ? 'border-[var(--accent)]/60 shadow-lg hover:shadow-2xl hover:border-[var(--accent)] ring-1 ring-[var(--accent)]/20'
                    : 'border-[var(--border-soft)] hover:border-[var(--border)] hover:shadow-md opacity-95 hover:opacity-100'
                )}
                style={{
                  boxShadow: isAvailable
                    ? '0 10px 30px -10px rgba(232, 93, 4, 0.15)'
                    : undefined
                }}
              >
                {/* Accent top border strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
                  style={{ backgroundColor: mod.accent }}
                />

                <div>
                  {/* Top Header: Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="caption text-[var(--text-soft)] text-[10px]">
                      {tx(mod.category)}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border',
                        isAvailable
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-semibold'
                          : 'border-[var(--border-soft)] text-[var(--text-soft)] bg-[var(--bg-elevated)]'
                      )}
                    >
                      {isAvailable ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping mr-0.5" />
                      ) : (
                        <Lock size={10} className="mr-0.5 opacity-70" />
                      )}
                      {tx(mod.badgeText)}
                    </span>
                  </div>

                  {/* Module Title */}
                  <h3 className="text-display text-xl sm:text-2xl font-semibold text-[var(--text)] transition-colors group-hover:text-[var(--accent)] flex items-center justify-between">
                    <span>{mod.name}</span>
                    {isAvailable ? (
                      <ArrowUpRight
                        size={18}
                        className="text-[var(--accent)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    ) : (
                      <span className="text-xs font-mono text-[var(--text-soft)]">
                        {tx(mod.estimatedDate)}
                      </span>
                    )}
                  </h3>

                  {/* Tagline */}
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
                    {tx(mod.tagline)}
                  </p>

                  {/* Interactive Graphic / SVG Preview */}
                  <div className="mt-4 mb-4">
                    <ModuleCardGraphic moduleId={mod.id} accent={mod.accent} />
                  </div>

                  {/* Bullet Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-soft)]/60">
                    {(mod.highlights[locale] || mod.highlights.en).slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-[var(--text-soft)]">
                        <span
                          className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: mod.accent }}
                        />
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-3 border-t border-[var(--border-soft)] flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-soft)]">
                    {mod.topicsCount} bài học chuyên sâu
                  </span>

                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] group-hover:underline">
                      <span>Bắt đầu học ngay</span>
                      <ArrowRight size={13} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] group-hover:text-[var(--text)]">
                      <span>Xem lộ trình</span>
                      <span className="text-[10px] font-mono">→</span>
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick jump to patterns atlas */}
        <div className="mt-12 text-center">
          <a
            href="#patterns-atlas"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-2"
          >
            <span>↓ Hoặc xem trực tiếp bản đồ 23 GoF Design Patterns</span>
          </a>
        </div>
      </div>

      {/* Development Feedback Modal */}
      <ModuleDevelopmentModal
        module={selectedModule}
        onClose={() => setSelectedModule(null)}
      />
    </section>
  );
}
