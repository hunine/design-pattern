# Composite

**Category:** Structural  
**Also known as:** Object Tree

---

## Intent

Composite is a structural design pattern that lets you **compose objects into tree structures** and then work with these structures **as if they were individual objects**.

The key idea: both individual items (leaves) and containers (composites) implement the same interface. Client code calls `getPrice()` on any node — it doesn't need to know if it's a leaf or a branch.

---

## The Problem

An order system has `Product` (leaf) and `Box` (container). Calculating the total requires knowing which type each item is:

```typescript
function calculateTotal(item: Product | Box): number {
  if (item instanceof Product) {
    return item.price;
  }
  // Must know Box exposes `.items` and manually recurse.
  let total = 0;
  for (const child of item.items) {
    if (child instanceof Product) {
      total += child.price;
    } else if (child instanceof Box) {
      total += calculateTotal(child); // duplicated recursion
    }
  }
  return total;
}
```

Problems:
- **`instanceof` checks pollute client code** — it must know the class hierarchy.
- **Recursion is manual and duplicated** every time you need to traverse the tree.
- **Not extensible**: adding a `GiftWrap` container means updating `calculateTotal` and every other traversal.
- **Box internals are exposed**: client directly accesses `box.items`.

---

## The Solution

Make both `Product` and `Box` implement the same `Component` interface with a `getPrice()` method. `Box.getPrice()` recursively sums its children — the client never needs to know it's a box:

```typescript
interface Component {
  getPrice(): number;
}

class Product implements Component {
  constructor(private name: string, private price: number) {}
  getPrice(): number { return this.price; }
}

class Box implements Component {
  private children: Component[] = [];
  add(c: Component): void { this.children.push(c); }
  getPrice(): number {
    return this.children.reduce((sum, c) => sum + c.getPrice(), 0);
  }
}

// Uniform call — works for Product or any depth of Box.
console.log(`Total: $${bigBox.getPrice()}`);
```

---

## Structure

```
«interface» Component
└── getPrice(): number
     │
     ├── Product (Leaf)
     │    └── getPrice() → this.price
     │
     └── Box (Composite)
          ├── children: Component[]
          ├── add(c: Component): void
          └── getPrice() → sum of children.getPrice()
```

### Participants

| Role | Responsibility |
|---|---|
| **Component** | Common interface for leaves and composites |
| **Leaf** (`Product`) | Has no children; implements the operation directly |
| **Composite** (`Box`) | Stores child components; delegates operations to children |
| **Client** | Works through the Component interface; unaware of leaf vs composite |

---

## How to Implement

1. **Identify a recursive tree structure** — something that can contain either leaves or containers of the same type.

2. **Declare a Component interface** with the operation(s) that make sense for both leaves and composites (e.g., `getPrice()`).

3. **Implement the Leaf class** — a simple implementation of the operation with no children.

4. **Implement the Composite class** with a `children: Component[]` field and `add`/`remove` methods. Implement the operation by delegating to children.

5. **Replace all `instanceof` checks** and manual recursion in client code with a uniform call to the Component interface method.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
function calculateTotal(item: Product | Box): number {
  if (item instanceof Product) return item.price;

  let total = 0;
  for (const child of item.items) {   // knows Box has `.items`
    if (child instanceof Product) total += child.price;
    else if (child instanceof Box) total += calculateTotal(child);
  }
  return total;
}
```

Problems:
- `instanceof` checks must be updated when new container types are added.
- Recursion logic is duplicated in every traversal function.
- Box internals (`items`) are accessed directly from outside.

### After (solution) — `solution/index.ts`

```typescript
// Same call — no instanceof, no recursion in client code.
console.log(`Total: $${bigBox.getPrice()}`);
```

Benefits:
- Client code is a single line regardless of tree depth or node types.
- Adding `GiftWrap extends Box` needs zero changes to client code.
- Tree structure is fully encapsulated.

---

## When to Use

- **Your core model can be represented as a tree**: files & folders, UI widgets & containers, order items & boxes.
- **You want client code to treat leaves and composites uniformly**, without `instanceof` checks.
- **You need recursive operations** (sum, count, render) that should just "work" at any level.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Client code is simple — one interface for everything | Can make the design overly general when only leaves make sense |
| Open/Closed: add new node types without changing client | Hard to restrict which components can be children of which composites |
| Recursive operations are encapsulated inside the tree | |

---

## Relations with Other Patterns

- **Iterator** can be used to traverse a Composite tree without exposing its structure.
- **Visitor** lets you run an operation over a Composite tree without modifying the node classes.
- **Decorator** also uses a recursive structure, but adds behaviour to a single object; Composite aggregates multiple children.
- **Builder** is often used to construct complex Composite trees step-by-step.
- **Flyweight** can be applied to the leaf nodes of a Composite to reduce memory usage.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `calculateTotal` uses `instanceof` checks and manual recursion |
| `solution/index.ts` | `Product` and `Box` both implement `Component`; `getPrice()` is uniform |
| `solution/index.test.ts` | Verifies nested boxes produce the correct total |

**Challenge:** add a `GiftBox` composite that adds a fixed $5 wrapping fee to its contents' total — without changing `Product`, `Box`, or client traversal code.
