import type { CdcTopic } from '../types';
import { CDC_CITATIONS } from '../citations';

export const debeziumKafkaConnectEnvelopeTopic: CdcTopic = {
  id: 'debezium-kafka-connect-envelope',
  category: 'cdc-debezium',
  level: 'intermediate',
  chapter: 'Chương 02',
  name: 'Debezium on Kafka Connect & the Change Event Envelope',
  tagline: {
    vi: 'Worker, connector, task và offset topic của Kafka Connect; cấu trúc envelope before/after/source/op; converter, Schema Registry và SMT unwrap.',
    en: 'Kafka Connect workers, connectors, tasks and the offset topic; the before/after/source/op envelope; converters, Schema Registry and the unwrap SMT.'
  },
  difficulty: 2,
  order: 4,
  estimatedMinutes: 26,

  coreTheory: {
    problemStatement: {
      vi: 'Đọc log DB mới là một nửa. Cần một runtime chịu lỗi để chạy reader 24/7, lưu tiến độ, tự chuyển sang máy khác khi node chết, và một định dạng sự kiện đủ thông tin (trước/sau, nguồn, loại thao tác) để mọi consumer xử lý đúng.',
      en: 'Reading the database log is only half the job. You need a fault-tolerant runtime that runs the reader 24/7, persists progress, fails over when a node dies, and an event format rich enough (before/after, source, operation) for every consumer to act correctly.'
    },
    hardwareConstraint: {
      vi: 'Connector chạy trên JVM có thể bị restart bất cứ lúc nào; offset chỉ được flush định kỳ (offset.flush.interval.ms), nên khoảng giữa hai lần flush sẽ bị gửi lại sau crash.',
      en: 'The connector runs in a JVM that can restart at any moment; offsets are flushed periodically (offset.flush.interval.ms), so everything between two flushes is re-sent after a crash.'
    },
    fundamentalSolution: {
      vi: 'Kafka Connect distributed mode: nhiều worker cùng group.id, lưu config/offset/status vào ba compacted topic, phân task bằng rebalance protocol. Debezium là source connector: mỗi thay đổi thành SourceRecord có key = PK, value = envelope {before, after, source, op, ts_ms}, kèm sourceOffset (LSN/GTID) được Connect lưu sau khi producer ack.',
      en: 'Kafka Connect distributed mode: workers share a group.id, store config/offsets/status in three compacted topics and assign tasks via a rebalance protocol. Debezium is a source connector: each change becomes a SourceRecord with key = PK, value = envelope {before, after, source, op, ts_ms}, plus a sourceOffset (LSN/GTID) Connect stores after the producer acks.'
    },
    math: {
      formula: String.raw`\text{duplicates after crash} \;\le\; \lambda_{\text{events}} \times \text{offset.flush.interval.ms}`,
      description: {
        vi: 'Với 5.000 event/s và flush mỗi 10 s, một crash có thể phát lại tới ~50.000 event. Giảm interval giảm trùng nhưng tăng ghi vào connect-offsets; cách đúng là consumer idempotent.',
        en: 'At 5,000 events/s with a 10 s flush, a crash may replay up to ~50,000 events. A shorter interval reduces duplicates but increases writes to connect-offsets; the real answer is idempotent consumers.'
      },
      timeComplexity: 'O(1) per change event',
      spaceComplexity: 'O(connectors) in compacted offset topic'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Change event của Debezium có hai phần: key (PK của dòng) và value (envelope). Hiểu envelope là điều kiện tiên quyết để viết consumer đúng.',
      en: 'A Debezium change event has two parts: the key (the row’s PK) and the value (the envelope). Understanding the envelope is a prerequisite for correct consumers.'
    },
    deepDiveParagraphs: [
      {
        vi: 'op: c = create, u = update, d = delete, r = read (snapshot), t = truncate. before null với c/r; after null với d. Sau d, Debezium mặc định gửi thêm tombstone (key, value=null) để log compaction có thể xoá key (tombstones.on.delete=true).',
        en: 'op: c = create, u = update, d = delete, r = read (snapshot), t = truncate. before is null for c/r; after is null for d. After a d, Debezium by default also emits a tombstone (key, value=null) so log compaction can drop the key (tombstones.on.delete=true).'
      },
      {
        vi: 'source chứa metadata vị trí: connector, db, schema, table, ts_ms (thời điểm commit ở DB), snapshot, cùng lsn/txId (Postgres) hoặc file/pos/gtid (MySQL). ts_ms ở envelope là lúc Debezium xử lý — hiệu hai giá trị là độ trễ capture.',
        en: 'source holds position metadata: connector, db, schema, table, ts_ms (commit time at the DB), snapshot, plus lsn/txId (Postgres) or file/pos/gtid (MySQL). The envelope ts_ms is when Debezium processed it — the difference is capture latency.'
      },
      {
        vi: 'Converter quyết định byte trên dây: JsonConverter (kèm schema → rất cồng kềnh) hoặc Avro/Protobuf + Schema Registry (chỉ gửi schema id 5 byte). SMT ExtractNewRecordState ("unwrap") làm phẳng envelope thành chỉ after cho các sink không hiểu envelope.',
        en: 'Converters decide the bytes on the wire: JsonConverter (with schemas → very bulky) or Avro/Protobuf + Schema Registry (a 5-byte schema id). The ExtractNewRecordState (“unwrap”) SMT flattens the envelope to just after for sinks that don’t understand envelopes.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Đặt tasks.max > 1 cho Postgres/MySQL connector: chỉ có 1 task đọc log được, giá trị thêm không có tác dụng.',
        en: 'Setting tasks.max > 1 for Postgres/MySQL connectors: only one task can read the log, extra tasks do nothing.'
      },
      {
        vi: 'Topic connect-offsets bị xoá hoặc đặt cleanup.policy=delete → connector quên vị trí và snapshot lại.',
        en: 'connect-offsets deleted or set to cleanup.policy=delete → the connector forgets its position and re-snapshots.'
      },
      {
        vi: 'Dùng unwrap SMT nhưng drop tombstone, sink không bao giờ xoá dòng tương ứng.',
        en: 'Using the unwrap SMT while dropping tombstones, so the sink never deletes the row.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Kafka Connect cluster chạy Debezium',
      en: 'A Kafka Connect cluster running Debezium'
    },
    description: {
      vi: 'REST API nhận config, worker leader phân task, task đọc log và produce, offset lưu trong Kafka.',
      en: 'The REST API takes config, the leader worker assigns tasks, the task reads the log and produces, offsets live in Kafka.'
    },
    asciiDiagram: `
           PUT /connectors/orders-cdc/config
                       │
   ┌───────────────── Kafka Connect cluster (group.id=cdc-connect) ─────────────────┐
   │  worker-1 (leader)          worker-2                    worker-3               │
   │  └ orders-cdc-0 task ◀── rebalance assigns ──           (standby capacity)     │
   └──────│──────────────────────────────────────────────────────────────────────────┘
          │ streaming replication (slot "debezium")
     PostgreSQL ──WAL──▶ task ─SourceRecord─▶ Converter(Avro) ─▶ Kafka "shop.public.orders"
                                   │                                 key   = {"id":42}
                                   │                                 value = {before, after,
                                   │                                          source{lsn,txId},
                                   ▼                                          op:"u", ts_ms}
                       connect-offsets (compacted)  {"lsn":23824200,"txId":771}
                       connect-configs / connect-status
`,
    components: [
      {
        name: 'Worker',
        role: 'JVM process',
        description: {
          vi: 'Chạy connector/task; nhiều worker cùng group tạo cluster.',
          en: 'Runs connectors/tasks; workers sharing a group form a cluster.'
        }
      },
      {
        name: 'Task',
        role: 'Unit of work',
        description: {
          vi: 'Với Debezium DB connector luôn là 1 task đọc log.',
          en: 'For Debezium DB connectors always a single log-reading task.'
        }
      },
      {
        name: 'connect-offsets',
        role: 'Progress store',
        description: {
          vi: 'Compacted topic lưu LSN/GTID cuối đã produce thành công.',
          en: 'Compacted topic storing the last successfully produced LSN/GTID.'
        }
      },
      {
        name: 'Schema Registry',
        role: 'Schema store',
        description: {
          vi: 'Lưu Avro/Protobuf schema, kiểm tra tương thích khi bảng đổi.',
          en: 'Stores Avro/Protobuf schemas and checks compatibility as tables change.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'register',
      title: { vi: 'Đăng ký connector qua REST', en: 'Register the connector via REST' },
      phase: 'Deploy',
      description: {
        vi: 'PUT config lên bất kỳ worker nào; config được ghi vào connect-configs.',
        en: 'PUT the config to any worker; it is written to connect-configs.'
      },
      systemBehavior: {
        vi: 'Leader rebalance và gán task orders-cdc-0 cho một worker.',
        en: 'The leader rebalances and assigns task orders-cdc-0 to a worker.'
      },
      codeLineMatch: 'curl -X PUT'
    },
    {
      id: 'stream',
      title: {
        vi: 'Task đọc slot và dựng envelope',
        en: 'Task reads the slot and builds the envelope'
      },
      phase: 'Capture',
      description: {
        vi: 'Mỗi UPDATE orders thành envelope op=u với before/after và source.lsn.',
        en: 'Each UPDATE on orders becomes an op=u envelope with before/after and source.lsn.'
      },
      systemBehavior: {
        vi: 'Postgres stream các thay đổi đã commit từ confirmed_flush_lsn.',
        en: 'Postgres streams committed changes from confirmed_flush_lsn.'
      },
      codeLineMatch: '"slot.name"'
    },
    {
      id: 'serialize',
      title: {
        vi: 'Converter tuần tự hoá & produce theo key',
        en: 'Converter serialises & produces by key'
      },
      phase: 'Produce',
      description: {
        vi: 'Avro converter đăng ký schema, gửi record key = PK vào topic shop.public.orders.',
        en: 'The Avro converter registers the schema and sends key = PK to shop.public.orders.'
      },
      systemBehavior: {
        vi: 'Cùng PK → cùng partition → thứ tự theo dòng được giữ.',
        en: 'Same PK → same partition → per-row order preserved.'
      },
      codeLineMatch: '"value.converter"'
    },
    {
      id: 'commit-offset',
      title: { vi: 'Flush offset & xác nhận LSN', en: 'Flush offsets & confirm the LSN' },
      phase: 'Commit',
      description: {
        vi: 'Sau khi producer ack, Connect ghi offset vào connect-offsets; Debezium flush LSN về slot.',
        en: 'After producer acks, Connect writes offsets to connect-offsets; Debezium flushes the LSN to the slot.'
      },
      systemBehavior: {
        vi: 'Crash trước flush ⇒ replay từ offset cũ (at-least-once).',
        en: 'Crash before flush ⇒ replay from the old offset (at-least-once).'
      },
      codeLineMatch: 'offset.flush.interval.ms'
    }
  ],

  comparison: {
    title: {
      vi: 'Envelope đầy đủ vs unwrap (ExtractNewRecordState)',
      en: 'Full envelope vs unwrap (ExtractNewRecordState)'
    },
    subtitle: { vi: 'Chọn định dạng theo loại consumer', en: 'Choose the format by consumer type' },
    options: [
      {
        name: 'Full envelope',
        tag: 'Event-aware',
        role: { vi: 'Consumer tự xử lý op', en: 'Consumers handle op themselves' },
        keyMechanism: {
          vi: 'Giữ before/after/source — cần cho audit, tính delta, kiểm tra thứ tự bằng LSN.',
          en: 'Keeps before/after/source — needed for audit, deltas, LSN-based ordering checks.'
        },
        configExample: '{"before":{…},"after":{…},"source":{"lsn":…},"op":"u"}',
        architectureNote: { vi: 'Mặc định của Debezium.', en: 'Debezium’s default.' }
      },
      {
        name: 'Unwrapped',
        tag: 'Sink-friendly',
        role: { vi: 'Sink JDBC/Elasticsearch upsert', en: 'JDBC/Elasticsearch upsert sinks' },
        keyMechanism: {
          vi: 'Chỉ còn after; delete thành tombstone hoặc trường __deleted=true.',
          en: 'Only after remains; deletes become tombstones or a __deleted=true field.'
        },
        configExample:
          'transforms=unwrap\ntransforms.unwrap.type=io.debezium.transforms.ExtractNewRecordState\ntransforms.unwrap.delete.handling.mode=rewrite',
        architectureNote: {
          vi: 'Mất before-image — không dùng cho audit.',
          en: 'Loses the before-image — not for audit.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Failover tự động giữa các worker, không cần tự viết daemon.',
        en: 'Automatic failover between workers, no custom daemon.'
      },
      {
        vi: 'Envelope chuẩn cho mọi DB (Postgres, MySQL, SQL Server, Oracle, MongoDB).',
        en: 'A standard envelope across databases (Postgres, MySQL, SQL Server, Oracle, MongoDB).'
      },
      { vi: 'Hệ sinh thái sink connector có sẵn.', en: 'A ready ecosystem of sink connectors.' }
    ],
    cons: [
      {
        vi: 'At-least-once theo mặc định; exactly-once source cần Connect ≥ 3.3 và cấu hình đặc biệt.',
        en: 'At-least-once by default; exactly-once source needs Connect ≥ 3.3 and special configuration.'
      },
      {
        vi: 'Thêm một cluster JVM và ba topic nội bộ cần bảo vệ.',
        en: 'Another JVM cluster and three internal topics to protect.'
      }
    ],
    balance: {
      vi: 'offset.flush.interval.ms nhỏ ⇒ ít trùng hơn nhưng nhiều ghi offset hơn; Avro nhỏ gọn hơn JSON nhưng thêm phụ thuộc Schema Registry.',
      en: 'A small offset.flush.interval.ms ⇒ fewer duplicates but more offset writes; Avro is smaller than JSON but adds a Schema Registry dependency.'
    },
    invariant: {
      vi: 'Offset chỉ được lưu cho record đã được Kafka ack — không bao giờ "nhảy qua" thay đổi chưa publish.',
      en: 'Offsets are only stored for records Kafka has acked — never skipping an unpublished change.'
    }
  },

  code: [
    {
      label: 'deploy-connector.sh',
      filename: 'deploy-connector.sh',
      language: 'bash',
      code: `# connect-distributed.properties (every worker)
#   group.id=cdc-connect
#   config.storage.topic=connect-configs   offset.storage.topic=connect-offsets
#   status.storage.topic=connect-status    offset.flush.interval.ms=10000

curl -X PUT http://connect:8083/connectors/orders-cdc/config \\
  -H 'Content-Type: application/json' -d '{
  "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
  "tasks.max": "1",
  "database.hostname": "pg-primary",
  "database.dbname": "shop",
  "database.user": "debezium",
  "database.password": "\${file:/secrets/pg.properties:password}",
  "plugin.name": "pgoutput",
  "slot.name": "debezium_orders",
  "publication.name": "dbz_publication",
  "topic.prefix": "shop",
  "table.include.list": "public.orders,public.customers",
  "key.converter": "io.confluent.connect.avro.AvroConverter",
  "value.converter": "io.confluent.connect.avro.AvroConverter",
  "value.converter.schema.registry.url": "http://schema-registry:8081",
  "tombstones.on.delete": "true"
}'`
    },
    {
      label: 'change-event.json',
      filename: 'change-event.json',
      language: 'json',
      code: `{
  "before": { "id": 42, "status": "NEW",  "total": 129.90 },
  "after":  { "id": 42, "status": "PAID", "total": 129.90 },
  "source": {
    "connector": "postgresql", "name": "shop", "db": "shop",
    "schema": "public", "table": "orders",
    "ts_ms": 1730539200123, "snapshot": "false",
    "txId": 771, "lsn": 23824200
  },
  "op": "u",
  "ts_ms": 1730539200187
}`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Làm sao đo độ trễ CDC end-to-end từ một change event?',
        en: 'How do you measure end-to-end CDC latency from a change event?'
      },
      answer: {
        vi: 'source.ts_ms là thời điểm commit ở DB, ts_ms ngoài envelope là lúc Debezium xử lý; consumer so với thời gian hiện tại để ra độ trễ tổng. Debezium cũng expose metric MilliSecondsBehindSource qua JMX.',
        en: 'source.ts_ms is the commit time at the DB, the outer ts_ms is when Debezium processed it; the consumer compares with now for total latency. Debezium also exposes MilliSecondsBehindSource via JMX.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Vì sao tăng tasks.max không tăng thông lượng của Postgres connector? Muốn scale thì làm gì?',
        en: 'Why doesn’t raising tasks.max increase Postgres connector throughput? How do you scale?'
      },
      answer: {
        vi: 'Một slot chỉ có một consumer và WAL là chuỗi tuần tự, nên chỉ một task đọc. Scale bằng cách tách thành nhiều connector với publication/slot riêng cho từng nhóm bảng, tối ưu converter (Avro), tăng max.batch.size/max.queue.size, và scale phía consumer bằng nhiều partition.',
        en: 'A slot has a single consumer and the WAL is sequential, so only one task reads. Scale by splitting into several connectors with their own publication/slot per table group, using compact converters (Avro), tuning max.batch.size/max.queue.size, and scaling consumers via partitions.'
      },
      trapWarning: {
        vi: 'Nhiều slot = nhiều lần giải mã WAL trên primary — tốn CPU.',
        en: 'More slots = WAL decoded multiple times on the primary — CPU cost.'
      }
    }
  ],

  researchCitations: [CDC_CITATIONS.kafkaConnect, CDC_CITATIONS.debeziumPg]
};
