# Roadmap bài giảng: CDC, Docker, Security và DevOps & Cloud Orchestration

> **Learning path:** Từ nền tảng đến triển khai production\
> **Đối tượng:** Backend Developer, Java/Spring Boot Developer, Software
> Engineer\
> **Stack thực hành tham chiếu:** Java 21, Spring Boot, PostgreSQL,
> Debezium, Kafka, Docker, Kubernetes, GitHub Actions, Helm, Prometheus
> và Grafana.\
> **Thời lượng đề xuất:** 4 learning paths độc lập, khoảng 45--55 giờ
> học nội dung chính, chưa tính thời gian làm lab và capstone.

------------------------------------------------------------------------

## 1. Tổng quan chương trình

  ----------------------------------------------------------------------------
  Learning path      Cấp độ                        Số bài   Thời lượng dự kiến
  ------------------ --------------- -------------------- --------------------
  Change Data        Cơ bản → Nâng                     10             5--6 giờ
  Capture (CDC)      cao                                  

  Docker &           Cơ bản → Nâng                     11             6--7 giờ
  Containerization   cao                                  

  Security, OAuth    Cơ bản → Nâng                     16             8--9 giờ
  2.0 &              cao                                  
  Authentication                                          

  DevOps & Cloud     Cơ bản → Nâng                     14             8--9 giờ
  Orchestration      cao                                  
  ----------------------------------------------------------------------------

### Lộ trình kiến thức tổng thể

``` text
Linux, Networking, SQL, Git và HTTP fundamentals
                    |
                    v
          Docker & Containerization
                    |
          +---------+----------+
          |                    |
          v                    v
   CDC & Event Streaming   Security & IAM
          |                    |
          +---------+----------+
                    |
                    v
        DevOps & Cloud Orchestration
                    |
                    v
          Production Capstone
```

### Nguyên tắc thiết kế bài giảng

Mỗi bài nên có cấu trúc thống nhất:

1.  **Concept:** Vấn đề thực tế và khái niệm cốt lõi.
2.  **Architecture:** Thành phần, luồng dữ liệu và ranh giới trách
    nhiệm.
3.  **Mechanism:** Cơ chế hoạt động bên trong, thuật toán hoặc giao
    thức.
4.  **Trade-offs:** Ưu điểm, nhược điểm và các lựa chọn thiết kế.
5.  **Visualization:** SVG tương tác, sequence diagram hoặc simulator
    khi phù hợp.
6.  **Hands-on:** Lab bằng Java 21, Docker hoặc công cụ tương ứng.
7.  **Production concerns:** Failure modes, monitoring, security và vận
    hành.

------------------------------------------------------------------------

# 2. Change Data Capture (CDC)

**Mục tiêu:** Hiểu cách ghi nhận thay đổi dữ liệu từ database và truyền
chúng đến các hệ thống downstream gần real-time, không phải polling toàn
bộ bảng liên tục.

**Stack:** PostgreSQL, Debezium, Kafka, Kafka Connect, Java 21, Docker
Compose.

## Cấp độ 1 --- Fundamentals

### CDC-01. Database Change Propagation & CDC Fundamentals

**18 min · Cơ bản**

-   Data synchronization và bài toán đồng bộ dữ liệu.
-   Batch ETL vs polling vs CDC.
-   Vì sao polling bằng `updated_at` có thể bỏ sót hoặc đọc trùng dữ
    liệu?
-   CDC use cases: search index, cache invalidation, analytics, audit
    log, replication.
-   Source database, change event và sink system.
-   Near real-time không đồng nghĩa với zero latency.

**Trực quan:** So sánh polling theo chu kỳ với CDC theo transaction log;
điều chỉnh tần suất polling và lượng dữ liệu thay đổi.

### CDC-02. Database Transaction Logs: WAL, Binlog & Redo Log

**25 min · Cơ bản → Trung cấp**

-   Transaction log và write-ahead logging.
-   PostgreSQL WAL.
-   MySQL Binary Log (Binlog).
-   Oracle Redo Log và supplemental logging.
-   Commit, rollback và transaction boundary.
-   LSN, binlog position và SCN ở mức khái niệm.
-   Vì sao log-based CDC ít gây tải truy vấn hơn polling?
-   Retention và nguy cơ log bị xóa trước khi consumer đọc.

**Trực quan:** Mô phỏng transaction cập nhật nhiều row, ghi log, commit
và rollback; quan sát thay đổi nào được phát ra.

### CDC-03. CDC Event Model & Data Change Semantics

**20 min · Cơ bản → Trung cấp**

-   Event envelope và event payload.
-   INSERT, UPDATE, DELETE.
-   Before/after image.
-   Primary key và event key.
-   Source metadata, transaction metadata và timestamp.
-   Snapshot event vs streaming event.
-   Schema evolution và backward/forward compatibility.
-   Ordering trong phạm vi một key hoặc partition.

**Trực quan:** Phân tích một CDC event, tách metadata, key, before,
after và operation.

## Cấp độ 2 --- Implementation

### CDC-04. Debezium Architecture & Kafka Connect

**25 min · Trung cấp**

-   Debezium là gì và vai trò trong CDC.
-   Kafka Connect architecture.
-   Source connector và sink connector.
-   Worker, task, connector configuration.
-   Distributed mode vs standalone mode.
-   Offset storage, config storage và status storage.
-   Connector lifecycle và task restart.
-   Converter: JSON, Avro và schema-aware formats.

