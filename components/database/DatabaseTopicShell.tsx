'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
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
  HardDrive,
  Binary,
  GitBranch,
  BookOpen,
  Sliders,
  Scale,
  Database,
  Terminal,
  AlertTriangle,
  Maximize2,
  Minimize2,
  ExternalLink,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { DatabaseIllustrationStage } from './DatabaseIllustrationStage';
import { CodeBlock } from '@/components/CodeBlock';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { DatabaseTopic } from '@/lib/database/types';
import { getAdjacentTopics, DATABASE_CATEGORY_META } from '@/lib/database/data';
import { DATABASE_SCENE_META } from '@/lib/database/scene-meta';
import { linesForStep } from '@/lib/patterns/scene';
import { MathFormula } from '@/components/MathFormula';
import { TopicMinimap, type TopicSection } from '@/components/TopicMinimap';

interface DatabaseTopicShellProps {
  topic: DatabaseTopic;
}

type CodeTab = 'springboot' | 'sql' | 'engine';

const DIFFICULTY_LABELS: Record<1 | 2 | 3, { en: string; vi: string }> = {
  1: { en: 'Fundamental Storage', vi: 'Cơ bản' },
  2: { en: 'Intermediate Engine', vi: 'Trung cấp' },
  3: { en: 'Deep Kernel Internals', vi: 'Chuyên sâu Hệ thống' }
};

