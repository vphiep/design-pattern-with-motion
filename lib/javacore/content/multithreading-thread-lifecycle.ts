import type { JavaCoreTopic } from '../types';

export const multithreadingThreadLifecycleTopic: JavaCoreTopic = {
  id: 'multithreading-thread-lifecycle',
  category: 'concurrency-juc',
  name: 'Process vs Thread, Thread Lifecycle & Runnable/Callable',
  tagline: {
    en: 'Operating system execution physics: Process address spaces vs Shared-Heap Threads, 6 JVM Thread States, Runnable vs Callable<T>, and sleep() vs wait().',
    vi: 'Cơ chế thực thi hệ điều hành: Không gian địa chỉ Process vs Luồng chia sẻ Heap, 6 trạng thái vòng đời luồng, Runnable vs Callable<T> và sleep() vs wait().'
  },
  difficulty: 1,
  level: 'basic',
  order: 8,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      en: 'Modern multi-core processors execute billions of instructions simultaneously. Developers building concurrent backend services face insidious deadlocks, CPU thrashing, and frozen applications if they fail to understand the operating system process-thread boundary, the 6 discrete JVM thread lifecycle states, and the critical distinction between holding a lock during sleep() versus releasing it during wait().',
      vi: 'Bộ vi xử lý đa nhân hiện đại thực thi hàng tỷ chỉ lệnh đồng thời. Lập trình viên xây dựng hệ thống phân tán sẽ gặp phải các lỗi deadlock bí ẩn, thắt nút cổ chai CPU và ứng dụng bị đơ cứng nếu không nắm rõ ranh giới giữa Tiến trình và Luồng, 6 trạng thái vòng đời luồng và sự khác biệt sống còn giữa việc giữ khóa khi sleep() so với nhả khóa khi wait().'
    },
    hardwareConstraint: {
      en: 'Operating systems switch threads via Kernel Context Switches. Every traditional platform thread maps 1:1 to an OS kernel thread requiring a 1MB private stack, switching CPU register states, and flushing TLB/L1 caches. Context switching takes ~1,500ns to 3,000ns of pure CPU waste. Understanding thread states is critical to prevent thread starvation and excessive context switching.',
      vi: 'Hệ điều hành chuyển đổi luồng qua cơ chế Kernel Context Switch. Mỗi luồng truyền thống gắn 1:1 với một luồng nhân OS, ngốn 1MB stack riêng, tráo đổi thanh ghi CPU và xóa cache TLB/L1. Một lần context switch tiêu tốn từ 1,500ns đến 3,000ns thời gian chết của CPU. Nắm vững trạng thái luồng là điều kiện tiên quyết để tránh nghẽn luồng và lãng phí chu kỳ xung nhịp.'
    },
    fundamentalSolution: {
      en: 'A Process is an isolated OS execution container with its own private virtual memory space; a Thread is a lightweight dispatch unit sharing the process Heap and Metaspace while maintaining its own private Stack and Program Counter (PC). Java maps thread lifecycles into 6 distinct states (java.lang.Thread.State): NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, and TERMINATED. Runnable defines fire-and-forget void execution; Callable<V> returns values and propagates checked exceptions through Future<V>.',
      vi: 'Tiến trình (Process) là không gian thực thi cô lập có bộ nhớ ảo riêng; Luồng (Thread) là đơn vị thực thi gọn nhẹ chia sẻ chung Heap và Metaspace của tiến trình nhưng sở hữu Stack Frame và thanh ghi PC riêng. Java quản lý vòng đời luồng qua 6 trạng thái: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING và TERMINATED. Runnable phù hợp cho tác vụ không trả về kết quả; Callable<V> cho phép trả về giá trị và ném ngoại lệ kiểm tra qua Future<V>.'
    },
    math: {
      formula: 'Thread_States = { NEW, RUNNABLE (Ready | Running), BLOCKED (Monitor Wait), WAITING, TIMED_WAITING, TERMINATED }',
      description: {
        en: 'A thread enters BLOCKED exclusively when waiting to acquire an intrinsic synchronized object monitor. A thread enters WAITING when calling Object.wait(), Thread.join(), or LockSupport.park().',
        vi: 'Luồng chuyển sang BLOCKED duy nhất khi phải chờ để chiếm khóa synchronized. Luồng chuyển sang WAITING khi gọi Object.wait(), Thread.join() hoặc LockSupport.park().'
      },
      timeComplexity: 'O(1) thread state transition; ~2us OS kernel context switch latency per thread handoff',
      spaceComplexity: '1MB default native OS Stack (-Xss1m) per platform thread; Virtual threads require only ~250B-1KB on Heap',
      memoryOverheadFormula: 'Max Platform Threads = (Total Physical RAM - OS RAM - JVM Heap) / -Xss'
    }
  },

  memoryLayout: {
    title: {
      en: 'Physical Memory Architecture: Process Isolation vs Multi-Thread Shared Memory',
      vi: 'Kiến Trúc Ô Nhớ: Cô Lập Tiến Trình (Process) vs Bộ Nhớ Chia Sẻ Của Đa Luồng (Thread)'
    },
    description: {
      en: 'Processes cannot access each other\'s memory directly (requiring OS pipes/sockets). Threads within the same JVM process share the entire Heap and Metaspace, but maintain their own independent Stack Frames.',
      vi: 'Các tiến trình không thể đọc ô nhớ của nhau (buộc phải dùng IPC/Socket). Các luồng trong cùng 1 JVM chia sẻ toàn bộ Heap và Metaspace nhưng sở hữu ngăn xếp Stack Frame độc lập.'
    },
    asciiDiagram: `
+-----------------------------------------------------------------------------------------+
|                               OS PROCESS (JVM Instance PID: 4920)                       |
|  +-----------------------------------------------------------------------------------+  |
|  | SHARED MEMORY: Java Heap (Objects, Arrays) & Metaspace (Classes, Methods)        |  |
|  +-----------------------------------------------------------------------------------+  |
|                                            |                                            |
|                  +-------------------------+-------------------------+                  |
|                  v                                                   v                  |
|  +----------------------------------+             +----------------------------------+  |
|  | THREAD 1: (Worker-1)             |             | THREAD 2: (Worker-2)             |  |
|  | - Private Thread Stack (1MB)     |             | - Private Thread Stack (1MB)     |  |
|  |   [Stack Frame: computeTax()]    |             |   [Stack Frame: processOrder()]  |  |
|  |   [Stack Frame: run()]           |             |   [Stack Frame: run()]           |  |
|  | - Program Counter (PC) Register  |             | - Program Counter (PC) Register  |  |
|  +----------------------------------+             +----------------------------------+  |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'Thread Stack Size (-Xss)', size: '1 MB (Default)', description: { en: 'Dedicated OS memory allocated per platform thread for local variables and call frames.', vi: 'Vùng nhớ OS cấp phát riêng cho từng luồng nền tảng để lưu stack frame.' } },
      { name: 'PC Register', size: 'Native Pointer', description: { en: 'Hardware/JVM register tracking currently executing bytecode instruction address.', vi: 'Thanh ghi lưu địa chỉ bytecode đang được thực thi của luồng.' } },
      { name: 'Native Thread Handle', size: '8 Bytes', description: { en: 'OS kernel pthread_t identifier linking JVM thread to kernel scheduler.', vi: 'Định danh pthread_t liên kết luồng JVM với bộ lập lịch của nhân OS.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Multithreading in Java bridges the high-level JVM execution model with low-level operating system kernel primitives. Understanding how Java thread states (NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED) map to OS scheduler states, together with the physical cost of CPU context switching and stack allocation, is fundamental for high-concurrency architecture.',
      vi: 'Đa luồng trong Java là cầu nối giữa mô hình thực thi cấp cao của JVM và các cơ chế nguyên thủy của nhân hệ điều hành. Việc thấu hiểu cách 6 trạng thái luồng của JVM (NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED) ánh xạ xuống bộ lập lịch của OS, cùng với chi phí vật lý của việc chuyển đổi ngữ cảnh CPU và cấp phát bộ nhớ Stack, là nền tảng cốt lõi của kiến trúc tải cao.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Operating System Process vs Kernel Thread vs JVM Thread (Baeldung & freeCodeCamp): An OS Process is an isolated execution environment granted its own virtual address space, Page Tables, file descriptor table, and security context. Processes cannot inspect or corrupt each other\'s memory without explicit Inter-Process Communication (IPC, UNIX domain sockets, shared memory). A Thread is the smallest dispatchable unit of execution within a process. All threads inside the same JVM instance share the process Virtual Address Space, including the Java Heap, Metaspace, and native heap. However, each thread retains its own private Program Counter (PC), CPU register state, and Thread Stack (-Xss, 1MB default). A Process context switch (~5-10µs) requires the OS kernel to flush the Translation Lookaside Buffer (TLB) and reload hardware Page Tables; a Thread context switch (~1.5-2.5µs) is 4x cheaper because virtual memory mappings remain untouched.',
        vi: '1. Tiến trình Hệ điều hành vs Luồng nhân OS vs Luồng JVM (Baeldung & freeCodeCamp): Tiến trình (Process) là môi trường thực thi cô lập được cấp không gian địa chỉ ảo riêng, bảng phân trang (Page Tables), bảng mô tả file và ngữ cảnh bảo mật. Các tiến trình không thể đọc trộm hay phá hoại bộ nhớ của nhau nếu không thông qua giao tiếp liên tiến trình (IPC, Unix socket, Shared Memory). Luồng (Thread) là đơn vị thực thi nhỏ nhất được bộ lập lịch OS điều phối. Mọi luồng trong cùng 1 máy ảo JVM dùng chung không gian địa chỉ ảo gồm Java Heap, Metaspace và Native memory. Tuy nhiên, mỗi luồng giữ riêng Program Counter (PC), thanh ghi CPU và Stack (-Xss, mặc định 1MB). Một lần chuyển đổi ngữ cảnh tiến trình (5-10µs) buộc OS phải xóa sạch bảng đệm TLB và nạp lại bảng Page Table; trong khi chuyển đổi luồng (1.5-2.5µs) nhanh hơn 4 lần do giữ nguyên ánh xạ bộ nhớ ảo.'
      },
      {
        en: '2. The 6 JVM Thread States & OS Scheduler Lifecycle Transitions (Baeldung & GeeksforGeeks): Java formalizes thread lifecycles into 6 distinct states in java.lang.Thread.State: (1) NEW: Thread object instantiated, memory allocated on Heap, start() not yet invoked. (2) RUNNABLE: The JVM has dispatched pthread_create; the thread is either active on a physical CPU core (OS Running) or sitting in the OS scheduler queue ready for its next time slice (OS Ready). (3) BLOCKED: Waiting exclusively to enter or re-enter a synchronized block or method after failing to acquire the intrinsic monitor lock. (4) WAITING: Parked indefinitely until an explicit signal is sent by another thread via Object.wait(), Thread.join(), or LockSupport.park(). (5) TIMED_WAITING: Parked with a maximum duration via Thread.sleep(ms), Object.wait(timeout), Thread.join(timeout), or LockSupport.parkNanos(). (6) TERMINATED: run() method completed normally or terminated abruptly by an unhandled throwable.',
        vi: '2. 6 Trạng thái Vòng đời Luồng JVM & Ánh xạ Bộ lập lịch OS (Baeldung & GeeksforGeeks): Java chuẩn hóa vòng đời luồng thành 6 trạng thái trong java.lang.Thread.State: (1) NEW: Đối tượng luồng được khởi tạo trên Heap nhưng chưa gọi start(). (2) RUNNABLE: JVM đã gọi pthread_create; luồng đang chạy trực tiếp trên CPU (OS Running) hoặc đang nằm trong hàng đợi chờ phân bổ thời gian CPU (OS Ready). (3) BLOCKED: Chờ riêng biệt để vào hoặc vào lại khối synchronized khi chưa giành được monitor lock. (4) WAITING: Tạm dừng vô hạn chờ tín hiệu từ luồng khác qua Object.wait(), Thread.join() hoặc LockSupport.park(). (5) TIMED_WAITING: Tạm dừng có giới hạn thời gian qua Thread.sleep(ms), Object.wait(timeout), Thread.join(timeout). (6) TERMINATED: Hàm run() kết thúc thành công hoặc bị hủy ngang do ngoại lệ không được bắt.'
      },
      {
        en: '3. Thread vs Runnable vs Callable<T> and Future<T> Execution Physics (Baeldung & JavaTpoint): Extending java.lang.Thread is an architectural anti-pattern because Java enforces single inheritance, preventing the class from extending other domain models, and tightly couples the business task with thread lifecycle management. Implementing Runnable separates task logic from thread scheduling (Separation of Concerns). However, Runnable.run() cannot return any computed result and cannot throw checked exceptions. Java 5 introduced java.util.concurrent.Callable<V>, whose V call() throws Exception method returns a generic payload and propagates checked exceptions. Submitting a Callable to an ExecutorService returns a Future<V>. Internally, FutureTask transitions through states: NEW -> COMPLETING -> NORMAL / EXCEPTIONAL / CANCELLED. Calling Future.get() checks state: if not completed, it enqueues the calling thread onto a Treiber stack (WaitNode) and parks it via LockSupport.park(), waking it only upon completion or timeout.',
        vi: '3. Bản chất Thực thi Thread vs Runnable vs Callable<T> và Future<T> (Baeldung & JavaTpoint): Kế thừa java.lang.Thread là một anti-pattern vì Java là ngôn ngữ đơn kế thừa, khiến class không thể mở rộng domain model khác, đồng thời trói chặt nghiệp vụ vào việc quản lý luồng. Cài đặt Runnable giúp tách biệt logic công việc khỏi việc lập lịch luồng (Separation of Concerns). Dẫu vậy, Runnable.run() không thể trả về giá trị tính toán và không được ném checked exception. Java 5 giới thiệu Callable<V> với method V call() throws Exception cho phép trả về kết quả kiểu generic và ném ngoại lệ kiểm tra. Đẩy Callable vào ExecutorService sẽ nhận lại Future<V>. Bên dưới, FutureTask quản lý máy trạng thái: NEW -> COMPLETING -> NORMAL / EXCEPTIONAL / CANCELLED. Hàm Future.get() kiểm tra trạng thái: nếu chưa xong, nó nạp luồng gọi vào một ngăn xếp Treiber (WaitNode) và tạm dừng bằng LockSupport.park(), chỉ đánh thức khi hoàn tất hoặc timeout.'
      },
      {
        en: '4. Thread.sleep() vs Object.wait() vs LockSupport.park() & Spurious Wakeups (Baeldung & Oracle JLS): The fundamental difference centers on monitor lock ownership: Thread.sleep(ms) pauses execution for a timed duration but RETAINS ALL MONITOR LOCKS it currently holds. Any other thread attempting to access those synchronized blocks remains BLOCKED, leading to cascading thread starvation. Object.wait() RELEASES the specific monitor it was invoked upon and places the thread into the object WaitSet, allowing competitor threads to proceed until notify() or notifyAll() moves it to the EntryList. Crucially, POSIX kernel thread implementations permit Spurious Wakeups—threads waking without any notify() call! Therefore, wait() MUST ALWAYS be wrapped in a condition check loop: while (!condition) { lock.wait(); }. LockSupport.park() operates without monitor locks, consuming an available binary permit (or suspending until permit issued), serving as the foundational building block for AbstractQueuedSynchronizer (AQS).',
        vi: '4. So sánh Thread.sleep() vs Object.wait() vs LockSupport.park() & Hiện tượng Thức giấc giả (Baeldung & Oracle JLS): Khác biệt sống còn nằm ở quyền giữ khóa: Thread.sleep(ms) tạm dừng luồng nhưng GIỮ CHẶT MỌI MONITOR LOCK đang sở hữu. Bất kỳ luồng nào khác muốn vào khối synchronized đều bị chặn (BLOCKED), gây ra hiện tượng đói luồng dây chuyền. Object.wait() NHẢ KHÓA monitor tương ứng và đưa luồng vào WaitSet của đối tượng, cho phép luồng khác tiếp tục cho đến khi notify() hoặc notifyAll() chuyển nó sang EntryList. Điều cốt tử: nhân OS chuẩn POSIX cho phép xảy ra Hiện tượng Thức giấc giả (Spurious Wakeup)—luồng tự tỉnh giấc dù không có lệnh notify nào! Do đó, wait() BẮT BUỘC phải đặt trong vòng lặp kiểm tra: while (!condition) { lock.wait(); }. LockSupport.park() vận hành không cần monitor, sử dụng cơ chế binary permit của OS, là viên gạch nền móng xây dựng nên AQS (AbstractQueuedSynchronizer).'
      },
      {
        en: '5. Cooperative Interruption Architecture & Daemon Thread JVM Shutdown Semantics (Baeldung & GeeksforGeeks): Asynchronous thread termination methods like Thread.stop(), Thread.suspend(), and Thread.resume() were permanently deprecated because they force a thread to release all held monitors instantly, leaving shared objects in corrupted, inconsistent states (e.g. an account debited without crediting the counterparty). Java concurrency relies strictly on Cooperative Interruption: Thread.interrupt() sets the thread\'s interrupt flag. If the target thread is blocked in sleep(), wait(), or join(), it immediately wakes and throws InterruptedException, simultaneously clearing its interrupt flag! When catching InterruptedException, developers must NEVER swallow it; you must either re-throw it or restore the status via Thread.currentThread().interrupt(). Regarding Daemon Threads (Thread.setDaemon(true)): The JVM terminates immediately when all non-daemon (user) threads exit. Daemon threads (e.g., GC threads, background cleanups) are killed abruptly—their finally blocks ARE NOT EXECUTED, and file buffers are not flushed! Never perform transactional writes on daemon threads.',
        vi: '5. Kiến trúc Ngắt Luồng Hợp tác (Cooperative Interruption) & Ngữ nghĩa Tắt JVM của Daemon Thread (Baeldung & GeeksforGeeks): Các hàm dừng luồng bất đối xứng như Thread.stop(), suspend(), resume() đã bị khai tử hoàn toàn vì chúng ép luồng nhả khóa tức thì, bỏ mặc dữ liệu chia sẻ ở trạng thái dở dang và hỏng hóc (ví dụ tài khoản đã trừ tiền nhưng chưa kịp cộng cho bên nhận). Đa luồng Java dựa trên nguyên lý Ngắt Luồng Hợp tác (Cooperative Interruption): Thread.interrupt() chỉ bật cờ ngắt. Nếu luồng đang bị chặn trong sleep(), wait() hay join(), nó lập tức tỉnh dậy và ném InterruptedException, đồng thời xóa cờ ngắt! Khi bắt InterruptedException, cấm kỵ bắt rỗng; phải ném tiếp hoặc khôi phục lại cờ bằng Thread.currentThread().interrupt(). Về Daemon Thread (Thread.setDaemon(true)): JVM sẽ tắt ngay khi tất cả các luồng user (non-daemon) kết thúc. Các luồng daemon (như GC, background heartbeat) sẽ bị tiêu diệt ngay lập tức—khối finally của chúng KHÔNG ĐƯỢC CHẠY và bộ đệm ghi file sẽ không kịp flush! Tuyệt đối không thực thi ghi dữ liệu giao dịch trên luồng daemon.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Calling Thread.sleep() or performing blocking I/O while holding a synchronized monitor, preventing all other threads from making progress and causing cascading cluster-wide thread starvation.',
        vi: 'Gọi Thread.sleep() hoặc thực hiện I/O mạng chặn trong khi đang giữ khóa synchronized, ngăn chặn toàn bộ các luồng khác xử lý và gây ra hiện tượng đói tài nguyên luồng (thread starvation) lan truyền khắp cụm máy chủ.'
      },
      {
        en: 'Swallowing InterruptedException by catching it with an empty catch block without re-asserting Thread.currentThread().interrupt(). This clears the thread interrupt status and prevents thread pools from shutting down gracefully during Kubernetes rolling deployments.',
        vi: 'Bỏ qua ngoại lệ InterruptedException bằng khối catch rỗng mà không gọi lại Thread.currentThread().interrupt(). Thao tác này xóa cờ ngắt của luồng và khiến ThreadPool không thể tắt an toàn (graceful shutdown) khi Kubernetes cập nhật pod.'
      },
      {
        en: 'Creating ad-hoc new Thread(runnable).start() inside web request handlers. Each platform thread consumes 1MB of native stack memory; a burst of 3,000 concurrent requests instantly triggers java.lang.OutOfMemoryError: unable to create new native thread and crashes the JVM.',
        vi: 'Tạo luồng tùy tiện bằng new Thread(r).start() trong hàm xử lý HTTP request. Mỗi luồng tốn 1MB RAM native stack; đợt tăng tải 3,000 request sẽ ngay lập tức gây sập JVM với lỗi OutOfMemoryError: unable to create new native thread.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Synchronized Block Thread.sleep() Triggering Cascading Tomcat Thread Pool Exhaustion',
      vi: 'Khối synchronized Giữ Thread.sleep() Gây Đóng Băng Toàn Bộ Thread Pool Của Tomcat'
    },
    businessContext: {
      en: 'A high-volume airline booking and seat reservation engine handles 8,000 active concurrent shoppers during peak holiday travel promotions.',
      vi: 'Hệ thống đặt chỗ và giữ vé máy bay trực tuyến phục vụ 8,000 người dùng đồng thời trong các dịp khuyến mãi mùa du lịch cao điểm.'
    },
    problemDescription: {
      en: 'To prevent exceeding a partner airline Global Distribution System (GDS) API rate limit of 4 requests/second, developers wrapped the booking API call with synchronized(gdsLock) { Thread.sleep(250); callGdsApi(); }. Under peak traffic, all 200 Tomcat worker threads entered the BLOCKED state waiting for gdsLock. With all worker threads exhausted, Tomcat stopped accepting new TCP connections. Kubernetes readiness probes timed out, leading to cascading pod restarts and total service outage with 504 Gateway Timeouts across all payment and search APIs.',
      vi: 'Để tránh vượt quá giới hạn 4 request/giây của API đối tác hàng không (GDS), các lập trình viên đã bao bọc lời gọi API bằng đoạn mã: synchronized(gdsLock) { Thread.sleep(250); callGdsApi(); }. Khi lượng truy cập tăng vọt, toàn bộ 200 luồng xử lý của Tomcat bị đẩy vào trạng thái BLOCKED để chờ gdsLock. Hết luồng khả dụng, Tomcat không thể tiếp nhận kết nối TCP mới. Kubernetes readiness probe bị timeout khiến pod bị khởi động lại hàng loạt, làm tê liệt toàn bộ hệ thống với lỗi 504 Gateway Timeout.'
    },
    whyNaiveFails: {
      en: 'Increasing Tomcat max-threads from 200 to 1,500 consumed 1.3GB of additional native stack memory and triggered severe CPU context switching storms (120,000 context switches/sec), pinning CPU at 100% while requests remained trapped behind the single synchronized bottleneck.',
      vi: 'Tăng max-threads của Tomcat từ 200 lên 1,500 làm tốn thêm 1.3GB RAM cho thread stack và gây ra bão context switch (120,000 lần/giây), đẩy CPU lên 100% trong khi các request vẫn phải xếp hàng chờ đợi qua nút thắt cổ chai synchronized duy nhất.'
    },
    coreSolution: {
      en: 'Never hold locks across sleep or network I/O calls. Replace naive synchronized sleeping with a non-blocking token bucket rate limiter (e.g., Resilience4j RateLimiter or Guava RateLimiter) and decouple slow partner calls into an asynchronous queue or ScheduledExecutorService.',
      vi: 'Tuyệt đối không bao giờ giữ khóa khi đang ngủ (sleep) hoặc gọi I/O mạng. Thay thế khối synchronized bằng cơ chế điều tiết Rate Limiter phi khóa (Resilience4j hoặc Token Bucket) và đẩy các lời gọi đối tác chậm vào hàng đợi xử lý bất đồng bộ qua ScheduledExecutorService.'
    },
    productionCode: `// Production Non-Blocking Rate-Limited Airline Gateway
package com.airline.booking.gateway;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class ResilientGdsBookingGateway {
    // 1. Thread-safe non-blocking RateLimiter: 4 requests per second
    private final RateLimiter gdsRateLimiter;
    private final GdsRestClient gdsRestClient;
    // Bounded virtual thread executor for asynchronous partner execution
    private final ExecutorService partnerExecutor = Executors.newVirtualThreadPerTaskExecutor();

    public ResilientGdsBookingGateway(GdsRestClient client) {
        this.gdsRestClient = client;
        RateLimiterConfig config = RateLimiterConfig.custom()
            .limitRefreshPeriod(Duration.ofSeconds(1))
            .limitForPeriod(4)
            .timeoutDuration(Duration.ofMillis(800)) // Max wait time for a token
            .build();
        this.gdsRateLimiter = RateLimiter.of("gds-api-limiter", config);
    }

    public CompletableFuture<BookingConfirmation> reserveSeatAsync(BookingRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            // Non-blocking token acquisition: threads do NOT block other unrelated requests!
            try {
                RateLimiter.waitForPermission(gdsRateLimiter);
            } catch (RequestNotPermitted e) {
                throw new RateLimitExceededException("GDS capacity saturated, retry in 2s");
            }

            // Zero synchronized locks held during network HTTP transit!
            return gdsRestClient.executeReservation(request);
        }, partnerExecutor);
    }
}`,
    architectureImpact: {
      en: 'Tomcat active BLOCKED threads dropped from 200 (100% saturation) to 0; Context switches fell from 120,000/s to 3,800/s; Zero pod crashes or 504 errors; P99 booking latency stabilized at 320ms.',
      vi: 'Số luồng Tomcat bị BLOCKED giảm từ 200 (nghẽn 100%) về 0; Tần suất context switch giảm từ 120,000/s xuống 3,800/s; Triệt tiêu hoàn toàn sự cố sập pod và lỗi 504; Độ trễ P99 ổn định ở mức 320ms.'
    }
  },

  steps: [
    {
      id: 'thread-state-new-to-runnable',
      title: { en: '1. Thread Creation & Transition to RUNNABLE', vi: '1. Khởi Tạo Luồng & Chuyển Sang Trạng Thái RUNNABLE' },
      phase: 'THREAD_SPAWN',
      description: {
        en: 'Thread t = new Thread(runnable) starts in NEW state. When t.start() executes, the JVM invokes the native pthread_create syscall, allocates the 1MB stack, and moves the thread to RUNNABLE.',
        vi: 'Thread t = new Thread(runnable) bắt đầu ở trạng thái NEW. Khi gọi t.start(), JVM gọi syscall pthread_create của OS, cấp 1MB stack và chuyển luồng sang RUNNABLE.'
      },
      jvmRuntimeBehavior: {
        en: 'JVM Thread.start() dispatches to os::create_thread(), creating a native OS kernel thread.',
        vi: 'JVM gọi hàm C++ os::create_thread() tạo luồng nhân OS và đăng ký với bộ lập lịch hệ điều hành.'
      },
      javaCodeLineMatch: 'thread.start(); // Transitions from NEW -> RUNNABLE'
    },
    {
      id: 'blocked-vs-waiting',
      title: { en: '2. BLOCKED (Lock Contention) vs WAITING (Voluntary Yield)', vi: '2. BLOCKED (Tranh Chấp Khóa) vs WAITING (Chủ Động Chờ)' },
      phase: 'SYNCHRONIZATION_STATES',
      description: {
        en: 'If Thread A holds synchronized(lock) and Thread B attempts to enter, Thread B enters BLOCKED. If Thread A calls lock.wait(), it RELEASES the lock and enters WAITING until another thread calls lock.notify().',
        vi: 'Nếu Luồng A đang giữ synchronized(lock) mà Luồng B muốn vào, Luồng B bị đưa vào BLOCKED. Nếu Luồng A gọi lock.wait(), nó NHẢ KHÓA và chuyển sang WAITING cho tới khi luồng khác notify().'
      },
      jvmRuntimeBehavior: {
        en: 'BLOCKED threads wait in ObjectMonitor _EntryList; WAITING threads wait in _WaitSet.',
        vi: 'Luồng BLOCKED xếp hàng trong _EntryList của ObjectMonitor; luồng WAITING chờ trong _WaitSet.'
      },
      javaCodeLineMatch: 'lock.wait(); // Releases lock, enters WAITING state'
    },
    {
      id: 'sleep-vs-wait-physics',
      title: { en: '3. sleep() (Retains Lock) vs wait() (Releases Lock)', vi: '3. sleep() (Giữ Chặt Khóa) vs wait() (Nhả Khóa Cho Luồng Khác)' },
      phase: 'SLEEP_VS_WAIT',
      description: {
        en: 'Calling Thread.sleep(1000) inside a synchronized block enters TIMED_WAITING but KEEPS the lock! Other threads remain BLOCKED for the entire duration, freezing the system. Calling wait(1000) safely yields the lock.',
        vi: 'Gọi Thread.sleep(1000) bên trong khối synchronized sẽ chuyển sang TIMED_WAITING nhưng VẪN GIỮ CHẶT KHÓA! Các luồng khác bị chặn đứng suốt 1 giây làm đơ hệ thống. Ngược lại, wait(1000) nhả khóa an toàn.'
      },
      jvmRuntimeBehavior: {
        en: 'Thread.sleep() delegates to OS nanosleep() without touching ObjectMonitor ownership.',
        vi: 'Thread.sleep() gọi trực tiếp nanosleep() của OS mà không hề nhả quyền sở hữu ObjectMonitor.'
      },
      javaCodeLineMatch: 'Thread.sleep(1000); // KEEPS MONITOR LOCK! CAUTION!'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Linux OS CFS (Completely Fair Scheduler)',
      implementationName: '1:1 Kernel Thread Mapping & Timeslices',
      keyMechanism: {
        en: 'Every standard Java thread is managed by the Linux Completely Fair Scheduler (CFS). The kernel allocates dynamic timeslices (vruntime) and balances threads across CPU cores.',
        vi: 'Mỗi luồng Java truyền thống được quản lý bởi bộ lập lịch CFS của Linux. Nhân OS cấp phát thời gian chạy (vruntime) và điều phối luồng trên các nhân CPU.'
      },
      defaultFlags: '-XX:ThreadPriorityPolicy=42',
      architectureNote: {
        en: 'Never rely on Thread.setPriority() in production: modern OS schedulers largely ignore user-space Java priorities.',
        vi: 'Không bao giờ dựa vào Thread.setPriority() trong thực tế: bộ lập lịch OS hiện đại hầu như bỏ qua độ ưu tiên của Java.'
      }
    },
    {
      jvmEngine: 'Java Thread Dump Analysis (jstack)',
      implementationName: 'Real-Time Thread State Inspection',
      keyMechanism: {
        en: 'jstack <PID> outputs the exact call stack and state of every running thread in the JVM, distinguishing between threads BLOCKED on monitors and threads waiting in pools.',
        vi: 'Lệnh jstack <PID> in ra toàn bộ stack trace và trạng thái của từng luồng trong JVM, phân biệt rõ luồng đang bị BLOCKED do tranh chấp khóa hay đang WAITING trong pool.'
      },
      defaultFlags: 'jcmd <PID> Thread.print',
      architectureNote: {
        en: 'Crucial for detecting thread pool exhaustion and deadlock loops in production Kubernetes pods.',
        vi: 'Công cụ số 1 để phát hiện cạn kiệt luồng và bế tắc deadlock trong môi trường sản xuất.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Multi-threading utilizes 100% of modern multi-core CPU capacity, allowing parallel request processing.',
        vi: 'Đa luồng tận dụng 100% công suất của CPU đa nhân, cho phép xử lý hàng ngàn request song song.'
      },
      {
        en: 'Callable<T> and Future<T> provide clean, asynchronous, type-safe result propagation with exception handling.',
        vi: 'Callable<T> và Future<T> mang lại cơ chế bất đồng bộ an toàn kiểu kèm khả năng bắt ngoại lệ chuyên nghiệp.'
      }
    ],
    cons: [
      {
        en: 'Each traditional platform thread consumes 1MB of native RAM, capping system capacity at ~5,000 threads per server.',
        vi: 'Mỗi luồng truyền thống tốn 1MB RAM native, giới hạn tối đa chỉ chạy được khoảng vài ngàn luồng trên một server.'
      },
      {
        en: 'Calling sleep() while holding locks induces catastrophic cascading latency bottlenecks across all threads.',
        vi: 'Gọi sleep() khi đang giữ khóa tạo ra điểm nghẽn độ trễ dây chuyền làm tê liệt toàn bộ ứng dụng.'
      }
    ],
    memoryFootprint: {
      en: '1MB native OS stack per platform thread. 1,000 active threads allocate 1GB of off-heap RAM exclusively for thread stacks!',
      vi: '1MB RAM native trên mỗi luồng. 1,000 luồng chạy đồng thời sẽ ngốn mất 1GB RAM ngoài Heap chỉ để chứa stack!'
    },
    jvmSpecificationGuarantee: {
      en: 'JVMS §2.5.2: Java guarantees each thread has its own private JVM stack created at the same time as the thread.',
      vi: 'Quy chuẩn JVM: Mỗi luồng luôn được đảm bảo sở hữu một ngăn xếp JVM Stack riêng biệt khởi tạo cùng lúc với luồng.'
    }
  },

  javaCode: `package com.engine.fundamentals;

