import type { Pattern } from '../types';

export const chainOfResponsibility: Pattern = {
  id: 'chain-of-responsibility',
  category: 'behavioral',
  name: 'Chain of Responsibility',
  tagline: {
    en: 'Pass a request along a chain of handlers; each one either acts on it or hands it off to the next.',
    vi: 'Đưa request đi dọc một chuỗi handler; mỗi mắt xích hoặc xử lý, hoặc chuyển cho mắt tiếp theo.'
  },
  analogy: {
    en: 'A support ticket. Tier 1 looks at it; if it’s a billing question, tier 1 forwards it to billing. If billing can’t solve it, it forwards to a manager. Nobody knows in advance who’ll fix it — the ticket walks the chain until someone says “I’ve got this.”',
    vi: 'Phiếu hỗ trợ. Tier 1 xem qua; nếu là câu hỏi billing thì chuyển sang billing. Billing không xong thì chuyển lên manager. Không ai biết trước ai sẽ sửa — phiếu đi dọc chuỗi đến khi có người nói “để tôi.”'
  },
  whenToUse: [
    {
      en: 'More than one object might handle a request, and the handler isn’t known in advance.',
      vi: 'Hơn một object có thể xử lý request, và handler không biết trước.'
    },
    {
      en: 'You want to issue a request to one of several objects without specifying the receiver explicitly.',
      vi: 'Bạn muốn gửi request tới một trong vài object mà không chỉ định receiver tường minh.'
    },
    {
      en: 'The set of handlers should be configurable — you may add, remove, or reorder them at runtime.',
      vi: 'Tập handler nên cấu hình được — bạn có thể thêm, bớt, hoặc đổi thứ tự lúc runtime.'
    }
  ],
  whenNotToUse: [
    {
      en: 'Every request has exactly one known handler — calling it directly is clearer.',
      vi: 'Mỗi request có đúng một handler biết trước — gọi trực tiếp rõ hơn.'
    },
    {
      en: 'You find requests getting lost or silently dropped; that’s a smell, not a design.',
      vi: 'Bạn thấy request bị lạc hoặc rơi im lặng; đó là mùi, không phải thiết kế.'
    }
  ],
  difficulty: 2,
  order: 13,
  javaCode: `// The handler: knows its successor and either handles or passes on.
abstract class SupportHandler {
    private SupportHandler next;
    public SupportHandler linkWith(SupportHandler next) { this.next = next; return next; }
    public void handle(String issue) {
        if (canHandle(issue)) resolve(issue);
        else if (next != null) next.handle(issue);
        else System.out.println("nobody could handle: " + issue);
    }
    protected abstract boolean canHandle(String issue);
    protected abstract void resolve(String issue);
}
final class BillingHandler extends SupportHandler {
    protected boolean canHandle(String i) { return i.startsWith("billing"); }
    protected void resolve(String i)      { System.out.println("Billing handled: " + i); }
}
final class TechHandler extends SupportHandler {
    protected boolean canHandle(String i) { return i.startsWith("tech"); }
    protected void resolve(String i)      { System.out.println("Tech handled:   " + i); }
}

// Build the chain: billing -> tech -> (fallback).
// SupportHandler billing = new BillingHandler();
// billing.linkWith(new TechHandler());
// billing.handle("tech: my laptop is on fire");`,
  steps: [
    {
      title: {
        en: 'Handlers are linked into a chain',
        vi: 'Các handler được nối thành chuỗi'
      },
      body: {
        en: 'SupportHandler holds a next pointer. linkWith(next) stores the successor and returns it so you can write billing.linkWith(new TechHandler()) as a fluent chain. The request does not know this list; it only ever enters at the head.',
        vi: 'SupportHandler giữ một pointer next. linkWith(next) lưu successor và return nó để bạn viết billing.linkWith(new TechHandler()) thành chuỗi fluent. Request không biết list này; nó chỉ bước vào từ đầu chuỗi.'
      }
    },
    {
      title: {
        en: 'Each handler either takes the ticket or passes it',
        vi: 'Mỗi handler hoặc nhận phiếu, hoặc chuyển tiếp'
      },
      body: {
        en: 'handle(issue) is the walk. The highlighted if (canHandle(issue)) asks this node whether the ticket is theirs; if not, next.handle(issue) continues the walk. BillingHandler only claims strings that start with “billing”; everything else keeps moving.',
        vi: 'handle(issue) là bước đi. Dòng if (canHandle(issue)) được highlight hỏi node này phiếu có phải của mình không; nếu không, next.handle(issue) đi tiếp. BillingHandler chỉ nhận chuỗi bắt đầu bằng “billing”; mọi thứ khác tiếp tục đi.'
      }
    },
    {
      title: {
        en: 'Someone on the chain resolves it',
        vi: 'Ai đó trên chuỗi giải quyết'
      },
      body: {
        en: 'When canHandle is true, resolve(issue) runs and the chain stops. TechHandler.resolve prints “Tech handled” for a tech ticket. If nobody claims the issue, the head’s fallback prints that nobody could handle it — the ticket must not vanish silently.',
        vi: 'Khi canHandle đúng, resolve(issue) chạy và chuỗi dừng. TechHandler.resolve in “Tech handled” cho phiếu tech. Nếu không ai nhận, fallback ở đầu chuỗi in rằng không ai xử lý được — phiếu không được biến mất im lặng.'
      }
    }
  ],
  realSystems: [
    {
      system: 'Jakarta Servlet — jakarta.servlet.Filter',
      note: {
        en: 'A FilterChain is literally this pattern: each Filter either writes a response or calls chain.doFilter(request, response) so the next filter (and eventually the servlet) can run. Order is configuration, not hard-wired calls.',
        vi: 'FilterChain đúng nghĩa là pattern này: mỗi Filter hoặc ghi response, hoặc gọi chain.doFilter(request, response) để filter tiếp (và cuối cùng là servlet) chạy. Thứ tự đến từ cấu hình, không phải lời gọi hard-wire.'
      }
    },
    {
      system: 'java.util.logging.Logger parent handlers',
      note: {
        en: 'A JUL Logger that does not handle a LogRecord can pass it to its parent. Hierarchical loggers are a chain: child → parent → root, each Handler deciding whether to publish.',
        vi: 'Một Logger JUL không xử lý LogRecord có thể chuyển lên parent. Logger phân cấp là một chuỗi: child → parent → root, mỗi Handler tự quyết có publish hay không.'
      }
    },
    {
      system: 'Spring Security — SecurityFilterChain',
      note: {
        en: 'Spring Security installs a SecurityFilterChain in front of the servlet: CSRF, authentication, and authorization filters each see the request and either reject it or invoke the rest of the chain.',
        vi: 'Spring Security gắn một SecurityFilterChain trước servlet: các filter CSRF, authentication và authorization lần lượt thấy request, hoặc từ chối, hoặc gọi phần còn lại của chuỗi.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'A class-per-handler chain is flexible but verbose. The same walk is a list of Function<String, Boolean> (or Predicate plus a side-effecting consumer) composed in order: the first function that returns true stops the pipeline. Adding a handler is an append, not a new subclass.',
      vi: 'Chuỗi mỗi handler một class thì linh hoạt nhưng dài dòng. Cùng bước đi đó là một list Function<String, Boolean> (hoặc Predicate kèm consumer có side-effect) ghép theo thứ tự: function đầu tiên trả true thì dừng pipeline. Thêm handler là append, không phải subclass mới.'
    },
    tradeoffs: {
      en: 'Functional composition is short and easy to reorder in tests. You lose a named type per handler and a natural place for per-handler state (retry counts, metrics). Keep the class form when a handler is a real policy object; use a function list when each step is a one-liner.',
      vi: 'Function composition thì ngắn và dễ đổi thứ tự trong test. Bạn mất một kiểu có tên cho mỗi handler và một chỗ tự nhiên để giữ state (số lần retry, metric). Giữ dạng class khi handler là một object chính sách thật; dùng list function khi mỗi bước chỉ một dòng.'
    },
    javaCode: `import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

// A handler returns true when it consumed the issue.
final class SupportPipeline {
    private final List<Function<String, Boolean>> handlers = new ArrayList<>();

    SupportPipeline then(Function<String, Boolean> handler) {
        handlers.add(handler);
        return this;
    }

    void handle(String issue) {
        for (Function<String, Boolean> h : handlers) {
            if (h.apply(issue)) return;
        }
        System.out.println("nobody could handle: " + issue);
    }
}

// SupportPipeline p = new SupportPipeline()
//     .then(i -> i.startsWith("billing") && print("Billing handled: " + i))
//     .then(i -> i.startsWith("tech")    && print("Tech handled: " + i));
//
// static boolean print(String s) { System.out.println(s); return true; }`
  },

  deepTheory: {
    academicRoot: {
      en: 'Formalized in Gang of Four (1994). Decouples request senders from processing receivers by chaining target handler objects sequentially. Each handler decides either to process the request and pass it to the successor, or short-circuit the pipeline immediately.',
      vi: 'Được chính thức hóa trong Gang of Four (1994). Tách rời phía gửi yêu cầu khỏi các đối tượng xử lý bằng cách xâu chuỗi các handler tuần tự. Mỗi handler tự quyết định xử lý và chuyển tiếp cho mắt xích kế tiếp, hoặc ngắt mạch (short-circuit) dừng toàn bộ chuỗi ngay lập tức.'
    },
    structuralCouplingMetric: {
      en: 'Handlers maintain loose coupling, knowing only their immediate successor via an abstract interface pointer, avoiding monolithic god-class pipeline orchestrators.',
      vi: 'Các handler duy trì tính gắn kết lỏng lẻo, chỉ biết duy nhất mắt xích kế tiếp qua con trỏ interface trừu tượng, loại bỏ hoàn toàn các lớp điều phối khổng lồ.'
    },
    memoryAndVtableTradeoff: {
      en: 'Linear pointer dereference along the handler chain. Short-circuit execution terminates early, skipping expensive downstream operations completely.',
      vi: 'Duyệt tuyến tính qua các con trỏ handler. Cơ chế ngắt mạch sớm giúp tiết kiệm tối đa tài nguyên bằng cách bỏ qua các thao tác tốn kém phía sau.'
    },
    enterpriseBestPractices: [
      {
        en: 'Cost-Ordered Pipeline: Place the computationally cheapest validations (in-memory token checks) first, and the most expensive operations (database locks, GPU ML models) last.',
        vi: 'Sắp xếp chuỗi theo chi phí: Đặt các bước kiểm tra tốn ít CPU nhất (kiểm tra token trong RAM) lên đầu, và các thao tác tốn kém nhất (truy vấn DB, mô hình ML) ở cuối cùng.'
      },
      {
        en: 'Defensive Cycle Prevention: Guarantee that the handler chain is an acyclic directed path to prevent infinite recursive loops.',
        vi: 'Chống vòng lặp vô tận: Bảo đảm chuỗi handler là một đường dẫn đơn hướng không chu trình để tránh lỗi tràn ngăn xếp StackOverflowError.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'FinTech Payment Pre-Flight API Gateway Saturation & Short-Circuit Optimization',
      vi: 'Quá Tải Cổng API Thanh Toán & Cơ Chế Ngắt Mạch Tiết Kiệm 85,000 USD Chi Phí GPU'
    },
    businessContext: {
      en: 'An open-banking payment gateway evaluates 85,000 transaction requests/second across authentication, rate limiting, schema validation, balance verification, and ML fraud scoring.',
      vi: 'Cổng thanh toán ngân hàng mở xử lý 85,000 giao dịch/giây qua các bước: xác thực token, giới hạn tần suất, thẩm định schema, kiểm tra số dư và chấm điểm gian lận bằng AI/ML.'
    },
    problemDescription: {
      en: 'The legacy gateway executed all 5 validation steps sequentially for every request—even when the auth token was completely invalid! During a botnet credential stuffing attack sending 40,000 invalid requests/second, the gateway called an expensive external GPU machine learning fraud scoring service ($0.003/call) on every single fake request. This exhausted GPU server clusters, cost $85,000 in wasted cloud compute in 4 days, and delayed legitimate customer payments by up to 14 seconds.',
      vi: 'Hệ thống gateway cũ chạy tuần tự toàn bộ 5 bước thẩm định cho mọi request—kể cả khi token bảo mật hoàn toàn không hợp lệ! Khi gặp đợt tấn công dò mật khẩu (Credential Stuffing) gửi 40,000 request rác mỗi giây, gateway vẫn vô tư gọi sang dịch vụ chấm điểm gian lận AI trên máy chủ GPU đắt đỏ (tốn 0.003 USD/lượt gọi). Sự cố này làm nghẽn cụm máy chủ GPU, lãng phí 85,000 USD tiền thuê cloud chỉ trong 4 ngày, và khiến các giao dịch thanh toán thật của khách hàng bị trễ tới 14 giây.'
    },
    whyNaiveFails: {
      en: 'Procedural script code packed all checks into a monolithic service, making it difficult to reorder validations or enforce strict fail-fast short-circuiting across teams.',
      vi: 'Lối viết thủ công gom toàn bộ các bước kiểm tra vào một hàm khổng lồ, khiến việc thay đổi thứ tự ưu tiên hay áp đặt cơ chế dừng sớm (fail-fast) trở nên cực kỳ phức tạp và dễ sót lỗi.'
    },
    coreSolution: {
      en: 'Implement Chain of Responsibility ordered by computational cost: AuthFilter (0.01ms memory) -> RateLimitFilter (0.1ms Redis) -> SchemaFilter -> BalanceFilter -> MlFraudFilter (25ms GPU). If any link fails, the request short-circuits immediately with zero downstream execution.',
      vi: 'Áp dụng Chain of Responsibility sắp xếp theo chi phí tăng dần: AuthFilter (0.01ms trong RAM) -> RateLimitFilter (0.1ms Redis) -> SchemaFilter -> BalanceFilter -> MlFraudFilter (25ms GPU). Bất kỳ mắt xích nào phát hiện sai lệch sẽ lập tức ngắt mạch và trả lỗi ngay, triệt tiêu 100% việc gọi xuống các tầng sau.'
    },
    productionCode: `// Production Fast-Failing FinTech Validation Chain (Java 21)
package com.gateway.chain;

public abstract class PreFlightFilter {
    private PreFlightFilter next;

    public PreFlightFilter linkWith(PreFlightFilter next) {
        this.next = next;
        return next;
    }

    public abstract boolean doCheck(PaymentRequest req);

    public boolean execute(PaymentRequest req) {
        // Fast-fail: short-circuit immediately on failure!
        if (!doCheck(req)) {
            return false;
        }
        return next == null || next.execute(req);
    }
}

// 1. CHEAPEST: In-Memory Token Check (0.01ms)
public class TokenAuthFilter extends PreFlightFilter {
    @Override
    public boolean doCheck(PaymentRequest req) {
        return req.token() != null && req.token().startsWith("Bearer ");
    }
}

// 2. MEDIUM: Redis Rate Limit Check (0.1ms)
public class RateLimitFilter extends PreFlightFilter {
    @Override
    public boolean doCheck(PaymentRequest req) {
        return req.clientIp() != null; // Mock Redis rate limit pass
    }
}

// 3. EXPENSIVE: External GPU ML Fraud Scoring (25ms) - Only invoked if all prior filters pass!
public class GpuFraudScoringFilter extends PreFlightFilter {
    @Override
    public boolean doCheck(PaymentRequest req) {
        return req.amountCents() < 50_000_00; // Passes fraud check
    }
}`,
    architectureImpact: {
      en: '95% of invalid botnet attacks rejected in <0.02ms at the very first filter; External GPU ML calls reduced by 78%, saving $85,000/month in cloud AI compute; P99 gateway latency dropped from 14s to 6.2ms.',
      vi: '95% lượng request rác bị chặn đứng trong <0.02ms ngay tại mắt xích đầu tiên; Số lượt gọi AI trên GPU giảm 78%, tiết kiệm 85,000 USD/tháng chi phí hạ tầng; Độ trễ P99 của cổng thanh toán giảm từ 14 giây xuống còn 6.2ms.'
    }
  }
};
