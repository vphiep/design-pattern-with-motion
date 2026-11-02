import type { Pattern } from '../types';

export const factoryMethod: Pattern = {
  id: 'factory-method',
  category: 'creational',
  name: 'Factory Method',
  tagline: {
    en: 'Let a method decide which exact class to build, so callers don’t have to know the concrete type.',
    vi: 'Để một method quyết định class cụ thể nào sẽ được tạo, nhờ đó caller không cần biết kiểu concrete.'
  },
  analogy: {
    en: 'A coffee shop has one button on the screen — “order coffee”. Behind it, the machine decides whether you get an espresso, a latte, or a drip. You never construct a Latte directly; you ask the shop, and it picks the right kind.',
    vi: 'Quán cà phê có một nút trên màn hình — “gọi cà phê”. Đằng sau đó, máy tự quyết định bạn nhận espresso, latte hay cà phê phin. Bạn không bao giờ tự new một Latte; bạn hỏi quán, và quán chọn đúng loại.'
  },
  whenToUse: [
    {
      en: 'A class can’t anticipate which type of object it must create — that choice belongs to subclasses.',
      vi: 'Một class không thể đoán trước phải tạo object kiểu nào — lựa chọn đó thuộc về subclass.'
    },
    {
      en: 'You want callers to depend on a product interface, not on concrete products.',
      vi: 'Bạn muốn caller phụ thuộc vào interface của product, không phải các product concrete.'
    },
    {
      en: 'You want to centralize the construction logic so it’s easy to find and change.',
      vi: 'Bạn muốn gom logic khởi tạo về một chỗ để dễ tìm và dễ đổi.'
    }
  ],
  whenNotToUse: [
    {
      en: 'There’s only one product type and no plan to add more — the extra layer is just noise.',
      vi: 'Chỉ có một kiểu product và không có kế hoạch thêm loại mới — tầng thêm vào chỉ là nhiễu.'
    },
    {
      en: 'The construction logic is trivial enough that a constructor does the job.',
      vi: 'Logic khởi tạo đủ tầm thường đến mức một constructor là xong.'
    }
  ],
  difficulty: 1,
  order: 2,
  javaCode: `// The product: anything a log can be written to.
interface LogDestination {
    void write(String message);
}

// Two concrete products.
final class StdoutDestination implements LogDestination {
    public void write(String message) { System.out.println("[stdout] " + message); }
}
final class FileDestination implements LogDestination {
    private final String path;
    FileDestination(String path) { this.path = path; }
    public void write(String message) { System.out.println("[file:" + path + "] " + message); }
}

// The creator. It declares the factory method but doesn't implement it.
// Subclasses decide which LogDestination to build.
abstract class Logger {
    // The factory method.
    protected abstract LogDestination createDestination();

    public void log(String message) {
        LogDestination dest = createDestination(); // ask the subclass
        dest.write(message);
    }
}

// Subclasses that fill in the factory method.
final class StdoutLogger extends Logger {
    protected LogDestination createDestination() { return new StdoutDestination(); }
}
final class FileLogger extends Logger {
    private final String path;
    FileLogger(String path) { this.path = path; }
    protected LogDestination createDestination() { return new FileDestination(path); }
}`,
  steps: [
    {
      title: {
        en: 'The caller asks the logger to write',
        vi: 'Caller yêu cầu logger ghi log'
      },
      body: {
        en: 'The caller invokes logger.log("hello") on an abstract Logger reference. The caller neither knows nor cares what concrete destination the message will reach; its only contract is with Logger.',
        vi: 'Caller gọi logger.log("hello") trên một tham chiếu Logger trừu tượng. Caller không biết và cũng không quan tâm thông điệp sẽ ghi vào đâu; khế ước duy nhất là với lớp Logger.'
      }
    },
    {
      title: {
        en: 'The factory method instantiates the destination',
        vi: 'Factory method khởi tạo điểm ghi cụ thể'
      },
      body: {
        en: 'Inside log(), the base class delegates to createDestination(). Because this method is overridden in subclasses (like FileLogger or StdoutLogger), dynamic dispatch builds the appropriate concrete product.',
        vi: 'Bên trong log(), lớp cơ sở ủy thác cho createDestination(). Vì method này được override trong các subclass (như FileLogger hay StdoutLogger), phân giải động vtable sẽ tạo đúng product tương ứng.'
      }
    },
    {
      title: {
        en: 'The message is delivered through the interface',
        vi: 'Thông điệp được gửi qua interface'
      },
      body: {
        en: 'The newly created LogDestination receives the write(message) call. Adding a new destination in the future requires only a new subclass, leaving existing callers untouched.',
        vi: 'LogDestination vừa tạo nhận lệnh gọi write(message). Việc bổ sung điểm ghi mới trong tương lai chỉ cần thêm subclass mới mà không làm ảnh hưởng tới code caller hiện có.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.util.Calendar.getInstance()',
      note: {
        en: 'Returns a GregorianCalendar, JapaneseImperialCalendar, or BuddhistCalendar based on Locale without callers knowing the concrete calendar implementation.',
        vi: 'Trả về GregorianCalendar, JapaneseImperialCalendar hoặc BuddhistCalendar dựa vào Locale mà caller không cần biết class cụ thể.'
      }
    },
    {
      system: 'javax.net.ssl.SSLSocketFactory.getDefault()',
      note: {
        en: 'Standard Java cryptography factory that yields platform-specific secure socket implementations based on local security providers.',
        vi: 'Factory chuẩn của Java trả về socket bảo mật tương thích với hệ thống bảo mật cụ thể của máy chủ.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Subclass-per-product scales poorly once destinations are configured, not compiled in. The form below replaces the abstract factory method with a Supplier<LogDestination> and a registry: registering a new destination is a one-line put, not a new Logger subclass.',
      vi: 'Mỗi product một subclass sẽ khó mở rộng khi destination đến từ cấu hình chứ không phải hard-code. Dạng bên dưới thay factory method abstract bằng Supplier<LogDestination> và một registry: đăng ký destination mới chỉ là một dòng put.'
    },
    tradeoffs: {
      en: 'A Supplier registry is easier to extend at runtime and friendlier in tests. Keep the classic subclass form when the set of products is small and fixed.',
      vi: 'Registry các Supplier dễ mở rộng lúc runtime hơn và thân thiện với unit test hơn. Giữ dạng subclass cổ điển khi tập product nhỏ và cố định.'
    },
    javaCode: `import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

interface LogDestination { void write(String message); }

final class StdoutDestination implements LogDestination {
    public void write(String message) { System.out.println("[stdout] " + message); }
}

final class Logger {
    private final Supplier<LogDestination> factory;
    Logger(Supplier<LogDestination> factory) { this.factory = factory; }
    public void log(String message) { factory.get().write(message); }
}

final class DestinationRegistry {
    private final Map<String, Supplier<LogDestination>> factories = new HashMap<>();
    void register(String key, Supplier<LogDestination> factory) {
        factories.put(key, factory);
    }
    Logger logger(String key) {
        Supplier<LogDestination> factory = factories.get(key);
        if (factory == null) throw new IllegalArgumentException(key);
        return new Logger(factory);
    }
}`
  },

  deepTheory: {
    academicRoot: {
      en: 'Gang of Four (GoF 1994) Creational Pattern. Directly embodies the Open-Closed Principle (OCP) and Dependency Inversion Principle (DIP). Instead of high-level policy depending on low-level concrete construction, both depend upon abstractions.',
      vi: 'Mẫu Khởi tạo kinh điển trong Gang of Four (GoF 1994). Hiện thực hóa trực tiếp Nguyên lý Đóng-Mở (Open-Closed Principle - OCP) và Đảo ngược Phụ thuộc (Dependency Inversion Principle - DIP). Thay vì tầng nghiệp vụ cấp cao phụ thuộc vào logic khởi tạo cụ thể cấp thấp, cả hai đều phụ thuộc vào giao diện trừu tượng.'
    },
    structuralCouplingMetric: {
      en: 'Eliminates Concrete Efferent Coupling: Without Factory Method, a client class calling "new ConcreteA()", "new ConcreteB()", "new ConcreteC()" has Ce >= 3. Introducing Factory Method reduces client Efferent Coupling to Ce = 1 (depending only on the Product Interface), dropping Instability (I) and isolating clients from changes in concrete constructors.',
      vi: 'Triệt Tiêu Phụ Thuộc Hướng Ra (Efferent Coupling): Nếu không có Factory Method, một class nghiệp vụ tự tay gọi new ConcreteA(), new ConcreteB(), new ConcreteC() sẽ có Ce >= 3. Đưa Factory Method vào giúp hạ Ce của client xuống đúng bằng 1 (chỉ phụ thuộc vào Product Interface), giảm chỉ số bất ổn (I) và cách ly client khỏi mọi thay đổi trong constructor cụ thể.'
    },
    memoryAndVtableTradeoff: {
      en: 'Virtual Method Dispatch Cost: The factory method invocation introduces an invokevirtual bytecode instruction, incurring a single pointer indirection through the Metaspace InstanceKlass vtable (~1-2ns). In production JIT hot paths, if only a single concrete factory is active, C2 performs Monomorphic Inline Caching, completely erasing the virtual call overhead.',
      vi: 'Chi Phí Phân Giải Hàm Ảo (vtable): Lệnh gọi factory method tạo ra một chỉ lệnh bytecode invokevirtual, tốn đúng 1 bước nhảy con trỏ qua bảng vtable trong Metaspace (~1-2ns). Trong các luồng chạy nóng JIT, nếu chỉ có một loại factory hoạt động, C2 JIT tự động tối ưu qua Monomorphic Inline Caching, triệt tiêu hoàn toàn chi phí gọi hàm ảo.'
    },
    enterpriseBestPractices: [
      {
        en: 'Do not create separate Creator subclasses for every trivial product. In modern Java, leverage Map<String, Supplier<Product>> or Spring Auto-Wired List<Product> registries.',
        vi: 'Không tạo tràn lan các subclass Creator cho các sản phẩm đơn giản. Trong Java hiện đại, hãy tận dụng Map<String, Supplier<Product>> hoặc cơ chế tự động tiêm List/Map của Spring Boot.'
      },
      {
        en: 'Combine with Parameterized Enum or String descriptors so new products can be dynamically resolved via database configurations or feature flags.',
        vi: 'Kết hợp với Enum định danh hoặc Feature Flag để việc chọn loại product có thể cấu hình linh hoạt từ cơ sở dữ liệu mà không cần deploy lại code.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Violating Open-Closed Principle in Multi-Tenant Global Payment Gateways',
      vi: 'Bùng Nổ Điều Kiện If-Else & Vi Phạm Open-Closed Principle Khi Mở Rộng Cổng Thanh Toán Đa Quốc Gia'
    },
    businessContext: {
      en: 'A cross-border e-commerce platform processes payments across 12 countries, integrating distinct payment providers: Stripe (US/EU), MoMo & VNPay (Vietnam), Pix (Brazil), and WeChat Pay (China).',
      vi: 'Nền tảng thương mại điện tử xuyên biên giới xử lý thanh toán trên 12 quốc gia, tích hợp các đối tác thanh toán khác nhau: Stripe (US/EU), MoMo & VNPay (Việt Nam), Pix (Brazil) và WeChat Pay (Trung Quốc).'
    },
    problemDescription: {
      en: 'The legacy codebase used a monolithic 500-line switch-case statement inside PaymentService: if (type == STRIPE) new StripeGateway(...) else if (type == MOMO) new MomoGateway(...). Every time a new payment partner was added or an existing SDK was upgraded, developers were forced to modify the central PaymentService.java file. This directly violated the Open-Closed Principle. A tiny syntax bug or import collision when integrating Pix caused a regression failure that took down Stripe checkouts for US customers, losing hundreds of thousands of dollars in abandoned carts.',
      vi: 'Hệ thống cũ sử dụng một khối lệnh switch-case khổng lồ dài hơn 500 dòng bên trong PaymentService: if (type == STRIPE) new StripeGateway(...) else if (type == MOMO) new MomoGateway(...). Mỗi khi cần thêm một đối tác thanh toán mới hoặc nâng cấp thư viện SDK, lập trình viên buộc phải mở file lõi PaymentService.java ra sửa trực tiếp. Điều này vi phạm nghiêm trọng Nguyên lý Đóng-Mở (OCP). Một lỗi nhỏ khi thêm cổng Pix ở Brazil đã làm sập luôn luồng thanh toán Stripe của khách hàng Mỹ, gây thiệt hại hàng trăm ngàn USD doanh thu giỏ hàng bị bỏ rơi.'
    },
    whyNaiveFails: {
      en: 'Direct instantiation with "new" tightly couples the core billing workflow to concrete SDK dependencies. Testing becomes a nightmare because unit tests cannot mock individual gateways without initializing all third-party SDK credentials.',
      vi: 'Việc tự tay gọi lệnh "new" trói chặt toàn bộ logic thanh toán cốt lõi vào 12 bộ thư viện SDK cụ thể. Việc viết Unit Test trở thành ác mộng vì không thể mock riêng lẻ từng cổng mà bị ép phải nạp thông tin cấu hình của toàn bộ các đối tác.'
    },
    coreSolution: {
      en: '1. Factory Method Strategy Pattern: Define a universal PaymentGateway interface (charge, refund). The central processor depends SOLELY on this interface.\n2. Self-Registering Spring Bean Factory: Each gateway implements a factory method or registers itself into an autowired Map<PaymentMethod, PaymentGateway>.\n3. Zero Core Modification: Integrating a new payment partner (e.g. Apple Pay) only requires writing a single new class (ApplePayGateway) annotated with @Component. The core billing engine remains 100% untouched!',
      vi: '1. Áp Dụng Factory Method Kết Hợp Strategy: Định nghĩa interface chuẩn PaymentGateway (charge, refund). Bộ xử lý thanh toán cốt lõi CHỈ PHỤ THUỘC DUY NHẤT vào interface này.\n2. Tự Động Đăng Ký Qua Spring Bean Factory: Mỗi cổng thanh toán tự đăng ký vào một Map<PaymentMethod, PaymentGateway> được Spring tự động tiêm.\n3. Không Chạm Vào Code Cũ: Khi cần tích hợp thêm Apple Pay, lập trình viên CHỈ VIỆC VIẾT THÊM 1 CLASS MỚI (ApplePayGateway) với annotation @Component. Toàn bộ logic thanh toán cũ không phải sửa dù chỉ 1 dòng code!'
    },
    productionCode: `// Production Spring Boot 3.x Factory Method Pattern
public interface PaymentGateway {
    PaymentMethod getSupportedMethod();
    PaymentResult processCharge(PaymentRequest request);
}

@Component
public class StripePaymentGateway implements PaymentGateway {
    @Override public PaymentMethod getSupportedMethod() { return PaymentMethod.STRIPE; }
    @Override public PaymentResult processCharge(PaymentRequest req) {
        // Stripe SDK logic
        return new PaymentResult("STRIPE-SUCCESS-200");
    }
}

@Component
public class MomoPaymentGateway implements PaymentGateway {
    @Override public PaymentMethod getSupportedMethod() { return PaymentMethod.MOMO; }
    @Override public PaymentResult processCharge(PaymentRequest req) {
        // MoMo QR code logic
        return new PaymentResult("MOMO-SUCCESS-200");
    }
}

// Creator / Factory Registry powered by Spring IoC
@Service
public class PaymentGatewayFactory {
    private final Map<PaymentMethod, PaymentGateway> gatewayRegistry;

    // Spring automatically discovers and injects all PaymentGateway beans!
    public PaymentGatewayFactory(List<PaymentGateway> gateways) {
        this.gatewayRegistry = gateways.stream()
            .collect(Collectors.toMap(PaymentGateway::getSupportedMethod, g -> g));
    }

    public PaymentGateway getGateway(PaymentMethod method) {
        PaymentGateway gateway = gatewayRegistry.get(method);
        if (gateway == null) {
            throw new UnsupportedPaymentException("No gateway available for: " + method);
        }
        return gateway;
    }
}`,
    architectureImpact: {
      en: '100% adherence to Open-Closed Principle. New payment partners can be plugged in within 30 minutes without risk of regressions. Unit test coverage soared from 42% to 98% via mockable gateway interfaces.',
      vi: 'Đạt 100% tính tuân thủ Nguyên lý Đóng-Mở (OCP). Tích hợp đối tác thanh toán mới chỉ mất 30 phút mà hoàn toàn không có rủi ro sinh lỗi hồi quy (regression). Độ phủ Unit Test tăng vọt từ 42% lên 98% nhờ việc mock các gateway vô cùng dễ dàng.'
    }
  }
};