**Trực quan:** Sơ đồ Source DB → Debezium Connector → Kafka Connect →
Kafka Topic; cho phép dừng worker và quan sát task recovery.

### CDC-05. PostgreSQL CDC with Debezium

**30 min · Trung cấp**

-   PostgreSQL logical decoding.
-   Replication slot và publication.
-   Logical replication plugin.
-   Cấu hình Debezium PostgreSQL connector.
-   Snapshot mode và initial snapshot.
-   WAL position và connector offset.
-   Delete event và tombstone record.
-   Replication slot retention, WAL growth và disk pressure.
-   Quyền database cần thiết cho CDC.

**Lab:** PostgreSQL + Debezium + Kafka bằng Docker Compose; thực hiện
INSERT, UPDATE, DELETE và đọc event.

### CDC-06. MySQL CDC & Snapshot Strategies

**25 min · Trung cấp**

-   MySQL row-based binary logging.
-   Binlog format và row image.
-   GTID và binlog position.
-   Initial snapshot và incremental snapshot.
-   Snapshot locking và ảnh hưởng đến database.
-   Schema history.
-   Failover và source identity.
-   So sánh PostgreSQL WAL CDC với MySQL Binlog CDC.

**Trực quan:** Mô phỏng snapshot dữ liệu lớn đồng thời với streaming các
thay đổi phát sinh.

### CDC-07. CDC Consumers, Transformations & Sink Integration

**25 min · Trung cấp**

-   Consume CDC events từ Kafka.
-   Debezium Event Flattening.
-   Single Message Transform (SMT).
-   Upsert và delete semantics.
-   Sink connector: Elasticsearch/OpenSearch, JDBC và object storage.
-   Idempotent sink.
-   Duplicate event và replay.
-   Key mapping và partitioning.
-   Xây dựng consumer bằng Spring Kafka.

**Lab:** Đồng bộ bảng PostgreSQL sang một read model hoặc Elasticsearch.

## Cấp độ 3 --- Advanced & Production

### CDC-08. Snapshot, Offset Recovery & Exactly-once Challenges

**30 min · Nâng cao**

-   Snapshot consistency.
-   Connector offset và source position.
-   Restart, resume và recovery.
-   Duplicate event sau restart.
-   At-least-once delivery.
-   Idempotent processing và deduplication.
-   Transaction metadata.
-   Vì sao CDC pipeline không tự động tạo ra end-to-end exactly-once?
-   Reconciliation giữa source và sink.

**Trực quan:** Dừng connector ở các thời điểm khác nhau: trước commit,
sau commit, trước khi publish và sau khi publish.

### CDC-09. CDC Performance, Reliability & Monitoring

**25 min · Nâng cao**

-   CDC lag và end-to-end latency.
-   WAL/binlog retention.
-   Replication slot lag.
-   Kafka producer throughput và partition count.
-   Connector task parallelism.
-   Backpressure và sink bottleneck.
-   Dead-letter handling.
-   Monitoring connector status, source lag, queue capacity và error
    rate.
-   Alerting và capacity planning.

**Trực quan:** Tăng tốc độ ghi database, làm chậm sink và quan sát lag
tích lũy, WAL tăng trưởng và quá trình phục hồi.

### CDC-10. CDC Architecture Patterns & Production Design

**25 min · Nâng cao**

-   Database per service và data integration.
-   CDC vs Transactional Outbox.
-   Outbox Pattern với Debezium.
-   Event-driven read model.
-   Cache invalidation.
-   Search indexing.
-   Data lake ingestion.
-   Schema governance.
-   Security, PII filtering và data retention.
-   Khi nào không nên dùng CDC?

**Capstone:** Xây dựng pipeline PostgreSQL → Debezium → Kafka →
Search/Read Model; hỗ trợ snapshot, update/delete, replay, monitoring và
recovery.

### CDC Advanced electives

-   Oracle LogMiner và XStream CDC.
-   SQL Server CDC.
-   MongoDB Change Streams.
-   Debezium Server.
-   Incremental Snapshot internals.
-   Transaction metadata và transaction boundary.
-   Data lineage và schema governance.

------------------------------------------------------------------------

# 3. Docker & Containerization

**Mục tiêu:** Hiểu container từ Linux primitives đến image optimization,
networking, persistent storage và vận hành ứng dụng nhiều container.

**Stack:** Docker Engine, Docker CLI, Dockerfile, Docker Compose,
BuildKit, Linux.

## Cấp độ 1 --- Fundamentals

### DOCKER-01. Virtual Machines vs Containers

**18 min · Cơ bản**

-   Virtualization và hypervisor.
-   VM vs container.
-   Container image và container instance.
-   Host kernel và process isolation.
-   Container portability.
-   Container không phải lightweight VM.
-   Docker Engine architecture: CLI, API, daemon, runtime.

**Trực quan:** So sánh VM và container về OS, kernel, resource overhead
và startup lifecycle.

### DOCKER-02. Linux Container Internals: Namespaces & Cgroups

**25 min · Cơ bản → Trung cấp**

-   Linux namespaces: PID, NET, MNT, UTS, IPC, USER.
-   Control Groups (cgroups).
-   CPU quota và memory limit.
-   Process isolation.
-   Linux capabilities.
-   Seccomp và AppArmor ở mức giới thiệu.
-   Container runtime và OCI.
-   Vì sao container chia sẻ kernel với host?

