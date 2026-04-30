class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private queryCount: number = 0;

  get count(): number {
    return this.queryCount;
  }

  private constructor(private readonly host: string, private readonly port: number) {
    console.log(`Opening new connection to ${host}:${port}`);
  }

  static getInstance(): DatabaseConnection {
    if (!this.instance) {
      this.instance = new DatabaseConnection("localhost", 5432);
    }

    return this.instance;
  }

  query(sql: string): string {
    this.queryCount++;
    return `Result of "${sql}" from ${this.host}:${this.port}`;
  }

  static reset(): void {
    this.instance = null;
  }
}

export { DatabaseConnection };
