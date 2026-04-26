// RAW: Two data miners (CSV and JSON) that share the same algorithmic
// skeleton but duplicate it entirely. Any change to the shared pipeline
// (e.g. adding a logging step) must be made in both classes.

class CSVDataMiner {
  run(filePath: string): void {
    // Step 1: open file
    const raw = this.readFile(filePath);

    // Step 2: parse — CSV-specific
    const rows = raw.split("\n").map((line) => line.split(","));
    console.log(`CSV parsed: ${rows.length} rows`);

    // Step 3: analyze — identical in both classes
    const result = this.analyze(rows.flat());

    // Step 4: report — identical in both classes
    console.log(`CSV report: ${result}`);
  }

  private readFile(path: string): string {
    return `name,age\nAlice,30\nBob,25`; // simulated
  }

  private analyze(values: string[]): string {
    return `${values.length} values processed`;
  }
}

class JSONDataMiner {
  run(filePath: string): void {
    // Step 1: open file — same concept, duplicated
    const raw = this.readFile(filePath);

    // Step 2: parse — JSON-specific
    const data: Record<string, unknown>[] = JSON.parse(raw);
    const rows = data.map((d) => Object.values(d).map(String));
    console.log(`JSON parsed: ${rows.length} records`);

    // Step 3: analyze — copy-paste from CSVDataMiner
    const result = this.analyze(rows.flat());

    // Step 4: report — copy-paste from CSVDataMiner
    console.log(`JSON report: ${result}`);
  }

  private readFile(path: string): string {
    return `[{"name":"Alice","age":30},{"name":"Bob","age":25}]`; // simulated
  }

  private analyze(values: string[]): string {
    return `${values.length} values processed`; // identical to CSVDataMiner
  }
}

new CSVDataMiner().run("data.csv");
new JSONDataMiner().run("data.json");
