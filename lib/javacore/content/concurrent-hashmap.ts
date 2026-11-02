import type { JavaCoreTopic } from '../types';

export const concurrentHashmap: JavaCoreTopic = {
  id: 'concurrent-hashmap',
  category: 'collections-internals',
  name: 'ConcurrentHashMap Lock-Free Reads & Node Locks',
  tagline: {
    en: 'Thread-safe hash tables: Volatile lock-free reads, CAS empty bucket inserts, synchronized node-level write locks, and ForwardingNode concurrent resizing.',
    vi: 'Bảng băm an toàn đa luồng: Đọc phi khóa qua volatile, chèn ô trống bằng CAS, khóa ghi ở cấp Node và đa luồng cùng resize bằng ForwardingNode.'
  },
  difficulty: 3,
  level: 'advanced',
  order: 19,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'Using Collections.synchronizedMap(map) places a coarse global mutex around all read and write operations. When thousands of concurrent threads read and write simultaneously, all threads serialize through a single lock, collapsing application throughput to single-core speeds.',
      vi: 'Dùng Collections.synchronizedMap(map) áp đặt một khóa Mutex toàn cục thô thiển lên mọi thao tác đọc và ghi. Khi hàng nghìn luồng đồng thời truy cập, tất cả đều phải xếp hàng qua một ổ khóa duy nhất, kéo sụt thông lượng của toàn hệ thống về tốc độ của 1 CPU core đơn lẻ.'
    },
    hardwareConstraint: {
      en: 'Global mutexes cause severe CPU cache-line bouncing and lock convoying. To scale across 64+ CPU cores, reads must never acquire locks, and writes must lock only the specific bucket being modified rather than locking neighboring memory lines.',
      vi: 'Khóa Mutex toàn cục gây ra hiện tượng nhảy dòng cache CPU và nghẽn hàng đợi (Lock Convoy). Để mở rộng trên các CPU 64+ core, luồng đọc tuyệt đối không được xin khóa, và luồng ghi chỉ được phép khóa đúng ô bucket đang sửa thay vì khóa lan sang các vùng nhớ lân cận.'
    },
    fundamentalSolution: {
      en: 'Java 8+ ConcurrentHashMap completely eliminates the legacy Segment lock array. Reads are 100% lock-free via volatile val and next pointers. When inserting into an empty bucket, it uses hardware CAS (compareAndSetNode). When inserting into an occupied bucket, it locks ONLY the head node of that bucket using synchronized(f). Resizing is collaborative: threads encounter ForwardingNodes (hash = -1) and assist in parallel table migration.',
      vi: 'ConcurrentHashMap từ Java 8+ đã loại bỏ hoàn toàn mảng khóa Segment cổ điển. Luồng đọc hoàn toàn phi khóa 100% nhờ các con trỏ volatile val và next. Khi chèn vào ô trống, nó dùng lệnh CAS phần cứng (compareAndSetNode). Khi chèn vào ô đã có dữ liệu, nó CHỈ khóa duy nhất node đầu tiên của ô đó bằng synchronized(f). Quá trình resize được phân tán: các luồng gặp ForwardingNode (hash = -1) sẽ cùng chung tay di dời dữ liệu song song.'
    },
    math: {
      formula: 'Concurrent Write Scalability = Up to N Simultaneous Writes (N = Number of Buckets)',
      description: {
        en: 'Two threads writing to different hash buckets (e.g. bucket 3 and bucket 12) execute simultaneously with zero lock contention.',
        vi: 'Hai luồng ghi vào hai bucket khác nhau (như bucket 3 và bucket 12) thực thi song song hoàn toàn với 0% tranh chấp khóa.'
      },
      timeComplexity: 'O(1) lock-free get(); O(1) synchronized node-level put()',
      spaceComplexity: 'Node<K, V> with volatile val and next references',
      memoryOverheadFormula: 'ForwardingNode Hash Marker = -1 (MOVED)'
    }
  },

  detailedTheory: {
    overview: {
      en: 'ConcurrentHashMap represents the pinnacle of Java concurrent data structure design. Evolving from the coarse 16-Segment partitioning of Java 7 to the lock-free CAS and fine-grained node-level synchronization of modern Java, it delivers massive multi-core throughput while maintaining strict memory consistency guarantees.',
      vi: 'ConcurrentHashMap đại diện cho đỉnh cao thiết kế cấu trúc dữ liệu đồng thời trong Java. Tiến hóa từ cơ chế phân mảnh 16 Segment thô sơ ở Java 7 sang cơ chế phi khóa CAS và khóa mịn ở cấp từng Node của Java hiện đại, nó mang lại thông lượng đa nhân khổng lồ trong khi vẫn bảo đảm tính nhất quán bộ nhớ nghiêm ngặt.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Why Lock-Free Reads Are Safe (Volatile Val & Next): How can get() execute with zero locks without reading corrupted or half-written nodes? Inside Node<K, V>, both val and next are declared volatile! Under the JMM, a volatile read guarantees observing the most recent volatile write. A get() traverses the chain via volatile reads, guaranteeing point-in-time consistency with zero synchronization overhead.',
        vi: '1. Vì Sao Luồng Đọc Hoàn Toàn Phi Khóa Mà Vẫn An Toàn: Làm thế nào hàm get() có thể chạy mà không cần khóa mà không bao giờ đọc phải node ghi dở? Trong Node<K, V>, cả hai trường val và next đều được khai báo là volatile! Theo quy tắc JMM, đọc biến volatile bảo đảm nhìn thấy thao tác ghi volatile gần nhất. Hàm get() duyệt danh sách qua các con trỏ volatile, bảo đảm tính nhất quán tức thì với 0% chi phí khóa.'
      },
      {
        en: '2. CAS Insertion on Empty Buckets: When a thread calls put() and finds that table[i] is null, it does not acquire any monitor lock! Instead, it allocates a Node and invokes compareAndSetNode(table, i, null, node). If CAS succeeds, the insertion completes in ~10ns. If another thread raced and filled the bucket, CAS fails, and the loop retries by falling back to synchronized node locking.',
        vi: '2. Chèn Bằng Lệnh CAS Trên Ô Bucket Trống: Khi một luồng gọi put() và thấy ô table[i] đang trống (null), nó không hề xin khóa monitor! Thay vào đó, nó tạo một Node và gọi lệnh compareAndSetNode(table, i, null, node). Nếu lệnh CAS thành công, thao tác chèn xong trong ~10ns. Nếu luồng khác nhanh chân hơn chèn trước, lệnh CAS thất bại, vòng lặp thử lại và chuyển sang cơ chế khóa node synchronized.'
      },
      {
        en: '3. Synchronized on Bucket Head Node (Node-Level Striping): When inserting into a non-empty bucket, HotSpot locks ONLY the first node of that bucket: synchronized (f). Because each bucket has its own independent head node, writes to bucket 2, bucket 8, and bucket 45 execute completely in parallel across different CPU cores with zero lock interference!',
        vi: '3. Khóa synchronized Trên Đúng Node Đầu Bucket: Khi chèn vào một ô đã có dữ liệu, HotSpot CHỈ khóa duy nhất node đầu tiên của ô đó: synchronized (f). Vì mỗi ô có node đầu độc lập, các luồng ghi vào bucket 2, bucket 8 và bucket 45 thực thi song song hoàn toàn trên các CPU core khác nhau mà không hề giẫm chân lên nhau!'
      },
      {
        en: '4. TreeBins & Read-Write Lock State: When a bucket treeifies at threshold 8, it does not store TreeNodes directly at the table head. Instead, it wraps the Red-Black tree inside a TreeBin. A TreeBin maintains a custom atomic state lock: reader threads acquire shared read access without blocking other readers, while tree rebalancing acquires an exclusive write lock.',
        vi: '4. TreeBins & Khóa Đọc-Ghi Cho Cây Đỏ Đen: Khi một bucket cây hóa ở ngưỡng 8, nó không đặt TreeNode trực tiếp ở đầu bảng. Thay vào đó, nó bọc Cây Đỏ Đen trong một TreeBin. TreeBin duy trì một khóa trạng thái riêng: các luồng đọc chia sẻ khóa đọc mà không chặn luồng đọc khác, trong khi thao tác quay cây cân bằng sẽ xin khóa ghi độc quyền.'
      },
      {
        en: '5. Collaborative Concurrent Resizing via ForwardingNode: In standard hash tables, resizing freezes all operations. In ConcurrentHashMap, resizing is collaborative! When the table doubles, a new table is allocated. As buckets are migrated, the old table bucket head is replaced by a special ForwardingNode (hash = -1, containing nextTable pointer). Other threads performing put() that hit a ForwardingNode invoke helpTransfer(), joining the migration effort in parallel!',
        vi: '5. Đa Luồng Cùng Chung Tay Resize Bằng ForwardingNode: Ở các bảng băm thông thường, việc resize làm đơ toàn bộ ứng dụng. Trong ConcurrentHashMap, việc resize được chia sẻ! Khi mảng tăng đôi, mảng mới được cấp phát. Khi một ô được di dời xong, node đầu ô cũ được thay thế bằng một ForwardingNode đặc biệt (mã hash = -1, chứa con trỏ tới nextTable). Các luồng khác đang định put() gặp ForwardingNode sẽ tự động gọi hàm helpTransfer() để cùng nhau di dời dữ liệu song song!'
      },
      {
        en: '6. CounterCells & High-Throughput size() Sizing: Calling size() on a concurrent map with thousands of threads updating size would cause massive CAS contention on a single volatile int size counter. ConcurrentHashMap adopts the LongAdder striping pattern: maintaining a baseCount plus an array of CounterCell objects. Threads increment separate cells, eliminating bus contention and calculating size() in O(Cells).',
        vi: '6. Đếm Số Lượng Siêu Tốc Bằng Mảng CounterCell: Gọi hàm size() trên một bản đồ đa luồng nếu chỉ dùng 1 biến size nguyên tử thì lệnh CAS sẽ bị nghẽn dữ dội. ConcurrentHashMap áp dụng mô hình phân dải của LongAdder: duy trì một biến baseCount cộng với một mảng các đối tượng CounterCell. Các luồng tăng số đếm trên các cell khác nhau, triệt tiêu tranh chấp bus và tính tổng size() cực nhanh.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'The Non-Atomic Check-Then-Act Race Condition: Writing if (!map.containsKey(key)) { map.put(key, val); } is NOT thread-safe! Between containsKey() and put(), another thread can insert a value, causing silent data corruption. Always use atomic compound methods: map.putIfAbsent(key, val), map.computeIfAbsent(key, k -> createVal()), or map.merge().',
        vi: 'Bẫy Điều Kiện Đua Check-Then-Act: Viết code if (!map.containsKey(key)) { map.put(key, val); } hoàn toàn KHÔNG an toàn đa luồng! Giữa lúc kiểm tra containsKey() và lúc put(), luồng khác có thể nhảy vào chèn dữ liệu, gây mất mát dữ liệu. Luôn sử dụng các phương thức nguyên tử: map.putIfAbsent(key, val), map.computeIfAbsent(key, k -> createVal()), hoặc map.merge().',
      },
      {
        en: 'Recursive computeIfAbsent Deadlock / IllegalStateException: Calling map.computeIfAbsent(key1, k -> map.computeIfAbsent(key2, ...)) where both keys hash to the same bucket causes a deadlocking recursion on the bucket monitor! In Java 9+, HotSpot throws java.lang.IllegalStateException: Recursive update to prevent infinite lockups.',
        vi: 'Deadlock Do Gọi Đệ Quy computeIfAbsent: Gọi lồng nhau map.computeIfAbsent(key1, k -> map.computeIfAbsent(key2, ...)) trong đó cả 2 key cùng băm vào 1 bucket sẽ gây deadlock đệ quy trên monitor của bucket đó! Từ Java 9+, HotSpot sẽ ném ngoại lệ IllegalStateException: Recursive update để ngăn chặn treo cứng hệ thống.',
      },
      {
        en: 'Weakly Consistent Iterators Missing Recent Updates: ConcurrentHashMap iterators are weakly consistent: they will never throw ConcurrentModificationException, but they reflect the state of the map at the moment the iterator was constructed. If other threads insert new entries after the iterator starts, those entries may or may not be observed.',
        vi: 'Iterator Nhất Quán Yếu (Weakly Consistent): Iterator của ConcurrentHashMap là nhất quán yếu: nó không bao giờ ném lỗi ConcurrentModificationException, nhưng nó chỉ phản ánh trạng thái tại mốc thời gian iterator được tạo ra. Các bản ghi do luồng khác chèn vào sau đó có thể sẽ không xuất hiện trong lần duyệt hiện tại.',
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'ConcurrentHashMap Table Array: ForwardingNodes, TreeBins & CounterCells',
      vi: 'Cấu Trúc Bảng ConcurrentHashMap: ForwardingNodes, TreeBins & Mảng CounterCells'
    },
    description: {
      en: 'Internal table array showing volatile Node chaining, TreeBin Red-Black structures, and ForwardingNodes (hash = -1) coordinating parallel concurrent resizing.',
      vi: 'Mảng bảng băm thể hiện chuỗi Node volatile, cấu trúc cây TreeBin và các ForwardingNode (hash = -1) điều phối resize song song.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| CONCURRENTHASHMAP IN-MEMORY ARCHITECTURE (table[index] with volatile val & next):                   |
+----------------------------------------------------------------------------------------------------+
| table[0]:  null  (New insertion acquires zero locks -> CAS compareAndSetNode)                     |
| table[1]:  [ Node (HEAD) hash=0x15, Key="A", volatile val=100 ] <--- [synchronized (head) lock]    |
|              -> [ Node: hash=0x25, Key="B", volatile val=200 ] (Volatile lock-free read path)       |
| table[2]:  [ ForwardingNode: hash = -1 (MOVED), nextTable -> points to 2x resized array ]           |
|              (Incoming threads detect MOVED and invoke helpTransfer() to resize concurrently!)     |
| table[3]:  [ TreeBin (HEAD): hash = -2 (Red-Black Root) Key="T1" ]                                  |
|              /                                  \\                                                   |
|        [ TreeNode Key="T0" ]              [ TreeNode Key="T2" ]                                     |
+----------------------------------------------------------------------------------------------------+
| SIZE COUNTER STRIPING (LongAdder Pattern avoiding CAS bus contention):                             |
|   volatile long baseCount = 10,420;                                                                |
|   volatile CounterCell[] counterCells = [ Cell#0: 125 | Cell#1: 340 | Cell#2: 890 | Cell#3: 410 ]; |
|   Total Size = baseCount + sum(counterCells)                                                       |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'volatile_val', size: 'Compressed Reference (4B)', description: { en: 'Declared volatile to guarantee immediate lock-free cross-core visibility for get() operations.', vi: 'Khai báo volatile bảo đảm luồng đọc get() luôn thấy dữ liệu mới nhất mà không cần xin khóa.' } },
      { name: 'volatile_next', size: 'Compressed Reference (4B)', description: { en: 'Volatile pointer to next node; guarantees safe traversal during concurrent node insertions.', vi: 'Con trỏ volatile tới node kế tiếp; bảo đảm duyệt an toàn khi đang có luồng khác chèn node.' } },
      { name: 'forwarding_node_hash', size: 'Special Int (-1)', description: { en: 'Sentinel hash value indicating bucket has been transferred to nextTable during concurrent resize.', vi: 'Giá trị hash canh gác (-1) báo hiệu ô này đã được chuyển sang nextTable khi resize.' } },
      { name: 'tree_bin_hash', size: 'Special Int (-2)', description: { en: 'Sentinel hash indicating bucket contains a Red-Black Tree protected by custom TreeBin lock state.', vi: 'Giá trị hash canh gác (-2) báo hiệu ô chứa Cây Đỏ Đen được bảo vệ bằng TreeBin.' } }
    ]
  },

  steps: [
    {
      id: 'cas-empty-bucket',
      title: { en: '1. Lock-Free CAS on Empty Bucket', vi: '1. Chèn Phi Khóa Bằng Lệnh CAS Vào Ô Trống' },
      phase: 'CAS_EMPTY_BUCKET',
      description: {
        en: 'The thread hashes the key to index i. If table[i] is null, it invokes casTabAt(table, i, null, new Node). If successful, the element is inserted in ~10ns without acquiring any monitor locks.',
        vi: 'Luồng băm key ra index i. Nếu table[i] đang trống (null), nó gọi hàm casTabAt(table, i, null, new Node). Nếu thành công, phần tử được chèn xong trong ~10ns mà không cần xin bất kỳ khóa nào.'
      },
      jvmRuntimeBehavior: {
        en: 'Single hardware CMPXCHG atomic instruction. Zero lock inflation.',
        vi: 'Một lệnh nguyên tử CMPXCHG phần cứng duy nhất. Không hề bị nâng cấp khóa.'
      },
      javaCodeLineMatch: 'if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value)))'
    },
    {
      id: 'lock-head-node',
      title: { en: '2. Synchronized on Bucket Head Node Only', vi: '2. Khóa synchronized Chỉ Trên Đúng Node Đầu Của Bucket' },
      phase: 'NODE_LEVEL_LOCK',
      description: {
        en: 'If table[i] is occupied, the thread locks ONLY the head node: synchronized (f). It traverses the list, updating the value if key matches or appending a new Node to the tail. Other buckets remain completely unlocked!',
        vi: 'Nếu table[i] đã có dữ liệu, luồng CHỈ khóa duy nhất node đầu tiên: synchronized (f). Nó duyệt danh sách, cập nhật giá trị nếu trùng key hoặc nối thêm Node vào đuôi. Toàn bộ các bucket khác vẫn hoàn toàn không bị khóa!'
      },
      jvmRuntimeBehavior: {
        en: 'Fine-grained node lock. Hundreds of threads write to different buckets simultaneously.',
        vi: 'Khóa mịn ở cấp node. Hàng trăm luồng có thể cùng ghi vào các bucket khác nhau đồng thời.'
      },
      javaCodeLineMatch: 'synchronized (f) { if (tabAt(tab, i) == f) { ... } }'
    },
    {
      id: 'forwarding-transfer',
      title: { en: '3. Concurrent Resizing & ForwardingNode Help', vi: '3. Resize Đa Luồng Song Song & Chung Tay Bằng ForwardingNode' },
      phase: 'FORWARDING_TRANSFER',
      description: {
        en: 'When table doubles, transferred buckets are replaced by a ForwardingNode (hash = -1). Any incoming thread detecting MOVED calls helpTransfer(), actively helping to migrate remaining buckets in parallel!',
        vi: 'Khi mảng nhân đôi, các ô đã di dời xong được thay thế bằng ForwardingNode (hash = -1). Bất kỳ luồng nào phát hiện cờ MOVED sẽ gọi hàm helpTransfer(), chung tay di dời các bucket còn lại song song!'
      },
      jvmRuntimeBehavior: {
        en: 'Multi-threaded collaborative migration. Reads transparently forward to nextTable.',
        vi: 'Di dời dữ liệu cộng tác đa luồng. Luồng đọc tự động chuyển tiếp sang nextTable mượt mà.'
      },
      javaCodeLineMatch: 'else if ((fh = f.hash) == MOVED) tab = helpTransfer(tab, f);'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'OpenJDK / Oracle HotSpot',
      implementationName: 'Java 8+ CAS & Node Synchronized ConcurrentHashMap',
      keyMechanism: {
        en: 'Eliminated Segment locks in favor of CAS on empty buckets and synchronized on head nodes. Implements TreeBins for Red-Black trees and ForwardingNodes for cooperative resizing.',
        vi: 'Loại bỏ khóa Segment cổ điển, chuyển sang dùng CAS trên ô trống và synchronized trên node đầu. Dùng TreeBin cho Cây Đỏ Đen và ForwardingNode để resize cộng tác.'
      },
      defaultFlags: 'Standard JDK java.util.concurrent',
      architectureNote: {
        en: 'Designed by Doug Lea. Scales linearly across 128+ CPU cores with 99.9% read-heavy workloads.',
        vi: 'Do Doug Lea thiết kế. Mở rộng tuyến tính trên các máy chủ 128+ core với tải 99.9% là đọc.'
      }
    },
    {
      jvmEngine: 'Azul Zing / Prime JVM',
      implementationName: 'C4 Lock-Free NonBlockingHashMap',
      keyMechanism: {
        en: 'Cliff Click’s 100% lock-free hash map implementation. Features zero locks on both reads and writes using state-machine CAS state transitions across memory words.',
        vi: 'Bản đồ băm phi khóa 100% do Cliff Click phát minh. Hoàn toàn không dùng khóa cho cả đọc lẫn ghi nhờ máy trạng thái CAS trên từng từ nhớ.'
      },
      defaultFlags: '-XX:+UseC4GC',
      architectureNote: {
        en: 'Zero thread pausing or monitor inflation even under extreme write contention in financial HFT engines.',
        vi: 'Không có hiện tượng dừng luồng hay nâng cấp khóa kể cả dưới tải ghi dữ dội trong các hệ thống HFT tài chính.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Ultra-fast lock-free reads (~5ns) executing concurrently with hundreds of parallel writers.', vi: 'Tốc độ đọc phi khóa cực nhanh (~5ns) thực thi song song mượt mà cùng hàng trăm luồng ghi.' },
      { en: 'High write concurrency: locks only the individual bucket head instead of global table mutexes.', vi: 'Khả năng ghi đồng thời cao: chỉ khóa duy nhất đầu ô bucket thay vì khóa toàn bộ bảng.' }
    ],
    cons: [
      { en: 'Size calculation is approximate under continuous concurrent updates.', vi: 'Phép tính kích thước size() chỉ mang tính tương đối khi liên tục có các luồng update.' },
      { en: 'Higher complexity: compound methods (computeIfAbsent) must be used instead of manual check-then-act.', vi: 'Độ phức tạp cao hơn: bắt buộc phải dùng các hàm ghép nguyên tử (computeIfAbsent) thay vì tự check-then-act.' }
    ],
    memoryFootprint: {
      en: 'Moderate: Slightly higher than HashMap due to CounterCells and volatile reference fields.',
      vi: 'Trung bình: Nhỉnh hơn một chút so với HashMap do có thêm mảng CounterCell và các trường volatile.'
    },
    jvmSpecificationGuarantee: {
      en: 'ConcurrentMap specification compliance: Guarantees atomic computeIfAbsent and thread-safe operations.',
      vi: 'Tuân thủ toàn diện đặc tả ConcurrentMap: Bảo đảm tính nguyên tử của computeIfAbsent và an toàn đa luồng.'
    }
  },

  javaCode: `package com.enterprise.jvm.collections;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Pure Java 21 Educational Masterclass: ConcurrentHashMap Under The Hood
 * Demonstrates:
 *  1. Lock-free volatile reads executing in nanoseconds
 *  2. Atomic computeIfAbsent avoiding Check-Then-Act race conditions
 *  3. Concurrent multi-threaded writes without global mutex bottlenecks
 */
public class ConcurrentHashMapDemo {

    private static final ConcurrentHashMap<String, AtomicLong> INVENTORY_CACHE = new ConcurrentHashMap<>();

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== CONCURRENTHASHMAP INTERNAL MECHANICS MASTERCLASS ===");

        int numWorkers = 8;
        int operationsPerWorker = 25_000;
        CountDownLatch latch = new CountDownLatch(numWorkers);

        long start = System.currentTimeMillis();

        for (int t = 0; t < numWorkers; t++) {
            final String workerName = "worker-" + t;
            Thread.ofVirtual().name(workerName).start(() -> {
                for (int i = 0; i < operationsPerWorker; i++) {
                    String itemKey = "SKU_" + (i % 20); // 20 unique inventory items

                    // ATOMIC COMPUTEIFABSENT:
                    // Thread-safe atomic initialization! If absent, CAS installs the value.
                    // If present, returns existing AtomicLong without locking other buckets!
                    AtomicLong stock = INVENTORY_CACHE.computeIfAbsent(itemKey, k -> new AtomicLong(0));
                    stock.incrementAndGet();
                }
                latch.countDown();
            });
        }

        latch.await();
        long duration = System.currentTimeMillis() - start;

        System.out.printf("Processed %d atomic updates across %d buckets in %d ms!%n",
                numWorkers * operationsPerWorker, INVENTORY_CACHE.size(), duration);

        System.out.println("Sample Inventory SKU_0 Final Count: " + INVENTORY_CACHE.get("SKU_0").get());
    }
}`,

  jvmFlagsCode: `# ===================================================================
# Sizing ConcurrentHashMap for High-Throughput Microservices
# ===================================================================
# In Java 8+, concurrencyLevel is an optional sizing hint:
# ConcurrentHashMap(initialCapacity, loadFactor, concurrencyLevel)
ConcurrentHashMap<String, UserSession> map = new ConcurrentHashMap<>(131_072, 0.75f, 64);`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c com.enterprise.jvm.collections.ConcurrentHashMapDemo
public static void main(java.lang.String[]) throws java.lang.InterruptedException;
  Code:
   0: getstatic     #7   // Field java/lang/System.out:Ljava/io/PrintStream;
   3: ldc           #9   // String === CONCURRENTHASHMAP INTERNAL MECHANICS MASTERCLASS ===
   5: invokevirtual #11  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
   8: bipush        8
  10: istore_1
  11: ldc           #17  // int 25000
  13: istore_2
  14: new           #19  // class java/util/concurrent/CountDownLatch
  17: dup
  18: iload_1
  19: invokespecial #21  // Method java/util/concurrent/CountDownLatch."<init>":(I)V
  22: ...
  45: invokestatic  #37  // Method java/lang/Thread.ofVirtual:()Ljava/lang/Thread$Builder$OfVirtual;
  48: ...
  60: invokeinterface #47, 2 // InterfaceMethod java/lang/Thread$Builder$OfVirtual.start:(Ljava/lang/Runnable;)
  65: pop
  66: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'Why is Hashtable / Collections.synchronizedMap() obsolete, and how does ConcurrentHashMap outperform them?',
        vi: 'Tại sao Hashtable và Collections.synchronizedMap() đã lỗi thời, và ConcurrentHashMap vượt trội hơn như thế nào?'
      },
      answer: {
        en: 'Hashtable and Collections.synchronizedMap() wrap the ENTIRE map in a single monolithic synchronized lock. Even if 100 threads are reading or writing to completely different buckets, only ONE thread can execute at a time while 99 threads are blocked! ConcurrentHashMap eliminates global table locking: in Java 8+, read operations (get) are 100% lock-free via volatile reads, inserting into an empty bucket uses lock-free atomic CAS, and inserting into an occupied bucket locks ONLY that single bucket\'s head node (synchronized(f)). Threads writing to different buckets execute simultaneously in parallel!',
        vi: 'Hashtable và Collections.synchronizedMap() bọc TOÀN BỘ bảng băm bằng một chiếc khóa synchronized duy nhất. Kể cả khi 100 luồng đọc ghi vào 100 ô nhớ hoàn toàn khác nhau, chỉ duy nhất 1 luồng được chạy, 99 luồng còn lại bị chặn đứng! ConcurrentHashMap xóa bỏ khóa toàn cục: từ Java 8, thao tác đọc (get) hoàn toàn KHÔNG KHÓA qua biến volatile, chèn vào ô trống dùng CAS không khóa, và chèn vào ô đã có dữ liệu thì CHỈ KHÓA DUY NHẤT nút đầu của đúng ô nhớ đó (synchronized(f)). Các luồng thao tác trên các ô nhớ khác nhau chạy song song 100%!'
      },
      trapWarning: {
        en: 'Do not claim ConcurrentHashMap still uses 16 Segment locks. Segment striping was used in Java 7; Java 8 completely replaced Segments with CAS + synchronized on individual bucket head nodes.',
        vi: 'Đừng nói ConcurrentHashMap dùng 16 Segment lock. Cơ chế chia đoạn Segment là của Java 7; từ Java 8, Segment đã bị loại bỏ hoàn toàn và thay thế bằng CAS + synchronized trên từng nút đầu của bucket.'
      },
      proTip: {
        en: 'Explain why ConcurrentHashMap forbids null keys and null values: in a concurrent context, if map.get(k) returned null, you could not tell whether the key is missing or the key mapped to null without calling containsKey(), which creates an atomic check-then-act race condition!',
        vi: 'Giải thích lý do ConcurrentHashMap CẤM giá trị null cho cả key và value: trong môi trường đa luồng, nếu map.get(key) trả về null, bạn không thể phân biệt được là key không tồn tại hay key có giá trị null. Nếu phải gọi thêm containsKey() thì giữa 2 lệnh sẽ sinh ra lỗi Race Condition nguy hiểm!'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'How does ConcurrentHashMap achieve lock-free reads in get() without synchronized locks?',
        vi: 'Làm thế nào ConcurrentHashMap đạt được khả năng đọc không khóa (lock-free) trong hàm get()?'
      },
      answer: {
        en: 'ConcurrentHashMap.get() requires ZERO locks. It achieves complete thread-safety through 3 hardware mechanisms: 1. The bucket array table is marked volatile. 2. Array slot access uses Unsafe.getObjectVolatile() (tabAt) to guarantee visibility of recently allocated nodes. 3. Inside the Node<K, V> class, the val reference and next pointer are both declared volatile! Under the JMM, a write to a volatile field happens-before any subsequent read. Therefore, a reading thread is guaranteed to observe the most recent value and the fully linked node structure without holding any mutex.',
        vi: 'Hàm ConcurrentHashMap.get() KHÔNG DÙNG BẤT KỲ KHÓA NÀO. Nó đạt được sự an toàn đa luồng nhờ 3 cơ chế phần cứng: 1. Mảng bucket table được khai báo volatile. 2. Truy xuất phần tử trong mảng qua hàm Unsafe.getObjectVolatile() (tabAt) để thấy ngay các nút mới tạo. 3. Bên trong class Node<K,V>, cả trường giá trị val và con trỏ next đều là biến volatile! Theo JMM, thao tác ghi volatile luôn happens-before thao tác đọc. Do đó, luồng đọc luôn nhìn thấy giá trị mới nhất mà không cần tranh chấp khóa.'
      },
      trapWarning: {
        en: 'get() never blocks, even while the table is undergoing a massive multi-threaded resize! If it encounters a ForwardingNode (hash = MOVED), it seamlessly follows the nextTable pointer to read the new location.',
        vi: 'Hàm get() không bao giờ bị dừng, kể cả khi cả bảng băm đang được mở rộng (resize)! Nếu gặp nút ForwardingNode, nó tự động đi theo con trỏ nextTable để đọc dữ liệu ở bảng mới.'
      },
      proTip: {
        en: 'Use computeIfAbsent() for atomic check-then-act cache updates: map.computeIfAbsent(key, k -> computeExpensiveVal(k)) guarantees the computation runs exactly once under the bucket lock.',
        vi: 'Khuyên dùng computeIfAbsent() để cập nhật cache: hàm này bảo đảm khối tính toán chỉ chạy đúng 1 lần duy nhất dưới sự bảo vệ của khóa nút bucket.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'How does ConcurrentHashMap perform multi-threaded collaborative resizing via ForwardingNode (hash = -1)?',
        vi: 'ConcurrentHashMap thực hiện việc mở rộng mảng (resize) đa luồng qua ForwardingNode (hash = -1) như thế nào?'
      },
      answer: {
        en: 'When resizing starts, the initializing thread allocates nextTable (size * 2) and sets the transfer stride (default 16 buckets). As threads perform put() operations, if they encounter a bucket that has already been migrated, they find a special sentinel node: ForwardingNode with hash = MOVED (-1). Instead of blocking, the arriving thread PARTICIPATES in the resize! It reads the transferIndex, claims a stride of 16 un-migrated buckets, and helps transfer nodes concurrently. Once a bucket\'s nodes are migrated to nextTable, a ForwardingNode is left in the old table slot. Any get() hitting that slot redirects to nextTable immediately. Resizing completes in parallel across all worker threads!',
        vi: 'Khi bắt đầu resize, luồng đầu tiên cấp phát mảng nextTable (gấp đôi kích thước) và chia dải công việc (mỗi dải 16 bucket). Khi các luồng khác vào gọi put(), nếu gặp một ô nhớ đã được di dời xong, nó thấy một nút đặc biệt là ForwardingNode với hash = MOVED (-1). Thay vì đứng chờ, luồng mới đến SẼ CÙNG THAM GIA RESIZE! Nó nhận một dải 16 bucket chưa chuyển và copy dữ liệu song song. Sau khi chuyển xong 1 bucket, một nút ForwardingNode được cắm lại ở bảng cũ. Bất kỳ lệnh get() nào rơi vào nút này sẽ tự chuyển hướng sang bảng mới. Quá trình resize được hoàn thành cực nhanh nhờ sức mạnh của tất cả các luồng cùng hỗ trợ!'
      },
      trapWarning: {
        en: 'Do not confuse size() with mappingCount(). In high-concurrency environments, size() returns an int capped at Integer.MAX_VALUE. Always use mappingCount(), which returns a long and avoids overflow for billion-element maps.',
        vi: 'Đừng nhầm size() với mappingCount(). Dưới môi trường thông lượng lớn, hàm size() trả về int bị giới hạn ở 2 tỷ phần tử. Luôn dùng mappingCount() trả về kiểu long để không bị tràn số.'
      },
      proTip: {
        en: 'Explain CounterCell: ConcurrentHashMap avoids single atomic variable contention for its size counter by using a cell-striped counter identical to LongAdder (CounterCell[]), achieving blazing O(1) concurrent size tracking.',
        vi: 'Cơ chế tính size: ConcurrentHashMap không dùng một biến đếm duy nhất (sẽ bị nghẽn CAS). Nó dùng mảng CounterCell[] y hệt LongAdder để phân tán việc đếm số phần tử trên nhiều luồng.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'How does TreeBin manage concurrent tree modifications and read operations in ConcurrentHashMap, and what is the notorious JDK-8062841 recursive computeIfAbsent deadlock bug?',
        vi: 'Cấu trúc TreeBin điều phối các thao tác sửa đổi cây và đọc đồng thời trong ConcurrentHashMap như thế nào, và lỗi deadlock đệ quy kinh điển JDK-8062841 của computeIfAbsent là gì?'
      },
      answer: {
        en: '1. TreeBin Concurrency Mechanics: When a bin exceeds 8 elements and total map capacity >= 64, ConcurrentHashMap treeifies the bin into a Red-Black Tree wrapped in a TreeBin. Crucially, TreeBin does NOT use standard Java locks to synchronize tree searches! Instead, it maintains a custom volatile int lockState: WRITER (1), WAITER (2), and READER (4). While reader threads are traversing the tree (holding the reader lock count), if an inserting thread arrives, the writer CANNOT mutate the red-black pointers. Rather than blocking, the writer thread parks via LockSupport.park(), OR the readers temporarily fall back to traversing the simple linear doubly-linked list of TreeNode pointers (which TreeBin preserves alongside the tree!) without acquiring any locks at all! 2. The JDK-8062841 Recursive Deadlock Bug: computeIfAbsent() holds the synchronized lock on the bucket head node throughout the execution of the mappingFunction. If the mappingFunction recursively invokes computeIfAbsent() or put() on the SAME map with a key that hashes to the SAME bucket, the thread attempts to acquire the lock it already holds or blocks waiting for its own computation to finish—triggering an immediate unrecoverable self-deadlock or cross-thread deadlock! Best practice: Never perform recursive or cross-key map mutations inside a computeIfAbsent lambda; use dedicated multi-level caches (Caffeine) instead.',
        vi: '1. Cơ chế đồng bộ trong TreeBin: Khi một bucket vượt quá 8 phần tử và tổng kích thước map >= 64, bucket chuyển thành Cây Đỏ-Đen được bọc trong một đối tượng TreeBin. Điểm đặc sắc là TreeBin KHÔNG dùng khóa Java thông thường để đồng bộ các phép tìm kiếm cây! Thay vào đó, nó duy trì một biến volatile int lockState tùy biến: bit WRITER (1), WAITER (2) và READER (4). Khi các luồng đọc đang duyệt cây, nếu có luồng ghi đến muốn cân bằng lại cây, luồng ghi không được phép sửa con trỏ. Thay vì bắt luồng đọc phải dừng lại, các luồng đọc sẽ tự động chuyển sang duyệt danh sách liên kết kép (được TreeBin duy trì song song với cây!) hoàn toàn không tốn một chút khóa nào! 2. Bug Deadlock Đệ quy JDK-8062841: computeIfAbsent() giữ khóa synchronized trên nút đầu của bucket trong suốt quá trình hàm lambda mappingFunction chạy. Nếu bên trong lambda đó lại vô tình gọi tiếp computeIfAbsent() hoặc put() vào CÙNG bảng băm với một key khác mà vô tình băm vào CÙNG một bucket, luồng sẽ tự khóa chính mình hoặc gây deadlock chéo giữa các luồng! Lời khuyên vàng: Tuyệt đối không thực hiện sửa đổi map đệ quy bên trong computeIfAbsent; hãy dùng thư viện cache chuyên dụng như Caffeine.'
      },
      trapWarning: {
        en: 'Treeification only occurs if table.length >= 64 (MIN_TREEIFY_CAPACITY). If a single bucket hits 8 elements but table length is less than 64, ConcurrentHashMap resizes (doubles) the table instead of treeifying!',
        vi: 'Cơ chế biến thành cây (Treeify) CHỈ XẢY RA khi kích thước mảng table.length >= 64. Nếu một bucket bị đụng độ 8 phần tử nhưng mảng vẫn nhỏ hơn 64, ConcurrentHashMap sẽ chọn cách MỞ RỘNG (Resize gấp đôi) bảng chứ chưa thèm tạo cây!'
      },
      proTip: {
        en: 'Highlight the distinction between Node and TreeBin: A regular Node uses standard synchronized(node) on the bucket head. TreeBin acts as a permanent proxy head node that coordinates its internal read/write states using volatile state bits and LockSupport.park/unpark.',
        vi: 'Phân biệt Node và TreeBin: Node thông thường dùng synchronized(node) trên nút đầu. TreeBin đóng vai trò là một nút proxy đại diện vĩnh viễn ở đầu bucket, tự điều phối trạng thái đọc/ghi bên trong bằng các bit volatile và LockSupport.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'Concurrent computeIfAbsent Recursive Deadlock & Unsized Session Map Resizing Storm',
      vi: 'Khóa Chết Deadlock Đệ Quy Trong computeIfAbsent & Bão Mở Rộng Kích Thước Bảng Băm'
    },
    businessContext: {
      en: 'A cloud security identity service verifies JWT tokens and caches active user permission grants for 90,000 concurrent enterprise sessions.',
      vi: 'Dịch vụ xác thực danh tính đám mây kiểm tra mã JWT và lưu đệm quyền hạn người dùng cho 90,000 phiên đăng nhập đồng thời.'
    },
    problemDescription: {
      en: 'To prevent duplicate database hits, developers used: sessionMap.computeIfAbsent(token, k -> loadUserWithRoles(k)). Inside the loadUserWithRoles lambda, a secondary call was made to fetch tenant permissions, which executed sessionMap.computeIfAbsent(tenantKey, ...). Because computeIfAbsent locks the head node of the bucket (synchronized(f)), if token and tenantKey hashed to the exact same bucket slot, the thread attempted to re-enter a locked node or two threads locked each other reciprocally, causing an immediate permanent thread deadlock! Furthermore, initializing new ConcurrentHashMap<>() with the default capacity of 16 caused the table to resize 17 consecutive times as sessions climbed to 400,000, triggering massive ForwardingNode migration churn and locking up request threads.',
      vi: 'Để tránh việc truy vấn cơ sở dữ liệu trùng lặp, lập trình viên sử dụng: sessionMap.computeIfAbsent(token, k -> loadUserWithRoles(k)). Bên trong hàm lambda loadUserWithRoles, code lại tiếp tục gọi lấy quyền của tenant: sessionMap.computeIfAbsent(tenantKey, ...). Do computeIfAbsent khóa trực tiếp lên nút đầu của bucket (synchronized(f)), nếu token và tenantKey vô tình rơi vào cùng một bucket slot (hoặc hai luồng chờ chéo nhau), hệ thống ngay lập tức rơi vào bế tắc khóa chết (Deadlock) vĩnh viễn! Thêm vào đó, việc khởi tạo new ConcurrentHashMap<>() mặc định 16 phần tử khiến mảng phải resize liên tiếp 17 lần khi số session chạm mốc 400,000, gây ra cơn bão di dời dữ liệu ForwardingNode làm đơ toàn bộ các luồng request.'
    },
    whyNaiveFails: {
      en: 'Restarting pods or increasing thread pools only led to faster deadlocks: once two worker threads blocked each other on mutual computeIfAbsent calls, all subsequent requests queued behind them until the entire container thread pool was exhausted.',
      vi: 'Khởi động lại pod hay tăng thêm luồng worker chỉ làm deadlock xuất hiện nhanh hơn: một khi 2 luồng đã khóa chéo nhau trong computeIfAbsent, toàn bộ các request theo sau sẽ bị dồn ứ cho đến khi cạn kiệt toàn bộ thread pool của container.'
    },
    coreSolution: {
      en: '1. Strictly forbid recursive mutations on the same ConcurrentHashMap inside compute/computeIfAbsent lambdas; decouple tenant lookups into a separate dedicated map or compute external data BEFORE writing into the cache. 2. Pre-size the ConcurrentHashMap with peak capacity: new ConcurrentHashMap<>((int)(expected / 0.75f) + 1). 3. For enterprise caching requiring automatic TTL expiration and bounded memory, migrate to Caffeine Cache (which utilizes an optimized ConcurrentHashMap under the hood with W-TinyLFU eviction).',
      vi: '1. Tuyệt đối cấm các thao tác gọi đệ quy hoặc sửa đổi trên cùng một ConcurrentHashMap bên trong khối lambda của compute/computeIfAbsent; tách biệt việc tra cứu tenant sang một Map riêng hoặc tính toán dữ liệu XONG XUÔI rồi mới ghi vào Map. 2. Định hình trước dung lượng tối đa new ConcurrentHashMap<>((int)(expected / 0.75f) + 1). 3. Với các bộ đệm cần tự động hết hạn TTL và giới hạn dung lượng, chuyển sang dùng thư viện Caffeine Cache (được xây dựng trên nền tảng ConcurrentHashMap tối ưu kết hợp thuật toán W-TinyLFU).'
    },
    productionCode: `// Production Safe Concurrent Caching Architecture: Avoiding Deadlocks
package com.security.session;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class HighConcurrencySessionCache {

    // 1. PRE-SIZED CAPACITY: 500,000 peak sessions with 0.75 load factor
    // Eliminates 17 expensive multi-threaded collaborative resizing cycles!
    private static final int INITIAL_CAPACITY = (int) (500_000 / 0.75f) + 1;
    private final Map<String, UserSession> sessionCache = new ConcurrentHashMap<>(INITIAL_CAPACITY);

    // Dedicated independent map: prevents cross-bucket recursive deadlock!
    private final Map<String, TenantConfig> tenantCache = new ConcurrentHashMap<>(1024);

    public UserSession getOrCreateSession(String token, String tenantId) {
        // 2. TWO-PHASE RETRIEVAL: Check first via lock-free get()
        UserSession session = sessionCache.get(token);
        if (session != null) {
            return session;
        }

        // 3. COMPUTE EXTERNAL DATA FIRST (Outside of map locking scope!)
        TenantConfig tenantConfig = tenantCache.computeIfAbsent(tenantId, this::fetchTenantFromDb);
        UserSession newSession = authenticateAndBuildSession(token, tenantConfig);

        // 4. ATOMIC PUT-IF-ABSENT: Zero recursive lock contention
        UserSession existing = sessionCache.putIfAbsent(token, newSession);
        return existing != null ? existing : newSession;
    }

    private TenantConfig fetchTenantFromDb(String tid) {
        return new TenantConfig(tid, "ENTERPRISE_TIER");
    }

    private UserSession authenticateAndBuildSession(String token, TenantConfig tenant) {
        return new UserSession(token, "user_101", tenant);
    }

    public record TenantConfig(String tenantId, String tier) {}
    public record UserSession(String token, String userId, TenantConfig tenant) {}
}`,
    architectureImpact: {
      en: 'Zero computeIfAbsent deadlocks; Session lookup P99 latency dropped from 240ms down to 0.18ms; 17 resizing GC allocations completely eliminated; Sustained 92,000 requests/second with zero lock contention.',
      vi: 'Triệt tiêu 100% lỗi khóa chết deadlock; Độ trễ tra cứu session P99 giảm từ 240ms xuống chỉ còn 0.18ms; Xóa bỏ hoàn toàn 17 đợt dừng hệ thống để resize bảng băm; Duy trì thông lượng 92,000 request/giây với 0 lần nghẽn khóa.'
    }
  }
};
