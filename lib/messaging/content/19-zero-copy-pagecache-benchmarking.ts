import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const zeroCopyPagecacheBenchmarkingTopic: MessagingTopic = {
  id: 'zero-copy-pagecache-benchmarking',
  category: 'advanced-streaming',
  level: 'advanced',
  chapter: 'Chuyên Đề Nâng Cao — Advanced Distributed Streaming',
  name: 'Performance Tuning & Benchmarking: Kafka vs RabbitMQ',
  tagline: {
    vi: 'Giải phẫu cơ chế Linux Zero-Copy (sendfile syscall), tận dụng OS Page Cache, Garbage Collection Free và phương pháp Benchmark thực chiến.',
    en: 'Deconstructing Linux Zero-Copy (sendfile syscall), OS Page Cache utilization, GC-free memory, and production benchmarking.'
  },
  difficulty: 3,
  order: 19,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Trong các kiến trúc truyền thống, khi server đọc một file từ đĩa và gửi qua mạng, dữ liệu phải trải qua 4 lần copy bộ nhớ và 4 lần chuyển đổi ngữ cảnh (Context Switches) giữa User Space và Kernel Space: 1. Đĩa -> OS Kernel Page Cache; 2. Kernel Page Cache -> JVM Application Memory Buffer; 3. JVM Buffer -> OS Socket Buffer; 4. Socket Buffer -> Card mạng NIC. Quy trình này lãng phí chu kỳ CPU, gây nghẽn băng thông RAM bus và kích hoạt JVM Garbage Collection liên tục.',
      en: 'In conventional architectures, transferring data from disk to network incurs 4 memory copies and 4 context switches between User Space and Kernel Space: 1. Disk to OS Page Cache; 2. Page Cache to JVM Memory; 3. JVM Memory to Socket Buffer; 4. Socket Buffer to NIC. This burns CPU cycles, saturates memory bus bandwidth, and triggers frequent JVM GC pauses.'
    },
    hardwareConstraint: {
      vi: 'Băng thông bộ nhớ RAM (Memory Bus Bandwidth) bị nghẽn khi sao chép liên tục hàng triệu byte dữ liệu vô ích. CPU tiêu tốn tới 60% năng lượng chỉ để di chuyển dữ liệu qua lại giữa các buffer thay vì xử lý logic nghiệp vụ.',
      en: 'Memory bus bandwidth saturates when endlessly copying gigabytes of redundant buffer data. CPUs waste up to 60% of instruction cycles shuffling memory between user and kernel spaces.'
    },
    fundamentalSolution: {
      vi: 'Kafka áp dụng kỹ thuật Linux Zero-Copy thông qua hàm sendfile() (Java FileChannel.transferTo()): Dữ liệu từ OS Page Cache được chuyển THẲNG sang bộ đệm của Card mạng NIC (qua DMA - Direct Memory Access) mà KHÔNG HỀ ĐI QUA USER SPACE CỦA JVM! Số lần copy giảm từ 4 xuống 2 (hoặc 1 với Scatter-Gather DMA), Context Switch giảm từ 4 xuống 2, và JVM hoàn toàn không tốn 1 byte bộ nhớ Heap (GC-Free).',
      en: 'Kafka leverages Linux Zero-Copy via the sendfile() syscall (Java FileChannel.transferTo()): Bytes transfer DIRECTLY from OS Page Cache to the NIC buffer via Direct Memory Access (DMA), completely bypassing JVM user space! Copies drop from 4 to 2, context switches drop from 4 to 2, and JVM heap allocation is zero (GC-Free).'
    },
    math: {
      formula: '\\text{Data Path}_{\\text{Zero-Copy}}: \\quad \\text{Disk} \\xrightarrow{\\text{DMA}} \\text{OS Page Cache} \\xrightarrow{\\text{DMA}} \\text{NIC Card Buffer}',
      timeComplexity: 'O(1) kernel-level DMA stream transfer',
      spaceComplexity: 'Zero JVM Heap Allocation (Off-Heap Kernel Space)',
      throughputFormula: '\\text{Speedup} = \\frac{\\text{Throughput}_{\\text{Zero-Copy}}}{\\text{Throughput}_{\\text{Traditional Copy}}} \\approx 300\\% - 400\\%'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Tại sao Kafka có thể đạt thông lượng hàng triệu message/giây trên phần cứng đĩa từ thông thường? Bí mật nằm ở kiến trúc tận dụng tối đa nhân hệ điều hành Linux: OS Page Cache, Sequential Disk I/O và Zero-Copy transfer.',
      en: 'How does Kafka achieve multi-million msg/s throughput on spinning commodity hardware? The architectural secret lies in deep Linux kernel exploitation: OS Page Cache, Sequential Disk I/O, and Zero-Copy network streaming.'
    },
    deepDiveParagraphs: [
      {
        vi: 'OS Page Cache vs JVM Heap Cache: Thay vì lưu trữ message trong JVM Heap (vốn chịu chi phí overhead 24 bytes cho mỗi object và nguy cơ Stop-the-World GC), Kafka để toàn bộ bộ nhớ còn trống của máy chủ cho Linux OS Page Cache quản lý. Khi Consumer đọc message vừa được ghi, dữ liệu vẫn đang nằm trong RAM của Page Cache, tốc độ đọc tương đương RAM mà không tốn chi phí GC.',
        en: 'OS Page Cache vs JVM Heap Cache: Storing records in JVM heap incurs 24-byte object overheads and Stop-the-World GC risk. Kafka relinquishes memory to the Linux OS Page Cache. When consumers read fresh messages, bytes are fetched directly from RAM in page cache without touching JVM heap.'
      },
      {
        vi: 'Sequential I/O vs Random I/O: Đĩa cứng (ngay cả SSD NVMe) có tốc độ đọc/ghi tuần tự (Sequential I/O) nhanh hơn đọc/ghi ngẫu nhiên (Random I/O) từ 100 đến 1.000 lần. Kafka chỉ ghi nối tiếp vào cuối file log (Append-only), biến ổ cứng thành một dải băng từ tốc độ cao.',
        en: 'Sequential vs Random I/O: Disk sequential writes outpace random mutations by 100x to 1,000x even on NVMe SSDs. Kafka exclusively appends to the log tail, converting hard drives into lightning-fast streaming media.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Cấp phát JVM Heap quá lớn cho Kafka Broker: Cấp phát 64GB RAM cho Kafka Heap là sai lầm phổ biến. Heap lớn chỉ làm tăng thời gian Full GC. Khuyến nghị chuẩn: Chỉ cấp 6GB - 8GB RAM cho JVM Heap của Kafka, để lại 85% RAM còn lại cho Linux OS Page Cache!',
        en: 'Over-allocating JVM Heap to Kafka Brokers: Allocating 64GB to Kafka heap is a major anti-pattern triggering long GC pauses. Best practice: allocate only 6GB-8GB heap, reserving 85% of total server RAM for the Linux OS Page Cache!'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'So sánh Quy trình: Traditional 4-Copy Transfer vs Linux Zero-Copy DMA',
      en: 'Data Transfer Comparison: Traditional 4-Copy vs Linux Zero-Copy DMA'
    },
    description: {
      vi: 'Sơ đồ luồng dữ liệu minh họa cách sendfile() loại bỏ việc sao chép qua bộ nhớ JVM User Space.',
      en: 'Architectural schematic comparing classical 4-copy buffer transitions against Zero-Copy DMA pipelines.'
    },
    asciiDiagram: `
[TRADITIONAL 4-COPY DATA PATH (HEAVY CPU & GC BURDEN)]
Disk ---> (1. DMA) ---> OS Page Cache ---> (2. CPU Copy) ---> JVM Heap Buffer
                                                                  |
NIC Card <--- (4. DMA) <--- OS Socket Buffer <--- (3. CPU Copy) <--+
(4 Memory Copies + 4 Context Switches between User & Kernel Space!)

[KAFKA LINUX ZERO-COPY DATA PATH (ZERO CPU, ZERO GC!)]
Disk ---> (1. DMA) ---> OS Page Cache ==========================> NIC Card Buffer
                                      \\--- (2. DMA Descriptor) ---/
(Data NEVER enters JVM User Space! 2 Context Switches, Zero Heap RAM!)
`,
    components: [
      {
        name: 'Linux Page Cache',
        role: 'Kernel Memory Buffer',
        description: {
          vi: 'Vùng nhớ RAM của hệ điều hành tự động cache các block dữ liệu đĩa vừa đọc hoặc ghi.',
          en: 'Operating system kernel memory dynamically caching recently read or written disk blocks.'
        }
      },
      {
        name: 'DMA (Direct Memory Access)',
        role: 'Hardware Data Shifter',
        description: {
          vi: 'Phần cứng chuyên trách chuyển dữ liệu trực tiếp giữa bộ nhớ và card mạng mà không cần CPU can thiệp.',
          en: 'Hardware controller transferring bytes directly between RAM and NIC without CPU intervention.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Producer ghi dữ liệu -> Nằm trong OS Page Cache', en: 'Producer writes to Page Cache' },
      phase: 'Append to Cache',
      description: {
        vi: 'Gói tin từ mạng được ghi vào file log segment thông qua hệ điều hành Linux. Dữ liệu nằm ngay trong Page Cache.',
        en: 'Records append sequentially to segment files, resting hot in Linux Page Cache RAM.'
      },
      brokerBehavior: {
        vi: 'Không tiêu tốn một byte bộ nhớ JVM Heap nào của broker.',
        en: 'Zero bytes allocated on the Kafka broker JVM heap.'
      },
      javaCodeLineMatch: 'FileChannel.write(byteBuffer);'
    },
    {
      id: 'step-1',
      title: { vi: 'Consumer yêu cầu đọc (Fetch Request)', en: 'Consumer issues fetch' },
      phase: 'Zero-Copy Trigger',
      description: {
        vi: 'Kafka Broker xử lý Fetch Request bằng lệnh FileChannel.transferTo() (gọi syscall sendfile()).',
        en: 'Broker fulfills fetch request via FileChannel.transferTo() invoking sendfile() syscall.'
      },
      brokerBehavior: {
        vi: 'Hệ điều hành chuyển con trỏ DMA từ Page Cache sang NIC Buffer.',
        en: 'Kernel maps DMA descriptors from Page Cache directly to NIC hardware buffers.'
      },
      javaCodeLineMatch: 'fileChannel.transferTo(position, count, targetSocketChannel);'
    },
    {
      id: 'step-2',
      title: { vi: 'Gói tin bay thẳng ra Card mạng NIC', en: 'Direct NIC Transmission' },
      phase: 'Wire Transfer',
      description: {
        vi: 'Card mạng truyền thẳng gói tin sang Consumer với tốc độ dây cáp mạng tối đa (Line Rate 10Gbps/25Gbps).',
        en: 'NIC hardware pushes frames out to the network interface at maximum wire speed.'
      },
      brokerBehavior: {
        vi: 'CPU Broker duy trì ở mức < 10% ngay cả khi truyền hàng Gigabyte dữ liệu mỗi giây.',
        en: 'Broker CPU hovers under 10% while saturating gigabytes/sec network pipes.'
      },
      javaCodeLineMatch: 'zero_copy_sendfile()'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Erlang VM Memory Management', en: 'Erlang VM Memory Management' },
      keyMechanism: {
        vi: 'RabbitMQ xử lý message bên trong Erlang Process Heap. Có chi phí giải mã gói tin AMQP và quản lý con trỏ bộ nhớ trong RAM.',
        en: 'Processes messages inside Erlang process memory, incurring AMQP framing and GC bookkeeping overhead.'
      },
      configExample: 'vm_memory_high_watermark=0.4',
      architectureNote: {
        vi: 'Latency cực thấp cho từng message đơn lẻ; không áp dụng Zero-Copy thuần túy do cần xử lý logic routing tại broker.',
        en: 'Sub-millisecond single-message latency; cannot leverage zero-copy due to dynamic broker routing logic.'
      }
    },
    kafka: {
      role: { vi: 'Bậc thầy tận dụng Linux Kernel & Zero-Copy', en: 'Linux Kernel & Zero-Copy Master' },
      keyMechanism: {
        vi: 'Bỏ qua hoàn toàn tầng ứng dụng khi truyền dữ liệu: sendfile() chuyển thẳng từ Page Cache sang Card mạng.',
        en: 'Bypasses user space completely: sendfile() pipes directly from OS page cache to network cards.'
      },
      configExample: 'num.network.threads=8, num.io.threads=16',
      architectureNote: {
        vi: 'Bão hòa băng thông mạng 10Gbps/40Gbps với mức tiêu thụ CPU gần như bằng 0.',
        en: 'Saturates 10-40 Gbps NIC wire limits with near-zero CPU instruction overhead.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Thông lượng truyền dữ liệu đạt mức tối đa của phần cứng card mạng (Wire-Speed Line Rate).',
        en: 'Unlocks theoretical maximum network hardware throughput (Wire-Speed Line Rate).'
      },
      {
        vi: 'Triệt tiêu hoàn toàn hiện tượng Stop-the-World do JVM Garbage Collection gây ra.',
        en: 'Completely eliminates JVM Garbage Collection Stop-the-World pause anomalies.'
      }
    ],
    cons: [
      {
        vi: 'Broker không thể can thiệp sửa đổi nội dung payload trong quá trình truyền (vì dữ liệu không lên User Space).',
        en: 'Brokers cannot inspect or mutate message payloads during transmission.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Zero-Copy giúp throughput tăng gấp 4 lần và giảm 70% mức sử dụng CPU của cụm máy chủ.',
      en: 'Zero-Copy boosts throughput 4x while slashing broker CPU consumption by 70%.'
    },
    orderingGuarantee: {
      vi: 'Duy trì trật tự nhị phân nguyên vẹn 100% từ file log đĩa cứng sang đường truyền mạng.',
      en: 'Preserves 100% exact binary byte order from disk segments onto the network wire.'
    }
  },

  javaCode: `package com.enterprise.messaging.benchmark;

import java.io.FileInputStream;
import java.net.InetSocketAddress;
import java.nio.channels.FileChannel;
import java.nio.channels.SocketChannel;

public class LinuxZeroCopyBenchmarkDemonstration {

    public static void transferFileZeroCopy(String filePath, String host, int port) throws Exception {
        SocketChannel socketChannel = SocketChannel.open();
        socketChannel.connect(new InetSocketAddress(host, port));

        try (FileInputStream fis = new FileInputStream(filePath);
             FileChannel fileChannel = fis.getChannel()) {

            long size = fileChannel.size();
            long transferred = 0;

            long start = System.nanoTime();

            // Linux sendfile() syscall executed under the hood!
            // Data moves: Disk -> OS Page Cache -> NIC Card Buffer (ZERO JVM User Space Copy!)
            while (transferred < size) {
                transferred += fileChannel.transferTo(transferred, size - transferred, socketChannel);
            }

            long durationMs = (System.nanoTime() - start) / 1_000_000;
            System.out.printf("Zero-Copy Transfer Complete: %d MB transferred in %d ms!%n",
                size / (1024 * 1024), durationMs);
        }
    }
}`,

  springConfigCode: `# Linux OS Kernel Performance Tuning for Kafka Brokers
# /etc/sysctl.conf
vm.dirty_background_ratio = 5
vm.dirty_ratio = 10
vm.swappiness = 1
net.core.wmem_default = 262144
net.core.rmem_default = 262144
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216`,

  interviewQuestions: [
    {
      question: {
        vi: 'Tại sao Kafka khuyến nghị chỉ nên cấp phát 6GB - 8GB Heap cho JVM dù máy chủ có tới 256GB RAM?',
        en: 'Why does Kafka recommend allocating only 6GB-8GB JVM Heap even on servers with 256GB RAM?'
      },
      answer: {
        vi: 'Bởi vì Kafka không lưu trữ dữ liệu message trong bộ nhớ JVM Heap. Nếu cấp phát Heap quá lớn (ví dụ 128GB), các thuật toán thu gom rác (G1GC hoặc ZGC) sẽ phải quản lý một không gian nhớ khổng lồ, gây ra các khoảng dừng Stop-the-World kéo dài làm timeout kết nối. Thay vào đó, Kafka để lại hơn 240GB RAM còn lại cho Linux OS Page Cache quản lý. Toàn bộ các message mới ghi sẽ nằm trong Page Cache và được phục vụ cho Consumer với tốc độ RAM thông qua kỹ thuật Zero-Copy mà không tốn một chu kỳ CPU nào của JVM.',
        en: 'Because Kafka intentionally avoids caching message records in JVM Heap. Massive heaps (128GB) subject brokers to unpredictable Stop-the-World GC pauses that trigger cluster heartbeat timeouts. Instead, Kafka delegates the remaining 240GB RAM to the Linux OS Page Cache. Fresh records reside in page cache memory and stream to consumers at bus speeds via Zero-Copy without incurring a single byte of JVM GC overhead.'
      },
      seniority: 'Senior'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố nghẽn mạng cụm Kafka 1.200.000 msg/s do cấu hình JVM Heap 96GB sai lầm',
      en: 'Kafka Cluster Freezes Caused by 96GB Huge JVM Heap Misconfiguration'
    },
    businessContext: {
      vi: 'Hệ thống viễn thông xử lý luồng dữ liệu Call Detail Records (CDR) với 1.2 triệu bản tin/giây trên cụm 8 máy chủ bare-metal 128GB RAM.',
      en: 'A telecommunications CDR pipeline processing 1.2M records/sec across 8 bare-metal servers equipped with 128GB RAM.'
    },
    problemDescription: {
      vi: 'Nhóm quản trị cấu hình JVM Heap Xmx=96GB với suy nghĩ "càng nhiều RAM cho Java thì càng nhanh". Hậu quả: Sau 4 ngày chạy, JVM kích hoạt Full GC kéo dài 38 giây! Cụm Kafka coi broker bị chết, kích hoạt rebalance và bầu lại Leader liên tục, làm tê liệt toàn bộ luồng xử lý cước viễn thông.',
      en: 'Admins configured JVM Heap Xmx=96GB assuming "more Java RAM equals more speed". Result: On day 4, G1GC triggered a 38-second Stop-the-World Full GC pause. The cluster assumed broker death, triggering cascading leader elections and freezing billing.'
    },
    whyNaiveFails: {
      vi: 'Chuyển sang ZGC hoặc Shenandoah GC giúp giảm thời gian dừng, nhưng vẫn lãng phí hơn 80GB RAM mà không giải quyết được bài toán tận dụng Page Cache.',
      en: 'Switching to ZGC reduced pause times, but still wasted 80GB of RAM that should have been allocated to the OS page cache.'
    },
    coreSolution: {
      vi: '1. Giảm JVM Heap xuống còn đúng 8GB (Xmx8g -Xms8g); 2. Dành toàn bộ 120GB RAM còn lại cho Linux OS Page Cache; 3. Tinh chỉnh nhân Linux vm.dirty_background_ratio=5 và vm.swappiness=1.',
      en: '1. Reduced JVM Heap to 8GB (Xmx8g -Xms8g); 2. Relinquished 120GB RAM to the Linux OS Page Cache; 3. Tuned kernel sysctl with vm.dirty_background_ratio=5 and vm.swappiness=1.'
    },
    productionCode: `# Correct Production JVM Options for Kafka Broker
KAFKA_HEAP_OPTS="-Xmx8G -Xms8G -XX:MetaspaceSize=96m -XX:+UseG1GC -XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=45"`,
    architectureImpact: {
      vi: 'Thời gian GC pause giảm từ 38 giây xuống dưới 12 miligiây; thông lượng cụm tăng từ 400.000 lên 1.450.000 msg/s; cụm máy chủ vận hành 100% ổn định suốt 3 năm.',
      en: 'GC pauses collapsed from 38s to sub-12ms; cluster throughput expanded from 400k to 1.45M msg/s; zero downtime across 3 years of production.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia,
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions
  ]
};
