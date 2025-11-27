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
        path: '',
        redirectTo: 'societes',
        pathMatch: 'full'
      }
    ]
  }
];
