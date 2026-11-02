import type { LocalizedText } from '../i18n/types';

export type JavaCoreCategory =
  | 'java-fundamentals'
  | 'jvm-memory'
  | 'concurrency-juc'
  | 'collections-internals'
  | 'advanced-features';

export type JavaCoreLevel = 'basic' | 'advanced';

export interface InterviewQuestion {
  question: LocalizedText;
  answer: LocalizedText;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  trapWarning?: LocalizedText;
  proTip?: LocalizedText;
}

export interface MemoryByteField {
  name: string;
  size: string;
  description: LocalizedText;
}

export interface MemoryLayoutSection {
  title: LocalizedText;
  description: LocalizedText;
  asciiDiagram: string;
  byteFields?: MemoryByteField[];
}

export interface JvmComplexityTheory {
  formula: string;
  description: LocalizedText;
  timeComplexity: string;
  spaceComplexity: string;
  memoryOverheadFormula?: string;
}

export interface ProductionJvmEngineDetail {
  jvmEngine: string;
  implementationName: string;
  keyMechanism: LocalizedText;
  defaultFlags: string;
  architectureNote: LocalizedText;
}

export interface StepExecutionDetail {
  id: string;
  title: LocalizedText;
  phase: string;
  description: LocalizedText;
  jvmRuntimeBehavior: LocalizedText;
  javaCodeLineMatch: string;
}

export interface DetailedTheorySection {
  overview: LocalizedText;
  deepDiveParagraphs: LocalizedText[];
  enterprisePitfalls: LocalizedText[];
}

export interface ProductionProblemCase {
  title: LocalizedText;
  businessContext: LocalizedText;
  problemDescription: LocalizedText;
  whyNaiveFails: LocalizedText;
  coreSolution: LocalizedText;
  productionCode?: string;
  architectureImpact: LocalizedText;
}

export interface JavaResearchCitation {
  source:
    | 'Baeldung'
    | 'Oracle JLS / JVMS Specification'
    | 'GeeksforGeeks'
    | 'JavaTpoint'
    | 'freeCodeCamp'
    | 'OpenJDK Source & JEPs'
    | 'Aleksey Shipilëv (JVM Internals)';
  title: string;
  url: string;
  citationType: 'guide' | 'specification' | 'jep' | 'benchmark' | 'academic-tutorial';
  keyTakeaway: LocalizedText;
  benchmarkOrInsight?: LocalizedText;
}

export interface JavaCoreTopic {
  id: string;
  category: JavaCoreCategory;
  name: string;
  tagline: LocalizedText;
  difficulty: 1 | 2 | 3;
  level: JavaCoreLevel;
  order: number;
  estimatedMinutes: number;

  /** Comprehensive Academic & Engineering Theory */
  coreTheory: {
    problemStatement: LocalizedText;
    hardwareConstraint: LocalizedText;
    fundamentalSolution: LocalizedText;
    math: JvmComplexityTheory;
  };

  /** Detailed theoretical study guide for senior backend developers */
  detailedTheory?: DetailedTheorySection;

  /** Low-level object memory layout / byte inspection (Mark Word, Klass, Heap) */
  memoryLayout: MemoryLayoutSection;

  /** Step-by-step physical JVM execution flow */
  steps: StepExecutionDetail[];

  /** In-depth comparison of top JVMs (Oracle HotSpot, OpenJ9, GraalVM) */
  productionJvmEngines: ProductionJvmEngineDetail[];

  /** Rigorous trade-off analysis */
  tradeoffs: {
    pros: LocalizedText[];
    cons: LocalizedText[];
    memoryFootprint: LocalizedText;
    jvmSpecificationGuarantee: LocalizedText;
  };

  /** Pure Java 21 production code demonstration */
  javaCode: string;

  /** Real HotSpot JVM flags & JOL (Java Object Layout) output */
  jvmFlagsCode?: string;

  /** Disassembled javap -c -v bytecode representation */
  bytecodeInspection?: string;

  /** Senior-level technical interview Q&A with interview traps and pro tips */
  interviewQuestions?: InterviewQuestion[];

  /** Real-world classic production problem & architecture solution */
  productionProblemCase?: ProductionProblemCase;

  /** Authoritative research citations from Baeldung, Oracle JLS/JVMS, GeeksforGeeks, freeCodeCamp */
  researchCitations?: JavaResearchCitation[];
}
