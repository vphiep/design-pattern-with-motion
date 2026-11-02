import type { Pattern } from '../types';

export const adapter: Pattern = {
  id: 'adapter',
  category: 'structural',
  name: 'Adapter',
  tagline: {
    en: 'Wrap an object with a different interface so it fits where it doesn’t natively belong.',
    vi: 'Bọc một object bằng một interface khác để nó lắp vừa vào chỗ mà vốn dĩ nó không khớp.'
  },
  analogy: {
    en: 'A travel power adapter. Your laptop plug is flat and American; the wall socket is round and European. The adapter doesn’t change the electricity — it just changes the shape so the two can talk. The Adapter pattern is the same: it makes an existing class usable in code that expects a different shape.',
    vi: 'Chiếc adapter chuyển đổi ổ cắm khi đi du lịch. Phích cắm laptop của bạn là chân dẹt kiểu Mỹ; ổ điện trên tường lại là lỗ tròn kiểu châu Âu. Adapter không thay đổi dòng điện — nó chỉ đổi hình dạng để hai bên nói chuyện được với nhau. Pattern Adapter cũng vậy: nó giúp một class sẵn có dùng được trong đoạn code đang mong đợi một “hình dạng” khác.'
  },
  whenToUse: [
    {
      en: 'You want to use an existing class, but its interface doesn’t match the one your code expects.',
      vi: 'Bạn muốn dùng một class sẵn có, nhưng interface của nó không khớp với interface mà code của bạn mong đợi.'
    },
    {
      en: 'You want to integrate a third-party library without changing your own code to match its types.',
      vi: 'Bạn muốn tích hợp một thư viện bên thứ ba mà không phải sửa code của mình cho khớp với các kiểu dữ liệu của thư viện đó.'
    },
    {
      en: 'You want to translate between two systems that evolved separately.',
      vi: 'Bạn cần “phiên dịch” giữa hai hệ thống vốn phát triển độc lập với nhau.'
    }
  ],
  whenNotToUse: [
    {
      en: 'You control both sides — change the interface directly instead of wrapping.',
      vi: 'Bạn kiểm soát cả hai phía — hãy sửa thẳng interface thay vì bọc thêm một lớp.'
    },
    {
      en: 'The mismatch is so small that an adapter hides more than it helps.',
      vi: 'Chỗ lệch nhau quá nhỏ, đến mức thêm adapter chỉ che khuất code chứ chẳng giúp được gì.'
    }
  ],
  difficulty: 1,
  order: 6,
  javaCode: `// The interface your code expects.
interface PaymentGateway {
    void charge(int cents);
    boolean wasSuccessful();
}

// A third-party library that uses a different shape.
final class StripeApi {
    public boolean createCharge(int amountInCents, String currency) {
        System.out.println("Stripe: charging " + amountInCents + " " + currency);
        return true;
    }
}

// The adapter: it implements the interface your code uses, and
// translates calls into the third-party API.
final class StripeAdapter implements PaymentGateway {
    private final StripeApi stripe = new StripeApi();
    private boolean ok = false;

    @Override public void charge(int cents) {
        ok = stripe.createCharge(cents, "USD");
    }
    @Override public boolean wasSuccessful() { return ok; }
}

// Your code only sees PaymentGateway, never StripeApi directly.
// To swap providers, you write a new adapter — nothing else changes.`,
  steps: [
    {
      title: {
        en: 'The interface your code expects',
        vi: 'Interface mà code của bạn mong đợi'
      },
      body: {
        en: 'Your application is written against the PaymentGateway interface: it calls charge(cents) and later checks wasSuccessful(). This is the “shape of the plug” your code was designed for — nothing in your codebase knows or cares which payment provider actually sits behind it.',
        vi: 'Ứng dụng của bạn được viết dựa trên interface PaymentGateway: nó gọi charge(cents) rồi sau đó kiểm tra wasSuccessful(). Đây chính là “hình dạng phích cắm” mà code của bạn được thiết kế cho — không chỗ nào trong codebase biết hay quan tâm nhà cung cấp thanh toán nào đang thực sự đứng phía sau.'
      }
    },
    {
      title: {
        en: 'The class you actually have',
        vi: 'Class mà bạn thực sự có trong tay'
      },
      body: {
        en: 'StripeApi is the third-party library — it does the real work, but in a different shape. Its method is createCharge(amountInCents, currency): a different name, a different parameter list, and it returns a boolean instead of storing a status. Because it doesn’t implement PaymentGateway, you can’t plug it into your code directly.',
        vi: 'StripeApi là thư viện bên thứ ba — nó mới là bên làm việc thật, nhưng theo một “hình dạng” khác. Method của nó là createCharge(amountInCents, currency): tên khác, danh sách tham số khác, và trả thẳng về boolean thay vì lưu trạng thái. Vì nó không implement PaymentGateway, bạn không thể cắm thẳng nó vào code của mình.'
      }
    },
    {
      title: {
        en: 'The adapter translates the call',
        vi: 'Adapter phiên dịch lời gọi'
      },
      body: {
        en: 'StripeAdapter implements the PaymentGateway interface your code expects, and holds a StripeApi inside. When someone calls charge(cents), the highlighted line ok = stripe.createCharge(cents, "USD") forwards the request in the vocabulary Stripe understands and remembers the result so wasSuccessful() can answer later. To switch providers, you write one new adapter — the rest of your code never changes.',
        vi: 'StripeAdapter implement đúng interface PaymentGateway mà code của bạn mong đợi, và giữ một StripeApi ở bên trong. Khi ai đó gọi charge(cents), dòng được highlight ok = stripe.createCharge(cents, "USD") chuyển tiếp yêu cầu bằng đúng “ngôn ngữ” mà Stripe hiểu, đồng thời ghi nhớ kết quả để wasSuccessful() trả lời sau. Muốn đổi nhà cung cấp, bạn chỉ cần viết một adapter mới — phần còn lại của code không phải sửa gì.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.io.InputStreamReader',
      note: {
        en: 'InputStreamReader is an adapter shipped in the JDK itself: it wraps a byte-oriented InputStream and exposes it through the character-oriented Reader interface, so text-processing code that expects a Reader can consume a raw byte stream without knowing anything about the bytes underneath.',
        vi: 'InputStreamReader là một adapter nằm ngay trong JDK: nó bọc một InputStream vốn làm việc theo byte và phơi ra qua interface Reader làm việc theo ký tự, nhờ đó code xử lý text chỉ cần một Reader vẫn đọc được stream byte thô mà không cần biết gì về đống byte bên dưới.'
      }
    },
    {
      system: 'java.util.Arrays.asList()',
      note: {
        en: 'Arrays.asList() wraps a plain Java array so it can be used through the List interface. The array itself doesn’t change — the wrapper just lets collection-based code (iteration, indexOf, contains) talk to it in the vocabulary it already speaks.',
        vi: 'Arrays.asList() bọc một mảng Java thuần để nó dùng được qua interface List. Bản thân mảng không thay đổi gì — lớp wrapper chỉ giúp những đoạn code làm việc với collection (duyệt phần tử, indexOf, contains) nói chuyện với mảng bằng đúng “ngôn ngữ” chúng đã quen.'
      }
    }
  ],

  deepTheory: {
    academicRoot: {
      en: 'Formalized in Gang of Four (1994). Converts the interface of a class into another interface clients expect, allowing incompatible classes to collaborate seamlessly. Serves as the primary mechanism for Anti-Corruption Layers (ACL) in Domain-Driven Design (DDD).',
      vi: 'Được chính thức hóa trong Gang of Four (1994). Chuyển đổi giao diện của một lớp thành giao diện khác mà phía client mong đợi, giúp các lớp không tương thích có thể làm việc mượt mà với nhau. Đây là vũ khí nòng cốt để xây dựng Lớp chống suy thoái (Anti-Corruption Layer - ACL) trong kiến trúc hướng miền (DDD).'
    },
    structuralCouplingMetric: {
      en: 'Shields core domain models from external third-party schemas, establishing an architectural boundary that isolates unstable external dependencies.',
      vi: 'Bảo vệ các mô hình nghiệp vụ cốt lõi khỏi cấu trúc dữ liệu của bên thứ ba, tạo lập ranh giới kiến trúc cô lập hoàn toàn các phụ thuộc ngoại vi không ổn định.'
    },
    memoryAndVtableTradeoff: {
      en: 'Minimal memory overhead consisting of a single delegating wrapper reference. Inlined readily by JIT compilers.',
      vi: 'Chi phí bộ nhớ tối thiểu chỉ gồm một con trỏ tham chiếu ủy quyền. Được trình biên dịch JIT inlining dễ dàng.'
    },
    enterpriseBestPractices: [
      {
        en: 'Strict Domain Isolation: Never let third-party or legacy vendor DTOs escape past the Adapter boundary into internal domain services.',
        vi: 'Cách ly miền dữ liệu tuyệt đối: Không bao giờ để các đối tượng DTO của đối tác bên ngoài lọt qua ranh giới của Adapter đi vào các service nghiệp vụ nội bộ.'
      },
      {
        en: 'Robust Error Mapping: Map cryptic third-party error codes into clear domain exceptions within the adapter.',
        vi: 'Ánh xạ lỗi rõ ràng: Chuyển đổi các mã lỗi khó hiểu của hệ thống cũ thành các Exception nghiệp vụ tường minh ngay bên trong Adapter.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Legacy Mainframe SOAP XML Protocol Infiltration & Anti-Corruption Layer Adapter',
      vi: 'Sự Cố Mã Nguồn Bị Ô Nhiễm Bởi Giao Thức SOAP Cũ & Giải Pháp Adapter Anti-Corruption Layer'
    },
    businessContext: {
      en: 'A modern FinTech mobile digital bank interacts with a 25-year-old COBOL/SOAP XML core-banking mainframe backend.',
      vi: 'Ứng dụng ngân hàng số hiện đại kết nối trực tiếp với hệ thống máy chủ ngân hàng cốt lõi (Core Banking) chạy COBOL/SOAP XML có tuổi đời 25 năm.'
    },
    problemDescription: {
      en: 'The legacy core-banking system required complex 400-line SOAP XML envelopes with EBCDIC binary fields and cryptic numeric status codes (e.g. Code 904 = Insufficient Funds). Developers began embedding SOAP parsing logic, JAXB contexts, and XML builders directly inside modern Spring Boot REST controllers. When the mainframe team updated a SOAP header namespace, 16 microservices failed simultaneously, causing mobile app balance check crashes for 800,000 retail banking customers.',
      vi: 'Hệ thống Core Banking cũ đòi hỏi các gói tin SOAP XML phức tạp dài 400 dòng với các trường nhị phân EBCDIC và mã lỗi dạng số tối nghĩa (như Mã 904 là Không đủ số dư). Các lập trình viên đã chèn thẳng mã tạo XML và thư viện JAXB vào bên trong các REST controller hiện đại. Khi đội bảo trì máy chủ cũ thay đổi một namespace trong header của XML, 16 vi dịch vụ bị sập đồng loạt, khiến 800,000 khách hàng không thể kiểm tra số dư trên ứng dụng di động.'
    },
    whyNaiveFails: {
      en: 'Allowing legacy XML structures to bleed across domain services tightly couples modern microservices to 1990s mainframe protocols, creating a fragile architectural nightmare.',
      vi: 'Để các cấu trúc XML cổ lỗ sĩ rò rỉ vào tầng nghiệp vụ sẽ trói buộc toàn bộ hệ thống microservice hiện đại vào các giao thức từ thập niên 90, tạo nên kiến trúc cực kỳ dễ đổ vỡ.'
    },
    coreSolution: {
      en: 'Implement the Adapter pattern as a Domain-Driven Design Anti-Corruption Layer (ACL). The domain interacts strictly with a clean Java interface: CoreBankingPort. The LegacySoapBankingAdapter encapsulates all XML marshalling, JAXB unmarshalling, and converts cryptic status 904 into clean InsufficientFundsException.',
      vi: 'Áp dụng mẫu Adapter làm Lớp chống suy thoái (Anti-Corruption Layer - ACL). Tầng nghiệp vụ chỉ giao tiếp qua một Interface Java sạch sẽ: CoreBankingPort. Lớp LegacySoapBankingAdapter chịu trách nhiệm đóng gói toàn bộ việc parse XML, chuyển đổi mã lỗi 904 thành ngoại lệ InsufficientFundsException tường minh.'
    },
    productionCode: `// Production Anti-Corruption Layer Adapter Architecture (Java 21)
package com.banking.adapter.acl;

import java.math.BigDecimal;

// Clean Modern Domain Interface
public interface CoreBankingPort {
    AccountBalance getBalance(String accountNumber);
}

public record AccountBalance(String accountNumber, BigDecimal availableBalance) {}

// Concrete Adapter wrapping messy Legacy SOAP XML Mainframe
public class LegacySoapBankingAdapter implements CoreBankingPort {
    private final LegacySoapMainframeClient soapClient;

    public LegacySoapBankingAdapter(LegacySoapMainframeClient client) {
        this.soapClient = client;
    }

    @Override
    public AccountBalance getBalance(String accountNumber) {
        // 1. Adapt clean domain call into legacy SOAP XML request
        String soapXml = "<soap:Envelope><acc>" + accountNumber + "</acc></soap:Envelope>";
        String rawXmlResponse = soapClient.sendRawSoap(soapXml);

        // 2. Parse legacy response and translate cryptic status codes
        if (rawXmlResponse.contains("<status>904</status>")) {
            throw new RuntimeException("Account Not Found or Locked in Mainframe");
        }

        BigDecimal balance = parseBalanceFromXml(rawXmlResponse);
        return new AccountBalance(accountNumber, balance);
    }

    private BigDecimal parseBalanceFromXml(String xml) { return new BigDecimal("12500.50"); }
}

public interface LegacySoapMainframeClient { String sendRawSoap(String xml); }`,
    architectureImpact: {
      en: '16 microservices completely decoupled from mainframe SOAP changes; Zero legacy XML pollution in domain code; Core banking integration test failures dropped by 94%.',
      vi: '16 vi dịch vụ được cách ly hoàn toàn khỏi các thay đổi của máy chủ cũ; Triệt tiêu 100% mã XML rác trong code nghiệp vụ; Số vụ lỗi tích hợp Core Banking giảm 94%.'
    }
  }
};
