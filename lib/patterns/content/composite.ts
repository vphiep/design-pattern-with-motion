import type { Pattern } from '../types';

export const composite: Pattern = {
  id: 'composite',
  category: 'structural',
  name: 'Composite',
  tagline: {
    en: 'Treat individual objects and groups of objects the same way, so trees just work.',
    vi: 'Đối xử object lẻ và nhóm object cùng một cách, để cây thư mục tự chạy đúng.'
  },
  analogy: {
    en: 'A file system: a folder can contain files, and a folder can also contain other folders. When you ask “how big is this?” you don’t write different code for files and folders. Folders sum up the size of everything inside, and the same call works on both.',
    vi: 'Hệ thống file: một folder chứa file, và folder cũng chứa folder khác. Khi hỏi “cái này nặng bao nhiêu?” bạn không viết hai thứ code cho file và folder. Folder cộng size mọi thứ bên trong, và cùng một lời gọi chạy được trên cả hai.'
  },
  whenToUse: [
    {
      en: 'You have a tree-like structure where leaves and branches should be treated the same.',
      vi: 'Bạn có cấu trúc dạng cây, trong đó lá và nhánh nên được đối xử như nhau.'
    },
    {
      en: 'You want clients to ignore the difference between “one” and “a group of”.',
      vi: 'Bạn muốn client bỏ qua sự khác nhau giữa “một cái” và “một nhóm”.'
    },
    {
      en: 'You find yourself writing the same operation twice — once for a single object, once for a collection.',
      vi: 'Bạn thấy mình viết cùng một thao tác hai lần — một cho object lẻ, một cho collection.'
    }
  ],
  whenNotToUse: [
    {
      en: 'Your structure isn’t really tree-shaped, or the operations diverge too much between leaves and groups.',
      vi: 'Cấu trúc của bạn không thật sự dạng cây, hoặc thao tác trên lá và trên nhóm lệch nhau quá nhiều.'
    },
    {
      en: 'You don’t actually need to recurse over children.',
      vi: 'Bạn thực ra không cần đệ quy qua children.'
    }
  ],
  difficulty: 2,
  order: 8,
  javaCode: `import java.util.ArrayList;
import java.util.List;

// The component: anything that lives in the tree.
interface FileSystemNode {
    String name();
    int sizeBytes();
}

// A leaf: a real file. It has no children.
final class File implements FileSystemNode {
    private final String name;
    private final int bytes;
    File(String name, int bytes) { this.name = name; this.bytes = bytes; }
    public String name()     { return name; }
    public int    sizeBytes() { return bytes; }
}

// A composite: a folder. It holds other nodes (files OR folders).
final class Folder implements FileSystemNode {
    private final String name;
    private final List<FileSystemNode> children = new ArrayList<>();
    Folder(String name) { this.name = name; }
    public Folder add(FileSystemNode child) { children.add(child); return this; }
    public String name() { return name; }
    public int sizeBytes() {
        // Sum sizes of everything inside, recursing through nested folders.
        int total = 0;
        for (FileSystemNode child : children) total += child.sizeBytes();
        return total;
    }
}`,
  steps: [
    {
      title: {
        en: 'One interface for every node in the tree',
        vi: 'Một interface cho mọi node trên cây'
      },
      body: {
        en: 'FileSystemNode is the component interface: name() and sizeBytes() are what every node can answer. Client code holds this type, so it does not know — and does not need to know — whether it is talking to a single file or a whole folder tree.',
        vi: 'FileSystemNode là interface thành phần: name() và sizeBytes() là điều mọi node trả lời được. Code client cầm kiểu này, nên nó không biết — và không cần biết — mình đang nói chuyện với một file hay cả một cây folder.'
      }
    },
    {
      title: {
        en: 'A leaf answers for itself',
        vi: 'Lá tự trả lời cho chính mình'
      },
      body: {
        en: 'File implements FileSystemNode and stores a name plus a byte count. It has no children. sizeBytes() simply returns that stored number. In the tree, File is a leaf: the recursion stops here.',
        vi: 'File implement FileSystemNode và giữ name cùng số byte. Nó không có children. sizeBytes() chỉ việc trả về con số đã lưu. Trên cây, File là lá: đệ quy dừng tại đây.'
      }
    },
    {
      title: {
        en: 'A composite asks every child the same question',
        vi: 'Composite hỏi mọi child cùng một câu'
      },
      body: {
        en: 'Folder also implements FileSystemNode, but it holds a list of children that are themselves FileSystemNode — files or nested folders. The highlighted line total += child.sizeBytes() is the pattern: the same call works on a leaf and on another composite, so a folder of folders just works.',
        vi: 'Folder cũng implement FileSystemNode, nhưng nó giữ một list children vốn cũng là FileSystemNode — file hoặc folder lồng. Dòng được highlight total += child.sizeBytes() chính là pattern: cùng lời gọi chạy được trên lá và trên composite khác, nên folder chứa folder vẫn đúng.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.awt.Component and java.awt.Container',
      note: {
        en: 'AWT’s Component is the leaf-or-composite type; Container (and Swing’s JComponent) holds child components and forwards paint, layout, and event dispatch down the tree. The same add() / getComponent() vocabulary works at every level.',
        vi: 'Component của AWT là kiểu vừa lá vừa composite; Container (và JComponent của Swing) giữ component con rồi chuyển paint, layout và event xuống cây. Cùng từ vựng add() / getComponent() dùng được ở mọi tầng.'
      }
    },
    {
      system: 'org.w3c.dom.Node',
      note: {
        en: 'The W3C DOM treats Element, Text, and Document as Node. getChildNodes(), appendChild(), and tree walks do not care whether a node is a leaf or has children — that is Composite on the XML tree.',
        vi: 'DOM của W3C coi Element, Text và Document đều là Node. getChildNodes(), appendChild() và các vòng duyệt cây không quan tâm node là lá hay có con — đó là Composite trên cây XML.'
      }
    }
  ]
};
