import type { JavaCoreTopic } from '../types';

export const classloaderBytecode: JavaCoreTopic = {
  id: 'classloader-bytecode',
  category: 'advanced-features',
  name: 'ClassLoader Delegation & JVM Bytecode Execution',
  tagline: {
    en: 'Runtime execution engine: Parent-first delegation hierarchy, loading lifecycle (Linking, Preparation, <clinit>), and JVM stack operand bytecode instructions.',
    vi: 'Động cơ thực thi máy ảo: Phân cấp ủy quyền Parent-First, vòng đời nạp lớp (Liên kết, Chuẩn bị, <clinit>) và tập lệnh bytecode ngăn xếp.'
  },
  difficulty: 3,
  level: 'advanced',
  order: 20,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Without a strictly regulated class loading mechanism, a malicious library could easily inject its own rogue java.lang.String or java.lang.System class into the runtime, hijacking system passwords and compromising JVM security boundaries.',
      vi: 'Nếu không có cơ chế nạp lớp được kiểm soát chặt chẽ, một thư viện độc hại có thể dễ dàng nạp đè class java.lang.String hoặc java.lang.System giả mạo vào ứng dụng, đánh cắp mật khẩu và phá vỡ hoàn toàn ranh giới bảo mật của máy ảo JVM.'
    },
    hardwareConstraint: {
      en: 'The JVM is an abstract stack-based virtual machine: rather than relying on hardware CPU registers (which vary wildly between x86, ARM, and RISC-V), JVM bytecode operates on an Operand Stack in RAM. The JIT compiler then translates stack-based bytecode into hardware register assembly at runtime.',
      vi: 'JVM là một máy ảo trừu tượng dựa trên ngăn xếp (Stack-based Virtual Machine): thay vì phụ thuộc vào các thanh ghi CPU phần cứng (vốn rất khác nhau giữa x86, ARM và RISC-V), mã bytecode JVM thao tác trên Ngăn xếp Toán hạng (Operand Stack) trong RAM. Trình biên dịch JIT sau đó sẽ dịch các lệnh ngăn xếp này thành mã máy sử dụng thanh ghi thực tế.'
    },
    fundamentalSolution: {
      en: 'The JVM enforces the Parent-First Delegation Model: Bootstrap ClassLoader -> Platform ClassLoader -> Application ClassLoader. When a class is requested, a loader delegates to its parent before searching its own classpath. The loading lifecycle proceeds through: 1) Loading (reading byte stream), 2) Linking (Verification, Preparation, Resolution), and 3) Initialization (<clinit> execution).',
      vi: 'JVM áp đặt Mô Hình Ủy Quyền Phụ Huynh (Parent-First Delegation): Bootstrap ClassLoader -> Platform ClassLoader -> Application ClassLoader. Khi có yêu cầu nạp class, ClassLoader luôn nhờ cấp cha nạp trước. Vòng đời nạp diễn ra qua 3 pha: 1) Loading (đọc luồng byte), 2) Linking (Xác thực, Chuẩn bị gán giá trị mặc định, Phân giải con trỏ), và 3) Initialization (thực thi khối static <clinit>).'
    },
    math: {
      formula: 'Class Identity = Class_Binary_Name + Defining_ClassLoader_Instance',
      description: {
        en: 'Two classes with the exact same package and bytecode loaded by two different ClassLoader instances are completely distinct types; casting between them throws ClassCastException.',
        vi: 'Hai class có cùng package và bytecode nhưng được nạp bởi hai ClassLoader khác nhau được coi là hai kiểu dữ liệu hoàn toàn khác biệt; ép kiểu giữa chúng sẽ ném ra lỗi ClassCastException.'
      },
      timeComplexity: 'O(Depth) delegation hierarchy lookup; cached in Metaspace constant pool',
      spaceComplexity: 'Metaspace memory overhead for Class Instance, Method Bytecode, and vtables',
      memoryOverheadFormula: 'Metaspace Footprint = Class Metadata + Bytecode Array + Symbol Tables'
    }
  },

  detailedTheory: {
    overview: {
      en: 'The ClassLoader subsystem and the Bytecode Execution Engine form the core runtime foundation of Java. By decoupling compile-time source code from runtime bytecode execution, the JVM provides cross-platform portability ("Write Once, Run Anywhere") while allowing dynamic class loading, runtime bytecode instrumentation, and class isolation.',
      vi: 'Phân hệ ClassLoader và Động cơ Thực thi Bytecode tạo nên nền móng cốt lõi của máy ảo Java. Bằng việc tách rời mã nguồn lúc biên dịch khỏi mã bytecode thực thi lúc runtime, JVM mang lại khả năng chạy đa nền tảng ("Viết một lần, chạy mọi nơi") trong khi vẫn cho phép nạp class động, can thiệp bytecode và cô lập ứng dụng.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The 3-Tier Parent-First Delegation Hierarchy: When ClassLoader.loadClass("com.example.User") is called, the request bubbles up: 1) Bootstrap ClassLoader (written in native C/C++, loads java.base from lib/modules); 2) Platform ClassLoader (loads Java SE platform modules); 3) Application ClassLoader (loads classpath and application JARs). Only if all parents fail to find the class does the child ClassLoader search its own local repositories.',
        vi: '1. Phân Cấp Ủy Quyền 3 Tầng (Parent-First Delegation): Khi gọi ClassLoader.loadClass("com.example.User"), yêu cầu được đẩy ngược lên trên: 1) Bootstrap ClassLoader (viết bằng C/C++ native, nạp module cốt lõi java.base); 2) Platform ClassLoader (nạp các module Java SE mở rộng); 3) Application ClassLoader (nạp classpath và các file JAR ứng dụng). Chỉ khi tất cả các ClassLoader cha đều không tìm thấy, ClassLoader con mới tự tìm trong classpath của mình.'
      },
      {
        en: '2. The 3 Steps of Class Linking (Verification, Preparation, Resolution): Linking transforms raw bytes into usable JVM internal structures: 1) Verification: rigorously checks the 0xCAFEBABE magic number, verifies operand stack bounds, and ensures bytecode cannot forge pointers or access illegal memory; 2) Preparation: allocates memory in Metaspace for static fields and initializes them to ZERO/NULL (not their user-defined values!); 3) Resolution: converts symbolic references in the Constant Pool into direct memory pointers.',
        vi: '2. Ba Bước Của Quá Trình Liên Kết (Linking): Quá trình liên kết biến các byte thô thành cấu trúc nội tại của JVM: 1) Verification (Xác thực): kiểm tra chặt chẽ số ma thuật 0xCAFEBABE, giới hạn ngăn xếp toán hạng, và bảo đảm bytecode không thể giả mạo con trỏ bộ nhớ; 2) Preparation (Chuẩn bị): cấp phát RAM trong Metaspace cho các biến static và gán giá trị mặc định là 0 hoặc null (chưa gán giá trị code viết!); 3) Resolution (Phân giải): chuyển đổi các tham chiếu biểu tượng trong Constant Pool thành con trỏ bộ nhớ trực tiếp.'
      },
      {
        en: '3. Thread-Safe Class Initialization (<clinit>): The Initialization phase executes static initializers and static field assignment statements (e.g. static int X = 42;). The JVM guarantees that <clinit> execution is completely thread-safe: HotSpot uses an internal Class Init Lock so that only one thread can initialize a class, making static nested class Singletons (Bill Pugh Singleton) 100% thread-safe without explicit synchronization.',
        vi: '3. Khởi Tạo Class An Toàn Đa Luồng (<clinit>): Pha Initialization thực thi các khối static {} và các lệnh gán biến static (như static int X = 42;). JVM bảo đảm việc chạy hàm <clinit> là an toàn đa luồng tuyệt đối: HotSpot sử dụng một khóa Class Init Lock nội bộ để chỉ có đúng 1 luồng được khởi tạo class, biến mẫu Bill Pugh Singleton (Static Inner Class) thành giải pháp tạo Singleton an toàn 100% mà không cần từ khóa synchronized.'
      },
      {
        en: '4. The 5 JVM Method Invocation Opcodes: How does the JVM invoke methods in bytecode? 1) invokevirtual: standard polymorphic instance method call using dynamic vtable lookup; 2) invokestatic: static method call resolved at compile time; 3) invokespecial: private methods, constructors (<init>), and super calls with no polymorphism; 4) invokeinterface: interface method call using itable search; 5) invokedynamic (Indy): dynamic call site resolution used for Java lambdas and Project Loom.',
        vi: '4. Năm Lệnh Bytecode Gọi Hàm Của JVM: JVM gọi hàm thông qua 5 lệnh bytecode đặc thù: 1) invokevirtual: gọi phương thức instance đa hình chuẩn qua bảng vtable; 2) invokestatic: gọi hàm static xác định từ lúc biên dịch; 3) invokespecial: gọi hàm private, constructor (<init>) và super không đa hình; 4) invokeinterface: gọi phương thức interface qua bảng itable; 5) invokedynamic (Indy): điểm gọi hàm động dùng cho Lambda và Project Loom.'
      },
      {
        en: '5. The Stack-Based Operand Architecture: In x86 assembly, arithmetic operates directly on registers (e.g. ADD EAX, EBX). In JVM bytecode, values are pushed onto the thread’s Operand Stack (e.g. iload_1, iload_2) and consumed by operations (iadd), which pushes the sum back onto the stack before storing it (istore_3). This elegant stack-machine abstraction allows Java bytecode to execute identically across any computer hardware in the world.',
        vi: '5. Kiến Trúc Máy Ảo Dựa Trên Ngăn Xếp (Operand Stack): Trong hợp ngữ x86, tính toán diễn ra trực tiếp trên thanh ghi (ADD EAX, EBX). Trong bytecode JVM, các giá trị được đẩy vào Ngăn xếp Toán hạng (iload_1, iload_2) và được toán tử tiêu thụ (iadd), đẩy kết quả ngược lại stack trước khi lưu biến (istore_3). Sự trừu tượng hóa tuyệt vời này cho phép bytecode Java chạy giống hệt nhau trên mọi phần cứng máy tính trên thế giới.'
      },
      {
        en: '6. Custom ClassLoaders & Class Isolation: Why write custom ClassLoaders? Frameworks like OSGi, Apache Tomcat, and Spring Boot implement custom ClassLoaders that break the parent-first rule (Child-First / WebAppClassLoader). This allows a Tomcat server hosting multiple web apps to load different versions of the same library (e.g. Spring 5 in App A and Spring 6 in App B) concurrently inside the same JVM without classpath collisions.',
        vi: '6. ClassLoader Tùy Biến & Cô Lập Ứng Dụng: Vì sao cần viết ClassLoader riêng? Các framework như OSGi, Apache Tomcat hay Spring Boot triển khai ClassLoader riêng phá vỡ quy tắc parent-first (chuyển sang Child-First). Điều này cho phép một máy chủ Tomcat chạy đồng thời nhiều ứng dụng web có thể nạp các phiên bản thư viện khác nhau (như App A dùng Spring 5, App B dùng Spring 6) ngay trong cùng 1 JVM mà không hề bị xung đột classpath.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Metaspace Memory Leak from ThreadLocal & ClassLoader Retention: When a web application is redeployed in Tomcat, its WebappClassLoader should be garbage-collected. However, if an application thread pool retains a ThreadLocal storing an object whose class was loaded by that WebappClassLoader, the entire ClassLoader and ALL its loaded classes remain pinned in Metaspace! Repeated redeployments exhaust Metaspace, causing java.lang.OutOfMemoryError: Metaspace.',
        vi: 'Rò Rỉ Bộ Nhớ Metaspace Do Giữ Tham Chiếu ClassLoader Trong ThreadLocal: Khi một ứng dụng web được redeploy trong Tomcat, WebappClassLoader cũ đáng lẽ phải được GC thu hồi. Tuy nhiên, nếu một luồng trong thread pool còn giữ biến ThreadLocal chứa đối tượng của class đó, toàn bộ ClassLoader và TOÀN BỘ các class của ứng dụng sẽ bị ghim chặt lại trong Metaspace! Redeploy vài lần sẽ làm cạn kiệt Metaspace và gây lỗi sập OutOfMemoryError: Metaspace.',
      },
      {
        en: 'ClassNotFoundException vs NoClassDefFoundError: Confusing these two errors is a common source of developer frustration. ClassNotFoundException is an explicit exception thrown when Class.forName() fails to find a class file. NoClassDefFoundError is a fatal JVM Error thrown when a class was present during compilation, but fails during runtime linking or static <clinit> initialization (e.g. a static block threw a runtime exception).',
        vi: 'Phân Biệt ClassNotFoundException vs NoClassDefFoundError: Nhầm lẫn hai lỗi này là ác mộng của lập trình viên. ClassNotFoundException là Exception xuất hiện khi gọi Class.forName() mà không tìm thấy file class. Còn NoClassDefFoundError là một Error nghiêm trọng của JVM xảy ra khi class có tồn tại lúc biên dịch, nhưng bị lỗi lúc runtime ở pha liên kết Linking hoặc khối static <clinit> bị ném ngoại lệ.',
      },
      {
        en: 'Bypassing Parent Delegation Causing Incompatible ClassCastException: When implementing child-first classloaders in plugin architectures, loading a shared interface (e.g. com.example.Plugin) in both parent and child classloaders creates two distinct types in the JVM. Attempting to cast the child instance to the parent interface throws a perplexing ClassCastException: class Plugin cannot be cast to class Plugin!',
        vi: 'Bỏ Qua Parent Delegation Gây Lỗi Ép Kiểu ClassCastException: Khi tự viết classloader ưu tiên con (child-first) trong kiến trúc plugin, việc để cả classloader cha và con cùng nạp một interface chung (như com.example.Plugin) sẽ tạo ra hai kiểu dữ liệu khác nhau trong JVM. Cố ép kiểu đối tượng con về interface cha sẽ ném ra lỗi khó hiểu: class Plugin cannot be cast to class Plugin!',
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'ClassLoader Delegation Architecture & JVM Bytecode Stack Frame Layout',
      vi: 'Kiến Trúc Phân Cấp ClassLoader & Cấu Trúc Khung Ngăn Xếp Bytecode'
    },
    description: {
      en: 'The 3-tier ClassLoader delegation hierarchy feeding compiled classes into Metaspace, executed on JVM Thread Stack Frames with Local Variables and Operand Stacks.',
      vi: 'Mô hình ủy quyền ClassLoader 3 tầng nạp class vào Metaspace, thực thi trên Stack Frame của luồng gồm Bảng Biến Cục Bộ và Ngăn Xếp Toán Hạng.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| CLASSLOADER PARENT-FIRST DELEGATION HIERARCHY:                                                     |
+----------------------------------------------------------------------------------------------------+
|  [ 1. BOOTSTRAP CLASSLOADER (C/C++ Native) ] -> Loads java.base, lib/modules (rt.jar in Java 8)     |
|          ^                                                                                         |
|          | (parent delegation)                                                                     |
|  [ 2. PLATFORM CLASSLOADER (jdk.internal.loader.ClassLoaders$PlatformClassLoader) ]                |
|          ^                                                                                         |
|          | (parent delegation)                                                                     |
|  [ 3. APPLICATION CLASSLOADER (jdk.internal.loader.ClassLoaders$AppClassLoader) ] -> Classpath / JARs|
+----------------------------------------------------------------------------------------------------+
| JVM THREAD STACK FRAME EXECUTION LAYOUT:                                                           |
| +------------------------------------------------------------------------------------------------+ |
| | LOCAL VARIABLE TABLE (Slots 0 to N):                                                           | |
| |  Slot 0: this (4B ref)  | Slot 1: int a (4B)  | Slot 2: int b (4B)  | Slot 3: int result (4B)  | |
| +------------------------------------------------------------------------------------------------+ |
| | OPERAND STACK (LIFO Evaluation Stack in RAM):                                                  | |
| |  [ iload_1 ] -> Push 10 onto stack                                                             | |
| |  [ iload_2 ] -> Push 20 onto stack                                                             | |
| |  [ iadd    ] -> Pops 10 & 20, evaluates sum (30), pushes 30 back to stack                       | |
| |  [ istore_3] -> Pops 30 and stores into Local Variable Slot 3                                  | |
| +------------------------------------------------------------------------------------------------+ |
| | FRAME DATA (Constant Pool Resolution, Method Return Value, Exception Dispatch Table)           | |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'magic_number', size: '4 Bytes (0xCAFEBABE)', description: { en: 'Header signature of every valid Java .class binary file, checked during Verification.', vi: 'Chữ ký định danh mở đầu mọi file .class hợp lệ, được kiểm tra ở pha Xác thực.' } },
      { name: 'constant_pool_count', size: '2 Bytes (u2)', description: { en: 'Number of symbolic constant pool entries (strings, class names, method signatures).', vi: 'Số lượng các mục hằng số biểu tượng (chuỗi, tên class, chữ ký hàm).' } },
      { name: 'max_stack_max_locals', size: '4 Bytes (u2 + u2)', description: { en: 'Pre-calculated operand stack depth and local variable slots required by method frame.', vi: 'Độ sâu tối đa của ngăn xếp toán hạng và số slot biến cục bộ do compiler tính trước.' } }
    ]
  },

  steps: [
    {
      id: 'delegate-parent',
      title: { en: '1. Parent-First Delegation Request Bubbling', vi: '1. Ủy Quyền Yêu Cầu Nạp Lớp Lên ClassLoader Phụ Huynh' },
      phase: 'PARENT_DELEGATION',
      description: {
        en: 'When a class is requested, AppClassLoader delegates to PlatformClassLoader, which delegates to BootstrapClassLoader. If Bootstrap finds the class in java.base, it loads it immediately, protecting system classes from hijacking.',
        vi: 'Khi có yêu cầu nạp class, AppClassLoader ủy quyền lên PlatformClassLoader, rồi tiếp tục lên BootstrapClassLoader. Nếu Bootstrap tìm thấy class trong java.base, nó nạp luôn, bảo vệ an toàn các class hệ thống.'
      },
      jvmRuntimeBehavior: {
        en: 'Hierarchical recursion. Metaspace class dictionary checked for existing instances.',
        vi: 'Đệ quy theo phân cấp. Tra cứu từ điển class trong Metaspace xem đã nạp chưa.'
      },
      javaCodeLineMatch: 'protected Class<?> loadClass(String name, boolean resolve)'
    },
    {
      id: 'bytecode-link-verify',
      title: { en: '2. Bytecode Verification & Preparation Phase', vi: '2. Pha Liên Kết: Xác Thực Bytecode & Chuẩn Bị Biến Static' },
      phase: 'LINK_AND_PREPARE',
      description: {
        en: 'HotSpot verifies the 0xCAFEBABE magic number, validates operand stack safety, and prepares static variables in Metaspace by allocating memory and initializing them to default values (0, null).',
        vi: 'HotSpot kiểm tra số ma thuật 0xCAFEBABE, xác thực an toàn ngăn xếp toán hạng, và chuẩn bị các biến static trong Metaspace bằng cách cấp phát RAM và gán giá trị mặc định (0, null).'
      },
      jvmRuntimeBehavior: {
        en: 'Security verification pass. Static memory allocated in native Metaspace.',
        vi: 'Chạy kiểm tra an ninh bytecode. Cấp phát bộ nhớ static trong Metaspace native.'
      },
      javaCodeLineMatch: '// Static fields initialized to default: 0 / null in Metaspace'
    },
    {
      id: 'clinit-execute',
      title: { en: '3. Thread-Safe Class Initialization (<clinit>) Execution', vi: '3. Thực Thi Khởi Tạo Class An Toàn Đa Luồng (<clinit>)' },
      phase: 'CLINIT_INITIALIZE',
      description: {
        en: 'The JVM acquires the internal Class Init Lock and executes the static initializer block <clinit> (e.g. running static { ... } and assigning user values). Guaranteed to execute exactly once per class!',
        vi: 'JVM chiếm khóa Class Init Lock nội bộ và thực thi khối khởi tạo static <clinit> (chạy các đoạn static { ... } và gán giá trị người dùng viết). Bảo đảm chạy đúng 1 lần duy nhất!'
      },
      jvmRuntimeBehavior: {
        en: 'Thread-safe static execution. Class marked as INITIALIZED.',
        vi: 'Thực thi static an toàn đa luồng. Class được đánh dấu là INITIALIZED.'
      },
      javaCodeLineMatch: 'static { System.out.println("Class initialized!"); }'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'HotSpot JVM Class Execution Engine',
      implementationName: 'Template Interpreter & C1/C2 JIT Compiler',
      keyMechanism: {
        en: 'Executes bytecode via a low-level Template Interpreter using CPU assembly stubs. Frequently called methods are JIT compiled into native machine instructions via C1 and C2 compilers.',
        vi: 'Thực thi bytecode qua Template Interpreter dùng các đoạn mã assembly mẫu. Các hàm được gọi nhiều lần sẽ được trình biên dịch C1/C2 JIT biên dịch thẳng ra mã máy.'
      },
      defaultFlags: '-XX:+TieredCompilation -XX:CICompilerCount=4 -XX:+UseClassDataSharing',
      architectureNote: {
        en: 'Class Data Sharing (CDS) pre-processes class metadata into shared archive files, slashing container startup times by 40%.',
        vi: 'Class Data Sharing (CDS) tiền xử lý metadata của class vào các file archive dùng chung, giảm 40% thời gian khởi động container.'
      }
    },
    {
      jvmEngine: 'GraalVM Native Image AOT',
      implementationName: 'Closed-World Static Analysis Engine',
      keyMechanism: {
        en: 'Completely eliminates the ClassLoader subsystem at runtime! All classes are analyzed, linked, and initialized ahead-of-time (AOT) during compilation into a single native binary executable.',
        vi: 'Xóa sổ hoàn toàn phân hệ ClassLoader lúc runtime! Mọi class đều được phân tích, liên kết và khởi tạo trước (AOT) khi build thành file thực thi nhị phân duy nhất.'
      },
      defaultFlags: '-H:+UnlockExperimentalVMOptions --no-fallback',
      architectureNote: {
        en: 'Zero Metaspace memory overhead and instantaneous sub-millisecond application startup.',
        vi: 'Không tốn một byte RAM Metaspace nào và khởi động tức thì dưới 1 mili giây.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Dynamic loading enables modular plugin architectures and on-the-fly bytecode instrumentation.', vi: 'Nạp class động cho phép xây dựng kiến trúc plugin module và can thiệp bytecode lúc runtime.' },
      { en: 'Parent-first delegation provides strong security boundaries protecting core Java runtime APIs.', vi: 'Ủy quyền parent-first tạo ra ranh giới bảo mật vững chắc bảo vệ các API cốt lõi của Java.' }
    ],
    cons: [
      { en: 'Startup latency penalty as classes are loaded, verified, and linked lazily on first access.', vi: 'Tăng độ trễ khởi động do các class phải được nạp, xác thực và liên kết lười lúc truy cập lần đầu.' },
      { en: 'Risk of Metaspace memory leaks when frameworks retain references to discarded ClassLoaders.', vi: 'Nguy cơ rò rỉ RAM Metaspace khi framework vô tình giữ tham chiếu tới ClassLoader cũ.' }
    ],
    memoryFootprint: {
      en: 'Metaspace footprint scales with the number of loaded classes (~4-8KB per class metadata).',
      vi: 'Dung lượng Metaspace tăng theo số lượng class được nạp (~4-8KB cho mỗi class metadata).'
    },
    jvmSpecificationGuarantee: {
      en: 'JVM Bytecode Verification guarantees complete type safety and prevents arbitrary memory corruption.',
      vi: 'Xác thực Bytecode bảo đảm an toàn kiểu dữ liệu tuyệt đối và ngăn chặn việc phá hỏng bộ nhớ.'
    }
  },

  javaCode: `package com.enterprise.jvm.bytecode;

/**
 * Pure Java 21 Educational Masterclass: ClassLoader Lifecycle & Bytecode
 * Demonstrates:
 *  1. Inspecting the 3-tier ClassLoader Delegation Hierarchy
 *  2. Thread-safe static initialization (<clinit>)
 *  3. Operand stack bytecode execution simulation
 */
public class ClassLoaderBytecodeDemo {

    // Evaluated during Preparation (initialized to 0) -> Initialized to 100 during <clinit>
    private static int staticCounter = 100;

    static {
        System.out.println("[<clinit>] ClassLoaderBytecodeDemo static initialization block executing thread-safely!");
    }

    public static void main(String[] args) {
        System.out.println("=== CLASSLOADER & BYTECODE EXECUTION MASTERCLASS ===");

        // Step 1: Inspect ClassLoader Delegation Hierarchy
        ClassLoader appLoader = ClassLoaderBytecodeDemo.class.getClassLoader();
        System.out.println("Application ClassLoader: " + appLoader);

        ClassLoader platformLoader = appLoader.getParent();
        System.out.println("Platform ClassLoader: " + platformLoader);

        ClassLoader bootstrapLoader = platformLoader.getParent();
        System.out.println("Bootstrap ClassLoader (null means native C++): " + bootstrapLoader);

        // Step 2: Bytecode Operand Stack Simulation
        int result = calculateArithmetic(10, 20);
        System.out.println("Arithmetic result evaluated on Operand Stack: " + result);
    }

    public static int calculateArithmetic(int a, int b) {
        // Bytecode generates:
        // 0: iload_0  (push a)
        // 1: iload_1  (push b)
        // 2: iadd     (pop both, add, push sum)
        // 3: ireturn  (return top of operand stack)
        return a + b;
    }
}`,

  jvmFlagsCode: `# ===================================================================
# HotSpot Flags to Trace Class Loading and Metaspace Diagnostics
# ===================================================================
# Trace every single class loaded into JVM with its source JAR:
-Xlog:class+load=info:file=class_load.log

# Inspect ClassLoader statistics on a live running production JVM:
jcmd <PID> VM.classloader_stats

# Dump Metaspace memory breakdown:
jcmd <PID> VM.metaspace`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c com.enterprise.jvm.bytecode.ClassLoaderBytecodeDemo
public static int calculateArithmetic(int, int);
  Code:
   0: iload_0       // Push local variable 0 (param a) onto operand stack
   1: iload_1       // Push local variable 1 (param b) onto operand stack
   2: iadd          // Pop both, add them, push result (30) back onto operand stack
   3: ireturn       // Return integer from top of operand stack

