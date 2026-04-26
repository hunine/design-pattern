// RAW: An order system that calculates totals by checking the type of
// each item with instanceof. Client code must know the difference between
// a Product (leaf) and a Box (container), and Box nesting is handled with
// repeated manual recursion instead of a uniform interface.

class Product {
  name: string;
  price: number;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }
}

class Box {
  items: Array<Product | Box>;

  constructor() {
    this.items = [];
  }

  add(item: Product | Box): void {
    this.items.push(item);
  }
}

// Caller is forced to handle each type explicitly.
function calculateTotal(item: Product | Box): number {
  if (item instanceof Product) {
    return item.price;
  }

  // Must manually recurse into Box — and know about Box internals.
  let total = 0;
  for (const child of item.items) {
    if (child instanceof Product) {
      total += child.price;
    } else if (child instanceof Box) {
      total += calculateTotal(child); // duplicated recursion pattern
    }
  }
  return total;
}

const phone = new Product("Phone", 800);
const charger = new Product("Charger", 30);
const headphones = new Product("Headphones", 120);

const smallBox = new Box();
smallBox.add(charger);
smallBox.add(headphones);

const bigBox = new Box();
bigBox.add(phone);
bigBox.add(smallBox);

console.log(`Total: $${calculateTotal(bigBox)}`); // $950
