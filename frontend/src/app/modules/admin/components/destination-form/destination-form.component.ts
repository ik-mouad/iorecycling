import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { DestinationService } from '../../../../services/destination.service';
import { CreateDestinationRequest, UpdateDestinationRequest, TypeTraitement } from '../../../../models/destination.model';

/**
 * Composant : Formulaire de création/édition de destination
 */
@Component({
  selector: 'app-destination-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './destination-form.component.html',
  styleUrls: ['./destination-form.component.scss']
})
export class DestinationFormComponent implements OnInit {
  destinationForm!: FormGroup;
  isEditMode = false;
  destinationId?: number;
  loading = false;
  typesTraitement = Object.values(TypeTraitement);

  constructor(
    private fb: FormBuilder,
    private destinationService: DestinationService,
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
        this.destinationId = +params['id'];
        this.loadDestination();
      }
    });
  }

  initForm(): void {
    this.destinationForm = this.fb.group({
      raisonSociale: ['', [Validators.required, Validators.maxLength(255)]],
      site: ['', [Validators.required, Validators.maxLength(255)]],
      typesTraitement: [[], [Validators.required, Validators.minLength(1)]],
      nomInterlocuteur: ['', [Validators.maxLength(100)]],
      telInterlocuteur: ['', [Validators.maxLength(20)]],
      posteInterlocuteur: ['', [Validators.maxLength(100)]],
      emailInterlocuteur: ['', [Validators.email, Validators.maxLength(255)]],
      adresse: ['', [Validators.maxLength(500)]],
      observation: ['', [Validators.maxLength(1000)]]
    });
  }


  loadDestination(): void {
    if (!this.destinationId) return;

    this.loading = true;
    this.destinationService.getDestinationById(this.destinationId).subscribe({
      next: (destination) => {
        this.destinationForm.patchValue({
          raisonSociale: destination.raisonSociale,
          site: destination.site,
          typesTraitement: destination.typesTraitement || [],
          nomInterlocuteur: destination.nomInterlocuteur,
          telInterlocuteur: destination.telInterlocuteur,
          posteInterlocuteur: destination.posteInterlocuteur,
          emailInterlocuteur: destination.emailInterlocuteur,
          adresse: destination.adresse,
          observation: destination.observation
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement destination:', error);
        this.snackBar.open('Erreur lors du chargement de la destination', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }


  onSubmit(): void {
    if (this.destinationForm.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.destinationId) {
      const request: UpdateDestinationRequest = this.destinationForm.value;

      this.destinationService.updateDestination(this.destinationId, request).subscribe({
        next: () => {
          this.snackBar.open('Destination modifiée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/destinations']);
        },
        error: (error) => {
          console.error('Erreur modification destination:', error);
          this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      const request: CreateDestinationRequest = this.destinationForm.value;

      this.destinationService.createDestination(request).subscribe({
        next: () => {
          this.snackBar.open('Destination créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/destinations']);
        },
        error: (error) => {
          console.error('Erreur création destination:', error);
          const message = error.error?.message || 'Erreur lors de la création';
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/destinations']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.destinationForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control.hasError('minlength')) {
      return `Au moins ${control.errors?.['minlength'].requiredLength} élément requis`;
    }
    if (control.hasError('email')) {
      return 'Email invalide';
    }
    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    }
    return '';
  }

  getTypeTraitementLabel(type: TypeTraitement): string {
    const labels: { [key in TypeTraitement]: string } = {
      [TypeTraitement.RECYCLAGE]: 'Recyclage',
      [TypeTraitement.REUTILISATION]: 'Réutilisation',
      [TypeTraitement.ENFOUISSEMENT]: 'Enfouissement',
      [TypeTraitement.INCINERATION]: 'Incinération',
      [TypeTraitement.VALORISATION_ENERGETIQUE]: 'Valorisation énergétique',
      [TypeTraitement.DENATURATION_DESTRUCTION]: 'Dénaturation/Destruction',
      [TypeTraitement.TRAITEMENT]: 'Traitement'
    };
    return labels[type] || type;
  }
}

