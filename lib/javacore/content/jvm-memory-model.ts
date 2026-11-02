import type { JavaCoreTopic } from '../types';

export const jvmMemoryModel: JavaCoreTopic = {
  id: 'jvm-memory-model',
  category: 'jvm-memory',
  name: 'JVM Memory Architecture & 64-bit Object Layout',
  tagline: {
    en: 'Runtime Data Areas: Heap generations (Eden, Survivor, Old), Metaspace, JVM Stacks, and 64-bit Mark Word object headers with Compressed OOPs.',
    vi: 'Phân vùng bộ nhớ JVM: Các thế hệ Heap (Eden, Survivor, Old), Metaspace, Stack Frames và cấu trúc 64-bit Mark Word kèm Compressed OOPs.'
  },
  difficulty: 3,
  level: 'advanced',
  order: 12,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'Modern applications allocate millions of short-lived objects per second while retaining long-lived caches in memory. If the JVM allocated all objects in a flat monolithic memory space, searching for dead objects during Garbage Collection would require stopping the world (STW) for seconds, freezing application threads and causing catastrophic API timeouts.',
      vi: 'Các ứng dụng hiện đại khởi tạo hàng triệu đối tượng ngắn hạn mỗi giây trong khi vẫn phải duy trì các vùng cache dài hạn trong RAM. Nếu JVM cấp phát tất cả đối tượng vào một vùng nhớ phẳng nguyên khối, việc quét tìm rác sẽ đòi hỏi dừng toàn bộ ứng dụng (Stop-The-World) suốt nhiều giây, gây đơ cứng hệ thống và sập API.'
    },
    hardwareConstraint: {
      en: '64-bit CPU architectures use 8-byte memory alignment. Uncompressed 64-bit pointers consume double the CPU L1/L2/L3 cache capacity compared to 32-bit pointers. HotSpot JVM solves this via Compressed Ordinary Object Pointers (Compressed OOPs: -XX:+UseCompressedOops), shifting 32-bit addresses by 3 bits to address up to 32GB of heap while retaining 32-bit pointer efficiency in CPU cache lines.',
      vi: 'Kiến trúc CPU 64-bit sử dụng căn chỉnh bộ nhớ 8-byte. Con trỏ 64-bit nguyên bản chiếm dung lượng gấp đôi trong cache L1/L2/L3 của CPU so với con trỏ 32-bit. HotSpot JVM giải quyết bằng cơ chế nén con trỏ (Compressed OOPs: -XX:+UseCompressedOops), dịch bit địa chỉ 32-bit sang trái 3 bit để quản lý tối đa 32GB Heap mà vẫn giữ kích thước con trỏ 4 byte trong CPU cache.'
    },
    fundamentalSolution: {
      en: 'The JVM divides memory into Thread-Private areas (JVM Stacks, Program Counter, Native Stacks) and Thread-Shared areas (Heap, Metaspace). The Heap is partitioned into Young Generation (Eden + Survivor S0/S1 for cheap generational collection) and Tenured/Old Generation. Each in-memory object contains an 8-byte Mark Word (storing hash code, GC age, lock flags), a Klass Word (compressed metadata pointer), instance fields, and 8-byte alignment padding.',
      vi: 'JVM chia bộ nhớ thành hai khu vực: Vùng riêng từng luồng (JVM Stacks, Program Counter, Native Stacks) và Vùng chia sẻ chung (Heap, Metaspace). Vùng Heap chia tiếp thành Young Generation (Eden + Survivor S0/S1 phục vụ thu gom nhanh) và Tenured/Old Generation. Mỗi đối tượng trong RAM chứa 8-byte Mark Word (lưu hash code, tuổi GC, trạng thái khóa), Klass Word (con trỏ nén tới metadata lớp), các trường dữ liệu và phần đệm căn chỉnh bội số 8-byte.'
    },
    math: {
      formula: 'Object_Size = (Mark_Word [8B] + Klass_Word [4B/8B] + Fields + Padding) mod 8 = 0',
      description: {
        en: 'Under Compressed OOPs (-XX:+UseCompressedOops), an empty Object consumes exactly 16 bytes: 8B Mark Word + 4B Klass Pointer + 4B Alignment Padding.',
        vi: 'Dưới cơ chế nén Compressed OOPs, một đối tượng rỗng tốn đúng 16 byte RAM: 8B Mark Word + 4B con trỏ Klass + 4B đệm căn chỉnh (Padding).'
      },
      timeComplexity: 'O(1) bump-the-pointer Eden allocation (TLAB)',
      spaceComplexity: '8-byte aligned memory layout; max 32GB for 32-bit compressed pointers',
      memoryOverheadFormula: 'TLAB Allocation Overhead = Pointer Bump without Global Mutex'
    }
  },

  detailedTheory: {
    overview: {
      en: 'The Java Virtual Machine (JVM) abstracts underlying hardware architectures through the JVM Runtime Data Areas specification. Understanding the physical layout of memory—from Thread-Local Allocation Buffers (TLAB) in CPU L1 caches to off-heap Metaspace and 64-bit object headers—is critical for tuning enterprise microservices, diagnosing OutOfMemoryErrors, and eliminating Garbage Collection pause spikes.',
      vi: 'Máy ảo Java (JVM) trừu tượng hóa phần cứng vật lý thông qua đặc tả Vùng dữ liệu thực thi (Runtime Data Areas). Nắm vững cấu trúc bộ nhớ vật lý—từ bộ đệm cấp phát luồng cục bộ TLAB trong cache CPU đến vùng nhớ ngoài Heap Metaspace và header đối tượng 64-bit—là chìa khóa sống còn để tối ưu microservices, chẩn đoán lỗi OutOfMemoryError và triệt tiêu các đợt gián đoạn GC.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Thread-Private vs Thread-Shared Memory Domains: Every Java thread owns an independent Program Counter (PC) Register and a JVM Stack. Each method invocation pushes a new Stack Frame containing: Local Variable Table (holding primitive types and object references), Operand Stack (stack-machine evaluation for arithmetic and bytecode ops), Frame Data (dynamic linking and exception table references). Because stack frames are popped automatically upon method return, allocations on the stack require zero Garbage Collection overhead.',
        vi: '1. Vùng nhớ Riêng từng Luồng vs Vùng nhớ Chia sẻ Chung: Mỗi luồng Java sở hữu riêng một con trỏ lệnh Program Counter (PC) và một JVM Stack. Mỗi lần gọi hàm sẽ đẩy vào Stack một Stack Frame mới gồm: Bảng biến cục bộ (Local Variable Table lưu kiểu nguyên thủy và con trỏ tham chiếu), Ngăn xếp toán hạng (Operand Stack để thực thi tính toán bytecode), và Dữ liệu khung (Frame Data phục vụ liên kết động và xử lý ngoại lệ). Khi hàm kết thúc, stack frame tự động hủy mà không tốn 1 chu kỳ GC nào.'
      },
      {
        en: '2. The Heap Generation Topology (Eden, Survivor, Old Gen): The Weak Generational Hypothesis observes that >95% of Java objects die shortly after creation. To exploit this, HotSpot partitions the Heap: new objects are allocated in the Eden space. Minor GCs evacuate surviving objects between Survivor 0 and Survivor 1. Each survival increments the object’s GC age (recorded in the 4-bit field of the Mark Word). Once an object reaches -XX:MaxTenuringThreshold (default 15), it is promoted to the Old Generation.',
        vi: '2. Cấu trúc Phân tầng Heap (Eden, Survivor, Old Gen): Giả thuyết phân thế (Weak Generational Hypothesis) chứng minh rằng hơn 95% đối tượng Java sẽ chết ngay sau khi sinh ra. HotSpot tận dụng điều này bằng cách chia Heap: đối tượng mới sinh nằm ở vùng Eden. Các đợt dọn rác nhẹ (Minor GC) sẽ sơ tán đối tượng còn sống qua lại giữa Survivor 0 và Survivor 1. Mỗi lần sống sót, tuổi GC của đối tượng được tăng thêm 1 (lưu trong 4 bit của Mark Word). Khi đạt ngưỡng MaxTenuringThreshold (mặc định 15), đối tượng được thăng hạng lên Old Gen.'
      },
      {
        en: '3. Thread-Local Allocation Buffers (TLAB): In multi-threaded applications, having hundreds of threads compete to allocate memory on the global heap would cause severe mutex contention. HotSpot solves this with TLABs: each thread is pre-allocated a small, private chunk of the Eden space (e.g. 512KB). Threads allocate objects within their own TLAB using simple pointer bumping (incrementing a top pointer) in ~1 nanosecond with zero locking synchronization.',
        vi: '3. Bộ đệm Cấp phát Cục bộ theo Luồng (TLAB): Trong ứng dụng đa luồng, việc hàng trăm luồng cùng tranh chấp một con trỏ cấp phát trên Heap chung sẽ gây nghẽn khóa nghiêm trọng. HotSpot giải quyết bằng TLAB: mỗi luồng được cấp trước một vùng nhỏ riêng biệt trong Eden (ví dụ 512KB). Luồng tự cấp phát đối tượng trong TLAB của mình bằng thao tác dịch con trỏ (Pointer Bumping) siêu tốc trong ~1ns mà không cần bất kỳ khóa đồng bộ nào.'
      },
      {
        en: '4. Anatomy of the 64-bit Mark Word & Object Header: In HotSpot 64-bit, every object begins with an 8-byte Mark Word. The lowest 3 bits define the lock state: 001 (Unlocked), 000 (Lightweight Locked via CAS), 010 (Heavyweight Inflated ObjectMonitor), 011 (Marked for GC), 101 (Biased Lock). The remaining bits store identity hashCode, GC age (4 bits: max 15), and thread lock pointers. Following the Mark Word is the Klass Pointer (compressed from 8B to 4B), referencing the Class metadata in Metaspace.',
        vi: '4. Giải phẫu Header Đối tượng 64-bit (Mark Word & Klass Pointer): Trên HotSpot 64-bit, mỗi đối tượng mở đầu bằng 8-byte Mark Word. 3 bit cuối cùng quy định trạng thái khóa: 001 (Không khóa), 000 (Khóa nhẹ qua CAS), 010 (Khóa nặng Monitor OS), 011 (Đánh dấu dọn rác), 101 (Khóa thiên vị Biased). Các bit còn lại lưu Identity HashCode, tuổi GC (4 bit: tối đa 15) và con trỏ luồng giữ khóa. Tiếp theo Mark Word là Klass Pointer (nén từ 8B còn 4B), trỏ tới metadata của Class trong Metaspace.'
      },
      {
        en: '5. Metaspace Architecture & Off-Heap Native Memory: Java 8 permanently eliminated the notorious PermGen (Permanent Generation) from the JVM Heap, replacing it with Metaspace allocated in native OS memory. Metaspace stores Class definitions, Method bytecode, runtime constant pools, and method tables. Because Metaspace grows dynamically up to physical OS memory limits (unless restricted by -XX:MaxMetaspaceSize), it eliminates arbitrary PermGen OOMs while requiring active monitoring of dynamic CGLIB / ByteBuddy proxy class generation.',
        vi: '5. Kiến trúc Metaspace & Bộ nhớ Native ngoài Heap: Từ Java 8, vùng PermGen (Permanent Generation) trong Heap đã bị khai tử hoàn toàn và thay thế bằng Metaspace nằm ở bộ nhớ Native của hệ điều hành. Metaspace lưu trữ định nghĩa Class, mã Bytecode của hàm, Runtime Constant Pool và Method Table. Metaspace co giãn linh hoạt theo RAM máy chủ (trừ khi giới hạn bởi -XX:MaxMetaspaceSize), chấm dứt lỗi tràn PermGen nhưng đòi hỏi giám sát các thư viện sinh class động như CGLIB hay Spring Caching.'
      },
      {
        en: '6. Escape Analysis & Scalar Replacement: The HotSpot C2 JIT compiler analyzes object life scopes. If an object allocated within a method never "escapes" (is never returned, assigned to a static field, or passed to another thread), the JIT compiler executes Scalar Replacement: breaking the object into its individual primitive fields and allocating them directly in CPU registers or on the stack frame, bypassing the Heap entirely!',
        vi: '6. Phân tích Thoát ly (Escape Analysis) & Thay thế Vô hướng: Trình biên dịch HotSpot C2 JIT phân tích phạm vi sống của đối tượng. Nếu đối tượng sinh ra trong hàm không bị "thoát ly" ra ngoài (không return, không gán biến static, không truyền sang luồng khác), JIT sẽ kích hoạt cơ chế Thay thế Vô hướng (Scalar Replacement): bóc tách đối tượng thành các biến nguyên thủy và gán trực tiếp vào thanh ghi CPU hoặc stack frame, hoàn toàn không cần cấp phát trên Heap!'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Heap Size Sizing Trap (-Xmx > 32GB Disabling Compressed OOPs): Setting JVM heap to 32GB or slightly above (e.g. -Xmx33G) causes the JVM to silently disable Compressed OOPs. Converted to 64-bit pointers, all references consume 8 bytes instead of 4 bytes, increasing overall memory footprint by 40-50% and causing a severe drop in CPU L3 cache hit rates. Rule of thumb: keep heap at 31GB (-Xmx31G) or jump straight to 48GB+ to offset pointer inflation.',
        vi: 'Bẫy Dung lượng Heap 32GB Làm Vô Hiệu Hóa Compressed OOPs: Cấu hình Heap bằng hoặc vượt quá 32GB (ví dụ -Xmx33G) sẽ khiến JVM âm thầm tắt cơ chế nén con trỏ Compressed OOPs. Toàn bộ con trỏ biến thành 8 byte thay vì 4 byte, làm kích thước bộ nhớ phình to 40-50% và làm sụt giảm nghiêm trọng tỷ lệ Cache Hit của CPU L3. Quy tắc vàng: luôn đặt Heap dưới 31GB (-Xmx31G) hoặc nhảy vọt lên hẳn 48GB+ để bù đắp sự lãng phí con trỏ.'
      },
      {
        en: 'Metaspace Memory Leak from Dynamic Proxies: Frameworks utilizing dynamic reflection, Spring AOP, or JSON serializers (Jackson/Gson) that dynamically generate classes without caching ClassLoader references cause Metaspace to expand continuously until java.lang.OutOfMemoryError: Metaspace crashes the container. Mitigation: configure -XX:MaxMetaspaceSize=512m and monitor class count via jcmd <pid> VM.classloader_stats.',
        vi: 'Rò rỉ Bộ nhớ Metaspace từ Dynamic Proxies: Các framework dùng reflection động, Spring AOP hoặc thư viện parse JSON sinh class động liên tục mà không tái sử dụng ClassLoader sẽ khiến Metaspace phình to vô hạn tới khi kích hoạt java.lang.OutOfMemoryError: Metaspace làm sập container. Khắc phục: luôn giới hạn -XX:MaxMetaspaceSize=512m và giám sát số lượng class qua lệnh jcmd <pid> VM.classloader_stats.'
      },
      {
        en: 'Direct ByteBuffer Off-Heap Memory Leak: Allocating off-heap buffers using ByteBuffer.allocateDirect() bypasses the Java Heap. Because native off-heap memory is only reclaimed when its associated java.lang.ref.Cleaner runs during a full GC, high-throughput network pipelines (e.g. Netty / gRPC) can exhaust host physical RAM and trigger the Linux OOM Killer before a Heap GC is ever triggered! Always tune -XX:MaxDirectMemorySize.',
        vi: 'Rò rỉ Bộ nhớ ngoài Heap từ Direct ByteBuffer: Cấp phát bộ nhớ ngoài Heap bằng ByteBuffer.allocateDirect() hoàn toàn không nằm trong Heap. Vì bộ nhớ native này chỉ được thu hồi khi đối tượng Cleaner chạy trong đợt Full GC, các hệ thống mạng thông lượng cao (Netty/gRPC) có thể ngốn sạch RAM vật lý của server và bị Linux OOM Killer tiêu diệt trước khi Heap kịp đầy! Luôn cấu hình giới hạn -XX:MaxDirectMemorySize.'
      }
    ]
  },

  memoryLayout: {
    title: {
      en: '64-bit Java Object Memory Layout in RAM (JOL Standard)',
      vi: 'Cấu trúc Nhị phân Đối tượng Java 64-bit trong RAM (Chuẩn JOL)'
    },
    description: {
      en: 'Every Java object in 64-bit HotSpot begins with an 8-byte Mark Word and a 4-byte compressed Klass pointer, followed by instance fields, padded to a multiple of 8 bytes.',
      vi: 'Mỗi đối tượng Java trên HotSpot 64-bit mở đầu bằng 8-byte Mark Word và 4-byte con trỏ Klass nén, theo sau là các trường dữ liệu thực tế và đệm căn chỉnh 8-byte.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| 64-BIT HOTSPOT OBJECT IN-MEMORY LAYOUT (-XX:+UseCompressedClassPointers, -XX:+UseCompressedOops)   |
+----------------------------------------------------------------------------------------------------+
| 1. MARK WORD (8 Bytes / 64 Bits):                                                                  |
|   +--------------------------------------------------------------------+---------------+---------+ |
|   | Unlocked State (001):   Identity HashCode (31b) | Age (4b) | Biased=0 | Lock State: 01          | |
|   | Thin Lock (000):        Ptr to Lock Record on Owner Thread Stack Frame         | Lock State: 00 | |
|   | Heavy Monitor (010):    Ptr to native ObjectMonitor in C++ Heap                | Lock State: 10 | |
|   | Marked for GC (011):    GC Metadata Collector Header                           | Lock State: 11 | |
|   +--------------------------------------------------------------------+---------------+---------+ |
+----------------------------------------------------------------------------------------------------+
| 2. KLASS WORD (4 Bytes / 32 Bits Compressed Pointer -> Metaspace Class Instance)                   |
+----------------------------------------------------------------------------------------------------+
| 3. INSTANCE FIELDS (Primitive primitives & 4-byte Compressed Reference pointers):                  |
|   [ int id (4B) ] [ long timestamp (8B) ] [ ref nameString (4B Compressed OOP) ]                   |
+----------------------------------------------------------------------------------------------------+
| 4. ALIGNMENT PADDING (0 to 7 Bytes to guarantee total object size is divisible by 8)                |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'mark_word', size: '64 Bits (8B)', description: { en: 'Stores Identity Hashcode, 4-bit GC tenuring age, biased locking bit, and 2-bit lock state tags.', vi: 'Lưu Identity Hashcode, 4 bit tuổi GC, cờ khóa thiên vị và 2 bit quy định trạng thái khóa.' } },
      { name: 'klass_pointer', size: '32 Bits (4B)', description: { en: 'Compressed pointer referencing class metadata stored in off-heap native Metaspace.', vi: 'Con trỏ nén tham chiếu tới metadata của lớp được lưu trữ trong Metaspace.' } },
      { name: 'instance_fields', size: 'Variable', description: { en: 'Primitive values and compressed object reference pointers declared on class definition.', vi: 'Các giá trị kiểu nguyên thủy và con trỏ tham chiếu nén của các trường đối tượng.' } },
      { name: 'alignment_padding', size: '0-7 Bytes', description: { en: 'Padding bytes inserted so total object memory allocation is aligned to 8-byte CPU cache boundaries.', vi: 'Các byte đệm được chèn thêm để bảo đảm tổng kích thước đối tượng là bội số của 8 byte.' } }
    ]
  },

  steps: [
    {
      id: 'tlab-alloc',
      title: { en: '1. Fast-Path Allocation in Thread-Local Buffer (TLAB)', vi: '1. Cấp phát siêu tốc trong bộ đệm luồng cục bộ (TLAB)' },
      phase: 'TLAB_ALLOC',
      description: {
        en: 'When a new keyword executes, the thread checks its private TLAB in Eden space. If sufficient free bytes remain, it simply bumps the top allocation pointer forward, initializing the 8-byte Mark Word and 4-byte Klass pointer with zero thread mutex overhead.',
        vi: 'Khi từ khóa new thực thi, luồng kiểm tra vùng TLAB riêng trong Eden. Nếu còn đủ byte trống, luồng chỉ việc dịch con trỏ cấp phát lên trước, khởi tạo Mark Word 8 byte và Klass pointer 4 byte mà không tốn một chu kỳ khóa nào.'
      },
      jvmRuntimeBehavior: {
        en: 'Zero global lock contention. Nanosecond pointer bump inside CPU L1/L2 data cache.',
        vi: 'Hoàn toàn không có tranh chấp khóa toàn cục. Cấp phát trong nano giây ngay trên cache CPU L1/L2.'
      },
      javaCodeLineMatch: 'Order order = new Order(101L, "ORDER-A1", 250.0);'
    },
    {
      id: 'minor-gc',
      title: { en: '2. Minor GC Evacuation & Age Increment', vi: '2. Sơ tán Minor GC & Tăng tuổi thọ đối tượng' },
      phase: 'MINOR_GC_EVACUATE',
      description: {
        en: 'When Eden space fills up, a Minor GC triggers Stop-The-World pause. Live surviving objects are copied from Eden into Survivor S0. Their Mark Word age bits increment from 0 to 1. Dead objects in Eden are discarded instantly by resetting the Eden allocation pointer.',
        vi: 'Khi vùng Eden đầy, Minor GC kích hoạt trạng thái dừng Stop-The-World ngắn. Các đối tượng còn sống từ Eden được sao chép sang Survivor S0. Bit tuổi trong Mark Word tăng từ 0 lên 1. Các đối tượng rác trong Eden bị hủy tức thì bằng cách reset con trỏ.'
      },
      jvmRuntimeBehavior: {
        en: 'Stop-The-World parallel scavenge; copying live objects into contiguous survivor space.',
        vi: 'Dừng luồng ngắn hạn; sao chép đối tượng sống vào vùng Survivor liên tục không bị phân mảnh.'
      },
      javaCodeLineMatch: 'System.gc(); // Minor GC evacuates surviving young objects'
    },
    {
      id: 'tenuring-promote',
      title: { en: '3. Tenuring Promotion to Old Generation', vi: '3. Thăng hạng đối tượng thọ lâu lên Old Generation' },
      phase: 'TENURING_PROMOTION',
      description: {
        en: 'After surviving multiple Minor GC cycles (reaching -XX:MaxTenuringThreshold=15), the object is recognized as long-lived (e.g. Spring Singleton bean or cache) and promoted into the Tenured/Old Generation.',
        vi: 'Sau khi sống sót qua nhiều đợt Minor GC (đạt ngưỡng MaxTenuringThreshold=15), đối tượng được xác định là sống lâu dài (như Spring Singleton bean hoặc cache) và được chuyển hẳn lên vùng Old Generation.'
      },
      jvmRuntimeBehavior: {
        en: 'Object copied into Old Gen region. Card Table updated to track Old-to-Young references.',
        vi: 'Đối tượng được copy sang Old Gen. Bảng Card Table được cập nhật để theo dõi con trỏ Old-sang-Young.'
      },
      javaCodeLineMatch: 'cacheManager.put("ACTIVE_USERS", longLivedCache);'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Oracle HotSpot JVM 21',
      implementationName: 'Generational ZGC / G1GC & Compressed OOPs',
      keyMechanism: {
        en: 'Uses 8-byte aligned object layouts with 32-bit shifted compressed pointers (-XX:+UseCompressedOops). Memory is partitioned into regional 1MB to 32MB regions managed dynamically.',
        vi: 'Sử dụng cấu trúc căn chỉnh 8-byte kèm con trỏ nén 32-bit dịch bit (-XX:+UseCompressedOops). Bộ nhớ chia thành các region từ 1MB đến 32MB được co giãn linh hoạt.'
      },
      defaultFlags: '-XX:+UseG1GC -XX:+UseCompressedOops -XX:MaxTenuringThreshold=15 -XX:+UseStringDeduplication',
      architectureNote: {
        en: 'String deduplication shares underlying byte[] arrays between duplicate String objects in Old Gen, reducing heap waste by up to 25%.',
        vi: 'Tính năng khử trùng lặp String chia sẻ mảng byte[] giữa các String có cùng nội dung ở Old Gen, tiết kiệm tới 25% RAM.'
      }
    },
    {
      jvmEngine: 'Eclipse OpenJ9',
      implementationName: 'Shared Classes & Dynamic Heap Sizing',
      keyMechanism: {
        en: 'Focuses on cloud-native low memory footprints. Employs Shared Classes Cache (SCC) in shared memory to allow multiple JVM containers to share immutable Metaspace class metadata.',
        vi: 'Tối ưu cho container đám mây với dung lượng RAM siêu nhỏ. Dùng bộ đệm Shared Classes Cache (SCC) trong shared memory để nhiều JVM dùng chung metadata của class.'
      },
      defaultFlags: '-Xshareclasses:name=app_scc,cacheDir=/tmp -Xquickstart',
      architectureNote: {
        en: 'Achieves 50% faster startup and 30% smaller memory footprints compared to traditional HotSpot JVMs.',
        vi: 'Khởi động nhanh hơn 50% và tốn ít RAM hơn 30% so với HotSpot truyền thống.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Generational separation enables nanosecond object allocation and sub-millisecond Minor GC pauses.', vi: 'Phân tách thế hệ cho phép cấp phát đối tượng tính bằng nano giây và thời gian dừng Minor GC dưới 1 mili giây.' },
      { en: 'Compressed OOPs preserves 32-bit pointer cache performance on modern 64-bit multi-core processors.', vi: 'Con trỏ nén Compressed OOPs giữ nguyên hiệu năng CPU cache của con trỏ 32-bit trên CPU 64-bit đa nhân hiện đại.' }
    ],
    cons: [
      { en: 'Memory overhead of 8-byte Mark Word and alignment padding for micro-objects (e.g. 16B for an empty object).', vi: 'Lãng phí bộ nhớ do 8-byte Mark Word và padding căn chỉnh cho các đối tượng siêu nhỏ (tốn 16B cho object rỗng).' },
      { en: 'Performance drops abruptly if heap exceeds 32GB due to uncompressed 64-bit pointer expansion.', vi: 'Hiệu năng sụt giảm đột ngột nếu cấu hình Heap vượt quá 32GB do con trỏ bị nở to thành 64-bit.' }
    ],
    memoryFootprint: {
      en: 'Low-to-Medium: Compressed OOPs saves ~40% pointer memory; 8-byte padding ensures cache line alignment.',
      vi: 'Trung bình: Nén con trỏ tiết kiệm ~40% dung lượng con trỏ; đệm 8-byte bảo đảm khớp với cache line của CPU.'
    },
    jvmSpecificationGuarantee: {
      en: 'JVM Specification mandates automatic garbage collection and transparent memory management without manual free().',
      vi: 'Đặc tả JVM bắt buộc cơ chế tự động dọn rác và quản lý bộ nhớ minh bạch mà không cần lệnh giải phóng free() thủ công.'
    }
  },

  javaCode: `package com.enterprise.jvm.memory;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Pure Java 21 Educational Inspection of JVM Memory Model & Lifecycle
 * Demonstrates:
 *  1. Short-lived Eden allocations (Eligible for Scalar Replacement)
 *  2. Survivor evacuation and tenuring promotion to Old Gen
 *  3. Off-heap Metaspace class loading reflection footprint
 */
public class JvmMemoryDemo {

    // Stored in Metaspace (Static Class Metadata)
    private static final String APP_NAME = "ENTERPRISE_CORE_SERVICE";

    // Stored in Heap (Tenured / Old Generation)
    private static final ConcurrentHashMap<Long, UserSession> GLOBAL_SESSION_CACHE = new ConcurrentHashMap<>();

    // 64-bit Object In-Memory Layout:
    // [Mark Word (8B)] + [Klass Pointer (4B)] + [id (8B)] + [ref (4B)] + [padding (0B)] = 24 Bytes
    public record UserSession(long userId, String username) {}

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== JVM RUNTIME MEMORY ALLOCATION SIMULATION ===");

        long startMem = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        System.out.printf("Initial JVM Used Memory: %.2f MB%n", startMem / (1024.0 * 1024.0));

        // Step 1: Rapid young generation allocation inside Eden
        for (int i = 0; i < 100_000; i++) {
            allocateShortLivedTelemetryData(i);
        }

        // Step 2: Promote critical long-lived object into Old Generation cache
        UserSession adminSession = new UserSession(1L, "root-admin");
        GLOBAL_SESSION_CACHE.put(adminSession.userId(), adminSession);

        System.out.println("Allocated 100,000 short-lived objects in Eden (Collected via Minor GC).");
        System.out.println("Promoted long-lived user session to Old Generation: " + adminSession);
    }

    private static void allocateShortLivedTelemetryData(int seq) {
        // Method-local object: Candidates for JIT Escape Analysis & Scalar Replacement!
        // If it never escapes this method, JIT allocates fields in CPU registers instead of Heap!
        long timestamp = System.currentTimeMillis();
        String payload = "METRIC_SEQ_" + seq;
        if (seq == -1) {
            System.out.println(payload + timestamp);
        }
    }
}`,

  jvmFlagsCode: `# ===================================================================
# Production JVM Flags for 64-bit High-Throughput Microservice
# ===================================================================
-Xms16g
-Xmx16g
-XX:+UseG1GC
-XX:+UseCompressedOops
-XX:+UseCompressedClassPointers
-XX:MaxMetaspaceSize=512m
-XX:MaxDirectMemorySize=2g
-XX:InitiatingHeapOccupancyPercent=45
-XX:G1ReservePercent=15
-XX:+ParallelRefProcEnabled

# ===================================================================
# Java Object Layout (JOL) Output for an empty Object:
# ===================================================================
# java.lang.Object object internals:
#  OFFSET  SIZE   TYPE DESCRIPTION                    VALUE
#       0     4        (object header: mark)          0x0000000000000001 (unlocked)
#       4     4        (object header: mark)          0x0000000000000000
#       8     4        (object header: class)         0x00000f28 (Compressed Klass)
#      12     4        (alignment/padding gap)
# Instance size: 16 bytes`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c -v com.enterprise.jvm.memory.JvmMemoryDemo
public static void main(java.lang.String[]) throws java.lang.InterruptedException;
  Code:
   0: getstatic     #7   // Field java/lang/System.out:Ljava/io/PrintStream;
   3: ldc           #9   // String === JVM RUNTIME MEMORY ALLOCATION SIMULATION ===
   5: invokevirtual #11  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
   8: invokestatic  #17  // Method java/lang/Runtime.getRuntime:()Ljava/lang/Runtime;
  11: invokevirtual #23  // Method java/lang/Runtime.totalMemory:()J
  14: invokestatic  #17  // Method java/lang/Runtime.getRuntime:()Ljava/lang/Runtime;
  17: invokevirtual #27  // Method java/lang/Runtime.freeMemory:()J
  20: lsub               // Subtract free memory from total memory
  21: lstore_1           // Store used memory into Local Variable Slot #1
  22: iconst_0           // Initialize loop index i = 0
  23: istore_3
  24: iload_3
  25: ldc           #31  // int 100000
  27: if_icmpge     40   // Loop check
  30: iload_3
  31: invokestatic  #33  // Method allocateShortLivedTelemetryData:(I)V
  34: iinc          3, 1 // Increment loop counter
  37: goto          24   // Loop back`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What are the main Runtime Data Areas in the JVM, and which ones are shared across threads?',
        vi: 'Các phân vùng bộ nhớ JVM Runtime Data Areas là gì và vùng nào được chia sẻ giữa các luồng?'
      },
      answer: {
        en: 'The JVM divides memory into 5 primary areas: 1. Thread-Shared: Java Heap (all class instances and arrays live here, managed by Garbage Collection) and Metaspace (native memory holding class metadata, method bytecode, and constant pool). 2. Thread-Private: JVM Stacks (one per thread, holding Stack Frames with local variables and operand stacks), Program Counter (PC) Registers (tracking executing instruction offset), and Native Method Stacks (supporting JNI C/C++ calls).',
        vi: 'JVM chia bộ nhớ thành 5 phân vùng chính: 1. Vùng chia sẻ giữa các luồng: Java Heap (lưu tất cả đối tượng và mảng, do GC quản lý) và Metaspace (bộ nhớ native lưu metadata của class, bytecode và bảng hằng). 2. Vùng riêng của từng luồng: JVM Stacks (mỗi luồng có 1 stack riêng lưu stack frame và biến cục bộ), PC Registers (thanh ghi lưu chỉ số lệnh đang chạy) và Native Method Stacks (phục vụ mã C/C++ JNI).'
      },
      trapWarning: {
        en: 'Do not confuse StackOverflowError with OutOfMemoryError: StackOverflowError occurs when thread execution depth exceeds -Xss; OutOfMemoryError occurs when Heap (-Xmx) or native Metaspace cannot allocate requested memory.',
        vi: 'Đừng nhầm StackOverflowError với OutOfMemoryError: StackOverflowError xảy ra khi gọi hàm đệ quy quá sâu vượt quá kích thước stack -Xss; OutOfMemoryError xảy ra khi Heap (-Xmx) hoặc Metaspace không thể cấp thêm RAM.'
      },
      proTip: {
        en: 'Emphasize that Metaspace was moved from JVM PermGen into native OS memory in Java 8, eliminating classical PermGen OutOfMemoryErrors.',
        vi: 'Nhấn mạnh việc Metaspace đã được chuyển từ PermGen sang bộ nhớ native của hệ điều hành từ Java 8, xóa bỏ lỗi tràn PermGen kinh điển.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What is a TLAB (Thread-Local Allocation Buffer) and how does it achieve lock-free bump-pointer allocation in Eden?',
        vi: 'TLAB (Thread-Local Allocation Buffer) là gì và cơ chế cấp phát con trỏ bump-pointer không khóa trong Eden hoạt động như thế nào?'
      },
      answer: {
        en: 'Because thousands of threads allocate objects concurrently in the young generation, synchronizing the entire Heap allocation pointer would create massive lock contention. To solve this, HotSpot assigns each thread a small private chunk of Eden memory called a TLAB. When new Object() executes, the thread simply increments its private top bump-pointer forward by the object size inside its CPU L1/L2 cache (nanosecond allocation with zero locks!). Only when the TLAB fills up does the thread synchronize briefly to claim a new TLAB block from Eden.',
        vi: 'Vì hàng ngàn luồng cùng khởi tạo đối tượng đồng thời, việc đồng bộ con trỏ cấp phát chung của cả Heap sẽ gây nghẽn khóa dữ dội. Để giải quyết, HotSpot cấp riêng cho mỗi luồng một mẩu ô nhớ nhỏ trong vùng Eden gọi là TLAB. Khi có lệnh new, luồng chỉ việc dịch con trỏ nội bộ của nó lên trước một đoạn bằng kích thước đối tượng ngay trên CPU cache L1/L2 (tốn 1 nano giây không cần khóa!). Chỉ khi vùng TLAB bị đầy, luồng mới cần đồng bộ ngắn để xin mẩu TLAB mới từ Eden.'
      },
      trapWarning: {
        en: 'If an object is extremely large (larger than the available TLAB block), the JVM bypasses TLAB and allocates it directly in the shared Eden space, or directly in Old Generation if it exceeds PretenureSizeThreshold.',
        vi: 'Nếu đối tượng quá lớn vượt quá kích thước TLAB, JVM sẽ bỏ qua TLAB và cấp phát trực tiếp trên Eden chung, hoặc đẩy thẳng lên Old Gen nếu vượt ngưỡng PretenureSizeThreshold.'
      },
      proTip: {
        en: 'Use JVM flag -XX:+PrintTLAB to inspect thread-local allocation efficiency and tune -XX:TLABSize in ultra-high-throughput trading engines.',
        vi: 'Dùng cờ -XX:+PrintTLAB để theo dõi hiệu quả cấp phát TLAB và tinh chỉnh kích thước TLAB trong các hệ thống giao dịch thông lượng cao.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'What is Compressed OOPs (-XX:+UseCompressedOops), and why does JVM memory efficiency degrade dramatically above a 32GB Heap?',
        vi: 'Compressed OOPs là gì và tại sao hiệu năng bộ nhớ JVM lại sụt giảm nghiêm trọng khi cấu hình Heap vượt quá 32GB?'
      },
      answer: {
        en: 'On 64-bit systems, raw object pointers (OOPs) consume 8 bytes each, blowing up CPU cache footprints. HotSpot introduces Compressed OOPs: because all Java objects on the Heap are aligned to 8-byte boundaries, the low 3 bits of every object address are ALWAYS zero (000). The JVM drops those 3 zero bits and stores the pointer as a 32-bit integer! When dereferencing, the CPU shifts it left by 3 bits: (32_bit_pointer << 3). With 32 bits, 2^32 * 8 bytes = 32GB of Heap can be addressed using 4-byte pointers. If -Xmx exceeds 32GB (e.g. -Xmx33g), Compressed OOPs is automatically disabled, expanding every pointer from 4 bytes to 8 bytes! This instantly consumes 20%-30% more RAM just for pointers and induces severe CPU cache line misses.',
        vi: 'Trên hệ điều hành 64-bit, con trỏ đối tượng (OOP) tốn 8 byte, làm phình to dòng cache CPU. HotSpot phát minh ra cơ chế Compressed OOPs: vì mọi đối tượng trên Heap đều được căn chỉnh theo bội số 8 byte, nên 3 bit thấp của mọi địa chỉ luôn luôn là 000. JVM lược bỏ 3 bit số 0 này và lưu con trỏ dưới dạng số nguyên 32-bit (4 byte)! Khi cần truy xuất, CPU chỉ việc dịch trái 3 bit: (pointer << 3). Với 32 bit, 2^32 * 8 byte = 32GB RAM có thể được đánh địa chỉ chỉ bằng con trỏ 4 byte. Nếu cấu hình -Xmx vượt quá 32GB (ví dụ 33GB), JVM buộc phải tắt nén con trỏ, nở to mọi con trỏ thành 8 byte! Việc này ngốn thêm 20%-30% RAM chỉ để chứa con trỏ và làm nghẽn CPU cache.'
      },
      trapWarning: {
        en: 'Never configure a production heap at 33GB or 34GB! A 31GB heap with Compressed OOPs enabled frequently provides MORE usable object capacity and significantly better performance than a 33GB heap.',
        vi: 'Không bao giờ cấu hình Heap ở mức 33GB hay 34GB! Một Heap 31GB bật nén con trỏ thường chứa được NHIỀU ĐỐI TƯỢNG HƠN và chạy nhanh hơn hẳn một Heap 33GB bị nở con trỏ 64-bit.'
      },
      proTip: {
        en: 'You can extend Compressed OOPs up to 64GB by setting 16-byte object alignment (-XX:ObjectAlignmentInBytes=16), but this increases object padding overhead.',
        vi: 'Có thể mở rộng nén con trỏ lên 64GB bằng cách tăng căn chỉnh đối tượng lên 16 byte (-XX:ObjectAlignmentInBytes=16), nhưng bù lại sẽ tốn thêm byte đệm padding cho các đối tượng nhỏ.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: '32GB Heap Boundary "Pointer Bloat Trap" & Premature Tenuring Evacuation Collapse',
      vi: 'Bẫy Nở Con Trỏ Vượt Ngưỡng 32GB Heap & Sự Cố Thăng Cấp Sớm (Premature Promotion)'
    },
    businessContext: {
      en: 'An enterprise product catalog and recommendation cluster hosts 45,000 concurrent shopper queries/second with an in-memory hot cache of 12,000,000 product documents.',
      vi: 'Cụm máy chủ gợi ý và danh mục sản phẩm phục vụ 45,000 truy vấn mua sắm mỗi giây với bộ đệm nóng trong RAM chứa 12,000,000 tài liệu sản phẩm.'
    },
    problemDescription: {
      en: 'To accommodate a 25% catalog expansion, operations bumped the JVM heap flag from -Xmx28g to -Xmx34g. Immediately following deployment, memory consumption escalated violently, and the service crashed with OutOfMemoryError after 40 minutes. Profiling revealed that setting -Xmx34g crossed the 32GB boundary, causing HotSpot to disable Compressed OOPs (-XX:+UseCompressedOops). Every reference across the entire 12,000,000-object cache expanded from 4 bytes to 8 bytes, instantly devouring 4.2GB of additional RAM solely for pointer overhead! Concurrently, small Survivor spaces caused ephemeral query DTOs to prematurely promote into Old Gen after only 2 GC cycles, triggering continuous Concurrent Mark aborts and 1.8-second Full GC pauses.',
      vi: 'Để mở rộng thêm 25% danh mục, đội vận hành nâng cấu hình Heap từ -Xmx28g lên -Xmx34g. Ngay sau khi triển khai, dung lượng RAM tăng chóng mặt và ứng dụng sập với lỗi OutOfMemoryError chỉ sau 40 phút. Phân tích chỉ ra rằng -Xmx34g đã vượt qua ranh giới 32GB, khiến HotSpot tự động tắt tính năng nén con trỏ Compressed OOPs. Mọi con trỏ tham chiếu của 12,000,000 đối tượng trong bộ đệm bị nở từ 4 byte lên 8 byte, ngốn sạch 4.2GB RAM chỉ để lưu con trỏ! Đồng thời, vùng Survivor quá nhỏ khiến các đối tượng DTO tạm thời bị thăng cấp sớm vào Old Gen chỉ sau 2 chu kỳ GC, kích hoạt các đợt Full GC kéo dài 1.8 giây.'
    },
    whyNaiveFails: {
      en: 'Bumping the heap further to -Xmx48g was cost-prohibitive ($18,000/month extra AWS bill) and caused G1GC Stop-The-World evacuation pause times to escalate to 3.2 seconds, resulting in cascading client connection timeouts.',
      vi: 'Tiếp tục nâng Heap lên -Xmx48g làm đội thêm 18,000 USD/tháng tiền thuê máy chủ và khiến thời gian dừng toàn hệ thống của G1GC tăng vọt lên 3.2 giây, gây đứt kết nối người dùng hàng loạt.'
    },
    coreSolution: {
      en: '1. Revert -Xmx to 31GB (-Xmx31744m), guaranteeing that HotSpot keeps Compressed OOPs and Compressed Class Pointers fully active with zero 64-bit pointer expansion. 2. Tune Survivor space ratios (-XX:SurvivorRatio=6, -XX:MaxTenuringThreshold=15) and enlarge TLABs (-XX:TLABSize=512k -XX:+ResizeTLAB) so short-lived search query objects die cleanly in Young Gen. 3. Offload long-term document cache entries off-heap using Chronicle-Map or RocksDB.',
      vi: '1. Điều chỉnh lại -Xmx về 31GB (-Xmx31744m), đảm bảo HotSpot luôn kích hoạt nén con trỏ Compressed OOPs và Compressed Class Pointers, triệt tiêu 100% sự lãng phí con trỏ 64-bit. 2. Tinh chỉnh tỷ lệ phân vùng Survivor (-XX:SurvivorRatio=6, -XX:MaxTenuringThreshold=15) và mở rộng kích thước TLAB (-XX:TLABSize=512k) để toàn bộ đối tượng DTO tạm thời chết sạch trong Young Gen. 3. Đưa bộ đệm tài liệu dung lượng lớn ra vùng nhớ ngoài Heap (Off-heap) dùng Chronicle-Map.'
    },
    productionCode: `// Production JVM Container Configuration Script:
# High-Throughput 31GB HotSpot Tuned Architecture Profile

java \\
  -XX:+UseContainerSupport \\
  -Xms31744m \\
  -Xmx31744m \\
  -XX:+UseG1GC \\
  # 1. Enforce 32-bit Compressed OOPs addressing up to 32GB:
  -XX:+UseCompressedOops \\
  -XX:+UseCompressedClassPointers \\
  # 2. Prevent premature promotion of short-lived query allocations:
  -XX:SurvivorRatio=6 \\
  -XX:MaxTenuringThreshold=15 \\
  -XX:InitiatingHeapOccupancyPercent=45 \\
  -XX:G1ReservePercent=15 \\
  # 3. Optimize Thread-Local Allocation Buffers (TLAB):
  -XX:TLABSize=512k \\
  -XX:+ResizeTLAB \\
  # 4. Cap Metaspace & Native Direct ByteBuffers to protect container:
  -XX:MaxMetaspaceSize=512m \\
  -XX:MaxDirectMemorySize=4g \\
  -XX:+ExitOnOutOfMemoryError \\
  -jar recommendation-service.jar`,
    architectureImpact: {
      en: 'Usable cache capacity surged by 32% within the exact same 32GB container limit; Compressed OOPs saved 4.2GB of physical RAM; Full GC pauses dropped from 1.8s to 0ms (zero Full GCs); P99 API response latency improved from 120ms to 12ms.',
      vi: 'Dung lượng bộ đệm khả dụng tăng 32% trong cùng một hạn mức container 32GB; Tính năng Compressed OOPs tiết kiệm 4.2GB RAM vật lý; Thời gian dừng Full GC giảm từ 1.8s về 0ms (không còn Full GC); Độ trễ API P99 cải thiện từ 120ms xuống còn 12ms.'
    }
  }
};
