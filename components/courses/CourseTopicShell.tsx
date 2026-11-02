'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Layers,
  Link2,
  Check,
  Server,
  Zap,
  Play,
  FileCode2,
  Cpu,
  ShieldCheck,
  Binary,
  BookOpen,
  Sliders,
  Scale,
  Terminal,
  AlertTriangle,
  Maximize2,
  Minimize2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Info,
  Columns2
} from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { MathFormula } from '@/components/MathFormula';
import { TopicMinimap, type TopicSection } from '@/components/TopicMinimap';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import { linesForStep } from '@/lib/patterns/scene';
import type { SceneMeta } from '@/lib/patterns/scene';
import type { CourseDefinition, CourseTopic } from '@/lib/courses/types';
import { courseLevelLabel, getAdjacentCourseTopics } from '@/lib/courses/helpers';
import { CourseIllustrationStage } from './CourseIllustrationStage';
import { COURSE_THEMES, LEVEL_BADGES } from './theme';
import type { BespokeScene } from './scene-kit';

interface CourseTopicShellProps {
  course: CourseDefinition;
  topic: CourseTopic;
  sceneMeta: Record<string, SceneMeta>;
  bespokeScenes: Record<string, BespokeScene>;
}

const DIFFICULTY_LABELS: Record<1 | 2 | 3, { en: string; vi: string }> = {
  1: { en: 'Foundation', vi: 'Nền tảng' },
  2: { en: 'Production Engineering', vi: 'Kỹ thuật Production' },
  3: { en: 'Staff-level Deep Dive', vi: 'Chuyên sâu cấp Staff' }
};

function SectionHeader({
  number,
  title,
  subtitle,
  tone,
  children
}: {
  number: string;
  title: string;
  subtitle: string;
  tone: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-border-soft">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg font-mono font-bold text-sm',
            tone
          )}
        >
          {number}
        </span>
        <div>
          <h2 className="text-2xl font-mono font-bold text-text-main">{title}</h2>
          <p className="text-xs font-mono text-text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

type RawSection = {
  id: string;
  shortTitle: { vi: string; en: string };
  titleBase: { vi: string; en: string };
  icon: typeof BookOpen;
};

