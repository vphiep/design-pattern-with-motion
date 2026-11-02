import type { JavaCoreTopic } from '../types';

export const stringImmutabilityPoolTopic: JavaCoreTopic = {
  id: 'string-immutability-pool',
  category: 'java-fundamentals',
  name: 'String Immutability & String Constant Pool',
  tagline: {
    en: 'Compact Strings byte[] layout, the native StringTable hash map in Heap, string concatenation bytecode, and intern() mechanics.',
    vi: 'Bố cục byte[] của Compact Strings, bảng băm StringTable trong Heap, bytecode nối chuỗi và cơ chế intern().'
  },
  difficulty: 1,
  level: 'basic',
  order: 5,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'Strings represent over 35% of all memory allocations in enterprise Java microservices. If strings were mutable, passing a database connection string or security token to an untrusted method could allow malicious tampering, while concurrently sharing strings across threads would require expensive locking, crippling web server concurrency.',
      vi: 'Chuỗi String chiếm hơn 35% tổng dung lượng bộ nhớ trong các microservice Java. Nếu String có thể thay đổi (mutable), việc truyền chuỗi kết nối cơ sở dữ liệu hay token bảo mật vào hàm bên ngoài sẽ mở ra lỗ hổng giả mạo dữ liệu nghiêm trọng, đồng thời việc chia sẻ chuỗi giữa các luồng sẽ đòi hỏi khóa mutex đắt đỏ làm tê liệt máy chủ.'
    },
    hardwareConstraint: {
      en: 'Strings historically stored char[] arrays requiring 2 bytes (16 bits) per character via UTF-16, even for pure ASCII text. In Java 9+, HotSpot introduced Compact Strings (JEP 254), replacing char[] with byte[] and an 8-bit coder flag (LATIN1 = 0, UTF16 = 1), instantly reducing String memory consumption by 50% across CPU cache lines.',
      vi: 'String trong lịch sử dùng mảng char[] tốn 2 byte (16 bit) cho mỗi ký tự UTF-16 dù chuỗi chỉ chứa ký tự ASCII chuẩn. Từ Java 9+, HotSpot áp dụng cơ chế Compact Strings (JEP 254), thay char[] bằng mảng byte[] kèm 1 cờ coder (LATIN1 = 0, UTF16 = 1), lập tức cắt giảm 50% dung lượng RAM của chuỗi trên các dòng cache CPU.'
    },
    fundamentalSolution: {
      en: 'Java enforces String Immutability: the class is marked final and its underlying byte[] value is private and final with no mutating methods. To optimize memory, the JVM maintains a String Constant Pool—a native C++ HashTable (StringTable) residing in the Java Heap. String literals are automatically pooled: identical literals reuse the exact same memory pointer.',
      vi: 'Java bảo đảm tính Bất biến của String: lớp được khóa final và mảng byte[] value là private final không có bất kỳ hàm sửa đổi nào. Để tối ưu RAM, JVM duy trì vùng nhớ String Constant Pool—thực chất là bảng băm C++ native (StringTable) nằm ngay trong Heap. Các hằng chuỗi (literals) tự động lưu vào Pool: các chuỗi giống nhau dùng chung duy nhất một con trỏ ô nhớ.'
    },
    math: {
      formula: 'String_Size = Mark_Word [8B] + Klass [4B] + byte[]_ref [4B] + hash [4B] + coder [1B] + Pad [3B] = 24 Bytes (Header) + byte[len]',
      description: {
        en: 'An empty String consumes 24 bytes for the String instance plus 16 bytes for the byte[] object header = 40 bytes minimum on 64-bit JVM.',
        vi: 'Một đối tượng String rỗng tốn 24 byte cho vỏ đối tượng cộng 16 byte cho mảng byte[] = tối thiểu 40 byte RAM trên máy ảo 64-bit.'
      },
      timeComplexity: 'O(1) StringTable lookup via hashCode; O(N) equals character-by-character scan',
      spaceComplexity: 'N bytes for Latin-1 characters; 2N bytes for UTF-16 characters',
      memoryOverheadFormula: 'String Pooling Deduplication Savings = (Duplicates - 1) * (24B + byte[len])'
    }
  },

  memoryLayout: {
    title: {
      en: 'Physical Layout: String Literal in Constant Pool vs new String() on Heap',
      vi: 'Bố Cục Ô Nhớ: String Literal trong Pool vs new String() trên Heap'
    },
    description: {
      en: 'String literals are indexed inside the native StringTable in the Heap. The new keyword forces a duplicate String shell referencing the same or distinct byte array.',
      vi: 'Hằng chuỗi literal được quản lý trong bảng băm StringTable thuộc Heap. Từ khóa new ép buộc khởi tạo một vỏ đối tượng String riêng biệt trên Heap.'
    },
    asciiDiagram: `
+-----------------------------------------------------------------------------------------+
|                                    JVM HEAP MEMORY                                      |
|                                                                                         |
|   +----------------------------------------------------------------------------------+  |
|   |                         STRING CONSTANT POOL (StringTable)                       |  |
|   |  Bucket [42] -> String Object (0xPool01)                                         |  |
|   |                 |-- Mark Word (8B): 0x0000000000000001 (Unlocked)                |  |
|   |                 |-- Klass (4B): String.class                                     |  |
|   |                 |-- hash (4B): 0x0283A410                                        |  |
|   |                 |-- coder (1B): 0 (LATIN-1)                                      |  |
|   |                 |-- value pointer (4B) ----> byte[] [ 'J', 'a', 'v', 'a' ] (4B)  |  |
|   +----------------------------------------------------------------------------------+  |
|           ^                                                                             |
|           | s1 points directly to Pool                                                  |
|           |                                                                             |
|   [Stack: s1] = 0xPool01                                                                |
|   [Stack: s2] = 0xHeap99  (s1 == s2 is FALSE! s1.equals(s2) is TRUE!)                   |
|           |                                                                             |
|           v                                                                             |
|   +----------------------------------------------------------------------------------+  |
|   |                      NEW OBJECT ON HEAP (new String("Java"))                     |  |
|   |  Address: 0xHeap99                                                               |  |
|   |  |-- Mark Word (8B) + Klass (4B)                                                 |  |
|   |  |-- value pointer (4B) ----> Shares byte[] [ 'J', 'a', 'v', 'a' ]               |  |
|   |  |-- Calling s2.intern() returns 0xPool01!                                       |  |
|   +----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'coder flag', size: '1 Byte', description: { en: '0 for Latin-1 (1B/char), 1 for UTF-16 (2B/char).', vi: '0 cho Latin-1 (1 byte/ký tự), 1 cho UTF-16 (2 byte/ký tự).' } },
      { name: 'hash cache', size: '4 Bytes', description: { en: 'Cached int hashCode; zero until computed lazily.', vi: 'Giá trị hashCode được cache lại sau lần tính đầu tiên.' } },
      { name: 'value reference', size: '4 Bytes', description: { en: 'Compressed OOP reference to contiguous byte[] payload.', vi: 'Con trỏ nén trỏ tới mảng byte[] chứa dữ liệu ký tự.' } },
      { name: 'StringTable Size', size: 'Native', description: { en: 'C++ HashTable with default 65,536 buckets in Heap.', vi: 'Bảng băm C++ native mặc định 65,536 xô băm trong Heap.' } }
    ]
  },

  steps: [
    {
      id: 'literal-pool',
      title: { en: '1. String Literal Pool Registration', vi: '1. Đăng ký hằng chuỗi vào String Constant Pool' },
      phase: 'POOL_REGISTRATION',
      description: {
        en: 'Executing String s1 = "Java" triggers ldc #2 bytecode opcode. The JVM inspects the StringTable. Because "Java" is not yet present, it instantiates the string in Heap and inserts its reference into the StringTable at 0xPool01.',
        vi: 'Thực thi String s1 = "Java" kích hoạt opcode ldc #2. JVM kiểm tra StringTable. Do chuỗi chưa tồn tại, JVM tạo chuỗi trong Heap và đưa con trỏ vào StringTable tại địa chỉ 0xPool01.'
      },
      jvmRuntimeBehavior: {
        en: 'ldc bytecode loads pooled constant; second literal String s_dup = "Java" reuses 0xPool01 with zero allocation.',
        vi: 'Bytecode ldc nạp hằng số từ Pool; khai báo thứ hai String s_dup = "Java" dùng lại 0xPool01 mà không tốn byte nào.'
      },
      javaCodeLineMatch: 'String s1 = "Java";'
    },
    {
      id: 'new-heap-alloc',
      title: { en: '2. Explicit Heap Allocation via new String()', vi: '2. Cấp phát đối tượng mới trên Heap qua new String()' },
      phase: 'HEAP_DUPLICATION',
      description: {
        en: 'Executing String s2 = new String("Java") bypasses the Pool for the wrapper object. It allocates a distinct String shell at 0xHeap99 in the Young Gen Eden space. Therefore, s1 == s2 is FALSE (different memory addresses), but s1.equals(s2) is TRUE.',
        vi: 'Thực thi String s2 = new String("Java") tạo một vỏ đối tượng hoàn toàn mới tại 0xHeap99 trong vùng Eden. Do đó s1 == s2 là FALSE (khác địa chỉ ô nhớ), nhưng s1.equals(s2) là TRUE.'
      },
      jvmRuntimeBehavior: {
        en: 'TLAB allocation for duplicate String container. Memory wasted on redundant header overhead.',
        vi: 'Cấp phát TLAB cho vỏ String trùng lặp. Lãng phí 24 byte RAM cho phần header thừa thãi.'
      },
      javaCodeLineMatch: 'String s2 = new String("Java");'
    },
    {
      id: 'intern-dedup',
      title: { en: '3. String.intern() Native Deduplication', vi: '3. Khử trùng lặp chuỗi với String.intern()' },
      phase: 'INTERN_LOOKUP',
      description: {
        en: 'Executing s2.intern() executes a native JVM call that looks up "Java" in the StringTable. Since it finds 0xPool01, it returns the pooled pointer. Thus, s1 == s2.intern() evaluates to TRUE!',
        vi: 'Gọi s2.intern() gọi hàm native tra cứu "Java" trong StringTable. Vì tìm thấy con trỏ 0xPool01 đã có sẵn, hàm trả về con trỏ Pool. Phép so sánh s1 == s2.intern() trả về TRUE!'
      },
      jvmRuntimeBehavior: {
        en: 'Native StringTable::intern C++ call; returns canonized pooled reference address.',
        vi: 'Gọi C++ native StringTable::intern; trả về địa chỉ tham chiếu chuẩn hóa trong Pool.'
      },
      javaCodeLineMatch: 'String s3 = s2.intern();'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'HotSpot G1GC String Deduplication',
      implementationName: 'G1 String Deduplication (-XX:+UseStringDeduplication)',
      keyMechanism: {
        en: 'During background GC evacuation cycles, G1 inspects long-lived String instances. If two distinct String objects contain identical byte[] contents, G1 modifies one pointer to share the other byte[] array, freeing the duplicate array from RAM automatically.',
        vi: 'Trong chu kỳ GC, G1 quét các chuỗi thọ lâu. Nếu hai đối tượng String riêng biệt có cùng nội dung byte[], G1 sửa con trỏ để chúng dùng chung một mảng byte[], giải phóng mảng thừa khỏi RAM hoàn toàn tự động.'
      },
      defaultFlags: '-XX:+UseStringDeduplication -XX:StringDeduplicationAgeThreshold=3',
      architectureNote: {
        en: 'Saves 15-25% total Heap memory in microservices without requiring any manual intern() calls.',
        vi: 'Tiết kiệm 15-25% tổng dung lượng Heap mà lập trình viên không cần gọi intern() thủ công.'
      }
    },
    {
      jvmEngine: 'HotSpot StringTable Tuner',
      implementationName: 'Native StringTable Hash Capacity',
      keyMechanism: {
        en: 'Configures the number of hash buckets in the native C++ StringTable. The default is 65,536. If an application interns millions of unique strings, bucket chains become long, degrading intern() lookup from O(1) to O(N).',
        vi: 'Cấu hình số lượng xô băm trong bảng StringTable native. Mặc định là 65,536 xô. Nếu ứng dụng intern hàng triệu chuỗi, chuỗi va chạm sẽ kéo dài làm tra cứu intern() tụt từ O(1) xuống O(N).'
      },
      defaultFlags: '-XX:StringTableSize=1000003',
      architectureNote: {
        en: 'Set to a large prime number when interning massive datasets to eliminate Hash collision spikes.',
        vi: 'Đặt thành số nguyên tố lớn khi cần intern tập dữ liệu khổng lồ để triệt tiêu va chạm hash.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      {
        en: 'Thread-safety by design: Immutable Strings can be shared across thousands of virtual threads without synchronized locks.',
        vi: 'An toàn đa luồng tuyệt đối: Chuỗi bất biến được chia sẻ tự do giữa hàng ngàn virtual threads mà không cần khóa đồng bộ.'
      },
      {
        en: 'String pooling eliminates memory redundancy for repeated values (e.g. enum names, country codes, status strings).',
        vi: 'Cơ chế String Pooling xóa bỏ trùng lặp dữ liệu cho các giá trị lặp lại (mã quốc gia, trạng thái, tên bảng).'
      }
    ],
    cons: [
      {
        en: 'String concatenation in loops using the + operator creates intermediate String instances unless StringBuilder is used.',
        vi: 'Nối chuỗi trong vòng lặp bằng toán tử + tạo ra vô số đối tượng trung gian nếu không dùng StringBuilder.'
      },
      {
        en: 'Excessive calls to String.intern() with dynamically generated strings (e.g. UUIDs) bloats the StringTable, increasing GC pause times.',
        vi: 'Lạm dụng String.intern() cho các chuỗi ngẫu nhiên (UUID) sẽ làm tràn StringTable, kéo dài thời gian dừng GC.'
      }
    ],
    memoryFootprint: {
      en: 'Compact Strings cut ASCII character storage from 2B to 1B per character. Always prefer StringBuilder with initial capacity for string construction.',
      vi: 'Compact Strings giảm dung lượng ký tự ASCII từ 2 byte xuống 1 byte. Luôn khởi tạo StringBuilder với kích thước dự đoán trước.'
    },
    jvmSpecificationGuarantee: {
      en: 'JLS §3.10.5: All string literals and constant expressions in classes are evaluated at compile time and canonized into the String Constant Pool.',
      vi: 'JLS §3.10.5: Tất cả các hằng chuỗi và biểu thức hằng đều được tối ưu tại compile-time và chuẩn hóa vào String Constant Pool.'
    }
  },

  javaCode: `package com.engine.fundamentals;

/**
 * Demonstrates String Constant Pool mechanics, identity equality (==)
 * vs logical equality (.equals), and the performance of String.intern().
 */
public class StringPoolDemo {

    public static void main(String[] args) {
        // Step 1: String Literal - registered in String Constant Pool
        String s1 = "Java";
        String s1Dup = "Java"; // Reuses exact same pooled reference

        // Step 2: Explicit Heap allocation via new keyword
        String s2 = new String("Java");

        System.out.println("s1 == s1Dup: " + (s1 == s1Dup));       // TRUE: Same pointer in Pool (0xPool01)
        System.out.println("s1 == s2:    " + (s1 == s2));          // FALSE: 0xPool01 != 0xHeap99
        System.out.println("s1.equals(s2): " + s1.equals(s2));     // TRUE: Character-by-character identical

        // Step 3: String.intern() retrieves canonized pooled pointer
        String s3 = s2.intern();
        System.out.println("s1 == s3:    " + (s1 == s3));          // TRUE: 0xPool01 == 0xPool01!

        // Performance Comparison: Concatenation vs StringBuilder
        demonstrateConcatPerformance();
    }

    private static void demonstrateConcatPerformance() {
        // Anti-Pattern: N^2 allocations in loops
        // String s = "";
        // for (int i = 0; i < 10000; i++) s += i; // 10,000 intermediate objects!

        // Best Practice: O(N) single contiguous array resizing
        StringBuilder sb = new StringBuilder(10000 * 4);
        for (int i = 0; i < 10000; i++) {
            sb.append(i);
        }
        String result = sb.toString();
        System.out.println("Constructed string length: " + result.length());
    }
}`,

  jvmFlagsCode: `# HotSpot JVM Options for String Optimization
# 1. Enable G1GC automatic String Deduplication in Heap
-XX:+UseG1GC
-XX:+UseStringDeduplication
-XX:StringDeduplicationAgeThreshold=3

# 2. Tune String Constant Pool native hash bucket capacity
-XX:StringTableSize=1000003

# 3. Print StringTable statistics at JVM shutdown
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintStringTableStatistics`,

  bytecodeInspection: `// Disassembled bytecode: javap -c StringPoolDemo
public static void main(java.lang.String[]);
  Code:
     0: ldc           #7                  // String "Java" loaded from Constant Pool
     2: astore_1                          // Store into s1 (0xPool01)
     3: ldc           #7                  // Reuses String "Java" from Constant Pool
     5: astore_2                          // Store into s1Dup (0xPool01)
     6: new           #9                  // class java/lang/String (New Heap object)
     9: dup
    10: ldc           #7                  // Load "Java"
    12: invokespecial #11                 // Method java/lang/String."<init>":(Ljava/lang/String;)V
    15: astore_3                          // Store into s2 (0xHeap99)
    16: aload_3
    17: invokevirtual #14                 // Method java/lang/String.intern:()Ljava/lang/String;
    20: astore        4                   // Store into s3 (Returns 0xPool01)
    22: return`,

  detailedTheory: {
    overview: {
      en: 'String immutability is the cornerstone of Java security, caching, and multi-threaded concurrency. The String Constant Pool exploits this immutability to deduplicate identical string literals across the entire JVM runtime, preventing massive RAM bloat.',
      vi: 'Tính bất biến của String là nền tảng cốt lõi của bảo mật, bộ nhớ đệm và đa luồng trong Java. Vùng nhớ String Constant Pool khai thác tính bất biến này để loại bỏ các chuỗi trùng lặp trên toàn bộ máy ảo JVM, ngăn chặn hiện tượng phình to RAM.'
    },
    deepDiveParagraphs: [
      {
        en: '1. Why String is Made Immutable by Design: If String were mutable, security checks could easily be circumvented. For example, when a method verifies a filename "safe.txt" and then opens it, another thread could mutate the character buffer to "/etc/shadow" between verification and access (Time-of-Check to Time-of-Use race condition). Furthermore, because String is immutable, its hashCode() can be computed once lazily and cached permanently, making HashMap lookup blazing fast.',
        vi: '1. Tại sao String bắt buộc phải Bất biến: Nếu String có thể thay đổi, các cơ chế kiểm tra bảo mật sẽ bị qua mặt dễ dàng. Ví dụ: khi một hàm kiểm tra tên file "safe.txt" an toàn rồi mới mở, một luồng khác có thể lập tức sửa mảng ký tự thành "/etc/shadow" ngay giữa thời điểm kiểm tra và truy cập (lỗ hổng TOCTOU). Thêm vào đó, vì String bất biến, mã băm hashCode() chỉ cần tính một lần duy nhất rồi cache lại vĩnh viễn, giúp việc tra cứu trong HashMap đạt tốc độ tối đa.'
      },
      {
        en: '2. Compact Strings Architecture (Java 9+): Prior to Java 9, every String allocated a char[] array where each character consumed 16 bits (2 bytes). Empirical analysis by Oracle showed that 75% of string data in enterprise heaps contained only ASCII characters (values < 128), meaning the upper 8 bits of every character were always zero! Compact Strings stores characters in a byte[] array. If all characters are Latin-1, each character occupies only 1 byte (coder = 0). If a character exceeds 255 (e.g. Vietnamese Unicode with accents), the array expands to 2 bytes per char (coder = 1).',
        vi: '2. Kiến trúc Compact Strings (Java 9+): Trước Java 9, mỗi String lưu mảng char[] tốn 16 bit (2 byte)/ký tự. Thống kê của Oracle chỉ ra rằng 75% chuỗi trên Heap thực tế chỉ chứa ký tự ASCII cơ bản (< 128), đồng nghĩa với 8 bit cao của mỗi ký tự luôn là số 0 lãng phí! Compact Strings thay thế bằng mảng byte[]. Nếu chuỗi hoàn toàn là Latin-1, mỗi ký tự chỉ tốn 1 byte (coder = 0). Nếu xuất hiện ký tự vượt quá 255 (như tiếng Việt có dấu), mảng tự động nâng lên 2 byte/ký tự (coder = 1).'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'String Concatenation in Loops (+ operator): Prior to Java 9, writing string += item in a loop created a new StringBuilder and a new String on every iteration, leading to O(N^2) allocations and triggering catastrophic Minor GC storms. Always use an explicitly sized StringBuilder for loops.',
        vi: 'Nối chuỗi trong vòng lặp bằng dấu +: Toán tử string += item trong vòng lặp tạo ra một StringBuilder và một đối tượng String mới ở mỗi lần lặp, biến thuật toán thành O(N^2) cấp phát và gây bão Minor GC. Luôn sử dụng StringBuilder với dung lượng dự đoán trước.'
      },
      {
        en: 'String.intern() Memory Leak on Dynamic Keys: Interning untrusted dynamic inputs (such as user-submitted emails, UUIDs, or random search terms) permanently inserts entries into the native StringTable. Because StringTable is an in-memory hash table, unbounded interning can exhaust Native / Heap memory and severely degrade GC pause times.',
        vi: 'Tràn bộ nhớ do String.intern() các khóa động: Gọi intern() trên các chuỗi ngẫu nhiên (UUID, email người dùng, từ khóa tìm kiếm) sẽ chèn vĩnh viễn các chuỗi này vào bảng StringTable. Do StringTable là bảng băm trong bộ nhớ, việc nạp không giới hạn sẽ làm cạn kiệt RAM và kéo dài thời gian gián đoạn GC.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Enterprise JSON Ingestion Duplicate String Heap Bloat & G1GC String Deduplication',
      vi: 'Tràn Bộ Nhớ Heap Do Trùng Lặp Chuỗi JSON & Cơ Chế Khử Trùng Lặp G1GC String Deduplication'
    },
    businessContext: {
      en: 'A cloud observability and IoT log ingestion platform consumes 50,000 JSON telemetry events per second from Kafka topics into a 16GB JVM worker node.',
      vi: 'Nền tảng giám sát đám mây và IoT tiếp nhận 50,000 sự kiện JSON mỗi giây từ các topic Kafka vào cụm xử lý Java 16GB RAM.'
    },
    problemDescription: {
      en: 'Each incoming JSON payload contained repeated categorical strings: "sensor_status": "NORMAL", "device_model": "THERMO_V2", "datacenter_region": "us-east-1". After 6 hours of continuous operation, Heap memory usage soared to 14.5GB (91% saturation), triggering non-stop G1GC concurrent marking cycles and 350ms Stop-The-World latency pauses. A heap dump analyzed with Eclipse Memory Analyzer (MAT) proved that 68% of the entire Heap was consumed by 72,000,000 duplicate String instances storing the exact same 15 categorical values over and over again.',
      vi: 'Mỗi gói tin JSON gửi lên đều lặp đi lặp lại các chuỗi phân loại: "sensor_status": "NORMAL", "device_model": "THERMO_V2", "datacenter_region": "us-east-1". Sau 6 tiếng hoạt động, dung lượng Heap tăng vọt lên 14.5GB (chiếm 91% RAM), kích hoạt các chu kỳ quét dọn rác G1GC liên tục gây gián đoạn hệ thống tới 350ms. Phân tích Heap Dump qua công cụ Eclipse Memory Analyzer (MAT) chỉ ra rằng 68% dung lượng Heap bị chiếm dụng bởi 72,000,000 đối tượng String trùng lặp lưu đi lưu lại cùng một tập hợp 15 giá trị giống hệt nhau.'
    },
    whyNaiveFails: {
      en: 'Calling String.intern() on every parsed field caused the HotSpot native StringTable to expand to millions of entries. Because StringTable lookups require taking an internal JVM lock, concurrent threads encountered severe lock convoying, driving CPU to 100% and cutting ingestion throughput by 65%.',
      vi: 'Cách xử lý ngây thơ bằng cách gọi String.intern() trên mọi trường dữ liệu làm bảng băm StringTable nội bộ của JVM phình to hàng triệu phần tử. Việc tra cứu StringTable đòi hỏi khóa lock nội bộ của JVM, gây ra hiện tượng nghẽn khóa hàng loạt (lock convoying), đẩy CPU lên 100% và làm tụt 65% thông lượng xử lý gói tin.'
    },
    coreSolution: {
      en: '1. Enable native G1GC String Deduplication (-XX:+UseG1GC -XX:+UseStringDeduplication -XX:StringDeduplicationAgeThreshold=3). During background GC cycles, G1GC identifies strings with identical byte[] hashes and transparently modifies their internal byte[] references to point to a single canonical array, discarding the duplicate byte[] memory. 2. For the Jackson JSON parser, configure a bounded concurrent LRU string pool to deduplicate keys during tokenization with zero global JVM locking.',
      vi: '1. Bật tính năng tối ưu khử trùng lặp chuỗi của G1GC (-XX:+UseG1GC -XX:+UseStringDeduplication -XX:StringDeduplicationAgeThreshold=3). Trong các chu kỳ dọn rác nền, G1GC phát hiện các chuỗi có nội dung mảng byte[] giống nhau và tự động trỏ các đối tượng String về chung một mảng byte[] duy nhất, vứt bỏ toàn bộ mảng thừa. 2. Cấu hình thư viện Jackson JSON dùng bộ đệm LRU có giới hạn dung lượng để khử trùng chuỗi khóa ngay lúc parse mà không gây khóa JVM.'
    },
    productionCode: `// Production Bounded String Deduplicating JSON Deserializer
package com.observability.ingestion;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.util.InternCache;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class TelemetryParserConfig {

    // 1. Application-Level Bounded Cache for Categorical Values
    // Prevents unbounded memory leaks associated with native String.intern()
    public static class BoundedStringPool {
        private static final int MAX_ENTRIES = 4096;
        private final ConcurrentHashMap<String, String> pool = new ConcurrentHashMap<>(MAX_ENTRIES);

        public String deduplicate(String val) {
            if (val == null) return null;
            if (pool.size() >= MAX_ENTRIES) {
                return val; // Safety valve: fall back to heap string if pool saturates
            }
            return pool.computeIfAbsent(val, k -> k);
        }
    }

    // 2. Jackson ObjectMapper configured with bounded key interning
    @Bean
    public ObjectMapper telemetryObjectMapper() {
        JsonFactory factory = JsonFactory.builder()
            // Reuses Jackson's bounded thread-safe internal key cache
            .build();
        return new ObjectMapper(factory);
    }
}

/*
 * Production JVM Startup Flags for Automatic Background String Deduplication:
 * 
 * java -XX:+UseContainerSupport \\
 *      -XX:MaxRAMPercentage=75.0 \\
 *      -XX:+UseG1GC \\
 *      -XX:+UseStringDeduplication \\
 *      -XX:StringDeduplicationAgeThreshold=3 \\
 *      -XX:+PrintStringDeduplicationStatistics \\
 *      -jar telemetry-ingestion.jar
 */`,
    architectureImpact: {
      en: 'Total heap memory consumed by strings dropped from 14.5GB down to 4.8GB (67% memory footprint reduction); Stop-The-World GC pause durations dropped from 350ms to 18ms; Ingestion throughput reached 58,000 events/sec without thread contention.',
      vi: 'Dung lượng RAM Heap bị chiếm dụng bởi chuỗi giảm từ 14.5GB xuống còn 4.8GB (tiết kiệm 67% bộ nhớ); Thời gian dừng GC giảm từ 350ms xuống chỉ còn 18ms; Thông lượng tiếp nhận dữ liệu đạt 58,000 sự kiện/giây mà không hề bị nghẽn luồng.'
    }
  },

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'Why is String immutable in Java? Provide at least 3 architectural reasons.',
        vi: 'Tại sao String lại bất biến trong Java? Nêu ít nhất 3 lý do kiến trúc cốt lõi.'
      },
      answer: {
        en: '1. Security: Strings are ubiquitous in sensitive operations (network connections, database URLs, usernames, file paths). If String were mutable, a malicious thread could alter a filename after validation but before opening (TOCTOU security vulnerability). 2. String Constant Pool (Memory Optimization): If strings were mutable, changing one variable would corrupt all other variables pointing to the same pooled literal. 3. Thread-Safety: Immutable objects can be freely shared across concurrent threads without synchronization locks. 4. Caching HashCode: String calculates hashCode() once lazily and caches it, making Map lookups blazing fast.',
        vi: '1. Bảo mật: String được dùng khắp nơi cho thông tin nhạy cảm (kết nối mạng, URL cơ sở dữ liệu, mật khẩu, đường dẫn file). Nếu String có thể thay đổi, một luồng độc hại có thể sửa đổi đường dẫn file sau khi đã qua bước kiểm tra quyền (lỗ hổng TOCTOU). 2. Tối ưu bộ nhớ với String Pool: Nếu String thay đổi được, một biến sửa đổi sẽ làm sai lệch dữ liệu của tất cả các biến khác đang dùng chung hằng chuỗi đó trong Pool. 3. An toàn đa luồng: Đối tượng bất biến có thể chia sẻ tự do giữa hàng ngàn luồng mà không cần khóa đồng bộ. 4. Cache mã băm HashCode: String chỉ tính hashCode một lần duy nhất rồi lưu đệm lại, giúp việc tra cứu trong Map đạt tốc độ tối đa.'
      },
      trapWarning: {
        en: 'Do not forget that Reflection (prior to Java 9 module boundaries) could historically bypass private final fields and mutate byte[] arrays. Java 9+ strong encapsulation locks down reflection on internal JDK classes.',
        vi: 'Cần lưu ý cơ chế Reflection trước Java 9 từng có thể chọc vào mảng byte[] để sửa đổi String. Từ Java 9+, hệ thống module hóa Jigsaw đã khóa chặt việc dùng reflection can thiệp vào các lớp lõi của JDK.'
      },
      proTip: {
        en: 'Explain why passwords should be stored in char[] instead of String: Strings remain in memory until GC and cannot be wiped, whereas char[] can be explicitly zeroed out (Arrays.fill(pwd, \'0\')) immediately after use to protect against Heap dump inspection.',
        vi: 'Giải thích lý do lưu mật khẩu bằng char[] thay vì String: String nằm lại trên RAM cho tới khi GC dọn và không thể xóa trắng được, trong khi char[] có thể xóa sạch ngay sau khi dùng (Arrays.fill(pwd, \'0\')) để chống việc đọc trộm qua Heap Dump.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'How many objects are created by the statement: String s = new String("Java")?',
        vi: 'Câu lệnh String s = new String("Java") tạo ra bao nhiêu đối tượng trong bộ nhớ?'
      },
      answer: {
        en: 'It creates either 1 or 2 objects: 1. If "Java" literal is NOT yet in the String Constant Pool, the JVM creates the literal String instance in the String Constant Pool first. 2. The new keyword ALWAYS creates a second distinct String instance on the General Java Heap. If "Java" was already present in the pool from previous code, only ONE object is created (the new Heap instance).',
        vi: 'Câu lệnh tạo ra 1 hoặc 2 đối tượng tùy trường hợp: 1. Nếu chuỗi "Java" CHƯA có trong String Constant Pool, JVM sẽ tạo đối tượng hằng chuỗi này trong Pool trước. 2. Từ khóa new LUÔN LUÔN ép buộc tạo một đối tượng thứ hai độc lập trên vùng Heap thông thường. Nếu "Java" đã tồn tại sẵn trong Pool từ trước, thì chỉ có DUY NHẤT 1 đối tượng mới được tạo trên Heap.'
      },
      trapWarning: {
        en: 'Many candidates flatly say "2 objects". Always qualify with: "2 objects if the literal is not yet in the pool, or 1 object if the literal already exists in the String Constant Pool".',
        vi: 'Rất nhiều ứng viên trả lời cụt lủn là "2 đối tượng". Cần trả lời chuẩn xác: "2 đối tượng nếu literal chưa có trong Pool, hoặc 1 đối tượng nếu literal đã nằm sẵn trong Pool".'
      },
      proTip: {
        en: 'Mention that creating new String("...") is an anti-pattern in production code because it wastes 24 bytes of Heap memory duplicating an existing pooled string. Modern static analysis tools flag this as redundant allocation.',
        vi: 'Nhắc đến việc new String("...") là một anti-pattern trong thực tế vì gây lãng phí 24 byte RAM để nhân đôi một chuỗi đã có sẵn. Các công cụ kiểm thử tĩnh đều cảnh báo xóa bỏ từ khóa new thừa thãi này.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'Where does the String Constant Pool reside physically in Java 8+, and how does String.intern() work under the hood?',
        vi: 'Vùng nhớ String Constant Pool nằm ở đâu trong Java 8+, và cơ chế String.intern() hoạt động tầng sâu như thế nào?'
      },
      answer: {
        en: 'Prior to Java 7, the String Pool was located in PermGen (Permanent Generation), which had a fixed size and frequently crashed with OutOfMemoryError: PermGen space. In Java 7+, the String Constant Pool was moved directly into the Java HEAP, allowing it to be garbage collected alongside standard objects. Under the hood, the String Pool is implemented as a native C++ HashTable (StringTable) with fixed buckets (default 60,013 buckets in Java 8+). Calling s.intern() hashes the string, looks up the StringTable: if found, it returns the pooled reference; if not found, it adds s into the StringTable and returns it.',
        vi: 'Trước Java 7, String Pool nằm ở PermGen (Permanent Generation) có dung lượng cố định và rất dễ gây lỗi tràn bộ nhớ PermGen space. Từ Java 7 trở đi, String Pool được chuyển HẲN VÀO TRONG JAVA HEAP, cho phép bộ thu gom rác GC dọn dẹp như các đối tượng thông thường. Tầng sâu bên dưới, String Pool thực chất là một bảng băm C++ native (StringTable) với các bucket (mặc định 60,013 bucket). Khi gọi s.intern(), JVM tính hash chuỗi và tra cứu trong StringTable: nếu đã có, nó trả về địa chỉ đối tượng trong Pool; nếu chưa có, nó thêm chuỗi vào StringTable và trả về con trỏ đó.'
      },
      trapWarning: {
        en: 'Beware of excessive String.intern() calls on random data (e.g. UUIDs). It causes severe hash collisions in the native StringTable, increasing GC Stop-The-World pause times because GC must scan the entire StringTable during mark phases.',
        vi: 'Cảnh giác với việc lạm dụng String.intern() cho các chuỗi ngẫu nhiên (UUID). Điều này gây va chạm hash dữ dội trong bảng StringTable và kéo dài thời gian dừng Stop-The-World của GC vì GC phải quét toàn bộ bảng băm này.'
      },
      proTip: {
        en: 'Mention HotSpot\'s modern alternative: -XX:+UseStringDeduplication under G1GC. It transparently shares the underlying byte[] array between duplicate String instances in Old Gen without developers needing to call String.intern() manually!',
        vi: 'Nêu giải pháp hiện đại thay thế intern(): Dùng cờ -XX:+UseStringDeduplication của G1GC. Tính năng này tự động phát hiện và chia sẻ chung mảng byte[] giữa các String trùng nhau ở Old Gen mà lập trình viên không cần phải gọi intern() thủ công!'
      }
    }
  ]
};
