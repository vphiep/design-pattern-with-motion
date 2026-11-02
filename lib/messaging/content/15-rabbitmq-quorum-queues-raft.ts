import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const rabbitmqQuorumQueuesRaftTopic: MessagingTopic = {
  id: 'rabbitmq-quorum-queues-raft',
  category: 'advanced-streaming',
  level: 'advanced',
  chapter: 'Chuyên Đề Nâng Cao — Advanced Distributed Streaming',
  name: 'RabbitMQ Clustering, Quorum Queues & Raft Consensus',
  tagline: {
    vi: 'Chuyển đổi từ Classic Mirrored Queues (ha-mode) sang Quorum Queues dựa trên Raft Consensus, bảo vệ chống phân mảnh mạng Split-Brain.',
    en: 'Migrating from Classic Mirrored Queues to Raft Consensus-backed Quorum Queues, eliminating Split-Brain partitions.'
  },
  difficulty: 3,
  order: 15,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Kiến trúc cũ Classic Mirrored Queues (ha-mode) trong RabbitMQ sử dụng giao thức đồng bộ vòng tròn tùy biến (Custom Chain Replication). Khi mạng giữa các node bị phân mảnh (Network Partition / Split-Brain), các node tự bầu chọn leader riêng, dẫn đến mất dữ liệu hoặc dữ liệu bị phân tách không thể gộp lại. Hơn nữa, khi một node mới gia nhập cụm, toàn bộ queue bị dừng xử lý (Blocking Synchronization) để sao chép dữ liệu.',
      en: 'Legacy Classic Mirrored Queues (ha-mode) relied on custom ring replication. During network partitions (Split-Brain), nodes independently elected conflicting leaders, causing data divergence and silent drops. Furthermore, joining new nodes triggered blocking synchronization that froze consumer throughput.'
    },
    hardwareConstraint: {
      vi: 'Định lý CAP chỉ ra rằng trong môi trường mạng có thể bị phân mảnh (Partition Tolerance), hệ thống buộc phải chọn giữa Tính sẵn sàng (Availability) và Tính nhất quán (Consistency).',
      en: 'The CAP theorem dictates that during network partitions, distributed systems must trade between continuous availability and strict consistency.'
    },
    fundamentalSolution: {
      vi: 'Thay thế hoàn toàn Classic Queues bằng Quorum Queues: Áp dụng thuật toán đồng thuận Raft (Raft Consensus Protocol). Một Quorum Queue gồm số lẻ các bản sao (ví dụ: 3 hoặc 5 node). Lệnh ghi chỉ được coi là thành công khi ĐA SỐ (Quorum = N/2 + 1) các node ghi nhận vào WAL log. Nếu mạng bị chia cắt, nhánh thiểu số tự động từ chối ghi, bảo vệ 100% tính toàn vẹn và chống Split-Brain tuyệt đối.',
      en: 'Adopt Quorum Queues backed by the Raft Consensus Protocol: Quorum Queues deploy across an odd number of cluster nodes (3 or 5). Writes require majority quorum confirmation (Q = N/2 + 1) appended to local WAL logs before committing. Minority partitions refuse writes, completely eliminating split-brain anomalies.'
    },
    math: {
      formula: '\\text{Quorum Majority} = \\left\\lfloor \\frac{N}{2} \\right\\rfloor + 1, \\quad \\text{Fault Tolerance} = \\left\\lfloor \\frac{N-1}{2} \\right\\rfloor',
      timeComplexity: 'O(1) append to Raft log',
      spaceComplexity: 'O(N \\times \\text{Queue Size})',
      throughputFormula: '\\text{Write Latency} = \\text{Median Latency of Fastest } \\left( \\left\\lfloor \\frac{N}{2} \\right\\rfloor + 1 \\right) \\text{ Nodes}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Quorum Queues là tiêu chuẩn vàng hiện đại cho mọi hàng đợi yêu cầu độ sẵn sàng cao (HA) trong RabbitMQ kể từ phiên bản 3.8+. Đây là sự thay thế bắt buộc cho Classic Mirrored Queues đã bị gắn nhãn Deprecated và sẽ bị khai tử trong RabbitMQ 4.0.',
      en: 'Quorum Queues are the modern gold standard for high availability in RabbitMQ 3.8+. They officially supersede deprecated Classic Mirrored Queues, which are targeted for complete removal in RabbitMQ 4.0.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Thuật toán Raft trong Quorum Queues: Raft chia thời gian thành các Epoch (Terms). Mỗi Quorum Queue có một Raft Leader độc lập. Các Follower gửi heartbeat liên tục. Khi Leader sập, các Follower trong nhánh đa số tự động bắt đầu cuộc bầu cử và chọn node có log mới nhất làm Leader mới trong vòng 100 - 300ms mà không gây gián đoạn cụm.',
        en: 'Raft Mechanics in Quorum Queues: Raft splits time into monotonic terms. Each quorum queue maintains an independent Raft leader. If the leader fails, majority followers initiate leader election, promoting the most up-to-date node in 100-300ms with zero manual intervention.'
      },
      {
        vi: 'Non-blocking Synchronization: Khi một node mới được thêm vào cluster, nó sao chép dữ liệu từ Leader ngầm dưới background mà KHÔNG LÀM DỪNG (Non-blocking) các hoạt động đọc/ghi của producer và consumer hiện tại.',
        en: 'Non-blocking Synchronization: Newly joined cluster nodes synchronize data from the leader asynchronously in the background without halting active producer ingestion or consumer processing.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Dùng Quorum Queue cho các hàng đợi có hàng triệu message tạm thời ngắn hạn: Quorum Queue luôn luôn ghi đĩa (fsync) để duy trì Raft Log. Với các tác vụ siêu nhẹ không cần bền vững, Classic Queue không mirror sẽ cho throughput cao hơn gấp 5 lần.',
        en: 'Overusing Quorum Queues for Ephemeral Workloads: Quorum Queues fsync to disk to satisfy Raft requirements. For transient, non-critical telemetry, un-mirrored classic queues yield 5x higher throughput.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cụm RabbitMQ Quorum Queue: 3 Nodes với Raft Consensus Majority',
      en: 'RabbitMQ 3-Node Quorum Queue Cluster with Raft Majority Consensus'
    },
    description: {
      vi: 'Sơ đồ luồng commit bản tin khi có sự đồng thuận của 2/3 node và khả năng sống sót khi Node 1 bị cô lập mạng.',
      en: 'Raft commit sequence across 3 nodes showing 2-of-3 quorum consensus and partition tolerance.'
    },
    asciiDiagram: `
RABBITMQ 3-NODE CLUSTER (Quorum Queue: "orders.quorum")

[NODE 1: RAFT LEADER] ====== Network Partition Cut! ====== [NODE 2 & NODE 3]
         |                                                       |
  (Isolated Partition)                                 (Majority Quorum: 2/3)
         |                                                       |
(Refuses new writes!)                                 Node 2 elected NEW LEADER!
                                                                 |
                                                      Producer sends Order #88
                                                                 |
                                                      Node 2 writes local WAL
                                                      Node 3 replicates WAL
                                                                 |
                                                      (2/3 Quorum Confirmed -> Commit!)
`,
    components: [
      {
        name: 'Raft WAL Log',
        role: 'Consensus Commit Log',
        description: {
          vi: 'File nhật ký ghi tuần tự xuống đĩa của mỗi node để lưu giữ trạng thái của Quorum Queue.',
          en: 'Per-node sequential write-ahead log recording replicated Raft state machine commands.'
        }
      },
      {
        name: 'Quorum Majority (2 of 3)',
        role: 'Consensus Gate',
        description: {
          vi: 'Bảo đảm dữ liệu chỉ được commit khi đa số các node đã ghi nhận an toàn xuống ổ đĩa.',
          en: 'Guarantees payloads are acknowledged only after majority nodes fsync to disk.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Khai báo Queue loại Quorum (x-queue-type: quorum)', en: 'Declare quorum queue' },
      phase: 'Declaration',
      description: {
        vi: 'Khai báo hàng đợi với tham số x-queue-type = quorum, phân bố trên 3 node của cụm RabbitMQ.',
        en: 'Declares queue with x-queue-type=quorum distributed across 3 cluster nodes.'
      },
      brokerBehavior: {
        vi: '3 Node khởi tạo nhóm Raft và bầu chọn Node 1 làm Raft Leader.',
        en: 'Nodes form Raft group and elect Node 1 as initial Raft leader.'
      },
      javaCodeLineMatch: 'QueueBuilder.durable("orders.quorum").quorum().build();'
    },
    {
      id: 'step-1',
      title: { vi: 'Producer gửi Message với Publisher Confirm', en: 'Producer publishes with confirm' },
      phase: 'Replicated Write',
      description: {
        vi: 'Producer gửi message vào exchange, Leader nhận bản tin và đồng thời ghi vào WAL cục bộ và gửi AppendEntries sang Node 2, 3.',
        en: 'Leader receives message, appends to local WAL, and streams AppendEntries to followers.'
      },
      brokerBehavior: {
        vi: 'Chờ phản hồi xác nhận từ ít nhất 1 Follower để đạt đa số 2/3.',
        en: 'Awaits confirmation from at least 1 follower to satisfy 2/3 quorum.'
      },
      javaCodeLineMatch: 'rabbitTemplate.convertAndSend("orders.exchange", "order.new", payload);'
    },
    {
      id: 'step-2',
      title: { vi: 'Đạt Quorum -> Leader trả về ACK an toàn', en: 'Quorum reached -> Leader ACKs' },
      phase: 'Quorum Commit',
      description: {
        vi: 'Node 2 xác nhận đã ghi đĩa xong. Đạt 2/3 node, Leader gửi Publisher Confirm (ACK) cho Producer.',
        en: 'Node 2 acknowledges WAL flush. Quorum satisfied; Leader returns publisher confirm.'
      },
      brokerBehavior: {
        vi: 'Dữ liệu được bảo đảm an toàn 100% ngay cả khi Node 1 bị sập mất điện ngay khoảnh khắc tiếp theo.',
        en: 'Payload is 100% durable even if Node 1 suffers immediate catastrophic hardware loss.'
      },
      javaCodeLineMatch: 'channel.waitForConfirmsOrDie(5000);'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Quorum Queues (Raft Consensus trên từng queue)', en: 'Quorum Queues (Per-queue Raft)' },
      keyMechanism: {
        vi: 'Mỗi Quorum Queue là một Raft state machine riêng biệt, hỗ trợ định tuyến exchange linh hoạt và bảo vệ chống split-brain.',
        en: 'Each quorum queue is an independent Raft state machine combining AMQP routing with split-brain immunity.'
      },
      configExample: 'x-queue-type: quorum, x-delivery-limit: 5',
      architectureNote: {
        vi: 'Khắc phục hoàn toàn các nhược điểm của Classic Mirrored Queues cũ.',
        en: 'Permanently solves the data loss and blocking sync flaws of legacy mirrored queues.'
      }
    },
    kafka: {
      role: { vi: 'KRaft Metadata + ISR Partition Replication', en: 'KRaft Metadata + ISR Log Replication' },
      keyMechanism: {
        vi: 'Kafka dùng Raft cho Metadata Controller, còn dữ liệu Partition dùng cơ chế ISR tối ưu hóa cho thông lượng streaming cực lớn.',
        en: 'Kafka uses Raft for cluster metadata and ISR replication for raw data partition throughput.'
      },
      configExample: 'min.insync.replicas=2',
      architectureNote: {
        vi: 'Cả hai đều dựa trên nguyên lý đa số (Quorum Majority) để đạt tính nhất quán cao nhất.',
        en: 'Both rely on majority quorum invariants to deliver strict enterprise consistency.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Loại bỏ 100% nguy cơ mất dữ liệu và phân tách Split-Brain khi rớt mạng.',
        en: '100% immune to network split-brain data divergence.'
      },
      {
        vi: 'Đồng bộ không gây nghẽn (Non-blocking): Thêm node mới không làm gián đoạn hệ thống.',
        en: 'Zero blocking pauses when adding or synchronizing replacement cluster nodes.'
      }
    ],
    cons: [
      {
        vi: 'Bắt buộc ghi đĩa fsync trên đa số node nên throughput thấp hơn Classic Queue trong RAM.',
        en: 'Requires synchronous disk fsync across majority nodes, lower throughput than memory queues.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Latency ghi tăng nhẹ (~2-5ms cho fsync mạng) để đổi lấy cam kết dữ liệu cấp ngân hàng.',
      en: 'Slight latency increase (2-5ms for quorum fsync) in exchange for banking-grade durability.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm thứ tự FIFO nghiêm ngặt theo nhật ký Raft Log.',
      en: 'Strict deterministic FIFO ordering enforced via the linear Raft log.'
    }
  },

  javaCode: `package com.enterprise.messaging.quorum;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqQuorumQueueConfig {

    public static final String CRITICAL_PAYMENTS_QUEUE = "payments.critical.quorum";

    @Bean
    public Queue criticalPaymentsQueue() {
        return QueueBuilder.durable(CRITICAL_PAYMENTS_QUEUE)
            // 1. Declare Modern Quorum Queue (Raft Consensus)
            .quorum()
            // 2. Set max redelivery attempts before automatic dead-lettering
            .deliveryLimit(5)
            // 3. Configure initial quorum cluster size (3 nodes)
            .withArgument("x-quorum-initial-group-size", 3)
            .build();
    }
}`,

  springConfigCode: `spring:
  rabbitmq:
    publisher-confirm-type: correlated
    publisher-returns: true`,

  interviewQuestions: [
    {
      question: {
        vi: 'Tại sao Classic Mirrored Queues (ha-mode) bị khai tử trong RabbitMQ và được thay thế bằng Quorum Queues?',
        en: 'Why were Classic Mirrored Queues deprecated in RabbitMQ in favor of Quorum Queues?'
      },
      answer: {
        vi: 'Classic Mirrored Queues sử dụng thuật toán đồng bộ chuỗi tùy biến không bảo đảm an toàn khi mạng bị chia cắt (Split-Brain). Khi hai node mất kết nối với nhau, cả hai đều tự phong làm master và tiếp tục nhận dữ liệu, dẫn đến dữ liệu bị phân kỳ không thể cứu vãn. Ngoài ra, khi thêm node mới, queue bị khóa cứng (blocking synchronization) làm đứng hình toàn bộ consumer. Quorum Queues áp dụng thuật toán Raft chính thống: 1. Chỉ nhánh đa số (Majority Quorum) mới được ghi, triệt tiêu hoàn toàn split-brain; 2. Đồng bộ node mới diễn ra ngầm không khóa luồng; 3. Tích hợp sẵn delivery-limit chống poison message.',
        en: 'Classic Mirrored Queues used an informal replication chain vulnerable to Split-Brain: during network splits, multiple nodes became master, silently dropping or diverging data. Adding nodes caused blocking pauses that froze consumers. Quorum Queues implement formal Raft consensus: 1. Only majority quorums accept writes, eliminating split-brain; 2. Background non-blocking sync for new nodes; 3. Native poison message delivery-limit handling.'
      },
      seniority: 'Lead'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Mất mát 12.000 đơn hàng do Split-Brain trên cụm RabbitMQ Classic Mirrored Queues',
      en: '12,000 Orders Lost During Network Partition Under Classic Mirrored Queues'
    },
    businessContext: {
      vi: 'Một sàn thương mại điện tử chạy cụm RabbitMQ 3 node trên 2 Availability Zones khác nhau.',
      en: 'An e-commerce platform running a 3-node RabbitMQ cluster across two AWS Availability Zones.'
    },
    problemDescription: {
      vi: 'Đường truyền mạng giữa AZ-1 và AZ-2 bị chập chờn trong 40 giây. Cụm Classic Mirrored Queue rơi vào trạng thái Split-Brain: Node 1 (ở AZ-1) tự coi mình là Master, trong khi Node 2 và 3 (ở AZ-2) cũng tự bầu Master riêng. Cả hai bên đều tiếp tục nhận đơn hàng. Khi mạng thông trở lại, RabbitMQ áp dụng chính sách autoheal, xóa toàn bộ dữ liệu trên Node 1 để đồng bộ theo Node 2, làm biến mất vĩnh viễn 12.000 đơn hàng của khách hàng.',
      en: 'A 40-second network split isolated AZ-1 from AZ-2. Classic Mirrored Queues split: Node 1 became master on one side while Node 2/3 became master on the other. Both accepted orders. Upon network healing, autoheal wiped Node 1’s data to sync with Node 2, silently erasing 12,000 customer orders.'
    },
    whyNaiveFails: {
      vi: 'Đội vận hành cấu hình cluster_partition_handling = pause_minority, nhưng Classic Queue vẫn có kẽ hở thời gian khi chuyển đổi trạng thái dẫn đến tin nhắn bị mất.',
      en: 'Setting cluster_partition_handling=pause_minority reduced split-brain but still suffered edge-case data loss during un-synchronized master failovers.'
    },
    coreSolution: {
      vi: 'Nâng cấp toàn bộ hệ thống lên Quorum Queues với Raft Consensus trên 3 node. Khi mạng phân mảnh, Node 1 (nhánh 1/3) tự động dừng tiếp nhận lệnh ghi ngay lập tức vì không đạt Quorum. Nhánh 2/3 (Node 2 & 3) tiếp tục xử lý an toàn. Khi mạng phục hồi, dữ liệu được đồng bộ hóa hoàn hảo không mất một message nào.',
      en: 'Migrated all queues to Raft-backed Quorum Queues across 3 nodes. During partitions, Node 1 (minority 1/3) instantly rejected writes while majority 2/3 nodes processed safely. Upon reconnection, logs synced with zero loss.'
    },
    productionCode: `// Production Migration: Convert Queues to Quorum
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "quorum");
args.put("x-delivery-limit", 5);
channel.queueDeclare("orders.production.queue", true, false, false, args);`,
    architectureImpact: {
      vi: 'Triệt tiêu 100% nguy cơ mất dữ liệu khi xảy ra phân mảnh mạng (Split-Brain); hệ thống vượt qua thành công bài kiểm tra hỗn loạn Chaos Engineering ngắt mạng liên vùng.',
      en: 'Zero split-brain data loss; cluster successfully survived automated Chaos Engineering inter-AZ network partition drills.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.rabbitmq_prefetch_qos,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
