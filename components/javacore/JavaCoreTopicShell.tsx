'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Zap,
  Play,
  FileCode2,
  Cpu,
  ShieldCheck,
  Binary,
  BookOpen,
  Terminal,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Settings,
  Scale,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GraduationCap
} from 'lucide-react';
import { JavaCoreIllustrationStage } from './JavaCoreIllustrationStage';
import { CodeBlock } from '@/components/CodeBlock';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { JavaCoreTopic } from '@/lib/javacore/types';
import { getAdjacentJavaCoreTopics, JAVA_CORE_CATEGORY_META } from '@/lib/javacore/data';
import { JAVA_CORE_SCENE_META } from '@/lib/javacore/scene-meta';
import { linesForStep } from '@/lib/patterns/scene';
import { TopicMinimap, type TopicSection } from '@/components/TopicMinimap';

interface JavaCoreTopicShellProps {
  topic: JavaCoreTopic;
}

type CodeTab = 'java21' | 'jvmFlags' | 'bytecode';

const DIFFICULTY_LABELS: Record<1 | 2 | 3, { en: string; vi: string }> = {
  1: { en: 'Core Fundamentals', vi: 'Cơ bản Nền tảng' },
  2: { en: 'Advanced Concurrency & Memory', vi: 'Nâng cao Đa luồng & Bộ nhớ' },
  3: { en: 'Deep HotSpot JVM Internals', vi: 'Chuyên sâu Nhân HotSpot JVM' }
};

