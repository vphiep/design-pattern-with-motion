import type { SceneMeta } from '@/lib/patterns/scene';

export const JAVA_CORE_SCENE_META: Record<string, SceneMeta> = {
  'jdk-jre-jvm': {
    caption: {
      en: 'JDK, JRE & JVM: javac AST compilation -> Bytecode verification & ClassLoading -> Tiered JIT (C1 vs C2) native assembly.',
      vi: 'JDK, JRE & JVM: javac dịch tĩnh -> Thẩm định Bytecode & ClassLoading -> Biên dịch JIT phân tầng (C1 vs C2).'
    },
    steps: [
      { id: 'source-compile-javac', label: 'javac Source to 0xCAFEBABE Bytecode', match: 'javac OrderService.java', span: 2 },
      { id: 'classload-verify', label: 'ClassLoader & Bytecode Verifier', match: 'java OrderService', span: 2 },
      { id: 'tiered-jit-execution', label: 'Tiered JIT (C1 Fast -> C2 Peak)', match: '// JIT Compiled Native Assembly', span: 2 }
    ]
  },
  'hashcode-equals-contract': {
    caption: {
      en: 'HashCode & Equals: Prime 31 hashing -> Bitwise bucket mask -> Equals collision scan & mutable key traps.',
      vi: 'Khế ước HashCode & Equals: Nhân số nguyên tố 31 -> Mặt nạ bit tính bucket -> Duyệt equals() và bẫy mutable key.'
    },
    steps: [
      { id: 'compute-hash-bucket', label: 'Prime 31 Hash & Bitwise Bucket Routing', match: 'int hash = (key == null)', span: 2 },
      { id: 'equals-collision-resolution', label: 'equals() Collision Chain Verification', match: 'if (p.hash == hash', span: 2 },
      { id: 'mutable-key-leak-trap', label: 'Mutable Key Memory Leak Trap', match: 'user.setName("Changed");', span: 2 }
    ]
  },
  'oop-foundations-solid': {
    caption: {
      en: 'OOP Pillars & Interfaces: Abstract class state -> Interface default method contracts -> Diamond problem resolution.',
      vi: '4 Trụ Cột OOP: Trạng thái Lớp trừu tượng -> Khế ước default method -> Xử lý xung đột Diamond Problem.'
    },
    steps: [
      { id: 'encapsulation-abstraction', label: 'Abstract Contract & State Encapsulation', match: 'public abstract class BasePayment', span: 2 },
      { id: 'diamond-problem-precedence', label: 'Diamond Problem Explicit Resolution', match: 'AuditLog.super.printReceipt();', span: 2 },
      { id: 'composition-over-inheritance', label: 'Composition Over Inheritance (SOLID)', match: 'private final NotificationService', span: 2 }
    ]
  },
  'primitives-vs-references': {
    caption: {
      en: 'Primitives vs References: Raw primitive in Thread Stack Frame -> Heap object pointer binding -> Strict Pass-by-Value bitwise copy.',
      vi: 'Biến nguyên thủy vs Con trỏ tham chiếu: Giá trị thô trên Stack -> Ràng buộc con trỏ Heap -> Sao chép bit Pass-by-Value.'
    },
    steps: [
      { id: 'primitive-stack', label: 'Stack Frame Primitive Allocation', match: 'int age = 25;', span: 2 },
      { id: 'ref-heap-alloc', label: 'Heap Object Allocation & Pointer Binding', match: 'User user = new User("Alice"', span: 2 },
      { id: 'pass-by-value-copy', label: 'Strict Pass-by-Value Reference Copy', match: 'modify(user, age);', span: 2 }
    ]
  },
  'string-immutability-pool': {
    caption: {
      en: 'String Pool Internals: String literal pooling in C++ StringTable -> new String() Heap duplication -> intern() address deduplication.',
      vi: 'Bản chất String Pool: Đưa literal vào bảng băm StringTable -> Từ khóa new nhân đôi trên Heap -> Khử trùng lặp qua intern().'
    },
    steps: [
      { id: 'literal-pooling', label: 'String Literal Interning in StringTable', match: 'String s1 = "Java";', span: 2 },
      { id: 'heap-duplication', label: 'new String() Forces Separate Heap Instance', match: 'String s2 = new String("Java");', span: 2 },
      { id: 'intern-dedup', label: 'String.intern() Resolves to Pool Pointer', match: 'String s3 = s2.intern();', span: 2 }
    ]
  },
  'collections-framework-overview': {
    caption: {
      en: 'Collections Framework: Contiguous ArrayList vs Dispersed LinkedList -> ArrayDeque ring buffer -> Fail-fast modCount checks.',
      vi: 'Cấu trúc Collections: Mảng liên tục ArrayList vs LinkedList rời rạc -> Bộ đệm ArrayDeque -> Kiểm tra fail-fast modCount.'
    },
    steps: [
      { id: 'arraylist-grow-resize', label: 'ArrayList 1.5x Capacity Growth', match: 'ArraysSupport.newLength', span: 2 },
      { id: 'hashset-map-backing', label: 'HashSet Backed by HashMap Under the Hood', match: 'private transient HashMap', span: 2 },
      { id: 'fail-fast-modcount-check', label: 'Fail-Fast Iterator modCount Verification', match: 'if (modCount != expectedModCount)', span: 2 }
    ]
  },
  'java-modern-features': {
    caption: {
      en: 'Modern Java 8-21: invokedynamic Lambda CallSites -> Lazy Stream pipeline fusion -> Record deconstruction in switch.',
      vi: 'Tính năng Java 8-21: Lambda qua invokedynamic -> Hợp nhất đường ống Stream -> Bóc tách Record trong switch.'
    },
    steps: [
      { id: 'invokedynamic-lambda-bootstrap', label: 'invokedynamic Lambda Bootstrap', match: 'orders.stream().filter', span: 2 },
      { id: 'stream-lazy-pipeline', label: 'Stream Lazy Pipeline Execution & Fusion', match: '.map(Order::customerEmail)', span: 2 },
      { id: 'pattern-matching-deconstruct', label: 'Java 21 Pattern Matching Deconstruction', match: 'case CreditCardPayment', span: 2 }
    ]
  },
  'multithreading-thread-lifecycle': {
    caption: {
      en: 'Multithreading Physics: Process vs Thread memory boundary -> 6 JVM thread states -> sleep() vs wait() lock semantics.',
      vi: 'Cơ chế đa luồng: Ranh giới bộ nhớ Process vs Thread -> 6 trạng thái vòng đời luồng -> Bản chất sleep() vs wait().'
    },
    steps: [
      { id: 'thread-state-new-to-runnable', label: 'Thread NEW to RUNNABLE Transition', match: 'thread.start();', span: 2 },
      { id: 'blocked-vs-waiting', label: 'BLOCKED (Contention) vs WAITING (Yield)', match: 'lock.wait();', span: 2 },
      { id: 'sleep-vs-wait-physics', label: 'sleep() Retains Lock vs wait() Releases Lock', match: 'Thread.sleep(1000);', span: 2 }
    ]
  },
  'concurrency-hazards-atomics': {
    caption: {
      en: 'Concurrency Hazards: Read-modify-write lost updates -> ReentrantLock tryLock timeouts -> Lock-free atomic CAS loops.',
      vi: 'Lỗi đa luồng: Mất dữ liệu Read-modify-write -> ReentrantLock tryLock chống deadlock -> Vòng lặp nguyên tử CAS.'
    },
    steps: [
      { id: 'race-condition-interleaving', label: 'Lost Update Race Condition Interleaving', match: 'balance++;', span: 2 },
      { id: 'reentrantlock-trylock-timeout', label: 'ReentrantLock tryLock() Deadlock Defense', match: 'if (lockA.tryLock', span: 2 },
      { id: 'atomic-cas-hardware-loop', label: 'Atomic Variable Lock-Free CAS Hardware Loop', match: 'atomicBalance.incrementAndGet', span: 2 }
    ]
  },
  'executors-threadpools': {
    caption: {
      en: 'Executors & ThreadPools: ThreadPoolExecutor submission flow -> CallerRunsPolicy backpressure -> Non-blocking CompletableFuture.',
      vi: 'Executors & ThreadPools: Luồng điều phối tác vụ -> Áp lực ngược CallerRunsPolicy -> Bất đồng bộ CompletableFuture.'
    },
    steps: [
      { id: 'threadpool-execution-flow', label: 'Task Submission Flow (Core -> Queue -> Max -> Reject)', match: 'executor.execute(task);', span: 2 },
      { id: 'callerruns-backpressure', label: 'CallerRunsPolicy Natural Backpressure', match: 'ThreadPoolExecutor.CallerRunsPolicy', span: 2 },
      { id: 'completable-future-chaining', label: 'Non-Blocking CompletableFuture Async Chain', match: 'CompletableFuture.supplyAsync', span: 2 }
    ]
  },
  'oop-polymorphism-vtable': {
    caption: {
      en: 'Polymorphism & Dynamic Dispatch: Metaspace InstanceKlass vtable construction -> invokevirtual runtime index dispatch -> C2 Monomorphic Inline Caching.',
      vi: 'Đa hình & Phân giải động: Tạo bảng vtable trong Metaspace -> invokevirtual tra cứu index -> JIT Monomorphic Inline Caching.'
    },
    steps: [
      { id: 'vtable-build', label: 'Metaspace InstanceKlass vtable Construction', match: 'Payment payment = new CreditCardPayment', span: 2 },
      { id: 'dynamic-dispatch', label: 'invokevirtual Dynamic Slot Dispatch', match: 'payment.process(amount);', span: 2 },
      { id: 'monomorphic-inline-cache', label: 'C2 JIT Monomorphic Inline Caching', match: '// JIT Inlined Direct Machine Code', span: 2 }
    ]
  },
  'jvm-memory-model': {
    caption: {
      en: 'JVM Runtime Memory: Fast TLAB bump allocation in Eden -> Minor GC Scavenge -> Tenuring promotion to Old Gen.',
      vi: 'Bộ nhớ JVM Runtime: Cấp phát con trỏ TLAB trong Eden -> Minor GC dọn dẹp -> Thăng hạng lên Old Gen.'
    },
    steps: [
      { id: 'tlab-alloc', label: 'TLAB Bump Pointer in Eden', match: 'Order order = new Order', span: 2 },
      { id: 'minor-gc', label: 'Minor GC Evacuation to S0/S1', match: 'System.gc(); // Minor GC', span: 2 },
      { id: 'tenuring-promote', label: 'Tenuring Promotion to Old Gen', match: 'cacheManager.put("ACTIVE_USERS"', span: 2 }
    ]
  },
  'synchronized-monitor': {
    caption: {
      en: 'HotSpot Lock Inflation: Lock-free (01) -> Lightweight CAS on Stack (00) -> Heavyweight ObjectMonitor with Futex (10).',
      vi: 'Cơ chế thăng cấp khóa HotSpot: Không khóa (01) -> Khóa nhẹ CAS trên Stack (00) -> Khóa nặng ObjectMonitor (10).'
    },
    steps: [
      { id: 'thin-cas', label: 'CAS Displaced Mark Word on Stack', match: 'synchronized (lock)', span: 2 },
      { id: 'spin-contend', label: 'Adaptive User-Space Spinning', match: '// Thread 2 spinning in user space', span: 2 },
      { id: 'inflate-monitor', label: 'Inflate to OS Futex ObjectMonitor', match: 'monitor.wait();', span: 2 }
    ]
  },
  'virtual-threads': {
    caption: {
      en: 'Project Loom: Million Virtual Threads multiplexed onto ForkJoin Carrier OS Threads; Continuation freezes on blocking I/O.',
      vi: 'Project Loom: Triệu Virtual Threads ghép kênh lên Carrier OS Threads; Đóng băng Continuation khi gặp I/O.'
    },
    steps: [
      { id: 'mount-carrier', label: 'Mount Virtual Thread onto Carrier', match: 'Thread.ofVirtual().start', span: 2 },
      { id: 'blocking-yield', label: 'Freeze Continuation on Blocking I/O', match: 'HttpResponse<String> response = httpClient.send', span: 2 },
      { id: 'i-o-resume', label: 'Unpark & Steal to Idle Carrier', match: 'return parseResponse(response.body());', span: 2 }
    ]
  },
  'garbage-collection': {
    caption: {
      en: 'Garbage Collection: Generational card table scanning -> G1 region evacuation -> ZGC 64-bit colored pointer load barrier.',
      vi: 'Thu gom rác: Quét bảng Card Table -> Sơ tán vùng nhớ G1 -> Hàng rào tải Load Barrier con trỏ màu ZGC.'
    },
    steps: [
      { id: 'minor-mark', label: 'Card Table Dirtying & Root Mark', match: 'oldCache.put(key', span: 2 },
      { id: 'evacuate-region', label: 'G1 Regional Live Object Evacuation', match: '// G1 evacuates live objects', span: 2 },
      { id: 'load-barrier', label: 'ZGC Load Barrier Self-Healing', match: 'customer.getName(); // Triggers Load Barrier', span: 2 }
    ]
  },
  'aqs-locks': {
    caption: {
      en: 'AbstractQueuedSynchronizer (AQS): Atomic volatile state CAS -> CLH FIFO waiter queue -> LockSupport.park/unpark.',
      vi: 'AQS: Biến trạng thái volatile CAS nguyên tử -> Hàng đợi FIFO CLH -> LockSupport.park/unpark.'
    },
    steps: [
      { id: 'cas-acquire', label: 'CAS State Atomic Acquisition', match: 'lock.lock(); // compareAndSetState(0, 1)', span: 2 },
      { id: 'enqueue-park', label: 'CLH Queue Enqueue & Park Thread', match: 'acquireQueued(addWaiter(Node.EXCLUSIVE)', span: 2 },
      { id: 'release-unpark', label: 'Release State & Unpark Successor', match: 'lock.unlock(); // state = 0', span: 2 }
    ]
  },
  'jmm-volatile': {
    caption: {
      en: 'Java Memory Model (JMM): Hardware Store Buffers -> Instruction Reordering -> Memory Barriers & MESI Coherence.',
      vi: 'Mô hình bộ nhớ JMM: Bộ đệm ghi CPU Store Buffer -> Đảo thứ tự lệnh -> Rào cản bộ nhớ & Giao thức MESI.'
    },
    steps: [
      { id: 'store-buffer', label: 'Write Staged in CPU Store Buffer', match: 'isReady = true; // buffered', span: 2 },
      { id: 'memory-barrier', label: 'Flush Store Buffer via Memory Barrier', match: '// JIT emits: lock addl', span: 2 },
      { id: 'coherent-read', label: 'MESI Invalidation & Coherent Read', match: 'while (!isReady)', span: 2 }
    ]
  },
  'hashmap-internals': {
    caption: {
      en: 'HashMap Internals: High-16-bit hash spreading -> Bitwise bucket index -> Collision linked list to Red-Black Tree (threshold 8).',
      vi: 'Bản chất HashMap: Phân tán hash 16-bit cao -> Mặt nạ bit tính chỉ mục -> Danh sách liên kết hóa Cây đỏ đen (ngưỡng 8).'
    },
    steps: [
      { id: 'hash-spread', label: 'High-Bit XOR Spreading & Index Mask', match: 'map.put(key, value); // (n - 1)', span: 2 },
      { id: 'collision-chain', label: 'Singly-Linked Collision Chaining', match: 'for (int binCount = 0;', span: 2 },
      { id: 'treeify-split', label: 'Red-Black Treeification at Threshold 8', match: 'treeifyBin(tab, hash);', span: 2 }
    ]
  },
  'concurrent-hashmap': {
    caption: {
      en: 'ConcurrentHashMap: Lock-free CAS on empty bucket -> Synchronized head node lock -> Multi-threaded ForwardingNode transfer.',
      vi: 'ConcurrentHashMap: CAS không khóa khi ô trống -> Khóa synchronized nút đầu -> Chuyển giao đa luồng ForwardingNode.'
    },
    steps: [
      { id: 'cas-empty-bucket', label: 'Atomic CAS on Empty Bucket Head', match: 'if (casTabAt(tab, i, null', span: 2 },
      { id: 'lock-head-node', label: 'Synchronize Single Bucket Head Node', match: 'synchronized (f) {', span: 2 },
      { id: 'forwarding-transfer', label: 'Parallel Resize via ForwardingNode', match: 'else if ((fh = f.hash) == MOVED)', span: 2 }
    ]
  },
  'classloader-bytecode': {
    caption: {
      en: 'ClassLoading & Bytecode: Parent-First Delegation (Bootstrap -> Platform -> App) -> Linking -> Operand Stack execution.',
      vi: 'ClassLoading & Bytecode: Ủy thác cha trước (Bootstrap -> Platform -> App) -> Liên kết -> Thực thi ngăn xếp toán hạng.'
    },
    steps: [
      { id: 'delegate-parent', label: 'Parent-First Class Delegation', match: 'protected Class<?> loadClass', span: 2 },
      { id: 'bytecode-link-verify', label: '0xCAFEBABE Verification & Metaspace Prep', match: '// Static fields initialized to default', span: 2 },
      { id: 'clinit-execute', label: 'Atomic <clinit> Static Initializer', match: 'static { System.out.println', span: 2 }
    ]
  },
  'generics-type-erasure': {
    caption: {
      en: 'Generics & Type Erasure: Compile-time erasure to Upper Bound -> Injected checkcast bytecode -> Synthetic bridge methods.',
      vi: 'Generics & Xóa kiểu: Xóa kiểu về cận trên khi dịch -> Chèn bytecode checkcast -> Tạo synthetic bridge method tự động.'
    },
    steps: [
      { id: 'compile-erasure', label: 'Type Erasure to Object / Upper Bound', match: 'public class Node<T>', span: 2 },
      { id: 'bridge-synthesis', label: 'Compiler Generates Synthetic Bridge Method', match: '// Synthetic method: void set', span: 2 },
      { id: 'runtime-checkcast', label: 'Bytecode checkcast Enforces Safety', match: 'String text = stringList.get(0);', span: 2 }
    ]
  }
};
