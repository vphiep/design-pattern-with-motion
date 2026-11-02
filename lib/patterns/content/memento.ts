import type { Pattern } from '../types';

export const memento: Pattern = {
  id: 'memento',
  category: 'behavioral',
  name: 'Memento',
  tagline: {
    en: 'Save a snapshot of an object’s state so you can roll it back later — without poking at its internals.',
    vi: 'Lưu một snapshot state của object để rollback sau — mà không sờ vào phần nội bộ của nó.'
  },
  analogy: {
    en: 'A video game save file. The game captures everything you need to restore the exact moment you saved: health, ammo, position, quest progress. The save file doesn’t expose the game’s internals — it just holds the snapshot. The Memento pattern is that save file, packaged up so the game can write and read it.',
    vi: 'File save trong game. Game chụp mọi thứ cần để trở lại đúng khoảnh khắc: máu, đạn, vị trí, tiến độ nhiệm vụ. File save không lộ nội bộ game — nó chỉ giữ snapshot. Pattern Memento chính là file save đó, được gói để game ghi và đọc.'
  },
  whenToUse: [
    {
      en: 'You need to save and restore an object’s state (undo, snapshots, transactions).',
      vi: 'Bạn cần lưu và khôi phục state của object (undo, snapshot, transaction).'
    },
    {
      en: 'You want to keep the saved state opaque — the outside world can store it, but not crack it open.',
      vi: 'Bạn muốn state đã lưu là opaque — thế giới bên ngoài cất được, nhưng không mở ra xem.'
    },
    {
      en: 'The state being saved is non-trivial, so you don’t want to copy every field by hand.',
      vi: 'State cần lưu không tầm thường, nên bạn không muốn copy từng field bằng tay.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The state is trivial enough to just remember with a few fields.',
      vi: 'State đủ tầm thường để chỉ cần nhớ vài field.'
    },
    {
      en: 'You’d have to save huge amounts of data on every change — find a cheaper approach.',
      vi: 'Mỗi lần đổi bạn phải lưu một đống data — hãy tìm cách rẻ hơn.'
    }
  ],
  difficulty: 2,
  order: 18,
  javaCode: `// The memento: an opaque snapshot of an object's state.
final class EditorMemento {
    private final String content;
    EditorMemento(String content) { this.content = content; }
    String content() { return content; } // package-private: only Editor can read it.
}

// The originator: the object whose state we're saving.
final class TextEditor {
    private String content = "";
    public void type(String more) { content += more; }
    public String content()       { return content; }
    public EditorMemento save()   { return new EditorMemento(content); }
    public void restore(EditorMemento m) { this.content = m.content(); }
}

// The caretaker: holds the snapshots but can't peek inside them.
final class History {
    private final java.util.Deque<EditorMemento> stack = new java.util.ArrayDeque<>();
    public void push(EditorMemento m) { stack.push(m); }
    public EditorMemento pop()        { return stack.pop(); }
}

// TextEditor e = new TextEditor();  History h = new History();
// e.type("hello ");  h.push(e.save());
// e.type("world");  h.push(e.save());
// e.restore(h.pop());   e.content(); -> "hello world"`,
  steps: [
    {
      title: {
        en: 'The originator writes a snapshot of itself',
        vi: 'Originator tự chụp snapshot'
      },
      body: {
        en: 'TextEditor.save() constructs an EditorMemento that copies the current content. The editor is the originator: only it knows which fields belong in a snapshot. Callers receive a memento they can store, not a bag of public fields they can edit.',
        vi: 'TextEditor.save() tạo một EditorMemento copy content hiện tại. Editor là originator: chỉ nó biết field nào thuộc về snapshot. Caller nhận memento để cất, không phải một túi field public để sửa.'
      }
    },
    {
      title: {
        en: 'The caretaker stores snapshots without reading them',
        vi: 'Caretaker cất snapshot mà không đọc'
      },
      body: {
        en: 'History.push(EditorMemento) stacks the snapshot. content() on the memento is package-private, so History — living in a different role, even if it shares a package in this sketch — is not supposed to interpret the string. It is a shelf, not an editor.',
        vi: 'History.push(EditorMemento) xếp snapshot vào stack. content() trên memento là package-private, nên History — một vai khác, dù trong sketch này có thể chung package — không được diễn giải chuỗi đó. Nó là cái kệ, không phải editor.'
      }
    },
    {
      title: {
        en: 'restore() rolls the originator back',
        vi: 'restore() đưa originator trở lại'
      },
      body: {
        en: 'TextEditor.restore(m) copies m.content() back onto the editor. Combined with History.pop(), that is undo: the caretaker hands the last snapshot over, and only the originator knows how to apply it. Internals stay closed.',
        vi: 'TextEditor.restore(m) copy m.content() trở lại editor. Kết hợp History.pop(), đó là undo: caretaker đưa snapshot cuối, và chỉ originator biết cách áp. Phần nội bộ vẫn đóng.'
      }
    }
  ],
  realSystems: [
    {
      system: 'javax.swing.undo.UndoManager',
      note: {
        en: 'Swing’s undo package stores UndoableEdit objects as mementos of document changes. The manager is the caretaker; the Document is the originator that can undo or redo an edit without exposing its buffer.',
        vi: 'Gói undo của Swing cất UndoableEdit như memento của thay đổi trên document. Manager là caretaker; Document là originator, undo hoặc redo một edit mà không lộ buffer.'
      }
    },
    {
      system: 'java.awt.Graphics2D — getTransform() / setTransform()',
      note: {
        en: 'Code often saves an AffineTransform, draws, then restores it. The transform object is a memento of the graphics context’s coordinate state; callers store it without parsing matrix fields.',
        vi: 'Code thường save một AffineTransform, vẽ, rồi restore. Object transform là memento cho state tọa độ của graphics context; caller cất nó mà không parse các field của ma trận.'
      }
    }
  ]
};
