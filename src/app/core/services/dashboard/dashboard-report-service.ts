import { Service, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

type RiskFilter = 'HIGH' | 'MEDIUM' | 'LOW';

@Service()
export class DashboardReportService {
    private readonly API_URL = 'http://localhost:8080';

    private readonly http = inject(HttpClient);

    downloadDashboard(risk?: RiskFilter): Observable<Blob> {
        let params = new HttpParams()
            .set('pageSize', 5000);

        if (risk) {
            params = params.set('risk', risk);
        }

        return this.http.get(
            `${this.API_URL}/api/v1/companies/dashboard/export/csv`,
            {
                params,
                responseType: 'blob'
            }
        );
    }
}
