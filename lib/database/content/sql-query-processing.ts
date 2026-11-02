import type { DatabaseTopic } from '../types';

export const sqlQueryProcessing: DatabaseTopic = {
  id: 'sql-query-processing',
  category: 'storage-engines',
  name: 'SQL Query Processing Pipeline',
  tagline: {
    en: 'From declarative SQL text to storage execution: Parser, AST, Semantic Analyzer, Query Rewriter, Logical vs Physical Plans, and the Volcano Iterator Model.',
    vi: 'Từ văn bản SQL khai báo tới thực thi tầng lưu trữ: Bộ phân tích cú pháp (Parser), Cây AST, Phân tích ngữ nghĩa, Viết lại truy vấn, Kế hoạch logic/vật lý và Mô hình lặp Volcano.'
  },
  difficulty: 2,
  order: 13,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'SQL is a purely declarative language: developers specify WHAT data they need (SELECT ... WHERE ... JOIN), but never HOW the storage engine must navigate physical 8KB disk pages, traverse B-Trees, or allocate CPU registers. The database engine must bridge this semantic chasm through a multi-stage compilation and execution pipeline.',
      vi: 'SQL là một ngôn ngữ thuần khai báo (declarative): lập trình viên chỉ chỉ định CẦN dữ liệu gì (SELECT ... WHERE ... JOIN), chứ không bao giờ chỉ đạo storage engine phải đọc trang đĩa 8KB nào, duyệt B-Tree ra sao hay cấp phát thanh ghi CPU thế nào. Hệ quản trị CSDL buộc phải bắc cầu qua khoảng trống ngữ nghĩa này bằng một chuỗi các bước biên dịch và thực thi tuần tự.'
    },
    hardwareConstraint: {
      en: 'CPU instruction pipelines and branch predictors stall when dynamic virtual function calls (such as Volcano next() calls) occur repeatedly for every single tuple. Modern processing pipelines must balance minimal memory footprint against CPU cache locality and instruction dispatch costs.',
      vi: 'Đường ống chỉ lệnh CPU (pipeline) và bộ dự đoán rẽ nhánh bị nghẽn (stall) khi các lời gọi hàm ảo động (như các lệnh next() trong mô hình Volcano) diễn ra liên tục trên từng dòng dữ liệu riêng lẻ. Pipeline thực thi hiện đại phải cân bằng giữa dung lượng RAM tối thiểu với tính cục bộ của cache CPU và chi phí điều phối chỉ lệnh.'
    },
    fundamentalSolution: {
      en: 'The database compiler parses raw SQL text into an Abstract Syntax Tree (AST), validates types against catalog metadata, rewrites queries into canonical relational algebra, optimizes logical expressions into physical execution plans, and streams tuples through demand-driven pull pipelines (Volcano Iterator Model) or vectorized batch processors.',
      vi: 'Trình biên dịch CSDL phân tích cú pháp chuỗi SQL thành Cây cú pháp trừu tượng (AST), kiểm tra kiểu dữ liệu với siêu dữ liệu hệ thống (Catalog), viết lại truy vấn về dạng đại số quan hệ chuẩn mực, tối ưu biểu thức logic thành kế hoạch thực thi vật lý, và bơm dữ liệu theo mô hình kéo (Volcano Iterator Model) hoặc xử lý vector theo lô (Vectorized Batches).'
    },
    math: {
      formula: 'T_{query} = T_{parse} + T_{plan} + T_{execute}',
      description: {
        en: 'Total query execution latency is decomposed into parsing time (syntax & lexing), planning time (semantic catalog resolution, query rewrite, cost-based plan generation), and physical execution time (pulling tuples through operator iterators and reading disk buffers).',
        vi: 'Tổng thời gian thực thi một truy vấn được phân rã thành thời gian phân tích cú pháp T_parse (Lexer & Parser), thời gian lập kế hoạch T_plan (tra cứu catalog, viết lại truy vấn, tính toán chi phí CBO) và thời gian thực thi vật lý T_execute (kéo các tuple qua các toán tử lặp và đọc dữ liệu từ buffer pool).'
      },
      timeComplexity: 'T_parse = O(L) where L is SQL string length; T_plan = O(2^J) or O(J^3) for J joined tables; T_execute = O(N) tuple streaming',
      spaceComplexity: 'O(Plan Depth) memory stack for Volcano iterator pipeline; O(K) hash table memory for Hash Join',
      ioCostFormula: 'I/O Cost = Total Buffer Pages Touched by Selected Physical Scan & Join Operators'
    }
  },

  pageLayout: {
    title: {
      en: 'Relational Query Compilation & Physical Operator Pipeline',
      vi: 'Quy trình Biên dịch Truy vấn Quan hệ & Đường ống Toán tử Vật lý'
    },
    description: {
      en: 'The query progresses through five discrete stages from human-readable SQL text to physical byte iteration over disk and buffer memory.',
      vi: 'Câu truy vấn trải qua năm giai đoạn độc lập từ văn bản SQL con người đọc được đến vòng lặp duyệt byte vật lý trên đĩa và bộ nhớ đệm RAM.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| 1. SQL TEXT: "SELECT c.name, SUM(o.amount) FROM orders o JOIN ... "       |
+--------------------------------------------------------------------------+
       |  (Lexical & Syntactic Analysis: Flex/Bison Parser)
       v
| 2. ABSTRACT SYNTAX TREE (AST): SelectStmt -> TargetList, FromClause, Where|
+--------------------------------------------------------------------------+
       |  (Semantic Analysis & Catalog Lookup: pg_class, pg_attribute)
       v
| 3. QUERY REWRITE & LOGICAL PLAN: Canonical Relational Algebra Tree        |
|    Project [c.name, SUM(o.amount)] -> Aggregate -> Join -> Filter        |
+--------------------------------------------------------------------------+
       |  (Cost-Based Optimizer: Physical Algorithm Selection)
       v
| 4. PHYSICAL EXECUTION PLAN:                                               |
|    HashAggregate                                                         |
|      └── HashJoin (o.customer_id = c.id)                                  |
|            ├── SeqScan on customers c                                    |
|            └── IndexScan on orders o (idx_orders_status)                 |
+--------------------------------------------------------------------------+
       |  (Volcano Iterator Model Execution: open() -> next() -> close())   |
       v
| 5. BUFFER POOL & STORAGE ENGINE: Page 8KB fetch -> Tuple byte extraction  |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'AST Node', size: 'Variable Heap', description: { en: 'In-memory parse tree representation of SQL clauses and expressions', vi: 'Cấu trúc cây cú pháp trong RAM đại diện cho các mệnh đề và biểu thức SQL' } },
      { name: 'PlanState', size: 'Executor Node', description: { en: 'Runtime execution state tracking current slot, projection, and children pointers', vi: 'Trạng thái thực thi runtime lưu con trỏ dữ liệu hiện tại, phép chiếu và nút con' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'The SQL Query Processing Pipeline is the bridge between human-readable declarative relational queries and physical low-level database storage engines. SQL states WHAT data is desired, not HOW to retrieve it. To bridge this divide, database systems compile SQL queries using a disciplined sequence of stages: Lexical/Syntactic Parsing (producing an AST), Semantic Analysis (binding to catalog tables, columns, and types), Query Rewrite (view expansion, constant folding, and subquery decorrelation), Cost-Based Optimization (translating logical expressions into optimal physical algorithms), and finally the Executor Engine (traditionally implemented via the Volcano Iterator Model or modern Vectorized Engines).',
      vi: 'Đường ống Xử lý Truy vấn SQL (SQL Query Processing Pipeline) là cầu nối giữa các câu lệnh quan hệ khai báo mà lập trình viên viết và các bộ máy lưu trữ vật lý cấp thấp. SQL chỉ đặc tả CẦN dữ liệu gì, chứ không chỉ ra CÁCH THỨC tìm kiếm dữ liệu đó. Để giải quyết khoảng cách này, CSDL biên dịch truy vấn qua một chuỗi các giai đoạn nghiêm ngặt: Phân tích Từ vựng/Cú pháp (tạo cây AST), Phân tích Ngữ nghĩa (ràng buộc vào bảng, cột, kiểu dữ liệu trong Catalog), Viết lại Truy vấn (mở rộng View, gom hằng số, làm phẳng subquery), Bộ tối ưu hóa Dựa trên Chi phí CBO (chuyển đổi đại số logic thành giải thuật vật lý tối ưu), và cuối cùng là Bộ máy Thực thi (Executor Engine - cài đặt bằng Mô hình Lặp Volcano hoặc Động cơ Vector hóa).'
    },
    deepDiveParagraphs: [
      {
        en: '1. Lexical Analysis, Syntax Parsing & The Abstract Syntax Tree (AST): The pipeline begins with the Lexer (tokenizer) scanning the raw SQL text into tokens (KEYWORDS, IDENTIFIERS, OPERATORS). The Parser (often generated using Bison/Yacc or hand-written recursive descent) checks grammatical syntax rules against relational standards (e.g., SQL-92, SQL:2016). If valid, it produces an Abstract Syntax Tree (AST) such as PostgreSQL SelectStmt. At this stage, the engine knows the query structure, but has no knowledge of whether the referenced tables, columns, or user permissions actually exist.',
        vi: '1. Phân Tích Từ Vựng, Cú Pháp & Cây Cú Pháp Trừu Tượng (AST): Pipeline bắt đầu bằng bộ Lexer phân tách chuỗi ký tự SQL thành các mã token (TỪ KHÓA, ĐỊNH DANH, TOÁN TỬ). Bộ Parser (thường sinh bởi Bison/Yacc hoặc viết tay bằng Recursive Descent) kiểm tra tính hợp lệ về mặt ngữ pháp theo chuẩn quan hệ (SQL-92, SQL:2016). Nếu hợp lệ, nó xuất ra Cây cú pháp trừu tượng AST (như SelectStmt trong PostgreSQL). Ở giai đoạn này, hệ thống mới chỉ biết cấu trúc câu lệnh chứ hoàn toàn chưa biết bảng, cột hay quyền hạn người dùng có thực sự tồn tại trong CSDL hay không.'
      },
      {
        en: '2. Semantic Analysis & Name Resolution: The semantic analyzer takes the raw AST and consults the system data catalog (e.g., pg_class, pg_attribute, pg_type in PostgreSQL, or MySQL Information Schema). It performs: (1) Name Resolution: binding unqualified column names (e.g., status) to concrete tables; (2) Type Checking: verifying that operands are compatible with operators (e.g., preventing adding a VARCHAR to a TIMESTAMP); (3) Implicit Type Coercion: inserting type-cast nodes when needed; and (4) Permission Verification: ensuring the current user possesses SELECT/UPDATE rights on target relations. The output is a fully resolved Query Tree.',
        vi: '2. Phân Tích Ngữ Nghĩa & Phân Giải Tên (Semantic Analysis): Bộ phân tích ngữ nghĩa tiếp nhận cây AST thô và đối chiếu với Từ điển dữ liệu hệ thống (System Catalog như pg_class, pg_attribute, pg_type trong Postgres). Nó thực hiện 4 nhiệm vụ cốt lõi: (1) Phân giải tên (Name Resolution): gắn các cột viết tắt vào đúng bảng cha tương ứng; (2) Kiểm tra kiểu dữ liệu (Type Checking): bảo đảm các toán hạng phù hợp với toán tử (chống cộng chuỗi với ngày tháng); (3) Ép kiểu ngầm định (Type Coercion): chèn các nút chuyển đổi kiểu khi cần thiết; và (4) Kiểm tra quyền truy cập (Permission Check): xác minh user hiện tại có quyền SELECT/UPDATE trên bảng đích hay không. Kết quả đầu ra là một Cây Truy Vấn (Query Tree) đã được giải nghĩa hoàn chỉnh.'
      },
      {
        en: '3. Query Rewrite & Logical Transformations: Before cost-based physical evaluation, the Query Rewriter applies deterministic heuristic transformations: (1) View Expansion: replacing references to database VIEWs with their underlying SELECT definitions; (2) Constant Folding: pre-evaluating static mathematical expressions (e.g., transforming WHERE created_at > NOW() - INTERVAL "7 days" into a single constant timestamp); (3) Predicate Simplification: eliminating tautologies (WHERE 1=1) and propagating equalities (WHERE a = b AND b = 5 -> a = 5); and (4) Subquery Flattening (Decorrelation): rewriting correlated IN (SELECT ...) subqueries into relational SEMI-JOINs so the optimizer can consider Hash Joins.',
        vi: '3. Viết Lại Truy Vấn & Biến Đổi Logic (Query Rewrite): Trước khi tính toán chi phí vật lý, bộ Viết lại Truy vấn áp dụng các quy tắc biến đổi tương đương mang tính tiền đề: (1) Mở rộng View (View Expansion): thay thế tên View bằng câu lệnh SELECT định nghĩa nên View đó; (2) Gom hằng số (Constant Folding): tính trước các biểu thức bất biến (ví dụ: biến WHERE created_at > NOW() - INTERVAL "7 days" thành một mốc thời gian cố định duy nhất); (3) Tối giản vị từ (Predicate Simplification): loại bỏ các điều kiện thừa (WHERE 1=1) và lan truyền phép bằng (WHERE a = b AND b = 5 thành a = 5); và (4) Làm phẳng Subquery (Decorrelation): chuyển đổi subquery lồng nhau IN (SELECT ...) thành phép SEMI-JOIN để bộ tối ưu có thể áp dụng thuật toán Hash Join.'
      },
      {
        en: '4. Logical Plan vs Physical Plan: A Logical Plan describes the relational algebra operations required to produce the answer (Scan, Filter, Project, Join, Aggregate) without committing to any physical storage algorithm. In contrast, a Physical Plan assigns concrete executable algorithms to each logical node based on hardware constraints and storage access paths: a Logical Scan becomes a Physical SeqScan, IndexScan, or BitmapIndexScan; a Logical Join becomes a NestedLoopJoin, HashJoin, or SortMergeJoin.',
        vi: '4. Kế Hoạch Logic (Logical Plan) vs Kế Hoạch Vật Lý (Physical Plan): Kế hoạch Logic mô tả các phép toán đại số quan hệ cần thiết để ra được kết quả (Quét, Lọc, Chiếu, Nối, Gom nhóm) mà chưa gắn liền với thuật toán lưu trữ cụ thể nào. Ngược lại, Kế hoạch Vật Lý gán các thuật toán cụ thể có thể thực thi trực tiếp trên CPU và đĩa: phép Quét Logic biến thành Quét tuần tự (SeqScan), Quét chỉ mục (IndexScan) hoặc Quét bitmap (BitmapIndexScan); phép Nối Logic biến thành Vòng lặp lồng nhau (NestedLoopJoin), Nối bảng băm (HashJoin) hoặc Nối sắp xếp (SortMergeJoin).'
      },
      {
        en: '5. The Volcano Iterator Execution Model: Formulated by Goetz Graefe in 1994, the Volcano Model (also called the Pipeline or Pull Model) represents every physical operator as an iterator exposing three interface methods: open(), next(), and close(). Execution begins at the root operator of the physical tree calling child.next() in a demand-driven loop. Each operator pulls one tuple at a time from its child, applies its transformation (e.g., evaluating a WHERE predicate filter), and returns the tuple up the stack. This guarantees that query intermediate results do not need to be materialized in RAM or written to temporary disk files, enabling queries over terabytes of data with megabytes of memory.',
        vi: '5. Mô Hình Lặp Thực Thi Volcano (Volcano Iterator Model): Được Goetz Graefe công bố năm 1994, Mô hình Volcano (còn gọi là Pipeline hoặc Mô hình Kéo - Pull Model) biểu diễn mọi toán tử vật lý dưới dạng một Iterator cung cấp 3 phương thức chuẩn: open(), next(), và close(). Quá trình thực thi bắt đầu từ nút gốc của cây vật lý, gọi đệ quy child.next() theo nhu cầu. Mỗi toán tử kéo từng tuple một từ con của nó lên, áp dụng bộ lọc hoặc tính toán (như kiểm tra biểu thức WHERE), rồi trả tuple đó lên nút cha. Mô hình này bảo đảm kết quả trung gian không bao giờ phải lưu tạm toàn bộ vào RAM hay ghi ra file tạm trên đĩa, giúp máy chủ có thể xử lý truy vấn dữ liệu hàng Terabyte chỉ với vài Megabyte bộ nhớ.'
      },
      {
        en: '6. Tuple-At-A-Time Bottlenecks vs Modern Vectorized Execution: While the Volcano Model minimizes memory consumption, processing tuples one-at-a-time induces massive CPU instruction overhead: (1) Virtual Function Dispatch: millions of indirect next() method calls destroy CPU instruction caches and branch predictor accuracy; (2) Register Inefficiency: each tuple moves data across operator function call stacks, wasting CPU registers. Modern OLAP engines (DuckDB, ClickHouse, Apache Arrow DataFusion) utilize Vectorized Execution: instead of pulling 1 tuple, next() returns a Vector Batch (typically 1,024 or 2,048 contiguous tuples) in columnar format, reducing virtual function call overhead by 1,000x and allowing CPU SIMD vector processing.',
        vi: '6. Nút Thắt Từng-Dòng-Một (Tuple-At-A-Time) vs Động Cơ Xử Lý Vector Hiện Đại: Mặc dù mô hình Volcano tiết kiệm bộ nhớ tối đa, việc xử lý từng tuple riêng lẻ gây ra lãng phí nghiêm trọng tài nguyên CPU: (1) Chi phí điều phối hàm ảo (Virtual Function Dispatch): hàng triệu lần gọi hàm ảo next() làm hỏng cache lệnh của CPU và vô hiệu hóa bộ dự đoán rẽ nhánh; (2) Không tận dụng được thanh ghi CPU: dữ liệu của từng tuple phải di chuyển qua lại giữa các khung ngăn xếp hàm. Các engine phân tích hiện đại (DuckDB, ClickHouse, Apache Arrow DataFusion) chuyển sang Mô hình Vector hóa (Vectorized Execution): thay vì kéo 1 tuple, next() trả về một mảng Vector (thường gồm 1.024 hoặc 2.048 tuple liền kề) theo định dạng cột, giảm 1.000 lần số lần gọi hàm ảo và mở đường cho tập lệnh SIMD của CPU tăng tốc tính toán.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Dynamic SQL String Concatenation Bypassing the Plan Cache: When applications dynamically concatenate SQL strings (e.g., SELECT * FROM users WHERE id = " + id) instead of using parameterized Prepared Statements (WHERE id = ?), the database must execute full Lexing, Parsing, Semantic Analysis, and Cost-Based Planning on EVERY SINGLE query! Under 20,000 requests/sec, the database CPU spends over 50% of its cycles compiling SQL rather than reading data.',
        vi: 'Cộng Chuỗi SQL Động Làm Phá Vỡ Bộ Đệm Kế Hoạch (Plan Cache): Khi ứng dụng cộng chuỗi SQL thủ công (SELECT * FROM users WHERE id = " + id) thay vì dùng câu lệnh tham số hóa Prepared Statement (WHERE id = ?), cơ sở dữ liệu buộc phải chạy lại từ đầu toàn bộ các bước Lexer, Parser, Phân tích ngữ nghĩa và Lập kế hoạch CBO cho TỪNG TRUY VẤN MỘT! Ở tải 20.000 request/giây, hơn 50% CPU của CSDL bị lãng phí chỉ để biên dịch SQL thay vì đọc dữ liệu.'
      },
      {
        en: 'Excessive and deeply nested subqueries preventing decorrelation: Complex correlated subqueries with multiple correlated references can overwhelm database query rewriters, forcing physical Nested Loop plans with O(N * M) Cartesian product costs instead of linear Hash Joins.',
        vi: 'Lạm dụng Subquery lồng nhau quá sâu làm tê liệt cơ chế làm phẳng truy vấn: Các subquery phụ thuộc phức tạp có thể vượt quá khả năng tối ưu hóa của bộ Query Rewriter, ép database phải chọn kế hoạch quét lặp Nested Loop với chi phí tích Descartes O(N * M) thay vì phép nối băm tuyến tính O(N + M).'
      },
      {
        en: 'Implicit type coercion invalidating index scans: In WHERE phone_number = 123456789 (where phone_number is VARCHAR), the semantic analyzer injects an implicit CAST(phone_number AS INTEGER) to match numeric types. This expression wrapping makes the B-Tree index on phone_number completely unusable, silently degrading an O(log N) index lookup to an O(N) full sequential table scan.',
        vi: 'Ép kiểu ngầm định làm vô hiệu hóa quét chỉ mục: Trong mệnh đề WHERE phone_number = 123456789 (trong khi phone_number là kiểu VARCHAR), bộ phân tích ngữ nghĩa sẽ tự động chèn phép ép kiểu CAST(phone_number AS INTEGER) để so khớp số nguyên. Phép ép kiểu trên cột khiến cây B-Tree của phone_number bị vô hiệu hóa hoàn toàn, âm thầm kéo tụt truy vấn tra cứu O(log N) thành quét toàn bộ bảng O(N).'
      }
    ]
  },

  steps: [
    {
      id: 'parse',
      title: { en: 'Lexing & Syntax Parsing (AST Generation)', vi: 'Phân tích Từ vựng & Cú pháp (Dựng cây AST)' },
      phase: 'Compilation Phase 1',
      description: {
        en: 'The Lexer scans SQL string tokens; Bison grammar parser produces the Abstract Syntax Tree (SelectStmt).',
        vi: 'Lexer phân tách các token; Parser Bison kiểm tra ngữ pháp và dựng cây AST.'
      },
      diskIoBehavior: { en: 'Pure in-memory CPU processing; zero disk I/O.', vi: 'Thuần xử lý CPU trong RAM; không có I/O đĩa.' },
      javaCodeLineMatch: 'ASTNode ast = sqlParser.parse(sqlQuery);'
    },
    {
      id: 'semantic-plan',
      title: { en: 'Semantic Analysis & Query Rewrite', vi: 'Phân tích Ngữ nghĩa & Viết lại Truy vấn' },
      phase: 'Compilation Phase 2',
      description: {
        en: 'Resolve table/column names via system catalog, check types, fold constants, and generate canonical Logical Plan.',
        vi: 'Đối chiếu tên bảng/cột với Catalog, kiểm tra kiểu dữ liệu, gom hằng số và sinh Cây Đại số Logic.'
      },
      diskIoBehavior: { en: 'Catalog lookup reads cached system relation pages in buffer pool.', vi: 'Tra cứu bảng Catalog trong bộ nhớ đệm Buffer Pool.' },
      javaCodeLineMatch: 'LogicalPlan logicalPlan = semanticAnalyzer.resolve(ast);'
    },
    {
      id: 'volcano-execute',
      title: { en: 'Physical Plan & Volcano Iterator Streaming', vi: 'Kế hoạch Vật lý & Thực thi Lặp Volcano' },
      phase: 'Execution Phase',
      description: {
        en: 'Physical operators execute open() -> demand-driven next() loops pulling records from storage pages.',
        vi: 'Các toán tử vật lý thực thi open() -> vòng lặp kéo next() từng dòng từ các trang đĩa.'
      },
      diskIoBehavior: { en: 'Buffer pool fetch: hits in RAM or loads 8KB pages from NVMe storage.', vi: 'Lấy trang từ Buffer Pool: trúng RAM hoặc đọc trang 8KB từ ổ NVMe.' },
      javaCodeLineMatch: 'while ((record = executorRoot.next()) != null)'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Query Executor',
      implementationName: 'Standard Volcano Iterator Model with Plan Caching',
      keyMechanism: {
        en: 'Executes trees of PlanState nodes via ExecProcNode(). Supports prepared statements with generic vs custom plan caching heuristics (plan_cache_mode = auto).',
        vi: 'Thực thi cây các nút PlanState qua hàm ExecProcNode(). Hỗ trợ Prepared Statement với cơ chế lưu đệm Generic Plan và Custom Plan thông minh.'
      },
      defaultTuningConfig: 'plan_cache_mode = auto, work_mem = 64MB',
      architectureNote: {
        en: 'After 5 executions of a prepared statement, PostgreSQL evaluates whether a generic parameterized plan performs within 10% of custom plans, switching to generic to save planning CPU.',
        vi: 'Sau 5 lần thực thi Prepared Statement, Postgres sẽ tự động kiểm tra xem generic plan có gần tương đương custom plan không; nếu có sẽ dùng generic plan để triệt tiêu 100% CPU lập kế hoạch.'
      }
    },
    {
      engine: 'DuckDB / ClickHouse Execution Engine',
      implementationName: 'Vectorized Columnar Execution Engine',
      keyMechanism: {
        en: 'Replaces single-tuple next() with next_vector() returning DataChunk batches of 2,048 column tuples, minimizing virtual call dispatch and unlocking hardware SIMD instructions.',
        vi: 'Thay thế việc kéo từng tuple riêng lẻ bằng hàm next_vector() trả về mảng DataChunk gồm 2.048 dòng dạng cột, triệt tiêu chi phí hàm ảo và khai thác tập lệnh SIMD phần cứng.'
      },
      defaultTuningConfig: 'STANDARD_VECTOR_SIZE = 2048',
      architectureNote: {
        en: 'Achieves 10x-50x higher instruction-per-clock (IPC) efficiency compared to classical Volcano tuple-at-a-time engines on analytical aggregations.',
        vi: 'Đạt hiệu suất lệnh trên xung nhịp (IPC) cao hơn từ 10 đến 50 lần so với mô hình Volcano truyền thống trên các phép toán tổng hợp phân tích.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Shared Pool & Cursor Cache',
      implementationName: 'Library Cache Soft vs Hard Parse & Cursor Sharing',
      keyMechanism: {
        en: 'Oracle caches parsed syntax trees and compiled execution plans in the SGA Library Cache. Identical SQL strings hit a "Soft Parse" (reusing the plan in sub-microseconds). When SQL statements contain literal values instead of bind variables, CURSOR_SHARING = FORCE automatically transforms literals into system bind variables (:SYS_B_0) to prevent library cache latch saturation.',
        vi: 'Oracle lưu đệm cây cú pháp và kế hoạch thực thi đã biên dịch trong Library Cache của vùng nhớ SGA. Các câu SQL giống hệt nhau sẽ đạt "Soft Parse" (tái sử dụng kế hoạch cũ trong thời gian dưới microsecond). Khi ứng dụng gửi SQL nối chuỗi thay vì dùng bind variable, tham số CURSOR_SHARING = FORCE sẽ tự động chuyển các giá trị chuỗi thành biến hệ thống (:SYS_B_0) để ngăn chặn thảm họa nghẽn khóa Shared Pool.'
      },
      defaultTuningConfig: "ALTER SYSTEM SET CURSOR_SHARING = 'FORCE' SCOPE=BOTH; ALTER SYSTEM SET SHARED_POOL_SIZE = 8G SCOPE=BOTH;",
      architectureNote: {
        en: 'Hard parses serialize on the library cache lock and mutex; using bind variables reduces parse CPU consumption from 45% down to under 2%.',
        vi: 'Việc parse cứng (Hard parse) gây tranh chấp nghiêm trọng trên mutex và lock của Library Cache; sử dụng biến liên kết (bind variables) giúp giảm mức tiêu thụ CPU từ 45% xuống chỉ còn dưới 2%.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Volcano model has tiny, predictable memory consumption; data streams without full intermediate materialization.', vi: 'Mô hình Volcano tốn cực ít RAM, dữ liệu được truyền phát liên tục mà không cần tạo bảng trung gian.' },
      { en: 'Decoupled compilation stages enable independent query rewrite, semantic validation, and optimization plugins.', vi: 'Tách rời các giai đoạn biên dịch giúp dễ dàng mở rộng các plugin viết lại, kiểm tra ngữ nghĩa và tối ưu hóa.' }
    ],
    cons: [
      { en: 'Tuple-at-a-time virtual dispatch incurs heavy CPU cache misses and branch mispredictions on high-throughput scans.', vi: 'Mô hình duyệt từng tuple làm lãng phí CPU và gây trượt dự đoán rẽ nhánh trên các truy vấn quét dữ liệu lớn.' },
      { en: 'Repeated parsing and planning of unparameterized ad-hoc queries consumes 30-50% of database CPU cycles.', vi: 'Việc parse và lập kế hoạch liên tục cho các truy vấn cộng chuỗi ngốn từ 30-50% năng lực xử lý của máy chủ CSDL.' }
    ],
    writeAmplification: {
      en: 'Zero for read queries; for INSERT/UPDATE, pipeline coordinates WAL logging and buffer dirty page marks.',
      vi: 'Bằng 0 cho truy vấn đọc; với lệnh ghi, pipeline điều phối việc ghi log WAL và đánh dấu trang bẩn.'
    },
    recoveryGuarantee: {
      en: 'Parser and planner are stateless; executor mutations are isolated via transactional ACID boundaries.',
      vi: 'Parser và Planner là phi trạng thái; các sửa đổi từ Executor được bảo vệ qua ranh giới giao dịch ACID.'
    }
  },

  springBootCode: `package com.enterprise.database.pipeline;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Enterprise Spring Boot Demonstration:
 * Explaining how Parameterized Queries leverage Database Plan Caching
 * to bypass Lexer/Parser/Planner overhead on high-frequency transactions.
 */
@Component
public class QueryPipelineOptimizationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public QueryPipelineOptimizationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // 1. DANGEROUS ANTI-PATTERN: String Concatenation forces T_parse + T_plan EVERY EXECUTION!
        // String badSql = "SELECT name, amount FROM orders WHERE order_id = " + 10542;
        // jdbcTemplate.query(badSql, ...); // CPU spikes to 100% under high throughput!

        // 2. PRODUCTION BEST PRACTICE: Parameterized Statement (? placeholder)
        // PostgreSQL parses and plans the statement ONCE into a Generic Plan,
        // then executes subsequent queries with T_parse ≈ 0ms and T_plan ≈ 0ms!
        String optimalSql = "SELECT customer_name, total_amount FROM orders WHERE status = ? AND total_amount >= ?";

        List<OrderSummary> results = jdbcTemplate.query(
            optimalSql,
            (rs, rowNum) -> new OrderSummary(rs.getString("customer_name"), rs.getDouble("total_amount")),
            "COMPLETED",
            500.0
        );

        System.out.printf("Retrieved %d orders utilizing database cached execution plan.%n", results.size());
    }

    public record OrderSummary(String customerName, double totalAmount) {}
}`,

  sqlQueries: `-- 1. Inspect the Physical Execution Plan generated by PostgreSQL Pipeline
EXPLAIN (ANALYZE, BUFFERS, TIMING, COSTS)
SELECT 
    c.name, 
    SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'COMPLETED'
GROUP BY c.name
ORDER BY total_spent DESC
LIMIT 10;

-- 2. Inspect Prepared Statement Plan Caching Mechanics
PREPARE customer_order_plan(text, numeric) AS
SELECT c.name, o.amount
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = $1 AND o.amount >= $2;

-- Execute the cached plan with different parameters (0ms parse & plan cost!)
EXECUTE customer_order_plan('COMPLETED', 1000.0);
EXECUTE customer_order_plan('PENDING', 250.0);

-- 3. Verify PostgreSQL Server Plan Cache Hit Statistics
SELECT 
    name, 
    statement, 
    prepare_time, 
    generic_plans, 
    custom_plans 
FROM pg_prepared_statements;`,

  productionProblemCase: {
    title: {
      en: 'Black Friday 48,000 TPS Connection Saturation: SQL Plan Compilation Bottleneck',
      vi: 'Sự Cố Đạt Đỉnh 48.000 TPS Ngày Black Friday: Nghẽn CPU Do Biên Dịch & Lập Kế Hoạch SQL'
    },
    businessContext: {
      en: 'A tier-1 e-commerce order routing gateway serves 48,000 read-write API requests/second during flash sales. The primary PostgreSQL database server runs on a 96-core AMD EPYC server with 512GB RAM.',
      vi: 'Cổng định tuyến đơn hàng thương mại điện tử cấp 1 xử lý 48.000 yêu cầu đọc-ghi mỗi giây trong đợt flash sale. Máy chủ cơ sở dữ liệu chính PostgreSQL chạy trên hệ thống AMD EPYC 96 nhân với 512GB RAM.'
    },
    problemDescription: {
      en: 'During the flash sale event, database CPU usage spiked to 98%, query latencies surged from 4ms to 850ms, and application connection pools saturated with timeouts. Profiling with perf and pg_stat_activity revealed that the storage engine and disk I/O were nearly idle (under 15% NVMe disk utilization), yet 65% of the database CPU was consumed entirely by base_yyparse() and standard_planner()! The cause: an ORM upgrade had begun issuing unparameterized literal SQL strings (SELECT ... WHERE tenant_id = "vn" AND item_id = 98124...). Because every SQL string was unique, the database was forced to execute Lexing, AST Parsing, Semantic Catalog Binding, and Cost-Based Join Enumeration 48,000 times every second.',
      vi: 'Trong đợt mở bán, mức sử dụng CPU của máy chủ CSDL vọt lên 98%, độ trễ truy vấn tăng vọt từ 4ms lên 850ms, và connection pool của ứng dụng bị cạn kiệt dẫn đến timeout hàng loạt. Giám sát hệ thống bằng perf và pg_stat_activity cho thấy tầng lưu trữ và I/O đĩa gần như rảnh rỗi (dưới 15% dung lượng NVMe), nhưng có tới 65% năng lực CPU bị đốt cháy hoàn toàn trong hai hàm nội bộ base_yyparse() và standard_planner()! Nguyên nhân: một bản cập nhật ORM đã vô tình sinh ra các chuỗi SQL cộng giá trị trực tiếp (SELECT ... WHERE tenant_id = "vn" AND item_id = 98124...). Do mỗi câu SQL là một chuỗi ký tự độc nhất, database buộc phải chạy Lexer, Parser cây AST, phân giải Catalog và tính toán chi phí CBO tới 48.000 lần mỗi giây.'
    },
    whyNaiveFails: {
      en: 'Scaling the database CPU hardware from 96 to 192 cores cost $8,000/month but only improved throughput by 14% due to severe spinlock contention on the shared system catalog caches (syscache locks) during repeated concurrent semantic analysis.',
      vi: 'Nâng cấp phần cứng từ 96 lên 192 nhân CPU tốn thêm $8.000/tháng nhưng chỉ cải thiện được 14% thông lượng do tranh chấp khóa xoay (spinlock) dữ dội trên bộ nhớ đệm Catalog hệ thống (syscache) khi hàng nghìn luồng cùng lúc phân giải ngữ nghĩa tên bảng.'
    },
    coreSolution: {
      en: '1. Refactor application ORM and JDBC layers to enforce Server-Side Prepared Statements: replace raw literal SQL strings with parameterized placeholders (? or $1, $2). 2. Configure PgBouncer transaction pooling with prepare_threshold = 5 and max_prepared_statements = 2000. 3. Configure PostgreSQL plan_cache_mode = auto. Result: Query parsing time T_parse dropped from 1.8ms to 0.01ms, planning time T_plan dropped from 2.5ms to 0.00ms after plan caching kicked in, overall database CPU plummeted from 98% down to 22%, and p99 query latency fell below 3ms.',
      vi: '1. Tái cấu trúc tầng ORM và JDBC để bắt buộc dùng Prepared Statement phía máy chủ: thay thế các chuỗi SQL tĩnh bằng tham số (? hoặc $1, $2). 2. Cấu hình PgBouncer connection pool với prepare_threshold = 5 và max_prepared_statements = 2000. 3. Thiết lập plan_cache_mode = auto trong PostgreSQL. Kết quả: Thời gian phân tích T_parse giảm từ 1.8ms xuống 0.01ms, thời gian lập kế hoạch T_plan giảm từ 2.5ms về 0.00ms nhờ cơ chế lưu đệm Generic Plan, tải CPU tổng thể giảm thẳng từ 98% xuống 22%, và độ trễ p99 hạ xuống dưới 3ms.'
    },
    architectureImpact: {
      en: 'Understanding the SQL compilation pipeline proved that query performance is not just disk I/O; query parsing and plan caching are paramount for high-throughput transactional architectures.',
      vi: 'Hiểu rõ đường ống biên dịch SQL chứng minh rằng hiệu năng truy vấn không chỉ nằm ở I/O đọc đĩa; việc tối ưu hóa phân tích cú pháp và lưu đệm kế hoạch thực thi là yếu tố sống còn cho các kiến trúc giao dịch thông lượng cao.'
    }
  },

  javaCode: `package com.database.internals.pipeline;

import java.util.*;
import java.util.function.Predicate;

/**
 * Pure Java 21 implementation of the Volcano Iterator Execution Model.
 * Demonstrates open(), next(), close() demand-driven tuple-at-a-time execution.
 */
public class VolcanoQueryPipeline {

    public record Tuple(Object[] values) {
        @Override
        public String toString() {
            return Arrays.toString(values);
        }
    }

    public interface VolcanoOperator {
        void open();
        Tuple next();
        void close();
    }

    // Physical Sequential Table Scan Operator
    public static class SeqScanOperator implements VolcanoOperator {
        private final List<Tuple> tableData;
        private int cursor;

        public SeqScanOperator(List<Tuple> tableData) {
            this.tableData = tableData;
        }

        @Override
        public void open() {
            this.cursor = 0;
        }

        @Override
        public Tuple next() {
            if (cursor < tableData.size()) {
                return tableData.get(cursor++);
            }
            return null; // EOF signal
        }

        @Override
        public void close() {
            this.cursor = 0;
        }
    }

    // Physical Filter Operator (evaluates WHERE condition)
    public static class FilterOperator implements VolcanoOperator {
        private final VolcanoOperator child;
        private final Predicate<Tuple> predicate;

        public FilterOperator(VolcanoOperator child, Predicate<Tuple> predicate) {
            this.child = child;
            this.predicate = predicate;
        }

        @Override
        public void open() {
            child.open();
        }

        @Override
        public Tuple next() {
            Tuple tuple;
            // Pull from child until predicate is satisfied or EOF
            while ((tuple = child.next()) != null) {
                if (predicate.test(tuple)) {
                    return tuple;
                }
            }
            return null;
        }

        @Override
        public void close() {
            child.close();
        }
    }

    // Physical Projection Operator (evaluates SELECT columns)
    public static class ProjectOperator implements VolcanoOperator {
        private final VolcanoOperator child;
        private final int[] columnIndices;

        public ProjectOperator(VolcanoOperator child, int[] columnIndices) {
            this.child = child;
            this.columnIndices = columnIndices;
        }

        @Override
        public void open() {
            child.open();
        }

        @Override
        public Tuple next() {
            Tuple tuple = child.next();
            if (tuple == null) return null;

            Object[] projected = new Object[columnIndices.length];
            for (int i = 0; i < columnIndices.length; i++) {
                projected[i] = tuple.values()[columnIndices[i]];
            }
            return new Tuple(projected);
        }

        @Override
        public void close() {
            child.close();
        }
    }

    public static void main(String[] args) {
        // Simulating physical table data for: orders (id, customer_name, status, amount)
        List<Tuple> tableData = List.of(
            new Tuple(new Object[]{1, "Alice", "COMPLETED", 120.0}),
            new Tuple(new Object[]{2, "Bob",   "PENDING",    85.0}),
            new Tuple(new Object[]{3, "Carol", "COMPLETED", 450.0}),
            new Tuple(new Object[]{4, "Dave",  "CANCELLED",  30.0}),
            new Tuple(new Object[]{5, "Eve",   "COMPLETED", 950.0})
        );

        // Building the Physical Execution Plan Tree:
        // Project [customer_name (idx 1), amount (idx 3)]
        //   └── Filter [status == 'COMPLETED' (idx 2)]
        //         └── SeqScan [orders]
        VolcanoOperator scan = new SeqScanOperator(tableData);
        VolcanoOperator filter = new FilterOperator(scan, t -> "COMPLETED".equals(t.values()[2]));
        VolcanoOperator planRoot = new ProjectOperator(filter, new int[]{1, 3});

        System.out.println("Executing SQL Query Plan via Volcano Iterator Model:");
        planRoot.open();
        Tuple result;
        int rowCount = 0;
        while ((result = planRoot.next()) != null) {
            System.out.println("  -> Emitted Row: " + result);
            rowCount++;
        }
        planRoot.close();
        System.out.println("Execution finished. Total rows emitted: " + rowCount);
    }
}
`
};
