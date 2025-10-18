import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Components
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminClientsComponent } from './components/admin-clients/admin-clients.component';
import { AdminPickupsComponent } from './components/admin-pickups/admin-pickups.component';
import { AdminDocumentsComponent } from './components/admin-documents/admin-documents.component';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { PickupFormComponent } from './components/pickup-form/pickup-form.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';

// Services
import { AdminClientService } from '../../services/admin-client.service';
import { AdminPickupService } from '../../services/admin-pickup.service';

// Routes
import { adminRoutes } from './admin.routes';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminClientsComponent,
    AdminPickupsComponent,
    AdminDocumentsComponent,
    ClientFormComponent,
    PickupFormComponent,
    DocumentUploadComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(adminRoutes),
    
    // Angular Material
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ],
  providers: [
    AdminClientService,
    AdminPickupService
  ]
})
export class AdminModule { }
