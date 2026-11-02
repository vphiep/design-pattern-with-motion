import type { DatabaseTopic } from '../types';

export const acidAnomalies: DatabaseTopic = {
  id: 'acid-anomalies',
  category: 'concurrency-tx',
  name: 'ACID Fundamentals & Transaction Isolation Anomalies',
  tagline: {
    en: 'The definitive architectural study of database transactions: Atomicity (Undo/Rollback), Consistency (Invariants & Constraints), Isolation (The 4 Anomalies), and Durability (WAL & fsync).',
    vi: 'Nghiên cứu kiến trúc toàn diện về giao dịch CSDL: Tính Nguyên tử (Undo/Rollback), Nhất quán (Ràng buộc & Bất biến), Cách ly (4 Dị thường đồng thời) và Bền vững (WAL & fsync).'
  },
  difficulty: 2,
  order: 9,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      en: 'Executing business transactions on modern multi-core, networked database servers faces four fatal hazards: (1) Partial Failures: a multi-statement transaction crashes halfway through, leaving orphaned corrupted data (violating Atomicity); (2) Invalid Data States: invalid updates break business rules and relational constraints (violating Consistency); (3) Concurrency Race Conditions: concurrent threads read uncommitted or mutable rows, generating Dirty Reads, Phantoms, and Write Skew (violating Isolation); and (4) Sudden Power Blackouts: committed data in volatile RAM is erased on server crash (violating Durability).',
      vi: 'Thực thi giao dịch nghiệp vụ trên các máy chủ CSDL đa nhân đối mặt với 4 nguy cơ sinh tử: (1) Thất bại Bán phần: giao dịch gồm nhiều câu lệnh bị sập giữa chừng, để lại dữ liệu dở dang què cụt (vi phạm Atomicity); (2) Trạng thái Dữ liệu Sai lệch: dữ liệu vi phạm quy tắc nghiệp vụ và ràng buộc quan hệ (vi phạm Consistency); (3) Tranh chấp Đua Đồng thời: các luồng chạy song song đọc phải dữ liệu chưa commit hoặc đang bị sửa, sinh ra Đọc bẩn, Bóng ma và Lệch ghi (vi phạm Isolation); và (4) Mất điện Đột ngột: các giao dịch đã commit nằm trên RAM biến mất hoàn toàn khi máy chủ tắt ngúm (vi phạm Durability).'
    },
    hardwareConstraint: {
      en: 'CPUs possess out-of-order execution pipelines and volatile cache hierarchies (L1/L2/L3), while storage devices have mechanical and controller flush latencies. Relational database engines must coordinate CPU atomic instructions (CAS), shared memory mutexes, and storage barrier flushes (fsync) to uphold mathematical ACID invariants without collapsing transaction throughput.',
      vi: 'CPU sở hữu đường ống thực thi lệnh ngoài trật tự và hệ thống cache nhớ dễ biến (L1/L2/L3), trong khi các thiết bị lưu trữ có độ trễ xả bộ đệm phần cứng nhất định. Storage engine phải phối hợp nhịp nhàng giữa chỉ lệnh CPU nguyên tử (CAS), mutex bộ nhớ chia sẻ và rào chắn xả đĩa (fsync) để duy trì các bất biến toán học của ACID mà không làm sụt giảm thông lượng hệ thống.'
    },
    fundamentalSolution: {
      en: 'The database engine implements the four orthogonal pillars of ACID: (1) Atomicity via Undo Logs (InnoDB rollback segments) or MVCC status bit aborts (PostgreSQL pg_xact); (2) Consistency via relational schema constraints (PK, FK, CHECK, UNIQUE, NOT NULL, triggers) and deferrable constraint validation; (3) Isolation via MVCC snapshots and 2PL/SSI lock managers eliminating concurrency anomalies; and (4) Durability via Write-Ahead Logging (WAL) and paced fsync Group Commits.',
      vi: 'Storage engine hiện thực hóa 4 trụ cột trực giao của ACID: (1) Tính Nguyên tử (Atomicity) qua Undo Log (phân đoạn rollback trong InnoDB) hoặc cờ trạng thái abort (pg_xact trong PostgreSQL); (2) Tính Nhất quán (Consistency) qua các ràng buộc schema quan hệ (PK, FK, CHECK, UNIQUE, NOT NULL, triggers) và kiểm tra ràng buộc trì hoãn (deferrable); (3) Tính Cách ly (Isolation) qua snapshot MVCC và bộ quản lý khóa 2PL/SSI triệt tiêu các dị thường đồng thời; và (4) Tính Bền vững (Durability) qua Nhật ký Ghi trước (WAL) kết hợp Group Commit fsync an toàn.'
    },
    math: {
      formula: '\\text{ACID}(T): \\quad S(t_1) = \\begin{cases} S_{\\text{new}} \\in \\mathcal{C} & \\text{if } \\text{Commit}(T) \\land \\text{WAL\\_Flushed}(T) \\\\ S_{\\text{old}} & \\text{if } \\text{Abort}(T) \\lor \\text{Crash} \\end{cases}, \\quad \\mathcal{S} \\approx \\mathcal{S}_{\\text{serial}}',
      description: {
        en: 'The unified mathematical definition of ACID: Atomicity guarantees a binary outcome S(t_1) in {S_old, S_new} with zero intermediate half-states. Consistency ensures S_new belongs to the manifold C of valid invariant states. Durability guarantees persistence if and only if the WAL commit record was fsynced to non-volatile storage. Isolation ensures concurrent schedule S is view-equivalent or conflict-equivalent to a serial schedule S_serial.',
        vi: 'Định nghĩa toán học thống nhất của ACID: Tính Nguyên tử bảo đảm kết quả nhị phân S(t_1) chỉ có thể là S_old hoặc S_new, tuyệt đối không có trạng thái dở dang. Tính Nhất quán bảo đảm S_new thuộc tập hợp C các trạng thái thỏa mãn mọi ràng buộc. Tính Bền vững bảo đảm dữ liệu sống sót nếu và chỉ nếu bản ghi WAL đã được fsync xuống đĩa. Tính Cách ly bảo đảm lịch biểu đồng thời S tương đương với một lịch biểu tuần tự S_serial.'
      },
      timeComplexity: 'Atomicity: O(Undo_Size) on rollback; Consistency: O(Constraints_Evaluated); Isolation: O(Snapshot_Traversal); Durability: Amortized fsync Cost',
      spaceComplexity: 'Undo Log / MVCC Dead Tuples + Active Lock Hash Entries in RAM + Bounded WAL segments on disk',
      ioCostFormula: 'Commit Cost = 1 Sequential WAL fsync + Constraint Check Reads + (1 / GroupCommitSize) × Disk Sync'
    }
  },

  pageLayout: {
    title: {
      en: 'The Complete Anatomy of ACID & Concurrency Isolation Matrix',
      vi: 'Giải phẫu Toàn diện 4 Trụ cột ACID & Bảng Đối chiếu Cấp độ Cách ly'
    },
    description: {
      en: 'Architectural breakdown of how database kernels implement Atomicity, Consistency, Isolation, and Durability, alongside the ANSI SQL and modern Snapshot Isolation anomaly matrix.',
      vi: 'Bóc tách kiến trúc cách nhân CSDL cài đặt Atomicity, Consistency, Isolation và Durability, cùng ma trận dị thường ANSI SQL và Snapshot Isolation hiện đại.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| THE FOUR PILLARS OF DATABASE ACID ARCHITECTURE:                          |
+--------------------------------------------------------------------------+
| [A] ATOMICITY   | "All or Nothing" - Multi-statement transactions never    |
|                 | leave partial states. Implemented via:                   |
|                 |  - MySQL InnoDB: Undo Log segments (reverse deltas)      |
|                 |  - PostgreSQL: Status bit abort in pg_xact (CLOG)        |
+-----------------+--------------------------------------------------------+
| [C] CONSISTENCY | "Invariant Preservation" - Transitions S1 -> S2 where    |
|                 | all schema rules hold (FK, PK, CHECK, UNIQUE, NOT NULL). |
|                 | * Note: ACID Consistency != CAP Theorem Consistency!    |
+-----------------+--------------------------------------------------------+
| [I] ISOLATION   | "Concurrency Guard" - Controls visibility of concurrent   |
|                 | mutations. Eliminates 4 classic anomalies:               |
|                 |  - Dirty Read, Non-repeatable Read, Phantom, Write Skew   |
|                 | Implemented via MVCC Snapshots & 2PL/SSI Lock Managers.  |
+-----------------+--------------------------------------------------------+
| [D] DURABILITY  | "Survival Guarantee" - Committed changes survive power    |
|                 | loss, kernel panics, and hardware crashes.                |
|                 | Implemented via Write-Ahead Logging (WAL) + fsync().      |
+--------------------------------------------------------------------------+
| ISOLATION LEVEL vs ANOMALIES MATRIX (ANSI SQL vs Modern MVCC Engines):    |
+-----------------------+------------+----------------+--------------+------------+
| ISOLATION LEVEL       | DIRTY READ | NON-REPEATABLE | PHANTOM READ | WRITE SKEW |
+-----------------------+------------+----------------+--------------+------------+
| 1. Read Uncommitted   | YES        | YES            | YES          | YES        |
| 2. Read Committed     | NO         | YES            | YES          | YES        |
| 3. Repeatable Read    | NO         | NO             | NO (in PG/MY)| YES (PG/MY)|
| 4. Serializable       | NO         | NO             | NO           | NO         |
+-----------------------+------------+----------------+--------------+------------+`,
    headerFields: [
      { name: 'Atomicity (Undo)', size: 'Segment Pointers', description: { en: 'Undo log chains or status bitmasks allowing complete reversal of uncommitted transactions', vi: 'Chuỗi Undo log hoặc cờ trạng thái giao dịch cho phép đảo ngược hoàn toàn giao dịch dở dang' } },
      { name: 'Consistency (Invariants)', size: 'Catalog Constraints', description: { en: 'Schema rules (CHECK balance >= 0, FOREIGN KEY) enforced at statement or COMMIT boundary', vi: 'Ràng buộc quan hệ và miền giá trị được kiểm tra tại từng câu lệnh hoặc khi chốt COMMIT' } },
      { name: 'Isolation (MVCC)', size: 'Snapshot Descriptor', description: { en: 'Snapshot metadata (xmin:xmax:xip_list) isolating concurrent reads from uncommitted writes', vi: 'Metadata snapshot cô lập các truy vấn đọc khỏi các thay đổi chưa commit của giao dịch khác' } },
      { name: 'Durability (WAL)', size: 'Log Sequence Number', description: { en: 'Monotonically increasing LSN ensuring log records hit non-volatile disk before COMMIT returns', vi: 'Số LSN tăng đơn điệu bảo đảm bản ghi nhật ký chạm vào đĩa cứng bền vững trước khi báo thành công' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'ACID is the foundational contract established between relational database systems and application developers. First formulated by Jim Gray in the late 1970s and popularized by Haerder and Reuter in 1983, ACID is an acronym representing four distinct, orthogonal engineering responsibilities: Atomicity, Consistency, Isolation, and Durability. Developers frequently reduce ACID to just "Isolation" or concurrency anomalies. In reality, each of the four letters addresses a completely different physical layer of database kernel architecture: Atomicity solves partial execution crashes; Consistency enforces relational invariants and domain truth; Isolation prevents concurrent race conditions; and Durability protects against hardware power loss.',
      vi: 'ACID là bản hợp đồng nền tảng được thiết lập giữa hệ quản trị cơ sở dữ liệu quan hệ và lập trình viên. Được Jim Gray đề xuất vào cuối thập niên 1970 và hoàn thiện bởi Haerder & Reuter năm 1983, ACID là từ viết tắt đại diện cho 4 trách nhiệm kỹ thuật hoàn toàn độc lập và trực giao với nhau: Atomicity (Nguyên tử), Consistency (Nhất quán), Isolation (Cách ly), và Durability (Bền vững). Lập trình viên thường ngộ nhận thu hẹp ACID thành mỗi khái niệm "Cách ly" hoặc các lỗi dị thường đồng thời. Trên thực tế, mỗi chữ cái trong ACID giải quyết một tầng kiến trúc vật lý hoàn toàn riêng biệt trong nhân CSDL: Atomicity xử lý sự cố sập giữa chừng; Consistency bảo vệ tính đúng đắn của dữ liệu và các ràng buộc schema; Isolation ngăn chặn tranh chấp đua của các luồng chạy song song; và Durability bảo vệ dữ liệu khỏi thảm họa mất điện phần cứng.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Atomicity (A) — The All-or-Nothing Physical Implementation: Atomicity guarantees that an entire multi-statement transaction is treated as a single indivisible unit: either EVERY SQL modification succeeds and commits, or in the event of an error, server crash, or explicit ROLLBACK, the database leaves the data in the exact state it was before the transaction began. How database engines implement this physically: (A) MySQL InnoDB Undo Logs: Before modifying any clustered index leaf record in RAM, InnoDB generates a "before-image" reverse delta and appends it to an Undo Log segment. If a transaction executes 9 statements and fails on statement 10, the engine traverses the undo chain backward, executing reverse updates to restore original byte values. (B) PostgreSQL MVCC Abort Bits: PostgreSQL uses an append-only architecture where new tuple versions are written to heap pages tagged with the current transaction ID (t_xmin). When an error occurs or ROLLBACK is issued, PostgreSQL does NOT physically rewrite table pages; it simply flips the transaction status bit to ABORTED in the commit log (pg_xact)! The abandoned tuples instantly become invisible dead tuples, later reclaimed lazily by background VACUUM. (C) Savepoints: Engines support fine-grained nested rollbacks (SAVEPOINT sp1; ROLLBACK TO sp1;) allowing partial failure recovery without destroying the broader transaction.',
        vi: '1. Tính Nguyên Tử (Atomicity - A) — Cơ Chế Hiện Thực Hóa "Được Tất Cả Hoặc Không Có Gì": Atomicity bảo đảm toàn bộ giao dịch gồm nhiều câu lệnh được đối xử như một đơn vị công việc nguyên tử không thể chia cắt: hoặc TẤT CẢ các thay đổi đều thành công và commit, hoặc nếu gặp lỗi, mất kết nối hay có lệnh ROLLBACK, CSDL sẽ đưa toàn bộ dữ liệu trở về đúng nguyên trạng trước khi giao dịch bắt đầu. Cách nhân CSDL cài đặt vật lý: (A) MySQL InnoDB - Phân đoạn Undo Log: Trước khi sửa bất kỳ dòng nào trong RAM, InnoDB tạo một bản ghi delta ngược chiều ("ảnh trước khi sửa") ghi vào Undo Log segment. Nếu giao dịch chạy 9 lệnh thành công nhưng lệnh thứ 10 bị lỗi, engine sẽ lần ngược theo chuỗi con trỏ Undo để thực thi các thao tác đảo ngược, khôi phục lại từng byte dữ liệu ban đầu. (B) PostgreSQL - Bit Trạng Thái Abort trong pg_xact: PostgreSQL dùng kiến trúc ghi nối đuôi (append-only), mỗi tuple mới ghi vào trang heap mang mã giao dịch hiện tại (t_xmin). Khi có lỗi hoặc lệnh ROLLBACK, Postgres KHÔNG HỀ phải tốn công ghi lại các trang đĩa để sửa dữ liệu; nó chỉ việc bật bit trạng thái thành ABORTED trong file trạng thái giao dịch (pg_xact / CLOG)! Toàn bộ các dòng vừa thêm lập tức biến thành dòng chết vô hình đối với mọi truy vấn khác, và sau đó được tiến trình ngầm VACUUM quét dọn êm ái. (C) Điểm Lưu (Savepoints): CSDL hỗ trợ chia nhỏ giao dịch bằng các mốc lưu (SAVEPOINT sp1; ROLLBACK TO sp1;) cho phép ứng dụng hủy một phần nghiệp vụ con bị lỗi mà không làm đổ bể toàn bộ giao dịch lớn.'
      },
      {
        en: '2. Consistency (C) — Invariant Preservation & ACID vs CAP Theorem: Consistency dictates that a transaction must transition the database from one valid state satisfying all invariants (S1) to another valid state (S2). If any operation violates a consistency rule, the entire transaction is rejected. (A) Database-Enforced Consistency: Expressed directly through declarative relational DDL: PRIMARY KEY (uniqueness and non-nullability), FOREIGN KEY (referential integrity preventing orphaned child rows), CHECK constraints (e.g. CHECK (balance >= 0) preventing overdrafts), NOT NULL, UNIQUE indices, and procedural Triggers. Engines also support Deferrable Constraints (SET CONSTRAINTS DEFERRED): during a multi-row swap, constraints can be temporarily violated within the transaction, provided all invariants hold strictly true at the instant of COMMIT. (B) Application-Enforced Consistency: High-level business rules that relational schemas cannot express—for example, in double-entry bookkeeping, the sum of all debits across the bank must mathematically equal the sum of all credits. (C) CRITICAL ARCHITECTURAL DISTINCTION: ACID Consistency vs CAP Theorem Consistency: Many engineers confuse these two terms! "Consistency" in ACID means Data Integrity and Invariant Preservation (preventing illegal data states). In contrast, "Consistency" in the CAP theorem (Gilbert & Lynch, Brewer) means Linearizability / Single-Copy Consistency (every read in a distributed system returns the most recent write). They are completely orthogonal concepts!',
        vi: '2. Tính Nhất Quán (Consistency - C) — Bảo Toàn Bất Biến & Phân Biệt ACID vs CAP: Consistency quy định một giao dịch chỉ được phép chuyển CSDL từ một trạng thái hợp lệ thỏa mãn mọi điều kiện bất biến (S1) sang một trạng thái hợp lệ mới (S2). Nếu bất kỳ thao tác nào vi phạm quy tắc nhất quán, toàn bộ giao dịch sẽ bị từ chối. (A) Nhất Quán Cấp Cơ Sở Dữ Liệu: Được thể hiện qua các ràng buộc DDL quan hệ khai báo: PRIMARY KEY (tính duy nhất và không rỗng), FOREIGN KEY (tính toàn vẹn tham chiếu chống mồ côi dòng con), CHECK constraints (như CHECK (balance >= 0) chống rút tiền âm), NOT NULL, UNIQUE index và Trigger thủ tục. Engine còn hỗ trợ Ràng buộc Trì hoãn (SET CONSTRAINTS DEFERRED): trong quá trình hoán đổi nhiều dòng, ràng buộc có thể tạm thời bị vi phạm bên trong transaction, miễn là tại thời khắc bấm COMMIT tất cả các bất biến phải được thỏa mãn 100%. (B) Nhất Quán Cấp Ứng Dụng: Các quy tắc nghiệp vụ cấp cao mà schema CSDL không thể biểu đạt—ví dụ trong kế toán kép, tổng nợ của toàn ngân hàng bắt buộc phải bằng tổng có. (C) PHÂN BIỆT SỐNG CÒN: Tính Nhất Quán ACID vs Nhất Quán Định Lý CAP: Rất nhiều kỹ sư nhầm lẫn hai khái niệm này! Chữ "C" trong ACID là Tính Toàn Vẹn Dữ Liệu và Bảo Toàn Bất Biến (chống dữ liệu sai luật). Ngược lại, chữ "C" trong định lý CAP (Brewer) đại diện cho Tính Tuyến Tính Hóa (Linearizability / Single-Copy Consistency - mọi lệnh đọc trong hệ phân tán phải nhìn thấy dữ liệu vừa ghi mới nhất). Đây là hai khái niệm hoàn toàn độc lập và khác biệt nhau!'
      },
      {
        en: '3. Isolation (I) — Concurrency Spectrum & The 4 Classic Anomalies: If all transactions ran sequentially on one CPU core, isolation would be trivial. However, modern multi-core databases execute thousands of transactions concurrently. Isolation governs what uncommitted or concurrent changes are visible across transactions. Without isolation, four classic anomalies corrupt production systems: (1) Dirty Read: Tx1 updates a row in RAM; Tx2 reads it; Tx1 aborts. Tx2 acted on fantasy data! (2) Non-Repeatable Read (Fuzzy Read): Tx1 reads a row; Tx2 updates and commits it; Tx1 re-reads the row and gets different data within the same transaction. (3) Phantom Read: Tx1 reads a range of rows (WHERE status = "PENDING"); Tx2 inserts an 11th pending row and commits; Tx1 re-reads the range and finds a new "phantom" row appeared out of thin air. (4) Write Skew: Two transactions read overlapping data, each verifies a safety rule (e.g., on-call doctors >= 1), and then each updates disjoint rows (Alice leaves, Bob leaves), resulting in an invalid global state (0 doctors on call!). The ANSI SQL Standard defines 4 Isolation Levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable. In modern engines, Repeatable Read is implemented via Snapshot Isolation (MVCC point-in-time read views), and Serializable is implemented via Serializable Snapshot Isolation (PostgreSQL SSI tracking rw-antidependencies) or Next-Key Locking (MySQL InnoDB gap locks).',
        vi: '3. Tính Cách Ly (Isolation - I) — Phổ Cấp Độ Cách Ly & 4 Dị Thường Kinh Điển: Nếu mọi giao dịch đều chạy tuần tự lần lượt trên một nhân CPU, tính cách ly là điều hiển nhiên. Tuy nhiên, CSDL hiện đại chạy hàng nghìn giao dịch song song trên hàng chục nhân CPU. Isolation kiểm soát mức độ mà các thay đổi chưa commit hoặc đang chạy được phép nhìn thấy lẫn nhau. Nếu thiếu cách ly, 4 dị thường kinh điển sẽ tàn phá hệ thống: (1) Đọc bẩn (Dirty Read): Tx1 sửa dòng trong RAM; Tx2 đọc dòng đó; Tx1 bị abort. Tx2 đã xử lý dựa trên dữ liệu ảo chưa từng tồn tại! (2) Đọc không lặp lại (Non-Repeatable Read): Tx1 đọc một dòng; Tx2 sửa dòng đó và commit; Tx1 đọc lại đúng dòng đó trong cùng phiên thì thấy giá trị bị biến đổi. (3) Đọc bóng ma (Phantom Read): Tx1 quét một dải dữ liệu (WHERE status = "PENDING"); Tx2 chèn thêm dòng thứ 11 và commit; Tx1 quét lại dải đó thì thấy xuất hiện thêm một dòng "bóng ma" từ trên trời rơi xuống. (4) Lệch ghi (Write Skew): Hai giao dịch cùng đọc một vùng dữ liệu chung, cùng thấy an toàn (như số bác sĩ trực >= 1), rồi mỗi bên sửa một dòng tách biệt nhau (Alice xin nghỉ, Bob xin nghỉ), dẫn đến vi phạm bất biến toàn cục (kết quả còn 0 bác sĩ trực!). Chuẩn ANSI SQL chia thành 4 cấp độ: Read Uncommitted, Read Committed, Repeatable Read và Serializable. Trong các CSDL hiện đại, Repeatable Read được cài đặt bằng Snapshot Isolation (ảnh chụp thời điểm MVCC), còn Serializable được bảo vệ bằng SSI (PostgreSQL theo dõi chu trình đọc-ghi) hoặc Next-Key Lock (MySQL InnoDB khóa khoảng trống index gap).'
      },
      {
        en: '4. Durability (D) — Crash-Proof Persistence & The WAL Invariant: Durability is the mathematical guarantee that once a transaction receives a successful COMMIT acknowledgement, its mutations are permanently recorded in non-volatile storage and will NEVER be lost, even if an electrical power blackout, OS kernel panic, or server crash strikes milliseconds later. How database engines guarantee this physically: (A) The Write-Ahead Logging (WAL) Protocol: Flushing full 8KB/16KB dirty data pages from RAM to table files on every commit would require devastating random disk I/O. Instead, the engine appends compact binary delta records into a sequential Write-Ahead Log (WAL / Redo Log). The fundamental WAL Invariant enforces: Page.LSN <= Flushed_to_Disk_LSN. A dirty page is NEVER written to tablespace disk until its corresponding WAL log record has been safely flushed! (B) The Operating System fsync() Barrier: Standard disk writes only place data into the OS kernel page cache. Durability requires executing an explicit fsync() or fdatasync() system call, forcing disk controller caches to flush to physical non-volatile NAND flash sectors. (C) Group Commit: To prevent thousands of transactions from stalling on millisecond fsync() calls, database engines batch concurrent commit requests, executing a single fsync() for dozens of transactions simultaneously. (D) Single-Node Durability vs Distributed High Availability: Single-node Durability (WAL + fsync) protects against local power trips. Distributed Durability (Raft/Paxos replication) protects against physical datacenter fires and hardware destruction.',
        vi: '4. Tính Bền Vững (Durability - D) — Lưu Trữ Bất Tử & Bất Biến WAL: Durability là cam kết toán học bảo đảm rằng một khi giao dịch đã nhận được phản hồi COMMIT thành công từ CSDL, toàn bộ dữ liệu đã sửa đổi được ghi nhận vĩnh viễn vào bộ nhớ không biến đổi và TUYỆT ĐỐI KHÔNG BAO GIỜ BỊ MẤT, kể cả khi máy chủ bị mất điện đột ngột, sập nhân hệ điều hành hay cháy nổ phần cứng chỉ sau đó một mili-giây. Cách nhân CSDL cài đặt vật lý: (A) Giao thức Ghi trước Nhật ký (WAL): Xả các trang dữ liệu 8KB/16KB từ RAM xuống đĩa mỗi khi commit đòi hỏi I/O ngẫu nhiên cực chậm. Thay vào đó, engine nối các bản ghi delta nhị phân siêu tinh gọn vào một tệp nhật ký tuần tự (WAL trong Postgres, Redo Log trong MySQL). Bất biến WAL cốt lõi quy định: Page.LSN <= Flushed_to_Disk_LSN. Một trang bẩn TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP xả xuống file bảng cho tới khi bản ghi WAL tương ứng đã được ghi an toàn xuống đĩa! (B) Rào Chắn Lệnh Hệ Điều Hành fsync(): Lệnh ghi đĩa thông thường chỉ đẩy dữ liệu vào page cache của nhân HĐH. Tính bền vững bắt buộc phải gọi lệnh hệ thống fsync() hoặc fdatasync() để ép toàn bộ bộ đệm phần cứng xả dữ liệu xuống các chip nhớ NAND flash vật lý. (C) Gom Nhóm Commit (Group Commit): Để chống việc hàng ngàn giao dịch bị nghẽn vì phải chờ lệnh fsync() tốn 1ms, database gom hàng chục giao dịch commit cùng lúc lại và gọi duy nhất một lần fsync(). (D) Bền Vững Đơn Node vs Bền Vững Phân Tán: Bền vững đơn node (WAL + fsync) chống sập nguồn máy chủ tại chỗ. Bền vững phân tán (sao chép đồng thuận Raft/Paxos) chống lại thảm họa sập toàn bộ trung tâm dữ liệu.'
      },
      {
        en: '5. The ACID Engine Implementation Matrix (PostgreSQL vs MySQL InnoDB): (1) Atomicity: PostgreSQL records commit/abort status bits in pg_xact; aborted transactions leave dead tuples for VACUUM. MySQL InnoDB writes before-images to Undo Log segments in undo tablespaces, physically rolling back clustered index records on abort. (2) Consistency: Both enforce PK, FK, CHECK, and UNIQUE. PostgreSQL supports DEFERRABLE constraints evaluated at COMMIT. MySQL checks constraints immediately per row. (3) Isolation: PostgreSQL uses append-only MVCC snapshots (xmin:xmax:xip_list) for Read Committed and Repeatable Read, and SSI for Serializable. MySQL InnoDB uses in-place clustered index updates with Undo chains for MVCC, and Next-Key Locking (Record + Gap Locks) for 2PL/Repeatable Read. (4) Durability: PostgreSQL uses WAL files (pg_wal) with LSN tracking and Full Page Writes (FPW). MySQL InnoDB uses circular Redo Logs (ib_logfile) with a physical Doublewrite Buffer to prevent torn pages.',
        vi: '5. Ma Trận Triển Khai ACID Giữa Hai Động Cơ Đầu Ngành (PostgreSQL vs MySQL InnoDB): (1) Atomicity (A): PostgreSQL lưu cờ trạng thái commit/abort trong pg_xact; giao dịch abort biến dòng thành dead tuple cho VACUUM dọn. MySQL InnoDB ghi ảnh gốc vào Undo Log segment trong undo tablespace, lần ngược để sửa lại dòng trên clustered index khi rollback. (2) Consistency (C): Cả hai đều kiểm soát chặt PK, FK, CHECK, UNIQUE. Postgres hỗ trợ ràng buộc DEFERRABLE kiểm tra lúc bấm COMMIT. MySQL kiểm tra ngay lập tức trên từng dòng. (3) Isolation (I): PostgreSQL dùng MVCC snapshot trên bảng heap cho Read Committed và Repeatable Read, và giải thuật SSI cho Serializable. MySQL InnoDB sửa trực tiếp tại chỗ kết hợp chuỗi con trỏ Undo cho MVCC, và dùng Next-Key Lock (Record Lock + Gap Lock) để chống Phantom. (4) Durability (D): PostgreSQL dùng dòng WAL (pg_wal) với số hiệu LSN và Full Page Writes (FPW). MySQL InnoDB dùng vòng Redo Log (ib_logfile) kết hợp bộ đệm Doublewrite Buffer để chống rách trang khi mất điện.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Relying on Default Isolation Levels Across Databases: PostgreSQL defaults to Read Committed, while MySQL InnoDB defaults to Repeatable Read! Code written for MySQL assuming repeatable queries will silently experience Non-Repeatable Reads and statement-level snapshot changes when ported to PostgreSQL unless explicitly configured.',
        vi: 'Ngộ nhận Cấp độ Cách ly Mặc định Giữa Các CSDL: PostgreSQL mặc định là Read Committed, trong khi MySQL InnoDB mặc định là Repeatable Read! Ứng dụng viết cho MySQL tưởng rằng các truy vấn đọc luôn lặp lại nhất quán sẽ bị lỗi Non-Repeatable Read khi chuyển sang PostgreSQL trừ khi được cấu hình tường minh.'
      },
      {
        en: 'Disabling fsync (fsync = off) to artificially boost benchmark throughput: Some teams set fsync = off or innodb_flush_log_at_trx_commit = 0 in production to achieve 100,000 TPS. On the first unexpected electrical outage or server reboot, the database suffers irreversible page corruption and total loss of recent committed transactions, violating the "D" in ACID.',
        vi: 'Tắt Lệnh fsync (fsync = off) Để Gian Lận Benchmark: Một số đội ngũ tắt fsync = off hoặc đặt innodb_flush_log_at_trx_commit = 0 để đạt 100.000 TPS. Khi máy chủ đột ngột mất điện hoặc kernel panic, CSDL sẽ bị hỏng trang đĩa vĩnh viễn và mất sạch các giao dịch vừa commit, phá vỡ hoàn toàn chữ "D" trong ACID.'
      },
      {
        en: 'Confusing ACID Consistency with CAP Theorem Consistency: Microservice architects who assume an "ACID-compliant" distributed database automatically provides CAP linearizable reads across geographic regions often suffer stale read anomalies due to asynchronous replication lag.',
        vi: 'Nhầm lẫn Tính Nhất Quán ACID Với Nhất Quán Trong Định Lý CAP: Các kiến trúc sư microservice tưởng rằng CSDL có chứng chỉ "ACID" sẽ tự động có tính nhất quán CAP (Linearizability) trên toàn cầu thường gặp phải thảm họa đọc dữ liệu cũ do độ trễ sao chép bất đồng bộ giữa các vùng.'
      }
    ]
  },

  steps: [
    {
      id: 'atomicity-undo',
      title: { en: '1. Atomicity: In-Memory Modification & Undo Log / Status Bit', vi: '1. Atomicity: Sửa đổi trong RAM & Ghi Undo Log / Cờ Trạng Thái' },
      phase: 'ATOMICITY_PHASE',
      description: {
        en: 'Engine records before-image delta in Undo Log (InnoDB) or sets t_xmin in new heap tuple (Postgres). If error occurs, ROLLBACK reverts changes completely.',
        vi: 'Engine ghi lại delta ảnh gốc vào Undo Log (InnoDB) hoặc gắn t_xmin vào tuple mới (Postgres). Nếu có lỗi, ROLLBACK hoàn tác dữ liệu 100% về nguyên trạng.'
      },
      diskIoBehavior: {
        en: 'Writes undo delta to memory buffer. On abort, walks undo chain or marks transaction ABORTED in pg_xact.',
        vi: 'Ghi delta undo vào bộ đệm RAM. Khi abort, lần ngược chuỗi undo hoặc đánh dấu ABORTED trong pg_xact.'
      },
      javaCodeLineMatch: 'transactionManager.rollback(status); // Reverts all partial statements'
    },
    {
      id: 'consistency-isolation',
      title: { en: '2. Consistency & Isolation: Invariants & MVCC Snapshot', vi: '2. Consistency & Isolation: Kiểm tra Ràng buộc & Chụp Snapshot MVCC' },
      phase: 'ISOLATION_CONSISTENCY_PHASE',
      description: {
        en: 'Database evaluates schema constraints (CHECK balance >= 0, FK) and captures point-in-time Snapshot, isolating reads from concurrent dirty updates.',
        vi: 'CSDL đánh giá các ràng buộc schema (CHECK balance >= 0, FK) và chụp Snapshot thời điểm, cô lập luồng đọc khỏi các thay đổi chưa commit.'
      },
      diskIoBehavior: {
        en: 'Reads catalog constraint definitions and traverses visible tuple versions without acquiring shared read locks.',
        vi: 'Đọc ràng buộc từ catalog và duyệt phiên bản tuple hiển thị mà không cần giữ khóa đọc chia sẻ.'
      },
      javaCodeLineMatch: '@Transactional(isolation = Isolation.REPEATABLE_READ)'
    },
    {
      id: 'durability-wal',
      title: { en: '3. Durability: Sequential WAL Flush & fsync Commit', vi: '3. Durability: Xả Nhật ký WAL & Gọi fsync Xác Nhận Commit' },
      phase: 'DURABILITY_PHASE',
      description: {
        en: 'On COMMIT, engine appends commit record to WAL, calls fsync() to ensure data hits non-volatile flash, and only then acknowledges success to client.',
        vi: 'Khi COMMIT, engine nối bản ghi commit vào WAL, gọi lệnh hệ thống fsync() bảo đảm dữ liệu chạm vào chip nhớ flash, rồi mới báo thành công cho client.'
      },
      diskIoBehavior: {
        en: 'Sequential append to WAL segment followed by hardware controller barrier flush (fsync).',
        vi: 'Ghi nối đuôi tuần tự vào file WAL kèm rào chắn xả bộ đệm phần cứng (fsync).'
      },
      javaCodeLineMatch: 'walChannel.force(false); // Hardware fsync guarantees durability!'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Full ACID Implementation',
      implementationName: 'Heap MVCC + pg_xact (A/I) & WAL Redo (D) & Constraints (C)',
      keyMechanism: {
        en: 'Atomicity via pg_xact commit/abort status bits. Consistency via declarative/deferrable constraints. Isolation via MVCC snapshots and SSI (Serializable Snapshot Isolation). Durability via WAL stream (pg_wal) with synchronous_commit.',
        vi: 'Atomicity qua bit trạng thái trong pg_xact. Consistency qua ràng buộc khai báo/trì hoãn. Isolation qua MVCC snapshot và thuật toán SSI. Durability qua dòng WAL với cờ synchronous_commit.'
      },
      defaultTuningConfig: 'default_transaction_isolation = "read committed", synchronous_commit = on, wal_level = replica',
      architectureNote: {
        en: 'PostgreSQL eliminates the ARIES Undo pass on crash recovery: aborted transactions simply remain marked ABORTED in pg_xact; dead tuples are reclaimed asynchronously by VACUUM.',
        vi: 'PostgreSQL loại bỏ hoàn toàn pha Undo của ARIES khi phục hồi: các giao dịch abort chỉ cần giữ cờ ABORTED trong pg_xact; dòng chết được dọn dần bởi VACUUM.'
      }
    },
    {
      engine: 'MySQL InnoDB Full ACID Implementation',
      implementationName: 'Undo Tablespace (A) & Clustered MVCC (I) & Redo Log + Doublewrite (D)',
      keyMechanism: {
        en: 'Atomicity via Undo Log segments in rollback tablespaces. Consistency via table constraints and foreign keys. Isolation via Next-Key Locking and Read Views. Durability via Redo Logs (ib_logfile) backed by the Doublewrite Buffer.',
        vi: 'Atomicity qua phân đoạn Undo Log trong rollback tablespace. Consistency qua ràng buộc bảng và khóa ngoại. Isolation qua Next-Key Lock và Read View. Durability qua Redo Log kết hợp Doublewrite Buffer.'
      },
      defaultTuningConfig: 'innodb_flush_log_at_trx_commit = 1, transaction_isolation = "REPEATABLE-READ"',
      architectureNote: {
        en: 'Setting innodb_flush_log_at_trx_commit = 1 guarantees strict Durability (1 fsync per commit). Setting it to 2 writes to OS cache every commit and flushes to disk once per second (risking 1s data loss on power crash).',
        vi: 'Đặt innodb_flush_log_at_trx_commit = 1 bảo đảm tính Bền vững tuyệt đối (1 lần fsync mỗi commit). Đặt bằng 2 chỉ ghi vào cache HĐH và xả đĩa 1 giây/lần (chấp nhận mất 1s dữ liệu khi sập nguồn).'
      }
    },
    {
      engine: 'Oracle Database (19c / 23ai)',
      implementationName: 'Multi-Version Read Consistency (Undo Tablespace & SCN)',
      keyMechanism: {
        en: 'Atomicity & Isolation via dedicated UNDO tablespaces and System Change Numbers (SCN). Statement-level and transaction-level read consistency ensures readers never block writers and writers never block readers. Durability via Log Writer (LGWR) flushing Redo Log Buffers.',
        vi: 'Atomicity & Isolation qua UNDO tablespace chuyên dụng và mã số thay đổi hệ thống (SCN). Tính nhất quán đọc ở cấp câu lệnh và giao dịch bảo đảm người đọc không chặn người ghi và người ghi không chặn người đọc. Durability qua tiến trình LGWR xả Redo Log Buffer.'
      },
      defaultTuningConfig: 'ALTER SYSTEM SET UNDO_RETENTION = 3600; ALTER SYSTEM SET COMMIT_WAIT = "WAIT";',
      architectureNote: {
        en: 'If an undo block is overwritten before a long query finishes reading past versions, Oracle throws "ORA-01555: snapshot too old". Sizing UNDO_RETENTION and undo tablespace correctly is mandatory.',
        vi: 'Nếu block undo bị ghi đè trước khi truy vấn dài đọc xong phiên bản cũ, Oracle ném lỗi kinh điển "ORA-01555: snapshot too old". Cấu hình đủ UNDO_RETENTION và dung lượng undo tablespace là bắt buộc.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Full ACID guarantees total financial and transactional correctness across unexpected crashes and concurrent load.', vi: 'Cam kết ACID đầy đủ bảo đảm tính chính xác tuyệt đối cho các hệ thống tài chính trước sự cố sập nguồn và tải đồng thời.' },
      { en: 'Decoupling A, C, I, D allows targeted hardware optimization: battery-backed NVRAM for Durability, CPU multi-versioning for Isolation.', vi: 'Tách rời A, C, I, D cho phép tối ưu hóa phần cứng có chủ đích: dùng NVRAM cho Durability, dùng CPU đa nhân cho Isolation.' }
    ],
    cons: [
      { en: 'Strict Durability (fsync on every commit) caps single-threaded write throughput to storage controller latency (~1,000 TPS).', vi: 'Tính Bền vững nghiêm ngặt (gọi fsync mỗi commit) giới hạn tốc độ ghi đơn luồng theo độ trễ ổ đĩa (khoảng 1.000 TPS).' },
      { en: 'Higher isolation levels (Serializable) introduce abort-and-retry overhead when transactions contend for the same data.', vi: 'Các cấp độ cách ly cao (Serializable) làm tăng chi phí hủy và thử lại khi nhiều giao dịch cùng tranh chấp một dữ liệu.' }
    ],
    writeAmplification: {
      en: 'Moderate to High: Durability requires sequential WAL logging; Atomicity requires Undo logging or dead tuple versions on disk.',
      vi: 'Trung bình đến Cao: Durability đòi hỏi ghi log WAL tuần tự; Atomicity đòi hỏi ghi Undo log hoặc sinh phiên bản dòng chết.'
    },
    recoveryGuarantee: {
      en: '100% Mathematical Guarantee: Committed transactions are preserved by WAL replay; uncommitted transactions are completely undone.',
      vi: 'Bảo đảm toán học 100%: Các giao dịch đã commit được tái hiện nguyên vẹn bằng WAL; các giao dịch dở dang bị hoàn tác triệt để.'
    }
  },

  springBootCode: `# ===================================================================
# Spring Boot 3.x application.yml - Full Production ACID Configuration
# ===================================================================
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/finance_db
    username: app_user
    password: secret_password
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10
      connection-timeout: 20000
      transaction-isolation: TRANSACTION_READ_COMMITTED
  jpa:
    open-in-view: false # Prevents holding database connections open in web view
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        jdbc.batch_size: 50
        order_inserts: true
        order_updates: true

---
// ===================================================================
// Enterprise Banking Service Demonstrating Full ACID Lifecycle:
// A (Rollback/Savepoint), C (Constraints), I (Pessimistic Lock), D (WAL fsync)
// ===================================================================
package com.enterprise.banking.service;

import com.enterprise.banking.entity.Account;
import com.enterprise.banking.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;

@Service
public class ComprehensiveAcidBankingService {

    private final AccountRepository accountRepository;

    public ComprehensiveAcidBankingService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * FULL ACID DEMONSTRATION:
     * - Atomicity: @Transactional ensures both debit and credit succeed, or entire transfer rolls back!
     * - Consistency: DB schema CHECK (balance >= 0) ensures no account overdraft occurs.
     * - Isolation: Pessimistic Write Lock (SELECT FOR UPDATE) eliminates Lost Updates & Write Skew.
     * - Durability: On commit return, PostgreSQL WAL has been safely fsynced to disk!
     */
    @Transactional(
        isolation = Isolation.READ_COMMITTED,
        timeout = 5,
        rollbackFor = Exception.class
    )
    public void executeFinancialTransfer(Long fromId, Long toId, BigDecimal amount) {
        // 1. ISOLATION: Acquire exclusive row-level locks in database Lock Manager
        Account from = accountRepository.findByIdForUpdate(fromId)
            .orElseThrow(() -> new IllegalArgumentException("Source account does not exist"));

        Account to = accountRepository.findByIdForUpdate(toId)
            .orElseThrow(() -> new IllegalArgumentException("Target account does not exist"));

        // 2. CONSISTENCY: Enforce application business invariant
        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Account #" + fromId + " has insufficient funds!");
        }

        // Apply state mutation S1 -> S2
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));

        accountRepository.save(from);
        accountRepository.save(to);

        // 3. ATOMICITY: Demonstration of nested SAVEPOINT for optional cashback bonus
        try {
            applyCashbackBonusNested(to, amount.multiply(new BigDecimal("0.01")));
        } catch (Exception ex) {
            // Partial rollback: cashback failure does NOT abort the primary transfer!
            System.err.println("Cashback bonus failed; primary transfer remains intact.");
        }
        // 4. DURABILITY: Method exit triggers transaction COMMIT & storage fsync barrier!
    }

    // Nested transaction uses database SAVEPOINT under the hood!
    @Transactional(propagation = Propagation.NESTED)
    public void applyCashbackBonusNested(Account target, BigDecimal bonus) {
        target.setBalance(target.getBalance().add(bonus));
        accountRepository.save(target);
    }
}`,

  sqlQueries: `-- 1. Demonstrate Full ACID Mechanics in PostgreSQL
