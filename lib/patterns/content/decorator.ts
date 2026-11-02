import type { Pattern } from '../types';

export const decorator: Pattern = {
  id: 'decorator',
  category: 'structural',
  name: 'Decorator',
  tagline: {
    en: 'Wrap an object to add new behavior at runtime, without touching its class.',
    vi: 'Bọc một object để thêm hành vi mới lúc runtime, mà không sửa class của nó.'
  },
  analogy: {
    en: 'A plain coffee. Add milk: same coffee, new behavior (creamier, more calories). Add a shot of espresso: same coffee-with-milk, even stronger. Each addition is a decorator — it wraps the previous drink and adds something on top, instead of inventing a new class for every combination.',
    vi: 'Một ly cà phê trần. Thêm sữa: vẫn ly đó, hành vi mới (béo hơn, nhiều calo hơn). Thêm một shot espresso: vẫn ly cà phê-sữa, mạnh hơn nữa. Mỗi lần thêm là một decorator — nó bọc ly trước đó và chồng thêm thứ gì đó, thay vì invent một class mới cho mọi tổ hợp.'
  },
  whenToUse: [
    {
      en: 'You want to add responsibilities to objects dynamically, without affecting other objects.',
      vi: 'Bạn muốn thêm trách nhiệm cho object một cách động, mà không ảnh hưởng object khác.'
    },
    {
      en: 'Subclassing would explode the number of classes (CoffeeWithMilk, CoffeeWithSugar, CoffeeWithMilkAndSugar, …).',
      vi: 'Subclass sẽ làm nổ số class (CoffeeWithMilk, CoffeeWithSugar, CoffeeWithMilkAndSugar, …).'
    },
    {
      en: 'You want behavior to be composable — add, remove, or reorder features at runtime.',
      vi: 'Bạn muốn hành vi ghép được — thêm, bớt, hoặc đổi thứ tự feature lúc runtime.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The behavior is a core part of the object and should always be present — just put it in the class.',
      vi: 'Hành vi là phần cốt của object và luôn phải có — hãy để thẳng trong class.'
    },
    {
      en: 'You find yourself debugging many layers of wrapping and losing track of order — that’s a smell.',
      vi: 'Bạn thấy mình debug cả đống lớp bọc và mất dấu thứ tự — đó là mùi code.'
    }
  ],
  difficulty: 2,
  order: 9,
  javaCode: `// The component both the real thing and its decorators implement.
interface Text {
    String render();
}

// A concrete component.
final class PlainText implements Text {
    private final String content;
    PlainText(String content) { this.content = content; }
    public String render() { return content; }
}

// Base decorator: also a Text, holding another Text inside (the one it wraps).
abstract class TextDecorator implements Text {
    protected final Text inner;
    protected TextDecorator(Text inner) { this.inner = inner; }
}
final class Bold extends TextDecorator {
    Bold(Text inner) { super(inner); }
    public String render() { return "<b>" + inner.render() + "</b>"; }
}
final class Italic extends TextDecorator {
    Italic(Text inner) { super(inner); }
    public String render() { return "<i>" + inner.render() + "</i>"; }
}

// Compose at runtime:
//   Text t = new Bold(new Italic(new PlainText("hi")));
//   t.render();  ->  "<b><i>hi</i></b>"
// No new class needed for "bold italic".`,
  steps: [
    {
      title: {
        en: 'Start with a plain object that already fits the interface',
        vi: 'Bắt đầu với object trần đã khớp interface'
      },
      body: {
        en: 'PlainText implements Text and render() returns the raw string. That object is a complete, usable Text on its own. Decorators will wrap it, but they do not replace it — there is always a real component at the center of the stack.',
        vi: 'PlainText implement Text và render() trả về chuỗi thô. Object đó tự nó đã là một Text dùng được. Decorator sẽ bọc nó, nhưng không thay nó — luôn có một component thật ở giữa chồng.'
      }
    },
    {
      title: {
        en: 'A decorator is also a Text, holding a Text',
        vi: 'Decorator cũng là Text, và cầm một Text'
      },
      body: {
        en: 'TextDecorator implements the same Text interface and stores protected final Text inner — the object it wraps. Because a decorator is a Text, it can wrap another decorator. That “is-a plus has-a” pairing is what lets you stack Bold around Italic around PlainText.',
        vi: 'TextDecorator implement cùng interface Text và giữ protected final Text inner — object nó bọc. Vì decorator cũng là Text, nó bọc được decorator khác. Cặp “is-a cộng has-a” đó cho phép bạn chồng Bold ngoài Italic ngoài PlainText.'
      }
    },
    {
      title: {
        en: 'Each layer adds behavior, then forwards inward',
        vi: 'Mỗi lớp thêm hành vi, rồi chuyển tiếp vào trong'
      },
      body: {
        en: 'Bold.render() does not rebuild the string from scratch. The highlighted line return "<b>" + inner.render() + "</b>" asks the inner Text to render first, then wraps the result. Reorder the constructors and you reorder the tags — composition, not a new subclass per combination.',
        vi: 'Bold.render() không dựng lại chuỗi từ đầu. Dòng được highlight return "<b>" + inner.render() + "</b>" hỏi Text bên trong render trước, rồi bọc kết quả. Đổi thứ tự constructor là đổi thứ tự thẻ — composition, không phải subclass mới cho mỗi tổ hợp.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.io.BufferedInputStream / FilterInputStream',
      note: {
        en: 'The java.io stream hierarchy is the textbook decorator: BufferedInputStream, DataInputStream, and GZIPInputStream all extend FilterInputStream, wrap another InputStream, and add buffering, typed reads, or decompression without changing the source class.',
        vi: 'Hệ thống stream trong java.io là decorator kinh điển: BufferedInputStream, DataInputStream và GZIPInputStream đều extends FilterInputStream, bọc một InputStream khác, rồi thêm buffer, đọc theo kiểu, hoặc giải nén mà không sửa class nguồn.'
      }
    },
    {
      system: 'java.util.Collections.synchronizedList() / unmodifiableList()',
      note: {
        en: 'These factory methods return a wrapper that implements List and delegates to the original list, adding a lock or forbidding writes. The wrapped list’s class never changes — only the object you hold does.',
        vi: 'Các factory method này trả về wrapper implement List và ủy quyền cho list gốc, thêm lock hoặc cấm ghi. Class của list bị bọc không đổi — chỉ object bạn cầm trên tay đổi.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Once each layer is “string in, string out”, a class per wrapper is ceremony. Function.andThen composes the same pipeline as Bold(Italic(plain)) with ordinary functions: italic.andThen(bold) applies italic first, then bold — the same nesting, no TextDecorator hierarchy.',
      vi: 'Khi mỗi lớp chỉ là “string vào, string ra”, mỗi wrapper một class trở thành nghi thức. Function.andThen ghép cùng pipeline như Bold(Italic(plain)) bằng function thường: italic.andThen(bold) chạy italic trước, rồi bold — cùng cách lồng, không cần hệ TextDecorator.'
    },
    tradeoffs: {
      en: 'Function composition is tiny and easy to test, but you lose a named type for “a decorated Text” and you cannot hang extra fields on a layer (a Bold that also tracks a CSS class needs an object again). Keep class decorators when layers have state or when the component interface is wider than one method.',
      vi: 'Function composition thì nhỏ và dễ test, nhưng bạn mất một kiểu có tên cho “Text đã được decorate” và không gắn thêm field lên một lớp (một Bold còn giữ class CSS thì lại cần object). Giữ decorator dạng class khi lớp có state, hoặc khi interface của component rộng hơn một method.'
    },
    javaCode: `import java.util.function.Function;

// Each decorator is a Function<String, String>. andThen stacks them
// the same way Bold(new Italic(...)) does, without a class per layer.
final class Decorators {
    static final Function<String, String> bold =
        s -> "<b>" + s + "</b>";
    static final Function<String, String> italic =
        s -> "<i>" + s + "</i>";

    static String render(String raw, Function<String, String> pipeline) {
        return pipeline.apply(raw);
    }
}

// italic first (inner), then bold (outer) — same nesting as the standard example.
// Function<String, String> pipeline = Decorators.italic.andThen(Decorators.bold);
// Decorators.render("hi", pipeline);  ->  "<b><i>hi</i></b>"`
  },

  deepTheory: {
    academicRoot: {
      en: 'Formalized in the Gang of Four (1994) catalog. The Decorator pattern adheres to the Single Responsibility Principle and the Open-Closed Principle by attaching additional responsibilities to an object dynamically without modifying the underlying class or triggering combinatorial 2^N subclass explosion.',
      vi: 'Được chính thức hóa trong cuốn sách Gang of Four (1994). Mẫu Decorator tuân thủ nguyên lý Đơn trách nhiệm (SRP) và Đóng/Mở (OCP) bằng cách gắn thêm các trách nhiệm mới cho đối tượng lúc runtime mà không cần sửa đổi lớp lõi hay gây ra sự bùng nổ tổ hợp lớp con 2^N.'
    },
    structuralCouplingMetric: {
      en: 'Replaces static inheritance coupling with dynamic composition. Both wrapper and wrapped component conform to the identical interface, allowing transparent recursive stacking.',
      vi: 'Thay thế sự gắn kết chặt của kế thừa tĩnh bằng ghép nối động. Cả lớp vỏ bọc và đối tượng bên trong đều thực thi cùng một interface, cho phép xếp chồng các lớp xử lý đệ quy trong suốt.'
    },
    memoryAndVtableTradeoff: {
      en: 'Introduces a chain of lightweight heap object references. HotSpot C2 JIT inlines monomorphic decorator chains, eliminating function call overhead in steady-state execution.',
      vi: 'Tạo ra một chuỗi các con trỏ đối tượng nhẹ trên Heap. Trình biên dịch HotSpot C2 JIT tự động inlining các chuỗi decorator đơn hình, triệt tiêu chi phí gọi hàm lúc chạy ổn định.'
    },
    enterpriseBestPractices: [
      {
        en: 'Preserve Interface Transparency: Decorators must never add public methods not defined on the component interface; clients should be oblivious to the presence of wrappers.',
        vi: 'Bảo toàn tính trong suốt của Interface: Decorator không bao giờ được thêm các hàm public nằm ngoài interface; phía client hoàn toàn không cần biết đối tượng có bị bọc hay không.'
      },
      {
        en: 'Order Sensitivity Awareness: Be explicitly mindful of decorator execution order (e.g. Decrypt before Decompress, Log after Validation).',
        vi: 'Nhận thức thứ tự thực thi: Luôn chú ý thứ tự bọc các lớp (ví dụ: Giải mã trước khi Giải nén, Ghi log sau khi Thẩm định).'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'API Gateway Security Filter Combinatorial Subclass Explosion (2^N Dilemma)',
      vi: 'Bùng Nổ Tổ Hợp 32 Lớp Con (2^N) Trong Bộ Lọc Bảo Mật API Gateway & Lỗ Hổng Bỏ Sót Mã Hóa'
    },
    businessContext: {
      en: 'A high-throughput enterprise banking gateway processes financial request payloads requiring HMAC signature validation, rate limiting, AES-GCM payload decryption, Prometheus metrics, and audit logging.',
      vi: 'Cổng API Gateway ngân hàng xử lý các gói tin thanh toán yêu cầu xác thực chữ ký HMAC, giới hạn tần suất (Rate Limit), giải mã dữ liệu AES-GCM, đo lường Prometheus và ghi sổ kiểm toán.'
    },
    problemDescription: {
      en: 'Developers initially modeled orthogonal security requirements using inheritance: EncryptedCompressedOrderService, SignedEncryptedOrderService, LoggedSignedEncryptedOrderService... With 5 security behaviors, this led to a nightmare of 2^5 = 32 combinatorial subclasses! When the security team patched an AES-GCM IV nonce reuse vulnerability, they missed updating 4 obscure subclasses. A critical payment endpoint remained unpatched, permitting replay attacks that resulted in $320,000 in unauthorized merchant transfers.',
      vi: 'Nhóm phát triển ban đầu mô hình hóa các yêu cầu bảo mật bằng kế thừa: EncryptedCompressedOrderService, SignedEncryptedOrderService... Với 5 hành vi độc lập, hệ thống bị bùng nổ tổ hợp thành 2^5 = 32 lớp con chồng chéo! Khi đội ngũ bảo mật vá lỗi tái sử dụng IV nonce trong thuật toán AES-GCM, họ đã bỏ quên 4 lớp con ít dùng. Một endpoint thanh toán trọng yếu không được cập nhật bản vá, mở đường cho cuộc tấn công phát lại (Replay Attack) làm thất thoát 320,000 USD.'
    },
    whyNaiveFails: {
      en: 'Class inheritance is static and compile-time; it cannot compose orthogonal features dynamically at runtime based on incoming HTTP request headers.',
      vi: 'Kế thừa class là cơ chế tĩnh lúc biên dịch; nó không thể kết hợp linh hoạt các tính năng độc lập lúc chạy dựa trên header của từng HTTP request gửi đến.'
    },
    coreSolution: {
      en: 'Decompose orthogonal concerns into lightweight Decorators conforming to GatewayPayloadHandler. Stack wrappers dynamically based on request metadata: new MetricsDecorator(new HmacValidatorDecorator(new AesDecryptorDecorator(new CoreOrderHandler()))).',
      vi: 'Phân rã các mối quan tâm độc lập thành các Decorator nhẹ cùng thực thi GatewayPayloadHandler. Xếp chồng các lớp bọc linh hoạt dựa trên header: new MetricsDecorator(new HmacValidatorDecorator(new AesDecryptorDecorator(new CoreOrderHandler()))).'
    },
    productionCode: `// Production Composable Gateway Filter Pipeline via Decorator Pattern (Java 21)
package com.gateway.security.decorator;

public interface GatewayPayloadHandler {
    byte[] handle(byte[] payload, String contextId);
}

// Concrete Base Handler
public class CoreOrderProcessingHandler implements GatewayPayloadHandler {
    @Override
    public byte[] handle(byte[] payload, String contextId) {
        // Core business logic: parse order & persist to database
        return "ORDER_PROCESSED_OK".getBytes();
    }
}

// Abstract Decorator
public abstract class GatewayHandlerDecorator implements GatewayPayloadHandler {
    protected final GatewayPayloadHandler delegate;
    public GatewayHandlerDecorator(GatewayPayloadHandler delegate) {
        this.delegate = delegate;
    }
}

// Concrete Decorator 1: HMAC Signature Validator
public class HmacValidationDecorator extends GatewayHandlerDecorator {
    public HmacValidationDecorator(GatewayPayloadHandler delegate) { super(delegate); }
    @Override
    public byte[] handle(byte[] payload, String contextId) {
        if (!verifyHmac(payload)) throw new SecurityException("Invalid HMAC Signature");
        return delegate.handle(payload, contextId);
    }
    private boolean verifyHmac(byte[] p) { return p.length > 0; }
}

// Concrete Decorator 2: AES-GCM Decryptor
public class AesDecryptionDecorator extends GatewayHandlerDecorator {
    public AesDecryptionDecorator(GatewayPayloadHandler delegate) { super(delegate); }
    @Override
    public byte[] handle(byte[] payload, String contextId) {
        byte[] decrypted = decryptAesGcm(payload);
        return delegate.handle(decrypted, contextId);
    }
    private byte[] decryptAesGcm(byte[] p) { return p; }
}`,
    architectureImpact: {
      en: 'Subclasses reduced from 32 down to 5 cohesive decorators; Security patch vulnerabilities reduced to 0; Feature composition is 100% dynamic and unit-testable in complete isolation.',
      vi: 'Số lượng lớp con giảm từ 32 xuống chỉ còn 5 decorator duy nhất; Triệt tiêu 100% lỗi bỏ sót bản vá bảo mật; Việc kết hợp tính năng hoàn toàn linh hoạt và dễ dàng kiểm thử độc lập.'
    }
  }
};
