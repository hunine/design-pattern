# Abstract Factory

**Category:** Creational  
**Also known as:** Kit

---

## Intent

Abstract Factory is a creational design pattern that lets you produce **families of related objects** without specifying their concrete classes.

The key idea: define an interface for a factory that creates a set of related objects (e.g., `Button + Checkbox`). Swap the whole factory to get a different family of objects (e.g., Windows vs Mac widgets) — without changing any code that uses them.

---

## The Problem

Imagine you're building a cross-platform UI toolkit that renders `Button` and `Checkbox` for Windows and Mac. The naive approach puts an OS check everywhere widgets are needed:

```
// OS check duplicated every time a widget is needed
function renderUI(os: string): void {
  if (os === "windows") {
    const button   = new WindowsButton();
    const checkbox = new WindowsCheckbox();
  } else if (os === "mac") {
    const button   = new MacButton();
    const checkbox = new MacCheckbox();
  }
  // Adding Linux requires editing every block like this
}
```

Problems:
- The `if/else` OS check is **copied everywhere** widgets are created.
- Adding a new platform (Linux) means touching every place in the codebase.
- It's easy to accidentally mix Windows buttons with Mac checkboxes — no compile-time guarantee they belong to the same family.

---

## The Solution

Define a `UIFactory` interface with a creation method for each widget. One concrete factory per platform implements the full family. Client code only talks to the factory interface — it never calls `new WindowsButton()` directly.

```
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class WindowsFactory implements UIFactory {
  createButton(): Button   { return new WindowsButton(); }
  createCheckbox(): Checkbox { return new WindowsCheckbox(); }
}

class MacFactory implements UIFactory {
  createButton(): Button   { return new MacButton(); }
  createCheckbox(): Checkbox { return new MacCheckbox(); }
}

// Client uses only the factory interface — no platform checks.
function renderUI(factory: UIFactory): void {
  const button   = factory.createButton();
  const checkbox = factory.createCheckbox();
  console.log(button.render());
  console.log(checkbox.render());
}
```

Adding Linux only requires one new `LinuxFactory` class — zero changes to `renderUI` or any other client.

---

## Structure

```
«interface» UIFactory (Abstract Factory)
├── createButton(): Button
└── createCheckbox(): Checkbox
     │
     ├── WindowsFactory (Concrete Factory A)
     │    ├── createButton()   → WindowsButton
     │    └── createCheckbox() → WindowsCheckbox
     │
     └── MacFactory (Concrete Factory B)
          ├── createButton()   → MacButton
          └── createCheckbox() → MacCheckbox

«interface» Button (Abstract Product A)     «interface» Checkbox (Abstract Product B)
├── WindowsButton                            ├── WindowsCheckbox
└── MacButton                               └── MacCheckbox
```

### Participants

| Role | Responsibility |
|---|---|
| **Abstract Factory** (`UIFactory`) | Declares creation methods for each product in the family |
| **Concrete Factory** (`WindowsFactory`, `MacFactory`) | Implements creation methods; guarantees products are compatible |
| **Abstract Product** (`Button`, `Checkbox`) | Declares the interface each product must implement |
| **Concrete Product** (`WindowsButton`, …) | Implements the abstract product interface for one platform |

---

## How to Implement

1. **Map out the product families**: list the distinct product types (Button, Checkbox) and the variants for each family (Windows, Mac).

2. **Declare abstract product interfaces** — one interface per product type.

3. **Implement concrete products** — one class per variant per type.

4. **Declare the Abstract Factory interface** with a `create*()` method for each abstract product.

5. **Implement concrete factories** — one factory class per family. Each method returns a product from that family.

6. **Wire up the factory at the entry point** (e.g., based on OS detection or config), then inject it into client code. Client code should depend only on the factory interface and product interfaces.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
function renderUI(os: string): void {
  let button: WindowsButton | MacButton;
  let checkbox: WindowsCheckbox | MacCheckbox;

  if (os === "windows") {
    button = new WindowsButton();       // duplicated OS check
    checkbox = new WindowsCheckbox();
  } else if (os === "mac") {
    button = new MacButton();
    checkbox = new MacCheckbox();
  } else {
    throw new Error(`Unsupported OS: ${os}`);
  }

  console.log(button.render());
  console.log(checkbox.render());
}
```

Problems:
- `if/else` is repeated in every function that needs widgets.
- Mixing `MacButton` with `WindowsCheckbox` is not caught at compile time.
- Adding Linux requires editing this block — and every similar block.

### After (solution) — `solution/index.ts`

```typescript
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

function renderUI(factory: UIFactory): void {
  const button   = factory.createButton();
  const checkbox = factory.createCheckbox();
  console.log(button.render());
  console.log(checkbox.render());
}

// Swap the whole family by passing a different factory.
renderUI(new WindowsFactory());
renderUI(new MacFactory());
```

Benefits:
- Products are guaranteed to be compatible — the factory is the single source of truth.
- Adding a platform = one new factory class; zero changes to client code.
- Each platform's creation logic is colocated in its factory.

---

## When to Use

- **Your code needs to work with multiple families of related products**, but you want to avoid depending on their concrete classes.
- **You want to enforce that products from the same family are always used together** — no accidental mixing.
- **You want to swap entire product families at runtime** (e.g., light theme vs dark theme, Windows vs Mac).

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Products from the same factory are always compatible | New product types require changes to every factory (add a new interface method everywhere) |
| Eliminates tight coupling between client and concrete products | Can introduce many classes — one per variant per type |
| Single Responsibility: creation code lives in the factory | Harder to identify which factory to use without a composition root |
| Open/Closed: add new families without changing client code | |

---

## Relations with Other Patterns

- **Factory Method** is simpler — one product, one method. Abstract Factory groups a family of factory methods.
- **Builder** focuses on constructing a complex object step-by-step. Abstract Factory creates families of related objects in one shot.
- **Prototype** can be used inside a concrete factory to clone product templates.
- **Singleton**: concrete factories are often implemented as Singletons — one factory per application is usually enough.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | OS check duplicated every place `Button` and `Checkbox` are created |
| `solution/index.ts` | Refactored with `UIFactory`, `WindowsFactory`, `MacFactory` |
| `solution/index.test.ts` | Verifies each factory produces compatible, correctly-behaving products |

**Challenge:** add a `LinuxFactory` with `LinuxButton` and `LinuxCheckbox` without touching `renderUI` or any existing factory.
