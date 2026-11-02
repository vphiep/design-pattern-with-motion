'use client';

import React, { useState, useEffect, useRef, useMemo, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Compass, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TopicSection {
  id: string;
  number: string;
  shortTitle: { vi: string; en: string };
  fullTitle: { vi: string; en: string };
  icon?: ElementType;
}

export interface TopicMinimapProps {
  sections: TopicSection[];
  locale?: 'vi' | 'en';
  accentColor?: 'sky' | 'rose' | 'emerald' | 'amber';
  className?: string;
}

export function TopicMinimap({
  sections,
  locale = 'vi',
  accentColor = 'sky',
  className
}: TopicMinimapProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '');
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Accent styling tokens
  const theme = useMemo(() => {
    switch (accentColor) {
      case 'rose':
        return {
          activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-500 dark:text-rose-400 shadow-xs',
          activeDot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
          progressBar: 'bg-rose-500',
          hoverText: 'hover:text-rose-500 dark:hover:text-rose-400',
          ring: 'focus:ring-rose-500/40'
        };
      case 'emerald':
        return {
          activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs',
          activeDot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          progressBar: 'bg-emerald-500',
          hoverText: 'hover:text-emerald-500 dark:hover:text-emerald-400',
          ring: 'focus:ring-emerald-500/40'
        };
      case 'amber':
        return {
          activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xs',
          activeDot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
          progressBar: 'bg-amber-500',
          hoverText: 'hover:text-amber-500 dark:hover:text-amber-400',
          ring: 'focus:ring-amber-500/40'
        };
      case 'sky':
      default:
        return {
          activeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-400 shadow-xs',
          activeDot: 'bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
          progressBar: 'bg-sky-400',
          hoverText: 'hover:text-sky-500 dark:hover:text-sky-400',
          ring: 'focus:ring-sky-500/40'
        };
    }
  }, [accentColor]);

  // Scrollspy & Scroll Progress Calculation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 1. Calculate reading progress
          const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalDocHeight > 0) {
            const currentProgress = Math.min(100, Math.max(0, (window.scrollY / totalDocHeight) * 100));
            setScrollProgress(currentProgress);
          }

          // 2. Detect currently visible section (with sticky header offset)
          const headerOffset = 140;
          let currentVisible = sections[0]?.id;

          for (const section of sections) {
            const el = document.getElementById(section.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= headerOffset + 60) {
                currentVisible = section.id;
              }
            }
          }

          if (currentVisible) {
            setActiveId(currentVisible);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Smooth scroll with sticky navbar + subheader offset
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const targetY = el.getBoundingClientRect().top + window.scrollY - 135;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
      setActiveId(id);
      setIsOpen(false);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${id}`);
      }
    }
  };

  const activeIndex = sections.findIndex((s) => s.id === activeId);
  const activeSection = sections[activeIndex >= 0 ? activeIndex : 0];

  return (
    <div ref={dropdownRef} className={cn('relative inline-flex items-center gap-2', className)}>
      {/* 1. Mobile & Popover Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface/70 px-3 py-1.5 text-xs font-mono transition-all backdrop-blur-md hover:bg-surface-elevated hover:border-text-soft/30',
          isOpen && 'border-text-soft/40 bg-surface-elevated ring-2 ring-border-soft'
        )}
        aria-expanded={isOpen}
        aria-label="Table of Contents Navigation"
      >
        <span className="flex items-center gap-1.5 font-bold">
          <Compass size={13} className={cn('transition-transform group-hover:rotate-45', theme.hoverText)} />
          <span className="text-text-muted">{locale === 'vi' ? 'Mục' : 'Sec'}</span>
          <span className={cn('font-bold', theme.hoverText)}>{activeSection?.number || '01'}</span>
        </span>

        <span className="hidden sm:inline-block max-w-[130px] truncate font-medium text-text">
          {activeSection?.shortTitle[locale]}
        </span>

        <span className="rounded-full bg-surface-elevated px-1.5 py-0.2 text-[10px] text-text-muted font-bold">
          {Math.max(1, activeIndex + 1)}/{sections.length}
        </span>

        <ChevronDown
          size={12}
          className={cn('text-text-muted transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {/* 2. Desktop Adaptive Stepper Track (Compact Chips with Auto-Expanding Active Item) */}
      <nav
        aria-label="Chapter Stepper"
        className="hidden md:inline-flex items-center gap-1 p-1 rounded-full border border-border-soft/80 bg-surface/50 backdrop-blur-md shadow-xs"
      >
        {sections.map((section, idx) => {
          const isActive = section.id === activeId;
          const Icon = section.icon;

          if (isActive) {
            return (
              <motion.button
                key={section.id}
                layout
                onClick={() => scrollTo(section.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-bold transition-colors border',
                  theme.activeBg
                )}
                title={section.fullTitle[locale]}
              >
                {Icon && <Icon size={12} className="shrink-0" />}
                <span className="text-[10px] uppercase tracking-wide opacity-80">{section.number}</span>
                <span className="truncate max-w-[110px] text-[11px]">{section.shortTitle[locale]}</span>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={section.id}
              layout
              onClick={() => scrollTo(section.id)}
              className={cn(
                'group relative flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-mono font-medium text-text-muted transition-all hover:bg-surface-elevated hover:text-text',
                theme.hoverText
              )}
              title={section.fullTitle[locale]}
            >
              <span>{section.number}</span>
              {/* Micro hover indicator dot */}
              <span className="absolute -bottom-0.5 h-0.5 w-0.5 rounded-full bg-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          );
        })}
      </nav>

      {/* 3. Popover Dropdown Menu (100% Solid Non-Transparent Background) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-2.5 z-50 w-84 sm:w-96 rounded-2xl border-2 border-border/60 dark:border-border-soft bg-[#ffffff] dark:bg-[#16130f] p-2.5 shadow-2xl shadow-black/50"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border-soft/80 bg-surface-elevated/40 dark:bg-[#1e1a14] rounded-t-xl mb-1.5">
              <div className="flex items-center gap-2">
                <Compass size={14} className={theme.hoverText} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-text">
                  {locale === 'vi' ? 'MỤC LỤC CHUYÊN ĐỀ' : 'TOPIC TABLE OF CONTENTS'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X size={13} />
              </button>
            </div>

            {/* Section List */}
            <div className="max-h-[380px] overflow-y-auto space-y-1 p-1 font-mono text-xs">
              {sections.map((section, sIdx) => {
                const isActive = section.id === activeId;
                const Icon = section.icon;

                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all',
                      isActive
                        ? cn('border', theme.activeBg)
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold',
                          isActive ? 'bg-current/10 font-black' : 'bg-surface-elevated dark:bg-[#221c16] text-text-muted'
                        )}
                      >
                        {section.number}
                      </span>
                      {Icon && <Icon size={14} className={cn('shrink-0', isActive ? 'text-current' : 'text-text-muted')} />}
                      <span className={cn('truncate text-xs', isActive ? 'font-bold text-text' : 'font-medium')}>
                        {section.fullTitle[locale]}
                      </span>
                    </div>

                    {isActive && (
                      <span className={cn('shrink-0 flex items-center gap-1 text-[10px] font-bold', theme.hoverText)}>
                        <Check size={12} />
                        <span>{locale === 'vi' ? 'Đang đọc' : 'Active'}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reading Progress Footer */}
            <div className="mt-2 border-t border-border-soft/80 bg-surface-elevated/40 dark:bg-[#1e1a14] px-3 py-2 rounded-b-xl flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>{locale === 'vi' ? 'Tiến độ đọc bài:' : 'Reading progress:'}</span>
              <span className="font-bold text-text">{Math.round(scrollProgress)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Global Reading Progress Bar (Top of screen, YouTube/GitHub style) */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-[2.5px] z-50 bg-border-soft/20">
        <div
          className={cn('h-full transition-all duration-150 ease-out shadow-xs', theme.progressBar)}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}
