# Factory Method

**Category:** Creational  
**Also known as:** Virtual Constructor

---

## Intent

Factory Method is a creational design pattern that provides an **interface for creating objects in a superclass**, but allows subclasses to **alter the type of objects that will be created**.

The key idea: instead of calling `new ConcreteProduct()` directly, you call a *factory method* that returns the object. Subclasses override that method to return a different type of object.

---

## The Problem

Imagine you are building a logistics app. The first version only handles **Truck** deliveries, so the entire codebase is full of calls to `new Truck()`.

Later, the business wants to add **Ship** deliveries. Because `Truck` is hardcoded everywhere, you now have to:

1. Find every place that instantiates `Truck`.
2. Add an `if/else` or `switch` to decide between `Truck` and `Ship`.
3. Repeat this in every file that creates transport objects.

And if a third transport type (Airplane, Drone, …) is needed, you go through the same pain again. The code accumulates type-checks and becomes brittle.

```
// Before — rigid, coupled to Truck
function planDelivery(type: string) {
  if (type === "land") {
    const truck = new Truck();   // hardcoded
    truck.deliver(cargo);
  } else {
    const ship = new Ship();     // added later, now scattered everywhere
    ship.deliver(cargo);
  }
}
```

---

## The Solution

Replace direct object construction with a **factory method**:

1. Declare a common interface (`Transport`) that all products must implement.
2. Create an abstract `Logistics` class with a factory method `createTransport()`.
3. Each subclass (`RoadLogistics`, `SeaLogistics`) overrides the factory method to return its own product.
4. The base class's business logic (`planDelivery`) calls the factory method — it never mentions a concrete class.

```
abstract class Logistics {
  // Factory method — subclasses decide what to create.
  abstract createTransport(): Transport;

  // Business logic uses the interface, not a concrete type.
  planDelivery(cargo: string): string {
    const transport = this.createTransport();
    return transport.deliver(cargo);
  }
}

class RoadLogistics extends Logistics {
  createTransport(): Transport {
    return new Truck();   // decision is here, isolated
  }
}

class SeaLogistics extends Logistics {
  createTransport(): Transport {
    return new Ship();
  }
}
```

Adding **AirLogistics** only requires a new subclass — zero changes to existing code.

---

## Structure

```
Logistics (Creator)
├── planDelivery()            ← uses Transport interface
└── createTransport(): Transport   ← factory method (abstract)
     │
     ├── RoadLogistics (Concrete Creator)
     │    └── createTransport() → new Truck()
     │
     └── SeaLogistics (Concrete Creator)
          └── createTransport() → new Ship()

«interface» Transport (Product)
└── deliver(cargo): string
     │
     ├── Truck (Concrete Product)
     └── Ship  (Concrete Product)
```

### Participants

| Role | Responsibility |
|---|---|
| **Creator** (`Logistics`) | Declares the factory method; contains business logic that uses the Product interface |
| **Concrete Creator** (`RoadLogistics`) | Overrides the factory method to return a specific Concrete Product |
| **Product** (`Transport`) | Defines the interface all products must implement |
| **Concrete Product** (`Truck`, `Ship`) | Implements the Product interface |

---

## How to Implement

1. **Define the Product interface.** All products must implement the same interface so the creator can use them interchangeably.

2. **Create an abstract Creator class** with the factory method returning the Product interface type. The creator's other methods should call this factory method instead of `new`.

3. **Create Concrete Creators** — one per product variant. Each overrides the factory method and returns the appropriate product.

4. **Remove direct `new` calls** from existing code. Replace with calls to the factory method.

5. **Wire up the creator** at the entry point (e.g., based on config or environment) and pass it down as a dependency — callers work with the abstract Creator type.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
// Direct instantiation scattered across functions
function createTransport(type: string): Truck | Ship {
  if (type === "truck") return new Truck();   // add Ship? edit here
  if (type === "ship")  return new Ship();    // add Plane? edit here too
  throw new Error(`Unknown type: ${type}`);
}

function planDelivery(cargoType: string): void {
  let transport: Truck | Ship;
  if (cargoType === "land") transport = new Truck(); // duplicated decision
  else                      transport = new Ship();
  console.log(transport.deliver(cargoType));
}
```

Problems:
- `new Truck()` / `new Ship()` are duplicated across multiple functions.
- Adding a new transport requires editing every site that creates one.
- `planDelivery` mixes object creation with business logic.
- Type union `Truck | Ship` grows with every new product.

### After (solution) — `solution/index.ts`

```typescript
interface Transport {
  deliver(cargo: string): string;
}

abstract class Logistics {
  abstract createTransport(): Transport;   // factory method

  planDelivery(cargo: string): string {   // pure business logic
    return this.createTransport().deliver(cargo);
  }
}

class RoadLogistics extends Logistics {
  createTransport(): Transport { return new Truck(); }
}

class SeaLogistics extends Logistics {
  createTransport(): Transport { return new Ship(); }
}
```

Benefits:
- `planDelivery` never mentions `Truck` or `Ship` — it only uses `Transport`.
- Adding `AirLogistics` is a new file; no existing files change.
- The creation decision is in exactly one place per product.

---

## When to Use

- **You don't know ahead of time** which class your code will work with.
- **You want to give library/framework users** a way to extend its internal components by subclassing.
- **You want to save system resources** by reusing existing objects instead of creating new ones (the factory method can return a cached instance).
- **Object creation logic is complex or varies** between product types and you want to isolate that complexity.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Avoids tight coupling between creator and concrete products | Code can become more complex — you introduce many new subclasses |
| Single Responsibility: creation code lives in one place | The pattern only works if you can subclass the creator |
| Open/Closed: add new products without breaking existing code | |
| Supports polymorphic creation — works with any product type | |

---

## Relations with Other Patterns

- **Abstract Factory** is often implemented using Factory Methods. It groups a family of related factory methods.
- **Template Method** has a similar structure — a base class defines the skeleton, subclasses fill in the steps. Factory Method *is* a specialisation of Template Method focused on object creation.
- **Prototype** doesn't require subclassing but needs a complex initialisation step. Factory Method requires subclassing but not initialisation.
- **Dependency Injection** is the runtime counterpart — instead of a factory method, you inject the product from outside the creator.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Logistics app with `new Truck()` / `new Ship()` scattered everywhere |
| `solution/index.ts` | Refactored using Factory Method — try writing this yourself first |
| `solution/index.test.ts` | Tests that verify both implementations behave identically |

**Challenge:** extend the solution with an `AirLogistics` that returns a `Plane` without touching any existing class.
