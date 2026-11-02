import type { MessagingTopic } from '../types';
import { MESSAGING_RESEARCH_CITATIONS } from '../citations';

export const securityMtlsAclMultiTenancyTopic: MessagingTopic = {
  id: 'security-mtls-acl-multi-tenancy',
  category: 'advanced-streaming',
  level: 'advanced',
  chapter: 'Chuyên Đề Nâng Cao — Advanced Distributed Streaming',
  name: 'Security, ACLs, mTLS & Multi-Tenancy in Message Brokers',
  tagline: {
    vi: 'Bảo mật hạ tầng phân tán: Xác thực 2 chiều mTLS, SASL/SCRAM-512, phân quyền ACLs chi tiết và giới hạn hạn ngạch Quotas.',
    en: 'Securing distributed messaging: Mutual TLS (mTLS), SASL/SCRAM-512 authentication, fine-grained ACLs, and multi-tenant quotas.'
  },
  difficulty: 3,
  order: 20,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Trong môi trường doanh nghiệp quy mô lớn (Enterprise), hàng chục team phát triển phần mềm cùng chia sẻ một cụm Message Broker tập trung (Multi-Tenancy). Nếu không có cơ chế bảo mật và cô lập tài nguyên: 1. Một service bị tấn công có thể nghe lén hoặc giả mạo các giao dịch tài chính nhạy cảm; 2. Một service bị lỗi vòng lặp vô tận (Rogue Service) có thể spam hàng triệu message làm nghẽn toàn bộ broker, kéo sập các ứng dụng khác (Noisy Neighbor Problem).',
      en: 'In enterprise multi-tenant environments, dozens of teams share centralized message broker clusters. Lacking strict security and resource isolation: 1. Compromised services can eavesdrop on or spoof sensitive financial events; 2. A rogue bug-ridden service can spam millions of records, saturating brokers and collapsing peer applications (The Noisy Neighbor Problem).'
    },
    hardwareConstraint: {
      vi: 'Mã hóa SSL/TLS tiêu tốn chu kỳ tính toán của CPU cho quá trình mã hóa/giải mã đối xứng (AES-GCM) và bắt tay mật mã khóa công khai (RSA/ECDSA). Cấu hình sai Cipher Suites có thể làm giảm 40% thông lượng mạng của broker.',
      en: 'Cryptographic TLS handshakes and symmetric encryption (AES-GCM) consume substantial CPU cycles. Misconfigured cipher suites can degrade broker throughput by up to 40%.'
    },
    fundamentalSolution: {
      vi: 'Thiết lập mô hình phòng thủ 4 lớp toàn diện: 1. Encryption in Transit: Kích hoạt Mutual TLS (mTLS 2 chiều) với mã hóa phần cứng AES-NI; 2. Authentication: SASL/SCRAM-SHA-512 hoặc OAuth2/OIDC; 3. Authorization (ACLs): Phân quyền chi tiết ở mức Topic/Group (chỉ cho phép Principal "payment-svc" quyền WRITE vào topic "payments"); 4. Quotas & Throttling: Giới hạn hạn ngạch Producer/Consumer Byte-Rate Quotas (ví dụ: tối đa 20MB/s per client) để triệt tiêu hoàn toàn vấn nạn Noisy Neighbor.',
      en: 'Deploy a comprehensive 4-tier defense architecture: 1. Encryption in Transit: Mutual TLS (mTLS) with hardware-accelerated AES-NI; 2. Authentication: SASL/SCRAM-SHA-512 or OAuth2; 3. Authorization: Fine-grained Topic/Group Access Control Lists (ACLs); 4. Quotas & Throttling: Enforce client byte-rate quotas (e.g. 20MB/s cap per principal) to eliminate the Noisy Neighbor problem.'
    },
    math: {
      formula: '\\text{Access}(P, R, O) \\in \\{ \\text{ALLOW}, \\text{DENY} \\}, \\quad \\text{Rate}(Client) \\le \\text{Quota}_{\\text{bytes/sec}}',
      timeComplexity: 'O(1) ACL bitmask evaluation & token bucket rate check',
      spaceComplexity: 'O(A) — A là số lượng ACL rules trong cluster',
      throughputFormula: '\\text{Crypto Overhead} \\le 5\\% \\quad \\text{với chip CPU hỗ trợ phần cứng Intel AES-NI / ARM Crypto}'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Bảo mật cho Message Broker không chỉ đơn thuần là đặt mật khẩu đăng nhập, mà là sự kết hợp chặt chẽ giữa Xác thực danh tính (Authentication), Phân quyền tài nguyên (Authorization), Mã hóa đường truyền (Encryption) và Kiểm soát hạn ngạch tài nguyên (Multi-Tenant Quotas).',
      en: 'Message broker security extends beyond simple passwords; it requires a unified architecture combining Cryptographic Identity Authentication, Granular Authorization, In-Transit Encryption, and Multi-Tenant Resource Governance.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Mutual TLS (mTLS 2 chiều): Không chỉ Client xác minh danh tính của Broker (như HTTPS thông thường), mà Broker cũng yêu cầu Client phải xuất trình chứng chỉ X.509 hợp lệ được ký bởi Certificate Authority (CA) nội bộ của doanh nghiệp. Danh tính của client được trích xuất trực tiếp từ trường Common Name (CN) trong chứng chỉ, triệt tiêu hoàn toàn nguy cơ giả mạo IP.',
        en: 'Mutual TLS (mTLS): Unlike standard HTTPS where only the server proves identity, mTLS requires both broker and client to present trusted X.509 certificates signed by an enterprise internal CA. Client identity is cryptographically derived from the certificate Common Name (CN), rendering IP spoofing impossible.'
      },
      {
        vi: 'Fine-Grained ACLs & Nguyên tắc Đặc quyền Tối thiểu (Least Privilege): Một Principal ứng dụng chỉ được cấp đúng quyền tối thiểu cần thiết. Ví dụ: Service Email chỉ được phép READ topic "user-notifications" trên Consumer Group "email-workers", nghiêm cấm quyền WRITE hoặc DELETE TOPIC.',
        en: 'Granular ACLs & Principle of Least Privilege: Clients receive strictly scoped permissions. An Email service is granted READ rights on "user-notifications" restricted to consumer group "email-workers", with zero WRITE or cluster admin privileges.'
      },
      {
        vi: 'Client Quotas & Rate Throttling: Khi một client vượt quá hạn ngạch (ví dụ: producer_byte_rate = 10485760 B/s = 10MB/s), Kafka không ném lỗi làm sập ứng dụng mà chủ động làm chậm (Throttling) phản hồi trả về bằng cách trì hoãn socket response, buộc Producer client tự động giảm tốc độ gửi.',
        en: 'Client Quotas & Dynamic Throttling: When a client exceeds its assigned byte-rate quota, Kafka does not abruptly terminate connections. Instead, it dynamically throttles the client by delaying socket response packets, backpressuring the client producer into slowing down.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Để wildcard ACL (User:* has All on Topic:*) trong production: Cấp quyền bừa bãi là nguyên nhân hàng đầu khiến các dev junior vô tình xóa nhầm production topics hoặc đọc lén dữ liệu thẻ tín dụng.',
        en: 'Wildcard Over-Privilege: Granting wildcard ACLs (User:* on Topic:*) allows accidental topic deletion and catastrophic regulatory compliance data breaches.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Kiến trúc Bảo mật Đa Tầng: mTLS Handshake, SASL/SCRAM, ACLs & Token Quotas',
      en: 'Multi-Tier Security Architecture: mTLS, SASL/SCRAM, ACLs & Quotas'
    },
    description: {
      vi: 'Sơ đồ bảo mật 4 lớp bảo vệ cụm Message Broker trong môi trường Cloud và Bare-metal.',
      en: 'Architectural schematic detailing in-transit encryption, identity mapping, ACL evaluation, and quota throttling.'
    },
    asciiDiagram: `
[CLIENT APP: PaymentService]
       |
       +===(1. Port 9093: Mutual TLS Handshake with X.509 Certificate)===+
       |   (Hardware AES-NI Encryption in Transit)                       |
       v                                                                 v
[KAFKA BROKER SECURITY GATEWAY]
       |
       +---> [2. SASL/SCRAM-SHA-512 Authentication] -> Identity: "User:payment-svc"
       |
       +---> [3. ACL Authorization Engine]
       |     CHECK: Can "User:payment-svc" WRITE to "payments-v1"?
       |     ===> ALLOW! (Denies all other unauthorized topics)
       |
       +---> [4. Client Quota Regulator]
             CHECK: Current Ingress = 8 MB/s < Quota Limit = 20 MB/s
             ===> PROCEED TO COMMIT LOG!
`,
    components: [
      {
        name: 'mTLS Gateway (Port 9093)',
        role: 'Cryptographic Perimeter',
        description: {
          vi: 'Mã hóa toàn bộ dữ liệu bay trên đường truyền mạng cáp quang, chống nghe lén tuyệt đối.',
          en: 'Terminates mutual TLS encryption, preventing packet sniffing across cloud backbones.'
        }
      },
      {
        name: 'Client Quota Governor',
        role: 'Noisy Neighbor Shield',
        description: {
          vi: 'Giám sát lưu lượng byte/s của từng Principal và tự động điều tiết áp suất ngược.',
          en: 'Monitors per-client byte velocity, throttling over-quota instances smoothly.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'step-0',
      title: { vi: 'Bắt tay mTLS & Xuất trình Chứng chỉ Client', en: 'Mutual TLS Handshake' },
      phase: 'Cryptographic Handshake',
      description: {
        vi: 'Client kết nối tới cổng 9093, gửi chứng chỉ X.509 client.crt được ký bởi Enterprise CA.',
        en: 'Client presents internal CA-signed X.509 certificate to broker port 9093.'
      },
      brokerBehavior: {
        vi: 'Broker xác minh chữ ký chứng chỉ và trích xuất CN=payment-service.',
        en: 'Broker verifies certificate chain and extracts CN=payment-service.'
      },
      javaCodeLineMatch: 'ssl.keystore.location=/etc/security/client.keystore.jks'
    },
    {
      id: 'step-1',
      title: { vi: 'Xác thực định danh qua SASL/SCRAM-SHA-512', en: 'SASL/SCRAM Authentication' },
      phase: 'Identity Verification',
      description: {
        vi: 'Trao đổi thử thách-phản hồi (Challenge-Response) với SCRAM-SHA-512, xác thực người dùng mà không truyền mật khẩu qua mạng.',
        en: 'Executes SCRAM-SHA-512 challenge-response, authenticating identity without exposing plaintext credentials.'
      },
      brokerBehavior: {
        vi: 'Gán Principal "User:payment-service" cho kết nối socket này.',
        en: 'Binds Principal "User:payment-service" to the active TCP session.'
      },
      javaCodeLineMatch: 'sasl.mechanism=SCRAM-SHA-512'
    },
    {
      id: 'step-2',
      title: { vi: 'Kiểm tra quyền ACLs & Giới hạn Hạn ngạch (Quota)', en: 'ACL evaluation & quota check' },
      phase: 'Authorization & Governance',
      description: {
        vi: 'Broker kiểm tra quyền ghi vào topic "payments-v1" và kiểm tra lưu lượng hiện tại dưới 20MB/s.',
        en: 'Evaluates ACL write permission for topic and verifies byte rate remains under 20MB/s limit.'
      },
      brokerBehavior: {
        vi: 'Cho phép message đi vào commit log mà không bị throttle.',
        en: 'Grants access to commit log with zero throttling delay.'
      },
      javaCodeLineMatch: 'kafka-acls.sh --add --allow-principal User:payment-service --operation Write --topic payments-v1'
    }
  ],

  brokerComparisons: {
    rabbitmq: {
      role: { vi: 'Virtual Host Multi-Tenancy & TLS/SASL', en: 'Virtual Host Multi-Tenancy' },
      keyMechanism: {
        vi: 'RabbitMQ dùng Virtual Host (vhost) làm ranh giới cô lập tuyệt đối; phân quyền theo regex configure/write/read trên từng vhost.',
        en: 'Uses Virtual Hosts (vhosts) as hard isolation perimeters with regex permissions for configure/write/read.'
      },
      configExample: 'rabbitmqctl set_permissions -p /finance payment-user "^payments.*" "^payments.*" ".*"',
      architectureNote: {
        vi: 'Rất trực quan và dễ quản lý phân quyền theo phòng ban doanh nghiệp.',
        en: 'Extremely intuitive for organizational department-level permission boundaries.'
      }
    },
    kafka: {
      role: { vi: 'Fine-Grained ACLs & Dynamic Quotas Engine', en: 'Fine-Grained ACLs & Dynamic Quotas' },
      keyMechanism: {
        vi: 'Hỗ trợ ACLs phân quyền đến từng Topic, Consumer Group, Transactional ID và Cluster Operations kết hợp Dynamic Quotas.',
        en: 'Provides granular ACLs across topics, consumer groups, transactional IDs, and dynamic byte quotas.'
      },
      configExample: 'kafka-configs.sh --alter --add-config "producer_byte_rate=20971520" --entity-name payment-service',
      architectureNote: {
        vi: 'Đạt chuẩn bảo mật khắt khe nhất của Bộ Tài chính, PCI-DSS Level 1 và HIPAA.',
        en: 'Complies with rigorous PCI-DSS Level 1, SOC2, and HIPAA federal regulatory standards.'
      }
    }
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Bảo vệ toàn diện 100% tài sản dữ liệu của doanh nghiệp trước các cuộc tấn công mạng.',
        en: '100% enterprise data protection against eavesdropping and insider privilege escalation.'
      },
      {
        vi: 'Triệt tiêu hoàn toàn vấn nạn Noisy Neighbor: Không một service nào có thể làm nghẽn cluster chung.',
        en: 'Completely eliminates the Noisy Neighbor problem via hard client-level quotas.'
      }
    ],
    cons: [
      {
        vi: 'Chi phí vận hành quản lý chứng chỉ X.509 (Certificate Rotation) định kỳ hàng năm.',
        en: 'Operational complexity of annual X.509 certificate rotations and secret renewals.'
      }
    ],
    latencyVsThroughput: {
      vi: 'Mã hóa mTLS phần cứng tiêu tốn < 3% CPU; độ trễ mạng tăng không đáng kể (~0.5ms).',
      en: 'Hardware-accelerated mTLS adds < 3% CPU load with negligible 0.5ms transport latency.'
    },
    orderingGuarantee: {
      vi: 'Bảo đảm an toàn dữ liệu không ảnh hưởng đến thứ tự tuần tự của các partition.',
      en: 'Zero compromise on sequential partition ordering integrity.'
    }
  },

  javaCode: `package com.enterprise.messaging.security;

import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.common.config.SslConfigs;
import org.apache.kafka.common.config.SaslConfigs;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.ProducerFactory;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class HardenedEnterpriseSecurityConfig {

    @Bean
    public ProducerFactory<String, String> secureProducerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(CommonClientConfigs.BOOTSTRAP_SERVERS_CONFIG, "broker1.corp:9093,broker2.corp:9093");

        // 1. Mutual TLS (mTLS) Encryption in Transit
        props.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, "SASL_SSL");
        props.put(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG, "/etc/security/enterprise-ca.truststore.jks");
        props.put(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, "truststore-secret");
        props.put(SslConfigs.SSL_KEYSTORE_LOCATION_CONFIG, "/etc/security/payment-client.keystore.jks");
        props.put(SslConfigs.SSL_KEYSTORE_PASSWORD_CONFIG, "keystore-secret");
        props.put(SslConfigs.SSL_ENDPOINT_IDENTIFICATION_ALGORITHM_CONFIG, "HTTPS"); // Hostname verification

        // 2. SASL/SCRAM-SHA-512 Strong Authentication
        props.put(SaslConfigs.SASL_MECHANISM, "SCRAM-SHA-512");
        props.put(SaslConfigs.SASL_JAAS_CONFIG,
            "org.apache.kafka.common.security.scram.ScramLoginModule required " +
            "username=\\"payment-service\\" password=\\"SuperStrongPassword123!\\";");

        return new DefaultKafkaProducerFactory<>(props);
    }
}`,

  springConfigCode: `# Production Security Config (application.yml)
spring:
  kafka:
    properties:
      security.protocol: SASL_SSL
      ssl:
        trust-store-location: file:/etc/security/truststore.jks
        trust-store-password: \${KAFKA_TRUSTSTORE_PASS}
        key-store-location: file:/etc/security/keystore.jks
        key-store-password: \${KAFKA_KEYSTORE_PASS}
      sasl:
        mechanism: SCRAM-SHA-512`,

  interviewQuestions: [
    {
      question: {
        vi: 'Noisy Neighbor Problem trong cụm Message Broker dùng chung là gì? Làm thế nào để giải quyết?',
        en: 'What is the Noisy Neighbor Problem in shared multi-tenant message brokers? How is it resolved?'
      },
      answer: {
        vi: 'Noisy Neighbor xảy ra khi một ứng dụng (Tenant A) bị lỗi vòng lặp hoặc quá tải, đẩy một lượng dữ liệu khổng lồ (ví dụ 500MB/s) vào cụm broker dùng chung. Tenant A chiếm dụng toàn bộ băng thông mạng, IOPS ổ đĩa và thread pool của broker, khiến các ứng dụng quan trọng khác (Tenant B: Thanh toán, Đơn hàng) bị chậm hoặc nghẽn hoàn toàn. Cách giải quyết: Thiết lập Client Quotas (Hạn ngạch tài nguyên): Cấu hình producer_byte_rate và consumer_byte_rate cho từng Principal (ví dụ: gán cứng Tenant A tối đa 20MB/s). Khi Tenant A vượt quá 20MB/s, Kafka tự động trì hoãn phản hồi (throttle) để ép Tenant A gửi chậm lại, bảo vệ 100% hiệu năng cho Tenant B.',
        en: 'The Noisy Neighbor Problem occurs when one rogue tenant floods a shared broker cluster (e.g. 500MB/s), monopolizing network bandwidth, disk IOPS, and broker I/O threads, starving critical peer services (Payment, Orders). Solution: Enforce Client Byte-Rate Quotas (producer_byte_rate and consumer_byte_rate) per authenticated Principal. When a tenant breaches its quota, the broker throttles socket responses, backpressuring the rogue tenant while preserving SLAs for peer tenants.'
      },
      seniority: 'Lead'
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Sự cố rò rỉ dữ liệu thẻ tín dụng và nghẽn toàn bộ cụm Kafka do thiếu ACLs & Quotas',
      en: 'PCI-DSS Data Leak and Cluster Freeze Due to Missing Kafka ACLs and Client Quotas'
    },
    businessContext: {
      vi: 'Một tập đoàn bán lẻ đa quốc gia chia sẻ một cụm Kafka 18 node cho 35 đội ngũ phát triển microservices.',
      en: 'A multinational retail enterprise hosting 35 microservice teams on a shared 18-node Kafka cluster.'
    },
    problemDescription: {
      vi: 'Hai sự cố xảy ra cùng ngày: 1. Đội ngũ Marketing cấu hình nhầm consumer group, vô tình đọc được toàn bộ topic thanh toán chứa số thẻ tín dụng CVV (vi phạm nghiêm trọng tiêu chuẩn PCI-DSS); 2. Một kịch bản test tải của đội Recommendation bị lặp vô tận, bơm 4.5 GB/s vào broker, làm đĩa cứng của toàn bộ 18 node chạm ngưỡng 100% I/O wait, khiến hệ thống thanh toán chính sập hoàn toàn trong 2 giờ.',
      en: 'Dual disaster on the same day: 1. Marketing consumers subscribed via wildcard to payment topics containing plain text credit cards (violating PCI-DSS); 2. A runaway load test script flooded 4.5 GB/s, saturating disk I/O wait to 100% across all 18 nodes, bringing enterprise checkouts down for 2 hours.'
    },
    whyNaiveFails: {
      vi: 'Nhóm quản trị yêu cầu các team cam kết không đọc chéo topic bằng văn bản. Biện pháp hành chính này hoàn toàn vô hiệu khi xảy ra lỗi code vô tình của lập trình viên.',
      en: 'Management relied on verbal guidelines and documentation policies, which failed instantly against accidental human coding errors.'
    },
    coreSolution: {
      vi: '1. Kích hoạt mTLS và SASL/SCRAM-SHA-512 trên toàn bộ cụm; 2. Thiết lập quy tắc "Deny by Default" với ACLs: Mọi Principal chỉ được truy cập đúng topic được cấp phép; 3. Cấu hình Quotas nghiêm ngặt: Mỗi team chỉ được cấp tối đa 30MB/s ingress/egress; 4. Mã hóa đĩa cứng bằng AWS KMS Encryption-at-Rest.',
      en: '1. Enforced mTLS and SASL/SCRAM-512 authentication cluster-wide; 2. Implemented strict "Deny by Default" ACLs: principals only access explicitly authorized topics; 3. Enforced strict 30MB/s byte-rate quotas per tenant; 4. Enabled AWS KMS encryption-at-rest.'
    },
    productionCode: `# 1. Deny by default in server.properties
authorizer.class.name=org.apache.kafka.metadata.authorizer.StandardAuthorizer
allow.everyone.if.no.acl.found=false

# 2. Strict ACLs Command
kafka-acls.sh --bootstrap-server broker:9093 --add \\
  --allow-principal User:payment-service --operation All --topic payments-v1

# 3. Dynamic Multi-Tenant Quota
kafka-configs.sh --bootstrap-server broker:9093 --alter \\
  --add-config "producer_byte_rate=31457280,consumer_byte_rate=31457280" \\
  --entity-type users --entity-name marketing-service`,
    architectureImpact: {
      vi: 'Đạt chứng chỉ tuân thủ PCI-DSS Level 1 và SOC2 Type II; triệt tiêu hoàn toàn sự cố Noisy Neighbor; bảo vệ an toàn 100% bí mật dữ liệu người dùng.',
      en: 'Achieved full PCI-DSS Level 1 and SOC2 compliance certification; zero noisy neighbor outages; 100% cryptographic isolation of customer financial data.'
    }
  },

  researchCitations: [
    MESSAGING_RESEARCH_CITATIONS.confluent_partitions,
    MESSAGING_RESEARCH_CITATIONS.kleppmann_ddia
  ]
};
