# Decorator

**Category:** Structural  
**Also known as:** Wrapper

---

## Intent

Decorator is a structural design pattern that lets you **attach new behaviours to objects by placing them inside wrapper objects** that contain the behaviours.

The key idea: a decorator implements the same interface as the object it wraps. Callers can't tell the difference — they just call the interface method. You can stack decorators like layers on an onion.

---

## The Problem

A coffee shop has `Coffee` and wants to support add-ons: milk, sugar, vanilla, caramel. The naive approach creates one subclass per combination:

```
Coffee
├── CoffeeWithMilk
├── CoffeeWithSugar
├── CoffeeWithMilkAndSugar
├── CoffeeWithVanilla
├── CoffeeWithMilkAndVanilla
└── ... still missing: CoffeeWithSugarAndVanilla, CoffeeWithMilkSugarAndVanilla ...
```

With 4 add-ons, there are up to **16 subclasses**. With 5, there are 32. Adding one new ingredient (caramel) requires creating N new classes for every existing combination. This is the **subclass explosion** anti-pattern.

---

## The Solution

Make each add-on a **decorator** that wraps a `Coffee` object and adds its own price and description:

```typescript
interface Coffee {
  cost(): number;
  description(): string;
}

class PlainCoffee implements Coffee {
  cost() { return 2.0; }
  description() { return "Plain coffee"; }
}

abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}
  cost(): number { return this.coffee.cost(); }
  description(): string { return this.coffee.description(); }
}

class MilkDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 0.5; }
  description() { return this.coffee.description() + ", milk"; }
}

// Stack decorators at runtime — any combination, any order.
const order = new VanillaDecorator(new MilkDecorator(new PlainCoffee()));
console.log(`${order.description()}: $${order.cost()}`);
// "Plain coffee, milk, vanilla: $3.00"
```

3 add-on classes cover all 8 combinations (2³). Adding a 4th add-on is one new class — not 8.

---

## Structure

```
«interface» Coffee
├── cost(): number
└── description(): string
     │
     ├── PlainCoffee (Concrete Component)
     │
     └── CoffeeDecorator (Base Decorator)
          ├── coffee: Coffee   ← wraps another Coffee
          ├── MilkDecorator (Concrete Decorator)
          ├── SugarDecorator
          └── VanillaDecorator
```

### Participants

| Role | Responsibility |
|---|---|
| **Component** (`Coffee`) | Common interface for both the core object and all decorators |
| **Concrete Component** (`PlainCoffee`) | The base object being decorated |
| **Base Decorator** (`CoffeeDecorator`) | Wraps a `Coffee`; delegates all calls by default |
| **Concrete Decorator** (`MilkDecorator`, …) | Extends the base decorator to add/modify behaviour |

---

## How to Implement

1. **Identify the interface** (or abstract class) for the core component.

2. **Create the Concrete Component** — the base object without any extras.

3. **Create a Base Decorator** that implements the same interface and holds a reference to a wrapped component. All methods delegate to the wrapped object.

4. **Create Concrete Decorators** by extending the base decorator. Override only the methods you need to augment.

5. **Compose in client code**: wrap the base object in as many decorators as needed. Order matters — the outermost decorator's method runs first.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class CoffeeWithMilkAndSugar extends Coffee {
  cost() { return 2.75; }
  description() { return "Coffee with milk and sugar"; }
}
// Missing: CoffeeWithSugarAndVanilla, CoffeeWithMilkSugarAndVanilla...
// Each new ingredient doubles the number of required classes.
```

Problems:
- Exponential class growth — 16 classes for 4 add-ons.
- Adding `caramel` requires adding `CoffeeWithCaramel`, `CoffeeWithMilkAndCaramel`, etc.
- Each class duplicates cost and description logic.

### After (solution) — `solution/index.ts`

```typescript
// Any combination, composed at runtime.
const simple   = new MilkDecorator(new PlainCoffee());
const fancy    = new VanillaDecorator(new MilkDecorator(new SugarDecorator(new PlainCoffee())));
```

Benefits:
- 3 add-ons = 3 decorator classes; covers all 8 combinations.
- Adding `CaramelDecorator` is one new class — no existing code changes.
- Decorators are composable and orderable.

---

## When to Use

- **You need to add behaviour to individual objects at runtime** without affecting others of the same class.
- **You want to combine behaviours by stacking** — each layer adds or overrides one thing.
- **Subclassing is impractical** because it leads to an explosion of combinations.
- **The core object and added behaviour implement the same interface** — callers stay unaware.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Add/remove behaviours at runtime | Many small objects — hard to debug a stack of decorators |
| Combine behaviours without subclass explosion | Order of decorators can affect the result in surprising ways |
| Single Responsibility: each decorator handles one concern | Some frameworks expect plain concrete classes, not wrapped objects |
| Open/Closed: add decorators without changing existing code | |

---

## Relations with Other Patterns

- **Adapter** changes an object's interface. Decorator keeps the same interface but adds behaviour.
- **Composite** aggregates multiple children into one. Decorator wraps exactly one object.
- **Strategy** changes the guts of an object. Decorator changes the skin (adds behaviour from outside).
- **Proxy** controls access; Decorator augments behaviour. Both use the same wrapper structure.
- **Chain of Responsibility** passes a request along a chain. Decorator always forwards to the wrapped object.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Subclass explosion — one class per add-on combination |
| `solution/index.ts` | `CoffeeDecorator` base + `MilkDecorator`, `SugarDecorator`, `VanillaDecorator` |
| `solution/index.test.ts` | Verifies that stacked decorators produce correct cost and description |

**Challenge:** add a `CaramelDecorator` (+$0.75) and verify that `CaramelDecorator(MilkDecorator(PlainCoffee))` works without modifying any existing class.