-- [A] ATOMICITY & SAVEPOINTS: Partial rollback within transaction
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 101;
SAVEPOINT transfer_savepoint;

-- Attempt an invalid operation that fails:
UPDATE accounts SET balance = balance - 999999 WHERE id = 101; -- Suppose this errors
-- Revert only to the savepoint without aborting the entire transaction!
ROLLBACK TO SAVEPOINT transfer_savepoint;

-- Proceed with valid credit and commit atomically:
UPDATE accounts SET balance = balance + 100 WHERE id = 102;
COMMIT;

-- [C] CONSISTENCY: Enforce relational constraints and deferrable checks
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    owner_name VARCHAR(128) NOT NULL,
    balance NUMERIC(12, 2) NOT NULL,
    CONSTRAINT chk_positive_balance CHECK (balance >= 0) -- DB-enforced invariant!
);

-- Deferrable Foreign Key constraint evaluated at COMMIT rather than per statement:
ALTER TABLE transaction_entries 
ADD CONSTRAINT fk_account 
FOREIGN KEY (account_id) REFERENCES accounts(id) 
DEFERRABLE INITIALLY DEFERRED;

-- [I] ISOLATION: Prevent concurrency anomalies via row locks or SSI
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT id, balance FROM accounts WHERE id = 101 FOR UPDATE;

