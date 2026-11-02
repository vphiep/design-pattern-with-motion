import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const cliContainerLifecycleTopic: DockerTopic = {
  id: 'cli-container-lifecycle',
  roadmapId: 'DOCKER-03',
  category: 'docker-fundamentals',
  level: 'beginner',
  chapter: 'Cấp độ 1',
  name: 'Docker CLI & Container Lifecycle',
  tagline: {
    vi: 'pull, run, ps, exec, logs, stop, kill, rm — vòng đời created → running → exited → removed, SIGTERM rồi SIGKILL sau 10 giây, exit code 137/143, ENTRYPOINT vs CMD và restart policy.',
    en: 'pull, run, ps, exec, logs, stop, kill, rm — the created → running → exited → removed lifecycle, SIGTERM then SIGKILL after 10 seconds, exit codes 137/143, ENTRYPOINT vs CMD and restart policies.'
  },
  difficulty: 1,
  order: 3,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Chạy được docker run chưa đủ: cần biết container đang ở trạng thái nào, vì sao nó thoát, log nằm đâu, tắt sao cho ứng dụng kịp đóng kết nối DB, và ai khởi động lại nó khi crash. Thiếu các kiến thức này, mọi sự cố đều trông giống nhau: "container chết".',
      en: 'Running docker run is not enough: you need to know what state a container is in, why it exited, where its logs are, how to stop it so the app can close DB connections, and who restarts it after a crash. Without this, every incident looks the same: "the container died".'
    },
    hardwareConstraint: {
      vi: 'Container là một process Linux, nên vòng đời của nó tuân theo luật của process: nó chạy chừng nào PID 1 còn chạy, chỉ dừng gọn khi xử lý tín hiệu, và exit code là một byte duy nhất mã hoá cả "lỗi ứng dụng" lẫn "bị tín hiệu giết".',
      en: 'A container is a Linux process, so its lifecycle follows process rules: it runs as long as PID 1 runs, stops gracefully only if it handles signals, and its exit code is a single byte encoding both "app error" and "killed by a signal".'
    },
    fundamentalSolution: {
      vi: 'Docker CLI quản lý vòng đời qua các lệnh rõ ràng: run = create + start; stop gửi SIGTERM (hoặc STOPSIGNAL), chờ grace period (mặc định 10 giây trên Linux) rồi SIGKILL; kill gửi SIGKILL ngay; rm xoá container và writable layer của nó. Trạng thái và lý do thoát nằm trong docker inspect (State.Status, ExitCode, OOMKilled). Restart policy (no, on-failure[:n], always, unless-stopped) để daemon tự khởi động lại container.',
      en: 'The Docker CLI manages the lifecycle through explicit commands: run = create + start; stop sends SIGTERM (or STOPSIGNAL), waits a grace period (10 seconds by default on Linux), then SIGKILL; kill sends SIGKILL immediately; rm deletes the container and its writable layer. State and exit reason live in docker inspect (State.Status, ExitCode, OOMKilled). Restart policies (no, on-failure[:n], always, unless-stopped) make the daemon restart containers.'
    },
    math: {
      formula: String.raw`\text{exit} = 128 + \text{signo} \;\Rightarrow\; \text{SIGTERM}(15) \to 143,\quad \text{SIGKILL}(9) \to 137`,
      description: {
        vi: 'Exit code ≥ 128 nghĩa là process bị tín hiệu kết thúc. 143 = dừng bằng SIGTERM; 137 = bị SIGKILL (docker kill, hết grace period, hoặc OOM killer). Exit 125/126/127 do chính docker run trả về: lỗi daemon, lệnh không thực thi được, không tìm thấy lệnh.',
        en: 'An exit code ≥ 128 means the process was ended by a signal. 143 = stopped by SIGTERM; 137 = SIGKILLed (docker kill, grace period expired, or the OOM killer). Exits 125/126/127 come from docker run itself: daemon error, command not invokable, command not found.'
      },
      timeComplexity: 'stop: ≤ grace period (default 10 s) before SIGKILL',
      spaceComplexity: 'A stopped container keeps its writable layer until docker rm'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Mọi lệnh docker là một request tới Docker API; nắm được mô hình trạng thái thì đọc được mọi output của ps và inspect.',
      en: 'Every docker command is a Docker API request; once you know the state model you can read any ps or inspect output.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Trạng thái: created (đã có writable layer và config, chưa có process) → running → paused (cgroup freezer đóng băng process) → exited (process đã kết thúc, writable layer vẫn còn, docker start chạy lại được) → removed. docker ps chỉ hiện container đang chạy; docker ps -a hiện cả container đã thoát kèm exit code, ví dụ "Exited (137) 2 minutes ago".',
        en: 'States: created (writable layer and config exist, no process yet) → running → paused (the cgroup freezer stops the processes) → exited (the process ended, the writable layer remains, docker start can rerun it) → removed. docker ps shows only running containers; docker ps -a also shows exited ones with their exit code, e.g. "Exited (137) 2 minutes ago".'
      },
      {
        vi: 'ENTRYPOINT vs CMD: ENTRYPOINT là chương trình luôn chạy, CMD là tham số mặc định. Đối số sau tên image trong docker run thay thế CMD; --entrypoint thay thế ENTRYPOINT. Dạng shell (ENTRYPOINT java -jar app.jar) chạy dưới /bin/sh -c nên shell là PID 1 và không chuyển tiếp tín hiệu; dạng exec (ENTRYPOINT ["java","-jar","app.jar"]) để ứng dụng là PID 1 và nhận SIGTERM trực tiếp.',
        en: 'ENTRYPOINT vs CMD: ENTRYPOINT is the program that always runs, CMD supplies default arguments. Arguments after the image name in docker run replace CMD; --entrypoint replaces ENTRYPOINT. Shell form (ENTRYPOINT java -jar app.jar) runs under /bin/sh -c, so the shell is PID 1 and does not forward signals; exec form (ENTRYPOINT ["java","-jar","app.jar"]) makes the app PID 1, receiving SIGTERM directly.'
      },
      {
        vi: 'Foreground vs detached: không có -d, CLI gắn stdout/stderr của container vào terminal; -it cấp TTY và stdin cho shell tương tác; -d chạy nền và in ra container ID. Log của container chính là stdout/stderr của PID 1 do logging driver thu lại — docker logs đọc từ đó. -e/--env-file truyền biến môi trường, -p host:container publish port (chi tiết ở DOCKER-06).',
        en: 'Foreground vs detached: without -d the CLI attaches the container stdout/stderr to your terminal; -it allocates a TTY and stdin for an interactive shell; -d runs in the background and prints the container ID. Container logs are PID 1’s stdout/stderr captured by the logging driver — docker logs reads from there. -e/--env-file pass environment variables, -p host:container publishes a port (details in DOCKER-06).'
      },
      {
        vi: 'Restart policy: on-failure chỉ restart khi exit code khác 0 (có thể giới hạn on-failure:5); always restart mọi lúc, nhưng container bị docker stop thủ công chỉ chạy lại khi daemon khởi động lại; unless-stopped thì không chạy lại cả khi daemon khởi động lại. Policy chỉ có hiệu lực sau khi container đã chạy được ít nhất 10 giây, để tránh vòng restart vô hạn của container hỏng ngay khi start.',
        en: 'Restart policies: on-failure restarts only on a non-zero exit (optionally capped, on-failure:5); always restarts every time, but a container stopped with docker stop only comes back when the daemon restarts; unless-stopped stays down even across daemon restarts. A policy only takes effect after the container has been up for at least 10 seconds, to avoid endless restart loops of containers that fail at start.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Script khởi động chạy ứng dụng nền (java -jar app.jar &) rồi kết thúc: PID 1 thoát với exit 0, container dừng ngay dù ứng dụng vừa mới khởi động.',
        en: 'A start script backgrounds the app (java -jar app.jar &) and ends: PID 1 exits 0 and the container stops even though the app just started.'
      },
      {
        vi: 'Dùng docker kill hoặc grace period quá ngắn cho ứng dụng cần thời gian drain request: request đang xử lý bị cắt, transaction bị rollback giữa chừng.',
        en: 'Using docker kill, or a grace period that is too short, for apps that need time to drain requests: in-flight requests are cut and transactions roll back midway.'
      },
      {
        vi: 'Không bao giờ docker rm: container đã thoát vẫn giữ writable layer và log json-file, đĩa đầy dần (dùng --rm cho container chạy một lần, docker container prune định kỳ).',
        en: 'Never running docker rm: exited containers keep their writable layer and json-file logs and the disk fills up (use --rm for one-off containers, docker container prune regularly).'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Máy trạng thái của container', en: 'The container state machine' },
    description: {
      vi: 'Mỗi mũi tên là một lệnh CLI (một request API); trạng thái được lưu trong dockerd và xem bằng docker inspect.',
      en: 'Every arrow is a CLI command (one API request); state is stored by dockerd and read with docker inspect.'
    },
    asciiDiagram: `
 docker create        docker start           docker pause
 ──────────────► CREATED ─────────► RUNNING ◄────────────► PAUSED
                    ▲                 │   ▲   docker unpause
                    │                 │   │
                    │  PID 1 exits /  │   │ docker start / restart policy
                    │  docker stop    ▼   │
                    │  docker kill  EXITED (ExitCode, OOMKilled, FinishedAt)
                    │                 │
                    └── docker run = create + start
                                      │ docker rm  (deletes the writable layer)
                                      ▼
                                   REMOVED
 docker stop:  SIGTERM ──(grace period, default 10 s)──► SIGKILL
 docker kill:  SIGKILL immediately (or --signal)
`,
    components: [
      {
        name: 'docker run',
        role: 'create + start',
        description: {
          vi: 'Tạo container từ image (pull nếu thiếu) rồi start nó.',
          en: 'Creates a container from the image (pulling if missing), then starts it.'
        }
      },
      {
        name: 'docker exec',
        role: 'Join',
        description: {
          vi: 'Chạy thêm process trong namespace của container đang chạy.',
          en: 'Runs an extra process inside a running container’s namespaces.'
        }
      },
      {
        name: 'docker stop / kill',
        role: 'Signal',
        description: {
          vi: 'stop: SIGTERM rồi SIGKILL; kill: SIGKILL ngay.',
          en: 'stop: SIGTERM then SIGKILL; kill: SIGKILL right away.'
        }
      },
      {
        name: 'docker inspect',
        role: 'State',
        description: {
          vi: 'JSON đầy đủ: State, Config, Mounts, NetworkSettings.',
          en: 'Full JSON: State, Config, Mounts, NetworkSettings.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'run',
      title: { vi: 'run -d: create + start', en: 'run -d: create + start' },
      phase: 'Start',
      description: {
        vi: 'Pull image nếu chưa có, tạo container với env và port, start ở chế độ nền.',
        en: 'Pull the image if missing, create the container with env and ports, start it detached.'
      },
      systemBehavior: {
        vi: 'dockerd tạo writable layer, cấu hình mạng rồi nhờ containerd/runc chạy PID 1.',
        en: 'dockerd creates the writable layer and networking, then has containerd/runc start PID 1.'
      },
      codeLineMatch: 'docker run -d --name api'
    },
    {
      id: 'observe',
      title: { vi: 'ps, logs, exec, stats', en: 'ps, logs, exec, stats' },
      phase: 'Observe',
      description: {
        vi: 'Xem trạng thái, đọc stdout/stderr, mở shell bên trong, đo CPU/RAM.',
        en: 'Check status, read stdout/stderr, open a shell inside, measure CPU/RAM.'
      },
      systemBehavior: {
        vi: 'docker logs đọc từ logging driver; exec gia nhập namespace của container (setns).',
        en: 'docker logs reads from the logging driver; exec joins the container namespaces (setns).'
      },
      codeLineMatch: 'docker logs -f --tail 100 api'
    },
    {
      id: 'stop',
      title: { vi: 'stop: SIGTERM → grace → SIGKILL', en: 'stop: SIGTERM → grace → SIGKILL' },
      phase: 'Stop',
      description: {
        vi: 'Cho ứng dụng 30 giây để drain request và đóng kết nối trước khi bị giết.',
        en: 'Give the app 30 seconds to drain requests and close connections before it is killed.'
      },
      systemBehavior: {
        vi: 'Hết timeout mà PID 1 chưa thoát thì daemon gửi SIGKILL.',
        en: 'If PID 1 has not exited when the timeout expires, the daemon sends SIGKILL.'
      },
      codeLineMatch: 'docker stop -t 30 api'
    },
    {
      id: 'exit-code',
      title: { vi: 'Đọc exit code & lý do', en: 'Read the exit code & reason' },
      phase: 'Diagnose',
      description: {
        vi: '143 = SIGTERM, 137 = SIGKILL; OOMKilled=true cho biết kernel đã giết vì hết bộ nhớ.',
        en: '143 = SIGTERM, 137 = SIGKILL; OOMKilled=true says the kernel killed it for memory.'
      },
      systemBehavior: {
        vi: 'Container ở trạng thái exited, writable layer vẫn còn cho tới khi docker rm.',
        en: 'The container is exited; its writable layer stays until docker rm.'
      },
      codeLineMatch: 'State.ExitCode'
    },
    {
      id: 'restart',
      title: { vi: 'Restart policy & dọn dẹp', en: 'Restart policy & cleanup' },
      phase: 'Recover',
      description: {
        vi: 'on-failure:5 cho phép tối đa 5 lần restart khi exit code khác 0; rm xoá container.',
        en: 'on-failure:5 allows up to 5 restarts on non-zero exits; rm deletes the container.'
      },
      systemBehavior: {
        vi: 'Daemon theo dõi exit và tự start lại theo policy.',
        en: 'The daemon watches exits and restarts per the policy.'
      },
      codeLineMatch: '--restart=on-failure:5'
    }
  ],

  comparison: {
    title: {
      vi: 'docker stop vs docker kill vs docker rm -f',
      en: 'docker stop vs docker kill vs docker rm -f'
    },
    subtitle: {
      vi: 'Ba cách dừng một container và hệ quả',
      en: 'Three ways to stop a container and their consequences'
    },
    options: [
      {
        name: 'docker stop',
        tag: 'Graceful',
        role: { vi: 'Tắt có thời gian dọn dẹp', en: 'Shutdown with cleanup time' },
        keyMechanism: {
          vi: 'SIGTERM (hoặc STOPSIGNAL), chờ -t giây, rồi SIGKILL.',
          en: 'SIGTERM (or STOPSIGNAL), wait -t seconds, then SIGKILL.'
        },
        configExample: 'docker stop -t 30 api',
        architectureNote: {
          vi: 'Mặc định cho deploy và bảo trì.',
          en: 'The default for deploys and maintenance.'
        }
      },
      {
        name: 'docker kill',
        tag: 'Immediate',
        role: { vi: 'Gửi tín hiệu ngay', en: 'Send a signal now' },
        keyMechanism: {
          vi: 'Mặc định SIGKILL — không dọn dẹp; --signal=SIGHUP để reload cấu hình.',
          en: 'SIGKILL by default — no cleanup; --signal=SIGHUP to reload config.'
        },
        configExample: 'docker kill --signal=SIGHUP nginx',
        architectureNote: {
          vi: 'Dùng khi process treo, hoặc để gửi tín hiệu tuỳ chọn.',
          en: 'For hung processes, or to send a custom signal.'
        }
      },
      {
        name: 'docker rm -f',
        tag: 'Destroy',
        role: { vi: 'Kill + xoá', en: 'Kill + delete' },
        keyMechanism: {
          vi: 'SIGKILL rồi xoá container và writable layer.',
          en: 'SIGKILL, then delete the container and its writable layer.'
        },
        configExample: 'docker rm -f api',
        architectureNote: {
          vi: 'Dữ liệu không nằm trong volume sẽ mất.',
          en: 'Data not stored in a volume is lost.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Vòng đời đơn giản, mọi trạng thái xem được qua inspect.',
        en: 'A simple lifecycle; every state is visible through inspect.'
      },
      {
        vi: 'Restart policy đủ cho một host đơn lẻ mà không cần orchestrator.',
        en: 'Restart policies are enough for a single host without an orchestrator.'
      }
    ],
    cons: [
      {
        vi: 'Exit code 137 không phân biệt OOM hay kill thủ công — phải xem thêm OOMKilled và docker events.',
        en: 'Exit code 137 does not distinguish OOM from a manual kill — check OOMKilled and docker events too.'
      },
      {
        vi: 'Restart policy không di chuyển container sang host khác khi host chết.',
        en: 'Restart policies cannot move a container to another host when the host dies.'
      }
    ],
    balance: {
      vi: 'Grace period phải lớn hơn thời gian drain của ứng dụng nhưng đủ nhỏ để deploy không bị treo; JVM Spring Boot thường cần 20–30 giây với server.shutdown=graceful.',
      en: 'The grace period must exceed the app’s drain time yet stay small enough not to stall deploys; a Spring Boot JVM typically needs 20–30 seconds with server.shutdown=graceful.'
    },
    invariant: {
      vi: 'Container chạy khi và chỉ khi PID 1 của nó còn chạy.',
      en: 'A container is running if and only if its PID 1 is running.'
    }
  },

  code: [
    {
      label: 'lifecycle.sh',
      filename: 'lifecycle.sh',
      language: 'bash',
      code: `# Start detached: name, published port, environment
docker pull eclipse-temurin:21-jre
docker run -d --name api -p 8080:8080 \\
  -e SPRING_PROFILES_ACTIVE=prod --env-file ./api.env my/api:1.4.2

# Observe
docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'
docker logs -f --tail 100 api              # stdout/stderr of PID 1
docker exec -it api sh                      # extra process in the same namespaces
docker stats --no-stream api                # CPU %, MEM USAGE / LIMIT, PIDS

# Stop gracefully: SIGTERM, wait up to 30 s, then SIGKILL
docker stop -t 30 api

# Why did it stop?
docker ps -a --filter name=api              # Exited (143) 5 seconds ago
docker inspect -f '{{.State.ExitCode}} oom={{.State.OOMKilled}}' api

# Restart automatically on crashes, then clean up
docker update --restart=on-failure:5 api
docker start api
docker rm -f api                            # kill + delete the writable layer
docker run --rm alpine echo one-off         # --rm: auto-delete on exit`
    },
    {
      label: 'Dockerfile (ENTRYPOINT/CMD)',
      filename: 'Dockerfile',
      language: 'dockerfile',
      code: `FROM eclipse-temurin:21-jre
COPY app.jar /app/app.jar
# Exec form: the JVM is PID 1 and receives SIGTERM
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
# Default arguments; replaced by args after the image name in docker run
CMD ["--server.port=8080"]
# Optional: a different stop signal for apps that drain on SIGQUIT/SIGINT
STOPSIGNAL SIGTERM

#   docker run my/api:1.4.2 --server.port=9090      -> replaces CMD
#   docker run --entrypoint sh -it my/api:1.4.2     -> replaces ENTRYPOINT`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Container thoát với exit code 137. Nghĩa là gì và kiểm tra tiếp ở đâu?',
        en: 'A container exited with code 137. What does it mean and where do you look next?'
      },
      answer: {
        vi: '137 = 128 + 9, tức process bị SIGKILL. Nguyên nhân thường gặp: OOM killer (docker inspect cho State.OOMKilled=true, docker events có sự kiện oom), docker kill, hoặc docker stop hết grace period mà ứng dụng chưa thoát. Kiểm tra inspect, events và log cuối cùng.',
        en: '137 = 128 + 9, i.e. the process was SIGKILLed. Common causes: the OOM killer (docker inspect shows State.OOMKilled=true, docker events has an oom event), docker kill, or docker stop timing out before the app exited. Check inspect, events and the last log lines.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Vì sao docker stop luôn mất đúng 10 giây với container của bạn?',
        en: 'Why does docker stop always take exactly 10 seconds for your container?'
      },
      answer: {
        vi: 'Process PID 1 không phản ứng với SIGTERM nên daemon chờ hết grace period mặc định 10 giây rồi SIGKILL. Thường do ENTRYPOINT dạng shell (sh là PID 1, không chuyển tiếp tín hiệu) hoặc ứng dụng không cài handler. Sửa bằng exec form, --init (tini), hoặc STOPSIGNAL phù hợp.',
        en: 'PID 1 ignores SIGTERM, so the daemon waits out the default 10-second grace period and then SIGKILLs. Usually a shell-form ENTRYPOINT (sh is PID 1 and does not forward signals) or an app without a handler. Fix with exec form, --init (tini), or a suitable STOPSIGNAL.'
      },
      proTip: {
        vi: 'Exit code 137 sau đúng 10 giây là dấu hiệu nhận biết.',
        en: 'An exit code of 137 after exactly 10 seconds is the giveaway.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Khác nhau giữa restart policy always và unless-stopped?',
        en: 'What is the difference between the always and unless-stopped restart policies?'
      },
      answer: {
        vi: 'Cả hai đều restart khi container dừng. Khác biệt nằm ở container bị stop thủ công: với always, nó chạy lại khi Docker daemon khởi động lại (ví dụ reboot máy); với unless-stopped, nó vẫn nằm im cho tới khi bạn start thủ công.',
        en: 'Both restart a container when it stops. The difference is a manually stopped container: with always it comes back when the Docker daemon restarts (e.g. after a reboot); with unless-stopped it stays down until you start it manually.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Container thoát ngay với exit 0 sau mỗi lần deploy',
      en: 'The container exits immediately with code 0 after every deploy'
    },
    businessContext: {
      vi: 'Một service legacy dùng script start.sh: export biến môi trường, chạy java -jar app.jar & rồi ghi PID ra file.',
      en: 'A legacy service used a start.sh script: export variables, run java -jar app.jar & and write the PID to a file.'
    },
    problemDescription: {
      vi: 'docker ps -a hiện "Exited (0)" vài giây sau khi start. Restart policy on-failure không làm gì vì exit code là 0.',
      en: 'docker ps -a showed "Exited (0)" seconds after start. The on-failure restart policy did nothing because the exit code was 0.'
    },
    whyNaiveFails: {
      vi: 'start.sh là PID 1. Nó đưa JVM xuống nền và kết thúc thành công; container dừng khi PID 1 thoát, kéo theo cả JVM.',
      en: 'start.sh was PID 1. It sent the JVM to the background and finished successfully; the container stops when PID 1 exits, taking the JVM with it.'
    },
    coreSolution: {
      vi: 'Dùng exec ở dòng cuối script để JVM thay thế shell và trở thành PID 1, hoặc bỏ script và dùng ENTRYPOINT dạng exec với biến môi trường từ docker run -e.',
      en: 'Use exec on the script’s last line so the JVM replaces the shell and becomes PID 1, or drop the script and use an exec-form ENTRYPOINT with variables from docker run -e.'
    },
    productionCode: `#!/bin/sh
set -e
export JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
# exec: the JVM replaces this shell and becomes PID 1 (receives SIGTERM)
exec java -jar /app/app.jar "$@"`,
    productionLanguage: 'bash',
    architectureImpact: {
      vi: 'Container sống đúng bằng vòng đời của JVM, docker stop tắt gọn, và restart policy phản ứng đúng với crash thật.',
      en: 'The container lives exactly as long as the JVM, docker stop shuts down cleanly, and the restart policy reacts to real crashes.'
    }
  },

  researchCitations: [
    DOCKER_CITATIONS.containerStop,
    DOCKER_CITATIONS.restartPolicies,
    DOCKER_CITATIONS.runReference,
    DOCKER_CITATIONS.dockerfileReference
  ]
};
