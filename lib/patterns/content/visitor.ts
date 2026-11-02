import type { Pattern } from '../types';

export const visitor: Pattern = {
  id: 'visitor',
  category: 'behavioral',
  name: 'Visitor',
  tagline: {
    en: 'Move operations out of the objects they work on, by passing in an external “visitor” that does the work.',
    vi: 'Đưa thao tác ra khỏi object mà nó làm việc, bằng cách truyền vào một “visitor” bên ngoài làm việc đó.'
  },
  analogy: {
    en: 'A tax inspector visiting different businesses. The inspector knows how to handle each kind: a bakery, a bank, a bookstore. The businesses don’t need to know what taxes are calculated — they just accept the visitor and let it do its work. Adding a new tax? Just send a new inspector. No business needs to change.',
    vi: 'Thanh tra thuế đi thăm từng cơ sở. Thanh tra biết cách xử lý từng loại: tiệm bánh, ngân hàng, hiệu sách. Cơ sở không cần biết thuế tính ra sao — chúng chỉ accept visitor và để người đó làm việc. Thêm một loại thuế? Cứ gửi thanh tra mới. Không cơ sở nào phải sửa.'
  },
  whenToUse: [
    {
      en: 'You need to perform many different operations on a structure of objects, and you don’t want to bloat those classes.',
      vi: 'Bạn cần nhiều thao tác khác nhau trên một cấu trúc object, và không muốn làm phình các class đó.'
    },
    {
      en: 'The object structure is stable, but the operations on it change or grow often.',
      vi: 'Cấu trúc object ổn định, nhưng các thao tác trên nó hay đổi hoặc hay tăng.'
    },
    {
      en: 'You want related operations grouped together in one class instead of scattered across the data classes.',
      vi: 'Bạn muốn các thao tác liên quan nằm chung một class, không rải trên các class dữ liệu.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The object structure changes a lot — adding a new object type means updating every visitor.',
      vi: 'Cấu trúc object hay đổi — thêm một kiểu object nghĩa là phải sửa mọi visitor.'
    },
    {
      en: 'The structure is small and the operations are few — a plain method is clearer.',
      vi: 'Cấu trúc nhỏ và thao tác ít — một method thường rõ hơn.'
    }
  ],
  difficulty: 3,
  order: 23,
  javaCode: `// Element types: each accepts a visitor.
interface Asset { void accept(AssetVisitor v); }
final class Stock   implements Asset { public void accept(AssetVisitor v) { v.visit(this); } String ticker; Stock(String t){ticker=t;} }
final class Bond    implements Asset { public void accept(AssetVisitor v) { v.visit(this); } double face; Bond(double f){face=f;} }
final class Deposit implements Asset { public void accept(AssetVisitor v) { v.visit(this); } double amount; Deposit(double a){amount=a;} }

// The visitor: one method per element type. Add a new operation? Write a new visitor.
interface AssetVisitor {
    void visit(Stock s);
    void visit(Bond b);
    void visit(Deposit d);
}
final class ValueReport implements AssetVisitor {
    public void visit(Stock s)    { System.out.println("valuing stock " + s.ticker); }
    public void visit(Bond b)     { System.out.println("valuing bond face=" + b.face); }
    public void visit(Deposit d)  { System.out.println("valuing deposit " + d.amount); }
}`,
  steps: [
    {
      title: {
        en: 'Each element accepts a visitor',
        vi: 'Mỗi element accept một visitor'
      },
      body: {
        en: 'Asset declares void accept(AssetVisitor v). Stock, Bond, and Deposit implement that one method. Accept is the handshake: the element agrees to let an outsider in. The operation itself does not live on Asset.',
        vi: 'Asset khai báo void accept(AssetVisitor v). Stock, Bond và Deposit implement đúng method đó. Accept là cái bắt tay: element đồng ý cho người ngoài vào. Bản thân thao tác không sống trên Asset.'
      }
    },
    {
      title: {
        en: 'accept() turns around and calls visit(this)',
        vi: 'accept() quay lại gọi visit(this)'
      },
      body: {
        en: 'Stock.accept runs the highlighted v.visit(this). Because the argument is this, the compiler picks visit(Stock) — not visit(Bond). That second dispatch is why Visitor can put the operation in the visitor and still run the overload that matches the concrete element.',
        vi: 'Stock.accept chạy dòng v.visit(this) được highlight. Vì tham số là this, compiler chọn visit(Stock) — không phải visit(Bond). Dispatch lần hai đó là lý do Visitor để thao tác trên visitor mà vẫn chạy đúng overload khớp element concrete.'
      }
    },
    {
      title: {
        en: 'The operation lives on the visitor, one method per type',
        vi: 'Thao tác sống trên visitor, mỗi kiểu một method'
      },
      body: {
        en: 'ValueReport implements visit(Stock), visit(Bond), and visit(Deposit). A new report is a new visitor class; Stock does not grow a value() method. The stable structure (three asset types) can host many operations without bloating the assets.',
        vi: 'ValueReport implement visit(Stock), visit(Bond) và visit(Deposit). Một báo cáo mới là một class visitor mới; Stock không mọc thêm method value(). Cấu trúc ổn định (ba kiểu asset) chứa được nhiều thao tác mà không làm phình asset.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.nio.file.FileVisitor',
      note: {
        en: 'Files.walkFileTree accepts a FileVisitor whose visitFile, preVisitDirectory, and postVisitDirectory are called as the walk hits each path. The operation (index, delete, copy) is the visitor; Path stays a path.',
        vi: 'Files.walkFileTree nhận FileVisitor với visitFile, preVisitDirectory và postVisitDirectory được gọi khi walk chạm từng path. Thao tác (index, xóa, copy) là visitor; Path vẫn chỉ là path.'
      }
    },
    {
      system: 'javax.lang.model.element.ElementVisitor',
      note: {
        en: 'Annotation processors walk a program with ElementVisitor / TypeVisitor / AnnotationValueVisitor. javac’s tree API (com.sun.source.tree.TreeVisitor) is the same shape for source ASTs.',
        vi: 'Annotation processor đi trên chương trình bằng ElementVisitor / TypeVisitor / AnnotationValueVisitor. Tree API của javac (com.sun.source.tree.TreeVisitor) cùng hình đó cho AST nguồn.'
      }
    },
    {
      system: 'ASM — org.objectweb.asm.ClassVisitor',
      note: {
        en: 'ASM’s ClassVisitor / MethodVisitor receive callbacks as a class file is parsed. Adding an analysis is a new visitor; the bytecode reader does not grow new operations.',
        vi: 'ClassVisitor / MethodVisitor của ASM nhận callback khi class file được parse. Thêm một phép phân tích là visitor mới; bộ đọc bytecode không mọc thao tác mới.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Classic Visitor needs accept plus a visit overload per type — double dispatch, two hierarchies. With a sealed Asset and pattern-matching switch, the operation can be a static method: the compiler exhausts Stock, Bond, and Deposit, and a new asset type is a compile error in every switch. The visitor interface can go away.',
      vi: 'Visitor cổ điển cần accept cộng một overload visit cho mỗi kiểu — double dispatch, hai hệ phân cấp. Với Asset sealed và switch pattern-matching, thao tác có thể là method static: compiler duyệt hết Stock, Bond và Deposit, và một kiểu asset mới là lỗi biên dịch ở mọi switch. Interface visitor có thể biến mất.'
    },
    tradeoffs: {
      en: 'Sealed + switch is shorter and local (the whole operation sits in one method). You lose the ability to add an operation without touching a shared switch if many reports live in different modules — classic Visitor still wins then. You also need Java 17+ sealed types. Use the switch when the structure is closed and in your codebase; keep Visitor when operations are plugins.',
      vi: 'Sealed + switch thì ngắn và local (cả thao tác nằm trong một method). Bạn mất khả năng thêm thao tác mà không đụng switch dùng chung nếu nhiều báo cáo sống ở module khác — Visitor cổ điển vẫn thắng lúc đó. Bạn cũng cần sealed type từ Java 17+. Dùng switch khi cấu trúc đóng và nằm trong codebase của bạn; giữ Visitor khi thao tác là plugin.'
    },
    javaCode: `sealed interface Asset permits Stock, Bond, Deposit {}
record Stock(String ticker)   implements Asset {}
record Bond(double face)      implements Asset {}
record Deposit(double amount) implements Asset {}

// One operation, no visitor interface: the switch is exhaustive.
final class ValueReport {
    static String value(Asset a) {
        return switch (a) {
            case Stock s   -> "valuing stock " + s.ticker();
            case Bond b    -> "valuing bond face=" + b.face();
            case Deposit d -> "valuing deposit " + d.amount();
        };
    }
}`
  }
};
