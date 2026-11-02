import type { DatabaseTopic } from '../types';

export const replicationConsensus: DatabaseTopic = {
  id: 'replication-consensus',
  category: 'distributed-consensus',
  name: 'Database Replication & Consensus Protocols',
  tagline: {
    en: 'High Availability architectures: Physical WAL Streaming vs Logical Replication, Sync vs Async, Replication Lag, Split-Brain Fencing, and Raft consensus automatic failover.',
    vi: 'Kiến trúc tính sẵn sàng cao (HA): Sao chép vật lý WAL Streaming vs Sao chép logic, Đồng bộ vs Bất đồng bộ, Độ trễ sao chép, Chống chia cắt não (Split-Brain) và Đồng thuận Raft.'
  },
  difficulty: 3,
  order: 19,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'A single database server is a single point of failure (SPOF). To survive hardware crashes, data must be replicated to secondary nodes. However, asynchronous replication risks data loss on failover (RPO > 0); synchronous replication slows commits to the speed of the slowest network link; and network partitions trigger catastrophic Split-Brain scenarios where two nodes both believe they are Primary, corrupting data irreversibly.',
      vi: 'Một máy chủ cơ sở dữ liệu đơn lẻ là một điểm lỗi đơn (SPOF). Để vượt qua sự cố phần cứng, dữ liệu bắt buộc phải được sao chép sang các node phụ. Tuy nhiên, sao chép bất đồng bộ tiềm ẩn nguy cơ mất dữ liệu khi chuyển giao dự phòng (RPO > 0); sao chép đồng bộ kéo tụt tốc độ commit về bằng đường truyền mạng chậm nhất; và phân mảnh mạng kích hoạt thảm họa Não Phân Liệt (Split-Brain) khi hai node cùng tưởng mình là Primary, ghi đè làm hỏng dữ liệu vĩnh viễn.'
    },
    hardwareConstraint: {
      en: 'Speed-of-light propagation across datacenters imposes an unavoidable physical latency floor (~1ms per 100km). Synchronous consensus protocols must minimize network round-trip times (RTT) while tolerating unannounced node crashes and transient network partitions without human intervention.',
      vi: 'Tốc độ ánh sáng truyền trong sợi quang qua các trung tâm dữ liệu tạo ra giới hạn vật lý về độ trễ không thể vượt qua (~1ms cho mỗi 100km). Các giao thức đồng thuận bắt buộc phải tối thiểu hóa số lượt truyền tin mạng (RTT) trong khi vẫn phải chịu đựng được sự cố sập node đột ngột và phân mảnh mạng mà không cần can thiệp thủ công.'
    },
    fundamentalSolution: {
      en: 'Modern architectures deploy distributed consensus algorithms (Raft, Multi-Paxos) and state-machine replication. Distributed Consensus Stores (etcd, Consul) coordinate automated leader election via quorum voting (N/2 + 1), enforce strict fencing tokens to isolate rogue primaries, and combine Physical Streaming WAL replication (PostgreSQL) or GTID Binlog replication (MySQL) with semi-synchronous durability.',
      vi: 'Kiến trúc hiện đại triển khai các giải thuật đồng thuận phân tán (Raft, Multi-Paxos) và mô hình máy trạng thái sao chép. Hệ thống lưu trữ đồng thuận phân tán (etcd, Consul) điều phối việc bầu cử Leader tự động qua bỏ phiếu túc số đa số (N/2 + 1), áp dụng thẻ định danh Fencing Token để cô lập node cũ, và kết hợp cơ chế Sao Chép Dòng Dữ Liệu Vật Lý WAL (PostgreSQL) hoặc Sao Chép GTID Binlog (MySQL) với cấp độ bán đồng bộ (Semi-Sync).'
    },
    math: {
      formula: 'Q_{\\text{majority}} = \\left\\lfloor \\frac{N}{2} \\right\\rfloor + 1, \\quad \\text{Fault Tolerance} = F = \\left\\lfloor \\frac{N - 1}{2} \\right\\rfloor',
      description: {
        en: 'A consensus cluster of N nodes requires a strict quorum of floor(N/2) + 1 votes to elect a leader or commit log entries, guaranteeing that any two quorums overlap by at least one node and tolerating up to F node failures.',
        vi: 'Một cụm đồng thuận gồm N node đòi hỏi túc số đa số tuyệt đối floor(N/2) + 1 phiếu để bầu chọn Leader hoặc chốt bản ghi nhật ký, bảo đảm hai nhóm túc số bất kỳ luôn giao nhau tại ít nhất một node và chịu được tối đa F node bị sập cùng lúc.'
      },
      timeComplexity: 'Leader Election: O(Heartbeat_Timeout + 1 RTT); Log Append Consensus: O(1 RTT to majority quorum)',
      spaceComplexity: 'Replication stream storage: O(WAL volume generated during network partition)',
      ioCostFormula: 'Semi-Sync Commit Latency = Local WAL fsync + Max(Network RTT to fastest Quorum Replica)'
    }
  },

  pageLayout: {
    title: {
      en: 'Physical Streaming WAL Replication & Raft Distributed Consensus',
      vi: 'Cơ chế Sao chép Dòng WAL Vật lý & Giao thức Đồng thuận Phân tán Raft'
    },
    description: {
      en: 'Architectural comparison of Physical vs Logical replication, Quorum consensus voting, and Split-Brain fencing tokens.',
      vi: 'So sánh kiến trúc giữa sao chép vật lý và logic, bỏ phiếu đồng thuận túc số và cơ chế Fencing Token chống não phân liệt.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| 3-NODE RAFT CONSENSUS CLUSTER (N = 3, Quorum = 2, Fault Tolerance F = 1): |
+--------------------------------------------------------------------------+
|  PRIMARY (Leader, Node A)       REPLICA (Follower, Node B)   WITNESS (Node C)
|  - WAL LSN: 15400               - WAL LSN: 15400             - Quorum Vote   |
|  - Holds etcd Leader Lease      - Streaming Receiver         - Health Ping   |
+--------------------------------------------------------------------------+
        |                                   ^                        ^
        |--- 1. Send WAL record (LSN 15401)-|                        |
        |--- 2. Replicated to Node B (ACK Received!) ----------------|
        +--- 3. Quorum Reached (2 of 3)! Transaction COMMIT returned! |
+--------------------------------------------------------------------------+
| NETWORK PARTITION & SPLIT-BRAIN FENCING (STONITH):                       |
|                                                                          |
|  [ Partition Cut! ] Node A is isolated from Node B and Node C!           |
|                                                                          |
|  1. Node B & Node C form majority quorum (2 of 3 votes).                 |
|  2. Node B elected NEW Leader with Term = 2 and Fencing Token = 105.      |
|  3. Node A attempts write -> REJECTED: Lease Expired! (STONITH Fenced!)  |
|  4. Zero data corruption; client traffic routed to Node B!                |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'Raft Term', size: '8 Bytes', description: { en: 'Monotonically increasing logical epoch number identifying leader tenure', vi: 'Số thứ tự nhiệm kỳ tăng đơn điệu định danh nhiệm kỳ của Leader' } },
      { name: 'Fencing Token', size: '64-bit Monotonic', description: { en: 'Opaque token passed to storage; stale tokens from demoted leaders are rejected', vi: 'Mã định danh gửi xuống tầng lưu trữ; các token cũ từ leader phế truất sẽ bị từ chối' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Database Replication and Consensus Protocols are the bedrock of enterprise High Availability (HA) and Disaster Recovery (DR). When scaling mission-critical systems, keeping a single database server running is unacceptable. Relational databases solve this via two dimensions: (1) Data Replication Mechanics: Physical Streaming Replication (replaying raw binary WAL byte-for-byte) vs Logical Replication (decoding and replaying SQL/row changes via binlog or logical decoding); and (2) Cluster Consensus & Failover: deploying distributed consensus protocols (Raft, Multi-Paxos via etcd/Consul) to automate leader election, calculate quorums (N/2 + 1), and enforce Split-Brain fencing to eliminate data divergence.',
      vi: 'Cơ chế Sao Chép Dữ Liệu và Giao Thức Đồng Thuận là nền móng của tính Sẵn Sàng Cao (High Availability - HA) và Khắc Phục Thảm Họa (Disaster Recovery - DR). Khi mở rộng các hệ thống trọng yếu, việc chỉ chạy một máy chủ CSDL duy nhất là điều tối kỵ. CSDL quan hệ giải quyết bài toán này trên hai bình diện: (1) Cơ Chế Sao Chép Dữ Liệu: Sao chép Dòng Vật Lý (Streaming Physical Replication - tái hiện nguyên vẹn từng byte nhị phân của WAL) vs Sao chép Logic (giải mã và chạy lại các thay đổi dữ liệu qua binlog hoặc logical decoding); và (2) Đồng Thuận Cụm & Tự Động Chuyển Giao Dự Phòng: triển khai các giao thức đồng thuận (Raft, Multi-Paxos qua etcd/Consul) để tự động bầu cử Leader, tính toán túc số (N/2 + 1), và áp dụng cơ chế Fencing chống thảm họa Não Phân Liệt (Split-Brain).'
    },
    deepDiveParagraphs: [
      {
        en: '1. Physical Streaming Replication vs Logical Replication: (A) Physical Replication (PostgreSQL WAL Streaming, Oracle Data Guard): Secondary nodes read the raw, binary WAL stream directly from the Primary. Physical replication is byte-for-byte identical: indexes, slotted page headers, free space maps, and tuple headers are mirrored identically. It achieves maximum throughput and zero CPU decoding overhead. Downside: secondary nodes must run the exact same major database version and OS architecture, and replicas must be read-only (Hot Standby). (B) Logical Replication (PostgreSQL pgoutput, MySQL Binlog ROW format): The engine decodes WAL records into logical row change events (INSERT into table values (...)). Advantages: cross-version migrations (PG 14 to PG 16), heterogeneous data sync, and multi-tenant selective table filtering. Downside: higher CPU overhead for serialization and decoding.',
        vi: '1. Sao Chép Vật Lý (Physical Streaming) vs Sao Chép Logic (Logical Replication): (A) Sao Chép Vật Lý (PostgreSQL WAL Streaming, Oracle Data Guard): Các node phụ đọc trực tiếp dòng dữ liệu nhị phân thô của file WAL từ node chính. Sao chép vật lý là sự nhân bản chính xác từng byte một: cây index, header slotted page, bản đồ dung lượng và header tuple giống hệt 100%. Tốc độ sao chép đạt mức tối đa và không tốn CPU giải mã. Nhược điểm: các node bắt buộc phải cùng một phiên bản chính và kiến trúc HĐH, và node phụ chỉ được phép đọc (Hot Standby). (B) Sao Chép Logic (PostgreSQL pgoutput, MySQL Binlog dạng ROW): Engine giải mã các bản ghi WAL thành sự kiện thay đổi dòng (INSERT bảng với giá trị...). Ưu điểm: cho phép nâng cấp phiên bản không gián đoạn (từ PG 14 lên PG 16), đồng bộ dữ liệu giữa các hệ thống khác nhau và lọc chọn lọc từng bảng. Nhược điểm: tốn nhiều CPU để tuần tự hóa và giải mã dữ liệu.'
      },
      {
        en: '2. Replication Modes: Asynchronous, Synchronous & Semi-Synchronous: (1) Asynchronous Replication: Primary commits locally and immediately returns success to the client before sending the WAL to replicas. Maximal write throughput, but if the Primary crashes before WAL is transmitted, data committed to users is LOST forever (RPO > 0)! (2) Fully Synchronous Replication: Primary blocks until ALL secondary replicas have written the WAL to disk and called fsync(). Guarantees RPO = 0, but if one replica experiences a 2-second network hiccup, all client writes database-wide are frozen! (3) Semi-Synchronous / Quorum Synchronous: Primary commits once the WAL has been received and acknowledged by at least ONE (or a majority quorum of) secondary replicas. This delivers zero-data-loss RPO=0 while isolating client writes from slow or dead individual replicas.',
        vi: '2. Các Chế Độ Sao Chép: Bất Đồng Bộ, Đồng Bộ & Bán Đồng Bộ: (1) Bất Đồng Bộ (Asynchronous): Node chính commit cục bộ và trả về thành công ngay lập tức cho khách hàng trước khi gửi WAL sang replica. Tốc độ ghi tối đa, nhưng nếu node chính bị sập trước khi kịp truyền WAL qua mạng, dữ liệu người dùng vừa nhận được sẽ bị MẤT VĨNH VIỄN (RPO > 0)! (2) Đồng Bộ Hoàn Toàn (Fully Synchronous): Node chính bị phong tỏa chờ đợi cho tới khi TẤT CẢ các replica đã ghi WAL xuống đĩa và gọi fsync(). Bảo đảm RPO = 0, nhưng chỉ cần một replica bị chập chờn mạng 2 giây là toàn bộ hệ thống CSDL bị đứng hình! (3) Bán Đồng Bộ / Đồng Bộ Túc Số (Semi-Synchronous / Quorum): Node chính chỉ cần nhận được xác nhận (ACK) từ ít nhất MỘT (hoặc túc số đa số) replica là trả về thành công cho khách. Mô hình này vừa bảo đảm an toàn dữ liệu RPO = 0 vừa cô lập hệ thống khỏi các replica bị chậm hoặc bị sập.'
      },
      {
        en: '3. Replication Lag & Stale Reads: In asynchronous configurations, secondary replicas constantly trail behind the Primary (Replication Lag measured in bytes or milliseconds). If an application executes an UPDATE on Primary and immediately issues a subsequent SELECT on a read-replica, the user experiences Stale Reads (e.g. money deducted from balance, but balance still shows old amount!). Solutions: (1) Read-Your-Own-Writes Session Pinning: route queries from recently mutating users to the Primary for 5 seconds; (2) Monotonic LSN Tracking: clients pass their last committed LSN in an HTTP header, and the replica waits for its replay LSN to catch up before answering.',
        vi: '3. Độ Trễ Sao Chép (Replication Lag) & Hiện Tượng Đọc Dữ Liệu Cũ (Stale Reads): Trong cấu hình bất đồng bộ, các node phụ luôn chạy chậm hơn node chính một khoảng (gọi là Replication Lag đo bằng byte hoặc mili-giây). Nếu ứng dụng chạy lệnh UPDATE trên node chính rồi ngay lập tức đọc dữ liệu bằng câu SELECT trên node phụ, người dùng sẽ đọc phải dữ liệu cũ (ví dụ: tài khoản đã trừ tiền nhưng số dư hiển thị vẫn còn nguyên!). Giải pháp: (1) Cơ chế Ghim Phiên Đọc-Ghi (Read-Your-Own-Writes): ghim các truy vấn của người vừa thực hiện ghi về node chính trong vòng 5 giây; (2) Theo dõi LSN tăng dần: ứng dụng gửi kèm mã LSN vừa commit trong header HTTP, và replica sẽ hoãn trả lời cho tới khi nó chạy đuổi kịp mốc LSN đó.'
      },
      {
        en: '4. The Split-Brain Catastrophe & Fencing Tokens (STONITH): What happens during a network partition where the network cable between Datacenter 1 (Primary) and Datacenter 2 (Replica) is cut? If Datacenter 2 mistakenly assumes the Primary died and promotes the replica to Primary, BOTH nodes now accept writes! This is Split-Brain: clients write diverging data to both sides, corrupting the database beyond repair. How modern HA prevents Split-Brain: (1) Quorum Voting: A replica can ONLY promote itself if it receives votes from a majority of nodes (N/2 + 1). An isolated primary finds itself in the minority partition and immediately steps down! (2) Fencing Tokens: The consensus engine (etcd) issues a monotonically increasing token (e.g. Token #105) on promotion. Storage backends reject any write carrying an older token. (3) STONITH (Shoot The Other Node In The Head): Power Distribution Units (PDU) physically cut power to the old primary before promoting the replica.',
        vi: '4. Thảm Họa Não Phân Liệt (Split-Brain) & Cơ Chế Fencing (STONITH): Điều gì xảy ra khi đường cáp quang giữa Trung tâm dữ liệu 1 (Node chính) và Trung tâm dữ liệu 2 (Node phụ) bị đứt? Nếu Node phụ lầm tưởng Node chính đã chết và tự thăng cấp lên làm Primary, CẢ HAI MÁY CHỦ SẼ CÙNG NHẬN GHI! Đây chính là thảm họa Não Phân Liệt (Split-Brain): dữ liệu bị phân kỳ rẽ nhánh trên cả hai cụm, làm hỏng cấu trúc dữ liệu không thể cứu vãn. Cách phòng chống triệt để: (1) Bỏ phiếu Túc số Đa số (Quorum): Một replica CHỈ ĐƯỢC PHÉP thăng cấp nếu nó xin được phiếu bầu từ đa số các node (N/2 + 1). Node chính bị cô lập ở phân vùng thiểu số sẽ tự động thoái vị! (2) Thẻ Định Danh Fencing Token: Hệ thống đồng thuận (etcd) cấp một mã token tăng đơn điệu (như Token #105) khi thăng cấp. Tầng lưu trữ sẽ từ chối mọi yêu cầu ghi mang token cũ. (3) STONITH (Shoot The Other Node In The Head): Cắt nguồn điện vật lý của node chính cũ qua bộ điều khiển nguồn PDU trước khi cho phép node mới hoạt động.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Deploying an even number of consensus nodes (e.g., 2 nodes or 4 nodes): In a 2-node cluster, Quorum = floor(2/2) + 1 = 2 votes. If a single network link hiccups, NEITHER node can form a majority, causing complete cluster paralysis! A consensus cluster MUST ALWAYS deploy an odd number of voting nodes (3, 5, or 7).',
        vi: 'Cài đặt số lượng node chẵn trong cụm đồng thuận (như 2 node hoặc 4 node): Trong cụm 2 node, túc số yêu cầu là floor(2/2) + 1 = 2 phiếu. Chỉ cần mạng chập chờn một chút là KHÔNG NODE NÀO có đủ 2 phiếu để làm Leader, làm tê liệt toàn bộ hệ thống! Một cụm đồng thuận BẮT BUỘC PHẢI triển khai số lượng node lẻ (3, 5 hoặc 7 node).'
      },
      {
        en: 'Unbounded Replication Slots consuming all disk space: In PostgreSQL, if a replication slot is created for an offline read-replica or CDC worker (Debezium) and the subscriber disconnects, PostgreSQL retains ALL WAL files on disk indefinitely waiting for it. The primary database runs out of disk storage and crashes hard. Solution: Configure max_slot_wal_keep_size.',
        vi: 'Lỗ hổng Replication Slot Không Giới Hạn Làm Đầy Ổ Cứng: Trong PostgreSQL, nếu tạo một replication slot cho replica hoặc luồng CDC (Debezium) rồi dịch vụ đó bị ngắt kết nối, Postgres sẽ giữ lại TOÀN BỘ các file WAL trên đĩa vô thời hạn để chờ nó. Ổ cứng của node chính sẽ bị đầy 100% dung lượng và sập nguồn. Giải pháp: Luôn cấu hình giới hạn max_slot_wal_keep_size.'
      },
      {
        en: 'Cascading Failover Storms caused by aggressive heartbeat timeouts: Configuring failover detection timeouts too low (e.g., 1 second) causes transient JVM garbage collection pauses or minor network latency spikes to trigger accidental, repetitive failover thrashing across nodes.',
        vi: 'Bão Chuyển Giao Dự Phòng Liên Tục Do Cấu Hình Heartbeat Quá Gắt: Đặt thời gian timeout phát hiện sự cố quá ngắn (như 1 giây) sẽ khiến các đợt tạm dừng dọn rác Java GC hoặc chập chờn mạng nhỏ kích hoạt thăng cấp và hạ cấp node liên tục, làm gián đoạn hệ thống.'
      }
    ]
  },

  steps: [
    {
      id: 'wal-stream',
      title: { en: 'Physical WAL Stream Transmission', vi: 'Truyền phát Dòng Dữ liệu WAL Vật lý' },
      phase: 'Step 1: Ingestion & Transmission',
      description: {
        en: 'Primary walsender process streams binary WAL byte records over TCP socket to replica walreceiver.',
        vi: 'Tiến trình walsender trên Primary truyền các bản ghi WAL nhị phân qua kết nối TCP tới walreceiver trên Replica.'
      },
      diskIoBehavior: { en: 'Sequential WAL read on Primary; sequential write to replica standby WAL.', vi: 'Đọc WAL tuần tự trên Primary; ghi WAL tuần tự trên Replica.' },
      javaCodeLineMatch: 'replicationLink.streamWalBytes(currentLsn, walPayload);'
    },
    {
      id: 'quorum-ack',
      title: { en: 'Quorum Majority Acknowledgment (Semi-Sync)', vi: 'Xác nhận Túc số Đa số (Bán đồng bộ)' },
      phase: 'Step 2: Consensus Check',
      description: {
        en: 'Replica flushes WAL to storage and sends back FlushLSN ACK; Primary verifies Quorum (N/2 + 1).',
        vi: 'Replica xả WAL xuống đĩa và gửi lại ACK FlushLSN; Primary xác nhận đã đủ túc số đa số.'
      },
      diskIoBehavior: { en: 'Replica executes fsync() on standby WAL before returning ACK.', vi: 'Replica thực thi lệnh fsync() trên file WAL trước khi trả về ACK.' },
      javaCodeLineMatch: 'if (quorumTracker.hasMajorityAck(commitLsn)) return commitSuccess();'
    },
    {
      id: 'failover-fence',
      title: { en: 'Automated Failover & Split-Brain Fencing', vi: 'Chuyển giao Tự động & Chống Não Phân Liệt' },
      phase: 'Step 3: High Availability Protection',
      description: {
        en: 'On primary crash, DCS (Raft) elects new leader with incremented term; demotes old primary via fencing token.',
        vi: 'Khi Primary sập, cụm Raft bầu Leader mới với nhiệm kỳ tăng dần; cô lập Primary cũ bằng Fencing Token.'
      },
      diskIoBehavior: { en: 'Promoted replica exits recovery mode and opens database for client writes.', vi: 'Replica được thăng cấp thoát khỏi chế độ phục hồi và mở cổng nhận lệnh ghi.' },
      javaCodeLineMatch: 'raftCluster.electNewLeaderAndFenceOldPrimary();'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL + Patroni HA',
      implementationName: 'Physical Streaming Replication with etcd DCS',
      keyMechanism: {
        en: 'PostgreSQL streaming physical replication managed by Patroni using etcd (Raft) for DCS consensus. Guarantees zero split-brain and automated failover in < 15 seconds.',
        vi: 'Sao chép vật lý PostgreSQL được quản lý bởi Patroni sử dụng etcd (Raft) để đồng thuận cụm. Bảo đảm chống não phân liệt và chuyển giao dự phòng tự động dưới 15 giây.'
      },
      defaultTuningConfig: 'synchronous_commit = remote_apply, synchronous_standby_names = "FIRST 1 (node2, node3)"',
      architectureNote: {
        en: 'Setting synchronous_commit = remote_apply ensures that transactions are not only flushed on the replica, but also applied into memory, eliminating stale read lag completely.',
        vi: 'Thiết lập synchronous_commit = remote_apply bảo đảm dữ liệu không chỉ được xả xuống đĩa trên replica mà còn được nạp vào RAM, triệt tiêu hoàn toàn hiện tượng đọc trễ dữ liệu cũ.'
      }
    },
    {
      engine: 'MySQL Group Replication (MGR)',
      implementationName: 'Paxos Consensus & Global Transaction Identifiers (GTID)',
      keyMechanism: {
        en: 'MySQL native Paxos-based replication (MGR). Transactions coordinate via atomic broadcast; certified transactions are applied asynchronously across all members.',
        vi: 'Cơ chế sao chép dựa trên Paxos tích hợp sẵn trong MySQL (MGR). Các giao dịch được điều phối qua phát thanh nguyên tử và chứng thực xung đột trước khi commit.'
      },
      defaultTuningConfig: 'plugin-load-add = group_replication.so, group_replication_single_primary_mode = ON',
      architectureNote: {
        en: 'GTIDs (Global Transaction Identifiers) assign a globally unique UUID:Sequence to every transaction, allowing secondary nodes to switch replication sources seamlessly without log offset recalculation.',
        vi: 'GTID gắn một mã định danh duy nhất toàn cầu cho mỗi giao dịch, giúp các node phụ có thể đổi nguồn sao chép sang máy chủ khác mà không cần tính lại vị trí con trỏ file log.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Data Guard & Active Data Guard',
      implementationName: 'Synchronous Redo Transport & Fast-Start Failover (FSFO)',
      keyMechanism: {
        en: 'Oracle Data Guard provides Maximum Protection (zero data loss, synchronous redo shipping via NSS background process), Maximum Availability, and Maximum Performance. Active Data Guard enables read-only queries and offloaded reporting on standby instances while real-time redo apply continues. Fast-Start Failover (FSFO) with an independent Observer daemon automatically executes zero-data-loss failover in < 30 seconds.',
        vi: 'Oracle Data Guard cung cấp các chế độ Maximum Protection (không mất dữ liệu, gửi redo đồng bộ qua tiến trình NSS), Maximum Availability và Maximum Performance. Active Data Guard cho phép chạy truy vấn đọc và báo cáo trên máy chủ dự phòng standby trong khi tiến trình Redo Apply vẫn cập nhật thời gian thực. Cơ chế Fast-Start Failover (FSFO) kết hợp Observer độc lập tự động chuyển giao dự phòng trong dưới 30 giây khi máy chủ chính gặp sự cố.'
      },
      defaultTuningConfig: "ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=standby_db SYNC AFFIRM VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE)';",
      architectureNote: {
        en: 'Active Data Guard offloads 100% of read-only analytical workloads from the primary database while guaranteeing transactional consistency.',
        vi: 'Active Data Guard san sẻ 100% tải truy vấn đọc và phân tích ra khỏi máy chủ chính trong khi vẫn bảo đảm tuyệt đối tính nhất quán của dữ liệu.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Physical streaming replication delivers microsecond replication latencies with minimal CPU consumption.', vi: 'Sao chép vật lý mang lại độ trễ micro-giây siêu tốc với mức tiêu thụ CPU tối thiểu.' },
      { en: 'Raft consensus guarantees automated zero-downtime failover with mathematical protection against Split-Brain.', vi: 'Đồng thuận Raft bảo đảm chuyển giao dự phòng tự động với sự bảo vệ toán học chống thảm họa não phân liệt.' }
    ],
    cons: [
      { en: 'Synchronous replication increases commit latency by the physical network round-trip time (RTT).', vi: 'Sao chép đồng bộ làm tăng độ trễ commit thêm một khoảng thời gian truyền gói tin mạng (RTT).' },
      { en: 'Asynchronous read-replicas suffer replication lag, requiring application-level session pinning to avoid stale reads.', vi: 'Replica đọc bất đồng bộ bị trễ dữ liệu, đòi hỏi ứng dụng phải ghim phiên để chống đọc dữ liệu cũ.' }
    ],
    writeAmplification: {
      en: 'Low: Streaming replication transmits existing binary WAL records directly over TCP sockets without rewriting data.',
      vi: 'Thấp: Sao chép dòng truyền thẳng các bản ghi WAL nhị phân có sẵn qua socket TCP mà không cần ghi lại dữ liệu.'
    },
    recoveryGuarantee: {
      en: 'Quorum synchronous replication guarantees 100% Zero Data Loss (RPO = 0) even across catastrophic datacenter destruction.',
      vi: 'Sao chép đồng bộ túc số bảo đảm tuyệt đối không mất dữ liệu (RPO = 0) ngay cả khi một trung tâm dữ liệu bị phá hủy hoàn toàn.'
    }
  },

  springBootCode: `package com.enterprise.database.ha;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Enterprise Demonstration:
 * Read/Write Splitting with Session Pinning to Prevent Stale Reads on Replicas.
 */
@Component
public class ReadWriteSplittingManager implements CommandLineRunner {

    private final JdbcTemplate primaryJdbcTemplate;
    private final JdbcTemplate replicaJdbcTemplate;

    public ReadWriteSplittingManager(JdbcTemplate primaryJdbcTemplate, JdbcTemplate replicaJdbcTemplate) {
        this.primaryJdbcTemplate = primaryJdbcTemplate;
        this.replicaJdbcTemplate = replicaJdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // Step 1: Write transaction MUST ALWAYS execute on Primary
        String insertSql = "INSERT INTO user_wallets (user_id, balance) VALUES (?, ?)";
        primaryJdbcTemplate.update(insertSql, 10542, 2500.0);
        System.out.println("Wallet updated on PRIMARY database.");

        // Step 2: Read-Your-Own-Writes Pattern
        // If user recently mutated data within the last 5 seconds, query Primary directly!
        boolean userMutatedRecently = true;
        JdbcTemplate targetDb = userMutatedRecently ? primaryJdbcTemplate : replicaJdbcTemplate;

        String selectSql = "SELECT balance FROM user_wallets WHERE user_id = ?";
        Double balance = targetDb.queryForObject(selectSql, Double.class, 10542);

        System.out.printf("Queried balance ($%.2f) from %s (Zero stale read guaranteed!)%n",
            balance, userMutatedRecently ? "PRIMARY" : "REPLICA");
    }
}`,

  sqlQueries: `-- 1. Inspect PostgreSQL Physical Streaming Replication Lag
SELECT 
    client_addr AS replica_ip,
    application_name,
    state,
    sync_state,
    sync_priority,
    pg_wal_lsn_diff(pg_current_wal_lsn(), sent_lsn) AS send_lag_bytes,
    pg_wal_lsn_diff(sent_lsn, write_lsn) AS write_lag_bytes,
    pg_wal_lsn_diff(write_lsn, flush_lsn) AS flush_lag_bytes,
    pg_wal_lsn_diff(flush_lsn, replay_lsn) AS replay_lag_bytes
FROM pg_stat_replication;

-- 2. Check Standby Replica Recovery Status
SELECT 
    pg_is_in_recovery() AS is_replica,
    pg_last_wal_receive_lsn() AS received_lsn,
    pg_last_wal_replay_lsn() AS replayed_lsn,
    pg_last_xact_replay_timestamp() AS last_replay_time;

-- 3. Configure Quorum Synchronous Standby in postgresql.conf
-- Guarantees RPO = 0: Commit returns ONLY after at least 1 replica flushes WAL!
-- synchronous_standby_names = 'ANY 1 (standby_node1, standby_node2)'
-- synchronous_commit = on`,

  productionProblemCase: {
    title: {
      en: 'The $3.2M Split-Brain Catastrophe: Dual-Primary Writing Corrupts 45,000 Bank Accounts',
      vi: 'Thảm Họa Não Phân Liệt $3.2M: Hai Node Cùng Nhận Ghi Làm Hỏng Dữ Liệu 45.000 Tài Khoản'
    },
    businessContext: {
      en: 'A commercial retail bank operates a dual-datacenter High Availability architecture with a Primary database in Hanoi and a Standby replica in Ho Chi Minh City connected via a dedicated optical fiber line.',
      vi: 'Ngân hàng thương mại vận hành kiến trúc tính sẵn sàng cao trên hai trung tâm dữ liệu với máy chủ Primary tại Hà Nội và Standby replica tại TP. Hồ Chí Minh kết nối bằng đường cáp quang chuyên dụng.'
    },
    problemDescription: {
      en: 'At 10:15 AM, an accidental road construction trench cut the dedicated fiber cable connecting the two datacenters. Because the automated failover monitor was deployed solely inside the HCMC datacenter without a third-party quorum witness, the HCMC monitor declared the Hanoi Primary "dead". It promoted the HCMC standby replica to Primary! However, the Hanoi Primary was alive and continued processing transactions from Northern branches. For 42 minutes until network restoration, BOTH databases operated simultaneously as independent Primaries! Over 45,000 customers deposited and withdrew money on divergent database nodes. When the network reconnected, WAL streams collided with irreconcilable LSN divergence; transactions could not be merged; and the bank was forced into a 3-day emergency branch shutdown with $3.2 million in manual reconciliation losses.',
      vi: 'Vào lúc 10h15 sáng, một vụ đào đường thi công vô tình làm đứt tuyến cáp quang kết nối giữa hai miền. Do hệ thống giám sát tự động chuyển giao chỉ được cài đặt cục bộ tại TP.HCM mà không có node túc số thứ ba làm chứng (Witness), phần mềm giám sát TP.HCM tự động kết luận node Hà Nội đã chết. Nó lập tức thăng cấp replica TP.HCM lên làm Primary! Tuy nhiên, máy chủ Hà Nội vẫn hoàn toàn khỏe mạnh và tiếp tục nhận các giao dịch từ các chi nhánh miền Bắc. Suốt 42 phút cho tới khi nối lại mạng, CẢ HAI MÁY CHỦ CÙNG HOẠT ĐỘNG NHƯ HAI PRIMARY ĐỘC LẬP! Hơn 45.000 khách hàng đã nạp và rút tiền trên hai cơ sở dữ liệu bị phân kỳ. Khi mạng thông trở lại, hai dòng WAL đâm sầm vào nhau với số LSN xung đột không thể gộp; các giao dịch bị rẽ nhánh hoàn toàn; và ngân hàng buộc phải đóng cửa toàn bộ hệ thống suốt 3 ngày để đối soát thủ công với thiệt hại 3.2 triệu USD.'
    },
    whyNaiveFails: {
      en: 'Deploying a 2-node cluster without a 3rd quorum witness makes it mathematically impossible to distinguish a dead primary from a network partition; both sides assume the other is dead and promote themselves.',
      vi: 'Triển khai cụm 2 node mà không có node thứ 3 làm chứng khiến hệ thống về mặt toán học không thể phân biệt được giữa máy chủ bị chết thật hay chỉ bị đứt cáp mạng; cả hai bên đều nghĩ bên kia đã chết và tự thăng cấp mình.'
    },
    coreSolution: {
      en: '1. Re-architect the cluster into a 3-Node Raft Consensus Topology using Patroni and etcd: Deploy Node 1 (Hanoi), Node 2 (HCMC), and Node 3 as a lightweight Cloud Witness in a neutral third cloud region (AWS/Da Nang). 2. Enforce Strict Quorum Rule (floor(3/2) + 1 = 2 votes required to promote). When the fiber line cut, Hanoi had 1 node (Minority -> stepped down immediately to Read-Only), while HCMC + Cloud Witness formed 2 nodes (Majority Quorum -> promoted safely). 3. Implement STONITH hardware fencing tokens: storage arrays reject any write from an un-leased leader. Result: Automated failover executes in 8 seconds with zero data divergence, zero split-brain, and 100% transactional safety.',
      vi: '1. Tái cấu trúc cụm theo Mô Hình Đồng Thuận Raft 3 Node dùng Patroni và etcd: Triển khai Node 1 (Hà Nội), Node 2 (TP.HCM) và Node 3 làm Chứng (Cloud Witness) tại một vùng đám mây trung lập thứ ba (AWS/Đà Nẵng). 2. Bắt buộc Tuân thủ Luật Túc Số Đa Số (cần ít nhất 2/3 phiếu để thăng cấp). Khi đứt cáp quang, Hà Nội chỉ có 1 node (Thiểu số -> tự động thoái vị về chế độ Read-Only), trong khi TP.HCM + Cloud Witness có đủ 2 phiếu (Đa số -> thăng cấp an toàn). 3. Áp dụng thẻ định danh Fencing Token: tầng lưu trữ từ chối mọi yêu cầu ghi từ node không còn giữ quyền Leader. Kết quả: Chuyển giao dự phòng tự động diễn ra an toàn trong đúng 8 giây mà tuyệt đối không bao giờ xảy ra thảm họa não phân liệt.'
    },
    architectureImpact: {
      en: 'High Availability is not achieved by having two database servers; it requires strict majority quorums (N/2 + 1) and fencing mechanisms to guarantee that only one Primary can ever exist.',
      vi: 'Tính Sẵn Sàng Cao không thể đạt được chỉ bằng việc đặt 2 máy chủ CSDL; nó đòi hỏi túc số đa số nghiêm ngặt (N/2 + 1) và cơ chế Fencing để bảo đảm trong mọi tình huống chỉ có DUY NHẤT MỘT Primary được phép tồn tại.'
    }
  },

  javaCode: `package com.database.internals.consensus;

import java.util.*;

/**
 * Pure Java 21 implementation of Raft Consensus Quorum Voting & Split-Brain Prevention.
 */
public class RaftConsensusCluster {

    public record Node(String id, String region, boolean isAlive) {}

    public static class ClusterCoordinator {
        private final List<Node> nodes;
        private String currentLeader;
        private long currentTerm = 1;

        public ClusterCoordinator(List<Node> nodes) {
            this.nodes = new ArrayList<>(nodes);
            this.currentLeader = nodes.getFirst().id();
        }

        // Raft Majority Quorum Formula: floor(N / 2) + 1
        public int getRequiredQuorum() {
            return (nodes.size() / 2) + 1;
        }

        // Simulate Network Partition: nodesInPartition represents the visible nodes
        public boolean attemptLeaderPromotion(String candidateId, Set<String> visibleNodeIds) {
            int votes = 0;
            for (var node : nodes) {
                if (visibleNodeIds.contains(node.id()) && node.isAlive()) {
                    votes++;
                }
            }

            int requiredQuorum = getRequiredQuorum();
            System.out.printf("  Candidate [%s] received %d votes. (Quorum Required: %d of %d)%n",
                candidateId, votes, requiredQuorum, nodes.size());

            if (votes >= requiredQuorum) {
                this.currentTerm++;
                this.currentLeader = candidateId;
                System.out.printf("  -> PROMOTION SUCCESS! [%s] is NEW LEADER for Term %d!%n", candidateId, currentTerm);
                return true;
            } else {
                System.out.printf("  -> PROMOTION REJECTED! Minority partition cannot form quorum. Split-Brain PREVENTED!%n");
                return false;
            }
        }
    }

    public static void main(String[] args) {
        // Deploying a 3-Node Resilient Topology (Hanoi, HCMC, Da Nang Cloud Witness)
        var nodes = List.of(
            new Node("node-hanoi",   "Hanoi",   true),
            new Node("node-hcmc",    "HCMC",    true),
            new Node("node-witness", "DaNang",  true)
        );

        ClusterCoordinator cluster = new ClusterCoordinator(nodes);
        System.out.println("Cluster initialized with 3 nodes. Required Quorum: " + cluster.getRequiredQuorum() + " votes.");

        System.out.println("\n=== SCENARIO: Network Cut isolates Hanoi from HCMC and Witness ===");
        // Partition 1: Hanoi node is completely isolated alone
        System.out.println("Partition 1 (Isolated Hanoi):");
        boolean hanoiSuccess = cluster.attemptLeaderPromotion("node-hanoi", Set.of("node-hanoi"));

        // Partition 2: HCMC can see Da Nang Cloud Witness (2 nodes)
        System.out.println("\nPartition 2 (HCMC + Da Nang Witness):");
        boolean hcmcSuccess = cluster.attemptLeaderPromotion("node-hcmc", Set.of("node-hcmc", "node-witness"));

        System.out.println("\n=== Result: HCMC promoted legally via 2/3 Quorum. Zero Split-Brain! ===");
    }
}
`
};
