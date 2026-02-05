import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { StockService } from '../../services/stock.service';
import { StockSummary, StockPrice } from '../../models/stock.model';
import { StockChart } from '../../components/stock-chart/stock-chart';
import { PriceBadge } from '../../components/price-badge/price-badge';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    TagModule,
    StockChart,
    PriceBadge
  ],
  template: `
    <div class="page-wrapper">
      <header class="top-header">
        <div class="header-content">
          <div class="logo" (click)="goBack()" style="cursor: pointer;">
            <i class="pi pi-chart-line"></i>
            <span>FinanceHub</span>
          </div>
          <nav class="nav-links">
            <a (click)="goBack()" style="cursor: pointer;">Dashboard</a>
            <a href="#">Portfolio</a>
            <a href="#">Watchlist</a>
            <a href="#">Analytics</a>
          </nav>
        </div>
      </header>

      <main class="main-content">
        <div class="breadcrumb">
          <a (click)="goBack()"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
        </div>

        @if (loading()) {
          <div class="loading-container">
            <p-progressSpinner strokeWidth="3" />
            <p>Loading stock data...</p>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <i class="pi pi-exclamation-circle"></i>
            <h3>Unable to load stock data</h3>
            <p>{{ error() }}</p>
            <p-button label="Return to Dashboard" icon="pi pi-arrow-left" (click)="goBack()" />
          </div>
        } @else {
          <div class="stock-header-card">
            <div class="stock-identity">
              @if (stock()?.logo) {
                <img [src]="'/logos/' + stock()?.logo" [alt]="stock()?.symbol" class="company-logo" (error)="onLogoError($event)" />
              } @else {
                <div class="symbol-badge">{{ stock()?.symbol }}</div>
              }
              <div class="stock-name">
                <h1>{{ stock()?.name }}</h1>
                <div class="stock-tags">
                  @if (stock()?.exchange) {
                    <p-tag [value]="getExchangeLabel(stock()?.exchange || '')" severity="info" />
                  }
                  @if (stock()?.sector) {
                    <p-tag [value]="stock()?.sector || ''" severity="secondary" />
                  }
                  @if (stock()?.industry) {
                    <p-tag [value]="stock()?.industry || ''" severity="contrast" />
                  }
                </div>
              </div>
            </div>
            <div class="price-section">
              <div class="current-price">\${{ stock()?.lastPrice?.toFixed(2) }}</div>
              @if (stock()?.variationPercent !== undefined) {
                <app-price-badge [value]="stock()!.variationPercent" />
              }
              <div class="price-date">As of {{ stock()?.lastDate }}</div>
            </div>
          </div>

          <div class="content-grid">
            <div class="chart-section">
              <div class="section-header">
                <h2>Price History</h2>
                <span class="data-points">{{ prices().length }} trading days</span>
              </div>
              @if (prices().length > 0) {
                <app-stock-chart [prices]="prices()" [symbol]="symbol()" />
              }
            </div>

            <div class="stats-section">
              <div class="section-header">
                <h2>Key Statistics</h2>
              </div>
              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-label">Open</span>
                  <span class="stat-value">\${{ getLatestPrice()?.open?.toFixed(2) || '—' }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">High</span>
                  <span class="stat-value">\${{ getLatestPrice()?.high?.toFixed(2) || '—' }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Low</span>
                  <span class="stat-value">\${{ getLatestPrice()?.low?.toFixed(2) || '—' }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Close</span>
                  <span class="stat-value">\${{ getLatestPrice()?.close?.toFixed(2) || '—' }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Volume</span>
                  <span class="stat-value">{{ formatVolume(getLatestPrice()?.volume) }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">52W High</span>
                  <span class="stat-value">\${{ get52WeekHigh()?.toFixed(2) || '—' }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">52W Low</span>
                  <span class="stat-value">\${{ get52WeekLow()?.toFixed(2) || '—' }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Avg Volume</span>
                  <span class="stat-value">{{ formatVolume(getAvgVolume()) }}</span>
                </div>
              </div>
            </div>
          </div>

          @if (stock()?.description || stock()?.ceo || stock()?.website || stock()?.marketCap) {
            <div class="company-info-section">
              <div class="section-header">
                <h2>Company Information</h2>
              </div>
              <div class="company-info-grid">
                @if (stock()?.description) {
                  <div class="info-card description-card">
                    <span class="info-label">About</span>
                    <p class="info-description">{{ stock()?.description }}</p>
                  </div>
                }
                <div class="info-details">
                  @if (stock()?.ceo) {
                    <div class="info-item">
                      <span class="info-label">CEO</span>
                      <span class="info-value">{{ stock()?.ceo }}</span>
                    </div>
                  }
                  @if (stock()?.marketCap) {
                    <div class="info-item">
                      <span class="info-label">Market Cap</span>
                      <span class="info-value">{{ formatMarketCap(stock()?.marketCap) }}</span>
                    </div>
                  }
                  @if (stock()?.website) {
                    <div class="info-item">
                      <span class="info-label">Website</span>
                      <a [href]="stock()?.website" target="_blank" rel="noopener" class="info-link">
                        {{ stock()?.website }} <i class="pi pi-external-link"></i>
                      </a>
                    </div>
                  }
                  @if (stock()?.tag1 || stock()?.tag2 || stock()?.tag3) {
                    <div class="info-item">
                      <span class="info-label">Categories</span>
                      <div class="tag-list">
                        @if (stock()?.tag1) {
                          <span class="category-tag">{{ stock()?.tag1 }}</span>
                        }
                        @if (stock()?.tag2) {
                          <span class="category-tag">{{ stock()?.tag2 }}</span>
                        }
                        @if (stock()?.tag3) {
                          <span class="category-tag">{{ stock()?.tag3 }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        }
      </main>

      <footer class="footer">
        <p>Data provided for educational purposes · FinanceHub</p>
      </footer>
    </div>
  `,
  styles: [`
    .page-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .top-header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
      padding: 0 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .logo i {
      font-size: 1.75rem;
      color: #60a5fa;
    }

    .nav-links {
      display: flex;
      gap: 0.5rem;
    }

    .nav-links a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .nav-links a:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .breadcrumb {
      margin-bottom: 1.5rem;
    }

    .breadcrumb a {
      color: #1e3a5f;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: color 0.2s;
    }

    .breadcrumb a:hover {
      color: #3b82f6;
    }

    .stock-header-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .stock-identity {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .company-logo {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: contain;
      background: white;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
    }

    .symbol-badge {
      background: linear-gradient(135deg, #1e3a5f 0%, #3b5998 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1.5rem;
      letter-spacing: 0.02em;
    }

    .stock-name h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e3a5f;
      margin: 0 0 0.5rem 0;
      max-width: 500px;
    }

    .stock-tags {
      display: flex;
      gap: 0.5rem;
    }

    .price-section {
      text-align: right;
    }

    .current-price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 0.5rem;
      font-family: 'SF Mono', 'Menlo', monospace;
    }

    .price-date {
      color: #94a3b8;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
    }

    .chart-section, .stats-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .section-header h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a5f;
      margin: 0;
    }

    .data-points {
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .stat-card {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
    }

    .stat-label {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a5f;
      font-family: 'SF Mono', 'Menlo', monospace;
    }

    .company-info-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-top: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .company-info-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 1.5rem;
    }

    .description-card {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
    }

    .info-description {
      color: #475569;
      font-size: 0.95rem;
      line-height: 1.7;
      margin: 0.5rem 0 0 0;
    }

    .info-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .info-value {
      font-size: 1rem;
      color: #1e3a5f;
      font-weight: 500;
    }

    .info-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      word-break: break-all;
    }

    .info-link:hover {
      text-decoration: underline;
    }

    .info-link i {
      font-size: 0.75rem;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .category-tag {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      background: #e0e7ff;
      color: #3730a3;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      gap: 1rem;
      text-align: center;
    }

    .error-container i {
      font-size: 4rem;
      color: #dc2626;
    }

    .error-container h3 {
      color: #1e3a5f;
      margin: 0;
    }

    .error-container p {
      color: #64748b;
      margin: 0;
    }

    .footer {
      padding: 1.5rem 2rem;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      background: white;
    }

    .footer p {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 0;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      .company-info-grid {
        grid-template-columns: 1fr;
      }
      .stock-header-card {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }
      .stock-identity {
        flex-direction: column;
      }
      .price-section {
        text-align: center;
      }
    }

    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
    }
  `]
})
export class StockDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stockService = inject(StockService);

  symbol = signal('');
  stock = signal<StockSummary | null>(null);
  prices = signal<StockPrice[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const symbolParam = this.route.snapshot.paramMap.get('symbol');
    if (symbolParam) {
      this.symbol.set(symbolParam);
      this.loadStockData(symbolParam);
    } else {
      this.error.set('No stock symbol provided');
      this.loading.set(false);
    }
  }

  loadStockData(symbol: string) {
    this.loading.set(true);
    this.error.set(null);

    const cachedStock = this.stockService.getStockBySymbol(symbol);
    if (cachedStock) {
      this.stock.set(cachedStock);
    }

    this.stockService.getStockHistory(symbol).subscribe({
      next: (data) => {
        this.prices.set(data.prices);

        if (!this.stock()) {
          const lastPrice = data.prices[data.prices.length - 1];
          const prevPrice = data.prices[data.prices.length - 2];
          const variation = lastPrice.close - prevPrice.close;
          const variationPercent = (variation / prevPrice.close) * 100;

          this.stock.set({
            symbol,
            name: symbol,
            exchange: '',
            marketCategory: '',
            isEtf: false,
            lastPrice: lastPrice.close,
            lastDate: lastPrice.date,
            variation,
            variationPercent
          });
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading stock history:', err);
        this.error.set(`Failed to load data for ${symbol}. The stock may not exist.`);
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getExchangeLabel(exchange: string): string {
    switch (exchange) {
      case 'Q': return 'NASDAQ';
      case 'N': return 'NYSE';
      case 'A': return 'AMEX';
      case 'P': return 'ARCA';
      default: return exchange || 'N/A';
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'Q': return 'Global Select';
      case 'G': return 'Global Market';
      case 'S': return 'Capital Market';
      default: return category || 'N/A';
    }
  }

  getLatestPrice(): StockPrice | null {
    const allPrices = this.prices();
    return allPrices.length > 0 ? allPrices[allPrices.length - 1] : null;
  }

  get52WeekHigh(): number | null {
    const allPrices = this.prices();
    const yearPrices = allPrices.slice(-252);
    if (yearPrices.length === 0) return null;
    return Math.max(...yearPrices.map(p => p.high));
  }

  get52WeekLow(): number | null {
    const allPrices = this.prices();
    const yearPrices = allPrices.slice(-252);
    if (yearPrices.length === 0) return null;
    return Math.min(...yearPrices.map(p => p.low));
  }

  getAvgVolume(): number | null {
    const allPrices = this.prices();
    const recentPrices = allPrices.slice(-30);
    if (recentPrices.length === 0) return null;
    const total = recentPrices.reduce((sum, p) => sum + p.volume, 0);
    return Math.round(total / recentPrices.length);
  }

  formatVolume(volume: number | null | undefined): string {
    if (volume == null) return '—';
    if (volume >= 1000000000) return (volume / 1000000000).toFixed(2) + 'B';
    if (volume >= 1000000) return (volume / 1000000).toFixed(2) + 'M';
    if (volume >= 1000) return (volume / 1000).toFixed(2) + 'K';
    return volume.toString();
  }

  formatMarketCap(marketCap: number | null | undefined): string {
    if (marketCap == null || marketCap === 0) return '—';
    if (marketCap >= 1000000000000) return '$' + (marketCap / 1000000000000).toFixed(2) + 'T';
    if (marketCap >= 1000000000) return '$' + (marketCap / 1000000000).toFixed(2) + 'B';
    if (marketCap >= 1000000) return '$' + (marketCap / 1000000).toFixed(2) + 'M';
    return '$' + marketCap.toLocaleString();
  }

  onLogoError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
