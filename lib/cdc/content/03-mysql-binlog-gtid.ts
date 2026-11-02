import type { CdcTopic } from '../types';
import { CDC_CITATIONS } from '../citations';

export const mysqlBinlogGtidTopic: CdcTopic = {
  id: 'mysql-binlog-gtid',
  category: 'cdc-foundations',
  level: 'intermediate',
  chapter: 'Chương 01',
  name: 'MySQL Binlog, GTID & Schema History',
  tagline: {
    vi: 'binlog_format=ROW, binlog_row_image=FULL, GTID cho failover, và vì sao Debezium cần một schema history topic để hiểu từng row event.',
    en: 'binlog_format=ROW, binlog_row_image=FULL, GTIDs for failover, and why Debezium needs a schema history topic to interpret each row event.'
  },
  difficulty: 2,
  order: 3,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Binlog MySQL là log logic dùng cho replication, nhưng ở chế độ STATEMENT nó chỉ chứa câu SQL (UPDATE … WHERE created_at < NOW()) — không thể biết dòng nào bị đổi. Ngay cả ở chế độ ROW, row event chỉ chứa giá trị theo vị trí cột, không có tên cột; nếu bảng vừa ALTER, consumer sẽ hiểu sai.',
      en: 'MySQL’s binlog is a logical log for replication, but in STATEMENT mode it only carries SQL text (UPDATE … WHERE created_at < NOW()) — you cannot tell which rows changed. Even in ROW mode, row events carry values by column position without names; if the table was just ALTERed, a consumer misreads them.'
    },
    hardwareConstraint: {
      vi: 'Binlog bị xoá theo binlog_expire_logs_seconds (mặc định 30 ngày ở 8.0) hoặc PURGE thủ công; managed MySQL thường giữ rất ngắn. Connector offline lâu hơn retention ⇒ vị trí đọc biến mất ⇒ phải snapshot lại toàn bộ.',
      en: 'Binlogs are purged by binlog_expire_logs_seconds (30 days by default in 8.0) or manual PURGE; managed MySQL often keeps them very briefly. A connector offline longer than retention ⇒ its position is gone ⇒ full re-snapshot.'
    },
    fundamentalSolution: {
      vi: 'Bật binlog_format=ROW + binlog_row_image=FULL để có before/after đầy đủ; bật gtid_mode=ON để vị trí đọc là tập GTID độc lập với file/offset của từng server. Debezium kết nối như một replica (server_id riêng), ghi mọi DDL vào schema history topic để dựng lại cấu trúc bảng tại đúng vị trí binlog.',
      en: 'Enable binlog_format=ROW + binlog_row_image=FULL for complete before/after images; enable gtid_mode=ON so the read position is a GTID set independent of each server’s file/offset. Debezium connects as a replica (its own server_id) and records every DDL in a schema history topic to rebuild table structure at the exact binlog position.'
    },
    math: {
      formula: String.raw`\text{resume}(G_{\text{executed}}) = \{\, t \in \text{binlog} \mid \text{gtid}(t) \notin G_{\text{executed}} \,\}`,
      description: {
        vi: 'Với GTID, connector lưu tập GTID đã xử lý (vd. 3E11FA47…:1-5023). Sau failover sang replica khác, nó yêu cầu mọi giao dịch có GTID chưa thuộc tập này — không cần dịch file/offset giữa các server.',
        en: 'With GTIDs the connector stores the processed GTID set (e.g. 3E11FA47…:1-5023). After failing over to another replica it requests every transaction whose GTID is not in the set — no file/offset translation between servers.'
      },
      timeComplexity: 'O(events) sequential binlog read',
      spaceComplexity: 'O(binlog retention) on the server'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'MySQL connector của Debezium gồm hai phần: binlog reader (giao thức replication) và schema history (DDL parser + Kafka topic).',
      en: 'Debezium’s MySQL connector has two halves: the binlog reader (replication protocol) and schema history (DDL parser + Kafka topic).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Mỗi transaction trong binlog có GTID_EVENT, rồi TABLE_MAP_EVENT (ánh xạ table id → db.table, kiểu cột) và WRITE_ROWS/UPDATE_ROWS/DELETE_ROWS chứa ảnh dòng. TABLE_MAP không có tên cột (trừ khi binlog_row_metadata=FULL ở 8.0.1+), nên Debezium dựa vào schema đã dựng từ DDL.',
        en: 'Each binlog transaction has a GTID_EVENT, then a TABLE_MAP_EVENT (table id → db.table, column types) and WRITE_ROWS/UPDATE_ROWS/DELETE_ROWS with row images. TABLE_MAP has no column names (unless binlog_row_metadata=FULL on 8.0.1+), so Debezium relies on the schema rebuilt from DDL.'
      },
      {
        vi: 'Schema history topic phải có 1 partition và retention vô hạn (retention.ms=-1, không compact): khi connector restart, nó replay toàn bộ DDL để biết bảng trông thế nào tại offset đang resume. Mất topic này đồng nghĩa phải snapshot lại.',
        en: 'The schema history topic must have 1 partition and infinite retention (retention.ms=-1, not compacted): on restart the connector replays all DDL to know the table shape at the resume offset. Losing it means re-snapshotting.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Hai connector dùng chung server_id → MySQL ngắt kết nối replica cũ, hai connector "đá" nhau liên tục.',
        en: 'Two connectors sharing a server_id → MySQL disconnects the older replica and they keep kicking each other off.'
      },
      {
        vi: 'Online schema change bằng gh-ost/pt-osc tạo bảng tạm và RENAME — cần cấu hình để Debezium bỏ qua bảng _gho/_new.',
        en: 'Online schema changes via gh-ost/pt-osc create shadow tables and RENAME — configure Debezium to ignore _gho/_new tables.'
      },
      {
        vi: 'binlog_row_image=MINIMAL: UPDATE chỉ chứa cột thay đổi, before/after thiếu dữ liệu.',
        en: 'binlog_row_image=MINIMAL: UPDATEs carry only changed columns, leaving before/after incomplete.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Debezium như một replica MySQL', en: 'Debezium as a MySQL replica' },
    description: {
      vi: 'Connector xin binlog theo GTID set, parse DDL vào schema history, chuyển row event thành change event.',
      en: 'The connector requests binlog by GTID set, parses DDL into schema history and turns row events into change events.'
    },
    asciiDiagram: `
 MySQL primary (server_id=1, gtid_mode=ON, binlog_format=ROW)
   binlog.000042
   ├─ GTID 3E11FA47-…:5024
   ├─ QUERY  ALTER TABLE orders ADD COLUMN coupon VARCHAR(32)  ──┐
   ├─ GTID 3E11FA47-…:5025                                       │
   ├─ TABLE_MAP  id=108 → shop.orders                            │
   └─ UPDATE_ROWS before=(42,'NEW',…) after=(42,'PAID',…)        │
            │ COM_BINLOG_DUMP_GTID (server_id=184054)            │
            ▼                                                    ▼
   Debezium MySqlConnector ─────────────▶ schema-history.shop (1 partition, ∞ retention)
            │ row + schema@offset
            ▼
   Kafka "shop.shop.orders"   offsets: {gtids: "3E11FA47-…:1-5025", file, pos}
`,
    components: [
      {
        name: 'binlog_format=ROW',
        role: 'Row images',
        description: {
          vi: 'Bắt buộc cho CDC; STATEMENT/MIXED không đủ.',
          en: 'Required for CDC; STATEMENT/MIXED are insufficient.'
        }
      },
      {
        name: 'GTID',
        role: 'Global position',
        description: {
          vi: 'server_uuid:txn_id, cho phép resume sau failover.',
          en: 'server_uuid:txn_id, enabling resume after failover.'
        }
      },
      {
        name: 'Schema history topic',
        role: 'DDL ledger',
        description: {
          vi: 'Toàn bộ DDL theo thứ tự để dựng lại schema tại bất kỳ offset.',
          en: 'All DDL in order to rebuild schema at any offset.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'configure-binlog',
      title: { vi: 'Cấu hình binlog ROW + GTID', en: 'Configure ROW binlog + GTID' },
      phase: 'Configure',
      description: {
        vi: 'Bật ROW, FULL row image, GTID và retention đủ dài cho thời gian connector có thể offline.',
        en: 'Enable ROW, FULL row image, GTID and retention long enough for connector downtime.'
      },
      systemBehavior: {
        vi: 'Mỗi transaction được gán GTID và ghi đầy đủ ảnh dòng.',
        en: 'Each transaction gets a GTID and full row images.'
      },
      codeLineMatch: 'binlog_row_image'
    },
    {
      id: 'replica-connect',
      title: { vi: 'Connector đăng ký như replica', en: 'Connector registers as a replica' },
      phase: 'Connect',
      description: {
        vi: 'Dùng user có REPLICATION SLAVE/CLIENT và server_id duy nhất; gửi GTID set đã xử lý.',
        en: 'Uses a user with REPLICATION SLAVE/CLIENT and a unique server_id; sends the processed GTID set.'
      },
      systemBehavior: {
        vi: 'MySQL stream các binlog event còn thiếu qua COM_BINLOG_DUMP_GTID.',
        en: 'MySQL streams missing binlog events over COM_BINLOG_DUMP_GTID.'
      },
      codeLineMatch: 'database.server.id'
    },
    {
      id: 'ddl-history',
      title: { vi: 'DDL vào schema history', en: 'DDL into schema history' },
      phase: 'Schema',
      description: {
        vi: 'ALTER TABLE được parse và ghi vào schema history topic kèm offset.',
        en: 'ALTER TABLE is parsed and written to the schema history topic with its offset.'
      },
      systemBehavior: {
        vi: 'Topic 1 partition, retention vô hạn — nguồn để dựng lại schema khi restart.',
        en: '1-partition, infinite-retention topic — the source for rebuilding schema on restart.'
      },
      codeLineMatch: 'schema.history.internal.kafka.topic'
    },
    {
      id: 'row-events',
      title: { vi: 'Row event → change event', en: 'Row event → change event' },
      phase: 'Emit',
      description: {
        vi: 'UPDATE_ROWS được ghép với schema hiện hành, phát event có before/after và source.gtid.',
        en: 'UPDATE_ROWS is combined with the current schema and emitted with before/after and source.gtid.'
      },
      systemBehavior: {
        vi: 'Offset lưu cả GTID set lẫn file/pos để resume chính xác.',
        en: 'Offsets store both the GTID set and file/pos for exact resume.'
      },
      codeLineMatch: 'topic.prefix'
    }
  ],

  comparison: {
    title: {
      vi: 'PostgreSQL WAL vs MySQL binlog cho CDC',
      en: 'PostgreSQL WAL vs MySQL binlog for CDC'
    },
    subtitle: {
      vi: 'Cùng mục tiêu, cơ chế giữ log khác nhau',
      en: 'Same goal, different log retention mechanics'
    },
    options: [
      {
        name: 'PostgreSQL',
        tag: 'Slot-based',
        role: { vi: 'Server giữ WAL cho từng slot', en: 'Server retains WAL per slot' },
        keyMechanism: {
          vi: 'Không mất vị trí khi consumer offline, nhưng có thể làm đầy đĩa.',
          en: 'Position never lost while offline, but can fill the disk.'
        },
        configExample: 'wal_level=logical\nslot.name=debezium',
        architectureNote: {
          vi: 'DDL không có trong luồng; schema đến từ Relation message.',
          en: 'DDL is not in the stream; schema comes from Relation messages.'
        }
      },
      {
        name: 'MySQL',
        tag: 'Retention-based',
        role: { vi: 'Binlog bị xoá theo thời gian', en: 'Binlog purged by time' },
        keyMechanism: {
          vi: 'Không bao giờ làm đầy đĩa vì consumer, nhưng offline quá retention là mất vị trí.',
          en: 'Consumers never fill the disk, but offline past retention loses the position.'
        },
        configExample: 'binlog_expire_logs_seconds=604800\ngtid_mode=ON',
        architectureNote: {
          vi: 'DDL nằm trong binlog, cần schema history.',
          en: 'DDL lives in the binlog; schema history required.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Không cần extension; dùng đúng cơ chế replication sẵn có.',
        en: 'No extensions; uses built-in replication.'
      },
      {
        vi: 'GTID giúp chuyển connector sang replica khác dễ dàng.',
        en: 'GTIDs make moving the connector to another replica easy.'
      }
    ],
    cons: [
      {
        vi: 'Phải vận hành thêm schema history topic và DDL parser có thể lỗi với cú pháp lạ.',
        en: 'An extra schema history topic to operate, and the DDL parser can fail on exotic syntax.'
      },
      {
        vi: 'Retention ngắn trên managed MySQL buộc phải snapshot lại sau sự cố dài.',
        en: 'Short retention on managed MySQL forces re-snapshots after long incidents.'
      }
    ],
    balance: {
      vi: 'Retention binlog dài hơn = phục hồi an toàn hơn nhưng tốn đĩa; chọn ≥ thời gian khắc phục sự cố tối đa (MTTR) của connector.',
      en: 'Longer binlog retention = safer recovery but more disk; choose ≥ the connector’s worst-case MTTR.'
    },
    invariant: {
      vi: 'Row event luôn được diễn giải bằng schema có hiệu lực tại đúng vị trí binlog của nó.',
      en: 'A row event is always interpreted with the schema in effect at its own binlog position.'
    }
  },

  code: [
    {
      label: 'my.cnf + connector',
      filename: 'mysql-cdc.properties',
      language: 'bash',
      code: `# --- my.cnf ---
server_id                  = 1
log_bin                    = mysql-bin
binlog_format              = ROW
binlog_row_image           = FULL
gtid_mode                  = ON
enforce_gtid_consistency   = ON
binlog_expire_logs_seconds = 604800      # 7 days >= connector worst-case MTTR

# --- Debezium MySqlConnector ---
connector.class=io.debezium.connector.mysql.MySqlConnector
database.hostname=mysql-primary
database.user=debezium                   # GRANT REPLICATION SLAVE, REPLICATION CLIENT, SELECT
database.server.id=184054                # unique among ALL replicas
topic.prefix=shop
table.include.list=shop.orders,shop.customers
schema.history.internal.kafka.bootstrap.servers=kafka:9092
schema.history.internal.kafka.topic=schema-history.shop   # 1 partition, retention.ms=-1
snapshot.mode=initial`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Senior',
      question: {
        vi: 'Connector MySQL báo "The connector is trying to read binlog starting at GTIDs … but this is no longer available". Chuyện gì xảy ra?',
        en: 'A MySQL connector reports “trying to read binlog starting at GTIDs … but this is no longer available”. What happened?'
      },
      answer: {
        vi: 'Binlog chứa vị trí đã lưu bị purge (connector offline lâu hơn retention, hoặc failover sang replica có gtid_purged lớn hơn). Không thể resume; phải chạy snapshot mới (snapshot.mode=when_needed hoặc reset offset) và tăng retention / alert lag.',
        en: 'The binlog holding the stored position was purged (offline longer than retention, or failover to a replica with a larger gtid_purged). It cannot resume; run a new snapshot (snapshot.mode=when_needed or reset offsets) and raise retention / alert on lag.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Tại sao schema history topic không được bật compaction?',
        en: 'Why must the schema history topic not be compacted?'
      },
      answer: {
        vi: 'Các bản ghi DDL không có key thay thế nhau — cần toàn bộ chuỗi theo thứ tự để dựng lại schema tại một offset bất kỳ. Compaction/xoá theo thời gian sẽ làm mất DDL cũ và connector không khởi động lại được.',
        en: 'DDL records do not supersede one another by key — the whole ordered sequence is needed to rebuild schema at any offset. Compaction or time-based deletion drops old DDL and the connector cannot restart.'
      }
    }
  ],

  researchCitations: [CDC_CITATIONS.mysqlBinlog, CDC_CITATIONS.debeziumMysql]
};
