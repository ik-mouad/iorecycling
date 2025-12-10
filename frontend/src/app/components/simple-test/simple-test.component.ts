import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AppShellComponent } from '../app-shell/app-shell.component';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, AppShellComponent],
  template: `
    <app-app-shell>
      <div class="test-page">
        <div class="page-header">
          <h1>Test Simple</h1>
          <p class="page-description">Page de test sans authentification - Diagnostic de l'application</p>
        </div>

        <div class="grid grid-2 grid-gap">
          <mat-card class="card">
            <mat-card-header>
              <mat-icon mat-card-avatar>info</mat-icon>
              <mat-card-title>Informations de session</mat-card-title>
              <mat-card-subtitle>Données de débogage</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-item">
                <mat-icon class="info-icon">link</mat-icon>
                <div class="info-content">
                  <span class="info-label">URL actuelle</span>
                  <span class="info-value">{{ currentUrl }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon class="info-icon">schedule</mat-icon>
                <div class="info-content">
                  <span class="info-label">Timestamp</span>
                  <span class="info-value">{{ timestamp }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon class="info-icon">computer</mat-icon>
                <div class="info-content">
                  <span class="info-label">User Agent</span>
                  <span class="info-value">{{ userAgent }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="card">
            <mat-card-header>
              <mat-icon mat-card-avatar>storage</mat-icon>
              <mat-card-title>Stockage local</mat-card-title>
              <mat-card-subtitle>Données persistantes</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="storage-section">
                <h4>Local Storage</h4>
                <mat-chip-set>
                  <mat-chip *ngIf="localStorageInfo === 'Vide'">{{ localStorageInfo }}</mat-chip>
                  <mat-chip *ngFor="let key of localStorageKeys" color="primary">{{ key }}</mat-chip>
                </mat-chip-set>
              </div>
              
              <div class="storage-section">
                <h4>Session Storage</h4>
                <mat-chip-set>
                  <mat-chip *ngIf="sessionStorageInfo === 'Vide'">{{ sessionStorageInfo }}</mat-chip>
                  <mat-chip *ngFor="let key of sessionStorageKeys" color="accent">{{ key }}</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="actions-section">
          <button mat-raised-button color="primary" (click)="goHome()">
            <mat-icon>home</mat-icon>
            <span>Retour à l'accueil</span>
          </button>
        </div>
      </div>
    </app-app-shell>
  `,
  styles: [`
    .test-page {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
    }

    .page-header h1 {
      font-family: 'Inter', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
    }

    .page-description {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--color-surface-variant);
      border-radius: var(--radius-md);
    }

    .info-icon {
      color: var(--color-primary);
      margin-top: 2px;
    }

    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .info-label {
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: 0.875rem;
    }

    .info-value {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      word-break: break-all;
    }

    .storage-section {
      margin-bottom: var(--spacing-xl);
    }

    .storage-section h4 {
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .actions-section {
      text-align: center;
      margin-top: var(--spacing-2xl);
    }

    .actions-section button {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    @media (max-width: 767px) {
      .page-header h1 {
        font-size: 2rem;
      }

      .page-description {
        font-size: 1rem;
      }

      .info-value {
        font-size: 0.75rem;
      }
    }
  `]
})
export class SimpleTestComponent {
  currentUrl = window.location.href;
  timestamp = new Date().toISOString();
  userAgent = navigator.userAgent;
  localStorageInfo = this.getLocalStorageInfo();
  sessionStorageInfo = this.getSessionStorageInfo();
  localStorageKeys: string[] = [];
  sessionStorageKeys: string[] = [];

  constructor() {
    this.loadStorageKeys();
  }

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

  loadStorageKeys(): void {
    try {
      this.localStorageKeys = Object.keys(localStorage);
    } catch (e) {
      this.localStorageKeys = [];
    }

    try {
      this.sessionStorageKeys = Object.keys(sessionStorage);
    } catch (e) {
      this.sessionStorageKeys = [];
    }
  }

  goHome(): void {
    window.location.href = '/';
  }
}