**Trực quan:** Một process trên host và trong container; bật/tắt
namespace và giới hạn CPU/RAM.

### DOCKER-03. Docker CLI & Container Lifecycle

**20 min · Cơ bản**

-   `docker pull`, `run`, `ps`, `exec`, `logs`.
-   `stop`, `kill`, `restart`, `rm`.
-   Foreground vs detached mode.
-   Environment variables.
-   Port publishing.
-   Container exit code.
-   Entrypoint và command.
-   Inspect container và resource usage.

**Lab:** Chạy một Spring Boot application, kiểm tra log, process, port
và lifecycle.

### DOCKER-04. Docker Images, Layers & Dockerfile

**25 min · Cơ bản → Trung cấp**

-   Image, layer và Union File System.
-   Image registry và repository.
-   Dockerfile instructions: `FROM`, `RUN`, `COPY`, `ADD`, `WORKDIR`,
    `ENV`, `ARG`, `EXPOSE`, `CMD`, `ENTRYPOINT`.
-   Build context.
-   Image cache.
-   `.dockerignore`.
-   Tagging và image versioning.

**Trực quan:** Build image qua từng layer, thay đổi một dòng Dockerfile
và quan sát cache invalidation.

## Cấp độ 2 --- Application & Multi-container

### DOCKER-05. Building Production-ready Images

**25 min · Trung cấp**

-   Multi-stage builds.
-   BuildKit.
-   JRE vs JDK runtime images.
-   Distroless và minimal images.
-   Non-root user.
-   Read-only filesystem.
-   Image size optimization.
-   Reproducible builds.
-   Dependency caching.
-   Build arguments và secrets.

**Lab:** Đóng gói Spring Boot application bằng multi-stage Dockerfile và
so sánh image size.

### DOCKER-06. Docker Networking & Service Discovery

**25 min · Trung cấp**

-   Bridge, host, none và overlay networking.
-   Container IP và DNS.
-   Port mapping.
-   Published ports vs exposed ports.
-   Network isolation.
-   Service-to-service communication.
-   Network troubleshooting.
-   Vì sao `localhost` bên trong container không phải host?

**Trực quan:** Hai container trong cùng network giao tiếp qua DNS; di
chuyển container sang network khác và quan sát kết quả.

### DOCKER-07. Persistent Storage: Volumes & Bind Mounts

**20 min · Trung cấp**

-   Container writable layer.
-   Bind mount.
-   Named volume và anonymous volume.
-   Volume lifecycle.
-   Database persistence.
-   File permissions và ownership.
-   Backup và restore.
-   Storage drivers ở mức tổng quan.

**Lab:** PostgreSQL container bị xóa và tạo lại nhưng dữ liệu vẫn tồn
tại nhờ volume.

### DOCKER-08. Docker Compose & Application Stacks

**30 min · Trung cấp**

-   Compose YAML.
-   Services, networks và volumes.
-   Environment configuration.
-   Service dependencies.
-   Healthcheck.
-   Profiles.
-   Restart policies.
-   Secrets và configuration.
-   Multi-container development environment.

**Lab:** Dựng Spring Boot + PostgreSQL + Redis + Kafka + Kafka UI bằng
Compose.

## Cấp độ 3 --- Advanced & Production

### DOCKER-09. Container Security & Supply Chain

**25 min · Nâng cao**

-   Rootless containers.
-   Linux capabilities.
-   Seccomp và AppArmor.
-   Secrets management.
-   Image scanning.
-   SBOM.
-   Image signing và provenance.
-   Trusted base images.
-   Vulnerability remediation.
-   Runtime security.

### DOCKER-10. Resource Management, Observability & Troubleshooting

**25 min · Nâng cao**

-   CPU và memory constraints.
-   OOMKilled.
-   CPU throttling.
-   Container healthcheck.
-   Logs và log drivers.
-   Metrics và resource monitoring.
-   Disk pressure.
-   Network debugging.
-   `docker inspect`, `stats`, `events`.
-   Container restart loop.

### DOCKER-11. Docker Production Workflow & Registry

**25 min · Nâng cao**

-   Private registry.
-   Docker Hub và cloud registry.
-   Image tagging strategy.
-   Immutable image tags.
-   Build once, deploy many.
-   CI image build.
-   Cache optimization.
-   Image promotion: dev → staging → production.
-   Rollback và artifact retention.

**Capstone:** Đóng gói một hệ thống Spring Boot microservices,
PostgreSQL, Redis và Kafka thành môi trường Compose có healthcheck,
persistent volume, network isolation, non-root user và cấu hình theo
environment.

### Docker Advanced electives

-   Containerd và runc internals.
-   OCI Image Specification.
-   BuildKit advanced caching.
-   Docker Swarm.
-   Multi-platform images: amd64/arm64.
-   Container runtime security.
-   Docker Compose Watch.

------------------------------------------------------------------------

# 4. Security, OAuth 2.0 & Authentication

**Mục tiêu:** Hiểu nguyên lý bảo mật, mật mã học, Authentication,
Authorization, OAuth 2.0, OIDC và bảo vệ ứng dụng Java/Spring Boot trong
môi trường production.

**Stack:** Java 21, Spring Security, Keycloak, OAuth 2.0, OIDC, JWT,
PostgreSQL.

## Cấp độ 1 --- Security Fundamentals

### SEC-01. Information Security Fundamentals & CIA Triad

**18 min · Cơ bản**

