import { TestBed } from '@angular/core/testing';
import { WeightsService } from './weights-service';

describe('WeightsService', () => {
  let service: WeightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
