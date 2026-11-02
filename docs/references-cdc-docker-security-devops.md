# Tài liệu tham khảo cho roadmap: CDC, Docker, Security và DevOps

> Danh mục website, tài liệu chính thức, bài viết chuyên sâu và môi
> trường thực hành để xây dựng hệ thống bài giảng từ cơ bản đến nâng
> cao.
>
> **Đối tượng:** Backend Developer, Java/Spring Boot Developer, Software
> Engineer\
> **Cách sử dụng:** Ưu tiên tài liệu chuẩn để xác minh kiến thức; dùng
> engineering blog để bổ sung bối cảnh production; dùng interactive labs
> để kiểm chứng bằng thực nghiệm.

## 1. Change Data Capture (CDC)

CDC tập trung vào việc đọc và truyền các thay đổi từ database đến hệ
thống downstream. Nên kết hợp tài liệu của database, Debezium, Kafka và
các nguồn kiến trúc dữ liệu.

  -------------------------------------------------------------------------------------------------------------------------
  Website                 Tài liệu                                                                  Nội dung nên khai thác
  ----------------------- ------------------------------------------------------------------------- -----------------------
  **Debezium**            [Documentation](https://debezium.io/documentation/reference/) ·           CDC architecture,
                          [Tutorials](https://debezium.io/documentation/reference/tutorials.html)   connector, snapshot,
                                                                                                    streaming, offsets,
                                                                                                    recovery, Outbox Event
                                                                                                    Router, SMT

  **Apache Kafka**        [Documentation](https://kafka.apache.org/documentation/) ·                Kafka Connect,
                          [Implementation](https://kafka.apache.org/implementation/)                producer/consumer,
                                                                                                    offsets, partitions,
                                                                                                    replication, log
                                                                                                    segments

  **PostgreSQL**          [Logical                                                                  Write-Ahead Logging,
                          Decoding](https://www.postgresql.org/docs/current/logicaldecoding.html) · logical decoding,
                          [WAL](https://www.postgresql.org/docs/current/wal-intro.html)             replication slots,
                                                                                                    logical replication

  **MySQL**               [Binary Log](https://dev.mysql.com/doc/refman/8.4/en/binary-log.html)     Binlog, row-based
                                                                                                    replication, GTID,
                                                                                                    retention và
                                                                                                    replication consistency

  **Confluent Developer** [Developer Portal](https://developer.confluent.io/) · [Engineering        Event streaming, Kafka
                          Blog](https://www.confluent.io/blog/)                                     Connect, CDC pipeline,
                                                                                                    Schema Registry, stream
                                                                                                    processing

  **Martin Fowler**       [martinfowler.com](https://martinfowler.com/)                             Event-driven
                                                                                                    architecture,
                                                                                                    Transactional Outbox,
                                                                                                    Event Sourcing, data
                                                                                                    integration patterns
  -------------------------------------------------------------------------------------------------------------------------

### Thứ tự tham khảo đề xuất

1.  PostgreSQL WAL hoặc MySQL Binlog để hiểu nguồn phát sinh change
    event.
2.  Debezium để hiểu snapshot, connector, offset và recovery.
3.  Kafka để hiểu cách event được lưu trữ, phân vùng và tiêu thụ.
4.  Confluent để tham khảo kiến trúc streaming và triển khai thực tế.
5.  Martin Fowler để phân tích trade-off kiến trúc như CDC so với
    Transactional Outbox.

### Gắn với roadmap

-   CDC-01 đến CDC-03: PostgreSQL, MySQL, Kafka.
-   CDC-04 đến CDC-07: Debezium, Kafka Connect, Confluent.
-   CDC-08 đến CDC-10: Debezium, Kafka, Martin Fowler.

------------------------------------------------------------------------

## 2. Docker & Containerization

Nên học theo hai lớp: cách sử dụng Docker và cơ chế Linux bên dưới
container.

  ----------------------------------------------------------------------------------------------------------------
  Website                 Tài liệu                                                         Nội dung nên khai thác
  ----------------------- ---------------------------------------------------------------- -----------------------
  **Docker Docs**         [Documentation](https://docs.docker.com/) ·                      Dockerfile, image,
                          [Guides](https://docs.docker.com/guides/) · [Learning            layer, BuildKit,
                          Resources](https://docs.docker.com/get-started/resources/)       Compose, network,
                                                                                           volume, security,
                                                                                           production practices

  **Linux Kernel Docs**   [Kernel Documentation](https://docs.kernel.org/) ·               Namespaces, cgroups,
                          [man-pages](https://man7.org/linux/man-pages/)                   capabilities, seccomp,
                                                                                           process isolation,
                                                                                           filesystem và
                                                                                           networking

  **Open Container        [Official Website](https://opencontainers.org/) · [Runtime       Container runtime
  Initiative (OCI)**      Specification](https://github.com/opencontainers/runtime-spec) · lifecycle, image format
                          [Image                                                           và chuẩn tương thích
                          Specification](https://github.com/opencontainers/image-spec)     

  **Killercoda**          [killercoda.com](https://killercoda.com/)                        Interactive terminal
                                                                                           labs cho Docker, Linux,
                                                                                           Kubernetes và
                                                                                           networking

  **Play with Docker**    [Docker Playground](https://labs.play-with-docker.com/)          Môi trường Docker tạm
                                                                                           thời để chạy container,
                                                                                           network và thử nghiệm

  **Bret Fisher**         [bretfisher.com](https://www.bretfisher.com/)                    Docker, container
                                                                                           networking, production
                                                                                           practices và Kubernetes

  **DigitalOcean          [Tutorials](https://www.digitalocean.com/community/tutorials)    Hướng dẫn từng bước về
  Community**                                                                              Linux, Docker,
                                                                                           networking và
                                                                                           Kubernetes
  ----------------------------------------------------------------------------------------------------------------

### Thứ tự tham khảo đề xuất

1.  Docker Docs để học CLI, Dockerfile, image, network, volume và
    Compose.
2.  Linux Kernel Docs để hiểu namespaces, cgroups và isolation.
3.  OCI để tìm hiểu chuẩn image và runtime.
4.  Killercoda hoặc Play with Docker để thực hành.
5.  Bret Fisher và DigitalOcean để tham khảo ví dụ triển khai.

### Gắn với roadmap

-   DOCKER-01 đến DOCKER-04: Docker Docs, Linux Kernel.
-   DOCKER-05 đến DOCKER-08: Docker Docs, OCI, Killercoda.
-   DOCKER-09 đến DOCKER-11: Docker Docs, Linux Kernel, OCI, Bret
    Fisher.

------------------------------------------------------------------------

## 3. Security, OAuth 2.0 & Authentication

Với Security, cần phân biệt tài liệu tiêu chuẩn giao thức, hướng dẫn
phòng thủ và lab thực hành khai thác. Không nên chỉ học cấu hình
framework mà bỏ qua bản chất giao thức.

  -------------------------------------------------------------------------------------------------------------------
  Website                 Tài liệu                                                            Nội dung nên khai thác
  ----------------------- ------------------------------------------------------------------- -----------------------
  **OWASP**               [Cheat Sheet Series](https://cheatsheetseries.owasp.org/) · [OWASP  Authentication,
                          Top 10](https://owasp.org/www-project-top-ten/)                     authorization, password
                                                                                              storage, JWT, OAuth2,
                                                                                              CSRF, XSS, injection,
                                                                                              API security

  **OAuth.net**           [OAuth 2.0](https://oauth.net/2/) ·                                 Authorization Code,
                          [Security](https://oauth.net/security/) ·                           PKCE, Client
                          [Specifications](https://oauth.net/specs/)                          Credentials, Device
                                                                                              Authorization, token
                                                                                              exchange và best
                                                                                              practices

  **IETF RFC Editor**     [RFC Editor](https://www.rfc-editor.org/)                           Tiêu chuẩn gốc cho
                                                                                              OAuth, PKCE, JWT, OAuth
                                                                                              Security BCP và Token
                                                                                              Exchange

  **Spring Security**     [Reference                                                          SecurityFilterChain,
                          Documentation](https://docs.spring.io/spring-security/reference/)   Authentication,
                                                                                              Authorization, OAuth2
                                                                                              Client, Resource
                                                                                              Server, method security
                                                                                              và testing

  **Keycloak**            [Documentation](https://www.keycloak.org/documentation) ·           Realm, Client, SSO,
                          [Guides](https://www.keycloak.org/guides)                           OIDC, SAML, identity
                                                                                              provider, user
                                                                                              federation và
                                                                                              authentication flows

  **PortSwigger Web       [Web Security Academy](https://portswigger.net/web-security)        Interactive labs về
  Security Academy**                                                                          authentication, access
                                                                                              control, OAuth, JWT,
                                                                                              XSS, CSRF, SSRF và SQL
                                                                                              injection

  **OpenID Foundation**   [Developer Resources](https://openid.net/developers/) · [OIDC       ID Token, UserInfo,
                          Core](https://openid.net/specs/openid-connect-core-1_0.html)        Discovery,
                                                                                              authentication flow và
                                                                                              identity federation

  **Auth0**               [Documentation](https://auth0.com/docs) ·                           OAuth/OIDC, JWT,
                          [Blog](https://auth0.com/blog/)                                     access/refresh token và
                                                                                              API authorization
  -------------------------------------------------------------------------------------------------------------------

### Các RFC quan trọng nên đọc

  -----------------------------------------------------------------------------------------------
  RFC                                             Chủ đề                  Liên quan
  ----------------------------------------------- ----------------------- -----------------------
  [RFC                                            OAuth 2.0 Authorization SEC-07, SEC-08
  6749](https://www.rfc-editor.org/rfc/rfc6749)   Framework               

  [RFC                                            Proof Key for Code      SEC-08
  7636](https://www.rfc-editor.org/rfc/rfc7636)   Exchange (PKCE)         

  [RFC                                            JSON Web Token (JWT)    SEC-09
  7519](https://www.rfc-editor.org/rfc/rfc7519)                           

  [RFC                                            Best Current Practice   SEC-08, SEC-15
  9700](https://www.rfc-editor.org/rfc/rfc9700)   for OAuth 2.0 Security  

  [RFC                                            OAuth 2.0 Token         SEC-15
  8693](https://www.rfc-editor.org/rfc/rfc8693)   Exchange                
  -----------------------------------------------------------------------------------------------

### Thứ tự tham khảo đề xuất

1.  OWASP để hiểu threat, vulnerability và biện pháp phòng thủ.
2.  OAuth.net và RFC Editor để học đúng giao thức.
3.  OpenID Foundation để học OIDC.
4.  Spring Security để triển khai trong Java.
5.  Keycloak để thực hành IAM và SSO.
6.  PortSwigger để kiểm chứng kiến thức bằng lab bảo mật.

### Gắn với roadmap

-   SEC-01 đến SEC-06: OWASP, RFC, Spring Security.
-   SEC-07 đến SEC-10: OAuth.net, IETF RFC, OpenID Foundation, Auth0.
-   SEC-11 đến SEC-13: OWASP, PortSwigger.
-   SEC-14 đến SEC-16: Keycloak, Spring Security, OpenID Foundation.

------------------------------------------------------------------------

## 4. DevOps & Cloud Orchestration

Nên chia nguồn thành ba nhóm: nền tảng DevOps, Cloud Native/Kubernetes
và Production Reliability/SRE.

  ------------------------------------------------------------------------------------------------------------------
  Website                 Tài liệu                                                           Nội dung nên khai thác
  ----------------------- ------------------------------------------------------------------ -----------------------
  **roadmap.sh**          [DevOps Roadmap](https://roadmap.sh/devops) · [Kubernetes          Kiểm tra dependency và
                          Roadmap](https://roadmap.sh/kubernetes)                            các mảng kiến thức có
                                                                                             thể còn thiếu trong
                                                                                             roadmap

  **Kubernetes**          [Documentation](https://kubernetes.io/docs/home/) ·                Architecture, Pod,
                          [Tutorials](https://kubernetes.io/docs/tutorials/)                 Deployment,
                                                                                             StatefulSet, Service,
                                                                                             networking, storage,
                                                                                             scheduling, autoscaling
                                                                                             và security

  **CNCF**                [Website](https://www.cncf.io/) · [Cloud Native                    Cloud Native ecosystem,
                          Landscape](https://landscape.cncf.io/) · [TAG                      service mesh,
                          Security](https://github.com/cncf/tag-security)                    observability, GitOps
                                                                                             và security

  **HashiCorp Terraform** [Documentation](https://developer.hashicorp.com/terraform/docs) ·  IaC, providers,
                          [Tutorials](https://developer.hashicorp.com/terraform/tutorials)   resources, state,
                                                                                             modules, plan/apply và
                                                                                             drift

  **GitHub Actions**      [Documentation](https://docs.github.com/en/actions)                Workflow, jobs,
                                                                                             triggers, artifacts,
                                                                                             caching, secrets,
                                                                                             reusable workflows và
                                                                                             CI/CD security

  **Argo CD**             [Documentation](https://argo-cd.readthedocs.io/en/stable/)         GitOps, declarative
                                                                                             deployment, sync,
                                                                                             reconciliation,
                                                                                             application health và
                                                                                             rollback

  **Google SRE**          [SRE Books](https://sre.google/) · [SRE                            SLI, SLO, SLA, error
                          Workbook](https://sre.google/workbook/index/) ·                    budget, incident
                          [Resources](https://sre.google/resources/)                         management, monitoring,
                                                                                             capacity planning và
                                                                                             canary releases

  **OpenTelemetry**       [Documentation](https://opentelemetry.io/docs/)                    Metrics, logs, traces,
                                                                                             instrumentation,
                                                                                             collector và context
                                                                                             propagation

  **Prometheus**          [Documentation](https://prometheus.io/docs/)                       Metrics collection,
                                                                                             PromQL, alerting và
                                                                                             monitoring

  **Grafana**             [Documentation](https://grafana.com/docs/)                         Dashboards,
                                                                                             visualization, alerting
                                                                                             và observability

  **Google Cloud Skills   [Learning Platform](https://www.cloudskillsboost.google/)          Hands-on cloud labs,
  Boost**                                                                                    Kubernetes Engine,
                                                                                             networking, operations
                                                                                             và Terraform
  ------------------------------------------------------------------------------------------------------------------

### Thứ tự tham khảo đề xuất

1.  roadmap.sh để kiểm tra cấu trúc kiến thức.
2.  GitHub Actions và Terraform để học CI/CD, IaC.
3.  Kubernetes Docs để học orchestration.
4.  CNCF và Argo CD để mở rộng sang Cloud Native và GitOps.
5.  OpenTelemetry, Prometheus và Grafana để học observability.
6.  Google SRE để học reliability và vận hành production.
7.  Google Cloud Skills Boost để thực hành trên cloud thật.

### Gắn với roadmap

-   DEVOPS-01 đến DEVOPS-04: roadmap.sh, GitHub Actions.
-   DEVOPS-05 đến DEVOPS-07: Terraform, Google Cloud Skills Boost.
-   DEVOPS-08 đến DEVOPS-12: Kubernetes, CNCF, Argo CD.
-   DEVOPS-13 đến DEVOPS-14: OpenTelemetry, Prometheus, Grafana, Google
    SRE.

------------------------------------------------------------------------

## 5. Website tổng hợp kiến thức liên ngành

Các nguồn này hữu ích để tìm thêm cách giải thích, ví dụ, case study và
kinh nghiệm triển khai thực tế.

  ---------------------------------------------------------------------------------------------------------------
  Website                 Liên kết                                                        Thế mạnh
  ----------------------- --------------------------------------------------------------- -----------------------
  **Baeldung**            [baeldung.com](https://www.baeldung.com/)                       Java, Spring, Security,
                                                                                          OAuth, backend

  **InfoQ**               [infoq.com](https://www.infoq.com/)                             Software architecture,
                                                                                          distributed systems,
                                                                                          engineering case
                                                                                          studies

  **DigitalOcean          [Tutorials](https://www.digitalocean.com/community/tutorials)   Linux, Docker,
  Community**                                                                             networking, Kubernetes,
                                                                                          DevOps

  **freeCodeCamp**        [Technical Articles](https://www.freecodecamp.org/news/)        Programming, backend,
                                                                                          DevOps và project thực
                                                                                          hành

  **GitHub Awesome        [Awesome Lists](https://github.com/topics/awesome-list)         Danh sách sách, bài
  Lists**                                                                                 viết, lab, tool và
                                                                                          repository theo chủ đề
  ---------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 6. Bảng lựa chọn nguồn theo mục đích

  Nguồn                      Lý thuyết   Internals / Standards   Lab   Production
  ------------------------- ----------- ----------------------- ----- ------------
  Debezium                       ✓                 ✓              ✓        ✓
  Kafka Docs                     ✓                 ✓              ✓        ✓
  PostgreSQL / MySQL Docs        ✓                 ✓              ✓        ✓
  Docker Docs                    ✓                 ✓              ✓        ✓
  Linux Kernel Docs              ✓                 ✓                       ✓
  OCI                            ✓                 ✓                       ✓
  OWASP                          ✓                 ✓              ✓        ✓
  OAuth.net / IETF RFC           ✓                 ✓                       ✓
  PortSwigger                    ✓                 ✓              ✓   
  Spring Security                ✓                 ✓              ✓        ✓
  Kubernetes Docs                ✓                 ✓              ✓        ✓
  Killercoda                                       ✓              ✓   
  InfoQ                          ✓                 ✓                       ✓
  Baeldung                       ✓                                ✓        ✓
  Google SRE                     ✓                 ✓              ✓        ✓

------------------------------------------------------------------------

## 7. Quy trình nghiên cứu để xây dựng một bài giảng

Nên áp dụng cùng một quy trình cho tất cả các bài trong bốn learning
paths.

### Bước 1 --- Xác định phạm vi kiến thức

Ví dụ: `CDC-02: Database Transaction Logs`.

Liệt kê: - Khái niệm cần giải thích. - Cơ chế hoặc thuật toán bên
trong. - Công thức, độ phức tạp hoặc giới hạn (nếu có). - Failure modes
và các hiểu lầm thường gặp. - Kiến thức tiên quyết.

### Bước 2 --- Thu thập tài liệu gốc

Ưu tiên: 1. Official documentation. 2. RFC hoặc technical specification
nếu chủ đề có tiêu chuẩn. 3. Source code hoặc design document khi cần
giải thích internals.

### Bước 3 --- Tìm bài phân tích chuyên sâu

Tham khảo engineering blog, InfoQ, Baeldung, DigitalOcean và các
repository có ví dụ thực tế.

Dùng blog để tìm góc nhìn và case study; đối chiếu các phát biểu kỹ
thuật quan trọng với tài liệu gốc.

### Bước 4 --- Kiểm chứng bằng thực nghiệm

Ví dụ: - CDC: cập nhật database, quan sát WAL/Binlog và event. - Docker:
thay đổi namespace, CPU/RAM limit và network. - Security: thử JWT
validation, PKCE và authorization policy. - DevOps: triển khai
Kubernetes, tạo lỗi và quan sát recovery.

### Bước 5 --- Chuyển thành bài giảng

Cấu trúc khuyến nghị:

1.  Problem & Motivation.
2.  Core Concepts.
3.  Architecture.
4.  Internal Mechanism.
5.  Algorithm / Formula (nếu phù hợp).
6.  Trade-offs & Alternatives.
7.  Failure Scenarios.
8.  SVG Simulator / Interactive Visualization.
9.  Hands-on Lab.
10. Knowledge Check.
11. References.

------------------------------------------------------------------------

## 8. Bộ nguồn cốt lõi nên bookmark

Nếu chỉ chọn một nhóm nhỏ để bắt đầu, hãy ưu tiên:

  -----------------------------------------------------------------------------------------------
  Chủ đề                              Nguồn cốt lõi
  ----------------------------------- -----------------------------------------------------------
  CDC                                 [Debezium](https://debezium.io/documentation/reference/),
                                      [Apache Kafka](https://kafka.apache.org/documentation/),
                                      [PostgreSQL](https://www.postgresql.org/docs/current/)

  Docker                              [Docker Docs](https://docs.docker.com/), [Linux Kernel
                                      Docs](https://docs.kernel.org/),
                                      [OCI](https://opencontainers.org/)

  Security                            [OWASP](https://owasp.org/), [IETF RFC
                                      Editor](https://www.rfc-editor.org/), [PortSwigger
                                      Academy](https://portswigger.net/web-security)

  DevOps                              [Kubernetes](https://kubernetes.io/docs/),
                                      [CNCF](https://www.cncf.io/), [Google
                                      SRE](https://sre.google/)
  -----------------------------------------------------------------------------------------------

## 9. Nguyên tắc đánh giá chất lượng tài liệu

-   **Độ tin cậy:** Ưu tiên tài liệu chính thức, RFC, specification và
    tài liệu từ dự án gốc.
-   **Tính cập nhật:** Kiểm tra phiên bản sản phẩm, ngày cập nhật và
    trạng thái API trước khi đưa vào bài giảng.
-   **Độ sâu:** Phân biệt bài giới thiệu khái niệm với tài liệu mô tả
    internals.
-   **Khả năng kiểm chứng:** Ưu tiên nội dung có thể tái hiện bằng lab
    hoặc đối chiếu source code.
-   **Tính production:** Bổ sung failure scenarios, security,
    monitoring, recovery và trade-offs.
-   **Trích dẫn:** Lưu URL, tiêu đề, phiên bản/ngày truy cập và bài
    giảng sử dụng nguồn đó.

> **Nguyên tắc quan trọng:** Không lấy một bài blog làm nguồn chân lý
> duy nhất. Với Kafka offsets, OAuth token validation, Docker namespaces
> hay Kubernetes scheduling, hãy đối chiếu tài liệu chuẩn và kiểm chứng
> bằng thực nghiệm.
