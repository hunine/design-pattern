// RAW: A vending machine controlled by a giant switch statement.
// Every action must check the current state. Adding a new state or action
// means touching every switch block and every action method.

type VendingState = "idle" | "has_money" | "dispensing" | "out_of_stock";

class VendingMachine {
  private state: VendingState = "idle";
  private stock: number = 3;
  private balance: number = 0;

  insertCoin(amount: number): void {
    switch (this.state) {
      case "idle":
        this.balance += amount;
        this.state = "has_money";
        console.log(`Inserted $${amount}. Balance: $${this.balance}`);
        break;
      case "has_money":
        this.balance += amount;
        console.log(`Added $${amount}. Balance: $${this.balance}`);
        break;
      case "dispensing":
        console.log("Please wait, dispensing...");
        break;
      case "out_of_stock":
        console.log("Out of stock. Coin returned.");
        break;
    }
  }

  pressButton(): void {
    switch (this.state) {
      case "idle":
        console.log("Please insert a coin first.");
        break;
      case "has_money":
        if (this.balance >= 1.0) {
          this.state = "dispensing";
          this.dispense();
        } else {
          console.log(`Not enough money. Need $${(1.0 - this.balance).toFixed(2)} more.`);
        }
        break;
      case "dispensing":
        console.log("Already dispensing.");
        break;
      case "out_of_stock":
        console.log("Out of stock.");
        break;
    }
  }

  private dispense(): void {
    this.stock--;
    this.balance = 0;
    console.log("Dispensing item...");
    this.state = this.stock > 0 ? "idle" : "out_of_stock";
    console.log(this.stock > 0 ? "Done." : "Machine is now empty.");
  }
}

const machine = new VendingMachine();
machine.pressButton();
machine.insertCoin(0.5);
machine.pressButton();
machine.insertCoin(0.5);
machine.pressButton();
