import type { DevopsTopic } from '../types';
import { DEVOPS_CITATIONS } from '../citations';

export const cicdPipelineSupplyChainTopic: DevopsTopic = {
  id: 'cicd-pipeline-supply-chain',
  category: 'delivery-pipeline',
  level: 'beginner',
  chapter: 'Chương 01',
  name: 'CI/CD Pipelines, Immutable Artifacts & Supply-Chain Security',
  tagline: {
    vi: 'Build once – deploy many, artifact định danh bằng digest, quality gate, flaky test, SBOM, ký image bằng cosign, provenance SLSA và DORA metrics.',
    en: 'Build once – deploy many, digest-addressed artifacts, quality gates, flaky tests, SBOMs, cosign image signing, SLSA provenance and DORA metrics.'
  },
  difficulty: 1,
  order: 1,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Mỗi môi trường build lại từ source: staging chạy image khác production dù cùng commit (dependency trôi, base image :latest đổi). Pipeline 40 phút với test chập chờn khiến dev bấm "retry" theo thói quen. Và không ai chứng minh được image đang chạy production thực sự đến từ pipeline chứ không phải laptop ai đó.',
      en: 'Each environment rebuilds from source: staging runs a different image than production for the same commit (dependency drift, a moving :latest base). A 40-minute pipeline with flaky tests trains developers to hit “retry”. And nobody can prove the image in production came from the pipeline rather than someone’s laptop.'
    },
    hardwareConstraint: {
      vi: 'Runner CI có giới hạn CPU/phút; test tích hợp phụ thuộc mạng, DB, thời gian — bản chất không tất định. Registry và cluster là mục tiêu tấn công chuỗi cung ứng.',
      en: 'CI runners have finite CPU minutes; integration tests depend on network, databases and time — inherently nondeterministic. Registries and clusters are supply-chain attack targets.'
    },
    fundamentalSolution: {
      vi: 'Build đúng một lần cho mỗi commit, đẩy image theo digest (sha256) và PROMOTE chính digest đó qua dev → staging → prod; cấu hình khác nhau nằm ngoài image. Pipeline nhanh-trước: lint/unit (phút) → build → integration/contract → security scan. Sinh SBOM, ký image + provenance bằng cosign (keyless OIDC), và admission controller trên cluster chỉ cho chạy image có chữ ký hợp lệ. Đo bằng DORA metrics.',
      en: 'Build exactly once per commit, push the image by digest (sha256) and PROMOTE that same digest through dev → staging → prod; environment differences live outside the image. Fast-first pipelines: lint/unit (minutes) → build → integration/contract → security scans. Generate an SBOM, sign the image + provenance with cosign (keyless OIDC), and let a cluster admission controller run only validly signed images. Measure with DORA metrics.'
    },
    math: {
      formula: String.raw`P(\text{false red}) = 1 - \prod_{i=1}^{n} (1 - f_i) \;\approx\; \sum_i f_i`,
      description: {
        vi: '500 test, mỗi test flaky 0,2% ⇒ P(pipeline đỏ oan) = 1 − 0,998⁵⁰⁰ ≈ 63%. Flaky test không phải phiền toái nhỏ — chúng phá huỷ niềm tin vào pipeline. Phải cách ly (quarantine) và sửa, không retry mù.',
        en: '500 tests each 0.2% flaky ⇒ P(spurious red) = 1 − 0.998⁵⁰⁰ ≈ 63%. Flaky tests are not a minor nuisance — they destroy trust in the pipeline. Quarantine and fix them; never blind-retry.'
      },
      timeComplexity: 'Lead time = Σ stage durations (parallelise independent stages)',
      spaceComplexity: 'O(1) artifact per commit, promoted not rebuilt'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'CI (tích hợp liên tục) đảm bảo main luôn build và test xanh; CD (delivery/deployment) đảm bảo mọi commit xanh có thể (hoặc sẽ) lên production qua cùng một con đường tự động.',
      en: 'CI (continuous integration) keeps main always building and green; CD (delivery/deployment) ensures every green commit can (or will) reach production through the same automated path.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Trunk-based development + feature flag giữ branch ngắn (< 1 ngày), giảm merge hell. Tách deploy (đưa code lên) khỏi release (bật tính năng cho user) bằng flag cho phép deploy nhiều lần mỗi ngày mà rủi ro thấp.',
        en: 'Trunk-based development + feature flags keep branches short (< 1 day) and avoid merge hell. Decoupling deploy (shipping code) from release (enabling features for users) via flags enables many low-risk deploys per day.'
      },
      {
        vi: 'Chuỗi cung ứng: SBOM (SPDX/CycloneDX) liệt kê mọi thành phần để trả lời "chúng ta có dính CVE X không?" trong vài phút. cosign keyless dùng OIDC token của CI để xin chứng chỉ ngắn hạn từ Fulcio, ghi vào transparency log Rekor. Admission (Kyverno/Sigstore policy-controller) kiểm chữ ký + provenance trước khi Pod được tạo.',
        en: 'Supply chain: an SBOM (SPDX/CycloneDX) lists every component to answer “are we affected by CVE X?” in minutes. Keyless cosign uses the CI’s OIDC token to get a short-lived Fulcio certificate and records the signature in the Rekor transparency log. Admission (Kyverno/Sigstore policy-controller) verifies signature + provenance before Pods are created.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Deploy theo tag :latest hoặc :staging — rollback không biết quay về đâu.',
        en: 'Deploying :latest or :staging tags — rollbacks don’t know where to go.'
      },
      {
        vi: 'Bí mật production nằm trong biến CI ai cũng đọc được trên pull request từ fork.',
        en: 'Production secrets in CI variables readable by pull requests from forks.'
      },
      {
        vi: '"Retry until green" che giấu race condition thật.',
        en: '“Retry until green” hides real race conditions.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Một artifact, nhiều môi trường', en: 'One artifact, many environments' },
    description: {
      vi: 'Digest được tạo một lần và đi qua mọi môi trường cùng chữ ký.',
      en: 'The digest is created once and travels through every environment with its signature.'
    },
    asciiDiagram: `
 git push (main) ─▶ CI
   ├─ lint + unit tests (2 min)            fail fast
   ├─ build image  → registry/api@sha256:9c1e…   (ONCE)
   ├─ SBOM (syft)  + vuln scan (grype/trivy) — block on critical
   ├─ cosign sign + attest provenance (keyless OIDC → Fulcio, Rekor)
   └─ integration / contract tests against the built digest
          │ promote the SAME digest (no rebuild)
          ▼
   dev ──▶ staging ──▶ production
                        admission: verify signature + provenance(repo, workflow) ✓
 DORA: deploy freq · lead time · change failure rate · recovery time
`,
    components: [
      {
        name: 'Digest',
        role: 'Artifact identity',
        description: {
          vi: 'sha256 bất biến; tag chỉ là nhãn.',
          en: 'An immutable sha256; tags are just labels.'
        }
      },
      {
        name: 'SBOM',
        role: 'Inventory',
        description: {
          vi: 'Danh sách thành phần để tra CVE.',
          en: 'A component list for CVE lookups.'
        }
      },
      {
        name: 'cosign',
        role: 'Signing',
        description: {
          vi: 'Ký image và attestation, keyless qua OIDC.',
          en: 'Signs images and attestations, keyless via OIDC.'
        }
      },
      {
        name: 'Admission policy',
        role: 'Gate',
        description: {
          vi: 'Chặn image không ký ở cluster.',
          en: 'Blocks unsigned images at the cluster.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'fast-checks',
      title: { vi: 'Kiểm tra nhanh trước', en: 'Fast checks first' },
      phase: 'Verify',
      description: {
        vi: 'Lint + unit test chạy song song, fail trong vài phút.',
        en: 'Lint + unit tests in parallel, failing within minutes.'
      },
      systemBehavior: {
        vi: 'Feedback sớm giữ lead time thấp.',
        en: 'Early feedback keeps lead time low.'
      },
      codeLineMatch: 'mvn -B verify'
    },
    {
      id: 'build-once',
      title: { vi: 'Build một lần, đẩy theo digest', en: 'Build once, push by digest' },
      phase: 'Build',
      description: {
        vi: 'Image được push và ghi lại digest làm output của job.',
        en: 'The image is pushed and its digest captured as the job output.'
      },
      systemBehavior: {
        vi: 'Mọi bước sau dùng digest, không dùng tag.',
        en: 'Every later step uses the digest, not a tag.'
      },
      codeLineMatch: 'docker/build-push-action'
    },
    {
      id: 'sbom-sign',
      title: { vi: 'SBOM, scan & ký', en: 'SBOM, scan & sign' },
      phase: 'Supply chain',
      description: {
        vi: 'Sinh SBOM, chặn CVE critical, ký image và provenance bằng cosign keyless.',
        en: 'Generate an SBOM, block critical CVEs, sign image and provenance with keyless cosign.'
      },
      systemBehavior: {
        vi: 'Chữ ký và chứng chỉ được ghi vào Rekor để kiểm toán.',
        en: 'Signature and certificate are recorded in Rekor for audit.'
      },
      codeLineMatch: 'cosign sign --yes'
    },
    {
      id: 'promote',
      title: { vi: 'Promote digest & admission', en: 'Promote the digest & admission' },
      phase: 'Deliver',
      description: {
        vi: 'Cập nhật digest trong repo cấu hình môi trường; cluster xác minh chữ ký trước khi chạy.',
        en: 'Update the digest in the environment config repo; the cluster verifies the signature before running.'
      },
      systemBehavior: {
        vi: 'Image không ký hoặc từ workflow lạ bị từ chối.',
        en: 'Unsigned images or ones from unknown workflows are rejected.'
      },
      codeLineMatch: 'kustomize edit set image'
    }
  ],

  tradeoffs: {
    pros: [
      { vi: 'Production chạy đúng thứ đã test.', en: 'Production runs exactly what was tested.' },
      {
        vi: 'Rollback = trỏ lại digest cũ, tức thì.',
        en: 'Rollback = point to the previous digest, instantly.'
      },
      { vi: 'Chứng minh được nguồn gốc artifact.', en: 'Provable artifact provenance.' }
    ],
    cons: [
      {
        vi: 'Cần tách cấu hình môi trường khỏi image (12-factor).',
        en: 'Requires separating environment config from the image (12-factor).'
      },
      {
        vi: 'Hạ tầng ký/kiểm chứng thêm độ phức tạp.',
        en: 'Signing/verification infrastructure adds complexity.'
      }
    ],
    balance: {
      vi: 'Nhiều gate = an toàn hơn nhưng lead time dài hơn; đặt gate rẻ trước, gate đắt chạy song song.',
      en: 'More gates = safer but longer lead time; put cheap gates first and run expensive ones in parallel.'
    },
    invariant: {
      vi: 'Artifact chạy ở production có cùng digest với artifact đã qua test và đã được ký.',
      en: 'The production artifact has the same digest as the tested and signed artifact.'
    }
  },

  code: [
    {
      label: 'ci.yml',
      filename: '.github/workflows/ci.yml',
      language: 'yaml',
      code: `name: ci
on: { push: { branches: [main] } }
permissions: { contents: read, packages: write, id-token: write }   # id-token for keyless signing
jobs:
  build:
    runs-on: ubuntu-latest
    outputs: { digest: \${{ steps.push.outputs.digest }} }
    steps:
      - uses: actions/checkout@v4
      - run: mvn -B verify                       # lint + unit tests, fail fast
      - id: push
        uses: docker/build-push-action@v6
        with: { push: true, tags: "ghcr.io/acme/api:\${{ github.sha }}" }
      - uses: anchore/sbom-action@v0
        with: { image: "ghcr.io/acme/api@\${{ steps.push.outputs.digest }}", format: spdx-json }
      - uses: sigstore/cosign-installer@v3
      - run: cosign sign --yes ghcr.io/acme/api@\${{ steps.push.outputs.digest }}
  promote-staging:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { repository: acme/deploy-config }
      - run: |
          cd envs/staging
          kustomize edit set image api=ghcr.io/acme/api@\${{ needs.build.outputs.digest }}
          git commit -am "staging: api \${{ needs.build.outputs.digest }}" && git push`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Vì sao không build lại image cho từng môi trường?',
        en: 'Why not rebuild the image for each environment?'
      },
      answer: {
        vi: 'Build lại có thể ra artifact khác (dependency mới, base image đổi, compiler khác) — thứ đã test ở staging không còn là thứ chạy production. Build once + promote digest đảm bảo đồng nhất, rollback nhanh và chữ ký/provenance có ý nghĩa.',
        en: 'Rebuilding can yield a different artifact (new dependencies, base-image changes, a different compiler) — what was tested in staging is no longer what runs in production. Build once + promote the digest guarantees identity, fast rollbacks and meaningful signatures/provenance.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'DORA metrics là gì và vì sao không nên chỉ tối ưu tần suất deploy?',
        en: 'What are the DORA metrics and why not optimise deploy frequency alone?'
      },
      answer: {
        vi: 'Bốn chỉ số: deployment frequency, lead time for changes, change failure rate, failed-deployment recovery time. Hai cái đầu đo tốc độ, hai cái sau đo ổn định. Nghiên cứu DORA cho thấy đội tốt giỏi cả hai; tối ưu riêng tốc độ mà tỉ lệ lỗi tăng là chuyển chi phí sang on-call.',
        en: 'Four keys: deployment frequency, lead time for changes, change failure rate, failed-deployment recovery time. The first two measure speed, the last two stability. DORA research shows high performers excel at both; optimising speed alone while failures rise just shifts cost to on-call.'
      }
    }
  ],

  researchCitations: [DEVOPS_CITATIONS.dora, DEVOPS_CITATIONS.slsa]
};
