import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { StockPrice } from '../../models/stock.model';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule, ChartModule, SelectButtonModule, FormsModule],
  template: `
    <div class="chart-container">
      <div class="time-selector">
        <p-selectButton
          [options]="timeRangeOptions"
          [(ngModel)]="selectedRange"
          (onChange)="onRangeChange()"
          optionLabel="label"
          optionValue="value"
          styleClass="time-buttons"
        />
      </div>
      <p-chart type="line" [data]="chartData()" [options]="chartOptions" height="350px" />
    </div>
  `,
  styles: [`
    .chart-container {
      padding: 0.5rem 0;
    }
    .time-selector {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    :host ::ng-deep .time-buttons .p-button {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      font-weight: 500;
    }
    :host ::ng-deep .time-buttons .p-button.p-highlight {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
      border-color: #1e3a5f;
    }
  `]
})
export class StockChart {
  prices = input.required<StockPrice[]>();
  symbol = input.required<string>();

  selectedRange: TimeRange = '1Y';
  rangeSignal = signal<TimeRange>('1Y');

  timeRangeOptions = [
    { label: '1M', value: '1M' as TimeRange },
    { label: '3M', value: '3M' as TimeRange },
    { label: '6M', value: '6M' as TimeRange },
    { label: '1Y', value: '1Y' as TimeRange },
    { label: 'All', value: 'ALL' as TimeRange }
  ];

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#1e3a5f',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b5998',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 8,
          color: '#64748b',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        position: 'right' as const,
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          },
          callback: (value: any) => '$' + value.toFixed(0)
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
        hoverBorderWidth: 2
      }
    }
  };

  chartData = computed(() => {
    const allPrices = this.prices();
    const filteredPrices = this.filterByRange(allPrices, this.rangeSignal());

    const labels = filteredPrices.map(p => this.formatDate(p.date));
    const data = filteredPrices.map(p => p.close);

    const firstPrice = data[0] || 0;
    const lastPrice = data[data.length - 1] || 0;
    const isPositive = lastPrice >= firstPrice;

    // Use dark blue shades for the chart
    const lineColor = isPositive ? '#1e3a5f' : '#dc2626';
    const fillColor = isPositive ? 'rgba(30, 58, 95, 0.08)' : 'rgba(220, 38, 38, 0.08)';

    return {
      labels,
      datasets: [
        {
          label: this.symbol(),
          data,
          fill: true,
          borderColor: lineColor,
          backgroundColor: fillColor,
          tension: 0.3,
          borderWidth: 2.5,
          pointBackgroundColor: lineColor,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: '#fff'
        }
      ]
    };
  });

  onRangeChange() {
    this.rangeSignal.set(this.selectedRange);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private filterByRange(prices: StockPrice[], range: TimeRange): StockPrice[] {
    if (range === 'ALL' || prices.length === 0) {
      // For ALL, sample every nth point to avoid overcrowding
      if (prices.length > 500) {
        const step = Math.ceil(prices.length / 500);
        return prices.filter((_, i) => i % step === 0 || i === prices.length - 1);
      }
      return prices;
    }

    const now = new Date(prices[prices.length - 1].date);
    let startDate: Date;

    switch (range) {
      case '1M':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        return prices;
    }

    return prices.filter(p => new Date(p.date) >= startDate);
  }
}
