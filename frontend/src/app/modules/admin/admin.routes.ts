import { Routes } from '@angular/router';
import { RoleGuard } from '../../guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
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
