import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ComptabiliteService } from '../../../../services/comptabilite.service';
import { ComptabiliteDashboard } from '../../../../models/comptabilite.model';

@Component({
  selector: 'app-client-comptabilite-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './comptabilite-dashboard.component.html',
  styleUrls: ['./comptabilite-dashboard.component.scss']
})
export class ClientComptabiliteDashboardComponent implements OnInit {
  dashboard: ComptabiliteDashboard | null = null;
  loading = false;
  error: string | null = null;
  
  // Filtres
  dateDebut: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  dateFin: string = new Date().toISOString().split('T')[0];
  periode: 'mensuel' | 'trimestriel' | 'annuel' = 'mensuel';

  constructor(private comptabiliteService: ComptabiliteService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.comptabiliteService.getClientDashboard(this.dateDebut, this.dateFin, this.periode)
      .subscribe({
        next: (data) => {
          this.dashboard = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du dashboard';
          this.loading = false;
          console.error(err);
        }
      });
  }

  onPeriodeChange(periode: 'mensuel' | 'trimestriel' | 'annuel'): void {
    this.periode = periode;
    this.loadDashboard();
  }
}

