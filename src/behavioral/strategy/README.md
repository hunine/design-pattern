# Strategy

**Category:** Behavioral  
**Also known as:** Policy

---

## Intent

Strategy is a behavioral design pattern that lets you **define a family of algorithms, put each of them into a separate class, and make their objects interchangeable**.

The key idea: the context object holds a reference to a strategy object. Clients can swap strategies at runtime without changing the context class.

---

## The Problem

A `Navigator` class contains all routing algorithms as private methods:

```typescript
class Navigator {
  buildRoute(from: string, to: string): string {
    if (this.routeType === "car") {
      return this.buildCarRoute(from, to);
    } else if (this.routeType === "walking") {
      return this.buildWalkingRoute(from, to);
    } else if (this.routeType === "transit") {
      return this.buildTransitRoute(from, to);
    } else if (this.routeType === "cycling") {
      return this.buildCyclingRoute(from, to);
    }
    throw new Error(`Unknown route type: ${this.routeType}`);
  }

  private buildCarRoute(from: string, to: string): string { ... }
  private buildWalkingRoute(from: string, to: string): string { ... }
  // ...
}
```

Problems:
- **Bloated class**: every new algorithm makes `Navigator` larger.
- **Adding a new algorithm** requires modifying `Navigator` — violating Open/Closed.
- **Private methods can't be tested independently** — you always go through the full Navigator.
- **Algorithms can't be reused** in other contexts (e.g., a `RoutePlanner` service).
- **No runtime swapping**: strategy is set at construction and can't change.

---

## The Solution

Extract each algorithm into its own `RouteStrategy` class. `Navigator` holds a reference to a strategy and delegates:

```typescript
interface RouteStrategy {
  buildRoute(from: string, to: string): string;
}

class CarStrategy implements RouteStrategy {
  buildRoute(from: string, to: string): string {
    return `Car route: ${from} → highway → ${to} (fastest road path)`;
  }
}

class WalkingStrategy implements RouteStrategy {
  buildRoute(from: string, to: string): string {
    return `Walking route: ${from} → sidewalks → ${to} (shortest walking path)`;
  }
}

class Navigator {
  constructor(private strategy: RouteStrategy) {}

  setStrategy(s: RouteStrategy): void { this.strategy = s; }

  buildRoute(from: string, to: string): string {
    return this.strategy.buildRoute(from, to);
  }
}

const nav = new Navigator(new CarStrategy());
console.log(nav.buildRoute("Home", "Office"));

nav.setStrategy(new WalkingStrategy()); // swap at runtime
console.log(nav.buildRoute("Home", "Park"));
```

---

## Structure

```
Navigator (Context)
├── strategy: RouteStrategy
├── setStrategy(s: RouteStrategy)
└── buildRoute(from, to) → strategy.buildRoute(from, to)

«interface» RouteStrategy
└── buildRoute(from: string, to: string): string
     │
     ├── CarStrategy
     ├── WalkingStrategy
     ├── TransitStrategy
     └── CyclingStrategy
```

### Participants

| Role | Responsibility |
|---|---|
| **Context** (`Navigator`) | Holds a strategy reference; delegates the algorithm call |
| **Strategy** (`RouteStrategy`) | Declares the algorithm interface |
| **Concrete Strategy** (`CarStrategy`, …) | Implements a specific algorithm |
| **Client** | Selects and injects the strategy into the context |

---

## How to Implement

1. **Identify the varying algorithm** in a class — the part that changes between variants.

2. **Declare a Strategy interface** with the algorithm method.

3. **Extract each variant** into its own Concrete Strategy class that implements the interface.

4. **Refactor the context class**: replace the conditionals with a `strategy` field. Add a `setStrategy()` setter.

5. **Inject strategies in client code**: create the context with an initial strategy; swap via `setStrategy()` as needed.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class Navigator {
  buildRoute(from: string, to: string): string {
    if (this.routeType === "car") return this.buildCarRoute(from, to);
    else if (this.routeType === "walking") return this.buildWalkingRoute(from, to);
    // ...
  }
  private buildCarRoute(...) { ... }     // untestable in isolation
  private buildWalkingRoute(...) { ... } // untestable in isolation
}
```

Problems:
- All algorithms inside one class — hard to maintain, impossible to test independently.
- Adding cycling = editing `Navigator`, `buildRoute`, adding another private method.
- No runtime swapping.

### After (solution) — `solution/index.ts`

```typescript
// Test each algorithm independently.
const car = new CarStrategy();
expect(car.buildRoute("A", "B")).toContain("highway");

// Swap at runtime.
const nav = new Navigator(new CarStrategy());
nav.setStrategy(new TransitStrategy());
```

Benefits:
- Each strategy is a small, focused, independently testable class.
- Adding `CyclingStrategy` = one new class; `Navigator` unchanged.
- Strategy can be swapped at runtime based on user preference or conditions.

---

## When to Use

- **You want to switch between different algorithms at runtime**.
- **You have many similar classes that differ only in their behavior** — consolidate the context, vary the strategy.
- **The algorithm has a complex conditional** that selects one of several variants.
- **You need to hide algorithmic details** from the client (e.g., sorting, compression, payment processing).

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Swap algorithms at runtime | Clients must be aware of the differences between strategies to choose one |
| Open/Closed: add new strategies without changing the context | Overkill if you only have 2–3 algorithms that rarely change |
| Single Responsibility: each strategy is one algorithm | Extra classes for every algorithm |
| Algorithms can be tested independently | |

---

## Relations with Other Patterns

- **State**: both use delegation to a swappable object. In State, the object transitions itself; in Strategy, the client chooses.
- **Template Method**: Template Method uses inheritance to vary algorithm steps; Strategy uses composition to replace the whole algorithm.
- **Decorator**: changes the skin (adds behaviour). Strategy changes the guts (replaces the algorithm).
- **Command**: Commands can use Strategies for their `execute()` logic.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `Navigator` with all algorithms as private methods and a big `if/else` |
| `solution/index.ts` | `RouteStrategy` interface + `CarStrategy`, `WalkingStrategy`, `TransitStrategy`, `CyclingStrategy` |
| `solution/index.test.ts` | Verifies each strategy in isolation and runtime swapping via `setStrategy()` |

**Challenge:** add a `BikeShareStrategy` that routes through bike-share docking stations. Use it with the existing `Navigator` without modifying `Navigator` or any existing strategy.
