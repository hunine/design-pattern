# Iterator

**Category:** Behavioral  
**Also known as:** Cursor

---

## Intent

Iterator is a behavioral design pattern that lets you **traverse elements of a collection without exposing its underlying representation** (list, tree, linked list, etc.).

The key idea: extract the traversal algorithm into a separate "iterator" object. Collections expose a standard `getIterator()` method; clients loop via `hasNext()` / `next()` without caring what type of collection it is.

---

## The Problem

Client code must understand the internal structure of every collection type it traverses:

```typescript
// Three completely different traversal strategies.
function printArray(col: NumberArray): void {
  for (let i = 0; i < col.items.length; i++) {  // knows about .items
    console.log(col.items[i]);
  }
}

function printTree(node: NumberTree): void {
  console.log(node.value);
  for (const child of node.children) {  // knows about .value and .children
    printTree(child);                   // must write recursive logic
  }
}

function printLinkedList(list: NumberLinkedList): void {
  let cur = list.head;
  while (cur) {                         // knows about .head and .next
    console.log(cur.value);
    cur = cur.next;
  }
}
```

Problems:
- **Tight coupling**: client knows each collection's internal structure.
- **Duplication**: every traversal scenario needs its own print/process function per collection type.
- **No common interface**: you can't write one `processAll(collection)` that works for all types.
- **New collection type** = new traversal function in every client.

---

## The Solution

Each collection implements `Iterable` and returns an `Iterator`. Client code uses only `hasNext()` and `next()`:

```typescript
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
}

interface Iterable<T> {
  getIterator(): Iterator<T>;
}

class NumberArray implements Iterable<number> {
  constructor(private items: number[]) {}
  getIterator(): Iterator<number> {
    return new ArrayIterator(this.items);
  }
}

class ArrayIterator implements Iterator<number> {
  private index = 0;
  constructor(private items: number[]) {}
  hasNext(): boolean { return this.index < this.items.length; }
  next(): number     { return this.items[this.index++]; }
}

// One traversal function works for ALL collections.
function printAll(iterable: Iterable<number>): void {
  const it = iterable.getIterator();
  while (it.hasNext()) console.log(it.next());
}

printAll(new NumberArray([1, 2, 3]));
printAll(new NumberTree(1, [...]));
printAll(new NumberLinkedList());
```

---

## Structure

```
«interface» Iterable<T>
└── getIterator(): Iterator<T>
     │
     ├── NumberArray → ArrayIterator
     ├── NumberTree  → TreeIterator (e.g., DFS)
     └── NumberLinkedList → LinkedListIterator

«interface» Iterator<T>
├── hasNext(): boolean
└── next(): T
```

### Participants

| Role | Responsibility |
|---|---|
| **Iterator** | Declares `hasNext()` and `next()` |
| **Concrete Iterator** (`ArrayIterator`, …) | Implements traversal for a specific collection |
| **Iterable** | Declares `getIterator()` so clients can obtain an iterator |
| **Concrete Iterable** (`NumberArray`, …) | Returns a concrete iterator configured for its own data |
| **Client** | Uses only the `Iterator` interface to traverse |

---

## How to Implement

1. **Declare the Iterator interface** with `hasNext(): boolean` and `next(): T`.

2. **Declare the Iterable interface** with `getIterator(): Iterator<T>`.

3. **For each collection**, create a Concrete Iterator that stores the current traversal position and implements `hasNext` / `next`.

4. **Implement `getIterator()`** in each collection class to return the appropriate iterator.

5. **Replace all traversal-specific code** in client functions with a single `while (it.hasNext()) it.next()` loop.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
function printArray(col: NumberArray): void {
  for (let i = 0; i < col.items.length; i++) { console.log(col.items[i]); }
}

function printTree(node: NumberTree): void {
  console.log(node.value);
  for (const child of node.children) printTree(child);
}

function printLinkedList(list: NumberLinkedList): void {
  let cur = list.head;
  while (cur) { console.log(cur.value); cur = cur.next; }
}
```

Problems:
- Three separate functions for the same conceptual operation.
- Each knows internals (`.items`, `.head`, `.children`).
- Adding a `NumberStack` collection requires a fourth function everywhere.

### After (solution) — `solution/index.ts`

```typescript
// One function — works for all collection types.
function printAll(iterable: Iterable<number>): void {
  const it = iterable.getIterator();
  while (it.hasNext()) console.log(it.next());
}

printAll(new NumberArray([1, 2, 3]));
printAll(new NumberTree(1, [new NumberTree(2), new NumberTree(3)]));
printAll(linkedList);
```

Benefits:
- Client code has zero knowledge of collection internals.
- Adding a new collection = one new Iterable + Iterator pair; `printAll` unchanged.
- Traversal algorithms (DFS, BFS, pre-order) can be swapped by returning different iterators.

---

## When to Use

- **You want to hide the internal representation** of a collection from clients.
- **You want a uniform traversal interface** across different data structures.
- **You need multiple traversal algorithms** for the same collection (e.g., DFS and BFS over a tree).
- **You don't want traversal logic coupled** to the collection class itself.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Single Responsibility: traversal logic separated from collection | Overkill for simple arrays — JavaScript's `for...of` may be enough |
| Open/Closed: add new collections and iterators independently | Extra classes (one iterator per collection type) |
| Multiple iterators can traverse the same collection simultaneously | Stateful iterators can be surprising if the collection is mutated mid-traversal |
| Uniform interface across all collection types | |

---

## Relations with Other Patterns

- **Composite**: Iterators are frequently used to traverse Composite trees.
- **Visitor**: can walk a structure using an iterator and apply an operation at each node.
- **Memento**: an iterator can save its current traversal position using a Memento.
- **Factory Method**: collections can use a factory method to create their iterator.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Separate traversal functions for `NumberArray`, `NumberTree`, `NumberLinkedList` |
| `solution/index.ts` | `Iterable` + `Iterator` interfaces; each collection exposes `getIterator()` |
| `solution/index.test.ts` | Verifies a single traversal loop produces the same elements for each collection |

**Challenge:** add a `ReverseArrayIterator` that traverses `NumberArray` from last to first — without modifying `NumberArray` or the client traversal loop.
