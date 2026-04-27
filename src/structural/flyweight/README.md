# Flyweight

**Category:** Structural  
**Also known as:** Cache

---

## Intent

Flyweight is a structural design pattern that lets you fit **more objects into available RAM** by sharing common state between multiple objects instead of keeping all data in each object.

The key idea: split each object's state into **intrinsic** (shared, immutable — e.g., tree species, texture) and **extrinsic** (unique per instance — e.g., position). Store only intrinsic state in the flyweight object; pass extrinsic state in at call time.

---

## The Problem

A forest renderer creates one `Tree` object per tree, and each object carries its own copy of the texture:

```typescript
class Tree {
  x: number; y: number;
  name: string; color: string;
  texture: string; // ← large bitmap, identical for all oak trees
}

// 100,000 oak trees = 100,000 copies of the same oak texture blob.
for (let i = 0; i < 100_000; i++) {
  forest.plantTree(i, i, "Oak", "green", HEAVY_TEXTURE);
}
```

Problems:
- **RAM explosion**: if 100,000 oak trees each carry a 1 MB texture, that's 100 GB — for one species.
- **Duplication of identical data**: every Oak tree holds the exact same texture bytes.
- **No sharing**: objects are independent, so there's no mechanism to deduplicate.

---

## The Solution

Extract the shared (intrinsic) data into a `TreeType` flyweight class. Each unique species is represented by **one** `TreeType` object. Tree instances hold only their unique (extrinsic) position and reference the shared flyweight:

```typescript
class TreeType {
  constructor(
    readonly name: string,
    readonly color: string,
    readonly texture: string  // stored ONCE per species
  ) {}

  draw(x: number, y: number): string {
    return `Drawing ${this.name} tree at (${x}, ${y}) [${this.texture.slice(0,10)}]`;
  }
}

class Tree {
  constructor(
    private x: number,
    private y: number,
    private type: TreeType  // shared reference, not a copy
  ) {}

  draw(): string { return this.type.draw(this.x, this.y); }
}

class TreeFactory {
  private static types = new Map<string, TreeType>();

  static getType(name: string, color: string, texture: string): TreeType {
    const key = `${name}-${color}`;
    if (!TreeFactory.types.has(key)) {
      TreeFactory.types.set(key, new TreeType(name, color, texture));
    }
    return TreeFactory.types.get(key)!;
  }
}
```

100,000 oak trees → **1 `TreeType` object** (holding the texture) + 100,000 lightweight `Tree` objects (holding only x, y, and a reference).

---

## Structure

```
TreeFactory (Flyweight Factory)
└── getType(name, color, texture): TreeType   ← returns cached flyweight

TreeType (Flyweight)
├── name: string    ← intrinsic (shared)
├── color: string   ← intrinsic (shared)
├── texture: string ← intrinsic (shared, heavy)
└── draw(x, y)      ← receives extrinsic state as parameter

Tree (Context)
├── x: number       ← extrinsic (unique)
├── y: number       ← extrinsic (unique)
└── type: TreeType  ← reference to shared flyweight
```

### Participants

| Role | Responsibility |
|---|---|
| **Flyweight** (`TreeType`) | Stores shared intrinsic state; accepts extrinsic state in operations |
| **Flyweight Factory** (`TreeFactory`) | Returns a cached flyweight; creates it on first request |
| **Context** (`Tree`) | Stores extrinsic state; delegates work to the flyweight |
| **Client** (`Forest`) | Computes or stores extrinsic state; uses the factory to get flyweights |

---

## How to Implement

1. **Identify the intrinsic state**: data that is identical across many objects and never changes after creation (species name, texture, colour).

2. **Identify the extrinsic state**: data that is unique per instance or changes over time (position, scale, velocity).

3. **Create a Flyweight class** with only intrinsic state. Methods receive extrinsic state as parameters.

4. **Create a Flyweight Factory** with a cache (usually a `Map`). Before creating a new flyweight, check the cache; return an existing one if found.

5. **Refactor the Context class** (the original heavy object) to store extrinsic state and a reference to the flyweight. Delegate operations to the flyweight, passing extrinsic state.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class Tree {
  texture: string; // large bitmap — one copy per tree object

  constructor(x, y, name, color, texture) { ... }
}

// 100 trees = 100 full texture copies in memory.
for (let i = 0; i < 100; i++) {
  forest.plantTree(i, i, "Oak", "green", HEAVY_TEXTURE);
}

console.log(`Total tree objects: ${forest.memoryUsage()}`); // 100 (each with full texture)
```

### After (solution) — `solution/index.ts`

```typescript
// 100 trees → 2 TreeType flyweights (Oak, Pine) + 100 lightweight Tree contexts.
for (let i = 0; i < 50; i++) {
  forest.plantTree(i, i, "Oak", "green", HEAVY_TEXTURE);
  forest.plantTree(i, i+3, "Pine", "dark-green", HEAVY_TEXTURE);
}

console.log(`Unique tree types (flyweights): ${TreeFactory.count()}`); // 2
console.log(`Total tree objects: ${forest.treeCount()}`); // 100
```

Benefits:
- Texture is stored **once per species** regardless of how many trees of that species exist.
- Adding 1,000,000 oak trees still uses only 1 `TreeType` for the oak texture.

---

## When to Use

- **Your program must support a huge number of objects** that would consume too much RAM.
- **Objects share a large amount of identical state** that can be extracted and shared.
- **You can pass the unique (extrinsic) state** into operations rather than storing it on each object.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Dramatically reduces RAM when many objects share state | Code complexity increases — intrinsic vs extrinsic split |
| Can enable object counts that were previously impossible | CPU increases slightly (computing/passing extrinsic state) |
| | Factory adds indirection |

---

## Relations with Other Patterns

- **Composite**: Flyweight can be applied to the leaf nodes of a Composite tree to reduce memory.
- **Singleton**: flyweights can look like singletons per key, but there can be many flyweight instances (one per unique intrinsic-state combination).
- **Prototype**: instead of Flyweight, you might clone a prototype; Flyweight is better when sharing is the explicit goal.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Each `Tree` object carries its own copy of the full texture |
| `solution/index.ts` | `TreeType` flyweight shares texture; `TreeFactory` caches by species |
| `solution/index.test.ts` | Verifies that the same species returns the same `TreeType` reference |

**Challenge:** add a `color` variant to the flyweight key (so `"Oak-green"` and `"Oak-autumn"` are different flyweights) and confirm only 2 flyweights are created for 1,000 mixed trees.
