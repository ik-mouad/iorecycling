import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Client {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <h1>Gestion des clients</h1>

      <!-- Formulaire d'ajout -->
      <mat-card class="mb-20">
        <mat-card-header>
          <mat-card-title>Ajouter un client</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Nom du client</mat-label>
              <input matInput formControlName="name" placeholder="Nom du client">
              <mat-error *ngIf="clientForm.get('name')?.hasError('required')">
                Le nom est obligatoire
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Code du client</mat-label>
              <input matInput formControlName="code" placeholder="Code unique">
              <mat-error *ngIf="clientForm.get('code')?.hasError('required')">
                Le code est obligatoire
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="clientForm.invalid || loading">
              <mat-icon>add</mat-icon>
              Ajouter
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Table des clients -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Liste des clients</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="loading" class="text-center">
            <mat-spinner></mat-spinner>
            <p>Chargement...</p>
          </div>

          <table mat-table [dataSource]="clients" *ngIf="!loading" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let client">{{ client.id }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-cell *matCellDef="let client">{{ client.name }}</td>
            </ng-container>

            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let client">{{ client.code }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let client">
                <button mat-icon-button color="warn" (click)="deleteClient(client.id)" matTooltip="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="!loading && clients.length === 0" class="text-center">
            <p>Aucun client trouvé</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    .mb-20 {
      margin-bottom: 20px;
    }
    .text-center {
      text-align: center;
    }
    mat-form-field {
      margin-right: 10px;
    }
  `]
})
export class AdminClientsComponent implements OnInit {
  clients: Client[] = [];
  clientForm: FormGroup;
  loading = false;
  displayedColumns: string[] = ['id', 'name', 'code', 'actions'];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  private loadClients(): void {
    this.loading = true;
    this.http.get<Client[]>('/api/admin/clients').subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.loading = true;
      const clientData = this.clientForm.value;
      
      this.http.post<Client>('/api/admin/clients', clientData).subscribe({
        next: (newClient) => {
          this.clients.push(newClient);
          this.clientForm.reset();
          this.loading = false;
          this.snackBar.open('Client ajouté avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du client:', error);
          this.loading = false;
          this.snackBar.open('Erreur lors de l\'ajout du client', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  deleteClient(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.loading = true;
      this.http.delete(`/api/admin/clients/${id}`).subscribe({
        next: () => {
          this.clients = this.clients.filter(client => client.id !== id);
          this.loading = false;
          this.snackBar.open('Client supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du client:', error);
          this.loading = false;
          this.snackBar.open('Erreur lors de la suppression du client', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}
