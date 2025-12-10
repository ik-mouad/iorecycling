import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SocieteService } from '../../../../services/societe.service';
import { SiteService } from '../../../../services/site.service';
import { ClientUserService } from '../../../../services/client-user.service';
import { EnlevementService } from '../../../../services/enlevement.service';
import { Societe, Site, ClientUser } from '../../../../models/societe.model';
import { Enlevement } from '../../../../models/enlevement.model';
import { ClientUserFormComponent } from '../client-user-form/client-user-form.component';
import { SiteFormComponent, SiteFormData } from '../site-form/site-form.component';

/**
 * Composant : Détail d'une société avec onglets
 * - Onglet Informations
 * - Onglet Sites
 * - Onglet Utilisateurs
 * - Onglet Enlèvements
 */
@Component({
  selector: 'app-societe-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    ClientUserFormComponent,
    SiteFormComponent
  ],
  templateUrl: './societe-detail.component.html',
  styleUrls: ['./societe-detail.component.scss']
})
export class SocieteDetailComponent implements OnInit {
  societe?: Societe;
  sites: Site[] = [];
  utilisateurs: ClientUser[] = [];
  enlevements: Enlevement[] = [];
  loading = false;

  displayedColumnsSites = ['name', 'adresse', 'nbEnlevements', 'actions'];
  displayedColumnsUsers = ['nom', 'prenom', 'posteOccupe', 'email', 'active', 'actions'];
  displayedColumnsEnlevements = ['numeroEnlevement', 'dateEnlevement', 'siteNom', 'poidsTotal', 'bilanNet', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private societeService: SocieteService,
    private siteService: SiteService,
    private clientUserService: ClientUserService,
    private enlevementService: EnlevementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadSociete(id);
        this.loadSites(id);
        this.loadUtilisateurs(id);
        this.loadEnlevements(id);
      }
    });
  }

  loadSociete(id: number): void {
    this.loading = true;
    this.societeService.getSocieteById(id).subscribe({
      next: (societe) => {
        this.societe = societe;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement société:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadSites(societeId: number): void {
    this.siteService.getSitesBySociete(societeId).subscribe({
      next: (sites) => {
        this.sites = sites;
      },
      error: (error) => {
        console.error('Erreur chargement sites:', error);
      }
    });
  }

  loadUtilisateurs(societeId: number): void {
    this.clientUserService.getUsersBySociete(societeId).subscribe({
      next: (users) => {
        this.utilisateurs = users;
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs:', error);
      }
    });
  }

  loadEnlevements(societeId: number): void {
    this.enlevementService.getEnlevements(societeId, 0, 100).subscribe({
      next: (page) => {
        this.enlevements = page.content;
      },
      error: (error) => {
        console.error('Erreur chargement enlèvements:', error);
      }
    });
  }

  viewEnlevement(enlevement: Enlevement): void {
    this.router.navigate(['/admin/enlevements', enlevement.id]);
  }

  editSociete(): void {
    if (this.societe) {
      this.router.navigate(['/admin/societes', this.societe.id, 'edit']);
    }
  }

  addSite(): void {
    if (!this.societe) {
      return;
    }

    const dialogRef = this.dialog.open(SiteFormComponent, {
      width: '500px',
      data: {
        societeId: this.societe.id
      } as SiteFormData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.societe) {
        this.snackBar.open('Site créé', 'Fermer', { duration: 3000 });
        this.loadSites(this.societe.id);
        this.loadSociete(this.societe.id);
      }
    });
  }

  editSite(site: Site): void {
    if (!this.societe) {
      return;
    }

    const dialogRef = this.dialog.open(SiteFormComponent, {
      width: '500px',
      data: {
        societeId: this.societe.id,
        site: site
      } as SiteFormData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.societe) {
        this.snackBar.open('Site modifié', 'Fermer', { duration: 3000 });
        this.loadSites(this.societe.id);
        this.loadSociete(this.societe.id);
      }
    });
  }

  deleteSite(site: Site): void {
    if (confirm(`Supprimer le site "${site.name}" ?`)) {
      this.siteService.deleteSite(site.id).subscribe({
        next: () => {
          this.snackBar.open('Site supprimé', 'Fermer', { duration: 3000 });
          if (this.societe) {
            this.loadSites(this.societe.id);
          }
        },
        error: (error) => {
          console.error('Erreur suppression site:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  addUser(): void {
    if (!this.societe) {
      return;
    }

    const dialogRef = this.dialog.open(ClientUserFormComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        societeId: this.societe.id
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.societe) {
        this.snackBar.open('Utilisateur créé', 'Fermer', { duration: 3000 });
        this.loadUtilisateurs(this.societe.id);
        this.loadSociete(this.societe.id);
      }
    });
  }

  editUser(user: ClientUser): void {
    if (!this.societe) {
      return;
    }

    const dialogRef = this.dialog.open(ClientUserFormComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        societeId: this.societe.id,
        user
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.societe) {
        this.snackBar.open('Utilisateur mis à jour', 'Fermer', { duration: 3000 });
        this.loadUtilisateurs(this.societe.id);
        this.loadSociete(this.societe.id);
      }
    });
  }

  toggleUserActive(user: ClientUser): void {
    this.clientUserService.toggleActive(user.id).subscribe({
      next: () => {
        this.snackBar.open(
          `Utilisateur ${user.active ? 'désactivé' : 'activé'}`,
          'Fermer',
          { duration: 3000 }
        );
        if (this.societe) {
          this.loadUtilisateurs(this.societe.id);
        }
      },
      error: (error) => {
        console.error('Erreur toggle active:', error);
        this.snackBar.open('Erreur', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteUser(user: ClientUser): void {
    if (confirm(`Supprimer l'utilisateur "${user.prenom} ${user.nom}" ?`)) {
      this.clientUserService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé', 'Fermer', { duration: 3000 });
          if (this.societe) {
            this.loadUtilisateurs(this.societe.id);
          }
        },
        error: (error) => {
          console.error('Erreur suppression utilisateur:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  createEnlevement(): void {
    if (this.societe) {
      this.router.navigate(['/admin/enlevements/new'], {
        queryParams: { societeId: this.societe.id }
      });
    } else {
      this.router.navigate(['/admin/enlevements/new']);
    }
  }

  backToList(): void {
    this.router.navigate(['/admin/societes']);
  }
}

