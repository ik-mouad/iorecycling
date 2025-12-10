import { TestBed } from '@angular/core/testing';
import { IconService } from './icon.service';

describe('IconService', () => {
  let service: IconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct icon for known types', () => {
    expect(service.getIcon('camion')).toBe('local_shipping');
    expect(service.getIcon('recyclables')).toBe('autorenew');
    expect(service.getIcon('banals')).toBe('delete');
    expect(service.getIcon('dangereux')).toBe('warning');
    expect(service.getIcon('revenu')).toBe('payments');
    expect(service.getIcon('doc')).toBe('description');
    expect(service.getIcon('filtre')).toBe('tune');
    expect(service.getIcon('download')).toBe('download');
  });

  it('should return help_outline for unknown types', () => {
    expect(service.getIcon('unknown')).toBe('help_outline');
    expect(service.getIcon('')).toBe('help_outline');
  });

  it('should return all icons', () => {
    const allIcons = service.getAllIcons();
    expect(allIcons).toBeDefined();
    expect(typeof allIcons).toBe('object');
    expect(allIcons['camion']).toBe('local_shipping');
    expect(allIcons['recyclables']).toBe('autorenew');
  });
});
