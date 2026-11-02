import type { JavaCoreTopic } from '../types';

export const jdkJreJvmTopic: JavaCoreTopic = {
  id: 'jdk-jre-jvm',
  category: 'java-fundamentals',
  name: 'JDK, JRE, JVM & HotSpot JIT Architecture',
  tagline: {
    en: 'Architecture breakdown: Java Development Kit vs Runtime Environment vs Virtual Machine, bytecode verification, and tiered JIT compilation (C1 vs C2).',
    vi: 'Phân tích kiến trúc: JDK vs JRE vs JVM, quy trình thẩm định Bytecode và cơ chế biên dịch JIT phân tầng (C1 vs C2).'
  },
  difficulty: 1,
  level: 'basic',
  order: 1,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Modern enterprise applications must run reliably across diverse hardware architectures (x86_64, ARM64, Apple Silicon, RISC-V) without recompiling source code for each target operating system. Compiling directly to native machine code produces platform-locked binaries and exposes systems to memory corruption vulnerabilities (buffer overflows, dangling pointers).',
      vi: 'Ứng dụng doanh nghiệp hiện đại phải chạy tin cậy trên nhiều kiến trúc phần cứng khác nhau (x86_64, ARM64, Apple Silicon, RISC-V) mà không phải biên dịch lại mã nguồn cho từng hệ điều hành. Việc dịch thẳng ra mã máy nhị phân sẽ trói buộc ứng dụng vào một nền tảng và dễ dẫn đến lỗ hổng tràn bộ nhớ, con trỏ treo.'
    },
    hardwareConstraint: {
      en: 'CPUs execute raw native machine instructions dictated by their Instruction Set Architecture (ISA). Directly interpreting high-level code is 50x-100x slower than native CPU execution due to the absence of instruction pipelining, CPU register allocation, and hardware branch prediction optimization.',
      vi: 'CPU chỉ thực thi trực tiếp các tập lệnh máy nhị phân theo kiến trúc ISA. Trình thông dịch thuần túy (Interpreter) chậm hơn 50 đến 100 lần so với mã máy gốc do không tận dụng được đường ống lệnh CPU (pipelining), thanh ghi phần cứng và dự đoán rẽ nhánh.'
    },
    fundamentalSolution: {
      en: 'The Java Platform implements the "Write Once, Run Anywhere" (WORA) paradigm through a 3-layer architecture: JDK (developer toolchain: javac, jdb, jdeps), JRE (runtime libraries + core JVM classes), and the JVM (HotSpot). HotSpot employs Tiered Compilation: Interpreter starts instantaneously, C1 (Client Compiler) applies fast optimizations, and C2 (Server Compiler) generates highly optimized native assembly for hot execution paths using runtime profiling.',
      vi: 'Nền tảng Java hiện thực hóa triết lý "Write Once, Run Anywhere" qua kiến trúc 3 tầng: JDK (bộ công cụ phát triển: javac, jdb, jdeps), JRE (thư viện runtime + lớp cốt lõi), và JVM (HotSpot). HotSpot áp dụng Biên dịch phân tầng (Tiered Compilation): Interpreter khởi động tức thì, C1 JIT tối ưu nhanh, và C2 Server JIT dịch các đoạn mã "hot" thành mã máy tối ưu cực hạn bằng dữ liệu profiling thời gian chạy.'
    },
    math: {
      formula: 'JDK = JRE + Development_Tools (javac, jstack, jmap, jcmd); JRE = JVM + Core_Class_Libraries (rt.jar / java.base)',
      description: {
        en: 'The HotSpot JVM JIT compilation triggers when method invocation counter + backedge loop counter exceeds the compile threshold: (InvocationCounter + BackedgeCounter) > Tier3CompileThreshold (default 2,000 for C1, 10,000 for C2).',
        vi: 'HotSpot JVM kích hoạt JIT biên dịch khi tổng số lần gọi hàm và vòng lặp vượt ngưỡng: (InvocationCounter + BackedgeCounter) > Tier3CompileThreshold (mặc định 2,000 cho C1, 10,000 cho C2).'
      },
      timeComplexity: 'O(1) direct native execution once JIT-compiled; ~50ns interpreter bytecode dispatch overhead',
      spaceComplexity: 'Metaspace holds JVM class metadata; CodeCache (default 240MB) holds compiled JIT native machine assembly',
      memoryOverheadFormula: 'Total JVM RAM = Heap (-Xmx) + Metaspace (-XX:MaxMetaspaceSize) + CodeCache (-XX:ReservedCodeCacheSize) + (ThreadCount * -Xss)'
    }
  },

  memoryLayout: {
    title: {
      en: 'Platform Architecture: JDK Tooling -> JRE Core Modules -> HotSpot Execution Subsystems',
      vi: 'Kiến Trúc Nền Tảng: Công Cụ JDK -> Module Lõi JRE -> Bộ Máy Thực Thi HotSpot JVM'
    },
    description: {
      en: 'Source .java files are compiled by javac into .class bytecode. The JVM ClassLoader subsystem loads, links, and verifies the 0xCAFEBABE binary, which is executed via Interpreter and tiered JIT compilers (C1 and C2).',
      vi: 'Mã nguồn .java được javac dịch thành bytecode .class. Phân hệ ClassLoader nạp, liên kết và thẩm định file nhị phân 0xCAFEBABE, sau đó bộ máy HotSpot thực thi qua Interpreter song song với C1 và C2 JIT Compiler.'
    },
    asciiDiagram: `
+-----------------------------------------------------------------------------------------+
|                                    JAVA DEVELOPMENT KIT (JDK)                           |
|  +-----------------------------------------------------------------------------------+  |
|  | Developer Tools: javac (Compiler), javadoc, jar, jcmd, jstack, jmap, jconsole     |  |
|  +-----------------------------------------------------------------------------------+  |
|                                            |
|                                            v
|  +-----------------------------------------------------------------------------------+  |
|  |                             JAVA RUNTIME ENVIRONMENT (JRE)                        |  |
|  |  +-----------------------------------------------------------------------------+  |  |
|  |  | Core Module Libraries: java.base, java.sql, java.net, java.logging, rt.jar   |  |  |
|  |  +-----------------------------------------------------------------------------+  |  |
|  |                                         |                                         |  |
|  |                                         v                                         |  |
|  |  +-----------------------------------------------------------------------------+  |  |
|  |  |                      JAVA VIRTUAL MACHINE (HOTSPOT JVM)                     |  |  |
|  |  |  [ ClassLoader Subsystem: Loading -> Linking (Verify/Prep) -> Initializing ]|  |  |
|  |  |  [ Runtime Data Areas: Java Heap | Metaspace | JVM Stacks | PC Registers ]   |  |  |
|  |  |  [ Execution Engine: Interpreter -> C1 JIT -> C2 Server JIT -> Garbage Col ]|  |  |
|  |  +-----------------------------------------------------------------------------+  |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'Magic Number', size: '4 Bytes', description: { en: 'Fixed 0xCAFEBABE identifier verifying valid Java bytecode binary.', vi: 'Mã định danh cố định 0xCAFEBABE xác thực file nhị phân Java bytecode hợp lệ.' } },
      { name: 'Class File Version', size: '4 Bytes', description: { en: 'Minor (2B) + Major (2B) version (e.g. Major 65 = Java 21).', vi: 'Phiên bản class file (Major 65 tương ứng với Java 21 LTS).' } },
      { name: 'Constant Pool Count', size: '2 Bytes', description: { en: 'Number of symbolic references, class names, method names, and literals.', vi: 'Số lượng phần tử trong bảng hằng (tên lớp, phương thức, chuỗi literal).' } },
      { name: 'CodeCache', size: '240MB (Default)', description: { en: 'Native OS memory region storing JIT-compiled C1/C2 x86_64/ARM64 machine instructions.', vi: 'Vùng nhớ native lưu các lệnh máy nhị phân x86_64/ARM64 do C1/C2 JIT biên dịch.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'The Java platform execution model is built upon a layered decoupling of compilation and runtime execution. From the static javac front-end compiler generating architecture-neutral bytecode, through the dynamic ClassLoader verification pipeline, to HotSpot tiered JIT compilation (Level 0 Interpreter up to Level 4 C2 Server Compiler), Java balances immediate startup with peak native machine performance.',
      vi: 'Mô hình thực thi nền tảng Java được thiết kế trên sự tách biệt tầng giữa biên dịch và thực thi runtime. Từ trình biên dịch tĩnh javac sinh mã bytecode độc lập kiến trúc, qua đường ống thẩm định ClassLoader, đến bộ máy JIT phân tầng của HotSpot (Level 0 Interpreter lên tới Level 4 C2 Server Compiler), Java cân bằng hoàn hảo giữa khả năng khởi động nhanh và hiệu năng mã máy gốc cực hạn.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Bytecode Verification and Security Sandbox: Before any byte of class file is executed, the JVM Bytecode Verifier enforces strict safety invariants. It verifies that the 0xCAFEBABE magic header exists, constant pool entries are structurally sound, target branch instructions do not jump beyond method boundaries, operands on the stack match operator type signatures, and local variables are properly initialized before access. This prevents stack-smashing and memory pointer tampering at the virtual machine boundary.',
        vi: '1. Thẩm định Bytecode và Hộp cát bảo mật: Trước khi bất kỳ byte mã nào được thực thi, bộ kiểm định Bytecode Verifier của JVM áp đặt các bất biến bảo mật nghiêm ngặt. Hệ thống kiểm tra magic number 0xCAFEBABE, cấu trúc bảng hằng, đảm bảo lệnh rẽ nhánh không nhảy vượt ngoài giới hạn hàm, kiểu dữ liệu toán hạng trên stack khớp với chữ ký toán tử, và biến cục bộ được khởi tạo hợp lệ trước khi truy cập. Cơ chế này triệt tiêu hoàn toàn nguy cơ tràn ngăn xếp (stack-smashing) hay can thiệp con trỏ bộ nhớ.'
      },
      {
        en: '2. HotSpot Tiered Compilation Engine: Rather than choosing between slow interpretation and slow ahead-of-time compilation, HotSpot executes in 5 distinct tiers: Level 0 (Interpreter) runs immediately without delay; Level 1-3 (C1 Client Compiler) performs fast compilation with invocation/backedge profiling; Level 4 (C2 Server Compiler) performs deep, aggressive optimizations. C2 uses runtime profiling data to execute Speculative Inlining, Loop Unrolling, Vectorization (SIMD AVX-512), and Escape Analysis to allocate objects directly on registers/stack (Scalar Replacement) instead of the Heap.',
        vi: '2. Bộ máy biên dịch phân tầng HotSpot JIT: Thay vì đánh đổi giữa thông dịch chậm chạp và biên dịch AOT tốn thời gian khởi động, HotSpot vận hành qua 5 tầng: Level 0 (Interpreter) chạy ngay lập tức; Level 1-3 (C1 Client Compiler) biên dịch nhanh kèm bộ đếm profiling; Level 4 (C2 Server Compiler) áp dụng tối ưu hóa chuyên sâu. C2 dùng dữ liệu profiling thực tế để thực hiện Inlining suy đoán, mở rộng vòng lặp (Loop Unrolling), vector hóa lệnh SIMD và Phân tích thoát (Escape Analysis) để biến đối tượng thành biến nguyên thủy trên thanh ghi/Stack (Scalar Replacement) thay vì cấp phát lên Heap.'
      },
      {
        en: '3. Off-Heap & Native Memory Overhead: A common enterprise mistake is equating JVM memory consumption solely to the Java Heap (-Xmx). The physical RSS (Resident Set Size) of a JVM container encompasses: Heap (-Xmx) + Metaspace (-XX:MaxMetaspaceSize storing classes and method metadata) + CodeCache (-XX:ReservedCodeCacheSize storing JIT machine code) + Thread Native Stacks (ThreadCount * -Xss, default 1MB each) + Garbage Collector data structures (Card Tables, Remembered Sets) + Direct ByteBuffers (Netty off-heap buffers). Capping container RAM without factoring these causes Linux kernel OOMKilled terminations.',
        vi: '3. Bộ nhớ Off-Heap & Chi phí Native Memory: Một sai lầm kinh điển trong doanh nghiệp là đánh đồng dung lượng RAM của ứng dụng Java với Java Heap (-Xmx). Chỉ số RSS (Resident Set Size) thực tế của container bao gồm: Heap (-Xmx) + Metaspace (lưu metadata lớp/phương thức) + CodeCache (lưu mã máy JIT) + Thread Native Stacks (số thread * -Xss, mặc định 1MB/thread) + Cấu trúc dữ liệu của bộ dọn rác GC (Card Tables, Remembered Sets) + Direct ByteBuffers (off-heap Netty). Việc đặt giới hạn RAM container mà không tính đủ các vùng này sẽ kích hoạt cơ chế Linux OOMKilled.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Running legacy Java 8/11 in Docker containers without cgroup v2 awareness or without -XX:MaxRAMPercentage=75.0, causing the JVM to detect host RAM (e.g. 128GB) and allocate a 32GB Heap inside a 2GB container limit, resulting in instantaneous OOMKilled (Exit Code 137).',
        vi: 'Chạy Java trong container Docker mà không cấu hình cgroups hoặc thiếu cờ -XX:MaxRAMPercentage=75.0, khiến JVM nhận diện toàn bộ RAM của máy chủ vật lý (ví dụ 128GB) và tự động cấp phát Heap 32GB trong khi container chỉ được cấp 2GB, dẫn đến việc container bị Linux kernel giết ngay lập tức (Exit Code 137).'
      },
      {
        en: 'CodeCache exhaustion under dynamic runtime class generation (heavy Spring CGLIB proxies, Groovy scripts, reflection). When CodeCache reaches capacity, HotSpot disables JIT compilation permanently, downgrading all execution to the interpreter and causing catastrophic 10x-50x latency spikes.',
        vi: 'Cạn kiệt CodeCache do sinh class động liên tục lúc runtime (Spring CGLIB proxies, Groovy, reflection). Khi CodeCache đầy, HotSpot sẽ tắt vĩnh viễn JIT compiler, đẩy toàn bộ ứng dụng về chế độ thông dịch Interpreter và gây sụt giảm hiệu năng nghiêm trọng từ 10x đến 50x.'
      },
      {
        en: 'GraalVM Native Image build failures due to unconfigured reflection, dynamic class loading, or serialization metadata. The closed-world assumption strips all unreferenced classes at build time, causing runtime ClassNotFoundException in production unless reachability metadata is provided.',
        vi: 'Lỗi vỡ ứng dụng khi đóng gói GraalVM Native Image do thiếu metadata cấu hình Reflection hoặc Dynamic Class Loading. Giả định thế giới đóng (Closed-World Assumption) loại bỏ tất cả các class không thấy trực tiếp lúc build, gây ra ClassNotFoundException lúc chạy thật nếu không dùng Spring Native Hint.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Kubernetes Pod Cold-Start Spikes & Container OOMKilled (Exit Code 137) Cascades',
      vi: 'Sự Cố Khởi Động Chậm (Cold-Start) & Vòng Lặp OOMKilled (Exit Code 137) Trên Kubernetes'
    },
    businessContext: {
      en: 'A tier-1 fintech payment service running on Kubernetes experiences sudden 10x traffic surges during marketing flash campaigns. The Horizontal Pod Autoscaler (HPA) triggers rapid scale-out from 10 to 60 pods.',
      vi: 'Hệ thống thanh toán cốt lõi của fintech chạy trên Kubernetes chịu tải tăng vọt 10x trong các đợt Flash Sale. Hệ thống tự động co giãn HPA kích hoạt mở rộng gấp từ 10 lên 60 pods.'
    },
    problemDescription: {
      en: 'New pods take 38 seconds to start and warm up. During startup, JIT compilation has not yet triggered; unoptimized interpreted bytecode saturates pod CPU at 100%, causing Kubernetes liveness/readiness probes to fail and killing the pods in a restart loop. Simultaneously, pods configured with -Xmx2g inside a 2.5GB container memory limit crash with OOMKilled because Metaspace, CodeCache, and Netty off-heap memory exceed the 500MB headroom.',
      vi: 'Các pod mới mất tới 38 giây để khởi động và hoàn tất chu kỳ warm-up. Trong thời gian này, C2 JIT chưa kịp biên dịch; bytecode chạy thông dịch làm CPU quá tải 100%, khiến Kubernetes readiness probe bị quá hạn (timeout) và khởi động lại pod liên tục. Đồng thời, cấu hình -Xmx2g trong container RAM 2.5GB bị Linux kernel giết (OOMKilled) do Metaspace, CodeCache và Netty Direct Memory vượt quá 500MB bộ đệm còn lại.'
    },
    whyNaiveFails: {
      en: 'Simply raising CPU and memory limits is cost-prohibitive ($20,000/month cloud bill inflation) and does not fix the fundamental startup latency. Shipping 700MB fat Docker images containing entire JDK toolchains congests the cluster image registry network during auto-scale bursts.',
      vi: 'Cách xử lý ngây thơ là tăng vọt CPU và RAM của container làm đội chi phí hạ tầng thêm 20,000 USD/tháng mà không giải quyết được gốc rễ độ trễ khởi động. Đóng gói Docker image nặng 700MB chứa toàn bộ công cụ JDK làm nghẽn băng thông kéo image (image pull) của toàn cụm Kubernetes khi nhân rộng pod.'
    },
    coreSolution: {
      en: 'Implement a multi-stage Docker build utilizing jlink to strip unused JDK modules down to a tailored 45MB runtime. Configure container-aware JVM ergonomics (-XX:MaxRAMPercentage=75.0, -XX:+UseContainerSupport) and provide explicit CodeCache/Metaspace limits. For sub-second auto-scaling, compile performance-critical services into GraalVM Native Images via Spring Boot 3 AOT.',
      vi: 'Áp dụng Docker đa tầng (Multi-stage build) sử dụng công cụ jlink cắt gọt các module JDK thừa, tạo ra runtime tối giản chỉ 45MB. Cấu hình các cờ JVM chuyên dụng cho container (-XX:MaxRAMPercentage=75.0, -XX:+UseContainerSupport) cùng hạn mức CodeCache/Metaspace rõ ràng. Với service cần scale tức thì, đóng gói GraalVM Native Image qua Spring Boot 3 AOT giúp khởi động dưới 50ms.'
    },
    productionCode: `# Multi-stage Production Dockerfile with jlink Custom Minimal JRE
# Stage 1: Build & analyze module dependencies via jdeps
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY target/payment-service.jar app.jar

# Extract application layers & detect required Java modules
RUN jar xf app.jar && \\
    jdeps --ignore-missing-deps --multi-release 21 --print-module-deps \\
    --class-path "BOOT-INF/lib/*" app.jar > modules.txt

# Build custom minimal JRE (drops javac, jdb, unneeded modules)
RUN $JAVA_HOME/bin/jlink \\
    --add-modules $(cat modules.txt),jdk.crypto.ec,jdk.management \\
    --strip-debug \\
    --no-man-pages \\
    --no-header-files \\
    --compress=2 \\
    --output /custom-jre

# Stage 2: Minimal Distroless / Alpine Production Image (<65MB total)
FROM alpine:3.19
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="$JAVA_HOME/bin:$PATH"
COPY --from=builder /custom-jre $JAVA_HOME

WORKDIR /opt/app
COPY --from=builder /app/app.jar .

# Container-aware JVM ergonomics:
# 1. MaxRAMPercentage=75 leaves 25% for Metaspace, CodeCache, Netty Direct Memory
# 2. Strict ReservedCodeCacheSize prevents unconstrained native memory growth
# 3. UseG1GC or UseZGC with Generational mode
ENTRYPOINT ["java", \\
  "-XX:+UseContainerSupport", \\
  "-XX:MaxRAMPercentage=75.0", \\
  "-XX:ReservedCodeCacheSize=128m", \\
  "-XX:MaxMetaspaceSize=192m", \\
  "-XX:+UseG1GC", \\
  "-XX:+ExitOnOutOfMemoryError", \\
  "-jar", "app.jar"]`,
    architectureImpact: {
      en: 'Container image size reduced from 680MB to 58MB (91% reduction); image pull time dropped from 45s to 2.8s; JVM pod initialization dropped from 38s to 2.4s; Zero container OOMKilled terminations under peak 50,000 req/s loads.',
      vi: 'Dung lượng Docker image giảm từ 680MB xuống 58MB (giảm 91%); thời gian kéo image giảm từ 45s xuống 2.8s; thời gian khởi động pod giảm từ 38s xuống 2.4s; Triệt tiêu hoàn toàn lỗi container OOMKilled khi chịu tải đỉnh 50,000 req/s.'
    }
  },

  steps: [
    {
      id: 'source-compile-javac',
      title: { en: '1. Source Compilation via javac (JDK)', vi: '1. Biên Dịch Mã Nguồn Qua Trình Biên Dịch javac (JDK)' },
      phase: 'JDK_COMPILATION',
      description: {
        en: 'Developer compiles OrderService.java using javac. javac parses AST, validates syntax, and outputs platform-independent bytecode inside OrderService.class starting with magic 0xCAFEBABE.',
        vi: 'Lập trình viên dùng javac biên dịch OrderService.java. javac phân tích cú pháp cây AST và xuất ra file bytecode OrderService.class bắt đầu bằng 4 byte ma thuật 0xCAFEBABE.'
      },
      jvmRuntimeBehavior: {
        en: 'Static AST compilation with zero CPU machine code generated; produces portable virtual instructions.',
        vi: 'Biên dịch tĩnh tạo mã bytecode trung gian, hoàn toàn không phụ thuộc vào CPU x86 hay ARM.'
      },
      javaCodeLineMatch: 'javac OrderService.java -> OrderService.class'
    },
    {
      id: 'classload-verify',
      title: { en: '2. ClassLoading & Bytecode Verification (JVM)', vi: '2. Nạp Lớp & Thẩm Định Bytecode Bảo Mật (JVM)' },
      phase: 'JVM_CLASSLOADING',
      description: {
        en: 'The JVM ClassLoader reads the .class file from disk/network. The Bytecode Verifier performs static analysis to ensure no stack overflow exploits, illegal type casts, or direct arbitrary pointer manipulation.',
        vi: 'Bộ nạp ClassLoader đọc file .class từ ổ cứng hoặc mạng. Bytecode Verifier quét kiểm tra để bảo đảm không có mã độc thao túng con trỏ trái phép hay gây tràn ngăn xếp toán hạng.'
      },
      jvmRuntimeBehavior: {
        en: 'Metaspace allocates C++ InstanceKlass struct; Verifier checks type safety and operand stack depths.',
        vi: 'Cấp phát InstanceKlass trong Metaspace; Verifier duyệt mã để bảo đảm an toàn bộ nhớ tuyệt đối.'
      },
      javaCodeLineMatch: 'java OrderService'
    },
    {
      id: 'tiered-jit-execution',
      title: { en: '3. Tiered JIT Compilation (Interpreter -> C1 -> C2)', vi: '3. Biên Dịch JIT Phân Tầng (Interpreter -> C1 -> C2)' },
      phase: 'JIT_TIERED_COMPILATION',
      description: {
        en: 'HotSpot begins executing via Interpreter. As executeOrder() is called frequently, Tier 3 (C1 JIT) compiles it with profiling hooks. When loop counters exceed 10,000, Tier 4 (C2 Server JIT) compiles it into native machine code with loop unrolling and inlining.',
        vi: 'HotSpot ban đầu chạy bằng Interpreter. Khi hàm executeOrder() được gọi liên tục, C1 JIT biên dịch nhanh. Khi vượt 10,000 lần, C2 Server JIT dịch thành mã máy nhị phân tối ưu cực hạn.'
      },
      jvmRuntimeBehavior: {
        en: 'Replaces bytecode interpreter dispatch with direct CPU instruction pointer (EIP/RIP) execution.',
        vi: 'Chuyển đổi hoàn toàn lời gọi thông dịch sang con trỏ lệnh trực tiếp trên thanh ghi CPU.'
      },
      javaCodeLineMatch: '// JIT Compiled Native Assembly in CodeCache'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Oracle HotSpot JVM 21',
      implementationName: 'Tiered JIT Compilation (C1 Client + C2 Server)',
      keyMechanism: {
        en: 'Balances ultra-fast startup with maximum steady-state throughput by progressively promoting bytecode through 5 compilation tiers (0: Interpreter, 1-3: C1, 4: C2).',
        vi: 'Cân bằng khởi động nhanh và thông lượng cực đại nhờ 5 cấp độ biên dịch (Tier 0: Interpreter, Tier 1-3: C1 JIT, Tier 4: C2 Server JIT).'
      },
      defaultFlags: '-XX:+TieredCompilation -XX:ReservedCodeCacheSize=240M -XX:CICompilerCount=4',
      architectureNote: {
        en: 'If CodeCache fills up, the JVM disables JIT compilation and reverts to pure Interpreter mode, degrading performance by 90%!',
        vi: 'Nếu vùng CodeCache bị đầy, JVM sẽ tắt JIT và quay về chạy thông dịch làm sụt giảm 90% hiệu năng!'
      }
    },
    {
      jvmEngine: 'GraalVM Native Image',
      implementationName: 'Ahead-Of-Time (AOT) SubstrateVM',
      keyMechanism: {
        en: 'Compiles Java bytecode directly into a standalone platform-specific binary executable during build time, completely bypassing JVM ClassLoading and JIT warmup.',
        vi: 'Dịch thẳng bytecode thành file chạy native độc lập lúc build (AOT), loại bỏ hoàn toàn ClassLoader và thời gian khởi động (warmup) của JVM.'
      },
      defaultFlags: 'native-image -O3 --no-fallback',
      architectureNote: {
        en: 'Reduces startup time from 2.5s down to 0.005s and cuts memory footprint from 300MB down to 35MB for microservices.',
        vi: 'Giảm thời gian khởi động từ 2.5s xuống còn 5 mili giây và giảm RAM từ 300MB xuống 35MB cho container microservice.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Write Once, Run Anywhere: Same compiled bytecode executes identically across Linux x86, macOS ARM64, and Windows.',
        vi: 'Viết một lần, chạy mọi nơi: Bytecode chạy tương thích 100% trên cả Linux x86, macOS ARM64 và Windows.'
      },
      {
        en: 'Adaptive Dynamic Optimization: C2 JIT uses runtime profiling data to optimize code based on actual production traffic patterns.',
        vi: 'Tối ưu hóa động thích ứng: C2 JIT tận dụng số liệu thực tế lúc chạy để tối ưu mã vượt trội so với C++ biên dịch tĩnh.'
      }
    ],
    cons: [
      {
        en: 'JVM Warmup Latency: Applications suffer slower response times during the first 30-60 seconds while JIT compiles hot methods.',
        vi: 'Độ trễ Warmup khởi động: Ứng dụng phản hồi chậm hơn trong 30-60 giây đầu khi JIT đang theo dõi và biên dịch mã.'
      },
      {
        en: 'Memory Overhead: JVM requires substantial native memory for Metaspace, CodeCache, and GC internal book-keeping structures.',
        vi: 'Tiêu tốn RAM nền tảng: JVM tốn thêm bộ nhớ native cho Metaspace, CodeCache và cấu trúc quản lý của bộ thu gom rác.'
      }
    ],
    memoryFootprint: {
      en: 'Base JVM overhead is ~80MB-150MB before application Heap allocations. CodeCache allocates 240MB reserved native memory by default.',
      vi: 'Overhead cơ sở của JVM tốn khoảng 80MB-150MB native RAM trước khi cấp phát Heap. CodeCache giữ chỗ sẵn 240MB RAM.'
    },
    jvmSpecificationGuarantee: {
      en: 'JVM Specification §4.1: Any class file satisfying bytecode verification rules is guaranteed safe execution without native memory corruption.',
      vi: 'Đặc tả JVM §4.1: Mọi file class thỏa mãn quy tắc thẩm định bytecode đều được bảo đảm chạy an toàn, không thể làm hỏng bộ nhớ hệ điều hành.'
    }
  },

  javaCode: `package com.engine.fundamentals;

/**
 * Demonstrates JIT Tiered Compilation and Bytecode Execution Verification.
 * Run with: java -XX:+PrintCompilation -XX:+TieredCompilation JdkArchitectureDemo
 */
public class JdkArchitectureDemo {

    public static void main(String[] args) {
        System.out.println("Java Vendor:  " + System.getProperty("java.vendor"));
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("JVM Engine:   " + System.getProperty("java.vm.name"));

        long startTime = System.nanoTime();

        // Warmup loop: Triggers HotSpot Tiered Compilation
        // Iterations 1 - 2,000: Interpreted
        // Iterations 2,000 - 10,000: C1 JIT Compiled (Tier 3)
        // Iterations 10,000+: C2 JIT Compiled (Tier 4 Native Assembly)
        long sum = 0;
        for (int i = 0; i < 50_000; i++) {
            sum += computeOrderTax(i, 100);
        }

        long durationNs = System.nanoTime() - startTime;
        System.out.printf("Finished 50,000 iterations in %.2f ms (Sum=%d)%n",
                durationNs / 1_000_000.0, sum);
    }

    // Method will be inlined and compiled into direct CPU machine code by C2 JIT
    private static long computeOrderTax(long basePrice, int taxRatePercent) {
        return (basePrice * taxRatePercent) / 100;
    }
}`,

  jvmFlagsCode: `# Diagnostic flags for HotSpot JIT Compilation & CodeCache
# 1. Print methods as they are JIT compiled by C1/C2
-XX:+PrintCompilation

# 2. View JIT inlining decisions
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintInlining

# 3. CodeCache sizing for massive microservices
-XX:ReservedCodeCacheSize=512m
-XX:InitialCodeCacheSize=64m`,

  bytecodeInspection: `// Disassembly of computeOrderTax(JI)J via javap -c
Code:
   0: lload_0          // Push basePrice (64-bit long) onto operand stack
   1: iload_2          // Push taxRatePercent (32-bit int) onto operand stack
   2: i2l              // Convert int to long for 64-bit arithmetic
   3: lmul             // Multiply (basePrice * taxRatePercent)
   4: ldc2_w    #7     // Push constant 100L onto stack
   7: ldiv             // Divide result by 100L
   8: lreturn          // Return 64-bit long primitive`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What is the precise difference between JDK, JRE, and JVM?',
        vi: 'Sự khác biệt chính xác giữa JDK, JRE và JVM là gì?'
      },
      answer: {
        en: 'JVM (Java Virtual Machine) is the abstract execution engine that executes bytecode, manages memory (Heap/Stack), and handles Garbage Collection. JRE (Java Runtime Environment) bundles the JVM with core class libraries (java.base, rt.jar) required to RUN Java programs. JDK (Java Development Kit) is the superset containing the JRE PLUS developer tools (javac compiler, debugger, jstack, jmap, jcmd) needed to BUILD Java applications.',
        vi: 'JVM (Máy ảo Java) là bộ máy thực thi bytecode, quản lý bộ nhớ (Heap/Stack) và dọn rác GC. JRE (Môi trường thực thi) bao gồm JVM cộng với các thư viện lớp lõi (java.base) để CHẠY ứng dụng. JDK (Bộ phát triển) là tập mẹ chứa JRE cùng các công cụ phát triển (trình biên dịch javac, trình gỡ lỗi, jstack, jmap, jcmd) để XÂY DỰNG ứng dụng.'
      },
      trapWarning: {
        en: 'Do not say JRE is still a separate download in modern Java. Since Java 9 (Project Jigsaw modularization), Oracle and OpenJDK vendors no longer distribute standalone JRE installers; developers use jlink to create minimal custom runtimes.',
        vi: 'Đừng trả lời JRE vẫn là bộ cài riêng biệt. Từ Java 9 (Project Jigsaw), các hãng đã bỏ bản cài JRE rời; lập trình viên dùng công cụ jlink để đóng gói runtime tối giản cho container.'
      },
      proTip: {
        en: 'Mention that Docker production images typically use lightweight JDK or jlink slim images (e.g., Eclipse Temurin Alpine) rather than full developer JDKs to reduce container attack surface and image size.',
        vi: 'Nhắc đến việc Docker production dùng image tối giản tạo bởi jlink (Eclipse Temurin Alpine) để giảm bề mặt tấn công bảo mật và dung lượng ổ cứng.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What is JIT Compilation, and how does Tiered Compilation work in HotSpot JVM?',
        vi: 'JIT Compilation là gì và cơ chế Tiered Compilation hoạt động như thế nào trong HotSpot JVM?'
      },
      answer: {
        en: 'JIT (Just-In-Time) compiler translates bytecode into native CPU machine instructions at runtime. HotSpot uses Tiered Compilation: Level 0 is the Interpreter (zero compilation lag). As methods accumulate invocation counts, Level 1-3 (C1 Client Compiler) performs quick optimizations with profiling instrumentation. Once a method is deemed hot (>10,000 invocations), Level 4 (C2 Server Compiler) applies aggressive optimizations: method inlining, loop unrolling, and escape analysis.',
        vi: 'JIT (Just-In-Time) biên dịch bytecode thành mã máy CPU trực tiếp khi ứng dụng đang chạy. HotSpot dùng cơ chế Phân tầng (Tiered Compilation): Level 0 là Interpreter thông dịch ngay không có độ trễ khởi động. Khi hàm được gọi nhiều, Level 1-3 (C1 Client) biên dịch nhanh kèm bộ đếm profiling. Khi hàm đạt độ "hot" (>10,000 lần gọi), Level 4 (C2 Server) tối ưu cực đại: inlining mã, mở vòng lặp và phân tích thoát (Escape Analysis).'
      },
      trapWarning: {
        en: 'Candidates often claim Java is purely interpreted. Clarify that Java is a HYBRID platform: interpreted during startup, but predominantly executed as native machine code once warmed up.',
        vi: 'Ứng viên hay nhầm Java là ngôn ngữ thuần thông dịch. Cần làm rõ Java là nền tảng LAI (Hybrid): thông dịch lúc đầu, nhưng chạy 100% bằng mã máy native sau giai đoạn warmup.'
      },
      proTip: {
        en: 'Explain Deoptimization: If C2 compiles code under an optimistic speculative assumption (e.g., receiver class is always Class A) and that assumption is violated (Class B arrives), the JVM safely deoptimizes and falls back to the Interpreter or C1.',
        vi: 'Giải thích cơ chế Deoptimization: Nếu C2 suy đoán lạc quan (chỉ có Class A) nhưng sau đó Class B xuất hiện, JVM sẽ tự động deoptimize và lùi về Interpreter an toàn mà không sập hệ thống.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'What is Ahead-of-Time (AOT) compilation with GraalVM Native Image, and what are its trade-offs compared to traditional JIT?',
        vi: 'Biên dịch Ahead-of-Time (AOT) bằng GraalVM Native Image là gì và đánh đổi so với JIT truyền thống?'
      },
      answer: {
        en: 'GraalVM Native Image analyzes all reachable code under a Closed-World Assumption during build time and compiles it directly into a standalone OS-specific native executable without a JVM. Advantages: instant startup (~5ms) and tiny memory footprint (~35MB), ideal for Serverless/AWS Lambda and auto-scaling Kubernetes pods. Trade-offs: C2 JIT can often achieve higher peak steady-state throughput due to runtime profiling, and AOT requires explicit reflection/JNI configuration metadata.',
        vi: 'GraalVM Native Image phân tích toàn bộ code có thể chạm tới theo Giả định thế giới đóng (Closed-World Assumption) ngay lúc build và dịch thẳng ra file thực thi native của OS không cần JVM. Ưu điểm: Khởi động tức thì (~5ms), tốn cực ít RAM (~35MB), cực kỳ lý tưởng cho Serverless và Kubernetes. Đánh đổi: C2 JIT có thể đạt thông lượng đỉnh (peak throughput) cao hơn nhờ profiling lúc chạy, và AOT đòi hỏi cấu hình Reflection/JNI phức tạp.'
      },
      trapWarning: {
        en: 'Do not assume GraalVM Native Image is always faster than HotSpot C2. In long-running high-throughput monoliths, C2 JIT often outperforms AOT binaries because it optimizes for real production data distributions.',
        vi: 'Đừng nghĩ AOT luôn nhanh hơn HotSpot C2. Với ứng dụng chạy liên tục nhiều tuần, C2 JIT thường có thông lượng cao hơn vì nó tối ưu theo đúng luồng dữ liệu thực tế phát sinh.'
      },
      proTip: {
        en: 'Frame the decision rule: Use AOT (GraalVM / Spring Boot 3 Native) for ephemeral lambdas, CLI tools, and cold-start sensitive workloads. Use HotSpot JIT (Generational ZGC) for long-lived, high-throughput microservices.',
        vi: 'Quy tắc chọn lựa: Dùng GraalVM AOT cho AWS Lambda, CLI tool và service cần auto-scale gấp. Dùng HotSpot JIT + ZGC cho microservice chạy ổn định lâu dài cần thông lượng thông suốt.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'What are HotSpot JVM Safepoints and Thread-Local Handshakes, and how do uncounted loops trigger massive tail-latency spikes or cluster failovers?',
        vi: 'Safepoint và Thread-Local Handshake trong HotSpot JVM là gì, và tại sao các vòng lặp đếm không xác định (uncounted loop) lại có thể gây ra hiện tượng tăng vọt độ trễ đuôi (tail latency) hoặc rớt cụm máy chủ?'
      },
      answer: {
        en: '1. Safepoints & Safepoint Polling: For global operations like Stop-The-World Garbage Collection, JIT deoptimization, and biased lock revocation, the JVM requires all application threads to pause at known, memory-consistent execution checkpoints called Safepoints. HotSpot injects Safepoint Poll instructions into method returns and loop backedges: the thread reads a dedicated memory page (polling page). When a STW pause is requested, the JVM unmaps that page, causing all polling threads to trigger a memory trap and suspend. 2. The Uncounted Loop Hazard: The C2 JIT compiler aggressively optimizes counted loops (e.g. "for (int i=0; i<N; i++)") by STRIPPING the safepoint poll to maximize vectorization throughput! However, if a loop uses a long index ("for (long i=0; i<N; i++)") or has non-trivial termination conditions, C2 treats it as an UNCOUNTED LOOP and may omit the safepoint check or hoist it! If one worker thread gets stuck in a lengthy uncounted loop, the JVM CANNOT REACH THE SAFEPOINT (TTSP - Time To Safepoint latency explodes). All other threads in the cluster freeze waiting for that single thread to pause! A 5-second TTSP delay triggers Kubernetes readiness probe timeouts, leading to cascade container kills! (Fixed with -XX:+UseCountedLoopSafepoints). 3. Thread-Local Handshakes (Java 10+): Instead of stopping the ENTIRE virtual machine world to inspect a single thread, Thread-Local Handshakes allow the JVM to execute a callback on one specific target thread while all other application threads continue running uninhibited.',
        vi: '1. Safepoints và Thăm dò Safepoint: Khi cần thực hiện các thao tác toàn cục như Stop-The-World Garbage Collection, deoptimization hoặc hủy khóa biased, JVM bắt buộc mọi luồng phải dừng lại ở các điểm an toàn gọi là Safepoints. HotSpot chèn các lệnh thăm dò (Safepoint Poll) vào cuối hàm và đầu vòng lặp: luồng đọc một trang nhớ đặc biệt. Khi cần dừng toàn hệ thống, JVM khóa trang nhớ đó lại, khiến tất cả các luồng khi đọc trang này sẽ bị bẫy phần cứng và tự động dừng lại. 2. Thảm họa Vòng Lặp Uncounted Loop: Trình biên dịch C2 JIT tối ưu rất mạnh các vòng lặp đếm được (như "for (int i=0; i<N; i++)") bằng cách XÓA BỎ lệnh safepoint poll để tăng tốc độ chạy! Nhưng nếu vòng lặp dùng biến long ("for (long i=0; i<N; i++)") hoặc điều kiện phức tạp, C2 coi đó là uncounted loop và có thể không đặt safepoint! Nếu một luồng chạy một vòng lặp nặng trong 5 giây, JVM KHÔNG THỂ NÀO CHẠM ĐƯỢC SAFEPOINT (chỉ số TTSP - Time To Safepoint tăng vọt). Toàn bộ hàng trăm luồng khác trong hệ thống ĐÃ BỊ DỪNG LẠI và phải đứng chờ đúng 1 luồng đó! Khoảng dừng 5 giây này khiến Kubernetes tưởng ứng dụng bị đơ (timeout probe) và tự động giết chết container! (Khắc phục bằng cờ -XX:+UseCountedLoopSafepoints). 3. Thread-Local Handshakes (Từ Java 10): Thay vì bắt cả thế giới dừng lại (STW) chỉ để thao tác trên 1 luồng, cơ chế Handshake cục bộ cho phép JVM chỉ định đình chỉ và thao tác trên ĐÚNG 1 luồng mục tiêu, trong khi toàn bộ hệ thống vẫn chạy mượt mà không bị ảnh hưởng.'
      },
      trapWarning: {
        en: 'Never diagnose GC latency spikes solely by looking at GC phase times! Often the GC pause is only 20ms, but the application was paused for 4,000ms beforehand due to TTSP (Time To Safepoint) delay! Enable -Xlog:safepoint=debug to diagnose TTSP issues.',
        vi: 'Đừng bao giờ chẩn đoán độ trễ GC chỉ bằng cách nhìn vào thời gian chạy của thuật toán GC! Rất nhiều trường hợp GC chỉ chạy mất 20ms, nhưng toàn bộ ứng dụng bị đơ 4.000ms TRƯỚC ĐÓ do thời gian chờ các luồng về Safepoint (TTSP)! Hãy bật cờ -Xlog:safepoint=debug để bắt chính xác thủ phạm này.'
      },
      proTip: {
        en: 'In high-frequency low-latency trading (HFT) or gaming engines, always audit long-running computation loops and ensure they are either vectorized counted int loops or explicitly invoke Thread.onSpinWait() to allow cooperative safepoint polling.',
        vi: 'Trong các hệ thống tài chính giao dịch tần suất cao (HFT), luôn rà soát các vòng lặp tính toán nặng và đảm bảo chúng có cờ an toàn hoặc gọi Thread.onSpinWait() để hợp tác nhả quyền cho safepoint.'
      }
    }
  ]
};
