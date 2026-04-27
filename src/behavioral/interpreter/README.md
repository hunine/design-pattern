# Interpreter

**Category:** Behavioral

---

## Intent

Interpreter is a behavioral design pattern that **defines a grammar for a language and provides an interpreter to evaluate sentences in that language**.

The key idea: represent each grammar rule as a class. Build an Abstract Syntax Tree (AST) from those classes, then evaluate it by calling `interpret()` on the root.

---

## The Problem

A calculator evaluates math expressions using ad-hoc string splitting. Adding new operators or parentheses support requires rewriting fragile string-manipulation logic:

```typescript
function evaluate(expression: string): number {
  expression = expression.trim();

  // Scan right-to-left for addition.
  const addIndex = expression.lastIndexOf("+");
  if (addIndex > 0) {
    const left  = evaluate(expression.slice(0, addIndex));
    const right = evaluate(expression.slice(addIndex + 1));
    return left + right;
  }

  // Handle subtraction.
  const subIndex = expression.lastIndexOf("-");
  if (subIndex > 0) { ... }

  // Handle multiplication.
  const mulIndex = expression.lastIndexOf("*");
  if (mulIndex > 0) { ... }

  // ... and so on — fragile, no precedence, breaks on parentheses.
  return parseFloat(expression);
}

evaluate("2*3+4"); // wrong — no operator precedence
```

Problems:
- **No grammar**: the parser is hand-coded string manipulation — not driven by rules.
- **No operator precedence**: `2*3+4` evaluates incorrectly.
- **No extensibility**: adding `%` (modulo) or `(` `)` requires major surgery to the existing code.
- **No AST**: you can't inspect, optimise, or transform the parsed expression.
- **Mixing parsing and evaluation** makes both harder to test.

---

## The Solution

Represent each grammar rule as an `Expression` class with an `interpret()` method. Parse the input into an AST and evaluate by calling `interpret()` on the root:

```typescript
interface Expression {
  interpret(): number;
}

class NumberExpression implements Expression {
  constructor(private value: number) {}
  interpret(): number { return this.value; }
}

class AddExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(): number { return this.left.interpret() + this.right.interpret(); }
}

class MultiplyExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(): number { return this.left.interpret() * this.right.interpret(); }
}

// Build the AST for "3 + 5".
const expr = new AddExpression(
  new NumberExpression(3),
  new NumberExpression(5)
);
console.log(expr.interpret()); // 8

// Build the AST for "2 * (3 + 4)".
const expr2 = new MultiplyExpression(
  new NumberExpression(2),
  new AddExpression(new NumberExpression(3), new NumberExpression(4))
);
console.log(expr2.interpret()); // 14
```

Adding a `ModuloExpression` = one new class. Parsing can be separated into its own `Parser` class without touching the AST classes.

---

## Structure

```
«interface» Expression
└── interpret(): number

NumberExpression (Terminal Expression)
└── interpret() → returns the literal value

AddExpression / SubtractExpression / MultiplyExpression / DivideExpression
  (Non-Terminal Expressions)
└── interpret() → left.interpret() OP right.interpret()

Parser (optional separate class)
└── parse(input: string): Expression → builds the AST
```

### Participants

| Role | Responsibility |
|---|---|
| **Expression** | Declares `interpret()` |
| **Terminal Expression** (`NumberExpression`) | Implements `interpret()` for a leaf node (literal value, variable) |
| **Non-Terminal Expression** (`AddExpression`, …) | Implements `interpret()` by combining child expressions |
| **Parser** (optional) | Converts a string into an AST of Expression objects |
| **Client** | Builds (or receives) the AST and calls `interpret()` on the root |

---

## How to Implement

1. **Define the grammar**: list all rules (number, add, subtract, multiply, divide, parentheses).

2. **Declare the `Expression` interface** with `interpret(): T`.

3. **Implement Terminal Expression classes** for leaf nodes (numbers, variables, constants).

4. **Implement Non-Terminal Expression classes** for composite rules — they hold child `Expression` references and combine their results.

5. **(Optional) Implement a `Parser`** that converts a string to an AST. This separates parsing from evaluation.

6. **Client builds the AST** (manually for tests, or via the parser for real input) and calls `root.interpret()`.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
function evaluate(expression: string): number {
  const addIndex = expression.lastIndexOf("+");
  if (addIndex > 0) {
    return evaluate(expression.slice(0, addIndex)) + evaluate(expression.slice(addIndex + 1));
  }
  // ... similar blocks for -, *, /
  return parseFloat(expression);
}

evaluate("2*3+4"); // wrong result — no operator precedence
```

Problems:
- `lastIndexOf("+")` doesn't handle precedence.
- Adding `%` or `(...)` requires rewriting the whole function.
- Parsing and evaluation are mixed together.

### After (solution) — `solution/index.ts`

```typescript
// Manually-built AST for "3 + 5 * 2" with correct precedence.
const expr = new AddExpression(
  new NumberExpression(3),
  new MultiplyExpression(new NumberExpression(5), new NumberExpression(2))
);
console.log(expr.interpret()); // 13 (correct: 3 + (5 * 2))

// Add modulo — zero changes to existing expression classes.
class ModuloExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(): number { return this.left.interpret() % this.right.interpret(); }
}
```

Benefits:
- Grammar rules are explicit, testable classes.
- New operators = new expression class; existing code unchanged.
- The AST can be inspected, printed, or transformed (e.g., optimise `0+x → x`).

---

## When to Use

- **You have a recurring problem that can be expressed as a grammar**: SQL queries, config DSLs, math expressions, search filters, unit conversions.
- **The grammar is simple and stable**: a large or frequently-changing grammar leads to a large class hierarchy.
- **You need to interpret many sentences** of the same language (runtime evaluation, templating engines).
- **You want to compose expressions** from simpler sub-expressions (composite-like tree).

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Easy to add new rules — one new class per grammar rule | Complex grammars require many classes |
| Grammar rules are explicit, testable, and composable | For complex parsing, dedicated parser generators (ANTLR, PEG.js) are a better fit |
| Can inspect, transform, or optimise the AST | Tightly couples grammar to class hierarchy |

---

## Relations with Other Patterns

- **Composite**: the AST is a Composite tree — non-terminal expressions are composites, terminals are leaves.
- **Iterator**: can traverse the AST to collect, print, or transform nodes.
- **Visitor**: apply different operations (evaluate, pretty-print, optimise) to the same AST without changing expression classes.
- **Flyweight**: share terminal expression objects (e.g., `NumberExpression(0)`) when the same literal appears many times.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `evaluate()` function using `lastIndexOf` string splitting — no precedence, no parentheses |
| `solution/index.ts` | `Expression` interface + `NumberExpression`, `AddExpression`, `SubtractExpression`, `MultiplyExpression`, `DivideExpression` |
| `solution/index.test.ts` | Verifies that ASTs evaluate correctly, including operator precedence via nesting |

**Challenge:** add a `VariableExpression` that looks up a name in a `Map<string, number>` context — evaluate `x + 3` where `x = 7` should return `10`.
