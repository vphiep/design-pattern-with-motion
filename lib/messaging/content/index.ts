import type { MessagingTopic } from '../types';
import { messageQueueArchitectureTopic } from './01-message-queue-architecture';
import { deliverySemanticsAckTopic } from './02-delivery-semantics-ack';
import { eventDrivenPatternsTopic } from './03-event-driven-patterns';
import { rabbitmqExchangesRoutingTopic } from './04-rabbitmq-exchanges-routing';
import { rabbitmqQueuePrefetchAckTopic } from './05-rabbitmq-queue-prefetch-ack';
import { rabbitmqDlxRetryBackoffTopic } from './06-rabbitmq-dlx-retry-backoff';
import { kafkaArchitecturePartitionsTopic } from './07-kafka-architecture-partitions';
import { kafkaProducerBatchingReliabilityTopic } from './08-kafka-producer-batching-reliability';
import { kafkaConsumerGroupsRebalanceTopic } from './09-kafka-consumer-groups-rebalance';
import { kafkaDeliveryGuaranteesTransactionsTopic } from './10-kafka-delivery-guarantees-transactions';
import { backpressureConsumerLagFlowControlTopic } from './11-backpressure-consumer-lag-flow-control';
import { messagingReliabilityObservabilityTopic } from './12-messaging-reliability-observability';
import { kafkaLogCompactionCdcTopic } from './13-kafka-log-compaction-cdc';
import { kafkaStreamsStatefulProcessingTopic } from './14-kafka-streams-stateful-processing';
import { rabbitmqQuorumQueuesRaftTopic } from './15-rabbitmq-quorum-queues-raft';
import { rabbitmqStreamsLogTopic } from './16-rabbitmq-streams-log';
import { distributedDisasterRecoveryMirrormakerTopic } from './17-distributed-disaster-recovery-mirrormaker';
import { transactionalOutboxKafkaEosTopic } from './18-transactional-outbox-kafka-eos';
import { zeroCopyPagecacheBenchmarkingTopic } from './19-zero-copy-pagecache-benchmarking';
import { securityMtlsAclMultiTenancyTopic } from './20-security-mtls-acl-multi-tenancy';

export const ALL_MESSAGING_TOPICS: MessagingTopic[] = [
  // Chương 01 — Messaging Fundamentals (3 bài)
  messageQueueArchitectureTopic,
  deliverySemanticsAckTopic,
  eventDrivenPatternsTopic,

  // Chương 02 — RabbitMQ Architecture & Routing (3 bài)
  rabbitmqExchangesRoutingTopic,
  rabbitmqQueuePrefetchAckTopic,
  rabbitmqDlxRetryBackoffTopic,

  // Chương 03 — Apache Kafka Architecture (4 bài)
  kafkaArchitecturePartitionsTopic,
  kafkaProducerBatchingReliabilityTopic,
  kafkaConsumerGroupsRebalanceTopic,
  kafkaDeliveryGuaranteesTransactionsTopic,

  // Chương 04 — Reliability, Backpressure & Distributed Streaming (2 bài)
  backpressureConsumerLagFlowControlTopic,
  messagingReliabilityObservabilityTopic,

  // Chuyên Đề Nâng Cao — Advanced Distributed Streaming (8 bài)
  kafkaLogCompactionCdcTopic,
  kafkaStreamsStatefulProcessingTopic,
  rabbitmqQuorumQueuesRaftTopic,
  rabbitmqStreamsLogTopic,
  distributedDisasterRecoveryMirrormakerTopic,
  transactionalOutboxKafkaEosTopic,
  zeroCopyPagecacheBenchmarkingTopic,
  securityMtlsAclMultiTenancyTopic
];

export const MESSAGING_TOPIC_MAP = new Map<string, MessagingTopic>(
  ALL_MESSAGING_TOPICS.map((topic) => [topic.id, topic])
);
