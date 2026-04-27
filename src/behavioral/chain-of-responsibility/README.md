# Chain of Responsibility

**Category:** Behavioral  
**Also known as:** CoR, Chain of Command

---

## Intent

Chain of Responsibility is a behavioral pattern that lets you **pass requests along a chain of handlers**. Each handler decides to process the request or pass it to the next handler in the chain.

The key idea: decouple the sender of a request from its receivers. Each handler is a self-contained object that knows only about its own responsibility — and the next handler.

---

## The Problem

All request validation lives inside one giant function:

```typescript
function handleRequest(request: Request): string {
  // Step 1: authentication
  if (request.user !== "admin" || request.password !== "secret") {
    return "Rejected: invalid credentials";
  }
  // Step 2: authorization
  if (request.role !== "admin" && request.role !== "editor") {
    return "Rejected: insufficient permissions";
  }
  // Step 3: cache check
  if (request.cached) { return `Cache hit: ...`; }
  // Step 4: throttle check
  if (requestsThisMinute > 100) { return "Rejected: rate limit exceeded"; }
  // Step 5: actual processing
  return `Processing: "${request.data}"`;
}
```

Problems:
- **Single function grows forever**: every new check adds more `if` blocks.
- **Steps cannot be reordered** or enabled/disabled per route.
- **Steps cannot be reused** independently across different endpoints.
- **Impossible to unit-test** a single step in isolation.

---

## The Solution

Each step becomes its own `Handler` class with a reference to the next handler. Each handler either handles the request and returns, or calls `next.handle(request)`:

```typescript
interface Handler {
  setNext(h: Handler): Handler;
  handle(req: Request): string | null;
}

abstract class AbstractHandler implements Handler {
  private next: Handler | null = null;

  setNext(h: Handler): Handler { this.next = h; return h; }

  handle(req: Request): string | null {
    return this.next?.handle(req) ?? null;
  }
}

class AuthHandler extends AbstractHandler {
  handle(req: Request): string | null {
    if (req.user !== "admin" || req.password !== "secret") {
      return "Rejected: invalid credentials";
    }
    return super.handle(req); // pass to next
  }
}

// Build the chain.
const auth = new AuthHandler();
auth.setNext(new AuthzHandler()).setNext(new CacheHandler()).setNext(new ProcessHandler());

console.log(auth.handle(request));
```

---

## Structure

```
«interface» Handler
├── setNext(h: Handler): Handler
└── handle(req: Request): string | null

AbstractHandler (base)
└── next: Handler | null

AuthHandler → AuthzHandler → CacheHandler → ThrottleHandler → ProcessHandler
     ↓ if fails: return error
     ↓ if passes: super.handle(req) → next handler
```

### Participants

| Role | Responsibility |
|---|---|
| **Handler** | Declares the interface for handling requests |
| **Abstract Handler** | Stores the next handler; provides default pass-through via `super.handle()` |
| **Concrete Handler** (`AuthHandler`, …) | Handles its own responsibility; optionally passes to the next |
| **Client** | Builds the chain and sends the request to the first handler |

---

## How to Implement

1. **Declare the Handler interface** with `handle(req)` and `setNext(h)` methods.

2. **Create an Abstract Handler** that implements `setNext` and a default `handle` that forwards to the next handler.

3. **Create Concrete Handlers** — one per step. Each overrides `handle`, does its check, and either returns early (rejects) or calls `super.handle()` (passes along).

4. **Build the chain in client code** using `setNext` chaining: `auth.setNext(authz).setNext(cache)...`.

5. **Send the request** to the first handler in the chain.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
function handleRequest(request: Request): string {
  if (!authenticated) return "Rejected: invalid credentials";
  if (!authorized)    return "Rejected: insufficient permissions";
  if (request.cached) return "Cache hit";
  if (rateLimited)    return "Rate limit exceeded";
  return "Processing...";
}
```

Problems:
- Can't reorder or skip steps.
- Can't reuse the auth step for a different route.
- Every new check makes the function longer.

### After (solution) — `solution/index.ts`

```typescript
// Reorder by changing the chain.
const chain = new AuthHandler();
chain.setNext(new CacheHandler()).setNext(new AuthzHandler()).setNext(new ProcessHandler());

// Each handler is independently testable.
const authOnly = new AuthHandler();
console.log(authOnly.handle(badCredentialsRequest)); // "Rejected: ..."
```

Benefits:
- Each handler is isolated, testable, and reusable.
- Adding a new step = one new class.
- Chain can be built dynamically at runtime.

---

## When to Use

- **Multiple objects can handle a request** and the handler isn't known ahead of time.
- **You want to issue a request to several objects** without specifying the receiver explicitly.
- **The set of handlers should be configurable at runtime**: routes, middleware stacks, plugin pipelines.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Decouples sender from receivers | A request may fall through unhandled if chain isn't set up correctly |
| Single Responsibility: one handler per concern | Hard to debug which handler processed a request |
| Open/Closed: add handlers without changing the chain | Execution order depends on chain construction order |
| Chain is configurable at runtime | |

---

## Relations with Other Patterns

- **Decorator** also chains objects, but always passes to the wrapped object. CoR can stop the chain early.
- **Command** turns a request into an object. CoR routes that object along a chain.
- **Composite**: CoR is sometimes implemented over a Composite tree — handlers can have sub-handlers.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | All validation crammed into one `handleRequest` function |
| `solution/index.ts` | `AuthHandler`, `AuthzHandler`, `CacheHandler`, `ThrottleHandler`, `ProcessHandler` linked in a chain |
| `solution/index.test.ts` | Verifies each handler rejects the right requests and passes valid ones |

**Challenge:** add a `LoggingHandler` at the top of the chain that logs every request before passing it down — without modifying any existing handler.
