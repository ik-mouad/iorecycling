import { Routes } from '@angular/router';
import { SocietesListComponent } from './components/societes-list/societes-list.component';
import { SocieteFormComponent } from './components/societe-form/societe-form.component';
import { SocieteDetailComponent } from './components/societe-detail/societe-detail.component';
import { EnlevementFormComponent } from './components/enlevement-form/enlevement-form.component';
import { EnlevementsListComponent } from './components/enlevements-list/enlevements-list.component';
import { EnlevementDetailComponent } from './components/enlevement-detail/enlevement-detail.component';
import { AdminDemandesListComponent } from './components/admin-demandes-list/admin-demandes-list.component';
import { PlanningCalendarComponent } from './components/planning-calendar/planning-calendar.component';
import { RecurrencesListComponent } from './components/recurrences-list/recurrences-list.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { CamionsListComponent } from './components/camions-list/camions-list.component';
import { CamionFormComponent } from './components/camion-form/camion-form.component';
import { DestinationsListComponent } from './components/destinations-list/destinations-list.component';
import { DestinationFormComponent } from './components/destination-form/destination-form.component';
import { SocietesProprietairesListComponent } from './components/societes-proprietaires-list/societes-proprietaires-list.component';
import { SocieteProprietaireFormComponent } from './components/societe-proprietaire-form/societe-proprietaire-form.component';
import { ComptabiliteDashboardComponent } from './components/comptabilite-dashboard/comptabilite-dashboard.component';
import { TransactionsListComponent } from './components/transactions-list/transactions-list.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { VentesListComponent } from './components/ventes-list/ventes-list.component';
import { VenteFormComponent } from './components/vente-form/vente-form.component';
import { StocksDisponiblesComponent } from './components/stocks-disponibles/stocks-disponibles.component';
import { comptableGuard } from '../../auth/comptable.guard';

/**
 * Routes du module Admin
 */
export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'societes',
        children: [
          { path: '', component: SocietesListComponent },
          { path: 'new', component: SocieteFormComponent },
          { path: ':id', component: SocieteDetailComponent },
          { path: ':id/edit', component: SocieteFormComponent }
        ]
      },
      {
        path: 'enlevements',
        children: [
          { path: '', component: EnlevementsListComponent },
          { path: 'new', component: EnlevementFormComponent },
          { path: ':id', component: EnlevementDetailComponent }
        ]
      },
      {
        path: 'demandes',
        component: AdminDemandesListComponent
      },
      {
        path: 'planning',
        component: PlanningCalendarComponent
      },
      {
        path: 'recurrences',
        component: RecurrencesListComponent
      },
      {
        path: 'camions',
        children: [
          { path: '', component: CamionsListComponent },
          { path: 'new', component: CamionFormComponent },
          { path: ':id/edit', component: CamionFormComponent }
        ]
      },
      {
        path: 'destinations',
        children: [
          { path: '', component: DestinationsListComponent },
          { path: 'new', component: DestinationFormComponent },
          { path: ':id/edit', component: DestinationFormComponent }
        ]
      },
      {
        path: 'societes-proprietaires',
        children: [
          { path: '', component: SocietesProprietairesListComponent },
          { path: 'new', component: SocieteProprietaireFormComponent },
          { path: ':id/edit', component: SocieteProprietaireFormComponent }
        ]
      },
      {
        path: 'comptabilite',
        canActivate: [comptableGuard],
        children: [
          {
            path: '',
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
          }
        ]
      },
      {
        path: 'ventes',
        canActivate: [comptableGuard],
        children: [
          { path: '', component: VentesListComponent },
          { path: 'nouvelle', component: VenteFormComponent },
          { path: 'stocks', component: StocksDisponiblesComponent }
        ]
      },
      {
        path: '',
        redirectTo: 'societes',
        pathMatch: 'full'
      }
    ]
  }
];
