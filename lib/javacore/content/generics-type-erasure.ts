import type { JavaCoreTopic } from '../types';

export const genericsTypeErasure: JavaCoreTopic = {
  id: 'generics-type-erasure',
  category: 'advanced-features',
  name: 'Generics Type Erasure & Synthetic Bridge Methods',
  tagline: {
    en: 'Type system physics: Compile-time type erasure, upper bound replacements, synthetic ACC_BRIDGE polymorphic overrides, and heap pollution.',
    vi: 'Bản chất hệ thống kiểu: Xóa kiểu lúc biên dịch (Type Erasure), thay thế cận trên, sinh hàm cầu nối ACC_BRIDGE và ô nhiễm Heap.'
  },
  difficulty: 2,
  level: 'advanced',
  order: 21,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      en: 'When Java 5 introduced Generics in 2004, billions of lines of legacy Java 1.4 code were running in production. If the JVM had introduced reified generics (creating new runtime types like List$String), all existing libraries would have broken instantly, destroying backward binary compatibility across the Java ecosystem.',
      vi: 'Khi Java 5 ra mắt Generics vào năm 2004, hàng tỷ dòng code Java 1.4 cũ đang chạy trên các hệ thống sản xuất. Nếu JVM đưa vào cơ chế reified generics (tạo kiểu dữ liệu runtime mới như List$String), toàn bộ các thư viện hiện có sẽ bị phá vỡ hoàn toàn, hủy hoại tính tương thích nhị phân của toàn bộ hệ sinh thái Java.'
    },
    hardwareConstraint: {
      en: 'Creating distinct runtime class metadata in Metaspace for every generic instantiation (e.g. List<Integer>, List<String>, List<Order>) would cause massive class metadata code bloat, exhausting CPU instruction caches and multiplying Metaspace memory footprints (known as C++ template code bloat).',
      vi: 'Tạo riêng metadata class trong Metaspace cho mỗi kiểu generic (như List<Integer>, List<String>, List<Order>) sẽ gây ra hiện tượng phình to mã nhị phân (Code Bloat giống C++ Template), làm cạn kiệt CPU instruction cache và nhân đôi dung lượng RAM Metaspace.'
    },
    fundamentalSolution: {
      en: 'Java chose Type Erasure: Generics exist purely at compile-time for type safety verification. The compiler erases type parameters to their upper bounds (or java.lang.Object if unbounded), inserting synthetic checkcast bytecodes at call sites. To preserve polymorphism, the compiler automatically generates synthetic Bridge Methods (ACC_BRIDGE) in bytecode.',
      vi: 'Java chọn giải pháp Xóa Kiểu (Type Erasure): Generics chỉ tồn tại ở thời điểm biên dịch để kiểm tra an toàn kiểu. Compiler xóa sạch các tham số kiểu về cận trên (hoặc Object nếu không giới hạn), và chèn lệnh kiểm tra checkcast ở nơi gọi. Để bảo toàn tính đa hình khi override hàm, compiler tự động sinh các Hàm Cầu Nối (Synthetic Bridge Methods có cờ ACC_BRIDGE) trong bytecode.'
    },
    math: {
      formula: 'Class_Runtime_Identity: List<String>.class == List<Integer>.class == List.class',
      description: {
        en: 'At runtime, generic type arguments do not exist; both parameterized types share the identical raw Class instance in Metaspace.',
        vi: 'Lúc runtime, các tham số kiểu không hề tồn tại; cả hai kiểu tham số hóa đều dùng chung một đối tượng Class thô duy nhất trong Metaspace.'
      },
      timeComplexity: 'O(1) compile-time erasure; O(1) runtime hardware checkcast instruction',
      spaceComplexity: 'Zero Metaspace overhead for new generic parameterizations',
      memoryOverheadFormula: 'Runtime Type Overhead = 0 Bytes (Single Shared Raw Class in Metaspace)'
    }
  },

  detailedTheory: {
    overview: {
      en: 'Type Erasure is the defining design compromise of the Java type system. While it ensures absolute backward compatibility with legacy bytecode, it imposes fundamental architectural constraints: lack of type reification, inability to instantiate generic arrays or types directly, and the necessity of synthetic bridge methods to maintain polymorphic dispatch.',
      vi: 'Xóa Kiểu (Type Erasure) là sự thỏa hiệp thiết kế mang tính lịch sử của hệ thống kiểu Java. Dù bảo đảm tính tương thích ngược hoàn hảo với mã bytecode cũ, nó đặt ra những giới hạn kiến trúc sâu sắc: không thể reify kiểu dữ liệu lúc runtime, không thể new mảng generic, và bắt buộc phải sinh các hàm cầu nối (Bridge Method) để duy trì tính đa hình.'
    },
    deepDiveParagraphs: [
      {
        en: '1. How Type Erasure Works in the Compiler: When javac compiles a generic class, it performs three transformations: 1) Replaces all type parameters with their first bound (e.g. <T> becomes Object; <T extends Comparable<T>> becomes Comparable); 2) Inserts explicit checkcast instructions when values are retrieved from generic containers; 3) Generates synthetic bridge methods to preserve method overriding polymorphism in subclasses.',
        vi: '1. Cách Compiler Thực Hiện Xóa Kiểu: Khi javac biên dịch một lớp generic, nó thực thi 3 biến đổi: 1) Thay thế mọi tham số kiểu bằng cận trên đầu tiên (như <T> thành Object; <T extends Comparable<T>> thành Comparable); 2) Tự động chèn lệnh bytecode checkcast khi lấy dữ liệu ra khỏi container generic; 3) Tự sinh các hàm cầu nối (Bridge Method) để bảo toàn tính đa hình ghi đè hàm trong các lớp con.'
      },
      {
        en: '2. The Mystery of Synthetic Bridge Methods: Consider class Node<T> { void set(T t) {} }. It erases to set(Object). If class StringNode extends Node<String> overrides void set(String t) {}, the JVM’s method signature rules dictate that set(String) does NOT override set(Object)! Polymorphism would break! To solve this, javac silently synthesizes a Bridge Method: void set(Object o) { set((String) o); } tagged with flags ACC_BRIDGE and ACC_SYNTHETIC.',
        vi: '2. Bí Mật Của Hàm Cầu Nối Synthetic Bridge Methods: Xét class Node<T> { void set(T t) {} }. Nó bị xóa thành set(Object). Nếu lớp con StringNode extends Node<String> ghi đè void set(String t) {}, theo quy tắc JVM thì set(String) KHÔNG HỀ ghi đè set(Object)! Tính đa hình sẽ bị gãy! Để giải quyết, javac âm thầm tự sinh một hàm cầu nối: void set(Object o) { set((String) o); } được gắn cờ ACC_BRIDGE và ACC_SYNTHETIC.'
      },
      {
        en: '3. Reification Limitations: Why You Cannot "new T()": Because T is erased to Object at runtime, the expression new T() would require the JVM to know what constructor to call, which is impossible. Similarly, new T[10] is forbidden because Java arrays are reified and store component type metadata at runtime to throw ArrayStoreException. Creating a generic array would violate the type safety of the runtime array store check.',
        vi: '3. Giới Hạn Reification: Vì Sao Không Thể "new T()": Vì T bị xóa thành Object lúc runtime, lệnh new T() sẽ đòi hỏi JVM phải biết constructor nào để gọi, điều hoàn toàn bất khả thi. Tương tự, new T[10] bị cấm tuyệt đối vì mảng trong Java là reified và luôn kiểm tra kiểu phần tử lúc runtime để ném ArrayStoreException. Cho phép tạo mảng generic sẽ phá vỡ tính an toàn kiểu của mảng.'
      },
      {
        en: '4. Heap Pollution & Varargs Warnings: Heap Pollution occurs when a variable of a parameterized type refers to an object that is not of that parameterized type (e.g. casting a raw List to List<String>). When combined with variable arguments (varargs), arrays of generic types are created under the hood, triggering compiler warnings. Java 7 introduced @SafeVarargs to assert that method implementations do not corrupt heap arrays.',
        vi: '4. Ô Nhiễm Vùng Nhớ Heap (Heap Pollution) & Cảnh Báo Varargs: Heap Pollution xảy ra khi một biến kiểu tham số hóa trỏ tới một đối tượng không đúng kiểu của nó (như ép kiểu một List thô sang List<String>). Khi kết hợp với đối số biến thiên (varargs), mảng generic được tạo ngầm bên dưới gây nguy cơ lỗi runtime. Java 7 giới thiệu chú thích @SafeVarargs để khẳng định phương thức không làm ô nhiễm mảng trên Heap.'
      },
      {
        en: '5. Super Type Tokens & Type Erasure Workarounds: Although type parameters are erased from instances, the JVM preserves generic signatures in class metadata inside Metaspace! By using an anonymous subclass (e.g. new TypeReference<List<String>>() {}), the generic parameter is preserved in the subclass’s GenericSignature attribute, allowing Jackson and Spring to recover generic types via reflection.',
        vi: '5. Kỹ Thuật Super Type Token Vượt Qua Type Erasure: Dù tham số kiểu bị xóa khỏi instance đối tượng, JVM vẫn lưu lại chữ ký generic trong metadata của lớp trong Metaspace! Bằng cách sử dụng lớp con vô danh (như new TypeReference<List<String>>() {}), tham số kiểu được bảo toàn trong trường GenericSignature, cho phép Jackson và Spring đọc lại được kiểu generic qua reflection.'
      },
      {
        en: '6. The Future: Project Valhalla & Specialization: Project Valhalla is currently re-engineering the Java runtime to introduce Value Types and Generic Specialization. Unlike today’s erasure where everything is boxed to Object, Valhalla will allow specialized reified generics for primitive value types (e.g. List<int> stored flat in memory with zero boxing overhead and zero pointer chasing).',
        vi: '6. Tương Lai: Project Valhalla & Chuyên Biệt Hóa Kiểu (Specialization): Project Valhalla đang tái thiết kế máy ảo Java để đưa vào Value Types và Generic Specialization. Khác với cơ chế xóa kiểu ngày nay nơi mọi thứ đều bị bọc thành Object, Valhalla sẽ cho phép chuyên biệt hóa generic cho kiểu nguyên thủy (như List<int> lưu phẳng trong RAM mà không tốn chi phí boxing hay trỏ con trỏ).'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Silent ClassCastException from Heap Pollution: Passing raw types into generic methods can cause a ClassCastException to be thrown far away from the buggy line! A method accepting List<String> might assume every element is a String, but when iterating, the compiler-generated checkcast throws ClassCastException because a raw type inserted an Integer earlier.',
        vi: 'Lỗi ClassCastException Âm Thầm Do Ô Nhiễm Heap: Truyền raw type vào các hàm generic có thể khiến lỗi ClassCastException ném ra ở một vị trí rất xa dòng code gây lỗi! Một hàm nhận List<String> mặc định mọi phần tử là String, nhưng khi for-each, lệnh checkcast do compiler sinh ra sẽ ném ClassCastException vì trước đó có một raw type đã nhét nhầm Integer vào.',
      },
      {
        en: 'Overloading Methods with Same Erasure: Attempting to declare void process(List<String> list) and void process(List<Integer> list) in the same class fails compilation with error: "name clash: both methods have the same erasure". At the bytecode level, both signatures erase to process(List), creating an illegal duplicate method signature in the class file.',
        vi: 'Nạp Chồng Hàm (Overloading) Bị Trùng Chữ Ký Xóa: Khai báo void process(List<String> list) và void process(List<Integer> list) trong cùng một class sẽ bị compiler báo lỗi: "name clash: both methods have the same erasure". Ở tầng bytecode, cả hai hàm đều bị xóa thành process(List), tạo thành hai hàm trùng lặp chữ ký bị cấm trong class file.',
      },
      {
        en: 'Inability to Catch Generic Exception Types: Writing catch (MyException<T> e) is forbidden because the JVM exception handling table (Exception Table) resolves exceptions at runtime using exact class types. Because type arguments do not exist at runtime, the catch block cannot differentiate between MyException<String> and MyException<Integer>.',
        vi: 'Không Thể Bắt Lỗi Exception Có Tham Số Generic: Viết lệnh catch (MyException<T> e) bị cấm hoàn toàn vì Bảng Ngoại Lệ (Exception Table) của JVM bắt lỗi lúc runtime bằng kiểu class thực tế. Do tham số kiểu không tồn tại lúc runtime, khối catch không thể phân biệt được đâu là MyException<String> và MyException<Integer>.',
      }
    ]
  },

  memoryLayout: {
    title: {
      en: 'Generic Source Code vs Erased Bytecode & Synthetic Bridge Method Layout',
      vi: 'Mã Nguồn Generic vs Bytecode Sau Xóa Kiểu & Cấu Trúc Hàm Cầu Nối'
    },
    description: {
      en: 'Demonstrates how the compiler erases generic type parameters to Object, inserts explicit checkcast instructions, and synthesizes ACC_BRIDGE methods to maintain polymorphic vtable dispatch.',
      vi: 'Minh họa cách compiler xóa tham số kiểu về Object, chèn lệnh checkcast và tự động sinh hàm cầu nối ACC_BRIDGE để bảo toàn bảng điều phối vtable.'
    },
    asciiDiagram: `+----------------------------------------------------------------------------------------------------+
| TYPE ERASURE & SYNTHETIC BRIDGE METHOD COMPILATION TRANSFORMATION                                  |
+----------------------------------------------------------------------------------------------------+
| 1. GENERIC SOURCE CODE:                                                                            |
|   public class Node<T> { public void set(T val) { ... } }                                          |
|   public class StringNode extends Node<String> {                                                   |
|       @Override public void set(String val) { System.out.println(val); }                           |
|   }                                                                                                |
+----------------------------------------------------------------------------------------------------+
| 2. ERASED BYTECODE IN METASPACE:                                                                   |
|   class Node:       Method set:(Ljava/lang/Object;)V  (T erased to Object)                         |
|   class StringNode: Method set:(Ljava/lang/String;)V  (User implemented method)                    |
|                                                                                                    |
|   // SYNTHETIC BRIDGE METHOD GENERATED BY JAVAC (ACC_BRIDGE, ACC_SYNTHETIC):                       |
|   public void set(java.lang.Object o) {                                                            |
|       this.set((java.lang.String) o); // Downcast & delegate to user method                        |
|   }                                                                                                |
+----------------------------------------------------------------------------------------------------+
| 3. CALL SITE CHECKCAST BYTECODE:                                                                   |
|   String s = (String) list.get(0);                                                                 |
|   Bytecode: 0: invokevirtual List.get:(I)Ljava/lang/Object;                                        |
|             3: checkcast     #String (Runtime ClassCastException if type invalid)                  |
|             6: astore_1                                                                            |
+----------------------------------------------------------------------------------------------------+`,
    byteFields: [
      { name: 'acc_bridge_flag', size: '2 Bytes (0x0040)', description: { en: 'Method access flag indicating method was synthesized by compiler to preserve polymorphic overriding.', vi: 'Cờ thuộc tính phương thức báo hiệu hàm do compiler tự sinh để bảo toàn tính đa hình.' } },
      { name: 'acc_synthetic_flag', size: '2 Bytes (0x1000)', description: { en: 'Method flag indicating method does not appear in original source code and was generated by javac.', vi: 'Cờ báo hiệu phương thức không xuất hiện trong code gốc mà do compiler tự sinh.' } },
      { name: 'checkcast_opcode', size: '3 Bytes (Opcode 192)', description: { en: 'Bytecode instruction verifying that object reference on operand stack matches target type.', vi: 'Lệnh bytecode kiểm tra con trỏ trên stack có đúng kiểu mục tiêu không trước khi gán.' } }
    ]
  },

  steps: [
    {
      id: 'compile-erasure',
      title: { en: '1. Type Parameter Erasure to Upper Bound', vi: '1. Xóa Tham Số Kiểu Về Cận Trên Lúc Biên Dịch' },
      phase: 'TYPE_ERASURE',
      description: {
        en: 'The Java compiler strips all generic type parameters: <T> becomes java.lang.Object; <T extends Comparable<T>> becomes Comparable. In the generated .class file, method signatures operate purely on raw erased types.',
        vi: 'Trình biên dịch Java xóa sạch mọi tham số kiểu generic: <T> biến thành java.lang.Object; <T extends Comparable<T>> biến thành Comparable. Trong file .class, mọi chữ ký hàm chỉ làm việc với kiểu thô đã bị xóa.'
      },
      jvmRuntimeBehavior: {
        en: 'Zero Metaspace code bloat. Single shared Class metadata representation in RAM.',
        vi: 'Không bị phình to Metaspace. Dùng chung một Class metadata duy nhất trong RAM.'
      },
      javaCodeLineMatch: 'public class Node<T> { private T data; }'
    },
    {
      id: 'bridge-synthesis',
      title: { en: '2. Compiler Synthesizes ACC_BRIDGE Method', vi: '2. Compiler Tự Sinh Hàm Cầu Nối ACC_BRIDGE' },
      phase: 'BRIDGE_SYNTHESIS',
      description: {
        en: 'To ensure polymorphism works when a subclass specializes a generic method, javac generates a synthetic bridge method: set(Object) which downcasts the argument and delegates to the specialized set(String) method.',
        vi: 'Để bảo đảm tính đa hình vtable hoạt động khi lớp con chuyên biệt hóa kiểu, javac tự sinh một hàm cầu nối: set(Object) làm nhiệm vụ ép kiểu và gọi chuyển tiếp tới hàm set(String).'
      },
      jvmRuntimeBehavior: {
        en: 'Inserts bridge method entry into vtable. Guarantees polymorphic virtual dispatch.',
        vi: 'Chèn hàm cầu nối vào bảng vtable. Bảo đảm gọi hàm đa hình chính xác.'
      },
      javaCodeLineMatch: '// Synthetic method: void set(Object o) { set((String) o); }'
    },
    {
      id: 'runtime-checkcast',
      title: { en: '3. Call Site checkcast Runtime Type Verification', vi: '3. Kiểm Tra Kiểu Lúc Runtime Bằng Lệnh checkcast' },
      phase: 'CHECKCAST_VERIFICATION',
      description: {
        en: 'When reading from a generic container, the compiler emits a checkcast bytecode instruction. The JVM verifies the object header Klass pointer against the target class, throwing ClassCastException immediately if heap pollution occurred.',
        vi: 'Khi đọc dữ liệu từ một container generic, compiler chèn lệnh bytecode checkcast. JVM kiểm tra con trỏ Klass của đối tượng với class mục tiêu, ném ngay ClassCastException nếu có hiện tượng ô nhiễm Heap.'
      },
      jvmRuntimeBehavior: {
        en: 'Direct Klass pointer equality check in CPU cache. Throws ClassCastException if invalid.',
        vi: 'Kiểm tra con trỏ Klass trực tiếp trong CPU cache. Ném ClassCastException nếu sai kiểu.'
      },
      javaCodeLineMatch: 'String text = stringList.get(0); // 3: checkcast java/lang/String'
    }
  ],

  productionJvmEngines: [
    {
      jvmEngine: 'OpenJDK / Oracle HotSpot',
      implementationName: 'Java 5+ Erased Generics Architecture',
      keyMechanism: {
        en: 'Maintains 100% backward binary compatibility with Java 1.4 bytecode. Preserves generic signatures in class file attributes for runtime reflection.',
        vi: 'Bảo toàn tương thích nhị phân 100% với bytecode Java 1.4. Lưu lại chữ ký generic trong thuộc tính file class để phục vụ reflection.'
      },
      defaultFlags: 'Standard JVM Specification',
      architectureNote: {
        en: 'Class.getGenericSuperclass() reads the Signature attribute to recover generic type information at runtime.',
        vi: 'Hàm Class.getGenericSuperclass() đọc trường Signature để lấy lại thông tin kiểu generic lúc runtime.'
      }
    },
    {
      jvmEngine: 'Microsoft .NET CLR (Comparison Engine)',
      implementationName: 'Reified Generics Architecture',
      keyMechanism: {
        en: 'In contrast to Java, C#/.NET preserves generics at runtime. List<int> and List<string> are separate compiled classes with specialized memory layouts for value types.',
        vi: 'Trái ngược với Java, C#/.NET bảo toàn generic lúc runtime. List<int> và List<string> là hai class riêng biệt với bộ nhớ được tối ưu cho value types.'
      },
      defaultFlags: 'CLR Common Intermediate Language (CIL)',
      architectureNote: {
        en: 'Eliminates boxing overhead for primitive types but increases JIT compilation time and code cache size.',
        vi: 'Loại bỏ chi phí boxing cho kiểu nguyên thủy nhưng làm tăng thời gian biên dịch JIT và kích thước code cache.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Absolute 100% binary backward compatibility with millions of legacy Java libraries.', vi: 'Tương thích ngược nhị phân 100% tuyệt đối với hàng triệu thư viện Java từ các phiên bản cũ.' },
      { en: 'Zero code bloat in Metaspace: List<T> generates a single shared compiled class.', vi: 'Không bị phình to mã nhị phân trong Metaspace: List<T> chỉ tạo duy nhất 1 class dùng chung.' }
    ],
    cons: [
      { en: 'No runtime reification: cannot execute new T(), new T[], or instanceof List<String>.', vi: 'Không có tính reification: không thể gọi new T(), new T[] hay instanceof List<String>.' },
      { en: 'Primitive boxing overhead: List<Integer> requires boxing int to 16-byte Integer objects on the Heap.', vi: 'Chi phí boxing kiểu nguyên thủy: List<Integer> buộc phải bọc int thành Integer tốn 16 byte trên Heap.' }
    ],
    memoryFootprint: {
      en: 'Zero additional Metaspace footprint; primitive collections suffer ~4x memory inflation from boxing.',
      vi: 'Không tốn thêm RAM Metaspace; nhưng collection kiểu nguyên thủy bị phình to ~4 lần do boxing.'
    },
    jvmSpecificationGuarantee: {
      en: 'Compile-time type safety guarantees that programs without unchecked warnings never fail with ClassCastException.',
      vi: 'An toàn kiểu lúc compile bảo đảm chương trình không có cảnh báo unchecked sẽ không bao giờ bị ClassCastException.'
    }
  },

  javaCode: `package com.enterprise.jvm.generics;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure Java 21 Educational Masterclass: Type Erasure & Synthetic Bridge Methods
 * Demonstrates:
 *  1. How Type Erasure turns T into Object
 *  2. Inspecting javac-generated Synthetic Bridge Methods via Reflection
 *  3. Heap Pollution causing runtime ClassCastException
 */
public class GenericsTypeErasureDemo {

    // Base generic class
    public static class Node<T> {
        private T data;

        public void setData(T data) {
            this.data = data;
        }

        public T getData() {
            return data;
        }
    }

    // Subclass specializing T to String
    public static class StringNode extends Node<String> {
        @Override
        public void setData(String data) {
            System.out.println("[StringNode] Specialized setData(String) called: " + data);
            super.setData(data);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== GENERICS TYPE ERASURE & SYNTHETIC BRIDGE METHODS ===");

        StringNode node = new StringNode();

        // Inspect methods on StringNode via Reflection:
        // Notice: StringNode contains TWO setData methods!
        //  1. public void setData(String) - written by developer
        //  2. public synthetic bridge void setData(Object) - generated by javac!
        System.out.println("Inspecting methods of StringNode via Reflection:");
        for (Method m : StringNode.class.getDeclaredMethods()) {
            System.out.printf(" - Method: %s(%s) | isBridge: %b | isSynthetic: %b%n",
                    m.getName(),
                    m.getParameterTypes()[0].getSimpleName(),
                    m.isBridge(),
                    m.isSynthetic());
        }

        // Polymorphic invocation via Base reference triggers the Bridge Method:
        Node rawRef = node;
        rawRef.setData("Hello Enterprise Java"); // Calls synthetic setData(Object) -> casts to String!

        System.out.println("Retrieved data from node: " + node.getData());
    }
}`,

  jvmFlagsCode: `# ===================================================================
# Inspecting Compiler Warnings for Type Erasure & Heap Pollution
# ===================================================================
# Instruct javac to report all unchecked casts and heap pollution:
javac -Xlint:unchecked -Xlint:rawtypes GenericsTypeErasureDemo.java

# Disassemble bytecode with detailed method flags showing ACC_BRIDGE:
javap -c -v com.enterprise.jvm.generics.GenericsTypeErasureDemo$StringNode`,

  bytecodeInspection: `// Disassembled Bytecode showing Synthetic Bridge Method in StringNode:
public void setData(java.lang.String);
  Code:
   0: getstatic     #7   // Field java/lang/System.out:Ljava/io/PrintStream;
   3: ...
   8: invokevirtual #13  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
  11: aload_0
  12: aload_1
  13: invokespecial #19  // Method Node.setData:(Ljava/lang/Object;)V
  16: return

// JAVAC GENERATED SYNTHETIC BRIDGE METHOD:
public void setData(java.lang.Object);
  descriptor: (Ljava/lang/Object;)V
  flags: (0x1041) ACC_PUBLIC, ACC_BRIDGE, ACC_SYNTHETIC
  Code:
   0: aload_0
   1: aload_1
   2: checkcast     #22  // class java/lang/String (Downcast to String!)
   5: invokevirtual #24  // Method setData:(Ljava/lang/String;)V (Delegates to user method!)
   8: return`,

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        en: 'What is Type Erasure in Java Generics, and why did Java implement Generics this way?',
        vi: 'Xóa kiểu (Type Erasure) trong Java Generics là gì và tại sao Java lại chọn cách triển khai này?'
      },
      answer: {
        en: 'Type Erasure is the compiler process where all generic type parameters (like <T> or <String>) are removed during compilation and replaced with their upper bound (or Object if unbounded). The bytecode contains no generic type information. The compiler inserts explicit checkcast instructions where items are read. Java chose Type Erasure in Java 5 to maintain 100% BACKWARD COMPATIBILITY with pre-Java 5 legacy codebases and raw types (like raw List) without having to rewrite the JVM or recompile existing JARs.',
        vi: 'Xóa kiểu (Type Erasure) là quá trình trình biên dịch javac loại bỏ toàn bộ các tham số kiểu generic (như <T> hay <String>) khi dịch ra bytecode và thay thế bằng cận trên của nó (hoặc Object nếu không khai báo cận). File bytecode không hề lưu thông tin kiểu generic. Trình biên dịch tự động chèn các lệnh ép kiểu checkcast tại nơi dữ liệu được lấy ra. Java chọn cách này ở Java 5 để bảo đảm TƯƠNG THÍCH NGƯỢC 100% với các hệ thống cũ trước đó mà không phải đập đi xây lại máy ảo JVM.'
      },
      trapWarning: {
        en: 'Because of Type Erasure, you CANNOT do: new T(), new T[10], or instanceof List<String>. At runtime, the JVM has no idea what T is!',
        vi: 'Hệ quả của Type Erasure: Bạn KHÔNG THỂ viết new T(), new T[10] hay kiểm tra instanceof List<String>. Lúc chạy, máy ảo JVM hoàn toàn không biết T là gì!'
      },
      proTip: {
        en: 'Explain Reifiable vs Non-Reifiable types: Arrays are reifiable (they know their element type at runtime: String[] checks types on every store), while Generics are non-reifiable. This is why Java forbids generic array creation like new List<String>[10].',
        vi: 'Phân biệt Reifiable vs Non-reifiable: Mảng là reifiable (biết rõ kiểu của nó lúc runtime, gán sai kiểu sẽ ném ArrayStoreException), trong khi Generic bị xóa kiểu (non-reifiable). Đây là lý do Java cấm tạo mảng generic như new List<String>[10].'
      }
    },
    {
      seniority: 'Mid',
      question: {
        en: 'What are Synthetic Bridge Methods and why does javac generate them automatically?',
        vi: 'Synthetic Bridge Method là gì và tại sao javac phải tự động sinh ra chúng?'
      },
      answer: {
        en: 'When a subclass extends a parameterized generic class or implements a parameterized interface (e.g. class StringNode extends Node<String>), type erasure erases Node.setData(T) to Node.setData(Object). In StringNode, the developer wrote setData(String). Because the parameter types differ (Object vs String), this does NOT match method overriding in bytecode! Polymorphism would break: calling node.setData(Object) on a StringNode reference would invoke the parent method instead of the subclass. To preserve polymorphism, javac automatically synthesizes a Bridge Method: public void setData(Object o) { setData((String) o); }. It has ACC_BRIDGE and ACC_SYNTHETIC flags and delegates to the concrete method after a checkcast downcast.',
        vi: 'Khi một lớp con kế thừa từ lớp generic (như StringNode extends Node<String>), cơ chế xóa kiểu sẽ biến Node.setData(T) thành Node.setData(Object). Trong khi đó ở StringNode, bạn viết hàm setData(String). Do kiểu tham số khác nhau (Object vs String), ở tầng bytecode đây KHÔNG PHẢI là ghi đè hàm (overriding)! Tính đa hình sẽ bị vỡ. Để cứu tính đa hình, javac tự động sinh ra một hàm cầu nối Bridge Method: public void setData(Object o) { setData((String) o); }. Hàm này mang cờ ACC_BRIDGE và ACC_SYNTHETIC, tự động ép kiểu sang String rồi gọi hàm thực tế của lớp con.'
      },
      trapWarning: {
        en: 'Bridge methods can cause unexpected ClassCastExceptions if raw types are used to bypass compile-time type safety: Node raw = new StringNode(); raw.setData(Integer.valueOf(100)); throws ClassCastException inside the bridge method!',
        vi: 'Bridge method có thể ném ngoại lệ ClassCastException lúc chạy nếu bạn dùng raw type để lách qua trình biên dịch: Node raw = new StringNode(); raw.setData(100); sẽ phát nổ ClassCastException ngay bên trong bridge method!'
      },
      proTip: {
        en: 'Reflection sees bridge methods! Method[] methods = StringNode.class.getDeclaredMethods() returns TWO setData methods: setData(String) and setData(Object). Always filter out method.isBridge() when inspecting classes via reflection.',
        vi: 'Reflection sẽ nhìn thấy cả Bridge Method! Gọi StringNode.class.getDeclaredMethods() sẽ trả về HAI hàm setData. Khi viết thư viện dùng Reflection, luôn dùng method.isBridge() để lọc bỏ các hàm do compiler tự sinh.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        en: 'Explain PECS (Producer Extends, Consumer Super) in Java Generics wildcards.',
        vi: 'Giải thích nguyên tắc PECS (Producer Extends, Consumer Super) khi dùng Generic Wildcards trong Java.'
      },
      answer: {
        en: 'PECS is the definitive mnemonic for wildcard variance in API design: 1. Producer Extends (Covariance): If a parameterized type represents a producer that READS items (e.g., source collections), use <? extends T>. You can safely read items as type T, but you CANNOT add items (except null) because the exact subtype is unknown. 2. Consumer Super (Contravariance): If a parameterized type represents a consumer that WRITES items (e.g., sink collections, destinations), use <? super T>. You can safely write items of type T into it, but when reading, items are returned only as raw Object. Example: Collections.copy(List<? super T> dest, List<? extends T> src) perfectly demonstrates PECS: src produces items (extends), dest consumes items (super).',
        vi: 'PECS là quy tắc vàng khi thiết kế API với Wildcard Generic: 1. Producer Extends (Hiệp biến - Covariance): Nếu tham số đóng vai trò là nguồn CUNG CẤP dữ liệu để ĐỌC, hãy dùng <? extends T>. Bạn có thể đọc dữ liệu an toàn dưới dạng kiểu T, nhưng KHÔNG ĐƯỢC PHÉP THÊM phần tử vào (trừ null) vì không biết chắc lớp con cụ thể là gì. 2. Consumer Super (Nghịch biến - Contravariance): Nếu tham số đóng vai trò là nơi TIÊU THỤ dữ liệu để GHI, hãy dùng <? super T>. Bạn có thể ghi an toàn các phần tử kiểu T vào đó, nhưng khi đọc ra thì chỉ nhận được kiểu Object. Ví dụ chuẩn mực trong JDK: Collections.copy(List<? super T> dest, List<? extends T> src) áp dụng hoàn hảo PECS: src là nơi sản xuất (extends), dest là nơi tiêu thụ (super).'
      },
      trapWarning: {
        en: 'Do not use wildcards as return types! Effective Java Item 31: "Do not use wildcard types as return types; it forces client code to use wildcards and clutters the API without benefits."',
        vi: 'Tuyệt đối không dùng Wildcard làm kiểu trả về của hàm! Điều này ép code phía gọi hàm cũng phải dùng wildcard, làm rối rắm API mà không đem lại bất kỳ lợi ích nào.'
      },
      proTip: {
        en: 'Explain how Super Type Tokens (TypeReference<T> in Jackson) bypass type erasure: While instance type arguments are erased, the generic superclass signature is PRESERVED in class metadata! new TypeReference<List<String>>() {} creates an anonymous subclass whose superclass metadata retains List<String>.',
        vi: 'Bí quyết bẻ khóa Type Erasure của Jackson (TypeReference<T>): Dù kiểu của instance bị xóa, nhưng chữ ký kiểu của lớp cha (Generic Superclass) VẪN ĐƯỢC LƯU trong metadata của class! Khởi tạo new TypeReference<List<String>>() {} tạo một lớp con nội danh lưu giữ trọn vẹn kiểu List<String>.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      en: 'Microservice JSON Deserialization ClassCastException & Super Type Token Solution',
      vi: 'Lỗi Ép Kiểu ClassCastException Khi Giải Tuần Tự JSON & Bí Quyết Super Type Token'
    },
    businessContext: {
      en: 'A core banking microservice communicates with upstream payment providers using a generic API payload wrapper: ApiResponse<List<TransactionDto>>.',
      vi: 'Dịch vụ ngân hàng số giao tiếp với cổng thanh toán đối tác qua một lớp vỏ bọc JSON dùng chung: ApiResponse<List<TransactionDto>>.'
    },
    problemDescription: {
      en: 'A developer implemented a generic HTTP client method: public <T> T fetch(String url, Class<T> responseType). When invoking client.fetch("/transactions", List.class), the method returned successfully. However, when the calling service iterated through the list: for (TransactionDto tx : transactions), the JVM threw an explosive runtime exception: java.lang.ClassCastException: class java.util.LinkedHashMap cannot be cast to class com.banking.TransactionDto! Due to Java Type Erasure, Jackson only saw raw List.class at runtime; having lost the TransactionDto type parameter, it defaulted to instantiating LinkedHashMap entries. The compiler-injected synthetic checkcast instruction failed immediately upon the first list element access.',
      vi: 'Lập trình viên xây dựng hàm gọi HTTP generic: public <T> T fetch(String url, Class<T> responseType). Khi gọi client.fetch("/transactions", List.class), hàm chạy không hề báo lỗi. Nhưng khi ứng dụng duyệt danh sách: for (TransactionDto tx : transactions), JVM bất ngờ phát nổ ngoại lệ lúc chạy: java.lang.ClassCastException: class java.util.LinkedHashMap cannot be cast to class com.banking.TransactionDto! Do cơ chế Xóa kiểu (Type Erasure), thư viện Jackson chỉ nhìn thấy List.class trơ trụi lúc runtime; mất thông tin kiểu TransactionDto, nó đành mặc định parse từng phần tử thành LinkedHashMap. Lệnh ép kiểu checkcast do compiler tự chèn lập tức sập ngay ở phần tử đầu tiên.'
    },
    whyNaiveFails: {
      en: 'Writing List<TransactionDto>.class is a compiler syntax error in Java because parameterized generic types are non-reifiable. Adding unchecked casts like (List<TransactionDto>) (Object) rawList simply silences compiler warnings but crashes with ClassCastException at runtime.',
      vi: 'Viết List<TransactionDto>.class là lỗi cú pháp biên dịch trong Java vì kiểu generic không tồn tại lúc runtime. Ép kiểu thô bạo (List<TransactionDto>) (Object) rawList chỉ đánh lừa trình biên dịch tắt cảnh báo, nhưng vẫn sập hoàn toàn khi chạy thực tế.'
    },
    coreSolution: {
      en: 'Bypass Type Erasure using Neal Gafter\'s "Super Type Token" pattern (implemented by Spring ParameterizedTypeReference<T> and Jackson TypeReference<T>). While instance type parameters are erased, generic type signatures of an anonymous subclass\'s SUPERCLASS are permanently retained in Metaspace bytecode attributes! By passing new ParameterizedTypeReference<List<TransactionDto>>() {}, Jackson accesses getClass().getGenericSuperclass(), reflects the actual TypeArguments, and reconstructs concrete TransactionDto instances.',
      vi: 'Bẻ khóa cơ chế Xóa kiểu bằng mẫu thiết kế "Super Type Token" (được hiện thực qua Spring ParameterizedTypeReference<T> và Jackson TypeReference<T>). Mặc dù tham số kiểu của đối tượng bị xóa, nhưng chữ ký generic của LỚP CHA của một lớp con nội danh (Anonymous Subclass) VẪN ĐƯỢC LƯU TRỮ VĨNH VIỄN trong metadata của Metaspace! Bằng cách truyền new ParameterizedTypeReference<List<TransactionDto>>() {}, thư viện Jackson đọc được kiểu qua getGenericSuperclass() và giải tuần tự chính xác từng đối tượng TransactionDto.'
    },
    productionCode: `// Production Safe Generic Rest Client: Super Type Token Pattern
package com.banking.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;

public class ResilientBankingClient {

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. PRODUCTION SPRING PATTERN: ParameterizedTypeReference preserves generic tokens
    public <T> T getWithSpringTypeToken(String url, ParameterizedTypeReference<T> typeRef) {
        return restClient.get()
            .uri(url)
            .retrieve()
            .body(typeRef); // Spring extracts Metaspace signature metadata safely!
    }

    // 2. JACKSON TYPE REFERENCE PATTERN: Anonymous Subclass Trick
    public <T> T parseJsonWithToken(String json, TypeReference<T> typeRef) throws Exception {
        // Jackson inspects ((ParameterizedType) typeRef.getClass().getGenericSuperclass())
        return objectMapper.readValue(json, typeRef);
    }

    // Usage Demonstration:
    public void demoUsage() throws Exception {
        // Creates an anonymous subclass {} whose bytecode retains <List<TransactionDto>>!
        ParameterizedTypeReference<List<TransactionDto>> typeToken = 
            new ParameterizedTypeReference<List<TransactionDto>>() {};

        List<TransactionDto> transactions = getWithSpringTypeToken("https://api.bank.com/tx", typeToken);
        // 100% Type-Safe: ZERO ClassCastException!
        for (TransactionDto tx : transactions) {
            System.out.println("Tx ID: " + tx.id());
        }
    }

    public record TransactionDto(String id, long amountCents) {}
}`,
    architectureImpact: {
      en: 'Completely eliminated 100% of runtime ClassCastException deserialization defects; Ensured compile-time and runtime type safety across all generic microservice REST and Kafka integrations.',
      vi: 'Triệt tiêu 100% lỗi ép kiểu ClassCastException khi giải mã JSON; Bảo đảm an toàn kiểu dữ liệu tuyệt đối cả lúc biên dịch lẫn lúc thực thi trên toàn bộ các kênh tích hợp REST và Kafka.'
    }
  }
};
