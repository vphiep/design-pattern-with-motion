import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const transactionalOutboxKafkaEosTopic: MessagingTopic = {
  id: 'transactional-outbox-kafka-eos',
  category: 'advanced-streaming',
  level: 'advanced',
  chapter: 'Chuyên Đề Nâng Cao — Advanced Distributed Streaming',
  name: 'End-to-End Exactly-Once: Outbox + Kafka EOS + Idempotent Key',
  tagline: {
    vi: 'Kết hợp Transactional Outbox, Kafka Exactly-Once Semantics và Deduplication Key để đạt tính toàn vẹn 100% từ Database đến Consumer.',
    en: 'Synthesizing Transactional Outbox, Kafka Exactly-Once Semantics, and Deduplication Keys for 100% end-to-end data integrity.'
  },
  difficulty: 3,
  order: 18,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      vi: 'Một quy trình thanh toán ngân hàng bắt đầu từ REST API của Client -> lưu vào PostgreSQL của OrderService -> bắn event sang Kafka -> xử lý luồng stream tính phí -> cập nhật vào MongoDB của AccountService. Bất kỳ một bước nào trong chuỗi này gặp sự cố rớt mạng, retry hoặc crash đều có thể gây ra Duplicate Record hoặc Lost Record.',
      en: 'An end-to-end financial transaction originates at a client REST call -> persists to OrderService PostgreSQL -> streams to Kafka -> transforms via stream processors -> updates AccountService MongoDB. Network drops, retries, or node crashes at any link risk duplicate processing or permanent record loss.'
    },
    hardwareConstraint: {
      vi: 'Không có cơ chế Two-Phase Commit (2PC) đồng nhất nào có thể bao trùm đồng thời cả Web Client, PostgreSQL, Apache Kafka và MongoDB qua mạng phân tán mà không làm sụp đổ hoàn toàn hiệu năng hệ thống.',
      en: 'No universal 2PC protocol can coordinate across Web Clients, PostgreSQL, Kafka, and MongoDB over distributed networks without catastrophic throughput degradation.'
    },
    fundamentalSolution: {
      vi: 'Xây dựng kiến trúc 3 chặng khép kín: 1. Ingress Tier: Client gửi Request kèm X-Idempotency-Key được lưu nguyên tử cùng đơn hàng vào PostgreSQL qua Transactional Outbox; 2. Pipeline Tier: Debezium CDC đọc WAL và Kafka EOS xử lý với transactional.id và read_committed; 3. Egress Tier: Downstream Consumer kiểm tra Unique Key tại DB đích trước khi commit. Kết quả: Đạt Exactly-Once End-to-End thực thụ 100%.',
      en: 'Construct a closed-loop 3-tier architecture: 1. Ingress Tier: Client supplies X-Idempotency-Key committed atomically into Postgres via Transactional Outbox; 2. Pipeline Tier: Debezium CDC and Kafka EOS enforce atomic stream transformations with read_committed; 3. Egress Tier: Target consumers enforce DB-level unique constraint deduplication. Yields 100% true End-to-End Exactly-Once processing.'
    },
    math: {
      formula: '\\text{End-to-End Guarantee} = \\text{Outbox(ACID)} \\otimes \\text{Kafka(EOS)} \\otimes \\text{Consumer(Idempotency)}',
      timeComplexity: 'O(1) at each processing stage',
      spaceComplexity: 'O(K) — K là số Idempotency Keys lưu trong cửa sổ 48h',
      throughputFormula: '\\text{Failure Invariant}: \\quad \\forall e \\in \\text{Events}, \\quad \\text{ExecutionCount}(e) \\equiv 1'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Đạt được Exactly-Once End-to-End là mục tiêu cao nhất của kiến trúc hệ thống tài chính phân tán. Không có công nghệ đơn lẻ nào có thể tự giải quyết bài toán này; nó đòi hỏi sự phối hợp kỷ luật giữa Tầng Ứng dụng, Tầng Lưu trữ Cơ sở dữ liệu và Tầng Message Broker.',
      en: 'Achieving End-to-End Exactly-Once execution is the pinnacle of distributed systems engineering. No single tool solves this alone; it demands a disciplined protocol harmonizing Application APIs, Database ACID transactions, and Message Broker streaming guarantees.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Chặng 1 — Ingress Idempotency & Outbox: Khách hàng nhấn nút "Thanh toán" hai lần do mạng chậm. API Gateway sử dụng Redis SETNX trên Idempotency-Key trong 60 giây để chặn request thứ hai. Request đầu tiên mở transaction PostgreSQL, ghi đơn hàng và ghi Outbox Event trong cùng 1 commit duy nhất.',
        en: 'Stage 1 — Ingress Idempotency & Outbox: Double-clicks are blocked at the API Gateway via Redis atomic SETNX on the Idempotency-Key. The valid request executes an ACID commit writing business records and outbox events together.'
      },
      {
        vi: 'Chặng 2 — Streaming Atomicity (Kafka EOS): Debezium CDC đọc Postgres WAL đẩy vào topic "orders.raw". Ứng dụng Kafka Streams đọc từ orders.raw, biến đổi dữ liệu và ghi sang topic "orders.processed" với processing.guarantee=exactly_once_v2. Nếu worker bị crash giữa chừng, toàn bộ output records và consumer offset được rollback tự động.',
        en: 'Stage 2 — Streaming Atomicity (Kafka EOS): Debezium streams outbox rows to orders.raw. Kafka Streams reads, transforms, and produces to orders.processed using exactly_once_v2. Mid-flight crashes trigger automatic two-phase commit aborts across both outputs and offsets.'
      },
      {
        vi: 'Chặng 3 — Egress Deduplication: Consumer nhận message và ghi vào database đích bằng câu lệnh INSERT ... ON CONFLICT (idempotency_key) DO NOTHING. Nếu message bị gửi lại do rớt kết nối mạng ở giây cuối, database đích từ chối bản ghi thứ hai và consumer chỉ việc commit offset an toàn.',
        en: 'Stage 3 — Egress Deduplication: Destination consumers insert using INSERT ... ON CONFLICT (idempotency_key) DO NOTHING. Late redeliveries trigger silent database no-ops, allowing workers to commit offsets without duplicate state mutations.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Dùng Timestamp làm Idempotency Key: Timestamp của hệ thống có thể bị trùng lặp khi có nhiều request trong cùng 1 microsecond. Luôn luôn dùng UUIDv4 hoặc Business Hash Key (ví dụ: hash(userId + invoiceId + amount)).',
        en: 'Using Timestamps as Idempotency Keys: System clocks collide under concurrent microsecond bursts. Always mandate client-generated UUIDv4 or deterministic business hash keys (hash(userId + invoiceId + amount)).'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Chuỗi Giá trị Toàn vẹn Khép kín: Ingress -> Outbox -> Kafka EOS -> Egress Idempotency',
      en: 'End-to-End Exactly-Once Pipeline: Ingress -> Outbox -> Kafka EOS -> Egress'
    },
    description: {
      vi: 'Sơ đồ luồng dữ liệu 3 chặng bảo đảm tính chính xác tuyệt đối ngay cả khi xảy ra sự cố sập nguồn ở bất kỳ bước nào.',
      en: 'End-to-end 3-stage pipeline layout proving zero duplicate execution across crashes at any layer.'
    },
    asciiDiagram: `
[CLIENT APP] ===(X-Idempotency-Key: "UUID-101")===> [API GATEWAY (Redis SETNX)]
                                                              |
                                                              v
                                              [ORDER SERVICE (PostgreSQL)]
                                              BEGIN TRANSACTION
                                                INSERT INTO orders (...)
                                                INSERT INTO outbox (...)
                                              COMMIT; (Atomic Local Guarantee)
                                                              |
                                                      (Postgres WAL)
                                                              |
                                                    [DEBEZIUM CDC CONNECTOR]
                                                              |
                                              [KAFKA: "orders.raw" TOPIC]
                                                              |
                                              [KAFKA STREAMS (EOS: exactly_once_v2)]
                                              (Atomic Transform & State Checkpoint)
                                                              |
                                              [KAFKA: "orders.processed" TOPIC]
                                                              |
                                              [ACCOUNTING SERVICE (MongoDB)]
                                              INSERT with Unique Index (idempotency_key)
                                              (Duplicate? Silent No-Op & Offset Commit!)
`,
    components: [
      {
        name: 'Ingress Idempotency Gate',
        role: 'Client Duplicate Shield',
        description: {
          vi: 'Chặn đứng các cú nhấp đúp chuột và retry tự động của trình duyệt web.',
          en: 'Filters browser double-clicks and automated client network retries at the edge.'
        }
      },
      {
        name: 'Egress Database Deduplication',
        role: 'Terminal Invariant',
        description: {
          vi: 'Rào chắn vật lý cuối cùng trên cơ sở dữ liệu đích ngăn chặn mọi bản tin gửi lại.',
          en: 'Final database constraint barrier rejecting all duplicate downstream deliveries.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Khách hàng gửi yêu cầu thanh toán kèm Idempotency-Key', en: 'Client submits request with Idempotency Key' },
      phase: 'Ingress',
      description: {
        vi: 'Request mang header "X-Idempotency-Key: 9b1deb4d". Gateway kiểm tra Redis chưa tồn tại, cho phép đi tiếp.',
        en: 'Request carries X-Idempotency-Key. Gateway verifies key absence in Redis and admits traffic.'
      },
      brokerBehavior: {
        vi: 'Chưa có tương tác broker.',
        en: 'Broker idle.'
      },
      javaCodeLineMatch: '@RequestHeader("X-Idempotency-Key") String idempotencyKey'
    },
    {
      id: 'step-1',
      title: { vi: 'Lưu Order và Outbox trong cùng 1 Commit Postgres', en: 'Commit Order & Outbox atomically' },
      phase: 'Outbox Ingestion',
      description: {
        vi: 'OrderService lưu đơn hàng và lưu outbox record chứa idempotencyKey. Transaction commit hoàn tất trong 3ms.',
        en: 'OrderService writes order and outbox record carrying the key within one local ACID commit.'
      },
      brokerBehavior: {
        vi: 'Postgres WAL ghi nhận transaction.',
        en: 'Postgres WAL records transaction.'
      },
      javaCodeLineMatch: 'outboxRepository.save(new OutboxEvent(idempotencyKey, payload));'
    },
    {
      id: 'step-2',
      title: { vi: 'Kafka Streams xử lý với Exactly-Once v2', en: 'Kafka Streams executes with EOS-v2' },
      phase: 'Atomic Stream Processing',
      description: {
        vi: 'Worker đọc từ topic raw, biến đổi và ghi sang output topic trong một transaction nguyên tử duy nhất.',
        en: 'Streams worker reads raw topic, transforms, and produces to processed topic atomically.'
      },
      brokerBehavior: {
        vi: 'Transaction Coordinator ghi Commit Marker lên cả output partition và offset partition.',
        en: 'Transaction Coordinator writes commit markers across output and offset logs.'
      },
      javaCodeLineMatch: 'processing.guarantee=exactly_once_v2'
    },
    {
      id: 'step-3',
      title: { vi: 'Consumer đích kiểm tra Unique Key & Hoàn tất', en: 'Target consumer deduplicates & commits' },
      phase: 'Terminal Commit',
      description: {
        vi: 'Accounting Consumer thực hiện INSERT ... ON CONFLICT DO NOTHING. Nếu bản ghi đã tồn tại, bỏ qua an toàn và commit offset.',
        en: 'Consumer executes insert with unique constraint. Duplicates are silently ignored; offset is committed.'
      },
      brokerBehavior: {
        vi: 'Toàn bộ chuỗi nghiệp vụ đạt tính toàn vẹn Exactly-Once tuyệt đối.',
        en: 'End-to-end pipeline achieves 100% true exactly-once execution.'
      },
      javaCodeLineMatch: 'mongoTemplate.upsert(query, update, "accounting_ledger"); ack.acknowledge();'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Hàng đợi tác vụ với Deduplication Key', en: 'Task queues with client-side deduplication' },
      keyMechanism: {
        vi: 'RabbitMQ dựa vào Consumer kiểm tra Redis/DB Deduplication Key để đạt Exactly-Once trên thực tế.',
        en: 'Relies on downstream consumer Redis/DB unique key checks to enforce practical exactly-once.'
      },
      configExample: 'basicAck after idempotent DB upsert',
      architectureNote: {
        vi: 'Đơn giản, dễ triển khai cho các nghiệp vụ microservices thông thường.',
        en: 'Straightforward and accessible for general microservice task pipelines.'
      }
    },
    kafka: {
      role: { vi: 'Exactly-Once Native Stream Processing Engine', en: 'Native Exactly-Once Stream Processing Engine' },
      keyMechanism: {
        vi: 'Cung cấp Transaction Coordinator và 2-Phase Commit Markers native ngay trong giao thức lõi của broker.',
        en: 'Delivers native Transaction Coordinators and commit markers within the core broker protocol.'
      },
      configExample: 'processing.guarantee=exactly_once_v2',
      architectureNote: {
        vi: 'Bảo đảm tính toàn vẹn dữ liệu cho các đường ống dữ liệu phức tạp hàng triệu record/giây.',
        en: 'Guarantees state integrity across multi-stage streaming topologies processing millions of events/sec.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Bảo đảm tính chính xác toán học tuyệt đối: không bao giờ có giao dịch bị xử lý trùng lặp hay bị mất.',
        en: 'Guarantees absolute mathematical state exactness: zero duplicate charges, zero lost records.'
      },
      {
        vi: 'Miễn nhiễm hoàn toàn với các sự cố rớt mạng, retry tự động và restart tiến trình.',
        en: 'Completely resilient to network dropouts, automated retries, and process restarts.'
      }
    ],
    cons: [
      {
        vi: 'Chi phí phát triển cao: Yêu cầu mọi service trong tổ chức phải tuân thủ chuẩn Idempotency Key.',
        en: 'High engineering overhead: mandates company-wide adherence to idempotency key contracts.'
      }
    ],
    latencyVsThroughput: {
      vi: 'End-to-End Latency dao động từ 15ms - 30ms, hoàn toàn đáp ứng các tiêu chuẩn khắt khe nhất của ngân hàng.',
      en: 'End-to-end latency settles at 15ms-30ms, meeting the strictest tier-1 banking SLAs.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm thứ tự nghiêm ngặt từ database nguồn đến database đích nhờ partition theo Business Key.',
      en: 'Preserves strict sequential ordering from source to target DB via business-key partitioning.'
    }
  },

  javaCode: `package com.enterprise.messaging.endtoend;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

public record AccountDebitEvent(String idempotencyKey, String accountId, double amount) {}

@Service
public class EndToEndExactlyOnceAccountingConsumer {

    private final AccountingLedgerRepository ledgerRepo;

    public EndToEndExactlyOnceAccountingConsumer(AccountingLedgerRepository ledgerRepo) {
        this.ledgerRepo = ledgerRepo;
    }

    @KafkaListener(topics = "orders.processed", groupId = "accounting-service-group")
    public void onDebitReceived(AccountDebitEvent event, Acknowledgment ack) {
        try {
            // 1. Database-Level Idempotency Guard (Unique Index on idempotencyKey)
            ledgerRepo.insertDebitEntry(event.idempotencyKey(), event.accountId(), event.amount());
            System.out.printf("Successfully committed debit for account %s: $%.2f%n",
                event.accountId(), event.amount());
        } catch (DuplicateKeyException ex) {
            // 2. Duplicate Redelivery Detected: Harmless! Log and proceed to ACK!
            System.out.printf("Duplicate event ignored for idempotency key: %s%n", event.idempotencyKey());
        }

        // 3. Acknowledge offset commit safely
        ack.acknowledge();
    }
}`,

  springConfigCode: `spring:
  kafka:
    producer:
      transaction-id-prefix: e2e-tx-
      properties:
        enable.idempotence: true
        acks: all
    consumer:
      properties:
        isolation.level: read_committed
      enable-auto-commit: false`,

  interviewQuestions: [
    {
      question: {
        vi: 'Tại sao công thức "At-Least-Once Delivery + Idempotent Consumer = Exactly-Once Processing" lại được coi là tiêu chuẩn vàng của ngành công nghiệp phần mềm?',
        en: 'Why is the formula "At-Least-Once Delivery + Idempotent Consumer = Practical Exactly-Once" considered the industry gold standard?'
      },
      answer: {
        vi: 'Vì trong môi trường mạng phân tán không tin cậy (Unreliable Network), việc bảo đảm gói tin mạng chỉ bay qua dây đúng 1 lần là bất khả thi do bài toán Two Generals. Do đó, hệ thống chấp nhận cho phép mạng phân phát message nhiều lần (At-Least-Once với Retry). Tuy nhiên, tầng ứng dụng và cơ sở dữ liệu đích được thiết kế Tính lũy kế (Idempotency) dựa trên Unique Key. Dù message có bay tới 10 lần, cơ sở dữ liệu chỉ ghi nhận lần đầu tiên và bỏ qua 9 lần sau. Kết quả cuối cùng: Trạng thái của hệ thống chính xác 100% như thể message chỉ được xử lý đúng 1 lần duy nhất, với chi phí hạ tầng thấp hơn rất nhiều so với 2PC.',
        en: 'Because network-level exactly-once transport is physically impossible over imperfect channels (Two Generals Paradox). Systems instead embrace network retries (At-Least-Once delivery). However, consumers enforce mathematical Idempotency using unique deduplication keys. Even if an event arrives 10 times, the database mutates on the first attempt and silently no-ops the subsequent 9 replays. The resulting business state is 100% identical to true exactly-once execution at a fraction of the cost of 2PC.'
      },
      seniority: 'Lead'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố thất thoát 1.8 triệu USD tiền nạp game do thiếu cơ chế Idempotent Egress',
      en: '$1.8 Million Virtual Currency Duplication Outage Caused by Missing Egress Deduplication'
    },
    businessContext: {
      vi: 'Một công ty game phát hành sự kiện nạp thẻ nhân đôi kim cương cho 5 triệu người chơi.',
      en: 'A mobile gaming enterprise ran a 2x gem top-up promotion for 5 million active players.'
    },
    problemDescription: {
      vi: 'Khi cổng nạp thẻ gửi event sang Kafka, một worker xử lý nạp kim cương bị rớt mạng TCP sau khi ghi vào MongoDB nhưng trước khi commit offset Kafka. Kafka điều phối lại message đó sang worker khác. Do MongoDB không có Unique Constraint trên transaction_id, người chơi nạp 100 USD nhưng nhận được 200 USD kim cương. Lỗ hổng bị người dùng phát hiện và lan truyền trên mạng xã hội, gây thất thoát 1.8 triệu USD tài sản ảo trong 3 tiếng.',
      en: 'Game currency workers updated MongoDB but suffered TCP disconnects before committing Kafka offsets. Kafka redelivered batches to another worker. Lacking a unique constraint on transaction_id in MongoDB, players who paid $100 were credited $200 in gems. Exploits spread virally on social media, leaking $1.8M in virtual assets in 3 hours.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư bật Kafka Transactions (EOS) nhưng không sửa code MongoDB. Lỗi vẫn xảy ra vì Kafka EOS không thể rollback dữ liệu đã ghi vào MongoDB.',
      en: 'Developers enabled Kafka EOS but left MongoDB untouched. Redeliveries still duplicated balances because Kafka EOS cannot roll back external MongoDB mutations.'
    },
    coreSolution: {
      vi: '1. Tạo Unique Compound Index trên MongoDB: { "idempotency_key": 1 }; 2. Thực hiện cập nhật số dư bằng atomic findAndModify hoặc $setOnInsert; 3. Nếu MongoDB ném DuplicateKeyException, coi như đã thành công và gửi ACK commit offset.',
      en: '1. Enforced a unique index on idempotency_key in MongoDB; 2. Wrapped balance updates in atomic upserts ($setOnInsert); 3. Handled DuplicateKeyException as a successful idempotent no-op, advancing Kafka offsets safely.'
    },
    productionCode: `// MongoDB Idempotent Credit Balance Update
Query query = Query.query(Criteria.where("idempotency_key").is(cmd.idempotencyKey()));
Update update = new Update()
    .setOnInsert("user_id", cmd.userId())
    .setOnInsert("created_at", Instant.now())
    .inc("gems_balance", cmd.gemsAmount());

// Atomic upsert: If key exists, upsert fails to insert duplicate credit
FindAndModifyOptions options = FindAndModifyOptions.options().upsert(true).returnNew(false);
mongoTemplate.findAndModify(query, update, options, UserLedger.class);`,
    architectureImpact: {
      vi: 'Triệt tiêu 100% tình trạng nạp trùng tiền; thu hồi được 85% tài sản ảo bị khai thác lỗi; thiết lập quy chuẩn bắt buộc Idempotent Egress cho mọi microservice trong tập đoàn.',
      en: '100% elimination of double-crediting; recovered 85% of leaked virtual currency; established mandatory Idempotent Egress standard across all enterprise microservices.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.bytebytego_delivery_semantics,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
