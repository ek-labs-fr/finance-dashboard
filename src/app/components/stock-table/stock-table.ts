import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { StockSummary } from '../../models/stock.model';
import { PriceBadge } from '../price-badge/price-badge';

@Component({
  selector: 'app-stock-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, InputTextModule, IconFieldModule, InputIconModule, Select, PriceBadge],
  template: `
    <p-table
      #dt
      [value]="stocks()"
      [paginator]="true"
      [rows]="20"
      [rowsPerPageOptions]="[10, 20, 50, 100]"
      [sortField]="'symbol'"
      [sortOrder]="1"
      [globalFilterFields]="['symbol', 'name', 'exchange', 'marketCategory', 'industry', 'sector']"
      [tableStyle]="{ 'min-width': '75rem' }"
    >
      <ng-template #caption>
        <div class="table-header">
          <div class="filters-row">
            <p-select
              [options]="exchangeOptions()"
              [(ngModel)]="selectedExchange"
              (onChange)="onFilterChange(dt)"
              placeholder="All Exchanges"
              [showClear]="true"
              styleClass="filter-select"
            />
            <p-select
              [options]="sectorOptions()"
              [(ngModel)]="selectedSector"
              (onChange)="onFilterChange(dt)"
              placeholder="All Sectors"
              [showClear]="true"
              styleClass="filter-select"
            />
            <p-select
              [options]="industryOptions()"
              [(ngModel)]="selectedIndustry"
              (onChange)="onFilterChange(dt)"
              placeholder="All Industries"
              [showClear]="true"
              styleClass="filter-select"
            />
          </div>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              (input)="dt.filterGlobal($any($event.target).value, 'contains')"
              placeholder="Search stocks..."
              class="search-input"
            />
          </p-iconfield>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th pSortableColumn="symbol" style="width: 100px">
            Symbol
            <p-sortIcon field="symbol" />
          </th>
          <th pSortableColumn="name" style="min-width: 200px">
            Company Name
            <p-sortIcon field="name" />
          </th>
          <th pSortableColumn="industry" style="min-width: 180px">
            Industry
            <p-sortIcon field="industry" />
          </th>
          <th pSortableColumn="lastPrice" style="width: 120px">
            Last Price
            <p-sortIcon field="lastPrice" />
          </th>
          <th pSortableColumn="variationPercent" style="width: 120px">
            Change
            <p-sortIcon field="variationPercent" />
          </th>
          <th pSortableColumn="exchange" style="width: 110px">
            Exchange
            <p-sortIcon field="exchange" />
          </th>
          <th pSortableColumn="sector" style="width: 130px">
            Sector
            <p-sortIcon field="sector" />
          </th>
        </tr>
      </ng-template>
      <ng-template #body let-stock>
        <tr (click)="onStockClick(stock)" class="stock-row">
          <td>
            <span class="symbol-badge">{{ stock.symbol }}</span>
          </td>
          <td class="company-name">{{ stock.name }}</td>
          <td class="industry-cell">{{ stock.industry || '—' }}</td>
          <td class="price-cell">\${{ stock.lastPrice.toFixed(2) }}</td>
          <td>
            <app-price-badge [value]="stock.variationPercent" />
          </td>
          <td>
            <p-tag [value]="getExchangeLabel(stock.exchange)" [severity]="getExchangeSeverity(stock.exchange)" />
          </td>
          <td>
            <span class="sector-tag" [attr.data-sector]="stock.sector">{{ stock.sector || '—' }}</span>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [`
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filters-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    :host ::ng-deep .filter-select {
      min-width: 160px;
    }

    .search-input {
      width: 280px;
      border-radius: 8px;
    }

    :host ::ng-deep .p-datatable {
      border: none;
    }

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      padding: 1rem;
      border: none;
    }

    :host ::ng-deep .p-datatable .p-sortable-column:not(.p-datatable-column-sorted):hover {
      background: #2d4a6f !important;
      color: white !important;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      border-bottom: 1px solid #f1f5f9;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.875rem 1rem;
      border: none;
    }

    .stock-row {
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .stock-row:hover {
      background-color: #f8fafc !important;
    }

    .symbol-badge {
      display: inline-block;
      background: linear-gradient(135deg, #1e3a5f 0%, #3b5998 100%);
      color: white;
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.8rem;
      letter-spacing: 0.02em;
    }

    .company-name {
      color: #334155;
      font-weight: 500;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .industry-cell {
      color: #475569;
      font-size: 0.85rem;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .price-cell {
      font-weight: 600;
      color: #1e3a5f;
      font-family: 'SF Mono', 'Menlo', monospace;
    }

    .sector-tag {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #f1f5f9;
      color: #475569;
    }

    .sector-tag[data-sector="Technology"] { background: #dbeafe; color: #1e40af; }
    .sector-tag[data-sector="Healthcare"] { background: #dcfce7; color: #166534; }
    .sector-tag[data-sector="Financial Services"] { background: #fef3c7; color: #92400e; }
    .sector-tag[data-sector="Consumer Cyclical"] { background: #fce7f3; color: #9d174d; }
    .sector-tag[data-sector="Industrials"] { background: #e0e7ff; color: #3730a3; }
    .sector-tag[data-sector="Energy"] { background: #ffedd5; color: #9a3412; }
    .sector-tag[data-sector="Basic Materials"] { background: #d1fae5; color: #065f46; }
    .sector-tag[data-sector="Real Estate"] { background: #ede9fe; color: #5b21b6; }
    .sector-tag[data-sector="Communication Services"] { background: #cffafe; color: #0e7490; }
    .sector-tag[data-sector="Utilities"] { background: #fef9c3; color: #854d0e; }
    .sector-tag[data-sector="Consumer Defensive"] { background: #f3e8ff; color: #7c3aed; }

    :host ::ng-deep .p-paginator {
      border: none;
      background: #f8fafc;
      padding: 1rem;
    }

    :host ::ng-deep .p-datatable-header {
      background: white;
      border: none;
      padding: 1rem;
    }
  `]
})
export class StockTable {
  stocks = input.required<StockSummary[]>();
  stockClick = output<StockSummary>();

  selectedExchange: string | null = null;
  selectedSector: string | null = null;
  selectedIndustry: string | null = null;

  exchangeOptions = computed(() => {
    const exchanges = new Set<string>();
    for (const stock of this.stocks()) {
      if (stock.exchange) exchanges.add(stock.exchange);
    }
    return Array.from(exchanges).sort().map(e => ({
      label: this.getExchangeLabel(e),
      value: e
    }));
  });

  sectorOptions = computed(() => {
    const sectors = new Set<string>();
    for (const stock of this.stocks()) {
      if (stock.sector) sectors.add(stock.sector);
    }
    return Array.from(sectors).sort().map(s => ({ label: s, value: s }));
  });

  industryOptions = computed(() => {
    const industries = new Set<string>();
    for (const stock of this.stocks()) {
      if (stock.industry) industries.add(stock.industry);
    }
    return Array.from(industries).sort().map(i => ({ label: i, value: i }));
  });

  onStockClick(stock: StockSummary) {
    this.stockClick.emit(stock);
  }

  onFilterChange(table: any) {
    if (this.selectedExchange) {
      table.filter(this.selectedExchange, 'exchange', 'equals');
    } else {
      table.filter(null, 'exchange', 'equals');
    }

    if (this.selectedSector) {
      table.filter(this.selectedSector, 'sector', 'equals');
    } else {
      table.filter(null, 'sector', 'equals');
    }

    if (this.selectedIndustry) {
      table.filter(this.selectedIndustry, 'industry', 'equals');
    } else {
      table.filter(null, 'industry', 'equals');
    }
  }

  getExchangeSeverity(exchange: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (exchange) {
      case 'Q': return 'info';
      case 'N': return 'success';
      case 'A': return 'warn';
      case 'P': return 'secondary';
      default: return 'secondary';
    }
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
}
