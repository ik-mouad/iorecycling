import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../auth/auth.service';
import { LanguageSelectorComponent } from '../../../../components/language-selector/language-selector.component';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';
import { filter, map } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Component({
  selector: 'app-comptable-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    LanguageSelectorComponent,
    TranslatePipe
  ],
  templateUrl: './comptable-layout.component.html',
  styleUrls: ['./comptable-layout.component.scss']
})
export class ComptableLayoutComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    // Générer les breadcrumbs basés sur la route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .subscribe(route => {
        this.breadcrumbs = this.buildBreadcrumbs(route);
      });

    // Breadcrumbs initiaux
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute);
  }

  private buildBreadcrumbs(route: ActivatedRoute): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    let currentRoute: ActivatedRoute | null = route.root;

    while (currentRoute) {
      const children: ActivatedRoute[] = currentRoute.children;
      currentRoute = null;

      for (const child of children) {
        if (child.snapshot.data && child.snapshot.data['breadcrumb']) {
          const breadcrumb = child.snapshot.data['breadcrumb'];
          breadcrumbs.push({
            label: breadcrumb.label,
            url: breadcrumb.url || '',
            icon: breadcrumb.icon
          });
        }
        currentRoute = child;
      }
    }

    // Ajouter breadcrumbs par défaut si aucun n'est défini
    if (breadcrumbs.length === 0) {
      const url = this.router.url;
      if (url.includes('/dashboard')) {
        breadcrumbs.push({ label: this.i18n.t('comptable.dashboard'), url: '/comptable/dashboard', icon: 'dashboard' });
      } else if (url.includes('/transactions')) {
        breadcrumbs.push({ label: this.i18n.t('comptable.dashboard'), url: '/comptable/dashboard', icon: 'dashboard' });
        breadcrumbs.push({ label: this.i18n.t('comptable.transactions'), url: '/admin/comptabilite/transactions', icon: 'list_alt' });
      } else if (url.includes('/ventes')) {
        breadcrumbs.push({ label: this.i18n.t('comptable.dashboard'), url: '/comptable/dashboard', icon: 'dashboard' });
        breadcrumbs.push({ label: this.i18n.t('comptable.ventes'), url: '/admin/ventes', icon: 'shopping_cart' });
      } else if (url.includes('/stocks')) {
        breadcrumbs.push({ label: this.i18n.t('comptable.dashboard'), url: '/comptable/dashboard', icon: 'dashboard' });
        breadcrumbs.push({ label: this.i18n.t('comptable.stocks'), url: '/admin/ventes/stocks', icon: 'inventory_2' });
      }
    }

    return breadcrumbs;
  }

  logout(): void {
    this.authService.logout();
  }

  getUserName(): string {
    return this.authService.getUserName();
  }

  getUserInitials(): string {
    const name = this.getUserName();
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