-- [D] DURABILITY: Verify WAL sync guarantees
SHOW synchronous_commit; -- Should be 'on' or 'remote_apply' for zero data loss
SHOW checkpoint_timeout;  -- Paced checkpoint duration`,

  javaCode: `package com.database.internals.acid;

import java.util.*;

/**
 * Pure Java 21 implementation demonstrating the Four Pillars of ACID:
 * - A: Atomicity via Undo Stack Rollback & Savepoints
 * - C: Consistency via Invariant Validator checks
 * - I: Isolation via Point-in-time Snapshot isolation
 * - D: Durability via Append-Only WAL Flush simulation
 */
public class FullACIDEngine {

    public record Account(long id, String owner, int balance) {}

    // Durable storage simulation
    private final Map<Long, Account> committedStorage = new HashMap<>();
    private final List<String> writeAheadLog = new ArrayList<>();

    public FullACIDEngine() {
        committedStorage.put(1L, new Account(1L, "Alice", 1000));
        committedStorage.put(2L, new Account(2L, "Bob", 500));
    }

    public static class TransactionContext {
        final long txId;
        final Map<Long, Account> uncommittedState = new HashMap<>();
        final Stack<Map<Long, Account>> undoStack = new Stack<>();
        final Map<String, Stack<Map<Long, Account>>> savepoints = new HashMap<>();

