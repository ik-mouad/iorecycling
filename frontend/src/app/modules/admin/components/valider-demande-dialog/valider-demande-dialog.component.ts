import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { DemandeEnlevement } from '../../../../models/demande.model';

export interface ValiderDemandeDialogData {
  demande: DemandeEnlevement;
}

@Component({
  selector: 'app-valider-demande-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './valider-demande-dialog.component.html',
  styleUrls: ['./valider-demande-dialog.component.scss']
})
export class ValiderDemandeDialogComponent implements OnInit {
  validationForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ValiderDemandeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ValiderDemandeDialogData,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Initialiser le formulaire avec les valeurs de la demande
    const demande = this.data.demande;
    // Parser la date en évitant les problèmes de timezone
    const dateSouhaitee = demande.dateSouhaitee ? this.parseDate(demande.dateSouhaitee) : null;
    
    this.validationForm = this.fb.group({
      dateModifiee: [dateSouhaitee],
      heureModifiee: [demande.heureSouhaitee || '']
    });
  }

  /**
   * Parse une date string (format YYYY-MM-DD) en Date locale sans décalage de timezone
   */
  private parseDate(dateString: string | Date): Date {
    // Si la date est déjà un objet Date, le retourner tel quel
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Parser la date en évitant les problèmes de timezone
    // Format attendu: YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Les mois sont 0-indexés
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    // Fallback sur new Date si le format n'est pas reconnu
    return new Date(dateString);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onValider(): void {
    if (this.validationForm.valid) {
      const formValue = this.validationForm.value;
      const dateModifiee = formValue.dateModifiee ? this.formatDate(formValue.dateModifiee) : null;
      const heureModifiee = formValue.heureModifiee && formValue.heureModifiee.trim() ? formValue.heureModifiee.trim() : null;
      
      // Retourner un objet vide si aucune modification, sinon retourner les valeurs modifiées
      const result: { dateModifiee?: string | null; heureModifiee?: string | null } = {};
      if (dateModifiee) {
        result.dateModifiee = dateModifiee;
      }
      if (heureModifiee) {
        result.heureModifiee = heureModifiee;
      }
      
      this.dialogRef.close(result);
    }
  }

  /**
   * Formate une Date en string YYYY-MM-DD en utilisant les valeurs locales (pas UTC)
   */
  private formatDate(date: Date): string {
    // Utiliser getFullYear(), getMonth(), getDate() pour les valeurs locales
    // et non getUTCFullYear(), etc. pour éviter les décalages de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get dateOriginale(): string {
    if (!this.data.demande.dateSouhaitee) {
      return 'Non spécifiée';
    }
    // Parser la date correctement pour éviter les décalages
    const date = this.parseDate(this.data.demande.dateSouhaitee);
    return date.toLocaleDateString('fr-FR');
  }

  get heureOriginale(): string {
    return this.data.demande.heureSouhaitee || 'Non spécifiée';
  }
}

