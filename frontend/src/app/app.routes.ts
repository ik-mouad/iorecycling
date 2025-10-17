import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'simple',
    loadComponent: () => import('./components/simple-test/simple-test.component').then(m => m.SimpleTestComponent)
  },
  {
    path: 'test',
    loadComponent: () => import('./components/test-dashboard/test-dashboard.component').then(m => m.TestDashboardComponent)
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
