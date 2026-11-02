import type { DatabaseTopic } from '../types';

export const hashIndex: DatabaseTopic = {
  id: 'hash-index',
  category: 'indexing-techniques',
  name: 'Dynamic Hash Indexing: Extendible vs Linear Hashing',
  tagline: {
    en: 'Exact-match key indexing: constant O(1) point lookups, Extendible Hashing directory doubling, and PostgreSQL Linear Hashing split pointers.',
    vi: 'Chỉ mục tra cứu điểm chính xác: tốc độ O(1) không đổi, Băm Mở Rộng nhân đôi thư mục và Băm Tuyến Tính con trỏ tách bucket trong PostgreSQL.'
  },
  difficulty: 2,
  order: 12,
  estimatedMinutes: 16,

  coreTheory: {
    problemStatement: {
      en: 'Static hash tables use a fixed array of N buckets (Bucket = Hash(Key) % N). As the database grows from 1,000 to 100,000,000 rows, bucket overflow chains grow linearly (O(N)), degrading lookups to slow sequential scans. Re-hashing the entire table requires an expensive full-table freeze and rewrite.',
      vi: 'Bảng băm tĩnh dùng mảng cố định N bucket (Bucket = Hash(Key) % N). Khi dữ liệu tăng từ 1.000 lên 100 triệu dòng, các chuỗi overflow chain dài vô tận khiến tra cứu tụt dốc về O(N). Việc rehash lại toàn bộ bảng đòi hỏi khóa cứng hệ thống và ghi lại toàn bộ dữ liệu.'
    },
    hardwareConstraint: {
      en: 'Disk access must be bounded: point lookups must require strictly at most 2 disk reads (1 for the directory pointer, and 1 for the target data page), irrespective of whether the table contains 1,000 or 1,000,000,000 records.',
      vi: 'Số lần đọc đĩa phải được khống chế: tra cứu điểm bắt buộc chỉ tốn tối đa 2 lần đọc đĩa (1 lần đọc con trỏ thư mục, 1 lần đọc trang dữ liệu), bất kể bảng có 1.000 hay 1 tỷ dòng.'
    },
    fundamentalSolution: {
      en: 'Extendible Hashing introduces an in-memory Directory of pointers with a Global Depth (D), pointing to disk Buckets with individual Local Depths (d). When a bucket overflows, only that specific bucket is split and its local depth increments. The directory doubles in size in RAM only when a bucket with local depth equal to global depth splits, without moving any unchanged buckets on disk.',
      vi: 'Băm động (Extendible Hashing) dùng một Thư mục con trỏ (Directory) trong RAM có độ sâu toàn cục (Global Depth D) trỏ tới các Bucket trên đĩa có độ sâu cục bộ (Local Depth d). Khi một bucket bị đầy, chỉ đúng bucket đó bị tách đôi và tăng d. Thư mục con trỏ trong RAM chỉ nhân đôi khi d = D, hoàn toàn không cần di chuyển các bucket khác trên đĩa.'
    },
    math: {
      formula: 'Directory Size = 2^D pointers,   Bucket Key Mask = Hash(K) & ((1 << d) - 1)',
      description: {
        en: 'The directory size grows powers of 2. Point lookup cost is strictly O(1) with at most 1 memory dereference + 1 disk block read.',
        vi: 'Kích thước thư mục tăng theo lũy thừa của 2. Chi phí tra cứu điểm luôn là O(1) với tối đa 1 lần tra con trỏ RAM + 1 lần đọc block đĩa.'
      },
      timeComplexity: 'Strict O(1) point lookup, amortized O(1) insert',
      spaceComplexity: 'O(N) data storage + O(2^D) directory pointers in RAM',
      ioCostFormula: 'Point Lookup I/O = 1 Directory Latch + 1 Page Block Read'
    }
  },

  pageLayout: {
    title: {
      en: 'Extendible Hash Directory & Bucket Mapping Layout',
      vi: 'Cấu trúc Thư mục và Phân bổ Bucket trong Băm động (Extendible Hashing)'
    },
    description: {
      en: 'The Directory in RAM uses the first D bits of the hash to index into bucket pointers. Multiple directory slots can point to the same shared bucket when d < D.',
      vi: 'Thư mục trong RAM dùng D bit đầu của mã băm để trỏ vào bucket. Nhiều slot thư mục có thể cùng trỏ vào một bucket dùng chung khi d < D.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| DIRECTORY IN RAM (Global Depth D = 2):                                   |
|   Index 00 (0) ---> [ Bucket A: Local Depth d=2, Keys: [ 4, 12, 20 ] ]   |
|   Index 01 (1) ---> [ Bucket B: Local Depth d=1, Keys: [ 1, 5, 9, 13 ] ] |
|   Index 10 (2) ---> [ Bucket C: Local Depth d=2, Keys: [ 2, 6, 14 ] ]   |
|   Index 11 (3) ---> [ Bucket B: Points to same Bucket B! (d=1 < D=2) ]   |
+--------------------------------------------------------------------------+
| PHYSICAL DISK BUCKET BLOCK:                                              |
|  [ Bucket Header: local_depth (2B), num_keys (2B), overflow_ptr (4B) ]    |
|  [ Key/RID Slots: (Key: 8B, RecordPointer: 8B) ... ]                     |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'global_depth', size: '1 Byte', description: { en: 'Number of hash prefix bits used by the directory array', vi: 'Số lượng bit tiền tố băm được thư mục sử dụng' } },
      { name: 'local_depth', size: '1 Byte', description: { en: 'Number of hash bits shared by keys stored inside this bucket', vi: 'Số lượng bit băm chung của các khóa trong bucket này' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Database Hash Indexes are specialized physical indexing structures designed exclusively for constant-time O(1) equality searches (WHERE key = value). While B-Trees dominate general-purpose database workloads due to their versatility with range scans, Extendible and Linear Hashing architectures outperform B-Trees by up to 400% for point-lookup intensive workloads.',
      vi: 'Chỉ Mục Băm Trong Cơ Sở Dữ Liệu (Hash Index) là cấu trúc chỉ mục vật lý chuyên dụng được thiết kế riêng biệt cho các truy vấn tìm kiếm chính xác với thời gian O(1) (WHERE key = value). Mặc dù B-Tree thống trị phần lớn cơ sở dữ liệu nhờ khả năng quét dải linh hoạt, kiến trúc Băm Mở Rộng (Extendible Hashing) và Băm Tuyến Tính lại vượt trội hơn B-Tree tới 400% đối với các bài toán tra cứu điểm đơn lẻ.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Static Hashing vs Dynamic Extendible Hashing (Fagin et al., 1979): Static hashing maps keys to a fixed array of N buckets (hash % N). As the database grows, bucket overflow chains grow linearly, degrading lookup latency from O(1) to O(N). Extendible Hashing solves this using a two-tier architecture: an in-memory Directory indexed by the first D bits (Global Depth) of the hash, pointing to disk Buckets tagged with Local Depth d. When a bucket overflows and d < D, only that single bucket is split into two, incrementing d to d+1, without resizing the directory! The directory only doubles in size when an overflowing bucket has d == D, guaranteeing constant O(1) search time.',
        vi: '1. Băm Tĩnh (Static Hashing) vs Băm Mở Rộng Động (Extendible Hashing): Băm tĩnh ánh xạ khóa vào mảng N bucket cố định (hash % N). Khi dữ liệu nở to, các chuỗi overflow liên kết dài ra, kéo tụt tốc độ tra cứu từ O(1) xuống O(N). Băm Mở Rộng (Extendible Hashing) giải quyết triệt để vấn đề này bằng kiến trúc 2 tầng: một Thư mục (Directory) trong RAM đánh chỉ số bằng D bit tiền tố (Global Depth), trỏ tới các Bucket trên đĩa có độ sâu cục bộ d (Local Depth). Khi một bucket bị tràn và d < D, engine CHỈ CẦN chia đôi đúng bucket đó và nâng d lên d+1 mà không hề phải tăng kích thước thư mục! Thư mục chỉ nhân đôi khi bucket bị tràn có d == D, bảo toàn thời gian tìm kiếm O(1).'
      },
      {
        en: '2. Physical I/O Comparison: B-Tree vs Hash Index on Point Equality: In a 1-billion-row table, a B-Tree typically has a tree height of 4 to 5 levels (Root -> Internal1 -> Internal2 -> Internal3 -> Leaf). Resolving a single key requires traversing 4 to 5 separate page pointer dereferences. Even with buffer caching, each level traversal incurs CPU branch checks and buffer pool latch acquisitions. In contrast, an Extendible Hash Index hashes the key and directly reads the target bucket page in a SINGLE I/O dereference, reducing buffer pool latch contention by 75%.',
        vi: '2. So Sánh I/O Vật Lý: B-Tree vs Hash Index Cho Truy Vấn Điểm: Trong bảng có 1 tỷ dòng, cây B-Tree thường có độ cao từ 4 đến 5 tầng (Root -> Internal1 -> Internal2 -> Leaf). Tìm kiếm một khóa đòi hỏi phải duyệt qua 4 đến 5 trang đĩa độc lập. Kể cả khi trang đã nằm trên RAM, mỗi tầng vẫn tốn chi phí kiểm tra nhánh CPU và xin khóa (latch) trên Buffer Pool. Ngược lại, Hash Index băm khóa và trỏ thẳng vào trang bucket đích CHỈ TRONG 1 LẦN GIẢI THAM CHIẾU DUY NHẤT, giảm 75% chi phí tranh chấp khóa bộ nhớ đệm.'
      },
      {
        en: '3. The Range Query Impossibility: Cryptographic and high-dispersion hash functions (MurmurHash, CityHash) intentionally randomize output bits to eliminate clustering (the Avalanche Effect). Consequently, logically adjacent keys (e.g., timestamps 10:00:01 and 10:00:02) hash to completely random, distant buckets across physical storage. Therefore, Hash Indexes CANNOT support range queries (BETWEEN, >, <), ordering (ORDER BY), or prefix matching (LIKE "ABC%"). Any range query on a hash-indexed column forces the database engine to fall back to a full sequential table scan!',
        vi: '3. Sự Bất Khả Thi Của Truy Vấn Quét Dải (Range Queries): Các thuật toán băm phân tán cao (MurmurHash, CityHash) cố tình làm xáo trộn các bit đầu ra để chống gom cụm (Hiệu ứng Tuyết lở - Avalanche Effect). Do đó, các khóa liền kề nhau về mặt logic (như thời gian 10:00:01 và 10:00:02) lại bị băm ra các bucket hoàn toàn ngẫu nhiên và xa tít tắp nhau trên đĩa. Vì vậy, Hash Index HOÀN TOÀN KHÔNG THỂ hỗ trợ quét dải (BETWEEN, >, <), sắp xếp (ORDER BY) hay tìm tiền tố (LIKE "ABC%"). Bất kỳ câu lệnh quét dải nào trên cột dùng Hash Index đều ép cơ sở dữ liệu phải quét tuần tự toàn bộ bảng (Full Table Scan)!'
      },
      {
        en: '4. Extendible Hashing vs PostgreSQL Linear Hashing (Litwin 1980): While Extendible Hashing relies on an in-memory directory and doubles the directory when local depth exceeds global depth, PostgreSQL native Hash Indexes implement Linear Hashing. Linear Hashing eliminates the directory entirely! Instead, it grows storage smoothly one bucket at a time using a round-robin split pointer. Buckets that overflow before their turn to split simply attach temporary overflow pages. This prevents directory memory spikes and guarantees linear, predictable disk file expansion without exponential doubling bursts.',
        vi: '4. Băm Mở Rộng (Extendible) vs Băm Tuyến Tính Trong PostgreSQL (Linear Hashing - Litwin 1980): Trong khi Extendible Hashing cần một thư mục con trỏ trong RAM và phải nhân đôi kích thước thư mục khi độ sâu cục bộ vượt độ sâu toàn cục, chỉ mục Hash Index của PostgreSQL lại sử dụng Băm Tuyến Tính (Linear Hashing). Linear Hashing loại bỏ hoàn toàn thư mục con trỏ! Thay vào đó, nó mở rộng bảng tuần tự từng bucket một theo con trỏ tách vòng tròn (split pointer). Những bucket bị tràn trước khi tới lượt tách sẽ tạm thời móc thêm trang tràn (overflow page). Cơ chế này chống hiện tượng phình to RAM bất thình lình và bảo đảm kích thước file đĩa tăng trưởng tuyến tính, mượt mà thay vì nhân đôi đột ngột.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Creating a Hash Index on columns that are subsequently queried with range filters (WHERE order_date >= "2024-01-01" or ORDER BY order_date ASC), forcing the query planner to abandon the index and execute catastrophic full table scans across millions of disk pages.',
        vi: 'Tạo Hash Index trên các cột sau đó lại bị truy vấn quét dải (WHERE order_date >= "2024-01-01" hoặc ORDER BY order_date ASC), ép bộ tối ưu hóa truy vấn phải vứt bỏ chỉ mục và quét toàn bộ bảng (Full Table Scan) qua hàng triệu trang đĩa.'
      },
      {
        en: 'Directory explosion in Extendible Hashing caused by poor hash distribution or duplicated keys: if thousands of keys hash to identical prefix bits, the directory doubles repeatedly (D=1, 2, 4, 8... up to 2^24), consuming gigabytes of server RAM solely for the directory array.',
        vi: 'Nổ kích thước thư mục (Directory Explosion) trong Băm Mở Rộng: nếu hàm băm kém chất lượng hoặc có quá nhiều giá trị trùng lặp khiến các khóa cùng chia sẻ các bit tiền tố giống nhau, thư mục sẽ nhân đôi liên tục (2^1, 2^2... lên tới 2^24), ngốn hàng Gigabyte RAM chỉ để chứa mảng con trỏ thư mục.'
      },
      {
        en: 'Legacy PostgreSQL Hash Index crash vulnerability: Prior to PostgreSQL 10, Hash Indexes were NOT Write-Ahead Logged (WAL-safe); ungraceful database shutdowns required manual REINDEX HASH on all tables. Modern PostgreSQL 10+ fully supports WAL-logged crash-safe hash indexes.',
        vi: 'Lỗ hổng hỏng chỉ mục khi sập nguồn trong PostgreSQL cũ: Trước bản PostgreSQL 10, Hash Index không được ghi nhận vào nhật ký WAL; máy chủ mất điện sẽ khiến toàn bộ Hash Index bị hỏng và phải REINDEX thủ công. Từ PostgreSQL 10 trở đi, Hash Index mới chính thức an toàn 100% với WAL.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'High-Throughput Session Token Verification: B-Tree vs Hash Index Latency Optimization',
      vi: 'Tối Ưu Hóa Độ Trễ Xác Thực Session Token Tải Cao: So Sánh B-Tree vs Hash Index'
    },
    businessContext: {
      en: 'A cloud authentication microservice authenticates 140,000 active API session tokens/second against an active sessions table holding 35,000,000 active UUID session tokens.',
      vi: 'Dịch vụ xác thực danh tính đám mây kiểm tra 140,000 session token mỗi giây trên bảng lưu trữ 35,000,000 mã token phiên đăng nhập UUID còn hiệu lực.'
    },
    problemDescription: {
      en: 'The authorization gateway executed: SELECT user_id, permissions FROM active_sessions WHERE session_token = ?. The table originally used a standard PostgreSQL B-Tree index on session_token. With 35,000,000 rows, the B-Tree index height was 4 levels deep. Every single token verification required traversing 4 internal B-Tree pages (Root -> Level 2 -> Level 1 -> Leaf), generating 140,000 * 4 = 560,000 buffer pool page lookups per second! CPU utilization on the database cluster reached 94%, with severe buffer pool latch contention on the B-Tree root page becoming the primary throughput bottleneck.',
      vi: 'Cổng phân quyền liên tục thực thi câu lệnh: SELECT user_id, permissions FROM active_sessions WHERE session_token = ?. Bảng ban đầu sử dụng chỉ mục B-Tree tiêu chuẩn trên cột session_token. Với 35 triệu dòng, cây B-Tree có độ cao 4 tầng. Mỗi lần kiểm tra token đòi hỏi phải duyệt qua 4 trang đĩa trong bộ đệm (Root -> Tầng 2 -> Tầng 1 -> Lá), tạo ra tới 560,000 lượt tra cứu trang đệm mỗi giây! Mức tiêu thụ CPU của cụm database chạm ngưỡng 94%, và hiện tượng tranh chấp khóa (latch contention) trên trang Root của B-Tree trở thành nút thắt cổ chai bóp nghẹt hệ thống.'
    },
    whyNaiveFails: {
      en: 'Adding Read Replicas cost an additional $12,000/month in cloud infrastructure and introduced replication lag (causing newly logged-in users to experience intermittent 401 Unauthorized errors on replica reads) without solving the fundamental 4-page traversal overhead.',
      vi: 'Thêm máy chủ Read Replica làm tăng thêm 12,000 USD/tháng tiền thuê máy chủ và gây ra độ trễ nhân bản (khiến người dùng vừa đăng nhập xong bị lỗi 401 Unauthorized do replica chưa kịp đồng bộ) mà không giải quyết được gốc rễ chi phí duyệt 4 trang của B-Tree.'
    },
    coreSolution: {
      en: 'Because session token verification is strictly an exact equality point-lookup (WHERE session_token = ?) with zero range scans or sorting, replace the B-Tree index with a modern WAL-logged PostgreSQL Hash Index: CREATE INDEX idx_sessions_hash ON active_sessions USING hash (session_token). The Hash Index computes the 32-bit MurmurHash and jumps directly to the target bucket page in a SINGLE dereference, cutting buffer pool page lookups by 75%.',
      vi: 'Vì thao tác xác thực token thuần túy là tìm kiếm chính xác 1 giá trị (WHERE session_token = ?) mà hoàn toàn không bao giờ quét dải hay sắp xếp, giải pháp tối ưu là thay thế B-Tree bằng chỉ mục băm chuẩn của PostgreSQL: CREATE INDEX idx_sessions_hash ON active_sessions USING hash (session_token). Chỉ mục băm tính mã hash và nhảy thẳng tới trang bucket đích CHỈ TRONG 1 LẦN TRA CỨU DUY NHẤT, cắt giảm ngay 75% số lượt đọc trên Buffer Pool.'
    },
    productionCode: `// Production PostgreSQL Migration: Replacing B-Tree with Hash Index for Point Equality
-- 1. Create WAL-logged crash-safe Hash Index concurrently without blocking writes:
CREATE INDEX CONCURRENTLY idx_sessions_hash 
ON active_sessions USING hash (session_token);

-- 2. Drop the redundant bloated 4-level B-Tree index:
DROP INDEX CONCURRENTLY idx_sessions_btree;

-- 3. Verify query plan execution: confirms Index Scan using idx_sessions_hash in 1 buffer read!
EXPLAIN (ANALYZE, BUFFERS)
SELECT user_id, permissions 
FROM active_sessions 
WHERE session_token = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

/*
 * Execution Plan Output:
 * Index Scan using idx_sessions_hash on active_sessions (cost=0.00..8.02 rows=1 width=48)
 *   Index Cond: (session_token = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::text)
 *   Buffers: shared hit=2 (1 bucket page + 1 table heap page)
 *   Planning Time: 0.082 ms
 *   Execution Time: 0.045 ms  <--- (Sub-50 microsecond execution!)
 */`,
    architectureImpact: {
      en: 'Buffer pool page latch acquisitions dropped by 73% (from 560,000/s to 150,000/s); Database node CPU utilization dropped from 94% down to 26%; P99 session verification latency collapsed from 4.8ms down to 0.42ms (11x speedup); Successfully sustained 160,000 authentications/sec.',
      vi: 'Số lượt xin khóa trang trên Buffer Pool giảm 73% (từ 560,000/s xuống còn 150,000/s); CPU máy chủ cơ sở dữ liệu giảm từ 94% xuống chỉ còn 26%; Độ trễ P99 xác thực token giảm từ 4.8ms xuống còn 0.42ms (nhanh gấp 11 lần); Hệ thống xử lý mượt mà 160,000 lượt xác thực/giây trên cùng cấu hình phần cứng cũ.'
    }
  },

  steps: [
    {
      id: 'hash-calc',
      title: { en: '1. Hash Calculation & Directory Indexing', vi: '1. Tính mã băm và định vị slot trong thư mục' },
      phase: 'HASH_DIRECT',
      description: {
        en: 'The engine hashes the lookup key into a 32-bit integer. It takes the lowest D bits (where D is global depth) to compute the directory array index in O(1) time.',
        vi: 'Engine băm khóa tìm kiếm thành số nguyên 32-bit. Nó lấy D bit thấp nhất (với D là độ sâu toàn cục) để xác định vị trí trong mảng thư mục trong thời gian O(1).'
      },
      diskIoBehavior: {
        en: 'Pure in-memory directory pointer lookup in RAM.',
        vi: 'Tra cứu con trỏ thư mục hoàn toàn trong RAM.'
      },
      javaCodeLineMatch: 'int hash = hashFunction(key)'
    },
    {
      id: 'bucket-overflow',
      title: { en: '2. Detect Bucket Overflow on Insert', vi: '2. Phát hiện tràn sức chứa Bucket khi chèn khóa mới' },
      phase: 'OVERFLOW_CHECK',
      description: {
        en: 'The engine loads the target bucket. If the bucket already holds BUCKET_CAPACITY keys, inserting another key causes an overflow. The engine inspects local depth (d) against global depth (D).',
        vi: 'Engine nạp bucket đích. Nếu bucket đã chứa đủ BUCKET_CAPACITY khóa, việc chèn thêm sẽ gây tràn. Engine so sánh độ sâu cục bộ d với độ sâu toàn cục D.'
      },
      diskIoBehavior: {
        en: 'Reads 1 bucket page from buffer pool.',
        vi: 'Đọc 1 trang bucket từ buffer pool.'
      },
      javaCodeLineMatch: 'if (bucket.size() >= BUCKET_CAPACITY)'
    },
    {
      id: 'dir-double',
      title: { en: '3. Local Bucket Split & Conditional Directory Doubling', vi: '3. Tách Bucket cục bộ và Nhân đôi thư mục có điều kiện' },
      phase: 'SPLIT_REHASH',
      description: {
        en: 'A new empty bucket is allocated. Keys in the old bucket are redistributed based on their (d+1)-th bit. If local depth was equal to global depth (d == D), the directory doubles its pointer array in RAM (2^D -> 2^(D+1)). Other unchanged buckets are not touched.',
        vi: 'Một bucket mới được cấp phát. Các khóa trong bucket cũ được chia lại dựa vào bit thứ (d+1). Nếu d == D, mảng thư mục trong RAM được nhân đôi (2^D -> 2^(D+1)). Toàn bộ các bucket khác không hề bị dịch chuyển.'
      },
      diskIoBehavior: {
        en: 'Allocates 1 new disk page for split bucket. Re-writes old bucket page.',
        vi: 'Cấp phát 1 trang đĩa mới cho bucket vừa tách. Ghi lại trang bucket cũ.'
      },
      javaCodeLineMatch: 'splitBucketAndRedistribute(bucketIndex)'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Hash Index',
      implementationName: 'Linear Hashing with WAL Logging (Postgres 10+)',
      keyMechanism: {
        en: 'PostgreSQL rewritten hash indexes use Linear Hashing (Litwin 1980) rather than Extendible Hashing, splitting buckets sequentially to maintain smooth file growth without doubling bursts.',
        vi: 'Từ Postgres 10, chỉ mục Hash Index được ghi lại bằng Linear Hashing, tách bucket tuần tự để dung lượng file tăng mượt mà không bị giật cục do nhân đôi thư mục.'
      },
      defaultTuningConfig: 'CREATE INDEX ... USING HASH (column)',
      architectureNote: {
        en: 'Fully crash-safe and replicated via WAL since PostgreSQL 10.',
        vi: 'Đã hỗ trợ an toàn sự cố và sao chép qua WAL đầy đủ từ phiên bản 10.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Hash Architectures',
      implementationName: 'Hash Clusters, In-Memory Hash Joins & Hash Partitioning',
      keyMechanism: {
        en: 'Rather than standalone secondary hash indexes, Oracle implements Hash Clusters: rows with identical hash keys are physically colocated into the same data block, yielding true O(1) single-block reads with zero index traversal. Additionally, Oracle leverages dynamic In-Memory Hash Tables in PGA for fast relational Hash Joins.',
        vi: 'Thay vì dùng secondary hash index riêng rẽ, Oracle triển khai Hash Clusters: các dòng có cùng khóa băm được lưu trữ vật lý trong cùng một khối dữ liệu, mang lại tốc độ đọc 1 block duy nhất trong O(1) mà không cần duyệt index. Ngoài ra, Oracle sử dụng bảng băm trong bộ nhớ PGA để thực thi các phép toán Hash Join tốc độ cao.'
      },
      defaultTuningConfig: 'CREATE CLUSTER user_cluster (user_id NUMBER) HASHKEYS 1000000 SIZE 512;',
      architectureNote: {
        en: 'Hash Clusters eliminate index lookup latency entirely for high-frequency point-query master tables.',
        vi: 'Hash Clusters triệt tiêu hoàn toàn chi phí duyệt cây chỉ mục đối với các bảng danh mục được tra cứu điểm với tần suất cực cao.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Strict O(1) point lookups, significantly faster than B+ Trees for equality queries (WHERE id = 42).', vi: 'Tra cứu điểm O(1) tuyệt đối, nhanh hơn rõ rệt so với B+ Tree cho phép so sánh bằng (=).' },
      { en: 'Only the overflowing bucket is split; never requires a full-table re-hash.', vi: 'Chỉ tách đúng bucket bị đầy; không bao giờ phải rehash lại toàn bộ bảng.' }
    ],
    cons: [
      { en: 'Completely incapable of range queries (WHERE age BETWEEN 20 AND 30); hash destroys natural sorting.', vi: 'Hoàn toàn không thể quét dải (WHERE BETWEEN); phép băm phá hủy toàn bộ thứ tự tự nhiên.' },
      { en: 'Directory doubling memory spike when hash distribution is highly skewed.', vi: 'Thư mục có thể phình to trong RAM nếu phân phối băm bị lệch tập trung.' }
    ],
    writeAmplification: {
      en: 'Low: Only 1 bucket block is rewritten on insert; split only rewrites 2 blocks.',
      vi: 'Thấp: Chỉ ghi lại 1 block bucket khi chèn; khi tách chỉ ghi lại 2 block.'
    },
    recoveryGuarantee: {
      en: 'Directory rebuilds from bucket local depths stored in page headers on recovery.',
      vi: 'Thư mục có thể tái tạo lại hoàn toàn từ độ sâu cục bộ ghi trên header các bucket.'
    }
  },

  javaCode: `package com.database.internals.indexing;

import java.util.*;

/**
 * Pure Java 21 implementation of Extendible Hashing with Dynamic Directory Doubling.
 */
public class ExtendibleHashIndex<K, V> {
    private static final int BUCKET_CAPACITY = 3;

    public static class Bucket<K, V> {
        int localDepth;
        final Map<K, V> entries = new HashMap<>();
        public Bucket(int localDepth) { this.localDepth = localDepth; }
        public boolean isFull() { return entries.size() >= BUCKET_CAPACITY; }
    }

    private int globalDepth = 1;
    private final List<Bucket<K, V>> directory = new ArrayList<>();

    public ExtendibleHashIndex() {
        Bucket<K, V> b0 = new Bucket<>(1);
        Bucket<K, V> b1 = new Bucket<>(1);
        directory.add(b0);
        directory.add(b1);
    }

    // Step 1: Hash calculation & O(1) directory lookup
    public V get(K key) {
        int hash = hashFunction(key);
        int index = hash & ((1 << globalDepth) - 1);
        return directory.get(index).entries.get(key);
    }

    // Step 2 & 3: Insert with bucket split and conditional directory doubling
    public synchronized void put(K key, V value) {
        int hash = hashFunction(key);
        int index = hash & ((1 << globalDepth) - 1);
        Bucket<K, V> bucket = directory.get(index);

        if (!bucket.isFull() || bucket.entries.containsKey(key)) {
            bucket.entries.put(key, value);
            return;
        }

        // Step 3: Bucket overflow - split bucket
        if (bucket.localDepth == globalDepth) {
            // Double directory size in RAM
            int currentSize = directory.size();
            for (int i = 0; i < currentSize; i++) {
                directory.add(directory.get(i));
            }
            globalDepth++;
        }

        // Allocate new sibling bucket
        bucket.localDepth++;
        Bucket<K, V> newBucket = new Bucket<>(bucket.localDepth);

        // Redistribute keys based on (localDepth - 1)-th bit
        Map<K, V> oldEntries = new HashMap<>(bucket.entries);
        bucket.entries.clear();

        for (Map.Entry<K, V> e : oldEntries.entrySet()) {
            int kHash = hashFunction(e.getKey());
            if ((kHash & (1 << (bucket.localDepth - 1))) != 0) {
                newBucket.entries.put(e.getKey(), e.getValue());
            } else {
                bucket.entries.put(e.getKey(), e.getValue());
            }
        }

        // Update directory pointers
        int mask = (1 << bucket.localDepth) - 1;
        int targetBit = 1 << (bucket.localDepth - 1);
        for (int i = 0; i < directory.size(); i++) {
            if ((i & mask) == targetBit) {
                directory.set(i, newBucket);
            }
        }

        // Retry put with expanded directory
        put(key, value);
    }

    private int hashFunction(K key) {
        return Math.abs(key.hashCode());
    }
}`
};