export function CourseTopicShell({
  course,
  topic,
  sceneMeta,
  bespokeScenes
}: CourseTopicShellProps) {
  const { tx, locale } = useLocale();
  const lang = locale === 'vi' ? 'vi' : 'en';
  const theme = COURSE_THEMES[course.accent];
  const searchParams = useSearchParams();
  const meta = sceneMeta[topic.id];
  const maxSteps = topic.steps.length;

  const initialStep = useMemo(() => {
    const val = searchParams.get('step');
    if (!val) return 0;
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 1) return 0;
    return Math.max(0, Math.min(maxSteps - 1, num - 1));
  }, [searchParams, maxSteps]);

  const [activeStep, setActiveStep] = useState<number>(initialStep);
  const [seekStep, setSeekStep] = useState<number | null>(
    // Only seek when deep-linked; otherwise let the timeline play through.
    searchParams.get('step') ? initialStep : null
  );
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [codeTab, setCodeTab] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [openInterviewIdx, setOpenInterviewIdx] = useState<number | null>(0);

  const { prev, next } = getAdjacentCourseTopics(course, topic.id);
  const shownStep = hoverStep ?? activeStep;
  const currentStep = topic.steps[shownStep] ?? topic.steps[0];
  const activeCode = topic.code[codeTab] ?? topic.code[0];

  const highlight = useMemo(() => {
    if (!meta || codeTab !== 0) return null;
    return linesForStep(topic.code[0].code, meta.steps[shownStep]);
  }, [shownStep, meta, topic.code, codeTab]);

  const writeStepToUrl = (step: number | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (step == null) url.searchParams.delete('step');
    else url.searchParams.set('step', String(step + 1));
    window.history.replaceState(null, '', url.pathname + url.search);
  };

  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setSeekStep(index);
    setHoverStep(null);
    writeStepToUrl(index);
  };

  const handleReplay = () => {
    setSeekStep(null);
    setActiveStep(0);
    writeStepToUrl(null);
  };

  const handleShareStep = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(shownStep + 1));
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const catMeta = course.categories[topic.category];

  const minimapSections = useMemo<TopicSection[]>(() => {
    const raw: RawSection[] = [
      {
        id: 'theory',
        shortTitle: { vi: 'Lý thuyết', en: 'Theory' },
        titleBase: { vi: 'Bản chất & Lý thuyết', en: 'Core Theory' },
        icon: BookOpen
      }
    ];
    if (topic.productionProblemCase) {
      raw.push({
        id: 'production-case',
        shortTitle: { vi: 'Thực tế', en: 'Case' },
        titleBase: { vi: 'Sự cố production', en: 'Production Case' },
        icon: AlertTriangle
      });
    }
    raw.push(
      {
        id: 'architecture',
        shortTitle: { vi: 'Kiến trúc', en: 'Topology' },
        titleBase: course.labels.architecture,
        icon: Binary
      },
      {
        id: 'mechanism',
        shortTitle: { vi: 'Hoạt họa', en: 'Visualizer' },
        titleBase: { vi: 'Hoạt họa cơ chế', en: 'Mechanism Stage' },
        icon: Play
      },
      {
        id: 'code-workspace',
        shortTitle: { vi: 'Mã nguồn', en: 'Code' },
        titleBase: course.labels.code,
        icon: FileCode2
      }
    );
    if (topic.comparison) {
      raw.push({
        id: 'comparison',
        shortTitle: { vi: 'So sánh', en: 'Compare' },
        titleBase: topic.comparison.title,
        icon: Columns2
      });
    }
    if (topic.interviewQuestions?.length) {
      raw.push({
        id: 'interview',
        shortTitle: { vi: 'Phỏng vấn', en: 'Interview' },
        titleBase: { vi: 'Câu hỏi phỏng vấn', en: 'Interview Q&A' },
        icon: GraduationCap
      });
    }
    raw.push({
      id: 'tradeoffs',
      shortTitle: { vi: 'Đánh đổi', en: 'Trade-offs' },
      titleBase: { vi: 'Đánh đổi & Bất biến', en: 'Trade-offs & Invariants' },
      icon: Scale
    });

    return raw.map((item, idx) => ({
      id: item.id,
      number: String(idx + 1).padStart(2, '0'),
      shortTitle: item.shortTitle,
      fullTitle: { vi: `${idx + 1}. ${item.titleBase.vi}`, en: `${idx + 1}. ${item.titleBase.en}` },
      icon: item.icon
    }));
  }, [topic.productionProblemCase, topic.comparison, topic.interviewQuestions, course.labels]);

  const sectionNumber = (id: string) => minimapSections.find((s) => s.id === id)?.number ?? '';

  return (
    <article className="relative min-h-screen pb-24 text-text">
      {/* Sub-header navigation */}
      <div className="border-b border-border-soft bg-bg/95 backdrop-blur-md shadow-xs sticky top-14 z-30">
        <div className="mx-auto flex max-w-wide items-center justify-between gap-4 px-6 py-2.5">
          <Link
            href={course.basePath}
            className={cn(
              'group inline-flex items-center gap-2 text-xs font-mono text-text-muted transition-colors shrink-0',
              theme.hoverText
            )}
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            <span className="uppercase tracking-widest">{tx(course.shortLabel)}</span>
          </Link>

          <TopicMinimap sections={minimapSections} locale={lang} accentColor={theme.minimap} />

          <button
            onClick={handleShareStep}
            className="inline-flex items-center gap-1.5 text-xs text-text-soft hover:text-text px-2 py-1 border border-border-soft rounded font-mono transition-colors"
          >
            {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Link2 size={12} />}
            <span className="text-[11px]">
              {copiedLink
                ? lang === 'vi'
                  ? 'Đã sao chép'
                  : 'Copied'
                : lang === 'vi'
                  ? 'Chia sẻ bước'
                  : 'Share step'}
            </span>
          </button>
        </div>
      </div>

      {/* Hero */}
      <header className="relative border-b border-border-soft bg-surface/10 py-12 md:py-16">
        <div className="mx-auto max-w-wide px-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider',
                theme.badge
              )}
            >
              <Layers size={12} />
              {topic.roadmapId ? `${topic.roadmapId} · ` : ''}
              {catMeta.chapter} · {tx(catMeta.label)}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold',
                LEVEL_BADGES[topic.levelTo ?? topic.level]
              )}
            >
              {courseLevelLabel(topic, lang)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-text-muted">
              <Clock size={12} />
              {topic.estimatedMinutes} {lang === 'vi' ? 'phút đọc & thực hành' : 'min read'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-text-muted">
              <Zap size={12} className={theme.text} />
              {DIFFICULTY_LABELS[topic.difficulty][lang]}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-text-main mb-4">
            {topic.name}
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-4xl font-sans leading-relaxed">
            {tx(topic.tagline)}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-wide px-6 py-10 space-y-16">
        {/* THEORY */}
        <section id="theory" className="scroll-mt-36 space-y-8">
          <SectionHeader
            number={sectionNumber('theory')}
            tone={theme.badge}
            title={lang === 'vi' ? 'Bản chất & Lý thuyết' : 'Core Theory'}
            subtitle={
              lang === 'vi'
                ? 'Vấn đề gốc, ràng buộc hạ tầng và lời giải kiến trúc'
                : 'Root problem, infrastructure constraints and the architectural answer'
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-border-soft bg-surface/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle size={14} />
                <span>{lang === 'vi' ? 'Vấn đề' : 'Problem Statement'}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {tx(topic.coreTheory.problemStatement)}
              </p>
            </div>
            <div className="p-5 rounded-xl border border-border-soft bg-surface/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Cpu size={14} />
                <span>{lang === 'vi' ? 'Ràng buộc hạ tầng' : 'Infrastructure Constraint'}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {tx(topic.coreTheory.hardwareConstraint)}
              </p>
            </div>
            <div className={cn('p-5 rounded-xl border space-y-3', theme.softPanel)}>
              <div
                className={cn(
                  'flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider',
                  theme.text
                )}
              >
                <ShieldCheck size={14} />
                <span>{lang === 'vi' ? 'Giải pháp kiến trúc' : 'Architectural Solution'}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {tx(topic.coreTheory.fundamentalSolution)}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border-soft bg-surface/40 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider',
                  theme.text
                )}
              >
                <Sliders size={14} />
                <span>{lang === 'vi' ? 'Mô hình toán học' : 'Mathematical Model'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-text-muted flex-wrap">
                <span>
                  Time:{' '}
                  <strong className="text-emerald-400">
                    {topic.coreTheory.math.timeComplexity}
                  </strong>
                </span>
                <span>
                  Space:{' '}
                  <strong className="text-cyan-400">{topic.coreTheory.math.spaceComplexity}</strong>
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-surface/40 border border-border-soft/60 overflow-x-auto text-center">
              <MathFormula formula={topic.coreTheory.math.formula} displayMode={true} />
            </div>
            {topic.coreTheory.math.description && (
              <p className="text-xs font-mono text-text-muted leading-relaxed">
                {tx(topic.coreTheory.math.description)}
              </p>
            )}
          </div>

          {topic.detailedTheory && (
            <div className="space-y-4 p-6 rounded-xl border border-border-soft bg-surface/20">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-text-main">
                <Info size={16} className={theme.text} />
                <span>{lang === 'vi' ? 'Phân tích chuyên sâu' : 'Deep Dive'}</span>
              </div>
              <p className="text-sm text-text-muted font-sans leading-relaxed">
                {tx(topic.detailedTheory.overview)}
              </p>
              <div className="space-y-3 pt-2">
                {topic.detailedTheory.deepDiveParagraphs.map((para, idx) => (
                  <p
                    key={idx}
                    className={cn(
                      'text-sm text-text-muted font-sans leading-relaxed pl-4 border-l-2',
                      theme.quoteBorder
                    )}
                  >
                    {tx(para)}
                  </p>
                ))}
              </div>
              {topic.detailedTheory.enterprisePitfalls.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block">
                    {lang === 'vi'
                      ? 'Cạm bẫy thường gặp trong production:'
                      : 'Common Production Pitfalls:'}
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-text-muted">
                    {topic.detailedTheory.enterprisePitfalls.map((p, i) => (
                      <li key={i}>{tx(p)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {topic.researchCitations && topic.researchCitations.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Sparkles size={13} className={theme.text} />
                {lang === 'vi' ? 'Tài liệu gốc & trích dẫn:' : 'Primary Sources & Citations:'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.researchCitations.map((c, i) => (
                  <a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'group block p-4 rounded-xl border border-border-soft bg-surface/20 hover:bg-surface/40 transition-all shadow-xs',
                      theme.cardHover
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-between text-xs font-mono mb-1',
                        theme.text
                      )}
                    >
                      <span>{c.source}</span>
                      <ExternalLink
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <h4 className="text-sm font-mono font-bold text-text-main mb-1.5">{c.title}</h4>
                    <p className="text-xs text-text-muted leading-relaxed mb-2">
                      {tx(c.keyTakeaway)}
                    </p>
                    {c.benchmarkOrInsight && (
                      <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        Insight: {tx(c.benchmarkOrInsight)}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* PRODUCTION CASE */}
        {topic.productionProblemCase && (
          <section id="production-case" className="scroll-mt-36 space-y-6">
            <SectionHeader
              number={sectionNumber('production-case')}
              tone="bg-rose-500/15 text-rose-400"
              title={
                lang === 'vi' ? 'Bài toán thực tế trong production' : 'Classic Production Problem'
              }
              subtitle={tx(topic.productionProblemCase.title)}
            />
            <div className="p-6 rounded-xl border border-rose-500/30 bg-rose-500/[0.03] space-y-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    {lang === 'vi' ? 'Bối cảnh nghiệp vụ:' : 'Business Context:'}
                  </span>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {tx(topic.productionProblemCase.businessContext)}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                    {lang === 'vi' ? 'Mô tả sự cố:' : 'Incident Description:'}
                  </span>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {tx(topic.productionProblemCase.problemDescription)}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  {lang === 'vi'
                    ? 'Vì sao cách làm ngây thơ thất bại:'
                    : 'Why the Naive Approach Fails:'}
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  {tx(topic.productionProblemCase.whyNaiveFails)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  {lang === 'vi' ? 'Giải pháp chuẩn:' : 'Architectural Solution:'}
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  {tx(topic.productionProblemCase.coreSolution)}
                </p>
                <div className="text-xs font-mono text-emerald-400 pt-1">
                  {lang === 'vi' ? 'Tác động hệ thống: ' : 'Impact: '}
                  {tx(topic.productionProblemCase.architectureImpact)}
                </div>
              </div>
              {topic.productionProblemCase.productionCode && (
                <CodeBlock
                  code={topic.productionProblemCase.productionCode}
                  language={topic.productionProblemCase.productionLanguage ?? 'java'}
                />
              )}
            </div>
          </section>
        )}

        {/* ARCHITECTURE */}
        <section id="architecture" className="scroll-mt-36 space-y-6">
          <SectionHeader
            number={sectionNumber('architecture')}
            tone={theme.badge}
            title={tx(course.labels.architecture)}
            subtitle={tx(topic.physicalArchitecture.title)}
          />
          <p className="text-sm text-text-muted font-sans leading-relaxed">
            {tx(topic.physicalArchitecture.description)}
          </p>
          <div className="p-5 rounded-xl border border-border-soft bg-surface/40 overflow-x-auto shadow-inner">
            <pre className={cn('font-mono text-xs leading-snug select-all', theme.text)}>
              {topic.physicalArchitecture.asciiDiagram}
            </pre>
          </div>
          {topic.physicalArchitecture.components && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {topic.physicalArchitecture.components.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border-soft bg-surface/30 space-y-1.5"
                >
                  <span className={cn('text-xs font-mono font-bold block', theme.text)}>
                    {comp.name}
                  </span>
                  <span className="text-[11px] font-mono text-text-soft block">{comp.role}</span>
                  <p className="text-xs text-text-muted leading-relaxed">{tx(comp.description)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MECHANISM STAGE */}
        <section id="mechanism" className="scroll-mt-36 space-y-6">
          <SectionHeader
            number={sectionNumber('mechanism')}
            tone={theme.badge}
            title={lang === 'vi' ? 'Hoạt họa cơ chế trực quan' : 'Interactive Mechanism Stage'}
            subtitle={
              lang === 'vi'
                ? 'Chọn từng bước để tua timeline, rê chuột để làm nổi thành phần liên quan'
                : 'Pick a step to seek the timeline, hover to emphasise its parts'
            }
          >
            <button
              type="button"
              onClick={() => setIsTheaterMode((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors',
                isTheaterMode
                  ? theme.outlineButton
                  : 'border-border-soft text-text-soft hover:text-text bg-surface'
              )}
            >
              {isTheaterMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span className="hidden sm:inline">
                {isTheaterMode
                  ? lang === 'vi'
                    ? 'Thu gọn'
                    : 'Standard'
                  : lang === 'vi'
                    ? 'Mở rộng sân khấu'
                    : 'Expand'}
              </span>
            </button>
          </SectionHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div
              className={cn(
                'rounded-2xl border border-border-soft overflow-hidden bg-surface shadow-md transition-all duration-300',
                isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-8'
              )}
            >
              <CourseIllustrationStage
                courseName={course.name}
                topic={topic}
                meta={meta}
                bespoke={bespokeScenes[topic.id]}
                accentHex={theme.hex}
                onStepChange={setActiveStep}
                emphasizeStep={hoverStep}
                seekStep={seekStep}
                onSeekStep={setSeekStep}
                onReplay={handleReplay}
              />
            </div>

            <div
              className={cn(
                'rounded-2xl border border-border-soft bg-surface p-6 space-y-4 transition-all duration-300',
                isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-4'
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full animate-pulse', theme.dot)} />
                      <span
                        className={cn(
                          'text-xs font-mono uppercase tracking-wider font-bold',
                          theme.text
                        )}
                      >
                        {currentStep.phase} · Step {shownStep + 1} / {topic.steps.length}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-text">{tx(currentStep.title)}</h4>
                    <p className="text-xs text-text-soft leading-relaxed font-sans">
                      {tx(currentStep.description)}
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 pt-3 border-t border-border-soft">
                    <Server size={15} className={cn('shrink-0 mt-0.5', theme.text)} />
                    <div className="text-xs font-mono">
                      <span className={cn('font-semibold', theme.text)}>
                        {tx(course.labels.systemBehavior)}:{' '}
                      </span>
                      <span className="text-text-soft block mt-0.5 font-sans">
                        {tx(currentStep.systemBehavior)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-surface-subtle border border-border-soft font-mono text-[11px] text-cyan-400 flex items-center gap-2">
                    <Terminal size={12} className="shrink-0" />
                    <span className="truncate">Match: {currentStep.codeLineMatch}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted block">
              {lang === 'vi' ? 'Các bước thực thi (Step-by-Step):' : 'Step-by-Step Walkthrough:'}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {topic.steps.map((st, idx) => {
                const isSelected = shownStep === idx;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    onMouseEnter={() => setHoverStep(idx)}
                    onMouseLeave={() => setHoverStep(null)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all text-xs font-mono',
                      isSelected
                        ? cn(theme.softPanel, 'shadow-sm')
                        : 'border-border-soft bg-surface/20 hover:border-text-soft/40'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn('font-bold', theme.text)}>
                        {String(idx + 1).padStart(2, '0')}. {st.phase}
                      </span>
                      {isSelected && (
                        <span className={cn('h-2 w-2 rounded-full animate-pulse', theme.dot)} />
                      )}
                    </div>
                    <div className="font-bold text-text-main text-sm mb-1">{tx(st.title)}</div>
                    <p className="text-text-muted text-[11px] leading-relaxed font-sans">
                      {tx(st.description)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* CODE */}
        <section id="code-workspace" className="scroll-mt-36 space-y-6">
          <SectionHeader
            number={sectionNumber('code-workspace')}
            tone="bg-emerald-500/15 text-emerald-400"
            title={tx(course.labels.code)}
            subtitle={tx(course.labels.codeSubtitle)}
          >
            {topic.code.length > 1 && (
              <div className="flex items-center gap-1 p-1 rounded-lg border border-border-soft bg-surface/50 flex-wrap">
                {topic.code.map((c, i) => (
                  <button
                    key={c.filename}
                    type="button"
                    onClick={() => setCodeTab(i)}
                    className={cn(
                      'px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5',
                      codeTab === i
                        ? cn(theme.pillActive, 'font-bold')
                        : 'text-text-muted hover:text-text-main'
                    )}
                  >
                    {i === 0 ? <Terminal size={12} /> : <FileCode2 size={12} />}
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </SectionHeader>
          <div className="rounded-xl border border-border-soft overflow-hidden shadow-sm">
            <CodeBlock
              key={activeCode.filename}
              code={activeCode.code}
              language={activeCode.language}
              filename={activeCode.filename}
              highlightLines={highlight}
            />
          </div>
        </section>

        {/* COMPARISON */}
        {topic.comparison && (
          <section id="comparison" className="scroll-mt-36 space-y-6">
            <SectionHeader
              number={sectionNumber('comparison')}
              tone="bg-orange-500/15 text-orange-400"
              title={tx(topic.comparison.title)}
              subtitle={tx(topic.comparison.subtitle)}
            />
            <div
              className={cn(
                'grid grid-cols-1 gap-6',
                topic.comparison.options.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'
              )}
            >
              {topic.comparison.options.map((opt, i) => (
                <div
                  key={opt.name}
                  className={cn(
                    'p-6 rounded-xl border space-y-4 shadow-sm',
                    i % 2 === 0
                      ? 'border-orange-500/30 bg-orange-500/[0.04]'
                      : 'border-cyan-500/30 bg-cyan-500/[0.04]'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={cn(
                        'font-mono font-bold text-lg',
                        i % 2 === 0 ? 'text-orange-400' : 'text-cyan-400'
                      )}
                    >
                      {opt.name}
                    </h3>
                    <span className="text-xs font-mono text-text-soft bg-surface/60 px-2 py-0.5 rounded border border-border-soft">
                      {opt.tag}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-text-soft">
                    {lang === 'vi' ? 'Vai trò: ' : 'Role: '}
                    {tx(opt.role)}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{tx(opt.keyMechanism)}</p>
                  <pre className="p-3 rounded-lg bg-surface/40 border border-border-soft text-xs font-mono text-text whitespace-pre-wrap">
                    {opt.configExample}
                  </pre>
                  <div className="text-xs text-text-soft italic">
                    Note: {tx(opt.architectureNote)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* INTERVIEW */}
        {topic.interviewQuestions && topic.interviewQuestions.length > 0 && (
          <section id="interview" className="scroll-mt-36 space-y-6">
            <SectionHeader
              number={sectionNumber('interview')}
              tone="bg-amber-500/15 text-amber-400"
              title={lang === 'vi' ? 'Câu hỏi phỏng vấn' : 'Interview Q&A'}
              subtitle={
                lang === 'vi'
                  ? 'Tình huống thực tế, bẫy thường gặp và mẹo trả lời cấp Senior'
                  : 'Real scenarios, traps and senior-level pro tips'
              }
            />
            <div className="space-y-4">
              {topic.interviewQuestions.map((iq, idx) => {
                const isOpen = openInterviewIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border-soft bg-surface/20 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenInterviewIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-surface/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[11px] font-mono font-bold',
                            theme.badge
                          )}
                        >
                          {iq.seniority}
                        </span>
                        <span className="text-sm md:text-base font-mono font-bold text-text-main">
                          Q{idx + 1}: {tx(iq.question)}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={cn(
                          'text-text-muted transition-transform shrink-0',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-5 pb-5 space-y-4 border-t border-border-soft/60 pt-4"
                        >
                          <div className="text-sm text-text-muted leading-relaxed font-sans">
                            {tx(iq.answer)}
                          </div>
                          {iq.trapWarning && (
                            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                              <span className="font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1">
                                {lang === 'vi' ? '⚠️ Bẫy thường gặp:' : '⚠️ Interview Trap:'}
                              </span>
                              <p className="text-text-muted">{tx(iq.trapWarning)}</p>
                            </div>
                          )}
                          {iq.proTip && (
                            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                              <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                                {lang === 'vi' ? '💡 Mẹo cấp Senior:' : '💡 Senior Pro Tip:'}
                              </span>
                              <p className="text-text-muted">{tx(iq.proTip)}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TRADE-OFFS */}
        <section id="tradeoffs" className="scroll-mt-36 space-y-6">
          <SectionHeader
            number={sectionNumber('tradeoffs')}
            tone={theme.badge}
            title={lang === 'vi' ? 'Đánh đổi & Bất biến' : 'Trade-offs & Invariants'}
            subtitle={
              lang === 'vi'
                ? 'Không có lựa chọn miễn phí — chỉ có đánh đổi phù hợp bài toán'
                : 'No free lunch — only trade-offs that fit the problem'
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                {lang === 'vi' ? 'Ưu điểm' : 'Strengths'}
              </span>
              <ul className="space-y-2 text-xs text-text-muted">
                {topic.tradeoffs.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tx(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block">
                {lang === 'vi' ? 'Chi phí & đánh đổi' : 'Costs & Trade-offs'}
              </span>
              <ul className="space-y-2 text-xs text-text-muted">
                {topic.tradeoffs.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{tx(c)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-border-soft bg-surface/30 space-y-3">
            <span
              className={cn(
                'text-xs font-mono font-bold uppercase tracking-wider block',
                theme.text
              )}
            >
              {tx(course.labels.balance)}:
            </span>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              {tx(topic.tradeoffs.balance)}
            </p>
            <div className="pt-2 text-xs font-mono text-cyan-400">
              {tx(course.labels.invariant)}: {tx(topic.tradeoffs.invariant)}
            </div>
          </div>
        </section>

        {/* FOOTER NAV */}
        <div className="pt-10 border-t border-border-soft flex items-center justify-between gap-4 flex-wrap">
          {prev ? (
            <Link
              href={`${course.basePath}/${prev.id}`}
              className={cn(
                'group inline-flex items-center gap-3 p-3 rounded-xl border border-border-soft bg-surface/30 transition-all max-w-sm',
                theme.cardHover
              )}
            >
              <ArrowLeft
                size={16}
                className="text-text-muted group-hover:-translate-x-1 transition-all shrink-0"
              />
              <div>
                <span className="text-[10px] font-mono text-text-soft block uppercase">
                  {lang === 'vi' ? 'Bài trước' : 'Previous topic'}
                </span>
                <span
                  className={cn(
                    'text-xs font-mono font-bold text-text-main transition-colors line-clamp-1',
                    theme.groupHoverText
                  )}
                >
                  {prev.name}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`${course.basePath}/${next.id}`}
              className={cn(
                'group inline-flex items-center gap-3 p-3 rounded-xl border border-border-soft bg-surface/30 transition-all max-w-sm text-right ml-auto',
                theme.cardHover
              )}
            >
              <div>
                <span className="text-[10px] font-mono text-text-soft block uppercase">
                  {lang === 'vi' ? 'Bài tiếp theo' : 'Next topic'}
                </span>
                <span
                  className={cn(
                    'text-xs font-mono font-bold text-text-main transition-colors line-clamp-1',
                    theme.groupHoverText
                  )}
                >
                  {next.name}
                </span>
              </div>
              <ArrowRight
                size={16}
                className="text-text-muted group-hover:translate-x-1 transition-all shrink-0"
              />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </article>
  );
}
