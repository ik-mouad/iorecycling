import { Routes } from '@angular/router';
import { ClientDashboardKpisComponent } from './components/client-dashboard-kpis/client-dashboard-kpis.component';
import { DocumentsListComponent } from './components/documents-list/documents-list.component';
import { DemandeFormComponent } from './components/demande-form/demande-form.component';
import { MesDemandesComponent } from './components/mes-demandes/mes-demandes.component';
import { ClientEnlevementsListComponent } from './components/enlevements-list/enlevements-list.component';
import { ClientEnlevementDetailComponent } from './components/enlevement-detail/enlevement-detail.component';
import { ClientLayoutComponent } from './components/client-layout/client-layout.component';

/**
 * Routes du module Client
 */
export const clientRoutes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: ClientDashboardKpisComponent
      },
      {
        path: 'documents',
        component: DocumentsListComponent
      },
      {
        path: 'demandes',
        children: [
          { path: '', component: MesDemandesComponent },
          { path: 'new', component: DemandeFormComponent }
        ]
      },
      {
        path: 'enlevements',
        children: [
          { path: '', component: ClientEnlevementsListComponent },
          { path: ':id', component: ClientEnlevementDetailComponent }
        ]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
