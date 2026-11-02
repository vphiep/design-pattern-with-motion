'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Layers, Link2, Check } from 'lucide-react';
import { IllustrationStage } from './IllustrationStage';
import { CodeBlock } from './CodeBlock';
import { Connector } from './Connector';
import { useLocale } from './LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { Pattern } from '@/lib/patterns/types';
import { getAdjacentPatterns } from '@/lib/patterns/data';
import { SCENE_META } from '@/lib/patterns/scene-meta';
import { linesForStep } from '@/lib/patterns/scene';
import { useProgress } from './ProgressProvider';

interface PatternPageShellProps {
  pattern: Pattern;
  illustration?: React.ReactNode;
  children?: React.ReactNode;
}

const categoryColors: Record<Pattern['category'], string> = {
  creational: 'text-[var(--pattern-creational)] border-[var(--pattern-creational)]',
  structural: 'text-[var(--pattern-structural)] border-[var(--pattern-structural)]',
  behavioral: 'text-[var(--pattern-behavioral)] border-[var(--pattern-behavioral)]'
};

const READ_MINUTES: Record<1 | 2 | 3, number> = { 1: 6, 2: 10, 3: 14 };

type CodeVariant = 'standard' | 'advanced';

function parseStepParam(val: string | null, maxSteps: number): number | null {
  if (!val) return null;
  const num = parseInt(val, 10);
  if (isNaN(num)) return null;
  if (num <= 1) return 0;
  return Math.max(0, Math.min(maxSteps - 1, num - 1));
}

