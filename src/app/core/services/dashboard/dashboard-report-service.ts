import { Service, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClassificationType } from '../../models/classification-type';

@Service()
export class DashboardReportService {
    private readonly API_URL = environment.apiUrl;

    private readonly http = inject(HttpClient);

    downloadDashboard(risk?: ClassificationType): Observable<Blob> {
        let params = new HttpParams()
            .set('pageSize', 5000);

        if (risk) {
            params = params.set('risk', risk);
        }

        return this.http.get(
            `${this.API_URL}companies/dashboard/export/csv`,
            {
                params,
                responseType: 'blob'
            }
        );
    }
}
