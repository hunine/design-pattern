// RAW: Cloning a complex object by manually copying each field.
// This breaks whenever a new field is added (easy to forget to copy it),
// fails for deep nested objects (shallow copy bug), and forces callers
// to know every internal detail of the class they are copying.

class Address {
  street: string;
  city: string;

  constructor(street: string, city: string) {
    this.street = street;
    this.city = city;
  }
}

class UserProfile {
  name: string;
  age: number;
  email: string;
  address: Address;
  tags: string[];

  constructor(name: string, age: number, email: string, address: Address, tags: string[]) {
    this.name = name;
    this.age = age;
    this.email = email;
    this.address = address;
    this.tags = tags;
  }
}

const original = new UserProfile(
  "Alice",
  30,
  "alice@example.com",
  new Address("123 Main St", "Springfield"),
  ["admin", "editor"]
);

// Caller must manually know and copy every field.
const clone = new UserProfile(
  original.name,
  original.age,
  original.email,
  original.address, // shallow copy — same Address reference!
  original.tags     // shallow copy — same array reference!
);

// Mutating the clone bleeds into the original.
clone.address.city = "Shelbyville";
clone.tags.push("viewer");

console.log(original.address.city); // "Shelbyville" — unintended mutation
console.log(original.tags);         // ["admin", "editor", "viewer"] — unintended mutation
