import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const kafkaLogCompactionCdcTopic: MessagingTopic = {
  id: 'kafka-log-compaction-cdc',
  category: 'advanced-streaming',
  level: 'advanced',
  chapter: 'Chuyên Đề Nâng Cao — Advanced Distributed Streaming',
  name: 'Kafka Log Compaction & CDC (Change Data Capture)',
  tagline: {
    vi: 'Cơ chế nén Log Compaction, bản tin mộ bia Tombstone, giải phóng đĩa và kiến trúc đồng bộ trạng thái CDC Debezium.',
    en: 'Log Compaction internals, Tombstone records, disk reclamation, and state synchronization via Debezium CDC.'
  },
  difficulty: 3,
  order: 13,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Nếu một topic lưu trữ các biến động trạng thái tài khoản ngân hàng hoặc thông tin khách hàng trong nhiều năm, việc lưu toàn bộ lịch sử thô (Raw Event Log) sẽ làm dung lượng đĩa phình to lên hàng trăm Terabyte. Người đọc mới khi khởi động lại chỉ cần trạng thái mới nhất của mỗi khách hàng chứ không cần đọc lại hàng triệu bản tin cũ đã bị ghi đè.',
      en: 'Retaining unbounded raw mutation streams for customer accounts or database tables inflates storage to hundreds of terabytes. New consumers spinning up require only the latest state snapshot per entity rather than millions of superseded historical events.'
    },
    hardwareConstraint: {
      vi: 'Dung lượng lưu trữ đĩa SSD NVMe đắt đỏ và thời gian phục hồi ứng dụng (Recovery Time Objective - RTO) tỷ lệ thuận với số lượng bản tin mà Consumer phải đọc lại từ đầu.',
      en: 'NVMe storage costs are prohibitive and application Recovery Time Objectives (RTO) degrade proportionally with the volume of historical records replayed on startup.'
    },
    fundamentalSolution: {
      vi: 'Kích hoạt chính sách cleanup.policy=compact: Kafka Cleaner Thread ngầm định kỳ quét các Segment cũ và chỉ giữ lại bản tin CÓ OFFSET LỚN NHẤT CHO MỖI KEY. Các bản tin cũ cùng key bị xóa bỏ để giải phóng đĩa. Để biểu thị hành động XÓA (DELETE), Producer gửi một bản tin có Key và Value = null (Tombstone Record).',
      en: 'Enable cleanup.policy=compact: Background cleaner threads scan closed segments, retaining exclusively the highest-offset record for each discrete Key. Outdated records sharing the key are purged. To represent record deletions, producers emit a Tombstone (matching Key with null Value).'
    },
    math: {
      formula: '\\forall k, \\quad \\text{Retain}(\\text{record}) \\iff \\text{offset} = \\max \\{ \\text{offset}_i \\mid \\text{key}_i = k \\}',
      timeComplexity: 'O(1) hash table lookup during cleaner compaction scan',
      spaceComplexity: 'O(U) — U là số lượng Unique Keys trong partition',
      throughputFormula: '\\text{Storage Savings} \\approx 1 - \\frac{U_{\\text{unique}}}{N_{\\text{total events}}} \\quad (\\text{tiết kiệm đến 95\\%} \\text{ dung lượng})'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Log Compaction biến Kafka thành một cơ sở dữ liệu khóa-giá trị (Key-Value Store) có độ tin cậy tuyệt đối. Đây là nền tảng để xây dựng KTable trong Kafka Streams, Local State Store và tái tạo lại toàn bộ bảng cơ sở dữ liệu từ luồng CDC.',
      en: 'Log Compaction transforms Kafka into a durable, replayable Key-Value state store. It is the architectural engine powering Kafka Streams KTables, local RocksDB stores, and Change Data Capture replays.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Cấu trúc Segment: Active Segment vs Cleaner Head & Tail: Partition được chia thành các file segment (mặc định 1GB). Active Segment (nơi đang ghi dữ liệu mới) KHÔNG BAO GIỜ bị compact. Chỉ có các Closed Segments mới được chia thành Head (chưa nén) và Tail (đã nén). Cleaner Thread đọc Head vào bảng băm SkimpyOffsetMap trong RAM rồi viết lại file segment đã nén.',
        en: 'Segment Architecture: Active vs Clean/Dirty Segments: Partitions consist of 1GB segment files. The active segment receiving new writes is NEVER compacted. Only closed segments undergo compaction. Cleaner threads build an in-memory SkimpyOffsetMap of the dirty head, rewriting compacted segments to disk.'
      },
      {
        vi: 'Bản tin Mộ bia (Tombstone Record): Để xóa một khóa, Producer gửi message có Value = null. Khi chạy compaction, Kafka giữ lại Tombstone này trong khoảng thời gian delete.retention.ms (mặc định 24 giờ) để bảo đảm mọi consumer kịp đọc và xóa dữ liệu trong cache cục bộ trước khi Tombstone chính thức bị xóa sổ khỏi đĩa.',
        en: 'Tombstone Mechanics: Emitting a null payload signals deletion. Kafka retains this Tombstone marker for delete.retention.ms (default 24h) ensuring all active consumers process the deletion event before the tombstone is purged from disk.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Gửi message không có Key vào Compacted Topic: Message có Key = null sẽ không bao giờ được compact, khiến cơ chế dọn dẹp bị vô hiệu hóa hoàn toàn.',
        en: 'Emitting Null Keys to Compacted Topics: Records with null keys cannot be deduplicated by the cleaner thread, defeating the compaction mechanism entirely.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Cơ chế Nén Log Compaction: Loại bỏ Offset cũ & Giữ lại Snapshot mới nhất',
      en: 'Log Compaction Cleaning Cycle: Purging Obsolete Offsets'
    },
    description: {
      vi: 'Minh họa cách Cleaner Thread quét các bản ghi trùng Key và chỉ giữ lại bản ghi mới nhất kèm Tombstone.',
      en: 'Physical diagram illustrating how cleaner threads compact duplicate key offsets into dense snapshots.'
    },
    asciiDiagram: `
BEFORE COMPACTION (DIRTY HEAD):
Offset:   [0]     [1]     [2]     [3]     [4]     [5]     [6]
Payload: (K1:V1) (K2:V1) (K1:V2) (K3:V1) (K2:V2) (K1:V3) (K2:null)
                                                            ^ Tombstone (Delete K2)

AFTER COMPACTION (CLEAN TAIL):
Offset:   [3]     [5]     [6]
Payload: (K3:V1) (K1:V3) (K2:null)  <-- Retained until delete.retention.ms expires!
          (K1:V1, K1:V2, K2:V1, K2:V2 are completely purged from disk!)
`,
    components: [
      {
        name: 'SkimpyOffsetMap',
        role: 'Compaction Hash Index',
        description: {
          vi: 'Bảng băm hiệu năng cao trong bộ nhớ RAM lưu trữ ánh xạ Hash(Key) -> Offset lớn nhất.',
          en: 'High-performance off-heap hash map caching Hash(Key) to highest offset during cleaning.'
        }
      },
      {
        name: 'Tombstone Marker',
        role: 'Deletion Sentinel',
        description: {
          vi: 'Bản tin có value=null báo hiệu cho downstream consumer xóa entity tương ứng khỏi bộ nhớ đệm.',
          en: 'Sentinel record with null value instructing downstream caches to delete local records.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Producer phát các bản tin cập nhật trạng thái', en: 'Producer emits state mutations' },
      phase: 'Continuous Appending',
      description: {
        vi: 'Debezium CDC đọc database và liên tục gửi các bản tin cập nhật user_id=101 với các giá trị khác nhau.',
        en: 'Debezium captures user mutations and streams multiple updates for user_id=101.'
      },
      brokerBehavior: {
        vi: 'Kafka lưu tất cả message nối tiếp vào log segment hiện tại.',
        en: 'Kafka appends records monotonically to the current active segment.'
      },
      javaCodeLineMatch: 'cleanup.policy=compact'
    },
    {
      id: 'step-1',
      title: { vi: 'Cleaner Thread kích hoạt khi Dirty Ratio đạt 50%', en: 'Cleaner triggers at 50% dirty ratio' },
      phase: 'Compaction Scan',
      description: {
        vi: 'Khi tỷ lệ dữ liệu bẩn (min.cleanable.dirty.ratio) đạt 0.5, Cleaner quét Closed Segment và nạp key vào RAM.',
        en: 'When dirty ratio exceeds 0.5, cleaner scans closed segments into SkimpyOffsetMap.'
      },
      brokerBehavior: {
        vi: 'Xác định các offset 0, 2 của K1 là lỗi thời và sẵn sàng loại bỏ.',
        en: 'Identifies superseded offsets for K1, marking them for exclusion.'
      },
      javaCodeLineMatch: 'min.cleanable.dirty.ratio=0.5'
    },
    {
      id: 'step-2',
      title: { vi: 'Ghi file Segment mới đã được nén', en: 'Write compacted clean segment' },
      phase: 'Disk Deduplication',
      description: {
        vi: 'Cleaner ghi ra một file segment mới chỉ chứa offset mới nhất (Offset 5 cho K1) và hoán đổi nguyên tử.',
        en: 'Cleaner writes a deduplicated segment retaining only the latest record for each key.'
      },
      brokerBehavior: {
        vi: 'Dung lượng đĩa được giải phóng tức thì; các offset cũ bị xóa vĩnh viễn.',
        en: 'Disk space is reclaimed; obsolete historical offsets are permanently deleted.'
      },
      javaCodeLineMatch: 'segment.cleaner.threads=2'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Xóa message ngay khi ACK', en: 'Ephemeral queue storage' },
      keyMechanism: {
        vi: 'RabbitMQ không có cơ chế Log Compaction. Message được xóa ngay khi consumer gửi basicAck.',
        en: 'RabbitMQ has no log compaction; records are permanently evicted immediately upon basicAck.'
      },
      configExample: 'channel.basicAck(deliveryTag, false);',
      architectureNote: {
        vi: 'Không thể dùng RabbitMQ làm nguồn chân lý (Source of Truth) để dựng lại cơ sở dữ liệu.',
        en: 'Cannot be used as a durable state store for database reconstruction or event sourcing.'
      }
    },
    kafka: {
      role: { vi: 'Lưu trữ trạng thái vĩnh viễn (Key-Value Log Store)', en: 'Permanent key-value state store' },
      keyMechanism: {
        vi: 'Giữ lại bản ghi mới nhất của mỗi key vô thời hạn (retention.ms=-1) với chi phí đĩa tối thiểu.',
        en: 'Retains latest state per key indefinitely with minimal storage via background cleaning.'
      },
      configExample: 'cleanup.policy=compact, min.cleanable.dirty.ratio=0.5',
      architectureNote: {
        vi: 'Cho phép bất kỳ microservice mới nào có thể tua lại log từ offset 0 để khởi tạo Local Database Cache.',
        en: 'Enables new microservices to hydrate in-memory database caches from scratch by replaying offset 0.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Tiết kiệm 80% - 95% dung lượng đĩa lưu trữ cho các topic lưu trạng thái dài hạn.',
        en: 'Saves 80%-95% disk space for permanent state and reference data topics.'
      },
      {
        vi: 'Tốc độ khởi động lại và khôi phục State Store của Consumer tăng gấp 20 lần.',
        en: '20x faster state hydration and disaster recovery replay times.'
      }
    ],
    cons: [
      {
        vi: 'Cleaner Thread tiêu tốn tài nguyên CPU và Disk I/O trong quá trình quét nén.',
        en: 'Cleaner threads consume background CPU and disk I/O during compaction passes.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Không ảnh hưởng đến độ trễ ghi của Active Segment; I/O nén chạy độc lập ở background.',
      en: 'Zero impact on active segment produce latency; compaction runs in independent daemon threads.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm thứ tự đơn điệu giữa các bản ghi còn lại sau khi nén.',
      en: 'Preserves monotonic ordering across all retained post-compaction offsets.'
    }
  },

  javaCode: `package com.enterprise.messaging.compaction;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.config.TopicConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Collections;
import java.util.Map;

@Configuration
public class CompactedTopicConfig {

    @Bean
    public NewTopic userStateTopic() {
        return new NewTopic("user-state-compacted", 6, (short) 3)
            .configs(Map.of(
                // 1. Enable Log Compaction
                TopicConfig.CLEANUP_POLICY_CONFIG, TopicConfig.CLEANUP_POLICY_COMPACT,
                // 2. Trigger cleaner when 40% of records are dirty
                TopicConfig.MIN_CLEANABLE_DIRTY_RATIO_CONFIG, "0.4",
                // 3. Keep delete tombstones for 24 hours so all consumers see the deletion
                TopicConfig.DELETE_RETENTION_MS_CONFIG, "86400000",
                // 4. Force segment roll after 1 day to ensure cleaning occurs regularly
                TopicConfig.SEGMENT_MS_CONFIG, "86400000"
            ));
    }
}`,

  springConfigCode: `spring:
  kafka:
    admin:
      properties:
        cleanup.policy: compact
        min.cleanable.dirty.ratio: 0.4`,

  interviewQuestions: [
    {
      question: {
        vi: 'Tombstone trong Kafka Log Compaction là gì? Tại sao phải duy trì tham số delete.retention.ms?',
        en: 'What is a Tombstone in Kafka Log Compaction? Why is delete.retention.ms critical?'
      },
      answer: {
        vi: 'Tombstone là một bản tin có Key xác định nhưng Value = null, đại diện cho hành động xóa một entity khỏi hệ thống. Khi Cleaner Thread gặp Tombstone, nó không được xóa ngay lập tức mà phải giữ lại tối thiểu trong khoảng thời gian delete.retention.ms (mặc định 24 giờ). Lý do: nếu xóa ngay lập tức, một Consumer bị chậm (lagging) hoặc đang tạm offline sẽ không bao giờ nhìn thấy bản tin xóa này, dẫn đến trạng thái dữ liệu trong cache của consumer đó không bao giờ bị xóa (Memory Leak / Phantom State).',
        en: 'A Tombstone is a record with a valid key and null value signaling record deletion. The cleaner retains tombstones for at least delete.retention.ms (default 24h). If purged instantly, lagging or temporarily offline consumers replaying from offset checkpoints would miss the deletion marker, preserving phantom state indefinitely.'
      },
      seniority: 'Lead'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố đĩa Kafka đầy 100% do topic chứa trạng thái không bật Log Compaction',
      en: 'Kafka Cluster Out-of-Disk Emergency Caused by Uncompacted State Stream'
    },
    businessContext: {
      vi: 'Một hệ thống định danh người dùng (User Profile Service) phục vụ 40 triệu tài khoản trực tuyến.',
      en: 'A central identity provider maintaining real-time profile state for 40 million active users.'
    },
    problemDescription: {
      vi: 'Topic "user-profiles" lưu trữ toàn bộ thay đổi thông tin (đổi mật khẩu, avatar, địa chỉ) với retention.ms=-1 (lưu vĩnh viễn) nhưng lại để cleanup.policy=delete mặc định. Sau 2 năm, topic tích tụ 1.8 tỷ event thô, dung lượng chiếm 42TB đĩa cứng, đẩy cụm Kafka vào tình trạng cạn kiệt đĩa 98%.',
      en: 'Topic "user-profiles" stored profile mutations with retention.ms=-1 (infinite) under default cleanup.policy=delete. In 2 years, 1.8 billion raw events consumed 42TB of disk, bringing cluster brokers to 98% disk capacity alarm.'
    },
    whyNaiveFails: {
      vi: 'Nhóm kỹ sư giảm retention.ms xuống 30 ngày. Hậu quả là thông tin của 12 triệu người dùng không đăng nhập trong tháng đó bị Kafka xóa mất, khiến khi họ đăng nhập lại hệ thống coi như tài khoản mới!',
      en: 'Team lowered retention.ms to 30 days. Kafka purged profiles of 12 million dormant users who had not updated accounts within 30 days, causing catastrophic profile data loss.'
    },
    coreSolution: {
      vi: 'Chuyển đổi cleanup.policy sang "compact". Cấu hình min.cleanable.dirty.ratio = 0.3 và segment.ms = 43200000 (12 giờ). Cleaner Thread nén 1.8 tỷ event xuống còn đúng 40 triệu bản ghi snapshot mới nhất cho 40 triệu user.',
      en: 'Migrated topic cleanup.policy to "compact" with min.cleanable.dirty.ratio=0.3. Cleaner threads compacted 1.8 billion mutations down to exactly 40 million latest records for the 40 million users.'
    },
    productionCode: `// Production Fix: Alter Dynamic Topic Config
Properties props = new Properties();
props.put(TopicConfig.CLEANUP_POLICY_CONFIG, TopicConfig.CLEANUP_POLICY_COMPACT);
props.put(TopicConfig.MIN_CLEANABLE_DIRTY_RATIO_CONFIG, "0.3");
adminClient.alterTopicConfigs(Map.of(new ConfigResource(Type.TOPIC, "user-profiles"), new Config(entries)));`,
    architectureImpact: {
      vi: 'Dung lượng đĩa giảm từ 42TB xuống 1.4TB (giảm 96.6%); toàn bộ 40 triệu tài khoản được bảo toàn vĩnh viễn; thời gian consumer khởi động đọc lại dữ liệu giảm từ 14 tiếng xuống 8 phút.',
      en: 'Disk footprint plummeted from 42TB to 1.4TB (96.6% drop); 100% of 40M user profiles preserved; consumer cold-start hydration time plummeted from 14h to 8 minutes.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia,
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions
  ]
};
