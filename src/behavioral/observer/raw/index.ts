// RAW: A store that notifies customers by hardcoding calls to each one.
// Adding or removing a subscriber requires editing the Store class.
// The store is coupled to every concrete subscriber type.

class EmailCustomer {
  name: string;
  constructor(name: string) { this.name = name; }
  sendEmail(product: string): void {
    console.log(`Email to ${this.name}: "${product}" is back in stock!`);
  }
}

class SMSCustomer {
  phone: string;
  constructor(phone: string) { this.phone = phone; }
  sendSMS(product: string): void {
    console.log(`SMS to ${this.phone}: "${product}" is back in stock!`);
  }
}

class PushCustomer {
  deviceId: string;
  constructor(deviceId: string) { this.deviceId = deviceId; }
  pushNotification(product: string): void {
    console.log(`Push to device ${this.deviceId}: "${product}" is back in stock!`);
  }
}

class Store {
  // Store must hold a reference to every concrete subscriber type.
  private emailCustomers: EmailCustomer[] = [];
  private smsCustomers: SMSCustomer[] = [];
  private pushCustomers: PushCustomer[] = [];

  addEmailCustomer(c: EmailCustomer): void { this.emailCustomers.push(c); }
  addSMSCustomer(c: SMSCustomer): void { this.smsCustomers.push(c); }
  addPushCustomer(c: PushCustomer): void { this.pushCustomers.push(c); }

  restock(product: string): void {
    console.log(`Store restocked: ${product}`);
    // Must call a different method on each subscriber type.
    this.emailCustomers.forEach((c) => c.sendEmail(product));
    this.smsCustomers.forEach((c) => c.sendSMS(product));
    this.pushCustomers.forEach((c) => c.pushNotification(product));
    // Adding a new subscriber type (e.g. WebhookCustomer) means editing this method.
  }
}

const store = new Store();
store.addEmailCustomer(new EmailCustomer("Alice"));
store.addSMSCustomer(new SMSCustomer("+1-555-0100"));
store.addPushCustomer(new PushCustomer("device-abc-123"));

store.restock("iPhone 16");
