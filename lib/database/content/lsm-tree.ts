import type { DatabaseTopic } from '../types';

export const lsmTree: DatabaseTopic = {
  id: 'lsm-tree',
  category: 'storage-engines',
  name: 'LSM-Tree Storage & SSTable Compaction',
  tagline: {
    en: 'Write-optimized storage engine: sequential writes to RAM MemTable, immutable SSTables, and background compaction.',
    vi: 'Động cơ tối ưu hóa cho tác vụ ghi: ghi tuần tự vào MemTable trong RAM, các SSTable bất biến và nén đa tầng nền.'
  },
  difficulty: 2,
  order: 3,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      en: 'B+ Trees perform in-place updates: modifying a random record requires writing a full 16KB page to a random disk sector. On write-heavy workloads (ingestion, logging, time-series), random disk write throughput is 10x-100x slower than sequential streaming due to drive head seeks and flash block erase cycles.',
      vi: 'Cây B+ Tree cập nhật tại chỗ (in-place update): sửa 1 bản ghi ngẫu nhiên đòi hỏi ghi lại cả trang 16KB vào một sector ngẫu nhiên trên ổ đĩa. Với hệ thống ghi dữ liệu khổng lồ, tốc độ ghi ngẫu nhiên chậm hơn từ 10 đến 100 lần so với ghi tuần tự do chu kỳ tìm rãnh từ và xóa khối flash SSD.'
    },
    hardwareConstraint: {
      en: 'Sequential I/O is physically optimal for both HDDs (no head movement) and NAND Flash NVMe (no read-modify-erase wear cycles). Storage engines must convert all writes into append-only sequential streams.',
      vi: 'Ghi tuần tự là tối ưu vật lý cho cả HDD (không di chuyển đầu từ) lẫn SSD NVMe (không bị suy giảm tuổi thọ do chu kỳ đọc-sửa-xóa khối flash). Storage engine cần chuyển toàn bộ các thao tác ghi ngẫu nhiên thành luồng ghi nối đuôi tuần tự (append-only).'
    },
    fundamentalSolution: {
      en: 'The Log-Structured Merge-tree (LSM-Tree) buffers all writes in a fast in-memory SkipList (MemTable) backed by a Write-Ahead Log. When the MemTable fills up, it is flushed to disk as an immutable Sorted String Table (SSTable). Background compaction merges sorted runs like external merge-sort.',
      vi: 'LSM-Tree đệm toàn bộ thao tác ghi vào bộ nhớ RAM bằng cấu trúc SkipList (MemTable) có nhật ký WAL bảo vệ. Khi MemTable đầy, nó được xả xuống đĩa thành một file SSTable có thứ tự bất biến. Quá trình Compaction chạy ngầm định kỳ trộn các file này tương tự thuật toán external merge-sort.'
    },
    math: {
      formula: 'T_{\\text{write}} = T_{\\text{WAL}} + T_{\\text{MemTableInsert}}, \\quad T_{\\text{read}} \\approx T_{\\text{MemTable}} + \\sum_{i=1}^{L} T_{\\text{SSTable}_i}',
      description: {
        en: 'MemTable insertion is NOT strictly O(1): standard SkipList MemTables require O(log N) expected search and insert time to maintain key order. The generalized read model searches MemTable then probes down L levels (mitigated by Bloom filters, block caches, and sparse index blocks). LSM engines must constantly balance the RUM trade-offs: Write Amplification (WA), Read Amplification (RA), Space Amplification (SA), compaction throughput, and tombstone propagation latency.',
        vi: 'Thao tác ghi vào MemTable KHÔNG MẶC NHIÊN là O(1): cấu trúc SkipList phổ biến đòi hỏi thời gian tìm kiếm và chèn O(log N) kỳ vọng để duy trì thứ tự khóa. Mô hình đọc khái quát quét MemTable rồi lần lượt kiểm tra L tầng SSTable (được giảm tải nhờ Bloom filter, block cache và index block thưa). LSM-Tree bắt buộc phải cân đối các đại lượng cốt lõi: Khuếch đại Ghi (WA), Khuếch đại Đọc (RA), Khuếch đại Không gian (SA), thông lượng nén (Compaction throughput) và độ trễ lan truyền bản ghi xóa (Tombstone propagation).'
      },
      timeComplexity: 'Write: O(log N_mem) expected for SkipList + sequential WAL append; Read: O(log N_mem) + O(k * log(Block_keys)) filtered by Bloom filters',
      spaceComplexity: 'Space Amplification (SA) = Total_Disk_Space / Live_Data_Size (typically 1.1 - 2.0 depending on compaction strategy and tombstone backlog)',
      ioCostFormula: 'Write Cost = 1 Sequential Append (WAL) + WA × Compaction Flush I/O; Point Read Cost = P(false_positive) × L × Block_Read_IO'
    }
  },

  pageLayout: {
    title: {
      en: 'SSTable Physical File Format (RocksDB BlockBasedTable standard)',
      vi: 'Cấu trúc vật lý file SSTable (Chuẩn RocksDB BlockBasedTable)'
    },
    description: {
      en: 'SSTables are immutable files on disk. Keys are ordered sorted blocks. A Bloom Filter at the end allows the engine to skip the entire file if a key is absent with 99% probability.',
      vi: 'SSTable là các file bất biến trên đĩa. Các khóa được sắp xếp trong từng block 4KB. Bộ lọc Bloom Filter ở cuối file cho phép bỏ qua cả file nếu khóa không tồn tại với độ chính xác 99%.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| DATA BLOCKS (4KB each, snappy/zstd compressed):                          |
|  [ Data Block 0: Key/Value pairs, restart array for prefix compression ] |
|  [ Data Block 1: Key/Value pairs, restart array ]                        |
|  [ Data Block 2: ... ]                                                   |
+--------------------------------------------------------------------------+
| FILTER BLOCK: Bloom Filter bit-array (10 bits per key, 1% false positive)|
+--------------------------------------------------------------------------+
| INDEX BLOCK: Binary search entries [ Last Key in Block -> Offset in File]|
+--------------------------------------------------------------------------+
| META INDEX BLOCK: Pointers to Filter Block and Property Block            |
+--------------------------------------------------------------------------+
| FOOTER (48 Bytes): Magic Number (0xdb4775248b80fb57) + Index Block Handle|
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'data_block_size', size: '4096 B', description: { en: 'Default block size for key-value records', vi: 'Kích thước block mặc định cho các cặp key-value' } },
      { name: 'bloom_filter_bits', size: '10 bits/key', description: { en: 'Enables skipping 99% of negative point queries without reading data blocks', vi: 'Cho phép bỏ qua 99% truy vấn không tồn tại mà không cần đọc block dữ liệu' } },
      { name: 'magic_number', size: '8 Bytes', description: { en: 'Fixed 64-bit identifier verifying file validity at file footer', vi: 'Mã định danh 64-bit ở chân file để kiểm tra tính toàn vẹn' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'The Log-Structured Merge-Tree (LSM-Tree), conceptualized by Patrick O’Neil, Edward O’Neil, and Gerhard Weikum in 1996, revolutionized write-intensive storage architectures. By replacing in-place random B-Tree disk overwrites with sequential, append-only structures, LSM-Trees maximize hardware SSD/NVMe write bandwidth while utilizing background asynchronous compaction to reclaim space and maintain read indices.',
      vi: 'Cây Hợp Nhất Ghi Nhật Ký (Log-Structured Merge-Tree - LSM-Tree), được sáng tạo bởi Patrick O’Neil, Edward O’Neil và Gerhard Weikum năm 1996, đã tạo ra cuộc cách mạng cho các hệ thống lưu trữ có mật độ ghi dữ liệu cao. Bằng cách thay thế các thao tác ghi đè ngẫu nhiên của B-Tree bằng cơ chế ghi nối đuôi tuần tự (append-only), LSM-Tree khai thác tối đa băng thông phần cứng của ổ SSD/NVMe, kết hợp với tiến trình nén dọn rác nền (Compaction) để thu hồi dung lượng và tối ưu hóa chỉ mục đọc.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Asymmetric Read/Write Path & The RUM Conjecture: LSM-Trees optimize for Write throughput at the expense of Read amplification (The RUM Conjecture: Read, Update, Memory trade-off). Incoming writes append sequentially to the Write-Ahead Log (WAL) and insert into an in-memory SkipList (MemTable) in O(log K) time with zero random disk seeks. However, reads must search across multiple tiers: MemTable -> Immutable MemTable -> Level-0 SSTables -> Level 1..L SSTables. To prevent point reads from issuing dozens of random disk I/Os, LSM engines prepend each SSTable with a Bloom Filter (10 bits/key providing a 1% false positive rate), eliminating 99% of unnecessary disk block reads.',
        vi: '1. Đường Dẫn Bất Đối Xứng Đọc/Ghi & Định Lý Phỏng Đoán RUM: LSM-Tree tối ưu hóa tối đa cho tốc độ Ghi nhưng phải đánh đổi bằng chi phí Đọc (Định lý RUM: Đánh đổi giữa Read, Update, Memory). Thao tác ghi chỉ việc nối đuôi tuần tự vào file WAL và nạp vào cấu trúc SkipList trong RAM (MemTable) trong O(log K) mà không có bất kỳ truy cập đĩa ngẫu nhiên nào. Tuy nhiên, thao tác đọc phải lục tìm qua nhiều tầng: MemTable -> Immutable MemTable -> Level-0 SSTable -> Level 1..L SSTable. Để chống việc đọc phải phát hàng chục lệnh I/O đĩa ngẫu nhiên, LSM gắn thêm bộ lọc Bloom Filter (10 bit/key cho tỷ lệ dương tính giả 1%), loại trừ 99% các lần đọc đĩa vô ích.'
      },
      {
        en: '2. Compaction Strategies: Size-Tiered (STCS) vs Leveled Compaction (LCS): As MemTables flush to disk, SSTables accumulate. Compaction reconciles duplicate keys and purges deleted records (tombstones). Size-Tiered Compaction merges SSTables of similar sizes; it delivers the highest write throughput but requires 100% temporary disk headroom and produces high read amplification. Leveled Compaction (pioneered by Google LevelDB and RocksDB) organizes disk files into fixed geometric levels (L1=10MB, L2=100MB, L3=1GB). Keys within Level 1 and higher are strictly non-overlapping, guaranteeing that a point read inspects at most ONE SSTable per level.',
        vi: '2. Chiến lược Nén Compaction: Size-Tiered (STCS) vs Leveled Compaction (LCS): Khi MemTable liên tục xả xuống đĩa, số lượng SSTable tăng lên nhanh chóng. Tiến trình Compaction thu gom các bản ghi trùng lặp và xóa các bản ghi đã đánh dấu tử thần (tombstone). Size-Tiered Compaction gộp các SSTable có kích thước tương đương; nó cho tốc độ ghi cao nhất nhưng đòi hỏi tới 100% dung lượng đĩa trống dự phòng và gây trễ đọc lớn. Leveled Compaction (chuẩn mực của LevelDB và RocksDB) chia các tầng theo cấp số nhân (L1=10MB, L2=100MB, L3=1GB). Dải khóa từ Tầng 1 trở lên hoàn toàn không chồng chéo, đảm bảo một truy vấn đọc điểm chỉ cần kiểm tra tối đa DUY NHẤT 1 file SSTable trên mỗi tầng.'
      },
      {
        en: '3. Write Stalls & Compaction Debt: When incoming write ingestion velocity surpasses the physical I/O bandwidth of the background compaction threads, un-compacted SSTables accumulate in Level 0 (where key ranges overlap). If Level 0 file count exceeds the threshold (e.g., level0_slowdown_writes_trigger=20 in RocksDB), the storage engine deliberately injects artificial sleep delays into foreground client write threads ("Write Stall"). This self-preservation mechanism prevents read latency from exploding, but manifests as sudden multi-second throughput drops in client applications.',
        vi: '3. Nghẽn Ghi (Write Stalls) & Nợ Nén (Compaction Debt): Khi tốc độ ghi ồ ạt từ ứng dụng vượt quá băng thông I/O của các luồng nén chạy ngầm, các file SSTable chưa kịp nén sẽ bị ứ đọng tại Tầng 0 (nơi dải khóa bị chồng chéo). Nếu số file L0 vượt ngưỡng an toàn (ví dụ level0_slowdown_writes_trigger=20 trong RocksDB), bộ máy lưu trữ sẽ cố tình tiêm các khoảng nghỉ cưỡng chế (sleep) vào các luồng ghi của ứng dụng ("Write Stall"). Cơ chế tự vệ này ngăn chặn độ trễ đọc bị sụp đổ, nhưng khiến ứng dụng phía trên bị giật lag hàng giây.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Sizing Bloom Filter bits too small (e.g. 4 bits/key instead of 10 bits/key) to save RAM, causing Bloom false positive rates to surge from 1% to 15%. Point lookups for non-existent keys miss the filter and trigger expensive SSD block reads, degrading read throughput by 6x.',
        vi: 'Cấu hình bit của Bloom Filter quá nhỏ (như 4 bit/key thay vì 10 bit/key) để tiết kiệm RAM, khiến tỷ lệ dương tính giả tăng từ 1% lên 15%. Các truy vấn tìm key không tồn tại bị trượt bộ lọc và buộc phải đọc đĩa SSD thật, làm giảm 6 lần thông lượng đọc.'
      },
      {
        en: 'Failing to allocate dedicated compaction I/O threads on multi-core systems, allowing background compaction debt to accumulate and triggering catastrophic RocksDB / Cassandra write stalls during traffic spikes.',
        vi: 'Không cấu hình đủ số luồng I/O chạy ngầm cho tiến trình Compaction trên hệ thống nhiều lõi, khiến nợ nén bị tích tụ và kích hoạt cơ chế nghẽn ghi Write Stall làm đứng hình hệ thống trong giờ cao điểm.'
      },
      {
        en: 'Running out of disk space under Size-Tiered Compaction (STCS) because merging a 500GB tier requires an additional 500GB of unfragmented free disk headroom during the compaction merge cycle.',
        vi: 'Tràn ổ cứng khi dùng Size-Tiered Compaction (STCS) do việc gộp một tập hợp SSTable 500GB đòi hỏi phải có thêm đúng 500GB dung lượng đĩa trống dự phòng trong suốt chu kỳ merge.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'RocksDB / Cassandra Write Stall Freeze During Industrial IoT Telemetry Bursts',
      vi: 'Sự Cố Đóng Băng Write Stall Trong RocksDB / Cassandra Khi Tiếp Nhận Dữ Liệu IoT Đột Biến'
    },
    businessContext: {
      en: 'An industrial manufacturing IoT platform ingests 200,000 sensor telemetry metrics/second into an LSM-Tree based distributed storage cluster (Cassandra / RocksDB on NVMe storage).',
      vi: 'Nền tảng IoT giám sát nhà máy thông minh tiếp nhận 200,000 chỉ số cảm biến mỗi giây vào cụm cơ sở dữ liệu LSM-Tree (Cassandra / RocksDB trên ổ cứng NVMe).'
    },
    problemDescription: {
      en: 'During automated assembly shift changes, telemetry ingestion surged to 480,000 writes/second. After 12 minutes of sustained peak writes, client write latencies exploded from 2.1ms to 9,500ms (almost 10 seconds!). Kafka consumer offsets lagged by 18,000,000 unconsumed records. Database node logs were flooded with warnings: "RocksDB Write Stall: L0 file count (36) >= level0_stop_writes_trigger (36)". The single background compaction worker thread was 100% saturated with I/O and could not merge L0 SSTables into L1 fast enough. RocksDB deliberately stalled client write threads to protect read query indices from collapsing.',
      vi: 'Trong ca bàn giao dây chuyền sản xuất tự động, lưu lượng ghi tăng vọt lên 480,000 bản ghi/giây. Sau 12 phút chịu tải đỉnh, độ trễ ghi của ứng dụng tăng vọt từ 2.1ms lên 9,500ms (gần 10 giây!). Hàng đợi Kafka bị dồn ứ hơn 18,000,000 thông điệp chưa kịp tiêu thụ. File log cơ sở dữ liệu ngập tràn cảnh báo: "RocksDB Write Stall: L0 file count (36) >= level0_stop_writes_trigger (36)". Luồng nén compaction nền đơn độc bị nghẽn 100% I/O và không kịp gộp các file SSTable từ L0 sang L1. RocksDB buộc phải cố tình đóng băng các luồng ghi của client để cứu vãn cấu trúc chỉ mục đọc.'
    },
    whyNaiveFails: {
      en: 'Increasing level0_stop_writes_trigger from 36 to 150 only delayed the freeze by 8 minutes, after which read latencies degraded 30x because searching a key required scanning 150 overlapping SSTables on disk, saturating storage controller queues.',
      vi: 'Cách can thiệp ngây thơ là tăng giới hạn level0_stop_writes_trigger từ 36 lên 150 chỉ hoãn được sự cố thêm 8 phút, sau đó độ trễ đọc bị nát gấp 30 lần vì mỗi truy vấn phải quét qua 150 file SSTable chồng chéo trên đĩa, làm tê liệt bộ điều khiển lưu trữ.'
    },
    coreSolution: {
      en: '1. Scale background compaction parallelism: configure max_background_jobs = 8 and max_subcompactions = 4 to parallelize SSTable merges across multiple CPU cores. 2. Enlarge MemTable write buffers (write_buffer_size = 256MB, max_write_buffer_number = 6) to reduce the frequency of L0 file flushes. 3. Configure Leveled Compaction with dynamic level base sizing (max_bytes_for_level_base = 512MB with a 10x multiplier). 4. Implement rate-controlled compaction to smooth out I/O bandwidth spikes.',
      vi: '1. Mở rộng tính song song của tiến trình nén: cấu hình max_background_jobs = 8 và max_subcompactions = 4 để phân tán việc merge SSTable trên nhiều lõi CPU. 2. Tăng dung lượng bộ đệm MemTable (write_buffer_size = 256MB, max_write_buffer_number = 6) để giảm tần suất xả file L0. 3. Áp dụng Leveled Compaction với kích thước tầng động (max_bytes_for_level_base = 512MB với hệ số nhân 10x). 4. Cấu hình điều tiết tốc độ nén để dàn đều băng thông I/O của ổ đĩa.'
    },
    productionCode: `// Production RocksDB Tuning Profile for Ultra-High Write Workloads (Java 21)
package com.iot.storage.config;

import org.rocksdb.*;

public class HighThroughputRocksDbConfig {

    public static Options createProductionLsmOptions() {
        Options options = new Options();
        
        // 1. Parallelize Compaction & Flush Workers across CPU cores
        options.setCreateIfMissing(true)
               .setMaxBackgroundJobs(8)            // 8 background I/O threads
               .setMaxSubcompactions(4);           // Parallelize single SSTable compaction

        // 2. Enlarge MemTables to absorb high-velocity write bursts
        options.setWriteBufferSize(256 * 1024 * 1024)   // 256MB MemTable
               .setMaxWriteBufferNumber(6)              // Up to 6 in-memory buffers
               .setMinWriteBufferNumberToMerge(2);

        // 3. Leveled Compaction Optimization: Prevents Write Stalls
        options.setCompactionStyle(CompactionStyle.LEVEL)
               .setLevel0FileNumCompactionTrigger(4)    // Start compaction early at 4 L0 files
               .setLevel0SlowdownWritesTrigger(24)     // Backpressure trigger
               .setLevel0StopWritesTrigger(36)
               .setMaxBytesForLevelBase(512 * 1024 * 1024) // 512MB Level 1
               .setMaxBytesForLevelMultiplier(10.0);       // 10x geometric growth per level

        // 4. Block-Based Table Config: 10 bits/key Bloom Filter
        BlockBasedTableConfig tableConfig = new BlockBasedTableConfig();
        tableConfig.setBlockSize(16 * 1024)                // 16KB data blocks
                   .setFilterPolicy(new BloomFilter(10, false)) // 99% negative query filter
                   .setBlockCache(new LRUCache(4L * 1024 * 1024 * 1024)); // 4GB block cache

        options.setTableFormatConfig(tableConfig);
        return options;
    }
}`,
    architectureImpact: {
      en: 'Write stalls eliminated 100%; P99 write latency stabilized at 3.1ms under sustained 480,000 writes/second load; Background compaction throughput improved 4.8x; Kafka consumer backlog cleared in 6 minutes.',
      vi: 'Triệt tiêu 100% hiện tượng Write Stall; Độ trễ ghi P99 ổn định ở mức 3.1ms khi duy trì tải 480,000 bản ghi/giây; Thông lượng nén dữ liệu nền tăng 4.8 lần; Hàng đợi Kafka được giải phóng hoàn toàn chỉ sau 6 phút.'
    }
  },

  steps: [
    {
      id: 'memtable',
      title: { en: '1. In-Memory Sequential Append (MemTable & WAL)', vi: '1. Ghi tuần tự vào RAM (MemTable và WAL)' },
      phase: 'INGESTION',
      description: {
        en: 'The incoming write is appended sequentially to the Write-Ahead Log on disk for durability, then inserted into the concurrent SkipList MemTable in RAM in O(log K) time. No random disk seeks occur.',
        vi: 'Thao tác ghi được ghi nối đuôi tuần tự vào file WAL trên đĩa để bảo đảm bền vững, sau đó chèn vào cấu trúc SkipList MemTable trong RAM trong O(log K). Không có bất kỳ truy cập đĩa ngẫu nhiên nào phát sinh.'
      },
      diskIoBehavior: {
        en: 'Sequential disk append to WAL channel. 100% sequential write bandwidth.',
        vi: 'Ghi tuần tự vào file WAL. Khai thác 100% băng thông ghi tuần tự của ổ đĩa.'
      },
      javaCodeLineMatch: 'memTable.put(key, value)'
    },
    {
      id: 'flush',
      title: { en: '2. Immutable Flush to Level-0 SSTable', vi: '2. Xả MemTable bất biến thành SSTable tầng 0' },
      phase: 'FLUSH',
      description: {
        en: 'When the active MemTable reaches its memory limit (e.g., 64MB), it is made read-only (Immutable MemTable) and a fresh active MemTable is swapped in. A background worker flushes the sorted entries sequentially into a new Level-0 SSTable file on disk.',
        vi: 'Khi MemTable đạt ngưỡng bộ nhớ (ví dụ 64MB), nó chuyển sang chế độ chỉ đọc (Immutable MemTable) và một MemTable mới được hoán đổi vào. Tiến trình ngầm xả toàn bộ dữ liệu đã sắp xếp thành file SSTable tầng Level-0 trên đĩa.'
      },
      diskIoBehavior: {
        en: 'Bulk sequential write of 64MB SSTable file + Bloom filter calculation.',
        vi: 'Ghi hàng loạt tuần tự file SSTable 64MB kèm tính toán bộ lọc Bloom Filter.'
      },
      javaCodeLineMatch: 'flushMemTableToSSTable()'
    },
    {
      id: 'compact',
      title: { en: '3. Level-Based Compaction (Merge & Purge)', vi: '3. Nén đa tầng (Level Compaction) và dọn rác' },
      phase: 'COMPACTION',
      description: {
        en: 'Background compaction picks overlapping SSTables from Level N and merges them with Level N+1 using a multi-way merge sort. Obsolete overwritten values and tombstone markers (deleted records) are permanently purged.',
        vi: 'Tiến trình nén chạy ngầm chọn các SSTable chồng chéo từ tầng N và trộn với tầng N+1 bằng thuật toán multi-way merge sort. Các giá trị cũ bị ghi đè và các cờ đánh dấu xóa (Tombstone) được thanh lọc hoàn toàn.'
      },
      diskIoBehavior: {
        en: 'Sequential read of input SSTables and sequential write of new compacted SSTables. Old files are deleted.',
        vi: 'Đọc tuần tự các SSTable đầu vào và ghi tuần tự các SSTable mới. Các file cũ được xóa bỏ.'
      },
      javaCodeLineMatch: 'mergeAndCompact(level0, level1)'
    }
  ],

  productionEngines: [
    {
      engine: 'RocksDB / LevelDB',
      implementationName: 'Leveled Compaction & BlockBasedTable',
      keyMechanism: {
        en: 'Level 0 has overlapping key ranges. Levels 1 through 6 have strictly non-overlapping key ranges, each level being 10x larger than the previous. Point lookups only check at most 1 SSTable per level.',
        vi: 'Tầng L0 có dải khóa chồng chéo. Các tầng từ L1 đến L6 có dải khóa hoàn toàn tách biệt, mỗi tầng lớn gấp 10 lần tầng trước. Truy vấn điểm chỉ cần kiểm tra tối đa 1 SSTable mỗi tầng.'
      },
      defaultTuningConfig: 'write_buffer_size = 64MB, max_write_buffer_number = 4, target_file_size_base = 64MB',
      architectureNote: {
        en: 'Employs Prefix Bloom Filters to optimize range scans on compound keys.',
        vi: 'Áp dụng Prefix Bloom Filter để tăng tốc quét dải trên các khóa phức hợp.'
      }
    },
    {
      engine: 'Apache Cassandra',
      implementationName: 'Size-Tiered Compaction Strategy (STCS)',
      keyMechanism: {
        en: 'Triggers compaction when multiple SSTables of similar sizes accumulate, optimizing for pure write throughput at the cost of higher space amplification.',
        vi: 'Kích hoạt nén khi gom đủ các SSTable có kích thước tương đương, tối ưu tối đa cho tốc độ ghi cao nhưng tốn thêm không gian đĩa.'
      },
      defaultTuningConfig: 'min_threshold = 4, max_threshold = 32, sstable_size_in_mb = 160',
      architectureNote: {
        en: 'Uses Partition Key Index and Summary files in memory for fast row location.',
        vi: 'Sử dụng file Partition Key Index và Summary trong RAM để định vị dòng siêu tốc.'
      }
    },
    {
      engine: 'Oracle NoSQL Database Engine',
      implementationName: 'Log-Structured Append-Only Storage & Cleaner Compaction',
      keyMechanism: {
        en: 'Oracle NoSQL Database utilizes a log-structured append-only storage engine with in-memory write buffers and sequential log files. Background cleaner threads continuously compact obsolete log files, re-writing surviving records into fresh log segments and reclaiming disk space.',
        vi: 'Oracle NoSQL Database sử dụng storage engine dạng log-structured append-only kết hợp bộ đệm ghi trong RAM và các file log tuần tự. Các luồng Cleaner ngầm liên tục nén các file log lỗi thời, ghi lại các bản ghi còn sống sang segment mới và thu hồi không gian đĩa.'
      },
      defaultTuningConfig: 'je.cleaner.minUtilization = 50, je.cleaner.threads = 4, je.maxMemory = 70%',
      architectureNote: {
        en: 'Optimized for predictable single-digit millisecond latency on high-volume key-value and JSON document ingestion.',
        vi: 'Được tối ưu cho độ trễ ổn định vài mili-giây đối với các luồng nạp dữ liệu key-value và tài liệu JSON quy mô lớn.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Massive sequential write throughput: 10x to 50x faster than B+ Trees.', vi: 'Băng thông ghi tuần tự khổng lồ: nhanh hơn B+ Tree từ 10 đến 50 lần.' },
      { en: 'High storage density: Data is compressed in contiguous blocks with no internal fragmentation.', vi: 'Mật độ lưu trữ cao: Dữ liệu được nén trong các khối liền kề không có phân mảnh.' }
    ],
    cons: [
      { en: 'Read amplification: A point lookup may need to inspect multiple levels if the key is not found.', vi: 'Khuếch đại đọc: Truy vấn điểm có thể phải duyệt qua nhiều tầng nếu không tìm thấy khóa.' },
      { en: 'Compaction write stalls: High ingestion rates can cause compaction to fall behind, throttling writes.', vi: 'Nghẽn ghi do nén (Write Stalls): Nếu tốc độ nạp quá nhanh, quá trình nén bị tụt lại làm nghẽn luồng ghi.' }
    ],
    writeAmplification: {
      en: 'WAF is typically 10x - 30x across all levels, but writes are 100% sequential.',
      vi: 'Hệ số WAF từ 10x đến 30x qua các tầng, nhưng toàn bộ là ghi tuần tự.'
    },
    recoveryGuarantee: {
      en: 'Unflushed MemTable data is 100% recoverable from the sequential WAL file on crash.',
      vi: 'Dữ liệu trong MemTable chưa xả được phục hồi 100% từ file WAL tuần tự khi có sự cố.'
    }
  },

  springBootCode: `# ===================================================================
# Spring Boot 3.x application.yml - Apache Cassandra / LSM-Tree Engine
# ===================================================================
spring:
  cassandra:
    keyspace-name: telemetry_data
    contact-points: 127.0.0.1:9042
    local-datacenter: datacenter1
    compression: LZ4
    connection:
      connect-timeout: 10s
      init-query-timeout: 10s
    request:
      timeout: 5s
      consistency: LOCAL_QUORUM # W + R > N guarantees strong consistency!

---
// ===================================================================
// Spring Data Cassandra Entity optimized for LSM-Tree Appends
// ===================================================================
package com.enterprise.telemetry.entity;

import org.springframework.data.cassandra.core.mapping.*;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import java.time.Instant;

@Table("device_events")
public class DeviceEvent {

    @PrimaryKeyColumn(name = "device_id", ordinal = 0, type = PrimaryKeyType.PARTITIONED)
    private String deviceId; // Determines partition token on consistent hash ring

    @PrimaryKeyColumn(name = "recorded_at", ordinal = 1, type = PrimaryKeyType.CLUSTERED)
    private Instant recordedAt; // Stored ordered inside SSTable data blocks

    @Column("metric_value")
    private Double metricValue;

    @Column("status_payload")
    private String statusPayload;

    // Getters and setters...
}`,

  sqlQueries: `-- 1. Create table with Leveled Compaction Strategy (LCS)
CREATE KEYSPACE telemetry_data 
WITH replication = {'class': 'NetworkTopologyStrategy', 'datacenter1': 3};

USE telemetry_data;

CREATE TABLE device_events (
    device_id text,
    recorded_at timestamp,
    metric_value double,
    status_payload text,
    PRIMARY KEY ((device_id), recorded_at)
) WITH CLUSTERING ORDER BY (recorded_at DESC)
AND compaction = {
    'class': 'LeveledCompactionStrategy',
    'sstable_size_in_mb': 160
}
AND compression = {'class': 'LZ4Compressor'};

-- 2. Fast append query (hits in-memory MemTable in <1ms)
INSERT INTO device_events (device_id, recorded_at, metric_value, status_payload)
VALUES ('sensor-99', toTimestamp(now()), 42.5, 'OK');

-- 3. Range scan over sorted SSTable blocks
SELECT * FROM device_events 
WHERE device_id = 'sensor-99' 
  AND recorded_at >= '2026-11-01 00:00:00' 
LIMIT 100;`,

  javaCode: `package com.database.internals.storage;

import java.util.*;
import java.util.concurrent.*;

/**
 * Pure Java 21 implementation of an LSM-Tree Storage Engine.
 * Demonstrates ConcurrentSkipList MemTable, SSTable flush, and Level compaction.
 */
public class LSMTreeStorageEngine<K extends Comparable<K>, V> {
    private static final int MEMTABLE_THRESHOLD = 3; // Demo threshold

    // In-Memory MemTable (SkipList for concurrent ordered lookups)
    private final ConcurrentSkipListMap<K, V> memTable = new ConcurrentSkipListMap<>();
    private final List<SSTable<K, V>> level0 = new CopyOnWriteArrayList<>();
    private final List<SSTable<K, V>> level1 = new CopyOnWriteArrayList<>();

    // Step 1: Fast in-memory write backed by sequential WAL
    public void put(K key, V value) {
        memTable.put(key, value);
        if (memTable.size() >= MEMTABLE_THRESHOLD) {
            flushMemTableToSSTable();
        }
    }

    // Step 2: Flush MemTable to immutable disk SSTable
    public synchronized void flushMemTableToSSTable() {
        if (memTable.isEmpty()) return;
        List<Map.Entry<K, V>> snapshot = new ArrayList<>(memTable.entrySet());
        SSTable<K, V> sstable = new SSTable<>(snapshot);
        level0.add(0, sstable);
        memTable.clear();

        if (level0.size() >= 3) {
            mergeAndCompact(level0, level1);
        }
    }

    // Step 3: Multi-way Level Compaction (Merge Sort)
    public synchronized void mergeAndCompact(List<SSTable<K, V>> src, List<SSTable<K, V>> dst) {
        Map<K, V> merged = new TreeMap<>();
        for (SSTable<K, V> table : src) {
            for (Map.Entry<K, V> entry : table.entries) {
                merged.putIfAbsent(entry.getKey(), entry.getValue());
            }
        }
        dst.add(new SSTable<>(new ArrayList<>(merged.entrySet())));
        src.clear();
    }

    // Point lookup: MemTable -> Level 0 -> Level 1
    public V get(K key) {
        V val = memTable.get(key);
        if (val != null) return val;

        for (SSTable<K, V> table : level0) {
            val = table.get(key);
            if (val != null) return val;
        }

        for (SSTable<K, V> table : level1) {
            val = table.get(key);
            if (val != null) return val;
        }
        return null;
    }

    public static class SSTable<K extends Comparable<K>, V> {
        final List<Map.Entry<K, V>> entries;
        SSTable(List<Map.Entry<K, V>> entries) { this.entries = entries; }

        public V get(K key) {
            int low = 0, high = entries.size() - 1;
            while (low <= high) {
                int mid = (low + high) >>> 1;
                int cmp = entries.get(mid).getKey().compareTo(key);
                if (cmp < 0) low = mid + 1;
                else if (cmp > 0) high = mid - 1;
                else return entries.get(mid).getValue();
            }
            return null;
        }
    }
}`
};
