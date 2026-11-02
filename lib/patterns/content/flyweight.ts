import type { Pattern } from '../types';

export const flyweight: Pattern = {
  id: 'flyweight',
  category: 'structural',
  name: 'Flyweight',
  tagline: {
    en: 'Share identical parts of objects so a huge number of fine-grained things don’t eat all your memory.',
    vi: 'Chia sẻ phần giống nhau của object để hàng loạt thứ nhỏ không nuốt hết bộ nhớ.'
  },
  analogy: {
    en: 'A forest in a video game. There might be 100,000 trees, but they only need a handful of tree *types* (oak, pine, maple). The type — color, texture, shape — is shared. Each tree’s position and age are unique and live with the tree itself. Sharing the shared parts keeps memory sane.',
    vi: 'Khu rừng trong game. Có thể có 100.000 cái cây, nhưng chỉ cần vài *loại* cây (sồi, thông, phong). Loại — màu, texture, hình dạng — được dùng chung. Vị trí và tuổi mỗi cây thì riêng, sống cùng cái cây đó. Chia sẻ phần dùng chung giúp bộ nhớ còn thở được.'
  },
  whenToUse: [
    {
      en: 'Your app creates a very large number of similar objects and memory is becoming a problem.',
      vi: 'Ứng dụng tạo rất nhiều object gần giống nhau và bộ nhớ bắt đầu thành vấn đề.'
    },
    {
      en: 'Most of an object’s state can be made extrinsic (passed in) so the intrinsic part is shareable.',
      vi: 'Phần lớn state của object có thể biến thành extrinsic (truyền vào lúc dùng) để phần intrinsic chia sẻ được.'
    },
    {
      en: 'You can identify a small set of “kinds” and reuse them instead of constructing new ones.',
      vi: 'Bạn xác định được một tập “loại” nhỏ và tái dùng chúng thay vì tạo mới.'
    }
  ],
  whenNotToUse: [
    {
      en: 'You only have a handful of objects — sharing saves nothing and complicates the code.',
      vi: 'Bạn chỉ có vài object — chia sẻ chẳng tiết kiệm gì mà làm code rối hơn.'
    },
    {
      en: 'Almost all of an object’s state is unique, so there’s nothing to share.',
      vi: 'Gần như mọi state của object đều riêng, nên chẳng có gì để share.'
    }
  ],
  difficulty: 3,
  order: 11,
  javaCode: `import java.util.HashMap;
import java.util.Map;

// The shared, intrinsic part. Many trees can refer to the same TreeType.
final class TreeType {
    private final String name;
    private final String color;
    TreeType(String name, String color) { this.name = name; this.color = color; }
    public void draw(int x, int y) {
        System.out.println(name + " tree (" + color + ") at (" + x + "," + y + ")");
    }
}

// The flyweight factory: returns the same TreeType for the same key.
final class TreeFactory {
    private static final Map<String, TreeType> cache = new HashMap<>();
    public static TreeType get(String name, String color) {
        return cache.computeIfAbsent(name + "|" + color, k -> new TreeType(name, color));
    }
}

// The unique, extrinsic part: a tree in the forest. It holds only its
// position; the type is shared via the factory.
final class Tree {
    private final int x, y;
    private final TreeType type; // shared!
    Tree(int x, int y, TreeType type) { this.x = x; this.y = y; this.type = type; }
    public void draw() { type.draw(x, y); }
}`,
  steps: [
    {
      title: {
        en: 'Intrinsic state lives on the shared type',
        vi: 'State intrinsic sống trên type dùng chung'
      },
      body: {
        en: 'TreeType holds the parts that do not change per tree: a name and a color. draw(x, y) takes position as arguments because position is extrinsic — it belongs to a particular tree, not to the type. Many Tree instances will point at one TreeType.',
        vi: 'TreeType giữ những phần không đổi theo từng cây: name và color. draw(x, y) nhận vị trí như tham số vì vị trí là extrinsic — thuộc về một cái cây cụ thể, không thuộc về type. Nhiều instance Tree sẽ trỏ tới cùng một TreeType.'
      }
    },
    {
      title: {
        en: 'The factory hands out the same instance for the same key',
        vi: 'Factory đưa cùng instance cho cùng một key'
      },
      body: {
        en: 'TreeFactory.get(name, color) looks in a cache and, on a miss, builds one TreeType. The highlighted computeIfAbsent call is the intern step: the second oak-green request returns the first object, not a copy. Sharing is enforced here, not by the trees themselves.',
        vi: 'TreeFactory.get(name, color) tìm trong cache và, nếu miss, tạo một TreeType. Lời gọi computeIfAbsent được highlight chính là bước intern: lần xin oak-green thứ hai trả về object đầu, không phải bản sao. Việc share được giữ ở đây, không phải do các cây tự giữ.'
      }
    },
    {
      title: {
        en: 'Each tree keeps only what is unique',
        vi: 'Mỗi cây chỉ giữ phần riêng'
      },
      body: {
        en: 'Tree stores private final int x, y plus a reference to a TreeType from the factory. A forest of 100,000 trees can share a handful of types; memory grows with unique positions, not with duplicated textures. draw() just forwards x and y into the shared type.',
        vi: 'Tree lưu private final int x, y cùng một reference tới TreeType lấy từ factory. Một khu rừng 100.000 cây có thể share vài type; bộ nhớ tăng theo vị trí riêng, không theo texture nhân bản. draw() chỉ việc đưa x và y vào type dùng chung.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.lang.Integer.valueOf() — the Integer cache',
      note: {
        en: 'Integer.valueOf(int) (and the autoboxing path) returns cached instances for a range of values, by default −128 to 127. Those Integer objects are flyweights: the number is intrinsic and shared; you do not allocate a new wrapper every time.',
        vi: 'Integer.valueOf(int) (và đường autoboxing) trả về instance đã cache cho một dải giá trị, mặc định −128 đến 127. Các object Integer đó là flyweight: con số là intrinsic và được share; bạn không cấp phát wrapper mới mỗi lần.'
      }
    },
    {
      system: 'java.lang.String.intern()',
      note: {
        en: 'String.intern() returns the canonical instance from the JVM string pool. Equal literals already share storage; intern() lets runtime strings join that pool so identity and memory both collapse onto one copy.',
        vi: 'String.intern() trả về instance chuẩn trong string pool của JVM. Literal bằng nhau vốn đã dùng chung bộ nhớ; intern() cho string tạo lúc chạy nhập pool đó, để identity và bộ nhớ cùng gom về một bản.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'A plain HashMap intern is not safe if two threads miss at once — they can each insert a different TreeType for the same key. ConcurrentHashMap.computeIfAbsent is atomic per key: the factory still looks like get-or-create, but the JVM guarantees one winner. That is the flyweight factory you actually ship.',
      vi: 'Intern bằng HashMap thường không an toàn nếu hai thread miss cùng lúc — mỗi bên có thể nhét một TreeType khác cho cùng key. ConcurrentHashMap.computeIfAbsent atomic theo từng key: factory vẫn trông như get-or-create, nhưng JVM đảm bảo chỉ một bên thắng. Đó mới là flyweight factory bạn thật sự ship.'
    },
    tradeoffs: {
      en: 'ConcurrentHashMap adds lock-free reads and per-bin coordination; it is the right default for a shared cache. It still cannot intern an object that was constructed *before* the map lookup — callers must go through get(). And interned objects live until you evict them: a cache without bounds is a leak.',
      vi: 'ConcurrentHashMap thêm đọc không lock và phối hợp theo bin; đó là mặc định đúng cho cache dùng chung. Nó vẫn không intern được object đã được tạo *trước* lúc lookup — caller phải đi qua get(). Và object đã intern sống đến khi bạn evict: cache không giới hạn là một memory leak.'
    },
    javaCode: `import java.util.concurrent.ConcurrentHashMap;

final class TreeType {
    private final String name, color;
    TreeType(String name, String color) { this.name = name; this.color = color; }
    void draw(int x, int y) {
        System.out.println(name + " (" + color + ") @ " + x + "," + y);
    }
}

// Thread-safe intern: one TreeType per key, even under concurrent misses.
final class TreeFactory {
    private static final ConcurrentHashMap<String, TreeType> cache =
        new ConcurrentHashMap<>();

    static TreeType get(String name, String color) {
        return cache.computeIfAbsent(
            name + "|" + color,
            k -> new TreeType(name, color)
        );
    }
}`
  }
};
