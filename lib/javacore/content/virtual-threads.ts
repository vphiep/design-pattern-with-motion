import type { JavaCoreTopic } from '../types';

export const virtualThreads: JavaCoreTopic = {
  id: 'virtual-threads',
  category: 'concurrency-juc',
  name: 'Java 21 Virtual Threads & Project Loom Internals',
  tagline: {
    en: 'M:N lightweight user-space fibers: Continuation stack freezing, work-stealing ForkJoinPool carrier schedulers, and carrier pinning hazards.',
    vi: 'Mô hình luồng M:N sợi nhẹ: Đóng băng stack bằng Continuation, bộ điều phối ForkJoinPool work-stealing và hiểm họa ghim luồng (Pinning).'
  },
  difficulty: 3,
  level: 'advanced',
  order: 14,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'Classical Java platform threads are 1:1 wrappers around operating system kernel threads. Each platform thread allocates a fixed 1MB off-heap stack and requires expensive kernel context switches. A JVM with 5,000 platform threads consumes 5GB of RAM purely for thread stacks, causing thread exhaustion under high-concurrency microservice workloads.',
      vi: 'Luồng nền tảng (Platform Thread) cổ điển trong Java là các lớp bọc 1:1 quanh luồng nhân hệ điều hành. Mỗi luồng cấp phát một stack cố định 1MB ngoài Heap và tiêu tốn chuyển đổi ngữ cảnh đắt đỏ ở tầng kernel. Một JVM chạy 5.000 luồng sẽ tốn tới 5GB RAM chỉ để lưu stack, dẫn đến cạn kiệt tài nguyên trong các hệ thống microservice chịu tải lớn.'
    },
    hardwareConstraint: {
      en: 'Modern servers can handle millions of concurrent network socket descriptors via Linux epoll or Windows IOCP, but operating system kernels cannot efficiently schedule millions of OS threads due to CPU scheduler runqueue limits and TLB cache invalidation overhead.',
      vi: 'Máy chủ hiện đại có thể xử lý hàng triệu kết nối mạng đồng thời qua epoll trên Linux hoặc IOCP trên Windows, nhưng nhân hệ điều hành không thể điều phối hàng triệu luồng OS cùng lúc do giới hạn của hàng đợi CPU scheduler và chi phí xóa bộ đệm TLB cache.'
    },
    fundamentalSolution: {
      en: 'Java 21 Virtual Threads (Project Loom) implement an M:N user-space fiber model: millions of lightweight Virtual Threads (~1KB memory footprint) are multiplexed across a small pool of Carrier OS Threads (defaulting to CPU core count). When a Virtual Thread encounters blocking I/O, HotSpot unmounts its stack into a Continuation in RAM, freeing the Carrier Thread to run other tasks.',
      vi: 'Virtual Threads trên Java 21 (Project Loom) triển khai mô hình sợi M:N ở tầng người dùng: hàng triệu Virtual Thread siêu nhẹ (~1KB bộ nhớ) được ghép kênh trên một số lượng nhỏ các Carrier OS Thread (mặc định bằng số CPU core). Khi gặp thao tác I/O chặn, HotSpot gỡ bỏ stack của nó vào một cấu trúc Continuation trong RAM, giải phóng Carrier Thread để xử lý luồng khác.'
    },
    math: {
      formula: 'Platform_Thread_Stack ≈ 1MB,   Virtual_Thread_Initial_Stack ≈ 1KB (1,000x lighter footprint)',
      description: {
        en: 'A standard 16GB server can host at most ~10,000 platform threads, but can effortlessly support 1,000,000+ active Virtual Threads simultaneously.',
        vi: 'Một máy chủ 16GB chỉ duy trì được tối đa ~10.000 platform thread, nhưng có thể tải mượt mà hơn 1.000.000 Virtual Thread cùng một lúc.'
      },
      timeComplexity: 'O(1) continuation mount / unmount inside JVM user-space',
      spaceComplexity: 'Dynamic growing stack chunks allocated on Java Heap (~1KB to start)',
      memoryOverheadFormula: 'Total Memory = (Num_Virtual_Threads × ~1KB) + (Num_Cores × 1MB Carrier Stack)'
    }
  },

  detailedTheory: {
    overview: {
      en: 'Project Loom fundamentally revolutionizes Java server architectures by restoring the simplicity of the synchronous "thread-per-request" programming model without the scalability bottleneck of operating system threads. By deeply integrating with the JVM runtime and standard java.net libraries, Virtual Threads transform blocking network calls into non-blocking continuation suspensions under the hood.',
      vi: 'Project Loom tạo ra cuộc cách mạng kiến trúc toàn diện trên Java khi mang lại sự đơn giản của mô hình lập trình đồng bộ "mỗi request một thread" truyền thống mà không bị giới hạn bởi số lượng luồng của hệ điều hành. Bằng cách tích hợp sâu vào JVM và thư viện java.net, Virtual Threads biến mọi thao tác I/O chặn thành cơ chế treo Continuation bất đồng bộ ngầm bên dưới.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The 1:1 OS Thread Bottleneck: Prior to Java 21, creating a new Thread() invoked pthread_create() at the OS kernel level. Each thread reserved 1MB of virtual memory (-Xss) for its call stack. To handle 50,000 concurrent web requests, developers were forced to abandon readable synchronous code and adopt complex reactive frameworks (WebFlux, RxJava). Virtual Threads bring 1,000,000x scalability back to clean, linear imperative Java code.',
        vi: '1. Nút Thắt Cổ Chai của Luồng 1:1 Hệ Điều Hành: Trước Java 21, mỗi lệnh new Thread() đều kích hoạt syscall pthread_create() của nhân OS. Mỗi luồng giữ cứng 1MB bộ nhớ ảo (-Xss) cho call stack. Để xử lý 50.000 kết nối đồng thời, lập trình viên buộc phải từ bỏ code đồng bộ dễ đọc để chuyển sang các thư viện Reactive phức tạp (WebFlux, RxJava). Virtual Threads mang lại khả năng mở rộng hàng triệu luồng cho code Java mệnh lệnh tuyến tính thuần túy.'
      },
      {
        en: '2. The Continuation Engine & Stack Freezing: Under the hood, a Virtual Thread wraps a jdk.internal.vm.Continuation. When a Virtual Thread blocks (e.g. Socket.read() or Thread.sleep()), the JVM executes Continuation.yield(): it freezes the current Java execution call frame, copies the stack frames into a StackChunk object on the Java Heap, and unmounts the Virtual Thread from its underlying Carrier Thread.',
        vi: '2. Cỗ Máy Continuation & Đóng Băng Stack: Bên dưới lớp vỏ, mỗi Virtual Thread bọc một cấu trúc jdk.internal.vm.Continuation. Khi Virtual Thread bị nghẽn (như đọc Socket hoặc gọi Thread.sleep()), JVM gọi lệnh Continuation.yield(): đóng băng toàn bộ khung thực thi hiện tại, sao chép các stack frame vào đối tượng StackChunk trên Heap, và tháo dỡ (unmount) Virtual Thread ra khỏi Carrier Thread.'
      },
      {
        en: '3. Carrier Threads & Work-Stealing ForkJoinPool: Virtual Threads do not run on thin air; they are executed by Carrier Threads. By default, HotSpot creates a dedicated ForkJoinPool with worker threads equal to Runtime.getRuntime().availableProcessors(). Carrier threads utilize work-stealing algorithms: when a carrier finishes its task or unmounts a suspended virtual thread, it steals pending ready-to-run virtual threads from other carrier queues.',
        vi: '3. Luồng Nền Carrier & Bộ Điều Phối ForkJoinPool: Virtual Thread không thể tự chạy trong không khí; chúng chạy nhờ các Carrier Thread (luồng OS thực thụ). Mặc định, HotSpot tạo một ForkJoinPool chuyên dụng với số worker thread bằng số CPU core vật lý. Các Carrier Thread áp dụng thuật toán trộm việc (Work-Stealing): khi một carrier hoàn thành việc hoặc vừa tháo dỡ một virtual thread bị nghẽn, nó sẽ sang hàng đợi khác để trộm các virtual thread sẵn sàng chạy.'
      },
      {
        en: '4. Non-Blocking I/O Integration via OS Epoll / IOCP: The Java networking stack (java.net.Socket, HttpClient, JDBC) was completely rewritten in Java 21. When a Virtual Thread calls read() on a socket with no data available, the socket registers a non-blocking poll event with the OS kernel (epoll on Linux, kqueue on macOS, IOCP on Windows) and yields its Continuation. When network data arrives, the OS notifies the JVM poller thread, which re-enqueues the Continuation into the ForkJoinPool to resume execution.',
        vi: '4. Tích Hợp I/O Bất Đồng Bộ qua OS Epoll / IOCP: Toàn bộ tầng mạng của Java (Socket, HttpClient, JDBC) đã được viết lại hoàn toàn trên Java 21. Khi Virtual Thread gọi read() trên một socket chưa có dữ liệu, socket sẽ đăng ký sự kiện thăm dò bất đồng bộ với nhân OS (epoll trên Linux, IOCP trên Windows) và yield Continuation. Khi dữ liệu mạng tới, OS báo về luồng poller của JVM để đẩy Continuation vào ForkJoinPool chạy tiếp.'
      },
      {
        en: '5. The Carrier Thread Pinning Hazard: There are two critical scenarios where a Virtual Thread CANNOT be unmounted: 1) Inside a synchronized block or method, and 2) Inside a native JNI method call. In these cases, the virtual thread is "pinned" to its carrier thread. If a pinned virtual thread performs blocking I/O, the underlying OS carrier thread is frozen! If all carrier threads become pinned, the entire JVM freezes. Solution: Replace synchronized with java.util.concurrent.locks.ReentrantLock.',
        vi: '5. Hiểm Họa Ghim Luồng (Carrier Thread Pinning): Có 2 tình huống chí mạng khiến Virtual Thread KHÔNG THỂ tháo dỡ: 1) Nằm bên trong khối hoặc phương thức synchronized, và 2) Nằm trong lệnh gọi thư viện native qua JNI. Lúc này, virtual thread bị "ghim" chặt vào carrier thread. Nếu luồng bị ghim thực hiện I/O chặn, luồng OS bên dưới sẽ bị đơ theo! Nếu toàn bộ carrier thread bị ghim hết, toàn bộ ứng dụng sẽ tê liệt. Giải pháp: Thay thế synchronized bằng ReentrantLock.'
      },
      {
        en: '6. ThreadLocals vs Scoped Values: Creating millions of Virtual Threads that each inherit large ThreadLocal maps causes massive heap memory bloat. Furthermore, ThreadLocals are mutable and have unbounded lifecycles. Java 21 introduces Scoped Values (JEP 446 / JEP 464): lightweight, immutable, scope-bounded data containers that are inherited efficiently across child virtual threads with zero memory duplication.',
        vi: '6. ThreadLocal vs Giá Trị Phạm Vi (Scoped Values): Khởi tạo hàng triệu Virtual Thread mà mỗi luồng đều kế thừa một bản đồ ThreadLocal lớn sẽ gây phình to bộ nhớ Heap khủng khiếp. Hơn nữa, ThreadLocal có thể bị sửa đổi và khó kiểm soát vòng đời. Java 21 giới thiệu Scoped Values: các vùng chứa dữ liệu bất biến, giới hạn phạm vi chặt chẽ và chia sẻ cực nhanh giữa các virtual thread con mà không tốn dung lượng RAM sao chép.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Pooling Virtual Threads via Thread Pools: A common beginner mistake is using Executors.newFixedThreadPool(100) with virtual threads. Virtual Threads are designed to be ephemeral: create them on-demand and let them die! Pooling virtual threads wastes memory and re-introduces the queue starvation bottlenecks Loom was created to destroy. Always use Executors.newVirtualThreadPerTaskExecutor().',
        vi: 'Bẫy Gom Bể (Pooling) Virtual Threads: Sai lầm phổ biến của lập trình viên là tạo thread pool cố định cho virtual thread (như newFixedThreadPool). Virtual Thread sinh ra là để dùng một lần rồi vứt bỏ: tạo ra theo yêu cầu và để GC thu hồi! Việc tạo pool cho virtual thread làm lãng phí RAM và kéo theo nút thắt cổ chai hàng đợi mà Loom đã mất công xóa bỏ. Luôn sử dụng Executors.newVirtualThreadPerTaskExecutor().'
      },
      {
        en: 'Carrier Pinning in Legacy Database JDBC Drivers: Old database connection pools and legacy drivers (e.g. older MySQL or Oracle JDBC drivers) heavily use synchronized around socket I/O. When running 1,000 virtual threads querying the database simultaneously, all carrier threads become pinned, causing severe HTTP request throughput degradation. Mitigation: Run with -Djdk.tracePinnedThreads=full to identify and eliminate pinned call stacks.',
        vi: 'Ghim Luồng trong Driver JDBC Cơ Sở Dữ Liệu Cũ: Các connection pool hoặc driver CSDL phiên bản cũ thường dùng synchronized bọc quanh thao tác đọc socket. Khi 1.000 virtual thread cùng truy vấn database, toàn bộ carrier thread bị ghim cứng, làm sụt giảm thảm hại thông lượng HTTP. Khắc phục: Chạy JVM với cờ -Djdk.tracePinnedThreads=full để phát hiện chính xác dòng code gây ghim luồng.'
      },
      {
        en: 'Unbounded Concurrency Overwhelming Downstream Resources: Because Virtual Threads allow dispatching 500,000 tasks effortlessly, naive code that fires 500,000 HTTP calls or database queries simultaneously will instantly exhaust downstream database connection pools, TCP ports, and third-party APIs. Mitigation: Control concurrency using java.util.concurrent.Semaphore instead of thread pool caps.',
        vi: 'Bùng Nổ Tải Làm Sập Hạ Tầng Phía Sau: Vì Virtual Thread cho phép bắn ra 500.000 tác vụ trong chớp mắt, đoạn code thiếu cẩn trọng gửi 500.000 truy vấn database hoặc HTTP call đồng thời sẽ đánh sập ngay lập tức database pool, cạn kiệt cổng TCP hoặc làm sập API bên thứ 3. Khắc phục: Luôn bọc điều phối tải bằng Semaphore thay vì cố tình giới hạn số luồng.'
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'Virtual Thread Multiplexing: Carrier ForkJoinPool & Continuation Heap Chunks',
      vi: 'Ghép Kênh Virtual Thread: Carrier ForkJoinPool & Ngăn Xếp Continuation trên Heap'
    },
    description: {
      en: 'Millions of Virtual Threads store their paused stack frames in Continuation StackChunk objects on the Java Heap, mounted and unmounted dynamically across N Carrier OS Threads.',
      vi: 'Hàng triệu Virtual Thread lưu trữ stack frame bị tạm dừng trong các đối tượng Continuation StackChunk trên Heap, được tháo lắp linh hoạt trên N luồng Carrier OS.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| JAVA 21 PROJECT LOOM M:N THREADING ARCHITECTURE                                                   |
+----------------------------------------------------------------------------------------------------+
| 1. VIRTUAL THREADS IN HEAP (Millions of lightweight ~1KB tasks):                                   |
|   [ VirtualThread #1 ]   [ VirtualThread #2 (BLOCKED ON I/O) ]   [ VirtualThread #3 ]              |
|          |                                |                               |                        |
|          | (Active on Carrier)            | (Continuation.yield() unmount)| (Waiting in Queue)     |
|          v                                v                               v                        |
+----------------------------------------------------------------------------------------------------+
| 2. FORKJOINPOOL CARRIER OS THREAD POOL (Fixed size = Runtime.getRuntime().availableProcessors()):  |
|   +-----------------------+  +-----------------------+  +-----------------------+                  |
|   | Carrier Thread #0     |  | Carrier Thread #1     |  | Carrier Thread #2     |                  |
|   | [ Running VT #1 ]     |  | [ Stealing VT #3 ]    |  | [ Idle / Polling ]    |                  |
|   +-----------------------+  +-----------------------+  +-----------------------+                  |
+----------------------------------------------------------------------------------------------------+
| 3. OS KERNEL THREADS (1:1 with CPU Physical Cores):                                                |
|   [ CPU Core #0 ]             [ CPU Core #1 ]             [ CPU Core #2 ]                          |
+----------------------------------------------------------------------------------------------------+
| 4. ASYNC I/O POLLER (OS epoll / kqueue / IOCP notifies completion -> wakes Continuation)           |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'virtual_thread_state', size: 'Atomic Int (4B)', description: { en: 'NEW, STARTED, RUNNABLE, RUNNING, PARKING, PARKED, PINNED, TERMINATED.', vi: 'NEW, STARTED, RUNNABLE, RUNNING, PARKING, PARKED, PINNED, TERMINATED.' } },
      { name: 'carrier_thread_ptr', size: '64-bit Reference', description: { en: 'Pointer to underlying active carrier thread when mounted; null when parked.', vi: 'Con trỏ tới luồng carrier đang chạy khi được mount; bằng null khi đang ngủ.' } },
      { name: 'continuation_stack', size: '~1KB to Dynamic', description: { en: 'Chunk of call frames preserved on Java Heap while thread is blocked on I/O.', vi: 'Khối khung gọi hàm được lưu trên Heap khi luồng bị nghẽn I/O.' } },
      { name: 'park_permit', size: 'Atomic Boolean', description: { en: 'Binary unpark permit managed via LockSupport primitives.', vi: 'Giấy phép đánh thức nhị phân quản lý qua LockSupport.' } }
    ]
  },

  steps: [
    {
      id: 'mount-carrier',
      title: { en: '1. Virtual Thread Mounts on Carrier OS Thread', vi: '1. Gắn (Mount) Virtual Thread vào Luồng Carrier OS' },
      phase: 'CARRIER_MOUNT',
      description: {
        en: 'The ForkJoinPool worker thread pulls the Virtual Thread from its run queue, mounts its Continuation, and begins executing Java bytecode instructions on the underlying CPU core.',
        vi: 'Worker thread của ForkJoinPool lấy Virtual Thread ra khỏi hàng đợi, gắn Continuation của nó vào và bắt đầu thực thi các lệnh bytecode trên CPU core thực tế.'
      },
      jvmRuntimeBehavior: {
        en: 'Carrier thread TLS points to current Virtual Thread. Stack execution begins.',
        vi: 'TLS của Carrier thread trỏ tới Virtual Thread hiện tại. Ngăn xếp bắt đầu chạy.'
      },
      javaCodeLineMatch: 'Thread.ofVirtual().start(() -> { /* task */ });'
    },
    {
      id: 'blocking-yield',
      title: { en: '2. Blocking I/O & Continuation Stack Freezing', vi: '2. Gặp I/O Chặn & Đóng Băng Stack Tháo Dỡ (Yield)' },
      phase: 'CONTINUATION_YIELD',
      description: {
        en: 'The Virtual Thread calls a blocking method (e.g. socket read, HTTP call). HotSpot detects that the socket is not ready, freezes the execution stack into a Heap Continuation, and unmounts the Virtual Thread. The Carrier Thread is immediately free to run other tasks!',
        vi: 'Virtual Thread gọi lệnh I/O chặn (như đọc socket, gọi HTTP). HotSpot phát hiện socket chưa có dữ liệu, lập tức đóng băng stack vào Continuation trên Heap và gỡ bỏ luồng ra. Luồng Carrier lập tức rảnh tay để chạy việc khác!'
      },
      jvmRuntimeBehavior: {
        en: 'Zero OS thread sleep. Socket registered in epoll poller; Carrier thread returns to pool.',
        vi: 'Không hề làm ngủ luồng OS. Socket được đăng ký vào epoll poller; Carrier thread quay lại pool.'
      },
      javaCodeLineMatch: 'HttpResponse<String> response = httpClient.send(request, ...);'
    },
    {
      id: 'i-o-resume',
      title: { en: '3. Epoll Event Wakes Continuation on Any Carrier', vi: '3. Sự Kiện Epoll Đánh Thức & Tiếp Tục Chạy trên Carrier Khác' },
      phase: 'ASYNC_WAKE_RESUME',
      description: {
        en: 'When network data arrives, the OS kernel notifies the JVM epoll thread. The Virtual Thread is marked READY and re-enqueued. Any available Carrier Thread mounts the Continuation, restores the stack frames, and resumes execution seamlessly.',
        vi: 'Khi dữ liệu mạng tới, nhân OS báo về luồng epoll của JVM. Virtual Thread được chuyển sang READY và đưa vào hàng đợi. Bất kỳ Carrier Thread nào rảnh sẽ mount lại Continuation, khôi phục stack và chạy tiếp liền mạch.'
      },
      jvmRuntimeBehavior: {
        en: 'Transparent resumption. Local variables and call stacks fully restored.',
        vi: 'Phục hồi trong suốt. Toàn bộ biến cục bộ và call stack được khôi phục nguyên vẹn.'
      },
      javaCodeLineMatch: 'return parseResponse(response.body());'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Oracle HotSpot JVM 21+',
      implementationName: 'Project Loom Virtual Threads & Epoll Poller',
      keyMechanism: {
        en: 'Replaces OS thread blocking with lightweight Continuation.yield(). Features dedicated epoll/kqueue event loops and work-stealing ForkJoinPool schedulers.',
        vi: 'Thay thế việc ngủ luồng OS bằng cơ chế Continuation.yield() siêu nhẹ. Tích hợp vòng lặp sự kiện epoll/kqueue và bộ điều phối ForkJoinPool trộm việc.'
      },
      defaultFlags: '-Djdk.virtualThreadScheduler.parallelism=N -Djdk.tracePinnedThreads=full',
      architectureNote: {
        en: 'Parallelism defaults to available CPU cores. TracePinnedThreads flag prints exact stack traces when carrier pinning occurs.',
        vi: 'Parallelism mặc định bằng số CPU core. Cờ TracePinnedThreads in ra chi tiết stack trace khi có luồng bị ghim.'
      }
    },
    {
      jvmEngine: 'GraalVM Native Image 21+',
      implementationName: 'SubstrateVM Virtual Thread Runtime',
      keyMechanism: {
        en: 'AOT compiles Loom Continuation primitives directly into native platform assembly, enabling sub-second container cold starts with millions of virtual threads.',
        vi: 'Biên dịch AOT các cơ chế Continuation trực tiếp thành mã máy, giúp container khởi động tức thì với khả năng chứa hàng triệu virtual thread.'
      },
      defaultFlags: '-H:+UnlockExperimentalVMOptions -H:+SupportVirtualThreads',
      architectureNote: {
        en: 'Zero JIT warm-up penalty for high-throughput cloud-native serverless deployments.',
        vi: 'Không tốn thời gian warm-up của JIT cho các ứng dụng serverless chịu tải cao trên đám mây.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Million-scale concurrency on standard server hardware without reactive framework complexity.', vi: 'Khả năng chịu tải hàng triệu kết nối trên máy chủ tiêu chuẩn mà không cần sự phức tạp của Reactive framework.' },
      { en: 'Preserves traditional synchronous programming, complete call stack traces, and standard debuggers.', vi: 'Bảo toàn phong cách code đồng bộ truyền thống, stack trace đầy đủ và dùng được mọi công cụ debug chuẩn.' }
    ],
    cons: [
      { en: 'Carrier Pinning risk when interacting with synchronized blocks or native C/C++ JNI libraries.', vi: 'Nguy cơ ghim luồng (Carrier Pinning) khi gọi vào khối synchronized hoặc thư viện C/C++ native qua JNI.' },
      { en: 'Not suited for CPU-bound computation tasks (video encoding, crypto) where OS cores remain 100% occupied.', vi: 'Không phù hợp cho các tác vụ nặng về tính toán CPU (mã hóa video, crypto) nơi các CPU core luôn bị chiếm dụng 100%.' }
    ],
    memoryFootprint: {
      en: 'Extremely Low: ~1KB initial allocation per virtual thread vs 1MB for classical OS platform threads.',
      vi: 'Cực kỳ thấp: Chỉ ~1KB bộ nhớ ban đầu cho mỗi virtual thread so với 1MB của platform thread.'
    },
    jvmSpecificationGuarantee: {
      en: 'Thread specification compliance: Virtual threads implement java.lang.Thread and seamlessly run existing libraries.',
      vi: 'Tuân thủ toàn diện đặc tả Thread: Virtual Thread kế thừa java.lang.Thread và chạy được mọi thư viện hiện có.'
    }
  },

  javaCode: `package com.enterprise.jvm.loom;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Pure Java 21 Educational Masterclass: Virtual Threads & Carrier Pinning
 * Demonstrates:
 *  1. Millions of concurrent tasks using Executors.newVirtualThreadPerTaskExecutor()
 *  2. Non-blocking I/O with automatic Continuation unmounting
 *  3. Replacing synchronized with ReentrantLock to prevent Carrier Thread Pinning!
 */
public class VirtualThreadsDemo {

    // SAFE FOR VIRTUAL THREADS: ReentrantLock unmounts cleanly without carrier pinning!
    private static final ReentrantLock CLEAN_LOCK = new ReentrantLock();

    // Semaphore controls concurrency to downstream services (replaces artificial thread pool limits)
    private static final Semaphore OUTBOUND_RATE_LIMITER = new Semaphore(50);

    public static void main(String[] args) throws Exception {
        System.out.println("=== JAVA 21 PROJECT LOOM VIRTUAL THREADS MASTERCLASS ===");

        long startTime = System.currentTimeMillis();
        int totalRequests = 10_000;

        // Structured task executor: creates lightweight virtual thread per task!
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < totalRequests; i++) {
                final int taskId = i;
                executor.submit(() -> executeSimulatedHttpRequest(taskId));
            }
        } // Auto-closes and waits for all 10,000 virtual threads to complete!

        long duration = System.currentTimeMillis() - startTime;
        System.out.printf("Finished %d simulated I/O tasks in %d ms!%n", totalRequests, duration);
    }

    private static void executeSimulatedHttpRequest(int taskId) {
        try {
            OUTBOUND_RATE_LIMITER.acquire(); // Bounded concurrency protection

            CLEAN_LOCK.lock(); // Clean JUC Lock: Carrier thread will NOT be pinned!
            try {
                // Simulated blocking network latency (50ms)
                // HotSpot freezes Continuation stack and frees Carrier OS thread!
                Thread.sleep(50);
            } finally {
                CLEAN_LOCK.unlock();
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            OUTBOUND_RATE_LIMITER.release();
        }
    }
}`,

  jvmFlagsCode: `# ===================================================================
# Java 21 Flags to Monitor Virtual Threads and Detect Carrier Pinning
# ===================================================================
# Prints stack trace whenever a Virtual Thread is pinned to its carrier:
-Djdk.tracePinnedThreads=full

# Tune the underlying ForkJoinPool Carrier thread count:
-Djdk.virtualThreadScheduler.parallelism=16
-Djdk.virtualThreadScheduler.maxPoolSize=256

# JDK Flight Recorder (JFR) profiling for Virtual Threads:
-XX:StartFlightRecording=filename=loom.jfr,settings=profile.jfc,dumponexit=true

# Inspect running virtual threads via jcmd:
jcmd <PID> Thread.dump_to_file -format=json virtual_threads.json`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c com.enterprise.jvm.loom.VirtualThreadsDemo
public static void main(java.lang.String[]) throws java.lang.Exception;
  Code:
   0: invokestatic  #7   // Method java/util/concurrent/Executors.newVirtualThreadPerTaskExecutor:()Ljava/util/concurrent/ExecutorService;
   3: astore_1
   4: iconst_0
   5: istore_3
   6: iload_3
   7: ldc           #13  // int 10000
   9: if_icmpge     34
  12: aload_1
  13: iload_3
  14: invokedynamic #15, 0 // InvokeDynamic #0:run:(I)Ljava/lang/Runnable; (Virtual Thread Lambda)
  19: invokeinterface #19, 2 // InterfaceMethod java/util/concurrent/ExecutorService.submit:(Ljava/lang/Runnable;)Ljava/util/concurrent/Future;
  24: pop
  25: iinc          3, 1
  28: goto          6
  31: aload_1
  32: invokeinterface #25, 1 // InterfaceMethod java/lang/AutoCloseable.close:()V
  37: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What is a Virtual Thread in Java 21, and how does it differ from a Platform Thread?',
        vi: 'Virtual Thread trong Java 21 là gì và khác gì so với Platform Thread truyền thống?'
      },
      answer: {
        en: 'A Platform Thread is a 1:1 wrapper around an operating system kernel thread. It consumes 1MB of private OS stack memory and incurs expensive OS context switching (~2us). Java applications are typically capped at 3,000 to 5,000 platform threads before running out of RAM. A Virtual Thread (Project Loom) is a lightweight user-mode thread managed directly by the JVM. It consumes only ~250B to 1KB on the Java Heap, has dynamic resizing stacks, and allows running MILLIONS of concurrent threads simultaneously on a single standard server.',
        vi: 'Platform Thread là luồng truyền thống gắn tỉ lệ 1:1 với luồng nhân của hệ điều hành. Mỗi luồng ngốn 1MB stack RAM và tốn chi phí context switch của OS (~2us). Hệ thống thường bị giới hạn ở mức vài ngàn luồng là cạn RAM. Virtual Thread (Project Loom) là luồng siêu nhẹ chạy ở user-mode do chính JVM quản lý. Mỗi luồng chỉ tốn từ 250 byte đến 1KB trên Heap, có stack co giãn linh hoạt và cho phép một server thông thường chạy HÀNG TRIỆU luồng đồng thời mà không hề quá tải.'
      },
      trapWarning: {
        en: 'Virtual threads do NOT make CPU-bound computations faster! They are designed specifically for high-throughput concurrent I/O-bound workloads (HTTP calls, DB queries, file reads).',
        vi: 'Virtual Thread KHÔNG làm tác vụ tính toán CPU-bound chạy nhanh hơn! Chúng được thiết kế chuyên biệt để giải quyết bài toán thông lượng cho các tác vụ I/O-bound (gọi HTTP, query DB, đọc file).'
      },
      proTip: {
        en: 'Virtual threads revive the clean, synchronous "Thread-Per-Request" programming style, completely eliminating the mental complexity of reactive frameworks (RxJava, WebFlux).',
        vi: 'Virtual Thread hồi sinh phong cách lập trình đồng bộ "Thread-Per-Request" kinh điển, xóa bỏ hoàn toàn sự phức tạp hại não của các framework lập trình phản ứng (WebFlux, RxJava).'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What is Thread Pinning in Virtual Threads, and how do you diagnose and fix it?',
        vi: 'Hiện tượng Thread Pinning trong Virtual Threads là gì, làm sao phát hiện và khắc phục?'
      },
      answer: {
        en: 'Thread Pinning occurs when a Virtual Thread executes blocking I/O while "pinned" to its underlying Carrier OS thread, preventing the JVM from unmounting the virtual thread. This happens in two scenarios: 1. Inside a synchronized block or method. 2. Inside a native JNI call. When pinned, the underlying OS carrier thread remains blocked, destroying throughput. Fix: Replace synchronized blocks with java.util.concurrent.locks.ReentrantLock, which fully supports virtual thread unmounting during blocking I/O.',
        vi: 'Thread Pinning (Ghim luồng) xảy ra khi một Virtual Thread thực hiện tác vụ I/O chặn trong khi bị "ghim cứng" vào luồng Carrier OS bên dưới, khiến JVM không thể tháo rời (unmount) luồng ra được. Có 2 nguyên nhân gây ra: 1. Đang nằm trong khối synchronized. 2. Đang thực thi mã C/C++ JNI. Khi bị ghim, luồng Carrier của OS bị treo theo làm sập thông lượng. Cách khắc phục: Thay thế toàn bộ khối synchronized bằng ReentrantLock, vốn hỗ trợ hoàn hảo việc unmount Virtual Thread khi gặp I/O.'
      },
      trapWarning: {
        en: 'Diagnose pinning in production using the JVM flag: -Djdk.tracePinnedThreads=full, which prints a full stack trace every time a virtual thread pins its carrier.',
        vi: 'Cách chẩn đoán lỗi pinning trên production: Bật cờ JVM -Djdk.tracePinnedThreads=full để in ra toàn bộ stack trace mỗi khi có một virtual thread làm ghim luồng carrier.'
      },
      proTip: {
        en: 'Point out that major open-source libraries (Spring Framework 6, Tomcat 10, JDBC drivers) have systematically replaced synchronized with ReentrantLock to be 100% Virtual Thread friendly.',
        vi: 'Nhắc đến việc toàn bộ hệ sinh thái Spring 6, Tomcat 10, HikariCP đã chủ động thay thế synchronized bằng ReentrantLock để tương thích 100% với Virtual Threads.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'Explain Continuation and Carrier Thread multiplexing under the hood in Project Loom.',
        vi: 'Giải thích cơ chế Continuation và ghép kênh Carrier Thread tầng sâu trong Project Loom.'
      },
      answer: {
        en: 'Project Loom is built on two core HotSpot primitives: Continuations and Carrier Threads. A Carrier Thread is an ordinary OS thread in a dedicated ForkJoinPool (size equal to CPU cores). A Virtual Thread is wrapped in a Continuation: an executable unit of execution that can pause (yield) and resume. Execution physics: 1. Mount: Virtual thread is assigned to an idle Carrier thread. 2. Freeze: When a blocking operation (Socket.read()) is reached, the JVM intercepts it via non-blocking epoll/kqueue. The Continuation yields: its stack frames are copied from the carrier stack into a compact byte array on the Java Heap, and the Carrier thread is immediately freed to run other tasks! 3. Unpark & Steal: When epoll signals data is ready, the Continuation is enqueued back into the ForkJoinPool. Any available Carrier thread mounts it, copies the stack frames back, and execution resumes seamlessly!',
        vi: 'Project Loom xây dựng trên 2 nền tảng: Continuation và Carrier Thread. Carrier Thread là luồng OS bình thường trong một ForkJoinPool chuyên biệt (kích thước bằng số CPU). Virtual Thread được bọc trong một Continuation: đơn vị có thể tạm dừng (yield) và chạy tiếp. Cơ chế vật lý: 1. Mount: Virtual Thread được gán vào 1 luồng Carrier đang rảnh. 2. Freeze: Khi gặp lệnh chặn (như Socket.read()), JVM chặn lại qua epoll của Linux. Continuation thực hiện yield: các stack frame được sao chép từ ngăn xếp Carrier sang một mảng byte nhỏ trên Java Heap, và luồng Carrier lập tức được giải phóng để chạy tác vụ khác! 3. Unpark & Steal: Khi mạng có dữ liệu, Continuation được đẩy lại vào ForkJoinPool. Bất kỳ luồng Carrier nào đang rảnh sẽ nhận lại, nạp lại stack và tiếp tục chạy mượt mà!'
      },
      trapWarning: {
        en: 'Do not use ThreadPools with Virtual Threads! Calling Executors.newFixedThreadPool(100, virtualThreadFactory) is an anti-pattern. Always use Executors.newVirtualThreadPerTaskExecutor() or Thread.ofVirtual().start().',
        vi: 'Tuyệt đối KHÔNG tạo ThreadPool cho Virtual Threads! Việc gọi newFixedThreadPool với Virtual Thread là sai lầm kiến trúc. Luôn dùng Executors.newVirtualThreadPerTaskExecutor() để tạo luồng riêng cho từng task.'
      },
      proTip: {
        en: 'Explain ThreadLocal overhead: Because virtual threads can exist in millions, avoid putting heavy objects inside ThreadLocal. Use Java 21 Scoped Values (JEP 446) for lightweight, immutable context passing across virtual threads.',
        vi: 'Cảnh báo về ThreadLocal: Vì có hàng triệu virtual threads, không bao giờ nhét đối tượng nặng vào ThreadLocal. Hãy dùng Scoped Values (JEP 446) trong Java 21 để truyền context bất biến, an toàn và tốn ít RAM.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'OS Thread Starvation & Memory Collapse in High-Concurrency Microservice Gateways',
      vi: 'Hàng Ngàn Request Bị Treo Cứng Do Chạm Giới Hạn Luồng Hệ Điều Hành OS Thread Starvation'
    },
    businessContext: {
      en: 'An enterprise API Gateway integrates 20 downstream microservices. Each client request aggregates responses by sequentially calling 4 downstream HTTP endpoints, averaging 150ms of network I/O wait time per call.',
      vi: 'Một API Gateway doanh nghiệp tích hợp 20 microservice nội bộ. Mỗi request của người dùng cần tổng hợp dữ liệu từ 4 API khác nhau, trung bình mất 150ms chờ mạng cho mỗi lần gọi.'
    },
    problemDescription: {
      en: 'Under traditional Java Platform Threads, each thread maps 1:1 to a Linux Kernel OS thread, reserving 1MB of private native memory stack space. When traffic surges to 12,000 concurrent requests, the system attempts to allocate 12,000 OS threads = 12GB of native RAM solely to hold threads idle in sleep/wait states! Once the operating system process limit (ulimit -u) is exceeded, the JVM throws the fatal "java.lang.OutOfMemoryError: unable to create native thread", crashing the gateway completely. Furthermore, context-switching 12,000 OS threads burns 45% of total server CPU capacity in kernel space thrashing.',
      vi: 'Với mô hình luồng truyền thống (Platform Threads), mỗi luồng Java tương ứng 1:1 với một luồng hệ điều hành nhân Linux, ngốn 1MB bộ nhớ Stack riêng biệt. Khi lưu lượng truy cập vọt lên 12.000 request đồng thời, hệ thống cần cấp phát 12.000 luồng OS = 12GB RAM chỉ để... giữ các luồng đứng chờ phản hồi mạng! Khi vượt quá giới hạn hệ điều hành (ulimit -u), máy ảo Java ném ra lỗi tử thần "java.lang.OutOfMemoryError: unable to create native thread", làm sập hoàn toàn API Gateway. Không những thế, việc chuyển ngữ cảnh (Context Switching) giữa 12.000 luồng OS đốt cháy tới 45% năng lực CPU máy chủ chỉ để kernel điều phối.'
    },
    whyNaiveFails: {
      en: 'Reactive programming (WebFlux/Project Reactor) solves this with non-blocking event loops, but at the cost of catastrophic code complexity: unreadable stack traces, loss of ThreadLocal security contexts, and completely rewritten programming paradigms.',
      vi: 'Mô hình lập trình phản ứng (Reactive WebFlux) giải quyết được luồng bằng Event Loop, nhưng cái giá phải trả là cực kỳ đắt đỏ: mã nguồn spaghetti khó đọc, mất toàn bộ stack trace chuẩn khi debug, mất ThreadLocal security context và buộc phải đập đi xây lại toàn bộ codebase.'
    },
    coreSolution: {
      en: '1. Java 21 Project Loom Virtual Threads: Enable virtual threads in Spring Boot 3.2+ (spring.threads.virtual.enabled=true). Millions of virtual threads run in user space, each costing under 1KB of Heap memory.\n2. Non-blocking Continuation Unmounting: When a virtual thread calls HttpClient.send() or Thread.sleep(), HotSpot intercepts the blocking call via Linux epoll. The virtual thread\'s Continuation yields: its lightweight stack frames freeze onto Heap, and the underlying Carrier OS Thread is immediately released to execute other user requests!\n3. Elimination of Thread Pooling: Discard thread pools entirely—instantiate a brand-new virtual thread per request via Executors.newVirtualThreadPerTaskExecutor().\n4. Pinning Defense: Replace old synchronized blocks with ReentrantLock to ensure carrier threads never get pinned to the operating system.',
      vi: '1. Virtual Threads Java 21: Kích hoạt Virtual Threads trên Spring Boot 3.2+ (spring.threads.virtual.enabled=true). Hàng triệu Virtual Threads được quản lý hoàn toàn ở tầng user-space, mỗi luồng chỉ tốn chưa tới 1KB bộ nhớ Heap.\n2. Cơ Chế Treo Continuation Phi Khóa: Khi Virtual Thread gọi HttpClient.send() hoặc Thread.sleep(), JVM chặn lệnh lại qua Linux epoll. Continuation của nó lập tức "đóng băng" (yield) ngăn xếp lên Heap, giải phóng luồng Carrier OS bên dưới để phục vụ request khác!\n3. Khai Tử ThreadPool: Xóa bỏ hoàn toàn khái niệm pool luồng—tạo mới một Virtual Thread riêng biệt cho mỗi task qua Executors.newVirtualThreadPerTaskExecutor().\n4. Chống Pinning: Thay thế toàn bộ synchronized bằng ReentrantLock để luồng Carrier không bao giờ bị "ghim" dính chặt vào OS.'
    },
    productionCode: `// Spring Boot 3.2+ Production Virtual Thread Gateway Configuration
@Configuration
public class LoomGatewayConfig {

    // Simple, clean imperative blocking code running with millions of virtual threads!
    @Bean
    public RestClient restClient() {
        return RestClient.builder()
            .requestFactory(new JdkClientHttpRequestFactory(
                HttpClient.newBuilder()
                    .executor(Executors.newVirtualThreadPerTaskExecutor()) // Loom powered!
                    .connectTimeout(Duration.ofSeconds(2))
                    .build()
            ))
            .build();
    }
}

// application.properties:
// spring.threads.virtual.enabled=true
// server.tomcat.threads.max=200 # Unused when virtual threads are enabled!`,
    architectureImpact: {
      en: 'API Gateway successfully sustained 150,000 concurrent active connections on a modest 4-core, 4GB RAM server. Memory consumption plummeted by 88%. CPU Context-Switch overhead dropped from 45% down to under 1.5%.',
      vi: 'API Gateway chịu tải mượt mà 150.000 kết nối đồng thời trên một máy chủ khiêm tốn chỉ 4-core và 4GB RAM. Mức tiêu thụ bộ nhớ giảm 88%. Chi phí chuyển ngữ cảnh CPU giảm ngoạn mục từ 45% xuống dưới 1.5%.'
    }
  }
};
