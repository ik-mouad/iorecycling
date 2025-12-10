import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-test-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="dashboard-container">
      <mat-card class="dashboard-card">
        <mat-card-header>
          <mat-card-title>Test Dashboard</mat-card-title>
          <mat-card-subtitle>Page de test pour vérifier l'authentification</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Statut d'authentification:</strong> {{ authService.isLoggedIn() ? 'Connecté' : 'Non connecté' }}</p>
          <p><strong>Nom d'utilisateur:</strong> {{ authService.getUserName() }}</p>
          <p><strong>Token:</strong> {{ authService.getAccessToken() ? 'Présent' : 'Absent' }}</p>
          <p><strong>Claims:</strong> {{ getClaimsString() }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="warn" (click)="logout()">
            Déconnexion
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .dashboard-card {
      max-width: 600px;
      width: 100%;
    }
  `]
})
export class TestDashboardComponent {
  constructor(public authService: AuthService) {}

  getClaimsString(): string {
    const claims = this.authService.getClaims();
    return claims ? JSON.stringify(claims, null, 2) : 'Aucun claim';
  }

  logout(): void {
    this.authService.logout();
  }
}

