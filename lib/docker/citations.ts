import type { CourseCitation } from '../courses/types';

export const DOCKER_CITATIONS = {
  namespaces: {
    source: 'Linux man-pages',
    title: 'namespaces(7) — overview of Linux namespaces',
    url: 'https://man7.org/linux/man-pages/man7/namespaces.7.html',
    keyTakeaway: {
      vi: 'Mỗi namespace bọc một tài nguyên toàn cục (PID, mount, network, UTS, IPC, user, cgroup, time) để process bên trong tưởng mình có bản riêng.',
      en: 'Each namespace wraps a global resource (PID, mount, network, UTS, IPC, user, cgroup, time) so processes inside believe they have their own instance.'
    }
  },
  cgroupV2: {
    source: 'Linux Kernel Documentation',
    title: 'Control Group v2',
    url: 'https://docs.kernel.org/admin-guide/cgroup-v2.html',
    keyTakeaway: {
      vi: 'cgroup v2 dùng một cây thống nhất; cpu.max đặt quota/period, memory.max là giới hạn cứng kích hoạt OOM killer trong cgroup.',
      en: 'cgroup v2 uses a single unified tree; cpu.max sets quota/period, memory.max is a hard limit that triggers the OOM killer inside the cgroup.'
    }
  },
  overlayfs: {
    source: 'Linux Kernel Documentation',
    title: 'Overlay Filesystem',
    url: 'https://docs.kernel.org/filesystems/overlayfs.html',
    keyTakeaway: {
      vi: 'Ghi lần đầu vào file ở lower layer kích hoạt copy-up toàn bộ file lên upper; xoá được biểu diễn bằng whiteout.',
      en: 'The first write to a lower-layer file copies the whole file up to the upper layer; deletions are represented by whiteouts.'
    }
  },
  ociImage: {
    source: 'Open Container Initiative',
    title: 'OCI Image Format Specification',
    url: 'https://github.com/opencontainers/image-spec',
    keyTakeaway: {
      vi: 'Image = manifest trỏ tới config và các layer theo digest SHA-256 — nội dung được định địa chỉ, bất biến và có thể kiểm chứng.',
      en: 'An image = a manifest pointing to a config and layers by SHA-256 digest — content-addressed, immutable and verifiable.'
    }
  },
  ociRuntime: {
    source: 'Open Container Initiative',
    title: 'OCI Runtime Specification',
    url: 'https://github.com/opencontainers/runtime-spec',
    keyTakeaway: {
      vi: 'Runtime nhận một bundle (config.json + rootfs) và tạo container: namespaces, cgroups, mounts, capabilities, seccomp.',
      en: 'A runtime takes a bundle (config.json + rootfs) and creates the container: namespaces, cgroups, mounts, capabilities, seccomp.'
    }
  },
  buildCache: {
    source: 'Docker Documentation',
    title: 'Build cache & multi-stage builds',
    url: 'https://docs.docker.com/build/cache/',
    keyTakeaway: {
      vi: 'Khi một bước bị miss cache, mọi bước sau nó đều phải build lại — thứ tự lệnh quyết định tốc độ build.',
      en: 'Once a step misses the cache, every later step rebuilds — instruction order decides build speed.'
    }
  },
  networking: {
    source: 'Docker Documentation',
    title: 'Networking overview & bridge driver',
    url: 'https://docs.docker.com/engine/network/',
    keyTakeaway: {
      vi: 'User-defined bridge cung cấp DNS nội bộ theo tên container; publish port được hiện thực bằng NAT (iptables/nftables).',
      en: 'User-defined bridges provide built-in DNS by container name; published ports are implemented with NAT (iptables/nftables).'
    }
  },
  security: {
    source: 'Docker Documentation',
    title: 'Docker Engine security',
    url: 'https://docs.docker.com/engine/security/',
    keyTakeaway: {
      vi: 'Container dùng chung kernel; phòng thủ theo lớp gồm capabilities tối thiểu, seccomp, user namespace và chạy rootless.',
      en: 'Containers share the kernel; defence in depth means minimal capabilities, seccomp, user namespaces and rootless mode.'
    }
  },
  engineOverview: {
    source: 'Docker Documentation',
    title: 'What is Docker? — Docker architecture',
    url: 'https://docs.docker.com/get-started/docker-overview/',
    keyTakeaway: {
      vi: 'Client và daemon (dockerd) giao tiếp qua REST API trên UNIX socket hoặc network interface; dockerd quản lý image, container, network, volume.',
      en: 'The client and the daemon (dockerd) talk over a REST API on a UNIX socket or network interface; dockerd manages images, containers, networks and volumes.'
    }
  },
  containerStop: {
    source: 'Docker Documentation',
    title: 'docker container stop',
    url: 'https://docs.docker.com/reference/cli/docker/container/stop/',
    keyTakeaway: {
      vi: 'Process chính nhận SIGTERM (hoặc STOPSIGNAL), sau grace period mặc định 10 giây trên Linux thì nhận SIGKILL.',
      en: 'The main process receives SIGTERM (or STOPSIGNAL), then SIGKILL after a grace period that defaults to 10 seconds on Linux.'
    }
  },
  restartPolicies: {
    source: 'Docker Documentation',
    title: 'Start containers automatically (restart policies)',
    url: 'https://docs.docker.com/engine/containers/start-containers-automatically/',
    keyTakeaway: {
      vi: 'no | on-failure[:max-retries] | always | unless-stopped; policy chỉ có hiệu lực sau khi container chạy được ít nhất 10 giây, và container bị stop thủ công không tự restart cho tới khi daemon restart.',
      en: 'no | on-failure[:max-retries] | always | unless-stopped; a policy only takes effect after the container has been up for 10 seconds, and a manually stopped container is not restarted until the daemon restarts.'
    }
  },
  runReference: {
    source: 'Docker Documentation',
    title: 'Running containers — exit status',
    url: 'https://docs.docker.com/engine/containers/run/',
    keyTakeaway: {
      vi: 'Exit 125 = lỗi của daemon, 126 = lệnh không thực thi được, 127 = không tìm thấy lệnh; mọi mã khác là exit code của chính lệnh trong container.',
      en: 'Exit 125 = a daemon error, 126 = the command cannot be invoked, 127 = the command was not found; any other code is the container command’s own exit code.'
    }
  },
  dockerfileReference: {
    source: 'Docker Documentation',
    title: 'Dockerfile reference',
    url: 'https://docs.docker.com/reference/dockerfile/',
    keyTakeaway: {
      vi: 'ENTRYPOINT/CMD dạng shell chạy dưới /bin/sh -c nên không nhận tín hiệu; HEALTHCHECK mặc định interval 30s, timeout 30s, retries 3.',
      en: 'Shell-form ENTRYPOINT/CMD run under /bin/sh -c and do not receive signals; HEALTHCHECK defaults to interval 30s, timeout 30s, retries 3.'
    }
  },
  cacheInvalidation: {
    source: 'Docker Documentation',
    title: 'Build cache invalidation',
    url: 'https://docs.docker.com/build/cache/invalidation/',
    keyTakeaway: {
      vi: 'Cache key của RUN là chuỗi lệnh; của COPY/ADD là checksum nội dung + metadata file (không tính mtime). Miss một bước thì mọi bước sau build lại.',
      en: 'RUN is keyed on its command string; COPY/ADD on a checksum of file content + metadata (mtime excluded). One miss rebuilds every later step.'
    }
  },
  buildContext: {
    source: 'Docker Documentation',
    title: 'Build context',
    url: 'https://docs.docker.com/build/concepts/context/',
    keyTakeaway: {
      vi: 'Build context là tập file build được phép truy cập; file khớp .dockerignore bị loại trước khi gửi tới builder.',
      en: 'The build context is the set of files a build may access; files matching .dockerignore are removed before it is sent to the builder.'
    }
  },
  buildSecrets: {
    source: 'Docker Documentation',
    title: 'Build secrets',
    url: 'https://docs.docker.com/build/building/secrets/',
    keyTakeaway: {
      vi: 'ARG/ENV lưu lại trong image nên không dùng cho secret; RUN --mount=type=secret mount secret tại /run/secrets/<id> chỉ trong lệnh đó.',
      en: 'ARG/ENV persist in the image and must not carry secrets; RUN --mount=type=secret mounts it at /run/secrets/<id> for that instruction only.'
    }
  },
  cacheBackends: {
    source: 'Docker Documentation',
    title: 'Cache storage backends',
    url: 'https://docs.docker.com/build/cache/backends/',
    keyTakeaway: {
      vi: 'inline, registry, local, gha…; mode=min (mặc định) chỉ cache layer có trong image cuối, mode=max cache cả layer của stage trung gian.',
      en: 'inline, registry, local, gha…; mode=min (default) caches only layers in the final image, mode=max also caches intermediate-stage layers.'
    }
  },
  bridgeDriver: {
    source: 'Docker Documentation',
    title: 'Bridge network driver',
    url: 'https://docs.docker.com/engine/network/drivers/bridge/',
    keyTakeaway: {
      vi: 'User-defined bridge có DNS tự động theo tên container; default bridge chỉ nói chuyện qua IP và không được khuyến nghị cho production.',
      en: 'User-defined bridges resolve containers by name automatically; the default bridge only works by IP and is not recommended for production.'
    }
  },
  portPublishing: {
    source: 'Docker Documentation',
    title: 'Port publishing and mapping',
    url: 'https://docs.docker.com/engine/network/port-publishing/',
    keyTakeaway: {
      vi: '-p 8080:80 bind mọi địa chỉ của host theo mặc định — "insecure by default"; bind 127.0.0.1 để chỉ host truy cập. Daemon chặn port chưa publish.',
      en: '-p 8080:80 binds every host address by default — “insecure by default”; bind 127.0.0.1 to restrict to the host. The daemon blocks unpublished ports.'
    }
  },
  volumes: {
    source: 'Docker Documentation',
    title: 'Volumes',
    url: 'https://docs.docker.com/engine/storage/volumes/',
    keyTakeaway: {
      vi: 'Volume sống ngoài vòng đời container; volume rỗng được copy nội dung image tại mount point khi gắn lần đầu.',
      en: 'Volumes live outside any container’s lifecycle; an empty volume is populated with the image content at the mount point on first mount.'
    }
  },
  bindMounts: {
    source: 'Docker Documentation',
    title: 'Bind mounts',
    url: 'https://docs.docker.com/engine/storage/bind-mounts/',
    keyTakeaway: {
      vi: '-v tự tạo thư mục host còn thiếu, --mount thì báo lỗi; mount đè lên thư mục không rỗng sẽ che nội dung có sẵn.',
      en: '-v creates a missing host directory while --mount errors; mounting over a non-empty directory obscures its existing content.'
    }
  },
  storageDrivers: {
    source: 'Docker Documentation',
    title: 'Storage drivers',
    url: 'https://docs.docker.com/engine/storage/drivers/',
    keyTakeaway: {
      vi: 'Writable layer bị xoá cùng container; Docker Engine 29+ cài mới dùng containerd image store (snapshotter) thay cho storage driver cổ điển.',
      en: 'The writable layer is deleted with the container; fresh Docker Engine 29+ installs use the containerd image store (snapshotters) instead of classic storage drivers.'
    }
  },
  composeServices: {
    source: 'Docker Documentation',
    title: 'Compose file reference — services',
    url: 'https://docs.docker.com/reference/compose-file/services/',
    keyTakeaway: {
      vi: 'depends_on.condition: service_started | service_healthy | service_completed_successfully; healthcheck có test, interval, timeout, retries, start_period, start_interval.',
      en: 'depends_on.condition: service_started | service_healthy | service_completed_successfully; healthcheck has test, interval, timeout, retries, start_period, start_interval.'
    }
  },
  composeStartupOrder: {
    source: 'Docker Documentation',
    title: 'Control startup order in Compose',
    url: 'https://docs.docker.com/compose/how-tos/startup-order/',
    keyTakeaway: {
      vi: 'Mặc định Compose chỉ chờ container ở trạng thái running, không chờ "ready" — cần healthcheck + service_healthy.',
      en: 'By default Compose only waits for a container to be running, not “ready” — use a healthcheck + service_healthy.'
    }
  },
  composeNetworking: {
    source: 'Docker Documentation',
    title: 'Networking in Compose',
    url: 'https://docs.docker.com/compose/how-tos/networking/',
    keyTakeaway: {
      vi: 'Compose tạo network <project>_default; mỗi service đăng ký tên vào DNS nội bộ; service gọi nhau qua CONTAINER_PORT, host port chỉ cho truy cập từ ngoài.',
      en: 'Compose creates <project>_default; each service registers its name in internal DNS; services talk on the CONTAINER_PORT, the host port is only for outside access.'
    }
  },
  composeSecrets: {
    source: 'Docker Documentation',
    title: 'Secrets in Compose',
    url: 'https://docs.docker.com/compose/how-tos/use-secrets/',
    keyTakeaway: {
      vi: 'Secret được mount thành file /run/secrets/<name> trong container thay vì biến môi trường.',
      en: 'Secrets are mounted as files at /run/secrets/<name> inside the container instead of environment variables.'
    }
  },
  seccomp: {
    source: 'Docker Documentation',
    title: 'Seccomp security profiles for Docker',
    url: 'https://docs.docker.com/engine/security/seccomp/',
    keyTakeaway: {
      vi: 'Profile mặc định là allowlist, chặn khoảng 44 trong hơn 300 syscall; không khuyến nghị đổi hoặc chạy unconfined.',
      en: 'The default profile is an allowlist that blocks around 44 of 300+ syscalls; changing it or running unconfined is not recommended.'
    }
  },
  rootless: {
    source: 'Docker Documentation',
    title: 'Rootless mode',
    url: 'https://docs.docker.com/engine/security/rootless/',
    keyTakeaway: {
      vi: 'Cả daemon lẫn container chạy bằng user thường trong user namespace; cần newuidmap/newgidmap và ≥ 65.536 subordinate UID/GID.',
      en: 'Both the daemon and containers run as a normal user inside a user namespace; requires newuidmap/newgidmap and ≥ 65,536 subordinate UIDs/GIDs.'
    }
  },
  attestations: {
    source: 'Docker Documentation',
    title: 'Build attestations (SBOM & provenance)',
    url: 'https://docs.docker.com/build/metadata/attestations/',
    keyTakeaway: {
      vi: 'docker buildx build --sbom=true --provenance=mode=max gắn SBOM và SLSA provenance vào image; provenance mode=min được thêm mặc định.',
      en: 'docker buildx build --sbom=true --provenance=mode=max attaches an SBOM and SLSA provenance to the image; mode=min provenance is added by default.'
    }
  },
  scout: {
    source: 'Docker Documentation',
    title: 'Docker Scout',
    url: 'https://docs.docker.com/scout/',
    keyTakeaway: {
      vi: 'Phân tích image thành SBOM rồi đối chiếu với cơ sở dữ liệu lỗ hổng cập nhật liên tục.',
      en: 'Analyses an image into an SBOM and matches it against a continuously updated vulnerability database.'
    }
  },
  resourceConstraints: {
    source: 'Docker Documentation',
    title: 'Resource constraints',
    url: 'https://docs.docker.com/engine/containers/resource_constraints/',
    keyTakeaway: {
      vi: 'Mặc định container không có giới hạn; --cpus=1.5 tương đương cpu-period 100000 + cpu-quota 150000; vượt --memory thì kernel OOM-kill process trong container.',
      en: 'Containers are unconstrained by default; --cpus=1.5 equals cpu-period 100000 + cpu-quota 150000; exceeding --memory makes the kernel OOM-kill processes in the container.'
    }
  },
  logging: {
    source: 'Docker Documentation',
    title: 'Configure logging drivers',
    url: 'https://docs.docker.com/engine/logging/configure/',
    keyTakeaway: {
      vi: 'Driver mặc định json-file KHÔNG xoay vòng log; driver local xoay vòng mặc định (20 MB × 5 file, nén).',
      en: 'The default json-file driver does NOT rotate logs; the local driver rotates by default (20 MB × 5 files, compressed).'
    }
  },
  events: {
    source: 'Docker Documentation',
    title: 'docker system events',
    url: 'https://docs.docker.com/reference/cli/docker/system/events/',
    keyTakeaway: {
      vi: 'Sự kiện container gồm die, oom, kill, restart, health_status…; lọc bằng --filter event=… --filter container=….',
      en: 'Container events include die, oom, kill, restart, health_status…; filter with --filter event=… --filter container=….'
    }
  },
  imageTag: {
    source: 'Docker Documentation',
    title: 'docker image tag',
    url: 'https://docs.docker.com/reference/cli/docker/image/tag/',
    keyTakeaway: {
      vi: 'Tên image: [HOST[:PORT]/]NAMESPACE/REPOSITORY[:TAG]; thiếu host thì là docker.io, thiếu tag thì là latest.',
      en: 'Image name: [HOST[:PORT]/]NAMESPACE/REPOSITORY[:TAG]; host defaults to docker.io and tag to latest.'
    }
  },
  ociDistribution: {
    source: 'Open Container Initiative',
    title: 'OCI Distribution Specification',
    url: 'https://github.com/opencontainers/distribution-spec/blob/main/spec.md',
    keyTakeaway: {
      vi: 'GET /v2/<name>/manifests/<tag-or-digest>; tag là con trỏ dễ đọc (tối đa 128 ký tự) tới manifest, digest là hash mật mã của nội dung.',
      en: 'GET /v2/<name>/manifests/<tag-or-digest>; a tag is a human-readable pointer (max 128 chars) to a manifest, a digest is a cryptographic hash of the content.'
    }
  }
} satisfies Record<string, CourseCitation>;
