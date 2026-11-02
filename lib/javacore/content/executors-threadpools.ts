import type { JavaCoreTopic } from '../types';

export const executorsThreadpoolsTopic: JavaCoreTopic = {
  id: 'executors-threadpools',
  category: 'concurrency-juc',
  name: 'ExecutorService, ThreadPools & CompletableFuture',
  tagline: {
    en: 'ThreadPoolExecutor 7 core parameters, workQueue OOM traps, 4 rejection policies, and CompletableFuture reactive asynchronous pipelines.',
    vi: '7 tham số cốt lõi ThreadPoolExecutor, cạm bẫy tràn RAM workQueue, 4 chính sách từ chối tác vụ và đường ống bất đồng bộ CompletableFuture.'
  },
  difficulty: 1,
  level: 'basic',
  order: 10,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      en: 'Spawning new Thread() instances manually on incoming web requests inevitably crashes production servers under traffic spikes: each thread allocates 1MB native stack RAM until the operating system throws java.lang.OutOfMemoryError: unable to create native thread. Conversely, using poorly configured thread pools with unbounded queues silently swallows millions of tasks, ballooning JVM Heap until GC pauses freeze the application.',
      vi: 'Việc tự ý gọi new Thread() thủ công khi có request đến sẽ nhanh chóng đánh sập server khi có lượng truy cập đột biến: mỗi luồng ngốn 1MB RAM native cho đến khi hệ điều hành ném lỗi OutOfMemoryError: unable to create native thread. Ngược lại, cấu hình sai ThreadPool với hàng đợi không giới hạn (unbounded queue) sẽ tích tụ hàng triệu task làm tràn RAM và khiến GC dừng toàn bộ hệ thống.'
    },
    hardwareConstraint: {
      en: 'Operating systems cannot handle more than a few thousand kernel threads without severe CPU context switching thrashing. Optimal thread pool sizing depends on workload characteristics: For CPU-bound tasks, Pool_Size = CPU_Cores + 1 (maximizing CPU saturation without thrashing). For I/O-bound tasks, Pool_Size = CPU_Cores * (1 + Wait_Time / Compute_Time).',
      vi: 'Hệ điều hành không thể gánh quá vài ngàn luồng nhân mà không bị sập hiệu năng do Context Switch. Kích thước pool tối ưu phụ thuộc vào bản chất công việc: Với tác vụ tính toán (CPU-bound), Số luồng = Số Cores + 1. Với tác vụ vào/ra (I/O-bound), Số luồng = Số Cores * (1 + Thời gian chờ I/O / Thời gian tính toán).'
    },
    fundamentalSolution: {
      en: 'Java provides ExecutorService and ThreadPoolExecutor to reuse worker threads via a managed producer-consumer queue. Execution flow: 1. If running threads < corePoolSize, spawn new worker. 2. If core pool is full, enqueue task into workQueue. 3. If workQueue is full, spawn non-core workers up to maximumPoolSize. 4. If max pool is full and queue is full, invoke RejectedExecutionHandler. CompletableFuture provides composable, non-blocking asynchronous event chains.',
      vi: 'Java cung cấp ExecutorService và ThreadPoolExecutor để tái sử dụng luồng qua hàng đợi nhà sản xuất - người tiêu thụ. Thứ tự thực thi: 1. Nếu số luồng < corePoolSize, tạo worker mới. 2. Nếu core pool đã đầy, đẩy task vào hàng đợi workQueue. 3. Nếu workQueue bị đầy, tạo thêm luồng tạm thời lên tới maximumPoolSize. 4. Nếu cả pool và queue đều đầy, kích hoạt chính sách từ chối RejectedExecutionHandler. CompletableFuture đem lại mô hình xử lý bất đồng bộ không chặn luồng.'
    },
    math: {
      formula: 'Task_Arrival -> (Threads < Core) ? Spawn_Core : (Queue_Not_Full ? Enqueue : (Threads < Max ? Spawn_Max : Reject))',
      description: {
        en: 'The 4 Rejection Policies: 1. AbortPolicy (throws RejectedExecutionException). 2. CallerRunsPolicy (calling thread executes task, creating backpressure). 3. DiscardPolicy (silently drops task). 4. DiscardOldestPolicy (drops oldest queued task).',
        vi: '4 chính sách xử lý khi quá tải: 1. AbortPolicy (ném ngoại lệ). 2. CallerRunsPolicy (ép luồng gọi tự chạy task, tạo áp lực ngược backpressure làm chậm tốc độ nạp). 3. DiscardPolicy (bỏ qua âm thầm). 4. DiscardOldestPolicy (bỏ task cũ nhất trong hàng đợi).'
      },
      timeComplexity: 'O(1) task submission and worker dispatch; 0ns non-blocking CompletableFuture chaining',
      spaceComplexity: 'WorkQueue buffer size: N * 8B references; Platform worker thread: 1MB stack each',
      memoryOverheadFormula: 'Pool Native Overhead = (Active_Workers * -Xss) + WorkQueue_Capacity * Ref_Size'
    }
  },

  memoryLayout: {
    title: {
      en: 'Physical Architecture: ThreadPoolExecutor Internal Structure & Task Dispatch Flow',
      vi: 'Kiến Trúc Vật Lý: Cấu Trúc Nội Bộ ThreadPoolExecutor & Luồng Điều Phối Tác Vụ'
    },
    description: {
      en: 'ThreadPoolExecutor maintains a pool of Worker objects containing OS thread handles. Incoming Runnables are stored in a bounded BlockingQueue. When saturated, tasks trigger backpressure or rejection.',
      vi: 'ThreadPoolExecutor duy trì tập hợp các đối tượng Worker chứa luồng OS. Các Runnable gửi đến được lưu trong BlockingQueue có giới hạn. Khi bão hòa, cơ chế áp lực ngược hoặc từ chối được kích hoạt.'
    },
    asciiDiagram: `
INCOMING TASKS (from API requests)
                |
                v
+-----------------------------------------------------------------------------------------+
|  STEP 1: Are running workers < corePoolSize?                                            |
|  YES -> Spawn new Worker Thread (allocates 1MB Stack)                                   |
|  NO  -> Proceed to Step 2                                                               |
+-----------------------------------------------------------------------------------------+
                |
                v
+-----------------------------------------------------------------------------------------+
|  STEP 2: Can task fit into bounded workQueue (e.g. ArrayBlockingQueue(500))?            |
|  YES -> Enqueue task in memory buffer (Workers poll when idle)                          |
|  NO  -> Proceed to Step 3                                                               |
+-----------------------------------------------------------------------------------------+
                |
                v
+-----------------------------------------------------------------------------------------+
|  STEP 3: Are running workers < maximumPoolSize?                                         |
|  YES -> Spawn temporary Worker Thread (keepAliveTime countdown)                         |
|  NO  -> Proceed to Step 4: REJECTION!                                                   |
+-----------------------------------------------------------------------------------------+
                |
                v
+-----------------------------------------------------------------------------------------+
|  STEP 4: REJECTED EXECUTION HANDLER:                                                    |
|  - AbortPolicy: Throws RejectedExecutionException (Default)                             |
|  - CallerRunsPolicy: Request Thread executes task directly (Automatic Backpressure!)    |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'Worker ctl (AtomicInteger)', size: '4 Bytes', description: { en: 'High 3 bits store workerCount; low 29 bits store pool runState (RUNNING, SHUTDOWN, STOP, TIDYING, TERMINATED).', vi: '3 bit cao lưu số lượng worker; 29 bit thấp lưu trạng thái hoạt động của pool.' } },
      { name: 'Worker Object', size: '32 Bytes', description: { en: 'Holds OS thread reference and extends AbstractQueuedSynchronizer.', vi: 'Chứa tham chiếu tới luồng OS và kế thừa bộ khung AQS.' } },
      { name: 'Bounded ArrayBlockingQueue', size: 'Continuous Array', description: { en: 'Pre-allocated circular array buffer holding pending task references.', vi: 'Mảng bộ đệm tròn vòng cấp phát sẵn lưu các con trỏ task đang chờ.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'The Java ExecutorService framework decouples asynchronous task submission from physical thread management. At its core, ThreadPoolExecutor manages worker thread pooling, task queuing, and saturation backpressure via 7 fundamental parameters, eliminating the heavy latency and native memory overhead of creating ad-hoc OS threads.',
      vi: 'Bộ khung Java ExecutorService tách rời việc giao việc bất đồng bộ khỏi khâu quản lý luồng vật lý của hệ điều hành. Trọng tâm của hệ thống là ThreadPoolExecutor quản lý vòng đời luồng, hàng đợi tác vụ và cơ chế điều tiết áp lực tải (backpressure) qua 7 tham số cốt lõi, loại bỏ hoàn toàn chi phí tạo luồng OS tốn kém.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The 4-Stage Task Dispatch Invariant: When a task is submitted to ThreadPoolExecutor via execute(), it traverses 4 strict sequential gates: 1. If active workers < corePoolSize, spawn a new core worker thread immediately. 2. If workers >= corePoolSize, attempt to enqueue the task into workQueue. 3. If workQueue is completely saturated AND workers < maximumPoolSize, spawn a temporary non-core worker thread. 4. If workQueue is full AND workers == maximumPoolSize, invoke the RejectedExecutionHandler. Crucially, maximumPoolSize is NEVER engaged until the queue is 100% full!',
        vi: '1. Quy tắc 4 cửa điều phối tác vụ: Khi một tác vụ được nạp qua hàm execute(), nó bắt buộc phải đi qua 4 cửa theo đúng thứ tự: 1. Nếu số luồng đang chạy < corePoolSize, tạo ngay luồng core mới để xử lý. 2. Nếu đã đủ corePoolSize, cố gắng đẩy tác vụ vào hàng đợi workQueue. 3. Chỉ khi workQueue đã ĐẦY 100% VÀ số luồng < maximumPoolSize, mới tạo thêm luồng tạm thời non-core. 4. Nếu hàng đợi đã đầy VÀ số luồng chạm mốc maximumPoolSize, kích hoạt cơ chế từ chối RejectedExecutionHandler. Điểm mấu chốt: maximumPoolSize KHÔNG BAO GIỜ được dùng đến trừ khi hàng đợi đã quá tải 100%!'
      },
      {
        en: '2. The Lethal Trap of Executors Factory Methods: Production systems must NEVER use convenience methods from java.util.concurrent.Executors: Executors.newFixedThreadPool(n) and newSingleThreadExecutor() configure an unbounded LinkedBlockingQueue with capacity Integer.MAX_VALUE (2.14 billion tasks). Under downstream latency stalls, memory accumulates tasks until the JVM crashes with java.lang.OutOfMemoryError: Java heap space. Conversely, Executors.newCachedThreadPool() uses SynchronousQueue with maximumPoolSize = Integer.MAX_VALUE; a burst of 5,000 requests spawns 5,000 OS threads, exhausting Linux memory and crashing with unable to create new native thread.',
        vi: '2. Bẫy chết người từ các hàm tiện ích Executors: Môi trường sản xuất TUYỆT ĐỐI KHÔNG DÙNG các hàm tiện ích từ java.util.concurrent.Executors: newFixedThreadPool và newSingleThreadExecutor sử dụng hàng đợi LinkedBlockingQueue không giới hạn dung lượng (mặc định Integer.MAX_VALUE = 2.14 tỷ phần tử). Khi hệ thống phía sau bị chậm, hàng triệu task sẽ ứ đọng trên RAM cho đến khi sập JVM với lỗi OutOfMemoryError. Ngược lại, newCachedThreadPool dùng SynchronousQueue với trần luồng tối đa Integer.MAX_VALUE; đợt tải 5,000 request sẽ ép JVM tạo 5,000 luồng hệ điều hành, làm cạn kiệt RAM native và sập máy chủ với lỗi unable to create new native thread.'
      },
      {
        en: '3. Rejection Policies and Natural Flow Control (Backpressure): When pools saturate, how the system rejects tasks defines its resilience. The default AbortPolicy throws RejectedExecutionException. DiscardPolicy and DiscardOldestPolicy silently drop tasks, causing data loss. The gold standard for resilient systems is CallerRunsPolicy: instead of dropping the task or crashing, the producer thread calling submit() is forced to execute the task itself! This automatically pauses incoming request ingestion on the producer thread, providing elegant, natural backpressure that matches upstream traffic to downstream processing capacity.',
        vi: '3. Chiến lược Từ chối & Cơ Chế Điều Tiết Tự Nhiên (Backpressure): Khi ThreadPool quá tải, cách thức từ chối task sẽ quyết định độ bền bỉ của hệ thống. Mặc định AbortPolicy ném ngoại lệ RejectedExecutionException. DiscardPolicy và DiscardOldestPolicy âm thầm vứt bỏ task gây mất mát dữ liệu nghiêm trọng. Chuẩn mực vàng cho hệ thống chịu tải cao là CallerRunsPolicy: thay vì vứt bỏ hay ném lỗi, luồng nạp task (luồng gọi submit) bị ép buộc phải tự mình thực thi task đó! Thao tác này tự động làm chậm luồng nhận request phía trước, tạo ra cơ chế backpressure tự nhiên giúp cân bằng chính xác tốc độ tiếp nhận với năng lực xử lý thực tế.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Instantiating thread pools without a custom ThreadFactory that assigns meaningful names (e.g., "order-worker-%d"), rendering production thread dumps (jstack) an unreadable sea of anonymous "pool-2-thread-14" entries during emergency outage troubleshooting.',
        vi: 'Tạo ThreadPool mà không cung cấp ThreadFactory để đặt tên luồng có nghĩa (như "order-worker-%d"), khiến việc đọc bản chụp luồng (jstack) lúc xảy ra sự cố trở thành cực hình với hàng trăm luồng vô danh "pool-2-thread-14".'
      },
      {
        en: 'Silent task failures when submitting via executor.submit(Callable/Runnable): any uncaught RuntimeException is captured inside the returned Future. If the application code never calls future.get(), the exception is swallowed silently with zero logs printed to the console.',
        vi: 'Nuốt lỗi âm thầm khi giao việc qua executor.submit(): mọi ngoại lệ RuntimeException đều bị gói kín bên trong đối tượng Future trả về. Nếu code không bao giờ gọi future.get(), lỗi sẽ biến mất hoàn toàn mà không có bất kỳ dòng log nào hiển thị trên hệ thống.'
      },
      {
        en: 'Not configuring a graceful shutdown hook (shutdown() followed by awaitTermination() and shutdownNow()), which causes in-flight business transactions to be abruptly terminated when Kubernetes pods roll out updates.',
        vi: 'Không cấu hình quy trình tắt an toàn Graceful Shutdown (gọi shutdown() -> awaitTermination() -> shutdownNow()), khiến các giao dịch đang xử lý dở dang bị giết đột ngột khi Kubernetes cập nhật pod.'
      }
    ]
  },

  steps: [
    {
      id: 'threadpool-execution-flow',
      title: { en: '1. Task Submission Flow (Core -> Queue -> Max -> Reject)', vi: '1. Luồng Tiếp Nhận Tác Vụ (Core -> Queue -> Max -> Reject)' },
      phase: 'TASK_SUBMISSION',
      description: {
        en: 'A task arrives via executor.submit(runnable). The executor tests running workers against corePoolSize, enqueues into workQueue, scales to maximumPoolSize, and finally invokes the rejection handler if overloaded.',
        vi: 'Tác vụ gửi qua executor.submit(runnable). Pool lần lượt kiểm tra: tạo luồng core -> đẩy vào queue -> tạo luồng max -> kích hoạt từ chối nếu quá tải.'
      },
      jvmRuntimeBehavior: {
        en: 'Atomic ctl integer updated via CAS to register worker thread count and state changes.',
        vi: 'Biến nguyên tử ctl được cập nhật qua CAS để đếm số luồng và trạng thái hoạt động của pool.'
      },
      javaCodeLineMatch: 'executor.execute(task);'
    },
    {
      id: 'callerruns-backpressure',
      title: { en: '2. CallerRunsPolicy Generates Natural System Backpressure', vi: '2. CallerRunsPolicy Tạo Áp Lực Ngược Bảo Vệ Hệ Thống' },
      phase: 'BACKPRESSURE_DEFENSE',
      description: {
        en: 'Under surge traffic, instead of dropping orders or crashing with OOM, CallerRunsPolicy forces the HTTP Tomcat/Netty thread that submitted the task to execute it directly! This naturally slows down incoming request ingestion.',
        vi: 'Khi lưu lượng tăng vọt, thay vì đánh rơi đơn hàng hay sập RAM, CallerRunsPolicy ép chính luồng HTTP gửi task phải tự tay thực thi task đó! Việc này tự động làm chậm tốc độ tiếp nhận request mới.'
      },
      jvmRuntimeBehavior: {
        en: 'Task executed directly inside caller thread stack frame without queuing or context switching.',
        vi: 'Tác vụ được chạy ngay trên ngăn xếp của luồng gọi mà không tốn công chuyển đổi context.'
      },
      javaCodeLineMatch: 'new ThreadPoolExecutor.CallerRunsPolicy()'
    },
    {
      id: 'completable-future-chaining',
      title: { en: '3. Non-Blocking CompletableFuture Async Pipeline', vi: '3. Đường Ống Bất Đồng Bộ Không Chặn CompletableFuture' },
      phase: 'ASYNC_PIPELINE',
      description: {
        en: 'CompletableFuture.supplyAsync() fetches remote data. thenApply() transforms it, thenCompose() chains dependent calls, and exceptionally() handles errors without ever blocking worker threads with thread.sleep or get().',
        vi: 'CompletableFuture.supplyAsync() tải dữ liệu bất đồng bộ. thenApply() biến đổi kết quả, thenCompose() nối chuỗi tác vụ phụ thuộc và exceptionally() bắt lỗi mà không bao giờ chặn luồng worker.'
      },
      jvmRuntimeBehavior: {
        en: 'Uses Treiber Stack completion records to fire downstream callbacks as soon as stage completes.',
        vi: 'Sử dụng cấu trúc ngăn xếp Treiber để kích hoạt callback phía sau ngay khi công việc hoàn thành.'
      },
      javaCodeLineMatch: 'CompletableFuture.supplyAsync(this::fetchOrder).thenApply(this::enrich)'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Custom Production ThreadPoolExecutor',
      implementationName: 'Bounded Queue with CallerRunsPolicy',
      keyMechanism: {
        en: 'Eliminates Executors.newFixedThreadPool() memory leaks by explicitly capping workQueue capacity and setting CallerRunsPolicy to protect upstream callers.',
        vi: 'Loại bỏ hoàn toàn lỗi tràn RAM của newFixedThreadPool bằng cách giới hạn chặt dung lượng hàng đợi và dùng CallerRunsPolicy bảo vệ hệ thống.'
      },
      defaultFlags: '-Djava.util.concurrent.ForkJoinPool.common.parallelism=16',
      architectureNote: {
        en: 'Always give custom ThreadFactory names (e.g. order-worker-%d) to make production thread dumps readable.',
        vi: 'Luôn đặt tên luồng qua ThreadFactory (order-worker-%d) để thread dump hiển thị rõ ràng dễ điều tra sự cố.'
      }
    },
    {
      jvmEngine: 'Java 21 VirtualThreadPerTaskExecutor',
      implementationName: 'Lightweight Unbounded Concurrency (Loom)',
      keyMechanism: {
        en: 'Executors.newVirtualThreadPerTaskExecutor() spawns a new lightweight virtual thread per task without pooling, mapping millions of concurrent tasks onto carrier ForkJoinPool threads.',
        vi: 'Tạo một Virtual Thread siêu nhẹ cho từng tác vụ riêng biệt mà không cần pool, xử lý hàng triệu kết nối I/O đồng thời.'
      },
      defaultFlags: '--enable-preview',
      architectureNote: {
        en: 'Never pool virtual threads! They are cheap to create (~1KB) and designed to be disposable.',
        vi: 'Tuyệt đối không bao giờ tạo pool cho Virtual Thread! Chúng cực rẻ (~1KB) và sinh ra để dùng xong là bỏ.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Thread reuse eliminates 1MB native thread stack allocation and destruction latency.',
        vi: 'Tái sử dụng luồng loại bỏ hoàn toàn độ trễ cấp phát và giải phóng 1MB RAM native của luồng.'
      },
      {
        en: 'Bounded queues with CallerRunsPolicy provide automatic rate limiting and backpressure under peak loads.',
        vi: 'Hàng đợi có giới hạn kết hợp CallerRunsPolicy mang lại cơ chế tự động hạ tải và hãm tốc khi quá tải.'
      }
    ],
    cons: [
      {
        en: 'Executors.newCachedThreadPool() creates unbounded threads, causing OutOfMemoryError under traffic surges.',
        vi: 'Hàm newCachedThreadPool tạo luồng vô hạn, dễ làm sập server do OutOfMemoryError khi lượng truy cập tăng vọt.'
      },
      {
        en: 'Calling CompletableFuture.get() without a timeout blocks calling threads indefinitely if downstream services hang.',
        vi: 'Gọi CompletableFuture.get() mà không set timeout sẽ làm treo luồng vĩnh viễn nếu service phía sau bị đơ.'
      }
    ],
    memoryFootprint: {
      en: 'ThreadPoolExecutor with 20 core threads consumes 20MB native stack RAM. Bounded queue of 1,000 tasks consumes ~8KB Heap.',
      vi: 'Pool 20 core threads tốn 20MB native stack RAM. Hàng đợi 1,000 task chỉ tốn khoảng 8KB trên Heap.'
    },
    jvmSpecificationGuarantee: {
      en: 'JSR 166: Tasks accepted by ThreadPoolExecutor are guaranteed to be executed or rejected according to the configured RejectedExecutionHandler.',
      vi: 'Chuẩn JSR 166: Mọi task nộp vào pool được bảo đảm thực thi hoặc kích hoạt từ chối theo đúng chính sách đã cấu hình.'
    }
  },

  javaCode: `package com.engine.fundamentals;

import java.util.concurrent.*;

/**
 * Demonstrates:
 * 1. Production-Grade Custom ThreadPoolExecutor configuration
 * 2. Why Executors.newFixedThreadPool is banned (Unbounded Queue Trap)
 * 3. Reactive, non-blocking CompletableFuture asynchronous pipelines
 */
public class ExecutorsThreadpoolsDemo {

    public static void main(String[] args) throws Exception {
        System.out.println("=== PRODUCTION THREADPOOL & ASYNC PIPELINE ===");

        // PRODUCTION BEST PRACTICE: Custom ThreadPoolExecutor
        int corePool = 4;
        int maxPool = 8;
        long keepAliveTime = 60L;
        BlockingQueue<Runnable> queue = new ArrayBlockingQueue<>(100); // BOUNDED!

        // Named thread factory for readable jstack logs
        ThreadFactory namedFactory = new ThreadFactory() {
            private int counter = 0;
            @Override
            public Thread newThread(Runnable r) {
                return new Thread(r, "order-worker-" + (++counter));
            }
        };

        // CallerRunsPolicy: Natural backpressure under surge traffic
        RejectedExecutionHandler handler = new ThreadPoolExecutor.CallerRunsPolicy();

        ThreadPoolExecutor customExecutor = new ThreadPoolExecutor(
            corePool, maxPool, keepAliveTime, TimeUnit.SECONDS,
            queue, namedFactory, handler
        );

        // Submit tasks safely
        customExecutor.execute(() -> {
            System.out.println("[" + Thread.currentThread().getName() + "] Processing order payment...");
        });

        // 2. Reactive Asynchronous Pipeline using CompletableFuture
        demonstrateCompletableFuturePipeline(customExecutor);

        customExecutor.shutdown();
        customExecutor.awaitTermination(2, TimeUnit.SECONDS);
    }

    private static void demonstrateCompletableFuturePipeline(ExecutorService executor) throws Exception {
        System.out.println("\n--- COMPLETABLEFUTURE ASYNC CHAIN ---");

        CompletableFuture<String> pipeline = CompletableFuture.supplyAsync(() -> {
            // Step 1: Fetch order asynchronously
            return "ORDER-9901";
        }, executor)
        .thenApply(orderId -> {
            // Step 2: Transform / Calculate tax
            return orderId + " [Tax: $15.50]";
        })
        .thenCompose(taxInfo -> {
            // Step 3: Chain dependent async call (e.g. Send receipt)
            return CompletableFuture.supplyAsync(() -> taxInfo + " -> Receipt Sent!", executor);
        })
        .exceptionally(ex -> {
            // Fallback recovery
            return "Fallback: Processing failed due to " + ex.getMessage();
        });

        // Retrieve result with strict timeout
        String finalOutput = pipeline.get(1, TimeUnit.SECONDS);
        System.out.println("Async Pipeline Result: " + finalOutput);
    }
}`,

  jvmFlagsCode: `# Diagnostic flags for Thread Pools & Worker Scaling
-XX:+UnlockDiagnosticVMOptions
-Djava.util.concurrent.ForkJoinPool.common.parallelism=8`,

  bytecodeInspection: `// Disassembly of CompletableFuture.thenApply() execution
Code:
   0: aload_0
   1: invokedynamic #7, 0 // Method reference Function
   6: invokevirtual #11   // Method CompletableFuture.thenApply:(Ljava/util/function/Function;)Ljava/util/concurrent/CompletableFuture;
   9: astore_1
  10: aload_1
  11: areturn`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'Why is it strongly discouraged to use Executors.newFixedThreadPool() and Executors.newCachedThreadPool() in production?',
        vi: 'Tại sao trong môi trường sản xuất (Production) lại cấm dùng Executors.newFixedThreadPool() và Executors.newCachedThreadPool()?'
      },
      answer: {
        en: '1. newFixedThreadPool(n) uses an UNBOUNDED LinkedBlockingQueue (capacity Integer.MAX_VALUE = 2.14 billion). If tasks arrive faster than worker threads can process them, millions of tasks pile up in the queue, consuming Heap memory until the JVM crashes with java.lang.OutOfMemoryError: Java heap space. 2. newCachedThreadPool() uses a SynchronousQueue with an UNBOUNDED maximumPoolSize (Integer.MAX_VALUE). Under high traffic spikes, it spawns thousands of OS platform threads (1MB stack each) until the OS runs out of memory, throwing java.lang.OutOfMemoryError: unable to create native thread and freezing the entire server. Production code must ALWAYS use a custom ThreadPoolExecutor with a strictly bounded queue and an explicit Rejection Handler.',
        vi: '1. newFixedThreadPool(n) sử dụng hàng đợi LinkedBlockingQueue KHÔNG GIỚI HẠN (dung lượng tối đa 2.14 tỷ phần tử). Khi lượng request đến nhanh hơn tốc độ xử lý, hàng triệu task sẽ tích tụ trong RAM cho đến khi máy ảo sập nguồn vì OutOfMemoryError: Java heap space. 2. newCachedThreadPool() sử dụng SynchronousQueue với số luồng tối đa KHÔNG GIỚI HẠN (2.14 tỷ luồng). Khi lưu lượng tăng đột biến, nó tạo ra hàng ngàn luồng nhân OS (mỗi luồng tốn 1MB stack) cho đến khi làm cạn kiệt RAM hệ điều hành, ném lỗi OutOfMemoryError: unable to create native thread và làm đơ toàn bộ máy chủ. Trong thực tế, BẮT BUỘC phải tự khởi tạo ThreadPoolExecutor với hàng đợi có giới hạn dung lượng và chính sách từ chối rõ ràng.'
      },
      trapWarning: {
        en: 'Many static analysis tools (like Alibaba Java Coding Guidelines and SonarQube) automatically flag Executors.newFixedThreadPool as a blocker severity violation.',
        vi: 'Các công cụ quét code chuẩn doanh nghiệp như SonarQube tự động đánh dấu lỗi Blocker nếu phát hiện code dùng Executors.newFixedThreadPool.'
      },
      proTip: {
        en: 'State the rule of thumb: Always define: 1. Core pool size. 2. Max pool size. 3. ArrayBlockingQueue with bounded capacity (e.g. 1000). 4. Custom ThreadFactory with descriptive names. 5. CallerRunsPolicy to apply backpressure.',
        vi: 'Công thức vàng trả lời phỏng vấn: Luôn tự tạo ThreadPoolExecutor với: 1. Core pool size. 2. Max pool size. 3. ArrayBlockingQueue giới hạn phần tử. 4. ThreadFactory đặt tên luồng dễ đọc. 5. CallerRunsPolicy để hãm tốc độ nạp task khi quá tải.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'Explain how ThreadPoolExecutor determines when to queue tasks versus when to spawn non-core worker threads up to maximumPoolSize.',
        vi: 'Giải thích cách ThreadPoolExecutor quyết định khi nào thì đẩy task vào hàng đợi, khi nào thì tạo thêm luồng tạm thời lên tới maximumPoolSize?'
      },
      answer: {
        en: 'This is the most common counter-intuitive interview question: 1. If running workers < corePoolSize, a NEW core thread is created immediately. 2. If core threads are busy, ThreadPoolExecutor does NOT create non-core threads! Instead, it attempts to insert the task into the workQueue. 3. ONLY if the workQueue is completely FULL does it spawn non-core worker threads (up to maximumPoolSize). 4. If maximumPoolSize is reached AND workQueue is full, it triggers the RejectedExecutionHandler.',
        vi: 'Đây là câu hỏi bẫy rất hay gặp: 1. Nếu số luồng đang chạy < corePoolSize, một luồng core MỚI được tạo ngay lập tức. 2. Nếu các luồng core đang bận, ThreadPoolExecutor KHÔNG TẠO THÊM LUỒNG! Thay vào đó, nó cố gắng đẩy task vào hàng đợi workQueue. 3. CHỈ KHI hàng đợi workQueue ĐÃ ĐẦY HOÀN TOÀN thì nó mới bắt đầu tạo thêm luồng tạm thời (lên tới maximumPoolSize). 4. Nếu đã đạt maximumPoolSize VÀ hàng đợi cũng đầy nghẽn, nó mới kích hoạt RejectedExecutionHandler.'
      },
      trapWarning: {
        en: 'Many candidates incorrectly assume the pool scales from corePoolSize to maximumPoolSize BEFORE queueing tasks. In reality, the queue is prioritized before expanding to maximumPoolSize!',
        vi: 'Rất nhiều ứng viên tưởng nhầm rằng pool sẽ tăng từ core lên max trước rồi mới đẩy vào queue. Thực tế hoàn toàn ngược lại: Hàng đợi queue được ưu tiên lấp đầy trước khi pool chịu bung thêm luồng!'
      },
      proTip: {
        en: 'If an unbounded queue is used, maximumPoolSize is completely IGNORED because the queue never fills up! The pool will never scale beyond corePoolSize.',
        vi: 'Điểm mấu chốt: Nếu dùng hàng đợi không giới hạn (unbounded queue), tham số maximumPoolSize hoàn toàn BỊ VÔ HIỆU HÓA vì queue không bao giờ đầy! Pool sẽ không bao giờ sinh thêm luồng vượt quá corePoolSize.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'In CompletableFuture, what is the crucial architectural difference between thenApply() and thenCompose()?',
        vi: 'Trong CompletableFuture, sự khác biệt kiến trúc then chốt giữa thenApply() và thenCompose() là gì?'
      },
      answer: {
        en: 'thenApply(Function<T, R>) is analogous to Stream.map(): it takes a function that transforms a value T into R and wraps the result in CompletableFuture<R>. If the mapping function itself returns another asynchronous stage CompletableFuture<R> (e.g. calling another microservice), thenApply() produces a nested CompletableFuture<CompletableFuture<R>>, which requires double-unwrapping. thenCompose(Function<T, CompletableFuture<R>>) is analogous to Stream.flatMap(): it takes a function that returns a CompletableFuture<R> and flattens the result into a single CompletableFuture<R>. Use thenCompose to chain sequential dependent asynchronous operations.',
        vi: 'thenApply(Function<T, R>) tương tự như hàm Stream.map(): nó nhận vào một hàm biến đổi giá trị T thành R và tự bọc kết quả vào CompletableFuture<R>. Nếu hàm biến đổi đó lại trả về một tác vụ bất đồng bộ khác CompletableFuture<R> (như gọi sang microservice khác), thenApply() sẽ tạo ra cấu trúc lồng nhau CompletableFuture<CompletableFuture<R>> rất khó xử lý. thenCompose(Function<T, CompletableFuture<R>>) tương tự như Stream.flatMap(): nó nhận vào hàm trả về CompletableFuture<R> và làm phẳng (flatten) kết quả thành một CompletableFuture<R> duy nhất. Dùng thenCompose khi cần xâu chuỗi các tác vụ bất đồng bộ phụ thuộc nối tiếp nhau.'
      },
      trapWarning: {
        en: 'Never call CompletableFuture.get() inside an async pipeline! Calling get() blocks the current worker thread, defeating the entire purpose of reactive non-blocking execution.',
        vi: 'Tuyệt đối không bao giờ gọi hàm get() bên trong đường ống async! Gọi get() sẽ chặn cứng luồng worker hiện tại, phá hỏng hoàn toàn ý nghĩa của kiến trúc bất đồng bộ không chặn (non-blocking).'
      },
      proTip: {
        en: 'Mention exception handling: Always attach .exceptionally() or .handle() at the end of the pipeline. In asynchronous flows, unhandled exceptions are swallowed silently inside the Future unless queried.',
        vi: 'Quy tắc vàng: Luôn gắn hàm .exceptionally() hoặc .handle() ở cuối đường ống. Trong lập trình bất đồng bộ, nếu không bắt lỗi thì ngoại lệ sẽ bị nuốt chửng âm thầm bên trong Future mà không hề in log ra màn hình.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'How does ThreadPoolExecutor pack its lifecycle state and worker count into a single 32-bit AtomicInteger (ctl), and why is pooling Virtual Threads in Java 21 considered a severe anti-pattern?',
        vi: 'ThreadPoolExecutor đóng gói trạng thái vòng đời và số lượng worker vào một số nguyên 32-bit AtomicInteger (ctl) duy nhất như thế nào, và tại sao việc tạo Thread Pool cho Virtual Threads trong Java 21 lại là một phản mẫu (Anti-Pattern) tai hại?'
      },
      answer: {
        en: '1. ThreadPoolExecutor ctl Bit-Packing: To ensure that checking the pool state (e.g. RUNNING, SHUTDOWN, STOP, TIDYING, TERMINATED) and updating the active worker count can be performed in a SINGLE atomic hardware instruction without lock contention, Doug Lea packed both fields into an AtomicInteger ctl: the high 3 bits represent runState (-1 << 29 for RUNNING, 0 << 29 for SHUTDOWN, etc.), and the low 29 bits represent workerCount (capacity 2^29 - 1 = ~536 million threads). A single compareAndSet on ctl atomically shifts states and increments workers simultaneously! 2. Why Pooling Virtual Threads is an Anti-Pattern: Classical Thread Pools exist because OS platform threads are heavy (~1MB stack, expensive context switches, kernel creation overhead). Developers pool platform threads to recycle them. In contrast, Java 21 Virtual Threads are ultra-lightweight (~several hundred bytes on heap) ephemeral Java objects managed in user space. Pooling virtual threads reintroduces blocking queues, contention, and thread-local state leakage! Instead, the canonical Java 21 paradigm is "Thread-Per-Task": use Executors.newVirtualThreadPerTaskExecutor(), creating a fresh virtual thread for every incoming request and letting it be collected by GC when completed.',
        vi: '1. Cơ chế đóng gói bit ctl trong ThreadPoolExecutor: Để đảm bảo việc kiểm tra trạng thái pool (RUNNING, SHUTDOWN, STOP, TIDYING, TERMINATED) và cập nhật số lượng luồng đang chạy có thể thực hiện trong ĐÚNG MỘT LỆNH CAS phần cứng duy nhất mà không cần mutex, Doug Lea đã đóng gói cả hai vào biến AtomicInteger ctl: 3 bit đầu tiên lưu trữ runState (-1 << 29 là RUNNING, 0 << 29 là SHUTDOWN...), và 29 bit còn lại lưu trữ workerCount (sức chứa tối đa hơn 536 triệu luồng). Một lệnh CAS trên ctl sẽ thay đổi trạng thái và tăng số lượng worker cùng lúc một cách nguyên tử! 2. Tại sao Pool Virtual Threads là Anti-Pattern: Thread Pool truyền thống ra đời vì luồng OS quá nặng (1MB stack, context switch tốn kém, syscall tạo luồng chậm). Ta dùng pool để tái sử dụng luồng. Ngược lại, Virtual Threads trong Java 21 là các đối tượng Java siêu nhẹ (vài trăm byte trên Heap), sinh ra và chết đi cực nhanh. Việc tạo pool cho Virtual Thread sẽ vô tình mang lại hàng đợi chờ nghẽn, tranh chấp khóa và nguy cơ rò rỉ ThreadLocal! Chuẩn mực của Java 21 là mô hình "Thread-Per-Task": dùng Executors.newVirtualThreadPerTaskExecutor(), sinh một luồng ảo mới toanh cho mỗi request và để Garbage Collector tự dọn dẹp khi task hoàn thành.'
      },
      trapWarning: {
        en: 'If you need to limit concurrency with Virtual Threads (e.g. limiting database connections to 20), NEVER restrict the number of virtual threads! Instead, spawn virtual threads freely and guard the shared resource with a java.util.concurrent.Semaphore(20).',
        vi: 'Nếu cần giới hạn số lượng tác vụ đồng thời khi dùng Virtual Threads (như chỉ cho phép tối đa 20 kết nối vào database), TUYỆT ĐỐI KHÔNG bóp số lượng luồng ảo! Hãy cứ tạo luồng ảo thoải mái và bảo vệ tài nguyên chia sẻ bằng một đối tượng Semaphore(20).'
      },
      proTip: {
        en: 'Explain ForkJoinPool Work-Stealing: Each ForkJoinPool worker thread owns a double-ended queue (deque). The owner pushes and pops tasks from the HEAD (LIFO order, maximizing CPU L1 cache locality). Idle worker threads steal tasks from the TAIL (FIFO order), drastically minimizing CAS contention between the owner and the thief.',
        vi: 'Giải thích cơ chế Work-Stealing trong ForkJoinPool: Mỗi luồng sở hữu một hàng đợi 2 đầu (deque). Luồng chủ nạp và lấy việc ở ĐẦU hàng đợi (thứ tự LIFO để tối ưu hóa CPU cache L1). Các luồng rảnh rỗi đi "ăn trộm" việc từ ĐUÔI hàng đợi (thứ tự FIFO), giúp giảm thiểu tối đa tranh chấp CAS giữa luồng chủ và luồng đi trộm.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'Cascading Microservice OutOfMemoryError Induced by Executors.newFixedThreadPool()',
      vi: 'Sập Toàn Bộ Cụm Microservice & Tràn Bộ Nhớ OutOfMemoryError Do Dùng Executors.newFixedThreadPool()'
    },
    businessContext: {
      en: 'An enterprise order processing service integrates with an external third-party payment provider. Normal daytime load is 300 orders/sec. On payday, traffic surges to 4,500 orders/sec, while the third-party gateway suffers severe degradation, with response times stretching from 200ms to 9 seconds.',
      vi: 'Dịch vụ xử lý đơn hàng doanh nghiệp tích hợp với cổng thanh toán bên thứ ba. Ngày thường lưu lượng là 300 đơn/giây. Vào ngày trả lương, lưu lượng tăng vọt lên 4.500 đơn/giây trong khi đối tác cổng thanh toán bị nghẽn mạng nghiêm trọng, độ trễ phản hồi kéo dài từ 200ms lên tới 9 giây.'
    },
    problemDescription: {
      en: 'The application asynchronously offloads payment tasks using Executors.newFixedThreadPool(32). Under the hood, this convenience factory passes an unbounded LinkedBlockingQueue with capacity Integer.MAX_VALUE (2.14 billion tasks). Because all 32 worker threads are blocked waiting 9 seconds for the sluggish payment gateway, none of them can consume tasks. Over five minutes of high traffic, 1.3 million pending tasks accumulate in the unbounded queue inside Heap memory. Each task captures HTTP session context, payload JSON strings, and database connections. The JVM garbage collector freezes in continuous Stop-The-World full GC cycles before crashing catastrophically with "java.lang.OutOfMemoryError: Java heap space", killing all other healthy microservice endpoints running on the same container node.',
      vi: 'Hệ thống xử lý bất đồng bộ các yêu cầu thanh toán bằng Executors.newFixedThreadPool(32). Bên trong mã nguồn JDK, hàm tiện ích này khởi tạo một hàng đợi LinkedBlockingQueue vô hạn với sức chứa Integer.MAX_VALUE (2.14 tỷ task). Vì toàn bộ 32 luồng worker đều bị treo cứng chờ 9 giây từ cổng thanh toán đối tác, không có luồng nào xử lý được việc. Trong 5 phút cao điểm, 1.3 triệu task dồn ứ ngập ngụa trong hàng đợi trên bộ nhớ Heap. Mỗi task giữ toàn bộ ngữ cảnh HTTP session, chuỗi JSON đơn hàng và đối tượng kết nối. Bộ gom rác JVM rơi vào tình trạng đơ cứng liên tục vì Full GC trước khi sập nguồn hoàn toàn với lỗi "java.lang.OutOfMemoryError: Java heap space", kéo theo tất cả các API lành lặn khác trên cùng cụm server chết chùm.'
    },
    whyNaiveFails: {
      en: 'Simply throwing more memory at the container (e.g. increasing -Xmx from 4GB to 16GB) only delays the crash by a few minutes. Unbounded queues violate the fundamental physical law of backpressure: when a consumer slows down, the producer must be throttled.',
      vi: 'Tăng RAM đơn thuần cho container (như tăng -Xmx từ 4GB lên 16GB) chỉ kéo dài thời gian chờ chết thêm vài phút. Hàng đợi không giới hạn vi phạm nguyên lý vật lý cơ bản về áp lực ngược (Backpressure): Khi bên tiêu thụ bị chậm, bắt buộc phải hãm tốc độ bên sản xuất.'
    },
    coreSolution: {
      en: '1. Bounded Work Queues: Explicitly instantiate ThreadPoolExecutor with ArrayBlockingQueue<>(1000). Once the queue holds 1,000 tasks and max threads are busy, further submissions cannot enter RAM.\n2. CallerRunsPolicy Natural Backpressure: When rejected, the Calling Thread (e.g., Tomcat HTTP thread) executes the task directly. Because the Tomcat thread is busy running the heavy task, it cannot accept new TCP sockets, automatically forcing the client request rate to slow down at the OS network level without any memory bloat!\n3. Isolated Circuit Breaker & Bulkhead: Encapsulate external calls inside Resilience4j with strict 2-second timeouts and thread isolation.',
      vi: '1. Hàng Đợi Có Giới Hạn (Bounded Queue): Tự tay khởi tạo ThreadPoolExecutor với ArrayBlockingQueue<>(1000). Một khi hàng đợi đạt 1.000 task và số luồng chạm tối đa, không task nào được phép nhồi thêm vào RAM.\n2. Áp Lực Ngược Tự Nhiên Bằng CallerRunsPolicy: Khi hàng đợi bị đầy, chính Luồng Gọi (luồng HTTP Tomcat) BẮT BUỘC PHẢI TỰ CHẠY TASK ĐÓ một cách đồng bộ. Vì luồng Tomcat bận chạy task, nó không thể nhận thêm kết nối TCP mới, tự động hãm phanh dòng traffic từ phía client ở tầng mạng hệ điều hành mà không làm tốn thêm một byte RAM nào!\n3. Cô Lập Ngăn Cháy (Bulkhead) & Circuit Breaker: Bọc các cuộc gọi bên thứ ba qua Resilience4j với thời gian timeout 2 giây và mạch ngắt tự động.'
    },
    productionCode: `// Enterprise Spring Boot 3.x ThreadPool Configuration with CallerRunsPolicy Backpressure
@Configuration
@EnableAsync
public class ProductionAsyncExecutorConfig {

    @Bean(name = "paymentThreadPool")
    public Executor paymentThreadPool() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // Core workers always alive
        executor.setCorePoolSize(16);
        // Burst capacity during traffic spikes
        executor.setMaxPoolSize(32);
        // Bounded queue: Prevents OutOfMemoryError under all circumstances!
        executor.setQueueCapacity(1000);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("payment-worker-");

        // CRITICAL: CallerRunsPolicy applies natural backpressure to Tomcat HTTP threads!
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // Graceful shutdown: Allow active tasks to drain before container termination
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}`,
    architectureImpact: {
      en: '100% elimination of OutOfMemoryError crashes under extreme traffic spikes. P99 latency capped at the circuit breaker threshold (2.0s). Memory footprint stayed flat at 1.4GB regardless of incoming load.',
      vi: 'Triệt tiêu 100% nguy cơ sập máy chủ do OutOfMemoryError khi lưu lượng tăng đột biến. Độ trễ P99 được khống chế trần an toàn theo ngưỡng ngắt mạch (2.0s). Mức tiêu thụ RAM giữ phẳng ở mức 1.4GB bất kể lưu lượng request dồn về lớn đến đâu.'
    }
  }
};
