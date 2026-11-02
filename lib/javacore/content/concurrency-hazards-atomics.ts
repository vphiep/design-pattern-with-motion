import type { JavaCoreTopic } from '../types';

export const concurrencyHazardsAtomicsTopic: JavaCoreTopic = {
  id: 'concurrency-hazards-atomics',
  category: 'concurrency-juc',
  name: 'Concurrency Hazards: Race Condition, Deadlock, ReentrantLock & Atomics',
  tagline: {
    en: 'Deconstructing Race Conditions (read-modify-write), Deadlock Coffman conditions, ReentrantLock tryLock timeouts, and hardware CAS Atomic Variables.',
    vi: 'Mổ xẻ Race Condition (read-modify-write), 4 điều kiện Deadlock, cơ chế ReentrantLock tryLock và biến nguyên tử Atomic CAS phần cứng.'
  },
  difficulty: 1,
  level: 'basic',
  order: 9,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      en: 'In concurrent microservices, uncoordinated threads mutating shared state cause catastrophic silent data corruption (e.g. lost banking balances, double-spending) and sudden permanent freezes (deadlocks). Using naive synchronization introduces heavy contention and latency, while uncareful locking triggers thread hangs.',
      vi: 'Trong các microservice xử lý đồng thời, việc nhiều luồng cùng sửa đổi trạng thái chia sẻ mà không đồng bộ sẽ gây mất dữ liệu âm thầm (mất tiền trong tài khoản, giao dịch kép) và treo cứng hệ thống do Deadlock. Dùng khóa thô thì gây nghẽn hiệu năng, trong khi khóa không cẩn thận lại dẫn đến bế tắc luồng vĩnh viễn.'
    },
    hardwareConstraint: {
      en: 'The statement count++ is NOT an atomic operation: it compiles into 3 distinct CPU instructions: 1. Read memory into CPU register. 2. Increment register. 3. Write register back to L1 Cache/RAM. If another thread interleaves between step 1 and 3, an update is permanently lost. Hardware addresses this via atomic instructions like x86 LOCK CMPXCHG (Compare-And-Swap), enabling lock-free synchronization in 5ns.',
      vi: 'Câu lệnh count++ KHÔNG PHẢI là thao tác nguyên tử: nó gồm 3 lệnh CPU riêng biệt: 1. Đọc ô nhớ vào thanh ghi. 2. Tăng giá trị thanh ghi. 3. Ghi ngược lại RAM/Cache. Nếu luồng khác chen vào giữa bước 1 và 3, một lượt cập nhật sẽ bị mất vĩnh viễn. Phần cứng giải quyết việc này qua lệnh nguyên tử LOCK CMPXCHG (Compare-And-Swap), cho phép đồng bộ không cần khóa chỉ tốn 5ns.'
    },
    fundamentalSolution: {
      en: 'Java provides a multi-tiered defense against concurrency hazards: 1. Mutex Locks (synchronized & ReentrantLock): ReentrantLock adds tryLock(timeout) to eliminate deadlock hazards, fairness settings, and Condition queues. 2. Deadlock Prevention: Always acquire locks in a globally consistent order to break the Circular Wait Coffman condition. 3. Atomic Variables (AtomicInteger, AtomicReference): Lock-free thread-safety via native CAS loops. 4. LongAdder: Cell-striped counters reducing cache line contention for extreme write throughput.',
      vi: 'Java cung cấp hệ thống phòng thủ đa tầng chống lỗi đa luồng: 1. Khóa tương hỗ (synchronized & ReentrantLock): ReentrantLock bổ sung tryLock(timeout) để loại bỏ nguy cơ deadlock, tùy chọn công bằng và Condition queue. 2. Phòng chống Deadlock: Luôn chiếm các khóa theo thứ tự nhất quán toàn cục để bẻ gãy vòng chờ lặp Circular Wait. 3. Biến nguyên tử Atomics: Đảm bảo an toàn không khóa (lock-free) qua vòng lặp CAS phần cứng. 4. LongAdder: Phân tán ghi trên nhiều ô nhớ (cell striping) cho thông lượng cực hạn.'
    },
    math: {
      formula: 'CAS(V, Expected, New): if (*V == Expected) { *V = New; return true; } else { return false; }',
      description: {
        en: 'Hardware Compare-And-Swap (CAS) executes atomically on CPU cores via bus locking or cache line locking. Deadlock occurs if and only if all 4 Coffman conditions hold: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.',
        vi: 'Lệnh phần cứng CAS thực thi nguyên tử trên nhân CPU bằng cách khóa dòng cache. Deadlock chỉ xảy ra khi thỏa mãn cả 4 điều kiện Coffman: 1. Khóa tương hỗ, 2. Giữ và chờ, 3. Không thể trưng dụng, 4. Chờ đợi vòng tròn.'
      },
      timeComplexity: 'Atomic CAS: O(1) single attempt; Lock Contention: ~2us OS sleep latency',
      spaceComplexity: 'AtomicInteger: 16 Bytes on Heap; LongAdder: Dynamic array of 16-64B Cell objects',
      memoryOverheadFormula: 'Deadlock Detection = O(V + E) cycle detection in Thread Resource Allocation Graph'
    }
  },

  memoryLayout: {
    title: {
      en: 'Memory Mechanics: Interleaved Race Condition vs Hardware Atomic CMPXCHG',
      vi: 'Cơ Chế Ô Nhớ: Xung Đột Race Condition Xen Kẽ vs Lệnh Nguyên Tử CMPXCHG'
    },
    description: {
      en: 'In a race condition, two threads read value 10 simultaneously; both write back 11, losing one increment. In Atomic CAS, the CPU atomically verifies that memory still equals 10 before updating to 11.',
      vi: 'Trong Race Condition, 2 luồng cùng đọc giá trị 10; cả hai cùng ghi ngược lại 11 làm mất 1 lần đếm. Với Atomic CAS, CPU kiểm tra nguyên tử xem ô nhớ có còn đúng là 10 không trước khi ghi 11.'
    },
    asciiDiagram: `
RACE CONDITION (LOST UPDATE):
Thread 1: Read count (10) ------> Increment (11) -------------> Write count (11)
Thread 2: -------> Read count (10) ------> Increment (11) ------> Write count (11) -> LOST UPDATE!

VS

ATOMIC CAS HARDWARE (LOCK-FREE):
Thread 1: CAS(expected=10, new=11) -> Memory is 10? YES -> Atomic write 11 -> SUCCESS!
Thread 2: CAS(expected=10, new=11) -> Memory is 11? NO  -> Retry Loop!
          Reads new value 11 -> CAS(expected=11, new=12) -> SUCCESS!`,
    byteFields: [
      { name: 'AtomicInteger value', size: '4 Bytes', description: { en: 'Volatile integer field directly mapped to physical memory.', vi: 'Biến volatile integer đọc ghi trực tiếp trên bộ nhớ vật lý.' } },
      { name: 'Unsafe / VarHandle Offset', size: '8 Bytes', description: { en: 'Raw memory byte offset of the value field inside the object instance.', vi: 'Độ lệch byte thô của trường dữ liệu bên trong đối tượng trên Heap.' } },
      { name: 'LongAdder Cell Array', size: 'Array of Cells', description: { en: 'Striped padding cells padded to 128 bytes to prevent CPU False Sharing.', vi: 'Các ô nhớ đệm được cách ly 128 byte để tránh lỗi chia sẻ giả Cache False Sharing.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Concurrent software systems are vulnerable to fundamental hazards: Race Conditions (Lost Updates), Deadlocks, Livelocks, and Thread Starvation. Modern Java resolves these hazards through two distinct paradigms: Pessimistic Coarse-Grained Locking (synchronized, ReentrantLock) and Optimistic Lock-Free Atomic Hardware Primitives (CAS loops, Atomic Variables, LongAdder).',
      vi: 'Các hệ thống phần mềm đa luồng luôn phải đối mặt với các hiểm họa căn bản: Xung đột dữ liệu Race Condition (Lost Update), Khóa chết Deadlock, Livelock và Đói tài nguyên (Starvation). Java hiện đại giải quyết các hiểm họa này bằng hai trường phái: Khóa bi quan có kiểm soát (Pessimistic Locking qua synchronized, ReentrantLock) và Cơ chế phi khóa lạc quan ở tầng phần cứng (Lock-Free qua vòng lặp CAS, biến Atomic và LongAdder).'
    },
    deepDiveParagraphs: [
      {
        en: '1. Physics of Race Conditions (Read-Modify-Write Hazards): A race condition occurs whenever two or more threads access shared mutable state without proper synchronization, and at least one access is a write. At the machine level, seemingly simple operations like count++ or balance += amount require 3 distinct assembly operations: MOV (load memory to CPU register), ADD (increment register), and MOV (write register back to memory). When threads interleave across these steps, the second write silently obliterates the first write without any error being raised.',
        vi: '1. Bản chất của Race Condition (Hiểm họa Đọc-Sửa-Ghi): Race Condition xảy ra khi từ 2 luồng trở lên cùng truy cập vào một vùng nhớ có thể thay đổi mà không được đồng bộ hóa, và có ít nhất một thao tác ghi. Ở tầng mã máy, thao tác tưởng như đơn giản như count++ hay balance += amount thực chất gồm 3 bước riêng biệt: MOV (nạp từ RAM vào thanh ghi CPU), ADD (cộng giá trị trên thanh ghi), và MOV (ghi ngược lại RAM). Khi các luồng chạy xen kẽ giữa 3 bước này, luồng thứ hai sẽ ghi đè và làm mất trắng kết quả của luồng thứ nhất mà không hề có ngoại lệ nào phát sinh.'
      },
      {
        en: '2. The 4 Coffman Conditions of Deadlock: A deadlock can occur if and only if all four Coffman conditions hold simultaneously: 1. Mutual Exclusion (resources cannot be shared). 2. Hold and Wait (threads hold a resource while requesting another). 3. No Preemption (resources cannot be forcibly taken). 4. Circular Wait (Thread 1 waits for Thread 2, which waits for Thread 1). System architectures break deadlocks by eliminating Circular Wait via Global Deterministic Lock Ordering (e.g., sorting resource IDs before acquiring locks) or eliminating indefinite wait via timed locks (tryLock(timeout)).',
        vi: '2. 4 Điều kiện Coffman của Khóa chết (Deadlock): Deadlock chỉ có thể xảy ra khi cả 4 điều kiện sau cùng tồn tại: 1. Loại trừ tương hỗ (Tài nguyên chỉ 1 người dùng). 2. Giữ và chờ (Giữ tài nguyên A trong khi chờ tài nguyên B). 3. Không cướp đoạt (Không thể cưỡng chế đoạt tài nguyên của luồng khác). 4. Chờ đợi vòng tròn (Luồng 1 chờ Luồng 2, Luồng 2 lại chờ Luồng 1). Kiến trúc hệ thống bẻ gãy Deadlock bằng cách triệt tiêu Chờ đợi vòng tròn thông qua việc Sắp xếp thứ tự khóa cố định (Deterministic Lock Ordering - sắp xếp theo ID tài nguyên trước khi lock) hoặc dùng khóa có thời hạn tryLock(timeout).'
      },
      {
        en: '3. Lock-Free Hardware Primitives & Compare-And-Swap (CAS): To avoid thread parking and context-switch penalties, modern CPUs (x86, ARM64) provide atomic hardware primitives: CMPXCHG (Compare-and-Exchange). An atomic variable operation executes in an optimistic loop: it reads the current value, computes the desired new value, and issues a hardware CAS instruction. If physical memory still matches the expected value, the CPU writes the new value atomically in a single bus cycle. If another thread modified the value, CAS fails, and the loop retries with fresh state—achieving 100% thread safety without operating system kernel locks.',
        vi: '3. Cơ chế Phi khóa phần cứng & Lệnh So sánh-Thay thế (CAS): Để tránh việc luồng phải đi ngủ và tốn chi phí chuyển đổi ngữ cảnh, các CPU hiện đại (x86, ARM64) cung cấp tập lệnh nguyên tử ở tầng phần cứng: CMPXCHG. Thao tác biến Atomic chạy trong một vòng lặp lạc quan: đọc giá trị hiện tại, tính giá trị mới, và phát lệnh CAS phần cứng. Nếu ô nhớ vật lý vẫn khớp với giá trị kỳ vọng, CPU cập nhật giá trị mới tức thì trong 1 chu kỳ bus. Nếu có luồng khác vừa chen ngang sửa đổi, lệnh CAS thất bại và vòng lặp tự động thử lại với dữ liệu mới—đạt được sự an toàn đa luồng tuyệt đối mà không cần dùng đến khóa của nhân hệ điều hành.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Assuming that volatile guarantees thread-safety for operations like count++ or boolean flag inversion (!flag). volatile only guarantees visibility and ordering; it provides zero atomicity for multi-step composite operations.',
        vi: 'Lầm tưởng rằng từ khóa volatile bảo đảm an toàn đa luồng cho các thao tác như count++ hay đảo cờ boolean (!flag). volatile chỉ bảo đảm tính nhìn thấy và chống đảo lệnh; nó hoàn toàn không có tính nguyên tử cho các thao tác phức gồm nhiều bước.'
      },
      {
        en: 'Inconsistent lock acquisition ordering across microservices or repositories (e.g. AccountService locks A then B, while TransferService locks B then A), creating fatal distributed deadlocks under concurrent user traffic.',
        vi: 'Thứ tự chiếm khóa không nhất quán giữa các hàm hoặc service (ví dụ hàm nạp tiền khóa A rồi B, nhưng hàm chuyển tiền lại khóa B rồi A), tạo ra các ổ khóa chết (Deadlock) chí mạng khi tải cao.'
      },
      {
        en: 'Unbounded atomic CAS spin loops under massive thread contention (e.g., 64 threads pounding on a single AtomicLong). Repeated CAS failures cause severe CPU cache line invalidation and pin CPU cores at 100% without making progress; use LongAdder for high-contention counters.',
        vi: 'Vòng lặp CAS quay cuồng vô tận khi mức độ cạnh tranh quá cao (như 64 luồng cùng tranh chấp một AtomicLong). Thao tác CAS liên tục thất bại làm mất hiệu lực dòng cache CPU và đốt 100% CPU mà không hoàn thành công việc; hãy dùng LongAdder cho các bộ đếm tải cao.'
      }
    ]
  },

  steps: [
    {
      id: 'race-condition-interleaving',
      title: { en: '1. Read-Modify-Write Race Condition Interleaving', vi: '1. Xung Đột Dữ Liệu Khi Đọc-Sửa-Ghi Xen Kẽ' },
      phase: 'RACE_INTERLEAVING',
      description: {
        en: 'Threads A and B both execute balance += 100 concurrently. Both read 1000 into their CPU registers. Thread A writes 1100, then Thread B overwrites with 1100. $100 disappeared without any exception being thrown!',
        vi: 'Hai luồng A và B cùng chạy balance += 100. Cả hai cùng đọc 1000 vào thanh ghi CPU. Luồng A ghi 1100, sau đó luồng B ghi đè 1100. Đúng 100 USD biến mất mà không có bất kỳ ngoại lệ nào phát sinh!'
      },
      jvmRuntimeBehavior: {
        en: 'Disassembled bytecode shows getfield, iadd, putfield interleaving across threads.',
        vi: 'Bytecode bị xen kẽ giữa các lệnh getfield, iadd và putfield giữa các luồng.'
      },
      javaCodeLineMatch: 'balance++; // Non-atomic 3-step operation!'
    },
    {
      id: 'reentrantlock-trylock-timeout',
      title: { en: '2. ReentrantLock tryLock() Eliminates Deadlock', vi: '2. Cơ Chế tryLock(timeout) Của ReentrantLock Triệt Tiêu Deadlock' },
      phase: 'DEADLOCK_DEFENSE',
      description: {
        en: 'When acquiring locks on multiple resources (Account A and Account B), instead of blocking forever in a deadlock, the thread uses lock.tryLock(500, TimeUnit.MILLISECONDS). If timeout expires, it releases all held locks and retries later.',
        vi: 'Khi cần khóa nhiều tài khoản A và B, thay vì chờ vô hạn gây deadlock, luồng dùng lock.tryLock(500, TimeUnit.MILLISECONDS). Nếu hết thời gian chờ, nó tự nhả các khóa đang giữ để thử lại sau.'
      },
      jvmRuntimeBehavior: {
        en: 'Avoids placing thread into un-interruptible BLOCKED state; uses LockSupport.parkNanos().',
        vi: 'Không đưa luồng vào trạng thái BLOCKED vĩnh viễn; sử dụng cơ chế chờ có thời hạn parkNanos.'
      },
      javaCodeLineMatch: 'if (lockA.tryLock(100, TimeUnit.MILLISECONDS))'
    },
    {
      id: 'atomic-cas-hardware-loop',
      title: { en: '3. Atomic Variable CAS Hardware Loop', vi: '3. Vòng Lặp Nguyên Tử CAS Trên Thanh Ghi CPU' },
      phase: 'ATOMIC_CAS_LOOP',
      description: {
        en: 'AtomicInteger.incrementAndGet() executes a lock-free loop: int current = get(); if (compareAndSet(current, current + 1)) return current + 1; Zero thread sleeping, zero context switching overhead.',
        vi: 'AtomicInteger.incrementAndGet() thực thi vòng lặp không khóa: int current = get(); if (compareAndSet(current, current + 1)) return current + 1; Hoàn toàn không khóa luồng, không tốn chi phí context switch.'
      },
      jvmRuntimeBehavior: {
        en: 'Directly emits x86 lock cmpxchg instruction, achieving atomic update in 3-5 nanoseconds.',
        vi: 'Phát trực tiếp lệnh máy CPU lock cmpxchg, hoàn thành cập nhật chỉ trong 3 đến 5 nanogiây.'
      },
      javaCodeLineMatch: 'atomicBalance.incrementAndGet(); // Lock-free atomic increment'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Java LongAdder',
      implementationName: 'Striped 64-bit Cell Counters (JEP 155)',
      keyMechanism: {
        en: 'Under extreme thread contention, AtomicLong suffers heavy CAS retry spinning as threads contend for the same memory address. LongAdder stripes the counter across an internal Cell[] array hashed by thread ID. Elements are summed on sum(), eliminating contention bottlenecks.',
        vi: 'Dưới tải tranh chấp cao, AtomicLong bị nghẽn do hàng chục luồng cùng retry CAS trên 1 ô nhớ. LongAdder chia nhỏ biến đếm thành mảng Cell[] theo ID luồng. Khi cần lấy tổng thì gọi sum(), tăng tốc độ ghi gấp 10 lần.'
      },
      defaultFlags: '-XX:+TieredCompilation',
      architectureNote: {
        en: 'Always use LongAdder instead of AtomicLong for high-throughput metrics and throughput counters.',
        vi: 'Luôn ưu tiên LongAdder thay vì AtomicLong cho các bộ đếm metric thông lượng cao.'
      }
    },
    {
      jvmEngine: 'HotSpot JVM ThreadMXBean Deadlock Detector',
      implementationName: 'Cycle Detection on Resource Allocation Graph',
      keyMechanism: {
        en: 'ManagementFactory.getThreadMXBean().findDeadlockedThreads() scans all active JVM monitors and LockSupport locks for dependency cycles in O(V + E) time.',
        vi: 'Hàm findDeadlockedThreads() tự động quét toàn bộ monitor và khóa trong JVM để phát hiện chu trình phụ thuộc vòng tròn gây Deadlock.'
      },
      defaultFlags: '-XX:+UnlockDiagnosticVMOptions',
      architectureNote: {
        en: 'Can be scheduled in background health checks to alert Prometheus/Grafana immediately when a deadlock occurs.',
        vi: 'Có thể tích hợp vào tiến trình health-check định kỳ để gửi cảnh báo sớm lên Prometheus/Grafana.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Atomic variables provide lock-free, starvation-free synchronization with zero OS context switch latency.',
        vi: 'Biến nguyên tử Atomics mang lại khả năng đồng bộ không khóa, loại bỏ hoàn toàn độ trễ context switch của OS.'
      },
      {
        en: 'ReentrantLock tryLock() provides foolproof defense against production deadlocks.',
        vi: 'Cơ chế tryLock() của ReentrantLock là giải pháp bảo đảm 100% không bao giờ bị deadlock vĩnh viễn.'
      }
    ],
    cons: [
      {
        en: 'Extreme CAS contention causes excessive CPU busy-spinning as threads repeatedly fail compareAndSet().',
        vi: 'Tranh chấp CAS quá lớn sẽ khiến CPU bị chiếm dụng cao do các luồng liên tục lặp retry thất bại.'
      },
      {
        en: 'ReentrantLock requires mandatory manual unlocking inside a finally block; forgetting unlock() causes permanent deadlocks.',
        vi: 'ReentrantLock bắt buộc phải unlock thủ công trong khối finally; nếu quên sẽ khóa chết toàn bộ hệ thống.'
      }
    ],
    memoryFootprint: {
      en: 'AtomicInteger is 16 bytes. LongAdder allocates up to 1-2KB dynamically for padded Cell arrays.',
      vi: 'AtomicInteger tốn 16 byte. LongAdder tốn thêm khoảng 1-2KB cho mảng các ô nhớ đệm phân tán.'
    },
    jvmSpecificationGuarantee: {
      en: 'JLS §17.4: Memory operations on volatile fields and Atomic variables have happens-before consistency across all threads.',
      vi: 'Quy chuẩn Java: Mọi thao tác ghi trên biến volatile và Atomic đều thiết lập quan hệ happens-before nhất quán với mọi luồng.'
    }
  },

  javaCode: `package com.engine.fundamentals;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Demonstrates:
 * 1. Race Condition on plain primitives
 * 2. Lock-free AtomicInteger & High-Throughput LongAdder
 * 3. Deadlock prevention using ReentrantLock tryLock(timeout)
 */
public class ConcurrencyHazardsDemo {

    // HAZARD: Plain primitive subject to race conditions
    private static int unsafeCount = 0;

    // SOLUTION 1: Lock-free Atomic Variable
    private static final AtomicInteger atomicCount = new AtomicInteger(0);

    // SOLUTION 2: Ultra High-Throughput Striped Counter
    private static final LongAdder stripedCounter = new LongAdder();

    // Deadlock Prevention Locks
    private static final ReentrantLock lockA = new ReentrantLock();
    private static final ReentrantLock lockB = new ReentrantLock();

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== CONCURRENCY HAZARDS & ATOMICS DEMO ===");

        // Test 1: Race Condition vs Atomic Update
        Thread t1 = new Thread(ConcurrencyHazardsDemo::incrementWork);
        Thread t2 = new Thread(ConcurrencyHazardsDemo::incrementWork);

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Expected count:  200000");
        System.out.println("Unsafe count:    " + unsafeCount + " (DATA LOSS DUE TO RACE CONDITION!)");
        System.out.println("Atomic count:    " + atomicCount.get() + " (100% ACCURATE!)");
        System.out.println("LongAdder count: " + stripedCounter.sum() + " (100% ACCURATE!)");

        // Test 2: Deadlock-Free Transfer using tryLock
        boolean transferSuccess = safeTransferWithTimeout();
        System.out.println("Safe transfer completed without deadlock: " + transferSuccess);
    }

    private static void incrementWork() {
        for (int i = 0; i < 100_000; i++) {
            unsafeCount++;                  // NOT thread-safe!
            atomicCount.incrementAndGet();  // Thread-safe CAS
            stripedCounter.increment();     // Thread-safe Striped Cell
        }
    }

    // Deadlock-Free transfer using tryLock(timeout)
    private static boolean safeTransferWithTimeout() {
        long timeoutMs = 50;
        try {
            if (lockA.tryLock(timeoutMs, TimeUnit.MILLISECONDS)) {
                try {
                    if (lockB.tryLock(timeoutMs, TimeUnit.MILLISECONDS)) {
                        try {
                            // Both locks acquired safely!
                            System.out.println("Transferring funds between accounts A and B...");
                            return true;
                        } finally {
                            lockB.unlock();
                        }
                    }
                } finally {
                    lockA.unlock();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("Could not acquire both locks within timeout. Safely backing off!");
        return false;
    }
}`,

  jvmFlagsCode: `# Diagnostic flags for Lock Contention & Atomics
# Print biased locking and thread monitor inflation
-XX:+PrintLockBiasedStat
-XX:+TieredCompilation`,

  bytecodeInspection: `// Disassembly of unsafeCount++ showing 3 non-atomic steps:
Code:
   0: getstatic     #7  // Field unsafeCount:I  (Step 1: Read memory into register)
   3: iconst_1
   4: iadd              // Step 2: Increment register
   5: putstatic     #7  // Field unsafeCount:I  (Step 3: Write register to RAM)
                        // If another thread interleaves between 0 and 5 -> DATA LOSS!`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'Why is the statement count++ not thread-safe in Java?',
        vi: 'Tại sao câu lệnh count++ lại không an toàn đa luồng (thread-safe) trong Java?'
      },
      answer: {
        en: 'count++ is a Read-Modify-Write compound operation comprising 3 distinct instructions at the CPU level: 1. Read current value of count from memory into a CPU register. 2. Increment the value inside the register by 1. 3. Write the updated value back from the register into memory. If Thread 1 and Thread 2 execute this simultaneously, both read the same initial value (e.g. 5). Both increment to 6, and both write 6 back. Two increments occurred, but the counter only increased by 1! This is a classic Lost Update race condition.',
        vi: 'count++ là một thao tác ghép Đọc-Sửa-Ghi (Read-Modify-Write) gồm 3 bước lệnh CPU riêng biệt: 1. Đọc giá trị hiện tại của count từ RAM vào thanh ghi CPU. 2. Tăng giá trị trong thanh ghi lên 1. 3. Ghi giá trị mới từ thanh ghi ngược lại RAM. Nếu Luồng 1 và Luồng 2 cùng chạy cùng lúc, cả hai cùng đọc giá trị ban đầu là 5, cùng tăng lên 6 và cùng ghi 6. Hai lần tăng nhưng kết quả chỉ tăng 1! Đây là lỗi mất cập nhật (Lost Update) kinh điển của Race Condition.'
      },
      trapWarning: {
        en: 'Declaring volatile int count does NOT fix count++! volatile guarantees visibility, but does NOT guarantee atomicity of compound read-modify-write operations.',
        vi: 'Khai báo volatile int count KHÔNG THỂ giải quyết được lỗi count++! volatile chỉ bảo đảm tính hiển thị (visibility), hoàn toàn KHÔNG bảo đảm tính nguyên tử cho thao tác 3 bước Đọc-Sửa-Ghi.'
      },
      proTip: {
        en: 'State the immediate fix: Use AtomicInteger.incrementAndGet() or wrap the mutation in a synchronized block / ReentrantLock.',
        vi: 'Nêu ngay giải pháp: Dùng AtomicInteger.incrementAndGet() hoặc bọc phép tính trong khối synchronized / ReentrantLock.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What are the 4 Coffman conditions required for a Deadlock to occur, and how do you prevent them?',
        vi: '4 điều kiện Coffman để xảy ra Deadlock là gì và làm thế nào để ngăn chặn chúng?'
      },
      answer: {
        en: 'Deadlock can ONLY occur if all 4 Coffman conditions are simultaneously met: 1. Mutual Exclusion: Resources cannot be shared (exclusive locks). 2. Hold and Wait: A thread holding a resource waits for another. 3. No Preemption: Resources cannot be forcibly confiscated from a thread. 4. Circular Wait: Thread A waits for Lock B (held by Thread B), while Thread B waits for Lock A. To prevent deadlocks, you only need to break ONE condition: Break Circular Wait by enforcing a Global Lock Ordering (always acquire Lock A before Lock B across the entire codebase), or Break Hold and Wait by using ReentrantLock.tryLock(timeout) so threads back off if they cannot acquire all locks.',
        vi: 'Deadlock CHỈ CÓ THỂ xảy ra khi thỏa mãn đồng thời cả 4 điều kiện Coffman: 1. Khóa tương hỗ (Mutual Exclusion): Tài nguyên không thể dùng chung. 2. Giữ và chờ (Hold and Wait): Luồng đang giữ tài nguyên này lại chờ tài nguyên khác. 3. Không thể trưng dụng (No Preemption): Không thể cướp khóa khi luồng chưa tự nhả. 4. Chờ đợi vòng tròn (Circular Wait): Luồng A giữ khóa 1 chờ khóa 2, Luồng B giữ khóa 2 chờ khóa 1. Để phòng chống, chỉ cần bẻ gãy 1 trong 4 điều kiện: Bẻ gãy Circular Wait bằng Thứ tự khóa toàn cục (luôn khóa theo thứ tự ID tài khoản tăng dần), hoặc Bẻ gãy Hold and Wait bằng ReentrantLock.tryLock(timeout) để luồng tự nhả khóa nếu hết giờ.'
      },
      trapWarning: {
        en: 'Never attempt to resolve deadlocks by setting arbitrary Thread.sleep() delays in hopes that timing overlaps disappear. Race conditions and deadlocks are architectural bugs that must be solved structurally.',
        vi: 'Tuyệt đối không dùng Thread.sleep() lung tung với hy vọng các luồng sẽ không đụng độ nhau. Deadlock là lỗi kiến trúc và bắt buộc phải giải quyết bằng cấu trúc code.'
      },
      proTip: {
        en: 'Explain lock ordering in financial transfers: Always order accounts by ID: fromId < toId ? lock(from) then lock(to) : lock(to) then lock(from). This mathematically guarantees Circular Wait is impossible.',
        vi: 'Dẫn chứng bài toán chuyển tiền ngân hàng: Luôn khóa tài khoản theo thứ tự ID: tài khoản có ID nhỏ hơn khóa trước, ID lớn hơn khóa sau. Quy tắc này triệt tiêu hoàn toàn khả năng xảy ra chờ đợi vòng tròn!'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'How does AtomicInteger work under the hood via Compare-And-Swap (CAS), and when should you upgrade to LongAdder?',
        vi: 'AtomicInteger hoạt động tầng sâu như thế nào qua lệnh CAS, và khi nào bạn nên nâng cấp lên LongAdder?'
      },
      answer: {
        en: 'AtomicInteger stores its value in a volatile int field and delegates mutations to VarHandle/Unsafe.compareAndSetInt(). This maps directly to the CPU instruction LOCK CMPXCHG: the CPU compares the memory location to an expected value; if equal, it updates to the new value atomically in hardware. If another thread beat it, CAS returns false, and AtomicInteger retries in a tight spin loop. However, under EXTREME thread contention (e.g. 64 threads hammering a single counter), CAS retries fail continuously, wasting CPU cycles and inducing bus lock contention. LongAdder solves this using Cell Striping: it distributes the counter across an internal array of padded 64-bit Cell objects. Each thread increments its own cell via thread-hash; calling sum() aggregates all cells. This yields 10x higher write throughput under high contention.',
        vi: 'AtomicInteger lưu giá trị trong biến volatile int và gọi hàm phần cứng qua Unsafe/VarHandle. Lệnh này ánh xạ thẳng tới chỉ lệnh CPU LOCK CMPXCHG: CPU kiểm tra giá trị ô nhớ với giá trị kỳ vọng; nếu khớp, nó cập nhật giá trị mới tức thì bằng phần cứng trong 3ns. Nếu bị luồng khác sửa trước, lệnh trả về false và AtomicInteger lặp lại vòng quay thử lại (spin loop). Tuy nhiên, khi có HÀNG TRĂM luồng cùng ghi vào một biến, vòng lặp CAS liên tục thất bại làm nóng CPU. LongAdder giải quyết việc này bằng cơ chế Phân tán ô nhớ (Cell Striping): chia nhỏ biến đếm thành một mảng các Cell độc lập. Mỗi luồng chỉ ghi vào cell riêng của nó; khi cần lấy tổng thì gọi sum(). Cách này tăng thông lượng ghi gấp 10 lần.'
      },
      trapWarning: {
        en: 'LongAdder.sum() is an eventual snapshot, NOT an atomic instantaneous read. Do not use LongAdder when an exact, atomic read-and-modify is required (e.g., generating unique sequential sequence IDs).',
        vi: 'Hàm LongAdder.sum() chỉ là ảnh chụp gần đúng, KHÔNG PHẢI là thao tác đọc nguyên tử tức thời. Đừng dùng LongAdder nếu cần sinh mã số thứ tự tuần tự không được trùng (phải dùng AtomicLong.incrementAndGet).'
      },
      proTip: {
        en: 'Mention False Sharing: LongAdder Cell classes use @jdk.internal.vm.annotation.Contended to pad cells to 128 bytes, preventing distinct CPU cores from contending over the same 64-byte L1 Cache Line.',
        vi: 'Nhắc đến hiện tượng False Sharing: Các Cell trong LongAdder được đệm 128 byte (qua annotation @Contended) để các nhân CPU khác nhau không bao giờ bị dính chung vào một dòng Cache L1 64-byte.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'What is the ABA Problem in lock-free CAS algorithms, and how do AtomicStampedReference and Java Garbage Collection resolve it?',
        vi: 'Vấn đề ABA (ABA Problem) trong các giải thuật Lock-Free dùng CAS là gì, và AtomicStampedReference cùng bộ thu gom rác GC của Java giải quyết nó ra sao?'
      },
      answer: {
        en: 'The ABA Problem occurs when Thread 1 reads a memory reference pointing to Node A. Thread 1 is preempted. Meanwhile, Thread 2 modifies the reference from A to B, and then back to A (or a new node allocated at the exact same memory address as A). When Thread 1 resumes, it executes CAS(expected=A, new=C). The CAS SUCCEEDS because the memory pointer still equals A! However, the internal invariants or linked-list topology of the data structure have been completely corrupted! (Classic disaster in lock-free Treiber stacks where popping A can link the stack to freed memory). In Java: 1. java.util.concurrent.atomic.AtomicStampedReference<V> pairs the object reference with an integer "stamp" (version counter). Mutations execute compareAndSet(expectedRef, newRef, expectedStamp, newStamp), ensuring that even if the reference returns to A, the stamp has incremented, failing the CAS! 2. How Java GC helps: In languages like C++, memory allocators immediately recycle freed pointer addresses, causing frequent ABA collisions. In Java, as long as Thread 1 holds a reference to Node A, the Garbage Collector guarantees Node A is never deallocated, significantly reducing raw pointer recycling hazards.',
        vi: 'Vấn đề ABA xảy ra khi Luồng 1 đọc được con trỏ ô nhớ trỏ tới Node A. Luồng 1 bị hệ điều hành dừng lại. Trong lúc đó, Luồng 2 sửa đổi con trỏ từ A sang B, rồi lại chuyển ngược từ B về lại A (hoặc cấp phát một nút mới có cùng địa chỉ ô nhớ với A). Khi Luồng 1 chạy tiếp, nó thực hiện CAS(kỳ_vọng=A, mới=C). Lệnh CAS THÀNH CÔNG vì địa chỉ ô nhớ vẫn là A! Tuy nhiên cấu trúc liên kết hoặc bất biến nội tại của dữ liệu đã bị xáo trộn hoàn toàn! (Thảm họa kinh điển trong cấu trúc hàng đợi ngăn xếp Treiber stack khiến trỏ nhầm vào phần tử đã bị gỡ). Trong Java: 1. Lớp java.util.concurrent.atomic.AtomicStampedReference<V> ghép cặp tham chiếu đối tượng với một con số phiên bản "stamp". Mọi thao tác sửa đổi đều kiểm tra compareAndSet(expectedRef, newRef, expectedStamp, newStamp); dù địa chỉ có quay về A nhưng số stamp đã tăng lên thì CAS vẫn thất bại an toàn! 2. Vai trò của Java GC: Trong C++, bộ cấp phát bộ nhớ tái sử dụng ngay địa chỉ vừa giải phóng nên lỗi ABA cực kỳ phổ biến. Trong Java, miễn là Luồng 1 còn giữ tham chiếu tới Node A thì Garbage Collector bảo đảm không bao giờ thu hồi ô nhớ đó, giúp giảm thiểu đáng kể nguy cơ tái sử dụng con trỏ bừa bãi.'
      },
      trapWarning: {
        en: 'Do not confuse AtomicStampedReference with AtomicMarkableReference. AtomicMarkableReference pairs a reference with a single boolean mark (true/false) rather than an integer counter. It is used to logically mark nodes for deletion in Harris lock-free linked lists, but does NOT solve the multi-version ABA problem.',
        vi: 'Đừng nhầm AtomicStampedReference với AtomicMarkableReference. AtomicMarkableReference chỉ ghép tham chiếu với một cờ boolean (true/false). Nó thường dùng để đánh dấu nút đã bị xóa logic trong Harris lock-free list, chứ KHÔNG THỂ giải quyết triệt để bài toán ABA nhiều phiên bản.'
      },
      proTip: {
        en: 'In production systems, avoid manual pointer stamping when possible by using standard JDK concurrent collections (ConcurrentLinkedQueue, ConcurrentSkipListMap) where ABA protection is mathematically verified.',
        vi: 'Trong thực tế dự án, hãy ưu tiên dùng các cấu trúc dữ liệu Concurrent có sẵn của JDK (ConcurrentLinkedQueue, ConcurrentSkipListMap) thay vì tự viết mã lock-free CAS, vì các cấu trúc đó đã được các chuyên gia đầu ngành kiểm chứng toán học.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'Lost Updates & Severe Overselling in Flash-Sale Inventory Systems',
      vi: 'Mất Mát Doanh Thu & Bán Vượt Kho Hàng Ngàn Vé Trong Đợt Mở Bán Flash Sale'
    },
    businessContext: {
      en: 'A major airline ticketing platform launches a holiday flash sale. Over 50,000 customers simultaneously click "Book Now" for the final 100 discounted seats on a popular flight.',
      vi: 'Hệ thống đặt vé máy bay mở bán chiến dịch vé Tết ưu đãi. Hơn 50.000 khách hàng đồng thời nhấn nút "Thanh toán ngay" cho 100 chiếc vé giảm giá cuối cùng của chuyến bay vàng.'
    },
    problemDescription: {
      en: 'The application uses a naive shared counter: remainingSeats-- inside a Spring singleton service. Because remainingSeats-- compiles down to 3 separate bytecode instructions (getfield, iconst_1 + isub, putfield), multiple threads interleave across CPU registers. Threads A, B, and C all read remainingSeats = 100, independently decrement to 99, and write 99 back to Heap memory. Three tickets were purchased and issued to users, but the inventory only decremented by 1! By the end of the sale, the flight had sold 280 tickets for a 100-seat airplane, causing devastating overbooking compensation fines and PR catastrophe.',
      vi: 'Ứng dụng sử dụng biến đếm thông thường: remainingSeats-- trong Spring singleton service. Vì remainingSeats-- ở tầng bytecode gồm 3 lệnh máy tách biệt (đọc từ RAM vào thanh ghi, trừ 1, ghi từ thanh ghi về RAM), hàng loạt luồng CPU xen kẽ nhau. Luồng A, B và C cùng đọc thấy số vé là 100, cùng tính ra 99 và cùng ghi 99 về RAM. Ba khách hàng đã thanh toán và nhận vé, nhưng số lượng vé trong kho chỉ giảm đi 1! Kết thúc đợt mở bán, chuyến bay 100 chỗ nhưng hệ thống đã bán ra tới 280 vé, gây thiệt hại hàng tỷ đồng tiền bồi thường hủy vé và khủng hoảng truyền thông.'
    },
    whyNaiveFails: {
      en: 'Marking the field "volatile int remainingSeats" does NOT fix this issue. volatile only guarantees visibility (preventing stale CPU cache reads); it provides zero atomicity for compound Read-Modify-Write operations.',
      vi: 'Khai báo "volatile int remainingSeats" hoàn toàn KHÔNG giải quyết được vấn đề. volatile chỉ đảm bảo tính hiển thị (đọc trực tiếp từ RAM, không cache ở thanh ghi), nhưng hoàn toàn không có tính nguyên tử cho thao tác 3 bước Đọc-Sửa-Ghi.'
    },
    coreSolution: {
      en: '1. Lock-Free Hardware Atomic Variables: Replace primitive ints with AtomicInteger.decrementAndGet(). Under the hood, this generates the x86 instruction LOCK CMPXCHG, executing the 3-step decrement atomically directly on the CPU hardware bus in ~3 nanoseconds.\n2. Bounded Spin-Loop Verification: Decrement and check remaining >= 0 atomically; if remaining drops below zero, roll back via incrementAndGet() and return false instantly.\n3. High-Contention Striping: For non-ticket global metrics where exact order is not required, use LongAdder to eliminate bus contention via Cell striping across CPU cores.',
      vi: '1. Biến Nguyên Tử Phi Khóa Cấp Phần Cứng: Thay thế biến nguyên thủy bằng AtomicInteger.decrementAndGet(). Ở tầng mã máy, JVM phát ra lệnh x86 LOCK CMPXCHG, thực thi 3 bước trừ số lượng nguyên tử trực tiếp trên bus phần cứng CPU chỉ trong ~3 nanosecond.\n2. Vòng Lặp CAS Kiểm Tra Biên: Trừ số lượng và kiểm tra kết quả >= 0 một cách nguyên tử; nếu số lượng rớt xuống dưới 0, tự động hoàn trả qua incrementAndGet() và báo hết vé ngay lập tức.\n3. Phân Tán Ô Nhớ LongAdder: Với các bộ đếm đo lường tổng thể lượt click, nâng cấp lên LongAdder để phân tán ghi vào các Cell độc lập, tránh nghẽn bus CPU.'
    },
    productionCode: `// Spring Boot 3.x Production Flash Sale Ticket Allocation Service
@Service
public class FlashSaleTicketService {

    private final AtomicInteger remainingSeats = new AtomicInteger(100);

    public boolean reserveSeat(String customerId) {
        // Atomic compare-and-swap loop prevents any overselling!
        while (true) {
            int current = remainingSeats.get();
            if (current <= 0) {
                return false; // Flash sale sold out cleanly!
            }
            // Hardware LOCK CMPXCHG instruction guarantees atomic state transition
            if (remainingSeats.compareAndSet(current, current - 1)) {
                recordSuccessfulBooking(customerId, current);
                return true;
            }
            // If another thread modified 'current' in the meantime, loop retries instantly without OS thread sleep
        }
    }

    private void recordSuccessfulBooking(String customerId, int seatNumber) {
        System.out.println("Seat #" + seatNumber + " successfully issued to " + customerId);
    }
}`,
    architectureImpact: {
      en: '100% elimination of overselling and race condition data loss. Throughput reached 140,000 reservation checks/sec on a single 16-core server. P99 latency dropped from 35ms (with heavy synchronization) down to 1.8ms.',
      vi: 'Triệt tiêu 100% hiện tượng bán vượt vé và mất mát dữ liệu do race condition. Thông lượng đạt 140.000 lượt kiểm tra đặt chỗ/giây trên một máy chủ 16-core duy nhất. Độ trễ P99 giảm từ 35ms (khi dùng synchronized) xuống chỉ còn 1.8ms.'
    }
  }
};
