import type { Pattern } from '../types';

export const templateMethod: Pattern = {
  id: 'template-method',
  category: 'behavioral',
  name: 'Template Method',
  tagline: {
    en: 'Define the skeleton of an algorithm in a base class, and let subclasses fill in the steps.',
    vi: 'Định nghĩa khung xương thuật toán trong class cha, và để subclass điền các bước.'
  },
  analogy: {
    en: 'A recipe. The overall plan is the same — “boil water, add ingredient, cook for N minutes, serve.” A subclass picks the actual ingredient and the time. The structure lives in the base recipe; the specific choices live in each variation. Template Method is exactly that: a fixed outline, with some steps delegated to subclasses.',
    vi: 'Một công thức nấu. Kế hoạch tổng thì giống — “đun nước, cho nguyên liệu, nấu N phút, bày ra.” Subclass chọn nguyên liệu thật và thời gian. Cấu trúc sống ở công thức gốc; lựa chọn cụ thể sống ở từng biến thể. Template Method đúng là vậy: dàn ý cố định, vài bước giao cho subclass.'
  },
  whenToUse: [
    {
      en: 'Several classes do almost the same thing, differing only in a few steps.',
      vi: 'Vài class làm gần như cùng một việc, chỉ khác vài bước.'
    },
    {
      en: 'You want to keep the overall algorithm in one place (so it can’t be silently changed) but allow parts to vary.',
      vi: 'Bạn muốn giữ thuật toán tổng ở một chỗ (để không bị sửa thầm) nhưng cho phép vài phần thay đổi.'
    },
    {
      en: 'You want to enforce an order of steps while letting subclasses customize them.',
      vi: 'Bạn muốn ép một thứ tự các bước, trong khi vẫn để subclass tùy biến chúng.'
    }
  ],
  whenNotToUse: [
    {
      en: 'Subclasses would have to override most of the steps anyway — the template stops being useful.',
      vi: 'Subclass gần như phải override hết các bước — template hết còn ích.'
    },
    {
      en: 'The “template” needs so many hooks that it stops looking like a template.',
      vi: '“Template” cần quá nhiều hook đến mức không còn giống template.'
    }
  ],
  difficulty: 2,
  order: 22,
  javaCode: `// The template: the skeleton is final, but the steps are abstract.
abstract class DataPipeline {
    // The template method: the order of steps is fixed.
    public final void run() {
        read();
        transform();
        write();
    }
    protected abstract void read();
    protected abstract void transform();
    protected abstract void write();
}

// Subclasses fill in only the steps that vary.
final class CsvToJsonPipeline extends DataPipeline {
    protected void read()      { System.out.println("reading CSV"); }
    protected void transform() { System.out.println("CSV -> JSON"); }
    protected void write()     { System.out.println("writing JSON file"); }
}
final class XmlToYamlPipeline extends DataPipeline {
    protected void read()      { System.out.println("reading XML"); }
    protected void transform() { System.out.println("XML -> YAML"); }
    protected void write()     { System.out.println("writing YAML file"); }
}

// new CsvToJsonPipeline().run();  -> reads, transforms, writes — in that order.`,
  steps: [
    {
      title: {
        en: 'The template method locks the order',
        vi: 'Template method khóa thứ tự'
      },
      body: {
        en: 'DataPipeline.run() is final: read, then transform, then write. No subclass can reorder or skip a step by overriding run(). The skeleton lives in one place so the algorithm cannot drift.',
        vi: 'DataPipeline.run() là final: read, rồi transform, rồi write. Không subclass nào đổi thứ tự hoặc bỏ bước bằng cách override run(). Khung xương ở một chỗ để thuật toán không bị lệch.'
      }
    },
    {
      title: {
        en: 'The blank steps are abstract hooks',
        vi: 'Các bước trống là hook abstract'
      },
      body: {
        en: 'read(), transform(), and write() are protected abstract — the blanks on the recipe card. The base class calls them; it does not implement them. That is the inversion: the parent decides *when*, the child decides *how*.',
        vi: 'read(), transform() và write() là protected abstract — chỗ trống trên thẻ công thức. Class cha gọi chúng; không implement chúng. Đó là đảo ngược: cha quyết *khi nào*, con quyết *làm sao*.'
      }
    },
    {
      title: {
        en: 'A subclass fills in only the steps that vary',
        vi: 'Subclass chỉ điền các bước khác nhau'
      },
      body: {
        en: 'CsvToJsonPipeline.transform() prints “CSV -> JSON”; XmlToYamlPipeline fills the same hook with a different conversion. Call run() on either one and the outline is identical. A new format is a new subclass, not a fork of the skeleton.',
        vi: 'CsvToJsonPipeline.transform() in “CSV -> JSON”; XmlToYamlPipeline điền cùng hook bằng phép chuyển khác. Gọi run() trên bên nào thì dàn ý vẫn giống. Format mới là subclass mới, không phải fork khung xương.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.util.AbstractList',
      note: {
        en: 'AbstractList.get and size are the hooks; indexOf, iterator, and subList are template methods built on them. You implement two methods and inherit the rest of List.',
        vi: 'AbstractList.get và size là hook; indexOf, iterator và subList là template method dựng trên chúng. Bạn implement hai method và thừa kế phần còn lại của List.'
      }
    },
    {
      system: 'jakarta.servlet.http.HttpServlet.service()',
      note: {
        en: 'HttpServlet.service() is a template that routes on HTTP method and calls doGet, doPost, and friends. You override the verb you care about; you do not rewrite the dispatch.',
        vi: 'HttpServlet.service() là template phân luồng theo HTTP method rồi gọi doGet, doPost và các method anh em. Bạn override verb bạn cần; không viết lại bước dispatch.'
      }
    },
    {
      system: 'java.io.InputStream.read(byte[])',
      note: {
        en: 'The array overloads loop around the abstract read() that returns a single byte. A subclass implements one-byte read and inherits buffered-array reads for free.',
        vi: 'Các overload nhận mảng byte lặp quanh read() abstract trả về một byte. Subclass implement đọc từng byte và được luôn các bản đọc mảng có buffer.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'A subclass per pipeline is the classic form. When the hooks are one-liners, the same skeleton can take Runnables (or three Consumer/Supplier fields) in a constructor: run() still calls them in order, but you compose a pipeline with lambdas instead of CsvToJsonPipeline.java.',
      vi: 'Mỗi pipeline một subclass là dạng cổ điển. Khi hook chỉ một dòng, cùng khung xương có thể nhận Runnable (hoặc ba field Consumer/Supplier) qua constructor: run() vẫn gọi chúng đúng thứ tự, nhưng bạn ghép pipeline bằng lambda thay vì CsvToJsonPipeline.java.'
    },
    tradeoffs: {
      en: 'Lambda hooks drop the inheritance tax and are easy to test in isolation. You lose a named type per pipeline and the compiler no longer forces you to implement every step (a null hook is a runtime hole). Use lambdas for local scripts; keep the abstract class when the outline is a public contract.',
      vi: 'Hook dạng lambda bỏ thuế thừa kế và dễ test riêng. Bạn mất một kiểu có tên cho mỗi pipeline, và compiler không còn ép implement mọi bước (hook null là lỗ lúc chạy). Dùng lambda cho script local; giữ abstract class khi dàn ý là hợp đồng public.'
    },
    javaCode: `final class DataPipeline {
    private final Runnable read;
    private final Runnable transform;
    private final Runnable write;

    DataPipeline(Runnable read, Runnable transform, Runnable write) {
        this.read = read;
        this.transform = transform;
        this.write = write;
    }

    // Same skeleton — now the hooks are injected, not overridden.
    public final void run() {
        read.run();
        transform.run();
        write.run();
    }
}

// new DataPipeline(
//     () -> System.out.println("reading CSV"),
//     () -> System.out.println("CSV -> JSON"),
//     () -> System.out.println("writing JSON file")
// ).run();`
  }
};
