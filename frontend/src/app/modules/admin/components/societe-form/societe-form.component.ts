import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { SocieteService } from '../../../../services/societe.service';
import { CreateSocieteRequest, UpdateSocieteRequest } from '../../../../models/societe.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';

/**
 * Composant : Formulaire de création/édition de société
 */
@Component({
  selector: 'app-societe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './societe-form.component.html',
  styleUrls: ['./societe-form.component.scss']
})
export class SocieteFormComponent implements OnInit {
  societeForm!: FormGroup;
  isEditMode = false;
  societeId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private societeService: SocieteService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.societeId = +params['id'];
        this.loadSociete();
      }
    });
  }

  initForm(): void {
    this.societeForm = this.fb.group({
      raisonSociale: ['', [Validators.required, Validators.maxLength(255)]],
      ice: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telephone: ['', [Validators.maxLength(20)]],
      commentaire: ['']
    });
  }

  loadSociete(): void {
    if (!this.societeId) return;

    this.loading = true;
    this.societeService.getSocieteById(this.societeId).subscribe({
      next: (societe) => {
        this.societeForm.patchValue({
          raisonSociale: societe.raisonSociale,
          ice: societe.ice,
          email: societe.email,
          telephone: societe.telephone,
          commentaire: societe.commentaire
        });
        
        // ICE non modifiable en mode édition
        this.societeForm.get('ice')?.disable();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement société:', error);
        this.snackBar.open('Erreur lors du chargement de la société', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.societeForm.invalid) {
      this.snackBar.open(this.i18n.t('errors.formErrors'), this.i18n.t('common.close'), { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.societeId) {
      // Mode édition (sans ICE)
      const request: UpdateSocieteRequest = {
        raisonSociale: this.societeForm.value.raisonSociale,
        email: this.societeForm.value.email,
        telephone: this.societeForm.value.telephone,
        commentaire: this.societeForm.value.commentaire
      };

      this.societeService.updateSociete(this.societeId, request).subscribe({
        next: () => {
          this.snackBar.open(this.i18n.t('success.updated'), this.i18n.t('common.close'), { duration: 3000 });
          this.router.navigate(['/admin/societes']);
        },
        error: (error) => {
          console.error('Erreur modification société:', error);
          this.snackBar.open(this.i18n.t('errors.generic'), this.i18n.t('common.close'), { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      // Mode création (avec ICE)
      const request: CreateSocieteRequest = this.societeForm.value;

      this.societeService.createSociete(request).subscribe({
        next: () => {
          this.snackBar.open(this.i18n.t('success.created'), this.i18n.t('common.close'), { duration: 3000 });
          this.router.navigate(['/admin/societes']);
        },
        error: (error) => {
          console.error('Erreur création société:', error);
          const message = error.error?.message || this.i18n.t('errors.generic');
          this.snackBar.open(message, this.i18n.t('common.close'), { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/societes']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.societeForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) {
      if (fieldName === 'raisonSociale') return this.i18n.t('societe.raisonSocialeRequired');
      if (fieldName === 'ice') return this.i18n.t('societe.iceRequired');
      if (fieldName === 'email') return this.i18n.t('societe.emailRequired');
      return this.i18n.t('common.fieldRequired');
    }
    if (control.hasError('email')) {
      return this.i18n.t('societe.emailInvalid');
    }
    if (control.hasError('pattern')) {
      return this.i18n.t('societe.iceInvalid');
    }
    if (control.hasError('maxlength')) {
      return this.i18n.t('common.maxLength', { length: control.errors?.['maxlength'].requiredLength });
    }
    return '';
  }
}
