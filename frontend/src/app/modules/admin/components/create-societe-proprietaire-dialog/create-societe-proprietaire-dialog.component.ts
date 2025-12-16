import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SocieteProprietaireService } from '../../../../services/societe-proprietaire.service';
import { CreateSocieteProprietaireRequest, SocieteProprietaire } from '../../../../models/societe-proprietaire.model';

/**
 * Dialogue pour créer rapidement une société propriétaire depuis le formulaire de camion
 */
@Component({
  selector: 'app-create-societe-proprietaire-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add_business</mat-icon>
      Nouvelle société propriétaire
    </h2>

    <mat-dialog-content>
      <form [formGroup]="societeForm" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Raison sociale *</mat-label>
          <input matInput formControlName="raisonSociale" placeholder="Ex: Transport ABC S.A.">
          <mat-error *ngIf="societeForm.get('raisonSociale')?.hasError('required')">
            Ce champ est obligatoire
          </mat-error>
        </mat-form-field>

        <div class="form-section">
          <h3>Coordonnées</h3>
          
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Contact</mat-label>
              <input matInput formControlName="contact" placeholder="Ex: Mohamed BENALI">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="telephone" placeholder="Ex: +212 6XX XXX XXX">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Ex: contact@example.com">
            <mat-error *ngIf="societeForm.get('email')?.hasError('email')">
              Email invalide
            </mat-error>
          </mat-form-field>
        </div>

        <mat-slide-toggle formControlName="actif" class="full-width">
          Société active
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" [disabled]="loading">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading || societeForm.invalid">
        <mat-spinner *ngIf="loading" diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
        Créer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    mat-dialog-content {
      padding: 24px;
      min-height: 300px;
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .form-section h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 16px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
    }
  `]
})
export class CreateSocieteProprietaireDialogComponent {
  societeForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private societeProprietaireService: SocieteProprietaireService,
    private dialogRef: MatDialogRef<CreateSocieteProprietaireDialogComponent>
  ) {
    this.societeForm = this.fb.group({
      raisonSociale: ['', [Validators.required, Validators.maxLength(255)]],
      contact: ['', [Validators.maxLength(100)]],
      telephone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      actif: [true]
    });
  }

  onSubmit(): void {
    if (this.societeForm.invalid) {
      return;
    }

    this.loading = true;
    const request: CreateSocieteProprietaireRequest = this.societeForm.value;

    this.societeProprietaireService.createSocieteProprietaire(request).subscribe({
      next: (societe: SocieteProprietaire) => {
        this.dialogRef.close(societe);
      },
      error: (error) => {
        console.error('Erreur création société propriétaire:', error);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

