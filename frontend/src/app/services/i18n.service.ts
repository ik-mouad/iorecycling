import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLanguage = 'fr' | 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<SupportedLanguage>('fr');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  
  private translations: { [key: string]: any } = {};
  
  constructor() {
    this.loadLanguage(this.getStoredLanguage() || 'fr');
  }

  /**
   * Charge les traductions pour une langue donnée
   */
  async loadLanguage(lang: SupportedLanguage): Promise<void> {
    try {
      const response = await fetch(`/assets/i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language file: ${lang}.json`);
      }
      this.translations = await response.json();
      this.currentLanguageSubject.next(lang);
      this.storeLanguage(lang);
    } catch (error) {
      console.error(`Error loading language ${lang}:`, error);
      // Fallback sur le français si le chargement échoue
      if (lang !== 'fr') {
        await this.loadLanguage('fr');
      }
    }
  }

  /**
   * Traduit une clé (support des clés imbriquées avec point, ex: "common.save")
   */
  translate(key: string, params?: { [key: string]: string | number }): string {
    const keys = key.split('.');
    let translation: any = this.translations;
    
    // Navigue dans l'objet imbriqué
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        return key; // Retourne la clé si la traduction n'est pas trouvée
      }
    }
    
    // Si la traduction est une chaîne, on remplace les paramètres
    if (typeof translation === 'string') {
      let result = translation;
      if (params) {
        Object.keys(params).forEach(paramKey => {
          result = result.replace(`{{${paramKey}}}`, String(params[paramKey]));
        });
      }
      return result;
    }
    
    return key;
  }

  /**
   * Raccourci pour translate
   */
  t(key: string, params?: { [key: string]: string | number }): string {
    return this.translate(key, params);
  }

  /**
   * Obtient la langue actuelle
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  /**
   * Change la langue
   */
  setLanguage(lang: SupportedLanguage): void {
    this.loadLanguage(lang);
  }

  /**
   * Stocke la langue dans le localStorage
   */
  private storeLanguage(lang: SupportedLanguage): void {
    localStorage.setItem('i18n_language', lang);
  }

  /**
   * Récupère la langue stockée dans le localStorage
   */
  private getStoredLanguage(): SupportedLanguage | null {
    const stored = localStorage.getItem('i18n_language');
    return (stored === 'fr' || stored === 'en' || stored === 'es') ? stored : null;
  }
}

