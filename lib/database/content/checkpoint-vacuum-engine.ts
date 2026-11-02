import type { DatabaseTopic } from '../types';

export const checkpointVacuumEngine: DatabaseTopic = {
  id: 'checkpoint-vacuum-engine',
  category: 'durability-wal',
  name: 'Checkpointing, Background Writer & Vacuum Engine',
  tagline: {
    en: 'The database background engines: Dirty Page Flushing, Checkpoint Pacing, Full Page Writes vs Doublewrite Buffer, and PostgreSQL VACUUM vs MySQL InnoDB Purge.',
    vi: 'Các bộ máy tiến trình chạy ngầm: Xả trang bẩn (Dirty Page Flush), Điều tiết Checkpoint, Chống rách trang (FPW vs Doublewrite) và Dọn rác (PostgreSQL VACUUM vs InnoDB Purge).'
  },
  difficulty: 3,
  order: 18,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'Transactions modify pages in RAM, leaving them "dirty". If a checkpoint flushes 100,000 dirty pages (1.6GB) synchronously in one burst, storage IOPS saturate, user transactions freeze (I/O checkpoint stall), and recovery time explodes. Furthermore, dead tuple accumulation and the 32-bit transaction ID wraparound threaten catastrophic database freeze if unmanaged.',
      vi: 'Các giao dịch sửa đổi các trang trong RAM, biến chúng thành "trang bẩn". Nếu tiến trình Checkpoint xả đồng bộ 100.000 trang bẩn (1.6GB) dồn cục trong một đợt duy nhất, băng thông IOPS của ổ cứng sẽ bị nghẽn cứng, các giao dịch người dùng bị đứng hình (Checkpoint Stall), và thời gian phục hồi sau sự cố tăng vọt. Thêm vào đó, sự tích tụ dòng chết và nguy cơ tràn vòng số hiệu TxID 32-bit có thể khiến toàn bộ CSDL bị ngừng hoạt động vĩnh viễn.'
    },
    hardwareConstraint: {
      en: 'Storage controllers can only absorb limited sustained write bandwidth without latency spikes. Checkpoint engines must smoothly pace disk writes over a continuous time window, while protecting 8KB and 16KB data pages against torn-page corruption caused by mid-write hardware power cuts.',
      vi: 'Bộ điều khiển ổ cứng chỉ có thể tiếp nhận một lượng băng thông ghi duy trì có giới hạn trước khi độ trễ tăng vọt. Bộ máy Checkpoint bắt buộc phải dàn trải mượt mà lưu lượng ghi đĩa trong một khoảng thời gian dài, đồng thời bảo vệ các trang 8KB và 16KB khỏi nguy cơ bị rách trang (torn page) khi mất điện đột ngột.'
    },
    fundamentalSolution: {
      en: 'Modern engines decouple dirty page management across dedicated background workers: (1) Checkpointer: executes periodic checkpoints with spread pacing (checkpoint_completion_target = 0.9); (2) Background Writer (Postgres) / Page Cleaner (InnoDB): continuously flushes dirty pages in advance so user query backends always find clean frames; (3) Torn Page Protection: PostgreSQL Full Page Writes (FPW) vs InnoDB Doublewrite Buffer; and (4) Garbage Collection: PostgreSQL Autovacuum & TXID Freeze vs MySQL InnoDB Purge Threads.',
      vi: 'Các CSDL hiện đại phân tách việc quản lý trang bẩn cho các tiến trình chạy ngầm chuyên trách: (1) Checkpointer: định kỳ chốt checkpoint với cơ chế dàn đều thời gian (checkpoint_completion_target = 0.9); (2) Background Writer (Postgres) / Page Cleaner (InnoDB): liên tục xả trước các trang bẩn để các kết nối người dùng luôn có sẵn trang sạch trong RAM; (3) Chống Rách Trang: Full Page Writes (FPW) trong Postgres vs Bộ đệm Ghi đôi Doublewrite trong InnoDB; và (4) Thu Gom Rác: PostgreSQL Autovacuum & Đóng băng TxID vs MySQL InnoDB Purge Threads.'
    },
    math: {
      formula: 'T_{\\text{checkpoint\\_write}} = \\text{checkpoint\\_timeout} \\times \\text{checkpoint\\_completion\\_target}, \\quad \\text{Target} = 0.9',
      description: {
        en: 'Checkpoint pacing spreads the physical flushing of dirty buffer pages across 90% of the checkpoint interval, eliminating devastating I/O spikes and maintaining smooth daytime transaction throughput.',
        vi: 'Cơ chế điều tiết Checkpoint Pacing dàn đều việc xả các trang đĩa bẩn trong suốt 90% khoảng thời gian chu kỳ checkpoint, triệt tiêu các đợt bão I/O đĩa đột biến và duy trì thông lượng giao dịch mượt mà suốt cả ngày.'
      },
      timeComplexity: 'O(Dirty_Pages) paced sequential disk writes; Background Writer: continuous O(1) page cleaner sweep',
      spaceComplexity: 'Doublewrite Buffer / FPW WAL overhead: up to 2x write volume during the first modification after checkpoint',
      ioCostFormula: 'Write Throughput = (Dirty Pages × Page Size) / (checkpoint_timeout × completion_target)'
    }
  },

  pageLayout: {
    title: {
      en: 'PostgreSQL vs MySQL InnoDB Background Engine Architecture',
      vi: 'Kiến trúc Bộ máy Tiến trình Nền: PostgreSQL vs MySQL InnoDB'
    },
    description: {
      en: 'Detailed architectural comparison of Checkpointer, Background Writer, Torn-Page protection, and Garbage Collection.',
      vi: 'So sánh kiến trúc chi tiết giữa Checkpointer, Background Writer, Cơ chế chống rách trang và Thu gom rác giữa hai hệ quản trị.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| MECHANISM            | POSTGRESQL ARCHITECTURE      | MYSQL INNODB ARCHITECTURE |
+--------------------------------------------------------------------------+
| Checkpoint Trigger   | max_wal_size / timeout       | innodb_max_dirty_pages_pct|
| Pacing Mechanism     | checkpoint_completion_target | Adaptive Flushing Engine  |
| Clean Page Worker    | Background Writer (bgwriter) | Page Cleaner Threads      |
| Torn Page Protection | Full Page Writes (FPW to WAL)| Doublewrite Buffer (dblwr)|
| Garbage Collection   | Autovacuum Workers           | InnoDB Purge Threads      |
| Catastrophic Threat  | 2-Billion TxID Wraparound    | History List Length (HLL) |
+--------------------------------------------------------------------------+
| POSTGRESQL CHECKPOINT PACING TIMELINE (checkpoint_timeout = 5 min):       |
|                                                                          |
|  [ CHECKPOINT START ] --------------------------------> [ 4.5 MIN (90%) ] -> [ 5.0 MIN ]
|           |                                                    |                 |
|           +-- Dirty pages smoothly flushed at 12MB/sec --------+                 |
|           |   (Spreads I/O across 270 seconds; NO SPIKES!)     |-- fsync() sync -+
+--------------------------------------------------------------------------+
| TORN PAGE PROTECTION COMPARISON:                                         |
|  - PostgreSQL: On first page edit after checkpoint, full 8KB is logged   |
|    into WAL stream (Full Page Write). Restored from WAL on crash recovery|
|  - MySQL InnoDB: Flushes 16KB dirty page to sequential 2MB Doublewrite   |
|    Buffer on disk FIRST, then flushes to real tablespace. Safe on crash! |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'checkpoint_completion_target', size: 'Float (0.0 - 1.0)', description: { en: 'Fraction of checkpoint_timeout over which dirty page flushes are spread', vi: 'Tỷ lệ thời gian checkpoint được dùng để dàn đều việc xả các trang đĩa bẩn' } },
      { name: 'FrozenTransactionId', size: 'Fixed Value (2)', description: { en: 'PostgreSQL reserved TxID representing a transaction older than all live transactions', vi: 'Mã TxID đặc biệt (2) trong Postgres đại diện cho giao dịch cũ hơn mọi giao dịch đang sống' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Behind every high-performance database is a team of unsung background workers operating continuously in kernel and shared memory. While user queries execute SELECT and UPDATE statements, background processes manage the physical realities of durable hardware: flushing dirty memory frames to persistent NVMe blocks without causing I/O spikes, protecting against torn-page hardware write failures, and perpetually vacuuming or purging historical MVCC debris. Understanding how PostgreSQL (Checkpointer, bgwriter, Autovacuum) and MySQL InnoDB (Page Cleaners, Doublewrite Buffer, Purge Threads) solve these challenges is essential for database operations.',
      vi: 'Đằng sau mỗi hệ quản trị CSDL hiệu năng cao là một đội ngũ các tiến trình chạy ngầm thầm lặng liên tục hoạt động trong nhân và bộ nhớ chia sẻ. Trong lúc các truy vấn của người dùng thực thi các lệnh SELECT và UPDATE, các tiến trình ngầm phải gánh vác các bài toán vật lý của phần cứng lưu trữ: xả các khung nhớ bẩn xuống các khối ổ đĩa NVMe mà không làm tắc nghẽn I/O, bảo vệ dữ liệu khỏi hiện tượng rách trang khi mất điện, và liên tục dọn dẹp các mảnh vụn MVCC lịch sử. Hiểu sâu cách thức PostgreSQL (Checkpointer, bgwriter, Autovacuum) và MySQL InnoDB (Page Cleaners, Doublewrite Buffer, Purge Threads) giải quyết các bài toán này là kiến thức cốt lõi của kỹ sư cơ sở dữ liệu.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Checkpoint Pacing & The Completion Target: In early databases, when a Checkpoint was triggered, the engine halted or saturated disk I/O by dumping all dirty buffer pages to physical disk simultaneously, causing catastrophic "checkpoint spikes" where user queries timed out for 10-30 seconds. Modern engines implement Checkpoint Pacing: in PostgreSQL, checkpoint_completion_target (recommended 0.9) instructs the Checkpointer to calculate the total dirty page count and spread the physical write I/O smoothly over 90% of the checkpoint_timeout interval (e.g., across 4.5 minutes of a 5-minute timeout). MySQL InnoDB uses Adaptive Flushing, dynamically measuring redo log generation rates to throttle page flush speeds.',
        vi: '1. Điều Tiết Checkpoint (Checkpoint Pacing & Completion Target): Trong các CSDL thuở sơ khai, khi một Checkpoint được kích hoạt, engine xả ồ ạt toàn bộ các trang bẩn trong RAM xuống đĩa cùng một lúc, gây ra hiện tượng "bão Checkpoint" làm nghẽn toàn bộ I/O và khiến ứng dụng bị đơ suốt 10-30 giây. Các hệ thống hiện đại áp dụng cơ chế Điều Tiết Checkpoint: trong PostgreSQL, thông số checkpoint_completion_target (khuyến nghị 0.9) chỉ đạo Checkpointer tính toán số trang bẩn và dàn trải mượt mà lưu lượng ghi đĩa trong suốt 90% khoảng thời gian checkpoint_timeout (ví dụ: chia đều trong 4.5 phút của chu kỳ 5 phút). MySQL InnoDB sử dụng cơ chế Xả Thích Ứng (Adaptive Flushing), liên tục đo tốc độ sinh redo log để điều tiết tốc độ xả trang.'
      },
      {
        en: '2. Checkpointer vs Background Writer (bgwriter) in PostgreSQL: Backend client processes should NEVER have to write dirty pages to disk when they need a free buffer frame; writing a dirty page to disk takes milliseconds, destroying query response time! PostgreSQL decouples this with two separate workers: (1) Checkpointer: runs on a timer or WAL volume, pacing dirty page flushes to move the Redo recovery start point forward. (2) Background Writer (bgwriter): continuously scans the Buffer Pool clock sweep in small batches (bgwriter_lru_maxpages), proactively flushing dirty pages that are likely to be evicted soon. As a result, incoming backend queries almost always find clean frames ready for immediate allocation.',
        vi: '2. Checkpointer vs Background Writer (bgwriter) Trong PostgreSQL: Các tiến trình kết nối của người dùng TUYỆT ĐỐI KHÔNG BAO GIỜ phải tự mình xả trang bẩn xuống đĩa khi cần tìm một khung nhớ trống; việc ghi đĩa ngẫu nhiên tốn hàng mili-giây sẽ bóp chết tốc độ truy vấn! PostgreSQL phân chia nhiệm vụ cho hai tiến trình độc lập: (1) Checkpointer: chạy theo chu kỳ thời gian hoặc dung lượng WAL, xả các trang bẩn một cách có kế hoạch để đẩy mốc phục hồi Redo tiến lên phía trước. (2) Background Writer (bgwriter): liên tục quét nhẹ vòng xoay Buffer Pool theo từng mẻ nhỏ, chủ động xả trước các trang bẩn sắp sửa bị giải phóng. Nhờ đó, các câu lệnh của người dùng khi cần trang mới luôn tìm thấy ngay các khung nhớ sạch mà không phải chờ ghi đĩa.'
      },
      {
        en: '3. Torn Page Protection: PostgreSQL Full Page Writes vs InnoDB Doublewrite Buffer: OS filesystems typically write in 4KB blocks, while databases use 8KB (PostgreSQL) or 16KB (InnoDB) pages. If power trips while writing an 8KB page, only the first 4KB may reach disk (a Torn Page). The page checksum fails and data is corrupted. How do engines prevent this? (A) PostgreSQL Full Page Writes (FPW): On the first mutation to any page following a checkpoint, PostgreSQL writes an entire 8KB raw copy of that page into the WAL stream. If a torn page occurs after a crash, recovery restores the whole 8KB page from WAL before reapplying deltas. (B) MySQL InnoDB Doublewrite Buffer: InnoDB writes dirty 16KB pages to a contiguous 2MB sequential disk area called the Doublewrite Buffer FIRST, calls fsync(), and only then writes pages to their real tablespaces. If a crash tears a page, InnoDB restores the pristine copy from the Doublewrite buffer.',
        vi: '3. Chống Rách Trang: Full Page Writes Trong Postgres vs Doublewrite Buffer Trong InnoDB: Hệ điều hành thường ghi đĩa theo các khối 4KB, trong khi CSDL dùng trang 8KB (PostgreSQL) hoặc 16KB (InnoDB). Nếu mất điện giữa chừng khi đang ghi một trang 8KB, có thể chỉ 4KB đầu chạm được vào phiến đĩa (hiện tượng Rách Trang - Torn Page). Mã checksum bị lỗi và trang hỏng vĩnh viễn. Hai engine giải quyết như sau: (A) PostgreSQL Full Page Writes (FPW): Ở lần sửa đổi đầu tiên của bất kỳ trang nào sau mỗi checkpoint, Postgres ghi nguyên bản sao 8KB của trang đó vào dòng dữ liệu WAL. Khi sập nguồn, quá trình phục hồi lấy bản sao 8KB từ WAL đè lên trang hỏng trước khi chạy Redo. (B) MySQL InnoDB Doublewrite Buffer: InnoDB ghi các trang 16KB bẩn vào một vùng đĩa tuần tự 2MB gọi là Doublewrite Buffer TRƯỚC, gọi lệnh fsync(), rồi sau đó mới xả trang về đúng vị trí file tablespace thật. Nếu có rách trang, InnoDB lấy lại trang nguyên vẹn từ Doublewrite buffer.'
      },
      {
        en: '4. The Garbage Collection Divide: PostgreSQL VACUUM & TXID Freeze vs MySQL InnoDB Purge: (A) PostgreSQL VACUUM & 2-Billion Wraparound: Because Postgres updates leave old tuple versions in the heap table, background Autovacuum scans tables to remove dead tuples and update the Free Space Map. Crucially, TxIDs are 32-bit unsigned integers modulo 2^32 (4.2 billion). Due to modulo arithmetic, after 2 billion transactions, historical numbers appear to be in the FUTURE! If old xmins are not "frozen" to FrozenTransactionId (2) via aggressive VACUUM FREEZE, historical data vanishes. PostgreSQL will forcibly enter read-only mode to prevent wraparound corruption! (B) MySQL InnoDB Purge Threads: InnoDB updates clustered index records in-place and writes deltas to Undo Tablespaces. Dedicated Purge Threads continuously delete undo log pages and clean secondary index delete markers once all active Read Views have passed them, avoiding heap table bloat entirely.',
        vi: '4. Sự Phân Hóa Thu Gom Rác: PostgreSQL VACUUM & Đóng Băng TxID vs MySQL InnoDB Purge: (A) PostgreSQL VACUUM & Thảm Họa Tràn Vòng TxID 2 Tỷ: Do Postgres lưu phiên bản cũ ngay trong bảng heap, tiến trình ngầm Autovacuum liên tục quét bảng để dọn dòng chết và cập nhật bản đồ Free Space Map. Đặc biệt, mã TxID là số nguyên 32-bit xoay vòng sau 4.2 tỷ số. Do phép toán modulo, sau 2 tỷ transaction, các số TxID trong quá khứ sẽ đột ngột bị hiểu là nằm ở TƯƠNG LAI! Nếu các xmin cũ không được đóng băng thành FrozenTransactionId (2) bằng tiến trình VACUUM FREEZE, toàn bộ dữ liệu lịch sử sẽ biến mất. Postgres sẽ tự động khóa cứng database về chế độ Read-Only để chống hỏng dữ liệu! (B) MySQL InnoDB Purge Threads: InnoDB sửa dòng trực tiếp trên chỉ mục clustered và ghi delta vào Undo Tablespace. Các luồng Purge Thread chuyên trách liên tục xóa các trang Undo Log cũ ngay khi không còn Read View nào cần đến, triệt tiêu hoàn toàn rác dòng chết trong bảng chính.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Setting checkpoint_completion_target = 0.5 (or default legacy 0.1): Forces the Checkpointer to dump all dirty pages during the first 10-50% of the checkpoint interval, creating massive disk write IOPS saturation and daytime query lag spikes.',
        vi: 'Để giá trị checkpoint_completion_target thấp (như 0.5 hoặc mặc định cũ 0.1): Ép Checkpointer phải xả toàn bộ trang bẩn chỉ trong 10-50% thời gian đầu của chu kỳ, gây nghẽn IOPS đĩa trầm trọng và làm giật lag các câu truy vấn ban ngày.'
      },
      {
        en: 'Disabling Autovacuum to "improve write throughput": Highly updated tables accumulate millions of dead tuples, table bloat expands tables by 10x, queries slow to a crawl, and the database eventually halts abruptly with "FATAL: database is not accepting commands to avoid wraparound data loss".',
        vi: 'Tắt Autovacuum để "tăng tốc độ ghi": Các bảng cập nhật nhiều sẽ tích tụ hàng triệu dòng chết, dung lượng bảng phình to gấp 10 lần, truy vấn chậm như rùa bò, và cuối cùng hệ thống bị sập nguồn đột ngột với thông báo lỗi nghiêm trọng buộc dừng hoạt động để chống tràn vòng TxID.'
      },
      {
        en: 'Long-running transactions holding the History List Length (HLL) in MySQL InnoDB: An abandoned transaction left open overnight prevents InnoDB Purge Threads from freeing undo logs. Undo tablespaces expand to fill the entire physical disk, triggering emergency outages.',
        vi: 'Giao dịch chạy dài làm kẹt hàng đợi History List Length (HLL) trong MySQL InnoDB: Một kết nối bị bỏ quên qua đêm cấm các Purge Thread dọn dẹp Undo Log. Các file undo tablespace sẽ tự động phình to cho tới khi làm đầy 100% dung lượng đĩa cứng, làm sập toàn bộ máy chủ.'
      }
    ]
  },

  steps: [
    {
      id: 'checkpoint-pace',
      title: { en: 'Checkpoint Invocation & Paced Dirty Page Flush', vi: 'Kích hoạt Checkpoint & Dàn đều Xả Trang Bẩn' },
      phase: 'Flush Phase',
      description: {
        en: 'Checkpointer calculates dirty page count and spreads physical NVMe writes across 90% of checkpoint duration.',
        vi: 'Checkpointer tính toán số trang bẩn và dàn trải việc ghi đĩa NVMe trong suốt 90% thời gian chu kỳ.'
      },
      diskIoBehavior: { en: 'Smooth throttled sequential writes (e.g. 15MB/sec); zero I/O spikes.', vi: 'Ghi tuần tự được điều tiết mượt mà (khoảng 15MB/giây); không phát sinh bão I/O.' },
      javaCodeLineMatch: 'checkpointManager.paceDirtyPageFlushes(completionTarget);'
    },
    {
      id: 'torn-page-guard',
      title: { en: 'Torn Page Protection (FPW / Doublewrite)', vi: 'Bảo vệ Chống Rách Trang (FPW / Doublewrite)' },
      phase: 'Durability Guard Phase',
      description: {
        en: 'Write pristine full page image to WAL (Postgres) or Doublewrite buffer (InnoDB) before tablespace mutation.',
        vi: 'Ghi bản sao nguyên vẹn của trang vào WAL hoặc Doublewrite buffer trước khi ghi vào tablespace.'
      },
      diskIoBehavior: { en: 'Sequential append write to WAL or doublewrite disk blocks.', vi: 'Ghi nối đuôi tuần tự vào file WAL hoặc các block doublewrite.' },
      javaCodeLineMatch: 'tornPageGuard.recordFullPageImage(pageId, pageBytes);'
    },
    {
      id: 'vacuum-freeze',
      title: { en: 'Garbage Collection & TxID Wraparound Freeze', vi: 'Thu gom Rác & Đóng băng Vòng số TxID' },
      phase: 'Cleanup Phase',
      description: {
        en: 'Autovacuum scans heap pages, prunes dead line pointers, and freezes old xmins to FrozenTransactionId (2).',
        vi: 'Autovacuum quét các trang heap, dọn dẹp con trỏ dòng chết và đóng băng xmin cũ về FrozenTransactionId (2).'
      },
      diskIoBehavior: { en: 'Low-priority background reads/writes throttled by vacuum_cost_limit.', vi: 'Đọc/ghi chạy nền ưu tiên thấp được giới hạn bởi vacuum_cost_limit.' },
      javaCodeLineMatch: 'autovacuumEngine.cleanDeadTuplesAndFreeze(table);'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Checkpoint & Vacuum Subsystem',
      implementationName: 'Checkpointer, bgwriter & Autovacuum Multi-Worker',
      keyMechanism: {
        en: 'Spreads checkpoints via checkpoint_completion_target = 0.9. Protects against torn pages via Full Page Writes (wal_log_hints = on). Autovacuum workers freeze TxIDs to prevent the 2-billion wraparound.',
        vi: 'Dàn đều checkpoint qua checkpoint_completion_target = 0.9. Chống rách trang bằng Full Page Writes. Các worker Autovacuum đóng băng TxID để chống tràn số 2 tỷ.'
      },
      defaultTuningConfig: 'checkpoint_timeout = 15min, max_wal_size = 16GB, checkpoint_completion_target = 0.9, autovacuum_max_workers = 4',
      architectureNote: {
        en: 'Increasing max_wal_size from default 1GB to 16GB reduces checkpoint frequency from once every 2 minutes to once every 15 minutes, cutting write amplification and boosting write TPS by 300%.',
        vi: 'Tăng max_wal_size từ 1GB lên 16GB giảm tần suất checkpoint từ 2 phút/lần xuống 15 phút/lần, giảm độ khuếch đại ghi và tăng gấp 3 lần thông lượng ghi TPS.'
      }
    },
    {
      engine: 'MySQL InnoDB Flushing & Purge Subsystem',
      implementationName: 'Page Cleaner, Doublewrite Buffer & Dedicated Purge Threads',
      keyMechanism: {
        en: 'InnoDB uses Page Cleaners with Adaptive Flushing. Writes all dirty pages to the Doublewrite Buffer file before writing to .ibd tablespaces. Purge threads continuously clean undo log history.',
        vi: 'InnoDB dùng Page Cleaner với thuật toán Adaptive Flushing. Ghi toàn bộ trang bẩn vào Doublewrite Buffer trước khi ghi ra file .ibd. Luồng Purge liên tục dọn dẹp lịch sử Undo.'
      },
      defaultTuningConfig: 'innodb_page_cleaners = 4, innodb_purge_threads = 4, innodb_doublewrite = 1',
      architectureNote: {
        en: 'On enterprise NVMe SSDs with atomic write capabilities (like specialized Flash arrays or ZFS), innodb_doublewrite can be safely disabled to eliminate double-write overhead.',
        vi: 'Trên các dòng SSD NVMe doanh nghiệp hỗ trợ ghi nguyên tử phần cứng, có thể tắt innodb_doublewrite để tăng gấp đôi thông lượng ghi đĩa mà vẫn an toàn.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Checkpoint & Space Management',
      implementationName: 'CKPT, DBWR Processes & Automatic Undo Management (AUM)',
      keyMechanism: {
        en: 'The CKPT (Checkpoint) process coordinates with DBWR (Database Writer) to perform continuous incremental checkpointing governed by FAST_START_MTTR_TARGET. Expired undo blocks are automatically reclaimed without needing table-level VACUUM garbage collection.',
        vi: 'Tiến trình CKPT (Checkpoint) phối hợp cùng DBWR (Database Writer) thực hiện checkpoint gia tăng liên tục được điều khiển bởi chỉ số FAST_START_MTTR_TARGET. Các block undo đã hết hạn được tự động tái sử dụng mà không cần cơ chế thu gom rác VACUUM trên bảng dữ liệu.'
      },
      defaultTuningConfig: "ALTER SYSTEM SET FAST_START_MTTR_TARGET = 300 SCOPE=BOTH; ALTER SYSTEM SET UNDO_RETENTION = 3600;",
      architectureNote: {
        en: 'Oracle uses Automatic Segment Space Management (ASSM) with bitmapped free-space tracking instead of freelists, avoiding table bloat entirely.',
        vi: 'Oracle sử dụng Quản lý không gian tự động ASSM với bản đồ bitmap quản lý khoảng trống thay cho danh sách freelist truyền thống, loại bỏ hoàn toàn nguy cơ phình to dung lượng bảng (table bloat).'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Checkpoint pacing completely eliminates daytime I/O freezes and stabilizes transactional latencies.', vi: 'Điều tiết checkpoint triệt tiêu hoàn toàn hiện tượng đứng hình I/O và ổn định độ trễ giao dịch ban ngày.' },
      { en: 'Automated background garbage collection keeps tables and indexes defragmented without scheduled offline downtime.', vi: 'Thu gom rác tự động chạy nền giữ cho bảng và chỉ mục không bị phân mảnh mà không cần dừng hệ thống.' }
    ],
    cons: [
      { en: 'Full Page Writes and Doublewrite Buffering double physical disk write throughput immediately following checkpoints.', vi: 'Cơ chế FPW và Doublewrite làm tăng gấp đôi lượng ghi đĩa vật lý ngay sau các mốc checkpoint.' },
      { en: 'Autovacuum cost limits can fall behind high-volume ingestion, requiring manual tuning of scale factors.', vi: 'Giới hạn chi phí của Autovacuum có thể bị tụt lại phía sau các luồng nạp dữ liệu lớn nếu không tinh chỉnh.' }
    ],
    writeAmplification: {
      en: 'High: FPW / Doublewrite creates 1.5x-2.0x write amplification on physical storage to ensure 100% crash idempotency.',
      vi: 'Cao: Cơ chế FPW / Doublewrite tạo độ khuếch đại ghi từ 1.5x đến 2.0x trên ổ cứng để bảo đảm tính lũy quyền khi phục hồi.'
    },
    recoveryGuarantee: {
      en: 'Pristine page images in WAL or Doublewrite guarantee recovery from torn pages even during catastrophic power outages.',
      vi: 'Bản sao trang nguyên vẹn trong WAL hoặc Doublewrite bảo đảm phục hồi an toàn khỏi rách trang kể cả khi sập nguồn đột ngột.'
    }
  },

  springBootCode: `package com.enterprise.database.checkpoint;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Enterprise Production Health Check:
 * Monitoring PostgreSQL Transaction ID Wraparound Horizon and Dead Tuple Bloat.
 */
@Component
public class DatabaseHealthMonitoringRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthMonitoringRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // 1. Monitor PostgreSQL 2-Billion Transaction ID Wraparound Horizon
        // If remaining transactions < 10,000,000, IMMEDIATE ACTION IS REQUIRED!
        String txidSql = """
            SELECT 
                datname, 
                age(datfrozenxid) AS xid_age, 
                (2147483648 - age(datfrozenxid)) AS tx_until_wraparound_shutdown
            FROM pg_database
            WHERE datallowconn = true
            ORDER BY age(datfrozenxid) DESC
            LIMIT 1;
        """;

        jdbcTemplate.query(txidSql, (rs) -> {
            long age = rs.getLong("xid_age");
            long remaining = rs.getLong("tx_until_wraparound_shutdown");
            System.out.printf("[TXID Wraparound Monitor] DB: %s, Age: %,d, Remaining until freeze: %,d%n",
                rs.getString("datname"), age, remaining);
            if (remaining < 20_000_000) {
                System.err.println("CRITICAL ALERT: Database approaching 2-Billion TxID Wraparound!");
            }
        });
    }
}`,

  sqlQueries: `-- 1. Monitor Checkpoint Pacing and I/O Write Statistics in PostgreSQL
SELECT 
    checkpoints_timed, 
    checkpoints_req, 
    checkpoint_write_time, 
    checkpoint_sync_time, 
    buffers_checkpoint, 
    buffers_clean, 
    buffers_backend 
FROM pg_stat_bgwriter;

-- 2. Detect Dead Tuple Accumulation & Autovacuum Status
SELECT 
    schemaname, 
    relname AS table_name, 
    n_live_tup, 
    n_dead_tup, 
    round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 2) AS dead_tuple_pct,
    last_vacuum, 
    last_autovacuum,
    autovacuum_count
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC;

-- 3. Production PostgreSQL Checkpoint Tuning Configuration (postgresql.conf)
-- max_wal_size = 16GB
-- min_wal_size = 2GB
-- checkpoint_timeout = 15min
-- checkpoint_completion_target = 0.9  -- Smooth dirty page flushing over 90% of 15min!
-- bgwriter_delay = 10ms
-- bgwriter_lru_maxpages = 800`,

  productionProblemCase: {
    title: {
      en: 'The Midday 35-Second Checkpoint Freeze: Saturated NVMe IOPS on Core Settlement Database',
      vi: 'Cơn Đơ 35 Giây Giữa Trưa: Nghẽn IOPS Ổ Cứng Do Bão Checkpoint Trên CSDL Quyết Toán'
    },
    businessContext: {
      en: 'A fintech payment gateway processes 35,000 transaction writes/second. The database runs on PostgreSQL 15 on an enterprise cloud instance with 64 vCPUs and 256GB RAM.',
      vi: 'Cổng thanh toán tài chính xử lý 35.000 giao dịch ghi mỗi giây. CSDL chạy PostgreSQL 15 trên máy chủ đám mây doanh nghiệp với 64 vCPU và 256GB RAM.'
    },
    problemDescription: {
      en: 'Every 5 minutes like clockwork, all incoming API requests experienced an excruciating 25-35 second freeze where response times spiked from 3ms to over 30,000ms, triggering client gateway timeouts and payment retry storms. Inspection of cloud storage metrics showed disk write bandwidth spiking violently to 2.4 GB/sec for 30 seconds, saturating the storage bus, followed by near-zero write activity for the next 4.5 minutes. Querying pg_stat_bgwriter revealed that checkpoints_req was high and checkpoint_completion_target was set to 0.1 (the legacy default)! Because completion_target was 0.1, the Checkpointer was dumping 85,000 dirty buffer pages into the storage controller in a single 15-second blast, completely starving user transaction fsync() calls.',
      vi: 'Cứ đều đặn mỗi 5 phút một lần, toàn bộ các yêu cầu API gửi đến đều bị đứng hình tê liệt từ 25 đến 35 giây khiến thời gian phản hồi vọt từ 3ms lên hơn 30.000ms, gây ra bão timeout và retry thanh toán của khách hàng. Giám sát ổ đĩa cho thấy băng thông ghi đĩa vọt lên mức cực đại 2.4 GB/giây trong suốt 30 giây làm nghẽn toàn bộ bus lưu trữ, sau đó lại gần như rảnh rỗi trong 4.5 phút tiếp theo. Truy vấn bảng pg_stat_bgwriter vạch trần nguyên nhân: thông số checkpoint_completion_target vẫn đang để ở mức 0.1 (mặc định cũ thời xa xưa)! Do completion_target là 0.1, Checkpointer đã tống toàn bộ 85.000 trang đĩa bẩn xuống bộ điều khiển ổ cứng chỉ trong một đợt xả 15 giây duy nhất, bóp nghẹt hoàn toàn các lệnh fsync() của các giao dịch người dùng.'
    },
    whyNaiveFails: {
      en: 'Engineers provisioned higher IOPS (from 20,000 to 60,000 IOPS) at an added cost of $3,500/month. The freeze duration only decreased from 35s to 18s because dumping tens of thousands of random dirty blocks simultaneously overwhelms OS page cache flush locks regardless of disk speed.',
      vi: 'Đội ngũ kỹ sư mua thêm gói IOPS cao hơn (từ 20.000 lên 60.000 IOPS) tốn thêm $3.500/tháng. Khoảng thời gian đơ cứng chỉ giảm từ 35s xuống 18s vì việc xả hàng vạn khối đĩa ngẫu nhiên cùng lúc sẽ làm nghẽn các khóa xả trang của hệ điều hành bất kể ổ đĩa nhanh cỡ nào.'
    },
    coreSolution: {
      en: '1. Update postgresql.conf: set checkpoint_completion_target = 0.9. This instructed the Checkpointer to smoothly spread dirty page writes across 90% of the 5-minute window (4.5 minutes). 2. Increase max_wal_size from 1GB to 16GB and checkpoint_timeout from 5min to 15min, allowing checkpoints to occur four times less frequently. 3. Tune bgwriter_delay = 10ms and bgwriter_lru_maxpages = 800 so the background writer continually trickles out dirty pages. Result: Disk write throughput flattened into a smooth, steady line (~14 MB/sec instead of a 2.4 GB/sec spike). The 35-second freeze was completely eliminated, and p99 transaction latencies stabilized under 4ms.',
      vi: '1. Cập nhật postgresql.conf: thiết lập checkpoint_completion_target = 0.9. Cấu hình này chỉ đạo Checkpointer dàn đều việc xả các trang bẩn trong suốt 90% thời gian của chu kỳ 5 phút (tương đương 4.5 phút). 2. Nâng max_wal_size từ 1GB lên 16GB và tăng checkpoint_timeout từ 5 phút lên 15 phút, giúp giảm tần suất kích hoạt checkpoint xuống 4 lần. 3. Tinh chỉnh bgwriter_delay = 10ms và bgwriter_lru_maxpages = 800 để tiến trình background writer liên tục rỉ các trang bẩn ra đĩa. Kết quả: Băng thông ghi đĩa trở thành một đường thẳng nằm ngang êm ái (~14 MB/giây thay vì cơn bão 2.4 GB/giây). Cơn đơ 35 giây biến mất 100%, và độ trễ p99 của các giao dịch ổn định dưới 4ms.'
    },
    architectureImpact: {
      en: 'Proper checkpoint pacing and background writer orchestration transform erratic I/O storms into smooth, predictable physical storage flows, safeguarding enterprise SLAs.',
      vi: 'Cơ chế điều tiết checkpoint hợp lý và phối hợp tiến trình ghi ngầm biến các cơn bão I/O bất thường thành dòng chảy lưu trữ ổn định, bảo vệ vững chắc cam kết dịch vụ của doanh nghiệp.'
    }
  },

  javaCode: `package com.database.internals.checkpoint;

import java.util.*;

/**
 * Pure Java 21 implementation of Checkpoint Pacing & Dirty Page Flush Simulation.
 */
public class CheckpointPacingEngine {

    public record DirtyPage(int pageId, long lastModifiedLsn) {}

    public static class PacedCheckpointer {
        private final List<DirtyPage> dirtyBufferPool = new ArrayList<>();

        public void markDirty(int pageId, long lsn) {
            dirtyBufferPool.add(new DirtyPage(pageId, lsn));
        }

        // NAIVE APPROACH: Flush all pages immediately in 1 burst (causes I/O freeze!)
        public void executeNaiveBurstCheckpoint() {
            System.out.printf("  [Naive Burst Checkpoint] Dumping %,d dirty pages simultaneously!%n", dirtyBufferPool.size());
            System.out.println("  -> Disk IOPS spike to 100%! All user transactions freeze for 30 seconds!");
            dirtyBufferPool.clear();
        }

        // OPTIMAL APPROACH: Paced Checkpoint (checkpoint_completion_target = 0.9)
        public void executePacedCheckpoint(int durationSeconds, double completionTarget) {
            int totalPages = dirtyBufferPool.size();
            double targetTimeSeconds = durationSeconds * completionTarget;
            int pagesPerSecond = (int) Math.ceil(totalPages / targetTimeSeconds);

            System.out.printf("  [Paced Checkpoint] Total Dirty Pages: %,d%n", totalPages);
            System.out.printf("  -> Spreading writes across %.1f seconds (Target: %.0f%% of %ds interval)%n",
                targetTimeSeconds, completionTarget * 100, durationSeconds);
            System.out.printf("  -> Paced Write Rate: %,d pages/second (Smooth, zero I/O spikes!)%n", pagesPerSecond);

            dirtyBufferPool.clear();
        }
    }

    public static void main(String[] args) {
        PacedCheckpointer engine = new PacedCheckpointer();

        // Simulate 90,000 dirty pages accumulated in RAM
        for (int i = 0; i < 90_000; i++) {
            engine.markDirty(i, 1000L + i);
        }

        System.out.println("=== SCENARIO 1: Legacy Checkpoint Execution ===");
        engine.executeNaiveBurstCheckpoint();

        // Repopulate for scenario 2
        for (int i = 0; i < 90_000; i++) {
            engine.markDirty(i, 2000L + i);
        }

        System.out.println("\n=== SCENARIO 2: Modern Paced Checkpoint Execution (checkpoint_completion_target = 0.9) ===");
        // 5-minute interval = 300 seconds
        engine.executePacedCheckpoint(300, 0.9);
    }
}
`
};
