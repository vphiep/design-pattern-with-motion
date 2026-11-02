import type { JavaCoreTopic } from '../types';

export const oopFoundationsSolidTopic: JavaCoreTopic = {
  id: 'oop-foundations-solid',
  category: 'java-fundamentals',
  name: 'OOP 4 Pillars, Abstract Classes & Interfaces',
  tagline: {
    en: 'Core OOP mechanics: Encapsulation, Abstraction, Inheritance, Polymorphism, Abstract Classes vs Interfaces (default/private methods), and Diamond Problem resolution.',
    vi: 'Cốt lõi hướng đối tượng: 4 trụ cột OOP, Lớp trừu tượng vs Interface (hàm default/private) và quy tắc giải quyết xung đột đa kế thừa Diamond Problem.'
  },
  difficulty: 1,
  level: 'basic',
  order: 3,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      en: 'Large enterprise codebases suffer from severe coupling and fragile code when changes in one business module break unrelated components. Conflating code reuse with subtype polymorphism leads to deep, brittle inheritance hierarchies ("Gorilla holding a banana" problem), while misuse of abstract classes versus interfaces prevents flexible system evolution.',
      vi: 'Các hệ thống phần mềm doanh nghiệp dễ bị gắn kết chặt (tight coupling) và dễ đổ vỡ khi thay đổi ở một module lại làm hỏng các module không liên quan. Việc lạm dụng kế thừa thay vì ghép nối (Composition) dẫn đến các cây phân cấp cứng nhắc, trong khi việc nhầm lẫn giữa Lớp trừu tượng và Interface cản trở khả năng mở rộng hệ thống.'
    },
    hardwareConstraint: {
      en: 'Modern CPU instruction caches (L1 Instruction Cache) favor small, modular, cohesive methods that fit entirely within 32KB/64KB cache lines. Deep inheritance hierarchies bloat object instance field sizes and scatter method calls across indirect dispatch tables, degrading CPU instruction pipeline throughput.',
      vi: 'Bộ đệm lệnh CPU (L1 Instruction Cache) hoạt động tối ưu nhất với các hàm nhỏ, có tính gắn kết cao nằm gọn trong các dòng cache 32KB/64KB. Cây kế thừa quá sâu làm phình to kích thước đối tượng và phân tán các lệnh gọi hàm, làm giảm hiệu năng đường ống lệnh CPU.'
    },
    fundamentalSolution: {
      en: 'Java enforces the 4 OOP pillars with distinct language boundaries: 1. Encapsulation via access modifiers and immutability. 2. Abstraction via abstract classes and interfaces. 3. Inheritance for code reuse and subtyping. 4. Polymorphism for dynamic behavior substitution. Java 8+ added default/static methods to interfaces and Java 9 added private methods, resolving the Diamond Problem with strict compiler precedence rules (Classes win over Interfaces; Sub-interfaces win over Super-interfaces).',
      vi: 'Java hiện thực 4 trụ cột OOP qua các ranh giới rõ ràng: 1. Đóng gói (Encapsulation) qua phạm vi truy cập và tính bất biến. 2. Trừu tượng (Abstraction) qua Abstract Class và Interface. 3. Kế thừa (Inheritance). 4. Đa hình (Polymorphism). Từ Java 8+, Interface hỗ trợ phương thức default/static và Java 9 bổ sung private method, xử lý triệt để bài toán Diamond Problem bằng quy tắc ưu tiên rõ ràng (Lớp luôn thắng Interface; Interface con thắng Interface cha).'
    },
    math: {
      formula: 'Interface_Method_Resolution = Class_Win_Rule > Sub_Interface_Rule > Explicit_Super_Override (A.super.m())',
      description: {
        en: 'If class C implements interfaces A and B that both define default void m(), the compiler forces C to explicitly override m() or disambiguate using A.super.m(). If a class extends SuperClass S that implements void m(), S always wins over interface defaults.',
        vi: 'Nếu lớp C thực thi cả A và B cùng có hàm default void m(), trình biên dịch ép C phải ghi đè hoặc chỉ định rõ A.super.m(). Nếu lớp cha đã có cài đặt hàm, cài đặt của lớp cha luôn được ưu tiên tuyệt đối so với interface.'
      },
      timeComplexity: 'O(1) static type checking at compile-time; O(1) vtable/itable dispatch at runtime',
      spaceComplexity: 'Zero state in Interfaces (no instance fields); Abstract classes store shared instance state in Heap object layout',
      memoryOverheadFormula: 'Interface Implementation Overhead = itable pointer array entry in Metaspace InstanceKlass'
    }
  },

  memoryLayout: {
    title: {
      en: 'Memory Layout: Abstract Class Instance State vs Stateless Interface Contract',
      vi: 'Bố Cục Ô Nhớ: Trạng Thái Lớp Trừu Tượng vs Khế Ước Không Trạng Thái Của Interface'
    },
    description: {
      en: 'Abstract classes allocate field storage within the Heap object instance alongside subclass fields. Interfaces hold zero instance state; their default methods are compiled into static-like methods executed via itable lookup.',
      vi: 'Lớp trừu tượng cấp phát các biến instance trực tiếp vào đối tượng trên Heap cùng với các trường của lớp con. Interface không chứa trạng thái instance; các default method được lưu mã thực thi trong Metaspace và gọi qua bảng itable.'
    },
    asciiDiagram: `
+-----------------------------------------------------------------------------------------+
|  ABSTRACT CLASS: BaseOrder (Holds state)                                                |
|  Fields: protected long id (8B), protected Instant createdAt (4B ref)                   |
+-----------------------------------------------------------------------------------------+
                                          |
                                          +-------------------------+
                                          |                         |
                                          v                         v
+---------------------------------------------------+  +----------------------------------+
|  HEAP OBJECT INSTANCE: ExpressOrder (24B + 16B)   |  |  INTERFACE: Auditable, Payable   |
|  - Mark Word (8B)                                 |  |  - No instance state!            |
|  - Klass Pointer (4B -> Metaspace)                |  |  - Default methods in Metaspace  |
|  - id (8B inherited from BaseOrder)               |  |  - Polymorphic contract only     |
|  - createdAt (4B ref from BaseOrder)              |  |  - itable slot points to code    |
|  - trackingCode (4B ref unique to ExpressOrder)   |  +----------------------------------+
|  - Padding (4B alignment)                         |
+---------------------------------------------------+`,
    byteFields: [
      { name: 'Inherited Fields', size: 'Varies', description: { en: 'Fields declared in abstract superclass allocated directly in Heap instance.', vi: 'Các biến từ lớp cha trừu tượng được lưu trực tiếp vào ô nhớ Heap của đối tượng con.' } },
      { name: 'itable Slot', size: '8 Bytes', description: { en: 'Method pointer in Metaspace for interface method resolution.', vi: 'Con trỏ hàm trong Metaspace để phân giải phương thức interface.' } },
      { name: 'Default Method Code', size: 'Code Segment', description: { en: 'Compiled bytecode stored in Metaspace class metadata.', vi: 'Bytecode của phương thức default lưu trong metadata lớp tại Metaspace.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Object-Oriented Programming in modern enterprise Java has evolved far beyond textbook definitions of shapes and animals. The architectural challenge centers on managing system complexity, enforcing encapsulation invariants, and favoring composition over deep inheritance hierarchies while leveraging modern language features (Java 8 interface defaults, Java 9 private interface methods, and Java 17 sealed types).',
      vi: 'Lập trình hướng đối tượng trong kiến trúc Java doanh nghiệp hiện đại đã vượt xa các ví dụ kinh điển về hình học hay động vật. Thách thức kiến trúc cốt lõi là kiểm soát độ phức tạp, bảo toàn các bất biến đóng gói, ưu tiên ghép nối (Composition) thay vì kế thừa sâu, đồng thời khai thác sức mạnh của Java hiện đại (Java 8 interface default method, Java 9 private method và Java 17 sealed class).'
    },
    deepDiveParagraphs: [
      {
        en: '1. Composition over Inheritance (The Fragile Base Class Problem): Deep inheritance hierarchies tightly couple subclasses to superclass internal implementations. When a superclass method alters its internal calling conventions (e.g. calling an overridable method from within a template method), subclasses overriding that method can inadvertently break or cause infinite recursion. Composition eliminates this by wrapping behavior behind well-defined polymorphic interfaces.',
        vi: '1. Ưu tiên Ghép nối hơn Kế thừa (Vấn nạn Lớp cha mong manh): Cây kế thừa nhiều tầng gắn kết chặt chẽ lớp con vào chi tiết cài đặt của lớp cha. Khi lớp cha thay đổi cách thức gọi nội bộ (ví dụ gọi một hàm có thể bị ghi đè), lớp con có thể bị vỡ logic hoặc lặp vô tận ngoài ý muốn. Ghép nối (Composition) giải quyết triệt để vấn đề này bằng cách bao bọc hành vi đằng sau các interface đa hình rõ ràng.'
      },
      {
        en: '2. Interface Evolution & Diamond Conflict Resolution: Before Java 8, interfaces were strictly stateless contracts; adding a method broke every implementation on the planet. Java 8 introduced default and static methods, and Java 9 introduced private helper methods within interfaces. When multiple interfaces declare the identical default method signature, Java resolves ambiguity with two strict rules: 1. Superclasses always win over interfaces. 2. More specific sub-interfaces win over super-interfaces. If siblings conflict, the compiler forces explicit resolution via InterfaceName.super.method().',
        vi: '2. Tiến hóa Interface & Xử lý Xung đột Đa kế thừa (Diamond Problem): Trước Java 8, interface là khế ước thuần túy; thêm một hàm mới sẽ làm vỡ toàn bộ các lớp cài đặt hiện có. Java 8 bổ sung default/static method và Java 9 thêm private method trong interface. Khi nhiều interface cùng có chung một hàm default, Java áp dụng 2 quy tắc vàng: 1. Lớp cha luôn thắng Interface. 2. Interface con cụ thể hơn luôn thắng Interface cha. Nếu hai interface ngang hàng xung đột, trình biên dịch bắt buộc lập trình viên phải override rõ ràng bằng cú pháp InterfaceName.super.method().'
      },
      {
        en: '3. Modern Exhaustive Polymorphism with Sealed Hierarchies: Classical OOP allows unrestricted subtyping, making it impossible for domain compilers to guarantee exhaustive business logic without an unmaintainable catch-all else branch. Java 17+ Sealed Classes and Interfaces (sealed, permits) restrict domain subtypes to a known, bounded set of records/classes, enabling type-safe pattern matching with compile-time exhaustiveness verification.',
        vi: '3. Đa hình khép kín với Sealed Types (Java 17+): Lối kế thừa tự do cổ điển cho phép bất kỳ ai cũng có thể mở rộng class, khiến hệ thống không thể kiểm soát hết các nhánh logic nghiệp vụ nếu thiếu nhánh else mặc định. Hệ thống Sealed Classes (sealed, permits) giới hạn danh sách lớp con trong một tập hợp hữu hạn, hỗ trợ Pattern Matching với khả năng kiểm tra đầy đủ (exhaustive) ngay từ lúc biên dịch.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Leaking mutable internal domain collections via getter methods (e.g., returning the private List<OrderItem> reference directly), allowing external callers to corrupt order totals without triggering validation rules. Always return unmodifiable views via Collections.unmodifiableList() or List.copyOf().',
        vi: 'Để lộ tham chiếu Collection nội bộ có thể bị sửa đổi qua getter (ví dụ trả về trực tiếp List<OrderItem> private), khiến code bên ngoài có thể tự ý thêm bớt item mà không kích hoạt logic tính thuế hay tổng tiền. Luôn trả về List.copyOf() hoặc Collections.unmodifiableList().'
      },
      {
        en: 'Creating God Interfaces that violate the Interface Segregation Principle (ISP), forcing batch worker clients to implement UI rendering callbacks and HTTP serialization methods with empty no-op stubs.',
        vi: 'Tạo các Interface khổng lồ (God Interface) vi phạm nguyên lý Phân tách Interface (ISP), ép các dịch vụ xử lý ngầm (batch worker) phải cài đặt các hàm hiển thị giao diện hay tuần tự hóa HTTP bằng các hàm rỗng vô nghĩa.'
      },
      {
        en: 'Designing deep 5+ level inheritance hierarchies for business entities (Entity -> AuditableEntity -> VersionedEntity -> FinancialEntity -> OrderEntity), which bloats memory layouts and causes catastrophic regression cascades whenever common superclass logic is modified.',
        vi: 'Thiết kế cây kế thừa sâu trên 5 tầng cho thực thể nghiệp vụ (Entity -> AuditableEntity -> VersionedEntity -> FinancialEntity -> OrderEntity), làm phình to bộ nhớ và gây ra các lỗi dây chuyền khó lường mỗi khi lớp cha bị chỉnh sửa.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Refactoring 3,000-Line God-Class OrderProcessor via Composition & Pipeline Architecture',
      vi: 'Tái Cấu Trúc Lớp Khổng Lồ 3,000 Dòng OrderProcessor Bằng Ghép Nối (Composition) & Pipeline'
    },
    businessContext: {
      en: 'A high-growth enterprise marketplace processes $15M daily GMV across Retail, B2B Bulk, Subscriptions, and Cross-Border International channels.',
      vi: 'Sàn thương mại điện tử xử lý 15 triệu USD giao dịch mỗi ngày trên nhiều kênh: Bán lẻ (B2C), Bán buôn (B2B), Gói định kỳ (Subscription) và Giao dịch quốc tế.'
    },
    problemDescription: {
      en: 'The legacy OrderProcessor class grew into a 3,200-line monolithic God Class with 48 nested if/else statements validating customer limits, computing dynamic value-added taxes, verifying inventory reservations, applying coupon promotions, and invoking disparate payment gateways. When engineering introduced a new "Buy Now Pay Later" (BNPL) payment provider, an unhandled edge case in tax recalculation leaked into the credit card workflow, causing 14% of mobile checkout transactions to fail on Black Friday.',
      vi: 'Lớp OrderProcessor cũ biến thành lớp khổng lồ (God Class) hơn 3,200 dòng mã với 48 tầng if/else lồng nhau để thẩm định khách hàng, tính thuế VAT, giữ hàng tồn kho, áp mã giảm giá và gọi cổng thanh toán. Khi thêm đối tác trả góp BNPL mới, một lỗi tính thuế phát sinh đã ảnh hưởng chéo sang luồng thanh toán thẻ tín dụng, khiến 14% giao dịch mua sắm trên ứng dụng di động bị lỗi trong ngày Black Friday.'
    },
    whyNaiveFails: {
      en: 'Creating subclass hierarchies like BnplOrderProcessor extends OrderProcessor failed because business dimensions are orthogonal: an order can simultaneously be B2B, International, and BNPL. Java does not support multiple class inheritance, and duplicating logic across specialized subclasses caused severe copy-paste bugs.',
      vi: 'Cách làm ngây thơ là tạo lớp con BnplOrderProcessor kế thừa OrderProcessor thất bại vì các chiều nghiệp vụ độc lập với nhau: một đơn hàng có thể vừa là B2B, vừa là Quốc tế, vừa thanh toán BNPL. Java không hỗ trợ đa kế thừa lớp, việc sao chép code sang nhiều lớp con dẫn đến lỗi cập nhật chắp vá nghiêm trọng.'
    },
    coreSolution: {
      en: 'Decompose the monolithic God Class into a cohesive, composable Pipeline governed by single-responsibility interfaces: OrderValidationStep, TaxStrategy, and PaymentProvider. Leverage Spring Boot dependency injection to automatically collect and order pipeline beans, enabling zero-risk addition of new business variants.',
      vi: 'Phân rã lớp khổng lồ thành kiến trúc đường ống (Pipeline) ghép nối từ các Interface đơn trách nhiệm: OrderValidationStep, TaxStrategy và PaymentProvider. Sử dụng Spring Boot Dependency Injection để tự động thu thập và sắp xếp các bước xử lý, cho phép mở rộng tính năng mới mà không sửa đổi một dòng code lõi nào.'
    },
    productionCode: `// Production Clean OOP Architecture: Composable Order Processing Pipeline
package com.enterprise.checkout.pipeline;

import org.springframework.stereotype.Service;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// 1. Single-Responsibility Interface for Order Validation
public interface OrderValidationStep {
    void validate(OrderContext context);
}

// 2. Sealed Contract for Polymorphic Payment Providers
public sealed interface PaymentProvider 
    permits CreditCardPayment, BnplPayment, CryptoPayment {
    PaymentResult executePayment(OrderContext context);
    boolean supports(PaymentMethod method);
}

// 3. Concrete Cohesive Strategies
@Component
@Order(10)
public final class InventoryValidationStep implements OrderValidationStep {
    @Override
    public void validate(OrderContext ctx) {
        if (!ctx.hasAvailableStock()) {
            throw new InsufficientInventoryException("SKU out of stock");
        }
    }
}

@Component
@Order(20)
public final class FraudCheckValidationStep implements OrderValidationStep {
    @Override
    public void validate(OrderContext ctx) {
        if (ctx.customer().fraudScore() > 85) {
            throw new FraudRiskException("High fraud score detected");
        }
    }
}

// 4. Concrete Polymorphic Payment Strategy
@Component
public final record BnplPayment(BnplClient bnplClient) implements PaymentProvider {
    @Override
    public PaymentResult executePayment(OrderContext ctx) {
        return bnplClient.chargeInstallment(ctx.orderId(), ctx.totalAmount(), 4);
    }

    @Override
    public boolean supports(PaymentMethod method) {
        return method == PaymentMethod.BNPL_KLARNA;
    }
}

// 5. Orchestrator Pipeline: Favoring Composition Over Inheritance
@Service
public class OrderCheckoutPipeline {
    private final List<OrderValidationStep> validationSteps;
    private final List<PaymentProvider> paymentProviders;

    public OrderCheckoutPipeline(List<OrderValidationStep> steps, List<PaymentProvider> providers) {
        this.validationSteps = steps;
        this.paymentProviders = providers;
    }

    public OrderReceipt process(OrderContext context) {
        // Execute ordered validation chain
        for (OrderValidationStep step : validationSteps) {
            step.validate(context);
        }

        // Dynamically resolve payment strategy
        PaymentProvider provider = paymentProviders.stream()
            .filter(p -> p.supports(context.paymentMethod()))
            .findFirst()
            .orElseThrow(() -> new UnsupportedPaymentException(context.paymentMethod()));

        PaymentResult result = provider.executePayment(context);
        return new OrderReceipt(context.orderId(), result.transactionId(), OrderStatus.CONFIRMED);
    }
}`,
    architectureImpact: {
      en: 'Zero regression incidents during new feature rollouts; Code complexity reduced by 78% (cyclomatic complexity dropped from 44 to 2 per method); New payment method onboarding time cut from 3 weeks to 1 day with 100% test isolation.',
      vi: 'Triệt tiêu 100% lỗi hồi quy khi tích hợp cổng thanh toán mới; Độ phức tạp mã nguồn giảm 78% (cyclomatic complexity giảm từ 44 xuống 2 trên mỗi hàm); Thời gian tích hợp phương thức thanh toán mới giảm từ 3 tuần xuống 1 ngày với khả năng kiểm thử độc lập tuyệt đối.'
    }
  },

  steps: [
    {
      id: 'encapsulation-abstraction',
      title: { en: '1. Encapsulation & Abstraction Contracts', vi: '1. Khế Ước Đóng Gói & Trừu Tượng Hóa' },
      phase: 'CONTRACT_DEFINITION',
      description: {
        en: 'The developer defines an abstract contract via interfaces (Payable) and abstract base classes (BasePayment). Internal representation (e.g. raw credentials) is fully encapsulated via private fields and access mutators.',
        vi: 'Lập trình viên định nghĩa khế ước trừu tượng qua Interface (Payable) và lớp cha (BasePayment). Dữ liệu nhạy cảm được đóng gói chặt chẽ qua các trường private và không để lộ ra ngoài.'
      },
      jvmRuntimeBehavior: {
        en: 'JVM enforces access control flags (ACC_PRIVATE, ACC_PROTECTED) during bytecode verification.',
        vi: 'JVM kiểm tra các cờ bảo vệ quyền truy cập trong quá trình thẩm định bytecode.'
      },
      javaCodeLineMatch: 'public abstract class BasePayment implements Payable'
    },
    {
      id: 'diamond-problem-precedence',
      title: { en: '2. Diamond Problem & Interface Default Precedence', vi: '2. Xử Lý Xung Đột Đa Kế Thừa Diamond Problem' },
      phase: 'DIAMOND_RESOLUTION',
      description: {
        en: 'When a class implements two interfaces that both declare default void printReceipt(), the compiler flags an ambiguity. The class resolves it by explicitly invoking the desired interface or providing a unified override.',
        vi: 'Khi một class thực thi 2 interface cùng có hàm default void printReceipt(), trình biên dịch báo lỗi xung đột. Class giải quyết bằng cách chỉ định rõ AuditLog.super.printReceipt() hoặc tự viết lại hàm.'
      },
      jvmRuntimeBehavior: {
        en: 'invokespecial bytecode dispatched to the explicit interface default method implementation.',
        vi: 'Phát sinh bytecode invokespecial gọi chính xác phương thức default của interface mong muốn.'
      },
      javaCodeLineMatch: 'AuditLog.super.printReceipt();'
    },
    {
      id: 'composition-over-inheritance',
      title: { en: '3. Composition Over Inheritance (SOLID in Practice)', vi: '3. Ghép Nối Thay Vì Kế Thừa (Thực Hành SOLID)' },
      phase: 'COMPOSITION_DISPATCH',
      description: {
        en: 'Rather than inheriting from fragile 5-level class hierarchies, the service injects focused interface collaborators (Dependency Inversion Principle), allowing dynamic swapping of implementations at runtime.',
        vi: 'Thay vì tạo cây kế thừa sâu 5 tầng dễ vỡ, hệ thống tiêm các dependency interface vào class (Nguyên lý Đảo ngược phụ thuộc), cho phép thay thế thuật toán linh hoạt lúc chạy.'
      },
      jvmRuntimeBehavior: {
        en: 'Decoupled reference fields on Heap; JIT inlines collaborator methods when call site is monomorphic.',
        vi: 'Lưu tham chiếu con trỏ trên Heap; C2 JIT tự động inline mã khi các điểm gọi chỉ có 1 loại đối tượng.'
      },
      javaCodeLineMatch: 'private final NotificationService notifier;'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'HotSpot Interface Method Table (itable)',
      implementationName: 'Two-Dimensional itable Offset Scanning',
      keyMechanism: {
        en: 'Classes implementing multiple interfaces maintain an itable. When invokeinterface executes, HotSpot scans the itable to find the matching interface offset, then dereferences the method pointer.',
        vi: 'Lớp thực thi nhiều interface duy trì bảng itable. Khi gặp lệnh invokeinterface, HotSpot quét itable để tìm offset của interface tương ứng rồi mới lấy con trỏ hàm.'
      },
      defaultFlags: '-XX:+TieredCompilation',
      architectureNote: {
        en: 'Interface invocation historically carried a slight overhead over vtable invokevirtual, but C2 JIT Inline Caching eliminates the difference for hot paths.',
        vi: 'Gọi hàm qua interface trước đây chậm hơn một chút so với vtable, nhưng C2 JIT Inline Caching đã triệt tiêu hoàn toàn sự chênh lệch này.'
      }
    },
    {
      jvmEngine: 'Java 8+ Defender / Default Methods',
      implementationName: 'Backward-Compatible Library Evolution',
      keyMechanism: {
        en: 'Default methods were introduced in Java 8 to allow evolving core interfaces (e.g. adding stream() to java.util.Collection) without breaking thousands of legacy third-party implementations.',
        vi: 'Default method được bổ sung từ Java 8 để tiến hóa các interface lõi (như thêm hàm stream() vào Collection) mà không làm hỏng code của hàng triệu thư viện cũ.'
      },
      defaultFlags: '-XX:+PreserveFramePointer',
      architectureNote: {
        en: 'Interface default methods are NOT intended to turn interfaces into multiple-inheritance state containers.',
        vi: 'Default method không sinh ra để biến interface thành lớp đa kế thừa chứa biến trạng thái.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Composition over inheritance eliminates the Fragile Base Class problem and promotes single responsibility.',
        vi: 'Ưu tiên ghép nối (Composition) loại bỏ lỗi Lớp cha dễ vỡ và thúc đẩy nguyên lý đơn trách nhiệm.'
      },
      {
        en: 'Interfaces allow flexible multiple contract fulfillment without the diamond state corruption found in C++ multiple inheritance.',
        vi: 'Interface cho phép một lớp thực hiện nhiều hợp đồng khác nhau mà không gặp lỗi xung đột biến trạng thái như C++.'
      }
    ],
    cons: [
      {
        en: 'Deep inheritance hierarchies increase object header dereferencing and Metaspace memory footprint.',
        vi: 'Cây kế thừa sâu làm tăng chi phí giải mã con trỏ và tốn thêm bộ nhớ lưu metadata trong Metaspace.'
      },
      {
        en: 'Overusing interface default methods can create spaghetti inheritance logic where method origins become ambiguous.',
        vi: 'Lạm dụng default method trong interface dễ tạo ra code rối rắm khó lần ra nguồn gốc hàm thực thi.'
      }
    ],
    memoryFootprint: {
      en: 'Interfaces have zero memory overhead per instance. Abstract classes add the sum of their instance field bytes to the Heap object layout.',
      vi: 'Interface tốn 0 byte trên instance đối tượng. Lớp trừu tượng cộng dồn số byte của các trường thuộc tính vào Heap.'
    },
    jvmSpecificationGuarantee: {
      en: 'JLS §9.4.1.3: Default methods are resolved with class-first precedence; explicit qualification resolves any remaining ambiguity.',
      vi: 'JLS §9.4.1.3: Phương thức default luôn ưu tiên cài đặt của lớp cha; nếu có xung đột giữa các interface, lập trình viên bắt buộc phải ghi đè rõ ràng.'
    }
  },

  javaCode: `package com.engine.fundamentals;

// Interface defining pure behavior contract
interface Payable {
    void processPayment(long amountCents);

    // Java 8 Default Method: Backward-compatible functionality
    default void printAuditLog() {
        System.out.println("[AUDIT] Default audit log recorded via interface.");
    }
}

interface Exportable {
    default void printAuditLog() {
        System.out.println("[EXPORT] Exporting audit log to external storage...");
    }
}

// Abstract Class: Holds common state and lifecycle hooks
abstract class BaseOrder {
    private final long orderId;
    private final long timestamp;

    public BaseOrder(long orderId) {
        this.orderId = orderId;
        this.timestamp = System.currentTimeMillis();
    }

    public long getOrderId() { return orderId; }
    public long getTimestamp() { return timestamp; }

    // Abstract method: forces concrete subclasses to implement
    public abstract void validateOrder();
}

// Concrete Class: Solves the Diamond Problem explicitly
public class EnterpriseOrder extends BaseOrder implements Payable, Exportable {

    private final String customerEmail;

    public EnterpriseOrder(long orderId, String customerEmail) {
        super(orderId); // Initialize abstract base class state
        this.customerEmail = customerEmail;
    }

    @Override
    public void validateOrder() {
        System.out.println("Validating enterprise order #" + getOrderId() + " for: " + customerEmail);
    }

    @Override
    public void processPayment(long amountCents) {
        System.out.println("Processing payment of $" + (amountCents / 100.0) + " for order #" + getOrderId());
    }

    // RESOLVING DIAMOND PROBLEM:
    // Compiler forces override because both Payable and Exportable define printAuditLog()!
    @Override
    public void printAuditLog() {
        System.out.println("=== Enterprise Unified Audit Log ===");
        Payable.super.printAuditLog();   // Explicitly disambiguate to Payable
        Exportable.super.printAuditLog(); // Explicitly disambiguate to Exportable
    }

    public static void main(String[] args) {
        EnterpriseOrder order = new EnterpriseOrder(1001L, "corp@enterprise.vn");
        order.validateOrder();
        order.processPayment(25000L);
        order.printAuditLog();
    }
}`,

  jvmFlagsCode: `# Diagnostic flags for Metaspace & Interface Method Resolution
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintMetaspaceInfoAtExit
-XX:MaxMetaspaceSize=256m`,

  bytecodeInspection: `// Disassembly of EnterpriseOrder.printAuditLog()V via javap -c
Code:
   0: getstatic     #7  // Field java/lang/System.out:Ljava/io/PrintStream;
   3: ldc           #9  // String === Enterprise Unified Audit Log ===
   5: invokevirtual #11 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
   8: aload_0
   9: invokespecial #17 // InterfaceMethod Payable.printAuditLog:()V (Explicit super call)
  12: aload_0
  13: invokespecial #23 // InterfaceMethod Exportable.printAuditLog:()V
  16: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What are the main differences between an Abstract Class and an Interface in modern Java?',
        vi: 'Sự khác biệt chính giữa Lớp trừu tượng (Abstract Class) và Interface trong Java hiện đại là gì?'
      },
      answer: {
        en: '1. State: Abstract classes can have instance fields (state) and constructors; Interfaces cannot store instance state (only public static final constants). 2. Inheritance: A class can extend only ONE abstract class (single inheritance), but can implement MULTIPLE interfaces. 3. Purpose: An abstract class represents an "IS-A" identity with shared state and code; an interface represents a "CAN-DO" capability or contract.',
        vi: '1. Biến trạng thái: Abstract Class có thể chứa biến instance và hàm khởi tạo (constructor); Interface không có biến instance (chỉ có hằng số public static final). 2. Kế thừa: Một class chỉ có thể kế thừa DUY NHẤT một abstract class, nhưng có thể thực thi NHIỀU interface. 3. Mục đích: Abstract Class mô tả bản chất đối tượng ("IS-A") có chia sẻ trạng thái; Interface mô tả khả năng hành vi ("CAN-DO") hoặc một bản khế ước.'
      },
      trapWarning: {
        en: 'Do not say interfaces cannot have method bodies. Since Java 8, interfaces can define default and static methods, and since Java 9, they can define private helper methods.',
        vi: 'Đừng nói Interface không thể có thân hàm. Từ Java 8, Interface đã hỗ trợ phương thức default và static, và Java 9 bổ sung thêm phương thức private.'
      },
      proTip: {
        en: 'Articulate the architectural guideline: Use an Abstract Class when subclasses genuinely share common state, private fields, and core lifecycle algorithms (Template Method Pattern). Use Interfaces for API contracts and dependency injection.',
        vi: 'Nguyên tắc kiến trúc: Dùng Abstract Class khi các lớp con chia sẻ biến trạng thái và khung thuật toán chung (Template Method Pattern). Dùng Interface để định nghĩa API và tiêm phụ thuộc (Dependency Injection).'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'How does Java resolve the Diamond Problem when two interfaces have identical default methods?',
        vi: 'Java giải quyết bài toán Diamond Problem như thế nào khi hai interface có cùng phương thức default?'
      },
      answer: {
        en: 'Java defines 3 strict rules: 1. Class Wins: Any method declaration in a superclass always takes precedence over any interface default method. 2. Sub-interface Wins: If Interface B extends Interface A, B\'s default method wins over A\'s. 3. Explicit Disambiguation: If two unrelated interfaces provide conflicting defaults, the compiler issues a compilation error. The subclass MUST explicitly override the method and can invoke InterfaceName.super.methodName() if desired.',
        vi: 'Java đặt ra 3 quy tắc bất di bất dịch: 1. Lớp luôn thắng (Class Wins): Bất kỳ phương thức nào có sẵn trong lớp cha đều được ưu tiên hơn default method của interface. 2. Interface con thắng interface cha: Nếu B kế thừa A thì B thắng. 3. Bắt buộc ghi đè rõ ràng: Nếu 2 interface không có quan hệ cha con cùng cung cấp default method trùng tên, compiler báo lỗi biên dịch ngay lập tức. Lớp con BẮT BUỘC phải ghi đè và có thể gọi InterfaceName.super.methodName() để chỉ định.'
      },
      trapWarning: {
        en: 'Candidates often claim Java does not allow multiple inheritance at all. Clarify that Java does NOT allow Multiple Inheritance of STATE (no multiple class inheritance), but DOES allow Multiple Inheritance of TYPE and BEHAVIOR through interface default methods.',
        vi: 'Ứng viên hay nói Java cấm hoàn toàn đa kế thừa. Cần đính chính: Java cấm đa kế thừa TRẠNG THÁI (không thể extends nhiều class), nhưng CHO PHÉP đa kế thừa KIỂU và HÀNH VI thông qua default method của interface.'
      },
      proTip: {
        en: 'Mention why Java forbids instance fields in interfaces: Having no state eliminates the memory layout ambiguity (two copies of the same variable) that plagues C++ virtual base classes.',
        vi: 'Giải thích lý do Interface không cho phép có biến instance: Việc không có trạng thái giúp triệt tiêu hoàn toàn sự nhập nhằng về bố cục ô nhớ (2 bản sao của cùng 1 biến) từng gây ác mộng trong C++.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'Why is "Composition over Inheritance" considered an essential principle in enterprise system architecture?',
        vi: 'Tại sao nguyên lý "Ưu tiên ghép nối hơn kế thừa (Composition over Inheritance)" lại là cốt lõi trong kiến trúc doanh nghiệp?'
      },
      answer: {
        en: 'Inheritance violates encapsulation because subclasses are tightly coupled to superclass implementation details (the Fragile Base Class problem). If a superclass method implementation changes, all subclasses across the entire codebase can silently break. Furthermore, inheritance is fixed at compile time. In contrast, Composition (holding references to interface components) decouples responsibilities, allows swapping strategies dynamically at runtime (Strategy Pattern), facilitates unit testing via mocking, and keeps object memory footprints compact.',
        vi: 'Kế thừa làm phá vỡ tính đóng gói vì lớp con bị gắn chặt vào chi tiết thực thi của lớp cha (lỗi Fragile Base Class). Khi lớp cha sửa đổi logic bên trong, toàn bộ lớp con trong hệ thống có thể bị hỏng âm thầm. Hơn nữa, kế thừa bị chốt cứng lúc biên dịch. Ngược lại, Ghép nối (Composition) giữ tham chiếu tới interface giúp tách biệt trách nhiệm, cho phép tráo đổi linh hoạt thuật toán lúc runtime (Strategy Pattern), dễ viết Unit Test với Mock và giữ đối tượng gọn nhẹ trong RAM.'
      },
      trapWarning: {
        en: 'Do not say inheritance should never be used. Inheritance is valid for strict polymorphic is-a hierarchies (e.g. AST node expressions, UI components), but should not be used solely for code reuse.',
        vi: 'Đừng nói không bao giờ được dùng kế thừa. Kế thừa vẫn rất tốt cho các cấu trúc phân cấp thuần túy (AST node, UI component), nhưng tuyệt đối không nên dùng kế thừa chỉ với mục đích tái sử dụng vài dòng code.'
      },
      proTip: {
        en: 'Reference the Liskov Substitution Principle (LSP): If a subclass cannot seamlessly replace its superclass without breaking invariants (e.g. Square extending Rectangle), inheritance is architecturally invalid. Replace it with composition.',
        vi: 'Dẫn chứng Nguyên lý Thay thế Liskov (LSP): Nếu lớp con không thể thay thế hoàn hảo cho lớp cha mà không phá vỡ tính đúng đắn (ví dụ kinh điển Square kế thừa Rectangle), thì quan hệ kế thừa đó sai về mặt kiến trúc. Hãy thay bằng Composition.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'How does the Liskov Substitution Principle (LSP) formally constrain method contracts in Java, and how does the JVM bytecode compiler enforce covariance and contravariance rules?',
        vi: 'Nguyên lý Thay thế Liskov (LSP) ràng buộc khế ước phương thức trong Java về mặt toán học như thế nào, và trình biên dịch JVM Bytecode áp đặt các quy tắc Hiệp biến (Covariance) và Nghịch biến (Contravariance) ra sao?'
      },
      answer: {
        en: 'Barbara Liskov\'s formal definition of Behavioral Subtyping imposes 3 mathematical rules: 1. Preconditions cannot be strengthened in a subtype (a subclass method cannot demand stricter input arguments than the superclass). 2. Postconditions cannot be weakened in a subtype (a subclass method must fulfill at least all guarantees made by the superclass). 3. Invariants of the supertype must be preserved. How the Java Type System enforces this: Return Type Covariance: An overriding method is permitted to return a MORE SPECIFIC subtype (e.g. ArrayList overriding List), because any client expecting List will receive a valid subtype (postcondition preserved!). The javac compiler emits a synthetic "bridge method" at the bytecode level to satisfy JVM invokeinterface/invokevirtual descriptors! Checked Exception Invariance/Covariance: An overriding method CANNOT throw new or broader checked exceptions (e.g. throwing Exception when superclass throws IOException causes a compiler error), because client callers caught under the superclass contract would fail to handle the unannounced exception (violating LSP!).',
        vi: 'Định nghĩa toán học của Barbara Liskov về Phân kiểu Hành vi (Behavioral Subtyping) đặt ra 3 quy tắc bất biến: 1. Tiền điều kiện (Preconditions) không được phép siết chặt hơn ở lớp con (lớp con không được đòi hỏi dữ liệu đầu vào khắt khe hơn lớp cha). 2. Hậu điều kiện (Postconditions) không được phép làm suy yếu ở lớp con (lớp con phải đảm bảo cung cấp kết quả ít nhất bằng hoặc tốt hơn lớp cha). 3. Các bất biến (Invariants) của lớp cha bắt buộc phải được bảo toàn. Cách hệ thống kiểu Java hiện thực hóa quy tắc này: Hiệp biến Kiểu trả về (Return Type Covariance): Lớp con ghi đè được phép trả về một kiểu con cụ thể hơn (ví dụ ArrayList thay vì List), vì người gọi cần List thì nhận ArrayList vẫn hợp lệ (bảo toàn hậu điều kiện!). Trình biên dịch javac tự động sinh một "bridge method" nhân tạo trong bytecode để thỏa mãn bộ định danh invokevirtual của JVM! Ràng buộc Checked Exception: Lớp con TUYỆT ĐỐI KHÔNG ĐƯỢC ném ra checked exception mới hoặc rộng hơn (ghi đè hàm throws IOException bằng throws Exception sẽ bị compiler chặn đứng ngay lập tức), vì các khối try-catch của lớp cha sẽ không thể bắt được ngoại lệ mới này (vi phạm nghiêm trọng LSP!).'
      },
      trapWarning: {
        en: 'Method Overriding in Java does NOT support Parameter Contravariance (accepting a broader parameter type like Object instead of String). If you change the parameter type in a subclass, Java treats it as Method Overloading, NOT overriding!',
        vi: 'Ghi đè phương thức (Overriding) trong Java KHÔNG HỖ TRỢ Nghịch biến Tham số (Parameter Contravariance). Nếu bạn đổi tham số đầu vào sang kiểu cha rộng hơn (như đổi String thành Object), Java sẽ coi đó là nạp chồng (Overloading) chứ không phải ghi đè!'
      },
      proTip: {
        en: 'In API design, use the PECS rule (Producer Extends, Consumer Super) in Java Generics to achieve true Liskov substitutability across collections: <? extends T> for covariant producers, <? super T> for contravariant consumers.',
        vi: 'Trong thiết kế API doanh nghiệp, áp dụng nguyên tắc PECS (Producer Extends, Consumer Super) của Generics để đạt được tính thay thế Liskov hoàn hảo trên Collections: dùng <? extends T> khi cần đọc (Producer) và <? super T> khi cần ghi (Consumer).'
      }
    }
  ]
};
