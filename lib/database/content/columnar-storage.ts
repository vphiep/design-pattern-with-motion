import type { DatabaseTopic } from '../types';

export const columnarStorage: DatabaseTopic = {
  id: 'columnar-storage',
  category: 'storage-engines',
  name: 'Columnar Storage & Vectorized Execution',
  tagline: {
    en: 'Analytical (OLAP) storage architecture: column-oriented chunking, dictionary compression, and vectorized SIMD processing.',
    vi: 'Kiến trúc lưu trữ phân tích (OLAP): phân khối theo cột, nén từ điển và xử lý vector hóa SIMD.'
  },
  difficulty: 2,
  order: 4,
  estimatedMinutes: 16,

  coreTheory: {
    problemStatement: {
      en: 'Row-oriented storage (OLTP) stores all columns of a record contiguously. In analytical queries (e.g., SELECT AVG(salary) FROM employees WHERE age > 30), the engine must load every column into RAM, wasting 90-95% of disk and memory bandwidth reading unused fields.',
      vi: 'Lưu trữ theo dòng (OLTP) đặt tất cả các cột của một bản ghi liền kề nhau. Trong truy vấn phân tích (ví dụ tính lương trung bình nhân viên trên 30 tuổi), engine buộc phải nạp toàn bộ các cột vào RAM, lãng phí tới 90-95% băng thông đĩa và bộ nhớ để đọc các cột không dùng đến.'
    },
    hardwareConstraint: {
      en: 'Modern CPUs possess SIMD (Single Instruction Multiple Data) vector execution units (AVX-512, NEON) capable of operating on 8 to 16 numeric values in a single clock cycle if data is stored in contiguous homogeneous memory arrays.',
      vi: 'CPU hiện đại sở hữu các đơn vị xử lý vector SIMD (AVX-512, NEON) có khả năng tính toán trên 8 đến 16 số cùng lúc trong một chu kỳ xung nhịp nếu dữ liệu được đặt trong các mảng bộ nhớ đồng nhất liền kề.'
    },
    fundamentalSolution: {
      en: 'Columnar storage groups values by column rather than row. Data is stored in column chunks with identical data types, enabling dramatic Run-Length and Dictionary compression ratios (5x-10x) and vectorized SIMD filter scans.',
      vi: 'Lưu trữ theo cột gom dữ liệu theo từng cột thay vì theo dòng. Dữ liệu được lưu thành các chunk đồng nhất kiểu dữ liệu, cho phép nén từ điển và Run-Length với tỷ lệ cực cao (5x-10x) và quét lọc vector hóa bằng lệnh SIMD.'
    },
    math: {
      formula: 'T_{aggregation} = O(N), \\quad \\text{Vector Batches} = \\lceil N / \\text{SIMD Width} \\rceil',
      description: {
        en: 'For standard aggregations (e.g. SELECT SUM(amount) FROM transactions), scanning N unaggregated values requires T_aggregation = O(N). SIMD vector execution (AVX-512) processes 8 to 16 numeric values per instruction, reducing CPU instructions and increasing throughput by a factor proportional to SIMD width without eliminating the O(N) work. O(1) aggregation is only achievable when precomputed zone-map statistics or Materialized Views are present.',
        vi: 'Đối với các phép tổng hợp thông thường (ví dụ: SELECT SUM(amount) FROM transactions), việc quét N giá trị thô chưa tổng hợp bắt buộc phải tốn T_aggregation = O(N). Tập lệnh vector SIMD (AVX-512) xử lý từ 8 đến 16 số trên mỗi chỉ lệnh, giảm số instruction và nâng thông lượng xử lý lên gấp nhiều lần (tỷ lệ thuận với độ rộng SIMD), chứ không biến độ phức tạp tiệm cận về O(1). O(1) chỉ đạt được khi tận dụng siêu dữ liệu tổng hợp sẵn trong zone-map hoặc Materialized Views.'
      },
      timeComplexity: 'T_aggregation = O(N) total work, accelerated by ceil(N / SIMD_Width) vector batch cycles; O(1) only via precomputed file footer metadata',
      spaceComplexity: 'Extremely compact (3x-10x smaller than raw row storage via Dictionary + Bit-Packing)',
      ioCostFormula: 'I/O Cost = (Requested Columns / Total Columns) × Compressed Chunk Size'
    }
  },

  pageLayout: {
    title: {
      en: 'Apache Parquet / ClickHouse Column Chunk File Layout',
      vi: 'Cấu trúc khối lưu trữ cột (Chuẩn Apache Parquet & ClickHouse)'
    },
    description: {
      en: 'Files are divided into Row Groups (e.g., 1,000,000 rows). Inside each Row Group, data is partitioned into independent Column Chunks, each containing Pages of dictionary-compressed data.',
      vi: 'File được chia thành các Row Group (khoảng 1 triệu dòng). Trong mỗi Row Group, dữ liệu được phân chia thành các Column Chunk độc lập, nén từ điển theo từng trang.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| FILE HEADER: Magic Bytes ("PAR1")                                        |
+--------------------------------------------------------------------------+
| ROW GROUP #0 (e.g., 100,000 Rows):                                       |
|  [ Column Chunk: "age"      -> Dictionary Page + Data Pages (ZSTD) ]     |
|  [ Column Chunk: "salary"   -> Data Pages (Bit-packed floats) ]          |
|  [ Column Chunk: "status"   -> Run-Length Encoded (RLE) Pages ]          |
+--------------------------------------------------------------------------+
| ROW GROUP #1: ...                                                        |
+--------------------------------------------------------------------------+
| FILE FOOTER: FileMetaData (Column min/max statistics, offsets, schema)   |
| FOOTER LENGTH (4 Bytes) + Magic Bytes ("PAR1")                           |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'row_group_size', size: '128MB - 512MB', description: { en: 'Unit of parallel reading across CPU threads', vi: 'Đơn vị đọc song song qua các luồng CPU' } },
      { name: 'column_stats', size: 'Min / Max values', description: { en: 'Enables predicate pushdown to skip whole row groups without reading disk', vi: 'Cho phép bỏ qua toàn bộ Row Group nếu min/max không thỏa điều kiện WHERE' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Columnar Storage architectures (Apache Parquet, ClickHouse, Apache Arrow, Snowflake) fundamentally invert traditional relational database physical storage. By storing values of the same column contiguously rather than grouping all columns of a row together, columnar storage achieves order-of-magnitude improvements in analytical query throughput, data compression ratios, and CPU SIMD vector processing.',
      vi: 'Kiến trúc Lưu trữ Theo Cột (Columnar Storage như Apache Parquet, ClickHouse, Apache Arrow, Snowflake) đảo ngược hoàn toàn phương thức lưu trữ truyền thống của các hệ quản trị quan hệ. Bằng cách lưu các giá trị của cùng một cột nằm liền kề nhau thay vì gom các cột của một dòng lại với nhau, cấu trúc cột mang lại sự bứt phá vượt bậc về tốc độ truy vấn phân tích (OLAP), tỷ lệ nén dữ liệu và khả năng khai thác tập lệnh vector SIMD của CPU.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Row-Oriented vs Column-Oriented Physical I/O: In a row store (PostgreSQL, MySQL), scanning two columns across 100,000,000 rows (SELECT status, SUM(amount) FROM orders) forces the storage engine to read entire physical tuples from disk—including unneeded strings, JSON payloads, shipping addresses, and customer notes. Over 95% of the disk I/O and RAM memory bus bandwidth is wasted transporting discardable data! In columnar stores, disk reads are restricted strictly to the exact column arrays requested, reducing disk throughput demands by up to 99%.',
        vi: '1. Chi phí I/O Đĩa: Dạng Dòng (Row-Store) vs Dạng Cột (Column-Store): Trong hệ thống dạng dòng (PostgreSQL, MySQL), khi quét 2 cột trên 100 triệu dòng (SELECT status, SUM(amount) FROM orders), bộ máy bắt buộc phải kéo nguyên toàn bộ các dòng vật lý từ đĩa vào RAM—bao gồm cả các cột chuỗi mô tả, JSON, địa chỉ giao hàng và ghi chú. Hơn 95% băng thông I/O đĩa và bus bộ nhớ bị lãng phí chỉ để vận chuyển các dữ liệu thừa thãi bị vứt bỏ! Với lưu trữ theo cột, đĩa chỉ phải đọc duy nhất các mảng dữ liệu của đúng 2 cột được chọn, giảm tới 99% lượng I/O cần thiết.'
      },
      {
        en: '2. Homogeneous Data Compression (Dictionary, RLE, Bit-Packing): Storing identical data types contiguously unleashes massive compression efficiency impossible in row stores. In a status column, storing 10,000 consecutive "COMPLETED" strings in row stores consumes 10,000 * 10 bytes = 100KB. In columnar storage, Dictionary Encoding maps "COMPLETED" to integer ID 1, and Run-Length Encoding (RLE) compresses the entire sequence into a single 8-byte tuple: [Value=1, Count=10000]! Columnar files commonly achieve 5x to 10x compression ratios compared to uncompressed row tables.',
        vi: '2. Nén Dữ Liệu Đồng Nhất (Từ Điển, RLE, Bit-Packing): Việc lưu các kiểu dữ liệu giống hệt nhau nằm kề nhau mở ra khả năng nén cực hạn mà dạng dòng không thể làm được. Với một cột trạng thái, việc lưu 10,000 chuỗi "COMPLETED" liền kề trong bảng dạng dòng ngốn tới 100KB RAM. Trong lưu trữ cột, cơ chế Nén Từ Điển ánh xạ "COMPLETED" thành số 1, và Run-Length Encoding (RLE) nén toàn bộ 10,000 bản ghi thành một tuple 8-byte duy nhất: [Giá trị=1, Số lượng=10000]! Nhờ đó, file dạng cột thường đạt tỷ lệ nén từ 5x đến 10x so với dữ liệu gốc.'
      },
      {
        en: '3. SIMD Vectorized Execution & Predicate Pushdown: Modern x86 and ARM CPUs feature SIMD (Single Instruction, Multiple Data: AVX-512, NEON) registers capable of operating on 512-bit vectors simultaneously. Because columnar data arrays are packed contiguously in memory, analytical query engines evaluate 8 to 16 numbers in a single CPU clock cycle (e.g. summing 16 integers in one instruction). Furthermore, Parquet file metadata tracks minimum and maximum values for every column chunk (Predicate Pushdown); if a query specifies WHERE created_year = 2024, the engine skips entire 512MB Row Groups without reading a single byte of disk if min/max boundaries do not overlap.',
        vi: '3. Xử Lý Vector Hóa SIMD & Đẩy Điều Kiện Xuống Tầng Lưu Trữ (Predicate Pushdown): CPU hiện đại sở hữu các thanh ghi SIMD (AVX-512, NEON) có thể xử lý đồng thời các vector 512-bit. Do dữ liệu mảng cột được xếp liền kề trong bộ nhớ, các bộ máy truy vấn phân tích có thể tính toán từ 8 đến 16 số chỉ trong 1 chu kỳ xung nhịp CPU (ví dụ cộng 16 số nguyên cùng lúc). Hơn thế nữa, metadata của file Parquet lưu sẵn giá trị Nhỏ nhất (Min) và Lớn nhất (Max) của từng khối cột (Row Group); nếu câu lệnh có WHERE created_year = 2024, bộ máy sẽ lập tức bỏ qua toàn bộ khối 512MB mà không tốn một lần đọc đĩa nào nếu khoảng min/max không giao nhau.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Attempting to use columnar storage for transactional OLTP workloads with frequent single-row point updates (UPDATE orders SET status = "SHIPPED" WHERE id = 123). Columnar files are immutable; updating a single row requires rewriting the entire columnar chunk or maintaining expensive delta delete vectors.',
        vi: 'Cố tình dùng lưu trữ dạng cột cho các hệ thống giao dịch OLTP có tần suất cập nhật từng dòng nhỏ lẻ cao (UPDATE orders SET status = ... WHERE id = 123). File dạng cột là bất biến (immutable); việc sửa 1 dòng bắt buộc phải ghi lại toàn bộ khối cột hoặc duy trì bảng xóa delta phức tạp.'
      },
      {
        en: 'The "Small File Problem" in Parquet/ORC: writing thousands of tiny 1MB Parquet files defeats dictionary compression, inflates storage metadata overhead, and bogs down distributed query engines (Spark, Trino, DuckDB) in file open/seek bottlenecks.',
        vi: 'Hội chứng "Nhiều file nhỏ" (Small File Problem): việc sinh ra hàng ngàn file Parquet tí hon 1MB làm mất đi hoàn toàn lợi ích của việc nén từ điển, làm phình to metadata và bóp nghẹt các bộ máy truy vấn phân tán (Spark, Trino) trong việc mở file liên tục.'
      },
      {
        en: 'Selecting inefficient physical sorting keys: In columnar architectures, sorting table records by the most frequently queried filter dimensions (e.g., tenant_id, timestamp) maximizes RLE compression and enables predicate pushdown to eliminate 95% of row groups during scans.',
        vi: 'Chọn sai khóa sắp xếp vật lý: Trong kiến trúc cột, việc sắp xếp dữ liệu theo các trường hay được tìm kiếm nhất (như tenant_id, thời gian) sẽ tối đa hóa hiệu quả nén RLE và giúp cơ chế Predicate Pushdown loại bỏ được tới 95% số khối dữ liệu trong lúc quét.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Analytical Dashboard 45-Second Gateway Timeout & Parquet Columnar Migration',
      vi: 'Sự Cố Dashboard Bị Quá Hạn 45 Giây & Cuộc Di Cư Sang Lưu Trữ Dạng Cột Parquet'
    },
    businessContext: {
      en: 'An enterprise e-commerce analytics dashboard serves finance executives querying monthly gross revenue, profit margins, and tax deductions across 500,000,000 historical order line items.',
      vi: 'Trang quản trị tài chính của sàn thương mại điện tử phục vụ các giám đốc tra cứu doanh thu, biên lợi nhuận và khấu trừ thuế trên 500,000,000 dòng dữ liệu đơn hàng lịch sử.'
    },
    problemDescription: {
      en: 'The analytics dashboard ran directly against a PostgreSQL relational row-store database. Executing a standard financial aggregation: SELECT merchant_id, SUM(gross_amount_cents), AVG(commission_cents) FROM order_items WHERE order_year = 2024 GROUP BY merchant_id took 46.8 seconds, pinning the database server NVMe disks at 100% I/O and triggering HTTP 504 Gateway Timeouts across the management portal. Forensic disk analysis revealed that PostgreSQL had to read 210GB of raw 8KB database pages from disk just to aggregate two numeric columns that physically accounted for only 5.8GB of actual numbers!',
      vi: 'Trang phân tích tài chính truy vấn trực tiếp vào bảng quan hệ dạng dòng của PostgreSQL. Khi chạy câu lệnh tổng hợp: SELECT merchant_id, SUM(gross_amount_cents), AVG(commission_cents) FROM order_items WHERE order_year = 2024 GROUP BY merchant_id, câu lệnh mất tới 46.8 giây, đẩy ổ đĩa NVMe lên 100% I/O và làm sập giao diện quản trị với lỗi 504 Gateway Timeout. Phân tích I/O chỉ ra rằng PostgreSQL phải kéo 210GB dữ liệu trang đĩa 8KB chỉ để tính toán trên 2 cột số vốn thực tế chỉ nặng có 5.8GB!'
    },
    whyNaiveFails: {
      en: 'Adding composite B-Tree indexes on (order_year, merchant_id, gross_amount_cents, commission_cents) produced an 88GB index file that exhausted server RAM, crushed transactional write throughput by 45%, and failed to accelerate queries filtering on alternative dimensions like category_id or country_code.',
      vi: 'Tạo chỉ mục B-Tree tổ hợp bao gồm 4 cột sinh ra một file index nặng tới 88GB làm cạn kiệt RAM máy chủ, bóp nghẹt 45% tốc độ ghi đơn hàng mới ban ngày, và hoàn toàn vô tác dụng khi người dùng lọc theo các chiều khác như ngành hàng hay quốc gia.'
    },
    coreSolution: {
      en: 'Decouple OLTP from OLAP by establishing an asynchronous Change Data Capture (CDC) pipeline streaming transaction updates into an Apache Parquet / DuckDB columnar data lakehouse partitioned by order_year/month. In Parquet, the query engine scans ONLY the gross_amount and commission column vectors (reading 5.8GB instead of 210GB), utilizes Dictionary and RLE compression, and evaluates summations via CPU SIMD AVX-512 vectorization in memory.',
      vi: 'Tách biệt hệ thống giao dịch OLTP khỏi phân tích OLAP bằng luồng CDC (Change Data Capture) đồng bộ dữ liệu sang kho dữ liệu dạng cột Apache Parquet / DuckDB phân vùng theo năm/tháng. Với định dạng Parquet, bộ máy truy vấn CHỈ ĐỌC DUY NHẤT 2 vector cột tiền và phí (chỉ tốn 5.8GB thay vì 210GB), áp dụng nén từ điển RLE và tính toán bằng tập lệnh vector hóa CPU SIMD AVX-512 siêu tốc ngay trong RAM.'
    },
    productionCode: `// Production Vectorized Columnar Query Pipeline using Embedded DuckDB / Parquet (Java 21)
package com.ecommerce.analytics.service;

import org.springframework.stereotype.Service;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Service
public class ColumnarFinancialAnalyticsService {

    // Embedded in-process vectorized analytical engine (DuckDB / Parquet)
    private static final String DUCKDB_URL = "jdbc:duckdb:";

    public FinancialSummaryReport runVectorizedAnnualReport(int targetYear) throws Exception {
        try (Connection conn = DriverManager.getConnection(DUCKDB_URL);
             Statement stmt = conn.createStatement()) {

            // 1. DuckDB executes Vectorized SIMD execution directly over compressed Parquet files!
            // Reads ONLY gross_amount_cents & commission_cents columns (skips 97% of disk I/O)
            String sql = """
                SELECT 
                    merchant_id,
                    SUM(gross_amount_cents) AS total_gross_cents,
                    AVG(commission_cents) AS avg_commission_cents
                FROM read_parquet('s3://lakehouse/orders/order_year=""" + targetYear + """/*.parquet')
                GROUP BY merchant_id
                ORDER BY total_gross_cents DESC
                LIMIT 100
                """;

            long start = System.currentTimeMillis();
            ResultSet rs = stmt.executeQuery(sql);
            long duration = System.currentTimeMillis() - start;

            // Process aggregated results
            return new FinancialSummaryReport(targetYear, duration);
        }
    }

    public record FinancialSummaryReport(int year, long executionTimeMs) {}
}`,
    architectureImpact: {
      en: 'Query execution time plummeted from 46.8 seconds down to 135 milliseconds (346x speedup); Disk I/O volume dropped from 210GB to 180MB (99.9% I/O reduction); Total storage footprint dropped by 78% due to 7.4x Parquet columnar compression ratio.',
      vi: 'Thời gian thực thi câu lệnh giảm từ 46.8 giây xuống chỉ còn 135 mili-giây (nhanh gấp 346 lần); Khối lượng I/O đĩa giảm từ 210GB xuống còn 180MB (giảm 99.9% I/O); Dung lượng lưu trữ đĩa giảm 78% nhờ tỷ lệ nén cột 7.4x của định dạng Parquet.'
    }
  },

  steps: [
    {
      id: 'col-chunk',
      title: { en: '1. Partition Records into Column Buffers', vi: '1. Tách bản ghi thành các mảng cột độc lập' },
      phase: 'DECOMPOSITION',
      description: {
        en: 'Incoming rows are transposed from row-tuples into contiguous column memory buffers, grouping identical data types together.',
        vi: 'Các dòng dữ liệu được chuyển vị từ dạng tuple ngang thành các buffer mảng cột trong RAM, gom các kiểu dữ liệu đồng nhất lại với nhau.'
      },
      diskIoBehavior: {
        en: 'In-memory transposition buffer. Zero disk I/O.',
        vi: 'Chuyển vị trong RAM. Chưa phát sinh ghi đĩa.'
      },
      javaCodeLineMatch: 'columnBuffers[colIdx].write(value)'
    },
    {
      id: 'rle-compress',
      title: { en: '2. Dictionary & Run-Length Encoding', vi: '2. Nén từ điển và Run-Length Encoding (RLE)' },
      phase: 'COMPRESSION',
      description: {
        en: 'Distinct column values are mapped to integer dictionary IDs. Repeated adjacent values are compressed via Run-Length Encoding (e.g., 1000 consecutive "ACTIVE" statuses stored as [ID=1, Count=1000]).',
        vi: 'Các giá trị phân biệt được ánh xạ sang mã số từ điển. Các giá trị lặp lại liền kề được nén bằng RLE (ví dụ 1000 trạng thái ACTIVE liên tiếp chỉ tốn [ID=1, Count=1000]).'
      },
      diskIoBehavior: {
        en: 'Bulk sequential write of compressed column chunks to disk.',
        vi: 'Ghi tuần tự hàng loạt các khối cột nén xuống đĩa.'
      },
      javaCodeLineMatch: 'compressColumnChunk(columnBuffers[colIdx])'
    },
    {
      id: 'simd-scan',
      title: { en: '3. Vectorized Predicate Filter (SIMD Scan)', vi: '3. Quét lọc vector hóa (SIMD Scan)' },
      phase: 'EXECUTION',
      description: {
        en: 'When executing a query, only requested columns are fetched from disk. The CPU processes 64 integers simultaneously using vector SIMD registers, achieving multi-gigabyte/sec filter rates.',
        vi: 'Khi truy vấn, chỉ những cột cần thiết mới được đọc từ đĩa. CPU xử lý 64 số nguyên cùng lúc qua thanh ghi SIMD, đạt tốc độ lọc nhiều gigabyte mỗi giây.'
      },
      diskIoBehavior: {
        en: 'Selective sequential block reads. Unreferenced column chunks are never touched.',
        vi: 'Chỉ đọc tuần tự các cột được chọn. Các cột khác hoàn toàn không bị chạm tới.'
      },
      javaCodeLineMatch: 'vectorizedFilter(colValues, predicate)'
    }
  ],

  productionEngines: [
    {
      engine: 'ClickHouse',
      implementationName: 'MergeTree Columnar Engine',
      keyMechanism: {
        en: 'Stores each column in a separate `.bin` file alongside a sparse primary index (`.mrk` marks every 8192 rows), reading only requested columns at tens of millions of rows per second.',
        vi: 'Lưu mỗi cột thành file `.bin` độc lập cùng file index thưa `.mrk` (đánh dấu mỗi 8192 dòng), đọc hàng chục triệu dòng/giây.'
      },
      defaultTuningConfig: 'max_block_size = 65536, min_compress_block_size = 65536',
      architectureNote: {
        en: 'Heavily optimizes for vector SIMD instruction sets (AVX-512).',
        vi: 'Tối ưu hóa tối đa cho tập lệnh vector SIMD phần cứng (AVX-512).'
      }
    },
    {
      engine: 'DuckDB',
      implementationName: 'Vectorized Columnar Execution Engine',
      keyMechanism: {
        en: 'Executes relational operators in vectorized chunks of 2048 tuples, keeping intermediate column states entirely within CPU L1/L2 caches.',
        vi: 'Thực thi các toán tử theo từng khối vector 2048 tuple, giữ toàn bộ dữ liệu trung gian trong L1/L2 cache của CPU.'
      },
      defaultTuningConfig: 'STANDARD_VECTOR_SIZE = 2048',
      architectureNote: {
        en: 'Integrates zero-copy Apache Arrow data sharing directly in memory.',
        vi: 'Tích hợp chuẩn chia sẻ bộ nhớ không cần sao chép Apache Arrow Zero-Copy.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai In-Memory Column Store',
      implementationName: 'Dual-Format Architecture & In-Memory Compression Units (IMCU)',
      keyMechanism: {
        en: 'Oracle provides a Dual-Format Architecture: data is persisted in row format on disk and buffer cache for OLTP transactions, while simultaneously populated into an In-Memory Column Store (IM column store) in SGA for analytical queries. Analytical scans leverage SIMD vector hardware instructions, while mutations update row format and invalidate columnar entries via lightweight snapshot metadata (IMCO background process).',
        vi: 'Oracle tiên phong kiến trúc Hai Định Dạng (Dual-Format Architecture): dữ liệu được lưu ở định dạng dòng trên đĩa và buffer cache cho các giao dịch OLTP, đồng thời được nạp song song vào bộ nhớ cột In-Memory Column Store (SGA) cho các truy vấn phân tích. Truy vấn phân tích tận dụng tập lệnh vector SIMD của CPU, trong khi các lệnh sửa đổi cập nhật trực tiếp vào định dạng dòng và hủy bỏ entry cột tương ứng qua tiến trình ngầm IMCO.'
      },
      defaultTuningConfig: "ALTER SYSTEM SET INMEMORY_SIZE = 64G SCOPE=SPFILE; ALTER TABLE orders INMEMORY MEMCOMPRESS FOR QUERY HIGH;",
      architectureNote: {
        en: 'Delivers 100x analytical query acceleration while maintaining full ACID OLTP transactions without duplicate ETL infrastructure.',
        vi: 'Tăng tốc độ truy vấn phân tích lên 100 lần trong khi vẫn duy trì trọn vẹn tính giao dịch ACID OLTP mà không cần xây dựng hệ thống ETL sao chép dữ liệu phức tạp.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: '10x to 100x faster analytical aggregation (SUM, AVG, COUNT) than row stores.', vi: 'Tính toán phân tích (SUM, AVG, COUNT) nhanh hơn từ 10 đến 100 lần so với lưu trữ theo dòng.' },
      { en: 'Dramatic disk space savings (up to 90% compression ratio).', vi: 'Tiết kiệm không gian đĩa khổng lồ (tỷ lệ nén tới 90%).' }
    ],
    cons: [
      { en: 'Extremely slow single-row point updates and individual INSERTs (requires rewriting entire column blocks).', vi: 'Cực kỳ chậm khi UPDATE hoặc INSERT lẻ từng dòng (phải ghi lại cả khối cột).' },
      { en: 'High overhead for point lookups (SELECT * FROM table WHERE id = 1).', vi: 'Chi phí cao cho các truy vấn lấy toàn bộ cột của 1 dòng đơn lẻ.' }
    ],
    writeAmplification: {
      en: 'Low for batch append, extremely high for single-row in-place updates.',
      vi: 'Rất thấp khi ghi theo lô (batch), cực cao khi cập nhật ngẫu nhiên từng dòng.'
    },
    recoveryGuarantee: {
      en: 'Immutable column blocks are validated via per-page CRC32 checksums.',
      vi: 'Các khối cột bất biến được bảo vệ bằng mã checksum CRC32 trên từng trang.'
    }
  },

  javaCode: `package com.database.internals.storage;

import java.util.*;

/**
 * Pure Java 21 implementation of Columnar Storage Chunk & Vectorized Filter.
 */
public class ColumnarStorageChunk {
    public static final int VECTOR_SIZE = 1024; // Batch processing size

    private final int[] ageColumn;
    private final double[] salaryColumn;
    private final String[] departmentDict;
    private final int[] departmentCodes; // Dictionary compressed
    private int size = 0;

    public ColumnarStorageChunk(int capacity) {
        this.ageColumn = new int[capacity];
        this.salaryColumn = new double[capacity];
        this.departmentDict = new String[] { "ENGINEERING", "SALES", "FINANCE" };
        this.departmentCodes = new int[capacity];
    }

    public void append(int age, double salary, int deptCode) {
        ageColumn[size] = age;
        salaryColumn[size] = salary;
        departmentCodes[size] = deptCode;
        size++;
    }

    // Vectorized SIMD-friendly scan: filters only the age column
    public int[] vectorizedFilter(int minAge) {
        int[] matchingIndices = new int[size];
        int matchCount = 0;

        // Loop unrolling for CPU branch predictor and SIMD auto-vectorization
        for (int i = 0; i < size; i++) {
            if (ageColumn[i] >= minAge) {
                matchingIndices[matchCount++] = i;
            }
        }
        return Arrays.copyOf(matchingIndices, matchCount);
    }

    // Fast vector aggregation: reads only salaryColumn for matching rows
    public double calculateAverageSalary(int[] matchingIndices) {
        double sum = 0;
        for (int idx : matchingIndices) {
            sum += salaryColumn[idx];
        }
        return matchingIndices.length == 0 ? 0 : (sum / matchingIndices.length);
    }
}`
};
