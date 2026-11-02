'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight, Sparkles, Calendar, Layers, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/components/LocaleProvider';
import type { LearningModule } from '@/lib/modules/registry';
import { cn } from '@/lib/utils/cn';

interface ModuleDevelopmentModalProps {
  module: LearningModule | null;
  onClose: () => void;
}

export function ModuleDevelopmentModal({ module, onClose }: ModuleDevelopmentModalProps) {
  const { tx, locale } = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!module || !mounted) return null;

  const handleGoToDesignSystems = () => {
    onClose();
    router.push('/design-systems');
  };

  const handleGoToModulePage = () => {
    onClose();
    router.push(module.href);
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Dark backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Dialog Card (Google Material 3 style) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className={cn(
            'relative z-10 w-full max-w-lg my-auto rounded-3xl border border-[var(--border)]',
            'bg-[var(--surface)] shadow-2xl p-6 sm:p-7 text-[var(--text)]',
            'max-h-[85vh] flex flex-col justify-between overflow-hidden'
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Header Accent Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: module.accent }}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-soft)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          {/* Scrollable content body */}
          <div className="overflow-y-auto pr-1 -mr-1">
            {/* Status & Category Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3 mt-1">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-medium border"
                style={{
                  color: module.accent,
                  borderColor: module.accentBorder,
                  backgroundColor: module.accentBg
                }}
              >
                <Lock size={11} />
                <span>Giai đoạn {module.roadmapPhase} · Đang phát triển</span>
              </span>

              <span className="text-xs text-[var(--text-soft)] font-mono flex items-center gap-1">
                <Calendar size={11} />
                {tx(module.estimatedDate)}
              </span>
            </div>

            {/* Title & Tagline */}
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">
              {module.name}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {tx(module.tagline)}
            </p>

            {/* Planned topics preview */}
            <div className="border-t border-b border-[var(--border-soft)] py-3.5 my-4">
              <p className="text-xs font-medium text-[var(--text-soft)] mb-2 flex items-center gap-1.5">
                <Layers size={13} style={{ color: module.accent }} />
                <span>Nội dung đang được xây dựng trực quan:</span>
              </p>
              <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {(module.highlights[locale] || module.highlights.en).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text)]">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: module.accent }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendation callout */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] mb-4">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                💡 <span className="font-semibold text-[var(--text)]">Gợi ý học tập:</span> Chuyên đề này đang trong lộ trình phát triển. Bạn có thể xem trước trang đề cương hoặc học ngay <strong>23 GoF Design Patterns</strong> đã hoàn thiện trọn vẹn với animation và Java code!
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-3 pt-3 border-t border-[var(--border-soft)] flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleGoToModulePage}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-full text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <span>Xem trang {module.name.split('&')[0].trim()}</span>
              <ExternalLink size={12} />
            </button>

            <button
              type="button"
              onClick={handleGoToDesignSystems}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold bg-[var(--accent)] text-white rounded-full hover:bg-[var(--accent-strong)] transition-all shadow-md"
            >
              <Sparkles size={13} />
              <span>Học Design Patterns ngay</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
