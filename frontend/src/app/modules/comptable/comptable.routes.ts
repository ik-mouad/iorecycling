import { Routes } from '@angular/router';
import { ComptableLayoutComponent } from './components/comptable-layout/comptable-layout.component';
import { ComptabiliteDashboardComponent } from '../admin/components/comptabilite-dashboard/comptabilite-dashboard.component';

/**
 * Routes du module Comptable
 */
export const comptableRoutes: Routes = [
  {
    path: '',
    component: ComptableLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: ComptabiliteDashboardComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

