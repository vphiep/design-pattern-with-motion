'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wrench,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  BookOpen,
  Cpu
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { ProfileAvatar } from '@/components/home/ProfileAvatar';
import type { LearningModule } from '@/lib/modules/registry';
import { cn } from '@/lib/utils/cn';

interface ModuleLabViewProps {
  module: LearningModule;
}

export function ModuleLabView({ module }: ModuleLabViewProps) {
  const { tx, locale } = useLocale();

  const highlights = module.highlights[locale] || module.highlights.en;
  const upcomingFeatures = module.upcomingFeatures[locale] || module.upcomingFeatures.en;

  return (
    <div className="relative min-h-screen bg-[var(--bg)] pb-24 pt-8">
      {/* Background ambient gradient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden opacity-30 dark:opacity-20">
        <div
          className="absolute left-1/2 -top-24 h-[500px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${module.accent} 0%, transparent 70%)`
          }}
        />
      </div>

      <div className="relative mx-auto max-w-wide px-6">
        {/* Top Breadcrumb & Switcher link */}
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[var(--text-soft)]">
            <Link
              href="/"
              className="flex items-center gap-1.5 transition-colors hover:text-[var(--text)]"
            >
              <ArrowLeft size={13} />
              <span>Tất cả chuyên đề</span>
            </Link>
            <span>/</span>
            <span className="text-[var(--text)]">{module.name}</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-1 text-[11px] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            <span>Đổi chuyên đề khác</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-12">
          {/* Left: Avatar Card & Status */}
          <div className="flex flex-col items-center md:col-span-4 md:items-start">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative h-44 w-44 overflow-hidden rounded-2xl border-2 p-1.5 shadow-2xl"
              style={{
                borderColor: module.accent,
                boxShadow: `0 20px 40px -12px ${module.accent}40`
              }}
            >
              <ProfileAvatar id={module.id} name={module.name} accent={module.accent} />
            </motion.div>

            {/* Development badge */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold"
                style={{
                  color: module.accent,
                  borderColor: module.accentBorder,
                  backgroundColor: module.accentBg
                }}
              >
                <Wrench size={12} className="animate-pulse" />
                {tx(module.badgeText)}
              </span>

              <span className="flex items-center gap-1 font-mono text-xs text-[var(--text-soft)]">
                <Calendar size={12} />
                {tx(module.estimatedDate)}
              </span>
            </div>

            {/* Prompt CTA to Design Patterns */}
            <div className="mt-6 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="caption text-[var(--text-soft)]">Đang chờ ra mắt?</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                Trong lúc phòng lab này đang được xây dựng, bạn có thể thực hành ngay với <strong>23 GoF Design Patterns</strong> đã hoàn thiện 100% với animation và code Java.
              </p>
              <Link
                href="/design-systems"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 font-mono text-xs font-semibold text-white shadow transition-all hover:bg-[var(--accent-strong)]"
              >
                <Sparkles size={13} />
                <span>Vào học Design Patterns ngay</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right: Module Description & Syllabus Details */}
          <div className="md:col-span-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-soft)]">
              {tx(module.category)} · Giai đoạn {module.roadmapPhase}
            </p>
            <h1 className="text-display mt-2 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl md:text-5xl">
              {module.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              {tx(module.description)}
            </p>

            {/* Under Construction Notice Banner */}
            <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/70 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 font-medium text-[var(--text)]">
                <Cpu size={18} style={{ color: module.accent }} />
                <span>Học phần này đang trong quá trình phát triển trực quan</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                Chúng tôi đang xây dựng các sơ đồ động SVG, mô phỏng chuyển động trực quan từng bước (step-by-step animations) cùng các bài thực hành Java chuẩn production cho chuyên đề này.
              </p>
            </div>

            {/* Syllabus / Highlights Section */}
            <div className="mt-10">
              <h2 className="caption flex items-center gap-2 text-sm text-[var(--text)]">
                <Layers size={14} style={{ color: module.accent }} />
                Lộ trình chủ đề sẽ triển khai ({module.topicsCount} bài học dự kiến)
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-3.5 transition-colors hover:border-[var(--accent)]/50"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-mono font-semibold"
                      style={{
                        backgroundColor: module.accentBg,
                        color: module.accent
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[var(--text)] leading-snug">{item}</p>
                      <span className="mt-1 inline-block font-mono text-[10px] text-[var(--text-soft)]">
                        Sắp có sơ đồ động
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Interactive Sandboxes */}
            {upcomingFeatures.length > 0 && (
              <div className="mt-8 border-t border-[var(--border-soft)] pt-6">
                <h3 className="caption flex items-center gap-2 text-xs text-[var(--text-soft)]">
                  <Code2 size={13} style={{ color: module.accent }} />
                  Khu vực mô phỏng tương tác (Interactive Sandboxes dự kiến):
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {upcomingFeatures.map((feat, idx) => (
                    <li
                      key={idx}
                      className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-3 py-1.5 font-mono text-xs text-[var(--text-muted)]"
                    >
                      ✦ {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
