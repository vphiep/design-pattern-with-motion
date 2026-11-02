import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const backpressureConsumerLagFlowControlTopic: MessagingTopic = {
  id: 'backpressure-consumer-lag-flow-control',
  category: 'reliability-backpressure',
  level: 'core',
  chapter: 'Chương 04 — Reliability, Backpressure & Distributed Streaming',
  name: 'Backpressure, Consumer Lag & Flow Control',
  tagline: {
    vi: 'Làm chủ cơ chế Backpressure trong hệ thống bất đồng bộ, phương trình vi phân dQ/dt = λ - μ, Consumer Lag và điều phối lưu lượng.',
    en: 'Mastering Backpressure in asynchronous systems, the differential equation dQ/dt = λ - μ, Consumer Lag, and flow control.'
  },
  difficulty: 3,
  order: 11,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Hiện tượng mất cân bằng tốc độ (Mismatched Throughput): Khi Producer đẩy dữ liệu với tốc độ λ = 10.000 msg/s nhưng Consumer chỉ có thể xử lý tối đa μ = 2.000 msg/s. Mỗi giây, 8.000 message bị tồn đọng lại trong hàng đợi. Nếu không có cơ chế Áp suất ngược (Backpressure) hoặc kiểm soát lưu lượng (Flow Control), bộ nhớ RAM và đĩa cứng của broker sẽ bị lấp đầy theo cấp số nhân, dẫn đến sập toàn bộ cụm máy chủ phân tán.',
      en: 'Mismatched Throughput Disparity: When producers ingest data at rate λ = 10k msg/s while consumers only process μ = 2k msg/s, 8,000 unconsumed records accumulate every second. Without Backpressure or Flow Control mechanisms, broker buffers saturate exponentially, triggering cluster-wide out-of-memory collapse.'
    },
    hardwareConstraint: {
      vi: 'Dung lượng RAM, ổ đĩa và băng thông I/O là hữu hạn. Khi RabbitMQ chạm ngưỡng vm_memory_high_watermark (mặc định 40% RAM hệ thống), nó buộc phải chặn kết nối TCP (Alarms & Blocked Connections). Với Kafka, Consumer Lag quá lớn sẽ làm trôi dữ liệu ra khỏi giới hạn lưu trữ retention.ms, gây mất dữ liệu trước khi kịp đọc.',
      en: 'Hardware storage and memory limits are strictly finite. RabbitMQ triggers connection alarms blocking all TCP writes upon reaching vm_memory_high_watermark (40% RAM). For Kafka, ballooning lag causes unread records to exceed retention.ms, causing silent data truncation.'
    },
    fundamentalSolution: {
      vi: 'Kiểm soát phương trình vi phân hàng đợi dQ/dt = λ - μ: 1. Demand-Driven Pull Model (như Kafka poll()): Consumer chỉ kéo đúng lượng message mà mình có khả năng xử lý; 2. RabbitMQ Credit-based Flow Control & basic.qos: Ngăn broker xả lũ; 3. Reactive Streams Backpressure & Bounded Buffers: Tự động giảm tốc độ Producer hoặc kích hoạt Load Shedding (hủy bớt tải không quan trọng) khi Queue Depth vượt ngưỡng nguy hiểm.',
      en: 'Governing the queue differential equation dQ/dt = λ - μ: 1. Demand-Driven Pull Model (Kafka poll()): Consumers fetch strictly what they can process; 2. Credit-based Flow Control & basic.qos (RabbitMQ): Restricts broker pushing; 3. Reactive Streams & Bounded Buffers: Throttles producer ingress or sheds low-priority load when queue depth breaches threshold.'
    },
    math: {
      formula: '\\frac{dQ}{dt} = \\lambda - \\mu, \\quad T_{\\text{drain}} = \\frac{Q_{\\text{current}}}{\\mu - \\lambda} \\quad (\\text{khi } \\mu > \\lambda)',
      timeComplexity: 'O(1) backpressure token evaluation',
      spaceComplexity: 'O(Q_{\\text{max}}) — giới hạn cứng của bounded buffer',
      throughputFormula: '\\text{Consumer Lag} = \\sum_{p=0}^{P-1} (\\text{LEO}_p - \\text{CommittedOffset}_p)'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Backpressure (Áp suất ngược) là cơ chế mà trong đó hệ thống downstream có khả năng phát tín hiệu ngược dòng lên upstream để yêu cầu "hãy gửi chậm lại vì tôi đang quá tải". Đây là tiêu chuẩn sống còn trong các hệ thống phân tán chịu tải cao.',
      en: 'Backpressure is the signaling feedback loop allowing downstream consumers to inform upstream producers to slow down during overload. It is a vital survival invariant in high-throughput distributed systems.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Phương trình vi phân dQ/dt = λ - μ: dQ/dt biểu diễn tốc độ thay đổi của Queue Depth (hoặc Consumer Lag). Khi λ > μ, dQ/dt > 0, hàng đợi phình to không giới hạn. Để hệ thống phục hồi, không chỉ cần scale Consumer để μ > λ, mà thời gian phục hồi T_drain = Q / (μ - λ) phải đủ ngắn trước khi đĩa cứng cạn kiệt.',
        en: 'The Differential Equation dQ/dt = λ - μ: Governs queue depth velocity. When λ > μ, dQ/dt > 0 and backlog grows unboundedly. Recovery requires not only scaling consumers such that μ > λ, but ensuring drain time T_drain = Q / (μ - λ) resolves before storage exhaustion.'
      },
      {
        vi: 'Kafka Consumer Lag Monitoring & Burrow/Prometheus: Consumer Lag là khoảng cách giữa Log End Offset (vị trí bản tin mới nhất vừa ghi vào partition) và Current Offset (vị trí bản tin consumer vừa đọc xong). Một hệ thống lành mạnh có Lag xấp xỉ 0 hoặc dao động trong biên độ nhỏ. Nếu Lag tăng liên tục theo đường thẳng dốc đứng, đó là chỉ số báo động đỏ số 1 cho sự cố tắc nghẽn downstream.',
        en: 'Kafka Consumer Lag Observability: Lag measures the gap between Log End Offset (LEO) and the consumer’s committed offset. In a healthy system, lag hovers near zero. Monotonically increasing lag is the primary red alert indicating downstream database locks or processing bottlenecks.'
      },
      {
        vi: 'Các chiến lược xử lý khi quá tải (Overload Strategies): 1. Bounded Queue (Hàng đợi có giới hạn); 2. Rate Limiting (Token Bucket / Leaky Bucket tại API Gateway); 3. Load Shedding (Bỏ qua các tác vụ độ ưu tiên thấp); 4. Auto-scaling (Keda / HPA tự động tăng số lượng Pod Consumer dựa trên chỉ số Consumer Lag).',
        en: 'Overload Mitigation Strategies: 1. Bounded Queues; 2. Ingress Rate Limiting (Token Bucket); 3. Graceful Load Shedding (dropping low-priority telemetry); 4. Event-Driven Auto-scaling (KEDA / Kubernetes HPA scaling consumer pods driven by Kafka lag).'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Dùng Unbounded In-Memory Queue trong Consumer: Lưu trữ message lấy từ broker vào LinkedBlockingQueue vô hạn trong RAM của JVM. Khi database chậm, hàng triệu object tích tụ trong RAM gây Full GC Stop-the-World và sập toàn bộ pod.',
        en: 'Unbounded In-Memory Buffers: Buffering records into unbounded LinkedBlockingQueues inside consumers. When databases slow, millions of heap objects trigger fatal Full GC pauses and pod crashes.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cơ chế Áp suất ngược Backpressure: Điều tiết Tốc độ λ và μ',
      en: 'Backpressure Feedback Loop: Regulating Rates λ and μ'
    },
    description: {
      vi: 'Sơ đồ so sánh trạng thái quá tải khi λ > μ và cơ chế tự điều tiết với Reactive Streams và Token Bucket.',
      en: 'Architectural schematic contrasting unconstrained queue explosion against credit-based backpressure flow regulation.'
    },
    asciiDiagram: `
[UNCONTROLLED QUEUE EXPLOSION: λ = 10,000 msg/s > μ = 2,000 msg/s]
Producer (10,000/s) ===> [ QUEUE DEPTH: +8,000 msg/s ACCUMULATING! ] ===> Consumer (2,000/s)
                                    |
                         (RAM / Disk 100% Saturation)
                                    |
                             [SYSTEM OUTAGE!]

[REACTIVE BACKPRESSURE FLOW CONTROL]
Producer <--- [BACKPRESSURE SIGNAL: Pause / Slow Down] ---+
    |                                                      |
(Throttled to 2,000/s)                                     |
    |                                                      |
    v                                                      |
[ BOUNDED QUEUE (Max 5,000 msgs) ] (High-Watermark 80% Triggered!)
    |
    v
Consumer (Consumes at 2,000/s with zero memory strain)
`,
    components: [
      {
        name: 'Log End Offset (LEO)',
        role: 'Stream Head Marker',
        description: {
          vi: 'Vị trí của message tiếp theo chuẩn bị được ghi vào partition bởi Producer.',
          en: 'Offset of the next record to be appended to the partition log by producers.'
        }
      },
      {
        name: 'Consumer Current Offset',
        role: 'Reader Checkpoint',
        description: {
          vi: 'Vị trí message cuối cùng mà Consumer Group đã xử lý và commit thành công.',
          en: 'Highest offset acknowledged and committed by the consumer group.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Lưu lượng Producer tăng vọt (λ = 8.000 msg/s)', en: 'Producer spike (λ = 8k msg/s)' },
      phase: 'Spike Ingestion',
      description: {
        vi: 'Khách hàng truy cập đợt khuyến mãi, tốc độ gửi tăng từ 1.000 lên 8.000 msg/s.',
        en: 'Flash traffic surges ingestion rate from 1,000 to 8,000 records/sec.'
      },
      brokerBehavior: {
        vi: 'Log End Offset (LEO) tăng vọt nhanh chóng.',
        en: 'Log End Offset (LEO) accelerates rapidly.'
      },
      javaCodeLineMatch: 'dQ/dt = lambda - mu > 0'
    },
    {
      id: 'step-1',
      title: { vi: 'Consumer Lag bắt đầu tích tụ trong Queue', en: 'Consumer lag accumulates' },
      phase: 'Backlog Accumulation',
      description: {
        vi: 'Consumer chỉ xử lý được 2.000 msg/s. Mỗi giây có 6.000 message bị tồn đọng (Lag = 6.000, 12.000, 18.000...).',
        en: 'Consumer processes 2k msg/s. Backlog accumulates at 6,000 records/sec.'
      },
      brokerBehavior: {
        vi: 'Broker ghi dữ liệu xuống đĩa an toàn, metrics consumer_lag cảnh báo màu vàng.',
        en: 'Broker flushes to disk; consumer_lag metric breaches warning threshold.'
      },
      javaCodeLineMatch: 'long lag = logEndOffset - currentOffset;'
    },
    {
      id: 'step-2',
      title: { vi: 'KEDA kích hoạt Auto-scaling thêm Consumer Pods', en: 'KEDA triggers horizontal auto-scaling' },
      phase: 'Elastic Scale-out',
      description: {
        vi: 'Kubernetes HPA / KEDA đọc metric lag > 10.000, tự động scale số lượng Consumer Pod từ 2 lên 8 pods.',
        en: 'KEDA detects lag > 10k, scaling consumer pods horizontally from 2 to 8.'
      },
      brokerBehavior: {
        vi: 'Cooperative Rebalance diễn ra trong vài giây, chia sẻ các partition cho các pod mới.',
        en: 'Cooperative rebalance assigns idle partitions to newly spawned workers.'
      },
      javaCodeLineMatch: 'keda.sh/v1alpha1: ScaledObject (kafka lag threshold = 2000)'
    },
    {
      id: 'step-3',
      title: { vi: 'Tốc độ μ vượt qua λ -> Hàng đợi phục hồi', en: 'Consumer rate exceeds producer -> Drained' },
      phase: 'Recovery & Drain',
      description: {
        vi: '8 Pods đạt tổng tốc độ μ = 12.000 msg/s. dQ/dt = 8.000 - 12.000 = -4.000 msg/s. Hàng đợi được dọn sạch hoàn toàn.',
        en: '8 pods deliver aggregate μ = 12k msg/s. Net dQ/dt = -4k msg/s. Backlog fully drained.'
      },
      brokerBehavior: {
        vi: 'Consumer Lag quay trở về 0, hệ thống trở lại trạng thái cân bằng hoàn hảo.',
        en: 'Consumer Lag returns to zero; cluster reaches steady equilibrium.'
      },
      javaCodeLineMatch: 'T_drain = Q / (mu - lambda)'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Credit-based Flow Control & Connection Alarms', en: 'Credit-based flow control & alarms' },
      keyMechanism: {
        vi: 'Khi RAM hoặc Disk chạm ngưỡng cảnh báo, RabbitMQ chặn (Block) toàn bộ kết nối TCP của Producer cho đến khi Consumer tiêu thụ bớt.',
        en: 'Blocks producer TCP sockets when memory/disk limits breach alarms until consumers relieve pressure.'
      },
      configExample: 'vm_memory_high_watermark.relative = 0.4',
      architectureNote: {
        vi: 'Bảo vệ broker không bị crash, nhưng khiến các Producer bị nghẽn đồng bộ nếu không có bộ đệm cục bộ.',
        en: 'Guarantees broker survival, but pauses producers synchronously unless client-side buffered.'
      }
    },
    kafka: {
      role: { vi: 'Decoupled Pull Model & Partition Scalability', en: 'Decoupled pull-based backpressure' },
      keyMechanism: {
        vi: 'Producer ghi độc lập với Consumer. Backpressure tự nhiên: Consumer không bao giờ bị nghẽn vì tự quyết định khi nào gọi poll().',
        en: 'Producers write independently. Consumers never crash from flood because they pull via poll() on demand.'
      },
      configExample: 'max.poll.records=50, fetch.max.bytes=52428800',
      architectureNote: {
        vi: 'Không chặn Producer; cho phép lưu trữ hàng Terabyte dữ liệu chờ Consumer phục hồi trong nhiều ngày.',
        en: 'Never blocks producers; retains terabytes of backlog safely on disk for days.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Bảo vệ hệ thống phân tán 100% không bị sập nguồn khi xảy ra các đợt lưu lượng đột biến.',
        en: 'Guarantees 100% cluster survival under extreme traffic spikes.'
      },
      {
        vi: 'Cho phép tối ưu hóa chi phí phần cứng thông qua Auto-scaling theo nhu cầu thực tế.',
        en: 'Optimizes cloud infrastructure costs via demand-driven elasticity.'
      }
    ],
    cons: [
      {
        vi: 'Độ trễ xử lý (End-to-End Latency) tăng lên trong thời gian hàng đợi đang tích lũy Lag.',
        en: 'End-to-end processing latency elevates while consumer lag is draining.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Backpressure chấp nhận đánh đổi độ trễ tức thời để duy trì tính toàn vẹn và thông lượng ổn định của toàn hệ thống.',
      en: 'Backpressure sacrifices real-time immediacy to preserve overall throughput integrity.'
    },
    orderingGuarantee: {
      vi: 'Duy trì thứ tự nghiêm ngặt trong từng Partition trong suốt quá trình xả hàng đợi tồn đọng.',
      en: 'Maintains strict in-partition ordering throughout backlog drain cycles.'
    }
  },

  javaCode: `package com.enterprise.messaging.backpressure;

import org.springframework.stereotype.Service;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import java.time.Duration;

@Service
public class BackpressureFlowController {

    private final RateLimiter rateLimiter;

    public BackpressureFlowController() {
        // Enforce ingress rate limit: Max 5,000 requests per second to protect broker
        RateLimiterConfig config = RateLimiterConfig.custom()
            .limitRefreshPeriod(Duration.ofSeconds(1))
            .limitForPeriod(5000)
            .timeoutDuration(Duration.ofMillis(200))
            .build();

        this.rateLimiter = RateLimiter.of("order-ingress-limiter", config);
    }

    public boolean tryAcquirePermit() {
        return rateLimiter.acquirePermission();
    }
}`,

  springConfigCode: `# Kubernetes KEDA ScaledObject for Kafka Lag-driven Autoscaling
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: kafka-order-consumer-scaler
spec:
  scaleTargetRef:
    name: order-consumer-deployment
  minReplicaCount: 2
  maxReplicaCount: 16
  triggers:
  - type: kafka
    metadata:
      bootstrapServers: kafka:9092
      consumerGroup: order-processing-group
      topic: orders-v1
      lagThreshold: "2000"`,

  interviewQuestions: [
    {
      question: {
        vi: 'Consumer Lag trong Kafka là gì? Làm thế nào để phân biệt giữa Lag lành mạnh và Lag nguy hiểm?',
        en: 'What is Consumer Lag in Kafka? How do you distinguish between healthy lag and dangerous lag?'
      },
      answer: {
        vi: 'Consumer Lag là hiệu số giữa Log End Offset (vị trí message mới nhất của Partition) và Current Offset của Consumer Group. Lag lành mạnh: Tăng nhẹ trong vài giây khi có spike traffic rồi giảm nhanh về 0 khi consumer xử lý xong (dQ/dt dao động quanh 0). Lag nguy hiểm: Tăng liên tục không giảm theo thời gian (dQ/dt > 0 kéo dài), chứng tỏ tốc độ của Consumer nhỏ hơn tốc độ Producer (μ < λ) hoặc Consumer đang bị deadlock, rớt kết nối database. Nếu không can thiệp, dữ liệu sẽ bị trôi khỏi retention time và mất mát.',
        en: 'Consumer Lag is the offset delta between Log End Offset and current committed offset. Healthy lag fluctuates during traffic bursts and returns quickly to near-zero (dQ/dt averages 0). Dangerous lag exhibits continuous monotonic growth (dQ/dt > 0), proving consumer throughput is lagging below producer intake (μ < λ) or workers are deadlocked. Unresolved lag risks data deletion past retention thresholds.'
      },
      seniority: 'Senior'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sập hệ thống xử lý hồ sơ bảo hiểm do Consumer Lag phình to 14 triệu bản tin',
      en: 'Insurance Claims Processing Outage Caused by 14 Million Consumer Lag Backlog'
    },
    businessContext: {
      vi: 'Hệ thống thẩm định bồi thường bảo hiểm tự động tiếp nhận 300.000 hồ sơ claim mỗi ngày.',
      en: 'An automated insurance claim adjudication platform processing 300,000 claims daily.'
    },
    problemDescription: {
      vi: 'Cơ sở dữ liệu Oracle lưu trữ hồ sơ gặp sự cố khóa bảng (Row Lock Contention), khiến mỗi claim xử lý từ 20ms tăng lên 2.500ms. Trong khi Producer vẫn đẩy 1.000 claim/s, tốc độ của 4 Consumer Pod giảm xuống còn 40 claim/s. Sau 4 giờ, Consumer Lag phình to lên 13.8 triệu message. Dung lượng đĩa Kafka cluster chạm ngưỡng 92%, chuẩn bị kích hoạt xóa dữ liệu tự động.',
      en: 'Oracle database experienced row lock contention, slowing claim processing from 20ms to 2,500ms. Producers pushed 1,000 claims/sec while 4 pods processed only 40/sec. In 4 hours, lag reached 13.8 million records. Kafka disk usage reached 92%, threatening automated retention data purging.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư restart toàn bộ Kafka cluster, dẫn đến các broker phải chạy recovery log mất 45 phút, làm toàn bộ dịch vụ ngưng trệ.',
      en: 'Ops rebooted the Kafka cluster, forcing a 45-minute log recovery scan that took the entire business offline.'
    },
    coreSolution: {
      vi: '1. Khắc phục row lock trên Oracle; 2. Tăng partition của topic từ 4 lên 24; 3. Cấu hình KEDA tự động scale Consumer pods từ 4 lên 24; 4. Kích hoạt Batching DB writes (JDBC batch update 100 records/lần). Tốc độ xử lý của Consumer tăng vọt từ 40 claim/s lên 15.000 claim/s, dọn sạch 13.8 triệu lag trong 20 phút.',
      en: '1. Resolved Oracle row locks; 2. Expanded topic partitions to 24; 3. Deployed KEDA to autoscale consumer pods to 24; 4. Enabled JDBC batch updates (100 rows/batch). Consumption throughput surged from 40 to 15,000 claims/sec, clearing 13.8M lag in 20 minutes.'
    },
    productionCode: `// High-Throughput Batch Processing Consumer
@KafkaListener(topics = "insurance-claims", containerFactory = "batchKafkaFactory")
public void processBatch(List<ConsumerRecord<String, String>> records, Acknowledgment ack) {
    List<ClaimEntity> entities = records.stream()
        .map(r -> parseClaim(r.value()))
        .toList();
    
    // Batch insert into Oracle DB in a single round-trip
    claimJdbcRepository.batchInsert(entities);
    ack.acknowledge();
}`,
    architectureImpact: {
      vi: 'Giải tỏa hoàn toàn 13.8 triệu backlog; thời gian xử lý claim trở lại mức 18ms; thiết lập cơ chế KEDA tự động phòng vệ cho các đợt quá tải tương lai.',
      en: '13.8M backlog cleared completely; claim latency restored to 18ms; established automated KEDA autoscaling defenses.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.datadog_queue_backpressure,
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions
  ]
};
