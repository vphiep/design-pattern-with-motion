import type { JavaCoreTopic } from '../types';

export const primitivesVsReferencesTopic: JavaCoreTopic = {
  id: 'primitives-vs-references',
  category: 'java-fundamentals',
  name: 'Primitives vs References & Pass-by-Value',
  tagline: {
    en: 'Stack-allocated raw binary primitives vs Heap object references, the strictly Pass-by-Value rule, and Autoboxing cache physics.',
    vi: 'Biến nguyên thủy trên Stack vs Con trỏ tham chiếu trên Heap, quy tắc Pass-by-Value bất biến và cơ chế Autoboxing.'
  },
  difficulty: 1,
  level: 'basic',
  order: 4,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      en: 'Software systems process billions of numeric calculations alongside complex business domain models. Confusing primitive types with object references leads to insidious NullPointerExceptions, catastrophic memory bloat (4x to 6x overhead), and false assumptions about method parameter mutations.',
      vi: 'Hệ thống phần mềm xử lý hàng tỷ phép tính số học song hành với các mô hình nghiệp vụ phức tạp. Việc nhầm lẫn giữa kiểu nguyên thủy và đối tượng tham chiếu dẫn đến lỗi NullPointerException tai hại, phình to bộ nhớ RAM từ 4 đến 6 lần và hiểu sai hoàn toàn cơ chế truyền tham số trong hàm.'
    },
    hardwareConstraint: {
      en: 'Modern CPU L1 Data Caches operate on 64-byte Cache Lines. A contiguous primitive int[] array packs exactly 16 values per 64-byte line (16 * 4B = 64B), enabling hardware spatial prefetching at 0.5ns. Conversely, an Integer[] array packs 16 pointer addresses pointing to 16 disjoint Heap memory locations, inducing 16 independent cache misses (~80ns each) and devastating memory throughput.',
      vi: 'Cache L1 của CPU hoạt động theo từng dòng 64-byte (Cache Line). Một mảng int[] nguyên thủy chứa vừa khít 16 số nguyên trên một dòng 64-byte (16 * 4B = 64B), kích hoạt cơ chế nạp trước phần cứng chỉ tốn 0.5ns. Ngược lại, Integer[] lưu 16 con trỏ trỏ tới 16 ô nhớ rời rạc trên Heap, gây ra 16 lần Cache Miss độc lập (~80ns/lần) làm sập hiệu năng thông lượng CPU.'
    },
    fundamentalSolution: {
      en: 'Java defines 8 primitive types (byte, short, int, long, float, double, char, boolean) allocated directly as raw binary bits inside Thread Stack Frames with zero GC overhead. Object types live in the Heap and are manipulated exclusively via 4-byte/8-byte reference pointers. Crucially, Java is STRICTLY Pass-by-Value: passing an Object passes a bitwise copy of the reference address, never the original pointer variable itself.',
      vi: 'Java định nghĩa 8 kiểu nguyên thủy lưu trực tiếp dưới dạng bit nhị phân thô trong Stack Frame của luồng mà không tốn 1 chu kỳ GC nào. Các đối tượng sống trên Heap và được truy xuất qua con trỏ tham chiếu 4-byte/8-byte. Đặc biệt, Java TUYỆT ĐỐI là Pass-by-Value: truyền đối tượng vào hàm thực chất là truyền bản sao giá trị của con trỏ địa chỉ, hoàn toàn không phải truyền tham chiếu nguyên bản (pass-by-reference) như C++.'
    },
    math: {
      formula: 'Integer_Memory = Mark_Word [8B] + Klass_Pointer [4B] + int_field [4B] + Pad [0B] = 16 Bytes (4x of primitive int)',
      description: {
        en: 'Under Compressed OOPs, a boxed Integer consumes 16 bytes on Heap vs 4 bytes on Stack for a primitive int. An array of 1,000,000 ints consumes 4MB; an Integer[1,000,000] consumes 24MB (6x bloat).',
        vi: 'Dưới cơ chế nén con trỏ, một đối tượng Integer ngốn 16 byte trên Heap so với 4 byte trên Stack của primitive int. Mảng 1 triệu số int tốn 4MB; mảng Integer[] tốn tới 24MB (gấp 6 lần).'
      },
      timeComplexity: 'O(1) Stack variable read/write; O(1) + Pointer Dereference (Cache Line Miss) for Heap',
      spaceComplexity: 'Primitives: 1 to 8 bytes on Stack; Boxed Objects: 16 to 24 bytes on Heap',
      memoryOverheadFormula: 'Boxing Memory Overhead = (16B Object Header + 4B Address Pointer) / 4B Primitive = 500% Overhead'
    }
  },

  memoryLayout: {
    title: {
      en: 'Physical Memory Layout: Stack Frame Slots vs Heap Object Reference',
      vi: 'Bố Cục Ô Nhớ Vật Lý: Ngăn Xếp Stack Frame vs Con Trỏ Heap Object'
    },
    description: {
      en: 'Primitive variables hold raw binary values directly in the thread stack frame slot. Reference variables hold a 32-bit (Compressed OOP) integer offset pointing to the 64-bit aligned object header on the Heap.',
      vi: 'Biến nguyên thủy chứa trực tiếp giá trị nhị phân trong slot stack frame. Biến tham chiếu chỉ chứa giá trị địa chỉ 32-bit (Compressed OOP) trỏ tới object header căn chỉnh 64-bit trên Heap.'
    },
    asciiDiagram: `
+-----------------------------------------------------------------------------------------+
|                                 THREAD PRIVATE STACK FRAME                              |
|  [Slot 0: this] -> 0x7FFF0010 (Ref to enclosing Service)                                |
|  [Slot 1: age ] -> 0x00000019 (Direct primitive integer: 25)                            |
|  [Slot 2: user] -> 0x00007F9B (4-Byte Compressed OOP Pointer to Heap Address)           |
+-----------------------------------------------------------------------------------------+
                                          |
                                          | Points to 64-bit aligned Heap block
                                          v
+-----------------------------------------------------------------------------------------+
|                                  HEAP MEMORY (0x00007F9B)                               |
|  +---------------------------+-------------------------------------------------------+  |
|  | Mark Word (8 Bytes)       | 0x0000000000000001 (Hash: None, Age: 0, Lock: Unlocked) |  |
|  +---------------------------+-------------------------------------------------------+  |
|  | Klass Word (4 Bytes)      | 0x000010A4 (Compressed Pointer -> User.class)        |  |
|  +---------------------------+-------------------------------------------------------+  |
|  | Field: name (4 Bytes)     | 0x0000882C (Pointer -> "Alice" in String Pool)        |  |
|  +---------------------------+-------------------------------------------------------+  |
|  | Field: age (4 Bytes)      | 0x00000019 (Primitive int: 25)                        |  |
|  +---------------------------+-------------------------------------------------------+  |
|  | Padding (4 Bytes)         | 0x00000000 (Padded to 24 Bytes multiple of 8)         |  |
|  +---------------------------+-------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'Primitive int', size: '4 Bytes', description: { en: 'Raw two\'s complement binary stored directly in stack slot.', vi: 'Số nguyên nhị phân bù 2 lưu trực tiếp trong stack slot.' } },
      { name: 'OOP Reference', size: '4 Bytes', description: { en: 'Compressed 32-bit pointer shifted right 3 bits pointing to Heap.', vi: 'Con trỏ nén 32-bit dịch phải 3 bit trỏ sang Heap.' } },
      { name: 'Object Header', size: '12 Bytes', description: { en: '8B Mark Word + 4B Klass Pointer.', vi: '8 byte Mark Word + 4 byte con trỏ Klass.' } },
      { name: 'Object Padding', size: '0-7 Bytes', description: { en: 'Alignment padding to make total size multiple of 8.', vi: 'Đệm căn chỉnh bội số 8 byte theo kiến trúc CPU 64-bit.' } }
    ]
  },

  steps: [
    {
      id: 'primitive-stack',
      title: { en: '1. Primitive Allocation on Thread Stack Frame', vi: '1. Cấp phát biến nguyên thủy trên Stack Frame' },
      phase: 'STACK_PRIMITIVE',
      description: {
        en: 'The statement int age = 25 reserves a 32-bit slot in the current stack frame. The raw binary integer value 25 is stored directly with zero Heap allocation or pointer overhead.',
        vi: 'Câu lệnh int age = 25 cấp một slot 32-bit trong stack frame hiện tại. Giá trị nhị phân 25 được ghi trực tiếp mà không tốn 1 byte Heap hay con trỏ nào.'
      },
      jvmRuntimeBehavior: {
        en: 'Bytecode bipush 25 followed by istore_1. Zero Garbage Collection tracking.',
        vi: 'Thực thi bytecode bipush 25 rồi istore_1. Hoàn toàn không tốn công theo dõi của GC.'
      },
      javaCodeLineMatch: 'int age = 25;'
    },
    {
      id: 'ref-heap-alloc',
      title: { en: '2. Object Instantiation & Reference Pointer Binding', vi: '2. Khởi tạo đối tượng Heap & Gán con trỏ tham chiếu' },
      phase: 'HEAP_REFERENCE',
      description: {
        en: 'The statement User user = new User("Alice") allocates 24 bytes in the Eden TLAB buffer. The stack frame receives only the 4-byte reference address (0x7F9B) pointing to the Heap object.',
        vi: 'Câu lệnh User user = new User("Alice") cấp phát 24 byte trong vùng Eden TLAB. Stack frame chỉ lưu địa chỉ tham chiếu 4 byte (0x7F9B) trỏ sang đối tượng Heap.'
      },
      jvmRuntimeBehavior: {
        en: 'TLAB pointer bump; bytecode new, dup, invokespecial <init>, astore_2.',
        vi: 'Dịch con trỏ TLAB; thực thi bytecode new, dup, invokespecial <init>, astore_2.'
      },
      javaCodeLineMatch: 'User user = new User("Alice", age);'
    },
    {
      id: 'pass-by-value',
      title: { en: '3. Pass-by-Value: Pointer Value Copy in Method Calls', vi: '3. Quy tắc Pass-by-Value: Sao chép giá trị con trỏ' },
      phase: 'PASS_BY_VALUE',
      description: {
        en: 'Calling modify(age, user) pushes a brand-new Stack Frame. The integer 25 is copied by value. The reference address 0x7F9B is ALSO copied by value. Reassigning user = new User() inside the method only changes the copy of the pointer, leaving the caller pointer unchanged!',
        vi: 'Gọi modify(age, user) đẩy một Stack Frame hoàn toàn mới. Số nguyên 25 được sao chép giá trị. Địa chỉ con trỏ 0x7F9B CŨNG được sao chép giá trị. Việc gán user = new User() trong hàm chỉ đổi con trỏ bản sao, con trỏ ở hàm gọi ban đầu không hề thay đổi!'
      },
      jvmRuntimeBehavior: {
        en: 'New Activation Record pushed on JVM stack. Frame popped automatically on return with zero side effects on original pointer.',
        vi: 'Đẩy Activation Record mới lên JVM stack. Frame tự động hủy khi return mà không ảnh hưởng tới con trỏ gốc.'
      },
      javaCodeLineMatch: 'modifyValues(age, user);'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Oracle HotSpot JVM 21 (C2 JIT)',
      implementationName: 'Escape Analysis & Scalar Replacement',
      keyMechanism: {
        en: 'C2 JIT analyzes if an object escapes the allocating method. If it does not escape, C2 eliminates Heap allocation entirely, decomposing the object into primitive local variables on the Stack (Scalar Replacement).',
        vi: 'C2 JIT phân tích xem đối tượng có thoát khỏi hàm hay không (Escape Analysis). Nếu không thoát, C2 xóa bỏ hoàn toàn việc cấp phát trên Heap, bóc tách đối tượng thành các biến nguyên thủy lưu trực tiếp trên Stack.'
      },
      defaultFlags: '-XX:+DoEscapeAnalysis -XX:+EliminateAllocations',
      architectureNote: {
        en: 'Transforms millions of short-lived objects into zero-allocation CPU register operations.',
        vi: 'Biến hàng triệu đối tượng ngắn hạn thành các thanh ghi CPU không tốn 1 byte RAM nào.'
      }
    },
    {
      jvmEngine: 'HotSpot Integer Cache',
      implementationName: 'IntegerCache Static Array [-128, 127]',
      keyMechanism: {
        en: 'Integer.valueOf(int) reuses pre-allocated cached instances for values between -128 and 127. Comparing Integer a = 100, b = 100 with == evaluates to true, but a = 1000, b = 1000 evaluates to false!',
        vi: 'Integer.valueOf(int) tái sử dụng các đối tượng được khởi tạo sẵn trong dải [-128, 127]. So sánh Integer a = 100, b = 100 bằng dấu == trả về true, nhưng a = 1000, b = 1000 lại trả về false!'
      },
      defaultFlags: '-XX:AutoBoxCacheMax=20000',
      architectureNote: {
        en: 'Never compare boxed Wrappers using ==; always use .equals() to avoid cache-dependent bugs.',
        vi: 'Không bao giờ so sánh Wrapper bằng dấu ==; luôn dùng .equals() để tránh bẫy cache.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Primitives provide predictable microsecond-level CPU register and L1 cache performance with zero Garbage Collection pauses.',
        vi: 'Kiểu nguyên thủy đem lại hiệu năng tính toán cực hạn trên CPU cache L1 với 0 chu kỳ dừng GC.'
      },
      {
        en: 'Pass-by-value semantics eliminate memory corruption, aliasing side-effects, and pointer arithmetic vulnerabilities found in C/C++.',
        vi: 'Ngữ nghĩa Pass-by-value triệt tiêu hoàn toàn lỗi hỏng ô nhớ, tác dụng phụ ngoài ý muốn và lỗ hổng toán tử con trỏ như C/C++.'
      }
    ],
    cons: [
      {
        en: 'Generics prior to Project Valhalla cannot hold raw primitives directly, forcing Autoboxing to Wrappers and incurring 400% memory overhead.',
        vi: 'Generics trước Project Valhalla không hỗ trợ kiểu nguyên thủy, ép buộc Autoboxing lên Wrapper gây lãng phí 400% bộ nhớ RAM.'
      },
      {
        en: 'Passing large mutable objects can still lead to unexpected field mutations because the copied pointer references the shared Heap instance.',
        vi: 'Truyền đối tượng có thể thay đổi (mutable) vẫn gây lỗi sửa đổi dữ liệu ngoài ý muốn vì con trỏ sao chép vẫn trỏ chung vào đối tượng trên Heap.'
      }
    ],
    memoryFootprint: {
      en: 'Primitive int = 4B. Boxed Integer = 16B Heap + 4B Pointer = 20B (5x memory footprint). Use primitive collections (Eclipse Collections / fastutil) in high-scale systems.',
      vi: 'int nguyên thủy = 4B. Boxed Integer = 16B Heap + 4B con trỏ = 20B (tốn gấp 5 lần). Cần dùng thư viện Primitive Collections (fastutil) khi xử lý dữ liệu lớn.'
    },
    jvmSpecificationGuarantee: {
      en: 'JLS §4.2: Java strictly evaluates all method argument expressions and copies their evaluated values into parameter variables before method execution.',
      vi: 'JLS §4.2: Java bắt buộc tính toán giá trị của tất cả tham số và sao chép giá trị đó vào biến của hàm trước khi hàm bắt đầu thực thi.'
    }
  },

  javaCode: `package com.engine.fundamentals;

/**
 * Demonstrates Primitives vs References, Pass-by-Value mechanics,
 * and the dangerous Integer Cache trap.
 */
public class PrimitivesVsReferencesDemo {

    public record User(String name, int age) {}

    public static void main(String[] args) {
        // Step 1: Primitive allocation directly on Stack Frame
        int age = 25;

        // Step 2: Reference allocation - 4B pointer on Stack, 24B on Heap
        User user = new User("Alice", age);

        System.out.printf("Before call: age = %d, user = %s%n", age, user);

        // Step 3: Pass-by-Value execution
        modifyValues(age, user);

        // Observe: Neither primitive nor reference address was modified!
        System.out.printf("After call:  age = %d, user = %s%n", age, user);

        // Trap: Integer Cache [-128, 127]
        demonstrateIntegerCacheTrap();
    }

    private static void modifyValues(int ageVal, User userRef) {
        // Modifying primitive copy does not alter caller stack frame
        ageVal = 99;

        // Reassigning userRef only changes the local pointer copy!
        userRef = new User("Bob (New)", 99);
    }

    private static void demonstrateIntegerCacheTrap() {
        Integer a = 127;
        Integer b = 127;
        System.out.println("127 == 127: " + (a == b)); // true (Cached from IntegerCache)

        Integer x = 128;
        Integer y = 128;
        System.out.println("128 == 128: " + (x == y)); // false! (Different Heap allocations)
        System.out.println("128.equals(128): " + x.equals(y)); // true (Value comparison)
    }
}`,

  jvmFlagsCode: `# HotSpot JVM Options for Primitives & Escape Analysis Optimization
# 1. Enable C2 Escape Analysis to eliminate object allocations on Heap
-XX:+DoEscapeAnalysis
-XX:+EliminateAllocations

# 2. Expand the Integer Cache to eliminate boxing allocations for values up to 20,000
-XX:AutoBoxCacheMax=20000

# 3. Print Escape Analysis diagnostic info (Debug builds)
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintEscapeAnalysis`,

  bytecodeInspection: `// Disassembled bytecode: javap -c PrimitivesVsReferencesDemo
public static void main(java.lang.String[]);
  Code:
     0: bipush        25                  // Push literal 25 onto Operand Stack
     2: istore_1                          // Store int into Stack Slot 1 (age = 25)
     3: new           #7                  // class User (Allocate 24B in Eden TLAB)
     6: dup
     7: ldc           #9                  // String "Alice" from String Pool
     9: iload_1                           // Load int from Slot 1
    10: invokespecial #11                 // Method User."<init>":(Ljava/lang/String;I)V
    13: astore_2                          // Store reference pointer into Stack Slot 2
    14: iload_1                           // Push copy of primitive int
    15: aload_2                           // Push copy of 4-byte reference pointer
    16: invokestatic  #15                 // Method modifyValues:(ILUser;)V (Pass-by-Value)
    19: return`,

  detailedTheory: {
    overview: {
      en: 'Understanding the dichotomy between Primitive Types and Object References is the bedrock of Java engineering. The choice directly governs memory allocation topologies (Stack vs Heap), CPU cache line efficiency, Garbage Collector load, and data mutation semantics across method boundaries.',
      vi: 'Nắm vững ranh giới giữa Kiểu nguyên thủy và Đối tượng tham chiếu là nền móng cốt tử của kỹ sư Java. Quyết định lựa chọn chi phối trực tiếp phân bổ ô nhớ (Stack vs Heap), hiệu quả dòng cache CPU, áp lực lên bộ thu gom rác GC và tính toàn vẹn dữ liệu xuyên suốt các hàm.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Pass-by-Value Invariant in the JVM: Many developers mistakenly believe Java is "pass-by-reference for objects". The JVM specification explicitly mandates that EVERY parameter transfer in Java is Pass-by-Value. When an Object variable is passed into a method, what is passed is NOT the object itself, nor the original pointer variable. Rather, the 32-bit/64-bit numerical bits representing the Heap memory address are copied onto the caller\'s operand stack and popped into the callee\'s local variable table. If the callee reassigns the parameter variable (e.g. param = new Object()), it merely overwrites its own private stack slot, leaving the caller\'s pointer completely untouched.',
        vi: '1. Quy tắc Pass-by-Value bất biến trong JVM: Rất nhiều lập trình viên hiểu lầm rằng Java "truyền tham chiếu cho đối tượng". Đặc tả JVM khẳng định 100% tham số trong Java đều là Pass-by-Value. Khi truyền một biến đối tượng vào hàm, thứ được truyền KHÔNG PHẢI là đối tượng, cũng không phải biến con trỏ ban đầu. Thay vào đó, dãy bit nhị phân 32-bit/64-bit đại diện cho địa chỉ ô nhớ Heap được sao chép vào local variable table của hàm được gọi. Nếu trong hàm bạn gán lại param = new Object(), bạn chỉ đang ghi đè lên slot stack riêng của hàm đó, con trỏ ở hàm gọi ban đầu hoàn toàn nguyên vẹn.'
      },
      {
        en: '2. CPU Cache Thrashing from Wrapper Autoboxing: In enterprise streaming loops (processing millions of events/sec), automatic boxing of primitives into wrapper objects (e.g., int -> Integer) wreaks havoc on CPU caches. Primitive int arrays are tightly packed sequentially in memory, enabling the CPU L1/L2 hardware prefetcher to pull adjacent integers into cache lines before they are requested. Boxed Integer objects add pointer indirections: the CPU must read the pointer array, suffer an address translation delay, and fetch from a random Heap page, triggering Memory Wall stalls and 100x slower throughput.',
        vi: '2. Tràn Cache CPU do Autoboxing tự động: Trong các luồng xử lý dữ liệu lớn (hàng triệu sự kiện/giây), việc tự động đóng gói nguyên thủy thành Wrapper (int -> Integer) tàn phá cache CPU nặng nề. Mảng int nguyên thủy nằm liền mạch trong RAM, cho phép bộ nạp trước phần cứng CPU L1/L2 nạp liên tục vào cache line trước khi lệnh thực thi. Boxed Integer lại tạo ra các bước nhảy con trỏ gián tiếp: CPU phải đọc mảng con trỏ, chịu trễ dịch địa chỉ và nhảy tới ô nhớ ngẫu nhiên trên Heap, gây nghẽn cổ chai bộ nhớ và tụt giảm 100 lần tốc độ.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Conditional Ternary Autounboxing NullPointerException: Writing "Integer count = condition ? getCount() : null; int total = count;" or ternary expressions "boolean condition ? (Integer) null : 0" triggers invisible automatic unboxing (.intValue()), throwing NullPointerException at runtime with no compilation warning.',
        vi: 'Bẫy Auto-unboxing gây NullPointerException trong toán tử 3 ngôi: Biểu thức "Integer count = condition ? getCount() : null; int total = count;" hoặc toán tử 3 ngôi ép kiểu ngầm gây gọi hàm .intValue() trên biến null, ném lỗi NullPointerException lúc runtime mà trình biên dịch không hề cảnh báo.'
      },
      {
        en: 'Comparing Boxed Wrappers with ==: Because IntegerCache caches values between -128 and 127, unit tests with small numbers like 100 == 100 pass, but production environments processing order IDs like 1001 == 1001 fail silently because == compares reference memory addresses instead of values.',
        vi: 'So sánh Wrapper bằng toán tử ==: Do IntegerCache lưu sẵn các số từ -128 đến 127, các bài test với số nhỏ như 100 == 100 luôn chạy đúng, nhưng lên production với các mã đơn hàng như 1001 == 1001 sẽ bị lỗi âm thầm vì == so sánh địa chỉ ô nhớ chứ không so sánh giá trị.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Financial Risk Engine Autoboxing Garbage Storm & CPU L1 Cache Line Thrashing',
      vi: 'Cơn Bão Rác Autoboxing & Hiện Tượng Nghẽn Cache L1 Trong Động Cơ Tính Toán Rủi Ro'
    },
    businessContext: {
      en: 'A tier-1 investment bank quantitative risk engine calculates real-time portfolio Value-at-Risk (VaR) across 50,000 financial instruments updated continuously via market tick feeds.',
      vi: 'Động cơ tính toán rủi ro định lượng của ngân hàng đầu tư tính toán chỉ số Value-at-Risk (VaR) thời gian thực cho 50,000 vị thế tài chính dựa trên luồng dữ liệu biến động thị trường.'
    },
    problemDescription: {
      en: 'The simulation model utilized standard Java collections: Map<Long, List<Double>> to aggregate historical asset price returns. Due to automatic compiler autoboxing (primitive double -> java.lang.Double.valueOf()), a single 10-second simulation cycle instantiated over 25,000,000 temporary wrapper objects. Each boxed Double consumed 24 bytes on the 64-bit Heap (12B object header + 8B double value + 4B padding) plus an 8-byte pointer in the list, requiring 32 bytes per number versus an 8-byte primitive double (a 400% memory blowup). Minor GC pauses struck every 3.5 seconds, causing market calculation latency to miss the 50ms regulatory reporting SLA.',
      vi: 'Mô hình mô phỏng sử dụng cấu trúc Java tiêu chuẩn: Map<Long, List<Double>> để tổng hợp biến động giá tài sản. Do cơ chế tự động Autoboxing của trình biên dịch (double -> java.lang.Double.valueOf()), một chu kỳ tính toán 10 giây đã sinh ra hơn 25,000,000 đối tượng vỏ bọc tạm thời. Mỗi số Double tốn tới 24 byte trên Heap (12B header + 8B giá trị double + 4B padding) cộng thêm 8 byte con trỏ trong danh sách, tốn tổng cộng 32 byte thay vì chỉ 8 byte của kiểu double nguyên thủy (lãng phí 400% RAM). Các đợt dừng dọn rác Minor GC diễn ra mỗi 3.5 giây, khiến độ trễ vượt ngưỡng cam kết 50ms.'
    },
    whyNaiveFails: {
      en: 'Increasing the JVM Young Generation heap size from 4GB to 16GB merely delayed the GC pauses, but when collection finally occurred, the Stop-The-World pause surged from 35ms to 240ms, causing market data dropouts.',
      vi: 'Cách khắc phục tạm bợ bằng cách tăng Heap vùng Young từ 4GB lên 16GB chỉ trì hoãn được thời điểm GC, nhưng khi bộ dọn rác chạy, thời gian dừng toàn hệ thống (Stop-The-World) tăng vọt từ 35ms lên 240ms, làm mất mát dữ liệu thị trường.'
    },
    coreSolution: {
      en: 'Eliminate autoboxing entirely by transitioning to primitive-specialized contiguous memory structures (primitive double[] arrays or high-performance collections such as fastutil Long2DoubleOpenHashMap). Primitive arrays align sequentially in RAM, allowing hardware prefetchers to stream 64-byte chunks directly into CPU L1/L2 caches with zero heap object allocation and zero GC pauses.',
      vi: 'Triệt tiêu hoàn toàn Autoboxing bằng cách chuyển sang các cấu trúc ô nhớ liên tục chuyên dụng cho kiểu nguyên thủy (mảng double[] thuần hoặc thư viện hiệu năng cao fastutil Long2DoubleOpenHashMap). Mảng nguyên thủy nằm liền kề trong RAM, cho phép bộ nạp trước của CPU kéo các khối 64-byte trực tiếp vào L1/L2 cache mà không sinh bất kỳ đối tượng Heap hay rác GC nào.'
    },
    productionCode: `// Production Zero-Allocation Financial Matrix Computation
package com.investment.risk.matrix;

import it.unimi.dsi.fastutil.longs.Long2DoubleOpenHashMap;

public class HighThroughputRiskCalculator {

    // 1. NAIVE ANTI-PATTERN: Heavy Autoboxing Churn (32 Bytes per number + GC overhead)
    // Map<Long, List<Double>> causes 25M heap allocations per run!

    // 2. PRODUCTION ZERO-ALLOCATION PATTERN: Flat Primitive Arrays + FastUtil
    public static class PortfolioRiskModel {
        // FastUtil primitive hash map: zero boxed Long/Double objects!
        private final Long2DoubleOpenHashMap assetWeights;
        // Contiguous 64-bit primitive arrays (fits perfectly into CPU L1/L2 cache lines)
        private final double[] historicalReturns;
        private final int sampleSize;

        public PortfolioRiskModel(int sampleSize) {
            this.sampleSize = sampleSize;
            this.assetWeights = new Long2DoubleOpenHashMap(1024);
            this.historicalReturns = new double[sampleSize];
        }

        public void updateWeight(long assetId, double weight) {
            // Direct primitive put: 0 Heap objects created!
            assetWeights.put(assetId, weight);
        }

        // SIMD-Vectorizable loop: 0ns GC, pure L1 cache throughput
        public double calculatePortfolioVariance() {
            double sum = 0.0;
            // HotSpot C2 automatically unrolls and vectorizes this raw array loop!
            for (int i = 0; i < sampleSize; i++) {
                double val = historicalReturns[i];
                sum += val * val;
            }
            return sum / sampleSize;
        }
    }
}`,
    architectureImpact: {
      en: 'Heap allocation churn plummeted by 97.8% (from 3.8 GB/s to 40 MB/s); Minor GC pause frequency dropped from every 3.5s to once every 45 minutes; Mathematical computation throughput jumped 9.4x (from 45,000 to 420,000 evaluations/s).',
      vi: 'Tỷ lệ sinh rác trên Heap giảm 97.8% (từ 3.8 GB/s xuống 40 MB/s); Tần suất dừng Minor GC giảm từ mỗi 3.5 giây xuống còn 1 lần sau 45 phút; Thông lượng tính toán toán học tăng gấp 9.4 lần (từ 45,000 lên 420,000 phép tính/giây).'
    }
  },

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'Is Java strictly Pass-by-Value or Pass-by-Reference? Provide a definitive code proof.',
        vi: 'Java là ngôn ngữ truyền tham trị (Pass-by-Value) hay truyền tham chiếu (Pass-by-Reference)? Chứng minh bằng code.'
      },
      answer: {
        en: 'Java is STRICTLY Pass-by-Value: there is no exception. When passing an object reference into a method, Java copies the bitwise value of the pointer address, NOT the original reference variable itself. Proof: If inside modify(User u), you reassign u = new User("Bob"), the caller\'s original user variable still points to Alice! If Java were pass-by-reference (like C++ User&), reassigning u would mutate the caller\'s reference variable.',
        vi: 'Java TUYỆT ĐỐI là Pass-by-Value (Truyền giá trị): không có bất kỳ ngoại lệ nào. Khi truyền một đối tượng vào hàm, Java sao chép giá trị của địa chỉ con trỏ, hoàn toàn KHÔNG PHẢI truyền bản thân biến con trỏ ban đầu. Chứng minh: Nếu bên trong hàm modify(User u) bạn gán lại u = new User("Bob"), biến user của hàm gọi bên ngoài vẫn trỏ tới Alice! Nếu Java là pass-by-reference như C++, việc gán lại u sẽ thay đổi luôn biến của hàm gọi bên ngoài.'
      },
      trapWarning: {
        en: 'Candidates often say "primitives are pass-by-value, objects are pass-by-reference". This is 100% false! In Java, references are passed BY VALUE (the address is the value being copied).',
        vi: 'Ứng viên rất hay trả lời nhầm "nguyên thủy là pass-by-value, đối tượng là pass-by-reference". Câu này sai 100%! Trong Java, con trỏ tham chiếu được truyền DƯỚI DẠNG GIÁ TRỊ (địa chỉ ô nhớ chính là giá trị được sao chép).'
      },
      proTip: {
        en: 'Differentiate between mutating the object state (u.setName("Bob") modifies the shared Heap instance) versus reassigning the pointer (u = new User() rebinds only the local stack copy).',
        vi: 'Phân biệt rõ: sửa đổi trạng thái bên trong đối tượng (u.setName("Bob") làm đổi dữ liệu chung trên Heap) khác hoàn toàn với việc gán lại con trỏ (u = new User() chỉ đổi biến cục bộ trên stack).'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'Why does Integer a = 127, b = 127 evaluate to a == b true, while a = 128, b = 128 evaluates to false?',
        vi: 'Tại sao Integer a = 127, b = 127 so sánh a == b trả về true, nhưng a = 128, b = 128 lại trả về false?'
      },
      answer: {
        en: 'Autoboxing (Integer a = 127) calls Integer.valueOf(127) under the hood. HotSpot maintains an internal IntegerCache holding pre-allocated instances for numbers between -128 and 127 (JLS §5.1.7). For 127, both a and b receive identical references to the same pre-allocated Heap object (0xCacheAddr), so == returns true. For 128, Integer.valueOf() instantiates two distinct Heap objects (0xHeapA != 0xHeapB), so reference equality == fails. Always compare object wrappers using .equals()!',
        vi: 'Cơ chế Autoboxing (Integer a = 127) thực chất gọi hàm Integer.valueOf(127) bên dưới. HotSpot duy trì một bộ đệm IntegerCache lưu sẵn các đối tượng từ -128 đến 127. Với số 127, cả a và b cùng trỏ vào duy nhất một đối tượng trong cache, nên toán tử == trả về true. Với số 128 vượt ngoài dải cache, hàm tạo ra 2 đối tượng Heap riêng biệt ở hai địa chỉ khác nhau, nên == trả về false. Luôn so sánh Wrapper bằng .equals()!'
      },
      trapWarning: {
        en: 'Do not forget that the cache upper bound can be tuned via -XX:AutoBoxCacheMax=<size>, meaning the behavior can vary depending on production JVM startup flags!',
        vi: 'Lưu ý trần trên 127 của IntegerCache có thể bị thay đổi qua cờ -XX:AutoBoxCacheMax=<size>, nghĩa là hành vi này có thể khác nhau tùy cấu hình JVM thực tế!'
      },
      proTip: {
        en: 'Mention that Byte, Short, Character, and Long also have static caches [-128, 127], but only Integer\'s upper limit is tunable via JVM options.',
        vi: 'Bổ sung thêm: Byte, Short, Character, Long đều có cache [-128, 127], nhưng chỉ duy nhất Integer cho phép chỉnh giới hạn trên bằng cờ JVM.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'What is Escape Analysis in HotSpot C2, and how does Scalar Replacement eliminate Heap allocations?',
        vi: 'Escape Analysis trong HotSpot C2 là gì và Scalar Replacement giúp loại bỏ cấp phát trên Heap như thế nào?'
      },
      answer: {
        en: 'Escape Analysis (enabled via -XX:+DoEscapeAnalysis) is a C2 JIT optimization that analyzes whether a newly allocated object escapes its creating method or thread. If an object is "NoEscape" (it is never passed outside, returned, or stored in a field), the compiler performs Scalar Replacement: it breaks the object into its individual primitive fields (scalars) and allocates them directly in CPU registers or on the thread stack frame! The Heap object, 16-byte header, and Garbage Collector tracking are completely eliminated.',
        vi: 'Escape Analysis là một tối ưu hóa của trình biên dịch C2 JIT nhằm phân tích xem một đối tượng có bị "thoát" (escape) ra khỏi hàm hoặc luồng tạo ra nó hay không. Nếu đối tượng là "NoEscape" (không bị return ra ngoài, không truyền sang hàm khác, không gán vào biến static), trình biên dịch thực hiện Thay thế vô hướng (Scalar Replacement): đập vỡ đối tượng thành các trường nguyên thủy rời rạc và lưu trực tiếp trên thanh ghi CPU hoặc Stack! Vỏ đối tượng trên Heap, 16 byte header và chi phí dọn rác GC bị triệt tiêu 100%.'
      },
      trapWarning: {
        en: 'Do not claim HotSpot allocates objects directly on the Stack. HotSpot does NOT allocate full objects on the Stack; it performs Scalar Replacement, eliminating the object shell entirely!',
        vi: 'Đừng nói HotSpot cấp phát nguyên cả đối tượng trên Stack. HotSpot KHÔNG cấp phát cả object lên Stack; nó dùng Scalar Replacement để rã object thành các biến nguyên thủy lưu trên thanh ghi hoặc stack slot!'
      },
      proTip: {
        en: 'Give a real-world architecture tip: Writing small, focused methods with local factory objects allows C2 Escape Analysis to eliminate millions of short-lived allocations, keeping Minor GC pauses at near-zero.',
        vi: 'Lời khuyên kiến trúc: Viết các hàm nhỏ gọn, ngắn gọn với các đối tượng cục bộ giúp C2 Escape Analysis tối ưu triệt để, giữ cho thời gian dừng của Minor GC tiệm cận 0ms.'
      }
    }
  ]
};
