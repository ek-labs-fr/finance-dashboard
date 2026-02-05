import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.LandingPage)
  },
  {
    path: 'stock/:symbol',
    loadComponent: () => import('./pages/stock-detail/stock-detail').then(m => m.StockDetailPage)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
