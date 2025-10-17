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
   * Récupère la liste des enlèvements
   */
  getPickups(): Observable<PickupRecord[]> {
    // Simulation de données factices pour le développement
    const mockData: PickupRecord[] = [
      {
        id: 1,
        date: '2024-01-15',
        heure: '14:30',
        type: 'recyclables',
        tonnage: 2.5,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_001.pdf', url: '/docs/bordereau_001.pdf', type: 'bordereau' },
          { name: 'Certificat_001.pdf', url: '/docs/certificat_001.pdf', type: 'certificat' }
        ]
      },
      {
        id: 2,
        date: '2024-01-14',
        heure: '09:15',
        type: 'banals',
        tonnage: 1.8,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_002.pdf', url: '/docs/bordereau_002.pdf', type: 'bordereau' },
          { name: 'Photo_002.jpg', url: '/docs/photo_002.jpg', type: 'photo' }
        ]
      },
      {
        id: 3,
        date: '2024-01-13',
        heure: '16:45',
        type: 'dangereux',
        tonnage: 0.5,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_003.pdf', url: '/docs/bordereau_003.pdf', type: 'bordereau' },
          { name: 'Certificat_003.pdf', url: '/docs/certificat_003.pdf', type: 'certificat' },
          { name: 'Facture_003.pdf', url: '/docs/facture_003.pdf', type: 'facture' }
        ]
      },
      {
        id: 4,
        date: '2024-01-12',
        heure: '11:20',
        type: 'recyclables',
        tonnage: 3.2,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_004.pdf', url: '/docs/bordereau_004.pdf', type: 'bordereau' }
        ]
      },
      {
        id: 5,
        date: '2024-01-11',
        heure: '13:10',
        type: 'banals',
        tonnage: 2.1,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_005.pdf', url: '/docs/bordereau_005.pdf', type: 'bordereau' },
          { name: 'Photo_005.jpg', url: '/docs/photo_005.jpg', type: 'photo' }
        ]
      },
      {
        id: 6,
        date: '2024-01-10',
        heure: '15:30',
        type: 'recyclables',
        tonnage: 1.9,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_006.pdf', url: '/docs/bordereau_006.pdf', type: 'bordereum' },
          { name: 'Certificat_006.pdf', url: '/docs/certificat_006.pdf', type: 'certificat' }
        ]
      },
      {
        id: 7,
        date: '2024-01-09',
        heure: '10:45',
        type: 'dangereux',
        tonnage: 0.3,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_007.pdf', url: '/docs/bordereau_007.pdf', type: 'bordereau' }
        ]
      },
      {
        id: 8,
        date: '2024-01-08',
        heure: '12:00',
        type: 'banals',
        tonnage: 2.7,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_008.pdf', url: '/docs/bordereau_008.pdf', type: 'bordereau' },
          { name: 'Photo_008.jpg', url: '/docs/photo_008.jpg', type: 'photo' }
        ]
      },
      {
        id: 9,
        date: '2024-01-07',
        heure: '14:15',
        type: 'recyclables',
        tonnage: 4.1,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_009.pdf', url: '/docs/bordereau_009.pdf', type: 'bordereau' },
          { name: 'Certificat_009.pdf', url: '/docs/certificat_009.pdf', type: 'certificat' },
          { name: 'Facture_009.pdf', url: '/docs/facture_009.pdf', type: 'facture' }
        ]
      },
      {
        id: 10,
        date: '2024-01-06',
        heure: '08:30',
        type: 'banals',
        tonnage: 1.5,
        site: 'Site Principal - Casablanca',
        docs: [
          { name: 'Bordereau_010.pdf', url: '/docs/bordereau_010.pdf', type: 'bordereau' }
        ]
      }
    ];

    // Simulation d'un délai de chargement
    return of(mockData).pipe(
      delay(1000),
      catchError(error => {
        console.error('Erreur lors de la récupération des enlèvements:', error);
        return of([]);
      })
    );

    // Version réelle avec API (à décommenter quand l'API sera prête)
    /*
    return this.http.get<PickupRecord[]>(`${this.baseUrl}/pickups`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des enlèvements:', error);
        return of([]);
      })
    );
    */
  }

  /**
   * Récupère le rapport des valorisables pour le mois en cours
   */
  getValuablesReport(month?: string, year?: number): Observable<ValuablesReport> {
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const targetYear = year || currentDate.getFullYear();

    // Simulation de données factices
    const mockReport: ValuablesReport = {
      month: targetMonth,
      year: targetYear,
      details: [
        {
          id: 1,
          material: 'Papier/Carton',
          quantity: 12.5,
          pricePerKg: 2.5,
          total: 31250
        },
        {
          id: 2,
          material: 'Plastique PET',
          quantity: 8.3,
          pricePerKg: 4.2,
          total: 34860
        },
        {
          id: 3,
          material: 'Métaux (Aluminium)',
          quantity: 5.7,
          pricePerKg: 8.5,
          total: 48450
        },
        {
          id: 4,
          material: 'Verre',
          quantity: 15.2,
          pricePerKg: 1.8,
          total: 27360
        },
        {
          id: 5,
          material: 'Textiles',
          quantity: 3.1,
          pricePerKg: 3.0,
          total: 9300
        }
      ],
      totalAmount: 151220
    };

    // Calculer le total automatiquement
    mockReport.totalAmount = mockReport.details.reduce((sum, detail) => sum + detail.total, 0);

    return of(mockReport).pipe(
      delay(800),
      catchError(error => {
        console.error('Erreur lors de la récupération du rapport valorisables:', error);
        return of({
          month: targetMonth,
          year: targetYear,
          details: [],
          totalAmount: 0
        });
      })
    );

    // Version réelle avec API (à décommenter quand l'API sera prête)
    /*
    const params = new HttpParams()
      .set('month', targetMonth)
      .set('year', targetYear.toString());

    return this.http.get<ValuablesReport>(`${this.baseUrl}/report`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération du rapport valorisables:', error);
        return of({
          month: targetMonth,
          year: targetYear,
          details: [],
          totalAmount: 0
        });
      })
    );
    */
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
  downloadReport(month?: string, year?: number): void {
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const targetYear = year || currentDate.getFullYear();
    
    const filename = `rapport_valorisables_${targetMonth}_${targetYear}.pdf`;
    const url = `${this.baseUrl}/report?month=${targetMonth}&year=${targetYear}&format=pdf`;
    
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
