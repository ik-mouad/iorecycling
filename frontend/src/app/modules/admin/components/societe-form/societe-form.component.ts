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
    MatProgressSpinnerModule
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
    private snackBar: MatSnackBar
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
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
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
          this.snackBar.open('Société modifiée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/societes']);
        },
        error: (error) => {
          console.error('Erreur modification société:', error);
          this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      // Mode création (avec ICE)
      const request: CreateSocieteRequest = this.societeForm.value;

      this.societeService.createSociete(request).subscribe({
        next: () => {
          this.snackBar.open('Société créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/societes']);
        },
        error: (error) => {
          console.error('Erreur création société:', error);
          const message = error.error?.message || 'Erreur lors de la création (ICE déjà utilisé ?)';
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
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
      return 'Ce champ est obligatoire';
    }
    if (control.hasError('email')) {
      return 'Email invalide';
    }
    if (control.hasError('pattern')) {
      return 'L\'ICE doit contenir exactement 15 chiffres';
    }
    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    }
    return '';
  }
}
