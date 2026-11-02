import type { Pattern } from '../types';

export const singleton: Pattern = {
  id: 'singleton',
  category: 'creational',
  name: 'Singleton',
  tagline: {
    en: 'Make sure a class has exactly one instance, and give the whole program a single way to reach it.',
    vi: 'Đảm bảo một class chỉ có duy nhất một instance, và cung cấp cho toàn bộ chương trình một điểm truy cập chung tới instance đó.'
  },
  analogy: {
    en: 'A government has exactly one treasury department. Citizens don’t each open their own copy — they go through the one official office. Singleton is that single office: one object, one global access point, no duplicates.',
    vi: 'Một quốc gia chỉ có đúng một kho bạc nhà nước. Người dân không ai tự mở một "bản sao" kho bạc riêng — tất cả đều đi qua văn phòng chính thức duy nhất. Singleton chính là văn phòng duy nhất đó: một object, một điểm truy cập toàn cục, không có bản sao nào khác.'
  },
  whenToUse: [
    {
      en: 'You genuinely need a single shared resource, like a config store, a connection pool, or a logger.',
      vi: 'Bạn thực sự cần một tài nguyên dùng chung duy nhất, ví dụ config store, connection pool, hay logger.'
    },
    {
      en: 'You want that single instance reachable from anywhere without passing it through every constructor.',
      vi: 'Bạn muốn instance duy nhất đó truy cập được từ bất cứ đâu, mà không phải truyền nó qua từng constructor.'
    },
    {
      en: 'You need lazy creation — the object should only be built the first time someone asks for it.',
      vi: 'Bạn cần lazy creation — object chỉ nên được tạo ở lần đầu tiên có ai đó cần đến nó.'
    }
  ],
  whenNotToUse: [
    {
      en: 'You’re using it just to hold global state. That’s usually a code smell, not a design choice.',
      vi: 'Bạn dùng nó chỉ để chứa global state. Đó thường là code smell, không phải một quyết định thiết kế.'
    },
    {
      en: 'You actually want a small, fixed number of instances (use a pool or a registry instead).',
      vi: 'Thứ bạn thật sự cần là một số lượng instance nhỏ và cố định (hãy dùng pool hoặc registry thay thế).'
    },
    {
      en: 'You need to swap the implementation in tests — singletons make that harder.',
      vi: 'Bạn cần thay implementation khi viết test — singleton khiến việc đó khó hơn hẳn.'
    }
  ],
  difficulty: 1,
  order: 1,
  javaCode: `public final class AppConfig {
    // The one and only instance. 'volatile' makes the double-checked
    // locking pattern work safely across threads.
    private static volatile AppConfig instance;

    private final String env;
    private final int maxConnections;

    // Private constructor: nobody can call 'new AppConfig()' from outside.
    private AppConfig() {
        this.env = System.getenv().getOrDefault("APP_ENV", "dev");
        this.maxConnections = 10;
    }

    // The global access point. First call builds the object; later calls
    // return the same reference. Double-checked locking keeps it fast and
    // thread-safe without paying the synchronized cost on every read.
    public static AppConfig getInstance() {
        if (instance == null) {
            synchronized (AppConfig.class) {
                if (instance == null) {
                    instance = new AppConfig();
                }
            }
        }
        return instance;
    }

    public String env()        { return env; }
    public int maxConnections() { return maxConnections; }
}`,
  steps: [
    {
      title: {
        en: 'Callers ask for the instance',
        vi: 'Caller xin instance'
      },
      body: {
        en: 'Every part of the program that needs configuration calls the static method AppConfig.getInstance() instead of writing new AppConfig(). It can’t do otherwise: the constructor is private, so AppConfig itself is the only code allowed to construct one. That static method is the single door every caller walks through.',
        vi: 'Mọi nơi trong chương trình cần đọc config đều gọi method static AppConfig.getInstance() thay vì tự viết new AppConfig(). Muốn làm khác cũng không được: constructor được khai báo private, nên chỉ chính class AppConfig mới có quyền tạo instance. Method static đó là cánh cửa duy nhất mà mọi caller phải đi qua.'
      }
    },
    {
      title: {
        en: 'The first call constructs it',
        vi: 'Lần gọi đầu tiên tạo object'
      },
      body: {
        en: 'On the very first call, the instance field is still null, so getInstance() enters the synchronized block and runs instance = new AppConfig(). The volatile keyword plus the second null check — the “double-checked locking” idiom — guarantee that two threads arriving at the same moment can’t each build their own copy. Exactly one AppConfig is ever constructed.',
        vi: 'Ở lần gọi đầu tiên, field instance vẫn còn null, nên getInstance() đi vào khối synchronized và chạy instance = new AppConfig(). Từ khóa volatile cộng với lần kiểm tra null thứ hai — idiom “double-checked locking” — đảm bảo hai thread đến cùng lúc không thể mỗi thread tự tạo một bản riêng. Chỉ có đúng một AppConfig được khởi tạo.'
      }
    },
    {
      title: {
        en: 'Everyone shares that one object',
        vi: 'Tất cả dùng chung một object'
      },
      body: {
        en: 'From then on, getInstance() skips construction entirely and simply executes return instance. Every caller — the web layer, a background job, a test — receives a reference to the same object, so the whole program reads one consistent configuration. That shared reference is the entire point of the pattern.',
        vi: 'Từ đó trở đi, getInstance() bỏ qua hoàn toàn bước khởi tạo và chỉ chạy return instance. Mọi caller — tầng web, một background job, hay một bài test — đều nhận về reference tới cùng một object, nên cả chương trình đọc chung một bộ config nhất quán. Reference dùng chung đó chính là toàn bộ ý nghĩa của pattern này.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.lang.Runtime.getRuntime()',
      note: {
        en: 'The JVM exposes exactly one Runtime object per process. You can never write new Runtime() — the constructor is closed off, and the static getRuntime() accessor hands every caller the same instance, exactly the “one instance, one door” shape on this page.',
        vi: 'JVM chỉ cung cấp đúng một object Runtime cho mỗi process. Bạn không bao giờ viết được new Runtime() — constructor đã bị khóa, và accessor static getRuntime() trao cho mọi caller cùng một instance, đúng hình dáng “một instance, một cánh cửa” trên trang này.'
      }
    },
    {
      system: 'Spring — default singleton bean scope',
      note: {
        en: 'Spring’s default bean scope is singleton: the container constructs one instance of each bean and injects that same instance everywhere it’s needed. Note who enforces the rule — the framework’s container, not a private constructor in your class.',
        vi: 'Scope mặc định của bean trong Spring là singleton: container tạo một instance cho mỗi bean và inject đúng instance đó vào mọi nơi cần dùng. Để ý ai là người giữ luật — container của framework, chứ không phải một private constructor trong class của bạn.'
      }
    },
    {
      system: 'Node.js module cache (non-Java)',
      note: {
        en: 'In Node.js, require() / import evaluates a module once and caches the result, so a module that exports one object behaves as a per-process singleton — the same idea, enforced by the module system instead of the class.',
        vi: 'Trong Node.js, require() / import chỉ chạy một module đúng một lần rồi cache kết quả, nên một module export ra một object sẽ hoạt động như singleton trong phạm vi process — cùng một ý tưởng, nhưng do hệ thống module đảm bảo thay vì do class.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Double-checked locking is famously easy to get wrong — forget volatile and a thread can observe a half-constructed object. The two forms below delete the problem instead of managing it: the initialization-on-demand holder leans on the JVM’s thread-safe class loading to get lazy initialization with zero locks in your code, and the enum singleton gets a JVM-level guarantee of one instance that even survives serialization and blocks reflection attacks.',
      vi: 'Double-checked locking nổi tiếng là dễ viết sai — quên volatile là một thread có thể nhìn thấy object đang khởi tạo dở dang. Hai cách bên dưới xóa hẳn vấn đề thay vì phải xoay xở với nó: initialization-on-demand holder dựa vào cơ chế class loading vốn đã thread-safe của JVM để có lazy initialization mà không cần một cái lock nào trong code của bạn, còn enum singleton được JVM đảm bảo chỉ có một instance ở tầng ngôn ngữ — sống sót cả qua serialization và chặn được cả reflection.'
    },
    tradeoffs: {
      en: 'The holder idiom is the best default: lazy, fast, and correct — but the instance still can’t take runtime parameters. The enum form is the shortest and the most bulletproof, but an enum can’t extend a class, is eagerly created when the enum type loads, and looks surprising to readers who expect enums to be value lists. And no variant fixes testability: anything reached through a static accessor is still hard to swap for a fake — which is why frameworks usually manage “one instance” for you instead.',
      vi: 'Holder idiom là lựa chọn mặc định tốt nhất: lazy, nhanh, và đúng — nhưng instance vẫn không thể nhận tham số lúc runtime. Dạng enum thì ngắn nhất và “chống đạn” nhất, nhưng enum không extend được class nào, bị tạo ngay khi enum type được load, và trông khá lạ với người quen nghĩ enum là danh sách giá trị. Và không biến thể nào chữa được vấn đề testability: thứ gì truy cập qua static accessor thì vẫn khó thay bằng bản fake — đó là lý do các framework thường quản lý “một instance” giúp bạn.'
    },
    javaCode: `// Variant 1 — initialization-on-demand holder.
// The JVM loads Holder only on the first getInstance() call, and class
// loading is guaranteed thread-safe: lazy + safe, with no locks at all.
public final class AppConfig {
    private AppConfig() {}

    private static final class Holder {
        static final AppConfig INSTANCE = new AppConfig();
    }

    public static AppConfig getInstance() {
        return Holder.INSTANCE; // first call triggers Holder loading, once
    }
}

// Variant 2 — enum singleton: the shortest correct form.
// The JVM guarantees one instance per enum constant, keeps that guarantee
// through serialization, and refuses reflective construction outright.
enum Config {
    INSTANCE;

    private final String env =
        System.getenv().getOrDefault("APP_ENV", "dev");

    public String env() { return env; }
}
// Usage: Config.INSTANCE.env()

// Why double-checked locking is tricky: without 'volatile', the write
// to 'instance' can become visible to another thread BEFORE the
// constructor's field writes do — that thread then reads a half-built
// object. The holder and enum forms never expose that window.`
  }
};
