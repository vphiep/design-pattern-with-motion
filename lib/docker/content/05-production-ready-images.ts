import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const dockerfileMultistageBuildkitTopic: DockerTopic = {
  id: 'dockerfile-multistage-buildkit',
  roadmapId: 'DOCKER-05',
  category: 'docker-multi-container',
  level: 'intermediate',
  chapter: 'Cấp độ 2',
  name: 'Building Production-ready Images',
  tagline: {
    vi: 'Multi-stage build với BuildKit: stage build có JDK + Maven, stage runtime chỉ còn JRE/distroless + jar, chạy USER không phải root, filesystem read-only; cache mount cho dependency, secret mount cho token và base image pin theo digest để build tái lập.',
    en: 'Multi-stage builds with BuildKit: a build stage with JDK + Maven, a runtime stage with only a JRE/distroless + the jar, a non-root USER and a read-only filesystem; cache mounts for dependencies, secret mounts for tokens and digest-pinned bases for reproducible builds.'
  },
  difficulty: 2,
  order: 5,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Image một stage của DOCKER-04 chạy được nhưng chưa đủ cho production: nó chứa JDK, Maven, mã nguồn và ~/.m2 — hàng trăm MB thừa, hàng trăm package có thể dính CVE, chạy bằng root, và token Nexus truyền qua ARG nằm lại trong history của image.',
      en: 'The single-stage image from DOCKER-04 works but is not production-ready: it ships the JDK, Maven, sources and ~/.m2 — hundreds of extra MB, hundreds of packages that may carry CVEs, running as root, with a Nexus token passed via ARG left in the image history.'
    },
    hardwareConstraint: {
      vi: 'Mỗi MB image nhân với số node pull và số lần deploy; mỗi binary thừa (shell, package manager, compiler) là công cụ sẵn có cho kẻ tấn công sau khi đã vào được container. Mạng tới Maven Central trên CI chậm và không ổn định.',
      en: 'Every image MB is multiplied by the nodes pulling it and the number of deploys; every extra binary (shell, package manager, compiler) is a ready-made tool for an attacker who gets into the container. The network to Maven Central from CI is slow and flaky.'
    },
    fundamentalSolution: {
      vi: 'Multi-stage: stage build FROM maven/JDK biên dịch ra jar; stage runtime FROM một base JRE hoặc distroless và chỉ COPY --from=build đúng file jar. BuildKit chỉ build các stage mà target cần. RUN --mount=type=cache giữ ~/.m2 giữa các build mà không đưa vào layer; RUN --mount=type=secret mount token tại /run/secrets/<id> chỉ trong lệnh đó. Stage runtime chạy USER không phải root, có thể chạy với --read-only + tmpfs cho /tmp, và base image được pin theo digest.',
      en: 'Multi-stage: a build stage FROM maven/JDK compiles the jar; a runtime stage FROM a JRE or distroless base COPYs only the jar via --from=build. BuildKit builds only the stages the target needs. RUN --mount=type=cache keeps ~/.m2 between builds without putting it in a layer; RUN --mount=type=secret mounts a token at /run/secrets/<id> for that instruction only. The runtime stage runs as a non-root USER, can run with --read-only + a tmpfs for /tmp, and its base is pinned by digest.'
    },
    math: {
      formula: String.raw`|I_{\text{ship}}| = |B_{\text{runtime}}| + |\text{app.jar}| \;\ll\; |B_{\text{JDK}}| + |\text{Maven}| + |\text{src}| + |\text{.m2}|`,
      description: {
        vi: 'Image được ship chỉ gồm base runtime và artifact. Kích thước nhỏ hơn nghĩa là pull nhanh hơn khi scale, ít package hơn để quét CVE và ít công cụ hơn cho kẻ tấn công. Thời gian build vẫn theo quy luật cache của DOCKER-04: cache mount giúp cả khi pom.xml đổi.',
        en: 'The shipped image holds only the runtime base and the artifact. Smaller means faster pulls when scaling, fewer packages to scan for CVEs and fewer tools for an attacker. Build time still follows the DOCKER-04 cache rule; cache mounts help even when pom.xml changes.'
      },
      timeComplexity: 'Pull time ∝ size of layers missing on the node',
      spaceComplexity: 'Only the runtime stage is shipped'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'BuildKit là builder mặc định từ Docker 23. Nó dựng DAG từ Dockerfile, chạy song song các stage độc lập và bỏ qua stage không cần cho target.',
      en: 'BuildKit is the default builder since Docker 23. It turns the Dockerfile into a DAG, runs independent stages in parallel and skips stages not needed for the target.'
    },
    deepDiveParagraphs: [
      {
        vi: 'JDK vs JRE vs distroless: ứng dụng chỉ cần JRE để chạy, không cần javac. Image -jre nhỏ hơn -jdk; distroless (gcr.io/distroless/java21) chỉ còn JRE và thư viện C tối thiểu — không shell, không apt, không ls. jlink còn tạo được JRE tuỳ biến chỉ chứa module ứng dụng dùng. Nhớ đặt -XX:MaxRAMPercentage để JVM tính heap theo giới hạn memory của container.',
        en: 'JDK vs JRE vs distroless: an app needs only a JRE to run, not javac. A -jre image is smaller than -jdk; distroless (gcr.io/distroless/java21) keeps only the JRE and a minimal C library — no shell, no apt, no ls. jlink can even build a custom JRE with just the modules the app uses. Set -XX:MaxRAMPercentage so the JVM sizes its heap from the container memory limit.'
      },
      {
        vi: 'Non-root và read-only: USER nonroot (hoặc USER 10001) để process không chạy UID 0; kết hợp docker run --read-only --tmpfs /tmp để kẻ tấn công không ghi được binary vào filesystem của container. Ứng dụng cần ghi thì ghi vào volume hoặc tmpfs được khai báo rõ.',
        en: 'Non-root and read-only: USER nonroot (or USER 10001) so the process is not UID 0; combine with docker run --read-only --tmpfs /tmp so an attacker cannot drop binaries into the container filesystem. An app that must write uses an explicitly declared volume or tmpfs.'
      },
      {
        vi: 'Secret lúc build: ARG và ENV lưu lại trong image (docker history, config) nên tuyệt đối không dùng cho token. RUN --mount=type=secret,id=maven_settings,target=/root/.m2/settings.xml cùng docker build --secret id=maven_settings,src=… đưa file vào chỉ trong lệnh RUN đó; giá trị secret không nằm trong cache key, nên đổi token không làm miss cache.',
        en: 'Build-time secrets: ARG and ENV persist in the image (docker history, config), so never use them for tokens. RUN --mount=type=secret,id=maven_settings,target=/root/.m2/settings.xml with docker build --secret id=maven_settings,src=… exposes the file only to that RUN; the secret value is not part of the cache key, so rotating the token does not miss the cache.'
      },
      {
        vi: 'Build tái lập: pin base theo digest (FROM eclipse-temurin:21-jre@sha256:…), khoá phiên bản dependency, và đặt SOURCE_DATE_EPOCH để timestamp trong layer cố định. Với CI không có cache cục bộ, dùng --cache-to/--cache-from type=registry (mode=max để cache cả stage build). Lưu ý cache mount không nằm trong cache được export.',
        en: 'Reproducible builds: pin the base by digest (FROM eclipse-temurin:21-jre@sha256:…), lock dependency versions and set SOURCE_DATE_EPOCH so layer timestamps are fixed. On CI without a local cache, use --cache-to/--cache-from type=registry (mode=max to cache the build stage too). Note that cache mounts are not part of the exported cache.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'ARG/ENV chứa token: lộ trong docker history và config image, kể cả khi lệnh sau đã unset.',
        en: 'Tokens in ARG/ENV: exposed in docker history and the image config, even if a later step unsets them.'
      },
      {
        vi: 'Chuyển sang distroless rồi ENTRYPOINT dạng shell hoặc HEALTHCHECK dùng curl: image không có /bin/sh lẫn curl nên container không start được hoặc luôn unhealthy.',
        en: 'Switching to distroless while keeping a shell-form ENTRYPOINT or a curl HEALTHCHECK: the image has neither /bin/sh nor curl, so the container fails to start or stays unhealthy.'
      },
      {
        vi: 'FROM …:latest: build hôm nay khác build hôm qua mà không ai biết.',
        en: 'FROM …:latest: today’s build differs from yesterday’s and nobody knows.'
      },
      {
        vi: 'Đổi USER sang non-root nhưng quên chown thư mục ứng dụng cần ghi: lỗi "Permission denied" chỉ xuất hiện khi chạy.',
        en: 'Switching USER to non-root but forgetting to chown directories the app writes to: "Permission denied" shows up only at run time.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'DAG multi-stage và ranh giới cache', en: 'Multi-stage DAG and cache boundaries' },
    description: {
      vi: 'Chỉ stage runtime được đẩy lên registry; stage build chỉ là nguồn artifact.',
      en: 'Only the runtime stage is pushed; the build stage is just an artifact source.'
    },
    asciiDiagram: `
 stage "build" (maven:3.9-eclipse-temurin-21)        stage "runtime" (distroless/java21)
 ┌─────────────────────────────────────────┐        ┌───────────────────────────────┐
 │ COPY pom.xml            key: sha(pom)   │ cached │ USER nonroot                  │
 │ RUN mvn dependency:go-offline  (8 min)  │ cached │ COPY --from=build app.jar ────┼─▶ 210 MB
 │   --mount=type=cache,target=/root/.m2   │        │ ENTRYPOINT ["java","-jar",…]  │
 │ COPY src/               key: sha(src)   │ MISS ← code change                     │
 │ RUN mvn -o package     (20 s)           │ rebuild└───────────────────────────────┘
 └─────────────────────────────────────────┘
   not shipped: JDK, Maven, sources, ~/.m2 (900 MB)
`,
    components: [
      {
        name: 'Cache key',
        role: 'Per instruction',
        description: {
          vi: 'Parent + text lệnh + checksum file được COPY.',
          en: 'Parent + instruction text + checksum of COPYed files.'
        }
      },
      {
        name: 'Multi-stage',
        role: 'Artifact handoff',
        description: {
          vi: 'COPY --from chỉ lấy đúng file cần.',
          en: 'COPY --from takes only the files you need.'
        }
      },
      {
        name: 'Cache mount',
        role: 'Persistent cache',
        description: {
          vi: 'Thư mục cache tồn tại giữa các build, không vào layer.',
          en: 'A cache dir that persists between builds, never in a layer.'
        }
      },
      {
        name: 'Secret mount',
        role: 'Build secrets',
        description: {
          vi: 'File tmpfs chỉ tồn tại trong lúc RUN.',
          en: 'A tmpfs file present only during the RUN.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'deps-first',
      title: {
        vi: 'COPY pom.xml trước, resolve dependency',
        en: 'COPY pom.xml first, resolve dependencies'
      },
      phase: 'Cache deps',
      description: {
        vi: 'Layer dependency chỉ invalidate khi pom.xml đổi.',
        en: 'The dependency layer only invalidates when pom.xml changes.'
      },
      systemBehavior: {
        vi: 'BuildKit so checksum pom.xml với cache; trùng thì bỏ qua 8 phút tải.',
        en: 'BuildKit compares pom.xml’s checksum to cache; on a hit it skips the 8-minute download.'
      },
      codeLineMatch: 'COPY pom.xml'
    },
    {
      id: 'cache-mount',
      title: { vi: 'Cache mount cho ~/.m2', en: 'Cache mount for ~/.m2' },
      phase: 'BuildKit',
      description: {
        vi: 'Dù pom.xml đổi, phần lớn artifact vẫn có trong cache mount.',
        en: 'Even when pom.xml changes, most artifacts are already in the cache mount.'
      },
      systemBehavior: {
        vi: 'Thư mục cache nằm ngoài layer, không làm image to ra.',
        en: 'The cache directory lives outside layers and never bloats the image.'
      },
      codeLineMatch: '--mount=type=cache'
    },
    {
      id: 'compile',
      title: { vi: 'COPY src & compile', en: 'COPY src & compile' },
      phase: 'Build',
      description: {
        vi: 'Thay đổi code chỉ invalidate từ đây trở xuống.',
        en: 'Code changes invalidate only from here down.'
      },
      systemBehavior: {
        vi: 'Rebuild ~20 giây thay vì 8 phút.',
        en: 'Rebuild in ~20 s instead of 8 min.'
      },
      codeLineMatch: 'COPY src ./src'
    },
    {
      id: 'runtime',
      title: { vi: 'Stage runtime tối giản', en: 'Minimal runtime stage' },
      phase: 'Ship',
      description: {
        vi: 'Distroless + USER nonroot, chỉ COPY --from=build jar; không JDK, Maven, mã nguồn.',
        en: 'Distroless + USER nonroot, only COPY --from=build the jar; no JDK, Maven or sources.'
      },
      systemBehavior: {
        vi: 'Image nhỏ hơn nhiều, không shell, ít package để dính CVE.',
        en: 'A much smaller image, no shell, far fewer packages to carry CVEs.'
      },
      codeLineMatch: 'COPY --from=build'
    }
  ],

  comparison: {
    title: { vi: 'Chọn base image cho stage runtime', en: 'Choosing the runtime base image' },
    subtitle: {
      vi: 'Kích thước, bề mặt tấn công và khả năng debug',
      en: 'Size, attack surface and debuggability'
    },
    options: [
      {
        name: 'eclipse-temurin:21-jre',
        tag: 'Debian/Ubuntu + JRE',
        role: { vi: 'JRE trên distro đầy đủ', en: 'A JRE on a full distro' },
        keyMechanism: {
          vi: 'Có shell và package manager: dễ debug, nhiều package hơn để vá.',
          en: 'Has a shell and package manager: easy to debug, more packages to patch.'
        },
        configExample: 'FROM eclipse-temurin:21-jre@sha256:…',
        architectureNote: {
          vi: 'Bước đầu tốt khi chuyển từ image JDK.',
          en: 'A good first step away from a JDK image.'
        }
      },
      {
        name: 'distroless/java21',
        tag: 'No shell',
        role: { vi: 'Chỉ JRE + libc tối thiểu', en: 'Just a JRE + minimal libc' },
        keyMechanism: {
          vi: 'Không shell, không apt; có biến thể :nonroot và :debug (có busybox).',
          en: 'No shell, no apt; has :nonroot and :debug (busybox) variants.'
        },
        configExample: 'FROM gcr.io/distroless/java21-debian12:nonroot',
        architectureNote: {
          vi: 'ENTRYPOINT và HEALTHCHECK phải dạng exec, không gọi shell.',
          en: 'ENTRYPOINT and HEALTHCHECK must be exec form, with no shell.'
        }
      },
      {
        name: 'jlink custom runtime',
        tag: 'Smallest',
        role: { vi: 'JRE chỉ gồm module cần thiết', en: 'A JRE with only the needed modules' },
        keyMechanism: {
          vi: 'jdeps tìm module, jlink tạo runtime, COPY vào base tối thiểu.',
          en: 'jdeps finds modules, jlink builds the runtime, COPY it onto a minimal base.'
        },
        configExample: 'jlink --add-modules java.base,java.sql,… --strip-debug --output /jre',
        architectureNote: {
          vi: 'Nhỏ nhất nhưng phải bảo trì danh sách module.',
          en: 'Smallest, but the module list must be maintained.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      { vi: 'Build lặp lại nhanh gấp nhiều lần.', en: 'Iterative builds many times faster.' },
      {
        vi: 'Image runtime nhỏ, ít bề mặt tấn công.',
        en: 'Small runtime image, minimal attack surface.'
      },
      { vi: 'Secret không bao giờ nằm trong layer.', en: 'Secrets never end up in layers.' }
    ],
    cons: [
      {
        vi: 'Distroless không có shell — debug cần ephemeral container/debug image.',
        en: 'Distroless has no shell — debugging needs ephemeral/debug containers.'
      },
      {
        vi: 'Cache registry trên CI cần dọn dẹp và quyền truy cập.',
        en: 'Registry cache on CI needs cleanup and access control.'
      }
    ],
    balance: {
      vi: 'Image càng tối giản càng an toàn nhưng càng khó debug tại chỗ.',
      en: 'The more minimal the image, the safer it is — and the harder to debug in place.'
    },
    invariant: {
      vi: 'Một cache miss ở lệnh i làm build lại mọi lệnh j > i trong cùng stage.',
      en: 'A cache miss at instruction i rebuilds every instruction j > i in the same stage.'
    }
  },

  code: [
    {
      label: 'Dockerfile',
      filename: 'Dockerfile',
      language: 'dockerfile',
      code: `# syntax=docker/dockerfile:1.7
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src

# 1) dependencies: invalidated only when pom.xml changes
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \\
    mvn -q -B dependency:go-offline

# 2) sources: invalidated on every code change
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \\
    --mount=type=secret,id=maven_settings,target=/root/.m2/settings.xml \\
    mvn -q -B -o package -DskipTests

# 3) runtime: no JDK, no Maven, no sources, no shell
FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=build /src/target/app.jar app.jar
USER nonroot
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]`
    },
    {
      label: 'run.sh (hardened)',
      filename: 'run.sh',
      language: 'bash',
      code: `# Read-only root filesystem; only /tmp is writable (in memory)
docker run -d --name api --read-only --tmpfs /tmp:rw,size=64m \
  --memory=1g --cpus=1 -p 8080:8080 registry.example.com/api:$GIT_SHA

docker exec api id            # fails: distroless has no shell utilities
docker image ls registry.example.com/api   # compare with the single-stage image
docker history registry.example.com/api:$GIT_SHA   # no ARG token, no ~/.m2`
    },
    {
      label: 'build.sh',
      filename: 'build.sh',
      language: 'bash',
      code: `# .dockerignore: target/  .git/  *.iml  node_modules/
export SOURCE_DATE_EPOCH=$(git log -1 --format=%ct)   # reproducible timestamps
docker buildx build \\
  --secret id=maven_settings,src=$HOME/.m2/settings.xml \\
  --cache-from type=registry,ref=registry.example.com/api:buildcache \\
  --cache-to   type=registry,ref=registry.example.com/api:buildcache,mode=max \\
  -t registry.example.com/api:$GIT_SHA --push .`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Sắp xếp lại Dockerfile Node.js COPY . . && npm ci để build nhanh hơn.',
        en: 'Reorder a Node.js Dockerfile doing COPY . . && npm ci for faster builds.'
      },
      answer: {
        vi: 'COPY package.json package-lock.json ./ → RUN npm ci (kèm --mount=type=cache,target=/root/.npm) → COPY . . → RUN npm run build. Thêm .dockerignore loại node_modules và .git. Dùng multi-stage để stage runtime chỉ chứa dist + production deps.',
        en: 'COPY package.json package-lock.json ./ → RUN npm ci (with --mount=type=cache,target=/root/.npm) → COPY . . → RUN npm run build. Add a .dockerignore excluding node_modules and .git. Use multi-stage so the runtime stage holds only dist + production deps.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Làm sao dùng token private registry khi build mà không lộ vào image?',
        en: 'How do you use a private registry token during build without leaking it into the image?'
      },
      answer: {
        vi: 'BuildKit secret mount: RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci; truyền bằng docker build --secret. File chỉ tồn tại trong tmpfs của lệnh RUN đó, không vào layer hay history. Không dùng ARG/ENV và không COPY rồi rm.',
        en: 'A BuildKit secret mount: RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci, passed via docker build --secret. The file exists only in that RUN’s tmpfs, never in a layer or history. Never use ARG/ENV, and never COPY then rm.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Token Nexus lộ trong image public qua ARG',
      en: 'A Nexus token leaked through ARG in a public image'
    },
    businessContext: {
      vi: 'Dockerfile nhận ARG NEXUS_TOKEN để tải dependency nội bộ; image được đẩy lên registry dùng chung với đối tác.',
      en: 'The Dockerfile took ARG NEXUS_TOKEN to fetch internal dependencies; the image was pushed to a registry shared with partners.'
    },
    problemDescription: {
      vi: 'Một đối tác chạy docker history --no-trunc và đọc được token trong dòng RUN. Token có quyền ghi vào Nexus.',
      en: 'A partner ran docker history --no-trunc and read the token in a RUN line. The token had write access to Nexus.'
    },
    whyNaiveFails: {
      vi: 'Giá trị ARG được dùng trong RUN được ghi vào lịch sử build của image; dùng multi-stage cũng không đủ nếu chính image runtime được build với ARG đó, và xoá file ở bước sau không xoá được layer trước.',
      en: 'ARG values used by a RUN are recorded in the image build history; multi-stage alone does not help if the runtime image itself is built with that ARG, and deleting files later cannot remove earlier layers.'
    },
    coreSolution: {
      vi: 'Thu hồi token, chuyển sang RUN --mount=type=secret, thêm bước CI quét history/config của image tìm chuỗi giống secret trước khi push.',
      en: 'Revoke the token, switch to RUN --mount=type=secret, and add a CI step that scans image history/config for secret-like strings before pushing.'
    },
    productionCode: `RUN --mount=type=secret,id=maven_settings,target=/root/.m2/settings.xml \
    --mount=type=cache,target=/root/.m2/repository \
    mvn -q -B package -DskipTests
# docker buildx build --secret id=maven_settings,src=$HOME/.m2/settings.xml .`,
    productionLanguage: 'dockerfile',
    architectureImpact: {
      vi: 'Token không bao giờ chạm vào layer, history hay cache; đổi token không làm build chậm đi.',
      en: 'The token never touches a layer, the history or the cache; rotating it does not slow builds.'
    }
  },

  researchCitations: [
    DOCKER_CITATIONS.buildCache,
    DOCKER_CITATIONS.buildSecrets,
    DOCKER_CITATIONS.cacheBackends,
    DOCKER_CITATIONS.ociImage
  ]
};