-   Confidentiality, Integrity, Availability.
-   Authentication vs Authorization vs Accounting.
-   Principle of Least Privilege.
-   Defense in Depth.
-   Attack Surface và Trust Boundary.
-   Threat modeling.
-   Security by Design.

**Trực quan:** Phân tích một ứng dụng web theo CIA và xác định các trust
boundary.

### SEC-02. Cryptography: Encryption, Hashing & Digital Signatures

**25 min · Cơ bản → Trung cấp**

-   Symmetric encryption: AES.
-   Asymmetric encryption: RSA, ECC.
-   Hashing: SHA-256, SHA-3.
-   Password hashing: Argon2id, BCrypt.
-   Salt và Pepper.
-   HMAC và Message Authentication Code.
-   Digital signatures.
-   Public/private key.
-   Key management và rotation.

**Trực quan:** So sánh Encrypt/Decrypt, Hash/Verify, Sign/Verify
Signature.

### SEC-03. TLS, HTTPS & Secure Communication

**20 min · Cơ bản → Trung cấp**

-   HTTP vs HTTPS.
-   TLS 1.2 và TLS 1.3.
-   TLS handshake.
-   Certificate Authority.
-   X.509 certificate và certificate chain.
-   Public Key Infrastructure.
-   Certificate validation.
-   Mutual TLS (mTLS).

**Trực quan:** Mô phỏng TLS handshake và certificate validation.

## Cấp độ 2 --- Authentication & Authorization

### SEC-04. Authentication: Session, Cookie & Token

**22 min · Trung cấp**

-   Stateful vs stateless authentication.
-   Session-based authentication.
-   Cookie: HttpOnly, Secure, SameSite.
-   Session ID và session fixation.
-   Bearer token.
-   Access token và refresh token.
-   Token lifecycle.
-   Logout và session invalidation.

**Trực quan:** So sánh session-based và token-based authentication qua
request/response.

### SEC-05. Authorization Models: RBAC, ABAC & ReBAC

**22 min · Trung cấp**

-   Role-Based Access Control.
-   Attribute-Based Access Control.
-   Relationship-Based Access Control.
-   User, role, permission, resource, policy.
-   Resource-level authorization.
-   Hierarchical roles.
-   Permission inheritance.
-   Least privilege.
-   Deny-by-default.

**Trực quan:** Thay đổi user, role, department, ownership và policy để
quan sát Allow/Deny.

### SEC-06. Password Security & Multi-Factor Authentication

**18 min · Trung cấp**

-   Secure password storage.
-   Brute force và credential stuffing.
-   Password spraying.
-   Account lockout và rate limiting.
-   MFA.
-   TOTP và HOTP.
-   WebAuthn và passkeys.
-   Recovery codes.
-   Phishing-resistant authentication.

**Trực quan:** Mô phỏng Password → OTP → Passkey và so sánh mức độ chống
phishing.

## Cấp độ 3 --- OAuth 2.0, JWT & OIDC

### SEC-07. OAuth 2.0 Architecture & Core Concepts

**22 min · Trung cấp**

-   OAuth 2.0 giải quyết vấn đề gì?
-   Resource Owner.
-   Client.
-   Authorization Server.
-   Resource Server.
-   Client ID và Client Secret.
-   Scope, consent và redirect URI.
-   Authorization grant và access token.
-   OAuth 2.0 là authorization framework, không tự nó là authentication
    protocol.

**Trực quan:** Mô phỏng bốn thành phần và trách nhiệm của từng thành
phần.

### SEC-08. OAuth 2.0 Authorization Flows & PKCE

**30 min · Trung cấp → Nâng cao**

-   Authorization Code Flow.
-   Authorization Code + PKCE.
-   Client Credentials Flow.
-   Device Authorization Grant.
-   Refresh Token Grant.
-   State và CSRF protection.
-   Nonce trong OIDC.
-   Code Verifier và Code Challenge.
-   Redirect URI validation.
-   Implicit Grant và Resource Owner Password Credentials: lý do không
    nên sử dụng trong ứng dụng mới.

**Trực quan:** Chạy từng bước redirect, authorization code exchange và
token response; thử bỏ State hoặc PKCE để quan sát rủi ro.

### SEC-09. JWT: Structure, Signature & Token Validation

**28 min · Trung cấp → Nâng cao**

-   JWT: Header, Payload, Signature.
-   Base64URL encoding.
-   Claims: `iss`, `sub`, `aud`, `exp`, `iat`, `nbf`.
-   JWS và JWE.
-   HS256, RS256 và ES256.
-   Signature verification.
-   JWKS và key rotation.
-   Token expiration và revocation.
-   Algorithm confusion và validation pitfalls.
-   Decode không đồng nghĩa với verify.

**Trực quan:** JWT Inspector cho phép sửa payload, ký token, verify chữ
ký và kiểm tra claims.

### SEC-10. OpenID Connect & Identity Federation

**22 min · Nâng cao**

-   OAuth 2.0 vs OpenID Connect.
-   ID Token vs Access Token.
-   UserInfo endpoint.
-   Discovery document.
-   JWKS endpoint.
-   Authentication request.
-   State và nonce.
-   Social login.
-   Identity federation.
-   Identity Provider và Relying Party.

**Trực quan:** Đăng nhập qua Identity Provider và phân biệt ID Token với
Access Token.

## Cấp độ 4 --- Application Security

