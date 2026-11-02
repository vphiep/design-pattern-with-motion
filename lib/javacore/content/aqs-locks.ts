import type { JavaCoreTopic } from '../types';

export const aqsLocks: JavaCoreTopic = {
  id: 'aqs-locks',
  category: 'concurrency-juc',
  name: 'AbstractQueuedSynchronizer (AQS) & ReentrantLock',
  tagline: {
    en: 'Doug Lea’s concurrency framework: Volatile state integer, CLH FIFO node queues, CAS atomic transitions, and LockSupport park/unpark.',
    vi: 'Khung đồng bộ Doug Lea kinh điển: Biến trạng thái volatile nguyên tử, hàng đợi CLH FIFO, chuyển đổi CAS và LockSupport park/unpark.'
  },
  difficulty: 3,
  level: 'advanced',
  order: 16,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'Building custom synchronization primitives (locks, semaphores, barriers) from scratch requires complex lock-free algorithms, race condition handling, thread parking, and FIFO order guarantees. If every library rolled its own queuing logic, subtle concurrency bugs and deadlocks would plague enterprise applications.',
      vi: 'Việc tự xây dựng các cấu trúc đồng bộ hóa (khóa, semaphore, barrier) từ đầu đòi hỏi các giải thuật phi khóa (lock-free) cực kỳ phức tạp, xử lý điều kiện đua (race conditions), đình chỉ luồng và bảo đảm thứ tự hàng đợi FIFO. Nếu mỗi thư viện tự chế một hàng đợi riêng, các lỗi đồng thời tinh vi và deadlock sẽ làm sập các ứng dụng doanh nghiệp.'
    },
    hardwareConstraint: {
      en: 'CPUs execute atomic Compare-And-Swap (CAS) instructions in nanoseconds. However, when a thread must wait for seconds, busy-spinning on a CAS loop consumes 100% CPU on that core. AQS bridges fast-path hardware CAS with efficient operating system thread parking (LockSupport.park) to save CPU cycles.',
      vi: 'CPU thực thi lệnh nguyên tử Compare-And-Swap (CAS) trong nano giây. Tuy nhiên, khi một luồng phải chờ hàng giây, việc xoay vòng liên tục trên lệnh CAS (busy-spinning) sẽ đốt 100% công suất của CPU core đó. AQS kết hợp lệnh CAS phần cứng cho đường đi nhanh với cơ chế cho luồng ngủ của hệ điều hành (LockSupport.park) để tiết kiệm CPU.'
    },
    fundamentalSolution: {
      en: 'AbstractQueuedSynchronizer (AQS) defines a unified framework built on two foundational components: 1) A volatile int state variable manipulated atomically via CAS, and 2) A FIFO doubly-linked CLH queue of Node objects representing blocked threads. Subclasses (ReentrantLock, Semaphore, CountDownLatch) simply define what "state" means (e.g. lock count or permit count).',
      vi: 'AbstractQueuedSynchronizer (AQS) định nghĩa một khung đồng bộ thống nhất xây dựng trên hai trụ cột: 1) Một biến trạng thái volatile int state được cập nhật nguyên tử qua lệnh CAS, và 2) Một hàng đợi hai chiều CLH FIFO chứa các đối tượng Node đại diện cho các luồng đang chờ. Các lớp con (ReentrantLock, Semaphore, CountDownLatch) chỉ việc định nghĩa lại ý nghĩa của biến "state" (như số lần khóa hay số lượng giấy phép permit).'
    },
    math: {
      formula: 'ReentrantLock: state = 0 (Unlocked),   state > 0 (Held by exclusiveOwnerThread, value = Reentrant Depth)',
      description: {
        en: 'For Semaphore, state represents available permits; for CountDownLatch, state represents remaining count down to zero.',
        vi: 'Với Semaphore, state biểu thị số permit còn lại; với CountDownLatch, state biểu thị số đếm lùi về 0.'
      },
      timeComplexity: 'O(1) CAS lock acquisition on fast-path; amortized O(1) FIFO enqueue / dequeue',
      spaceComplexity: 'O(Waiting_Threads) heap nodes in CLH doubly-linked list',
      memoryOverheadFormula: 'CLH Node Overhead ≈ 32 Bytes per blocked waiting thread'
    }
  },

  detailedTheory: {
    overview: {
      en: 'AbstractQueuedSynchronizer (AQS) is the masterwork of concurrency pioneer Doug Lea, serving as the foundational engine for java.util.concurrent. By separating lock acquisition semantics (exclusive vs shared) from thread queuing and OS suspension, AQS enables robust, high-performance synchronization across the entire Java platform.',
      vi: 'AbstractQueuedSynchronizer (AQS) là kiệt tác của kỹ sư Doug Lea, đóng vai trò là động cơ cốt lõi cho toàn bộ gói java.util.concurrent. Bằng cách tách biệt ngữ nghĩa chiếm khóa (độc quyền vs chia sẻ) ra khỏi việc quản lý hàng đợi và đình chỉ luồng OS, AQS mang lại khả năng đồng bộ hóa hiệu năng cao cho toàn bộ nền tảng Java.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Core Volatile State Integer: At the heart of AQS is a single 32-bit field: private volatile int state. In ReentrantLock, state=0 signifies unlocked; state=1 signifies locked; state > 1 tracks reentrant depth when the owning thread acquires the lock repeatedly. In Semaphore, state represents the count of available concurrent permits. In CountDownLatch, state represents the remaining countdown count.',
        vi: '1. Biến Trạng Thái Volatile State Cốt Lõi: Trọng tâm của AQS là một trường số nguyên 32-bit: private volatile int state. Trong ReentrantLock, state=0 nghĩa là chưa khóa; state=1 là đã khóa; state > 1 theo dõi độ sâu tái nhập (Reentrant Depth) khi cùng một luồng xin khóa nhiều lần. Trong Semaphore, state đại diện cho số permit cho phép đồng thời. Trong CountDownLatch, state biểu diễn số đếm lùi về 0.'
      },
      {
        en: '2. The CLH FIFO Queue of Nodes: When a thread fails to acquire the state via CAS, AQS packages the thread into a Node object and enqueues it into a lock-free doubly-linked FIFO queue (a variant of the Craig, Landin, and Hagersten queue). The queue maintains head and tail pointers. New nodes are appended to the tail using atomic compareAndSetTail(). Threads in the queue are parked until the head releases the lock.',
        vi: '2. Hàng Đợi CLH FIFO Chứa Các Node: Khi một luồng thất bại khi xin state qua CAS, AQS đóng gói luồng đó vào một đối tượng Node và đưa vào hàng đợi liên kết đôi FIFO phi khóa (biến thể của hàng đợi CLH). Hàng đợi quản lý hai con trỏ head và tail. Node mới được nối vào đuôi bằng lệnh nguyên tử compareAndSetTail(). Các luồng trong hàng đợi được đưa vào trạng thái ngủ cho tới khi node ở đầu nhả khóa.'
      },
      {
        en: '3. Thread Suspension via LockSupport.park() & unpark(): Unlike Object.wait() which requires holding a synchronized monitor, LockSupport uses native operating system Parker primitives (pthread_mutex and pthread_cond). When a thread cannot make forward progress in the CLH queue, AQS calls LockSupport.park(this). When the owning thread releases the lock, it invokes LockSupport.unpark(successor.thread) to wake the next eligible thread in ~2µs.',
        vi: '3. Cơ Chế Đình Chỉ Luồng qua LockSupport park() & unpark(): Khác với Object.wait() đòi hỏi phải giữ monitor của synchronized, LockSupport sử dụng cơ chế Parker của hệ điều hành (pthread_mutex và pthread_cond). Khi một luồng không thể tiến bước trong hàng đợi CLH, AQS gọi LockSupport.park(this). Khi luồng giữ khóa nhả khóa, nó gọi LockSupport.unpark(successor.thread) để đánh thức luồng kế tiếp trong hàng đợi chỉ trong ~2µs.'
      },
      {
        en: '4. Fair vs Nonfair Lock Acquisition (Barging): In Nonfair mode (the default), an incoming thread immediately attempts a CAS on the state integer before checking the queue. If it succeeds, it "barges" in front of waiting queue threads, saving expensive unpark and context switch latencies and providing up to 10x higher throughput! In Fair mode, the incoming thread checks hasQueuedPredecessors() first, strictly honoring FIFO arrival order.',
        vi: '4. Chiếm Khóa Công Bằng (Fair) vs Không Công Bằng (Nonfair / Barging): Ở chế độ Nonfair (mặc định), luồng mới đến lập tức thử lệnh CAS trên biến state trước khi ngó vào hàng đợi. Nếu thành công, nó "chen ngang" (barge) ngay trước mặt các luồng đang đợi, tiết kiệm độ trễ unpark và context switch đắt đỏ, giúp tăng thông lượng lên tới 10 lần! Ở chế độ Fair, luồng mới bắt buộc phải kiểm tra hasQueuedPredecessors() trước, tuân thủ nghiêm ngặt thứ tự ai đến trước được phục vụ trước.'
      },
      {
        en: '5. Exclusive vs Shared Acquisition Modes: AQS supports two fundamental execution modes: 1) Exclusive Mode (used by ReentrantLock and WriteLock in ReentrantReadWriteLock), where only a single thread can hold state at any instant; and 2) Shared Mode (used by Semaphore, CountDownLatch, and ReadLock), where multiple threads can acquire state concurrently, propagating success down the queue upon acquisition.',
        vi: '5. Chế Độ Chiếm Khóa Độc Quyền (Exclusive) vs Chia Sẻ (Shared): AQS hỗ trợ hai chế độ hoạt động cốt lõi: 1) Chế độ Độc quyền (dùng trong ReentrantLock và WriteLock của ReadWriteLock), nơi chỉ DUY NHẤT một luồng được giữ state tại một thời điểm; và 2) Chế độ Chia sẻ (dùng trong Semaphore, CountDownLatch, và ReadLock), nơi nhiều luồng có thể cùng giữ state và lan truyền tín hiệu thành công xuống các node phía sau.'
      },
      {
        en: '6. The ConditionObject & Condition Queues: ReentrantLock.newCondition() returns an instance of AQS.ConditionObject. When a thread invokes condition.await(), it releases its reentrant lock, creates a new node in a separate singly-linked Condition Queue, and parks. When another thread invokes condition.signal(), the node is transferred from the Condition Queue back into the main AQS CLH Sync Queue to re-acquire the lock.',
        vi: '6. Cấu Trúc ConditionObject & Hàng Đợi Điều Kiện: Lệnh ReentrantLock.newCondition() trả về đối tượng AQS.ConditionObject. Khi một luồng gọi condition.await(), nó nhả toàn bộ khóa reentrant, tạo một node trong Hàng Đợi Điều Kiện (Condition Queue) liên kết đơn riêng biệt và đi ngủ. Khi luồng khác gọi condition.signal(), node đó được chuyển từ Condition Queue ngược trở lại hàng đợi chính AQS CLH để xếp hàng xin lại khóa.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Forgetting to Unlock Inside Finally Block: Unlike synchronized blocks where the compiler automatically emits exception handlers with monitorexit, ReentrantLock requires explicit unlock(). Forgetting to place lock.unlock() inside a try-finally block guarantees that any runtime exception will leave the lock permanently held, causing an irrecoverable system-wide deadlock!',
        vi: 'Quên Gọi unlock() Trong Khối Finally: Khác với synchronized nơi trình biên dịch tự động sinh khối bắt lỗi để gọi monitorexit, ReentrantLock bắt buộc phải nhả khóa thủ công. Việc quên không đặt lock.unlock() bên trong khối try-finally sẽ khiến bất kỳ Exception nào phát sinh cũng để lại ổ khóa bị giữ vĩnh viễn, làm treo cứng toàn bộ hệ thống!'
      },
      {
        en: 'Severe Throughput Collapse from Fair Locks: Configuring new ReentrantLock(true) forces every thread to wait in strict FIFO order. In high-concurrency benchmarks, Fair locks suffer severe throughput drops (often dropping by 80-90% compared to Nonfair locks) due to thread conveyor stalling and CPU pipeline flushes. Only use Fair locks when starvation prevention is a strict regulatory requirement.',
        vi: 'Sụt Giảm Thông Lượng Nghiêm Trọng Do Khóa Công Bằng (Fair Lock): Khởi tạo new ReentrantLock(true) bắt buộc mọi luồng phải xếp hàng tuần tự tuyệt đối. Dưới tải cao, khóa Fair bị tụt giảm thông lượng thảm hại (thường giảm tới 80-90% so với Nonfair) do hiện tượng nghẽn hàng đợi (Conveyor Stalling) và xả pipeline CPU. Chỉ dùng Fair Lock khi nghiệp vụ bắt buộc phải chống đói luồng (Starvation).'
      },
      {
        en: 'SignalAll vs Signal Starvation: Calling Condition.signal() only wakes a single thread from the condition queue. If that thread evaluates its predicate, finds it unsatisfied, and returns to wait without signaling others, all other waiting threads remain permanently asleep (Signal Starvation)! Best practice: use condition.signalAll() unless you are certain exactly one worker can make progress.',
        vi: 'Đói Tín Hiệu Do Dùng signal() Thay Vì signalAll(): Lệnh Condition.signal() chỉ đánh thức duy nhất 1 luồng. Nếu luồng đó thức dậy thấy điều kiện vẫn chưa thỏa mãn rồi lại ngủ tiếp mà không báo cho ai, toàn bộ các luồng còn lại sẽ ngủ quên mãi mãi (Signal Starvation)! Quy tắc: luôn ưu tiên dùng condition.signalAll() trừ khi bạn chắc chắn 100% chỉ có đúng 1 worker có thể làm việc.'
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'AQS In-Memory Architecture: State Variable & CLH FIFO Node Queue',
      vi: 'Kiến Trúc Bộ Nhớ AQS: Biến State & Hàng Đợi CLH FIFO'
    },
    description: {
      en: 'AQS maintains an atomic volatile state integer and a doubly-linked list of Node objects representing blocked threads, controlled via CAS pointer swapping.',
      vi: 'AQS duy trì biến state nguyên tử và một danh sách liên kết đôi các đối tượng Node đại diện cho các luồng đang chờ, được điều khiển bằng lệnh hoán đổi con trỏ CAS.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| ABSTRACTQUEUEDSYNCHRONIZER (AQS) CORE RUNTIME STRUCTURE                                            |
+----------------------------------------------------------------------------------------------------+
| 1. SYNCHRONIZATION STATE:                                                                          |
|   private volatile int state = 1;  (0 = Unlocked, 1 = Held, 2 = Reentrant depth 2)                 |
|   private transient Thread exclusiveOwnerThread = Thread[worker-1, 5, main];                       |
+----------------------------------------------------------------------------------------------------+
| 2. CLH FIFO DOUBLY-LINKED QUEUE:                                                                   |
|   +---------------+      prev      +------------------+      prev      +------------------+        |
|   |  HEAD NODE    | <------------- |  NODE (Thread 2) | <------------- |  NODE (Thread 3) | <----TAIL
|   |  (Dummy Sent) | -------------> |  waitStatus = -1 | -------------> |  waitStatus = -1 |        |
|   +---------------+      next      +------------------+      next      +------------------+        |
|                                     (Parked on futex)                   (Parked on futex)          |
+----------------------------------------------------------------------------------------------------+
| 3. LOCKSUPPORT THREAD SUSPENSION:                                                                  |
|   LockSupport.park(this)   -> Thread enters OS wait queue (0% CPU utilization)                     |
|   LockSupport.unpark(head.next.thread) -> Wakes successor in ~2 microseconds                        |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'state', size: 'Volatile Int (4B)', description: { en: 'Atomic sync counter. ReentrantLock depth, Semaphore permits, CountDownLatch remaining count.', vi: 'Bộ đếm đồng bộ nguyên tử. Độ sâu khóa ReentrantLock, số permit Semaphore, số đếm CountDownLatch.' } },
      { name: 'wait_status', size: 'Volatile Int (4B)', description: { en: 'SIGNAL (-1), CANCELLED (1), CONDITION (-2), PROPAGATE (-3).', vi: 'SIGNAL (-1), CANCELLED (1), CONDITION (-2), PROPAGATE (-3).' } },
      { name: 'prev_next_pointers', size: '64-bit References', description: { en: 'Doubly-linked references allowing lock-free CAS queue manipulation.', vi: 'Các con trỏ liên kết đôi cho phép thao tác thêm/xóa hàng đợi phi khóa bằng CAS.' } },
      { name: 'exclusive_owner_thread', size: '64-bit Reference', description: { en: 'Reference to the thread currently possessing exclusive ownership of the lock.', vi: 'Con trỏ tham chiếu tới luồng hiện đang nắm giữ độc quyền ổ khóa.' } }
    ]
  },

  steps: [
    {
      id: 'cas-acquire',
      title: { en: '1. Fast-Path Atomic CAS on State Variable', vi: '1. Chiếm khóa đường nhanh bằng lệnh CAS nguyên tử trên State' },
      phase: 'CAS_ACQUIRE',
      description: {
        en: 'Under Nonfair mode, the incoming thread immediately executes compareAndSetState(0, 1). If the state was 0, CAS succeeds in ~10ns: the thread sets exclusiveOwnerThread = currentThread() and enters the critical section with zero queuing.',
        vi: 'Ở chế độ Nonfair, luồng mới lập tức thực thi compareAndSetState(0, 1). Nếu state đang bằng 0, lệnh CAS thành công trong ~10ns: luồng gán exclusiveOwnerThread bằng chính mình và bước thẳng vào critical section mà không cần xếp hàng.'
      },
      jvmRuntimeBehavior: {
        en: 'Zero memory allocation. Pure hardware CMPXCHG instruction execution in CPU cache.',
        vi: 'Không cấp phát bộ nhớ. Thực thi thuần túy lệnh phần cứng CMPXCHG trong cache CPU.'
      },
      javaCodeLineMatch: 'lock.lock(); // compareAndSetState(0, 1)'
    },
    {
      id: 'enqueue-park',
      title: { en: '2. Enqueue into CLH Queue & LockSupport.park()', vi: '2. Xếp hàng vào CLH Queue & Đưa vào giấc ngủ bằng LockSupport' },
      phase: 'CLH_ENQUEUE_PARK',
      description: {
        en: 'If CAS fails, the thread allocates a Node(Thread, waitStatus=SIGNAL) and appends it to the tail of the CLH queue via compareAndSetTail(). Once queued, it invokes LockSupport.park(this) to suspend thread execution safely.',
        vi: 'Nếu lệnh CAS thất bại, luồng tạo một Node và nối vào đuôi hàng đợi CLH bằng compareAndSetTail(). Khi đã vào hàng đợi, luồng gọi LockSupport.park(this) để đưa luồng vào giấc ngủ an toàn với 0% CPU.'
      },
      jvmRuntimeBehavior: {
        en: 'Thread transitions from RUNNABLE to WAITING via OS futex call.',
        vi: 'Luồng chuyển trạng thái từ RUNNABLE sang WAITING qua lời gọi futex của OS.'
      },
      javaCodeLineMatch: 'acquireQueued(addWaiter(Node.EXCLUSIVE), arg);'
    },
    {
      id: 'release-unpark',
      title: { en: '3. State Reset & Successor Unpark Notification', vi: '3. Reset State & Đánh thức luồng kế tiếp bằng LockSupport.unpark()' },
      phase: 'RELEASE_UNPARK',
      description: {
        en: 'The owning thread calls unlock(): state is decremented to 0, and exclusiveOwnerThread is cleared. The head node locates its successor (head.next) and invokes LockSupport.unpark(successor.thread) to wake the next waiting worker.',
        vi: 'Luồng sở hữu gọi unlock(): biến state giảm về 0 và xóa exclusiveOwnerThread. Node ở đầu (head) tìm node kế tiếp (head.next) và gọi LockSupport.unpark(successor.thread) để đánh thức luồng tiếp theo.'
      },
      jvmRuntimeBehavior: {
        en: 'Successor thread woken up in ~2µs; retries CAS on state and takes ownership.',
        vi: 'Luồng kế tiếp được đánh thức trong ~2µs; thử lại lệnh CAS trên state và tiếp quản khóa.'
      },
      javaCodeLineMatch: 'lock.unlock(); // state = 0; unparkSuccessor(h);'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'java.util.concurrent (JUC Standard)',
      implementationName: 'AQS AbstractQueuedSynchronizer Framework',
      keyMechanism: {
        en: 'Serves as the foundation for ReentrantLock, Semaphore, CountDownLatch, and ThreadPoolExecutor. Features lock-free CLH queue management with VarHandle atomic updates.',
        vi: 'Là nền móng cho ReentrantLock, Semaphore, CountDownLatch và ThreadPoolExecutor. Quản lý hàng đợi CLH phi khóa với các cập nhật nguyên tử qua VarHandle.'
      },
      defaultFlags: 'Standard JDK Library (java.base)',
      architectureNote: {
        en: 'Rewritten in Java 9+ using VarHandle instead of sun.misc.Unsafe, boosting memory safety and JIT compiler inlining.',
        vi: 'Được viết lại từ Java 9+ sử dụng VarHandle thay thế sun.misc.Unsafe, tăng tính an toàn bộ nhớ và tối ưu inlining của JIT.'
      }
    },
    {
      jvmEngine: 'Real-Time Java (RTSJ)',
      implementationName: 'Priority Inheritance AQS',
      keyMechanism: {
        en: 'Modifies AQS CLH queue traversal to enforce Priority Inheritance Protocol (PIP), preventing Priority Inversion where low-priority threads block high-priority realtime threads.',
        vi: 'Tùy biến hàng đợi AQS để áp dụng giao thức Thừa hưởng Mức ưu tiên (Priority Inheritance), ngăn hiện tượng đảo ngược ưu tiên làm chậm luồng realtime.'
      },
      defaultFlags: '-XX:+UseRealtimeSync',
      architectureNote: {
        en: 'Mission-critical for aerospace, automotive, and high-frequency algorithmic financial systems.',
        vi: 'Tối quan trọng cho các hệ thống hàng không, xe tự hành và giao dịch tài chính thuật toán tần suất cao.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Provides tryLock() with timeouts, interruptible locking, and condition variables.', vi: 'Cung cấp tryLock() có timeout, khả năng hủy ngắt khi chờ (interruptible) và biến điều kiện Condition.' },
      { en: '100% compatible with Java 21 Virtual Threads (avoids Carrier Thread Pinning!).', vi: 'Tương thích 100% với Virtual Threads Java 21 (hoàn toàn không bị lỗi ghim luồng Carrier Pinning!).' }
    ],
    cons: [
      { en: 'Requires explicit try-finally unlocking discipline; forgotten unlocks cause catastrophic deadlocks.', vi: 'Đòi hỏi kỷ luật viết code try-finally nghiêm ngặt; quên nhả khóa sẽ gây deadlock sập ứng dụng.' },
      { en: 'Slightly higher heap footprint due to Node allocations in heavily contended scenarios.', vi: 'Tốn thêm một ít RAM heap do cấp phát đối tượng Node khi xảy ra tranh chấp gay gắt.' }
    ],
    memoryFootprint: {
      en: 'Zero allocation on fast-path CAS; ~32 bytes per waiting thread in contended CLH queue.',
      vi: 'Không tốn RAM khi chiếm khóa nhanh qua CAS; ~32 byte cho mỗi luồng phải vào hàng đợi CLH.'
    },
    jvmSpecificationGuarantee: {
      en: 'Guarantees JMM happens-before visibility: all writes prior to unlock() are visible after subsequent lock().',
      vi: 'Bảo đảm quy tắc happens-before của JMM: mọi thao tác ghi trước unlock() đều nhìn thấy được sau lệnh lock() tiếp theo.'
    }
  },

  javaCode: `package com.enterprise.jvm.aqs;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Pure Java 21 Educational Masterclass: AQS & ReentrantLock Mechanics
 * Demonstrates:
 *  1. Nonfair Barging vs Fair FIFO Queueing
 *  2. Proper try-finally lock discipline
 *  3. ConditionObject await/signal coordination without carrier pinning
 */
public class AqsReentrantLockDemo {

    // Nonfair lock: Allows incoming threads to barge via CAS for 10x higher throughput!
    private static final ReentrantLock LOCK = new ReentrantLock(false);
    private static final Condition DATA_READY = LOCK.newCondition();

    private static boolean isProduced = false;
    private static int sharedPayload = 0;

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== AQS & REENTRANTLOCK UNDER THE HOOD MASTERCLASS ===");

        Thread consumer = Thread.ofVirtual().name("consumer-vt").start(AqsReentrantLockDemo::consumeData);
        Thread producer = Thread.ofVirtual().name("producer-vt").start(AqsReentrantLockDemo::produceData);

        consumer.join();
        producer.join();

        System.out.println("Execution finished cleanly with zero carrier pinning!");
    }

    private static void produceData() {
        LOCK.lock(); // AQS fast-path: compareAndSetState(0, 1)
        try {
            System.out.println("[PRODUCER] Acquired lock. Generating data payload...");
            sharedPayload = 42;
            isProduced = true;

            // Signal wakes the waiting consumer from Condition Queue back to AQS CLH queue
            DATA_READY.signal();
            System.out.println("[PRODUCER] Signaled DATA_READY condition.");
        } finally {
            // CRITICAL: Always release in finally block to reset state = 0 and unpark successor!
            LOCK.unlock();
        }
    }

    private static void consumeData() {
        LOCK.lock();
        try {
            while (!isProduced) {
                System.out.println("[CONSUMER] Data not ready. Releasing lock and entering Condition.await()...");
                // Releases lock (state=0), enqueues in Condition Queue, and unmounts virtual thread!
                DATA_READY.await(2, TimeUnit.SECONDS);
            }
            System.out.println("[CONSUMER] Woken up! Successfully consumed payload: " + sharedPayload);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            LOCK.unlock();
        }
    }
}`,

  jvmFlagsCode: `# ===================================================================
# Inspecting AQS Locks & Threads on Running Production JVM
# ===================================================================
# Print all locks and threads including ownable synchronizers:
jcmd <PID> Thread.print -l

# JStack output showing thread waiting inside AQS.parkAndCheckInterrupt:
# "consumer-vt" #25 prio=5 os_prio=0 cpu=2.1ms tid=0x00007f...
#    java.lang.Thread.State: WAITING (parking)
#    at jdk.internal.misc.Unsafe.park(Native Method)
#    at java.util.concurrent.locks.LockSupport.park(LockSupport.java:371)
#    at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionNode.block(AbstractQueuedSynchronizer.java:519)
#    at java.util.concurrent.ForkJoinPool.unmanagedBlock(ForkJoinPool.java:4011)
#    at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1712)`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c com.enterprise.jvm.aqs.AqsReentrantLockDemo
private static void produceData();
  Code:
   0: getstatic     #7   // Field LOCK:Ljava/util/concurrent/locks/ReentrantLock;
   3: invokevirtual #13  // Method java/util/concurrent/locks/ReentrantLock.lock:()V (AQS CAS acquire)
   6: bipush        42
   8: putstatic     #17  // Field sharedPayload:I
  11: iconst_1
  12: putstatic     #21  // Field isProduced:Z
  15: getstatic     #25  // Field DATA_READY:Ljava/util/concurrent/locks/Condition;
  18: invokeinterface #29, 1 // InterfaceMethod java/util/concurrent/locks/Condition.signal:()V
  23: getstatic     #7
  26: invokevirtual #35  // Method java/util/concurrent/locks/ReentrantLock.unlock:()V (AQS unpark)
  29: return
  Exception table:
     from    to  target type
         6    23    30   any
        30    32    30   any`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What is AbstractQueuedSynchronizer (AQS) in Java, and why is it called the foundation of java.util.concurrent?',
        vi: 'AbstractQueuedSynchronizer (AQS) là gì và tại sao nó được gọi là xương sống của gói java.util.concurrent?'
      },
      answer: {
        en: 'AQS (AbstractQueuedSynchronizer) is a foundational framework for building locks and synchronizers in Java. Instead of reinventing thread queueing and atomic state management, almost all JUC synchronizers—including ReentrantLock, Semaphore, CountDownLatch, ReentrantReadWriteLock, and CyclicBarrier—are implemented on top of AQS! AQS manages an atomic volatile state integer via CAS, a doubly-linked CLH FIFO waiter queue, and relies on LockSupport.park()/unpark() to suspend and wake threads without heavy OS kernel locks.',
        vi: 'AQS (AbstractQueuedSynchronizer) là bộ khung nền tảng để xây dựng các loại khóa và bộ đồng bộ trong Java. Thay vì phải tự viết lại cơ chế quản lý hàng đợi và đồng bộ trạng thái, hầu như toàn bộ các công cụ trong gói java.util.concurrent (như ReentrantLock, Semaphore, CountDownLatch, ReentrantReadWriteLock) đều được xây dựng trên AQS! AQS quản lý một biến trạng thái volatile state nguyên tử qua lệnh CAS, một hàng đợi FIFO hai chiều (CLH queue) và sử dụng LockSupport.park()/unpark() để tạm dừng và đánh thức luồng mà không tốn chi phí khóa nặng của OS.'
      },
      trapWarning: {
        en: 'Do not confuse AQS with synchronized. synchronized is built directly into the HotSpot C++ JVM specification, whereas AQS is written in pure Java (using Unsafe/VarHandle) inside the standard JDK libraries.',
        vi: 'Đừng nhầm AQS với synchronized. synchronized là tính năng được nhúng trực tiếp vào mã C++ của máy ảo JVM, trong khi AQS được viết hoàn toàn bằng Java thuần (dùng Unsafe/VarHandle) trong thư viện JDK.'
      },
      proTip: {
        en: 'Know the core method to override: Subclasses only need to implement tryAcquire/tryRelease (for Exclusive mode like ReentrantLock) or tryAcquireShared/tryReleaseShared (for Shared mode like Semaphore/CountDownLatch).',
        vi: 'Nắm chắc các hàm nòng cốt cần override: Các lớp con chỉ cần cài đặt tryAcquire/tryRelease (cho chế độ Độc quyền như ReentrantLock) hoặc tryAcquireShared/tryReleaseShared (cho chế độ Chia sẻ như Semaphore/CountDownLatch).'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What is the difference between Fair and Non-Fair locks in ReentrantLock, and why is Non-Fair default?',
        vi: 'Sự khác biệt giữa Fair Lock (Khóa công bằng) và Non-Fair Lock trong ReentrantLock là gì, tại sao Non-Fair lại là mặc định?'
      },
      answer: {
        en: '1. Fair Lock (new ReentrantLock(true)): Threads acquire the lock strictly in First-In-First-Out (FIFO) arrival order. Before attempting CAS, a thread checks hasQueuedPredecessors(): if there are older waiting threads in the AQS queue, it immediately enqueues itself at the tail. 2. Non-Fair Lock (new ReentrantLock(false) - Default): When lock() is called, the thread immediately attempts an opportunistic CAS on the state variable. If the lock was just released at that exact nanosecond, the arriving thread "barges in" and grabs the lock, jumping ahead of queued threads! Why Non-Fair is default: Non-fair locking delivers up to 10x HIGHER throughput because waking up a parked thread from the OS queue takes ~2-3 microseconds; letting a running thread barge in immediately keeps the CPU saturated without idle bubbles.',
        vi: '1. Fair Lock (Khóa công bằng): Các luồng chiếm khóa theo đúng thứ tự FIFO ai đến trước được phục vụ trước. Trước khi thử CAS, luồng kiểm tra hàm hasQueuedPredecessors(): nếu có luồng đến trước đang chờ trong hàng đợi AQS, nó tự động xếp hàng xuống cuối. 2. Non-Fair Lock (Khóa không công bằng - Mặc định): Khi gọi lock(), luồng lập tức thử lệnh CAS ngay vào biến state. Nếu khóa vừa được nhả ở đúng nanogiây đó, luồng đang chạy sẽ "chen ngang" chiếm luôn khóa, vượt mặt các luồng đang xếp hàng! Lý do Non-Fair là mặc định: Khóa không công bằng cho thông lượng CAO GẤP 10 LẦN vì việc đánh thức một luồng đang ngủ trong OS tốn từ 2-3 microgiây; việc cho luồng đang chạy sẵn chen vào chiếm khóa sẽ tận dụng tối đa CPU mà không có khoảng thời gian chết.'
      },
      trapWarning: {
        en: 'Fair locks suffer from severe performance penalties and thread convoy effects. Only use fair locks if you have an explicit business requirement where thread starvation must be prevented at all costs.',
        vi: 'Khóa Fair Lock bị tụt giảm hiệu năng rất nặng do hiệu ứng đoàn tàu (thread convoy). Chỉ dùng Fair Lock khi có yêu cầu nghiệp vụ bắt buộc tuyệt đối không được để luồng nào bị đói tài nguyên (starvation).'
      },
      proTip: {
        en: 'Show bytecode/JDK insight: Notice that ReentrantLock.tryLock() without arguments ALWAYS behaves as NON-FAIR, even on a Fair ReentrantLock instance! Use tryLock(0, TimeUnit.SECONDS) to honor fairness.',
        vi: 'Điểm tinh tế ít người biết: Lệnh ReentrantLock.tryLock() không tham số LUÔN LUÔN là Non-fair (chen ngang), kể cả khi đối tượng ReentrantLock đó được khởi tạo là Fair! Muốn tuân thủ tính công bằng thì phải gọi tryLock(0, TimeUnit.SECONDS).'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'How does AQS manage thread queuing via the CLH Lock variant without losing wakeups?',
        vi: 'AQS quản lý hàng đợi luồng qua biến thể CLH Lock như thế nào để không bao giờ bị mất tín hiệu đánh thức (Lost Wakeup)?'
      },
      answer: {
        en: 'AQS uses a modified Craig, Landin, and Hagersten (CLH) doubly-linked FIFO queue. When a thread fails to acquire state, it wraps itself in a Node object and enqueues onto the tail via atomic CAS (compareAndSetTail). To prevent lost wakeups and race conditions between parking and unparking: 1. A thread sets its predecessor\'s waitStatus to SIGNAL (-1), signaling: "You must unpark me when you release the lock". 2. It performs a final sanity check (re-trying tryAcquire) before calling LockSupport.park(this). 3. When the lock holder releases, release() inspects the head node: if waitStatus == SIGNAL, it executes LockSupport.unpark(successor.thread). Even if unpark() fires BEFORE park() executes, LockSupport provides a permit token, ensuring the subsequent park() returns immediately without hanging!',
        vi: 'AQS sử dụng một biến thể của hàng đợi CLH hai chiều. Khi một luồng thất bại khi chiếm state, nó bọc mình vào một đối tượng Node và nối vào đuôi hàng đợi bằng lệnh CAS nguyên tử (compareAndSetTail). Để chống mất tín hiệu đánh thức (Lost Wakeup): 1. Luồng đánh dấu trạng thái của nút đứng trước nó là SIGNAL (-1), mang ý nghĩa: "Khi bạn nhả khóa, bạn bắt buộc phải đánh thức tôi". 2. Luồng thử chiếm khóa lần cuối trước khi thực sự gọi LockSupport.park(this). 3. Khi luồng giữ khóa nhả ra, hàm release() kiểm tra nút head: nếu waitStatus == SIGNAL, nó gọi LockSupport.unpark(successor.thread). Đặc biệt, kể cả khi unpark() được gọi TRƯỚC KHI park() kịp chạy, cơ chế vé (permit token) của LockSupport vẫn bảo đảm lệnh park() tiếp theo sẽ đi qua ngay mà không bị treo vĩnh viễn!'
      },
      trapWarning: {
        en: 'AQS uses a dummy "sentinel" head node. The head node represents the thread that CURRENTLY holds the lock, while the queue starting at head.next represents the waiting threads.',
        vi: 'AQS sử dụng một nút giả (sentinel) làm head. Nút head đại diện cho luồng ĐANG NẮM GIỮ khóa hiện tại, còn hàng đợi chờ thực sự bắt đầu từ head.next.'
      },
      proTip: {
        en: 'Explain ConditionObject: Each lock.newCondition() creates a separate independent FIFO condition queue. When await() is called, the node is moved from the AQS sync queue to the condition queue, and moved back when signal() is called.',
        vi: 'Giải thích ConditionObject: Mỗi lệnh newCondition() tạo ra một hàng đợi condition độc lập. Khi gọi await(), nút được chuyển từ sync queue sang condition queue, và được chuyển ngược lại khi có signal().'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'Why does StampedLock outperform ReentrantReadWriteLock (RRWL) under heavy read concurrency, and why can it NEVER be used with reentrant calls or Condition objects?',
        vi: 'Tại sao StampedLock vượt trội hơn hẳn so với ReentrantReadWriteLock (RRWL) khi đọc đồng thời cực lớn, và tại sao nó TUYỆT ĐỐI KHÔNG THỂ dùng đệ quy (reentrant) hoặc với đối tượng Condition?'
      },
      answer: {
        en: 'In ReentrantReadWriteLock, acquiring a read lock requires mutating the shared AQS state variable via CAS (incrementing the high 16 bits). On 64-core multi-socket servers, 100 concurrent reader threads executing CAS on the SAME memory address trigger a devastating CPU Cache-Coherence Invalidation Storm: each CPU core invalidates the L1/L2 caches of all other cores across the interconnect bus! StampedLock eliminates this via Optimistic Reads (tryOptimisticRead()): an optimistic read performs NO memory writes and mutates NO lock state! It simply reads a 64-bit version stamp into a local register, reads the payload fields, and executes validate(stamp). If no write occurred, the read completes with ZERO bus traffic and ZERO cache invalidations. If a writer intervened, validate() returns false and code cleanly falls back to an acquired read lock. Why no reentrancy: StampedLock does NOT record owner thread IDs; attempting to re-acquire an exclusive write lock from the same thread causes an immediate self-deadlock. Why no Condition: StampedLock does not implement the Lock interface or maintain condition queues.',
        vi: 'Trong ReentrantReadWriteLock, việc xin khóa đọc (read lock) bắt buộc phải cập nhật biến state của AQS bằng lệnh CAS (tăng 16 bit đầu). Trên các máy chủ 64 lõi CPU, 100 luồng đọc cùng lúc chạy CAS vào CÙNG MỘT ô nhớ sẽ kích hoạt Cơn bão mất hiệu lực cache (Cache-Coherence Invalidation Storm): mỗi nhân CPU liên tục xóa sạch cache L1/L2 của các nhân khác qua đường bus CPU! StampedLock giải quyết triệt để vấn đề này qua cơ chế Đọc Lạc Quan (Optimistic Read via tryOptimisticRead()): đọc lạc quan HOÀN TOÀN KHÔNG ghi vào bộ nhớ và KHÔNG làm thay đổi bất kỳ biến khóa nào! Nó chỉ đọc một con số stamp 64-bit vào thanh ghi, đọc dữ liệu, rồi gọi validate(stamp). Nếu không có luồng ghi nào chen vào, việc đọc hoàn tất mà không phát sinh một chút lưu lượng bus hay xóa cache nào. Nếu có luồng ghi xen vào, validate() trả về false và code sẽ lùi về chế độ xin khóa đọc đầy đủ. Lý do không hỗ trợ Reentrancy: StampedLock không lưu Thread ID của luồng sở hữu, gọi lại chính nó sẽ tự gây deadlock. Lý do không có Condition: StampedLock không kế thừa interface Lock và không xây dựng hàng đợi condition.'
      },
      trapWarning: {
        en: 'StampedLock optimistic read reads fields WITHOUT memory barriers. Therefore, data consistency between fields is not guaranteed until validate(stamp) returns true! Always copy data to local variables before validation.',
        vi: 'Đọc lạc quan trong StampedLock không có rào cản bộ nhớ. Do đó tính nhất quán giữa các trường dữ liệu không được bảo đảm cho đến khi hàm validate(stamp) xác nhận thành công! Luôn copy dữ liệu ra biến cục bộ trước khi kiểm tra.'
      },
      proTip: {
        en: 'Always structure StampedLock code with the canonical idiom: long stamp = sl.tryOptimisticRead(); copyFields(); if (!sl.validate(stamp)) { stamp = sl.readLock(); try { copyFields(); } finally { sl.unlockRead(stamp); } }',
        vi: 'Luôn viết code StampedLock theo mẫu chuẩn: long stamp = sl.tryOptimisticRead(); copyFields(); if (!sl.validate(stamp)) { stamp = sl.readLock(); try { copyFields(); } finally { sl.unlockRead(stamp); } }'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'Fair ReentrantLock Latency Collapse & Unreleased Lock Leak Inventory Outage',
      vi: 'Sụp Đổ Hiệu Năng Do Khóa Fair ReentrantLock & Lỗi Quên Nhả Khóa Gây Đóng Băng Dữ Liệu'
    },
    businessContext: {
      en: 'A high-concurrency stadium ticketing platform sells 20,000 VIP concert seats during a flash sale with 15,000 concurrent buyers.',
      vi: 'Nền tảng bán vé sự kiện âm nhạc quy mô lớn mở bán 20,000 vé VIP trong đợt Flash Sale với 15,000 người mua đồng thời.'
    },
    problemDescription: {
      en: 'To prevent buyer starvation, developers instantiated a fair lock: private final ReentrantLock lock = new ReentrantLock(true). Under 800 concurrent purchasing threads, checkout throughput collapsed from 16,000 reservations/second to just 380/second! P99 latency surged from 6ms to 3,400ms. CPU analysis revealed that Fair Lock forces every contending thread to check hasQueuedPredecessors() and enqueue into the AQS CLH queue. Every single lock release required a kernel futex wakeup (15µs per context switch), creating massive Thread Convoying. Worse, an unexpected IllegalArgumentException thrown inside an untracked discount validator bypassed the lock.unlock() invocation because it was written outside a try-finally block, permanently locking the entire seat inventory and causing total checkout paralysis.',
      vi: 'Để tránh việc người mua đến trước bị đói tài nguyên, lập trình viên đã cấu hình khóa công bằng: private final ReentrantLock lock = new ReentrantLock(true). Khi có 800 luồng thanh toán đồng thời, thông lượng hệ thống sụp đổ từ 16,000 giao dịch/giây xuống chỉ còn 380/giây! Độ trễ P99 vọt từ 6ms lên tới 3,400ms. Phân tích CPU chỉ ra rằng Fair Lock bắt buộc mọi luồng phải kiểm tra hasQueuedPredecessors() và nối vào hàng đợi CLH. Mỗi lần nhả khóa đều phải gọi nhân OS để đánh thức luồng (tốn 15µs cho mỗi lần context switch), tạo ra hiệu ứng đoàn tàu kẹt cứng. Tệ hơn nữa, một ngoại lệ bất ngờ phát sinh trong hàm tính mã giảm giá đã nhảy qua lệnh lock.unlock() do không được bọc trong khối try-finally, khiến khóa bị treo vĩnh viễn và đóng băng toàn bộ kho vé.'
    },
    whyNaiveFails: {
      en: 'Increasing Tomcat worker threads from 200 to 1,000 made the bottleneck catastrophic: 1,000 threads queued up in the CLH linked list, consuming 1GB of thread stack memory and freezing the JVM in context-switch thrashing.',
      vi: 'Tăng số luồng worker từ 200 lên 1,000 càng làm thảm họa thêm trầm trọng: 1,000 luồng xếp hàng dài trong danh sách liên kết của AQS, tốn thêm 1GB RAM stack và làm đơ máy ảo vì bão chuyển đổi ngữ cảnh.'
    },
    coreSolution: {
      en: '1. Switch to a non-fair lock (new ReentrantLock(false) or default constructor). Non-fair locks allow running threads to "barge in" and acquire the lock via CAS without parking, leveraging CPU cache warmth and boosting throughput by 35x. 2. Strictly enforce the try-finally pattern immediately following lock acquisition to guarantee the lock is always released even under OutOfMemoryError. 3. Replace indefinite lock() with tryLock(timeout) to provide natural backpressure and fail-fast guarantees.',
      vi: '1. Đổi sang khóa Non-fair (new ReentrantLock(false) hoặc mặc định). Khóa Non-fair cho phép các luồng đang chạy trên CPU được chen ngang chiếm khóa bằng lệnh CAS mà không cần ngủ, tận dụng dữ liệu ấm trong CPU cache và tăng 35 lần thông lượng. 2. Bắt buộc áp dụng khối try-finally ngay lập tức sau lệnh lock để đảm bảo khóa luôn được nhả kể cả khi xảy ra lỗi nghiêm trọng. 3. Thay thế lock() vô hạn bằng tryLock(timeout) để thiết lập cơ chế quá hạn (fail-fast) chống kẹt luồng.'
    },
    productionCode: `// Production Resilient Seat Reservation Service using Non-Fair ReentrantLock
