import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier que l'utilisateur est admin
    if (!this.authService.hasRole('ADMIN')) {
      this.router.navigate(['/']);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getUserName(): string {
    return this.authService.getUserName();
  }
}
