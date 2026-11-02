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
  ],

  deepTheory: {
    academicRoot: {
      en: 'Formalized in Gang of Four (1994). Composes objects into tree structures to represent part-whole hierarchies. Enables clients to treat individual leaf objects and composite containers uniformly without branching code.',
      vi: 'Được chính thức hóa trong Gang of Four (1994). Gom các đối tượng thành cấu trúc dạng cây để biểu diễn các phân cấp bộ phận-toàn thể. Cho phép phía client xử lý các đối tượng lá đơn lẻ và các nhánh chứa phức hợp một cách hoàn toàn đồng nhất mà không cần rẽ nhánh.'
    },
    structuralCouplingMetric: {
      en: 'Uniform contract eliminates client coupling to concrete tree node types, enabling arbitrary hierarchy depths with zero client modification.',
      vi: 'Khế ước đồng nhất xóa bỏ sự phụ thuộc của client vào kiểu cụ thể của từng node trên cây, cho phép mở rộng cây phân cấp tùy ý mà không cần sửa code phía gọi.'
    },
    memoryAndVtableTradeoff: {
      en: 'Recursive virtual dispatch across the tree. In deeply nested hierarchies, iterative stack traversal is preferred to avoid JVM StackOverflowError.',
      vi: 'Phân giải đa hình đệ quy trên cây. Với các cây phân cấp quá sâu, nên ưu tiên duyệt lặp bằng Stack để tránh lỗi tràn ngăn xếp StackOverflowError của JVM.'
    },
    enterpriseBestPractices: [
      {
        en: 'Defensive Cycle Detection: Enforce directed acyclic graph (DAG) validation to prevent infinite circular reference traversal.',
        vi: 'Phát hiện chu trình: Luôn kiểm tra đồ thị có hướng không chu trình (DAG) để chống việc các node con trỏ ngược lại node cha gây lặp vô tận.'
      },
      {
        en: 'Immutable Collections: Store child nodes in unmodifiable lists to prevent external tampering of tree topologies.',
        vi: 'Danh sách con bất biến: Lưu các node con trong mảng bất biến để tránh việc mã bên ngoài tự ý thay đổi cấu trúc cây.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Enterprise RBAC Multi-Tier Organization Permission Roll-Up Evaluation Collapse',
      vi: 'Sự Cố Đổ Vỡ Hiệu Năng Phân Quyền RBAC Phân Cấp Đa Tầng Trong Doanh Nghiệp'
    },
    businessContext: {
      en: 'An enterprise SaaS identity and authorization platform evaluates user document permissions across a complex corporate hierarchy (Organization -> Division -> Department -> Project -> Individual User).',
      vi: 'Nền tảng xác thực SaaS doanh nghiệp đánh giá quyền truy cập tài liệu qua cây phân cấp công ty phức tạp (Tập đoàn -> Khối -> Phòng ban -> Dự án -> Người dùng cá nhân).'
    },
    problemDescription: {
      en: 'Permissions were managed procedurally using 6 disparate database queries and nested if-else loops: checkOrgPermission(), checkDivisionPermission(), checkTeamPermission(). As enterprise customers scaled to 8 nested tiers of subsidiaries and cross-functional teams, evaluating whether User X had access to Document Y took 420ms of database round-trips per API request. Mobile document listing endpoints experienced 504 Gateway Timeouts under concurrent enterprise employee logins.',
      vi: 'Quyền hạn ban đầu được xử lý thủ công bằng 6 câu truy vấn database rời rạc và các vòng lặp if-else lồng nhau: checkOrgPermission(), checkDivisionPermission()... Khi khách hàng doanh nghiệp mở rộng lên 8 cấp công ty con và nhóm dự án liên phòng ban, việc kiểm tra xem Nhân viên X có quyền đọc Tài liệu Y hay không mất tới 420ms truy vấn DB cho mỗi request. Màn hình danh sách tài liệu trên mobile bị nghẽn và timeout liên tục khi nhân viên đồng loạt đăng nhập vào đầu giờ sáng.'
    },
    whyNaiveFails: {
      en: 'Procedural checking hardcodes assumptions about hierarchy depth; introducing a new organizational unit type ("Working Group") required rewriting the entire permission evaluation engine.',
      vi: 'Lối viết thủ công bị bó cứng vào số lượng tầng cố định; khi khách hàng tạo thêm một loại đơn vị mới (như "Tổ công tác"), toàn bộ động cơ phân quyền buộc phải đập đi viết lại.'
    },
    coreSolution: {
      en: 'Implement the Composite pattern: define a unified PermissionNode interface with hasPermission(Action). Both UserLeaf and OrganizationComposite implement the exact same contract. Composite groups recursively query their children with in-memory caching, collapsing 8 database queries into sub-millisecond recursive evaluation.',
      vi: 'Áp dụng mẫu Composite: định nghĩa interface đồng nhất PermissionNode với hàm hasPermission(Action). Cả người dùng đơn lẻ UserLeaf và phòng ban OrganizationComposite đều thực thi cùng một khế ước. Các nhóm composite duyệt đệ quy các phần tử con trong bộ nhớ RAM, thu gọn 8 câu truy vấn đĩa thành một phép duyệt cây siêu tốc dưới 1ms.'
    },
    productionCode: `// Production RBAC Permission Tree using Composite Pattern (Java 21)
package com.enterprise.iam.composite;

import java.util.ArrayList;
import java.util.List;

public interface PermissionNode {
    boolean hasPermission(String action);
    String identifier();
}

// Leaf Node: Individual Employee
public record UserNode(String userId, List<String> grantedActions) implements PermissionNode {
    @Override
    public boolean hasPermission(String action) {
        return grantedActions.contains(action);
    }
    @Override public String identifier() { return userId; }
}

// Composite Node: Department / Organization holding child nodes
public class DepartmentGroup implements PermissionNode {
    private final String deptId;
    private final List<PermissionNode> children = new ArrayList<>();
    private final List<String> groupInheritedPermissions = new ArrayList<>();

    public DepartmentGroup(String id) { this.deptId = id; }

    public void add(PermissionNode node) { children.add(node); }

    public void grantGroupPermission(String action) { groupInheritedPermissions.add(action); }

    @Override
    public boolean hasPermission(String action) {
        // 1. Group-level inherited permission check
        if (groupInheritedPermissions.contains(action)) return true;

        // 2. Uniform recursive delegation to all children (Leaves or Sub-Departments)
        for (PermissionNode child : children) {
            if (child.hasPermission(action)) return true;
        }
        return false;
    }

    @Override public String identifier() { return deptId; }
}`,
    architectureImpact: {
      en: 'Permission check latency dropped from 420ms down to 0.35ms (1,200x speedup); Supports unlimited organizational hierarchy depth with zero code modifications; Database round-trips eliminated via in-memory tree caching.',
      vi: 'Độ trễ kiểm tra phân quyền giảm từ 420ms xuống chỉ còn 0.35ms (nhanh gấp 1,200 lần); Hỗ trợ cây phân cấp sâu tùy ý mà không cần sửa code; Triệt tiêu hoàn toàn các câu truy vấn database nhờ bộ đệm cây trong RAM.'
    }
  }
};