package com.ticketing.inventory;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

public class HighThroughputSeatReservationService {

    // 1. NON-FAIR LOCK: Enables thread barging, 35x higher throughput!
    // Never pass 'true' unless strictly mandated by non-starvation requirements.
    private final ReentrantLock inventoryLock = new ReentrantLock(false);
    private int availableSeats = 20000;

    public ReservationResult reserveSeat(long userId, int requestedSeats) throws InterruptedException {
        // 2. TIMED ACQUISITION: Natural backpressure, prevents infinite thread blockage
        boolean acquired = inventoryLock.tryLock(500, TimeUnit.MILLISECONDS);
        if (!acquired) {
            return ReservationResult.failed("SYSTEM_BUSY_RETRY");
        }

        // 3. STRICT TRY-FINALLY: Guarantees zero unreleased lock leaks!
        try {
            if (availableSeats < requestedSeats) {
                return ReservationResult.failed("SOLD_OUT");
            }

            // Critical Section execution
            availableSeats -= requestedSeats;
            long reservationCode = generateReservationCode(userId);
            return ReservationResult.success(reservationCode, availableSeats);

        } finally {
            // ALWAYS release the lock in the finally block!
            inventoryLock.unlock();
        }
    }

    private long generateReservationCode(long uid) {
        return System.currentTimeMillis() ^ uid;
    }

    public record ReservationResult(boolean success, String reason, long code, int remaining) {
        public static ReservationResult failed(String reason) {
            return new ReservationResult(false, reason, -1, 0);
        }
        public static ReservationResult success(long code, int remaining) {
            return new ReservationResult(true, "CONFIRMED", code, remaining);
        }
    }
}`,
    architectureImpact: {
      en: 'P99 reservation latency plummeted from 3,400ms down to 1.6ms; Checkout throughput surged from 380 req/s to 18,200 req/s (47x improvement); Zero unreleased lock deadlocks; All 20,000 tickets sold successfully without inventory divergence.',
      vi: 'Độ trễ P99 giảm từ 3,400ms xuống chỉ còn 1.6ms; Thông lượng đặt vé tăng vọt từ 380 req/s lên 18,200 req/s (tăng 47 lần); Triệt tiêu 100% nguy cơ rò rỉ khóa; Toàn bộ 20,000 vé được bán hết sạch trong 1.2 giây mà không hề bị sai lệch dữ liệu kho.'
    }
  }
};
