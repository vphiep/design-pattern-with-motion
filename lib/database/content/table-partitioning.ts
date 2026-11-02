import type { DatabaseTopic } from '../types';

export const tablePartitioning: DatabaseTopic = {
  id: 'table-partitioning',
  category: 'storage-engines',
  name: 'Table Partitioning & Partition Pruning',
  tagline: {
    en: 'Scaling billion-row tables: Range, List, and Hash partitioning, Static vs Dynamic Partition Pruning, and lifecycle maintenance without downtime.',
    vi: 'Mở rộng quy mô bảng hàng tỷ dòng: Phân vùng theo Dải (Range), Danh sách (List), Băm (Hash), Cắt tỉa phân vùng (Pruning) và bảo trì dữ liệu không gián đoạn.'
  },
  difficulty: 2,
  order: 16,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      en: 'When a database table grows to 500,000,000 rows (500GB), B-Tree indexes swell to 80GB—exceeding server RAM. Queries suffer massive cache misses, VACUUM maintenance freezes the server for days, and deleting historical data (DELETE FROM logs WHERE created_at < 2024) generates catastrophic WAL volume and table bloat.',
      vi: 'Khi một bảng CSDL tăng lên 500 triệu dòng (500GB), các cây index B-Tree phình to lên 80GB—vượt quá dung lượng RAM của máy chủ. Truy vấn bị trượt cache liên tục, lệnh bảo trì VACUUM làm đơ server suốt nhiều ngày, và việc xóa dữ liệu cũ (DELETE FROM logs WHERE created_at < 2024) sinh ra lượng log WAL khổng lồ và làm phình to bảng nghiêm trọng.'
    },
    hardwareConstraint: {
      en: 'B-Tree lookups only operate at sub-millisecond memory speed if the index working set fits entirely in the RAM Buffer Pool. Table partitioning decomposes a giant physical relation into smaller independent tables so each active partition index fits cleanly inside L3 cache and RAM.',
      vi: 'Tra cứu B-Tree chỉ đạt tốc độ micro-giây trong RAM nếu tập làm việc (working set) của chỉ mục nằm trọn vẹn trong Buffer Pool. Phân vùng bảng chia nhỏ một quan hệ vật lý khổng lồ thành nhiều bảng độc lập nhỏ hơn để index của các phân vùng tích cực nằm gọn trong bộ nhớ RAM.'
    },
    fundamentalSolution: {
      en: 'Declarative Table Partitioning logically organizes one table into multiple physical sub-tables based on a Partition Key (Range, List, or Hash). During query execution, the optimizer performs Partition Pruning (Partition Elimination), inspecting WHERE clauses and completely excluding non-relevant physical sub-tables from execution plans.',
      vi: 'Phân Vùng Bảng Khai Báo (Declarative Partitioning) chia một bảng về mặt logic thành nhiều bảng con vật lý độc lập dựa trên Khóa Phân Vùng (Dải Range, Danh sách List hoặc Băm Hash). Khi thực thi truy vấn, bộ tối ưu thực hiện Cắt Tỉa Phân Vùng (Partition Pruning / Elimination), kiểm tra điều kiện WHERE và loại bỏ hoàn toàn các bảng con không liên quan ra khỏi kế hoạch thực thi.'
    },
    math: {
      formula: 'T_{\\text{pruned\\_scan}} = \\frac{1}{P} \\times T_{\\text{full\\_scan}}, \\quad \\text{DROP PARTITION I/O} = O(1)',
      description: {
        en: 'With P equally sized partitions, pruning eliminates (P - 1) partitions from the search space, reducing physical I/O scan by a factor of P. Dropping obsolete partitions is an instantaneous O(1) filesystem metadata operation, replacing expensive O(N) row-by-row deletes.',
        vi: 'Với P phân vùng có kích thước bằng nhau, cơ chế Pruning loại bỏ (P - 1) phân vùng khỏi không gian tìm kiếm, giảm P lần lượng I/O quét đĩa. Thao tác xóa dữ liệu cũ bằng DROP PARTITION là lệnh O(1) trên metadata hệ thống tệp, thay thế hoàn toàn cho lệnh DELETE từng dòng O(N) đắt đỏ.'
      },
      timeComplexity: 'Partition Routing: O(1) for Hash/List, O(log P) for Range; Partition Pruned Scan: O(N / P)',
      spaceComplexity: 'Zero additional storage overhead; individual partition tablespaces can be mounted on cheaper storage tiers',
      ioCostFormula: 'I/O Cost = Sum of buffer pages across active, un-pruned physical partition tables'
    }
  },

  pageLayout: {
    title: {
      en: 'Declarative Range Partitioning & Partition Pruning Execution',
      vi: 'Cấu trúc Phân vùng theo Dải & Quá trình Cắt tỉa Phân vùng (Partition Pruning)'
    },
    description: {
      en: 'Parent logical table routes inserts and queries to concrete physical child partitions. Non-matching partitions are pruned during query planning.',
      vi: 'Bảng cha logic định tuyến dữ liệu chèn và truy vấn xuống các bảng con vật lý cụ thể. Các phân vùng không khớp sẽ bị loại bỏ ngay khi lập kế hoạch.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| LOGICAL PARENT TABLE: orders (Partition Key: created_at)                  |
+--------------------------------------------------------------------------+
  |              |                             |                        |
  v              v                             v                        v
[ orders_2025 ] [ orders_2026_q1 ]           [ orders_2026_q2 ]       [ orders_2026_q3 ]
(2025-01-01 ->  (2026-01-01 -> 2026-03-31)   (2026-04-01 -> 06-30)   (2026-07-01 -> 09-30)
 2025-12-31)    Index fits in RAM (4GB)       Index in RAM (4GB)       Future partition
+--------------------------------------------------------------------------+
| QUERY: SELECT * FROM orders WHERE created_at >= '2026-04-15';            |
|                                                                          |
| PARTITION PRUNING (ELIMINATION):                                         |
|  - Check orders_2025:    Boundary max 2025 < 2026-04-15  -> PRUNED! (0ms) |
|  - Check orders_2026_q1: Boundary max Mar < 2026-04-15   -> PRUNED! (0ms) |
|  - Check orders_2026_q2: Boundary overlaps query range   -> SCANNED!      |
|  - Check orders_2026_q3: Boundary overlaps query range   -> SCANNED!      |
|                                                                          |
| RESULT: 50% of physical table data & indexes completely skipped!         |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'Partition Bound', size: 'Catalog Descriptor', description: { en: 'Lower and upper boundary values defining the valid key range for this sub-table', vi: 'Giá trị biên dưới và biên trên xác định dải khóa hợp lệ của bảng con này' } },
      { name: 'Relcache Entry', size: 'Memory Struct', description: { en: 'In-memory routing array used by executor to dispatch tuples to child tables', vi: 'Cấu trúc định tuyến trong RAM dùng để phân phối dòng dữ liệu xuống bảng con' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Table Partitioning is an architectural technique that decomposes large relational tables into smaller, physically independent sub-tables while maintaining a single unified logical table interface for application SQL. It is essential for enterprise systems scaling beyond tens of millions to billions of records. Most importantly, backend engineers must strictly distinguish between three distinct scalability concepts: Partitioning (dividing a table logically into local sub-tables on one database instance), Sharding (distributing data horizontally across multiple independent database server nodes via network RPC), and Indexing (building secondary search trees on a table).',
      vi: 'Phân Vùng Bảng (Table Partitioning) là kỹ thuật kiến trúc chia nhỏ các bảng quan hệ khổng lồ thành nhiều bảng con vật lý độc lập, trong khi vẫn duy trì một giao diện bảng logic thống nhất duy nhất cho mã SQL của ứng dụng. Đây là vũ khí tối thượng cho các hệ thống doanh nghiệp khi dữ liệu vượt ngưỡng hàng chục triệu đến hàng tỷ bản ghi. Đặc biệt, lập trình viên bắt buộc phải phân biệt rạch ròi giữa 3 khái niệm: Phân vùng Partitioning (chia một bảng thành các bảng con cục bộ trên cùng một máy chủ), Phân mảnh Sharding (phân tán dữ liệu theo chiều ngang ra nhiều máy chủ CSDL độc lập qua mạng), và Đánh chỉ mục Indexing (xây dựng các cây tra cứu phụ trên bảng).'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Crucial Distinction: Partitioning vs Sharding vs Indexing: (A) Table Partitioning: Splitting a single table into physical sub-tables hosted on the SAME database instance. Transparent to application code; query optimization prunes sub-tables using local OS disk files. (B) Database Sharding: Splitting data across DIFFERENT physical database nodes/clusters over a network. Requires distributed transaction coordination (2PC, Paxos), network routing gateways (Vitess, Citus), and incurs network latency and distributed deadlocks. (C) Indexing: An auxiliary search data structure (B-Tree, Hash) built on top of a table to accelerate point lookups without dividing the underlying storage table.',
        vi: '1. Phân Biệt Rạch Ròi: Partitioning vs Sharding vs Indexing: (A) Table Partitioning: Chia một bảng thành các bảng con vật lý nằm trên CÙNG MỘT máy chủ CSDL. Hoàn toàn trong suốt với ứng dụng; bộ tối ưu tự động cắt tỉa các bảng con dựa trên file đĩa cục bộ. (B) Database Sharding: Chia dữ liệu ra NHIỀU MÁY CHỦ CSDL vật lý độc lập qua mạng. Đòi hỏi cơ chế điều phối giao dịch phân tán (2PC, Paxos), gateway định tuyến mạng (Vitess, Citus) và phải chịu độ trễ mạng cũng như deadlock phân tán. (C) Indexing: Cấu trúc tìm kiếm phụ trợ (B-Tree, Hash) được dựng trên bảng để tăng tốc tìm kiếm mà không hề chia cắt cấu trúc lưu trữ của bảng gốc.'
      },
      {
        en: '2. The Three Partitioning Strategies: (A) Range Partitioning: Table is partitioned into discrete ranges of values (e.g. created_at by month/year, or order_id by numerical bands). The gold standard for time-series, financial ledgers, and event logs. (B) List Partitioning: Table is partitioned based on explicit discrete values (e.g., country_code IN ("VN", "TH", "SG") vs ("US", "CA")). Ideal for multi-tenant applications where data is segregated by tenant geography. (C) Hash Partitioning: Table is partitioned by computing a hash of the partition key modulo P (e.g., hash(user_id) % 16). Guarantees completely even distribution of data across P sub-tables, eliminating hot-spots on high-write systems.',
        vi: '2. 3 Chiến Lược Phân Vùng Cốt Lõi: (A) Phân vùng theo Dải (Range Partitioning): Bảng được chia theo các dải giá trị liên tục (như created_at theo từng tháng/năm, hoặc id theo các khoảng 1-1.000.000). Đây là chuẩn mực cho dữ liệu chuỗi thời gian, sổ cái ngân hàng và log sự kiện. (B) Phân vùng theo Danh sách (List Partitioning): Bảng được chia theo các giá trị liệt kê cụ thể (như country_code IN ("VN", "TH") vs ("US", "CA")). Cực kỳ lý tưởng cho các ứng dụng đa người thuê (Multi-Tenant) phân tách theo vị trí địa lý. (C) Phân vùng theo Băm (Hash Partitioning): Dữ liệu được chia bằng cách băm khóa phân vùng chia lấy dư cho P (như hash(user_id) % 16). Bảo đảm dữ liệu được rải đều 100% qua P bảng con, triệt tiêu hoàn toàn hiện tượng điểm nóng (Hot-Spot) khi ghi tải cao.'
      },
      {
        en: '3. Partition Pruning (Static vs Dynamic Elimination): Partition Pruning is the optimizer mechanism that discards irrelevant partitions during execution: (1) Static Pruning: Occurs at query compile/planning time when the query contains static constant literals (e.g., WHERE created_at = "2026-05-10"). The optimizer compares the constant against the partition bounds and removes all other partitions from the physical plan. (2) Dynamic Pruning: Occurs at query runtime when the query contains parameterized placeholders, prepared statements, or subqueries (e.g., WHERE created_at >= (SELECT cutoff_date FROM settings)). The executor dynamically evaluates the parameter on the first execution step and skips non-qualifying partition sub-trees.',
        vi: '3. Cắt Tỉa Phân Vùng (Static vs Dynamic Pruning): Partition Pruning là cơ chế của bộ tối ưu giúp vứt bỏ các phân vùng không liên quan trong lúc thực thi: (1) Cắt tỉa tĩnh (Static Pruning): Diễn ra ngay lúc biên dịch/lập kế hoạch khi câu lệnh chứa giá trị hằng số cố định (WHERE created_at = "2026-05-10"). Bộ tối ưu so sánh hằng số với ranh giới phân vùng và gạch bỏ toàn bộ các bảng con khác khỏi kế hoạch thực thi. (2) Cắt tỉa động (Dynamic Pruning): Diễn ra lúc runtime khi câu lệnh dùng tham số Prepared Statement hoặc subquery (WHERE created_at >= (SELECT cutoff_date FROM settings)). Executor tự động tính giá trị tham số ở bước đầu tiên rồi nhảy cóc bỏ qua các nhánh phân vùng không thỏa điều kiện.'
      },
      {
        en: '4. Zero-Downtime Data Lifecycle: ATTACH and DETACH CONCURRENTLY: The most profound operational superpower of table partitioning is instantaneous data lifecycle management: (1) Archiving Data: Instead of running DELETE FROM orders WHERE created_at < "2024-01-01" (which takes 8 hours, generates 60GB of WAL, locks the table, and produces dead tuple bloat), an administrator executes ALTER TABLE orders DETACH PARTITION orders_2023 CONCURRENTLY. This executes in 0.01 seconds without blocking concurrent transactions! The detached table can then be archived to S3 or dropped in an instant (DROP TABLE orders_2023). (2) Ingesting Data: New historical tables can be populated, indexed, and validated offline, then attached instantly via ALTER TABLE orders ATTACH PARTITION.',
        vi: '4. Vòng Đời Dữ Liệu Không Gián Đoạn: ATTACH và DETACH CONCURRENTLY: Siêu năng lực vận hành lớn nhất của phân vùng bảng là quản lý vòng đời dữ liệu tức thì: (1) Lưu trữ/Xóa dữ liệu cũ: Thay vì chạy lệnh DELETE FROM orders WHERE created_at < "2024-01-01" (mất 8 tiếng, sinh ra 60GB WAL, khóa bảng và gây phình rác dead tuple), DBA chỉ việc chạy lệnh ALTER TABLE orders DETACH PARTITION orders_2023 CONCURRENTLY. Lệnh này hoàn tất trong 0.01 giây mà không hề chặn các giao dịch đang chạy! Bảng đã tách sau đó có thể lưu trữ sang AWS S3 hoặc xóa sổ trong tích tắc (DROP TABLE orders_2023). (2) Nạp dữ liệu mới: Bảng dữ liệu mới có thể được nạp, đánh index và kiểm tra tính toàn vẹn offline hoàn toàn, sau đó gắn vào hệ thống trong 0ms bằng lệnh ATTACH PARTITION.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Over-partitioning anti-pattern: Partitioning a table into thousands of tiny partitions (e.g., partitioning by day for 10 years = 3,650 sub-tables). Every partition is a separate physical table requiring file descriptors, catalog metadata locks, and memory buffers. The optimizer query planning time explodes from 2ms to 600ms simply evaluating catalog bounds!',
        vi: 'Bẫy chia phân vùng quá nhỏ (Over-Partitioning): Chia bảng thành hàng nghìn phân vùng tí hon (như chia theo ngày suốt 10 năm = 3.650 bảng con). Mỗi phân vùng là một bảng vật lý riêng đòi hỏi con trỏ file OS, khóa catalog và bộ đệm RAM. Thời gian lập kế hoạch CBO sẽ phình từ 2ms lên 600ms chỉ để duyệt qua siêu dữ liệu của hàng nghìn bảng con!'
      },
      {
        en: 'Querying without the partition key in the WHERE clause: Executing SELECT * FROM orders WHERE customer_id = 99 when the table is partitioned on created_at. Partition pruning cannot activate; the database is forced to scan every single physical partition in sequence, degrading performance compared to an unpartitioned table with an index.',
        vi: 'Truy vấn thiếu Khóa Phân Vùng trong mệnh đề WHERE: Chạy SELECT * FROM orders WHERE customer_id = 99 trong khi bảng phân vùng theo created_at. Cơ chế cắt tỉa Pruning bị vô hiệu hóa hoàn toàn; database buộc phải quét tuần tự qua từng bảng con một, khiến truy vấn chạy chậm hơn nhiều so với một bảng đơn lẻ có đánh index.'
      },
      {
        en: 'Unique constraints requiring the partition key: In relational database engines (PostgreSQL, MySQL), a UNIQUE or PRIMARY KEY constraint on a partitioned table MUST contain the partition key column (e.g. PRIMARY KEY (id, created_at)). You cannot enforce global uniqueness on id alone across partitions without an application-level constraint or external sequencer.',
        vi: 'Ràng buộc duy nhất bắt buộc phải chứa Khóa Phân Vùng: Trong các CSDL quan hệ (PostgreSQL, MySQL), ràng buộc UNIQUE hoặc PRIMARY KEY trên bảng phân vùng BẮT BUỘC phải bao gồm cả cột phân vùng (như PRIMARY KEY (id, created_at)). Bạn không thể tạo khóa chính trên riêng cột id đơn lẻ nếu không có giải pháp kiểm soát ở tầng ứng dụng.'
      }
    ]
  },

  steps: [
    {
      id: 'partition-route',
      title: { en: 'Partition Key Evaluation & Routing', vi: 'Đánh giá Khóa Phân vùng & Định tuyến' },
      phase: 'Routing Phase',
      description: {
        en: 'Evaluate row partition key (Range boundary, List member, or Hash modulus) to select child sub-table.',
        vi: 'Đánh giá khóa phân vùng (Biên dải, Thành viên danh sách hoặc Hash dư) để chọn bảng con.'
      },
      diskIoBehavior: { en: 'Reads catalog partition bounds in RAM memory.', vi: 'Đọc ranh giới phân vùng từ RAM.' },
      javaCodeLineMatch: 'String targetTable = partitionRouter.route(record.getPartitionKey());'
    },
    {
      id: 'static-prune',
      title: { en: 'Static Partition Pruning (Elimination)', vi: 'Cắt tỉa Phân vùng Tĩnh (Elimination)' },
      phase: 'Planning Phase',
      description: {
        en: 'Optimizer checks query WHERE predicates against partition min/max bounds and eliminates non-matching child tables.',
        vi: 'Bộ tối ưu đối chiếu điều kiện WHERE với min/max phân vùng và loại bỏ các bảng con không khớp.'
      },
      diskIoBehavior: { en: 'Zero physical I/O; eliminates 80-95% of sub-tables from plan tree.', vi: 'Không tốn I/O vật lý; loại bỏ từ 80-95% số bảng con khỏi cây kế hoạch.' },
      javaCodeLineMatch: 'List<SubTable> activePartitions = pruner.prune(queryPredicate);'
    },
    {
      id: 'lifecycle-detach',
      title: { en: 'Zero-Downtime Detach / Drop Partition', vi: 'Tách & Xóa Phân vùng Không Gián đoạn' },
      phase: 'Maintenance Phase',
      description: {
        en: 'Execute ALTER TABLE ... DETACH PARTITION CONCURRENTLY to instantly decouple obsolete historical data.',
        vi: 'Thực thi lệnh DETACH PARTITION CONCURRENTLY để ngắt kết nối dữ liệu cũ trong tích tắc.'
      },
      diskIoBehavior: { en: 'O(1) catalog metadata update; instantaneous zero disk write.', vi: 'Cập nhật metadata catalog O(1); tức thì không tốn I/O ghi đĩa.' },
      javaCodeLineMatch: 'databaseAdmin.detachPartition("orders_2023");'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Declarative Partitioning',
      implementationName: 'Declarative Range/List/Hash Partitioning (PG 11+)',
      keyMechanism: {
        en: 'Declarative partitioning replaces legacy table inheritance and trigger rules. Supports runtime dynamic partition pruning (enable_partition_pruning = on) and DETACH CONCURRENTLY.',
        vi: 'Phân vùng khai báo thay thế cơ chế kế thừa bảng và trigger thời kỳ trước. Hỗ trợ cắt tỉa động lúc runtime và lệnh tách phân vùng không khóa DETACH CONCURRENTLY.'
      },
      defaultTuningConfig: 'enable_partition_pruning = on, enable_partitionwise_join = on',
      architectureNote: {
        en: 'Enabling enable_partitionwise_join allows PostgreSQL to join matching partitions directly (orders_q1 JOIN customers_q1) rather than joining the entire parent tables.',
        vi: 'Bật enable_partitionwise_join cho phép Postgres nối trực tiếp các phân vùng tương ứng với nhau thay vì phải gom cả 2 bảng cha khổng lồ lại để nối.'
      }
    },
    {
      engine: 'MySQL InnoDB Partitioning',
      implementationName: 'InnoDB Native Table Partitioning',
      keyMechanism: {
        en: 'Supports RANGE, LIST, HASH, and KEY partitioning. Each partition maintains its own .ibd tablespace file on physical storage.',
        vi: 'Hỗ trợ phân vùng RANGE, LIST, HASH và KEY. Mỗi phân vùng duy trì một file tablespace .ibd độc lập trên đĩa cứng vật lý.'
      },
      defaultTuningConfig: 'partition_pruning = ON',
      architectureNote: {
        en: 'Supports subpartitioning (composite partitioning), such as partitioning by RANGE on date and subpartitioning by HASH on customer_id.',
        vi: 'Hỗ trợ phân vùng lồng nhau (subpartitioning), ví dụ phân vùng cha theo RANGE ngày tháng và phân vùng con theo HASH mã khách hàng.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Partitioning Suite',
      implementationName: 'Interval Partitioning, Partition Exchange & Local/Global Indexes',
      keyMechanism: {
        en: 'Oracle provides Interval Partitioning (automatically spawning monthly/daily partitions when rows exceed current ranges without DBA intervention), Partition Exchange (instantaneous 0ms data swapping via metadata pointer updates), and independent Local vs Global Partitioned Indexes.',
        vi: 'Oracle cung cấp cơ chế Phân vùng Khoảng (Interval Partitioning - tự động sinh phân vùng ngày/tháng mới khi có bản ghi vượt dải mà không cần DBA can thiệp), Trao đổi Phân vùng (Partition Exchange - hoán đổi hàng trăm triệu dòng tức thì trong 0ms bằng việc đảo con trỏ từ điển dữ liệu), cùng hệ thống chỉ mục Cục bộ (Local) và Toàn cục (Global) độc lập.'
      },
      defaultTuningConfig: "CREATE TABLE orders (...) PARTITION BY RANGE (order_date) INTERVAL(NUMTOYMINTERVAL(1, 'MONTH')) (...);",
      architectureNote: {
        en: 'Global Indexes can be maintained asynchronously during partition drops via UPDATE GLOBAL INDEXES, eliminating index invalidation downtime.',
        vi: 'Chỉ mục toàn cục (Global Index) có thể được duy trì tự động bất đồng bộ khi DROP phân vùng nhờ mệnh đề UPDATE GLOBAL INDEXES, triệt tiêu thời gian gián đoạn do chỉ mục bị vô hiệu hóa (UNUSABLE).'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Partition Pruning drastically reduces scan time and allows queries over billions of rows to execute in milliseconds.', vi: 'Cơ chế Cắt tỉa giúp truy vấn trên hàng tỷ dòng dữ liệu chạy trong tích tắc nhờ bỏ qua các phân vùng thừa.' },
      { en: 'Instantaneous data lifecycle: DROP / DETACH partition replaces devastating O(N) row DELETE operations in 0ms.', vi: 'Vòng đời dữ liệu siêu tốc: lệnh xóa phân vùng thay thế hoàn toàn cho thao tác DELETE từng dòng đắt đỏ.' }
    ],
    cons: [
      { en: 'Queries without the partition key in the WHERE clause degrade to sequential scans across all partitions.', vi: 'Các câu truy vấn thiếu cột khóa phân vùng sẽ bị tụt dốc hiệu năng do phải quét qua tất cả các phân vùng.' },
      { en: 'Global unique indexes are not supported unless the partition key is included in the unique index.', vi: 'Không hỗ trợ tạo chỉ mục duy nhất toàn cục (Global Unique Index) trừ khi cột phân vùng có mặt trong khóa.' }
    ],
    writeAmplification: {
      en: 'Low: Routing overhead is negligible O(1); writes go directly to the targeted partition tablespace.',
      vi: 'Thấp: Chi phí định tuyến chỉ là O(1) không đáng kể; dữ liệu ghi thẳng vào file tablespace của phân vùng đích.'
    },
    recoveryGuarantee: {
      en: 'Partitions are isolated physical tables; crash recovery replays WAL independently per tablespace block.',
      vi: 'Mỗi phân vùng là một bảng vật lý độc lập; phục hồi sự cố chạy lại WAL an toàn theo từng khối tablespace.'
    }
  },

  springBootCode: `package com.enterprise.database.partitioning;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Enterprise Spring Boot Demonstration:
 * Querying a Partitioned Table leveraging Partition Pruning
 * and executing automated monthly partition maintenance.
 */
@Component
public class PartitionLifecycleManager implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public PartitionLifecycleManager(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // 1. Production Query: Explicitly includes partition key 'created_at'
        // Result: Optimizer eliminates 95% of partitions (Pruning in action!)
        String querySql = """
            SELECT order_id, customer_id, total_amount
            FROM orders
            WHERE created_at >= ? AND created_at < ?
              AND status = 'COMPLETED'
        """;

        LocalDate start = LocalDate.of(2026, 4, 1);
        LocalDate end = LocalDate.of(2026, 5, 1);

        jdbcTemplate.query(querySql, (rs) -> {
            // Process order...
        }, start, end);

        System.out.println("Query executed with partition pruning active.");
    }

    // Automated rolling window partition creator (called via Spring @Scheduled)
    public void createNextMonthPartition(String nextMonthSuffix, String startDate, String endDate) {
        String ddl = String.format("""
            CREATE TABLE IF NOT EXISTS orders_%s
            PARTITION OF orders
            FOR VALUES FROM ('%s') TO ('%s');
        """, nextMonthSuffix, startDate, endDate);

        jdbcTemplate.execute(ddl);
        System.out.println("Created future partition: orders_" + nextMonthSuffix);
    }
}`,

  sqlQueries: `-- 1. Declarative Range Partitioning Setup in PostgreSQL
CREATE TABLE orders (
    order_id BIGSERIAL,
    customer_id INT NOT NULL,
    status VARCHAR(32) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at DATE NOT NULL,
    PRIMARY KEY (order_id, created_at) -- Partition key MUST be part of PK!
) PARTITION BY RANGE (created_at);

-- 2. Create Concrete Child Partitions for 2026
CREATE TABLE orders_2026_q1 PARTITION OF orders
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE orders_2026_q2 PARTITION OF orders
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE orders_2026_q3 PARTITION OF orders
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');

-- 3. Verify Partition Pruning in EXPLAIN output
-- PostgreSQL removes orders_2026_q1 and orders_2026_q3 completely!
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE created_at BETWEEN '2026-04-15' AND '2026-05-15';

-- 4. Zero-Downtime Data Lifecycle Maintenance:
-- Detach old historical partition in 0ms without blocking transactions:
ALTER TABLE orders DETACH PARTITION orders_2026_q1 CONCURRENTLY;

-- Now drop or archive the isolated table with zero impact on online users:
DROP TABLE orders_2026_q1;`,

  productionProblemCase: {
    title: {
      en: 'The 18-Hour DELETE Lockout: Deleting 120M Audit Logs Paralyzes Core Banking',
      vi: 'Thảm Họa Lệnh DELETE Chạy 18 Tiếng: Xóa 120 Triệu Bản Ghi Audit Log Làm Tê Liệt Ngân Hàng'
    },
    businessContext: {
      en: 'A commercial banking core system accumulates 15,000,000 audit log rows daily in an unpartitioned table (security_audit_logs), growing to 850,000,000 rows (720GB table size, 180GB B-Tree index size).',
      vi: 'Hệ thống ngân hàng thương mại tích lũy 15 triệu bản ghi audit log mỗi ngày trong bảng đơn lẻ không phân vùng (security_audit_logs), đạt tổng số 850 triệu dòng (dung lượng bảng 720GB, chỉ mục B-Tree 180GB).'
    },
    problemDescription: {
      en: 'To comply with compliance regulations requiring logs older than 1 year to be purged, a junior DBA ran a nightly cron script: DELETE FROM security_audit_logs WHERE created_at < NOW() - INTERVAL "1 year";. The query attempted to delete 120,000,000 rows in a single transaction. The consequences were disastrous: (1) The transaction acquired exclusive row locks, filling the lock manager RAM; (2) Over 450GB of WAL logs were generated in 3 hours, filling disk storage to 99%; (3) Disk write throughput dropped to zero due to massive checkpoint thrashing; (4) The DELETE ran for 18 hours, blocking incoming audit log writes and freezing customer banking transfers.',
      vi: 'Để tuân thủ quy định kiểm toán yêu cầu xóa dữ liệu cũ hơn 1 năm, một quản trị viên chạy lệnh: DELETE FROM security_audit_logs WHERE created_at < NOW() - INTERVAL "1 year";. Câu lệnh cố gắng xóa 120 triệu dòng trong một giao dịch duy nhất. Hậu quả xảy ra ngay lập tức: (1) Giao dịch xin khóa độc quyền trên hàng triệu dòng, tràn bộ nhớ Lock Manager; (2) Hơn 450GB nhật ký WAL phát sinh trong 3 tiếng, làm đầy 99% dung lượng ổ đĩa; (3) Tốc độ ghi đĩa tê liệt do bão checkpoint; (4) Lệnh DELETE chạy suốt 18 tiếng chưa xong, chặn đứng các giao dịch kiểm toán mới và đóng băng chuyển khoản của khách hàng.'
    },
    whyNaiveFails: {
      en: 'Batching the deletes in chunks (DELETE ... WHERE id IN (SELECT id ... LIMIT 10000)) reduced lock duration, but still took 6 days to complete, kept CPU at 85%, and left 120,000,000 dead tuples in the heap table, causing permanent table bloat that required a 48-hour VACUUM FULL table freeze.',
      vi: 'Chia nhỏ việc xóa thành từng mẻ (DELETE ... LIMIT 10000) giảm bớt thời gian giữ khóa, nhưng vẫn mất tới 6 ngày mới chạy xong, đẩy CPU lên 85%, và để lại 120 triệu dòng chết (dead tuples) trong bảng heap, gây phình to bảng vĩnh viễn và đòi hỏi phải chạy VACUUM FULL khóa cứng hệ thống suốt 48 tiếng.'
    },
    coreSolution: {
      en: '1. Migrate security_audit_logs to Declarative Monthly Range Partitioning on created_at. 2. Implement an automated rolling lifecycle script: at the start of each month, execute ALTER TABLE security_audit_logs DETACH PARTITION audit_logs_2025_04 CONCURRENTLY; followed by DROP TABLE audit_logs_2025_04;. Result: Deleting 120,000,000 records dropped from an 18-hour catastrophic outage to an instantaneous 0.04-second metadata drop. Zero WAL spikes, zero dead tuples, zero table bloat, and zero impact on online banking transactions.',
      vi: '1. Chuyển đổi bảng security_audit_logs sang Phân Vùng Khai Báo Theo Dải (Range Partitioning) từng tháng trên cột created_at. 2. Cài đặt kịch bản bảo trì tự động: vào ngày đầu mỗi tháng, thực thi lệnh ALTER TABLE security_audit_logs DETACH PARTITION audit_logs_2025_04 CONCURRENTLY; sau đó chạy DROP TABLE audit_logs_2025_04;. Kết quả: Thao tác xóa 120 triệu bản ghi cũ chuyển từ một thảm họa 18 tiếng thành một lệnh cập nhật metadata diễn ra trong đúng 0.04 giây. Hoàn toàn không phát sinh rác dead tuple, không phình WAL, và 0% ảnh hưởng đến các giao dịch trực tuyến của ngân hàng.'
    },
    architectureImpact: {
      en: 'Table partitioning transforms data retention from an excruciating row-by-row transactional nightmare into an instantaneous, zero-overhead metadata operation.',
      vi: 'Phân vùng bảng biến bài toán xóa dữ liệu lưu trữ từ một cơn ác mộng giao dịch từng dòng thành một thao tác metadata tức thì với chi phí bằng 0.'
    }
  },

  javaCode: `package com.database.internals.partitioning;

import java.time.LocalDate;
import java.util.*;

/**
 * Pure Java 21 implementation of Declarative Range Partitioning & Pruning Engine.
 */
public class TablePartitionEngine {

    public record PartitionRange(String tableName, LocalDate start, LocalDate end) {
        public boolean contains(LocalDate date) {
            return (date.isEqual(start) || date.isAfter(start)) && date.isBefore(end);
        }

        public boolean overlaps(LocalDate queryStart, LocalDate queryEnd) {
            return !queryStart.isAfter(end) && !queryEnd.isBefore(start);
        }
    }

    public static class PartitionRouter {
        private final List<PartitionRange> partitions = new ArrayList<>();

        public void addPartition(String tableName, LocalDate start, LocalDate end) {
            partitions.add(new PartitionRange(tableName, start, end));
        }

        // Routing for INSERT operations
        public String routeInsert(LocalDate recordDate) {
            for (var partition : partitions) {
                if (partition.contains(recordDate)) {
                    return partition.tableName();
                }
            }
            throw new IllegalArgumentException("No matching partition found for date: " + recordDate);
        }

        // Static Partition Pruning for SELECT queries
        public List<String> prunePartitions(LocalDate queryStart, LocalDate queryEnd) {
            List<String> activePartitions = new ArrayList<>();
            for (var partition : partitions) {
                if (partition.overlaps(queryStart, queryEnd)) {
                    activePartitions.add(partition.tableName());
                }
            }
            return activePartitions;
        }
    }

    public static void main(String[] args) {
        PartitionRouter router = new PartitionRouter();
        router.addPartition("orders_2026_q1", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 4, 1));
        router.addPartition("orders_2026_q2", LocalDate.of(2026, 4, 1), LocalDate.of(2026, 7, 1));
        router.addPartition("orders_2026_q3", LocalDate.of(2026, 7, 1), LocalDate.of(2026, 10, 1));
        router.addPartition("orders_2026_q4", LocalDate.of(2026, 10, 1), LocalDate.of(2027, 1, 1));

        // 1. Insert Routing Demonstration
        LocalDate orderDate = LocalDate.of(2026, 5, 20);
        String targetSubTable = router.routeInsert(orderDate);
        System.out.printf("Row dated %s routed directly to sub-table: %s%n", orderDate, targetSubTable);

        // 2. Partition Pruning Demonstration
        LocalDate searchStart = LocalDate.of(2026, 4, 15);
        LocalDate searchEnd = LocalDate.of(2026, 5, 15);
        List<String> scannedPartitions = router.prunePartitions(searchStart, searchEnd);

        System.out.printf("%nQuery WHERE created_at BETWEEN %s AND %s:%n", searchStart, searchEnd);
        System.out.printf("  -> Total Partitions: 4 | Scanned Partitions: %d %s%n",
            scannedPartitions.size(), scannedPartitions);
        System.out.println("  -> Partition Pruning eliminated 75% of physical storage from query!");
    }
}
`
};
