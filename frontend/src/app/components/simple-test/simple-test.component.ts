import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="test-container">
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Test Simple</mat-card-title>
          <mat-card-subtitle>Page de test sans authentification</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p><strong>URL actuelle:</strong> {{ currentUrl }}</p>
          <p><strong>Timestamp:</strong> {{ timestamp }}</p>
          <p><strong>User Agent:</strong> {{ userAgent }}</p>
          <p><strong>Local Storage:</strong> {{ localStorageInfo }}</p>
          <p><strong>Session Storage:</strong> {{ sessionStorageInfo }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="goHome()">
            Retour à l'accueil
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .test-card {
      max-width: 600px;
      width: 100%;
    }
  `]
})
export class SimpleTestComponent {
  currentUrl = window.location.href;
  timestamp = new Date().toISOString();
  userAgent = navigator.userAgent;
  localStorageInfo = this.getLocalStorageInfo();
  sessionStorageInfo = this.getSessionStorageInfo();

  getLocalStorageInfo(): string {
    try {
      const keys = Object.keys(localStorage);
      return keys.length > 0 ? keys.join(', ') : 'Vide';
    } catch (e) {
      return 'Erreur: ' + e;
    }
  }

  getSessionStorageInfo(): string {
    try {
      const keys = Object.keys(sessionStorage);
      return keys.length > 0 ? keys.join(', ') : 'Vide';
    } catch (e) {
      return 'Erreur: ' + e;
    }
  }

  goHome(): void {
    window.location.href = '/';
  }
}
