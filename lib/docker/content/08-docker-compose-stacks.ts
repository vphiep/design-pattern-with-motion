import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const dockerComposeStacksTopic: DockerTopic = {
  id: 'docker-compose-stacks',
  roadmapId: 'DOCKER-08',
  category: 'docker-multi-container',
  level: 'intermediate',
  chapter: 'Cấp độ 2',
  name: 'Docker Compose & Application Stacks',
  tagline: {
    vi: 'Một file YAML mô tả cả stack Spring Boot + PostgreSQL + Redis + Kafka: network <project>_default với DNS theo tên service, healthcheck + depends_on service_healthy, secret dưới /run/secrets, profiles và restart policy.',
    en: 'One YAML file describes a whole Spring Boot + PostgreSQL + Redis + Kafka stack: a <project>_default network with service-name DNS, healthchecks + depends_on service_healthy, secrets under /run/secrets, profiles and restart policies.'
  },
  difficulty: 2,
  order: 8,
  estimatedMinutes: 30,

  coreTheory: {
    problemStatement: {
      vi: 'Môi trường dev cần 5 container: API, PostgreSQL, Redis, Kafka, Kafka UI. Gõ 5 lệnh docker run dài với network, volume, env, port — rồi API vẫn crash vì khởi động trước khi Postgres sẵn sàng nhận kết nối. Mỗi dev lại có một phiên bản lệnh khác nhau.',
      en: 'The dev environment needs 5 containers: API, PostgreSQL, Redis, Kafka, Kafka UI. Typing 5 long docker run commands with networks, volumes, env and ports — and the API still crashes because it starts before Postgres accepts connections. Every developer has a slightly different set of commands.'
    },
    hardwareConstraint: {
      vi: 'Container "running" không có nghĩa là ứng dụng bên trong "ready": Postgres cần vài giây để initdb và mở port, Kafka cần bầu controller. Docker chỉ biết process đã start, không biết ứng dụng đã sẵn sàng nếu không có healthcheck.',
      en: 'A "running" container does not mean the app inside is "ready": Postgres needs seconds to initdb and open its port, Kafka needs to elect a controller. Docker only knows a process started; it cannot know the app is ready without a healthcheck.'
    },
    fundamentalSolution: {
      vi: 'Compose khai báo cả stack trong compose.yaml: services, networks, volumes, secrets. docker compose up tạo network <project>_default, mỗi service đăng ký tên vào DNS nội bộ (api gọi db:5432), tạo volume có tên, rồi khởi động service theo đồ thị depends_on. Với condition: service_healthy, Compose chờ healthcheck của dependency báo healthy; service_completed_successfully chờ một job (migration) thoát với code 0. Secret được mount thành file /run/secrets/<name>; profiles bật các service tuỳ chọn.',
      en: 'Compose declares the whole stack in compose.yaml: services, networks, volumes and secrets. docker compose up creates the <project>_default network, registers each service name in internal DNS (api calls db:5432), creates named volumes, then starts services following the depends_on graph. With condition: service_healthy, Compose waits for the dependency healthcheck to report healthy; service_completed_successfully waits for a job (a migration) to exit 0. Secrets are mounted as files at /run/secrets/<name>; profiles enable optional services.'
    },
    math: {
      formula: String.raw`T_{\text{ready}}(s) = t_{\text{healthy}}(s) + \max_{d \,\in\, \text{deps}(s)} T_{\text{ready}}(d)`,
      description: {
        vi: 'Thời gian để một service sẵn sàng bằng thời gian khởi động của chính nó cộng đường dài nhất qua các dependency. Service không phụ thuộc nhau khởi động song song; chuỗi depends_on dài làm cả stack lên chậm.',
        en: 'A service is ready after its own start-up time plus the longest path through its dependencies. Independent services start in parallel; long depends_on chains make the whole stack slow to come up.'
      },
      timeComplexity: 'Start-up = longest path in the depends_on DAG',
      spaceComplexity: 'One network + named volumes per project'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Compose là công cụ mô tả ứng dụng nhiều container trên một host. Nó gọi cùng Docker API như CLI, chỉ khác là đọc trạng thái mong muốn từ YAML và đưa hệ thống về trạng thái đó.',
      en: 'Compose describes multi-container apps on a single host. It calls the same Docker API as the CLI, but reads the desired state from YAML and converges the system to it.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Networking: Compose tạo network bridge tên <project>_default; tên service chính là hostname. Service gọi nhau qua CONTAINER_PORT (postgres://db:5432); HOST_PORT trong ports: chỉ dùng cho truy cập từ ngoài host. Vì vậy chỉ publish những gì người dùng ngoài thật sự cần (API, Kafka UI), còn db, redis, kafka không cần ports: ở môi trường dùng chung.',
        en: 'Networking: Compose creates a bridge network named <project>_default; the service name is the hostname. Services talk on the CONTAINER_PORT (postgres://db:5432); the HOST_PORT in ports: is only for access from outside the host. So publish only what outside users actually need (API, Kafka UI); db, redis and kafka need no ports: in shared environments.'
      },
      {
        vi: 'depends_on dạng ngắn chỉ đảm bảo thứ tự start, không chờ "ready". Dạng dài có condition: service_started, service_healthy (cần healthcheck), service_completed_successfully (cho job one-shot như Flyway migration). Healthcheck gồm test, interval, timeout, retries, start_period, start_interval. Ứng dụng vẫn nên retry kết nối: dependency có thể restart sau khi stack đã lên.',
        en: 'Short-form depends_on only orders start-up; it does not wait for "ready". The long form has condition: service_started, service_healthy (needs a healthcheck) and service_completed_successfully (for one-shot jobs such as a Flyway migration). A healthcheck has test, interval, timeout, retries, start_period and start_interval. Apps should still retry connections: a dependency can restart after the stack is up.'
      },
      {
        vi: 'Cấu hình và secret: biến ${VAR} được nội suy từ shell hoặc file .env cạnh compose.yaml (dùng $$ khi cần ký tự $ thật). Secret khai báo ở cấp cao nhất (file: hoặc environment:) rồi gán cho service; container đọc file /run/secrets/<name>. Image postgres hỗ trợ POSTGRES_PASSWORD_FILE; Spring Boot đọc được thư mục secret bằng spring.config.import=configtree:/run/secrets/.',
        en: 'Configuration and secrets: ${VAR} is interpolated from the shell or the .env file next to compose.yaml (use $$ for a literal $). Secrets are declared at the top level (file: or environment:) and granted per service; the container reads /run/secrets/<name>. The postgres image supports POSTGRES_PASSWORD_FILE; Spring Boot can read a secrets directory via spring.config.import=configtree:/run/secrets/.'
      },
      {
        vi: 'Profiles và vận hành: service không có profiles luôn chạy; service có profiles: ["debug"] chỉ chạy khi --profile debug hoặc COMPOSE_PROFILES=debug. restart: unless-stopped giữ service sống qua crash. docker compose down xoá container và network nhưng giữ named volume; down -v xoá cả volume. Nhiều file (compose.yaml + compose.override.yaml) cho phép ghi đè theo môi trường.',
        en: 'Profiles and operations: services without profiles always run; a service with profiles: ["debug"] runs only with --profile debug or COMPOSE_PROFILES=debug. restart: unless-stopped keeps services alive across crashes. docker compose down removes containers and networks but keeps named volumes; down -v removes volumes too. Multiple files (compose.yaml + compose.override.yaml) allow per-environment overrides.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'depends_on dạng ngắn rồi ngạc nhiên vì API báo "Connection refused" khi khởi động: Postgres đã "running" nhưng chưa nhận kết nối.',
        en: 'Short-form depends_on, then surprise when the API reports "Connection refused" at start-up: Postgres is "running" but not yet accepting connections.'
      },
      {
        vi: 'Gọi localhost:5432 từ container api: localhost là chính container api, phải dùng db:5432.',
        en: 'Calling localhost:5432 from the api container: localhost is the api container itself — use db:5432.'
      },
      {
        vi: 'Kafka quảng bá advertised.listeners là localhost:9092: client ở container khác nhận về địa chỉ sai và treo.',
        en: 'Kafka advertising localhost:9092 in advertised.listeners: clients in other containers get the wrong address and hang.'
      },
      {
        vi: 'Mật khẩu viết thẳng trong compose.yaml commit lên Git; docker compose down -v xoá nhầm dữ liệu dev của cả team.',
        en: 'Passwords written straight into compose.yaml and committed to Git; docker compose down -v wiping the team’s dev data by mistake.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Stack "shop" trên một host', en: 'The "shop" stack on one host' },
    description: {
      vi: 'Một network, DNS theo tên service, thứ tự khởi động theo healthcheck.',
      en: 'One network, service-name DNS, start-up ordered by healthchecks.'
    },
    asciiDiagram: `
 network shop_default (bridge, embedded DNS)
 ┌──────────────────────────────────────────────────────────────────────┐
 │  db (postgres:17) ──healthy──┐                                       │
 │    volume pgdata              ├──► migrate (flyway, exits 0) ──┐     │
 │  redis (redis:7.4) ─healthy──┤                                 ▼     │
 │  kafka (apache/kafka) healthy┴──────────────────────────────► api ◄──┼── host :8080
 │                                                                      │
 │  kafka-ui  [profile: debug] ───────────────────────── kafka:9092     ├── host :8081
 └──────────────────────────────────────────────────────────────────────┘
 secrets: db_password → /run/secrets/db_password (db, migrate, api)
`,
    components: [
      {
        name: 'services',
        role: 'Containers',
        description: {
          vi: 'Mỗi service là một hoặc nhiều container từ cùng image và cấu hình.',
          en: 'Each service is one or more containers from the same image and config.'
        }
      },
      {
        name: 'healthcheck',
        role: 'Readiness',
        description: {
          vi: 'Lệnh kiểm tra định kỳ, cho biết container healthy hay unhealthy.',
          en: 'A periodic check reporting healthy or unhealthy.'
        }
      },
      {
        name: 'depends_on',
        role: 'Ordering',
        description: {
          vi: 'Đồ thị khởi động với điều kiện started / healthy / completed.',
          en: 'The start-up graph with started / healthy / completed conditions.'
        }
      },
      {
        name: 'secrets · profiles',
        role: 'Config',
        description: {
          vi: 'Secret thành file /run/secrets; profile bật service tuỳ chọn.',
          en: 'Secrets become /run/secrets files; profiles enable optional services.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'project',
      title: { vi: 'Project, network & DNS theo tên', en: 'Project, network & name-based DNS' },
      phase: 'Up',
      description: {
        vi: 'docker compose up tạo network shop_default; mỗi service đăng ký tên vào DNS.',
        en: 'docker compose up creates shop_default; each service registers its name in DNS.'
      },
      systemBehavior: {
        vi: 'api phân giải "db" thành IP container qua DNS nhúng 127.0.0.11.',
        en: 'api resolves "db" to the container IP via the embedded DNS at 127.0.0.11.'
      },
      codeLineMatch: 'name: shop'
    },
    {
      id: 'healthcheck',
      title: { vi: 'Healthcheck báo trạng thái ready', en: 'Healthchecks report readiness' },
      phase: 'Probe',
      description: {
        vi: 'pg_isready chạy mỗi 5 giây; sau 5 lần thất bại liên tiếp db bị đánh dấu unhealthy.',
        en: 'pg_isready runs every 5 seconds; after 5 consecutive failures db is marked unhealthy.'
      },
      systemBehavior: {
        vi: 'Lỗi trong start_period không bị tính vào retries.',
        en: 'Failures during start_period do not count toward retries.'
      },
      codeLineMatch: 'test: ["CMD-SHELL", "pg_isready'
    },
    {
      id: 'depends-on',
      title: { vi: 'depends_on: healthy rồi mới start', en: 'depends_on: start only when healthy' },
      phase: 'Order',
      description: {
        vi: 'migrate chờ db healthy; api chờ migrate thoát với code 0 và redis/kafka healthy.',
        en: 'migrate waits for db to be healthy; api waits for migrate to exit 0 and redis/kafka to be healthy.'
      },
      systemBehavior: {
        vi: 'Compose khởi động song song các nhánh độc lập của đồ thị.',
        en: 'Compose starts independent branches of the graph in parallel.'
      },
      codeLineMatch: 'condition: service_completed_successfully'
    },
    {
      id: 'secrets',
      title: { vi: 'Secret thành file, không thành env', en: 'Secrets as files, not env vars' },
      phase: 'Configure',
      description: {
        vi: 'db_password được mount tại /run/secrets/db_password cho các service được cấp.',
        en: 'db_password is mounted at /run/secrets/db_password for the granted services.'
      },
      systemBehavior: {
        vi: 'Không xuất hiện trong docker inspect Env hay biến môi trường của process.',
        en: 'It does not appear in docker inspect Env or the process environment.'
      },
      codeLineMatch: 'file: ./secrets/db_password.txt'
    },
    {
      id: 'profiles',
      title: { vi: 'Profiles cho service tuỳ chọn', en: 'Profiles for optional services' },
      phase: 'Select',
      description: {
        vi: 'kafka-ui chỉ chạy khi bật profile debug.',
        en: 'kafka-ui only runs when the debug profile is enabled.'
      },
      systemBehavior: {
        vi: 'Service không khai báo profiles luôn được bật.',
        en: 'Services without profiles are always enabled.'
      },
      codeLineMatch: 'profiles: ["debug"]'
    }
  ],

  comparison: {
    title: {
      vi: 'docker run thủ công vs Compose vs Kubernetes',
      en: 'Manual docker run vs Compose vs Kubernetes'
    },
    subtitle: {
      vi: 'Khi nào Compose là đủ',
      en: 'When Compose is enough'
    },
    options: [
      {
        name: 'docker run scripts',
        tag: 'Imperative',
        role: { vi: 'Từng lệnh một', en: 'One command at a time' },
        keyMechanism: {
          vi: 'Không có trạng thái mong muốn; thứ tự và cấu hình nằm trong đầu người chạy.',
          en: 'No desired state; order and config live in the operator’s head.'
        },
        configExample: 'docker run -d --network app-net --name db … && docker run …',
        architectureNote: {
          vi: 'Chỉ hợp cho thử nghiệm nhanh.',
          en: 'Only for quick experiments.'
        }
      },
      {
        name: 'Docker Compose',
        tag: 'Declarative · one host',
        role: { vi: 'Stack trên một máy', en: 'A stack on one machine' },
        keyMechanism: {
          vi: 'YAML khai báo, depends_on + healthcheck, restart policy của Docker.',
          en: 'Declarative YAML, depends_on + healthchecks, Docker restart policies.'
        },
        configExample: 'docker compose --profile debug up -d',
        architectureNote: {
          vi: 'Lý tưởng cho dev, CI integration test, ứng dụng nhỏ một host.',
          en: 'Ideal for dev, CI integration tests and small single-host apps.'
        }
      },
      {
        name: 'Kubernetes',
        tag: 'Declarative · cluster',
        role: { vi: 'Nhiều node, tự phục hồi', en: 'Many nodes, self-healing' },
        keyMechanism: {
          vi: 'Scheduler, controller, readiness probe, Service, rolling update.',
          en: 'Scheduler, controllers, readiness probes, Services, rolling updates.'
        },
        configExample: 'kubectl apply -f k8s/',
        architectureNote: {
          vi: 'Khi cần HA qua nhiều host (DEVOPS-08 → DEVOPS-12).',
          en: 'When you need HA across hosts (DEVOPS-08 → DEVOPS-12).'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Cả stack tái tạo được bằng một lệnh, cùng file cho mọi dev và CI.',
        en: 'The whole stack is reproducible with one command, the same file for every dev and CI.'
      },
      {
        vi: 'DNS theo tên service và network riêng cho mỗi project.',
        en: 'Service-name DNS and a private network per project.'
      },
      {
        vi: 'Healthcheck + depends_on loại bỏ race khi khởi động.',
        en: 'Healthchecks + depends_on remove start-up races.'
      }
    ],
    cons: [
      {
        vi: 'Chỉ một host: không có lập lịch, failover hay rolling update giữa nhiều máy.',
        en: 'Single host only: no scheduling, failover or rolling updates across machines.'
      },
      {
        vi: 'Thứ tự khởi động không thay thế retry trong ứng dụng.',
        en: 'Start-up ordering does not replace in-app retries.'
      }
    ],
    balance: {
      vi: 'Dùng Compose cho dev, test và hệ thống một host; khi cần nhiều node và tự phục hồi thì chuyển định nghĩa sang Kubernetes (Helm/Kustomize), giữ nguyên image.',
      en: 'Use Compose for dev, tests and single-host systems; when you need many nodes and self-healing, move the definition to Kubernetes (Helm/Kustomize) while keeping the same images.'
    },
    invariant: {
      vi: 'Trong một project Compose, mỗi service truy cập được bằng chính tên của nó trên network chung.',
      en: 'Within a Compose project, every service is reachable by its own name on the shared network.'
    }
  },

  code: [
    {
      label: 'compose.yaml',
      filename: 'compose.yaml',
      language: 'yaml',
      code: `name: shop
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: shop
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d shop"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 20s
    restart: unless-stopped

  redis:
    image: redis:7.4
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s

  kafka:
    image: apache/kafka:3.9.0
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    healthcheck:
      test: ["CMD-SHELL", "/opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092"]
      interval: 10s
      start_period: 30s

  migrate:
    image: flyway/flyway:11
    entrypoint: ["sh", "-c", "flyway -url=jdbc:postgresql://db:5432/shop -user=postgres -password=$$(cat /run/secrets/db_password) migrate"]
    volumes: [./db/migration:/flyway/sql:ro]
    secrets: [db_password]
    depends_on:
      db: { condition: service_healthy }

  api:
    image: registry.example.com/shop-api:\${API_TAG:-dev}
    ports: ["8080:8080"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/shop
      SPRING_CONFIG_IMPORT: "configtree:/run/secrets/"
      SPRING_DATASOURCE_PASSWORD: "$\${db_password}"
      SPRING_DATA_REDIS_HOST: redis
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
    secrets: [db_password]
    depends_on:
      migrate: { condition: service_completed_successfully }
      redis: { condition: service_healthy }
      kafka: { condition: service_healthy }
    restart: unless-stopped

  kafka-ui:
    image: kafbat/kafka-ui:v1.1.0
    profiles: ["debug"]
    ports: ["8081:8080"]
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092

secrets:
  db_password:
    file: ./secrets/db_password.txt

volumes:
  pgdata: {}`
    },
    {
      label: 'compose.sh',
      filename: 'compose.sh',
      language: 'bash',
      code: `docker compose config                 # fully interpolated, validated model
docker compose up -d                  # db, redis, kafka, migrate, api
docker compose --profile debug up -d  # + kafka-ui
docker compose ps                     # STATUS shows (healthy) / (unhealthy)
docker compose logs -f api migrate
docker compose exec api getent hosts db

docker compose down                   # containers + network; pgdata is kept
docker compose down -v                # ALSO deletes named volumes — on purpose only`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Trong Compose, service api kết nối tới Postgres bằng địa chỉ nào?',
        en: 'In Compose, which address does the api service use to reach Postgres?'
      },
      answer: {
        vi: 'Tên service và CONTAINER_PORT: db:5432. Compose đặt mọi service vào network <project>_default với DNS theo tên service. Không dùng localhost (đó là chính container api) và không cần port publish ra host.',
        en: 'The service name and CONTAINER_PORT: db:5432. Compose puts every service on <project>_default with service-name DNS. Not localhost (that is the api container itself), and no host port publishing is needed.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Vì sao depends_on: [db] vẫn để API crash lúc khởi động, và sửa thế nào?',
        en: 'Why does depends_on: [db] still let the API crash at start-up, and how do you fix it?'
      },
      answer: {
        vi: 'Dạng ngắn chỉ chờ container db được start, không chờ Postgres sẵn sàng. Thêm healthcheck cho db (pg_isready) và dùng depends_on: db: condition: service_healthy; với migration one-shot dùng service_completed_successfully. Đồng thời bật retry kết nối trong ứng dụng vì db vẫn có thể restart sau này.',
        en: 'The short form only waits for the db container to start, not for Postgres to be ready. Add a db healthcheck (pg_isready) and use depends_on: db: condition: service_healthy; for one-shot migrations use service_completed_successfully. Also enable connection retries in the app, since db can still restart later.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Đưa mật khẩu database vào stack Compose thế nào cho an toàn hơn biến môi trường?',
        en: 'How do you get a database password into a Compose stack more safely than an env var?'
      },
      answer: {
        vi: 'Khai báo secrets ở cấp cao nhất từ file nằm ngoài Git (hoặc từ biến môi trường của CI), cấp cho đúng service cần; container đọc /run/secrets/<name>. Postgres dùng POSTGRES_PASSWORD_FILE, Spring Boot dùng configtree. Secret không lộ qua docker inspect hay /proc/<pid>/environ. Ở production nên lấy từ secret manager (Vault, cloud KMS).',
        en: 'Declare top-level secrets from a file kept out of Git (or from a CI env var) and grant them only to the services that need them; containers read /run/secrets/<name>. Postgres uses POSTGRES_PASSWORD_FILE, Spring Boot uses configtree. The secret does not leak through docker inspect or /proc/<pid>/environ. In production, source it from a secret manager (Vault, cloud KMS).'
      }
    }
  ],

  researchCitations: [
    DOCKER_CITATIONS.composeServices,
    DOCKER_CITATIONS.composeStartupOrder,
    DOCKER_CITATIONS.composeNetworking,
    DOCKER_CITATIONS.composeSecrets
  ]
};
