import type { LocalizedText } from '../i18n/types';

/**
 * Shared content model for the infrastructure courses (CDC, Docker, Security,
 * DevOps). Mirrors `lib/messaging/types.ts` section-for-section, but the
 * broker-specific fields are generalised so one topic shell serves every course.
 */

/** Roadmap levels: Cơ bản / Trung cấp / Nâng cao. */
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type CodeLanguage =
  | 'java'
  | 'yaml'
  | 'bash'
  | 'dockerfile'
  | 'sql'
  | 'json'
  | 'typescript'
  | 'go';

export interface CourseInterviewQuestion {
  question: LocalizedText;
  answer: LocalizedText;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  trapWarning?: LocalizedText;
  proTip?: LocalizedText;
}

export interface CourseArchitectureComponent {
  name: string;
  role: string;
  description: LocalizedText;
}

export interface CourseMathTheory {
  /** KaTeX source. Write with String.raw`...` so `\text` never becomes a tab. */
  formula: string;
  description?: LocalizedText;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface CourseStep {
  id: string;
  title: LocalizedText;
  phase: string;
  description: LocalizedText;
  /** What the underlying system (kernel, broker, IdP, control plane…) does at this step. */
  systemBehavior: LocalizedText;
  /** Unique substring in the first code tab, used to highlight lines. */
  codeLineMatch: string;
}

export interface CourseCodeSample {
  label: string;
  filename: string;
  language: CodeLanguage;
  code: string;
}

export interface CourseComparisonOption {
  name: string;
  tag: string;
  role: LocalizedText;
  keyMechanism: LocalizedText;
  configExample: string;
  architectureNote: LocalizedText;
}

export interface CourseProductionCase {
  title: LocalizedText;
  businessContext: LocalizedText;
  problemDescription: LocalizedText;
  whyNaiveFails: LocalizedText;
  coreSolution: LocalizedText;
  productionCode?: string;
  productionLanguage?: CodeLanguage;
  architectureImpact: LocalizedText;
}

export interface CourseCitation {
  source: string;
  title: string;
  url: string;
  keyTakeaway: LocalizedText;
  benchmarkOrInsight?: LocalizedText;
}

export interface CourseTopic<C extends string = string> {
  id: string;
  /** Roadmap code, e.g. `DOCKER-04` (docs/roadmap-cdc-docker-security-devops.md). */
  roadmapId?: string;
  category: C;
  level: CourseLevel;
  /** Set when the roadmap spans two levels, e.g. "Cơ bản → Trung cấp". */
  levelTo?: CourseLevel;
  chapter: string;
  name: string;
  tagline: LocalizedText;
  difficulty: 1 | 2 | 3;
  order: number;
  estimatedMinutes: number;

  coreTheory: {
    problemStatement: LocalizedText;
    hardwareConstraint: LocalizedText;
    fundamentalSolution: LocalizedText;
    math: CourseMathTheory;
  };

  detailedTheory?: {
    overview: LocalizedText;
    deepDiveParagraphs: LocalizedText[];
    enterprisePitfalls: LocalizedText[];
  };

  physicalArchitecture: {
    title: LocalizedText;
    description: LocalizedText;
    asciiDiagram: string;
    components?: CourseArchitectureComponent[];
  };

  /** Must have exactly as many entries as the illustration has `step-N` labels. */
  steps: CourseStep[];

  /** Side-by-side comparison of two (or more) implementations of the mechanism. */
  comparison?: {
    title: LocalizedText;
    subtitle: LocalizedText;
    options: CourseComparisonOption[];
  };

  tradeoffs: {
    pros: LocalizedText[];
    cons: LocalizedText[];
    balance: LocalizedText;
    invariant: LocalizedText;
  };

  /** First sample is the one the step walkthrough highlights. */
  code: CourseCodeSample[];

  interviewQuestions?: CourseInterviewQuestion[];
  productionProblemCase?: CourseProductionCase;
  researchCitations?: CourseCitation[];
}

export interface CourseCategoryMeta {
  label: LocalizedText;
  chapter: string;
  description: LocalizedText;
}

export type CourseAccent = 'emerald' | 'cyan' | 'rose' | 'amber';

/** Static, serialisable description of a course (no React, safe for server pages). */
export interface CourseDefinition<C extends string = string> {
  id: string;
  basePath: string;
  name: string;
  accent: CourseAccent;
  shortLabel: LocalizedText;
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  pillarsHeading: LocalizedText;
  pillars: Array<{ tag: string; title: LocalizedText; text: LocalizedText }>;
  categories: Record<C, CourseCategoryMeta>;
  /** Section labels that differ per domain (e.g. "Kernel behaviour" vs "IdP behaviour"). */
  labels: {
    systemBehavior: LocalizedText;
    architecture: LocalizedText;
    code: LocalizedText;
    codeSubtitle: LocalizedText;
    balance: LocalizedText;
    invariant: LocalizedText;
  };
  topics: CourseTopic<C>[];
}
