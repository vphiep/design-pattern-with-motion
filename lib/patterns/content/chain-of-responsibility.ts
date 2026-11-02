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
  }
};
