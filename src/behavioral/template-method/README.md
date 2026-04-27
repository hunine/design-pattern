# Template Method

**Category:** Behavioral

---

## Intent

Template Method is a behavioral design pattern that **defines the skeleton of an algorithm in the superclass** but lets subclasses override specific steps of the algorithm without changing its structure.

The key idea: the base class has the algorithm as a `final` (non-overridable) `run()` method that calls a fixed sequence of steps. Subclasses override only the variable steps.

---

## The Problem

`CSVDataMiner` and `JSONDataMiner` share the same 4-step pipeline (open, parse, analyze, report) but duplicate the shared steps:

```typescript
class CSVDataMiner {
  run(filePath: string): void {
    const raw = this.readFile(filePath);                    // Step 1: open
    const rows = raw.split("\n").map((l) => l.split(","));  // Step 2: parse CSV
    const result = this.analyze(rows.flat());               // Step 3: analyze ← copy-paste
    console.log(`CSV report: ${result}`);                   // Step 4: report ← copy-paste
  }
  private analyze(values: string[]): string { return `${values.length} values processed`; }
}

class JSONDataMiner {
  run(filePath: string): void {
    const raw = this.readFile(filePath);                     // Step 1: duplicated
    const data = JSON.parse(raw);                            // Step 2: parse JSON
    const rows = data.map((d) => Object.values(d).map(String));
    const result = this.analyze(rows.flat());                // Step 3: copy-paste
    console.log(`JSON report: ${result}`);                   // Step 4: copy-paste
  }
  private analyze(values: string[]): string { return `${values.length} values processed`; }
}
```

Problems:
- **Steps 3 and 4 are identical** — copy-pasted into both classes.
- Adding a **logging step** before analysis requires editing both classes.
- **No enforcement** that the sequence (open → parse → analyze → report) is followed — each subclass could do it in any order.
- Adding a `XmlDataMiner` means copy-pasting the skeleton again.

---

## The Solution

Define the skeleton in an abstract base class. Mark the fixed steps as concrete methods; mark the variable steps as `abstract` (subclasses must implement them):

```typescript
abstract class DataMiner {
  // Template method — defines the skeleton. Do not override.
  run(filePath: string): void {
    const raw     = this.readFile(filePath); // Step 1: fixed
    const data    = this.parseData(raw);     // Step 2: abstract — subclass provides
    const result  = this.analyzeData(data);  // Step 3: fixed (shared logic)
    this.sendReport(result);                 // Step 4: fixed (shared logic)
  }

  protected abstract parseData(raw: string): string[]; // subclass fills this in

  private readFile(path: string): string { return "..."; }   // shared
  private analyzeData(values: string[]): string {
    return `${values.length} values processed`;              // shared — defined once
  }
  private sendReport(result: string): void {
    console.log(`Report: ${result}`);                        // shared — defined once
  }
}

class CSVDataMiner extends DataMiner {
  protected parseData(raw: string): string[] {
    return raw.split("\n").flatMap((line) => line.split(","));
  }
}

class JSONDataMiner extends DataMiner {
  protected parseData(raw: string): string[] {
    const data: Record<string, unknown>[] = JSON.parse(raw);
    return data.flatMap((d) => Object.values(d).map(String));
  }
}
```

Shared steps are defined once. Adding `XmlDataMiner` = one `parseData` override; no step duplication.

---

## Structure

```
DataMiner (Abstract Class)
├── run(filePath): void   ← template method (final — defines the sequence)
├── readFile(): string    ← concrete (shared)
├── parseData(): string[] ← abstract (subclass must implement)
├── analyzeData(): string ← concrete (shared)
└── sendReport(): void    ← concrete (shared)
     │
     ├── CSVDataMiner
     │    └── parseData() → CSV-specific
     └── JSONDataMiner
          └── parseData() → JSON-specific
```

### Participants

| Role | Responsibility |
|---|---|
| **Abstract Class** (`DataMiner`) | Defines the template method and all fixed steps; declares abstract variable steps |
| **Concrete Class** (`CSVDataMiner`, `JSONDataMiner`) | Implements only the variable step(s) |

---

## How to Implement

1. **Identify the shared algorithm skeleton** in the duplicated classes.

2. **Create an abstract base class** with the template method that calls the steps in order.

3. **Make shared steps `private` or `protected` concrete methods** in the base class.

4. **Make variable steps `abstract` or `protected` virtual methods** in the base class.

5. **Create concrete subclasses** that implement only the variable steps.

6. **(Optional) Add hook methods**: empty concrete methods the subclass *may* override for optional customisation.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class CSVDataMiner {
  run(filePath: string): void {
    const raw = this.readFile(filePath);
    const rows = raw.split("\n").map((line) => line.split(","));
    const result = this.analyze(rows.flat());  // ← copy-paste
    console.log(`CSV report: ${result}`);      // ← copy-paste
  }
  private analyze(values: string[]): string { return `${values.length} values processed`; }
}
// JSONDataMiner has identical analyze() and report — copy-paste duplication.
```

Problems:
- `analyze()` and the report log are duplicated in both classes.
- Adding a logging step before `analyze()` means editing both classes.
- No guarantee both miners follow the same sequence.

### After (solution) — `solution/index.ts`

```typescript
abstract class DataMiner {
  run(filePath: string): void {
    const raw    = this.readFile(filePath);
    const data   = this.parseData(raw);    // subclass provides this
    const result = this.analyzeData(data); // defined once, here
    this.sendReport(result);               // defined once, here
  }

  protected abstract parseData(raw: string): string[];
}

// CSVDataMiner and JSONDataMiner implement only parseData.
new CSVDataMiner().run("data.csv");
new JSONDataMiner().run("data.json");
```

Benefits:
- `analyzeData` and `sendReport` are defined exactly once in the base class.
- Adding a pre-analysis logging hook requires changing only the base class.
- Subclasses are small — they implement exactly what's unique to them.

---

## When to Use

- **Multiple classes share the same algorithm skeleton** with only a few steps that differ.
- **You want to prevent subclasses from accidentally changing the algorithm structure** — only the variable steps should be overridable.
- **You want optional extension points (hooks)** where subclasses can customise without being forced to.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Eliminates code duplication in the shared skeleton | Violation of Liskov Substitution Principle is possible if subclasses behave unexpectedly |
| Open/Closed: add new variants without changing the base class skeleton | Skeleton is defined through inheritance — harder to compose |
| Template enforces the algorithm structure | Subclasses may override too much if steps aren't protected properly |

---

## Relations with Other Patterns

- **Strategy**: Template Method uses inheritance to vary steps; Strategy uses composition to replace the whole algorithm. Template Method is "fill in the blanks"; Strategy is "plug in a different engine".
- **Factory Method** is a specialised Template Method — the variable step is object creation.
- **Hook methods** are a weaker form of extension — they provide empty default implementations instead of forcing `abstract` overrides.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `CSVDataMiner` and `JSONDataMiner` with duplicated `analyze` and `report` logic |
| `solution/index.ts` | Abstract `DataMiner` with `run()` template; `parseData()` is abstract |
| `solution/index.test.ts` | Verifies both miners produce the correct report using the shared skeleton |

**Challenge:** add an `XMLDataMiner` that overrides only `parseData()` — verify that `analyzeData` and `sendReport` run without any change to those methods.
