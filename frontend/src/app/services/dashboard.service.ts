import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface PickupDocument {
  name: string;
  url: string;
  type: 'bordereau' | 'certificat' | 'facture' | 'photo';
}

export interface PickupRecord {
  id: number;
  date: string;
  heure: string;
  type: 'recyclables' | 'banals' | 'dangereux';
  tonnage: number;
  site: string;
  docs: PickupDocument[];
}

export interface ValuablesDetail {
  id: number;
  material: string;
  quantity: number; // en tonnes
  pricePerKg: number; // en MAD
  total: number; // en MAD
}

export interface ValorSummaryRowDTO {
  material: string;
  qtyKg: number;
  pricePerKg: number;
  totalMad: number;
}

export interface ValorSummary {
  month: string; // YYYY-MM
  rows: ValorSummaryRowDTO[];
  grandTotalMad: number;
  currency: string;
}

export interface ValuablesReport {
  month: string;
  year: number;
  details: ValuablesDetail[];
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = '/api/client';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des enlèvements avec pagination et filtrage
   */
  getPickups(page: number = 0, size: number = 50, type: string = 'ALL'): Observable<{content: PickupRecord[], totalElements: number, totalPages: number}> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('type', type);
    
    return this.http.get<{content: PickupRecord[], totalElements: number, totalPages: number}>(`${this.baseUrl}/pickups`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des enlèvements:', error);
        return of({content: [], totalElements: 0, totalPages: 0});
      })
    );
  }

  /**
   * Récupère le rapport des valorisables pour le mois en cours
   */
  getValuablesReport(month?: string): Observable<ValorSummary> {
    const currentDate = new Date();
    const targetMonth = month || `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

    const params = new HttpParams().set('month', targetMonth);

    return this.http.get<ValorSummary>(`${this.baseUrl}/valorisables/summary`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération du rapport valorisables:', error);
        return of({
          month: targetMonth,
          rows: [],
          grandTotalMad: 0,
          currency: "MAD"
        });
      })
    );
  }

  /**
   * Télécharge un document
   */
  downloadDocument(url: string, filename: string): void {
    // Simulation du téléchargement
    console.log(`Téléchargement de ${filename} depuis ${url}`);
    
    // Version réelle (à implémenter quand l'API sera prête)
    /*
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
      }
    });
    */
  }

  /**
   * Télécharge le rapport PDF
   */
  downloadReport(month?: string): void {
    const currentDate = new Date();
    const targetMonth = month || `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const filename = `rapport-valorisation-${targetMonth}.pdf`;
    const url = `${this.baseUrl}/report?month=${targetMonth}`;
    
    this.downloadDocument(url, filename);
  }

  /**
   * Obtient l'icône pour un type de document
   */
  getDocumentIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'bordereau': 'description',
      'certificat': 'verified',
      'facture': 'receipt',
      'photo': 'image'
    };
    return iconMap[type] || 'description';
  }

  /**
   * Obtient le label pour un type de document
   */
  getDocumentLabel(type: string): string {
    const labelMap: { [key: string]: string } = {
      'bordereau': 'Bordereau',
      'certificat': 'Certificat',
      'facture': 'Facture',
      'photo': 'Photo'
    };
    return labelMap[type] || 'Document';
  }

  /**
   * Obtient la couleur pour un type de déchet
   */
  getWasteTypeColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'recyclables': '#10B981',
      'banals': '#9CA3AF',
      'dangereux': '#F43F5E'
    };
    return colorMap[type] || '#6B7280';
  }
}
