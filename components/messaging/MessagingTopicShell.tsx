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
  Info
} from 'lucide-react';
import { MessagingIllustrationStage } from './MessagingIllustrationStage';
import { CodeBlock } from '@/components/CodeBlock';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { MessagingTopic } from '@/lib/messaging/types';
import { getAdjacentMessagingTopics, MESSAGING_CATEGORY_META } from '@/lib/messaging/data';
import { MESSAGING_SCENE_META } from '@/lib/messaging/scene-meta';
import { linesForStep } from '@/lib/patterns/scene';
import { MathFormula } from '@/components/MathFormula';
import { TopicMinimap, type TopicSection } from '@/components/TopicMinimap';

interface MessagingTopicShellProps {
  topic: MessagingTopic;
}

type CodeTab = 'java' | 'springConfig';

const DIFFICULTY_LABELS: Record<1 | 2 | 3, { en: string; vi: string }> = {
  1: { en: 'Distributed Foundation', vi: 'Nền tảng Phân tán' },
  2: { en: 'Enterprise Messaging', vi: 'Kiến trúc Doanh nghiệp' },
  3: { en: 'High-Throughput Streaming', vi: 'Hạ tầng Streaming Chuyên sâu' }
};

export function MessagingTopicShell({ topic }: MessagingTopicShellProps) {
  const { tx, locale } = useLocale();
  const searchParams = useSearchParams();
  const meta = MESSAGING_SCENE_META[topic.id];
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
  const [codeTab, setCodeTab] = useState<CodeTab>('java');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [openInterviewIdx, setOpenInterviewIdx] = useState<number | null>(0);

  const { prev, next } = getAdjacentMessagingTopics(topic.id);
  const shownStep = hoverStep ?? activeStep ?? 0;

  const highlight = useMemo(() => {
    if (shownStep == null || !meta || codeTab !== 'java') return null;
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

  const catMeta = MESSAGING_CATEGORY_META[topic.category] || MESSAGING_CATEGORY_META['messaging-fundamentals'];
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
        titleBase: { vi: 'Bản chất & Lý thuyết Phân tán', en: 'Core Distributed Systems Theory' },
        icon: BookOpen
      }
    ];

    if (topic.productionProblemCase) {
      rawList.push({
        id: 'production-case',
        shortTitle: { vi: 'Thực tế', en: 'Case' },
        titleBase: { vi: 'Sự cố kinh điển trong dự án', en: 'Classic Production Problem Case' },
        icon: AlertTriangle
      });
    }

    rawList.push(
      {
        id: 'architecture',
        shortTitle: { vi: 'Kiến trúc', en: 'Topology' },
        titleBase: { vi: 'Cấu trúc Broker & Topology luồng tin', en: 'Physical Broker Topology & Flow' },
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
        titleBase: { vi: 'Mã nguồn Spring Boot 3 & Java 21', en: 'Spring Boot 3 & Java 21 Workspace' },
        icon: FileCode2
      },
      {
        id: 'brokers',
        shortTitle: { vi: 'So sánh', en: 'Brokers' },
        titleBase: { vi: 'So sánh RabbitMQ vs Apache Kafka', en: 'RabbitMQ vs Apache Kafka Comparison' },
        icon: Server
      }
    );

    if (topic.interviewQuestions && topic.interviewQuestions.length > 0) {
      rawList.push({
        id: 'interview',
        shortTitle: { vi: 'Phỏng vấn', en: 'Interview' },
        titleBase: { vi: 'Câu hỏi Phỏng vấn Hệ thống Phân tán (FAANG)', en: 'FAANG Distributed Systems Q&A' },
        icon: GraduationCap
      });
    }

    rawList.push({
      id: 'tradeoffs',
      shortTitle: { vi: 'Đánh đổi', en: 'Trade-offs' },
      titleBase: { vi: 'Bản chất Đánh đổi & Định luật Phân tán', en: 'Architectural Trade-offs & Invariants' },
      icon: Scale
    });

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
  }, [topic.productionProblemCase, topic.interviewQuestions]);

  return (
    <article className="relative min-h-screen pb-24 text-text">
      {/* Blueprint Sub-header Navigation */}
      <div className="border-b border-border-soft bg-bg/95 dark:bg-[#0b0a12]/95 backdrop-blur-md shadow-xs sticky top-14 z-30">
        <div className="mx-auto flex max-w-wide items-center justify-between gap-4 px-6 py-2.5">
          <Link
            href="/message-queue"
            className="group inline-flex items-center gap-2 text-xs font-mono text-text-muted transition-colors hover:text-purple-400 shrink-0"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            <span className="uppercase tracking-widest hidden sm:inline-block">
              {locale === 'vi' ? 'HÀNG ĐỢI & STREAMING' : 'MESSAGING OVERVIEW'}
            </span>
            <span className="uppercase tracking-widest sm:hidden">MESSAGING</span>
          </Link>

          {/* Compact Modern Topic Minimap Stepper */}
          <TopicMinimap
            sections={minimapSections}
            locale={locale === 'vi' ? 'vi' : 'en'}
            accentColor="purple"
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Layers size={12} />
              {topic.chapter} · {tx(catMeta.label)}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold',
                topic.level === 'core'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              )}
            >
              {topic.level === 'core' ? (locale === 'vi' ? '12 Bài Cốt Lõi (~4h)' : 'Core Track') : (locale === 'vi' ? 'Chuyên Đề Nâng Cao' : 'Advanced Track')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-text-muted">
              <Clock size={12} />
              {topic.estimatedMinutes} {locale === 'vi' ? 'phút đọc & thực hành' : 'min read'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-text-muted">
              <Zap size={12} className="text-purple-400" />
              {difficulty}
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

      {/* Main Content Body */}
      <main className="mx-auto max-w-wide px-6 py-10 space-y-16">

        {/* 1. THEORY SECTION */}
        <section id="theory" className="scroll-mt-36 space-y-8">
          <div className="flex items-center gap-3 pb-3 border-b border-border-soft">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 font-mono font-bold text-sm">
              01
            </span>
            <div>
              <h2 className="text-2xl font-mono font-bold text-text-main">
                {locale === 'vi' ? 'Bản chất & Lý thuyết Hệ thống Phân tán' : 'Core Distributed Systems Theory'}
              </h2>
              <p className="text-xs font-mono text-text-muted">
                {locale === 'vi' ? 'Giải quyết các thách thức phân tách thời gian, độ tin cậy và định luật bảo toàn lưu lượng' : 'Decoupling, reliability guarantees & queuing theory invariants'}
              </p>
            </div>
          </div>

          {/* Core Theory Invariants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-border-soft bg-surface/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle size={14} />
                <span>{locale === 'vi' ? 'Vấn đề & Nghẽn phần cứng' : 'Problem Statement'}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {tx(topic.coreTheory.problemStatement)}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border-soft bg-surface/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Cpu size={14} />
                <span>{locale === 'vi' ? 'Ràng buộc Hạ tầng / Mạng' : 'Network & Storage Limits'}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {tx(topic.coreTheory.hardwareConstraint)}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>{locale === 'vi' ? 'Giải pháp Kiến trúc' : 'Distributed Solution'}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {tx(topic.coreTheory.fundamentalSolution)}
              </p>
            </div>
          </div>

          {/* Mathematical Complexity & Formula Box */}
          <div className="p-6 rounded-xl border border-border-soft bg-[#0c0a14] space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Sliders size={14} />
                <span>{locale === 'vi' ? 'Mô hình Toán học & Công thức Thông lượng' : 'Mathematical Formulation & Invariants'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
                <span>Time: <strong className="text-emerald-400">{topic.coreTheory.math.timeComplexity}</strong></span>
                <span>Space: <strong className="text-cyan-400">{topic.coreTheory.math.spaceComplexity}</strong></span>
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

          {/* Detailed Theory Deep-Dive Paragraphs */}
          {topic.detailedTheory && (
            <div className="space-y-4 p-6 rounded-xl border border-border-soft bg-surface/20">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-text-main">
                <Info size={16} className="text-purple-400" />
                <span>{locale === 'vi' ? 'Phân tích Chuyên sâu cho Backend & Systems Architects' : 'Architectural Deep Dive'}</span>
              </div>
              <p className="text-sm text-text-muted font-sans leading-relaxed">
                {tx(topic.detailedTheory.overview)}
              </p>
              <div className="space-y-3 pt-2">
                {topic.detailedTheory.deepDiveParagraphs.map((para, idx) => (
                  <p key={idx} className="text-sm text-text-muted font-sans leading-relaxed pl-4 border-l-2 border-purple-500/40">
                    {tx(para)}
                  </p>
                ))}
              </div>

              {/* Enterprise Pitfalls */}
              {topic.detailedTheory.enterprisePitfalls && topic.detailedTheory.enterprisePitfalls.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block">
                    {locale === 'vi' ? 'Cạm bẫy Enterprise thường gặp khi thiết kế:' : 'Common Enterprise Pitfalls:'}
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-text-muted">
                    {topic.detailedTheory.enterprisePitfalls.map((pitfall, pIdx) => (
                      <li key={pIdx}>{tx(pitfall)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Research Citations & Engineering Papers */}
          {topic.researchCitations && topic.researchCitations.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Sparkles size={13} className="text-purple-400" />
                {locale === 'vi' ? 'Trích dẫn & Nghiên cứu Khoa học Phân tán (Kleppmann · Confluent · ByteByteGo · RabbitMQ):' : 'Authoritative Citations & Research:'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.researchCitations.map((citation, cIdx) => (
                  <a
                    key={cIdx}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 rounded-xl border border-border-soft bg-surface/20 hover:border-purple-500/40 hover:bg-surface/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-purple-400 mb-1">
                      <span>{citation.source}</span>
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-sm font-mono font-bold text-text-main group-hover:text-purple-300 transition-colors mb-1.5">
                      {citation.title}
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed mb-2">
                      {tx(citation.keyTakeaway)}
                    </p>
                    {citation.benchmarkOrInsight && (
                      <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        Insight: {tx(citation.benchmarkOrInsight)}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 2. PRODUCTION PROBLEM CASE (IF APPLICABLE) */}
        {topic.productionProblemCase && (
          <section id="production-case" className="scroll-mt-36 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 font-mono font-bold text-sm">
                02
              </span>
              <div>
                <h2 className="text-2xl font-mono font-bold text-text-main">
                  {locale === 'vi' ? 'Bài toán Thực tế trong Dự án Enterprise' : 'Classic Production Problem Case'}
                </h2>
                <p className="text-xs font-mono text-text-muted">
                  {tx(topic.productionProblemCase.title)}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-rose-500/30 bg-[#12080a] space-y-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    {locale === 'vi' ? 'Bối cảnh Nghiệp vụ (Business Context):' : 'Business Context:'}
                  </span>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {tx(topic.productionProblemCase.businessContext)}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                    {locale === 'vi' ? 'Mô tả Sự cố (Incident Description):' : 'Incident Description:'}
                  </span>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {tx(topic.productionProblemCase.problemDescription)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  {locale === 'vi' ? 'Vì sao cách tiếp cận ngây thơ (Naive Approach) thất bại:' : 'Why Naive Approach Fails:'}
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  {tx(topic.productionProblemCase.whyNaiveFails)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  {locale === 'vi' ? 'Giải pháp Kiến trúc Chuẩn (Core Solution):' : 'Architectural Solution:'}
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  {tx(topic.productionProblemCase.coreSolution)}
                </p>
                <div className="text-xs font-mono text-emerald-400 pt-1">
                  {locale === 'vi' ? 'Tác động hệ thống: ' : 'Impact: '}
                  {tx(topic.productionProblemCase.architectureImpact)}
                </div>
              </div>

              {topic.productionProblemCase.productionCode && (
                <div className="space-y-2">
                  <span className="text-xs font-mono text-text-muted">
                    {locale === 'vi' ? 'Mã giải pháp production mẫu:' : 'Production solution snippet:'}
                  </span>
                  <CodeBlock
                    code={topic.productionProblemCase.productionCode}
                    language="java"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. PHYSICAL ARCHITECTURE & TOPOLOGY */}
        <section id="architecture" className="scroll-mt-36 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-border-soft">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 font-mono font-bold text-sm">
              03
            </span>
            <div>
              <h2 className="text-2xl font-mono font-bold text-text-main">
                {locale === 'vi' ? 'Kiến trúc Broker & Topology Luồng Tin' : 'Physical Architecture & Packet Flow'}
              </h2>
              <p className="text-xs font-mono text-text-muted">
                {tx(topic.physicalArchitecture.title)}
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted font-sans leading-relaxed">
            {tx(topic.physicalArchitecture.description)}
          </p>

          {/* ASCII Topology Diagram */}
          <div className="p-5 rounded-xl border border-border-soft bg-[#050811] overflow-x-auto shadow-inner">
            <pre className="font-mono text-xs text-cyan-300 leading-snug select-all">
              {topic.physicalArchitecture.asciiDiagram}
            </pre>
          </div>

          {/* Components Grid */}
          {topic.physicalArchitecture.components && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {topic.physicalArchitecture.components.map((comp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border-soft bg-surface/30 space-y-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-400 block">{comp.name}</span>
                  <span className="text-[11px] font-mono text-text-soft block">{comp.role}</span>
                  <p className="text-xs text-text-muted leading-relaxed">{tx(comp.description)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. MECHANISM & INTERACTIVE SVG STAGE */}
        <section id="mechanism" className="scroll-mt-36 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-border-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 font-mono font-bold text-sm">
                04
              </span>
              <div>
                <h2 className="text-2xl font-mono font-bold text-text-main">
                  {locale === 'vi' ? 'Hoạt họa Cơ chế Trực quan' : 'Interactive Mechanism Stage'}
                </h2>
                <p className="text-xs font-mono text-text-muted">
                  {locale === 'vi' ? 'Tương tác trực tiếp với broker, mô phỏng các pha xử lý và chuyển giao tin' : 'Step-by-step interactive timeline & physical broker state'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/message-queue/playground"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-400 text-xs font-mono font-medium hover:bg-purple-500/20 transition-colors"
              >
                <Play size={12} fill="currentColor" />
                <span>{locale === 'vi' ? 'Live Simulator' : 'Live Simulator'}</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsTheaterMode((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors',
                  isTheaterMode
                    ? 'border-purple-400 bg-purple-500/20 text-purple-300'
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
              <MessagingIllustrationStage
                topic={topic}
                activeStep={activeStep}
                onStepChange={handleSelectStep}
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
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                    {currentStep.phase} · Step {shownStep + 1} of {topic.steps.length}
                  </span>
                </div>

                <h4 className="text-base font-bold text-text">
                  {tx(currentStep.title)}
                </h4>
                <p className="text-xs text-text-soft leading-relaxed font-sans">
                  {tx(currentStep.description)}
                </p>
              </div>

              {/* Broker Behavior Callout */}
              <div className={cn(
                'flex items-start gap-2.5',
                isTheaterMode ? 'border-t md:border-t-0 md:border-l md:pl-6 border-border-soft pt-4 md:pt-0' : 'pt-3 border-t border-border-soft'
              )}>
                <Server size={15} className="text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs font-mono">
                  <span className="text-purple-400 font-semibold">{locale === 'vi' ? 'Hành vi Broker:' : 'Broker Action:'} </span>
                  <span className="text-text-soft block mt-0.5 font-sans">{tx(currentStep.brokerBehavior)}</span>
                </div>
              </div>

              {currentStep.javaCodeLineMatch && (
                <div className="p-2.5 rounded bg-surface-subtle border border-border-soft font-mono text-[11px] text-cyan-400 flex items-center gap-2">
                  <Terminal size={12} className="shrink-0 text-cyan-400" />
                  <span className="truncate">Match: {currentStep.javaCodeLineMatch}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step Timeline Cards */}
          <div className="space-y-3 pt-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted block">
              {locale === 'vi' ? 'Các bước thực thi bản tin trong kiến trúc (Step-by-Step):' : 'Step-by-Step Packet Lifecycle:'}
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
                      'text-left p-4 rounded-xl border transition-all text-xs font-mono relative',
                      isSelected
                        ? 'border-purple-500/60 bg-purple-500/10 shadow-sm'
                        : 'border-border-soft bg-surface/20 hover:border-border-soft/80'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-purple-400">
                        {String(idx + 1).padStart(2, '0')}. {st.phase}
                      </span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />}
                    </div>
                    <div className="font-bold text-text-main text-sm mb-1">{tx(st.title)}</div>
                    <p className="text-text-muted text-[11px] leading-relaxed mb-2 font-sans">{tx(st.description)}</p>
                    <div className="text-[10px] text-cyan-400 bg-cyan-500/10 p-1.5 rounded font-mono">
                      Broker: {tx(st.brokerBehavior)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. CODE WORKSPACE */}
        <section id="code-workspace" className="scroll-mt-36 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-border-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold text-sm">
                05
              </span>
              <div>
                <h2 className="text-2xl font-mono font-bold text-text-main">
                  {locale === 'vi' ? 'Thực hành Spring Boot 3 & Java 21' : 'Spring Boot 3 & Java 21 Workspace'}
                </h2>
                <p className="text-xs font-mono text-text-muted">
                  {locale === 'vi' ? 'Mã nguồn cấu hình sản xuất, listener, idempotent producer và giao dịch' : 'Production-ready driver configuration & listeners'}
                </p>
              </div>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg border border-border-soft bg-surface/50">
              <button
                type="button"
                onClick={() => setCodeTab('java')}
                className={cn(
                  'px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5',
                  codeTab === 'java'
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                    : 'text-text-muted hover:text-text-main'
                )}
              >
                <Terminal size={12} />
                <span>Java 21 / Spring Boot</span>
              </button>

              {topic.springConfigCode && (
                <button
                  type="button"
                  onClick={() => setCodeTab('springConfig')}
                  className={cn(
                    'px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5',
                    codeTab === 'springConfig'
                      ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                      : 'text-text-muted hover:text-text-main'
                  )}
                >
                  <FileCode2 size={12} />
                  <span>application.yml</span>
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border-soft overflow-hidden shadow-sm">
            {codeTab === 'java' ? (
              <CodeBlock
                code={topic.javaCode}
                language="java"
                highlightLines={highlight}
              />
            ) : (
              <CodeBlock
                code={topic.springConfigCode || ''}
                language="java"
                filename="application.yml"
              />
            )}
          </div>
        </section>

        {/* 6. BROKER COMPARISONS */}
        <section id="brokers" className="scroll-mt-36 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-border-soft">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400 font-mono font-bold text-sm">
              06
            </span>
            <div>
              <h2 className="text-2xl font-mono font-bold text-text-main">
                {locale === 'vi' ? 'So sánh RabbitMQ vs Apache Kafka' : 'RabbitMQ vs Apache Kafka Comparison'}
              </h2>
              <p className="text-xs font-mono text-text-muted">
                {locale === 'vi' ? 'Smart Broker / Dumb Consumer (RabbitMQ) đối đầu Dumb Broker / Smart Consumer (Kafka)' : 'Comparing AMQP smart routing vs partitioned distributed commit log'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RabbitMQ Card */}
            {topic.brokerComparisons.rabbitmq && (
              <div className="p-6 rounded-xl border border-orange-500/30 bg-[#120a06] space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-500" />
                    <h3 className="font-mono font-bold text-orange-400 text-lg">RabbitMQ (AMQP 0-9-1)</h3>
                  </div>
                  <span className="text-xs font-mono text-orange-300/80 bg-orange-500/15 px-2 py-0.5 rounded">
                    Smart Broker
                  </span>
                </div>
                <div className="text-xs font-mono text-text-soft">
                  Vai trò: {tx(topic.brokerComparisons.rabbitmq.role)}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {tx(topic.brokerComparisons.rabbitmq.keyMechanism)}
                </p>
                <div className="p-3 rounded-lg bg-surface/30 border border-orange-500/20 text-xs font-mono text-orange-200">
                  {topic.brokerComparisons.rabbitmq.configExample}
                </div>
                <div className="text-xs text-text-soft italic">
                  Note: {tx(topic.brokerComparisons.rabbitmq.architectureNote)}
                </div>
              </div>
            )}

            {/* Kafka Card */}
            {topic.brokerComparisons.kafka && (
              <div className="p-6 rounded-xl border border-cyan-500/30 bg-[#061014] space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-cyan-400" />
                    <h3 className="font-mono font-bold text-cyan-400 text-lg">Apache Kafka</h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-300/80 bg-cyan-500/15 px-2 py-0.5 rounded">
                    Distributed Commit Log
                  </span>
                </div>
                <div className="text-xs font-mono text-text-soft">
                  Vai trò: {tx(topic.brokerComparisons.kafka.role)}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {tx(topic.brokerComparisons.kafka.keyMechanism)}
                </p>
                <div className="p-3 rounded-lg bg-surface/30 border border-cyan-500/20 text-xs font-mono text-cyan-200">
                  {topic.brokerComparisons.kafka.configExample}
                </div>
                <div className="text-xs text-text-soft italic">
                  Note: {tx(topic.brokerComparisons.kafka.architectureNote)}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 7. FAANG DISTRIBUTED SYSTEMS INTERVIEW QUESTIONS */}
        {topic.interviewQuestions && topic.interviewQuestions.length > 0 && (
          <section id="interview" className="scroll-mt-36 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 font-mono font-bold text-sm">
                07
              </span>
              <div>
                <h2 className="text-2xl font-mono font-bold text-text-main">
                  {locale === 'vi' ? 'Câu hỏi Phỏng vấn Hệ thống Phân tán (FAANG)' : 'FAANG Distributed Systems Interview Q&A'}
                </h2>
                <p className="text-xs font-mono text-text-muted">
                  {locale === 'vi' ? 'Thử thách kiến trúc thực tế, cạm bẫy phỏng vấn và mẹo giải quyết cho Senior / Staff Engineer' : 'Real interview scenarios, traps & senior pro-tips'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {topic.interviewQuestions.map((iq, idx) => {
                const isOpen = openInterviewIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border-soft bg-surface/20 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenInterviewIdx(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-surface/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          {iq.seniority}
                        </span>
                        <span className="text-sm md:text-base font-mono font-bold text-text-main">
                          Q{idx + 1}: {tx(iq.question)}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={cn('text-text-muted transition-transform shrink-0', isOpen && 'rotate-180 text-purple-400')}
                      />
                    </button>

                    <AnimatePresence>
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
                                {locale === 'vi' ? '⚠️ Cạm bẫy người phỏng vấn thường gài:' : '⚠️ Interview Trap Warning:'}
                              </span>
                              <p className="text-text-muted">{tx(iq.trapWarning)}</p>
                            </div>
                          )}

                          {iq.proTip && (
                            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                              <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                                {locale === 'vi' ? '💡 Bí kíp đạt điểm tuyệt đối (Senior Pro Tip):' : '💡 Senior Pro Tip:'}
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

        {/* 8. ARCHITECTURAL TRADEOFFS & INVARIANTS */}
        <section id="tradeoffs" className="scroll-mt-36 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-border-soft">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 font-mono font-bold text-sm">
              08
            </span>
            <div>
              <h2 className="text-2xl font-mono font-bold text-text-main">
                {locale === 'vi' ? 'Bản chất Đánh đổi & Định luật Phân tán' : 'Architectural Trade-offs & Invariants'}
              </h2>
              <p className="text-xs font-mono text-text-muted">
                {locale === 'vi' ? 'Không có giải pháp hoàn hảo tuyệt đối, chỉ có sự đánh đổi phù hợp với bài toán nghiệp vụ' : 'Latency vs throughput, ordering guarantees & operational overhead'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros */}
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                {locale === 'vi' ? 'Ưu điểm & Sức mạnh cốt lõi' : 'Architectural Strengths'}
              </span>
              <ul className="space-y-2 text-xs text-text-muted">
                {topic.tradeoffs.pros.map((pro, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tx(pro)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block">
                {locale === 'vi' ? 'Chi phí & Đánh đổi cần cân nhắc' : 'Trade-offs & Operational Costs'}
              </span>
              <ul className="space-y-2 text-xs text-text-muted">
                {topic.tradeoffs.cons.map((con, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{tx(con)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Latency vs Throughput Matrix */}
          <div className="p-5 rounded-xl border border-border-soft bg-surface/30 space-y-3">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block">
              {locale === 'vi' ? 'Độ trễ vs Thông lượng (Latency vs Throughput Matrix):' : 'Latency vs Throughput:'}
            </span>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              {tx(topic.tradeoffs.latencyVsThroughput)}
            </p>
            <div className="pt-2 text-xs font-mono text-cyan-400">
              {locale === 'vi' ? 'Cam kết thứ tự (Ordering Guarantee): ' : 'Ordering Guarantee: '}
              {tx(topic.tradeoffs.orderingGuarantee)}
            </div>
          </div>
        </section>

        {/* BOTTOM NAVIGATION FOOTER */}
        <div className="pt-10 border-t border-border-soft flex items-center justify-between gap-4 flex-wrap">
          {prev ? (
            <Link
              href={`/message-queue/${prev.id}`}
              className="group inline-flex items-center gap-3 p-3 rounded-xl border border-border-soft hover:border-purple-500/40 bg-surface/30 transition-all max-w-sm"
            >
              <ArrowLeft size={16} className="text-text-muted group-hover:text-purple-400 group-hover:-translate-x-1 transition-all shrink-0" />
              <div>
                <span className="text-[10px] font-mono text-text-soft block uppercase">
                  {locale === 'vi' ? 'BÀI TRƯỚC' : 'PREVIOUS TOPIC'}
                </span>
                <span className="text-xs font-mono font-bold text-text-main group-hover:text-purple-300 transition-colors line-clamp-1">
                  {prev.name}
                </span>
              </div>
            </Link>
          ) : <div />}

          {next ? (
            <Link
              href={`/message-queue/${next.id}`}
              className="group inline-flex items-center gap-3 p-3 rounded-xl border border-border-soft hover:border-purple-500/40 bg-surface/30 transition-all max-w-sm text-right ml-auto"
            >
              <div>
                <span className="text-[10px] font-mono text-text-soft block uppercase">
                  {locale === 'vi' ? 'BÀI TIẾP THEO' : 'NEXT TOPIC'}
                </span>
                <span className="text-xs font-mono font-bold text-text-main group-hover:text-purple-300 transition-colors line-clamp-1">
                  {next.name}
                </span>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ) : <div />}
        </div>
      </main>
    </article>
  );
}