### SEC-11. OWASP Top 10 & Common Web Vulnerabilities

**25 min · Nâng cao**

-   Broken Access Control.
-   Cryptographic Failures.
-   Injection.
-   Security Misconfiguration.
-   Authentication Failures.
-   Software Supply Chain Failures.
-   SSRF.
-   Security logging and monitoring failures.
-   SQL injection và NoSQL injection.
-   IDOR/BOLA.

**Trực quan:** Phân tích request có lỗ hổng, xác định nguyên nhân và
biện pháp phòng thủ.

### SEC-12. Browser Security: XSS, CSRF, CORS & CSP

**22 min · Nâng cao**

-   Reflected, Stored và DOM-based XSS.
-   Cross-Site Request Forgery.
-   Same-Origin Policy.
-   CORS và preflight.
-   Content Security Policy.
-   CSRF token.
-   Secure cookie configuration.
-   Clickjacking.
-   Security headers.

**Trực quan:** So sánh request cùng origin và cross-origin; mô phỏng
cách browser áp dụng cookie và CORS.

### SEC-13. API Security & Secure Coding

**20 min · Nâng cao**

-   API authentication và authorization.
-   Rate limiting và throttling.
-   Input validation.
-   Output encoding.
-   Secrets management.
-   API key vs OAuth access token.
-   Audit logging.
-   Dependency vulnerability scanning.
-   Secure error handling.
-   API versioning và security compatibility.

## Cấp độ 5 --- Enterprise & Distributed Security

### SEC-14. IAM, Keycloak, SSO & LDAP

**25 min · Nâng cao**

-   Identity and Access Management.
-   Single Sign-On.
-   Identity Provider và Service Provider.
-   Keycloak Realm, Client, User, Role, Group.
-   LDAP và Active Directory.
-   SAML 2.0 vs OAuth 2.0 vs OIDC.
-   User federation.
-   Identity brokering.
-   Session management.

**Trực quan:** Một tài khoản đăng nhập nhiều ứng dụng thông qua
Keycloak.

### SEC-15. Microservices Security & Zero Trust

**25 min · Nâng cao**

-   API Gateway authentication.
-   JWT validation giữa các service.
-   Service-to-service authentication.
-   OAuth 2.0 Token Exchange.
-   Mutual TLS.
-   Zero Trust Architecture.
-   Network segmentation.
-   Service identity.
-   Distributed authorization.
-   Lateral movement và blast radius.

**Trực quan:** Mô phỏng nhiều microservices, một service bị xâm nhập và
các lớp Zero Trust ngăn truy cập trái phép.

### SEC-16. Spring Security Internals & Production Implementation

**30 min · Nâng cao**

-   SecurityFilterChain.
-   DelegatingFilterProxy.
-   AuthenticationManager.
-   AuthenticationProvider.
-   UserDetailsService.
-   SecurityContextHolder.
-   Method-level security.
-   OAuth2 Resource Server.
-   OAuth2 Client.
-   Authorization Server.
-   Integration testing và security testing.

**Trực quan:** Request đi qua Spring Security Filter Chain, xác định
filter xử lý Authentication và Authorization.

### Security Advanced electives

-   OAuth 2.1 và best current practices.
-   FAPI 2.0.
-   DPoP và sender-constrained tokens.
-   OAuth 2.0 Token Exchange (RFC 8693).
-   WebAuthn/FIDO2 internals.
-   Advanced JWS, JWE, JWK và JWKS.
-   Vault, KMS và HSM.
-   SAST, DAST và penetration testing.
-   Kubernetes workload identity.

------------------------------------------------------------------------

# 5. DevOps & Cloud Orchestration

**Mục tiêu:** Xây dựng quy trình đưa phần mềm từ source code đến
production một cách tự động, có khả năng mở rộng, quan sát, khôi phục và
quản trị hạ tầng.

**Stack:** Linux, Git, Docker, GitHub Actions, Kubernetes, Helm,
Prometheus, Grafana. Có thể mở rộng với AWS, Azure hoặc Google Cloud.

## Cấp độ 1 --- DevOps Fundamentals

### DEVOPS-01. DevOps Culture, SDLC & Delivery Pipeline

**18 min · Cơ bản**

-   Software Development Life Cycle.
-   Dev vs Ops và bài toán silo.
-   DevOps culture và shared ownership.
-   Continuous Integration, Continuous Delivery, Continuous Deployment.
-   Feedback loop.
-   Infrastructure as Code.
-   DORA metrics: Deployment Frequency, Lead Time, Change Failure Rate,
    Time to Restore.

**Trực quan:** So sánh quy trình release thủ công và automated delivery
pipeline.

### DEVOPS-02. Linux, Shell Scripting & Server Fundamentals

**25 min · Cơ bản**

-   Linux filesystem và permissions.
-   Process, signal và service.
-   User, group và sudo.
-   SSH và key-based authentication.
-   Environment variables.
-   Bash scripting.
-   systemd và journalctl.
-   Disk, memory, CPU và network inspection.
-   Log inspection và troubleshooting.

**Lab:** Viết script kiểm tra trạng thái ứng dụng, dung lượng đĩa và tự
động restart service theo điều kiện.

### DEVOPS-03. Git Workflow & Release Management

**20 min · Cơ bản**

-   Git fundamentals.
-   Branching strategies.
-   Trunk-based development.
-   GitFlow và trade-offs.
-   Pull request và code review.
-   Semantic Versioning.
-   Tags và release.
-   Conventional Commits.
-   Changelog và release artifacts.

