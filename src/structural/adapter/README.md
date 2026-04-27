# Adapter

**Category:** Structural  
**Also known as:** Wrapper

---

## Intent

Adapter is a structural design pattern that allows objects with **incompatible interfaces to collaborate**.

The key idea: wrap an existing object in an adapter that translates its interface into the one the client expects — like a power plug adapter between two countries.

---

## The Problem

You have an `AnalyticsLib` that expects JSON data `{ symbol, price }[]`, but your only data source, `StockDataSource`, returns XML. Every time client code needs to run a report, it manually converts XML to JSON inline:

```typescript
function runReport(): void {
  const xml = new StockDataSource().fetchXML();

  // Inline XML-to-JSON conversion — duplicated everywhere.
  const matches = [...xml.matchAll(/<stock>...<\/stock>/g)];
  const jsonData = matches.map((m) => ({ symbol: m[1], price: parseFloat(m[2]) }));

  console.log(new AnalyticsLib().analyze(jsonData));
}
```

Problems:
- The XML parsing regex is **duplicated** every time data is needed.
- Business logic (`runReport`) is buried under **format-conversion plumbing**.
- Changing the XML structure means hunting down every inline conversion.
- You can't swap `StockDataSource` for another source without rewriting all conversions.

---

## The Solution

Create a `StockDataAdapter` that wraps `StockDataSource` and exposes the JSON interface `AnalyticsLib` expects. All conversion logic lives in one place:

```typescript
interface DataSource {
  getData(): { symbol: string; price: number }[];
}

class StockDataAdapter implements DataSource {
  private source = new StockDataSource();

  getData(): { symbol: string; price: number }[] {
    const xml = this.source.fetchXML();
    // Conversion lives here — once.
    return [...xml.matchAll(/<stock>...<\/stock>/g)]
      .map((m) => ({ symbol: m[1], price: parseFloat(m[2]) }));
  }
}

function runReport(source: DataSource): void {
  console.log(new AnalyticsLib().analyze(source.getData()));
}

runReport(new StockDataAdapter()); // works without touching AnalyticsLib
```

---

## Structure

```
Client → «interface» DataSource
               └── getData(): JsonData[]
                    │
                    └── StockDataAdapter (Adapter)
                         ├── wraps: StockDataSource (Adaptee)
                         └── getData() → calls source.fetchXML() + converts

AnalyticsLib (Target consumer — unchanged)
StockDataSource (Adaptee — unchanged)
```

### Participants

| Role | Responsibility |
|---|---|
| **Target** (`DataSource`) | The interface the client expects |
| **Adapter** (`StockDataAdapter`) | Wraps the adaptee; translates calls from the Target interface to the Adaptee |
| **Adaptee** (`StockDataSource`) | The existing class with an incompatible interface |
| **Client** (`runReport`) | Works exclusively through the Target interface |

---

## How to Implement

1. **Identify two classes** with incompatible interfaces that need to work together.

2. **Declare the Target interface** that the client already uses (or create one if none exists).

3. **Create an Adapter class** that implements the Target interface.

4. **Add a field for the Adaptee** instance (composition — prefer this over inheritance).

5. **Implement each Target method** by delegating to the Adaptee, converting data formats as needed.

6. **Replace direct Adaptee usage** in client code with the Adapter.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
function runReport(): void {
  const xml = new StockDataSource().fetchXML();

  // Duplicated conversion logic — format details leaked into client.
  const matches = [...xml.matchAll(/<stock>...<\/stock>/g)];
  const jsonData = matches.map((m) => ({ symbol: m[1], price: parseFloat(m[2]) }));

  new AnalyticsLib().analyze(jsonData);
}
```

Problems:
- Conversion duplicated across every call site.
- Changing XML format → update every `runReport`-like function.
- No common interface — `StockDataSource` and `AnalyticsLib` are tightly coupled via this glue code.

### After (solution) — `solution/index.ts`

```typescript
class StockDataAdapter implements DataSource {
  getData(): { symbol: string; price: number }[] {
    // Conversion is encapsulated here, once.
    const xml = this.source.fetchXML();
    return parseXml(xml);
  }
}

function runReport(source: DataSource): void {
  new AnalyticsLib().analyze(source.getData());
}
```

Benefits:
- One conversion implementation; no duplication.
- `runReport` knows nothing about XML or `StockDataSource`.
- Adding a new data source (e.g., CSV) = new adapter class; `runReport` unchanged.

---

## When to Use

- **You want to use a third-party class** but its interface doesn't match what you need.
- **You have several existing classes** you want to use via a common interface, without modifying them.
- **You're integrating a legacy component** into a new system.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Single Responsibility: conversion logic in one place | Adding adapters increases the number of classes |
| Open/Closed: add new adapters without changing existing code | Two-way adaptation (bidirectional) requires more work |
| Existing classes can be reused without modification | Can hide that the underlying interface is different |

---

## Relations with Other Patterns

- **Facade** simplifies a complex interface. Adapter makes two *incompatible* interfaces work together.
- **Decorator** also wraps an object but adds behaviour; Adapter changes the interface.
- **Proxy** preserves the same interface as the wrapped object; Adapter changes it.
- **Bridge** is designed up-front to separate abstraction from implementation. Adapter is applied after the fact to bridge incompatible classes.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Inline XML-to-JSON conversion duplicated every time the analytics lib is used |
| `solution/index.ts` | `StockDataAdapter` wraps `StockDataSource` and implements `DataSource` |
| `solution/index.test.ts` | Verifies the adapter produces the JSON structure `AnalyticsLib` expects |

**Challenge:** add a `CSVDataAdapter` that reads CSV text and produces the same `{ symbol, price }[]` format — without changing `AnalyticsLib` or `runReport`.
