# Observer

**Category:** Behavioral  
**Also known as:** Event-Subscriber, Listener

---

## Intent

Observer is a behavioral design pattern that lets you define a **subscription mechanism** to notify multiple objects about any events that happen to the object they're observing.

The key idea: the subject (publisher) knows nothing about subscribers' concrete types — it just calls `update(event)` on everyone in a list.

---

## The Problem

A store notifies customers by calling a different method on each concrete subscriber type:

```typescript
class Store {
  private emailCustomers: EmailCustomer[] = [];
  private smsCustomers: SMSCustomer[] = [];
  private pushCustomers: PushCustomer[] = [];

  restock(product: string): void {
    this.emailCustomers.forEach((c) => c.sendEmail(product));    // knows EmailCustomer
    this.smsCustomers.forEach((c) => c.sendSMS(product));        // knows SMSCustomer
    this.pushCustomers.forEach((c) => c.pushNotification(product)); // knows PushCustomer
    // Adding WebhookCustomer? Edit this method.
  }
}
```

Problems:
- **Hardcoded subscriber types**: `Store` knows `sendEmail`, `sendSMS`, `pushNotification` — different method names on each type.
- **Adding a new notification channel** (Slack, Webhook) requires editing `Store.restock()`.
- **No dynamic subscribe/unsubscribe**: the lists are fixed at startup.
- **Multiple subscriber lists**: `Store` must manage a separate list per type.

---

## The Solution

All subscribers implement a common `Observer` interface with one `update(event)` method. The publisher manages a single list and calls `update()` on all of them:

```typescript
interface Observer {
  update(product: string): void;
}

class EmailCustomer implements Observer {
  constructor(private name: string) {}
  update(product: string): void {
    console.log(`Email to ${this.name}: "${product}" is back in stock!`);
  }
}

class SMSCustomer implements Observer {
  constructor(private phone: string) {}
  update(product: string): void {
    console.log(`SMS to ${this.phone}: "${product}" is back in stock!`);
  }
}

class Store {
  private observers: Observer[] = [];

  subscribe(o: Observer): void   { this.observers.push(o); }
  unsubscribe(o: Observer): void { this.observers = this.observers.filter(x => x !== o); }

  restock(product: string): void {
    console.log(`Store restocked: ${product}`);
    this.observers.forEach((o) => o.update(product)); // one loop, one method
  }
}

const store = new Store();
store.subscribe(new EmailCustomer("Alice"));
store.subscribe(new SMSCustomer("+1-555-0100"));
store.restock("iPhone 16"); // notifies all subscribers
```

---

## Structure

```
«interface» Observer
└── update(event: string): void

EmailCustomer / SMSCustomer / PushCustomer
└── update(event) → send notification

Store (Subject/Publisher)
├── observers: Observer[]
├── subscribe(o: Observer)
├── unsubscribe(o: Observer)
└── restock(product) → forEach observer.update(product)
```

### Participants

| Role | Responsibility |
|---|---|
| **Observer** | Declares the `update(event)` method |
| **Concrete Observer** (`EmailCustomer`, …) | Implements `update()`; reacts to the event |
| **Subject/Publisher** (`Store`) | Maintains the observer list; calls `update()` on all observers when an event occurs |

---

## How to Implement

1. **Declare the Observer interface** with an `update(event)` method.

2. **Implement Concrete Observers** — one per notification channel. Each implements `update()` its own way.

3. **Add subscription management to the Subject**: `subscribe(o)`, `unsubscribe(o)`, and a private `observers: Observer[]` list.

4. **Implement the notification method** (`notify()` or inline in the event method): loop over observers and call `update()`.

5. **Replace hardcoded subscriber calls** in the subject with the generic notification loop.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class Store {
  private emailCustomers: EmailCustomer[] = [];
  private smsCustomers: SMSCustomer[] = [];
  private pushCustomers: PushCustomer[] = [];

  restock(product: string): void {
    this.emailCustomers.forEach((c) => c.sendEmail(product));
    this.smsCustomers.forEach((c) => c.sendSMS(product));
    this.pushCustomers.forEach((c) => c.pushNotification(product));
    // Adding Webhook requires editing here.
  }
}
```

Problems:
- `Store` knows the concrete type and specific method of every subscriber.
- 3 separate lists, 3 separate loops, 3 different method names.
- No dynamic subscribe/unsubscribe.

### After (solution) — `solution/index.ts`

```typescript
store.subscribe(new EmailCustomer("Alice"));
store.subscribe(new SMSCustomer("+1-555-0100"));
store.subscribe(new PushCustomer("device-abc"));

store.restock("iPhone 16");

// Unsubscribe at runtime — no Store changes needed.
store.unsubscribe(smsCustomer);
store.restock("AirPods Pro");
```

Benefits:
- One list, one loop, one method: `update()`.
- Adding a `WebhookCustomer` = one new class that implements `Observer`.
- Dynamic subscribe/unsubscribe at runtime.
- `Store` knows nothing about email, SMS, or push mechanics.

---

## When to Use

- **Changes to one object require updating others**, and you don't know how many objects need to change.
- **Objects should be able to notify others without knowing who they are**.
- **You need dynamic subscription**: objects can start or stop listening at runtime.
- **Event systems, UI frameworks, reactive data streams**.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Open/Closed: add new observers without changing the subject | Observers are notified in an arbitrary order |
| Establish relations between objects at runtime | Subscribers are notified even if they don't care about a particular event |
| Loose coupling: subject doesn't know subscriber types | Can cause memory leaks if subscribers forget to unsubscribe |

---

## Relations with Other Patterns

- **Mediator**: the mediator is a subject that centralises communication. In Observer, the subject notifies autonomously.
- **Singleton**: the subject (publisher) is often a Singleton.
- **Event bus / Pub-Sub**: a generalisation of Observer where subjects and observers don't know each other at all — they communicate via a shared bus.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `Store.restock()` hardcodes calls to each concrete subscriber method |
| `solution/index.ts` | `Observer` interface; `Store` manages one list; subscribers implement `update()` |
| `solution/index.test.ts` | Verifies subscribe, unsubscribe, and notification behaviour |

**Challenge:** implement a `WebhookCustomer` that implements `Observer` and POSTs to a URL — add it to the store without modifying `Store` or any existing observer.
