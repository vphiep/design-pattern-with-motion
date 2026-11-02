import type { Pattern } from '../types';

export const prototype: Pattern = {
  id: 'prototype',
  category: 'creational',
  name: 'Prototype',
  tagline: {
    en: 'Create new objects by copying an existing one, instead of building from scratch.',
    vi: 'Tạo object mới bằng cách copy một object có sẵn, thay vì dựng từ đầu.'
  },
  analogy: {
    en: 'A photo printer. Instead of redrawing the picture, the printer copies the original — same colors, same composition — and prints another. Prototype says: “I’ve already got a good example; just clone it and tweak the differences.”',
    vi: 'Máy in ảnh. Thay vì vẽ lại bức tranh, máy copy bản gốc — cùng màu, cùng bố cục — rồi in thêm một tờ. Prototype nói: “Tôi đã có một mẫu tốt; hãy clone nó rồi chỉnh chỗ khác.”'
  },
  whenToUse: [
    {
      en: 'Creating an object is more expensive than copying an existing one (e.g. it reads from a database, network, or file).',
      vi: 'Tạo object từ đầu đắt hơn copy một object có sẵn (ví dụ phải đọc database, mạng, hoặc file).'
    },
    {
      en: 'You want to build many similar objects that differ only in a few fields.',
      vi: 'Bạn muốn tạo nhiều object gần giống nhau, chỉ khác vài field.'
    },
    {
      en: 'The class to instantiate is decided at runtime and you don’t want a parallel hierarchy of factories.',
      vi: 'Class cần khởi tạo được quyết định lúc runtime và bạn không muốn một hệ factory song song.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The object is cheap to construct from scratch.',
      vi: 'Object rẻ để khởi tạo từ đầu.'
    },
    {
      en: 'The object has lots of internal state that you don’t want to deep-copy, and shallow copying is unsafe.',
      vi: 'Object có nhiều state nội bộ bạn không muốn deep-copy, mà shallow copy lại không an toàn.'
    }
  ],
  difficulty: 2,
  order: 5,
  javaCode: `// Prototype: any object that can clone itself.
interface Shape extends Cloneable {
    Shape copy();
    String describe();
}

// A "template" shape with default settings.
final class Circle implements Shape {
    private final int radius;
    private final String color;
    Circle(int radius, String color) { this.radius = radius; this.color = color; }
    private Circle(Circle other)    { this.radius = other.radius; this.color = other.color; }
    @Override public Shape copy()   { return new Circle(this); }
    @Override public String describe() { return color + " circle r=" + radius; }
}

// Registry: lets you look up a prototype by name and clone it.
final class ShapeRegistry {
    private final java.util.Map<String, Shape> prototypes = new java.util.HashMap<>();
    public void register(String name, Shape proto) { prototypes.put(name, proto); }
    public Shape create(String name)                { return prototypes.get(name).copy(); }
}

// Usage:
//   registry.register("default-circle", new Circle(10, "orange"));
//   Shape a = registry.create("default-circle"); // a brand new Circle
//   Shape b = registry.create("default-circle"); // another one`,
  steps: [
    {
      title: {
        en: 'Keep a finished object as the template',
        vi: 'Giữ một object hoàn chỉnh làm mẫu'
      },
      body: {
        en: 'ShapeRegistry.register(name, proto) stores a live Shape — here a Circle that already knows its radius and color — under a name. That stored object is the prototype: a finished example, not a class. Callers who want “another one like that” will never call the Circle constructor themselves.',
        vi: 'ShapeRegistry.register(name, proto) cất một Shape đang sống — ở đây là Circle đã biết radius và color — theo một tên. Object được lưu đó chính là prototype: một mẫu hoàn chỉnh, không phải một class. Caller muốn “thêm một cái giống vậy” sẽ không tự gọi constructor của Circle.'
      }
    },
    {
      title: {
        en: 'The prototype knows how to copy itself',
        vi: 'Prototype biết cách copy chính mình'
      },
      body: {
        en: 'Shape.copy() is the cloning operation. Circle implements it with a private copy constructor: new Circle(this) copies radius and color onto a brand-new instance. The prototype decides what “copy” means — shallow or deep — so the registry never pokes at Circle’s fields.',
        vi: 'Shape.copy() là thao tác clone. Circle implement bằng một copy constructor private: new Circle(this) chép radius và color sang instance mới tinh. Prototype tự quyết “copy” nghĩa là gì — nông hay sâu — nên registry không bao giờ sờ vào field của Circle.'
      }
    },
    {
      title: {
        en: 'create() clones the named prototype',
        vi: 'create() clone prototype theo tên'
      },
      body: {
        en: 'ShapeRegistry.create(name) looks the prototype up and runs return prototypes.get(name).copy(). Each call yields a new Circle; the original stays in the map as the template. Two creates give you two independent instances that started from the same example.',
        vi: 'ShapeRegistry.create(name) tìm prototype rồi chạy return prototypes.get(name).copy(). Mỗi lần gọi cho ra một Circle mới; bản gốc vẫn nằm trong map làm mẫu. Hai lần create cho bạn hai instance độc lập, cùng xuất phát từ một ví dụ.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.lang.Object.clone() and Cloneable',
      note: {
        en: 'The JDK’s built-in prototype hook is Object.clone(). Classes that implement Cloneable and override clone() produce a field-for-field copy; ArrayList.clone() and HashMap.clone() are the everyday examples.',
        vi: 'Hook prototype có sẵn trong JDK là Object.clone(). Class implement Cloneable và override clone() tạo bản sao từng field; ArrayList.clone() và HashMap.clone() là ví dụ dùng hằng ngày.'
      }
    },
    {
      system: 'java.awt.datatransfer — Transferable copies',
      note: {
        en: 'AWT’s clipboard path often clones transferable data so the source and the paste target do not share a mutable object. The copy, not a shared reference, is what travels.',
        vi: 'Đường clipboard của AWT thường clone dữ liệu transferable để nguồn và chỗ paste không dùng chung một object mutable. Thứ đi đường là bản sao, không phải reference dùng chung.'
      }
    }
  ]
};
