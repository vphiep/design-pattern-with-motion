import type { DatabaseTopic } from '../types';

export const writeAheadLog: DatabaseTopic = {
  id: 'write-ahead-log',
  category: 'durability-wal',
  name: 'Write-Ahead Logging (WAL) & LSN Tracking',
  tagline: {
    en: 'The foundation of database durability: Write-Ahead protocol, Log Sequence Numbers (LSN), and asynchronous group commits.',
    vi: 'Nền tảng của tính bền vững ACID: Giao thức ghi trước WAL, số thứ tự nhật ký LSN và gom nhóm commit (Group Commit).'
  },
  difficulty: 3,
  order: 7,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      en: 'Flushing modified data pages to physical tablespaces on every transaction COMMIT requires expensive random I/O writes across scattered disk sectors. If the server loses power midway through writing a 16KB page, the page is torn (half-written), corrupting the database irreversibly.',
      vi: 'Việc xả các trang dữ liệu đã sửa đổi xuống tablespace mỗi khi có giao dịch COMMIT đòi hỏi ghi đĩa ngẫu nhiên rất chậm trên nhiều sector phân tán. Nếu mất điện đột ngột giữa chừng khi đang ghi một trang 16KB, trang sẽ bị rách bán phần (torn page), làm hỏng hóc cơ sở dữ liệu vĩnh viễn.'
    },
    hardwareConstraint: {
      en: 'Sequential append writes to physical media are 10x-100x faster than random writes. Storage devices guarantee that an fsync() flushes disk controller caches to persistent non-volatile flash or platter sectors.',
      vi: 'Ghi nối đuôi tuần tự vào ổ đĩa nhanh hơn từ 10 đến 100 lần so với ghi ngẫu nhiên. Lệnh hệ thống fsync() bảo đảm ép toàn bộ bộ đệm phần cứng xả dữ liệu xuống các chip nhớ flash hoặc phiến từ không biến đổi.'
    },
    fundamentalSolution: {
      en: 'The Write-Ahead Logging (WAL) protocol dictates: "Never write a dirty data page to disk until the corresponding log record describing the update has been safely flushed and fsynced to disk." The log records the Redo and Undo deltas with monotonically increasing Log Sequence Numbers (LSN).',
      vi: 'Giao thức Write-Ahead Logging (WAL) quy định: "Tuyệt đối không bao giờ được ghi trang dữ liệu bẩn xuống đĩa cho tới khi bản ghi nhật ký mô tả sự thay đổi đó đã được xả và đồng bộ fsync() an toàn xuống đĩa". Nhật ký ghi lại các thao tác Redo và Undo kèm theo số hiệu LSN tăng đơn điệu.'
    },
    math: {
      formula: '\\text{Cost}_{\\text{per transaction}} \\approx \\frac{\\text{Cost}_{\\text{flush}}}{\\text{Transactions}_{\\text{group}}}, \\quad \\text{Page.LSN} \\le \\text{Flushed\\_to\\_Disk\\_LSN}',
      description: {
        en: 'Group Commit amortizes expensive fsync() kernel calls by batching N concurrent committing transactions into a single physical storage flush. Actual commit latency is not constant O(1); it depends on physical disk controller write latency, accumulated WAL volume, OS queue scheduling, and lock contention on the WAL log buffer.',
        vi: 'Group Commit chia đều chi phí của lệnh đồng bộ đĩa fsync() đắt đỏ bằng cách gom N giao dịch commit đồng thời vào một lần xả đĩa vật lý duy nhất. Thời gian đồng bộ không phải là O(1) tức thời mà phụ thuộc vào độ trễ phần cứng lưu trữ, dung lượng WAL cần xả, điều phối hàng đợi của HĐH và mức độ tranh chấp khóa (contention) trên bộ đệm WAL.'
      },
      timeComplexity: 'O(1) in-memory copy to WAL ring buffer; Amortized disk sync cost Cost_per_transaction ≈ Cost_flush / Transactions_group',
      spaceComplexity: 'Log segment recycling (e.g. bounded max_wal_size ring buffer)',
      ioCostFormula: 'Amortized Sync Cost = (Storage Flush Latency + WAL Write Time) / Batched Transactions'
    }
  },

  detailedTheory: {
    overview: {
      en: 'The Write-Ahead Logging (WAL) protocol is the foundational guarantee of database Durability and Crash Recovery. Rather than synchronously writing entire modified 8KB or 16KB data pages to disk on transaction COMMIT—which requires devastating random I/O and risks torn-page corruption—the database engine converts all mutations into compact, sequential, append-only log records. By ensuring the WAL record is fsynced to durable storage before any data page hits disk, the engine guarantees complete zero-data-loss recovery.',
      vi: 'Giao thức Ghi trước Nhật ký (Write-Ahead Logging - WAL) là nền tảng bảo đảm tính Bền vững (Durability) và Phục hồi sự cố trong cơ sở dữ liệu. Thay vì ghi đồng bộ toàn bộ các trang dữ liệu 8KB hoặc 16KB xuống đĩa khi giao dịch COMMIT—thao tác đòi hỏi I/O ghi ngẫu nhiên cực chậm và tiềm ẩn nguy cơ rách trang (torn page)—storage engine biến mọi thay đổi thành các bản ghi nhật ký tuần tự, nối đuôi cực kỳ tinh gọn. Bằng việc đảm bảo WAL được fsync xuống đĩa trước khi dữ liệu chạm vào ổ cứng, hệ thống đảm bảo an toàn dữ liệu 100% khi sập nguồn.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Physical I/O Physics: Sequential Append vs Random Flushes: Physical storage devices (NVMe SSDs and spinning platters) achieve maximum throughput under sequential append writes. Flushing 10 scattered 8KB data pages across a 2TB database requires 10 random disk seeks. In contrast, appending 10 WAL records of 80 bytes each requires a single sequential write of 800 bytes. WAL converts chaotic, high-latency random mutations into blazing-fast sequential throughput.',
        vi: '1. Vật lý I/O Phần cứng: Ghi Nối đuôi Tuần tự vs Xả Đĩa Ngẫu nhiên: Ổ cứng vật lý (cả SSD NVMe lẫn HDD) đạt thông lượng tối đa khi thực hiện ghi tuần tự nối đuôi. Việc xả 10 trang dữ liệu 8KB nằm rải rác trên file 2TB đòi hỏi 10 lần tìm kiếm ngẫu nhiên rất tốn thời gian. Ngược lại, việc nối thêm 10 bản ghi WAL (mỗi bản ghi chỉ khoảng 80 byte) chỉ tốn một lần ghi tuần tự 800 byte duy nhất. WAL biến các đột biến ghi ngẫu nhiên hỗn loạn thành luồng ghi tuần tự với tốc độ tối đa của phần cứng.'
      },
      {
        en: '2. The Log Sequence Number (LSN) Monotonic Counter: Every byte in the WAL stream is addressed by a 64-bit integer called the Log Sequence Number (LSN). Every data page header in RAM contains PageLSN (the LSN of the latest mutation applied to that page). The engine maintains FlushedLSN (the highest LSN safely fsynced to non-volatile disk). The WAL Invariant enforces: PageLSN <= FlushedLSN. If a dirty page attempts to flush before its WAL record is synced, the engine halts the write and forces a WAL flush immediately.',
        vi: '2. Con số Thần thánh LSN (Log Sequence Number): Mọi byte trong dòng dữ liệu WAL được đánh địa chỉ bằng một số nguyên 64-bit gọi là LSN. Mỗi header của trang dữ liệu trong RAM đều lưu PageLSN (mã LSN của thao tác sửa đổi gần nhất trên trang đó). Engine liên tục theo dõi FlushedLSN (LSN cao nhất đã được lệnh fsync ghi an toàn xuống đĩa). Bất biến cốt lõi của WAL quy định: PageLSN <= FlushedLSN. Nếu một trang bẩn cố xả xuống đĩa trước khi WAL tương ứng được ghi, engine sẽ chặn lại và ép xả WAL trước.'
      },
      {
        en: '3. Group Commit & Asynchronous Log Flushers: Executing a disk fsync() takes ~1-2 milliseconds on standard storage, capping throughput at ~500-1,000 transactions per second if executed synchronously per thread. Modern database engines use Group Commit: when multiple concurrent transactions commit simultaneously, one thread acts as the leader, batching commit requests and executing a single fsync() for dozens of transactions at once. This amortizes fsync latency and scales throughput to 50,000+ TPS.',
        vi: '3. Gom Nhóm Commit (Group Commit) & Tối ưu fsync: Lệnh fsync() tốn ~1-2 millisecond trên ổ cứng thông thường, khiến thông lượng tối đa chỉ đạt ~500-1.000 TPS nếu mỗi kết nối tự gọi fsync riêng rẽ. Các CSDL hiện đại sử dụng kỹ thuật Group Commit: khi nhiều giao dịch cùng bấm commit một lúc, một luồng sẽ đóng vai trò trưởng nhóm, gom toàn bộ các yêu cầu lại và gọi duy nhất 1 lần fsync() cho hàng chục giao dịch. Kỹ thuật này triệt tiêu độ trễ fsync và đẩy thông lượng lên hơn 50.000 TPS.'
      },
      {
        en: '4. Full Page Writes & Torn Page Protection: When the OS or storage hardware experiences a sudden power blackout while writing an 8KB or 16KB data page to disk, the page may be half-written (torn page). The page checksum fails and the data block is corrupted. PostgreSQL eliminates this via Full Page Writes (FPW): on the first modification to a data page following a Checkpoint, an entire copy of the 8KB page is written into the WAL. If a torn page occurs after a crash, recovery restores the clean 8KB image from WAL and reapplies redo deltas.',
        vi: '4. Ghi Toàn Bộ Trang (Full Page Writes) & Chống Rách Trang: Khi mất điện đột ngột trong lúc ổ đĩa đang ghi dở trang 8KB hoặc 16KB, trang dữ liệu sẽ bị ghi dở một nửa (hiện tượng Torn Page), làm hỏng mã kiểm tra checksum và hỏng vĩnh viễn block dữ liệu. PostgreSQL khắc phục triệt để bằng cơ chế Full Page Writes (FPW): ở lần sửa đổi đầu tiên của một trang sau mỗi Checkpoint, toàn bộ bản sao 8KB của trang đó được ghi nguyên vẹn vào WAL. Khi sập nguồn, quá trình phục hồi sẽ lấy trang sạch 8KB từ WAL đè lên và chạy tiếp Redo.'
      },
      {
        en: '5. Point-in-Time Recovery (PITR) & Change Data Capture (CDC): WAL is not just for local crash recovery; it is the single source of truth for the entire distributed architecture. By archiving WAL segments to remote object storage (Amazon S3 / Google Cloud Storage), DBAs can replay transactions up to an exact microsecond timestamp to restore deleted data. Furthermore, tools like Debezium use Logical Decoding to read the WAL stream and stream real-time change events into Apache Kafka for microservice choreography.',
        vi: '5. Phục hồi tới Thời điểm Bất kỳ (PITR) & Bắt Dữ liệu Biến đổi (CDC): WAL không chỉ dùng để phục hồi sự cố tại chỗ; nó là nguồn chân lý duy nhất cho toàn bộ hệ sinh thái phân tán. Bằng cách lưu trữ định kỳ các phân đoạn WAL lên S3/GCS, DBA có thể tua lại lịch sử giao dịch đến đúng micro giây mong muốn để cứu dữ liệu bị xóa nhầm. Hơn nữa, các công cụ như Debezium dùng cơ chế Logical Decoding để đọc dòng WAL này và đẩy trực tiếp thành các event vào Apache Kafka để đồng bộ microservices.'
      },
      {
        en: '6. The Transactional Outbox Pattern in Spring Boot: In distributed systems, publishing an event to Kafka and updating a SQL database inside the same business method cannot be done under two-phase commits without severe latency. By using the Transactional Outbox Pattern, the application writes the business entity AND an outbox message into the same SQL database transaction. Both writes are recorded in the same atomic WAL sequence, guaranteeing that events are never lost even if the application server crashes midway.',
        vi: '6. Mẫu Thiết kế Transactional Outbox trong Spring Boot: Trong hệ thống microservices, việc vừa update SQL vừa gửi event vào Kafka trong cùng một method không thể đảm bảo an toàn tuyệt đối nếu không có 2PC. Bằng cách áp dụng mẫu Transactional Outbox, ứng dụng lưu cả entity nghiệp vụ và message outbox vào cùng 1 transaction CSDL. Cả 2 thao tác cùng được ghi vào 1 luồng WAL nguyên tử duy nhất, đảm bảo thông điệp không bao giờ bị rơi rụng kể cả khi server ứng dụng bị sập nguồn giữa chừng.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'WAL Disk Saturation from Lagging Replication Slots: In PostgreSQL, if a replica server goes offline or a CDC tool (Debezium) crashes while holding a Replication Slot, the primary database is FORBIDDEN from recycling old WAL segments. The pg_wal directory accumulates thousands of 16MB files until physical storage reaches 100% capacity. When disk space is full, PostgreSQL immediately executes an emergency panicking shutdown, halting all production services. Solution: configure max_slot_wal_keep_size.',
        vi: 'Tràn Đĩa WAL do Replication Slot bị Treo: Trong PostgreSQL, nếu một máy replica bị ngắt kết nối hoặc công cụ Debezium bị sập khi đang giữ một Replication Slot, máy chủ chính sẽ BỊ CẤM dọn dẹp các phân đoạn WAL cũ. Thư mục pg_wal sẽ phình to chứa hàng nghìn file 16MB cho tới khi ổ cứng đầy 100%. Khi hết đĩa, PostgreSQL sẽ lập tức rơi vào trạng thái panic và tắt ngấm toàn bộ hệ thống. Giải pháp: luôn cấu hình tham số max_slot_wal_keep_size.'
      },
      {
        en: 'Disabling full_page_writes for Artificial Benchmarks: Developers tuning database configurations often disable full_page_writes = off to reduce write amplification and artificially inflate synthetic benchmark scores. If the server loses power or the OS crashes during an active workload, partial sector writes will produce corrupted torn pages on disk that CANNOT be recovered using WAL redo, permanently destroying customer table data.',
        vi: 'Tắt full_page_writes để Hack Điểm Benchmark: Nhiều lập trình viên tắt cấu hình full_page_writes = off để giảm dung lượng ghi đĩa và tăng điểm benchmark ảo. Nếu máy chủ bị cúp điện hoặc OS bị sập khi đang chạy thật, hiện tượng ghi dở trang (torn page) sẽ làm hỏng dữ liệu vật lý trên đĩa mà WAL KHÔNG THỂ phục hồi được, dẫn đến mất mát dữ liệu khách hàng vĩnh viễn.'
      },
      {
        en: 'Synchronous Commit Saturation on High-Volume Ingestion: Setting synchronous_commit = on forces every single transaction COMMIT to wait for a physical disk fsync. On ingestion pipelines processing 20,000 events/sec, this creates extreme disk queue bottlenecks. For non-financial telemetry workloads, switching to synchronous_commit = off or using HikariCP batch updates provides a 20x throughput improvement with negligible risk (at most a few milliseconds of lost data on crash).',
        vi: 'Nghẽn fsync do synchronous_commit khi Nạp Dữ liệu Khối lượng Lớn: Cấu hình synchronous_commit = on bắt buộc mỗi lệnh COMMIT phải chờ ổ đĩa vật lý hoàn tất fsync. Với các luồng dữ liệu nạp 20.000 event/giây, điều này tạo ra nút thắt cổ chai I/O cực lớn. Với các dữ liệu không nhạy cảm tài chính (như log, telemetry), chuyển sang synchronous_commit = off hoặc dùng JPA batch updates sẽ tăng tốc độ lên tới 20 lần.'
      }
    ]
  },

  pageLayout: {
    title: {
      en: 'WAL Record Binary File Layout (PostgreSQL XLogRecord standard)',
      vi: 'Cấu trúc nhị phân bản ghi nhật ký WAL (Chuẩn PostgreSQL XLogRecord)'
    },
    description: {
      en: 'WAL files are split into fixed 16MB segments. Each WAL record contains a 24-byte header: total length, transaction ID, resource manager ID (rmid), and CRC32 checksum, followed by the redo payload.',
      vi: 'File WAL được chia thành các phân đoạn 16MB cố định. Mỗi bản ghi WAL có header 24 byte: độ dài, mã giao dịch, Resource Manager ID, mã CRC32 và phần thân dữ liệu Redo.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| WAL SEGMENT (16MB file: 000000010000000000000001):                      |
| [XLogLongPageHeaderData: Magic=0xD10D, PageLSN, SystemID]                |
+--------------------------------------------------------------------------+
| WAL RECORD #1 (LSN 0x1A20):                                              |
|  [ xl_tot_len: 4B ] [ xl_xid: 4B (TxID) ] [ xl_prev: 8B (PrevLSN) ]     |
|  [ xl_info: 1B ] [ xl_rmid: 1B (HEAP/BTREE/TX) ] [ xl_crc: 4B (CRC32) ]  |
|  [ Redo Payload: Block #42, Offset 0x1F00, NewBytes [...] ]              |
+--------------------------------------------------------------------------+
| WAL RECORD #2 (LSN 0x1A80): [ COMMIT TxID #42 ✓ ]                        |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'xl_tot_len', size: '4 Bytes', description: { en: 'Total record length including header and redo payload', vi: 'Tổng độ dài bản ghi bao gồm header và payload' } },
      { name: 'xl_xid', size: '4 Bytes', description: { en: 'Transaction ID performing this state modification', vi: 'ID của giao dịch thực hiện thay đổi trạng thái này' } },
      { name: 'xl_prev', size: '8 Bytes', description: { en: 'Pointer to preceding LSN written by this server instance', vi: 'Con trỏ trỏ tới LSN liền trước do server ghi' } }
    ]
  },

  steps: [
    {
      id: 'append',
      title: { en: '1. Append Record to RAM WAL Buffer', vi: '1. Nối bản ghi vào vùng đệm RAM WAL Buffer' },
      phase: 'BUFFERING',
      description: {
        en: 'When a transaction modifies a table or index, it generates a WAL record describing the byte diff. The record is appended to the shared WAL buffer in memory, and the new LSN is stamped onto the modified page in the buffer pool.',
        vi: 'Khi giao dịch sửa đổi bảng hoặc index, nó tạo ra một bản ghi WAL mô tả sự khác biệt byte. Bản ghi được ghi nối vào buffer WAL trong RAM, và LSN mới được đóng dấu lên trang dữ liệu tương ứng trong Buffer Pool.'
      },
      diskIoBehavior: {
        en: 'Pure in-memory memcpy. Nanosecond latency.',
        vi: 'Thao tác memcpy hoàn toàn trong RAM. Độ trễ nano giây.'
      },
      javaCodeLineMatch: 'walBuffer.append(lsn, txId, prevLsn)'
    },
    {
      id: 'fsync',
      title: { en: '2. Synchronous Flush & fsync at COMMIT', vi: '2. Xả đồng bộ và kích hoạt fsync() khi COMMIT' },
      phase: 'FLUSH_FSYNC',
      description: {
        en: 'At COMMIT, the transaction must ensure all its WAL records are made durable. The engine issues a write() call followed by an explicit fsync() call to the OS file descriptor, guaranteeing bits are physically written to non-volatile disk.',
        vi: 'Tại thời điểm COMMIT, giao dịch bắt buộc phải đảm bảo toàn bộ bản ghi WAL đã bền vững. Engine phát lệnh write() kèm theo lệnh fsync() ép hệ điều hành ghi trực tiếp xuống ổ cứng vật lý.'
      },
      diskIoBehavior: {
        en: 'Sequential disk write + hardware flush. Group Commit merges multiple concurrent transactions into 1 fsync.',
        vi: 'Ghi tuần tự + fsync phần cứng. Group Commit gom nhiều giao dịch đồng thời vào 1 lần fsync duy nhất.'
      },
      javaCodeLineMatch: 'channel.force(false)'
    },
    {
      id: 'recovery',
      title: { en: '3. ARIES Crash Recovery (Redo & Undo)', vi: '3. Phục hồi sự cố ARIES (Phát lại Redo và hoàn tác Undo)' },
      phase: 'RECOVERY',
      description: {
        en: 'If a power crash occurs, upon restart the database reads WAL from the last Checkpoint LSN. In the Redo pass, it replays all logged changes to restore page state. In the Undo pass, it rolls back all uncommitted transactions (losers).',
        vi: 'Nếu xảy ra sự cố mất điện, khi khởi động lại hệ quản trị đọc WAL từ mốc Checkpoint gần nhất. Ở pha Redo, nó phát lại toàn bộ thay đổi để khôi phục trạng thái. Ở pha Undo, nó hoàn tác toàn bộ giao dịch chưa kịp commit.'
      },
      diskIoBehavior: {
        en: 'Sequential scan of WAL files; random page repair writes in tablespaces.',
        vi: 'Quét tuần tự các file WAL; ghi đĩa ngẫu nhiên để sửa chữa các trang tablespace.'
      },
      javaCodeLineMatch: 'replayRedoLog(lastCheckpointLSN)'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL pg_wal',
      implementationName: 'Write-Ahead Log & Point-In-Time-Recovery (PITR)',
      keyMechanism: {
        en: 'WAL records are archived sequentially. Continuous WAL archiving paired with a base backup enables restoring the database to any millisecond in the past (PITR).',
        vi: 'Các file WAL được lưu trữ tuần tự. Kết hợp giữa lưu trữ WAL và bản sao lưu gốc (base backup) cho phép phục hồi cơ sở dữ liệu về bất kỳ thời điểm nào trong quá khứ (PITR).'
      },
      defaultTuningConfig: 'wal_level = replica, max_wal_size = 1GB, synchronous_commit = on',
      architectureNote: {
        en: 'Turning synchronous_commit = off provides massive write speedup by buffering commits at the risk of losing recent seconds on crash.',
        vi: 'Tắt synchronous_commit = off giúp tăng tốc độ ghi khổng lồ nhưng chấp nhận rủi ro mất vài giây giao dịch gần nhất nếu sập nguồn.'
      }
    },
    {
      engine: 'MySQL InnoDB Redo Log',
      implementationName: 'ib_logfile Circular Ring Buffer',
      keyMechanism: {
        en: 'InnoDB maintains a fixed-size circular ring of redo log files. When the log wraps around to the checkpoint marker, dirty pages must be flushed immediately to prevent log overwrite.',
        vi: 'InnoDB duy trì một vòng tròn các file ib_logfile cố định. Khi ghi chạm mốc Checkpoint, hệ thống buộc phải xả trang bẩn khẩn cấp để tránh ghi đè nhật ký.'
      },
      defaultTuningConfig: 'innodb_flush_log_at_trx_commit = 1, innodb_redo_log_capacity = 2GB',
      architectureNote: {
        en: 'Setting innodb_flush_log_at_trx_commit = 2 flushes to OS cache every commit but only issues fsync once per second.',
        vi: 'Đặt tham số bằng 2 sẽ ghi vào OS cache mỗi commit nhưng chỉ gọi fsync mỗi giây một lần.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Redo Log',
      implementationName: 'Online Redo Log Groups & LGWR (Log Writer)',
      keyMechanism: {
        en: 'Oracle uses multiplexed Online Redo Log groups managed by the LGWR background process. LGWR writes synchronously on COMMIT, when the redo log buffer is 1/3 full, or every 3 seconds. Oracle supports asynchronous commit (COMMIT WRITE BATCH NOWAIT) for low-latency batch jobs.',
        vi: 'Oracle sử dụng các nhóm Online Redo Log ghép kênh (multiplexed groups) được quản lý bởi tiến trình nền LGWR. LGWR ghi đồng bộ khi COMMIT, khi bộ đệm redo log đầy 1/3, hoặc định kỳ mỗi 3 giây. Oracle hỗ trợ commit bất đồng bộ (COMMIT WRITE BATCH NOWAIT) cho các tác vụ xử lý hàng loạt cần độ trễ thấp.'
      },
      defaultTuningConfig: "ALTER SYSTEM SET COMMIT_LOGGING = 'BATCH' SCOPE=BOTH; ALTER SYSTEM SET COMMIT_WAIT = 'NOWAIT';",
      architectureNote: {
        en: 'LGWR uses synchronous I/O or Asynchronous I/O (AIO) via libaio. Multiplexing log members protects against hardware sector failures without pausing transactions.',
        vi: 'LGWR sử dụng I/O đồng bộ hoặc Asynchronous I/O (AIO) thông qua libaio. Việc ghép kênh nhiều thành viên log bảo vệ cơ sở dữ liệu khỏi hỏng sector phần cứng mà không làm gián đoạn giao dịch.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Turns slow, dangerous random disk page writes into ultra-fast sequential append I/O.', vi: 'Biến các thao tác ghi đĩa ngẫu nhiên nguy hiểm thành ghi tuần tự siêu tốc.' },
      { en: 'Enables safe delayed dirty page flushing and background checkpointing.', vi: 'Cho phép trì hoãn xả trang bẩn an toàn và thực hiện Checkpoint ngầm.' }
    ],
    cons: [
      { en: 'Disk space consumption: High-throughput ingestion generates tens of gigabytes of WAL per hour.', vi: 'Tốn dung lượng đĩa: Tải ghi cao sinh ra hàng chục gigabyte WAL mỗi giờ.' },
      { en: 'Recovery startup delay: A large backlog between Checkpoint and Crash increases recovery time.', vi: 'Trễ khởi động khi phục hồi: Khoảng cách giữa Checkpoint và lúc sập càng lớn thì thời gian phục hồi càng lâu.' }
    ],
    writeAmplification: {
      en: 'Every update is written at least twice: once sequentially to WAL, and once randomly to table page.',
      vi: 'Mỗi thao tác ghi được ghi ít nhất 2 lần: một lần tuần tự vào WAL, một lần ngẫu nhiên vào trang bảng.'
    },
    recoveryGuarantee: {
      en: 'Absolute 100% ACID durability for all transactions whose commit records were fsynced.',
      vi: 'Bảo đảm độ bền vững 100% cho mọi giao dịch có bản ghi commit đã được fsync.'
    }
  },

  springBootCode: `# ===================================================================
# Spring Boot 3.x application.yml - WAL & Transaction Outbox Pattern
# ===================================================================
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/orders_service
    hikari:
      maximum-pool-size: 20
      # Group commit parameter optimization
      data-source-properties:
        reWriteBatchedInserts: true
  jpa:
    properties:
      hibernate:
        jdbc.batch_size: 50
        order_inserts: true

---
// ===================================================================
// Transactional Outbox Service: WAL commits guarantee zero-loss events
// ===================================================================
package com.enterprise.orders.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.enterprise.orders.entity.*;
import com.enterprise.orders.repository.*;

@Service
public class OrderCheckoutService {

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxRepository;

    public OrderCheckoutService(OrderRepository orderRepository, OutboxEventRepository outboxRepository) {
        this.orderRepository = orderRepository;
        this.outboxRepository = outboxRepository;
    }

    /**
     * Single database transaction: Business data and Outbox event are written
     * to the exact same WAL record, guaranteeing atomic publishing without dual-write bugs!
     */
    @Transactional
    public void checkoutOrder(Order order) {
        orderRepository.save(order);

        // Outbox event written in same database transaction
        OutboxEvent event = new OutboxEvent(
            "ORDER_CREATED", 
            order.getId().toString(), 
            "{\\"orderId\\": " + order.getId() + "}"
        );
        outboxRepository.save(event);
        // COMMIT flushes both records into WAL atomically with fsync!
    }
}`,

  sqlQueries: `-- 1. Check current WAL Write Location & LSN in PostgreSQL
SELECT 
    pg_current_wal_lsn() AS current_lsn,
    pg_walfile_name(pg_current_wal_lsn()) AS current_wal_file;

-- 2. Measure WAL Generation Rate (Megabytes per second)
SELECT 
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/00000000'::pg_lsn)) AS total_wal_bytes_written;

-- 3. Inspect PostgreSQL WAL archiving and Checkpoint statistics
SELECT 
    checkpoints_timed, 
    checkpoints_req, 
    checkpoint_write_time, 
    checkpoint_sync_time, 
    buffers_checkpoint, 
    buffers_clean
FROM pg_stat_bgwriter;`,

  javaCode: `package com.database.internals.durability;

import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

/**
 * Pure Java 21 implementation of Write-Ahead Logging (WAL) Manager.
 * Demonstrates LSN generation, RAM WAL buffering, and fsync synchronization.
 */
public class WriteAheadLogManager implements AutoCloseable {
    private static final int WAL_BUFFER_CAPACITY = 64 * 1024; // 64KB RAM buffer
    private final ByteBuffer walBuffer = ByteBuffer.allocateDirect(WAL_BUFFER_CAPACITY);
    private final FileChannel channel;
    private long currentLsn = 1000;
    private long flushedLsn = 0;

    public WriteAheadLogManager(String logFilePath) throws Exception {
        RandomAccessFile file = new RandomAccessFile(logFilePath, "rw");
        this.channel = file.getChannel();
    }

    // Step 1: Append log record to RAM WAL buffer
    public synchronized long appendLogRecord(long txId, int pageId, byte[] redoDelta) {
        long lsn = currentLsn++;
        walBuffer.putLong(lsn);
        walBuffer.putLong(txId);
        walBuffer.putInt(pageId);
        walBuffer.putInt(redoDelta.length);
        walBuffer.put(redoDelta);
        return lsn;
    }

    // Step 2: Force synchronous flush (fsync) at transaction COMMIT
    public synchronized void commitAndSync(long targetLsn) throws Exception {
        if (targetLsn <= flushedLsn) return;

        walBuffer.flip();
        channel.write(walBuffer);
        channel.force(false); // Step 2: Physical hardware fsync
        walBuffer.clear();
        this.flushedLsn = targetLsn;
    }

    // Fundamental WAL Invariant Check before page eviction
    public boolean isSafeToEvictPage(long pageLsn) {
        return pageLsn <= flushedLsn;
    }

    @Override
    public void close() throws Exception {
        channel.close();
    }
}`,

  productionProblemCase: {
    title: {
      en: 'High-Frequency Financial Commit Bottlenecks & fsync() Disk Saturation',
      vi: 'Nghẽn Cổ Chai Ghi Đĩa fsync() Trong Giao Dịch Tài Chính Tần Suất Cao'
    },
    businessContext: {
      en: 'A digital payment gateway processes 35,000 top-up and fund-transfer transactions per second. Regulatory compliance mandates strict ACID durability (zero data loss on power failure).',
      vi: 'Cổng thanh toán trực tuyến xử lý 35.000 giao dịch nạp tiền và chuyển khoản mỗi giây. Quy định tài chính bắt buộc mức độ bền vững ACID tuyệt đối (không được mất bất kỳ byte dữ liệu nào khi mất điện).'
    },
    problemDescription: {
      en: 'If every single database transaction independently invokes the operating system fsync() syscall on COMMIT to persist its WAL record, the database becomes strictly bottlenecked by the rotational and flash latency of physical storage. Even on enterprise NVMe SSDs, an individual fsync() takes ~100-300 microseconds. Consequently, a single database thread can complete at most 3,000-5,000 fsync calls per second! Under peak traffic of 35,000 tx/s, thousands of application threads queue up waiting for the disk controller, saturating connection pools and sending P99 latency spiking from 3ms to 450ms.',
      vi: 'Nếu mỗi giao dịch khi COMMIT đều tự mình gọi lệnh hệ điều hành fsync() xuống đĩa để lưu bản ghi WAL, cơ sở dữ liệu sẽ bị trói chặt vào độ trễ vật lý của ổ đĩa. Ngay cả trên SSD NVMe cao cấp, một lệnh fsync() riêng lẻ mất ~100-300 microsecond. Do đó, một luồng CPU chỉ có thể thực hiện tối đa 3.000-5.000 lệnh fsync mỗi giây! Khi lưu lượng chạm đỉnh 35.000 tx/s, hàng ngàn luồng ứng dụng xếp hàng chờ bộ điều khiển đĩa, làm tê liệt connection pool và đẩy độ trễ P99 từ 3ms vọt lên 450ms.'
    },
    whyNaiveFails: {
      en: 'Setting innodb_flush_log_at_trx_commit = 2 or 0 provides high speed but loses up to 1-2 seconds of financial transactions during an OS kernel panic or power outage—a critical compliance violation.',
      vi: 'Cấu hình innodb_flush_log_at_trx_commit = 2 hoặc 0 giúp tăng tốc nhưng sẽ làm mất vĩnh viễn 1-2 giây dữ liệu tài chính khi sập nguồn hoặc kernel panic—vi phạm nghiêm trọng quy định kiểm toán ngân hàng.'
    },
    coreSolution: {
      en: '1. WAL Group Commit: Rather than issuing an fsync() per transaction, the engine coalesces dozens of concurrent transactions committing within a tiny time window. A single "Leader" thread issues ONE physical fsync() syscall on behalf of the entire group, and wakes up all "Follower" threads simultaneously.\n2. Microsecond Delay Tuning (binlog_group_commit_sync_delay = 50µs): Slightly delaying the leader thread allows 50-100 additional transactions to join the same batch, dramatically increasing commit density without noticeable latency.\n3. Pipelined Lock-Free WAL Ring Buffers: Lock-free append into memory buffers eliminates mutex contention among concurrent worker threads.',
      vi: '1. Kỹ Thuật WAL Group Commit (Gom Nhóm Ghi Bền Vững): Thay vì mỗi giao dịch gọi riêng một lệnh fsync(), storage engine gom hàng chục giao dịch commit trong một cửa sổ thời gian cực ngắn vào cùng một mẻ. Một luồng làm Trưởng nhóm (Leader) sẽ gọi ĐÚNG MỘT LỆNH fsync() duy nhất cho toàn bộ nhóm, rồi đánh thức đồng loạt tất cả các luồng theo sau (Followers).\n2. Tinh Chỉnh Cửa Sổ Gom Nhóm (binlog_group_commit_sync_delay = 50µs): Cho phép luồng trưởng nhóm dừng lại 50 microsecond để gom thêm 50-100 giao dịch khác vào cùng mẻ ghi, tối đa hóa mật độ ghi đĩa mà không làm người dùng cảm nhận được độ trễ.\n3. Hàng Đợi Vòng WAL Không Khóa (Lock-Free Ring Buffer): Ghi dữ liệu vào mảng đệm RAM phi khóa giúp triệt tiêu tranh chấp Mutex giữa hàng trăm luồng.'
    },
    productionCode: `// Production Database Tuning & Transactional Outbox Pattern in Spring Boot
@Configuration
public class HighThroughputWalTuningConfig {

    @Bean
    public DataSource clusterDataSource() {
        HikariConfig hikari = new HikariConfig();
        hikari.setJdbcUrl("jdbc:postgresql://primary-db:5432/finance_db");
        hikari.setUsername(System.getenv("DB_USER"));
        hikari.setPassword(System.getenv("DB_PASS"));
        
        // Optimize session parameters for group commit coalescing
        hikari.addDataSourceProperty("options", 
            "-c synchronous_commit=on " +               // Strict durability
            "-c commit_delay=50 " +                     // Microseconds group commit delay
            "-c commit_siblings=5 " +                   // Min concurrent txs to trigger delay
            "-c wal_writer_delay=10ms");                // Fast background WAL coalescing
            
        hikari.setMaximumPoolSize(128);
        hikari.setMinimumIdle(32);
        return new HikariDataSource(hikari);
    }
}`,
    architectureImpact: {
      en: 'Write throughput soared 8.2x from 3,800 tx/s to 31,500 tx/s with 100% strict durability guarantees. Physical fsync syscalls decreased by 85%. P99 latency plummeted from 450ms down to 4.2ms.',
      vi: 'Thông lượng ghi tăng 8.2 lần từ 3.800 tx/s lên 31.500 tx/s trong khi vẫn duy trì cam kết bền vững tuyệt đối 100%. Số lệnh gọi syscall fsync vật lý giảm 85%. Độ trễ P99 giảm mạnh từ 450ms xuống chỉ còn 4.2ms.'
    }
  }
};
