import { Routes } from '@angular/router';
import { ComptableLayoutComponent } from './components/comptable-layout/comptable-layout.component';
import { ComptabiliteDashboardComponent } from '../admin/components/comptabilite-dashboard/comptabilite-dashboard.component';
import { TransactionsListComponent } from '../admin/components/transactions-list/transactions-list.component';
import { TransactionFormComponent } from '../admin/components/transaction-form/transaction-form.component';
import { VentesListComponent } from '../admin/components/ventes-list/ventes-list.component';
import { VenteFormComponent } from '../admin/components/vente-form/vente-form.component';
import { StocksDisponiblesComponent } from '../admin/components/stocks-disponibles/stocks-disponibles.component';
import { EnlevementDetailComponent } from '../admin/components/enlevement-detail/enlevement-detail.component';

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
        path: 'transactions',
        component: TransactionsListComponent
      },
      {
        path: 'transactions/new',
        component: TransactionFormComponent
      },
      {
        path: 'transactions/:id',
        component: TransactionFormComponent
      },
      {
        path: 'transactions/:id/edit',
        component: TransactionFormComponent
      },
      {
        path: 'ventes',
        component: VentesListComponent
      },
      {
        path: 'ventes/nouvelle',
        component: VenteFormComponent
      },
      {
        path: 'ventes/:id',
        component: VenteFormComponent
      },
      {
        path: 'stocks',
        component: StocksDisponiblesComponent
      },
      {
        path: 'enlevements/:id',
        component: EnlevementDetailComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

