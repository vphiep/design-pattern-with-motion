import type { CdcTopic } from '../types';
import { dualWriteCdcFundamentalsTopic } from './01-dual-write-cdc-fundamentals';
import { postgresWalLogicalDecodingTopic } from './02-postgres-wal-logical-decoding';
import { mysqlBinlogGtidTopic } from './03-mysql-binlog-gtid';
import { debeziumKafkaConnectEnvelopeTopic } from './04-debezium-kafka-connect-envelope';
import { snapshotsInitialIncrementalTopic } from './05-snapshots-initial-incremental';
import { outboxEventRouterOperationsTopic } from './06-outbox-event-router-operations';

export const ALL_CDC_TOPICS: CdcTopic[] = [
  // Chương 01 — CDC Foundations
  dualWriteCdcFundamentalsTopic,
  postgresWalLogicalDecodingTopic,
  mysqlBinlogGtidTopic,

  // Chương 02 — Debezium & Kafka Connect
  debeziumKafkaConnectEnvelopeTopic,
  snapshotsInitialIncrementalTopic,

  // Chương 03 — Production CDC
  outboxEventRouterOperationsTopic
];
