import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass()">
      <i [class]="iconClass()"></i>
      {{ formattedValue() }}
    </span>
  `,
  styles: [`
    span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .positive {
      background-color: rgba(34, 197, 94, 0.1);
      color: #16a34a;
    }
    .negative {
      background-color: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }
    .neutral {
      background-color: rgba(107, 114, 128, 0.1);
      color: #6b7280;
    }
  `]
})
export class PriceBadge {
  value = input.required<number>();
  showPercent = input(true);

  badgeClass = computed(() => {
    const val = this.value();
    if (val > 0) return 'positive';
    if (val < 0) return 'negative';
    return 'neutral';
  });

  iconClass = computed(() => {
    const val = this.value();
    if (val > 0) return 'pi pi-arrow-up';
    if (val < 0) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  });

  formattedValue = computed(() => {
    const val = this.value();
    const sign = val > 0 ? '+' : '';
    if (this.showPercent()) {
      return `${sign}${val.toFixed(2)}%`;
    }
    return `${sign}${val.toFixed(2)}`;
  });
}
