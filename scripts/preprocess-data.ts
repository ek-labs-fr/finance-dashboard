import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data/nasdaq_stock_prices');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const PRICES_DIR = path.join(OUTPUT_DIR, 'prices');

interface StockMeta {
  Symbol: string;
  'Security Name': string;
  'Listing Exchange': string;
  'Market Category': string;
  ETF: string;
}

interface PriceRow {
  Date: string;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  'Adj Close': string;
  Volume: string;
}

interface StockSummary {
  symbol: string;
  name: string;
  exchange: string;
  marketCategory: string;
  isEtf: boolean;
  lastPrice: number;
  lastDate: string;
  variation: number;
  variationPercent: number;
}

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(PRICES_DIR)) {
  fs.mkdirSync(PRICES_DIR, { recursive: true });
}

console.log('Reading metadata file...');
const metaContent = fs.readFileSync(path.join(DATA_DIR, 'symbols_valid_meta.csv'), 'utf-8');
const metadata: StockMeta[] = parse(metaContent, { columns: true, skip_empty_lines: true });

// Filter to only non-ETF stocks
const stocks = metadata.filter(m => m.ETF !== 'Y');
console.log(`Found ${stocks.length} non-ETF stocks`);

const stocksIndex: StockSummary[] = [];
let processed = 0;
let skipped = 0;

for (const meta of stocks) {
  const symbol = meta.Symbol;
  const stockFile = path.join(DATA_DIR, 'stocks', `${symbol}.csv`);

  if (!fs.existsSync(stockFile)) {
    skipped++;
    continue;
  }

  try {
    const priceContent = fs.readFileSync(stockFile, 'utf-8');
    const prices: PriceRow[] = parse(priceContent, { columns: true, skip_empty_lines: true });

    if (prices.length < 2) {
      skipped++;
      continue;
    }

    // Get last two prices for variation calculation
    const lastRow = prices[prices.length - 1];
    const prevRow = prices[prices.length - 2];

    const lastPrice = parseFloat(lastRow.Close);
    const prevPrice = parseFloat(prevRow.Close);

    if (isNaN(lastPrice) || isNaN(prevPrice) || prevPrice === 0) {
      skipped++;
      continue;
    }

    const variation = lastPrice - prevPrice;
    const variationPercent = (variation / prevPrice) * 100;

    stocksIndex.push({
      symbol,
      name: meta['Security Name']?.trim() || symbol,
      exchange: meta['Listing Exchange']?.trim() || '',
      marketCategory: meta['Market Category']?.trim() || '',
      isEtf: false,
      lastPrice: Math.round(lastPrice * 100) / 100,
      lastDate: lastRow.Date,
      variation: Math.round(variation * 100) / 100,
      variationPercent: Math.round(variationPercent * 100) / 100
    });

    // Write individual price file
    const priceData = prices.map(p => ({
      date: p.Date,
      open: parseFloat(p.Open),
      high: parseFloat(p.High),
      low: parseFloat(p.Low),
      close: parseFloat(p.Close),
      volume: parseInt(p.Volume) || 0
    }));

    fs.writeFileSync(
      path.join(PRICES_DIR, `${symbol}.json`),
      JSON.stringify({ symbol, prices: priceData })
    );

    processed++;

    if (processed % 500 === 0) {
      console.log(`Processed ${processed} stocks...`);
    }
  } catch (error) {
    console.error(`Error processing ${symbol}:`, error);
    skipped++;
  }
}

// Write index file
console.log('Writing stocks index...');
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'stocks-index.json'),
  JSON.stringify({ stocks: stocksIndex }, null, 2)
);

console.log(`\nDone!`);
console.log(`Processed: ${processed} stocks`);
console.log(`Skipped: ${skipped} stocks`);
console.log(`Output: ${OUTPUT_DIR}`);
