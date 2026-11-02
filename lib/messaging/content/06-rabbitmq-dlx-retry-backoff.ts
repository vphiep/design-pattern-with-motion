import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const rabbitmqDlxRetryBackoffTopic: MessagingTopic = {
  id: 'rabbitmq-dlx-retry-backoff',
  category: 'rabbitmq-broker',
  level: 'core',
  chapter: 'Chương 02 — RabbitMQ Architecture & Routing',
  name: 'Dead Letter Exchange, Retry & Message Expiration',
  tagline: {
    vi: 'Thiết kế chiến lược Dead Letter Exchange (DLX), Hàng đợi chết (DLQ), TTL, Thử lại lũy thừa (Exponential Backoff) và chặn Poison Message.',
    en: 'Designing Dead Letter Exchanges (DLX), DLQs, TTL expiration, Exponential Backoff retry queues, and poison message containment.'
  },
  difficulty: 2,
  order: 6,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      vi: 'Khi một message bị lỗi do định dạng sai (Malformed JSON) hoặc dịch vụ bên thứ ba tạm ngừng hoạt động, nếu Consumer liên tục gọi basicNack(requeue=true), message đó sẽ ngay lập tức được đẩy lại vào đầu Queue để xử lý lại trong vòng 1 miligiây. Vòng lặp thử lại vô hạn này (Infinite Retry Storm) đốt cháy 100% CPU của broker và worker, đồng thời chặn đứng toàn bộ các message bình thường phía sau.',
      en: 'When a message fails due to malformed payloads (poison message) or transient downstream outages, calling basicNack(requeue=true) immediately re-inserts it at the queue head within 1ms. This infinite retry storm consumes 100% CPU and blocks all subsequent legitimate messages in the queue.'
    },
    hardwareConstraint: {
      vi: 'Tần suất thử lại không kiểm soát làm kiệt quệ IOPS của đĩa và băng thông mạng. Nếu 10.000 message lỗi được retry 1.000 lần/giây, hệ thống phải xử lý 10.000.000 thao tác ghi/đọc thừa vô ích mỗi giây.',
      en: 'Uncontrolled retry storms destroy disk IOPS and network bandwidth. Retrying 10k failed messages 1,000 times/second forces 10,000,000 futile read/write operations per second.'
    },
    fundamentalSolution: {
      vi: 'Xây dựng kiến trúc 3 tầng: Main Queue -> Retry Queues (kèm Message TTL và Exponential Backoff) -> Dead Letter Exchange (DLX) & Dead Letter Queue (DLQ). Khi message lỗi, nó được đẩy sang Retry Queue với thời gian chờ T_n = min(T_max, T_0 * 2^n). Khi hết TTL, RabbitMQ tự động đẩy lại Main Queue. Nếu vượt quá số lần thử lại tối đa (Max Retries = 3), message được cách ly vĩnh viễn vào DLQ để kỹ sư kiểm tra thủ công.',
      en: 'Construct a 3-tier failure architecture: Main Queue -> Retry Queues (configured with TTL and Exponential Backoff) -> Dead Letter Exchange (DLX) & Dead Letter Queue (DLQ). Failed messages route to retry queues where TTL enforces exponential delay T_n = min(T_max, T_0 * 2^n). After max retries, poison payloads are quarantined in DLQs for SRE investigation.'
    },
    math: {
      formula: 'T_n = \\min(T_{max}, T_0 \\times 2^n) \\quad \\text{kèm Jitter: } T_{\\text{actual}} = T_n \\times (1 + \\text{random}(-0.1, 0.1))',
      timeComplexity: 'O(1) dead-letter routing',
      spaceComplexity: 'O(D) — D là số message trong DLQ',
      throughputFormula: '\\text{Storm Factor} = \\sum_{i=1}^{R} \\frac{1}{T_i} \\quad (T_i \\text{ càng lớn, áp lực CPU càng giảm})'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Dead Lettering là cơ chế an toàn số 1 của RabbitMQ. Một bản tin được coi là "Dead Letter" và bị tống sang DLX khi xảy ra 1 trong 3 trường hợp: 1. Consumer gọi basicReject hoặc basicNack với requeue=false; 2. Message bị hết hạn TTL (Time-To-Live); 3. Queue bị đầy và chạm ngưỡng x-max-length.',
      en: 'Dead Lettering is RabbitMQ’s primary safety circuit. A message becomes dead-lettered and routed to a DLX under 3 conditions: 1. Consumer issues basicReject/basicNack with requeue=false; 2. Message TTL expires; 3. Queue reaches capacity threshold (x-max-length).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Delayed Retry qua TTL & DLX routing: Vì RabbitMQ thuần túy không có bộ đếm delay timer native, các kỹ sư tạo ra hàng loạt Retry Queues với TTL tăng dần (ví dụ: retry.5s, retry.30s, retry.120s). Mỗi queue này được cấu hình argument x-dead-letter-exchange trỏ ngược lại exchange chính. Khi message nằm trong retry.5s hết 5 giây, RabbitMQ tự động dead-letter nó quay trở lại Main Queue để thử lại!',
        en: 'Delayed Retries via TTL & DLX: Native RabbitMQ lacks timers, so engineers build multi-tier retry queues with escalating TTLs (retry.5s, retry.30s, retry.120s) pointing their x-dead-letter-exchange back to the main exchange. When 5 seconds expire, RabbitMQ dead-letters the message back into the main queue for re-execution!'
      },
      {
        vi: 'Poison Message & X-Death Header: Mỗi khi một message bị dead-letter, RabbitMQ tự động tiêm thêm một mảng header tên là "x-death". Header này ghi nhận lịch sử chi tiết: lý do chết (expired, rejected), queue gốc và số lần chết (count). Consumer đọc x-death header để biết message đã được thử lại bao nhiêu lần.',
        en: 'Poison Messages & the x-death Header: Upon dead-lettering, RabbitMQ injects an "x-death" array into the message headers, capturing root cause, originating queue, and retry count. Consumer logic inspects x-death to enforce max-retry limits.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Vòng lặp Dead Letter lẩn quẩn (DLX Loops): Cấu hình Queue A dead-letter sang Queue B, rồi Queue B lại dead-letter sang Queue A với cùng routing key mà không có điều kiện dừng, dẫn đến message bay qua bay lại vô tận làm nghẽn broker.',
        en: 'DLX Cyclic Loops: Configuring Queue A to dead-letter into Queue B, and Queue B back into Queue A without terminal max-retry conditions traps messages in endless infinite loops.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Mô hình Hàng đợi Thử lại Lũy thừa (Exponential Backoff) & Cách ly DLQ',
      en: '3-Tier Exponential Backoff Retry Pipeline & DLQ Quarantine'
    },
    description: {
      vi: 'Sơ đồ luồng di chuyển của message lỗi qua các hàng đợi chờ TTL trước khi bị đẩy vào Dead Letter Queue vĩnh viễn.',
      en: 'Architectural schematic tracing failed message flow through graduated TTL delay queues into quarantine DLQ.'
    },
    asciiDiagram: `
[MAIN WORK QUEUE] <===================================+ (TTL Expired: Re-injected!)
      |                                               |
      +---> [Consumer Execution]                      |
                 |                                    |
            (Throws Error!)                           |
                 |                                    |
      [basicNack(requeue=false)]                      |
                 |                                    |
                 v                                    |
      [RETRY DELAY QUEUE: 5s TTL] --------------------+
      (x-dead-letter-exchange: "main.exchange")
                 |
      (Fails Again 3x... Max Retries Exceeded!)
                 |
                 v
      [DEAD LETTER EXCHANGE (DLX)]
                 |
                 v
      [DEAD LETTER QUEUE (DLQ)] ---> SRE Alert / Manual Triage Dashboard
`,
    components: [
      {
        name: 'Retry Queue (with TTL)',
        role: 'Temporary Holding Pen',
        description: {
          vi: 'Hàng đợi không có consumer nào lắng nghe, message nằm đợi hết TTL rồi tự động dead-letter quay lại.',
          en: 'Unconsumed queue holding messages until TTL expiry triggers automated dead-letter re-routing.'
        }
      },
      {
        name: 'Dead Letter Queue (DLQ)',
        role: 'Permanent Quarantine',
        description: {
          vi: 'Nơi lưu trữ các message độc hại (Poison Messages) để bảo vệ hệ thống không bị crash lặp lại.',
          en: 'Quarantine store preserving poison payloads for developer inspection and manual replay.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Consumer xử lý thất bại (Tạm thời hoặc Vĩnh viễn)', en: 'Consumer execution failure' },
      phase: 'Error Detection',
      description: {
        vi: 'Consumer gọi API ngân hàng bị lỗi 503 Service Unavailable, ném RetryableException.',
        en: 'Consumer encounters downstream 503 error, catching RetryableException.'
      },
      brokerBehavior: {
        vi: 'Message vẫn đang ở trạng thái Unacknowledged trên Main Queue.',
        en: 'Message remains Unacknowledged on Main Queue.'
      },
      javaCodeLineMatch: 'channel.basicNack(deliveryTag, false, false);'
    },
    {
      id: 'step-1',
      title: { vi: 'Điều hướng sang Retry Queue với TTL 5 giây', en: 'Route to Retry Queue with 5s TTL' },
      phase: 'Delay Parking',
      description: {
        vi: 'Do requeue=false và Main Queue có cấu hình x-dead-letter-exchange trỏ sang retry-exchange, message bay sang retry.5s.',
        en: 'With requeue=false and DLX configured, broker routes message to 5-second TTL retry holding queue.'
      },
      brokerBehavior: {
        vi: 'Message nằm yên trong RAM/Disk của retry queue, không tiêu tốn CPU xử lý.',
        en: 'Message rests dormant in retry queue without burning consumer CPU cycles.'
      },
      javaCodeLineMatch: 'rabbitTemplate.convertAndSend("orders.retry.exchange", "retry.5s", event);'
    },
    {
      id: 'step-2',
      title: { vi: 'TTL hết hạn -> Tự động quay lại Main Queue', en: 'TTL expires -> Auto re-injected' },
      phase: 'Backoff Re-dispatch',
      description: {
        vi: 'Sau 5.000ms, RabbitMQ phát hiện message hết hạn TTL. DLX của retry queue tự động đẩy nó quay lại Main Queue.',
        en: 'At 5,000ms, RabbitMQ detects TTL expiration, dead-lettering payload back into Main Queue.'
      },
      brokerBehavior: {
        vi: 'Header x-death tăng biến count lên 1. Consumer nhận lại message và thử xử lý lần 2.',
        en: 'Header x-death counter increments to 1; consumer retries execution.'
      },
      javaCodeLineMatch: '@Header(name = "x-death", required = false) List<Map<String, ?>> xDeath'
    },
    {
      id: 'step-3',
      title: { vi: 'Vượt quá Max Retries -> Cách ly vào DLQ', en: 'Exceeded Max Retries -> Quarantine to DLQ' },
      phase: 'Terminal Quarantine',
      description: {
        vi: 'Nếu thử lại 3 lần vẫn thất bại, consumer gửi message vào Dead Letter Queue vĩnh viễn và bắn alert Slack.',
        en: 'After 3 failed retry cycles, payload is permanently quarantined in DLQ with alerts emitted.'
      },
      brokerBehavior: {
        vi: 'Message nằm an toàn trong DLQ, Main Queue thông thoáng 100%.',
        en: 'Message safely isolated in DLQ; Main Queue completely unclogged.'
      },
      javaCodeLineMatch: 'rabbitTemplate.convertAndSend("orders.dlx.exchange", "orders.dlq", event);'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Điều phối DLX qua Header và TTL linh hoạt', en: 'Granular DLX via TTL & Headers' },
      keyMechanism: {
        vi: 'RabbitMQ hỗ trợ native tham số x-dead-letter-exchange và x-message-ttl trên từng queue.',
        en: 'Supports native queue arguments x-dead-letter-exchange and x-message-ttl out of the box.'
      },
      configExample: 'QueueBuilder.durable("main").deadLetterExchange("dlx.exchange").build();',
      architectureNote: {
        vi: 'Có plugin rabbitmq_delayed_message_exchange hỗ trợ delay chính xác mà không cần tạo nhiều queue.',
        en: 'rabbitmq_delayed_message_exchange plugin enables arbitrary millisecond delay routing.'
      }
    },
    kafka: {
      role: { vi: 'Dead Letter Topic (DLT) qua Consumer Logic', en: 'Consumer-driven Dead Letter Topics' },
      keyMechanism: {
        vi: 'Kafka không tự dead-letter ở broker. Consumer Spring Kafka dùng SeekToCurrentErrorHandler / DefaultErrorHandler để tự produce sang topic -dlt.',
        en: 'Kafka brokers do not dead-letter; client-side consumer error handlers produce to topic.DLT explicitly.'
      },
      configExample: 'new DeadLetterPublishingRecoverer(kafkaTemplate);',
      architectureNote: {
        vi: 'Thường kết hợp chuỗi topic: orders -> orders-retry-5s -> orders-retry-30s -> orders-dlt.',
        en: 'Architected via discrete topic chains: orders -> orders-retry -> orders-dlt.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Bảo vệ hệ thống 100% khỏi hiện tượng Poison Message gây sập worker liên tục.',
        en: '100% immune to poison message crashes and cascade retry storms.'
      },
      {
        vi: 'Tự động phục hồi khi các dịch vụ bên thứ ba bị gián đoạn mạng tạm thời.',
        en: 'Automated self-healing during transient downstream API network glitches.'
      }
    ],
    cons: [
      {
        vi: 'Cần duy trì nhiều queue phụ (retry queues, DLQ) làm tăng số lượng cấu hình trên broker.',
        en: 'Multiplies queue topology complexity with retry queues and dead-letter exchanges.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Exponential Backoff giúp giảm 99% tải CPU lãng phí so với immediate retry, giải phóng tài nguyên cho message khác.',
      en: 'Exponential backoff eliminates 99% of wasted CPU cycles, protecting cluster throughput.'
    },
    orderingGuarantee: {
      vi: 'Message bị đưa vào retry queue sẽ mất thứ tự so với các message mới hơn trong main queue.',
      en: 'Retried messages lose relative ordering with respect to newer main queue messages.'
    }
  },

  javaCode: `package com.enterprise.messaging.dlq;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqDlxRetryTopologyConfig {

    public static final String MAIN_QUEUE = "orders.main.queue";
    public static final String RETRY_QUEUE_5S = "orders.retry.5s.queue";
    public static final String DLQ = "orders.dead-letter.queue";

    public static final String DLX_EXCHANGE = "orders.dlx.exchange";
    public static final String MAIN_EXCHANGE = "orders.main.exchange";

    // 1. Dead Letter Exchange (DLX)
    @Bean
    public DirectExchange dlxExchange() {
        return new DirectExchange(DLX_EXCHANGE, true, false);
    }

    // 2. Dead Letter Queue (DLQ) - Permanent quarantine
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(dlxExchange()).with("orders.dlq");
    }

    // 3. Main Queue with DLX configuration
    @Bean
    public Queue mainQueue() {
        return QueueBuilder.durable(MAIN_QUEUE)
            // When rejected with requeue=false, route to DLX
            .deadLetterExchange(DLX_EXCHANGE)
            .deadLetterRoutingKey("orders.retry.5s")
            .build();
    }

    // 4. Retry Queue with 5000ms TTL
    @Bean
    public Queue retry5sQueue() {
        return QueueBuilder.durable(RETRY_QUEUE_5S)
            .ttl(5000) // 5 seconds exponential delay
            // When 5s expires, dead-letter BACK to Main Exchange!
            .deadLetterExchange(MAIN_EXCHANGE)
            .deadLetterRoutingKey("orders.main")
            .build();
    }
}`,

  springConfigCode: `spring:
  rabbitmq:
    listener:
      simple:
        default-requeue-rejected: false # Send rejected messages straight to DLX`,

  interviewQuestions: [
    {
      question: {
        vi: 'Poison Message là gì? Nếu không có Dead Letter Queue, Poison Message sẽ gây hậu quả gì?',
        en: 'What is a Poison Message? What happens to a system if a Dead Letter Queue is absent?'
      },
      answer: {
        vi: 'Poison Message (Bản tin độc hại) là message bị lỗi không thể phục hồi (ví dụ: Payload hỏng cú pháp JSON, thiếu trường bắt buộc, chia cho số 0, hoặc vi phạm khóa ngoại DB). Nếu không có DLQ và consumer nack với requeue=true, message này sẽ được broker đẩy lại ngay lập tức, consumer lại bị crash, tạo thành vòng lặp vô tận (Infinite CrashLoop). Hậu quả: 100% CPU bị đốt cháy, log server phình to hàng chục GB và toàn bộ message hợp lệ phía sau bị phong tỏa vĩnh viễn.',
        en: 'A Poison Message is an intrinsically unprocessable payload (malformed JSON, null pointers, schema violations). Without a DLQ, rejecting with requeue=true causes instant continuous redelivery. The consumer crashes in an infinite loop, CPU spikes to 100%, disk fills with gigabytes of error logs, and all valid subsequent messages are starved indefinitely.'
      },
      seniority: 'Senior'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sập hệ thống thanh toán do Poison Message kích hoạt Retry Storm 400.000 req/s',
      en: 'Payment Gateway Outage Triggered by Poison Message Infinite Retry Storm'
    },
    businessContext: {
      vi: 'Hệ thống xử lý thanh toán hóa đơn của một công ty viễn thông phục vụ 10 triệu thuê bao di động.',
      en: 'A telecom billing backend processing monthly mobile invoice collections for 10 million subscribers.'
    },
    problemDescription: {
      vi: 'Một đối tác thanh toán gửi lên 1 message có trường Amount mang giá trị âm ("amount": -500). Code Java bị ném IllegalArgumentException. Do cấu hình default-requeue-rejected=true, RabbitMQ lập tức nhét message đó lại đầu queue. Trong 1 giây, message này được 20 worker nack và retry hơn 18.000 lần. Sau 10 phút, CPU của cụm RabbitMQ chạm 100%, nhiệt độ máy chủ tăng vọt, các kết nối TCP bị ngắt hàng loạt.',
      en: 'A partner emitted an invoice with a negative amount ("amount": -500). The Java handler threw IllegalArgumentException. With default-requeue-rejected=true, the broker pushed it back immediately. 20 workers nacked and retried it 18,000 times/sec. Within 10 minutes, RabbitMQ CPU pinned at 100%, dropping all client TCP sockets.'
    },
    whyNaiveFails: {
      vi: 'Nhóm trực vận hành restart lại các consumer pod, nhưng message độc hại vẫn nằm nguyên ở đầu queue, khiến các pod mới vừa bật lên lại sập tiếp trong 2 giây.',
      en: 'Ops team rebooted consumer pods, but the poison message remained at queue head, instantly crashing new pods within 2 seconds of startup.'
    },
    coreSolution: {
      vi: '1. Cấu hình default-requeue-rejected=false; 2. Thiết lập DLX và DLQ riêng biệt; 3. Sử dụng Spring RabbitMQ ConditionalExceptionLogger & FatalExceptionStrategy: Nếu gặp lỗi nghiệp vụ nghiêm trọng (như IllegalArgumentException, Jackson DeserializationException), lập tức gọi basicReject(requeue=false) tống thẳng vào DLQ mà không retry.',
      en: '1. Configured default-requeue-rejected=false; 2. Provisioned an isolated DLX/DLQ; 3. Enforced FatalExceptionStrategy: non-transient exceptions (deserialization, illegal arguments) trigger immediate basicReject(requeue=false) directly to DLQ.'
    },
    productionCode: `@Bean
public FatalExceptionStrategy customFatalExceptionStrategy() {
    return new ConditionalExceptionLogger() {
        @Override
        public boolean isFatal(Throwable t) {
            // Poison payloads bypass retry completely and route to DLQ
            return t.getCause() instanceof IllegalArgumentException
                || t.getCause() instanceof JsonParseException;
        }
    };
}`,
    architectureImpact: {
      vi: 'Triệt tiêu 100% nguy cơ Retry Storm; CPU của cụm broker duy trì ổn định dưới 18%; các message lỗi được cô lập để dev phân tích nguyên nhân gốc rễ (Root Cause Analysis).',
      en: 'Zero retry storms; broker CPU remained below 18%; poison payloads quarantined cleanly for post-mortem root cause analysis.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.rabbitmq_prefetch_qos,
    MESSAGING_RESEARCH_CITATIONS.bytebytego_delivery_semantics
  ]
};
