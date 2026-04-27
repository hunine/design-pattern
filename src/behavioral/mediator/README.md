# Mediator

**Category:** Behavioral  
**Also known as:** Intermediary, Controller

---

## Intent

Mediator is a behavioral design pattern that **reduces chaotic dependencies between objects** by making them communicate indirectly, through a special mediator object.

The key idea: components don't talk to each other directly. They notify the mediator of events; the mediator decides who to update and how.

---

## The Problem

UI components hold direct references to each other:

```typescript
class LoginButton {
  constructor(
    private usernameInput: UsernameInput,
    private passwordInput: PasswordInput,
    private errorLabel: ErrorLabel
  ) {}

  click(): void {
    const user = this.usernameInput.getValue();  // knows UsernameInput
    const pass = this.passwordInput.getValue();  // knows PasswordInput

    if (!user || !pass) {
      this.errorLabel.show("Required");          // knows ErrorLabel
    } else if (...) {
      this.passwordInput.clear();                // directly manipulates PasswordInput
    }
  }
}
```

Problems:
- **Tangled dependencies**: `LoginButton` must know about `UsernameInput`, `PasswordInput`, and `ErrorLabel`.
- **Impossible to reuse**: you can't drop `LoginButton` into another form — it carries references to specific siblings.
- **Adding a new component** (e.g., a "remember me" checkbox) means updating `LoginButton` and every other component it might affect.
- **Web of references**: with N components, you may have up to N² direct connections.

---

## The Solution

All components know only about the `Mediator`. They call `mediator.notify(this, event)` instead of calling each other directly. The mediator centralises all coordination:

```typescript
interface Mediator {
  notify(sender: object, event: string): void;
}

class LoginFormMediator implements Mediator {
  constructor(
    private username: UsernameInput,
    private password: PasswordInput,
    private error: ErrorLabel,
    private button: LoginButton
  ) {}

  notify(sender: object, event: string): void {
    if (sender === this.button && event === "click") {
      const user = this.username.getValue();
      const pass = this.password.getValue();
      if (!user || !pass) {
        this.error.show("Username and password are required");
      } else if (user === "admin" && pass === "secret") {
        this.error.hide();
        console.log("Login successful");
      } else {
        this.error.show("Invalid credentials");
        this.password.clear();
      }
    }
  }
}

class LoginButton {
  constructor(private mediator: Mediator) {}
  click(): void { this.mediator.notify(this, "click"); }
}
```

Components know only `Mediator`. The mediator knows all components but they don't know each other.

---

## Structure

```
«interface» Mediator
└── notify(sender, event): void

LoginFormMediator (Concrete Mediator)
├── username: UsernameInput
├── password: PasswordInput
├── error: ErrorLabel
├── button: LoginButton
└── notify() ← central coordination logic

Component (base)
└── mediator: Mediator   ← only dependency on other objects

LoginButton / UsernameInput / PasswordInput / ErrorLabel
└── all notify mediator instead of calling siblings
```

### Participants

| Role | Responsibility |
|---|---|
| **Mediator** | Declares the `notify(sender, event)` method |
| **Concrete Mediator** (`LoginFormMediator`) | Stores references to all components; implements coordination logic |
| **Component** | Holds a reference to the mediator; notifies it instead of calling siblings |

---

## How to Implement

1. **Identify the tightly-coupled components** and the interactions between them.

2. **Declare the Mediator interface** with a `notify(sender, event)` method (or specific event methods).

3. **Create a Concrete Mediator** that stores references to all components and implements the coordination logic.

4. **Refactor components** to hold a `mediator` reference instead of sibling references. Replace each direct sibling call with `mediator.notify(this, eventName)`.

5. **Wire up the mediator** at the point of component creation, injecting itself into each component.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class LoginButton {
  constructor(
    private usernameInput: UsernameInput,
    private passwordInput: PasswordInput,
    private errorLabel: ErrorLabel
  ) {}

  click(): void {
    const user = this.usernameInput.getValue();
    // ... all coordination logic inside LoginButton
  }
}
```

Problems:
- `LoginButton` owns all coordination — it's both a UI element and an orchestrator.
- Every component must receive all its siblings at construction time.
- 4 components with mutual dependencies = up to 12 direct references.

### After (solution) — `solution/index.ts`

```typescript
class LoginButton {
  constructor(private mediator: Mediator) {}
  click(): void { this.mediator.notify(this, "click"); }
}

// All coordination is in one place.
const mediator = new LoginFormMediator(username, password, error, button);
button.click(); // mediator decides what happens
```

Benefits:
- Components are simple and reusable — they only know about the mediator interface.
- All coordination logic is in one place, easy to follow.
- Adding a new component means adding logic only in the mediator.

---

## When to Use

- **Components are tightly coupled** because they need to interact with many others.
- **You want to reuse components** in different contexts without changing them.
- **Coordination logic has grown** to be too complex to keep distributed across components.
- **You're building a dialog/form** where many fields affect each other's state.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Reduces coupling between components | Mediator can become a "god object" that knows too much |
| Single place for component interaction logic | Centralising all coordination can hurt readability |
| Components become reusable and independently testable | |
| Open/Closed: add new components without changing existing ones | |

---

## Relations with Other Patterns

- **Observer**: components can publish events to the mediator like observers publish to a subject.
- **Facade** simplifies an interface to a subsystem. Mediator coordinates communication between peers.
- **Command**: wrap each interaction as a command to get logging and undo on top of mediated interactions.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `LoginButton` holds direct references to `UsernameInput`, `PasswordInput`, `ErrorLabel` |
| `solution/index.ts` | `LoginFormMediator` centralises coordination; components only know `Mediator` |
| `solution/index.test.ts` | Verifies correct mediator behaviour for valid and invalid login attempts |

**Challenge:** add a `RememberMeCheckbox` component. It should affect whether the mediator logs "session saved" on successful login — without touching `LoginButton` or any existing component.
