import type { DatabaseTopic } from '../types';

export const queryOptimizerCbo: DatabaseTopic = {
  id: 'query-optimizer-cbo',
  category: 'indexing-techniques',
  name: 'Cost-Based Query Optimizer (CBO)',
  tagline: {
    en: 'The database brain: statistics, histograms, selectivity estimation, join order dynamic programming, and physical algorithm selection.',
    vi: 'Bộ não của CSDL: bảng thống kê, biểu đồ phân phối Histogram, ước lượng độ chọn lọc, quy hoạch động thứ tự nối bảng và định giá chi phí CBO.'
  },
  difficulty: 3,
  order: 14,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'A declarative query with 4 table joins and 3 filter conditions has thousands of mathematically equivalent execution plans (Join orders: N! * Catalan(N-1) tree shapes; Access paths: SeqScan vs IndexScan; Join algorithms: Nested Loop vs Hash Join vs Sort-Merge). A poorly chosen plan can take 4 hours to finish what an optimal plan executes in 40 milliseconds.',
      vi: 'Một truy vấn khai báo nối 4 bảng kèm 3 điều kiện lọc có hàng nghìn kế hoạch thực thi tương đương về mặt toán học (Số thứ tự nối: N! * Số Catalan hình thái cây; Đường dẫn truy cập: Quét tuần tự vs Quét chỉ mục; Thuật toán nối: Nested Loop vs Hash Join vs Sort-Merge). Một kế hoạch tồi có thể mất 4 tiếng để hoàn thành công việc mà một kế hoạch tối ưu xử lý chỉ trong 40 mili-giây.'
    },
    hardwareConstraint: {
      en: 'Physical hardware costs differ drastically: random NVMe 8KB block reads (random_page_cost = 1.1 to 4.0) vs sequential pre-fetched reads (seq_page_cost = 1.0) vs CPU instruction cycles per evaluated tuple (cpu_tuple_cost = 0.01). The optimizer must model these disparate physical costs mathematically.',
      vi: 'Chi phí phần cứng vật lý chênh lệch rất lớn: đọc ngẫu nhiên khối 8KB trên NVMe (random_page_cost = 1.1 đến 4.0) so với đọc tuần tự nạp trước (seq_page_cost = 1.0) so với chu kỳ CPU đánh giá mỗi tuple (cpu_tuple_cost = 0.01). Bộ tối ưu hóa buộc phải mô hình hóa toán học các chi phí vật lý rời rạc này.'
    },
    fundamentalSolution: {
      en: 'The Cost-Based Optimizer (CBO) uses statistical metadata (pg_statistic, histograms, Most Common Values - MCV, null fractions) to estimate operator Selectivity and Output Cardinality (E = N * selectivity). It then enumerates plan permutations using System R Dynamic Programming or Genetic Algorithms, assigning each plan an estimated cost score based on expected disk I/O pages and CPU instruction cycles.',
      vi: 'Bộ Tối Ưu Hóa Dựa Trên Chi Phí (CBO) sử dụng siêu dữ liệu thống kê (pg_statistic, biểu đồ tần suất Histogram, Danh sách giá trị phổ biến nhất - MCV, tỷ lệ NULL) để ước lượng Độ chọn lọc (Selectivity) và Số dòng đầu ra (Cardinality E = N * selectivity). Sau đó, nó duyệt các hoán vị kế hoạch bằng Quy hoạch động System R hoặc Giải thuật Di truyền, tính điểm chi phí dựa trên số trang đĩa I/O và chu kỳ chỉ lệnh CPU dự kiến.'
    },
    math: {
      formula: 'E = N \\times \\text{selectivity}, \\quad \\text{Cost} = N_{\\text{pages}} \\times \\text{seq\\_page\\_cost} + N_{\\text{tuples}} \\times \\text{cpu\\_tuple\\_cost}',
      description: {
        en: 'The optimizer calculates expected cardinality E = N * selectivity. Physical cost formula models total weighted resource consumption where disk page reads and CPU evaluation cycles are weighted against configurable database cost constants.',
        vi: 'Bộ tối ưu hóa tính toán số dòng ước lượng E = N * selectivity. Công thức chi phí vật lý tổng hợp lượng tài nguyên tiêu thụ, trong đó số trang đĩa đọc vào và chu kỳ kiểm tra CPU được nhân với các hằng số chi phí chuẩn hóa của hệ thống.'
      },
      timeComplexity: 'Join Order Enumeration: O(3^J) via System R Dynamic Programming, or O(J^2) via Genetic Algorithms for large join graphs (J > 12)',
      spaceComplexity: 'O(2^J) memory memoization table during dynamic programming join enumeration',
      ioCostFormula: 'Estimated Cost = (Disk Blocks × page_cost) + (Tuple Evaluations × cpu_tuple_cost) + (Operator Startup Cost)'
    }
  },

  pageLayout: {
    title: {
      en: 'PostgreSQL Cost-Based Optimizer Architecture & Statistics Engine',
      vi: 'Kiến trúc Bộ Tối Ưu Hóa Dựa Trên Chi Phí & Cơ chế Thống kê trong PostgreSQL'
    },
    description: {
      en: 'How the CBO uses MCV lists and Equi-Depth Histograms to compute Cardinality, rank Join paths, and choose physical algorithms.',
      vi: 'Cách CBO sử dụng danh sách giá trị phổ biến nhất (MCV) và biểu đồ tần suất Equi-Depth để tính Cardinality và chọn thuật toán nối bảng.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| SYSTEM CATALOG STATISTICS (pg_statistic / ANALYZE):                      |
|  - Table orders: N = 10,000,000 Rows, RelPages = 125,000 Pages           |
|  - Column status:                                                        |
|      MCV List: ['COMPLETED' -> 85%, 'SHIPPED' -> 12%]                   |
|      Histogram Bounds (remaining 3%): ['CANCELLED', 'PENDING', 'RETURNED']|
+--------------------------------------------------------------------------+
| SELECTIVITY ESTIMATION:                                                  |
|  Query: WHERE status = 'PENDING'                                         |
|  -> Not in MCV list. Evaluated against Histogram: Selectivity = 0.01 (1%)|
|  -> Estimated Cardinality E = 10,000,000 * 0.01 = 100,000 Rows           |
+--------------------------------------------------------------------------+
| PHYSICAL JOIN ALGORITHM SELECTION (orders o JOIN customers c):           |
|                                                                          |
|  Option A: Nested Loop Join                                              |
|    Cost = Cost(Outer) + Cardinality(Outer) * Cost(Inner Index Probe)    |
|    If Outer = 100,000 -> 100,000 * 4 I/Os = 400,000 I/Os (SLOW!)         |
|                                                                          |
|  Option B: Hash Join (Selected by Optimizer!)                            |
|    Cost = Cost(Build In-Memory Hash Table on customers) + Scan(orders)   |
|    Total Cost = 1,200 + 125,000 = 126,200 (WINNER: 3.2x FASTER!)         |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'stadistinct', size: 'Float4', description: { en: 'Estimated number of distinct values in column (>0 = exact count, <0 = ratio)', vi: 'Số lượng giá trị phân biệt ước lượng (>0 = số lượng tuyệt đối, <0 = tỷ lệ)' } },
      { name: 'stanullfrac', size: 'Float4', description: { en: 'Percentage fraction of column entries that contain NULL values', vi: 'Tỷ lệ phần trăm các dòng trong bảng chứa giá trị NULL' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'The Cost-Based Query Optimizer (CBO) is the intellectual engine of a relational database system. Because SQL is declarative, there are often millions of mathematically valid execution plans for a single query. The CBO analyzes database catalog statistics, histograms, and hardware cost parameters to estimate the physical resource consumption (disk I/O and CPU instructions) of each candidate plan, selecting the plan with the lowest estimated total cost. When developer queries run slowly, the root cause is almost invariably a failure of optimizer cardinality estimation.',
      vi: 'Bộ Tối Ưu Hóa Truy Vấn Dựa Trên Chi Phí (Cost-Based Optimizer - CBO) là bộ não xử lý trung tâm của hệ quản trị cơ sở dữ liệu quan hệ. Do SQL mang tính thuần khai báo, một câu truy vấn có thể có hàng triệu kế hoạch thực thi tương đương nhau về mặt toán học. CBO phân tích siêu dữ liệu thống kê, biểu đồ phân phối tần suất và các thông số chi phí phần cứng để ước lượng lượng tài nguyên tiêu thụ (I/O đọc đĩa và chu kỳ lệnh CPU) của từng phương án khả dĩ, từ đó chọn ra kế hoạch có tổng chi phí thấp nhất. Khi một câu lệnh SQL chạy chậm đột biến, nguyên nhân gốc rễ hầu như luôn xuất phát từ việc CBO ước lượng sai số dòng (Cardinality Misestimation).'
    },
    deepDiveParagraphs: [
      {
        en: '1. Catalog Statistics, MCV Lists & Equi-Depth Histograms: How does the optimizer know how many rows a query will match without executing it? Through the ANALYZE command, which populates the system catalog (pg_statistic). For each column, the engine stores: (1) Null Fraction (stanullfrac): fraction of null entries; (2) Distinct Values (stadistinct): number of distinct values; (3) Most Common Values (MCV) and Most Common Frequencies (MCF): the top K most frequent values and their exact percentages (e.g. status = "COMPLETED" is 85%); and (4) Equi-Depth Histograms: for values outside the MCV list, the data range is split into buckets containing equal numbers of rows, enabling accurate selectivity calculation for range conditions (WHERE age BETWEEN 25 AND 35).',
        vi: '1. Siêu Dữ Liệu Thống Kê, Danh Sách MCV & Biểu Đồ Tần Suất Equi-Depth: Làm thế nào bộ tối ưu biết được câu lệnh sẽ trả về bao nhiêu dòng mà không cần chạy thử? Đó là nhờ lệnh ANALYZE cập nhật định kỳ vào bảng pg_statistic. Với mỗi cột, hệ thống lưu: (1) Tỷ lệ NULL (stanullfrac); (2) Số giá trị phân biệt (stadistinct); (3) Danh sách Giá trị phổ biến nhất (MCV) và Tần suất (MCF): K giá trị xuất hiện nhiều nhất kèm tỷ lệ chính xác (như status = "COMPLETED" chiếm 85%); và (4) Biểu đồ phân phối độ sâu bằng nhau (Equi-Depth Histograms): với các giá trị ngoài MCV, dải dữ liệu được chia thành các thùng chứa số lượng dòng bằng nhau, giúp tính toán độ chọn lọc chính xác cho các phép so sánh dải (WHERE age BETWEEN 25 AND 35).'
      },
      {
        en: '2. Selectivity & Cardinality Estimation (The Core Formula): Selectivity is a real number between 0.0 and 1.0 representing the predicted proportion of table rows satisfying a predicate. For an equality check on an MCV item, Selectivity = MCF[item]. For an equality check outside the MCV list with D distinct values, Selectivity = (1.0 - sum(MCF)) / (D - count(MCV)). For independent combined predicates (WHERE status = "PENDING" AND amount > 500), the optimizer applies the Independence Assumption: Selectivity(A AND B) = Selectivity(A) * Selectivity(B). Output Cardinality is then derived: E = N * Selectivity. If Cardinality is estimated inaccurately, every subsequent join choice will be catastrophic!',
        vi: '2. Ước Lượng Độ Chọn Lọc & Số Dòng Đầu Ra (Cardinality): Độ chọn lọc (Selectivity) là một số thực từ 0.0 đến 1.0 đại diện cho tỷ lệ dự kiến các dòng thỏa mãn điều kiện lọc. Với phép so sánh bằng trên một giá trị nằm trong MCV, Selectivity = MCF[item]. Với giá trị nằm ngoài MCV trong một cột có D giá trị phân biệt, Selectivity = (1.0 - tổng(MCF)) / (D - số lượng MCV). Với nhiều điều kiện kết hợp (WHERE status = "PENDING" AND amount > 500), bộ tối ưu áp dụng Giả định Độc lập: Selectivity(A VÀ B) = Selectivity(A) * Selectivity(B). Số dòng dự kiến được tính theo công thức: E = N * Selectivity. Nếu tính sai Cardinality, mọi quyết định chọn giải thuật nối bảng tiếp theo đều sẽ đi vào ngõ cụt!'
      },
      {
        en: '3. The Three Physical Join Algorithms: (A) Nested Loop Join: Iterates over the outer table and probes the inner table for each row. Ideal when the outer table produces very few rows (< 100) and the inner table has an index on the join key (O(Outer * log(Inner))). If the outer table has 1,000,000 rows, Nested Loop is disastrous! (B) Hash Join: Builds an in-memory Hash Table on the smaller build relation (hashed on join key), then scans the larger probe relation, probing the hash table in O(1) time. Total time is O(Build + Probe). Requires sufficient work_mem to hold the hash table; otherwise, it spills to disk (Multi-Batch Hash Join). (C) Sort-Merge Join: Sorts both relations on the join key (or uses pre-sorted B-Tree indexes) and merges them linearly. Dominates when input relations are already sorted or when join predicates involve inequality (<, <=, >, >=).',
        vi: '3. 3 Thuật Toán Nối Bảng Vật Lý: (A) Nested Loop Join: Lặp qua từng dòng của bảng ngoài và tra cứu vào bảng trong. Cực kỳ tối ưu khi bảng ngoài có rất ít dòng (< 100) và bảng trong có index trên khóa nối (O(Outer * log(Inner))). Nếu bảng ngoài có 1 triệu dòng, Nested Loop sẽ gây thảm họa treo server! (B) Hash Join: Dựng một Bảng Băm trong RAM từ bảng nhỏ hơn (Build Table), sau đó quét qua bảng lớn hơn (Probe Table) để tra cứu bảng băm trong thời gian O(1). Tổng thời gian là tuyến tính O(Build + Probe). Yêu cầu đủ bộ nhớ work_mem để chứa bảng băm, nếu không sẽ bị tràn ra đĩa (Multi-Batch Hash Join). (C) Sort-Merge Join: Sắp xếp cả hai bảng theo khóa nối (hoặc tận dụng B-Tree đã sắp sẵn) rồi chạy con trỏ ghép đôi song song. Vượt trội khi hai bảng đã có thứ tự sẵn hoặc khi điều kiện nối là phép so sánh bất đẳng thức (<, <=, >, >=).'
      },
      {
        en: '4. Join Order Optimization: Dynamic Programming (System R): For a query joining N tables (A JOIN B JOIN C JOIN D), there are N! possible permutations and (2N-2)! / (N-1)! tree shapes (Left-deep vs Bushy trees). The classical Selinger / System R algorithm uses bottom-up dynamic programming: Step 1: Find best single-table access paths (Cost({A}), Cost({B}), ...). Step 2: Enumerate pairs ({A,B}, {A,C}, ...) saving only the cheapest plan for each subset. Step 3: Enumerate triplets ({A,B,C}) using cached pair results. For N <= 12, DP guarantees finding the globally optimal plan in O(3^N) time. For large queries (N > 12), databases switch to Genetic Query Optimization (GEQO) to avoid exponential planning stalls.',
        vi: '4. Tối Ưu Hóa Thứ Tự Nối Bảng (Quy Hoạch Động System R): Với một truy vấn nối N bảng (A JOIN B JOIN C JOIN D), có tới N! hoán vị thứ tự và hàng chục nghìn hình thái cây (Cây lệch trái vs Cây phân nhánh). Thuật toán kinh điển Selinger / System R sử dụng quy hoạch động từ dưới lên: Bước 1: Tìm đường dẫn đọc tối ưu cho từng bảng đơn lẻ. Bước 2: Duyệt từng cặp bảng ({A,B}, {A,C}...) và chỉ lưu lại phương án rẻ nhất cho từng tập con. Bước 3: Duyệt các bộ ba ({A,B,C}) dựa trên kết quả tối ưu của các cặp đã tính. Với N <= 12 bảng, quy hoạch động bảo đảm tìm ra kế hoạch tối ưu toàn cục trong O(3^N). Với các câu lệnh nối quá nhiều bảng (N > 12), CSDL sẽ tự động chuyển sang Giải thuật Di truyền (GEQO) để tránh bị treo đơ CPU trong khâu lập kế hoạch.'
      },
      {
        en: '5. Why Adding an Index Can Make Queries Slower: Developers often assume indexes always accelerate queries. However: (1) Unselective Predicates: If a condition matches 40% of a table, scanning via B-Tree Index requires 40% random I/O page reads (random_page_cost = 4.0), whereas a SeqScan performs sequential reads (seq_page_cost = 1.0) with OS read-ahead buffering. The index scan is 4x slower! (2) Join Plan Derailment: Adding an index on an inner table may trick the optimizer into choosing a Nested Loop Join instead of a Hash Join. If cardinality was underestimated, the resulting loop executes millions of unexpected random index probes, degrading performance by 100x.',
        vi: '5. Tại Sao Thêm Index Lại Có Thể Khiến Query Chậm Hơn: Lập trình viên thường ngộ nhận rằng cứ thêm index là truy vấn sẽ chạy nhanh hơn. Thực tế: (1) Điều kiện lọc có độ chọn lọc kém: Nếu một điều kiện WHERE thỏa mãn tới 40% số dòng của bảng, việc đi qua cây B-Tree đòi hỏi 40% lượt đọc đĩa ngẫu nhiên (random_page_cost = 4.0), trong khi Quét tuần tự (SeqScan) chỉ đọc tuần tự một mạch (seq_page_cost = 1.0) kèm cơ chế nạp trước của HĐH. Quét qua index lúc này chậm hơn gấp 4 lần! (2) Làm chệch hướng kế hoạch nối bảng: Việc tạo thêm index trên bảng trong có thể đánh lừa bộ CBO chọn thuật toán Nested Loop Join thay vì Hash Join. Nếu CBO ước lượng thiếu số dòng, vòng lặp Nested Loop sẽ thực hiện hàng triệu lần tra cứu ngẫu nhiên vào index, làm chậm câu truy vấn tới 100 lần.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Stale Database Statistics Leading to Disastrous Join Plans: When an ETL batch inserts 5,000,000 rows into a table without triggering ANALYZE, the optimizer still believes the table contains 100 rows. It chooses an in-memory Nested Loop Join. In production, that Nested Loop executes 5,000,000 index probes, freezing the database server for hours. Mitigation: Always run ANALYZE target_table immediately following bulk data migrations.',
        vi: 'Thống Kê Lỗi Thời Dẫn Đến Kế Hoạch Nối Bảng Thảm Họa: Khi một luồng ETL nạp thêm 5 triệu dòng vào bảng mà không chạy ANALYZE, bộ CBO vẫn ngây thơ nghĩ bảng chỉ có 100 dòng. Nó tự tin chọn thuật toán Nested Loop Join. Khi chạy thực tế, Nested Loop phải thực thi 5 triệu lần dò đĩa ngẫu nhiên, làm treo cứng database suốt nhiều giờ. Giải pháp: Luôn kích hoạt câu lệnh ANALYZE tên_bảng ngay sau các đợt nạp dữ liệu hàng loạt.'
      },
      {
        en: 'Correlated Column Data Destroying the Independence Assumption: When two columns are correlated (e.g., country = "Vietnam" AND city = "Hanoi"), the optimizer calculates Selectivity(Vietnam) * Selectivity(Hanoi) = 0.01 * 0.005 = 0.00005, estimating 5 rows instead of 500,000! Solution: Create Extended Statistics in PostgreSQL (CREATE STATISTICS stat_geo ON country, city FROM users).',
        vi: 'Dữ Liệu Cột Phụ Thuộc Nhau Phá Vỡ Giả Định Độc Lập: Khi hai cột có quan hệ mật thiết với nhau (như quốc gia = "Vietnam" VÀ thành phố = "Hanoi"), CBO nhân hai xác suất độc lập: Selectivity(Vietnam) * Selectivity(Hanoi) = 0.01 * 0.005 = 0.00005, dự đoán chỉ có 5 dòng trong khi thực tế có tới 500.000 dòng! Giải pháp: Tạo thống kê mở rộng đa cột trong PostgreSQL (CREATE STATISTICS stat_geo ON country, city FROM users).'
      },
      {
        en: 'Insufficient work_mem Causing Hash Join Disk Spills: If a Hash Join requires 120MB to build its in-memory hash table but work_mem is left at the default 4MB, PostgreSQL is forced to partition the hash table into multiple on-disk batches, writing temporary spill files to disk and degrading query execution by 20x.',
        vi: 'Cấu hình work_mem Quá Thấp Gây Tràn Hash Join Xuống Đĩa: Nếu một phép nối Hash Join cần 120MB để dựng bảng băm trong RAM nhưng work_mem chỉ để mặc định 4MB, PostgreSQL buộc phải chia nhỏ bảng băm thành nhiều đợt và ghi các file tạm (disk spill) xuống ổ cứng, làm tốc độ câu lệnh tụt dốc 20 lần.'
      }
    ]
  },

  steps: [
    {
      id: 'statistics',
      title: { en: 'Catalog Statistics & Histogram Evaluation', vi: 'Đánh giá Bảng thống kê & Phân phối Histogram' },
      phase: 'Optimization Phase 1',
      description: {
        en: 'Look up null fractions, MCV lists, and histogram bounds to compute predicate selectivity.',
        vi: 'Tra cứu tỷ lệ null, danh sách MCV và các biên histogram để tính toán độ chọn lọc.'
      },
      diskIoBehavior: { en: 'Reads pg_statistic system catalog pages from buffer pool.', vi: 'Đọc các trang Catalog pg_statistic từ Buffer Pool.' },
      javaCodeLineMatch: 'double selectivity = statsEngine.estimateSelectivity(column, operator, value);'
    },
    {
      id: 'cardinality',
      title: { en: 'Cardinality & Access Path Costing', vi: 'Ước lượng Cardinality & Định giá Đường dẫn' },
      phase: 'Optimization Phase 2',
      description: {
        en: 'Compute E = N * selectivity and compare SeqScan vs IndexScan total cost formulas.',
        vi: 'Tính số dòng E = N * selectivity và so sánh chi phí giữa SeqScan và IndexScan.'
      },
      diskIoBehavior: { en: 'Mathematical simulation of I/O pages based on table relpages.', vi: 'Mô phỏng toán học số trang I/O dựa trên số trang relpages của bảng.' },
      javaCodeLineMatch: 'double cost = (pages * seqPageCost) + (tuples * cpuTupleCost);'
    },
    {
      id: 'join-enumeration',
      title: { en: 'Join Order DP & Physical Algorithm Selection', vi: 'Quy hoạch động Nối bảng & Chọn Thuật toán' },
      phase: 'Optimization Phase 3',
      description: {
        en: 'Enumerate join permutations via dynamic programming and pick NestedLoop, Hash, or Sort-Merge Join.',
        vi: 'Duyệt các hoán vị nối qua quy hoạch động và chọn Nested Loop, Hash Join hoặc Sort-Merge Join.'
      },
      diskIoBehavior: { en: 'Produces final physical execution plan tree; zero disk I/O.', vi: 'Sinh cây kế hoạch thực thi vật lý hoàn chỉnh; 0% I/O đĩa.' },
      javaCodeLineMatch: 'PlanNode bestPlan = dynamicProgrammingJoinOptimizer.findOptimalPlan(query);'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Cost-Based Optimizer',
      implementationName: 'System R Dynamic Programming & GEQO',
      keyMechanism: {
        en: 'Uses dynamic programming for up to 12 joined tables (geqo_threshold). Supports multi-column Extended Statistics (CREATE STATISTICS ... (dependencies, mcv, ndistinct)).',
        vi: 'Sử dụng quy hoạch động System R cho các truy vấn nối tới 12 bảng (geqo_threshold). Hỗ trợ thống kê mở rộng đa cột (CREATE STATISTICS) để khử sai số độc lập.'
      },
      defaultTuningConfig: 'random_page_cost = 1.1 (for NVMe SSDs), work_mem = 64MB, default_statistics_target = 100',
      architectureNote: {
        en: 'Default random_page_cost = 4.0 was designed for mechanical HDDs in the 1990s! On modern NVMe SSDs, setting random_page_cost = 1.1 stops the optimizer from avoiding beneficial index scans.',
        vi: 'Giá trị mặc định random_page_cost = 4.0 vốn dành cho ổ HDD cơ từ thập niên 90! Trên ổ NVMe hiện đại, hạ xuống 1.1 sẽ giúp CBO tự tin chọn index scan thay vì quét toàn bộ bảng.'
      }
    },
    {
      engine: 'MySQL 8.0 Hypergraph Optimizer',
      implementationName: 'Hypergraph Join Optimizer',
      keyMechanism: {
        en: 'MySQL 8.0 replaced the legacy greedy join optimizer with a modern hypergraph-based dynamic programming engine capable of exploring bushy trees and complex outer join reorderings.',
        vi: 'MySQL 8.0 thay thế bộ tối ưu tham lam cũ bằng động cơ quy hoạch động đồ thị siêu phẳng (Hypergraph), có thể khám phá cây nối phân nhánh và sắp xếp lại các phép nối Outer Join phức tạp.'
      },
      defaultTuningConfig: 'optimizer_switch = "hypergraph_optimizer=on"',
      architectureNote: {
        en: 'Implements improved histogram types (Singleton and Equi-Height) for unindexed columns.',
        vi: 'Cung cấp các loại histogram cải tiến (Singleton và Equi-Height) cho các cột không có index.'
      }
    },
    {
      engine: 'Oracle Database (19c / 23ai)',
      implementationName: 'Adaptive Query Optimization & DBMS_STATS',
      keyMechanism: {
        en: 'Adaptive Plans dynamically adapt execution at runtime: if actual row counts differ from compile-time estimates, the engine seamlessly switches a join from Nested Loops to Hash Join during execution. Uses Frequency, Top-Frequency, and Hybrid Histograms.',
        vi: 'Kế hoạch thích ứng (Adaptive Plans) cho phép thay đổi thuật toán ngay lúc runtime: nếu số dòng thực tế sai lệch so với ước lượng, engine tự động chuyển từ Nested Loop sang Hash Join trong khi truy vấn đang chạy. Sử dụng Biểu đồ tần suất Frequency, Top-Frequency và Hybrid Histogram.'
      },
      defaultTuningConfig: 'EXEC DBMS_STATS.GATHER_TABLE_STATS("APP", "ORDERS", estimate_percent => DBMS_STATS.AUTO_SAMPLE_SIZE);',
      architectureNote: {
        en: 'SQL Plan Management (SPM) captures baseline execution plans (SQL Plan Baselines) to prevent plan regressions when database upgrades or optimizer statistics change.',
        vi: 'Bộ quản lý kế hoạch SQL (SPM) đóng băng các đường cơ sở kế hoạch (SQL Plan Baselines) để ngăn ngừa hiện tượng tụt lùi hiệu năng khi nâng cấp CSDL hoặc cập nhật thống kê.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Automatically selects the mathematically fastest plan among millions of permutations without manual hints.', vi: 'Tự động chọn kế hoạch thực thi nhanh nhất giữa hàng triệu hoán vị mà không cần developer viết gợi ý thủ công.' },
      { en: 'Adapts dynamically to data scale: switches from Index Scan to SeqScan as table size and selectivity evolve.', vi: 'Thích ứng linh hoạt theo quy mô dữ liệu: tự động đổi giữa Index Scan và SeqScan khi tỷ lệ dữ liệu thay đổi.' }
    ],
    cons: [
      { en: 'Vulnerable to Cardinality Misestimation caused by stale statistics or correlated query predicates.', vi: 'Dễ rơi vào bẫy ước lượng sai số dòng (Cardinality Misestimation) khi số liệu thống kê bị cũ hoặc các cột có liên hệ với nhau.' },
      { en: 'Planning time grows exponentially with the number of joined tables unless bounded by heuristic thresholds.', vi: 'Thời gian lập kế hoạch tăng theo cấp số mũ theo số bảng nối trừ khi bị giới hạn bởi các ngưỡng giải thuật di truyền.' }
    ],
    writeAmplification: {
      en: 'Zero planning overhead during reads; background ANALYZE worker samples table pages to update statistics.',
      vi: 'Bằng 0 khi đọc; tiến trình chạy ngầm ANALYZE lấy mẫu trang đĩa định kỳ để làm mới số liệu thống kê.'
    },
    recoveryGuarantee: {
      en: 'CBO statistics are auxiliary catalog metadata; corruption or deletion only affects performance, never ACID durability.',
      vi: 'Dữ liệu thống kê CBO là siêu dữ liệu phụ trợ; nếu bị mất chỉ ảnh hưởng tới tốc độ chứ không làm hỏng tính bền vững ACID.'
    }
  },

  springBootCode: `package com.enterprise.database.cbo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Enterprise Demonstration of Optimizer Cost Tuning:
 * Demonstrating how setting session-level work_mem allows Hash Joins
 * to remain entirely in RAM without spilling to disk.
 */
@Component
public class OptimizerTuningRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public OptimizerTuningRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // 1. Allocate sufficient work_mem for memory-intensive analytical Hash Join
        jdbcTemplate.execute("SET work_mem = '128MB'");

        // 2. Align random_page_cost with high-performance NVMe cloud storage
        jdbcTemplate.execute("SET random_page_cost = 1.1");

        // 3. Execute complex join with optimizer cost guarantees
        String sql = """
            SELECT c.customer_name, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
            FROM customers c
            JOIN orders o ON o.customer_id = c.id
            WHERE o.status = 'COMPLETED' AND o.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY c.customer_name
            HAVING SUM(o.total_amount) > 1000
            ORDER BY total_spent DESC
            LIMIT 50;
        """;

        jdbcTemplate.query(sql, (rs) -> {
            System.out.printf("VIP Customer: %s, Total: $%.2f%n",
                rs.getString("customer_name"), rs.getDouble("total_spent"));
        });
    }
}`,

  sqlQueries: `-- 1. Deep Inspection with EXPLAIN (ANALYZE, BUFFERS, TIMING)
EXPLAIN (ANALYZE, BUFFERS, TIMING, COSTS)
SELECT *
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'PENDING';

-- 2. Inspect Table Statistics and Histogram in PostgreSQL Catalog
SELECT 
    schemaname, 
    tablename, 
    attname AS column_name, 
    null_frac, 
    avg_width, 
    n_distinct, 
    most_common_vals, 
    most_common_freqs 
FROM pg_stats
WHERE tablename = 'orders' AND attname = 'status';

-- 3. Solve Correlated Column Misestimation via Extended Statistics
-- When (status = 'PENDING' AND payment_method = 'COD') are correlated:
CREATE STATISTICS IF NOT EXISTS stat_orders_status_payment
ON status, payment_method FROM orders;

-- Refresh statistics immediately
ANALYZE orders;`,

  productionProblemCase: {
    title: {
      en: 'The $120,000 Cloud Bill: Stale Statistics Triggers 4-Hour Nested Loop Outage',
      vi: 'Hóa Đơn Đám Mây $120.000: Dữ Liệu Thống Kê Cũ Kích Hoạt Nested Loop Chạy Suốt 4 Tiếng'
    },
    businessContext: {
      en: 'A fintech core banking system processes daily midnight reconciliation between transactions (45,000,000 rows) and accounts (1,500,000 rows) using a nightly Spring Batch pipeline.',
      vi: 'Hệ thống đối soát tài chính ngân hàng thực thi đối chiếu số dư lúc nửa đêm giữa bảng giao dịch (45 triệu dòng) và tài khoản (1.5 triệu dòng) bằng ứng dụng Spring Batch.'
    },
    problemDescription: {
      en: 'Following a data warehouse migration where 12,000,000 transactions were migrated into the table via direct COPY, the nightly reconciliation job—which usually took 4 minutes—failed to finish after 4.5 hours! The AWS RDS PostgreSQL CPU spiked to 100%, read IOPS saturated at 40,000 IOPS, and daily morning banking operations were delayed. Running EXPLAIN on the reconciliation query revealed the catastrophe: the query planner had selected a Nested Loop Join instead of a Hash Join! Inspection of pg_class showed that reltuples was recorded as 4,200 rows (from before the migration), leading the optimizer to predict Cardinality = 12 rows. Based on this false estimate, it chose a Nested Loop. In reality, there were 12,000,000 rows, forcing the database to execute 12,000,000 random index probes across 85GB of disk pages.',
      vi: 'Sau một đợt nạp dữ liệu lịch sử nạp thêm 12 triệu giao dịch bằng lệnh COPY, tiến trình đối soát đêm—vốn chỉ chạy trong 4 phút—đã chạy suốt 4.5 tiếng mà không xong! CPU máy chủ RDS PostgreSQL vọt lên 100%, chỉ số đọc IOPS chạm đỉnh 40.000, khiến các giao dịch ngân hàng đầu giờ sáng bị đình trệ. Chạy EXPLAIN câu lệnh đối soát đã phơi bày thảm họa: CBO đã chọn thuật toán Nested Loop Join thay vì Hash Join! Kiểm tra bảng pg_class cho thấy thông số reltuples vẫn ghi nhận bảng chỉ có 4.200 dòng (từ trước khi nạp dữ liệu), khiến optimizer ước lượng Cardinality chỉ có 12 dòng. Tin vào con số này, CBO tự tin chọn Nested Loop. Trong thực tế có tới 12 triệu dòng, ép hệ thống phải thực hiện 12 triệu lần tra cứu đĩa ngẫu nhiên qua 85GB dữ liệu.'
    },
    whyNaiveFails: {
      en: 'Engineers attempted to scale RDS from db.r6g.4xlarge to db.r6g.16xlarge (64 vCPUs). The query still took over 3 hours because a single-threaded Nested Loop cannot effectively parallelize across 64 cores when bound by random disk page fetch latencies.',
      vi: 'Đội ngũ kỹ sư cố gắng nâng cấp máy chủ từ 16 nhân lên 64 nhân vCPU. Câu truy vấn vẫn mất hơn 3 tiếng vì một thuật toán Nested Loop đơn luồng không thể tận dụng 64 nhân khi bị nghẽn bởi độ trễ nạp trang đĩa ngẫu nhiên.'
    },
    coreSolution: {
      en: '1. Execute immediate VACUUM ANALYZE transactions; this updated reltuples to 57,000,000 and rebuilt the MCV histograms. 2. Re-running the query immediately switched the plan from Nested Loop Join to an in-memory Hash Join (Cost dropped from 38,400,000 to 142,000). 3. Increased work_mem from 4MB to 128MB to prevent multi-batch hash disk spills. Result: The reconciliation query executed in exactly 3 minutes and 42 seconds with zero disk read spikes.',
      vi: '1. Chạy ngay lập tức câu lệnh VACUUM ANALYZE transactions; thao tác này cập nhật lại reltuples lên đúng 57 triệu dòng và tái tạo biểu đồ tần suất MCV. 2. Khi chạy lại, CBO lập tức chuyển kế hoạch từ Nested Loop sang Hash Join trong RAM (Điểm chi phí giảm từ 38.400.000 xuống còn 142.000). 3. Nâng work_mem từ 4MB lên 128MB để bảng băm không bị tràn xuống đĩa. Kết quả: Toàn bộ tiến trình đối soát chạy xong chỉ trong đúng 3 phút 42 giây mà không phát sinh đột biến đọc đĩa nào.'
    },
    architectureImpact: {
      en: 'Cost-Based Optimizers depend unconditionally on accurate statistical inputs; keeping catalog statistics fresh via automated maintenance is as critical as index architecture.',
      vi: 'Bộ tối ưu hóa CBO phụ thuộc tuyệt đối vào dữ liệu thống kê đầu vào chính xác; việc duy trì bảng thống kê luôn mới qua các tiến trình tự động có vai trò sống còn tương đương với kiến trúc đánh chỉ mục.'
    }
  },

  javaCode: `package com.database.internals.cbo;

import java.util.*;

/**
 * Pure Java 21 implementation of Cost-Based Optimizer Cardinality & Join Algorithm Selection.
 * Demonstrates Selectivity calculation, Cardinality estimation, and NestedLoop vs HashJoin costing.
 */
public class CostBasedOptimizer {

    public record ColumnStatistics(long totalRows, double nullFraction, int distinctCount, Map<String, Double> mcvFrequencies) {}

    public static class CardinalityEstimator {
        public static double estimateSelectivity(ColumnStatistics stats, String value) {
            // 1. Check Most Common Values (MCV)
            if (stats.mcvFrequencies().containsKey(value)) {
                return stats.mcvFrequencies().get(value);
            }
            // 2. Uniform distribution over remaining non-MCV values
            double mcvTotalFraction = stats.mcvFrequencies().values().stream().mapToDouble(Double::doubleValue).sum();
            double remainingFraction = 1.0 - stats.nullFraction() - mcvTotalFraction;
            int remainingDistinct = Math.max(1, stats.distinctCount() - stats.mcvFrequencies().size());
            return Math.max(0.0001, remainingFraction / remainingDistinct);
        }

        public static long estimateCardinality(ColumnStatistics stats, String value) {
            double selectivity = estimateSelectivity(stats, value);
            return Math.round(stats.totalRows() * selectivity);
        }
    }

    public static class JoinCostModel {
        private static final double SEQ_PAGE_COST = 1.0;
        private static final double RANDOM_PAGE_COST = 1.1; // NVMe SSD
        private static final double CPU_TUPLE_COST = 0.01;

        public record PlanCost(String algorithm, double estimatedCost, String rationale) {}

        public static PlanCost evaluateJoin(long outerRows, long innerRows, long innerPages, boolean hasInnerIndex) {
            // Nested Loop Cost = Cost(Outer) + OuterRows * Cost(Inner Probe)
            double innerProbeCost = hasInnerIndex 
                ? (3.0 * RANDOM_PAGE_COST + 3.0 * CPU_TUPLE_COST) // 3-level B-Tree
                : (innerPages * SEQ_PAGE_COST + innerRows * CPU_TUPLE_COST); // Full table scan
            double nestedLoopCost = (outerRows * CPU_TUPLE_COST) + (outerRows * innerProbeCost);

            // Hash Join Cost = Cost(Build Hash Table on Inner) + Cost(Scan Outer & Probe)
            double hashJoinCost = (innerPages * SEQ_PAGE_COST + innerRows * (CPU_TUPLE_COST * 2.0))
                                + (outerRows * (CPU_TUPLE_COST * 1.5));

            if (nestedLoopCost < hashJoinCost) {
                return new PlanCost("Nested Loop Join", nestedLoopCost, 
                    "Outer relation is tiny (" + outerRows + " rows); index probe dominates.");
            } else {
                return new PlanCost("Hash Join", hashJoinCost, 
                    "Outer relation is large (" + outerRows + " rows); linear hash table probe wins.");
            }
        }
    }

    public static void main(String[] args) {
        // Table: orders (10,000,000 rows)
        // MCV: 'COMPLETED' -> 85%, 'SHIPPED' -> 12%, other distinct = 5
        Map<String, Double> mcv = Map.of("COMPLETED", 0.85, "SHIPPED", 0.12);
        ColumnStatistics orderStats = new ColumnStatistics(10_000_000, 0.0, 7, mcv);

        // Case 1: Query for 'COMPLETED' orders
        long compCard = CardinalityEstimator.estimateCardinality(orderStats, "COMPLETED");
        System.out.printf("Estimated Cardinality for 'COMPLETED': %,d rows%n", compCard);
        var plan1 = JoinCostModel.evaluateJoin(compCard, 1_000_000, 15_000, true);
        System.out.println("  -> Optimal Plan: " + plan1.algorithm() + " (Cost: " + Math.round(plan1.estimatedCost()) + ")");

        // Case 2: Query for rare 'PENDING' orders
        long pendCard = CardinalityEstimator.estimateCardinality(orderStats, "PENDING");
        System.out.printf("%nEstimated Cardinality for 'PENDING': %,d rows%n", pendCard);
        var plan2 = JoinCostModel.evaluateJoin(pendCard, 1_000_000, 15_000, true);
        System.out.println("  -> Optimal Plan: " + plan2.algorithm() + " (Cost: " + Math.round(plan2.estimatedCost()) + ")");
    }
}
`
};
