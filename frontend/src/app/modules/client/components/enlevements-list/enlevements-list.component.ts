import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EnlevementService } from '../../../../services/enlevement.service';
import { Enlevement } from '../../../../models/enlevement.model';

/**
 * Composant : Liste des enlèvements (client)
 */
@Component({
  selector: 'app-client-enlevements-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './enlevements-list.component.html',
  styleUrls: ['./enlevements-list.component.scss']
})
export class ClientEnlevementsListComponent implements OnInit {
  enlevements: Enlevement[] = [];
  displayedColumns: string[] = ['numeroEnlevement', 'dateEnlevement', 'siteNom', 'poidsTotal', 'bilanNet', 'tauxValorisation', 'actions'];
  
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  loading = false;

  constructor(
    private enlevementService: EnlevementService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEnlevements();
  }

  loadEnlevements(): void {
    this.loading = true;
    this.enlevementService.getClientEnlevements(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.enlevements = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement enlèvements:', error);
        this.snackBar.open('Erreur lors du chargement des enlèvements', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEnlevements();
  }

  viewEnlevement(enlevement: Enlevement): void {
    this.router.navigate(['/client/enlevements', enlevement.id]);
  }

  getBilanClass(bilanNet: number): string {
    return bilanNet >= 0 ? 'bilan-positif' : 'bilan-negatif';
  }

  getTauxClass(taux: number): string {
    if (taux >= 85) return 'taux-excellent';
    if (taux >= 70) return 'taux-tres-bon';
    if (taux >= 50) return 'taux-bon';
    if (taux >= 30) return 'taux-correct';
    return 'taux-insuffisant';
  }
}

