import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const distributedDisasterRecoveryMirrormakerTopic: MessagingTopic = {
  id: 'distributed-disaster-recovery-mirrormaker',
  category: 'advanced-streaming',
  level: 'advanced',
  chapter: 'Chuyên Đề Nâng Cao — Advanced Distributed Streaming',
  name: 'Multi-DC Disaster Recovery & Kafka MirrorMaker 2',
  tagline: {
    vi: 'Thiết kế hệ thống dự phòng thảm họa Active-Passive, Active-Active, sao chép liên trung tâm dữ liệu với Kafka MirrorMaker 2 và offset translation.',
    en: 'Designing Active-Passive & Active-Active disaster recovery topologies, cross-datacenter replication via MirrorMaker 2, and offset translation.'
  },
  difficulty: 3,
  order: 17,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Khi một Trung tâm Dữ liệu (Data Center - DC) chính (Primary DC) bị mất điện toàn phần, động đất hoặc đứt cáp quang biển, toàn bộ cụm Message Broker cục bộ ngừng hoạt động. Nếu không có cơ chế sao chép liên trung tâm dữ liệu (Cross-DC Replication), toàn bộ doanh nghiệp bị tê liệt và mất mát dữ liệu chưa kịp xử lý.',
      en: 'When a primary datacenter suffers total blackout or network partition, local broker clusters go dark. Without cross-datacenter replication, the enterprise goes offline and un-replicated records are permanently lost.'
    },
    hardwareConstraint: {
      vi: 'Độ trễ truyền mạng qua cáp quang liên vùng (Cross-Region WAN) từ 30ms đến 150ms và băng thông mạng WAN đắt đỏ hơn 100 lần so với mạng LAN nội bộ. Việc chạy một cụm cluster đồng bộ kéo dài (Stretched Cluster) qua WAN sẽ làm tăng latency ghi lên hàng trăm miligiây, không thể chấp nhận được trong production.',
      en: 'Cross-region WAN latency ranges from 30ms to 150ms. Synchronous stretched clusters spanning datacenters throttle write latency by hundreds of milliseconds, crippling transaction pipelines.'
    },
    fundamentalSolution: {
      vi: 'Áp dụng sao chép bất đồng bộ liên cụm (Asynchronous Geo-Replication) với Kafka MirrorMaker 2 (MM2 dựa trên Kafka Connect framework): Cụm DC-1 (Primary) nhận ghi cục bộ siêu tốc (< 5ms). MirrorMaker 2 chạy ngầm liên tục sao chép dữ liệu và cấu hình topic sang Cụm DC-2 (Disaster Recovery). MM2 tự động chuyển đổi và đồng bộ Offset (Offset Translation) qua topic internal checkpointing, cho phép Consumer failover sang DC-2 mà không bị đọc lại từ đầu.',
      en: 'Adopt Asynchronous Geo-Replication via Kafka MirrorMaker 2 (MM2 on Kafka Connect): DC-1 (Primary) serves ultra-low latency local writes (< 5ms). MM2 asynchronously replicates topic data and metadata to DC-2 (DR). MM2 executes automated Offset Translation via internal checkpoint topics, allowing consumers to failover to DC-2 seamlessly without re-consuming entire histories.'
    },
    math: {
      formula: '\\text{RPO} \\approx \\text{Replication Lag}_{WAN}, \\quad \\text{RTO} \\approx \\text{Detection Time} + \\text{DNS/Traffic Cutover}',
      timeComplexity: 'O(1) async cross-datacenter stream pipe',
      spaceComplexity: 'O(\\text{Replicated Topics})',
      throughputFormula: '\\text{WAN Egress} = \\text{Ingress Throughput} \\times (1 - \\text{Compression Savings})'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Thiết kế Disaster Recovery (DR) cho hệ sinh thái messaging đòi hỏi tính toán kỹ hai chỉ số sống còn: RPO (Recovery Point Objective - Lượng dữ liệu chấp nhận mất khi có sự cố) và RTO (Recovery Time Objective - Thời gian hệ thống phục hồi lại trạng thái hoạt động).',
      en: 'Disaster Recovery design in distributed messaging pivots around two non-negotiable SLAs: RPO (acceptable data loss duration) and RTO (duration required to restore operational availability).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Mô hình Active-Passive vs Active-Active: Active-Passive: Producer chỉ ghi vào DC-1, DC-2 chỉ làm nhiệm vụ sao lưu sẵn sàng chuyển giao khi DC-1 chết. Đơn giản, không bị xung đột dữ liệu. Active-Active: Cả hai DC đều tiếp nhận ghi đồng thời. Đòi hỏi namespace topic riêng biệt (ví dụ: dc1.orders và dc2.orders) để chống vòng lặp sao chép vô hạn (Replication Loop).',
        en: 'Active-Passive vs Active-Active: Active-Passive routes all writes to DC-1, replicating to DC-2 purely as a hot failover target (zero conflicts). Active-Active accepts writes across both DCs concurrently, requiring remote topic prefixes (dc1.orders vs dc2.orders) to prevent infinite circular replication loops.'
      },
      {
        vi: 'Offset Translation trong MirrorMaker 2: Do mỗi cụm Kafka sinh offset độc lập, offset của một message trên DC-1 KHÔNG BAO GIỜ trùng với offset của nó trên DC-2. MirrorMaker 2 liên tục ghi nhận bảng ánh xạ offset vào topic "mm2-checkpoints". Khi failover, Kafka Consumer dùng RemoteClusterUtils để dịch offset hiện tại sang offset tương ứng trên DC-2.',
        en: 'Offset Translation in MirrorMaker 2: Because clusters assign offsets independently, a record’s offset in DC-1 rarely matches its offset in DC-2. MM2 continuously emits mapping checkpoints into "mm2-checkpoints". During failover, client consumers invoke RemoteClusterUtils to translate offsets before resuming.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Chạy Stretched Cluster qua WAN công cộng: Cố gắng cấu hình 1 cụm Kafka duy nhất với 3 broker ở 3 quốc gia khác nhau. Rớt gói tin và jitter mạng WAN sẽ khiến cụm liên tục bị rebalance và mất leader election.',
        en: 'Stretched Clusters over Public WAN: Spanning a single Kafka cluster across multiple cloud regions causes WAN packet jitter to trigger non-stop controller rebalances and leader election freezes.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cấu trúc Dự phòng Thảm họa Active-Passive: DC Primary -> MirrorMaker 2 -> DC DR',
      en: 'Active-Passive Disaster Recovery Topology via MirrorMaker 2'
    },
    description: {
      vi: 'Sơ đồ luồng sao chép bất đồng bộ qua mạng WAN liên vùng với tự động dịch chuyển Offset.',
      en: 'Physical diagram showing cross-region asynchronous replication and consumer offset checkpointing.'
    },
    asciiDiagram: `
[US-EAST (PRIMARY DC-1)]                          [US-WEST (DISASTER RECOVERY DC-2)]
+---------------------------+                      +---------------------------+
| Orders Producer           |                      | Backup Standby Consumers  |
|          |                |                      |          ^                |
|          v                |                      |          |                |
| [KAFKA PRIMARY CLUSTER]   |                      | [KAFKA DR CLUSTER]        |
| Topic: "orders-v1"        |                      | Topic: "us-east.orders-v1"|
+---------------------------+                      +---------------------------+
              |                                                  ^
              +====(WAN Latency 40ms: MirrorMaker 2 Engine)======+
                    - Replicates Topic Segments
                    - Replicates Consumer Group Offsets
                    - Syncs Topic Configurations & ACLs
`,
    components: [
      {
        name: 'MirrorMaker 2 Driver',
        role: 'Distributed Replication Pipeline',
        description: {
          vi: 'Cụm Kafka Connect chạy các connector: MirrorSourceConnector, MirrorCheckpointConnector, MirrorHeartbeatConnector.',
          en: 'Distributed Kafka Connect cluster driving Source, Checkpoint, and Heartbeat replication connectors.'
        }
      },
      {
        name: 'Checkpoint Offset Store',
        role: 'Offset Translation Map',
        description: {
          vi: 'Bảng tra cứu ánh xạ offset giúp Consumer tiếp tục đọc đúng vị trí tại DC mới mà không bị lặp.',
          en: 'Bi-directional translation table aligning consumer group offsets across cluster boundaries.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Producer ghi dữ liệu tại Primary DC-1', en: 'Producer commits in Primary DC-1' },
      phase: 'Local Production',
      description: {
        vi: 'OrderService ghi đơn hàng vào DC-1, nhận ACK cục bộ trong 3ms.',
        en: 'OrderService writes to Primary DC-1, receiving local acknowledgment in 3ms.'
      },
      brokerBehavior: {
        vi: 'Dữ liệu được lưu trong partition log của DC-1.',
        en: 'Records commit to local DC-1 partition logs.'
      },
      javaCodeLineMatch: 'kafkaTemplate.send("orders-v1", orderId, payload);'
    },
    {
      id: 'step-1',
      title: { vi: 'MirrorMaker 2 sao chép dữ liệu qua WAN', en: 'MirrorMaker 2 streams over WAN' },
      phase: 'Cross-DC Streaming',
      description: {
        vi: 'MirrorSourceConnector đọc batch từ DC-1 và đẩy sang topic "us-east.orders-v1" trên DC-2.',
        en: 'MirrorSourceConnector replicates batches asynchronously across WAN to DC-2.'
      },
      brokerBehavior: {
        vi: 'Độ trễ replication lag dao động từ 100ms - 300ms.',
        en: 'Replication lag stabilizes between 100ms and 300ms.'
      },
      javaCodeLineMatch: 'clusters = primary, backup; primary->backup.enabled = true'
    },
    {
      id: 'step-2',
      title: { vi: 'DC-1 bị thảm họa -> Kích hoạt Failover sang DC-2', en: 'Primary DC fails -> Failover activated' },
      phase: 'Disaster Failover',
      description: {
        vi: 'SRE phát hiện DC-1 sập, chuyển DNS sang DC-2. Consumer dùng translateOffsets() để tiếp tục tiêu thụ.',
        en: 'SRE triggers failover to DC-2. Consumers translate committed offsets and resume stream processing.'
      },
      brokerBehavior: {
        vi: 'DC-2 đảm nhận toàn bộ vai trò sản xuất; RPO < 1 giây, RTO < 3 phút.',
        en: 'DC-2 assumes primary traffic with RPO < 1s and RTO < 3 minutes.'
      },
      javaCodeLineMatch: 'RemoteClusterUtils.translateOffsets(backupConfig, "primary", "order-group", Duration.ofSeconds(10));'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'RabbitMQ Federation & Shovel', en: 'RabbitMQ Federation & Shovel' },
      keyMechanism: {
        vi: 'RabbitMQ dùng Federation Plugin hoặc Dynamic Shovel để chuyển tiếp message qua WAN giữa các cụm broker độc lập.',
        en: 'Uses Federation plugins or Shovels to unidirectionally ferry messages across WAN boundaries.'
      },
      configExample: 'rabbitmq-plugins enable rabbitmq_federation',
      architectureNote: {
        vi: 'Lý tưởng cho mô hình Hub-and-Spoke phân tán chi nhánh địa lý.',
        en: 'Optimal for geographic hub-and-spoke branch office architectures.'
      }
    },
    kafka: {
      role: { vi: 'Kafka MirrorMaker 2 (Chuẩn doanh nghiệp cho Big Data DR)', en: 'Kafka MirrorMaker 2 (Enterprise Standard)' },
      keyMechanism: {
        vi: 'MirrorMaker 2 sao chép toàn diện: Data, Metadata, ACLs và Offset Translation chính xác tuyệt đối.',
        en: 'End-to-end multi-cluster replication: data, partition metadata, ACLs, and offset checkpoints.'
      },
      configExample: 'emit.checkpoints.interval.seconds=5',
      architectureNote: {
        vi: 'Khả năng sao chép hàng Gigabyte/giây qua mạng cáp quang quốc tế ổn định.',
        en: 'Capable of sustaining gigabytes/sec geo-replication across international backbones.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Bảo vệ toàn vẹn hoạt động kinh doanh 24/7 ngay cả khi một trung tâm dữ liệu bị phá hủy hoàn toàn.',
        en: 'Guarantees continuous 24/7 business survival against total regional datacenter destruction.'
      },
      {
        vi: 'Sao chép bất đồng bộ giữ nguyên tốc độ ghi cực nhanh (< 5ms) tại DC chính.',
        en: 'Asynchronous replication preserves sub-5ms local write performance.'
      }
    ],
    cons: [
      {
        vi: 'RPO > 0 (chấp nhận một lượng nhỏ dữ liệu nằm trong độ trễ replication lag bị mất khi DC1 sập đột ngột).',
        en: 'RPO > 0 (un-replicated in-flight records within the WAN lag window risk loss during sudden blackouts).'
      },
      {
        vi: 'Chi phí hạ tầng máy chủ và băng thông truyền dữ liệu liên vùng (Egress Costs) cao gấp đôi.',
        en: 'Doubles infrastructure hosting costs and incurs high cross-region cloud egress bandwidth fees.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Sao chép bất đồng bộ không làm chậm Producer chính; Throughput sao chép phụ thuộc vào băng thông WAN.',
      en: 'Asynchronous replication introduces zero producer drag; WAN bandwidth bounds sync throughput.'
    },
    orderingGuarantee: {
      vi: 'Bảo toàn thứ tự nghiêm ngặt của từng partition khi sao chép sang cụm đích.',
      en: 'Preserves strict in-partition ordering across destination replicated partitions.'
    }
  },

  javaCode: `package com.enterprise.messaging.dr;

import org.apache.kafka.connect.mirror.RemoteClusterUtils;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import java.time.Duration;
import java.util.Map;
import java.util.Properties;

public class DisasterRecoveryFailoverService {

    public static Map<TopicPartition, OffsetAndMetadata> translateOffsetsForFailover(
            Properties backupClusterProps,
            String sourceClusterAlias,
            String consumerGroupId) throws Exception {

        // Query internal mm2-checkpoints topic to find translated offset in DC-2!
        Map<TopicPartition, OffsetAndMetadata> translatedOffsets =
            RemoteClusterUtils.translateOffsets(
                backupClusterProps,
                sourceClusterAlias,
                consumerGroupId,
                Duration.ofSeconds(15)
            );

        System.out.printf("Successfully translated %d partition offsets for failover consumer group: %s%n",
            translatedOffsets.size(), consumerGroupId);

        return translatedOffsets;
    }
}`,

  springConfigCode: `# MirrorMaker 2 Configuration (mm2.properties)
clusters = us-east, us-west
us-east.bootstrap.servers = east-kafka:9092
us-west.bootstrap.servers = west-kafka:9092

us-east->us-west.enabled = true
us-east->us-west.topics = orders.*, payments.*
us-east->us-west.emit.checkpoints.enabled = true
us-east->us-west.emit.checkpoints.interval.seconds = 5
replication.factor = 3`,

  interviewQuestions: [
    {
      question: {
        vi: 'Tại sao không nên sử dụng Stretched Cluster (cụm mở rộng) cho Kafka qua hai vùng địa lý (Multi-Region WAN)?',
        en: 'Why is it an anti-pattern to deploy a Stretched Kafka Cluster across multi-region WANs?'
      },
      answer: {
        vi: 'Vì Kafka yêu cầu sự đồng thuận cực nhanh giữa Leader và In-Sync Replicas (ISR) cho mỗi lệnh Produce với acks=all. Khi mạng WAN giữa 2 region có độ trễ 40 - 100ms kèm hiện tượng rớt gói tin và jitter, mỗi thao tác ghi sẽ bị chậm lại 100ms, thông lượng sụt giảm nghiêm trọng. Hơn nữa, heartbeat giữa các broker bị timeout sẽ liên tục kích hoạt Rebalance và Leader Election sai lầm. Kiến trúc chuẩn doanh nghiệp là: 2 cụm độc lập riêng biệt tại 2 region, kết nối với nhau qua MirrorMaker 2 sao chép bất đồng bộ.',
        en: 'Because Kafka produce requests configured with acks=all require tight, low-latency consensus across ISR replicas. WAN latency (40-100ms) with network jitter bottlenecks write latency to 100ms+, destroying cluster throughput. Furthermore, cross-region heartbeat timeouts trigger constant false-positive leader elections and rebalances. Best practice mandates two discrete clusters linked asynchronously by MirrorMaker 2.'
      },
      seniority: 'Lead'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Mất điện toàn bộ Data Center US-East và pha Failover thần tốc trong 90 giây',
      en: 'Complete US-East Power Failure and 90-Second Zero-Loss Failover Recovery'
    },
    businessContext: {
      vi: 'Một sàn giao dịch tiền điện tử xử lý hàng triệu lệnh mua bán với yêu cầu hoạt động liên tục 99.999%.',
      en: 'A global cryptocurrency exchange requiring 99.999% continuous availability for trade matching.'
    },
    problemDescription: {
      vi: 'Trạm biến áp trung tâm của Data Center US-East bị nổ do sét đánh, toàn bộ máy chủ sập nguồn đột ngột. Nếu không chuyển giao kịp sang US-West, hàng trăm ngàn giao dịch của người dùng sẽ bị đóng băng, gây tổn hại thương hiệu nghiêm trọng.',
      en: 'A primary substation explosion knocked out US-East datacenter instantly. Unless traffic failed over to US-West, hundreds of thousands of user orders would freeze, risking catastrophic market exposure.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư bật consumer tại US-West nhưng để đọc từ auto-offset-reset=earliest. Toàn bộ 40 triệu giao dịch trong 30 ngày qua bị đọc lại từ đầu, làm nghẽn toàn bộ cơ sở dữ liệu và gửi lại hàng triệu thông báo cũ.',
      en: 'Ops launched backup consumers configured with auto-offset-reset=earliest. Workers replayed 40 million historical records, flooding databases and emitting millions of duplicate notifications.'
    },
    coreSolution: {
      vi: 'Do MirrorMaker 2 đã liên tục đồng bộ checkpointing trước đó: 1. Đổi DNS router sang US-West; 2. Ứng dụng tự động gọi RemoteClusterUtils.translateOffsets() để gán offset chính xác cho Consumer Group tại US-West; 3. Consumer bắt đầu tiêu thụ ngay lập tức từ vị trí mà US-East vừa dừng lại.',
      en: 'Because MirrorMaker 2 had been continuously maintaining checkpoint offsets: 1. Routed DNS to US-West; 2. Invoked RemoteClusterUtils.translateOffsets() to seed partition offsets accurately; 3. Consumers resumed processing exactly where US-East dropped.'
    },
    productionCode: `// Automated Failover Script
Map<TopicPartition, OffsetAndMetadata> checkpoints =
    RemoteClusterUtils.translateOffsets(westProps, "us-east", "order-matcher-group", Duration.ofSeconds(5));
consumer.commitSync(checkpoints);
consumer.subscribe(Collections.singletonList("us-east.orders"));`,
    architectureImpact: {
      vi: 'Hệ thống phục hồi hoàn toàn sau 90 giây (RTO = 90s); lượng dữ liệu mất mát RPO < 200ms (chỉ vài chục giao dịch); cứu doanh nghiệp khỏi nguy cơ phá sản do gián đoạn thị trường.',
      en: 'Complete operational recovery within 90 seconds (RTO = 90s); data loss RPO < 200ms; saved the exchange from multi-million dollar regulatory insolvency.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
