// RAW: A text editor that implements undo by exposing its internal state.
// To save a snapshot, external code must read private fields directly.
// This breaks encapsulation — any code can inspect or tamper with the
// editor's internals, and adding new state requires updating all snapshot code.

class TextEditor {
  // Must be public so the history manager can read and restore it.
  content: string = "";
  cursorPosition: number = 0;

  type(text: string): void {
    this.content =
      this.content.slice(0, this.cursorPosition) +
      text +
      this.content.slice(this.cursorPosition);
    this.cursorPosition += text.length;
  }

  getState(): string {
    return `content="${this.content}", cursor=${this.cursorPosition}`;
  }
}

// History must know about every field of TextEditor.
class EditorHistory {
  // Stores raw snapshots of internal fields — tightly coupled to TextEditor internals.
  private history: Array<{ content: string; cursorPosition: number }> = [];

  save(editor: TextEditor): void {
    this.history.push({
      content: editor.content,           // direct field access
      cursorPosition: editor.cursorPosition, // direct field access
    });
  }

  undo(editor: TextEditor): void {
    const snapshot = this.history.pop();
    if (!snapshot) {
      console.log("Nothing to undo");
      return;
    }
    editor.content = snapshot.content;             // directly mutates editor internals
    editor.cursorPosition = snapshot.cursorPosition;
    console.log(`Undid → ${editor.getState()}`);
  }
}

const editor = new TextEditor();
const history = new EditorHistory();

history.save(editor);
editor.type("Hello");
console.log(editor.getState());

history.save(editor);
editor.type(" World");
console.log(editor.getState());

history.undo(editor);
console.log(editor.getState());

history.undo(editor);
console.log(editor.getState());
