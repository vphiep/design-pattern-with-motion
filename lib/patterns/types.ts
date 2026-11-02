import type { LocalizedText } from '../i18n/types';

export type PatternCategory = 'creational' | 'structural' | 'behavioral';

/**
 * One entry in the numbered "How it works" walkthrough.
 * Steps are index-aligned with `SCENE_META[id].steps` — same count, same
 * order — because the illustrations animate keyed to that order.
 */
export interface PatternStep {
  /** Short step heading, e.g. "Callers ask for the instance". */
  title: LocalizedText;
  /** 2-4 sentences naming which class/object plays which role. */
  body: LocalizedText;
}

/** A verified real-world usage of the pattern. */
export interface RealSystemNote {
  /** Named API / framework, kept in English, e.g. 'java.lang.Runtime.getRuntime()'. */
  system: string;
  /** 1-2 sentences on exactly how the system applies the pattern. */
  note: LocalizedText;
}

/** Optional opt-in "Advanced" variant shown behind a Standard | Advanced toggle. */
export interface PatternAdvanced {
  whatMakesItAdvanced: LocalizedText;
  tradeoffs: LocalizedText;
  /** Correct, compilable-in-principle Java for the advanced form. */
  javaCode: string;
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

export interface PatternDeepTheory {
  academicRoot: LocalizedText;
  structuralCouplingMetric: LocalizedText;
  memoryAndVtableTradeoff: LocalizedText;
  enterpriseBestPractices: LocalizedText[];
}

export interface Pattern {
  /** kebab-case identifier, e.g. 'singleton', 'factory-method' */
  id: string;
  category: PatternCategory;
  /** Display name, e.g. 'Singleton'. Pattern names stay English in every locale. */
  name: string;
  /** One-sentence, jargon-light definition. */
  tagline: LocalizedText;
  /** Real-world analogy paragraph. */
  analogy: LocalizedText;
  /** 2-4 bullet points. */
  whenToUse: LocalizedText[];
  /** 1-3 bullet points. */
  whenNotToUse: LocalizedText[];
  /** Concise, well-commented Java demonstrating the pattern (30-60 lines).
   *  Must contain every `match` string in `SCENE_META[id].steps`. */
  javaCode: string;
  /** 1 = beginner, 2 = intermediate, 3 = advanced. */
  difficulty: 1 | 2 | 3;
  /** Suggested learning order within the project. */
  order: number;
  /** Numbered walkthrough, index-aligned with `SCENE_META[id].steps`. */
  steps: PatternStep[];
  /** 2-3 verified "used in real systems" notes. */
  realSystems: RealSystemNote[];
  /** Present only when the pattern has a meaningfully different advanced form. */
  advanced?: PatternAdvanced;
  /** In-depth software architecture theory, coupling metrics & trade-offs */
  deepTheory?: PatternDeepTheory;
  /** Classic production problem solved by this pattern in enterprise engineering */
  productionProblemCase?: ProductionProblemCase;
}
