import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';

interface DashboardData {
  pickupsCount: number;
  kg: {
    valorisables: number;
    banals: number;
    dangereux: number;
  };
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="container">
      <h1>Tableau de bord client</h1>
      
      <div *ngIf="loading" class="text-center">
        <mat-spinner></mat-spinner>
        <p>Chargement des données...</p>
      </div>

      <div *ngIf="!loading && dashboardData" class="dashboard-grid">
        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon">local_shipping</mat-icon>
            <div class="kpi-value">{{ dashboardData.pickupsCount }}</div>
            <div class="kpi-label">Enlèvements</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon">recycling</mat-icon>
            <div class="kpi-value">{{ dashboardData.kg.valorisables | number:'1.1-1' }}</div>
            <div class="kpi-label">Kg Valorisable</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon">delete</mat-icon>
            <div class="kpi-value">{{ dashboardData.kg.banals | number:'1.1-1' }}</div>
            <div class="kpi-label">Kg Banals</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <mat-icon class="kpi-icon">warning</mat-icon>
            <div class="kpi-value">{{ dashboardData.kg.dangereux | number:'1.1-1' }}</div>
            <div class="kpi-label">Kg Dangereux</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!loading && !dashboardData" class="text-center">
        <p>Aucune donnée disponible</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .kpi-card {
      text-align: center;
    }
    .kpi-icon {
      font-size: 3em;
      color: #1976d2;
      margin-bottom: 10px;
    }
    .kpi-value {
      font-size: 2.5em;
      font-weight: bold;
      color: #1976d2;
      margin: 10px 0;
    }
    .kpi-label {
      color: #666;
      font-size: 1.1em;
    }
    .text-center {
      text-align: center;
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.http.get<DashboardData>('/api/client/dashboard').subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du dashboard:', error);
        this.loading = false;
      }
    });
  }
}
