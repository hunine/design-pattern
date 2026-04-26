// RAW: A coffee shop that uses subclasses for every add-on combination.
// Each new ingredient doubles the number of required subclasses.
// With 4 add-ons there are already 16 possible subclasses — impossible to maintain.

class Coffee {
  cost(): number {
    return 2.0;
  }
  description(): string {
    return "Plain coffee";
  }
}

class CoffeeWithMilk extends Coffee {
  cost(): number {
    return 2.5;
  }
  description(): string {
    return "Coffee with milk";
  }
}

class CoffeeWithSugar extends Coffee {
  cost(): number {
    return 2.25;
  }
  description(): string {
    return "Coffee with sugar";
  }
}

class CoffeeWithMilkAndSugar extends Coffee {
  cost(): number {
    return 2.75;
  }
  description(): string {
    return "Coffee with milk and sugar";
  }
}

class CoffeeWithVanilla extends Coffee {
  cost(): number {
    return 3.0;
  }
  description(): string {
    return "Coffee with vanilla";
  }
}

class CoffeeWithMilkAndVanilla extends Coffee {
  cost(): number {
    return 3.5;
  }
  description(): string {
    return "Coffee with milk and vanilla";
  }
}

// Still missing: CoffeeWithSugarAndVanilla, CoffeeWithMilkSugarAndVanilla...
// Adding one new ingredient (e.g. caramel) requires many new classes.

const order1 = new CoffeeWithMilkAndSugar();
console.log(`${order1.description()}: $${order1.cost()}`);

const order2 = new CoffeeWithMilkAndVanilla();
console.log(`${order2.description()}: $${order2.cost()}`);
