import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const volumesBindMountsTopic: DockerTopic = {
  id: 'volumes-bind-mounts',
  roadmapId: 'DOCKER-07',
  category: 'docker-multi-container',
  level: 'intermediate',
  chapter: 'Cấp độ 2',
  name: 'Persistent Storage: Volumes & Bind Mounts',
  tagline: {
    vi: 'Writable layer chết cùng container; named volume sống ngoài vòng đời container và đi vòng qua OverlayFS; bind mount gắn thư mục host; tmpfs chỉ nằm trong RAM — cùng quyền sở hữu file, backup và restore.',
    en: 'The writable layer dies with the container; a named volume outlives it and bypasses OverlayFS; a bind mount maps a host directory; tmpfs lives only in RAM — plus file ownership, backup and restore.'
  },
  difficulty: 2,
  order: 7,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Chạy PostgreSQL trong container, nạp dữ liệu, rồi docker rm để nâng version image: toàn bộ database biến mất. Container được thiết kế để vứt đi và tạo lại, nhưng dữ liệu thì không được phép như vậy.',
      en: 'Run PostgreSQL in a container, load data, then docker rm to upgrade the image: the whole database is gone. Containers are designed to be thrown away and recreated; data must not be.'
    },
    hardwareConstraint: {
      vi: 'Writable layer là upperdir của OverlayFS, gắn với đúng một container và bị xoá cùng nó. Ghi vào đó còn chậm: lần sửa đầu tiên mỗi file của image phải copy-up nguyên file, không phù hợp với file dữ liệu database lớn và ghi liên tục.',
      en: 'The writable layer is an OverlayFS upperdir tied to exactly one container and deleted with it. Writing there is also slow: the first change to any image file copies the whole file up, a poor fit for large, constantly written database files.'
    },
    fundamentalSolution: {
      vi: 'Mount dữ liệu từ bên ngoài writable layer. Named volume do Docker quản lý (mặc định /var/lib/docker/volumes/<name>/_data), sống độc lập với container và được mount thẳng vào đường dẫn trong container, đi vòng qua OverlayFS. Bind mount gắn một đường dẫn có sẵn trên host — tiện cho mã nguồn lúc dev, nhưng phụ thuộc cấu trúc thư mục host. tmpfs giữ dữ liệu trong RAM và mất khi container dừng. Volume rỗng được copy nội dung image tại mount point ở lần gắn đầu tiên.',
      en: 'Mount data from outside the writable layer. A named volume is managed by Docker (by default /var/lib/docker/volumes/<name>/_data), lives independently of containers and is mounted straight into the container path, bypassing OverlayFS. A bind mount maps an existing host path — handy for source code in development but tied to the host directory layout. tmpfs keeps data in RAM and loses it when the container stops. An empty volume is populated with the image content at the mount point on first mount.'
    },
    math: {
      formula: String.raw`\text{lifetime(data)} = \begin{cases} \text{lifetime(container)} & \text{writable layer} \\ \text{until } \texttt{docker volume rm} & \text{named volume} \\ \text{until the container stops} & \text{tmpfs} \end{cases}`,
      description: {
        vi: 'Chọn nơi lưu theo vòng đời mong muốn của dữ liệu, không theo sự tiện lợi. Database, upload, hàng đợi → volume; cache tạm, file nhạy cảm không muốn chạm đĩa → tmpfs; mã nguồn khi dev → bind mount.',
        en: 'Choose where data lives by how long it must live, not by convenience. Databases, uploads, queues → volumes; scratch caches and sensitive files that must not touch disk → tmpfs; source code in development → bind mounts.'
      },
      timeComplexity: 'Volume writes: native filesystem speed (no copy-up)',
      spaceComplexity: 'Volume data persists until explicitly removed'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Ba kiểu mount — volume, bind, tmpfs — cùng nằm trong mount namespace của container, nhưng khác nhau ở nơi dữ liệu thật sự nằm và ai quản lý vòng đời của nó.',
      en: 'The three mount types — volume, bind and tmpfs — all sit in the container mount namespace, but differ in where the data really lives and who manages its lifecycle.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Volume và vòng đời: docker rm không xoá named volume; docker rm -v và docker run --rm chỉ xoá anonymous volume của container đó. Dọn volume không còn dùng bằng docker volume prune. Volume rỗng mount vào thư mục image có sẵn file (ví dụ /var/lib/postgresql/data) sẽ được copy nội dung đó vào ở lần đầu; tắt hành vi này bằng volume-nocopy. Volume không rỗng hoặc bind mount đè lên thư mục sẽ che nội dung có sẵn của image.',
        en: 'Volumes and lifecycle: docker rm does not remove named volumes; docker rm -v and docker run --rm remove only that container’s anonymous volumes. Clean up unused volumes with docker volume prune. An empty volume mounted over an image directory with files (e.g. /var/lib/postgresql/data) is populated with that content the first time; turn this off with volume-nocopy. A non-empty volume or a bind mount over a directory hides the image’s existing content.'
      },
      {
        vi: '--mount vs -v: -v tự tạo thư mục host còn thiếu khi bind mount, nên gõ sai đường dẫn sẽ âm thầm mount một thư mục rỗng; --mount type=bind báo lỗi "bind source path does not exist". --mount dài hơn nhưng tường minh và hỗ trợ đủ tuỳ chọn (readonly, volume-subpath, driver options) — nên dùng trong script và tài liệu.',
        en: '--mount vs -v: -v silently creates a missing host directory for a bind mount, so a typo mounts an empty directory; --mount type=bind fails with "bind source path does not exist". --mount is longer but explicit and supports every option (readonly, volume-subpath, driver options) — prefer it in scripts and docs.'
      },
      {
        vi: 'Quyền sở hữu file: kernel chỉ so UID/GID dạng số. Image postgres chạy UID 999; bind mount một thư mục host thuộc UID 1000 thì Postgres không ghi được ("Permission denied"). Named volume mới tạo nhận quyền sở hữu từ thư mục của image khi được populate, nên thường "chạy được ngay". Với bind mount, chown thư mục host theo UID của process trong container, hoặc chạy container với --user khớp UID host.',
        en: 'File ownership: the kernel compares numeric UIDs/GIDs only. The postgres image runs as UID 999; bind-mounting a host directory owned by UID 1000 means Postgres cannot write ("Permission denied"). A fresh named volume takes its ownership from the image directory when populated, so it usually "just works". With bind mounts, chown the host directory to the container process UID, or run the container with a matching --user.'
      },
      {
        vi: 'Storage driver: writable layer và layer image do storage driver quản lý (overlay2 trên đa số host cũ); Docker Engine 29+ cài mới dùng containerd image store với snapshotter. Volume không đi qua storage driver, nên hiệu năng ghi gần như filesystem gốc. Backup volume: dừng ứng dụng (hoặc dùng công cụ của chính nó như pg_dump), rồi chạy container tạm mount volume và tar ra thư mục host.',
        en: 'Storage drivers: the writable layer and image layers are managed by the storage driver (overlay2 on most older hosts); fresh Docker Engine 29+ installs use the containerd image store with snapshotters. Volumes bypass the storage driver, so writes run at near-native filesystem speed. Backing up a volume: stop the app (or use its own tool such as pg_dump), then run a throwaway container that mounts the volume and tars it into a host directory.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Database ghi vào writable layer (quên khai báo volume): chạy tốt nhiều tháng cho tới lần docker rm đầu tiên khi nâng cấp.',
        en: 'A database writing to the writable layer (no volume declared): works for months until the first docker rm during an upgrade.'
      },
      {
        vi: 'tar thư mục dữ liệu của Postgres đang chạy: bản backup không nhất quán, restore có thể hỏng. Dừng container hoặc dùng pg_dump/pg_basebackup.',
        en: 'Tarring a running Postgres data directory: the backup is inconsistent and the restore may be corrupt. Stop the container or use pg_dump/pg_basebackup.'
      },
      {
        vi: 'Bind mount thư mục rỗng đè lên /app trong lúc dev rồi ngạc nhiên vì ứng dụng "mất" file của image.',
        en: 'Bind-mounting an empty directory over /app during development, then wondering why the app "lost" the image files.'
      },
      {
        vi: 'docker volume prune trên máy dùng chung xoá volume của project đang tạm dừng.',
        en: 'docker volume prune on a shared machine deleting volumes of a project that is merely stopped.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Dữ liệu thật sự nằm ở đâu', en: 'Where the data really lives' },
    description: {
      vi: 'Mount namespace của container ghép rootfs OverlayFS với các mount từ ngoài vào.',
      en: 'The container mount namespace combines the OverlayFS rootfs with mounts from outside.'
    },
    asciiDiagram: `
 container "pg" — mount namespace
 /                         overlay: upperdir (rw, deleted by docker rm) + image layers (ro)
 /var/lib/postgresql/data  ──► volume pgdata   /var/lib/docker/volumes/pgdata/_data   (survives rm)
 /docker-entrypoint-initdb.d ► bind  ./init     host path, read-only                  (host owns it)
 /tmp                      ──► tmpfs            RAM only, counted in the memory limit  (gone on stop)

 docker rm pg          → upperdir deleted, pgdata untouched
 docker run … -v pgdata:/var/lib/postgresql/data postgres:17  → same data, new container
`,
    components: [
      {
        name: 'Writable layer',
        role: 'Ephemeral',
        description: {
          vi: 'upperdir riêng của container; mất khi docker rm.',
          en: 'The container’s private upperdir; lost on docker rm.'
        }
      },
      {
        name: 'Named volume',
        role: 'Persistent',
        description: {
          vi: 'Docker quản lý, sống ngoài container, không qua OverlayFS.',
          en: 'Managed by Docker, outlives containers, bypasses OverlayFS.'
        }
      },
      {
        name: 'Bind mount',
        role: 'Host path',
        description: {
          vi: 'Gắn thư mục/file có sẵn trên host; host và container cùng sửa được.',
          en: 'Maps an existing host directory/file; both host and container can modify it.'
        }
      },
      {
        name: 'tmpfs',
        role: 'In-memory',
        description: {
          vi: 'Chỉ trong RAM, tính vào memory limit, mất khi container dừng.',
          en: 'RAM only, counted against the memory limit, lost when the container stops.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'writable-layer',
      title: {
        vi: 'Không volume: ghi vào writable layer',
        en: 'No volume: writes hit the writable layer'
      },
      phase: 'Write',
      description: {
        vi: 'Postgres tạo file dữ liệu trong upperdir của container.',
        en: 'Postgres creates its data files in the container upperdir.'
      },
      systemBehavior: {
        vi: 'OverlayFS copy-up mỗi file image bị sửa lần đầu.',
        en: 'OverlayFS copies up every image file on its first modification.'
      },
      codeLineMatch: 'docker run -d --name pg-tmp'
    },
    {
      id: 'rm-loses',
      title: { vi: 'docker rm → dữ liệu mất', en: 'docker rm → the data is gone' },
      phase: 'Lose',
      description: {
        vi: 'Xoá container xoá luôn upperdir; container mới khởi tạo database rỗng.',
        en: 'Removing the container deletes its upperdir; a new container initialises an empty database.'
      },
      systemBehavior: {
        vi: 'Image không đổi; chỉ writable layer bị huỷ.',
        en: 'The image is unchanged; only the writable layer is destroyed.'
      },
      codeLineMatch: 'docker rm -f pg-tmp'
    },
    {
      id: 'named-volume',
      title: { vi: 'Named volume đi vòng qua OverlayFS', en: 'A named volume bypasses OverlayFS' },
      phase: 'Persist',
      description: {
        vi: 'Mount pgdata vào thư mục dữ liệu; volume rỗng được copy nội dung image ở lần đầu.',
        en: 'Mount pgdata at the data directory; an empty volume is populated from the image the first time.'
      },
      systemBehavior: {
        vi: 'Dữ liệu nằm ở /var/lib/docker/volumes/pgdata/_data, ghi với tốc độ filesystem gốc.',
        en: 'Data lives in /var/lib/docker/volumes/pgdata/_data and is written at native filesystem speed.'
      },
      codeLineMatch: '--mount type=volume,source=pgdata'
    },
    {
      id: 'survive-backup',
      title: {
        vi: 'Tạo lại container & backup volume',
        en: 'Recreate the container & back up the volume'
      },
      phase: 'Recover',
      description: {
        vi: 'Container mới gắn lại cùng volume và thấy nguyên dữ liệu; container tạm tar volume ra host.',
        en: 'A new container reattaches the same volume and sees all the data; a throwaway container tars the volume to the host.'
      },
      systemBehavior: {
        vi: 'Volume chỉ mất khi docker volume rm hoặc prune.',
        en: 'The volume is removed only by docker volume rm or prune.'
      },
      codeLineMatch: 'tar czf /backup/pgdata.tgz'
    }
  ],

  comparison: {
    title: { vi: 'Volume vs Bind mount vs tmpfs', en: 'Volume vs Bind mount vs tmpfs' },
    subtitle: {
      vi: 'Ba kiểu mount, ba vòng đời dữ liệu',
      en: 'Three mount types, three data lifetimes'
    },
    options: [
      {
        name: 'Named volume',
        tag: 'Production data',
        role: { vi: 'Docker quản lý, bền vững', en: 'Docker-managed, durable' },
        keyMechanism: {
          vi: 'Sống ngoài container, có driver (local, NFS, plugin), tự populate từ image.',
          en: 'Outlives containers, has drivers (local, NFS, plugins), auto-populates from the image.'
        },
        configExample: '--mount type=volume,source=pgdata,target=/var/lib/postgresql/data',
        architectureNote: {
          vi: 'Mặc định cho database, upload và mọi dữ liệu cần giữ.',
          en: 'The default for databases, uploads and anything that must be kept.'
        }
      },
      {
        name: 'Bind mount',
        tag: 'Dev & host files',
        role: { vi: 'Gắn đường dẫn host', en: 'Maps a host path' },
        keyMechanism: {
          vi: 'Dùng thẳng thư mục host; phụ thuộc UID/GID và cấu trúc thư mục host.',
          en: 'Uses the host directory directly; depends on host UIDs/GIDs and layout.'
        },
        configExample:
          '--mount type=bind,source="$(pwd)"/init,target=/docker-entrypoint-initdb.d,readonly',
        architectureNote: {
          vi: 'Cho mã nguồn khi dev, file cấu hình; thêm readonly khi có thể.',
          en: 'For source code in development and config files; add readonly when possible.'
        }
      },
      {
        name: 'tmpfs',
        tag: 'RAM only',
        role: { vi: 'Dữ liệu tạm trong bộ nhớ', en: 'Scratch data in memory' },
        keyMechanism: {
          vi: 'Không chạm đĩa, mất khi container dừng, tính vào memory limit.',
          en: 'Never touches disk, lost when the container stops, counts against the memory limit.'
        },
        configExample: '--mount type=tmpfs,target=/tmp,tmpfs-size=64m',
        architectureNote: {
          vi: 'Kết hợp --read-only cho rootfs bất biến (DOCKER-05).',
          en: 'Pairs with --read-only for an immutable rootfs (DOCKER-05).'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Dữ liệu tách khỏi vòng đời container: nâng cấp image an toàn.',
        en: 'Data is decoupled from the container lifecycle: image upgrades are safe.'
      },
      {
        vi: 'Volume ghi nhanh hơn writable layer (không copy-up).',
        en: 'Volumes write faster than the writable layer (no copy-up).'
      },
      {
        vi: 'Volume có thể backup, di chuyển và dùng chung giữa các container.',
        en: 'Volumes can be backed up, moved and shared between containers.'
      }
    ],
    cons: [
      {
        vi: 'Volume local gắn với một host: container chuyển host thì dữ liệu không đi theo.',
        en: 'Local volumes are tied to one host: data does not follow a container to another host.'
      },
      {
        vi: 'Hai container ghi cùng volume mà không phối hợp có thể làm hỏng dữ liệu.',
        en: 'Two containers writing one volume without coordination can corrupt data.'
      }
    ],
    balance: {
      vi: 'Volume local đủ cho một host; khi cần di chuyển workload giữa các node, dùng storage mạng hoặc PersistentVolume của Kubernetes (DEVOPS-10), hoặc đưa state ra dịch vụ managed.',
      en: 'Local volumes suffice on one host; when workloads move between nodes, use network storage or Kubernetes PersistentVolumes (DEVOPS-10), or move state to a managed service.'
    },
    invariant: {
      vi: 'docker rm không bao giờ xoá named volume; chỉ docker volume rm hoặc prune mới xoá.',
      en: 'docker rm never deletes a named volume; only docker volume rm or prune does.'
    }
  },

  code: [
    {
      label: 'volumes.sh',
      filename: 'volumes.sh',
      language: 'bash',
      code: `# 1) No volume: the data lands in the container's writable layer
docker run -d --name pg-tmp -e POSTGRES_PASSWORD=dev postgres:17
docker exec pg-tmp psql -U postgres -c "CREATE TABLE t(x int); INSERT INTO t VALUES (1);"

# 2) Remove the container -> the writable layer and the data are gone
docker rm -f pg-tmp

# 3) Named volume: lives outside the container, bypasses OverlayFS
docker volume create pgdata
docker run -d --name pg -e POSTGRES_PASSWORD=dev \\
  --mount type=volume,source=pgdata,target=/var/lib/postgresql/data postgres:17
docker volume inspect pgdata --format '{{.Mountpoint}}'   # /var/lib/docker/volumes/pgdata/_data

# 4) Recreate: same data. Back up while the database is stopped
docker rm -f pg && docker run -d --name pg -e POSTGRES_PASSWORD=dev \\
  --mount type=volume,source=pgdata,target=/var/lib/postgresql/data postgres:17
docker stop pg
docker run --rm --mount type=volume,source=pgdata,target=/data,readonly \\
  -v "$(pwd)":/backup alpine tar czf /backup/pgdata.tgz -C /data .
docker start pg`
    },
    {
      label: 'bind & tmpfs',
      filename: 'mounts.sh',
      language: 'bash',
      code: `# Bind mount: host path, read-only; --mount errors if the path does not exist
docker run -d --name pg-init -e POSTGRES_PASSWORD=dev \\
  --mount type=bind,source="$(pwd)"/init,target=/docker-entrypoint-initdb.d,readonly \\
  postgres:17

# Ownership: the postgres process is UID 999; a host dir owned by 1000 fails to write
sudo chown -R 999:999 ./pgdata-host

# tmpfs: memory only, counted in the container memory limit
docker run --rm --read-only --mount type=tmpfs,target=/tmp,tmpfs-size=64m \\
  alpine sh -c 'echo scratch > /tmp/x && df -h /tmp'

# Restore into a fresh volume
docker volume create pgdata-restored
docker run --rm --mount type=volume,source=pgdata-restored,target=/data \\
  -v "$(pwd)":/backup alpine tar xzf /backup/pgdata.tgz -C /data`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Dữ liệu ghi trong container đi đâu khi chạy docker rm?',
        en: 'Where does data written inside a container go when you run docker rm?'
      },
      answer: {
        vi: 'Dữ liệu ghi vào filesystem của container nằm trong writable layer và bị xoá cùng container. Dữ liệu ghi vào named volume vẫn còn, vì docker rm không xoá named volume (chỉ docker rm -v hay --rm xoá anonymous volume của container đó).',
        en: 'Data written to the container filesystem sits in the writable layer and is deleted with the container. Data written to a named volume stays, because docker rm does not delete named volumes (only docker rm -v or --rm remove that container’s anonymous volumes).'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Container Postgres báo "Permission denied" khi dùng bind mount nhưng chạy tốt với named volume. Vì sao?',
        en: 'A Postgres container reports "Permission denied" with a bind mount but works with a named volume. Why?'
      },
      answer: {
        vi: 'Kernel kiểm tra quyền theo UID số. Postgres chạy UID 999 còn thư mục host thuộc user của bạn (thường 1000). Named volume mới được populate từ thư mục trong image nên nhận đúng quyền sở hữu. Sửa bind mount bằng chown theo UID 999 hoặc chạy --user khớp UID host.',
        en: 'The kernel checks permissions by numeric UID. Postgres runs as UID 999 while the host directory belongs to your user (usually 1000). A fresh named volume is populated from the image directory and inherits the right ownership. Fix the bind mount by chowning to UID 999 or running with a --user that matches the host UID.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Bạn backup một volume database thế nào để restore chắc chắn dùng được?',
        en: 'How do you back up a database volume so the restore is guaranteed to work?'
      },
      answer: {
        vi: 'Ưu tiên công cụ của chính database (pg_dump, pg_basebackup + WAL) vì chúng tạo bản nhất quán khi đang chạy. Nếu backup ở mức file thì phải dừng database (hoặc snapshot filesystem nhất quán) trước khi tar. Và quan trọng nhất: định kỳ restore thử vào môi trường riêng — backup chưa từng restore thì chưa phải backup.',
        en: 'Prefer the database’s own tools (pg_dump, pg_basebackup + WAL) because they produce consistent copies while running. A file-level backup requires stopping the database (or a consistent filesystem snapshot) before tarring. Most importantly, regularly test-restore into a separate environment — a backup never restored is not a backup.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Nâng cấp image Postgres làm mất toàn bộ dữ liệu staging',
      en: 'Upgrading the Postgres image wiped all staging data'
    },
    businessContext: {
      vi: 'Môi trường staging chạy postgres bằng docker run không có -v; dữ liệu test được nạp tay trong hai tuần.',
      en: 'Staging ran postgres via docker run with no -v; test data had been loaded by hand over two weeks.'
    },
    problemDescription: {
      vi: 'Kỹ sư chạy docker rm -f rồi docker run với tag mới để vá CVE. Database khởi động trống.',
      en: 'An engineer ran docker rm -f and then docker run with a new tag to patch a CVE. The database came up empty.'
    },
    whyNaiveFails: {
      vi: 'Image postgres khai báo VOLUME cho thư mục dữ liệu, nên dữ liệu nằm trong một anonymous volume tên ngẫu nhiên. Container mới tạo anonymous volume mới, rỗng; volume cũ vẫn còn trên đĩa nhưng không ai biết tên.',
      en: 'The postgres image declares a VOLUME for its data directory, so the data sat in a randomly named anonymous volume. The new container created a fresh, empty anonymous volume; the old one was still on disk but nobody knew its name.'
    },
    coreSolution: {
      vi: 'Tìm volume cũ qua docker volume ls -f dangling=true và kích thước, gắn lại vào container mới. Từ đó luôn dùng named volume khai báo rõ trong Compose, và thêm backup pg_dump hằng đêm.',
      en: 'Find the old volume via docker volume ls -f dangling=true and its size, then reattach it to the new container. From then on, always use a named volume declared in Compose, plus a nightly pg_dump backup.'
    },
    productionCode: `services:
  db:
    image: postgres:17
    volumes:
      - pgdata:/var/lib/postgresql/data   # named, survives docker compose down
volumes:
  pgdata: {}
# docker compose down      -> keeps pgdata
# docker compose down -v   -> DELETES pgdata (only on purpose)`,
    productionLanguage: 'yaml',
    architectureImpact: {
      vi: 'Nâng cấp image trở thành thao tác an toàn, có thể lặp lại; dữ liệu có tên, có backup và có quy trình restore.',
      en: 'Image upgrades become a safe, repeatable operation; the data has a name, a backup and a restore procedure.'
    }
  },

  researchCitations: [
    DOCKER_CITATIONS.volumes,
    DOCKER_CITATIONS.bindMounts,
    DOCKER_CITATIONS.storageDrivers,
    DOCKER_CITATIONS.overlayfs
  ]
};
