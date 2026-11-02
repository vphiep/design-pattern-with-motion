import type { LocalizedText } from '../i18n/types';

export type MessagingCategory =
  | 'messaging-fundamentals'
  | 'rabbitmq-broker'
  | 'kafka-streaming'
  | 'reliability-backpressure'
  | 'advanced-streaming';

export type MessagingLevel = 'core' | 'advanced';

export interface InterviewQuestion {
  question: LocalizedText;
  answer: LocalizedText;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  trapWarning?: LocalizedText;
  proTip?: LocalizedText;
}

export interface ArchitectureComponentField {
  name: string;
  role: string;
  description: LocalizedText;
}

export interface PhysicalArchitectureSection {
  title: LocalizedText;
  description: LocalizedText;
  asciiDiagram: string;
  components?: ArchitectureComponentField[];
}

export interface MathComplexityTheory {
  formula: string;
  description?: LocalizedText;
  timeComplexity: string;
  spaceComplexity: string;
  throughputFormula?: string;
}

export interface BrokerImplementationDetail {
  role: LocalizedText;
  keyMechanism: LocalizedText;
  configExample: string;
  architectureNote: LocalizedText;
}

export interface StepExecutionDetail {
  id: string;
  title: LocalizedText;
  phase: string;
  description: LocalizedText;
  brokerBehavior: LocalizedText;
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

export interface MessagingCitation {
  source:
    | 'Martin Kleppmann (DDIA)'
    | 'Apache Kafka Documentation & KIPs'
    | 'RabbitMQ Documentation & Pivotal'
    | 'ByteByteGo (Alex Xu)'
    | 'Confluent Engineering'
    | 'Conduktor Distributed Systems'
    | 'Datadog Engineering'
    | 'ADevGuide / Enterprise Integration Patterns';
  title: string;
  url: string;
  citationType: 'book' | 'specification' | 'engineering-guide' | 'benchmark' | 'academic-tutorial';
  keyTakeaway: LocalizedText;
  benchmarkOrInsight?: LocalizedText;
}

export interface MessagingTopic {
  id: string;
  category: MessagingCategory;
  level: MessagingLevel;
  chapter: string;
  name: string;
  tagline: LocalizedText;
  difficulty: 1 | 2 | 3;
  order: number;
  estimatedMinutes: number;

  /** Comprehensive Academic & Distributed Systems Theory */
  coreTheory: {
    problemStatement: LocalizedText;
    hardwareConstraint: LocalizedText;
    fundamentalSolution: LocalizedText;
    math: MathComplexityTheory;
  };

  /** Detailed theoretical study guide for backend & systems architects */
  detailedTheory?: DetailedTheorySection;

  /** Physical topology, cluster packet flow & component layout */
  physicalArchitecture: PhysicalArchitectureSection;

  /** Step-by-step physical message lifecycle execution flow */
  steps: StepExecutionDetail[];

  /** Deep architectural comparison: RabbitMQ (Broker) vs Kafka (Log Streaming) */
  brokerComparisons: {
    rabbitmq?: BrokerImplementationDetail;
    kafka?: BrokerImplementationDetail;
  };

  /** Rigorous trade-off analysis */
  tradeoffs: {
    pros: LocalizedText[];
    cons: LocalizedText[];
    latencyVsThroughput: LocalizedText;
    orderingGuarantee: LocalizedText;
  };

  /** Pure Java 21 / Spring Boot 3 enterprise demonstration */
  javaCode: string;

  /** Spring Kafka / Spring AMQP application.yml & Java Config */
  springConfigCode?: string;

  /** Senior-level technical interview Q&A with traps and pro tips */
  interviewQuestions?: InterviewQuestion[];

  /** Real-world classic production problem & architecture solution */
  productionProblemCase?: ProductionProblemCase;

  /** Authoritative citations from Kleppmann DDIA, Confluent, Conduktor, RabbitMQ, ByteByteGo */
  researchCitations?: MessagingCitation[];
}
