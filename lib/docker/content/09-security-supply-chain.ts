import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const runtimeStackHardeningTopic: DockerTopic = {
  id: 'runtime-stack-hardening',
  roadmapId: 'DOCKER-09',
  category: 'docker-production',
  level: 'advanced',
  chapter: 'Cấp độ 3',
  name: 'Container Security & Supply Chain',
  tagline: {
    vi: 'Bảo vệ từ lúc build tới lúc chạy: base image tin cậy pin theo digest, SBOM + provenance, quét CVE chặn pipeline, ký image theo digest, rồi chạy với non-root, --cap-drop=ALL, no-new-privileges, seccomp mặc định và rootless.',
    en: 'Protection from build to run: trusted digest-pinned bases, SBOM + provenance, CVE scans that gate the pipeline, signing by digest, then running non-root with --cap-drop=ALL, no-new-privileges, the default seccomp profile and rootless mode.'
  },
  difficulty: 3,
  order: 9,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Image production kéo theo hàng trăm package từ base image và dependency; chỉ một package dính CVE có thể bị khai thác từ xa. Kẻ tấn công cũng có thể nhắm vào chính pipeline: đẩy image giả cùng tag lên registry. Và khi đã vào được container, process mặc định chạy UID 0 trên cùng kernel với host.',
      en: 'A production image drags in hundreds of packages from its base and dependencies; a single CVE in one of them may be remotely exploitable. Attackers can also target the pipeline itself: push a fake image under the same tag. And once inside a container, the process runs as UID 0 on the same kernel as the host by default.'
    },
    hardwareConstraint: {
      vi: 'Kernel Linux có hơn 300 syscall và mọi container dùng chung một kernel. Tag trong registry là con trỏ có thể bị trỏ lại; chỉ digest là bất biến. Không thể kiểm tra thủ công hàng trăm package mỗi lần build.',
      en: 'The Linux kernel exposes 300+ syscalls and every container shares one kernel. Registry tags are movable pointers; only digests are immutable. Nobody can manually inspect hundreds of packages on every build.'
    },
    fundamentalSolution: {
      vi: 'Phòng thủ theo hai trục. Supply chain: base image chính thức pin theo digest; build kèm SBOM (danh sách package) và SLSA provenance (ai build, từ commit nào, bằng gì); quét SBOM với cơ sở dữ liệu CVE và chặn pipeline khi có lỗi nghiêm trọng đã có bản vá; ký image theo digest (cosign) và chỉ deploy image đã xác minh chữ ký. Runtime: USER không root, --cap-drop=ALL rồi thêm đúng capability cần, no-new-privileges chặn leo quyền qua setuid, rootfs read-only, giữ seccomp mặc định (chặn ~44 syscall), user namespace hoặc rootless Docker để root trong container không phải root trên host. Secret runtime đi qua file mount, không qua env.',
      en: 'Defend along two axes. Supply chain: official bases pinned by digest; builds that attach an SBOM (the package list) and SLSA provenance (who built it, from which commit, with what); SBOM scans against a CVE database that fail the pipeline on fixable severe issues; signing by digest (cosign) and deploying only verified images. Runtime: a non-root USER, --cap-drop=ALL then add only needed capabilities, no-new-privileges against setuid escalation, a read-only rootfs, the default seccomp profile (blocking ~44 syscalls), and user namespaces or rootless Docker so container root is not host root. Runtime secrets come through file mounts, not env vars.'
    },
    math: {
      formula: String.raw`\text{Risk} \;\propto\; |\text{packages}| \times |\text{syscalls}| \times |\text{caps}| \times \mathbb{1}[\text{uid}_{\text{host}} = 0]`,
      description: {
        vi: 'Mô hình trực giác: các lớp nhân với nhau. Image tối giản giảm số package có thể dính CVE; seccomp giảm syscall; drop capability giảm quyền; user namespace/rootless làm thừa số cuối bằng 0 trên host — ngay cả khi thoát khỏi container cũng không phải root.',
        en: 'An intuition model: the layers multiply. A minimal image cuts packages that can carry CVEs; seccomp cuts syscalls; dropping capabilities cuts privilege; user namespaces/rootless zero out the last factor on the host — even an escape is not root.'
      },
      timeComplexity: 'O(1) seccomp BPF check per syscall; O(packages) per scan',
      spaceComplexity: 'SBOM, provenance and signature stored next to the image digest'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Bảo mật container không phải một flag mà là chuỗi kiểm soát từ commit tới process đang chạy: biết image chứa gì, chứng minh nó đến từ đâu, và giới hạn nó được làm gì.',
      en: 'Container security is not one flag but a chain of controls from commit to running process: know what an image contains, prove where it came from, and limit what it may do.'
    },
    deepDiveParagraphs: [
      {
        vi: 'SBOM và provenance: docker buildx build --sbom=true --provenance=mode=max gắn hai attestation vào image. SBOM liệt kê mọi package và phiên bản; provenance mô tả quá trình build theo SLSA (mặc định BuildKit đã thêm provenance mode=min; mode=max thêm Dockerfile và build args — đừng đặt secret vào build args). Docker Scout (hoặc Trivy, Grype) đọc SBOM và đối chiếu với cơ sở dữ liệu CVE cập nhật liên tục, nên image cũ cũng được cảnh báo khi có CVE mới.',
        en: 'SBOM and provenance: docker buildx build --sbom=true --provenance=mode=max attaches two attestations. The SBOM lists every package and version; provenance describes the build per SLSA (BuildKit already adds mode=min provenance by default; mode=max adds the Dockerfile and build args — never put secrets in build args). Docker Scout (or Trivy, Grype) reads the SBOM and matches it against a continuously updated CVE database, so old images get flagged when new CVEs appear.'
      },
      {
        vi: 'Ký và xác minh: ký theo digest, không theo tag, vì tag có thể bị trỏ sang image khác. Cosign keyless dùng danh tính OIDC của CI (ví dụ GitHub Actions) làm người ký và ghi vào transparency log; phía deploy (admission policy của Kubernetes, hoặc bước verify trong pipeline) chỉ chấp nhận image có chữ ký từ đúng identity và issuer.',
        en: 'Signing and verification: sign by digest, not by tag, because a tag can be repointed to another image. Keyless cosign uses the CI’s OIDC identity (e.g. GitHub Actions) as the signer and records it in a transparency log; the deploy side (a Kubernetes admission policy, or a pipeline verify step) accepts only images signed by the expected identity and issuer.'
      },
      {
        vi: 'Runtime least privilege: Docker giữ một allowlist capability mặc định; khuyến nghị là bỏ tất cả rồi thêm đúng cái cần (NET_BIND_SERVICE để bind cổng < 1024). --privileged bật mọi capability, tắt seccomp/AppArmor và mở mọi device — tương đương root trên host. Profile seccomp mặc định là allowlist chặn khoảng 44 trong hơn 300 syscall; chạy seccomp=unconfined để "cho chạy được" là bỏ một lớp phòng thủ quan trọng.',
        en: 'Runtime least privilege: Docker keeps a default capability allowlist; the recommendation is to drop all and add back only what is needed (NET_BIND_SERVICE to bind ports < 1024). --privileged grants every capability, disables seccomp/AppArmor and exposes all devices — equivalent to host root. The default seccomp profile is an allowlist blocking around 44 of 300+ syscalls; running seccomp=unconfined "to make it work" discards an important layer.'
      },
      {
        vi: 'Root trên host: userns-remap ánh xạ UID 0 trong container sang dải UID không đặc quyền (/etc/subuid, user dockremap) trong khi daemon vẫn chạy root. Rootless mode chạy cả daemon lẫn container bằng user thường trong user namespace (cần newuidmap/newgidmap và ít nhất 65.536 subordinate UID). Secret runtime nên được mount thành file (Compose/Swarm secrets, Kubernetes Secret volume, Vault agent) thay vì biến môi trường hiện ra trong docker inspect.',
        en: 'Root on the host: userns-remap maps container UID 0 to an unprivileged UID range (/etc/subuid, the dockremap user) while the daemon still runs as root. Rootless mode runs both the daemon and containers as a normal user inside a user namespace (needs newuidmap/newgidmap and at least 65,536 subordinate UIDs). Runtime secrets should be mounted as files (Compose/Swarm secrets, Kubernetes Secret volumes, a Vault agent) rather than env vars visible in docker inspect.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Quét CVE nhưng không chặn pipeline: báo cáo hàng trăm lỗi mà không ai đọc. Chỉ chặn critical/high có bản vá để tín hiệu có ý nghĩa.',
        en: 'Scanning without gating: reports with hundreds of findings nobody reads. Gate only on fixable critical/high issues so the signal means something.'
      },
      {
        vi: 'Ký image theo tag rồi deploy theo tag: kẻ có quyền push vẫn thay được image phía sau tag.',
        en: 'Signing and deploying by tag: anyone with push access can still swap the image behind the tag.'
      },
      {
        vi: 'Dùng --privileged hoặc seccomp=unconfined để sửa lỗi permission thay vì thêm đúng một capability.',
        en: 'Using --privileged or seccomp=unconfined to fix a permission error instead of adding one capability.'
      },
      {
        vi: 'Mount /var/run/docker.sock vào container CI để "build image": ai điều khiển container đó điều khiển cả host.',
        en: 'Mounting /var/run/docker.sock into CI containers "to build images": whoever controls that container controls the host.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Chuỗi kiểm soát từ commit tới process',
      en: 'The control chain from commit to process'
    },
    description: {
      vi: 'Mỗi mắt xích để lại bằng chứng gắn với digest của image; runtime giới hạn quyền của process.',
      en: 'Every link leaves evidence bound to the image digest; the runtime limits the process’s privileges.'
    },
    asciiDiagram: `
 BUILD                         REGISTRY (by digest)                RUN
 base@sha256 (official) ─┐     api@sha256:9c1e…                    docker run
 Dockerfile, USER 10001  ├──►   ├─ SBOM attestation (packages)       --user 10001 --read-only
 buildx --sbom           │      ├─ provenance (SLSA: commit, CI)     --cap-drop=ALL
   --provenance=mode=max ┘      └─ cosign signature (OIDC id)        --security-opt no-new-privileges
          │                              │                           seccomp: default (~44 blocked)
 scout cves --exit-code ── gate ─────────┤                           rootless / userns-remap
 (fixable critical/high)        cosign verify ── deploy only if ok ─►  secrets: /run/secrets/*
`,
    components: [
      {
        name: 'SBOM',
        role: 'Inventory',
        description: {
          vi: 'Danh sách package và phiên bản trong image.',
          en: 'The package and version list inside the image.'
        }
      },
      {
        name: 'Provenance',
        role: 'Origin',
        description: {
          vi: 'Bằng chứng SLSA: source, commit, builder, tham số build.',
          en: 'SLSA evidence: source, commit, builder, build parameters.'
        }
      },
      {
        name: 'Signature',
        role: 'Integrity',
        description: {
          vi: 'Chữ ký trên digest; xác minh identity + issuer trước khi deploy.',
          en: 'A signature on the digest; verify identity + issuer before deploying.'
        }
      },
      {
        name: 'Runtime controls',
        role: 'Least privilege',
        description: {
          vi: 'Non-root, capabilities, no-new-privileges, seccomp, read-only, userns.',
          en: 'Non-root, capabilities, no-new-privileges, seccomp, read-only, userns.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'attest',
      title: { vi: 'Build kèm SBOM & provenance', en: 'Build with SBOM & provenance' },
      phase: 'Build',
      description: {
        vi: 'BuildKit sinh SBOM và SLSA provenance, đẩy cùng image lên registry.',
        en: 'BuildKit generates an SBOM and SLSA provenance and pushes them with the image.'
      },
      systemBehavior: {
        vi: 'Attestation được lưu như manifest đi kèm, gắn với digest của image.',
        en: 'Attestations are stored as attached manifests bound to the image digest.'
      },
      codeLineMatch: '--sbom=true --provenance=mode=max'
    },
    {
      id: 'scan',
      title: { vi: 'Quét CVE và chặn pipeline', en: 'Scan for CVEs and gate the pipeline' },
      phase: 'Scan',
      description: {
        vi: 'Chỉ fail khi có CVE critical/high đã có bản vá.',
        en: 'Fail only on critical/high CVEs that have a fix.'
      },
      systemBehavior: {
        vi: 'Scout đối chiếu SBOM với cơ sở dữ liệu lỗ hổng; exit code khác 0 dừng pipeline.',
        en: 'Scout matches the SBOM to a vulnerability database; a non-zero exit stops the pipeline.'
      },
      codeLineMatch: 'docker scout cves'
    },
    {
      id: 'sign',
      title: {
        vi: 'Ký theo digest, xác minh trước deploy',
        en: 'Sign by digest, verify before deploy'
      },
      phase: 'Sign',
      description: {
        vi: 'cosign ký digest bằng danh tính OIDC của CI; bước deploy xác minh identity và issuer.',
        en: 'cosign signs the digest with the CI OIDC identity; the deploy step verifies identity and issuer.'
      },
      systemBehavior: {
        vi: 'Chữ ký được ghi vào transparency log, không cần quản lý khoá dài hạn.',
        en: 'The signature is recorded in a transparency log; no long-lived key to manage.'
      },
      codeLineMatch: 'cosign sign --yes'
    },
    {
      id: 'least-privilege',
      title: { vi: 'Chạy với quyền tối thiểu', en: 'Run with least privilege' },
      phase: 'Run',
      description: {
        vi: 'Non-root, rootfs read-only, bỏ mọi capability trừ NET_BIND_SERVICE, chặn leo quyền.',
        en: 'Non-root, read-only rootfs, every capability dropped except NET_BIND_SERVICE, escalation blocked.'
      },
      systemBehavior: {
        vi: 'Kernel trả EPERM cho thao tác cần capability đã bị bỏ.',
        en: 'The kernel returns EPERM for operations needing a dropped capability.'
      },
      codeLineMatch: '--cap-drop=ALL'
    },
    {
      id: 'seccomp-rootless',
      title: { vi: 'Seccomp mặc định & rootless', en: 'Default seccomp & rootless' },
      phase: 'Contain',
      description: {
        vi: 'Kiểm tra process đang chạy ở chế độ seccomp filter; daemon rootless thì root trong container là UID thường trên host.',
        en: 'Check the process runs in seccomp filter mode; with a rootless daemon, container root is an ordinary host UID.'
      },
      systemBehavior: {
        vi: 'Bộ lọc BPF chặn syscall nguy hiểm trước khi chúng vào kernel.',
        en: 'A BPF filter blocks dangerous syscalls before they enter the kernel.'
      },
      codeLineMatch: 'grep Seccomp /proc/1/status'
    }
  ],

  comparison: {
    title: { vi: 'Rootful, userns-remap và Rootless', en: 'Rootful, userns-remap and Rootless' },
    subtitle: {
      vi: 'Quyền của daemon và UID trên host quyết định hậu quả khi container bị thoát',
      en: 'Daemon privileges and host UIDs decide the blast radius of an escape'
    },
    options: [
      {
        name: 'Rootful (default)',
        tag: 'Full features',
        role: { vi: 'dockerd chạy root', en: 'dockerd runs as root' },
        keyMechanism: {
          vi: 'Đầy đủ tính năng mạng/storage; root trong container là UID 0 trên host.',
          en: 'Full networking/storage features; container root is UID 0 on the host.'
        },
        configExample: '{ "no-new-privileges": true, "live-restore": true }',
        architectureNote: {
          vi: 'Bảo vệ docker.sock như bảo vệ mật khẩu root.',
          en: 'Guard docker.sock like the root password.'
        }
      },
      {
        name: 'userns-remap',
        tag: 'Remapped UIDs',
        role: {
          vi: 'Daemon root, container UID ánh xạ',
          en: 'Root daemon, remapped container UIDs'
        },
        keyMechanism: {
          vi: 'UID 0 trong container ↦ dải UID không đặc quyền từ /etc/subuid (user dockremap).',
          en: 'Container UID 0 ↦ an unprivileged range from /etc/subuid (the dockremap user).'
        },
        configExample: '{ "userns-remap": "default" }',
        architectureNote: {
          vi: 'Không dùng chung với --pid=host, --network=host, --privileged.',
          en: 'Incompatible with --pid=host, --network=host, --privileged.'
        }
      },
      {
        name: 'Rootless',
        tag: 'Least privilege',
        role: {
          vi: 'Daemon và container chạy dưới user thường',
          en: 'Daemon and containers run as a normal user'
        },
        keyMechanism: {
          vi: 'User namespace + newuidmap/newgidmap; một số hạn chế về mạng và cổng thấp.',
          en: 'User namespaces + newuidmap/newgidmap; some networking and low-port limitations.'
        },
        configExample: 'dockerd-rootless-setuptool.sh install',
        architectureNote: {
          vi: 'Lựa chọn tốt cho CI và máy dùng chung.',
          en: 'A good fit for CI and shared machines.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Biết chính xác image chứa gì và đến từ đâu khi có CVE mới.',
        en: 'You know exactly what an image contains and where it came from when a new CVE lands.'
      },
      {
        vi: 'Image giả hoặc bị sửa không qua được bước verify.',
        en: 'Forged or tampered images fail verification.'
      },
      {
        vi: 'Phòng thủ nhiều lớp: một lớp thủng vẫn còn lớp khác.',
        en: 'Defence in depth: one failed layer leaves the others.'
      }
    ],
    cons: [
      {
        vi: 'Pipeline dài hơn; cần quy trình xử lý CVE chưa có bản vá.',
        en: 'Longer pipelines; you need a process for CVEs without a fix.'
      },
      {
        vi: 'Profile quá chặt làm vỡ ứng dụng — cần thử nghiệm.',
        en: 'Overly strict profiles break apps — they need testing.'
      }
    ],
    balance: {
      vi: 'Bắt đầu bằng các mặc định rẻ (non-root, cap-drop, seccomp mặc định, image tối giản, quét có gate), sau đó thêm ký/verify và rootless khi quy trình đã ổn định.',
      en: 'Start with the cheap defaults (non-root, cap-drop, default seccomp, minimal images, gated scans), then add signing/verification and rootless once the process is stable.'
    },
    invariant: {
      vi: 'Chỉ image có digest đã được ký và quét mới được chạy, và process không bao giờ có nhiều quyền hơn bounding set capability và bộ lọc seccomp cho phép.',
      en: 'Only signed, scanned digests run, and a process never holds more privilege than its capability bounding set and seccomp filter allow.'
    }
  },

  code: [
    {
      label: 'supply-chain.sh',
      filename: 'supply-chain.sh',
      language: 'bash',
      code: `IMG=registry.example.com/shop/api

# 1) Build from a digest-pinned base, attach SBOM + SLSA provenance
docker buildx build --sbom=true --provenance=mode=max \\
  --metadata-file meta.json -t $IMG:1.4.2 --push .
DIGEST=$(jq -r '."containerimage.digest"' meta.json)

# 2) Scan the SBOM; fail only on fixable critical/high CVEs
docker scout cves $IMG@$DIGEST --only-severity critical,high --only-fixed --exit-code

# 3) Sign the DIGEST (keyless, CI OIDC identity), verify before deploying
cosign sign --yes $IMG@$DIGEST
cosign verify $IMG@$DIGEST \\
  --certificate-identity-regexp '^https://github.com/acme/shop/' \\
  --certificate-oidc-issuer https://token.actions.githubusercontent.com

# 4) Run with least privilege
docker run -d --name api --user 10001:10001 \\
  --read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m \\
  --cap-drop=ALL --cap-add=NET_BIND_SERVICE \\
  --security-opt no-new-privileges \\
  --pids-limit 256 --memory 512m \\
  --mount type=bind,source=/etc/shop/db_password,target=/run/secrets/db_password,readonly \\
  $IMG@$DIGEST

# 5) Seccomp stays on the default profile (never "unconfined")
docker exec api grep Seccomp /proc/1/status     # Seccomp: 2  (filter mode)`
    },
    {
      label: 'Dockerfile',
      filename: 'Dockerfile',
      language: 'dockerfile',
      code: `# Trusted, minimal base pinned by digest (bumped by Renovate/Dependabot)
FROM gcr.io/distroless/java21-debian12:nonroot@sha256:<digest>
COPY --chown=nonroot:nonroot app.jar /app/app.jar
USER nonroot
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]`
    },
    {
      label: 'pod securityContext',
      filename: 'deployment.yaml',
      language: 'yaml',
      code: `securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  allowPrivilegeEscalation: false      # no_new_privs
  readOnlyRootFilesystem: true
  capabilities:
    drop: ["ALL"]
    add: ["NET_BIND_SERVICE"]
  seccompProfile:
    type: RuntimeDefault`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'SBOM là gì và vì sao vẫn cần nó khi image đã quét sạch lúc build?',
        en: 'What is an SBOM and why do you still need it when the image scanned clean at build time?'
      },
      answer: {
        vi: 'SBOM là danh sách package và phiên bản trong image. CVE mới được công bố mỗi ngày; có SBOM gắn với digest, scanner trả lời ngay được "image nào đang chạy bị ảnh hưởng bởi CVE hôm nay" mà không cần build lại hay pull từng image.',
        en: 'An SBOM is the list of packages and versions in an image. New CVEs are published every day; with an SBOM bound to the digest, a scanner can immediately answer "which running images are affected by today’s CVE" without rebuilding or pulling each image.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Vì sao ký và deploy theo digest thay vì tag?',
        en: 'Why sign and deploy by digest rather than by tag?'
      },
      answer: {
        vi: 'Tag là con trỏ có thể trỏ lại; ai có quyền push đều đổi được image phía sau tag sau khi bạn đã ký. Digest là hash của manifest nên bất biến: chữ ký trên digest chứng minh đúng nội dung đó. Deploy theo digest đảm bảo thứ chạy chính là thứ đã được quét và ký.',
        en: 'A tag is a movable pointer; anyone with push access can change the image behind it after you signed. A digest is the manifest hash and immutable: a signature on it proves exactly that content. Deploying by digest guarantees that what runs is what was scanned and signed.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Vì sao mount docker.sock vào container nguy hiểm tương đương --privileged?',
        en: 'Why is mounting docker.sock into a container as dangerous as --privileged?'
      },
      answer: {
        vi: 'Socket là API của dockerd chạy root. Container có socket có thể docker run --privileged -v /:/host rồi chroot /host — tức root trên node. Thay thế: BuildKit rootless, kaniko, buildah, hoặc builder từ xa có xác thực.',
        en: 'The socket is the API of a root dockerd. A container with it can docker run --privileged -v /:/host and chroot /host — root on the node. Alternatives: rootless BuildKit, kaniko, buildah, or an authenticated remote builder.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'CVE nghiêm trọng trong thư viện log: image nào đang bị ảnh hưởng?',
      en: 'A critical CVE in a logging library: which images are affected?'
    },
    businessContext: {
      vi: 'Công ty chạy 140 service; một CVE thực thi mã từ xa được công bố cho một thư viện Java phổ biến.',
      en: 'A company runs 140 services; a remote-code-execution CVE is published for a popular Java library.'
    },
    problemDescription: {
      vi: 'Không ai biết service nào chứa phiên bản lỗi: thư viện nằm sâu trong dependency bắc cầu, và nhiều image đã build từ nhiều tháng trước.',
      en: 'Nobody knew which services contained the vulnerable version: the library sat deep in transitive dependencies, and many images were built months earlier.'
    },
    whyNaiveFails: {
      vi: 'grep pom.xml bỏ sót dependency bắc cầu và jar shade; build lại mọi thứ để kiểm tra mất nhiều ngày.',
      en: 'Grepping pom.xml misses transitive dependencies and shaded jars; rebuilding everything to check takes days.'
    },
    coreSolution: {
      vi: 'Mọi image được build kèm SBOM và deploy theo digest. Truy vấn SBOM theo tên package cho danh sách digest bị ảnh hưởng trong vài phút; các bản vá đi qua cùng pipeline quét + ký, và policy chặn deploy image chưa được vá.',
      en: 'Every image was built with an SBOM and deployed by digest. Querying SBOMs by package name produced the affected digests within minutes; patches flowed through the same scan + sign pipeline, and a policy blocked deploying unpatched images.'
    },
    productionCode: `# Which running digests contain the vulnerable package?
for img in $(kubectl get pods -A -o jsonpath='{..image}' | tr ' ' '\\n' | sort -u); do
  docker scout sbom --format list "$img" | grep -q 'log4j-core.*2\\.14' && echo "AFFECTED $img"
done`,
    productionLanguage: 'bash',
    architectureImpact: {
      vi: 'Thời gian từ khi công bố CVE tới khi biết phạm vi ảnh hưởng giảm từ nhiều ngày xuống vài phút.',
      en: 'Time from CVE disclosure to a known blast radius drops from days to minutes.'
    }
  },

  researchCitations: [
    DOCKER_CITATIONS.attestations,
    DOCKER_CITATIONS.scout,
    DOCKER_CITATIONS.seccomp,
    DOCKER_CITATIONS.rootless,
    DOCKER_CITATIONS.security
  ]
};
