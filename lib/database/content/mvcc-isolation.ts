import type { DatabaseTopic } from '../types';

export const mvccIsolation: DatabaseTopic = {
  id: 'mvcc-isolation',
  category: 'concurrency-tx',
  name: 'MVCC & Snapshot Isolation Internals',
  tagline: {
    en: 'High-concurrency transaction processing: readers never block writers, tuple visibility rules (xmin/xmax), and undo log roll-pointers.',
    vi: 'Xử lý giao dịch đồng thời cao: người đọc không chặn người ghi, luật hiển thị tuple (xmin/xmax) và con trỏ Undo Log.'
  },
  difficulty: 3,
  order: 6,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'In traditional lock-based systems (Pessimistic 2PL), a long-running analytical report (SELECT COUNT(*) FROM orders) acquires shared locks across millions of rows, completely blocking all online write transactions (INSERT, UPDATE) and causing catastrophic application freezes.',
      vi: 'Trong các hệ thống dùng khóa bi quan (Pessimistic 2PL), một câu lệnh báo cáo chạy dài (SELECT COUNT(*) FROM orders) giữ khóa đọc trên hàng triệu dòng, chặn đứng hoàn toàn tất cả các giao dịch ghi trực tuyến (INSERT, UPDATE) và gây tê liệt hệ thống.'
    },
    hardwareConstraint: {
      en: 'Multi-core CPUs can execute thousands of concurrent threads. Lock managers maintaining lock hash tables suffer severe CPU cache-line bouncing and mutex contention when thousands of threads acquire and release locks per second.',
      vi: 'CPU đa nhân có thể thực thi hàng ngàn luồng đồng thời. Cơ chế Lock Manager duy trì bảng băm khóa sẽ bị hiện tượng nhảy dòng cache CPU (Cache-line bouncing) và tranh chấp Mutex dữ dội khi hàng ngàn luồng cùng xin và nhả khóa mỗi giây.'
    },
    fundamentalSolution: {
      en: 'Multi-Version Concurrency Control (MVCC) ensures that readers never block writers, and writers never block readers. Every UPDATE creates a new version of the row stamped with transaction identifiers (xmin, xmax). A transaction captures a point-in-time Snapshot at start and sees only tuples committed before its snapshot.',
      vi: 'Đa phiên bản MVCC bảo đảm người đọc không bao giờ chặn người ghi, và người ghi không bao giờ chặn người đọc. Mỗi lệnh UPDATE tạo ra một phiên bản mới được gắn số hiệu giao dịch (xmin, xmax). Giao dịch chụp lại một bức ảnh Snapshot tại thời điểm bắt đầu và chỉ nhìn thấy các dữ liệu đã commit trước mốc snapshot đó.'
    },
    math: {
      formula: 'Visible(Tuple t) = (t.xmin ∈ Committed) ∧ (t.xmin < Snapshot.xmin) ∧ (t.xmax = 0 ∨ t.xmax ≥ Snapshot.xmax)',
      description: {
        en: 'A tuple is visible if its creating transaction committed prior to snapshot capture and its deleting transaction has not yet committed.',
        vi: 'Một bản ghi chỉ hiển thị nếu giao dịch tạo ra nó đã commit trước snapshot và giao dịch xóa nó chưa hoàn tất.'
      },
      timeComplexity: 'O(1) visibility evaluation per tuple, O(V) undo log traversal',
      spaceComplexity: 'Temporary storage overhead for dead tuples / undo logs until GC',
      ioCostFormula: 'Read Cost = 1 Heap Page Fetch + K × Undo Log Page Traversal'
    }
  },

  detailedTheory: {
    overview: {
      en: 'Multi-Version Concurrency Control (MVCC) is the dominant concurrency paradigm powering all modern relational database engines. By decoupling reads from writes, MVCC ensures that read-only queries never wait for write locks, and mutating transactions never block concurrent readers. However, storing multiple concurrent versions of every row introduces severe architectural challenges: garbage collection, table bloat, undo log explosion, and the catastrophic 32-bit transaction ID wraparound.',
      vi: 'Đa phiên bản (MVCC) là mô hình xử lý đồng thời thống trị trong mọi hệ quản trị cơ sở dữ liệu hiện đại. Bằng cách tách rời luồng đọc và ghi, MVCC bảo đảm các truy vấn đọc không bao giờ phải chờ khóa ghi, và các giao dịch sửa đổi không bao giờ chặn luồng đọc. Tuy nhiên, việc duy trì nhiều phiên bản dữ liệu cùng lúc kéo theo những thách thức kiến trúc nghiêm trọng: thu gom rác (Garbage Collection), phình to bảng (Table Bloat), bùng nổ Undo Log và thảm họa tràn vòng số hiệu giao dịch 32-bit (TxID Wraparound).'
    },
    deepDiveParagraphs: [
      {
        en: '1. MVCC Theoretical Model & Snapshot Isolation: Multi-Version Concurrency Control (MVCC) decouples read and write transactions by allowing multiple historical versions of each logical row to coexist. Under ANSI SQL isolation levels, MVCC completely prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads without shared row-level read locks. However, pure Snapshot Isolation permits the Write Skew anomaly (e.g., two doctors simultaneously on-call query the count of active doctors, find count = 2, and both take leave concurrently, reducing active doctors to 0). Addressing Write Skew requires either explicit SELECT ... FOR UPDATE pessimistic locking or Serializable Snapshot Isolation (SSI) via SIREAD predicate locks.',
        vi: '1. Mô hình Lý thuyết MVCC & Snapshot Isolation: Cơ chế Đa phiên bản (MVCC) tách rời hoàn toàn giao dịch đọc và ghi bằng cách cho phép nhiều phiên bản lịch sử của cùng một dòng logic đồng thời tồn tại. Dưới các cấp độ cô lập ANSI SQL, MVCC ngăn chặn triệt để Dirty Read, Non-Repeatable Read và Phantom Read mà không cần bất kỳ khóa đọc chia sẻ (shared lock) nào. Tuy nhiên, Snapshot Isolation thuần túy vẫn tồn tại dị thường Write Skew (lệch ghi - ví dụ: hai bác sĩ cùng trực ca cùng truy vấn thấy có 2 người, và cả hai cùng bấm xin nghỉ phép đồng thời khiến ca trực còn 0 người). Để xử lý Write Skew, hệ thống phải dùng khóa bi quan SELECT ... FOR UPDATE hoặc cơ chế Serializable Snapshot Isolation (SSI) với khóa vị từ SIREAD.'
      },
      {
        en: '2. PostgreSQL Tuple Visibility Model: PostgreSQL implements MVCC directly inside heap tables. Every physical row carries a 23-byte HeapTupleHeaderData containing: t_xmin (creating transaction ID), t_xmax (updating/deleting transaction ID, 0 if alive), t_cid (command ID within transaction), t_ctid (physical pointer to the newer version), and t_infomask (commit hint bitmask: HEAP_XMIN_COMMITTED, HEAP_XMAX_INVALID). When a transaction begins, it captures a snapshot formatted as xmin:xmax:xip_list (where xmin is the lowest active TxID, xmax is the next unassigned TxID, and xip_list is the array of in-flight uncommitted TxIDs). A tuple is visible if: (1) t_xmin is committed and < snapshot.xmin, or committed and not in xip_list; AND (2) t_xmax is either 0, aborted, > snapshot.xmax, or currently in xip_list. Commit status is verified via pg_xact (formerly pg_clog) and cached in hint bits to avoid repeated I/O lookups.',
        vi: '2. Mô hình Hiển thị Tuple trong PostgreSQL: PostgreSQL cài đặt MVCC trực tiếp ngay trên các bảng heap. Mỗi dòng vật lý chứa header HeapTupleHeaderData 23 byte gồm: t_xmin (ID giao dịch tạo), t_xmax (ID giao dịch xóa/cập nhật, bằng 0 nếu còn sống), t_cid (mã lệnh trong giao dịch), t_ctid (con trỏ đĩa trỏ đến phiên bản mới hơn) và t_infomask (các bit trạng thái: HEAP_XMIN_COMMITTED, HEAP_XMAX_INVALID). Khi một transaction bắt đầu, nó chụp Snapshot có dạng xmin:xmax:xip_list (với xmin là TxID nhỏ nhất còn sống, xmax là TxID tiếp theo chưa cấp phát, xip_list là danh sách các TxID đang chạy chưa commit). Một tuple hiển thị khi: (1) t_xmin đã commit và < snapshot.xmin, hoặc đã commit và không nằm trong xip_list; VÀ (2) t_xmax bằng 0, bị abort, > snapshot.xmax, hoặc đang nằm trong xip_list. Trạng thái commit được kiểm tra qua pg_xact (CLOG) và lưu đệm vào hint bits để không phải đọc lại đĩa.'
      },
      {
        en: '3. MySQL InnoDB Undo-Based Version Reconstruction Model: Unlike PostgreSQL, MySQL InnoDB updates rows in-place inside the leaf pages of the Clustered Index (PRIMARY KEY). To maintain MVCC, InnoDB appends two hidden 6-byte and 7-byte metadata columns to every record: DB_TRX_ID (the ID of the last modifying transaction) and DB_ROLL_PTR (a 7-byte pointer to the previous version stored in the Undo Log segment). When a transaction reads under Repeatable Read, it builds an in-memory Read View containing m_ids (active transactions), m_low_limit_id, and m_up_limit_id. If the row in the clustered index has DB_TRX_ID >= m_low_limit_id or is inside m_ids, the reading thread traverses backwards along the DB_ROLL_PTR undo chain, applying reverse deltas until it reconstructs the exact point-in-time snapshot of the row. This completely eliminates dead-tuple bloat in the main table heap.',
        vi: '3. Mô hình Phục dựng Phiên bản Dựa trên Undo Log của MySQL InnoDB: Khác với PostgreSQL, MySQL InnoDB cập nhật dữ liệu trực tiếp tại chỗ (in-place) ngay trên các trang lá của Clustered Index (PRIMARY KEY). Để duy trì MVCC, InnoDB thêm hai cột ẩn vào mỗi bản ghi: DB_TRX_ID (6 byte, ID giao dịch sửa đổi cuối cùng) và DB_ROLL_PTR (7 byte, con trỏ trỏ đến phiên bản trước đó nằm trong Undo Log). Khi giao dịch đọc ở mức Repeatable Read, nó tạo một Read View trong bộ nhớ chứa m_ids (danh sách transaction đang chạy), m_low_limit_id và m_up_limit_id. Nếu bản ghi hiện tại trên chỉ mục có DB_TRX_ID >= m_low_limit_id hoặc nằm trong m_ids, luồng đọc sẽ lần ngược theo chuỗi con trỏ DB_ROLL_PTR vào Undo Log, bù đắp các delta ngược chiều cho tới khi tái tạo chính xác trạng thái của dòng tại thời điểm snapshot. Cơ chế này triệt tiêu hoàn toàn rác dòng chết trong bảng chính.'
      },
      {
        en: '4. Snapshot Management, Garbage Collection & Cleanup (VACUUM vs Purge): The architectural divergence between Postgres and InnoDB creates opposite operational trade-offs for garbage collection: (A) PostgreSQL Dead Tuples & VACUUM: Frequent UPDATEs leave obsolete tuple versions directly on heap pages, causing physical table bloat and index degradation. Background Autovacuum scans heap pages to prune dead line pointers and record free space in the Free Space Map (FSM). Crucially, 32-bit transaction IDs wrap around after 2^32 (4 billion) transactions; VACUUM FREEZE must proactively freeze old xmins to FrozenTransactionId (2) before the 2-billion transaction limit, otherwise historical data silently becomes invisible! (B) InnoDB Undo Purge & History List Length (HLL): Historical versions live in Undo Tablespaces. Dedicated InnoDB Purge Threads continuously free undo log pages once all active Read Views have passed beyond their DB_TRX_ID. However, if an uncommitted connection stays idle for hours, the History List Length (HLL) explodes, consuming disk space and degrading read query performance across the entire database.',
        vi: '4. Quản lý Snapshot, Thu gom Rác & Dọn dẹp (VACUUM vs Purge): Sự khác biệt kiến trúc giữa Postgres và InnoDB tạo nên hai bài toán vận hành hoàn toàn trái ngược: (A) PostgreSQL - Dòng Chết & VACUUM: Các lệnh UPDATE liên tục để lại các phiên bản cũ ngay trên các trang heap, gây hiện tượng phình to bảng (Table Bloat) và suy giảm hiệu năng index. Tiến trình nền Autovacuum quét các trang heap để dọn sạch line pointer chết và trả lại dung lượng trống cho Free Space Map (FSM). Đặc biệt, TxID 32-bit sẽ tràn vòng sau 4 tỷ số; tiến trình VACUUM FREEZE bắt buộc phải chủ động đóng băng các xmin cũ thành FrozenTransactionId (2) trước mốc 2 tỷ transaction, nếu không toàn bộ dữ liệu lịch sử sẽ đột ngột biến mất khỏi tầm nhìn! (B) MySQL InnoDB - Purge & History List Length (HLL): Các phiên bản lịch sử nằm riêng trong Undo Tablespace. Các luồng Purge Thread chuyên trách liên tục giải phóng các trang Undo Log ngay khi không còn Read View nào cần đến chúng. Tuy nhiên, nếu một kết nối bị treo hoặc chạy dài nhiều giờ, độ dài hàng đợi lịch sử (History List Length - HLL) sẽ bùng nổ, làm cạn kiệt ổ cứng và kéo tụt tốc độ đọc trên toàn bộ cơ sở dữ liệu.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Idle In Transaction Connections Freezing Autovacuum: If a backend Spring Boot service opens a @Transactional connection, executes a SELECT, and hangs on an external HTTP API call for 30 minutes, PostgreSQL Autovacuum cannot clean ANY dead tuples created across the entire database since that connection began! This triggers massive table bloat, disk saturation, and database-wide query degradation. Mitigation: configure idle_in_transaction_session_timeout = 10s.',
        vi: 'Kết nối Treo trong Transaction Làm Tê liệt Autovacuum: Nếu Spring Boot mở một kết nối @Transactional, chạy một câu SELECT rồi bị treo khi gọi API HTTP bên ngoài suốt 30 phút, tiến trình Autovacuum của PostgreSQL sẽ bị cấm dọn dẹp MỌI dòng chết trên toàn bộ CSDL kể từ thời điểm kết nối đó mở! Điều này gây phình to bảng khủng khiếp và làm sập đĩa cứng. Giải pháp: luôn cấu hình idle_in_transaction_session_timeout = 10s.'
      },
      {
        en: 'The Lost Update Trap in Concurrent Microservices: Because MVCC allows concurrent transactions to read the same row without blocking, two Spring Boot instances can both read balance = 100, calculate 100 - 30 = 70 and 100 - 20 = 80, and both commit cleanly. The final balance is 80 instead of 50! Solution: Enforce JPA Optimistic Locking using @Version or write explicit atomic updates (UPDATE account SET balance = balance - 30 WHERE id = 1 AND balance >= 30).',
        vi: 'Bẫy Ghi đè Mất Dữ liệu (Lost Update) trong Microservices: Vì MVCC cho phép nhiều giao dịch cùng đọc một dòng mà không khóa nhau, hai ứng dụng Spring Boot có thể cùng đọc số dư là 100k, tính toán trừ 30k và trừ 20k, rồi cùng ghi đè lên nhau. Kết quả số dư còn 80k thay vì 50k! Giải pháp: Bắt buộc dùng khóa lạc quan JPA @Version hoặc dùng câu lệnh SQL nguyên tử (UPDATE account SET balance = balance - 30 WHERE balance >= 30).'
      },
      {
        en: 'MySQL Long-Running Transactions Exploding Undo Tablespaces: When a MySQL transaction remains active for hours (e.g. an unindexed mysqldump or batch import), InnoDB Purge Threads cannot purge old undo log pages referenced by that snapshot. The ibdata1 or undo tablespace files expand by tens of gigabytes, exhausting server storage and causing catastrophic production database halts.',
        vi: 'Giao dịch Dài trên MySQL Làm Phình Bùng nổ Undo Tablespace: Khi một transaction MySQL bị giữ suốt nhiều tiếng (như lệnh sao lưu hoặc import dữ liệu thiếu index), các Purge Thread của InnoDB không thể dọn dẹp các trang Undo Log cũ. Các file undo tablespace sẽ phình to hàng chục Gigabyte, làm cạn kiệt dung lượng đĩa cứng và khiến server CSDL bị ngừng hoạt động khẩn cấp.'
      }
    ]
  },

  pageLayout: {
    title: {
      en: 'Tuple Header Multi-Version Layout (PostgreSQL HeapTupleHeaderData)',
      vi: 'Cấu trúc Header đa phiên bản của Tuple (Chuẩn PostgreSQL HeapTupleHeaderData)'
    },
    description: {
      en: 'Every physical row on disk carries 23 bytes of transaction metadata header: t_xmin (creator TxID), t_xmax (destructor/updater TxID), and t_ctid (pointer to newer version).',
      vi: 'Mỗi dòng vật lý trên đĩa mang theo 23 byte metadata giao dịch: t_xmin (ID giao dịch tạo), t_xmax (ID giao dịch xóa/cập nhật) và t_ctid (con trỏ trỏ tới phiên bản mới hơn).'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| HEAPTUPLEHEADERDATA (23 Bytes):                                          |
|  [ t_xmin: 4B (TxID that inserted this tuple) ]                          |
|  [ t_xmax: 4B (TxID that deleted or updated this tuple, 0 if alive) ]   |
|  [ t_cid:  4B (Command ID within transaction) ]                          |
|  [ t_ctid: 6B (Pointer: BlockNumber + Offset to newer tuple version) ]   |
|  [ t_infomask: 2B (Flags: HEAP_XMIN_COMMITTED, HEAP_XMAX_INVALID) ]      |
+--------------------------------------------------------------------------+
| NULL BITMAP: 1 bit per column indicating if value is NULL               |
+--------------------------------------------------------------------------+
| USER COLUMN VALUES: [ col0: int (4B) | col1: varchar | ... ]             |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 't_xmin', size: '4 Bytes (32-bit)', description: { en: 'Transaction ID that created this tuple version', vi: 'ID của giao dịch đã tạo ra phiên bản dòng này' } },
      { name: 't_xmax', size: '4 Bytes (32-bit)', description: { en: 'Transaction ID that deleted or created a newer version of this tuple (0 if active)', vi: 'ID của giao dịch đã xóa hoặc thay thế bản ghi (0 nếu còn sống)' } },
      { name: 't_ctid', size: '6 Bytes', description: { en: 'Physical ItemPointer pointing to itself, or to the next newer version if updated', vi: 'Con trỏ vật lý trỏ vào chính nó, hoặc trỏ sang phiên bản mới hơn nếu có UPDATE' } }
    ]
  },

  steps: [
    {
      id: 'snapshot',
      title: { en: '1. Capture Transaction Snapshot', vi: '1. Chụp Transaction Snapshot tại thời điểm bắt đầu' },
      phase: 'SNAPSHOT_CREATION',
      description: {
        en: 'When Transaction 42 starts, it acquires a Snapshot containing: xmin (oldest active tx = 40), xmax (first unassigned tx = 43), and a list of active uncommitted transactions [41]. Any change made by tx >= 43 or tx in [41] is invisible to Tx 42.',
        vi: 'Khi Giao dịch 42 bắt đầu, nó chụp Snapshot gồm: xmin (giao dịch cũ nhất đang chạy = 40), xmax (ID tiếp theo chưa cấp = 43) và danh sách giao dịch chưa commit [41]. Mọi thay đổi của các giao dịch >= 43 hoặc nằm trong [41] đều bị vô hình đối với Tx 42.'
      },
      diskIoBehavior: {
        en: 'Pure in-memory snapshot allocation. No disk reads.',
        vi: 'Cấp phát snapshot trong RAM. Không đọc đĩa.'
      },
      javaCodeLineMatch: 'Snapshot snapshot = txManager.createSnapshot()'
    },
    {
      id: 'visibility',
      title: { en: '2. Check Tuple Visibility Rules', vi: '2. Đánh giá luật hiển thị phiên bản bản ghi' },
      phase: 'VISIBILITY_EVALUATION',
      description: {
        en: 'The query engine inspects t_xmin on each tuple. If t_xmin is committed and < snapshot.xmin, the tuple is visible. If t_xmax is set by a committed transaction prior to the snapshot, the row is considered deleted and skipped.',
        vi: 'Động cơ kiểm tra t_xmin của từng dòng. Nếu t_xmin đã commit và < snapshot.xmin, dòng này hiển thị. Nếu t_xmax được đặt bởi một giao dịch đã commit trước snapshot, dòng này được coi là đã bị xóa và bị bỏ qua.'
      },
      diskIoBehavior: {
        en: 'Inspected inside buffer page in memory. Checks commit log (pg_xact / CLOG) if infomask hints are not yet set.',
        vi: 'Kiểm tra trên buffer trong RAM. Tra cứu bảng trạng thái commit CLOG nếu cờ gợi ý chưa được đặt.'
      },
      javaCodeLineMatch: 'boolean isVisible = tuple.xmin <= snapshot.getTxId()'
    },
    {
      id: 'undolog',
      title: { en: '3. Traverse Roll-Pointer / Undo Chain', vi: '3. Duyệt ngược chuỗi con trỏ Undo Log (MySQL InnoDB)' },
      phase: 'VERSION_RECONSTRUCTION',
      description: {
        en: 'In MySQL InnoDB, row updates modify the row in-place and write previous column values into an Undo Log segment. If a reader needs an older historical version, it traverses the 7-byte DB_ROLL_PTR backward through undo records to reconstruct the exact past snapshot.',
        vi: 'Trong MySQL InnoDB, lệnh UPDATE sửa trực tiếp tại chỗ và ghi các giá trị cũ vào Undo Log. Nếu người đọc cần phiên bản lịch sử cũ hơn, engine duyệt ngược con trỏ 7-byte DB_ROLL_PTR qua các bản ghi Undo Log để phục dựng đúng ảnh dữ liệu quá khứ.'
      },
      diskIoBehavior: {
        en: 'May read Undo Tablespace pages from buffer pool or disk if the undo chain is long.',
        vi: 'Có thể đọc các trang Undo Tablespace từ buffer pool hoặc đĩa nếu chuỗi undo quá dài.'
      },
      javaCodeLineMatch: 'return traverseUndoLog(tuple.rollPointer)'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Append-Only MVCC',
      implementationName: 'Heap In-Place Versioning & VACUUM GC',
      keyMechanism: {
        en: 'UPDATE writes an entire new tuple into the heap page. Old versions (Dead Tuples) accumulate until background VACUUM or AutoVacuum removes them and marks space reusable in the Free Space Map.',
        vi: 'Lệnh UPDATE tạo một tuple hoàn toàn mới trong trang heap. Các phiên bản cũ (Dead Tuples) tích tụ lại cho tới khi tiến trình VACUUM quét dọn và trả lại dung lượng trống cho FSM.'
      },
      defaultTuningConfig: 'autovacuum_vacuum_scale_factor = 0.05, vacuum_defer_cleanup_age = 0',
      architectureNote: {
        en: 'Transaction ID Wraparound: 32-bit transaction IDs wrap after 2 billion transactions, requiring VACUUM FREEZE to freeze old xmin values to FrozenTransactionId (2).',
        vi: 'Hiện tượng tràn vòng TxID 32-bit sau 2 tỷ transaction đòi hỏi VACUUM FREEZE đóng băng các xmin cũ thành FrozenTransactionId (2).'
      }
    },
    {
      engine: 'MySQL InnoDB Undo MVCC',
      implementationName: 'In-Place Row Update + Undo Log Segments',
      keyMechanism: {
        en: 'Modifies the clustered index row in-place and appends delta undo records to undo log segments. Reads reconstruct historical versions via DB_ROLL_PTR without causing heap bloat.',
        vi: 'Sửa dòng trực tiếp trên clustered index và ghi delta vào Undo Log. Luồng đọc phục dựng phiên bản cũ qua DB_ROLL_PTR nên không bị phình to bảng (bloat) như Postgres.'
      },
      defaultTuningConfig: 'innodb_undo_tablespaces = 2, innodb_max_undo_log_size = 1GB',
      architectureNote: {
        en: 'Purge Threads clean up undo log pages in the background once no active snapshot requires them.',
        vi: 'Các Purge Thread dọn dẹp các trang Undo Log chạy ngầm ngay khi không còn snapshot nào cần đến.'
      }
    },
    {
      engine: 'Oracle Database (19c / 23ai)',
      implementationName: 'SCN-Driven Undo Segments & Read Consistency',
      keyMechanism: {
        en: 'System Change Number (SCN) drives all visibility. Updates modify the block in-place and write before-images to Undo segments. Readers traversing a block with SCN > query SCN dynamically clone the block in private PGA and roll back undo records to reconstruct the historical image.',
        vi: 'Mã số thay đổi hệ thống (SCN) định đoạt mọi khả năng hiển thị. Khi update, Oracle sửa trực tiếp trong block và ghi bản ghi gốc vào Undo segment. Người đọc gặp block có SCN lớn hơn SCN truy vấn sẽ nhân bản block trong vùng nhớ riêng PGA và quét ngược undo để phục dựng lại phiên bản quá khứ.'
      },
      defaultTuningConfig: 'ALTER SYSTEM SET UNDO_RETENTION = 7200; ALTER SYSTEM SET UNDO_TABLESPACE = "UNDOTBS1";',
      architectureNote: {
        en: 'Oracle does not suffer from table bloat or VACUUM overhead. However, long-running queries fail with "ORA-01555: snapshot too old" if undo blocks are overwritten by concurrent transactions.',
        vi: 'Oracle hoàn toàn không bị phình bảng hay tốn công VACUUM như Postgres. Tuy nhiên, các truy vấn chạy quá dài sẽ bị đứt gánh với lỗi "ORA-01555: snapshot too old" nếu các block undo bị giao dịch khác ghi đè.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Readers never block writers; writers never block readers.', vi: 'Người đọc không bao giờ chặn người ghi; người ghi không bao giờ chặn người đọc.' },
      { en: 'Consistent point-in-time snapshot repeatable reads across massive tables.', vi: 'Bảo đảm tính đọc lặp lại nhất quán tuyệt đối trên các bảng dữ liệu khổng lồ.' }
    ],
    cons: [
      { en: 'Table bloat in PostgreSQL: High update rates produce millions of dead tuples requiring aggressive VACUUM.', vi: 'Hiện tượng phình to bảng (Bloat) trong Postgres đòi hỏi AutoVacuum hoạt động liên tục.' },
      { en: 'Undo log contention in MySQL: Long-running transactions hold open undo logs, causing disk space explosion.', vi: 'Nghẽn Undo Log trong MySQL: Giao dịch chạy dài giữ Undo Log khiến dung lượng đĩa phình to đột biến.' }
    ],
    writeAmplification: {
      en: 'Higher in append-only MVCC (Postgres updates rewrite full row + index pointers), lower in delta undo systems (InnoDB).',
      vi: 'Cao hơn trong Postgres (ghi cả dòng mới kèm index), thấp hơn trong InnoDB (chỉ ghi delta vào undo log).'
    },
    recoveryGuarantee: {
      en: 'Snapshot visibility is strictly derived from durable WAL commit markers.',
      vi: 'Tính hiển thị snapshot được suy diễn chặt chẽ từ các cờ commit bền vững trong WAL.'
    }
  },

  springBootCode: `# ===================================================================
# Spring Boot 3.x application.yml - MVCC & Connection Pool Settings
# ===================================================================
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/orders_db
    hikari:
      maximum-pool-size: 25
      minimum-idle: 5
      # Prevent idle connections from holding historical MVCC snapshots
      idle-timeout: 60000 
      max-lifetime: 600000 
  jpa:
    properties:
      hibernate:
        # Prevent long-running transactions from causing table bloat
        transaction.default_timeout: 10

---
// ===================================================================
// JPA Entity with Optimistic Locking (@Version) cooperating with MVCC
// ===================================================================
package com.enterprise.orders.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sku;

    @Column(nullable = false)
    private Integer availableStock;

    // MVCC + Optimistic Lock: Prevents lost updates with zero lock contention!
    @Version
    private Long version;

    // Getters and setters...
}`,

  sqlQueries: `-- 1. Inspect Hidden PostgreSQL MVCC System Columns (xmin, xmax, ctid)
SELECT 
    ctid,       -- (PageNumber, SlotNumber) physical disk pointer
    xmin,       -- Transaction ID that inserted this row version
    xmax,       -- Transaction ID that deleted/updated this row (0 if live)
    id, 
    sku, 
    available_stock
FROM inventory_items;

-- 2. Check for Dead Tuple Table Bloat caused by frequent MVCC updates
SELECT 
    schemaname, 
    relname AS table_name, 
    n_live_tup AS live_tuples, 
    n_dead_tup AS dead_tuples, 
    round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 2) AS dead_tuple_percent,
    last_vacuum, 
    last_autovacuum
FROM pg_stat_user_tables
WHERE relname = 'inventory_items';

-- 3. Run non-blocking concurrent VACUUM to reclaim dead MVCC tuple space
VACUUM (VERBOSE, ANALYZE) inventory_items;`,

  javaCode: `package com.database.internals.concurrency;

import java.util.*;

/**
 * Pure Java 21 implementation of MVCC & Snapshot Isolation.
 * Demonstrates Snapshot creation, Tuple Visibility (xmin/xmax), and Undo Roll-pointer.
 */
public class MVCCEngine {
    public static class Tuple {
        public final long xmin;      // Creating TxID
        public long xmax;            // Deleting / Updating TxID (0 if alive)
        public final String data;
        public Tuple rollPointer;    // Pointer to prior version in Undo chain

        public Tuple(long xmin, String data, Tuple rollPointer) {
            this.xmin = xmin;
            this.xmax = 0;
            this.data = data;
            this.rollPointer = rollPointer;
        }
    }

    public static class Snapshot {
        public final long txId;
        public final long xminSnapshot; // Oldest active Tx
        public final long xmaxSnapshot; // First unassigned Tx
        public final Set<Long> activeTxIds;

        public Snapshot(long txId, long xmin, long xmax, Set<Long> active) {
            this.txId = txId;
            this.xminSnapshot = xmin;
            this.xmaxSnapshot = xmax;
            this.activeTxIds = active;
        }

        // Step 2: Check Tuple Visibility against snapshot rules
        public boolean isVisible(Tuple tuple) {
            // If created by uncommitted transaction, invisible
            if (activeTxIds.contains(tuple.xmin)) return false;
            // If created after snapshot took place, invisible
            if (tuple.xmin >= xmaxSnapshot && tuple.xmin != txId) return false;

            // If deleted before snapshot took place, invisible
            if (tuple.xmax != 0 && tuple.xmax < xmaxSnapshot && !activeTxIds.contains(tuple.xmax)) {
                return false;
            }
            return true;
        }
    }

    private final Map<String, Tuple> heapStorage = new HashMap<>();
    private final Set<Long> activeTransactions = new HashSet<>();
    private long nextTxId = 100;

    // Step 1: Capture transaction snapshot
    public synchronized Snapshot createSnapshot(long txId) {
        long xmin = activeTransactions.stream().min(Long::compareTo).orElse(txId);
        return new Snapshot(txId, xmin, nextTxId, new HashSet<>(activeTransactions));
    }

    public synchronized void update(String key, String newData, long txId) {
        Tuple oldTuple = heapStorage.get(key);
        if (oldTuple != null) {
            oldTuple.xmax = txId; // Mark old tuple as superseded by txId
        }
        // Create new tuple version chaining back via rollPointer
        Tuple newTuple = new Tuple(txId, newData, oldTuple);
        heapStorage.put(key, newTuple);
    }

    // Step 3: Read row with undo log traversal if current version is invisible
    public String read(String key, Snapshot snapshot) {
        Tuple curr = heapStorage.get(key);
        while (curr != null) {
            if (snapshot.isVisible(curr)) {
                return curr.data;
            }
            curr = curr.rollPointer; // Step 3: Traverse Undo chain backward
        }
        return null;
    }
}`,

  productionProblemCase: {
    title: {
      en: 'PostgreSQL Table Bloat & Emergency Shutdown from Long-Running Analytics Queries',
      vi: 'Nghẽn Băng Thông & Phình To Bảng Dữ Liệu Do Giao Dịch Chạy Quá Dài'
    },
    businessContext: {
      en: 'An enterprise billing system runs high-volume OLTP transactions (5,000 updates/sec). A business intelligence analyst connects to the primary database and executes an ad-hoc 4-hour reporting query inside an open transaction block.',
      vi: 'Hệ thống kế toán doanh nghiệp chạy 5.000 giao dịch cập nhật mỗi giây. Một chuyên viên phân tích BI kết nối trực tiếp vào Primary Database và chạy một câu query phân tích kéo dài 4 tiếng bên trong một transaction chưa đóng.'
    },
    problemDescription: {
      en: 'Under MVCC, UPDATE statements do not modify tuples in place; they insert a new version (xmin = current_tx) and mark the old version with xmax = current_tx. The Autovacuum background worker cleans dead tuples, but it is STRICTLY FORBIDDEN from removing any dead tuple whose xmax is greater than the xmin of the OLDEST running transaction! Because the 4-hour query holds an ancient xmin snapshot, Autovacuum is completely paralyzed. Over four hours, 72 million dead tuples accumulate, causing table storage to bloat from 10GB to 180GB. Routine queries must scan gigabytes of dead rows, exhausting SSD I/O. If transactions reach 2 billion without vacuuming, PostgreSQL initiates an Emergency Shutdown to prevent 32-bit Transaction ID Wraparound data corruption.',
      vi: 'Dưới cơ chế MVCC, lệnh UPDATE không sửa dữ liệu tại chỗ; hệ thống chèn một phiên bản mới (xmin = current_tx) và đánh dấu bản ghi cũ với xmax = current_tx. Tiến trình ngầm Autovacuum có nhiệm vụ dọn dẹp các dòng rác này, nhưng nó BỊ CẤM TUYỆT ĐỐI không được dọn bất kỳ bản ghi nào có xmax lớn hơn xmin của GIAO DỊCH GIÀ NHẤT ĐANG CHẠY! Vì câu query kéo dài 4 tiếng giữ snapshot xmin quá cũ, Autovacuum bị phong tỏa hoàn toàn. Trong 4 tiếng, 72 triệu dòng rác tích tụ làm bảng phình từ 10GB lên 180GB. Mọi truy vấn người dùng phải quét qua hàng chục GB rác, đẩy I/O ổ đĩa lên đỉnh điểm. Nguy hiểm nhất, nếu số transaction chạm ngưỡng 2 tỷ mà không thể dọn dẹp, PostgreSQL sẽ kích hoạt Tắt Khẩn Cấp (Emergency Shutdown) để ngăn ngừa thảm họa hỏng dữ liệu do tràn số 32-bit Transaction ID Wraparound.'
    },
    whyNaiveFails: {
      en: 'Scaling disk space or blindly increasing RAM does nothing to solve MVCC bloat. The root cause is snapshot retention semantics: as long as a single transaction remains active, all dead rows created system-wide after that snapshot was minted must be preserved.',
      vi: 'Mở rộng ổ cứng hoặc nâng cấp RAM không giải quyết được gốc rễ phình to MVCC. Nguyên nhân cốt lõi nằm ở ngữ nghĩa lưu giữ snapshot: chừng nào một giao dịch cũ còn hoạt động, toàn bộ các bản ghi rác sinh ra trên toàn hệ thống sau thời điểm đó bắt buộc phải giữ lại.'
    },
    coreSolution: {
      en: '1. Strict Statement & Idle Transaction Timeouts: Enforce statement_timeout = 30000 (30s) and idle_in_transaction_session_timeout = 60000 (60s) on all application connections to terminate runaway queries automatically.\n2. Read Replicas with Hot Standby Feedback Offloaded: Direct all heavy analytics and BI queries to asynchronous Read Replicas or a dedicated Data Warehouse (ClickHouse / Snowflake).\n3. Aggressive Autovacuum Tuning: Configure autovacuum_vacuum_cost_limit = 2000 and autovacuum_vacuum_scale_factor = 0.05 on write-heavy tables so dead tuples are reclaimed aggressively.',
      vi: '1. Thiết Lập Timeout Giao Dịch Chặt Chẽ: Cấu hình statement_timeout = 30000 (30 giây) và idle_in_transaction_session_timeout = 60000 (60 giây) để CSDL tự động ngắt các truy vấn treo quá lâu.\n2. Tách Riêng Read Replica: Điều hướng toàn bộ các câu query phân tích nặng và báo cáo BI sang các máy chủ Read Replica hoặc Data Warehouse chuyên dụng (ClickHouse / Snowflake).\n3. Tinh Chỉnh Autovacuum Năng Động: Thiết lập autovacuum_vacuum_cost_limit = 2000 và autovacuum_vacuum_scale_factor = 0.05 trên các bảng có mật độ ghi cao để dọn rác tức thì.'
    },
    productionCode: `// Spring Boot 3.x Routing Configuration for Primary vs Replica DataSource
@Configuration
public class ReadWriteRoutingDataSourceConfig {

    @Bean
    public DataSource routingDataSource() {
        DataSource primary = createHikariDataSource("primary-db:5432/core", false, 30);
        DataSource replica = createHikariDataSource("replica-db:5432/core", true, 60);

        Map<Object, Object> targetDataSources = Map.of(
            "PRIMARY", primary,
            "REPLICA", replica
        );

        TransactionRoutingDataSource routing = new TransactionRoutingDataSource();
        routing.setTargetDataSources(targetDataSources);
        routing.setDefaultTargetDataSource(primary);
        return routing;
    }

    private static class TransactionRoutingDataSource extends AbstractRoutingDataSource {
        @Override
        protected Object determineCurrentLookupKey() {
            // Automatically routes @Transactional(readOnly = true) to Read Replica!
            return TransactionSynchronizationManager.isCurrentTransactionReadOnly() 
                ? "REPLICA" 
                : "PRIMARY";
        }
    }
}`,
    architectureImpact: {
      en: 'Table bloat plummeted from 180GB to 12GB (93% disk recovery). Vacuum lock waits dropped to 0ms. Primary database CPU utilization was cut in half, completely removing the risk of Transaction ID Wraparound emergency outages.',
      vi: 'Dung lượng bảng giảm từ 180GB xuống còn 12GB (thu hồi 93% dung lượng đĩa). Thời gian chờ dọn rác giảm về 0ms. Tải CPU trên Primary database giảm hơn một nửa, loại bỏ 100% rủi ro sập hệ thống do Transaction ID Wraparound.'
    }
  }
};