**Trực quan:** Mô phỏng merge, rebase, release branch và hotfix.

### DEVOPS-04. CI/CD Fundamentals & Pipeline Design

**25 min · Cơ bản → Trung cấp**

-   CI/CD pipeline stages.
-   Build, test, package, publish.
-   Artifact management.
-   Pipeline triggers.
-   Environment promotion.
-   Pipeline dependencies.
-   Quality gates.
-   Secret handling.
-   Pipeline failure và retry.
-   GitHub Actions / GitLab CI overview.

**Trực quan:** Kéo hoặc bật/tắt từng pipeline stage và quan sát release
bị chặn tại quality gate.

## Cấp độ 2 --- Infrastructure & Deployment

### DEVOPS-05. Infrastructure as Code & Configuration Management

**25 min · Trung cấp**

-   Infrastructure as Code (IaC).
-   Declarative vs imperative configuration.
-   Terraform fundamentals.
-   Provider, resource, data source.
-   Variables và outputs.
-   State file và remote state.
-   Plan, apply và destroy.
-   Drift detection.
-   Ansible fundamentals.
-   Idempotency.

**Trực quan:** Thay đổi desired infrastructure, tạo plan và quan sát
resource được thêm, sửa hoặc xóa.

### DEVOPS-06. Cloud Computing Fundamentals

**25 min · Trung cấp**

-   IaaS, PaaS và SaaS.
-   Public, private và hybrid cloud.
-   Regions và Availability Zones.
-   Compute, storage và networking.
-   Virtual machines.
-   Object, block và file storage.
-   VPC, subnet, route table và security group.
-   IAM và cloud identity.
-   Shared Responsibility Model.
-   Cost model và resource tagging.

**Lab:** Thiết kế kiến trúc web application trên một cloud provider.

### DEVOPS-07. Container Deployment & Registry Management

**20 min · Trung cấp**

-   Container registry.
-   Image build trong CI.
-   Image tagging và digest.
-   Build once, deploy many.
-   Environment-specific configuration.
-   Rolling deployment cơ bản.
-   Health checks.
-   Runtime secrets.
-   Image promotion.
-   Rollback.

**Lab:** Pipeline build Spring Boot image, push registry và deploy lên
môi trường staging.

## Cấp độ 3 --- Kubernetes & Cloud Orchestration

### DEVOPS-08. Kubernetes Architecture & Core Components

**30 min · Trung cấp**

-   Kubernetes và container orchestration.
-   Control Plane và Worker Node.
-   API Server.
-   Scheduler.
-   Controller Manager.
-   etcd.
-   Kubelet và kube-proxy.
-   Container runtime.
-   Desired state và reconciliation loop.
-   Declarative configuration.

**Trực quan:** Mô phỏng request tạo Pod đi qua API Server, Scheduler và
Worker Node.

### DEVOPS-09. Kubernetes Workloads & Application Deployment

**30 min · Trung cấp**

-   Pod.
-   ReplicaSet.
-   Deployment.
-   StatefulSet.
-   DaemonSet.
-   Job và CronJob.
-   Rolling Update.
-   Rollback.
-   Init Containers và Sidecar pattern.
-   Liveness, Readiness và Startup Probes.

**Trực quan:** Tăng replicas, thay image version và mô phỏng rolling
update khi một Pod lỗi.

### DEVOPS-10. Kubernetes Networking, Storage & Configuration

**30 min · Trung cấp → Nâng cao**

-   Cluster networking.
-   Pod-to-Pod communication.
-   Service: ClusterIP, NodePort, LoadBalancer.
-   DNS và service discovery.
-   Ingress và Gateway API overview.
-   NetworkPolicy.
-   ConfigMap và Secret.
-   PersistentVolume và PersistentVolumeClaim.
-   StorageClass.
-   Stateful workloads.

**Trực quan:** Request từ bên ngoài đi qua LoadBalancer/Ingress đến
Service và Pod; thay đổi NetworkPolicy để quan sát kết nối.

### DEVOPS-11. Kubernetes Scaling, Scheduling & Reliability

**30 min · Nâng cao**

-   Resource requests và limits.
-   CPU throttling và OOMKilled.
-   Horizontal Pod Autoscaler.
-   Vertical Pod Autoscaler overview.
-   Cluster Autoscaler.
-   Node affinity và anti-affinity.
-   Taints và tolerations.
-   Pod disruption budget.
-   Topology spread constraints.
-   High availability và failure recovery.

**Trực quan:** Tăng tải hệ thống, quan sát HPA tăng replicas và mô phỏng
node failure.

### DEVOPS-12. Helm, GitOps & Deployment Strategies

**30 min · Nâng cao**

-   Helm chart.
-   Chart, values và templates.
-   Release lifecycle.
-   Environment overlays.
-   GitOps principles.
-   Argo CD và Flux overview.
-   Desired state reconciliation.
-   Blue-Green Deployment.
-   Canary Deployment.
-   Rolling Deployment.
-   Progressive delivery và rollback.

**Trực quan:** So sánh Rolling, Blue-Green và Canary; điều chỉnh traffic
split và quan sát phiên bản ứng dụng.

## Cấp độ 4 --- Production Operations & Cloud Native

### DEVOPS-13. Observability: Metrics, Logs & Distributed Tracing

**30 min · Nâng cao**

