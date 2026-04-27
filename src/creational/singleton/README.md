# Singleton

**Category:** Creational  
**Also known as:** Single Instance

---

## Intent

Singleton is a creational design pattern that ensures a class has **only one instance** and provides a **global access point** to that instance.

The key idea: the class itself is responsible for making sure only one object exists. Every caller that asks for an instance gets back the same object.

---

## The Problem

Imagine you have a `DatabaseConnection` class. Every time a part of the app calls `getConnection()`, it creates a brand-new connection to the database:

```
// Every call opens a new connection — wasteful and broken
const conn1 = getConnection(); // → new connection #1
const conn2 = getConnection(); // → new connection #2

conn1.query("SELECT * FROM users");
conn2.query("SELECT * FROM orders");

conn1 === conn2        // false — different objects!
conn1.queryCount       // 1 — knows nothing about conn2
```

Problems:
- **Resource waste**: database connections are expensive to open.
- **Broken state**: `queryCount` is tracked per-instance, so stats are wrong.
- **Subtle bugs**: two parts of the app may see different snapshots of state.

---

## The Solution

Make the constructor private so external code cannot call `new`. Expose a static `getInstance()` method that creates the instance on first call and returns the cached one on every subsequent call.

```
class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;

  private constructor(host: string, port: number) { ... }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection("localhost", 5432);
    }
    return DatabaseConnection.instance;
  }
}

const conn1 = DatabaseConnection.getInstance();
const conn2 = DatabaseConnection.getInstance();

conn1 === conn2   // true — same object
```

---

## Structure

```
DatabaseConnection (Singleton)
├── -instance: DatabaseConnection | null   ← static, holds the single object
├── -constructor()                          ← private, blocks external new
└── +getInstance(): DatabaseConnection     ← static factory, lazily creates
```

### Participants

| Role | Responsibility |
|---|---|
| **Singleton** (`DatabaseConnection`) | Owns a static instance field; declares a private constructor; exposes `getInstance()` |

---

## How to Implement

1. **Add a private static field** to hold the single instance.

2. **Make the constructor private** so only the class itself can call `new`.

3. **Implement a public static `getInstance()` method** that creates the instance on first call and returns the cached one after.

4. **Replace all `new ClassName()` calls** in client code with `ClassName.getInstance()`.

5. **(Optional) Thread safety**: in environments with concurrent execution, guard the creation with a lock or use a module-level export (Node.js modules are cached, so `export const db = new DB()` is already a singleton).

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
function getConnection(): DatabaseConnection {
  // A new instance is created on every call — no sharing.
  return new DatabaseConnection("localhost", 5432);
}

const conn1 = getConnection();
const conn2 = getConnection();

console.log(conn1 === conn2); // false
console.log(conn1.queryCount); // 1 — isolated state
```

Problems:
- Each call opens a new database connection (expensive).
- State is not shared — query counts and caches are per-instance.
- `conn1 === conn2` is `false`, breaking identity assumptions.

### After (solution) — `solution/index.ts`

```typescript
class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;

  private constructor(private host: string, private port: number) {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection("localhost", 5432);
    }
    return DatabaseConnection.instance;
  }

  query(sql: string): string { ... }
}

const conn1 = DatabaseConnection.getInstance();
const conn2 = DatabaseConnection.getInstance();

console.log(conn1 === conn2); // true
```

Benefits:
- Only one connection is ever opened.
- All callers share the same state (query count, cache, etc.).
- The pattern is enforced by the type system — `new DatabaseConnection()` is a compile error.

---

## When to Use

- **You need exactly one instance** of a class: a config store, logger, connection pool, or cache.
- **You need a global access point** but want it controlled — not a raw global variable.
- **Lazy initialisation**: create the expensive object only if and when it is first needed.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Guarantees a single instance | Violates the Single Responsibility Principle (manages its own lifecycle + business logic) |
| Provides a well-known global access point | Makes unit testing hard — the singleton carries state between tests |
| Lazy initialisation — created only when first needed | Tight coupling: callers depend on a concrete class, not an interface |
| | Hidden dependency — callers don't declare they need it |

---

## Relations with Other Patterns

- **Facade** is often implemented as a Singleton — one facade per subsystem is usually enough.
- **Abstract Factory**, **Builder**, and **Prototype** can all be implemented as Singletons.
- **Dependency Injection** is the preferred alternative in modern codebases: inject the shared instance explicitly instead of letting callers reach for it via a static method.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `getConnection()` creates a new `DatabaseConnection` on every call |
| `solution/index.ts` | Refactored with a private constructor and static `getInstance()` |
| `solution/index.test.ts` | Verifies that repeated calls return the same instance |

**Challenge:** add a `reset()` method (for tests only) that clears the static instance, then verify it works with two separate `getInstance()` calls.
