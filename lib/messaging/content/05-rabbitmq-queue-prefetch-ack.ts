import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const rabbitmqQueuePrefetchAckTopic: MessagingTopic = {
  id: 'rabbitmq-queue-prefetch-ack',
  category: 'rabbitmq-broker',
  level: 'core',
  chapter: 'Chương 02 — RabbitMQ Architecture & Routing',
  name: 'Queue Management, Acknowledgment & Prefetch',
  tagline: {
    vi: 'Làm chủ Durable Queue, cơ chế Prefetch Count (QoS), Competing Consumers, Fair Dispatch và phục hồi khi Consumer sập.',
    en: 'Mastering Durable Queues, Prefetch Count (QoS), Competing Consumers, Fair Dispatch, and crash recovery.'
  },
  difficulty: 2,
  order: 5,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      vi: 'Mặc định, RabbitMQ phân phối message theo kiểu Round-Robin cho các Consumer đang kết nối mà không quan tâm Consumer đó đang bận hay rảnh. Nếu Message 1 cần xử lý 10 giây (nặng), còn Message 2 chỉ mất 10ms (nhẹ), Consumer 1 sẽ bị quá tải nghẽn hàng ngàn message trong khi Consumer 2 ngồi rảnh rỗi (Starvation). Hơn nữa, việc đẩy không giới hạn message vào RAM của Consumer (Prefetch = 0) sẽ gây tràn bộ nhớ JVM Heap OutOfMemory.',
      en: 'By default, RabbitMQ dispatches messages via naive round-robin without checking worker utilization. If Message 1 requires 10s of CPU time while Message 2 takes 10ms, Worker 1 becomes overwhelmed while Worker 2 idles (Starvation). Furthermore, unbounded push (Prefetch = 0) floods consumer heap buffers into fatal OutOfMemory crashes.'
    },
    hardwareConstraint: {
      vi: 'Bộ nhớ JVM Heap của Consumer có giới hạn. Nếu RabbitMQ đẩy 50.000 message (mỗi message 50KB) vào bộ đệm nội bộ của consumer, 2.5GB RAM sẽ bị chiếm dụng ngay lập tức, kích hoạt Full GC kéo dài và sập tiến trình.',
      en: 'Consumer JVM heap memory is bounded. Flooding 50k unacknowledged 50KB messages instantly consumes 2.5GB of RAM, triggering catastrophic Stop-the-World Full GC and pod OOMKilled events.'
    },
    fundamentalSolution: {
      vi: 'Cấu hình basic.qos (Prefetch Count = N) và Fair Dispatch: RabbitMQ chỉ gửi tối đa N message chưa được ACK cho một Consumer. Khi Consumer xử lý xong và gửi basicAck cho 1 message, RabbitMQ mới tiếp tục đẩy message tiếp theo. Các Consumer xử lý nhanh sẽ tự động nhận được nhiều việc hơn, cân bằng tải tự nhiên.',
      en: 'Configure basic.qos (Prefetch Count = N) for Fair Dispatch: RabbitMQ delivers at most N unacknowledged messages to a consumer. Only after the worker returns a basicAck does the broker dispatch the next message. Fast workers naturally pull more work, balancing cluster load dynamically.'
    },
    math: {
      formula: '\\text{Throughput} \\approx \\frac{\\text{Consumers} \\times \\text{Prefetch}}{\\text{AvgProcessingTime}}',
      timeComplexity: 'O(1) dispatch per prefetch window',
      spaceComplexity: 'O(N \\times S) — N: prefetch count, S: message size',
      throughputFormula: '\\text{Utilization}_{consumer} \\approx \\frac{T_{proc}}{T_{proc} + T_{rtt} / N} \\quad (N \\ge 10 \\implies 99\\% \\text{ saturation})'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Quản lý Queue trong RabbitMQ đòi hỏi sự cân bằng tinh tế giữa Tính bền vững (Durability) và Thông lượng (Throughput). Việc hiểu rõ vòng đời lưu trữ trên đĩa và cơ chế cấp phát Prefetch là điều kiện tiên quyết để vận hành RabbitMQ ổn định.',
      en: 'Queue management demands a disciplined balance between persistence and throughput. Understanding on-disk durability and prefetch buffer sizing is essential for production RabbitMQ stability.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Durable Queue vs Persistent Message: Một Queue được đánh dấu là Durable (bền vững) sẽ sống sót qua các lần khởi động lại broker. Tuy nhiên, nếu message gửi vào không được đánh dấu là PERSISTENT (delivery_mode=2), message đó vẫn sẽ biến mất khi broker restart. Để bảo đảm 100% không mất dữ liệu, CẢ QUEUE LẪN MESSAGE ĐỀU PHẢI Ở CHẾ ĐỘ DURABLE/PERSISTENT.',
        en: 'Durable Queue vs Persistent Message: A Durable Queue survives broker restarts, but its messages will vanish unless messages themselves are flagged as PERSISTENT (delivery_mode=2). Complete durability requires BOTH durable queues and persistent delivery modes.'
      },
      {
        vi: 'Competing Consumers & Consumer Crash Redelivery: Nhiều Consumer cùng lắng nghe 1 Queue (Competing Consumers). Nếu Consumer 1 nhận 5 message nhưng đột ngột bị sập (JVM crash, Pod OOM), kết nối TCP bị ngắt. RabbitMQ nhận biết socket đóng, tự động lấy toàn bộ 5 message chưa ACK đó trả về đầu hàng đợi và dispatch ngay cho Consumer 2 (Redelivery with redelivered=true flag).',
        en: 'Competing Consumers & Crash Recovery: When multiple workers consume from one queue, if Worker 1 drops connection with 5 unacked messages, RabbitMQ detects the socket close, places all 5 back onto the queue head, and dispatches them to Worker 2 with redelivered=true.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Đặt Prefetch Count = 1 trong môi trường thông lượng cao: Prefetch = 1 loại bỏ hoàn toàn tình trạng nghẽn, nhưng buộc Consumer phải chờ 1 vòng mạng Round-Trip Time (RTT) sau mỗi message để nhận message tiếp theo, làm sụt giảm throughput tới 80%. Khuyến nghị: Prefetch từ 20 đến 100 cho microservices I/O thông thường.',
        en: 'Setting Prefetch = 1 for high-throughput queues: Prefetch = 1 prevents starvation but leaves consumers waiting idle for network round-trips after every message, collapsing throughput by 80%. Recommended: 20-100 for general microservices.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cơ chế Fair Dispatch với Prefetch Count vs Round-Robin Không Giới Hạn',
      en: 'Fair Dispatch Prefetch Window vs Unbounded Round-Robin Flooding'
    },
    description: {
      vi: 'Minh họa cách Prefetch Count = 2 bảo vệ worker khỏi tình trạng nghẽn bộ đệm khi xử lý các task nặng.',
      en: 'Architecture diagram comparing unbounded round-robin flooding against prefetch-governed fair dispatch.'
    },
    asciiDiagram: `
[UNBOUNDED PREFETCH = 0 (DANGEROUS FLOOD)]
RabbitMQ Queue ===(Pushes 10,000 msgs)===> Consumer Heap (OOM CRASH!)

[FAIR DISPATCH WITH PREFETCH = 2 (OPTIMAL)]
RabbitMQ Queue: [#3, #4, #5, #6]
       |
       +--- [Message #1, #2 In-Flight] ---> Worker 1 (Heavy Task: 500ms)
       |                                       |
       |                                   (Busy... no more msgs sent until ACK)
       |
       +--- [Message #3, #4 In-Flight] ---> Worker 2 (Light Task: 10ms)
                                               |
                                           (basicAck(#3) emitted in 10ms)
                                               |
RabbitMQ sees ACK(#3) ---> Instantly sends Message #5 to Worker 2!
`,
    components: [
      {
        name: 'Prefetch Window (Channel QoS)',
        role: 'Flow Regulator',
        description: {
          vi: 'Giới hạn số lượng bản tin chưa được xác nhận trên mỗi Channel kết nối.',
          en: 'Restricts the maximum number of unacknowledged messages allowed in-flight per channel.'
        }
      },
      {
        name: 'Durable Storage (Mnesia / Raft Log)',
        role: 'Persistence Engine',
        description: {
          vi: 'Lưu trữ metadata và payload của message xuống đĩa cứng để chống mất mát khi server mất điện.',
          en: 'Flushes message payloads to disk to survive host reboot and power outages.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Khởi tạo Queue Durable & Cấu hình basicQos(50)', en: 'Declare durable queue with basicQos(50)' },
      phase: 'Consumer Initialization',
      description: {
        vi: 'Consumer kết nối đến broker, thiết lập channel.basicQos(50), nghĩa là chỉ nhận tối đa 50 message cùng lúc.',
        en: 'Consumer opens channel and establishes basicQos(50), capping in-flight messages at 50.'
      },
      brokerBehavior: {
        vi: 'Broker ghi nhận giới hạn QoS của channel này.',
        en: 'Broker registers client QoS window constraints.'
      },
      javaCodeLineMatch: 'channel.basicQos(50);'
    },
    {
      id: 'step-1',
      title: { vi: 'Broker đẩy đủ 50 message và dừng lại', en: 'Broker fills window and pauses' },
      phase: 'Window Saturation',
      description: {
        vi: 'Broker đẩy 50 message vào bộ đệm của Consumer. Khi số unacked = 50, broker tạm dừng đẩy thêm.',
        en: 'Broker delivers 50 messages. Once unacked count hits 50, further delivery pauses.'
      },
      brokerBehavior: {
        vi: 'Đóng van cấp phát cho Consumer này cho đến khi có basicAck.',
        en: 'Pauses dispatching to this consumer until ACK packets arrive.'
      },
      javaCodeLineMatch: 'factory.setPrefetchCount(50);'
    },
    {
      id: 'step-2',
      title: { vi: 'Consumer xử lý và ACK từng message', en: 'Consumer processes and ACKs' },
      phase: 'Steady-State Pipelining',
      description: {
        vi: 'Mỗi khi Consumer xử lý xong 1 message và gọi basicAck, cửa sổ trượt mở thêm 1 ô, broker đẩy ngay message tiếp theo.',
        en: 'Each basicAck slides the prefetch window by 1, prompting the broker to emit the next task.'
      },
      brokerBehavior: {
        vi: 'Duy trì luồng xử lý liên tục 100% công suất mà không gây nghẽn RAM.',
        en: 'Maintains steady pipeline throughput with zero consumer RAM saturation.'
      },
      javaCodeLineMatch: 'channel.basicAck(deliveryTag, false);'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Push Model với cơ chế điều tiết Prefetch', en: 'Push model governed by prefetch' },
      keyMechanism: {
        vi: 'Broker chủ động PUSH message đến client. Prefetch đóng vai trò là van điều áp để client không bị ngợp.',
        en: 'Broker actively pushes messages. Prefetch acts as a pressure relief valve protecting clients.'
      },
      configExample: 'spring.rabbitmq.listener.simple.prefetch=50',
      architectureNote: {
        vi: 'Cân bằng tải Competing Consumers cực kỳ mượt mà, phân bổ theo năng lực thực tế của từng node.',
        en: 'Delivers dynamic load balancing among competing consumers based on processing speed.'
      }
    },
    kafka: {
      role: { vi: 'Pull Model (Consumer tự kéo theo batch)', en: 'Pull model (consumer controls fetch batch)' },
      keyMechanism: {
        vi: 'Kafka không push. Consumer tự gọi poll(Duration) để kéo tối đa max.poll.records (mặc định 500) theo tốc độ của mình.',
        en: 'Kafka never pushes. Consumers call poll() to fetch up to max.poll.records at their own pace.'
      },
      configExample: 'max.poll.records=100, max.poll.interval.ms=300000',
      architectureNote: {
        vi: 'Loại bỏ hoàn toàn rủi ro bị broker làm ngợp bộ nhớ; consumer hoàn toàn làm chủ tốc độ tiêu thụ.',
        en: 'Eliminates broker-driven memory flooding; consumer has total control over memory consumption.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Ngăn chặn 100% sự cố sập OutOfMemory do bị broker xả lũ message.',
        en: 'Guarantees zero consumer OOM crashes from broker message flooding.'
      },
      {
        vi: 'Tự động phân bổ công việc công bằng (Fair Dispatch): worker mạnh làm nhiều, worker yếu làm ít.',
        en: 'Dynamic fair dispatching: faster workers consume more tasks automatically.'
      }
    ],
    cons: [
      {
        vi: 'Cần tính toán kỹ chỉ số Prefetch phù hợp với thời gian xử lý nghiệp vụ.',
        en: 'Requires careful tuning of prefetch count against business execution latency.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Prefetch quá nhỏ (1-5) làm giảm throughput; Prefetch quá lớn (> 500) làm mất tính công bằng khi có task nặng xen kẽ.',
      en: 'Tiny prefetch (1-5) degrades throughput; excessive prefetch (> 500) harms fair dispatch during mixed workloads.'
    },
    orderingGuarantee: {
      vi: 'Khi có nhiều Competing Consumers trên 1 Queue, thứ tự xử lý hoàn tất giữa các message không còn là FIFO tuyệt đối.',
      en: 'Under competing consumers, message completion order across workers ceases to be strictly sequential.'
    }
  },

  javaCode: `package com.enterprise.messaging.prefetch;

import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqPrefetchQosConfig {

    @Bean
    public RabbitListenerContainerFactory<?> orderContainerFactory(ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);

        // 1. Fair Dispatch: Prefetch Count = 30 messages per consumer
        factory.setPrefetchCount(30);

        // 2. Concurrency: 5 baseline worker threads, scaling to 20 under spike load
        factory.setConcurrentConsumers(5);
        factory.setMaxConcurrentConsumers(20);

        // 3. Manual ACK required to slide prefetch window
        factory.setAcknowledgeMode(org.springframework.amqp.core.AcknowledgeMode.MANUAL);

        // 4. Default requeue rejected set to false to prevent poison loops
        factory.setDefaultRequeueRejected(false);

        return factory;
    }
}`,

  springConfigCode: `spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 50
        concurrency: 5
        max-concurrency: 20
        acknowledge-mode: manual`,

  interviewQuestions: [
    {
      question: {
        vi: 'Điều gì xảy ra nếu không cấu hình Prefetch Count trong RabbitMQ? Khi nào nên đặt Prefetch = 1?',
        en: 'What happens if Prefetch Count is not configured in RabbitMQ? When should you set Prefetch = 1?'
      },
      answer: {
        vi: 'Nếu không cấu hình, Prefetch mặc định là 0 (Unbounded). RabbitMQ sẽ đẩy toàn bộ message trong queue vào socket buffer và RAM của consumer, dẫn đến Consumer bị cạn kiệt RAM và sập OOM. Nên đặt Prefetch = 1 khi: các tác vụ xử lý rất nặng (CPU-intensive hoặc Disk I/O kéo dài nhiều giây như nén video, render 3D, tính toán báo cáo tài chính phức tạp), nhằm đảm bảo không có worker nào bị ôm đồm nhiều task nặng trong khi worker khác ngồi chơi.',
        en: 'Unconfigured prefetch defaults to 0 (unbounded), flooding all queue messages into consumer heap, causing OOM crashes. Set Prefetch = 1 only for heavy, multi-second CPU/disk-intensive tasks (e.g. video rendering, heavy report generation) so that idle workers pick up tasks immediately.'
      },
      seniority: 'Mid'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố sập 12 Pod Kubernetes do Consumer OOMKilled khi xử lý file PDF xuất báo cáo',
      en: '12 Kubernetes Pods OOMKilled Simultaneously Due to Unbounded RabbitMQ Prefetch'
    },
    businessContext: {
      vi: 'Một ứng dụng kế toán SaaS có chức năng cho phép 50.000 doanh nghiệp xuất báo cáo thuế PDF vào ngày cuối quý.',
      en: 'A SaaS accounting platform allowed 50,000 businesses to export quarterly PDF tax audits on the same deadline day.'
    },
    problemDescription: {
      vi: 'Mỗi file PDF khi render tiêu tốn 40MB RAM. Do không cấu hình prefetch (Prefetch = 0), RabbitMQ đẩy 2.000 task xuất PDF vào mỗi Pod Consumer trong 1 giây. Mỗi Pod yêu cầu 80GB RAM, vượt xa giới hạn 4GB của Kubernetes pod limits, dẫn đến toàn bộ 12 Pod bị hệ điều hành bắn chết (OOMKilled exit code 137) cùng một lúc.',
      en: 'Rendering each PDF consumed 40MB of RAM. With prefetch=0, RabbitMQ pushed 2,000 tasks per pod within 1s. Each pod demanded 80GB RAM, breaching Kubernetes 4GB limits, triggering simultaneous OOMKilled (Exit Code 137) across all 12 worker pods.'
    },
    whyNaiveFails: {
      vi: 'Kubernetes tự restart lại các Pod mới. Ngay khi Pod vừa online, RabbitMQ lại lập tức xả tiếp hàng ngàn message vào, tạo thành vòng lặp sập Pod CrashLoopBackOff bất tận.',
      en: 'Kubernetes restarted the pods, but upon startup RabbitMQ instantly flooded them again, locking the cluster in a fatal CrashLoopBackOff death loop.'
    },
    coreSolution: {
      vi: 'Cấu hình channel.basicQos(2) trên container factory. Mỗi Pod chỉ nhận tối đa đúng 2 task render PDF tại một thời điểm (tiêu tốn tối đa 80MB RAM). Khi hoàn tất và gửi basicAck, broker mới đưa task thứ 3.',
      en: 'Configured channel.basicQos(2) on the listener container. Each pod accepts at most 2 PDF render jobs concurrently (capping RAM usage at ~80MB). Once a task ACKs, the next job is dispatched.'
    },
    productionCode: `@Bean
public SimpleRabbitListenerContainerFactory pdfRenderContainerFactory(ConnectionFactory connectionFactory) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setPrefetchCount(2); // Strict limit: 2 heavy tasks per worker
    factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
    return factory;
}`,
    architectureImpact: {
      vi: 'Mức tiêu thụ RAM của mỗi Pod ổn định ở mức 250MB (giảm 99%); tình trạng OOMKilled triệt tiêu hoàn toàn; toàn bộ 50.000 file PDF được xử lý mượt mà.',
      en: 'Pod RAM usage stabilized at 250MB (99% reduction); zero OOMKilled events; all 50k PDFs rendered reliably under peak load.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.rabbitmq_prefetch_qos,
    MESSAGING_RESEARCH_CITATIONS.datadog_queue_backpressure
  ]
};
