const urls = [
  //"https://www.investing.com/crypto/bitcoin/btc-usd-technical",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/1m",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/5m",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/15m",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/30m",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/1h",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/5h",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/1d",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/1w",
  "https://api.investing.com/api/financialdata/technical/analysis/945629/1mo",
];

async function fetchUrl(url: string): Promise<string> {
  const options = {
    method: "GET",
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();
    return result;
  } catch (err) {
    console.error(err);
    return "fetch error";
  }
}

export async function fetchUrls(): Promise<any> {
  return await fetchUrl(
    "https://api.investing.com/api/financialdata/technical/analysis/945629/1m"
  );
}
