import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" *ngIf="authService.isLoggedIn()">
      <span>IORecycling</span>
      <span class="spacer"></span>
      <span>Bonjour, {{ authService.getUserName() }}</span>
      <button mat-icon-button (click)="navigateToClient()" matTooltip="Dashboard Client">
        <mat-icon>dashboard</mat-icon>
      </button>
      <button mat-icon-button (click)="navigateToAdmin()" *ngIf="authService.hasRole('ADMIN')" matTooltip="Administration">
        <mat-icon>admin_panel_settings</mat-icon>
      </button>
      <button mat-icon-button (click)="logout()" matTooltip="Déconnexion">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class AppComponent {
  title = 'iorecycling-frontend';

  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
  }

  navigateToClient(): void {
    this.router.navigate(['/client']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