-   Monitoring vs observability.
-   Metrics, logs và traces.
-   Prometheus.
-   Grafana.
-   OpenTelemetry.
-   Distributed tracing.
-   Trace ID và correlation ID.
-   RED và USE methods.
-   Golden Signals.
-   Alerting và SLO dashboards.

**Trực quan:** Request đi qua nhiều service, quan sát trace, latency,
error rate và xác định bottleneck.

### DEVOPS-14. Production Reliability, SRE & Incident Management

**30 min · Nâng cao**

-   Site Reliability Engineering.
-   SLIs, SLOs và SLAs.
-   Error budget.
-   Incident lifecycle.
-   On-call và escalation.
-   Runbook và playbook.
-   Postmortem và blameless culture.
-   Disaster Recovery.
-   Backup và restore.
-   RTO và RPO.
-   Capacity planning.

**Trực quan:** Mô phỏng production incident, error budget burn và quy
trình khôi phục dịch vụ.

### DevOps Advanced electives

-   AWS EKS, Azure AKS, Google GKE.
-   Service Mesh: Istio, Linkerd.
-   Kubernetes Operators và CRDs.
-   Policy as Code: OPA/Gatekeeper, Kyverno.
-   Secrets management: Vault, External Secrets.
-   Multi-cluster Kubernetes.
-   FinOps và cloud cost optimization.
-   Chaos Engineering.
-   Supply chain security và SLSA.
-   Platform Engineering và Internal Developer Platform.

------------------------------------------------------------------------

# 6. Capstone liên kết cả bốn learning paths

## Enterprise Event-driven Microservices Platform

**Mục tiêu:** Xây dựng một nền tảng microservices có CDC, container hóa,
xác thực tập trung, CI/CD và Kubernetes orchestration.

### Kiến trúc tham chiếu

``` text
                  Angular Web Application
                           |
                           v
                    API Gateway
                           |
                    Keycloak / OIDC
                           |
                           v
                 Spring Boot Services
                 /        |         \
                /         |          \
          Order       Payment     Inventory
          Service      Service      Service
             |            |            |
             +------------+------------+
                          |
                          v
                     PostgreSQL
                          |
                     WAL / CDC
                          |
                          v
                       Debezium
                          |
                          v
                        Kafka
                          |
             +------------+-------------+
             |            |             |
             v            v             v
          Search       Analytics     Notification
          Service       Service       Service

       All services packaged as Docker images
                          |
                          v
                   Container Registry
                          |
                          v
                  CI/CD + GitOps
                          |
                          v
                     Kubernetes
                          |
             +------------+-------------+
             |                          |
             v                          v
         Prometheus                  OpenTelemetry
             |                          |
             v                          v
          Grafana                  Trace Backend
```

### Phân chia nhiệm vụ theo learning path

  -----------------------------------------------------------------------
  Learning path                       Sản phẩm cần hoàn thành
  ----------------------------------- -----------------------------------
  CDC                                 PostgreSQL → Debezium → Kafka →
                                      downstream consumer

  Docker                              Dockerfile, Compose, optimized
                                      images, persistent volumes

  Security                            Keycloak SSO, OIDC, JWT, RBAC/ABAC,
                                      service authentication

  DevOps                              CI/CD, registry, Kubernetes, Helm,
                                      GitOps, monitoring
  -----------------------------------------------------------------------

### Production acceptance criteria

-   Có thể triển khai toàn bộ hệ thống từ source code bằng pipeline.
-   Không lưu credentials hoặc secrets trực tiếp trong Git.
-   Các service có health checks và resource limits.
-   Có cơ chế kiểm soát quyền truy cập API.
-   CDC có thể resume sau khi connector restart.
-   Consumer có thể xử lý duplicate event an toàn.
-   Có dashboard theo dõi CDC lag, Kafka lag và API latency.
-   Có rolling deployment và rollback.
-   Có backup/restore cho dữ liệu quan trọng.
-   Có runbook cho các sự cố thường gặp.

------------------------------------------------------------------------

# 7. Hệ thống SVG Simulator nên xây dựng

Không cần tạo SVG cho mọi khái niệm. Nên đầu tư vào những bài có trạng
thái, luồng xử lý hoặc cơ chế nội bộ có thể thay đổi theo input.

  -----------------------------------------------------------------------
  Chủ đề                  Simulator               Tương tác chính
  ----------------------- ----------------------- -----------------------
  CDC                     WAL/Binlog Explorer     Transaction, LSN,
                                                  snapshot, replay

  CDC                     CDC Pipeline Simulator  Connector, Kafka, sink,
                                                  lag, restart

  Docker                  Container Internals     Namespace, cgroups,
                                                  process isolation

  Docker                  Image Layer Builder     Dockerfile, layer,
                                                  cache invalidation

  Docker                  Container Networking    DNS, ports, bridge,
                                                  network isolation

  Security                OAuth 2.0 Flow          Redirect, PKCE, code
                          Simulator               exchange

  Security                JWT Inspector           Claims, signature,
                                                  expiration,
                                                  verification

  Security                Authorization Engine    RBAC, ABAC, Allow/Deny

  Security                TLS Handshake           Certificate, key
                                                  exchange, validation

  DevOps                  CI/CD Pipeline          Build, test, deploy,
                          Simulator               rollback

  DevOps                  Kubernetes Scheduler    Pod placement,
                                                  resources, node failure

  DevOps                  Deployment Strategy     Rolling, Blue-Green,
                          Simulator               Canary

  DevOps                  Observability Dashboard Metrics, logs, traces,
                                                  incidents
  -----------------------------------------------------------------------

