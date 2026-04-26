// RAW: A text editor where buttons call editor methods directly.
// There is no history of what was done, so undo/redo is impossible.
// Every button is tightly coupled to a specific editor method — reusing
// the same operation from a different trigger (menu, hotkey) requires
// duplicating the call.

class TextEditor {
  private content: string = "";

  write(text: string): void {
    this.content += text;
    console.log(`Wrote: "${text}" → content: "${this.content}"`);
  }

  deleteLastWord(): void {
    const lastSpace = this.content.lastIndexOf(" ");
    this.content = lastSpace === -1 ? "" : this.content.slice(0, lastSpace);
    console.log(`Deleted last word → content: "${this.content}"`);
  }

  getContent(): string {
    return this.content;
  }
}

// Buttons are directly coupled to editor methods — no abstraction layer.
class WriteButton {
  private editor: TextEditor;
  private text: string;

  constructor(editor: TextEditor, text: string) {
    this.editor = editor;
    this.text = text;
  }

  click(): void {
    // No command object is created; nothing is recorded for undo.
    this.editor.write(this.text);
  }
}

class DeleteButton {
  private editor: TextEditor;

  constructor(editor: TextEditor) {
    this.editor = editor;
  }

  click(): void {
    this.editor.deleteLastWord();
  }
}

const editor = new TextEditor();
const writeHello = new WriteButton(editor, "Hello ");
const writeWorld = new WriteButton(editor, "World");
const deleteBtn  = new DeleteButton(editor);

writeHello.click();
writeWorld.click();
deleteBtn.click();

// Undo is impossible — no history of commands was ever saved.
console.log(`Final content: "${editor.getContent()}"`);
