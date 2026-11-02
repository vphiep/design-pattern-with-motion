import type { SceneMeta } from '@/lib/patterns/scene';
import { buildSceneMeta } from '../courses/helpers';
import { CDC_COURSE } from './data';

/**
 * Step ids/labels/code matches come from each topic's `steps`; scenes add one
 * `step-N` label per entry. Only captions are authored here.
 */
export const CDC_SCENE_META: Record<string, SceneMeta> = buildSceneMeta(CDC_COURSE, {
  'dual-write-cdc-fundamentals': {
    vi: 'Dual-write: DB commit nhưng publish thất bại → lệch; log-based CDC chỉ còn một lệnh ghi và hội tụ.',
    en: 'Dual write: the DB commits but the publish fails → divergence; log-based CDC leaves a single write and converges.'
  },
  'postgres-wal-logical-decoding': {
    vi: 'wal_level=logical → slot → pgoutput giải mã giao dịch đã commit → xác nhận LSN.',
    en: 'wal_level=logical → slot → pgoutput decodes committed transactions → LSN confirmation.'
  },
  'mysql-binlog-gtid': {
    vi: 'Binlog ROW + GTID, connector như replica, DDL vào schema history, row event thành change event.',
    en: 'ROW binlog + GTID, connector as a replica, DDL into schema history, row events into change events.'
  },
  'debezium-kafka-connect-envelope': {
    vi: 'Kafka Connect gán task, Debezium dựng envelope, converter produce theo key, offset được flush.',
    en: 'Kafka Connect assigns the task, Debezium builds the envelope, the converter produces by key, offsets are flushed.'
  },
  'snapshots-initial-incremental': {
    vi: 'Incremental snapshot: signal → low watermark + chunk → log event loại dòng trùng → high watermark.',
    en: 'Incremental snapshot: signal → low watermark + chunk → log events evict duplicates → high watermark.'
  },
  'outbox-event-router-operations': {
    vi: 'Outbox: một transaction → Debezium capture → EventRouter định tuyến → consumer idempotent.',
    en: 'Outbox: one transaction → Debezium capture → EventRouter routing → idempotent consumer.'
  }
});
