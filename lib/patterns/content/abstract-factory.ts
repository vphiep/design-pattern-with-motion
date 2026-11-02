import type { Pattern } from '../types';

export const abstractFactory: Pattern = {
  id: 'abstract-factory',
  category: 'creational',
  name: 'Abstract Factory',
  tagline: {
    en: 'Group related factories together so you can build a whole family of objects without mixing and matching.',
    vi: 'Gom các factory liên quan lại với nhau để bạn dựng cả một họ object mà không bị trộn lẫn.'
  },
  analogy: {
    en: 'A furniture shop sells “kits” — a Victorian kit comes with a velvet sofa, a carved table, and brass lamps, all in the same style. A Modern kit comes with a different sofa, table, and lamps. The shop gives you a whole coherent set, not loose parts you have to mix yourself.',
    vi: 'Cửa hàng nội thất bán theo “bộ kit” — kit Victorian gồm ghế sofa nhung, bàn chạm khắc và đèn đồng, cùng một phong cách. Kit Modern thì sofa, bàn, đèn khác hẳn. Cửa hàng đưa bạn cả bộ khớp nhau, không phải linh kiện rời để tự phối.'
  },
  whenToUse: [
    {
      en: 'Your code needs to create families of related objects that are designed to work together.',
      vi: 'Code của bạn cần tạo cả họ object liên quan, vốn được thiết kế để đi cùng nhau.'
    },
    {
      en: 'You want to enforce that a sofa can never pair with a “wrong-style” table.',
      vi: 'Bạn muốn đảm bảo một ghế sofa không bao giờ bị ghép với một cái bàn “sai phong cách”.'
    },
    {
      en: 'You want to swap the entire family at once (light theme vs. dark theme, Windows vs. Mac UI).',
      vi: 'Bạn muốn đổi cả họ object cùng lúc (theme sáng / tối, UI Windows / Mac).'
    }
  ],
  whenNotToUse: [
    {
      en: 'You only create one kind of product — a plain factory is enough.',
      vi: 'Bạn chỉ tạo một loại product — một factory thường là đủ.'
    },
    {
      en: 'The families are likely to change often in incompatible ways, since adding a new product type means changing every factory.',
      vi: 'Các họ product hay thay đổi theo hướng không tương thích — thêm một kiểu product mới nghĩa là phải sửa mọi factory.'
    }
  ],
  difficulty: 2,
  order: 3,
  javaCode: `// Two product families: a Light theme and a Dark theme.
// Each family has a Button and a Checkbox.
interface Button { void render(); }
interface Checkbox { void render(); }

final class LightButton implements Button { public void render() { System.out.println("[ light button ]"); } }
final class LightCheckbox implements Checkbox { public void render() { System.out.println("[ light checkbox ]"); } }
final class DarkButton implements Button { public void render() { System.out.println("[ dark  button ]"); } }
final class DarkCheckbox implements Checkbox { public void render() { System.out.println("[ dark  checkbox ]"); } }

// The abstract factory: it knows how to build every product in a family.
interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

// Concrete factories bundle a coherent set.
final class LightUIFactory implements UIFactory {
    public Button createButton()   { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}
final class DarkUIFactory implements UIFactory {
    public Button createButton()   { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}

// Client code only talks to the factory interface — it never names a
// concrete product. That means the whole family can be swapped at once.
final class Form {
    private final Button button;
    private final Checkbox checkbox;
    Form(UIFactory factory) {
        this.button = factory.createButton();
        this.checkbox = factory.createCheckbox();
    }
    void paint() { button.render(); checkbox.render(); }
}`,
  steps: [
    {
      title: {
        en: 'One factory interface names the whole family',
        vi: 'Một interface factory đặt tên cả họ product'
      },
      body: {
        en: 'UIFactory is the abstract factory: it lists every product the family must provide — createButton() and createCheckbox(). Nothing here is a concrete widget. Client code such as Form will depend on this interface alone, so a Light kit and a Dark kit are interchangeable as far as Form is concerned.',
        vi: 'UIFactory là abstract factory: nó liệt kê mọi product mà một họ phải có — createButton() và createCheckbox(). Ở đây chưa có widget concrete nào. Code client như Form sẽ chỉ phụ thuộc interface này, nên bộ kit Light và kit Dark hoán đổi được với nhau đối với Form.'
      }
    },
    {
      title: {
        en: 'A concrete factory builds one coherent kit',
        vi: 'Một factory concrete dựng một bộ kit khớp nhau'
      },
      body: {
        en: 'LightUIFactory implements UIFactory and its createButton() returns a LightButton. DarkUIFactory does the same for the dark family. Each factory is a sealed kit: you cannot accidentally ask a Light factory for a Dark checkbox, because that method simply does not exist on this object.',
        vi: 'LightUIFactory implement UIFactory và createButton() của nó trả về LightButton. DarkUIFactory làm tương tự cho họ dark. Mỗi factory là một bộ kit khép kín: bạn không thể vô tình hỏi factory Light lấy checkbox Dark, vì method đó không tồn tại trên object này.'
      }
    },
    {
      title: {
        en: 'Matching parts come from the same factory',
        vi: 'Các mảnh khớp nhau đến từ cùng một factory'
      },
      body: {
        en: 'createCheckbox() is the second product in the family. Form’s constructor calls both factory methods on the same UIFactory instance, so the Button and Checkbox always share a theme. Swap the factory you pass into new Form(...) and the entire family switches together — no mixed kit.',
        vi: 'createCheckbox() là product thứ hai trong họ. Constructor của Form gọi cả hai factory method trên cùng một instance UIFactory, nên Button và Checkbox luôn chung theme. Đổi factory bạn truyền vào new Form(...) thì cả họ đổi cùng lúc — không có bộ kit lai.'
      }
    }
  ],
  realSystems: [
    {
      system: 'javax.xml.parsers.DocumentBuilderFactory',
      note: {
        en: 'DocumentBuilderFactory.newInstance() returns a vendor-specific factory; that factory then creates DocumentBuilder instances that belong to the same parser family. Application code never names Xerces or the JDK’s built-in parser.',
        vi: 'DocumentBuilderFactory.newInstance() trả về factory theo nhà cung cấp; factory đó rồi tạo các DocumentBuilder thuộc cùng một họ parser. Code ứng dụng không bao giờ gọi tên Xerces hay parser có sẵn trong JDK.'
      }
    },
    {
      system: 'java.sql.Connection',
      note: {
        en: 'A JDBC Connection is an abstract factory for Statement, PreparedStatement, and CallableStatement. The driver you connected with decides the concrete family; your SQL code stays on the interfaces.',
        vi: 'JDBC Connection là một abstract factory cho Statement, PreparedStatement và CallableStatement. Driver bạn đã kết nối quyết định họ concrete; code SQL của bạn vẫn chỉ đứng trên các interface.'
      }
    },
    {
      system: 'java.awt.Toolkit.getDefaultToolkit()',
      note: {
        en: 'AWT’s Toolkit is the platform factory: it produces the peer widgets (buttons, windows, images) that match the host OS. Swap the toolkit and the whole widget family changes together.',
        vi: 'Toolkit của AWT là factory theo nền tảng: nó tạo các widget peer (nút, cửa sổ, ảnh) khớp với hệ điều hành host. Đổi toolkit thì cả họ widget đổi cùng nhau.'
      }
    }
  ]
};
