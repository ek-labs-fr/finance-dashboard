import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { StockSummary, StockHistory, StocksIndex } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private stocksCache = signal<StockSummary[]>([]);
  private randomStocksCache = signal<StockSummary[]>([]);

  loadStocksIndex(): Observable<StocksIndex> {
    return this.http.get<StocksIndex>('/data/stocks-index.json').pipe(
      tap(data => this.stocksCache.set(data.stocks))
    );
  }

  getRandomStocks(count: number): Observable<StockSummary[]> {
    return this.loadStocksIndex().pipe(
      map(data => {
        const stocks = [...data.stocks];
        const shuffled = stocks.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        this.randomStocksCache.set(selected);
        return selected;
      })
    );
  }

  getStockHistory(symbol: string): Observable<StockHistory> {
    return this.http.get<StockHistory>(`/data/prices/${symbol}.json`);
  }

  getStockBySymbol(symbol: string): StockSummary | undefined {
    return this.stocksCache().find(s => s.symbol === symbol) ||
           this.randomStocksCache().find(s => s.symbol === symbol);
  }

  getCachedStocks(): StockSummary[] {
    return this.stocksCache();
  }

  getCachedRandomStocks(): StockSummary[] {
    return this.randomStocksCache();
  }
}
