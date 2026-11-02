import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const kafkaArchitecturePartitionsTopic: MessagingTopic = {
  id: 'kafka-architecture-partitions',
  category: 'kafka-streaming',
  level: 'core',
  chapter: 'Chương 03 — Apache Kafka Architecture',
  name: 'Kafka Architecture: Topics, Partitions & Replication',
  tagline: {
    vi: 'Giải phẫu cụm Kafka Cluster, KRaft Controller, Topic Partitioning, Leader/Follower Replicas, ISR và bảo đảm thứ tự.',
    en: 'Deconstructing Kafka Clusters, KRaft Controllers, Topic Partitioning, Leader/Follower Replicas, ISR, and order guarantees.'
  },
  difficulty: 2,
  order: 7,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Một message broker tập trung truyền thống (như ActiveMQ hoặc single-queue RabbitMQ) lưu trữ toàn bộ message trên 1 node máy chủ duy nhất. Khi lưu lượng vượt qua hàng trăm ngàn message/giây hoặc dung lượng dữ liệu đạt hàng chục Terabyte, hệ thống chạm trần giới hạn phần cứng (I/O Bottleneck, RAM exhaustion) và không thể mở rộng theo chiều ngang (Scale-out).',
      en: 'Monolithic single-node message brokers store all queues on a single machine. When throughput reaches hundreds of thousands of events/second or datasets reach tens of terabytes, vertical hardware boundaries (disk I/O and RAM) are saturated, preventing horizontal scale-out.'
    },
    hardwareConstraint: {
      vi: 'Một ổ cứng NVMe SSD cao cấp có giới hạn tốc độ đọc/ghi tuần tự (~3.5 - 7 GB/s) và băng thông card mạng NIC (10Gbps - 25Gbps). Một máy chủ đơn lẻ không bao giờ có thể xử lý lượng dữ liệu của hàng triệu thiết bị IoT streaming liên tục.',
      en: 'A single high-end NVMe SSD has physical throughput ceilings (3.5 - 7 GB/s sequential) and network NIC caps (10-25 Gbps). A standalone node cannot ingest continuous streams from millions of concurrent IoT devices.'
    },
    fundamentalSolution: {
      vi: 'Kafka chia nhỏ một Topic logic thành nhiều Partition vật lý độc lập (Sharding/Partitioning) phân tán trên nhiều Broker khác nhau trong Cluster. Mỗi Partition là một Append-only Commit Log được nhân bản (Replication Factor = R) với 1 Leader và (R-1) Followers. Client chỉ đọc/ghi trực tiếp vào Leader; các Follower liên tục sao chép ngầm để tạo thành tập hợp đồng bộ In-Sync Replicas (ISR).',
      en: 'Kafka shatters a logical Topic into discrete physical Partitions distributed across a multi-node broker cluster. Each partition is an append-only commit log replicated (Replication Factor = R) with 1 Leader and (R-1) Followers. Clients read and write exclusively to the Leader; followers replicate in the background to form the In-Sync Replicas (ISR) set.'
    },
    math: {
      formula: 'P_{\\text{total}} = \\sum_{i=1}^{N} P_i, \\quad \\text{MaxParallelism} \\le \\text{NumberOfPartitions}',
      timeComplexity: 'O(1) append to commit log',
      spaceComplexity: 'O(N \\times S) — lưu trữ tuần tự trên đĩa',
      throughputFormula: '\\text{Cluster Capacity} \\approx N_{\\text{brokers}} \\times \\text{NIC}_{bandwidth} \\times \\frac{1}{\\text{ReplicationFactor}}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Apache Kafka là một Distributed Event Streaming Platform được thiết kế xoay quanh Commit Log. Không giống như database quan hệ hay message queue truyền thống, Kafka coi dữ liệu là các dòng chảy sự kiện bất biến được ghi nối tiếp vào cuối log.',
      en: 'Apache Kafka is a distributed event streaming platform built entirely around immutable append-only commit logs. Rather than deleting data upon consumption, Kafka retains ordered partitions on disk for configurable retention periods.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Leader vs Follower Replicas & ISR (In-Sync Replicas): Với Replication Factor = 3, mỗi partition có 1 Leader Broker và 2 Follower Brokers. Chỉ có Leader phục vụ các yêu cầu đọc và ghi của Producer/Consumer. Các Follower đóng vai trò như các consumer nội bộ, gửi fetch request đến Leader để sao chép log. Nếu một Follower phản hồi kịp thời trong vòng replica.lag.time.max.ms (mặc định 30.000ms), nó được nằm trong danh sách ISR. Nếu Leader bị chết, KRaft Controller CHỈ BẦU CHỌN MỘT BROKER NẰM TRONG ISR LÀM LEADER MỚI.',
        en: 'Leader/Followers & In-Sync Replicas (ISR): With RF=3, each partition has 1 Leader and 2 Followers. The Leader serves all client reads and writes. Followers issue fetch requests to replicate logs. Followers that keep up within replica.lag.time.max.ms are kept in the ISR set. If the Leader crashes, the KRaft Controller strictly elects a new leader from the ISR set.'
      },
      {
        vi: 'Key-based Routing & Ordering Guarantee: Kafka bảo đảm thứ tự tuần tự tuyệt đối (Strict FIFO) TRONG PHẠM VI 1 PARTITION DUY NHẤT. Khi Producer gửi message có kèm Key (ví dụ: customer_id hoặc order_id), hàm băm mặc định MurmurHash2: hash(key) % totalPartitions sẽ luôn luôn gán tất cả message có cùng Key vào đúng một partition cố định. Nếu không có key (null key), Kafka dùng thuật toán Sticky Partitioner để gom batch vào các partition luân phiên.',
        en: 'Key-based Routing & Partition Ordering: Kafka guarantees strict ordering ONLY within a single partition. When messages carry a key, MurmurHash2: hash(key) % totalPartitions deterministically maps matching keys to the identical partition. Messages without keys leverage the Sticky Partitioner to optimize batching.'
      },
      {
        vi: 'Kiến trúc KRaft (Kafka Raft Metadata Mode): Kể từ Kafka 3.3+, Apache ZooKeeper đã được loại bỏ hoàn toàn. Các Broker bầu chọn một Quorum Controller sử dụng thuật toán đồng thuận Raft để quản lý metadata cụm, giảm thời gian phục hồi sau sự cố từ vài phút xuống vài trăm miligiây.',
        en: 'KRaft Consensus Mode: Kafka 3.3+ eliminated ZooKeeper in favor of native KRaft metadata consensus. Quorum controllers manage cluster state via Raft, reducing partition failover times from minutes to sub-seconds.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Tăng số lượng Partition khi đang chạy: Việc tăng số partition của một topic đang có dữ liệu sẽ làm thay đổi công thức hash(key) % newPartitions. Hậu quả: các message mới có cùng key sẽ bị chuyển sang partition khác, phá vỡ hoàn toàn cam kết thứ tự xử lý (Order Violation) của nghiệp vụ.',
        en: 'Altering Partition Counts on Active Topics: Increasing partitions modifies the hash(key) % partitionCount modulus. Subsequent events with the same key route to different partitions, silently breaking ordering invariants.'
      },
      {
        vi: 'Unclean Leader Election: Cấu hình unclean.leader.election.enable=true cho phép bầu một Follower KHÔNG NẰM TRONG ISR làm Leader khi toàn bộ ISR bị sập. Việc này giúp topic duy trì tính sẵn sàng (Availability) nhưng cái giá phải trả là MẤT MÁT DỮ LIỆU VĨNH VIỄN (Data Loss).',
        en: 'Unclean Leader Election: Setting unclean.leader.election.enable=true allows out-of-sync followers to become leader when the ISR dies. This favors availability over consistency, causing permanent silent data loss.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Tổ chức Cụm Kafka Cluster: 3 Brokers, 3 Partitions, Replication Factor = 2',
      en: 'Kafka Cluster Topology: 3 Brokers, 3 Partitions, Replication Factor = 2'
    },
    description: {
      vi: 'Sơ đồ phân bố Leader và Follower Replicas trên các node vật lý và cơ chế bầu cử khi Broker 1 sập.',
      en: 'Cluster layout illustrating partition leader/follower distribution across physical brokers and KRaft failover.'
    },
    asciiDiagram: `
KAFKA CLUSTER (3 Brokers, Topic: "orders", Partitions: 3, RF: 2)

[BROKER 1]                       [BROKER 2]                       [BROKER 3]
+-------------------------+      +-------------------------+      +-------------------------+
| Partition 0 [LEADER]    |      | Partition 0 [FOLLOWER]  |      | Partition 1 [LEADER]    |
| (Serves Reads/Writes)   |      | (ISR: Syncing Log...)   |      | (Serves Reads/Writes)   |
|                         |      |                         |      |                         |
| Partition 2 [FOLLOWER]  |      | Partition 2 [LEADER]    |      | Partition 1 [FOLLOWER]  |
+-------------------------+      +-------------------------+      +-------------------------+
      |
 (BROKER 1 DIES!)
      |
KRaft Controller detects timeout (session.timeout.ms)
  ---> Promotes Broker 2 (Partition 0 Follower in ISR) to NEW LEADER!
  ---> Zero Downtime, Client redirects socket to Broker 2!
`,
    components: [
      {
        name: 'Partition Leader',
        role: 'Read/Write Master',
        description: {
          vi: 'Node duy nhất tiếp nhận các lệnh Produce và Fetch từ client cho partition đó.',
          en: 'Exclusive replica serving all client read and write traffic for the partition.'
        }
      },
      {
        name: 'In-Sync Replicas (ISR)',
        role: 'High-Availability Pool',
        description: {
          vi: 'Danh sách các bản sao follower đang bắt kịp log của Leader trong ngưỡng thời gian lag tối đa.',
          en: 'The set of active replicas that are fully caught up with the leader’s log high-watermark.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Producer tính toán Partition theo Key', en: 'Producer hashes partition key' },
      phase: 'Client-side Partitioning',
      description: {
        vi: 'Producer gửi OrderEvent với key="CUST-9921". Hàm MurmurHash2 tính ra giá trị hash % 3 = Partition 1.',
        en: 'Producer sends event with key="CUST-9921". MurmurHash2 maps payload to Partition 1.'
      },
      brokerBehavior: {
        vi: 'Producer tra cứu Cluster Metadata Cache để biết Broker 3 đang là Leader của Partition 1.',
        en: 'Client metadata cache identifies Broker 3 as Partition 1 Leader.'
      },
      javaCodeLineMatch: 'kafkaTemplate.send("orders", customerId, orderEvent);'
    },
    {
      id: 'step-1',
      title: { vi: 'Leader ghi vào Disk Commit Log & OS Page Cache', en: 'Leader writes to commit log' },
      phase: 'Leader Append',
      description: {
        vi: 'Broker 3 nhận message, ghi tuần tự vào file log segment trên đĩa và cập nhật Offset lên 105.',
        en: 'Broker 3 appends record sequentially to disk segment file and increments offset to 105.'
      },
      brokerBehavior: {
        vi: 'Message nằm trong OS Page Cache, chưa thể xác nhận nếu cấu hình acks=all.',
        en: 'Record is cached; pending replication confirmation under acks=all.'
      },
      javaCodeLineMatch: 'RecordMetadata metadata = future.get();'
    },
    {
      id: 'step-2',
      title: { vi: 'Follower Replicas Fetch và sao chép Log', en: 'Followers fetch and replicate' },
      phase: 'Replication Synchronization',
      description: {
        vi: 'Broker 1 (Follower) gửi FetchRequest sang Broker 3, nhận byte dữ liệu và ghi vào bản sao của mình.',
        en: 'Broker 1 (Follower) fetches log bytes from Leader and commits to local replica.'
      },
      brokerBehavior: {
        vi: 'Khi Follower xác nhận đã sao chép, Leader nâng High-Watermark (HW) lên 105.',
        en: 'Leader advances High-Watermark (HW) to 105 upon follower acknowledgment.'
      },
      javaCodeLineMatch: 'min.insync.replicas=2'
    },
    {
      id: 'step-3',
      title: { vi: 'Broker Leader gửi ACK về cho Producer', en: 'Leader confirms ACK to Producer' },
      phase: 'Producer Commitment',
      description: {
        vi: 'Broker 3 gửi RecordMetadata (topic="orders", partition=1, offset=105) xác nhận an toàn tuyệt đối.',
        en: 'Broker 3 returns RecordMetadata with offset 105 confirming durable replication.'
      },
      brokerBehavior: {
        vi: 'Message chính thức hiển thị cho các Consumer đọc.',
        en: 'Record becomes visible to consumers past the High-Watermark line.'
      },
      javaCodeLineMatch: 'System.out.printf("Sent to partition %d with offset %d%n", p, offset);'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Queue tập trung, không phân mảnh log', en: 'Single-queue concurrency' },
      keyMechanism: {
        vi: 'RabbitMQ dùng Quorum Queues (dựa trên Raft) để sao chép dữ liệu giữa các node, nhưng toàn bộ queue vẫn xử lý logic trên 1 node leader.',
        en: 'Quorum queues use Raft for HA, but the queue logic remains bound to a single leader node.'
      },
      configExample: 'x-queue-type: quorum',
      architectureNote: {
        vi: 'Không thể mở rộng throughput bằng cách chia partition như Kafka; scale-out bằng cách tạo nhiều queue riêng biệt.',
        en: 'Cannot scale single queue throughput via sharded partitions; requires multiple independent queues.'
      }
    },
    kafka: {
      role: { vi: 'Phân mảnh ngang (Sharded Partitions) vô hạn', en: 'Horizontally sharded log partitions' },
      keyMechanism: {
        vi: 'Một topic có thể có 10, 50 hoặc 1.000 partition nằm rải rác trên hàng trăm máy chủ vật lý, thông lượng tăng tuyến tính.',
        en: 'Topics can span 10 to 1,000 partitions across hundreds of servers, scaling throughput linearly.'
      },
      configExample: 'num.partitions=16, default.replication.factor=3',
      architectureNote: {
        vi: 'Tiêu chuẩn vàng của ngành cho Big Data, Real-time Analytics và Event Streaming phân tán.',
        en: 'The gold standard for big data streaming, real-time analytics, and high-throughput events.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Thông lượng mở rộng theo chiều ngang (Horizontal Linear Scalability) không giới hạn.',
        en: 'Unbounded horizontal linear scalability by adding partitions and brokers.'
      },
      {
        vi: 'Khả năng chịu lỗi phần cứng (High Availability): 1 Broker sập không làm gián đoạn cụm.',
        en: 'Fault-tolerant: Single broker failures cause zero client downtime via ISR failover.'
      }
    ],
    cons: [
      {
        vi: 'Chỉ bảo đảm thứ tự tuần tự trong phạm vi 1 partition; không có bảo đảm thứ tự xuyên suốt toàn bộ topic.',
        en: 'Strict ordering is guaranteed per partition only; no cross-partition ordering guarantees.'
      },
      {
        vi: 'Quá nhiều partition (> 4.000 partition trên 1 broker) sẽ làm tăng thời gian phục hồi và tốn file descriptors.',
        en: 'Excessive partitions (> 4k per broker) slow down leader election failover times.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Kafka hy sinh độ trễ microsecond của memory queue để đổi lấy thông lượng triệu message/giây ghi tuần tự xuống đĩa.',
      en: 'Kafka trades sub-millisecond in-memory queue latency for millions-msg/sec sequential disk throughput.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm thứ tự tuần tự đơn điệu 100% cho mọi message có cùng Partition Key.',
      en: '100% deterministic sequential ordering for events bearing matching partition keys.'
    }
  },

  javaCode: `package com.enterprise.messaging.kafka;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import java.util.concurrent.CompletableFuture;

@Service
public class PartitionAwareOrderProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public PartitionAwareOrderProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public CompletableFuture<RecordMetadata> sendOrderEvent(String customerId, String orderJson) {
        // Strict ordering guarantee: All orders of 'customerId' route to the EXACT same partition!
        ProducerRecord<String, String> record = new ProducerRecord<>("orders-v1", customerId, orderJson);

        return kafkaTemplate.send(record)
            .thenApply(SendResult::getRecordMetadata)
            .whenComplete((meta, ex) -> {
                if (ex != null) {
                    System.err.printf("Failed to produce to partition for customer %s: %s%n",
                            customerId, ex.getMessage());
                } else {
                    System.out.printf("Durable commit! Topic: %s, Partition: %d, Offset: %d%n",
                            meta.topic(), meta.partition(), meta.offset());
                }
            });
    }
}`,

  springConfigCode: `spring:
  kafka:
    producer:
      acks: all # Wait for Leader AND all In-Sync Replicas to commit
      retries: 10
      properties:
        enable.idempotence: true
        max.in.flight.requests.per.connection: 5 # Safe with idempotence
        min.insync.replicas: 2`,

  interviewQuestions: [
    {
      question: {
        vi: 'ISR (In-Sync Replicas) trong Kafka là gì? Điều gì xảy ra khi số lượng replica trong ISR giảm xuống dưới ngưỡng min.insync.replicas?',
        en: 'What is the ISR (In-Sync Replicas) in Kafka? What happens if the ISR count drops below min.insync.replicas?'
      },
      answer: {
        vi: 'ISR là tập hợp các broker replica (bao gồm cả Leader) đang sao chép dữ liệu bắt kịp với Leader trong khoảng thời gian replica.lag.time.max.ms. Nếu một Follower bị chậm mạng hoặc sập, Leader sẽ đá nó ra khỏi ISR. Nếu số lượng broker trong ISR nhỏ hơn cấu hình min.insync.replicas (ví dụ cấu hình = 2 nhưng chỉ còn 1 broker sống), các lệnh Produce gửi lên với acks=all sẽ bị Broker TỪ CHỐI và ném ngoại lệ NotEnoughReplicasException. Điều này nhằm bảo vệ hệ thống không bị mất dữ liệu khi chỉ còn 1 node duy nhất.',
        en: 'The ISR is the set of replicas (including leader) caught up within replica.lag.time.max.ms. If a follower lags, the leader evicts it from the ISR. If the active ISR size drops below min.insync.replicas, subsequent produce requests configured with acks=all are rejected with NotEnoughReplicasException to prevent committing un-replicated data.'
      },
      seniority: 'Senior',
      trapWarning: {
        vi: 'Nhớ phân biệt: Producer gửi acks=1 thì vẫn ghi được vào Leader đơn lẻ, nhưng dữ liệu có nguy cơ mất nếu Leader sập trước khi sao chép.',
        en: 'Note: If producer uses acks=1, writes succeed to the lone leader, but risk total data loss on sudden leader crash.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố đảo lộn thứ tự đơn hàng khi tăng số lượng Partition trên Topic đang chạy',
      en: 'Out-of-Order Transaction Chaos Triggered by Dynamic Partition Expansion'
    },
    businessContext: {
      vi: 'Một sàn giao dịch chứng khoán sử Kafka để xử lý luồng đặt lệnh mua/bán (Order Matching Engine).',
      en: 'A stock trading platform used Kafka to pipeline buy and sell orders into matching engines.'
    },
    problemDescription: {
      vi: 'Topic "stock-orders" ban đầu có 6 partition, phân vùng theo stock_symbol (ví dụ: AAPL, TSLA). Khi lượng giao dịch tăng, một kỹ sư devops chạy lệnh tăng partition từ 6 lên 12. Ngay lập tức, mã AAPL (trước đó luôn vào Partition 2) bị hàm băm mới chuyển sang Partition 8. Hai lệnh "HỦY LỆNH" và "MUA 1.000 CỔ PHIẾU" của cùng một nhà đầu tư chạy trên 2 partition khác nhau, dẫn đến lệnh MUA bị khớp trước lệnh HỦY, gây thiệt hại 420.000 USD.',
      en: 'The topic started with 6 partitions keyed by stock_symbol. Under load, an operator dynamically increased partitions from 6 to 12. The MurmurHash modulus shifted: AAPL routed to Partition 8 instead of Partition 2. A "CANCEL" and subsequent "BUY" order executed concurrently on different partitions, executing the buy before the cancel, losing $420,000.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư cố gắng dùng custom consumer code để sắp xếp lại theo timestamp. Nhưng các message nằm ở hai partition khác nhau được xử lý bởi hai consumer thread độc lập, không có cách nào bảo đảm thứ tự thời gian thực mà không khóa toàn bộ hệ thống.',
      en: 'The team attempted to re-sort events in memory using timestamps, but independent consumer threads on separate partitions cannot reconstruct global order without blocking locks.'
    },
    coreSolution: {
      vi: '1. Không bao giờ tự ý tăng partition trên topic yêu cầu thứ tự nghiêm ngặt; 2. Triển khai kiến trúc Topic Versioning: Tạo topic mới "stock-orders-v2" với 12 partition, chờ consumer xử lý cạn kiệt (Drain) toàn bộ message trên v1 rồi mới chuyển Producer sang v2; 3. Sử dụng Custom Partitioner kiểm soát phân vùng độc lập với số lượng partition.',
      en: '1. Never dynamically expand partitions on order-sensitive topics; 2. Enforce Topic Versioning: provision "stock-orders-v2" with 12 partitions, drain v1 completely, and cut traffic over; 3. Implement Custom Partitioners decoupled from raw partition modulus.'
    },
    productionCode: `public class StockSymbolCustomPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes, Object value, byte[] valueBytes, Cluster cluster) {
        int numPartitions = cluster.partitionsForTopic(topic).size();
        // Fixed deterministic virtual shard mapping
        int virtualBucket = Math.abs(key.hashCode() % 1024);
        return (virtualBucket * numPartitions) / 1024;
    }
}`,
    architectureImpact: {
      vi: 'Bảo đảm 100% thứ tự khớp lệnh cho từng mã cổ phiếu; loại bỏ hoàn toàn tình trạng giao dịch sai lệch; xây dựng quy trình chuẩn khi nâng cấp partition cụm.',
      en: '100% order execution guarantee per stock ticker; eliminated trade discrepancies; formalized zero-loss partition migration SOP.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
