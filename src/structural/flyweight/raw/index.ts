// RAW: A forest renderer that allocates a full object for every single tree,
// including the heavy texture data that is identical across thousands of trees
// of the same species. With 100,000 trees this wastes enormous memory.

class Tree {
  x: number;
  y: number;
  name: string;
  color: string;
  texture: string; // imagine this is a large bitmap — duplicated per tree

  constructor(x: number, y: number, name: string, color: string, texture: string) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = color;
    this.texture = texture;
  }

  draw(): string {
    return `Drawing ${this.name} tree at (${this.x}, ${this.y}) [texture: ${this.texture.slice(0, 20)}...]`;
  }
}

class Forest {
  private trees: Tree[] = [];

  plantTree(x: number, y: number, name: string, color: string, texture: string): void {
    // A brand-new object with its own copy of texture for every single tree.
    this.trees.push(new Tree(x, y, name, color, texture));
  }

  draw(): void {
    this.trees.forEach((t) => console.log(t.draw()));
  }

  memoryUsage(): number {
    return this.trees.length; // each entry carries the full texture payload
  }
}

const HEAVY_TEXTURE = "A".repeat(1000); // simulates a large texture blob

const forest = new Forest();
for (let i = 0; i < 10; i++) {
  forest.plantTree(i * 10, i * 5, "Oak", "green", HEAVY_TEXTURE);
  forest.plantTree(i * 10, i * 5 + 3, "Pine", "dark-green", HEAVY_TEXTURE);
}

forest.draw();
console.log(`Total tree objects (each with full texture copy): ${forest.memoryUsage()}`);
