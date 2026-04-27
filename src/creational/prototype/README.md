# Prototype

**Category:** Creational  
**Also known as:** Clone

---

## Intent

Prototype is a creational design pattern that lets you **copy existing objects** without making your code dependent on their classes.

The key idea: delegate the cloning responsibility to the object being cloned. The object knows its own structure, so it can perform a correct deep copy.

---

## The Problem

Imagine you need a copy of a `UserProfile` object. Without a pattern, you copy field-by-field manually:

```typescript
const clone = new UserProfile(
  original.name,
  original.age,
  original.email,
  original.address, // shallow copy — same Address reference!
  original.tags     // shallow copy — same array reference!
);

// Mutating the clone bleeds into the original.
clone.address.city = "Shelbyville";
clone.tags.push("viewer");

console.log(original.address.city); // "Shelbyville" — unintended!
console.log(original.tags);         // ["admin", "editor", "viewer"] — unintended!
```

Problems:
- **Callers must know every internal field** of the object they're copying.
- **Shallow copy**: nested objects and arrays share references — mutations bleed across clones.
- **Maintenance trap**: adding a new field to `UserProfile` requires updating every manual copy site.
- **Breaks encapsulation**: private fields cannot be copied from outside the class.

---

## The Solution

Add a `clone()` method to the class. The class itself knows how to copy its own data correctly — including nested objects and arrays:

```typescript
class UserProfile {
  clone(): UserProfile {
    return new UserProfile(
      this.name,
      this.age,
      this.email,
      new Address(this.address.street, this.address.city), // deep copy
      [...this.tags]                                         // deep copy
    );
  }
}

const clone = original.clone();
clone.address.city = "Shelbyville"; // original is unaffected
```

For hierarchies, define a `Cloneable` interface so callers can clone without knowing the concrete type.

---

## Structure

```
«interface» Cloneable
└── clone(): Cloneable
     │
     └── UserProfile (Concrete Prototype)
          ├── clone(): UserProfile   ← performs deep copy
          └── ... fields

Address (nested object — also needs its own clone logic)
```

### Participants

| Role | Responsibility |
|---|---|
| **Prototype** (`Cloneable`) | Declares the `clone()` method |
| **Concrete Prototype** (`UserProfile`) | Implements `clone()` with correct deep-copy logic |
| **Client** | Calls `clone()` without knowing the concrete class |

---

## How to Implement

1. **Declare a `Cloneable` interface** with a `clone(): this` or `clone(): ClassName` method.

2. **Implement `clone()` in each class**: copy all primitive fields directly, and recursively clone nested objects.

3. **Handle arrays and maps** explicitly — spread `[...arr]` or `new Map(map)` to avoid shared references.

4. **Make the constructor accept an existing instance** as an alternative: `constructor(source?: UserProfile)` — this is the canonical TypeScript approach.

5. **Replace all manual copy sites** with `obj.clone()`.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
// Caller must manually know and copy every field.
const clone = new UserProfile(
  original.name,
  original.age,
  original.email,
  original.address, // BUG: same reference
  original.tags     // BUG: same reference
);

clone.address.city = "Shelbyville";
console.log(original.address.city); // "Shelbyville" — mutation leak
```

Problems:
- Shallow copy causes silent mutation bugs.
- Every copy site must be updated when a field is added.
- Private fields cannot be accessed for copying from outside.

### After (solution) — `solution/index.ts`

```typescript
class UserProfile implements Cloneable {
  clone(): UserProfile {
    return new UserProfile(
      this.name,
      this.age,
      this.email,
      new Address(this.address.street, this.address.city),
      [...this.tags]
    );
  }
}

const clone = original.clone();
clone.address.city = "Shelbyville";
console.log(original.address.city); // "Springfield" — original is safe
```

Benefits:
- Deep copy is correct and colocated with the class.
- Callers don't know or care about internal fields.
- Adding a new field only requires updating `clone()` in one place.

---

## When to Use

- **Copying is cheaper than construction**: the object is expensive to build from scratch but fast to copy.
- **You need many similar objects** that differ only in a few fields — clone a prototype and tweak.
- **You don't know the concrete class** of the object you're copying (e.g., you have a `Shape` interface and want `shape.clone()`).
- **Avoiding a class hierarchy of factories**: instead of a factory per variant, keep prototype instances in a registry and clone on demand.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Clone without coupling to the concrete class | Implementing deep copy for complex graphs can be tricky |
| Alternative to subclassing for creating variants | Circular references require special handling |
| Producing pre-configured objects is fast | |
| Encapsulation is preserved — `clone()` is inside the class | |

---

## Relations with Other Patterns

- **Factory Method** uses subclassing to vary the created type. Prototype clones a pre-existing instance — no subclassing needed.
- **Abstract Factory** can store a set of prototype objects and clone them rather than creating from scratch.
- **Memento**: the saved snapshot in Memento is effectively a prototype of the originator's state.
- **Composite** and **Decorator** trees benefit from Prototype — you can clone a complex tree cheaply.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Manual field-by-field copy with shallow-copy mutation bugs |
| `solution/index.ts` | Refactored with a `clone()` method that performs a correct deep copy |
| `solution/index.test.ts` | Verifies that cloned objects are independent (mutations don't bleed) |

**Challenge:** add a `tags` registry — a `Map<string, UserProfile>` — that stores prototype users. Add a `spawn(tag)` function that returns a deep clone from the registry.
