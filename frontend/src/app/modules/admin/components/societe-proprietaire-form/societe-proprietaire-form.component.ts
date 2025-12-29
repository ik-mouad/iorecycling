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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { SocieteProprietaireService } from '../../../../services/societe-proprietaire.service';
import { CreateSocieteProprietaireRequest, UpdateSocieteProprietaireRequest, SocieteProprietaire } from '../../../../models/societe-proprietaire.model';

/**
 * Composant : Formulaire de création/édition de société propriétaire
 */
@Component({
  selector: 'app-societe-proprietaire-form',
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
    MatSlideToggleModule
  ],
  templateUrl: './societe-proprietaire-form.component.html',
  styleUrls: ['./societe-proprietaire-form.component.scss']
})
export class SocieteProprietaireFormComponent implements OnInit {
  societeProprietaireForm!: FormGroup;
  isEditMode = false;
  societeProprietaireId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private societeProprietaireService: SocieteProprietaireService,
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
        this.societeProprietaireId = +params['id'];
        this.loadSocieteProprietaire();
      }
    });
  }

  initForm(): void {
    this.societeProprietaireForm = this.fb.group({
      raisonSociale: ['', [Validators.required, Validators.maxLength(255)]],
      contact: ['', [Validators.maxLength(100)]],
      telephone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      adresse: ['', [Validators.maxLength(500)]],
      observation: ['', [Validators.maxLength(1000)]],
      actif: [true]
    });
  }

  loadSocieteProprietaire(): void {
    if (!this.societeProprietaireId) return;

    this.loading = true;
    this.societeProprietaireService.getSocieteProprietaireById(this.societeProprietaireId).subscribe({
      next: (societe) => {
        this.societeProprietaireForm.patchValue({
          raisonSociale: societe.raisonSociale,
          contact: societe.contact,
          telephone: societe.telephone,
          email: societe.email,
          adresse: societe.adresse,
          observation: societe.observation,
          actif: societe.actif
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement société propriétaire:', error);
        this.snackBar.open('Erreur lors du chargement de la société propriétaire', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.societeProprietaireForm.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.societeProprietaireId) {
      const request: UpdateSocieteProprietaireRequest = this.societeProprietaireForm.value;
      this.societeProprietaireService.updateSocieteProprietaire(this.societeProprietaireId, request).subscribe({
        next: () => {
          this.snackBar.open('Société propriétaire modifiée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/societes-proprietaires']);
        },
        error: (error) => {
          console.error('Erreur modification société propriétaire:', error);
          this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      const request: CreateSocieteProprietaireRequest = this.societeProprietaireForm.value;
      this.societeProprietaireService.createSocieteProprietaire(request).subscribe({
        next: () => {
          this.snackBar.open('Société propriétaire créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/societes-proprietaires']);
        },
        error: (error) => {
          console.error('Erreur création société propriétaire:', error);
          const message = error.error?.message || 'Erreur lors de la création';
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/societes-proprietaires']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.societeProprietaireForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control.hasError('email')) {
      return 'Email invalide';
    }
    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    }
    return '';
  }
}

