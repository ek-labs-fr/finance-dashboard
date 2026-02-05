export interface StockSummary {
  symbol: string;
  name: string;
  exchange: string;
  marketCategory: string;
  isEtf: boolean;
  lastPrice: number;
  lastDate: string;
  variation: number;
  variationPercent: number;
  // Metadata fields
  shortName?: string;
  industry?: string;
  description?: string;
  website?: string;
  logo?: string;
  ceo?: string;
  marketCap?: number;
  sector?: string;
  tag1?: string;
  tag2?: string;
  tag3?: string;
}

export interface StockPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistory {
  symbol: string;
  prices: StockPrice[];
}

export interface StocksIndex {
  stocks: StockSummary[];
}
