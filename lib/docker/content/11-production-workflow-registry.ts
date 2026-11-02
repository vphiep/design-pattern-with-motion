import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const productionWorkflowRegistryTopic: DockerTopic = {
  id: 'production-workflow-registry',
  roadmapId: 'DOCKER-11',
  category: 'docker-production',
  level: 'advanced',
  chapter: 'Cấp độ 3',
  name: 'Docker Production Workflow & Registry',
  tagline: {
    vi: 'Build một lần cho mỗi commit, đẩy lên private registry, gắn tag theo SHA và semver trỏ cùng một digest, promote dev → staging → production bằng cách copy digest (không build lại), rollback bằng digest trước đó và chính sách lưu giữ artifact.',
    en: 'Build once per commit, push to a private registry, tag by SHA and semver pointing at one digest, promote dev → staging → production by copying the digest (no rebuild), roll back to the previous digest and keep an artifact retention policy.'
  },
  difficulty: 3,
  order: 11,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Mỗi môi trường tự build image từ branch của mình: staging chạy bản build lúc 10h, production build lại lúc 15h với base image vừa cập nhật và một dependency SNAPSHOT khác. Thứ đã test không phải thứ đang chạy. Khi sự cố xảy ra, không ai trả lời được "production đang chạy chính xác cái gì" và rollback nghĩa là build lại một commit cũ — với dependency của hôm nay.',
      en: 'Each environment builds its own image from its own branch: staging runs the 10am build, production rebuilds at 3pm with a freshly updated base image and a different SNAPSHOT dependency. What was tested is not what runs. When an incident hits, nobody can say "exactly what is production running", and rolling back means rebuilding an old commit — with today’s dependencies.'
    },
    hardwareConstraint: {
      vi: 'Build không tự nhiên tái lập được: base image, package mirror và dependency thay đổi theo thời gian. Tag là con trỏ có thể bị ghi đè. CI runner tạm thời không giữ build cache giữa các lần chạy.',
      en: 'Builds are not naturally reproducible: base images, package mirrors and dependencies change over time. Tags are pointers that can be overwritten. Ephemeral CI runners keep no build cache between runs.'
    },
    fundamentalSolution: {
      vi: 'Build once, deploy many: CI build image đúng một lần cho mỗi commit, đẩy lên registry và ghi lại digest. Mọi tag (sha-<commit>, 1.4.2) chỉ là tên khác của cùng digest đó. Promote giữa các môi trường bằng cách copy/retag digest sang repository hoặc registry của môi trường đích — không build lại. Cấu hình theo môi trường đi qua env/secret lúc chạy, không nằm trong image. Deploy và rollback đều theo digest; registry bật tag immutability cho tag release và có chính sách lưu giữ.',
      en: 'Build once, deploy many: CI builds the image exactly once per commit, pushes it and records the digest. Every tag (sha-<commit>, 1.4.2) is just another name for that digest. Promotion between environments copies/retags the digest into the target environment’s repository or registry — no rebuild. Environment-specific config comes via env/secrets at run time, never baked into the image. Deploys and rollbacks both use digests; the registry enforces tag immutability for release tags and has a retention policy.'
    },
    math: {
      formula: String.raw`\text{digest}_{\text{prod}} = \text{digest}_{\text{staging}} = \text{digest}_{\text{CI}} = \operatorname{sha256}(\text{manifest})`,
      description: {
        vi: 'Bất biến cốt lõi của quy trình: cùng một digest đi qua mọi môi trường. Digest là hash mật mã của manifest, nên nếu digest giống nhau thì từng byte của layer và config cũng giống nhau — thứ đã test chính là thứ đang chạy.',
        en: 'The core invariant of the workflow: one digest flows through every environment. A digest is the cryptographic hash of the manifest, so equal digests mean byte-identical layers and config — what was tested is what runs.'
      },
      timeComplexity: 'Promotion = O(missing blobs) copy, no rebuild',
      spaceComplexity: 'Layers shared across tags and repositories are stored once'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Registry là kho artifact của hệ thống container; quy trình đúng biến nó thành nguồn sự thật duy nhất về "cái gì đang chạy ở đâu".',
      en: 'The registry is the artifact store of a container platform; the right workflow turns it into the single source of truth for "what runs where".'
    },
    deepDiveParagraphs: [
      {
        vi: 'Tên image theo dạng [HOST[:PORT]/]NAMESPACE/REPOSITORY[:TAG]; thiếu host thì là docker.io, thiếu tag thì là latest. Theo OCI Distribution Spec, client lấy manifest bằng GET /v2/<name>/manifests/<tag-or-digest>; tag tối đa 128 ký tự và chỉ là con trỏ dễ đọc tới manifest — một digest có thể có không, một hoặc nhiều tag. Vì vậy manifest Kubernetes/Compose ở production nên tham chiếu image@sha256:…, còn tag dùng cho con người.',
        en: 'Image names follow [HOST[:PORT]/]NAMESPACE/REPOSITORY[:TAG]; the host defaults to docker.io and the tag to latest. Per the OCI Distribution Spec, clients fetch a manifest with GET /v2/<name>/manifests/<tag-or-digest>; a tag is at most 128 characters and merely a readable pointer to a manifest — one digest can have zero, one or many tags. So production Kubernetes/Compose manifests should reference image@sha256:…, while tags are for humans.'
      },
      {
        vi: 'Chiến lược tag: sha-<commit> cho mọi build (truy ngược về source), semver (1.4.2) cho bản release, và tránh deploy latest hay tag dạng "prod". Bật tag immutability ở registry (ECR, Harbor, Artifact Registry đều hỗ trợ) để 1.4.2 không thể bị ghi đè. Cache trên CI: --cache-to/--cache-from type=registry lưu build cache thành một image riêng, mode=max để cache cả stage trung gian.',
        en: 'Tagging strategy: sha-<commit> for every build (traceable to source), semver (1.4.2) for releases, and never deploy latest or tags like "prod". Enable tag immutability on the registry (ECR, Harbor and Artifact Registry all support it) so 1.4.2 can never be overwritten. CI caching: --cache-to/--cache-from type=registry stores the build cache as a separate image; mode=max also caches intermediate stages.'
      },
      {
        vi: 'Promotion: copy digest từ registry dev sang registry/repository production (docker buildx imagetools create, crane copy, skopeo copy) chỉ chuyển các blob còn thiếu — không build lại, không đổi digest. Cổng kiểm soát giữa các môi trường (test pass, scan sạch, chữ ký hợp lệ — DOCKER-09) quyết định digest nào được copy. Tách registry theo môi trường giúp giới hạn quyền: CI dev không có quyền push vào registry production.',
        en: 'Promotion: copying a digest from the dev registry to the production registry/repository (docker buildx imagetools create, crane copy, skopeo copy) transfers only missing blobs — no rebuild, no digest change. Gates between environments (tests passed, clean scan, valid signature — DOCKER-09) decide which digests get copied. Separate registries per environment limit permissions: dev CI cannot push to the production registry.'
      },
      {
        vi: 'Rollback và lưu giữ: rollback là deploy lại digest trước đó đã được ghi nhận (deploy log, Git history của GitOps repo), không phải build lại commit cũ. Chính sách lưu giữ giữ N bản release gần nhất và mọi digest đang chạy, xoá image chỉ có tag sha-* cũ hơn X ngày; registry cần garbage collection để thu hồi blob không còn manifest nào tham chiếu.',
        en: 'Rollback and retention: a rollback redeploys a previously recorded digest (deploy log, the GitOps repo history), not a rebuild of an old commit. A retention policy keeps the last N releases and every running digest, and deletes sha-* only images older than X days; the registry needs garbage collection to reclaim blobs no manifest references any more.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Build lại cho từng môi trường: staging và production chạy hai digest khác nhau từ "cùng" commit.',
        en: 'Rebuilding per environment: staging and production run two different digests from the "same" commit.'
      },
      {
        vi: 'Đưa cấu hình môi trường (URL DB, feature flag) vào image bằng ARG: buộc phải build một image cho mỗi môi trường.',
        en: 'Baking environment config (DB URLs, feature flags) into the image via ARG: forces one image per environment.'
      },
      {
        vi: 'Retention xoá image cũ theo tuổi mà không loại trừ digest đang chạy: node mới không pull được image, Pod kẹt ImagePullBackOff.',
        en: 'A retention policy deleting images by age without excluding running digests: new nodes cannot pull and Pods get stuck in ImagePullBackOff.'
      },
      {
        vi: 'Pull trực tiếp từ Docker Hub ở production không có mirror/cache: dính rate limit hoặc sự cố của registry bên ngoài.',
        en: 'Pulling straight from Docker Hub in production with no mirror/cache: hitting rate limits or an external registry outage.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Một digest đi qua mọi môi trường', en: 'One digest through every environment' },
    description: {
      vi: 'CI build một lần; các môi trường chỉ copy và deploy cùng digest, cấu hình đến từ môi trường.',
      en: 'CI builds once; environments only copy and deploy the same digest, with config supplied by each environment.'
    },
    asciiDiagram: `
 git commit 3f9c2a1
      │ CI: docker buildx build --push   (cache: registry, mode=max)
      ▼
 dev.registry/shop/api:sha-3f9c2a1 ──► sha256:9c1e…   (+ SBOM, provenance, signature)
      │ tests pass on dev                     │
      │ imagetools create (copy blobs)        │ same digest
      ▼                                       ▼
 stg.registry/shop/api:1.4.2  ─────────► sha256:9c1e…   deploy: env=staging, secrets=staging
      │ approval / gates
      ▼
 prod.registry/shop/api:1.4.2 (immutable) ► sha256:9c1e…  deploy: env=prod, secrets=prod
 rollback: redeploy previous digest sha256:77ab… from the deploy log
`,
    components: [
      {
        name: 'Private registry',
        role: 'Artifact store',
        description: {
          vi: 'Lưu image, attestation, chữ ký; có quyền truy cập theo môi trường.',
          en: 'Stores images, attestations and signatures with per-environment access.'
        }
      },
      {
        name: 'Digest',
        role: 'Identity',
        description: {
          vi: 'Định danh bất biến của artifact; thứ duy nhất nên deploy.',
          en: 'The artifact’s immutable identity; the only thing you should deploy.'
        }
      },
      {
        name: 'Promotion',
        role: 'Copy, not rebuild',
        description: {
          vi: 'Copy digest sang registry đích sau khi qua các cổng kiểm soát.',
          en: 'Copy the digest to the target registry after passing gates.'
        }
      },
      {
        name: 'Retention',
        role: 'Lifecycle',
        description: {
          vi: 'Giữ release và digest đang chạy, dọn build cũ, chạy GC.',
          en: 'Keep releases and running digests, clean old builds, run GC.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'build-once',
      title: { vi: 'Build một lần cho mỗi commit', en: 'Build once per commit' },
      phase: 'Build',
      description: {
        vi: 'CI build, đẩy image tag sha-<commit> và ghi lại digest từ metadata.',
        en: 'CI builds, pushes the sha-<commit> tag and records the digest from metadata.'
      },
      systemBehavior: {
        vi: 'Registry lưu blob theo digest; layer đã có không phải tải lên lại.',
        en: 'The registry stores blobs by digest; existing layers are not uploaded again.'
      },
      codeLineMatch: 'docker buildx build --push'
    },
    {
      id: 'registry-cache',
      title: { vi: 'Build cache trên registry', en: 'Build cache in the registry' },
      phase: 'Cache',
      description: {
        vi: 'Runner tạm thời đọc và ghi cache từ một image cache riêng.',
        en: 'Ephemeral runners read and write the cache from a dedicated cache image.'
      },
      systemBehavior: {
        vi: 'mode=max lưu cả layer của stage build, không chỉ layer của image cuối.',
        en: 'mode=max stores build-stage layers too, not just the final image layers.'
      },
      codeLineMatch: '--cache-to type=registry'
    },
    {
      id: 'release-tag',
      title: { vi: 'Tag release trỏ cùng digest', en: 'Release tags point at the same digest' },
      phase: 'Tag',
      description: {
        vi: 'Gắn 1.4.2 cho digest đã build — không build lại.',
        en: 'Tag the already built digest as 1.4.2 — no rebuild.'
      },
      systemBehavior: {
        vi: 'Chỉ manifest mới được ghi; layer giữ nguyên.',
        en: 'Only manifest references are written; layers are unchanged.'
      },
      codeLineMatch: 'imagetools create --tag $IMG:1.4.2'
    },
    {
      id: 'promote',
      title: { vi: 'Promote sang production', en: 'Promote to production' },
      phase: 'Promote',
      description: {
        vi: 'Copy digest sang registry production sau khi qua cổng kiểm soát.',
        en: 'Copy the digest into the production registry after the gates pass.'
      },
      systemBehavior: {
        vi: 'Chỉ blob còn thiếu được chuyển; digest không đổi.',
        en: 'Only missing blobs are transferred; the digest does not change.'
      },
      codeLineMatch: 'prod.example.com/shop/api:1.4.2'
    },
    {
      id: 'rollback',
      title: { vi: 'Deploy & rollback theo digest', en: 'Deploy & roll back by digest' },
      phase: 'Operate',
      description: {
        vi: 'Ghi digest vào deploy log; rollback là deploy lại digest trước đó.',
        en: 'Record the digest in the deploy log; a rollback redeploys the previous digest.'
      },
      systemBehavior: {
        vi: 'Retention phải giữ mọi digest đang chạy hoặc có thể rollback.',
        en: 'Retention must keep every running or rollback-able digest.'
      },
      codeLineMatch: 'Rollback = redeploy'
    }
  ],

  comparison: {
    title: {
      vi: 'Rebuild per environment vs Build once, promote',
      en: 'Rebuild per environment vs Build once, promote'
    },
    subtitle: {
      vi: 'Hai cách đưa image tới production',
      en: 'Two ways to get an image to production'
    },
    options: [
      {
        name: 'Rebuild per environment',
        tag: 'Anti-pattern',
        role: { vi: 'Mỗi môi trường một lần build', en: 'One build per environment' },
        keyMechanism: {
          vi: 'Base image và dependency có thể đổi giữa các lần build; digest khác nhau.',
          en: 'Base images and dependencies may change between builds; digests differ.'
        },
        configExample: 'docker build --build-arg ENV=prod -t api:prod .',
        architectureNote: {
          vi: 'Thứ đã test không phải thứ đang chạy.',
          en: 'What was tested is not what runs.'
        }
      },
      {
        name: 'Build once, promote digest',
        tag: 'Recommended',
        role: { vi: 'Một artifact, nhiều môi trường', en: 'One artifact, many environments' },
        keyMechanism: {
          vi: 'Copy digest giữa registry; cấu hình đến từ env/secret lúc chạy.',
          en: 'Copy the digest between registries; config comes from env/secrets at run time.'
        },
        configExample: 'docker buildx imagetools create --tag prod/api:1.4.2 dev/api@sha256:…',
        architectureNote: {
          vi: 'Truy vết được, rollback tức thì, khớp với GitOps (DEVOPS-12).',
          en: 'Traceable, instant rollback, fits GitOps (DEVOPS-12).'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Thứ đã test chính là thứ đang chạy, chứng minh được bằng digest.',
        en: 'What was tested is what runs, provable by digest.'
      },
      {
        vi: 'Rollback nhanh và chắc chắn: không cần build lại.',
        en: 'Fast, certain rollback: no rebuild required.'
      },
      {
        vi: 'Phân quyền rõ giữa registry các môi trường.',
        en: 'Clear permission boundaries between environment registries.'
      }
    ],
    cons: [
      {
        vi: 'Ứng dụng phải nhận toàn bộ cấu hình từ bên ngoài image.',
        en: 'The app must take all configuration from outside the image.'
      },
      {
        vi: 'Cần quản lý retention và garbage collection của registry.',
        en: 'Registry retention and garbage collection must be managed.'
      }
    ],
    balance: {
      vi: 'Image chỉ chứa code và runtime; mọi khác biệt giữa môi trường nằm ở cấu hình. Đổi lại, cấu hình phải được quản lý chặt như code (GitOps, secret manager).',
      en: 'The image holds only code and runtime; every difference between environments lives in config. In return, config must be managed as rigorously as code (GitOps, a secret manager).'
    },
    invariant: {
      vi: 'Một commit sinh ra đúng một digest, và chính digest đó đi qua mọi môi trường.',
      en: 'One commit produces exactly one digest, and that digest flows through every environment.'
    }
  },

  code: [
    {
      label: 'release.sh',
      filename: 'release.sh',
      language: 'bash',
      code: `IMG=dev.example.com/shop/api
SHA=$(git rev-parse --short=12 HEAD)

# 1) Build ONCE per commit, push, record the digest
docker buildx build --push --metadata-file meta.json \\
  --cache-from type=registry,ref=$IMG:buildcache \\
  --cache-to type=registry,ref=$IMG:buildcache,mode=max \\
  -t $IMG:sha-$SHA .
DIGEST=$(jq -r '."containerimage.digest"' meta.json)

# 2) Release tag = another name for the same digest (no rebuild)
docker buildx imagetools create --tag $IMG:1.4.2 $IMG@$DIGEST

# 3) Promote after the gates: copy the exact digest into the prod registry
docker buildx imagetools create --tag prod.example.com/shop/api:1.4.2 $IMG@$DIGEST
docker buildx imagetools inspect prod.example.com/shop/api:1.4.2   # same sha256

# 4) Deploy by digest and keep a log
echo "$(date -u +%FT%TZ) api $DIGEST" >> deploy-log.txt
# Rollback = redeploy the previous digest from deploy-log.txt, never "rebuild v1.4.1"`
    },
    {
      label: 'compose.prod.yaml',
      filename: 'compose.prod.yaml',
      language: 'yaml',
      code: `services:
  api:
    # Pinned by digest; the tag in the comment is for humans only (1.4.2)
    image: prod.example.com/shop/api@sha256:9c1e4b…
    environment:
      SPRING_PROFILES_ACTIVE: prod          # config from the environment,
      SPRING_DATASOURCE_URL: \${DB_URL}      # never baked into the image
    secrets: [db_password]
secrets:
  db_password:
    external: true`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: '"Build once, deploy many" nghĩa là gì và cấu hình theo môi trường để ở đâu?',
        en: 'What does "build once, deploy many" mean, and where does per-environment config go?'
      },
      answer: {
        vi: 'Mỗi commit chỉ build một image; cùng digest đó được deploy lên dev, staging và production. Mọi khác biệt (URL DB, credential, feature flag) đến từ biến môi trường, file cấu hình mount vào hoặc secret lúc chạy — không phải build arg.',
        en: 'Each commit builds exactly one image; that same digest is deployed to dev, staging and production. Every difference (DB URLs, credentials, feature flags) comes from env vars, mounted config files or secrets at run time — never build args.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Production gặp lỗi sau deploy 1.4.2. Bạn rollback thế nào và cần gì để rollback chắc chắn thành công?',
        en: 'Production breaks after deploying 1.4.2. How do you roll back, and what makes the rollback reliable?'
      },
      answer: {
        vi: 'Deploy lại digest của bản trước (lấy từ deploy log hoặc lịch sử Git của GitOps repo). Để chắc chắn: image cũ vẫn còn trong registry (retention giữ các digest có thể rollback), migration database tương thích ngược (expand/contract), và rollback dùng digest chứ không build lại commit cũ.',
        en: 'Redeploy the previous digest (from the deploy log or the GitOps repo history). To make it reliable: the old image must still be in the registry (retention keeps rollback-able digests), database migrations must be backward compatible (expand/contract), and the rollback uses the digest rather than rebuilding the old commit.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        vi: 'Thiết kế quyền truy cập registry cho dev, staging, production.',
        en: 'Design registry access for dev, staging and production.'
      },
      answer: {
        vi: 'Registry hoặc repository riêng cho mỗi môi trường. CI của mọi branch chỉ push được vào dev; chỉ job promotion (sau khi qua test, scan, verify chữ ký) mới có quyền ghi vào production, và tag release ở production là immutable. Node production chỉ có quyền pull, qua mirror/cache nội bộ.',
        en: 'A registry or repository per environment. Branch CI can only push to dev; only the promotion job (after tests, scans and signature verification) can write to production, and production release tags are immutable. Production nodes only have pull access, through an internal mirror/cache.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: '"Cùng phiên bản" nhưng staging pass, production lỗi',
      en: '"Same version" passes staging, fails in production'
    },
    businessContext: {
      vi: 'Pipeline build image riêng cho từng môi trường từ tag Git v2.3.0, với build arg ENV=staging/prod.',
      en: 'The pipeline built a separate image per environment from Git tag v2.3.0 with a build arg ENV=staging/prod.'
    },
    problemDescription: {
      vi: 'Production build sau staging hai ngày; base image eclipse-temurin:21-jre (tag trôi) đã cập nhật một bản vá TLS làm hỏng kết nối tới hệ thống đối tác cũ. Staging không tái hiện được lỗi.',
      en: 'The production build ran two days after staging; the floating eclipse-temurin:21-jre base had picked up a TLS patch that broke connections to a legacy partner system. Staging could not reproduce the bug.'
    },
    whyNaiveFails: {
      vi: 'Cùng tag Git không có nghĩa là cùng artifact: base image trôi, dependency thay đổi, và build arg khác nhau tạo ra digest khác nhau.',
      en: 'The same Git tag does not mean the same artifact: a floating base, changing dependencies and different build args produce different digests.'
    },
    coreSolution: {
      vi: 'Pin base theo digest, build một lần, bỏ build arg ENV và chuyển cấu hình sang biến môi trường lúc chạy, promote cùng digest qua các môi trường và so sánh digest như một bước của pipeline.',
      en: 'Pin the base by digest, build once, drop the ENV build arg in favour of run-time env vars, promote the same digest across environments, and compare digests as a pipeline step.'
    },
    productionCode: `# Gate in the prod deploy job: refuse anything not verified on staging
STAGING=$(docker buildx imagetools inspect stg.example.com/shop/api:2.3.0 --format '{{json .Manifest}}' | jq -r .digest)
test "$STAGING" = "$DIGEST" || { echo "digest mismatch: $STAGING vs $DIGEST"; exit 1; }`,
    productionLanguage: 'bash',
    architectureImpact: {
      vi: 'Lỗi chỉ có ở production do khác biệt artifact biến mất; mọi khác biệt còn lại nằm ở cấu hình, dễ so sánh hơn nhiều.',
      en: 'Production-only bugs caused by artifact drift disappear; the remaining differences live in config, which is far easier to compare.'
    }
  },

  researchCitations: [
    DOCKER_CITATIONS.imageTag,
    DOCKER_CITATIONS.ociDistribution,
    DOCKER_CITATIONS.cacheBackends,
    DOCKER_CITATIONS.attestations
  ]
};
