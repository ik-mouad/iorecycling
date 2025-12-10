import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="login-container">
      <div class="login-content">
        <div class="login-header">
          <mat-icon class="logo-icon">recycling</mat-icon>
          <h1 class="logo-text">IORecycling</h1>
          <p class="tagline">Plateforme de gestion du recyclage</p>
        </div>
        
        <mat-card class="login-card">
          <mat-card-content>
            <div class="login-form">
              <h2>Connexion</h2>
              <p class="login-description">
                Connectez-vous pour accéder à votre tableau de bord et gérer vos déchets recyclables.
              </p>
              
              <div class="status-info" *ngIf="authService.isLoggedIn()">
                <mat-icon class="status-icon success">check_circle</mat-icon>
                <span>Utilisateur connecté: {{ authService.getUserName() }}</span>
              </div>
              
              <div class="error-info" *ngIf="showError">
                <mat-icon class="status-icon error">error</mat-icon>
                <span>Erreur de connexion. Vérifiez que Keycloak est accessible.</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="login()" class="login-button">
              <mat-icon>login</mat-icon>
              <span>Se connecter</span>
            </button>
          </mat-card-actions>
        </mat-card>
        
        <div class="login-footer">
          <p class="muted">© 2024 IORecycling - Tous droits réservés</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
      padding: var(--spacing-xl);
    }

    .login-content {
      width: 100%;
      max-width: 420px;
      text-align: center;
    }

    .login-header {
      margin-bottom: var(--spacing-2xl);
      color: white;
    }

    .logo-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: var(--spacing-lg);
      opacity: 0.9;
    }

    .logo-text {
      font-family: 'Inter', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 var(--spacing-sm) 0;
      color: white;
    }

    .tagline {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0;
      color: white;
    }

    .login-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--elevation-4);
      overflow: hidden;
      margin-bottom: var(--spacing-xl);
    }

    .login-form {
      padding: var(--spacing-xl);
    }

    .login-form h2 {
      font-family: 'Inter', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .login-description {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xl);
      line-height: 1.6;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      color: #166534;
    }

    .error-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      color: #dc2626;
    }

    .status-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .status-icon.success {
      color: #16a34a;
    }

    .status-icon.error {
      color: #dc2626;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
    }

    .login-footer {
      color: white;
      opacity: 0.8;
    }

    .login-footer p {
      margin: 0;
      font-size: 0.875rem;
    }

    @media (max-width: 767px) {
      .login-container {
        padding: var(--spacing-lg);
      }

      .logo-text {
        font-size: 2rem;
      }

      .tagline {
        font-size: 1rem;
      }

      .login-form {
        padding: var(--spacing-lg);
      }
    }
  `]
})
export class LoginComponent {
  showError = false;

  constructor(public authService: AuthService) {
    console.log('LoginComponent initialisé');
  }

  login(): void {
    console.log('Clic sur le bouton de connexion');
    this.showError = false;
    this.authService.login();
  }
}