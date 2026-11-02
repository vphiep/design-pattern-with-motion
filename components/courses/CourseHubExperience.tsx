'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Layers, Search, Sparkles } from 'lucide-react';
import { MathFormula } from '@/components/MathFormula';
import { useLocale } from '@/components/LocaleProvider';
import type { CourseDefinition, CourseLevel } from '@/lib/courses/types';
import { COURSE_LEVEL_LABELS, courseLevelLabel, topicMatchesLevel } from '@/lib/courses/helpers';
import { cn } from '@/lib/utils/cn';
import { COURSE_THEMES, LEVEL_BADGES } from './theme';

interface CourseHubExperienceProps {
  course: CourseDefinition;
}

export function CourseHubExperience({ course }: CourseHubExperienceProps) {
  const { tx, locale } = useLocale();
  const lang = locale === 'vi' ? 'vi' : 'en';
  const theme = COURSE_THEMES[course.accent];
  const topics = course.topics;
  const totalMinutes = topics.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = topics.filter((t) => {
    if (selectedLevel !== 'all' && !topicMatchesLevel(t, selectedLevel)) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || tx(t.tagline).toLowerCase().includes(q);
  });

  const categoryIds = Object.keys(course.categories);
  const levelButtons: Array<{ id: CourseLevel | 'all'; label: string }> = [
    {
      id: 'all',
      label: lang === 'vi' ? `Tất cả (${topics.length} bài)` : `All ${topics.length} topics`
    },
    ...(['beginner', 'intermediate', 'advanced'] as const)
      .map((level) => ({
        id: level,
        count: topics.filter((t) => topicMatchesLevel(t, level)).length,
        label: COURSE_LEVEL_LABELS[level][lang]
      }))
      .filter((b) => b.count > 0)
      .map((b) => ({ id: b.id, label: `${b.label} (${b.count})` }))
  ];

  return (
    <div className="relative min-h-screen pb-24 text-text">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-soft)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      <section className="mx-auto max-w-wide px-6 pt-16 md:pt-24 pb-12">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium mb-6',
            theme.badge
          )}
        >
          <Sparkles size={13} />
          <span>{tx(course.hero.eyebrow)}</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-display text-display-2xl tracking-tight max-w-5xl"
        >
          {tx(course.hero.title)}
        </motion.h1>

        <p className="mt-5 text-lg md:text-xl text-text-soft max-w-3xl leading-relaxed font-sans">
          {tx(course.hero.subtitle)}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={`${course.basePath}/${topics[0].id}`}
            className={cn(
              'inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-white font-mono text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all',
              theme.solidButton
            )}
          >
            <span>{lang === 'vi' ? 'Bắt đầu bài 01' : 'Start with lesson 01'}</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="#curriculum"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border-soft bg-surface/50 text-text font-mono text-sm font-medium transition-colors hover:border-text-soft"
          >
            {lang === 'vi'
              ? `Xem ${topics.length} bài học (~${Math.round(totalMinutes / 60)} giờ) ↓`
              : `Browse ${topics.length} lessons (~${Math.round(totalMinutes / 60)}h) ↓`}
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-wide px-6 py-6">
        <h3
          className={cn('text-xs font-mono uppercase tracking-widest font-bold mb-4', theme.text)}
        >
          {tx(course.pillarsHeading)}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {course.pillars.map((p) => (
            <div key={p.tag} className={cn('rounded-xl border p-4', theme.softPanel)}>
              <span
                className={cn('text-[10px] font-mono font-bold uppercase block mb-1', theme.text)}
              >
                {p.tag}
              </span>
              <h4 className="text-sm font-bold text-text-main mb-1">{tx(p.title)}</h4>
              <p className="text-xs text-text-muted leading-relaxed">{tx(p.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="curriculum"
        className="mx-auto max-w-wide px-6 pt-10 pb-6 space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-soft">
          <div>
            <h2 className="text-2xl font-mono font-bold text-text-main">
              {lang === 'vi' ? 'Chương trình học' : 'Curriculum'}
            </h2>
            <p className="text-xs font-mono text-text-muted mt-1">
              {categoryIds.map((id) => course.categories[id].chapter).join(' · ')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border-soft bg-surface/50 self-start md:self-auto">
            {levelButtons.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedLevel(b.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all',
                  selectedLevel === b.id ? theme.pillActive : 'text-text-muted hover:text-text-main'
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['all', ...categoryIds].map((id) => {
              const isSelected = selectedCategory === id;
              const label =
                id === 'all'
                  ? lang === 'vi'
                    ? 'Tất cả chương'
                    : 'All chapters'
                  : `${course.categories[id].chapter} · ${tx(course.categories[id].label)}`;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedCategory(id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all',
                    isSelected
                      ? theme.pillActive
                      : 'border border-border-soft bg-surface/30 text-text-muted hover:text-text-main'
                  )}
                >
                  <Layers size={13} className={isSelected ? theme.text : 'text-text-soft'} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <div className="relative min-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'vi' ? 'Tìm bài học…' : 'Search lessons…'}
              aria-label={lang === 'vi' ? 'Tìm bài học' : 'Search lessons'}
              className={cn(
                'w-full pl-9 pr-4 py-2 rounded-xl border border-border-soft bg-surface/50 text-xs font-mono text-text-main placeholder:text-text-muted focus:outline-none transition-colors',
                theme.focus
              )}
            />
          </div>
        </div>

        {categoryIds
          .filter((id) => selectedCategory === 'all' || selectedCategory === id)
          .map((catId) => {
            const cat = course.categories[catId];
            const inChapter = filteredTopics.filter((t) => t.category === catId);
            if (inChapter.length === 0) return null;
            return (
              <div key={catId} className="space-y-4 pt-4">
                <div>
                  <h3
                    className={cn(
                      'text-sm font-mono font-bold uppercase tracking-wider',
                      theme.text
                    )}
                  >
                    {cat.chapter} — {tx(cat.label)}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">{tx(cat.description)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inChapter.map((topic) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        'group relative flex flex-col justify-between p-6 rounded-2xl border border-border-soft bg-surface/20 hover:bg-surface/40 transition-all shadow-sm',
                        theme.cardHover
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={cn(
                              'text-[11px] font-mono font-bold uppercase tracking-wider',
                              theme.text
                            )}
                          >
                            {topic.roadmapId ??
                              `${lang === 'vi' ? 'Bài' : 'Lesson'} ${String(topic.order).padStart(2, '0')}`}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-mono font-semibold',
                                LEVEL_BADGES[topic.levelTo ?? topic.level]
                              )}
                            >
                              {courseLevelLabel(topic, lang)}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                              <Clock size={11} />
                              {topic.estimatedMinutes}m
                            </span>
                          </div>
                        </div>
                        <h3
                          className={cn(
                            'text-lg font-mono font-bold text-text-main transition-colors mb-2',
                            theme.groupHoverText
                          )}
                        >
                          <Link
                            href={`${course.basePath}/${topic.id}`}
                            className="after:absolute after:inset-0"
                          >
                            {topic.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-text-muted font-sans leading-relaxed line-clamp-3 mb-4">
                          {tx(topic.tagline)}
                        </p>
                        <div className="p-2.5 rounded-lg bg-surface/60 border border-border-soft/60 mb-4 overflow-hidden text-center">
                          <MathFormula
                            formula={topic.coreTheory.math.formula}
                            displayMode={false}
                            className="overflow-hidden whitespace-nowrap text-[11px] text-text-muted [mask-image:linear-gradient(to_right,black_88%,transparent)]"
                          />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border-soft/60 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-text-soft">
                          {topic.steps.length} {lang === 'vi' ? 'bước hoạt họa' : 'animated steps'}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 text-xs font-mono font-bold group-hover:translate-x-0.5 transition-all',
                            theme.text
                          )}
                        >
                          {lang === 'vi' ? 'Học bài này' : 'Explore'}
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

        {filteredTopics.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm font-mono text-text-muted">
              {lang === 'vi'
                ? 'Không tìm thấy bài học phù hợp với bộ lọc.'
                : 'No lessons matched your filters.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedLevel('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className={cn('text-xs font-mono underline', theme.text)}
            >
              {lang === 'vi' ? 'Đặt lại bộ lọc' : 'Reset filters'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
