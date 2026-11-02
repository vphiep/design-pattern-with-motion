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
  }
};
