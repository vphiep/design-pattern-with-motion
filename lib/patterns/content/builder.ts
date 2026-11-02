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
  }
};
