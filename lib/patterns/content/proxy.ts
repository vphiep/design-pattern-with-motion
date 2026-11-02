import type { Pattern } from '../types';

export const proxy: Pattern = {
  id: 'proxy',
  category: 'structural',
  name: 'Proxy',
  tagline: {
    en: 'Put a stand-in front of a real object to control access, lazy-load it, or add safety checks.',
    vi: 'Đặt một vật thế chỗ trước object thật để kiểm soát truy cập, lazy-load, hoặc thêm bước kiểm tra.'
  },
  analogy: {
    en: 'A company’s reception desk. Visitors don’t walk straight to the CEO’s office. They talk to reception, who checks IDs, schedules, and forwards only the right people. The CEO never knows the visitor had to clear a checkpoint. A proxy is that reception desk: same interface as the real thing, but with a guard rail in front.',
    vi: 'Quầy lễ tân công ty. Khách không đi thẳng vào phòng CEO. Họ nói với lễ tân, người kiểm tra giấy tờ, lịch họp, và chỉ chuyển đúng người. CEO không cần biết khách đã qua một trạm gác. Proxy chính là quầy đó: cùng interface với thứ thật, nhưng có lan can phía trước.'
  },
  whenToUse: [
    {
      en: 'You want to lazy-load a heavy object — only build it when someone actually needs it.',
      vi: 'Bạn muốn lazy-load một object nặng — chỉ dựng khi có ai thật sự cần.'
    },
    {
      en: 'You want to control who can call the real object (auth, permissions, rate limits).',
      vi: 'Bạn muốn kiểm soát ai được gọi object thật (auth, quyền, rate limit).'
    },
    {
      en: 'You want to log, cache, or remote-control access to the real object without changing its interface.',
      vi: 'Bạn muốn log, cache, hoặc điều khiển từ xa việc truy cập object thật mà không đổi interface của nó.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The real object is cheap and the extra layer just adds latency.',
      vi: 'Object thật thì rẻ, tầng thêm chỉ làm tăng độ trễ.'
    },
    {
      en: 'You’re trying to hide the fact that there’s a proxy at all — that’s usually a sign you want a different design.',
      vi: 'Bạn đang cố giấu luôn việc có proxy — thường đó là dấu hiệu nên chọn thiết kế khác.'
    }
  ],
  difficulty: 2,
  order: 12,
  javaCode: `// The subject: the real service and its proxy share this interface.
interface Image {
    void display();
}

// The real object. It does the expensive work.
final class RealImage implements Image {
    private final String filename;
    RealImage(String filename) {
        this.filename = filename;
        System.out.println("Loading " + filename + " from disk..."); // expensive
    }
    public void display() { System.out.println("Showing " + filename); }
}

// The proxy: it looks the same, but it controls how/when the real thing
// is built. Here it lazy-loads: RealImage is only created on first display.
final class LazyImageProxy implements Image {
    private final String filename;
    private RealImage real; // null until needed
    LazyImageProxy(String filename) { this.filename = filename; }
    public void display() {
        if (real == null) real = new RealImage(filename); // build on demand
        real.display();
    }
}

// The client can't tell the difference — but no disk load happens
// until display() is actually called.`,
  steps: [
    {
      title: {
        en: 'The real object and the stand-in share an interface',
        vi: 'Object thật và vật thế chỗ dùng chung một interface'
      },
      body: {
        en: 'Image is the subject interface: both RealImage and LazyImageProxy implement display(). Client code holds an Image, so it cannot tell — and should not care — whether the object in hand is the expensive original or the stand-in.',
        vi: 'Image là interface subject: cả RealImage lẫn LazyImageProxy đều implement display(). Code client cầm một Image, nên không phân biệt được — và không nên quan tâm — object trên tay là bản gốc đắt hay là vật thế chỗ.'
      }
    },
    {
      title: {
        en: 'The real object does the expensive work',
        vi: 'Object thật làm việc đắt'
      },
      body: {
        en: 'RealImage loads the file in its constructor — the highlighted “Loading” work. If you constructed one of these for every thumbnail on a page, you would pay that cost even for images the user never opens. That is why a proxy exists: to keep this constructor closed until it is needed.',
        vi: 'RealImage load file trong constructor — đúng việc “Loading” được highlight. Nếu bạn new một cái cho mọi thumbnail trên trang, bạn trả giá đó cả với ảnh user không bao giờ mở. Đó là lý do có proxy: giữ constructor này đóng đến khi thật sự cần.'
      }
    },
    {
      title: {
        en: 'The proxy builds the real object on first use',
        vi: 'Proxy dựng object thật ở lần dùng đầu'
      },
      body: {
        en: 'LazyImageProxy implements Image but only stores a filename. On display(), the highlighted if (real == null) check constructs RealImage once, then forwards display() to it. Later calls reuse that instance. The client still just calls display(); the checkpoint is invisible.',
        vi: 'LazyImageProxy implement Image nhưng chỉ giữ filename. Khi display(), kiểm tra if (real == null) được highlight sẽ new RealImage đúng một lần, rồi chuyển display() sang nó. Các lần sau tái dùng instance đó. Client vẫn chỉ gọi display(); trạm gác thì vô hình.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.lang.reflect.Proxy',
      note: {
        en: 'The JDK can emit a class at runtime that implements a list of interfaces and forwards every call to an InvocationHandler. Spring AOP, JAX-WS, and many RPC stubs are built on this dynamic proxy.',
        vi: 'JDK có thể phát sinh một class lúc runtime, implement một list interface và chuyển mọi lời gọi tới InvocationHandler. Spring AOP, JAX-WS và nhiều stub RPC được dựng trên dynamic proxy này.'
      }
    },
    {
      system: 'java.rmi — remote stubs',
      note: {
        en: 'An RMI stub implements the remote interface and forwards each method across the network to the real server object. Callers think they hold the service; they hold a proxy.',
        vi: 'Stub RMI implement remote interface và chuyển mỗi method qua mạng tới object server thật. Caller tưởng mình cầm service; thật ra họ cầm proxy.'
      }
    },
    {
      system: 'JPA / Hibernate lazy-loading proxies',
      note: {
        en: 'A lazy @ManyToOne association is often a proxy: the first property access hits the database, later accesses reuse the loaded entity. The field’s declared type stays the entity interface.',
        vi: 'Một association @ManyToOne lazy thường là proxy: lần đọc property đầu tiên mới đánh database, các lần sau tái dùng entity đã load. Kiểu khai báo của field vẫn là interface của entity.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'A handwritten LazyImageProxy only works for Image. java.lang.reflect.Proxy.newProxyInstance builds a stand-in for *any* interface at runtime: the InvocationHandler decides when to construct the real object, what to log, or whether to deny the call. One handler can guard many types.',
      vi: 'LazyImageProxy viết tay chỉ chạy với Image. java.lang.reflect.Proxy.newProxyInstance dựng vật thế chỗ cho *mọi* interface lúc runtime: InvocationHandler quyết khi nào new object thật, log gì, hay có từ chối lời gọi không. Một handler có thể gác nhiều kiểu.'
    },
    tradeoffs: {
      en: 'Dynamic proxies only implement interfaces (class proxies need Byte Buddy or CGLIB). Each call pays a reflective hop, which matters in a tight loop. And the generated class is harder to debug than a named LazyImageProxy. Use them for cross-cutting guards; keep a handwritten proxy when the subject is one type and the policy is simple.',
      vi: 'Dynamic proxy chỉ implement interface (proxy cho class cần Byte Buddy hoặc CGLIB). Mỗi lời gọi chịu một bước reflection, quan trọng trong vòng lặp nóng. Và class phát sinh khó debug hơn một LazyImageProxy có tên. Dùng chúng cho các hàng rào cắt ngang; giữ proxy viết tay khi subject chỉ một kiểu và luật thì đơn giản.'
    },
    javaCode: `import java.lang.reflect.Proxy;

interface Image { void display(); }

final class RealImage implements Image {
    RealImage(String filename) { System.out.println("Loading " + filename); }
    public void display() { System.out.println("Showing"); }
}

// One InvocationHandler lazily constructs the real Image, then forwards.
final class LazyHandler implements java.lang.reflect.InvocationHandler {
    private final String filename;
    private Image real;
    LazyHandler(String filename) { this.filename = filename; }

    public Object invoke(Object proxy, java.lang.reflect.Method method, Object[] args)
            throws Throwable {
        if (real == null) real = new RealImage(filename);
        return method.invoke(real, args);
    }
}

static Image lazy(String filename) {
    return (Image) Proxy.newProxyInstance(
        Image.class.getClassLoader(),
        new Class<?>[] { Image.class },
        new LazyHandler(filename)
    );
}`
  },

  deepTheory: {
    academicRoot: {
      en: 'Formalized in Gang of Four (1994). A Proxy acts as a surrogate or placeholder to control access to the underlying subject (Virtual Proxy, Protection Proxy, Remote Proxy, Smart Interceptor). In modern enterprise Java, dynamic proxies form the core foundation of Spring AOP, Hibernate lazy loading, and RPC frameworks.',
      vi: 'Được chính thức hóa trong Gang of Four (1994). Proxy đóng vai trò là đại diện hoặc vật thay thế để kiểm soát quyền truy cập tới đối tượng thực sự bên dưới. Trong Java doanh nghiệp, Proxy động là nền tảng cốt lõi của Spring AOP, cơ chế Lazy Loading của Hibernate và các framework gọi từ xa RPC.'
    },
    structuralCouplingMetric: {
      en: 'The Proxy implements the exact same interface as the real subject, allowing transparent interception without coupling the client to security or transaction mechanisms.',
      vi: 'Proxy thực thi đúng cùng một Interface với đối tượng thực, cho phép đánh chặn xử lý một cách trong suốt mà không làm phía client bị gắn kết với mã bảo mật hay giao dịch.'
    },
    memoryAndVtableTradeoff: {
      en: 'Adds a single pointer indirection dereference. Under modern HotSpot C2 JIT compilation, monomorphic proxy calls are fully inlined into the caller with zero runtime performance penalty.',
      vi: 'Thêm một bước giải tham chiếu con trỏ. Dưới sự tối ưu của HotSpot C2 JIT, các lời gọi proxy đơn hình được inlining hoàn toàn vào nơi gọi mà không tốn chi phí thực thi nào.'
    },
    enterpriseBestPractices: [
      {
        en: 'Beware of Spring Self-Invocation Bypass: Calling this.internalMethod() inside the same class completely bypasses the Spring CGLIB/JDK proxy, silently disabling @Transactional, @Async, and @Cacheable.',
        vi: 'Cảnh giác với lỗi Spring Self-Invocation: Gọi this.internalMethod() trong cùng một class sẽ bỏ qua hoàn toàn proxy của Spring, làm vô hiệu hóa âm thầm các annotation @Transactional, @Async và @Cacheable.'
      },
      {
        en: 'JDK Dynamic Proxy vs CGLIB: JDK proxies require interface contracts; CGLIB/ByteBuddy subclasses concrete classes (which fails if target classes or methods are marked final).',
        vi: 'JDK Dynamic Proxy vs CGLIB: JDK Proxy bắt buộc phải có Interface; CGLIB/ByteBuddy tạo lớp con kế thừa class thực tế (sẽ thất bại nếu class hoặc method bị đánh dấu final).'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Spring @Transactional Self-Invocation Proxy Bypass & Silent Financial Rollback Failure',
      vi: 'Lỗi Bỏ Qua Proxy Do Gọi Nội Bộ (Self-Invocation) Trong Spring @Transactional & Thất Thoát Giao Dịch'
    },
    businessContext: {
      en: 'A core banking ledger microservice executes double-entry account transfers: debiting sender accounts and crediting receiver accounts under strict ACID transactional guarantees.',
      vi: 'Dịch vụ sổ cái ngân hàng số thực hiện chuyển tiền bút toán kép: trừ tiền tài khoản gửi và cộng tiền tài khoản nhận dưới cam kết giao dịch ACID nghiêm ngặt.'
    },
    problemDescription: {
      en: 'A developer marked the internal credit method with @Transactional(rollbackFor = Exception.class). In TransferService, the public transfer() method called this.applyInternalCredit(account, amount). When applyInternalCredit() threw an unexpected database constraint violation, the transaction DID NOT ROLL BACK! The sender account was debited $15,000, but the receiver account was never credited. The customer lost $15,000, and ledger reconciliation failed. Investigation revealed that calling this.method() within the same class bypassed the Spring CGLIB proxy entirely, executing the method on the raw instance with zero transaction interception!',
      vi: 'Lập trình viên đánh dấu phương thức cộng tiền nội bộ bằng @Transactional(rollbackFor = Exception.class). Trong TransferService, hàm public transfer() gọi trực tiếp: this.applyInternalCredit(account, amount). Khi applyInternalCredit() phát nổ lỗi vi phạm ràng buộc cơ sở dữ liệu, giao dịch ĐÃ KHÔNG HỀ ĐƯỢC ROLLBACK! Tài khoản người gửi bị trừ sạch 15,000 USD nhưng người nhận không nhận được tiền. Khách hàng bị mất tiền oan và sổ cái ngân hàng bị sai lệch. Nguyên nhân do lệnh gọi this.method() trong cùng class đã đi thẳng vào đối tượng thật mà bỏ qua hoàn toàn Spring CGLIB Proxy, khiến cơ chế quản lý giao dịch không hề được kích hoạt!'
    },
    whyNaiveFails: {
      en: 'Developers mistakenly assumed Spring annotations work via bytecode rewriting or compiler magic. In reality, Spring creates dynamic proxies that only intercept calls arriving from OUTSIDE the target bean.',
      vi: 'Lập trình viên lầm tưởng các annotation của Spring hoạt động bằng phép thuật. Thực chất, Spring chỉ sinh ra các lớp Proxy động bao bọc bên ngoài và CHỈ đánh chặn được các lời gọi đến từ BÊN NGOÀI bean.'
    },
    coreSolution: {
      en: 'Understand the Proxy pattern architecture: Decouple the transactional credit logic into a separate dedicated Spring bean (e.g., LedgerPostingService) so calls traverse the dynamic proxy. Alternatively, self-inject the proxy via ObjectProvider<TransferService> or ApplicationContext to invoke the method through the proxy layer.',
      vi: 'Hiểu đúng bản chất của mẫu Proxy: Tách logic cộng tiền có giao dịch sang một Bean Spring độc lập (như LedgerPostingService) để các lời gọi đi qua Proxy động. Hoặc tự tiêm chính Proxy của mình qua ObjectProvider<TransferService> để gọi hàm xuyên qua lớp vỏ bọc Proxy.'
    },
    productionCode: `// Production Solution: Proper Spring Proxy Segregation (Java 21)
package com.banking.ledger.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountTransferService {
    // 1. Inject dedicated internal service bean: calls traverse the Spring CGLIB Proxy!
    private final LedgerPostingService ledgerPostingService;

    public AccountTransferService(LedgerPostingService ledgerPostingService) {
        this.ledgerPostingService = ledgerPostingService;
    }

    public void executeTransfer(long fromAcc, long toAcc, long amountCents) {
        // Step 1: Debit sender
        debitAccount(fromAcc, amountCents);

        // Step 2: Route through Spring Proxy to enforce transactional rollback boundary!
        ledgerPostingService.applyCreditWithTransaction(toAcc, amountCents);
    }

    private void debitAccount(long acc, long amt) { /* In-memory or DB update */ }
}

@Service
public class LedgerPostingService {
    // 2. Fully intercepted by Spring AOP Proxy: guarantees rollback on Exception!
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void applyCreditWithTransaction(long toAcc, long amountCents) {
        if (amountCents > 1_000_000_00) {
            throw new IllegalStateException("Simulated Failure: Exceeds AML limit!");
        }
    }
}`,
    architectureImpact: {
      en: '100% elimination of silent transaction rollback bypass bugs; Full compliance with double-entry accounting ACID invariants; Zero unhedged account balance discrepancies.',
      vi: 'Triệt tiêu 100% lỗi bỏ sót rollback giao dịch do cơ chế proxy; Bảo đảm tuyệt đối tính toàn vẹn ACID của sổ cái kế toán kép; Không còn bất kỳ sự cố sai lệch số dư tài khoản nào.'
    }
  }
};
