import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get pickups', (done) => {
    service.getPickups().subscribe(pickups => {
      expect(pickups).toBeDefined();
      expect(Array.isArray(pickups)).toBe(true);
      if (pickups.length > 0) {
        expect(pickups[0]).toHaveProperty('id');
        expect(pickups[0]).toHaveProperty('date');
        expect(pickups[0]).toHaveProperty('type');
        expect(pickups[0]).toHaveProperty('tonnage');
        expect(pickups[0]).toHaveProperty('site');
        expect(pickups[0]).toHaveProperty('docs');
      }
      done();
    });
  });

  it('should get valuables report', (done) => {
    service.getValuablesReport().subscribe(report => {
      expect(report).toBeDefined();
      expect(report).toHaveProperty('month');
      expect(report).toHaveProperty('year');
      expect(report).toHaveProperty('details');
      expect(report).toHaveProperty('totalAmount');
      expect(Array.isArray(report.details)).toBe(true);
      done();
    });
  });

  it('should get document icon', () => {
    expect(service.getDocumentIcon('bordereau')).toBe('description');
    expect(service.getDocumentIcon('certificat')).toBe('verified');
    expect(service.getDocumentIcon('facture')).toBe('receipt');
    expect(service.getDocumentIcon('photo')).toBe('image');
    expect(service.getDocumentIcon('unknown')).toBe('help_outline');
  });

  it('should get document label', () => {
    expect(service.getDocumentLabel('bordereau')).toBe('Bordereau');
    expect(service.getDocumentLabel('certificat')).toBe('Certificat');
    expect(service.getDocumentLabel('facture')).toBe('Facture');
    expect(service.getDocumentLabel('photo')).toBe('Photo');
    expect(service.getDocumentLabel('unknown')).toBe('Document');
  });

  it('should get waste type color', () => {
    expect(service.getWasteTypeColor('recyclables')).toBe('#10B981');
    expect(service.getWasteTypeColor('banals')).toBe('#9CA3AF');
    expect(service.getWasteTypeColor('dangereux')).toBe('#F43F5E');
    expect(service.getWasteTypeColor('unknown')).toBe('#6B7280');
  });

  it('should download document', () => {
    spyOn(console, 'log');
    service.downloadDocument('/test.pdf', 'test.pdf');
    expect(console.log).toHaveBeenCalledWith('Téléchargement de test.pdf depuis /test.pdf');
  });

  it('should download report', () => {
    spyOn(service, 'downloadDocument');
    service.downloadReport();
    expect(service.downloadDocument).toHaveBeenCalled();
  });
});