export function DatabaseTopicShell({ topic }: DatabaseTopicShellProps) {
  const { tx, locale } = useLocale();
  const searchParams = useSearchParams();
  const meta = DATABASE_SCENE_META[topic.id];
  const maxSteps = meta?.steps.length ?? topic.steps.length;

  const initialStep = useMemo(() => {
    const val = searchParams.get('step');
    if (!val) return 0;
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 1) return 0;
    return Math.max(0, Math.min(maxSteps - 1, num - 1));
  }, [searchParams, maxSteps]);

  const [activeStep, setActiveStep] = useState<number | null>(initialStep);
  const [seekStep, setSeekStep] = useState<number | null>(initialStep);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [codeTab, setCodeTab] = useState<CodeTab>(topic.springBootCode ? 'springboot' : 'engine');
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  const { prev, next } = getAdjacentTopics(topic.id);
  const shownStep = hoverStep ?? activeStep ?? 0;

  const highlight = useMemo(() => {
    if (shownStep == null || !meta || codeTab !== 'engine') return null;
    return linesForStep(topic.javaCode, meta.steps[shownStep]);
  }, [shownStep, meta, topic.javaCode, codeTab]);

  useEffect(() => {
    const val = searchParams.get('step');
    if (val) {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        const stepIdx = Math.max(0, Math.min(maxSteps - 1, num - 1));
        setActiveStep(stepIdx);
        setSeekStep(stepIdx);
      }
    }
  }, [searchParams, maxSteps]);

  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setSeekStep(index);
    setHoverStep(null);

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
    const currentStepNum = shownStep + 1;
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(currentStepNum));
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const catMeta = DATABASE_CATEGORY_META[topic.category] || DATABASE_CATEGORY_META['storage-engines'];
  const difficulty = DIFFICULTY_LABELS[topic.difficulty][locale === 'vi' ? 'vi' : 'en'];
  const currentStep = topic.steps[shownStep] || topic.steps[0];

  const minimapSections = useMemo<TopicSection[]>(() => {
    interface RawSectionItem {
      id: string;
      shortTitle: { vi: string; en: string };
      titleBase: { vi: string; en: string };
      icon: typeof BookOpen;
    }

    const rawList: RawSectionItem[] = [
      {
        id: 'theory',
        shortTitle: { vi: 'Lý thuyết', en: 'Theory' },
        titleBase: { vi: 'Bản chất & Lý thuyết cốt lõi', en: 'Core Theory & Invariants' },
        icon: BookOpen
      }
    ];

    if (topic.productionProblemCase) {
      rawList.push({
        id: 'production-case',
        shortTitle: { vi: 'Thực tế', en: 'Case' },
        titleBase: { vi: 'Bài toán kinh điển trong project', en: 'Classic Production Problem Case' },
        icon: AlertTriangle
      });
    }

    rawList.push(
      {
        id: 'page-layout',
        shortTitle: { vi: 'Cấu trúc', en: 'Layout' },
        titleBase: { vi: 'Cấu trúc lưu trữ trang đĩa', en: 'Physical Page Storage Layout' },
        icon: Binary
      },
      {
        id: 'mechanism',
        shortTitle: { vi: 'Hoạt họa', en: 'Visualizer' },
        titleBase: { vi: 'Hoạt họa cơ chế trực quan', en: 'Interactive Mechanism Stage' },
        icon: Play
      },
      {
        id: 'code-workspace',
        shortTitle: { vi: 'Mã nguồn', en: 'Code' },
        titleBase: { vi: 'Thực hành Spring Boot 3 & SQL', en: 'Spring Boot 3 & SQL Workspace' },
        icon: FileCode2
      },
      {
        id: 'production',
        shortTitle: { vi: 'Động cơ', en: 'Engines' },
        titleBase: { vi: 'Cấu hình Động cơ Thực tế (PG/MySQL/Oracle)', en: 'Production Engines & Tuning' },
        icon: Server
      },
      {
        id: 'tradeoffs',
        shortTitle: { vi: 'Đánh đổi', en: 'Trade-offs' },
        titleBase: { vi: 'Bản chất đánh đổi & Hệ số WAF', en: 'Architectural Trade-offs & WAF' },
        icon: Scale
      }
    );

    return rawList.map((item, idx) => {
      const stepNumber = String(idx + 1).padStart(2, '0');
      return {
        id: item.id,
        number: stepNumber,
        shortTitle: item.shortTitle,
        fullTitle: {
          vi: `${idx + 1}. ${item.titleBase.vi}`,
          en: `${idx + 1}. ${item.titleBase.en}`
        },
        icon: item.icon
      };
    });
  }, [topic.productionProblemCase]);

  return (
    <article className="relative min-h-screen pb-24 text-text">
      {/* Blueprint Sub-header Navigation */}
      <div className="border-b border-border-soft bg-bg/95 dark:bg-[#0f0d0a]/95 backdrop-blur-md shadow-xs sticky top-14 z-30">
        <div className="mx-auto flex max-w-wide items-center justify-between gap-4 px-6 py-2.5">
          <Link
            href="/database"
            className="group inline-flex items-center gap-2 text-xs font-mono text-text-muted transition-colors hover:text-sky-400 shrink-0"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            <span className="uppercase tracking-widest hidden sm:inline-block">
              {locale === 'vi' ? 'TRUNG TÂM KIẾN TRÚC CSDL' : 'DATABASE OVERVIEW'}
            </span>
            <span className="uppercase tracking-widest sm:hidden">CSDL</span>
          </Link>

          {/* Compact Modern Topic Minimap Stepper */}
          <TopicMinimap
            sections={minimapSections}
            locale={locale === 'vi' ? 'vi' : 'en'}
            accentColor="sky"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareStep}
              className="inline-flex items-center gap-1.5 text-xs text-text-soft hover:text-text px-2 py-1 border border-border-soft rounded font-mono transition-colors"
            >
              {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Link2 size={12} />}
              <span className="text-[11px]">
                {copiedLink ? (locale === 'vi' ? 'Đã sao chép' : 'Copied') : (locale === 'vi' ? 'Chia sẻ bước' : 'Share step')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative border-b border-border-soft bg-surface/10 py-12 md:py-16">
        <div className="mx-auto max-w-wide px-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 border border-sky-500/30 bg-sky-500/10 text-sky-400 px-2.5 py-1 text-xs font-mono font-medium rounded">
              <Layers size={12} />
              <span className="uppercase tracking-widest">{tx(catMeta.label)}</span>
            </span>
            <span className="caption inline-flex items-center gap-1.5 text-text-soft font-mono">
              <Clock size={12} />
              {topic.estimatedMinutes} {locale === 'vi' ? 'phút đọc & phân tích chuyên sâu' : 'min deep dive study'}
            </span>
            <span className="text-xs font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded ml-auto">
              {difficulty}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-display text-display-xl tracking-tight mb-4"
          >
            {topic.name}
          </motion.h1>

          <p className="text-lg md:text-xl text-text-soft max-w-3xl leading-relaxed mb-8">
            {tx(topic.tagline)}
          </p>

          {/* Clean Mathematical Complexity & Formula Box (No broken LaTeX escapes) */}
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-500/20 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-sky-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
                  {locale === 'vi' ? 'ĐỘ PHỨC TẠP TOÁN HỌC & CÔNG THỨC I/O' : 'MATHEMATICAL COMPLEXITY & I/O FORMULA'}
                </span>
              </div>
              <div className="font-mono text-xs px-2.5 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-semibold">
                {topic.coreTheory.math.timeComplexity}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-surface/80 p-3.5 rounded-lg border border-border-soft overflow-x-auto shadow-inner flex items-center justify-center min-h-[56px]">
                <MathFormula
                  formula={topic.coreTheory.math.formula}
                  className="text-sky-300 text-sm sm:text-base md:text-lg font-medium"
                />
              </div>
              <p className="text-xs text-text-soft leading-relaxed">
                {tx(topic.coreTheory.math.description)}
              </p>
              {topic.coreTheory.math.ioCostFormula && (
                <div className="pt-2 flex items-center gap-2 text-xs font-mono text-text-muted">
                  <span className="text-sky-400 font-semibold">{locale === 'vi' ? 'Chi phí đĩa cứng:' : 'Disk I/O Equation:'}</span>
                  <code>{topic.coreTheory.math.ioCostFormula}</code>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Educational Workspace */}
      <main className="mx-auto max-w-wide px-6 py-12 space-y-16">
        {/* SECTION 1: Core Theory & Hardware Constraints */}
        <section id="theory" className="space-y-6 scroll-mt-36">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
            <BookOpen size={16} />
            <span>{locale === 'vi' ? 'PHẦN 1 · BẢN CHẤT LÝ THUYẾT & GIỚI HẠN VẬT LÝ' : 'SECTION 1 · THEORETICAL FOUNDATION'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Hardware Problem */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-mono">
                <HardDrive size={16} />
                <span>{locale === 'vi' ? 'Thách thức Vật lý Phần cứng (Hardware Bottleneck)' : 'The Physical Hardware Challenge'}</span>
              </div>
              <p className="text-xs text-text-soft leading-relaxed">
                {tx(topic.coreTheory.hardwareConstraint)}
              </p>
              <div className="pt-2 border-t border-rose-500/20">
                <h5 className="text-[11px] font-mono font-bold text-rose-300 uppercase mb-1">
                  {locale === 'vi' ? 'Tại sao thuật toán thông thường thất bại?' : 'Why Naive Approaches Fail:'}
                </h5>
                <p className="text-xs text-text-soft leading-relaxed">
                  {tx(topic.coreTheory.problemStatement)}
                </p>
              </div>
            </div>

            {/* The Architectural Solution */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
                <Cpu size={16} />
                <span>{locale === 'vi' ? 'Giải pháp Kiến trúc Cơ sở Dữ liệu' : 'The Storage Engine Architectural Solution'}</span>
              </div>
              <p className="text-xs text-text-soft leading-relaxed">
                {tx(topic.coreTheory.fundamentalSolution)}
              </p>
              <div className="pt-2 border-t border-emerald-500/20">
                <h5 className="text-[11px] font-mono font-bold text-emerald-300 uppercase mb-1">
                  {locale === 'vi' ? 'Bảo đảm Bền vững & Phục hồi' : 'Durability & Consistency Guarantee:'}
                </h5>
                <p className="text-xs text-text-soft leading-relaxed">
                  {tx(topic.tradeoffs.recoveryGuarantee)}
                </p>
              </div>
            </div>
          </div>

          {/* In-Depth Theory & Deep-Dive Paragraphs */}
          {topic.detailedTheory && (
            <div className="rounded-2xl border border-border-soft bg-surface p-6 md:p-8 space-y-6">
              <div className="border-b border-border-soft pb-4">
                <h4 className="text-sm font-mono uppercase tracking-wider text-sky-400 font-bold mb-2">
                  {locale === 'vi' ? 'CƠ CHẾ HOẠT ĐỘNG CHUYÊN SÂU DÀNH CHO DEVELOPER & DBA' : 'DEEP DIVE ARCHITECTURE STUDY GUIDE'}
                </h4>
                <p className="text-sm text-text font-medium leading-relaxed">
                  {tx(topic.detailedTheory.overview)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topic.detailedTheory.deepDiveParagraphs.map((para, idx) => {
                  const text = tx(para);
                  const colonIdx = text.indexOf(':');
                  const hasTitle = colonIdx > 0 && colonIdx < 120;
                  const title = hasTitle ? text.slice(0, colonIdx) : null;
                  const body = hasTitle ? text.slice(colonIdx + 1).trim() : text;

                  return (
                    <div key={idx} className="p-5 rounded-xl border border-border-soft bg-surface/40 space-y-2 hover:border-sky-500/30 transition-colors">
                      {title && (
                        <h5 className="text-xs font-mono font-bold text-sky-400 tracking-wide">
                          {title}
                        </h5>
                      )}
                      <p className="text-xs text-text-soft leading-relaxed">
                        {body}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Enterprise Pitfalls Warning Card */}
              {topic.detailedTheory.enterprisePitfalls && topic.detailedTheory.enterprisePitfalls.length > 0 && (
                <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-xs uppercase">
                    <AlertTriangle size={16} />
                    <span>{locale === 'vi' ? 'BẪY HIỆU NĂNG THỰC TẾ & SAI LẦM DOANH NGHIỆP CẦN TRÁNH' : 'PRODUCTION PITFALLS & PERFORMANCE ANTI-PATTERNS'}</span>
                  </div>
                  <ul className="space-y-3">
                    {topic.detailedTheory.enterprisePitfalls.map((pit, idx) => {
                      const text = tx(pit);
                      const colonIdx = text.indexOf(':');
                      const hasTitle = colonIdx > 0 && colonIdx < 120;
                      const title = hasTitle ? text.slice(0, colonIdx) : null;
                      const body = hasTitle ? text.slice(colonIdx + 1).trim() : text;

                      return (
                        <li key={idx} className="flex items-start gap-3 text-xs text-text-soft leading-relaxed">
                          <span className="text-amber-400 font-bold mt-0.5">!</span>
                          <div>
                            {title && (
                              <strong className="font-semibold text-amber-300 block mb-0.5 font-mono text-[11px] tracking-wide">
                                {title}
                              </strong>
                            )}
                            <span>{body}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Bài Toán Kinh Điển Trong Project Thật (Production Problem Case Study) */}
          {topic.productionProblemCase && (
            <div id="production-case" className="rounded-2xl border border-border-soft bg-surface p-6 md:p-8 space-y-6 scroll-mt-36">
              <div className="border-b border-border-soft pb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 font-mono text-[11px] font-bold text-sky-400 mb-2">
                  <AlertTriangle size={13} />
                  <span>{locale === 'vi' ? 'BÀI TOÁN KINH ĐIỂN TRONG PROJECT THẬT' : 'CLASSIC PRODUCTION PROBLEM CASE STUDY'}</span>
                </div>
                <h3 className="text-xl font-bold font-mono text-text">
                  {tx(topic.productionProblemCase.title)}
                </h3>
                <p className="text-xs text-text-soft font-mono mt-1">
                  <strong className="text-sky-400">{locale === 'vi' ? 'Bối cảnh thực tế: ' : 'Production Scenario: '}</strong>
                  {tx(topic.productionProblemCase.businessContext)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                    <AlertTriangle size={15} />
                    <span>{locale === 'vi' ? 'Sai Lầm Ngây Thơ & Sập Hệ Thống' : 'Naive Trap & Production Crash'}</span>
                  </div>
                  <p className="text-xs text-text-soft leading-relaxed">
                    {tx(topic.productionProblemCase.whyNaiveFails)}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                    <ShieldCheck size={15} />
                    <span>{locale === 'vi' ? 'Giải Pháp Tầng Sâu Cốt Lõi' : 'Deep Engine Solution'}</span>
                  </div>
                  <p className="text-xs text-text-soft leading-relaxed">
                    {tx(topic.productionProblemCase.coreSolution)}
                  </p>
                </div>
              </div>

              {topic.productionProblemCase.productionCode && (
                <div className="rounded-xl border border-border-soft overflow-hidden bg-bg">
                  <div className="border-b border-border-soft px-4 py-2 bg-surface flex items-center justify-between">
                    <span className="font-mono text-[11px] text-text font-bold flex items-center gap-2">
                      <FileCode2 size={13} className="text-sky-400" />
                      {locale === 'vi' ? 'Cấu Hình & Mã Nguồn Tối Ưu Thực Chiến' : 'Production Architecture Solution Code'}
                    </span>
                    <span className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-wider">Production Ready</span>
                  </div>
                  <CodeBlock
                    code={topic.productionProblemCase.productionCode}
                    language="java"
                    filename="DatabaseProductionOptimization.java"
                  />
                </div>
              )}

              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 font-mono text-xs text-text flex items-center gap-3">
                <Zap size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-emerald-400">
                    {locale === 'vi' ? 'Hiệu quả kiến trúc & Chỉ số đo lường: ' : 'Architectural Benchmark & Throughput: '}
                  </strong>
                  <span className="text-text-soft text-xs">
                    {tx(topic.productionProblemCase.architectureImpact)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: Binary Page Layout */}
        <section id="page-layout" className="space-y-6 scroll-mt-36">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
            <Binary size={16} />
            <span>{locale === 'vi' ? 'PHẦN 2 · CẤU TRÚC NHỊ PHÂN TRANG ĐĨA & BỘ NHỚ' : 'SECTION 2 · PHYSICAL PAGE BINARY LAYOUT'}</span>
          </div>

          <div className="rounded-2xl border border-border-soft bg-surface p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text">
                {tx(topic.pageLayout.title)}
              </h3>
              <p className="text-xs text-text-soft mt-1 leading-relaxed">
                {tx(topic.pageLayout.description)}
              </p>
            </div>

            {/* Monospace ASCII Architecture Diagram */}
            <div className="rounded-xl border border-border-soft bg-bg p-5 overflow-x-auto shadow-inner">
              <pre className="font-mono text-xs text-sky-300 leading-relaxed whitespace-pre">
                {topic.pageLayout.asciiDiagram}
              </pre>
            </div>

            {/* Header Byte Fields breakdown */}
            {topic.pageLayout.headerFields && topic.pageLayout.headerFields.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-text font-bold mb-3">
                  {locale === 'vi' ? 'Chi tiết các trường nhị phân trong Header:' : 'Binary Header Field Specifications:'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topic.pageLayout.headerFields.map((field, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-border-soft bg-surface/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-sky-400">{field.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border-soft text-text-soft">
                          {field.size}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-soft leading-relaxed">
                        {tx(field.description)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: Interactive Mechanism Stage */}
        <section id="mechanism" className="space-y-6 scroll-mt-36">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border-soft pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
              <GitBranch size={16} />
              <span>{locale === 'vi' ? 'PHẦN 3 · HOẠT HỌA CƠ CHẾ CHUYỂN ĐỘNG & BƯỚC THỰC THI' : 'SECTION 3 · STEP-BY-STEP MECHANISM STAGE'}</span>
            </div>

            {/* Step selector pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {topic.steps.map((s, idx) => {
                const isSelected = (activeStep ?? 0) === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectStep(idx)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all',
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-md shadow-sky-500/20'
                        : 'border-border-soft text-text-soft hover:text-text hover:border-text-soft bg-surface'
                    )}
                  >
                    <span>Step {idx + 1}</span>
                    <span className="opacity-80 hidden sm:inline">· {s.phase}</span>
                  </button>
                );
              })}
              <Link
                href="/database/playground"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-400 text-xs font-mono font-medium hover:bg-sky-500/20 transition-colors ml-2"
              >
                <Play size={12} fill="currentColor" />
                <span>{locale === 'vi' ? 'Live Simulator' : 'Live Simulator'}</span>
              </Link>
              <button
                onClick={() => setIsTheaterMode((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ml-2',
                  isTheaterMode
                    ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                    : 'border-border-soft text-text-soft hover:text-text bg-surface hover:border-text-soft'
                )}
                title={isTheaterMode ? (locale === 'vi' ? 'Thu gọn sân khấu' : 'Standard View') : (locale === 'vi' ? 'Mở rộng sân khấu toàn chiều rộng' : 'Expand Stage')}
              >
                {isTheaterMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span className="hidden sm:inline">
                  {isTheaterMode
                    ? (locale === 'vi' ? 'Thu gọn' : 'Standard')
                    : (locale === 'vi' ? 'Mở rộng sân khấu' : 'Expand')}
                </span>
              </button>
            </div>
          </div>

          {/* SVG GSAP Choreographed Stage & Step Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className={cn(
              'rounded-2xl border border-border-soft overflow-hidden bg-surface shadow-md transition-all duration-300',
              isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-8'
            )}>
              <DatabaseIllustrationStage
                topic={topic}
                activeStep={activeStep}
                onStepChange={setActiveStep}
                emphasizeStep={hoverStep}
                seekStep={seekStep}
                onSeekStep={setSeekStep}
                onReplay={handleReplay}
              />
            </div>

            {/* Step Technical Card */}
            <div className={cn(
              'rounded-2xl border border-border-soft bg-surface p-6 space-y-4 transition-all duration-300',
              isTheaterMode ? 'lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-start space-y-0' : 'lg:col-span-4'
            )}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
                    {currentStep.phase} · Step {shownStep + 1} of {topic.steps.length}
                  </span>
                </div>

                <h4 className="text-base font-bold text-text">
                  {tx(currentStep.title)}
                </h4>
                <p className="text-xs text-text-soft leading-relaxed">
                  {tx(currentStep.description)}
                </p>
              </div>

              {/* Disk I/O & Lock Behavior Callout */}
              <div className={cn(
                'flex items-start gap-2.5',
                isTheaterMode ? 'border-t md:border-t-0 md:border-l md:pl-6 border-border-soft pt-4 md:pt-0' : 'pt-3 border-t border-border-soft'
              )}>
                <HardDrive size={15} className="text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs font-mono">
                  <span className="text-sky-400 font-semibold">{locale === 'vi' ? 'Hành vi Đĩa & Khóa:' : 'Disk I/O & Lock:'} </span>
                  <span className="text-text-soft block mt-0.5">{tx(currentStep.diskIoBehavior)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Production Code & Spring Boot Workspace */}
        <section id="code-workspace" className="space-y-6 scroll-mt-36">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border-soft pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
              <FileCode2 size={16} />
              <span>{locale === 'vi' ? 'PHẦN 4 · CẤU HÌNH SPRING BOOT, SQL QUERY & MÃ NGUỒN' : 'SECTION 4 · SPRING BOOT CONFIG & SQL WORKSPACE'}</span>
            </div>

            {/* Code Workspace Tab Switcher */}
            <div className="flex items-center p-1 rounded-xl border border-border-soft bg-surface">
              {topic.springBootCode && (
                <button
                  onClick={() => setCodeTab('springboot')}
                  className={cn(
                    'px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all',
                    codeTab === 'springboot'
                      ? 'bg-sky-500 text-white font-bold shadow-sm'
                      : 'text-text-soft hover:text-text'
                  )}
                >
                  Spring Boot 3.x
                </button>
              )}
              {topic.sqlQueries && (
                <button
                  onClick={() => setCodeTab('sql')}
                  className={cn(
                    'px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all',
                    codeTab === 'sql'
                      ? 'bg-sky-500 text-white font-bold shadow-sm'
                      : 'text-text-soft hover:text-text'
                  )}
                >
                  Production SQL &amp; EXPLAIN
                </button>
              )}
              <button
                onClick={() => setCodeTab('engine')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all',
                  codeTab === 'engine'
                    ? 'bg-sky-500 text-white font-bold shadow-sm'
                    : 'text-text-soft hover:text-text'
                )}
              >
                Java 21 Engine Kernel
              </button>
            </div>
          </div>

          {/* Render Active Tab Code */}
          <div className="space-y-4">
            {codeTab === 'springboot' && topic.springBootCode && (
              <CodeBlock
                code={topic.springBootCode}
                language="java"
                filename="application.yml & SpringService.java"
              />
            )}

            {codeTab === 'sql' && topic.sqlQueries && (
              <CodeBlock
                code={topic.sqlQueries}
                language="java"
                filename="production_queries.sql"
              />
            )}

            {codeTab === 'engine' && (
              <CodeBlock
                code={topic.javaCode}
                language="java"
                highlightLines={highlight}
                filename={`${topic.name.replace(/[^a-zA-Z]/g, '')}.java`}
              />
            )}
          </div>
        </section>

        {/* SECTION 5: Production Engines & Kernel Tuning */}
        <section id="production" className="space-y-6 scroll-mt-36">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
            <Sliders size={16} />
            <span>{locale === 'vi' ? 'PHẦN 5 · THỰC THI THỰC TẾ & THAM SỐ CẤU HÌNH PRODUCTION' : 'SECTION 5 · PRODUCTION ENGINES & KERNEL TUNING'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topic.productionEngines.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border-soft bg-surface p-6 flex flex-col justify-between hover:border-sky-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server size={16} className="text-sky-400" />
                      <h3 className="font-mono text-sm font-bold text-text">
                        {item.engine}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-2">
                    {item.implementationName}
                  </span>

                  <p className="text-xs text-text-soft leading-relaxed mb-4">
                    {tx(item.keyMechanism)}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-soft space-y-2">
                  <div className="rounded bg-bg p-2.5 border border-border-soft font-mono text-[11px] text-emerald-400">
                    <span className="text-text-soft text-[10px] block mb-0.5">TUNING PARAMETER:</span>
                    <code>{item.defaultTuningConfig}</code>
                  </div>
                  <p className="text-[11px] font-mono text-text-muted leading-relaxed">
                    {tx(item.architectureNote)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Engineering Trade-offs */}
        <section id="tradeoffs" className="space-y-6 scroll-mt-36">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
            <Scale size={16} />
            <span>{locale === 'vi' ? 'PHẦN 6 · ĐÁNH ĐỔI KỸ THUẬT & KHUẾCH ĐẠI GHI (WAF)' : 'SECTION 6 · ARCHITECTURAL TRADE-OFFS & WAF'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <h4 className="font-mono text-sm uppercase tracking-wider text-emerald-400 font-bold mb-4 flex items-center gap-2">
                <Check size={16} />
                <span>{locale === 'vi' ? 'ƯU THẾ KIẾN TRÚC' : 'ENGINE ADVANTAGES'}</span>
              </h4>
              <ul className="space-y-3">
                {topic.tradeoffs.pros.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-text-soft leading-relaxed">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{tx(p)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
              <h4 className="font-mono text-sm uppercase tracking-wider text-amber-400 font-bold mb-4 flex items-center gap-2">
                <span className="text-amber-400 font-bold">✕</span>
                <span>{locale === 'vi' ? 'ĐÁNH ĐỔI & HẠN CHẾ' : 'TRADE-OFFS & DRAWBACKS'}</span>
              </h4>
              <ul className="space-y-3">
                {topic.tradeoffs.cons.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-text-soft leading-relaxed">
                    <span className="text-amber-400 mt-0.5">✕</span>
                    <span>{tx(c)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Write Amplification Factor Box */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold block mb-1">
                {locale === 'vi' ? 'KHUẾCH ĐẠI GHI (WRITE AMPLIFICATION FACTOR - WAF)' : 'WRITE AMPLIFICATION FACTOR (WAF)'}
              </span>
              <p className="text-xs text-text-soft leading-relaxed max-w-3xl">
                {tx(topic.tradeoffs.writeAmplification)}
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-mono text-xs font-bold whitespace-nowrap">
              ACID Verified
            </div>
          </div>
        </section>

        {/* Prev / Next Pagination */}
        <nav className="border-t border-border-soft pt-8 flex items-center justify-between">
          {prev ? (
            <Link
              href={`/database/${prev.id}`}
              className="group flex flex-col items-start gap-1 p-3 rounded-xl hover:bg-surface transition-colors"
            >
              <span className="flex items-center gap-1.5 text-xs font-mono text-text-soft group-hover:text-sky-400">
                <ArrowLeft size={12} />
                <span>{locale === 'vi' ? 'Chủ đề trước' : 'Previous Topic'}</span>
              </span>
              <span className="text-sm font-bold text-text group-hover:text-sky-400">
                {prev.name}
              </span>
            </Link>
          ) : <div />}

          {next ? (
            <Link
              href={`/database/${next.id}`}
              className="group flex flex-col items-end gap-1 p-3 rounded-xl hover:bg-surface transition-colors text-right"
            >
              <span className="flex items-center gap-1.5 text-xs font-mono text-text-soft group-hover:text-sky-400">
                <span>{locale === 'vi' ? 'Chủ đề kế tiếp' : 'Next Topic'}</span>
                <ArrowRight size={12} />
              </span>
              <span className="text-sm font-bold text-text group-hover:text-sky-400">
                {next.name}
              </span>
            </Link>
          ) : <div />}
        </nav>
      </main>
    </article>
  );
}