export function PatternPageShell({ pattern, illustration, children }: PatternPageShellProps) {
  const { markVisited, isVisited } = useProgress();
  const { ui, tx, locale } = useLocale();
  const searchParams = useSearchParams();
  const meta = SCENE_META[pattern.id];
  const maxSteps = meta?.steps.length ?? pattern.steps.length;

  const initialStep = useMemo(() => {
    return parseStepParam(searchParams.get('step'), maxSteps) ?? 0;
  }, [searchParams, maxSteps]);

  const visited = isVisited(pattern.id);
  const firedRef = useRef(false);
  const [activeStep, setActiveStep] = useState<number | null>(initialStep);
  const [seekStep, setSeekStep] = useState<number | null>(initialStep);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [variant, setVariant] = useState<CodeVariant>('standard');
  const [copiedLink, setCopiedLink] = useState(false);

  const { prev, next } = getAdjacentPatterns(pattern.id);
  const shownStep = hoverStep ?? activeStep;
  const showingAdvanced = variant === 'advanced' && Boolean(pattern.advanced);
  const displayedCode = showingAdvanced ? pattern.advanced!.javaCode : pattern.javaCode;

  const highlight = useMemo(() => {
    if (showingAdvanced || shownStep == null || !meta) return null;
    return linesForStep(pattern.javaCode, meta.steps[shownStep]);
  }, [showingAdvanced, shownStep, meta, pattern.javaCode]);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    markVisited(pattern.id);
  }, [pattern.id, markVisited]);

  // Synchronize when URL search param or pattern changes
  useEffect(() => {
    const parsed = parseStepParam(searchParams.get('step'), maxSteps);
    if (parsed != null) {
      setActiveStep(parsed);
      setSeekStep(parsed);
    }
  }, [searchParams, maxSteps]);

  useEffect(() => {
    setVariant('standard');
    setHoverStep(null);
  }, [pattern.id]);

  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setSeekStep(index);
    setHoverStep(null);

    // Update URL param ?step=N (1-based for human sharing)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('step', String(index + 1));
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  const handleReplay = () => {
    setSeekStep(null);
    setActiveStep(0);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('step');
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  const handleShareStep = () => {
    if (typeof window === 'undefined') return;
    const currentStepNum = (shownStep ?? 0) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(currentStepNum));
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const difficulty = ui.pattern.difficulty[pattern.difficulty - 1];
  const categoryLabel = ui.categories[pattern.category];

  return (
    <article className="relative">
      <div className="border-b border-border-soft">
        <div className="mx-auto flex max-w-wide items-center justify-between gap-4 px-6 py-3">
          <Link
            href={`/patterns/${pattern.category}`}
            className="group inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span className="font-mono uppercase tracking-widest">
              {ui.pattern.backTo(categoryLabel)}
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-text-soft">
            <span className="font-mono">№ {String(pattern.order).padStart(2, '0')}</span>
            <span aria-hidden>·</span>
            <span className="font-mono">{difficulty}</span>
            {visited && (
              <span className="ml-2 inline-flex items-center gap-1.5 border-hairline bg-accent px-1.5 py-0.5 text-bg">
                <span className="h-1 w-1 rounded-full bg-bg" />
                <span className="font-mono uppercase tracking-widest">{ui.pattern.seen}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <header className="relative">
        <div className="mx-auto grid max-w-wide grid-cols-1 gap-10 px-6 pb-12 pt-16 md:grid-cols-12 md:pt-24">
          <div className="md:col-span-8">
            <div className="mb-4 flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs',
                  categoryColors[pattern.category]
                )}
              >
                <Layers size={11} />
                <span className="font-mono uppercase tracking-widest">{categoryLabel}</span>
              </span>
              <span className="caption inline-flex items-center gap-1.5">
                <Clock size={11} />
                {ui.pattern.readTime(READ_MINUTES[pattern.difficulty])}
              </span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              className="text-display text-display-xl"
            >
              {pattern.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-6 max-w-reading text-xl leading-relaxed text-text-muted"
            >
              {tx(pattern.tagline)}
            </motion.p>
          </div>
          <aside className="md:col-span-4">
            <div className="border-hairline bg-surface p-5">
              <p className="caption">{ui.pattern.atAGlance}</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{ui.pattern.categoryLabel}</dt>
                  <dd className="text-text">{categoryLabel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{ui.pattern.difficultyLabel}</dt>
                  <dd className="text-text">{difficulty}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{ui.pattern.orderLabel}</dt>
                  <dd className="text-text">№ {pattern.order}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </header>

      <section className="mx-auto max-w-wide px-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <p className="caption">{ui.pattern.howItWorks}</p>
          <button
            type="button"
            onClick={handleShareStep}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border-hairline bg-surface transition-all duration-200',
              copiedLink
                ? 'border-accent bg-accent text-bg animate-bounce-subtle'
                : 'text-text-muted hover:text-text hover:bg-bg-elevated'
            )}
            title={ui.stepShare.copyLink}
            aria-label={ui.stepShare.copyLink}
          >
            {copiedLink ? <Check size={12} /> : <Link2 size={12} />}
            <span className="font-mono text-[10px] uppercase tracking-wider">
              {copiedLink ? ui.stepShare.copied : `${ui.stepShare.copyLink} (?step=${(shownStep ?? 0) + 1})`}
            </span>
          </button>
        </div>

        {illustration ?? children ?? (
          <IllustrationStage
            pattern={pattern}
            activeStep={shownStep}
            onStepChange={setActiveStep}
            emphasizeStep={hoverStep}
            seekStep={seekStep}
            onSeekStep={(s) => {
              if (s != null) {
                handleSelectStep(s);
              }
            }}
            onReplay={handleReplay}
          />
        )}

        {pattern.steps.length > 0 && (
          <div className="mt-10">
            <p className="caption mb-6">{ui.pattern.walkthroughHint}</p>
            <ol className="space-y-8">
              {pattern.steps.map((step, i) => {
                const range = meta ? linesForStep(pattern.javaCode, meta.steps[i]) : null;
                const active = shownStep === i;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => handleSelectStep(i)}
                      onMouseEnter={() => setHoverStep(i)}
                      onMouseLeave={() => setHoverStep(null)}
                      className={cn(
                        'w-full text-left transition-colors',
                        active ? 'text-text' : 'text-text-muted hover:text-text'
                      )}
                    >
                      <div className="flex items-baseline gap-3">
                        <span
                          className={cn(
                            'font-mono text-xs uppercase tracking-widest',
                            active ? 'text-accent' : 'text-text-soft'
                          )}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-display text-display-sm">{tx(step.title)}</span>
                        {range && (
                          <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-widest text-text-soft sm:inline">
                            {ui.pattern.lines(range[0], range[1])}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 max-w-reading text-base leading-relaxed">
                        {tx(step.body)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-wide px-6 pb-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="caption">{ui.pattern.inPlainEnglish}</p>
            <h2 className="text-display text-display-md mt-2">{ui.pattern.analogy}</h2>
          </div>
          <div className="md:col-span-9">
            <p className="max-w-reading text-lg leading-relaxed text-text">{tx(pattern.analogy)}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-wide px-6 pb-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="border-hairline bg-surface p-6">
            <p className="caption text-accent">{ui.pattern.useWhen}</p>
            <ul className="mt-4 space-y-3">
              {pattern.whenToUse.map((line, i) => (
                <li key={i} className="flex gap-3 text-text">
                  <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />
                  <span>{tx(line)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-hairline bg-surface p-6">
            <p className="caption text-text-soft">{ui.pattern.skipWhen}</p>
            <ul className="mt-4 space-y-3">
              {pattern.whenNotToUse.map((line, i) => (
                <li key={i} className="flex gap-3 text-text">
                  <span
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0 border border-text-soft"
                    aria-hidden
                  />
                  <span>{tx(line)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {pattern.realSystems.length > 0 && (
        <section className="mx-auto max-w-wide px-6 pb-12">
          <div className="mb-6">
            <p className="caption">{ui.pattern.realSystemsKicker}</p>
            <h2 className="text-display text-display-md mt-1">{ui.pattern.realSystems}</h2>
            <p className="mt-2 max-w-reading text-sm text-text-muted">
              {ui.pattern.realSystemsLede}
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {pattern.realSystems.map((note) => (
              <li key={note.system} className="border-hairline bg-surface p-5">
                <h3 className="font-mono text-sm text-text">{note.system}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{tx(note.note)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mx-auto hidden max-w-wide px-6 md:block">
        <Connector variant="wave" className="h-10 w-full" />
      </div>

      <section className="mx-auto max-w-wide px-6 pb-16">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="caption">{ui.pattern.inCode}</p>
            <h2 className="text-display text-display-md mt-1">{ui.pattern.javaExample}</h2>
          </div>
          <div className="flex flex-col items-end gap-3">
            {pattern.advanced && (
              <div
                role="tablist"
                aria-label={ui.pattern.codeVariantAria}
                className="inline-flex border-hairline bg-surface"
              >
                {(['standard', 'advanced'] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={variant === id}
                    onClick={() => setVariant(id)}
                    className={cn(
                      'relative px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors',
                      variant === id
                        ? 'text-bg'
                        : 'text-text-muted hover:bg-bg-elevated hover:text-text'
                    )}
                  >
                    {variant === id && (
                      <motion.div
                        layoutId="activeCodeVariant"
                        className="absolute inset-0 bg-accent -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    {id === 'standard' ? ui.pattern.standard : ui.pattern.advanced}
                  </button>
                ))}
              </div>
            )}
            <p className="hidden max-w-xs text-right text-xs text-text-soft sm:block">
              {showingAdvanced ? ui.pattern.advancedNote : ui.pattern.hoverHint}
            </p>
          </div>
        </div>

        {showingAdvanced && pattern.advanced && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border-hairline bg-surface p-5">
              <p className="caption text-accent">{ui.pattern.whatMakesItAdvanced}</p>
              <p className="mt-3 text-sm leading-relaxed text-text">
                {tx(pattern.advanced.whatMakesItAdvanced)}
              </p>
            </div>
            <div className="border-hairline bg-surface p-5">
              <p className="caption">{ui.pattern.tradeoffs}</p>
              <p className="mt-3 text-sm leading-relaxed text-text">
                {tx(pattern.advanced.tradeoffs)}
              </p>
            </div>
          </div>
        )}

        <CodeBlock
          key={`${pattern.id}-${variant}`}
          code={displayedCode}
          language="java"
          filename={`${pattern.id}${showingAdvanced ? '.advanced' : ''}.java`}
          highlightLines={highlight}
          onLineHover={
            showingAdvanced
              ? undefined
              : (line) => {
                  if (line == null || !meta) {
                    setHoverStep(null);
                    return;
                  }
                  const idx = meta.steps.findIndex((s) => {
                    const range = linesForStep(pattern.javaCode, s);
                    return range ? line >= range[0] && line <= range[1] : false;
                  });
                  setHoverStep(idx >= 0 ? idx : null);
                }
          }
        />
      </section>

      {/* Deep Architectural Theory & Coupling Mechanics */}
      {pattern.deepTheory && (
        <section className="mx-auto max-w-wide px-6 pb-16">
          <div className="mb-6 border-b border-border-soft pb-4">
            <p className="caption text-accent">ARCHITECTURAL FOUNDATIONS</p>
            <h2 className="text-display text-display-md mt-1">
              {locale === 'vi' ? 'Bản Chất Lý Thuyết & Đánh Đổi Kiến Trúc' : 'Deep Architectural Theory & Trade-Offs'}
            </h2>
            <p className="mt-2 max-w-reading text-sm text-text-muted">
              {tx(pattern.deepTheory.academicRoot)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-hairline bg-surface p-6 space-y-3">
              <p className="caption text-accent">{locale === 'vi' ? 'Chỉ số liên kết (Coupling Metrics)' : 'Coupling & Instability Metrics'}</p>
              <p className="text-sm leading-relaxed text-text">
                {tx(pattern.deepTheory.structuralCouplingMetric)}
              </p>
            </div>

            <div className="border-hairline bg-surface p-6 space-y-3">
              <p className="caption">{locale === 'vi' ? 'Chi phí bộ nhớ & Con trỏ vtable' : 'Memory Overhead & vtable Dispatch'}</p>
              <p className="text-sm leading-relaxed text-text">
                {tx(pattern.deepTheory.memoryAndVtableTradeoff)}
              </p>
            </div>
          </div>

          {pattern.deepTheory.enterpriseBestPractices.length > 0 && (
            <div className="mt-6 border-hairline bg-surface p-6">
              <p className="caption text-accent mb-3">{locale === 'vi' ? 'Nguyên tắc vàng áp dụng trong Enterprise' : 'Enterprise Golden Rules'}</p>
              <ul className="space-y-2.5">
                {pattern.deepTheory.enterpriseBestPractices.map((rule, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>{tx(rule)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Classic Production Problem & Architecture Solution */}
      {pattern.productionProblemCase && (
        <section className="mx-auto max-w-wide px-6 pb-16">
          <div className="mb-6 border-b border-border-soft pb-4">
            <div className="inline-flex items-center gap-1.5 border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] font-bold text-accent mb-2">
              <span>{locale === 'vi' ? 'BÀI TOÁN KINH ĐIỂN TRONG PROJECT THẬT' : 'CLASSIC PRODUCTION PROBLEM CASE STUDY'}</span>
            </div>
            <h2 className="text-display text-display-md mt-1">
              {tx(pattern.productionProblemCase.title)}
            </h2>
            <p className="mt-2 text-sm text-text-muted font-mono">
              <strong>{locale === 'vi' ? 'Bối cảnh thực tế: ' : 'Production Scenario: '}</strong>
              {tx(pattern.productionProblemCase.businessContext)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-rose-500/30 bg-rose-500/5 p-6 space-y-3">
              <p className="caption text-rose-500 font-bold">
                {locale === 'vi' ? 'Sai Lầm Ngây Thơ & Hậu Quả Production' : 'Naive Pitfall & Production Crash'}
              </p>
              <p className="text-sm leading-relaxed text-text">
                {tx(pattern.productionProblemCase.whyNaiveFails)}
              </p>
            </div>

            <div className="border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
              <p className="caption text-emerald-500 font-bold">
                {locale === 'vi' ? 'Cách Pattern Giải Quyết Triệt Để' : 'Architectural Pattern Solution'}
              </p>
              <p className="text-sm leading-relaxed text-text">
                {tx(pattern.productionProblemCase.coreSolution)}
              </p>
            </div>
          </div>

          {pattern.productionProblemCase.productionCode && (
            <div className="mt-6 border-hairline overflow-hidden bg-bg">
              <div className="border-b border-border-soft px-4 py-2 bg-surface flex items-center justify-between">
                <span className="font-mono text-xs text-text font-bold">
                  {locale === 'vi' ? 'Mã Nguồn Giải Pháp Chuẩn Production' : 'Production Solution Code'}
                </span>
                <span className="font-mono text-[10px] text-accent font-bold uppercase">Enterprise Standard</span>
              </div>
              <CodeBlock
                code={pattern.productionProblemCase.productionCode}
                language="java"
                filename={`${pattern.id}.production.java`}
              />
            </div>
          )}

          <div className="mt-6 border border-emerald-500/40 bg-emerald-500/10 p-5 font-mono text-xs text-text flex items-center gap-3">
            <div>
              <strong className="text-emerald-500 block mb-1">
                {locale === 'vi' ? 'Chỉ số đo lường hiệu năng & Lợi ích kiến trúc: ' : 'Architectural Benchmark & Production Impact: '}
              </strong>
              <span className="text-text-muted text-xs">
                {tx(pattern.productionProblemCase.architectureImpact)}
              </span>
            </div>
          </div>
        </section>
      )}

      <nav className="mx-auto flex max-w-wide items-stretch justify-between gap-4 border-t border-border-soft px-6 py-8">
        {prev ? (
          <Link
            href={`/patterns/${prev.id}`}
            className="group flex-1 border-hairline bg-surface p-4 transition-colors hover:bg-bg-elevated"
          >
            <p className="caption inline-flex items-center gap-1">
              <ArrowLeft size={11} /> {ui.pattern.previous}
            </p>
            <p className="text-display mt-1 text-lg group-hover:underline-editorial">{prev.name}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/patterns/${next.id}`}
            className="group flex-1 border-hairline bg-surface p-4 text-right transition-colors hover:bg-bg-elevated"
          >
            <p className="caption inline-flex items-center justify-end gap-1">
              {ui.pattern.next} <ArrowRight size={11} />
            </p>
            <p className="text-display mt-1 text-lg group-hover:underline-editorial">{next.name}</p>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
