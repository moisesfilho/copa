import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'classificacao',
    loadComponent: () => import('./features/standings/standings').then(m => m.StandingsComponent)
  }
];
