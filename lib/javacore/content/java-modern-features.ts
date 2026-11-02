import type { JavaCoreTopic } from '../types';

export const javaModernFeaturesTopic: JavaCoreTopic = {
  id: 'java-modern-features',
  category: 'advanced-features',
  name: 'Java 8 to 21 Features: Lambdas, Streams, Records & Pattern Matching',
  tagline: {
    en: 'Evolution from Java 8 to 21 LTS: invokedynamic Lambdas, Stream pipelines, Optional semantics, Immutable Records, Sealed hierarchies, and Pattern Matching.',
    vi: 'Tiến hóa từ Java 8 đến 21 LTS: Lambda qua invokedynamic, đường ống Stream, Record bất biến, Sealed Classes và Pattern Matching.'
  },
  difficulty: 1,
  level: 'basic',
  order: 7,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      en: 'Legacy enterprise Java code was notoriously verbose: anonymous inner classes cluttered classpaths with hundreds of tiny Outer$1.class files, boilerplate POJOs required thousands of lines of getters/setters/hashCode, and nested if-else instanceof checks caused type-safety bugs and NullPointerExceptions.',
      vi: 'Mã nguồn Java truyền thống quá dài dòng: các lớp nội danh (anonymous inner classes) làm rác classpath với hàng trăm file Outer$1.class nhỏ lẻ, các lớp POJO tốn hàng ngàn dòng code getter/setter thủ công, và các chuỗi if-else instanceof lồng nhau dễ phát sinh lỗi NullPointerException.'
    },
    hardwareConstraint: {
      en: 'Creating an anonymous inner class allocates a full 24-byte Heap object header plus enclosing this pointer references, creating severe GC memory churn. Java 8 replaced this with invokedynamic (JSR 292): lambdas compile to a CallSite bootstrap linking to a private static method, reducing heap allocation overhead to zero for non-capturing lambdas.',
      vi: 'Khởi tạo một anonymous inner class phải cấp phát đủ 24 byte object header kèm con trỏ tham chiếu tới lớp bao ngoài, gây áp lực dọn rác rất lớn. Java 8 thay thế bằng invokedynamic: lambda được liên kết động tại điểm gọi CallSite với phương thức static nội bộ, triệt tiêu 100% việc cấp phát đối tượng trên Heap cho các non-capturing lambda.'
    },
    fundamentalSolution: {
      en: 'Java modern features deliver concise, expressive, memory-efficient paradigms: 1. Lambdas & Streams: Declarative, lazy collection processing via invokedynamic. 2. Optional: Explicit monadic container forcing developers to handle presence/absence. 3. Records (Java 16): Pure immutable data carriers with compiler-generated canonical constructors, equals(), and hashCode(). 4. Sealed Classes (Java 17): Exhaustive algebraic domain modeling. 5. Pattern Matching (Java 21): Type-safe deconstruction inside switch expressions.',
      vi: 'Các tính năng Java hiện đại đem lại phong cách lập trình súc tích, an toàn và tối ưu bộ nhớ: 1. Lambda & Stream: Xử lý tập hợp khai báo lười (lazy evaluation) qua invokedynamic. 2. Optional: Hộp chứa tường minh ép buộc xử lý trường hợp null. 3. Record (Java 16): Đối tượng dữ liệu bất biến tự sinh constructor, equals() và hashCode(). 4. Sealed Classes (Java 17): Khóa cây kế thừa cho phép mô hình hóa đại số khép kín. 5. Pattern Matching (Java 21): Bóc tách đối tượng an toàn kiểu ngay trong switch expression.'
    },
    math: {
      formula: 'Stream_Processing = Source -> Intermediate_Lazy_Ops (filter, map) -> Terminal_Eager_Op (collect, toList, reduce)',
      description: {
        en: 'Streams use lazy pipeline execution: intermediate operations return a new Stream pipeline stage without processing any data until a terminal operation is called, enabling short-circuiting optimizations (e.g. findFirst() stops after 1 item).',
        vi: 'Stream thực thi lười (lazy): các phép toán trung gian chỉ xây dựng đường ống mà chưa xử lý dữ liệu cho tới khi gặp thao tác kết thúc (terminal), cho phép tối ưu ngắt sớm (findFirst dừng ngay sau phần tử đầu).'
      },
      timeComplexity: 'O(N) single-pass stream traversal; O(1) Pattern Matching switch dispatch',
      spaceComplexity: 'Non-capturing lambdas: 0 bytes Heap allocation; Records: Compact continuous object layout',
      memoryOverheadFormula: 'Record Memory = Mark Word [8B] + Klass Pointer [4B] + Sum(Component Fields)'
    }
  },

  memoryLayout: {
    title: {
      en: 'Physical Memory Layout: Anonymous Inner Class Overhead vs invokedynamic Lambda CallSite',
      vi: 'Bố Cục Ô Nhớ: Lãng Phí Của Anonymous Inner Class vs Cơ Chế invokedynamic Của Lambda'
    },
    description: {
      en: 'Anonymous inner classes generate standalone .class files with synthetic outer references holding 24-32 bytes each. Non-capturing lambdas are linked to a single static MethodHandle without instantiating objects.',
      vi: 'Lớp nội danh sinh file .class riêng kèm con trỏ lớp ngoài tốn 24-32 byte RAM trên mỗi đối tượng. Non-capturing lambda được ánh xạ trực tiếp tới MethodHandle tĩnh mà không cần khởi tạo đối tượng.'
    },
    asciiDiagram: `
ANONYMOUS INNER CLASS (LEGACY JAVA 7):
+-----------------------------------------------------------------------------------------+
|  Heap Object @ 0x7FFA (24 Bytes)                                                        |
|  - Mark Word (8B)                                                                       |
|  - Klass Pointer: OrderService$1.class (4B)                                              |
|  - Field: this$0 (4B pointer back to enclosing OrderService - Memory Leak Hazard!)       |
+-----------------------------------------------------------------------------------------+

VS

LAMBDA EXPRESSION (JAVA 8+ invokedynamic):
+-----------------------------------------------------------------------------------------+
|  Constant Pool: InvokeDynamic #0 -> LambdaMetafactory.metafactory()                     |
|  Direct CallSite -> private static synthetic void lambda$process$0(...)                  |
|  ZERO Heap Allocation for non-capturing lambdas! 0ns GC overhead!                       |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'Lambda CallSite', size: '0-24 Bytes', description: { en: 'Zero bytes for non-capturing; 24 bytes only if capturing local scope variables.', vi: '0 byte nếu không capture biến ngoài; 24 byte nếu capture biến cục bộ.' } },
      { name: 'Record Object Layout', size: 'Compact Struct', description: { en: 'Standard 12B header + declared component fields without hidden pointers.', vi: 'Header 12 byte + các trường thành phần, không có con trỏ ẩn.' } },
      { name: 'Sealed Class Permit Table', size: 'Metaspace Array', description: { en: 'Fixed array in InstanceKlass verifying permitted subclass hierarchy.', vi: 'Mảng trong InstanceKlass chốt danh sách các lớp con được phép kế thừa.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Modern Java (Java 8 to 21 LTS) represents a revolutionary shift from verbose boilerplate to concise, expressive, and high-performance functional-imperative programming. Key language innovations—invokedynamic lambdas, immutable records, sealed hierarchies, and pattern matching—transform how enterprise systems structure domain data and execution flows.',
      vi: 'Java hiện đại (từ Java 8 đến 21 LTS) đánh dấu bước chuyển mình mang tính cách mạng từ lối viết dài dòng rườm rà sang phong cách kết hợp hàm-mệnh lệnh ngắn gọn, biểu cảm và hiệu năng cao. Các đổi mới cốt lõi—lambda invokedynamic, record bất biến, sealed class và pattern matching—thay đổi hoàn toàn cách các hệ thống doanh nghiệp mô hình hóa dữ liệu nghiệp vụ và luồng thực thi.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Lambda Compilation Mechanics & invokedynamic: Unlike anonymous inner classes (which generate a separate .class file on disk and allocate a 24-byte Heap object on every instantiation), Java lambdas leverage the invokedynamic bytecode instruction introduced in Java 7. The first time a lambda is encountered, LambdaMetafactory spins up a lightweight CallSite pointing directly to an autogenerated private static method. Non-capturing lambdas are cached as singletons: they allocate ZERO heap bytes and generate ZERO garbage collector overhead.',
        vi: '1. Cơ chế biên dịch Lambda & Lệnh invokedynamic: Khác với anonymous inner class (luôn sinh ra một file .class riêng trên đĩa và cấp phát đối tượng 24-byte trên Heap mỗi khi gọi), lambda trong Java sử dụng lệnh bytecode invokedynamic. Trong lần đầu thực thi, LambdaMetafactory tạo ra một CallSite cực nhẹ trỏ trực tiếp đến phương thức private static nội bộ. Các lambda không capture biến ngoài (non-capturing) được lưu cache dưới dạng Singleton: tốn 0 byte trên Heap và hoàn toàn không sinh rác cho GC.'
      },
      {
        en: '2. Java Records: Immutable Transparent Data Carriers: Records (Java 16+) are immutable data carriers that eliminate boilerplate while guaranteeing structural transparency. The compiler auto-generates final fields, canonical constructors, component accessors, and mathematically correct equals()/hashCode()/toString() based on all components. Unlike Lombok plugins that mutate AST trees at compile-time, Records are fully recognized by the JVM specification, enabling optimized object serialization and direct memory layouts.',
        vi: '2. Java Records: Vật chứa dữ liệu bất biến trong suốt: Record (từ Java 16+) là cấu trúc dữ liệu bất biến triệt tiêu mã thừa và đảm bảo tính minh bạch cấu trúc. Trình biên dịch tự động sinh các trường final, hàm dựng chuẩn tắc (canonical constructor), các getter và bộ ba equals()/hashCode()/toString() chuẩn xác dựa trên mọi trường. Khác với plugin Lombok can thiệp cây AST lúc build, Record được công nhận chính thức trong đặc tả JVM, giúp tối ưu hóa tuần tự hóa (serialization) và bố cục ô nhớ.'
      },
      {
        en: '3. Pattern Matching & Algebraic Data Types (Java 21): Combining Sealed Types (sealed, permits) with Record Pattern Matching allows Java to implement Algebraic Data Types (ADT). Developers can deconstruct complex nested records directly in switch expressions without explicit type checks (instanceof) or casting ((Type) obj). Crucially, the compiler enforces exhaustiveness: if a sealed subtype is omitted, compilation fails, preventing silent runtime defects.',
        vi: '3. Pattern Matching & Kiểu Dữ Liệu Đại Số ADT (Java 21): Sự kết hợp giữa Sealed Types và Record Pattern Matching mang đến cho Java khả năng xây dựng Kiểu dữ liệu Đại số (ADT). Lập trình viên có thể bóc tách các record lồng nhau trực tiếp trong biểu thức switch mà không cần kiểm tra kiểu thủ công (instanceof) hay ép kiểu rủi ro ((Type) obj). Quan trọng nhất, trình biên dịch bắt buộc kiểm tra đầy đủ (exhaustiveness): nếu bỏ sót một lớp con sealed, code sẽ không thể biên dịch, loại trừ hoàn toàn lỗi tiềm ẩn lúc chạy.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Capturing external mutable variables within lambda expressions (capturing lambdas) inside hot loops. Each iteration allocates a new heap closure object, destroying escape analysis and causing heavy Minor GC scavenges.',
        vi: 'Capture các biến mutable bên ngoài vào biểu thức lambda bên trong các vòng lặp xử lý dữ liệu lớn. Mỗi lần lặp sẽ sinh ra một đối tượng closure mới trên Heap, vô hiệu hóa phân tích thoát (Escape Analysis) và gây áp lực dọn rác GC liên tục.'
      },
      {
        en: 'Declaring mutable collections (like ArrayList or HashSet) as record components without defensive copies in the canonical constructor, allowing external code to modify internal record state and violating immutability.',
        vi: 'Khai báo các Collection có thể sửa đổi (như ArrayList hay HashSet) làm trường của Record mà không tạo bản sao phòng vệ (defensive copy) trong hàm dựng, khiến mã bên ngoài vẫn có thể thay đổi dữ liệu nội bộ và phá vỡ tính bất biến.'
      },
      {
        en: 'Overusing Stream API pipelines for simple array or primitive operations in ultra-low-latency paths. Streams introduce iterator wrappers and pipeline stages that carry higher overhead than traditional counted loops.',
        vi: 'Lạm dụng Stream API cho các thao tác mảng nguyên thủy đơn giản trong các hệ thống đòi hỏi độ trễ micro-giây. Stream tạo thêm đối tượng trung gian (Spliterator, Pipeline stages) có chi phí cao hơn hẳn so với vòng lặp đếm chỉ số truyền thống.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Refactoring Financial Risk Engine from Brittle instanceof Casts to Java 21 Sealed Pattern Matching',
      vi: 'Tái Cấu Trúc Động Cơ Thẩm Định Rủi Ro Tài Chính Bằng Java 21 Sealed Record Pattern Matching'
    },
    businessContext: {
      en: 'A global banking fraud detection platform evaluates 25,000 security events per second across CardSwipes, WireTransfers, CryptoWithdrawals, and BiometricLogins.',
      vi: 'Nền tảng phát hiện gian lận ngân hàng quốc tế đánh giá 25,000 sự kiện bảo mật mỗi giây bao gồm: Quẹt thẻ (CardSwipe), Chuyển khoản (WireTransfer), Rút tiền Crypto (CryptoWithdrawal) và Đăng nhập sinh trắc học (BiometricLogin).'
    },
    problemDescription: {
      en: 'The legacy fraud evaluation rule engine was implemented as a 600-line method of nested if-else blocks using classical instanceof and manual casting: if (event instanceof WireTransferEvent) { WireTransferEvent w = (WireTransferEvent) event; if (w.getAmount() > 10000) ... }. When a developer introduced CryptoWithdrawalEvent, they forgot to update an auxiliary KYC validation function. Fraudulent cryptocurrency transfers bypassed regulatory sanctions screening, resulting in a $420,000 compliance fine.',
      vi: 'Quy tắc thẩm định rủi ro cũ được viết trong một phương thức 600 dòng với các khối if-else lồng nhau dùng instanceof và ép kiểu thủ công: if (event instanceof WireTransferEvent) { WireTransferEvent w = (WireTransferEvent) event; if (w.getAmount() > 10000) ... }. Khi bổ sung sự kiện mới CryptoWithdrawalEvent, lập trình viên đã quên cập nhật một hàm phụ trợ xác thực KYC. Hậu quả là các giao dịch rút crypto gian lận đã lọt qua lưới rà soát cấm vận, dẫn đến án phạt tuân thủ 420,000 USD.'
    },
    whyNaiveFails: {
      en: 'The classic OOP Visitor Pattern required touching 18 domain files, creating visitor interfaces, and implementing accept(Visitor) across all classes. This caused extreme architectural friction and made adding asynchronous reactive rules unmaintainable.',
      vi: 'Giải pháp cổ điển dùng Visitor Pattern đòi hỏi phải sửa đổi 18 file thực thể domain, sinh ra các interface visitor và cài đặt hàm accept(Visitor) trên mọi lớp, làm kiến trúc trở nên cồng kềnh khó mở rộng và cực kỳ phức tạp khi kết hợp với lập trình phản ứng bất đồng bộ.'
    },
    coreSolution: {
      en: 'Model the domain events using Java 21 Sealed Interfaces and Records. Execute business rule evaluation via exhaustive pattern matching switch expressions with record deconstruction. The Java compiler strictly enforces exhaustiveness: adding a new event type without updating the fraud switch causes an immediate compilation failure, making omitted security checks impossible.',
      vi: 'Mô hình hóa các sự kiện nghiệp vụ bằng Sealed Interface và Record trong Java 21. Đánh giá quy tắc bằng biểu thức switch Pattern Matching bóc tách trực tiếp các trường dữ liệu. Trình biên dịch Java bắt buộc kiểm tra toàn vẹn: nếu bổ sung một loại sự kiện mới mà chưa xử lý trong switch gian lận, dự án sẽ báo lỗi biên dịch ngay lập tức, triệt tiêu hoàn toàn nguy cơ bỏ sót lỗ hổng bảo mật.'
    },
    productionCode: `// Production Java 21 LTS Sealed Record Pattern Matching Risk Engine
package com.fintech.fraud.engine;

import java.math.BigDecimal;
import java.time.Instant;

// 1. Sealed Domain Hierarchy: Algebraic Data Types (ADT)
public sealed interface SecurityEvent permits CardSwipe, WireTransfer, CryptoWithdrawal, BiometricLogin {
    String userId();
    Instant timestamp();
}

public record CardSwipe(String userId, Instant timestamp, String merchantCategory, BigDecimal amount) 
    implements SecurityEvent {}

public record WireTransfer(String userId, Instant timestamp, String destinationIban, BigDecimal amount, boolean isForeign) 
    implements SecurityEvent {}

public record CryptoWithdrawal(String userId, Instant timestamp, String walletAddress, String chain, BigDecimal amountUsd) 
    implements SecurityEvent {}

public record BiometricLogin(String userId, Instant timestamp, String deviceId, double confidenceScore) 
    implements SecurityEvent {}

// 2. High-Throughput Pattern Matching Decision Engine
public class FraudEvaluationEngine {

    public RiskScore evaluate(SecurityEvent event) {
        // Java 21 Record Pattern Matching with Exhaustive Switch
        // NO instanceof, NO manual casting, NO defensive default branch needed!
        return switch (event) {
            // Nested deconstruction with conditional guard (when)
            case CardSwipe(var uid, var ts, var mcc, var amt) when amt.compareTo(new BigDecimal("5000")) > 0 ->
                new RiskScore(uid, 75, "HIGH_AMOUNT_CARD_PRESENT");

            case CardSwipe(var uid, var ts, var mcc, var amt) ->
                new RiskScore(uid, 10, "NORMAL_CARD_TRANSACTION");

            case WireTransfer(var uid, var ts, var iban, var amt, true) ->
                new RiskScore(uid, 90, "HIGH_RISK_CROSS_BORDER_WIRE");

            case WireTransfer(var uid, var ts, var iban, var amt, false) ->
                new RiskScore(uid, 20, "DOMESTIC_WIRE");

            // Guaranteed compile-time coverage for Crypto
            case CryptoWithdrawal(var uid, var ts, var wallet, var chain, var usd) when usd.compareTo(new BigDecimal("10000")) > 0 ->
                new RiskScore(uid, 95, "SANCTION_SCREENING_MANDATORY");

            case CryptoWithdrawal(var uid, var ts, var wallet, var chain, var usd) ->
                new RiskScore(uid, 60, "STANDARD_CRYPTO_WITHDRAWAL");

            case BiometricLogin(var uid, var ts, var devId, var score) when score < 0.85 ->
                new RiskScore(uid, 85, "LOW_BIOMETRIC_CONFIDENCE");

            case BiometricLogin(var uid, var ts, var devId, var score) ->
                new RiskScore(uid, 5, "AUTHENTICATED_BIOMETRIC");
        };
    }
}`,
    architectureImpact: {
      en: 'Zero unhandled event vulnerabilities (compiler-enforced exhaustiveness); Cyclomatic complexity cut by 74%; Execution throughput improved by 3.2x over reflection/visitor approaches; Code volume reduced from 600 lines of brittle boilerplate to 55 lines of declarative logic.',
      vi: 'Triệt tiêu 100% nguy cơ bỏ sót sự kiện (trình biên dịch bắt buộc phủ kín); Độ phức tạp cyclomatic giảm 74%; Thông lượng thực thi tăng 3.2 lần so với cách dùng reflection/visitor; Số lượng dòng code giảm từ 600 dòng rườm rà xuống còn 55 dòng mã khai báo súc tích.'
    }
  },

  steps: [
    {
      id: 'invokedynamic-lambda-bootstrap',
      title: { en: '1. Lambda Compilation via invokedynamic', vi: '1. Biên Dịch Lambda Bằng Lệnh invokedynamic' },
      phase: 'LAMBDA_LINKING',
      description: {
        en: 'When executing a lambda, javac emits invokedynamic targeting LambdaMetafactory. The JVM generates a lightweight CallSite that directly points to a synthesized static method, avoiding disk class file generation.',
        vi: 'Khi thực thi lambda, javac phát sinh bytecode invokedynamic trỏ tới LambdaMetafactory. JVM tạo một CallSite nhẹ trỏ thẳng tới hàm static nội bộ mà không cần sinh file class trên đĩa.'
      },
      jvmRuntimeBehavior: {
        en: 'One-time bootstrap linkage via MethodHandle; subsequent invocations execute at direct native speed.',
        vi: 'Liên kết một lần qua MethodHandle; các lần gọi tiếp theo chạy với tốc độ mã máy trực tiếp.'
      },
      javaCodeLineMatch: 'orders.stream().filter(o -> o.amount() > 100)'
    },
    {
      id: 'stream-lazy-pipeline',
      title: { en: '2. Stream Pipeline Lazy Evaluation & Fusion', vi: '2. Thực Thi Đường Ống Stream Lười & Tối Ưu Hợp Nhất' },
      phase: 'STREAM_PIPELINE',
      description: {
        en: 'The filter() and map() calls construct chained Sink nodes in memory without iterating elements. When collect() is called, data flows through fused filter-map stages in a SINGLE pass through the CPU cache line.',
        vi: 'Các hàm filter() và map() nối các nút Sink trong bộ nhớ mà chưa duyệt dữ liệu. Khi gọi collect(), dữ liệu chảy qua toàn bộ các khâu chỉ trong một lượt duyệt duy nhất trên CPU cache line.'
      },
      jvmRuntimeBehavior: {
        en: 'Loop fusion enables JIT escape analysis to eliminate intermediate boxed allocations.',
        vi: 'Hợp nhất vòng lặp cho phép C2 JIT tối ưu hóa thoát, loại bỏ các đối tượng boxing trung gian.'
      },
      javaCodeLineMatch: '.map(Order::customerEmail).toList();'
    },
    {
      id: 'pattern-matching-deconstruct',
      title: { en: '3. Java 21 Pattern Matching & Record Deconstruction', vi: '3. Pattern Matching & Bóc Tách Record Trong Java 21' },
      phase: 'PATTERN_MATCHING',
      description: {
        en: 'In Java 21, switch expressions deconstruct records directly: case PaymentRecord(var id, CreditCard(var pan)) extracts fields with compile-time exhaustive checking and zero manual casting.',
        vi: 'Trong Java 21, biểu thức switch bóc tách trực tiếp các trường của Record: case PaymentRecord(var id, CreditCard(var pan)) trích xuất dữ liệu không cần ép kiểu thủ công.'
      },
      jvmRuntimeBehavior: {
        en: 'Emits tableswitch / lookupswitch bytecode combined with type-check instructions in a single step.',
        vi: 'Sinh bytecode tableswitch kết hợp kiểm tra kiểu và nạp trường dữ liệu trong đúng 1 bước.'
      },
      javaCodeLineMatch: 'case CreditCardPayment(var id, var num) -> processCard(id, num);'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Java 21 LTS Pattern Matching Engine',
      implementationName: 'Type-Test Pattern & Record Deconstruction (JEP 440/441)',
      keyMechanism: {
        en: 'Compiler enforces exhaustive coverage when switching over sealed hierarchies: if all permitted subclasses are covered, no default branch is needed. Adding a new subclass immediately flags a compile error at all unhandled switch sites.',
        vi: 'Trình biên dịch bắt buộc kiểm tra đầy đủ khi switch trên sealed hierarchy: nếu đã bao phủ hết các lớp con được phép, không cần nhánh default. Khi thêm lớp con mới, compiler sẽ báo lỗi ở mọi nơi chưa xử lý.'
      },
      defaultFlags: '-XX:+TieredCompilation',
      architectureNote: {
        en: 'Eliminates thousands of instanceof and class-cast exceptions across domain logic layers.',
        vi: 'Triệt tiêu hoàn toàn các lỗi ép kiểu ClassCastException và chuỗi if-else instanceof trong tầng nghiệp vụ.'
      }
    },
    {
      jvmEngine: 'HotSpot LambdaMetafactory',
      implementationName: 'Dynamic CallSite Bootstrapping (JSR 292)',
      keyMechanism: {
        en: 'Replaces anonymous inner classes with dynamically linked CallSites. HotSpot can inline lambdas just like regular private methods, enabling vectorization and loop optimizations.',
        vi: 'Thay thế anonymous class bằng CallSite liên kết động. HotSpot có thể inline lambda y hệt như private method thông thường, kích hoạt tối ưu hóa vector.'
      },
      defaultFlags: '-Djdk.internal.lambda.dumpProxyClasses=/tmp/proxies',
      architectureNote: {
        en: 'Non-capturing lambdas are cached as singletons; capturing lambdas allocate only the captured variables.',
        vi: 'Non-capturing lambda được lưu đệm như một singleton; capturing lambda chỉ tốn ô nhớ cho các biến bị chụp lại.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Records drastically cut boilerplate (up to 80% code reduction) while guaranteeing immutability and thread-safety.',
        vi: 'Record cắt giảm tới 80% code thừa trong khi bảo đảm tính bất biến và an toàn đa luồng tuyệt đối.'
      },
      {
        en: 'Sealed classes combined with pattern matching bring algebraic data types (ADTs) and compile-time exhaustiveness to Java.',
        vi: 'Sealed class kết hợp với pattern matching mang lại hệ thống kiểu đại số (ADT) và tính bao phủ toàn diện lúc biên dịch.'
      }
    ],
    cons: [
      {
        en: 'Parallel streams use the shared common ForkJoinPool; executing blocking I/O inside parallelStream starves the entire JVM.',
        vi: 'parallelStream dùng chung ForkJoinPool toàn cục; chạy tác vụ I/O chặn bên trong sẽ làm nghẽn toàn bộ ứng dụng.'
      },
      {
        en: 'Capturing lambdas in tight loops allocate lightweight objects on the Heap unless Scalar Replacement succeeds.',
        vi: 'Capturing lambda trong vòng lặp liên tục vẫn phải cấp phát đối tượng trên Heap nếu Escape Analysis không thành công.'
      }
    ],
    memoryFootprint: {
      en: 'Records have zero hidden pointer overhead. Non-capturing lambdas consume zero heap memory (reused singleton CallSite).',
      vi: 'Record không có con trỏ ẩn. Non-capturing lambda tốn 0 byte Heap (tái sử dụng CallSite singleton).'
    },
    jvmSpecificationGuarantee: {
      en: 'JLS §15.28: Switch expressions over sealed hierarchies are mathematically guaranteed to be exhaustive at compile time.',
      vi: 'JLS §15.28: Biểu thức switch trên sealed hierarchy được bảo đảm bao phủ toán học 100% các trường hợp lúc biên dịch.'
    }
  },

  javaCode: `package com.engine.fundamentals;

import java.util.List;

/**
 * Demonstrates Modern Java 8 to 21 Features:
 * - Java 16 Records & Immutability
 * - Java 17 Sealed Classes (Algebraic Domain Modeling)
 * - Java 21 Pattern Matching for switch
 * - Stream API Pipelines
 */
public class ModernJavaFeaturesDemo {

    // Java 17 Sealed Hierarchy: Closed world modeling
    public sealed interface PaymentMethod permits CreditCard, CryptoWallet, BankTransfer {}

    // Java 16 Immutable Records
    public record CreditCard(String cardNumber, String expiry) implements PaymentMethod {}
    public record CryptoWallet(String walletAddress, String network) implements PaymentMethod {}
    public record BankTransfer(String iban, String swiftCode) implements PaymentMethod {}

    public record Order(long id, double amount, PaymentMethod payment) {}

    // Java 21 Pattern Matching for switch (Exhaustive, zero casts!)
    public static String processPayment(PaymentMethod payment) {
        return switch (payment) {
            case CreditCard(var num, var exp) -> "Charging Card: " + maskCard(num);
            case CryptoWallet(var addr, var net) -> "Broadcasting to " + net + " network: " + addr;
            case BankTransfer(var iban, var swift) -> "Wire Transfer to IBAN: " + iban;
            // No default needed! Compiler guarantees all sealed subtypes are covered!
        };
    }

    private static String maskCard(String num) {
        return "****-****-****-" + (num.length() >= 4 ? num.substring(num.length() - 4) : num);
    }

    public static void main(String[] args) {
        System.out.println("=== MODERN JAVA 21 FEATURES DEMO ===");

        List<Order> orders = List.of(
            new Order(101L, 250.0, new CreditCard("4111222233334444", "12/28")),
            new Order(102L, 1200.0, new CryptoWallet("0x71C...B29", "Polygon")),
            new Order(103L, 50.0, new BankTransfer("DE89370400440532013000", "DEUTDEDB"))
        );

        // Stream Pipeline: Declarative, filtered, mapped
        orders.stream()
              .filter(o -> o.amount() > 100.0)
              .map(o -> "Order #" + o.id() + ": " + processPayment(o.payment()))
              .forEach(System.out::println);
    }
}`,

  jvmFlagsCode: `# Diagnostic flags for Lambda & Pattern Matching
# Dump dynamic lambda proxy classes generated by LambdaMetafactory
-Djdk.internal.lambda.dumpProxyClasses=/tmp/proxies

# Enable Preview features (if testing experimental language enhancements)
--enable-preview`,

  bytecodeInspection: `// Disassembly of Pattern Matching Switch in Java 21
Code:
   0: aload_0
   1: astore_1
   2: iconst_0
   3: istore_2
   4: aload_1
   5: instanceof   #7   // class CreditCard
   8: ifeq          28
  11: aload_1
  12: checkcast    #7   // class CreditCard
  15: astore_3
  16: aload_3
  17: invokevirtual #11 // Method CreditCard.cardNumber:()Ljava/lang/String;
  20: invokestatic  #17 // Method maskCard:(Ljava/lang/String;)Ljava/lang/String;
  23: areturn`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What is the difference between map() and flatMap() in the Stream API?',
        vi: 'Sự khác biệt giữa map() và flatMap() trong Stream API là gì?'
      },
      answer: {
        en: 'map(Function<T, R>) transforms each element into a single new value, producing a 1-to-1 mapping. If the mapping function returns a collection or Stream (e.g. order -> order.getItems()), map() produces a nested Stream<Stream<Item>>. flatMap(Function<T, Stream<R>>) transforms each element into a Stream and then "flattens" all nested streams into a single contiguous Stream<Item> (1-to-N flattening).',
        vi: 'map(Function<T, R>) biến đổi mỗi phần tử thành một giá trị mới duy nhất (ánh xạ 1-1). Nếu hàm biến đổi trả về một danh sách (ví dụ order -> order.getItems()), map() sẽ sinh ra một Stream lồng nhau Stream<Stream<Item>>. flatMap(Function<T, Stream<R>>) biến đổi mỗi phần tử thành một Stream rồi "làm phẳng" (flatten) toàn bộ thành một Stream duy nhất Stream<Item> (ánh xạ 1-N).'
      },
      trapWarning: {
        en: 'Do not use Stream operations to mutate external state (e.g., using forEach to add items to an external ArrayList). Streams should be pure, stateless functional pipelines.',
        vi: 'Đừng dùng Stream để sửa đổi biến bên ngoài (ví dụ gọi forEach để add phần tử vào một ArrayList bên ngoài). Stream phải là đường ống hàm thuần túy, không có tác dụng phụ (side-effects).'
      },
      proTip: {
        en: 'Mention that flatMap is also invaluable with Optional: user.getOptionalAddress().flatMap(Address::getOptionalPostalCode) flattens nested Optionals to avoid Optional<Optional<String>>.',
        vi: 'Nhắc đến việc flatMap cũng cực kỳ hữu ích với Optional: giúp làm phẳng các tầng Optional lồng nhau (Optional<Optional<String>>) thành một Optional duy nhất.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'Why is it dangerous to run blocking I/O operations inside parallelStream()?',
        vi: 'Tại sao việc chạy các tác vụ I/O chặn (blocking I/O) bên trong parallelStream() lại cực kỳ nguy hiểm?'
      },
      answer: {
        en: 'parallelStream() executes tasks on the JVM-wide Common ForkJoinPool (ForkJoinPool.commonPool()), which defaults to (Runtime.availableProcessors() - 1) worker threads. Because this pool is SHARED globally across the entire JVM, executing blocking database queries, HTTP calls, or sleep inside parallelStream blocks those carrier worker threads. As a result, unrelated parallel streams, asynchronous CompletableFutures, and system routines across the entire application freeze and stall!',
        vi: 'parallelStream() thực thi tác vụ trên ForkJoinPool chung toàn hệ thống (ForkJoinPool.commonPool()), mặc định chỉ có số luồng bằng (số CPU - 1). Vì pool này được CHIA SẺ toàn cục trong toàn bộ JVM, nếu bạn gọi database hoặc HTTP call bị nghẽn trong parallelStream, các luồng worker này sẽ bị chiếm dụng và treo cứng. Hậu quả là mọi luồng song song khác, CompletableFuture và các tiến trình nền trong toàn ứng dụng đều bị tê liệt theo!'
      },
      trapWarning: {
        en: 'Never answer "parallelStream is always faster than sequential stream". For small collections (<10,000 items) or blocking workloads, thread dispatch and split/merge overhead make parallelStream significantly SLOWER.',
        vi: 'Đừng bao giờ nói "parallelStream luôn nhanh hơn stream tuần tự". Với tập dữ liệu nhỏ (<10,000 phần tử) hoặc tác vụ I/O, chi phí chia tách và ghép luồng khiến parallelStream chậm hơn rất nhiều.'
      },
      proTip: {
        en: 'If parallel processing of I/O tasks is necessary, submit them to an isolated custom ForkJoinPool or use Java 21 Virtual Threads (Executors.newVirtualThreadPerTaskExecutor()), which are purpose-built for concurrent blocking I/O.',
        vi: 'Nếu bắt buộc chạy song song tác vụ I/O, hãy tự tạo một ForkJoinPool riêng biệt hoặc dùng Virtual Threads trong Java 21, vốn sinh ra chuyên để xử lý hàng triệu tác vụ I/O chặn.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'What are Java Records and Sealed Classes, and how do they enable Algebraic Data Types (ADTs)?',
        vi: 'Java Records và Sealed Classes là gì, và chúng giúp xây dựng Hệ thống kiểu đại số (Algebraic Data Types - ADTs) như thế nào?'
      },
      answer: {
        en: 'An Algebraic Data Type consists of: 1. Product Types (Records): Model combinations of values (A AND B). Java Records provide transparent, immutable, shallowly unmodifiable data carriers with compiler-generated canonical constructors, accessors, equals(), and hashCode(). 2. Sum Types (Sealed Classes): Model disjoint possibilities (A OR B). Sealed classes restrict which subclasses can extend them via the permits clause. Combined with Java 21 Pattern Matching for switch, the compiler mathematically verifies exhaustive coverage: every subtype is handled without a defensive default branch. If a new permitted subtype is added in the future, the compiler instantly flags all unhandled switch sites across the codebase!',
        vi: 'Hệ thống kiểu đại số (ADT) gồm 2 thành phần: 1. Product Types (Kiểu Tích - Java Records): Mô hình hóa quan hệ VÀ (A VÀ B). Java Record là vật chứa dữ liệu bất biến, tự sinh constructor, getter, equals() và hashCode(). 2. Sum Types (Kiểu Tổng - Sealed Classes): Mô hình hóa quan hệ HOẶC (A HOẶC B). Sealed Class giới hạn danh sách lớp con được phép kế thừa qua mệnh đề permits. Khi kết hợp với Pattern Matching trong switch (Java 21), trình biên dịch kiểm tra tính bao phủ 100%: mọi trường hợp đều được xử lý mà không cần nhánh default thừa. Nếu sau này thêm một lớp con mới, compiler sẽ báo đỏ ngay tại mọi vị trí switch chưa cập nhật!'
      },
      trapWarning: {
        en: 'Remember that Java Records are SHALLOWLY immutable: if a Record holds a mutable field (e.g. List<Item>), external callers can still mutate the internal elements of that list unless List.copyOf() defensive copying is enforced in the compact constructor.',
        vi: 'Cần nhớ Record chỉ bất biến ở tầng nông (Shallow Immutability): nếu Record chứa một đối tượng mutable (như List), bên ngoài vẫn có thể thêm/bớt phần tử trong list đó trừ khi bạn dùng List.copyOf() trong compact constructor để sao chép phòng vệ.'
      },
      proTip: {
        en: 'Demonstrate design mastery: Use Sealed Interfaces with Records to represent Domain-Driven Design (DDD) Value Objects and Domain Events. It completely replaces the Visitor Pattern with clean, idiomatic pattern matching switch expressions.',
        vi: 'Thể hiện tầm nhìn kiến trúc: Dùng Sealed Interface kết hợp với Record để thiết kế Value Object và Domain Event trong DDD. Cách này thay thế hoàn toàn mẫu thiết kế phức tạp Visitor Pattern bằng biểu thức switch ngắn gọn, an toàn.'
      }
    }
  ]
};
