import type { DatabaseTopic } from '../types';

export const advancedIndexing: DatabaseTopic = {
  id: 'advanced-indexing',
  category: 'indexing-techniques',
  name: 'Advanced Indexing & Index Selection',
  tagline: {
    en: 'Mastering physical index architectures: Composite Indexes, Leftmost Prefix Rule, Covering Indexes (Index-Only Scan), Index Condition Pushdown, and Bitmap Scans.',
    vi: 'Làm chủ kiến trúc chỉ mục vật lý: Chỉ mục tổ hợp (Composite), Quy tắc tiền tố ngoài cùng bên trái (Leftmost Prefix), Covering Index (Index-Only Scan), Đẩy điều kiện ICP và Quét Bitmap.'
  },
  difficulty: 2,
  order: 15,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Creating a separate single-column B-Tree on every table column wastes massive disk space, inflates write latency on every INSERT/UPDATE, and fails multi-filter queries. A query with WHERE status = ? AND created_at > ? can either scan only one index or execute an expensive Bitmap Index Merge.',
      vi: 'Việc tạo riêng từng B-Tree đơn lẻ trên mỗi cột làm lãng phí dung lượng đĩa khủng khiếp, làm chậm các lệnh INSERT/UPDATE, và bất lực trước các truy vấn nhiều điều kiện. Một câu truy vấn có WHERE status = ? AND created_at > ? chỉ có thể dùng 1 index duy nhất hoặc phải chạy phép gộp Bitmap Index Merge rất chậm.'
    },
    hardwareConstraint: {
      en: 'A standard Index Scan incurs two random I/O trips per matched row: (1) traverse the B-Tree leaf to obtain the Tuple ID (PageID + SlotNumber), then (2) fetch the heap 8KB page from disk to extract the row. If the index scan matches 50,000 rows, that requires 50,000 random disk I/O dereferences.',
      vi: 'Một phép Quét Chỉ Mục tiêu chuẩn tốn 2 lượt đọc đĩa ngẫu nhiên cho mỗi dòng khớp điều kiện: (1) duyệt lá cây B-Tree để lấy mã Tuple ID (PageID + SlotNumber), sau đó (2) đọc trang heap 8KB từ đĩa vào RAM để trích xuất dữ liệu dòng. Nếu câu lệnh khớp 50.000 dòng, hệ thống phải thực hiện tới 50.000 lần truy xuất đĩa ngẫu nhiên.'
    },
    fundamentalSolution: {
      en: 'Advanced Indexing structures eliminate heap visits entirely via Covering Indexes (Index-Only Scan) using INCLUDE clauses, accelerate multi-column filtering via the Leftmost Prefix Rule on Composite Indexes, push range predicates into the storage engine via Index Condition Pushdown (ICP), and dynamically bridge unclustered indexes through Bitmap Index Scans.',
      vi: 'Các cấu trúc Chỉ Mục Nâng Cao triệt tiêu hoàn toàn việc đọc bảng chính qua Covering Index (Index-Only Scan) với mệnh đề INCLUDE, tăng tốc lọc đa cột nhờ Quy tắc Tiền tố Trái Nhất trên Composite Index, đẩy điều kiện lọc xuống thẳng tầng lưu trữ bằng ICP, và kết nối linh hoạt các chỉ mục phân tán qua Quét Bitmap (Bitmap Index Scan).'
    },
    math: {
      formula: '\\text{Selectivity} = \\frac{\\text{Card}(S)}{\\text{Card}(Table)}, \\quad \\text{Index-Only Cost} = \\text{Pages}_{\\text{index}} \\times \\text{seq\\_cost}',
      description: {
        en: 'Index-Only Scans drop heap I/O cost to zero, bounded only by index leaf page count. Composite index effectiveness adheres strictly to the Leftmost Prefix sorting order.',
        vi: 'Index-Only Scan đưa chi phí I/O đọc bảng heap về bằng 0, chỉ còn phụ thuộc vào số trang lá của cây index. Hiệu quả của Composite Index tuân thủ tuyệt đối thứ tự sắp xếp của quy tắc tiền tố ngoài cùng bên trái.'
      },
      timeComplexity: 'Point Lookup: O(log N); Covering Range Scan: O(log N + K) with 0 Heap I/Os; Bitmap Scan: O(Index_Read + Sort + Clustered_Heap_Scan)',
      spaceComplexity: 'Composite B-Tree: O(N * (sizeof(Col1) + sizeof(Col2) + 8B TID)); Partial Index: O(M) where M << N',
      ioCostFormula: 'Standard Scan: Cost = BTree_Traverse + K × Random_Heap_Page_Fetch; Covering Scan: Cost = BTree_Traverse + Leaf_Pages'
    }
  },

  pageLayout: {
    title: {
      en: 'Composite B-Tree Key Ordering & PostgreSQL Visibility Map',
      vi: 'Thứ tự Khóa Composite B-Tree & Bản đồ Hiển thị (Visibility Map) trong PostgreSQL'
    },
    description: {
      en: 'How composite keys (status, created_at) are sorted on B-Tree leaf pages, and how the Visibility Map enables Index-Only Scans without reading the heap table.',
      vi: 'Cách các khóa tổ hợp (status, created_at) được sắp xếp trên trang lá B-Tree và cách Visibility Map hỗ trợ Index-Only Scan mà không cần đọc bảng heap.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| COMPOSITE B-TREE LEAF PAGE (INDEX idx_orders_status_date ON (status, date)): |
|  Keys sorted FIRST by status, THEN by date for identical statuses:      |
|  [ ('COMPLETED', 2026-01-01) -> TID(Page#1, Slot#2) ]                    |
|  [ ('COMPLETED', 2026-01-05) -> TID(Page#1, Slot#3) ]                    |
|  [ ('PENDING',   2026-01-02) -> TID(Page#4, Slot#1) ]                    |
|  [ ('PENDING',   2026-01-08) -> TID(Page#4, Slot#2) ]                    |
+--------------------------------------------------------------------------+
| QUERY 1: WHERE status = 'PENDING'                                         |
|   -> Binary search status = 'PENDING', scans range. (INDEX SCAN USED!)   |
|                                                                          |
| QUERY 2: WHERE created_at > '2026-01-01'                                 |
|   -> status is missing! Dates are scattered across all statuses!         |
|   -> LEFTMOST PREFIX RULE BROKEN! (INDEX CANNOT BE USED DIRECTLY!)       |
|                                                                          |
| QUERY 3: WHERE status = 'PENDING' AND created_at > '2026-01-01'          |
|   -> Binary search 'PENDING', then range-scan created_at. (OPTIMAL!)      |
+--------------------------------------------------------------------------+
| POSTGRESQL VISIBILITY MAP (VM) & INDEX-ONLY SCAN:                        |
|  B-Tree Leaf -> TID(Page#4, Slot#1)                                      |
|  Engine checks Visibility Map: Page#4 All-Visible bit = 1 (All committed)|
|  -> SKIPS HEAP TABLE READ ENTIRELY! (10x faster execution!)              |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'All-Visible Bit', size: '1 Bit per Page', description: { en: 'Indicates all tuples on 8KB page are visible to all current and future transactions', vi: 'Bit đánh dấu toàn bộ tuple trên trang 8KB hiển thị với mọi giao dịch, cho phép Index-Only Scan' } },
      { name: 'INCLUDE Columns', size: 'Stored in Leaves Only', description: { en: 'Non-key payload attributes stored strictly in leaf pages, not internal routing nodes', vi: 'Các cột tải trọng phụ chỉ lưu tại trang lá, không chiếm chỗ tại các nút nhánh của cây' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Advanced Indexing is the science of designing physical database access structures that minimize disk page transfers and CPU branch instructions. While single-column B-Trees are familiar, enterprise production workloads demand sophisticated index topologies: Composite Indexes governed by the Leftmost Prefix Rule, Covering Indexes that eliminate heap table dereferences through Index-Only Scans, Index Condition Pushdown (ICP) that prunes non-qualifying rows inside the storage engine, Bitmap Index Scans that convert random I/O into sequential disk sweeps, and Partial / Expression Indexes that minimize storage overhead.',
      vi: 'Kỹ Thuật Đánh Chỉ Mục Nâng Cao (Advanced Indexing) là nghệ thuật thiết kế các cấu trúc truy cập vật lý nhằm giảm thiểu tối đa số trang đĩa phải đọc và chỉ lệnh rẽ nhánh CPU. Mặc dù B-Tree đơn cột rất phổ biến, các hệ thống doanh nghiệp thực tế luôn đòi hỏi các cấu trúc chỉ mục tinh vi: Chỉ mục Tổ hợp (Composite Index) vận hành theo Quy tắc Tiền tố Ngoài cùng Bên trái, Chỉ mục Bao phủ (Covering Index) triệt tiêu hoàn toàn việc đọc bảng qua Index-Only Scan, Đẩy Điều Kiện Xuống Chỉ Mục (Index Condition Pushdown - ICP) loại bỏ dòng không khớp ngay tại tầng lưu trữ, Quét Bitmap (Bitmap Index Scan) biến I/O ngẫu nhiên thành quét tuần tự, và Chỉ mục Một phần (Partial Index) giúp tối ưu hóa dung lượng lưu trữ.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Composite Index & The Leftmost Prefix Rule: When an index is defined on multiple columns (CREATE INDEX idx ON orders(status, created_at)), keys are sorted lexicographically: first by status, and then by created_at ONLY among rows with identical status values. This gives rise to the foundational Leftmost Prefix Rule: (1) A query filtering WHERE status = ? can use the index efficiently; (2) A query filtering WHERE status = ? AND created_at > ? uses the index with maximal efficiency (equality narrows to a contiguous slice, then range-scans the slice); (3) BUT a query filtering ONLY WHERE created_at > ? CANNOT use the index directly for a range scan because dates are scattered across all different status groups! The B-Tree can only be scanned as an index-skip-scan or full index sweep.',
        vi: '1. Chỉ Mục Tổ Hợp & Quy Tắc Tiền Tố Ngoài Cùng Bên Trái (Leftmost Prefix Rule): Khi một chỉ mục được tạo trên nhiều cột (CREATE INDEX idx ON orders(status, created_at)), các khóa được sắp xếp theo thứ tự từ điển: đầu tiên theo status, và chỉ sắp theo created_at giữa các dòng có cùng status. Điều này sinh ra Quy tắc Tiền tố Ngoài cùng Bên trái: (1) Truy vấn lọc WHERE status = ? tận dụng index rất tốt; (2) Truy vấn lọc WHERE status = ? AND created_at > ? đạt hiệu năng tối đa (phép bằng cô lập một dải liền kề, sau đó quét dải theo ngày); (3) NHƯNG truy vấn CHỈ lọc WHERE created_at > ? HOÀN TOÀN KHÔNG THỂ quét dải trực tiếp trên index vì các mốc thời gian bị phân tán rải rác ở khắp các nhóm status khác nhau! CSDL buộc phải bỏ qua index hoặc quét toàn bộ cây index.'
      },
      {
        en: '2. Covering Indexes & Index-Only Scans: A standard B-Tree index contains only indexed key values and a physical Tuple ID (TID) pointing to the heap table. When a query requests non-indexed columns (SELECT id, customer_id, total_amount), the engine must fetch the corresponding 8KB heap page for every matched row—incurring devastating random I/O. A Covering Index includes all requested columns inside the index itself (CREATE INDEX idx ON orders(status, created_at) INCLUDE (total_amount, customer_id)). In PostgreSQL, if the Visibility Map confirms that the target heap page has not been modified by active transactions (All-Visible bit = 1), the engine satisfies the entire query directly from the B-Tree leaves without reading a single byte from the heap table (Index-Only Scan)!',
        vi: '2. Chỉ Mục Bao Phủ (Covering Index) & Quét Thuần Chỉ Mục (Index-Only Scan): Một B-Tree thông thường chỉ chứa các cột khóa và mã định danh dòng TID trỏ vào bảng heap. Khi câu lệnh cần đọc thêm các cột khác (SELECT id, customer_id, total_amount), engine bắt buộc phải đọc trang đĩa 8KB của bảng heap cho từng dòng khớp—gây ra I/O ngẫu nhiên khủng khiếp. Chỉ mục Bao phủ (Covering Index) lưu toàn bộ các cột cần thiết ngay bên trong cây index (bằng mệnh đề INCLUDE). Trong PostgreSQL, nếu Bản đồ Hiển thị (Visibility Map) xác nhận trang bảng không bị sửa bởi transaction nào đang chạy (All-Visible bit = 1), engine sẽ trả về kết quả trực tiếp 100% từ các trang lá B-Tree mà không cần chạm vào bảng heap dù chỉ 1 byte (Index-Only Scan)!'
      },
      {
        en: '3. Index Condition Pushdown (ICP): Introduced in MySQL 5.6 and modern database engines, ICP optimizes queries where an index contains multiple columns, but a range predicate prevents subsequent columns from being used for B-Tree traversal (e.g., WHERE zip_code = "10001" AND last_name LIKE "%SON" AND address LIKE "%STREET%"). Without ICP, the storage engine reads the index for zip_code, fetches the full row from the clustered index / heap, and passes it to the server SQL executor to evaluate the LIKE conditions. With ICP, the storage engine evaluates the LIKE condition directly against the index leaf record; if it fails, the row is discarded immediately without fetching the clustered index or heap page, reducing physical table page I/O by 90-99%.',
        vi: '3. Đẩy Điều Kiện Xuống Chỉ Mục (Index Condition Pushdown - ICP): Ra mắt từ MySQL 5.6 và các CSDL hiện đại, ICP tối ưu các truy vấn có nhiều điều kiện lọc nhưng không thể áp dụng phép duyệt cây B-Tree cho toàn bộ các cột (ví dụ: WHERE zip_code = "10001" AND last_name LIKE "%SON" AND address LIKE "%STREET%"). Nếu không có ICP, tầng lưu trữ đọc index tìm zip_code, đọc nguyên cả dòng từ bảng chính, rồi đẩy lên tầng SQL server để kiểm tra chuỗi LIKE. Khi bật ICP, tầng lưu trữ kiểm tra điều kiện LIKE trực tiếp ngay trên bản ghi lá của index; nếu không khớp, dòng bị vứt bỏ lập tức mà không cần tốn một lần đọc bảng chính nào, giảm từ 90-99% số lần đọc đĩa.'
      },
      {
        en: '4. Clustered Index (InnoDB) vs Heap Table (PostgreSQL): The physical storage architecture dictates secondary index mechanics: (A) MySQL InnoDB Clustered Index: Table data is stored directly in the leaf pages of the PRIMARY KEY B+ Tree. Secondary indexes store the Primary Key value as their pointer. Looking up a row via a secondary index requires two B-Tree traversals: secondary index -> primary key -> clustered index leaf (Secondary Lookup). (B) PostgreSQL Heap Table: Table data is stored in un-ordered 8KB Slotted Pages. All B-Tree indexes store direct physical disk pointers: Tuple ID (BlockNumber, SlotNumber). Looking up a row requires only 1 B-Tree traversal + 1 direct heap page read. However, heap updates generate dead tuples and require index pointer updates unless mitigated by Heap-Only Tuples (HOT).',
        vi: '4. Chỉ Mục Gom Cụm (Clustered Index trong MySQL InnoDB) vs Bảng Heap (PostgreSQL): Kiến trúc lưu trữ vật lý chi phối trực tiếp cơ chế hoạt động của chỉ mục phụ: (A) Clustered Index của InnoDB: Dữ liệu toàn bộ bảng được cất trực tiếp ngay tại các trang lá của cây B+ Tree khóa chính (PRIMARY KEY). Các chỉ mục phụ lưu giá trị khóa chính làm con trỏ. Do đó, tra cứu qua chỉ mục phụ phải duyệt qua 2 cây B-Tree liên tiếp: duyệt cây phụ lấy khóa chính -> duyệt cây chính để lấy dữ liệu dòng (hiện tượng Secondary Lookup). (B) Bảng Heap của PostgreSQL: Dữ liệu được lưu trong các trang Slotted Page 8KB không có thứ tự. Mọi index đều lưu con trỏ vật lý trực tiếp: TID (Số khối trang, Số slot). Tra cứu chỉ tốn đúng 1 lần duyệt B-Tree + 1 lần đọc thẳng vào trang heap.'
      },
      {
        en: '5. Bitmap Index Scan & Index Bloat: When a query matches thousands of rows scattered across a table, a standard Index Scan incurs high-cost random seeks across disk sectors. PostgreSQL solves this via Bitmap Index Scan: (1) It scans the B-Tree and builds an in-memory Bitmap where each bit represents a physical page or tuple offset; (2) If multiple indexes exist (WHERE status = "PENDING" OR user_id = 42), it executes bitwise AND/OR operations in RAM; (3) It then performs a Bitmap Heap Scan, reading physical disk pages in strict sequential physical order, eliminating random disk thrashing! Crucially, frequent UPDATEs and DELETEs cause Index Bloat (dead index leaf pages). When index bloat exceeds 30%, lookups degrade; online defragmentation requires REINDEX CONCURRENTLY.',
        vi: '5. Quét Bitmap (Bitmap Index Scan) & Hiện Tượng Phình Chỉ Mục (Index Bloat): Khi một truy vấn khớp hàng nghìn dòng nằm rải rác trong bảng, Quét Index thông thường sẽ gây ra các bước nhảy đầu đọc ngẫu nhiên rất tốn thời gian. PostgreSQL giải quyết bằng Bitmap Index Scan: (1) Quét B-Tree và dựng một Bitmap trong RAM, mỗi bit đại diện cho một trang đĩa hoặc con trỏ tuple; (2) Nếu có nhiều index (WHERE status = "PENDING" HOẶC user_id = 42), hệ thống thực hiện phép toán bitwise AND/OR trực tiếp trong RAM; (3) Sau đó chạy Bitmap Heap Scan, đọc các trang đĩa theo đúng thứ tự vật lý tuần tự, triệt tiêu hoàn toàn hiện tượng nhảy đĩa ngẫu nhiên! Đặc biệt, các thao tác UPDATE/DELETE liên tục sẽ gây phình to chỉ mục (Index Bloat). Khi tỷ lệ bloat vượt 30%, cần chạy lệnh REINDEX CONCURRENTLY để dọn dẹp không làm khóa ứng dụng.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Creating a composite index with the wrong column order: putting a range column before an equality column (e.g. ON orders(created_at, status) instead of (status, created_at)). When querying WHERE status = "PENDING" AND created_at > "2026-01-01", the index can only filter by created_at, scanning millions of dates across all statuses rather than isolating the PENDING slice.',
        vi: 'Tạo chỉ mục tổ hợp sai thứ tự cột: đặt cột quét dải trước cột so sánh bằng (như orders(created_at, status) thay vì (status, created_at)). Khi chạy WHERE status = "PENDING" AND created_at > "2026-01-01", index chỉ có thể lọc theo created_at và buộc phải quét qua hàng triệu mốc thời gian của mọi trạng thái thay vì cô lập riêng phân vùng PENDING.'
      },
      {
        en: 'Over-indexing high-write OLTP tables: adding 8 single-column indexes on an orders table slows down every payment INSERT and status UPDATE by 400%, inflates WAL volume, and causes devastating database checkpoint stalls due to dirty index page thrashing.',
        vi: 'Đánh chỉ mục quá đà trên các bảng ghi nhiều (Over-Indexing): tạo 8 index đơn lẻ trên bảng orders làm chậm mỗi lệnh INSERT thanh toán và UPDATE trạng thái tới 4 lần, làm phình to file WAL và gây tắc nghẽn checkpoint máy chủ do phải xả quá nhiều trang index bẩn.'
      },
      {
        en: 'Index bloat in PostgreSQL surviving normal VACUUM: standard VACUUM cleans dead heap tuples and marks index slots dead, but does NOT return index page blocks to the OS or re-balance sparse B-Tree pages. Over time, an index can consume 80GB for 10GB of live data! Solution: Schedule periodic REINDEX CONCURRENTLY.',
        vi: 'Phình to chỉ mục (Index Bloat) không thể dọn dẹp bằng VACUUM thường: lệnh VACUUM thường chỉ dọn dòng chết trong bảng heap và đánh dấu slot index chết, chứ KHÔNG trả lại dung lượng file index cho hệ điều hành và không gom lại các trang B-Tree thưa thớt. Qua thời gian, một file index có thể phình lên 80GB dù dữ liệu sống chỉ có 10GB! Giải pháp: Lên lịch chạy REINDEX CONCURRENTLY định kỳ.'
      }
    ]
  },

  steps: [
    {
      id: 'leftmost-eval',
      title: { en: 'Composite B-Tree & Leftmost Prefix Traversal', vi: 'Duyệt Composite B-Tree & Quy tắc Tiền tố Trái' },
      phase: 'Step 1: Key Navigation',
      description: {
        en: 'Root-to-leaf binary search matching leading composite column prefix (e.g. status == "PENDING").',
        vi: 'Tra cứu nhị phân từ gốc tới lá so khớp tiền tố cột đầu tiên của index tổ hợp.'
      },
      diskIoBehavior: { en: 'Traverses 3 to 4 B-Tree branch and leaf pages in buffer memory.', vi: 'Duyệt 3 đến 4 trang nhánh và trang lá B-Tree trong bộ nhớ đệm.' },
      javaCodeLineMatch: 'int leafOffset = bTree.searchPrefix(statusKey);'
    },
    {
      id: 'icp-filter',
      title: { en: 'Index Condition Pushdown (ICP) In-Engine Check', vi: 'Kiểm tra Đẩy Điều Kiện Xuống Chỉ Mục (ICP)' },
      phase: 'Step 2: Engine Predicate Evaluation',
      description: {
        en: 'Evaluate secondary column predicates directly against index leaf payload before touching heap.',
        vi: 'Đánh giá các điều kiện lọc cột phụ trực tiếp trên dữ liệu trang lá index trước khi đọc bảng heap.'
      },
      diskIoBehavior: { en: 'Zero heap disk I/O; filters out non-qualifying tuples in CPU.', vi: 'Không tốn I/O đọc bảng heap; loại bỏ dòng sai ngay trên CPU.' },
      javaCodeLineMatch: 'if (icpFilter.test(indexLeafTuple))'
    },
    {
      id: 'covering-scan',
      title: { en: 'Covering Index / Visibility Map Heap Bypass', vi: 'Covering Index & Bỏ qua Đọc Bảng Heap' },
      phase: 'Step 3: Tuple Materialization',
      description: {
        en: 'If columns are covered and Visibility Map confirms page is all-visible, skip heap read completely.',
        vi: 'Nếu cột được bao phủ (Covering) và Visibility Map xác nhận trang an toàn, bỏ qua hoàn toàn việc đọc bảng.'
      },
      diskIoBehavior: { en: '100% Index-Only Scan: Zero heap page reads from storage.', vi: 'Quét thuần chỉ mục 100%: Hoàn toàn không tốn I/O đọc bảng từ ổ cứng.' },
      javaCodeLineMatch: 'if (visibilityMap.isAllVisible(pageId)) return extractFromIndex(leaf);'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Advanced Indexing Subsystem',
      implementationName: 'B-Tree with INCLUDE Clauses & Visibility Map',
      keyMechanism: {
        en: 'Supports CREATE INDEX ... INCLUDE (payload_cols) for Covering Indexes, Partial Indexes (WHERE active = true), Expression Indexes (LOWER(email)), and Bitmap Index Scans.',
        vi: 'Hỗ trợ mệnh đề INCLUDE để tạo Covering Index, Chỉ mục một phần (Partial Index), Chỉ mục trên biểu thức (Expression Index) và cơ chế Quét Bitmap (Bitmap Index Scan).'
      },
      defaultTuningConfig: 'enable_indexonlyscan = on, enable_bitmapscan = on',
      architectureNote: {
        en: 'Index-Only Scans strictly depend on the Visibility Map (VM). If VACUUM has not run recently to set the all-visible bits, PostgreSQL falls back to fetching heap pages to verify tuple visibility.',
        vi: 'Index-Only Scan phụ thuộc hoàn toàn vào Visibility Map. Nếu không chạy VACUUM thường xuyên để bật các bit all-visible, Postgres buộc phải đọc bảng heap để kiểm tra trạng thái hiển thị của tuple.'
      }
    },
    {
      engine: 'MySQL InnoDB Secondary Indexing',
      implementationName: 'Index Condition Pushdown (ICP) & Clustered B+ Tree',
      keyMechanism: {
        en: 'Secondary index leaf stores the clustered primary key. Evaluates pushed WHERE conditions in the storage engine handler before reading the primary key B+ Tree.',
        vi: 'Trang lá chỉ mục phụ lưu khóa chính clustered. Thực thi kiểm tra điều kiện WHERE đẩy xuống ngay tại tầng storage handler trước khi tra cứu vào cây B+ Tree chính.'
      },
      defaultTuningConfig: 'optimizer_switch = "index_condition_pushdown=on"',
      architectureNote: {
        en: 'ICP dramatically cuts the number of times InnoDB must access the clustered index and reduces the number of rows transferred to the MySQL server layer.',
        vi: 'ICP giảm triệt để số lần InnoDB phải truy xuất vào Clustered Index và giảm thiểu lượng dòng dữ liệu chuyển giao lên tầng máy chủ MySQL.'
      }
    },
    {
      engine: 'Oracle Database (19c / 23ai)',
      implementationName: 'Bitmap Indexes, Function-Based Indexes & Invisible Indexes',
      keyMechanism: {
        en: 'Bitmap Indexes compress rowids into bit arrays via run-length encoding for low-cardinality columns (e.g. status, gender) in Data Warehouses. Function-Based Indexes evaluate deterministic expressions (e.g. UPPER(email)) and store the result in B*Tree leaves.',
        vi: 'Chỉ mục Bitmap nén rowid thành mảng bit bằng thuật toán nén run-length cho các cột có ít giá trị phân biệt (như status, giới tính) trong Data Warehouse. Function-Based Index tính toán biểu thức tiền định (như UPPER(email)) và lưu trực tiếp kết quả vào lá B*Tree.'
      },
      defaultTuningConfig: 'CREATE BITMAP INDEX idx_orders_status ON orders(status); CREATE INDEX idx_func ON users(UPPER(email));',
      architectureNote: {
        en: 'Warning: Never use Bitmap Indexes in high-concurrency OLTP! Updating a row locks the entire bitmap segment (hundreds of adjacent rows), causing catastrophic transaction lock waits.',
        vi: 'Cảnh báo: Tuyệt đối không dùng Bitmap Index cho hệ thống OLTP ghi nhiều! Cập nhật 1 dòng sẽ khóa toàn bộ phân đoạn bitmap chứa hàng trăm dòng lân cận, gây nghẽn khóa dây chuyền.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Covering Indexes eliminate heap table I/O, accelerating read queries by 5x-20x.', vi: 'Covering Index triệt tiêu hoàn toàn I/O đọc bảng heap, tăng tốc truy vấn đọc từ 5 đến 20 lần.' },
      { en: 'Partial Indexes index only relevant records (e.g. unread notifications), saving 90% index disk storage.', vi: 'Partial Index chỉ đánh chỉ mục các bản ghi cần thiết (như thông báo chưa đọc), tiết kiệm 90% dung lượng đĩa.' }
    ],
    cons: [
      { en: 'Composite indexes are directional; omitting the leftmost prefix renders the B-Tree unusable for range scans.', vi: 'Composite Index có tính định hướng; nếu thiếu cột tiền tố trái nhất sẽ khiến cây B-Tree không thể quét dải.' },
      { en: 'Every additional index adds write amplification: slows down INSERT/UPDATE/DELETE and generates WAL churn.', vi: 'Mỗi index tạo thêm làm tăng độ khuếch đại ghi: làm chậm các lệnh ghi và tăng dung lượng nhật ký WAL.' }
    ],
    writeAmplification: {
      en: 'High: Modifying an indexed column requires updating the heap page, writing WAL, and traversing/updating the secondary B-Tree.',
      vi: 'Cao: Sửa một cột có index đòi hỏi ghi trang heap, ghi log WAL và duyệt/cập nhật cây B-Tree phụ tương ứng.'
    },
    recoveryGuarantee: {
      en: 'All B-Tree index updates are fully WAL-logged (nbtree WAL records); crash recovery guarantees 100% index integrity.',
      vi: 'Mọi thao tác cập nhật B-Tree đều được ghi nhận vào WAL; phục hồi sau sự cố bảo đảm 100% tính toàn vẹn chỉ mục.'
    }
  },

  springBootCode: `package com.enterprise.database.indexing;

import jakarta.persistence.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Enterprise Spring Boot Demonstration of Advanced Composite Index Mapping.
 */
@Entity
@Table(
    name = "orders",
    indexes = {
        // Production Composite Index following Leftmost Prefix Rule:
        // Optimal for: WHERE status = ? AND created_at >= ?
        @Index(name = "idx_orders_status_date", columnList = "status, created_at")
    }
)
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Double totalAmount;

    // Getters and setters...
}

@Repository
interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    // Utilizes idx_orders_status_date with maximal efficiency!
    @Query("SELECT o FROM OrderEntity o WHERE o.status = :status AND o.createdAt >= :since")
    List<OrderEntity> findRecentOrdersByStatus(String status, Instant since);
}`,

  sqlQueries: `-- LAB: Testing the Leftmost Prefix Rule on Composite Index
-- Step 1: Create the target table and composite index
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    customer_id INT NOT NULL
);

CREATE INDEX idx_orders_status_date ON orders(status, created_at);

-- QUERY 1: WHERE status = ?
-- EXPLAIN output: Index Scan using idx_orders_status_date (OPTIMAL: Leading column matched)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE status = 'PENDING';

-- QUERY 2: WHERE created_at > ?
-- EXPLAIN output: Seq Scan on orders (INDEX NOT USED: Leftmost prefix violated!)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days';

-- QUERY 3: WHERE status = ? AND created_at > ?
-- EXPLAIN output: Index Scan using idx_orders_status_date (OPTIMAL: Equality + Range)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE status = 'PENDING' AND created_at > NOW() - INTERVAL '7 days';

-- LAB PART 2: Covering Index & Index-Only Scan with INCLUDE Clause
CREATE INDEX idx_orders_covering ON orders(status, created_at) INCLUDE (total_amount);

-- EXPLAIN output: Index Only Scan using idx_orders_covering (0 Heap Page Reads!)
EXPLAIN (ANALYZE, BUFFERS)
SELECT status, created_at, total_amount 
FROM orders 
WHERE status = 'COMPLETED' AND created_at > NOW() - INTERVAL '1 day';`,

  productionProblemCase: {
    title: {
      en: 'E-Commerce Order Listing 12-Second Latency: The Uncovered Index & Random I/O Trap',
      vi: 'Trang Danh Sách Đơn Hàng Tải 12 Giây: Cái Bẫy Chỉ Mục Không Bao Phủ & I/O Ngẫu Nhiên'
    },
    businessContext: {
      en: 'A high-growth retail platform serves a merchant seller portal where 15,000 sellers query their recent store orders (SELECT id, status, created_at, total_amount WHERE seller_id = ? ORDER BY created_at DESC LIMIT 20).',
      vi: 'Sàn thương mại điện tử phục vụ cổng thông tin nhà bán hàng nơi 15.000 thương nhân tra cứu đơn hàng gần đây (SELECT id, status, created_at, total_amount WHERE seller_id = ? ORDER BY created_at DESC LIMIT 20).'
    },
    problemDescription: {
      en: 'During peak morning hours, the merchant order listing API degraded from 45ms to 12.8 seconds, causing seller browser timeouts. The database had an existing index: CREATE INDEX idx_seller ON orders(seller_id). When a large merchant with 800,000 orders loaded their portal, the database used idx_seller to find 800,000 TIDs, then executed 800,000 random disk page fetches to read created_at and total_amount from the heap table, followed by an in-memory Sort across 800,000 rows to find the top 20! Disk read IOPS hit 100% capacity and the server collapsed.',
      vi: 'Vào giờ cao điểm sáng, API danh sách đơn hàng bị chậm từ 45ms lên 12.8 giây khiến giao diện người bán bị xoay đơ. Bảng orders có sẵn index: CREATE INDEX idx_seller ON orders(seller_id). Khi một thương nhân lớn có 800.000 đơn hàng mở cổng portal, database dùng idx_seller tìm thấy 800.000 địa chỉ TID, sau đó thực hiện tới 800.000 lần đọc ngẫu nhiên vào bảng heap để lấy created_at và total_amount, rồi chạy thuật toán Sort trên 800.000 dòng để lấy ra 20 dòng đầu! Ổ cứng NVMe chạm trần 100% IOPS và máy chủ tê liệt.'
    },
    whyNaiveFails: {
      en: 'Developers added LIMIT 20 to the query. However, because the index was only on (seller_id) without (created_at DESC), the database still had to read all 800,000 rows from the heap table to sort them by date before applying the LIMIT!',
      vi: 'Lập trình viên thêm LIMIT 20 vào câu lệnh. Tuy nhiên, do index chỉ đánh trên (seller_id) mà không có (created_at DESC), database vẫn bắt buộc phải kéo đủ 800.000 dòng từ bảng heap vào để sắp xếp ngày tháng xong xuôi rồi mới cắt lấy 20 dòng!'
    },
    coreSolution: {
      en: '1. Replace the single-column index with a Composite Covering Index incorporating sorting order and the INCLUDE clause: CREATE INDEX CONCURRENTLY idx_orders_seller_date_cov ON orders(seller_id, created_at DESC) INCLUDE (status, total_amount). 2. Run VACUUM ANALYZE orders to refresh the Visibility Map. Result: The optimizer switched from Index Scan + Heap Fetches + In-Memory Sort to an Index-Only Scan with pre-sorted B-Tree leaf traversal. Because the B-Tree leaves are already sorted by created_at DESC, the executor simply read the first 20 index entries and stopped immediately! Heap I/O dropped from 800,000 reads to 0, and query response time dropped from 12,800ms down to 1.2ms (a 10,000x improvement).',
      vi: '1. Thay thế index đơn cột bằng Chỉ Mục Bao Phủ Tổ Hợp (Composite Covering Index) kết hợp thứ tự sắp xếp và mệnh đề INCLUDE: CREATE INDEX CONCURRENTLY idx_orders_seller_date_cov ON orders(seller_id, created_at DESC) INCLUDE (status, total_amount). 2. Chạy VACUUM ANALYZE orders để cập nhật Visibility Map. Kết quả: Bộ tối ưu chuyển từ Quét Index + Đọc Heap + Sắp xếp sang Quét Thuần Chỉ Mục (Index-Only Scan) tận dụng thứ tự lá B-Tree đã sắp sẵn. Vì các trang lá đã được xếp sẵn theo created_at DESC, executor chỉ việc đọc đúng 20 bản ghi đầu tiên ở lá cây rồi dừng lại ngay lập tức! Số lần đọc đĩa bảng heap giảm từ 800.000 xuống đúng 0 lần, và thời gian phản hồi truy vấn giảm từ 12.800ms xuống chỉ còn 1.2ms (nhanh gấp 10.000 lần).'
    },
    architectureImpact: {
      en: 'Index architecture is not just about WHERE equality filtering; designing for sort elimination and heap bypass via covering indexes delivers astronomical production gains.',
      vi: 'Kiến trúc đánh chỉ mục không đơn thuần chỉ phục vụ phép lọc WHERE; việc thiết kế chỉ mục để triệt tiêu khâu sắp xếp và bỏ qua bảng heap qua Covering Index mang lại bước nhảy vọt không tưởng trong môi trường thực tế.'
    }
  },

  javaCode: `package com.database.internals.indexing;

import java.util.*;

/**
 * Pure Java 21 demonstration of Composite Index Leftmost Prefix Rule & Covering Scan.
 */
public class CompositeIndexEngine {

    public record IndexKey(String status, long timestamp) implements Comparable<IndexKey> {
        @Override
        public int compareTo(IndexKey other) {
            // Lexicographical order: first by status, then by timestamp
            int statusComp = this.status.compareTo(other.status);
            if (statusComp != 0) return statusComp;
            return Long.compare(this.timestamp, other.timestamp);
        }
    }

    public record IndexLeafPayload(IndexKey key, int tupleId, double totalAmount) {}

    public static class CompositeBTree {
        private final List<IndexLeafPayload> entries = new ArrayList<>();

        public void insert(String status, long timestamp, int tupleId, double totalAmount) {
            entries.add(new IndexLeafPayload(new IndexKey(status, timestamp), tupleId, totalAmount));
            entries.sort(Comparator.comparing(IndexLeafPayload::key));
        }

        // QUERY 1 & 3: WHERE status = ? AND timestamp >= ? (Follows Leftmost Prefix)
        public List<IndexLeafPayload> searchByStatusAndDate(String status, long minTimestamp) {
            List<IndexLeafPayload> results = new ArrayList<>();
            for (var entry : entries) {
                if (entry.key().status().equals(status) && entry.key().timestamp() >= minTimestamp) {
                    results.add(entry);
                }
            }
            return results;
        }

        // QUERY 2: WHERE timestamp >= ? (Violates Leftmost Prefix! Full index scan required)
        public boolean canUseIndexForRangeOnly(String queriedColumn) {
            // Leftmost column is 'status'. Querying 'timestamp' alone cannot use index binary seek!
            return "status".equalsIgnoreCase(queriedColumn);
        }
    }

    public static void main(String[] args) {
        CompositeBTree index = new CompositeBTree();
        index.insert("COMPLETED", 1700000000L, 101, 150.0);
        index.insert("COMPLETED", 1700005000L, 102, 320.0);
        index.insert("PENDING",   1700001000L, 103, 85.0);
        index.insert("PENDING",   1700009000L, 104, 210.0);

        System.out.println("Can query 'WHERE created_at > ?' use B-Tree seek directly?");
        System.out.println("  -> " + index.canUseIndexForRangeOnly("created_at") + " (Leftmost Prefix Rule Broken!)");

        System.out.println("\nExecuting 'WHERE status = PENDING AND created_at >= 1700002000':");
        var matched = index.searchByStatusAndDate("PENDING", 1700002000L);
        for (var res : matched) {
            System.out.printf("  -> Matched Key: %s, TID: %d, Covered Amount: $%.2f%n",
                res.key(), res.tupleId(), res.totalAmount());
        }
    }
}
`
};
