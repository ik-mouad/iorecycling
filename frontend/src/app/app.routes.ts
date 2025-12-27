import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard, clientGuard } from './auth/role.guard';
import { comptableGuard } from './auth/comptable.guard';

/**
 * Routes principales de l'application
 */
export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'login',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'client',
    canActivate: [authGuard, clientGuard],
    loadChildren: () => import('./modules/client/client.routes').then(m => m.clientRoutes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
