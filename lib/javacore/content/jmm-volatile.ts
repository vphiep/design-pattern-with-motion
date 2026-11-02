import type { JavaCoreTopic } from '../types';

export const jmmVolatile: JavaCoreTopic = {
  id: 'jmm-volatile',
  category: 'concurrency-juc',
  name: 'Java Memory Model (JMM), Volatile & Hardware Barriers',
  tagline: {
    en: 'Hardware cache coherence: CPU Store Buffers, instruction reordering, happens-before consistency, and memory fences (StoreLoad).',
    vi: 'Nhất quán cache phần cứng: Bộ đệm Store Buffer của CPU, đảo thứ tự lệnh, quan hệ happens-before và rào cản bộ nhớ (StoreLoad).'
  },
  difficulty: 3,
  level: 'advanced',
  order: 17,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Modern CPUs execute instructions out-of-order and buffer writes in local hardware Store Buffers to maximize clock-cycle throughput. In multi-threaded applications without strict memory models, a write by Thread A may remain trapped inside CPU Core 1’s cache line, causing Thread B on Core 2 to read stale data indefinitely and triggering bizarre infinite loops.',
      vi: 'CPU hiện đại thực thi lệnh không theo thứ tự (Out-of-Order) và lưu tạm các thao tác ghi vào bộ đệm Store Buffer phần cứng để tối đa hóa xung nhịp. Trong ứng dụng đa luồng nếu không có mô hình bộ nhớ nghiêm ngặt, thao tác ghi của Luồng A có thể bị kẹt lại trong cache của CPU Core 1, khiến Luồng B trên Core 2 đọc phải dữ liệu cũ mãi mãi và gây ra vòng lặp vô tận bí ẩn.'
    },
    hardwareConstraint: {
      en: 'Multi-core processors maintain cache coherence via hardware protocols like MESI (Modified, Exclusive, Shared, Invalid). However, writes sitting inside CPU Store Buffers are not yet committed to the cache hierarchy. To force visibility across cores, the CPU must execute costly Memory Barrier (Fence) instructions (e.g. MFENCE / LOCK prefix on x86) that stall the pipeline until the Store Buffer flushes.',
      vi: 'Bộ xử lý đa nhân duy trì tính nhất quán cache qua giao thức phần cứng như MESI (Modified, Exclusive, Shared, Invalid). Tuy nhiên, các thao tác ghi nằm trong Store Buffer của CPU chưa được đẩy vào cây phân cấp cache. Để ép dữ liệu hiển thị sang core khác, CPU bắt buộc phải thực thi lệnh Rào Cản Bộ Nhớ (Memory Barrier / Fence như MFENCE hoặc cờ LOCK trên x86), làm dừng pipeline CPU cho tới khi Store Buffer xả sạch.'
    },
    fundamentalSolution: {
      en: 'The Java Memory Model (JMM, JSR-133) formally defines visibility and ordering via the Happens-Before relationship. Declaring a variable as volatile instructs the JIT compiler to insert hardware memory barriers: a StoreStore and StoreLoad fence on writes (forcing immediate visibility and flushing the store buffer), and a LoadLoad and LoadStore fence on reads (prohibiting instruction reordering).',
      vi: 'Mô hình bộ nhớ Java (JMM, JSR-133) định nghĩa chính thức tính hiển thị và thứ tự thực thi qua mối quan hệ Happens-Before. Khai báo biến volatile chỉ thị cho trình biên dịch JIT chèn các rào cản bộ nhớ phần cứng: rào cản StoreStore và StoreLoad khi ghi (ép dữ liệu hiển thị tức thì và xả store buffer), cùng rào cản LoadLoad và LoadStore khi đọc (ngăn chặn việc đảo thứ tự lệnh của CPU).'
    },
    math: {
      formula: 'Write(volatile v)  ⟶(happens-before)  Read(volatile v)',
      description: {
        en: 'Any memory write performed by Thread A prior to writing a volatile variable is guaranteed to be visible to Thread B after it reads that same volatile variable.',
        vi: 'Mọi thao tác ghi bộ nhớ do Luồng A thực hiện trước khi ghi vào biến volatile đều bảo đảm hiển thị rõ ràng đối với Luồng B sau khi nó đọc đúng biến volatile đó.'
      },
      timeComplexity: 'O(1) direct cache-line read/write; ~10-20ns memory barrier pipeline latency',
      spaceComplexity: 'Zero additional memory allocation; operates on primitive/reference fields directly',
      memoryOverheadFormula: 'Volatile Read Cost ≈ Standard Read;   Volatile Write Cost = Store Buffer Drain (~10ns)'
    }
  },

  detailedTheory: {
    overview: {
      en: 'The Java Memory Model (JMM) bridges the abstract semantics of Java bytecode with the complex physical reality of modern weakly-ordered multi-core processors. By defining strict boundaries for compiler optimizations, register caching, and processor instruction reordering, the JMM provides developers with predictable concurrent semantics across all CPU architectures.',
      vi: 'Mô hình bộ nhớ Java (JMM) là cầu nối giữa ngữ nghĩa trừu tượng của mã bytecode Java với thực tế vật lý phức tạp của các bộ xử lý đa nhân có mô hình bộ nhớ yếu. Bằng cách vạch ra ranh giới nghiêm ngặt cho việc tối ưu hóa của trình biên dịch, cache thanh ghi và việc đảo lệnh của CPU, JMM mang lại cho lập trình viên khả năng kiểm soát đồng thời chính xác trên mọi kiến trúc CPU.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Physical Hardware Memory Hierarchy & Store Buffers: A multi-core CPU consists of multiple physical cores, each with private L1 and L2 caches and a shared L3 cache. To prevent CPU execution units from waiting hundreds of cycles for L1 cache writes, CPUs place writes into a FIFO Store Buffer. While the writing core can see its own pending writes (store forwarding), other cores cannot! Volatile writes force the CPU to drain its store buffer onto the cache bus.',
        vi: '1. Phân Cấp Bộ Nhớ Phần Cứng & Bộ Đệm Store Buffer: CPU đa nhân gồm nhiều core vật lý, mỗi core có cache L1/L2 riêng và cache L3 dùng chung. Để tránh việc các đơn vị tính toán phải chờ đợi hàng trăm chu kỳ để ghi vào cache L1, CPU đưa các lệnh ghi vào bộ đệm Store Buffer. Trong khi core ghi có thể thấy ngay dữ liệu của mình, các core khác hoàn toàn không thấy gì! Lệnh ghi volatile ép CPU phải xả sạch Store Buffer ra đường truyền bus cache.'
      },
      {
        en: '2. Instruction Reordering: As-If-Serial vs Multi-Threaded Reality: Both compilers and CPUs reorder instructions to maximize instruction-level parallelism (pipelining, branch prediction). The only constraint is the As-If-Serial rule: single-threaded execution results must not change. However, in concurrent code, reordering a write to a data payload and a write to a boolean flag (e.g. ready = true) breaks concurrent logic! Volatile prohibits reordering across the fence boundary.',
        vi: '2. Đảo Thứ Tự Lệnh: Quy Tắc As-If-Serial vs Thực Tế Đa Luồng: Cả trình biên dịch và CPU đều đảo thứ tự lệnh để tối đa hóa tính song song (pipelining, dự đoán rẽ nhánh). Giới hạn duy nhất là quy tắc As-If-Serial: kết quả chạy đơn luồng không được thay đổi. Tuy nhiên, trong code đồng thời, việc đảo thứ tự giữa việc ghi dữ liệu và bật cờ (như ready = true) sẽ phá hủy hoàn toàn logic ứng dụng! Từ khóa volatile cấm tuyệt đối việc đảo lệnh qua ranh giới rào cản.'
      },
      {
        en: '3. The 4 Hardware Memory Barriers (Fences): The JMM defines 4 abstract memory barriers translated by HotSpot into CPU-specific assembly: 1) LoadLoad: ensures earlier reads complete before later reads; 2) StoreStore: ensures earlier writes are flushed before later writes; 3) LoadStore: ensures reads complete before subsequent writes; 4) StoreLoad: the heaviest barrier, forcing all previous writes to flush before any subsequent read executes.',
        vi: '3. Bốn Rào Cản Bộ Nhớ Phần Cứng (Memory Fences): JMM định nghĩa 4 rào cản bộ nhớ trừu tượng được HotSpot dịch thành mã máy: 1) LoadLoad: bảo đảm các lệnh đọc trước xong xuôi trước khi đọc sau; 2) StoreStore: bảo đảm các lệnh ghi trước được xả xong trước khi ghi sau; 3) LoadStore: bảo đảm lệnh đọc hoàn tất trước khi ghi tiếp; 4) StoreLoad: rào cản nặng nhất, ép toàn bộ các lệnh ghi trước đó phải xả sạch trước khi bất kỳ lệnh đọc nào được chạy.'
      },
      {
        en: '4. MESI Hardware Cache Coherence Protocol: CPU caches communicate via bus snooping protocols. In the MESI protocol, each cache line is in one of 4 states: Modified (dirty, only in this cache), Exclusive (clean, only in this cache), Shared (clean, present in multiple caches), Invalid (stale data). A volatile write broadcasts an Invalidation message across the bus, forcing all other cores to mark their cache line as Invalid and reload fresh data from RAM on their next read.',
        vi: '4. Giao Thức Nhất Quán Cache Phần Cứng MESI: Các cache CPU giao tiếp qua cơ chế lắng nghe bus (bus snooping). Trong giao thức MESI, mỗi dòng cache line nằm ở 1 trong 4 trạng thái: Modified (bẩn, chỉ có ở cache này), Exclusive (sạch, độc quyền ở cache này), Shared (sạch, có ở nhiều cache), Invalid (dữ liệu rác/hết hạn). Một lệnh ghi volatile sẽ phát đi thông điệp Invalidation trên toàn bus, buộc các core khác phải đánh dấu dòng cache của mình là Invalid và đọc lại từ RAM.'
      },
      {
        en: '5. Volatile Does NOT Guarantee Atomicity: A common trap is assuming volatile long counter makes counter++ thread-safe. In reality, counter++ is three separate bytecode operations: 1) getfield (read), 2) iadd (increment), 3) putfield (write). If two threads execute this simultaneously, both read 5, both increment to 6, and both write 6, losing an increment! To guarantee atomicity, one must use java.util.concurrent.atomic.AtomicLong or VarHandle CAS.',
        vi: '5. Volatile KHÔNG Bảo Đảm Tính Nguyên Tử (Atomicity): Sai lầm phổ biến là tưởng rằng khai báo volatile counter sẽ làm cho phép toán counter++ an toàn đa luồng. Thực tế, counter++ là 3 thao tác bytecode riêng biệt: 1) đọc giá trị (getfield), 2) cộng thêm 1 (iadd), 3) ghi ngược lại (putfield). Nếu 2 luồng cùng chạy, cả hai cùng đọc được 5, cùng cộng lên 6 và cùng ghi đè 6, làm rơi mất 1 lần đếm! Để đảm bảo nguyên tử, bắt buộc phải dùng AtomicLong hoặc lệnh CAS.'
      },
      {
        en: '6. Double-Checked Locking & Safe Publication: In the classic Singleton pattern, checking instance == null twice avoids locking once initialized. However, without volatile on the instance field, instruction reordering during object initialization (1: allocate memory, 2: assign reference, 3: call constructor) allows Thread B to observe a non-null instance whose constructor has NOT yet finished executing! Declaring volatile private static Singleton instance guarantees complete initialization before reference publication.',
        vi: '6. Khóa Hai Lớp (Double-Checked Locking) & Xuất Bản An Toàn: Trong mẫu Singleton kinh điển, kiểm tra instance == null hai lần giúp tránh xin khóa khi đã khởi tạo. Tuy nhiên, nếu thiếu volatile trên biến instance, hiện tượng đảo lệnh khi tạo đối tượng (1: cấp phát RAM, 2: gán con trỏ, 3: gọi constructor) sẽ khiến Luồng B thấy instance khác null nhưng constructor CHƯA CHẠY XONG! Khai báo volatile bảo đảm đối tượng được khởi tạo 100% trước khi con trỏ được công bố ra ngoài.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'The Non-Atomic Volatile Increment Trap: Using volatile int counter in payment or click-tracking metrics pipelines leads to severe lost updates under high concurrency. In benchmarks with 10 threads incrementing 100,000 times, a volatile int counter typically ends up around ~450,000 instead of 1,000,000! Always use AtomicInteger or LongAdder for counters.',
        vi: 'Bẫy Tăng Số Non-Atomic với Volatile: Dùng volatile int counter trong các hệ thống đếm lượt click hoặc thanh toán sẽ gây mất mát dữ liệu nghiêm trọng dưới tải cao. Thử nghiệm với 10 luồng cùng tăng 100.000 lần, biến volatile int thường chỉ đếm được ~450.000 thay vì 1.000.000! Luôn sử dụng AtomicInteger hoặc LongAdder.'
      },
      {
        en: 'False Sharing Destroying Multi-Core Throughput: When two independent volatile variables updated by different CPU cores reside within the same 64-byte CPU cache line, writing to variable A forces the CPU to invalidate the cache line for Core B. This causes the cache line to "bounce" back and forth between L1 caches, destroying throughput by up to 20x! Mitigation: Use JDK 8+ @jdk.internal.vm.annotation.Contended or manual padding bytes.',
        vi: 'Hiểm Họa Chia Sẻ Giả (False Sharing) Làm Tụt Hiệu Năng CPU: Khi hai biến volatile độc lập được hai CPU core khác nhau cập nhật nằm chung trên một dòng cache line 64-byte, việc ghi vào biến A sẽ ép CPU xóa luôn cache line của Core B. Điều này làm dòng cache line bị "nảy qua nảy lại" (Cache Bouncing) liên tục giữa các cache L1, kéo tụt hiệu năng tới 20 lần! Khắc phục: Dùng chú thích @Contended hoặc chèn byte đệm padding.'
      },
      {
        en: 'Volatile Array Reference Confusion: Declaring private volatile int[] array only makes the array reference pointer volatile, NOT its internal elements! Modifying array[0] = 42 does NOT trigger a memory barrier or guarantee cross-core visibility. Mitigation: Use AtomicIntegerArray or java.lang.invoke.VarHandle.',
        vi: 'Nhầm Lẫn Tham Chiếu Mảng Volatile: Khai báo private volatile int[] array chỉ làm cho con trỏ mảng trở thành volatile, hoàn toàn KHÔNG áp dụng cho các phần tử bên trong! Sửa array[0] = 42 không hề kích hoạt rào cản bộ nhớ hay bảo đảm hiển thị sang core khác. Khắc phục: Sử dụng AtomicIntegerArray hoặc VarHandle.'
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'CPU Cache Hierarchy, Store Buffers & Memory Barrier Architecture',
      vi: 'Cấu Trúc Phân Cấp Cache CPU, Store Buffers & Rào Cản Bộ Nhớ'
    },
    description: {
      en: 'Multi-core memory architecture showing private L1/L2 caches, CPU Store Buffers, and the StoreLoad memory barrier flushing data across the shared cache bus.',
      vi: 'Kiến trúc bộ nhớ đa nhân thể hiện cache riêng L1/L2, Store Buffer phần cứng, và rào cản StoreLoad xả dữ liệu qua đường truyền bus dùng chung.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| HARDWARE CPU MULTI-CORE MEMORY ARCHITECTURE & MEMORY BARRIERS                                       |
+----------------------------------------------------------------------------------------------------+
| +--------------------------------------+      +--------------------------------------+             |
| | CPU CORE #1                          |      | CPU CORE #2                          |             |
| |   [ Registers / Execution Units ]    |      |   [ Registers / Execution Units ]    |             |
| |          |                           |      |          |                           |             |
| |          v                           |      |          v                           |             |
| |   [ STORE BUFFER (Pending Writes) ]  |      |   [ L1 DATA CACHE (32 KB) ]          |             |
| |          |                           |      |     Status: [ Shared / Invalid ]     |             |
| |    MEMORY FENCE (StoreLoad)          |      +--------------------------------------+             |
| |          v                           |                         ^                                 |
| |   [ L1 DATA CACHE (32 KB) ]          |                         |                                 |
| |     Status: [ Modified / MESI ]      |                         |                                 |
| +--------------------------------------+                         |                                 |
|          |                                                       |                                 |
|          +--------------------------+----------------------------+                                 |
|                                     v                                                              |
|                         [ SHARED L3 CACHE (32 MB) ]                                                |
|                                     ^                                                              |
|                                     |                                                              |
|                         [ MAIN MEMORY DRAM (64 GB) ]                                               |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'mesi_cache_line_tag', size: '64 Bytes', description: { en: 'Cache line status bits in CPU hardware: Modified (M), Exclusive (E), Shared (S), Invalid (I).', vi: 'Bit trạng thái của dòng cache phần cứng: Modified (M), Exclusive (E), Shared (S), Invalid (I).' } },
      { name: 'store_buffer_entry', size: '8-64 Bytes', description: { en: 'Hardware FIFO buffer holding pending stores before eviction to L1 data cache.', vi: 'Bộ đệm phần cứng FIFO chứa các lệnh ghi dở trước khi xả vào cache L1.' } },
      { name: 'memory_barrier_instruction', size: 'CPU Opcode', description: { en: 'x86: lock prefix / mfence; ARM: dmb ish; RISC-V: fence rw,rw.', vi: 'x86: tiền tố lock / mfence; ARM: dmb ish; RISC-V: fence rw,rw.' } }
    ]
  },

  steps: [
    {
      id: 'store-buffer',
      title: { en: '1. Thread A Writes to Hardware Store Buffer', vi: '1. Luồng A Ghi Dữ Liệu vào Bộ Đệm Store Buffer của CPU' },
      phase: 'STORE_BUFFER_WRITE',
      description: {
        en: 'Thread A on Core 1 writes ready = true. Without a volatile barrier, the write is buffered inside Core 1’s local Store Buffer. Core 2’s L1 cache line still holds ready = false, causing Thread B to miss the update completely.',
        vi: 'Luồng A trên Core 1 ghi ready = true. Nếu không có rào cản volatile, lệnh ghi bị giữ lại trong Store Buffer của Core 1. Cache L1 của Core 2 vẫn chứa giá trị cũ ready = false, khiến Luồng B không hề nhìn thấy thay đổi.'
      },
      jvmRuntimeBehavior: {
        en: 'Local core write forwarding active; invisible to external CPU bus.',
        vi: 'Core ghi tự nhìn thấy dữ liệu của mình; nhưng hoàn toàn vô hình trên bus của CPU.'
      },
      javaCodeLineMatch: 'isReady = true; // buffered in CPU store buffer'
    },
    {
      id: 'memory-barrier',
      title: { en: '2. StoreLoad Barrier Drains Buffer & Emits Invalidation', vi: '2. Rào Cản StoreLoad Xả Sạch Buffer & Phát Tín Hiệu Invalidate' },
      phase: 'BARRIER_DRAIN_MESI',
      description: {
        en: 'Because isReady is declared volatile, the JIT compiler emits a StoreLoad memory barrier (lock addl on x86). Core 1 freezes execution until its Store Buffer drains to L1, and broadcasts a MESI Invalidate message across the bus.',
        vi: 'Vì biến isReady là volatile, JIT chèn một rào cản bộ nhớ StoreLoad (lệnh lock addl trên x86). Core 1 xả sạch Store Buffer vào L1, và phát đi thông điệp Invalidate theo chuẩn MESI trên toàn bộ bus phần cứng.'
      },
      jvmRuntimeBehavior: {
        en: 'Hardware cache line on Core 2 invalidated instantly.',
        vi: 'Dòng cache line trên Core 2 bị đánh dấu hết hạn (Invalid) ngay lập tức.'
      },
      javaCodeLineMatch: '// JIT emits: lock addl $0,0(%rsp) (Memory Barrier)'
    },
    {
      id: 'coherent-read',
      title: { en: '3. Thread B Reads Fresh Value from Coherent Memory', vi: '3. Luồng B Đọc Dữ Liệu Mới Nhất từ Bộ Nhớ Nhất Quán' },
      phase: 'COHERENT_CACHE_READ',
      description: {
        en: 'When Thread B on Core 2 reads isReady, its L1 cache detects the Invalid MESI state, forcing a cache miss that fetches the fresh value (true) across the shared bus in ~10ns, terminating its wait loop cleanly.',
        vi: 'Khi Luồng B trên Core 2 đọc isReady, cache L1 phát hiện trạng thái Invalid, kích hoạt cache miss để kéo dữ liệu mới nhất (true) qua đường truyền bus trong ~10ns, kết thúc vòng lặp chờ an toàn.'
      },
      jvmRuntimeBehavior: {
        en: 'Cache miss resolved across bus. Fresh volatile read completes.',
        vi: 'Cache miss được xử lý qua bus. Lệnh đọc volatile hoàn tất với giá trị mới.'
      },
      javaCodeLineMatch: 'while (!isReady) { /* loop terminates cleanly */ }'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'x86_64 Architecture (Intel / AMD)',
      implementationName: 'Total Store Order (TSO) Strong Memory Model',
      keyMechanism: {
        en: 'Hardware already guarantees StoreStore, LoadLoad, and LoadStore ordering. HotSpot only needs to emit a fence for volatile writes (StoreLoad), implemented via lock addl $0, 0(%rsp).',
        vi: 'Phần cứng x86 đã bảo đảm thứ tự StoreStore, LoadLoad, LoadStore. HotSpot chỉ cần chèn rào cản cho lệnh ghi volatile (StoreLoad) bằng lệnh lock addl $0, 0(%rsp).'
      },
      defaultFlags: 'Hardware TSO Standard',
      architectureNote: {
        en: 'Volatile reads have ZERO instruction overhead on x86 because x86 hardware disallows read reordering.',
        vi: 'Lệnh đọc volatile hoàn toàn không tốn thêm lệnh máy nào trên x86 do phần cứng x86 cấm đảo thứ tự đọc.'
      }
    },
    {
      jvmEngine: 'ARM64 / AArch64 (Apple Silicon / AWS Graviton)',
      implementationName: 'Weakly-Ordered Memory Model Architecture',
      keyMechanism: {
        en: 'ARM hardware allows full out-of-order reordering across all loads and stores. HotSpot must emit explicit DMB ISH (Data Memory Barrier, Inner Shareable) instructions for both volatile reads and writes.',
        vi: 'Phần cứng ARM cho phép đảo thứ tự toàn bộ các lệnh đọc và ghi. HotSpot bắt buộc phải chèn lệnh DMB ISH cho cả thao tác đọc và ghi volatile.'
      },
      defaultFlags: '-XX:+UseBranchProtection',
      architectureNote: {
        en: 'ARM relies on LDAR (Load-Acquire) and STLR (Store-Release) specialized instructions in ARMv8+ for ultra-fast volatile access.',
        vi: 'ARM sử dụng các lệnh chuyên dụng LDAR (Load-Acquire) và STLR (Store-Release) trên ARMv8+ để truy xuất volatile cực nhanh.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Nanosecond cross-core visibility without the heavyweight overhead of OS thread mutex locking.', vi: 'Độ trễ nano giây khi đồng bộ giữa các core CPU mà không tốn chi phí khóa mutex của hệ điều hành.' },
      { en: 'Establishes JMM happens-before boundaries, enabling safe publication of immutable and initialized data.', vi: 'Thiết lập ranh giới happens-before của JMM, bảo đảm xuất bản an toàn các đối tượng bất biến.' }
    ],
    cons: [
      { en: 'Does not guarantee atomicity for compound operations (e.g. count++ requires CAS or locks).', vi: 'Không bảo đảm tính nguyên tử cho các thao tác ghép (như count++ vẫn đòi hỏi CAS hoặc khóa).' },
      { en: 'StoreLoad barrier flushes CPU Store Buffers, momentarily stalling the processor pipeline.', vi: 'Rào cản StoreLoad xả bộ đệm Store Buffer làm tạm dừng nhẹ pipeline tính toán của CPU.' }
    ],
    memoryFootprint: {
      en: 'Zero memory overhead; operates directly on primitive and reference fields in CPU registers and cache.',
      vi: 'Không tốn thêm RAM; thao tác trực tiếp trên các trường biến nguyên thủy trong thanh ghi và cache CPU.'
    },
    jvmSpecificationGuarantee: {
      en: 'JSR-133 guarantees consistent cross-platform memory model semantics regardless of underlying CPU hardware.',
      vi: 'Đặc tả JSR-133 bảo đảm ngữ nghĩa mô hình bộ nhớ nhất quán trên mọi nền tảng bất kể kiến trúc CPU bên dưới.'
    }
  },

  javaCode: `package com.enterprise.jvm.jmm;

/**
 * Pure Java 21 Educational Masterclass: JMM Volatile Visibility & Barriers
 * Demonstrates:
 *  1. Thread visibility failure WITHOUT volatile (Infinite Loop hazard)
 *  2. Immediate cross-core synchronization WITH volatile (StoreLoad barrier)
 *  3. Safe Publication via Double-Checked Locking
 */
public class JmmVolatileDemo {

    // Volatile guarantees immediate visibility across CPU cores via MESI invalidation!
    private static volatile boolean isRunning = true;
    private static int processedCount = 0;

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== JMM VOLATILE & HARDWARE BARRIERS MASTERCLASS ===");

        // Thread 1: Background Worker executing tight loop
        Thread worker = Thread.ofPlatform().name("worker-thread").start(() -> {
            System.out.println("[WORKER] Started execution on CPU core.");
            while (isRunning) {
                // Without volatile on isRunning, the C2 JIT compiler might hoist this read
                // into a CPU register: if (!isRunning) while(true); -> Infinite loop!
                processedCount++;
            }
            System.out.println("[WORKER] Terminated cleanly! Final count: " + processedCount);
        });

        // Let the worker run for 50 milliseconds
        Thread.sleep(50);

        // Thread 2 (Main): Updates volatile flag
        // JIT emits StoreLoad barrier -> flushes Store Buffer -> invalidates worker's L1 cache line!
        System.out.println("[MAIN] Setting isRunning = false (Emitting StoreLoad Memory Barrier)...");
        isRunning = false;

        worker.join(1000);
        if (worker.isAlive()) {
            System.err.println("[ERROR] Worker thread failed to see update! (Stale CPU Cache!)");
        } else {
            System.out.println("[SUCCESS] Worker thread recognized volatile write in ~10ns!");
        }
    }
}`,

  jvmFlagsCode: `# ===================================================================
# HotSpot Flags to Disassemble JIT Machine Code & Inspect Memory Fences
# ===================================================================
# Requires hsdis library in JDK bin/ directory:
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintAssembly
-XX:CompileCommand=print,*JmmVolatileDemo.main

# Output on x86_64 shows volatile write compiled to:
#  movb $0x0, 0x10(%rdi)     ; Store isRunning = false
#  lock addl $0, 0(%rsp)     ; StoreLoad Memory Barrier (Drains CPU Store Buffer!)`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c -v com.enterprise.jvm.jmm.JmmVolatileDemo
// Notice: Field isRunning is tagged with ACC_VOLATILE!
// The JIT compiler reads this flag and automatically injects hardware memory barriers.
public static volatile boolean isRunning;
  descriptor: Z
  flags: (0x0059) ACC_PUBLIC, ACC_STATIC, ACC_VOLATILE

