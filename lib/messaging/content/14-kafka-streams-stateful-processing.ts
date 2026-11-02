import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const kafkaStreamsStatefulProcessingTopic: MessagingTopic = {
  id: 'kafka-streams-stateful-processing',
  category: 'advanced-streaming',
  level: 'advanced',
  chapter: 'Chuyên Đề Nâng Cao — Advanced Distributed Streaming',
  name: 'Kafka Streams & Stateful Stream Processing',
  tagline: {
    vi: 'Xử lý luồng trạng thái với KStream, KTable, bộ nhớ đệm RocksDB cục bộ, cơ chế Changelog Topic và Windowing.',
    en: 'Stateful stream processing with KStream, KTable, embedded RocksDB state stores, changelog topics, and windowing.'
  },
  difficulty: 3,
  order: 14,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      vi: 'Khi xử lý luồng sự kiện thời gian thực (ví dụ: đếm số lượng giao dịch của mỗi thẻ tín dụng trong vòng 5 phút để phát hiện gian lận), ứng dụng cần lưu giữ trạng thái trung gian (Stateful Aggregation). Nếu lưu trạng thái này vào database bên ngoài (PostgreSQL, Redis), mỗi event trong luồng 100.000 msg/s sẽ phát sinh 1 network call, gây thắt cổ chai I/O và sập database.',
      en: 'Real-time stream computations (e.g. counting transactions per credit card in 5-minute sliding windows for fraud detection) require stateful aggregations. Querying an external database (Redis, Postgres) for every event at 100k msg/s saturates network I/O and collapses database engines.'
    },
    hardwareConstraint: {
      vi: 'Độ trễ mạng giữa Application Server và Database Server (1 - 5ms) cao gấp 1.000 lần so với truy cập bộ nhớ cục bộ SSD NVMe / RAM (1 - 5 microsecond).',
      en: 'Network round-trip latency to external databases (1-5ms) is 1,000x slower than local NVMe SSD or RAM lookups (1-5 microseconds).'
    },
    fundamentalSolution: {
      vi: 'Kafka Streams nhúng trực tiếp cơ sở dữ liệu khóa-giá trị nhúng RocksDB vào bên trong JVM của mỗi Worker pod (Local State Store). Mọi thao tác đọc/ghi trạng thái diễn ra tại đĩa cục bộ với tốc độ microsecond. Để bảo đảm không mất dữ liệu khi Pod bị chết, mọi biến động của RocksDB được tự động sao lưu ngầm sang một Changelog Topic (Compacted) trên Kafka.',
      en: 'Kafka Streams embeds a high-performance key-value database (RocksDB) directly inside each application pod’s local disk. State read/writes execute at microsecond speeds. To ensure durability when pods terminate, all local mutations asynchronously sync to a replicated compacted Changelog Topic in Kafka.'
    },
    math: {
      formula: 'T_{\\text{lookup}} = O(1) \\text{ via RocksDB LSM-Tree}, \\quad T_{\\text{window}} = [t_{\\text{start}}, t_{\\text{start}} + \\Delta t)',
      timeComplexity: 'O(1) local read/write per stream event',
      spaceComplexity: 'O(W \\times K) — W: window count, K: unique keys',
      throughputFormula: '\\text{Throughput} \\approx 200,000+ \\text{ ops/sec per CPU core (Zero Network I/O for state)}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Kafka Streams là thư viện client Java tiêu chuẩn của Apache Kafka, cho phép xây dựng các ứng dụng Stream Processing phân tán có trạng thái (Stateful) mà không cần cài đặt thêm cụm cluster phức tạp như Apache Spark hay Flink.',
      en: 'Kafka Streams is a lightweight Java client library enabling stateful, resilient distributed stream processing without the operational complexity of heavy cluster managers like Spark or Flink.'
    },
    deepDiveParagraphs: [
      {
        vi: 'KStream vs KTable: KStream đại diện cho dòng chảy sự kiện vô tận (Insert-only facts - ví dụ: từng cú quẹt thẻ tín dụng). KTable đại diện cho trạng thái hiện tại (Update-only snapshot - ví dụ: số dư tài khoản hiện tại). Mối quan hệ Stream-Table Duality chứng minh rằng: Một Stream có thể tổng hợp thành một Table, và mọi biến động của một Table có thể phát ra thành một Stream.',
        en: 'KStream vs KTable: KStream represents unbounded append-only event streams (e.g., individual credit card swipes). KTable represents current state snapshots (e.g., current account balances). The Stream-Table Duality proves: a stream aggregates into a table, and a table’s changelog emits a stream.'
      },
      {
        vi: 'Các loại Windowing: 1. Tumbling Window (Cửa sổ cố định không chồng lấn - ví dụ: 00:00-00:05, 00:05-00:10); 2. Hopping/Sliding Window (Cửa sổ trượt chồng lấn - ví dụ: 5 phút trượt mỗi 1 phút); 3. Session Window (Cửa sổ phiên dựa trên khoảng lặng không có hoạt động - Inactivity Gap).',
        en: 'Windowing Semantics: 1. Tumbling Windows (fixed-size, non-overlapping intervals); 2. Hopping/Sliding Windows (fixed-size, overlapping windows advancing by hops); 3. Session Windows (dynamically aggregated intervals bounded by inactivity gaps).'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Thời gian khôi phục State Store (State Standby Replicas): Khi một Pod Kubernetes bị restart, nó phải tải lại toàn bộ Changelog Topic từ Kafka để dựng lại database RocksDB cục bộ. Nếu dữ liệu lớn (50GB), Pod sẽ mất 30 phút để khởi động xong. Giải pháp: Cấu hình num.standby.replicas = 1 để các Pod dự phòng liên tục sao chép sẵn dữ liệu trong RAM.',
        en: 'Slow State Store Hydration on Restarts: Restarts require replaying the changelog topic from Kafka to rebuild local RocksDB. If state is 50GB, pod boot takes 30 minutes. Solution: configure num.standby.replicas=1 for warm standby state replication.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Kiến trúc Local RocksDB State Store & Backup Changelog Topic',
      en: 'Embedded RocksDB State Store & Changelog Topic Architecture'
    },
    description: {
      vi: 'Sơ đồ luồng xử lý trạng thái tại đĩa cục bộ của pod và cơ chế sao lưu tự động sang Kafka Changelog.',
      en: 'Physical topology of local embedded RocksDB fast storage synchronized to durable Kafka changelog partitions.'
    },
    asciiDiagram: `
[INPUT TOPIC: payments] ===> [STREAMING WORKER POD]
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v (Local Microsecond I/O)                       v (Asynchronous Replication)
    [EMBEDDED ROCKSDB (Local NVMe)]                [CHANGELOG TOPIC: payments-state-changelog]
    Key: "Card-99" -> Count: 14                    (Compacted Topic on Kafka Cluster)
    (Aggregates sliding 5-min window)                       |
                                                  (If Pod dies, new Pod restores from Changelog!)
`,
    components: [
      {
        name: 'Embedded RocksDB',
        role: 'Local High-Speed Cache',
        description: {
          vi: 'Cơ sở dữ liệu LSM-Tree nhúng viết bằng C++ chạy trực tiếp trong memory map của tiến trình Java.',
          en: 'Embedded C++ LSM-tree database running directly within the Java worker process memory map.'
        }
      },
      {
        name: 'Changelog Topic',
        role: 'Fault-Tolerant Backup',
        description: {
          vi: 'Topic nội bộ có cleanup.policy=compact lưu trữ toàn bộ lịch sử biến động của State Store.',
          en: 'Internal compacted Kafka topic backing up all state store mutations for instant disaster recovery.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Tiếp nhận Transaction Event từ Input Topic', en: 'Ingest transaction event' },
      phase: 'Stream Ingestion',
      description: {
        vi: 'Kafka Streams đọc event quẹt thẻ từ topic "transactions" theo khóa CardId.',
        en: 'Reads swipe event from transactions topic partitioned by cardId.'
      },
      brokerBehavior: {
        vi: 'Consumer offset tăng lên, không có network call nào ra ngoài.',
        en: 'Consumer offset advances; zero external network I/O.'
      },
      javaCodeLineMatch: 'KStream<String, Transaction> stream = builder.stream("transactions");'
    },
    {
      id: 'step-1',
      title: { vi: 'Cập nhật RocksDB State Store trong microsecond', en: 'Mutate local RocksDB store' },
      phase: 'Local State Aggregation',
      description: {
        vi: 'Tra cứu RocksDB cục bộ, tăng biến đếm số lượng giao dịch trong cửa sổ 5 phút từ 1 lên 2.',
        en: 'Queries local RocksDB, incrementing transaction count in 5-minute sliding window from 1 to 2.'
      },
      brokerBehavior: {
        vi: 'Thực thi ở tầng RAM/NVMe SSD cục bộ với độ trễ < 10 microseconds.',
        en: 'Executes against local NVMe storage in sub-10 microseconds.'
      },
      javaCodeLineMatch: '.groupByKey().windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(5))).count()'
    },
    {
      id: 'step-2',
      title: { vi: 'Phát hiện Gian lận & Đẩy Alert sang Topic Output', en: 'Fraud detection alert emitted' },
      phase: 'Output Notification',
      description: {
        vi: 'Nếu số giao dịch > 5 trong 5 phút, phát ra AlertEvent sang topic "fraud-alerts" để khóa thẻ ngay.',
        en: 'If count > 5 within 5 minutes, streams an AlertEvent to fraud-alerts to freeze card.'
      },
      brokerBehavior: {
        vi: 'Output topic nhận alert và kích hoạt các downstream service.',
        en: 'Output topic triggers downstream automated card freeze workflows.'
      },
      javaCodeLineMatch: '.filter((key, count) -> count > 5).toStream().to("fraud-alerts");'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Không hỗ trợ Stateful Stream Processing', en: 'Stateless task dispatch only' },
      keyMechanism: {
        vi: 'RabbitMQ chỉ là hàng đợi chuyển phát message, không có khả năng tính toán cửa sổ thời gian (Windowing) hay lưu trạng thái KTable.',
        en: 'Pure message broker; lacks native windowing, stream joins, or embedded KTable state stores.'
      },
      configExample: 'N/A',
      architectureNote: {
        vi: 'Nếu muốn xử lý stream trên RabbitMQ, buộc phải code thủ công với Redis/PostgreSQL bên ngoài.',
        en: 'Stateful stream processing on RabbitMQ requires custom code and external database lookups.'
      }
    },
    kafka: {
      role: { vi: 'Nền tảng Stream Processing phân tán mạnh nhất', en: 'Premier stateful streaming engine' },
      keyMechanism: {
        vi: 'Tích hợp native Kafka Streams DSL, KStream-KTable Join, Sliding Windows và RocksDB State Store.',
        en: 'Native Kafka Streams DSL, stream-table joins, sliding windows, and RocksDB state resilience.'
      },
      configExample: 'num.standby.replicas=1, state.dir=/var/data/kafka-streams',
      architectureNote: {
        vi: 'Ứng dụng chạy như một ứng dụng Java Spring Boot thông thường, tự động scale theo số partition.',
        en: 'Runs as standard Spring Boot microservices, scaling elastically matching topic partition counts.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Tốc độ xử lý trạng thái cực cao (hàng trăm ngàn event/giây) nhờ lưu trữ cục bộ RocksDB.',
        en: 'Blazing local state throughput (hundreds of thousands events/sec) via embedded RocksDB.'
      },
      {
        vi: 'Không phụ thuộc vào Database bên ngoài, loại bỏ hoàn toàn điểm nghẽn hạ tầng.',
        en: 'Zero external database dependencies, eliminating distributed latency bottlenecks.'
      }
    ],
    cons: [
      {
        vi: 'Cần cấp phát đĩa lưu trữ cục bộ (Persistent Volume) cho các Pod Kubernetes.',
        en: 'Requires Persistent Volumes provisioned on Kubernetes worker nodes.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Latency tổng hợp cửa sổ thời gian chỉ từ 5 - 15 microsecond trên đĩa NVMe cục bộ.',
      en: 'Local state aggregation latency averages 5-15 microseconds on NVMe SSD storage.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm thứ tự xử lý sự kiện nghiêm ngặt theo Event Time (Timestamp) thông qua TimestampExtractor.',
      en: 'Strict deterministic event-time order processing enforced via TimestampExtractor.'
    }
  },

  javaCode: `package com.enterprise.messaging.streams;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafkaStreams;
import java.time.Duration;

@Configuration
@EnableKafkaStreams
public class FraudDetectionStreamTopology {

    @Bean
    public KStream<String, String> kStream(StreamsBuilder builder) {
        KStream<String, String> transactions = builder.stream(
            "card-transactions",
            Consumed.with(Serdes.String(), Serdes.String())
        );

        // 1. Sliding 5-minute Tumbling Window
        TimeWindows window = TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(5));

        // 2. Stateful Aggregation in local RocksDB
        transactions
            .groupByKey()
            .windowedBy(window)
            .count(Materialized.as("fraud-count-store")) // Backed by RocksDB + Changelog
            .toStream()
            .filter((windowedKey, count) -> count >= 5) // Fraud alert if >= 5 transactions in 5 mins
            .map((windowedKey, count) -> new KeyValue<>(windowedKey.key(), "FRAUD_DETECTED_COUNT=" + count))
            .to("fraud-alerts", Produced.with(Serdes.String(), Serdes.String()));

        return transactions;
    }
}`,

  springConfigCode: `spring:
  kafka:
    streams:
      application-id: fraud-detection-engine
      bootstrap-servers: localhost:9092
      properties:
        num.standby.replicas: 1 # Warm standby for instant pod recovery
        processing.guarantee: exactly_once_v2 # Kafka Streams EOS`,

  interviewQuestions: [
    {
      question: {
        vi: 'Stream-Table Duality (Tính hai mặt giữa Stream và Table) trong Kafka Streams là gì?',
        en: 'Explain the Stream-Table Duality in Kafka Streams.'
      },
      answer: {
        vi: 'Stream-Table Duality phát biểu rằng: 1. Một Stream đại diện cho lịch sử thay đổi (Changelog) - nếu bạn phát lại toàn bộ sự kiện từ đầu, bạn sẽ tái tạo lại trạng thái của một Table; 2. Một Table đại diện cho trạng thái tại một thời điểm (Snapshot) - nếu bạn ghi nhận lại mọi thay đổi trên Table theo thời gian, bạn sẽ thu được một Stream. Trong Kafka Streams, KStream chính là dòng sự kiện biến động liên tục, còn KTable chính là ảnh chụp trạng thái mới nhất của các khóa.',
        en: 'Stream-Table Duality posits: 1. A stream represents the changelog of mutations—replaying a stream from the beginning reconstructs the latest state snapshot of a table; 2. A table represents a point-in-time snapshot—observing mutations over time generates a stream. KStream embodies continuous evolution, while KTable represents current consolidated state per key.'
      },
      seniority: 'Senior'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sập hệ thống cảnh báo gian lận do gọi Redis 200.000 req/s từ Kafka Consumer',
      en: 'Redis Cluster Outage Caused by Direct Real-Time Lookups from Kafka Consumer'
    },
    businessContext: {
      vi: 'Một ngân hàng thanh toán quét giao dịch gian lận thời gian thực với lưu lượng 180.000 giao dịch/giây.',
      en: 'A card payment gateway validating fraud rules in real time across 180,000 transactions/sec.'
    },
    problemDescription: {
      vi: 'Nhóm kỹ sư dùng Consumer thông thường đọc từ Kafka rồi gọi lệnh Redis INCR để đếm số giao dịch trong 1 phút. Cụm Redis bị quá tải kết nối mạng (Network I/O Saturation), CPU Redis chạm 100%, latency tăng từ 1ms lên 400ms, làm nghẽn toàn bộ luồng thanh toán thẻ của ngân hàng.',
      en: 'Engineers wrote consumer pods that invoked Redis INCR over network to track 1-minute transaction windows. The Redis cluster suffered network saturation, CPU pegged at 100%, and latency spiked to 400ms, backing up card authorizations globally.'
    },
    whyNaiveFails: {
      vi: 'Cố gắng chia nhỏ Redis Cluster thành 32 shards. Chi phí hạ tầng tăng 50.000 USD/tháng nhưng vẫn bị ảnh hưởng bởi độ trễ mạng mạng liên máy chủ (Inter-host Network RTT).',
      en: 'Sharding Redis across 32 nodes quadrupled hosting bills while remaining throttled by physical network transport round-trips.'
    },
    coreSolution: {
      vi: 'Chuyển đổi hoàn toàn sang Kafka Streams với Local RocksDB State Store. Biến đếm cửa sổ trượt được lưu ngay trên đĩa NVMe cục bộ của từng worker pod. Độ trễ giảm từ 400ms xuống 8 microsecond; loại bỏ 100% nhu cầu dùng Redis.',
      en: 'Rebuilt using Kafka Streams with local embedded RocksDB. Sliding window counters are manipulated directly in local NVMe storage. Latency plunged from 400ms to 8 microseconds; completely eliminated the external Redis dependency.'
    },
    productionCode: `// Local RocksDB Processing: Zero Redis Network Calls
KTable<Windowed<String>, Long> counts = stream
    .groupByKey()
    .windowedBy(SlidingWindows.ofTimeDifferenceWithNoGrace(Duration.ofMinutes(1)))
    .count(Materialized.as("local-windowed-store"));`,
    architectureImpact: {
      vi: 'Tiết kiệm 50.000 USD/tháng chi phí Redis; độ trễ thẩm định gian lận giảm 99.9% (từ 400ms xuống 8 microsecond); thông lượng đạt 300.000 msg/s ổn định.',
      en: '$50,000/mo saved on Redis; fraud check latency dropped 99.9% (400ms to 8μs); throughput scaled smoothly to 300,000 events/sec.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia,
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions
  ]
};
