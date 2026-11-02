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
    roadmapPhase: 1,
    estimatedDate: { en: 'Completed', vi: 'Đã hoàn thành' },
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
      en: 'Phase 2 · In Development',
      vi: 'Giai đoạn 2 · Đang phát triển'
    },
    status: 'development',
    accent: '#0284c7',
    accentSoft: '#bae6fd',
    accentBg: 'rgba(2, 132, 199, 0.08)',
    accentBorder: 'rgba(2, 132, 199, 0.45)',
    href: '/database',
    topicsCount: 8,
    roadmapPhase: 2,
    estimatedDate: { en: 'Next Release (Phase 2)', vi: 'Bản phát hành tới (Giai đoạn 2)' },
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
      en: 'Phase 2 · In Development',
      vi: 'Giai đoạn 2 · Đang phát triển'
    },
    status: 'development',
    accent: '#10b981',
    accentSoft: '#a7f3d0',
    accentBg: 'rgba(16, 185, 129, 0.08)',
    accentBorder: 'rgba(16, 185, 129, 0.45)',
    href: '/cdc',
    topicsCount: 6,
    roadmapPhase: 2,
    estimatedDate: { en: 'Phase 2', vi: 'Giai đoạn 2' },
    highlights: {
      en: [
        'Transactional Outbox Pattern step simulation',
        'Postgres Logical Replication & WAL parser',
        'Debezium event schema envelope structure',
        'Handling downstream network failure & idempotency'
      ],
      vi: [
        'Mô phỏng từng bước Transactional Outbox Pattern',
        'Cơ chế Logical Replication và bộ đọc Postgres WAL',
        'Cấu trúc thông điệp sự kiện Debezium JSON envelope',
        'Xử lý mất kết nối hạ tầng và tính lũy kế (Idempotency)'
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
    category: { en: 'Distributed Messaging', vi: 'Hàng đợi & Phân tán' },
    tagline: {
      en: 'Kafka partition rebalancing, consumer offsets, RabbitMQ topic exchanges and backpressure handling.',
      vi: 'Phân vùng Kafka, nhóm tiêu thụ, sàn giao dịch RabbitMQ và cơ chế giảm tải backpressure.'
    },
    description: {
      en: 'Follow packet tokens through brokers, understand at-least-once vs exactly-once semantics, and dead-letter queues.',
      vi: 'Theo dõi gói tin qua broker, hiểu rõ ngữ nghĩa at-least-once, exactly-once và chính sách hàng đợi chết (DLQ).'
    },
    badgeText: {
      en: 'Phase 3 · Upcoming',
      vi: 'Giai đoạn 3 · Sắp ra mắt'
    },
    status: 'development',
    accent: '#8b5cf6',
    accentSoft: '#ddd6fe',
    accentBg: 'rgba(139, 92, 246, 0.08)',
    accentBorder: 'rgba(139, 92, 246, 0.45)',
    href: '/message-queue',
    topicsCount: 8,
    roadmapPhase: 3,
    estimatedDate: { en: 'Phase 3', vi: 'Giai đoạn 3' },
    highlights: {
      en: [
        'Kafka partition offsets & consumer group rebalance',
        'RabbitMQ Direct, Fanout, and Topic routing keys',
        'Dead-letter Queue (DLQ) & Exponential Backoff',
        'Backpressure: producer speed vs consumer lag'
      ],
      vi: [
        'Cơ chế commit offset và rebalance trong Apache Kafka',
        'Định tuyến sàn giao dịch Direct, Fanout, Topic trong RabbitMQ',
        'Hàng đợi lỗi DLQ và chiến lược thử lại Exponential Backoff',
        'Trực quan hóa độ trễ Consumer Lag khi Producer quá tải'
      ]
    },
    upcomingFeatures: {
      en: ['Interactive queue overload simulator', 'Consumer crash recovery flow'],
      vi: ['Mô phỏng trực quan tràn hàng đợi', 'Xử lý khi một node consumer bị sập']
    }
  },
  {
    id: 'docker-containers',
    name: 'Docker & Containerization',
    category: { en: 'Infrastructure & Virtualization', vi: 'Ảo hóa & Hạ tầng' },
    tagline: {
      en: 'Linux Namespaces, Cgroups resource limits, OverlayFS layer unions, and virtual bridge networking.',
      vi: 'Không gian tên Linux Namespaces, giới hạn tài nguyên Cgroups, OverlayFS và mạng cầu ảo.'
    },
    description: {
      en: 'Unravel what a container really is under the hood: no black box, just isolated Linux kernel primitives working together.',
      vi: 'Khám phá bản chất thực sự của container: không phải hộp đen, mà là sự kết hợp của các cơ chế hạt nhân Linux kernel.'
    },
    badgeText: {
      en: 'Phase 4 · Upcoming',
      vi: 'Giai đoạn 4 · Sắp ra mắt'
    },
    status: 'upcoming',
    accent: '#06b6d4',
    accentSoft: '#cffafe',
    accentBg: 'rgba(6, 182, 212, 0.08)',
    accentBorder: 'rgba(6, 182, 212, 0.45)',
    href: '/docker',
    topicsCount: 7,
    roadmapPhase: 4,
    estimatedDate: { en: 'Phase 4', vi: 'Giai đoạn 4' },
    highlights: {
      en: [
        'Linux Namespaces: PID, NET, MNT, IPC isolation',
        'Cgroups: Memory, CPU throttling visual curves',
        'OverlayFS: LowerDir, UpperDir, Merged filesystem layers',
        'Container Virtual Bridge (veth) packet routing'
      ],
      vi: [
        'Phân tách không gian tên: PID, NET, MNT, IPC',
        'Giới hạn tài nguyên CPU/RAM với Cgroups',
        'Cấu trúc xếp tầng OverlayFS (LowerDir, UpperDir, Merged)',
        'Định tuyến gói tin qua cặp giao diện mạng ảo veth'
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
      en: 'OAuth 2.0 PKCE sequence handshake, JWT token lifecycles, and TLS 1.3 cryptographic key exchange.',
      vi: 'Bắt tay xác thực OAuth 2.0 PKCE, vòng đời token JWT, và trao đổi khóa mật mã TLS 1.3.'
    },
    description: {
      en: 'Step through every cryptographic exchange, signature verification, and delegated authorization flow with precision.',
      vi: 'Từng bước kiểm chứng quy trình trao đổi khóa mã hóa, xác minh chữ ký số và phân quyền phân tán.'
    },
    badgeText: {
      en: 'Phase 4 · Upcoming',
      vi: 'Giai đoạn 4 · Sắp ra mắt'
    },
    status: 'upcoming',
    accent: '#f43f5e',
    accentSoft: '#fecdd3',
    accentBg: 'rgba(244, 63, 94, 0.08)',
    accentBorder: 'rgba(244, 63, 94, 0.45)',
    href: '/modules/security',
    topicsCount: 6,
    roadmapPhase: 4,
    estimatedDate: { en: 'Phase 4', vi: 'Giai đoạn 4' },
    highlights: {
      en: [
        'OAuth 2.0 Authorization Code with PKCE step sequence',
        'JWT structure (Header.Payload.Signature) & HMAC verification',
        'TLS 1.3 Handshake: ECDHE key exchange to AES-GCM session',
        'Zero Trust Architecture: mutual TLS (mTLS) between services'
      ],
      vi: [
        'Quy trình ủy quyền OAuth 2.0 mã xác thực với PKCE',
        'Cấu trúc token JWT và kiểm tra tính toàn vẹn HMAC',
        'Bắt tay TLS 1.3 từ trao đổi khóa ECDHE sang AES đối xứng',
        'Kiến trúc Zero Trust và xác thực mTLS giữa các microservices'
      ]
    },
    upcomingFeatures: {
      en: ['JWT token decoder & attack simulator', 'mTLS handshake interactive inspection'],
      vi: ['Mô phỏng giải mã JWT và thử tấn công giả lập', 'Kiểm tra chi tiết từng bước bắt tay mTLS']
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
      en: 'Phase 4 · Upcoming',
      vi: 'Giai đoạn 4 · Sắp ra mắt'
    },
    status: 'upcoming',
    accent: '#f59e0b',
    accentSoft: '#fde68a',
    accentBg: 'rgba(245, 158, 11, 0.08)',
    accentBorder: 'rgba(245, 158, 11, 0.45)',
    href: '/modules/devops',
    topicsCount: 6,
    roadmapPhase: 4,
    estimatedDate: { en: 'Phase 4', vi: 'Giai đoạn 4' },
    highlights: {
      en: [
        'Canary Release: 90% stable vs 10% canary traffic splitting',
        'Blue/Green switchover with instantaneous router flip',
        'Kubernetes: Ingress -> Service -> Pod replica scaling',
        'Horizontal Pod Autoscaler (HPA) responding to traffic spikes'
      ],
      vi: [
        'Chiến lược Canary: Chia tách lưu lượng 90% ổn định / 10% thử nghiệm',
        'Chuyển đổi tức thì Blue/Green không gây gián đoạn',
        'Mô hình topo K8s: Ingress -> Service -> Replica Pods',
        'Co giãn số lượng Pod tự động theo lưu lượng tải (HPA)'
      ]
    },
    upcomingFeatures: {
      en: ['Simulated traffic spike stress tester', 'Rollback trigger sandbox'],
      vi: ['Mô phỏng bơm tải cao để kiểm tra tự động co giãn', 'Thử nghiệm tình huống lỗi kích hoạt Rollback']
    }
  }
];

export function getModuleById(id: string): LearningModule | undefined {
  return LEARNING_MODULES.find((m) => m.id === id);
}

export function getModuleByHref(href: string): LearningModule | undefined {
  return LEARNING_MODULES.find((m) => m.href === href);
}
