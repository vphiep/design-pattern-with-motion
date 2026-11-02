import type { DatabaseTopic, ResearchCitation, DatabaseCategory } from './types';

export const TOPIC_SPECIFIC_CITATIONS: Record<string, ResearchCitation[]> = {
  'b-tree': [
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 2 & 3: B-Tree Basics, Classic B-Trees & Disk-Based Node Layout',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'B-Trees minimize expensive disk seeks by grouping hundreds of keys into wide 4KB-16KB block nodes with high fanout (100-500), bounding depth to <= 4.',
        vi: 'B-Tree giảm thiểu số lần tìm kiếm đĩa (disk seeks) đắt đỏ bằng cách gom hàng trăm khóa vào các node khối 4KB-16KB có độ rộng nhánh cao (fanout 100-500), giới hạn độ sâu cây <= 4.'
      },
      benchmarkOrInsight: {
        en: 'For 100,000,000 keys with 8KB page size and fanout 256, tree height is only 3 levels (4 total page reads from root to leaf).',
        vi: 'Với 100.000.000 khóa cùng kích thước trang 8KB và fanout 256, chiều cao cây chỉ vỏn vẹn 3 tầng (chỉ cần 4 lần đọc trang từ root tới leaf).'
      }
    },
    {
      source: 'Use The Index, Luke! (Markus Winand)',
      title: 'Anatomy of an Index: Leaf Nodes & Doubly Linked List Traversal',
      url: 'https://use-the-index-luke.com/sql/anatomy',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'B-Tree leaf nodes form a doubly linked list. Range scans (BETWEEN, >=) perform an initial tree lookup then follow leaf pointers with zero root re-traversals.',
        vi: 'Các lá B-Tree tạo thành danh sách liên kết kép. Quét dải (BETWEEN, >=) chỉ cần một lần tìm kiếm cây ban đầu rồi duyệt theo con trỏ lá mà không cần duyệt lại từ gốc.'
      },
      benchmarkOrInsight: {
        en: 'Executing index range scans eliminates O(log N) branch re-traversals for subsequent records, achieving linear leaf-speed throughput.',
        vi: 'Thực thi quét dải index loại bỏ chi phí O(log N) duyệt lại nhánh cho các bản ghi tiếp theo, đạt tốc độ duyệt tuyến tính ở tầng lá.'
      }
    },
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 07: Tree Indexes & Latch Crabbing Protocol',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/slides/07-bplus-trees.pdf',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Concurrent access requires latch crabbing: acquire child latch before releasing parent. Safe nodes (not full on insert, not min on delete) allow releasing all ancestor latches.',
        vi: 'Truy cập đồng thời đòi hỏi giao thức chốt latch crabbing: giữ chốt con trước khi nhả chốt cha. Node an toàn (chưa đầy khi insert, trên mức tối thiểu khi delete) cho phép nhả toàn bộ chốt tổ tiên.'
      },
      benchmarkOrInsight: {
        en: 'Optimistic latch crabbing assumes root modifications are rare (>99% operations hit non-root nodes), dramatically reducing root latch bottleneck.',
        vi: 'Latch crabbing lạc quan giả định các sửa đổi ở node gốc là cực hiếm (>99% thao tác chỉ can thiệp tầng dưới), giảm triệt để điểm nghẽn chốt tại root.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'B-Tree and B+ Tree in DBMS: Mechanics, Splitting & Merging',
      url: 'https://www.geeksforgeeks.org/introduction-of-b-tree-2/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'In B+ Trees, data pointers exist strictly in leaf nodes while internal nodes store only routing keys, maximizing branch fanout per page.',
        vi: 'Trong B+ Tree, con trỏ dữ liệu chỉ tồn tại ở các node lá, trong khi các node trong chỉ chứa routing key, tối đa hóa fanout trên mỗi trang đĩa.'
      }
    }
  ],

  'lsm-tree': [
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 7: Log-Structured Storage, SSTable Formats & Compaction Algorithms',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'LSM-Trees trade read amplification and background compaction CPU for sequential append-only disk writes, achieving 10x-50x higher write throughput than in-place B-Trees.',
        vi: 'LSM-Tree đánh đổi khuếch đại đọc và CPU compaction ngầm để lấy tốc độ ghi tuần tự append-only, đạt throughput ghi cao gấp 10x-50x so với ghi đè tại chỗ của B-Tree.'
      },
      benchmarkOrInsight: {
        en: 'Leveled Compaction limits space amplification to ~1.11x but increases Write Amplification (WAF ~10-30x). Size-Tiered maintains lower WAF (~4-8x) but requires up to 2x space overhead.',
        vi: 'Leveled Compaction giới hạn khuếch đại không gian ở mức ~1.11x nhưng tăng WAF (~10-30x). Size-Tiered duy trì WAF thấp hơn (~4-8x) nhưng cần tới 2x dung lượng đĩa dự phòng.'
      }
    },
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-721 Advanced Database Systems: LSM-Trees, Bloom Filters & Write Amplification',
      url: 'https://15721.courses.cs.cmu.edu/spring2024/slides/08-lsmtrees.pdf',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Bloom filters with 10 bits per key reduce negative SSTable lookups from O(L) to ~1%, eliminating disk reads for nonexistent keys across levels.',
        vi: 'Bộ lọc Bloom với 10 bit trên mỗi khóa giảm số lần đọc SSTable vô ích từ O(L) xuống chỉ còn ~1%, loại bỏ hoàn toàn việc đọc đĩa cho các key không tồn tại qua các level.'
      },
      benchmarkOrInsight: {
        en: 'Point lookups with optimized Bloom filters bypass 99% of cold SSTable disk accesses, bringing read latency within 1.5x of in-memory hash tables.',
        vi: 'Point lookup kết hợp Bloom filter tối ưu bỏ qua 99% lượt truy cập đĩa vào các SSTable lạnh, đưa độ trễ đọc về mức 1.5x so với bảng băm trong bộ nhớ.'
      }
    },
    {
      source: 'freeCodeCamp',
      title: 'How Log-Structured Merge-Trees Work in Distributed Big Data Databases',
      url: 'https://www.freecodecamp.org/news/log-structured-merge-trees/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Deletions in LSM-Trees do not physically remove bytes; they append a "tombstone" marker that masks previous entries until merged during compaction.',
        vi: 'Thao tác xóa trong LSM-Tree không xóa byte vật lý ngay; hệ thống ghi thêm một bia mộ ("tombstone") để che khuất bản ghi cũ cho tới khi compaction diễn ra.'
      }
    }
  ],

  'acid-anomalies': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 16: Concurrency Control Theory & Isolation Anomalies',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/slides/16-concurrencycontrol.pdf',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Conflict serializability requires the serialization graph to be an acyclic DAG. ANSI SQL definitions are incomplete because they omit anomalies like Write Skew and Read-Only Transaction Anomalies.',
        vi: 'Khả năng tuần tự hóa xung đột đòi hỏi đồ thị tuần tự hóa phải là một DAG không có chu trình. Định nghĩa ANSI SQL không đầy đủ vì bỏ sót các dị thường như Write Skew và Dị thường Transaction chỉ đọc.'
      },
      benchmarkOrInsight: {
        en: 'Under Snapshot Isolation, Write Skew can silently corrupt application invariants even though neither transaction reads uncommitted data or phantom rows.',
        vi: 'Dưới mức Snapshot Isolation, hiện tượng Write Skew có thể âm thầm phá vỡ bất biến ứng dụng dù không transaction nào đọc dữ liệu chưa commit hay phantom row.'
      }
    },
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 5: Transaction Processing, Serializability & Snapshot Isolation',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'Serializable Snapshot Isolation (SSI) detects consecutive rw-antidependency edges in the dynamic serialization graph, aborting the newer transaction to prevent anomalies with <5% overhead.',
        vi: 'SSI phát hiện các cạnh xung đột đọc-ghi (rw-antidependency) kế tiếp nhau trong đồ thị tuần tự hóa động, tự động hủy transaction mới hơn để ngăn dị thường với overhead <5%.'
      }
    },
    {
      source: 'Use The Index, Luke! (Markus Winand)',
      title: 'SQL Transaction Isolation Levels & Locking Behavior',
      url: 'https://use-the-index-luke.com/sql/transaction-isolation',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'PostgreSQL defaults to Read Committed, while MySQL InnoDB defaults to Repeatable Read. Applications migrating between engines without explicit locking face subtle concurrency bugs.',
        vi: 'PostgreSQL mặc định là Read Committed, trong khi MySQL InnoDB mặc định là Repeatable Read. Ứng dụng chuyển dịch giữa hai hệ quản trị mà không cấu hình lock tường minh sẽ gặp lỗi đồng thời ngầm.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'ACID Properties in DBMS: Practical Examples & Failure Scenarios',
      url: 'https://www.geeksforgeeks.org/acid-properties-in-dbms/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Atomicity and Durability are backed by recovery logs (Undo/Redo), while Consistency and Isolation are enforced by constraint validators and concurrency schedulers.',
        vi: 'Tính Nguyên tử và Bền vững được bảo đảm bởi log phục hồi (Undo/Redo), trong khi Tính Nhất quán và Cô lập được thực thi bởi bộ kiểm tra ràng buộc và bộ điều phối đồng thời.'
      }
    }
  ],

  'mvcc-isolation': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: 'An Empirical Evaluation of In-Memory Multi-Version Concurrency Control (VLDB 2017)',
      url: 'https://www.cs.cmu.edu/~pavlo/papers/vldb2017-mvcc.pdf',
      citationType: 'research-paper',
      keyTakeaway: {
        en: 'Paper compares 4 version storage schemes (Append-Only, Time-Travel, Two-Version, Delta). Append-only provides highest write throughput, while Delta provides best memory efficiency.',
        vi: 'Nghiên cứu so sánh 4 mô hình lưu version (Append-Only, Time-Travel, Two-Version, Delta). Append-only đạt tốc độ ghi cao nhất, trong khi Delta tiết kiệm bộ nhớ nhất.'
      },
      benchmarkOrInsight: {
        en: 'PostgreSQL uses Append-Only (W2O), creating new tuple versions on heap. MySQL InnoDB uses Delta (O2W), storing old versions in Undo tablespaces and keeping current row clustered in-place.',
        vi: 'PostgreSQL dùng Append-Only tạo tuple mới trên heap; MySQL InnoDB dùng Delta lưu phiên bản cũ vào Undo log và giữ bản ghi hiện tại cố định trên Clustered Index.'
      }
    },
    {
      source: 'PostgreSQL Documentation & Source',
      title: 'Chapter 74: Concurrency Control Implementation & Visibility Map',
      url: 'https://www.postgresql.org/docs/current/mvcc-intro.html',
      citationType: 'specification',
      keyTakeaway: {
        en: 'PostgreSQL MVCC visibility relies on tuple header fields (xmin, xmax) evaluated against a snapshot containing xmin:xmax:active_xip_list. Dead tuples require VACUUM cleanup.',
        vi: 'Tính khả kiến MVCC của PostgreSQL dựa trên xmin, xmax trong header bản ghi đối chiếu với snapshot gồm xmin:xmax:active_xip_list. Bản ghi chết đòi hỏi VACUUM dọn dẹp.'
      }
    },
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 6: MVCC Mechanics, Garbage Collection & Read Views',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'MVCC allows readers to never block writers, and writers to never block readers. Stale version reclamation is critical to prevent storage bloat.',
        vi: 'MVCC giúp người đọc không bao giờ chặn người ghi, và người ghi không bao giờ chặn người đọc. Việc thu hồi version rác là bắt buộc để ngăn phình to dữ liệu (bloat).'
      }
    }
  ],

  'query-optimizer-cbo': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 14: Cost-Based Query Optimization & Join Ordering',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/slides/14-optimizer1.pdf',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Cost-based query optimizers search the state space of equivalent relational algebra trees using Dynamic Programming (System R) or Rule-Based transformation (Volcano/Cascades) to minimize total disk I/O and CPU cost.',
        vi: 'Bộ tối ưu CBO tìm kiếm không gian trạng thái các cây đại số quan hệ tương đương bằng Quy hoạch động (System R) hoặc Biến đổi dựa trên luật (Volcano/Cascades) để tối thiểu hóa chi phí I/O và CPU.'
      },
      benchmarkOrInsight: {
        en: 'Join order optimization complexity is O(3^N) for bushy trees and O(2^N) for left-deep trees. Optimizers cap exact dynamic programming at 8-12 tables and switch to genetic algorithms.',
        vi: 'Độ phức tạp thứ tự join là O(3^N) với cây phân nhánh và O(2^N) với cây nhánh trái. Optimizer chuyển từ QHĐ sang thuật toán di truyền khi số bảng vượt quá 8-12.'
      }
    },
    {
      source: 'Use The Index, Luke! (Markus Winand)',
      title: 'The SQL Cost-Based Optimizer: Statistics, Histograms & Selectivity',
      url: 'https://use-the-index-luke.com/sql/cost-based-optimizer',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Outdated table statistics cause optimizer cardinality miscalculations. A 10x error in selectivity estimate can cause the engine to pick Nested Loop Join over Hash Join, leading to 1000x latency degradation.',
        vi: 'Thống kê bảng bị cũ khiến optimizer tính sai lực lượng (cardinality). Sai số 10x trong ước lượng selectivity có thể khiến DB chọn Nested Loop Join thay vì Hash Join, làm tăng độ trễ 1000x.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Cost-Based Query Optimization in DBMS: Principles & Cost Formulas',
      url: 'https://www.geeksforgeeks.org/cost-based-query-optimization/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Cost estimation formulas assign weighted costs to disk page accesses (sequential vs random page cost) and CPU evaluation per tuple.',
        vi: 'Công thức ước lượng chi phí gán trọng số cho số trang đĩa đọc (đọc tuần tự vs đọc ngẫu nhiên) và chu kỳ CPU kiểm tra điều kiện trên mỗi bản ghi.'
      }
    }
  ],

  'advanced-indexing': [
    {
      source: 'Use The Index, Luke! (Markus Winand)',
      title: 'The Leftmost Prefix Rule, Range Filters & Index-Only Scans',
      url: 'https://use-the-index-luke.com/sql/where-clause/searching-for-ranges/greater-than-less-than-and-between',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Composite index columns must follow the equality-first rule: place exact equality filters first, followed by range condition columns. An index-only scan retrieves all needed payload from leaf nodes with zero table heap lookups.',
        vi: 'Các cột trong composite index phải tuân thủ quy tắc dấu bằng trước: đặt cột so sánh bằng trước cột dải giá trị. Index-only scan đọc toàn bộ dữ liệu từ node lá mà không tốn lần đọc nào vào heap bảng.'
      },
      benchmarkOrInsight: {
        en: 'Index-Only Scans reduce physical I/O by 80%-98% on read-heavy analytics queries by reading directly from the leaf level without dereferencing table heap pages.',
        vi: 'Index-Only Scan giảm 80%-98% I/O vật lý trên các truy vấn đọc báo cáo bằng cách đọc trực tiếp từ tầng lá mà không cần giải con trỏ vào trang heap.'
      }
    },
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 08: Additional Index Types & Bitmap Index Scans',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/slides/08-indexconcurrency.pdf',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Bitmap index scans merge multiple non-covering indexes using bitwise AND/OR operations before sorting physical page addresses to turn random I/O into sequential page scans.',
        vi: 'Bitmap index scan gom nhiều index riêng rẽ bằng phép tính bit AND/OR trước khi sắp xếp địa chỉ trang vật lý để biến các lượt I/O ngẫu nhiên thành quét trang tuần tự.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Indexing in Databases: Clustered vs Non-Clustered & Covering Indexes',
      url: 'https://www.geeksforgeeks.org/indexing-in-databases-set-1/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Clustered indexes define the physical storage order of rows. A table can have only one clustered index, while secondary non-clustered indexes store row pointers or primary keys.',
        vi: 'Clustered index định đoạt thứ tự lưu trữ vật lý của các dòng trên đĩa. Một bảng chỉ có thể có duy nhất 1 clustered index, còn secondary index lưu con trỏ dòng hoặc khóa chính.'
      }
    }
  ],

  'write-ahead-log': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 20: Logging Schemes, WAL Protocol & Group Commit',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/slides/20-recovery.pdf',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'The Write-Ahead Log protocol mandates that log records representing changes must be flushed to non-volatile storage before corresponding dirty database pages are written to disk.',
        vi: 'Giao thức WAL bắt buộc bản ghi log đại diện cho thay đổi phải được flush xuống ổ cứng trước khi trang dữ liệu dirty trong RAM được phép ghi xuống đĩa.'
      },
      benchmarkOrInsight: {
        en: 'Group commit amortizes the 1ms-5ms OS fsync overhead across tens to hundreds of concurrent client commits, dramatically lifting transactions per second (TPS).',
        vi: 'Group commit phân bổ chi phí fsync 1ms-5ms của HĐH cho hàng chục đến hàng trăm commit đồng thời, tăng vọt số lượng transaction xử lý mỗi giây (TPS).'
      }
    },
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 4: On-Disk Storage, WAL Buffering & Checkpoint Mechanics',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'WAL records are sequentially ordered by Log Sequence Numbers (LSN). Checkpoints bound crash recovery time by recording the lowest unwritten page LSN.',
        vi: 'Các bản ghi WAL được đánh số thứ tự tuần tự qua LSN. Checkpoint giới hạn thời gian phục hồi sau sự cố bằng cách ghi nhận LSN nhỏ nhất của trang chưa được ghi đĩa.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Write-Ahead Logging (WAL) in DBMS: Concepts & Recovery Invariants',
      url: 'https://www.geeksforgeeks.org/write-ahead-logging-wal-in-dbms/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'WAL enables the STEAL and NO-FORCE buffer management policy, which yields maximum throughput by deferring disk flushes.',
        vi: 'WAL cho phép kiến trúc bộ đệm áp dụng chính sách STEAL và NO-FORCE, mang lại hiệu năng tối đa bằng cách trì hoãn việc flush đĩa.'
      }
    }
  ],

  'aries-recovery': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 21: ARIES Recovery Algorithm (Analysis, Redo, Undo)',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/slides/21-recovery2.pdf',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'C. Mohan\'s ARIES recovery relies on three fundamental phases: Analysis (reconstruct dirty page table and active transaction table), Redo (Repeating history), and Undo (Rolling back losers).',
        vi: 'Thuật toán ARIES của C. Mohan gồm 3 pha cốt lõi: Analysis (tái tạo bảng dirty page và transaction đang mở), Redo (lặp lại lịch sử), và Undo (rollback các transaction thất bại).'
      },
      benchmarkOrInsight: {
        en: 'Compensation Log Records (CLRs) written during Undo guarantee that if the database crashes again during recovery, the recovery process never repeats already undone actions.',
        vi: 'Bản ghi đền bù CLR được ghi trong pha Undo bảo đảm nếu hệ thống sập nguồn lần nữa trong lúc phục hồi, quá trình recovery không bao giờ phải hoàn tác lại các thao tác đã xong.'
      }
    },
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 6: Recovery Algorithms, Compensation Log Records & Fuzzy Checkpointing',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'Fuzzy checkpointing does not flush all dirty pages synchronously; it only writes the dirty page table and active transaction table, avoiding checkpoint stall spikes.',
        vi: 'Fuzzy checkpointing không ép flush toàn bộ trang bẩn ngay lập tức; nó chỉ ghi lại danh sách trang bẩn và transaction active, loại bỏ giật cục gián đoạn hệ thống.'
      }
    }
  ]
};

