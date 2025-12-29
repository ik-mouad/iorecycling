import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ComptabiliteService } from '../../../../services/comptabilite.service';
import { CreatePaiementRequest, ModePaiement } from '../../../../models/comptabilite.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface AddPaiementDialogData {
  transactionId: number;
  montantRestant: number;
}

@Component({
  selector: 'app-add-paiement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>payment</mat-icon>
      Ajouter un paiement
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="paiementForm" class="paiement-form">
        <mat-form-field appearance="outline">
          <mat-label>Montant (MAD)</mat-label>
          <input matInput type="number" formControlName="montant" [max]="data.montantRestant" step="0.01">
          <mat-hint>Montant restant: {{ data.montantRestant | number:'1.2-2' }} MAD</mat-hint>
          <mat-error *ngIf="paiementForm.get('montant')?.hasError('required')">
            Le montant est obligatoire
          </mat-error>
          <mat-error *ngIf="paiementForm.get('montant')?.hasError('min')">
            Le montant doit être supérieur à 0
          </mat-error>
          <mat-error *ngIf="paiementForm.get('montant')?.hasError('max')">
            Le montant ne peut pas dépasser {{ data.montantRestant | number:'1.2-2' }} MAD
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Date de paiement</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="datePaiement">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Mode de paiement</mat-label>
          <mat-select formControlName="modePaiement">
            <mat-option value="ESPECES">Espèces</mat-option>
            <mat-option value="CHEQUE">Chèque</mat-option>
            <mat-option value="VIREMENT">Virement</mat-option>
            <mat-option value="CARTE_BANCAIRE">Carte bancaire</mat-option>
            <mat-option value="AUTRE">Autre</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Référence (optionnel)</mat-label>
          <input matInput formControlName="reference" maxlength="100">
          <mat-hint>Ex: Numéro de virement, chèque, etc.</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Notes (optionnel)</mat-label>
          <textarea matInput formControlName="notes" rows="3" maxlength="500"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="paiementForm.invalid || loading">
        <mat-icon *ngIf="!loading">save</mat-icon>
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Enregistrer</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .paiement-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding-top: 16px;
    }
    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
    mat-dialog-actions {
      padding: 16px 24px;
    }
    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class AddPaiementDialogComponent implements OnInit {
  paiementForm!: FormGroup;
  loading = false;
  ModePaiement = ModePaiement;

  constructor(
    private fb: FormBuilder,
    private comptabiliteService: ComptabiliteService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddPaiementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPaiementDialogData
  ) {}

  ngOnInit(): void {
    this.paiementForm = this.fb.group({
      montant: [null, [Validators.required, Validators.min(0.01), Validators.max(this.data.montantRestant)]],
      datePaiement: [new Date(), Validators.required],
      modePaiement: ['VIREMENT', Validators.required],
      reference: [''],
      notes: ['']
    });
  }

  save(): void {
    if (this.paiementForm.invalid) return;

    this.loading = true;
    const formValue = this.paiementForm.value;
    
    const request: CreatePaiementRequest = {
      transactionId: this.data.transactionId,
      montant: formValue.montant,
      datePaiement: formValue.datePaiement.toISOString().split('T')[0],
      modePaiement: formValue.modePaiement,
      reference: formValue.reference || undefined,
      notes: formValue.notes || undefined
    };

    this.comptabiliteService.createPaiement(request).subscribe({
      next: () => {
        this.snackBar.open('Paiement enregistré avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erreur création paiement:', error);
        const errorMessage = error?.error?.message || 'Erreur lors de l\'enregistrement du paiement';
        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

