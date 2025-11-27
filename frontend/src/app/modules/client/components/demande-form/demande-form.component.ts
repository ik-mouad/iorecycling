import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DemandeService } from '../../../../services/demande.service';
import { SiteService } from '../../../../services/site.service';
import { AuthService } from '../../../../auth/auth.service';
import { CreateDemandeRequest } from '../../../../models/demande.model';
import { Site } from '../../../../models/societe.model';

/**
 * Composant : Formulaire de demande d'enlèvement (client)
 */
@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.scss']
})
export class DemandeFormComponent implements OnInit {
  demandeForm!: FormGroup;
  sites: Site[] = [];
  loading = false;
  societeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private siteService: SiteService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.societeId = this.authService.getSocieteId();
    
    if (!this.societeId) {
      this.snackBar.open('Erreur: Impossible de récupérer votre société', 'Fermer', { duration: 5000 });
      this.router.navigate(['/client']);
      return;
    }
    
    this.loadSites();
  }

  initForm(): void {
    // Date minimale = demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.demandeForm = this.fb.group({
      dateSouhaitee: [tomorrow, Validators.required],
      heureSouhaitee: [''],
      siteId: ['', Validators.required],
      typeDechetEstime: [''],
      quantiteEstimee: [null, [Validators.min(0)]],
      commentaire: ['']
    });
  }

  loadSites(): void {
    if (!this.societeId) {
      return;
    }
    
    this.siteService.getSitesBySociete(this.societeId).subscribe({
      next: (sites) => {
        this.sites = sites;
      },
      error: (error) => {
        console.error('Erreur chargement sites:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.demandeForm.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    const dateSouhaitee = this.demandeForm.value.dateSouhaitee;
    const formattedDate = dateSouhaitee instanceof Date
      ? dateSouhaitee.toISOString().split('T')[0]
      : dateSouhaitee;

    if (!this.societeId) {
      this.snackBar.open('Erreur: Impossible de récupérer votre société', 'Fermer', { duration: 3000 });
      this.loading = false;
      return;
    }

    const request: CreateDemandeRequest = {
      dateSouhaitee: formattedDate,
      heureSouhaitee: this.demandeForm.value.heureSouhaitee || undefined,
      siteId: this.demandeForm.value.siteId,
      societeId: this.societeId,
      typeDechetEstime: this.demandeForm.value.typeDechetEstime || undefined,
      quantiteEstimee: this.demandeForm.value.quantiteEstimee || undefined,
      commentaire: this.demandeForm.value.commentaire || undefined
    };

    this.demandeService.createDemande(request).subscribe({
      next: (demande) => {
        this.snackBar.open(
          `Demande ${demande.numeroDemande} créée avec succès`,
          'Fermer',
          { duration: 5000 }
        );
        this.router.navigate(['/client/demandes']);
      },
      error: (error) => {
        console.error('Erreur création demande:', error);
        this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/client/demandes']);
  }
}

