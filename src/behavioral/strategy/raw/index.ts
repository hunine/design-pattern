// RAW: A navigator with all routing algorithms baked into one class.
// Switching algorithms requires editing the class. Algorithms can't be
// tested independently, and adding a new one bloats the Navigator further.

class Navigator {
  private routeType: string;

  constructor(routeType: string) {
    this.routeType = routeType;
  }

  buildRoute(from: string, to: string): string {
    // All strategies live inside one giant method.
    if (this.routeType === "car") {
      return this.buildCarRoute(from, to);
    } else if (this.routeType === "walking") {
      return this.buildWalkingRoute(from, to);
    } else if (this.routeType === "transit") {
      return this.buildTransitRoute(from, to);
    } else if (this.routeType === "cycling") {
      return this.buildCyclingRoute(from, to);
    }
    throw new Error(`Unknown route type: ${this.routeType}`);
  }

  // All algorithms are private methods of the same class — hard to test alone.
  private buildCarRoute(from: string, to: string): string {
    return `Car route: ${from} → highway → ${to} (fastest road path)`;
  }

  private buildWalkingRoute(from: string, to: string): string {
    return `Walking route: ${from} → sidewalks → ${to} (shortest walking path)`;
  }

  private buildTransitRoute(from: string, to: string): string {
    return `Transit route: ${from} → bus stop → subway → ${to}`;
  }

  private buildCyclingRoute(from: string, to: string): string {
    return `Cycling route: ${from} → bike lane → ${to} (avoids hills)`;
  }
}

const carNav     = new Navigator("car");
const walkNav    = new Navigator("walking");
const transitNav = new Navigator("transit");

console.log(carNav.buildRoute("Home", "Office"));
console.log(walkNav.buildRoute("Home", "Park"));
console.log(transitNav.buildRoute("Hotel", "Airport"));
