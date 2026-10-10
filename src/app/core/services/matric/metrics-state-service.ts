import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, tap, catchError, EMPTY } from 'rxjs';
import { UserMetrics } from '../../models/users/user-metrics';
import { CompanyMetrics } from '../../models/companies/company-metrics';
import { OccurrenceMetrics } from '../../models/occurences/occurrence-metrics';

@Service()
export class MetricsStateService {
    private readonly API_URL = 'http://localhost:8080';
    private http = inject(HttpClient);

    private metricsUserSignal = signal<UserMetrics | null>(null);
    private metricsCompanySignal = signal<CompanyMetrics | null>(null);
    private metricsOccurrenceSignal = signal<OccurrenceMetrics | null>(null);

    public readonly metricsUser = this.metricsUserSignal.asReadonly();
    public readonly metricsCompany = this.metricsCompanySignal.asReadonly();
    public readonly metricsOccurrence = this.metricsOccurrenceSignal.asReadonly();

    loadMetricsAdmin(): Observable<[CompanyMetrics, OccurrenceMetrics, UserMetrics]> {
        return forkJoin([
            this.loadCompanyMetrics(),
            this.loadOccurrenceMetrics(),
            this.loadUserMetrics()
        ]).pipe(
            catchError((error) => {
                console.error('Erro ao carregar métricas:', error);
                return EMPTY;
            })
        );
    }

    loadMetricsAnalyst(): Observable<[CompanyMetrics, OccurrenceMetrics]> {
        return forkJoin([
            this.loadCompanyMetrics(),
            this.loadOccurrenceMetrics(),
        ]).pipe(
            catchError((error) => {
                console.error('Erro ao carregar métricas:', error);
                return EMPTY;
            })
        );
    }



    loadUserMetrics(): Observable<UserMetrics> {
        return this.http.get<UserMetrics>(`${this.API_URL}/api/v1/users/metrics`).pipe(
            tap((data) => {
                this.metricsUserSignal.set(data)
            })
        );
    }
    loadCompanyMetrics(): Observable<CompanyMetrics> {
        return this.http.get<CompanyMetrics>(`${this.API_URL}/api/v1/companies/metrics`).pipe(
            tap((data) => {
                this.metricsCompanySignal.set(data)
            })
        );
    }

    loadOccurrenceMetrics(): Observable<OccurrenceMetrics> {
        return this.http.get<OccurrenceMetrics>(`${this.API_URL}/api/v1/default-occurrences/metrics`).pipe(
            tap((data) => {
                this.metricsOccurrenceSignal.set(data)
            })
        );
    }
    /**
     * Limpa as métricas da memória ao fazer logout
     */
    clearMetrics(): void {
        this.metricsUserSignal.set(null);
        this.metricsOccurrenceSignal.set(null);
        this.metricsCompanySignal.set(null);
    }

}
