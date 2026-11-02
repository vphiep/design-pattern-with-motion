import type { JavaCoreTopic } from '../types';

export const oopPolymorphismVtableTopic: JavaCoreTopic = {
  id: 'oop-polymorphism-vtable',
  category: 'java-fundamentals',
  name: 'OOP Polymorphism, Dynamic Dispatch & vtable',
  tagline: {
    en: 'How the JVM resolves overridden methods at runtime using invokevirtual, Metaspace InstanceKlass vtable/itable slots, and JIT Monomorphic Inline Caching.',
    vi: 'Cách JVM phân giải phương thức đa hình thời gian chạy qua invokevirtual, bảng vtable/itable trong Metaspace và tối ưu JIT Inline Caching.'
  },
  difficulty: 2,
  level: 'advanced',
  order: 11,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'In object-oriented enterprise architectures, code relies heavily on polymorphism—invoking methods on abstract base classes or interfaces (e.g. Payment.process()) where the concrete implementation is determined at runtime. If the JVM had to traverse the class hierarchy or inspect class names with reflection on every single method call, method invocation overhead would render high-throughput Java applications completely unusable.',
      vi: 'Trong kiến trúc hướng đối tượng cấp doanh nghiệp, hệ thống dựa chủ yếu vào tính đa hình—gọi phương thức trên lớp trừu tượng hoặc interface (ví dụ Payment.process()) mà lớp thực thi cụ thể chỉ được quyết định lúc runtime. Nếu JVM phải duyệt qua cây kế thừa hoặc soi tên lớp bằng Reflection trong từng lời gọi hàm, độ trễ sẽ khiến các ứng dụng Java thông lượng cao sụp đổ hoàn toàn.'
    },
    hardwareConstraint: {
      en: 'Modern superscalar CPUs execute instructions speculatively via branch predictors. Indirect branch instructions (such as calling a function through a dynamic memory pointer) cannot be easily predicted by hardware branch target buffers (BTB). A branch misprediction incurs a brutal pipeline flush penalty of 15 to 20 CPU clock cycles.',
      vi: 'CPU siêu phân luồng hiện đại thực thi lệnh suy đoán thông qua bộ dự đoán nhánh (Branch Predictor). Các lệnh rẽ nhánh gián tiếp (gọi hàm thông qua con trỏ bộ nhớ động) rất khó được dự đoán bởi phần cứng Branch Target Buffer (BTB). Một lần đoán sai nhánh (Branch Misprediction) buộc CPU phải xóa sạch đường ống lệnh (pipeline flush), tiêu tốn từ 15 đến 20 chu kỳ xung nhịp CPU.'
    },
    fundamentalSolution: {
      en: 'HotSpot JVM eliminates hierarchy traversal by constructing an immutable Virtual Method Table (vtable) during class loading inside the Metaspace InstanceKlass C++ structure. Subclasses copy the parent vtable and replace the slots for overridden methods at identical integer indices. The invokevirtual bytecode compiles down to an O(1) array index dereference. Furthermore, the C2 JIT Compiler utilizes Monomorphic Inline Caching (MIC) to speculate on single-receiver types, replacing indirect calls with direct assembly jumps!',
      vi: 'HotSpot JVM loại bỏ hoàn toàn việc duyệt cây kế thừa bằng cách khởi tạo một bảng phương thức ảo (vtable - Virtual Method Table) cố định khi nạp lớp vào cấu trúc C++ InstanceKlass trong Metaspace. Lớp con sao chép vtable của cha và ghi đè con trỏ hàm tại đúng chỉ số index tương ứng. Bytecode invokevirtual nhờ đó quy về một phép truy xuất mảng O(1). Hơn thế nữa, C2 JIT Compiler sử dụng Monomorphic Inline Caching (MIC) để chuyển lời gọi gián tiếp thành lệnh nhảy assembly trực tiếp!'
    },
    math: {
      formula: 'Target_Address = *(Receiver_Object->klass_word->vtable[method_slot_index])',
      description: {
        en: 'The compiler fixes method_slot_index in the bytecode constant pool. At runtime, resolving an overridden method requires exactly 2 pointer dereferences regardless of inheritance depth: read Klass pointer from Object Header, then read function pointer at slot index from vtable.',
        vi: 'Trình biên dịch ấn định method_slot_index cố định trong Constant Pool. Khi chạy, việc giải quyết phương thức chỉ tốn đúng 2 bước giải mã con trỏ bất kể cây kế thừa sâu bao nhiêu tầng: đọc con trỏ Klass từ Object Header, sau đó đọc con trỏ hàm tại index trong vtable.'
      },
      timeComplexity: 'O(1) vtable slot index dispatch; 0ns for Monomorphic Inline Cached direct calls',
      spaceComplexity: 'O(M) slots in Metaspace per class, where M is total inherited and declared virtual methods',
      memoryOverheadFormula: 'vtable Size = (vtable_length * 8 Bytes Native 64-bit Pointer) in Metaspace InstanceKlass'
    }
  },

  memoryLayout: {
    title: {
      en: 'Physical Layout: Stack Receiver -> Heap Object Header -> Metaspace InstanceKlass & vtable',
      vi: 'Bố Cục Ô Nhớ Vật Lý: Biến Tham Chiếu -> Object Header -> Metaspace InstanceKlass & Bảng vtable'
    },
    description: {
      en: 'The stack variable holds a pointer to the Heap object. The object header holds a compressed Klass pointer to the InstanceKlass in Metaspace. The InstanceKlass contains the vtable array with native machine code pointers.',
      vi: 'Biến trên Stack lưu địa chỉ tới Object trên Heap. Header của đối tượng chứa con trỏ Klass nén trỏ tới InstanceKlass trong Metaspace. InstanceKlass sở hữu mảng vtable chứa các con trỏ trỏ trực tiếp tới mã máy nhị phân đã biên dịch.'
    },
    asciiDiagram: `
+-----------------------------------------------------------------------------------------+
|  THREAD STACK FRAME: Local Variable [Slot 1: payment] -> 0x00007FFA (Heap Ref)           |
+-----------------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------------+
|  JAVA HEAP: CreditCardPayment Instance @ 0x00007FFA                                     |
|  +---------------------------+-------------------------------------------------------+  |
|  | Mark Word (8 Bytes)       | 0x0000000000000001 (Unlocked, Hash: 0)                |  |
|  +---------------------------+-------------------------------------------------------+  |
|  | Klass Word (4 Bytes)      | 0x000021A0 -> Metaspace InstanceKlass: CreditCard     |  |
|  +---------------------------+-------------------------------------------------------+  |
|  | Field: cardNumber (4B)    | 0x00008810 -> "4111..." String Ref                    |  |
|  +---------------------------+-------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
                                          |
                                          v (Compressed Klass Pointer * 8)
+-----------------------------------------------------------------------------------------+
|  METASPACE (Native C++ Memory): InstanceKlass @ 0x00010D00                              |
|  +-----------------------------------------------------------------------------------+  |
|  | C++ InstanceKlass Header: _layout_helper, _access_flags, _super_klass             |  |
|  | _vtable_len = 6 slots                                                             |  |
|  +-----------------------------------------------------------------------------------+  |
|  | VTABLE ARRAY:                                                                     |  |
|  | Slot 0: Object.hashCode()    -> 0x7FFF0010 (HotSpot Native C++ code)              |  |
|  | Slot 1: Object.equals()      -> 0x7FFF0048 (HotSpot Native C++ code)              |  |
|  | Slot 2: Object.toString()    -> 0x7FFF0090 (HotSpot Native C++ code)              |  |
|  | Slot 3: Payment.validate()   -> 0x7FFF12A0 (Base Payment compiled code)           |  |
|  | Slot 4: Payment.process()    -> 0x7FFF44C0 (OVERRIDDEN: CreditCard.process code!) |  |
|  | Slot 5: CreditCard.charge()  -> 0x7FFF4510 (CreditCard unique method code)        |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'Klass Pointer', size: '4 Bytes (Compressed)', description: { en: '32-bit pointer in object header pointing to InstanceKlass in Metaspace.', vi: 'Con trỏ 32-bit trong object header trỏ tới InstanceKlass trong Metaspace.' } },
      { name: 'vtable offset', size: 'Native Pointer (8B)', description: { en: 'Direct pointer in the vtable array pointing to compiled method entry point.', vi: 'Con trỏ trực tiếp trong mảng vtable trỏ tới điểm vào mã máy của phương thức.' } },
      { name: 'itable (Interface Table)', size: 'Dynamic Array', description: { en: 'Secondary dispatch table for interface methods implemented by the class.', vi: 'Bảng phụ phân giải các phương thức khai báo từ interface.' } },
      { name: 'Inline Cache Stub', size: '8-16 Bytes', description: { en: 'Generated machine code stub verifying receiver klass equality.', vi: 'Đoạn mã máy JIT so sánh địa chỉ Klass của đối tượng nhận với kiểu dự đoán.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Polymorphism is the cornerstone of object-oriented design, but at the hardware level, dynamic dispatch is an expensive indirect jump. HotSpot JVM resolves method calls using two low-level tables in Metaspace (vtable for class inheritance, itable for interfaces) combined with an ultra-sophisticated JIT Inline Caching mechanism (Monomorphic, Bimorphic, and Megamorphic states).',
      vi: 'Đa hình là nền tảng của thiết kế hướng đối tượng, nhưng ở tầng phần cứng, việc phân giải phương thức động (dynamic dispatch) thực chất là một lệnh nhảy gián tiếp tốn kém. HotSpot JVM giải quyết bài toán này bằng hai bảng trong Metaspace (vtable cho kế thừa class, itable cho interface) kết hợp với cơ chế đệm nội tuyến JIT Inline Caching cực kỳ tối tân (gồm các trạng thái Monomorphic, Bimorphic và Megamorphic).'
    },
    deepDiveParagraphs: [
      {
        en: '1. The invokevirtual Bytecode & vtable Slot Invariants: When Java compiles a virtual method call, it emits an invokevirtual instruction with a constant pool symbolic reference. During class linking, the JVM assigns every virtual method a fixed integer offset within the vtable array of its Metaspace InstanceKlass. Crucially, all subclasses inherit identical slot offsets for parent methods. When CreditCard overrides process(), it overwrites slot 4 with its own C++ compiled entry point, enabling O(1) array indexing without name searching.',
        vi: '1. Bytecode invokevirtual & Bất biến chỉ số vtable: Khi Java biên dịch một lời gọi hàm ảo, nó sinh ra mã bytecode invokevirtual. Trong giai đoạn liên kết lớp (linking), JVM gán cho mỗi phương thức ảo một chỉ số nguyên (offset) cố định trong mảng vtable của InstanceKlass. Mọi lớp con đều giữ nguyên vị trí slot của phương thức cha. Khi CreditCard ghi đè hàm process(), nó thay thế con trỏ tại slot 4 bằng con trỏ mã máy riêng của mình, cho phép truy xuất O(1) tức thì mà không cần tìm kiếm tên hàm.'
      },
      {
        en: '2. JIT Inline Caching (Monomorphic vs Megamorphic): Reading the vtable requires multiple memory dereferences (object -> klass -> vtable -> method address -> machine code). To eliminate this, the HotSpot C2 compiler generates an Inline Cache. If a call site always encounters the same concrete class (Monomorphic), C2 completely inlines the method body into the caller, replacing the entire function call with direct native instructions and a tiny pointer comparison guard. If 2 classes appear, it becomes Bimorphic. If >=3 classes appear, the call site becomes Megamorphic: C2 aborts inlining, forcing full indirect vtable/itable pointer dereferences on every invocation.',
        vi: '2. Cơ chế JIT Inline Caching (Monomorphic vs Megamorphic): Việc tra cứu vtable tốn nhiều lần giải tham chiếu bộ nhớ (object -> klass -> vtable -> địa chỉ hàm -> mã máy). Để xóa bỏ chi phí này, HotSpot C2 JIT tạo bộ đệm Inline Cache. Nếu điểm gọi hàm luôn nhận duy nhất 1 lớp cụ thể (Monomorphic), C2 sẽ nhúng thẳng toàn bộ mã hàm (inlining) vào nơi gọi mà không tốn chi phí gọi hàm nào. Nếu có 2 lớp, nó chuyển sang Bimorphic. Nếu có từ 3 lớp trở lên, điểm gọi bị ô nhiễm thành Megamorphic: C2 hủy bỏ inlining và buộc CPU phải thực hiện nhảy gián tiếp qua vtable/itable ở mọi vòng lặp.'
      },
      {
        en: '3. itable Overhead vs vtable: Because a class can implement dozens of interfaces in arbitrary order, the JVM cannot assign fixed global slot offsets for interface methods. Instead, HotSpot constructs an itable containing a table of implemented interfaces pointing to method tables. Resolving invokeinterface requires searching the interface list at runtime unless JIT Inline Caching successfully monomorphizes the call site.',
        vi: '3. Chi phí itable so với vtable: Do một class có thể cài đặt nhiều interface theo thứ tự tùy ý, JVM không thể gán chỉ số slot cố định cho phương thức interface như vtable. HotSpot phải xây dựng bảng itable chứa danh sách các interface trỏ đến bảng hàm tương ứng. Lệnh invokeinterface phải quét qua danh sách interface này lúc chạy trừ khi JIT Inline Cache tối ưu hóa thành công điểm gọi thành Monomorphic.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Poluting critical high-throughput loop call sites into Megamorphic status by feeding 3 or more disparate implementations of an interface into a single batch loop, causing HotSpot C2 to abandon method inlining and triggering 3x-8x CPU instruction throughput degradation.',
        vi: 'Làm ô nhiễm các vòng lặp xử lý dữ liệu tải cao thành trạng thái Megamorphic bằng cách truyền từ 3 triển khai interface khác nhau trở lên vào cùng một điểm gọi, khiến JIT C2 từ bỏ tối ưu inlining và làm giảm hiệu năng CPU từ 3x đến 8x.'
      },
      {
        en: 'Excessive use of dynamic reflection (Method.invoke) or heavy dynamic CGLIB proxies on hot execution paths, completely bypassing vtable optimizations and disabling JIT escape analysis and loop unrolling.',
        vi: 'Lạm dụng Reflection (Method.invoke) hoặc CGLIB dynamic proxy trên các đường dẫn thực thi nóng (hot path), làm mất hoàn toàn khả năng tối ưu vtable và vô hiệu hóa cơ chế phân tích thoát (Escape Analysis) của JIT.'
      },
      {
        en: 'Neglecting the cost of invokeinterface in ultra-low-latency processing loops. When calling methods through deep interface inheritance graphs where types vary frequently, cache misses on itables can stall CPU execution pipelines.',
        vi: 'Không để ý chi phí của lệnh invokeinterface trong các hệ thống yêu cầu độ trễ micro-giây. Khi gọi hàm qua cây kế thừa interface sâu và kiểu đối tượng thay đổi liên tục, hiện tượng trượt cache (cache miss) trên itable sẽ làm nghẽn đường ống lệnh CPU.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'High-Frequency Trading Matching Engine Degradation via Megamorphic Call Site Pollution',
      vi: 'Sụt Giảm Hiệu Năng Khớp Lệnh Giao Dịch Tần Suất Cao (HFT) Do Ô Nhiễm Điểm Gọi Megamorphic'
    },
    businessContext: {
      en: 'A high-frequency trading (HFT) crypto and equity order matching engine processes 800,000 limit and market orders per second with a strict P99 latency requirement of under 5 microseconds.',
      vi: 'Hệ thống khớp lệnh giao dịch tài chính tần suất cao (HFT) xử lý 800,000 lệnh mỗi giây với cam kết nghiêm ngặt độ trễ P99 phải dưới 5 micro-giây (µs).'
    },
    problemDescription: {
      en: 'A core refactoring introduced an OrderAction polymorphic interface implemented by 5 subclasses: LimitOrder, MarketOrder, CancelOrder, StopOrder, and IcebergOrder. All incoming orders were routed through a single master event loop calling orderAction.execute(). Immediately upon deployment, the engine P99 latency degraded from 4.1µs to 28.5µs (7x slowdown), and CPU utilization spiked from 42% to 94%. JIT profiling with -XX:+PrintInlining showed that orderAction.execute() had turned megamorphic, forcing C2 to deoptimize and emit slow indirect CALL [RAX + RCX*8] assembly instructions with branch target buffer (BTB) misses on every cycle.',
      vi: 'Một đợt tái cấu trúc mã nguồn đã đưa vào Interface đa hình OrderAction với 5 lớp con: LimitOrder, MarketOrder, CancelOrder, StopOrder và IcebergOrder. Tất cả lệnh đến đều được duyệt qua một vòng lặp sự kiện duy nhất gọi orderAction.execute(). Ngay sau khi triển khai, độ trễ P99 tăng vọt từ 4.1µs lên 28.5µs (chậm gấp 7 lần), CPU nhảy từ 42% lên 94%. Phân tích JIT với cờ -XX:+PrintInlining cho thấy điểm gọi orderAction.execute() đã biến thành Megamorphic, khiến C2 hủy bỏ inlining và buộc CPU phải thực hiện lệnh gọi gián tiếp CALL [RAX + RCX*8] gây trượt dự đoán rẽ nhánh liên tục.'
    },
    whyNaiveFails: {
      en: 'Overclocking CPU instances or adding more execution threads worsened latency because the root cause was instruction cache thrashing and CPU pipeline branch stalls within the hot loop core.',
      vi: 'Việc nâng cấp CPU xung nhịp cao hơn hoặc tăng thêm số luồng chỉ làm tình trạng tồi tệ hơn vì nguyên nhân gốc rễ là hiện tượng trượt cache lệnh (instruction cache thrashing) và gián đoạn đường ống lệnh CPU ngay trong lõi vòng lặp.'
    },
    coreSolution: {
      en: 'Segregate order dispatching into dedicated monomorphic queues per concrete order type, or utilize a Java 21 exhaustive sealed type pattern matching switch. This guarantees that HotSpot JIT C2 encounters only a single concrete receiver type per dispatch site, restoring 100% monomorphic inlining directly into CPU L1 Instruction Cache.',
      vi: 'Phân tách luồng xử lý thành các hàng đợi đơn hình (monomorphic queue) riêng biệt cho từng loại lệnh, hoặc sử dụng switch Pattern Matching của Java 21 trên Sealed Type. Điều này đảm bảo HotSpot JIT C2 chỉ gặp duy nhất một kiểu đối tượng cụ thể tại mỗi điểm gọi, khôi phục 100% khả năng inlining trực tiếp mã máy vào bộ đệm L1 Instruction Cache.'
    },
    productionCode: `// Production HFT Matching Loop: Restoring Monomorphic JIT Inlining
package com.hft.engine.matching;

import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;

// 1. Sealed Hierarchy ensures finite, known implementations
public sealed interface OrderAction permits LimitOrder, MarketOrder, CancelOrder {
    long execute(long currentBookPrice);
}

public final record LimitOrder(long orderId, long price, int quantity) implements OrderAction {
    @Override
    public long execute(long currentBookPrice) {
        return price <= currentBookPrice ? quantity : 0;
    }
}

public final record MarketOrder(long orderId, int quantity) implements OrderAction {
    @Override
    public long execute(long currentBookPrice) {
        return quantity; // Instant fill
    }
}

public final record CancelOrder(long orderId) implements OrderAction {
    @Override
    public long execute(long currentBookPrice) {
        return 0; // Release reservation
    }
}

// 2. High-Performance Monomorphic Dispatcher
public class MonomorphicOrderProcessor {
    // Segregated queues maintain Monomorphic call sites for C2 JIT
    private final Queue<LimitOrder> limitQueue = new ArrayBlockingQueue<>(131072);
    private final Queue<MarketOrder> marketQueue = new ArrayBlockingQueue<>(131072);

    // C2 JIT compiles this with MONOMORPHIC INLINING: zero vtable dispatch overhead!
    public void drainLimitOrders(long currentBookPrice) {
        LimitOrder order;
        while ((order = limitQueue.poll()) != null) {
            // Direct native inlining: compiles into a single CPU CMP & MOV instruction
            order.execute(currentBookPrice);
        }
    }

    public void drainMarketOrders(long currentBookPrice) {
        MarketOrder order;
        while ((order = marketQueue.poll()) != null) {
            // Monomorphic inlining preserved
            order.execute(currentBookPrice);
        }
    }
}`,
    architectureImpact: {
      en: 'P99 execution latency dropped from 28.5µs down to 3.8µs (86% latency reduction); CPU branch prediction miss rate dropped from 14.8% to 0.02%; Throughput surged to 890,000 orders/second with zero JIT deoptimizations.',
      vi: 'Độ trễ thực thi P99 giảm từ 28.5µs xuống 3.8µs (giảm 86%); tỷ lệ trượt dự đoán rẽ nhánh của CPU giảm từ 14.8% xuống 0.02%; Thông lượng tăng vọt lên 890,000 lệnh/giây mà không hề phát sinh một lần JIT deoptimization nào.'
    }
  },

  steps: [
    {
      id: 'vtable-build',
      title: { en: '1. Class Loading & vtable Layout Construction', vi: '1. Nạp Lớp & Khởi Tạo Bảng vtable trong Metaspace' },
      phase: 'VTABLE_GENERATION',
      description: {
        en: 'When the JVM loads Payment and CreditCardPayment, it computes their vtables in Metaspace. CreditCardPayment inherits slots 0-3 from Object and Payment, but overwrites slot 4 (process) with its own native method address.',
        vi: 'Khi JVM nạp hai lớp Payment và CreditCardPayment, nó tạo bảng vtable trong Metaspace. CreditCardPayment kế thừa slot 0-3 từ Object và Payment, nhưng ghi đè slot 4 (process) bằng địa chỉ con trỏ hàm riêng của chính nó.'
      },
      jvmRuntimeBehavior: {
        en: 'InstanceKlass::link_class() calculates the exact vtable layout and binds symbol references to integer slot offsets.',
        vi: 'Hàm C++ InstanceKlass::link_class() tính toán chính xác kích thước vtable và ánh xạ tên hàm thành chỉ số slot số nguyên.'
      },
      javaCodeLineMatch: 'Payment payment = new CreditCardPayment("4111...");'
    },
    {
      id: 'dynamic-dispatch',
      title: { en: '2. invokevirtual Dynamic Dispatch Execution', vi: '2. Thực Thi Phân Giải Động Qua Bytecode invokevirtual' },
      phase: 'DYNAMIC_DISPATCH',
      description: {
        en: 'The execution engine reaches payment.process(). The bytecode instruction is invokevirtual #4. It reads the receiver object at 0x00007FFA, extracts its Klass Word, reads vtable slot 4, and branches to CreditCardPayment.process() in 0.8ns.',
        vi: 'Bộ máy thực thi gặp lệnh payment.process(). Bytecode tương ứng là invokevirtual #4. Nó đọc đối tượng nhận tại 0x00007FFA, trích xuất Klass Word, đọc slot 4 trong vtable và nhảy tới mã CreditCardPayment.process() chỉ trong 0.8ns.'
      },
      jvmRuntimeBehavior: {
        en: 'Two pointer dereferences: receiver -> klass -> vtable[4]. O(1) time complexity with zero string comparison.',
        vi: 'Đúng 2 bước truy xuất con trỏ: receiver -> klass -> vtable[4]. Độ phức tạp O(1) không tốn một phép so sánh chuỗi nào.'
      },
      javaCodeLineMatch: 'payment.process(amount);'
    },
    {
      id: 'monomorphic-inline-cache',
      title: { en: '3. C2 JIT Monomorphic Inline Caching (MIC)', vi: '3. Tối Ưu Hóa C2 JIT Bằng Monomorphic Inline Caching' },
      phase: 'INLINE_CACHING',
      description: {
        en: 'If 99% of calls at this call site pass CreditCardPayment, C2 JIT rewrites the call site into an inline check: cmp receiver.klass, CreditCardPayment.class; je direct_inlined_code. Indirect dispatch is eliminated entirely!',
        vi: 'Nếu 99% các lần gọi hàm tại vị trí này đều truyền vào CreditCardPayment, C2 JIT sẽ viết lại vị trí gọi thành lệnh so sánh trực tiếp: cmp receiver.klass, CreditCardPayment.class; je direct_inlined_code. Lời gọi gián tiếp bị loại bỏ hoàn toàn!'
      },
      jvmRuntimeBehavior: {
        en: 'Monomorphic Inline Cache converts indirect call into a single direct compare-and-jump instruction, enabling subsequent compiler loop unrolling and escape analysis.',
        vi: 'Monomorphic Inline Cache biến lệnh gọi gián tiếp thành 1 lệnh cmp và nhảy trực tiếp, mở đường cho JIT inline toàn bộ code phương thức.'
      },
      javaCodeLineMatch: '// JIT Inlined Direct Machine Code'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Oracle HotSpot C2 JIT',
      implementationName: 'Tiered Compilation & Monomorphic Inline Caching (MIC)',
      keyMechanism: {
        en: 'C2 compiler profiles bytecode execution frequencies. When an invokevirtual call site is monomorphic (only 1 receiver type observed), it replaces the vtable pointer lookup with an inline klass equality check and direct assembly inlining.',
        vi: 'Trình biên dịch C2 ghi nhận tần suất thực thi bytecode. Khi một điểm gọi invokevirtual là monomorphic (chỉ ghi nhận 1 loại đối tượng), nó thay thế bước tra cứu vtable bằng lệnh kiểm tra klass và inline mã máy trực tiếp.'
      },
      defaultFlags: '-XX:+TieredCompilation -XX:+PrintInlining -XX:MaxInlineLevel=9',
      architectureNote: {
        en: 'If a second receiver type is observed, it promotes to Bimorphic Inline Cache (2 checks). At 3+ types, it falls back to Megamorphic vtable stub lookup.',
        vi: 'Nếu xuất hiện loại đối tượng thứ 2, nó nâng cấp lên Bimorphic (2 phép kiểm tra). Từ 3 loại trở lên, nó hạ cấp về Megamorphic tra cứu qua vtable stub.'
      }
    },
    {
      jvmEngine: 'GraalVM Native Image',
      implementationName: 'SubstrateVM Static Analysis & Closed-World Devirtualization',
      keyMechanism: {
        en: 'During Ahead-Of-Time (AOT) compilation, points-to analysis identifies classes with only one single reachable implementation, devirtualizing dynamic calls into direct static machine calls at build time.',
        vi: 'Trong quá trình biên dịch AOT, phân tích points-to xác định các class chỉ có 1 hiện thực duy nhất trong toàn hệ thống, devirtualize lệnh gọi động thành lệnh gọi tĩnh trực tiếp ngay lúc build.'
      },
      defaultFlags: '-H:+ReportExceptionStackTraces -H:+PrintAnalysisCallTree',
      architectureNote: {
        en: 'Completely eliminates vtable pointer dereferencing and Metaspace memory allocations for devirtualized method call sites in native binaries.',
        vi: 'Loại bỏ hoàn toàn con trỏ vtable và vùng nhớ Metaspace cho các điểm gọi hàm đã được devirtualize trong binary native.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'vtable reduces dynamic method dispatch to a constant O(1) dual pointer dereference regardless of inheritance depth.',
        vi: 'vtable rút gọn phép phân giải phương thức động về 2 lần giải mã con trỏ O(1) bất biến bất kể độ sâu kế thừa.'
      },
      {
        en: 'Monomorphic Inline Caching enables JIT compilers to perform aggressive dead-code elimination, escape analysis, and loop unrolling.',
        vi: 'Monomorphic Inline Caching cho phép trình biên dịch JIT xóa mã thừa, phân tích thoát (Escape Analysis) và mở vòng lặp.'
      }
    ],
    cons: [
      {
        en: 'Megamorphic call sites (3+ receiver types passing through the same call site) deoptimize and incur CPU branch misprediction stalls (~15 cycles).',
        vi: 'Các vị trí gọi Megamorphic (từ 3 loại đối tượng truyền qua cùng 1 điểm) bị mất tối ưu và gây nghẽn ống lệnh CPU (~15 chu kỳ).'
      },
      {
        en: 'Deep inheritance hierarchies generate duplicated vtable slot arrays across every subclass in Metaspace native memory.',
        vi: 'Cây kế thừa quá sâu làm phình to các mảng con trỏ vtable nhân bản trên từng lớp con trong bộ nhớ native Metaspace.'
      }
    ],
    memoryFootprint: {
      en: 'vtable memory = 8 bytes * total virtual methods per class stored in Metaspace. Interface tables (itable) add secondary offset arrays.',
      vi: 'Dung lượng vtable = 8 byte * tổng số phương thức ảo mỗi class lưu trong Metaspace. Bảng interface itable bổ sung thêm mảng offset phụ.'
    },
    jvmSpecificationGuarantee: {
      en: 'JVM Specification §5.4.6: Dynamic method selection resolves to the first matching method declared in the runtime class of the target object.',
      vi: 'Đặc tả JVM §5.4.6: Phân giải phương thức động bắt buộc tìm phương thức phù hợp đầu tiên trong lớp runtime thực tế của đối tượng nhận.'
    }
  },

  javaCode: `package com.engine.fundamentals;

// Base class defining virtual contract
abstract class Payment {
    public void validate() {
        // vtable slot 3
        System.out.println("Validating payment currency & fraud score...");
    }

    // Abstract method: occupies slot 4 in vtable
    public abstract void process(long amountCents);
}

// Subclass providing concrete implementation
class CreditCardPayment extends Payment {
    private final String cardNumber;

    public CreditCardPayment(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    @Override
    public void process(long amountCents) {
        // Overrides slot 4 in CreditCardPayment InstanceKlass vtable!
        System.out.println("Charging $" + (amountCents / 100.0) + " via Card: " + cardNumber);
    }
}

class CryptoPayment extends Payment {
    private final String walletAddress;

    public CryptoPayment(String walletAddress) {
        this.walletAddress = walletAddress;
    }

    @Override
    public void process(long amountCents) {
        // Overrides slot 4 in CryptoPayment InstanceKlass vtable!
        System.out.println("Transferring Satoshis to wallet: " + walletAddress);
    }
}

public class PolymorphismEngine {
    public static void executePayment(Payment payment, long amount) {
        // Bytecode:
        // 0: aload_0
        // 1: lload_1
        // 2: invokevirtual #7 // Method Payment.process:(J)V
        // 5: return
        payment.process(amount);
    }

    public static void main(String[] args) {
        Payment p1 = new CreditCardPayment("4111-2222-3333-4444");
        Payment p2 = new CryptoPayment("0x71C...B29");

        // Monomorphic invocation loop: JIT profile identifies single receiver type
        for (int i = 0; i < 20_000; i++) {
            executePayment(p1, 5000); // C2 JIT inlines CreditCardPayment.process directly!
        }

        // Megamorphic poll: passes multiple distinct implementations
        executePayment(p2, 12000); // Fallback to vtable indirect lookup
    }
}`,

  jvmFlagsCode: `# HotSpot JVM Options for Dynamic Dispatch & Inlining Diagnostics
# 1. Print detailed inlining decision tree from C2 JIT Compiler
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintInlining

# 2. Maximum inlining depth for call trees
-XX:MaxInlineLevel=9

# 3. Maximum method bytecode size eligible for inlining
-XX:MaxInlineSize=35

# 4. Number of receiver types recorded before falling back to Megamorphic
-XX:TypeProfileWidth=2`,

  bytecodeInspection: `// Disassembly of method executePayment(LPayment;J)V
// Flags: ACC_PUBLIC, ACC_STATIC
Code:
  stack=3, locals=3, args_size=2
     0: aload_0          // Push 'payment' reference onto operand stack
     1: lload_1          // Push 'amount' 64-bit long primitive onto operand stack
     2: invokevirtual #7 // Method Payment.process:(J)V
                         // HotSpot Constant Pool #7:
                         // Class: com/engine/fundamentals/Payment
                         // NameAndType: process:(J)V
                         // Resolved at link time to vtable slot index: 4
     5: return

// C2 JIT Compiled Machine Code Snippet (x86-64 assembly with Inline Cache):
//   mov    0x8(%rdi),%r10d        ; Load 32-bit compressed Klass from receiver header
//   cmp    $0x21a0,%r10d          ; Compare Klass with CreditCardPayment.class (Inline Cache)
//   jne    0x7fff4020             ; If not equal, jump to itable/vtable slow stub
//   ; INLINED BODY OF CreditCardPayment.process() DIRECTLY HERE!`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What is Dynamic Method Dispatch and how does it relate to runtime polymorphism in Java?',
        vi: 'Phân giải phương thức động (Dynamic Method Dispatch) là gì và liên hệ như thế nào với tính đa hình trong Java?'
      },
      answer: {
        en: 'Dynamic Method Dispatch is the mechanism by which a call to an overridden method is resolved at RUNTIME rather than compile time. When a superclass reference points to a subclass object (Payment p = new CreditCardPayment()), calling p.process() invokes CreditCardPayment\'s version. The compiler emits invokevirtual, and the JVM resolves the concrete implementation at runtime by inspecting the actual object\'s Klass.',
        vi: 'Phân giải phương thức động là cơ chế mà lời gọi tới một phương thức bị ghi đè (overridden) được giải quyết lúc RUNTIME (khi chạy) thay vì lúc biên dịch. Khi con trỏ lớp cha trỏ tới đối tượng lớp con (Payment p = new CreditCardPayment()), gọi p.process() sẽ thực thi code của CreditCardPayment. Trình biên dịch sinh lệnh invokevirtual và JVM tìm lớp thực tế của đối tượng lúc chạy để thực thi.'
      },
      trapWarning: {
        en: 'Method OVERLOADING is static dispatch (resolved at compile time by argument types), whereas method OVERRIDING is dynamic dispatch (resolved at runtime by receiver instance type).',
        vi: 'Nạp chồng hàm (OVERLOADING) là phân giải tĩnh (chốt lúc compile time theo kiểu tham số), trong khi Ghi đè hàm (OVERRIDING) là phân giải động (chốt lúc runtime theo đối tượng thực tế).'
      },
      proTip: {
        en: 'Mention that private, static, and final methods are NOT dynamically dispatched. The compiler emits invokestatic or invokespecial because they cannot be overridden.',
        vi: 'Nhắc đến việc các phương thức private, static và final KHÔNG phân giải động. Compiler phát sinh thẳng lệnh invokestatic hoặc invokespecial vì chúng không thể bị ghi đè.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'How does the HotSpot JVM vtable work under the hood in Metaspace?',
        vi: 'Bảng vtable trong Metaspace của HotSpot JVM hoạt động tầng sâu như thế nào?'
      },
      answer: {
        en: 'During class loading and linking, HotSpot constructs an array of function pointers called the Virtual Method Table (vtable) inside the C++ InstanceKlass struct in Metaspace. Subclasses copy the parent vtable and replace the slots for overridden methods at identical integer indices. When invokevirtual executes, resolving the method does NOT require traversing the class hierarchy: it performs an O(1) array lookup: receiver->klass->vtable[slot_index]().',
        vi: 'Khi nạp và liên kết lớp, HotSpot tạo một mảng con trỏ hàm gọi là Virtual Method Table (vtable) bên trong cấu trúc C++ InstanceKlass tại Metaspace. Lớp con sao chép vtable của cha và ghi đè con trỏ hàm tại đúng chỉ số index tương ứng. Khi invokevirtual chạy, nó KHÔNG cần duyệt cây kế thừa: chỉ tốn 1 phép truy xuất mảng O(1): receiver->klass->vtable[slot_index]().'
      },
      trapWarning: {
        en: 'Interface methods use an itable (Interface Table), not a vtable, because classes can implement multiple interfaces whose method indices may conflict.',
        vi: 'Phương thức interface dùng bảng itable chứ không dùng vtable, vì một lớp có thể thực thi nhiều interface có chỉ số phương thức trùng nhau.'
      },
      proTip: {
        en: 'vtable eliminates reflection overhead: method resolution takes ~0.8ns via dual pointer dereferencing.',
        vi: 'vtable loại bỏ hoàn toàn chi phí Reflection: phân giải hàm chỉ tốn 0.8ns qua 2 lần giải mã con trỏ.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'What is Monomorphic Inline Caching (MIC) in C2 JIT, and why do megamorphic call sites degrade throughput?',
        vi: 'Monomorphic Inline Caching (MIC) trong C2 JIT là gì và tại sao điểm gọi megamorphic làm giảm hiệu năng?'
      },
      answer: {
        en: 'When C2 JIT profiles an invokevirtual call site and observes only ONE receiver type (Monomorphic), it bypasses the vtable lookup entirely! It replaces the indirect call with an inline type comparison: cmp receiver.klass, Expected.class; je direct_inlined_code. This reduces dispatch overhead to 0ns and enables loop unrolling. However, if 3+ distinct receiver types pass through the same call site (Megamorphic), JIT deoptimizes and falls back to a slow vtable stub lookup, triggering CPU branch misprediction stalls (~15-20 cycles).',
        vi: 'Khi C2 JIT theo dõi một điểm gọi invokevirtual và thấy chỉ có DUY NHẤT 1 kiểu đối tượng truyền qua (Monomorphic), nó bỏ qua hoàn toàn bảng vtable! Nó thay lệnh gọi gián tiếp bằng lệnh so sánh kiểu: cmp receiver.klass, Expected.class; je direct_inlined_code. Việc này triệt tiêu overhead về 0ns và cho phép inline toàn bộ mã hàm. Tuy nhiên, nếu có từ 3 kiểu đối tượng trở lên (Megamorphic), JIT buộc phải hạ cấp về tra cứu qua vtable stub chậm chạp, gây nghẽn ống lệnh CPU (~15-20 chu kỳ).'
      },
      trapWarning: {
        en: 'Writing giant loops that pass 5 different payment implementations through a single process() method call kills JIT inlining. Batch requests by type or use switch patterns on sealed classes.',
        vi: 'Viết vòng lặp truyền 5 kiểu con khác nhau qua cùng 1 lời gọi hàm sẽ triệt tiêu tối ưu của JIT. Hãy gom nhóm request theo kiểu hoặc dùng switch pattern trên sealed class.'
      },
      proTip: {
        en: 'Use JVM flag -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining to verify whether your critical hot paths are monomorphically inlined by C2.',
        vi: 'Dùng cờ -XX:+PrintInlining để kiểm tra xem các hàm quan trọng của hệ thống có được C2 inline đơn hình thành công hay không.'
      }
    }
  ]
};
