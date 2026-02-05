import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { StockService } from '../../services/stock.service';
import { StockSummary } from '../../models/stock.model';
import { StockTable } from '../../components/stock-table/stock-table';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressSpinnerModule, ButtonModule, StockTable],
  template: `
    <div class="page-wrapper">
      <header class="top-header">
        <div class="header-content">
          <div class="logo">
            <i class="pi pi-chart-line"></i>
            <span>FinanceHub</span>
          </div>
          <nav class="nav-links">
            <a href="#" class="active">Dashboard</a>
            <a href="#">Portfolio</a>
            <a href="#">Watchlist</a>
            <a href="#">Analytics</a>
          </nav>
        </div>
      </header>

      <main class="main-content">
        <div class="page-header">
          <div class="title-section">
            <h1>Market Overview</h1>
            <p>Real-time stock data from NASDAQ · {{ stocks().length }} securities</p>
          </div>
          <div class="actions">
            <p-button
              label="Refresh Data"
              icon="pi pi-refresh"
              [loading]="loading()"
              (click)="loadStocks()"
              severity="secondary"
              [outlined]="true"
            />
          </div>
        </div>

        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-label">Total Stocks</span>
            <span class="stat-value">{{ stocks().length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Gainers</span>
            <span class="stat-value positive">{{ getGainersCount() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Losers</span>
            <span class="stat-value negative">{{ getLosersCount() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Unchanged</span>
            <span class="stat-value neutral">{{ getUnchangedCount() }}</span>
          </div>
        </div>

        @if (loading()) {
          <div class="loading-container">
            <p-progressSpinner strokeWidth="3" />
            <p>Loading market data...</p>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <i class="pi pi-exclamation-circle"></i>
            <h3>Unable to load data</h3>
            <p>{{ error() }}</p>
            <p-button label="Try Again" icon="pi pi-refresh" (click)="loadStocks()" />
          </div>
        } @else {
          <div class="table-container">
            <app-stock-table
              [stocks]="stocks()"
              (stockClick)="onStockClick($event)"
            />
          </div>
        }
      </main>

      <footer class="footer">
        <p>Data provided for educational purposes · Last updated: {{ getCurrentDate() }}</p>
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
      position: sticky;
      top: 0;
      z-index: 100;
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
      letter-spacing: -0.02em;
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

    .nav-links a.active {
      color: white;
      background: rgba(255, 255, 255, 0.15);
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .title-section h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e3a5f;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.02em;
    }

    .title-section p {
      color: #64748b;
      margin: 0;
      font-size: 0.95rem;
    }

    .stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      background: white;
      padding: 1.25rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .stat-label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e3a5f;
    }

    .stat-value.positive {
      color: #059669;
    }

    .stat-value.negative {
      color: #dc2626;
    }

    .stat-value.neutral {
      color: #64748b;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      gap: 1.5rem;
    }

    .loading-container p {
      color: #64748b;
      font-size: 1rem;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      background: white;
      border-radius: 12px;
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

    @media (max-width: 768px) {
      .stats-bar {
        grid-template-columns: repeat(2, 1fr);
      }
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }
      .nav-links {
        display: none;
      }
    }
  `]
})
export class LandingPage implements OnInit {
  private stockService = inject(StockService);
  private router = inject(Router);

  stocks = signal<StockSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadStocks();
  }

  loadStocks() {
    this.loading.set(true);
    this.error.set(null);

    this.stockService.getRandomStocks(100).subscribe({
      next: (data) => {
        this.stocks.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading stocks:', err);
        this.error.set('Failed to load stock data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onStockClick(stock: StockSummary) {
    this.router.navigate(['/stock', stock.symbol]);
  }

  getGainersCount(): number {
    return this.stocks().filter(s => s.variationPercent > 0).length;
  }

  getLosersCount(): number {
    return this.stocks().filter(s => s.variationPercent < 0).length;
  }

  getUnchangedCount(): number {
    return this.stocks().filter(s => s.variationPercent === 0).length;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
