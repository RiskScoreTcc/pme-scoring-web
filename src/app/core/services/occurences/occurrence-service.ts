import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiErrorResponse } from '../../models/api-error-response';
import { Occurrence } from '../../models/occurences/occurrence';
import { OccurrenceCreate } from '../../models/occurences/occurrence-create';
import { Page } from '../../models/Page';

@Service()
export class OccurrenceService {
    private readonly API_URL = 'http://localhost:8080';
    private readonly http = inject(HttpClient);

    searchOccurrences(pageIndex: number, pageSize: number, sort: string): Observable<Page<Occurrence>> {
        const params = new URLSearchParams({
            page: pageIndex.toString(),
            size: pageSize.toString()
        });

        return this.http
            .get<Page<Occurrence>>(`${this.API_URL}/api/v1/default-occurrences?${params}`)
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
        console.log(
            'Registrando ocorrência para empresa:',
            occurrenceData.companyId
        );
        const occurrence: Occurrence =
        {
            id: 1,
            firm: {
                id: 1,
                cnpj: '12.345.678/0001-90',
                companyName: 'Alfa Comércio Ltda.'
            },
            type: 'Atraso de pagamento',
            description: 'Pagamento de obrigação financeira realizado após o prazo estabelecido.',
            status: 'resolved',
            date: '2026-09-18',
        }
        // Implement the actual creation logic here
        return null as any; // Placeholder for the actual Observable<Occurrence>
    }
}
