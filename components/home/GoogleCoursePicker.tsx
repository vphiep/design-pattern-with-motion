'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Compass,
  Search,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Lock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useSearch } from '@/components/SearchProvider';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { LEARNING_MODULES, type LearningModule } from '@/lib/modules/registry';
import { CourseCardBanner } from './CourseCardBanner';
import { ModuleDevelopmentModal } from './ModuleDevelopmentModal';
import { cn } from '@/lib/utils/cn';

export function GoogleCoursePicker() {
  const { tx, locale } = useLocale();
  const { theme, toggle: toggleTheme } = useTheme();
  const { open: openSearch } = useSearch();
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);

  const total = LEARNING_MODULES.length;
  const currentModule = LEARNING_MODULES[activeIndex];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(total - 1, prev + 1));
  }, [total]);

  // Keyboard navigation support (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  const handleCardAction = (module: LearningModule) => {
    if (module.status === 'available') {
      router.push(module.href);
    } else {
      setSelectedModule(module);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden flex flex-col justify-between py-4 sm:py-6 px-4 sm:px-8 lg:px-12 select-none bg-[var(--bg)]">
      {/* Dynamic Ambient Glow matching the active card accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          key={currentModule.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 0.7 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${currentModule.accent} 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Top Header Row (Google Academy Branding) */}
      <header className="relative z-20 w-full flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--accent)] shadow-sm">
              <Compass size={16} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col">
              <span className="text-display text-base font-bold leading-none text-[var(--text)]">
                Design&nbsp;Patterns
                <span className="mx-1 text-[var(--text-soft)]">/</span>
                <span className="italic text-[var(--text-muted)] font-normal">visually</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-soft)] mt-0.5">
                Engineering Academy
              </span>
            </div>
          </Link>
        </div>

        {/* Top-Right Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface)]/90 hover:border-[var(--accent)] text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-all shadow-sm"
            aria-label="Search Cmd+K"
          >
            <Search size={13} className="text-[var(--accent)]" />
            <span className="hidden sm:inline font-sans text-xs">Tìm kiếm</span>
            <kbd className="hidden sm:inline font-mono text-[10px] px-1 py-0.5 rounded border border-[var(--border-soft)] bg-[var(--bg)] text-[var(--text-soft)]">
              ⌘K
            </kbd>
          </button>

          <LocaleSwitcher />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            className="p-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)]/90 hover:border-[var(--accent)] text-[var(--text)] transition-all shadow-sm"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* Center Section: Heading + Horizontal Big Card Carousel */}
      <main className="relative z-10 w-full flex flex-col items-center justify-center my-auto">
        {/* Centered Heading */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text)]"
          >
            Hôm nay bạn muốn học gì?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mt-1.5 text-xs sm:text-sm text-[var(--text-muted)] font-sans"
          >
            Nhấn vào thẻ đang chọn để vào học, hoặc dùng phím ← → để chuyển chuyên đề.
          </motion.p>
        </div>

        {/* Carousel Viewport Container */}
        <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={cn(
              'absolute left-0 sm:left-2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
              'border border-[var(--border-soft)] bg-[var(--surface)]/95 backdrop-blur-md shadow-xl text-[var(--text)]',
              'transition-all duration-200',
              activeIndex === 0
                ? 'opacity-25 cursor-not-allowed'
                : 'hover:scale-110 hover:border-[var(--accent)] hover:shadow-2xl'
            )}
            aria-label="Previous Course"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === total - 1}
            className={cn(
              'absolute right-0 sm:right-2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
              'border border-[var(--border-soft)] bg-[var(--surface)]/95 backdrop-blur-md shadow-xl text-[var(--text)]',
              'transition-all duration-200',
              activeIndex === total - 1
                ? 'opacity-25 cursor-not-allowed'
                : 'hover:scale-110 hover:border-[var(--accent)] hover:shadow-2xl'
            )}
            aria-label="Next Course"
          >
            <ChevronRight size={22} />
          </button>

          {/* Horizontal Sliding Carousel Track */}
          <div className="w-full overflow-hidden px-8 sm:px-14 py-3">
            <motion.div
              className="flex items-center gap-6 sm:gap-7"
              animate={{
                // Compute offset so the active card is centered or shifts smoothly
                x: `calc(50% - ${activeIndex * 370 + 175}px)`
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 28
              }}
            >
              {LEARNING_MODULES.map((mod, index) => {
                const isActive = index === activeIndex;
                const isAvailable = mod.status === 'available';
                const highlights = mod.highlights[locale] || mod.highlights.en;

                return (
                  <motion.div
                    key={mod.id}
                    onClick={() => {
                      if (isActive) {
                        handleCardAction(mod);
                      } else {
                        setActiveIndex(index);
                      }
                    }}
                    animate={{
                      scale: isActive ? 1.02 : 0.94,
                      opacity: isActive ? 1 : 0.55
                    }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'shrink-0 w-[310px] sm:w-[350px] md:w-[370px] h-[390px] sm:h-[415px] rounded-3xl overflow-hidden cursor-pointer',
                      'flex flex-col justify-between border-2 bg-[var(--surface)] transition-all duration-300',
                      isActive ? 'shadow-2xl' : 'shadow-md hover:opacity-80'
                    )}
                    style={{
                      borderColor: isActive
                        ? isAvailable
                          ? 'var(--accent)'
                          : mod.accent
                        : 'var(--border-soft)'
                    }}
                  >
                    {/* Card Top Banner with Vector Artwork */}
                    <div className="relative">
                      <CourseCardBanner id={mod.id} name={mod.name} accent={mod.accent} />

                      {/* Category Chip (Top-Left) */}
                      <div className="absolute top-3.5 left-3.5 z-20">
                        <span className="px-3 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white/95 font-mono text-[10px] uppercase tracking-wider border border-white/10">
                          {tx(mod.category)}
                        </span>
                      </div>

                      {/* Status Badge (Top-Right) */}
                      <div className="absolute top-3.5 right-3.5 z-20">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/95 dark:bg-black/85 backdrop-blur-md text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold border border-emerald-500/30 shadow-md">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Sẵn sàng học</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white/90 font-mono text-[11px] border border-white/20 shadow-sm">
                            <Lock size={11} />
                            <span>Giai đoạn {mod.roadmapPhase}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)] line-clamp-1">
                          {mod.name}
                        </h2>

                        <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                          {tx(mod.tagline)}
                        </p>
                      </div>

                      {/* Topic Highlights Chips */}
                      <div className="my-2">
                        <div className="flex flex-wrap gap-1.5">
                          {highlights.slice(0, 3).map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[10px] font-mono text-[var(--text-soft)] truncate max-w-[210px]"
                            >
                              {item.split(':')[0]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Prompt Footer */}
                      <div className="pt-3 border-t border-[var(--border-soft)] flex items-center justify-between">
                        {isActive ? (
                          isAvailable ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
                              <span>Nhấn vào thẻ để vào học</span>
                              <ArrowRight size={14} className="animate-pulse" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-soft)]">
                              <Lock size={12} />
                              <span>Nhấn vào thẻ để xem đề cương</span>
                              <ArrowRight size={13} />
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-between w-full text-[11px] text-[var(--text-soft)]">
                            <span>Nhấn để chọn chuyên đề</span>
                            <span className="font-mono text-[10px]">0{index + 1}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Controls: Carousel Pagination Dots & Shortcut */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Carousel Indicators / Dots */}
        <div className="flex items-center gap-2">
          {LEARNING_MODULES.map((mod, i) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-8 bg-[var(--accent)] shadow-sm'
                  : 'w-2 bg-[var(--border)] hover:bg-[var(--text-soft)]'
              )}
              aria-label={`Go to slide ${i + 1}: ${mod.name}`}
            />
          ))}

          <span className="ml-2 font-mono text-xs text-[var(--text-soft)]">
            0{activeIndex + 1} / 0{total} · <strong className="text-[var(--text)]">{currentModule.name}</strong>
          </span>
        </div>

        {/* Quick Start Action */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleCardAction(LEARNING_MODULES[0])}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] transition-all shadow-md"
          >
            <Sparkles size={12} />
            <span>Vào học Design Patterns (Sẵn sàng)</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </footer>

      {/* Modal Dialog when inspecting in-development modules */}
      <ModuleDevelopmentModal
        module={selectedModule}
        onClose={() => setSelectedModule(null)}
      />
    </div>
  );
}

// Export both names for backwards compatibility
export { GoogleCoursePicker as NetflixProfilePicker };
