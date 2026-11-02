import type { Pattern } from '../types';

export const bridge: Pattern = {
  id: 'bridge',
  category: 'structural',
  name: 'Bridge',
  tagline: {
    en: 'Split a class into two independent hierarchies — abstraction on one side, implementation on the other — connected by a pointer.',
    vi: 'Tách một class thành hai hệ phân cấp độc lập — abstraction một bên, implementation một bên — nối với nhau bằng một reference.'
  },
  analogy: {
    en: 'A TV remote (the abstraction) and the TV it controls (the implementation) are made by different companies. The remote doesn’t care if it’s pointing at a Sony, an LG, or a Samsung. As long as the TV follows the same infrared protocol, any remote works with any TV. The remote *has* a TV — that “has” is the bridge.',
    vi: 'Chiếc remote TV (abstraction) và cái TV nó điều khiển (implementation) do hai công ty khác nhau sản xuất. Remote không quan tâm nó đang chĩa vào Sony, LG hay Samsung. Miễn là TV tuân theo cùng một giao thức hồng ngoại, remote nào cũng điều khiển được TV nào. Remote *có* một cái TV — chữ “có” đó chính là cây cầu.'
  },
  whenToUse: [
    {
      en: 'You want to vary both the abstraction and the implementation independently.',
      vi: 'Bạn muốn thay đổi abstraction và implementation một cách độc lập với nhau.'
    },
    {
      en: 'You have a class explosion: a Cartesian × Raster × Shape × Color matrix is becoming unmanageable.',
      vi: 'Bạn đang bị bùng nổ class: ma trận tổ hợp kiểu Cartesian × Raster × Shape × Color bắt đầu vượt tầm kiểm soát.'
    },
    {
      en: 'You want to hide implementation details completely from the code using the abstraction.',
      vi: 'Bạn muốn giấu hoàn toàn chi tiết implementation khỏi phần code đang dùng abstraction.'
    }
  ],
  whenNotToUse: [
    {
      en: 'There’s only one implementation and you don’t see that changing.',
      vi: 'Chỉ có đúng một implementation và bạn không thấy khả năng điều đó thay đổi.'
    },
    {
      en: 'The two sides are tightly coupled for a reason — splitting them adds indirection for no gain.',
      vi: 'Hai phía gắn chặt với nhau là có lý do — tách chúng ra chỉ thêm một tầng gián tiếp mà không được lợi gì.'
    }
  ],
  difficulty: 2,
  order: 7,
  javaCode: `// The "implementation" side: how a shape is drawn.
interface Renderer {
    void drawCircle(int x, int y, int radius);
}
final class VectorRenderer implements Renderer {
    public void drawCircle(int x, int y, int r) {
        System.out.println("Drawing circle radius " + r + " at (" + x + "," + y + ") as VECTORS");
    }
}
final class RasterRenderer implements Renderer {
    public void drawCircle(int x, int y, int r) {
        System.out.println("Drawing circle radius " + r + " at (" + x + "," + y + ") as PIXELS");
    }
}

// The "abstraction" side: a shape *has* a renderer (the bridge).
abstract class Shape {
    protected final Renderer renderer; // <-- the bridge
    protected Shape(Renderer renderer) { this.renderer = renderer; }
    public abstract void draw();
}
final class Circle extends Shape {
    private final int x, y, radius;
    Circle(Renderer r, int x, int y, int radius) {
        super(r);
        this.x = x; this.y = y; this.radius = radius;
    }
    @Override public void draw() { renderer.drawCircle(x, y, radius); }
}

// Combine any shape with any renderer. No Cartesian explosion.`,
  steps: [
    {
      title: {
        en: 'The implementation side stands alone',
        vi: 'Phía implementation đứng riêng'
      },
      body: {
        en: 'The Renderer interface is one complete hierarchy by itself: it declares drawCircle(x, y, radius), and VectorRenderer and RasterRenderer each implement it with a different drawing technique. Notice that nothing on this side knows what a Shape is — it only knows how to put vectors or pixels on screen.',
        vi: 'Interface Renderer tự nó là nguyên một hệ phân cấp hoàn chỉnh: nó khai báo drawCircle(x, y, radius), còn VectorRenderer và RasterRenderer mỗi class implement theo một kỹ thuật vẽ khác nhau. Để ý rằng phía này không hề biết Shape là gì — nó chỉ biết cách đưa vector hay pixel lên màn hình.'
      }
    },
    {
      title: {
        en: 'One field is the bridge',
        vi: 'Một field chính là cây cầu'
      },
      body: {
        en: 'The abstract class Shape is the other hierarchy, and the highlighted field protected final Renderer renderer is the bridge itself: every Shape holds a reference to some Renderer, handed in through its constructor. That single “has-a” field is what lets you pair any shape with any renderer, instead of writing a subclass for every combination.',
        vi: 'Class abstract Shape là hệ phân cấp còn lại, và field được highlight protected final Renderer renderer chính là cây cầu: mỗi Shape giữ một reference tới một Renderer nào đó, được truyền vào qua constructor. Chỉ một field “has-a” đó thôi đã cho phép bạn ghép bất kỳ shape nào với bất kỳ renderer nào, thay vì phải viết subclass cho từng tổ hợp.'
      }
    },
    {
      title: {
        en: 'Drawing delegates across the bridge',
        vi: 'Vẽ bằng cách ủy quyền qua cầu'
      },
      body: {
        en: 'When you call draw() on a Circle, it doesn’t render anything itself — the highlighted line renderer.drawCircle(x, y, radius) sends its own coordinates across the bridge to whichever Renderer it was built with. A Circle holding a VectorRenderer prints vectors; the very same Circle class holding a RasterRenderer prints pixels. Either hierarchy can grow new members without touching the other.',
        vi: 'Khi bạn gọi draw() trên một Circle, nó không tự vẽ gì cả — dòng được highlight renderer.drawCircle(x, y, radius) gửi tọa độ của chính nó qua cầu, tới đúng Renderer mà nó được tạo cùng. Circle cầm VectorRenderer thì in ra vector; vẫn class Circle đó cầm RasterRenderer thì in ra pixel. Mỗi hệ phân cấp đều có thể mọc thêm thành viên mới mà không đụng đến bên kia.'
      }
    }
  ],
  realSystems: [
    {
      system: 'JDBC — java.sql.DriverManager + java.sql.Driver',
      note: {
        en: 'Application code talks to the JDBC API — the abstraction side — while each database vendor ships its own Driver implementation for MySQL, Postgres, Oracle, and so on. Either side evolves independently: your queries don’t change when a vendor rewrites its driver, and vendors don’t wait on the JDK to support a new database.',
        vi: 'Code ứng dụng nói chuyện với JDBC API — phía abstraction — trong khi mỗi hãng database tự phát hành implementation Driver của riêng mình cho MySQL, Postgres, Oracle... Hai phía tiến hóa độc lập: câu query của bạn không phải đổi khi hãng viết lại driver, và các hãng cũng không phải chờ JDK mới hỗ trợ được một database mới.'
      }
    },
    {
      system: 'AWT peers — java.awt.Component',
      note: {
        en: 'In AWT’s historical peer architecture, the Component hierarchy your code used delegated to platform “peer” objects that did the per-OS rendering — two separate hierarchies joined by a reference, exactly the bridge shape on this page.',
        vi: 'Trong kiến trúc peer trước đây của AWT, hệ phân cấp Component mà code của bạn dùng sẽ ủy quyền cho các object “peer” đảm nhận việc vẽ trên từng hệ điều hành — hai hệ phân cấp tách biệt, nối với nhau bằng một reference, đúng y hình dáng bridge trên trang này.'
      }
    },
    {
      system: 'Cross-platform graphics APIs (non-Java)',
      note: {
        en: 'Many graphics and windowing toolkits keep a “window” abstraction that delegates to a per-platform backend (Windows, macOS, X11). The window API stays stable while each backend evolves with its operating system — the same two-hierarchy split.',
        vi: 'Nhiều toolkit đồ họa và cửa sổ giữ một abstraction “window” và ủy quyền cho backend riêng của từng nền tảng (Windows, macOS, X11). API window giữ nguyên ổn định trong khi mỗi backend thay đổi theo hệ điều hành của nó — vẫn là kiểu tách đôi thành hai hệ phân cấp.'
      }
    }
  ]
};
