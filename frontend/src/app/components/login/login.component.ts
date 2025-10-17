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
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title class="text-center">IORecycling</mat-card-title>
          <mat-card-subtitle class="text-center">Plateforme de recyclage</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="text-center mt-20">
          <p>Connectez-vous pour accéder à votre tableau de bord</p>
          <p class="error-message" *ngIf="showError">
            Erreur de connexion. Vérifiez que Keycloak est accessible.
          </p>
        </mat-card-content>
        <mat-card-actions class="text-center">
          <button mat-raised-button color="primary" (click)="login()" class="full-width">
            <mat-icon>login</mat-icon>
            Se connecter
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      max-width: 400px;
      width: 100%;
      margin: 20px;
    }
    .full-width {
      width: 100%;
    }
    .mt-20 {
      margin-top: 20px;
    }
    .text-center {
      text-align: center;
    }
    .error-message {
      color: #f44336;
      font-size: 0.9em;
      margin-top: 10px;
    }
  `]
})
export class LoginComponent {
  showError = false;
  isInitialized = false;

  constructor(private authService: AuthService) {
    // Vérifier si le service est initialisé
    setTimeout(() => {
      this.isInitialized = true;
    }, 500);
  }

  login(): void {
    this.showError = false;
    if (!this.isInitialized) {
      this.showError = true;
      return;
    }
    
    try {
      this.authService.login();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      this.showError = true;
    }
  }
}
