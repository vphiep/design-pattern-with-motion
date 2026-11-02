import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const messageQueueArchitectureTopic: MessagingTopic = {
  id: 'message-queue-architecture',
  category: 'messaging-fundamentals',
  level: 'core',
  chapter: 'Chương 01 — Messaging Fundamentals',
  name: 'Message Queue Architecture & Asynchronous Communication',
  tagline: {
    vi: 'Phân tách kiến trúc Đồng bộ vs Bất đồng bộ, vòng đời bản tin và ranh giới giữa Message Queue truyền thống và Event Streaming.',
    en: 'Deconstructing Synchronous vs Asynchronous communications, message lifecycles, and the boundary between Traditional Queues and Event Streaming.'
  },
  difficulty: 1,
  order: 1,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      vi: 'Giao tiếp đồng bộ trực tiếp (HTTP REST / gRPC) tạo ra sự phụ thuộc chặt chẽ (Tight Coupling). Khi OrderService gọi trực tiếp Payment, Inventory và EmailService, chỉ cần một service chậm hoặc mất mạng, toàn bộ luồng giao dịch bị tắc nghẽn (Blocking I/O), tiêu tốn thread pool và dẫn đến sập đổ dây chuyền (Cascading Failure).',
      en: 'Direct synchronous calls (HTTP/gRPC) introduce tight coupling. If OrderService calls Payment, Inventory, and EmailService synchronously, latency compounds, client threads block indefinitely, and a single downstream failure cascades across the entire architecture.'
    },
    hardwareConstraint: {
      vi: 'Băng thông mạng và số lượng socket TCP/Thread hệ điều hành là hữu hạn. Khi hàng ngàn request đồng thời đổ về (Spike Traffic), CPU phải liên tục context-switch giữa các blocked threads, khiến latency P99 tăng theo hàm mũ và bộ nhớ đệm RAM cạn kiệt.',
      en: 'Network sockets, OS thread pools, and NIC ingress bandwidth are finite. Under traffic spikes, thousands of blocked threads cause catastrophic OS context-switch overhead, escalating P99 latency and exhausting heap memory.'
    },
    fundamentalSolution: {
      vi: 'Đưa một Message Broker trung gian vào giữa để làm bộ đệm bất đồng bộ (Temporal Decoupling). Producer đẩy message vào hàng đợi rồi trả về phản hồi tức thì (< 5ms). Broker đảm bảo lưu trữ bền vững (Persistent Storage), cho phép Consumer xử lý theo tốc độ thực tế của mình mà không làm Producer bị nghẽn.',
      en: 'Introduce an asynchronous message broker as a persistent buffer for temporal decoupling. Producers publish messages and receive immediate acks (< 5ms). The broker stores messages durably, decoupling ingestion throughput from downstream consumer processing rates.'
    },
    math: {
      formula: 'T_{total} = T_{network} + T_{queueing} + T_{processing}',
      timeComplexity: 'O(1) enqueue · O(1) dequeue',
      spaceComplexity: 'O(M) — M là số message trong buffer',
      throughputFormula: 'Throughput_{system} \\approx \\min(\\lambda_{producer}, \\mu_{consumer}) \\quad \\text{khi } \\text{Queue Depth ổn định}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Message Queue là thành phần nền tảng của mọi hệ thống phân tán chịu tải lớn. Sự khác biệt cốt lõi giữa Message Queue truyền thống (như RabbitMQ) và Event Streaming (như Kafka) nằm ở triết lý quản lý trạng thái: Message Queue coi message là "công việc cần xóa sau khi xong" (Transient Work Item), còn Event Streaming coi message là "sự thật lịch sử bất biến cần lưu giữ trong log" (Immutable Fact Log).',
      en: 'Message Queues are fundamental to scalable distributed architectures. The key architectural dichotomy lies between Transient Message Queues (RabbitMQ - messages are transient work items deleted upon ACK) and Log-based Event Streaming (Kafka - messages are immutable append-only facts retained permanently for replay).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Mô hình Point-to-Point vs Publish/Subscribe: Trong Point-to-Point, mỗi message trong queue chỉ được nhận và xử lý bởi đúng 1 consumer (Competing Consumers Pattern). Trong Publish/Subscribe, mỗi subscriber hoặc consumer group sẽ nhận được một bản sao độc lập của event đó.',
        en: 'Point-to-Point vs Publish/Subscribe: In Point-to-Point, each message is consumed by exactly one competing consumer. In Publish/Subscribe, an event is fanned out so every independent subscriber group processes its own copy.'
      },
      {
        vi: 'Vòng đời bản tin 4 pha: 1. Publish (Producer gửi vào Broker qua TCP Channel); 2. Store (Broker ghi vào RAM hoặc fsync xuống Disk); 3. Deliver (Broker đẩy qua Push hoặc Consumer kéo qua Poll); 4. Acknowledge (Consumer xác nhận xử lý thành công, Broker cập nhật offset hoặc xóa bản tin).',
        en: 'Four-phase Message Lifecycle: 1. Publish (producer emits over TCP); 2. Store (broker buffers in RAM or fsyncs to disk); 3. Deliver (push-based delivery or pull-based polling); 4. Acknowledge (consumer commits successful processing, broker deletes message or advances log offset).'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Nhầm lẫn giữa Message Queue và Event Streaming: Dùng RabbitMQ cho tác vụ phân tích dữ liệu lớn cần đọc lại log nhiều ngày trước sẽ làm cạn kiệt RAM server; ngược lại dùng Kafka cho mô hình RPC phản hồi yêu cầu tức thời theo routing key phức tạp sẽ lãng phí tài nguyên partition.',
        en: 'Confusing Message Queues with Event Logs: Using RabbitMQ for big-data replay will exhaust broker RAM; conversely, using Kafka for complex fine-grained point-to-point RPC routing introduces unnecessary partition overhead.'
      },
      {
        vi: 'Không cấu hình Timeout và Retry hợp lý: Gửi message đồng bộ chờ ACK mà không có Circuit Breaker sẽ biến kiến trúc bất đồng bộ trở lại thành kiến trúc nghẽn đồng bộ khi broker bị sự cố.',
        en: 'Synchronous blocking on async brokers: Waiting synchronously for broker acks without circuit breakers or timeout bounds re-introduces the same thread-blocking vulnerabilities as HTTP.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cấu trúc Vật lý: Synchronous Direct Call vs Broker Asynchronous Pipeline',
      en: 'Physical Topology: Synchronous Direct Call vs Broker Asynchronous Pipeline'
    },
    description: {
      vi: 'Sơ đồ so sánh luồng giao tiếp đồng bộ gây nghẽn thread và luồng qua Message Broker giải phóng tài nguyên Producer tức thì.',
      en: 'Architectural schematic contrasting tight thread-blocking synchronous coupling against decoupled broker ingestion pipelines.'
    },
    asciiDiagram: `
[SYNCHRONOUS COUPLING - BLOCKING CASCADE]
OrderService ----(HTTP Req)----> PaymentService (Blocked 200ms)
     |           ----(HTTP Req)----> InventoryService (Blocked 150ms)
     |           ----(HTTP Req)----> EmailService (Timeout Crash -> 500 Error!)
     +-------------------- Total Latency: 350ms+ (Threads Blocked)

[ASYNCHRONOUS BROKER DECOUPLING - 5ms RESPONSE]
OrderService ---[Publish Event]--> [ MESSAGE BROKER BUFFER ]
     |                                    |
(HTTP 200 OK in 4ms)                      +---> PaymentConsumer (Processes at 1,000 msg/s)
                                          +---> InventoryConsumer (Processes at 800 msg/s)
                                          +---> EmailConsumer (Processes at 100 msg/s independently)
`,
    components: [
      {
        name: 'Producer (OrderService)',
        role: 'Event Publisher',
        description: {
          vi: 'Gói dữ liệu thành Payload nhị phân/JSON và gửi vào broker rồi giải phóng thread phục vụ user tiếp theo.',
          en: 'Encapsulates payload into JSON/Protobuf, emits to broker and immediately returns HTTP 202/200.'
        }
      },
      {
        name: 'Broker Storage Engine',
        role: 'Durable Buffer',
        description: {
          vi: 'Lưu message vào RAM/Disk, quản lý queue depth và điều phối luồng dữ liệu.',
          en: 'Buffers messages in RAM/Disk, tracks queue depth, and coordinates backpressure.'
        }
      },
      {
        name: 'Consumers (Payment, Shipping)',
        role: 'Independent Workers',
        description: {
          vi: 'Xử lý message theo tốc độ phần cứng của riêng mình, không ảnh hưởng lẫn nhau.',
          en: 'Independently pull or receive messages matched to their native computational throughput.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Producer tạo OrderCreatedEvent', en: 'Producer builds OrderCreatedEvent' },
      phase: 'Client Ingestion',
      description: {
        vi: 'Khách hàng bấm thanh toán, OrderService ghi dữ liệu vào Postgres rồi tạo message chứa OrderId, Amount, CustomerId.',
        en: 'User checks out, OrderService saves to DB and formats an OrderCreatedEvent payload.'
      },
      brokerBehavior: {
        vi: 'Chưa có hoạt động trên broker, Producer mở connection pool sẵn có.',
        en: 'Broker is idle; client prepares socket connection.'
      },
      javaCodeLineMatch: 'OrderEvent event = new OrderEvent(orderId, customerId, amount);'
    },
    {
      id: 'step-1',
      title: { vi: 'Gửi Message vào Broker Buffer', en: 'Publish Message into Broker Buffer' },
      phase: 'Network Transfer & Storage',
      description: {
        vi: 'Message truyền qua TCP, Broker nhận gói tin, ghi vào Memory Buffer hoặc Append-only Commit Log.',
        en: 'Message travels over TCP; broker buffers the packet in memory or appends to commit log.'
      },
      brokerBehavior: {
        vi: 'Broker tăng Queue Depth lên +1 và sinh Message ID duy nhất.',
        en: 'Broker increments queue depth counter by 1 and assigns sequence metadata.'
      },
      javaCodeLineMatch: 'rabbitTemplate.convertAndSend("orders.exchange", "order.created", event);'
    },
    {
      id: 'step-2',
      title: { vi: 'Broker gửi ACK xác nhận cho Producer', en: 'Broker confirms ACK to Producer' },
      phase: 'Producer Decoupling',
      description: {
        vi: 'Broker trả về Publisher Confirm (ACK). OrderService hoàn tất trả phản hồi cho Web UI trong 4ms.',
        en: 'Broker returns publisher confirm ACK. OrderService responds to UI in 4ms flat.'
      },
      brokerBehavior: {
        vi: 'Message đã nằm an toàn trong bộ nhớ đệm, sẵn sàng dispatch cho Consumer.',
        en: 'Message is secured in broker buffers, queued for dispatch.'
      },
      javaCodeLineMatch: 'return ResponseEntity.accepted().body("Order queued successfully");'
    },
    {
      id: 'step-3',
      title: { vi: 'Consumer nhận và xử lý bất đồng bộ', en: 'Consumer processes async event' },
      phase: 'Consumer Execution',
      description: {
        vi: 'PaymentConsumer và ShippingConsumer nhận message độc lập, tiến hành trừ tiền và xuất kho.',
        en: 'PaymentConsumer and ShippingConsumer consume event in parallel without coupling.'
      },
      brokerBehavior: {
        vi: 'Message chuyển sang trạng thái Unacknowledged cho đến khi Consumer gửi ACK.',
        en: 'Broker marks message as In-Flight / Unacknowledged pending consumer commit.'
      },
      javaCodeLineMatch: '@RabbitListener(queues = "orders.payment")'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: {
        vi: 'Message Queue thông minh, Consumer thụ động',
        en: 'Smart Broker, Dumb Consumer'
      },
      keyMechanism: {
        vi: 'Broker chịu trách nhiệm định tuyến message qua Exchange và xóa message ngay khi nhận Consumer ACK.',
        en: 'Broker orchestrates routing via exchanges and deletes messages immediately once acknowledged.'
      },
      configExample: 'spring.rabbitmq.listener.simple.acknowledge-mode=manual',
      architectureNote: {
        vi: 'Rất mạnh cho tác vụ xử lý hàng đợi công việc linh hoạt, routing phức tạp, microservices RPC.',
        en: 'Optimal for job queues, fine-grained routing, and microservice task pipelines.'
      }
    },
    kafka: {
      role: {
        vi: 'Broker câm, Consumer thông minh',
        en: 'Dumb Broker, Smart Consumer'
      },
      keyMechanism: {
        vi: 'Broker chỉ là Append-only Log phân vùng lưu trên đĩa; Consumer tự lưu vị trí đọc (Offset) và có thể tua lại (Replay).',
        en: 'Broker is an append-only commit log; consumer manages its own offset and can replay past events.'
      },
      configExample: 'spring.kafka.consumer.enable-auto-commit=false',
      architectureNote: {
        vi: 'Throughput hàng triệu msg/giây, lưu trữ sự kiện dài hạn, event-driven streaming phân tán.',
        en: 'Unmatched throughput (millions msg/s), long-term retention, and stream processing.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Triệt tiêu hoàn toàn sự phụ thuộc nghẽn đồng bộ (Temporal Decoupling).',
        en: 'Eliminates cascading synchronous thread-blocking failures.'
      },
      {
        vi: 'Khả năng hấp thụ tải đỉnh (Traffic Smoothing / Peak Shaving) tuyệt đối.',
        en: 'Buffers extreme traffic spikes seamlessly without crashing downstreams.'
      },
      {
        vi: 'Dễ dàng mở rộng Consumer độc lập theo nhu cầu CPU/RAM của từng service.',
        en: 'Enables elastic horizontal scaling of individual consumers based on load.'
      }
    ],
    cons: [
      {
        vi: 'Độ phức tạp kiến trúc tăng: cần quản lý Idempotency, Duplicate Message và Dead Letter Queue.',
        en: 'Increased architectural complexity: requires idempotency handling and DLQs.'
      },
      {
        vi: 'Tính nhất quán dữ liệu trở thành Nhất quán cuối cùng (Eventual Consistency).',
        en: 'Immediate transactional consistency is replaced by eventual consistency.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Trade-off: Giao tiếp trực tiếp cho latency tức thì (1-5ms) nhưng chịu rủi ro sập hệ thống; Message Broker thêm độ trễ queueing nhưng cho phép throughput tăng gấp 100 lần.',
      en: 'Direct calls offer sub-millisecond local latency at the risk of cascading crashes; brokers introduce queueing latency in exchange for 100x higher throughput resilience.'
    },
    orderingGuarantee: {
      vi: 'RabbitMQ bảo đảm thứ tự FIFO trong 1 single queue với 1 consumer; Kafka bảo đảm thứ tự tuần tự tuyệt đối trong phạm vi từng Partition.',
      en: 'RabbitMQ guarantees FIFO per queue under single-consumer scenarios; Kafka guarantees strict ordering per partition.'
    }
  },

  javaCode: `package com.enterprise.messaging.order;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import com.rabbitmq.client.Channel;
import java.io.IOException;

// 1. Enterprise Order DTO
public record OrderEvent(String orderId, String customerId, double amount, long timestamp) {}

// 2. Producer Controller: Asynchronous Non-Blocking Ingestion
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final RabbitTemplate rabbitTemplate;

    public OrderController(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<String> createOrder(@RequestBody OrderRequest req) {
        String orderId = "ORD-" + System.currentTimeMillis();
        OrderEvent event = new OrderEvent(orderId, req.customerId(), req.amount(), System.currentTimeMillis());

        // Fast publish to exchange (< 5ms response, non-blocking)
        rabbitTemplate.convertAndSend("orders.exchange", "order.created", event);

        return org.springframework.http.ResponseEntity.accepted()
                .body("Order accepted for processing: " + orderId);
    }
}

// 3. Consumer Service with Manual Acknowledgment (Zero Message Loss)
@Service
public class PaymentOrderConsumer {

    @RabbitListener(queues = "orders.payment.queue", ackMode = "MANUAL")
    public void processPayment(OrderEvent event,
                               Channel channel,
                               @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        try {
            // Process payment logic (e.g. call Stripe/Bank API)
            System.out.printf("Processing payment for Order: %s, Amount: $%.2f%n",
                    event.orderId(), event.amount());

            // Acknowledge single message processed successfully
            channel.basicAck(deliveryTag, false);
        } catch (Exception ex) {
            // Negative acknowledge and requeue on transient failure
            System.err.println("Payment failed, requeueing: " + ex.getMessage());
            channel.basicNack(deliveryTag, false, true);
        }
    }
}
record OrderRequest(String customerId, double amount) {}`,

  springConfigCode: `# Enterprise Spring Boot application.yml Configuration
spring:
  rabbitmq:
    host: \${RABBITMQ_HOST:localhost}
    port: 5672
    username: \${RABBITMQ_USER:admin}
    password: \${RABBITMQ_PASS:secret}
    publisher-confirm-type: correlated
    publisher-returns: true
    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 50
        concurrency: 4
        max-concurrency: 16`,

  interviewQuestions: [
    {
      question: {
        vi: 'Khi nào nên sử dụng Message Broker truyền thống (RabbitMQ) và khi nào bắt buộc phải dùng Event Streaming (Kafka)?',
        en: 'When should you choose a traditional message broker (RabbitMQ) versus an event streaming platform (Kafka)?'
      },
      answer: {
        vi: 'Chọn RabbitMQ khi: 1. Cần định tuyến message phức tạp (Topic, Fanout, Headers Exchange); 2. Cần quản lý từng message độc lập (ACK/NACK từng phần tử, priority queue); 3. Lưu lượng từ vài ngàn đến vài chục ngàn msg/s; 4. Không cần lưu lại dữ liệu quá khứ. Chọn Kafka khi: 1. Thông lượng cực lớn (> 100.000 msg/s); 2. Cần lưu lại sự kiện dài hạn (Log Retention) để replay hoặc phân tích; 3. Cần bảo toàn thứ tự nghiêm ngặt theo Partition Key; 4. Tích hợp CDC hoặc Stream Processing.',
        en: 'Choose RabbitMQ when you need complex routing (topic/headers exchanges), fine-grained per-message acknowledgments/retries, and lower throughput (< 50k msg/s). Choose Kafka for massive throughput (> 100k msg/s), permanent event retention and replay, partition-ordered event streaming, and stream processing.'
      },
      seniority: 'Senior',
      trapWarning: {
        vi: 'Bẫy phỏng vấn: Đừng trả lời "Kafka luôn nhanh hơn RabbitMQ". Với tải thấp, RabbitMQ có độ trễ (latency) thấp hơn Kafka rất nhiều vì Kafka phải gom batch và fsync.',
        en: 'Interview trap: Avoid claiming "Kafka is always faster". Under lightweight loads, RabbitMQ delivers lower end-to-end latency because Kafka relies on batching buffers.'
      },
      proTip: {
        vi: 'Nêu bật triết lý: "RabbitMQ is a queue for tasks; Kafka is a storage log for events".',
        en: 'Anchor with the architectural motto: "RabbitMQ is a queue for tasks; Kafka is a persistent log for events".'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố sập toàn bộ hệ thống Flash Sale do nghẽn đồng bộ HTTP',
      en: 'Flash Sale Cascading Outage Caused by Synchronous HTTP Chokepoints'
    },
    businessContext: {
      vi: 'Một sàn thương mại điện tử tổ chức đợt Flash Sale 11/11. Lưu lượng đặt hàng tăng từ 1.200 req/s lên 45.000 req/s trong vòng 3 phút.',
      en: 'An e-commerce platform ran an 11.11 Flash Sale. Checkout traffic spiked from 1,200 req/s to 45,000 req/s in under 3 minutes.'
    },
    problemDescription: {
      vi: 'OrderService thiết kế gọi HTTP đồng bộ sang Inventory và Payment. Khi cổng thanh toán đối tác bị chậm (latency từ 50ms tăng lên 2.500ms), toàn bộ 500 thread trong Tomcat Thread Pool của OrderService bị giữ chặt. Hàng ngàn khách hàng sau đó nhận lỗi HTTP 504 Gateway Timeout, website tê liệt.',
      en: 'OrderService made synchronous HTTP calls to Inventory and Payment. When third-party payment gateways slowed to 2,500ms, all 500 Tomcat threads blocked instantly. Subsequent checkouts failed with HTTP 504 Gateway Timeout, bringing the entire site down.'
    },
    whyNaiveFails: {
      vi: 'Giải pháp ngây thơ là tăng số lượng Tomcat threads từ 500 lên 5.000. Hậu quả là CPU quá tải do context switching, bộ nhớ JVM Heap bị cạn kiệt dẫn đến Full GC kéo dài 40 giây và toàn bộ cluster Kubernetes sập liên hoàn.',
      en: 'The naive fix was increasing Tomcat threads to 5,000. This triggered fatal CPU context-switching overhead, exhausted JVM heap, caused 40s Stop-the-World Full GCs, and crashed Kubernetes pods.'
    },
    coreSolution: {
      vi: 'Chuyển đổi hoàn toàn sang kiến trúc Asynchronous Broker Pipeline: OrderService chỉ kiểm tra validation cơ bản rồi publish OrderCreatedEvent vào broker với Publisher Confirm (< 3ms) và trả về HTTP 202 Accepted. Các Worker Consumer phía sau kéo message xử lý theo tốc độ ổn định 2.500 msg/s mà không làm nghẽn hệ thống tiếp nhận.',
      en: 'Refactored to an Asynchronous Broker Pipeline: OrderService performs fast validation, publishes an OrderCreatedEvent to RabbitMQ/Kafka in < 3ms, and returns HTTP 202. Downstream workers process tasks at a steady 2,500 msg/s without overloading backends.'
    },
    productionCode: `// Production Refactored Ingestion: Fast Non-blocking Accepted response
@PostMapping("/checkout")
public CompletableFuture<ResponseEntity<CheckoutResponse>> fastCheckout(@RequestBody CheckoutDto dto) {
    String orderId = idGenerator.nextId();
    return messageBroker.publishAsync("orders.checkout.topic", new CheckoutEvent(orderId, dto))
        .thenApply(confirm -> ResponseEntity.status(HttpStatus.ACCEPTED)
            .body(new CheckoutResponse(orderId, "PENDING_CONFIRMATION", "/api/orders/" + orderId + "/status")))
        .exceptionally(ex -> ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build());
}`,
    architectureImpact: {
      vi: 'Khả năng chịu tải tăng từ 1.200 req/s lên 60.000 req/s ổn định; tỷ lệ lỗi HTTP 5xx giảm từ 42% xuống 0.001%; P99 latency giảm từ 4.200ms xuống 18ms.',
      en: 'Throughput capacity scaled from 1.2k to 60k req/s; 5xx error rates dropped from 42% to 0.001%; P99 latency plunged from 4,200ms to 18ms.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia,
    MESSAGING_RESEARCH_CITATIONS.bytebytego_delivery_semantics
  ]
};