public static void main(java.lang.String[]) throws java.lang.InterruptedException;
  Code:
   0: iconst_0
   1: putstatic     #7   // Field isRunning:Z (Volatile write: emits StoreLoad barrier!)
   4: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What does the volatile keyword do in Java, and why is it not sufficient for thread-safe counters?',
        vi: 'Từ khóa volatile có tác dụng gì trong Java, và tại sao nó không đủ để làm an toàn đa luồng cho các biến đếm?'
      },
      answer: {
        en: 'volatile provides two guarantees: 1. Visibility: Changes made by one thread are immediately visible to all other threads because reads and writes bypass local CPU registers and flush directly to main RAM/cache. 2. Instruction Reordering Prevention: It prevents the compiler and CPU from reordering instructions across the volatile read/write barrier. However, volatile DOES NOT guarantee Atomicity! Compound operations like count++ (which involves read, modify, and write) can still be interleaved between threads, causing lost updates. Use AtomicInteger for atomic mutations.',
        vi: 'volatile mang lại 2 cam kết: 1. Tính nhìn thấy (Visibility): Mọi thay đổi do một luồng thực hiện được nhìn thấy ngay lập tức bởi các luồng khác vì việc đọc và ghi bỏ qua thanh ghi CPU cục bộ và đẩy thẳng về RAM/Cache. 2. Chống đảo thứ tự lệnh: Ngăn trình biên dịch và CPU tráo đổi thứ tự lệnh vượt qua rào cản volatile. Tuy nhiên, volatile HOÀN TOÀN KHÔNG bảo đảm tính nguyên tử (Atomicity)! Các thao tác phức như count++ (gồm 3 bước đọc, sửa, ghi) vẫn bị các luồng chen ngang gây mất dữ liệu. Hãy dùng AtomicInteger nếu cần tăng giảm số nguyên tử.'
      },
      trapWarning: {
        en: 'Never answer "volatile puts the variable in Heap memory". All instance variables are in Heap memory anyway! volatile governs CPU register caching and cache coherence synchronization, not memory location.',
        vi: 'Đừng bao giờ nói "volatile lưu biến trên Heap". Mọi biến instance đều nằm trên Heap! volatile chi phối việc cấm cache trên thanh ghi CPU và kích hoạt đồng bộ cache phần cứng, chứ không quyết định vị trí lưu trữ.'
      },
      proTip: {
        en: 'Classic valid use case: volatile boolean isRunning flag used to signal worker thread shutdown, where reads and writes are single 1-step atomic operations.',
        vi: 'Trường hợp sử dụng kinh điển: Dùng cờ volatile boolean isRunning để báo dừng luồng worker, nơi thao tác ghi chỉ là 1 bước gán boolean nguyên tử duy nhất.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What is the "Happens-Before" relationship in the Java Memory Model (JMM)?',
        vi: 'Mối quan hệ "Happens-Before" trong Mô hình bộ nhớ Java (JMM) là gì?'
      },
      answer: {
        en: 'In multi-threaded architectures, CPUs and compilers aggressively reorder instructions for speed. The Java Memory Model (JSR 133) defines Happens-Before as a formal guarantee of memory visibility: if Action A happens-before Action B, then all memory writes performed by A are guaranteed to be visible to B, and A is ordered before B. Core rules: 1. Program Order Rule: Within a single thread, actions happen in code order. 2. Volatile Variable Rule: A write to a volatile field happens-before every subsequent read of that same field. 3. Monitor Lock Rule: An unlock on a monitor happens-before every subsequent lock on that same monitor. 4. Thread Start Rule: Thread.start() happens-before any action in the started thread.',
        vi: 'Trong kiến trúc đa luồng, CPU và trình biên dịch đảo thứ tự lệnh rất mạnh để tăng tốc. JMM (JSR 133) định nghĩa Happens-Before như một cam kết toán học về tính nhìn thấy của bộ nhớ: nếu Hành động A happens-before Hành động B, thì toàn bộ các thao tác ghi dữ liệu của A bắt buộc phải được nhìn thấy bởi B, và A được coi là thực thi trước B. Các quy tắc cốt lõi: 1. Program Order: Trong một luồng đơn, code chạy theo thứ tự viết. 2. Volatile Rule: Thao tác ghi vào biến volatile luôn happens-before mọi lần đọc tiếp theo trên biến đó. 3. Monitor Lock Rule: Thao tác nhả khóa (unlock) luôn happens-before lần chiếm khóa (lock) tiếp theo trên cùng monitor. 4. Thread Start: Gọi Thread.start() luôn happens-before các lệnh bên trong luồng đó.'
      },
      trapWarning: {
        en: 'Happens-before does NOT mean Action A must physically execute before Action B in wall-clock time! It means the OBSERVABLE MEMORY EFFECTS of Action A must be visible to Action B.',
        vi: 'Happens-before KHÔNG đồng nghĩa với việc Hành động A phải chạy trước B theo đồng hồ thời gian thực! Nó có nghĩa là KẾT QUẢ THAY ĐỔI BỘ NHỚ của A bắt buộc phải hiển thị cho B thấy.'
      },
      proTip: {
        en: 'Quote Transitivity: If A happens-before B, and B happens-before C, then A happens-before C. This allows piggybacking non-volatile state updates onto a single volatile write!',
        vi: 'Nhắc đến Tính bắc cầu (Transitivity): Nếu A happens-before B và B happens-before C thì A happens-before C. Kỹ thuật này cho phép "gửi kèm" cập nhật của các biến thường vào một lần ghi volatile duy nhất (Piggybacking)!'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'Why does Double-Checked Locking in Singleton require the volatile keyword under the hood?',
        vi: 'Tại sao mẫu Singleton Double-Checked Locking bắt buộc phải có từ khóa volatile ở tầng sâu máy ảo?'
      },
      answer: {
        en: 'The statement instance = new Singleton() is NOT atomic. It breaks down into 3 bytecode steps: 1. Allocate uninitialized memory for Singleton (0xAddr). 2. Call the constructor Singleton() to initialize instance fields. 3. Assign the memory address 0xAddr to the instance reference variable. Without volatile, the compiler or CPU can reorder steps 2 and 3 (Instruction Reordering): step 3 executes BEFORE step 2! If Thread A assigns the address (step 3) and is immediately preempted before step 2 finishes, Thread B arrives at the first un-synchronized check: if (instance == null). It sees instance is NOT null (address is assigned) and returns it! Thread B attempts to use the singleton fields, which are still uninitialized, triggering catastrophic NullPointerExceptions or corrupted state. Declaring private static volatile Singleton instance injects a StoreStore/StoreLoad memory barrier, strictly forbidding step 3 from executing before step 2!',
        vi: 'Câu lệnh instance = new Singleton() KHÔNG PHẢI là thao tác nguyên tử. Nó gồm 3 bước bytecode: 1. Cấp phát ô nhớ trống cho Singleton (0xAddr). 2. Gọi hàm khởi tạo constructor để khởi tạo các trường dữ liệu. 3. Gán địa chỉ 0xAddr vào biến tham chiếu instance. Nếu KHÔNG CÓ volatile, CPU hoặc trình biên dịch có thể đảo thứ tự lệnh: bước 3 chạy TRƯỚC bước 2! Nếu Luồng A vừa gán địa chỉ (bước 3) nhưng chưa kịp chạy hàm khởi tạo (bước 2) thì Luồng B đến kiểm tra if (instance == null). Luồng B thấy instance KHÁC null (đã có địa chỉ) nên lấy dùng ngay! Luồng B truy cập vào các thuộc tính bên trong vốn chưa hề được khởi tạo, gây lỗi NullPointerException hoặc sai lệch dữ liệu thảm khốc. Khai báo private static volatile Singleton instance sẽ chèn rào cản bộ nhớ (Memory Barrier), cấm tuyệt đối việc gán địa chỉ trước khi hàm khởi tạo hoàn thành!'
      },
      trapWarning: {
        en: 'Candidates often claim the outer if (instance == null) check needs synchronization. It does not; the outer check is a performance optimization to avoid lock acquisition once initialized.',
        vi: 'Ứng viên hay nói kiểm tra if đầu tiên cần đồng bộ. Không phải; kiểm tra if bên ngoài là để tối ưu hiệu năng không phải lock một khi đối tượng đã khởi tạo xong.'
      },
      proTip: {
        en: 'Explain Bill Pugh Singleton (Initialization-on-demand holder idiom) or Java Enums as zero-overhead, thread-safe alternatives that leverage JVM classloader synchronization without volatile.',
        vi: 'Nêu giải pháp thay thế tối ưu: Dùng Bill Pugh Singleton (Holder Pattern) hoặc Java Enum để tận dụng cơ chế đồng bộ tự nhiên của ClassLoader mà không cần dùng volatile hay synchronized.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'How do hardware CPU Memory Models (x86 TSO vs ARM64 Weak Ordering) dictate the actual machine instructions emitted by the JIT compiler for volatile reads and writes?',
        vi: 'Mô hình bộ nhớ phần cứng của CPU (x86 TSO vs ARM64 Weak Ordering) quyết định các chỉ lệnh mã máy thực tế do trình biên dịch JIT sinh ra cho volatile read và write như thế nào?'
      },
      answer: {
        en: 'The JMM abstractly specifies 4 barriers: LoadLoad, LoadStore, StoreStore, and StoreLoad. However, the concrete machine code emitted depends strictly on the target CPU architecture: 1. x86_64 uses Total Store Order (TSO), which guarantees LoadLoad, LoadStore, and StoreStore for free in hardware! Therefore, on x86, a volatile write only needs a StoreLoad barrier to flush the CPU Store Buffer (emitted as a heavy "lock addl $0,0(%rsp)" or "mfence"), while volatile reads are plain "mov" instructions with ZERO hardware barrier overhead. 2. ARM64 (Apple Silicon, AWS Graviton) has a Weakly-Ordered Memory Model where the CPU can reorder ANY load or store arbitrarily! Thus, on ARM64, the JIT must emit explicit hardware barriers: "dmb ish" or modern ARMv8 load-acquire ("ldar") and store-release ("stlr") instructions. Consequently, bugs caused by missing volatile that remain dormant on x86 Intel development laptops will immediately explode into corrupt state when deployed onto ARM64 cloud servers!',
        vi: 'JMM quy định 4 rào cản bộ nhớ logic: LoadLoad, LoadStore, StoreStore và StoreLoad. Tuy nhiên mã máy thực tế do JIT sinh ra phụ thuộc hoàn toàn vào kiến trúc CPU bên dưới: 1. Trên x86_64 sử dụng mô hình Total Store Order (TSO), phần cứng đã tự đảm bảo LoadLoad, LoadStore và StoreStore hoàn toàn miễn phí! Do đó trên x86, volatile write chỉ cần duy nhất rào cản StoreLoad để xả Store Buffer của CPU (phát sinh lệnh "lock addl" hoặc "mfence"), còn volatile read chỉ là lệnh "mov" bình thường không tốn một chút overhead nào. 2. Ngược lại, kiến trúc ARM64 (Apple Silicon, AWS Graviton) là mô hình bộ nhớ yếu (Weakly Ordered), CPU có thể tự do đảo bất kỳ lệnh đọc hay ghi nào! Vì vậy trên ARM64, JIT bắt buộc phải sinh ra các lệnh rào cản đắt đỏ như "dmb ish" hoặc cặp lệnh "ldar" (load-acquire) và "stlr" (store-release). Hệ quả: một bug thiếu volatile có thể chạy hoàn toàn trơn tru trên laptop Intel x86 của lập trình viên, nhưng sẽ nổ tung gây sai lệch dữ liệu ngay khi deploy lên cụm máy chủ đám mây ARM64!'
      },
      trapWarning: {
        en: 'Never benchmark concurrency code exclusively on x86 developer machines and assume it behaves identically on ARM64 cloud instances. The weakness of the ARM memory model exposes subtle race conditions that TSO hardware masks.',
        vi: 'Tuyệt đối không đo đạc benchmark code đa luồng trên máy tính x86 rồi ngộ nhận rằng nó chạy giống hệt trên ARM64. Mô hình bộ nhớ yếu của ARM sẽ phơi bày các lỗi tranh chấp mà phần cứng x86 đã vô tình che giấu.'
      },
      proTip: {
        en: 'Mention Java 9 VarHandle: VarHandle introduces fine-grained access modes like getAcquire()/setRelease() and getOpaque()/setOpaque(), allowing high-performance developers to enforce directional memory ordering without paying the full StoreLoad barrier cost of volatile write.',
        vi: 'Nêu bật tính năng Java 9 VarHandle: Cung cấp các chế độ truy cập tinh vi như getAcquire()/setRelease() và getOpaque()/setOpaque(), giúp lập trình viên kiểm soát rào cản bộ nhớ theo một chiều mà không phải trả giá bằng lệnh StoreLoad đắt đỏ của volatile write.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'Multi-Core CPU Store Buffer Reordering & Half-Initialized Cryptographic Vault Bug',
      vi: 'Hiện Tượng Đảo Lệnh CPU Store Buffer & Lỗi Đọc Đối Tượng Nửa Khởi Tạo Trên ARM64'
    },
    businessContext: {
      en: 'A tier-1 fintech payment security module signs 45,000 digital transaction payloads per second across 32-core AWS Graviton3 (ARM64) production instances.',
      vi: 'Module bảo mật thanh toán số ký 45,000 giao dịch mỗi giây trên cụm máy chủ AWS Graviton3 (kiến trúc ARM64) 32 lõi CPU.'
    },
    problemDescription: {
      en: 'The security architect implemented a lazy-initialized singleton CryptographicKeyVault using classic Double-Checked Locking but omitted the volatile keyword: private static CryptographicKeyVault instance. The code passed all unit and stress tests on developer laptops (x86 architecture with Total Store Order). In production on ARM64 processors (which utilize a Weak Memory Ordering model), the out-of-order CPU execution pipeline committed the memory address of the new vault to L1 cache before the constructor finished initializing the AES/RSA secret key arrays. Worker threads received a non-null vault reference whose secretKey array was still null or half-populated with zeroes! Under 12,000 concurrent requests, this sporadic race condition triggered intermittent NullPointerExceptions and corrupted cryptographic signatures, halting international settlement pipelines.',
      vi: 'Kiến trúc sư bảo mật xây dựng lớp CryptographicKeyVault theo mẫu Singleton Double-Checked Locking nhưng quên từ khóa volatile: private static CryptographicKeyVault instance. Toàn bộ bài kiểm thử đều chạy hoàn hảo trên máy dev (kiến trúc x86 với mô hình Total Store Order). Nhưng khi đưa lên môi trường sản xuất chạy chip ARM64 (với mô hình bộ nhớ Weak Memory Ordering lỏng lẻo), đường ống lệnh của CPU đã ghi địa chỉ của đối tượng vào cache TRƯỚC KHI hàm constructor hoàn thành khởi tạo mảng khóa AES/RSA bí mật. Các luồng worker nhận được tham chiếu khác null nhưng mảng secretKey bên trong vẫn là null hoặc chứa toàn số 0! Khi có 12,000 request ùa vào, lỗi tranh chấp này gây ra hàng loạt ngoại lệ NullPointerException và làm hỏng chữ ký số, đình trệ toàn bộ luồng thanh toán quốc tế.'
    },
    whyNaiveFails: {
      en: 'Wrapping the entire getInstance() method in synchronized resolved the visibility bug but degraded throughput by 84% (from 45,000 signs/sec down to 7,200 signs/sec) because 32 CPU cores constantly contended on a single global monitor just to read an immutable singleton reference.',
      vi: 'Đồng bộ hóa toàn bộ hàm getInstance() bằng synchronized giải quyết được lỗi nhìn thấy nhưng bóp nghẹt 84% thông lượng (từ 45,000 giảm xuống còn 7,200 chữ ký/giây) vì 32 lõi CPU phải liên tục tranh chấp một khóa monitor duy nhất chỉ để đọc một con trỏ tham chiếu bất biến.'
    },
    coreSolution: {
      en: '1. Add volatile to the instance variable: private static volatile CryptographicKeyVault instance. On ARM64, the volatile write compiles into a DMB ISH (Data Memory Barrier) hardware instruction, guaranteeing that all constructor field writes drain from the CPU store buffer before the reference is made visible to other cores. 2. Alternatively, migrate to the Bill Pugh Holder Idiom, leveraging HotSpot ClassLoader thread-safe initialization guarantees (JLS §12.4.2) for zero-overhead, lock-free performance.',
      vi: '1. Bổ sung từ khóa volatile: private static volatile CryptographicKeyVault instance. Trên chip ARM64, lệnh ghi volatile sinh ra chỉ lệnh phần cứng DMB ISH (Data Memory Barrier), bắt buộc toàn bộ dữ liệu của hàm constructor phải được xả sạch từ Store Buffer vào Cache trước khi con trỏ được công bố cho các lõi khác. 2. Hoặc chuyển hẳn sang mẫu Bill Pugh Holder Idiom, tận dụng cơ chế khởi tạo an toàn tự nhiên của ClassLoader (JLS §12.4.2) để đạt hiệu năng tối đa mà không tốn chi phí khóa.'
    },
    productionCode: `// Production Thread-Safe Singleton: Volatile DCL vs Bill Pugh Idiom
package com.security.vault;

public final class CryptographicKeyVault {
    private final byte[] hmacKey;
    private final byte[] rsaPrivateKey;

    // Private constructor with complex cryptographic initialization
    private CryptographicKeyVault() {
        this.hmacKey = generateHmacKey();
        this.rsaPrivateKey = generateRsaPrivateKey();
    }

    // =========================================================================
    // SOLUTION 1: Production Double-Checked Locking with volatile Memory Barrier
    // =========================================================================
    // volatile injects CPU StoreStore barrier: forbids reordering constructor past address assignment!
    private static volatile CryptographicKeyVault volatileInstance;

    public static CryptographicKeyVault getVolatileInstance() {
        CryptographicKeyVault local = volatileInstance; // Single volatile read
        if (local == null) {
            synchronized (CryptographicKeyVault.class) {
                local = volatileInstance;
                if (local == null) {
                    volatileInstance = local = new CryptographicKeyVault();
                }
            }
        }
        return local;
    }

    // =========================================================================
    // SOLUTION 2: Bill Pugh Holder Idiom (Zero volatile overhead, 100% JVM Safe)
    // =========================================================================
    private static class VaultHolder {
        // Class loaded lazily only upon first getHolderInstance() call
        // JVM ClassLoader guarantees thread-safety and complete memory publication (JLS §12.4.2)
        static final CryptographicKeyVault INSTANCE = new CryptographicKeyVault();
    }

    public static CryptographicKeyVault getHolderInstance() {
        return VaultHolder.INSTANCE; // Zero locks, zero volatile reads, blazing fast!
    }

    private static byte[] generateHmacKey() { return new byte[]{1, 2, 3, 4}; }
    private static byte[] generateRsaPrivateKey() { return new byte[]{5, 6, 7, 8}; }
}`,
    architectureImpact: {
      en: 'Zero half-initialized object reads or NullPointerExceptions on multi-core ARM64 hardware; Steady-state read throughput reached 48,000 operations/second with zero locks or thread contention; Signature verification latency dropped to 4 microseconds.',
      vi: 'Triệt tiêu 100% lỗi đọc đối tượng nửa vời và NullPointerException trên máy chủ ARM64 đa lõi; Thông lượng đọc ổn định đạt 48,000 phép tính/giây với 0 lần tranh chấp khóa; Độ trễ xác thực chữ ký số giảm xuống còn 4 micro-giây.'
    }
  }
};
