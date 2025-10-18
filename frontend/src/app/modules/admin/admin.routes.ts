import { Routes } from '@angular/router';
import { RoleGuard } from '../../guards/role.guard';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'clients',
        pathMatch: 'full'
      },
      {
        path: 'clients',
        loadComponent: () => import('./components/admin-clients/admin-clients.component').then(m => m.AdminClientsComponent)
      },
      {
        path: 'pickups',
        loadComponent: () => import('./components/admin-pickups/admin-pickups.component').then(m => m.AdminPickupsComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./components/admin-documents/admin-documents.component').then(m => m.AdminDocumentsComponent)
      }
    ]
  }
];
