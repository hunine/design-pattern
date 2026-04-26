// RAW: A service that loads a high-resolution image directly on every access.
// There is no lazy loading, no caching, and no access control — the expensive
// operation runs unconditionally even if the result is never used.

class HeavyImage {
  private filename: string;
  private data: string;

  constructor(filename: string) {
    this.filename = filename;
    // Expensive operation runs immediately in the constructor.
    this.data = this.loadFromDisk(filename);
  }

  private loadFromDisk(filename: string): string {
    console.log(`Loading heavy image from disk: ${filename}`);
    return `<binary data of ${filename}>`;
  }

  display(): string {
    return `Displaying: ${this.data}`;
  }
}

// The image is loaded from disk the moment it is instantiated,
// even if display() is never called.
const img1 = new HeavyImage("photo_4k.png");
const img2 = new HeavyImage("background_8k.png"); // loaded even if not displayed

// Simulate: only one of the images is actually shown.
console.log(img1.display());
// img2 was loaded for nothing.

// Also: no access control — anyone can call display() with no auth check.
