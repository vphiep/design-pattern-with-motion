import type { Pattern } from '../types';

export const interpreter: Pattern = {
  id: 'interpreter',
  category: 'behavioral',
  name: 'Interpreter',
  tagline: {
    en: 'Define a language, then represent its sentences as trees of objects you can evaluate.',
    vi: 'Định nghĩa một ngôn ngữ, rồi biểu diễn câu của nó thành cây object mà bạn evaluate được.'
  },
  analogy: {
    en: 'A calculator that reads “3 + 4 * 2”. The parser turns the text into a tree: a plus on top, with “3” on one side and a “4 * 2” subtree on the other. Each node knows how to evaluate itself. The Interpreter pattern is that whole arrangement — grammar + tree + evaluator — packaged together.',
    vi: 'Máy tính đọc “3 + 4 * 2”. Parser biến chữ thành cây: phép cộng ở đỉnh, một bên là “3”, bên kia là cây con “4 * 2”. Mỗi node biết cách tự tính. Pattern Interpreter chính là cả bộ đó — ngữ pháp + cây + bộ đánh giá — gói lại với nhau.'
  },
  whenToUse: [
    {
      en: 'There’s a simple language you need to evaluate: math expressions, search queries, config DSLs, filter rules.',
      vi: 'Có một ngôn ngữ nhỏ bạn cần evaluate: biểu thức toán, câu tìm kiếm, DSL cấu hình, luật lọc.'
    },
    {
      en: 'The grammar is small and stable — a full parser generator would be overkill.',
      vi: 'Ngữ pháp nhỏ và ổn định — một parser generator đầy đủ sẽ quá tay.'
    },
    {
      en: 'You want to keep the language extensible: adding a new operator is just adding a new node class.',
      vi: 'Bạn muốn ngôn ngữ mở rộng được: thêm toán tử mới chỉ là thêm một class node.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The grammar is large or complex — use a real parser generator instead.',
      vi: 'Ngữ pháp lớn hoặc phức tạp — hãy dùng parser generator thật.'
    },
    {
      en: 'Performance matters at scale; hand-built interpreter trees are usually slower than generated parsers.',
      vi: 'Hiệu năng quan trọng ở quy mô lớn; cây interpreter viết tay thường chậm hơn parser được generate.'
    }
  ],
  difficulty: 3,
  order: 15,
  javaCode: `// Grammar: expression -> number | expression '+' expression | expression '*' expression
interface Expr { int eval(); }
final class Number implements Expr {
    private final int value;
    Number(int value) { this.value = value; }
    public int eval() { return value; }
}
final class Add implements Expr {
    private final Expr left, right;
    Add(Expr left, Expr right) { this.left = left; this.right = right; }
    public int eval() { return left.eval() + right.eval(); }
}
final class Mul implements Expr {
    private final Expr left, right;
    Mul(Expr left, Expr right) { this.left = left; this.right = right; }
    public int eval() { return left.eval() * right.eval(); }
}

// Build the tree for "3 + 4 * 2" and evaluate it.
//   Expr expr = new Add(new Number(3), new Mul(new Number(4), new Number(2)));
//   expr.eval();  ->  11`,
  steps: [
    {
      title: {
        en: 'A number is a leaf that evaluates to itself',
        vi: 'Số là lá, evaluate ra chính nó'
      },
      body: {
        en: 'Number implements Expr and stores an int. eval() returns that value — there is nothing further to interpret. In the grammar this is the terminal: the tree bottoms out here, the same way a calculator’s digit has no children.',
        vi: 'Number implement Expr và giữ một int. eval() trả về giá trị đó — không còn gì để diễn giải. Trong ngữ pháp đây là terminal: cây chạm đáy tại đây, giống chữ số trên máy tính không có con.'
      }
    },
    {
      title: {
        en: 'An operator evaluates its children, then combines them',
        vi: 'Toán tử evaluate các con, rồi kết hợp'
      },
      body: {
        en: 'Add and Mul are non-terminals. Each holds a left and right Expr. The highlighted return left.eval() + right.eval() is the interpreter rule: ask each child to evaluate, then apply this node’s meaning. Recursion through the tree *is* the evaluation.',
        vi: 'Add và Mul là non-terminal. Mỗi bên giữ Expr trái và phải. Dòng return left.eval() + right.eval() được highlight chính là luật interpreter: hỏi từng con evaluate, rồi áp nghĩa của node này. Đệ quy xuyên cây *chính là* phép tính.'
      }
    },
    {
      title: {
        en: 'Evaluating the root evaluates the sentence',
        vi: 'Evaluate gốc là evaluate cả câu'
      },
      body: {
        en: 'A parser (not shown) would turn the text “3 + 4 * 2” into new Add(new Number(3), new Mul(...)). Calling expr.eval() on that root walks the tree and yields 11. The client never switches on token types — each node already knows its own rule.',
        vi: 'Một parser (không vẽ ở đây) sẽ biến chữ “3 + 4 * 2” thành new Add(new Number(3), new Mul(...)). Gọi expr.eval() trên gốc đó đi xuyên cây và ra 11. Client không switch theo loại token — mỗi node đã tự biết luật của mình.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.util.regex.Pattern and Matcher',
      note: {
        en: 'A compiled Pattern is an interpreter for the regular-expression language. Matcher walks the input against that program; you do not hand-roll the search when the grammar is regex.',
        vi: 'Pattern đã compile là interpreter cho ngôn ngữ regular expression. Matcher đi trên input theo chương trình đó; bạn không tự viết vòng tìm khi ngữ pháp là regex.'
      }
    },
    {
      system: 'Jakarta EL — jakarta.el.ExpressionFactory',
      note: {
        en: 'Unified Expression Language parses ${…} strings into ValueExpression / MethodExpression trees and evaluates them against a context. JSP and JSF use this interpreter for view bindings.',
        vi: 'Unified Expression Language parse chuỗi ${…} thành cây ValueExpression / MethodExpression rồi evaluate trên một context. JSP và JSF dùng interpreter này cho binding trên view.'
      }
    },
    {
      system: 'Spring — org.springframework.expression.spel.standard.SpelExpressionParser',
      note: {
        en: 'SpEL compiles annotation and XML expressions into an AST and interprets (or compiles) that tree. @Value("#{…}") and security expressions are sentences in that language.',
        vi: 'SpEL compile expression trong annotation và XML thành AST rồi interpret (hoặc compile) cây đó. @Value("#{…}") và các expression bảo mật là câu trong ngôn ngữ ấy.'
      }
    }
  ]
};
