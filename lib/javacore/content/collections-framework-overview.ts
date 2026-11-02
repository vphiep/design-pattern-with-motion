import type { JavaCoreTopic } from '../types';

export const collectionsFrameworkOverviewTopic: JavaCoreTopic = {
  id: 'collections-framework-overview',
  category: 'collections-internals',
  name: 'Java Collections Framework (List, Set, Queue, Map)',
  tagline: {
    en: 'Architecture and operational physics of ArrayList vs LinkedList, HashSet vs TreeSet, ArrayDeque ring buffers, and fail-fast modCount iterators.',
    vi: 'Kiến trúc và cơ chế vật lý: ArrayList vs LinkedList, HashSet vs TreeSet, bộ đệm vòng ArrayDeque và cơ chế duyệt fail-fast modCount.'
  },
  difficulty: 1,
  level: 'basic',
  order: 6,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      en: 'Every enterprise system processes sets of business entities (orders, users, transactions). Choosing the wrong collection type—such as using LinkedList for indexed access or iterating over a heavy synchronized collection—causes brutal 100x CPU throughput degradation, massive pointer memory bloat, and unexpected ConcurrentModificationExceptions.',
      vi: 'Mọi hệ thống doanh nghiệp đều xử lý các tập hợp thực thể nghiệp vụ (đơn hàng, người dùng, giao dịch). Chọn sai cấu trúc dữ liệu—như dùng LinkedList để tra cứu chỉ mục hoặc duyệt qua danh sách bị khóa thô—sẽ làm sụt giảm 100 lần thông lượng CPU, lãng phí bộ nhớ con trỏ và phát sinh ngoại lệ ConcurrentModificationException đột ngột.'
    },
    hardwareConstraint: {
      en: 'CPU L1 Data Caches read contiguous memory in 64-byte Cache Lines. An ArrayList packs object pointers into a contiguous array, allowing CPU hardware prefetchers to anticipate memory loads at 0.5ns. In stark contrast, LinkedList stores every element in a separate Node object scattered randomly across the Heap, inducing a catastrophic CPU Cache Miss (~80ns) on EVERY SINGLE element traversal!',
      vi: 'Cache L1 của CPU đọc bộ nhớ liên tục theo từng khối 64-byte Cache Line. ArrayList lưu các con trỏ trong một mảng liên tục, cho phép phần cứng CPU nạp trước dữ liệu chỉ tốn 0.5ns. Ngược lại, LinkedList lưu mỗi phần tử vào một đối tượng Node độc lập rải rác trên Heap, gây ra một lần CPU Cache Miss đắt đỏ (~80ns) trên TỪNG BƯỚC DUYỆT PHẦN TỬ!'
    },
    fundamentalSolution: {
      en: 'Java provides a unified hierarchy rooted in Collection and Map: 1. List (ordered, indexed): ArrayList (dynamic array resizing by 1.5x) vs LinkedList. 2. Set (unique): HashSet (backed by HashMap) vs TreeSet (Red-Black TreeMap O(log N)). 3. Queue/Deque: ArrayDeque (circular ring buffer array, significantly faster than LinkedList for FIFO/LIFO). 4. Fail-Fast mechanism: Tracks modifications via a modCount field; concurrent mutation during iteration throws ConcurrentModificationException immediately.',
      vi: 'Java cung cấp hệ thống phân cấp chuẩn hóa xoay quanh Collection và Map: 1. List (có thứ tự, chỉ mục): ArrayList (co giãn mảng gấp 1.5 lần) vs LinkedList. 2. Set (duy nhất): HashSet (dựa trên HashMap) vs TreeSet (Cây đỏ đen O(log N)). 3. Queue/Deque: ArrayDeque (mảng bộ đệm vòng, nhanh vượt trội so với LinkedList). 4. Cơ chế Fail-Fast: Theo dõi sửa đổi qua biến đếm modCount; nếu có luồng sửa đổi danh sách khi đang duyệt iterator, ngoại lệ ConcurrentModificationException sẽ được ném ra ngay lập tức.'
    },
    math: {
      formula: 'ArrayList_Growth = oldCapacity + (oldCapacity >> 1) = 1.5 * oldCapacity; LinkedList_Node_Overhead = Node [24B] + 2 Pointers [8B] = 32B per element',
      description: {
        en: 'ArrayList amortized insertion time is O(1). Resizing occurs when size == capacity, copying elements via System.arraycopy (native memmove). LinkedList incurs 32 bytes of pointer overhead per element on 64-bit JVM.',
        vi: 'Thời gian chèn trung bình của ArrayList là O(1). Khi mảng đầy, nó mở rộng gấp 1.5 lần bằng System.arraycopy (mã máy memmove siêu tốc). LinkedList tốn 32 byte overhead cho mỗi phần tử trên JVM 64-bit.'
      },
      timeComplexity: 'ArrayList: O(1) indexed get, O(1) amortized add; LinkedList: O(N) indexed get, O(1) head/tail add',
      spaceComplexity: 'ArrayList: Contiguous 4B reference array; LinkedList: Dispersed 24B Node objects + pointers',
      memoryOverheadFormula: 'LinkedList Overhead = (N * 24B Node + N * 8B Pointers) = 32N Bytes vs 4N Bytes in ArrayList'
    }
  },

  memoryLayout: {
    title: {
      en: 'Physical Memory Layout: Contiguous ArrayList vs Dispersed LinkedList Heap Nodes',
      vi: 'Bố Cục Ô Nhớ Vật Lý: Mảng Liên Tục ArrayList vs Các Nút Rời Rạc LinkedList Trên Heap'
    },
    description: {
      en: 'ArrayList stores a single contiguous Object[] array pointing to elements, maximizing CPU cache locality. LinkedList allocates an independent Node object for each item, with item, next, and prev references.',
      vi: 'ArrayList lưu một mảng Object[] liên tục, tối ưu tối đa tính cục bộ của CPU Cache. LinkedList cấp phát mỗi phần tử là một đối tượng Node độc lập, chứa tham chiếu item, next và prev.'
    },
    asciiDiagram: `
+-----------------------------------------------------------------------------------------+
|  ARRAYLIST PHYSICAL MEMORY: elementData = Object[] (Contiguous in RAM)                  |
|  [Slot 0: 0x10A0] -> [Slot 1: 0x10A4] -> [Slot 2: 0x10A8] -> [Slot 3: 0x10AC] ...       |
|  Hardware CPU Prefetcher loads all 4-8 slots in ONE 64-byte Cache Line (0.5ns)!        |
+-----------------------------------------------------------------------------------------+

VS

+-----------------------------------------------------------------------------------------+
|  LINKEDLIST DISPERSED NODES (Scattered across Heap)                                    |
|  Node @ 0x7FFA0010 (item, next: 0x7FFB8820, prev: null)                                |
|          |                                                                              |
|          +---> 80ns Cache Miss to reach Node @ 0x7FFB8820 (item, next: 0x7FFC0190)     |
|                      |                                                                  |
|                      +---> 80ns Cache Miss to reach Node @ 0x7FFC0190 ...              |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'ArrayList elementData', size: '4 Bytes * Capacity', description: { en: 'Contiguous array of compressed 32-bit reference pointers.', vi: 'Mảng con trỏ nén 32-bit liên tục trong RAM.' } },
      { name: 'LinkedList Node Header', size: '12 Bytes', description: { en: '8B Mark Word + 4B Klass Word for every single list element.', vi: 'Header đối tượng 12 byte cho từng phần tử riêng lẻ.' } },
      { name: 'Node Prev/Next Pointers', size: '8 Bytes', description: { en: '4B prev pointer + 4B next pointer per node.', vi: 'Hai con trỏ nén 4-byte trỏ nút trước và nút sau.' } },
      { name: 'modCount', size: '4 Bytes', description: { en: 'Structural modification counter incremented on add, remove, and clear.', vi: 'Biến đếm số lần thay đổi cấu trúc danh sách để kích hoạt Fail-Fast.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'The Java Collections Framework (JCF) is the backbone of enterprise data manipulation. Choosing between concrete implementations is not merely an algorithmic complexity exercise (O(1) vs O(N)); it is a physical hardware optimization problem involving CPU cache hierarchies, memory reference indirection, object header overhead, and concurrency concurrency mechanics.',
      vi: 'Java Collections Framework (JCF) là xương sống của mọi hệ thống xử lý dữ liệu doanh nghiệp. Việc lựa chọn giữa các cấu trúc dữ liệu không chỉ đơn thuần là lý thuyết độ phức tạp thuật toán (O(1) vs O(N)), mà là bài toán tối ưu phần cứng thực tế liên quan đến bộ nhớ đệm CPU L1/L2, chi phí con trỏ tham chiếu, overhead của object header và cơ chế kiểm soát đồng thời.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Memory Topologies: Contiguous Arrays vs Doubly-Linked Lists: Textbook computer science asserts that LinkedList is superior for insertions because node insertion is O(1). In real hardware, LinkedList is almost universally inferior to ArrayList. Every element in a LinkedList requires a 24-byte Node wrapper object (12B header + 8B prev/next pointers + 4B item reference). More critically, Node objects are scattered randomly across the 64-bit Heap, causing CPU L1/L2 cache misses (80ns DRAM stalls) on every traversal step. In contrast, ArrayList allocates elements in a contiguous memory block, allowing hardware CPU cache prefetchers to stream 64 bytes (16 compressed references) per cycle directly into L1 cache.',
        vi: '1. Kiến trúc bố cục ô nhớ: Mảng liên tục vs Danh sách liên kết kép: Giáo trình lý thuyết thường cho rằng LinkedList vượt trội khi chèn phần tử vì thao tác chèn là O(1). Trên phần cứng hiện đại, LinkedList hầu như luôn thua kém ArrayList. Mỗi phần tử trong LinkedList tốn thêm một đối tượng vỏ bọc Node 24 byte (12B header + 8B con trỏ prev/next + 4B tham chiếu dữ liệu). Nguy hiểm hơn, các Node nằm rải rác trên Heap, gây trượt cache L1/L2 (phạt 80ns truy xuất DRAM) ở mỗi bước duyệt. Ngược lại, ArrayList lưu các con trỏ liên tục, cho phép bộ nạp trước của CPU (Hardware Prefetcher) kéo 64 byte (16 con trỏ) mỗi chu kỳ trực tiếp vào L1 cache.'
      },
      {
        en: '2. Capacity Growth Mathematics & GC Allocation Thrashing: When an ArrayList exceeds its internal Object[] capacity, it executes grow(): newCapacity = oldCapacity + (oldCapacity >> 1) (1.5x expansion). It then allocates a new heap array and invokes native System.arraycopy(). If an application reads 100,000 records into an ArrayList initialized with the default capacity of 10, the JVM performs 24 separate memory allocations and discards 23 intermediate arrays, generating massive garbage collection pressure and heap fragmentation.',
        vi: '2. Toán học mở rộng dung lượng & Quá tải rác GC: Khi ArrayList vượt quá dung lượng mảng Object[] nội bộ, nó gọi hàm grow(): newCapacity = oldCapacity + (oldCapacity >> 1) (tăng 1.5 lần). Sau đó JVM cấp phát mảng mới trên Heap và gọi lệnh native System.arraycopy(). Nếu đọc 100,000 bản ghi vào một ArrayList khởi tạo mặc định 10 phần tử, JVM phải thực hiện 24 lần cấp phát bộ nhớ và vứt bỏ 23 mảng trung gian vào GC, tạo áp lực khủng khiếp lên bộ dọn rác và gây phân mảnh ô nhớ.'
      },
      {
        en: '3. The Fail-Fast Invariant & modCount Tracking: Standard collection iterators maintain an expectedModCount initialized to the collection modCount. Any structural modification (add, remove, clear) increments modCount. On every next() invocation, the iterator verifies checkForComodification(): if modCount != expectedModCount, it immediately throws ConcurrentModificationException. To mutate during iteration, callers must use Iterator.remove() or collection removal predicates (removeIf).',
        vi: '3. Cơ chế Fail-Fast & Bộ đếm modCount: Bộ lặp Iterator của Collection lưu biến expectedModCount khởi tạo bằng modCount của danh sách. Mọi thay đổi cấu trúc (add, remove, clear) đều tăng modCount. Trong mỗi lần gọi next(), Iterator kiểm tra: nếu modCount != expectedModCount, nó ném ngay ConcurrentModificationException. Để xóa an toàn lúc đang duyệt, bắt buộc phải dùng Iterator.remove() hoặc phương thức List.removeIf().'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Instantiating collections without specifying an initial capacity when loading large datasets from databases or Kafka streams, triggering dozens of intermediate array allocations and triggering premature Minor GC scavenges.',
        vi: 'Khởi tạo List hoặc Map mà không chỉ định trước dung lượng (initialCapacity) khi nạp lượng dữ liệu lớn từ Database hoặc Kafka, kích hoạt hàng chục lần cấp phát mảng thừa và đẩy nhanh tần suất Minor GC.'
      },
      {
        en: 'Modifying a collection inside an enhanced for-loop (for (Item i : list) { list.remove(i); }), which bypasses the iterator and instantly throws ConcurrentModificationException.',
        vi: 'Chỉnh sửa xóa phần tử trực tiếp bên trong vòng lặp for-each (list.remove(i)), qua mặt iterator và ngay lập tức ném ConcurrentModificationException.'
      },
      {
        en: 'Using LinkedList under the mistaken assumption that queue operations are faster, whereas ArrayDeque is 3x faster, uses 1/3 the memory, and provides superior cache locality for LIFO stacks and FIFO queues.',
        vi: 'Dùng LinkedList cho các hàng đợi FIFO/LIFO vì ngỡ rằng nó nhanh hơn, trong khi ArrayDeque nhanh hơn gấp 3 lần, tiết kiệm 70% bộ nhớ và tận dụng tối đa cache locality của CPU.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Batch Payment Settlement ConcurrentModificationException & GC Heap Thrashing',
      vi: 'Sự Cố Đổ Vỡ ConcurrentModificationException & Quá Tải GC Trong Tiến Trình Quyết Toán Đợt'
    },
    businessContext: {
      en: 'A core banking settlement engine processes 2,500,000 transaction records every midnight to calculate merchant payouts and generate audit ledger entries.',
      vi: 'Hệ thống quyết toán ngân hàng cốt lõi xử lý 2,500,000 bản ghi giao dịch mỗi đêm để tính tiền chi trả cho đối tác và ghi sổ cái kiểm toán.'
    },
    problemDescription: {
      en: 'During end-of-month peak processing, the batch settlement job frequently crashed with ConcurrentModificationException. Investigation revealed that an asynchronous telemetry auditor thread was appending error logs into the shared merchant transaction list while the main settlement thread was iterating through it. Furthermore, the batch job suffered from 45 seconds of Stop-The-World GC pauses, taking 38 minutes to finish because each merchant batch created un-sized ArrayLists that resized up to 19 times per merchant.',
      vi: 'Trong đợt quyết toán cuối tháng, tiến trình batch thường xuyên bị sập đột ngột với lỗi ConcurrentModificationException. Nguyên nhân do một luồng telemetry ghi log bất đồng bộ đã tự ý add thêm bản ghi lỗi vào danh sách giao dịch dùng chung trong khi luồng chính đang duyệt danh sách để tính tiền. Thêm vào đó, tiến trình bị dừng (STW) tới 45 giây vì GC do hàng triệu danh sách ArrayList không được cấp phát dung lượng ban đầu, liên tục resize mảng tới 19 lần cho mỗi đối tác.'
    },
    whyNaiveFails: {
      en: 'Wrapping the list with Collections.synchronizedList(list) prevented array corruption but still threw ConcurrentModificationException during iteration unless synchronized(list) locked the entire 10-second iteration block, completely freezing all telemetry reporting threads.',
      vi: 'Cách khắc phục sơ sài bằng Collections.synchronizedList(list) chỉ bảo vệ lúc add nhưng vẫn ném lỗi ConcurrentModificationException khi duyệt, trừ khi phải khóa synchronized trên toàn bộ danh sách suốt 10 giây, làm đóng băng hoàn toàn các luồng ghi log telemetry.'
    },
    coreSolution: {
      en: '1. Completely isolate write pipelines using thread-safe, lock-free queues (ConcurrentLinkedQueue) for audit events. 2. Pre-size batch processing ArrayLists with exact database cursor batch sizes. 3. Use Java 8+ list.removeIf() or Stream filtering to eliminate manual iterator mutation hazards. 4. Prefer ArrayDeque over LinkedList for all FIFO queue workloads.',
      vi: '1. Tách biệt hoàn toàn luồng ghi bằng hàng đợi phi khóa (lock-free) ConcurrentLinkedQueue cho các sự kiện kiểm toán. 2. Định hình chính xác dung lượng mảng new ArrayList<>(batchSize) khớp với số lượng bản ghi truy vấn từ cơ sở dữ liệu. 3. Dùng list.removeIf() hoặc Streams bất biến để loại trừ lỗi thay đổi dữ liệu khi lặp. 4. Thay thế toàn bộ LinkedList bằng ArrayDeque cho các hàng đợi FIFO.'
    },
    productionCode: `// Production High-Throughput Batch Processing & Thread-Safe Logging
package com.banking.settlement;

import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

public class MerchantSettlementService {
    // 1. Lock-free queue for asynchronous telemetry/audit events
    private final Queue<AuditRecord> auditQueue = new ConcurrentLinkedQueue<>();

    public SettlementReport processBatch(long merchantId, List<RawTransaction> rawData) {
        // 2. Pre-size ArrayList to prevent 1.5x resizing & GC allocation churn
        int totalRecords = rawData.size();
        List<SettledTransaction> settledList = new ArrayList<>(totalRecords);

        // 3. Clean filtering using removeIf or safe functional pipelines
        long totalGrossCents = 0;
        for (RawTransaction tx : rawData) {
            if (tx.isDisputed()) {
                // Thread-safe lock-free enqueue: never touches the iterating collection!
                auditQueue.add(new AuditRecord(merchantId, tx.id(), "DISPUTE_EXCLUDED"));
                continue;
            }

            long feeCents = calculateFee(tx.amountCents());
            settledList.add(new SettledTransaction(tx.id(), tx.amountCents() - feeCents));
            totalGrossCents += tx.amountCents();
        }

        return new SettlementReport(merchantId, settledList, totalGrossCents);
    }

    private long calculateFee(long amount) {
        return (amount * 15) / 1000; // 1.5% fee
    }
}`,
    architectureImpact: {
      en: 'Eliminated 100% of ConcurrentModificationException crashes; Reduced heap allocation churn by 68% (saved 12GB of ephemeral arrays per run); GC pause times dropped from 45s to 1.4s; Batch processing duration plummeted from 38 minutes to 6.2 minutes.',
      vi: 'Triệt tiêu 100% lỗi ConcurrentModificationException; Giảm 68% lượng rác cấp phát tạm thời (tiết kiệm 12GB mảng rác mỗi lần chạy); Thời gian dừng GC giảm từ 45s xuống 1.4s; Thời gian hoàn thành tiến trình quyết toán giảm từ 38 phút xuống còn 6.2 phút.'
    }
  },

  steps: [
    {
      id: 'arraylist-grow-resize',
      title: { en: '1. ArrayList Dynamic Capacity Growth (1.5x)', vi: '1. Cơ Chế Mở Rộng Dung Lượng Tự Động ArrayList (1.5x)' },
      phase: 'ARRAY_GROWTH',
      description: {
        en: 'When adding element 11 into a default 10-element ArrayList, size exceeds capacity. It calculates newCapacity = 10 + (10 >> 1) = 15, allocates a new contiguous Object[15], and copies elements via native System.arraycopy.',
        vi: 'Khi chèn phần tử thứ 11 vào ArrayList mặc định 10 phần tử, dung lượng bị tràn. Hệ thống tính dung lượng mới = 10 + (10 >> 1) = 15, cấp phát mảng mới Object[15] và copy dữ liệu bằng hàm C++ System.arraycopy.'
      },
      jvmRuntimeBehavior: {
        en: 'Native memmove instruction copies memory blocks at hardware bus speeds (>15 GB/s).',
        vi: 'Lệnh CPU memmove sao chép toàn bộ khối ô nhớ ở tốc độ bus phần cứng cực đại.'
      },
      javaCodeLineMatch: 'int newCapacity = ArraysSupport.newLength(oldCapacity, minCapacity - oldCapacity, oldCapacity >> 1);'
    },
    {
      id: 'hashset-map-backing',
      title: { en: '2. HashSet Backed by HashMap Under the Hood', vi: '2. HashSet Thực Chất Là Vỏ Bọc Của HashMap' },
      phase: 'SET_MAP_BACKING',
      description: {
        en: 'HashSet has no custom storage engine. Internally, new HashSet<E>() instantiates a private HashMap<E, Object>. set.add(element) calls map.put(element, PRESENT), using a dummy static Object PRESENT as the value.',
        vi: 'HashSet không có cơ chế lưu trữ riêng. Bên dưới, HashSet khởi tạo một đối tượng HashMap bí mật. Gọi set.add(e) thực chất là map.put(e, PRESENT) với giá trị tĩnh rỗng PRESENT.'
      },
      jvmRuntimeBehavior: {
        en: 'Reuses HashMap high-bit spreading and collision treeification logic with zero redundant code.',
        vi: 'Tái sử dụng 100% thuật toán phân tán hash và cây đỏ đen của HashMap.'
      },
      javaCodeLineMatch: 'private transient HashMap<E,Object> map;'
    },
    {
      id: 'fail-fast-modcount-check',
      title: { en: '3. Fail-Fast Iterator & modCount Verification', vi: '3. Cơ Chế Thẩm Tra Fail-Fast Qua Biến modCount' },
      phase: 'FAIL_FAST_CHECK',
      description: {
        en: 'When creating an Iterator, expectedModCount = modCount. On each next() call, checkForComodification() verifies if (modCount != expectedModCount). If a thread modified the collection during the loop, it throws ConcurrentModificationException immediately!',
        vi: 'Khi tạo Iterator, biến expectedModCount lưu giá trị modCount hiện tại. Tại mỗi vòng lặp next(), hàm kiểm tra nếu modCount bị thay đổi thì lập tức ném ngoại lệ ConcurrentModificationException!'
      },
      jvmRuntimeBehavior: {
        en: 'Single CPU register compare preventing dirty reads and corrupt index pointer state.',
        vi: 'Một phép so sánh thanh ghi CPU đơn giản giúp ngăn chặn lỗi đọc bẩn và hỏng dữ liệu khi duyệt.'
      },
      javaCodeLineMatch: 'if (modCount != expectedModCount) throw new ConcurrentModificationException();'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Java ArrayDeque',
      implementationName: 'Circular Ring Buffer Array (FIFO/LIFO)',
      keyMechanism: {
        en: 'ArrayDeque implements Deque using a power-of-two circular array with head and tail pointers. Elements are added and removed in O(1) without ANY Node object allocations, outperforming LinkedList by 300% for Queues and Stacks.',
        vi: 'ArrayDeque cài đặt hàng đợi bằng mảng tròn vòng với con trỏ head và tail. Thêm và bớt phần tử tốn O(1) mà KHÔNG tốn 1 đối tượng Node nào, chạy nhanh hơn LinkedList 300%.'
      },
      defaultFlags: '-XX:+EliminateAllocations',
      architectureNote: {
        en: 'Always prefer ArrayDeque over LinkedList and legacy Stack for queue and LIFO operations.',
        vi: 'Luôn ưu tiên dùng ArrayDeque thay cho LinkedList và Stack truyền thống.'
      }
    },
    {
      jvmEngine: 'CopyOnWriteArrayList',
      implementationName: 'Snapshot Copy for Read-Heavy Workloads',
      keyMechanism: {
        en: 'Read operations are 100% lock-free without synchronization. Write operations create an entire fresh copy of the underlying array, guaranteeing fail-safe iterator iteration without locks.',
        vi: 'Thao tác đọc hoàn toàn không khóa. Thao tác ghi tạo một bản sao mới của toàn bộ mảng, bảo đảm an toàn cho các iterator duyệt dữ liệu không bao giờ bị ngoại lệ.'
      },
      defaultFlags: '-XX:+TieredCompilation',
      architectureNote: {
        en: 'Ideal for listener registries and config maps with 99.9% read-to-write ratios. Catastrophic for write-heavy pipelines.',
        vi: 'Cực kỳ phù hợp cho danh sách Event Listener và cấu hình (đọc 99.9%). Không dùng cho hệ thống ghi nhiều.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'ArrayList provides predictable O(1) random access and optimal CPU L1 cache spatial locality.',
        vi: 'ArrayList đem lại tốc độ truy xuất ngẫu nhiên O(1) và tận dụng tối đa cache L1 của phần cứng CPU.'
      },
      {
        en: 'Fail-fast design guarantees prompt failure on concurrent data mutations rather than silent corruption.',
        vi: 'Cơ chế Fail-fast bảo đảm phát hiện lỗi sớm khi có sửa đổi đồng thời thay vì để dữ liệu bị sai lệch âm thầm.'
      }
    ],
    cons: [
      {
        en: 'LinkedList incurs 32 bytes of pointer overhead per element and devastating CPU cache misses.',
        vi: 'LinkedList ngốn 32 byte overhead cho mỗi phần tử và gây nghẽn dòng lệnh CPU do Cache Miss.'
      },
      {
        en: 'Standard collections are NOT thread-safe; concurrent modifications without synchronization lead to infinite loops or data loss.',
        vi: 'Các collection chuẩn không an toàn đa luồng; sửa đổi đồng thời dễ gây vòng lặp vô tận hoặc mất dữ liệu.'
      }
    ],
    memoryFootprint: {
      en: 'ArrayList: 24B header + 4B * capacity. LinkedList: 24B header + 32B * element count (4x-8x higher memory footprint!).',
      vi: 'ArrayList: 24B header + 4B * capacity. LinkedList: 24B header + 32B * số phần tử (tốn RAM gấp 4 đến 8 lần!).'
    },
    jvmSpecificationGuarantee: {
      en: 'Java Collection Framework guarantees fail-fast iterators that throw ConcurrentModificationException on a best-effort basis.',
      vi: 'Đặc tả Collections bảo đảm các iterator ném ngoại lệ ConcurrentModificationException khi phát hiện thay đổi cấu trúc.'
    }
  },

  javaCode: `package com.engine.fundamentals;

import java.util.*;

/**
 * Demonstrates Collections Performance, ArrayDeque Ring Buffer,
 * and the Fail-Fast modCount Exception.
 */
public class CollectionsArchitectureDemo {

    public static void main(String[] args) {
        System.out.println("=== JAVA COLLECTIONS FRAMEWORK ARCHITECTURE ===");

        // 1. ArrayDeque vs LinkedList (Ring Buffer vs Pointer Nodes)
        Deque<String> queue = new ArrayDeque<>();
        queue.offer("Order-1");
        queue.offer("Order-2");
        System.out.println("Polled from ArrayDeque: " + queue.poll());

        // 2. HashSet is backed by HashMap internally
        Set<String> set = new HashSet<>();
        set.add("ALPHA");
        set.add("BETA");
        System.out.println("HashSet size: " + set.size());

        // 3. Demonstrating Fail-Fast Exception
        demonstrateFailFastException();
    }

    private static void demonstrateFailFastException() {
        List<String> list = new ArrayList<>(List.of("A", "B", "C"));

        try {
            // Anti-pattern: Modifying collection while iterating using for-each
            for (String item : list) {
                if ("B".equals(item)) {
                    list.remove(item); // Increments modCount! Causes ConcurrentModificationException!
                }
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("Caught expected Fail-Fast: ConcurrentModificationException!");
            System.out.println("Correct fix: Use iterator.remove() or list.removeIf(predicate)!");
        }

        // Correct Production Approach:
        List<String> safeList = new ArrayList<>(List.of("A", "B", "C"));
        safeList.removeIf("B"::equals); // O(N) contiguous single-pass compaction
        System.out.println("Safe removal result: " + safeList);
    }
}`,

  jvmFlagsCode: `# Diagnostic flags for Collections & Escape Analysis
-XX:+DoEscapeAnalysis
-XX:+EliminateAllocations
-XX:+PrintGCDetails`,

  bytecodeInspection: `// Disassembly of list.removeIf() execution
Code:
   0: aload_0
   1: invokedynamic #7, 0 // Method reference predicate
   6: invokeinterface #11, 2 // InterfaceMethod java/util/Collection.removeIf:(Ljava/util/function/Predicate;)Z
  11: pop
  12: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'ArrayList vs LinkedList: Why is ArrayList almost always preferred in real-world applications?',
        vi: 'ArrayList vs LinkedList: Tại sao ArrayList hầu như luôn được ưu tiên vượt trội trong thực tế?'
      },
      answer: {
        en: 'Even though LinkedList has O(1) insertions at the head/tail, ArrayList wins dramatically in real-world hardware performance due to CPU Cache Locality. ArrayList stores elements in a single contiguous memory array; when the CPU loads one element, hardware spatial prefetchers load the next 8-16 elements into L1 Cache (0.5ns access). LinkedList scatters Node objects randomly across Heap memory, incurring an expensive CPU cache miss (~80ns) on every step. Additionally, LinkedList wastes 32 bytes of pointer overhead per element.',
        vi: 'Dù LinkedList có độ phức tạp O(1) khi thêm ở đầu/cuối, ArrayList lại chiến thắng áp đảo về mặt hiệu năng phần cứng thực tế nhờ Tính cục bộ của CPU Cache (CPU Cache Locality). ArrayList lưu dữ liệu trên một mảng liên tục; khi CPU nạp một phần tử, phần cứng sẽ nạp trước 8 đến 16 phần tử kế tiếp vào Cache L1 chỉ mất 0.5ns. LinkedList lưu các đối tượng Node rải rác trên Heap, gây ra một lần Cache Miss (~80ns) trên từng bước duyệt. Ngoài ra, LinkedList lãng phí tới 32 byte overhead cho mỗi phần tử.'
      },
      trapWarning: {
        en: 'Do not claim LinkedList is faster for inserting in the middle. While linking the pointers is O(1), FINDING the middle index requires an O(N) linear traversal with cache misses, making it much slower than ArrayList\'s contiguous System.arraycopy!',
        vi: 'Đừng nói LinkedList chèn vào giữa danh sách nhanh hơn. Thao tác nối con trỏ là O(1), nhưng việc TÌM ĐƯỢC vị trí ở giữa lại tốn O(N) duyệt tuần tự với vô số lần Cache Miss, chậm hơn rất nhiều so với lệnh System.arraycopy của ArrayList!'
      },
      proTip: {
        en: 'Always initialize ArrayList with an estimated initial capacity: new ArrayList<>(expectedSize). This prevents costly array resizings and garbage allocation as elements are added.',
        vi: 'Luôn khởi tạo ArrayList với kích thước dự đoán trước: new ArrayList<>(expectedSize) để tránh các đợt co giãn mảng và giảm tải cho GC.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What is a Fail-Fast iterator, and what causes ConcurrentModificationException in single-threaded code?',
        vi: 'Iterator Fail-Fast là gì và nguyên nhân nào gây ra ConcurrentModificationException ngay cả trong code đơn luồng?'
      },
      answer: {
        en: 'Fail-Fast iterators detect structural changes during iteration and immediately throw ConcurrentModificationException rather than risking non-deterministic behavior. It works via the modCount field: each time the list is modified (add/remove), modCount increments. When an iterator is created, it records expectedModCount = modCount. If you call list.remove() inside an enhanced for-each loop, modCount changes while expectedModCount remains stale; on the very next iterator.next() check, the mismatch triggers ConcurrentModificationException.',
        vi: 'Iterator Fail-Fast phát hiện các thay đổi cấu trúc khi đang duyệt và ném ngoại lệ ConcurrentModificationException ngay lập tức thay vì để xảy ra lỗi sai lệch dữ liệu. Cơ chế dựa trên biến modCount: mỗi khi danh sách bị thêm/bớt phần tử, modCount tăng lên 1. Khi tạo Iterator, nó lưu expectedModCount = modCount. Nếu bạn gọi list.remove() bên trong vòng lặp for-each, modCount bị tăng nhưng expectedModCount không đổi; ở bước duyệt kế tiếp, hàm so sánh phát hiện lệch và ném ngoại lệ ngay.'
      },
      trapWarning: {
        en: 'Many developers think ConcurrentModificationException only occurs in multi-threaded programs. Emphasize that modifying a collection directly during iteration in a SINGLE thread is the #1 cause.',
        vi: 'Nhiều lập trình viên nghĩ ngoại lệ này chỉ xảy ra trong đa luồng. Cần nhấn mạnh việc sửa đổi danh sách trực tiếp khi đang lặp trong MỘT luồng đơn là nguyên nhân phổ biến nhất.'
      },
      proTip: {
        en: 'The modern, idiomatic solution is to use Collection.removeIf(predicate) in Java 8+, which performs an in-place single-pass compaction over the contiguous array without iterator overhead.',
        vi: 'Cách khắc phục chuẩn nhất trong Java hiện đại là dùng hàm Collection.removeIf(predicate), vừa an toàn vừa nén mảng một lượt (single-pass) với tốc độ cao nhất.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'Why should developers prefer ArrayDeque over LinkedList and Stack for Queue and LIFO implementations?',
        vi: 'Tại sao nên ưu tiên ArrayDeque thay vì LinkedList và Stack khi cần cấu trúc Queue hoặc LIFO?'
      },
      answer: {
        en: '1. ArrayDeque vs LinkedList: ArrayDeque is backed by a circular ring buffer array. Adding and removing from head/tail is O(1) via pointer arithmetic without creating a single Node wrapper object. LinkedList creates a 24B Node object on every push, creating high GC pressure and cache misses. 2. ArrayDeque vs Stack: java.util.Stack extends Vector, making every single method synchronized with heavyweight lock overhead even in single-threaded contexts. ArrayDeque is unsynchronized, fast, and cache-friendly.',
        vi: '1. ArrayDeque vs LinkedList: ArrayDeque dùng mảng bộ đệm tròn vòng. Thêm và bớt ở hai đầu là O(1) qua chỉ số mảng mà KHÔNG sinh ra một đối tượng Node nào. LinkedList tạo một Node 24B cho mỗi lần chèn, gây áp lực lớn lên GC và nghẽn CPU cache. 2. ArrayDeque vs Stack: Lớp java.util.Stack kế thừa từ Vector cổ điển, khóa synchronized trên từng phương thức gây lãng phí hiệu năng. ArrayDeque không bị khóa thô, chạy nhanh và thân thiện với bộ nhớ.'
      },
      trapWarning: {
        en: 'Note that ArrayDeque does NOT permit null elements (it throws NullPointerException on offer/add), whereas LinkedList permits nulls. This is an intentional design choice to disambiguate null return values from poll().',
        vi: 'Lưu ý ArrayDeque KHÔNG cho phép phần tử null (ném NullPointerException), trong khi LinkedList cho phép. Đây là thiết kế chủ đích để không bị nhầm lẫn khi hàm poll() trả về null (hàng đợi rỗng).'
      },
      proTip: {
        en: 'ArrayDeque capacity is always a power of 2. HotSpot optimizes pointer wrap-around head = (head - 1) & (elements.length - 1) into a single bitwise AND operation, running in under 0.3ns.',
        vi: 'Dung lượng của ArrayDeque luôn là lũy thừa của 2. Nhờ đó, thao tác quay vòng con trỏ head/tail được tối ưu thành phép AND bit với độ trễ dưới 0.3ns.'
      }
    }
  ]
};
