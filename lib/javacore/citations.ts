import type { JavaCoreTopic, JavaResearchCitation, JavaCoreCategory } from './types';

export const JAVA_TOPIC_SPECIFIC_CITATIONS: Record<string, JavaResearchCitation[]> = {
  'jdk-jre-jvm': [
    {
      source: 'Baeldung',
      title: 'Differences Between JDK, JRE, and JVM in Java',
      url: 'https://www.baeldung.com/jvm-vs-jre-vs-jdk',
      citationType: 'guide',
      keyTakeaway: {
        en: 'JDK includes compiler (javac) and tools for development; JRE provides runtime libraries (rt.jar/modules); JVM executes bytecode (.class) via JIT compilation to machine instructions.',
        vi: 'JDK chứa trình biên dịch javac và các công cụ phát triển; JRE cung cấp thư viện runtime; JVM thực thi bytecode (.class) qua trình biên dịch JIT thành mã máy.'
      },
      benchmarkOrInsight: {
        en: 'Since Java 9 modularity (Project Jigsaw), standalone JRE distributions were removed in favor of jlink custom minimal runtimes.',
        vi: 'Kể từ Java 9 (Project Jigsaw), bộ cài JRE độc lập bị khai tử để chuyển sang công cụ jlink đóng gói runtime tối giản theo module.'
      }
    },
    {
      source: 'Oracle JLS / JVMS Specification',
      title: 'Java Virtual Machine Specification (JVMS) Chapter 2: JVM Architecture',
      url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html',
      citationType: 'specification',
      keyTakeaway: {
        en: 'The JVM defines distinct memory areas: Method Area (Metaspace), Heap, Java Threads Stacks, Program Counter (PC) Registers, and Native Method Stacks.',
        vi: 'Đặc tả JVM định nghĩa các vùng nhớ độc lập: Method Area (Metaspace), Heap, Java Threads Stacks, Program Counter (PC) Registers, và Native Method Stacks.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Differences Between JDK, JRE, and JVM with Architecture Diagram',
      url: 'https://www.geeksforgeeks.org/differences-between-jdk-jre-and-jvm/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'The JVM is platform-dependent (different native binaries for Windows/Linux/macOS), but enables platform-independent Java bytecode portability ("Write Once, Run Anywhere").',
        vi: 'JVM phụ thuộc nền tảng hệ điều hành (có binary riêng cho Windows/Linux/macOS), nhưng mang lại tính độc lập nền tảng cho mã bytecode ("Viết một lần, chạy mọi nơi").'
      }
    }
  ],

  'hashcode-equals-contract': [
    {
      source: 'Baeldung',
      title: 'Java equals() and hashCode() Contracts & Common Pitfalls',
      url: 'https://www.baeldung.com/java-equals-hashcode-contracts',
      citationType: 'guide',
      keyTakeaway: {
        en: 'Contract Rule: If obj1.equals(obj2) is true, then obj1.hashCode() MUST equal obj2.hashCode(). Violating this causes silent data loss in HashMaps and HashSets.',
        vi: 'Quy tắc khế ước: Nếu obj1.equals(obj2) là true, thì obj1.hashCode() BẮT BUỘC bằng obj2.hashCode(). Vi phạm điều này gây mất dữ liệu ngầm trong HashMap và HashSet.'
      },
      benchmarkOrInsight: {
        en: 'Failing to override hashCode() when overriding equals() results in lookups returning null for identical keys, as objects land in distinct hash buckets.',
        vi: 'Quên override hashCode() khi đã override equals() khiến hàm get() trả về null cho các khóa tương đương, do chúng bị phân bổ vào hai bucket băm khác nhau.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Overriding equals() and hashCode() Methods in Java',
      url: 'https://www.geeksforgeeks.org/equals-hashcode-methods-java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Consistent properties: equals must be Reflexive, Symmetric, Transitive, and Consistent. hashCode should distribute keys uniformly using prime multipliers (like 31).',
        vi: 'Tính chất nhất quán: equals phải có tính Phản xạ, Đối xứng, Bắc cầu và Nhất quán. hashCode nên phân phối đều các key bằng thừa số nguyên tố (như 31).'
      }
    },
    {
      source: 'JavaTpoint',
      title: 'Java Object hashCode() and equals() Method with Examples',
      url: 'https://www.javatpoint.com/java-object-hashcode-method',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Identity hashCode vs logical hashCode: System.identityHashCode() returns the memory-derived hash regardless of whether the class overrides hashCode().',
        vi: 'Identity hashCode vs Logical hashCode: System.identityHashCode() trả về giá trị băm từ con trỏ bộ nhớ bất kể class có override hashCode() hay không.'
      }
    }
  ],

  'multithreading-thread-lifecycle': [
    {
      source: 'Baeldung',
      title: 'Life Cycle of a Thread in Java & Thread State Transitions',
      url: 'https://www.baeldung.com/java-thread-lifecycle',
      citationType: 'guide',
      keyTakeaway: {
        en: 'A Java thread transitions through 6 distinct states in Thread.State enum: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, and TERMINATED.',
        vi: 'Một luồng Java chuyển trạng thái qua 6 bước trong enum Thread.State: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING và TERMINATED.'
      },
      benchmarkOrInsight: {
        en: 'BLOCKED occurs strictly waiting for an intrinsic synchronized monitor lock. WAITING occurs when calling Object.wait(), Thread.join(), or LockSupport.park().',
        vi: 'BLOCKED xuất hiện duy nhất khi chờ monitor lock của từ khóa synchronized. WAITING xuất hiện khi gọi Object.wait(), Thread.join(), hoặc LockSupport.park().'
      }
    },
    {
      source: 'freeCodeCamp',
      title: 'Process vs Thread in Java: Complete Concurrency Comparison',
      url: 'https://www.freecodecamp.org/news/process-vs-thread-in-java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'A Process has its own independent virtual address space and file handles. Threads within the same JVM process share the Heap and Metaspace, but maintain private Stacks and PC registers.',
        vi: 'Tiến trình (Process) có không gian địa chỉ ảo và bộ mô tả file riêng biệt. Các Thread trong cùng process JVM chia sẻ chung Heap và Metaspace, nhưng có Stack và PC register riêng.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Lifecycle and States of a Thread in Java with Examples',
      url: 'https://www.geeksforgeeks.org/lifecycle-and-states-of-a-thread-in-java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Calling start() allocates native OS thread resources and schedules execution; calling run() directly executes in the caller thread synchronously without concurrency.',
        vi: 'Gọi start() cấp phát tài nguyên luồng của HĐH và xếp lịch thực thi; gọi run() trực tiếp sẽ chỉ chạy đồng bộ trên chính luồng hiện tại mà không tạo đa luồng.'
      }
    }
  ],

  'synchronized-monitor': [
    {
      source: 'Baeldung',
      title: 'Guide to the synchronized Keyword in Java: Object Monitors & Lock Escalation',
      url: 'https://www.baeldung.com/java-synchronized',
      citationType: 'guide',
      keyTakeaway: {
        en: 'HotSpot implements 3 lock levels in the object Mark Word: Biased Locking (deprecated in modern JDKs), Lightweight Locking (BasicObjectLock in thread stack), and Heavyweight Inflated Monitor (ObjectMonitor).',
        vi: 'HotSpot triển khai 3 cấp độ khóa trong Mark Word của đối tượng: Biased Locking (đã loại bỏ ở JDK mới), Lightweight Locking (trên stack luồng), và Heavyweight Inflated Monitor (ObjectMonitor của HĐH).'
      },
      benchmarkOrInsight: {
        en: 'Uncontended lightweight locking costs only ~10-15ns via CAS. Heavyweight monitor inflation requires an OS futex mutex syscall, inflating latency to ~1-3µs (100x overhead).',
        vi: 'Khóa nhẹ không tranh chấp chỉ tốn ~10-15ns nhờ CAS. Khóa nặng biến thành monitor đòi hỏi gọi syscall futex của HĐH, làm tăng độ trễ lên ~1-3µs (overhead gấp 100x).'
      }
    },
    {
      source: 'Oracle JLS / JVMS Specification',
      title: 'Java Language Specification (JLS) §17.1: Synchronization & Monitor Invariants',
      url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.1',
      citationType: 'specification',
      keyTakeaway: {
        en: 'Bytecode representation uses monitorenter and monitorexit instructions. Exception tables guarantee monitorexit is invoked even when runtime exceptions occur.',
        vi: 'Ở tầng bytecode, synchronized biên dịch thành cặp lệnh monitorenter và monitorexit. Bảng Exception bảo đảm monitorexit luôn được gọi giải phóng khóa ngay cả khi ném ngoại lệ.'
      }
    },
    {
      source: 'JavaTpoint',
      title: 'Synchronization in Java: Synchronized Method vs Synchronized Block',
      url: 'https://www.javatpoint.com/synchronization-in-java',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Prefer fine-grained synchronized blocks with dedicated private lock objects over synchronizing entire methods to minimize critical section contention.',
        vi: 'Nên ưu tiên khối synchronized block với đối tượng khóa private chuyên dụng thay vì synchronize cả method để giảm thiểu tranh chấp vùng tranh chấp găng (critical section).'
      }
    }
  ],

  'jmm-volatile': [
    {
      source: 'Baeldung',
      title: 'The Java Memory Model (JMM) and the volatile Keyword Explained',
      url: 'https://www.baeldung.com/java-volatile',
      citationType: 'guide',
      keyTakeaway: {
        en: 'volatile provides two guarantees: Visibility (flushes changes immediately to main RAM) and Instruction Ordering (prevents compiler/CPU reordering via memory barriers/fences).',
        vi: 'volatile mang lại 2 bảo đảm: Tính hiển thị (Visibility - cập nhật ngay vào RAM chính) và Thứ tự lệnh (Instruction Ordering - ngăn CPU/trình biên dịch đảo thứ tự lệnh qua memory barrier).'
      },
      benchmarkOrInsight: {
        en: 'volatile does NOT guarantee atomicity for compound operations (count++ requires read-modify-write, which remains vulnerable to race conditions without AtomicInteger).',
        vi: 'volatile KHÔNG bảo đảm tính nguyên tử cho các thao tác phức hợp (count++ gồm đọc-sửa-ghi, vẫn bị lỗi race condition nếu không dùng AtomicInteger).'
      }
    },
    {
      source: 'Aleksey Shipilëv (JVM Internals)',
      title: 'Java Memory Model Pragmatics (JSR-133 Expert Group)',
      url: 'https://shipilev.net/blog/2014/jmm-pragmatics/',
      citationType: 'benchmark',
      keyTakeaway: {
        en: 'The JMM establishes Happens-Before edges: A write to a volatile variable happens-before every subsequent read of that same volatile variable across any thread.',
        vi: 'JMM thiết lập quan hệ Happens-Before: Thao tác ghi vào biến volatile luôn happens-before mọi thao tác đọc kế tiếp trên chính biến volatile đó giữa mọi luồng.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Volatile Keyword in Java with Real-World Examples',
      url: 'https://www.geeksforgeeks.org/volatile-keyword-in-java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'CPU L1/L2 cache coherency protocols (MESI) ensure volatile writes invalidate cached cache lines across other CPU cores.',
        vi: 'Giao thức nhất quán bộ đệm CPU (MESI) bảo đảm các thao tác ghi volatile sẽ làm mất hiệu lực (invalidate) các dòng cache line trên các core CPU khác.'
      }
    }
  ],

  'concurrent-hashmap': [
    {
      source: 'Baeldung',
      title: 'How Does ConcurrentHashMap Work Internally in Java 8+?',
      url: 'https://www.baeldung.com/java-concurrent-hashmap-internals',
      citationType: 'guide',
      keyTakeaway: {
        en: 'Java 8 removed the Segment array (16 lock partitions). It now uses CAS for empty bucket insertion and synchronizes strictly on the bucket head Node, achieving per-bucket lock granularity.',
        vi: 'Java 8 đã loại bỏ mảng Segment (16 phân vùng khóa). Thay vào đó, nó dùng CAS khi chèn vào bucket rỗng và chỉ synchronize trên Node đầu bucket, đạt độ mịn khóa theo từng bucket.'
      },
      benchmarkOrInsight: {
        en: 'Reads (get) are completely non-blocking and lock-free due to volatile val and volatile next fields in Node<K,V>, providing concurrent read throughput that scales linearly with cores.',
        vi: 'Thao tác đọc (get) hoàn toàn không khóa (lock-free) nhờ các trường volatile val và volatile next trong Node<K,V>, đạt thông lượng đọc tăng tuyến tính theo số core CPU.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Internal Working of ConcurrentHashMap in Java with Treeification',
      url: 'https://www.geeksforgeeks.org/concurrenthashmap-in-java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'When a bucket reaches TREEIFY_THRESHOLD (8 entries) and table capacity >= 64, the linked list transforms into a Red-Black Tree (TreeBin), bounding worst-case search to O(log N).',
        vi: 'Khi bucket đạt ngưỡng TREEIFY_THRESHOLD (8 phần tử) và bảng >= 64, danh sách liên kết chuyển thành Cây Đỏ Đen (TreeBin), giới hạn thời gian tìm kiếm xấu nhất ở O(log N).'
      }
    },
    {
      source: 'JavaTpoint',
      title: 'Java ConcurrentHashMap Class with Methods & Hierarchy',
      url: 'https://www.javatpoint.com/concurrenthashmap-in-java',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'ConcurrentHashMap does not allow null keys or null values, avoiding ambiguity in concurrent containsKey() vs get() semantics.',
        vi: 'ConcurrentHashMap cấm tuyệt đối key hoặc value bằng null để tránh nhập nhằng ngữ nghĩa giữa containsKey() và get() trong môi trường đồng thời.'
      }
    }
  ],

  'executors-threadpools': [
    {
      source: 'Baeldung',
      title: 'Introduction to Thread Pools and ThreadPoolExecutor Tuning in Java',
      url: 'https://www.baeldung.com/thread-pool-java-and-guava',
      citationType: 'guide',
      keyTakeaway: {
        en: 'Tuning formula: For CPU-bound tasks, PoolSize = N_cpu + 1. For I/O-bound tasks, PoolSize = N_cpu * (1 + WaitTime / ServiceTime). Always use bounded BlockingQueues (ArrayBlockingQueue) to prevent OutOfMemoryError.',
        vi: 'Công thức cấu hình: Với tác vụ CPU, PoolSize = N_cpu + 1. Với tác vụ I/O, PoolSize = N_cpu * (1 + Thời gian chờ / Thời gian xử lý). Luôn dùng hàng đợi có giới hạn để ngăn sập OOM.'
      },
      benchmarkOrInsight: {
        en: 'Executors.newCachedThreadPool() creates an unbounded pool that can spawn thousands of threads under burst traffic, exhausting OS thread handles and crashing the host.',
        vi: 'Hàm Executors.newCachedThreadPool() tạo thread pool không giới hạn, có thể bùng phát hàng nghìn luồng khi có lưu lượng đột biến, làm cạn kiệt thread của HĐH và crash server.'
      }
    },
    {
      source: 'freeCodeCamp',
      title: 'Java Thread Pool Tutorial: How to Use Executors and ThreadPoolExecutor',
      url: 'https://www.freecodecamp.org/news/java-thread-pool-tutorial/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'The core lifecycle: Tasks go to corePoolSize -> then workQueue -> then maximumPoolSize -> then trigger RejectedExecutionHandler (CallerRunsPolicy, AbortPolicy).',
        vi: 'Vòng đời xử lý: Tác vụ nạp vào corePoolSize -> nếu đầy chuyển vào workQueue -> nếu hàng đợi đầy mở rộng tới maximumPoolSize -> nếu vẫn đầy gọi RejectedExecutionHandler.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'ThreadPoolExecutor in Java with Custom Rejection Policies',
      url: 'https://www.geeksforgeeks.org/threadpoolexecutor-in-java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'CallerRunsPolicy provides graceful backpressure by running rejected tasks on the submission thread, naturally throttling incoming request rates.',
        vi: 'CallerRunsPolicy cung cấp cơ chế backpressure êm dịu bằng cách bắt chính luồng gọi phải thực thi tác vụ bị từ chối, làm chậm tốc độ đẩy dữ liệu vào một cách tự nhiên.'
      }
    }
  ],

  'virtual-threads': [
    {
      source: 'Baeldung',
      title: 'Guide to Virtual Threads in Java 21 (Project Loom & JEP 444)',
      url: 'https://www.baeldung.com/java-virtual-threads',
      citationType: 'guide',
      keyTakeaway: {
        en: 'Virtual threads are lightweight user-mode threads managed by the JVM rather than OS kernel threads. They decouple concurrency from OS thread count, enabling millions of concurrent threads with ~1KB initial memory.',
        vi: 'Virtual thread là luồng ở tầng người dùng (user-mode) do JVM quản lý thay vì luồng của nhân HĐH. Chúng giải phóng số luồng khỏi giới hạn HĐH, cho phép hàng triệu luồng chạy đồng thời với ~1KB bộ nhớ ban đầu.'
      },
      benchmarkOrInsight: {
        en: '1,000,000 platform threads require ~1TB of RAM (1MB stack each), crashing the machine. 1,000,000 virtual threads require only ~2.5GB of heap memory.',
        vi: '1.000.000 luồng nền tảng (OS thread) ngốn ~1TB RAM (1MB stack mỗi luồng), làm sập máy. Trong khi 1.000.000 virtual thread chỉ tốn ~2.5GB bộ nhớ heap.'
      }
    },
    {
      source: 'OpenJDK Source & JEPs',
      title: 'JEP 444: Virtual Threads (Final Feature in JDK 21)',
      url: 'https://openjdk.org/jeps/444',
      citationType: 'jep',
      keyTakeaway: {
        en: 'When a virtual thread blocks on socket I/O or sleep, the JVM unmounts its Continuation from the carrier platform thread and mounts another virtual thread, keeping CPU cores 100% utilized.',
        vi: 'Khi virtual thread bị nghẽn do I/O mạng hoặc sleep, JVM tháo Continuation khỏi carrier platform thread và gán một virtual thread khác vào, duy trì CPU luôn hoạt động 100%.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Virtual Threads in Java 21: Architecture, Continuations & Carrier Threads',
      url: 'https://www.geeksforgeeks.org/virtual-threads-in-java-21/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Pinning Warning: Synchronized blocks that perform blocking I/O pin the virtual thread to its carrier thread, preventing unmounting. Migrate synchronized to ReentrantLock.',
        vi: 'Cảnh báo Pinning: Khối synchronized chứa thao tác blocking I/O sẽ "ghim chặt" (pin) virtual thread vào carrier thread, ngăn unmount. Cần chuyển từ synchronized sang ReentrantLock.'
      }
    }
  ],

  'hashmap-internals': [
    {
      source: 'Baeldung',
      title: 'Internal Working of HashMap in Java with Collision Handling',
      url: 'https://www.baeldung.com/java-hashmap-load-factor',
      citationType: 'guide',
      keyTakeaway: {
        en: 'HashMap uses table capacity (power of 2), load factor (default 0.75), and bitwise index calculation: index = (n - 1) & hash. Perturbation function (h ^ (h >>> 16)) distributes high-order bits into low-order bits.',
        vi: 'HashMap dùng dung lượng bảng lũy thừa 2, load factor 0.75, và công thức tính vị trí: index = (n - 1) & hash. Hàm đảo bit (h ^ (h >>> 16)) giúp trộn các bit bậc cao vào bit bậc thấp.'
      },
      benchmarkOrInsight: {
        en: 'Under heavy hash collisions, Red-Black Treeification guarantees O(log N) worst-case lookup, preventing HashDoS attacks that degraded pre-Java 8 HashMaps to O(N).',
        vi: 'Khi xảy ra đụng độ băm nghiêm trọng, cơ chế Cây Đỏ Đen bảo đảm thời gian tìm kiếm O(log N), ngăn chặn các đòn tấn công HashDoS từng làm suy thoái hiệu năng về O(N) ở Java 7.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Internal Working of HashMap in Java: Hashing, Buckets & Re-hashing',
      url: 'https://www.geeksforgeeks.org/internal-working-of-hashmap-java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Resize doubles table size. Due to power-of-2 sizing, keys either stay at the same index or move to index + oldCap without recalculating the hash.',
        vi: 'Thao tác resize nhân đôi kích thước bảng. Nhờ kích thước lũy thừa 2, các key giữ nguyên index cũ hoặc chuyển sang index + oldCap mà không cần tính lại hàm hash.'
      }
    },
    {
      source: 'JavaTpoint',
      title: 'How HashMap Works in Java with Hash Code and Collisions',
      url: 'https://www.javatpoint.com/working-of-hashmap-in-java',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'HashMap is NOT thread-safe. Concurrent modifications without external synchronization can cause circular linked list infinite loops during resize in older JDKs.',
        vi: 'HashMap KHÔNG an toàn đa luồng. Thao tác ghi đồng thời mà không đồng bộ hóa có thể gây vòng lặp vô hạn do danh sách liên kết bị tạo chu trình khi resize.'
      }
    }
  ],

  'garbage-collection': [
    {
      source: 'Baeldung',
      title: 'JVM Garbage Collectors: Serial, Parallel, G1, ZGC, and Shenandoah',
      url: 'https://www.baeldung.com/jvm-garbage-collectors',
      citationType: 'guide',
      keyTakeaway: {
        en: 'HotSpot provides modern production collectors: G1 GC (default, region-based, predictable pause target), ZGC (colored pointers, load barriers, <1ms sub-millisecond pauses), and Shenandoah (concurrent evacuation).',
        vi: 'HotSpot cung cấp các bộ thu gom hiện đại: G1 GC (mặc định, chia vùng region, dự đoán pause time), ZGC (dùng colored pointers và load barrier, pause time <1ms), và Shenandoah (dọn dẹp đồng thời).'
      },
      benchmarkOrInsight: {
        en: 'ZGC pauses remain under 1 millisecond regardless of whether the heap is 16MB or 16 Terabytes, making it ideal for ultra-low latency microservices.',
        vi: 'Thời gian dừng pause của ZGC duy trì dưới 1 mili giây bất kể kích thước heap là 16MB hay 16 Terabyte, lý tưởng cho các microservice đòi hỏi độ trễ cực thấp.'
      }
    },
    {
      source: 'Oracle JLS / JVMS Specification',
      title: 'HotSpot Virtual Machine Garbage Collection Tuning Guide (JDK 21)',
      url: 'https://docs.oracle.com/en/java/javase/21/gctuning/',
      citationType: 'specification',
      keyTakeaway: {
        en: 'Generational hypothesis: Most objects die young (>95%). Dividing the heap into Young (Eden + Survivor) and Tenured (Old) generations optimizes collection cycles.',
        vi: 'Giả thuyết phân thế hệ: Hầu hết đối tượng chết trẻ (>95%). Chia heap thành Young (Eden + Survivor) và Tenured (Old) tối ưu hóa chu kỳ thu gom rác.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Garbage Collection in Java with Minor and Major GC Phases',
      url: 'https://www.geeksforgeeks.org/garbage-collection-java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Stop-The-World (STW) pauses freeze all application threads. Tuning GC parameters aims to minimize STW frequency and duration while maximizing throughput.',
        vi: 'Các đợt dừng Stop-The-World (STW) đóng băng toàn bộ luồng ứng dụng. Tinh chỉnh GC nhằm giảm thiểu tần suất và thời gian STW trong khi tối đa hóa thông lượng.'
      }
    }
  ]
};

