import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const messagingReliabilityObservabilityTopic: MessagingTopic = {
  id: 'messaging-reliability-observability',
  category: 'reliability-backpressure',
  level: 'core',
  chapter: 'Chương 04 — Reliability, Backpressure & Distributed Streaming',
  name: 'Messaging Reliability, Observability & Production Design',
  tagline: {
    vi: 'Thiết kế hệ thống tin cậy chuẩn doanh nghiệp: Transactional Outbox triệt tiêu Dual-Write, Schema Registry và giám sát toàn diện.',
    en: 'Designing enterprise-grade reliability: Transactional Outbox solving Dual-Writes, Schema Registries, and observability.'
  },
  difficulty: 3,
  order: 12,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Vấn nạn Ghi kép (The Dual-Write Problem): Một service cần vừa lưu dữ liệu vào Database (PostgreSQL), vừa gửi event sang Message Broker (Kafka/RabbitMQ). Vì không thể thực hiện giao dịch phân tán 2PC giữa Database và Broker, nếu lưu DB thành công nhưng gửi broker bị rớt mạng, hệ thống mất đồng bộ. Ngược lại, nếu gửi broker trước nhưng lưu DB bị lỗi rollback, event giả mạo (Ghost Event) sẽ phát tán ra toàn bộ công ty.',
      en: 'The Dual-Write Dilemma: A microservice must mutate local database state AND publish an event to a message broker. Because distributed 2PC across DB and Broker is impractical, saving to DB while network drops before broker publish desynchronizes systems. Conversely, publishing first while DB rollback occurs emits catastrophic ghost events.'
    },
    hardwareConstraint: {
      vi: 'Sự phân tách vật lý giữa Database engine và Broker engine qua kết nối mạng không cho phép chia sẻ chung bộ nhớ hoặc log commit nguyên tử.',
      en: 'Physical network separation between disparate database and broker engines precludes shared memory commit logs.'
    },
    fundamentalSolution: {
      vi: 'Áp dụng Transactional Outbox Pattern kết hợp Debezium CDC hoặc Polling Publisher: Dữ liệu nghiệp vụ VÀ bản tin sự kiện được ghi đồng thời vào Database trong CÙNG MỘT ACID TRANSACTION CỤC BỘ (qua bảng outbox). Một tiến trình riêng biệt (CDC đọc WAL hoặc Outbox Relay) đọc từ bảng outbox và đẩy vào Kafka/RabbitMQ với bảo đảm At-Least-Once tuyệt đối.',
      en: 'Enforce the Transactional Outbox Pattern via Debezium CDC or Polling Relays: Business data AND event payloads are committed into the local database within a SINGLE LOCAL ACID TRANSACTION (via an outbox table). An independent CDC daemon tails the database WAL to stream outbox records to Kafka with absolute At-Least-Once guarantees.'
    },
    math: {
      formula: '\\text{Atomicity}(\\text{BusinessState}, \\text{OutboxEvent}) \\in \\text{Local DB Transaction}',
      timeComplexity: 'O(1) local commit + O(1) WAL stream',
      spaceComplexity: 'O(\\text{Unsent Events}) — tự động truncate sau khi relay',
      throughputFormula: '\\text{Reliability} = 100\\% \\quad (\\text{Triệt tiêu hoàn toàn Dual-Write Dilemma})'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Thiết kế hệ thống thông điệp tin cậy cho môi trường sản xuất đòi hỏi sự kết hợp đồng bộ của 4 trụ cột: 1. Transactional Outbox (triệt tiêu dual-write); 2. Idempotent Consumer (chống trùng lặp); 3. Schema Registry (chống vỡ cấu trúc dữ liệu); 4. Toàn cảnh giám sát Observability (Lag, Throughput, Error Rate).',
      en: 'Production-grade messaging architecture mandates four synchronized pillars: 1. Transactional Outbox (eliminates dual-writes); 2. Idempotent Consumers (deduplication); 3. Schema Registry (contract evolution); 4. Full-stack Observability (Lag, Throughput, Redeliveries).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Schema Evolution & Schema Registry (Avro / Protobuf): Khi dữ liệu JSON thay đổi (thêm, xóa trường), các consumer cũ có thể bị crash do không parse được. Schema Registry quản lý phiên bản schema tập trung, thực thi các quy tắc tương thích (Backward, Forward, Full Compatibility), bảo đảm Producer không bao giờ gửi được bản tin làm vỡ code của Consumer.',
        en: 'Schema Evolution & Schema Registry: In unmanaged JSON environments, adding or removing fields causes consumer deserialization crashes. The Schema Registry enforces central schema versioning (Backward, Forward, Full Compatibility), preventing producers from emitting breaking contracts.'
      },
      {
        vi: 'Golden Signals trong Giám sát Message Broker: 1. Throughput (Msg/s); 2. Consumer Lag / Queue Depth; 3. Channel/Connection Count; 4. Redelivery Rate (Tỷ lệ gửi lại do NACK); 5. Dead Letter Queue Growth Rate (Báo hiệu Poison Message đang phát tán).',
        en: 'The Golden Signals of Message Broker Observability: 1. Throughput (Msg/s in/out); 2. Consumer Lag / Queue Depth; 3. Socket Connection & Channel count; 4. Redelivery Rate; 5. DLQ Ingestion Velocity (instant alert for poison payloads).'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Gửi Message bên trong Transaction DB: Gọi kafkaTemplate.send() nằm trong hàm @Transactional của Spring. Nếu Kafka gửi thành công nhưng DB sau đó bị ngoại lệ và rollback, message đã bay ra ngoài và không thể thu hồi lại được! Luôn luôn dùng Outbox Pattern.',
        en: 'Publishing Inside Database Transactions: Calling kafkaTemplate.send() within a Spring @Transactional boundary. If Kafka succeeds but the database subsequently aborts, the event is permanently emitted into the wild. Always leverage the Outbox Pattern.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Kiến trúc Tổng thể: Transactional Outbox + Debezium CDC + Kafka + RabbitMQ Pipeline',
      en: 'End-to-End Enterprise Architecture: Outbox + Debezium + Kafka + RabbitMQ'
    },
    description: {
      vi: 'Sơ đồ luồng dữ liệu chuẩn doanh nghiệp kết hợp cả PostgreSQL, Kafka (Event Streaming) và RabbitMQ (Task Queuing).',
      en: 'Comprehensive enterprise architecture integrating PostgreSQL Outbox, Kafka stream storage, and RabbitMQ task delivery.'
    },
    asciiDiagram: `
[ORDERS SERVICE]
       |
       +---> [POSTGRESQL DATABASE] (Single Local ACID Transaction)
                 |-- orders table (insert order)
                 +-- outbox table (insert event payload)
                          |
              (Postgres Commit Log / WAL)
                          |
                 [DEBEZIUM CDC CONNECTOR]
                          |
             (Publishes to Apache Kafka)
                          |
                 [APACHE KAFKA CLUSTER] (Durable Event Storage & Replay)
                   Topic: "orders.events"
                          |
          +---------------+---------------+
          |                               |
          v                               v
[INVENTORY SERVICE]              [RABBITMQ GATEWAY CONNECTOR]
(Kafka Consumer Group)                    |
                                 [RABBITMQ BROKER] (Task Queues)
                                 Exchange: "notifications.topic"
                                          |
                                          +---> [SMS Worker Queue]
                                          +---> [Email Worker Queue]
`,
    components: [
      {
        name: 'Transactional Outbox Table',
        role: 'Local Staging Buffer',
        description: {
          vi: 'Bảng lưu trữ các event tạm thời trong cùng một transaction với nghiệp vụ chính của database.',
          en: 'Database table staging event payloads atomically alongside business record mutations.'
        }
      },
      {
        name: 'Debezium CDC Engine',
        role: 'Zero-Impact Relay',
        description: {
          vi: 'Đọc trực tiếp từ Write-Ahead Log (WAL) của PostgreSQL và đẩy vào Kafka với độ trễ dưới 10ms.',
          en: 'Tails database commit logs (WAL) to emit outbox events into Kafka with sub-10ms latency.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Ghi đồng thời Order & Outbox vào PostgreSQL', en: 'Atomic commit to Order & Outbox' },
      phase: 'Atomic Local Commit',
      description: {
        vi: 'Spring Boot mở Transaction cục bộ, ghi đơn hàng vào bảng "orders" và ghi sự kiện vào bảng "outbox". Commit hoàn tất trong 3ms.',
        en: 'Spring Boot opens a local transaction, writes order and outbox record atomically in 3ms.'
      },
      brokerBehavior: {
        vi: 'Không có tương tác mạng nào với Kafka/RabbitMQ ở bước này, loại bỏ 100% rủi ro nghẽn mạng.',
        en: 'Zero broker network I/O; entirely immune to broker outages.'
      },
      javaCodeLineMatch: 'orderRepo.save(order); outboxRepo.save(new OutboxEntity("OrderCreated", payload));'
    },
    {
      id: 'step-1',
      title: { vi: 'Debezium CDC đọc Postgres WAL Stream', en: 'Debezium tails Postgres WAL' },
      phase: 'Change Data Capture',
      description: {
        vi: 'Debezium connector lắng nghe Postgres WAL qua Logical Replication, trích xuất Outbox payload.',
        en: 'Debezium extracts outbox row additions from Postgres WAL via logical replication.'
      },
      brokerBehavior: {
        vi: 'Debezium stream bản tin sang Kafka topic "orders.events" với acks=all.',
        en: 'Debezium produces record to Kafka orders.events topic with acks=all.'
      },
      javaCodeLineMatch: 'debezium.source.table.include.list=public.outbox'
    },
    {
      id: 'step-2',
      title: { vi: 'Kafka lưu trữ bền vững & Phân phối sang RabbitMQ', en: 'Kafka stores and bridges to RabbitMQ' },
      phase: 'Streaming & Task Dispatch',
      description: {
        vi: 'Kafka lưu log bất biến cho Analytics. Đồng thời, RabbitMQ Bridge đẩy task cần định tuyến phức tạp sang RabbitMQ.',
        en: 'Kafka stores immutable events. RabbitMQ bridge routes fine-grained task notifications.'
      },
      brokerBehavior: {
        vi: 'Tận dụng hoàn hảo thế mạnh của cả hai công nghệ trong cùng một kiến trúc.',
        en: 'Combines the storage power of Kafka with the routing dexterity of RabbitMQ.'
      },
      javaCodeLineMatch: 'rabbitTemplate.convertAndSend("notifications.topic", "order.sms", payload);'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Xử lý công việc & Tác vụ hàng đợi (Job Queue)', en: 'Job queue & task distribution' },
      keyMechanism: {
        vi: 'Quản lý các tác vụ ngắn hạn cần xử lý ngay, định tuyến tinh xảo qua Exchange, hỗ trợ priority và delay.',
        en: 'Manages transient tasks, complex multi-routing keys, priorities, and dead-letter delays.'
      },
      configExample: 'x-max-priority=10',
      architectureNote: {
        vi: 'Đóng vai trò là Worker Task Bus trong kiến trúc tổng thể.',
        en: 'Functions as the worker task dispatch pipeline in enterprise topologies.'
      }
    },
    kafka: {
      role: { vi: 'Hệ thống Lưu trữ Sự kiện Lịch sử (Event Backbone)', en: 'Enterprise event backbone' },
      keyMechanism: {
        vi: 'Lưu giữ toàn bộ lịch sử biến động dữ liệu của doanh nghiệp, làm nguồn dữ liệu chuẩn (Single Source of Truth).',
        en: 'Serves as the immutable single source of truth for all corporate state changes.'
      },
      configExample: 'cleanup.policy=compact, retention.ms=604800000',
      architectureNote: {
        vi: 'Đóng vai trò là cột sống luồng dữ liệu trung tâm (Data Backbone) kết nối toàn bộ hệ sinh thái.',
        en: 'Serves as the central data backbone uniting microservices, data lakes, and analytics.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Triệt tiêu 100% vấn nạn Ghi kép (Dual-Write Problem) mà không cần 2PC.',
        en: '100% elimination of the Dual-Write dilemma without distributed locking.'
      },
      {
        vi: 'Bảo đảm tính nhất quán cuối cùng tuyệt đối giữa Database và các cụm Message Broker.',
        en: 'Guaranteed eventual consistency across databases and message brokers.'
      }
    ],
    cons: [
      {
        vi: 'Cần duy trì hạ tầng Debezium CDC và dọn dẹp (Truncate/Delete) bảng outbox định kỳ.',
        en: 'Requires operational maintenance of CDC infrastructure and outbox table pruning.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Outbox Pattern thêm độ trễ truyền tin ~5-15ms từ database sang broker nhưng đem lại độ tin cậy cấp ngân hàng.',
      en: 'Outbox introduces 5-15ms CDC propagation latency in exchange for banking-grade reliability.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm thứ tự 100% theo đúng trình tự ghi vào Write-Ahead Log của Database.',
      en: 'Preserves 100% chronological order matching the database Write-Ahead Log commits.'
    }
  },

  javaCode: `package com.enterprise.messaging.outbox;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.UUID;

// 1. Transactional Outbox Entity
public record OutboxRecord(
    UUID id,
    String aggregateType,
    String aggregateId,
    String type,
    String payload,
    Instant createdAt
) {}

// 2. Order Service executing Zero-Dual-Write Pattern
@Service
public class OrderApplicationService {

    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public OrderApplicationService(OrderRepository orderRepository,
                                   OutboxRepository outboxRepository,
                                   ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional // Pure Local Postgres ACID Transaction
    public String placeOrder(CreateOrderCommand cmd) throws Exception {
        String orderId = "ORD-" + UUID.randomUUID();
        OrderEntity order = new OrderEntity(orderId, cmd.customerId(), cmd.totalAmount(), "PENDING");
        orderRepository.save(order);

        // Create Outbox Event in the EXACT same transaction
        String eventPayload = objectMapper.writeValueAsString(new OrderCreatedEvent(orderId, cmd.totalAmount()));
        OutboxRecord outbox = new OutboxRecord(
            UUID.randomUUID(),
            "Order",
            orderId,
            "OrderCreated",
            eventPayload,
            Instant.now()
        );
        outboxRepository.save(outbox);

        // Transaction commits atomically! If power fails here, BOTH order and outbox exist or neither does!
        return orderId;
    }
}`,

  springConfigCode: `# Debezium PostgreSQL Connector Configuration
{
  "name": "order-outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "plugin.name": "pgoutput",
    "database.hostname": "postgres-master",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "secret",
    "database.dbname": "orders_db",
    "table.include.list": "public.outbox",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter"
  }
}`,

  interviewQuestions: [
    {
      question: {
        vi: 'Dual-Write Problem trong Microservices là gì? Tại sao Transactional Outbox Pattern lại là giải pháp tối ưu nhất?',
        en: 'What is the Dual-Write Problem in Microservices? Why is the Transactional Outbox Pattern the optimal solution?'
      },
      answer: {
        vi: 'Dual-Write xảy ra khi một thao tác nghiệp vụ cần ghi vào 2 hệ thống độc lập (ví dụ lưu database và bắn message vào Kafka). Do không có giao dịch phân tán, một trong hai thao tác có thể thất bại trong khi thao tác kia thành công, dẫn đến dữ liệu bị sai lệch vĩnh viễn. Transactional Outbox giải quyết triệt để bằng cách biến việc gửi message thành một thao tác ghi bản ghi vào bảng "outbox" bên trong cùng 1 local transaction của database. Do đó, việc lưu nghiệp vụ và lưu message là nguyên tử (ACID). Sau đó, Debezium CDC đọc trực tiếp từ log của database (Postgres WAL) để đẩy vào Kafka với bảo đảm không bao giờ mất dữ liệu.',
        en: 'Dual-Write occurs when an operation must update two disconnected data stores without 2PC. Partial network failures inevitably cause desynchronization. The Transactional Outbox pattern solves this by persisting event records into an "outbox" table within the same local database ACID transaction as the business mutation. Debezium CDC tails the database WAL to relay events asynchronously to Kafka with guaranteed At-Least-Once delivery.'
      },
      seniority: 'Lead'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sai lệch 40.000 đơn hàng do gọi Kafka Template bên trong Spring @Transactional',
      en: '40,000 Inconsistent Orders Caused by In-Transaction Kafka Publishing'
    },
    businessContext: {
      vi: 'Một sàn thương mại điện tử xử lý hàng trăm ngàn đơn hàng mua sắm hàng ngày.',
      en: 'An e-commerce marketplace processing hundreds of thousands of daily checkouts.'
    },
    problemDescription: {
      vi: 'Kỹ sư viết code gọi kafkaTemplate.send("orders", event) ngay bên trong hàm @Transactional. Khi hệ thống gặp tải cao, cơ sở dữ liệu bị deadlock và ném ngoại lệ TransactionSystemException, khiến đơn hàng trong Postgres bị ROLLBACK. Tuy nhiên, lệnh kafkaTemplate.send() trước đó đã gửi thành công sang Kafka! Các consumer downstream (Kho, Giao hàng, Email) nhận được event và tiến hành đóng gói, giao hàng cho khách hàng dù đơn hàng đó KHÔNG HỀ TỒN TẠI trên hệ thống quản lý, gây thất thoát hàng tỷ đồng.',
      en: 'Developers invoked kafkaTemplate.send() inside a Spring @Transactional service method. Under concurrency, database deadlocks triggered rollbacks. However, the Kafka send had already completed! Downstream warehouse and shipping workers received the ghost events and shipped products for orders that did not legally exist, leaking millions in inventory.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư chuyển lệnh kafkaTemplate.send() xuống cuối hàm, sau khi repository.save(). Nhưng @Transactional chỉ thực sự commit khi hàm kết thúc. Nếu bước commit của Spring bị lỗi mạng ở khoảnh khắc cuối cùng, event vẫn bị phát tán oan.',
      en: 'The team placed kafkaTemplate.send() at the end of the method after repo.save(). But Spring @Transactional only commits upon method exit. If the DB commit failed at the last millisecond, ghost events still escaped.'
    },
    coreSolution: {
      vi: 'Xóa bỏ hoàn toàn kafkaTemplate khỏi nghiệp vụ chính; triển khai bảng Transactional Outbox lưu chung transaction với bảng orders; sử dụng Debezium CDC đọc Postgres WAL đẩy sang Kafka. Chỉ những transaction thực sự commit thành công vào đĩa cứng mới được Debezium phát tán.',
      en: 'Purged direct kafkaTemplate calls from business logic. Implemented the Transactional Outbox pattern with Debezium CDC tailing Postgres WAL. Only transactions that successfully commit to disk are ever streamed into Kafka.'
    },
    productionCode: `// Architecture Fix: Pure local commit + Debezium CDC
@Transactional
public OrderResult createOrder(OrderCommand cmd) {
    Order order = orderRepo.save(new Order(cmd));
    // Atomic outbox insertion in local DB transaction
    outboxRepo.save(new OutboxEvent("orders", order.getId(), order.toJson()));
    return new OrderResult(order.getId());
    // Zero ghost events: Debezium only reads committed WAL records!
}`,
    architectureImpact: {
      vi: 'Triệt tiêu 100% tình trạng đơn hàng ma; bảo đảm tính nhất quán tuyệt đối giữa dữ liệu quản lý và luồng giao vận kho.',
      en: '100% elimination of ghost orders; absolute consistency between financial ledger and physical warehouse operations.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia,
    MESSAGING_RESEARCH_CITATIONS.bytebytego_delivery_semantics
  ]
};
