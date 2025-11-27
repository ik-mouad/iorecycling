import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SiteService } from '../../../../services/site.service';
import { Site } from '../../../../models/societe.model';

export interface SiteFormData {
  societeId: number;
  site?: Site;
}

@Component({
  selector: 'app-site-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './site-form.component.html',
  styleUrls: ['./site-form.component.scss']
})
export class SiteFormComponent implements OnInit {
  siteForm: FormGroup;
  isEditMode: boolean;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private siteService: SiteService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<SiteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteFormData
  ) {
    this.isEditMode = !!data?.site;
    this.siteForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      adresse: ['']
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.site) {
      this.siteForm.patchValue({
        name: this.data.site.name,
        adresse: this.data.site.adresse || ''
      });
    }
  }

  submit(): void {
    if (this.siteForm.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    const siteData = {
      name: this.siteForm.value.name,
      adresse: this.siteForm.value.adresse || undefined
    };

    if (this.isEditMode && this.data.site) {
      this.siteService.updateSite(this.data.site.id, siteData).subscribe({
        next: () => {
          this.snackBar.open('Site modifié avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erreur modification site:', error);
          this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.siteService.createSite(this.data.societeId, siteData).subscribe({
        next: () => {
          this.snackBar.open('Site créé avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erreur création site:', error);
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.siteForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control?.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    }
    return '';
  }
}

