import type { DatabaseTopic } from '../types';

export const latchesLocksConcurrency: DatabaseTopic = {
  id: 'latches-locks-concurrency',
  category: 'concurrency-tx',
  name: 'Latches, Locks & Physical Concurrency Control',
  tagline: {
    en: 'Deconstructing the fundamental architectural divide: Locks (transaction isolation) vs Latches (in-memory physical data structure protection), LWLocks, and lock escalation.',
    vi: 'Phân định ranh giới kiến trúc cốt lõi: Khóa Lock (bảo vệ logic giao dịch) vs Chốt Latch (bảo vệ cấu trúc dữ liệu trong RAM), Lightweight Locks và sự leo thang khóa.'
  },
  difficulty: 3,
  order: 17,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Engineers frequently conflate Locks and Latches. If a database engine used transactional Locks (with full deadlock-detection graphs and rollback metadata) to protect in-memory pointer swaps in B-Tree internal nodes, throughput would drop by 99% due to lock manager mutex thrashing. Conversely, using lightweight OS mutexes for row isolation would fail when transactions hold rows across network user think-times.',
      vi: 'Lập trình viên thường xuyên nhầm lẫn giữa Lock (Khóa giao dịch) và Latch (Chốt vật lý). Nếu CSDL dùng Lock giao dịch (với đồ thị phát hiện deadlock và metadata rollback) chỉ để bảo vệ việc đổi con trỏ trong RAM của một nút B-Tree, thông lượng hệ thống sẽ tụt 99% do nghẽn Mutex của Lock Manager. Ngược lại, nếu dùng Mutex HĐH để cách ly dòng dữ liệu, hệ thống sẽ sụp đổ khi giao dịch giữ khóa qua các khoảng chờ mạng của người dùng.'
    },
    hardwareConstraint: {
      en: 'CPU cache-coherency protocols (MESI/MOESI) incur heavy bus penalties when multiple CPU cores contend on shared memory cache lines holding lock structures. Latches must execute atomic compare-and-swap (CAS) instructions in nanoseconds, whereas Locks must persist in shared memory hash tables across minutes.',
      vi: 'Giao thức nhất quán bộ đệm CPU (MESI/MOESI) chịu hình phạt rất nặng về băng thông bus khi nhiều nhân CPU cùng tranh chấp trên một dòng cache nhớ chứa cấu trúc khóa. Latch bắt buộc phải thực thi bằng lệnh nguyên tử Compare-And-Swap (CAS) trong vài nano-giây, trong khi Lock phải tồn tại bền vững trong bảng băm bộ nhớ chia sẻ suốt nhiều phút.'
    },
    fundamentalSolution: {
      en: 'Database architectures enforce a strict dual synchronization hierarchy: (1) Latches (PostgreSQL LWLocks, InnoDB Mutexes/rw-locks): short-lived (microseconds), protecting in-memory physical data structures (Buffer Pool frames, B-Tree pages), with zero deadlock detection; (2) Locks: long-lived (duration of transaction), protecting logical relational entities (tables, rows, predicates), governed by the Lock Manager with automated Wait-For Graph deadlock detection.',
      vi: 'Kiến trúc CSDL áp dụng phân cấp đồng bộ kép nghiêm ngặt: (1) Chốt Latch (LWLocks trong Postgres, Mutex/rw-locks trong InnoDB): thời gian sống cực ngắn (micro-giây), bảo vệ cấu trúc dữ liệu vật lý trong RAM (khung nhớ Buffer Pool, trang B-Tree), hoàn toàn không có bộ phát hiện deadlock; (2) Khóa Lock: thời gian sống dài (suốt thời gian chạy giao dịch), bảo vệ thực thể logic (bảng, dòng, vị từ), quản lý bởi Lock Manager với đồ thị Wait-For Graph tự động phát hiện deadlock.'
    },
    math: {
      formula: 'T_{\\text{latch}} \\sim O(1) \\text{ [ns to } \\mu\\text{s]}, \\quad T_{\\text{lock}} \\sim O(1) \\text{ to } O(\\text{minutes}) \\text{ [transaction lifespan]}',
      description: {
        en: 'Latches operate at raw CPU memory hardware speed without transactional rollback semantics. Locks are heavy relational abstractions tracked in global lock hash tables with deadlock detection algorithms.',
        vi: 'Latch hoạt động ở tốc độ phần cứng bộ nhớ CPU thô và không có ngữ nghĩa rollback giao dịch. Lock là các trừu tượng quan hệ nặng ký được theo dõi trong bảng băm khóa toàn cục với thuật toán dò tìm chu trình deadlock.'
      },
      timeComplexity: 'Latch Acquisition: O(1) CPU atomic CAS; Lock Acquisition: O(1) Lock Hash Table probe + O(V + E) Wait-For Graph cycle check',
      spaceComplexity: 'Latch: 4 to 8 bytes embedded directly in page header; Lock: 128+ bytes per lock struct in Lock Manager shared memory',
      ioCostFormula: 'Latch I/O = 0 (Pure RAM); Lock I/O = Potential Disk Contention when write locks block background flushers'
    }
  },

  pageLayout: {
    title: {
      en: 'Dual Concurrency Architecture: Latches vs Locks Comparison Matrix',
      vi: 'Kiến trúc Đồng thời Kép: Bảng So sánh Chốt Latch vs Khóa Lock'
    },
    description: {
      en: 'Architectural separation of responsibilities between in-memory physical protection (Latches) and transactional ACID isolation (Locks).',
      vi: 'Sự phân định trách nhiệm kiến trúc giữa bảo vệ cấu trúc vật lý trong RAM (Latch) và cách ly giao dịch ACID (Lock).'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| FEATURE          | LATCH (Physical Memory Guard)  | LOCK (Transactional Guard)   |
+--------------------------------------------------------------------------+
| Primary Purpose  | Protects C memory structures   | Protects ACID Isolation      |
| Scope            | Buffer frame, B-Tree node, FSM | Table, Row, Page, Predicate  |
| Typical Duration | Microseconds (during read/write| Duration of Transaction (sec)|
| Implementation   | Atomic CAS, futex, rw-lock     | Lock Manager Hash Table      |
| Deadlock Detect  | NONE (Code order discipline!)  | YES (Wait-For Graph cycle)   |
| User Visibility  | Hidden inside DB engine internals| Visible in pg_locks / SHOW  |
| Memory Overhead  | Tiny (4-8 bytes in page header)| Heavy (128+ bytes per lock)  |
+--------------------------------------------------------------------------+
| PHYSICAL MEMORY INTERACTION:                                             |
|                                                                          |
|  Transaction A (holds Row Lock on orders#101 in Lock Manager)             |
|    |                                                                     |
|    +--> Wants to read Row #101 inside Buffer Page #45                    |
|           |                                                              |
|           +--> Acquires Shared LATCH on Page #45 (15 nanoseconds)        |
|           +--> Copies tuple bytes to private backend memory              |
|           +--> Releases Shared LATCH on Page #45 (immediately!)          |
|                                                                          |
|  Transaction A STILL HOLDS the Row Lock on orders#101 until COMMIT!      |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'lwLock / Mutex', size: '4 - 8 Bytes', description: { en: 'Embedded atomic integer manipulated via atomic CAS instructions', vi: 'Số nguyên nguyên tử nhúng trực tiếp trong header trang, thao tác bằng lệnh atomic CAS' } },
      { name: 'LOCK / PROCLOCK', size: '128 Bytes', description: { en: 'Shared memory lock table entry linking transaction, relation, and granted modes', vi: 'Bản ghi trong bảng băm Lock Manager chia sẻ nối giữa transaction, quan hệ và loại khóa' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'One of the most critical conceptual divides in database kernel architecture is the distinction between Latches and Locks. In database literature and source code (such as the PostgreSQL and MySQL InnoDB engines), the terms "Lock" and "Latch" denote entirely different mechanisms serving orthogonal purposes: Locks protect logical database contents (such as entire tables or individual rows) for the duration of a transaction to maintain ACID isolation, whereas Latches protect physical in-memory data structures (such as hash table buckets, B-Tree internal nodes, and buffer pool page headers) against concurrent modification by multiple threads.',
      vi: 'Một trong những ranh giới phân định quan trọng nhất trong kiến trúc nhân CSDL là sự khác biệt giữa Chốt (Latch) và Khóa (Lock). Trong tài liệu học thuật và mã nguồn CSDL (như nhân PostgreSQL và MySQL InnoDB), hai thuật ngữ "Lock" và "Latch" đại diện cho hai cơ chế hoàn toàn khác biệt phục vụ hai mục đích trực giao: Lock bảo vệ nội dung dữ liệu logic (như toàn bộ bảng hoặc từng dòng) trong suốt vòng đời của một giao dịch để duy trì tính cô lập ACID, trong khi Latch bảo vệ các cấu trúc dữ liệu vật lý trong RAM (như các bucket của bảng băm, nút nhánh cây B-Tree và header trang buffer pool) khỏi sự tranh chấp ghi đè của các luồng CPU đồng thời.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Architectural Divide: Lock vs Latch Deep Dive: (1) What they protect: A Lock protects user-visible database entities (a Row, a Page, or a Table). A Latch protects in-memory C data structures (a buffer pool descriptor, an array, a pointer). (2) Duration: A Lock is held for the duration of a transaction (often hundreds of milliseconds to minutes until COMMIT or ROLLBACK). A Latch is held for mere microseconds—just long enough for a thread to read or update a memory address, after which it is released immediately! (3) Deadlock Handling: Locks have complex deadlock detection engines (Wait-For Graphs) that automatically detect circular waits and abort victim transactions. Latches have NO deadlock detection; developers writing database engine code must strictly enforce a global latch acquisition hierarchy to avoid hard deadlocks.',
        vi: '1. Phân Định Kiến Trúc Cốt Lõi: Lock vs Latch: (1) Đối tượng bảo vệ: Lock bảo vệ thực thể dữ liệu logic mà người dùng nhìn thấy (một Dòng, một Trang, hoặc một Bảng). Latch bảo vệ các cấu trúc dữ liệu C trong RAM (con trỏ frame bộ đệm, mảng, biến liên kết). (2) Thời gian sống: Lock được giữ trong suốt vòng đời của giao dịch (từ hàng trăm mili-giây đến nhiều phút cho tới khi COMMIT/ROLLBACK). Latch chỉ được giữ trong vài micro-giây—đủ để luồng đọc hoặc cập nhật xong một địa chỉ bộ nhớ rồi lập tức giải phóng ngay! (3) Cơ chế xử lý Deadlock: Lock có bộ phát hiện deadlock phức tạp (đồ thị Wait-For Graph) tự động phát hiện chu trình chờ và hủy giao dịch nạn nhân. Latch HOÀN TOÀN KHÔNG CÓ bộ phát hiện deadlock; lập trình viên nhân CSDL bắt buộc phải tuân thủ nghiêm ngặt thứ tự xin chốt toàn cục để không làm treo chết nhân hệ thống.'
      },
      {
        en: '2. Lightweight Locks (LWLocks in PostgreSQL): PostgreSQL divides in-memory physical locks into Spinlocks and Lightweight Locks (LWLocks). Spinlocks are busy-wait atomic CPU loops used for protecting tiny critical sections (under 10 instructions). LWLocks (Lightweight Locks) provide shared (read) and exclusive (write) access to shared memory data structures. When a backend worker wishes to read a page from the buffer pool, it acquires an LWLock in shared mode on the buffer header, pins the buffer, copies the target tuple, and immediately releases the LWLock. If a write thread is currently writing to the page, waiting threads sleep on OS futex semaphores until awakened.',
        vi: '2. Khóa Trọng Lượng Nhẹ (LWLocks trong PostgreSQL): PostgreSQL chia các chốt vật lý trong RAM thành Spinlock và Lightweight Lock (LWLock). Spinlock là vòng lặp bận (busy-wait) sử dụng lệnh CPU nguyên tử để bảo vệ các vùng găng cực ngắn (dưới 10 lệnh CPU). LWLock cung cấp hai chế độ chia sẻ (Shared - đọc) và độc quyền (Exclusive - ghi) trên các cấu trúc bộ nhớ chia sẻ. Khi một tiến trình con muốn đọc một trang từ buffer pool, nó xin một LWLock ở chế độ Shared trên header của trang, ghim trang (pin), sao chép dữ liệu tuple, rồi giải phóng ngay lập tức LWLock. Nếu có luồng đang sửa trang, các luồng chờ sẽ ngủ trên futex của hệ điều hành cho tới khi được đánh thức.'
      },
      {
        en: '3. Transactional Lock Hierarchy: Row, Page, Table & Predicate Locks: Transactional Locks are managed by the Lock Manager in shared memory: (1) Row Locks: Protect individual tuples (e.g. SELECT FOR UPDATE or UPDATE). InnoDB stores row locks as bitmap bits in memory lock structures; PostgreSQL does not even store granted row locks in RAM—it sets the t_xmax field directly in the physical tuple header! (2) Table Locks: Protect entire relations against concurrent schema mutations (AccessExclusiveLock vs AccessShareLock). (3) Predicate Locks: Used in Serializable Snapshot Isolation (SSI); instead of locking existing rows, predicate locks lock mathematical search boundaries (e.g. WHERE age BETWEEN 20 AND 30) to prevent Phantom Inserts.',
        vi: '3. Phân Cấp Khóa Giao Dịch: Row Lock, Page Lock, Table Lock & Predicate Lock: Khóa giao dịch được điều phối bởi Lock Manager trong bộ nhớ chia sẻ: (1) Khóa Dòng (Row Lock): Bảo vệ từng tuple riêng lẻ (như khi chạy SELECT FOR UPDATE hoặc UPDATE). InnoDB lưu khóa dòng dưới dạng các bit trong cấu trúc khóa RAM; PostgreSQL thậm chí không lưu khóa dòng đã cấp trong RAM—nó ghi thẳng mã TxID vào trường t_xmax trên header của chính dòng đó! (2) Khóa Bảng (Table Lock): Bảo vệ toàn bộ bảng khỏi các sửa đổi cấu trúc DDL (AccessExclusiveLock vs AccessShareLock). (3) Khóa Vị Từ (Predicate Lock): Dùng trong cấp độ cô lập Serializable (SSI); thay vì khóa các dòng hiện có, khóa vị từ khóa ranh giới toán học của điều kiện tìm kiếm (như WHERE age BETWEEN 20 AND 30) để chống hiện tượng chèn dòng ma (Phantom Insert).'
      },
      {
        en: '4. Lock Escalation & Why PostgreSQL Avoids It: In legacy database systems (Microsoft SQL Server), when a query modifies more than a threshold of rows (e.g., 5,000 row locks), the lock manager runs out of lock memory. It triggers Lock Escalation: converting 5,000 fine-grained row locks into a single coarse-grained exclusive Table Lock! This instantly freezes all concurrent queries on that table. In contrast, PostgreSQL was architected to NEVER escalate locks! Because PostgreSQL row locks are recorded directly inside tuple headers on disk pages (via t_xmax and t_infomask bits), PostgreSQL can hold 50,000,000 row locks without consuming a single additional byte of shared RAM memory.',
        vi: '4. Hiện Tượng Leo Thang Khóa (Lock Escalation) & Vì Sao PostgreSQL Không Bị: Trong các CSDL truyền thống (như MS SQL Server), khi một truy vấn sửa đổi vượt quá một ngưỡng số dòng (khoảng 5.000 dòng), Lock Manager bị cạn kiệt bộ nhớ RAM. Nó kích hoạt Leo Thang Khóa: gom 5.000 khóa dòng mịn thành duy nhất một Khóa Bảng độc quyền thô (Exclusive Table Lock)! Điều này lập tức phong tỏa toàn bộ các truy vấn khác trên bảng. Ngược lại, PostgreSQL được thiết kế để TUYỆT ĐỐI KHÔNG BAO GIỜ leo thang khóa! Do khóa dòng của Postgres được lưu trực tiếp ngay trong header của tuple trên đĩa (qua t_xmax và t_infomask), Postgres có thể giữ tới 50 triệu khóa dòng mà không tốn thêm một byte RAM bộ nhớ chia sẻ nào.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Buffer Mapping LWLock Saturation on Read-Heavy Flash Sales: When thousands of concurrent client threads simultaneously query cached table pages, extreme contention on the BufferMapping partition LWLocks degrades CPU performance due to spinlock and futex sleep storms. Mitigation: increase the number of buffer pool hash partitions or configure shared_buffers appropriately.',
        vi: 'Nghẽn Chốt LWLock Buffer Mapping Khi Đọc Tải Cực Cao: Khi hàng nghìn luồng cùng lúc truy vấn các trang trong buffer pool, sự tranh chấp dữ dội trên các phân vùng chốt LWLock của Buffer Mapping làm tụt hiệu năng CPU do bão ngủ futex và spinlock. Giải pháp: tăng số phân vùng băm của buffer pool hoặc cấu hình lại dung lượng shared_buffers hợp lý.'
      },
      {
        en: 'Accidental Table-Level Lock Contention in Migrations: Executing ALTER TABLE orders ADD COLUMN status_code VARCHAR(10) DEFAULT "OK" on legacy database engines acquires an AccessExclusiveLock, blocking all SELECT and INSERT queries for minutes while rewriting table pages. In modern databases, add nullable columns or avoid rewrites via default optimizations.',
        vi: 'Tranh Chấp Khóa Cấp Bảng Khi Migration Dữ Liệu: Chạy ALTER TABLE orders ADD COLUMN ... với giá trị mặc định trên các engine cũ sẽ xin khóa AccessExclusiveLock, chặn đứng toàn bộ các lệnh SELECT và INSERT suốt nhiều phút trong lúc ghi lại các trang đĩa. Trong các phiên bản hiện đại, nên thêm cột cho phép NULL hoặc tận dụng cơ chế tối ưu giá trị mặc định không ghi lại đĩa.'
      },
      {
        en: 'Application Deadlocks from Inconsistent Row Lock Acquisition Ordering: If Thread 1 updates Account A then Account B, while Thread 2 updates Account B then Account A, both transactions deadlock. The database deadlock detector must abort one of the transactions. Solution: Always acquire row locks in deterministic ascending order of primary key (ORDER BY id).',
        vi: 'Deadlock Ứng Dụng Do Thứ Tự Xin Khóa Dòng Bất Nhất: Nếu Luồng 1 cập nhật Tài khoản A rồi đến B, trong khi Luồng 2 cập nhật B rồi đến A, cả hai sẽ rơi vào thế kẹt Deadlock. Database buộc phải hy sinh hủy một giao dịch. Giải pháp: Luôn xin khóa các dòng theo thứ tự tăng dần của khóa chính (ORDER BY id).'
      }
    ]
  },

  steps: [
    {
      id: 'acquire-latch',
      title: { en: 'Acquire In-Memory Physical Latch (LWLock)', vi: 'Xin Chốt Vật lý Bộ nhớ RAM (LWLock)' },
      phase: 'Physical Memory Guard',
      description: {
        en: 'Thread executes atomic CAS instruction on buffer header to acquire Shared Latch before reading page.',
        vi: 'Luồng thực thi lệnh CPU nguyên tử CAS trên header trang để xin chốt Shared Latch trước khi đọc trang.'
      },
      diskIoBehavior: { en: 'Pure nanosecond CPU register operation; zero disk I/O.', vi: 'Thao tác thanh ghi CPU trong vài nano-giây; 0% I/O đĩa.' },
      javaCodeLineMatch: 'bufferLatch.acquireShared();'
    },
    {
      id: 'evaluate-lock',
      title: { en: 'Acquire Transactional Lock (Lock Manager)', vi: 'Xin Khóa Giao dịch (Lock Manager)' },
      phase: 'Logical Transaction Guard',
      description: {
        en: 'Register row lock in shared memory Lock Table; check Wait-For Graph for circular deadlocks.',
        vi: 'Đăng ký khóa dòng vào Bảng Khóa RAM; kiểm tra đồ thị Wait-For Graph xem có chu trình deadlock không.'
      },
      diskIoBehavior: { en: 'In-memory lock hash table lookup; blocks thread if conflict exists.', vi: 'Tra cứu bảng băm khóa trong RAM; chặn luồng nếu có tranh chấp.' },
      javaCodeLineMatch: 'lockManager.acquireRowLock(txId, rowKey, LockMode.EXCLUSIVE);'
    },
    {
      id: 'release-latch',
      title: { en: 'Release Physical Latch & Retain Lock', vi: 'Giải phóng Chốt Latch & Giữ Khóa Lock' },
      phase: 'De-latch Phase',
      description: {
        en: 'Release physical memory latch immediately after copying tuple; retain transactional lock until COMMIT.',
        vi: 'Nhả chốt vật lý Latch ngay sau khi sao chép xong tuple; tiếp tục giữ khóa giao dịch Lock cho tới khi COMMIT.'
      },
      diskIoBehavior: { en: 'Latch released in microseconds; Row Lock persists until transaction end.', vi: 'Latch nhả sau micro-giây; Khóa dòng duy trì tới hết giao dịch.' },
      javaCodeLineMatch: 'bufferLatch.releaseShared(); // Lock remains held until tx.commit()!'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Lock Subsystem',
      implementationName: 'LWLocks (Physical) & Lock Manager with Tuple Headers (Logical)',
      keyMechanism: {
        en: 'LWLocks protect shared memory structures (BufferMapping, WALInsertLock). Row locks are physically recorded in tuple headers (t_xmax), avoiding lock escalation and saving shared RAM.',
        vi: 'LWLock bảo vệ các cấu trúc bộ nhớ chia sẻ. Khóa dòng được ghi trực tiếp vào header của dòng trên đĩa (t_xmax), triệt tiêu hoàn toàn hiện tượng leo thang khóa và tiết kiệm RAM.'
      },
      defaultTuningConfig: 'deadlock_timeout = 1s, max_locks_per_transaction = 64',
      architectureNote: {
        en: 'PostgreSQL only checks the Wait-For Graph for deadlocks after deadlock_timeout (default 1s) has elapsed, preventing expensive graph cycle checks on normal short locks.',
        vi: 'PostgreSQL chỉ kích hoạt thuật toán tìm chu trình Deadlock sau khi hết khoảng thời gian deadlock_timeout (1s), tránh làm chậm CPU khi các khóa chỉ chờ nhau trong chốc lát.'
      }
    },
    {
      engine: 'MySQL InnoDB Lock Engine',
      implementationName: 'InnoDB Mutexes/rw-locks & Lock System Bitmaps',
      keyMechanism: {
        en: 'InnoDB uses sync0sync mutexes/rw-locks for latches. Transactional row locks are stored as memory bitmap records grouped by page in the global lock system hash table.',
        vi: 'InnoDB dùng mutex/rw-lock cho latch vật lý. Khóa dòng giao dịch được lưu dưới dạng bitmap trong RAM gom theo từng trang trong bảng băm khóa toàn cục.'
      },
      defaultTuningConfig: 'innodb_lock_wait_timeout = 50s, innodb_deadlock_detect = ON',
      architectureNote: {
        en: 'Under extreme high-concurrency write workloads, disabling innodb_deadlock_detect can prevent CPU saturation from lock search graph traversals, relying instead on timeout.',
        vi: 'Ở tải ghi đồng thời cực cao, tắt innodb_deadlock_detect có thể cứu CPU khỏi bị nghẽn do duyệt đồ thị khóa, thay vào đó dựa vào thời gian timeout.'
      }
    },
    {
      engine: 'Oracle Database (19c / 23ai)',
      implementationName: 'Interested Transaction List (ITL) & Enqueue Latches',
      keyMechanism: {
        en: 'Oracle does not use a central memory lock table for row locks! Instead, each 8KB data block header contains an Interested Transaction List (ITL). Transactions acquire an ITL slot and flag the row lock byte directly in the block. Latches/Mutexes protect SGA memory (Library Cache, Cache Buffers Chains).',
        vi: 'Oracle không dùng bảng khóa tập trung trong RAM để lưu khóa dòng! Thay vào đó, header của mỗi block dữ liệu 8KB chứa một danh sách ITL (Interested Transaction List). Giao dịch chiếm 1 slot ITL và đánh dấu cờ khóa dòng trực tiếp trong block. Latch/Mutex bảo vệ bộ nhớ vùng SGA (Library Cache, Cache Buffers Chains).'
      },
      defaultTuningConfig: 'ALTER TABLE orders INITRANS 4 MAXTRANS 255; ALTER SYSTEM SET "_mutex_spin_count" = 255;',
      architectureNote: {
        en: 'Because row locks are stored directly in data blocks without lock memory overhead, Oracle NEVER escalates locks! If INITRANS is too low under high concurrency, transactions experience "enq: TX - allocate ITL entry" wait events.',
        vi: 'Vì khóa dòng được lưu trực tiếp trong block đĩa mà không tốn RAM, Oracle TUYỆT ĐỐI KHÔNG BAO GIỜ leo thang khóa! Nếu cấu hình INITRANS quá nhỏ trong giờ cao điểm, ứng dụng sẽ gặp sự kiện chờ "enq: TX - allocate ITL entry".'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Decoupling latches from locks allows microsecond memory safety without transactional overhead.', vi: 'Tách rời latch và lock cho phép bảo vệ bộ nhớ trong micro-giây mà không tốn chi phí quản lý giao dịch.' },
      { en: 'Tuple-embedded row locks in PostgreSQL eliminate the risk of catastrophic table-level lock escalation.', vi: 'Khóa dòng nhúng thẳng vào header tuple trong Postgres loại bỏ hoàn toàn rủi ro leo thang khóa bảng.' }
    ],
    cons: [
      { en: 'Latches have no automated deadlock detection; engine code errors cause unrecoverable server hangs.', vi: 'Latch không có cơ chế phát hiện deadlock tự động; lỗi trong mã nguồn database có thể làm đơ toàn bộ server.' },
      { en: 'Extreme concurrency on shared memory pages causes cache-line bouncing on latch mutexes.', vi: 'Truy cập đồng thời quá cao trên một trang RAM gây ra hiện tượng nhảy cache-line trên mutex của latch.' }
    ],
    writeAmplification: {
      en: 'Latches cause zero write amplification; row lock acquisition in Postgres modifies the tuple header and writes a WAL marker on transaction end.',
      vi: 'Latch không gây khuếch đại ghi; khóa dòng trong Postgres sửa header của tuple và ghi nhận mốc WAL khi giao dịch kết thúc.'
    },
    recoveryGuarantee: {
      en: 'Latches are volatile in-memory constructs forgotten after a crash; locks are reconstructed from uncommitted WAL records during recovery.',
      vi: 'Latch là cấu trúc dễ biến trong RAM mất đi khi sập nguồn; lock được tái tạo từ các bản ghi WAL chưa commit trong lúc phục hồi sự cố.'
    }
  },

  springBootCode: `package com.enterprise.database.concurrency;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Enterprise Demonstration:
 * Acquiring a Transactional Pessimistic Write Lock (SELECT FOR UPDATE)
 * while explaining underlying database latch vs lock mechanics.
 */
@Repository
public interface AccountLockRepository extends JpaRepository<Account, Long> {

    // 1. Transactional Lock: Emits "SELECT ... FOR UPDATE"
    // The database acquires:
    //   - A shared LATCH for ~20ns to read the 8KB page from RAM.
    //   - A long-lived ROW LOCK in the lock manager held until @Transactional completes!
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdWithPessimisticLock(Long id);
}`,

  sqlQueries: `-- 1. Inspect Active Transactional Locks in PostgreSQL
SELECT 
    locktype, 
    relation::regclass AS table_name, 
    mode, 
    granted, 
    pid 
FROM pg_locks
WHERE pid != pg_backend_pid();

-- 2. Detect Blocked Transactions and Lock Queues
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;`,

  productionProblemCase: {
    title: {
      en: 'The Flash Sale Latch Storm: BufferMapping LWLock Saturation at 60,000 QPS',
      vi: 'Cơn Bão Chốt Latch Trong Flash Sale: Nghẽn LWLock BufferMapping Ở 60.000 QPS'
    },
    businessContext: {
      en: 'A ticket booking platform opens ticket reservations for a major stadium concert. Over 150,000 users concurrently query ticket inventory on the same top-level event record.',
      vi: 'Nền tảng bán vé mở đặt chỗ cho buổi hòa nhạc sân vận động lớn. Hơn 150.000 người dùng cùng lúc truy vấn tình trạng vé của cùng một sự kiện hàng đầu.'
    },
    problemDescription: {
      en: 'Despite having sufficient CPU cores (64 vCPUs) and all data fitting comfortably in the 128GB RAM Buffer Pool (0% disk I/O), query throughput collapsed from 60,000 queries/second down to 3,200 QPS. Query response times exploded from 2ms to 4,500ms. CPU utilization showed 95% system time (kernel spinlock waits). Developers suspected table or row lock contention, but pg_locks showed zero blocked row locks! An inspection of pg_stat_activity wait events revealed the true bottleneck: over 800 connections were stuck on WaitEventType = "LWLock", specifically wait_event = "buffer_mapping". Because all 150,000 queries were targeting the exact same 8KB buffer page, backend worker threads were thrashing on the single LWLock protecting that specific buffer pool hash bucket!',
      vi: 'Mặc dù máy chủ có tới 64 vCPU và toàn bộ dữ liệu nằm trọn vẹn trong 128GB RAM Buffer Pool (0% đọc đĩa), thông lượng truy vấn bất ngờ tụt dốc từ 60.000 QPS xuống còn 3.200 QPS. Thời gian phản hồi tăng vọt từ 2ms lên 4.500ms. Tải CPU hiển thị 95% thời gian trong chế độ hệ thống (kernel spinlock wait). Đội ngũ phát triển nghi ngờ do kẹt khóa dòng, nhưng bảng pg_locks báo cáo 0% khóa dòng bị chặn! Kiểm tra sự kiện chờ trong pg_stat_activity đã vạch trần thủ phạm thực sự: hơn 800 kết nối đang bị đứng hình ở WaitEventType = "LWLock", chi tiết là wait_event = "buffer_mapping". Vì cả 150.000 truy vấn cùng tranh nhau đọc đúng 1 trang buffer 8KB duy nhất, các luồng tiến trình backend đã dẫm chân lên nhau trên chiếc chốt LWLock bảo vệ bucket băm của trang đó trong RAM!'
    },
    whyNaiveFails: {
      en: 'Engineers attempted to scale database connection pools from 200 to 1,500 connections. This dramatically worsened the issue, increasing CPU cache-line bouncing by 500% and driving the server into a kernel spinlock livelock.',
      vi: 'Kỹ sư cố gắng nâng connection pool từ 200 lên 1.500 kết nối. Việc này làm tình trạng tồi tệ hơn gấp bội, tăng 500% hiện tượng nhảy cache-line của CPU và đẩy máy chủ vào trạng thái livelock tê liệt nhân hệ điều hành.'
    },
    coreSolution: {
      en: '1. Recognize that this was an in-memory physical LATCH bottleneck on a single hot page, not a logical LOCK problem. 2. Implement an in-memory Redis Read-Through Cache with a 500ms TTL for hot ticket availability reads, offloading 98% of repetitive page reads away from the PostgreSQL Buffer Pool. 3. Configure PgBouncer to throttle concurrent backend connections to exactly 64 (1:1 with physical CPU cores), eliminating OS thread preemption and spinlock contention on LWLocks. Result: Database CPU dropped from 95% system spinlock time to 18% user time, and total API throughput scaled past 85,000 requests/second with sub-5ms latency.',
      vi: '1. Nhận thức rõ ràng đây là điểm nghẽn Chốt Vật Lý (LATCH) trên một trang RAM quá nóng, chứ không phải bài toán Khóa Giao Dịch (LOCK). 2. Triển khai tầng đệm Redis Read-Through Cache với TTL ngắn 500ms cho các truy vấn kiểm tra vé nóng, chuyển hướng 98% lượt đọc lặp lại khỏi Buffer Pool của PostgreSQL. 3. Cấu hình PgBouncer siết chặt số kết nối đồng thời vào Postgres đúng bằng 64 (tỷ lệ 1:1 với số nhân CPU vật lý), triệt tiêu hoàn toàn hiện tượng tranh chấp luồng HĐH trên các chốt LWLock. Kết quả: Tải CPU giảm từ 95% chờ spinlock xuống còn 18% xử lý thực sự, và thông lượng toàn hệ thống vượt mốc 85.000 request/giây với độ trễ dưới 5ms.'
    },
    architectureImpact: {
      en: 'Understanding the dichotomy between Latches and Locks is vital: when high-concurrency systems degrade with zero blocked locks in pg_locks, the culprit is almost always in-memory latch contention on hot physical structures.',
      vi: 'Hiểu rõ sự phân đôi giữa Latch và Lock có ý nghĩa sống còn: khi một hệ thống đồng thời cao bị sụt giảm tốc độ mà pg_locks không có khóa nào bị chặn, thủ phạm hầu như luôn là sự tranh chấp chốt Latch trên các cấu trúc vật lý trong bộ nhớ.'
    }
  },

  javaCode: `package com.database.internals.concurrency;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Pure Java 21 demonstration of the architectural divide:
 * Physical In-Memory Latch vs Transactional Logical Lock.
 */
public class LatchVsLockDemonstration {

    // 1. PHYSICAL IN-MEMORY LATCH: Short-lived (nanoseconds/microseconds)
    // Protects an 8KB memory page from concurrent memory corruption
    public static class MemoryPageLatch {
        private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
        private final AtomicInteger activePins = new AtomicInteger(0);

        public void acquireSharedLatch() {
            rwLock.readLock().lock();
            activePins.incrementAndGet();
        }

        public void releaseSharedLatch() {
            activePins.decrementAndGet();
            rwLock.readLock().unlock();
        }

        public void acquireExclusiveLatch() {
            rwLock.writeLock().lock();
        }

        public void releaseExclusiveLatch() {
            rwLock.writeLock().unlock();
        }
    }

    // 2. TRANSACTIONAL LOGICAL LOCK: Long-lived (duration of business transaction)
    // Managed in shared memory lock table with deadlock detection
    public static class TransactionalLockManager {
        public enum LockMode { SHARED, EXCLUSIVE }

        public record LockRequest(long txId, String entityKey, LockMode mode) {}

        public void acquireLock(long txId, String rowKey, LockMode mode) {
            System.out.printf("  [LockManager] Tx #%d acquired %s lock on row %s (held until COMMIT)%n",
                txId, mode, rowKey);
        }

        public void releaseAllLocksForTx(long txId) {
            System.out.printf("  [LockManager] Tx #%d committed. All transactional row locks released.%n", txId);
        }
    }

    public static void main(String[] args) {
        MemoryPageLatch pageLatch = new MemoryPageLatch();
        TransactionalLockManager lockManager = new TransactionalLockManager();

        long txId = 4051;
        String rowKey = "orders#99102";

        System.out.println("=== Database Execution Trace: Reading & Updating a Row ===");

        // Step 1: Transaction requests logical lock (Transaction duration)
        lockManager.acquireLock(txId, rowKey, TransactionalLockManager.LockMode.EXCLUSIVE);

        // Step 2: Engine needs to read data from physical page in RAM
        // Acquires microsecond physical latch
        pageLatch.acquireSharedLatch();
        System.out.println("  -> Physical Latch acquired on Page #42 in RAM (15 nanoseconds)");
        System.out.println("  -> Extracted tuple bytes into private backend memory buffer");
        pageLatch.releaseSharedLatch();
        System.out.println("  -> Physical Latch RELEASED immediately! (Duration: 35ns)");

        // Step 3: Transaction does business calculations (takes 100ms)
        System.out.println("  -> Executing business logic / payment gateway call (100ms)...");

        // Step 4: Transaction commits
        lockManager.releaseAllLocksForTx(txId);
        System.out.println("=== Execution Finished: Notice Latch lived for 35ns, Lock lived for 100ms! ===");
    }
}
`
};
