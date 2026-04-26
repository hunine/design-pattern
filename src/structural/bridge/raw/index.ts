// RAW: A shape hierarchy that explodes when colors are added.
// Each combination of shape × color requires its own subclass.
// Adding a new color means creating N new classes (one per shape);
// adding a new shape means creating M new classes (one per color).

class Circle {
  radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }
  draw(): string {
    return `Drawing Circle with radius ${this.radius}`;
  }
}

class RedCircle extends Circle {
  draw(): string {
    return `Drawing RED Circle with radius ${this.radius}`;
  }
}

class BlueCircle extends Circle {
  draw(): string {
    return `Drawing BLUE Circle with radius ${this.radius}`;
  }
}

class Square {
  side: number;
  constructor(side: number) {
    this.side = side;
  }
  draw(): string {
    return `Drawing Square with side ${this.side}`;
  }
}

class RedSquare extends Square {
  draw(): string {
    return `Drawing RED Square with side ${this.side}`;
  }
}

class BlueSquare extends Square {
  draw(): string {
    return `Drawing BLUE Square with side ${this.side}`;
  }
}

// To add "GreenTriangle" you must add: Triangle, GreenTriangle, RedTriangle, BlueTriangle...
const shapes = [
  new RedCircle(5),
  new BlueCircle(3),
  new RedSquare(4),
  new BlueSquare(7),
];

shapes.forEach((s) => console.log(s.draw()));
