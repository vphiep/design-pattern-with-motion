import type { SceneMeta } from '@/lib/patterns/scene';

export const MESSAGING_SCENE_META: Record<string, SceneMeta> = {
  'message-queue-architecture': {
    caption: {
      en: 'Message Queue: Temporal decoupling, asynchronous publish, broker buffering, and non-blocking worker delivery.',
      vi: 'Hàng đợi bản tin: Phân tách thời gian, xuất bản bất đồng bộ, bộ đệm broker và phân phát không nghẽn cho worker.'
    },
    steps: [
      { id: 'create', label: 'Create OrderCreatedEvent', match: 'new OrderEvent', span: 2 },
      { id: 'publish', label: 'Publish to Exchange', match: 'rabbitTemplate.convertAndSend', span: 2 },
      { id: 'confirm', label: 'Broker ACK Confirmation', match: 'ResponseEntity.accepted', span: 2 },
      { id: 'consume', label: 'Async Worker Processing', match: '@RabbitListener', span: 2 }
    ]
  },
  'delivery-semantics-ack': {
    caption: {
      en: 'Delivery Semantics: Manual ACK handshake, idempotency guards, and redelivery failure recovery.',
      vi: 'Ngữ nghĩa phân phát: Bắt tay Manual ACK, bảo vệ tính lũy kế idempotency và phục hồi khi redelivery.'
    },
    steps: [
      { id: 'deliver', label: 'Deliver Unacked Message', match: '@RabbitListener', span: 2 },
      { id: 'dedup', label: 'Idempotency Check (Redis/DB)', match: 'acquireLock', span: 2 },
      { id: 'process', label: 'Atomic DB Transaction', match: 'processPaymentWithinTransaction', span: 2 },
      { id: 'ack', label: 'Commit Manual basicAck', match: 'channel.basicAck', span: 2 }
    ]
  },
  'event-driven-patterns': {
    caption: {
      en: 'Event-Driven Patterns: Choreography Saga, Domain Events, Correlation IDs, and automated compensating rollbacks.',
      vi: 'Kiến trúc hướng sự kiện: Chuỗi Saga, Domain Events, Correlation ID và giao dịch bù trừ hoàn tiền tự động.'
    },
    steps: [
      { id: 'order-event', label: 'OrderCreatedEvent Emitted', match: 'ORDER_CREATED', span: 2 },
      { id: 'payment-step', label: 'Payment Success & Next Event', match: 'PAYMENT_SUCCESS', span: 2 },
      { id: 'inventory-fail', label: 'Inventory Out-of-Stock Fault', match: 'INVENTORY_OUT_OF_STOCK', span: 2 },
      { id: 'compensate', label: 'Compensating Refund Executed', match: 'executeRefund', span: 2 }
    ]
  },
  'rabbitmq-exchanges-routing': {
    caption: {
      en: 'RabbitMQ Routing: Direct (exact), Fanout (broadcast), Topic (wildcard * #), and Headers exchange mechanics.',
      vi: 'Định tuyến RabbitMQ: Direct (khớp chính xác), Fanout (phát tán), Topic (ký tự đại diện * #) và Headers.'
    },
    steps: [
      { id: 'publish-key', label: 'Publish with Routing Key', match: 'convertAndSend', span: 2 },
      { id: 'match-binding', label: 'Exchange Evaluates Bindings', match: 'BindingBuilder.bind', span: 2 },
      { id: 'queue-push', label: 'Push to Matched Queues', match: '@RabbitListener', span: 2 }
    ]
  },
  'rabbitmq-queue-prefetch-ack': {
    caption: {
      en: 'Queue Management: Fair dispatching via basic.qos prefetch count, competing consumers, and zero OOM.',
      vi: 'Quản lý hàng đợi: Phân phối công bằng Fair Dispatch qua basic.qos, Competing Consumers và chống tràn RAM.'
    },
    steps: [
      { id: 'set-qos', label: 'Set Prefetch Count (basic.qos)', match: 'setPrefetchCount', span: 2 },
      { id: 'fill-window', label: 'Deliver In-Flight Window', match: 'acknowledge-mode: manual', span: 2 },
      { id: 'slide-window', label: 'Slide Window via basicAck', match: 'basicAck', span: 2 }
    ]
  },
  'rabbitmq-dlx-retry-backoff': {
    caption: {
      en: 'DLX & Retry: Poison message containment, graduated TTL delay queues, and exponential backoff.',
      vi: 'DLX & Thử lại: Cách ly Poison Message, hàng đợi chờ TTL tăng dần và thử lại số mũ Exponential Backoff.'
    },
    steps: [
      { id: 'reject-msg', label: 'basicNack(requeue=false)', match: 'requeue=false', span: 2 },
      { id: 'ttl-delay', label: 'Hold in Retry Queue (TTL)', match: 'orders.retry.5s', span: 2 },
      { id: 're-inject', label: 'TTL Expiry -> Re-injected', match: 'orders.main', span: 2 },
      { id: 'quarantine', label: 'Max Retries -> Quarantine DLQ', match: 'orders.dead-letter', span: 2 }
    ]
  },
  'kafka-architecture-partitions': {
    caption: {
      en: 'Kafka Partitions: Cluster sharding, Leader/Follower replicas, ISR quorum, and deterministic key hashing.',
      vi: 'Phân vùng Kafka: Phân mảnh cụm, Leader/Follower Replicas, ISR quorum và băm key bảo toàn thứ tự.'
    },
    steps: [
      { id: 'hash-key', label: 'MurmurHash2 Partitioning', match: 'sendOrderEvent', span: 2 },
      { id: 'leader-append', label: 'Leader Commit Log Append', match: 'RecordMetadata', span: 2 },
      { id: 'isr-sync', label: 'ISR Followers Replicate', match: 'min.insync.replicas', span: 2 },
      { id: 'ack-confirm', label: 'High-Watermark Confirmed', match: 'acks: all', span: 2 }
    ]
  },
  'kafka-producer-batching-reliability': {
    caption: {
      en: 'Producer Tuning: RecordAccumulator memory pooling, linger.ms, LZ4 compression, and acks=all idempotence.',
      vi: 'Tối ưu Producer: Bộ đệm RecordAccumulator, linger.ms, nén LZ4 và tính lũy kế với acks=all.'
    },
    steps: [
      { id: 'client-send', label: 'Thread Appends to RecordBuffer', match: 'kafkaTemplate.send', span: 2 },
      { id: 'linger-wait', label: 'Accumulate Batch (linger.ms)', match: 'LINGER_MS_CONFIG', span: 2 },
      { id: 'compress-send', label: 'LZ4 Compression & Single Dispatch', match: 'COMPRESSION_TYPE_CONFIG', span: 2 },
      { id: 'producer-ack', label: 'All In-Sync Replicas ACK', match: 'ACKS_CONFIG', span: 2 }
    ]
  },
  'kafka-consumer-groups-rebalance': {
    caption: {
      en: 'Consumer Groups: Partition assignments, Cooperative Sticky rebalancing, and manual offset checkpoints.',
      vi: 'Nhóm tiêu thụ: Phân bổ partition, tái cân bằng Cooperative Sticky và commit offset thủ công.'
    },
    steps: [
      { id: 'stable-stream', label: 'Stable Partition Consumption', match: '@KafkaListener', span: 2 },
      { id: 'cooperative-rebalance', label: 'Incremental Cooperative Rebalance', match: 'CooperativeStickyAssignor', span: 2 },
      { id: 'commit-offset', label: 'Manual Offset Commit', match: 'ack.acknowledge', span: 2 }
    ]
  },
  'kafka-delivery-guarantees-transactions': {
    caption: {
      en: 'Kafka Transactions: Atomic consume-transform-produce, Transaction Coordinator, and read_committed isolation.',
      vi: 'Giao dịch Kafka: Chu kỳ Consume-Transform-Produce nguyên tử, Transaction Coordinator và read_committed.'
    },
    steps: [
      { id: 'init-tx', label: 'Initialize Transaction (PID Fencing)', match: 'transaction-id-prefix', span: 2 },
      { id: 'atomic-produce', label: 'Atomic Produce to Output Topic', match: '@Transactional', span: 2 },
      { id: 'commit-markers', label: 'Write Two-Phase Commit Markers', match: 'isolation.level: read_committed', span: 2 }
    ]
  },
  'backpressure-consumer-lag-flow-control': {
    caption: {
      en: 'Backpressure & Flow Control: Governing dQ/dt = λ - μ, Consumer Lag monitoring, and KEDA elastic auto-scaling.',
      vi: 'Áp suất ngược: Kiểm soát dQ/dt = λ - μ, giám sát Consumer Lag và tự động co giãn KEDA trên Kubernetes.'
    },
    steps: [
      { id: 'surge-intake', label: 'Producer Spike Ingestion (λ)', match: 'rateLimiter', span: 2 },
      { id: 'lag-buildup', label: 'Consumer Lag Accumulation', match: 'lagThreshold', span: 2 },
      { id: 'keda-scale', label: 'KEDA Auto-Scales Consumer Pods', match: 'ScaledObject', span: 2 },
      { id: 'drain-queue', label: 'Batch DB Writes -> Backlog Drained', match: 'batchInsert', span: 2 }
    ]
  },
  'messaging-reliability-observability': {
    caption: {
      en: 'Reliability Architecture: Transactional Outbox pattern, Debezium CDC WAL streaming, and enterprise metrics.',
      vi: 'Kiến trúc tin cậy: Mẫu Transactional Outbox, streaming Debezium CDC từ WAL và giám sát metrics.'
    },
    steps: [
      { id: 'outbox-commit', label: 'Atomic DB Outbox Commit', match: 'outboxRepository.save', span: 2 },
      { id: 'debezium-wal', label: 'Debezium Tails Postgres WAL', match: 'io.debezium.transforms.outbox', span: 2 },
      { id: 'kafka-rabbit-bridge', label: 'Stream to Kafka & Bridge to RabbitMQ', match: 'notifications.topic', span: 2 }
    ]
  },
  'kafka-log-compaction-cdc': {
    caption: {
      en: 'Log Compaction: Deduplicating closed segments, SkimpyOffsetMap, and Tombstone delete markers.',
      vi: 'Nén nhật ký: Khử trùng lặp trên segment cũ, bảng băm SkimpyOffsetMap và bản tin mộ bia Tombstone.'
    },
    steps: [
      { id: 'append-mutations', label: 'Continuous State Mutations', match: 'CLEANUP_POLICY_COMPACT', span: 2 },
      { id: 'cleaner-scan', label: 'Cleaner Thread Scans Closed Segments', match: 'MIN_CLEANABLE_DIRTY_RATIO_CONFIG', span: 2 },
      { id: 'compact-swap', label: 'Atomic Swap to Compacted Segment', match: 'DELETE_RETENTION_MS_CONFIG', span: 2 }
    ]
  },
  'kafka-streams-stateful-processing': {
    caption: {
      en: 'Kafka Streams: Embedded RocksDB local state stores, sliding tumbling windows, and changelog replication.',
      vi: 'Kafka Streams: Cơ sở dữ liệu nhúng RocksDB cục bộ, cửa sổ trượt Sliding Windows và sao lưu Changelog.'
    },
    steps: [
      { id: 'stream-read', label: 'Ingest Event from Stream Topic', match: 'builder.stream', span: 2 },
      { id: 'rocksdb-mutate', label: 'Microsecond Local RocksDB Update', match: 'windowedBy', span: 2 },
      { id: 'emit-alert', label: 'Threshold Breached -> Emit Output', match: 'fraud-alerts', span: 2 }
    ]
  },
  'rabbitmq-quorum-queues-raft': {
    caption: {
      en: 'Quorum Queues: Raft consensus majority (N/2 + 1), split-brain immunity, and non-blocking synchronization.',
      vi: 'Quorum Queues: Thuật toán đồng thuận Raft đa số (N/2 + 1), chống Split-Brain và đồng bộ không nghẽn.'
    },
    steps: [
      { id: 'declare-quorum', label: 'Declare Quorum Queue (Raft)', match: 'quorum()', span: 2 },
      { id: 'replicate-wal', label: 'AppendEntries Streamed to Replicas', match: 'deliveryLimit', span: 2 },
      { id: 'quorum-ack', label: 'Majority Confirms -> Leader ACKs', match: 'publisher-confirm-type', span: 2 }
    ]
  },
  'rabbitmq-streams-log': {
    caption: {
      en: 'RabbitMQ Streams: High-throughput append-only log on disk, binary port 5552, and non-destructive replay.',
      vi: 'RabbitMQ Streams: Nhật ký ghi nối tiếp trên đĩa, giao thức nhị phân cổng 5552 và đọc tua lại không mất dữ liệu.'
    },
    steps: [
      { id: 'declare-stream', label: 'Declare Stream Queue (x-queue-type: stream)', match: 'stream()', span: 2 },
      { id: 'binary-produce', label: 'Produce via Stream Protocol (Port 5552)', match: 'streamCreator', span: 2 },
      { id: 'offset-replay', label: 'Time-Travel Replay from First Offset', match: 'OffsetSpecification.first', span: 2 }
    ]
  },
  'distributed-disaster-recovery-mirrormaker': {
    caption: {
      en: 'Disaster Recovery: Active-Passive cross-region replication, MirrorMaker 2, and automated offset translation.',
      vi: 'Dự phòng thảm họa: Sao chép liên vùng Active-Passive, MirrorMaker 2 và tự động dịch chuyển offset.'
    },
    steps: [
      { id: 'local-produce', label: 'Primary DC-1 Local Commit (< 3ms)', match: 'orders-v1', span: 2 },
      { id: 'mm2-replicate', label: 'MirrorMaker 2 Streams over WAN', match: 'RemoteClusterUtils', span: 2 },
      { id: 'failover-resume', label: 'Failover: Translate Offsets & Resume', match: 'translateOffsets', span: 2 }
    ]
  },
  'transactional-outbox-kafka-eos': {
    caption: {
      en: 'End-to-End Exactly-Once: Ingress idempotency, local DB outbox, Kafka EOS-v2, and target DB deduplication.',
      vi: 'Độ toàn vẹn 100%: Idempotency cổng vào, DB outbox cục bộ, Kafka EOS-v2 và khử trùng lặp tại DB đích.'
    },
    steps: [
      { id: 'ingress-gate', label: 'Client X-Idempotency-Key Check', match: 'X-Idempotency-Key', span: 2 },
      { id: 'outbox-save', label: 'Atomic DB Outbox Commit', match: 'OutboxEvent', span: 2 },
      { id: 'eos-transform', label: 'Kafka Streams Atomic EOS-v2', match: 'exactly_once_v2', span: 2 },
      { id: 'egress-dedup', label: 'Target DB Unique Key Deduplication', match: 'DuplicateKeyException', span: 2 }
    ]
  },
  'zero-copy-pagecache-benchmarking': {
    caption: {
      en: 'Linux Zero-Copy: Kernel sendfile() syscall, DMA transfers, OS Page Cache, and GC-free memory architecture.',
      vi: 'Linux Zero-Copy: Hàm sendfile(), truyền dữ liệu DMA, OS Page Cache và không tiêu tốn bộ nhớ JVM Heap.'
    },
    steps: [
      { id: 'page-cache-write', label: 'Write Sequential to OS Page Cache', match: 'FileChannel.write', span: 2 },
      { id: 'zero-copy-send', label: 'sendfile() DMA Transfer to Socket', match: 'transferTo', span: 2 },
      { id: 'wire-speed', label: 'Wire-Speed Line Rate Transmission', match: 'LinuxZeroCopyBenchmarkDemonstration', span: 2 }
    ]
  },
  'security-mtls-acl-multi-tenancy': {
    caption: {
      en: 'Enterprise Security: Mutual TLS X.509 handshake, SASL/SCRAM-512, fine-grained ACLs, and byte quotas.',
      vi: 'Bảo mật doanh nghiệp: Bắt tay mTLS X.509 hai chiều, SASL/SCRAM-512, phân quyền ACLs và hạn ngạch Quotas.'
    },
    steps: [
      { id: 'mtls-handshake', label: 'Mutual TLS X.509 Handshake', match: 'SSL_KEYSTORE_LOCATION_CONFIG', span: 2 },
      { id: 'scram-auth', label: 'SASL/SCRAM-SHA-512 Auth', match: 'SCRAM-SHA-512', span: 2 },
      { id: 'acl-quota-eval', label: 'ACL Verification & Quota Enforcement', match: 'producer_byte_rate', span: 2 }
    ]
  }
};
