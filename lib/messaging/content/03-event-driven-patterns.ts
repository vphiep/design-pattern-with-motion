import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const eventDrivenPatternsTopic: MessagingTopic = {
  id: 'event-driven-patterns',
  category: 'messaging-fundamentals',
  level: 'core',
  chapter: 'Chương 01 — Messaging Fundamentals',
  name: 'Event-Driven Architecture & Messaging Patterns',
  tagline: {
    vi: 'Phân tích Event Notification vs Event-Carried State Transfer, Choreography vs Orchestration Saga và Correlation ID.',
    en: 'Exploring Event Notification vs Event-Carried State Transfer, Choreography vs Orchestrator Sagas, and Correlation IDs.'
  },
  difficulty: 2,
  order: 3,
  estimatedMinutes: 17,

  coreTheory: {
    problemStatement: {
      vi: 'Khi chuyển sang kiến trúc Microservices, một nghiệp vụ kinh doanh duy nhất (như Đặt hàng) đòi hỏi sự phối hợp của 4-5 service độc lập (Order -> Payment -> Inventory -> Shipping). Nếu sử dụng mô hình đồng bộ REST, hệ thống sẽ gặp bế tắc khi xảy ra lỗi cục bộ (ví dụ: trừ tiền thành công nhưng hết hàng trong kho) và không thể rollback transaction phân tán kiểu ACID truyền thống.',
      en: 'In microservice architectures, single business transactions span multiple discrete services (Order -> Payment -> Inventory -> Shipping). Synchronous REST pipelines cannot execute distributed ACID rollbacks when downstream operations fail (e.g., payment succeeds but inventory is exhausted).'
    },
    hardwareConstraint: {
      vi: 'Giao thức Two-Phase Commit (2PC / XA Transactions) khóa tài nguyên phân tán (Distributed Locks) qua mạng, khiến latency tăng gấp 20 lần và throughput sụp đổ theo định luật Amdahl.',
      en: 'Two-Phase Commit (2PC/XA) protocols hold distributed pessimistic database locks across network boundaries, causing 20x latency spikes and throughput collapse under Amdahl’s Law.'
    },
    fundamentalSolution: {
      vi: 'Áp dụng Event-Driven Architecture (EDA) và Saga Pattern: Giao dịch phân tán được phân rã thành một chuỗi các Local Transaction độc lập. Mỗi service commit cục bộ vào DB của mình rồi phát ra một Domain Event. Các service tiếp theo lắng nghe event để tiếp tục quy trình hoặc phát Compensating Transaction (Giao dịch bù trừ) để hoàn tác khi có sự cố.',
      en: 'Adopt Event-Driven Architecture (EDA) with the Saga Pattern: distributed transactions are broken down into sequences of local transactions. Each service commits locally, emits a domain event, and downstream services react or trigger Compensating Transactions on failure.'
    },
    math: {
      formula: 'T_{\\text{saga}} = \\sum_{i=1}^{k} T_{\\text{step}_i} + \\sum_{j=1}^{m} T_{\\text{compensate}_j}',
      timeComplexity: 'O(k) — k là số bước trong Saga chain',
      spaceComplexity: 'O(1) per event metadata header',
      throughputFormula: '\\text{Throughput}_{EDA} \\approx \\min(\\mu_1, \\mu_2, \\dots, \\mu_k) \\quad \\text{với hàng đợi đệm trung gian}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Có hai phong cách chính trong kiến trúc hướng sự kiện: 1. Event Notification (Message chỉ chứa ID và hành động, người nhận phải gọi ngược lại để lấy chi tiết); 2. Event-Carried State Transfer (ECST - Message chứa toàn bộ dữ liệu trạng thái mới, downstream không cần truy vấn ngược).',
      en: 'Two dominant event patterns exist: 1. Event Notification (lightweight, contains only entity ID and action, requiring downstream callbacks); 2. Event-Carried State Transfer (ECST - payload carries the full snapshot state, eliminating querying back to producer).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Choreography vs Orchestration: Trong Choreography (Biên đạo múa), không có service trung tâm điều phối; mỗi service tự nghe event và phát event tiếp theo. Ưu điểm: phi tập trung, cực kỳ loose-coupling. Nhược điểm: khó theo dõi luồng khi hệ thống có hàng chục service. Trong Orchestration (Chỉ huy dàn nhạc), một Orchestrator Service (như Camunda hoặc Temporal) đóng vai trò máy trạng thái (State Machine) gửi Command và theo dõi phản hồi.',
        en: 'Choreography vs Orchestration: Choreography has no centralized orchestrator; services react independently. It offers maximum decoupling but risks becoming chaotic at scale. Orchestration uses a central coordinator (State Machine) to send explicit commands and handle rollbacks predictably.'
      },
      {
        vi: 'Correlation ID & Causality Tracking: Mọi message trong chuỗi nghiệp vụ bắt buộc phải gắn kèm Correlation-Id (nhận diện toàn bộ giao dịch) và Causation-Id (nhận diện message trực tiếp kích hoạt bước này) trong Header để hệ thống Distributed Tracing (OpenTelemetry/Jaeger) có thể tái dựng lại toàn bộ cây thực thi.',
        en: 'Correlation ID & Causation ID: Every distributed event must carry an X-Correlation-ID (tracing entire business flow) and X-Causation-ID (the immediate parent event) in headers for OpenTelemetry/Jaeger tracing reconstruction.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Trôi dạt dữ liệu trong Event-Carried State Transfer: Khi gửi toàn bộ snapshot dữ liệu trong event, nếu hai sự kiện đến không theo thứ tự (Out-of-order), consumer có thể ghi đè dữ liệu mới bằng dữ liệu cũ (Lost Update). Cần đính kèm version number hoặc timestamp đơn điệu.',
        en: 'Out-of-order State Drifts in ECST: Full-snapshot event payloads arriving out-of-order will overwrite newer state with stale snapshots. Payloads must carry monotonic version numbers.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Mô hình Điều phối Saga: Choreography vs Orchestrator Event Flow',
      en: 'Saga Patterns: Choreography Event Stream vs Orchestrator Command Bus'
    },
    description: {
      vi: 'Minh họa chuỗi phân tán Order -> Payment -> Inventory -> Shipping với Compensating Transaction khi hết hàng.',
      en: 'Sequence diagram of multi-stage Saga workflows with automatic compensating rollback on inventory failure.'
    },
    asciiDiagram: `
[CHOREOGRAPHY SAGA - DISTRIBUTED EVENT CHAIN]
OrderService ---[OrderCreatedEvent]---> Broker
                                           |
    +--------------------------------------+
    |---> PaymentService ---[PaymentCompletedEvent]---> Broker
                                                           |
    +------------------------------------------------------+
    |---> InventoryService (OUT OF STOCK ERROR!)
              |
              +---[InventoryFailedEvent]---> Broker
                                                |
    +-------------------------------------------+
    |---> PaymentService [RefundPaymentCompensatingAction]
    |---> OrderService   [MarkOrderCancelledAction]
`,
    components: [
      {
        name: 'Event Notification Payload',
        role: 'Lightweight Event',
        description: {
          vi: 'Chỉ chứa orderId và eventType, giữ kích thước message siêu nhỏ (< 1KB).',
          en: 'Carries minimal metadata (orderId, type) for rapid lightweight propagation.'
        }
      },
      {
        name: 'Event-Carried State Transfer',
        role: 'Full Snapshot Payload',
        description: {
          vi: 'Chứa đầy đủ thông tin khách hàng, địa chỉ, giỏ hàng để downstream cache cục bộ.',
          en: 'Carries complete state snapshots enabling downstream independent local query caching.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Khởi tạo OrderCreatedEvent', en: 'OrderCreatedEvent Emitted' },
      phase: 'Initial Trigger',
      description: {
        vi: 'OrderService lưu trạng thái PENDING_PAYMENT vào DB và phát event ra broker.',
        en: 'OrderService commits PENDING_PAYMENT locally and broadcasts domain event.'
      },
      brokerBehavior: {
        vi: 'Broker định tuyến event đến exchange orders.topic.',
        en: 'Broker routes event to orders.topic exchange.'
      },
      javaCodeLineMatch: 'eventPublisher.publishEvent(new OrderCreatedEvent(orderId, items, amount));'
    },
    {
      id: 'step-1',
      title: { vi: 'PaymentService trừ tiền & phát PaymentSuccessEvent', en: 'Payment Deducted & Emitted' },
      phase: 'Step 2 - Payment',
      description: {
        vi: 'PaymentService nghe event, trừ tiền thẻ tín dụng và phát PaymentSuccessEvent.',
        en: 'PaymentService processes credit card charge and publishes PaymentSuccessEvent.'
      },
      brokerBehavior: {
        vi: 'Event tiếp tục được fanout đến queue của InventoryService.',
        en: 'Event fans out to inventory queue.'
      },
      javaCodeLineMatch: 'eventPublisher.publishEvent(new PaymentSuccessEvent(orderId, paymentId));'
    },
    {
      id: 'step-2',
      title: { vi: 'InventoryService phát hiện hết hàng (Failure Trigger)', en: 'Inventory Out-of-Stock Failure' },
      phase: 'Step 3 - Inventory Fault',
      description: {
        vi: 'Kho không còn đủ sản phẩm, phát InventoryFailedEvent để kích hoạt chuỗi bù trừ.',
        en: 'Warehouse item depleted; emits InventoryFailedEvent to trigger compensation.'
      },
      brokerBehavior: {
        vi: 'Broker chuyển event lỗi đến các compensation queue của Order và Payment.',
        en: 'Broker routes failure event to compensation handlers.'
      },
      javaCodeLineMatch: 'eventPublisher.publishEvent(new InventoryFailedEvent(orderId, "OUT_OF_STOCK"));'
    },
    {
      id: 'step-3',
      title: { vi: 'Thực thi Compensating Transaction (Hoàn tiền)', en: 'Compensating Refund Executed' },
      phase: 'Compensating Rollback',
      description: {
        vi: 'PaymentService hoàn tiền lại cho khách hàng; OrderService đổi trạng thái sang CANCELLED.',
        en: 'PaymentService refunds card charge; OrderService sets status to CANCELLED.'
      },
      brokerBehavior: {
        vi: 'Hệ thống đạt trạng thái nhất quán cuối cùng (Eventual Consistency).',
        en: 'Cluster reaches eventual consistency across all microservice databases.'
      },
      javaCodeLineMatch: 'paymentGateway.refund(orderId); orderRepo.updateStatus(orderId, CANCELLED);'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Định tuyến linh hoạt cho Choreography', en: 'Flexible Routing for Choreography' },
      keyMechanism: {
        vi: 'Dùng Topic Exchange với Routing Key (orders.created, orders.payment.failed) để phân phối chính xác đến từng queue bù trừ.',
        en: 'Leverages Topic Exchanges with wildcard routing keys to map events cleanly to compensation queues.'
      },
      configExample: 'orders.*.failed -> compensation-queue',
      architectureNote: {
        vi: 'Rất dễ dàng thêm một subscriber mới (ví dụ AnalyticsService) mà không sửa bất kỳ code Producer nào.',
        en: 'Trivial to plug in new consumers (e.g., Audit or Analytics) without changing producer code.'
      }
    },
    kafka: {
      role: { vi: 'Single Source of Truth cho Event Sourcing', en: 'Single Source of Truth for Event Sourcing' },
      keyMechanism: {
        vi: 'Lưu toàn bộ chuỗi sự kiện vào Partition Log có thứ tự. Mọi service có thể tua lại từ đầu để dựng lại State.',
        en: 'Persists immutable ordered event streams. Services can replay logs to reconstruct entire aggregate states.'
      },
      configExample: 'cleanup.policy=compact, min.insync.replicas=2',
      architectureNote: {
        vi: 'Lý tưởng cho mô hình Event Sourcing và CQRS (Command Query Responsibility Segregation).',
        en: 'Ideal for Event Sourcing, CQRS, and high-scale audit compliance topologies.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Triệt tiêu hoàn toàn Distributed Locking, cho phép hệ thống mở rộng quy mô không giới hạn.',
        en: 'Eliminates distributed locks, enabling horizontal elastic scalability.'
      },
      {
        vi: 'Tính tự phục hồi cao: Một service tạm dừng bảo trì không làm đứt gãy luồng của các service khác.',
        en: 'Fault isolation: Downtime in one service does not crash peer upstream microservices.'
      }
    ],
    cons: [
      {
        vi: 'Thiết kế Compensating Transaction rất phức tạp (không phải hành động nào cũng có thể hoàn tác dễ dàng).',
        en: 'Compensating transactions are complex to implement for non-reversible real-world actions.'
      },
      {
        vi: 'Khó debug và theo dõi luồng dữ liệu nếu thiếu hệ thống Distributed Tracing hoàn chỉnh.',
        en: 'Challenging observability without automated distributed tracing and correlation IDs.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Giao dịch hoàn tất cuối cùng (Eventual) sau vài giây thay vì trả kết quả tức thời, nhưng throughput tăng vọt 50x.',
      en: 'Transactions complete eventually over seconds instead of milliseconds, but aggregate throughput leaps 50x.'
    },
    orderingGuarantee: {
      vi: 'Bắt buộc phải phân vùng theo Aggregate ID (như OrderId) để bảo đảm các sự kiện của cùng 1 đơn hàng luôn đến theo đúng thứ tự.',
      en: 'Must partition strictly by Aggregate ID (e.g., OrderId) to preserve event order per business entity.'
    }
  },

  javaCode: `package com.enterprise.messaging.saga;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import java.util.UUID;

// 1. Envelope Event with Correlation ID for Distributed Tracing
public record OrderSagaEvent(
    String correlationId,
    String causationId,
    String orderId,
    String eventType,
    double amount,
    long timestamp
) {}

// 2. Saga Participant: Payment Service
@Service
public class SagaPaymentParticipant {
    private final KafkaTemplate<String, OrderSagaEvent> kafkaTemplate;

    public SagaPaymentParticipant(KafkaTemplate<String, OrderSagaEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @KafkaListener(topics = "order-events", groupId = "payment-saga-group")
    public void onOrderEvent(OrderSagaEvent event,
                             @Header(KafkaHeaders.RECEIVED_KEY) String orderKey) {
        if ("ORDER_CREATED".equals(event.eventType())) {
            boolean success = executeBankCharge(event.orderId(), event.amount());
            if (success) {
                OrderSagaEvent successEvent = new OrderSagaEvent(
                    event.correlationId(),
                    event.orderId(),
                    event.orderId(),
                    "PAYMENT_SUCCESS",
                    event.amount(),
                    System.currentTimeMillis()
                );
                kafkaTemplate.send("order-events", orderKey, successEvent);
            }
        } else if ("INVENTORY_OUT_OF_STOCK".equals(event.eventType())) {
            // Trigger Compensating Transaction: Refund Payment!
            executeRefund(event.orderId(), event.amount());
            System.out.printf("Refunded order %s due to inventory failure%n", event.orderId());
        }
    }

    private boolean executeBankCharge(String orderId, double amount) { return true; }
    private void executeRefund(String orderId, double amount) {}
}`,

  springConfigCode: `spring:
  kafka:
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        enable.idempotence: true
        acks: all
    consumer:
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer`,

  interviewQuestions: [
    {
      question: {
        vi: 'So sánh Saga Choreography và Saga Orchestration. Dự án thực tế quy mô lớn nên chọn mô hình nào?',
        en: 'Compare Saga Choreography vs Saga Orchestration. Which should be selected in large-scale enterprise projects?'
      },
      answer: {
        vi: 'Choreography phù hợp cho quy trình đơn giản (2-4 service), không muốn có điểm thắt cổ chai trung tâm. Tuy nhiên khi quy trình lên tới 8-15 bước (Order, KYC, Fraud, Payment, Warehouse, Carrier, Loyalty Points), Choreography sẽ biến thành "Spaghetti Architecture" cực kỳ khó bảo trì và không thể biết được trạng thái đơn hàng hiện tại đang ở đâu. Trong các dự án lớn, Orchestration (sử dụng Temporal, Camunda, hoặc Orchestrator Service chuyên biệt) là lựa chọn tối ưu vì quản lý State Machine tập trung, dễ visualize và dễ debug rollback.',
        en: 'Choreography is great for simple 2-4 service workflows without central bottlenecks. However, when flows expand to 8-15 steps, choreography degrades into an untraceable "spaghetti architecture". Large enterprises prefer Orchestration (via Temporal or state machines) because central state machines provide clear observability, timeout handling, and deterministic rollbacks.'
      },
      seniority: 'Senior'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố nghẽn giao dịch và trôi dữ liệu do thiếu Compensating Transaction trong Saga',
      en: 'Phantom Inventory Lock & Fund Leak Due to Missing Compensating Sagas'
    },
    businessContext: {
      vi: 'Một sàn du lịch trực tuyến bán vé máy bay và phòng khách sạn theo gói Combo. Khi khách hàng đặt vé máy bay thành công nhưng phòng khách sạn hết chỗ, hệ thống không tự động hoàn tác.',
      en: 'An online travel agency sold flight + hotel combos. Flights booked successfully but hotels ran out of vacancies, leaving orphan flight tickets without automated rollback.'
    },
    problemDescription: {
      vi: 'Hệ thống dùng REST gọi chéo lẫn nhau. Khi khách sạn báo hết phòng, connection bị drop, khách hàng vẫn bị trừ tiền vé máy bay nhưng không nhận được combo du lịch. Hơn 1.200 khiếu nại phát sinh trong kỳ nghỉ hè.',
      en: 'System relied on synchronous REST cascades. When hotels failed, connections dropped, leaving users charged for non-refundable flights without hotels, sparking 1,200 angry support escalations.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư dùng cron job quét database mỗi đêm để hoàn tiền thủ công. Khách hàng phải chờ 24-48 giờ và tỷ lệ đối soát sai lệch lên tới 8%.',
      en: 'Engineers ran nightly cron scripts for manual refunds. Customers waited 48 hours and ledger discrepancy rates hit 8%.'
    },
    coreSolution: {
      vi: 'Chuyển đổi sang Event-Driven Saga Pattern với Compensation Queue: Khi HotelService phát HotelBookingFailedEvent, FlightService tự động lắng nghe và gọi API hủy vé máy bay (Compensating Action) trong vòng 500ms, đồng thời PaymentService hoàn tiền ngay lập tức vào ví của người dùng.',
      en: 'Re-architected to an Event-Driven Saga with Compensation Queues: HotelBookingFailedEvent triggers an automated flight cancellation and instant payment refund within 500ms flat.'
    },
    productionCode: `@KafkaListener(topics = "travel-booking-saga")
public void handleSagaRollback(BookingSagaEvent event) {
    if ("HOTEL_RESERVATION_FAILED".equals(event.eventType())) {
        airlinePartnerClient.cancelFlightTicket(event.flightTicketId());
        walletClient.refund(event.userId(), event.totalAmount());
        notificationClient.sendAlert(event.userId(), "Combo booking failed, full refund issued.");
    }
}`,
    architectureImpact: {
      vi: 'Thời gian xử lý hoàn tác tự động giảm từ 48 giờ xuống dưới 1 giây; tỷ lệ khiếu nại giảm 99.8%; loại bỏ hoàn toàn tình trạng treo vé mồ côi.',
      en: 'Rollback turnaround dropped from 48 hours to under 1s; customer support escalations plunged 99.8%; zero orphan ticket locks.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia,
    MESSAGING_RESEARCH_CITATIONS.bytebytego_delivery_semantics
  ]
};
