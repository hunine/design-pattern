# Proxy

**Category:** Structural  
**Also known as:** Surrogate

---

## Intent

Proxy is a structural design pattern that lets you provide a **substitute or placeholder** for another object. A proxy controls access to the original object, allowing you to perform something either before or after the request gets through.

The key idea: the proxy implements the same interface as the real object. Clients call the proxy exactly as they would call the real object — but the proxy adds a layer of logic (lazy loading, access control, caching, logging, etc.).

---

## The Problem

A `HeavyImage` loads its binary data immediately in the constructor — even if `display()` is never called. There's also no access control:

```typescript
class HeavyImage {
  constructor(filename: string) {
    // Expensive — runs unconditionally, even if the image is never shown.
    this.data = this.loadFromDisk(filename);
  }

  display(): string { return `Displaying: ${this.data}`; }
}

// Both images load from disk immediately, even if only img1 is displayed.
const img1 = new HeavyImage("photo_4k.png");
const img2 = new HeavyImage("background_8k.png"); // wasted load

console.log(img1.display());
// img2 was loaded for nothing. Anyone can call display() — no auth check.
```

Problems:
- **Eager loading**: the expensive disk read runs at construction, not at first use.
- **No caching**: every `new HeavyImage(...)` pays the full cost, even for the same file.
- **No access control**: any caller can invoke `display()` with no authentication.

---

## The Solution

Create an `ImageProxy` that implements the same `Image` interface as `HeavyImage`. It defers loading until the first `display()` call and can add an access check:

```typescript
interface Image {
  display(): string;
}

class HeavyImage implements Image {
  private data: string;
  constructor(private filename: string) {
    this.data = this.loadFromDisk(filename); // still exists — proxy calls it lazily
  }
  display(): string { return `Displaying: ${this.data}`; }
  private loadFromDisk(f: string): string { return `<binary of ${f}>`; }
}

class ImageProxy implements Image {
  private realImage: HeavyImage | null = null;

  constructor(
    private filename: string,
    private currentUser: string
  ) {}

  display(): string {
    if (this.currentUser !== "admin") return "Access denied";
    if (!this.realImage) {
      this.realImage = new HeavyImage(this.filename); // lazy — first use only
    }
    return this.realImage.display();
  }
}

const img = new ImageProxy("photo_4k.png", "admin");
// Nothing loaded yet.
console.log(img.display()); // loads now, then displays
console.log(img.display()); // cached — no reload
```

---

## Structure

```
«interface» Image
└── display(): string
     │
     ├── HeavyImage (Real Subject)
     │    └── display() → loads from disk + returns data
     │
     └── ImageProxy (Proxy)
          ├── realImage: HeavyImage | null   ← lazily created
          ├── currentUser: string
          └── display() → access check → lazy load → delegate
```

### Participants

| Role | Responsibility |
|---|---|
| **Subject** (`Image`) | Common interface for the real object and the proxy |
| **Real Subject** (`HeavyImage`) | The actual object that does the real work |
| **Proxy** (`ImageProxy`) | Implements `Image`; controls access to `HeavyImage`; adds cross-cutting concerns |
| **Client** | Works through the `Image` interface; unaware of the proxy |

---

## How to Implement

1. **Declare a Subject interface** if there isn't one already — both the real object and the proxy implement it.

2. **Create the Proxy class** with a private field for the real subject (`private real: RealSubject | null = null`).

3. **Implement the proxy's methods**: add your cross-cutting concern (lazy loading, access control, caching), then delegate to the real subject.

4. **Consider a factory or DI** to decide whether to return a proxy or the real object — clients should not need to change.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
// Loads from disk in the constructor — unconditionally.
const img1 = new HeavyImage("photo_4k.png");
const img2 = new HeavyImage("background_8k.png"); // loaded for nothing

console.log(img1.display()); // only img1 is ever shown
// No access control — anyone can call display().
```

Problems:
- Expensive disk I/O runs even for objects that are never used.
- No caching — the same file could be loaded multiple times.
- No authentication gate — any code can access any image.

### After (solution) — `solution/index.ts`

```typescript
const img1 = new ImageProxy("photo_4k.png", "admin");
const img2 = new ImageProxy("background_8k.png", "admin");
// Nothing loaded yet.

console.log(img1.display()); // loads + displays
console.log(img1.display()); // cached — no reload
// img2 is never displayed — disk is never touched.
```

Benefits:
- Load cost is deferred to first `display()` call.
- Subsequent calls use the cached real object.
- Unauthorised users get "Access denied" without ever loading the image.

---

## When to Use

- **Lazy initialisation (Virtual Proxy)**: delay the creation of a heavy object until it's first needed.
- **Access control (Protection Proxy)**: check credentials before forwarding to the real object.
- **Caching (Caching Proxy)**: cache results of expensive operations and return them on subsequent calls.
- **Logging/Auditing (Logging Proxy)**: log all calls to the real subject transparently.
- **Remote Proxy**: provide a local stand-in for an object in a different address space.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Lazy loading — pay the cost only when needed | Extra class for every proxied type |
| Access control without changing the real subject | Response from the proxy might be delayed |
| Open/Closed: add new proxy behaviour without changing the real subject | Complex proxy logic can become a maintenance burden |
| Transparent to clients | |

---

## Relations with Other Patterns

- **Decorator** adds behaviour; Proxy controls access. Both wrap the same interface.
- **Adapter** changes the interface; Proxy keeps the same interface.
- **Facade** simplifies a complex subsystem; Proxy wraps a single object.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `HeavyImage` loads from disk eagerly in its constructor; no access control |
| `solution/index.ts` | `ImageProxy` adds lazy loading, caching, and access control |
| `solution/index.test.ts` | Verifies disk load happens only once, and unauthorised access is blocked |

**Challenge:** add a `LoggingProxy` that logs every `display()` call (timestamp + filename) and delegates to the real `HeavyImage` — without modifying `HeavyImage`.
