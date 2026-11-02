import type { CourseDefinition } from '../courses/types';
import { getAdjacentCourseTopics, getCourseTopic } from '../courses/helpers';
import { ALL_CDC_TOPICS } from './content';
import type { CdcCategory, CdcTopic } from './types';

export const CDC_COURSE: CourseDefinition<CdcCategory> = {
  id: 'cdc-event-driven',
  basePath: '/cdc',
  name: 'Change Data Capture',
  accent: 'emerald',
  shortLabel: { vi: 'CDC · TỔNG QUAN', en: 'CDC OVERVIEW' },
  hero: {
    eyebrow: {
      vi: 'CHANGE DATA CAPTURE · WAL · DEBEZIUM · OUTBOX',
      en: 'CHANGE DATA CAPTURE · WAL · DEBEZIUM · OUTBOX'
    },
    title: {
      vi: 'Biến Transaction Log thành Luồng Sự kiện Không Mất Mát',
      en: 'Turning the Transaction Log into a Lossless Event Stream'
    },
    subtitle: {
      vi: 'Từ bài toán dual-write tới WAL/binlog, replication slot, Debezium trên Kafka Connect, snapshot không khoá bảng và Outbox Event Router — mỗi cơ chế đều có hoạt họa từng bước, cấu hình thật và sự cố production.',
      en: 'From the dual-write problem to WAL/binlog, replication slots, Debezium on Kafka Connect, lock-free snapshots and the Outbox Event Router — every mechanism with step-by-step animation, real configuration and production incidents.'
    }
  },
  pillarsHeading: { vi: '4 NGUYÊN LÝ CỦA CDC', en: '4 PRINCIPLES OF CDC' },
  pillars: [
    {
      tag: 'Single write',
      title: { vi: 'Chỉ ghi một nơi', en: 'Write one place' },
      text: {
        vi: 'Ứng dụng chỉ ghi DB; log commit là nguồn sự thật duy nhất.',
        en: 'The app writes only the DB; the commit log is the single source of truth.'
      }
    },
    {
      tag: 'Commit order',
      title: { vi: 'Thứ tự commit', en: 'Commit order' },
      text: {
        vi: 'Sự kiện phát theo thứ tự commit; key = PK giữ thứ tự từng dòng.',
        en: 'Events follow commit order; key = PK keeps per-row order.'
      }
    },
    {
      tag: 'At-least-once',
      title: { vi: 'Trùng là bình thường', en: 'Duplicates are normal' },
      text: {
        vi: 'Offset flush định kỳ → replay sau crash; consumer phải idempotent.',
        en: 'Periodic offset flush → replay after crash; consumers must be idempotent.'
      }
    },
    {
      tag: 'Retention',
      title: { vi: 'Log là tài nguyên hữu hạn', en: 'Logs are finite' },
      text: {
        vi: 'Slot giữ WAL, binlog bị purge — giám sát lag là bắt buộc.',
        en: 'Slots retain WAL, binlogs get purged — lag monitoring is mandatory.'
      }
    }
  ],
  categories: {
    'cdc-foundations': {
      label: { vi: 'Nền tảng CDC & Transaction Log', en: 'CDC Foundations & Transaction Logs' },
      chapter: 'Chương 01',
      description: {
        vi: 'Dual-write, ba chiến lược CDC, WAL/LSN/slot của PostgreSQL và binlog/GTID của MySQL.',
        en: 'Dual writes, the three CDC strategies, PostgreSQL WAL/LSN/slots and MySQL binlog/GTID.'
      }
    },
    'cdc-debezium': {
      label: { vi: 'Debezium & Kafka Connect', en: 'Debezium & Kafka Connect' },
      chapter: 'Chương 02',
      description: {
        vi: 'Runtime Kafka Connect, change event envelope, converter và snapshot initial/incremental.',
        en: 'The Kafka Connect runtime, change event envelope, converters and initial/incremental snapshots.'
      }
    },
    'cdc-production': {
      label: { vi: 'CDC trong Production', en: 'CDC in Production' },
      chapter: 'Chương 03',
      description: {
        vi: 'Outbox Event Router, consumer idempotent, heartbeat, schema evolution và giám sát.',
        en: 'Outbox Event Router, idempotent consumers, heartbeats, schema evolution and monitoring.'
      }
    }
  },
  labels: {
    systemBehavior: { vi: 'Hành vi DB / Connector', en: 'DB / Connector behaviour' },
    architecture: { vi: 'Kiến trúc & Luồng dữ liệu', en: 'Architecture & Data Flow' },
    code: { vi: 'Cấu hình & Mã nguồn', en: 'Configuration & Code' },
    codeSubtitle: {
      vi: 'SQL, cấu hình connector và Spring Boot consumer chuẩn production',
      en: 'SQL, connector configuration and production Spring Boot consumers'
    },
    balance: { vi: 'Độ trễ vs Nhất quán', en: 'Latency vs Consistency' },
    invariant: { vi: 'Bất biến', en: 'Invariant' }
  },
  topics: ALL_CDC_TOPICS
};

export function getCdcTopicById(id: string): CdcTopic | undefined {
  return getCourseTopic(CDC_COURSE, id);
}

export function getAdjacentCdcTopics(id: string) {
  return getAdjacentCourseTopics(CDC_COURSE, id);
}