static {};
  Code:
   0: bipush        100
   2: putstatic     #7  // Field staticCounter:I (Assigned during <clinit>)
   5: getstatic     #13 // Field java/lang/System.out:Ljava/io/PrintStream;
   8: ldc           #19 // String [<clinit>] ClassLoaderBytecodeDemo static initialization...
  10: invokevirtual #21 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
  13: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'Explain the Parent-First Delegation Model in Java ClassLoaders. Why is it designed this way?',
        vi: 'Giải thích mô hình Ủy thác cha trước (Parent-First Delegation) của ClassLoader trong Java. Tại sao lại thiết kế như vậy?'
      },
      answer: {
        en: 'When a ClassLoader receives a request to load a class, it does NOT attempt to load it immediately. Instead, it delegates the request to its parent ClassLoader first. This repeats up to the Bootstrap ClassLoader. Only if the parent hierarchy fails to find the class (throws ClassNotFoundException) does the child ClassLoader call its own findClass() method. The primary reason is SECURITY and CLASS CONSISTENCY: it prevents untrusted third-party code from overriding core JDK classes like java.lang.String or java.lang.Object with malicious implementations.',
        vi: 'Khi một ClassLoader nhận yêu cầu nạp một class, nó KHÔNG tự nạp ngay. Thay vào đó, nó ủy thác (delegate) yêu cầu lên cho ClassLoader cha trước. Quá trình này lặp lại ngược lên tới Bootstrap ClassLoader ở đỉnh. Chỉ khi toàn bộ các ClassLoader cha không tìm thấy class (ném ClassNotFoundException) thì ClassLoader con mới tự tìm và nạp class đó. Lý do cốt lõi là BẢO MẬT và TÍNH NHẤT QUÁN: ngăn chặn mã độc của bên thứ ba giả mạo và ghi đè các lớp lõi của hệ thống như java.lang.String hay java.lang.Object.'
      },
      trapWarning: {
        en: 'In Java, two classes are considered IDENTICAL if and only if they have the exact same package/class name AND were loaded by the EXACT SAME ClassLoader instance. The same byte code loaded by two different ClassLoaders produces incompatible types (ClassCastException)!',
        vi: 'Trong Java, hai class chỉ được coi là CÙNG MỘT LOẠI khi và chỉ khi chúng cùng tên package/class VÀ ĐƯỢC NẠP BỞI CÙNG MỘT ĐỐI TƯỢNG CLASSLOADER. Cùng một file class nhưng nạp bởi 2 ClassLoader khác nhau sẽ sinh ra 2 kiểu dữ liệu không tương thích, ép kiểu sẽ bị ClassCastException!'
      },
      proTip: {
        en: 'Tomcat WebappClassLoader breaks the parent-first rule intentionally: it searches the local WEB-INF/classes first before delegating to the parent, allowing each web application to use its own distinct version of third-party libraries (Child-First delegation).',
        vi: 'Tomcat WebappClassLoader cố tình phá vỡ quy tắc cha trước: nó ưu tiên tìm trong WEB-INF/classes trước (Child-First delegation) để mỗi ứng dụng web có thể chạy một phiên bản thư viện riêng biệt mà không bị xung đột với server.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What are the 3 phases of the Class Linking process in the JVM?',
        vi: '3 giai đoạn trong quá trình Liên kết lớp (Class Linking) của JVM là gì?'
      },
      answer: {
        en: 'After Loading, Linking occurs in 3 distinct steps: 1. Verification: The JVM verifies that the binary byte stream complies with the JVM Specification: checks magic 0xCAFEBABE, validates constant pool integrity, and runs data-flow analysis to ensure operand stack balance and no arbitrary pointer operations. 2. Preparation: The JVM allocates memory in Metaspace for static fields and initializes them to their DEFAULT zero values (int to 0, boolean to false, references to null). Initial values declared in code are NOT assigned yet! 3. Resolution: Symbolic references in the Constant Pool (e.g. method and class names like #7) are dynamically resolved into direct pointers to native memory.',
        vi: 'Sau bước Loading (Nạp lớp), quá trình Linking (Liên kết) gồm 3 bước: 1. Verification (Thẩm định): JVM kiểm tra tính hợp lệ của file class: mã ma thuật 0xCAFEBABE, tính toàn vẹn của bảng hằng, bảo đảm không tràn ngăn xếp và không thao túng con trỏ trái phép. 2. Preparation (Chuẩn bị): JVM cấp phát bộ nhớ trong Metaspace cho các biến static và gán giá trị MẶC ĐỊNH kiểu số 0 (int là 0, boolean là false, reference là null). Giá trị gán trong code CHƯA HỀ được gán ở bước này! 3. Resolution (Phân giải): Các tham chiếu biểu tượng (Symbolic Reference) trong Constant Pool được dịch thành địa chỉ con trỏ ô nhớ trực tiếp.'
      },
      trapWarning: {
        en: 'Remember: static int x = 123; has value 0 during Preparation. It is only assigned 123 later during the Initialization (<clinit>) phase!',
        vi: 'Ghi nhớ: static int x = 123; sẽ có giá trị là 0 trong bước Preparation. Nó chỉ thực sự được gán số 123 ở bước Initialization (<clinit>) kế tiếp!'
      },
      proTip: {
        en: 'Exception: static final int CONSTANT = 123; is initialized to 123 during Preparation because it is a ConstantValue attribute resolved at compile-time.',
        vi: 'Ngoại lệ: Nếu có từ khóa final (static final int x = 123;), biến sẽ được gán luôn giá trị 123 ngay ở bước Preparation vì đây là hằng số ConstantValue đã chốt lúc biên dịch.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'What is the <clinit> method, and how does the JVM guarantee thread-safe static initialization?',
        vi: 'Phương thức <clinit> là gì và JVM bảo đảm tính an toàn đa luồng cho khởi tạo static như thế nào?'
      },
      answer: {
        en: '<clinit> (Class Initializer) is a synthetic method generated by javac that collects all static variable initializations and static {} blocks in source code order. The JVM guarantees that <clinit> is executed ATOMICALLY and THREAD-SAFELY: HotSpot uses an internal Class Initialization Lock on the InstanceKlass. If multiple threads simultaneously attempt to trigger class loading on the same class, only ONE thread executes <clinit> while all other threads block. Once initialized, the initialization state is marked fully-initialized, and subsequent accesses incur zero lock overhead.',
        vi: '<clinit> (Class Initializer) là phương thức đặc biệt do javac tự động sinh ra để gom tất cả các lệnh gán biến static và các khối static {} theo thứ tự trong code. JVM bảo đảm hàm <clinit> được thực thi NGUYÊN TỬ VÀ AN TOÀN ĐA LUỒNG: HotSpot sử dụng một ổ khóa Class Initialization Lock nội bộ trên InstanceKlass. Nếu nhiều luồng cùng kích hoạt nạp lớp đồng thời, chỉ DUY NHẤT 1 luồng được chạy <clinit>, các luồng khác bị chặn chờ. Sau khi xong, trạng thái được đánh dấu đã hoàn thành và các lần gọi tiếp theo hoàn toàn không tốn chi phí khóa.'
      },
      trapWarning: {
        en: 'Beware of circular dependencies in static initializers! If Class A <clinit> triggers Class B, and Class B <clinit> triggers Class A, the JVM can enter a permanent deadlocked <clinit> state!',
        vi: 'Cực kỳ cảnh giác với sự phụ thuộc vòng tròn giữa các khối static: Nếu static block của Class A gọi Class B, mà Class B lại gọi ngược Class A, JVM sẽ rơi vào tình trạng Deadlock vĩnh viễn ở hàm <clinit>!'
      },
      proTip: {
        en: 'This atomic <clinit> guarantee is the exact mechanism that makes the Bill Pugh Singleton pattern 100% thread-safe without needing synchronized or volatile locks.',
        vi: 'Cam kết an toàn đa luồng của <clinit> chính là bí quyết giúp mẫu Singleton Bill Pugh an toàn 100% mà không cần đến synchronized hay volatile.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'Dynamic Proxy Metaspace Memory Leak & ThreadLocal ClassLoader Pinning Outage',
      vi: 'Rò Rỉ Bộ Nhớ Metaspace Do CGLIB Proxy & Lỗi Giữ Con Trỏ ClassLoader Trong ThreadLocal'
    },
    businessContext: {
      en: 'An enterprise SaaS multi-tenant workflow engine allows enterprise clients to dynamically upload and reload custom workflow rule scripts without restarting the host cluster.',
      vi: 'Nền tảng SaaS quy trình đa người thuê cho phép khách hàng tự tải lên và nạp lại (hot-reload) các kịch bản quy tắc nghiệp vụ động mà không cần khởi động lại cụm máy chủ.'
    },
    problemDescription: {
      en: 'Each time a tenant uploaded an updated workflow script, the engine instantiated a custom URLClassLoader and utilized ByteBuddy/CGLIB to generate dynamic proxy classes for security interceptors. Over 3 days of operations with 60 script hot-reloads, the JVM crashed catastrophically with java.lang.OutOfMemoryError: Metaspace. Even though the old workflow instances were discarded and collected from the Java Heap, Metaspace memory utilization climbed steadily until exhausting the 512MB limit. Heap dump inspection with Eclipse MAT showed that 60 old URLClassLoader instances remained alive in memory, preventing HotSpot from unloading over 14,000 dynamically generated proxy classes.',
      vi: 'Mỗi khi khách hàng cập nhật kịch bản mới, hệ thống lại tạo một URLClassLoader mới và dùng ByteBuddy/CGLIB để sinh các lớp proxy động phục vụ việc chặn bắt bảo mật. Sau 3 ngày hoạt động với 60 lần cập nhật kịch bản, JVM bất ngờ sập với lỗi hiểm java.lang.OutOfMemoryError: Metaspace. Mặc dù các đối tượng kịch bản cũ đã bị dọn sạch khỏi Heap, dung lượng Metaspace vẫn tăng liên tục không ngừng cho đến khi cạn kiệt 512MB. Phân tích Heap Dump qua Eclipse MAT chỉ ra rằng 60 đối tượng URLClassLoader cũ vẫn bị ghim chặt trong bộ nhớ, ngăn cản HotSpot dọn dẹp hơn 14,000 class proxy động đã sinh ra.'
    },
    whyNaiveFails: {
      en: 'Increasing -XX:MaxMetaspaceSize from 512MB to 3GB merely delayed the inevitable container death from 3 days to 2 weeks, while causing prolonged Full GC pauses as the garbage collector desperately tried to reclaim pinned Metaspace metadata.',
      vi: 'Nâng trần Metaspace (-XX:MaxMetaspaceSize) từ 512MB lên 3GB chỉ kéo dài thời gian sống của container từ 3 ngày lên 2 tuần, đồng thời làm phát sinh các đợt dừng Full GC kéo dài hàng chục giây khi bộ dọn rác bất lực tìm cách giải phóng Metaspace.'
    },
    coreSolution: {
      en: 'A class in Metaspace CANNOT be garbage-collected as long as its creating ClassLoader instance is reachable! The old ClassLoaders were pinned in memory because: 1. A logging library stored contextual metadata in a ThreadLocal variable on thread pool worker threads. 2. java.sql.DriverManager held static references to plugin drivers. Fix: Enforce a strict plugin teardown lifecycle: 1. Explicitly clean all ThreadLocals (threadLocal.remove()). 2. Deregister JDBC drivers and shutdown thread pools. 3. Call urlClassLoader.close(). 4. Verify G1GC class unloading is enabled (-XX:+ClassUnloadingWithConcurrentMark).',
      vi: 'Một Class trong Metaspace KHÔNG THỂ bị dọn rác chừng nào đối tượng ClassLoader tạo ra nó vẫn còn được tham chiếu! Các ClassLoader cũ bị ghim lại do: 1. Thư viện log lưu metadata vào biến ThreadLocal trên các luồng worker của thread pool máy chủ. 2. java.sql.DriverManager giữ tham chiếu static tới driver của plugin. Giải pháp: Xây dựng quy trình hủy plugin nghiêm ngặt: 1. Xóa sạch mọi biến ThreadLocal (threadLocal.remove()). 2. Hủy đăng ký JDBC driver. 3. Gọi urlClassLoader.close(). 4. Đảm bảo G1GC bật tính năng dọn dẹp class (-XX:+ClassUnloadingWithConcurrentMark).'
    },
    productionCode: `// Production Safe Dynamic Plugin ClassLoader Teardown Architecture
package com.saas.plugin.engine;

import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.sql.Driver;
import java.sql.DriverManager;
import java.util.Enumeration;

public class PluginLifecycleManager {

    public static class SafePluginContext implements AutoCloseable {
        private URLClassLoader classLoader;
        private final ThreadLocal<String> tenantContextHolder = new ThreadLocal<>();

        public SafePluginContext(URL[] urls, ClassLoader parent) {
            this.classLoader = new URLClassLoader(urls, parent);
        }

        public Class<?> loadPluginClass(String name) throws ClassNotFoundException {
            return classLoader.loadClass(name);
        }

        @Override
        public void close() throws IOException {
            // 1. CRITICAL: Clean up ThreadLocals to prevent ClassLoader pinning!
            tenantContextHolder.remove();

            // 2. Deregister any JDBC drivers registered by this isolated classloader
            Enumeration<Driver> drivers = DriverManager.getDrivers();
            while (drivers.hasMoreElements()) {
                Driver driver = drivers.nextElement();
                if (driver.getClass().getClassLoader() == this.classLoader) {
                    try {
                        DriverManager.deregisterDriver(driver);
                    } catch (Exception ignored) {}
                }
            }

            // 3. Close the URLClassLoader to release open JAR file handles
            if (this.classLoader != null) {
                this.classLoader.close();
                // 4. Nullify reference to allow JVM GC to reclaim Metaspace metadata!
                this.classLoader = null;
            }
        }
    }
}`,
    architectureImpact: {
      en: 'Metaspace memory stabilized at a constant 88MB across 400+ dynamic hot-reloads; Metaspace OOM crashes eliminated 100%; Dynamic proxy classes reclaimed cleanly in concurrent GC cycles.',
      vi: 'Dung lượng Metaspace ổn định ở mức 88MB suốt hơn 400 lần hot-reload liên tục; Triệt tiêu 100% sự cố sập Metaspace OOM; Toàn bộ các class proxy động được thu gom sạch sẽ trong các chu kỳ GC chạy nền.'
    }
  }
};
