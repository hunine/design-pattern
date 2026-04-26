// RAW: UI components that reference each other directly.
// Each component must know about all other components it affects,
// creating a tightly-coupled web. Adding a new component means
// updating every existing component that interacts with it.

class LoginButton {
  private usernameInput: UsernameInput;
  private passwordInput: PasswordInput;
  private errorLabel: ErrorLabel;

  constructor(usernameInput: UsernameInput, passwordInput: PasswordInput, errorLabel: ErrorLabel) {
    this.usernameInput = usernameInput;
    this.passwordInput = passwordInput;
    this.errorLabel = errorLabel;
  }

  click(): void {
    const user = this.usernameInput.getValue();
    const pass = this.passwordInput.getValue();

    if (!user || !pass) {
      this.errorLabel.show("Username and password are required");
      return;
    }

    if (user === "admin" && pass === "secret") {
      this.errorLabel.hide();
      console.log("Login successful");
    } else {
      this.errorLabel.show("Invalid credentials");
      this.passwordInput.clear(); // directly manipulates another component
    }
  }
}

class UsernameInput {
  private value: string = "";
  setValue(v: string): void { this.value = v; }
  getValue(): string { return this.value; }
}

class PasswordInput {
  private value: string = "";
  setValue(v: string): void { this.value = v; }
  getValue(): string { return this.value; }
  clear(): void { this.value = ""; }
}

class ErrorLabel {
  private message: string = "";
  show(msg: string): void { this.message = msg; console.log(`Error: ${msg}`); }
  hide(): void { this.message = ""; }
}

const username = new UsernameInput();
const password = new PasswordInput();
const error    = new ErrorLabel();
const button   = new LoginButton(username, password, error);

username.setValue("admin");
password.setValue("wrong");
button.click();

username.setValue("admin");
password.setValue("secret");
button.click();