export const JAVA_CATEGORY_DEFAULT_CITATIONS: Record<JavaCoreCategory, JavaResearchCitation[]> = {
  'java-fundamentals': [
    {
      source: 'Baeldung',
      title: 'Core Java Fundamentals, Memory Allocation & Type System',
      url: 'https://www.baeldung.com/category/java/',
      citationType: 'guide',
      keyTakeaway: {
        en: 'Java enforces strong static typing, single class inheritance with multiple interface implementation, and memory safety through managed pointers and automatic garbage collection.',
        vi: 'Java thực thi kiểu tĩnh nghiêm ngặt, đơn kế thừa class và đa kế thừa interface, bảo đảm an toàn bộ nhớ qua con trỏ được quản lý và tự động thu gom rác.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Java Fundamentals: Architecture, Memory Management & OOP Core',
      url: 'https://www.geeksforgeeks.org/java/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Understanding object references vs primitives is crucial: primitives hold immediate values on the stack, whereas objects exist in heap storage with reference handles.',
        vi: 'Phân biệt biến tham chiếu và kiểu nguyên thủy là nền tảng: biến nguyên thủy lưu trực tiếp giá trị trên stack, còn đối tượng tồn tại trên heap với con trỏ tham chiếu.'
      }
    },
    {
      source: 'freeCodeCamp',
      title: 'The Java Handbook: Learn Java Programming from Scratch',
      url: 'https://www.freecodecamp.org/news/the-java-handbook/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Clean object-oriented design balances encapsulation, inheritance, polymorphism, and abstraction to produce maintainable, loosely coupled enterprise software.',
        vi: 'Thiết kế hướng đối tượng sạch cân bằng giữa đóng gói, kế thừa, đa hình và trừu tượng để tạo ra phần mềm doanh nghiệp dễ bảo trì, liên kết lỏng (loose coupling).'
      }
    }
  ],

  'jvm-memory': [
    {
      source: 'Baeldung',
      title: 'JVM Memory Model, Stack vs Heap & Garbage Collection Algorithms',
      url: 'https://www.baeldung.com/java-jvm-memory-model',
      citationType: 'guide',
      keyTakeaway: {
        en: 'The JVM heap stores all class instances and arrays. Each thread receives a private stack containing stack frames with local variables and operand stacks.',
        vi: 'JVM heap lưu trữ toàn bộ instance và mảng. Mỗi luồng sở hữu một call stack riêng chứa các stack frame với biến cục bộ và operand stack.'
      }
    },
    {
      source: 'Oracle JLS / JVMS Specification',
      title: 'Java Virtual Machine Specification (JVMS): Memory Allocation & Bytecode Execution',
      url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/',
      citationType: 'specification',
      keyTakeaway: {
        en: 'Metaspace (native memory) replaces Java 7 PermGen, avoiding java.lang.OutOfMemoryError: PermGen space by scaling dynamically up to OS physical limits.',
        vi: 'Metaspace (nằm ở native memory) thay thế cho PermGen của Java 7, loại bỏ lỗi tràn bộ nhớ PermGen bằng cách co giãn động theo giới hạn RAM vật lý của HĐH.'
      }
    },
    {
      source: 'JavaTpoint',
      title: 'JVM Architecture: ClassLoader, Memory Model & Execution Engine',
      url: 'https://www.javatpoint.com/jvm-java-virtual-machine',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'The Execution Engine combines an Interpreter for fast startup with a JIT Compiler (C1 Client / C2 Server) for compiling hot methods into optimized native machine code.',
        vi: 'Execution Engine kết hợp Trình thông dịch (Interpreter) cho khởi động nhanh với Trình biên dịch JIT (C1/C2) để dịch các method thường gọi thành mã máy tối ưu.'
      }
    }
  ],

  'concurrency-juc': [
    {
      source: 'Baeldung',
      title: 'Overview of java.util.concurrent (JUC): Locks, Atomics & Synchronizers',
      url: 'https://www.baeldung.com/java-util-concurrent',
      citationType: 'guide',
      keyTakeaway: {
        en: 'The java.util.concurrent framework provides lock-free atomic variables, explicit reentrant locks, thread pools, and concurrent collections with superior scalability over synchronized.',
        vi: 'Framework java.util.concurrent cung cấp biến atomic không khóa (lock-free), khóa reentrant rõ ràng, thread pool và các collection đồng thời với hiệu năng mở rộng vượt xa synchronized.'
      }
    },
    {
      source: 'Aleksey Shipilëv (JVM Internals)',
      title: 'Java Concurrency in Practice & Memory Barrier Semantics',
      url: 'https://shipilev.net/',
      citationType: 'benchmark',
      keyTakeaway: {
        en: 'Lock acquisition and release create memory barriers: acquiring a lock forces invalidation of local registers, while releasing a lock flushes writes to main memory.',
        vi: 'Việc chiếm và nhả khóa tạo ra memory barrier: chiếm khóa bắt buộc làm mới thanh ghi từ RAM, nhả khóa ép đẩy toàn bộ thay đổi xuống bộ nhớ chính.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Java Concurrency and Multithreading: JUC Packages Explained',
      url: 'https://www.geeksforgeeks.org/java-util-concurrent-package/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Deadlocks require four simultaneous conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Breaking any single condition prevents deadlocks.',
        vi: 'Deadlock đòi hỏi đủ 4 điều kiện: Loại trừ lẫn nhau, Giữ và chờ, Không có quyền ưu tiên (no preemption) và Chờ đợi vòng tròn. Phá vỡ 1 điều kiện bất kỳ sẽ ngăn chặn deadlock.'
      }
    }
  ],

  'collections-internals': [
    {
      source: 'Baeldung',
      title: 'Guide to the Java Collections Framework (JCF) Performance & Internals',
      url: 'https://www.baeldung.com/java-collections',
      citationType: 'guide',
      keyTakeaway: {
        en: 'Choosing the right collection dictates big-O algorithmic efficiency: ArrayList provides O(1) random access vs LinkedList O(1) head insertion; HashMap provides O(1) amortized lookup vs TreeMap O(log N) sorted keys.',
        vi: 'Chọn đúng collection quyết định độ phức tạp Big-O: ArrayList mang lại O(1) truy cập ngẫu nhiên vs LinkedList O(1) chèn đầu; HashMap cho O(1) tra cứu vs TreeMap O(log N) khóa sắp xếp.'
      }
    },
    {
      source: 'GeeksforGeeks',
      title: 'Java Collection Framework Hierarchy, Interfaces & Classes with Code',
      url: 'https://www.geeksforgeeks.org/collections-in-java-2/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Fail-fast iterators throw ConcurrentModificationException when the collection is structurally modified during iteration by any means other than the iterator\'s own remove method.',
        vi: 'Iterator kiểu fail-fast sẽ ném ConcurrentModificationException nếu collection bị can thiệp thay đổi cấu trúc trong lúc lặp bằng bất kỳ cách nào khác ngoài method remove của chính iterator.'
      }
    },
    {
      source: 'JavaTpoint',
      title: 'Collections in Java: Hierarchy, Performance Comparison & Best Practices',
      url: 'https://www.javatpoint.com/collections-in-java',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Synchronized collections (Collections.synchronizedMap) wrap every operation in an intrinsic object lock, causing thread bottlenecks compared to ConcurrentHashMap.',
        vi: 'Bộ sưu tập đồng bộ (Collections.synchronizedMap) bọc mọi method trong 1 object lock duy nhất, tạo điểm nghẽn nghiêm trọng so với cơ chế phân chia của ConcurrentHashMap.'
      }
    }
  ],

  'advanced-features': [
    {
      source: 'Baeldung',
      title: 'Modern Java Features from Java 8 to Java 21: Records, Pattern Matching & Loom',
      url: 'https://www.baeldung.com/java-8-new-features',
      citationType: 'guide',
      keyTakeaway: {
        en: 'Java has evolved rapidly: Lambdas & Streams (Java 8), Modules (Java 9), Records & Text Blocks (Java 14-17), Pattern Matching for switch (Java 21), and Virtual Threads (Java 21).',
        vi: 'Java phát triển vũ bão: Lambda & Streams (Java 8), Modules (Java 9), Records & Text Blocks (Java 14-17), Pattern Matching cho switch (Java 21), và Virtual Threads (Java 21).'
      }
    },
    {
      source: 'OpenJDK Source & JEPs',
      title: 'OpenJDK JDK Enhancement Proposals (JEPs) & Java Release Specifications',
      url: 'https://openjdk.org/jeps/0',
      citationType: 'jep',
      keyTakeaway: {
        en: 'Records (JEP 395) provide transparent, immutable data carriers with compiler-generated constructors, getters, equals, hashCode, and toString.',
        vi: 'Records (JEP 395) cung cấp cấu trúc mang dữ liệu bất biến trong suốt với constructor, getter, equals, hashCode và toString được trình biên dịch tự sinh.'
      }
    },
    {
      source: 'freeCodeCamp',
      title: 'Java 8 to Java 21: Key Features and Upgrades Developers Should Know',
      url: 'https://www.freecodecamp.org/news/java-features-guide-8-to-21/',
      citationType: 'academic-tutorial',
      keyTakeaway: {
        en: 'Switch pattern matching and sealed classes enable exhaustive algebraic data types with compile-time verification, eliminating unexpected runtime ClassCastExceptions.',
        vi: 'Khớp mẫu trong switch và sealed class mang lại hệ thống kiểu dữ liệu đại số hoàn chỉnh với sự xác minh ở thời điểm biên dịch, loại bỏ rủi ro ném ClassCastException khi chạy.'
      }
    }
  ]
};

export function getJavaResearchCitations(topic: JavaCoreTopic): JavaResearchCitation[] {
  if (topic.researchCitations && topic.researchCitations.length > 0) {
    return topic.researchCitations;
  }
  if (JAVA_TOPIC_SPECIFIC_CITATIONS[topic.id]) {
    return JAVA_TOPIC_SPECIFIC_CITATIONS[topic.id];
  }
  return JAVA_CATEGORY_DEFAULT_CITATIONS[topic.category] || JAVA_CATEGORY_DEFAULT_CITATIONS['java-fundamentals'];
}
