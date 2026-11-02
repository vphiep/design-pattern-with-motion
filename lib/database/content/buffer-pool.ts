import type { DatabaseTopic } from '../types';

export const bufferPool: DatabaseTopic = {
  id: 'buffer-pool',
  category: 'buffer-memory',
  name: 'Buffer Pool & Clock Page Eviction',
  tagline: {
    en: 'Memory hierarchy management: in-memory frame tables, dirty page tracking, O_DIRECT bypassing, and Clock / 2Q replacement algorithms.',
    vi: 'Quản lý phân cấp bộ nhớ: bảng khung nhớ RAM, theo dõi trang bẩn (Dirty), vượt mặt OS Cache (O_DIRECT) và giải thuật Clock / 2Q.'
  },
  difficulty: 3,
  order: 5,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'DRAM access latency is ~50-100 nanoseconds, while NVMe SSD random access is ~50-100 microseconds (1,000x slower), and magnetic HDD seek is ~5-10 milliseconds (100,000x slower). Databases must maintain a dedicated in-memory cache of physical disk blocks to answer queries in nanoseconds while ensuring modified data is safely persisted without data loss on system crashes.',
      vi: 'Độ trễ truy cập RAM là ~50-100 nanosecond, trong khi đọc ngẫu nhiên SSD NVMe tốn ~50-100 microsecond (chậm hơn 1.000 lần), và HDD tốn ~5-10 millisecond (chậm hơn 100.000 lần). Hệ quản trị cơ sở dữ liệu bắt buộc phải duy trì một vùng đệm RAM chuyên dụng chứa các block đĩa để đáp ứng truy vấn tính bằng nano giây mà vẫn đảm bảo tính an toàn dữ liệu tuyệt đối khi sập nguồn.'
    },
    hardwareConstraint: {
      en: 'Operating system page caches (managed by the OS kernel) are semantically oblivious to database access patterns: the OS cannot distinguish between a critical B+ Tree root page and a temporary sequential scan block. Under memory pressure, the OS might evict vital index roots, while uncoordinated OS writebacks violate the Write-Ahead Logging (WAL) protocol. Databases must bypass OS caching using direct I/O (O_DIRECT).',
      vi: 'Bộ đệm trang của hệ điều hành (OS Page Cache) hoàn toàn mù mờ trước ngữ nghĩa truy vấn CSDL: OS không phân biệt được đâu là trang gốc B+ Tree tối quan trọng, đâu là trang quét bảng tạm thời. Khi thiếu RAM, OS có thể tống khứ nhầm trang index nóng, đồng thời việc OS tự ý ghi đĩa bất thường sẽ phá vỡ giao thức ghi nhật ký trước (WAL). CSDL buộc phải vượt mặt OS cache bằng cờ truy cập trực tiếp O_DIRECT.'
    },
    fundamentalSolution: {
      en: 'The Buffer Pool allocates a large, fixed array of memory frames (typically 70-80% of server RAM in MySQL InnoDB, or 25-40% in PostgreSQL) managed via a striped Page Table hash map. When RAM is exhausted, it executes the Clock Eviction Algorithm (Second Chance) or Midpoint Insertion LRU: sweeping frames circularly, checking pin counts, decrementing usage counters, and evicting unpinned victim pages to make room for incoming disk blocks.',
      vi: 'Buffer Pool cấp phát một mảng cố định các khung nhớ (thường chiếm 70-80% RAM trên MySQL InnoDB, hoặc 25-40% trên PostgreSQL) được quản lý qua bảng băm Page Table phân dải khóa (lock striping). Khi RAM cạn kiệt, giải thuật Clock (Second Chance) hoặc Midpoint Insertion quét vòng tròn các frame, kiểm tra pin count, giảm bộ đếm sử dụng và chọn một frame không bị khóa (unpinned) làm nạn nhân để nạp block đĩa mới.'
    },
    math: {
      formula: 'Hit Ratio = Cache Hits / Total Page Accesses,   Effective Latency = Hit × T_RAM + (1 - Hit) × T_Disk',
      description: {
        en: 'A 99% hit ratio yields an effective access time of ~1.05 microseconds, whereas a 90% hit ratio causes effective latency to jump to ~10 microseconds—a catastrophic 10x drop in overall database throughput.',
        vi: 'Tỷ lệ cache hit 99% cho thời gian truy cập hiệu dụng ~1.05µs, trong khi tỷ lệ 90% khiến độ trễ vọt lên ~10µs—khiến thông lượng truy vấn của toàn hệ thống sụt giảm thảm hại tới 10 lần do nghẽn I/O đĩa vật lý.'
      },
      timeComplexity: 'O(1) hash lookup in page table, amortized O(1) clock sweep replacement',
      spaceComplexity: 'Fixed pre-allocated memory pool (e.g., 64GB - 512GB frame buffer)',
      ioCostFormula: 'Page Fault Cost = Dirty Page Flush (if dirty) + Synchronous Disk Read (8KB/16KB)'
    }
  },

  detailedTheory: {
    overview: {
      en: 'The Buffer Pool is the foundational architectural bridge between transient, nanosecond-speed DRAM and persistent, microsecond-speed non-volatile block storage. Rather than operating as a naive key-value cache, the Buffer Pool is an authoritative runtime transaction environment: it enforces ACID durability boundaries via the WAL protocol, manages concurrent memory latches without deadlocks, and protects system stability against catastrophic cache pollution from full table scans.',
      vi: 'Buffer Pool là cây cầu kiến trúc cốt lõi kết nối giữa bộ nhớ RAM tốc độ nano giây và ổ cứng lưu trữ bền vững tốc độ micro giây. Thay vì chỉ là một bộ nhớ đệm key-value thụ động, Buffer Pool là môi trường thực thi giao dịch có thẩm quyền tối cao: nó thực thi ranh giới bền vững ACID thông qua giao thức WAL, điều phối các chốt bộ nhớ (latches) đồng thời và bảo vệ hệ thống khỏi thảm họa ô nhiễm bộ đệm từ các truy vấn quét toàn bảng (Full Table Scan).'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Hardware Memory Hierarchy Gap & Physical Latency: L1 CPU cache delivers data in ~0.5-1ns, L2 in ~3-7ns, L3 in ~10-20ns, and main DRAM in ~60-100ns. In contrast, an enterprise NVMe SSD 4KB random read takes ~50-100µs (1,000x slower), and magnetic spinning disks require ~5-10ms (100,000x slower). If a database engine had to fetch every 8KB/16KB page from disk, CPU cores would stall on 99.9% of clock cycles. The Buffer Pool bridges this chasm by maintaining the hottest database pages resident in DRAM.',
        vi: '1. Khoảng cách Phân cấp Bộ nhớ & Nghịch lý Độ trễ Vật lý: Cache L1 của CPU phản hồi dữ liệu trong ~0.5-1ns, L2 trong ~3-7ns, L3 trong ~10-20ns và RAM chính tốn ~60-100ns. Ngược lại, một ổ NVMe SSD đọc ngẫu nhiên block 4KB mất ~50-100µs (chậm hơn 1.000 lần), và ổ từ HDD mất ~5-10ms (chậm hơn 100.000 lần). Nếu CSDL phải đọc từng trang 8KB/16KB từ đĩa, CPU core sẽ nhàn rỗi chờ đợi tới 99.9% số chu kỳ xung nhịp. Buffer Pool sinh ra để lấp đầy hố sâu ngăn cách này bằng cách giữ các trang nóng nhất ngay trong RAM.'
      },
      {
        en: '2. The Battle with the OS Kernel: Why Databases Bypass OS Page Cache (O_DIRECT): Operating systems maintain their own page cache, but database engines deliberately bypass it using O_DIRECT on Linux (or FILE_FLAG_NO_BUFFERING on Windows). First, "Double Buffering" wastes 50% of server RAM storing duplicate copies of the same 8KB page in both kernel space and user space. Second, the OS has zero semantic awareness: it cannot tell whether a page belongs to a frequently traversed B+ Tree root or a throwaway batch log scan, evicting vital indexes. Third, the OS writes dirty pages back uncoordinatedly, violating the WAL invariant.',
        vi: '2. Vượt mặt OS Page Cache bằng Direct I/O (O_DIRECT): Hệ điều hành có sẵn bộ đệm trang (Page Cache), nhưng các CSDL chủ động bỏ qua nó bằng cờ O_DIRECT trên Linux (hoặc FILE_FLAG_NO_BUFFERING trên Windows). Thứ nhất, hiện tượng "Nhân đôi bộ đệm" (Double Buffering) làm lãng phí 50% RAM khi lưu 2 bản sao của cùng một trang 8KB ở cả kernel space và user space. Thứ hai, OS hoàn toàn mù về ngữ nghĩa CSDL: OS không biết trang nào là gốc B+ Tree tối quan trọng, trang nào là trang quét rác tạm thời. Thứ ba, OS tự ý xả đĩa bất thường, vi phạm nghiêm trọng nguyên tắc an toàn WAL.'
      },
      {
        en: '3. Internal Anatomy of the Buffer Pool: Frames, Page Table, and Latches vs Locks: The buffer pool is organized as a contiguous array of fixed-size Frames (e.g. 8KB in Postgres, 16KB in InnoDB). A lock-striped Page Table hash map maps (TablespaceID, PageNumber) -> FrameID. Each frame descriptor contains: pin_count (active concurrent threads using the page; pin_count > 0 prevents eviction), dirty_bit (page was modified in RAM), and page_lsn. Crucially, "Latches" (short-lived mutexes/rwlocks protecting in-memory frame bytes for microseconds) are fundamentally distinct from "Locks" (transaction-level logical locks held until COMMIT/ROLLBACK).',
        vi: '3. Giải phẫu Nội tại Buffer Pool: Frames, Page Table và Latches vs Locks: Buffer Pool được tổ chức thành mảng liên tục các Frame kích thước cố định (8KB ở Postgres, 16KB ở InnoDB). Bảng băm Page Table phân dải khóa ánh xạ (TablespaceID, PageNumber) -> FrameID. Mỗi frame descriptor chứa: pin_count (số lượng luồng đang đọc/ghi; pin_count > 0 thì cấm trục xuất), dirty_bit (trang đã bị sửa trong RAM), và page_lsn. Cần phân biệt rõ: "Latches" (chốt bộ nhớ ngắn hạn bảo vệ cấu trúc RAM trong micro giây) hoàn toàn khác biệt với "Locks" (khóa logic giao dịch giữ tới khi COMMIT/ROLLBACK).'
      },
      {
        en: '4. The Page Replacement War: Clock (Second Chance) vs Midpoint Insertion & LRU-K: Naive FIFO suffers from Belady’s Anomaly, while naive LRU suffers from sequential scan pollution—a single "SELECT * FROM large_table" flushes the entire working set from RAM! Modern engines use scan-resistant variants. PostgreSQL uses the Clock Sweep algorithm: the clock hand checks usage_count (0 to 5); hot B+ Tree pages build usage_count=5 and survive multiple sweeps. MySQL InnoDB splits its LRU into Young (5/8) and Old (3/8) sublists; new pages enter at the midpoint, and innodb_old_blocks_time (1000ms) prevents sequential scans from ever entering the Young list.',
        vi: '4. Cuộc chiến Giải thuật Hoán đổi: Clock (Second Chance) vs Midpoint Insertion & LRU-K: Thuật toán FIFO ngây thơ mắc nghịch lý Belady, còn LRU cổ điển bị thảm họa ô nhiễm quét tuần tự (Sequential Scan Pollution)—chỉ một câu "SELECT * FROM large_table" sẽ tống khứ sạch bách dữ liệu nóng khỏi RAM! Các CSDL hiện đại dùng biến thể chống quét. PostgreSQL dùng giải thuật Quét Kim Đồng Hồ (Clock Sweep) với bộ đếm usage_count (0 đến 5); trang gốc B+ tree đạt điểm 5 và trụ vững qua nhiều vòng quét. MySQL InnoDB chia LRU làm hai nửa Young (5/8) và Old (3/8); trang mới chỉ được nạp ở điểm giữa (midpoint), và tham số innodb_old_blocks_time (1000ms) ngăn chặn quét tuần tự xâm nhập vào vùng Young.'
      },
      {
        en: '5. Dirty Page Lifecycle & The WAL-Before-Flush Invariant: When an UPDATE query modifies a row, the storage engine changes the page in RAM, sets dirty_bit = true, and assigns the operation’s Log Sequence Number (PageLSN). The transaction commits as soon as the WAL log is fsynced—the data page itself remains dirty in RAM! Under the WAL Protocol Invariant, a dirty data page can NEVER hit disk unless its PageLSN <= FlushedLSN on durable storage. Dedicated background writers (bgwriter in Postgres, Page Cleaners in InnoDB) continuously coalesce and flush dirty pages asynchronously to prevent user queries from blocking.',
        vi: '5. Vòng đời Trang Bẩn & Luật Bất biến WAL-trước-khi-xả: Khi lệnh UPDATE sửa một dòng dữ liệu, storage engine sửa trực tiếp trong RAM, bật cờ dirty_bit = true và gán mã số Log Sequence Number (PageLSN). Giao dịch commit thành công ngay khi bản ghi WAL được fsync xuống đĩa—trang dữ liệu thực tế vẫn nằm nguyên trong RAM ở trạng thái "bẩn"! Theo luật bất biến WAL, một trang bẩn TUYỆT ĐỐI KHÔNG được ghi xuống đĩa nếu PageLSN chưa được bền vững hóa (PageLSN <= FlushedLSN). Tiến trình ngầm (bgwriter ở Postgres, Page Cleaners ở InnoDB) liên tục xả trang bẩn bất đồng bộ để người dùng không bị tắc nghẽn.'
      },
      {
        en: '6. High-Concurrency Scaling: Buffer Pool Sharding & NUMA Topology: In modern servers with 64+ CPU cores, thousands of concurrent queries hitting a single global Buffer Pool mutex causes severe CPU lock convoying. Production engines eliminate this bottleneck through Buffer Pool Sharding (e.g. innodb_buffer_pool_instances = 8 or 16 in MySQL). The memory pool is partitioned into independent shards, each with its own mutex, page table, free list, and LRU list. Pages are deterministically assigned via hash(page_id) % instances, enabling linear multicore throughput scalability.',
        vi: '6. Mở rộng Đa nhân Cao độ: Phân mảnh Buffer Pool (Sharding) & NUMA Topology: Trên các máy chủ hiện đại với 64+ CPU core, hàng nghìn truy vấn đồng thời cùng tranh chấp một khóa Mutex Buffer Pool toàn cục sẽ gây thắt cổ chai CPU nghiêm trọng. Các CSDL giải quyết triệt để bằng cách Phân mảnh Buffer Pool (ví dụ cấu hình innodb_buffer_pool_instances = 8 hoặc 16 trên MySQL). Bộ đệm RAM được chia thành các instance độc lập, mỗi instance có mutex, bảng băm, free list và LRU list riêng. Trang được phân bổ xác định qua hash(page_id) % instances, giúp thông lượng mở rộng tuyến tính theo số core.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Double Buffering & The Linux OOM Killer: Setting PostgreSQL shared_buffers to 80-90% of system RAM is a fatal mistake. Unlike MySQL InnoDB which uses O_DIRECT, PostgreSQL relies on the OS Page Cache for caching writes and kernel readahead. If shared_buffers is configured too high, concurrent connection processes allocating work_mem will exhaust available system RAM, triggering the Linux Out-Of-Memory (OOM) killer to terminate the postmaster process abruptly. Rule of thumb: allocate 25-40% of RAM to PostgreSQL shared_buffers, but 70-80% to MySQL innodb_buffer_pool_size.',
        vi: 'Nhân đôi Bộ nhớ (Double Buffering) & Thảm họa Linux OOM Killer: Cấu hình shared_buffers của PostgreSQL lên 80-90% RAM máy chủ là một sai lầm chết người. Khác với MySQL InnoDB dùng O_DIRECT, PostgreSQL phụ thuộc vào OS Page Cache cho việc đọc trước và tối ưu ghi. Nếu shared_buffers quá lớn, các tiến trình kết nối cấp phát work_mem sẽ làm cạn kiệt RAM hệ thống, kích hoạt Linux OOM Killer tiêu diệt tiến trình CSDL tức thì. Quy tắc chuẩn: chỉ phân bổ 25-40% RAM cho shared_buffers của Postgres, nhưng phân bổ 70-80% RAM cho innodb_buffer_pool_size của MySQL.'
      },
      {
        en: 'Sequential Scan Cache Thrashing from Naive ORMs: A single unindexed JPA query or reporting batch job executing SELECT * without pagination sweeps millions of rows through the storage engine. In misconfigured databases (such as MySQL with innodb_old_blocks_time = 0), this massive sweep evicts the entire active working set—including frequently accessed B+ Tree root pages. As a result, subsequent OLTP point-lookups encounter 100% cache misses, driving disk I/O to 100% saturation and bringing API servers to a crawl.',
        vi: 'Ô nhiễm Bộ đệm do Quét Bảng Tuần tự từ ORM: Một câu truy vấn JPA thiếu index hoặc tiến trình batch xuất báo cáo chạy SELECT * không phân trang sẽ kéo hàng triệu bản ghi qua storage engine. Nếu cấu hình sai (như MySQL để innodb_old_blocks_time = 0), đợt quét khổng lồ này sẽ tống khứ toàn bộ working set nóng—kể cả các trang gốc B+ tree. Hậu quả là các truy vấn OLTP tức thời tiếp theo bị Cache Miss 100%, đẩy I/O đĩa lên ngưỡng 100% kịch khung và làm sập toàn bộ hệ thống API.'
      },
      {
        en: 'Checkpoint Spikes & Foreground Synchronous Write Stalls: If the write workload generates dirty pages faster than the background writer daemon can asynchronously flush them, the buffer pool runs out of clean frames. When a foreground query encounters a cache miss and finds that the victim frame selected by the clock sweep is dirty, the user thread is FORCED to synchronously flush that 8KB page to disk before it can read its data. This causes catastrophic p99 latency spikes (jumping from 2ms to 5,000ms+). Tuning checkpoint_completion_target = 0.9 and monitoring bgwriter_lru_maxpages is critical.',
        vi: 'Cú sốc Checkpoint & Nghẽn Xả Đĩa Đồng bộ (Synchronous Flush Stalls): Khi cường độ ghi dữ liệu sinh trang bẩn nhanh hơn tốc độ xả ngầm của background writer, buffer pool sẽ cạn kiệt frame sạch. Khi đó, một câu lệnh người dùng gặp cache miss và phát hiện frame nạn nhân bị dính cờ DIRTY, luồng người dùng BẮT BUỘC phải dừng lại tự xả trang bẩn đó xuống đĩa trước khi đọc được dữ liệu. Hiện tượng này làm sụp đổ độ trễ p99 (từ 2ms vọt lên hơn 5.000ms). Cần tinh chỉnh checkpoint_completion_target = 0.9 và giám sát thông số bgwriter_lru_maxpages.'
      },
      {
        en: 'Buffer Pin & Latch Contention on Hot Sequence Pages: When thousands of concurrent threads insert records into an auto-incrementing table (e.g. INSERT INTO orders with an ID sequence), all threads target the exact same right-most leaf page in the B+ Tree. Even though transactional row locks are separate, threads collide on the exclusive buffer frame latch. This manifests as severe CPU spinlock saturation and HikariCP connection pool timeout cascades. Mitigation: Hash partitioning the primary key or using UUIDv7 / reverse sequences.',
        vi: 'Tranh chấp Chốt Khung Nhớ (Buffer Pin & Latch Contention) trên Trang Nóng: Khi hàng nghìn luồng đồng thời chèn dữ liệu vào bảng có khóa chính tự tăng (auto-increment sequence), toàn bộ các luồng đều nhắm vào đúng trang lá tận cùng bên phải của B+ Tree. Dù khóa logic từng dòng là riêng biệt, các luồng vẫn đâm sầm vào nhau để tranh chấp độc quyền latch bộ nhớ của frame đó. Hiện tượng này gây nghẽn spinlock CPU và làm sập connection pool HikariCP. Giải pháp: Phân vùng bảng (Hash partitioning) hoặc dùng UUIDv7 / reverse key.'
      }
    ]
  },

  pageLayout: {
    title: {
      en: 'Buffer Pool Architecture: Frame Table, Hash Map & Lock Striping',
      vi: 'Kiến trúc Buffer Pool: Bảng Khung nhớ (Frames), Bảng băm Page Table & Khóa phân dải'
    },
    description: {
      en: 'The Buffer Pool consists of an array of contiguous memory frames mapped via a hash table with lock striping. Each descriptor maintains atomic state: page_id, pin_count (active readers/writers), dirty flag, PageLSN, and usage_count.',
      vi: 'Buffer Pool gồm mảng các khung nhớ RAM liên tục được ánh xạ qua bảng băm với cơ chế khóa phân dải (lock striping). Mỗi descriptor quản lý trạng thái nguyên tử: page_id, số luồng đang giữ (pin_count), cờ dirty, PageLSN và điểm sử dụng (usage_count).'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| BUFFER POOL MANAGER (Shared Memory Architecture - e.g. 64 GB DRAM Pool)                            |
+----------------------------------------------------------------------------------------------------+
| PAGE TABLE HASH MAP (Striped across 16 Bucket Latches to eliminate global mutex contention):        |
|  [ Hash(Space=0, Page=42)  -> Frame #2 ]  |  [ Hash(Space=0, Page=105) -> Frame #0 ]               |
|  [ Hash(Space=1, Page=999) -> Frame #1 ]  |  [ Hash(Space=0, Page=714) -> Frame #3 ]               |
+----------------------------------------------------------------------------------------------------+
| BUFFER FRAME DESCRIPTOR TABLE (Array of Control Blocks in RAM):                                    |
| +---------+---------+-----------+----------+---------------+----------------+--------------------+ |
| | FrameID | PageID  | Pin Count | Is Dirty | Page LSN      | Usage (0-5)    | Eviction Status    | |
| +---------+---------+-----------+----------+---------------+----------------+--------------------+ |
| | Frame#0 | Page#105| Pin = 0   | Dirty=0  | 0/1A490F0     | usage = 4      | Protected (Warm)   | |
| | Frame#1 | Page#999| Pin = 3   | Dirty=1  | 0/1A52B10     | usage = 5      | PINNED (Querying)  | |
| | Frame#2 | Page#42 | Pin = 0   | Dirty=1  | 0/1A50000     | usage = 0 <--- | [CLOCK HAND VICTIM]| |
| | Frame#3 | Page#714| Pin = 0   | Dirty=0  | 0/19F88C0     | usage = 1      | Second Chance      | |
| +---------+---------+-----------+----------+---------------+----------------+--------------------+ |
+----------------------------------------------------------------------------------------------------+
| PHYSICAL MEMORY PAGES (Contiguous 8KB / 16KB blocks in RAM where SQL queries read/write directly)  |
+----------------------------------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'pin_count', size: 'Atomic Int (4B)', description: { en: 'Active readers/writers holding this frame. Frame CANNOT be evicted while pin_count > 0.', vi: 'Số lượng câu lệnh đang đọc/ghi frame này. Không thể hoán đổi/giải phóng chừng nào pin_count > 0.' } },
      { name: 'is_dirty', size: 'Atomic Bool (1B)', description: { en: 'Indicates page was modified in RAM and disk image is stale. Must be flushed before frame reuse.', vi: 'Báo hiệu trang đã bị sửa đổi trong RAM. Phải được xả xuống đĩa trước khi tái sử dụng frame.' } },
      { name: 'page_lsn', size: '64-bit Int (8B)', description: { en: 'Log Sequence Number of latest WAL update. WAL record must be synced to disk BEFORE this page can flush.', vi: 'Mã số LSN của thao tác WAL gần nhất. Nhật ký WAL phải được ghi đĩa TRƯỚC KHI trang này được xả.' } },
      { name: 'usage_count / ref_bit', size: 'Atomic Int / Bit', description: { en: 'Incremented on access (capped at 5 in Postgres); decremented by Clock hand sweeps.', vi: 'Tăng lên khi được truy cập (tối đa 5 ở Postgres); bị trừ dần mỗi khi kim đồng hồ quét qua.' } }
    ]
  },

  steps: [
    {
      id: 'lookup',
      title: { en: '1. Striped Hash Table Lookup & Page Pinning', vi: '1. Tra cứu Bảng Băm Phân dải và Ghim Khung Nhớ (Pin)' },
      phase: 'CACHE_LOOKUP',
      description: {
        en: 'The query engine hashes (SpaceID, PageNumber) into the Page Table under a shared bucket latch. If found (Cache Hit), the frame pin_count is atomically incremented (preventing eviction) and usage_count is increased. The page read-latch is acquired.',
        vi: 'Engine băm cặp (SpaceID, PageNumber) vào Page Table dưới chốt chia sẻ (shared bucket latch). Nếu tìm thấy (Cache Hit), pin_count được tăng nguyên tử (ngăn việc bị trục xuất) và usage_count được cộng điểm. Chốt đọc (read-latch) của trang được kích hoạt.'
      },
      diskIoBehavior: {
        en: 'Zero physical disk I/O. Served directly from DRAM in ~50-100 nanoseconds.',
        vi: 'Không có bất kỳ I/O đĩa vật lý nào. Phục vụ trực tiếp từ RAM trong ~50-100 nanosecond.'
      },
      javaCodeLineMatch: 'Frame frame = pageTable.get(pageId)'
    },
    {
      id: 'evict',
      title: { en: '2. Clock Hand Sweeper Selects Victim Frame', vi: '2. Kim Đồng Hồ Quét Tìm Khung Nhớ Nạn Nhân (Victim)' },
      phase: 'EVICTION_SWEEP',
      description: {
        en: 'On a Cache Miss when no free frames remain, the Clock Hand sweeps circularly through frame descriptors. Frames with pin_count > 0 are skipped. Frames with usage_count > 0 are decremented (giving a second chance). The first frame with pin_count == 0 and usage_count == 0 is selected as victim.',
        vi: 'Khi Cache Miss và không còn frame trống, kim đồng hồ quét vòng tròn qua các frame descriptor. Frame có pin_count > 0 được bỏ qua. Frame có usage_count > 0 bị trừ 1 điểm (trao cơ hội thứ hai). Frame đầu tiên có pin_count == 0 và usage_count == 0 sẽ được chọn làm nạn nhân.'
      },
      diskIoBehavior: {
        en: 'Pure in-memory CPU cache-friendly descriptor array traversal. Zero disk reads.',
        vi: 'Duyệt mảng descriptor hoàn toàn trong RAM cực nhanh, thân thiện với CPU cache. Không đọc đĩa.'
      },
      javaCodeLineMatch: 'Frame victim = clockReplacer.findVictim()'
    },
    {
      id: 'flush-dirty',
      title: { en: '3. WAL Invariant Enforcement & Disk Exchange', vi: '3. Thực thi Giao thức WAL và Hoán đổi Block Đĩa' },
      phase: 'DISK_EXCHANGE',
      description: {
        en: 'If the victim frame is DIRTY, the engine verifies the WAL invariant: if page_lsn > flushed_wal_lsn, the WAL buffer is immediately fsynced to disk first! Then the dirty 8KB page is flushed to data storage. The old page mapping is purged from the Page Table, and the new disk block is loaded into the freed frame.',
        vi: 'Nếu frame nạn nhân bị dính cờ DIRTY, engine kiểm tra luật WAL: nếu page_lsn > flushed_wal_lsn, buffer WAL lập tức được fsync xuống đĩa trước! Sau đó trang bẩn 8KB mới được xả vào file dữ liệu. Ánh xạ cũ bị xóa khỏi Page Table và block đĩa mới được nạp vào frame vừa giải phóng.'
      },
      diskIoBehavior: {
        en: '1 sequential WAL fsync (if lagging) + 1 page write (if dirty) + 1 synchronous disk block read.',
        vi: '1 lần fsync WAL tuần tự (nếu chưa kịp ghi) + 1 lần ghi trang bẩn + 1 lần đọc đĩa trang mới.'
      },
      javaCodeLineMatch: 'diskManager.writePage(victim.pageId)'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Shared Buffers',
      implementationName: 'Clock-Sweep Page Replacement with Usage Counter (0-5)',
      keyMechanism: {
        en: 'Allocates a single contiguous shared memory array of BufferDescriptors. The clock hand sweeps checking `usage_count` (0 to 5). B+ tree index roots and system catalogs easily reach usage_count=5 and require 5 consecutive clock sweeps without access before eviction.',
        vi: 'Cấp phát mảng bộ nhớ chia sẻ liên tục các BufferDescriptors. Kim đồng hồ quét kiểm tra `usage_count` (từ 0 đến 5). Các trang gốc B+ tree và từ điển hệ thống dễ dàng đạt điểm 5 và phải qua 5 vòng quét liên tiếp không có truy cập mới bị giải phóng.'
      },
      defaultTuningConfig: 'shared_buffers = 25% of RAM, bgwriter_lru_maxpages = 100, checkpoint_completion_target = 0.9',
      architectureNote: {
        en: 'PostgreSQL relies on dual caching: Shared Buffers in user space + OS Page Cache in kernel space. Background Writer (bgwriter) proactively frees clean pages to protect user queries from dirty flushes.',
        vi: 'PostgreSQL dựa trên cơ chế cache kép: Shared Buffers ở user space + OS Page Cache ở kernel space. Tiến trình ngầm bgwriter chủ động xả trang để người dùng luôn có sẵn frame sạch.'
      }
    },
    {
      engine: 'MySQL InnoDB Buffer Pool',
      implementationName: 'Midpoint Insertion LRU with Sub-lists (Young / Old)',
      keyMechanism: {
        en: 'Partitions the LRU list into Young (5/8 or ~63%) and Old (3/8 or ~37%) sub-lists. Newly read pages are inserted at the midpoint (head of Old list). The parameter innodb_old_blocks_time (default 1000ms) mandates that a page must stay in the Old list for 1 second before a second access can promote it to the Young list, neutralizing scan pollution.',
        vi: 'Chia danh sách LRU làm 2 vùng: Young (5/8 hay ~63%) và Old (3/8 hay ~37%). Trang mới nạp được đưa vào điểm giữa (đầu danh sách Old). Tham số innodb_old_blocks_time (mặc định 1000ms) bắt buộc trang phải nằm ở vùng Old tối thiểu 1 giây mới được đẩy lên vùng Young khi có truy cập lại, giúp vô hiệu hóa hoàn toàn ô nhiễm quét bảng.'
      },
      defaultTuningConfig: 'innodb_buffer_pool_size = 70-80% of RAM, innodb_buffer_pool_instances = 8, innodb_old_blocks_time = 1000',
      architectureNote: {
        en: 'Uses Direct I/O (innodb_flush_method = O_DIRECT) to eliminate OS page cache double buffering entirely. Shards the pool across multiple instances to eliminate global mutex contention on multicore servers.',
        vi: 'Sử dụng Direct I/O (innodb_flush_method = O_DIRECT) để triệt tiêu hoàn toàn hiện tượng nhân đôi bộ đệm của OS. Phân mảnh bộ đệm thành nhiều instance độc lập để loại bỏ tranh chấp mutex trên CPU nhiều core.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai SGA Buffer Cache',
      implementationName: 'Touch Count Algorithm & Multiple Buffer Pools (KEEP / RECYCLE / DEFAULT)',
      keyMechanism: {
        en: 'Oracle uses a Touch Count (TCH) algorithm embedded in buffer headers protected by Cache Buffer Chains (CBC) latches. It partitions the buffer cache into DEFAULT, KEEP (for permanently caching lookup tables), and RECYCLE (for large tables that should be aged out quickly). Large scans bypass the cache via Direct Path Read into PGA.',
        vi: 'Oracle sử dụng giải thuật Touch Count (TCH) được nhúng trong buffer header và bảo vệ bởi CBC latches. Hệ thống phân chia bộ đệm thành 3 vùng: DEFAULT, KEEP (ghim các bảng danh mục nhỏ vĩnh viễn trong RAM) và RECYCLE (cho bảng phân tích lớn để xả ngay sau khi đọc). Các truy vấn quét bảng khổng lồ sẽ bypass cache và đọc thẳng vào PGA qua Direct Path Read.'
      },
      defaultTuningConfig: "ALTER SYSTEM SET DB_CACHE_SIZE = 32G SCOPE=BOTH; ALTER SYSTEM SET DB_KEEP_CACHE_SIZE = 4G SCOPE=BOTH;",
      architectureNote: {
        en: 'Direct Path Read eliminates buffer cache churn and latch contention during massive batch reporting or ETL jobs.',
        vi: 'Direct Path Read loại bỏ hoàn toàn ô nhiễm buffer cache và tranh chấp latch khi chạy báo cáo lớn hoặc các tiến trình ETL ban đêm.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Nanosecond latency for hot database queries (1,000x faster than NVMe SSDs, 100,000x faster than HDDs).', vi: 'Độ trễ nano giây cho truy vấn nóng (nhanh hơn 1.000 lần so với SSD NVMe, nhanh hơn 100.000 lần so với HDD).' },
      { en: 'Absolute control over dirty page flushing order, guaranteeing ACID durability and WAL protocol compliance.', vi: 'Kiểm soát tuyệt đối thứ tự xả trang bẩn, đảm bảo tính bền vững ACID và tuân thủ nghiêm ngặt giao thức WAL.' },
      { en: 'Write Coalescing: Hundreds of concurrent updates to rows on the same page in RAM are collapsed into a single disk write.', vi: 'Gộp ghi (Write Coalescing): Hàng trăm lần sửa các dòng trên cùng một trang trong RAM được gộp thành 1 lần ghi đĩa duy nhất.' }
    ],
    cons: [
      { en: 'Cold Cache Penalty: After database restart, the buffer pool is empty; query latency spikes until the working set warms up.', vi: 'Hình phạt Bộ nhớ Nguội: Sau khi khởi động lại CSDL, cache trống rỗng; độ trễ truy vấn tăng vọt cho đến khi dữ liệu nóng được nạp lại.' },
      { en: 'Risk of double buffering and memory exhaustion if OS page caching is not bypassed with O_DIRECT.', vi: 'Nguy cơ nhân đôi bộ đệm và cạn kiệt RAM hệ thống nếu không vượt mặt OS cache bằng cờ O_DIRECT.' },
      { en: 'Complex latch contention and background writer tuning required under high-concurrency write workloads.', vi: 'Đòi hỏi tinh chỉnh phức tạp về tranh chấp chốt bộ nhớ (latches) và tiến trình xả ngầm dưới tải ghi lớn.' }
    ],
    writeAmplification: {
      en: 'Extremely Low: In-memory dirty page buffering absorbs high-frequency updates, flushing to non-volatile disk only on checkpoints or eviction.',
      vi: 'Cực kỳ thấp: Bộ đệm trang bẩn trong RAM hấp thụ toàn bộ các lần update tần suất cao, chỉ xả xuống đĩa vật lý định kỳ hoặc khi hoán đổi.'
    },
    recoveryGuarantee: {
      en: 'WAL-Before-Flush Protocol guarantees that unwritten dirty pages in DRAM can be 100% reconstructed from the Write-Ahead Log during crash recovery.',
      vi: 'Giao thức WAL-trước-khi-xả đảm bảo mọi trang bẩn chưa kịp ghi xuống đĩa sẽ được tái thiết 100% từ nhật ký Write-Ahead Log khi phục hồi sau sự cố.'
    }
  },

  springBootCode: `# ===================================================================
# Spring Boot 3.x Production application.yml - HikariCP & Buffer Pool
# Tuning connection pool, statement cache, and batch fetch size
# ===================================================================
spring:
  datasource:
    url: jdbc:postgresql://db-primary.production.internal:5432/orders_db
    hikari:
      # Optimal pool size: (CPU_cores * 2) + effective_spindle_count
      # Avoid oversized pools that cause massive buffer latch contention!
      maximum-pool-size: 32
      minimum-idle: 10
      idle-timeout: 300000
      connection-timeout: 20000
      data-source-properties:
        # PreparedStatement cache avoids SQL parsing and execution plan churn in DB memory
        cachePrepStmts: true
        prepStmtCacheSize: 250
        prepStmtCacheSqlLimit: 2048
        useServerPrepStmts: true
        # PostgreSQL specific: re-use query plans after 5 executions
        prepareThreshold: 5
  jpa:
    open-in-view: false
    properties:
      hibernate:
        # Batch fetching prevents N+1 queries from thrashing the Buffer Pool with random reads
        default_batch_fetch_size: 50
        jdbc:
          batch_size: 50
          order_inserts: true
          order_updates: true

---
// ===================================================================
// Enterprise Java 21 Service: Streaming Query with Cursor
// Prevents Out-Of-Memory and protects Buffer Pool from scan pollution
// ===================================================================
package com.enterprise.order.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.QueryHint;
import org.hibernate.jpa.HibernateHints;
import java.util.stream.Stream;

@Service
public class OrderReportingService {

    private final EntityManager entityManager;

    public OrderReportingService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * Streams 5,000,000 historical records using a forward-only database cursor.
     * Prevents loading millions of objects into JVM heap AND prevents massive
     * sequential table scans from wiping out hot B+ Tree pages in the Buffer Pool!
     */
    @Transactional(readOnly = true)
    public void streamLargeFinancialAuditReport() {
        try (Stream<OrderSummaryRecord> stream = entityManager
                .createQuery(
                    "SELECT new com.enterprise.order.service.OrderSummaryRecord(o.id, o.amount, o.status) " +
                    "FROM Order o WHERE o.createdAt >= :cutoffDate",
                    OrderSummaryRecord.class
                )
                .setParameter("cutoffDate", java.time.Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS))
                // CRITICAL: Fetch size tells JDBC driver to stream rows in batches of 500
                .setHint(HibernateHints.HINT_FETCH_SIZE, 500)
                .setHint(HibernateHints.HINT_READ_ONLY, true)
                .getResultStream()) {

            stream.forEach(record -> {
                // Process each order item sequentially without blowing up JVM heap or DB RAM
                processAuditRecord(record);
            });
        }
    }

    private void processAuditRecord(OrderSummaryRecord record) {
        // Business audit processing
    }
}

record OrderSummaryRecord(Long id, java.math.BigDecimal amount, String status) {}`,

  sqlQueries: `-- ===================================================================
-- 1. Inspect Buffer Pool (Shared Buffers) Cache Hit Ratio in PostgreSQL
-- Target: buffer_hit_ratio_percent should be > 99.0% on OLTP workloads!
-- ===================================================================
SELECT 
    sum(heap_blks_read) AS heap_read_from_disk,
    sum(heap_blks_hit)  AS heap_hit_in_ram,
    round(
        sum(heap_blks_hit)::numeric / 
        nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100.0, 
        3
    ) AS buffer_hit_ratio_percent
FROM pg_statio_user_tables;

-- ===================================================================
-- 2. Inspect Exact Memory Residency using pg_buffercache extension
-- Identifies which tables and indexes are consuming the Buffer Pool
-- ===================================================================
CREATE EXTENSION IF NOT EXISTS pg_buffercache;

SELECT 
    c.relname AS relation_name,
    c.relkind AS type, -- 'r' = table, 'i' = index
    pg_size_pretty(count(*) * 8192) AS buffered_ram_size,
    round(100.0 * count(*) / (SELECT setting FROM pg_settings WHERE name='shared_buffers')::integer, 2) AS buffer_percent,
    round(avg(b.usagecount), 2) AS avg_clock_usage_count,
    sum(CASE WHEN b.isdirty THEN 1 ELSE 0 END) AS dirty_page_count
FROM pg_buffercache b
JOIN pg_class c ON b.relfilenode = pg_relation_filenode(c.oid)
JOIN pg_database d ON (b.reldatabase = d.oid AND d.datname = current_database())
GROUP BY c.relname, c.relkind
ORDER BY count(*) DESC
LIMIT 15;

-- ===================================================================
-- 3. MySQL InnoDB Buffer Pool Hit Rate & Dirty Page Inspection
-- ===================================================================
SHOW ENGINE INNODB STATUS\\G

-- Querying Information Schema for InnoDB Buffer Pool breakdown:
SELECT 
    POOL_ID,
    FREE_BUFFERS,
    DATABASE_PAGES,
    DIRTY_PAGES,
    ROUND(HIT_RATE / 1000 * 100, 2) AS hit_rate_percent
FROM information_schema.INNODB_BUFFER_POOL_STATS;`,

  javaCode: `package com.database.internals.memory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Pure Java 21 Educational Implementation of a Database Buffer Pool Manager
 * Demonstrates:
 *  1. Frame Descriptor array with atomic pin_count, dirty_bit, and page_lsn
 *  2. Clock Eviction Algorithm (Second Chance with usage counters 0-5)
 *  3. WAL-Before-Flush Protocol Invariant enforcement
 *  4. Lock-striped Page Table hash map preventing global mutex bottleneck
 */
public class BufferPoolManager {
    public static final int BUFFER_POOL_CAPACITY = 8; // Number of frames in RAM
    public static final int MAX_USAGE_COUNT = 5;      // PostgreSQL style usage counter

    public static class FrameDescriptor {
        public final int frameId;
        public int pageId = -1;
        public final AtomicInteger pinCount = new AtomicInteger(0);
        public volatile boolean isDirty = false;
        public volatile long pageLsn = 0;
        public final AtomicInteger usageCount = new AtomicInteger(0);
        public final ReentrantReadWriteLock frameLatch = new ReentrantReadWriteLock();

        public FrameDescriptor(int frameId) {
            this.frameId = frameId;
        }
    }

    private final FrameDescriptor[] frameTable = new FrameDescriptor[BUFFER_POOL_CAPACITY];
    private final Map<Integer, FrameDescriptor> pageTable = new ConcurrentHashMap<>();
    private final AtomicInteger clockHand = new AtomicInteger(0);
    private volatile long flushedWalLsn = 1000; // Simulated disk WAL position

    public BufferPoolManager() {
        for (int i = 0; i < BUFFER_POOL_CAPACITY; i++) {
            frameTable[i] = new FrameDescriptor(i);
        }
    }

    /**
     * Step 1: Tra cứu Page Table & Ghim trang (Pin)
     */
    public FrameDescriptor fetchPage(int pageId) {
        // Fast path: Cache Hit in Page Table
        FrameDescriptor frame = pageTable.get(pageId);
        if (frame != null) {
            frame.pinCount.incrementAndGet();
            frame.usageCount.updateAndGet(c -> Math.min(MAX_USAGE_COUNT, c + 1));
            return frame; // Served from DRAM (~50-100ns)
        }

        // Slow path: Cache Miss -> Must find victim frame using Clock Sweep
        synchronized (this) {
            // Double-check under lock
            frame = pageTable.get(pageId);
            if (frame != null) {
                frame.pinCount.incrementAndGet();
                return frame;
            }

            FrameDescriptor victim = findVictimWithClockSweep();
            if (victim == null) {
                throw new IllegalStateException("Buffer Pool Exhausted: All frames are currently pinned!");
            }

            // Step 3: Check WAL Invariant before flushing dirty page to disk!
            if (victim.isDirty && victim.pageId != -1) {
                if (victim.pageLsn > flushedWalLsn) {
                    // WAL PROTOCOL ENFORCEMENT: Force WAL sync first!
                    flushWalLogToDisk(victim.pageLsn);
                }
                flushDataPageToDisk(victim.pageId);
                victim.isDirty = false;
            }

            // Evict old page mapping
            if (victim.pageId != -1) {
                pageTable.remove(victim.pageId);
            }

            // Load new page into victim frame
            victim.pageId = pageId;
            victim.pinCount.set(1);
            victim.usageCount.set(1);
            victim.isDirty = false;
            pageTable.put(pageId, victim);

            return victim;
        }
    }

    /**
     * Step 2: Giải thuật Quét Kim Đồng Hồ (Clock Sweep Second Chance)
     */
    private FrameDescriptor findVictimWithClockSweep() {
        int sweeps = 0;
        int maxSweeps = BUFFER_POOL_CAPACITY * (MAX_USAGE_COUNT + 1);

        while (sweeps < maxSweeps) {
            int currentIdx = clockHand.getAndUpdate(i -> (i + 1) % BUFFER_POOL_CAPACITY);
            FrameDescriptor candidate = frameTable[currentIdx];

            // Pinned pages are actively used by running queries; CANNOT evict!
            if (candidate.pinCount.get() > 0) {
                sweeps++;
                continue;
            }

            // Unpinned: Check usage counter (Second Chance mechanism)
            if (candidate.usageCount.get() > 0) {
                candidate.usageCount.decrementAndGet();
                sweeps++;
            } else {
                return candidate; // Found victim with pinCount == 0 and usageCount == 0!
            }
        }
        return null;
    }

    public void unpinPage(int pageId, boolean markDirty, long updateLsn) {
        FrameDescriptor frame = pageTable.get(pageId);
        if (frame != null) {
            if (markDirty) {
                frame.isDirty = true;
                frame.pageLsn = Math.max(frame.pageLsn, updateLsn);
            }
            frame.pinCount.updateAndGet(p -> Math.max(0, p - 1));
        }
    }

    private void flushWalLogToDisk(long upToLsn) {
        System.out.println("[WAL PROTOCOL] Syncing WAL to disk up to LSN: " + upToLsn);
        this.flushedWalLsn = upToLsn;
    }

    private void flushDataPageToDisk(int pageId) {
        System.out.println("[DIRECT I/O] Flushing 8KB dirty data page #" + pageId + " to durable block storage.");
    }
}`,

  productionProblemCase: {
    title: {
      en: 'Sequential Scan Buffer Thrashing from Midnight Reporting Batches',
      vi: 'Ô Nhiễm Bộ Đệm Khi Xuất Báo Cáo Batch Đêm (Sequential Scan Flooding & OLTP Cache Thrashing)'
    },
    businessContext: {
      en: 'A high-throughput e-commerce platform processes 50,000 OLTP order requests/sec during daytime with sub-5ms P99 latency. At midnight, an automated analytics batch job executes a massive financial reconciliation query ("SELECT * FROM orders WHERE created_at BETWEEN ...") scanning 200 million rows.',
      vi: 'Hệ thống thương mại điện tử xử lý 50.000 giao dịch OLTP đặt hàng mỗi giây vào ban ngày với độ trễ P99 < 5ms. Đúng nửa đêm, hệ thống chạy tiến trình batch đối soát tài chính tự động ("SELECT * FROM orders WHERE created_at BETWEEN ...") quét toàn bộ 200 triệu dòng.'
    },
    problemDescription: {
      en: 'Under naive LRU cache management, scanning 200 million rows reads gigabytes of cold disk blocks into memory. These single-use analytical pages enter at the head of the LRU cache, aggressively evicting the entire active working set—including customer profile tables, product catalog caches, and root nodes of B+ Tree indexes. The next morning, production OLTP requests suffer a 100% cache miss rate, driving NVMe SSD I/O saturation to 100% and causing cascading HTTP 504 timeouts across the Spring Boot backend.',
      vi: 'Với thuật toán LRU ngây thơ, việc quét 200 triệu dòng kéo hàng chục gigabyte trang đĩa lạnh vào RAM. Các trang báo cáo chỉ đọc đúng 1 lần này chiếm trọn đỉnh danh sách LRU, tống khứ sạch bách dữ liệu nóng của hệ thống—gồm bảng thông tin khách hàng, giỏ hàng, và các trang gốc của cây chỉ mục B+ Tree. Sáng hôm sau, các truy vấn mua hàng bị Cache Miss 100%, đẩy ổ cứng SSD NVMe nghẽn cứng 100% I/O wait và làm sập dây chuyền toàn bộ cụm microservice Spring Boot.'
    },
    whyNaiveFails: {
      en: 'Standard single-tier LRU assumes all page accesses follow temporal locality. Because sequential table scans touch each page once, standard LRU treats them as the "most recently used", overwriting pages that have been hit thousands of times over months. Setting buffer pool sizes blindly without scan-resistant time-window guards causes catastrophic performance cliff drops.',
      vi: 'Thuật toán LRU đơn cấp giả định mọi truy cập dữ liệu đều có tính cục bộ thời gian (temporal locality). Khi câu lệnh quét bảng đi qua từng block, LRU coi chúng là "dữ liệu mới nhất" và đẩy các trang đã được truy cập hàng triệu lần trong nhiều tháng ra ngoài. Việc tăng RAM đơn thuần mà không có cơ chế chặn cửa thời gian (time-window guard) sẽ chỉ làm chậm thời điểm xảy ra sự cố chứ không ngăn được thảm họa sập hệ thống.'
    },
    coreSolution: {
      en: '1. Midpoint Insertion LRU with Time-Window Guard: Partition the Buffer Pool into a Young Sublist (5/8 = 63%) and an Old Sublist (3/8 = 37%). New pages fetched from disk enter exclusively at the midpoint (head of the Old sublist).\n2. Time-Window Guard (innodb_old_blocks_time = 1000ms): A page in the Old sublist must be accessed repeatedly AFTER 1,000ms to qualify for promotion to the Young sublist. Since sequential scans read pages within a few milliseconds and never touch them again, scan pages remain trapped in the Old sublist and are evicted immediately, leaving the 63% Young sublist 100% intact!\n3. Buffer Pool Sharding (innodb_buffer_pool_instances = 16): Disperses mutex contention across independent memory pools, allowing simultaneous OLTP writes and analytical batch reads without spinlock convoying.',
      vi: '1. Midpoint Insertion LRU với Hàng rào Thời gian: Chia tách Buffer Pool thành 2 danh sách con: Vùng Trẻ Young Sublist (5/8 = 63%) và Vùng Già Old Sublist (3/8 = 37%). Mọi trang mới nạp từ đĩa CHỈ ĐƯỢC PHÉP vào điểm giữa (đầu danh sách Old).\n2. Hàng rào Giữ chân Thời gian (innodb_old_blocks_time = 1000ms): Trang trong Old sublist phải được truy cập lặp lại SAU 1.000ms mới được phép thăng hạng lên Young sublist. Vì truy vấn quét bảng chỉ đọc lướt qua mỗi trang trong vài mili giây rồi bỏ qua, các trang báo cáo này vĩnh viễn bị giam ở Old sublist và bị tống khứ ngay lập tức, bảo toàn trọn vẹn 100% dữ liệu nóng trong 63% Vùng Trẻ!\n3. Phân mảnh Buffer Pool (innodb_buffer_pool_instances = 16): Phân tán xung đột khóa Mutex sang 16 pool độc lập, giúp xử lý đồng thời cả giao dịch mua bán và tiến trình đọc báo cáo mà không bị nghẽn CPU spinlock.'
    },
    productionCode: `// Spring Boot 3.x Production Database Configuration with Scan-Resistant Settings
@Configuration
public class ProductionDatabaseOptimizationConfig {

    @Bean
    public DataSource initializeOptimizedDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://primary-cluster:3306/ecommerce_db?cachePrepStmts=true&prepStmtCacheSize=500&prepStmtCacheSqlLimit=2048");
        config.setUsername(System.getenv("DB_USER"));
        config.setPassword(System.getenv("DB_PASS"));
        
        // Critical: Set session-level read-only replica connection for midnight analytics
        config.addDataSourceProperty("sessionVariables", 
            "innodb_old_blocks_time=1000," +        // Protects Young LRU from sequential scans
            "innodb_old_blocks_pct=37," +          // 37% reserved for transient Old pages
            "innodb_buffer_pool_dump_at_shutdown=1," + // Warmup fast recovery on restarts
            "innodb_buffer_pool_load_at_startup=1");

        config.setMaximumPoolSize(64);
        config.setMinimumIdle(16);
        config.setConnectionTimeout(3000); // 3s fail-fast to prevent cascading thread pool starvation
        return new HikariDataSource(config);
    }
}`,
    architectureImpact: {
      en: 'Buffer Pool Hit Ratio maintained at 99.4% continuously during the 200M row analytics scan. API P99 latency stayed flat at 3.8ms with zero thread starvation. CPU I/O wait dropped from 98% saturation down to 1.2%.',
      vi: 'Tỷ lệ Cache Hit của Buffer Pool duy trì ổn định ở mức 99.4% ngay cả khi đang quét 200 triệu dòng báo cáo. Độ trễ P99 của API đặt hàng giữ phẳng ở mức 3.8ms, hoàn toàn không có hiện tượng cạn kiệt luồng. CPU I/O wait giảm từ 98% kịch khung xuống chỉ còn 1.2%.'
    }
  }
};
