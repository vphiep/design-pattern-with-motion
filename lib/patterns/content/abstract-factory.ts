import type { Pattern } from '../types';

export const abstractFactory: Pattern = {
  id: 'abstract-factory',
  category: 'creational',
  name: 'Abstract Factory',
  tagline: {
    en: 'Group related factories together so you can build a whole family of objects without mixing and matching.',
    vi: 'Gom các factory liên quan lại với nhau để bạn dựng cả một họ object mà không bị trộn lẫn.'
  },
  analogy: {
    en: 'A furniture shop sells “kits” — a Victorian kit comes with a velvet sofa, a carved table, and brass lamps, all in the same style. A Modern kit comes with a different sofa, table, and lamps. The shop gives you a whole coherent set, not loose parts you have to mix yourself.',
    vi: 'Cửa hàng nội thất bán theo “bộ kit” — kit Victorian gồm ghế sofa nhung, bàn chạm khắc và đèn đồng, cùng một phong cách. Kit Modern thì sofa, bàn, đèn khác hẳn. Cửa hàng đưa bạn cả bộ khớp nhau, không phải linh kiện rời để tự phối.'
  },
  whenToUse: [
    {
      en: 'Your code needs to create families of related objects that are designed to work together.',
      vi: 'Code của bạn cần tạo cả họ object liên quan, vốn được thiết kế để đi cùng nhau.'
    },
    {
      en: 'You want to enforce that a sofa can never pair with a “wrong-style” table.',
      vi: 'Bạn muốn đảm bảo một ghế sofa không bao giờ bị ghép với một cái bàn “sai phong cách”.'
    },
    {
      en: 'You want to swap the entire family at once (light theme vs. dark theme, Windows vs. Mac UI).',
      vi: 'Bạn muốn đổi cả họ object cùng lúc (theme sáng / tối, UI Windows / Mac).'
    }
  ],
  whenNotToUse: [
    {
      en: 'You only create one kind of product — a plain factory is enough.',
      vi: 'Bạn chỉ tạo một loại product — một factory thường là đủ.'
    },
    {
      en: 'The families are likely to change often in incompatible ways, since adding a new product type means changing every factory.',
      vi: 'Các họ product hay thay đổi theo hướng không tương thích — thêm một kiểu product mới nghĩa là phải sửa mọi factory.'
    }
  ],
  difficulty: 2,
  order: 3,
  javaCode: `// Two product families: a Light theme and a Dark theme.
// Each family has a Button and a Checkbox.
interface Button { void render(); }
interface Checkbox { void render(); }

final class LightButton implements Button { public void render() { System.out.println("[ light button ]"); } }
final class LightCheckbox implements Checkbox { public void render() { System.out.println("[ light checkbox ]"); } }
final class DarkButton implements Button { public void render() { System.out.println("[ dark  button ]"); } }
final class DarkCheckbox implements Checkbox { public void render() { System.out.println("[ dark  checkbox ]"); } }

// The abstract factory: it knows how to build every product in a family.
interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

// Concrete factories bundle a coherent set.
final class LightUIFactory implements UIFactory {
    public Button createButton()   { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}
final class DarkUIFactory implements UIFactory {
    public Button createButton()   { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}

// Client code only talks to the factory interface — it never names a
// concrete product. That means the whole family can be swapped at once.
final class Form {
    private final Button button;
    private final Checkbox checkbox;
    Form(UIFactory factory) {
        this.button = factory.createButton();
        this.checkbox = factory.createCheckbox();
    }
    void paint() { button.render(); checkbox.render(); }
}`,
  steps: [
    {
      title: {
        en: 'One factory interface names the whole family',
        vi: 'Một interface factory đặt tên cả họ product'
      },
      body: {
        en: 'UIFactory is the abstract factory: it lists every product the family must provide — createButton() and createCheckbox(). Nothing here is a concrete widget. Client code such as Form will depend on this interface alone, so a Light kit and a Dark kit are interchangeable as far as Form is concerned.',
        vi: 'UIFactory là abstract factory: nó liệt kê mọi product mà một họ phải có — createButton() và createCheckbox(). Ở đây chưa có widget concrete nào. Code client như Form sẽ chỉ phụ thuộc interface này, nên bộ kit Light và kit Dark hoán đổi được với nhau đối với Form.'
      }
    },
    {
      title: {
        en: 'A concrete factory builds one coherent kit',
        vi: 'Một factory concrete dựng một bộ kit khớp nhau'
      },
      body: {
        en: 'LightUIFactory implements UIFactory and its createButton() returns a LightButton. DarkUIFactory does the same for the dark family. Each factory is a sealed kit: you cannot accidentally ask a Light factory for a Dark checkbox, because that method simply does not exist on this object.',
        vi: 'LightUIFactory implement UIFactory và createButton() của nó trả về LightButton. DarkUIFactory làm tương tự cho họ dark. Mỗi factory là một bộ kit khép kín: bạn không thể vô tình hỏi factory Light lấy checkbox Dark, vì method đó không tồn tại trên object này.'
      }
    },
    {
      title: {
        en: 'Matching parts come from the same factory',
        vi: 'Các mảnh khớp nhau đến từ cùng một factory'
      },
      body: {
        en: 'createCheckbox() is the second product in the family. Form’s constructor calls both factory methods on the same UIFactory instance, so the Button and Checkbox always share a theme. Swap the factory you pass into new Form(...) and the entire family switches together — no mixed kit.',
        vi: 'createCheckbox() là product thứ hai trong họ. Constructor của Form gọi cả hai factory method trên cùng một instance UIFactory, nên Button và Checkbox luôn chung theme. Đổi factory bạn truyền vào new Form(...) thì cả họ đổi cùng lúc — không có bộ kit lai.'
      }
    }
  ],
  realSystems: [
    {
      system: 'javax.xml.parsers.DocumentBuilderFactory',
      note: {
        en: 'DocumentBuilderFactory.newInstance() returns a vendor-specific factory; that factory then creates DocumentBuilder instances that belong to the same parser family. Application code never names Xerces or the JDK’s built-in parser.',
        vi: 'DocumentBuilderFactory.newInstance() trả về factory theo nhà cung cấp; factory đó rồi tạo các DocumentBuilder thuộc cùng một họ parser. Code ứng dụng không bao giờ gọi tên Xerces hay parser có sẵn trong JDK.'
      }
    },
    {
      system: 'java.sql.Connection',
      note: {
        en: 'A JDBC Connection is an abstract factory for Statement, PreparedStatement, and CallableStatement. The driver you connected with decides the concrete family; your SQL code stays on the interfaces.',
        vi: 'JDBC Connection là một abstract factory cho Statement, PreparedStatement và CallableStatement. Driver bạn đã kết nối quyết định họ concrete; code SQL của bạn vẫn chỉ đứng trên các interface.'
      }
    },
    {
      system: 'java.awt.Toolkit.getDefaultToolkit()',
      note: {
        en: 'AWT’s Toolkit is the platform factory: it produces the peer widgets (buttons, windows, images) that match the host OS. Swap the toolkit and the whole widget family changes together.',
        vi: 'Toolkit của AWT là factory theo nền tảng: nó tạo các widget peer (nút, cửa sổ, ảnh) khớp với hệ điều hành host. Đổi toolkit thì cả họ widget đổi cùng nhau.'
      }
    }
  ],

  deepTheory: {
    academicRoot: {
      en: 'Formalized in Gang of Four (1994). Provides an interface for creating families of related or dependent objects without specifying their concrete classes. It prevents clients from accidentally mixing incompatible cross-vendor components.',
      vi: 'Được chính thức hóa trong Gang of Four (1994). Cung cấp một interface để tạo ra các họ đối tượng có liên quan hoặc phụ thuộc lẫn nhau mà không chỉ định lớp cụ thể. Nó ngăn chặn tuyệt đối việc người dùng vô tình kết hợp lẫn lộn các thành phần không tương thích giữa các nhà cung cấp.'
    },
    structuralCouplingMetric: {
      en: 'Encapsulates entire product suites behind a factory contract. Clients have zero afferent coupling to concrete vendor SDK classes.',
      vi: 'Đóng gói toàn bộ bộ sản phẩm đằng sau một khế ước nhà máy trừu tượng. Phía client hoàn toàn không bị phụ thuộc vào các lớp SDK cụ thể của từng hãng.'
    },
    memoryAndVtableTradeoff: {
      en: 'Abstract factory instances are typically stateless singletons. HotSpot JIT C2 optimizes method dispatches when factory types are bound at application startup.',
      vi: 'Các đối tượng Abstract Factory thường là các Singleton không trạng thái. Trình biên dịch C2 JIT tối ưu hóa việc phân giải phương thức khi loại nhà máy được cố định lúc khởi động ứng dụng.'
    },
    enterpriseBestPractices: [
      {
        en: 'Enforce Family Cohesion: Never add unrelated product types to an abstract factory; all created products must belong to the same logical ecosystem.',
        vi: 'Bảo đảm tính gắn kết của họ sản phẩm: Không bao giờ nhét các sản phẩm không liên quan vào cùng một abstract factory; mọi sản phẩm được tạo ra phải cùng thuộc một hệ sinh thái logic.'
      },
      {
        en: 'Integrate with Spring Profiles: Bind the concrete factory family (AWS vs Azure vs Local) via Spring @Profile or conditional bean configuration.',
        vi: 'Tích hợp với Spring Profiles: Khóa chặt họ nhà máy cụ thể (AWS vs Azure vs Local) thông qua Spring @Profile hoặc cấu hình bean có điều kiện.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Multi-Cloud Infrastructure Provisioning Incompatible Cross-Cloud Resource Pollution',
      vi: 'Sự Cố Ô Nhiễm Tài Nguyên Đa Đám Mây Do Lẫn Lộn AWS Với Azure Trong Hệ Thống Khởi Tạo'
    },
    businessContext: {
      en: 'An enterprise multi-cloud orchestration platform automatically provisions storage buckets, event queues, and KMS encryption keys across AWS, Azure, and Google Cloud Platform (GCP).',
      vi: 'Nền tảng tự động hóa hạ tầng đa đám mây khởi tạo kho lưu trữ Object Storage, hàng đợi Message Queue và khóa mã hóa KMS trên các đám mây AWS, Azure và GCP.'
    },
    problemDescription: {
      en: 'Developers utilized independent ad-hoc factories: StorageFactory, QueueFactory, and EncryptionFactory. In a complex automated tenant rollout, a developer accidentally configured an AwsS3Storage bucket alongside an AzureServiceBus queue and a GcpKmsKey client. Cross-cloud IAM federation failed cryptographically during data transmission. 18 enterprise client deployments crashed midway, leaving 45 orphaned cloud infrastructure instances racking up $72,000 in un-tracked monthly cloud bills before discovery.',
      vi: 'Các kỹ sư sử dụng các factory rời rạc: StorageFactory, QueueFactory và EncryptionFactory. Trong một đợt triển khai khách hàng doanh nghiệp tự động, hệ thống vô tình ghép nhầm một bucket AwsS3Storage đi kèm với hàng đợi AzureServiceBus và khóa mã hóa GcpKmsKey. Việc xác thực chéo giữa các đám mây bị lỗi mã hóa ngay lúc chạy thật. 18 cụm triển khai của khách hàng bị sập giữa chừng, bỏ lại 45 tài nguyên đám mây vô chủ chạy ngầm tiêu tốn 72,000 USD tiền thuê cloud mỗi tháng trước khi bị phát hiện.'
    },
    whyNaiveFails: {
      en: 'Ad-hoc factory methods allow arbitrary mixing of incompatible cloud primitives because there is no compile-time or architectural constraint binding cloud families together.',
      vi: 'Các hàm factory rời rạc cho phép kết hợp tùy tiện các thành phần không tương thích vì không có bất kỳ ràng buộc kiến trúc nào ép buộc các tài nguyên phải thuộc về cùng một họ nhà cung cấp.'
    },
    coreSolution: {
      en: 'Implement the Abstract Factory pattern: define CloudInfrastructureFactory with concrete family implementations (AwsInfrastructureFactory, AzureInfrastructureFactory). A client binds to a SINGLE factory family, making accidental cross-cloud resource mixing mathematically impossible at compile time.',
      vi: 'Áp dụng mẫu Abstract Factory: định nghĩa CloudInfrastructureFactory với các họ triển khai cụ thể (AwsInfrastructureFactory, AzureInfrastructureFactory). Một cụm triển khai chỉ được phép gắn với DUY NHẤT một họ nhà máy, loại trừ hoàn toàn nguy cơ lẫn lộn tài nguyên giữa các nhà cung cấp đám mây.'
    },
    productionCode: `// Production Multi-Cloud Abstract Factory Architecture (Java 21)
package com.cloud.orchestrator.factory;

public interface CloudStorage { void store(String key, byte[] data); }
public interface CloudQueue { void publish(String message); }
public interface CloudKms { byte[] encrypt(byte[] data); }

// Abstract Factory enforcing Family Cohesion
public interface CloudInfrastructureFactory {
    CloudStorage createStorage();
    CloudQueue createQueue();
    CloudKms createKms();
}

// AWS Family Implementation
public class AwsInfrastructureFactory implements CloudInfrastructureFactory {
    @Override public CloudStorage createStorage() { return (k, d) -> System.out.println("S3 Put: " + k); }
    @Override public CloudQueue createQueue() { return m -> System.out.println("SQS Send: " + m); }
    @Override public CloudKms createKms() { return d -> d; }
}

// Azure Family Implementation
public class AzureInfrastructureFactory implements CloudInfrastructureFactory {
    @Override public CloudStorage createStorage() { return (k, d) -> System.out.println("Blob Store: " + k); }
    @Override public CloudQueue createQueue() { return m -> System.out.println("ServiceBus Send: " + m); }
    @Override public CloudKms createKms() { return d -> d; }
}`,
    architectureImpact: {
      en: '100% elimination of cross-cloud incompatible resource pairing defects; Orphaned cloud infrastructure costs dropped to $0; New cloud provider onboarding is fully encapsulated within a single factory class.',
      vi: 'Triệt tiêu 100% lỗi kết hợp lẫn lộn tài nguyên giữa các đám mây; Chi phí tài nguyên vô chủ giảm về 0 USD; Việc hỗ trợ thêm nhà cung cấp đám mây mới được đóng gói hoàn toàn trong một lớp nhà máy duy nhất.'
    }
  }
};
