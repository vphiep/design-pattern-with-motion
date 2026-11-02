import type { DatabaseTopic } from '../types';

export const ariesRecovery: DatabaseTopic = {
  id: 'aries-recovery',
  category: 'durability-wal',
  name: 'ARIES Crash Recovery Algorithm',
  tagline: {
    en: 'The definitive crash recovery algorithm: Analysis Pass, Redo Pass (Repeating History), and Undo Pass with Compensation Log Records (CLR).',
    vi: 'Thuật toán phục hồi sự cố kinh điển: Pha Phân tích (Analysis), Pha Tái hiện Lịch sử (Redo) và Pha Hoàn tác (Undo) với Compensation Log Records (CLR).'
  },
  difficulty: 3,
  order: 11,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'When a database server suddenly crashes due to a power outage or kernel panic, two catastrophic states exist: (1) Committed transactions whose dirty pages in the Buffer Pool were not yet written to disk (violating Durability); and (2) In-flight uncommitted transactions whose dirty pages WERE written to disk via buffer pool eviction (violating Atomicity).',
      vi: 'Khi máy chủ cơ sở dữ liệu đột ngột sập nguồn hoặc kernel panic, hai trạng thái thảm họa cùng tồn tại: (1) Các giao dịch đã commit nhưng trang bẩn trong RAM chưa kịp ghi xuống đĩa (vi phạm Durability); và (2) Các giao dịch đang chạy dở chưa commit nhưng trang bẩn ĐÃ bị ghi xuống đĩa do giải phóng bộ nhớ (vi phạm Atomicity).'
    },
    hardwareConstraint: {
      en: 'Non-volatile RAM (NVRAM) is not universally available. Database recovery must rely entirely on sequentially ordered log records stored on physical disk sectors, and the recovery process itself must be idempotent: if the system crashes DURING recovery, restarting recovery must produce identical correct results.',
      vi: 'Bộ nhớ RAM không biến đổi (NVRAM) không phổ biến. Quá trình phục hồi phải dựa hoàn toàn vào các bản ghi nhật ký tuần tự trên đĩa, và quá trình phục hồi bắt buộc phải có tính lũy quyền (idempotent): nếu máy chủ lại sập NGAY TRONG LÚC đang phục hồi, chạy lại lần nữa vẫn phải ra kết quả chính xác.'
    },
    fundamentalSolution: {
      en: 'Developed by C. Mohan at IBM, ARIES (Algorithms for Recovery and Isolation Exploiting Semantics) uses 3 distinct passes: (1) Analysis Pass: Reconstructs the Dirty Page Table and Active Transaction Table from the last checkpoint; (2) Redo Pass: "Repeats History" forward from the oldest unflushed page, reapplying all changes including uncommitted ones; (3) Undo Pass: Scans backward, undoing changes of all active "loser" transactions and writing Compensation Log Records (CLR) so rollbacks are never repeated.',
      vi: 'Được phát minh bởi C. Mohan tại IBM, giải thuật ARIES áp dụng 3 giai đoạn: (1) Pha Phân Tích: Tái tạo Bảng Trang Bẩn và Bảng Giao Dịch Đang Chạy từ mốc checkpoint; (2) Pha Redo: "Tái hiện lịch sử" chạy xuôi từ trang bẩn cũ nhất, nạp lại toàn bộ thay đổi kể cả chưa commit; (3) Pha Undo: Quét ngược từ đuôi log về, hoàn tác các giao dịch thua cuộc (losers) và ghi bản ghi bù đắp (CLR) để không bao giờ phải hoàn tác lại lần hai.'
    },
    math: {
      formula: 'Redo Start Point = min(RecLSN across all pages in Dirty Page Table)',
      description: {
        en: 'The Redo pass begins at the minimum RecLSN across all dirty pages at checkpoint time, guaranteeing that no lost update is skipped.',
        vi: 'Pha Redo bắt đầu tại RecLSN nhỏ nhất trong Bảng Trang Bẩn, bảo đảm không bỏ sót bất kỳ thay đổi nào.'
      },
      timeComplexity: 'O(WAL length from Checkpoint to Crash)',
      spaceComplexity: 'O(Dirty Pages + Active Transactions) during recovery',
      ioCostFormula: 'Recovery Time = Sequential WAL Scan + Random Page Repair Writes'
    }
  },

  pageLayout: {
    title: {
      en: 'ARIES Checkpoint Record & Compensation Log Record (CLR) Layout',
      vi: 'Cấu trúc Bản ghi Checkpoint & Bản ghi bù đắp CLR trong ARIES'
    },
    description: {
      en: 'Fuzzy Checkpoints record the Dirty Page Table (PageID -> RecLSN) and Transaction Table (TxID -> LastLSN) in the WAL without freezing concurrent writes.',
      vi: 'Kỹ thuật Fuzzy Checkpoint ghi lại Bảng Trang Bẩn (PageID -> RecLSN) và Bảng Giao Dịch (TxID -> LastLSN) vào WAL mà không cần khóa dừng hệ thống.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| FUZZY CHECKPOINT RECORD:                                                 |
|  - Active Transaction Table: [ Tx#40: LastLSN=1025 | Tx#41: LastLSN=1040 ]|
|  - Dirty Page Table:        [ Page#5: RecLSN=1010 | Page#9: RecLSN=1020 ]|
+--------------------------------------------------------------------------+
| 3-PASS CRASH RECOVERY TIMELINE:                                          |
|                                                                          |
|  [ Min RecLSN: 1010 ] -----> [ Checkpoint LSN ] -----> [ CRASH LSN ]     |
|          |                            |                        |         |
|          +--- 1. ANALYSIS PASS (reads checkpoint to crash) ----+         |
|          |                                                               |
|          +--- 2. REDO PASS (Repeats history forward 1010 -> crash) ----> |
|                                                                          |
|          <--- 3. UNDO PASS (Scans backward, undoing loser transactions)  |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'RecLSN', size: '8 Bytes', description: { en: 'Oldest LSN that modified the page on disk since it was last clean', vi: 'LSN cũ nhất đã sửa trang trên đĩa kể từ lần cuối trang ở trạng thái sạch' } },
      { name: 'UndoNextLSN', size: '8 Bytes (in CLR)', description: { en: 'Next LSN to be undone for this transaction, skipping already compensated logs', vi: 'LSN tiếp theo cần hoàn tác, bỏ qua các bản ghi đã được đền bù' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'ARIES (Algorithms for Recovery and Isolation Exploiting Semantics), developed by C. Mohan, Don Haderle, et al. at IBM Research in 1992, is the definitive theoretical crash recovery protocol. It establishes the 3-pass paradigm (Analysis, Redo repeating history, Undo with CLRs). However, production engines implement distinct architectural variants: MySQL InnoDB is heavily ARIES-inspired (using redo logs and undo rollback segments), whereas PostgreSQL uses a streamlined redo-only crash recovery mechanism where uncommitted transactions are marked ABORTED in pg_xact without an ARIES undo pass.',
      vi: 'ARIES (Algorithms for Recovery and Isolation Exploiting Semantics), do C. Mohan và các đồng nghiệp tại IBM Research phát minh năm 1992, là thuật toán chuẩn mực lý thuyết về phục hồi sau sự cố. Nó thiết lập mô hình 3 pha kinh điển (Analysis, Redo tái hiện lịch sử, Undo với CLR). Tuy nhiên, các hệ quản trị thực tế có cách tiếp cận khác nhau: MySQL InnoDB chịu ảnh hưởng sâu sắc từ ARIES (dùng redo logs và phân đoạn undo để rollback), trong khi PostgreSQL áp dụng cơ chế phục hồi chỉ chạy Redo (Redo-Only WAL) mà không cần pha Undo vì các giao dịch dang dở được đánh dấu ABORTED ngay trong pg_xact.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The 3 Foundational Invariants of ARIES: 1. Write-Ahead Logging (WAL): A dirty page in RAM is NEVER flushed to disk until its corresponding WAL log record containing the before-and-after images is flushed (fsynced) to durable non-volatile storage. 2. Repeating History During Redo: Upon reboot after a crash, ARIES re-executes all logged operations forward up to the exact millisecond of the crash, reconstructing the exact physical state of the database—including updates made by uncommitted "loser" transactions that must later be rolled back! 3. Logging Changes During Undo via CLRs: When rolling back loser transactions, ARIES writes Compensation Log Records (CLRs). Each CLR contains an UndoNextLSN pointer. If the system crashes AGAIN during recovery, ARIES never re-undoes already compensated actions, preventing infinite crash loops.',
        vi: '1. 3 Bất Biến Nền Tảng Của ARIES: 1. Nhật Ký Ghi Trước (WAL): Một trang dữ liệu bẩn trong RAM TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP xả xuống đĩa cho tới khi bản ghi nhật ký WAL tương ứng đã được ghi và đồng bộ (fsync) an toàn vào đĩa. 2. Tái Hiện Lịch Sử Khi Redo (Repeating History): Khi khởi động lại sau sự cố, ARIES chạy lại toàn bộ các thao tác xuôi chiều thời gian cho tới đúng tích tắc sập nguồn, tái tạo lại nguyên trạng thái vật lý của cơ sở dữ liệu—bao gồm cả các thao tác của các giao dịch chưa commit ("giao dịch thua cuộc") để sau đó mới hoàn tác! 3. Ghi Nhật Ký Khi Hoàn Tác (CLRs): Khi hoàn tác các giao dịch thua cuộc, ARIES ghi các bản ghi đền bù CLR (Compensation Log Record) có chứa con trỏ UndoNextLSN. Nếu hệ thống LẠI BỊ SẬP TIẾP trong lúc đang phục hồi, ARIES sẽ không bao giờ hoàn tác lại những việc đã làm xong, chống vòng lặp sập nguồn vô tận.'
      },
      {
        en: '2. The 3 Sequential Phases of ARIES Recovery: 1. Analysis Pass: Scans forward from the most recent Checkpoint log record to the end of the WAL. It reconstructs the Active Transaction Table (ATT) to identify "loser" transactions that were in-flight during the crash, and reconstructs the Dirty Page Table (DPT) identifying the oldest un-flushed modifications (minimum RecLSN). 2. Redo Pass: Scans forward starting from the smallest RecLSN found in the DPT up to the crash point. For each log record, it checks the target page: if pageLSN >= logLSN, the modification is already present on disk and the Redo is skipped in 0ms (Idempotence)! Otherwise, it re-applies the change and updates pageLSN. 3. Undo Pass: Scans backward from the crash point, rolling back all actions of loser transactions in reverse order and writing CLRs until all uncommitted transactions are cleanly terminated.',
        vi: '2. 3 Pha Phục Hồi Tuần Tự Của ARIES: 1. Pha Phân Tích (Analysis Pass): Quét xuôi từ mốc Checkpoint gần nhất tới cuối file WAL. Nó dựng lại Bảng Giao Dịch Đang Chạy (ATT) để tìm các giao dịch "thua cuộc" chưa kịp commit lúc sập nguồn, và dựng lại Bảng Trang Bẩn (DPT) để tìm mốc sửa đổi cũ nhất chưa xả xuống đĩa (min RecLSN). 2. Pha Redo: Quét xuôi bắt đầu từ mốc RecLSN nhỏ nhất tới điểm sập nguồn. Với mỗi bản ghi, nó kiểm tra: nếu pageLSN >= logLSN thì dữ liệu đã nằm trên đĩa rồi và việc Redo được bỏ qua tức thì (Tính lũy đẳng - Idempotence)! Nếu chưa, nó chạy lại thao tác và cập nhật pageLSN. 3. Pha Undo: Quét ngược từ điểm sập nguồn trở về trước, lần lượt hoàn tác toàn bộ các thao tác của các giao dịch thua cuộc và ghi nhận các bản ghi CLR cho tới khi mọi giao dịch dang dở bị hủy bỏ an toàn.'
      },
      {
        en: '3. Physiological Logging & Non-Blocking Fuzzy Checkpoints: Pure physical logging (before/after byte images) requires huge log volumes, while pure logical logging (storing SQL text) cannot guarantee crash idempotency. ARIES utilizes Physiological Logging: Physical to a specific page (identifying page number), but Logical inside the page (specifying slot insertion, deletion, or delta). Furthermore, ARIES uses Fuzzy Checkpoints: taking a checkpoint does NOT block database traffic or flush all dirty buffer pool pages to disk. Instead, the background checkpoint worker simply snapshots the in-memory DPT and ATT into the WAL with sub-millisecond execution.',
        vi: '3. Nhật Ký Sinh Lý (Physiological Logging) & Checkpoint Mờ (Fuzzy Checkpoint): Ghi nhật ký thuần vật lý (ảnh byte trước và sau) ngốn quá nhiều đĩa, trong khi ghi thuần logic (lưu câu lệnh SQL) không bảo đảm được tính lũy đẳng khi sập nguồn. ARIES kết hợp cả hai thành Nhật Ký Sinh Lý: Vật lý ở cấp trang (chỉ rõ số trang), nhưng Logic bên trong trang (chỉ rõ chèn vào slot nào, tăng giảm bao nhiêu). Thêm vào đó, ARIES dùng Checkpoint Mờ (Fuzzy Checkpoint): việc tạo checkpoint KHÔNG HỀ chặn đứng ứng dụng hay ép xả toàn bộ RAM xuống đĩa. Tiến trình chỉ việc chụp nhanh danh sách các trang bẩn (DPT) và giao dịch đang chạy (ATT) rồi ghi một mốc nhỏ vào WAL chỉ mất dưới 1ms.'
      },
      {
        en: '4. Engine Architectural Divergence: Pure ARIES vs InnoDB vs PostgreSQL Redo-Only Model: Classical Mohan ARIES mandates an explicit Undo Pass where every unflushed loser transaction is reversed by traversing backward log pointers and generating CLRs. MySQL InnoDB adheres closely to this philosophy: it re-executes redo logs to repeat history, then activates rollback threads to undo uncommitted transactions using Undo Log segments in the rollback tablespace. In stark contrast, PostgreSQL avoids an ARIES Undo pass completely! Because PostgreSQL MVCC writes new tuple versions into heap tables, crash recovery only executes Redo to replay WAL. When Redo finishes, uncommitted transactions are marked ABORTED in the commit log (pg_xact); their orphaned dead tuples are later cleaned up lazily by background VACUUM, resulting in dramatically faster recovery times.',
        vi: '4. Sự Phân Hóa Kiến Trúc: ARIES Chuẩn vs InnoDB vs Mô Hình Redo-Only Của PostgreSQL: Giải thuật Mohan ARIES chuẩn mực bắt buộc phải có Pha Undo, nơi mọi giao dịch dở dang bị đảo ngược bằng cách đọc ngược con trỏ log và ghi nhận các CLR. MySQL InnoDB tuân thủ rất sát triết lý này: chạy redo log để tái hiện lịch sử, sau đó khởi chạy luồng rollback hoàn tác các transaction chưa commit thông qua các trang Undo Log. Ngược lại, PostgreSQL loại bỏ hoàn toàn Pha Undo của ARIES! Nhờ cơ chế MVCC ghi phiên bản mới trên heap, quá trình phục hồi sự cố của PostgreSQL chỉ cần chạy duy nhất Pha Redo để áp dụng các thay đổi WAL. Khi Redo kết thúc, các giao dịch dở dang được đánh dấu ABORTED trong pg_xact; các dòng chết bỏ hoang sau đó sẽ được tiến trình VACUUM quét dọn dần trong nền, giúp thời gian phục hồi sau sự cố của Postgres cực kỳ nhanh chóng.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Configuring excessively large WAL checkpoints (e.g., max_wal_size = 64GB) to optimize daytime write throughput. Following an unexpected server power trip, the database takes 40+ minutes to execute the Analysis and Redo passes, severely violating enterprise RTO (Recovery Time Objective) SLAs.',
        vi: 'Cấu hình khoảng cách Checkpoint quá lớn (như max_wal_size = 64GB) để tăng tốc độ ghi ban ngày. Khi máy chủ đột ngột mất điện, cơ sở dữ liệu mất hơn 40 phút chỉ để đọc và chạy lại hàng chục GB file WAL, vi phạm nghiêm trọng cam kết thời gian phục hồi RTO.'
      },
      {
        en: 'Crash-during-recovery vulnerability in naive storage implementations: if the database crashes while rolling back transactions during the Undo phase and does not emit Compensation Log Records (CLRs), the subsequent recovery attempt re-undoes the undo actions, causing data corruption or infinite crash loops.',
        vi: 'Lỗ hổng sập nguồn trong lúc đang phục hồi: nếu database bị mất điện tiếp khi đang chạy pha Undo mà không có các bản ghi đền bù CLR, lần khởi động kế tiếp sẽ hoàn tác ngược lại các thao tác hoàn tác trước đó, dẫn đến hỏng cấu trúc dữ liệu hoặc vòng lặp sập nguồn vô tận.'
      },
      {
        en: 'Premature WAL file archiving or deletion based on committed transaction IDs rather than the minimum RecLSN in the Dirty Page Table, causing crash recovery to abort with "WAL segment file not found" fatal errors.',
        vi: 'Xóa hoặc nén lưu trữ file WAL quá sớm dựa trên các giao dịch đã commit thay vì dựa trên mốc RecLSN nhỏ nhất của các trang bẩn trong RAM, khiến tiến trình phục hồi sau sự cố bị sập với lỗi nghiêm trọng không tìm thấy file đoạn WAL.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Cloud Datacenter Power Loss 42-Minute Recovery Outage & ARIES Checkpoint Optimization',
      vi: 'Sự Cố Mất Điện Trung Tâm Dữ Liệu Đình Trệ 42 Phút Phục Hồi & Tối Ưu Hóa ARIES Checkpoint'
    },
    businessContext: {
      en: 'A core banking payment settlement engine processes 28,000 real-time transaction writes/second under a strict SLA requiring RTO (Recovery Time Objective) < 15 seconds.',
      vi: 'Hệ thống quyết toán thanh toán ngân hàng cốt lõi xử lý 28,000 giao dịch thời gian thực mỗi giây với cam kết RTO (Thời gian phục hồi dịch vụ) bắt buộc phải dưới 15 giây.'
    },
    problemDescription: {
      en: 'An electrical transformer failure abruptly cut power to the primary database server. Upon server reboot, the database took 42.5 minutes to recover before it could accept incoming client connections, resulting in a nationwide payment outage and heavy regulatory penalties. Inspection of database recovery logs revealed that the DBA had set max_wal_size = 48GB and checkpoint_timeout = 60min to maximize throughput. When the crash struck, 38GB of un-checkpointed WAL had accumulated. The ARIES Analysis pass required 6 minutes to parse 38GB of logs; the Redo pass took 28 minutes to scan 16,000,000 disk pages; and the Undo pass spent 8.5 minutes rolling back 4,200 loser transactions that were in-flight during the power failure.',
      vi: 'Sự cố nổ biến áp điện đột ngột cắt nguồn máy chủ cơ sở dữ liệu chính. Khi máy chủ khởi động lại, database mất tới 42.5 phút để phục hồi xong và mở lại kết nối, làm tê liệt thanh toán trên toàn quốc và chịu án phạt tài chính nặng nề. Phân tích log phục hồi chỉ ra rằng DBA đã đặt max_wal_size = 48GB và checkpoint_timeout = 60 phút để tối đa hóa tốc độ ghi ban ngày. Khi mất điện, có tới 38GB file WAL chưa được chốt checkpoint. Pha Phân tích ARIES mất 6 phút chỉ để đọc 38GB log; pha Redo mất 28 phút để quét qua 16 triệu trang đĩa; và pha Undo mất 8.5 phút để hoàn tác 4,200 giao dịch thua cuộc đang dở dang lúc sập nguồn.'
    },
    whyNaiveFails: {
      en: 'Configuring synchronous checkpoints every 10 seconds without smooth background I/O pacing caused continuous disk fsync freezes during daytime operations, dropping transaction throughput by 62% and causing database client connection pool timeouts.',
      vi: 'Cấu hình checkpoint dày đặc mỗi 10 giây một lần mà không có cơ chế dàn đều I/O nền đã làm đơ toàn bộ hệ thống ban ngày do nghẽn lệnh fsync đĩa liên tục, làm sụt giảm 62% thông lượng và gây timeout hàng loạt kết nối.'
    },
    coreSolution: {
      en: '1. Re-architect ARIES Checkpoint ergonomics: set max_wal_size = 4GB, checkpoint_timeout = 5min, and configure checkpoint_completion_target = 0.9. This spreads dirty page flushes smoothly over 90% of the 5-minute interval via background I/O, guaranteeing that the WAL distance between the checkpoint and crash point never exceeds 2GB. 2. Tune the background page cleaner (bgwriter_lru_maxpages = 800, bgwriter_delay = 10ms) to ensure the minimum RecLSN stays closely anchored to the checkpoint horizon. 3. Ensure Compensation Log Records (CLRs) are logged to guarantee monotonic, non-repeating Undo execution.',
      vi: '1. Tái cấu trúc cơ chế ARIES Checkpoint: cấu hình max_wal_size = 4GB, checkpoint_timeout = 5 phút, và checkpoint_completion_target = 0.9. Thiết lập này dàn đều việc xả trang bẩn trong suốt 90% khoảng thời gian 5 phút bằng I/O chạy nền, bảo đảm dung lượng WAL giữa checkpoint và điểm sập nguồn không bao giờ vượt quá 2GB. 2. Tinh chỉnh tiến trình dọn dẹp trang ngầm (bgwriter_lru_maxpages = 800, bgwriter_delay = 10ms) để giữ mốc RecLSN nhỏ nhất luôn bám sát chân trời checkpoint. 3. Bảo đảm ghi nhận đầy đủ bản ghi đền bù CLR để pha Undo chạy một mạch không bao giờ bị lặp lại.'
    },
    productionCode: `// Production PostgreSQL / ARIES Fast-Recovery Configuration Profile
# File: postgresql.conf (Tuned for RTO < 10 seconds under 28,000 writes/sec)

# 1. Enforce frequent bounded checkpoints:
max_wal_size = 4GB
min_wal_size = 1GB
checkpoint_timeout = 5min

# 2. Smooth dirty page writes over 90% of checkpoint duration (prevents I/O spikes):
checkpoint_completion_target = 0.9
checkpoint_warning = 30s

# 3. Aggressive background dirty page writer keeps min(RecLSN) current:
bgwriter_delay = 10ms
bgwriter_lru_maxpages = 800
bgwriter_lru_multiplier = 3.0

# 4. Asynchronous commit for non-critical logging; strict WAL sync for transactions:
wal_level = replica
wal_buffers = 64MB
wal_writer_delay = 10ms
synchronous_commit = on

# Verification Query during runtime:
# SELECT checkpoints_timed, checkpoints_req, checkpoint_write_time, checkpoint_sync_time 
# FROM pg_stat_bgwriter;`,
    architectureImpact: {
      en: 'Post-crash database recovery duration collapsed from 42.5 minutes down to 4.2 seconds (600x recovery acceleration); Daytime write throughput remained at 100% capacity (zero I/O spikes); Full RTO < 5 seconds achieved with zero data loss (RPO = 0).',
      vi: 'Thời gian phục hồi database sau khi sập nguồn giảm ngoạn mục từ 42.5 phút xuống chỉ còn 4.2 giây (nhanh gấp 600 lần); Thông lượng ghi ban ngày duy trì ổn định 100% (không còn giật lag I/O); Đạt chuẩn RTO dưới 5 giây với mức độ mất mát dữ liệu bằng 0 (RPO = 0).'
    }
  },

  steps: [
    {
      id: 'analysis-pass',
      title: { en: '1. Analysis Pass: Reconstruct Memory Tables', vi: '1. Pha Phân tích: Tái tạo Bảng Trang Bẩn và Giao dịch Đang chạy' },
      phase: 'ANALYSIS_PASS',
      description: {
        en: 'The recovery manager locates the last Checkpoint in the WAL. It reads forward to the crash point, identifying all active transactions that never committed (loser transactions) and identifying all dirty pages that may not have reached disk.',
        vi: 'Trình phục hồi định vị mốc Checkpoint gần nhất trong WAL. Nó quét xuôi tới điểm sập nguồn, xác định toàn bộ các giao dịch đang chạy chưa commit (giao dịch thua cuộc) và lập danh sách toàn bộ các trang bẩn chưa xả xuống đĩa.'
      },
      diskIoBehavior: {
        en: 'Sequential read from checkpoint LSN to end of WAL.',
        vi: 'Đọc tuần tự từ mốc checkpoint tới cuối file WAL.'
      },
      javaCodeLineMatch: 'reconstructDirtyPageTableFromCheckpoint()'
    },
    {
      id: 'redo-pass',
      title: { en: '2. Redo Pass: Repeating History Forward', vi: '2. Pha Redo: Tái hiện lại toàn bộ lịch sử' },
      phase: 'REDO_PASS',
      description: {
        en: 'Starting from the smallest RecLSN in the Dirty Page Table, the engine scans forward, reapplying all logged operations (both committed and uncommitted) to bring tablespaces to the exact physical state at the millisecond of crash.',
        vi: 'Bắt đầu từ RecLSN nhỏ nhất trong Bảng Trang Bẩn, engine quét xuôi và nạp lại toàn bộ các thao tác đã ghi (kể cả của giao dịch chưa commit) để đưa toàn bộ tablespace về đúng trạng thái vật lý tại tích tắc sập nguồn.'
      },
      diskIoBehavior: {
        en: 'Reads WAL forward. Fetches pages where PageLSN < LogLSN and applies redo.',
        vi: 'Đọc WAL xuôi. Nạp các trang có PageLSN < LogLSN và áp dụng bản ghi redo.'
      },
      javaCodeLineMatch: 'repeatHistoryForward(minRecLSN)'
    },
    {
      id: 'undo-pass',
      title: { en: '3. Undo Pass: Rollback Loser Transactions with CLR', vi: '3. Pha Undo: Hoàn tác giao dịch thua cuộc với bản ghi bù trừ CLR' },
      phase: 'UNDO_PASS',
      description: {
        en: 'The engine scans backward through WAL, reversing all actions of loser transactions. For every reversed operation, it writes a Compensation Log Record (CLR) containing an UndoNextLSN pointer. If a crash occurs during Undo, CLRs prevent double-undoing.',
        vi: 'Engine quét ngược qua WAL, đảo ngược toàn bộ hành động của các giao dịch thua cuộc. Với mỗi thao tác hoàn tác, nó ghi một bản ghi bù trừ CLR chứa con trỏ UndoNextLSN. Nếu lại sập nguồn trong lúc này, CLR đảm bảo không bao giờ bị hoàn tác trùng lặp.'
      },
      diskIoBehavior: {
        en: 'Backward WAL scan; writes CLR records to WAL; repairs table pages.',
        vi: 'Quét ngược WAL; ghi bản ghi CLR vào WAL; sửa chữa các trang bảng.'
      },
      javaCodeLineMatch: 'rollbackLosersAndWriteCLR()'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Crash Recovery',
      implementationName: 'ARIES Redo/Undo with Checkpointer',
      keyMechanism: {
        en: 'Postgres uses a simplified ARIES variant: because MVCC leaves old row versions in place, the Undo pass does not need to physically rewrite table pages; uncommitted transactions are simply marked ABORTED in the commit status log (CLOG / pg_xact).',
        vi: 'PostgreSQL dùng biến thể ARIES tinh gọn: do MVCC giữ nguyên các phiên bản cũ trong bảng heap, pha Undo không cần sửa đổi trang bảng; các giao dịch dở dang chỉ cần đánh dấu ABORTED trong bảng CLOG.'
      },
      defaultTuningConfig: 'checkpoint_timeout = 5min, checkpoint_completion_target = 0.9',
      architectureNote: {
        en: 'Spread checkpoints over 90% of checkpoint_timeout to prevent massive I/O spikes.',
        vi: 'Trải đều việc xả trang checkpoint trong 90% thời gian chu kỳ để chống giật lag I/O.'
      }
    },
    {
      engine: 'MySQL InnoDB Crash Recovery',
      implementationName: 'InnoDB ARIES Redo Logs & Undo Tablespace',
      keyMechanism: {
        en: 'InnoDB strictly implements Mohan ARIES: full physical redo pass from checkpoint LSN, followed by logical undo pass rolling back uncommitted transactions using Undo Log records.',
        vi: 'InnoDB tuân thủ nghiêm ngặt giải thuật Mohan ARIES: pha Redo vật lý từ checkpoint LSN, tiếp nối bằng pha Undo logic hoàn tác các giao dịch dang dở bằng Undo Log.'
      },
      defaultTuningConfig: 'innodb_fast_shutdown = 1, innodb_force_recovery = 0',
      architectureNote: {
        en: 'Level 1 to 6 innodb_force_recovery allows rescuing corrupt tables on extreme storage failures.',
        vi: 'Các cấp độ từ 1 đến 6 của innodb_force_recovery cho phép cứu vãn dữ liệu khi hỏng hóc vật lý nặng.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Instance Recovery',
      implementationName: 'SMON Process & Fast-Start On-Demand Rollback',
      keyMechanism: {
        en: 'Oracle Instance Recovery is executed by the SMON background process in 2 distinct phases: (1) Roll Forward (Redo pass): reapplies all redo logs from the checkpoint SCN to reconstruct block state; (2) Immediate Database Open: Oracle opens the database for client queries BEFORE the Undo phase finishes! (3) Background Rollback (Undo pass): SMON rolls back uncommitted dead transactions asynchronously in the background. If a client query encounters an uncommitted block, it performs Fast-Start On-Demand Rollback on that block.',
        vi: 'Quá trình phục hồi Instance Recovery của Oracle được tiến trình ngầm SMON thực hiện qua các giai đoạn độc đáo: (1) Pha Roll Forward (Redo): nạp lại toàn bộ log từ mốc checkpoint SCN để khôi phục trạng thái block; (2) MỞ CƠ SỞ DỮ LIỆU NGAY LẬP TỨC: Oracle mở kết nối cho người dùng TRƯỚC KHI pha Undo hoàn tất! (3) Pha Rollback ngầm (Undo): SMON tự động hoàn tác các transaction dở dang chạy ngầm trong background. Nếu câu truy vấn của người dùng gặp phải block đang chờ rollback, engine sẽ kích hoạt cơ chế Fast-Start On-Demand Rollback cục bộ trên đúng block đó.'
      },
      defaultTuningConfig: "ALTER SYSTEM SET FAST_START_MTTR_TARGET = 300 SCOPE=BOTH; ALTER SYSTEM SET FAST_START_PARALLEL_ROLLBACK = 'HIGH';",
      architectureNote: {
        en: 'Opening the database immediately after the Redo pass slashes application Mean Time To Recover (MTTR) by 80-90% compared to classical ARIES engines.',
        vi: 'Việc mở CSDL ngay sau pha Redo giúp giảm thời gian phục hồi dịch vụ (MTTR) từ 80% đến 90% so với mô hình ARIES cổ điển buộc phải đợi hoàn tất toàn bộ pha Undo mới cho phép kết nối.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: '100% mathematical guarantee of atomicity and durability after unannounced hardware power outages.', vi: 'Bảo đảm toán học 100% tính nguyên tử và bền vững sau sự cố sập nguồn phần cứng đột ngột.' },
      { en: 'Idempotent: The recovery algorithm can crash and restart repeatedly without data corruption.', vi: 'Tính lũy quyền tuyệt đối: Tiến trình phục hồi có thể bị sập và chạy lại liên tục mà không gây lỗi dữ liệu.' }
    ],
    cons: [
      { en: 'Database is completely unavailable to client connections during Redo and Undo recovery phases.', vi: 'Cơ sở dữ liệu hoàn toàn không thể phục vụ kết nối của người dùng trong suốt quá trình phục hồi.' },
      { en: 'High memory requirement during Analysis Pass to hold the reconstructed Dirty Page Table.', vi: 'Đòi hỏi RAM lớn trong pha Phân tích để chứa toàn bộ Bảng Trang Bẩn tái tạo.' }
    ],
    writeAmplification: {
      en: 'Moderate: Checkpoint frequency balances recovery speed against regular transaction write throughput.',
      vi: 'Vừa phải: Tần suất Checkpoint giúp cân bằng giữa thời gian phục hồi và thông lượng ghi thông thường.'
    },
    recoveryGuarantee: {
      en: 'Zero data loss for any transaction committed prior to power crash.',
      vi: 'Tuyệt đối không mất mát dữ liệu cho bất kỳ giao dịch nào đã commit trước lúc sập nguồn.'
    }
  },

  javaCode: `package com.database.internals.durability;

import java.util.*;

/**
 * Pure Java 21 implementation of the ARIES 3-Pass Crash Recovery Algorithm.
 */
public class ARIESRecoveryManager {
    public record LogRecord(long lsn, long prevLsn, long txId, int pageId, String type, long undoNextLsn) {}

    private final Map<Integer, Long> dirtyPageTable = new HashMap<>(); // PageID -> RecLSN
    private final Map<Long, Long> activeTxTable = new HashMap<>();     // TxID -> LastLSN

    // Step 1: Analysis Pass - Reconstruct memory tables from checkpoint
    public void analysisPass(List<LogRecord> walLogs, long checkpointIndex) {
        for (int i = (int) checkpointIndex; i < walLogs.size(); i++) {
            LogRecord record = walLogs.get(i);
            activeTxTable.put(record.txId(), record.lsn());

            if ("COMMIT".equals(record.type()) || "ABORT".equals(record.type())) {
                activeTxTable.remove(record.txId());
            } else if ("UPDATE".equals(record.type())) {
                dirtyPageTable.putIfAbsent(record.pageId(), record.lsn());
            }
        }
    }

    // Step 2: Redo Pass - Repeat history forward from minimum RecLSN
    public void redoPass(List<LogRecord> walLogs, long minRecLsn) {
        for (LogRecord record : walLogs) {
            if (record.lsn() >= minRecLsn && "UPDATE".equals(record.type())) {
                // Reapply changes to page in buffer pool
                System.out.println("REDO: Reapplying LSN " + record.lsn() + " to Page #" + record.pageId());
            }
        }
    }

    // Step 3: Undo Pass - Rollback loser transactions with CLR
    public void undoPass(List<LogRecord> walLogs, Set<Long> loserTxIds) {
        // PriorityQueue of LSNs to undo, ordered descending
        PriorityQueue<Long> toUndo = new PriorityQueue<>(Collections.reverseOrder());
        for (Long txId : loserTxIds) {
            Long lastLsn = activeTxTable.get(txId);
            if (lastLsn != null) toUndo.add(lastLsn);
        }

        while (!toUndo.isEmpty()) {
            long lsnToUndo = toUndo.poll();
            LogRecord record = findRecordByLsn(walLogs, lsnToUndo);
            if (record != null) {
                System.out.println("UNDO: Rolling back LSN " + record.lsn() + " for Tx #" + record.txId());
                // Write Compensation Log Record (CLR) to prevent repeating this undo
                if (record.prevLsn() > 0) {
                    toUndo.add(record.prevLsn());
                }
            }
        }
    }

    private LogRecord findRecordByLsn(List<LogRecord> logs, long lsn) {
        return logs.stream().filter(l -> l.lsn() == lsn).findFirst().orElse(null);
    }
}`
};
