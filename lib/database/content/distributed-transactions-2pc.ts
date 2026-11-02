import type { DatabaseTopic } from '../types';

export const distributedTransactions2pc: DatabaseTopic = {
  id: 'distributed-transactions-2pc',
  category: 'distributed-consensus',
  name: 'Distributed Transactions, 2PC & Saga Patterns',
  tagline: {
    en: 'Navigating atomicity across network boundaries: Two-Phase Commit (2PC), the Coordinator Blocking problem, XA/JTA, the Saga Pattern, and Transactional Outbox with CDC.',
    vi: 'Chinh phục tính nguyên tử xuyên biên giới mạng: Giao thức Hai Pha (2PC), Vấn đề Treo Coordinator, Chuẩn XA/JTA, Mô hình Saga và Hộp thư đi Transactional Outbox với CDC.'
  },
  difficulty: 3,
  order: 20,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      en: 'In modern microservices and distributed database architectures, a single business transaction (e.g. e-commerce checkout) spans multiple independent database instances (Order DB, Payment DB, Inventory DB). Traditional single-node ACID guarantees fail across network boundaries: if Payment succeeds but Inventory fails, money is stolen unless an all-or-nothing distributed protocol coordinates them.',
      vi: 'Trong kiến trúc microservices và CSDL phân tán hiện đại, một giao dịch nghiệp vụ (như thanh toán giỏ hàng) nằm rải rác trên nhiều máy chủ CSDL độc lập (CSDL Đơn hàng, CSDL Thanh toán, CSDL Kho vận). Các cam kết ACID đơn node truyền thống bị vô hiệu hóa qua ranh giới mạng: nếu trừ tiền thành công nhưng trừ kho thất bại, khách hàng bị mất tiền oan trừ khi có một giao thức phân tán bảo đảm tính toàn vẹn hoặc được tất cả hoặc không có gì.'
    },
    hardwareConstraint: {
      en: 'The FLP Impossibility Theorem (Fischer, Lynch, Paterson, 1985) mathematically proves that in an asynchronous network, no deterministic consensus protocol can guarantee both safety and liveness in the presence of even a single unannounced node crash. Latency spikes and network partitions turn synchronous coordination into a system-wide blocking hazard.',
      vi: 'Định lý Bất khả thi FLP (Fischer, Lynch, Paterson, 1985) đã chứng minh bằng toán học rằng trong một mạng bất đồng bộ, không có giao thức đồng thuận nào có thể vừa bảo đảm tính an toàn vừa bảo đảm tính phản hồi nếu có dù chỉ một node bị sập đột ngột. Sự tăng vọt độ trễ và phân mảnh mạng biến cơ chế điều phối đồng bộ thành mối nguy treo nghẽn toàn bộ hệ thống.'
    },
    fundamentalSolution: {
      en: 'Engineers solve distributed atomicity through two architectural paradigms: (1) Synchronous Atomic Commitment via Two-Phase Commit (2PC / XA): A central Coordinator conducts a voting PREPARE phase followed by a COMMIT phase. (2) Asynchronous Eventual Consistency via the Saga Pattern (Orchestration or Choreography with compensating transactions) paired with the Transactional Outbox Pattern and Change Data Capture (Debezium/Kafka) to guarantee at-least-once message delivery without blocking locks.',
      vi: 'Kỹ sư giải quyết bài toán nguyên tử phân tán qua hai trường phái kiến trúc: (1) Cam Kết Nguyên Tử Đồng Bộ qua Giao Thức Hai Pha (Two-Phase Commit - 2PC / XA): Điều phối viên (Coordinator) tổ chức bỏ phiếu ở Pha Chuẩn Bị (PREPARE) rồi mới ra lệnh ở Pha Chốt (COMMIT). (2) Nhất Quán Cuối Cùng Bất Đồng Bộ qua Mô Hình Saga (Điều phối Orchestration hoặc Biên đạo Choreography với các giao dịch bù trừ) kết hợp Mẫu Hộp Thư Đi (Transactional Outbox) và CDC (Debezium/Kafka) để bảo đảm thông điệp được chuyển giao không cần khóa giữ tài nguyên.'
    },
    math: {
      formula: 'P(\\text{Commit}) = \\prod_{i=1}^{N} P(\\text{Vote}_i = \\text{YES}), \\quad T_{2\\text{PC}} = 2 \\times \\text{RTT} + 2 \\times T_{\\text{fsync}}',
      description: {
        en: 'A 2PC transaction commits if and only if EVERY participating cohort votes YES. If even a single cohort votes NO or times out, the entire global transaction aborts. Minimum latency incurs 2 network Round Trip Times (RTT) plus 2 local disk fsync operations per participant.',
        vi: 'Một giao dịch 2PC chỉ commit khi và chỉ khi TẤT CẢ các bên tham gia cùng bỏ phiếu ĐỒNG Ý (YES). Chỉ cần một bên bỏ phiếu NO hoặc bị timeout, toàn bộ giao dịch toàn cục sẽ bị hủy bỏ. Độ trễ tối thiểu tốn 2 lượt truyền tin mạng khứ hồi (RTT) cộng với 2 lần gọi fsync đĩa cục bộ cho mỗi node.'
      },
      timeComplexity: '2PC Phase 1 (Prepare): 1 RTT + 1 fsync; 2PC Phase 2 (Commit): 1 RTT + 1 fsync; Saga: N independent local transactions',
      spaceComplexity: 'Coordinator state machine log + Participant in-doubt prepared locks held in RAM/disk',
      ioCostFormula: '2PC Total Latency = 2 × Max(Network RTT to slowest cohort) + 2 × Local WAL fsync'
    }
  },

  pageLayout: {
    title: {
      en: 'Two-Phase Commit (2PC) vs Saga Orchestration Architecture',
      vi: 'Kiến trúc Giao thức Hai Pha (2PC) vs Điều phối Saga Phân tán'
    },
    description: {
      en: 'Workflow comparison between synchronous locking 2PC and asynchronous compensating Sagas with the Transactional Outbox pattern.',
      vi: 'So sánh luồng hoạt động giữa cơ chế khóa giữ đồng bộ 2PC và mô hình giao dịch bù trừ bất đồng bộ Saga kết hợp Transactional Outbox.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| 1. TWO-PHASE COMMIT (2PC / XA) PROTOCOL:                                  |
|                                                                          |
|  COORDINATOR                  PARTICIPANT A (Order DB)  PARTICIPANT B (Pay DB)
|       |                              |                        |          |
|       |--- 1. PREPARE -------------->|                        |          |
|       |--- 1. PREPARE --------------------------------------->|          |
|       |                              |                        |          |
|       |<-- VOTE YES (Holds Row Lock)-|                        |          |
|       |<-- VOTE YES (Holds Row Lock)--------------------------|          |
|       |                                                                  |
|       +--- [ All Voted YES! Coordinator logs COMMIT to disk ]            |
|       |                                                                  |
|       |--- 2. GLOBAL COMMIT -------->| (Applies mutation)     |          |
|       |--- 2. GLOBAL COMMIT --------------------------------->| (Applies)|
|       |                              | (Releases Row Lock)    | (Release)|
+--------------------------------------------------------------------------+
| THE 2PC BLOCKING PROBLEM:                                                |
|  If Coordinator CRASHES after Prepare phase:                             |
|  -> Participants are left IN-DOUBT! They CANNOT commit or abort!         |
|  -> Row Locks are held INDEFINITELY, blocking other transactions!        |
+--------------------------------------------------------------------------+
| 2. SAGA PATTERN + TRANSACTIONAL OUTBOX WITH CDC (Debezium):              |
|                                                                          |
|  [ Order Service ] --(Single Local ACID Tx)--> [ Orders Table ]          |
|                                            --> [ Outbox Table ]          |
|                                                       |                  |
|                                                (Debezium CDC tail WAL)   |
|                                                       v                  |
|                                                [ Apache Kafka ]          |
|                                                       |                  |
|                                            (At-Least-Once Delivery)      |
|                                                       v                  |
|                                              [ Payment Service ]         |
|                                              (Applies Local Tx or Compen)|
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'XID / GlobalTxID', size: '16 Bytes', description: { en: 'Globally unique transaction identifier linking cohort participants in XA', vi: 'Mã định danh giao dịch toàn cục liên kết các bên tham gia trong chuẩn XA' } },
      { name: 'Compensating Tx', size: 'Application Logic', description: { en: 'Explicit reverse action (e.g. Refund Payment) undoing committed partial Saga step', vi: 'Hành động đảo ngược tường minh (như Hoàn tiền) để hoàn tác một bước Saga đã commit' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Distributed Transactions represent one of the hardest challenges in software engineering. When monolithic applications are decomposed into microservices or distributed partitioned databases (CockroachDB, TiDB, YugabyteDB), single-node database ACID transactions can no longer guarantee cross-service consistency. Systems must navigate the fundamental trade-off between strict synchronous atomicity via the Two-Phase Commit (2PC) protocol (which suffers from severe coordinator blocking and high latency) versus asynchronous eventual consistency via the Saga Pattern paired with the Transactional Outbox Pattern and Change Data Capture (CDC).',
      vi: 'Giao Dịch Phân Tán (Distributed Transactions) là một trong những thử thách hóc búa nhất trong kỹ thuật phần mềm. Khi kiến trúc nguyên khối được chia nhỏ thành các microservices hoặc các hệ CSDL phân tán mở rộng ngang (CockroachDB, TiDB, YugabyteDB), các giao dịch ACID đơn máy không còn khả năng bảo đảm tính nhất quán xuyên suốt các dịch vụ. Hệ thống buộc phải đối mặt với sự đánh đổi cốt lõi giữa: tính nguyên tử đồng bộ tuyệt đối qua Giao Thức Hai Pha (Two-Phase Commit - 2PC) (vốn chịu độ trễ cao và nguy cơ treo nghẽn tài nguyên) đối đầu với sự nhất quán cuối cùng bất đồng bộ qua Mô Hình Saga kết hợp Mẫu Hộp Thư Đi (Transactional Outbox) và Change Data Capture (CDC).'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Two-Phase Commit (2PC) Protocol: Formulated by Jim Gray in 1978 and formalized in the X/Open XA standard, 2PC operates across two discrete phases: (1) Phase 1 (Prepare): The Coordinator sends a PREPARE message to all cohorts. Each cohort starts a local transaction, writes the update and undo/redo information to its local WAL, calls fsync(), acquires all necessary row locks, and replies with VOTE_COMMIT (YES) or VOTE_ABORT (NO). (2) Phase 2 (Commit): If ALL cohorts vote YES, the Coordinator writes a COMMIT record to its own WAL and sends GLOBAL_COMMIT to all participants. Each participant applies the change, releases its locks, and replies ACK. If even a single cohort voted NO or timed out, the Coordinator sends GLOBAL_ABORT, rolling back all participants.',
        vi: '1. Giao Thức Hai Pha (Two-Phase Commit - 2PC): Được Jim Gray công bố năm 1978 và chuẩn hóa trong tiêu chuẩn X/Open XA, 2PC vận hành qua hai pha tuần tự: (1) Pha 1 (Chuẩn Bị - Prepare): Điều phối viên (Coordinator) gửi thông điệp PREPARE tới tất cả các bên tham gia (Cohorts). Mỗi bên mở một transaction cục bộ, ghi các thay đổi vào WAL cục bộ, gọi lệnh fsync(), giữ toàn bộ các khóa dòng (Row Locks) cần thiết, rồi phản hồi VOTE_COMMIT (Đồng ý) hoặc VOTE_ABORT (Từ chối). (2) Pha 2 (Chốt - Commit): Nếu TẤT CẢ các bên cùng bỏ phiếu YES, Coordinator ghi mốc COMMIT vào WAL của chính nó và phát lệnh GLOBAL_COMMIT tới tất cả các bên. Từng bên chốt dữ liệu, nhả khóa dòng và gửi ACK. Chỉ cần có một bên bỏ phiếu NO hoặc bị timeout mạng, Coordinator sẽ phát lệnh GLOBAL_ABORT để rollback toàn bộ.'
      },
      {
        en: '2. The 2PC Blocking Failure Problem & Distributed Deadlocks: Why is 2PC avoided in high-throughput cloud microservices? The catastrophic Achilles heel of 2PC is that it is a BLOCKING protocol. If the Coordinator crashes after participants vote YES in Phase 1 but before sending Phase 2 decisions, the participants enter an "In-Doubt" state. Because a participant cannot know whether other participants committed or aborted, it CANNOT unilaterally abort or commit! It must hold all transactional row locks indefinitely, blocking all other incoming transactions across the enterprise. Furthermore, acquiring distributed locks in arbitrary orders across network nodes causes Distributed Deadlocks, where circular wait-for dependencies span multiple independent server instances, requiring distributed cycle-detection algorithms to resolve.',
        vi: '2. Vấn Đề Treo Cứng Của 2PC (Blocking Problem) & Deadlock Phân Tán: Tại sao 2PC bị né tránh trong các hệ thống microservices đám mây thông lượng cao? Gót chân Asin chí mạng của 2PC là tính chất TREO CỨNG (Blocking Protocol). Nếu Coordinator bị sập nguồn ngay sau khi các bên bỏ phiếu YES ở Pha 1 nhưng trước khi kịp phát lệnh Pha 2, các bên tham gia sẽ rơi vào trạng thái "Lấp Lửng" (In-Doubt State). Vì một node không thể tự biết các node khác đã commit hay abort, nó TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP tự ý commit hay rollback! Nó buộc phải giữ toàn bộ các khóa dòng (Row Locks) vô thời hạn, chặn đứng mọi giao dịch khác trong toàn doanh nghiệp. Thêm vào đó, việc xin khóa trên nhiều server khác nhau qua mạng sinh ra Deadlock Phân Tán, nơi đồ thị chờ khóa tạo thành chu trình xuyên qua nhiều máy chủ độc lập.'
      },
      {
        en: '3. The Saga Pattern (Orchestration vs Choreography): Modern distributed systems trade strict ACID atomicity for eventual consistency using Sagas (Hector Garcia-Molina, 1987). A Saga is a sequence of local transactions (T1, T2, ... Tn). Each local transaction updates its own database and emits an event or message. If a step fails (e.g. T3 fails due to insufficient inventory), the Saga executes Compensating Transactions in reverse order (C2, C1) to undo previous committed actions (e.g., refunding payment). Sagas are implemented via: (A) Choreography: Services react to each others events asynchronously without a central coordinator; or (B) Orchestration: A centralized Saga Orchestrator state machine (Temporal, Camunda, or custom orchestrator) explicitly directs each service which step and compensating action to take.',
        vi: '3. Mô Hình Saga (Điều Phối Orchestration vs Biên Đạo Choreography): Các hệ thống hiện đại chấp nhận từ bỏ tính nguyên tử ACID tức thời để đổi lấy tính nhất quán cuối cùng bằng mô hình Saga (Hector Garcia-Molina, 1987). Một Saga là một chuỗi các giao dịch cục bộ độc lập (T1, T2... Tn). Mỗi bước cập nhật CSDL của chính nó và phát ra một sự kiện hoặc thông điệp. Nếu một bước bị thất bại (như bước T3 bị lỗi do hết hàng), Saga sẽ kích hoạt các Giao Dịch Bù Trừ (Compensating Transactions) theo thứ tự ngược lại (C2, C1) để hoàn tác các hành động đã lỡ commit trước đó (như hoàn tiền vào ví). Saga được triển khai qua 2 dạng: (A) Biên đạo (Choreography): Các service tự lắng nghe sự kiện của nhau qua Message Broker; hoặc (B) Điều phối (Orchestration): Một máy trạng thái Saga Orchestrator trung tâm (Temporal, Camunda) chỉ đạo cụ thể từng service phải chạy bước nào hoặc bù trừ bước nào.'
      },
      {
        en: '4. The Transactional Outbox Pattern & CDC (Debezium): How do you guarantee that a database update and an event publication to Apache Kafka happen atomically without 2PC? If you update the database and then call kafkaProducer.send(), a server crash between the two lines drops the message! The solution is the Transactional Outbox Pattern: (1) The application writes business data AND inserts an event record into an outbox table inside a SINGLE local ACID database transaction (INSERT INTO orders ...; INSERT INTO outbox_events ...); (2) A Change Data Capture (CDC) engine like Debezium continuously tails the database physical WAL stream, reading committed outbox events and streaming them to Apache Kafka with guaranteed At-Least-Once delivery; (3) Consumers implement Idempotency (deduplication via unique Message IDs) to achieve effective Exactly-Once processing.',
        vi: '4. Mẫu Hộp Thư Đi (Transactional Outbox) & CDC (Debezium): Làm thế nào bảo đảm việc cập nhật CSDL và bắn tin nhắn lên Apache Kafka diễn ra nguyên tử mà không cần 2PC? Nếu bạn cập nhật CSDL rồi mới gọi lệnh kafkaProducer.send(), máy chủ bị sập đúng giữa 2 dòng code đó sẽ làm thất lạc tin nhắn vĩnh viễn! Giải pháp chuẩn công nghiệp là Mẫu Hộp Thư Đi (Transactional Outbox Pattern): (1) Ứng dụng ghi dữ liệu nghiệp vụ VÀ chèn một bản ghi sự kiện vào bảng outbox trong CÙNG MỘT transaction ACID cục bộ duy nhất; (2) Công cụ Change Data Capture (CDC) như Debezium liên tục đọc trực tiếp dòng dữ liệu WAL của database, nhặt các sự kiện outbox đã commit và đẩy lên Kafka với cam kết chuyển giao At-Least-Once; (3) Các dịch vụ tiêu thụ (Consumers) áp dụng cơ chế Lũy Đẳng (Idempotency qua Message ID) để đạt được kết quả Xử lý Chính xác Một lần (Exactly-Once).'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Using Two-Phase Commit (XA) across high-latency public WAN networks: Running 2PC across geographic regions (e.g., US to Europe) increases commit latency to 250+ milliseconds. Because participants hold row locks for the entire duration, transaction throughput drops by 95% and lock queues explode.',
        vi: 'Sử dụng Giao Thức 2PC (XA) Qua Mạng Internet Diện Rộng (WAN): Chạy 2PC giữa các vùng địa lý cách xa nhau (như Mỹ và Châu Âu) đẩy độ trễ commit lên hơn 250ms. Do các node phải giữ khóa dòng trong suốt thời gian này, thông lượng toàn hệ thống tụt dốc 95% và các hàng đợi khóa bùng nổ.'
      },
      {
        en: 'Semantic anomalies in Sagas: The Lack of Isolation (The "I" in ACID): Unlike 2PC which holds locks, Sagas commit local transactions immediately. Between the time T1 commits and compensating transaction C1 executes, intermediate dirty state is visible to other concurrent users (e.g. balance is temporarily 0, causing a concurrent transfer to fail). Mitigation: Design compensating actions with semantic re-reads and pessimistic balance reservations.',
        vi: 'Dị thường Ngữ nghĩa trong Saga: Thiếu Tính Cách Ly (Chữ "I" trong ACID): Khác với 2PC giữ khóa liên tục, Saga cho phép commit các transaction cục bộ ngay lập tức. Giữa khoảng thời gian bước T1 đã commit và bước bù trừ C1 được kích hoạt, dữ liệu trung gian bị phơi bày cho người dùng khác đọc được (như số dư tạm thời về 0 khiến một lệnh rút tiền khác bị từ chối oan). Giải pháp: Thiết kế các bước bù trừ có kiểm tra lại trạng thái hoặc sử dụng cơ chế giữ chỗ trước (Reservation).'
      },
      {
        en: 'Non-idempotent consumers in Kafka Saga Choreography: Network retries or partition rebalances deliver duplicate events to consumers. If a payment service processes a "Deduct Balance" event twice, customer funds are deducted twice! Solution: Always enforce an Idempotent Consumer table recording processed message IDs.',
        vi: 'Consumer Không Có Tính Lũy Đẳng Trong Saga Biên Đạo: Sự cố chập chờn mạng hoặc rebalance phân vùng Kafka sẽ chuyển giao các sự kiện trùng lặp. Nếu dịch vụ thanh toán xử lý sự kiện "Trừ tiền" 2 lần, tiền của khách sẽ bị trừ gấp đôi! Giải pháp: Bắt buộc duy trì bảng Idempotent Consumer lưu vết các Message ID đã xử lý.'
      }
    ]
  },

  steps: [
    {
      id: '2pc-prepare',
      title: { en: 'Phase 1: Voting PREPARE & In-Doubt Lock', vi: 'Pha 1: Bỏ phiếu PREPARE & Khóa Chờ' },
      phase: '2PC Phase 1',
      description: {
        en: 'Coordinator sends PREPARE; participants write undo/redo WAL, acquire row locks, and vote YES.',
        vi: 'Coordinator gửi PREPARE; các bên ghi nhật ký WAL, giữ khóa dòng và phản hồi bỏ phiếu YES.'
      },
      diskIoBehavior: { en: 'Participants execute fsync() on local WAL before replying.', vi: 'Các bên thực thi lệnh fsync() trên file WAL cục bộ trước khi trả lời.' },
      javaCodeLineMatch: 'boolean allVotedYes = coordinator.sendPrepareToAllCohorts(globalTxId);'
    },
    {
      id: '2pc-commit',
      title: { en: 'Phase 2: Global Decision & Lock Release', vi: 'Pha 2: Quyết định Toàn cục & Giải phóng Khóa' },
      phase: '2PC Phase 2',
      description: {
        en: 'Coordinator writes COMMIT record to durable log and broadcasts GLOBAL_COMMIT; participants release locks.',
        vi: 'Coordinator ghi mốc COMMIT vào nhật ký và phát lệnh GLOBAL_COMMIT; các bên nhả khóa dòng.'
      },
      diskIoBehavior: { en: 'Coordinator fsync() on coordinator log, followed by participant final commits.', vi: 'Coordinator gọi fsync() trên log điều phối, tiếp nối bởi commit cuối cùng của các bên.' },
      javaCodeLineMatch: 'coordinator.broadcastGlobalCommit(globalTxId);'
    },
    {
      id: 'saga-outbox',
      title: { en: 'Saga Compensating Action & Outbox CDC Stream', vi: 'Bù trừ Saga & Dòng Dữ liệu Outbox CDC' },
      phase: 'Eventual Consistency Phase',
      description: {
        en: 'Decoupled atomicity via local transaction inserting into outbox table; CDC streams event to Kafka without locking.',
        vi: 'Tính nguyên tử phi tập trung qua transaction cục bộ ghi vào bảng outbox; CDC truyền sự kiện lên Kafka không khóa.'
      },
      diskIoBehavior: { en: '100% single local database transaction; zero network locks held.', vi: '100% là một transaction cục bộ duy nhất; hoàn toàn không giữ khóa qua mạng.' },
      javaCodeLineMatch: 'outboxRepository.save(new OutboxEvent(aggregateId, eventPayload));'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Prepared Transactions (2PC)',
      implementationName: 'PREPARE TRANSACTION & COMMIT PREPARED',
      keyMechanism: {
        en: 'Native SQL commands PREPARE TRANSACTION "tx_123" and COMMIT PREPARED "tx_123". State is persisted across server crashes in pg_twophase directory.',
        vi: 'Các câu lệnh SQL gốc PREPARE TRANSACTION và COMMIT PREPARED. Trạng thái giao dịch chờ được lưu bền vững qua sự cố sập nguồn trong thư mục pg_twophase.'
      },
      defaultTuningConfig: 'max_prepared_transactions = 100',
      architectureNote: {
        en: 'By default, max_prepared_transactions = 0 (disabled). If enabled, uncommitted prepared transactions survive server reboots and hold locks until explicitly resolved via COMMIT PREPARED.',
        vi: 'Mặc định max_prepared_transactions = 0 (bị tắt). Nếu bật, các giao dịch đã prepare chưa commit sẽ sống qua cả các lần reboot máy chủ và giữ khóa cho tới khi được giải quyết rõ ràng.'
      }
    },
    {
      engine: 'Debezium + Apache Kafka CDC',
      implementationName: 'WAL-Based Transactional Outbox CDC Pipeline',
      keyMechanism: {
        en: 'Reads PostgreSQL logical replication stream (pgoutput) or MySQL binlog to tail outbox tables, guaranteeing zero-data-loss at-least-once event publication.',
        vi: 'Đọc dòng sao chép logic của PostgreSQL hoặc binlog MySQL để bắt các thay đổi trong bảng outbox, bảo đảm phát sự kiện lên Kafka với cam kết At-Least-Once.'
      },
      defaultTuningConfig: 'tombstones.on.delete = false, poll.interval.ms = 100',
      architectureNote: {
        en: 'Eliminates dual-write vulnerabilities: writing to DB and Kafka in application code can fail, but tailing WAL ensures events only publish if DB transaction commits.',
        vi: 'Triệt tiêu lỗ hổng ghi hai đầu (Dual-Write): ghi vào DB và Kafka trong code có thể lỗi giữa chừng, nhưng đọc từ WAL bảo đảm sự kiện chỉ được phát đi khi DB đã commit thành công.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Two-Phase Commit',
      implementationName: 'Database Links, RECO Background Process & In-Doubt Resolution',
      keyMechanism: {
        en: 'Oracle provides enterprise Two-Phase Commit across remote databases via Database Links. The RECO (Recoverer) background process automatically monitors and resolves in-doubt distributed transactions, consulting the global transaction table (DBA_2PC_PENDING) to automatically commit or abort orphaned transactions after network partition recovery.',
        vi: 'Oracle cung cấp cơ chế Two-Phase Commit qua liên kết CSDL Database Links. Tiến trình ngầm RECO (Recoverer) tự động giám sát và giải quyết các giao dịch phân tán bị treo (in-doubt transactions), đọc bảng DBA_2PC_PENDING để tự động commit hoặc rollback các giao dịch mồ côi ngay khi sự cố phân mảnh mạng được khắc phục.'
      },
      defaultTuningConfig: "ALTER SYSTEM SET DISTRIBUTED_TRANSACTIONS = 100 SCOPE=SPFILE; COMMIT FORCE 'tx_id';",
      architectureNote: {
        en: 'Supports manual emergency resolution via COMMIT FORCE or ROLLBACK FORCE when remote coordinators are permanently lost.',
        vi: 'Cho phép can thiệp khẩn cấp bằng lệnh COMMIT FORCE hoặc ROLLBACK FORCE khi node điều phối ở xa bị phá hủy hoàn toàn.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: '2PC provides strict immediate ACID consistency across multiple databases with zero intermediate state visibility.', vi: '2PC mang lại tính nhất quán ACID tức thời tuyệt đối trên nhiều CSDL mà không làm lộ dữ liệu trung gian.' },
      { en: 'The Saga + Outbox pattern eliminates distributed blocking locks, enabling massive linear horizontal scalability.', vi: 'Mô hình Saga + Outbox triệt tiêu các khóa chờ phân tán, cho phép hệ thống mở rộng quy mô ngang tuyến tính.' }
    ],
    cons: [
      { en: '2PC is a blocking protocol; coordinator failures leave database locks orphaned indefinitely.', vi: '2PC là giao thức treo cứng; sự cố sập Coordinator khiến các khóa dòng bị giữ vô thời hạn.' },
      { en: 'Sagas lack isolation (ACID I); compensating actions must be explicitly designed and tested for business failures.', vi: 'Saga không có tính cách ly (Isolation); các hành động bù trừ phải được thiết kế và kiểm thử công phu.' }
    ],
    writeAmplification: {
      en: 'High in 2PC: Requires double WAL writes (Prepare log + Commit log) on both Coordinator and every participant.',
      vi: 'Cao trong 2PC: Đòi hỏi ghi WAL 2 lần (log Prepare + log Commit) trên cả Coordinator và toàn bộ các bên tham gia.'
    },
    recoveryGuarantee: {
      en: '2PC persists prepared state in pg_twophase disk files; Saga relies on Kafka message persistence and idempotent replay.',
      vi: '2PC lưu trạng thái prepared trong thư mục pg_twophase; Saga dựa trên tính bền vững của Kafka và khả năng chạy lại lũy đẳng.'
    }
  },

  springBootCode: `package com.enterprise.database.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Enterprise Implementation of the Transactional Outbox Pattern:
 * Solves Distributed Atomicity WITHOUT 2PC blocking locks!
 */
@Entity
@Table(name = "outbox_events")
public class OutboxEvent {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable = false)
    private String aggregateType;

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public OutboxEvent() {}
    public OutboxEvent(String aggregateType, String aggregateId, String payload) {
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}

@Service
public class OrderCheckoutService {
    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public OrderCheckoutService(OrderRepository orderRepo, OutboxRepository outboxRepo, ObjectMapper mapper) {
        this.orderRepository = orderRepo;
        this.outboxRepository = outboxRepo;
        this.objectMapper = mapper;
    }

    // 100% Single Local Database Transaction!
    // Both the Order record and the Outbox Event are committed atomically in the same WAL block!
    @Transactional
    public void checkoutOrder(Long customerId, Double totalAmount) throws Exception {
        // Step 1: Insert business order
        Order order = new Order(customerId, totalAmount, "CREATED");
        orderRepository.save(order);

        // Step 2: Insert outbox event for Debezium CDC to stream to Kafka
        String eventPayload = objectMapper.writeValueAsString(new OrderCreatedEvent(order.getId(), totalAmount));
        OutboxEvent outboxEvent = new OutboxEvent("ORDER", order.getId().toString(), eventPayload);
        outboxRepository.save(outboxEvent);

        // NO 2PC distributed locks held! Zero coordinator blocking failure!
    }

    public record OrderCreatedEvent(Long orderId, Double amount) {}
}`,

  sqlQueries: `-- 1. Native PostgreSQL Two-Phase Commit (2PC) Commands
-- Step 1: Begin transaction on Participant A
BEGIN;
UPDATE orders SET status = 'PROCESSING' WHERE id = 1001;
-- Prepare the transaction (persists undo/redo to pg_twophase disk blocks)
PREPARE TRANSACTION 'global_tx_order_1001';

-- Step 2: Inspect Active In-Doubt Prepared Transactions
SELECT 
    gid AS global_transaction_id, 
    prepared, 
    owner, 
    database 
FROM pg_prepared_xacts;

-- Step 3: Phase 2 Decision (Executed by Coordinator)
-- If all participants succeeded:
COMMIT PREPARED 'global_tx_order_1001';
-- OR if any participant failed:
-- ROLLBACK PREPARED 'global_tx_order_1001';

-- 2. Transactional Outbox Pattern Schema for Debezium CDC
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debezium CDC captures rows from WAL stream using logical replication slot:
-- SELECT * FROM pg_create_logical_replication_slot('debezium_slot', 'pgoutput');`,

  productionProblemCase: {
    title: {
      en: 'The Friday Afternoon In-Doubt Lockout: XA Coordinator Crash Paralyzes Order Processing',
      vi: 'Cơn Ác Mộng Khóa Lấp Lửng Chiều Thứ 6: Coordinator XA Sập Nguồn Làm Tê Liệt Đặt Hàng'
    },
    businessContext: {
      en: 'A high-volume travel reservation platform processes cross-database reservations (Flight DB + Hotel DB + Car Rental DB) using an enterprise Java EE application server with JTA / XA Two-Phase Commit.',
      vi: 'Nền tảng đặt vé du lịch xử lý các giao dịch đặt phòng xuyên cơ sở dữ liệu (CSDL Vé máy bay + CSDL Khách sạn + CSDL Thuê xe) sử dụng máy chủ ứng dụng Java EE với cơ chế JTA / XA Two-Phase Commit.'
    },
    problemDescription: {
      en: 'During peak booking on Friday afternoon, the Java application server acting as the 2PC XA Coordinator experienced an out-of-memory kernel panic and rebooted abruptly. The crash occurred precisely between Phase 1 and Phase 2 of 2PC: 1,400 concurrent transactions had already executed PREPARE TRANSACTION on the Flight and Hotel databases. When the Coordinator died, the databases were left stranded in the "In-Doubt" state! Because the cohorts did not know the final decision, PostgreSQL held exclusive row locks on 1,400 flight seats and hotel rooms. Worse, new incoming customer reservations attempting to query or book those seats were immediately blocked in the lock manager queue! Within 12 minutes, the entire platform connection pool exhausted, and booking was completely paralyzed across the enterprise.',
      vi: 'Vào giờ cao điểm đặt phòng chiều thứ Sáu, máy chủ ứng dụng Java đóng vai trò 2PC XA Coordinator bị sập nguồn đột ngột do tràn bộ nhớ OOM. Sự cố sập diễn ra đúng vào thời khắc giữa Pha 1 và Pha 2 của 2PC: 1.400 giao dịch đồng thời vừa thực thi xong lệnh PREPARE TRANSACTION trên cả CSDL Vé máy bay và Khách sạn. Khi Coordinator chết, các CSDL bị bỏ rơi trong trạng thái "Lấp Lửng" (In-Doubt State)! Do không nhận được quyết định cuối cùng, PostgreSQL buộc phải duy trì khóa độc quyền trên 1.400 ghế máy bay và phòng khách sạn. Nghiêm trọng hơn, các khách hàng mới cố gắng đặt chỗ ngay sau đó bị chặn đứng trong hàng đợi khóa! Chỉ trong 12 phút, toàn bộ connection pool của hệ thống cạn kiệt và việc đặt phòng trên toàn quốc bị tê liệt hoàn toàn.'
    },
    whyNaiveFails: {
      en: 'Restarting the database servers did NOT release the locks! Because PostgreSQL 2PC persists prepared transactions to disk in the pg_twophase directory, restarting the server reloaded the prepared state and immediately re-acquired the row locks upon reboot!',
      vi: 'Khởi động lại các máy chủ cơ sở dữ liệu KHÔNG HỀ giải phóng được khóa! Do cơ chế 2PC của PostgreSQL lưu bền vững trạng thái prepared ra đĩa trong thư mục pg_twophase, việc reboot máy chủ chỉ làm hệ thống nạp lại trạng thái cũ và tái lập lại các khóa dòng ngay lập tức!'
    },
    coreSolution: {
      en: '1. Emergency resolution: Queried pg_prepared_xacts and executed manual ROLLBACK PREPARED for all 1,400 stranded global transaction IDs, immediately releasing row locks and restoring booking traffic. 2. Architectural transformation: Rip out synchronous XA / 2PC entirely! Replace with the Saga Pattern using Orchestration: Each service executes a local ACID transaction. 3. Deploy the Transactional Outbox Pattern with Debezium CDC and Apache Kafka: Events are committed into an outbox table within the local transaction, and CDC tails the WAL to publish messages to Kafka asynchronously with zero distributed locks. Result: Global blocking coordinator failure risk dropped to 0%, checkout latency dropped from 280ms to 12ms, and booking throughput scaled 15x.',
      vi: '1. Xử lý sự cố khẩn cấp: Truy vấn bảng pg_prepared_xacts và chạy lệnh ROLLBACK PREPARED thủ công cho toàn bộ 1.400 mã giao dịch toàn cục bị kẹt, lập tức giải phóng toàn bộ khóa dòng và mở lại luồng đặt vé. 2. Chuyển đổi kiến trúc toàn diện: Loại bỏ hoàn toàn cơ chế đồng bộ XA / 2PC! Thay thế bằng Mô hình Saga có Điều phối (Orchestration): Mỗi dịch vụ tự quản lý transaction ACID cục bộ. 3. Cài đặt Mẫu Hộp Thư Đi (Transactional Outbox Pattern) với Debezium CDC và Apache Kafka: Sự kiện được ghi vào bảng outbox trong cùng transaction cục bộ, và Debezium đọc WAL để phát tin lên Kafka một cách bất đồng bộ không cần khóa phân tán. Kết quả: Rủi ro treo cứng do Coordinator giảm về 0%, độ trễ đặt hàng giảm từ 280ms xuống còn 12ms, và thông lượng phục vụ tăng gấp 15 lần.'
    },
    architectureImpact: {
      en: 'Synchronous 2PC creates catastrophic availability coupling across services; modern high-scale distributed architectures mandate asynchronous eventual consistency via Sagas and Transactional Outbox CDC.',
      vi: 'Cơ chế 2PC đồng bộ tạo ra sự phụ thuộc sẵn sàng thảm họa giữa các dịch vụ; các kiến trúc phân tán quy mô lớn hiện đại bắt buộc phải chuyển sang tính nhất quán cuối cùng bất đồng bộ qua Saga và Transactional Outbox CDC.'
    }
  },

  javaCode: `package com.database.internals.twopc;

import java.util.*;

/**
 * Pure Java 21 demonstration of Two-Phase Commit (2PC) Protocol
 * vs Asynchronous Saga Compensating Workflow.
 */
public class DistributedTransactionCoordinator {

    public interface Cohort {
        String getName();
        boolean prepare(String txId);
        void commit(String txId);
        void rollback(String txId);
    }

    public static class DatabaseCohort implements Cohort {
        private final String name;
        private final boolean simulateFailure;

        public DatabaseCohort(String name, boolean simulateFailure) {
            this.name = name;
            this.simulateFailure = simulateFailure;
        }

        @Override public String getName() { return name; }

        @Override
        public boolean prepare(String txId) {
            if (simulateFailure) {
                System.out.printf("  [%s] Vote: NO (Resource unavailable)%n", name);
                return false;
            }
            System.out.printf("  [%s] Vote: YES (Row lock held, WAL fsynced)%n", name);
            return true;
        }

        @Override
        public void commit(String txId) {
            System.out.printf("  [%s] Global Commit Applied! Locks released.%n", name);
        }

        @Override
        public void rollback(String txId) {
            System.out.printf("  [%s] Rollback Executed. Locks released.%n", name);
        }
    }

    public static class TwoPhaseCoordinator {
        public boolean execute2PC(String txId, List<Cohort> cohorts) {
            System.out.printf("--- Executing 2PC Transaction: %s ---%n", txId);
            System.out.println("PHASE 1: PREPARE");

            boolean allVotedYes = true;
            for (var cohort : cohorts) {
                if (!cohort.prepare(txId)) {
                    allVotedYes = false;
                }
            }

            System.out.println("\nPHASE 2: DECISION");
            if (allVotedYes) {
                System.out.println("Decision: GLOBAL COMMIT");
                for (var cohort : cohorts) {
                    cohort.commit(txId);
                }
                return true;
            } else {
                System.out.println("Decision: GLOBAL ABORT (One or more cohorts voted NO)");
                for (var cohort : cohorts) {
                    cohort.rollback(txId);
                }
                return false;
            }
        }
    }

    public static void main(String[] args) {
        TwoPhaseCoordinator coordinator = new TwoPhaseCoordinator();

        // Scenario 1: All cohorts succeed
        var cohortsSuccess = List.of(
            new DatabaseCohort("Order_DB", false),
            new DatabaseCohort("Payment_DB", false),
            new DatabaseCohort("Inventory_DB", false)
        );
        coordinator.execute2PC("TX_SUCCESS_101", cohortsSuccess);

        System.out.println();

        // Scenario 2: Inventory fails -> entire 2PC rolls back
        var cohortsFailure = List.of(
            new DatabaseCohort("Order_DB", false),
            new DatabaseCohort("Payment_DB", false),
            new DatabaseCohort("Inventory_DB", true) // Fails!
        );
        coordinator.execute2PC("TX_FAIL_102", cohortsFailure);
    }
}
`
};
