import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const rabbitmqExchangesRoutingTopic: MessagingTopic = {
  id: 'rabbitmq-exchanges-routing',
  category: 'rabbitmq-broker',
  level: 'core',
  chapter: 'Chương 02 — RabbitMQ Architecture & Routing',
  name: 'RabbitMQ Core Architecture & Exchange Types',
  tagline: {
    vi: 'Phân tích sâu Virtual Host, Connection, Channel, AMQP model và so sánh 4 loại Exchange: Direct, Fanout, Topic, Headers.',
    en: 'Deep dive into Virtual Hosts, Connections, Channels, AMQP model, and the 4 Exchange types: Direct, Fanout, Topic, Headers.'
  },
  difficulty: 2,
  order: 4,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Trong kiến trúc hướng thông điệp, Producer không nên biết đích danh Queue nào đang nhận dữ liệu (Loose Coupling). Nếu Producer gửi trực tiếp vào tên Queue cố định, mọi thay đổi cấu trúc của người nhận (như thêm worker phân tích, audit log, thông báo SMS) sẽ buộc Producer phải sửa code và deploy lại.',
      en: 'Producers should never be tightly coupled to destination Queue names. Hardcoding queue destinations forces producers to undergo code changes and redeployments whenever consumers add audit, analytics, or SMS notification workers.'
    },
    hardwareConstraint: {
      vi: 'Mỗi kết nối TCP (Connection) tiêu tốn 1 file descriptor của hệ điều hành, chiếm từ 100KB đến hàng MB bộ nhớ RAM và yêu cầu bắt tay TCP 3-way handshake. Việc mở quá nhiều kết nối TCP độc lập sẽ nhanh chóng làm cạn kiệt tài nguyên mạng của broker.',
      en: 'Each TCP Connection consumes an OS file descriptor, memory buffers, and requires a 3-way handshake. Creating discrete TCP sockets per thread rapidly exhausts operating system socket limits.'
    },
    fundamentalSolution: {
      vi: 'RabbitMQ triển khai chuẩn AMQP 0-9-1 với hai giải pháp cốt lõi: 1. Ghép kênh (Channel Multiplexing): Hàng ngàn Channel logic nhẹ (Lightweight Virtual Connections) chạy chung trên 1 kết nối TCP vật lý duy nhất; 2. Tách biệt Exchange và Queue qua Binding: Producer chỉ gửi vào Exchange kèm Routing Key. Exchange dùng thuật toán so khớp để nhân bản và điều hướng message vào các Queue tương ứng.',
      en: 'RabbitMQ leverages AMQP 0-9-1 architecture: 1. Channel Multiplexing: Thousands of lightweight virtual channels share a single physical TCP connection; 2. Exchange-Queue Decoupling via Bindings: Producers emit only to Exchanges with routing keys; exchanges route messages into matched queues.'
    },
    math: {
      formula: 'R_{\\text{match}}(K_{\\text{routing}}, P_{\\text{binding}}) \\implies \\{Q_1, Q_2, \\dots, Q_m\\}',
      timeComplexity: 'O(1) Direct/Fanout · O(B) Topic Pattern Matching',
      spaceComplexity: 'O(B) — B là số lượng binding keys',
      throughputFormula: '\\text{Throughput}_{fanout} \\ge \\text{Throughput}_{direct} > \\text{Throughput}_{topic} \\quad \\text{(do chi phí regex matching)}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'RabbitMQ là một Message Broker theo mô hình "Smart Broker, Dumb Consumer". Trái tim của cơ chế định tuyến là 4 loại Exchange: Direct, Fanout, Topic và Headers, kết hợp với Virtual Host để phân vùng tài nguyên multi-tenancy.',
      en: 'RabbitMQ follows the "Smart Broker, Dumb Consumer" philosophy. The core routing engine features 4 Exchange archetypes: Direct, Fanout, Topic, and Headers, combined with Virtual Hosts for isolated multi-tenancy.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Direct Exchange: Định tuyến chính xác tuyệt đối (Exact Match). Message chỉ được chuyển vào Queue khi Routing Key gửi lên trùng khớp 100% với Binding Key của Queue đó (ví dụ: payment.created -> payment.created).',
        en: 'Direct Exchange: Exact match routing. A message routes into a queue if and only if the message routing key matches the queue binding key with 100% string equality.'
      },
      {
        vi: 'Fanout Exchange: Bỏ qua hoàn toàn Routing Key, broadcast (phát tán) bản tin đến TẤT CẢ các queue đang bind vào exchange này. Tốc độ cao nhất vì không cần so khớp chuỗi (O(1)).',
        en: 'Fanout Exchange: Ignores routing keys entirely and broadcasts copies to ALL bound queues. Delivers peak throughput due to zero string-matching overhead.'
      },
      {
        vi: 'Topic Exchange: Định tuyến theo mẫu ký tự đại diện (Pattern Matching). Các từ phân cách nhau bởi dấu chấm "." (ví dụ: eu.orders.payment). Ký tự "*" đại diện cho đúng 1 từ; ký tự "#" đại diện cho 0 hoặc nhiều từ. Ví dụ: *.orders.* hoặc orders.#.',
        en: 'Topic Exchange: Wildcard pattern matching across dot-delimited tokens. The asterisk (*) matches exactly one word; the hash (#) matches zero or more words.'
      },
      {
        vi: 'Default Exchange (Nameless): Mọi queue mới tạo tự động được bind vào Default Exchange với binding key bằng chính tên của Queue đó.',
        en: 'Default (Nameless) Exchange: Every created queue is automatically bound to this direct exchange with a binding key identical to the queue name.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Rò rỉ Channel (Channel Leak): Mở Channel mới trong mỗi request mà không đóng lại (hoặc không dùng Spring CachingConnectionFactory) sẽ làm broker cạn kiệt RAM Erlang process và bị crash.',
        en: 'Channel Leaks: Creating new channels per HTTP request without closing them exhausts RabbitMQ Erlang process memory, leading to broker freeze.'
      },
      {
        vi: 'Unrouted Messages: Nếu message gửi vào Exchange mà không khớp với bất kỳ Queue nào, message sẽ bị hủy âm thầm (Silently Dropped) trừ khi Producer bật cờ mandatory=true và lắng nghe ReturnListener hoặc cấu hình Alternate Exchange.',
        en: 'Silent Message Drops: Messages sent with no matching binding keys are silently discarded unless producers configure the mandatory flag and ReturnListener or Alternate Exchanges.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cấu trúc Ghép kênh Channel & Luồng Định tuyến Exchange -> Queue',
      en: 'AMQP Channel Multiplexing & Exchange-to-Queue Routing Flow'
    },
    description: {
      vi: 'Sơ đồ thể hiện kết nối TCP vật lý được phân kênh thành nhiều Channel và cách 4 loại Exchange phân phối bản tin.',
      en: 'Topological diagram showing multiplexed AMQP channels over a single socket and Exchange-to-Queue binding mechanics.'
    },
    asciiDiagram: `
[CLIENT APP]                                            [RABBITMQ BROKER]
Thread 1 ---> [ Channel 1 ] \\
Thread 2 ---> [ Channel 2 ] ===(Single TCP Port 5672)===> [ Virtual Host: /production ]
Thread 3 ---> [ Channel 3 ] /                                    |
                                                      [ EXCHANGES ENGINE ]
                                                      /        |         \\
                             (Direct: "order.pay")  /          |           \\ (Topic: "order.*")
                                                   v           v             v
                                              [Queue A]    [Queue B]     [Queue C]
                                                  |            |             |
                                            (Consumer 1)  (Consumer 2)  (Consumer 3)
`,
    components: [
      {
        name: 'Virtual Host (vhost)',
        role: 'Isolated Namespace',
        description: {
          vi: 'Phân chia không gian làm việc (giống như database riêng biệt), có user permissions riêng.',
          en: 'Logical container providing multi-tenant isolation for exchanges, queues, and permissions.'
        }
      },
      {
        name: 'Binding',
        role: 'Routing Link',
        description: {
          vi: 'Mối quan hệ nối giữa Exchange và Queue, kèm theo Binding Key quy định điều kiện nhận message.',
          en: 'The directional link binding an exchange to a queue configured with a binding key rule.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Producer gửi message kèm Routing Key', en: 'Producer publishes with routing key' },
      phase: 'Publish via Channel',
      description: {
        vi: 'Producer dùng Channel gửi message vào "app.orders" kèm routing key "orders.apac.created".',
        en: 'Producer sends message payload to "app.orders" exchange with key "orders.apac.created".'
      },
      brokerBehavior: {
        vi: 'Broker kiểm tra tính hợp lệ của Channel và nhận gói tin vào RAM socket buffer.',
        en: 'Broker verifies channel credentials and buffers packet in RAM.'
      },
      javaCodeLineMatch: 'rabbitTemplate.convertAndSend("app.orders", "orders.apac.created", payload);'
    },
    {
      id: 'step-1',
      title: { vi: 'Exchange so khớp Binding Keys', en: 'Exchange matches binding keys' },
      phase: 'Routing Resolution',
      description: {
        vi: 'Exchange duyệt qua bảng định tuyến nội bộ: Queue 1 (orders.#) khớp; Queue 2 (*.apac.*) khớp; Queue 3 (billing.direct) không khớp.',
        en: 'Exchange inspects internal routing table: Queue 1 & 2 match; Queue 3 is skipped.'
      },
      brokerBehavior: {
        vi: 'Sao chép bản tin nhị phân và đẩy vào Queue 1 và Queue 2.',
        en: 'Broker clones message pointers into matched queues without duplicating disk data.'
      },
      javaCodeLineMatch: 'BindingBuilder.bind(queue).to(exchange).with("orders.#");'
    },
    {
      id: 'step-2',
      title: { vi: 'Queue lưu trữ và đẩy đến Consumer', en: 'Queue stores and pushes to consumer' },
      phase: 'Delivery to Consumer',
      description: {
        vi: 'Message nằm trong Queue được đẩy (Push-based) qua socket TCP của Consumer tương ứng.',
        en: 'Messages in queues are pushed over established consumer channels.'
      },
      brokerBehavior: {
        vi: 'Đánh dấu message là Unacknowledged và chờ tín hiệu xác nhận.',
        en: 'Broker transitions message state to Unacknowledged pending basicAck.'
      },
      javaCodeLineMatch: '@RabbitListener(queues = "orders.processing")'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Định tuyến linh hoạt tại broker', en: 'Flexible broker-side routing' },
      keyMechanism: {
        vi: 'Exchange phân phối message đến nhiều Queue độc lập theo pattern matching mạnh mẽ.',
        en: 'Exchanges intelligently evaluate routing rules, decoupling producers from queue structures.'
      },
      configExample: 'TopicExchange exchange = new TopicExchange("notifications.topic");',
      architectureNote: {
        vi: 'Hỗ trợ Alternate Exchange hứng toàn bộ message không khớp binding key.',
        en: 'Supports Alternate Exchanges to catch unroutable messages safely.'
      }
    },
    kafka: {
      role: { vi: 'Định tuyến tại Producer client', en: 'Client-side partitioning' },
      keyMechanism: {
        vi: 'Kafka không có khái niệm Exchange. Producer tự băm (hash) partition key để quyết định gửi vào partition nào.',
        en: 'Kafka lacks exchanges; producers hash partition keys locally to target specific partitions.'
      },
      configExample: 'producer.send(new ProducerRecord<>("orders-topic", orderId, payload));',
      architectureNote: {
        vi: 'Giảm tải xử lý cho Broker, đẩy toàn bộ việc tính toán partition về cho client.',
        en: 'Offloads routing compute from broker to client CPU.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Mô hình kiến trúc tách biệt tuyệt đối: Producer và Consumer không cần biết sự tồn tại của nhau.',
        en: 'Absolute producer-consumer decoupling via dynamic exchange bindings.'
      },
      {
        vi: 'Topic Exchange cực kỳ linh hoạt cho các hệ thống thông báo đa kênh (Email, SMS, Push Notification).',
        en: 'Topic exchanges provide unprecedented flexibility for multi-channel notification routing.'
      }
    ],
    cons: [
      {
        vi: 'Topic Exchange với hàng ngàn wildcard binding phức tạp sẽ làm tăng CPU overhead của broker.',
        en: 'Thousands of complex wildcard topic bindings degrade broker routing performance.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Fanout và Direct Exchange có throughput cao nhất; Topic Exchange có latency định tuyến cao hơn ~15%.',
      en: 'Fanout and Direct achieve maximum broker throughput; Topic adds ~15% regex routing latency.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm thứ tự FIFO nghiêm ngặt khi chỉ có 1 Consumer trên 1 Queue; nếu có nhiều Competing Consumers, thứ tự xử lý thực tế có thể bị thay đổi.',
      en: 'Strict FIFO per queue under single consumer; competing consumers process messages out of order.'
    }
  },

  javaCode: `package com.enterprise.messaging.rabbitmq;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqRoutingConfig {

    public static final String TOPIC_EXCHANGE = "enterprise.notifications.topic";
    public static final String EMAIL_QUEUE = "notifications.email.queue";
    public static final String SMS_QUEUE = "notifications.sms.queue";
    public static final String AUDIT_QUEUE = "notifications.audit.queue";

    // 1. Declare Topic Exchange
    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(TOPIC_EXCHANGE, true, false);
    }

    // 2. Declare Queues
    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE).build();
    }

    @Bean
    public Queue smsQueue() {
        return QueueBuilder.durable(SMS_QUEUE).build();
    }

    @Bean
    public Queue auditQueue() {
        return QueueBuilder.durable(AUDIT_QUEUE).build();
    }

    // 3. Define Bindings with Wildcard Patterns
    // Email queue receives all email notifications: "*.email.*"
    @Bean
    public Binding emailBinding(Queue emailQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(emailQueue).to(notificationExchange).with("*.email.*");
    }

    // SMS queue receives urgent SMS alerts: "urgent.sms.#"
    @Bean
    public Binding smsBinding(Queue smsQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(smsQueue).to(notificationExchange).with("urgent.sms.#");
    }

    // Audit queue captures ALL notifications: "#"
    @Bean
    public Binding auditBinding(Queue auditQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(auditQueue).to(notificationExchange).with("#");
    }
}`,

  springConfigCode: `spring:
  rabbitmq:
    template:
      mandatory: true # Trigger ReturnCallback if message is unroutable
    publisher-returns: true`,

  interviewQuestions: [
    {
      question: {
        vi: 'Phân biệt sự khác nhau giữa ký tự "*" và ký tự "#" trong Binding Key của RabbitMQ Topic Exchange?',
        en: 'Explain the difference between the "*" and "#" wildcard characters in RabbitMQ Topic Exchange binding keys.'
      },
      answer: {
        vi: 'Trong RabbitMQ Topic Exchange, các từ được phân tách nhau bằng dấu chấm (ví dụ: "asia.order.create"). Ký tự "*" thay thế cho CHÍNH XÁC MỘT TỪ (Single Word). Ký tự "#" thay thế cho KHÔNG HOẶC NHIỀU TỪ (Zero or More Words). Ví dụ: "*.stock" chỉ khớp "vn.stock" (không khớp "hn.vn.stock"); còn "#.stock" khớp cả "stock", "vn.stock" và "hn.vn.stock".',
        en: 'Tokens are dot-delimited words. Asterisk (*) matches EXACTLY ONE word. Hash (#) matches ZERO OR MORE words. For example, "*.stock" matches "ny.stock" but not "us.ny.stock". Conversely, "#.stock" matches "stock", "ny.stock", and "us.ny.stock".'
      },
      seniority: 'Mid'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố mất toàn bộ thông báo khẩn cấp do gửi nhầm Routing Key trên Direct Exchange',
      en: 'Silent Loss of Critical Emergency Alerts Due to Direct Exchange Misconfiguration'
    },
    businessContext: {
      vi: 'Một ứng dụng ngân hàng gửi tin nhắn mã OTP và cảnh báo giao dịch gian lận (Fraud Alert) cho khách hàng.',
      en: 'A digital bank dispatched mission-critical OTPs and fraud alerts via RabbitMQ.'
    },
    problemDescription: {
      vi: 'Hệ thống dùng Direct Exchange. Khi đội ngũ nghiệp vụ phát hành loại tin nhắn mới "auth.otp.sms", không có Queue nào bind với key này. Do không bật mandatory=true và không có Alternate Exchange, RabbitMQ âm thầm drop hơn 80.000 mã OTP của người dùng, khiến không ai đăng nhập được vào ứng dụng.',
      en: 'The system used Direct Exchanges. A new alert type "auth.otp.sms" was introduced without updating queue bindings. With mandatory=false and no Alternate Exchange, RabbitMQ dropped 80,000 OTP messages silently, locking users out.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư tạo tạm 1 queue hứng cứng. Nhưng khi lại có dịch vụ mới, sự cố tương tự lại tái diễn do kiến trúc Direct Exchange không có cơ chế hứng lỗi dự phòng.',
      en: 'Engineers hardcoded a temporary queue, but subsequent feature releases repeated the outage due to direct exchange rigidness.'
    },
    coreSolution: {
      vi: '1. Chuyển sang Topic Exchange với mô hình phân cấp domain "auth.#"; 2. Cấu hình Alternate Exchange (AE) tên "unrouted.exchange" gắn vào exchange chính. Bất kỳ bản tin nào không khớp binding key sẽ tự động rơi vào unrouted.exchange để đội SRE nhận cảnh báo qua Slack/PagerDuty.',
      en: '1. Migrated to Topic Exchange with domain hierarchy "auth.#"; 2. Configured an Alternate Exchange (AE) named "unrouted.exchange". Any message that misses all bindings is automatically captured by the AE for SRE alerting.'
    },
    productionCode: `@Bean
public TopicExchange mainExchange() {
    return ExchangeBuilder.topicExchange("main.alerts")
        .withArgument("alternate-exchange", "unrouted.dead-end")
        .durable(true)
        .build();
}`,
    architectureImpact: {
      vi: 'Tỷ lệ thất lạc tin nhắn chưa định tuyến giảm về 0%; đội ngũ SRE phát hiện ngay lập tức các routing key bị gõ sai chính tả.',
      en: 'Zero silent message losses; instant SRE detection of misspelled routing keys and missing bindings.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia,
    MESSAGING_RESEARCH_CITATIONS.rabbitmq_prefetch_qos
  ]
};
