import type { JavaCoreTopic } from '../types';

export const hashmapInternals: JavaCoreTopic = {
  id: 'hashmap-internals',
  category: 'collections-internals',
  name: 'HashMap Bitwise Hashing & Red-Black Treeification',
  tagline: {
    en: 'Hash table physics: High-16-bit hash spreading, power-of-two bitwise masking (n-1 & hash), collision chaining, and Red-Black treeification at threshold 8.',
    vi: 'Bản chất bảng băm: Trộn bit cao xor (>>> 16), mặt nạ bitwise (n-1 & hash), xử lý đụng độ bằng danh sách liên kết và cây hóa Red-Black ở ngưỡng 8.'
  },
  difficulty: 2,
  level: 'advanced',
  order: 18,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Using traditional modulo arithmetic (hash % capacity) to calculate array bucket indices requires an integer division CPU instruction taking ~20-40 clock cycles. Under millions of map lookups per second, division bottlenecks the CPU. Furthermore, naive hash chaining degrades to O(n) linear search under malicious or colliding keys.',
      vi: 'Dùng phép chia lấy dư truyền thống (hash % capacity) để tìm index mảng đòi hỏi lệnh chia số nguyên của CPU tốn ~20-40 chu kỳ xung nhịp. Với hàng triệu lượt tra cứu mỗi giây, phép chia này làm nghẽn CPU. Hơn nữa, việc nối chuỗi danh sách liên kết khi đụng độ sẽ làm thuật toán thoái hóa thành O(n).'
    },
    hardwareConstraint: {
      en: 'Bitwise AND (&) operations execute in a single CPU clock cycle (~0.3 nanoseconds). If and only if the capacity is a power of two (2^n), the mathematical identity holds: hash % n == (n - 1) & hash. This turns expensive division into a single single-cycle hardware bitmask.',
      vi: 'Phép toán bitwise AND (&) thực thi chỉ trong duy nhất 1 chu kỳ xung nhịp CPU (~0.3ns). Khi và chỉ khi dung lượng mảng là lũy thừa của 2 (2^n), đẳng thức toán học sau luôn đúng: hash % n == (n - 1) & hash. Điều này biến phép chia đắt đỏ thành một mặt nạ bit phần cứng siêu tốc.'
    },
    fundamentalSolution: {
      en: 'Java HashMap enforces power-of-two array capacities (default 16, resizing by doubling). To prevent collisions when only low bits vary, it applies a Hash Spreading function: h ^ (h >>> 16). Collisions are resolved via singly-linked Node lists. When a bucket reaches TREEIFY_THRESHOLD (8 entries) and table capacity >= 64, HotSpot converts the list into a Red-Black Tree, guaranteeing O(log n) worst-case search.',
      vi: 'HashMap Java bắt buộc dung lượng mảng luôn là lũy thừa của 2 (mặc định 16, nhân đôi khi resize). Để chống đụng độ khi chỉ các bit thấp thay đổi, HashMap áp dụng hàm trộn bit: h ^ (h >>> 16). Đụng độ được lưu vào danh sách liên kết Node. Khi một bucket đạt ngưỡng 8 phần tử và tổng dung lượng mảng >= 64, HotSpot tự động chuyển đổi danh sách thành Cây Đỏ Đen (Red-Black Tree), bảo đảm thời gian tìm kiếm O(log n).'
    },
    math: {
      formula: 'Index = (Capacity - 1) & (key.hashCode() ^ (key.hashCode() >>> 16))',
      description: {
        en: 'XORing the high 16 bits into the low 16 bits guarantees that high-order entropy influences the index even when the array capacity is small (e.g. 16 or 32 buckets).',
        vi: 'Phép XOR 16 bit cao vào 16 bit thấp bảo đảm độ ngẫu nhiên của các bit bậc cao vẫn tác động đến index kể cả khi kích thước mảng còn rất nhỏ (như 16 hay 32 ô).'
      },
      timeComplexity: 'O(1) average lookup; O(log n) worst-case under Red-Black treeification',
      spaceComplexity: 'Node = 32 Bytes; TreeNode = 56 Bytes (doubly-linked red-black tree node)',
      memoryOverheadFormula: 'Resizing Threshold = Capacity × Load_Factor (Default 16 × 0.75 = 12 elements)'
    }
  },

  detailedTheory: {
    overview: {
      en: 'Java HashMap is one of the most heavily optimized data structures in modern software engineering. Re-engineered in Java 8 by replacing linear linked-list collision chains with balanced Red-Black Trees, HashMap provides near-instantaneous O(1) performance while offering resilience against Hash Collision Denial-of-Service (DoS) attacks.',
      vi: 'HashMap là một trong những cấu trúc dữ liệu được tối ưu hóa sâu nhất trong ngành công nghệ phần mềm. Được tái thiết kế toàn diện từ Java 8 bằng cách thay thế danh sách liên kết tuyến tính bằng Cây Đỏ Đen tự cân bằng, HashMap mang lại tốc độ tra cứu O(1) tức thì và chống lại các cuộc tấn công từ chối dịch vụ (DoS) bằng mã băm đụng độ.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Power-of-Two Masking Optimization: Why does HashMap insist on capacities like 16, 32, 64, 1024? When n is a power of 2, n - 1 in binary consists entirely of 1s (e.g. 16 - 1 = 15 = 0b00001111). Executing (15 & hash) takes the lower 4 bits of the hash code directly as the array index! This avoids the hardware CPU DIV instruction entirely, speeding up map indexing by 30x.',
        vi: '1. Tối Ưu Hóa Mặt Nạ Lũy Thừa 2: Vì sao HashMap bắt buộc dung lượng phải là 16, 32, 64, 1024? Khi n là lũy thừa của 2, n - 1 ở dạng nhị phân luôn bao gồm toàn bộ các bit 1 (ví dụ 16 - 1 = 15 = 0b00001111). Lệnh (15 & hash) lấy thẳng 4 bit thấp nhất của mã băm làm index mảng! Thao tác này bỏ qua hoàn toàn lệnh chia DIV của CPU, tăng tốc độ tra cứu lên 30 lần.'
      },
      {
        en: '2. The Hash Spreader Function (h ^ (h >>> 16)): If two keys have distinct hash codes in their high 16 bits but identical lower 4 bits (e.g. 0xAAAA0001 vs 0x55550001), a naive bitmask with n=16 would place both into index 1, causing a collision! HashMap shifts key.hashCode() right by 16 bits (>>> 16) and XORs it with the original hash. This propagates high-bit entropy into the lower bits with minimal CPU overhead.',
        vi: '2. Hàm Trộn Bit (Hash Spreader): Nếu hai key có mã hash khác nhau ở 16 bit cao nhưng giống hệt nhau ở 4 bit thấp (như 0xAAAA0001 và 0x55550001), một mặt nạ thông thường với n=16 sẽ ném cả hai vào index 1 gây đụng độ! HashMap dịch bit sang phải 16 bit (>>> 16) và XOR với hash ban đầu, giúp đưa độ ngẫu nhiên của các bit cao xuống các bit thấp với chi phí CPU gần như bằng 0.'
      },
      {
        en: '3. Red-Black Treeification at Threshold 8: In Java 7, collisions formed a singly-linked list. If an attacker crafted 10,000 keys with identical hash buckets, get() degraded to an O(n) scan, causing 100% CPU spikes (Hash DoS attack). Java 8 introduced Treeification: when a bucket reaches 8 nodes AND table capacity >= 64, the bucket transforms into a Red-Black Tree (TreeNode<K,V>). Lookups drop from 8 comparisons to at most log2(8) = 3 comparisons.',
        vi: '3. Cây Hóa Red-Black Ở Ngưỡng 8: Ở Java 7, đụng độ tạo thành danh sách liên kết đơn. Nếu kẻ tấn công cố tình tạo ra 10.000 key cùng rơi vào 1 bucket, hàm get() thoái hóa thành O(n), đốt 100% CPU (tấn công Hash DoS). Java 8 đưa vào cơ chế Cây Hóa: khi bucket đạt 8 phần tử và mảng >= 64, danh sách biến thành Cây Đỏ Đen. Số lần so sánh giảm từ 8 phép so sánh xuống tối đa log2(8) = 3 phép so sánh.'
      },
      {
        en: '4. Untreeify Threshold (6) & Hysteresis: Why does untreeification occur at 6 instead of 7? If the threshold to treeify was 8 and untreeify was 7, frequent insertions and deletions around 7-8 would trigger continuous, expensive conversions between LinkedList and Red-Black Tree! Establishing an untreeify threshold of 6 creates a hysteresis gap, preventing conversion thrashing.',
        vi: '4. Ngưỡng Hủy Cây (6) & Vùng Trễ Hysteresis: Vì sao ngưỡng chuyển ngược lại danh sách liên kết lại là 6 mà không phải 7? Nếu treeify là 8 và untreeify là 7, việc liên tục insert và remove quanh ngưỡng này sẽ làm HashMap liên tục chuyển đổi tốn kém giữa LinkedList và Cây Đỏ Đen! Đặt ngưỡng hủy là 6 tạo ra một khoảng trễ (Hysteresis gap), triệt tiêu hiện tượng rung lắc chuyển đổi liên miên.'
      },
      {
        en: '5. Lock-Free Resizing Without Recomputing Hashes: When size exceeds capacity * 0.75, the table array doubles in size (e.g. 16 -> 32). In classical hash tables, every key’s hash must be recalculated. In Java HashMap, doubling adds 1 bit to the mask. Elements in bucket i either remain at i (if the new bit is 0) or move to i + oldCapacity (if the new bit is 1)! This halves the elements into two clean sublists using simple bitwise testing without touching hashCode().',
        vi: '5. Nhân Đôi Mảng Siêu Tốc Không Cần Tính Lại Hash: Khi số phần tử vượt ngưỡng 75%, mảng tăng gấp đôi (16 lên 32). Ở bảng băm thông thường, mọi key đều phải tính lại hash. Trong HashMap Java, việc nhân đôi chỉ thêm 1 bit vào mặt nạ. Các phần tử ở bucket i chỉ có 2 khả năng: giữ nguyên vị trí i (nếu bit mới là 0) hoặc dời sang i + oldCapacity (nếu bit mới là 1)! HashMap tách đôi mảng thành 2 danh sách mượt mà bằng phép kiểm tra bit mà không cần gọi lại hàm hashCode().'
      },
      {
        en: '6. Mutable Keys & The Vanishing Object Bug: If a class used as a HashMap key is mutable (e.g. class User { String name; }), mutating user.setName("Bob") after putting it into the map changes its hashCode(). When map.get(user) is called later, HashMap hashes the new value, looks in a completely different bucket, and returns null! The object remains trapped in the old bucket as a permanent memory leak.',
        vi: '6. Khóa Biến Đổi (Mutable Keys) & Lỗi Mất Tích Đối Tượng: Nếu một class dùng làm key có thể thay đổi dữ liệu (như class User { String name; }), việc gọi user.setName("Bob") sau khi đã đưa vào Map sẽ làm thay đổi hashCode() của nó. Khi gọi map.get(user), HashMap băm giá trị mới và tìm ở một bucket hoàn toàn khác, trả về null! Đối tượng cũ bị kẹt lại ở bucket cũ vĩnh viễn gây rò rỉ RAM.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Using HashMap in Multi-Threaded Environments: Standard HashMap is NOT thread-safe. In Java 7, concurrent resize caused cyclic linked-list loops that locked CPU cores at 100%. While Java 8 eliminated infinite loops, concurrent writes still cause silent data loss, overwritten node pointers, and corrupted TreeNodes. Always use ConcurrentHashMap in multi-threaded contexts.',
        vi: 'Dùng HashMap Trong Môi Trường Đa Luồng: HashMap tiêu chuẩn KHÔNG an toàn đa luồng. Trên Java 7, resize đồng thời tạo ra vòng lặp vô tận danh sách liên kết làm CPU đơ 100%. Dù Java 8 đã loại bỏ vòng lặp vô tận, ghi đồng thời vẫn gây mất mát dữ liệu âm thầm và làm hỏng con trỏ cây. Luôn sử dụng ConcurrentHashMap trong môi trường đa luồng.'
      },
      {
        en: 'Overriding equals() Without hashCode(): If a class overrides equals() but fails to override hashCode(), two objects with identical business data produce different hash codes. Placing object 1 into the map and searching with object 2 returns null, breaking Set and Map contracts! Always use Java records or generate matching equals() and hashCode() together.',
        vi: 'Ghi Đè equals() Nhưng Quên Ghi Đè hashCode(): Nếu một class ghi đè equals() nhưng không ghi đè hashCode(), hai đối tượng có dữ liệu giống hệt nhau sẽ sinh ra hai mã hash khác nhau. Đưa đối tượng 1 vào Map rồi dùng đối tượng 2 để get() sẽ nhận về null, phá vỡ giao kèo cốt lõi của Java! Luôn dùng Java record hoặc sinh đồng thời cả hai hàm equals() và hashCode().'
      },
      {
        en: 'Initial Capacity Sizing Underestimation: Storing 100,000 items in a default HashMap (capacity 16, load factor 0.75) forces the map to resize and rehash 14 consecutive times (16 -> 32 -> 64 ... -> 131,072). This triggers massive GC allocation pressure. Always pre-size maps: initialCapacity = (int) (expectedSize / 0.75f) + 1.',
        vi: 'Đánh Giá Thấp Dung Lượng Khởi Tạo: Nạp 100.000 phần tử vào HashMap mặc định (capacity 16, load factor 0.75) buộc Map phải resize và chia lại mảng 14 lần liên tiếp (16 -> 32 -> 64 ... -> 131.072). Điều này tạo áp lực cấp phát rác GC khủng khiếp. Luôn khai báo dung lượng trước: initialCapacity = (int) (expectedSize / 0.75f) + 1.'
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'HashMap Bucket Array, Node LinkedList & Red-Black Tree Layout',
      vi: 'Cấu Trúc Mảng Bucket, Danh Sách Liên Kết Node & Cây Đỏ Đen'
    },
    description: {
      en: 'Internal table array of Node<K, V> elements. When collision depth reaches 8, nodes inflate into 56-byte TreeNode elements maintaining a self-balancing Red-Black tree.',
      vi: 'Mảng bảng băm chứa các phần tử Node<K,V>. Khi độ sâu đụng độ chạm ngưỡng 8, các node nâng cấp thành TreeNode 56-byte duy trì Cây Đỏ Đen tự cân bằng.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| HASHMAP IN-MEMORY TABLE ARRAY (table[index] where index = (n - 1) & hash):                          |
+----------------------------------------------------------------------------------------------------+
| table[0]:  null                                                                                    |
| table[1]:  [ Node: Key="A", Hash=0x11, Val=100 ] -> [ Node: Key="Q", Hash=0x21 ] (Collision Chain) |
| table[2]:  null                                                                                    |
| table[3]:  [ TreeNode (ROOT) Key="K1" (Black) ]                                                    |
|             /                                  \\                                                   |
|       [ TreeNode Key="K0" (Red) ]        [ TreeNode Key="K2" (Red) ]   (TREEIFY_THRESHOLD >= 8)     |
| table[4]:  [ Node: Key="Z", Hash=0x44, Val=500 ]                                                   |
+----------------------------------------------------------------------------------------------------+
| NODE MEMORY FOOTPRINT:                                                                             |
|  1. Node<K,V> (32 Bytes):     [Mark Word (8B)] + [Klass (4B)] + [hash (4B)] + [Key (4B)]           |
|                               + [Val (4B)] + [next ptr (4B)] + [Padding (4B)]                      |
|  2. TreeNode<K,V> (56 Bytes): Extends Node with [parent], [left], [right], [prev], [red: boolean]  |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'hash', size: '32-bit Int (4B)', description: { en: 'Cached perturbed hash value (h ^ (h >>> 16)) avoiding recalculation during resizing.', vi: 'Giá trị hash trộn được cache lại để tránh phải tính toán lại khi mảng resize.' } },
      { name: 'key_val_pointers', size: 'Compressed OOPs (8B)', description: { en: '4-byte compressed reference to Key object + 4-byte compressed reference to Value object.', vi: 'Con trỏ nén 4-byte tới Key + con trỏ nén 4-byte tới Value.' } },
      { name: 'next_pointer', size: 'Compressed OOP (4B)', description: { en: 'Pointer to next colliding Node in singly-linked bucket chain; null if tail.', vi: 'Con trỏ tới Node đụng độ tiếp theo trong danh sách liên kết; null nếu ở đuôi.' } },
      { name: 'treenode_pointers', size: '24 Bytes', description: { en: 'Parent, left child, right child, and prev pointers for Red-Black tree traversal.', vi: 'Con trỏ parent, con trái, con phải và prev để duyệt Cây Đỏ Đen.' } }
    ]
  },

  steps: [
    {
      id: 'hash-spread',
      title: { en: '1. Hash Code Spreading & Bitwise Mask Indexing', vi: '1. Trộn Bit Mã Băm & Tính Index Bằng Mặt Nạ Bitwise' },
      phase: 'HASH_SPREAD_MASK',
      description: {
        en: 'The key’s hashCode() is perturbed: h ^ (h >>> 16). The index is computed using single-cycle hardware bitwise AND: index = (capacity - 1) & h. If table[index] is null, the new Node is stored directly.',
        vi: 'Mã hashCode() của key được trộn: h ^ (h >>> 16). Index được tính bằng phép bitwise AND phần cứng 1 chu kỳ: index = (capacity - 1) & h. Nếu table[index] đang trống (null), Node mới được lưu vào ngay.'
      },
      jvmRuntimeBehavior: {
        en: 'Single CPU cycle arithmetic. Direct L1 cache table array lookup.',
        vi: 'Phép toán 1 chu kỳ xung nhịp CPU. Tra cứu mảng trực tiếp trên cache L1.'
      },
      javaCodeLineMatch: 'map.put(key, value); // (n - 1) & (h ^ (h >>> 16))'
    },
    {
      id: 'collision-chain',
      title: { en: '2. Hash Collision & Singly-Linked Chaining', vi: '2. Xảy Ra Đụng Độ & Nối Chuỗi Danh Sách Liên Kết' },
      phase: 'COLLISION_CHAIN',
      description: {
        en: 'If table[index] is occupied, HashMap traverses the linked list. If an existing key matches via (p.hash == hash && (p.key == key || key.equals(p.key))), the value is updated. Otherwise, the new Node is appended to the tail.',
        vi: 'Nếu table[index] đã có phần tử, HashMap duyệt danh sách liên kết. Nếu tìm thấy key trùng (kiểm tra hash và equals), giá trị được cập nhật. Nếu không trùng, Node mới được nối vào đuôi danh sách.'
      },
      jvmRuntimeBehavior: {
        en: 'Pointer traversal down linked list. Invokes key.equals() if hashes match.',
        vi: 'Duyệt con trỏ dọc danh sách liên kết. Gọi hàm key.equals() nếu mã hash trùng nhau.'
      },
      javaCodeLineMatch: 'for (int binCount = 0; ; ++binCount) { ... }'
    },
    {
      id: 'treeify-split',
      title: { en: '3. Red-Black Treeification at Threshold 8', vi: '3. Cây Hóa Red-Black Tree Khi Chạm Ngưỡng 8' },
      phase: 'TREEIFY_BIN',
      description: {
        en: 'When the 8th collision is added to a bucket (binCount >= 8) and table.length >= 64, treeifyBin() transforms the linked list into a balanced Red-Black Tree of TreeNodes, guaranteeing O(log n) lookups.',
        vi: 'Khi phần tử đụng độ thứ 8 được thêm vào bucket (binCount >= 8) và table.length >= 64, hàm treeifyBin() biến đổi danh sách liên kết thành Cây Đỏ Đen tự cân bằng, bảo đảm tốc độ tra cứu O(log n).'
      },
      jvmRuntimeBehavior: {
        en: 'Allocates TreeNode objects. Balances tree using left/right rotations and color flips.',
        vi: 'Cấp phát các đối tượng TreeNode. Cân bằng cây bằng phép quay trái/phải và đổi màu cờ.'
      },
      javaCodeLineMatch: 'treeifyBin(tab, hash);'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'OpenJDK / Oracle HotSpot',
      implementationName: 'Java 8+ Treeified HashMap',
      keyMechanism: {
        en: 'Features hybrid Singly-Linked List and Red-Black Tree buckets with power-of-two bitwise indexing and hash perturbation spreading.',
        vi: 'Kết hợp danh sách liên kết đơn và Cây Đỏ Đen tự cân bằng kèm cơ chế tính index bitwise lũy thừa 2 và hàm trộn bit.'
      },
      defaultFlags: 'Standard JDK Collections',
      architectureNote: {
        en: 'TREEIFY_THRESHOLD=8 and UNTREEIFY_THRESHOLD=6 were selected based on Poisson distribution modeling of hash collisions under random keys.',
        vi: 'Ngưỡng 8 và 6 được chọn dựa trên phân phối xác suất Poisson về sự phân bổ đụng độ ngẫu nhiên của hàm băm.'
      }
    },
    {
      jvmEngine: 'Android ART / Android Runtime',
      implementationName: 'Memory-Constrained ArrayMap',
      keyMechanism: {
        en: 'Android introduces ArrayMap and SparseArray to eliminate Node object allocation overheads on memory-constrained mobile devices.',
        vi: 'Android cung cấp ArrayMap và SparseArray để loại bỏ chi phí cấp phát đối tượng Node trên các thiết bị di động ít RAM.'
      },
      defaultFlags: 'Android SDK Support',
      architectureNote: {
        en: 'Replaces hash buckets with two small arrays: one sorted int[] of hashes and one Object[] of key-value pairs using binary search.',
        vi: 'Thay thế bucket băm bằng 2 mảng nhỏ: mảng int[] lưu hash được sắp xếp và mảng Object[] lưu key-value qua tìm kiếm nhị phân.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Blazing fast O(1) single-cycle bitwise lookups for uniformly distributed keys.', vi: 'Tốc độ tra cứu O(1) 1 chu kỳ xung nhịp CPU siêu nhanh khi các key phân bổ đều.' },
      { en: 'Resilience against Hash DoS attacks by capping worst-case collision traversal at O(log n).', vi: 'Chống tấn công từ chối dịch vụ Hash DoS bằng cách chặn cận trên tìm kiếm ở O(log n) nhờ Cây Đỏ Đen.' }
    ],
    cons: [
      { en: 'Not thread-safe: concurrent writes cause corrupted pointers and data loss.', vi: 'Không an toàn đa luồng: các thao tác ghi đồng thời gây hỏng con trỏ và mất mát dữ liệu.' },
      { en: '32-byte memory overhead per Node entry (~2.5x the memory footprint of raw key/value data).', vi: 'Tốn 32 byte bộ nhớ cho mỗi Node (gấp ~2.5 lần dung lượng dữ liệu thực tế của key/value).' }
    ],
    memoryFootprint: {
      en: 'Moderate-to-High: Table array of references + 32B per Node (or 56B per TreeNode).',
      vi: 'Trung bình đến Cao: Mảng tham chiếu bảng băm + 32B cho mỗi Node (hoặc 56B cho mỗi TreeNode).'
    },
    jvmSpecificationGuarantee: {
      en: 'Map interface compliance: Keys must satisfy consistent equals() and hashCode() contracts.',
      vi: 'Tuân thủ hợp đồng Map: Các đối tượng Key bắt buộc phải tuân thủ nghiêm ngặt quan hệ equals() và hashCode().'
    }
  },

  javaCode: `package com.enterprise.jvm.collections;

import java.util.HashMap;
import java.util.Map;

/**
 * Pure Java 21 Educational Masterclass: HashMap Hashing & Treeification
 * Demonstrates:
 *  1. Bitwise Index Calculation: (n - 1) & (h ^ (h >>> 16))
 *  2. Synthetic Hash Collision Simulation forcing Red-Black Treeification
 *  3. Mutable Key Gotchas causing Vanishing Data Bugs
 */
public class HashMapInternalsDemo {

    // CollidingKey forces identical hash bucket to trigger Treeification at threshold 8!
    public static class CollidingKey implements Comparable<CollidingKey> {
        private final int id;

        public CollidingKey(int id) {
            this.id = id;
        }

        @Override
        public int hashCode() {
            return 42; // FORCED COLLISION: All keys hit identical bucket index!
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            return this.id == ((CollidingKey) obj).id;
        }

        @Override
        public int compareTo(CollidingKey o) {
            return Integer.compare(this.id, o.id); // Required for Red-Black tree tie-breaking
        }

        @Override
        public String toString() {
            return "Key#" + id;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== HASHMAP BITWISE HASHING & TREEIFICATION MASTERCLASS ===");

        // Pre-sized map to avoid resizing during demo
        Map<CollidingKey, String> map = new HashMap<>(64);

        // Insert 10 colliding keys into bucket 42
        // Entries 1-7: Stored as singly-linked list (Node<K, V>)
        // Entry 8+: Triggers treeifyBin() -> Inflates to Red-Black Tree (TreeNode<K, V>)!
        for (int i = 1; i <= 10; i++) {
            map.put(new CollidingKey(i), "PAYLOAD_" + i);
            System.out.printf("Inserted Key #%d into colliding bucket (Total Size: %d)%n", i, map.size());
        }

        // Lookup: O(log n) binary search traversal down Red-Black Tree instead of O(n) list scan!
        String result = map.get(new CollidingKey(8));
        System.out.println("Retrieved Key #8 via Red-Black Tree search: " + result);
    }
}`,

  jvmFlagsCode: `# ===================================================================
# Sizing HashMap to Avoid Costly Resizing in Production
# ===================================================================
# Formula: initialCapacity = (int) (expectedEntries / 0.75f) + 1
# Storing 1,000,000 items without resize:
# initialCapacity = (1,000,000 / 0.75) + 1 = 1,333,334 -> Rounds up to 2^21 = 2,097,152

Map<String, Order> orders = new HashMap<>(2_097_152);`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c com.enterprise.jvm.collections.HashMapInternalsDemo
public static void main(java.lang.String[]);
  Code:
   0: getstatic     #7   // Field java/lang/System.out:Ljava/io/PrintStream;
   3: ldc           #9   // String === HASHMAP BITWISE HASHING & TREEIFICATION MASTERCLASS ===
   5: invokevirtual #11  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
   8: new           #17  // class java/util/HashMap
  11: dup
  12: bipush        64   // Initial capacity = 64
  14: invokespecial #19  // Method java/util/HashMap."<init>":(I)V
  17: astore_1
  18: iconst_1
  19: istore_2
  20: iload_2
  21: bipush        10
  23: if_icmpgt     66
  26: aload_1
  27: new           #22  // class CollidingKey
  30: dup
  31: iload_2
  32: invokespecial #24  // Method CollidingKey."<init>":(I)V
  35: ...
  48: invokeinterface #34, 3 // InterfaceMethod java/util/Map.put:(Ljava/lang/Object;Ljava/lang/Object;)
  53: pop
  54: iinc          2, 1
  57: goto          20`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'How does HashMap calculate the bucket index from a key\'s hashCode in Java?',
        vi: 'HashMap tính toán chỉ số bucket index từ hashCode của key như thế nào trong Java?'
      },
      answer: {
        en: 'HashMap does NOT use the expensive modulo operator (hash % capacity). Instead, it enforces that table capacity is ALWAYS a power of two (16, 32, 64...), which allows using a bitwise AND mask: index = (n - 1) & hash. Before masking, HashMap applies a perturbation function: hash = (h = key.hashCode()) ^ (h >>> 16). This XORs the high 16 bits with the low 16 bits to prevent hash collisions in small tables where only the lowest 4 bits would otherwise determine the index.',
        vi: 'HashMap KHÔNG dùng phép chia lấy dư (%) chậm chạp. Thay vào đó, nó bắt buộc dung lượng mảng LUÔN LUÔN là lũy thừa của 2 (16, 32, 64...), cho phép dùng phép toán AND bit siêu tốc: index = (n - 1) & hash. Trước khi gán mặt nạ, HashMap áp dụng hàm phân tán: hash = (h = key.hashCode()) ^ (h >>> 16), lấy 16 bit cao XOR với 16 bit thấp để các bit cao cũng tham gia vào việc tính index, chống gom cụm ô nhớ khi bảng băm còn nhỏ.'
      },
      trapWarning: {
        en: 'If you initialize new HashMap<>(10), HashMap does NOT create a table of length 10! It automatically rounds up to the next power of two, which is 16.',
        vi: 'Nếu khởi tạo new HashMap<>(10), HashMap KHÔNG tạo mảng 10 phần tử! Nó tự động làm tròn lên lũy thừa của 2 gần nhất là 16.'
      },
      proTip: {
        en: 'Bitwise (n - 1) & hash executes in 1 CPU clock cycle (~0.3ns), whereas integer division / modulo takes ~15-20 CPU cycles on modern x86 processors.',
        vi: 'Phép AND bit (n - 1) & hash chạy trong 1 chu kỳ xung nhịp CPU (~0.3ns), nhanh hơn 15 đến 20 lần so với phép chia lấy dư modulo phần cứng.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What is the Red-Black Treeification threshold in HashMap, and why is the threshold set to 8?',
        vi: 'Ngưỡng chuyển đổi Cây đỏ đen (Treeification) trong HashMap là bao nhiêu và tại sao lại chọn con số 8?'
      },
      answer: {
        en: 'In Java 8+, when a single bucket\'s collision chain reaches TREEIFY_THRESHOLD = 8 AND the total table capacity is at least MIN_TREEIFY_CAPACITY = 64, HashMap transforms the singly-linked list into a balanced Red-Black Tree (TreeNode). This caps worst-case search latency at O(log N) instead of O(N), mitigating HashDoS vulnerability attacks. Why 8? Under standard Poisson distribution of hash codes, the mathematical probability of 8 random elements colliding into the exact same bucket is less than one in ten million (0.00000006)! Reaching 8 elements almost certainly indicates an attack or a catastrophically flawed hashCode() implementation.',
        vi: 'Từ Java 8, khi một chuỗi va chạm trong 1 bucket đạt ngưỡng TREEIFY_THRESHOLD = 8 VÀ tổng dung lượng bảng đạt ít nhất 64, HashMap sẽ chuyển đổi danh sách liên kết thành Cây đỏ đen cân bằng (TreeNode). Việc này giới hạn thời gian tìm kiếm tệ nhất ở mức O(log N) thay vì O(N), chống lại các cuộc tấn công từ chối dịch vụ HashDoS. Lý do chọn số 8: Theo phân phối Poisson lý thuyết, xác suất để 8 phần tử ngẫu nhiên cùng rơi vào 1 bucket là dưới 1 phần 10 triệu (0.00000006)! Đạt tới 8 phần tử gần như chắc chắn là dấu hiệu của việc bị tấn công mã băm hoặc hàm hashCode() bị lỗi nghiêm trọng.'
      },
      trapWarning: {
        en: 'TreeNodes consume more than TWICE the memory of regular Node objects (Node has next; TreeNode has parent, left, right, prev, and red/black boolean). If the tree size shrinks back down to UNTREEIFY_THRESHOLD = 6, HashMap converts it back to a linked list.',
        vi: 'TreeNode tốn bộ nhớ GẤP ĐÔI so với Node thường (Node chỉ có con trỏ next; TreeNode có parent, left, right, prev và cờ boolean màu). Nếu số phần tử trong cây giảm xuống ngưỡng 6, HashMap sẽ tự chuyển ngược lại thành danh sách liên kết để tiết kiệm RAM.'
      },
      proTip: {
        en: 'If total table capacity is LESS than 64, HashMap will resize (double) the table rather than treeifying the bucket, because resizing often disperses the collision chain across the doubled capacity.',
        vi: 'Nếu dung lượng bảng nhỏ hơn 64, HashMap sẽ chọn giải pháp resize (nhân đôi mảng) thay vì biến thành cây, vì nhân đôi dung lượng thường sẽ tự động giải tỏa chuỗi va chạm sang các bucket mới.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'Why did concurrent put() in Java 7 HashMap cause infinite CPU 100% loops, and how was it fixed in Java 8?',
        vi: 'Tại sao việc gọi put() đồng thời trong Java 7 HashMap lại gây ra vòng lặp vô tận ăn 100% CPU, và Java 8 đã khắc phục điều này như thế nào?'
      },
      answer: {
        en: 'In Java 7, when HashMap resized its table, the transfer() method used HEAD INSERTION: elements were popped from the old bucket and prepended to the new bucket, which REVERSED the linked list order. If Thread A and Thread B resized the map concurrently, Thread A could be suspended midway while holding references e and e.next. Thread B then completed the transfer, reversing the pointers (A -> B became B -> A). When Thread A resumed, it linked A.next to B, and B.next was already pointing back to A! A circular linked list was created. Any subsequent get(key) entering that bucket entered an infinite loop, pinning the CPU core at 100% forever. Java 8 completely fixed this by switching to TAIL INSERTION (maintaining original order) and splitting nodes into loHead/loTail and hiHead/hiTail based on the (e.hash & oldCap) bit, completely eliminating circular pointer loops.',
        vi: 'Trong Java 7, khi HashMap mở rộng dung lượng mảng (resize), hàm transfer() chèn phần tử vào ĐẦU danh sách mới (Head Insertion), làm ĐẢO NGƯỢC thứ tự của danh sách liên kết. Nếu Luồng 1 và Luồng 2 cùng resize đồng thời, Luồng 1 bị ngắt giữa chừng khi đang cầm con trỏ A và B. Luồng 2 hoàn thành trước, đảo ngược con trỏ thành B -> A. Khi Luồng 1 chạy tiếp, nó gán A.next = B, tạo thành vòng lặp tròn A -> B -> A! Bất kỳ lệnh get() nào sau đó rơi vào bucket này sẽ chạy vào vòng lặp vô tận, đốt 100% CPU vĩnh viễn. Java 8 đã khắc phục triệt để bằng cách chuyển sang chèn vào ĐUÔI (Tail Insertion, giữ nguyên thứ tự) và chia tách nút thành 2 nhóm cao/thấp dựa trên bit (e.hash & oldCap), triệt tiêu hoàn toàn nguy cơ vòng lặp con trỏ tròn.'
      },
      trapWarning: {
        en: 'Even though Java 8 fixed the infinite CPU loop, HashMap is STILL NOT thread-safe! Concurrent mutations without synchronization can cause lost updates, corrupted sizes, and broken tree structures. Always use ConcurrentHashMap in multi-threaded contexts.',
        vi: 'Dù Java 8 đã triệt tiêu lỗi vòng lặp 100% CPU, HashMap VẪN HOÀN TOÀN KHÔNG an toàn đa luồng! Ghi đồng thời vẫn gây mất dữ liệu, sai lệch biến size và hỏng cấu trúc cây. Luôn dùng ConcurrentHashMap trong môi trường đa luồng.'
      },
      proTip: {
        en: 'In Java 8 resize, no rehashing is needed! Nodes either stay at the same index (if hash & oldCap == 0) or move to (original_index + oldCap) if the bit is 1. This bitwise check runs in 0.3ns.',
        vi: 'Trong Java 8 resize, không cần tính lại hash! Phần tử giữ nguyên vị trí cũ nếu (hash & oldCap == 0), hoặc chuyển sang vị trí (vị trí cũ + oldCap) nếu bit là 1. Thao tác kiểm tra bit này chạy chỉ tốn 0.3ns.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'HashDoS Collision Attack & Single-Bucket Degradation in Public API Gateway',
      vi: 'Cuộc Tấn Công Băm HashDoS & Thảm Họa Suy Biến Bucket Thành O(N) Trong API Gateway'
    },
    businessContext: {
      en: 'A public banking API Gateway parses incoming HTTP JSON/Form payloads into memory maps to evaluate routing and header signature security.',
      vi: 'Cổng API Gateway công khai của ngân hàng phân tích các gói tin HTTP JSON/Form vào bảng băm trong bộ nhớ để định tuyến và kiểm tra chữ ký bảo mật.'
    },
    problemDescription: {
      en: 'A security penetration team generated 10,000 malicious parameter keys mathematically engineered to produce identical 32-bit hash codes under Java polynomial rolling hash algorithm (e.g. "AaAa", "BBBB", "BBAa"). Because the gateway stored headers using a custom HeaderKey class that did NOT implement Comparable<HeaderKey>, Java 8 HashMap could NOT treeify the bucket into a Red-Black Tree! All 10,000 entries degenerated into an O(N) linked list. Inserting 10,000 colliding keys required (10000 * 9999) / 2 = 50,000,000 string comparisons per HTTP request. The API parsing time exploded from 0.8ms to 4,200ms of pure 100% CPU spin. A trivial botnet sending 8 concurrent requests paralyzed the entire 32-core production cluster.',
      vi: 'Đội kiểm thử bảo mật (Pentest) đã sinh ra 10,000 tham số độc hại được tính toán để có cùng mã băm 32-bit giống hệt nhau (như "AaAa", "BBBB", "BBAa"). Do API Gateway lưu header bằng một lớp tùy biến HeaderKey KHÔNG cài đặt interface Comparable, HashMap trong Java 8 KHÔNG THỂ chuyển đổi bucket thành Cây đỏ đen! Toàn bộ 10,000 phần tử bị suy biến thành danh sách liên kết O(N). Thao tác nạp 10,000 khóa va chạm tốn tới 50,000,000 phép so sánh chuỗi cho mỗi request. Thời gian phân tích gói tin vọt từ 0.8ms lên 4,200ms ăn trọn 100% CPU. Một mạng botnet chỉ cần gửi 8 request đồng thời đã làm tê liệt toàn bộ cụm máy chủ 32 lõi CPU.'
    },
    whyNaiveFails: {
      en: 'Increasing CPU allocations or thread pool limits compounded the failure: more threads spent 100% of their execution time executing O(N) equals() comparisons in the exact same degenerate linked list bucket, hastening complete cluster outage.',
      vi: 'Càng tăng thêm CPU hay tăng số luồng worker càng khiến thảm họa lan rộng: nhiều luồng hơn cùng lao vào thực hiện các phép so sánh equals() O(N) trong cùng một chuỗi liên kết suy biến, đẩy toàn cụm máy chủ vào tình trạng sập hoàn toàn.'
    },
    coreSolution: {
      en: '1. Enforce that custom Map key records/classes strictly implement java.lang.Comparable<T>. When bucket collisions exceed TREEIFY_THRESHOLD (8), Java 8+ HashMap uses the tie-break comparison to convert the bucket into a balanced Red-Black Tree, capping lookup latency at O(log N) instead of O(N). 2. Pre-size maps via new HashMap<>((int)(expected / 0.75f) + 1) to eliminate array resizing stalls. 3. Enforce strict web server limits on parameter counts (server.tomcat.max-parameter-count=500).',
      vi: '1. Bắt buộc các lớp làm Khóa (Key) trong Map phải cài đặt interface java.lang.Comparable<T>. Khi va chạm vượt quá ngưỡng 8 phần tử, HashMap của Java 8+ sẽ dựa vào thứ tự so sánh để chuyển đổi bucket thành Cây đỏ đen cân bằng, giới hạn độ trễ tìm kiếm ở mức O(log N) thay vì O(N). 2. Khởi tạo kích thước Map chuẩn xác new HashMap<>((int)(expected / 0.75f) + 1) để triệt tiêu việc resize mảng. 3. Cấu hình giới hạn số lượng tham số tối đa ở tầng Web Server (server.tomcat.max-parameter-count=500).'
    },
    productionCode: `// Production Safe HashDoS Defense: Comparable Key & Pre-Sized Map
