// RAW: An analytics library that expects JSON data, but the only available
// stock market data source returns XML. The client must manually do the
// conversion inline every time it needs data, duplicating the parsing logic
// and coupling the business code to a specific data format.

// Third-party analytics library — expects JSON.
class AnalyticsLib {
  analyze(data: { symbol: string; price: number }[]): string {
    const avg = data.reduce((sum, d) => sum + d.price, 0) / data.length;
    return `Average price: $${avg.toFixed(2)}`;
  }
}

// Legacy data source — only speaks XML.
class StockDataSource {
  fetchXML(): string {
    return `
      <stocks>
        <stock><symbol>AAPL</symbol><price>175.50</price></stock>
        <stock><symbol>GOOG</symbol><price>140.20</price></stock>
        <stock><symbol>MSFT</symbol><price>415.00</price></stock>
      </stocks>`;
  }
}

// Client has to parse XML manually every time it needs to call the lib.
function runReport(): void {
  const source = new StockDataSource();
  const xml = source.fetchXML();

  // Inline XML-to-JSON conversion — duplicated everywhere this is needed.
  const matches = [...xml.matchAll(/<stock><symbol>(\w+)<\/symbol><price>([\d.]+)<\/price><\/stock>/g)];
  const jsonData = matches.map((m) => ({ symbol: m[1], price: parseFloat(m[2]) }));

  const lib = new AnalyticsLib();
  console.log(lib.analyze(jsonData));
}

runReport();
