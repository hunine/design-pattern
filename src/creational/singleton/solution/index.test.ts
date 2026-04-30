import { DatabaseConnection } from "./index";

describe("Singleton", () => {
  beforeEach(() => {
    DatabaseConnection.reset();
  });

  it("getInstance() always returns the same instance", () => {
    const conn1 = DatabaseConnection.getInstance();
    const conn2 = DatabaseConnection.getInstance();
    expect(conn1).toBe(conn2);
  });

  it("query count is shared across all references", () => {
    const conn1 = DatabaseConnection.getInstance();
    const conn2 = DatabaseConnection.getInstance();
    conn1.query("SELECT * FROM users");
    conn2.query("SELECT * FROM orders");
    expect(conn1.queryCount).toBe(2);
    expect(conn2.queryCount).toBe(2);
  });

  it("query() returns a result string containing the SQL", () => {
    const conn = DatabaseConnection.getInstance();
    const result = conn.query("SELECT 1");
    expect(result).toContain("SELECT 1");
  });

  it("reset() allows a fresh instance to be created (bonus)", () => {
    const conn1 = DatabaseConnection.getInstance();
    DatabaseConnection.reset();
    const conn2 = DatabaseConnection.getInstance();
    expect(conn1).not.toBe(conn2);
  });
});
