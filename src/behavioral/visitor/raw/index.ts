// RAW: Geometry classes that keep growing as new operations are added.
// Every new operation (export to XML, calculate area, render to SVG) requires
// adding a new method to every shape class. The shapes are constantly modified
// for unrelated reasons, violating the Open/Closed Principle.

class Circle {
  radius: number;
  constructor(radius: number) { this.radius = radius; }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  // New operation added directly to the class.
  exportToXML(): string {
    return `<circle radius="${this.radius}" />`;
  }

  // Another new operation bloating the class.
  renderToSVG(): string {
    return `<circle r="${this.radius}" />`;
  }
}

class Rectangle {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  area(): number {
    return this.width * this.height;
  }

  exportToXML(): string {
    return `<rectangle width="${this.width}" height="${this.height}" />`;
  }

  renderToSVG(): string {
    return `<rect width="${this.width}" height="${this.height}" />`;
  }
}

class Triangle {
  base: number;
  height: number;
  constructor(base: number, height: number) {
    this.base = base;
    this.height = height;
  }

  area(): number {
    return 0.5 * this.base * this.height;
  }

  exportToXML(): string {
    return `<triangle base="${this.base}" height="${this.height}" />`;
  }

  renderToSVG(): string {
    return `<polygon points="..." />`; // simplified
  }
}

const shapes = [new Circle(5), new Rectangle(4, 6), new Triangle(3, 8)];

shapes.forEach((s) => console.log(s.exportToXML()));
shapes.forEach((s) => console.log(s.renderToSVG()));
shapes.forEach((s) => console.log(`Area: ${s.area().toFixed(2)}`));
