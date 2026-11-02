import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const deliverySemanticsAckTopic: MessagingTopic = {
  id: 'delivery-semantics-ack',
  category: 'messaging-fundamentals',
  level: 'core',
  chapter: 'Chương 01 — Messaging Fundamentals',
  name: 'Message Delivery Semantics & Acknowledgment',
  tagline: {
    vi: 'Phân tích bản chất At-Most-Once, At-Least-Once, Exactly-Once, cơ chế ACK/NACK và thiết kế Idempotent Consumer.',
    en: 'Analyzing At-Most-Once, At-Least-Once, and Exactly-Once semantics, ACK/NACK mechanisms, and Idempotent Consumer design.'
  },
  difficulty: 2,
  order: 2,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Trong mạng phân tán (Unreliable Network), các sự cố rớt mạng, timeout và consumer crash là không thể tránh khỏi. Nếu Consumer xử lý xong nhưng bị đứt kết nối trước khi gửi kịp ACK, Broker sẽ gửi lại message đó (Redelivery) dẫn đến trùng lặp dữ liệu (Duplicate Processing). Ngược lại, nếu gửi ACK trước khi xử lý, một lỗi sập phần mềm sẽ khiến message biến mất vĩnh viễn (Message Loss).',
      en: 'In distributed networks, socket disconnects, timeouts, and process crashes are inevitable. If a consumer completes work but network drops before ACK reaches the broker, the broker redelivers the message, causing duplicate processing. Conversely, acknowledging before execution guarantees message loss on crashes.'
    },
    hardwareConstraint: {
      vi: 'Bài toán Hai vị tướng (Two Generals Paradox) và định lý CAP chứng minh rằng không thể đạt được sự đồng thuận 100% qua đường truyền mạng không tin cậy nếu không có chi phí xác nhận 2 chiều.',
      en: 'The Two Generals Paradox mathematically proves that 100% coordinated state synchronization over an imperfect communication channel is impossible without acknowledgment retries.'
    },
    fundamentalSolution: {
      vi: 'Áp dụng At-Least-Once Delivery kết hợp bắt buộc với Idempotent Consumer (Tính lũy kế). Mỗi message mang một Unique Idempotency Key (hoặc Business Key duy nhất). Consumer lưu trữ key này vào bảng nhật ký giao dịch hoặc Redis SETNX trong cùng một transaction để triệt tiêu mọi message trùng lặp.',
      en: 'Adopt At-Least-Once delivery paired strictly with Idempotent Consumer design. Each message carries a unique Idempotency Key. Consumers record this key in a transactional deduplication store (or Redis atomic lock) to discard redundant replays.'
    },
    math: {
      formula: 'P(\\text{duplicate}) = 1 - (1 - p_{\\text{timeout}})^{R}, \\quad A_{\\text{retry}} = \\frac{1}{1 - p_{\\text{fail}}}',
      timeComplexity: 'O(1) dedup check (Hash Set / B-Tree)',
      spaceComplexity: 'O(K) — K là số key trong cửa sổ TTL',
      throughputFormula: '\\text{Cost}_{retry} \\approx \\text{Latency}_{base} \\times 2^{n} \\quad \\text{(Exponential Backoff)}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Có 3 mức độ bảo đảm phân phát bản tin trong hệ thống phân tán: 1. At-Most-Once (Tối đa một lần - có thể mất, không bao giờ trùng); 2. At-Least-Once (Ít nhất một lần - không bao giờ mất, có thể trùng); 3. Exactly-Once (Đúng một lần - lý tưởng nhưng đòi hỏi chi phí điều phối phối hợp cao).',
      en: 'Distributed systems provide three tiers of delivery guarantees: 1. At-Most-Once (fire-and-forget, zero duplicates but possible loss); 2. At-Least-Once (guaranteed delivery, possible duplicates); 3. Exactly-Once (ideal semantics requiring end-to-end coordinated transactions).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Auto-ACK vs Manual-ACK: Auto-ACK gửi xác nhận ngay khi message vừa được gửi qua socket TCP (trước khi code business chạy). Nếu JVM bị crash hoặc ném Exception, message đó sẽ mất vĩnh viễn. Trong môi trường doanh nghiệp tài chính, Manual-ACK là bắt buộc: chỉ gọi basicAck sau khi đã commit thành công vào database.',
        en: 'Auto-ACK vs Manual-ACK: Auto-ACK confirms delivery the moment bytes pass the socket buffer before business logic executes. If the consumer crashes, the message is permanently destroyed. Enterprise systems mandate Manual-ACK: basicAck is fired only after database commits succeed.'
      },
      {
        vi: 'NACK vs Reject: Trong AMQP/RabbitMQ, basicReject chỉ từ chối 1 message; basicNack cho phép từ chối hàng loạt (batch). Cả hai đều có cờ requeue=true (đưa lại vào đầu queue) hoặc requeue=false (chuyển sang Dead Letter Queue). Cần cẩn trọng với requeue=true vì nếu lỗi là do dữ liệu hỏng (Poison Message), hệ thống sẽ rơi vào vòng lặp vô tận (Infinite Retry Storm).',
        en: 'NACK vs Reject: basicReject handles a single message; basicNack supports batch negative acknowledgments. Both feature a requeue flag: requeue=true re-inserts at queue head, while requeue=false routes to DLQ. Requeue=true on bad payloads triggers fatal infinite retry loops.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Ảo tưởng về "Kafka Exactly-Once Semantics": Nhiều kỹ sư lầm tưởng bật processing.guarantee=exactly_once trong Kafka sẽ tự động giải quyết trùng lặp khi ghi vào database PostgreSQL hoặc gọi API bên ngoài. Thực tế, Kafka EOS chỉ bảo đảm Exactly-Once khi đọc từ Kafka và ghi sang topic Kafka khác (Kafka-to-Kafka Stream). Giao tiếp với database bên ngoài bắt buộc phải dùng Idempotent Consumer hoặc Transactional Outbox.',
        en: 'The Kafka EOS Illusion: Enabling Kafka EOS only provides exactly-once semantics within Kafka-to-Kafka streaming topologies. External sinks (Postgres, Stripe) still require application-level idempotency keys or distributed transactional coordinators.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cơ chế Bắt tay Acknowledgment & Kịch bản Trùng lặp Message',
      en: 'Acknowledgment Handshake Protocol & Redelivery Failure Scenario'
    },
    description: {
      vi: 'Sơ đồ mô phỏng nguyên nhân gây ra duplicate message khi mạng bị ngắt đúng thời điểm gửi ACK.',
      en: 'Physical packet sequence illustrating duplicate message generation caused by in-flight ACK network drops.'
    },
    asciiDiagram: `
BROKER                              CONSUMER                             DATABASE
  |                                     |                                   |
  |--- [1. Deliver Message ID: #101] -->|                                   |
  |    (Status: In-Flight / Unack)      |--- [2. Process Payment $50] ----->|
  |                                     |    (Transaction Committed OK!)    |
  |                                     |                                   |
  |    XX [3. basicAck(#101) DROPPED!] XX <--- (Network Split / Socket Crash)
  |                                     |
[Timeout / Connection Re-established]   |
  |                                     |
  |--- [4. REDELIVER Message ID: #101]->| (DUPLICATE MESSAGE ARRIVES!)
  |                                     |--- [5. Deduplication Table Check]
  |                                     |    "ID #101 already processed!"
  |                                     |    ---> Skip Payment, Emit ACK!
  |<-- [6. basicAck(#101) Confirmed] ---|
`,
    components: [
      {
        name: 'Delivery Tag / Offset',
        role: 'Sequence Identifier',
        description: {
          vi: 'Số định danh duy nhất của gói tin trong phạm vi channel để broker biết chính xác message nào đã được xử lý.',
          en: 'Unique per-channel sequence counter used by broker to match acknowledgments.'
        }
      },
      {
        name: 'Idempotency Store (Redis / DB Unique Key)',
        role: 'Deduplication Guard',
        description: {
          vi: 'Lưu vết các Message ID đã xử lý thành công kèm thời gian sống (TTL).',
          en: 'Stores processed transaction IDs with TTL to filter duplicate redeliveries.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Broker phân phát Message cho Consumer', en: 'Broker delivers message to consumer' },
      phase: 'Message Delivery',
      description: {
        vi: 'Broker lấy message từ queue, chuyển trạng thái sang Unacknowledged và gửi qua socket TCP.',
        en: 'Broker fetches message from queue, marks status as Unacknowledged, and pushes over TCP.'
      },
      brokerBehavior: {
        vi: 'Message vẫn nằm trong storage của broker, chưa bị xóa.',
        en: 'Message remains resident in broker memory/disk buffers.'
      },
      javaCodeLineMatch: '@RabbitListener(queues = "payment.queue", ackMode = "MANUAL")'
    },
    {
      id: 'step-1',
      title: { vi: 'Consumer kiểm tra tính lũy kế (Idempotency Check)', en: 'Consumer verifies idempotency key' },
      phase: 'Deduplication Gate',
      description: {
        vi: 'Consumer truy vấn Redis/DB xem MessageId đã từng xuất hiện hay chưa.',
        en: 'Consumer performs atomic lookup to verify if messageId was previously processed.'
      },
      brokerBehavior: {
        vi: 'Broker đang đếm ngược thời gian chờ ACK (ack_timeout).',
        en: 'Broker monitors in-flight delivery timeout timer.'
      },
      javaCodeLineMatch: 'if (dedupService.isProcessed(event.messageId())) {'
    },
    {
      id: 'step-2',
      title: { vi: 'Thực thi Business Logic & Commit Database', en: 'Execute business logic & commit' },
      phase: 'State Mutation',
      description: {
        vi: 'Thực hiện trừ tiền và lưu vết MessageId vào bảng processed_messages trong cùng 1 Transaction cục bộ.',
        en: 'Executes financial charge and records messageId into processed_messages table atomically.'
      },
      brokerBehavior: {
        vi: 'Broker không can thiệp vào logic của consumer.',
        en: 'Broker remains decoupled from internal database state.'
      },
      javaCodeLineMatch: 'orderRepository.save(order); dedupService.markProcessed(event.messageId());'
    },
    {
      id: 'step-3',
      title: { vi: 'Gửi Manual ACK giải phóng Message', en: 'Send manual ACK to purge message' },
      phase: 'Queue Clean-up',
      description: {
        vi: 'Consumer gọi channel.basicAck(). Broker nhận được tín hiệu và chính thức xóa message khỏi queue.',
        en: 'Consumer executes channel.basicAck(). Broker receives packet and evicts message from queue.'
      },
      brokerBehavior: {
        vi: 'Queue Depth giảm đi 1, tài nguyên bộ nhớ được giải phóng.',
        en: 'Queue depth counter decrements by 1; memory reclaimed.'
      },
      javaCodeLineMatch: 'channel.basicAck(deliveryTag, false);'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Quản lý ACK chi tiết từng bản tin', en: 'Per-message fine-grained ACK' },
      keyMechanism: {
        vi: 'Broker lưu trạng thái Unacknowledged cho từng message. Hỗ trợ basicAck, basicNack, basicReject kèm cờ requeue.',
        en: 'Tracks unacknowledged status per message. Supports basicAck, basicNack, basicReject with requeue toggles.'
      },
      configExample: 'channel.basicAck(deliveryTag, false);',
      architectureNote: {
        vi: 'Nếu consumer crash mà chưa ACK, RabbitMQ ngay lập tức điều hướng message sang consumer khác.',
        en: 'If a consumer drops without ACK, RabbitMQ immediately dispatches the message to another worker.'
      }
    },
    kafka: {
      role: { vi: 'Quản lý Offset tuần tự theo mốc', en: 'Sequential Offset High-Watermark' },
      keyMechanism: {
        vi: 'Kafka không lưu ACK từng message mà lưu số thứ tự Offset đã đọc. Commit Offset = N nghĩa là toàn bộ message < N đã được xử lý.',
        en: 'Kafka commits monotonic offsets. Committing offset N implicitly acknowledges all messages < N.'
      },
      configExample: 'acknowledgment.acknowledge();',
      architectureNote: {
        vi: 'Cần cẩn thận khi xử lý đa luồng: nếu message 105 bị lỗi nhưng message 106 commit offset, message 105 sẽ bị coi là đã xử lý.',
        en: 'Requires care with async workers: committing offset 106 will implicitly commit failed message 105.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Bảo đảm 100% không mất dữ liệu ngay cả khi consumer hoặc broker gặp sự cố phần cứng.',
        en: 'Zero data loss guarantee even across hardware and process terminations.'
      },
      {
        vi: 'Cho phép kiểm soát luồng xử lý tinh xảo với Dead Letter Queue khi gặp Poison Message.',
        en: 'Granular failure routing to DLQs preventing poison payload crashes.'
      }
    ],
    cons: [
      {
        vi: 'Bắt buộc toàn bộ downstream services phải thiết kế Idempotent, làm tăng chi phí phát triển.',
        en: 'Forces all downstream consumers to implement strict idempotency mechanisms.'
      },
      {
        vi: 'Chi phí I/O kiểm tra deduplication key trên mỗi message.',
        en: 'Additional database / cache lookup overhead per incoming message.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Auto-ACK cho throughput cao nhất nhưng rủi ro mất dữ liệu cực lớn; Manual-ACK sau khi commit DB tăng độ tin cậy tuyệt đối nhưng latency tăng thêm 2-10ms.',
      en: 'Auto-ACK maximizes throughput but risks permanent data loss; Manual-ACK post-commit ensures bulletproof reliability with 2-10ms latency trade-off.'
    },
    orderingGuarantee: {
      vi: 'Khi xảy ra NACK và Requeue, message bị lỗi sẽ quay trở lại đầu hoặc cuối hàng đợi, có thể làm đảo lộn thứ tự so với ban đầu.',
      en: 'Negative acknowledgments with requeue can disrupt original FIFO processing order.'
    }
  },

  javaCode: `package com.enterprise.messaging.idempotency;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rabbitmq.client.Channel;
import java.io.IOException;

public record PaymentCommand(String transactionId, String accountId, double amount) {}

@Service
public class IdempotentPaymentConsumer {

    private final PaymentLedgerRepository ledgerRepo;
    private final DeduplicationService dedupService;

    public IdempotentPaymentConsumer(PaymentLedgerRepository ledgerRepo,
                                     DeduplicationService dedupService) {
        this.ledgerRepo = ledgerRepo;
        this.dedupService = dedupService;
    }

    @RabbitListener(queues = "payment.transactions", ackMode = "MANUAL")
    public void onPaymentReceived(PaymentCommand cmd,
                                  Channel channel,
                                  @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        String txId = cmd.transactionId();

        // 1. Atomic Idempotency Guard (Redis SETNX or DB Unique Index)
        if (!dedupService.acquireLock(txId, 60)) {
            System.out.printf("Duplicate message detected for tx: %s. Acknowledging and discarding.%n", txId);
            channel.basicAck(deliveryTag, false);
            return;
        }

        try {
            // 2. Execute transactional business logic
            processPaymentWithinTransaction(cmd);

            // 3. Manual ACK only after database commit succeeds
            channel.basicAck(deliveryTag, false);
        } catch (NonRetryableBusinessException ex) {
            // Business rule rejection: DO NOT REQUEUE -> send to DLQ
            System.err.println("Fatal business exception: " + ex.getMessage());
            channel.basicNack(deliveryTag, false, false);
        } catch (Exception ex) {
            // Transient network failure: Release lock and requeue with backoff
            dedupService.releaseLock(txId);
            System.err.println("Transient error, requeueing: " + ex.getMessage());
            channel.basicNack(deliveryTag, false, true);
        }
    }

    @Transactional
    protected void processPaymentWithinTransaction(PaymentCommand cmd) {
        ledgerRepo.save(new LedgerEntry(cmd.transactionId(), cmd.accountId(), cmd.amount()));
    }
}
class NonRetryableBusinessException extends RuntimeException {
    public NonRetryableBusinessException(String msg) { super(msg); }
}`,

  springConfigCode: `spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: manual
        default-requeue-rejected: false # Route to DLQ on reject instead of infinite loops
        retry:
          enabled: true
          initial-interval: 1000ms
          multiplier: 2.0
          max-attempts: 3`,

  interviewQuestions: [
    {
      question: {
        vi: 'Tại sao trong hệ thống phân tán, Exactly-Once Delivery ở tầng mạng lại được coi là bài toán bất khả thi?',
        en: 'Why is network-layer Exactly-Once Delivery considered practically impossible in distributed systems?'
      },
      answer: {
        vi: 'Vì bài toán Two Generals Paradox: để bên gửi chắc chắn bên nhận đã nhận bản tin, bên nhận phải gửi ACK. Nhưng để bên nhận chắc chắn bên gửi đã nhận được ACK, bên gửi lại phải gửi ACK-of-ACK, tạo thành chuỗi vô tận. Trong thực tế, các giải pháp "Exactly-Once" của Kafka hay Flink thực chất là: At-Least-Once Delivery + Idempotent Deduplication + Two-Phase Commit State Storage.',
        en: 'Due to the Two Generals Paradox: confirming delivery requires an ACK, which itself requires an ACK over an unreliable network, creating infinite regress. In production, "Exactly-Once" is engineered as At-Least-Once delivery paired with atomic idempotency and distributed two-phase commit checkpoints.'
      },
      seniority: 'Lead',
      trapWarning: {
        vi: 'Tránh câu trả lời khẳng định: "Kafka bật enable.idempotence=true là giải quyết xong 100%". Hãy nêu rõ nó chỉ chống trùng lặp giữa Producer và Broker, không bảo vệ được Consumer ghi sang Database.',
        en: 'Do not claim Kafka idempotent producer solves end-to-end duplication. It only deduplicates between producer and broker, not downstream consumer database writes.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố trừ tiền tài khoản khách hàng hai lần do đứt kết nối ACK',
      en: 'Double-Charging Customer Bank Accounts Due to In-Flight ACK Timeouts'
    },
    businessContext: {
      vi: 'Một ứng dụng ví điện tử ghi nhận 3.400 trường hợp khách hàng bị trừ tiền 2 lần cho cùng một hóa đơn thanh toán điện nước trong ngày cao điểm.',
      en: 'A fintech payment app double-charged 3,400 customers for the exact same utility invoice during peak bill pay day.'
    },
    problemDescription: {
      vi: 'PaymentConsumer xử lý trừ tiền qua Core Banking API mất 1.800ms. Thời gian cấu hình socket timeout của RabbitMQ connection là 1.500ms. Kênh TCP bị đóng trước khi consumer kịp gửi basicAck. Broker nhận định consumer bị chết và dispatch lại message đó cho một consumer pod khác, dẫn đến lệnh trừ tiền thứ hai được thực thi.',
      en: 'PaymentConsumer took 1,800ms to execute against Core Banking. RabbitMQ socket timeout was configured at 1,500ms. The connection closed before basicAck arrived. The broker assumed worker crash and redelivered the payload to another pod, executing a duplicate charge.'
    },
    whyNaiveFails: {
      vi: 'Nhóm phát triển tăng timeout lên 60 giây và bật auto-ack=true. Khi một pod bị OutOfMemory do tải cao, hàng trăm message đang xử lý dở bị broker xóa mất mà tiền chưa được nạp cho đối tác, gây khiếu nại tài chính nghiêm trọng.',
      en: 'Team increased timeouts to 60s and turned on auto-ack=true. When a pod crashed with OOM, hundreds of in-flight payments were deleted from the broker without being executed, creating financial discrepancy.'
    },
    coreSolution: {
      vi: 'Triển khai bảng thanh toán Idempotent với Unique Constraint trên TransactionReferenceId ở mức Database. Sử dụng cú pháp INSERT ... ON CONFLICT DO NOTHING (Postgres) hoặc INSERT IGNORE (MySQL). Khi message trùng lặp đến, database từ chối bản ghi thứ hai và consumer chỉ việc gửi basicAck bỏ qua an toàn.',
      en: 'Enforced database-level Idempotency with a unique constraint on TransactionReferenceId via INSERT ... ON CONFLICT DO NOTHING. Duplicate redeliveries trigger silent no-ops, allowing the consumer to emit basicAck safely.'
    },
    productionCode: `@Transactional
public PaymentResult executePayment(PaymentCommand cmd) {
    // 1. Atomic DB insertion with unique constraint
    int rows = jdbcTemplate.update(
        "INSERT INTO payment_transactions (tx_id, user_id, amount, status) " +
        "VALUES (?, ?, ?, 'SUCCESS') ON CONFLICT (tx_id) DO NOTHING",
        cmd.transactionId(), cmd.userId(), cmd.amount()
    );

    if (rows == 0) {
        // Duplicate detected!
        return PaymentResult.alreadyProcessed(cmd.transactionId());
    }

    coreBankingClient.debit(cmd.userId(), cmd.amount());
    return PaymentResult.newSuccess(cmd.transactionId());
}`,
    architectureImpact: {
      vi: 'Triệt tiêu 100% tình trạng trừ tiền trùng lặp; bảo đảm tính toàn vẹn số dư tài khoản tuyệt đối; hệ thống tự động phục hồi sau các đợt rớt mạng.',
      en: '100% elimination of double-charges; absolute account balance integrity; seamless automatic self-healing across network disconnects.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.bytebytego_delivery_semantics,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
