import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const kafkaProducerBatchingReliabilityTopic: MessagingTopic = {
  id: 'kafka-producer-batching-reliability',
  category: 'kafka-streaming',
  level: 'core',
  chapter: 'Chương 03 — Apache Kafka Architecture',
  name: 'Kafka Producer: Batching, Compression & Reliability',
  tagline: {
    vi: 'Tối ưu hóa Producer Batching qua batch.size, linger.ms, thuật toán nén lz4/zstd, acks=all và Idempotent Producer.',
    en: 'Optimizing Producer Batching via batch.size, linger.ms, lz4/zstd compression, acks=all, and Idempotent Producers.'
  },
  difficulty: 2,
  order: 8,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Nếu Producer gửi từng message đơn lẻ qua mạng (Single Message Publish), mỗi message phải chịu chi phí đóng gói TCP header (40 bytes), chi phí CPU cho socket syscall và bắt tay xác nhận ACK từ broker. Một hệ thống gửi 100.000 msg/s sẽ phát sinh 100.000 network round-trips/s, làm nghẽn card mạng NIC và bóp nghẹt throughput.',
      en: 'Publishing messages individually forces every single event to incur TCP header overhead (40 bytes), OS socket syscall latency, and broker acknowledgment round-trips. Emitting 100k events/s produces 100k network round-trips, saturating NIC bandwidth and crippling throughput.'
    },
    hardwareConstraint: {
      vi: 'Băng thông mạng (Network I/O) và thời gian ngắt CPU (Interrupt overhead) bị suy giảm nghiêm trọng khi xử lý hàng ngàn gói tin kích thước nhỏ (Small Packet Problem). Ngược lại, nén và gom batch lớn giúp tận dụng tối đa kích thước MTU (1.500 bytes hoặc Jumbo Frames 9.000 bytes).',
      en: 'NIC packet-per-second (PPS) limits and CPU interrupt handling degrade under small-packet floods. Batching and compression maximize Ethernet MTU frame utilization (1,500 bytes or 9,000 Jumbo Frames).'
    },
    fundamentalSolution: {
      vi: 'Kafka Java Producer sử dụng bộ nhớ đệm hai tầng RecordAccumulator: Các message gửi đến cùng một Partition được gom vào một RecordBatch trong RAM. Producer chờ tối đa linger.ms (ví dụ 10ms) hoặc khi kích thước batch đạt batch.size (ví dụ 64KB - 128KB). Toàn bộ batch được nén (lz4 hoặc zstd) rồi gửi trong 1 request mạng duy nhất tới Broker. Broker lưu thẳng batch nén xuống đĩa mà không cần giải nén.',
      en: 'The Kafka Java Producer utilizes an in-memory RecordAccumulator. Records targeting the same partition accumulate into a RecordBatch until either linger.ms expires or batch.size (64KB-128KB) is reached. The batch is compressed (lz4/zstd) and dispatched in a single socket write. The broker writes the compressed batch to disk as-is.'
    },
    math: {
      formula: '\\text{Throughput} = \\frac{\\text{BatchSize}}{\\text{Latency}_{RTT} + \\text{linger.ms}}, \\quad \\text{Compression Ratio} = \\frac{\\text{Raw Size}}{\\text{Compressed Size}}',
      timeComplexity: 'O(1) append to batch buffer',
      spaceComplexity: 'O(\\text{buffer.memory}) — mặc định 32MB RAM',
      throughputFormula: '\\text{Network Requests} = \\frac{\\text{Total Messages}}{\\text{Average Records Per Batch}} \\quad (\\text{giảm đến 98\\%} \\text{ số request})'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Hiệu năng kỷ lục của Kafka (hàng triệu message/giây) phần lớn được tạo ra tại client Producer thông qua cơ chế Batching thông minh, thuật toán nén vi sai và bộ đệm bộ nhớ phi khóa (Lock-free Memory Pool).',
      en: 'Kafka’s industry-leading throughput is predominantly engineered on the client producer through asynchronous batching buffers, zero-copy wire protocols, and lock-free memory pools.'
    },
    deepDiveParagraphs: [
      {
        vi: 'batch.size vs linger.ms: batch.size quy định kích thước tối đa của một lô (mặc định 16KB; môi trường tải cao nên đặt 64KB - 128KB). linger.ms là thời gian tối đa Producer cố tình chờ (mặc định 0ms; nên đặt 5 - 20ms) để cho phép nhiều message kịp đến gom chung vào lô. Chỉ cần chờ 5ms, thông lượng có thể tăng gấp 10 lần mà độ trễ của người dùng hầu như không cảm nhận thấy.',
        en: 'batch.size vs linger.ms: batch.size dictates maximum batch byte threshold (default 16KB; 64-128KB recommended for production). linger.ms is artificial latency delay (default 0ms; 5-20ms recommended) permitting records to accumulate. Adding a mere 5ms delay can boost throughput 10x with zero perceivable user latency impact.'
      },
      {
        vi: 'Thuật toán nén (Compression): snappy và lz4 được tối ưu hóa cho tốc độ CPU cao nhất, cân bằng hoàn hảo giữa tỷ lệ nén và thông lượng. zstd (do Meta phát triển) cung cấp tỷ lệ nén cao hơn 30% so với gzip mà vẫn nhanh hơn gzip rất nhiều. Đặc biệt: KAFKA KHÔNG GIẢI NÉN TẠI BROKER. Dữ liệu nén được chuyển thẳng từ OS Page Cache của broker xuống card mạng qua zero-copy sendfile() sang cho Consumer giải nén.',
        en: 'Compression Algorithms: snappy and lz4 optimize for extreme CPU speed with good compression ratios. zstd (by Meta) delivers 30% superior compression than gzip with vastly faster compute. Crucially: BROKERS NEVER DECOMPRESS PAYLOADS. Compressed bytes pass directly via zero-copy sendfile() to consumers.'
      },
      {
        vi: 'Cấp độ bảo đảm acks (Durability Tier): acks=0: Producer bắn gói tin rồi quên luôn (Fire and Forget - thông lượng cao nhất, nguy cơ mất dữ liệu cao); acks=1: Chờ Leader ghi nhận vào đĩa/RAM; acks=all (hoặc acks=-1): Chờ Leader VÀ TOÀN BỘ In-Sync Replicas xác nhận. Kể từ Kafka 3.0, acks=all và enable.idempotence=true là mặc định!',
        en: 'Acks Durability Tiers: acks=0 fire-and-forget (maximum speed, zero durability); acks=1 confirms leader write; acks=all (acks=-1) confirms leader and ALL in-sync replicas commit. Since Kafka 3.0, acks=all and enable.idempotence=true are enabled by default!'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Để linger.ms = 0 mặc định trong production: Khi để linger.ms = 0, batching hầu như không có tác dụng trừ khi tải đạt đỉnh cực đại, khiến số lượng request mạng cao gấp hàng trăm lần cần thiết.',
        en: 'Leaving linger.ms = 0 in Production: Without a small artificial linger buffer (5-10ms), batches fail to accumulate, flooding brokers with thousands of single-record network packets.'
      },
      {
        vi: 'Không bật enable.idempotence khi retries > 0: Nếu Producer retry khi gặp lỗi mạng tạm thời mà không có Idempotence, broker sẽ nhận cùng một message hai lần và ghi đè hai offset liên tiếp vào log.',
        en: 'Retrying Without Idempotence: Setting retries > 0 without enable.idempotence causes brokers to append duplicate records on transient network retries.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Kiến trúc RecordAccumulator: Gom Batch trong RAM & Nén Zero-Copy',
      en: 'RecordAccumulator Memory Pool & Zero-Copy Batch Transmission'
    },
    description: {
      vi: 'Sơ đồ luồng thu gom bản tin từ nhiều thread ứng dụng vào các partition batch trước khi gửi qua mạng.',
      en: 'Architectural schematic of producer multi-threaded buffer pooling into compressed partition batches.'
    },
    asciiDiagram: `
[APP THREAD 1] ---> send("orders", p0, data1) \\
[APP THREAD 2] ---> send("orders", p1, data2) ===> [ RECORD ACCUMULATOR MEMORY POOL: 32MB ]
[APP THREAD 3] ---> send("orders", p0, data3) /     |
                                                    +---> Partition 0 Batch: [Rec1, Rec3, ...] (64KB)
                                                    +---> Partition 1 Batch: [Rec2, ...]       (Wait linger 10ms)
                                                           |
                                                (Apply LZ4 Compression)
                                                           |
                                               [ SENDER NETWORK I/O THREAD ]
                                                           |
                                                (1 Single TCP Socket Packet)
                                                           |
                                                           v
                                              [ KAFKA BROKER LEADER ]
                                            (Stores compressed batch on disk)
`,
    components: [
      {
        name: 'RecordAccumulator',
        role: 'In-Memory Buffer Pool',
        description: {
          vi: 'Quản lý các ByteBuffer có kích thước cố định để tránh cấp phát bộ nhớ rác (GC Allocation Free).',
          en: 'Pre-allocates fixed-size ByteBuffers to eliminate JVM garbage collection churn.'
        }
      },
      {
        name: 'Sender Thread',
        role: 'Background I/O Multiplexer',
        description: {
          vi: 'Luồng ngầm độc lập chịu trách nhiệm lấy các batch đã sẵn sàng và gửi qua socket NIO.',
          en: 'Dedicated background daemon thread multiplexing ready batches across NIO channels.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Thread ứng dụng gọi kafkaTemplate.send()', en: 'App thread invokes send()' },
      phase: 'Producer Invocation',
      description: {
        vi: 'Serializing dữ liệu sang mảng byte nhị phân, Partitioner tính toán partition đích.',
        en: 'Serializes payload to bytes, Partitioner resolves target partition.'
      },
      brokerBehavior: {
        vi: 'Hoạt động 100% tại RAM của client, broker chưa nhận dữ liệu.',
        en: 'Local client-side execution; broker remains idle.'
      },
      javaCodeLineMatch: 'CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topic, key, value);'
    },
    {
      id: 'step-1',
      title: { vi: 'Gom message vào RecordAccumulator', en: 'Append to RecordAccumulator' },
      phase: 'Batch Accumulation',
      description: {
        vi: 'Message được nối vào batch hiện tại của Partition. Đồng hồ đếm ngược linger.ms (10ms) bắt đầu chạy.',
        en: 'Record appends to target partition batch; linger.ms countdown activates.'
      },
      brokerBehavior: {
        vi: 'Client tích lũy các message tiếp theo vào cùng batch.',
        en: 'Client pools subsequent records into the same batch container.'
      },
      javaCodeLineMatch: 'producerProps.put(ProducerConfig.LINGER_MS_CONFIG, 10);'
    },
    {
      id: 'step-2',
      title: { vi: 'Nén LZ4 và Gửi gói tin mạng duy nhất', en: 'LZ4 Compression & Single Dispatch' },
      phase: 'Batch Dispatch',
      description: {
        vi: 'Batch đạt 64KB hoặc hết 10ms: Sender Thread nén toàn bộ 150 message bằng thuật toán LZ4 và gửi 1 request TCP duy nhất.',
        en: 'Threshold reached: Sender thread compresses 150 records via LZ4 into 1 TCP packet.'
      },
      brokerBehavior: {
        vi: 'Broker nhận 1 gói tin lớn, xử lý 1 lần duy nhất thay vì 150 lần ngắt I/O.',
        en: 'Broker ingests 1 aggregated batch, executing a single sequential disk write.'
      },
      javaCodeLineMatch: 'producerProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");'
    },
    {
      id: 'step-3',
      title: { vi: 'Broker xác nhận an toàn (acks=all)', en: 'Replication ACK Confirmed' },
      phase: 'Commit & Callback',
      description: {
        vi: 'Leader và In-Sync Replicas commit xong, broker gửi ACK. Callback của Producer hoàn tất trả về RecordMetadata.',
        en: 'ISR replicas commit; broker returns ACK. Producer callback resolves CompletableFuture.'
      },
      brokerBehavior: {
        vi: 'Tất cả 150 message trong batch được nâng High-Watermark cùng một lúc.',
        en: 'High-Watermark advances across all 150 records atomically.'
      },
      javaCodeLineMatch: 'producerProps.put(ProducerConfig.ACKS_CONFIG, "all");'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Tối ưu hóa từng bản tin riêng rẽ', en: 'Per-message fine-grained delivery' },
      keyMechanism: {
        vi: 'RabbitMQ gửi message ngay lập tức khi Producer gọi basicPublish. Không có cơ chế gom batch trì hoãn (linger) native như Kafka.',
        en: 'RabbitMQ dispatches messages immediately upon basicPublish without artificial linger batch buffers.'
      },
      configExample: 'channel.confirmSelect();',
      architectureNote: {
        vi: 'Latency từng message cực thấp (< 1ms), nhưng throughput tối đa bị giới hạn quanh mức 40.000 - 80.000 msg/s.',
        en: 'Ultra-low single-message latency (< 1ms), but capped at 40k-80k msg/s throughput.'
      }
    },
    kafka: {
      role: { vi: 'Cỗ máy tối ưu hóa Batching và Throughput', en: 'High-throughput batching powerhouse' },
      keyMechanism: {
        vi: 'Xây dựng từ đầu cho mô hình Batching: nén dữ liệu tại Producer, ghi nén xuống đĩa và truyền nén qua zero-copy.',
        en: 'Engineered for batching: compresses at producer, writes compressed to disk, transfers via zero-copy.'
      },
      configExample: 'batch.size=65536, linger.ms=10, compression.type=lz4',
      architectureNote: {
        vi: 'Throughput đạt hàng triệu message/giây trên phần cứng thông thường; latency P99 ổn định ở mức 5 - 15ms.',
        en: 'Achieves millions msg/s throughput on commodity hardware with 5-15ms P99 latency.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Tăng throughput lên 10x - 50x nhờ giảm 98% số lượng request mạng và syscall CPU.',
        en: '10x-50x throughput gain by eliminating 98% of socket syscalls and network round-trips.'
      },
      {
        vi: 'Tiết kiệm 50% - 70% dung lượng đĩa cứng và băng thông mạng nhờ thuật toán nén LZ4/ZSTD.',
        en: '50%-70% disk storage and network bandwidth savings via LZ4/ZSTD compression.'
      }
    ],
    cons: [
      {
        vi: 'Thêm một khoảng trễ nhỏ (bằng linger.ms, ví dụ 10ms) trước khi message được gửi đi.',
        en: 'Adds slight artificial latency (equal to linger.ms) before network transmission.'
      },
      {
        vi: 'Tiêu tốn CPU của máy client Producer để thực hiện nén dữ liệu.',
        en: 'Consumes client-side Producer CPU for payload compression algorithms.'
      }
    ],
    latencyVsThroughput: {
      vi: 'linger.ms = 0: Latency cực thấp, Throughput thấp; linger.ms = 10ms: Throughput tăng 1.000%, Latency tăng đúng 10ms.',
      en: 'linger.ms = 0 maximizes instant latency at low throughput; linger.ms = 10ms yields 1,000% higher throughput.'
    },
    orderingGuarantee: {
      vi: 'Khi bật enable.idempotence=true, Kafka bảo đảm thứ tự nghiêm ngặt ngay cả khi max.in.flight.requests.per.connection lên tới 5.',
      en: 'With enable.idempotence=true, strict in-partition ordering is maintained up to 5 in-flight requests.'
    }
  },

  javaCode: `package com.enterprise.messaging.producer;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class HighThroughputProducerConfig {

    @Bean
    public ProducerFactory<String, String> highThroughputFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-broker-1:9092,kafka-broker-2:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);

        // 1. Reliability Settings: Zero Data Loss
        props.put(ProducerConfig.ACKS_CONFIG, "all"); // Wait for ISR quorum
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // Deduplication & order guard
        props.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

        // 2. High-Throughput Batching Tuning
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 64 * 1024); // 64 KB batch size
        props.put(ProducerConfig.LINGER_MS_CONFIG, 10);         // Wait up to 10ms to pool records
        props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4"); // Fast compression algorithm
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 64 * 1024 * 1024L); // 64 MB client memory pool

        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, String> highThroughputKafkaTemplate(ProducerFactory<String, String> pf) {
        return new KafkaTemplate<>(pf);
    }
}`,

  springConfigCode: `spring:
  kafka:
    producer:
      acks: all
      batch-size: 65536 # 64 KB
      properties:
        linger.ms: 10
        compression.type: lz4
        enable.idempotence: true
        buffer.memory: 67108864 # 64 MB`,

  interviewQuestions: [
    {
      question: {
        vi: 'Tại sao bật enable.idempotence=true trong Kafka lại bảo vệ được thứ tự bản tin khi max.in.flight.requests.per.connection > 1?',
        en: 'How does enable.idempotence=true protect message ordering in Kafka even when max.in.flight.requests.per.connection > 1?'
      },
      answer: {
        vi: 'Nếu không có Idempotence, giả sử Producer gửi đồng thời Batch 1 và Batch 2. Nếu Batch 1 bị rớt mạng và phải retry trong khi Batch 2 gửi thành công trước, thứ tự trên broker sẽ bị đảo lộn thành Batch 2 -> Batch 1. Khi bật enable.idempotence=true: 1. Producer được cấp một Producer ID (PID); 2. Mỗi batch được gắn một Sequence Number tăng đơn điệu (0, 1, 2...); 3. Broker chỉ chấp nhận ghi message nếu Sequence Number nhận được chính xác bằng (Sequence Number cũ + 1). Nếu Batch 2 đến trước, broker sẽ tạm giữ và chỉ commit khi Batch 1 retry thành công, bảo toàn 100% thứ tự.',
        en: 'Without idempotence, if Batch 1 fails and retries while in-flight Batch 2 succeeds, order reverses to Batch 2 -> Batch 1. With enable.idempotence=true: 1. Producer receives a PID; 2. Each record gets a monotonic Sequence Number; 3. The broker strictly rejects or buffers records unless incoming Sequence Number == Last Committed + 1. If Batch 2 arrives early, the broker waits until Batch 1 retries successfully, preserving 100% ordering.'
      },
      seniority: 'Senior'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố nghẽn mạng băng thông do không nén dữ liệu telemetry IoT 800.000 msg/s',
      en: 'Network Saturation and High AWS Egress Bills Caused by Uncompressed IoT Stream'
    },
    businessContext: {
      vi: 'Hệ thống giám sát phương tiện vận tải thu thập dữ liệu GPS và cảm biến động cơ từ 300.000 xe tải trên toàn quốc.',
      en: 'A connected vehicle logistics platform streaming telemetry and GPS coordinates from 300,000 trucks.'
    },
    problemDescription: {
      vi: 'Mỗi payload telemetry là JSON kích thước 1.2KB. Với lưu lượng 800.000 msg/s, băng thông mạng ingress vào Kafka cluster đạt gần 1.000 MB/s (8 Gbps), chạm ngưỡng tối đa card mạng AWS EC2. Hơn nữa, chi phí lưu trữ EBS SSD phình to thêm 80TB mỗi tuần, tiêu tốn ngân sách khổng lồ.',
      en: 'Each telemetry payload was 1.2KB uncompressed JSON. At 800,000 msg/s, ingress bandwidth hit 1,000 MB/s (8 Gbps), maxing out AWS EC2 NIC limits. Storage expanded by 80TB weekly, inflating cloud EBS storage bills.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư định nâng cấp instance EC2 lên loại 100Gbps. Chi phí hạ tầng tăng gấp 4 lần nhưng không giải quyết được căn nguyên vấn đề lãng phí băng thông.',
      en: 'Engineers proposed upgrading to 100Gbps EC2 instances, quadrupling cloud spend without solving the underlying payload bloat.'
    },
    coreSolution: {
      vi: '1. Cấu hình Producer: batch.size = 128KB, linger.ms = 15ms; 2. Kích hoạt thuật toán nén zstd (Zstandard do Meta phát triển). Do các trường telemetry trong JSON có cấu trúc lặp lại rất cao, thuật toán zstd đạt tỷ lệ nén lên tới 78%.',
      en: '1. Configured batch.size = 128KB and linger.ms = 15ms; 2. Enabled zstd compression. Due to repetitive JSON keys, zstd achieved an extraordinary 78% compression ratio.'
    },
    productionCode: `// Production Tuning: 78% Bandwidth & Storage Reduction
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 128 * 1024);
props.put(ProducerConfig.LINGER_MS_CONFIG, 15);
props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "zstd");`,
    architectureImpact: {
      vi: 'Băng thông mạng giảm từ 8 Gbps xuống 1.7 Gbps (tiết kiệm 78%); dung lượng đĩa lưu trữ giảm từ 80TB xuống 17TB/tuần; chi phí hạ tầng AWS giảm 65.000 USD/tháng.',
      en: 'Network ingress dropped from 8 Gbps to 1.7 Gbps (78% drop); storage accumulation dropped from 80TB to 17TB/week; AWS monthly bill decreased by $65,000.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
