import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'client',
    loadComponent: () => import('./components/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-clients/admin-clients.component').then(m => m.AdminClientsComponent),
    canActivate: [authGuard, roleGuard('ADMIN')]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
