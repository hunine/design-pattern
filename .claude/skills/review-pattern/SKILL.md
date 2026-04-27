---
name: review-pattern
description: >
  Use this skill whenever the user asks to review, check, evaluate, give feedback on,
  or assess a design pattern solution in this repository. Trigger phrases include but
  are not limited to: "review my solution for X", "check my X implementation",
  "give me feedback on X", "how is my X solution?", "is my X correct?",
  "evaluate my X pattern", "review X", "can you review the X solution?",
  where X is any GoF design pattern name (e.g. factory-method, singleton, observer,
  decorator, strategy, etc.). Extracts the pattern name from the user's message
  and uses it as the argument.
---

# Review Design Pattern Solution

## Step 0 — Resolve the Pattern Name

The pattern name comes from one of two sources:

1. **Slash command argument**: if the user typed `/review-pattern <pattern>`, the pattern name is `$ARGUMENTS`.
2. **Natural language**: if the user wrote something like "review my factory method solution" or "check my observer implementation", extract the pattern name from their message.

Normalise the pattern name to kebab-case (e.g. "Factory Method" → `factory-method`, "chain of responsibility" → `chain-of-responsibility`).

If you cannot confidently extract a pattern name, ask the user: "Which pattern would you like me to review? (e.g. factory-method, observer, singleton)"

Use the resolved pattern name everywhere `$ARGUMENTS` appears below.

## Your Task

Perform a thorough code review of the design pattern solution in this repository. Follow every step below in order.

---

## Step 1 — Locate the Files

Search for the pattern directory under `src/` in the current working directory. The layout is:

```
src/{category}/{pattern-name}/
  raw/index.ts        ← the dirty code showing the problem
  solution/index.ts   ← the implementation to review
  solution/index.test.ts  ← tests (if they exist)
  README.md           ← pattern explanation (if it exists)
```

Categories are: `creational`, `structural`, `behavioral`.

Use Bash `find` to locate the folder if the path is not immediately obvious:
```bash
find src -type d -name "$ARGUMENTS"
```

Read all files that exist before writing any feedback.

---

## Step 2 — Understand the Intent

Before reviewing code quality, answer these questions internally:
- What problem does this pattern solve?
- What are the canonical GoF participants for this pattern?
- What are the most common implementation mistakes for this pattern?

Use the README.md (if present) and your own knowledge.

---

## Step 3 — Perform the Review

Produce a structured review with the following sections:

### 1. Intent Check
Does `solution/index.ts` actually solve the problem demonstrated in `raw/index.ts`? Confirm yes or no and briefly explain.

### 2. Structure Compliance
Map the code to the canonical GoF participants. For each expected participant, state:
- Whether it is present
- The exact class/interface name used
- Any naming or structural deviation from the pattern

### 3. TypeScript Best Practices
Check for:
- `interface` vs `abstract class` — is the right one used for Product and Creator roles?
- Access modifiers (`private`, `protected`, `public`) — are they applied correctly?
- `any` type — flag every occurrence
- Return types — are all public methods explicitly typed?
- Generics — would generics make the solution more reusable without adding complexity?
- `readonly` — should any properties be readonly?

### 4. Pattern-Specific Pitfalls
Check for mistakes that are common to **this specific pattern**. Examples:
- **Singleton**: lazy init without thread-safety consideration, exposing the constructor as public
- **Factory Method**: creator doing too much work in the factory method, returning `any` instead of the Product interface
- **Observer**: not removing listeners (memory leak), synchronous notification causing infinite loops
- **Decorator**: forgetting to delegate to the wrapped component, breaking the component interface
- **Strategy**: strategy holding state it shouldn't, client hard-coding a strategy instead of injecting it
- **Proxy**: proxy not implementing the full Subject interface
- **Composite**: leaf nodes implementing container methods unnecessarily
- (apply the relevant pitfalls for the pattern being reviewed)

### 5. Raw vs Solution Diff
List every problem identified in `raw/index.ts` (from the comments and code) and confirm whether `solution/index.ts` resolves it. Use a table:

| Problem in raw | Resolved in solution? | Notes |
|---|---|---|

### 6. SOLID Principles
- **S** — Single Responsibility: does each class have one reason to change?
- **O** — Open/Closed: can you add a new variant without modifying existing classes?
- **L** — Liskov Substitution: are subtypes safely substitutable for the base type?
- **I** — Interface Segregation: are interfaces lean and focused?
- **D** — Dependency Inversion: does high-level code depend on abstractions, not concretions?

Flag any violations with the specific line or class.

### 7. Test Coverage (if tests exist)
- Do tests exercise the core pattern behavior?
- Are edge cases covered?
- Are tests verifying behavior or implementation details?

### 8. Verdict

Rate the solution on a three-point scale:

| Rating | Meaning |
|---|---|
| **Needs Work** | Pattern is misapplied or has significant structural issues |
| **Good** | Pattern is correctly applied with minor improvements possible |
| **Excellent** | Clean, idiomatic, fully compliant implementation |

Follow the verdict with up to **3 concrete, actionable suggestions** — each with the specific line or class to change and the exact improvement to make.

---

## Output Format

Write the review in clean Markdown. Use headers matching the section names above. Be direct — point to specific line numbers and class names. Do not pad with praise; focus on accuracy and actionable feedback.

End with a one-line summary: `Overall: <rating> — <one sentence reason>.`
