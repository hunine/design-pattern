# Bridge

**Category:** Structural

---

## Intent

Bridge is a structural design pattern that lets you **split a large class (or a set of closely related classes) into two separate hierarchies** — abstraction and implementation — which can be developed independently of each other.

The key idea: instead of inheriting the implementation, the abstraction *holds a reference* to an implementation object. You can swap implementations at runtime.

---

## The Problem

You have shapes and colors. Without Bridge, each combination needs its own subclass:

```
Circle → RedCircle, BlueCircle
Square → RedSquare, BlueSquare
```

Add a third color (Green) → 2 more classes.  
Add a third shape (Triangle) → 3 more classes.  
With N shapes and M colors, you need **N × M subclasses**.

```typescript
class RedCircle extends Circle {
  draw(): string { return `Drawing RED Circle with radius ${this.radius}`; }
}
class BlueSquare extends Square {
  draw(): string { return `Drawing BLUE Square with side ${this.side}`; }
}
// 4 combinations now. 9 with 3 shapes × 3 colors. 16 with 4 × 4. Impossible.
```

This is the **combinatorial explosion** anti-pattern — inheritance is the wrong tool when two dimensions vary independently.

---

## The Solution

Extract color into its own interface (`Color`) and give `Shape` a *reference* to a `Color` implementation. Shapes and colors can vary independently:

```typescript
interface Color {
  fill(): string;
}

class Red implements Color { fill() { return "red"; } }
class Blue implements Color { fill() { return "blue"; } }

abstract class Shape {
  constructor(protected color: Color) {}
  abstract draw(): string;
}

class Circle extends Shape {
  constructor(private radius: number, color: Color) { super(color); }
  draw() { return `Drawing ${this.color.fill()} Circle r=${this.radius}`; }
}
```

3 shapes + 3 colors = **6 classes** (not 9). Each new shape or color is one class, not N.

---

## Structure

```
Shape (Abstraction)
├── color: Color   ← bridge reference to the Implementation
└── draw(): string (abstract)
     │
     ├── Circle (Refined Abstraction)
     └── Square  (Refined Abstraction)

«interface» Color (Implementation)
└── fill(): string
     │
     ├── Red (Concrete Implementation)
     └── Blue (Concrete Implementation)
```

### Participants

| Role | Responsibility |
|---|---|
| **Abstraction** (`Shape`) | High-level interface; holds a reference to an Implementation |
| **Refined Abstraction** (`Circle`, `Square`) | Extends the Abstraction with specific behavior |
| **Implementation** (`Color`) | Declares the interface for implementation classes |
| **Concrete Implementation** (`Red`, `Blue`) | Provides a specific implementation |

---

## How to Implement

1. **Identify the two independent dimensions**: in the example, Shape (what) and Color (how it's rendered).

2. **Extract the Implementation dimension** into its own interface (`Color`).

3. **Create Concrete Implementations** — one per variant in the implementation dimension.

4. **Keep the Abstraction class** but give it a field of the Implementation interface type. Delegate implementation-specific work to that field.

5. **Refined Abstractions** extend the base abstraction for additional shape-specific behaviour.

6. **Client code** composes any shape with any color at instantiation time.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class RedCircle extends Circle { draw() { return `Drawing RED Circle...`; } }
class BlueCircle extends Circle { draw() { return `Drawing BLUE Circle...`; } }
class RedSquare extends Square { draw() { return `Drawing RED Square...`; } }
class BlueSquare extends Square { draw() { return `Drawing BLUE Square...`; } }

// To add GreenTriangle: add Triangle, GreenTriangle, RedTriangle, BlueTriangle...
```

Problems:
- N × M subclasses for N shapes and M colors.
- Every new color or shape multiplies the class count.
- Logic for "what is red" is scattered across `RedCircle`, `RedSquare`, etc.

### After (solution) — `solution/index.ts`

```typescript
const shapes = [
  new Circle(5, new Red()),
  new Circle(3, new Blue()),
  new Square(4, new Red()),
  new Square(7, new Blue()),
];
shapes.forEach((s) => console.log(s.draw()));
```

Benefits:
- 3 shapes + 3 colors = 6 classes. Not 9.
- Colors and shapes are testable in isolation.
- Swap colors at runtime: `circle.color = new Green()`.

---

## When to Use

- **You want to avoid a permanent binding** between abstraction and implementation.
- **Both abstractions and implementations should be extensible via subclassing**.
- **Changes to the implementation should not affect the client** (they only know the abstraction).
- **You have a proliferating class hierarchy** caused by combining two dimensions.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| No subclass explosion | Increases number of classes |
| Open/Closed: add shapes and colors independently | Abstraction and implementation must be identified up-front |
| Single Responsibility: shape logic vs rendering logic | Can over-engineer simple hierarchies |
| Swap implementations at runtime | |

---

## Relations with Other Patterns

- **Adapter** bridges *existing, incompatible* interfaces after the fact. Bridge is planned up-front.
- **Abstract Factory** can be used to build the implementation side of a Bridge.
- **Strategy** also uses composition to switch algorithms. Bridge focuses on structural separation; Strategy on behavioral interchangeability.
- **Decorator** adds responsibilities dynamically. Bridge separates a hierarchy into two.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `RedCircle`, `BlueCircle`, `RedSquare`, `BlueSquare` — subclass explosion |
| `solution/index.ts` | `Shape + Color` bridge — shapes and colors as independent hierarchies |
| `solution/index.test.ts` | Verifies any shape can be combined with any color |

**Challenge:** add a `Triangle` shape and a `Green` color. Verify you only need to write 2 new classes — not 4.
