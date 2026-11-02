import type { DatabaseTopic } from '../types';

export const shardingHashRing: DatabaseTopic = {
  id: 'sharding-hash-ring',
  category: 'distributed-consensus',
  name: 'Consistent Hashing & Ring Partitioning',
  tagline: {
    en: 'Scale-out distributed storage topology: virtual nodes ring, deterministic hash routing, and zero-downtime key rebalancing.',
    vi: 'Cấu trúc phân vùng dữ liệu phân tán: vòng nút ảo (Virtual Nodes), định tuyến băm xác định và tái cân bằng không gián đoạn.'
  },
  difficulty: 2,
  order: 8,
  estimatedMinutes: 16,

  coreTheory: {
    problemStatement: {
      en: 'In naive mod-N hash partitioning (Node = Hash(Key) % N), adding or removing a single database server changes the denominator N to N+1 or N-1. This causes almost 100% of keys to change their target node, triggering a massive, cluster-wide data migration storm that brings down production databases.',
      vi: 'Trong phép chia băm thô sơ (Node = Hash(Key) % N), khi thêm hoặc bớt 1 server database thì mẫu số thay đổi từ N thành N+1 hoặc N-1. Điều này khiến gần như 100% các khóa bị chuyển vị trí sang node khác, gây ra cơn bão di dời dữ liệu (Cache Stampede) làm sập toàn bộ hệ thống.'
    },
    hardwareConstraint: {
      en: 'Distributed databases (DynamoDB, Cassandra, Redis Cluster) run across hundreds of commodity server nodes where hardware failures and node additions are routine daily events. Key redistribution must strictly scale as O(K/N), moving only a minimal fraction of keys.',
      vi: 'Các hệ CSDL phân tán (DynamoDB, Cassandra, Redis Cluster) chạy trên hàng trăm server nơi việc hỏng hóc hoặc mở rộng node là diễn ra hàng ngày. Việc tái phân bổ dữ liệu bắt buộc phải đạt độ phức tạp O(K/N), tức chỉ di dời một phần tối thiểu dữ liệu.'
    },
    fundamentalSolution: {
      en: 'Consistent Hashing projects both server nodes and data keys onto a continuous 32-bit (or 128-bit) circular ring [0, 2^32 - 1]. A key is assigned to the first server node encountered moving clockwise along the ring. When a new node is added, it only claims keys from its immediate counter-clockwise neighbor, leaving all other nodes untouched.',
      vi: 'Băm nhất quán (Consistent Hashing) chiếu cả các server node lẫn các khóa dữ liệu lên một vòng tròn 32-bit liên tục [0, 2^32 - 1]. Khóa được định tuyến tới node đầu tiên gặp được khi đi theo chiều kim đồng hồ. Khi thêm một node mới, nó chỉ tiếp nhận một phần dữ liệu từ node láng giềng liền kề, toàn bộ các node khác hoàn toàn không bị ảnh hưởng.'
    },
    math: {
      formula: 'Keys Migrated on Node Add = K / (N+1)   [Naive Mod-N Migrates ~100%]',
      description: {
        en: 'Adding the (N+1)-th node only migrates exactly 1/(N+1) fraction of total keys, representing minimal possible data movement.',
        vi: 'Khi bổ sung node thứ N+1, chỉ đúng 1/(N+1) tổng số khóa cần di dời, đạt mức tối ưu vật lý tối thiểu.'
      },
      timeComplexity: 'O(log(V × N)) node lookup via binary search / TreeMap ceilingEntry',
      spaceComplexity: 'O(V × N) memory for virtual tokens on routing coordinator',
      ioCostFormula: 'Rebalance Traffic = (1 / (N+1)) × Total Cluster Storage'
    }
  },

  pageLayout: {
    title: {
      en: 'Consistent Hash Ring & Virtual Token Topology (Amazon DynamoDB standard)',
      vi: 'Cấu trúc Vòng băm nhất quán & Nút ảo (Chuẩn Amazon DynamoDB & Cassandra)'
    },
    description: {
      en: 'To prevent hot spots caused by non-uniform hash distributions, each physical node is assigned multiple Virtual Tokens (e.g. 128-256 vnodes) scattered randomly along the ring.',
      vi: 'Để chống hiện tượng lệch tải (Hotspot) do phân phối băm không đều, mỗi server vật lý được gán nhiều Token ảo (Virtual Nodes, từ 128 đến 256 vnode) nằm rải rác khắp vòng tròn.'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| 32-BIT CONTINUOUS RING [ 0x00000000 -------------------> 0xFFFFFFFF ]:    |
|                                                                          |
|       [ Node-A (Token 0x1200) ]                 [ Node-B (Token 0x4800) ]|
|                    \\                                 /                   |
|                     \\   Clockwise Routing (--->)    /                    |
|                      \\                             /                     |
|        Key Hash("usr_42") = 0x3100  -------------> Routes to Node-B      |
|                      /                             \\                     |
|                     /                               \\                    |
|                    /                                 \\                   |
|       [ Node-C (Token 0x9400) ]                 [ Node-A (Token 0xD800) ]|
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'vnode_count', size: '128 - 256 per node', description: { en: 'Virtual tokens per physical server ensuring uniform variance < 5%', vi: 'Số token ảo trên mỗi server vật lý đảm bảo độ lệch tải < 5%' } },
      { name: 'hash_algorithm', size: 'MurmurHash3 / MD5', description: { en: 'High-dispersion 32-bit or 128-bit avalanche hash function', vi: 'Hàm băm phân tán cao 32-bit hoặc 128-bit' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Consistent Hashing, invented by David Karger and colleagues at MIT in 1997 for web caching, is the foundational partitioning protocol governing modern distributed databases (Amazon DynamoDB, Apache Cassandra, Riak, Redis Cluster). It solves the catastrophic cluster rebalancing overhead of traditional modulo sharding by mapping both servers and data keys onto a circular 32-bit or 64-bit coordinate ring.',
      vi: 'Băm Nhất Quán (Consistent Hashing), được phát minh bởi David Karger và các cộng sự tại MIT năm 1997, là giao thức phân vùng dữ liệu nền tảng vận hành các hệ cơ sở dữ liệu phân tán hiện đại (Amazon DynamoDB, Apache Cassandra, Redis Cluster). Nó giải quyết triệt để thảm họa tái phân bổ dữ liệu khi mở rộng cụm máy chủ của phương pháp chia lấy dư (Modulo Sharding) truyền thống bằng cách ánh xạ cả máy chủ và khóa dữ liệu lên một vòng tròn tọa độ 32-bit hoặc 64-bit.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Modulo Sharding Resharding Catastrophe: In naive modulo partitioning, a key is assigned to server = hash(key) % N. When the database cluster scales out from N=4 to N=5 servers, the divisor changes from 4 to 5. Almost N / (N + 1) = 80% of all existing keys suddenly map to completely different servers! This triggers a catastrophic cluster-wide network reshuffling storm, cache invalidation cascades, and multi-hour maintenance outages. In Consistent Hashing, adding a server migrates only K / (N + 1) keys (strictly the keys falling between the new node and its immediate predecessor on the ring), while all other servers remain 100% unaffected.',
        vi: '1. Thảm Họa Tái Phân Vùng Của Modulo Sharding: Trong phương pháp chia dư truyền thống, vị trí máy chủ được tính bằng server = hash(key) % N. Khi cụm máy chủ mở rộng từ N=4 lên N=5, số chia đổi từ 4 sang 5. Có tới N / (N + 1) = 80% tổng số bản ghi hiện tại bị đổi sang máy chủ hoàn toàn mới! Điều này kích hoạt một cơn bão chuyển dữ liệu qua mạng làm nghẽn toàn bộ cụm, xóa sạch bộ đệm cache và đòi hỏi bảo trì hàng giờ. Với Băm Nhất Quán, việc thêm một node mới chỉ phải di dời K / (N + 1) khóa (chỉ những khóa nằm giữa node mới và node đứng trước nó trên vòng tròn), trong khi toàn bộ các máy chủ khác hoàn toàn không bị ảnh hưởng.'
      },
      {
        en: '2. Virtual Nodes (vnodes) & Load Uniformity Mathematics: In basic consistent hashing, assigning each physical server a single point on the ring produces non-uniform arc segments. A server with an unusually large arc will store 300% to 500% more data than its peers (creating dangerous hotspots). To achieve mathematical uniformity, distributed engines assign each physical server between 128 and 256 Virtual Nodes (vnodes) scattered pseudo-randomly across the ring using token seeds (e.g. hash("node1#vnode42")). This reduces load variance across physical servers to under 4% standard deviation following Poisson distribution.',
        vi: '2. Node Ảo (Virtual Nodes / vnodes) & Độ Đồng Đều Của Tải: Trong băm nhất quán cơ bản, việc gán cho mỗi máy chủ vật lý 1 điểm duy nhất trên vòng băm sẽ tạo ra các cung tròn có chiều dài rất chênh lệch. Một máy chủ vô tình sở hữu cung tròn lớn sẽ phải chứa lượng dữ liệu gấp 300% đến 500% các máy khác (tạo thành điểm nóng quá tải). Để đạt sự cân bằng toán học, các hệ thống phân tán gán cho mỗi máy chủ vật lý từ 128 đến 256 Node Ảo (vnodes) rải đều ngẫu nhiên trên khắp vòng băm (ví dụ hash("node1#vnode42")). Kỹ thuật này kéo độ lệch chuẩn về phân bổ tải giữa các máy chủ vật lý xuống dưới 4% theo phân phối Poisson.'
      },
      {
        en: '3. Multi-Datacenter Replication & Failure Domain Awareness: In distributed quorum topologies (e.g. Dynamo N=3, R=2, W=2), replicas are placed on the next 2 successive nodes clockwise along the ring. However, naive successor placement risks assigning two replicas to virtual nodes that reside on the SAME physical blade or rack. Production coordinator routers implement Rack/AZ awareness: when traversing the ring for replicas, the coordinator skips successor vnodes that share the same physical server or availability zone, ensuring high availability even if an entire AWS rack or datacenter loses power.',
        vi: '3. Nhân Bản Đa Trung Tâm Dữ Liệu & Nhận Biết Vùng Lỗi (Failure Domain): Trong mô hình phân tán (Dynamo N=3, R=2, W=2), các bản sao dữ liệu được lưu trên 2 node kế tiếp theo chiều kim đồng hồ trên vòng băm. Tuy nhiên, nếu duyệt đơn thuần, hai node ảo kế tiếp có thể vô tình cùng thuộc về MỘT MÁY CHỦ VẬT LÝ hoặc cùng một tủ rack mạng. Các router điều phối sản xuất bắt buộc phải nhận biết cấu trúc Rack/AZ: khi duyệt vòng băm để chọn bản sao, router tự động bỏ qua các vnode cùng chung máy chủ hoặc cùng Availability Zone, đảm bảo dữ liệu vẫn sống sót an toàn kể cả khi sập nguồn toàn bộ một trung tâm dữ liệu.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'The "Whale Tenant / Celebrity Hotspot" trap: When sharding by tenant_id or user_id, an ultra-massive tenant (e.g. an enterprise account generating 50% of platform volume) saturates 100% of a single physical shard, while the remaining 95% of shards sit idle. Consistent hashing alone cannot fix key distribution if a single key carries massive write skew.',
        vi: 'Cái bẫy "Khách hàng khổng lồ (Whale Tenant / Celebrity)": Khi chia shard theo tenant_id, một khách hàng doanh nghiệp cực lớn (chiếm 50% lượng giao dịch toàn sàn) sẽ làm nghẽn 100% tài nguyên của 1 shard vật lý duy nhất, trong khi 95% số shard còn lại ngồi chơi. Băm nhất quán không thể tự sửa lỗi lệch tải nếu bản thân một khóa nghiệp vụ đã có lưu lượng quá khổng lồ.'
      },
      {
        en: 'Cross-Shard Scatter-Gather Query Storms: Executing queries without the shard routing key (SELECT * FROM orders WHERE status = "PENDING") forces the router to broadcast the query to every single shard in parallel. The slowest shard determines overall query latency (P99 tail latency amplification).',
        vi: 'Cơn bão truy vấn phân tán Scatter-Gather: Chạy câu lệnh không kèm khóa shard (SELECT * FROM orders WHERE status = "PENDING") buộc hệ thống phải gửi câu lệnh tới TẤT CẢ các shard cùng lúc. Độ trễ của toàn bộ truy vấn sẽ bị kéo chậm theo shard phản hồi chậm nhất (khuếch đại độ trễ P99).'
      },
      {
        en: 'Rebalancing network saturation: When adding new database nodes, migrating gigabytes of data concurrently without network bandwidth rate limiters (traffic shaping) saturates inter-datacenter bandwidth and causes production client API timeouts.',
        vi: 'Làm nghẽn mạng khi tái cân bằng (Rebalancing): Khi bổ sung thêm node mới, việc di chuyển hàng trăm Gigabyte dữ liệu cùng lúc mà không giới hạn băng thông (rate limit) sẽ chiếm sạch đường truyền giữa các data center, gây timeout cho các request của khách hàng đang dùng thật.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'SaaS Hotspot Tenant Shard Saturation & Salted Consistent Hash Rebalancing',
      vi: 'Sự Cố Shard Bị Quá Tải Do Khách Hàng Khổng Lồ & Kỹ Thuật Băm Muối (Salted Hashing)'
    },
    businessContext: {
      en: 'A multi-tenant B2B e-commerce platform hosts 12,000 merchant stores partitioned across 16 PostgreSQL database shards.',
      vi: 'Nền tảng thương mại điện tử SaaS đa người thuê lưu trữ dữ liệu của 12,000 cửa hàng đối tác phân vùng trên 16 shard PostgreSQL.'
    },
    problemDescription: {
      en: 'The database cluster routed records by merchant_id. During an exclusive Black Friday flash sale held by a mega-retailer (Merchant #8801, generating 45,000 orders/minute), physical Shard 04 (where Merchant #8801 hashed to) hit 100% CPU, 100% NVMe IOPS, and connection pool exhaustion. 750 other small business merchants hosted on Shard 04 suffered catastrophic collateral damage: their stores crashed with 504 Gateway Timeouts, while Shards 01, 02, 03, and 05-16 operated at a tranquil 6% CPU utilization! The entire platform SLA was breached due to a single hotspot tenant.',
      vi: 'Hệ thống định tuyến dữ liệu theo merchant_id. Trong đợt Flash Sale của một chuỗi bán lẻ khổng lồ (Merchant #8801 tạo ra 45,000 đơn hàng/phút), Shard vật lý 04 (nơi Merchant #8801 rơi vào) chạm mốc 100% CPU, 100% IOPS ổ cứng và cạn kiệt connection pool. 750 cửa hàng nhỏ khác cùng nằm trên Shard 04 bị vạ lây thảm khốc: trang mua sắm của họ sập hoàn toàn với lỗi 504 Gateway Timeout, trong khi 15 shard còn lại chỉ chạy ở mức 6% CPU! Toàn bộ cam kết SLA của nền tảng bị đổ vỡ chỉ vì một khách hàng điểm nóng.'
    },
    whyNaiveFails: {
      en: 'Re-sharding using traditional modulo hashing (merchant_id % 17) required moving 94% of all 12,000 merchants across the cluster, demanding an unacceptable 16-hour platform maintenance freeze.',
      vi: 'Tái phân vùng bằng cách chia dư truyền thống (merchant_id % 17) đòi hỏi phải di chuyển 94% dữ liệu của toàn bộ 12,000 cửa hàng qua mạng, bắt buộc hệ thống phải đóng cửa bảo trì suốt 16 tiếng không thể chấp nhận được.'
    },
    coreSolution: {
      en: '1. Implement a Consistent Hash Ring with 256 Virtual Nodes per physical shard using MurmurHash3 to guarantee load variance under 3% for normal merchants. 2. Implement "Salted Sharding" for mega-tenants: detect whale merchants and route their records using a compound partition key: merchant_id + "_" + (hash(order_id) % 8). This transparently distributes Merchant #8801 orders across 8 independent physical shards simultaneously, eliminating the single-shard bottleneck.',
      vi: '1. Xây dựng Vòng Băm Nhất Quán (Consistent Hash Ring) với 256 Node Ảo trên mỗi shard dùng MurmurHash3 để đảm bảo độ lệch tải dưới 3% cho các khách hàng thông thường. 2. Áp dụng kỹ thuật Băm Thêm Muối (Salted Sharding) cho các khách hàng khổng lồ: tự động phát hiện khách hàng VIP và chia đơn hàng theo khóa tổ hợp: merchant_id + "_" + (hash(order_id) % 8). Cơ chế này phân tán đồng đều 45,000 đơn hàng của Merchant #8801 sang 8 shard vật lý khác nhau cùng lúc, xóa bỏ hoàn toàn nút thắt cổ chai ở 1 shard.'
    },
    productionCode: `// Production Consistent Hash Ring with Virtual Nodes & Salted Whale Sharding (Java 21)
package com.saas.sharding.router;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.NavigableMap;
import java.util.TreeMap;
import java.util.Set;

public class ConsistentHashRouter {
    private static final int VNODES_PER_SHARD = 256;
    private final NavigableMap<Long, String> ring = new TreeMap<>();
    // Known high-volume merchants configured for Salted Multi-Shard Distribution
    private final Set<String> whaleMerchants = Set.of("merchant_8801", "merchant_9942");

    public void addShard(String shardName) {
        for (int i = 0; i < VNODES_PER_SHARD; i++) {
            long token = hash64(shardName + "#vnode_" + i);
            ring.put(token, shardName);
        }
    }

    public String routeOrder(String merchantId, String orderId) {
        String routingKey;

        // 1. SALTED SHARDING FOR WHALE MERCHANTS:
        // Distributes high-velocity tenant writes across 8 shards!
        if (whaleMerchants.contains(merchantId)) {
            int salt = Math.abs(orderId.hashCode() % 8);
            routingKey = merchantId + "_salt_" + salt;
        } else {
            routingKey = merchantId;
        }

        // 2. CONSISTENT HASH RING LOOKUP: O(log VNODES) binary search
        long token = hash64(routingKey);
        Long successor = ring.ceilingKey(token);
        if (successor == null) {
            successor = ring.firstKey(); // Wrap around ring
        }

        return ring.get(successor);
    }

    // 64-bit MurmurHash3 / MD5 variant
    private long hash64(String key) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(key.getBytes(StandardCharsets.UTF_8));
            return ((long)(bytes[3] & 0xFF) << 24) |
                   ((long)(bytes[2] & 0xFF) << 16) |
                   ((long)(bytes[1] & 0xFF) << 8)  |
                   ((long)(bytes[0] & 0xFF));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}`,
    architectureImpact: {
      en: 'Shard 04 CPU utilization dropped from 100% to 22%; Whale tenant write load distributed evenly across 8 shards with zero hotspotting; Neighboring 750 small merchants restored to 1.8ms response times with zero 504 timeouts; P99 checkout latency dropped from 14s to 8.5ms.',
      vi: 'Mức sử dụng CPU của Shard 04 giảm từ 100% xuống còn 22%; Lượng đơn khổng lồ của khách hàng VIP được chia đều sang 8 shard mà không còn điểm nghẽn; 750 cửa hàng nhỏ lân cận trở lại hoạt động bình thường với độ trễ 1.8ms và không còn lỗi 504; Độ trễ P99 thanh toán giảm từ 14s xuống còn 8.5ms.'
    }
  },

  steps: [
    {
      id: 'hash',
      title: { en: '1. Hash Key onto 32-Bit Ring Coordinate', vi: '1. Băm khóa thành tọa độ trên vòng băm 32-Bit' },
      phase: 'HASH_MAPPING',
      description: {
        en: 'The routing coordinator applies MurmurHash3 or MD5 to the primary partition key (e.g., "user:9821"), producing a 32-bit integer representing an exact angle on the continuous ring.',
        vi: 'Điều phối viên định tuyến băm khóa chính của bản ghi (ví dụ "user:9821") qua MurmurHash3 hoặc MD5, tạo ra số nguyên 32-bit biểu thị một tọa độ góc chính xác trên vòng băm liên tục.'
      },
      diskIoBehavior: {
        en: 'Pure in-memory CPU computation. Sub-microsecond execution.',
        vi: 'Tính toán trên CPU trong RAM. Thời gian thực thi dưới 1 microsecond.'
      },
      javaCodeLineMatch: 'long hash = hashFunction.hash(key)'
    },
    {
      id: 'lookup-node',
      title: { en: '2. Clockwise Successor Node Traversal', vi: '2. Duyệt theo chiều kim đồng hồ tìm Node kế tiếp' },
      phase: 'ROUTING_SEEK',
      description: {
        en: 'The router performs a binary search (or TreeMap ceilingEntry) on the ring. It finds the first server node whose token coordinate is >= the key hash. If the key hash is greater than all nodes, it wraps around to the lowest node on the ring.',
        vi: 'Router tìm kiếm nhị phân (hoặc TreeMap ceilingEntry) trên vòng băm. Nó tìm server node đầu tiên có tọa độ token >= hash của khóa. Nếu vượt quá tất cả, nó vòng lại node đầu tiên ở mốc 0.'
      },
      diskIoBehavior: {
        en: 'In-memory routing. The request is forwarded via network TCP socket to the target storage node.',
        vi: 'Định tuyến trong RAM. Yêu cầu được gửi qua kết nối mạng tới node lưu trữ đích.'
      },
      javaCodeLineMatch: 'Map.Entry<Long, Node> entry = ring.ceilingEntry(hash)'
    },
    {
      id: 'rebalance',
      title: { en: '3. Virtual Node Addition & Zero-Downtime Migration', vi: '3. Thêm Virtual Node và di dời dữ liệu không gián đoạn' },
      phase: 'MIGRATION',
      description: {
        en: 'When a new physical Node D is commissioned, its virtual tokens are placed on the ring. Node D only pulls the key range between its token and its counter-clockwise predecessor. The remaining 90%+ of cluster keys experience zero disruption.',
        vi: 'Khi bổ sung Server Node D vào cụm, các token ảo của nó được chèn vào vòng băm. Node D chỉ kéo dải khóa nằm giữa nó và node liền trước. Hơn 90% dữ liệu còn lại trong cụm hoàn toàn không bị ảnh hưởng.'
      },
      diskIoBehavior: {
        en: 'Background network streaming of partitioned SSTable/page chunks between old and new node.',
        vi: 'Truyền luồng ngầm dữ liệu SSTable/trang giữa node cũ và node mới qua mạng.'
      },
      javaCodeLineMatch: 'migrateKeys(oldNode, newNode)'
    }
  ],

  productionEngines: [
    {
      engine: 'Amazon DynamoDB',
      implementationName: 'Consistent Hashing Storage Partitioning',
      keyMechanism: {
        en: 'Dynamo partitions tables into 10GB storage partitions across the hash ring. Automatic partition splitting occurs when a partition exceeds 10GB or 1000 WCU / 3000 RCU limits.',
        vi: 'Dynamo phân chia bảng thành các partition 10GB trên vòng băm. Phân vùng tự động tách đôi khi vượt quá 10GB hoặc vượt ngưỡng 1000 WCU / 3000 RCU.'
      },
      defaultTuningConfig: 'Partition Limit = 10GB, Max RCU = 3000, Max WCU = 1000',
      architectureNote: {
        en: 'Uses Masterless multi-datacenter replication with configurable read/write quorums (W + R > N).',
        vi: 'Áp dụng kiến trúc Masterless sao chép đa trung tâm dữ liệu với cơ chế Quorum (W + R > N).'
      }
    },
    {
      engine: 'Apache Cassandra',
      implementationName: 'Token Ring & Murmur3Partitioner',
      keyMechanism: {
        en: 'Every node in a Cassandra cluster claims a range of tokens from -2^63 to 2^63-1. Cassandra assigns num_tokens=128 by default per physical node.',
        vi: 'Mỗi node trong cụm Cassandra sở hữu một dải token từ -2^63 đến 2^63-1. Cassandra mặc định cấp 128 vnode cho mỗi server vật lý.'
      },
      defaultTuningConfig: 'num_tokens = 128, partitioner = org.apache.cassandra.dht.Murmur3Partitioner',
      architectureNote: {
        en: 'Gossip protocol continuously shares node cluster topology states without a centralized coordinator.',
        vi: 'Giao thức Gossip định kỳ trao đổi trạng thái cấu hình cụm mà không cần server điều phối tập trung.'
      }
    },
    {
      engine: 'Oracle Globally Distributed Database',
      implementationName: 'System-Managed Consistent Hash Sharding & Global Service Managers',
      keyMechanism: {
        en: 'Oracle Globally Distributed Database (formerly Oracle Sharding) partitions linear hash key ranges across independent physical database shards (chunks). Global Service Managers (GSM) act as shard directors, routing SQL connections directly to the authoritative shard without proxy hops. Online chunk rebalancing moves data between shards using RMAN incremental backups with zero downtime.',
        vi: 'Oracle Globally Distributed Database (trước đây là Oracle Sharding) phân chia dải khóa băm trên các shard vật lý độc lập (chunk). Các Global Service Manager (GSM) đóng vai trò điều phối kết nối trực tiếp đến đúng shard lưu trữ mà không qua proxy trung gian. Việc cân bằng lại chunk diễn ra online hoàn toàn không cần dừng hệ thống thông qua sao lưu RMAN gia tăng.'
      },
      defaultTuningConfig: 'GDSCTL> ADD SHARD -CONNECT shard1; CREATE SHARDED TABLE customers (...) PARTITION BY CONSISTENT HASH (cust_id);',
      architectureNote: {
        en: 'Combines the linear horizontal scale of NoSQL with the enterprise ACID compliance, SQL joins, and relational integrity of Oracle Database.',
        vi: 'Kết hợp khả năng mở rộng quy mô ngang tuyến tính của NoSQL với các cam kết toàn vẹn ACID, phép nối SQL và nghiệp vụ quan hệ của Oracle Database.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Only 1/N-th of total cluster keys are moved when scaling out by 1 server.', vi: 'Chỉ có đúng 1/N dữ liệu cần di dời khi mở rộng thêm 1 server.' },
      { en: 'Decentralized routing: Clients or proxies can route directly to the exact storage node.', vi: 'Định tuyến phi tập trung: Client hoặc Proxy có thể tính toán để gửi thẳng tới node lưu trữ đích.' }
    ],
    cons: [
      { en: 'Cascading failure risk: If a node crashes, its entire partition load shifts onto its immediate neighbor unless virtual nodes are properly distributed.', vi: 'Nguy cơ sập dây chuyền (Cascading Failure): Nếu 1 node chết, tải sẽ dồn lên node láng giềng nếu không dùng vnodes.' },
      { en: 'Range queries across partition keys require querying all cluster nodes (Scatter-Gather).', vi: 'Truy vấn dải trên nhiều partition key buộc phải phát lệnh tới toàn bộ các node (Scatter-Gather).' }
    ],
    writeAmplification: {
      en: 'Low: Normal operations incur zero migration overhead; rebalancing streams only partition deltas.',
      vi: 'Thấp: Hoạt động bình thường không tốn chi phí di dời; chỉ truyền dữ liệu khi có thay đổi cấu hình cụm.'
    },
    recoveryGuarantee: {
      en: 'Replication factor R (typically 3) ensures that even if 2 nodes fail simultaneously, data remains intact.',
      vi: 'Hệ số sao chép R (thường là 3) bảo đảm dù 2 node cùng chết đột ngột thì dữ liệu vẫn nguyên vẹn.'
    }
  },

  javaCode: `package com.database.internals.distributed;

import java.util.*;

/**
 * Pure Java 21 implementation of Consistent Hashing with Virtual Nodes.
 */
public class ConsistentHashRouter {
    private static final int DEFAULT_VNODE_COUNT = 3;
    private final TreeMap<Long, String> ring = new TreeMap<>();
    private final Map<String, Integer> physicalNodes = new HashMap<>();

    public void addNode(String nodeName, int vnodeCount) {
        physicalNodes.put(nodeName, vnodeCount);
        for (int i = 0; i < vnodeCount; i++) {
            long hash = hashFunction(nodeName + "-vnode-" + i);
            ring.put(hash, nodeName);
        }
    }

    public void removeNode(String nodeName) {
        int vnodeCount = physicalNodes.getOrDefault(nodeName, 0);
        for (int i = 0; i < vnodeCount; i++) {
            long hash = hashFunction(nodeName + "-vnode-" + i);
            ring.remove(hash);
        }
        physicalNodes.remove(nodeName);
    }

    // Step 1 & 2: Hash key and find next node moving clockwise
    public String routeKey(String key) {
        if (ring.isEmpty()) return null;

        // Step 1: Hash key onto 32-bit ring coordinate
        long hash = hashFunction(key);

        // Step 2: Clockwise search for next virtual node
        Map.Entry<Long, String> entry = ring.ceilingEntry(hash);
        if (entry == null) {
            // Wrap around to lowest hash on the ring
            entry = ring.firstEntry();
        }
        return entry.getValue();
    }

    // High-dispersion 32-bit hash function simulation (FNV-1a / MurmurHash)
    private long hashFunction(String key) {
        long hash = 0x811c9dc5;
        for (byte b : key.getBytes()) {
            hash ^= b;
            hash *= 0x01000193;
        }
        return hash & 0xFFFFFFFFL; // Positive unsigned 32-bit range
    }
}`
};
