export type ModuleStatus = 'available' | 'development' | 'upcoming';

export interface LearningModule {
  id: string;
  name: string;
  category: { en: string; vi: string };
  tagline: { en: string; vi: string };
  description: { en: string; vi: string };
  badgeText: { en: string; vi: string };
  status: ModuleStatus;
  accent: string;
  accentSoft: string;
  accentBg: string;
  accentBorder: string;
  href: string;
  topicsCount: number;
  roadmapPhase: number;
  estimatedDate: { en: string; vi: string };
  highlights: { en: string[]; vi: string[] };
  upcomingFeatures: { en: string[]; vi: string[] };
}

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'java-core',
    name: 'Java Core & JVM Internals',
    category: { en: 'Language Runtime & Systems', vi: 'Hạ tầng Ngôn ngữ & JVM' },
    tagline: {
      en: 'Primitives vs References, String Pool, JVM memory layout, synchronized lock inflation, AQS, and Virtual Threads.',
      vi: 'Biến nguyên thủy vs Tham chiếu, String Pool, bộ nhớ JVM, nâng cấp khóa Monitor, AQS và Virtual Threads.'
    },
    description: {
      en: 'Master low-level Java mechanics: Stack vs Heap, String immutability, OOP vtable dispatch, 64-bit object mark word, JMM happens-before, G1/ZGC, and Loom virtual threads.',
      vi: 'Làm chủ cơ chế tầng sâu của Java: Stack vs Heap, tính bất biến String, bảng vtable OOP, 64-bit Object Mark Word, rào cản JMM happens-before, thu gom rác G1/ZGC và Virtual Threads.'
    },
    badgeText: {
      en: 'Available Now · 21 Core Topics',
      vi: 'Sẵn sàng học · 21 Chuyên đề cốt lõi'
    },
    status: 'available',
    accent: '#e11d48',
    accentSoft: '#fecdd3',
    accentBg: 'rgba(225, 29, 72, 0.08)',
    accentBorder: 'rgba(225, 29, 72, 0.45)',
    href: '/java-core',
    topicsCount: 21,
    roadmapPhase: 1,
    estimatedDate: { en: 'Completed (Phase 1)', vi: 'Đã hoàn thành (Giai đoạn 1)' },
    highlights: {
      en: [
        'Fundamentals: JDK/JRE/JVM, HashCode & Equals, OOP Pillars, Collections, Modern Java 8-21',
        'Multithreading Core: Thread Lifecycle, Concurrency Hazards, Lock-Free CAS, ThreadPools',
        'JVM Memory Architecture: TLAB Eden allocation, Scavenge GC, Metaspace, Stack Frames',
        'HotSpot Synchronized Lock Inflation: Biased -> Thin CAS on Stack -> Heavyweight Monitor',
        'Java 21 Virtual Threads: Continuation unpark & Carrier OS Thread multiplexing',
        'AbstractQueuedSynchronizer (AQS) state FIFO wait queue & LockSupport.park/unpark',
        'Collections Internals: HashMap bitwise treeification & ConcurrentHashMap ForwardingNode',
        'Level Switcher [All | Fundamentals | Advanced] + FAANG Technical Interview Q&As'
      ],
      vi: [
        'Nền tảng Cốt lõi: JDK/JRE/JVM, Khế ước HashCode & Equals, 4 Trụ Cột OOP, Collections, Java 8-21',
        'Cốt lõi Đa luồng: Vòng đời Thread, Lỗi Concurrency, Vòng lặp CAS phi khóa, ThreadPoolExecutor',
        'Kiến trúc bộ nhớ JVM: Cấp phát TLAB Eden, Dọn dẹp Scavenge GC, Metaspace, Stack Frames',
        'Nâng cấp khóa Synchronized: Biased -> Khóa nhẹ CAS trên Stack -> Monitor hệ điều hành',
        'Virtual Threads Java 21: Đóng băng Continuation & Ghép kênh lên Carrier OS Thread',
        'Bản chất AQS: Biến trạng thái nguyên tử volatile & Hàng đợi chờ FIFO',
        'Bản chất Cấu trúc Dữ liệu: Cây hóa bitwise HashMap & ConcurrentHashMap ForwardingNode',
        'Nút chuyển cấp độ [Tất cả | Cơ bản | Nâng cao] + Bộ câu hỏi Phỏng vấn FAANG chuyên sâu'
      ]
    },
    upcomingFeatures: {
      en: [
        'Interactive Bytecode Stack Machine simulator',
        'JOL (Java Object Layout) byte inspector'
      ],
      vi: ['Mô phỏng máy ảo Bytecode Stack Machine', 'Trình soi byte nhị phân đối tượng JOL']
    }
  },
  {
    id: 'design-patterns',
    name: 'Design Patterns (GoF)',
    category: { en: 'Architecture & OOP', vi: 'Kiến trúc & Hướng đối tượng' },
    tagline: {
      en: 'The 23 Gang of Four patterns with step-by-step SVG choreographies and production Java.',
      vi: '23 mẫu thiết kế kinh điển với sơ đồ động SVG từng bước và mã nguồn Java thực tế.'
    },
    description: {
      en: 'Master Creational, Structural, and Behavioral patterns through choreographed vector animations that highlight real code execution line-by-line.',
      vi: 'Làm chủ các mẫu Khởi tạo, Cấu trúc và Hành vi qua sơ đồ chuyển động trực quan, đồng bộ từng dòng code chạy thực tế.'
    },
    badgeText: {
      en: 'Available Now · 23 Patterns',
      vi: 'Sẵn sàng học · 23 Patterns'
    },
    status: 'available',
    accent: '#e85d04',
    accentSoft: '#fbd0b0',
    accentBg: 'rgba(232, 93, 4, 0.08)',
    accentBorder: 'rgba(232, 93, 4, 0.45)',
    href: '/design-systems',
    topicsCount: 23,
    roadmapPhase: 2,
    estimatedDate: { en: 'Completed (Phase 2)', vi: 'Đã hoàn thành (Giai đoạn 2)' },
    highlights: {
      en: [
        'Creational: Singleton, Factory Method, Builder, Prototype...',
        'Structural: Adapter, Decorator, Proxy, Composite, Facade...',
        'Behavioral: Observer, Strategy, Chain of Responsibility, Command...'
      ],
      vi: [
        'Khởi tạo: Singleton, Factory Method, Builder, Prototype...',
        'Cấu trúc: Adapter, Decorator, Proxy, Composite, Facade...',
        'Hành vi: Observer, Strategy, Chain of Responsibility, Command...'
      ]
    },
    upcomingFeatures: {
      en: ['Interactive Canvas Playground', 'Standard vs Advanced Java toggle'],
      vi: ['Khu vực mô phỏng tương tác Playground', 'So sánh Java Tiêu chuẩn vs Nâng cao']
    }
  },
  {
    id: 'database-internals',
    name: 'Database Internals & Storage',
    category: { en: 'Data Engineering & Storage', vi: 'Hạ tầng Dữ liệu & Lưu trữ' },
    tagline: {
      en: 'B-Tree traversal, LSM-Tree compaction, MVCC concurrency, and write-ahead logs (WAL).',
      vi: 'Duyệt cây B-Tree, nén dữ liệu LSM-Tree, đồng thời MVCC và ghi nhật ký WAL.'
    },
    description: {
      en: 'Visualize disk-to-memory block caching, page splitting, transaction isolation anomalies, and hash sharding topology.',
      vi: 'Trực quan hóa cơ chế lưu trang bộ nhớ/ổ đĩa, phân tách nút B-Tree, cấp độ cô lập giao dịch và phân mảnh sharding.'
    },
    badgeText: {
      en: 'Available Now · 12 Core Engines',
      vi: 'Sẵn sàng học · 12 Kiến trúc cốt lõi'
    },
    status: 'available',
    accent: '#0284c7',
    accentSoft: '#bae6fd',
    accentBg: 'rgba(2, 132, 199, 0.08)',
    accentBorder: 'rgba(2, 132, 199, 0.45)',
    href: '/database',
    topicsCount: 12,
    roadmapPhase: 3,
    estimatedDate: { en: 'Completed (Phase 3)', vi: 'Đã hoàn thành (Giai đoạn 3)' },
    highlights: {
      en: [
        'B-Tree Node Search & Page Splitting animation',
        'LSM-Tree MemTable -> WAL -> SSTable Compaction',
        'Transaction Isolation: Dirty Read, Non-repeatable, Phantom Read',
        'Clustered vs Secondary Index lookup paths'
      ],
      vi: [
        'Hoạt họa tìm kiếm và phân tách trang cây B-Tree',
        'Quy trình MemTable -> WAL -> SSTable trong LSM-Tree',
        'Các lỗi tranh chấp giao dịch: Đọc bẩn, Phantom Read, MVCC',
        'So sánh đường đi của Clustered Index và Secondary Index'
      ]
    },
    upcomingFeatures: {
      en: ['Interactive SQL Query Execution Path visualizer', 'Sharding Hash Ring simulator'],
      vi: ['Mô phỏng đường đi câu lệnh SQL trên index', 'Vòng băm nhất quán Consistent Hashing']
    }
  },
  {
    id: 'cdc-event-driven',
    name: 'Change Data Capture (CDC)',
    category: { en: 'Data Streaming & Integration', vi: 'Luồng Dữ liệu & Tích hợp' },
    tagline: {
      en: 'Postgres WAL commit stream, Debezium connectors, and solving dual-writes with Transactional Outbox.',
      vi: 'Luồng commit log Postgres WAL, Debezium connector và triệt tiêu ghi kép với Transactional Outbox.'
    },
    description: {
      en: 'Watch database mutations turn into guaranteed immutable event streams syncing to search engines and caches without data loss.',
      vi: 'Xem các thao tác ghi cơ sở dữ liệu chuyển hóa thành luồng sự kiện bảo toàn tính nhất quán sang Elasticsearch/Redis.'
    },
    badgeText: {
      en: 'Available Now · 6 Topics',
      vi: 'Sẵn sàng học · 6 Chuyên đề'
    },
    status: 'available',
    accent: '#10b981',
    accentSoft: '#a7f3d0',
    accentBg: 'rgba(16, 185, 129, 0.08)',
    accentBorder: 'rgba(16, 185, 129, 0.45)',
    href: '/cdc',
    topicsCount: 6,
    roadmapPhase: 4,
    estimatedDate: { en: 'Completed (Phase 4)', vi: 'Đã hoàn thành (Giai đoạn 4)' },
    highlights: {
      en: [
        'Chương 01: Dual-write problem, Postgres WAL/LSN/slots, MySQL binlog & GTID',
        'Chương 02: Debezium on Kafka Connect, change event envelope, incremental snapshots (DBLog)',
        'Chương 03: Outbox Event Router, idempotent consumers, heartbeats & lag monitoring'
      ],
      vi: [
        'Chương 01: Bài toán dual-write, Postgres WAL/LSN/slot, MySQL binlog & GTID',
        'Chương 02: Debezium trên Kafka Connect, envelope sự kiện, incremental snapshot (DBLog)',
        'Chương 03: Outbox Event Router, consumer idempotent, heartbeat & giám sát lag'
      ]
    },
    upcomingFeatures: {
      en: ['Outbox table failure injection sandbox', 'Kafka Connect sink visualizer'],
      vi: ['Sandbox ngắt kết nối kiểm tra tính toàn vẹn', 'Minh họa luồng Kafka Connect sink']
    }
  },
  {
    id: 'message-queue',
    name: 'Message Queues & Streaming',
    category: {
      en: 'Distributed Messaging & Streaming',
      vi: 'Hạ tầng Hàng đợi & Streaming Phân tán'
    },
    tagline: {
      en: 'Distributed systems invariants: Apache Kafka vs RabbitMQ, delivery semantics, partition rebalance, and backpressure.',
      vi: 'Giải quyết các bài toán phân tán: Apache Kafka vs RabbitMQ, ngữ nghĩa phân phát tin, tái cân bằng partition và áp suất ngược.'
    },
    description: {
      en: 'Master core distributed systems challenges: temporal decoupling, at-least-once vs exactly-once semantics, dead-letter exchanges, Kafka log partitioning, batching LZ4, cooperative sticky rebalancing, and transactional outbox via pure Java 21.',
      vi: 'Làm chủ các bài toán cốt lõi của hệ thống phân tán: phân tách thời gian, ngữ nghĩa giao hàng (At-least-once / EOS), chống mất gói tin, kẹt Consumer Lag, kiểm soát áp suất ngược (Backpressure) và bão Rebalance bằng hoạt họa trực quan và Spring Boot 3.'
    },
    badgeText: {
      en: 'Available Now · 20 Distributed Topics',
      vi: 'Sẵn sàng học · 20 Chuyên đề phân tán'
    },
    status: 'available',
    accent: '#8b5cf6',
    accentSoft: '#ddd6fe',
    accentBg: 'rgba(139, 92, 246, 0.08)',
    accentBorder: 'rgba(139, 92, 246, 0.45)',
    href: '/message-queue',
    topicsCount: 20,
    roadmapPhase: 5,
    estimatedDate: { en: 'Completed (Phase 5)', vi: 'Đã hoàn thành (Giai đoạn 5)' },
    highlights: {
      en: [
        'Chương 01: Messaging Fundamentals & Temporal Decoupling',
        'Chương 02: RabbitMQ Exchanges, Prefetch QoS & DLX Backoff',
        'Chương 03: Kafka Partitions, Batching LZ4, Rebalance & 2PC EOS',
        'Chương 04: Flow Control dQ/dt = λ - μ, Consumer Lag & KEDA Auto-scaling',
        'Advanced Track: Log Compaction, Kafka Streams, Quorum Raft, MM2 DR & Zero-Copy',
        'Spring Boot 3 & Java 21 Drivers, Idempotent Consumer & Outbox CDC Pattern'
      ],
      vi: [
        'Chương 01: Nền tảng Hàng đợi & Phân tách thời gian bất đồng bộ',
        'Chương 02: Định tuyến RabbitMQ Exchange, QoS Prefetch & Thử lại DLX',
        'Chương 03: Phân mảnh Kafka, Nén batch LZ4, Tái cân bằng & 2PC EOS',
        'Chương 04: Kiểm soát dòng tin dQ/dt = λ - μ, Consumer Lag & Tự co giãn KEDA',
        'Chuyên đề Nâng cao: Nén log, Kafka Streams RocksDB, Quorum Raft & Linux Zero-Copy',
        'Thực hành Spring Boot 3 & Java 21, Idempotent Consumer & Transactional Outbox CDC'
      ]
    },
    upcomingFeatures: {
      en: [
        'Live Backpressure & Consumer Lag Simulator',
        'Cooperative Sticky Rebalance interactive visualizer'
      ],
      vi: [
        'Phòng thí nghiệm tương tác áp suất ngược dQ/dt',
        'Mô phỏng trực quan tái cân bằng Cooperative Sticky'
      ]
    }
  },
  {
    id: 'docker-containers',
    name: 'Docker & Containerization',
    category: { en: 'Infrastructure & Virtualization', vi: 'Ảo hóa & Hạ tầng' },
    tagline: {
      en: 'From VMs vs containers and Linux namespaces/cgroups to Dockerfile layers, Compose stacks, supply-chain security and the registry workflow.',
      vi: 'Từ VM vs container và namespaces/cgroups của Linux tới layer Dockerfile, stack Compose, bảo mật supply chain và quy trình registry.'
    },
    description: {
      en: 'Unravel what a container really is under the hood: no black box, just isolated Linux kernel primitives working together.',
      vi: 'Khám phá bản chất thực sự của container: không phải hộp đen, mà là sự kết hợp của các cơ chế hạt nhân Linux kernel.'
    },
    badgeText: {
      en: 'Available Now · 11 Topics',
      vi: 'Sẵn sàng học · 11 Chuyên đề'
    },
    status: 'available',
    accent: '#06b6d4',
    accentSoft: '#cffafe',
    accentBg: 'rgba(6, 182, 212, 0.08)',
    accentBorder: 'rgba(6, 182, 212, 0.45)',
    href: '/docker',
    topicsCount: 11,
    roadmapPhase: 6,
    estimatedDate: { en: 'Completed (Phase 6)', vi: 'Đã hoàn thành (Giai đoạn 6)' },
    highlights: {
      en: [
        'Level 1: VMs vs containers, namespaces & cgroups, CLI lifecycle, image layers & build cache',
        'Level 2: production-ready images, networking & DNS, volumes, Docker Compose stacks',
        'Level 3: security & supply chain, resource troubleshooting, build-once registry workflow'
      ],
      vi: [
        'Cấp độ 1: VM vs container, namespaces & cgroups, vòng đời CLI, layer image & build cache',
        'Cấp độ 2: image production-ready, networking & DNS, volume, stack Docker Compose',
        'Cấp độ 3: bảo mật & supply chain, troubleshooting tài nguyên, quy trình registry build-once'
      ]
    },
    upcomingFeatures: {
      en: ['Layer caching visual inspector', 'Port forwarding packet tracer'],
      vi: ['Trình kiểm tra cache từng layer image', 'Theo dõi gói tin khi ánh xạ cổng port mapping']
    }
  },
  {
    id: 'system-security',
    name: 'Security, OAuth 2.0 & Auth',
    category: { en: 'Security & Protocols', vi: 'Bảo mật & Giao thức' },
    tagline: {
      en: 'From the CIA triad, cryptography and TLS to OAuth 2.0 + PKCE, JWT, OIDC, the OWASP Top 10, Keycloak SSO, Zero Trust and Spring Security internals.',
      vi: 'Từ CIA triad, mật mã học và TLS tới OAuth 2.0 + PKCE, JWT, OIDC, OWASP Top 10, Keycloak SSO, Zero Trust và Spring Security internals.'
    },
    description: {
      en: 'Step through every cryptographic exchange, signature verification, and delegated authorization flow with precision.',
      vi: 'Từng bước kiểm chứng quy trình trao đổi khóa mã hóa, xác minh chữ ký số và phân quyền phân tán.'
    },
    badgeText: {
      en: 'Available Now · 16 Topics',
      vi: 'Sẵn sàng học · 16 Chuyên đề'
    },
    status: 'available',
    accent: '#f43f5e',
    accentSoft: '#fecdd3',
    accentBg: 'rgba(244, 63, 94, 0.08)',
    accentBorder: 'rgba(244, 63, 94, 0.45)',
    href: '/security',
    topicsCount: 16,
    roadmapPhase: 7,
    estimatedDate: { en: 'Completed (Phase 7)', vi: 'Đã hoàn thành (Giai đoạn 7)' },
    highlights: {
      en: [
        'Levels 1–2: CIA & threat modeling, cryptography, TLS, sessions/tokens, RBAC/ABAC/ReBAC, passwords & MFA',
        'Level 3: OAuth 2.0 architecture, flows & PKCE, JWT validation, OpenID Connect & federation',
        'Levels 4–5: OWASP Top 10, XSS/CSRF/CORS/CSP, API security, Keycloak SSO, Zero Trust, Spring Security'
      ],
      vi: [
        'Cấp độ 1–2: CIA & threat modeling, mật mã học, TLS, session/token, RBAC/ABAC/ReBAC, mật khẩu & MFA',
        'Cấp độ 3: kiến trúc OAuth 2.0, các flow & PKCE, xác minh JWT, OpenID Connect & federation',
        'Cấp độ 4–5: OWASP Top 10, XSS/CSRF/CORS/CSP, API security, Keycloak SSO, Zero Trust, Spring Security'
      ]
    },
    upcomingFeatures: {
      en: ['JWT token decoder & attack simulator', 'mTLS handshake interactive inspection'],
      vi: [
        'Mô phỏng giải mã JWT và thử tấn công giả lập',
        'Kiểm tra chi tiết từng bước bắt tay mTLS'
      ]
    }
  },
  {
    id: 'devops-orchestration',
    name: 'DevOps & Cloud Orchestration',
    category: { en: 'Deployment & Reliability', vi: 'Vận hành & Độ tin cậy' },
    tagline: {
      en: 'Canary vs Blue/Green traffic splitting, Kubernetes Pod controllers, Ingress routing, and auto-scaling.',
      vi: 'Phân tách lưu lượng Canary vs Blue/Green, Kubernetes Pod controller, Ingress routing và tự động co giãn.'
    },
    description: {
      en: 'Simulate zero-downtime production rollouts, progressive traffic shifting, health check probes, and automated rollbacks.',
      vi: 'Mô phỏng triển khai zero-downtime, chuyển dịch lưu lượng dần dần, cơ chế kiểm tra sức khỏe và tự động rollback.'
    },
    badgeText: {
      en: 'Available Now · 6 Topics',
      vi: 'Sẵn sàng học · 6 Chuyên đề'
    },
    status: 'available',
    accent: '#f59e0b',
    accentSoft: '#fde68a',
    accentBg: 'rgba(245, 158, 11, 0.08)',
    accentBorder: 'rgba(245, 158, 11, 0.45)',
    href: '/devops',
    topicsCount: 6,
    roadmapPhase: 8,
    estimatedDate: { en: 'Completed (Phase 8)', vi: 'Đã hoàn thành (Giai đoạn 8)' },
    highlights: {
      en: [
        'Chương 01: Build-once CI/CD, SBOM, cosign signing, DORA metrics',
        'Chương 02: Kubernetes scheduler, controllers & rolling updates, Services & Gateway API',
        'Chương 03: GitOps + canary analysis, HPA autoscaling, SLO burn-rate alerting'
      ],
      vi: [
        'Chương 01: CI/CD build-once, SBOM, ký cosign, DORA metrics',
        'Chương 02: Kubernetes scheduler, controller & rolling update, Service & Gateway API',
        'Chương 03: GitOps + canary analysis, HPA autoscaling, cảnh báo burn rate SLO'
      ]
    },
    upcomingFeatures: {
      en: ['Simulated traffic spike stress tester', 'Rollback trigger sandbox'],
      vi: [
        'Mô phỏng bơm tải cao để kiểm tra tự động co giãn',
        'Thử nghiệm tình huống lỗi kích hoạt Rollback'
      ]
    }
  }
];

export function getModuleById(id: string): LearningModule | undefined {
  return LEARNING_MODULES.find((m) => m.id === id);
}

export function getModuleByHref(href: string): LearningModule | undefined {
  return LEARNING_MODULES.find((m) => m.href === href);
}
