# Design Patterns in TypeScript

A hands-on learning repository for all 23 GoF design patterns. Every pattern has a **raw** version (the messy code that motivates the pattern) and a **solution** you implement yourself.

---

## Prerequisites

- Node.js 18+
- npm 9+

```bash
npm install
```

---

## Learning Workflow

Each pattern follows the same six-step loop:

```
1. Read      →  open the pattern's README.md
2. Study     →  read raw/index.ts to understand the problem
3. Scaffold  →  ask Claude to create the solution skeleton
4. Implement →  fill in every TODO in solution/index.ts
5. Test      →  npm test -- --testPathPattern=<pattern>
6. Review    →  ask Claude to review your solution
```

### Step-by-step

**1. Pick a pattern and read its README**

Every pattern directory contains a `README.md` covering intent, GoF structure, when to use, pros/cons, and a before/after code walkthrough. Start here before writing any code.

```
src/creational/factory-method/README.md
```

**2. Study the raw code**

`raw/index.ts` shows the real-world problem the pattern solves — coupled code, duplication, fragile conditionals. Read the comments; they call out exactly what hurts and why.

```
src/creational/factory-method/raw/index.ts
```

**3. Scaffold the solution**

Ask Claude Code in plain English or use the slash command. It reads your `raw/index.ts` and `README.md`, then generates:
- `solution/index.ts` — all GoF participants as typed stubs with `// TODO:` markers
- `solution/index.test.ts` — Jest tests that define the expected behavior

```
/new-solution factory-method
```

Or just say: _"create a solution for factory method"_ / _"scaffold the observer pattern"_ / _"I want to implement singleton"_

**4. Implement the solution**

Open `solution/index.ts` and fill in every `// TODO:` in the order the scaffold checklist describes.

**5. Run the tests**

```bash
npm test -- --testPathPattern=factory-method
```

All tests should pass when you are done.

**6. Get a code review**

Ask Claude Code in plain English or use the slash command. It checks your solution against the canonical GoF structure, TypeScript best practices, SOLID principles, and pattern-specific pitfalls, then gives you a verdict and up to three actionable suggestions.

```
/review-pattern factory-method
```

Or just say: _"review my factory method solution"_ / _"check my observer implementation"_ / _"give me feedback on singleton"_

---

## Project Structure

```
src/
  creational/           # object-creation patterns
  structural/           # composition patterns
  behavioral/           # communication patterns

Each pattern/
  README.md             # concept, structure, when to use
  raw/
    index.ts            # dirty code — the problem to solve
  solution/             # created by the new-solution skill
    index.ts            # your implementation (fill in the TODOs)
    index.test.ts       # Jest tests
```

---

## Pattern Catalog

### Creational

| Pattern | Problem it solves |
|---|---|
| [Singleton](src/creational/singleton/) | Multiple instances of a shared resource |
| [Factory Method](src/creational/factory-method/) | Hardcoded `new ConcreteClass()` scattered across callers |
| [Abstract Factory](src/creational/abstract-factory/) | Platform-specific object creation duplicated everywhere |
| [Builder](src/creational/builder/) | Telescoping constructors with many optional parameters |
| [Prototype](src/creational/prototype/) | Manual field-by-field copying causing shallow-copy bugs |

### Structural

| Pattern | Problem it solves |
|---|---|
| [Adapter](src/structural/adapter/) | Incompatible interfaces between existing classes |
| [Bridge](src/structural/bridge/) | Subclass explosion from combining two dimensions (e.g. shape × color) |
| [Composite](src/structural/composite/) | Treating individual objects and groups differently with `instanceof` |
| [Decorator](src/structural/decorator/) | Feature combinations requiring exponentially many subclasses |
| [Facade](src/structural/facade/) | Client code tangled with a complex subsystem |
| [Flyweight](src/structural/flyweight/) | Memory waste from duplicating shared immutable state across many objects |
| [Proxy](src/structural/proxy/) | No control over access, caching, or lazy init for expensive objects |

### Behavioral

| Pattern | Problem it solves |
|---|---|
| [Chain of Responsibility](src/behavioral/chain-of-responsibility/) | All request handling crammed into one monolithic function |
| [Command](src/behavioral/command/) | Direct method calls with no history, no undo |
| [Iterator](src/behavioral/iterator/) | Clients knowing internal structure of different collections |
| [Mediator](src/behavioral/mediator/) | Components holding direct references to each other |
| [Memento](src/behavioral/memento/) | Undo/redo requiring public exposure of private state |
| [Observer](src/behavioral/observer/) | Hardcoded calls to concrete subscribers |
| [State](src/behavioral/state/) | Giant `switch` statements that grow with every new state |
| [Strategy](src/behavioral/strategy/) | All algorithm variants baked into one class |
| [Template Method](src/behavioral/template-method/) | Duplicated algorithm skeleton across similar classes |
| [Visitor](src/behavioral/visitor/) | Adding new operations forces changes to every element class |
| [Interpreter](src/behavioral/interpreter/) | Ad-hoc string parsing with no extensible grammar |

---

## Claude Code Skills

Both skills respond to slash commands **and** plain natural language — no need to remember the exact syntax.

| Skill | Slash command | Natural language examples |
|---|---|---|
| Scaffold solution | `/new-solution <pattern>` | _"create a solution for factory method"_, _"scaffold observer"_, _"I want to implement builder"_ |
| Review solution | `/review-pattern <pattern>` | _"review my singleton solution"_, _"check my decorator implementation"_, _"give feedback on strategy"_ |

---

## Commands

```bash
npm test                                        # run all tests
npm test -- --testPathPattern=factory-method    # run one pattern's tests
npm run build                                   # compile TypeScript
```

---

## Recommended Order

If you are new to design patterns, work through them in this sequence — each builds intuition for the next:

1. **Creational**: Singleton → Factory Method → Abstract Factory → Builder → Prototype
2. **Structural**: Adapter → Decorator → Facade → Proxy → Composite → Bridge → Flyweight
3. **Behavioral**: Strategy → Template Method → Observer → Command → State → Chain of Responsibility → Iterator → Mediator → Memento → Visitor → Interpreter