package com.gateway.security;

import java.util.HashMap;
import java.util.Map;

// 1. MUST implement Comparable to enable Java 8+ Red-Black Treeification!
public record SecurityHeaderKey(String name) implements Comparable<SecurityHeaderKey> {
    
    @Override
    public int compareTo(SecurityHeaderKey other) {
        // Tie-breaker allows HashMap to balance colliding keys into a Red-Black Tree
        return this.name.compareTo(other.name);
    }
}

public class SecurePayloadParser {

    public static Map<SecurityHeaderKey, String> parseHeaders(Map<String, String> rawHeaders) {
        int expectedSize = rawHeaders.size();
        
        // 2. Pre-size capacity: (size / 0.75f) + 1 guarantees ZERO resize operations!
        int initialCapacity = (int) (expectedSize / 0.75f) + 1;
        Map<SecurityHeaderKey, String> map = new HashMap<>(initialCapacity);

        for (Map.Entry<String, String> entry : rawHeaders.entrySet()) {
            // Even under massive hash collision attacks, Comparable guarantees O(log N) Red-Black Tree!
            map.put(new SecurityHeaderKey(entry.getKey()), entry.getValue());
        }

        return map;
    }
}`,
    architectureImpact: {
      en: 'Request parsing latency under 10,000-key collision attack collapsed from 4,200ms down to 0.45ms (9,300x faster); CPU spin dropped from 100% to 2.1%; HashDoS vulnerability neutralized 100%.',
      vi: 'Thời gian phân tích request khi bị tấn công va chạm 10,000 khóa giảm từ 4,200ms xuống chỉ còn 0.45ms (nhanh gấp 9,300 lần); Mức tiêu thụ CPU giảm từ 100% xuống còn 2.1%; Triệt tiêu 100% lỗ hổng tấn công từ chối dịch vụ HashDoS.'
    }
  }
};