import java.util.concurrent.*;

/**
 * Demonstrates Process vs Thread, 6 Thread States,
 * Runnable vs Callable<T>, and sleep() vs wait() mechanics.
 */
public class ThreadLifecycleDemo {

    private static final Object LOCK = new Object();

    public static void main(String[] args) throws Exception {
        System.out.println("=== THREAD LIFECYCLE & CONCURRENCY PHYSICS ===");

        // 1. Thread vs Runnable vs Callable
        demonstrateRunnableVsCallable();

        // 2. Thread State Transitions (NEW -> RUNNABLE -> WAITING -> TERMINATED)
        demonstrateThreadStates();

        // 3. The Fatal Trap: sleep() inside synchronized
        demonstrateSleepVsWaitDifference();
    }

    private static void demonstrateRunnableVsCallable() throws Exception {
        // Runnable: fire-and-forget, returns void, no checked exceptions
        Runnable task1 = () -> System.out.println("[Runnable] Executing background cleanup...");
        Thread t1 = new Thread(task1);
        t1.start();
        t1.join();

        // Callable: returns a computed value, can throw checked exceptions
        Callable<String> task2 = () -> {
            Thread.sleep(100);
            return "Order #1001 Processed Successfully!";
        };

        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> future = executor.submit(task2);

        System.out.println("[Callable] Waiting for result via future.get()...");
        String result = future.get(1, TimeUnit.SECONDS); // Blocking call
        System.out.println("[Callable] Result: " + result);

        executor.shutdown();
    }

