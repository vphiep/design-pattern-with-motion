import type { Pattern } from '../types';

export const strategy: Pattern = {
  id: 'strategy',
  category: 'behavioral',
  name: 'Strategy',
  tagline: {
    en: 'Define a family of algorithms, make them interchangeable, and pick one at runtime.',
    vi: 'Định nghĩa một họ thuật toán, làm chúng hoán đổi được, và chọn một cái lúc runtime.'
  },
  analogy: {
    en: 'A navigation app. “Get me to the office” can be Fastest, Shortest, Scenic, or Avoiding Tolls. Each is a different way of solving the same problem. The app swaps the strategy based on what you tap, without rewriting the route engine. Strategy is the same: one slot, many interchangeable plans.',
    vi: 'Ứng dụng chỉ đường. “Đưa tôi tới văn phòng” có thể là Nhanh nhất, Ngắn nhất, Đẹp cảnh, hoặc Tránh trạm thu phí. Mỗi cái là một cách giải cùng bài toán. App đổi strategy theo nút bạn bấm, không viết lại engine định tuyến. Strategy cũng vậy: một slot, nhiều kế hoạch thay được.'
  },
  whenToUse: [
    {
      en: 'You have multiple ways to do something, and the choice depends on context or user preference.',
      vi: 'Bạn có nhiều cách làm một việc, và lựa chọn phụ thuộc ngữ cảnh hoặc sở thích user.'
    },
    {
      en: 'You have a long if/else picking between algorithms, and you want to clean it up.',
      vi: 'Bạn đang có if/else dài để chọn thuật toán, và muốn dọn nó.'
    },
    {
      en: 'You want to swap algorithms at runtime, e.g. for testing or configuration.',
      vi: 'Bạn muốn đổi thuật toán lúc runtime, ví dụ để test hoặc cấu hình.'
    }
  ],
  whenNotToUse: [
    {
      en: 'There’s only one algorithm and you don’t see that changing.',
      vi: 'Chỉ có một thuật toán và bạn không thấy khả năng điều đó đổi.'
    },
    {
      en: 'The algorithms are so different that they don’t share an interface — forcing them into one is awkward.',
      vi: 'Các thuật toán khác nhau đến mức không chung interface — ép chúng vào một cái thì gượng.'
    }
  ],
  difficulty: 1,
  order: 21,
  javaCode: `// The strategy: a family of interchangeable algorithms.
interface PricingStrategy {
    double totalFor(double basePrice, int quantity);
}
final class NoDiscount implements PricingStrategy {
    public double totalFor(double p, int q) { return p * q; }
}
final class BulkDiscount implements PricingStrategy {
    public double totalFor(double p, int q) { return p * q * (q >= 10 ? 0.8 : 1.0); }
}
final class SeasonalDiscount implements PricingStrategy {
    public double totalFor(double p, int q) { return p * q * 0.7; }
}

// The context: it holds a strategy and delegates the work.
final class Checkout {
    private PricingStrategy pricing;
    public void set(PricingStrategy s) { this.pricing = s; }
    public double quote(double p, int q) { return pricing.totalFor(p, q); }
}

// Checkout c = new Checkout();
// c.set(new BulkDiscount());
// c.quote(10.0, 12);  -> 96.0  (20% off because q >= 10)`,
  steps: [
    {
      title: {
        en: 'A family of plans shares one interface',
        vi: 'Một họ kế hoạch dùng chung một interface'
      },
      body: {
        en: 'PricingStrategy declares totalFor(basePrice, quantity). NoDiscount, BulkDiscount, and SeasonalDiscount each implement that one method with a different formula. They are interchangeable because they answer the same question.',
        vi: 'PricingStrategy khai báo totalFor(basePrice, quantity). NoDiscount, BulkDiscount và SeasonalDiscount mỗi bên implement đúng method đó với công thức khác. Chúng hoán đổi được vì cùng trả lời một câu hỏi.'
      }
    },
    {
      title: {
        en: 'The context holds one slot you can swap',
        vi: 'Context giữ một slot có thể đổi'
      },
      body: {
        en: 'Checkout.set(PricingStrategy s) is the slot. The checkout object is the context: it does not contain the formulas. Installing BulkDiscount versus SeasonalDiscount is a single assignment, not a rewrite of quote().',
        vi: 'Checkout.set(PricingStrategy s) là cái slot. Object checkout là context: nó không chứa các công thức. Gắn BulkDiscount hay SeasonalDiscount chỉ là một phép gán, không phải viết lại quote().'
      }
    },
    {
      title: {
        en: 'The work is delegated to whichever plan is installed',
        vi: 'Việc được ủy quyền cho đúng kế hoạch đang gắn'
      },
      body: {
        en: 'quote() does not switch on a type. The highlighted return pricing.totalFor(...) forwards the numbers to the current strategy. Change the strategy between calls and the next quote uses the new plan — same checkout, different algorithm.',
        vi: 'quote() không switch theo kiểu. Dòng return pricing.totalFor(...) được highlight chuyển số sang strategy hiện tại. Đổi strategy giữa hai lần gọi thì quote sau dùng kế hoạch mới — cùng checkout, thuật toán khác.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.util.Comparator',
      note: {
        en: 'Collections.sort and TreeMap take a Comparator — a strategy for “which comes first.” The sort algorithm stays fixed; you swap the comparison. Comparator.comparing(...) is the everyday form.',
        vi: 'Collections.sort và TreeMap nhận Comparator — strategy cho “cái nào đi trước.” Thuật toán sort giữ nguyên; bạn đổi cách so. Comparator.comparing(...) là dạng dùng hằng ngày.'
      }
    },
    {
      system: 'java.util.concurrent.ThreadPoolExecutor.RejectedExecutionHandler',
      note: {
        en: 'When the pool is full, the executor calls its RejectedExecutionHandler. AbortPolicy, CallerRunsPolicy, DiscardPolicy, and DiscardOldestPolicy are interchangeable rejection strategies.',
        vi: 'Khi pool đầy, executor gọi RejectedExecutionHandler. AbortPolicy, CallerRunsPolicy, DiscardPolicy và DiscardOldestPolicy là các strategy từ chối hoán đổi được.'
      }
    },
    {
      system: 'java.awt.LayoutManager',
      note: {
        en: 'A Container delegates layout to a LayoutManager. BorderLayout, FlowLayout, and GridBagLayout are strategies for the same “place these children” problem.',
        vi: 'Container ủy quyền layout cho LayoutManager. BorderLayout, FlowLayout và GridBagLayout là strategy cho cùng bài “đặt các child này.”'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'A class per formula is right when the algorithm has a name and a home. When the formula is a one-liner, a lambda *is* the strategy: Checkout.set((p, q) -> p * q * 0.8) installs BulkDiscount without a type. PricingStrategy is already a functional interface.',
      vi: 'Mỗi công thức một class đúng khi thuật toán có tên và chỗ đứng. Khi công thức chỉ một dòng, lambda *chính là* strategy: Checkout.set((p, q) -> p * q * 0.8) gắn BulkDiscount mà không cần thêm type. PricingStrategy vốn đã là functional interface.'
    },
    tradeoffs: {
      en: 'Lambdas are short and excellent in tests. They are anonymous, so logs and heap dumps get worse, and a strategy that later grows fields has to become a class again. Keep named classes for policies you talk about in meetings; use lambdas for local, throwaway plans.',
      vi: 'Lambda thì ngắn và rất hợp trong test. Chúng vô danh, nên log và heap dump tệ hơn, và một strategy sau này mọc field thì phải trở lại thành class. Giữ class có tên cho policy bạn nói trên họp; dùng lambda cho kế hoạch local, dùng xong bỏ.'
    },
    javaCode: `interface PricingStrategy {
    double totalFor(double basePrice, int quantity);
}

final class Checkout {
    private PricingStrategy pricing;
    public void set(PricingStrategy s) { this.pricing = s; }
    public double quote(double p, int q) { return pricing.totalFor(p, q); }
}

// Checkout c = new Checkout();
// c.set((p, q) -> p * q);                       // NoDiscount
// c.set((p, q) -> p * q * (q >= 10 ? 0.8 : 1)); // BulkDiscount
// c.set((p, q) -> p * q * 0.7);                 // SeasonalDiscount
// c.quote(10.0, 12);`
  }
};
