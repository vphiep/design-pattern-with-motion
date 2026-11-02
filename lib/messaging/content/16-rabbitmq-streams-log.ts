import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const rabbitmqStreamsLogTopic: MessagingTopic = {
  id: 'rabbitmq-streams-log',
  category: 'advanced-streaming',
  level: 'advanced',
  chapter: 'Chuyên Đề Nâng Cao — Advanced Distributed Streaming',
  name: 'RabbitMQ Streams: High-Throughput Append-Only Event Streaming',
  tagline: {
    vi: 'Cơ chế lưu trữ Append-only Log mới trong RabbitMQ 3.9+, giao thức nhị phân siêu tốc, đọc tua lại Offset và so sánh với Kafka.',
    en: 'RabbitMQ 3.9+ Append-Only Log architecture, ultra-fast binary stream protocol, offset replays, and Kafka comparison.'
  },
  difficulty: 3,
  order: 16,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Hàng đợi truyền thống của RabbitMQ (Classic/Quorum) xóa dữ liệu sau khi consumer xác nhận ACK (Destructive Read). Do đó, RabbitMQ truyền thống không thể hỗ trợ các nghiệp vụ: 1. Nhiều consumer độc lập cùng đọc 1 luồng dữ liệu theo tốc độ riêng; 2. Tua lại quá khứ (Time Travel / Replay) để khôi phục trạng thái sau sự cố; 3. Đạt thông lượng triệu bản tin/giây do chi phí quản lý trạng thái từng message trong bộ nhớ.',
      en: 'Traditional RabbitMQ queues delete messages upon acknowledgment (destructive consumption). Consequently, classic queues cannot support: 1. Multiple independent consumers reading at different speeds; 2. Time-travel replays after software regressions; 3. Multi-million msg/s throughput due to per-message queue index bookkeeping in RAM.'
    },
    hardwareConstraint: {
      vi: 'Quản lý trạng thái và con trỏ cho hàng triệu message riêng rẽ trong RAM tiêu tốn tài nguyên Erlang garbage collection, giới hạn thông lượng của Classic Queues ở mức 30.000 - 80.000 msg/s.',
      en: 'Maintaining individual in-memory index trees for millions of discrete messages creates Erlang GC pressure, capping classic queue throughput at ~50k msg/s.'
    },
    fundamentalSolution: {
      vi: 'RabbitMQ Streams (giới thiệu từ bản 3.9+): Chuyển đổi mô hình thành Append-Only Log bất biến lưu trên đĩa giống như Kafka. Consumer quản lý vị trí đọc thông qua Offset, cho phép đọc đi đọc lại nhiều lần (Non-destructive Read). Đồng thời, RabbitMQ giới thiệu giao thức nhị phân chuyên dụng (RabbitMQ Stream Protocol - cổng 5552) vượt qua giới hạn của chuẩn AMQP cũ, đạt thông lượng hàng triệu msg/s.',
      en: 'RabbitMQ Streams (3.9+): Adopts an immutable append-only commit log on disk modeled after Kafka. Consumers track their own offsets, enabling non-destructive reading and historical replay. A dedicated high-performance binary Stream Protocol (port 5552) bypasses AMQP limits, achieving millions of events/sec.'
    },
    math: {
      formula: '\\text{Throughput}_{stream} \\approx 10\\times \\text{Throughput}_{classic}, \\quad \\text{Storage} = \\text{Append-only Log Segments}',
      timeComplexity: 'O(1) sequential log append & zero-copy read',
      spaceComplexity: 'O(\\text{Log Retention Capacity})',
      throughputFormula: '\\text{Benchmark} > 1,000,000 \\text{ msg/s on commodity NVMe hardware}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'RabbitMQ Streams là bước tiến chiến lược giúp RabbitMQ mở rộng phạm vi từ Message Broker truyền thống sang thị trường Event Streaming phân tán, cạnh tranh trực tiếp với Apache Kafka trong nhiều kịch bản.',
      en: 'RabbitMQ Streams is a transformative evolution bridging traditional task queues into high-volume distributed event streaming, directly competing with Kafka in enterprise use cases.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Giao thức nhị phân Stream Protocol (Port 5552): Không giống như giao thức AMQP 0-9-1 (cổng 5672) vốn có chi phí đóng khung gói tin lớn, Stream Protocol sử dụng binary framing tối giản, gom batch tự động và hỗ trợ zero-copy trực tiếp từ OS Page Cache xuống socket mạng, nâng thông lượng lên tới 1.5 triệu msg/s.',
        en: 'The Dedicated Stream Protocol (Port 5552): Bypasses heavy AMQP 0-9-1 frame parsing with a streamlined binary protocol supporting automated batching and zero-copy socket transfers from OS page cache, scaling throughput past 1.5 million msg/s.'
      },
      {
        vi: 'Offset Tracking & Replay: Consumer có thể bắt đầu đọc từ bất kỳ vị trí nào: first (từ đầu log), last (tin nhắn mới nhất), next (tin nhắn tiếp theo), hoặc từ một Timestamp / Offset cụ thể. Điều này cho phép tái tạo lại trạng thái hoặc chạy lại thuật toán phân tích sau khi sửa bug.',
        en: 'Offset Tracking & Replays: Consumers can attach at any point: first, last, next, or arbitrary timestamp/offset milestones. This enables time-travel debugging and state re-hydration after application bug fixes.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Nhầm lẫn giữa Stream và Quorum Queue: Dùng RabbitMQ Streams cho các tác vụ cần routing phức tạp qua Topic Exchange và ACK từng bản tin riêng lẻ sẽ không hoạt động hiệu quả vì Stream không hỗ trợ xóa từng message.',
        en: 'Misusing Streams for Task Queues: Using RabbitMQ Streams for fine-grained per-message ACK/NACK task workflows is an anti-pattern because streams do not delete individual messages.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Kiến trúc RabbitMQ Streams: Append-Only Log Segments & Offset Tracking',
      en: 'RabbitMQ Streams Architecture: Append-Only Segments & Offset Tracking'
    },
    description: {
      vi: 'Sơ đồ luồng lưu trữ bất biến trên đĩa và nhiều Consumer đọc độc lập với các Offset khác nhau.',
      en: 'Physical layout of disk segment logs with multi-consumer non-destructive offset scanning.'
    },
    asciiDiagram: `
[PRODUCER (Stream Protocol: Port 5552)] ===(Appends 1,000,000 msg/s)===> [RABBITMQ STREAM LOG]
                                                                                |
                                     +------------------------------------------+
                                     v
                       [ APPEND-ONLY DISK SEGMENTS ]
              Offset: [100] [101] [102] [103] [104] [105] [106]
                        |           |                 |
                        v           v                 v
            (Consumer A: Offset 100) (Consumer B: Offset 102) (Consumer C: Offset 106)
            [Audit Service Replay]   [Real-time Analytics]    [Fast Live Processing]
`,
    components: [
      {
        name: 'Stream Segment Files',
        role: 'Append-Only Storage',
        description: {
          vi: 'Các file log nhị phân lưu trữ tuần tự trên đĩa, được xóa theo thời gian hoặc dung lượng (Retention).',
          en: 'Binary sequential log files rotated by age or size retention policies.'
        }
      },
      {
        name: 'Stream Offset Coordinator',
        role: 'Consumer Tracking',
        description: {
          vi: 'Theo dõi vị trí đọc của từng client name, lưu trữ bền vững trong cluster.',
          en: 'Tracks committed consumer offsets per subscription name.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Khai báo Hàng đợi loại Stream (x-queue-type: stream)', en: 'Declare stream queue' },
      phase: 'Declaration',
      description: {
        vi: 'Khai báo Stream với giới hạn lưu trữ tối đa 100GB hoặc thời gian lưu trữ 7 ngày (x-max-age: 7D).',
        en: 'Declares stream with 100GB max-length-bytes or 7-day retention (x-max-age: 7D).'
      },
      brokerBehavior: {
        vi: 'Broker tạo append-only log file trên đĩa cứng.',
        en: 'Broker provisions append-only file segments on disk.'
      },
      javaCodeLineMatch: 'QueueBuilder.durable("iot.sensor.stream").stream().build();'
    },
    {
      id: 'step-1',
      title: { vi: 'Producer ghi siêu tốc qua Stream Client', en: 'Ultra-fast stream produce' },
      phase: 'Binary Ingestion',
      description: {
        vi: 'Sử dụng RabbitMQ Stream Client (Port 5552) gửi batch 500 bản tin trong 1 microsecond.',
        en: 'Stream client emits 500-record batches over port 5552 in sub-milliseconds.'
      },
      brokerBehavior: {
        vi: 'Ghi tuần tự vào OS Page Cache và fsync định kỳ.',
        en: 'Sequential append to OS page cache with batched fsync.'
      },
      javaCodeLineMatch: 'producer.send(message, confirmation -> {});'
    },
    {
      id: 'step-2',
      title: { vi: 'Consumer tua lại dữ liệu từ Offset 0 để phân tích', en: 'Consumer replays from offset 0' },
      phase: 'Time-Travel Replay',
      description: {
        vi: 'Một Analytics Service mới được deploy, cấu hình OffsetSpecification.first() để quét lại toàn bộ dữ liệu lịch sử.',
        en: 'New analytics service subscribes with OffsetSpecification.first(), replaying entire historical log.'
      },
      brokerBehavior: {
        vi: 'Dữ liệu được đọc qua zero-copy mà không hề bị xóa khỏi stream.',
        en: 'Bytes streamed via zero-copy without deleting underlying log entries.'
      },
      javaCodeLineMatch: 'builder.offset(OffsetSpecification.first()).build();'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'RabbitMQ Streams (Tích hợp trong RabbitMQ Cluster)', en: 'RabbitMQ Native Streams' },
      keyMechanism: {
        vi: 'Cho phép dùng chung 1 cụm RabbitMQ cho cả tác vụ hàng đợi (Quorum Queues) và tác vụ streaming (Streams).',
        en: 'Unifies traditional task queues and high-volume event streaming within a single RabbitMQ cluster.'
      },
      configExample: 'x-queue-type: stream, x-max-age: 7D',
      architectureNote: {
        vi: 'Tiết kiệm chi phí vận hành cho các doanh nghiệp không muốn duy trì thêm cụm Kafka riêng biệt.',
        en: 'Saves operational costs for enterprises avoiding the overhead of maintaining a separate Kafka cluster.'
      }
    },
    kafka: {
      role: { vi: 'Apache Kafka (Chuyên biệt hóa tuyệt đối cho Big Data)', en: 'Dedicated Big Data Streaming Engine' },
      keyMechanism: {
        vi: 'Kafka có hệ sinh thái Stream Processing (Kafka Streams, Flink) và CDC (Kafka Connect) rộng lớn và trưởng thành hơn.',
        en: 'Possesses a vastly more mature stream processing (Kafka Streams/Flink) and CDC ecosystem.'
      },
      configExample: 'retention.ms=604800000',
      architectureNote: {
        vi: 'Vẫn là tiêu chuẩn số 1 thế giới cho các cụm streaming hàng chục Terabyte dữ liệu mỗi ngày.',
        en: 'Remains the undisputed enterprise standard for massive multi-terabyte daily data pipelines.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Thông lượng tăng gấp 10 - 20 lần so với Classic RabbitMQ Queues.',
        en: '10x-20x throughput improvement over classic RabbitMQ queues.'
      },
      {
        vi: 'Cho phép đọc tua lại lịch sử (Time Travel) mà không làm mất dữ liệu.',
        en: 'Non-destructive reads enabling historical time-travel event replays.'
      }
    ],
    cons: [
      {
        vi: 'Không hỗ trợ AMQP Topic Exchange routing linh hoạt như Classic Queues.',
        en: 'Lacks the dynamic wildcard topic exchange routing of classic queues.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Thông lượng vượt 1.000.000 msg/s trên phần cứng tiêu chuẩn; độ trễ P99 ở mức 2 - 5ms.',
      en: 'Throughput exceeds 1,000,000 msg/s with P99 latency maintained at 2-5ms.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm thứ tự tuần tự tuyệt đối 100% trong toàn bộ Stream.',
      en: 'Strict 100% sequential ordering throughout the entire stream.'
    }
  },

  javaCode: `package com.enterprise.messaging.stream;

import com.rabbitmq.stream.*;
import java.util.concurrent.CountDownLatch;

public class RabbitMqStreamRunner {

    public static void main(String[] args) throws Exception {
        // 1. Connect to RabbitMQ Stream Port 5552 (Not AMQP 5672)
        Environment environment = Environment.builder()
            .host("localhost")
            .port(5552)
            .username("guest")
            .password("guest")
            .build();

        String streamName = "telemetry-stream";
        environment.streamCreator().stream(streamName).create();

        // 2. High-throughput Stream Producer
        Producer producer = environment.producerBuilder()
            .stream(streamName)
            .build();

        for (int i = 0; i < 10000; i++) {
            Message msg = producer.messageBuilder()
                .addData(("Sensor reading: " + i).getBytes())
                .build();
            producer.send(msg, confirmation -> {});
        }

        // 3. Replay Consumer: Reading from the VERY FIRST message (Offset 0)
        Consumer consumer = environment.consumerBuilder()
            .stream(streamName)
            .offset(OffsetSpecification.first()) // Time-travel replay!
            .messageHandler((context, message) -> {
                System.out.printf("Stream Replayed: Offset=%d, Data=%s%n",
                    context.offset(), new String(message.getBodyAsBinary()));
            })
            .build();
    }
}`,

  springConfigCode: `spring:
  rabbitmq:
    stream:
      host: localhost
      port: 5552`,

  interviewQuestions: [
    {
      question: {
        vi: 'Sự khác biệt căn bản giữa RabbitMQ Streams và RabbitMQ Classic/Quorum Queues là gì?',
        en: 'What is the fundamental difference between RabbitMQ Streams and Classic/Quorum Queues?'
      },
      answer: {
        vi: 'Sự khác biệt cốt lõi nằm ở cơ chế ĐỌC DỮ LIỆU: 1. Classic/Quorum Queues hoạt động theo mô hình Destructive Read: khi Consumer xác nhận ACK, message bị xóa vĩnh viễn khỏi queue để giải phóng RAM; 2. RabbitMQ Streams hoạt động theo mô hình Non-Destructive Append-Only Log (giống Kafka): message được ghi nối tiếp vào đĩa cứng và lưu trữ theo thời gian retention. Consumer quản lý vị trí đọc qua Offset và có thể tua lại đọc nhiều lần mà không làm mất message của consumer khác.',
        en: 'The core dichotomy is Destructive vs Non-Destructive Consumption: 1. Classic/Quorum queues perform destructive reads—acknowledging evicts messages from broker storage immediately; 2. RabbitMQ Streams implement non-destructive append-only logs (like Kafka)—records persist on disk across configurable retention windows, allowing independent consumers to track their own offsets and replay historical events repeatedly.'
      },
      seniority: 'Senior'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Chuyển đổi hệ thống xử lý luồng IoT 500.000 msg/s sang RabbitMQ Streams',
      en: 'Scaling IoT Ingestion from 40k to 500k msg/s via RabbitMQ Streams Migration'
    },
    businessContext: {
      vi: 'Một giải pháp Smart City thu thập tín hiệu cảm biến giao thông và môi trường đô thị.',
      en: 'A municipal smart city platform collecting sensor signals from 50,000 traffic intersections.'
    },
    problemDescription: {
      vi: 'Hệ thống dùng RabbitMQ Classic Queues. Khi lưu lượng vượt qua 45.000 msg/s, RAM của cụm RabbitMQ chạm ngưỡng 90%, Erlang Garbage Collector ngốn 100% CPU, broker liên tục chặn kết nối TCP (Connection Alarms). Ngoài ra, đội ngũ AI muốn lấy lại dữ liệu 7 ngày qua để huấn luyện mô hình nhưng không thể vì dữ liệu đã bị xóa ngay khi ACK.',
      en: 'Classic queues collapsed at 45,000 msg/s. RAM hit 90%, Erlang GC consumed 100% CPU, and connection alarms throttled ingress. Concurrently, data science teams were unable to train traffic prediction models because events were deleted upon consumption.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư định cài đặt thêm một cụm Apache Kafka 12 node độc lập. Chi phí vận hành tăng vọt, đòi hỏi đội ngũ SRE phải học và quản trị thêm một công nghệ hoàn toàn mới.',
      en: 'The team proposed spinning up a separate 12-node Apache Kafka cluster, doubling cloud hosting bills and introducing substantial operational complexity.'
    },
    coreSolution: {
      vi: 'Kích hoạt plugin rabbitmq_stream trên cụm RabbitMQ hiện có và chuyển topic sensor sang loại Stream (x-queue-type: stream). Sử dụng Stream Protocol (Port 5552). Đội AI có thể cắm consumer đọc tua lại dữ liệu 7 ngày thoải mái mà không ảnh hưởng đến luồng điều khiển thời gian thực.',
      en: 'Enabled rabbitmq_stream on the existing cluster and migrated sensor queues to Streams over port 5552. Data science teams plugged in non-destructive replay consumers without degrading live traffic controllers.'
    },
    productionCode: `// Production Migration to Stream Queue
Map<String, Object> streamArgs = new HashMap<>();
streamArgs.put("x-queue-type", "stream");
streamArgs.put("x-max-age", "7D"); // 7 days retention
streamArgs.put("x-max-length-bytes", 500_000_000_000L); // 500 GB cap
channel.queueDeclare("smart-city.sensor.stream", true, false, false, streamArgs);`,
    architectureImpact: {
      vi: 'Thông lượng xử lý tăng vọt từ 45.000 lên 650.000 msg/s (tăng 1.400%); CPU cụm RabbitMQ giảm từ 95% xuống 28%; tiết kiệm 120.000 USD/năm chi phí hạ tầng Kafka riêng rẽ.',
      en: 'Ingress throughput scaled from 45k to 650k msg/s (14x boost); broker CPU dropped from 95% to 28%; saved $120,000/year by bypassing dedicated Kafka cluster deployment.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.rabbitmq_prefetch_qos,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
