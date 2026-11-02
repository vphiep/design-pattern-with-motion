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
        vi: 'Caller nhờ logger ghi log'
      },
      body: {
        en: 'Client code never mentions StdoutDestination or FileDestination. It holds a Logger and calls log(message). Inside that method the highlighted block asks createDestination() for a LogDestination, then dest.write(message) talks only to the product interface. Logger is the creator; the caller stays ignorant of which concrete product will appear.',
        vi: 'Code phía client không bao giờ nhắc tới StdoutDestination hay FileDestination. Nó cầm một Logger và gọi log(message). Bên trong method đó, khối được highlight hỏi createDestination() lấy một LogDestination, rồi dest.write(message) chỉ nói chuyện với interface của product. Logger là creator; caller không cần biết product concrete nào sẽ xuất hiện.'
      }
    },
    {
      title: {
        en: 'The factory method is a blank the subclass fills',
        vi: 'Factory method là chỗ trống để subclass điền'
      },
      body: {
        en: 'Logger declares the factory method as protected abstract LogDestination createDestination() and does not implement it. That single abstract method is the hook: the algorithm in log() is fixed, but the exact class that gets constructed is postponed until a subclass answers. This is the whole pattern — “new” lives in one override, not scattered through the callers.',
        vi: 'Logger khai báo factory method là protected abstract LogDestination createDestination() và không implement nó. Đúng một method abstract đó là hook: thuật toán trong log() đã cố định, nhưng class cụ thể được khởi tạo thì để dành cho subclass trả lời. Đó là toàn bộ pattern — chữ “new” sống trong một chỗ override, không rải khắp các caller.'
      }
    },
    {
      title: {
        en: 'The subclass picks the concrete product',
        vi: 'Subclass chọn product concrete'
      },
      body: {
        en: 'StdoutLogger overrides the factory method and simply returns new StdoutDestination(). FileLogger does the same with FileDestination, carrying a path into the product. Swap which Logger you construct and the rest of log() stays identical — new destinations mean a new subclass, not a rewrite of the callers.',
        vi: 'StdoutLogger override factory method và chỉ việc return new StdoutDestination(). FileLogger làm tương tự với FileDestination, mang theo một path vào product. Đổi Logger bạn khởi tạo thì phần còn lại của log() vẫn y nguyên — muốn destination mới thì viết subclass mới, không phải viết lại các caller.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.util.Collection.iterator()',
      note: {
        en: 'Every Collection implements iterator() as a factory method: ArrayList, HashSet, and TreeMap.entrySet() each return their own Iterator subclass. Callers loop through Iterator and never name the concrete cursor.',
        vi: 'Mọi Collection implement iterator() như một factory method: ArrayList, HashSet, và TreeMap.entrySet() mỗi bên trả về Iterator subclass của riêng mình. Caller duyệt qua Iterator và không bao giờ gọi tên con trỏ concrete.'
      }
    },
    {
      system: 'java.text.NumberFormat.getInstance()',
      note: {
        en: 'NumberFormat.getInstance() (and getCurrencyInstance(), getPercentInstance()) returns a locale-specific subclass such as DecimalFormat. Application code asks the factory method; it never constructs DecimalFormat by hand.',
        vi: 'NumberFormat.getInstance() (cùng getCurrencyInstance(), getPercentInstance()) trả về một subclass theo locale, thường là DecimalFormat. Code ứng dụng hỏi factory method; nó không tự new DecimalFormat.'
      }
    },
    {
      system: 'Spring — org.springframework.beans.factory.FactoryBean',
      note: {
        en: 'A FactoryBean’s getObject() is a factory method the container calls to produce the real bean. The rest of the application is injected with the product type, not with the FactoryBean itself.',
        vi: 'getObject() của FactoryBean là factory method mà container gọi để tạo ra bean thật. Phần còn lại của ứng dụng được inject kiểu product, không phải chính FactoryBean.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Subclass-per-product scales poorly once destinations are configured, not compiled in. The form below replaces the abstract factory method with a Supplier<LogDestination> and a registry: registering a new destination is a one-line put, not a new Logger subclass. Construction is still hidden behind one method; the inheritance ladder is gone.',
      vi: 'Mỗi product một subclass sẽ khó mở rộng khi destination đến từ cấu hình chứ không phải hard-code. Dạng bên dưới thay factory method abstract bằng Supplier<LogDestination> và một registry: đăng ký destination mới chỉ là một dòng put, không phải một Logger subclass mới. Việc khởi tạo vẫn được giấu sau một method; hàng thừa kế thì biến mất.'
    },
    tradeoffs: {
      en: 'A Supplier registry is easier to extend at runtime and friendlier in tests (pass a lambda that returns a fake). You lose the compiler’s reminder to implement createDestination(), and a missing key is now a runtime miss. Keep the classic subclass form when the set of products is small and closed.',
      vi: 'Registry các Supplier dễ mở rộng lúc runtime hơn và thân thiện với test hơn (truyền một lambda trả về bản fake). Bạn mất lời nhắc của compiler phải implement createDestination(), và một key thiếu giờ thành lỗi lúc chạy. Giữ dạng subclass cổ điển khi tập product nhỏ và đóng.'
    },
    javaCode: `import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

interface LogDestination { void write(String message); }

final class StdoutDestination implements LogDestination {
    public void write(String message) { System.out.println("[stdout] " + message); }
}

// Creator without a subclass per product: the factory method is a Supplier.
final class Logger {
    private final Supplier<LogDestination> factory;
    Logger(Supplier<LogDestination> factory) { this.factory = factory; }
    public void log(String message) { factory.get().write(message); }
}

// Register destinations by name. Adding one is a put, not a new Logger type.
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
}

// DestinationRegistry r = new DestinationRegistry();
// r.register("stdout", StdoutDestination::new);
// r.logger("stdout").log("hi");`
  }
};
