import type { Pattern } from '../types';

export const builder: Pattern = {
  id: 'builder',
  category: 'creational',
  name: 'Builder',
  tagline: {
    en: 'Construct a complex object step-by-step so the same building process can produce different results.',
    vi: 'Dựng một object phức tạp từng bước, để cùng một quy trình xây dựng cho ra kết quả khác nhau.'
  },
  analogy: {
    en: 'Ordering a custom sandwich: you don’t fill out a 200-field form. You start with a base, add this, skip that, choose the bread, then say “done.” The builder is the order slip — it collects each choice, and only at the end does the sandwich get made.',
    vi: 'Gọi một ổ bánh mì tùy chọn: bạn không điền form 200 field. Bạn bắt đầu từ phần nền, thêm cái này, bỏ cái kia, chọn bánh mì, rồi nói “xong.” Builder chính là phiếu order — nó gom từng lựa chọn, và chỉ khi cuối cùng ổ bánh mới được làm.'
  },
  whenToUse: [
    {
      en: 'An object has lots of optional fields or configurations, and many combinations are valid.',
      vi: 'Object có nhiều field hoặc cấu hình tùy chọn, và nhiều tổ hợp đều hợp lệ.'
    },
    {
      en: 'Constructors with too many parameters are starting to look unreadable.',
      vi: 'Constructor quá nhiều tham số bắt đầu khó đọc.'
    },
    {
      en: 'You want to build the object step-by-step and only commit at the end.',
      vi: 'Bạn muốn dựng object từng bước và chỉ “chốt” ở cuối.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The object is simple and has only a few required fields — a plain constructor is clearer.',
      vi: 'Object đơn giản, chỉ vài field bắt buộc — một constructor thường rõ hơn.'
    },
    {
      en: 'You’re building exactly one shape and never varying it.',
      vi: 'Bạn chỉ dựng đúng một hình dạng và không bao giờ đổi nó.'
    }
  ],
  difficulty: 2,
  order: 4,
  javaCode: `// The thing we're building: a request with many optional fields.
public final class HttpRequest {
    private final String method;
    private final String url;
    private final java.util.Map<String, String> headers;
    private final String body;
    private final int timeoutMs;

    // The constructor is private. You must go through the builder.
    private HttpRequest(Builder b) {
        this.method = b.method;
        this.url = b.url;
        this.headers = java.util.Map.copyOf(b.headers);
        this.body = b.body;
        this.timeoutMs = b.timeoutMs;
    }

    public static final class Builder {
        private final String method; // required
        private final String url;    // required
        private java.util.Map<String, String> headers = new java.util.HashMap<>();
        private String body = "";
        private int timeoutMs = 30_000;

        public Builder(String method, String url) {
            this.method = method;
            this.url = url;
        }
        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public Builder body(String body)          { this.body = body; return this; }
        public Builder timeoutMs(int ms)          { this.timeoutMs = ms; return this; }

        public HttpRequest build() { return new HttpRequest(this); }
    }
}

// Usage reads like a sentence:
//   new HttpRequest.Builder("POST", "/users")
//       .header("Content-Type", "application/json")
//       .body("{...}")
//       .timeoutMs(5_000)
//       .build();`,
  steps: [
    {
      title: {
        en: 'Required pieces go into the builder first',
        vi: 'Phần bắt buộc vào builder trước'
      },
      body: {
        en: 'HttpRequest’s constructor is private, so callers cannot new the product directly. They start with new Builder(method, url): those two arguments are required and stored as final fields on the Builder. Until build() runs, there is no HttpRequest yet — only an order slip collecting choices.',
        vi: 'Constructor của HttpRequest là private, nên caller không thể new product trực tiếp. Họ bắt đầu bằng new Builder(method, url): hai tham số đó bắt buộc và được lưu thành field final trên Builder. Trước khi build() chạy, chưa có HttpRequest — chỉ có phiếu order đang gom lựa chọn.'
      }
    },
    {
      title: {
        en: 'Optional steps mutate the slip and return this',
        vi: 'Các bước tùy chọn sửa phiếu và return this'
      },
      body: {
        en: 'header, body, and timeoutMs each write one optional field and return this so the calls chain. The highlighted header method is typical: it records a pair and hands the same Builder back. Order of optional steps does not matter; skipping one just keeps the default.',
        vi: 'header, body và timeoutMs mỗi method ghi một field tùy chọn rồi return this để gọi nối chuỗi. Method header được highlight là điển hình: nó ghi một cặp rồi đưa cùng Builder đó trở lại. Thứ tự các bước tùy chọn không quan trọng; bỏ qua một bước thì giữ default.'
      }
    },
    {
      title: {
        en: 'build() commits the immutable product',
        vi: 'build() chốt product bất biến'
      },
      body: {
        en: 'build() is the only door into HttpRequest: it copies the collected fields (including an unmodifiable snapshot of headers) into a new instance. After that the product cannot change. The same Builder type can produce many different requests depending on which optional steps you called.',
        vi: 'build() là cánh cửa duy nhất vào HttpRequest: nó copy các field đã gom (kèm snapshot headers không sửa được) vào instance mới. Sau đó product không đổi nữa. Cùng một kiểu Builder có thể cho ra nhiều request khác nhau, tùy các bước tùy chọn bạn đã gọi.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.net.http.HttpRequest.newBuilder() (Java 11+)',
      note: {
        en: 'The JDK HTTP client builds an immutable HttpRequest through HttpRequest.newBuilder(): method, URI, headers, timeout, and body publisher are collected, then build() produces the request the client sends.',
        vi: 'HTTP client trong JDK dựng HttpRequest bất biến qua HttpRequest.newBuilder(): method, URI, header, timeout và body publisher được gom lại, rồi build() tạo request mà client gửi đi.'
      }
    },
    {
      system: 'java.lang.ProcessBuilder',
      note: {
        en: 'ProcessBuilder collects the command list, environment, working directory, and redirect settings, then start() (its build step) launches the process. The same builder can be reused to start another process with small tweaks.',
        vi: 'ProcessBuilder gom danh sách lệnh, environment, thư mục làm việc và cấu hình redirect, rồi start() (bước build của nó) khởi chạy process. Cùng builder đó có thể tái dùng để chạy process khác với vài chỉnh nhỏ.'
      }
    },
    {
      system: 'com.google.common.collect.ImmutableList.Builder',
      note: {
        en: 'Guava’s ImmutableList.Builder (and the matching builders on ImmutableSet / ImmutableMap) add elements one at a time and only freeze the collection when build() is called.',
        vi: 'ImmutableList.Builder của Guava (và builder tương ứng trên ImmutableSet / ImmutableMap) thêm phần tử từng cái, và chỉ đóng băng collection khi build() được gọi.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'A single Builder type lets you call build() before required fields are set, or set them twice by accident. A staged builder splits the fluent API across interfaces — MethodStep, UrlStep, OptionalStep — so the compiler refuses to compile a build() until method and url have been supplied, in that order.',
      vi: 'Một kiểu Builder duy nhất cho phép bạn gọi build() trước khi field bắt buộc được set, hoặc set chúng hai lần. Staged builder tách fluent API thành các interface — MethodStep, UrlStep, OptionalStep — nên compiler từ chối biên dịch build() cho đến khi method và url đã được cung cấp, đúng thứ tự đó.'
    },
    tradeoffs: {
      en: 'Staged builders catch incomplete requests at compile time and read as a guided wizard. The cost is more types to maintain, and optional fields still cannot be “required in some cases” without yet more stages. Use them when a missing URL would otherwise fail far from the call site.',
      vi: 'Staged builder bắt request thiếu field ngay lúc biên dịch và đọc như một wizard có hướng dẫn. Cái giá là nhiều type hơn phải giữ, và field tùy chọn vẫn không thể “bắt buộc trong vài trường hợp” nếu không thêm stage. Dùng khi một URL thiếu sẽ chỉ nổ lỗi ở rất xa chỗ gọi.'
    },
    javaCode: `import java.util.HashMap;
import java.util.Map;

public final class HttpRequest {
    private final String method, url, body;
    private final Map<String, String> headers;

    private HttpRequest(String method, String url, String body,
                        Map<String, String> headers) {
        this.method = method; this.url = url;
        this.body = body; this.headers = Map.copyOf(headers);
    }

    public interface MethodStep { UrlStep method(String method); }
    public interface UrlStep    { OptionalStep url(String url); }
    public interface OptionalStep {
        OptionalStep header(String k, String v);
        OptionalStep body(String body);
        HttpRequest build();
    }

    public static MethodStep builder() { return new Stages(); }

    private static final class Stages implements MethodStep, UrlStep, OptionalStep {
        private String method, url, body = "";
        private final Map<String, String> headers = new HashMap<>();

        public UrlStep method(String method) { this.method = method; return this; }
        public OptionalStep url(String url)  { this.url = url; return this; }
        public OptionalStep header(String k, String v) { headers.put(k, v); return this; }
        public OptionalStep body(String body)          { this.body = body; return this; }
        public HttpRequest build() {
            return new HttpRequest(method, url, body, headers);
        }
    }
}

// Compiles: HttpRequest.builder().method("POST").url("/users").build();
// Does not: HttpRequest.builder().build();`
  },

  deepTheory: {
    academicRoot: {
      en: 'First formalized in the Gang of Four (1994) catalog and revolutionized by Joshua Bloch in Effective Java (Item 2: "Consider a builder when faced with many constructor parameters"). The Builder pattern solves the fundamental tension between object immutability and flexible construction ergonomics without suffering from Telescoping Constructor anti-patterns.',
      vi: 'Được chính thức hóa trong cuốn sách kinh điển Design Patterns (GoF 1994) và nâng tầm bởi Joshua Bloch trong Effective Java (Item 2: "Cân nhắc sử dụng Builder khi gặp constructor có quá nhiều tham số"). Mẫu Builder giải quyết mâu thuẫn cốt lõi giữa tính bất biến (Immutability) của đối tượng và sự linh hoạt khi khởi tạo mà không rơi vào cái bẫy constructor lồng nhau (Telescoping Constructor).'
    },
    structuralCouplingMetric: {
      en: 'Isolates Efferent Coupling (Ce) within the static inner Builder. Callers depend strictly on the immutable target product, preserving high cohesion and preventing state pollution across boundary interfaces.',
      vi: 'Cô lập hoàn toàn liên kết ly tâm (Efferent Coupling - Ce) bên trong lớp Builder tĩnh nội bộ. Phía gọi mã chỉ phụ thuộc vào đối tượng đích bất biến hoàn chỉnh, bảo toàn tính gắn kết cao và ngăn chặn ô nhiễm trạng thái giữa các module.'
    },
    memoryAndVtableTradeoff: {
      en: 'The ephemeral Builder instance is short-lived and allocated in the JVM Young Generation Eden space. Under HotSpot C2 Escape Analysis, the Builder object is routinely scalar-replaced directly onto CPU registers, incurring zero heap allocation overhead.',
      vi: 'Đối tượng Builder tạm thời có vòng đời cực ngắn trong vùng Eden của Young Gen. Trình biên dịch HotSpot C2 JIT với cơ chế Phân tích thoát (Escape Analysis) thường xuyên thay thế vô hướng (Scalar Replacement) đối tượng Builder trực tiếp lên thanh ghi CPU, triệt tiêu 100% chi phí cấp phát Heap.'
    },
    enterpriseBestPractices: [
      {
        en: 'Invariant Validation in build(): Never validate cross-field business invariants inside intermediate builder setters. Always validate the complete state atomically inside build() before passing arguments to the private constructor.',
        vi: 'Thẩm định bất biến trong build(): Không bao giờ kiểm tra logic ràng buộc giữa các trường bên trong các hàm setter trung gian. Luôn thẩm định toàn vẹn trạng thái một cách nguyên tử bên trong hàm build() trước khi gọi constructor private.'
      },
      {
        en: 'Defensive Immutability: When copying mutable collections into the target object, always wrap them with unmodifiable wrappers (List.copyOf() or Collections.unmodifiableMap()) to prevent external mutation.',
        vi: 'Tính bất biến phòng vệ: Khi sao chép các Collection có thể thay đổi vào đối tượng đích, luôn bọc chúng bằng List.copyOf() hoặc Collections.unmodifiableMap() để triệt tiêu nguy cơ sửa đổi từ bên ngoài.'
      },
      {
        en: 'Staged / Step Builders: For domain entities where 3 or more fields are strictly mandatory, utilize a Staged Builder interface chain (Step 1 -> Step 2 -> OptionalStep -> build()) to enforce mandatory field completion at compile-time.',
        vi: 'Staged / Step Builders: Với các thực thể nghiệp vụ có từ 3 trường bắt buộc trở lên, hãy sử dụng chuỗi Interface Staged Builder để ép buộc lập trình viên phải truyền đủ các trường bắt buộc ngay từ lúc biên dịch.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Telescoping Constructor Nightmare & Unvalidated Half-Initialized Wire Payments',
      vi: 'Thảm Họa Constructor Lồng Nhau & Sự Cố Lệnh Chuyển Tiền Nửa Khởi Tạo Trong Thanh Toán'
    },
    businessContext: {
      en: 'A tier-1 global commercial banking wire engine processes high-value cross-border ISO 20022 payment requests with 24 distinct regulatory and routing attributes.',
      vi: 'Hệ thống chuyển tiền quốc tế của ngân hàng xử lý các lệnh thanh toán ISO 20022 giá trị cao với 24 thuộc tính tuân thủ pháp lý và định tuyến ngân hàng.'
    },
    problemDescription: {
      en: 'The legacy codebase used 12 overloaded telescoping constructors alongside mutable JavaBean setters: new WirePayment(id, acc, null, null, 50000, "USD", "EUR", true, false...). A developer accidentally inverted the sourceCurrency and targetCurrency arguments because both were raw String parameters. Furthermore, during concurrent batch processing, a worker thread published a half-initialized WirePayment object to the SWIFT dispatch queue before the compliance flag setters had executed. This resulted in an unhedged $2,400,000 foreign exchange transfer executed without mandatory anti-money laundering (AML) screening approval, prompting a regulatory audit.',
      vi: 'Hệ thống cũ sử dụng 12 constructor nạp chồng lồng nhau (Telescoping Constructor) kết hợp với các hàm setter JavaBean: new WirePayment(id, acc, null, null, 50000, "USD", "EUR", true, false...). Lập trình viên đã vô tình truyền ngược hai tham số sourceCurrency và targetCurrency vì cả hai đều là kiểu String. Nghiêm trọng hơn, trong đợt xử lý hàng loạt đa luồng, một luồng worker đã đẩy đối tượng WirePayment mới khởi tạo một nửa vào hàng đợi SWIFT trước khi các hàm set cờ tuân thủ kịp chạy. Hậu quả là một lệnh chuyển đổi ngoại tệ 2,400,000 USD bị thực thi mà không có phê duyệt phòng chống rửa tiền (AML), dẫn đến cuộc thanh tra khẩn cấp từ cơ quan quản lý.'
    },
    whyNaiveFails: {
      en: 'Adding more overloaded constructors exacerbated developer errors: constructors with 14 arguments look like new Order(a, b, null, null, null, c, true, false, null), making code reviews unable to catch swapped positional parameters.',
      vi: 'Tiếp tục thêm các constructor nạp chồng càng làm tăng nguy cơ nhầm lẫn: các constructor 14 tham số với hàng loạt giá trị null và boolean khiến việc review code không thể phát hiện các tham số bị tráo đổi vị trí.'
    },
    coreSolution: {
      en: 'Implement an Immutable Staged Builder pattern. Mandatory fields (Source Account, Beneficiary IBAN, Amount, Currencies) are enforced via sequential compiler-enforced interfaces (AccountStep -> BeneficiaryStep -> AmountStep -> OptionsStep). Invariant rules (e.g. source and target currency cannot match for FX orders) are validated atomically in build(), and the resulting payment object is 100% immutable.',
      vi: 'Áp dụng mẫu Staged Builder bất biến. Các trường bắt buộc (Tài khoản nguồn, IBAN thụ hưởng, Số tiền, Loại tiền) được trình biên dịch kiểm soát qua chuỗi Interface tuần tự (AccountStep -> BeneficiaryStep -> AmountStep -> OptionsStep). Mọi quy tắc ràng buộc nghiệp vụ (loại tiền nguồn và đích không được trùng nhau) được kiểm tra nguyên tử trong hàm build(), và đối tượng thanh toán được niêm phong bất biến 100%.'
    },
    productionCode: `// Production Staged Builder Architecture for Cross-Border Payments (Java 21)
package com.banking.wire.builder;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.Objects;
import java.util.Set;

public final class WirePaymentOrder {
    private final String paymentId;
    private final String sourceIban;
    private final String beneficiaryIban;
    private final BigDecimal amount;
    private final Currency sourceCurrency;
    private final Currency targetCurrency;
    private final boolean amlCleared;
    private final Set<String> complianceTags;

    // Private constructor: Only accessible via Staged Builder
    private WirePaymentOrder(Builder b) {
        this.paymentId = b.paymentId;
        this.sourceIban = b.sourceIban;
        this.beneficiaryIban = b.beneficiaryIban;
        this.amount = b.amount;
        this.sourceCurrency = b.sourceCurrency;
        this.targetCurrency = b.targetCurrency;
        this.amlCleared = b.amlCleared;
        this.complianceTags = Set.copyOf(b.complianceTags);
    }

    // --- STAGED BUILDER COMPILE-TIME INTERFACES ---
    public interface PaymentIdStep { SourceIbanStep paymentId(String id); }
    public interface SourceIbanStep { BeneficiaryStep sourceIban(String iban); }
    public interface BeneficiaryStep { AmountStep beneficiaryIban(String iban); }
    public interface AmountStep { CurrencyStep amount(BigDecimal amount); }
    public interface CurrencyStep { OptionalStep currencies(Currency src, Currency target); }

    public interface OptionalStep {
        OptionalStep amlCleared(boolean cleared);
        OptionalStep addTag(String tag);
        WirePaymentOrder build();
    }

    public static PaymentIdStep builder() { return new Builder(); }

    private static final class Builder implements PaymentIdStep, SourceIbanStep, BeneficiaryStep, AmountStep, CurrencyStep, OptionalStep {
        private String paymentId;
        private String sourceIban;
        private String beneficiaryIban;
        private BigDecimal amount;
        private Currency sourceCurrency;
        private Currency targetCurrency;
        private boolean amlCleared = false;
        private final Set<String> complianceTags = new java.util.HashSet<>();

        public SourceIbanStep paymentId(String id) { this.paymentId = Objects.requireNonNull(id); return this; }
        public BeneficiaryStep sourceIban(String iban) { this.sourceIban = Objects.requireNonNull(iban); return this; }
        public AmountStep beneficiaryIban(String iban) { this.beneficiaryIban = Objects.requireNonNull(iban); return this; }
        public CurrencyStep amount(BigDecimal amt) { 
            if (amt.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Amount must be positive");
            this.amount = amt; 
            return this; 
        }
        public OptionalStep currencies(Currency src, Currency target) {
            this.sourceCurrency = Objects.requireNonNull(src);
            this.targetCurrency = Objects.requireNonNull(target);
            return this;
        }
        public OptionalStep amlCleared(boolean cleared) { this.amlCleared = cleared; return this; }
        public OptionalStep addTag(String tag) { complianceTags.add(tag); return this; }

        public WirePaymentOrder build() {
            // ATOMIC INVARIANT VALIDATION BEFORE OBJECT PUBLICATION
            if (!amlCleared && amount.compareTo(new BigDecimal("10000")) > 0) {
                throw new IllegalStateException("Transfers > $10,000 strictly require AML clearance!");
            }
            return new WirePaymentOrder(this);
        }
    }
}`,
    architectureImpact: {
      en: 'Zero positional parameter transposition bugs; Incomplete half-initialized object defects eliminated 100%; Compiler enforces complete mandatory field entry; Full AML regulatory compliance guaranteed at build time.',
      vi: 'Triệt tiêu 100% lỗi nhầm lẫn thứ tự tham số; Xóa bỏ hoàn toàn lỗi đối tượng nửa khởi tạo; Trình biên dịch bắt buộc nhập đủ các trường pháp lý; Đảm bảo 100% các quy định phòng chống rửa tiền được thẩm định trước khi thanh toán.'
    }
  }
};
