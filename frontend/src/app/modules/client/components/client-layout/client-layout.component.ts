import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <div class="client-layout">
      <header class="client-header">
        <div class="header-content">
          <div class="header-left">
            <h1>
              <mat-icon>dashboard</mat-icon>
              Portail Client IORecycling
            </h1>
          </div>
          <div class="header-right">
            <span class="user-info">
              <mat-icon>person</mat-icon>
              {{ getUserName() }}
            </span>
            <button mat-icon-button [matMenuTriggerFor]="clientMenu" aria-label="Menu utilisateur">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #clientMenu="matMenu">
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Se déconnecter</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </header>

      <nav class="client-nav">
        <div class="nav-buttons">
          <a mat-button routerLink="/client/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon>insights</mat-icon>
            Dashboard
          </a>
          <a mat-button routerLink="/client/documents" routerLinkActive="active">
            <mat-icon>folder</mat-icon>
            Documents
          </a>
          <a mat-button routerLink="/client/demandes" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon>assignment</mat-icon>
            Mes demandes
          </a>
          <a mat-button routerLink="/client/enlevements" routerLinkActive="active">
            <mat-icon>local_shipping</mat-icon>
            Mes enlèvements
          </a>
          <a mat-stroked-button color="primary" routerLink="/client/demandes/new">
            <mat-icon>add_circle</mat-icon>
            Nouvelle demande
          </a>
        </div>
      </nav>

      <main class="client-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./client-layout.component.scss']
})
export class ClientLayoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  getUserName(): string {
    return this.authService.getUserName();
  }

  logout(): void {
    this.authService.logout();
  }
}

