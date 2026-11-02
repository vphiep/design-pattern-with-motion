'use client';

import type { ComponentType } from 'react';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { MessageQueueArchitectureScene } from './MessageQueueArchitectureScene';
import { RabbitMqExchangesScene } from './RabbitMqExchangesScene';
import { RabbitMqDlxRetryScene } from './RabbitMqDlxRetryScene';
import { KafkaPartitionsReplicationScene } from './KafkaPartitionsReplicationScene';
import { KafkaProducerBatchingScene } from './KafkaProducerBatchingScene';
import { KafkaConsumerRebalanceScene } from './KafkaConsumerRebalanceScene';
import { KafkaTransactionsEosScene } from './KafkaTransactionsEosScene';
import { BackpressureFlowControlScene } from './BackpressureFlowControlScene';
import { ReliabilityOutboxScene } from './ReliabilityOutboxScene';
import { AdvancedMessagingScene } from './AdvancedMessagingScene';

export function getMessagingIllustration(id: string): ComponentType<SceneProps> {
  switch (id) {
    case 'message-queue-architecture':
    case 'delivery-semantics-ack':
    case 'event-driven-patterns':
      return MessageQueueArchitectureScene;

    case 'rabbitmq-exchanges-routing':
    case 'rabbitmq-queue-prefetch-ack':
      return RabbitMqExchangesScene;

    case 'rabbitmq-dlx-retry-backoff':
      return RabbitMqDlxRetryScene;

    case 'kafka-architecture-partitions':
      return KafkaPartitionsReplicationScene;

    case 'kafka-producer-batching-reliability':
      return KafkaProducerBatchingScene;

    case 'kafka-consumer-groups-rebalance':
      return KafkaConsumerRebalanceScene;

    case 'kafka-delivery-guarantees-transactions':
      return KafkaTransactionsEosScene;

    case 'backpressure-consumer-lag-flow-control':
      return BackpressureFlowControlScene;

    case 'messaging-reliability-observability':
      return ReliabilityOutboxScene;

    default:
      // Topics 13 to 20
      return function DynamicAdvancedScene(props: SceneProps) {
        return <AdvancedMessagingScene {...props} topicId={id} />;
      };
  }
}