export function JavaCoreTopicShell({ topic }: JavaCoreTopicShellProps) {
  const { tx, locale } = useLocale();
  const searchParams = useSearchParams();
  const meta = JAVA_CORE_SCENE_META[topic.id];
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
  const [codeTab, setCodeTab] = useState<CodeTab>('java21');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0);

  const { prev, next } = getAdjacentJavaCoreTopics(topic.id);
  const shownStep = hoverStep ?? activeStep ?? 0;

  const highlight = useMemo(() => {
    if (shownStep == null || !meta || codeTab !== 'java21') return null;
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

  useEffect(() => {
    if (isTheaterMode) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsTheaterMode(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isTheaterMode]);

  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setSeekStep(index);
    setHoverStep(null);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('step', String(index + 1));
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('step', String((activeStep ?? 0) + 1));
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const categoryMeta = JAVA_CORE_CATEGORY_META[topic.category];

  const minimapSections = useMemo<TopicSection[]>(() => {
    interface RawSectionItem {
      id: string;
      shortTitle: { vi: string; en: string };
      titleBase: { vi: string; en: string };
      icon: typeof Play;
    }

    const rawList: RawSectionItem[] = [
      {
        id: 'mechanism',
        shortTitle: { vi: 'Hoạt họa', en: 'Visualizer' },
        titleBase: { vi: 'Hoạt họa cơ chế nhân HotSpot', en: 'HotSpot Mechanism Stage' },
        icon: Play
      }
    ];

    if (topic.memoryLayout) {
      rawList.push({
        id: 'memory-layout',
        shortTitle: { vi: 'Bộ nhớ', en: 'Layout' },
        titleBase: { vi: 'Bố cục ô nhớ 64-bit / JOL', en: '64-Bit Memory Layout' },
        icon: Binary
      });
    }

    rawList.push(
      {
        id: 'code-workspace',
        shortTitle: { vi: 'Mã nguồn', en: 'Code' },
        titleBase: { vi: 'Java 21, Flags & Bytecode', en: 'Java 21, Flags & Bytecode' },
        icon: FileCode2
      },
      {
        id: 'theory',
        shortTitle: { vi: 'Lý thuyết', en: 'Theory' },
        titleBase: { vi: 'Bản chất lý thuyết & Phần cứng', en: 'Theoretical Foundations' },
        icon: BookOpen
      }
    );

    if (topic.productionProblemCase) {
      rawList.push({
        id: 'production-case',
        shortTitle: { vi: 'Thực tế', en: 'Case' },
        titleBase: { vi: 'Bài toán kinh điển thực tế', en: 'Classic Production Case' },
        icon: AlertTriangle
      });
    }

    rawList.push(
      {
        id: 'production',
        shortTitle: { vi: 'JVM Flags', en: 'JVM Flags' },
        titleBase: { vi: 'Cấu hình HotSpot JVM thực chiến', en: 'Production JVM Flags & Tuning' },
        icon: Settings
      },
      {
        id: 'tradeoffs',
        shortTitle: { vi: 'Đánh đổi', en: 'Trade-offs' },
        titleBase: { vi: 'Đánh đổi kỹ thuật & Cạm bẫy', en: 'Architectural Trade-offs' },
        icon: Scale
      }
    );

    if (topic.interviewQuestions && topic.interviewQuestions.length > 0) {
      rawList.push({
        id: 'interview',
        shortTitle: { vi: 'Phỏng vấn', en: 'Interview' },
        titleBase: { vi: 'Bộ câu hỏi phỏng vấn tuyển dụng', en: 'Technical Interview Q&A' },
        icon: HelpCircle
      });
    }

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
  }, [topic.memoryLayout, topic.productionProblemCase, topic.interviewQuestions]);

  return (
    <div className="relative min-h-screen pb-24 text-text">
      {/* Blueprint Ambient Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-soft)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Breadcrumb & Navigation Bar */}
      <div className="border-b border-border-soft bg-bg/95 dark:bg-[#0f0d0a]/95 backdrop-blur-md shadow-xs sticky top-14 z-30">
        <div className="mx-auto flex max-w-wide items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/java-core"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-text-muted hover:text-rose-500 transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline-block">{locale === 'vi' ? 'Quay lại Java Core Hub' : 'Back to Java Core Hub'}</span>
              <span className="sm:hidden">Java Core</span>
            </Link>
            <span className="text-text-muted/40 hidden sm:inline-block">/</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-rose-500 font-semibold">
              <Cpu size={13} />
              {tx(categoryMeta.label)}
            </span>
          </div>

          {/* Compact Modern Topic Minimap Stepper */}
          <TopicMinimap
            sections={minimapSections}
            locale={locale === 'vi' ? 'vi' : 'en'}
            accentColor="rose"
          />

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-elevated px-2.5 py-1 text-xs font-mono text-text-muted hover:text-text transition-colors"
              title={locale === 'vi' ? 'Sao chép liên kết bước này' : 'Copy link to current step'}
            >
              {copiedLink ? <Check size={12} className="text-emerald-500" /> : <Link2 size={12} />}
              <span className="text-[11px]">{copiedLink ? (locale === 'vi' ? 'Đã chép' : 'Copied') : (locale === 'vi' ? 'Chia sẻ' : 'Share')}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-wide px-6 pt-8 space-y-12">
        {/* Topic Header Hero */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 font-mono text-xs font-medium text-rose-500">
              <Cpu size={12} />
              {tx(categoryMeta.label)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-elevated px-3 py-1 font-mono text-xs text-text-muted">
              <Zap size={12} className="text-amber-500" />
              {locale === 'vi' ? DIFFICULTY_LABELS[topic.difficulty].vi : DIFFICULTY_LABELS[topic.difficulty].en}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-elevated px-3 py-1 font-mono text-xs text-text-muted">
              <Clock size={12} />
              {topic.estimatedMinutes} {locale === 'vi' ? 'phút đọc & mổ xẻ' : 'min deep dive'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-medium text-emerald-500">
              Java 21 LTS &middot; HotSpot VM
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-mono">
            {topic.name}
          </h1>

          <p className="text-lg text-text-muted max-w-4xl leading-relaxed">
            {tx(topic.tagline)}
          </p>
        </section>

        {/* Section 1: Interactive Animation Mechanism Stage */}
        <section id="mechanism" className="space-y-4 scroll-mt-36">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-rose-500 flex items-center gap-2">
                <Play size={14} />
                {locale === 'vi' ? 'Hoạt Họa Cơ Chế Nhân HotSpot JVM' : 'HotSpot JVM Kernel Mechanism Stage'}
              </h2>
              <p className="text-xs text-text-muted font-mono mt-0.5">
                {locale === 'vi'
                  ? 'Mô phỏng chuyển động trực quan từng chu kỳ CPU & phân bố ô nhớ RAM'
                  : 'Interactive real-time visualization of CPU instruction cycles and RAM layout'}
              </p>
            </div>

            {/* Theater Mode Toggle */}
            <button
              onClick={() => setIsTheaterMode(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface hover:bg-surface-elevated px-3 py-1.5 text-xs font-mono font-medium text-text-muted hover:text-text hover:border-rose-500 transition-all shadow-sm"
              title={locale === 'vi' ? 'Mở rộng toàn màn hình Theater' : 'Expand full-screen stage'}
            >
              <Maximize2 size={13} className="text-rose-500" />
              <span>{locale === 'vi' ? 'Phóng to' : 'Theater View'}</span>
            </button>
          </div>

          {/* Motion Stage Canvas (Standard View) */}
          <div className="w-full">
            <JavaCoreIllustrationStage
              topic={topic}
              activeStep={activeStep}
              onStepChange={setActiveStep}
              emphasizeStep={shownStep}
              seekStep={seekStep}
              onSeekStep={setSeekStep}
            />
          </div>

          {/* Step Seeking Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {topic.steps.map((s, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectStep(idx)}
                  onMouseEnter={() => setHoverStep(idx)}
                  onMouseLeave={() => setHoverStep(null)}
                  className={cn(
                    'group relative flex flex-col text-left p-3.5 rounded-xl border transition-all text-xs font-mono',
                    isActive
                      ? 'border-rose-500 bg-rose-500/10 shadow-sm'
                      : 'border-border-soft bg-surface hover:bg-surface-elevated text-text-muted'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
                        isActive ? 'bg-rose-500 text-white' : 'bg-surface-elevated text-text-muted'
                      )}
                    >
                      {String(idx + 1).padStart(2, '0')} &middot; {s.phase}
                    </span>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />}
                  </div>
                  <span className={cn('font-bold line-clamp-1', isActive ? 'text-text' : 'text-text/80')}>
                    {tx(s.title)}
                  </span>
                  <p className="mt-1 text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                    {tx(s.description)}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: 64-bit Memory Layout ASCII Architecture Card */}
        {topic.memoryLayout && (
          <section id="memory-layout" className="space-y-3 scroll-mt-36">
            <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-text flex items-center gap-2">
              <Binary size={15} className="text-rose-500" />
              {tx(topic.memoryLayout.title)}
            </h2>
            <div className="rounded-xl border border-border-soft bg-surface-elevated p-4 md:p-6 overflow-x-auto font-mono text-xs leading-relaxed">
              <pre className="text-emerald-500/90 whitespace-pre">
                {topic.memoryLayout.asciiDiagram}
              </pre>
              <div className="mt-4 pt-4 border-t border-border-soft text-text-muted text-xs leading-relaxed">
                <span className="font-bold text-text">
                  {locale === 'vi' ? 'Giải phẫu vùng nhớ: ' : 'Physical Layout Breakdown: '}
                </span>
                {tx(topic.memoryLayout.description)}
              </div>

              {topic.memoryLayout.byteFields && topic.memoryLayout.byteFields.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-soft/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {topic.memoryLayout.byteFields.map((field, fIdx) => (
                    <div key={fIdx} className="rounded-lg border border-border-soft bg-surface p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-rose-500">{field.name}</span>
                        <span className="text-emerald-500">{field.size}</span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-normal">
                        {tx(field.description)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 3: Dual/Triple-Tab Code & JVM Workspace */}
        <section id="code-workspace" className="space-y-4 scroll-mt-36">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-soft pb-3">
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-text flex items-center gap-2">
                <FileCode2 size={15} className="text-rose-500" />
                {locale === 'vi' ? 'Mã Nguồn Java 21, JVM Flags & Bytecode' : 'Java 21 Source, JVM Flags & Bytecode'}
              </h2>
              <p className="text-xs text-text-muted font-mono mt-0.5">
                {codeTab === 'java21' && (locale === 'vi' ? 'Mã nguồn Java 21 hiện đại đồng bộ hóa với hoạt họa' : 'Modern Java 21 implementation synchronized with animation steps')}
                {codeTab === 'jvmFlags' && (locale === 'vi' ? 'Bố cục nhớ JOL & Cờ cấu hình nhân HotSpot JVM' : 'JOL memory layout inspection & HotSpot JVM production flags')}
                {codeTab === 'bytecode' && (locale === 'vi' ? 'Mã máy Bytecode javap chi tiết từng Opcode' : 'Disassembled javap bytecode instructions and operand stack states')}
              </p>
            </div>

            {/* Code Tabs */}
            <div className="inline-flex rounded-lg border border-border-soft bg-surface p-1">
              <button
                onClick={() => setCodeTab('java21')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-mono font-medium transition-colors',
                  codeTab === 'java21'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-text-muted hover:text-text'
                )}
              >
                Java 21 Modern
              </button>
              {topic.jvmFlagsCode && (
                <button
                  onClick={() => setCodeTab('jvmFlags')}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-mono font-medium transition-colors',
                    codeTab === 'jvmFlags'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-text-muted hover:text-text'
                  )}
                >
                  JVM Flags / JOL
                </button>
              )}
              {topic.bytecodeInspection && (
                <button
                  onClick={() => setCodeTab('bytecode')}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-mono font-medium transition-colors',
                    codeTab === 'bytecode'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-text-muted hover:text-text'
                  )}
                >
                  Bytecode (javap)
                </button>
              )}
            </div>
          </div>

          {/* Active Code Block */}
          <div className="rounded-xl border border-border-soft overflow-hidden bg-surface">
            {codeTab === 'java21' && (
              <CodeBlock
                code={topic.javaCode}
                language="java"
                highlightLines={highlight}
                filename={`${topic.name.replace(/[^a-zA-Z0-9]/g, '')}.java`}
              />
            )}
            {codeTab === 'jvmFlags' && topic.jvmFlagsCode && (
              <CodeBlock
                code={topic.jvmFlagsCode}
                language="java"
                filename="hotspot_jvm_flags_and_jol.txt"
              />
            )}
            {codeTab === 'bytecode' && topic.bytecodeInspection && (
              <CodeBlock
                code={topic.bytecodeInspection}
                language="java"
                filename="javap_disassembly.bytecode"
              />
            )}
          </div>
        </section>

        {/* Section 4: Deep Core Theory & Hardware Physics */}
        <section id="theory" className="space-y-6 scroll-mt-36">
          <div className="border-b border-border-soft pb-3">
            <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-rose-500 flex items-center gap-2">
              <BookOpen size={15} />
              {locale === 'vi' ? 'Bản Chất Lý Thuyết & Ràng Buộc Vật Lý Phần Cứng' : 'Theoretical Foundations & Physical Hardware Boundaries'}
            </h2>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {locale === 'vi'
                ? 'Giải phẫu các giới hạn vật lý CPU cache L1/L2/L3, rào cản bộ nhớ, con trỏ nén OOPs & HotSpot C++ kernel'
                : 'In-depth analysis of L1/L2/L3 cache lines, memory barriers, compressed OOPs and HotSpot C++ kernel structs'}
            </p>
          </div>

          {/* 3 Core Theory Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border-soft bg-surface p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-500 font-mono text-xs font-bold uppercase">
                <AlertTriangle size={14} />
                {locale === 'vi' ? '1. Vấn đề thực tế' : '1. Core Problem'}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {tx(topic.coreTheory.problemStatement)}
              </p>
            </div>

            <div className="rounded-xl border border-border-soft bg-surface p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold uppercase">
                <Cpu size={14} />
                {locale === 'vi' ? '2. Giới hạn vật lý CPU/RAM' : '2. Hardware Constraint'}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {tx(topic.coreTheory.hardwareConstraint)}
              </p>
            </div>

            <div className="rounded-xl border border-border-soft bg-surface p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs font-bold uppercase">
                <ShieldCheck size={14} />
                {locale === 'vi' ? '3. Giải pháp JVM HotSpot' : '3. HotSpot Solution'}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {tx(topic.coreTheory.fundamentalSolution)}
              </p>
            </div>
          </div>

          {/* Mathematical Complexity Bar */}
          <div className="rounded-xl border border-border-soft bg-surface-elevated p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-text font-bold">
              <span className="flex items-center gap-2 text-rose-500">
                <Scale size={14} />
                {locale === 'vi' ? 'Độ phức tạp & Chi phí bộ nhớ vật lý' : 'Computational & Physical Memory Complexity'}
              </span>
              <span className="text-emerald-500">{topic.coreTheory.math.timeComplexity}</span>
            </div>
            <p className="text-text-muted text-[11px]">
              {topic.coreTheory.math.formula} &middot; {tx(topic.coreTheory.math.description)}
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-text-muted/80">
              <span><strong>Space:</strong> {topic.coreTheory.math.spaceComplexity}</span>
              {topic.coreTheory.math.memoryOverheadFormula && (
                <span><strong>Overhead:</strong> {topic.coreTheory.math.memoryOverheadFormula}</span>
              )}
            </div>
          </div>

          {/* Detailed Paragraphs Deep-Dive (if available) */}
          {topic.detailedTheory && (
            <div className="rounded-xl border border-border-soft bg-surface p-6 space-y-4">
              <h3 className="font-mono text-sm font-bold text-text">
                {locale === 'vi' ? 'Mổ xẻ nguyên lý chuyên sâu' : 'Exhaustive Architectural Breakdown'}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {tx(topic.detailedTheory.overview)}
              </p>
              <div className="space-y-3 pt-2">
                {topic.detailedTheory.deepDiveParagraphs.map((para, pIdx) => (
                  <div
                    key={pIdx}
                    className="rounded-lg border border-border-soft/60 bg-surface-elevated/50 p-4 text-xs text-text-muted leading-relaxed"
                  >
                    {tx(para)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 4.5: Bài Toán Kinh Điển Trong Project Thật (Enterprise Production Case Study) */}
        {topic.productionProblemCase && (
          <section id="production-case" className="space-y-4 scroll-mt-36">
            <div className="border-b border-border-soft pb-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold text-amber-500 mb-2">
                <AlertTriangle size={13} />
                <span>{locale === 'vi' ? 'Bài Toán Kinh Điển Trong Project Thật' : 'Classic Enterprise Production Case Study'}</span>
              </div>
              <h2 className="text-lg font-bold font-mono text-text">
                {tx(topic.productionProblemCase.title)}
              </h2>
              <p className="text-xs text-text-muted font-mono mt-1">
                <strong>{locale === 'vi' ? 'Bối cảnh thực tế: ' : 'Production Scenario: '}</strong>
                {tx(topic.productionProblemCase.businessContext)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Why Naive Approach Fails */}
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-500 font-mono text-xs font-bold uppercase">
                  <XCircle size={15} />
                  <span>{locale === 'vi' ? 'Sai Lầm Thường Gặp & Thất Bại Trong Production' : 'Naive Pitfall & Production Failure'}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {tx(topic.productionProblemCase.whyNaiveFails)}
                </p>
              </div>

              {/* Right Column: Deep Core Architecture Solution */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs font-bold uppercase">
                  <CheckCircle2 size={15} />
                  <span>{locale === 'vi' ? 'Giải Pháp Kiến Trúc Cốt Lõi Tầng Sâu' : 'Deep Architectural Solution'}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {tx(topic.productionProblemCase.coreSolution)}
                </p>
              </div>
            </div>

            {/* Production Code Snippet if present */}
            {topic.productionProblemCase.productionCode && (
              <div className="rounded-xl border border-border-soft overflow-hidden bg-surface">
                <div className="border-b border-border-soft px-4 py-2 bg-surface-elevated/40 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text font-bold flex items-center gap-2">
                    <FileCode2 size={13} className="text-emerald-500" />
                    {locale === 'vi' ? 'Mã Nguồn Giải Pháp Thực Chiến Chuẩn Production' : 'Production Solution Architecture Code'}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Java 21 LTS</span>
                </div>
                <CodeBlock
                  code={topic.productionProblemCase.productionCode}
                  language="java"
                  filename="ProductionSolution.java"
                />
              </div>
            )}

            {/* Architecture Metric Impact */}
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 font-mono text-xs text-text flex items-center gap-3">
              <Zap size={16} className="text-emerald-500 shrink-0" />
              <div>
                <strong className="text-emerald-500">
                  {locale === 'vi' ? 'Chỉ số đo lường hiệu năng & Lợi ích kiến trúc: ' : 'Architectural Benchmark & Production Impact: '}
                </strong>
                <span className="text-text-muted text-xs">
                  {tx(topic.productionProblemCase.architectureImpact)}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Section 5: Production HotSpot JVM Engines & Default Flags */}
        <section id="production" className="space-y-4 scroll-mt-36">
          <div className="border-b border-border-soft pb-3">
            <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-text flex items-center gap-2">
              <Settings size={15} className="text-rose-500" />
              {locale === 'vi' ? 'Cấu Hình HotSpot JVM Flags Thực Chiến' : 'Production HotSpot JVM Flags & Real-World Use Cases'}
            </h2>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {locale === 'vi'
                ? 'Tham số JVM Flags tinh chỉnh hiệu năng cao trong môi trường Kubernetes & Enterprise'
                : 'Performance tuning JVM flags and architectural trade-offs for high-throughput enterprise systems'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {topic.productionJvmEngines.map((engine, eIdx) => (
              <div
                key={eIdx}
                className="rounded-xl border border-border-soft bg-surface p-5 space-y-3 font-mono text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-500 text-sm">{engine.jvmEngine}</span>
                    <span className="text-text-muted">&middot;</span>
                    <span className="text-text font-medium">{engine.implementationName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-text-muted text-[11px]">
                    <strong className="text-text">{locale === 'vi' ? 'Cơ chế cốt lõi: ' : 'Key Mechanism: '}</strong>
                    {tx(engine.keyMechanism)}
                  </div>
                  <div className="text-text-muted text-[11px]">
                    <strong className="text-emerald-500">{locale === 'vi' ? 'Ghi chú kiến trúc: ' : 'Architecture Note: '}</strong>
                    {tx(engine.architectureNote)}
                  </div>
                </div>

                {/* Flags pill */}
                <div className="pt-2">
                  <span className="text-[10px] text-text-muted block mb-1.5 font-bold uppercase">
                    {locale === 'vi' ? 'Cờ tham số JVM khuyên dùng:' : 'Recommended JVM Flags:'}
                  </span>
                  <code className="inline-block rounded-md border border-border-soft bg-surface-elevated px-2.5 py-1 text-[11px] text-emerald-500 font-bold">
                    {engine.defaultFlags}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Trade-offs & Production Pitfalls */}
        <section id="tradeoffs" className="space-y-6 scroll-mt-36">
          <div className="border-b border-border-soft pb-3">
            <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-rose-500 flex items-center gap-2">
              <Scale size={15} />
              {locale === 'vi' ? 'Đánh Đổi Kỹ Thuật & Cạm Bẫy Trong Sản Phẩm' : 'Architectural Trade-offs & Enterprise Pitfalls'}
            </h2>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {locale === 'vi'
                ? 'Ưu nhược điểm cấu trúc, cam kết đặc tả JVM và các sai lầm dẫn đến tràn bộ nhớ OOM'
                : 'Structural pros & cons, JVM specification guarantees, and fatal production memory traps'}
            </p>
          </div>

          {/* Pros vs Cons Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <CheckCircle2 size={16} />
                {locale === 'vi' ? 'Ưu điểm & Lợi ích hiệu năng' : 'Architectural Advantages'}
              </div>
              <ul className="space-y-2 text-[11px] text-text-muted leading-relaxed">
                {topic.tradeoffs.pros.map((p, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">&bull;</span>
                    <span>{tx(p)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <XCircle size={16} />
                {locale === 'vi' ? 'Nhược điểm & Giới hạn thiết kế' : 'Trade-offs & Constraints'}
              </div>
              <ul className="space-y-2 text-[11px] text-text-muted leading-relaxed">
                {topic.tradeoffs.cons.map((c, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">&bull;</span>
                    <span>{tx(c)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* JVM Spec Guarantee & Footprint */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border-soft bg-surface p-4 font-mono text-xs space-y-1.5">
              <span className="font-bold text-text block">
                {locale === 'vi' ? 'Cam kết đặc tả JVM (JVM Spec Guarantee):' : 'JVM Spec Guarantee:'}
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                {tx(topic.tradeoffs.jvmSpecificationGuarantee)}
              </p>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-4 font-mono text-xs space-y-1.5">
              <span className="font-bold text-text block">
                {locale === 'vi' ? 'Chi phí ô nhớ vật lý (Memory Footprint):' : 'Physical Memory Footprint:'}
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                {tx(topic.tradeoffs.memoryFootprint)}
              </p>
            </div>
          </div>

          {/* Enterprise Pitfalls (if available) */}
          {topic.detailedTheory?.enterprisePitfalls && topic.detailedTheory.enterprisePitfalls.length > 0 && (
            <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold font-mono text-xs uppercase">
                <AlertTriangle size={16} />
                <span>{locale === 'vi' ? 'BẪY HIỆU NĂNG THỰC TẾ & SAI LẦM DOANH NGHIỆP CẦN TRÁNH' : 'PRODUCTION PITFALLS & PERFORMANCE ANTI-PATTERNS'}</span>
              </div>
              <ul className="space-y-2.5">
                {topic.detailedTheory.enterprisePitfalls.map((pit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-text-muted leading-relaxed font-mono">
                    <span className="text-amber-500 font-bold mt-0.5">!</span>
                    <span>{tx(pit)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Section 7: Senior Technical Interview Q&A */}
        {topic.interviewQuestions && topic.interviewQuestions.length > 0 && (
          <section id="interview" className="space-y-6 scroll-mt-36">
            <div className="border-b border-border-soft pb-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-medium text-amber-500 mb-2">
                <GraduationCap size={14} />
                <span>FAANG &amp; High-Throughput System Interview Prep</span>
              </div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-text flex items-center gap-2">
                <HelpCircle size={15} className="text-amber-500" />
                {locale === 'vi' ? 'Bộ Câu Hỏi Phỏng Vấn Kỹ Thuật Chuyên Sâu' : 'Technical Interview Q&A & FAANG Trap Drills'}
              </h2>
              <p className="text-xs text-text-muted font-mono mt-0.5">
                {locale === 'vi'
                  ? 'Các câu hỏi phân loại ứng viên từ Junior đến Tech Lead, bẫy tuyển dụng kinh điển và câu trả lời ghi điểm tối đa'
                  : 'Screening questions from Junior to Principal Engineer, common interview traps, and high-scoring model responses'}
              </p>
            </div>

            <div className="space-y-4">
              {topic.interviewQuestions.map((q, qIdx) => {
                const isOpen = expandedQuestionIdx === qIdx;
                const seniorityBadgeColor =
                  q.seniority === 'Junior'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                    : q.seniority === 'Mid'
                    ? 'border-sky-500/30 bg-sky-500/10 text-sky-500'
                    : q.seniority === 'Senior'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-500';

                return (
                  <div
                    key={qIdx}
                    className={cn(
                      'rounded-2xl border transition-all duration-200 overflow-hidden',
                      isOpen
                        ? 'border-amber-500/40 bg-surface shadow-lg'
                        : 'border-border-soft bg-surface/60 hover:border-border-soft/80'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedQuestionIdx(isOpen ? null : qIdx)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-surface-elevated/40"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span
                          className={cn(
                            'shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase',
                            seniorityBadgeColor
                          )}
                        >
                          {q.seniority}
                        </span>
                        <h3 className="font-mono text-xs sm:text-sm font-bold text-text leading-snug">
                          {tx(q.question)}
                        </h3>
                      </div>
                      <span className="shrink-0 text-text-muted transition-transform">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-border-soft/60 px-5 pb-5 pt-4 space-y-4"
                        >
                          {/* Core Answer */}
                          <div className="rounded-xl border border-border-soft/80 bg-surface-elevated/60 p-4 space-y-2">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                              <CheckCircle2 size={13} />
                              {locale === 'vi' ? 'Câu trả lời chuẩn mực & Bản chất kỹ thuật:' : 'Authoritative Model Answer:'}
                            </span>
                            <p className="text-xs text-text-muted leading-relaxed font-mono whitespace-pre-line">
                              {tx(q.answer)}
                            </p>
                          </div>

                          {/* Trap Warning */}
                          {q.trapWarning && (
                            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-1.5">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                                <AlertTriangle size={13} />
                                {locale === 'vi' ? 'Bẫy phỏng vấn ứng viên thường trượt:' : 'Common Interview Trap / Anti-pattern:'}
                              </span>
                              <p className="text-xs text-text-muted leading-relaxed font-mono">
                                {tx(q.trapWarning)}
                              </p>
                            </div>
                          )}

                          {/* Pro Tip */}
                          {q.proTip && (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                                <Sparkles size={13} />
                                {locale === 'vi' ? 'Ghi điểm với Technical Lead & System Architect:' : 'Pro-Tip for Lead / Architect Evaluation:'}
                              </span>
                              <p className="text-xs text-text-muted leading-relaxed font-mono">
                                {tx(q.proTip)}
                              </p>
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

        {/* Bottom Adjacent Topic Navigation */}
        <section className="pt-8 border-t border-border-soft flex flex-wrap items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/java-core/${prev.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-4 hover:bg-surface-elevated transition-colors text-left font-mono text-xs max-w-sm"
            >
              <ArrowLeft size={16} className="text-text-muted group-hover:-translate-x-1 transition-transform" />
              <div>
                <span className="text-[10px] text-text-muted uppercase block">
                  {locale === 'vi' ? 'Chủ đề trước' : 'Previous Topic'}
                </span>
                <span className="font-bold text-text group-hover:text-rose-500 transition-colors">
                  {prev.name}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/java-core/${next.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-4 hover:bg-surface-elevated transition-colors text-right font-mono text-xs max-w-sm ml-auto"
            >
              <div>
                <span className="text-[10px] text-text-muted uppercase block">
                  {locale === 'vi' ? 'Chủ đề kế tiếp' : 'Next Topic'}
                </span>
                <span className="font-bold text-text group-hover:text-rose-500 transition-colors">
                  {next.name}
                </span>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </section>
      </main>

      {/* Fullscreen Cinematic Theater Mode Modal */}
      <AnimatePresence>
        {isTheaterMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#070b14]/98 backdrop-blur-3xl flex flex-col justify-between p-4 sm:p-6 md:p-8 w-screen h-screen overflow-hidden text-text select-none"
          >
            {/* Theater Top Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border-soft/60 shrink-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 font-mono text-xs font-bold text-rose-500">
                  <Cpu size={13} />
                  {topic.name}
                </span>
                <span className="hidden sm:inline font-mono text-xs text-text-muted">
                  &middot; {locale === 'vi' ? 'Hoạt Họa Cơ Chế Toàn Màn Hình' : 'Full-Screen Cinematic Stage'}
                </span>
              </div>

              <button
                onClick={() => setIsTheaterMode(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-surface px-4 py-2 text-xs font-mono font-bold text-text hover:bg-rose-500/10 hover:border-rose-500 transition-all shadow-xl"
                title="Phím Esc để đóng"
              >
                <Minimize2 size={15} className="text-rose-500" />
                <span>{locale === 'vi' ? 'Thu nhỏ (Esc)' : 'Exit Theater (Esc)'}</span>
              </button>
            </div>

            {/* Massive Expanded Center Stage */}
            <div className="flex-1 w-full min-h-0 flex items-center justify-center p-2 sm:p-4 my-auto overflow-hidden">
              <div className="w-full h-full max-h-[calc(100vh-140px)] max-w-7xl flex flex-col justify-center">
                <JavaCoreIllustrationStage
                  topic={topic}
                  activeStep={activeStep}
                  onStepChange={setActiveStep}
                  emphasizeStep={shownStep}
                  seekStep={seekStep}
                  onSeekStep={setSeekStep}
                  aspect="auto"
                  className="h-full w-full flex flex-col justify-between"
                />
              </div>
            </div>

            {/* Theater Bottom Step Selector Pills */}
            <div className="pt-3 border-t border-border-soft/60 shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl mx-auto">
                {topic.steps.map((s, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectStep(idx)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-mono',
                        isActive
                          ? 'border-rose-500 bg-rose-500/15 shadow-md text-text'
                          : 'border-border-soft bg-surface/80 hover:bg-surface text-text-muted hover:text-text'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0',
                            isActive ? 'bg-rose-500 text-white' : 'bg-surface-elevated text-text-muted'
                          )}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-bold truncate">{tx(s.title)}</span>
                      </div>
                      {isActive && <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
