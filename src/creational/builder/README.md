# Builder

**Category:** Creational

---

## Intent

Builder is a creational design pattern that lets you **construct complex objects step by step**. The same construction process can produce different representations of an object.

The key idea: separate the construction of a complex object from its representation. A `Director` knows the steps; a `Builder` knows how to execute each step; the result is the finished product.

---

## The Problem

Imagine a `House` class with 7 constructor parameters — walls, roof, floors, garage, pool, garden, statues — most of them optional:

```
// What does `false, true, false, true` even mean?
const house = new House(4, "mansard", 3, true, true, true, true);
const confusing = new House(4, "gable", 2, false, true, false, true);
```

This is the **telescoping constructor** anti-pattern. Problems:
- Callers must remember the exact argument order.
- Most `false` values are noise — it's impossible to read at a glance.
- Adding a new feature (e.g., `hasJacuzzi`) requires updating every constructor call.
- You cannot re-use the construction process for a "basic house" vs a "luxury house" without copy-pasting.

---

## The Solution

Extract the construction into a `HouseBuilder` that exposes one fluent method per feature. A `Director` encodes the steps for each preset (basic, luxury). Client code calls the director or chains builder methods directly.

```
class HouseBuilder {
  private house: House = new House();

  setWalls(n: number): this   { this.house.walls = n;   return this; }
  setRoof(r: string): this    { this.house.roof = r;    return this; }
  addGarage(): this           { this.house.hasGarage = true; return this; }
  addPool(): this             { this.house.hasSwimmingPool = true; return this; }

  build(): House { return this.house; }
}

// Director knows the recipe; builder knows how to execute it.
class Director {
  buildLuxuryHouse(b: HouseBuilder): House {
    return b.setWalls(4).setRoof("mansard").addGarage().addPool().build();
  }
}
```

---

## Structure

```
Director
└── construct(builder: HouseBuilder): void   ← defines the step sequence

«interface» Builder
├── setWalls(n): this
├── setRoof(r): this
├── addGarage(): this
├── addPool(): this
└── build(): House
     │
     └── HouseBuilder (Concrete Builder)
          └── build() → House (Product)

House (Product)
```

### Participants

| Role | Responsibility |
|---|---|
| **Builder** (`HouseBuilder`) | Declares the step methods and returns the finished product |
| **Concrete Builder** | Implements each step and accumulates the result |
| **Director** | Defines the order of steps; doesn't know what is being built |
| **Product** (`House`) | The complex object being built |

---

## How to Implement

1. **Identify the common construction steps** shared by all product representations.

2. **Declare a Builder interface** with those steps.

3. **Implement Concrete Builders** — one per product variant. Each step configures the product being assembled.

4. **Add a `build()` method** (or `getResult()`) that returns the finished product. The builder should be reset after each `build()` call.

5. **(Optional) Add a Director class** that hardcodes step sequences for common presets. Clients can also use the builder directly without a director.

6. **Client code** creates a builder, optionally passes it to a director, then calls `build()` for the product.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
// Telescoping constructor — argument order is the only documentation.
const basicHouse   = new House(4, "flat", 1);
const luxuryHouse  = new House(4, "mansard", 3, true, true, true, true);
const confusing    = new House(4, "gable", 2, false, true, false, true);
```

Problems:
- `false, true, false, true` is unreadable without looking at the constructor signature.
- Adding a new optional feature requires updating every call site.
- No way to share the "luxury house" recipe without duplicating the argument list.

### After (solution) — `solution/index.ts`

```typescript
const basic = new HouseBuilder()
  .setWalls(4).setRoof("flat").build();

const luxury = new HouseBuilder()
  .setWalls(4).setRoof("mansard")
  .addGarage().addPool().addGarden().addStatues()
  .build();
```

Benefits:
- Each step is self-documenting — `.addGarage()` is unambiguous.
- New features add a method; no existing calls break.
- The Director can encode and name reusable recipes.

---

## When to Use

- **You need to create complex objects with many optional components** and you want to avoid telescoping constructors.
- **You want to produce different representations** of the same object using the same construction process.
- **You need to build objects step-by-step**, sometimes deferring or conditionally including steps.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Self-documenting, readable construction | More classes to manage (Builder, Director, Product) |
| New parameters don't break existing builds | Overkill for simple objects with few fields |
| Same Director can produce different products with different builders | The product must be mutable during construction |
| Supports fluent interfaces | |

---

## Relations with Other Patterns

- **Factory Method** creates objects in one step. Builder assembles them step-by-step.
- **Abstract Factory** creates families of related objects in a single call. Builder produces one complex product incrementally.
- **Composite**: Builders are often used to construct Composite trees.
- **Fluent Interface**: Builder's step-by-step API naturally enables method chaining.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `House` constructed with a 7-parameter telescoping constructor |
| `solution/index.ts` | Refactored with `HouseBuilder` and `Director` |
| `solution/index.test.ts` | Verifies that builder steps produce the correct product fields |

**Challenge:** implement a `ManorHouseBuilder` that produces a `Manor` object (with a moat and tower) using the same Director — without changing `Director` or `HouseBuilder`.
