import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { I18nService, SupportedLanguage } from '../../services/i18n.service';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="languageMenu" [attr.aria-label]="'Sélecteur de langue'">
      <span class="flag-icon">{{ getCurrentFlag() }}</span>
    </button>
    <mat-menu #languageMenu="matMenu">
      <button 
        *ngFor="let lang of languages" 
        mat-menu-item 
        (click)="setLanguage(lang.code)" 
        [class.active]="currentLanguage === lang.code">
        <span class="flag-icon">{{ lang.flag }}</span>
        <span class="language-name">{{ lang.name }}</span>
        <mat-icon *ngIf="currentLanguage === lang.code" class="check-icon">check</mat-icon>
      </button>
    </mat-menu>
  `,
  styles: [`
    button[mat-icon-button] {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
    }

    .flag-icon {
      font-size: 24px;
      line-height: 1;
      display: inline-block;
    }

    button[mat-menu-item] {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 160px;
    }
    
    button[mat-menu-item].active {
      font-weight: 500;
      background-color: rgba(0, 0, 0, 0.04);
    }

    button[mat-menu-item] .flag-icon {
      font-size: 20px;
      width: 24px;
      text-align: center;
    }

    .language-name {
      flex: 1;
    }
    
    .check-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
      color: #1976d2;
      margin-left: auto;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: SupportedLanguage = 'fr';

  languages: LanguageOption[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
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

  getCurrentFlag(): string {
    const current = this.languages.find(l => l.code === this.currentLanguage);
    return current ? current.flag : '🌐';
  }
}

