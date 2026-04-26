// RAW: A UI toolkit that directly instantiates platform-specific widgets.
// Adding a new platform (Linux) means editing the renderUI function and
// every other place that checks the OS. The platform check logic is
// duplicated across the codebase.

class WindowsButton {
  render(): string {
    return "Rendering a Windows button";
  }
  onClick(): string {
    return "Windows button clicked";
  }
}

class MacButton {
  render(): string {
    return "Rendering a Mac button";
  }
  onClick(): string {
    return "Mac button clicked";
  }
}

class WindowsCheckbox {
  render(): string {
    return "Rendering a Windows checkbox";
  }
  isChecked(): boolean {
    return false;
  }
}

class MacCheckbox {
  render(): string {
    return "Rendering a Mac checkbox";
  }
  isChecked(): boolean {
    return true;
  }
}

// The OS check is repeated everywhere widgets are needed.
function renderUI(os: string): void {
  let button: WindowsButton | MacButton;
  let checkbox: WindowsCheckbox | MacCheckbox;

  if (os === "windows") {
    button = new WindowsButton();
    checkbox = new WindowsCheckbox();
  } else if (os === "mac") {
    button = new MacButton();
    checkbox = new MacCheckbox();
  } else {
    throw new Error(`Unsupported OS: ${os}`);
  }

  console.log(button.render());
  console.log(checkbox.render());
}

renderUI("windows");
renderUI("mac");
