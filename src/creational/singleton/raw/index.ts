// RAW: Every call to getConnection() creates a new database connection.
// This wastes resources, breaks shared state, and causes subtle bugs when
// different parts of the app operate on different connection instances.

class DatabaseConnection {
  private host: string;
  private port: number;
  queryCount: number = 0;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    console.log(`Opening new connection to ${host}:${port}`);
  }

  query(sql: string): string {
    this.queryCount++;
    return `Result of "${sql}" from ${this.host}:${this.port}`;
  }
}

function getConnection(): DatabaseConnection {
  // A new instance is created on every call — no sharing.
  return new DatabaseConnection("localhost", 5432);
}

const conn1 = getConnection();
const conn2 = getConnection();

conn1.query("SELECT * FROM users");
conn2.query("SELECT * FROM orders");

console.log(conn1 === conn2); // false — two separate connections
console.log(conn1.queryCount); // 1, doesn't know about conn2's queries
console.log(conn2.queryCount); // 1, each tracks state independently
