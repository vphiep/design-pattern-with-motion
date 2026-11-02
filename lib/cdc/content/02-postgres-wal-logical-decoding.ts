import type { CdcTopic } from '../types';
import { CDC_CITATIONS } from '../citations';

export const postgresWalLogicalDecodingTopic: CdcTopic = {
  id: 'postgres-wal-logical-decoding',
  category: 'cdc-foundations',
  level: 'intermediate',
  chapter: 'Chương 01',
  name: 'PostgreSQL WAL, LSN & Logical Decoding',
  tagline: {
    vi: 'wal_level=logical, publication, replication slot, plugin pgoutput, REPLICA IDENTITY — và vì sao một slot bị bỏ quên có thể làm đầy ổ đĩa primary.',
    en: 'wal_level=logical, publications, replication slots, the pgoutput plugin, REPLICA IDENTITY — and why one forgotten slot can fill the primary’s disk.'
  },
  difficulty: 2,
  order: 2,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      vi: 'WAL của PostgreSQL là log vật lý: nó mô tả thay đổi trên page 8KB (block X, offset Y), không phải "INSERT vào bảng orders giá trị …". Consumer bên ngoài cần thay đổi mức dòng, theo thứ tự commit, và phải chắc chắn WAL chưa bị checkpoint xoá trước khi đọc xong.',
      en: 'PostgreSQL’s WAL is physical: it describes changes to 8KB pages (block X, offset Y), not “INSERT into orders values …”. External consumers need row-level changes in commit order, and must be sure WAL is not recycled by a checkpoint before they have read it.'
    },
    hardwareConstraint: {
      vi: 'WAL segment mặc định 16MB; WAL được giữ trên đĩa của primary. Nếu consumer chậm hoặc chết, mọi segment từ restart_lsn trở đi đều bị giữ lại → ổ đĩa đầy → primary ngừng nhận ghi.',
      en: 'WAL segments are 16MB by default and live on the primary’s disk. If the consumer is slow or dead, every segment from restart_lsn onward is retained → the disk fills → the primary stops accepting writes.'
    },
    fundamentalSolution: {
      vi: 'wal_level=logical bổ sung đủ thông tin để giải mã dòng. Logical decoding plugin (pgoutput, tích hợp từ PG10) biến WAL thành luồng BEGIN/INSERT/UPDATE/DELETE/COMMIT, chỉ phát giao dịch đã commit, theo thứ tự commit. Replication slot ghi nhớ confirmed_flush_lsn của consumer để server không xoá WAL còn cần, và publication giới hạn bảng nào được phát.',
      en: 'wal_level=logical adds enough information to decode rows. A logical decoding plugin (pgoutput, built-in since PG10) turns WAL into a stream of BEGIN/INSERT/UPDATE/DELETE/COMMIT, emitting only committed transactions in commit order. A replication slot remembers the consumer’s confirmed_flush_lsn so the server keeps the WAL it still needs, and a publication limits which tables are emitted.'
    },
    math: {
      formula: String.raw`\text{WAL}_{\text{retained}} = \text{pg\_current\_wal\_lsn}() - \text{restart\_lsn}_{\text{slot}} \;\le\; \text{max\_slot\_wal\_keep\_size}`,
      description: {
        vi: 'Dung lượng WAL bị giữ tăng tuyến tính theo tốc độ ghi × thời gian consumer đứng. Ghi 50 MB/s và connector chết 2 giờ ⇒ ~360 GB WAL. Từ PG13, max_slot_wal_keep_size giới hạn mức này (slot vượt ngưỡng bị invalidate, phải snapshot lại) để bảo vệ primary.',
        en: 'Retained WAL grows linearly with write rate × consumer downtime. 50 MB/s of writes and a connector down for 2 hours ⇒ ~360 GB of WAL. Since PG13, max_slot_wal_keep_size caps this (a slot over the limit is invalidated and must re-snapshot) to protect the primary.'
      },
      timeComplexity: 'O(changes) decoding, sequential WAL read',
      spaceComplexity: 'O(write rate × consumer lag)'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Logical replication gồm ba đối tượng: publication (bảng nào), slot (tiến độ consumer), plugin (định dạng đầu ra). Debezium tạo/đọc cả ba qua giao thức streaming replication.',
      en: 'Logical replication has three objects: the publication (which tables), the slot (consumer progress) and the plugin (output format). Debezium creates/reads all three over the streaming replication protocol.'
    },
    deepDiveParagraphs: [
      {
        vi: 'LSN (Log Sequence Number) là offset byte 64-bit trong WAL, hiển thị dạng 0/16B3748. Slot lưu hai mốc: restart_lsn (WAL cũ nhất server phải giữ để giải mã lại các transaction còn dở) và confirmed_flush_lsn (vị trí consumer xác nhận đã xử lý bền). Debezium chỉ flush LSN về slot sau khi Kafka đã ack bản ghi tương ứng.',
        en: 'An LSN (Log Sequence Number) is a 64-bit byte offset in the WAL, displayed as 0/16B3748. A slot stores two markers: restart_lsn (the oldest WAL the server must keep to re-decode in-flight transactions) and confirmed_flush_lsn (where the consumer has durably processed). Debezium flushes the LSN back to the slot only after Kafka has acknowledged the corresponding records.'
      },
      {
        vi: 'REPLICA IDENTITY quyết định before-image của UPDATE/DELETE. DEFAULT chỉ ghi cột primary key cũ; FULL ghi toàn bộ dòng cũ (WAL to hơn); NOTHING không có before-image. Bảng không có PK với DEFAULT sẽ khiến UPDATE/DELETE bị lỗi khi đã thuộc publication.',
        en: 'REPLICA IDENTITY decides the before-image of UPDATE/DELETE. DEFAULT logs only the old primary key; FULL logs the whole old row (bigger WAL); NOTHING logs no before-image. A table without a PK under DEFAULT will reject UPDATE/DELETE once it is in a publication.'
      },
      {
        vi: 'Logical decoding giải mã theo commit: transaction lớn được buffer trong reorder buffer (tràn ra đĩa khi vượt logical_decoding_work_mem) và chỉ phát khi COMMIT. Vì vậy một batch UPDATE 50 triệu dòng sẽ xuất hiện như một khối lớn đột ngột ở consumer.',
        en: 'Logical decoding emits by commit: large transactions are buffered in the reorder buffer (spilling to disk beyond logical_decoding_work_mem) and only emitted at COMMIT. A 50-million-row batch UPDATE therefore lands on consumers as one sudden burst.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Xoá connector Debezium nhưng quên SELECT pg_drop_replication_slot(…) → WAL tích tụ đến khi đầy đĩa.',
        en: 'Deleting the Debezium connector but forgetting SELECT pg_drop_replication_slot(…) → WAL accumulates until the disk is full.'
      },
      {
        vi: 'Database có bảng được capture nhưng ít ghi, trong khi DB khác cùng cluster ghi nhiều: slot không tiến vì không có sự kiện nào → cần heartbeat.action.query (bài 06).',
        en: 'A captured database with few writes while another database on the cluster writes heavily: the slot never advances because no events arrive → use heartbeat.action.query (lesson 06).'
      },
      {
        vi: 'Trước PG17, slot không tự đồng bộ sang standby: failover primary làm mất slot và vị trí đọc.',
        en: 'Before PG17 slots are not synchronised to standbys: a primary failover loses the slot and its position.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Đường đi từ COMMIT tới change event', en: 'From COMMIT to change event' },
    description: {
      vi: 'Backend ghi WAL; walsender giải mã qua pgoutput cho slot; Debezium nhận qua giao thức replication và xác nhận LSN.',
      en: 'The backend writes WAL; a walsender decodes via pgoutput for the slot; Debezium receives over the replication protocol and confirms LSNs.'
    },
    asciiDiagram: `
 backend: BEGIN; UPDATE orders SET status='PAID' WHERE id=42; COMMIT;
        │ XLogInsert + fsync
        ▼
 pg_wal/ 000000010000000000000016  ─ LSN 0/16B3748 ─────────────▶
        │
        ▼ walsender (START_REPLICATION SLOT debezium LOGICAL 0/16B3000)
 reorder buffer ── chỉ phát khi COMMIT ──▶ pgoutput ─▶ publication dbz_publication
        │                                               (orders, customers)
        ▼
 Debezium PostgresConnector ── produce ──▶ Kafka ── ack ──┐
        ▲                                                 │
        └──── Standby status update: flush LSN 0/16B3748 ◀─┘
 pg_replication_slots: restart_lsn=0/16B2F10  confirmed_flush_lsn=0/16B3748
`,
    components: [
      {
        name: 'wal_level=logical',
        role: 'Server setting',
        description: {
          vi: 'Ghi thêm metadata để giải mã mức dòng; cần restart.',
          en: 'Logs extra metadata for row decoding; requires restart.'
        }
      },
      {
        name: 'Publication',
        role: 'Table filter',
        description: {
          vi: 'CREATE PUBLICATION … FOR TABLE; quyết định bảng/thao tác nào được phát.',
          en: 'CREATE PUBLICATION … FOR TABLE; decides which tables/operations are emitted.'
        }
      },
      {
        name: 'Replication slot',
        role: 'Consumer cursor',
        description: {
          vi: 'Giữ WAL từ restart_lsn; tồn tại qua restart.',
          en: 'Retains WAL from restart_lsn; survives restarts.'
        }
      },
      {
        name: 'pgoutput',
        role: 'Output plugin',
        description: {
          vi: 'Plugin chuẩn, nhị phân, không cần cài extension.',
          en: 'Built-in binary plugin, no extension needed.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'configure',
      title: {
        vi: 'Bật wal_level=logical & tạo publication',
        en: 'Enable wal_level=logical & create a publication'
      },
      phase: 'Configure',
      description: {
        vi: 'Đặt wal_level, max_replication_slots, max_wal_senders; tạo publication cho các bảng cần capture.',
        en: 'Set wal_level, max_replication_slots, max_wal_senders; create a publication for captured tables.'
      },
      systemBehavior: {
        vi: 'Postgres bắt đầu ghi thêm thông tin logical vào WAL sau khi restart.',
        en: 'After restart Postgres logs the extra logical information into WAL.'
      },
      codeLineMatch: 'ALTER SYSTEM SET wal_level'
    },
    {
      id: 'slot',
      title: {
        vi: 'Tạo replication slot với pgoutput',
        en: 'Create a replication slot with pgoutput'
      },
      phase: 'Slot',
      description: {
        vi: 'Slot ghi nhận điểm bắt đầu nhất quán; từ đây WAL được giữ lại cho consumer.',
        en: 'The slot records a consistent starting point; from now on WAL is retained for the consumer.'
      },
      systemBehavior: {
        vi: 'restart_lsn được ghim; checkpoint không còn được xoá segment sau mốc này.',
        en: 'restart_lsn is pinned; checkpoints can no longer remove segments past it.'
      },
      codeLineMatch: 'pg_create_logical_replication_slot'
    },
    {
      id: 'decode',
      title: { vi: 'Giải mã giao dịch đã commit', en: 'Decode committed transactions' },
      phase: 'Decode',
      description: {
        vi: 'UPDATE orders được buffer tới COMMIT rồi phát thành thông điệp Relation/Update qua pgoutput.',
        en: 'UPDATE orders is buffered until COMMIT then emitted as Relation/Update messages via pgoutput.'
      },
      systemBehavior: {
        vi: 'Transaction rollback không bao giờ được phát ra.',
        en: 'Rolled-back transactions are never emitted.'
      },
      codeLineMatch: 'pg_logical_slot_peek_binary_changes'
    },
    {
      id: 'confirm',
      title: { vi: 'Xác nhận LSN & giám sát lag', en: 'Confirm LSN & monitor lag' },
      phase: 'Confirm',
      description: {
        vi: 'Consumer gửi flush LSN; WAL trước restart_lsn được tái sử dụng. Theo dõi khoảng cách WAL bị giữ.',
        en: 'The consumer sends the flush LSN; WAL before restart_lsn is recycled. Monitor retained WAL size.'
      },
      systemBehavior: {
        vi: 'confirmed_flush_lsn tiến lên; pg_wal_lsn_diff cho biết dung lượng còn giữ.',
        en: 'confirmed_flush_lsn advances; pg_wal_lsn_diff reports how much is still retained.'
      },
      codeLineMatch: 'pg_wal_lsn_diff'
    }
  ],

  comparison: {
    title: { vi: 'pgoutput vs wal2json vs decoderbufs', en: 'pgoutput vs wal2json vs decoderbufs' },
    subtitle: { vi: 'Chọn logical decoding plugin', en: 'Choosing a logical decoding plugin' },
    options: [
      {
        name: 'pgoutput',
        tag: 'Built-in',
        role: {
          vi: 'Plugin chuẩn của logical replication',
          en: 'Native logical replication plugin'
        },
        keyMechanism: {
          vi: 'Có sẵn từ PG10, chạy trên mọi managed Postgres (RDS, Cloud SQL, Azure), lọc theo publication.',
          en: 'Bundled since PG10, works on every managed Postgres (RDS, Cloud SQL, Azure), filtered by publication.'
        },
        configExample: 'plugin.name=pgoutput\npublication.autocreate.mode=filtered',
        architectureNote: {
          vi: 'Lựa chọn mặc định cho Debezium.',
          en: 'The default choice for Debezium.'
        }
      },
      {
        name: 'wal2json',
        tag: 'Extension',
        role: { vi: 'Xuất JSON dạng văn bản', en: 'Text JSON output' },
        keyMechanism: {
          vi: 'Dễ debug bằng psql nhưng cần cài extension và chậm hơn với transaction lớn.',
          en: 'Easy to debug from psql but needs an extension and is slower on big transactions.'
        },
        configExample: "SELECT * FROM pg_logical_slot_peek_changes('s', NULL, NULL);",
        architectureNote: {
          vi: 'Hữu ích để học và thử nghiệm.',
          en: 'Handy for learning and experiments.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Không cần trigger hay sửa ứng dụng; chỉ thấy dữ liệu đã commit.',
        en: 'No triggers or app changes; only committed data is visible.'
      },
      {
        vi: 'Thứ tự commit toàn cục trong một database.',
        en: 'Global commit order within a database.'
      },
      {
        vi: 'Resume chính xác từ LSN sau khi consumer restart.',
        en: 'Exact resume from an LSN after consumer restarts.'
      }
    ],
    cons: [
      {
        vi: 'Slot giữ WAL không giới hạn nếu consumer chết (rủi ro đầy đĩa).',
        en: 'Slots retain WAL without bound if the consumer dies (disk-full risk).'
      },
      {
        vi: 'DDL không được phát qua pgoutput — consumer chỉ thấy schema mới qua Relation message.',
        en: 'DDL is not emitted by pgoutput — consumers only see new schemas via Relation messages.'
      },
      {
        vi: 'REPLICA IDENTITY FULL làm WAL to hơn đáng kể với bảng rộng.',
        en: 'REPLICA IDENTITY FULL noticeably inflates WAL for wide tables.'
      }
    ],
    balance: {
      vi: 'Giữ WAL lâu hơn = an toàn hơn cho consumer nhưng rủi ro hơn cho primary; max_slot_wal_keep_size là van cân bằng.',
      en: 'Keeping WAL longer is safer for consumers but riskier for the primary; max_slot_wal_keep_size is the balancing valve.'
    },
    invariant: {
      vi: 'WAL ở LSN ≥ restart_lsn của mọi slot hợp lệ không bao giờ bị xoá.',
      en: 'WAL at LSN ≥ restart_lsn of any valid slot is never removed.'
    }
  },

  code: [
    {
      label: 'setup.sql',
      filename: 'logical-decoding.sql',
      language: 'sql',
      code: `-- 1. Server settings (restart required for wal_level)
ALTER SYSTEM SET wal_level = 'logical';
ALTER SYSTEM SET max_replication_slots = 10;
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET max_slot_wal_keep_size = '100GB';   -- PG13+: protect the primary

CREATE PUBLICATION dbz_publication FOR TABLE public.orders, public.customers;
ALTER TABLE public.orders REPLICA IDENTITY FULL;      -- full before-image on UPDATE/DELETE

-- 2. Create a logical slot using the built-in pgoutput plugin
SELECT * FROM pg_create_logical_replication_slot('debezium', 'pgoutput');

-- 3. A committed change ... and peek at its decoded form (without consuming it)
UPDATE public.orders SET status = 'PAID' WHERE id = 42;
SELECT lsn, xid, length(data)
FROM pg_logical_slot_peek_binary_changes('debezium', NULL, NULL,
       'proto_version', '1', 'publication_names', 'dbz_publication');

-- 4. Monitor: how much WAL is each slot pinning?
SELECT slot_name, active, wal_status,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal,
       confirmed_flush_lsn
FROM pg_replication_slots;

-- Decommissioning a connector? Drop its slot or WAL grows forever.
-- SELECT pg_drop_replication_slot('debezium');`
    },
    {
      label: 'postgresql.conf',
      filename: 'postgresql.conf',
      language: 'bash',
      code: `wal_level = logical
max_replication_slots = 10
max_wal_senders = 10
max_slot_wal_keep_size = 100GB
logical_decoding_work_mem = 256MB   # reorder buffer before spilling to disk
# PG17+: let standbys follow logical slots so CDC survives failover
sync_replication_slots = on          # on the standby
# synchronized_standby_slots = 'standby1'   # on the primary`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Senior',
      question: {
        vi: 'Ổ đĩa primary Postgres đầy dần dù lượng dữ liệu không đổi. Bạn kiểm tra gì đầu tiên?',
        en: 'A Postgres primary’s disk keeps filling though data volume is flat. What do you check first?'
      },
      answer: {
        vi: 'pg_replication_slots: tìm slot active=false hoặc có pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) lớn. Slot của connector đã chết/bị xoá giữ toàn bộ WAL. Khắc phục: khôi phục consumer hoặc drop slot (chấp nhận phải snapshot lại), đặt max_slot_wal_keep_size và alert trên retained WAL.',
        en: 'pg_replication_slots: find slots with active=false or a large pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn). A dead/deleted connector’s slot retains all WAL. Fix: restore the consumer or drop the slot (accepting a re-snapshot), set max_slot_wal_keep_size and alert on retained WAL.'
      },
      trapWarning: {
        vi: 'Xoá file trong pg_wal bằng tay sẽ làm hỏng cluster.',
        en: 'Deleting files from pg_wal by hand corrupts the cluster.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Vì sao event UPDATE từ Debezium có trường before = null?',
        en: 'Why does a Debezium UPDATE event have before = null?'
      },
      answer: {
        vi: 'Bảng đang ở REPLICA IDENTITY DEFAULT: WAL chỉ chứa khoá cũ khi PK thay đổi, nên không có before-image đầy đủ. Đặt REPLICA IDENTITY FULL nếu consumer cần giá trị cũ (ví dụ tính delta), đổi lại WAL lớn hơn.',
        en: 'The table uses REPLICA IDENTITY DEFAULT: WAL only carries the old key when the PK changes, so there is no full before-image. Set REPLICA IDENTITY FULL if consumers need old values (e.g. computing deltas), at the cost of larger WAL.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Primary ngừng nhận ghi vì slot CDC bị bỏ rơi',
      en: 'Primary stops accepting writes due to an abandoned CDC slot'
    },
    businessContext: {
      vi: 'Hệ thống ví điện tử, Postgres 14 trên đĩa 1TB, Debezium stream sang Kafka.',
      en: 'A wallet platform on Postgres 14 with a 1TB disk, Debezium streaming to Kafka.'
    },
    problemDescription: {
      vi: 'Team analytics tắt connector thử nghiệm vào thứ Sáu. Chủ nhật 3h sáng, pg_wal chiếm 900GB, Postgres PANIC "No space left on device".',
      en: 'The analytics team stopped a test connector on Friday. At 3 a.m. Sunday pg_wal used 900GB and Postgres PANICked with “No space left on device”.'
    },
    whyNaiveFails: {
      vi: 'Tắt connector không xoá slot; slot inactive vẫn ghim restart_lsn. Alert chỉ theo dõi kích thước bảng, không theo dõi pg_wal.',
      en: 'Stopping the connector does not drop the slot; the inactive slot still pins restart_lsn. Alerts watched table size, not pg_wal.'
    },
    coreSolution: {
      vi: 'Drop slot mồ côi, đặt max_slot_wal_keep_size=100GB, alert khi retained_wal > 20GB hoặc slot inactive > 15 phút, và quy trình decommission bắt buộc drop slot.',
      en: 'Drop the orphan slot, set max_slot_wal_keep_size=100GB, alert when retained_wal > 20GB or a slot is inactive > 15 minutes, and make dropping the slot part of decommissioning.'
    },
    productionCode: `SELECT slot_name,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained
FROM pg_replication_slots
WHERE NOT active OR pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) > 20 * 1024^3;`,
    productionLanguage: 'sql',
    architectureImpact: {
      vi: 'Không tái diễn; slot hỏng bị invalidate thay vì làm sập primary.',
      en: 'No recurrence; a runaway slot is invalidated instead of taking down the primary.'
    }
  },

  researchCitations: [CDC_CITATIONS.pgLogical, CDC_CITATIONS.debeziumPg]
};
