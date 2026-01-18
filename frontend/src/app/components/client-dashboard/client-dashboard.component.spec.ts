import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ClientDashboardComponent } from './client-dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { IconService } from '../../services/icon.service';
import { ChartService } from '../../services/chart.service';

describe('ClientDashboardComponent', () => {
  let component: ClientDashboardComponent;
  let fixture: ComponentFixture<ClientDashboardComponent>;
  let mockDashboardService: jasmine.SpyObj<DashboardService>;
  let mockIconService: jasmine.SpyObj<IconService>;
  let mockChartService: jasmine.SpyObj<ChartService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockPickupData = [
    {
      id: 1,
      date: '2024-01-15',
      heure: '14:30',
      type: 'recyclables' as const,
      : 2.5,
      site: 'Site Principal - Casablanca',
      docs: [
        { name: 'Bordereau_001.pdf', url: '/docs/bordereau_001.pdf', type: 'bordereau' as const }
      ]
    }
  ];

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getPickups',
      'getValuablesReport',
      'downloadDocument',
      'downloadReport',
      'getDocumentIcon',
      'getDocumentLabel',
      'getWasteTypeColor'
    ]);

    const iconServiceSpy = jasmine.createSpyObj('IconService', ['getIcon']);
    const chartServiceSpy = jasmine.createSpyObj('ChartService', [
      'createSparklineChart',
      'destroyAllCharts'
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ClientDashboardComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: IconService, useValue: iconServiceSpy },
        { provide: ChartService, useValue: chartServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDashboardComponent);
    component = fixture.componentInstance;
    mockDashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    mockIconService = TestBed.inject(IconService) as jasmine.SpyObj<IconService>;
    mockChartService = TestBed.inject(ChartService) as jasmine.SpyObj<ChartService>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Configuration des mocks
    mockDashboardService.getPickups.and.returnValue(of(mockPickupData));
    mockDashboardService.getValuablesReport.and.returnValue(of({
      month: '01',
      year: 2024,
      details: [],
      totalAmount: 0
    }));
    mockIconService.getIcon.and.returnValue('autorenew');
    mockDashboardService.getDocumentIcon.and.returnValue('description');
    mockDashboardService.getDocumentLabel.and.returnValue('Document');
    mockDashboardService.getWasteTypeColor.and.returnValue('#10B981');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pickups on init', () => {
    component.ngOnInit();
    expect(mockDashboardService.getPickups).toHaveBeenCalled();
  });

  it('should format weight correctly', () => {
    const result = component.formatWeight(2.5);
    expect(result).toBe('2,50 t');
  });

  it('should format currency correctly', () => {
    const result = component.formatCurrency(125430.75);
    expect(result).toContain('125 430,75');
    expect(result).toContain('MAD');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2024-01-15');
    expect(result).toBe('15/01/2024');
  });

  it('should get type label correctly', () => {
    expect(component.getTypeLabel('recyclables')).toBe('Recyclables');
    expect(component.getTypeLabel('banals')).toBe('Banals');
    expect(component.getTypeLabel('dangereux')).toBe('Dangereux');
  });

  it('should apply filter correctly', () => {
    component.dataSource.data = mockPickupData;
    component.selectedFilter = 'recyclables';
    component.searchTerm = 'casablanca';
    
    component.applyFilter();
    
    expect(component.dataSource.filter).toBe('casablanca');
  });

  it('should clear filters correctly', () => {
    component.selectedFilter = 'recyclables';
    component.searchTerm = 'test';
    component.dataSource.filter = 'test';
    
    component.clearFilters();
    
    expect(component.selectedFilter).toBe('all');
    expect(component.searchTerm).toBe('');
    expect(component.dataSource.filter).toBe('');
  });

  it('should export to CSV', () => {
    component.dataSource.data = mockPickupData;
    spyOn(component, 'convertToCSV').and.returnValue('test,csv,data');
    
    component.exportToCSV();
    
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Export CSV téléchargé avec succès',
      'Fermer',
      { duration: 2000 }
    );
  });

  it('should format last updated time correctly', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    expect(component.formatLastUpdated(now)).toBe('À l\'instant');
    expect(component.formatLastUpdated(oneMinuteAgo)).toContain('Il y a 1 min');
    expect(component.formatLastUpdated(oneHourAgo)).toContain('Il y a 1h');
  });

  it('should download document', () => {
    component.downloadDocument('/test.pdf', 'test.pdf');
    
    expect(mockDashboardService.downloadDocument).toHaveBeenCalledWith('/test.pdf', 'test.pdf');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Téléchargement de test.pdf',
      'Fermer',
      { duration: 2000 }
    );
  });

  it('should download report', () => {
    component.downloadReport();
    
    expect(mockDashboardService.downloadReport).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Téléchargement du rapport PDF',
      'Fermer',
      { duration: 2000 }
    );
  });

  it('should load valuables report when filter is recyclables', () => {
    component.selectedFilter = 'recyclables';
    
    component.onFilterChange({ value: 'recyclables' });
    
    expect(mockDashboardService.getValuablesReport).toHaveBeenCalled();
  });

  it('should convert data to CSV format', () => {
    const testData = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ];
    
    const result = component['convertToCSV'](testData);
    
    expect(result).toContain('name,age');
    expect(result).toContain('"John","30"');
    expect(result).toContain('"Jane","25"');
  });
});
