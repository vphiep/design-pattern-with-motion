import type { MessagingCitation } from './types';

export const MESSAGING_RESEARCH_CITATIONS: Record<string, MessagingCitation> = {
  kleppmann_ddia: {
    source: 'Martin Kleppmann (DDIA)',
    title: 'Designing Data-Intensive Applications — Chapter 11: Stream Processing & Message Brokers',
    url: 'https://dataintensive.net/',
    citationType: 'book',
    keyTakeaway: {
      vi: 'Kleppmann phân loại ranh giới giữa Message Broker truyền thống (RabbitMQ - xóa message sau khi ACK, bộ nhớ tạm thời) và Log-based Message Brokers (Kafka - nhật ký phân vùng append-only bền vững, giữ lại dữ liệu để đọc lại tuần tự nhiều lần).',
      en: 'Kleppmann formalizes the architectural divergence between traditional transient message brokers (RabbitMQ - acknowledge & delete) and log-based message brokers (Kafka - persistent, replayable, partition-ordered log streams).'
    },
    benchmarkOrInsight: {
      vi: 'Log-based message broker chuyển đổi tải ghi ngẫu nhiên (random disk I/O) thành ghi tuần tự (sequential I/O), cho phép Kafka tận dụng toàn bộ băng thông của đĩa cứng và OS Page Cache.',
      en: 'Log-based message brokers convert random disk mutations into sequential append-only writes, allowing Kafka to saturate hardware disk bandwidth via OS Page Cache.'
    }
  },
  bytebytego_delivery_semantics: {
    source: 'ByteByteGo (Alex Xu)',
    title: 'Message Delivery Semantics & Exactly-Once Processing in Distributed Systems',
    url: 'https://bytebytego.com/',
    citationType: 'engineering-guide',
    keyTakeaway: {
      vi: 'Trong môi trường mạng phân tán không tin cậy (Unreliable Network), việc bảo đảm Exactly-Once thuần túy là bất khả thi nếu không có sự kết hợp của Idempotent Consumer, Transactional Outbox hoặc Deduplication Key tại đích đến.',
      en: 'True end-to-end exactly-once delivery across distributed network boundaries is mathematically impossible without idempotent consumer deduplication or transactional coordinator protocols.'
    },
    benchmarkOrInsight: {
      vi: 'At-Least-Once + Idempotency = Exactly-Once trong thực tế sản xuất. Mọi nỗ lực cố gắng đạt exactly-once bằng cơ chế mạng thuần túy đều phải trả giá bằng độ trễ tăng vọt (2PC / distributed consensus).',
      en: 'At-Least-Once + Idempotency = Practical Exactly-Once in production. Trying to solve duplicate delivery purely at the transport layer degrades latency drastically due to 2PC consensus overhead.'
    }
  },
  confluent_partitions: {
    source: 'Confluent Engineering',
    title: 'How to Choose the Number of Topics and Partitions in a Kafka Cluster',
    url: 'https://www.confluent.io/blog/how-choose-number-topics-partitions-kafka-cluster/',
    citationType: 'engineering-guide',
    keyTakeaway: {
      vi: 'Mức độ song song tối đa (Max Parallelism) của một Consumer Group bị giới hạn cứng bởi số lượng Partitions: nếu có N partition, thì tối đa N consumer active cùng lúc.',
      en: 'The upper bound of concurrency within a Kafka Consumer Group is strictly capped by the partition count: N partitions enable at most N active consumers in parallel.'
    },
    benchmarkOrInsight: {
      vi: 'Công thức ước lượng số Partition: P = max(Target Throughput / Producer Throughput per Partition, Target Throughput / Consumer Throughput per Partition).',
      en: 'Partition sizing rule of thumb: P = max(Target Throughput / Producer Throughput per Partition, Target Throughput / Consumer Throughput per Partition).'
    }
  },
  conduktor_rebalance: {
    source: 'Conduktor Distributed Systems',
    title: 'Kafka Consumer Group Rebalance: Eager vs Cooperative Sticky Rebalance Protocol',
    url: 'https://www.conduktor.io/kafka/kafka-consumer-group-rebalance/',
    citationType: 'academic-tutorial',
    keyTakeaway: {
      vi: 'Giao thức Eager Rebalance dừng toàn bộ consumer (Stop-the-World). Kể từ Kafka 2.4+ (KIP-429), Cooperative Sticky Assignor cho phép các consumer tiếp tục đọc partition không bị ảnh hưởng, loại bỏ hiện tượng giật cục trong production.',
      en: 'The legacy Eager Rebalance causes a stop-the-world pause. Cooperative Sticky Assignor (KIP-429) allows unaffected consumers to keep consuming data, eliminating cluster-wide processing freezes.'
    }
  },
  rabbitmq_prefetch_qos: {
    source: 'RabbitMQ Documentation & Pivotal',
    title: 'Consumer Prefetch, Flow Control, and High-Throughput Queue Tuning',
    url: 'https://www.rabbitmq.com/docs/confirms',
    citationType: 'specification',
    keyTakeaway: {
      vi: 'Nếu không cấu hình basic.qos (Prefetch Count), RabbitMQ sẽ đẩy ồ ạt toàn bộ message trong queue vào RAM của Consumer, gây tràn bộ nhớ Heap OutOfMemory và phá vỡ cơ chế cân bằng tải giữa các consumer (Competing Consumers).',
      en: 'Without basic.qos (prefetch count), RabbitMQ greedily floods all available unacknowledged messages into consumer memory buffers, risking OOM crashes and starving peer competing consumers.'
    },
    benchmarkOrInsight: {
      vi: 'Khuyến nghị sản xuất: Prefetch count từ 50 - 200 cho I/O nhanh, hoặc 1 - 10 cho các tác vụ nặng ngốn CPU (như render video, export báo cáo lớn).',
      en: 'Production recommendation: Prefetch 50-200 for lightweight fast tasks, 1-10 for CPU/disk heavy tasks to maintain fair dispatching.'
    }
  },
  datadog_queue_backpressure: {
    source: 'Datadog Engineering',
    title: 'Monitoring Backpressure, Consumer Lag, and Queue Depth in Message Brokers',
    url: 'https://www.datadoghq.com/blog/rabbitmq-monitoring/',
    citationType: 'engineering-guide',
    keyTakeaway: {
      vi: 'Consumer Lag (Kafka) và Queue Depth (RabbitMQ) là chỉ số báo động đỏ số 1 cho hiện tượng thắt cổ chai hệ thống. Phương trình vi phân dQ/dt = λ - μ chỉ ra rằng khi λ > μ trong thời gian kéo dài, bộ nhớ đệm sẽ tràn và gây sụp đổ lan truyền (Cascading Failure).',
      en: 'Consumer Lag and Queue Depth are primary red-alert metrics. The differential equation dQ/dt = λ - μ proves that sustained producer rates exceeding consumer throughput inevitably cascade into out-of-memory collapse.'
    }
  }
};
