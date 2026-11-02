import type { JavaCoreTopic } from '../types';

export const garbageCollection: JavaCoreTopic = {
  id: 'garbage-collection',
  category: 'jvm-memory',
  name: 'Generational GC Internals: G1 & Low-Latency ZGC',
  tagline: {
    en: 'Memory reclamation mechanics: Weak generational hypothesis, Card Table write barriers, G1 regional evacuation, and ZGC colored pointers with self-healing load barriers.',
    vi: 'Bản chất cơ chế dọn rác: Giả thuyết phân thế, rào cản ghi Card Table, sơ tán vùng G1 và con trỏ đổi màu ZGC kèm load barrier tự chữa lành.'
  },
  difficulty: 3,
  level: 'advanced',
  order: 15,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      en: 'Scanning a 64GB or 256GB heap to find live objects while freezing all application threads (Stop-The-World) can take tens of seconds. In mission-critical financial trading, payment gateways, and real-time gaming, a 500ms pause triggers distributed network timeouts, broken leader leases, and client retry storms.',
      vi: 'Việc quét toàn bộ vùng nhớ Heap 64GB hoặc 256GB để tìm các đối tượng còn sống trong khi dừng toàn bộ ứng dụng (Stop-The-World) có thể mất hàng chục giây. Trong các hệ thống tài chính, cổng thanh toán hoặc game thời gian thực, một đợt dừng 500ms sẽ kích hoạt timeout mạng phân tán, mất quyền leader và tạo bão request thử lại làm sập toàn bộ cụm máy chủ.'
    },
    hardwareConstraint: {
      en: 'Modern multi-terabyte RAM systems have massive bandwidth, but CPU cache invalidation and page table walker stalls dominate during pointer traversals. Traditional GCs that compact memory while threads are paused scale linearly with heap size, rendering large heaps unusable without concurrent compaction.',
      vi: 'Các hệ thống máy chủ hiện đại có dung lượng RAM hàng Terabyte với băng thông cực lớn, nhưng việc xóa cache CPU và độ trễ duyệt bảng trang bộ nhớ sẽ chiếm ưu thế khi duyệt con trỏ. Các bộ GC truyền thống dọn dẹp bằng cách dừng luồng sẽ có thời gian dừng tăng tuyến tính theo dung lượng RAM, khiến các cấu hình Heap lớn trở nên bất khả thi nếu không có cơ chế nén bộ nhớ đồng thời.'
    },
    fundamentalSolution: {
      en: 'HotSpot solves this through two advanced architectures: 1) G1 GC: Partitions the heap into ~2,048 independent regions, using Card Table write barriers to track cross-generation pointers and incrementally evacuating the dirtiest regions. 2) Generational ZGC: Operates concurrently without Stop-The-World pauses using 64-bit Colored Pointers (Marked0, Marked1, Remapped) and self-healing Load Barriers that repair pointers during normal execution.',
      vi: 'HotSpot giải quyết vấn đề này qua 2 kiến trúc tiên tiến: 1) G1 GC: Chia nhỏ Heap thành ~2.048 vùng region độc lập, dùng rào cản ghi Card Table để theo dõi con trỏ liên thế hệ và sơ tán dần các region chứa nhiều rác nhất. 2) Generational ZGC: Dọn rác hoàn toàn đồng thời với ứng dụng mà không cần dừng luồng (STW < 1ms) nhờ con trỏ đổi màu 64-bit Colored Pointers và rào cản tải (Load Barrier) tự chữa lành con trỏ ngay khi luồng đang chạy.'
    },
    math: {
      formula: 'STW_ZGC < 1.0 ms (Independent of Heap Size: 16MB to 16TB)',
      description: {
        en: 'ZGC achieves sub-millisecond pauses because pause times depend strictly on root-set scanning (thread stack pointers), not on heap size or live object counts.',
        vi: 'ZGC đạt thời gian dừng dưới 1 mili giây vì thời gian dừng chỉ phụ thuộc vào việc quét con trỏ gốc trên stack luồng, hoàn toàn không phụ thuộc vào dung lượng Heap hay số lượng đối tượng.'
      },
      timeComplexity: 'O(Root_Set) sub-millisecond pause; O(Live_Objects) concurrent background evacuation',
      spaceComplexity: 'G1 Remembered Sets consume ~5% heap; ZGC requires ~20-30% memory headroom',
      memoryOverheadFormula: 'Card Table Size = Heap_Size / 512 Bytes'
    }
  },

  detailedTheory: {
    overview: {
      en: 'Garbage Collection is the crown jewel of the HotSpot runtime. From the classical Generational Hypothesis to modern low-latency algorithms like G1 and ZGC, the JVM has evolved from coarse Stop-The-World scavengers into sophisticated concurrent memory managers utilizing hardware virtual memory page-mapping and CPU load barriers.',
      vi: 'Thu gom rác (Garbage Collection) là đỉnh cao công nghệ của HotSpot runtime. Từ giả thuyết phân thế cổ điển đến các giải thuật độ trễ siêu thấp như G1 và ZGC, JVM đã tiến hóa từ những bộ dọn dẹp dừng toàn bộ hệ thống thô sơ thành các hệ thống quản lý bộ nhớ đồng thời phức tạp, tận dụng cơ chế ánh xạ trang ảo của phần cứng và rào cản nạp (Load Barrier) của CPU.'
    },
    deepDiveParagraphs: [
      {
        en: '1. The Weak Generational Hypothesis & Card Tables: Because >95% of Java objects die young, scanning the entire Old Generation during a Young Gen Minor GC would defeat generational efficiency. HotSpot uses a Card Table: an array of bytes where each byte represents a 512-byte card of Old Gen memory. When an Old Gen object writes a reference to a Young Gen object, the JIT compiler injects a Write Barrier that sets the corresponding card byte to 0 (Dirty). Minor GC scans only dirty cards instead of gigabytes of Old Gen memory!',
        vi: '1. Giả Thuyết Phân Thế & Bảng Thẻ (Card Table): Vì hơn 95% đối tượng chết trẻ, việc quét toàn bộ vùng Old Gen trong mỗi đợt Minor GC sẽ làm mất sạch lợi thế phân thế. HotSpot giải quyết bằng Card Table: một mảng byte mà mỗi byte đại diện cho một khối 512 byte trên Old Gen. Khi một đối tượng ở Old Gen trỏ tới một đối tượng ở Young Gen, JIT chèn một Rào Cản Ghi (Write Barrier) đánh dấu byte thẻ đó thành 0 (Dirty). Minor GC chỉ cần quét các thẻ bị bẩn thay vì quét hàng chục Gigabyte của Old Gen!'
      },
      {
        en: '2. G1 GC Regional Partitioning & Evacuation: Garbage-First (G1) divides the entire Heap into ~2,048 equal-sized regions (1MB to 32MB). Regions dynamically play the role of Eden, Survivor, or Old. G1 continuously tracks the volume of live objects in each region. During collection, it prioritizes collecting regions with the most garbage (hence "Garbage-First"), copying live objects to empty regions and reclaiming whole regions at once to prevent external memory fragmentation.',
        vi: '2. Phân Vùng Region & Sơ Tán Trong G1 GC: Garbage-First (G1) chia toàn bộ Heap thành ~2.048 vùng region bằng nhau (từ 1MB đến 32MB). Mỗi region linh hoạt đóng vai trò Eden, Survivor hoặc Old. G1 liên tục đo lường lượng rác trong từng region. Khi dọn dẹp, nó ưu tiên chọn các region chứa nhiều rác nhất (nên gọi là "Rác Trước - Garbage-First"), sao chép các đối tượng sống sang region trống và xóa trắng cả region cũ để chống phân mảnh bộ nhớ.'
      },
      {
        en: '3. Snapshot-At-The-Beginning (SATB) Concurrent Marking: While G1 marks live objects concurrently with application threads, running threads might mutate pointers and hide reachable objects. G1 solves this with SATB write barriers: whenever a reference field is overwritten, the pre-write barrier pushes the old reference value onto a thread-local SATB buffer. This preserves a logical snapshot of object graphs at the moment concurrent marking began.',
        vi: '3. Đánh Dấu Đồng Thời SATB (Snapshot-At-The-Beginning): Trong khi G1 đánh dấu các đối tượng sống song song với luồng ứng dụng, ứng dụng có thể sửa con trỏ và vô tình làm ẩn đối tượng sống. G1 giải quyết bằng rào cản ghi SATB: mỗi khi một trường tham chiếu bị ghi đè, rào cản sẽ lưu giá trị con trỏ cũ vào bộ đệm SATB cục bộ của luồng. Cơ chế này bảo toàn một bức ảnh chụp logic của đồ thị đối tượng tại mốc bắt đầu đánh dấu.'
      },
      {
        en: '4. ZGC 64-bit Colored Pointers: ZGC (Z Garbage Collector) achieves sub-millisecond pauses by storing metadata inside the reference pointer itself! In 64-bit architectures, ZGC uses 42 bits for physical address (addressing up to 4TB or 16TB), reserving 4 high-order bits for GC colors: Finalizable, Remapped, Marked0, Marked1. By inspecting the pointer color, ZGC knows instantly whether an object has been marked or relocated without consulting external metadata tables.',
        vi: '4. Con Trỏ Đổi Màu 64-bit (Colored Pointers) trong ZGC: ZGC đạt thời gian dừng dưới 1ms nhờ việc lưu trữ metadata ngay bên trong chính con trỏ tham chiếu! Trên kiến trúc 64-bit, ZGC dùng 42 bit cho địa chỉ vật lý (quản lý tới 4TB hoặc 16TB), dành riêng 4 bit cao làm cờ màu: Finalizable, Remapped, Marked0, Marked1. Nhìn vào màu của con trỏ, ZGC biết ngay đối tượng đã được đánh dấu hay đã bị chuyển đi nơi khác mà không cần tra cứu bảng ngoài.'
      },
      {
        en: '5. Self-Healing Load Barriers: When ZGC relocates an object to a new region concurrently in the background, other threads still hold references pointing to the old address. When a thread dereferences that pointer (obj.field), the JIT-injected Load Barrier intercepts the read: it checks the pointer color, sees it is not Remapped, looks up the Forwarding Table, updates the thread’s reference pointer to the new address in-place ("Self-Healing"), and returns the field in ~2 nanoseconds!',
        vi: '5. Rào Cản Tải Tự Chữa Lành (Self-Healing Load Barrier): Khi ZGC di dời một đối tượng sang region mới ở chế độ chạy ngầm, các luồng ứng dụng vẫn giữ con trỏ trỏ vào địa chỉ cũ. Khi luồng truy xuất dữ liệu (obj.field), Rào Cản Tải (Load Barrier) do JIT chèn vào sẽ chặn lại: nó kiểm tra màu con trỏ, thấy chưa remapped, tra bảng Forwarding Table, cập nhật thẳng con trỏ của luồng sang địa chỉ mới ("Tự chữa lành"), và trả về dữ liệu chỉ trong ~2ns!'
      },
      {
        en: '6. Humongous Objects & Premature Promotion Failures: In G1, any object exceeding 50% of a region size (e.g. byte[] array > 16MB in 32MB regions) is classified as a Humongous Object. Humongous objects are allocated directly in contiguous Old Gen regions, bypassing young generations. Excessive allocation of humongous objects fragments memory, triggers frequent concurrent mark cycles, and can degrade into catastrophic Full GC pauses.',
        vi: '6. Đối Tượng Khổng Lồ (Humongous Objects) & Lỗi Thăng Hạng Sớm: Trong G1, bất kỳ đối tượng nào có kích thước vượt quá 50% dung lượng region (như mảng byte[] > 16MB trong region 32MB) được coi là Humongous Object. Chúng được cấp phát thẳng vào các region Old Gen liên tục mà không qua Young Gen. Việc cấp phát quá nhiều đối tượng khổng lồ làm phân mảnh bộ nhớ và kích hoạt các đợt Full GC dừng hệ thống thảm khốc.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Running ZGC Without Memory Headroom: ZGC executes object compaction concurrently while the application continues to allocate new objects. If the allocation rate exceeds the concurrent reclamation rate and the heap runs out of free memory, ZGC stalls allocation threads, spiking latencies. Rule of thumb: always provision 20-30% memory headroom for ZGC compared to G1.',
        vi: 'Chạy ZGC Mà Không Dự Phòng Dung Lượng Đệm (Headroom): ZGC nén và sơ tán đối tượng chạy ngầm trong khi ứng dụng vẫn liên tục tạo đối tượng mới. Nếu tốc độ cấp phát vượt quá tốc độ dọn ngầm và Heap cạn bộ nhớ trống, ZGC sẽ buộc phải dừng luồng cấp phát, làm bùng nổ độ trễ. Quy tắc: Luôn cấp thêm 20-30% dung lượng RAM đệm cho ZGC so với G1.'
      },
      {
        en: 'Disabling Explicit GC (-XX:+DisableExplicitGC) with Direct Memory: Calling System.gc() in enterprise code is an anti-pattern. However, libraries allocating off-heap memory (like Netty or DirectByteBuffers) rely on System.gc() to trigger cleaner references when off-heap memory is exhausted. Disabling explicit GC completely can cause off-heap OutOfMemoryError! Solution: use -XX:+ExplicitGCInvokesConcurrent.',
        vi: 'Tắt Lệnh GC Tường Minh (-XX:+DisableExplicitGC) Khi Dùng Direct Memory: Gọi System.gc() trong code là anti-pattern. Tuy nhiên, các thư viện dùng bộ nhớ ngoài Heap (như Netty DirectByteBuffer) dựa vào System.gc() để kích hoạt Cleaner giải phóng RAM native khi gần cạn. Tắt hoàn toàn cờ này sẽ gây lỗi OutOfMemoryError ngoài Heap! Giải pháp: cấu hình -XX:+ExplicitGCInvokesConcurrent.'
      },
      {
        en: 'Oversized Humongous Objects Causing G1 Evacuation Failure: Ingesting large JSON payloads (e.g. 20MB files decoded into single byte[] arrays) in G1 with default region size (4MB) creates humongous allocations that waste 30% of each region and trigger rapid Full GCs. Mitigation: tune -XX:G1HeapRegionSize=32m and stream payloads via Jackson chunked readers.',
        vi: 'Đối Tượng Khổng Lồ Làm Hỏng Cơ Chế Sơ Tán G1: Đọc các file JSON lớn (như file 20MB nạp vào mảng byte[] đơn) trên G1 có region size mặc định (4MB) sẽ tạo ra các đối tượng Humongous chiếm dụng lãng phí tới 30% region và gây Full GC liên tục. Khắc phục: nâng -XX:G1HeapRegionSize=32m và streaming dữ liệu qua Jackson chunked stream.'
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'G1 Regional Partitioning vs ZGC 64-bit Colored Pointer Layout',
      vi: 'Cấu trúc Vùng Region G1 vs Bố cục Con trỏ Đổi màu 64-bit ZGC'
    },
    description: {
      en: 'G1 divides heap into discrete 1-32MB regions. ZGC encodes GC state directly into reference pointers, eliminating Stop-The-World compaction pauses.',
      vi: 'G1 chia nhỏ Heap thành các region 1-32MB. ZGC mã hóa trạng thái dọn rác trực tiếp vào con trỏ tham chiếu, triệt tiêu thời gian dừng nén bộ nhớ.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| G1 REGIONAL HEAP LAYOUT (~2,048 Regions of 1MB, 2MB, 4MB, 8MB, 16MB, or 32MB):                     |
|  [ E (Eden) ]   [ S (Survivor) ]   [ O (Old Gen) ]   [ H (Humongous > 50% Region) ]   [ Free ]     |
|  [ O (Old)  ]   [ E (Eden)     ]   [ Free        ]   [ O (Old Gen)                ]   [ S (Surv) ] |
+----------------------------------------------------------------------------------------------------+
| ZGC 64-BIT COLORED POINTER BIT ALLOCATION:                                                         |
| +---------------------+-----------------------+--------------------------------------------------+ |
| | 16 Unused Bits (0s) | 4 Metadata Color Bits | 44 Object Virtual Address Bits (Up to 16 TB RAM) | |
| +---------------------+-----------------------+--------------------------------------------------+ |
|                       | Bit 45: Finalizable   |                                                    |
|                       | Bit 44: Remapped      |                                                    |
|                       | Bit 43: Marked1       |                                                    |
|                       | Bit 42: Marked0       |                                                    |
+----------------------------------------------------------------------------------------------------+
| SELF-HEALING LOAD BARRIER (Dereferencing obj.field):                                               |
|  Check Pointer Color -> If NOT Remapped -> Lookup Forwarding Table -> Update Pointer -> Return     |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'marked0_marked1_bits', size: '2 Bits (42-43)', description: { en: 'Alternating active marking phases. Indicates whether object is reachable in current GC cycle.', vi: 'Hai pha đánh dấu luân phiên. Xác định đối tượng có còn sống trong chu kỳ GC hiện tại không.' } },
      { name: 'remapped_bit', size: '1 Bit (44)', description: { en: 'Indicates pointer has been updated to new address after concurrent object relocation.', vi: 'Báo hiệu con trỏ đã được cập nhật sang địa chỉ mới sau khi đối tượng được sơ tán.' } },
      { name: 'virtual_address_bits', size: '44 Bits (0-43)', description: { en: 'Linear virtual memory address pointing to object location, supporting up to 16 Terabytes.', vi: 'Địa chỉ bộ nhớ ảo tuyến tính trỏ tới vị trí đối tượng, hỗ trợ tới 16 Terabyte.' } }
    ]
  },

  steps: [
    {
      id: 'minor-mark',
      title: { en: '1. Card Table Write Barrier Tracking', vi: '1. Theo dõi con trỏ liên thế hệ qua Rào Cản Ghi Card Table' },
      phase: 'CARD_TABLE_DIRTY',
      description: {
        en: 'When a thread mutates an Old Gen reference to point to a Young Gen object, the JIT write barrier marks the corresponding 512-byte Card Table entry as DIRTY (0). Minor GC scans only dirty cards.',
        vi: 'Khi một luồng sửa tham chiếu ở Old Gen để trỏ tới một đối tượng ở Young Gen, rào cản ghi JIT đánh dấu ô thẻ tương ứng trên Card Table thành DIRTY (0). Minor GC chỉ cần quét các ô thẻ bẩn này.'
      },
      jvmRuntimeBehavior: {
        en: 'Nanosecond byte write: card_table[address >> 9] = 0. Zero lock contention.',
        vi: 'Ghi byte trong nano giây: card_table[address >> 9] = 0. Không tốn khóa.'
      },
      javaCodeLineMatch: 'oldCache.put(key, new ShortLivedResult());'
    },
    {
      id: 'evacuate-region',
      title: { en: '2. Regional Evacuation & Garbage-First Collection', vi: '2. Sơ tán Region & Thu gom theo mức độ rác (G1)' },
      phase: 'G1_EVACUATION',
      description: {
        en: 'G1 selects the regions with the highest proportion of garbage. Surviving objects are evacuated (copied) to a clean region. Old regions are completely reclaimed, leaving zero external memory fragmentation.',
        vi: 'G1 chọn các region có tỷ lệ rác cao nhất. Các đối tượng còn sống được sao chép sơ tán sang một region sạch. Các region cũ được giải phóng hoàn toàn, triệt tiêu phân mảnh bộ nhớ.'
      },
      jvmRuntimeBehavior: {
        en: 'Incremental parallel copy. Target pause time respected (-XX:MaxGCPauseMillis=200).',
        vi: 'Sao chép song song gia tăng. Đảm bảo đúng mục tiêu thời gian dừng (-XX:MaxGCPauseMillis=200).'
      },
      javaCodeLineMatch: '// G1 evacuates live objects and reclaims entire region'
    },
    {
      id: 'load-barrier',
      title: { en: '3. ZGC Concurrent Load Barrier Self-Healing', vi: '3. Rào Cản Tải Tự Chữa Lành Con Trỏ Đồng Thời (ZGC)' },
      phase: 'ZGC_SELF_HEALING',
      description: {
        en: 'When an application thread reads an object reference that was relocated to a new region, the Load Barrier intercepts the read, translates the address via the Forwarding Table, self-heals the pointer, and returns data without any STW pause!',
        vi: 'Khi luồng ứng dụng đọc tham chiếu của một đối tượng vừa bị di dời sang region mới, Load Barrier chặn lại, tra địa chỉ mới qua Forwarding Table, tự sửa con trỏ và trả về dữ liệu mà không cần dừng ứng dụng!'
      },
      jvmRuntimeBehavior: {
        en: 'User-space hardware dereference. In-place pointer repair in ~2 nanoseconds.',
        vi: 'Truy xuất phần cứng ở user-space. Tự sửa con trỏ tại chỗ trong ~2 nanosecond.'
      },
      javaCodeLineMatch: 'String name = customer.getName(); // Triggers Load Barrier self-healing'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'Oracle HotSpot G1 GC',
      implementationName: 'Garbage-First Incremental Evacuation',
      keyMechanism: {
        en: 'Divides heap into ~2048 regions. Uses Card Tables for cross-region references and SATB for concurrent marking. Tuned to meet predictable pause time goals.',
        vi: 'Chia heap thành ~2048 region. Dùng Card Table cho con trỏ liên vùng và SATB cho đánh dấu đồng thời. Tối ưu theo mục tiêu thời gian dừng mong muốn.'
      },
      defaultFlags: '-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:G1HeapRegionSize=16m',
      architectureNote: {
        en: 'Default collector in modern Java. Ideal for balanced throughput and predictable 100-200ms pauses.',
        vi: 'Collector mặc định trên Java hiện đại. Phù hợp cho cân bằng giữa thông lượng và độ trễ dừng 100-200ms.'
      }
    },
    {
      jvmEngine: 'Oracle HotSpot Generational ZGC (Java 21+)',
      implementationName: 'Concurrent Colored Pointers & Load Barriers',
      keyMechanism: {
        en: 'Executes marking, evacuation, and pointer remapping entirely concurrently with application threads. Generational separation in Java 21 boosts throughput by 4x.',
        vi: 'Thực thi đánh dấu, sơ tán và cập nhật con trỏ hoàn toàn đồng thời với ứng dụng. Tính năng Generational trên Java 21 tăng thông lượng lên gấp 4 lần.'
      },
      defaultFlags: '-XX:+UseZGC -XX:+ZGenerational',
      architectureNote: {
        en: 'Guarantees sub-millisecond pauses (<1ms) across massive heaps up to 16 Terabytes.',
        vi: 'Bảo đảm thời gian dừng dưới 1 mili giây trên các cấu hình RAM khủng lên tới 16 Terabyte.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Sub-millisecond maximum latency with ZGC eliminates distributed timeout cascades.', vi: 'Độ trễ tối đa dưới 1 mili giây với ZGC triệt tiêu hiện tượng sập đổ domino do timeout phân tán.' },
      { en: 'Zero external memory fragmentation due to regional evacuation copying.', vi: 'Hoàn toàn không bị phân mảnh bộ nhớ nhờ cơ chế sao chép sơ tán các vùng region.' }
    ],
    cons: [
      { en: 'Higher CPU utilization (5-10% CPU overhead) due to concurrent background GC worker threads.', vi: 'Tốn thêm 5-10% CPU cho các worker thread dọn rác chạy ngầm đồng thời.' },
      { en: 'Requires larger RAM headroom to prevent allocation stalls during concurrent compaction.', vi: 'Đòi hỏi dung lượng RAM dự phòng lớn hơn để tránh tắc nghẽn cấp phát khi dọn rác ngầm.' }
    ],
    memoryFootprint: {
      en: 'Requires 20-30% memory headroom; Card Tables consume ~0.2% of heap; Remembered Sets consume ~5%.',
      vi: 'Cần dự phòng 20-30% RAM; Card Table tốn ~0.2% heap; Remembered Sets tốn khoảng ~5%.'
    },
    jvmSpecificationGuarantee: {
      en: 'Guarantees that unreachable objects are safely collected and finalizers / cleaners are executed cleanly.',
      vi: 'Bảo đảm các đối tượng không còn tham chiếu sẽ được thu gom an toàn và thực thi đầy đủ các Cleaner.'
    }
  },

  javaCode: `package com.enterprise.jvm.gc;

import java.util.ArrayList;
import java.util.List;

/**
 * Pure Java 21 Educational Inspection of Generational GC & ZGC Allocations
 * Demonstrates:
 *  1. Short-lived Young Generation churn
 *  2. Long-lived Tenured Generation survival
 *  3. Large buffer allocation testing G1 Humongous Region boundaries
 */
public class GarbageCollectionDemo {

    // Simulates long-lived cache resident in Old Generation
    private static final List<byte[]> LONG_LIVED_CACHE = new ArrayList<>();

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== HOTSPOT GENERATIONAL GC & ZGC SIMULATION ===");

        long start = System.currentTimeMillis();

        // Phase 1: High-churn short-lived allocations (Minor GC targets)
        for (int i = 0; i < 50_000; i++) {
            allocateTemporaryPayload(i);
        }
        System.out.println("Phase 1 Complete: 50,000 temporary payloads evacuated.");

        // Phase 2: Promote entries to long-lived cache (Old Generation)
        for (int i = 0; i < 20; i++) {
            LONG_LIVED_CACHE.add(new byte[1024 * 512]); // 512 KB per entry
        }
        System.out.println("Phase 2 Complete: 10MB promoted to Old Generation.");

        // Phase 3: Humongous Allocation (> 50% of G1 region size)
        // If G1 region size is 4MB, a 5MB byte array is a Humongous Object!
        byte[] humongousData = new byte[1024 * 1024 * 5]; // 5MB
        System.out.println("Phase 3 Complete: Allocated 5MB Humongous Object (Length: " + humongousData.length + ")");

        long duration = System.currentTimeMillis() - start;
        System.out.printf("Total Execution Time: %d ms (Zero STW pauses with Generational ZGC!)%n", duration);
    }

    private static void allocateTemporaryPayload(int seq) {
        // Allocated in Eden space via TLAB bump-the-pointer
        byte[] temp = new byte[256];
        temp[0] = (byte) (seq & 0xFF);
    }
}`,

  jvmFlagsCode: `# ===================================================================
# Production JVM Flags for Generational ZGC in Java 21+
# ===================================================================
-Xms32g
-Xmx32g
-XX:+UseZGC
-XX:+ZGenerational
-Xlog:gc*,gc+phases=debug:file=gc.log:time,uptime,pid:filecount=5,filesize=100M

# ===================================================================
# Production JVM Flags for G1 GC with Low Pause Tuning:
# ===================================================================
-XX:+UseG1GC
-XX:MaxGCPauseMillis=150
-XX:G1HeapRegionSize=16m
-XX:G1ReservePercent=15
-XX:InitiatingHeapOccupancyPercent=45
-XX:+ParallelRefProcEnabled`,

  bytecodeInspection: `// Disassembled Bytecode: javap -c com.enterprise.jvm.gc.GarbageCollectionDemo
private static void allocateTemporaryPayload(int);
  Code:
   0: sipush        256  // Push short array size (256 bytes) onto operand stack
   3: newarray       byte // Allocate new byte array (TLAB pointer bump)
   5: astore_1
   6: aload_1
   7: iconst_0
   8: iload_0
   9: sipush        255
  12: iand
  13: i2b
  14: bastore            // Store byte into array element 0 (Write Barrier if Old Gen)
  15: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What is the Weak Generational Hypothesis, and why does JVM split the Heap into Young and Old generations?',
        vi: 'Giả thuyết thế hệ yếu (Weak Generational Hypothesis) là gì và tại sao JVM chia Heap thành Young và Old generation?'
      },
      answer: {
        en: 'The Weak Generational Hypothesis states that over 98% of all allocated objects in an application die shortly after creation (method-local variables, temporary DTOs, buffers). Only a tiny minority survive to become long-lived (Spring singleton beans, caches). If the JVM scanned the entire flat Heap on every collection, GC pauses would take seconds. By segregating memory into Young Generation (Eden + Survivors) and Old Generation, Minor GC can rapidly scavenge Eden in sub-milliseconds without scanning the massive Old Gen.',
        vi: 'Giả thuyết thế hệ yếu chỉ ra rằng hơn 98% các đối tượng được sinh ra trong ứng dụng sẽ chết đi chỉ sau vài mili giây (biến cục bộ trong hàm, DTO tạm thời). Chỉ có một số lượng cực nhỏ sống sót lâu dài (Spring bean singleton, cache). Nếu JVM phải quét toàn bộ bộ nhớ phẳng trong mỗi lần dọn rác, ứng dụng sẽ bị đơ suốt nhiều giây. Bằng cách phân chia thành Young Gen và Old Gen, các đợt Minor GC có thể dọn sạch vùng Eden chỉ trong vài mili giây mà không cần quét vùng Old Gen khổng lồ.'
      },
      trapWarning: {
        en: 'Do not claim System.gc() forces an immediate garbage collection. System.gc() is only a hint/suggestion to the JVM; HotSpot may ignore it, especially if -XX:+DisableExplicitGC is set.',
        vi: 'Đừng nói System.gc() ép buộc dọn rác ngay lập tức. System.gc() chỉ là một lời gợi ý cho JVM; HotSpot hoàn toàn có quyền bỏ qua, nhất là khi bật cờ -XX:+DisableExplicitGC.'
      },
      proTip: {
        en: 'Explain the Card Table: When an Old Gen object references a Young Gen object, the JVM uses a JIT write barrier to mark a card dirty, allowing Minor GC to find GC roots without scanning the entire Old Generation.',
        vi: 'Giải thích cơ chế Bảng Card Table: Khi một đối tượng ở Old Gen trỏ tới Young Gen, JVM dùng write barrier đánh dấu "dirty" vào Card Table, giúp Minor GC tìm thấy GC root mà không cần quét toàn bộ Old Gen.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'How does G1GC (Garbage-First Collector) achieve predictable Stop-The-World pause targets?',
        vi: 'Bộ thu gom rác G1GC đạt được mục tiêu thời gian dừng Stop-The-World dự đoán trước như thế nào?'
      },
      answer: {
        en: 'Unlike older collectors that manage monolithic contiguous memory generations, G1 partitions the entire Heap into 2,048 uniform virtual Regions (1MB to 32MB). Each region dynamically acts as Eden, Survivor, or Old. G1 tracks the amount of live data and reclaimable garbage in each region. Based on the user-configured pause target (-XX:MaxGCPauseMillis=200), G1 selects the subset of regions containing the HIGHEST garbage density ("Garbage-First") that can be evacuated within the budget. It evacuates live objects into a new region and reclaims empty regions with zero memory fragmentation.',
        vi: 'Khác với các GC truyền thống chia bộ nhớ thành các khối lớn liên tục, G1 chia nhỏ toàn bộ Heap thành khoảng 2,048 vùng nhớ ảo (Region) từ 1MB đến 32MB. Mỗi region đóng vai trò linh hoạt là Eden, Survivor hoặc Old. G1 liên tục theo dõi lượng rác trong từng region. Dựa trên thời gian dừng mong muốn do người dùng cấu hình (-XX:MaxGCPauseMillis=200), G1 chọn ra tập hợp các region có mật độ rác CAO NHẤT ("Garbage-First") để sơ tán. Nó dọn đối tượng sống sang region mới và thu hồi hoàn toàn các region cũ mà không để lại phân mảnh bộ nhớ.'
      },
      trapWarning: {
        en: 'Setting MaxGCPauseMillis too low (e.g. 10ms) is counter-productive: G1 will only be able to collect a tiny fraction of regions per cycle, causing garbage to accumulate until it triggers a catastrophic Full GC Stop-The-World pause!',
        vi: 'Đặt MaxGCPauseMillis quá thấp (như 10ms) sẽ phản tác dụng: G1 chỉ kịp dọn vài region mỗi đợt, khiến rác ứ đọng dần cho đến khi kích hoạt Full GC làm đứng hình cả hệ thống!'
      },
      proTip: {
        en: 'Mention Humongous Regions: Objects larger than 50% of a G1 Region size are classified as Humongous objects, allocated directly in contiguous Old Gen regions, and can cause heap fragmentation if allocated frequently.',
        vi: 'Nhắc đến Humongous Objects: Các đối tượng lớn hơn 50% kích thước Region sẽ được xếp vào Humongous Object, cấp phát thẳng vào Old Gen và dễ làm phân mảnh bộ nhớ nếu xuất hiện liên tục.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'How does ZGC (Z Garbage Collector) achieve sub-millisecond pause times on Terabyte-scale heaps via Colored Pointers and Load Barriers?',
        vi: 'Bộ thu gom ZGC đạt được thời gian dừng dưới 1 mili giây trên bộ nhớ hàng Terabyte qua Con trỏ màu (Colored Pointers) và Hàng rào tải (Load Barrier) như thế nào?'
      },
      answer: {
        en: 'Traditional GC pauses are proportional to heap size because threads must be stopped while live objects are relocated. ZGC makes object relocation 100% concurrent with application threads via two architectural innovations: 1. 64-bit Colored Pointers: ZGC uses 4 metadata bits directly inside the 64-bit reference address (Marked0, Marked1, Remapped). 2. JIT Load Barrier: Whenever an application thread reads an object reference (e.g., o.field), the CPU executes an ultra-fast inlined load barrier (~2ns). If the pointer\'s color shows the target object has been relocated to a new address, the load barrier self-heals: it looks up the forwarding table, updates the reference to the new location, and returns the live object without stopping the application! This decouples GC pause times from heap size: pauses remain <1ms whether the heap is 16GB or 16TB.',
        vi: 'Thời gian dừng của GC truyền thống tỉ lệ thuận với dung lượng Heap vì phải dừng luồng để di dời các đối tượng còn sống. ZGC thực hiện việc di dời đối tượng 100% SONG SONG với luồng ứng dụng nhờ 2 đột phá: 1. Con trỏ màu 64-bit (Colored Pointers): ZGC nhúng 4 bit metadata trực tiếp vào địa chỉ con trỏ tham chiếu (Marked0, Marked1, Remapped). 2. Hàng rào tải JIT (Load Barrier): Mỗi khi luồng ứng dụng đọc một con trỏ đối tượng (o.field), CPU chạy một đoạn mã load barrier siêu tốc (~2ns). Nếu con trỏ cho thấy đối tượng đã bị di dời sang ô nhớ mới, load barrier tự sửa (self-healing): tra bảng forwarding table, trỏ lại địa chỉ mới và trả về đối tượng sống mà không cần dừng ứng dụng! Nhờ đó, thời gian dừng luôn dưới 1ms bất kể Heap là 16GB hay 16TB.'
      },
      trapWarning: {
        en: 'ZGC requires 64-bit platforms and disables Compressed OOPs because it uses the upper address bits for color metadata.',
        vi: 'ZGC bắt buộc chạy trên nền tảng 64-bit và tự động tắt Compressed OOPs vì nó cần các bit cao trong con trỏ 64-bit để lưu metadata màu.'
      },
      proTip: {
        en: 'Java 21 introduced Generational ZGC (-XX:+UseZGC -XX:+ZGenerational), combining sub-millisecond pauses with 4x higher throughput and 10x lower memory allocation overhead compared to single-generation ZGC.',
        vi: 'Java 21 đã chính thức ra mắt Generational ZGC (-XX:+UseZGC -XX:+ZGenerational), kết hợp thời gian dừng dưới 1ms với thông lượng cao gấp 4 lần so với bản ZGC thế hệ đơn trước đó.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'Payment Gateway P99 Latency SLA Breach via G1GC Evacuation Pause Spikes',
      vi: 'Vi Phạm Cam Kết Độ Trễ P99 Cổng Thanh Toán Do Đỉnh Dừng Rác G1GC Evacuation'
    },
    businessContext: {
      en: 'A tier-1 credit card payment gateway authorizes 35,000 real-time transactions/second under a strict contractual SLA requiring P99 latency under 80 milliseconds.',
      vi: 'Cổng thanh toán thẻ tín dụng quốc tế xử lý 35,000 giao dịch thời gian thực mỗi giây với cam kết pháp lý nghiêm ngặt độ trễ P99 không được vượt quá 80 mili giây.'
    },
    problemDescription: {
      en: 'The service ran on Java 17 with standard G1GC on 32GB instances. Every 90 seconds, the gateway experienced violent latency spikes where P99 jumped from 18ms to 780ms. Upstream mobile bank apps timed out, generating customer checkout drops and $120,000 in monthly SLA violation penalties. GC log forensic analysis with -Xlog:gc* revealed that G1GC evacuation pauses were stalling all application threads for 650ms to 850ms. The cause was two-fold: 1. Rapid allocation of 4MB cryptographic payload arrays triggered G1 Humongous Object allocations directly into contiguous Old Gen regions, fragmenting the heap. 2. Heavy Card Table scanning overhead during mixed GC cycles.',
      vi: 'Hệ thống chạy trên Java 17 với bộ dọn rác G1GC trên máy chủ 32GB RAM. Cứ mỗi 90 giây, hệ thống lại xuất hiện một đợt giật lag dữ dội khiến độ trễ P99 vọt từ 18ms lên tới 780ms. Các ứng dụng ngân hàng đối tác bị quá hạn (timeout), gây mất mát giao dịch và thiệt hại 120,000 USD tiền phạt vi phạm hợp đồng mỗi tháng. Phân tích file log dọn rác (-Xlog:gc*) cho thấy các đợt dừng G1GC Evacuation Pause đã làm tê liệt toàn bộ luồng xử lý suốt 650ms đến 850ms. Nguyên nhân gồm: 1. Việc tạo các mảng mã hóa dữ liệu 4MB gây ra cấp phát đối tượng ngoại cỡ (Humongous Objects) thẳng vào Old Gen làm phân mảnh bộ nhớ. 2. Chi phí quét bảng Card Table quá lớn trong các chu kỳ Mixed GC.'
    },
    whyNaiveFails: {
      en: 'Lowering -XX:MaxGCPauseMillis=40 failed catastrophically: G1GC could not evacuate sufficient regions within the 40ms budget, fell behind the 1.5 GB/s allocation rate, and eventually collapsed into a 4.8-second Full GC Stop-The-World disaster.',
      vi: 'Cách can thiệp ngây thơ bằng cách ép cờ -XX:MaxGCPauseMillis=40 gây thảm họa: G1GC không thể dọn sạch đủ số region trong thời gian 40ms eo hẹp, không đuổi kịp tốc độ sinh rác 1.5 GB/s của hệ thống và cuối cùng dẫn đến một đợt Full GC làm đóng băng toàn hệ thống suốt 4.8 giây.'
    },
    coreSolution: {
      en: '1. Migrate to Java 21 Generational ZGC (-XX:+UseZGC -XX:+ZGenerational). Generational ZGC executes both young and old generation object relocation concurrently with running threads using 64-bit colored pointers and hardware load barriers, guaranteeing sub-millisecond maximum pauses. 2. Pre-allocate reusable Direct ByteBuffers (off-heap) for crypto payloads to eliminate Humongous heap allocations.',
      vi: '1. Nâng cấp lên Java 21 Generational ZGC (-XX:+UseZGC -XX:+ZGenerational). Generational ZGC thực hiện việc di dời đối tượng ở cả vùng Young và Old hoàn toàn song song với các luồng ứng dụng bằng con trỏ màu 64-bit và load barrier, đảm bảo thời gian dừng tối đa dưới 1ms. 2. Cấp phát trước các bộ đệm Direct ByteBuffer ngoài Heap (Off-heap) cho các gói tin mã hóa để triệt tiêu việc sinh rác Humongous Object.'
    },
    productionCode: `// Production Java 21 LTS Generational ZGC Tuning Profile:
