import type { Pattern } from '../types';

export const iterator: Pattern = {
  id: 'iterator',
  category: 'behavioral',
  name: 'Iterator',
  tagline: {
    en: 'Walk through a collection one item at a time, without exposing how the collection is built underneath.',
    vi: 'Đi qua collection từng phần tử một, mà không lộ cách collection được dựng bên dưới.'
  },
  analogy: {
    en: 'A TV channel surfer. You press “next,” you get the next channel. The TV doesn’t tell you whether channels live in an array, a tree, or are computed on the fly. The remote is the iterator — same button, same “next” feeling, regardless of how the channels are stored.',
    vi: 'Người bấm kênh TV. Bạn nhấn “next,” bạn nhận kênh kế. TV không nói kênh nằm trong mảng, trong cây, hay được tính lúc bấm. Remote chính là iterator — cùng nút, cùng cảm giác “next”, bất kể kênh được cất thế nào.'
  },
  whenToUse: [
    {
      en: 'You want to traverse a collection without exposing its internal structure (array, list, tree, …).',
      vi: 'Bạn muốn duyệt collection mà không lộ cấu trúc nội bộ (mảng, list, cây, …).'
    },
    {
      en: 'You want to support multiple ways of walking the same collection (forward, backward, filtered).',
      vi: 'Bạn muốn hỗ trợ nhiều cách đi trên cùng một collection (xuôi, ngược, đã lọc).'
    },
    {
      en: 'You want a uniform API for “give me the next thing” across very different collections.',
      vi: 'Bạn muốn một API thống nhất cho “cho tôi thứ tiếp theo” trên những collection rất khác nhau.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The collection is small and a plain for-each loop is all you need.',
      vi: 'Collection nhỏ và một vòng for-each là đủ.'
    },
    {
      en: 'You actually need the index or random access — iterators are sequential by design.',
      vi: 'Bạn thật sự cần index hoặc truy cập ngẫu nhiên — iterator vốn đi tuần tự.'
    }
  ],
  difficulty: 1,
  order: 16,
  javaCode: `import java.util.NoSuchElementException;

// A minimal iterator interface. The collection hands one of these out
// to anyone who wants to walk through it.
interface Iterator<T> {
    boolean hasNext();
    T next();
}

// A toy collection: a binary tree, traversed in-order.
final class InOrderTreeIterator implements Iterator<Integer> {
    private final java.util.Deque<Node> stack = new java.util.ArrayDeque<>();
    InOrderTreeIterator(Node root) { pushLeft(root); }

    private void pushLeft(Node n) {
        while (n != null) { stack.push(n); n = n.left; }
    }
    public boolean hasNext() { return !stack.isEmpty(); }
    public Integer next() {
        if (stack.isEmpty()) throw new NoSuchElementException();
        Node n = stack.pop();
        pushLeft(n.right);
        return n.value;
    }
}
final class Node { int value; Node left, right; Node(int v){value=v;} }

// Java's standard library already gives you java.util.Iterator, so
// in real code you'd just implement that interface directly.`,
  steps: [
    {
      title: {
        en: 'One cursor interface for every collection',
        vi: 'Một interface con trỏ cho mọi collection'
      },
      body: {
        en: 'Iterator<T> is the uniform remote: hasNext() and next(). A list, a set, or a tree can each hand out an object that implements this. Callers write the same loop regardless of how the data is stored — that is the point of hiding the structure.',
        vi: 'Iterator<T> là remote thống nhất: hasNext() và next(). List, set hay cây đều đưa ra một object implement cái này. Caller viết cùng một vòng lặp bất kể data cất thế nào — đó là ý của việc giấu cấu trúc.'
      }
    },
    {
      title: {
        en: 'next() advances and returns the current item',
        vi: 'next() tiến tới và trả phần tử hiện tại'
      },
      body: {
        en: 'InOrderTreeIterator.next() pops the next Node off an internal stack and returns n.value. The caller receives an Integer; it never sees Node, left, or right. Each call moves the cursor one step through an in-order walk.',
        vi: 'InOrderTreeIterator.next() pop Node tiếp theo khỏi stack nội bộ và trả n.value. Caller nhận Integer; không bao giờ thấy Node, left hay right. Mỗi lời gọi đưa con trỏ đi một bước theo thứ tự in-order.'
      }
    },
    {
      title: {
        en: 'The walk’s bookkeeping stays inside the iterator',
        vi: 'Sổ sách của vòng duyệt ở trong iterator'
      },
      body: {
        en: 'pushLeft walks down left children and stacks them so the in-order sequence comes out of next(). That stack is the hidden structure: the tree can stay private, and you could write a second iterator (pre-order, reverse) without changing Node.',
        vi: 'pushLeft đi xuống các con trái và push vào stack để next() ra đúng thứ tự in-order. Stack đó là cấu trúc bị giấu: cây có thể ở private, và bạn có thể viết iterator thứ hai (pre-order, ngược) mà không sửa Node.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.util.Iterator and java.lang.Iterable',
      note: {
        en: 'The enhanced for-loop desugars to iterator() / hasNext() / next(). Every JDK collection implements Iterable so the same loop walks a List, a Set, or a custom tree you write.',
        vi: 'Vòng for cải tiến được hạ xuống iterator() / hasNext() / next(). Mọi collection trong JDK implement Iterable nên cùng vòng đó đi được List, Set, hoặc cây bạn tự viết.'
      }
    },
    {
      system: 'java.nio.file.DirectoryStream',
      note: {
        en: 'DirectoryStream is an Iterator over directory entries that does not load the whole listing into a List. try-with-resources plus the iterator protocol is how NIO.2 walks a folder.',
        vi: 'DirectoryStream là Iterator trên các entry thư mục, không load cả listing vào List. try-with-resources cộng protocol iterator là cách NIO.2 đi qua một folder.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Iterator is sequential and single-threaded. Spliterator adds tryAdvance (one step) and trySplit (carve off a prefix another thread can walk). The Streams framework builds parallel pipelines on that split: the same “hide the tree” idea, now with a fork-join shape.',
      vi: 'Iterator đi tuần tự và một thread. Spliterator thêm tryAdvance (một bước) và trySplit (tách một đoạn prefix để thread khác đi). Framework Streams dựng pipeline song song trên chỗ tách đó: cùng ý “giấu cái cây”, giờ có hình fork-join.'
    },
    tradeoffs: {
      en: 'A Spliterator can be faster in parallel, but trySplit is optional and many sources cannot split well (a one-way I/O stream). You also lose the simple hasNext/next mental model. Implement Spliterator when you already expose a Stream; keep Iterator for a basic cursor.',
      vi: 'Spliterator có thể nhanh hơn khi chạy song song, nhưng trySplit là tùy chọn và nhiều nguồn không tách tốt (stream I/O một chiều). Bạn cũng mất mô hình hasNext/next đơn giản. Implement Spliterator khi bạn đã expose Stream; giữ Iterator cho con trỏ cơ bản.'
    },
    javaCode: `import java.util.Spliterator;
import java.util.function.Consumer;

final class Node {
    final int value;
    final Node left, right;
    Node(int value, Node left, Node right) {
        this.value = value; this.left = left; this.right = right;
    }
}

// In-order walk with an optional split at the right subtree.
final class TreeSpliterator implements Spliterator<Integer> {
    private Node remaining;
    TreeSpliterator(Node root) { this.remaining = root; }

    public boolean tryAdvance(Consumer<? super Integer> action) {
        if (remaining == null) return false;
        // A real version would stack left nodes like InOrderTreeIterator.
        action.accept(remaining.value);
        remaining = remaining.right;
        return true;
    }

    public Spliterator<Integer> trySplit() {
        if (remaining == null || remaining.right == null) return null;
        Spliterator<Integer> prefix = new TreeSpliterator(remaining.right);
        remaining = remaining.left;
        return prefix;
    }

    public long estimateSize() { return Long.MAX_VALUE; }
    public int characteristics() { return ORDERED | DISTINCT; }
}`
  }
};
