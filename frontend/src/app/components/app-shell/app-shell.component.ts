import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule
  ],
  template: `
    <div class="app-shell">
      <!-- Topbar -->
      <mat-toolbar class="topbar" color="primary">
        <div class="topbar-content">
          <a routerLink="/" class="logo">
            <mat-icon>recycling</mat-icon>
            IORecycling
          </a>
          
          <div class="user-menu" *ngIf="authService.isLoggedIn()">
            <span class="user-name">{{ authService.getUserName() }}</span>
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Déconnexion</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </mat-toolbar>

      <!-- Main Content -->
      <main class="main-content">
        <div class="container">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--elevation-2);
    }

    .topbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-xl);
      width: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-family: 'Inter', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      text-decoration: none;
      transition: opacity var(--transition-fast);

      &:hover {
        opacity: 0.9;
      }

      mat-icon {
        font-size: 1.75rem;
        width: 1.75rem;
        height: 1.75rem;
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .user-name {
      color: white;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .main-content {
      flex: 1;
      padding: var(--spacing-xl) 0;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-xl);
    }

    @media (max-width: 767px) {
      .topbar-content {
        padding: 0 var(--spacing-lg);
      }

      .container {
        padding: 0 var(--spacing-lg);
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class AppShellComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
