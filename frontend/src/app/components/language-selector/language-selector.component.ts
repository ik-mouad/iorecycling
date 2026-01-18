import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { I18nService, SupportedLanguage } from '../../services/i18n.service';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flagPath: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="languageMenu" [attr.aria-label]="'Sélecteur de langue'" class="language-button">
      <img [src]="getCurrentFlagPath()" [alt]="currentLanguage" class="flag-icon">
    </button>
    <mat-menu #languageMenu="matMenu" class="language-menu">
      <button 
        *ngFor="let lang of languages" 
        mat-menu-item 
        (click)="setLanguage(lang.code)" 
        [class.active]="currentLanguage === lang.code"
        class="language-item">
        <img [src]="lang.flagPath" [alt]="lang.code" class="flag-icon">
        <span class="language-name">{{ lang.name }}</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .language-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .language-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .flag-icon {
      width: 24px;
      height: 18px;
      object-fit: cover;
      border-radius: 2px;
      display: inline-block;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep .language-menu {
      margin-top: 8px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      min-width: 200px;
      padding: 8px 0;
    }

    .language-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px !important;
      min-height: 48px;
      transition: all 0.2s ease;
      position: relative;
    }

    .language-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .language-item.active {
      background-color: rgba(25, 118, 210, 0.08);
      font-weight: 500;
    }

    .language-item.active .language-name {
      color: #1976d2;
    }

    .language-item .flag-icon {
      width: 28px;
      height: 21px;
      flex-shrink: 0;
    }

    .language-name {
      font-size: 15px;
      color: rgba(0, 0, 0, 0.87);
      font-weight: 400;
      flex: 1;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: SupportedLanguage = 'fr';

  languages: LanguageOption[] = [
    { code: 'fr', name: 'Français', flagPath: '/assets/flags/fr.svg' },
    { code: 'en', name: 'English', flagPath: '/assets/flags/gb.svg' },
    { code: 'es', name: 'Español', flagPath: '/assets/flags/es.svg' }
  ];

  constructor(private i18n: I18nService) {}

  ngOnInit(): void {
    this.i18n.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  setLanguage(lang: SupportedLanguage): void {
    this.i18n.setLanguage(lang);
  }

  getCurrentFlagPath(): string {
    const current = this.languages.find(l => l.code === this.currentLanguage);
    return current ? current.flagPath : '/assets/flags/fr.svg';
  }
}

