# State

**Category:** Behavioral  
**Also known as:** Objects for States

---

## Intent

State is a behavioral design pattern that lets an object **alter its behavior when its internal state changes**. It appears as if the object changed its class.

The key idea: instead of giant `switch` or `if/else` blocks that check a state field, extract each state into its own class. The context object delegates behavior to the current state object.

---

## The Problem

A vending machine has states (`idle`, `has_money`, `dispensing`, `out_of_stock`) and every action checks the state in a switch block:

```typescript
class VendingMachine {
  private state: VendingState = "idle";

  insertCoin(amount: number): void {
    switch (this.state) {
      case "idle":      this.balance += amount; this.state = "has_money"; break;
      case "has_money": this.balance += amount; break;
      case "dispensing":    console.log("Please wait..."); break;
      case "out_of_stock":  console.log("Out of stock."); break;
    }
  }

  pressButton(): void {
    switch (this.state) {
      case "idle":      console.log("Insert a coin first."); break;
      case "has_money": if (enough) { this.state = "dispensing"; this.dispense(); } break;
      // ...
    }
  }
}
```

Problems:
- **Every method has its own `switch`**: 4 states × 2 actions = 8 `case` blocks. With 6 states × 5 actions = 30 cases.
- **Adding a new state** (`maintenance`) requires editing *every* switch in *every* method.
- **Transitions are scattered**: the logic for what happens when you go from `has_money` to `dispensing` is spread across multiple methods.
- **Hard to test** a single state in isolation.

---

## The Solution

Extract each state into its own class with `insertCoin()` and `pressButton()` methods. The context holds a reference to the current state and delegates:

```typescript
interface VendingState {
  insertCoin(machine: VendingMachine, amount: number): void;
  pressButton(machine: VendingMachine): void;
}

class IdleState implements VendingState {
  insertCoin(machine: VendingMachine, amount: number): void {
    machine.addBalance(amount);
    machine.setState(new HasMoneyState());
    console.log(`Inserted $${amount}. Balance: $${machine.getBalance()}`);
  }
  pressButton(machine: VendingMachine): void {
    console.log("Please insert a coin first.");
  }
}

class VendingMachine {
  private state: VendingState = new IdleState();
  setState(s: VendingState): void { this.state = s; }

  insertCoin(amount: number): void { this.state.insertCoin(this, amount); }
  pressButton(): void              { this.state.pressButton(this); }
}
```

Adding a `MaintenanceState` requires one new class — zero changes to existing states or the machine.

---

## Structure

```
VendingMachine (Context)
├── state: VendingState   ← current state object
├── insertCoin(amount)  → delegates to state.insertCoin(this, amount)
└── pressButton()       → delegates to state.pressButton(this)

«interface» VendingState
├── insertCoin(machine, amount): void
└── pressButton(machine): void
     │
     ├── IdleState
     ├── HasMoneyState
     ├── DispensingState
     └── OutOfStockState
```

### Participants

| Role | Responsibility |
|---|---|
| **Context** (`VendingMachine`) | Maintains a reference to the current state; delegates behavior to it |
| **State** (`VendingState`) | Declares the interface for state-specific behavior |
| **Concrete State** (`IdleState`, …) | Implements behavior for one state; can transition the context to another state |

---

## How to Implement

1. **Identify all state-specific behaviors** — the methods that behave differently depending on state.

2. **Declare a State interface** with those methods (accepting the context as a parameter so states can trigger transitions).

3. **Create a Concrete State class** per state. Move the matching `case` blocks from the context into each state class.

4. **Refactor the context**: replace the `switch` block in each method with a delegation to `this.state.method(this, ...)`.

5. **Implement state transitions** inside the state classes by calling `context.setState(new NextState())`.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
pressButton(): void {
  switch (this.state) {
    case "idle":         console.log("Insert a coin first."); break;
    case "has_money":    if (this.balance >= 1.0) { this.state = "dispensing"; this.dispense(); } break;
    case "dispensing":   console.log("Already dispensing."); break;
    case "out_of_stock": console.log("Out of stock."); break;
  }
}
```

Problems:
- 4 `case` blocks in this method, 4 more in `insertCoin`.
- Adding `MaintenanceState` requires editing every switch in the class.
- State transition logic (`this.state = "dispensing"`) is inside the switch — scattered and hard to follow.

### After (solution) — `solution/index.ts`

```typescript
// Adding MaintenanceState = 1 new class, 0 changes to existing states or VendingMachine.
class MaintenanceState implements VendingState {
  insertCoin(machine: VendingMachine, amount: number): void {
    machine.returnCoin(amount);
    console.log("Machine in maintenance. Coin returned.");
  }
  pressButton(machine: VendingMachine): void {
    console.log("Machine in maintenance.");
  }
}
```

Benefits:
- Each state's behavior is self-contained and independently testable.
- Transitions are explicit: each state decides the next state.
- Adding a new state doesn't touch existing states.

---

## When to Use

- **An object behaves differently depending on its current state**, and the state can change at runtime.
- **You have a class with many conditional statements** that switch behavior based on the object's state.
- **State-specific code has a lot of duplication** across multiple methods.
- **Finite state machines** (FSMs): turnstiles, vending machines, traffic lights, game characters.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Single Responsibility: one class per state | Overkill if there are only 2–3 states with simple transitions |
| Open/Closed: add new states without changing existing ones | More classes to manage |
| State transitions are explicit and localized | Cyclic dependencies between states and context are possible |
| Eliminates large conditional blocks | |

---

## Relations with Other Patterns

- **Strategy**: both use delegation to a swappable object. State transitions are driven by state objects themselves; strategy is chosen by the client.
- **Flyweight**: if many contexts use the same state with no mutable fields, state objects can be shared.
- **Singleton**: stateless state objects can be singletons.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Vending machine with `switch(this.state)` in every method |
| `solution/index.ts` | `IdleState`, `HasMoneyState`, `DispensingState`, `OutOfStockState` classes; `VendingMachine` delegates |
| `solution/index.test.ts` | Verifies correct transitions and behavior for each state |

**Challenge:** add a `MaintenanceState` that returns all coins and ignores button presses. Transition to it via a `setMaintenance()` method on `VendingMachine` — without touching existing state classes.
