# Memento

**Category:** Behavioral  
**Also known as:** Snapshot, Token

---

## Intent

Memento is a behavioral pattern that lets you **save and restore the previous state of an object** without revealing the details of its implementation.

The key idea: the object (Originator) creates a snapshot of itself (Memento) that is opaque to the outside world. Only the Originator can read its own Memento — the Caretaker just stores and returns it.

---

## The Problem

A text editor implements undo by exposing its internal fields as public — otherwise the history manager can't read them:

```typescript
class TextEditor {
  // Must be public so the history manager can access them.
  content: string = "";
  cursorPosition: number = 0;

  type(text: string): void { ... }
}

class EditorHistory {
  save(editor: TextEditor): void {
    this.history.push({
      content: editor.content,           // direct field access — breaks encapsulation
      cursorPosition: editor.cursorPosition,
    });
  }

  undo(editor: TextEditor): void {
    const snapshot = this.history.pop();
    editor.content = snapshot.content;             // directly mutates editor
    editor.cursorPosition = snapshot.cursorPosition;
  }
}
```

Problems:
- **Broken encapsulation**: `content` and `cursorPosition` must be public — any code can tamper with them.
- **Tight coupling**: `EditorHistory` knows every internal field of `TextEditor`. Adding a new field (e.g., `selectionRange`) requires updating the history manager too.
- **Fragile**: the snapshot format is duplicated between `save` and `undo`; it's easy for them to get out of sync.

---

## The Solution

The Originator creates and restores its own Memento. The Caretaker (history) treats the Memento as an opaque token:

```typescript
class EditorMemento {
  constructor(
    private readonly content: string,
    private readonly cursorPosition: number
  ) {}

  getContent(): string        { return this.content; }
  getCursorPosition(): number { return this.cursorPosition; }
}

class TextEditor {
  private content: string = "";        // back to private
  private cursorPosition: number = 0; // back to private

  save(): EditorMemento {
    return new EditorMemento(this.content, this.cursorPosition);
  }

  restore(memento: EditorMemento): void {
    this.content        = memento.getContent();
    this.cursorPosition = memento.getCursorPosition();
  }

  type(text: string): void { ... }
}

class EditorHistory {
  private history: EditorMemento[] = [];

  push(memento: EditorMemento): void { this.history.push(memento); }

  undo(editor: TextEditor): void {
    const memento = this.history.pop();
    if (memento) editor.restore(memento);  // editor restores itself — no field access needed
  }
}
```

---

## Structure

```
TextEditor (Originator)
├── -content: string
├── -cursorPosition: number
├── save(): EditorMemento     ← creates a snapshot
└── restore(m: EditorMemento) ← restores from snapshot

EditorMemento (Memento)
├── -content: string          ← opaque to EditorHistory
├── -cursorPosition: number   ← opaque to EditorHistory
└── +getContent() / +getCursorPosition()  ← narrow interface

EditorHistory (Caretaker)
├── -history: EditorMemento[]
├── push(m)
└── undo(editor) → editor.restore(history.pop())
```

### Participants

| Role | Responsibility |
|---|---|
| **Originator** (`TextEditor`) | Creates and applies its own Memento; keeps fields private |
| **Memento** (`EditorMemento`) | Stores the snapshot; exposes only what's needed (ideally nothing to outsiders) |
| **Caretaker** (`EditorHistory`) | Stores mementos; does not inspect their contents; passes them back to the originator |

---

## How to Implement

1. **Determine which state** needs to be captured for undo to work.

2. **Create a Memento class** with those fields as private. Add getters if the originator needs them on restore (or use a nested class for tighter access control).

3. **Add `save(): Memento`** to the Originator — it creates a Memento from its current private state.

4. **Add `restore(m: Memento)`** to the Originator — it reads back from the Memento without the caretaker needing to know the field names.

5. **Implement the Caretaker** with a stack of Mementos. On save, push; on undo, pop and pass to originator.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
// Fields must be public — breaks encapsulation.
class TextEditor {
  content: string = "";
  cursorPosition: number = 0;
}

class EditorHistory {
  save(editor: TextEditor): void {
    this.history.push({ content: editor.content, cursorPosition: editor.cursorPosition });
  }
  undo(editor: TextEditor): void {
    const snap = this.history.pop();
    editor.content = snap.content;          // external mutation of internals
    editor.cursorPosition = snap.cursorPosition;
  }
}
```

Problems:
- Public fields can be read/written by any code.
- History knows the exact structure of `TextEditor` internals.
- Adding `selectionRange` to `TextEditor` requires updating `EditorHistory`.

### After (solution) — `solution/index.ts`

```typescript
class TextEditor {
  private content: string = "";        // private again

  save(): EditorMemento { return new EditorMemento(this.content, this.cursorPosition); }
  restore(m: EditorMemento): void { this.content = m.getContent(); ... }
}

history.push(editor.save());
editor.type("Hello");
history.undo(editor);   // editor restores itself
```

Benefits:
- `content` and `cursorPosition` are private — no external access.
- `EditorHistory` never looks inside `EditorMemento` — it's an opaque token.
- Adding a new field to `TextEditor` only requires updating `save()`, `restore()`, and `EditorMemento` — not `EditorHistory`.

---

## When to Use

- **You need undo/redo** and want to keep the originator's fields private.
- **Taking snapshots of an object's state** so you can restore it later (checkpoints, drafts, transactions).
- **The object's interface would be polluted** by all the getters/setters needed to extract state externally.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Preserves encapsulation of the originator | RAM usage grows if snapshots are taken frequently |
| Caretaker doesn't need to know the originator's structure | Some languages make it hard to ensure the caretaker truly can't read the memento |
| Clean separation between state management and core logic | Copying large objects is expensive |

---

## Relations with Other Patterns

- **Command** + **Memento**: Command implements `undo()` by restoring a Memento created in `execute()`.
- **Iterator** can use a Memento to save its traversal position.
- **Prototype**: cloning an object is simpler than a Memento but doesn't restrict access to the snapshot.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | `TextEditor` exposes public fields so `EditorHistory` can save/restore them |
| `solution/index.ts` | `EditorMemento` is opaque; `TextEditor.save()` and `restore()` keep fields private |
| `solution/index.test.ts` | Verifies that `undo()` restores state without accessing editor fields directly |

**Challenge:** extend the editor with a `selectionStart: number` field. Update only `save()`, `restore()`, and `EditorMemento` — verify that `EditorHistory` requires zero changes.
