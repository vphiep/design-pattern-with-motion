import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const kafkaDeliveryGuaranteesTransactionsTopic: MessagingTopic = {
  id: 'kafka-delivery-guarantees-transactions',
  category: 'kafka-streaming',
  level: 'core',
  chapter: 'Chương 03 — Apache Kafka Architecture',
  name: 'Kafka Delivery Guarantees & Transactions',
  tagline: {
    vi: 'Phân tích nguyên lý Kafka Exactly-Once Semantics (EOS), Transactional Producer, isolation.level=read_committed và vòng lặp Consume-Transform-Produce nguyên tử.',
    en: 'Analyzing Kafka Exactly-Once Semantics (EOS), Transactional Producers, isolation.level=read_committed, and atomic Consume-Transform-Produce loops.'
  },
  difficulty: 3,
  order: 10,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      vi: 'Trong các ứng dụng Stream Processing (ví dụ: tính toán số dư tài khoản ngân hàng từ luồng giao dịch), service thực hiện chu kỳ 3 bước: 1. Đọc event từ topic đầu vào; 2. Biến đổi dữ liệu (Transform); 3. Ghi kết quả sang topic đầu ra và commit offset. Nếu ứng dụng bị crash ở bước 3, message đầu ra đã được gửi nhưng offset chưa kịp commit. Khi restart lại, message sẽ bị xử lý lại, làm sai lệch số dư tài chính.',
      en: 'Stream processing architectures execute a 3-step loop: 1. Consume from input topic; 2. Transform state; 3. Produce to output topic and commit offset. If a crash occurs after produce but before offset commit, restarts re-process the event, emitting duplicate outputs and corrupting financial ledgers.'
    },
    hardwareConstraint: {
      vi: 'Giao thức Two-Phase Commit phân tán truyền thống (XA Transactions) yêu cầu nhiều lượt trao đổi mạng (Prepare, Commit) và khóa tài nguyên, khiến latency tăng gấp nhiều lần và làm mất đi ưu thế thông lượng cao của Kafka.',
      en: 'Classical distributed Two-Phase Commit (XA) incurs severe latency penalties from multi-roundtrip network consensus and pessimistic locking, undermining Kafka’s high-throughput architecture.'
    },
    fundamentalSolution: {
      vi: 'Kafka Transaction Coordinator & Transaction Log: Cung cấp Transactional API cho phép ghi đồng thời các message mới vào output topics VÀ ghi offset commit vào __consumer_offsets trong CÙNG MỘT TRANSACTION NGUYÊN TỬ (Atomic). Cụm sử dụng marker commit/abort nhị phân. Các Downstream Consumer cấu hình isolation.level=read_committed chỉ nhìn thấy các message đã được commit thành công.',
      en: 'Kafka Transaction Coordinator & Transaction Log: Enables atomic writes across multiple output topics AND consumer offset commits within a unified transactional boundary. Commit/Abort markers demarcate transaction boundaries on disk. Downstream consumers configured with isolation.level=read_committed strictly read committed batches, filtering aborted records.'
    },
    math: {
      formula: '\\text{Atomic Commit}: \\quad \\{ \\text{Records}_{\\text{output}}, \\text{Offset}_{\\text{input}} \\} \\implies \\text{Commit Marker}',
      timeComplexity: 'O(1) two-phase marker append',
      spaceComplexity: 'O(T) — T là số transaction đang mở',
      throughputFormula: '\\text{Throughput}_{EOS} \\approx 85\\% - 90\\% \\text{ so với At-Least-Once} \\quad (\\text{chi phí marker commit})'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Kafka Exactly-Once Semantics (EOS) được giới thiệu từ KIP-98. Đây là một kỳ tích kỹ thuật giúp các hệ thống Stream Processing đạt được tính toàn vẹn dữ liệu tuyệt đối mà không cần đến các giải pháp khóa phân tán nặng nề.',
      en: 'Kafka Exactly-Once Semantics (EOS, KIP-98) is a landmark distributed systems achievement enabling atomic stream processing without heavyweight distributed locks.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Idempotent Producer (KIP-98 Nền tảng): Bật enable.idempotence=true gán cho mỗi Producer một Producer ID (PID 64-bit) và Sequence Number tăng đơn điệu cho mỗi partition. Broker tự động từ chối mọi message có Sequence Number trùng lặp hoặc không liên tục, loại bỏ hoàn toàn duplicate do network retry.',
        en: 'Idempotent Producer: Setting enable.idempotence=true assigns each client a 64-bit Producer ID (PID) and sequence numbers per partition. Brokers discard duplicates and enforce strict ordering seamlessly without transactions.'
      },
      {
        vi: 'Transactional Producer & transactional.id: Để mở rộng tính nguyên tử qua nhiều Partition và Topic khác nhau, Producer cần được cấp một transactional.id cố định. Transaction Coordinator (một broker chuyên trách) ghi nhật ký trạng thái giao dịch vào topic nội bộ __transaction_state. Khi Producer gọi commitTransaction(), Coordinator ghi COMMIT marker xuống các partition liên quan.',
        en: 'Transactional Producer & transactional.id: Scaling atomicity across multiple partitions demands a persistent transactional.id. The Transaction Coordinator manages state via the internal __transaction_state topic. Calling commitTransaction() writes atomic COMMIT markers across all participating partitions.'
      },
      {
        vi: 'isolation.level = read_committed: Mặc định, Kafka Consumer có isolation.level=read_uncommitted (đọc tất cả, kể cả message của transaction đang chạy hoặc đã bị abort). Trong các hệ thống tài chính, bắt buộc phải đổi sang isolation.level=read_committed. Consumer sẽ chặn lại tại High-Watermark của transaction và chỉ trả về các message đã có Commit Marker.',
        en: 'isolation.level = read_committed: Default consumers read all messages, including uncommitted or aborted batches. Setting isolation.level=read_committed blocks consumer fetches until commit markers arrive, safely discarding aborted records.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Ảo tưởng Exactly-Once ra Database bên ngoài: Kafka EOS CHỈ bảo đảm nguyên tử từ Kafka Topic này sang Kafka Topic khác (Kafka-in -> Kafka-out). Nếu bạn ghi sang PostgreSQL, MySQL hoặc gọi API Stripe, Kafka EOS HOÀN TOÀN KHÔNG THỂ rollback database bên ngoài. Bắt buộc phải kết hợp Transactional Outbox Pattern hoặc Idempotency Key.',
        en: 'External Database Misconception: Kafka EOS strictly covers Kafka-in to Kafka-out streams. External operations (Postgres, Stripe) cannot be rolled back by Kafka. You must pair Kafka with the Transactional Outbox pattern or DB-level idempotency.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Chu trình Consume-Transform-Produce Nguyên tử với Transaction Coordinator',
      en: 'Atomic Consume-Transform-Produce Cycle via Transaction Coordinator'
    },
    description: {
      vi: 'Sơ đồ luồng 2-Phase Commit nhẹ giữa Transaction Coordinator, Output Partition và Input Offset Partition.',
      en: 'Sequence layout showing atomic multi-partition commits managed by the internal Transaction Coordinator.'
    },
    asciiDiagram: `
[INPUT TOPIC: raw-events]
       |
       v (1. Poll Record offset=50)
[STREAMING WORKER]
  (Calculates Balance Delta: +$100)
       |
       +---> [2. Send to OUTPUT TOPIC: balances-v1] (Data written, Commit Marker PENDING)
       |
       +---> [3. sendOffsetsToTransaction(offset=51, __consumer_offsets)]
       |
[4. producer.commitTransaction()]
       |
       v
[TRANSACTION COORDINATOR]
       |
       +--- Writes COMMIT Marker to "balances-v1" [Partition 2]
       +--- Writes COMMIT Marker to "__consumer_offsets" [Partition 18]
       |
(Downstream Consumer with read_committed now sees BOTH record and offset committed!)
`,
    components: [
      {
        name: 'Transaction Coordinator',
        role: 'Distributed Coordinator',
        description: {
          vi: 'Broker chịu trách nhiệm quản lý máy trạng thái (Ongoing, PrepareCommit, CompleteCommit) của transaction.',
          en: 'Broker daemon managing transaction state transitions via the internal __transaction_state topic.'
        }
      },
      {
        name: 'Commit / Abort Markers',
        role: 'Control Message',
        description: {
          vi: 'Bản tin điều khiển nhị phân nằm trong log segment, consumer bình thường sẽ lọc bỏ và không nhìn thấy.',
          en: 'Binary control markers appended to segments indicating transaction boundaries.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Khởi tạo Transaction (initTransactions)', en: 'Initialize Transaction' },
      phase: 'Coordinator Handshake',
      description: {
        vi: 'Producer kết nối đến Transaction Coordinator, đăng ký transactional.id và nhận Producer ID (PID) mới kèm Epoch.',
        en: 'Producer connects to coordinator, registers transactional.id, and obtains a fenced PID with epoch.'
      },
      brokerBehavior: {
        vi: 'Coordinator hủy (fence) tất cả các Producer cũ đang giữ cùng transactional.id để chống zombie instance.',
        en: 'Coordinator fences older zombie producers sharing the identical transactional.id.'
      },
      javaCodeLineMatch: 'producer.initTransactions();'
    },
    {
      id: 'step-1',
      title: { vi: 'Bắt đầu Transaction & Ghi bản tin', en: 'Begin Transaction & Produce' },
      phase: 'Atomic Scope',
      description: {
        vi: 'Producer gọi beginTransaction(), gửi bản tin sang topic "analytics-output".',
        en: 'Producer initiates transaction and emits calculated output records.'
      },
      brokerBehavior: {
        vi: 'Broker lưu message vào partition kèm cờ Transactional = true.',
        en: 'Broker appends records tagged as uncommitted transactional batches.'
      },
      javaCodeLineMatch: 'producer.beginTransaction(); producer.send(outputRecord);'
    },
    {
      id: 'step-2',
      title: { vi: 'Gắn Offset vào Transaction', en: 'Send offsets to transaction' },
      phase: 'Offset Coordination',
      description: {
        vi: 'Producer gửi offset của input topic (offset=51) vào transaction thông qua sendOffsetsToTransaction().',
        en: 'Producer forwards input topic offsets to coordinator via sendOffsetsToTransaction().'
      },
      brokerBehavior: {
        vi: 'Offset được tạm giữ, chưa ghi chính thức vào __consumer_offsets.',
        en: 'Consumer offsets are staged pending coordinator final commit.'
      },
      javaCodeLineMatch: 'producer.sendOffsetsToTransaction(offsets, "order-group");'
    },
    {
      id: 'step-3',
      title: { vi: 'Commit Transaction (Ghi Commit Markers)', en: 'Commit Transaction' },
      phase: 'Two-Phase Commit',
      description: {
        vi: 'Producer gọi commitTransaction(). Coordinator ghi Commit Marker lên cả output partition và offset partition.',
        en: 'Coordinator writes Commit Markers across all participating partitions.'
      },
      brokerBehavior: {
        vi: 'Giao dịch hoàn tất 100%. Các consumer cấu hình read_committed bắt đầu đọc được dữ liệu.',
        en: 'Transaction committed atomically. Read_committed consumers receive payload.'
      },
      javaCodeLineMatch: 'producer.commitTransaction();'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'AMQP Channel Transactions (Giới hạn cục bộ)', en: 'AMQP Channel Transactions' },
      keyMechanism: {
        vi: 'RabbitMQ hỗ trợ txSelect, txCommit, txRollback trên Channel nhưng làm sụt giảm thông lượng tới 95%. Thay vào đó, Publisher Confirms được khuyên dùng.',
        en: 'Supports AMQP channel transactions (txSelect/txCommit) but degrades throughput by 95%; Publisher Confirms preferred.'
      },
      configExample: 'channel.txSelect(); channel.txCommit();',
      architectureNote: {
        vi: 'Không hỗ trợ giao dịch nguyên tử xuyên suốt nhiều queue và nhiều consumer như Kafka EOS.',
        en: 'Does not support cross-queue atomic consume-transform-produce cycles.'
      }
    },
    kafka: {
      role: { vi: 'End-to-End Exactly-Once Stream Processing', en: 'End-to-End Exactly-Once Streaming' },
      keyMechanism: {
        vi: 'Kafka Transaction Coordinator cho phép gom nhiều partition ghi và commit offset vào 1 đơn vị nguyên tử.',
        en: 'Transaction Coordinator enables multi-partition atomic writes and offset commits.'
      },
      configExample: 'transactional.id=tx-worker-1, isolation.level=read_committed',
      architectureNote: {
        vi: 'Nền tảng của Kafka Streams và Apache Flink để đạt tính toán tài chính chính xác tuyệt đối.',
        en: 'The architectural foundation powering Kafka Streams and Apache Flink exactness.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Bảo đảm 100% không trùng lặp và không mất mát dữ liệu trong các chu trình Stream Processing.',
        en: '100% zero-duplicate, zero-loss guarantee within stream processing pipelines.'
      },
      {
        vi: 'Zombie Fencing tự động: Loại bỏ hiện tượng Split-Brain khi worker cũ bị treo mạng rồi tỉnh dậy ghi đè.',
        en: 'Automated zombie instance fencing prevents split-brain writes during GC pauses.'
      }
    ],
    cons: [
      {
        vi: 'Thông lượng giảm khoảng 10% - 15% do chi phí ghi commit markers của 2-Phase Commit.',
        en: 'Throughput drops by 10-15% due to two-phase marker commit overhead.'
      },
      {
        vi: 'Consumer với read_committed phải chịu thêm độ trễ cho đến khi transaction được commit.',
        en: 'Read_committed consumers experience slight latency waiting for transaction commits.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Kéo dài transaction quá lâu làm tăng độ trễ cho consumer; nên commit transaction định kỳ sau mỗi 100ms - 500ms.',
      en: 'Long transactions introduce fetch latency; commit boundaries should target 100ms - 500ms intervals.'
    },
    orderingGuarantee: {
      vi: 'Bảo toàn thứ tự nghiêm ngặt; các message của transaction bị abort sẽ tự động được consumer bỏ qua mà không làm hỏng thứ tự.',
      en: 'Strict order preserved; aborted transactional batches are silently bypassed by consumers.'
    }
  },

  javaCode: `package com.enterprise.messaging.transactions;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExactlyOnceStreamProcessor {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public ExactlyOnceStreamProcessor(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    // Atomic Consume-Transform-Produce Loop with Spring Kafka Transaction
    @Transactional("kafkaTransactionManager")
    public void processStreamTransaction(ConsumerRecord<String, String> inputRecord) {
        String inputJson = inputRecord.value();

        // 1. Transform: Process financial calculation
        String transformedBalance = calculateBalance(inputJson);

        // 2. Atomic Produce to output topic
        kafkaTemplate.send("account-balances", inputRecord.key(), transformedBalance);

        // 3. Offsets are automatically sent to the transaction by Spring Kafka container!
        // If an exception occurs here, the output record is ABORTED and offsets rollback!
    }

    private String calculateBalance(String json) {
        return "{\\"balance\\": 1500.00}";
    }
}`,

  springConfigCode: `spring:
  kafka:
    producer:
      transaction-id-prefix: tx-order-stream-
      properties:
        enable.idempotence: true
        acks: all
    consumer:
      properties:
        isolation.level: read_committed # Strictly filter aborted messages!`,

  interviewQuestions: [
    {
      question: {
        vi: 'Tại sao Kafka Exactly-Once Semantics (EOS) vẫn có thể gây trùng lặp nếu ứng dụng gọi API bên thứ ba (như cổng thanh toán Stripe)?',
        en: 'Why can Kafka Exactly-Once Semantics (EOS) still result in duplicate operations when calling external third-party APIs (like Stripe)?'
      },
      answer: {
        vi: 'Bởi vì Kafka Transaction Coordinator chỉ có quyền kiểm soát và commit nguyên tử trên các Topic nội bộ của Kafka. Nó không thể tham gia vào giao dịch phân tán với hệ thống bên ngoài (như Stripe REST API hoặc cơ sở dữ liệu MongoDB không hỗ trợ XA). Nếu worker gọi API Stripe trừ tiền thành công, nhưng trước khi commit transaction Kafka thì server bị sập nguồn, khi restart lại, Kafka sẽ xử lý lại message đó và gọi API Stripe lần thứ hai. Để giải quyết, bắt buộc phải dùng Idempotency Key gửi sang Stripe.',
        en: 'Because Kafka’s Transaction Coordinator only governs Kafka-native storage topics. It cannot rollback external non-Kafka systems (Stripe HTTP APIs or NoSQL stores). If the worker debits Stripe, but crashes before committing the Kafka transaction, restarts re-consume the record and invoke Stripe a second time. External side-effects require application-level idempotency keys.'
      },
      seniority: 'Lead'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Lỗi phát tán 150.000 thông báo hoàn tiền giả do Consumer đọc phải Aborted Transaction',
      en: '150,000 Ghost Refund Notifications Caused by read_uncommitted Consumer Default'
    },
    businessContext: {
      vi: 'Một ứng dụng bán lẻ thực hiện quy trình hoàn tiền tự động qua Transactional Kafka Streams.',
      en: 'A retail platform managed automated refund calculations via Transactional Kafka Streams.'
    },
    problemDescription: {
      vi: 'Một transaction xử lý hoàn tiền 10 triệu USD bị lỗi logic và rollback (ABORT). Tuy nhiên, NotificationService ở tầng downstream vẫn để cấu hình mặc định isolation.level=read_uncommitted. Service này đọc được toàn bộ message của transaction đã bị hủy và gửi 150.000 email thông báo "Bạn đã được hoàn tiền thành công" cho khách hàng, gây khủng hoảng truyền thông.',
      en: 'A $10M refund batch hit a fatal exception and triggered an ABORT. However, the downstream NotificationService ran on default isolation.level=read_uncommitted. It ingested the aborted ghost messages and blasted 150,000 "Refund Successful" emails to customers, triggering a PR crisis.'
    },
    whyNaiveFails: {
      vi: 'Đội phát triển cố gắng lọc bằng cờ trạng thái trong body message, nhưng message bị abort vốn không có trường nào báo hiệu trừ khi đọc marker của broker.',
      en: 'Developers tried filtering by payload status fields, but aborted payloads look identical to valid ones without broker marker parsing.'
    },
    coreSolution: {
      vi: 'Cấu hình bắt buộc trên tất cả downstream consumers: isolation.level=read_committed. Consumer sẽ tự động bỏ qua toàn bộ các message nằm trong các transaction bị abort mà không đẩy lên tầng code ứng dụng.',
      en: 'Enforced isolation.level=read_committed across all downstream consumer clusters. The Kafka client transparently drops aborted records before delivering batches to application code.'
    },
    productionCode: `// Downstream Consumer Configuration: Only Read Committed Data
props.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");`,
    architectureImpact: {
      vi: 'Triệt tiêu 100% tình trạng đọc phải tin nhắn ma (Ghost Messages); bảo đảm tính nhất quán dữ liệu xuyên suốt toàn bộ pipeline streaming.',
      en: '100% elimination of ghost uncommitted message leaks; guaranteed transactional consistency across all downstream services.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.bytebytego_delivery_semantics,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
