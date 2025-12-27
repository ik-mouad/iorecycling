import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../auth/auth.service';
import { DemandeService } from '../../../../services/demande.service';
import { RoleService } from '../../../../services/role.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  pendingDemandesCount = 0;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private demandeService: DemandeService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    // Vérifier que l'utilisateur est admin
    if (!this.authService.hasRole('ADMIN')) {
      this.router.navigate(['/']);
    }
    this.loadPendingDemandesCount();
  }

  loadPendingDemandesCount(): void {
    this.demandeService.getDemandesEnAttente().subscribe({
      next: (demandes) => {
        this.pendingDemandesCount = demandes.length;
      },
      error: (error) => {
        console.error('Erreur chargement compteur demandes:', error);
      }
    });
  }

  getPendingDemandesCount(): number {
    return this.pendingDemandesCount;
  }

  logout(): void {
    this.authService.logout();
  }

  getUserName(): string {
    return this.authService.getUserName();
  }

  isComptable(): boolean {
    return this.roleService.isComptable();
  }
}
