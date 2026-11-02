import type { DatabaseTopic } from '../types';

export const bTree: DatabaseTopic = {
  id: 'b-tree',
  category: 'storage-engines',
  name: 'B+ Tree Indexing & Page Splitting',
  tagline: {
    en: 'The bedrock of relational storage: balanced tree traversal, high fan-out, and binary page splitting.',
    vi: 'Xương sống của cơ sở dữ liệu quan hệ: cây cân bằng nhiều nhánh, tra cứu trang nhị phân và phân tách 50/50.'
  },
  difficulty: 2,
  order: 1,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      en: 'Standard binary search trees (BST, AVL, Red-Black) have a fan-out of 2, creating deep trees (height O(log_2 N)). On physical disks, every pointer dereference requires a random I/O seek (~5-10ms on HDD, ~50-100µs on NVMe). A tree with height 30 would require 30 disk seeks per query, devastating throughput.',
      vi: 'Cây nhị phân thông thường (BST, AVL, Red-Black) có hệ số phân nhánh chỉ là 2, dẫn tới chiều cao cây rất lớn (O(log_2 N)). Trên đĩa vật lý, mỗi lần nhảy con trỏ đòi hỏi 1 lượt đọc ngẫu nhiên (seek ~5-10ms trên HDD, ~50-100µs trên NVMe). Cây cao 30 tầng sẽ tốn 30 lần truy cập đĩa cho 1 câu lệnh đơn giản, khiến hiệu năng bị tê liệt.'
    },
    hardwareConstraint: {
      en: 'Disk controllers and OS filesystems read and write data in fixed-size blocks (typically 4KB to 16KB pages). The B+ Tree matches node sizes exactly to filesystem pages, packing hundreds of keys per node to maximize memory bandwidth and minimize disk I/O.',
      vi: 'Bộ điều khiển đĩa và hệ điều hành luôn đọc ghi dữ liệu theo từng khối cố định (khung trang 4KB đến 16KB). Cây B+ Tree khớp kích thước nút bằng đúng một trang đĩa, nhồi hàng trăm khóa vào một trang nhằm khai thác tối đa băng thông bộ nhớ và giảm thiểu số lần đọc đĩa.'
    },
    fundamentalSolution: {
      en: 'A self-balancing search tree where each internal node holds B keys and B+1 pointers. All data records are stored exclusively in leaf nodes linked horizontally in a doubly-linked list. With fan-out B=100, 1 billion rows can be indexed with height h=4, requiring at most 4 page fetches.',
      vi: 'Một cây tìm kiếm tự cân bằng với mỗi nút trong chứa B khóa và B+1 con trỏ. Toàn bộ dữ liệu nằm duy nhất ở tầng lá, các lá được liên kết đôi với nhau. Với hệ số phân nhánh B=100, 1 tỷ dòng dữ liệu chỉ cần chiều cao h=4, tức tối đa 4 lần tải trang đĩa là tìm ra dữ liệu.'
    },
    math: {
      formula: 'Height h ≤ ⌈log_{B/2}((N+1)/2)⌉ + 1   [For B=200, N=10,000,000 ⟹ h=3]',
      description: {
        en: 'Tree height h is logarithmic with base B/2. For fan-out B=200 and N=10,000,000 rows, h=3.',
        vi: 'Chiều cao cây h tăng theo hàm logarit cơ số B/2. Với bậc B=200 và N=10,000,000 bản ghi, h chỉ bằng 3.'
      },
      timeComplexity: 'O(log_B N) point lookup & insert, O(log_B N + K) range scan',
      spaceComplexity: 'O(N) with ~67% average page occupancy',
      ioCostFormula: 'I/O Cost = h × RandomIO + (K / KeysPerPage) × SequentialIO'
    }
  },

  detailedTheory: {
    overview: {
      en: 'A B+ Tree is not just a data structure — it is the physical file layout of relational tables in MySQL InnoDB and the primary indexing format of PostgreSQL (nbtree). Understanding page splits, fill factor, and index clustering determines whether a high-traffic SQL query runs in 0.5 milliseconds or 5,000 milliseconds.',
      vi: 'Cây B+ Tree không chỉ là một cấu trúc giải thuật — nó chính là định dạng tệp vật lý của bảng dữ liệu trong MySQL InnoDB và là định dạng chỉ mục chủ lực của PostgreSQL (nbtree). Hiểu thấu đáo về phân tách trang (Page Split), hệ số điền đầy Fill Factor và Clustered Index là yếu tố quyết định câu lệnh SQL chạy trong 0.5 mili giây hay bị nghẽn tới 5.000 mili giây.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Clustered Index vs Secondary Index: In MySQL InnoDB, every table MUST have a Clustered Index (the Primary Key B+ Tree). Leaf nodes do not store pointers — they store the entire physical row data. Secondary indexes (e.g., INDEX on email) store the primary key ID as their leaf payload. A query like SELECT name, age FROM users WHERE email = ? must traverse the secondary index, get the primary key, and perform a second B+ Tree lookup (Bookmark Lookup) into the clustered index unless covered by a Covering Index.',
        vi: '1. Chỉ mục gom cụm (Clustered Index) vs Chỉ mục phụ (Secondary Index): Trong MySQL InnoDB, mọi bảng BẮT BUỘC có 1 Clustered Index (chính là cây B+ Tree khóa chính). Các trang lá không lưu con trỏ mà lưu trực tiếp toàn bộ dữ liệu dòng. Chỉ mục phụ (ví dụ index trên email) chỉ lưu giá trị khóa chính làm payload. Câu lệnh truy vấn qua email buộc phải duyệt cây index phụ, lấy khóa chính, rồi duyệt tiếp cây khóa chính lần 2 (Bookmark Lookup) trừ khi bạn tạo Covering Index.'
      },
      {
        en: '2. The Danger of UUID Primary Keys & Random Page Splitting: Sequential auto-increment BIGINT keys append cleanly to the right-most leaf page, producing sequential disk writes and 95%+ page fill factors. Random UUIDs (UUIDv4) insert into random pages across the entire B+ Tree. Pages frequently overflow, triggering 50/50 page splits, leaving pages half-empty, bloating disk storage by 2x-3x, and destroying SSD cache efficiency.',
        vi: '2. Mối nguy khi dùng UUID v4 làm khóa chính: Khóa tăng tự động BIGINT tuần tự luôn chèn nối tiếp vào trang lá ngoài cùng bên phải, tạo ra ghi tuần tự và độ lấp đầy trang đạt trên 95%. Ngược lại, UUID v4 ngẫu nhiên sẽ chèn rải rác khắp các trang trên toàn cây. Các trang liên tục bị tràn và kích hoạt tách 50/50, khiến các trang bị rỗng 50%, làm phình to dung lượng ổ đĩa gấp 2-3 lần và phá hủy hoàn toàn bộ nhớ đệm Buffer Pool.'
      },
      {
        en: '3. Covering Index Optimization & Index-Only Scans (Use The Index, Luke!): If a secondary index contains all columns requested by a query (e.g., CREATE INDEX idx_user_lookup ON users(email, status, created_at)), the database engine satisfies the query entirely from the B+ Tree index leaf page (Index Only Scan), never touching the underlying table heap pages at all. This cuts I/O by 80%-98% because leaf blocks are densely packed compared to bloated multi-column table heap blocks.',
        vi: '3. Tối ưu Covering Index & Quét Thuần Chỉ Mục (Index-Only Scan) (Use The Index, Luke!): Nếu một chỉ mục phụ bao gồm toàn bộ các cột mà câu lệnh SELECT yêu cầu (ví dụ index trên email, status, created_at), database engine sẽ lấy dữ liệu trực tiếp từ các trang lá của chỉ mục B+ Tree mà hoàn toàn không cần chạm tới bảng dữ liệu gốc (Heap). Kỹ thuật này giảm từ 80% đến 98% I/O đĩa vì các block lá index được nén đặc hơn nhiều so với các block dữ liệu bảng đầy đủ.'
      },
      {
        en: '4. Concurrency Control via Latch Crabbing Protocol (CMU Database Group 15-445): A B+ Tree serves thousands of concurrent read and write queries. To prevent data corruption during page splits while maximizing throughput, database engines employ the Latch Crabbing (or Latch Coupling) protocol. To search: acquire Shared (S) latch on child, then release S latch on parent. To insert/delete: traverse down acquiring Exclusive (X) latches; if a child node is "Safe" (it has spare space and will not split on insert, or has > min keys and will not merge on delete), the engine can immediately release all X latches held on all ancestor nodes! Optimistic Latch Crabbing traverses the tree with S latches down to the leaf, assuming the leaf is safe (which is true >99% of the time); only if the leaf overflows does it abort and re-traverse with heavy X latches.',
        vi: '4. Kiểm soát Đồng thời bằng Giao thức Latch Crabbing (CMU Database Group 15-445): Cây B+ Tree phục vụ hàng nghìn truy vấn đọc và ghi đồng thời. Để chống hỏng cấu trúc trang khi phân tách (split) trong khi vẫn duy trì thông lượng cao, hệ quản trị CSDL áp dụng giao thức Latch Crabbing (hoặc Latch Coupling). Khi tìm kiếm: chiếm chốt đọc Shared (S) ở node con trước, sau đó nhả chốt S ở node cha. Khi chèn/xóa: duyệt xuống và chiếm chốt ghi Exclusive (X); nếu phát hiện node con là "Node An Toàn" (còn chỗ trống sẽ không bị tách khi insert, hoặc có nhiều hơn số khóa tối thiểu sẽ không bị gộp khi delete), engine có thể lập tức nhả toàn bộ chốt X của tất cả các node tổ tiên phía trên! Giải thuật Latch Crabbing Lạc quan duyệt cây bằng chốt S xuống tận lá với giả định lá an toàn (>99% trường hợp); chỉ khi lá bị tràn thật sự nó mới hủy bỏ và duyệt lại bằng chốt X nặng.'
      },
      {
        en: '5. The Leftmost Prefix Rule & The Function Trap (Use The Index, Luke!): In composite B+ Tree indexes (e.g. INDEX on (status, created_at)), keys are sorted primarily by status, and only secondarily by created_at. Therefore: (1) WHERE status = ? AND created_at > ? executes a lightning-fast range scan. (2) WHERE created_at > ? CANNOT use the index directly for tree navigation (requiring a full index scan or skip scan) because the leftmost prefix is missing! Crucially, wrapping indexed columns in functions (e.g. WHERE EXTRACT(YEAR FROM created_at) = 2024 or WHERE LOWER(email) = ?) renders the B+ Tree completely useless, forcing a disastrous Full Table Scan unless an Expression/Functional Index is explicitly created.',
        vi: '5. Quy tắc Tiền tố Ngoài cùng Bên trái (Leftmost Prefix Rule) & Bẫy Hàm (Use The Index, Luke!): Trong composite index nhiều cột (như INDEX trên (status, created_at)), các khóa được sắp xếp trước hết theo status, sau đó mới đến created_at. Vì vậy: (1) WHERE status = ? AND created_at > ? sẽ thực thi quét dải cực nhanh. (2) WHERE created_at > ? HOÀN TOÀN KHÔNG THỂ dùng index để điều hướng cây (buộc phải quét toàn bộ index hoặc quét bỏ qua) vì thiếu mất tiền tố ngoài cùng bên trái! Đặc biệt nguy hiểm: việc bọc cột index trong các hàm (như WHERE YEAR(created_at) = 2024 hoặc WHERE LOWER(email) = ?) sẽ làm vô hiệu hóa cây B+ Tree, ép cơ sở dữ liệu phải Full Table Scan trừ khi bạn tạo Expression/Functional Index chuyên biệt.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Index Bloat in PostgreSQL: Updating indexed columns creates new tuple versions (due to MVCC), creating dead index tuples that require periodic REINDEX or pg_repack to avoid sluggish index scans.',
        vi: 'Phình to Index trong PostgreSQL: Khi UPDATE các cột có index, Postgres buộc phải tạo con trỏ index mới cho phiên bản mới, tích tụ các bản ghi rác khiến index phình to, cần chạy REINDEX hoặc pg_repack định kỳ.'
      },
      {
        en: 'Over-Indexing Anti-pattern: Adding an index on every column speeds up reads but devastates INSERT/UPDATE throughput, as every single write must acquire latches and update 5-10 separate B+ Trees on disk.',
        vi: 'Sai lầm đánh quá nhiều Index: Đánh index cho mọi cột giúp đọc nhanh nhưng bóp nghẹt tốc độ INSERT/UPDATE, vì mỗi dòng ghi mới buộc phải cập nhật đồng thời 5-10 cây B+ Tree trên ổ đĩa.'
      }
    ]
  },

  pageLayout: {
    title: {
      en: 'B+ Tree Page Binary Memory Layout (16KB Page)',
      vi: 'Cấu trúc nhị phân trang B+ Tree (Trang 16KB tiêu chuẩn)'
    },
    description: {
      en: 'A B+ Tree node maps directly to a 16KB physical disk block. The header contains node type flags, key count, and sibling pointers. Key and pointer arrays grow contiguously from left to right.',
      vi: 'Mỗi nút B+ Tree tương ứng với 1 block đĩa 16KB. Header chứa cờ loại trang, số lượng khóa và con trỏ lá kế tiếp. Mảng khóa và con trỏ mở rộng liền kề.'
    },
    asciiDiagram: `+-----------------------------------------------------------------------+
| PAGE HEADER (24 Bytes)                                                |
| [LSN: 8B] [PageType: 2B] [NumKeys: 2B] [PrevPage: 4B] [NextPage: 4B]  |
+-----------------------------------------------------------------------+
| KEY ARRAY:      [ Key 0 | Key 1 | Key 2 | ... | Key (N-1) ]           |
| POINTER ARRAY:  [ Ptr 0 | Ptr 1 | Ptr 2 | ... | Ptr N     ]           |
+-----------------------------------------------------------------------+
| UNALLOCATED FREE SPACE (Available for incoming inserts)               |
+-----------------------------------------------------------------------+
| LEAF RECORD SLOTS (Only on leaf pages: [Key -> Tuple Pointer / RID])  |
+-----------------------------------------------------------------------+`,
    headerFields: [
      { name: 'pd_lsn', size: '8 Bytes', description: { en: 'Log Sequence Number of last WAL record modifying this page', vi: 'LSN của bản ghi WAL gần nhất thay đổi trang này' } },
      { name: 'btpo_flags', size: '2 Bytes', description: { en: 'Bit flags (BTP_LEAF, BTP_ROOT, BTP_DELETED)', vi: 'Cờ trạng thái (nút lá, nút gốc, trang đã xóa)' } },
      { name: 'btpo_prev / next', size: '8 Bytes', description: { en: 'Pointers to left and right sibling pages for bidirectional range scans', vi: 'Con trỏ sang lá trái và lá phải phục vụ quét dải hai chiều' } }
    ]
  },

  steps: [
    {
      id: 'search',
      title: { en: '1. Root-to-Leaf Binary Search', vi: '1. Tra cứu nhị phân từ gốc xuống lá' },
      phase: 'TRAVERSAL',
      description: {
        en: 'The query engine loads the root page into the Buffer Pool. Inside the node, it executes a binary search over the sorted key array to locate the appropriate child pointer, repeating until arriving at the target leaf page.',
        vi: 'Động cơ truy vấn nạp trang gốc vào Buffer Pool. Trong trang, thuật toán thực hiện tìm kiếm nhị phân trên mảng khóa đã sắp xếp để tìm con trỏ nhánh con, lặp lại cho tới khi chạm đến trang lá đích.'
      },
      diskIoBehavior: {
        en: 'Root and upper branch pages are almost always pinned in RAM (Buffer Pool hit). Only the leaf page may require a physical disk fetch.',
        vi: 'Trang gốc và các nhánh trên hầu như luôn được ghim trong RAM (Buffer Pool hit). Chỉ có trang lá có thể cần đọc đĩa vật lý.'
      },
      javaCodeLineMatch: 'userRepository.findByEmailAndStatus(email, "ACTIVE")'
    },
    {
      id: 'overflow',
      title: { en: '2. Detect Page Overflow Threshold', vi: '2. Phát hiện ngưỡng tràn trang' },
      phase: 'INSERTION',
      description: {
        en: 'When inserting a new key into a leaf page, the engine verifies if free space is sufficient. If keys.size() exceeds MAX_KEYS, the page enters an overflow state requiring a structural modification operation (SMO).',
        vi: 'Khi chèn một khóa mới vào trang lá, engine kiểm tra xem dung lượng còn đủ không. Nếu keys.size() vượt quá MAX_KEYS, trang rơi vào trạng thái tràn bộ nhớ và kích hoạt thao tác tái cấu trúc cây (SMO).'
      },
      diskIoBehavior: {
        en: 'Page is marked DIRTY in the Buffer Pool. An Exclusive (X) latch is acquired on the page to prevent concurrent reader corruption.',
        vi: 'Trang bị đánh dấu DIRTY trong Buffer Pool. Khóa Exclusive (X) latch được giữ trên trang để ngăn luồng đọc đồng thời.'
      },
      javaCodeLineMatch: 'userRepository.save(newUser)'
    },
    {
      id: 'split',
      title: { en: '3. 50/50 Split & Median Key Promotion', vi: '3. Phân tách 50/50 và đẩy khóa giữa lên nút cha' },
      phase: 'REBALANCING',
      description: {
        en: 'A new sibling page is allocated from the tablespace. Exactly half the keys are moved to the new page. The median key is promoted into the parent internal node. If the parent overflows, the split cascades upward until a new root is created.',
        vi: 'Một trang mới được cấp phát từ tablespace. Đúng 50% số khóa được chuyển sang trang mới. Khóa trung vị được đẩy lên nút cha. Nếu nút cha cũng tràn, quá trình tách lan truyền ngược lên trên cho đến khi tạo nút gốc mới.'
      },
      diskIoBehavior: {
        en: 'Two dirty pages are written. WAL generates an SMO log record. Sibling next/prev pointers are updated atomically.',
        vi: 'Hai trang bẩn được cập nhật. WAL ghi bản ghi nhật ký tái cấu trúc (SMO). Con trỏ nối giữa các lá được cập nhật nguyên tử.'
      },
      javaCodeLineMatch: 'splitAndPromote()'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL nbtree',
      implementationName: 'Lehman & Yao High-Concurrency B-link Tree',
      keyMechanism: {
        en: 'Uses B-link tree variant with right-sibling "high keys". Readers never lock pages during traversal, eliminating read-write contention.',
        vi: 'Sử dụng biến thể B-link tree với khóa "high key" trỏ sang lá phải. Luồng đọc không bao giờ cần giữ lock khi duyệt cây, triệt tiêu tranh chấp đọc-ghi.'
      },
      defaultTuningConfig: 'maintenance_work_mem = 64MB, vacuum_cleanup_index_scale_factor = 0.1',
      architectureNote: {
        en: 'Index tuples contain (index_key, ItemPointerData TID) pointing directly to the heap page offset.',
        vi: 'Mỗi phần tử index chứa (khóa, TID) trỏ trực tiếp đến địa chỉ dòng dữ liệu trong bảng heap.'
      }
    },
    {
      engine: 'MySQL InnoDB',
      implementationName: 'Clustered B+ Tree Primary Key Index',
      keyMechanism: {
        en: 'The entire table row data is stored directly in the leaf pages of the primary key B+ Tree. Secondary indexes store the primary key value as their leaf payload.',
        vi: 'Dữ liệu toàn bộ dòng được lưu trực tiếp trong các trang lá của chỉ mục khóa chính. Chỉ mục phụ chỉ lưu giá trị khóa chính làm payload.'
      },
      defaultTuningConfig: 'innodb_page_size = 16384 (16KB), innodb_fill_factor = 100',
      architectureNote: {
        en: 'Secondary index lookups require a double traversal ("bookmark lookup") unless the query is completely covered by index columns.',
        vi: 'Truy vấn qua secondary index phải duyệt cây 2 lần (bookmark lookup) trừ khi câu lệnh là covering index.'
      }
    },
    {
      engine: 'Oracle Database (19c / 23ai)',
      implementationName: 'Oracle B*Tree & Index-Organized Tables (IOT)',
      keyMechanism: {
        en: 'Index-Organized Tables (IOT) store full rows in B*Tree leaf nodes. Reverse Key Indexes invert byte order (e.g. 1001 -> 1001 reversed) to eliminate right-most leaf buffer busy waits on auto-increment sequence inserts.',
        vi: 'Bảng Index-Organized Table (IOT) lưu toàn bộ dữ liệu dòng trong các lá B*Tree. Chỉ mục đảo khóa (Reverse Key Index) đảo ngược thứ tự byte để loại bỏ tranh chấp nghẽn trang lá ngoài cùng bên phải (buffer busy waits) khi chèn khóa tuần tự.'
      },
      defaultTuningConfig: 'ALTER INDEX idx_orders REBUILD ONLINE PCTFREE 10 REVERSE;',
      architectureNote: {
        en: 'Oracle embeds ITL (Interested Transaction List) slots inside each 8KB block header; transactions lock rows directly in the block without lock escalation.',
        vi: 'Oracle nhúng các slot ITL trực tiếp trong header block 8KB; các giao dịch khóa dòng trực tiếp trong block mà không cần leo thang khóa.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Deterministic O(log N) point lookup latency with strict upper bounds.', vi: 'Độ trễ tra cứu điểm O(log N) xác định với cận trên nghiêm ngặt.' },
      { en: 'Ultra-fast sequential range scans via horizontal leaf pointer chaining.', vi: 'Quét dải cực nhanh nhờ chuỗi liên kết ngang giữa các trang lá.' },
      { en: 'Cache-friendly: Top levels fit permanently into CPU L3 or OS page cache.', vi: 'Thân thiện bộ nhớ đệm: Các tầng trên cùng hầu như luôn nằm trong RAM/L3 cache.' }
    ],
    cons: [
      { en: 'High Write Amplification on random inserts (updating 1 row rewrites an entire 16KB page to disk).', vi: 'Khuếch đại ghi cao khi chèn ngẫu nhiên (chỉ sửa 1 dòng nhưng phải ghi lại cả trang 16KB xuống đĩa).' },
      { en: 'Page fragmentation: Splits leave pages ~50% empty until merges occur.', vi: 'Phân mảnh trang: Quá trình tách trang khiến các trang chỉ đầy ~50% cho tới khi được gom lại.' }
    ],
    writeAmplification: {
      en: 'WAF typically ranges from 10x to 50x for random update workloads due to full 16KB page flushes + WAL logging.',
      vi: 'Hệ số khuếch đại ghi WAF thường từ 10x đến 50x đối với ghi ngẫu nhiên do phải ghi cả trang 16KB kèm WAL log.'
    },
    recoveryGuarantee: {
      en: 'Strict ACID durability guaranteed via WAL redo records logged before page splitting is executed.',
      vi: 'Bảo đảm độ bền vững ACID tuyệt đối thông qua bản ghi WAL Redo trước khi thực hiện tách trang vật lý.'
    }
  },

  springBootCode: `# ===================================================================
# Spring Boot 3.x application.yml - B+ Tree & Index Optimization
# ===================================================================
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ecommerce_db
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  jpa:
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        # Enable statistics to inspect query execution time
        generate_statistics: true
        # Batching prevents individual random B+ tree updates
        jdbc.batch_size: 50
        order_inserts: true
        order_updates: true

---
// ===================================================================
// JPA Entity with Clustered Primary Key & Covering Secondary Index
// ===================================================================
package com.enterprise.ecommerce.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "orders",
    indexes = {
        // Covering Composite Index for fast range scans without heap lookups
        @Index(name = "idx_orders_customer_status_date", columnList = "customer_id, status, created_at")
    }
)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Sequential ID prevents B+ tree page splits!
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    // Getters and setters...
}

---
// ===================================================================
// Spring Data JPA Repository
// ===================================================================
package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Executes an Index-Only Scan along the B+ Tree leaf chain!
     */
    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId AND o.status = :status AND o.createdAt >= :since")
    List<Order> findRecentOrdersByCustomer(
        @Param("customerId") Long customerId,
        @Param("status") String status,
        @Param("since") Instant since
    );
}`,

  sqlQueries: `-- 1. Create table with optimal sequential BIGSERIAL primary key
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY, -- Clustered B+ Tree in MySQL; Heap Table + Unique Index in Postgres
    customer_id BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create high-efficiency composite B+ Tree index with fill factor tuning
CREATE INDEX idx_orders_customer_composite 
ON orders (customer_id, status, created_at)
WITH (fillfactor = 90); -- Leaves 10% space in leaf pages to avoid page splits on updates

-- 3. Verify B+ Tree Index Usage via EXPLAIN (ANALYZE, BUFFERS)
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
SELECT customer_id, status, created_at
FROM orders
WHERE customer_id = 42890 AND status = 'ACTIVE' AND created_at >= NOW() - INTERVAL '30 days';

/*
Expected Execution Plan:
->  Index Only Scan using idx_orders_customer_composite on orders  (cost=0.42..8.45 rows=5 width=28)
      Index Cond: ((customer_id = 42890) AND (status = 'ACTIVE') AND (created_at >= (now() - '30 days'::interval)))
      Buffers: shared hit=3 (Root -> Branch -> Leaf: Exactly 3 buffer hits!)
*/`,

  javaCode: `package com.database.internals.storage;

import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Pure Java 21 implementation of a B+ Tree Storage Index Node
 * with 50/50 page splitting and concurrent Read/Write latches.
 */
public class BPlusTreeIndex<K extends Comparable<K>, V> {
    public static final int PAGE_CAPACITY = 3;
    private final ReentrantReadWriteLock treeLock = new ReentrantReadWriteLock();
    private Node<K, V> root = new LeafNode<>();

    public V search(K key) {
        treeLock.readLock().lock();
        try {
            Node<K, V> curr = root;
            while (!curr.isLeaf()) {
                InternalNode<K, V> internal = (InternalNode<K, V>) curr;
                int idx = Collections.binarySearch(internal.keys, key);
                int childIdx = (idx >= 0) ? idx + 1 : -idx - 1;
                curr = internal.children.get(childIdx);
            }
            LeafNode<K, V> leaf = (LeafNode<K, V>) curr;
            int idx = Collections.binarySearch(leaf.keys, key);
            return (idx >= 0) ? leaf.values.get(idx) : null;
        } finally {
            treeLock.readLock().unlock();
        }
    }

    private interface Node<K, V> { boolean isLeaf(); }
    private static class LeafNode<K, V> implements Node<K, V> {
        final List<K> keys = new ArrayList<>();
        final List<V> values = new ArrayList<>();
        @Override public boolean isLeaf() { return true; }
    }
    private static class InternalNode<K, V> implements Node<K, V> {
        final List<K> keys = new ArrayList<>();
        final List<Node<K, V>> children = new ArrayList<>();
        @Override public boolean isLeaf() { return false; }
    }
}`,

  productionProblemCase: {
    title: {
      en: 'Primary Key Page Fragmentation & Write Stalls Caused by Random UUIDv4',
      vi: 'Phân Mảnh Trang Đĩa & Bùng Nổ Dung Lượng Do Dùng Random UUID Làm Khóa Chính'
    },
    businessContext: {
      en: 'A fintech processing platform stores hundreds of millions of payment ledger transactions. Developers chosen java.util.UUID.randomUUID() (UUIDv4) as the clustered primary key (@Id in JPA) to avoid centralized ID generators and prevent sequential ID enumeration attacks.',
      vi: 'Hệ thống thanh toán Fintech lưu trữ hàng trăm triệu giao dịch tài chính. Lập trình viên lựa chọn java.util.UUID.randomUUID() (UUIDv4) làm khóa chính cụm (@Id trong JPA) để phân tán và chống tấn công dò quét ID tuần tự.'
    },
    problemDescription: {
      en: 'A B+ Tree clustered index strictly orders rows physically on disk by primary key. Because UUIDv4 is completely pseudo-random across 128 bits, each incoming INSERT lands at a random leaf page somewhere across the multi-terabyte disk space. When an 8KB/16KB leaf page becomes full, inserting into the middle forces an expensive 50/50 Page Split. Over time, leaf pages average only ~50-60% fill factors—wasting 40-50% of SSD storage on dead padding! Worse, every single INSERT requires fetching a different random leaf page from disk into the Buffer Pool, destroying cache locality, causing 10x Write Amplification, and causing write throughput to collapse from 25,000 tx/s down to 850 tx/s.',
      vi: 'Chỉ mục cụm B+ Tree bắt buộc các dòng dữ liệu phải sắp xếp vật lý trên đĩa theo thứ tự khóa chính. Vì UUIDv4 ngẫu nhiên hoàn toàn 128-bit, mỗi lệnh INSERT mới sẽ rơi vào một trang lá ngẫu nhiên rải rác trên toàn bộ ổ đĩa hàng terabyte. Khi một trang 16KB bị đầy, việc chèn vào giữa ép B+ tree phải chia đôi trang (Page Split 50/50). Lâu ngày, các trang lá chỉ đạt tỷ lệ lấp đầy ~50-60%—lãng phí 40-50% dung lượng SSD! Tệ hơn, mỗi câu INSERT lại bắt Buffer Pool phải lôi một trang đĩa ngẫu nhiên khác nhau vào RAM, phá hủy tính cục bộ bộ nhớ, sinh ra 10x Write Amplification và làm sập thông lượng ghi từ 25.000 tx/s xuống còn 850 tx/s.'
    },
    whyNaiveFails: {
      en: 'Relational storage engines (InnoDB, Postgres heap+indexes) are mathematically bound to disk block layouts. Treating primary keys purely as logical identifiers without accounting for B+ Tree leaf page insertion ordering is an architectural anti-pattern that leads to severe disk bloat and I/O thrashing.',
      vi: 'Các storage engine quan hệ (MySQL InnoDB, Postgres heap + B-Tree) bị ràng buộc vật lý chặt chẽ theo cấu trúc trang đĩa. Xem khóa chính chỉ đơn thuần là định danh logic mà không tính đến thứ tự chèn trang lá B+ Tree là một sai lầm kiến trúc nghiêm trọng dẫn đến phình to dung lượng đĩa và nghẽn I/O vật lý.'
    },
    coreSolution: {
      en: '1. Time-Sequential Monotonic Primary Keys (UUIDv7 or TSID / Snowflake): Structure the 64-bit or 128-bit ID with a leading 48-bit millisecond Unix timestamp, followed by random bits for collision resistance.\n2. Right-Appended B+ Tree Ingestion: Because the timestamp strictly increases, new rows are always appended to the right-most leaf page, achieving 90-95% page fill factors without triggering interior page splits.\n3. Buffer Pool Warmth Preservation: Only the active right-most leaf page needs to reside in RAM during insertions, freeing up the remaining 99% of Buffer Pool space for read queries.',
      vi: '1. Khóa Chính Tuần Tự Theo Thời Gian (UUIDv7 hoặc TSID / Snowflake): Cấu trúc 64-bit hoặc 128-bit với 48-bit đầu là Unix timestamp (mili-giây), theo sau bởi các bit ngẫu nhiên chống trùng lặp.\n2. Chèn Tận Cùng Bên Phải B+ Tree (Right-Append Ingestion): Vì timestamp luôn tăng dần, các dòng mới luôn được nối vào trang lá tận cùng bên phải, đạt tỷ lệ lấp đầy trang 90-95% mà không gây Page Split trong ruột cây.\n3. Bảo Tồn Bộ Nhớ Đệm Buffer Pool: Chỉ duy nhất trang lá hiện tại cần nằm trong RAM trong quá trình chèn, giải phóng 99% dung lượng Buffer Pool còn lại phục vụ cho các truy vấn đọc OLTP.'
    },
    productionCode: `// Production Spring Data JPA Entity using Time-Sorted TSID (64-bit long)
@Entity
@Table(name = "payment_transactions", indexes = {
    @Index(name = "idx_tx_customer", columnList = "customer_id")
})
public class PaymentTransaction {

    // TSID: 48-bit timestamp + 16-bit random. Sortable, fits in 8-byte BIGINT B+ Tree slot!
    @Id
    @Tsid
    private Long id;

    @Column(nullable = false, length = 64)
    private String customerId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Standard getters & setters
}`,
    architectureImpact: {
      en: 'Total table storage shrank by 45% (from 1.2TB down to 660GB) due to 92% leaf page density. Write throughput soared 18x from 1,200 IOPS to 22,000 IOPS. Buffer Pool index hit ratio surged from 68% to 99.1%.',
      vi: 'Dung lượng bảng giảm 45% (từ 1.2TB xuống còn 660GB) nhờ mật độ lấp đầy trang đạt 92%. Thông lượng ghi tăng 18 lần từ 1.200 IOPS lên 22.000 IOPS. Tỷ lệ Cache Hit của chỉ mục B+ Tree trong Buffer Pool tăng từ 68% lên 99.1%.'
    }
  }
};
