// RAW: A House class with a telescoping constructor — a long list of
// parameters, most of which are optional. Callers must remember the
// argument order and pass undefined for every option they don't need.
// Adding a new option requires updating every call site.

class House {
  walls: number;
  roof: string;
  floors: number;
  hasGarage: boolean;
  hasSwimmingPool: boolean;
  hasGarden: boolean;
  hasStatues: boolean;

  constructor(
    walls: number,
    roof: string,
    floors: number,
    hasGarage: boolean = false,
    hasSwimmingPool: boolean = false,
    hasGarden: boolean = false,
    hasStatues: boolean = false
  ) {
    this.walls = walls;
    this.roof = roof;
    this.floors = floors;
    this.hasGarage = hasGarage;
    this.hasSwimmingPool = hasSwimmingPool;
    this.hasGarden = hasGarden;
    this.hasStatues = hasStatues;
  }

  describe(): string {
    return (
      `House: ${this.walls} walls, ${this.roof} roof, ${this.floors} floor(s)` +
      (this.hasGarage ? ", garage" : "") +
      (this.hasSwimmingPool ? ", pool" : "") +
      (this.hasGarden ? ", garden" : "") +
      (this.hasStatues ? ", statues" : "")
    );
  }
}

// What does `false, true, false, true` even mean here?
const basicHouse = new House(4, "flat", 1);
const luxuryHouse = new House(4, "mansard", 3, true, true, true, true);
const confusingHouse = new House(4, "gable", 2, false, true, false, true);

console.log(basicHouse.describe());
console.log(luxuryHouse.describe());
console.log(confusingHouse.describe());
