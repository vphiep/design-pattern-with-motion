import type { DatabaseTopic } from '../types';

export const slottedPage: DatabaseTopic = {
  id: 'slotted-page',
  category: 'storage-engines',
  name: 'Slotted Page Architecture & Tuple Layout',
  tagline: {
    en: 'The universal physical storage structure: bi-directional page growth, zero internal fragmentation, and stable tuple pointers (TID/RID).',
    vi: 'Cấu trúc lưu trữ vật lý phổ quát: mở rộng hai chiều, triệt tiêu phân mảnh bộ nhớ và bảo đảm địa chỉ con trỏ dòng (TID/RID).'
  },
  difficulty: 2,
  order: 2,
  estimatedMinutes: 16,

  coreTheory: {
    problemStatement: {
      en: 'Table rows (tuples) have dynamic, variable lengths due to VARCHAR, JSON, and NULL values. If rows were stored at fixed offsets, resizing or deleting a row would create holes (external fragmentation) and require shifting all subsequent rows, invalidating all external index pointers.',
      vi: 'Các dòng dữ liệu trong bảng luôn có độ dài biến thiên do kiểu VARCHAR, JSON và giá trị NULL. Nếu lưu ở các vị trí cố định, việc cập nhật hoặc xóa một dòng sẽ tạo ra các lỗ hổng phân mảnh và buộc phải dịch chuyển toàn bộ các dòng phía sau, làm vô hiệu hóa toàn bộ con trỏ index từ bên ngoài trỏ vào.'
    },
    hardwareConstraint: {
      en: 'Flash SSDs and HDDs read/write in atomic sectors. Writing an entire table page must preserve stable physical addressing: a Tuple ID (TID = PageID + SlotNumber) must never change even when tuples are defragmented inside the page.',
      vi: 'Ổ cứng SSD và HDD luôn đọc ghi theo từng sector nguyên tử. Việc ghi trang phải bảo đảm tính toàn vẹn địa chỉ: Mã định danh dòng (TID = PageID + SlotNumber) không bao giờ được phép thay đổi ngay cả khi dữ liệu bên trong trang được dọn dẹp hoặc dồn chỗ.'
    },
    fundamentalSolution: {
      en: 'The Slotted Page splits the page into two regions growing toward each other: an array of small fixed-size ItemID slot pointers (4 bytes) growing top-down from the header, and actual variable-length tuple bytes growing bottom-up from the end of the page. Free space sits cleanly in the middle.',
      vi: 'Kiến trúc Slotted Page chia trang làm hai phần phát triển ngược chiều nhau: một mảng các con trỏ ItemID cố định (4 bytes) tăng dần từ đầu trang xuống, và dữ liệu thực tế của các tuple phát triển ngược từ đáy trang lên trên. Khoảng trống tự do (Free Space) nằm trọn vẹn ở chính giữa.'
    },
    math: {
      formula: 'FreeSpace = upper_free_offset - lower_free_offset - sizeof(ItemId)',
      description: {
        en: 'A new tuple can only be inserted if FreeSpace >= TupleLength + 4 bytes for the new line pointer.',
        vi: 'Một dòng mới chỉ có thể chèn vào trang nếu dung lượng FreeSpace >= Độ dài dòng + 4 byte con trỏ.'
      },
      timeComplexity: 'O(1) direct tuple read by Slot ID, O(1) append in page',
      spaceComplexity: 'Zero internal fragmentation with in-page compaction',
      ioCostFormula: 'TID Lookup = 1 Page Read + Direct Offset Dereference'
    }
  },

  pageLayout: {
    title: {
      en: 'Slotted Page Layout (PostgreSQL PageHeaderData standard - 8192 Bytes)',
      vi: 'Cấu trúc Slotted Page chuẩn PostgreSQL (Kích thước trang 8192 Bytes)'
    },
    description: {
      en: 'The 24-byte header stores LSN, checksum, and two boundary offsets: pd_lower (end of line pointers) and pd_upper (start of latest tuple). Free space decreases until lower == upper.',
      vi: 'Header 24 byte lưu LSN, checksum và hai mốc con trỏ ranh giới: pd_lower (kết thúc mảng con trỏ) và pd_upper (bắt đầu dữ liệu tuple gần nhất).'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| PAGE HEADER (24 Bytes)                                                   |
| [pd_lsn: 8B] [pd_checksum: 2B] [pd_flags: 2B] [pd_lower: 2B] [pd_upper: 2B] |
+--------------------------------------------------------------------------+
| LINE POINTER ARRAY (itemId: 4B each: offset (15b) + flags (2b) + len (15b))|
|  [ ItemId #1 ]  --->  points to Tuple #1 at bottom of page               |
|  [ ItemId #2 ]  --->  points to Tuple #2                                 |
|  [ ItemId #3 ]  --->  (grows downward toward pd_lower)                    |
+--------------------------------------------------------------------------+
|                        CONTIGUOUS FREE SPACE GAP                         |
|                    (Available for new row insertions)                    |
+--------------------------------------------------------------------------+
|  [ Tuple #3 Bytes ]   <--- (grows upward from pd_upper)                  |
|  [ Tuple #2 Bytes: Header (23B) + NullBitmap + Attribute Values ]        |
|  [ Tuple #1 Bytes: t_xmin, t_xmax, t_cid, t_ctid ] (at page end 0x1FFF)   |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'pd_lsn', size: '8 Bytes', description: { en: 'WAL Log Sequence Number of last modifying transaction', vi: 'LSN của giao dịch gần nhất sửa đổi trang' } },
      { name: 'pd_lower', size: '2 Bytes', description: { en: 'Byte offset pointing to the end of the line pointer array', vi: 'Vị trí kết thúc của mảng con trỏ dòng' } },
      { name: 'pd_upper', size: '2 Bytes', description: { en: 'Byte offset pointing to the start of the unallocated tuple data at page bottom', vi: 'Vị trí bắt đầu vùng dữ liệu dòng ở đáy trang' } },
      { name: 'pd_special', size: '2 Bytes', description: { en: 'Offset to special space (used by B-tree sibling pointers)', vi: 'Khoảng dành riêng cho cấu trúc đặc biệt (như liên kết lá B-tree)' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'The Slotted Page architecture is the universal physical layout powering relational storage engines (PostgreSQL, SQLite, MySQL InnoDB, and Oracle). By decoupling variable-length physical tuple storage from persistent logical identifiers (Tuple ID / ItemPointer: PageNumber, OffsetNumber), slotted pages enable in-place space reclamation, defragmentation, and zero-index-invalidation row updates.',
      vi: 'Kiến trúc Trang Phân Khe (Slotted Page) là bố cục vật lý tiêu chuẩn vận hành hầu hết các hệ quản trị cơ sở dữ liệu quan hệ (PostgreSQL, SQLite, MySQL InnoDB, Oracle). Bằng cách tách rời vùng lưu trữ dữ liệu dòng có độ dài biến đổi khỏi định danh logic cố định (Tuple ID: Số trang, Số thứ tự con trỏ dòng), Slotted Page cho phép thu hồi không gian trống, chống phân mảnh tại chỗ và cập nhật dữ liệu mà không làm hỏng các chỉ mục thứ cấp.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Bidirectional Growth Invariant: Inside an 8KB physical database page, memory allocation grows from both ends toward the middle: 1. The Line Pointer array (ItemId: 4 bytes per slot containing byte offset, flags, and tuple length) grows FORWARD from the header offset pd_lower. 2. The actual raw tuple payloads grow BACKWARD from the page end offset pd_upper. The unallocated free space of the page resides strictly between pd_lower and pd_upper (Free Space = pd_upper - pd_lower). This elegant geometry allows the page to absorb variable-length rows without pre-allocating fixed-size slots.',
        vi: '1. Quy Tắc Phát Triển Hai Chiều Ngược Nhau: Bên trong một trang đĩa vật lý 8KB, việc cấp phát bộ nhớ diễn ra từ hai đầu tiến dần vào giữa: 1. Mảng con trỏ dòng (Line Pointer / ItemId: 4 byte mỗi phần tử lưu offset byte, cờ và độ dài dòng) tăng dần TIẾN TỚI từ mốc pd_lower ở đầu trang. 2. Dữ liệu thực tế của các dòng (Tuple) được ghi ngược LÙI DẦN từ đáy trang pd_upper lên trên. Toàn bộ khoảng trống tự do chưa dùng nằm gọn ở giữa pd_lower và pd_upper (Khoảng trống = pd_upper - pd_lower). Cấu trúc hình học này cho phép trang tiếp nhận các dòng có độ dài bất kỳ mà không cần chia ô cố định gây lãng phí.'
      },
      {
        en: '2. Stable Physical Identifiers (TID / RID) & In-Page Compaction: A fundamental database rule is that secondary B-Tree indexes store the logical Tuple ID (block_number, offset_number), NEVER raw physical byte offsets. If a tuple is updated or deleted and remaining tuples within the page are shifted down during in-page defragmentation (compacting free space), only the internal byte offsets in the Line Pointer array are modified! The external TID (Page 42, Offset 3) remains 100% constant, avoiding the catastrophic overhead of re-indexing millions of secondary B-Tree index leaves.',
        vi: '2. Định Danh Vật Lý Cố Định (TID / RID) & Nén Chống Phân Mảnh Tại Chỗ: Một nguyên lý sống còn của cơ sở dữ liệu là các chỉ mục B-Tree phụ luôn trỏ vào Tuple ID (số_trang, số_thứ_tự_dòng) chứ KHÔNG BAO GIỜ trỏ vào địa chỉ byte vật lý thô. Khi một dòng bị xóa hoặc sửa đổi và các dòng khác trong trang được dồn lại để gom khoảng trống (defragmentation), engine CHỈ CẦN sửa lại con trỏ trong mảng Line Pointer ở đầu trang! Định danh TID bên ngoài (Trang 42, Dòng 3) hoàn toàn không thay đổi, loại bỏ nguy cơ phải cập nhật lại hàng triệu khóa trong các cây chỉ mục B-Tree phụ.'
      },
      {
        en: '3. Heap-Only Tuples (HOT) Optimization in PostgreSQL: In high-frequency UPDATE workloads, updating a row under classical MVCC requires inserting a new tuple version and updating every single secondary index on the table. PostgreSQL introduced Heap-Only Tuples (HOT): If the new tuple version fits inside the SAME physical 8KB page as the old version AND no indexed columns were modified, PostgreSQL chains the old Line Pointer directly to the new Line Pointer within the same page. Secondary indexes continue pointing to the old Line Pointer, completely eliminating secondary index write amplification!',
        vi: '3. Tối Ưu Hóa Heap-Only Tuples (HOT) Trong PostgreSQL: Trong các bảng có tần suất UPDATE cao, việc cập nhật một dòng theo cơ chế MVCC cổ điển đòi hỏi phải tạo phiên bản dòng mới và cập nhật toàn bộ các chỉ mục phụ trên bảng. PostgreSQL phát minh ra tối ưu hóa HOT (Heap-Only Tuples): Nếu phiên bản dòng mới nằm vừa trong CÙNG MỘT TRANG 8KB với dòng cũ VÀ không có cột chỉ mục nào bị sửa đổi, PostgreSQL sẽ nối con trỏ dòng cũ thẳng tới con trỏ dòng mới ngay trong trang. Các chỉ mục phụ vẫn giữ nguyên con trỏ cũ, triệt tiêu 100% chi phí ghi đè lên các cây chỉ mục phụ!'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Configuring default fillfactor = 100 on tables subjected to heavy concurrent UPDATE statements. Pages are packed to 100% capacity during INSERTs, leaving 0 bytes of free space for HOT updates, forcing 100% of updates to write to different pages and triggering severe index bloat.',
        vi: 'Để mặc định fillfactor = 100 trên các bảng có tần suất UPDATE cao. Các trang bị lấp đầy 100% ngay từ lúc INSERT, không còn thừa 1 byte nào để thực hiện cập nhật HOT tại chỗ, ép buộc 100% lệnh UPDATE phải nhảy sang trang mới và gây phình to chỉ mục khủng khiếp.'
      },
      {
        en: 'Line Pointer array fragmentation caused by mass batch deletes (DELETE FROM logs WHERE created_at < NOW() - 30 days). While tuple bodies are freed, Line Pointer slots cannot be removed from the page header until a full VACUUM or table rewrite occurs.',
        vi: 'Phân mảnh mảng con trỏ dòng do xóa dữ liệu hàng loạt (DELETE hàng triệu dòng log cũ). Mặc dù dữ liệu dòng đã được giải phóng, nhưng các ô con trỏ ItemId ở đầu trang vẫn tồn tại cho đến khi tiến trình VACUUM quét dọn hoặc viết lại toàn bộ bảng.'
      },
      {
        en: 'Tuple header size underestimation: In PostgreSQL, every tuple carries a 23-byte HeapTupleHeader (t_xmin, t_xmax, t_cid, t_ctid) plus a NULL bitmap. Inserting millions of narrow 2-column rows (e.g. key, value) consumes 70% of physical page space solely for header overhead.',
        vi: 'Đánh giá thấp dung lượng của Tuple Header: Trong PostgreSQL, mỗi dòng dữ liệu cõng theo một HeapTupleHeader nặng tới 23 byte (xmin, xmax, cid, ctid) cộng thêm Null Bitmap. Chèn hàng triệu dòng bảng hẹp (chỉ có 2 cột id và status) sẽ khiến 70% dung lượng đĩa bị lãng phí chỉ để chứa header.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'High-Frequency UPDATE Table Bloat & HOT (Heap-Only Tuple) Optimization Failure',
      vi: 'Hiện Tượng Phình To Bảng (Table Bloat) & Thất Bại Tối Ưu Hóa HOT Do Sai Cấu Hình fillfactor'
    },
    businessContext: {
      en: 'A high-velocity ride-hailing and delivery platform processes 50,000 order state updates/second (e.g., CREATED -> DRIVER_ASSIGNED -> IN_TRANSIT -> COMPLETED).',
      vi: 'Nền tảng gọi xe và giao đồ ăn công nghệ xử lý 50,000 trạng thái cuốc xe mỗi giây (CREATED -> DRIVER_ASSIGNED -> IN_TRANSIT -> COMPLETED).'
    },
    problemDescription: {
      en: 'The active rides table contained 10,000,000 active records. Over 3 weeks of operations, the physical disk size of the table ballooned from 14GB to 148GB, even though the total row count remained strictly constant! Furthermore, secondary B-Tree indexes grew from 18GB to 95GB. Query latency for simple rider lookups degraded from 1.8ms to 320ms due to catastrophic buffer pool thrashing. Forensic inspection using pg_stat_user_tables showed: n_tup_upd = 450,000,000, but n_tup_hot_upd = 0 (0% HOT update success!). Because the table was created with default fillfactor = 100, pages had zero free space between pd_lower and pd_upper; every single status update had to allocate a new page and update all 8 secondary indexes on the table, generating 12x write amplification.',
      vi: 'Bảng cuốc xe (rides) duy trì cố định khoảng 10,000,000 bản ghi hoạt động. Sau 3 tuần chạy thật, dung lượng đĩa vật lý của bảng phình to từ 14GB lên tới 148GB dù số lượng dòng không hề tăng! Các chỉ mục B-Tree phụ nở to từ 18GB lên 95GB. Độ trễ tra cứu cuốc xe tăng từ 1.8ms lên tới 320ms do bộ nhớ đệm Buffer Pool bị quá tải rác. Phân tích qua pg_stat_user_tables cho thấy: tổng số lần update là 450 triệu lần nhưng n_tup_hot_upd = 0 (tỷ lệ tận dụng HOT là 0%!). Do bảng để mặc định fillfactor = 100, trang 8KB không có khoảng trống tự do; mỗi lần update trạng thái đều phải nhảy sang trang mới và cập nhật lại cả 8 cây chỉ mục phụ, gây ra hệ số khuếch đại ghi gấp 12 lần.'
    },
    whyNaiveFails: {
      en: 'Running VACUUM FULL rides took an exclusive ACCESS EXCLUSIVE lock on the table for 50 minutes, taking down customer mobile apps and breaching production SLAs. Furthermore, within 5 days, the table bloated right back up to 135GB.',
      vi: 'Chạy lệnh VACUUM FULL rides chiếm dụng khóa độc quyền toàn bảng suốt 50 phút, làm sập toàn bộ ứng dụng người dùng và vi phạm SLA nghiêm trọng. Hơn nữa, chỉ sau 5 ngày hoạt động, bảng lại phình to trở lại mốc 135GB như cũ.'
    },
    coreSolution: {
      en: '1. Reconfigure table fillfactor to 70: ALTER TABLE rides SET (fillfactor = 70). This reserves 30% of each 8KB page specifically for in-page updates. 2. Remove updated_at timestamps from secondary indexes if not queried in WHERE clauses (modifying an indexed column disqualifies a row from HOT optimization). 3. Tune Autovacuum concurrency: increase autovacuum_vacuum_cost_limit to 2000 and lower autovacuum_vacuum_scale_factor to 0.05 to aggressively clean dead tuple versions before pages fill up.',
      vi: '1. Cấu hình lại fillfactor của bảng về 70: ALTER TABLE rides SET (fillfactor = 70). Thiết lập này dành riêng 30% khoảng trống trên mỗi trang 8KB để đón nhận các bản ghi update HOT tại chỗ. 2. Loại bỏ cột updated_at ra khỏi các chỉ mục phụ nếu câu lệnh WHERE không dùng đến (sửa cột có index sẽ làm mất tính năng HOT). 3. Tinh chỉnh Autovacuum dọn dẹp chủ động hơn: nâng autovacuum_vacuum_cost_limit lên 2000 và giảm autovacuum_vacuum_scale_factor xuống 0.05 để thu hồi các tuple rác trước khi trang bị đầy.'
    },
    productionCode: `// Production PostgreSQL Table & Autovacuum Tuning for High-UPDATE Tables
-- 1. Reserve 30% page space for Heap-Only Tuple (HOT) in-page updates:
ALTER TABLE rides SET (
    fillfactor = 70,
    autovacuum_vacuum_scale_factor = 0.05,  -- Trigger vacuum when 5% rows change
    autovacuum_vacuum_cost_limit = 2000,    -- 10x faster background vacuum speed
    autovacuum_vacuum_cost_delay = 2        -- 2ms pause between vacuum batches
);

-- 2. Repack the bloated table online with ZERO read/write locks via pg_repack:
-- Run from shell: pg_repack -d ride_db -t rides

-- 3. Verify HOT Update Success Ratio in production:
SELECT 
    schemaname, 
    relname, 
    n_tup_upd, 
    n_tup_hot_upd,
    -- HOT Ratio should be > 90% for high-frequency update tables!
    ROUND((n_tup_hot_upd::numeric / NULLIF(n_tup_upd, 0)) * 100, 2) AS hot_update_percentage
FROM pg_stat_user_tables 
WHERE relname = 'rides';`,
    architectureImpact: {
      en: 'HOT update success rate jumped from 0% to 94.6%; Secondary index write amplification dropped by 86%; Table physical storage stabilized at 17GB instead of 148GB; P99 ride update latency fell from 320ms down to 2.1ms.',
      vi: 'Tỷ lệ cập nhật thành công HOT tăng vọt từ 0% lên 94.6%; Hệ số khuếch đại ghi trên chỉ mục phụ giảm 86%; Dung lượng bảng vật lý ổn định ở mức 17GB thay vì 148GB; Độ trễ P99 của cuốc xe giảm từ 320ms xuống chỉ còn 2.1ms.'
    }
  },

  steps: [
    {
      id: 'header-check',
      title: { en: '1. Read Page Header & Verify Free Space', vi: '1. Đọc Header và kiểm tra khoảng trống tự do' },
      phase: 'INSPECTION',
      description: {
        en: 'Before inserting a tuple, the storage manager inspects pd_lower and pd_upper. It computes available free space = pd_upper - pd_lower. If free space is less than tuple_size + sizeof(ItemId), the page cannot accept the row and the Free Space Map (FSM) is queried for another page.',
        vi: 'Trước khi chèn một dòng, engine kiểm tra pd_lower và pd_upper. Khoảng trống khả dụng = pd_upper - pd_lower. Nếu không đủ chứa tuple_size + 4 byte con trỏ, trang bị từ chối và engine tra cứu bản đồ FSM để tìm trang khác.'
      },
      diskIoBehavior: {
        en: 'Page is read into buffer memory. If dirty, WAL logging will be required.',
        vi: 'Trang được nạp vào RAM. Nếu có sửa đổi, cần ghi nhận nhật ký WAL.'
      },
      javaCodeLineMatch: 'int freeSpace = upperFreeOffset - lowerFreeOffset'
    },
    {
      id: 'tuple-insert',
      title: { en: '2. Append Tuple at Bottom Offset (pd_upper)', vi: '2. Ghi Tuple vào đáy trang và giảm pd_upper' },
      phase: 'ALLOCATION',
      description: {
        en: 'The tuple byte array (including HeapTupleHeader, NULL bitmap, and column data) is copied into the page at address (pd_upper - tuple_size). The pd_upper offset is decremented accordingly.',
        vi: 'Mảng byte của tuple (gồm header dòng, bitmap NULL và dữ liệu cột) được sao chép vào trang tại vị trí (pd_upper - tuple_size). Con trỏ pd_upper được trừ lùi tương ứng.'
      },
      diskIoBehavior: {
        en: 'Direct memory write in buffer frame. No disk I/O occurs until background flush or checkpoint.',
        vi: 'Ghi trực tiếp vào bộ nhớ buffer frame. Chưa phát sinh I/O đĩa cho tới khi checkpoint.'
      },
      javaCodeLineMatch: 'upperFreeOffset -= tupleLength'
    },
    {
      id: 'pointer-alloc',
      title: { en: '3. Create Line Pointer (ItemId) & Update pd_lower', vi: '3. Tạo con trỏ Line Pointer và tăng pd_lower' },
      phase: 'INDEXING',
      description: {
        en: 'A new 4-byte line pointer (ItemId) is appended at pd_lower, containing the offset to the tuple and its length. pd_lower is incremented by 4 bytes. The Tuple ID is finalized as (PageNumber, SlotNumber), providing a permanent address for secondary indexes.',
        vi: 'Một con trỏ dòng 4 byte (ItemId) được thêm vào vị trí pd_lower, chứa offset trỏ tới tuple và độ dài của nó. pd_lower tăng thêm 4 byte. Địa chỉ TID chính thức được cố định thành (Số trang, Số thứ tự slot).'
      },
      diskIoBehavior: {
        en: 'Buffer page marked DIRTY. LSN updated to current transaction LSN.',
        vi: 'Trang buffer được đánh dấu DIRTY. LSN cập nhật theo LSN của transaction hiện tại.'
      },
      javaCodeLineMatch: 'linePointers.add(new ItemPointer'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Heap Storage',
      implementationName: 'PageHeaderData & ItemIdData (Slotted Page)',
      keyMechanism: {
        en: 'Every table page in PostgreSQL is exactly 8192 bytes by default. Tuples are identified by ctid = (block_number, offset_number). When VACUUM defragments a page, tuples are shifted down but ItemId slot numbers stay strictly identical, preserving all index pointers.',
        vi: 'Mọi trang bảng trong Postgres mặc định là 8192 byte. Dòng được định danh bằng ctid = (block_number, offset_number). Khi VACUUM dọn dẹp trang, các tuple được dồn chỗ nhưng số hiệu ItemId giữ nguyên, bảo toàn tuyệt đối con trỏ index.'
      },
      defaultTuningConfig: 'block_size = 8192 (8KB), fillfactor = 100 (90 for HOT updates)',
      architectureNote: {
        en: 'Heap-Only Tuples (HOT) optimization allows tuple updates inside the same page without updating any secondary indexes.',
        vi: 'Cơ chế Heap-Only Tuples (HOT) cho phép cập nhật dòng trong cùng một trang mà không cần cập nhật các secondary index.'
      }
    },
    {
      engine: 'MySQL InnoDB Tablespace',
      implementationName: 'FIL Header & User Records Page Structure',
      keyMechanism: {
        en: 'InnoDB uses 16KB index pages. Rows are stored in a singly-linked list ordered by primary key. Instead of a line pointer array, it uses a sparse "Page Directory" (slots pointing to every 4th to 8th row) for binary searching.',
        vi: 'InnoDB dùng trang 16KB. Các dòng liên kết đơn theo thứ tự khóa chính. Thay vì mảng con trỏ đầy đủ, InnoDB dùng "Page Directory" thưa (mỗi slot trỏ cách 4-8 dòng) để tìm kiếm nhị phân.'
      },
      defaultTuningConfig: 'innodb_page_size = 16384, innodb_default_row_format = DYNAMIC',
      architectureNote: {
        en: 'DYNAMIC row format moves variable-length columns (BLOB, TEXT, VARCHAR > 768 bytes) to 20-byte pointers pointing to overflow pages.',
        vi: 'Định dạng DYNAMIC chuyển các cột lớn (BLOB, TEXT > 768 byte) thành con trỏ 20 byte trỏ sang trang tràn overflow.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Data Block Structure',
      implementationName: 'Row Directory, ROWID & PCTFREE Block Reserve',
      keyMechanism: {
        en: 'Oracle uses an 8KB data block with Row Directory growing downwards and Row Pieces growing upwards. Each row is addressed by an immutable ROWID (Data ObjectID, Datafile#, Block#, Row#). The PCTFREE parameter reserves space (e.g. 10%) inside each block specifically for future UPDATEs, preventing destructive Row Migration.',
        vi: 'Oracle sử dụng khối dữ liệu 8KB với Row Directory phát triển xuôi xuống và Row Pieces phát triển ngược lên từ đáy. Mỗi dòng được định danh bằng mã ROWID bất biến (Data ObjectID, Datafile#, Block#, Row#). Tham số PCTFREE dự trữ khoảng trống (ví dụ 10%) trong mỗi block dành riêng cho các lệnh UPDATE tương lai, chống hiện tượng di dời dòng (Row Migration).'
      },
      defaultTuningConfig: 'CREATE TABLE ... PCTFREE 15 PCTUSED 40;',
      architectureNote: {
        en: 'When a row expands beyond available block space, Oracle leaves a forward pointer at the original ROWID pointing to the migrated block, ensuring secondary indexes never break.',
        vi: 'Khi một dòng phình to vượt quá khoảng trống của block, Oracle để lại một con trỏ chuyển tiếp tại vị trí ROWID ban đầu trỏ sang block mới, giúp các chỉ mục phụ không bao giờ bị hỏng hay cần cập nhật lại.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Completely eliminates external fragmentation inside disk blocks.', vi: 'Triệt tiêu hoàn toàn hiện tượng phân mảnh ngoài bên trong khối đĩa.' },
      { en: 'Guarantees permanent, immutable Tuple IDs (TIDs) for secondary indexes even after internal page compaction.', vi: 'Bảo đảm địa chỉ dòng TID bất biến cho các index phụ ngay cả khi dồn chỗ trang.' },
      { en: 'Supports arbitrary variable-length columns and NULL values with zero wasted space.', vi: 'Hỗ trợ các trường dữ liệu biến thiên và giá trị NULL mà không lãng phí byte nào.' }
    ],
    cons: [
      { en: 'Page compaction overhead: Defragmenting a page requires moving bytes in RAM.', vi: 'Chi phí dọn dẹp trang: Việc dồn trống đòi hỏi di chuyển byte trong RAM.' },
      { en: 'Row limit: Cannot store a row larger than (PageSize - 24B Header) without overflow/TOAST mechanisms.', vi: 'Giới hạn kích thước dòng: Không thể chứa dòng lớn hơn trang nếu không có cơ chế TOAST.' }
    ],
    writeAmplification: {
      en: 'Low in-memory overhead; writes are batched in the Buffer Pool before disk flush.',
      vi: 'Chi phí trong RAM rất thấp; các thao tác ghi được gom trong Buffer Pool trước khi xả xuống đĩa.'
    },
    recoveryGuarantee: {
      en: 'Every slot allocation and byte movement generates full WAL redo records for crash replay.',
      vi: 'Mọi thao tác cấp phát slot và dịch chuyển byte đều ghi log WAL Redo đầy đủ để phục hồi khi sập nguồn.'
    }
  },

  javaCode: `package com.database.internals.storage;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure Java 21 implementation of a Slotted Page Storage Engine Block.
 * Emulates the 8192-byte page architecture used by PostgreSQL and SQLite.
 */
public class SlottedPage {
    public static final int PAGE_SIZE = 8192;
    public static final int HEADER_SIZE = 24;
    public static final int ITEM_POINTER_SIZE = 4; // 2B offset + 2B length

    private final ByteBuffer buffer = ByteBuffer.allocateDirect(PAGE_SIZE);
    private int lowerFreeOffset; // Grows top-down (after line pointers)
    private int upperFreeOffset; // Grows bottom-up (before tuple data)
    private long pageLsn;
    private final List<ItemPointer> linePointers = new ArrayList<>();

    public record ItemPointer(int offset, int length) {}

    public SlottedPage(long initialLsn) {
        this.pageLsn = initialLsn;
        this.lowerFreeOffset = HEADER_SIZE;
        this.upperFreeOffset = PAGE_SIZE;
    }

    // Step 1: Read Page Header and evaluate contiguous free space gap
    public int getFreeSpace() {
        return (upperFreeOffset - lowerFreeOffset) - ITEM_POINTER_SIZE;
    }

    // Step 2 & 3: Insert tuple, append line pointer, and shrink free space
    public synchronized int insertTuple(byte[] tupleData, long transactionLsn) {
        int tupleLength = tupleData.length;
        int freeSpace = upperFreeOffset - lowerFreeOffset;

        if (freeSpace < (tupleLength + ITEM_POINTER_SIZE)) {
            return -1; // Page full: delegate to Free Space Map (FSM)
        }

        // Step 2: Append tuple bytes backward from upperFreeOffset
        upperFreeOffset -= tupleLength;
        buffer.position(upperFreeOffset);
        buffer.put(tupleData);

        // Step 3: Write 4-byte line pointer at lowerFreeOffset
        int slotNumber = linePointers.size();
        linePointers.add(new ItemPointer(upperFreeOffset, tupleLength));
        lowerFreeOffset += ITEM_POINTER_SIZE;

        this.pageLsn = transactionLsn;
        return slotNumber; // Returns permanent Tuple ID (TID) slot index
    }

    // Direct O(1) tuple read via Slot ID (ItemPointer dereference)
    public byte[] getTuple(int slotNumber) {
        if (slotNumber < 0 || slotNumber >= linePointers.size()) {
            throw new IllegalArgumentException("Invalid slot ID");
        }
        ItemPointer ptr = linePointers.get(slotNumber);
        byte[] data = new byte[ptr.length()];
        buffer.position(ptr.offset());
        buffer.get(data);
        return data;
    }

    // Defragmentation: compacts tuples when rows are deleted without changing slot numbers
    public synchronized void defragmentPage() {
        ByteBuffer temp = ByteBuffer.allocate(PAGE_SIZE);
        int newUpper = PAGE_SIZE;

        for (int i = 0; i < linePointers.size(); i++) {
            ItemPointer oldPtr = linePointers.get(i);
            if (oldPtr.length() > 0) { // Not marked deleted
                newUpper -= oldPtr.length();
                buffer.position(oldPtr.offset());
                byte[] row = new byte[oldPtr.length()];
                buffer.get(row);
                temp.position(newUpper);
                temp.put(row);
                linePointers.set(i, new ItemPointer(newUpper, oldPtr.length()));
            }
        }
        upperFreeOffset = newUpper;
    }
}`
};