### Tiêu chí chất lượng simulator

Mỗi simulator nên có:

1.  Sơ đồ kiến trúc hoặc sequence diagram.
2.  Trạng thái ban đầu có thể quan sát.
3.  Các nút điều khiển Start, Pause, Step, Reset.
4.  Input thay đổi được.
5.  Animation thể hiện luồng dữ liệu hoặc trạng thái.
6.  Giải thích tại sao một hành động tạo ra kết quả đó.
7.  Failure mode để người học thử nghiệm.
8.  Một vài câu hỏi kiểm tra hiểu biết sau khi mô phỏng.

------------------------------------------------------------------------

# 8. Thứ tự triển khai roadmap

Nếu xây dựng lần lượt thành hệ thống bài giảng, nên ưu tiên theo
dependency thay vì chỉ theo mức độ hấp dẫn của chủ đề.

  ------------------------------------------------------------------------
                        Thứ tự Learning path         Lý do
  ---------------------------- --------------------- ---------------------
                             1 Docker &              Nền tảng đóng gói và
                               Containerization      môi trường thực hành

                             2 Security, OAuth 2.0 & Bảo vệ ứng dụng và
                               Auth                  API

                             3 Change Data Capture   Đồng bộ dữ liệu và
                                                     event-driven
                                                     integration

                             4 DevOps & Cloud        Tích hợp và vận hành
                               Orchestration         toàn hệ thống
  ------------------------------------------------------------------------

### Dependency giữa các bài

-   Học Docker trước Kubernetes để hiểu container, image, network và
    storage.
-   Học Cryptography trước JWT để hiểu chữ ký và xác minh token.
-   Học Authentication/Authorization trước OAuth 2.0 và OIDC.
-   Học Kafka fundamentals trước CDC với Debezium.
-   Học Docker Compose trước khi triển khai hệ thống nhiều container.
-   Học CI/CD và container registry trước Kubernetes deployment.
-   Học Kubernetes workload trước Helm, GitOps và autoscaling.
-   Học metrics/logs/traces trước SRE và incident management.

------------------------------------------------------------------------

# 9. Chuẩn đầu ra sau bốn learning paths

Sau khi hoàn thành, người học cần có khả năng:

  -----------------------------------------------------------------------
  Năng lực                            Kết quả mong đợi
  ----------------------------------- -----------------------------------
  CDC                                 Thiết kế pipeline đồng bộ dữ liệu
                                      gần real-time và xử lý recovery

  Docker                              Tạo image tối ưu, an toàn và triển
                                      khai multi-container application

  Security                            Thiết kế Authentication,
                                      Authorization, OAuth 2.0 và OIDC

  DevOps                              Xây dựng CI/CD và triển khai ứng
                                      dụng trên Kubernetes

  Reliability                         Giám sát, phát hiện, xử lý và khôi
                                      phục sự cố

  Architecture                        Thiết kế hệ thống microservices có
                                      khả năng mở rộng và vận hành
                                      production
  -----------------------------------------------------------------------

## 10. Tài liệu tham khảo chính thức

### Change Data Capture

-   Debezium: https://debezium.io/documentation/
-   Apache Kafka: https://kafka.apache.org/documentation/
-   PostgreSQL WAL:
    https://www.postgresql.org/docs/current/wal-intro.html
-   Kafka Connect: https://kafka.apache.org/documentation/#connect

### Docker & Containerization

-   Docker Docs: https://docs.docker.com/
-   OCI Runtime Specification:
    https://github.com/opencontainers/runtime-spec
-   OCI Image Specification:
    https://github.com/opencontainers/image-spec
-   Linux namespaces:
    https://man7.org/linux/man-pages/man7/namespaces.7.html
-   Linux cgroups: https://docs.kernel.org/admin-guide/cgroup-v2.html

### Security, OAuth 2.0 & Authentication

-   OWASP Top 10: https://owasp.org/www-project-top-ten/
-   OAuth 2.0 RFC 6749: https://www.rfc-editor.org/rfc/rfc6749
-   OAuth Security BCP RFC 9700: https://www.rfc-editor.org/rfc/rfc9700
-   OpenID Connect: https://openid.net/developers/how-connect-works/
-   JWT RFC 7519: https://www.rfc-editor.org/rfc/rfc7519
-   Spring Security: https://docs.spring.io/spring-security/reference/
-   Keycloak: https://www.keycloak.org/documentation

### DevOps & Cloud Orchestration

-   Kubernetes: https://kubernetes.io/docs/
-   Helm: https://helm.sh/docs/
-   Terraform: https://developer.hashicorp.com/terraform/docs
-   GitHub Actions: https://docs.github.com/en/actions
-   Prometheus: https://prometheus.io/docs/
-   OpenTelemetry: https://opentelemetry.io/docs/
-   Argo CD: https://argo-cd.readthedocs.io/

------------------------------------------------------------------------

**Định hướng cuối cùng:** Bốn learning paths nên là bốn module độc lập
nhưng dùng chung một hệ thống capstone. Người học có thể học riêng từng
chủ đề, nhưng chỉ khi kết hợp cả bốn mới thấy được cách một hệ thống
backend hiện đại được xây dựng, bảo vệ, đồng bộ dữ liệu, triển khai và
vận hành trong production.