    private static void demonstrateThreadStates() throws InterruptedException {
        Thread worker = new Thread(() -> {
            try {
                // RUNNABLE -> TIMED_WAITING
                Thread.sleep(200);

                // TIMED_WAITING -> WAITING
                synchronized (LOCK) {
                    LOCK.wait(); // Releases lock, enters WAITING
                }
            } catch (InterruptedException ignored) {}
        });

        System.out.println("State after creation: " + worker.getState()); // NEW
        worker.start();
        System.out.println("State after start():   " + worker.getState()); // RUNNABLE

        Thread.sleep(50);
        System.out.println("State inside sleep():  " + worker.getState()); // TIMED_WAITING

        Thread.sleep(250);
        System.out.println("State inside wait():   " + worker.getState()); // WAITING

        // Wake worker thread up
        synchronized (LOCK) {
            LOCK.notify();
        }

        worker.join();
        System.out.println("State after finished:  " + worker.getState()); // TERMINATED
    }

    private static void demonstrateSleepVsWaitDifference() {
        System.out.println("\n--- CRITICAL ARCHITECTURAL RULE: ---");
        System.out.println("1. Thread.sleep(ms): KEEPS locks. Other threads stay BLOCKED!");
        System.out.println("2. Object.wait(ms):  RELEASES lock. Allows other threads to make progress!");
    }
}`,

  jvmFlagsCode: `# Diagnostic flags for Thread Stacks & Sizing
