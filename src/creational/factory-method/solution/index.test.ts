import { Logistics, RoadLogistics, SeaLogistics } from "./index";

describe("Factory Method", () => {
  it("RoadLogistics.planDelivery() returns a road delivery message", () => {
    const logistics: Logistics = new RoadLogistics();
    const result = logistics.planDelivery("furniture");
    expect(result).toContain("road");
  });

  it("SeaLogistics.planDelivery() returns a sea delivery message", () => {
    const logistics: Logistics = new SeaLogistics();
    const result = logistics.planDelivery("oil");
    expect(result).toContain("sea");
  });

  it("planDelivery() includes the cargo name in the output", () => {
    const logistics: Logistics = new RoadLogistics();
    const result = logistics.planDelivery("electronics");
    expect(result).toContain("electronics");
  });

  it("planDelivery() works via the abstract Logistics type (no concrete class needed)", () => {
    const creators: Logistics[] = [new RoadLogistics(), new SeaLogistics()];
    creators.forEach((l) => {
      expect(typeof l.planDelivery("cargo")).toBe("string");
    });
  });

  it("RoadLogistics and SeaLogistics produce different output for the same cargo", () => {
    const road: Logistics = new RoadLogistics();
    const sea: Logistics = new SeaLogistics();
    expect(road.planDelivery("cargo")).not.toBe(sea.planDelivery("cargo"));
  });
});
