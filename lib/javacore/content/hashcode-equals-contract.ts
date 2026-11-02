import type { JavaCoreTopic } from '../types';

export const hashcodeEqualsContractTopic: JavaCoreTopic = {
  id: 'hashcode-equals-contract',
  category: 'java-fundamentals',
  name: 'HashCode & Equals Contract & Bucket Indexing',
  tagline: {
    en: 'The mathematical contract between hashCode() and equals(), why 31 is chosen as multiplier, bucket index collisions, and catastrophic mutable key memory leaks.',
    vi: 'Khế ước toán học giữa hashCode() và equals(), lý do chọn số nguyên tố 31, xung đột ô nhớ bucket và lỗi rò rỉ RAM khi dùng khóa mutable.'
  },
  difficulty: 1,
  level: 'basic',
  order: 2,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Enterprise collections like HashMap and HashSet store millions of entities and rely on constant-time O(1) lookups. If a developer overrides equals() without overriding hashCode(), two logically identical objects produce different integer hash values. Consequently, calling map.get(new User(id)) searches the WRONG memory bucket, returning null and causing phantom missing data bugs.',
      vi: 'Các cấu trúc tập hợp như HashMap và HashSet lưu trữ hàng triệu thực thể và dựa vào tốc độ tìm kiếm O(1). Nếu lập trình viên ghi đè equals() mà quên ghi đè hashCode(), hai đối tượng giống hệt nhau về nghiệp vụ sẽ sinh ra hai mã băm khác nhau. Dẫn đến việc map.get(new User(id)) tìm sai ô nhớ bucket, trả về null gây lỗi mất tích dữ liệu ma quái.'
    },
    hardwareConstraint: {
      en: 'CPUs perform integer multiplication via hardware ALUs. Calculating hash values must be mathematically fast and uniformly distributed across 32-bit integer space. Multiplication by 31 can be optimized by CPU hardware and JIT into a single bitwise shift and subtraction: 31 * i == (i << 5) - i, executing in a single CPU clock cycle (0.3ns).',
      vi: 'CPU thực hiện phép nhân số nguyên trên khối phần cứng ALU. Tính toán mã băm phải cực nhanh và phân bố đều trên dải 32-bit. Phép nhân với số nguyên tố 31 được phần cứng CPU và JIT tối ưu thành phép dịch bit và trừ: 31 * i == (i << 5) - i, thực thi chỉ tốn đúng 1 chu kỳ xung nhịp CPU (0.3ns).'
    },
    fundamentalSolution: {
      en: 'Java enforces a strict bidirectional contract: 1. If a.equals(b) == true, then a.hashCode() MUST equal b.hashCode(). 2. If a.hashCode() == b.hashCode(), a.equals(b) may or may not be true (hash collision). 3. hashCode() must remain consistent across invocations as long as equals properties remain unchanged. Never use mutable fields in hashCode() calculations!',
      vi: 'Java bắt buộc khế ước 2 chiều nghiêm ngặt: 1. Nếu a.equals(b) == true thì bắt buộc a.hashCode() PHẢI bằng b.hashCode(). 2. Nếu hai mã băm bằng nhau, chưa chắc hai đối tượng đã bằng nhau (xảy ra xung đột hash). 3. Giá trị hashCode() phải bất biến trong suốt vòng đời đối tượng. Tuyệt đối không đưa các trường có thể thay đổi (mutable) vào hàm băm!'
    },
    math: {
      formula: 'Bucket_Index = (n - 1) & (hash ^ (hash >>> 16)); Hash_Code = s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]',
      description: {
        en: 'The prime number 31 creates high entropy with minimal hash collisions. The bitwise shift (hash >>> 16) spreads high-order bits into low-order positions to prevent clustering in small tables.',
        vi: 'Số nguyên tố 31 tạo độ hỗn loạn cao hạn chế va chạm. Phép dịch bit (hash >>> 16) phân tán các bit cao xuống bit thấp tránh gom cụm ô nhớ khi bảng băm còn nhỏ.'
      },
      timeComplexity: 'O(1) average lookup when hashCode distributes evenly; degenerates to O(N) or O(log N) if all hashes collide',
      spaceComplexity: 'Zero additional memory: hashCode is an algorithmic 32-bit primitive int calculation',
      memoryOverheadFormula: 'Identity Hash Code (in Mark Word) = 31 Bits cached directly inside Object Header'
    }
  },

  memoryLayout: {
    title: {
      en: 'Physical Layout: HashCode Computation -> Bucket Masking -> Linked Node Equality Scan',
      vi: 'Bố Cục Ô Nhớ: Tính Toán HashCode -> Mặt Nạ Bit Xác Định Bucket -> So Sánh equals()'
    },
    description: {
      en: 'The JVM computes the integer hashCode(), applies the high-16-bit spread, and masks by (capacity - 1) to locate the bucket array slot. If the slot contains a collision chain, it invokes equals() on each node until a match is found.',
      vi: 'JVM tính mã băm số nguyên, phân tán bit cao và dùng phép AND bit với (capacity - 1) để tìm index. Nếu ô nhớ có nhiều nút va chạm, nó gọi hàm equals() tuần tự trên từng nút cho đến khi tìm thấy.'
    },
    asciiDiagram: `
+-----------------------------------------------------------------------------------------+
|  KEY: User(id=101, name="Alice") -> hashCode() = 2058492                                |
+-----------------------------------------------------------------------------------------+
                                          |
                                          v  Bitwise Mask: (table.length - 1) & hash
+-----------------------------------------------------------------------------------------+
|  HASHMAP BUCKET TABLE: Node<K,V>[] table (Capacity = 16)                                |
|  [Bucket 0] -> null                                                                     |
|  [Bucket 1] -> null                                                                     |
|  [Bucket 2] -> Node(hash=2058492, key=User(101), value=Account, next)                   |
|                   |                                                                     |
|                   v (Hash Collision Chain - invokes equals() to verify identity)        |
|                Node(hash=2058492, key=User(999), value=Account, next=null)              |
|  ...                                                                                    |
|  [Bucket 15]-> null                                                                     |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'Identity Hash Code', size: '31 Bits', description: { en: 'Stored in 64-bit Mark Word if System.identityHashCode() is computed.', vi: 'Lưu trong Mark Word nếu gọi System.identityHashCode().' } },
      { name: 'Bucket Index', size: '32-bit Integer', description: { en: 'Array slot computed via (n - 1) & hash.', vi: 'Chỉ số mảng tính bằng phép AND bit với độ dài bảng.' } },
      { name: 'Prime 31 Multiplier', size: 'ALU Shift', description: { en: 'Replaced by JIT with (x << 5) - x for zero-overhead arithmetic.', vi: 'Được JIT thay thế bằng phép dịch bit 5 và phép trừ.' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'The equals() and hashCode() contract defined in java.lang.Object is the foundational cornerstone of Java collection integrity. Violating the mathematical equivalence relation breaks all hash-based collections (HashMap, HashSet, ConcurrentHashMap, LinkedHashMap), leading to silent phantom cache misses, lost records, and catastrophic memory leaks.',
      vi: 'Khế ước giữa equals() và hashCode() được định nghĩa trong java.lang.Object là nền tảng cốt lõi cho tính toàn vẹn của cấu trúc dữ liệu trong Java. Vi phạm mối quan hệ tương đương toán học này sẽ phá vỡ mọi bảng băm (HashMap, HashSet, ConcurrentHashMap), dẫn đến việc mất dữ liệu âm thầm, tìm kiếm thất bại và rò rỉ bộ nhớ nghiêm trọng.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The 5 Formal Axioms of equals(): An implementation of equals() must define an equivalence relation complying with 5 mathematical axioms: 1. Reflexive: x.equals(x) is always true. 2. Symmetric: x.equals(y) == y.equals(x). 3. Transitive: if x.equals(y) and y.equals(z), then x.equals(z). 4. Consistent: repeated invocations consistently return the same result unless state is mutated. 5. Non-nullity: x.equals(null) must return false without throwing NullPointerException. Violating symmetry frequently happens in inheritance hierarchies (e.g. ColorPoint extending Point), which is why Item 10 of Effective Java advises favoring composition over inheritance for value objects.',
        vi: '1. 5 Tiên đề toán học của equals(): Cài đặt của equals() bắt buộc phải thỏa mãn 5 tiên đề toán học: 1. Phản xạ: x.equals(x) luôn là true. 2. Đối xứng: x.equals(y) phải tương đương y.equals(x). 3. Bắc cầu: nếu x.equals(y) và y.equals(z) thì x.equals(z). 4. Nhất quán: các lần gọi lặp lại phải trả về cùng kết quả nếu dữ liệu không đổi. 5. Khác null: x.equals(null) luôn trả về false mà không được ném NullPointerException. Lỗi phá vỡ tính đối xứng rất hay xảy ra khi kế thừa class (như ColorPoint kế thừa Point), đó là lý do tại sao quy tắc Effective Java khuyên nên dùng Ghép nối (Composition) thay vì kế thừa cho các đối tượng giá trị.'
      },
      {
        en: '2. The 3 Invariants of the hashCode() Contract: 1. Consistency: An object must return the same integer value across multiple invocations during an execution, provided information used in equals() comparisons is unchanged. 2. Equal Objects Rule: If two objects are equal according to equals(Object), calling hashCode() on each of them MUST produce the EXACT SAME integer! 3. Unequal Objects Optimization: Two unequal objects are NOT required to have distinct hash codes; however, generating distinct integers for distinct objects minimizes bucket collisions and maintains O(1) collection performance. Why multiplier 31? Prime 31 provides an optimal distribution across hash buckets and is optimized by the HotSpot JIT into a single hardware bit-shift and subtraction: 31 * i == (i << 5) - i.',
        vi: '2. 3 Bất biến của khế ước hashCode(): 1. Nhất quán: Một đối tượng phải trả về cùng một số nguyên trong suốt quá trình chạy nếu các trường trong equals() không đổi. 2. Quy tắc đối tượng bằng nhau: Nếu hai đối tượng bằng nhau theo equals(), hàm hashCode() của chúng BẮT BUỘC PHẢI TRẢ VỀ CÙNG MỘT SỐ NGUYÊN! 3. Tối ưu đối tượng khác nhau: Hai đối tượng khác nhau không bắt buộc phải có hash khác nhau, nhưng tạo hash khác biệt sẽ giảm thiểu va chạm bucket và bảo toàn tốc độ O(1). Tại sao chọn số nguyên tố 31? Số 31 giúp phân tán mã băm cực đều và được CPU JIT dịch thành phép dịch bit phần cứng siêu tốc: 31 * i == (i << 5) - i.'
      },
      {
        en: '3. The Lethal Hazard of Mutable Map Keys (Baeldung & GeeksforGeeks): When an object is inserted as a key into a HashMap or HashSet, the collection computes its bucket location based on its CURRENT hashCode(). If a field used in hashCode() calculation is subsequently mutated, the object hash code changes! When the caller later attempts map.get(key) or map.remove(key), the map recalculates the hash and looks in the NEW bucket slot where the object does not exist! The object becomes a permanent phantom: it cannot be found, cannot be updated, and CANNOT BE REMOVED, causing a creeping Heap memory leak. Always design Map keys as strictly immutable value objects (e.g. Java 14+ Records, String, Long).',
        vi: '3. Hiểm họa chí mạng khi dùng Khóa có thể thay đổi (Mutable Keys) (Baeldung & GeeksforGeeks): Khi một đối tượng được đưa vào làm Key trong HashMap hoặc HashSet, bảng băm sẽ tính vị trí bucket dựa trên hashCode() TẠI THỜI ĐIỂM ĐÓ. Nếu một thuộc tính tham gia tính hash bị sửa đổi sau đó, mã băm của đối tượng sẽ bị đổi sang số khác! Khi ứng dụng gọi map.get(key) hay map.remove(key), HashMap tính toán lại mã hash mới và nhảy vào tìm ở bucket MỚI—nơi đối tượng hoàn toàn không tồn tại! Đối tượng cũ biến thành "bóng ma" vĩnh viễn: không thể tìm thấy, không thể cập nhật và KHÔNG THỂ XÓA ĐƯỢC, dẫn đến hiện tượng rò rỉ bộ nhớ Heap âm thầm. Luôn thiết kế Map Key thành đối tượng bất biến (như Java 14+ Record, String, Long).'
      },
      {
        en: '4. getClass() vs instanceof & Joshua Bloch\'s ColorPoint Equivalence Trap (Baeldung & Effective Java Item 10): Using instanceof inside equals() violates the equivalence relation whenever inheritance is involved. Suppose class Point(x, y) uses instanceof Point. Subclass ColorPoint(x, y, color) adds a color field. If ColorPoint.equals() checks color when comparing against another ColorPoint, then: point.equals(colorPoint) returns true (point only checks coordinates), but colorPoint.equals(point) returns false (point is not a ColorPoint or lacks color)! This destroys the Symmetry axiom. Attempting a "hybrid" check destroys the Transitivity axiom (p1.equals(cp) == true and cp.equals(p2) == true does NOT imply p1.equals(p2)). There is no way to extend an instantiable class and add an aspect while preserving the equals contract. Solution: Use getClass() for exact type identity, or favor Composition over Inheritance: make ColorPoint hold a private Point instance.',
        vi: '4. Cạm bẫy kế thừa getClass() vs instanceof & Bài toán ColorPoint của Joshua Bloch (Baeldung & Effective Java): Dùng instanceof trong equals() sẽ phá vỡ quan hệ tương đương toán học khi có kế thừa. Giả sử lớp Point(x, y) dùng instanceof Point. Lớp con ColorPoint(x, y, color) bổ sung trường màu sắc. Nếu ColorPoint kiểm tra màu khi so với 1 ColorPoint khác: point.equals(colorPoint) trả về true (vì colorPoint là instance của Point), nhưng colorPoint.equals(point) trả về false (vì point không có màu)! Điều này hủy hoại tiên đề Đối xứng (Symmetry). Cố gắng lách luật bằng kiểm tra lai sẽ phá hủy tiên đề Bắc cầu (Transitivity). Không có cách nào mở rộng một class có thể khởi tạo và thêm thuộc tính mà vẫn giữ được khế ước equals! Giải pháp: Dùng getClass() để so sánh chính xác kiểu runtime, hoặc dùng Ghép nối (Composition) thay vì kế thừa: để ColorPoint chứa một tham chiếu Point bên trong.'
      },
      {
        en: '5. Hash Collision Physics: Separate Chaining vs Open Addressing & Objects.hash() GC Churn (Baeldung & JavaTpoint): When two distinct keys hash to the same bucket index, hash tables resolve conflicts using either: (1) Separate Chaining (Java HashMap standard): Each bucket holds a linked list; in Java 8+, if a bucket exceeds TREEIFY_THRESHOLD (8 entries) and table capacity >= 64, it converts into a Red-Black Tree (TreeBin), bounding worst-case search to O(log N). (2) Open Addressing (Linear/Quadratic Probing, Double Hashing): Stores all entries directly in the table array; collisions probe subsequent slots. Performance Pitfall of Objects.hash(a, b, c): It accepts varargs (Object... values), forcing the JVM to allocate a temporary Object[] array on the Heap on EVERY call! In high-throughput streaming or latency-critical trading loops, this causes severe Young Gen GC churn. Prefer manual arithmetic ((31 * result) + field) or compiler-generated Record hash codes which allocate zero heap memory.',
        vi: '5. Cơ chế giải quyết Va chạm Băm: Separate Chaining vs Open Addressing & Rác GC của Objects.hash() (Baeldung & JavaTpoint): Khi hai key khác nhau có cùng bucket index, bảng băm xử lý va chạm qua 2 trường phái: (1) Separate Chaining (chuẩn của Java HashMap): Mỗi bucket là một danh sách liên kết; từ Java 8, nếu bucket vượt quá TREEIFY_THRESHOLD (8 phần tử) và bảng >= 64, nó biến thành Cây Đỏ Đen (TreeBin), giới hạn thời gian tìm kiếm xấu nhất ở O(log N). (2) Open Addressing (Dò tuyến tính, Dò bậc hai, Băm kép): Lưu trực tiếp vào mảng bảng băm; khi va chạm sẽ nhảy sang ô kế tiếp. Cảnh báo hiệu năng với Objects.hash(a, b, c): Hàm này nhận varargs Object..., ép JVM phải cấp phát một mảng Object[] tạm thời trên Heap trong MỖI LẦN GỌI! Trong các vòng lặp triệu request/giây, nó tạo ra áp lực dọn rác Young Gen khủng khiếp. Hãy ưu tiên phép tính nhân 31 thủ công hoặc dùng Java Record do trình biên dịch tối ưu với 0 cấp phát Heap.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Overriding equals() but forgetting to override hashCode(). Two logically identical user objects will generate different identity hash codes, routing to separate buckets in HashMap, causing duplicate entries in HashSet and failing cache lookups.',
        vi: 'Ghi đè equals() nhưng quên ghi đè hashCode(). Hai đối tượng giống hệt nhau về dữ liệu sẽ sinh ra hai mã hash khác nhau, rơi vào hai bucket hoàn toàn khác nhau trong HashMap, gây trùng lặp phần tử trong HashSet và làm hỏng việc tra cứu cache.'
      },
      {
        en: 'Writing public boolean equals(User other) instead of public boolean equals(Object other). This is an OVERLOAD, not an override! Polymorphic collections call equals(Object) from java.lang.Object, completely bypassing your custom method and comparing memory references.',
        vi: 'Viết public boolean equals(User other) thay vì public boolean equals(Object other). Đây là NẠP CHỒNG (Overload) chứ không phải Ghi đè (Override)! Các collection đa hình luôn gọi equals(Object), bỏ qua hoàn toàn hàm của bạn và so sánh địa chỉ ô nhớ.'
      },
      {
        en: 'Using JPA/Hibernate entities with mutable auto-generated primary keys (e.g., Long id generated on persist) in HashSets. Prior to save(), id is null (hash = 0); after save(), id becomes 42, corrupting the entity position within the HashSet.',
        vi: 'Dùng thực thể JPA/Hibernate có khóa chính tự sinh (id do database gán) trong HashSet. Trước khi lưu, id là null (hash = 0); sau khi lưu, id biến thành 42, làm hỏng hoàn toàn vị trí của đối tượng trong HashSet.'
      }
    ]
  },

  steps: [
    {
      id: 'compute-hash-bucket',
      title: { en: '1. HashCode Calculation & Bucket Slot Selection', vi: '1. Tính Toán Mã Băm & Xác Định Ô Nhớ Bucket' },
      phase: 'HASH_BUCKET_ROUTING',
      description: {
        en: 'Calling map.get(key) invokes key.hashCode(). The 32-bit integer is mixed with its upper 16 bits and masked with (table.length - 1) to locate the exact array bucket in O(1) time.',
        vi: 'Gọi map.get(key) sẽ kích hoạt key.hashCode(). Số nguyên 32-bit được hòa trộn bit cao và gán mặt nạ với (table.length - 1) để trỏ đến đúng ô nhớ bucket trong thời gian O(1).'
      },
      jvmRuntimeBehavior: {
        en: 'Single ALU shift and bitwise AND operation locating memory offset in contiguous bucket array.',
        vi: 'Một phép dịch bit và phép AND phần cứng định vị offset ô nhớ trong mảng liên tục.'
      },
      javaCodeLineMatch: 'int hash = (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);'
    },
    {
      id: 'equals-collision-resolution',
      title: { en: '2. Node Traversal & equals() Verification', vi: '2. Duyệt Chuỗi Va Chạm & Xác Thực Bằng equals()' },
      phase: 'EQUALS_RESOLUTION',
      description: {
        en: 'Once inside the target bucket, if the hash matches, the JVM invokes key.equals(node.key). If true, it returns the value. If false, it traverses to node.next.',
        vi: 'Khi đã vào đúng bucket, nếu hash khớp nhau, JVM gọi key.equals(node.key). Nếu đúng, nó trả về giá trị. Nếu sai, nó duyệt tiếp sang node.next.'
      },
      jvmRuntimeBehavior: {
        en: 'Dual check: (node.hash == hash && ((k = node.key) == key || key.equals(k))).',
        vi: 'Kiểm tra kép: so sánh tham chiếu trước (==), nếu khác địa chỉ mới gọi hàm equals() để tối ưu tốc độ.'
      },
      javaCodeLineMatch: 'if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k))))'
    },
    {
      id: 'mutable-key-leak-trap',
      title: { en: '3. Fatal Trap: Mutating Keys Inside Hash Collections', vi: '3. Cạm Bẫy Chết Người: Sửa Đổi Trường Của Key Trong HashSet/HashMap' },
      phase: 'MUTATION_MEMORY_LEAK',
      description: {
        en: 'If a key field is mutated after insertion, its hashCode changes! Calling set.contains(key) searches a NEW bucket based on the new hash, finding nothing. The object is permanently trapped in memory, creating an invisible memory leak!',
        vi: 'Nếu sửa đổi trường của key sau khi đã put vào Set/Map, mã băm của nó bị thay đổi! Khi gọi set.contains(key), hàm tìm sang bucket MỚI và báo không tìm thấy. Đối tượng bị kẹt vĩnh viễn trong RAM gây rò rỉ bộ nhớ!'
      },
      jvmRuntimeBehavior: {
        en: 'Object remains referenced in old bucket table, unreachable by key lookups and uncollectable by GC.',
        vi: 'Đối tượng vẫn được mảng bucket giữ tham chiếu mạnh, không thể tra cứu mà GC cũng không thể dọn dẹp.'
      },
      javaCodeLineMatch: 'user.setName("Changed"); // Corrupts hash bucket lookup!'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'HotSpot Object.hashCode() Native Generator',
      implementationName: 'Marsaglia XorShift PRNG / Thread-Local State',
      keyMechanism: {
        en: 'Default System.identityHashCode() does NOT return the memory address! HotSpot uses a fast Marsaglia xor-shift pseudo-random number generator cached into the 31-bit header mark word (-XX:hashCode=5).',
        vi: 'Hàm System.identityHashCode() mặc định KHÔNG PHẢI là địa chỉ ô nhớ! HotSpot dùng thuật toán sinh số giả ngẫu nhiên Marsaglia xor-shift và ghi đè vào 31 bit trong Mark Word.'
      },
      defaultFlags: '-XX:hashCode=5',
      architectureNote: {
        en: 'Once generated, the identity hash code is written into the object header and never changes even if the object is relocated by GC.',
        vi: 'Khi đã sinh ra, mã băm được khóa vào object header và không bao giờ đổi kể cả khi đối tượng bị GC di chuyển ô nhớ.'
      }
    },
    {
      jvmEngine: 'Java Record Immutable Keys',
      implementationName: 'Auto-Generated Canonical HashCode & Equals',
      keyMechanism: {
        en: 'Java 16+ Records automatically generate mathematically sound, immutable, canonical implementations of equals() and hashCode() based on component fields.',
        vi: 'Java Record tự động sinh hàm equals() và hashCode() bất biến, chuẩn toán học dựa trên toàn bộ các trường dữ liệu.'
      },
      defaultFlags: 'java --enable-preview',
      architectureNote: {
        en: 'Always prefer Records as HashMap keys to eliminate mutable key corruption bugs by design.',
        vi: 'Luôn ưu tiên dùng Java Record làm key cho HashMap để loại bỏ hoàn toàn nguy cơ sửa đổi thuộc tính ngoài ý muốn.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Adhering to the contract guarantees true O(1) retrieval speeds for Hash-based enterprise data caches.',
        vi: 'Tuân thủ khế ước bảo đảm tốc độ truy xuất O(1) tuyệt đối cho các bộ nhớ đệm doanh nghiệp.'
      },
      {
        en: 'Prime 31 multiplication prevents symmetrical cancellation (e.g. "AB" vs "BA" produce distinct hash codes).',
        vi: 'Nhân với số nguyên tố 31 tránh hiện tượng triệt tiêu đối xứng (chuỗi "AB" và "BA" sinh mã băm hoàn toàn khác biệt).'
      }
    ],
    cons: [
      {
        en: 'Generating complex deep hash codes across deeply nested object trees consumes significant CPU cycles.',
        vi: 'Tính toán mã băm cho đối tượng có cấu trúc lồng nhau quá sâu sẽ tốn nhiều chu kỳ xung nhịp CPU.'
      },
      {
        en: 'Mutable objects used as keys create insidious memory leaks and non-deterministic production data corruption.',
        vi: 'Dùng đối tượng mutable làm key tạo ra lỗi rò rỉ bộ nhớ ngầm và mất dữ liệu không thể tái hiện trong kiểm thử.'
      }
    ],
    memoryFootprint: {
      en: 'Zero memory allocation when computed algorithmically. Caching hash code in an immutable field costs 4 bytes per instance.',
      vi: 'Không tốn RAM khi tính toán theo thuật toán. Lưu đệm hash vào biến tốn 4 byte trên mỗi đối tượng (như String).'
    },
    jvmSpecificationGuarantee: {
      en: 'Object §java.lang.Object: If two objects are equal according to equals(), their hashCode() method must produce the same integer result.',
      vi: 'Quy chuẩn Java: Nếu hai đối tượng bằng nhau theo hàm equals(), hàm hashCode() bắt buộc phải trả về cùng một số nguyên.'
    }
  },

  javaCode: `package com.engine.fundamentals;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Demonstrates the HashCode & Equals Contract, 
 * and the dangerous Mutable Key Trap in Hash Collections.
 */
public class HashCodeEqualsDemo {

    // SAFE: Immutable Record Key
    public record ImmutableUserKey(long id, String tenantId) {}

    // DANGEROUS: Mutable Class used as Key
    public static class MutableUserKey {
        private long id;
        private String name;

        public MutableUserKey(long id, String name) {
            this.id = id;
            this.name = name;
        }

        public void setName(String name) {
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true; // Reference equality fast-path
            if (o == null || getClass() != o.getClass()) return false;
            MutableUserKey that = (MutableUserKey) o;
            return id == that.id && Objects.equals(name, that.name);
        }

        @Override
        public int hashCode() {
            // Formula: 31 * result + c
            return Objects.hash(id, name);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== HASHCODE & EQUALS CONTRACT DEMONSTRATION ===");

        // Test 1: Proper equality contract
        ImmutableUserKey k1 = new ImmutableUserKey(101L, "VN");
        ImmutableUserKey k2 = new ImmutableUserKey(101L, "VN");
        System.out.println("k1.equals(k2): " + k1.equals(k2)); // true
        System.out.println("k1.hashCode() == k2.hashCode(): " + (k1.hashCode() == k2.hashCode())); // true

        // Test 2: The Mutable Key Disaster
        Set<MutableUserKey> userSet = new HashSet<>();
        MutableUserKey mutableKey = new MutableUserKey(999L, "Alice");
        userSet.add(mutableKey);

        System.out.println("Contains before mutation: " + userSet.contains(mutableKey)); // true

        // DISASTER: Modifying field after insertion!
        mutableKey.setName("Bob");

        // Now lookup fails because hashCode changed and points to WRONG bucket!
        System.out.println("Contains after mutation:  " + userSet.contains(mutableKey)); // FALSE!
        System.out.println("Set size: " + userSet.size()); // Still 1! Object trapped in memory!
    }
}`,

  jvmFlagsCode: `# HotSpot JVM Options for Hash Code Generation
# Select identity hash algorithm (Default: 5 = Marsaglia xor-shift PRNG)
-XX:hashCode=5

# Print Java Object Layout details including Mark Word identity hash bits
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintFlagsFinal`,

  bytecodeInspection: `// Disassembly of Record hashCode() generator
Code:
   0: aload_0
   1: invokedynamic #7, 0 // InvokeDynamic #0:hashCode:(LImmutableUserKey;)I
                          // Uses ObjectMethods.bootstrap() to compute
                          // bitwise hash without manual boilerplate
   6: ireturn`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'Why MUST you override hashCode() whenever you override equals() in Java?',
        vi: 'Tại sao bạn BẮT BUỘC phải ghi đè hashCode() mỗi khi ghi đè equals() trong Java?'
      },
      answer: {
        en: 'Because hash-based collections (HashMap, HashSet, ConcurrentHashMap, Hashtable) rely on the contract that if two objects are equal according to equals(), their hashCode() MUST produce the exact same integer! If you override equals() without hashCode(), two logically identical objects retain different System.identityHashCode values derived from their memory addresses. When you insert obj1 and later search using obj2 (where obj1.equals(obj2) is true), HashMap computes obj2\'s hash, routes to the WRONG bucket slot, and returns null!',
        vi: 'Bởi vì các cấu trúc dữ liệu bảng băm (HashMap, HashSet, ConcurrentHashMap) dựa trên khế ước: nếu hai đối tượng bằng nhau theo equals() thì hàm hashCode() của chúng BẮT BUỘC phải trả về cùng một số nguyên! Nếu bạn ghi đè equals() mà quên hashCode(), hai đối tượng giống hệt nhau sẽ mang hai mã băm khác nhau dựa trên con trỏ bộ nhớ. Khi bạn lưu obj1 rồi tìm kiếm bằng obj2 (dù obj1.equals(obj2) == true), HashMap sẽ tính mã băm của obj2 và tìm sang sai bucket, kết quả là trả về null!'
      },
      trapWarning: {
        en: 'Do not say "hashCode is used to check if objects are equal". hashCode only routes to a bucket. Objects are verified for true equality via equals().',
        vi: 'Đừng nói "hashCode dùng để so sánh hai đối tượng có bằng nhau không". hashCode chỉ dùng để định tuyến tìm bucket. Muốn xác nhận bằng nhau thật sự bắt buộc phải gọi equals().'
      },
      proTip: {
        en: 'Quote the contract directly: "Equal objects must have equal hash codes; unequal objects can have the same hash code (collision)."',
        vi: 'Trích dẫn chính xác khế ước: "Đối tượng bằng nhau bắt buộc phải có hash code bằng nhau; đối tượng khác nhau có thể có cùng hash code (va chạm)."'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'Why is the prime number 31 specifically chosen as the multiplier in Java hash algorithms?',
        vi: 'Tại sao số nguyên tố 31 lại được chọn làm hệ số nhân trong giải thuật băm mặc định của Java?'
      },
      answer: {
        en: 'Three mathematical and hardware reasons: 1. It is an odd prime. Multiplying by an even number would be equivalent to bit-shifting left, which causes bits to shift out of the 32-bit integer, discarding entropy and creating severe collisions. 2. Prime distribution: Prime multipliers minimize hash collisions when hashing sequential or patterned string data. 3. CPU ALU Hardware Optimization: 31 can be optimized by JIT compilers into a single bitwise shift and subtraction: 31 * i == (i << 5) - i. Modern CPUs execute shift and subtract in a single clock cycle (~0.3ns), avoiding expensive integer multiplication.',
        vi: 'Có 3 lý do toán học và phần cứng: 1. 31 là số lẻ nguyên tố. Nhân với một số chẵn tương đương với phép dịch bit sang trái, làm tràn bit ra ngoài dải 32-bit và vứt bỏ thông tin phân bố, gây va chạm băm nghiêm trọng. 2. Phân tán nguyên số: Thừa số nguyên tố giúp phân tán mã băm cực đều khi băm các chuỗi có quy luật. 3. Tối ưu phần cứng CPU: Phép nhân với 31 được JIT compiler thay thế bằng 1 phép dịch bit và 1 phép trừ: 31 * i == (i << 5) - i, thực thi chỉ tốn đúng 1 chu kỳ xung nhịp CPU (~0.3ns) mà không cần khối nhân ALU đắt đỏ.'
      },
      trapWarning: {
        en: 'Thinking 31 has cryptographic security properties. It has ZERO cryptographic strength; it is purely an entropy-distributing integer multiplier designed for in-memory hash tables.',
        vi: 'Nghĩ rằng số 31 có tính bảo mật mã hóa. 31 hoàn toàn không có tính bảo mật; nó thuần túy là hệ số nhân phân tán độ hỗn loạn cho bảng băm trong bộ nhớ RAM.'
      },
      proTip: {
        en: 'Mention Joshua Bloch\'s explanation in Effective Java Item 11: 31 was chosen because it was an odd prime that modern compilers easily optimize to (x << 5) - x.',
        vi: 'Dẫn chứng nhận định của Joshua Bloch trong Effective Java Item 11: 31 được chọn vì nó là số nguyên tố lẻ giúp trình biên dịch tối ưu hóa thành (x << 5) - x.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'Explain why using "instanceof" in equals() breaks the symmetry and transitivity contract in inheritance hierarchies. How does Effective Java solve this?',
        vi: 'Giải thích tại sao dùng "instanceof" trong equals() lại phá vỡ tính đối xứng và bắc cầu khi có kế thừa. Effective Java giải quyết vấn đề này ra sao?'
      },
      answer: {
        en: '1. Symmetry Breakdown: Suppose Point(x, y) uses `if (!(o instanceof Point)) return false;`. Subclass ColorPoint(x, y, color) overrides equals to also check color. When comparing Point p = new Point(1, 2) with ColorPoint cp = new ColorPoint(1, 2, RED): p.equals(cp) is true (because cp is an instanceof Point, and coordinates match). But cp.equals(p) is false (because p is not a ColorPoint or lacks color)! This violates Symmetry: a.equals(b) != b.equals(a). 2. Transitivity Breakdown: If you try a "hybrid" equals in ColorPoint that ignores color when comparing against plain Points: cp1.equals(p) is true, and p.equals(cp2) is true, but cp1.equals(cp2) is FALSE because their colors differ! This violates Transitivity: a=b and b=c must imply a=c. 3. Joshua Bloch\'s Proof: It is mathematically impossible to extend an instantiable class and add a value aspect while preserving the equals contract. Solution: Favor Composition over Inheritance. Make ColorPoint contain a private final Point point and a Color color, exposing an asPoint() view.',
        vi: '1. Phá vỡ tính đối xứng: Giả sử Point(x, y) dùng `instanceof Point`. Lớp con ColorPoint(x, y, color) ghi đè equals để kiểm tra thêm màu. Khi so sánh p = Point(1, 2) với cp = ColorPoint(1, 2, RED): p.equals(cp) là true (vì cp là instance của Point và tọa độ khớp). Nhưng cp.equals(p) là false (vì p không phải ColorPoint hoặc không có màu)! Điều này vi phạm tính Đối xứng: a.equals(b) != b.equals(a). 2. Phá vỡ tính bắc cầu: Nếu ColorPoint cố tình bỏ qua màu khi so với Point thường: cp1.equals(p) là true, và p.equals(cp2) là true, nhưng cp1.equals(cp2) lại là FALSE do khác màu! Vi phạm tính Bắc cầu. 3. Định lý của Joshua Bloch: Không có cách nào mở rộng một lớp có thể khởi tạo và thêm thuộc tính mà vẫn giữ được khế ước equals. Giải pháp: Dùng Ghép nối (Composition) thay vì Kế thừa. Để ColorPoint chứa một tham chiếu Point bên trong và cung cấp hàm asPoint().'
      },
      trapWarning: {
        en: 'Using getClass() fixes symmetry and transitivity, but violates the Liskov Substitution Principle (LSP) because subclasses cannot be substituted for their parents in collections.',
        vi: 'Dùng getClass() sửa được lỗi đối xứng và bắc cầu, nhưng lại vi phạm nguyên lý thay thế Liskov (LSP) vì lớp con không thể thay thế cho lớp cha trong các cấu trúc tập hợp.'
      },
      proTip: {
        en: 'Emphasize that in modern Java (Java 14+), value objects should be modeled as Records (record Point(int x, int y)), which are final and prevent this entire category of inheritance bugs.',
        vi: 'Nhấn mạnh trong Java hiện đại (Java 14+), các đối tượng giá trị nên được khai báo bằng Record (record Point(int x, int y)), do Record là final nên triệt tiêu hoàn toàn lớp lỗi kế thừa này.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        en: 'What is the physical memory consequence of mutating an object after using it as a HashMap Key? Can you recover or remove it?',
        vi: 'Hậu quả bộ nhớ vật lý là gì khi sửa đổi (mutate) một đối tượng sau khi đã dùng nó làm Key trong HashMap? Có thể thu hồi hoặc xóa nó không?'
      },
      answer: {
        en: '1. The Ghost Key Bug: When map.put(key, val) is called, HashMap hashes key.hashCode() to determine the bucket index (e.g., bucket 3). The Node is stored in bucket 3. If you subsequently mutate a field of key, key.hashCode() changes. 2. Lookups and Removals Fail: When you later call map.get(key) or map.remove(key), HashMap recomputes the hash using the NEW field values, routing to bucket 9. Bucket 9 is empty, so get() returns null and remove() does nothing! 3. Permanent Heap Leak: Even if you iterate over map.keySet(), you cannot safely remove it via standard map APIs without an iterator scan. The entry is permanently trapped in bucket 3, holding references to both key and value, preventing garbage collection and leading to a slow, undetectable Heap memory leak in long-running services.',
        vi: '1. Lỗi Khóa Bóng Ma (Ghost Key): Khi gọi map.put(key, val), HashMap tính hash code ban đầu và lưu Node vào bucket tương ứng (ví dụ bucket 3). Nếu sau đó bạn sửa đổi thuộc tính của key, hàm key.hashCode() sẽ trả về mã băm mới. 2. Mất tích hoàn toàn: Khi bạn gọi map.get(key) hay map.remove(key), HashMap tính toán lại mã hash mới và nhảy sang tìm ở bucket 9. Bucket 9 rỗng nên get() trả về null và remove() không xóa được gì! 3. Rò rỉ RAM vĩnh viễn: Node dữ liệu cũ bị kẹt vĩnh viễn ở bucket 3, giữ chặt tham chiếu tới cả Key và Value khiến Garbage Collector không thể thu hồi, gây ra rò rỉ bộ nhớ Heap âm thầm và cực kỳ khó debug trong các ứng dụng chạy dài ngày.'
      },
      trapWarning: {
        en: 'Candidates often think map.remove(key) will find it by scanning all buckets. It does NOT! HashMap strictly computes (n-1)&hash and only inspects the matching bucket.',
        vi: 'Ứng viên hay nhầm rằng map.remove(key) sẽ quét toàn bộ các bucket để tìm. Hoàn toàn KHÔNG! HashMap chỉ tính (n-1)&hash và nhảy thẳng vào đúng 1 bucket duy nhất.'
      },
      proTip: {
        en: 'Architectural rule: Map keys MUST be strictly immutable. Enforce this via Java Records, String, UUID, or unmodifiable value objects with final fields and no setters.',
        vi: 'Quy tắc kiến trúc: Khóa của Map BẮT BUỘC phải bất biến (Immutable). Đảm bảo điều này bằng Java Record, String, UUID hoặc các lớp chỉ có trường final và không có setter.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'The Phantom Cache Memory Leak Caused by Mutable Map Keys',
      vi: 'Rò Rỉ Bộ Nhớ Bộ Đệm & Không Thể Tìm Thấy Dữ Liệu Do Dùng Mutable Key'
    },
    businessContext: {
      en: 'A high-throughput enterprise SaaS platform caches active tenant session states in a ConcurrentHashMap<UserAccount, SessionContext>. UserAccount has mutable fields including id, email, and subscriptionTier.',
      vi: 'Nền tảng SaaS doanh nghiệp lưu trữ thông tin phiên làm việc của người dùng trong bộ đệm ConcurrentHashMap<UserAccount, SessionContext>. Lớp UserAccount có các trường có thể thay đổi gồm id, email và gói thuê bao subscriptionTier.'
    },
    problemDescription: {
      en: 'When a user logs in, their UserAccount instance is added to the session cache. Its initial hashCode() hashes to bucket #14. Later, a background profile synchronization job updates the user\'s email or tier: account.setSubscriptionTier("ENTERPRISE"). Because subscriptionTier contributes to hashCode(), the object\'s hash changes, now pointing to bucket #89! When the user makes an API call, map.get(account) calculates the new hash, searches bucket #89, and returns null! The system falsely believes the session has expired and forces the user to log in again. Worse, calling map.remove(account) also searches bucket #89 and fails to delete the entry. When the user logs in again, another duplicate is added to bucket #89. Over weeks, hundreds of thousands of orphaned session entries remain trapped in Heap memory, leaking gigabytes of RAM until the server crashes with OutOfMemoryError.',
      vi: 'Khi người dùng đăng nhập, đối tượng UserAccount được đưa vào bộ đệm cache. Hàm hashCode() ban đầu đưa nó vào bucket số #14. Một lúc sau, tiến trình đồng bộ hồ sơ ngầm cập nhật gói thuê bao: account.setSubscriptionTier("ENTERPRISE"). Vì trường này tham gia tính hashCode(), mã băm của đối tượng lập tức bị đổi sang giá trị mới, trỏ vào bucket số #89! Khi người dùng gọi API, hàm map.get(account) tính ra mã băm mới, tìm vào bucket #89 và trả về null! Hệ thống tưởng nhầm phiên đăng nhập đã hết hạn và bắt người dùng đăng nhập lại liên tục. Tệ hơn, hàm map.remove(account) cũng tìm ở bucket #89 nên không thể xóa được dữ liệu cũ ở bucket #14. Người dùng đăng nhập lại sẽ nhồi thêm một bản ghi rác nữa. Qua nhiều tuần, hàng trăm ngàn phiên làm việc rác bị kẹt cứng trong RAM, gây rò rỉ hàng gigabyte bộ nhớ cho đến khi máy chủ sập nguồn vì OutOfMemoryError.'
    },
    whyNaiveFails: {
      en: 'Developers mistakenly assume that because the object instance itself still exists in memory and contains(account) is passed the exact same reference, Java will find it. In a HashMap, if the hash code changes, the lookup searches the wrong memory slot immediately and never invokes equals() on the original bucket!',
      vi: 'Lập trình viên hay lầm tưởng rằng vì đối tượng vẫn nằm trong RAM và truyền đúng tham chiếu đó vào contains(), Java sẽ tự tìm ra. Trong HashMap, nếu mã băm thay đổi, nó sẽ nhảy ngay vào sai bucket và hoàn toàn không bao giờ gọi hàm equals() trên bucket cũ!'
    },
    coreSolution: {
      en: '1. Absolute Immutability for Collection Keys: Java 14+ Record classes enforce shallow immutability (all fields are private final with zero setters), guaranteeing that hashCode() can NEVER mutate over the object lifecycle.\n2. Natural Business Key Identity: Compute hashCode() and equals() strictly using unique, unchangeable identity fields (e.g., UUID or unique accountId), completely excluding volatile attributes like names, emails, or status flags.\n3. Defensive Copying: Always return unmodifiable views or defensive clones if mutable state must be shared.',
      vi: '1. Tính Bất Biến Tuyệt Đối Cho Khóa Bảng Băm: Sử dụng Java 14+ Record (mọi trường đều là private final và không có setter), cam kết mã hashCode() KHÔNG BAO GIỜ bị thay đổi trong suốt vòng đời đối tượng.\n2. Băm Theo Khóa Nhận Diện Bất Biến: Chỉ tính toán hashCode() và equals() dựa trên khóa duy nhất không bao giờ đổi (như UUID hoặc accountId), tuyệt đối không đưa các trường có thể thay đổi như họ tên, email hay cờ trạng thái vào hàm băm.\n3. Sao Chép Phòng Vệ: Luôn trả về bản sao chép phòng vệ hoặc unmodifiable view nếu cần chia sẻ đối tượng giữa các thread.'
    },
    productionCode: `// Production Immutable Cache Key using Java 21 Record
public record UserSessionKey(
    UUID accountId,     // Immutable unique business identifier
    String tenantId     // Multi-tenant partition boundary
) {
    // Compact constructor with strict validation
    public UserSessionKey {
        Objects.requireNonNull(accountId, "accountId cannot be null");
        Objects.requireNonNull(tenantId, "tenantId cannot be null");
    }

    // Java 21 Record automatically generates compiler-optimized, 
    // mathematically sound, 100% immutable hashCode() and equals()!
}

@Service
public class TenantSessionCacheService {
    // Guaranteed zero memory leak from key mutation!
    private final ConcurrentHashMap<UserSessionKey, SessionContext> sessionCache = new ConcurrentHashMap<>();

    public void putSession(UUID accountId, String tenantId, SessionContext ctx) {
        sessionCache.put(new UserSessionKey(accountId, tenantId), ctx);
    }

    public SessionContext getSession(UUID accountId, String tenantId) {
        return sessionCache.get(new UserSessionKey(accountId, tenantId));
    }
}`,
    architectureImpact: {
      en: 'Eliminated 100% of phantom cache misses and memory leaks. Cache hit ratio surged from 84% to 99.8%. Server memory utilization remained perfectly stable over months of continuous enterprise production traffic.',
      vi: 'Xóa sổ 100% các lỗi mất cache ảo và rò rỉ bộ nhớ ngầm. Tỷ lệ Cache Hit vọt từ 84% lên 99.8%. Bộ nhớ RAM máy chủ duy trì trạng thái ổn định phẳng tuyệt đối qua nhiều tháng hoạt động liên tục.'
    }
  }
};
