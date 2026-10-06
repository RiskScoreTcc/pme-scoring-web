import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiErrorResponse } from '../../models/api-error-response';
import { Occurrence } from '../../models/occurences/occurrence';
import { OccurrenceCreate } from '../../models/occurences/occurrence-create';
import { Page } from '../../models/Page';
import { OccurrenceUpdate } from '../../models/occurences/occurrence-update';
import { OccurrenceFilter } from '../../models/occurences/occurrence-filter';

@Service()
export class OccurrenceService {
    private readonly API_URL = 'http://localhost:8080';
    private readonly http = inject(HttpClient);

    searchOccurrences(pageIndex: number, pageSize: number, filter: OccurrenceFilter, sort: string): Observable<Page<Occurrence>> {
        const params = new URLSearchParams({
            page: pageIndex.toString(),
            size: pageSize.toString()
        });

        // Adiciona os parâmetros de filtro à URL
        if (filter.query) {
            params.set('query', filter.query);
        }
        if (filter.statusResolved !== undefined) {
            params.set('statusResolved', filter.statusResolved.toString());
        }   

        return this.http
            .get<Page<Occurrence>>(`${this.API_URL}/api/v1/default-occurrences/filter?${params}`)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse;
                    const message =
                        apiError?.message ||
                        'An unexpected error occurred while searching for occurrences.';
                    return throwError(() => new Error(message));
                })
            );
    }

    create(occurrenceData: OccurrenceCreate): Observable<Occurrence> {

        return this.http
            .post<Occurrence>(`${this.API_URL}/api/v1/default-occurrences`, occurrenceData)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse | undefined;

                    // Extrai a mensagem de forma segura (trata objetos de erro, strings puras e falhas de rede)
                    const message =
                        apiError?.message ||
                        (typeof errorResponse.error === 'string' ? errorResponse.error : null) ||
                        'Ocorreu um erro inesperado ao cadastrar a ocorrência.';

                    return throwError(() => new Error(message));
                })
            );
    }

    delete(occurrenceId: string): Observable<void> {
        return this.http
            .delete<void>(`${this.API_URL}/api/v1/default-occurrences/${occurrenceId}`)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse | undefined;

                    const message =
                        apiError?.message ||
                        (typeof errorResponse.error === 'string' ? errorResponse.error : null) ||
                        'Ocorreu um erro inesperado ao excluir a ocorrência.';

                    return throwError(() => new Error(message));
                })
            );
    }

    update(occurrenceId: string, occurrenceData: OccurrenceUpdate): Observable<Occurrence> {
        return this.http
            .patch<Occurrence>(`${this.API_URL}/api/v1/default-occurrences/${occurrenceId}`, occurrenceData)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse | undefined;

                    const message =
                        apiError?.message ||
                        (typeof errorResponse.error === 'string' ? errorResponse.error : null) ||
                        'Ocorreu um erro inesperado ao atualizar a ocorrência.';

                    return throwError(() => new Error(message));
                })
            );
    }

    updateStatus(occurrenceId: string, status: boolean): Observable<Occurrence> {
        return this.http
            .patch<Occurrence>(`${this.API_URL}/api/v1/default-occurrences/${occurrenceId}/status`, { status })
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse | undefined;

                    const message =
                        apiError?.message ||
                        (typeof errorResponse.error === 'string' ? errorResponse.error : null) ||
                        'Ocorreu um erro inesperado ao atualizar o status da ocorrência.';

                    return throwError(() => new Error(message));
                })
            );
    }
}
