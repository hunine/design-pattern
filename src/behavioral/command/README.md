# Command

**Category:** Behavioral  
**Also known as:** Action, Transaction

---

## Intent

Command is a behavioral design pattern that **turns a request into a stand-alone object** that contains all information about the request.

The key idea: wrap the method call, its parameters, and the receiver object inside a command object. You can then queue commands, log them, pass them around, and reverse them (undo).

---

## The Problem

Buttons call editor methods directly. Nothing is recorded, so undo is impossible:

```typescript
class WriteButton {
  click(): void {
    // Direct call — nothing is saved for undo.
    this.editor.write(this.text);
  }
}

class DeleteButton {
  click(): void {
    this.editor.deleteLastWord(); // no history
  }
}

// After 3 operations: "Hello World" → "Hello" (after delete)
// Undo is impossible — no history of commands was ever saved.
```

Problems:
- **No history**: once a method is called, there's no record of what happened.
- **Undo/redo is impossible** without a complete redesign.
- **Tight coupling**: every button is coupled to a specific receiver and method.
- **Duplication**: if a menu item and a keyboard shortcut do the same thing, both must call `editor.write()` directly — duplicating the logic.

---

## The Solution

Define a `Command` interface with `execute()` and `undo()`. Each concrete command wraps a receiver and stores enough state to reverse itself:

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class WriteCommand implements Command {
  private backup: string = "";

  constructor(private editor: TextEditor, private text: string) {}

  execute(): void {
    this.backup = this.editor.getContent(); // save state before change
    this.editor.write(this.text);
  }

  undo(): void {
    this.editor.setContent(this.backup); // restore saved state
  }
}

class CommandHistory {
  private history: Command[] = [];
  push(c: Command): void { this.history.push(c); }
  undo(): void { this.history.pop()?.undo(); }
}

// Any trigger (button, hotkey, menu) can execute the same command.
const cmd = new WriteCommand(editor, "Hello");
history.push(cmd);
cmd.execute();
history.undo(); // editor content goes back to what it was
```

---

## Structure

```
«interface» Command
├── execute(): void
└── undo(): void

WriteCommand (Concrete Command)
├── editor: TextEditor   ← Receiver
├── text: string
├── backup: string
├── execute() → editor.write(text); backup old state
└── undo()    → editor.setContent(backup)

CommandHistory (Invoker)
└── history: Command[]
     ├── push(cmd)
     └── undo() → history.pop().undo()

TextEditor (Receiver)
├── write(text)
└── setContent(text)
```

### Participants

| Role | Responsibility |
|---|---|
| **Command** | Declares `execute()` and `undo()` |
| **Concrete Command** (`WriteCommand`) | Wraps a receiver; implements execute/undo; stores backup state |
| **Invoker** (`CommandHistory`) | Stores and executes commands; triggers undo |
| **Receiver** (`TextEditor`) | Performs the actual work when the command delegates to it |
| **Client** | Creates commands and hands them to the invoker |

---

## How to Implement

1. **Declare the Command interface** with at minimum `execute()`. Add `undo()` if reversibility is needed.

2. **Create Concrete Commands** — one per operation. Each stores a reference to the receiver and enough state (backup) to undo.

3. **Create an Invoker** (e.g., `CommandHistory`) that stores a list of commands. The invoker calls `execute()` on new commands and `undo()` on the last one.

4. **Replace direct method calls** in buttons/menus/shortcuts with command creation + `history.push(cmd); cmd.execute()`.

5. **Receivers** (`TextEditor`) don't need to change at all — commands call their existing methods.

---

## Code Walkthrough

### Before (raw) — `raw/index.ts`

```typescript
class WriteButton {
  click(): void {
    this.editor.write(this.text); // coupled; no history
  }
}

// Undo is impossible — no history of commands was ever saved.
console.log(`Final content: "${editor.getContent()}"`);
```

Problems:
- No record of what was done.
- Buttons are coupled to specific methods on specific objects.
- Redo and macro recording are impossible.

### After (solution) — `solution/index.ts`

```typescript
const writeHello = new WriteCommand(editor, "Hello ");
history.push(writeHello);
writeHello.execute();

const writeWorld = new WriteCommand(editor, "World");
history.push(writeWorld);
writeWorld.execute();

history.undo(); // removes "World"
console.log(editor.getContent()); // "Hello "
history.undo(); // removes "Hello "
console.log(editor.getContent()); // ""
```

Benefits:
- Full undo/redo support with no changes to `TextEditor`.
- Commands are reusable across buttons, menus, and keyboard shortcuts.
- History enables macro recording.

---

## When to Use

- **You need undo/redo**: store the list of commands; call `undo()` in reverse.
- **You need to queue or schedule operations**: store commands and execute later.
- **You need to parameterise objects with operations**: pass a command as a callback.
- **You want to implement transactional behaviour**: roll back by calling `undo()` on all executed commands.

---

## Pros and Cons

| Pros | Cons |
|---|---|
| Single Responsibility: separates UI from business logic | More classes — one per operation |
| Open/Closed: add new commands without changing invoker | Simple cases may not justify the overhead |
| Supports undo/redo, queuing, and macro recording | |
| Commands are first-class objects — loggable, serialisable | |

---

## Relations with Other Patterns

- **Chain of Responsibility**: CoR routes the request; Command encapsulates it.
- **Memento** can be used inside a Command's `undo()` to restore state.
- **Strategy** describes different ways to do the same thing. Command turns different things into objects.
- **Prototype** can be used to copy commands before pushing to history.

---

## Practice

| File | Description |
|---|---|
| `raw/index.ts` | Buttons call editor methods directly; no history, no undo |
| `solution/index.ts` | `WriteCommand`, `DeleteCommand`, `CommandHistory` — full undo support |
| `solution/index.test.ts` | Verifies that `undo()` restores the editor to its previous state |

**Challenge:** add a `RedoHistory` so that after undoing, you can `redo()` to reapply the undone command.
