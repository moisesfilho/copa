import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'partidas',
    loadComponent: () => import('./features/matches/matches-page/matches-page').then(m => m.MatchesPageComponent)
  },
  {
    path: 'classificacao',
    loadComponent: () => import('./features/standings/standings').then(m => m.StandingsComponent)
  },
  {
    path: 'sobre',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  }
];
