import type { CdcTopic } from '../types';
import { CDC_CITATIONS } from '../citations';

export const snapshotsInitialIncrementalTopic: CdcTopic = {
  id: 'snapshots-initial-incremental',
  category: 'cdc-debezium',
  level: 'advanced',
  chapter: 'Chương 02',
  name: 'Initial & Incremental Snapshots (DBLog Watermarks)',
  tagline: {
    vi: 'Log chỉ chứa thay đổi từ thời điểm bật CDC. Làm sao đưa 500 triệu dòng có sẵn vào Kafka mà không khoá bảng và không trộn sai với luồng log đang chạy?',
    en: 'The log only holds changes since CDC was enabled. How do you load 500 million existing rows into Kafka without locking tables or mis-merging them with the live log?'
  },
  difficulty: 3,
  order: 5,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Consumer mới cần trạng thái đầy đủ chứ không chỉ thay đổi tương lai, nhưng WAL cũ đã bị tái sử dụng từ lâu. SELECT toàn bảng mất hàng giờ; trong lúc đó dòng vẫn bị UPDATE. Nếu phát snapshot cũ sau thay đổi mới, consumer sẽ ghi đè giá trị mới bằng giá trị cũ.',
      en: 'A new consumer needs full state, not just future changes, but old WAL was recycled long ago. A full-table SELECT takes hours while rows keep being UPDATEd. If a stale snapshot row is emitted after a newer change, consumers overwrite the new value with the old one.'
    },
    hardwareConstraint: {
      vi: 'Transaction REPEATABLE READ kéo dài hàng giờ giữ xmin cũ → VACUUM không dọn được dead tuple → bloat. Khoá bảng (FLUSH TABLES WITH READ LOCK) dừng toàn bộ ghi.',
      en: 'An hours-long REPEATABLE READ transaction pins an old xmin → VACUUM cannot clean dead tuples → bloat. Table locks (FLUSH TABLES WITH READ LOCK) stop all writes.'
    },
    fundamentalSolution: {
      vi: 'Initial snapshot: mở transaction nhất quán tại đúng điểm bắt đầu của slot (Postgres export snapshot khi tạo slot), đọc toàn bảng phát op=r, rồi stream log từ điểm đó — không có khoảng hở. Incremental snapshot (thuật toán DBLog): chia bảng thành chunk theo PK; với mỗi chunk ghi low watermark vào signal table, SELECT chunk, ghi high watermark. Sự kiện log nằm giữa hai watermark mà trùng key với chunk sẽ loại dòng snapshot đó (log thắng), phần còn lại phát tại high watermark.',
      en: 'Initial snapshot: open a consistent transaction at exactly the slot’s start point (Postgres exports a snapshot when the slot is created), read the tables emitting op=r, then stream the log from that point — no gap. Incremental snapshot (the DBLog algorithm): split the table into PK chunks; for each chunk write a low watermark to a signal table, SELECT the chunk, write a high watermark. Log events between the watermarks whose key is in the chunk evict that snapshot row (the log wins); the rest are emitted at the high watermark.'
    },
    math: {
      formula: String.raw`\text{emit}(C_i) = C_i \setminus \{\, r \in C_i \mid \exists e \in \text{log}(w_{\text{low}}, w_{\text{high}}),\ \text{key}(e) = \text{key}(r) \,\}`,
      description: {
        vi: 'Chunk C_i chỉ phát những dòng không bị log event nào trong cửa sổ watermark chạm tới. Vì log event mới hơn hoặc bằng dòng đã SELECT, loại dòng snapshot không bao giờ làm mất dữ liệu mới nhất.',
        en: 'Chunk C_i emits only the rows untouched by any log event inside the watermark window. Since such log events are at least as new as the SELECTed row, evicting the snapshot row never loses the latest state.'
      },
      timeComplexity: 'O(N / chunk.size) chunk queries, interleaved with streaming',
      spaceComplexity: 'O(chunk.size) buffered rows'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Debezium hỗ trợ hai kiểu: snapshot.mode (initial, initial_only, no_data, when_needed…) chạy lúc khởi động, và incremental snapshot kích hoạt bằng signal bất cứ lúc nào, có thể pause/resume, không chặn streaming.',
      en: 'Debezium offers two kinds: snapshot.mode (initial, initial_only, no_data, when_needed…) run at startup, and incremental snapshots triggered by a signal at any time, pausable/resumable, without blocking streaming.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Initial snapshot trên Postgres: Debezium tạo slot với EXPORT_SNAPSHOT, nhận snapshot name, mở transaction REPEATABLE READ với SET TRANSACTION SNAPSHOT đó → dữ liệu đọc được khớp chính xác LSN bắt đầu của slot. Trên MySQL: lấy global read lock ngắn, ghi lại vị trí binlog, START TRANSACTION WITH CONSISTENT SNAPSHOT, nhả lock rồi đọc.',
        en: 'Initial snapshot on Postgres: Debezium creates the slot with EXPORT_SNAPSHOT, receives the snapshot name and opens a REPEATABLE READ transaction with SET TRANSACTION SNAPSHOT → the data read matches the slot’s start LSN exactly. On MySQL: take a brief global read lock, record the binlog position, START TRANSACTION WITH CONSISTENT SNAPSHOT, release the lock, then read.'
      },
      {
        vi: 'Incremental snapshot dùng signal table (signal.data.collection). Watermark là INSERT vào chính bảng này, nên chúng xuất hiện trong log đúng vị trí thời gian — đó là "đồng hồ" để biết log event nào đồng thời với SELECT. Tiến độ chunk được lưu trong offset, nên restart connector sẽ tiếp tục từ chunk dở.',
        en: 'Incremental snapshots use the signal table (signal.data.collection). Watermarks are INSERTs into this table, so they appear in the log at the right point in time — the “clock” that tells which log events were concurrent with the SELECT. Chunk progress is stored in the offsets, so a connector restart resumes from the unfinished chunk.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Bảng không có PK (hoặc PK không so sánh được) không chunk được → cần surrogate key hoặc message.key.columns.',
        en: 'Tables without a PK (or a non-sortable PK) can’t be chunked → add a surrogate key or message.key.columns.'
      },
      {
        vi: 'Quên thêm signal table vào publication: watermark không xuất hiện trong luồng, snapshot treo.',
        en: 'Forgetting to add the signal table to the publication: watermarks never show up, the snapshot hangs.'
      },
      {
        vi: 'Sự kiện snapshot op=r có thể đến sau op=u của dòng khác — consumer không được giả định snapshot xong mới đến streaming.',
        en: 'Snapshot op=r events can arrive after op=u events of other rows — consumers must not assume snapshot-then-stream.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cửa sổ watermark trong incremental snapshot',
      en: 'The watermark window of an incremental snapshot'
    },
    description: {
      vi: 'Log event trong cửa sổ loại bỏ dòng trùng key khỏi buffer chunk.',
      en: 'Log events inside the window evict same-key rows from the chunk buffer.'
    },
    asciiDiagram: `
 log ─────┬────────────┬──────────┬──────────┬─────────────┬──────────▶
          │ LOW wm     │ u id=7   │ c id=99  │ HIGH wm     │
          │ (signal)   │ (emit)   │ (emit)   │ (signal)    │
          ▼            ▼          ▼          ▼             ▼
 chunk SELECT id BETWEEN 1 AND 1024  → buffer {1..1024}
                       id=7 evicted (log already has the newer value)
                                             at HIGH: emit op=r for {1..1024} \\ {7}

 debezium_signal(id, type, data)
   INSERT ('ad-hoc-1','execute-snapshot',
           '{"data-collections":["public.orders"],"type":"incremental"}')
`,
    components: [
      {
        name: 'Signal table',
        role: 'Control channel',
        description: {
          vi: 'Nhận lệnh execute-snapshot/pause/stop và chứa watermark.',
          en: 'Receives execute-snapshot/pause/stop commands and holds watermarks.'
        }
      },
      {
        name: 'Chunk buffer',
        role: 'Dedup window',
        description: {
          vi: 'Giữ dòng của chunk hiện tại cho tới high watermark.',
          en: 'Holds the current chunk’s rows until the high watermark.'
        }
      },
      {
        name: 'snapshot.mode',
        role: 'Startup policy',
        description: {
          vi: 'initial, no_data, when_needed, recovery…',
          en: 'initial, no_data, when_needed, recovery…'
        }
      }
    ]
  },

  steps: [
    {
      id: 'signal',
      title: { vi: 'Gửi signal execute-snapshot', en: 'Send an execute-snapshot signal' },
      phase: 'Trigger',
      description: {
        vi: 'INSERT vào debezium_signal yêu cầu incremental snapshot cho public.orders.',
        en: 'INSERT into debezium_signal requesting an incremental snapshot of public.orders.'
      },
      systemBehavior: {
        vi: 'Debezium thấy signal qua chính luồng log và lên kế hoạch chunk.',
        en: 'Debezium sees the signal through the log itself and plans chunks.'
      },
      codeLineMatch: "'execute-snapshot'"
    },
    {
      id: 'low-watermark',
      title: { vi: 'Low watermark & SELECT chunk', en: 'Low watermark & chunk SELECT' },
      phase: 'Chunk',
      description: {
        vi: 'Ghi low watermark, đọc 1.024 dòng tiếp theo theo thứ tự PK vào buffer.',
        en: 'Write the low watermark, read the next 1,024 rows by PK into the buffer.'
      },
      systemBehavior: {
        vi: 'SELECT ngắn, không giữ transaction dài, không khoá bảng.',
        en: 'A short SELECT, no long transaction, no table lock.'
      },
      codeLineMatch: 'incremental.snapshot.chunk.size'
    },
    {
      id: 'dedupe',
      title: { vi: 'Log event loại dòng trùng key', en: 'Log events evict same-key rows' },
      phase: 'Merge',
      description: {
        vi: 'UPDATE id=7 xuất hiện trong cửa sổ → phát ngay và xoá id=7 khỏi buffer.',
        en: 'UPDATE id=7 appears inside the window → emitted immediately and id=7 removed from the buffer.'
      },
      systemBehavior: {
        vi: 'Streaming tiếp tục bình thường trong suốt snapshot.',
        en: 'Streaming continues normally throughout the snapshot.'
      },
      codeLineMatch: 'signal.data.collection'
    },
    {
      id: 'high-watermark',
      title: { vi: 'High watermark: phát phần còn lại', en: 'High watermark: emit the rest' },
      phase: 'Emit',
      description: {
        vi: 'Phần còn lại của buffer phát với op=r; tiến độ chunk lưu vào offset.',
        en: 'The rest of the buffer is emitted with op=r; chunk progress goes into the offsets.'
      },
      systemBehavior: {
        vi: 'Restart connector sẽ tiếp tục từ chunk kế tiếp.',
        en: 'A connector restart resumes at the next chunk.'
      },
      codeLineMatch: 'snapshot.mode'
    }
  ],

  tradeoffs: {
    pros: [
      {
        vi: 'Không khoá bảng, không transaction dài, không dừng streaming.',
        en: 'No table locks, no long transactions, no streaming pause.'
      },
      {
        vi: 'Có thể snapshot lại một bảng bất kỳ lúc nào (backfill, sửa lệch).',
        en: 'Re-snapshot any table at any time (backfills, repairs).'
      },
      {
        vi: 'Resume được sau crash ở mức chunk.',
        en: 'Resumable after a crash at chunk granularity.'
      }
    ],
    cons: [
      {
        vi: 'Thứ tự op=r xen kẽ với op=c/u/d — consumer phải upsert idempotent.',
        en: 'op=r interleaves with op=c/u/d — consumers must upsert idempotently.'
      },
      {
        vi: 'Cần quyền ghi vào signal table trên DB nguồn.',
        en: 'Requires write access to a signal table on the source DB.'
      }
    ],
    balance: {
      vi: 'Chunk lớn ⇒ snapshot nhanh hơn nhưng buffer RAM lớn hơn và SELECT nặng hơn; 1.024–8.192 dòng là khởi điểm hợp lý.',
      en: 'Bigger chunks ⇒ faster snapshots but more buffer memory and heavier SELECTs; 1,024–8,192 rows is a reasonable start.'
    },
    invariant: {
      vi: 'Không bao giờ phát một dòng snapshot cũ hơn một log event đã phát cho cùng key.',
      en: 'Never emit a snapshot row older than an already-emitted log event for the same key.'
    }
  },

  code: [
    {
      label: 'incremental-snapshot.sql',
      filename: 'incremental-snapshot.sql',
      language: 'sql',
      code: `-- Connector config (excerpt):
--   signal.data.collection=public.debezium_signal
--   incremental.snapshot.chunk.size=1024
--   snapshot.mode=no_data        -- stream only; backfill on demand

CREATE TABLE public.debezium_signal (
  id   VARCHAR(42) PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  data VARCHAR(2048)
);
ALTER PUBLICATION dbz_publication ADD TABLE public.debezium_signal;

-- Trigger an incremental snapshot of one table (optionally filtered)
INSERT INTO public.debezium_signal (id, type, data) VALUES (
  'backfill-orders-2026-11', 'execute-snapshot',
  '{"data-collections": ["public.orders"], "type": "incremental",
    "additional-conditions": [{"data-collection": "public.orders",
                               "filter": "created_at >= ''2026-01-01''"}]}'
);

-- Pause / resume a long-running backfill
INSERT INTO public.debezium_signal VALUES ('p1', 'pause-snapshot', NULL);
INSERT INTO public.debezium_signal VALUES ('r1', 'resume-snapshot', NULL);`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Senior',
      question: {
        vi: 'Giải thích vì sao incremental snapshot không ghi đè giá trị mới bằng giá trị cũ.',
        en: 'Explain why an incremental snapshot never overwrites a new value with an old one.'
      },
      answer: {
        vi: 'Mỗi chunk được bao bởi low/high watermark ghi vào log. Mọi log event giữa hai watermark là đồng thời hoặc mới hơn SELECT; nếu key trùng, dòng snapshot bị loại khỏi buffer và chỉ log event được phát. Dòng còn lại không bị thay đổi trong cửa sổ, nên giá trị SELECT là mới nhất tại high watermark.',
        en: 'Each chunk is bracketed by low/high watermarks written into the log. Any log event between them is concurrent with or newer than the SELECT; on a key match the snapshot row is evicted and only the log event is emitted. Remaining rows were not changed in the window, so their SELECTed value is the latest as of the high watermark.'
      },
      proTip: {
        vi: 'Nhắc tên paper DBLog (Netflix, 2020) — thể hiện hiểu nguồn gốc thuật toán.',
        en: 'Cite the DBLog paper (Netflix, 2020) — shows you know where the algorithm comes from.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Initial snapshot trên Postgres đảm bảo không có khoảng hở với streaming thế nào?',
        en: 'How does a Postgres initial snapshot avoid a gap with streaming?'
      },
      answer: {
        vi: 'Slot được tạo với exported snapshot; transaction snapshot dùng đúng snapshot đó, nên dữ liệu SELECT tương ứng chính xác LSN bắt đầu của slot. Streaming bắt đầu từ LSN đó, không thiếu cũng không trùng.',
        en: 'The slot is created with an exported snapshot; the snapshot transaction uses exactly that snapshot, so SELECTed data corresponds to the slot’s start LSN. Streaming begins at that LSN, with no gap and no overlap.'
      }
    }
  ],

  researchCitations: [CDC_CITATIONS.dblog, CDC_CITATIONS.debeziumPg]
};
