import type { JavaCoreTopic } from '../types';

export const synchronizedMonitor: JavaCoreTopic = {
  id: 'synchronized-monitor',
  category: 'concurrency-juc',
  name: 'Synchronized & HotSpot Monitor Lock Inflation',
  tagline: {
    en: 'Thread synchronization physics: Biased locking, Lightweight CAS stack records, and Heavyweight OS ObjectMonitor inflation.',
    vi: 'Bản chất vật lý của đồng bộ luồng: Khóa thiên vị (Biased), Khóa nhẹ CAS trên Stack, và nâng cấp thành Khóa nặng ObjectMonitor của OS.'
  },
  difficulty: 3,
  level: 'advanced',
  order: 13,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Acquiring an operating system kernel mutex (pthread_mutex) requires a user-to-kernel mode context switch taking ~1,000 to 2,000 nanoseconds. If every Java synchronized block executed a kernel syscall, single-threaded or uncontended applications would suffer catastrophic 100x performance penalties.',
      vi: 'Việc xin một khóa Mutex từ nhân hệ điều hành (pthread_mutex) đòi hỏi chuyển đổi ngữ cảnh từ user-space sang kernel-space tốn ~1.000 đến 2.000 nanosecond. Nếu mỗi khối synchronized trong Java đều gọi syscall nhân hệ điều hành, ngay cả các ứng dụng đơn luồng hoặc không có tranh chấp cũng sẽ bị suy giảm hiệu năng tới 100 lần.'
    },
    hardwareConstraint: {
      en: 'Modern multi-core CPUs support atomic hardware instructions like CMPXCHG (Compare-And-Swap) in ~5-15 nanoseconds within user-space. HotSpot leverages this to synchronize threads in user space via lightweight lock records, escalating to kernel mutexes only when genuine multi-threaded contention is detected.',
      vi: 'CPU đa nhân hiện đại hỗ trợ lệnh nguyên tử cấp phần cứng CMPXCHG (Compare-And-Swap) chỉ tốn ~5-15 nanosecond ngay trong user-space. HotSpot tận dụng điều này để đồng bộ hóa luồng hoàn toàn ở tầng người dùng qua các bản ghi khóa nhẹ, chỉ nâng cấp lên khóa nhân OS khi thực sự có tranh chấp đồng thời.'
    },
    fundamentalSolution: {
      en: 'HotSpot implements a 3-tier Lock Inflation state machine encoded in the lowest 2 bits of the object Mark Word: Unlocked (01) -> Lightweight Thin Lock (00) via CAS on the thread stack frame -> Heavyweight Inflated Monitor (10) allocating a C++ ObjectMonitor with native OS futex parking queues (_EntryList, _WaitSet).',
      vi: 'HotSpot triển khai máy trạng thái Nâng cấp Khóa (Lock Inflation) 3 cấp độ được mã hóa trong 2 bit cuối của Mark Word: Không khóa (01) -> Khóa nhẹ Thin Lock (00) bằng lệnh CAS trên stack frame của luồng -> Khóa nặng Inflated Monitor (10) cấp phát cấu trúc ObjectMonitor C++ với hàng đợi ngủ nhân OS (_EntryList, _WaitSet).'
    },
    math: {
      formula: 'Uncontended CAS Overhead ≈ 10ns,   Kernel Mutex Inflation Overhead ≈ 1,500ns (150x slower)',
      description: {
        en: 'Adaptive spinning executes up to N tight CAS loops before calling OS parking, avoiding expensive context switches for short-lived critical sections.',
        vi: 'Cơ chế tự thích ứng xoay vòng (Adaptive Spinning) lặp lại tối đa N vòng CAS trước khi gọi OS park, giúp tránh context switch đắt đỏ cho các đoạn code ngắn.'
      },
      timeComplexity: 'O(1) CAS user-space acquisition when uncontended; O(1) OS futex park under contention',
      spaceComplexity: 'Zero heap overhead for thin lock (Stack LockRecord); 64 bytes C++ ObjectMonitor on inflation',
      memoryOverheadFormula: 'Heavy Monitor Cost = C++ ObjectMonitor Allocation + OS Thread Parking'
    }
  },

  detailedTheory: {
    overview: {
      en: 'The synchronized keyword is Java’s fundamental concurrency primitive. Implemented at the bytecode level via monitorenter and monitorexit instructions, synchronized relies on the HotSpot lock inflation mechanism to guarantee mutual exclusion and JMM memory visibility without incurring operating system context switch costs when locks are uncontended.',
      vi: 'Từ khóa synchronized là nền tảng sơ khai nhất của xử lý đồng thời trong Java. Được thực thi ở tầng bytecode qua hai lệnh monitorenter và monitorexit, synchronized dựa trên cơ chế Nâng cấp Khóa (Lock Inflation) của HotSpot để bảo đảm tính loại trừ tương hỗ (Mutual Exclusion) và tính hiển thị bộ nhớ JMM mà không phải trả giá bằng context switch của hệ điều hành khi không có tranh chấp.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Lightweight Locking & Stack Lock Records: When a thread enters a synchronized block on an unlocked object (Mark Word ends in 01), the JVM allocates a BasicObjectLock record inside the current thread’s stack frame. It copies the object’s Mark Word (Displaced Mark Word) into this stack record, and uses a CPU atomic CMPXCHG instruction to swap the object’s Mark Word with a pointer to the stack record. If successful, the lowest bits become 00 (Lightweight Locked) in ~10ns.',
        vi: '1. Khóa Nhẹ (Lightweight Lock) & Bản Ghi Khóa trên Stack: Khi một luồng bước vào khối synchronized trên một đối tượng chưa khóa (Mark Word kết thúc bằng 01), JVM tạo một bản ghi BasicObjectLock trong stack frame của luồng đó. JVM copy Mark Word của đối tượng vào bản ghi này, rồi dùng lệnh nguyên tử CMPXCHG của CPU để hoán đổi Mark Word thành con trỏ trỏ tới stack frame. Nếu thành công, 2 bit cuối chuyển thành 00 (Khóa nhẹ) chỉ trong ~10ns.'
      },
      {
        en: '2. Lock Inflation to Heavyweight ObjectMonitor: If a second thread attempts to acquire the lock while Thread 1 still holds it, the CAS fails. The second thread detects contention and inflates the lock. The JVM allocates a native C++ ObjectMonitor structure in non-heap memory, stores the owner thread pointer, and updates the object’s Mark Word to point to the ObjectMonitor with lock state 10 (Heavyweight). The competing thread is added to the _EntryList and suspended via OS pthread_mutex or futex.',
        vi: '2. Nâng cấp thành Khóa Nặng (ObjectMonitor): Nếu luồng thứ hai nhảy vào tranh chấp khi luồng 1 vẫn đang giữ khóa, lệnh CAS sẽ thất bại. Luồng 2 phát hiện tranh chấp và tiến hành nâng cấp khóa (Lock Inflation). JVM cấp phát một cấu trúc C++ ObjectMonitor ở bộ nhớ ngoài Heap, gán con trỏ luồng sở hữu, và cập nhật Mark Word của đối tượng trỏ tới ObjectMonitor này với mã trạng thái 10 (Khóa nặng). Luồng tranh chấp bị đưa vào hàng đợi _EntryList và đưa vào giấc ngủ bằng futex của OS.'
      },
      {
        en: '3. Anatomy of the C++ ObjectMonitor: Inside the HotSpot JVM source code (objectMonitor.hpp), the monitor contains: _owner (pointer to thread currently holding the monitor), _count (recursion counter for reentrant synchronization), _WaitSet (doubly-linked list of threads that called Object.wait()), and _cxq / _EntryList (linked lists of threads waiting to acquire the lock upon monitorexit).',
        vi: '3. Cấu trúc Nội tại của ObjectMonitor C++: Trong mã nguồn HotSpot C++ (objectMonitor.hpp), cấu trúc monitor gồm các trường: _owner (con trỏ luồng đang nắm giữ monitor), _count (bộ đếm đệ quy phục vụ tính tái nhập Reentrancy), _WaitSet (danh sách liên kết kép các luồng đã gọi Object.wait()), và _cxq / _EntryList (hàng đợi các luồng đang chờ xin khóa khi luồng chính thoát monitorexit).'
      },
      {
        en: '4. Adaptive Spinning (Tự Thích Ứng Xoay Vòng): Suspending and waking up a kernel thread incurs a 5-10 microsecond latency penalty. Before putting a competing thread to sleep in _EntryList, HotSpot executes Adaptive Spinning: the thread loops executing NOP or pause instructions, repeatedly checking if the owner thread has released the lock. If the lock was recently acquired quickly, spinning duration is increased; if spinning historically fails, spinning is bypassed immediately.',
        vi: '4. Xoay vòng Tự thích ứng (Adaptive Spinning): Đình chỉ và đánh thức một luồng OS tốn từ 5 đến 10 micro giây. Trước khi bắt luồng ngủ trong _EntryList, HotSpot thực thi cơ chế Adaptive Spinning: luồng chạy vòng lặp lệnh pause để thăm dò xem luồng sở hữu đã nhả khóa chưa. Nếu các luồng trước đó nhả khóa rất nhanh, thời gian xoay vòng sẽ được tăng lên; nếu lịch sử cho thấy khóa bị giữ lâu, luồng sẽ bỏ qua xoay vòng và đi ngủ ngay lập tức.'
      },
      {
        en: '5. Lock Elision & Lock Coarsening by C2 JIT: The HotSpot C2 JIT compiler performs advanced lock optimizations. Lock Elision uses Escape Analysis: if an object never escapes a local method (e.g. StringBuffer inside a method), the JIT compiler eliminates monitorenter/exit bytecode instructions entirely! Lock Coarsening merges adjacent synchronized blocks operating on the same monitor into a single block to reduce repeated lock acquisition overhead.',
        vi: '5. Xóa bỏ Khóa (Lock Elision) & Gộp Khóa (Lock Coarsening) của JIT: Trình biên dịch C2 JIT thực hiện các tối ưu hóa khóa siêu việt. Xóa bỏ Khóa (Lock Elision) dùng Phân tích Thoát ly: nếu đối tượng không thoát ra ngoài hàm (như StringBuffer cục bộ), JIT sẽ xóa sổ hoàn toàn bytecode monitorenter/exit! Gộp Khóa (Lock Coarsening) gom nhiều khối synchronized liền kề trên cùng 1 đối tượng thành 1 khối duy nhất để giảm tần suất xin khóa lặp đi lặp lại.'
      },
      {
        en: '6. The Deprecation of Biased Locking in Modern Java: Java 6 introduced Biased Locking to optimize single-threaded lock acquisitions by writing the thread ID directly into the Mark Word. However, in modern multi-threaded architectures, revoking a biased lock requires triggering a costly Stop-The-World (STW) safepoint across all threads. Due to these safepoint pauses, Biased Locking was disabled by default in Java 15 (JEP 374) and completely eliminated in recent releases.',
        vi: '6. Khai tử Khóa Thiên vị (Biased Locking) trên Java Hiện đại: Java 6 từng giới thiệu Biased Locking nhằm tối ưu cho luồng đơn bằng cách ghi thẳng Thread ID vào Mark Word. Tuy nhiên, trên kiến trúc đa luồng hiện đại, việc hủy khóa thiên vị (Revocation) đòi hỏi phải dừng toàn bộ hệ thống bằng Safepoint (Stop-The-World) rất đắt đỏ. Vì lý do này, Biased Locking đã bị tắt mặc định từ Java 15 (JEP 374) và loại bỏ hoàn toàn trên các bản Java mới.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Synchronizing on String Literals or Boxed Primitives: Writing synchronized ("LOCK_KEY") or synchronized (Integer.valueOf(userId)) causes catastrophic application-wide deadlocks! Because String literals are pooled in the JVM String Intern Pool and small Integers (-128 to 127) are cached, unrelated services synchronizing on the same value collide on the identical shared object instance.',
        vi: 'Đồng bộ hóa trên String Literal hoặc Boxed Primitive: Viết code synchronized ("LOCK_KEY") hoặc synchronized (Integer.valueOf(userId)) là thảm họa gây deadlock toàn bộ hệ thống! Do String literal được lưu chung trong String Intern Pool và số nguyên nhỏ (-128 đến 127) được cache, hai service hoàn toàn độc lập cùng khóa trên một giá trị sẽ đâm sầm vào cùng 1 đối tượng duy nhất trong RAM.'
      },
      {
        en: 'Carrier Thread Pinning with Java 21 Virtual Threads: Executing a synchronized block that performs blocking I/O (e.g. database query, HTTP call) inside a Java 21 Virtual Thread causes CARRIER THREAD PINNING! The underlying OS carrier thread cannot be unmounted, disabling the scalability of Project Loom. Mitigation: Replace synchronized with java.util.concurrent.locks.ReentrantLock.',
        vi: 'Hiện tượng Ghim Luồng (Pinning) trên Virtual Threads Java 21: Thực thi khối synchronized chứa tác vụ I/O chặn (như truy vấn database, gọi HTTP REST) bên trong một Virtual Thread sẽ gây ra hiện tượng Ghim Luồng Nền (Carrier Thread Pinning)! Luồng OS thực tế bên dưới không thể nhả ra cho việc khác, vô hiệu hóa hoàn toàn sức mạnh của Project Loom. Giải pháp: Thay thế synchronized bằng ReentrantLock.'
      },
      {
        en: 'Deadlock via Lock Ordering Violation: Acquiring multiple synchronized locks in inconsistent order across threads (Thread A locks Obj1 then Obj2; Thread B locks Obj2 then Obj1) causes an unrecoverable circular wait deadlock. Always enforce a strict global lock acquisition ordering or use ReentrantLock.tryLock() with timeouts.',
        vi: 'Deadlock do Vi phạm Thứ tự Khóa: Việc chiếm giữ nhiều khóa synchronized không nhất quán giữa các luồng (Luồng A khóa Obj1 rồi Obj2; Luồng B khóa Obj2 rồi Obj1) gây ra vòng tròn chờ đợi bế tắc (Deadlock) vĩnh viễn. Luôn tuân thủ quy tắc thứ tự khóa toàn cục hoặc dùng ReentrantLock.tryLock() có timeout.'
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'HotSpot Mark Word Lock State Transitions & ObjectMonitor Structure',
      vi: 'Chuyển đổi Trạng thái Khóa của Mark Word & Cấu trúc C++ ObjectMonitor'
    },
    description: {
      en: 'The 64-bit Mark Word dynamically transitions between 4 discrete states based on concurrency levels, pointing to thread stacks or C++ native heap monitors.',
      vi: 'Mark Word 64-bit chuyển đổi linh hoạt giữa 4 trạng thái dựa trên mức độ tranh chấp, trỏ tới stack frame của luồng hoặc cấu trúc ObjectMonitor C++.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| 64-BIT MARK WORD ENCODING STATES (HotSpot JVM):                                                    |
+--------------------------------------------------------------------+---------------+---------------+
| STATE                       | BITS 63 TO 2                         | BIASED BIT    | LOCK BITS 1-0 |
+--------------------------------------------------------------------+---------------+---------------+
| 1. Normal (Unlocked):       | Identity HashCode (31b) | Age (4b)   | 0             | 0 1           |
| 2. Lightweight (Thin Lock): | Pointer to BasicObjectLock on Stack  | [None]        | 0 0           |
| 3. Heavyweight (Inflated):  | Pointer to C++ native ObjectMonitor  | [None]        | 1 0           |
| 4. Marked for GC:           | GC Collector Metadata Header         | [None]        | 1 1           |
+--------------------------------------------------------------------+---------------+---------------+
| C++ OBJECTMONITOR STRUCTURE IN NATIVE MEMORY:                                                      |
|   [ _header: Displaced Mark Word (8B) ]                                                            |
|   [ _owner:  Thread* (Pointer to OS Thread currently holding monitor) ]                            |
|   [ _count:  int (Reentrant depth counter) ]                                                       |
|   [ _WaitSet:  ObjectWaiter* (Doubly-linked list for Object.wait() threads) ]                      |
|   [ _EntryList: ObjectWaiter* (Queue of blocked threads waiting for lock release) ]                |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'lock_state_bits', size: '2 Bits (0-1)', description: { en: '01=Unlocked, 00=Lightweight Thin CAS, 10=Heavyweight Inflated Monitor, 11=Marked for GC.', vi: '01=Không khóa, 00=Khóa nhẹ CAS, 10=Khóa nặng Monitor OS, 11=Đánh dấu dọn rác.' } },
      { name: 'displaced_mark_word', size: '64 Bits (8B)', description: { en: 'Copy of original unlocked Mark Word stored in thread stack record during lightweight lock.', vi: 'Bản sao Mark Word ban đầu lưu trên stack frame khi đối tượng đang ở trạng thái khóa nhẹ.' } },
      { name: 'object_monitor_owner', size: '64-bit Ptr (8B)', description: { en: 'Pointer to active thread holding exclusive ownership of the inflated ObjectMonitor.', vi: 'Con trỏ tham chiếu tới luồng đang nắm giữ quyền sở hữu độc quyền của ObjectMonitor.' } },
      { name: 'reentrant_count', size: '32-bit Int (4B)', description: { en: 'Tracks recursive lock acquisitions; decremented on each monitorexit until reaching 0.', vi: 'Theo dõi số lần khóa đệ quy; giảm dần mỗi khi thoát khối synchronized cho tới khi về 0.' } }
    ]
  },

  steps: [
    {
      id: 'thin-cas',
      title: { en: '1. Uncontended CAS Lightweight Lock Acquisition', vi: '1. Khóa nhẹ CAS trên Stack Frame khi không tranh chấp' },
      phase: 'LIGHTWEIGHT_CAS',
      description: {
        en: 'The thread allocates a BasicObjectLock on its stack frame, copies the object Mark Word into it, and executes a CPU CMPXCHG instruction. The Mark Word updates to point to the stack record with lock bits 00 in ~10ns.',
        vi: 'Luồng cấp phát BasicObjectLock trên stack frame, copy Mark Word của đối tượng vào, và thực thi lệnh CPU CMPXCHG. Mark Word chuyển sang trỏ tới stack với 2 bit cuối là 00 chỉ trong ~10ns.'
      },
      jvmRuntimeBehavior: {
        en: 'Zero OS kernel involvement. High-speed user-space atomic CAS.',
        vi: 'Hoàn toàn không gọi nhân OS. Lệnh CAS nguyên tử diễn ra siêu tốc trong user-space.'
      },
      javaCodeLineMatch: 'synchronized (lock) { /* critical section */ }'
    },
    {
      id: 'spin-contend',
      title: { en: '2. Contention Detected & Adaptive Spinning', vi: '2. Phát hiện Tranh chấp & Xoay vòng Tự thích ứng (Spinning)' },
      phase: 'ADAPTIVE_SPINNING',
      description: {
        en: 'A second thread attempts CAS and fails because the lock is held. Instead of immediately blocking, the second thread executes adaptive spinning: looping pause instructions in user-space to see if Thread 1 releases the lock promptly.',
        vi: 'Luồng thứ hai thử CAS nhưng thất bại vì khóa đang bị giữ. Thay vì đi ngủ ngay, luồng 2 thực thi cơ chế xoay vòng tự thích ứng: lặp lại lệnh pause trong user-space để chờ luồng 1 nhả khóa.'
      },
      jvmRuntimeBehavior: {
        en: 'Tight CPU loop using pause instruction; avoids kernel context switch if lock held briefly.',
        vi: 'Vòng lặp CPU chặt chẽ dùng lệnh pause; tránh context switch nếu đoạn critical section chạy nhanh.'
      },
      javaCodeLineMatch: '// Thread 2 spinning in user space waiting for lock release'
    },
    {
      id: 'inflate-monitor',
      title: { en: '3. Lock Inflation to Heavyweight ObjectMonitor', vi: '3. Nâng cấp thành Khóa Nặng ObjectMonitor của OS' },
      phase: 'HEAVYWEIGHT_INFLATION',
      description: {
        en: 'When spinning threshold expires, the JVM inflates the lock. An ObjectMonitor is allocated in C++ native memory. The Mark Word is updated to point to the ObjectMonitor with bits 10. Thread 2 is enqueued into _EntryList and suspended via OS pthread_mutex.',
        vi: 'Khi hết số vòng xoay, JVM nâng cấp khóa. Một ObjectMonitor được cấp phát trong RAM native C++. Mark Word chuyển sang trỏ tới ObjectMonitor với 2 bit cuối là 10. Luồng 2 được đưa vào hàng đợi _EntryList và đi ngủ bằng futex OS.'
      },
      jvmRuntimeBehavior: {
        en: 'Kernel mode context switch (~1,500ns). Thread state transitions to BLOCKED.',
        vi: 'Chuyển đổi ngữ cảnh sang nhân OS (~1.500ns). Trạng thái luồng chuyển thành BLOCKED.'
      },
      javaCodeLineMatch: 'monitor.wait(); // Thread suspended on native OS futex'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Oracle HotSpot JVM',
      implementationName: 'ObjectMonitor with Adaptive Spinning & Lock Elision',
      keyMechanism: {
        en: 'Uses stack-based BasicObjectLock for lightweight locks and C++ ObjectMonitor for heavyweight locks. C2 JIT compiler eliminates uncontended locks via Escape Analysis.',
        vi: 'Dùng BasicObjectLock trên stack cho khóa nhẹ và ObjectMonitor C++ cho khóa nặng. C2 JIT tự động xóa bỏ khóa không thoát ra ngoài bằng Escape Analysis.'
      },
      defaultFlags: '-XX:+UseBiasedLocking (deprecated in Java 15+) -XX:BiasedLockingStartupDelay=0',
      architectureNote: {
        en: 'Biased locking was eliminated in Java 15+ because revocation safepoints degraded performance on modern multi-socket server architectures.',
        vi: 'Biased locking bị khai tử từ Java 15+ vì các đợt dừng safepoint để thu hồi khóa gây sụt giảm hiệu năng trên máy chủ nhiều CPU.'
      }
    },
    {
      jvmEngine: 'GraalVM Native Image',
      implementationName: 'SubstrateVM Thin Lock & Monitor Cache',
      keyMechanism: {
        en: 'Pre-compiles synchronization primitives into ahead-of-time (AOT) machine code. Employs a striped Monitor Cache for heavyweight locks, minimizing memory overhead.',
        vi: 'Biên dịch trước (AOT) các cơ chế đồng bộ thành mã máy. Dùng bộ đệm Monitor Cache phân dải cho khóa nặng, tiết kiệm tối đa RAM.'
      },
      defaultFlags: '-H:+UnlockExperimentalVMOptions -H:+MultiThreaded',
      architectureNote: {
        en: 'Sub-millisecond startup times with instantaneous lock acquisition in containerized microservices.',
        vi: 'Khởi động dưới 1 mili giây với tốc độ chiếm khóa tức thì trong môi trường container.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Nanosecond user-space performance for uncontended or short-lived critical sections.', vi: 'Hiệu năng tính bằng nano giây ngay trong user-space khi không có tranh chấp khóa.' },
      { en: 'Built-in JMM memory visibility guarantee: all variables flushed to cache coherence boundaries upon exit.', vi: 'Bảo đảm tính hiển thị bộ nhớ JMM: mọi biến số được đồng bộ hóa qua ranh giới cache CPU khi thoát khối.' }
    ],
    cons: [
      { en: 'Severe Carrier Thread Pinning when combined with Java 21 Virtual Threads and blocking I/O.', vi: 'Gây lỗi ghim luồng (Pinning) nghiêm trọng khi dùng chung với Virtual Threads Java 21 chứa tác vụ I/O chặn.' },
      { en: 'Lack of tryLock() timeout capabilities or fair lock queuing (unlike java.util.concurrent ReentrantLock).', vi: 'Không có khả năng tryLock() với timeout hoặc xếp hàng công bằng (như ReentrantLock trong JUC).' }
    ],
    memoryFootprint: {
      en: 'Zero heap memory overhead for lightweight locks; 64 bytes native C++ memory for inflated ObjectMonitor.',
      vi: 'Không tốn RAM heap cho khóa nhẹ; tốn 64 byte bộ nhớ native C++ cho mỗi ObjectMonitor được nâng cấp.'
    },
    jvmSpecificationGuarantee: {
      en: 'Monitorenter / Monitorexit guarantees mutual exclusion and strictly structured scope release even upon exceptions.',
      vi: 'Monitorenter / Monitorexit bảo đảm tính loại trừ tương hỗ và luôn giải phóng khóa an toàn kể cả khi có Exception.'
    }
  },

  javaCode: `package com.enterprise.jvm.concurrency;

import java.util.concurrent.CountDownLatch;

/**
 * Pure Java 21 Educational Simulation of Lock Inflation & Contention
 * Demonstrates:
 *  1. Uncontended Lightweight Lock (Thin CAS)
 *  2. Multi-threaded Contention triggering Heavyweight ObjectMonitor Inflation
 *  3. Difference between intrinsic synchronized locks and JUC ReentrantLock
 */
public class SynchronizedMonitorDemo {

    private static final Object INTRINSIC_LOCK = new Object();
    private static long sharedCounter = 0;

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== HOTSPOT SYNCHRONIZED LOCK INFLATION DEMO ===");

        // Phase 1: Uncontended Lightweight Lock (Thin Lock)
        // Only main thread acquires lock -> Executed entirely in user-space via CAS!
        for (int i = 0; i < 5; i++) {
            incrementUnderLock();
        }
        System.out.println("Phase 1 Complete: Counter = " + sharedCounter + " (Uncontended Thin Lock)");

        // Phase 2: Concurrent Multi-Threaded Contention
        // Spawns 4 threads colliding on INTRINSIC_LOCK -> Triggers Heavyweight Monitor Inflation!
        int numThreads = 4;
        CountDownLatch latch = new CountDownLatch(numThreads);

        for (int t = 0; t < numThreads; t++) {
            Thread.ofPlatform().name("worker-" + t).start(() -> {
                for (int i = 0; i < 20_000; i++) {
                    incrementUnderLock();
                }
                latch.countDown();
            });
        }

        latch.await();
        System.out.println("Phase 2 Complete: Final Counter = " + sharedCounter + " (Inflated ObjectMonitor)");
    }

    private static void incrementUnderLock() {
        // Bytecode generates:
        //  0: getstatic     #INTRINSIC_LOCK
        //  3: dup
        //  4: astore_0
        //  5: monitorenter   // CAS Thin lock -> Inflates to ObjectMonitor under contention
        //  6: ...
        // 14: monitorexit
        synchronized (INTRINSIC_LOCK) {
            sharedCounter++;
        }
    }
}`,

  jvmFlagsCode: `# ===================================================================
# HotSpot Flags to Inspect Lock Inflation and Safepoint Diagnostics
# ===================================================================
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintSafepointStatistics
-XX:PrintSafepointStatisticsCount=1
-XX:+LogVMOutput
-XX:LogFile=hotspot_lock_inflation.log

# Command line tool to inspect locks on live running JVM:
jcmd <PID> Thread.print -l

# JStack output showing thread waiting on Inflated Monitor:
# "worker-1" #24 prio=5 os_prio=0 cpu=12.5ms tid=0x00007f... nid=0x1a03 waiting for monitor entry
#    java.lang.Thread.State: BLOCKED (on object monitor)
#    at com.enterprise.jvm.concurrency.SynchronizedMonitorDemo.incrementUnderLock(SynchronizedMonitorDemo.java:42)
#    - waiting to lock <0x0000000712345678> (a java.lang.Object)`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c com.enterprise.jvm.concurrency.SynchronizedMonitorDemo
private static void incrementUnderLock();
  Code:
   0: getstatic     #7     // Field INTRINSIC_LOCK:Ljava/lang/Object;
   3: dup
   4: astore_0
   5: monitorenter         // Enters monitor (Thin Lock CAS or Heavyweight wait)
   6: getstatic     #13    // Field sharedCounter:J
   9: lconst_1
  10: ladd
  11: putstatic     #13    // Field sharedCounter:J
  14: aload_0
  15: monitorexit          // Releases monitor
  16: goto          24
  19: astore_1             // Exception handler block: ensures lock is ALWAYS released!
  20: aload_0
  21: monitorexit
  22: aload_1
  23: athrow
  24: return
  Exception table:
     from    to  target type
         6    16    19   any
        19    22    19   any`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'How does the synchronized keyword guarantee both Mutual Exclusion and Memory Visibility?',
        vi: 'Từ khóa synchronized bảo đảm cả tính Khóa tương hỗ (Mutual Exclusion) và Tính nhìn thấy (Visibility) như thế nào?'
      },
      answer: {
        en: '1. Mutual Exclusion: At bytecode level, synchronized emits monitorenter and monitorexit instructions. Only one thread can acquire the object monitor lock at a time; all other contending threads are blocked. 2. Memory Visibility: Under the Java Memory Model (JMM), exiting a synchronized block flushes all modified local CPU cache variables back to main RAM (Store Barrier). Entering a synchronized block invalidates local CPU caches, forcing all subsequent reads to fetch fresh values directly from RAM (Load Barrier).',
        vi: '1. Khóa tương hỗ (Mutual Exclusion): Ở tầng bytecode, synchronized phát sinh cặp lệnh monitorenter và monitorexit. Chỉ duy nhất một luồng có thể chiếm giữ monitor lock của đối tượng; các luồng khác đều bị chặn. 2. Tính nhìn thấy (Memory Visibility): Theo mô hình bộ nhớ JMM, khi thoát khỏi khối synchronized, CPU bắt buộc phải đẩy toàn bộ dữ liệu trong cache về RAM chính (Store Barrier). Khi bước vào khối synchronized, CPU bắt buộc phải xóa cache cục bộ và nạp dữ liệu mới nhất từ RAM (Load Barrier).'
      },
      trapWarning: {
        en: 'Synchronizing on a primitive wrapper like synchronized(Integer.valueOf(1)) is a major bug: because of caching, multiple unrelated threads will lock on the exact same instance across the entire application!',
        vi: 'Khóa trên biến đối tượng Wrapper như synchronized(Integer.valueOf(1)) là lỗi cực nặng: do cơ chế cache, các luồng hoàn toàn không liên quan trong toàn hệ thống sẽ bị khóa chung vào một đối tượng!'
      },
      proTip: {
        en: 'Always lock on a dedicated private final Object lock = new Object(); This prevents external callers from inadvertently acquiring your lock and causing deadlocks.',
        vi: 'Luôn tạo một đối tượng khóa riêng biệt: private final Object lock = new Object(); Cách này ngăn chặn bên ngoài can thiệp hoặc khóa nhầm vào monitor nội bộ của bạn.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'Explain HotSpot Lock Inflation: from Biased Locking to Lightweight CAS, to Heavyweight ObjectMonitor.',
        vi: 'Giải thích cơ chế thăng cấp khóa (Lock Inflation) của HotSpot: từ Biased Lock đến Khóa nhẹ CAS, và Khóa nặng ObjectMonitor.'
      },
      answer: {
        en: 'HotSpot optimizes locks across 3 tiers via the 2-bit tag in the 64-bit Mark Word: 1. Biased Locking (01): Optimized for single-threaded usage; writes thread ID into Mark Word with zero CAS instructions. (Deprecated in Java 15). 2. Lightweight Locking (00): When a second thread acquires the uncontended lock, it performs an atomic CAS to swap the Mark Word into a Displaced Mark Word on its Thread Stack. Zero OS kernel syscalls! 3. Heavyweight Locking (10): Under thread contention, threads spin in user-space (Adaptive Spinning). If the lock is not freed, it inflates to a full OS Futex/Mutex ObjectMonitor: contending threads are put to sleep by the kernel scheduler.',
        vi: 'HotSpot tối ưu hóa khóa qua 3 cấp độ dựa trên 2 bit cuối trong Mark Word 64-bit: 1. Khóa thiên vị Biased Lock (01): Tối ưu khi chỉ có 1 luồng duy nhất truy cập; ghi thẳng Thread ID vào Mark Word không tốn 1 lệnh CAS nào. (Đã deprecated từ Java 15). 2. Khóa nhẹ Lightweight Lock (00): Khi có luồng thứ hai vào lúc không có tranh chấp, luồng thực hiện CAS đẩy Mark Word vào stack frame của chính nó. Hoàn toàn không tốn syscall của hệ điều hành! 3. Khóa nặng Heavyweight Lock (10): Khi xảy ra tranh chấp gay gắt, luồng tự quay vòng (Adaptive Spinning) ở user-space. Nếu vẫn không lấy được khóa, nó thăng cấp thành ObjectMonitor của OS: các luồng chờ bị nhân OS đưa vào giấc ngủ (sleep).'
      },
      trapWarning: {
        en: 'Lock inflation is unidirectional: once a lock inflates to a Heavyweight ObjectMonitor, it typically does NOT deflate back to lightweight lock during normal application execution.',
        vi: 'Quá trình thăng cấp khóa là một chiều: một khi khóa đã bị đẩy lên Khóa nặng Heavyweight, nó hầu như KHÔNG BAO GIỜ tự hạ cấp ngược về khóa nhẹ trong suốt vòng đời ứng dụng.'
      },
      proTip: {
        en: 'Adaptive Spinning dynamically tunes spin duration based on whether the previous thread holding the lock released it quickly. If spinning succeeds, it avoids expensive OS kernel context switches (~2us).',
        vi: 'Adaptive Spinning tự động điều chỉnh số vòng quay chờ đợi dựa trên lịch sử nhả khóa trước đó. Nếu thành công, nó tiết kiệm được một lần context switch tốn kém của OS (~2us).'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'What happens to the Identity HashCode when an object undergoes lock inflation in the 64-bit Mark Word?',
        vi: 'Điều gì xảy ra với Identity HashCode khi đối tượng bị thăng cấp khóa trong 64-bit Mark Word?'
      },
      answer: {
        en: 'In an unlocked object, 31 bits of the 64-bit Mark Word are reserved for the identity hashCode. When lightweight locking occurs, the original Mark Word (containing the hashCode) is safely copied onto the thread stack inside the Displaced Mark Word (BasicObjectLock). When the lock is inflated to a Heavyweight ObjectMonitor, the JVM allocates an off-heap C++ ObjectMonitor struct, and the displaced mark word (with the original hashCode) is preserved inside the ObjectMonitor header! Calling System.identityHashCode() on a locked object will fetch the cached hash from the ObjectMonitor.',
        vi: 'Ở trạng thái không khóa, 31 bit trong Mark Word 64-bit được dành để lưu identity hashCode. Khi chuyển sang khóa nhẹ, Mark Word gốc (chứa hashCode) được sao chép an toàn vào stack frame của luồng dưới tên Displaced Mark Word. Khi thăng cấp lên Khóa nặng, JVM cấp phát cấu trúc C++ ObjectMonitor ngoài Heap và lưu giữ mã băm gốc bên trong header của ObjectMonitor! Nhờ đó, gọi System.identityHashCode() trên đối tượng đang bị khóa vẫn trả về đúng mã băm ban đầu.'
      },
      trapWarning: {
        en: 'If an object has ALREADY computed its identity hashCode, it CANNOT use Biased Locking! HotSpot immediately skips biased locking and falls directly back to lightweight locking because the thread ID would overwrite the cached hash code bits.',
        vi: 'Nếu đối tượng ĐÃ TỪNG tính toán identity hashCode, nó KHÔNG THỂ dùng Khóa thiên vị (Biased Lock)! HotSpot sẽ bỏ qua biased lock và nhảy thẳng sang khóa nhẹ, vì việc ghi Thread ID sẽ làm mất mã băm đã lưu.'
      },
      proTip: {
        en: 'This explains why HotSpot deprecated Biased Locking in JEP 374: modern atomic CAS instructions are so fast on contemporary CPUs that the bookkeeping complexity of Biased Locking revocation exceeded its performance benefits.',
        vi: 'Điều này giải thích lý do Java 15 bỏ Biased Locking: các lệnh CAS phần cứng trên CPU hiện đại đã quá nhanh, khiến chi phí thu hồi (revocation) Biased Lock tốn kém hơn lợi ích nó mang lại.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'Why does synchronized cause Carrier Thread Pinning in Java 21 Virtual Threads, and how does the JVM internal stack-chunk freeze mechanism interact with monitorenter vs ReentrantLock?',
        vi: 'Tại sao từ khóa synchronized gây ra hiện tượng Ghim Luồng Nền (Carrier Thread Pinning) trong Java 21 Virtual Threads, và cơ chế đóng băng stack chunk nội tại của JVM tương tác khác nhau thế nào giữa monitorenter và ReentrantLock?'
      },
      answer: {
        en: 'When a Virtual Thread executes blocking I/O (e.g. Socket.read()), the Loom runtime unmounts the virtual thread from its OS Carrier Thread by copying its execution frames into a Java Heap StackChunk object, freeing the OS thread to execute other virtual tasks. However, in Java 21, the HotSpot C++ execution engine ties the ObjectMonitor monitorenter state directly to the underlying physical OS carrier thread address. If a virtual thread blocks inside a synchronized block or method, the JVM CANNOT freeze and unmount the stack frames—pinning the virtual thread to the OS carrier thread! If all carrier threads in the ForkJoinPool (typically equal to CPU core count) are pinned, the entire virtual thread scheduler starves and throughput collapses to zero! In contrast, ReentrantLock is implemented entirely in pure Java using AQS and LockSupport.park(), which cleanly yields and unmounts the carrier thread without pinning.',
        vi: 'Khi một Virtual Thread thực hiện I/O chặn (như đọc socket), runtime của Loom sẽ tách (unmount) luồng ảo ra khỏi Luồng nền OS (Carrier Thread) bằng cách đóng băng các stack frame vào một đối tượng StackChunk trên Heap, giải phóng luồng OS để chạy tác vụ khác. Tuy nhiên trên Java 21, bộ máy C++ của HotSpot gắn chặt trạng thái của ObjectMonitor (monitorenter) vào địa chỉ vật lý của chính Carrier Thread bên dưới. Nếu luồng ảo bị chặn trong khối synchronized, JVM KHÔNG THỂ tách stack frame ra được—khiến luồng ảo bị "ghim chết" (pinned) vào luồng OS! Nếu toàn bộ carrier thread trong ForkJoinPool (thường bằng số lõi CPU) bị ghim hết, toàn bộ scheduler của máy ảo sẽ bị tê liệt và thông lượng tụt về 0! Ngược lại, ReentrantLock được viết bằng Java thuần qua AQS và LockSupport.park(), cho phép unmount luồng nền mượt mà 100% không bị ghim.'
      },
      trapWarning: {
        en: 'Pinning only causes performance degradation when the synchronized block performs BLOCKING OPERATIONS (I/O, Thread.sleep, LockSupport.park). Short-lived, purely in-memory computational synchronized blocks (such as reading an internal field) are completely harmless even with virtual threads.',
        vi: 'Hiện tượng Ghim luồng (Pinning) chỉ gây hại khi khối synchronized thực hiện TÁC VỤ CHẶN (I/O đĩa/mạng, Thread.sleep). Các khối synchronized thuần tính toán trong RAM diễn ra trong vài nano giây thì hoàn toàn vô hại.'
      },
      proTip: {
        en: 'Highlight Java 24 (JEP 491 - Synchronize Virtual Threads without Pinning): The OpenJDK Loom team has refactored the C++ ObjectMonitor implementation so that monitorenter no longer pins carrier threads, natively resolving this architectural limitation in future LTS releases.',
        vi: 'Thể hiện tầm nhìn kiến trúc qua JEP 491 trên Java 24: Nhóm OpenJDK Loom đã tái cấu trúc lại mã nguồn C++ ObjectMonitor để monitorenter không còn làm ghim carrier thread nữa, giải quyết triệt để rào cản này trong tương lai.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'API Gateway Metrics Collector Lock Convoying & Kernel Futex Context Switch Storm',
      vi: 'Hiện Tượng Đoàn Tàu Khóa (Lock Convoying) & Bão Context Switch Trong Bộ Đếm API Gateway'
    },
    businessContext: {
      en: 'A cloud-native API Gateway routes 140,000 HTTP requests/second across a 64-core bare-metal enterprise cluster.',
      vi: 'Hệ thống API Gateway đám mây định tuyến 140,000 HTTP request/giây trên cụm máy chủ bare-metal 64 lõi CPU.'
    },
    problemDescription: {
      en: 'To track global request rates, HTTP 5xx errors, and total latency, developers injected a singleton MetricsRegistry with a synchronized method: public synchronized void recordLatency(long ms). Under a surge of 120 concurrent request worker threads, the intrinsic lock instantly inflated to a Heavyweight ObjectMonitor. Threads were forced into the C++ ObjectMonitor _cxq wait queue and suspended via the Linux kernel futex(FUTEX_WAIT) system call. The machine was paralyzed by a Context Switch Storm (over 195,000 context switches per second), pinning CPU utilization at 98% while API throughput collapsed from 140,000 req/s to 11,500 req/s.',
      vi: 'Để theo dõi lưu lượng request, mã lỗi 5xx và tổng độ trễ, nhóm phát triển đã nhúng một Bean Singleton MetricsRegistry có phương thức synchronized: public synchronized void recordLatency(long ms). Khi lượng tải tăng lên 120 luồng đồng thời, khóa nội tại ngay lập tức bị thăng cấp thành Khóa nặng (ObjectMonitor). Các luồng bị dồn ứ vào hàng đợi _cxq và bị đình chỉ qua lời gọi nhân Linux futex(FUTEX_WAIT). Máy chủ bị tê liệt bởi cơn bão chuyển đổi ngữ cảnh (hơn 195,000 context switch/giây), đẩy CPU lên 98% trong khi thông lượng thực tế tụt dốc từ 140,000 req/s xuống chỉ còn 11,500 req/s.'
    },
    whyNaiveFails: {
      en: 'Switching to java.util.concurrent.atomic.AtomicLong helped under low load but failed under 64 cores due to Cache-Line Bouncing. 64 CPU cores simultaneously executed LOCK CMPXCHG on the same 64-byte L1 cache line, constantly invalidating each other across the CPU interconnect bus and saturating hardware memory controllers.',
      vi: 'Chuyển sang dùng AtomicLong chỉ giải quyết được khi tải thấp, nhưng khi lên 64 lõi CPU, nó gặp lỗi Xung đột dòng Cache (Cache-Line Bouncing). 64 lõi CPU liên tục phát lệnh LOCK CMPXCHG lên cùng một dòng cache L1 64-byte, liên tục xóa cache của nhau qua đường truyền CPU bus và làm nghẽn bộ điều khiển bộ nhớ phần cứng.'
    },
    coreSolution: {
      en: 'Eliminate lock convoying and cache line bouncing by replacing synchronized counters and AtomicLong with java.util.concurrent.atomic.LongAdder. LongAdder maintains an array of internally padded Cell structures (annotated with @jdk.internal.vm.annotation.Contended to prevent false sharing). Contending threads automatically hash to independent cells, executing non-blocking hardware additions on separate CPU cache lines without cross-core cache invalidation.',
      vi: 'Triệt tiêu hoàn toàn hiện tượng nghẽn khóa và xung đột dòng cache bằng cách thay thế synchronized và AtomicLong bằng java.util.concurrent.atomic.LongAdder. LongAdder duy trì một mảng các ô nhớ Cell có đệm (padding bằng @Contended chống false sharing). Các luồng cạnh tranh nhau sẽ tự động băm vào các ô Cell độc lập, thực hiện phép cộng trên các dòng cache L1 riêng biệt mà không làm mất hiệu lực cache của các lõi CPU khác.'
    },
    productionCode: `// Production High-Throughput Metrics Collector: LongAdder vs Synchronized
