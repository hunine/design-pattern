interface Transport {
  deliver(cargo: string): string;
}

class Truck implements Transport {
  deliver(cargo: string): string {
    return `Truck delivering "${cargo}" by road`;
  }
}

class Ship implements Transport {
  deliver(cargo: string): string {
    return `Ship delivering "${cargo}" by sea`;
  }
}

abstract class Logistics {
  abstract createTransport(): Transport;

  planDelivery(cargo: string): string {
    const transport = this.createTransport();
    return transport.deliver(cargo);
  }
}

class RoadLogistics extends Logistics {
  createTransport(): Transport {
    return new Truck();
  }
}

class SeaLogistics extends Logistics {
  createTransport(): Transport {
    return new Ship();
  }
}

export { Transport, Logistics, RoadLogistics, SeaLogistics, Truck, Ship };

const road = new RoadLogistics();
console.log(road.planDelivery('furniture'));

const sea = new SeaLogistics();
console.log(sea.planDelivery('oil'));
