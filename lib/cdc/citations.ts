import type { CourseCitation } from '../courses/types';

export const CDC_CITATIONS = {
  ddia: {
    source: 'Martin Kleppmann (DDIA)',
    title: 'Designing Data-Intensive Applications — Ch. 11: Change Data Capture',
    url: 'https://dataintensive.net/',
    keyTakeaway: {
      vi: 'Coi database log là nguồn sự thật; mọi hệ thống dẫn xuất (search, cache, warehouse) là "materialized view" được dựng lại bằng cách replay log theo đúng thứ tự.',
      en: 'Treat the database log as the source of truth; derived systems (search, cache, warehouse) are materialized views rebuilt by replaying the log in order.'
    }
  },
  pgLogical: {
    source: 'PostgreSQL Documentation',
    title: 'Logical Decoding & Replication Slots',
    url: 'https://www.postgresql.org/docs/current/logicaldecoding.html',
    keyTakeaway: {
      vi: 'Replication slot đảm bảo WAL không bị xoá trước khi consumer xác nhận — đồng nghĩa slot bị bỏ rơi sẽ giữ WAL vô hạn.',
      en: 'A replication slot guarantees WAL is retained until the consumer confirms it — which also means an abandoned slot retains WAL forever.'
    }
  },
  debeziumPg: {
    source: 'Debezium Reference',
    title: 'Debezium connector for PostgreSQL',
    url: 'https://debezium.io/documentation/reference/stable/connectors/postgresql.html',
    keyTakeaway: {
      vi: 'pgoutput là plugin chuẩn từ PG10; connector lưu LSN đã xử lý vào offset topic của Kafka Connect và flush LSN về slot sau khi Kafka ghi nhận.',
      en: 'pgoutput is the built-in plugin since PG10; the connector stores processed LSNs in Kafka Connect offsets and flushes them back to the slot after Kafka acknowledges.'
    }
  },
  debeziumMysql: {
    source: 'Debezium Reference',
    title: 'Debezium connector for MySQL',
    url: 'https://debezium.io/documentation/reference/stable/connectors/mysql.html',
    keyTakeaway: {
      vi: 'Connector đóng vai một replica MySQL, đọc binlog dạng ROW và dùng schema history topic để hiểu cấu trúc bảng tại từng vị trí binlog.',
      en: 'The connector acts as a MySQL replica, reads ROW-format binlog and relies on a schema history topic to know the table shape at every binlog position.'
    }
  },
  mysqlBinlog: {
    source: 'MySQL Reference Manual',
    title: 'The Binary Log & GTID-based replication',
    url: 'https://dev.mysql.com/doc/refman/8.0/en/binary-log.html',
    keyTakeaway: {
      vi: 'GTID (server_uuid:transaction_id) cho phép replica tiếp tục từ đúng giao dịch trên một primary mới sau failover.',
      en: 'GTIDs (server_uuid:transaction_id) let a replica resume at the exact transaction on a new primary after failover.'
    }
  },
  dblog: {
    source: 'Netflix — Andreakis & Papapanagiotou',
    title: 'DBLog: A Watermark Based Change-Data-Capture Framework (2020)',
    url: 'https://arxiv.org/abs/2010.12597',
    keyTakeaway: {
      vi: 'Chèn low/high watermark vào log quanh mỗi chunk SELECT để trộn snapshot với luồng log mà không cần khoá bảng.',
      en: 'Interleave low/high watermarks around each chunk SELECT to merge snapshot rows with the live log without table locks.'
    },
    benchmarkOrInsight: {
      vi: 'Nền tảng của Debezium incremental snapshot.',
      en: 'The basis of Debezium incremental snapshots.'
    }
  },
  outboxRouter: {
    source: 'Debezium Reference',
    title: 'Outbox Event Router SMT',
    url: 'https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html',
    keyTakeaway: {
      vi: 'SMT đọc bảng outbox, định tuyến theo aggregatetype, dùng aggregateid làm key và gắn event id vào header để consumer khử trùng lặp.',
      en: 'The SMT reads the outbox table, routes by aggregatetype, keys by aggregateid and puts the event id in a header for consumer de-duplication.'
    }
  },
  outboxPattern: {
    source: 'microservices.io (Chris Richardson)',
    title: 'Pattern: Transactional Outbox',
    url: 'https://microservices.io/patterns/data/transactional-outbox.html',
    keyTakeaway: {
      vi: 'Ghi sự kiện vào bảng outbox trong cùng transaction với thay đổi nghiệp vụ; một relay (polling hoặc log tailing) publish sau.',
      en: 'Write the event to an outbox table in the same transaction as the business change; a relay (polling or log tailing) publishes it later.'
    }
  },
  kafkaConnect: {
    source: 'Apache Kafka Documentation',
    title: 'Kafka Connect — workers, tasks & offsets',
    url: 'https://kafka.apache.org/documentation/#connect',
    keyTakeaway: {
      vi: 'Distributed worker lưu config, offset và status vào ba compacted topic; task được tái phân bổ khi worker chết.',
      en: 'Distributed workers persist config, offsets and status in three compacted topics; tasks are rebalanced when a worker dies.'
    }
  }
} satisfies Record<string, CourseCitation>;
