import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const containerNetworkingBridgeTopic: DockerTopic = {
  id: 'container-networking-bridge',
  roadmapId: 'DOCKER-06',
  category: 'docker-multi-container',
  level: 'intermediate',
  chapter: 'Cấp độ 2',
  name: 'Docker Networking & Service Discovery',
  tagline: {
    vi: 'Driver bridge/host/none/overlay/macvlan; gói tin đi qua veth và bridge, MASQUERADE ra ngoài; -p 8080:80 là DNAT; DNS nhúng 127.0.0.11 trên user-defined network; EXPOSE vs publish, và vì sao localhost trong container không phải host.',
    en: 'bridge/host/none/overlay/macvlan drivers; packets cross a veth and a bridge, MASQUERADEd outbound; -p 8080:80 is DNAT; embedded DNS at 127.0.0.11 on user-defined networks; EXPOSE vs publish, and why localhost in a container is not the host.'
  },
  difficulty: 2,
  order: 6,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Network namespace mới chỉ có lo. Container cần nói chuyện với nhau, ra Internet, và nhận traffic từ client bên ngoài — trong khi mỗi container có IP riêng trong dải private mà thế giới bên ngoài không route tới được.',
      en: 'A fresh network namespace has only lo. Containers must talk to each other, reach the Internet and accept traffic from outside — while each has a private IP the outside world cannot route to.'
    },
    hardwareConstraint: {
      vi: 'Host chỉ có một (vài) NIC vật lý và một IP công khai; mọi container phải chia sẻ chúng. Mỗi hop (veth, bridge, conntrack, NAT) thêm chi phí CPU cho mỗi gói tin.',
      en: 'The host has one (or a few) physical NICs and one public IP; all containers share them. Every hop (veth, bridge, conntrack, NAT) adds per-packet CPU cost.'
    },
    fundamentalSolution: {
      vi: 'Tạo cặp veth (ống hai đầu): một đầu thành eth0 trong namespace container, đầu kia gắn vào Linux bridge (docker0, 172.17.0.1/16) trên host — bridge hoạt động như switch L2. Ra ngoài: iptables/nftables MASQUERADE (SNAT) đổi IP nguồn thành IP host. Vào trong: -p 8080:80 thêm DNAT host:8080 → 172.17.0.2:80. Trên user-defined network, Docker chạy DNS nhúng tại 127.0.0.11 phân giải theo tên container.',
      en: 'Create a veth pair (a two-ended pipe): one end becomes eth0 in the container namespace, the other attaches to a Linux bridge (docker0, 172.17.0.1/16) on the host — the bridge acts as an L2 switch. Outbound: iptables/nftables MASQUERADE (SNAT) rewrites the source to the host IP. Inbound: -p 8080:80 adds DNAT host:8080 → 172.17.0.2:80. On user-defined networks Docker runs an embedded DNS at 127.0.0.11 resolving container names.'
    },
    math: {
      formula: String.raw`\text{conntrack entries} \approx \lambda_{\text{conn/s}} \times \bar{t}_{\text{lifetime}} \;\le\; \text{nf\_conntrack\_max}`,
      description: {
        vi: 'Mọi kết nối qua NAT được theo dõi trong bảng conntrack. 20.000 kết nối/giây, mỗi kết nối tồn tại (kể cả TIME_WAIT) 60 s ⇒ 1,2 triệu entry — vượt nf_conntrack_max thì kernel drop gói mới ("table full, dropping packet").',
        en: 'Every NATed connection is tracked in conntrack. 20,000 connections/s each living 60 s (including TIME_WAIT) ⇒ 1.2M entries — beyond nf_conntrack_max the kernel drops new packets (“table full, dropping packet”).'
      },
      timeComplexity: 'O(1) hash lookup per packet (conntrack)',
      spaceComplexity: 'O(active connections)'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Docker hỗ trợ nhiều driver: bridge (mặc định), host (dùng chung namespace host), none, overlay (VXLAN đa host), macvlan/ipvlan. Kubernetes thay phần này bằng CNI plugin.',
      en: 'Docker supports several drivers: bridge (default), host (share the host namespace), none, overlay (multi-host VXLAN), macvlan/ipvlan. Kubernetes replaces this layer with CNI plugins.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Default bridge (docker0) KHÔNG có DNS theo tên — container chỉ gọi nhau bằng IP (hoặc --link đã lỗi thời). User-defined bridge (docker network create app-net) có DNS nhúng, cách ly giữa các network, và attach/detach khi đang chạy. Docker Compose luôn tạo user-defined network cho mỗi project (DOCKER-08).',
        en: 'The default bridge (docker0) has NO name-based DNS — containers reach each other only by IP (or deprecated --link). A user-defined bridge (docker network create app-net) provides embedded DNS, isolation between networks and live attach/detach. Docker Compose always creates a user-defined network per project (DOCKER-08).'
      },
      {
        vi: 'EXPOSE trong Dockerfile chỉ là tài liệu (ghi vào config image), không mở gì cả. Publish (-p host:container) mới tạo rule NAT để client bên ngoài host vào được. Container cùng network gọi nhau trực tiếp qua IP/tên và CONTAINER_PORT, không cần publish. Từ Docker Engine 28, daemon chặn truy cập vào port chưa publish từ bên ngoài host; ở các bản cũ hơn, máy cùng L2 segment còn có thể chạm vào port publish trên localhost.',
        en: 'EXPOSE in a Dockerfile is documentation only (recorded in the image config) and opens nothing. Publishing (-p host:container) is what creates the NAT rules that let clients outside the host in. Containers on the same network talk directly by IP/name on the CONTAINER_PORT, no publishing needed. Since Docker Engine 28 the daemon blocks access to unpublished ports from outside the host; in older releases, hosts on the same L2 segment could even reach ports published to localhost.'
      },
      {
        vi: 'localhost trong container là loopback của network namespace của chính container đó — không phải host, không phải container khác. Muốn gọi DB ở container khác thì dùng tên service (db:5432); muốn gọi dịch vụ chạy trên host thì dùng host.docker.internal (Docker Desktop, hoặc --add-host=host.docker.internal:host-gateway trên Linux). Network cũng là ranh giới cách ly: container ở hai user-defined network khác nhau không thấy nhau trừ khi được connect vào cả hai.',
        en: 'localhost in a container is the loopback of that container’s own network namespace — not the host, not another container. To reach a DB in another container use its service name (db:5432); to reach a service on the host use host.docker.internal (Docker Desktop, or --add-host=host.docker.internal:host-gateway on Linux). Networks are also isolation boundaries: containers on two different user-defined networks cannot see each other unless connected to both.'
      },
      {
        vi: 'Publish port: Docker ghi rule DNAT trong chain DOCKER của bảng nat (PREROUTING cho traffic vào từ ngoài, OUTPUT cho traffic từ chính host), cộng thêm docker-proxy userland cho một số trường hợp như localhost hairpin. -p 8080:80 mặc định bind mọi địa chỉ IPv4 và IPv6 của host (0.0.0.0 và ::) — tài liệu Docker gọi đó là "insecure by default" — và rule của Docker nằm trước rule ufw, nên firewall host có thể bị "bỏ qua".',
        en: 'Publishing a port: Docker writes DNAT rules in the DOCKER chain of the nat table (PREROUTING for inbound traffic, OUTPUT for traffic from the host itself), plus a userland docker-proxy for cases like localhost hairpin. -p 8080:80 binds every IPv4 and IPv6 host address (0.0.0.0 and ::) by default — the Docker docs call this “insecure by default” — and Docker’s rules sit before ufw’s, so the host firewall can be bypassed.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: '-p 5432:5432 cho Postgres trên VM có IP public: DB lộ ra Internet dù ufw chặn cổng.',
        en: '-p 5432:5432 for Postgres on a VM with a public IP: the DB is exposed to the Internet even though ufw blocks the port.'
      },
      {
        vi: 'Dải 172.17.0.0/16 trùng VPN/văn phòng → mất route; cấu hình default-address-pools.',
        en: '172.17.0.0/16 overlapping the VPN/office network → broken routes; set default-address-pools.'
      },
      {
        vi: 'Container gọi "localhost:5432" để tới DB ở container khác — localhost là namespace của chính nó.',
        en: 'A container calling “localhost:5432” to reach a DB in another container — localhost is its own namespace.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Đường đi gói tin: client → host:8080 → container:80',
      en: 'Packet path: client → host:8080 → container:80'
    },
    description: {
      vi: 'DNAT vào, bridge chuyển mạch, veth vào namespace; đường về được conntrack đảo ngược.',
      en: 'DNAT inbound, bridge switching, veth into the namespace; conntrack reverses the return path.'
    },
    asciiDiagram: `
 client 203.0.113.9:51544 ──▶ eth0 host 198.51.100.7:8080
                                │ nat PREROUTING → DOCKER: DNAT → 172.18.0.2:80
                                ▼
                        br-3f2a (user-defined bridge 172.18.0.1/16)
                         ├── vethA1 ◀══ veth pair ══▶ eth0 172.18.0.2  [netns api]   :80
                         └── vethB7 ◀══ veth pair ══▶ eth0 172.18.0.3  [netns db]    :5432
                                                       resolv.conf: nameserver 127.0.0.11
                                │
 outbound: 172.18.0.2 → 1.1.1.1 ── nat POSTROUTING MASQUERADE → src 198.51.100.7
`,
    components: [
      {
        name: 'veth pair',
        role: 'Virtual cable',
        description: {
          vi: 'Gói vào đầu này ra đầu kia, xuyên namespace.',
          en: 'Packets in one end come out the other, across namespaces.'
        }
      },
      {
        name: 'Linux bridge',
        role: 'L2 switch',
        description: {
          vi: 'docker0 hoặc br-<id>, học MAC như switch.',
          en: 'docker0 or br-<id>, learns MACs like a switch.'
        }
      },
      {
        name: 'DNAT / MASQUERADE',
        role: 'NAT',
        description: {
          vi: 'Port publish vào và SNAT ra ngoài.',
          en: 'Port publishing inbound and SNAT outbound.'
        }
      },
      {
        name: '127.0.0.11',
        role: 'Embedded DNS',
        description: {
          vi: 'Phân giải tên container trên user-defined network.',
          en: 'Resolves container names on user-defined networks.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'veth',
      title: { vi: 'Tạo veth và gắn vào bridge', en: 'Create the veth and attach to the bridge' },
      phase: 'Wire',
      description: {
        vi: 'Một đầu veth vào netns container làm eth0, đầu kia gắn vào br-app.',
        en: 'One veth end goes into the container netns as eth0, the other attaches to br-app.'
      },
      systemBehavior: {
        vi: 'Bridge học MAC của container và chuyển frame L2.',
        en: 'The bridge learns the container MAC and switches L2 frames.'
      },
      codeLineMatch: 'ip link add veth-host type veth'
    },
    {
      id: 'dns',
      title: {
        vi: 'DNS nhúng phân giải tên container',
        en: 'Embedded DNS resolves container names'
      },
      phase: 'Discover',
      description: {
        vi: 'api gọi db:5432; 127.0.0.11 trả IP 172.18.0.3.',
        en: 'api calls db:5432; 127.0.0.11 returns 172.18.0.3.'
      },
      systemBehavior: {
        vi: 'Chỉ có trên user-defined network, không có trên docker0 mặc định.',
        en: 'Only on user-defined networks, not on the default docker0.'
      },
      codeLineMatch: 'docker network create app-net'
    },
    {
      id: 'dnat',
      title: { vi: '-p 8080:80 → DNAT', en: '-p 8080:80 → DNAT' },
      phase: 'Inbound',
      description: {
        vi: 'Gói tới host:8080 bị đổi đích thành 172.18.0.2:80 ở PREROUTING.',
        en: 'Packets to host:8080 are rewritten to 172.18.0.2:80 in PREROUTING.'
      },
      systemBehavior: {
        vi: 'conntrack ghi nhớ để đổi ngược gói trả lời.',
        en: 'conntrack remembers the mapping to reverse replies.'
      },
      codeLineMatch: 'DNAT'
    },
    {
      id: 'masquerade',
      title: { vi: 'Ra ngoài qua MASQUERADE', en: 'Outbound via MASQUERADE' },
      phase: 'Outbound',
      description: {
        vi: 'Gói từ 172.18.0.2 tới Internet được SNAT thành IP host.',
        en: 'Packets from 172.18.0.2 to the Internet are SNATed to the host IP.'
      },
      systemBehavior: {
        vi: 'ip_forward=1 và rule POSTROUTING MASQUERADE cho subnet bridge.',
        en: 'ip_forward=1 and a POSTROUTING MASQUERADE rule for the bridge subnet.'
      },
      codeLineMatch: 'MASQUERADE'
    }
  ],

  comparison: {
    title: { vi: 'Các network driver của Docker', en: 'Docker network drivers' },
    subtitle: {
      vi: 'Chọn driver theo nhu cầu cách ly, hiệu năng và số host',
      en: 'Pick a driver by isolation, performance and host count'
    },
    options: [
      {
        name: 'bridge (user-defined)',
        tag: 'Default choice',
        role: { vi: 'Mạng riêng trên một host', en: 'A private network on one host' },
        keyMechanism: {
          vi: 'veth + Linux bridge + NAT; DNS nhúng theo tên container.',
          en: 'veth + Linux bridge + NAT; embedded DNS by container name.'
        },
        configExample: 'docker network create app-net',
        architectureNote: {
          vi: 'Dùng cho hầu hết ứng dụng một host và Compose.',
          en: 'For most single-host apps and Compose.'
        }
      },
      {
        name: 'host',
        tag: 'No isolation',
        role: { vi: 'Dùng chung network stack của host', en: 'Share the host network stack' },
        keyMechanism: {
          vi: 'Không veth, không NAT; port của container chính là port của host.',
          en: 'No veth, no NAT; the container ports are the host ports.'
        },
        configExample: 'docker run --network host …',
        architectureNote: {
          vi: 'Hiệu năng cao nhất, nhưng cổng có thể xung đột và mất cách ly.',
          en: 'Highest performance, but ports can clash and isolation is gone.'
        }
      },
      {
        name: 'none',
        tag: 'Air-gapped',
        role: { vi: 'Chỉ có loopback', en: 'Loopback only' },
        keyMechanism: {
          vi: 'Network namespace chỉ có lo.',
          en: 'The network namespace has only lo.'
        },
        configExample: 'docker run --network none batch-job',
        architectureNote: {
          vi: 'Cho job xử lý dữ liệu không cần mạng.',
          en: 'For data-processing jobs that need no network.'
        }
      },
      {
        name: 'overlay · macvlan · ipvlan',
        tag: 'Multi-host / L2',
        role: { vi: 'Nhiều host hoặc VLAN vật lý', en: 'Many hosts or physical VLANs' },
        keyMechanism: {
          vi: 'overlay nối nhiều daemon (Swarm, VXLAN); macvlan cho container MAC riêng trên mạng vật lý; ipvlan nối VLAN bên ngoài.',
          en: 'overlay links many daemons (Swarm, VXLAN); macvlan gives containers their own MAC on the physical network; ipvlan connects external VLANs.'
        },
        configExample: 'docker network create -d macvlan --subnet=10.0.0.0/24 -o parent=eth0 lan',
        architectureNote: {
          vi: 'Trên Kubernetes, phần này do CNI plugin đảm nhận.',
          en: 'On Kubernetes this is the job of a CNI plugin.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Cách ly mạng từng container, cổng không xung đột.',
        en: 'Per-container network isolation, no port clashes.'
      },
      {
        vi: 'DNS theo tên giúp service discovery đơn giản.',
        en: 'Name-based DNS makes service discovery simple.'
      }
    ],
    cons: [
      {
        vi: 'NAT + conntrack thêm độ trễ và giới hạn số kết nối.',
        en: 'NAT + conntrack add latency and cap connection counts.'
      },
      {
        vi: 'Rule iptables của Docker có thể vượt mặt firewall host.',
        en: 'Docker’s iptables rules can bypass the host firewall.'
      }
    ],
    balance: {
      vi: 'Bridge + NAT cho cách ly và linh hoạt; --network host cho hiệu năng tối đa nhưng mất cách ly cổng.',
      en: 'Bridge + NAT gives isolation and flexibility; --network host gives maximum performance but loses port isolation.'
    },
    invariant: {
      vi: 'Mỗi container có network stack riêng; mọi traffic ra/vào host đi qua NAT được conntrack theo dõi.',
      en: 'Each container has its own network stack; all host-crossing traffic goes through conntrack-tracked NAT.'
    }
  },

  code: [
    {
      label: 'network.sh',
      filename: 'network.sh',
      language: 'bash',
      code: `# --- What Docker does, by hand ---
sudo ip netns add api
sudo ip link add br-app type bridge && sudo ip addr add 172.18.0.1/16 dev br-app && sudo ip link set br-app up
sudo ip link add veth-host type veth peer name veth-api
sudo ip link set veth-api netns api
sudo ip link set veth-host master br-app up
sudo ip netns exec api ip addr add 172.18.0.2/16 dev veth-api
sudo ip netns exec api ip link set veth-api up
sudo ip netns exec api ip route add default via 172.18.0.1

# --- The Docker way: user-defined network with embedded DNS ---
docker network create app-net
docker run -d --name db  --network app-net postgres:16
docker run -d --name api --network app-net -p 127.0.0.1:8080:80 my/api   # bind localhost only!
docker exec api getent hosts db          # 172.18.0.3  db   (via 127.0.0.11)

# --- The NAT rules behind it ---
sudo iptables -t nat -S DOCKER           # -A DOCKER ... --dport 8080 -j DNAT --to-destination 172.18.0.2:80
sudo iptables -t nat -S POSTROUTING      # -A POSTROUTING -s 172.18.0.0/16 ! -o br-... -j MASQUERADE
sudo conntrack -L -p tcp --dport 8080`
    },
    {
      label: 'troubleshoot.sh',
      filename: 'troubleshoot.sh',
      language: 'bash',
      code: `# Which networks, subnets and containers?
docker network ls
docker network inspect app-net --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\\n"}}{{end}}'

# Debug from INSIDE the container's network namespace (tools image, same netns)
docker run --rm -it --network container:api nicolaka/netshoot \
  sh -c 'cat /etc/resolv.conf; dig db; nc -zv db 5432; ss -lntp'

# Isolation: move api to another network and DNS for "db" stops resolving
docker network create other-net
docker network disconnect app-net api && docker network connect other-net api
docker exec api getent hosts db || echo "db not visible from other-net"

# Reach a service running on the host (Linux)
docker run --rm --add-host=host.docker.internal:host-gateway alpine \
  wget -qO- http://host.docker.internal:9000/health`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Hai container trên docker0 mặc định không ping được nhau bằng tên. Vì sao?',
        en: 'Two containers on the default docker0 can’t reach each other by name. Why?'
      },
      answer: {
        vi: 'Default bridge không có DNS nhúng; chỉ user-defined network mới có resolver 127.0.0.11. Tạo network riêng (docker network create) hoặc dùng Compose.',
        en: 'The default bridge has no embedded DNS; only user-defined networks get the 127.0.0.11 resolver. Create a network (docker network create) or use Compose.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Server có ufw chặn mọi cổng trừ 22 nhưng Redis -p 6379:6379 vẫn bị truy cập từ Internet. Giải thích.',
        en: 'A server’s ufw blocks everything except 22, yet Redis with -p 6379:6379 is reachable from the Internet. Explain.'
      },
      answer: {
        vi: 'Docker chèn DNAT ở nat PREROUTING và rule FORWARD (chain DOCKER/DOCKER-USER) — gói được chuyển hướng trước khi tới chain INPUT mà ufw quản lý. Sửa: bind 127.0.0.1:6379:6379 hoặc không publish, thêm rule vào DOCKER-USER, hoặc dùng firewall ở tầng cloud.',
        en: 'Docker inserts DNAT in nat PREROUTING and FORWARD rules (DOCKER/DOCKER-USER chains) — packets are redirected before reaching the INPUT chain ufw manages. Fix: bind 127.0.0.1:6379:6379 or don’t publish, add rules to DOCKER-USER, or use a cloud-level firewall.'
      },
      trapWarning: {
        vi: '"Docker đã tự cấu hình firewall nên an toàn" — ngược lại hoàn toàn.',
        en: '“Docker configures the firewall so it’s safe” — the exact opposite.'
      }
    }
  ],

  researchCitations: [
    DOCKER_CITATIONS.networking,
    DOCKER_CITATIONS.bridgeDriver,
    DOCKER_CITATIONS.portPublishing,
    DOCKER_CITATIONS.namespaces
  ]
};
