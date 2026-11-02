import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const kafkaConsumerGroupsRebalanceTopic: MessagingTopic = {
  id: 'kafka-consumer-groups-rebalance',
  category: 'kafka-streaming',
  level: 'core',
  chapter: 'Chương 03 — Apache Kafka Architecture',
  name: 'Consumer Groups, Offset Management & Rebalancing',
  tagline: {
    vi: 'Phân tích cơ chế Consumer Group Coordinator, cam kết Offset tự động vs thủ công, giao thức Eager vs Cooperative Rebalance và Static Membership.',
    en: 'Analyzing Group Coordinators, Auto vs Manual Offset Commits, Eager vs Cooperative Rebalancing, and Static Membership.'
  },
  difficulty: 3,
  order: 9,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Khi khối lượng dữ liệu streaming tăng gấp nhiều lần, 1 consumer đơn lẻ không thể xử lý kịp và gây tích tụ độ trễ (Consumer Lag). Để mở rộng theo chiều ngang (Scale-out), nhiều Consumer cùng gia nhập một Consumer Group để chia sẻ các Partition. Tuy nhiên, khi một consumer mới tham gia (Scale-up), một consumer bị crash (Scale-down) hoặc xử lý quá lâu, quá trình Tái cân bằng (Rebalance) xảy ra. Với giao thức truyền thống, toàn bộ cluster bị đứng hình (Stop-the-World), làm tê liệt toàn bộ luồng xử lý.',
      en: 'As stream volume surges, single consumers fall behind, creating consumer lag. Scaling out requires multiple consumers joining a Consumer Group to share partition assignments. However, when instances join, crash, or exceed processing timeouts, Rebalancing occurs. Legacy eager protocols freeze all consumers (Stop-the-World), paralyzing event streaming across the enterprise.'
    },
    hardwareConstraint: {
      vi: 'Giới hạn số Partition: Mỗi Partition chỉ có thể được gán cho DUY NHẤT 1 Consumer trong cùng 1 Consumer Group. Nếu Topic có 4 Partition nhưng bạn deploy 6 Consumer, thì 2 Consumer sẽ hoàn toàn ngồi chơi xơi nước (Idle), lãng phí 100% tài nguyên CPU/RAM.',
      en: 'The Partition Concurrency Ceiling: Each partition is assigned to AT MOST ONE active consumer per group. If a topic has 4 partitions and you deploy 6 consumer pods, exactly 2 pods sit completely idle, wasting 100% of their compute.'
    },
    fundamentalSolution: {
      vi: '1. Quản lý Offset độc lập: Mỗi Consumer đọc dữ liệu tuần tự và lưu vị trí đọc hiện tại (Offset) vào topic nội bộ __consumer_offsets; 2. Nâng cấp sang Giao thức Cooperative Sticky Assignor (KIP-429): Thay vì thu hồi toàn bộ partition của tất cả consumer (Eager), Cooperative Rebalance chỉ chuyển giao đúng partition bị thay đổi, cho phép các consumer khác tiếp tục xử lý liên tục 100% không gián đoạn.',
      en: '1. Decoupled Offset State: Consumers commit monotonic read positions to the internal __consumer_offsets topic; 2. Cooperative Sticky Assignor (KIP-429): Replaces disruptive Stop-the-World Eager protocols with incremental rebalancing, migrating only affected partitions while allowing peer workers to stream continuously.'
    },
    math: {
      formula: '\\text{Consumer Lag}_i = \\text{LogEndOffset}_i - \\text{CurrentOffset}_i',
      timeComplexity: 'O(1) commit offset write',
      spaceComplexity: 'O(P) — P là số lượng partition quản lý',
      throughputFormula: '\\text{Max Group Concurrency} = \\min(\\text{Active Consumers}, \\text{Topic Partitions})'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Consumer Group là cơ chế trừu tượng hóa cho phép Kafka vừa hỗ trợ mô hình Hàng đợi (Queue - nhiều worker chia sẻ 1 group) vừa hỗ trợ mô hình Xuất bản/Đăng ký (Pub/Sub - nhiều group độc lập cùng đọc 1 topic mà không ảnh hưởng lẫn nhau).',
      en: 'Consumer Groups are Kafka’s dual abstraction combining Queueing (competing consumers within 1 group) and Publish/Subscribe (independent groups reading the same stream concurrently without cross-interference).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Group Coordinator & Heartbeat Mechanism: Một Broker trong cluster được bầu làm Group Coordinator cho Consumer Group (dựa trên hash(group.id) % 50 partitions của __consumer_offsets). Các Consumer gửi heartbeat định kỳ (heartbeat.interval.ms = 3000ms) để báo hiệu còn sống. Nếu sau session.timeout.ms (45.000ms) không nhận được heartbeat, Coordinator coi consumer đã chết và kích hoạt Rebalance.',
        en: 'Group Coordinator & Heartbeats: The broker hosting the partition hash(group.id) % 50 of __consumer_offsets acts as Group Coordinator. Consumers emit heartbeats (default 3s). If heartbeats cease for session.timeout.ms (default 45s), the coordinator evicts the consumer and triggers a rebalance.'
      },
      {
        vi: 'max.poll.interval.ms — Thủ phạm số 1 gây Rebalance Storm: Nếu logic nghiệp vụ của một lần poll() (ví dụ: gọi API bên thứ ba, ghi dữ liệu nặng) mất nhiều hơn max.poll.interval.ms (mặc định 300.000ms = 5 phút), Kafka Client sẽ tự động rời khỏi Group dù máy chủ vẫn sống! Coordinator kích hoạt rebalance, chuyển partition cho node khác, rồi khi node cũ xử lý xong nó lại join lại, gây ra vòng lặp Rebalance bão táp liên hồi (Rebalance Storm).',
        en: 'max.poll.interval.ms — Root Cause of Rebalance Storms: If poll() execution takes longer than max.poll.interval.ms (default 5 mins), the consumer thread is assumed hung and leaves the group. The coordinator rebalances. When the worker finishes and rejoins, another rebalance fires, triggering an endless cascading Rebalance Storm.'
      },
      {
        vi: 'Auto Commit vs Manual Commit: enable.auto.commit=true tự động commit offset sau mỗi auto.commit.interval.ms (5000ms). Nếu ứng dụng bị crash ở giây thứ 3 sau khi đọc xong nhưng chưa ghi DB, khi restart lại, message bị mất hoặc xử lý trùng lặp. Production bắt buộc phải cấu hình: enable.auto.commit=false và gọi acknowledgment.acknowledge() (Manual Commit).',
        en: 'Auto vs Manual Offset Commit: Auto-commit commits offsets asynchronously every 5s. Crashing mid-batch causes either duplicate processing or silent message loss. Production architectures strictly configure enable.auto.commit=false and invoke manual commit after DB transactions resolve.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Xử lý các tác vụ quá nặng trong Consumer Thread: Gom 500 bản tin trong 1 poll() và xử lý tuần tự mất 10 phút, vượt quá max.poll.interval.ms. Khắc phục: Giảm max.poll.records xuống 50 hoặc dùng Worker Thread Pool xử lý bất đồng bộ.',
        en: 'Processing Heavy Tasks inside Consumer Loop: Fetching 500 records that take 10 minutes to process breaches max.poll.interval.ms. Solution: lower max.poll.records to 50 or decouple processing into worker thread pools.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Phân phối Partition cho Consumer Group: 4 Partitions chia cho 2, 3 và 4 Consumers',
      en: 'Consumer Group Partition Assignment: 4 Partitions Mapped across 2, 3, and 4 Workers'
    },
    description: {
      vi: 'Sơ đồ minh họa cách Kafka gán partition cho các node consumer và trạng thái rảnh rỗi khi vượt quá số partition.',
      en: 'Topological diagram showing dynamic partition assignments and consumer idle states under over-provisioning.'
    },
    asciiDiagram: `
TOPIC "orders": [Partition 0]  [Partition 1]  [Partition 2]  [Partition 3]

SCENARIO 1: 2 CONSUMERS IN GROUP "payment-service"
   Consumer 1 <==== [P0], [P1]
   Consumer 2 <==== [P2], [P3]

SCENARIO 2: SCALE-UP TO 3 CONSUMERS (Cooperative Sticky Rebalance)
   Consumer 1 <==== [P0], [P1]
   Consumer 2 <==== [P2]
   Consumer 3 <==== [P3] (P3 migrated seamlessly without stopping P0, P1, P2!)

SCENARIO 3: OVER-PROVISION TO 5 CONSUMERS
   Consumer 1 <==== [P0]
   Consumer 2 <==== [P1]
   Consumer 3 <==== [P2]
   Consumer 4 <==== [P3]
   Consumer 5 <==== [IDLE - WAITING AS HOT STANDBY] (No partition available!)
`,
    components: [
      {
        name: '__consumer_offsets Topic',
        role: 'Internal State Store',
        description: {
          vi: 'Topic hệ thống gồm 50 partition lưu trữ offset commit của tất cả các Consumer Group trong cluster.',
          en: 'Internal 50-partition topic storing committed offsets and metadata for all cluster consumer groups.'
        }
      },
      {
        name: 'Cooperative Sticky Assignor',
        role: 'Incremental Rebalance Protocol',
        description: {
          vi: 'Thuật toán tái cân bằng từng bước, giữ nguyên quyền sở hữu của các partition không bị ảnh hưởng.',
          en: 'Rebalance protocol migrating only shifted partitions, avoiding Stop-the-World pauses.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Consumer 1 và 2 chia nhau 4 Partitions', en: 'Initial 2-consumer assignment' },
      phase: 'Stable Streaming',
      description: {
        vi: 'Consumer 1 đọc P0, P1; Consumer 2 đọc P2, P3. Cụm hoạt động ổn định.',
        en: 'Consumer 1 consumes P0/P1; Consumer 2 consumes P2/P3. Group status is Stable.'
      },
      brokerBehavior: {
        vi: 'Group Coordinator ghi nhận 2 member active.',
        en: 'Group Coordinator tracks 2 active group members.'
      },
      javaCodeLineMatch: '@KafkaListener(topics = "orders", groupId = "order-group")'
    },
    {
      id: 'step-1',
      title: { vi: 'Thêm Consumer 3 (Kích hoạt Cooperative Rebalance)', en: 'Consumer 3 joins group' },
      phase: 'Incremental Rebalance',
      description: {
        vi: 'Kubernetes scale thêm Pod Consumer 3. Coordinator gửi thông điệp yêu cầu chuyển giao P3 từ Consumer 2 sang Consumer 3.',
        en: 'Pod 3 joins. Coordinator requests incremental handover of P3 from Consumer 2 to 3.'
      },
      brokerBehavior: {
        vi: 'Consumer 1 vẫn tiếp tục đọc P0 và P1 bình thường (KHÔNG HỀ BỊ DỪNG LẠI!).',
        en: 'Consumer 1 continues processing P0 & P1 without interruption (zero stop-the-world!).'
      },
      javaCodeLineMatch: 'partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor'
    },
    {
      id: 'step-2',
      title: { vi: 'Commit Offset thủ công sau khi xử lý thành công', en: 'Manual offset commit post-processing' },
      phase: 'Offset Checkpoint',
      description: {
        vi: 'Consumer gọi acknowledgment.acknowledge(). Offset mới nhất được ghi vào topic __consumer_offsets.',
        en: 'Consumer calls acknowledgment.acknowledge(). Offset is persisted to __consumer_offsets.'
      },
      brokerBehavior: {
        vi: 'Consumer Lag của partition này giảm về 0.',
        en: 'Consumer Lag drops to zero.'
      },
      javaCodeLineMatch: 'acknowledgment.acknowledge();'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Hàng đợi cạnh tranh tự do (Competing Consumers)', en: 'Free-form competing consumers' },
      keyMechanism: {
        vi: 'Không có khái niệm Partition. Bất kỳ số lượng worker nào cũng có thể cùng cắm vào 1 Queue, không bị giới hạn số lượng.',
        en: 'Lacks partitions. Any arbitrary number of workers can listen to a queue without concurrency caps.'
      },
      configExample: 'concurrency=10, max-concurrency=50',
      architectureNote: {
        vi: 'Dễ scale linh hoạt nhưng không bảo đảm được thứ tự xử lý khi có nhiều consumer.',
        en: 'Trivial elastic scaling, but sacrifices global order guarantees under concurrency.'
      }
    },
    kafka: {
      role: { vi: 'Phân quyền Partition độc quyền (Exclusive Assignment)', en: 'Exclusive partition assignment' },
      keyMechanism: {
        vi: 'Mỗi partition chỉ có 1 consumer active trong 1 group. Số lượng consumer hiệu quả tối đa bằng số partition.',
        en: '1-to-1 partition ownership per group. Maximum concurrent active workers strictly capped by partition count.'
      },
      configExample: 'partition.assignment.strategy=CooperativeStickyAssignor',
      architectureNote: {
        vi: 'Bảo đảm thứ tự 100% trong từng partition; scale-up đòi hỏi phải thiết kế đủ số partition từ trước.',
        en: '100% sequential order per partition; requires planning partition capacity upfront.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Tự động mở rộng và tự phục hồi (Self-Healing) khi worker pods bị crash trong Kubernetes.',
        en: 'Automated horizontal scaling and self-healing when worker pods fail.'
      },
      {
        vi: 'Cooperative Rebalancing loại bỏ hiện tượng đứng hình Stop-the-World.',
        en: 'Cooperative rebalance completely eliminates Stop-the-World ingestion pauses.'
      }
    ],
    cons: [
      {
        vi: 'Bị giới hạn mức độ song song bởi số lượng Partition của Topic.',
        en: 'Maximum concurrency strictly constrained by topic partition count.'
      },
      {
        vi: 'Nếu cấu hình max.poll.interval.ms sai sẽ dẫn đến Rebalance Storm làm tê liệt hệ thống.',
        en: 'Misconfigured poll timeouts trigger destructive rebalance storms.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Cooperative Rebalance giảm thời gian gián đoạn từ 30 giây (Eager) xuống dưới 100 miligiây.',
      en: 'Cooperative protocols reduce rebalancing downtime from 30s (Eager) to under 100ms.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm tuyệt đối thứ tự trong từng partition vì không bao giờ có 2 consumer cùng đọc 1 partition trong cùng 1 group.',
      en: 'Absolute order guaranteed per partition due to exclusive single-consumer ownership.'
    }
  },

  javaCode: `package com.enterprise.messaging.consumer;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

@Service
public class ResilientOrderConsumer {

    @KafkaListener(
        topics = "orders-v1",
        groupId = "billing-processing-group",
        containerFactory = "cooperativeKafkaListenerContainerFactory"
    )
    public void consumeOrder(ConsumerRecord<String, String> record,
                             Acknowledgment ack) {
        try {
            System.out.printf("Received order: Key=%s, Partition=%d, Offset=%d%n",
                    record.key(), record.partition(), record.offset());

            // 1. Process business logic (Idempotent DB write)
            processOrderPayload(record.value());

            // 2. Manual ACK to commit offset to __consumer_offsets
            ack.acknowledge();
        } catch (Exception ex) {
            System.err.println("Transient processing error: " + ex.getMessage());
            // Do NOT acknowledge: Message will be re-polled or routed to DLT
            throw ex;
        }
    }

    private void processOrderPayload(String payload) {}
}`,

  springConfigCode: `spring:
  kafka:
    consumer:
      enable-auto-commit: false # Mandatory for Zero Loss
      auto-offset-reset: earliest
      max-poll-records: 50      # Prevent exceeding poll timeout
      properties:
        max.poll.interval.ms: 300000 # 5 minutes execution threshold
        session.timeout.ms: 45000    # Heartbeat timeout
        heartbeat.interval.ms: 3000
        partition.assignment.strategy: org.apache.kafka.clients.consumer.CooperativeStickyAssignor
    listener:
      ack-mode: manual_immediate`,

  interviewQuestions: [
    {
      question: {
        vi: 'Rebalance Storm trong Kafka là gì? Làm thế nào để ngăn chặn hiện tượng này trong production?',
        en: 'What is a Kafka Rebalance Storm? How do you prevent it in production?'
      },
      answer: {
        vi: 'Rebalance Storm là hiện tượng các consumer trong group liên tục bị Coordinator trục xuất và tái cân bằng không ngừng nghỉ. Nguyên nhân phổ biến nhất: Consumer kéo về quá nhiều message (max.poll.records lớn) và xử lý quá lâu, vượt quá max.poll.interval.ms. Coordinator cho rằng consumer đã chết nên trigger rebalance. Cách khắc phục: 1. Giảm max.poll.records xuống giá trị phù hợp (ví dụ 50 thay vì 500); 2. Tăng max.poll.interval.ms; 3. Chuyển sang giao thức CooperativeStickyAssignor; 4. Sử dụng Static Membership (group.instance.id) trên Kubernetes để khi Pod restart nhanh không bị kích hoạt rebalance.',
        en: 'A Rebalance Storm is a cascading state where consumers repeatedly trigger rebalances in a vicious loop. Root cause: heavy processing exceeding max.poll.interval.ms causes the coordinator to evict live workers. Prevention: 1. Decrease max.poll.records; 2. Increase max.poll.interval.ms; 3. Use CooperativeStickyAssignor; 4. Leverage Static Membership (group.instance.id) so Kubernetes pod restarts bypass rebalances within session.timeout.ms.'
      },
      seniority: 'Lead'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sập hệ thống xử lý tin nhắn đợt Black Friday do Rebalance Storm kéo dài 45 phút',
      en: 'Black Friday Kafka Outage Caused by Eager Rebalance Storm Cascade'
    },
    businessContext: {
      vi: 'Một cổng thanh toán trực tuyến xử lý luồng giao dịch Black Friday với 24 Partition và 24 Consumer Pods trên Kubernetes.',
      en: 'An online payment gateway processing Black Friday transaction streams across 24 Kafka partitions and 24 Kubernetes pods.'
    },
    problemDescription: {
      vi: 'Do một service kiểm tra gian lận (Fraud Detection) phản hồi chậm (từ 50ms lên 4.000ms), một Consumer Pod mất 6 phút để xử lý 100 record, vượt quá max.poll.interval.ms (5 phút). Coordinator coi Pod này chết, kích hoạt Eager Rebalance. Toàn bộ 24 Pod bị dừng xử lý (Stop-the-World). Khi 24 Pod join lại, một Pod khác lại bị timeout, kích hoạt rebalance tiếp theo. Chuỗi rebalance kéo dài suốt 45 phút, Consumer Lag tích tụ lên 3.5 triệu message.',
      en: 'Third-party fraud API slowed to 4,000ms. One pod took 6 minutes to process a batch, breaching max.poll.interval.ms (5m). Coordinator declared it dead, firing an Eager Rebalance that stopped all 24 pods. As pods rejoined, another timed out, locking the cluster in a 45-minute rebalance storm. Lag reached 3.5M records.'
    },
    whyNaiveFails: {
      vi: 'Kỹ sư tăng số lượng Pod lên 48. Nhưng do topic chỉ có 24 Partition, 24 Pod mới hoàn toàn rảnh rỗi mà lại làm quá trình rebalance metadata lâu hơn gấp đôi.',
      en: 'Engineers scaled pods to 48. Since the topic only had 24 partitions, 24 pods sat idle while doubling rebalance coordination overhead.'
    },
    coreSolution: {
      vi: '1. Đổi chiến lược phân vùng sang CooperativeStickyAssignor; 2. Giảm max.poll.records từ 500 xuống 20; 3. Tăng max.poll.interval.ms lên 10 phút; 4. Kích hoạt Static Membership (group.instance.id = POD_NAME) kết hợp StatefulSet.',
      en: '1. Upgraded partition.assignment.strategy to CooperativeStickyAssignor; 2. Reduced max.poll.records to 20; 3. Increased max.poll.interval.ms to 10m; 4. Configured Static Membership (group.instance.id) to ignore transient pod restarts.'
    },
    productionCode: `// Production Configuration for Zero-Rebalance-Storm Stability
props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG,
    Collections.singletonList(CooperativeStickyAssignor.class.getName()));
props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 20);
props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 600000); // 10 mins
props.put(ConsumerConfig.GROUP_INSTANCE_ID_CONFIG, System.getenv("HOSTNAME")); // Static Membership`,
    architectureImpact: {
      vi: 'Triệt tiêu 100% tình trạng Stop-the-World Rebalance; thời gian tái cân bằng giảm từ 45 phút xuống dưới 2 giây; cụm xử lý hết 3.5 triệu message lag trong vòng 12 phút.',
      en: 'Zero Stop-the-World rebalances; rebalance latency reduced from 45m to <2s; cleared 3.5M backlog in 12 minutes.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.conduktor_rebalance,
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions
  ]
};
