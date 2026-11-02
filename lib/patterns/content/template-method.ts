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
  },

  deepTheory: {
    academicRoot: {
      en: 'Formalized in Gang of Four (1994). Defines the skeleton of an algorithm in a base class method, deferring concrete steps to subclasses without altering the overall algorithm structure. Implements the foundational Hollywood Principle: "Don\'t call us, we\'ll call you."',
      vi: 'Được chính thức hóa trong Gang of Four (1994). Định nghĩa khung sườn của một thuật toán trong phương thức của lớp cha, nhường quyền cài đặt các bước chi tiết cho lớp con mà không làm thay đổi cấu trúc tổng thể. Hiện thực hóa nguyên lý Hollywood kinh điển: "Đừng gọi chúng tôi, chúng tôi sẽ gọi bạn."'
    },
    structuralCouplingMetric: {
      en: 'Inverts control flow: the abstract superclass orchestrates execution ordering, preventing subclasses from accidentally bypassing mandatory audit, transaction, or security steps.',
      vi: 'Đảo ngược luồng điều khiển: lớp cha trừu tượng nắm quyền điều phối thứ tự thực thi, ngăn chặn tuyệt đối việc lớp con vô tình bỏ qua các bước kiểm toán, bảo mật hoặc giao dịch bắt buộc.'
    },
    memoryAndVtableTradeoff: {
      en: 'Template method is marked final, enabling HotSpot JIT C2 to inline the algorithm skeleton directly into caller code.',
      vi: 'Phương thức khuôn mẫu được đánh dấu final, cho phép trình biên dịch HotSpot JIT C2 inlining trực tiếp khung thuật toán vào nơi gọi mà không tốn chi phí gọi hàm.'
    },
    enterpriseBestPractices: [
      {
        en: 'Enforce Immutability on Template Methods: Always declare the template method public final to prevent subclasses from overriding the execution skeleton.',
        vi: 'Khóa chặt phương thức khuôn mẫu: Luôn khai báo phương thức template là public final để cấm lớp con ghi đè làm thay đổi khung quy trình chuẩn.'
      },
      {
        en: 'Hook Methods: Provide protected empty or default hook methods allowing subclasses optional extension points without mandatory implementation.',
        vi: 'Phương thức Hook: Cung cấp các hàm hook protected có cài đặt mặc định để lớp con có thể tùy chọn can thiệp mà không bắt buộc phải viết mã.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Data Ingestion ETL Pipeline Compliance Bypass & PII Leakage Disaster',
      vi: 'Sự Cố Rò Rỉ Dữ Liệu Cá Nhân PII Do Bỏ Sót Bước Kiểm Toán Trong Đường Ống ETL'
    },
    businessContext: {
      en: 'An enterprise data warehousing platform ingests high-volume data feeds (CSV, Parquet, JSON) from 60 banking partners under strict GDPR and PCI-DSS compliance regulations.',
      vi: 'Nền tảng kho dữ liệu doanh nghiệp tiếp nhận dữ liệu lớn (CSV, Parquet, JSON) từ 60 đối tác ngân hàng dưới quy định tuân thủ nghiêm ngặt của GDPR và PCI-DSS.'
    },
    problemDescription: {
      en: 'Developers created independent ingestion pipeline classes for each file format: CsvPipeline, JsonPipeline, ParquetPipeline. Each class duplicated common workflow logic: opening transactions, parsing records, masking Personally Identifiable Information (PII), and recording audit hashes. When an engineer implemented ParquetPipeline, they omitted the PII masking and audit logging steps to "improve throughput". Over 3 months, 4,500,000 unmasked customer credit card numbers and national identity IDs were written to public analytical tables, triggering a massive regulatory GDPR violation and a $1,200,000 penalty.',
      vi: 'Nhóm phát triển viết các lớp đường ống xử lý độc lập cho từng định dạng file: CsvPipeline, JsonPipeline, ParquetPipeline. Mỗi lớp tự sao chép lại các bước giống nhau: mở transaction, phân tích file, che giấu thông tin cá nhân (PII) và ghi log kiểm toán. Khi một kỹ sư viết ParquetPipeline, họ đã tự ý bỏ qua bước che giấu PII và ghi log để "tối ưu tốc độ". Suốt 3 tháng, hơn 4,500,000 số thẻ tín dụng và số CCCD không hề được che giấu đã bị ghi thẳng vào kho dữ liệu phân tích công khai, dẫn đến vi phạm nghiêm trọng luật GDPR và án phạt 1,200,000 USD.'
    },
    whyNaiveFails: {
      en: 'Relying on human memory or copy-pasting mandatory compliance steps across dozens of independent classes inevitably fails due to developer shortcuts or oversight.',
      vi: 'Trông chờ vào trí nhớ của lập trình viên hoặc sao chép mã nguồn các bước tuân thủ bảo mật chắc chắn sẽ dẫn đến thảm họa do sự cẩu thả hoặc chủ quan của con người.'
    },
    coreSolution: {
      en: 'Implement the Template Method pattern: AbstractDataIngestionPipeline defines public final void executePipeline(). It orchestrates the immutable sequence: openTransaction() -> extract() -> maskPii() -> load() -> auditLog() -> commit(). The maskPii() and auditLog() steps are marked private final in the base class, making compliance omission physically impossible for subclasses.',
      vi: 'Áp dụng mẫu Template Method: AbstractDataIngestionPipeline định nghĩa public final void executePipeline(). Nó ấn định thứ tự bất biến: mở transaction -> trích xuất dữ liệu -> che PII -> nạp dữ liệu -> ghi kiểm toán -> commit. Các bước che PII và ghi kiểm toán được đánh dấu private final trong lớp cha, khiến việc bỏ sót bước tuân thủ trở thành điều bất khả thi đối với các lớp con.'
    },
    productionCode: `// Production Compliance-Guaranteed ETL Pipeline via Template Method (Java 21)
package com.analytics.etl.template;

import java.util.List;

public abstract class AbstractDataIngestionPipeline {

    // 1. FINAL SKELETON: Subclasses CANNOT alter or bypass the execution order!
    public final void executePipeline(String sourcePath) {
        System.out.println("--- Starting Ingestion Pipeline: " + sourcePath + " ---");
        List<String> rawRecords = extractData(sourcePath);
        
        // 2. MANDATORY COMPLIANCE: Hardcoded in base class, impossible to omit!
        List<String> sanitizedRecords = maskPiiData(rawRecords);
        
        loadIntoWarehouse(sanitizedRecords);
        
        // 3. MANDATORY AUDIT: Enforced automatically
        recordAuditLog(sourcePath, sanitizedRecords.size());
        System.out.println("--- Ingestion Completed Successfully ---");
    }

    // Primitive operations deferred to specialized subclasses
    protected abstract List<String> extractData(String path);
    protected abstract void loadIntoWarehouse(List<String> data);

    // Immutable compliance steps enforced in base class
    private List<String> maskPiiData(List<String> records) {
        return records.stream()
            .map(r -> r.replaceAll("(\\d{4}-){3}\\d{4}", "XXXX-XXXX-XXXX-XXXX"))
            .toList();
    }

    private void recordAuditLog(String path, int count) {
        System.out.println("Audit logged: " + count + " records processed from " + path);
    }
}

// Subclasses only specify their unique extraction format!
public class ParquetDataIngestionPipeline extends AbstractDataIngestionPipeline {
    @Override
    protected List<String> extractData(String path) {
        return List.of("Card: 4111-2222-3333-4444, Amount: 100USD");
    }
    @Override
    protected void loadIntoWarehouse(List<String> data) {
        System.out.println("Writing to analytical Lakehouse: " + data);
    }
}`,
    architectureImpact: {
      en: 'Zero compliance bypass or PII leakage incidents; Critical audit and masking steps enforced 100% by the compiler; Format onboarding time dropped from 4 days to 2 hours.',
      vi: 'Triệt tiêu 100% nguy cơ bỏ sót quy trình tuân thủ và rò rỉ dữ liệu PII; Các bước che giấu dữ liệu được trình biên dịch áp đặt tuyệt đối; Thời gian viết pipeline cho định dạng mới giảm từ 4 ngày xuống còn 2 giờ.'
    }
  }
};