        public TransactionContext(long txId, Map<Long, Account> snapshot) {
            this.txId = txId;
            this.uncommittedState.putAll(snapshot);
        }

        public void markSavepoint(String name) {
            Stack<Map<Long, Account>> spUndo = new Stack<>();
            spUndo.addAll(undoStack);
            savepoints.put(name, spUndo);
        }

        public void rollbackToSavepoint(String name) {
            if (!savepoints.containsKey(name)) {
                throw new IllegalArgumentException("Unknown savepoint: " + name);
            }
            // Restore state to savepoint
            System.out.printf("  [Atomicity] Rolling back to savepoint: %s%n", name);
        }
    }

    // 1. ATOMICITY & CONSISTENCY: Transfer with invariant verification
    public boolean executeTransfer(long fromId, long toId, int amount) {
        long txId = System.currentTimeMillis();
        System.out.printf("=== Starting Transaction Tx#%d: Transfer $%d from #%d to #%d ===%n",
            txId, amount, fromId, toId);

        // [I] ISOLATION: Capture snapshot
        TransactionContext tx = new TransactionContext(txId, committedStorage);

        Account from = tx.uncommittedState.get(fromId);
        Account to = tx.uncommittedState.get(toId);

        // Record Undo before mutation [A - Atomicity]
        tx.undoStack.push(Map.of(fromId, from, toId, to));

        // Mutate state
        Account newFrom = new Account(from.id(), from.owner(), from.balance() - amount);
        Account newTo = new Account(to.id(), to.owner(), to.balance() + amount);

        tx.uncommittedState.put(fromId, newFrom);
        tx.uncommittedState.put(toId, newTo);

        // [C] CONSISTENCY CHECK: Enforce schema invariant (balance >= 0)
        if (newFrom.balance() < 0) {
            System.err.printf("  [Consistency VIOLATION] Balance of #%d cannot be negative (%d)!%n",
                fromId, newFrom.balance());
            System.out.println("  [Atomicity] ABORTING & ROLLING BACK transaction!");
            // Restore from undo stack
            tx.undoStack.pop();
            return false;
        }

        // [D] DURABILITY: Flush WAL before updating committed storage
        String walRecord = String.format("LSN:%d Tx:%d COMMIT Transfer %d -> %d ($%d)",
            writeAheadLog.size() + 1, txId, fromId, toId, amount);
        writeAheadLog.add(walRecord);
        System.out.printf("  [Durability] WAL record safely fsynced to disk: %s%n", walRecord);

        // Apply to persistent storage
        committedStorage.put(fromId, newFrom);
        committedStorage.put(toId, newTo);
        System.out.printf("  [Commit Success] Alice: $%d, Bob: $%d%n",
            committedStorage.get(fromId).balance(), committedStorage.get(toId).balance());
        return true;
    }

    public static void main(String[] args) {
        FullACIDEngine engine = new FullACIDEngine();

        // Test 1: Valid transfer (Satisfies A, C, I, D)
        engine.executeTransfer(1L, 2L, 300);

        System.out.println();

        // Test 2: Invalid transfer exceeding balance (Violates C -> Triggers A rollback)
        engine.executeTransfer(1L, 2L, 5000);
    }
}
`,
};
