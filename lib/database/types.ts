import type { LocalizedText } from '../i18n/types';

export type DatabaseCategory =
  | 'storage-engines'
  | 'indexing-techniques'
  | 'buffer-memory'
  | 'concurrency-tx'
  | 'durability-wal'
  | 'distributed-consensus';

export interface HeaderByteField {
  name: string;
  size: string;
  description: LocalizedText;
}

export interface BinaryPageLayout {
  title: LocalizedText;
  description: LocalizedText;
  asciiDiagram: string;
  headerFields?: HeaderByteField[];
}

export interface MathComplexityTheory {
  formula: string;
  description: LocalizedText;
  timeComplexity: string;
  spaceComplexity: string;
  ioCostFormula?: string;
}

export interface ProductionEngineDetail {
  engine: string;
  implementationName: string;
  keyMechanism: LocalizedText;
  defaultTuningConfig: string;
  architectureNote: LocalizedText;
}

export interface StepExecutionDetail {
  id: string;
  title: LocalizedText;
  phase: string;
  description: LocalizedText;
  diskIoBehavior: LocalizedText;
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

export interface ResearchCitation {
  source:
    | 'CMU Database Group (Andy Pavlo)'
    | 'Database Internals (Alex Petrov, O\'Reilly)'
    | 'Use The Index, Luke! (Markus Winand)'
    | 'GeeksforGeeks'
    | 'freeCodeCamp'
    | 'JavaTpoint'
    | 'PostgreSQL Documentation & Source'
    | 'MySQL InnoDB Internals'
    | 'VLDB / ACM SIGMOD Research';
  title: string;
  url: string;
  citationType: 'book' | 'academic-course' | 'research-paper' | 'engineering-guide' | 'specification';
  keyTakeaway: LocalizedText;
  benchmarkOrInsight?: LocalizedText;
}

export interface DatabaseTopic {
  id: string;
  category: DatabaseCategory;
  name: string;
  tagline: LocalizedText;
  difficulty: 1 | 2 | 3;
  order: number;
  estimatedMinutes: number;

  /** Comprehensive Academic & Engineering Theory */
  coreTheory: {
    problemStatement: LocalizedText;
    hardwareConstraint: LocalizedText;
    fundamentalSolution: LocalizedText;
    math: MathComplexityTheory;
  };

  /** Detailed theoretical study guide for backend developers */
  detailedTheory?: DetailedTheorySection;

  /** Low-level byte / page / record organization */
  pageLayout: BinaryPageLayout;

  /** Step-by-step physical execution flow */
  steps: StepExecutionDetail[];

  /** In-depth comparison of top engines (Postgres, InnoDB, RocksDB, SQLite, etc.) */
  productionEngines: ProductionEngineDetail[];

  /** Rigorous trade-off analysis */
  tradeoffs: {
    pros: LocalizedText[];
    cons: LocalizedText[];
    writeAmplification: LocalizedText;
    recoveryGuarantee: LocalizedText;
  };

  /** Enterprise Spring Boot 3.x Configuration (application.yml + Java Config/Entity) */
  springBootCode?: string;

  /** Real Production SQL Queries, DDL, and EXPLAIN ANALYZE plans */
  sqlQueries?: string;

  /** Pure Java 21 engine demonstration */
  javaCode: string;

  /** Advanced hardware/concurrency optimization snippet */
  advancedOptimization?: {
    title: LocalizedText;
    concept: LocalizedText;
    javaCode: string;
  };

  /** Real-world classic production problem & architecture solution */
  productionProblemCase?: ProductionProblemCase;

  /** Authoritative academic research, book citations & benchmarks */
  researchCitations?: ResearchCitation[];
}
