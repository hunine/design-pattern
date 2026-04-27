# Visitor

**Category:** Behavioral

---

## Intent

Visitor is a behavioral design pattern that lets you **add new operations to existing objects without modifying them**.

The key idea: separate the algorithm from the objects it operates on. You define a `Visitor` class that implements a `visit(element)` method for each element type. Elements accept visitors via `accept(visitor)`.

---

## The Problem

Geometry shape classes need to support new operations (export to XML, render to SVG, calculate area). Each new operation requires adding a method to every shape:

```typescript
class Circle {
  area(): number         { return Math.PI * this.radius ** 2; }
  exportToXML(): string  { return `<circle radius="${this.radius}" />`; }  // new operation added
  renderToSVG(): string  { return `<circle r="${this.radius}" />`; }      // another new operation
}

class Rectangle {
  area(): number         { return this.width * this.height; }
  exportToXML(): string  { return `<rectangle width="${this.width}" height="${this.height}" />`; }
  renderToSVG(): string  { return `<rect width="${this.width}" height="${this.height}" />`; }
}
```

Problems:
- **Every new operation** (JSON export, shadow rendering, collision check) requires editing every shape class.
- Shapes are **modified for unrelated reasons** — the XML exporter shouldn't force changes to `Circle`'s physics logic.
- **Violates Open/Closed**: shapes must be reopened every time a new operation is needed.
- **Bloat**: shapes accumulate all operations ever needed, becoming hard to maintain.

---

## The Solution

Define a `Visitor` interface with a `visitCircle(c)`, `visitRectangle(r)`, `visitTriangle(t)` method. Each shape implements `accept(visitor)` which calls the appropriate visit method. Adding a new operation = one new `Visitor` class:

```typescript
interface Visitor {
  visitCircle(c: Circle): string;
  visitRectangle(r: Rectangle): string;
  visitTriangle(t: Triangle): string;
}

interface Shape {
  accept(visitor: Visitor): string;
}

class Circle implements Shape {
  constructor(readonly radius: number) {}
  accept(visitor: Visitor): string { return visitor.visitCircle(this); }
  // No more exportToXML / renderToSVG methods here!
}

class XMLExportVisitor implements Visitor {
  visitCircle(c: Circle): string     { return `<circle radius="${c.radius}" />`; }
  visitRectangle(r: Rectangle): string { return `<rectangle width="${r.width}" height="${r.height}" />`; }
  visitTriangle(t: Triangle): string  { return `<triangle base="${t.base}" height="${t.height}" />`; }
}

class SVGRenderVisitor implements Visitor {
  visitCircle(c: Circle): string     { return `<circle r="${c.radius}" />`; }
  visitRectangle(r: Rectangle): string { return `<rect width="${r.width}" height="${r.height}" />`; }
  visitTriangle(t: Triangle): string  { return `<polygon points="..." />`; }
}

const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6), new Triangle(3, 8)];
const xmlVisitor = new XMLExportVisitor();
shapes.forEach((s) => console.log(s.accept(xmlVisitor)));
```

Adding `CollisionVisitor` = one new class. Zero changes to `Circle`, `Rectangle`, `Triangle`.

---

## Structure

```
«interface» Shape
└── accept(visitor: Visitor): string

Circle / Rectangle / Triangle
└── accept(v) → v.visitCircle(this) / v.visitRectangle(this) / v.visitTriangle(this)

«interface» Visitor
├── visitCircle(c: Circle): string
├── visitRectangle(r: Rectangle): string
└── visitTriangle(t: Triangle): string

XMLExportVisitor / SVGRenderVisitor / AreaCalculatorVisitor
└── implements all visit methods
```

### Participants

| Role | Responsibility |
|---|---|
| **Visitor** | Declares a `visit*()` method for each concrete element type |
| **Concrete Visitor** (`XMLExportVisitor`, …) | Implements the operation for each element type |
| **Element** (`Shape`) | Declares `accept(visitor)` |
| **Concrete Element** (`Circle`, …) | Implements `accept()` by calling the appropriate `visit` method on the visitor |

---

## How to Implement

1. **Declare the Visitor interface** with one `visit*(element)` method per concrete element type.

2. **Implement Concrete Visitors** — one per operation. Each visit method contains the operation logic for that element type.

3. **Declare the `accept(visitor)` method** in the Element interface.

4. **Implement `accept()` in each concrete element** by calling `visitor.visitConcreteElement(this)`.

5. **Remove operation methods** from element classes (they now live in visitor classes).

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class Circle {
  area(): number        { return Math.PI * this.radius ** 2; }
  exportToXML(): string { return `<circle radius="${this.radius}" />`; }
  renderToSVG(): string { return `<circle r="${this.radius}" />`; }
}
// Same for Rectangle and Triangle. Adding "exportToJSON" = 3 more methods across 3 classes.
```

Problems:
- Shape classes grow with every new operation requirement.
- Operations on shapes are scattered across the shapes themselves.
- Adding `Triangle` to an existing operation requires finding and editing the visitor-like code inside each operation.

### After (solution) — `solution/index.ts`

```typescript
const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6), new Triangle(3, 8)];
shapes.forEach((s) => console.log(s.accept(new XMLExportVisitor())));
shapes.forEach((s) => console.log(s.accept(new SVGRenderVisitor())));
shapes.forEach((s) => console.log(`Area: ${s.accept(new AreaVisitor())}`));
```

Benefits:
- Shapes have no operation methods — they stay focused on geometry.
- Each visitor is one cohesive operation across all shapes.
- Adding `JSONExportVisitor` = one new class; shapes unchanged.

---

## When to Use

- **You need to perform many distinct, unrelated operations** on an object structure without polluting their classes.
- **The object structure rarely changes** (adding a new element type requires updating all visitors), but new operations are added frequently.
- **You want to accumulate state** while traversing a complex structure (e.g., building a report).

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Open/Closed: add new operations without changing elements | Closed against new element types — adding a new shape requires updating all visitors |
| Single Responsibility: operations are colocated per visitor | Visitors need access to element internals — may require breaking encapsulation |
| Accumulate state while visiting multiple elements | Indirection (`accept` → `visit`) can be confusing to trace |

---

## Relations with Other Patterns

- **Composite**: Visitor can traverse a Composite tree and operate on each node.
- **Iterator**: iterate a structure with an iterator and apply a visitor at each step.
- **Command**: Visitor is like a command applied to an element type — but dispatched via double dispatch instead of explicit invocation.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `Circle`, `Rectangle`, `Triangle` each have `exportToXML()`, `renderToSVG()`, `area()` methods |
| `solution/index.ts` | `Visitor` interface; `XMLExportVisitor`, `SVGRenderVisitor`, `AreaVisitor`; shapes only have `accept()` |
| `solution/index.test.ts` | Verifies each visitor produces correct output for each shape |

**Challenge:** add a `JSONExportVisitor` that returns `{"type":"circle","radius":5}` style output — without modifying any shape class.
