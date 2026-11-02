'use client';

import type { BespokeScene } from '@/components/courses/scene-kit';
import { DualWriteScene } from './DualWriteScene';
import { DebeziumPipelineScene } from './DebeziumPipelineScene';
import { OutboxRouterScene } from './OutboxRouterScene';

/**
 * Hand-choreographed scenes. Topics not listed here render the data-driven
 * StepFlowScene, which derives its `step-N` labels from the topic's steps.
 */
export const CDC_SCENES: Record<string, BespokeScene> = {
  'dual-write-cdc-fundamentals': { component: DualWriteScene, steps: 4 },
  'debezium-kafka-connect-envelope': { component: DebeziumPipelineScene, steps: 4 },
  'outbox-event-router-operations': { component: OutboxRouterScene, steps: 4 }
};
