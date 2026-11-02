import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const imagesLayersDockerfileTopic: DockerTopic = {
  id: 'images-layers-dockerfile',
  roadmapId: 'DOCKER-04',
  category: 'docker-fundamentals',
  level: 'beginner',
  levelTo: 'intermediate',
  chapter: 'Cấp độ 1',
  name: 'Docker Images, Layers & Dockerfile',
  tagline: {
    vi: 'Image = các layer bất biến định danh bằng digest + một config; mỗi lệnh Dockerfile tạo layer hoặc chỉ sửa metadata; build context, .dockerignore và vì sao sửa một file làm mọi bước phía sau build lại.',
    en: 'An image = immutable digest-addressed layers + a config; each Dockerfile instruction adds a layer or only edits metadata; the build context, .dockerignore and why changing one file rebuilds every later step.'
  },
  difficulty: 1,
  order: 4,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Chạy 50 container từ cùng một image 400 MB: nếu mỗi container có bản sao filesystem riêng thì tốn 20 GB và mỗi lần start phải copy 400 MB. Mỗi lần build cũng không thể tải lại toàn bộ dependency chỉ vì sửa một dòng code.',
      en: 'Running 50 containers from one 400 MB image: a private filesystem copy each costs 20 GB and every start copies 400 MB. Nor can every build re-download all dependencies just because one line of code changed.'
    },
    hardwareConstraint: {
      vi: 'Đĩa, băng thông registry và thời gian CI đều hữu hạn. Dữ liệu chỉ có thể được dùng chung an toàn nếu nó bất biến và được định danh theo nội dung.',
      en: 'Disk, registry bandwidth and CI time are finite. Data can only be shared safely if it is immutable and identified by its content.'
    },
    fundamentalSolution: {
      vi: 'Image là một chồng layer tar bất biến, mỗi layer định danh bằng SHA-256 của nội dung, cộng một config JSON (Entrypoint, Env, User, ExposedPorts). Mỗi lệnh RUN/COPY/ADD trong Dockerfile tạo một layer; các lệnh như ENV, EXPOSE, CMD, ENTRYPOINT, LABEL chỉ sửa config. Builder cache từng bước theo cache key (chuỗi lệnh với RUN, checksum file với COPY/ADD): bước nào khớp cache thì dùng lại layer cũ, bước đầu tiên bị miss làm mọi bước phía sau build lại. Khi chạy, union filesystem (OverlayFS) xếp các layer thành rootfs chỉ đọc dùng chung, cộng một writable layer riêng cho mỗi container.',
      en: 'An image is a stack of immutable tar layers, each identified by the SHA-256 of its content, plus a JSON config (Entrypoint, Env, User, ExposedPorts). Each RUN/COPY/ADD instruction creates a layer; instructions such as ENV, EXPOSE, CMD, ENTRYPOINT and LABEL only edit the config. The builder caches each step by a cache key (the command string for RUN, a file checksum for COPY/ADD): matching steps reuse the old layer, and the first miss rebuilds every later step. At run time a union filesystem (OverlayFS) stacks the layers into a shared read-only rootfs plus a private writable layer per container.'
    },
    math: {
      formula: String.raw`T_{\text{build}} \approx \sum_{i=k}^{n} t_i,\qquad k = \min\{\, i : \text{key}_i \neq \text{key}_i^{\text{cached}} \,\}`,
      description: {
        vi: 'Chỉ các bước từ vị trí miss đầu tiên k trở đi tốn thời gian. Đặt thứ ít thay đổi (pom.xml, dependency) lên trước và thứ thay đổi nhiều (src/) xuống cuối để k càng lớn càng tốt.',
        en: 'Only steps from the first miss k onward cost time. Put rarely changing things (pom.xml, dependencies) first and frequently changing ones (src/) last, so k is as large as possible.'
      },
      timeComplexity: 'O(n − k) rebuilt steps after the first cache miss at k',
      spaceComplexity: 'O(unique layers) on disk and in the registry'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Phân biệt ba thứ: Dockerfile (công thức), image (kết quả bất biến trong registry) và container (instance đang chạy có writable layer).',
      en: 'Distinguish three things: the Dockerfile (the recipe), the image (the immutable result in a registry) and the container (a running instance with a writable layer).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Cấu trúc OCI: image index (multi-arch) → manifest cho từng nền tảng → config + danh sách layer. Digest của layer là SHA-256 của blob nén; config chứa rootfs.diff_ids (SHA-256 của tar chưa nén) cùng Entrypoint, Env, User và history. Layer giống nhau giữa các image (ví dụ base eclipse-temurin) chỉ được tải và lưu một lần.',
        en: 'OCI structure: image index (multi-arch) → per-platform manifest → config + layer list. A layer digest is the SHA-256 of the compressed blob; the config holds rootfs.diff_ids (SHA-256 of the uncompressed tars) plus Entrypoint, Env, User and history. Layers shared across images (e.g. the eclipse-temurin base) are downloaded and stored once.'
      },
      {
        vi: 'Các lệnh Dockerfile: FROM chọn base image; WORKDIR đặt thư mục làm việc; COPY sao chép file từ build context; ADD giống COPY nhưng còn tải URL và tự giải nén tar cục bộ (ưu tiên COPY cho rõ ràng); RUN chạy lệnh lúc build và ghi kết quả thành layer; ENV và ARG khai báo biến (ARG chỉ tồn tại lúc build); EXPOSE chỉ là tài liệu, không publish port; CMD và ENTRYPOINT xác định lệnh khi chạy (DOCKER-03). docker history hiện 0B cho các lệnh chỉ sửa metadata.',
        en: 'Dockerfile instructions: FROM picks the base image; WORKDIR sets the working directory; COPY copies files from the build context; ADD is COPY plus URL fetching and automatic local tar extraction (prefer COPY for clarity); RUN executes at build time and records the result as a layer; ENV and ARG declare variables (ARG exists only at build time); EXPOSE is documentation only and publishes nothing; CMD and ENTRYPOINT define the run-time command (DOCKER-03). docker history shows 0B for metadata-only instructions.'
      },
      {
        vi: 'Build context là tập file mà build được phép đọc — thường là thư mục chứa Dockerfile (dấu "." trong docker build .). File khớp .dockerignore bị loại trước khi gửi tới builder, nên .git, target/, node_modules, .env không bao giờ lọt vào image và không làm hỏng cache của COPY . . Cache key của COPY/ADD tính từ nội dung và metadata file nhưng KHÔNG tính mtime — git checkout lại cùng nội dung vẫn trúng cache.',
        en: 'The build context is the set of files a build may read — usually the directory holding the Dockerfile (the "." in docker build .). Files matching .dockerignore are removed before reaching the builder, so .git, target/, node_modules and .env never leak into the image or break the COPY . . cache. The COPY/ADD cache key comes from file content and metadata but NOT mtime — re-checking out identical content still hits the cache.'
      },
      {
        vi: 'Xoá file ở layer sau không làm image nhỏ đi: file vẫn nằm trong layer trước, layer sau chỉ thêm whiteout. Vì vậy apt-get install và rm -rf /var/lib/apt/lists/* phải nằm trong CÙNG một RUN, và secret đã COPY vào rồi xoá vẫn lộ trong layer. Tag (my/api:1.4.2, latest) là con trỏ có thể bị trỏ lại; digest (my/api@sha256:…) là định danh bất biến.',
        en: 'Deleting a file in a later layer never shrinks the image: the file still lives in the earlier layer and the later one only adds a whiteout. That is why apt-get install and rm -rf /var/lib/apt/lists/* must share ONE RUN, and a secret COPYed then deleted still leaks in a layer. A tag (my/api:1.4.2, latest) is a pointer that can be moved; a digest (my/api@sha256:…) is an immutable identity.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'COPY . . trước khi cài dependency: sửa bất kỳ file nào cũng làm miss cache và tải lại toàn bộ Maven/npm dependency.',
        en: 'COPY . . before installing dependencies: changing any file misses the cache and re-downloads every Maven/npm dependency.'
      },
      {
        vi: 'Thiếu .dockerignore: build context hàng GB (target/, .git), build chậm và có thể đóng gói cả file .env chứa credential.',
        en: 'No .dockerignore: a multi-GB build context (target/, .git), slow builds and possibly a packaged .env full of credentials.'
      },
      {
        vi: 'RUN apt-get update ở một lệnh và apt-get install ở lệnh khác: layer update được cache mãi, install sau đó dùng danh sách package cũ.',
        en: 'RUN apt-get update in one instruction and apt-get install in another: the update layer stays cached forever and later installs use a stale package list.'
      },
      {
        vi: 'Deploy bằng tag latest: hai node pull cùng tag ở hai thời điểm có thể chạy hai image khác nhau.',
        en: 'Deploying the latest tag: two nodes pulling it at different times may run different images.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Từ Dockerfile tới image và container',
      en: 'From Dockerfile to image to container'
    },
    description: {
      vi: 'Builder nhận build context đã lọc, chạy từng lệnh, ghi layer theo digest; container xếp các layer đó dưới một writable layer.',
      en: 'The builder receives the filtered build context, runs each instruction and records layers by digest; a container stacks those layers under a writable layer.'
    },
    asciiDiagram: `
 build context (. minus .dockerignore)          IMAGE my/api:1.4.2 → sha256:9c1e…
 ┌──────────────────────────┐   docker build    ┌───────────────────────────────────┐
 │ Dockerfile  pom.xml      │ ───────────────►  │ config  {Entrypoint, Env, Expose} │
 │ mvnw  .mvn/  src/        │                   │ L4  RUN mvnw package    sha256:e5…│
 │ (.git target/ .env  ✗)   │                   │ L3  COPY src            sha256:d4…│
 └──────────────────────────┘                   │ L2  RUN go-offline      sha256:c3…│
                                                │ L1  COPY mvnw pom.xml   sha256:b2…│
 CONTAINER (OverlayFS)                          │ L0  FROM temurin:21-jdk sha256:a1…│
   merged /   = upper (rw, per container)       └───────────────────────────────────┘
              + L4..L0 (ro, shared by every container of this image)
`,
    components: [
      {
        name: 'Build context',
        role: 'Input',
        description: {
          vi: 'Các file build được phép đọc, sau khi .dockerignore lọc bớt.',
          en: 'Files the build may read, after .dockerignore filtering.'
        }
      },
      {
        name: 'Layer',
        role: 'Filesystem diff',
        description: {
          vi: 'Tar bất biến do RUN/COPY/ADD tạo, định danh bằng SHA-256.',
          en: 'An immutable tar created by RUN/COPY/ADD, identified by SHA-256.'
        }
      },
      {
        name: 'Config',
        role: 'Metadata',
        description: {
          vi: 'Entrypoint, Cmd, Env, User, ExposedPorts, history.',
          en: 'Entrypoint, Cmd, Env, User, ExposedPorts, history.'
        }
      },
      {
        name: 'Tag → digest',
        role: 'Naming',
        description: {
          vi: 'Tag là con trỏ dễ đọc; digest là định danh bất biến.',
          en: 'A tag is a readable pointer; a digest is an immutable identity.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'context-from',
      title: { vi: 'Build context & FROM', en: 'Build context & FROM' },
      phase: 'Base',
      description: {
        vi: 'Context đã lọc .dockerignore được gửi tới builder; FROM kéo layer của base image theo digest.',
        en: 'The .dockerignore-filtered context goes to the builder; FROM pulls the base image layers by digest.'
      },
      systemBehavior: {
        vi: 'Layer đã có trong cache cục bộ thì không tải lại.',
        en: 'Layers already in the local store are not downloaded again.'
      },
      codeLineMatch: 'FROM eclipse-temurin:21-jdk'
    },
    {
      id: 'layers',
      title: { vi: 'Mỗi lệnh → layer hoặc metadata', en: 'Each instruction → layer or metadata' },
      phase: 'Build',
      description: {
        vi: 'COPY pom.xml rồi RUN go-offline tạo hai layer; lần build sau cả hai trúng cache nếu pom.xml không đổi.',
        en: 'COPY pom.xml then RUN go-offline create two layers; on the next build both hit the cache if pom.xml is unchanged.'
      },
      systemBehavior: {
        vi: 'Cache key: checksum file cho COPY, chuỗi lệnh cho RUN.',
        en: 'Cache key: a file checksum for COPY, the command string for RUN.'
      },
      codeLineMatch: 'COPY mvnw pom.xml ./'
    },
    {
      id: 'invalidate',
      title: {
        vi: 'Sửa src/ → miss, phía sau build lại',
        en: 'Edit src/ → miss, rebuild downstream'
      },
      phase: 'Invalidate',
      description: {
        vi: 'Checksum của COPY src đổi: bước này và mọi bước sau build lại, các bước trước vẫn dùng cache.',
        en: 'The COPY src checksum changes: this step and all later ones rebuild; earlier steps stay cached.'
      },
      systemBehavior: {
        vi: 'Dependency đã nằm ở layer trước nên không tải lại.',
        en: 'Dependencies sit in an earlier layer, so nothing is re-downloaded.'
      },
      codeLineMatch: 'COPY src ./src'
    },
    {
      id: 'tag-digest',
      title: { vi: 'Config, tag & digest', en: 'Config, tag & digest' },
      phase: 'Publish',
      description: {
        vi: 'ENV, EXPOSE, ENTRYPOINT chỉ ghi vào config; image nhận tag và một digest bất biến.',
        en: 'ENV, EXPOSE and ENTRYPOINT only write the config; the image gets a tag and an immutable digest.'
      },
      systemBehavior: {
        vi: 'Đổi config mà không đổi layer vẫn sinh digest manifest mới.',
        en: 'Changing the config without changing layers still yields a new manifest digest.'
      },
      codeLineMatch: 'ENTRYPOINT ["java", "-jar", "app.jar"]'
    }
  ],

  comparison: {
    title: { vi: 'COPY vs ADD vs RUN --mount', en: 'COPY vs ADD vs RUN --mount' },
    subtitle: {
      vi: 'Ba cách đưa file vào lúc build',
      en: 'Three ways to bring files in at build time'
    },
    options: [
      {
        name: 'COPY',
        tag: 'Default',
        role: { vi: 'Sao chép từ build context', en: 'Copy from the build context' },
        keyMechanism: {
          vi: 'Dễ đoán; cache theo checksum file; tạo một layer.',
          en: 'Predictable; cached by file checksum; creates a layer.'
        },
        configExample: 'COPY --chown=app:app target/app.jar /app/app.jar',
        architectureNote: {
          vi: 'Dùng cho gần như mọi trường hợp.',
          en: 'Use it for almost everything.'
        }
      },
      {
        name: 'ADD',
        tag: 'Magic',
        role: { vi: 'COPY + URL + tự giải nén tar', en: 'COPY + URLs + tar auto-extract' },
        keyMechanism: {
          vi: 'Tự giải nén tar cục bộ, tải được URL/Git; hành vi ngầm dễ gây bất ngờ.',
          en: 'Auto-extracts local tars, can fetch URLs/Git; implicit behaviour causes surprises.'
        },
        configExample: 'ADD --checksum=sha256:… https://…/agent.jar /opt/agent.jar',
        architectureNote: {
          vi: 'Chỉ dùng khi thực sự cần giải nén hoặc tải có checksum.',
          en: 'Use only when you need extraction or a checksummed download.'
        }
      },
      {
        name: 'RUN --mount=type=bind',
        tag: 'No layer',
        role: { vi: 'Dùng file mà không lưu vào image', en: 'Use files without storing them' },
        keyMechanism: {
          vi: 'Mount file từ context chỉ trong lúc RUN; kết quả RUN mới thành layer.',
          en: 'Mounts context files only during the RUN; only the RUN output becomes a layer.'
        },
        configExample: 'RUN --mount=type=bind,source=pom.xml,target=pom.xml ./mvnw …',
        architectureNote: {
          vi: 'Hữu ích khi file chỉ cần để build (DOCKER-05).',
          en: 'Useful when a file is only needed to build (DOCKER-05).'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Layer dùng chung → tiết kiệm đĩa, băng thông và thời gian khởi động.',
        en: 'Shared layers → less disk, bandwidth and start time.'
      },
      {
        vi: 'Cache theo bước → build lại chỉ phần thay đổi.',
        en: 'Per-step caching → only changed parts rebuild.'
      },
      {
        vi: 'Digest bất biến → build tái lập, ký và xác minh được.',
        en: 'Immutable digests → reproducible, signable, verifiable builds.'
      }
    ],
    cons: [
      {
        vi: 'Thứ tự lệnh sai làm cache gần như vô dụng.',
        en: 'A poor instruction order makes the cache nearly useless.'
      },
      {
        vi: 'Xoá file ở layer sau không làm image nhỏ đi.',
        en: 'Deleting files in later layers never shrinks the image.'
      }
    ],
    balance: {
      vi: 'Tách lệnh để cache tốt hơn, nhưng gộp các bước tạo-rồi-xoá vào một RUN; giữ số layer vừa phải.',
      en: 'Split instructions for better caching, but merge create-then-delete steps into one RUN; keep the layer count moderate.'
    },
    invariant: {
      vi: 'Layer đã build không bao giờ thay đổi; mọi thay đổi tạo layer mới với digest mới.',
      en: 'A built layer never changes; every change creates a new layer with a new digest.'
    }
  },

  code: [
    {
      label: 'Dockerfile',
      filename: 'Dockerfile',
      language: 'dockerfile',
      code: `# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Rarely changes -> early layers, cached across most builds
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -q dependency:go-offline

# Changes on every commit -> as late as possible
COPY src ./src
RUN ./mvnw -q package -DskipTests && cp target/*.jar app.jar

# Metadata only: written to the image config, no filesystem layer
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
# Still ships a JDK and Maven caches — DOCKER-05 fixes that with multi-stage`
    },
    {
      label: '.dockerignore',
      filename: '.dockerignore',
      language: 'bash',
      code: `# Removed from the build context before it reaches the builder
.git
target/
*.log
.env
.idea/
**/node_modules`
    },
    {
      label: 'inspect.sh',
      filename: 'inspect.sh',
      language: 'bash',
      code: `docker build -t my/api:1.4.2 .
docker history my/api:1.4.2               # one row per instruction; 0B = metadata only
docker image inspect -f '{{json .RootFS.Layers}}' my/api:1.4.2

# Rebuild after editing src/: steps up to "RUN ./mvnw ... go-offline" print CACHED
echo "// change" >> src/main/java/App.java
docker build --progress=plain -t my/api:1.4.3 .

# Tag vs digest
docker image ls --digests my/api
docker buildx imagetools inspect eclipse-temurin:21-jre   # index -> per-platform manifests

# Union filesystem underneath a container: copy-up on write, whiteout on delete
mkdir -p lower upper work merged && echo "debug=false" > lower/app.conf
sudo mount -t overlay overlay -o lowerdir=lower,upperdir=upper,workdir=work merged
echo "debug=true" > merged/app.conf && cat lower/app.conf   # lower untouched`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Lệnh nào trong Dockerfile tạo layer, lệnh nào không?',
        en: 'Which Dockerfile instructions create layers and which do not?'
      },
      answer: {
        vi: 'RUN, COPY và ADD thay đổi filesystem nên tạo layer. ENV, ARG, EXPOSE, CMD, ENTRYPOINT, LABEL, USER, WORKDIR (khi thư mục đã có) chỉ sửa config của image; docker history hiện 0B cho chúng.',
        en: 'RUN, COPY and ADD change the filesystem, so they create layers. ENV, ARG, EXPOSE, CMD, ENTRYPOINT, LABEL, USER and WORKDIR (when the directory exists) only edit the image config; docker history shows 0B for them.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Vì sao image vẫn 1,2 GB dù đã RUN rm -rf /build ở cuối Dockerfile?',
        en: 'Why is the image still 1.2 GB despite RUN rm -rf /build at the end of the Dockerfile?'
      },
      answer: {
        vi: '/build nằm trong một layer trước đó; rm chỉ thêm whiteout ở layer mới, còn kích thước image là tổng các layer. Giải pháp: tạo và xoá trong cùng một RUN, hoặc tốt hơn là multi-stage build chỉ COPY artifact cuối cùng (DOCKER-05).',
        en: '/build lives in an earlier layer; rm only adds a whiteout in a new one, and image size is the sum of layers. Fix: create and delete in the same RUN, or better, a multi-stage build that COPYs only the final artifact (DOCKER-05).'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Build trên CI luôn tải lại toàn bộ dependency Maven. Kiểm tra gì?',
        en: 'CI builds always re-download every Maven dependency. What do you check?'
      },
      answer: {
        vi: 'Thứ tự lệnh: pom.xml phải được COPY và dependency được resolve trước COPY src. Kiểm tra .dockerignore (file thay đổi liên tục như target/ hay .git lọt vào context sẽ làm miss COPY . .). Trên CI runner tạm thời, cache cục bộ không còn — cần cache backend (registry/gha) hoặc cache mount (DOCKER-05, DOCKER-11).',
        en: 'Instruction order: pom.xml must be COPYed and dependencies resolved before COPY src. Check .dockerignore (constantly changing files such as target/ or .git in the context miss a COPY . .). On ephemeral CI runners the local cache is gone — use a cache backend (registry/gha) or cache mounts (DOCKER-05, DOCKER-11).'
      }
    }
  ],

  researchCitations: [
    DOCKER_CITATIONS.dockerfileReference,
    DOCKER_CITATIONS.cacheInvalidation,
    DOCKER_CITATIONS.buildContext,
    DOCKER_CITATIONS.ociImage,
    DOCKER_CITATIONS.overlayfs
  ]
};
