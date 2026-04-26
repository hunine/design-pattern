// RAW: A logistics app that only knows about Trucks.
// Adding a new transport type (Ship) requires touching every place
// that creates transport objects — the createTransport function, the
// planDelivery function, and any other caller. The creation logic is
// scattered and coupled to concrete classes.

class Truck {
  deliver(cargo: string): string {
    return `Truck delivering "${cargo}" by road`;
  }
}

class Ship {
  deliver(cargo: string): string {
    return `Ship delivering "${cargo}" by sea`;
  }
}

function createTransport(type: string): Truck | Ship {
  // Every new transport type requires an edit here AND in every caller.
  if (type === "truck") {
    return new Truck();
  } else if (type === "ship") {
    return new Ship();
  }
  throw new Error(`Unknown transport type: ${type}`);
}

function planDelivery(cargoType: string): void {
  let transport: Truck | Ship;

  // Business logic is also coupled to the transport type string.
  if (cargoType === "land") {
    transport = new Truck();
  } else {
    transport = new Ship();
  }

  console.log(transport.deliver(cargoType));
}

const t = createTransport("truck");
console.log(t.deliver("furniture"));

planDelivery("land");
planDelivery("sea");