# High-Throughput Zero-Pause Payment Gateway Startup Config

java \\
  -XX:+UseContainerSupport \\
  -Xms30g \\
  -Xmx30g \\
  # 1. Enable Java 21 Generational ZGC:
  -XX:+UseZGC \\
  -XX:+ZGenerational \\
  # 2. Concurrency tuning: allocate 4 background GC worker threads
  -XX:ConcGCThreads=4 \\
  # 3. Offload cryptographic arrays to Native Direct Memory:
  -XX:MaxDirectMemorySize=4g \\
  -XX:+AlwaysPreTouch \\
  # 4. Detailed Unified JVM GC Logging:
  -Xlog:gc*,gc+phases=debug:file=/var/log/jvm/gc.log:time,uptime,pid:filecount=5,filesize=100M \\
  -XX:+ExitOnOutOfMemoryError \\
  -jar payment-gateway.jar`,
    architectureImpact: {
      en: 'Max Stop-The-World GC pause durations dropped from 780ms down to 0.45ms (1,700x pause time reduction); P99 payment transaction latency stabilized at 12.8ms across 38,000 req/s load; Contractual SLA violation penalties dropped to $0.',
      vi: 'Thời gian dừng GC tối đa giảm từ 780ms xuống chỉ còn 0.45ms (giảm 1,700 lần thời gian dừng hệ thống); Độ trễ giao dịch P99 ổn định ở mức 12.8ms khi tải đạt 38,000 req/s; Tiền phạt vi phạm cam kết SLA giảm về 0 USD.'
    }
  }
};
