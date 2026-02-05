const fs = require('fs');
const path = require('path');

// Paths
const stocksIndexPath = path.join(__dirname, '..', 'public', 'data', 'stocks-index.json');
const metadataPath = path.join(__dirname, '..', '..', 'data', 'metadata', 'companies.csv');
const logosSourcePath = path.join(__dirname, '..', '..', 'data', 'metadata', 'logos');
const logosDestPath = path.join(__dirname, '..', 'public', 'logos');

// Parse CSV properly handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Read and parse metadata CSV
function loadMetadata() {
  const content = fs.readFileSync(metadataPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);

  const metadata = {};

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= 1 && values[0]) {
      const ticker = values[0].toUpperCase();
      metadata[ticker] = {
        shortName: values[2] || '',
        industry: values[3] || '',
        description: values[4] || '',
        website: values[5] || '',
        logo: values[6] || '',
        ceo: values[7] || '',
        marketCap: values[9] ? parseFloat(values[9]) || 0 : 0,
        sector: values[10] || '',
        tag1: values[11] || '',
        tag2: values[12] || '',
        tag3: values[13] || ''
      };
    }
  }

  return metadata;
}

// Copy logos to public folder
function copyLogos() {
  if (!fs.existsSync(logosDestPath)) {
    fs.mkdirSync(logosDestPath, { recursive: true });
  }

  if (fs.existsSync(logosSourcePath)) {
    const logos = fs.readdirSync(logosSourcePath);
    let copied = 0;

    for (const logo of logos) {
      const src = path.join(logosSourcePath, logo);
      const dest = path.join(logosDestPath, logo);
      fs.copyFileSync(src, dest);
      copied++;
    }

    console.log(`Copied ${copied} logos to public/logos`);
  } else {
    console.log('Logos source folder not found');
  }
}

// Main function
function main() {
  console.log('Loading metadata from CSV...');
  const metadata = loadMetadata();
  console.log(`Loaded metadata for ${Object.keys(metadata).length} companies`);

  console.log('Loading stocks index...');
  const stocksIndex = JSON.parse(fs.readFileSync(stocksIndexPath, 'utf-8'));
  console.log(`Found ${stocksIndex.stocks.length} stocks`);

  console.log('Merging metadata...');
  let matched = 0;

  for (const stock of stocksIndex.stocks) {
    const meta = metadata[stock.symbol.toUpperCase()];
    if (meta) {
      stock.shortName = meta.shortName;
      stock.industry = meta.industry;
      stock.description = meta.description;
      stock.website = meta.website;
      stock.logo = meta.logo;
      stock.ceo = meta.ceo;
      stock.marketCap = meta.marketCap;
      stock.sector = meta.sector;
      stock.tag1 = meta.tag1;
      stock.tag2 = meta.tag2;
      stock.tag3 = meta.tag3;
      matched++;
    }
  }

  console.log(`Matched metadata for ${matched} stocks`);

  console.log('Writing updated stocks index...');
  fs.writeFileSync(stocksIndexPath, JSON.stringify(stocksIndex, null, 2));

  console.log('Copying logos...');
  copyLogos();

  console.log('Done!');
}

main();
