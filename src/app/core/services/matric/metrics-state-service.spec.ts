import { TestBed } from '@angular/core/testing';
import { MetricsStateService } from './metrics-state-service';

describe('MetricsStateService', () => {
  let service: MetricsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetricsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