# 1. Configure thread stack size (Default: 1024k = 1M)
-Xss512k

# 2. Print thread allocation and state transitions
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintThreadEvents`,

  bytecodeInspection: `// Disassembly of synchronized + wait() bytecode
Code:
   0: getstatic     #7   // Field LOCK:Ljava/lang/Object;
   3: dup
   4: astore_1
   5: monitorenter       // Acquire monitor lock
   6: getstatic     #7   // Field LOCK:Ljava/lang/Object;
   9: invokevirtual #11  // Method java/lang/Object.wait:()V (Releases lock!)
  12: aload_1
  13: monitorexit        // Release monitor lock
  14: goto          22
  17: astore_2
  18: aload_1
  19: monitorexit        // Ensure release even if exception thrown!
  20: aload_2
  21: athrow
  22: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What is the fundamental difference between a Process and a Thread?',
        vi: 'Sự khác biệt cốt lõi giữa Tiến trình (Process) và Luồng (Thread) là gì?'
      },
      answer: {
        en: 'A Process is an independent executing program with its own private, isolated virtual address space provided by the operating system. Processes cannot directly read or modify each other\'s memory without Inter-Process Communication (IPC, sockets, pipes). A Thread is a lightweight unit of execution WITHIN a process. All threads inside the same JVM share the process Heap and Metaspace, but each thread has its own private Stack and Program Counter (PC). Creating a thread is much faster and cheaper than spawning a process.',
        vi: 'Tiến trình (Process) là một chương trình đang chạy độc lập, sở hữu không gian bộ nhớ ảo riêng biệt do hệ điều hành cấp. Các tiến trình không thể đọc hay sửa bộ nhớ của nhau nếu không thông qua giao tiếp IPC hoặc Socket. Luồng (Thread) là đơn vị thực thi gọn nhẹ NẰM TRONG tiến trình. Tất cả các luồng trong cùng một JVM dùng chung bộ nhớ Heap và Metaspace, nhưng mỗi luồng sở hữu một ngăn xếp Stack và thanh ghi PC riêng biệt. Tạo một luồng nhanh và tốn ít tài nguyên hơn rất nhiều so với tạo một tiến trình mới.'
      },
      trapWarning: {
        en: 'Do not say threads don\'t have their own memory. Threads share the Heap, but each thread has a private, unshared Thread Stack (~1MB) for method execution frames.',
        vi: 'Đừng nói các luồng không có bộ nhớ riêng. Các luồng dùng chung Heap, nhưng mỗi luồng BẮT BUỘC có một ngăn xếp Thread Stack riêng (~1MB) để lưu các biến cục bộ trong hàm.'
      },
      proTip: {
        en: 'Highlight the concurrency trade-off: Threads allow blazing fast inter-thread communication via shared memory, but this shared state creates race conditions that require synchronization.',
        vi: 'Nêu bật tính hai mặt: Chia sẻ bộ nhớ giúp các luồng trao đổi dữ liệu siêu tốc, nhưng việc chia sẻ trạng thái này chính là nguồn gốc sinh ra lỗi Race Condition đòi hỏi phải đồng bộ hóa.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What is the crucial difference between Thread.sleep() and Object.wait() regarding lock ownership?',
        vi: 'Sự khác biệt sống còn giữa Thread.sleep() và Object.wait() liên quan đến quyền sở hữu khóa (lock) là gì?'
      },
      answer: {
        en: '1. Lock Retention: Thread.sleep() puts the current thread to sleep but KEEPS ALL MONITOR LOCKS it currently holds. Any other thread attempting to acquire those locks will remain BLOCKED until the sleeping thread wakes up and exits the synchronized block. 2. Lock Release: Object.wait() temporarily RELEASES the object monitor lock, allowing other threads to acquire it and call notify(). 3. Origin: sleep() is a static method on Thread; wait() is an instance method on Object. 4. Context: wait() MUST be called inside a synchronized block on that object (otherwise it throws IllegalMonitorStateException); sleep() can be called anywhere.',
        vi: '1. Cơ chế giữ khóa: Thread.sleep() đưa luồng vào giấc ngủ nhưng VẪN GIỮ CHẶT TẤT CẢ CÁC KHÓA mà nó đang nắm giữ. Mọi luồng khác muốn vào khối synchronized đều bị chặn đứng (BLOCKED) cho đến khi luồng ngủ dậy và nhả khóa. 2. Cơ chế nhả khóa: Object.wait() TẠM THỜI NHẢ KHÓA của đối tượng monitor, cho phép các luồng khác vào xử lý và gọi notify(). 3. Nguồn gốc: sleep() là hàm static của lớp Thread; wait() là hàm của lớp Object. 4. Ngữ cảnh: wait() BẮT BUỘC phải gọi bên trong khối synchronized trên chính đối tượng đó (nếu không sẽ ném IllegalMonitorStateException); sleep() có thể gọi ở bất kỳ đâu.'
      },
      trapWarning: {
        en: 'Calling Thread.sleep() inside a database transaction or synchronized block is one of the most common causes of high-latency cascading outages in production.',
        vi: 'Gọi Thread.sleep() khi đang giữ khóa Database Transaction hoặc synchronized là nguyên nhân hàng đầu gây sập hệ thống dây chuyền trong môi trường sản xuất.'
      },
      proTip: {
        en: 'Always invoke wait() inside a while loop, never an if condition: while (!condition) { lock.wait(); }. This protects against Spurious Wakeups where the OS wakes a thread without a corresponding notify().',
        vi: 'Luôn gọi wait() trong vòng lặp while, không bao giờ dùng if: while (!condition) { lock.wait(); }. Điều này bảo vệ hệ thống khỏi hiện tượng Thức giấc giả (Spurious Wakeup) do hệ điều hành gây ra.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'List and explain the 6 JVM Thread States in java.lang.Thread.State. How do you distinguish BLOCKED from WAITING in a thread dump?',
        vi: 'Liệt kê và giải thích 6 trạng thái luồng trong java.lang.Thread.State. Làm thế nào để phân biệt BLOCKED và WAITING trong một Thread Dump?'
      },
      answer: {
        en: 'The 6 states are: 1. NEW: Instantiated but start() not yet called. 2. RUNNABLE: Executing in the JVM or ready in the OS run queue. 3. BLOCKED: Waiting specifically to acquire a synchronized object monitor lock held by another thread. 4. WAITING: Indefinitely waiting for another thread via Object.wait(), Thread.join(), or LockSupport.park(). 5. TIMED_WAITING: Waiting for a specified time via Thread.sleep(ms), Object.wait(ms), or LockSupport.parkNanos(). 6. TERMINATED: Completed run() or terminated by unhandled exception. In a Thread Dump: BLOCKED indicates severe lock contention (many threads waiting for the exact same synchronized monitor). WAITING usually indicates idle worker threads waiting in a thread pool queue for incoming work.',
        vi: '6 trạng thái gồm: 1. NEW: Đã khởi tạo nhưng chưa gọi start(). 2. RUNNABLE: Đang chạy hoặc sẵn sàng trong hàng đợi của OS. 3. BLOCKED: Chờ riêng biệt để chiếm khóa synchronized do luồng khác đang nắm giữ. 4. WAITING: Chờ vô hạn cho đến khi có tín hiệu qua Object.wait(), Thread.join() hoặc LockSupport.park(). 5. TIMED_WAITING: Chờ có giới hạn thời gian qua Thread.sleep(ms), wait(ms). 6. TERMINATED: Đã chạy xong hoặc bị kết thúc do ngoại lệ. Trong Thread Dump: BLOCKED là dấu hiệu của tranh chấp khóa dữ dội (hàng loạt luồng cùng kẹt tại 1 monitor). WAITING thường là các luồng worker đang nhàn rỗi nằm chờ task mới trong Thread Pool.'
      },
      trapWarning: {
        en: 'Candidates often think threads waiting on java.util.concurrent.locks.ReentrantLock are in the BLOCKED state. They are NOT! They are in the WAITING state because ReentrantLock uses LockSupport.park() internally, which puts threads into WAITING.',
        vi: 'Ứng viên rất hay nhầm rằng các luồng chờ ReentrantLock sẽ ở trạng thái BLOCKED. Thực tế KHÔNG PHẢI! Chúng ở trạng thái WAITING vì ReentrantLock sử dụng hàm LockSupport.park() bên dưới.'
      },
      proTip: {
        en: 'When analyzing high CPU or unresponsive servers: look for threads in BLOCKED state and trace back the "locked <0x...>" address to identify which thread holds the bottleneck lock.',
        vi: 'Kỹ năng phân tích Thread Dump: Lọc các luồng ở trạng thái BLOCKED, tìm dòng "waiting to lock <0x...>" rồi lần ngược lại dòng "locked <0x...>" để bắt ngay luồng thủ phạm đang giữ khóa.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'Why was Thread.stop() deprecated? How does Java cooperative interruption work under the hood, and what happens to finally blocks in Daemon threads upon JVM exit?',
        vi: 'Tại sao Thread.stop() bị khai tử? Cơ chế ngắt hợp tác (Cooperative Interruption) hoạt động như thế nào bên dưới, và điều gì xảy ra với khối finally trong Daemon thread khi JVM tắt?'
      },
      answer: {
        en: '1. Thread.stop() Deprecation: It abruptly unlocks all monitors that the thread holds. Any object left in a partially modified state becomes visible to other threads, violating invariants and silently corrupting heap data without warning. 2. Cooperative Interruption: Instead of forceful killing, Thread.interrupt() sets a volatile boolean flag in the native thread data structure. If the thread is blocked in native wait (sleep, wait, join), the JVM runtime unparks it, clears the interrupt status, and immediately throws InterruptedException. In CPU-bound loops, the thread must proactively check Thread.currentThread().isInterrupted() to exit gracefully. Catching InterruptedException and ignoring it clears the signal; the correct pattern is to re-assert it via Thread.currentThread().interrupt() or propagate it. 3. Daemon Thread JVM Shutdown: The JVM terminates as soon as the last user (non-daemon) thread finishes. Any running Daemon threads are abruptly terminated by the OS runtime without executing their finally blocks! Therefore, daemon threads must never perform persistent I/O (e.g., flushing WAL buffers or writing database logs), as unclosed file handles cause data corruption.',
        vi: '1. Khai tử Thread.stop(): Lệnh này ép luồng nhả toàn bộ monitor lock ngay tức khắc. Mọi đối tượng đang bị sửa dở dang sẽ bị lộ ra cho các luồng khác thấy, phá vỡ tính bất biến và gây hỏng dữ liệu Heap âm thầm. 2. Ngắt hợp tác (Cooperative Interruption): Thay vì ép chết, Thread.interrupt() chỉ bật một cờ boolean volatile ở cấu trúc dữ liệu luồng native. Nếu luồng đang bị chặn trong sleep(), wait(), join(), máy ảo JVM sẽ unpark luồng, xóa cờ ngắt và ném InterruptedException. Trong các vòng lặp tính toán CPU, luồng phải chủ động thăm dò Thread.currentThread().isInterrupted() để dừng an toàn. Bắt ngoại lệ mà nuốt rỗng sẽ làm mất tín hiệu ngắt; bắt buộc phải gọi lại Thread.currentThread().interrupt(). 3. Tắt JVM với Daemon Thread: JVM kết thúc ngay khi luồng user (non-daemon) cuối cùng kết thúc. Tất cả các Daemon thread đang chạy sẽ bị dừng đột ngột mà KHÔNG CHẠY KHỐI FINALLY! Do đó, daemon thread không bao giờ được phép thực hiện ghi file hay commit database vì sẽ gây mất mát dữ liệu.'
      },
      trapWarning: {
        en: 'Relying on finally blocks in a daemon thread to close database connections or flush network buffers. When main() completes, the JVM halts immediately, skipping all daemon finally blocks.',
        vi: 'Tin tưởng vào khối finally trong daemon thread để đóng kết nối CSDL hoặc flush buffer file. Khi hàm main() chạy xong, JVM dừng ngay lập tức và bỏ qua toàn bộ khối finally của daemon thread.'
      },
      proTip: {
        en: 'In high-reliability frameworks (Spring, Netty), use JVM Shutdown Hooks (Runtime.getRuntime().addShutdownHook()) instead of daemon threads to guarantee graceful drain of worker pools before process termination.',
        vi: 'Trong các framework lớn (Spring, Netty), luôn dùng JVM Shutdown Hook (Runtime.getRuntime().addShutdownHook()) thay vì daemon thread để bảo đảm drain sạch các hàng đợi tác vụ trước khi tiến trình tắt hẳn.'
      }
    }
  ]
};
