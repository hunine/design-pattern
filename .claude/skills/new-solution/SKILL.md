---
name: new-solution
description: >
  Use this skill whenever the user asks to create, scaffold, generate, or start a solution
  for a design pattern in this repository. Trigger phrases include but are not limited to:
  "create a solution for X", "create new solution for X", "scaffold the solution for X",
  "generate solution for X", "start implementing X", "I want to implement X",
  "help me implement X pattern", "set up the solution folder for X",
  "create solution/index.ts for X", where X is any GoF design pattern name
  (e.g. factory-method, singleton, observer, decorator, strategy, etc.).
  Extracts the pattern name from the user's message and uses it as the argument.
---

# Scaffold Design Pattern Solution

## Step 0 — Resolve the Pattern Name

The pattern name comes from one of two sources:

1. **Slash command argument**: if the user typed `/new-solution <pattern>`, the pattern name is `$ARGUMENTS`.
2. **Natural language**: if the user wrote something like "create a solution for factory method" or "I want to implement the observer pattern", extract the pattern name from their message.

Normalise the pattern name to kebab-case (e.g. "Factory Method" → `factory-method`, "chain of responsibility" → `chain-of-responsibility`).

If you cannot confidently extract a pattern name, ask the user: "Which pattern would you like to scaffold? (e.g. factory-method, observer, singleton)"

Use the resolved pattern name everywhere `$ARGUMENTS` appears below.

## Your Task

Generate a solution skeleton for the given design pattern so the learner can implement it without having to set up boilerplate manually. Follow every step below in order.

---

## Step 1 — Locate the Pattern

Find the pattern directory under `src/`:

```bash
find src -type d -name "$ARGUMENTS"
```

Identify the category (`creational`, `structural`, or `behavioral`) from the path.

Read both of these files before generating anything:
- `src/{category}/$ARGUMENTS/raw/index.ts` — understand the exact problem to solve
- `src/{category}/$ARGUMENTS/README.md` — understand the GoF participants and structure (if it exists)

---

## Step 2 — Check for Existing Solution

Check whether `src/{category}/$ARGUMENTS/solution/index.ts` already exists.

- If it **exists**: tell the user and ask whether they want to overwrite it. Do not write anything without confirmation.
- If it **does not exist**: proceed to Step 3.

---

## Step 3 — Generate `solution/index.ts`

Create `src/{category}/$ARGUMENTS/solution/index.ts` with a well-structured skeleton that:

### Rules for the skeleton

1. **Define all canonical GoF participants** for this pattern as TypeScript interfaces or abstract classes — whichever is semantically correct:
   - Use `interface` for pure Product roles (no shared implementation).
   - Use `abstract class` for Creator/base roles that contain shared logic or enforce a contract with implementation.

2. **Stub every method** with a `// TODO:` comment that tells the learner exactly what to implement, referencing the specific problem from `raw/index.ts`.

3. **Include one concrete class per participant** as a stub so the learner sees the full structure without having to invent class names.

4. **Keep all business logic as TODOs** — do not implement the pattern for the learner. The skeleton provides structure, not answers.

5. **Add a short file-level comment** (2–3 lines) explaining what this file should achieve when complete, referencing the raw problem.

6. **End the file with a commented-out usage example** showing how the solution should be called when complete, mirroring the usage in `raw/index.ts`.

### Example shape (Factory Method)

```typescript
// SOLUTION: Replace scattered `new Truck()` / `new Ship()` calls with a
// factory method so new transport types can be added without touching
// existing code. See raw/index.ts for the problem.

// TODO: Define the Product interface — all transports must implement this.
interface Transport {
  deliver(cargo: string): string; // TODO: implement in concrete products
}

// TODO: Implement Concrete Product 1
class Truck implements Transport {
  deliver(cargo: string): string {
    // TODO: return delivery message for road transport
    throw new Error("Not implemented");
  }
}

// TODO: Implement Concrete Product 2
class Ship implements Transport {
  deliver(cargo: string): string {
    // TODO: return delivery message for sea transport
    throw new Error("Not implemented");
  }
}

// TODO: Define the Creator — declare the factory method and the business logic
//       that uses it (planDelivery). The business logic must never reference
//       Truck or Ship directly.
abstract class Logistics {
  // TODO: declare abstract factory method returning Transport
  abstract createTransport(): Transport;

  planDelivery(cargo: string): string {
    // TODO: call createTransport() and invoke deliver() — do not use new Truck/Ship here
    throw new Error("Not implemented");
  }
}

// TODO: Implement Concrete Creator 1 — override createTransport() to return Truck
class RoadLogistics extends Logistics {
  createTransport(): Transport {
    // TODO: return the correct concrete product
    throw new Error("Not implemented");
  }
}

// TODO: Implement Concrete Creator 2 — override createTransport() to return Ship
class SeaLogistics extends Logistics {
  createTransport(): Transport {
    // TODO: return the correct concrete product
    throw new Error("Not implemented");
  }
}

/*
Usage (uncomment when implementation is complete):

const road = new RoadLogistics();
console.log(road.planDelivery("furniture"));

const sea = new SeaLogistics();
console.log(sea.planDelivery("oil"));
*/
```

---

## Step 4 — Generate `solution/index.test.ts`

Create `src/{category}/$ARGUMENTS/solution/index.test.ts` with Jest tests that:

1. Import all participants from `./index`.
2. Have one `describe` block named after the pattern (e.g. `"Factory Method"`).
3. Include test cases that verify the **core pattern behavior** — not implementation details:
   - The pattern's primary contract (e.g. for Factory Method: calling `planDelivery` on different creators returns type-correct results without the caller knowing the concrete product).
   - That adding a new concrete class does not break existing tests.
4. Mark each test body with `// TODO: implement after completing solution/index.ts` so tests fail with a clear message until the learner is ready.
5. Use `expect(...).toBe(...)` or `expect(...).toContain(...)` — keep assertions simple and readable.

### Example shape (Factory Method)

```typescript
import { Logistics, RoadLogistics, SeaLogistics, Transport } from "./index";

describe("Factory Method", () => {
  it("RoadLogistics creates a transport that delivers by road", () => {
    // TODO: implement after completing solution/index.ts
    const logistics: Logistics = new RoadLogistics();
    const result = logistics.planDelivery("furniture");
    expect(result).toContain("road");
  });

  it("SeaLogistics creates a transport that delivers by sea", () => {
    // TODO: implement after completing solution/index.ts
    const logistics: Logistics = new SeaLogistics();
    const result = logistics.planDelivery("oil");
    expect(result).toContain("sea");
  });

  it("planDelivery works without knowing the concrete transport type", () => {
    // TODO: implement after completing solution/index.ts
    const logisticsOptions: Logistics[] = [new RoadLogistics(), new SeaLogistics()];
    logisticsOptions.forEach((l) => {
      expect(typeof l.planDelivery("cargo")).toBe("string");
    });
  });
});
```

---

## Step 5 — Report to the User

After writing both files, tell the user:

1. The paths of the two files created.
2. A numbered checklist of the TODOs they need to complete, in implementation order.
3. The command to run tests: `npm test -- --testPathPattern=$ARGUMENTS`
4. A reminder to run `/review-pattern $ARGUMENTS` once the solution is complete.
