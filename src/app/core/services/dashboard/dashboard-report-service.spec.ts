import { TestBed } from '@angular/core/testing';
import { DashboardReportService } from './dashboard-report-service';

describe('DashboardReportService', () => {
  let service: DashboardReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