package com.gateway.metrics;

import java.util.concurrent.atomic.LongAdder;

public class HighThroughputMetricsRegistry {

    // 1. NAIVE ANTI-PATTERN: Heavyweight Lock Convoying
    // public synchronized void recordLatency(long ms) { ... } -> 195,000 context switches/s!

    // 2. PRODUCTION STRIPED PATTERN: Zero-Contention LongAdder
    // Internally allocates Cell[] with @Contended padding to eliminate False Sharing
    private final LongAdder totalRequests = new LongAdder();
    private final LongAdder totalLatencyMs = new LongAdder();
    private final LongAdder totalErrors = new LongAdder();

    public void record(long latencyMs, boolean isError) {
        // High-speed non-blocking addition: each CPU core hits its own thread-hashed Cell
        totalRequests.increment();
        totalLatencyMs.add(latencyMs);
        if (isError) {
            totalErrors.increment();
        }
    }

    public Snapshot snapshot() {
        // sum() aggregates all striped cells across the array
        long reqs = totalRequests.sum();
        long totalMs = totalLatencyMs.sum();
        long errs = totalErrors.sum();
        double avg = reqs > 0 ? (double) totalMs / reqs : 0.0;
        return new Snapshot(reqs, errs, avg);
    }

    public record Snapshot(long totalRequests, long totalErrors, double avgLatencyMs) {}
}`,
    architectureImpact: {
      en: 'Throughput soared from 11,500 req/s back to 138,000 req/s (12x throughput improvement); CPU context switches plunged from 195,000/s to 1,800/s; CPU utilization decreased from 98% to 19%; Zero kernel futex lock wait stalls.',
      vi: 'Thông lượng tăng vọt từ 11,500 req/s trở lại 138,000 req/s (tăng 12 lần); Tần suất context switch giảm từ 195,000/s xuống còn 1,800/s; Mức sử dụng CPU giảm từ 98% xuống 19%; Không còn hiện tượng dừng luồng do khóa futex.'
    }
  }
};
