import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CamionService } from '../../../../services/camion.service';
import { SocieteProprietaireService } from '../../../../services/societe-proprietaire.service';
import { CreateCamionRequest, UpdateCamionRequest, TypeCamion } from '../../../../models/camion.model';
import { SocieteProprietaire } from '../../../../models/societe-proprietaire.model';
import { CreateSocieteProprietaireDialogComponent } from '../create-societe-proprietaire-dialog/create-societe-proprietaire-dialog.component';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

/**
 * Composant : Formulaire de création/édition de camion
 */
@Component({
  selector: 'app-camion-form',
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
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule,
    TranslatePipe
  ],
  templateUrl: './camion-form.component.html',
  styleUrls: ['./camion-form.component.scss']
})
export class CamionFormComponent implements OnInit {
  camionForm!: FormGroup;
  isEditMode = false;
  camionId?: number;
  loading = false;
  societesProprietaires: SocieteProprietaire[] = [];
  typesCamion = Object.values(TypeCamion);

  constructor(
    private fb: FormBuilder,
    private camionService: CamionService,
    private societeProprietaireService: SocieteProprietaireService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSocietesProprietaires();
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.camionId = +params['id'];
        this.loadCamion();
      }
    });
  }

  initForm(): void {
    this.camionForm = this.fb.group({
      matricule: ['', [Validators.required, Validators.maxLength(50)]],
      tonnageMaxKg: ['', [Validators.required, Validators.min(0.01)]],
      typeCamion: ['', Validators.required],
      observation: ['', [Validators.maxLength(1000)]],
      societeProprietaireId: ['', Validators.required],
      actif: [true]
    });
  }

  loadSocietesProprietaires(): void {
    this.societeProprietaireService.getActiveSocietesProprietaires().subscribe({
      next: (societes) => {
        this.societesProprietaires = societes;
      },
      error: (error) => {
        console.error('Erreur chargement sociétés propriétaires:', error);
      }
    });
  }

  openCreateSocieteProprietaireDialog(): void {
    const dialogRef = this.dialog.open(CreateSocieteProprietaireDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recharger la liste des sociétés propriétaires
        this.loadSocietesProprietaires();
        // Sélectionner la nouvelle société créée
        setTimeout(() => {
          this.camionForm.patchValue({ societeProprietaireId: result.id });
        }, 100);
      }
    });
  }

  loadCamion(): void {
    if (!this.camionId) return;

    this.loading = true;
    this.camionService.getCamionById(this.camionId).subscribe({
      next: (camion) => {
        this.camionForm.patchValue({
          matricule: camion.matricule,
          tonnageMaxKg: camion.tonnageMaxKg,
          typeCamion: camion.typeCamion,
          observation: camion.observation,
          societeProprietaireId: camion.societeProprietaireId,
          actif: camion.actif
        });
        
        // Matricule non modifiable en mode édition
        this.camionForm.get('matricule')?.disable();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement camion:', error);
        this.snackBar.open('Erreur lors du chargement du camion', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.camionForm.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.camionId) {
      // Mode édition (sans matricule)
      const formValue = this.camionForm.getRawValue();
      const request: UpdateCamionRequest = {
        tonnageMaxKg: formValue.tonnageMaxKg,
        typeCamion: formValue.typeCamion,
        observation: formValue.observation,
        societeProprietaireId: formValue.societeProprietaireId,
        actif: formValue.actif
      };

      this.camionService.updateCamion(this.camionId, request).subscribe({
        next: () => {
          this.snackBar.open('Camion modifié avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/camions']);
        },
        error: (error) => {
          console.error('Erreur modification camion:', error);
          this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      // Mode création (avec matricule)
      const request: CreateCamionRequest = this.camionForm.value;

      this.camionService.createCamion(request).subscribe({
        next: () => {
          this.snackBar.open('Camion créé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/camions']);
        },
        error: (error) => {
          console.error('Erreur création camion:', error);
          const message = error.error?.message || 'Erreur lors de la création (matricule déjà utilisé ?)';
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/camions']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.camionForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control.hasError('min')) {
      return 'Le tonnage doit être supérieur à 0';
    }
    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    }
    return '';
  }

  getTypeCamionLabel(type: TypeCamion): string {
    const labels: { [key in TypeCamion]: string } = {
      [TypeCamion.PLATEAU]: 'Plateau',
      [TypeCamion.CAISSON]: 'Caisson',
      [TypeCamion.AMPLIROLL]: 'Ampliroll',
      [TypeCamion.GRUE]: 'Grue',
      [TypeCamion.HYDROCUREUR]: 'Hydrocureur'
    };
    return labels[type] || type;
  }
}

