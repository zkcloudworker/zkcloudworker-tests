import puppeteer from "puppeteer-extra";
// Add stealth plugin and use defaults
import pluginStealth from "puppeteer-extra-plugin-stealth";

// Use stealth
puppeteer.use(pluginStealth());

// List of URLs

const mainPage = "https://www.investing.com/crypto/bitcoin/btc-usd-technical";

const urls: { period: string; url: string }[] = [
  {
    period: "1 minute",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/1m",
  },
  {
    period: "5 minutes",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/5m",
  },
  {
    period: "15 minutes",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/15m",
  },
  {
    period: "30 minutes",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/30m",
  },
  {
    period: "1 hour",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/1h",
  },
  {
    period: "5 hours",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/5h",
  },
  {
    period: "1 day",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/1d",
  },
  {
    period: "1 week",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/1w",
  },
  {
    period: "1 month",
    url: "https://api.investing.com/api/financialdata/technical/analysis/945629/1mo",
  },
];

// Function to fetch pivot points from a single URL
async function fetchPivotPoints(page: any, url: any) {
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Get the HTML content of the page
  const html = await page.content();

  // Extract the JSON string containing the pivotPoints data
  const jsonString = html.match(/<pre>(.*?)<\/pre>/s)[1];

  // Parse the JSON string
  const data = JSON.parse(jsonString);
  const pivotPoints = data.pivotPoints;

  return pivotPoints;
}

async function fetchMainPage(page: any, url: any) {
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Get the HTML content of the page
  const html = await page.content();

  return html;
}

// Main function to extract pivot points from all URLs
export async function getPivotPoints(): Promise<any> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const priceData: {
    mainPage: any;
    indicators: { period: string; pivotPoints: any }[];
  } = { mainPage: "", indicators: [] };

  for (const url of urls) {
    try {
      const pivotPoints = await fetchPivotPoints(page, url.url);
      priceData.indicators.push({ period: url.period, pivotPoints });
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  }

  await browser.close();
  return priceData;
}
