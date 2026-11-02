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
  }
};