export const CATEGORY_DEFAULT_CITATIONS: Record<DatabaseCategory, ResearchCitation[]> = {
  'storage-engines': [
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Part I: Storage Engines (Chapters 1-7: B-Tree, Slotted Page, LSM-Tree)',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'Storage engines govern how records are laid out on persistent media. Page-based structures optimize point lookups, while log-structured systems maximize write bandwidth.',
        vi: 'Storage engine định đoạt cách các bản ghi được bố trí trên đĩa. Cấu trúc dạng trang tối ưu tìm kiếm điểm, trong khi cấu trúc log tối đa hóa băng thông ghi.'
      }
    },
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Intro to Database Systems: Storage & Disk Management',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Databases manage their own page cache and file layout rather than relying on OS mmap, avoiding uncontrollable OS page flush stalls.',
        vi: 'Hệ quản trị CSDL tự quản lý bộ đệm trang và bố cục file thay vì dựa vào OS mmap để tránh các đợt gián đoạn flush trang không kiểm soát của HĐH.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Storage Engine Architectures in Relational and NoSQL Databases',
      url: 'https://www.geeksforgeeks.org/storage-engines-in-database-management-system/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Storage engines provide abstract APIs (insert, update, delete, scan) to decouple physical byte layouts from logical query execution.',
        vi: 'Storage engine cung cấp API trừu tượng (insert, update, delete, scan) để phân tách cấu trúc byte vật lý khỏi logic thực thi truy vấn.'
      }
    }
  ],

  'indexing-techniques': [
    {
      source: 'Use The Index, Luke! (Markus Winand)',
      title: 'SQL Indexing & Tuning Guide: The B-Tree Index Explained',
      url: 'https://use-the-index-luke.com/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'An index is a redundant data structure designed solely for query acceleration. Index maintenance cost directly affects INSERT, UPDATE, and DELETE throughput.',
        vi: 'Index là cấu trúc dữ liệu dự phòng được thiết kế thuần túy để tăng tốc truy vấn. Chi phí duy trì index ảnh hưởng trực tiếp đến hiệu năng của INSERT, UPDATE và DELETE.'
      }
    },
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 07 & 08: Tree and Hash Indexes',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Tree indexes support range scans and prefix matching; hash indexes support strictly O(1) equality lookups but cannot perform range searches.',
        vi: 'Tree index hỗ trợ quét dải và khớp tiền tố; hash index hỗ trợ tra cứu chính xác O(1) nhưng hoàn toàn không thể quét dải.'
      }
    },
    {
      source: 'freeCodeCamp',
      title: 'How Database Indexing Works Under the Hood: A Comprehensive Guide',
      url: 'https://www.freecodecamp.org/news/how-database-indexing-works-under-the-hood/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Without indexing, queries degrade to full table scans (O(N) I/O). Indexes reduce scan costs to O(log N) page reads.',
        vi: 'Nếu không có index, truy vấn sẽ thoái hóa thành full table scan (O(N) I/O). Index giảm chi phí quét xuống mức O(log N) lần đọc trang.'
      }
    }
  ],

  'buffer-memory': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 05: Buffer Pool Management & Replacement Policies',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/slides/05-bufferpool.pdf',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Buffer pools use a page table and frame array to cache disk pages in RAM. Replacement algorithms (LRU-K, Clock-Sweep, 2Q) prevent sequential scan flooding.',
        vi: 'Buffer pool dùng page table và mảng frame để đệm trang đĩa trên RAM. Các giải thuật thay thế trang (LRU-K, Clock-Sweep, 2Q) ngăn hiện tượng scan flood.'
      }
    },
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 4: Memory Management, Dirty Page Eviction & Double Buffering',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'Direct I/O (O_DIRECT) bypasses the OS page cache to eliminate double buffering overhead between the database buffer pool and kernel cache.',
        vi: 'Direct I/O (O_DIRECT) vượt qua bộ đệm trang của OS để loại bỏ chi phí đệm trùng lặp (double buffering) giữa DB buffer pool và kernel cache.'
      }
    }
  ],

  'concurrency-tx': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 17 & 18: Two-Phase Locking, Deadlock Detection & MVCC',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Strict 2PL prevents cascading aborts by holding all exclusive locks until commit. Deadlock detectors maintain wait-for graphs and abort younger victim transactions.',
        vi: 'Strict 2PL ngăn ngừa cascading abort bằng cách giữ toàn bộ exclusive lock tới khi commit. Bộ phát hiện deadlock duy trì wait-for graph và abort transaction trẻ hơn.'
      }
    },
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 5 & 6: Concurrency Control, Lock Manager & Isolation Spectrum',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'Latches protect in-memory data structures (microseconds); locks protect database logical transaction contents (milliseconds to minutes).',
        vi: 'Latch bảo vệ cấu trúc dữ liệu trong bộ nhớ (micro giây); lock bảo vệ dữ liệu logic của transaction (mili giây đến vài phút).'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Concurrency Control Protocols in DBMS: Lock-Based and Timestamp-Based',
      url: 'https://www.geeksforgeeks.org/concurrency-control-protocol-in-dbms/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Concurrency control guarantees transaction isolation and system throughput without compromising serializability invariants.',
        vi: 'Điều khiển đồng thời bảo đảm tính cô lập của transaction và thông lượng hệ thống mà không phá vỡ tính tuần tự hóa.'
      }
    }
  ],

  'durability-wal': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-445/645 Lecture 19 & 20: Write-Ahead Logging & Crash Recovery',
      url: 'https://15445.courses.cs.cmu.edu/fall2024/',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Durability mandates that once a transaction receives a commit acknowledgment, its modifications cannot be lost under any crash or power failure.',
        vi: 'Tính bền vững bắt buộc một khi transaction nhận thông báo commit thành công, các thay đổi của nó không bao giờ được phép mất đi dưới mọi sự cố sập nguồn.'
      }
    },
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Chapter 4: On-Disk Storage & Recovery Logs',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'Torn page protections (PostgreSQL FPW, InnoDB Doublewrite Buffer) prevent unrecoverable block corruption caused by half-written pages during sudden power loss.',
        vi: 'Cơ chế chống rách trang (PostgreSQL FPW, InnoDB Doublewrite) ngăn hỏng khối không thể phục hồi do việc ghi dở trang khi mất điện đột ngột.'
      }
    }
  ],

  'distributed-consensus': [
    {
      source: 'CMU Database Group (Andy Pavlo)',
      title: '15-721 Advanced Database Systems: Distributed OLTP & Consensus',
      url: 'https://15721.courses.cs.cmu.edu/spring2024/',
      citationType: 'academic-course',
      keyTakeaway: {
        en: 'Distributed databases use Two-Phase Commit (2PC) for atomic commitment across shards and Raft/Paxos for quorum durability and high availability.',
        vi: 'Cơ sở dữ liệu phân tán dùng Two-Phase Commit (2PC) cho tính nguyên tử giữa các shard và Raft/Paxos cho độ bền đa số (quorum) và tính sẵn sàng cao.'
      }
    },
    {
      source: 'Database Internals (Alex Petrov, O\'Reilly)',
      title: 'Part II: Distributed Systems (Chapters 8-14: Replication, Partitioning & Consensus)',
      url: 'https://www.oreilly.com/library/view/database-internals/9781492040330/',
      citationType: 'book',
      keyTakeaway: {
        en: 'Consistent hashing bounds re-sharding overhead to K/N keys when adding or removing database cluster nodes.',
        vi: 'Consistent hashing giới hạn số lượng key cần di dời ở mức K/N khi thêm hoặc bớt các node trong cụm CSDL.'
      }
    },
    {
      source: 'freeCodeCamp',
      title: 'Distributed Systems: Raft Consensus Algorithm Explained with Diagrams',
      url: 'https://www.freecodecamp.org/news/raft-consensus-algorithm-explained/',
      citationType: 'engineering-guide',
      keyTakeaway: {
        en: 'Raft divides consensus into leader election, log replication, and safety invariants to ensure replicated state machine consistency.',
        vi: 'Raft phân chia đồng thuận thành bầu leader, sao chép log và các bất biến an toàn để bảo đảm tính nhất quán của máy trạng thái sao chép.'
      }
    }
  ]
};

export function getDatabaseResearchCitations(topic: DatabaseTopic): ResearchCitation[] {
  if (topic.researchCitations && topic.researchCitations.length > 0) {
    return topic.researchCitations;
  }
  if (TOPIC_SPECIFIC_CITATIONS[topic.id]) {
    return TOPIC_SPECIFIC_CITATIONS[topic.id];
  }
  return CATEGORY_DEFAULT_CITATIONS[topic.category] || CATEGORY_DEFAULT_CITATIONS['storage-engines'];
}
