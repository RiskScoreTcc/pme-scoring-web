import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { ApiErrorResponse } from '../../models/api-error-response';
import { catchError } from 'rxjs/operators';
import { Company } from '../../models/companies/company';
import { FirmWithScore } from '../../models/companies/firm-with-score';
import { CompanyCreate } from '../../models/companies/company-create';
import { Page } from '../../models/Page';
import { CompanyFilter } from '../../models/companies/company-filter';

@Service()
export class CompanyService {
    private readonly API_URL = 'http://localhost:8080';
    private readonly http = inject(HttpClient);

    searchCompaniesAll(page: number = 0, size: number = 10): Observable<Page<Company>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());


        return this.http
            .get<Page<Company>>(`${this.API_URL}/api/v1/companies`, { params })
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




    create(formValue: CompanyCreate): Observable<Company> {

        return this.http
            .post<Company>(
                `${this.API_URL}/api/v1/companies`,
                formValue
            )
            .pipe(
                catchError(
                    (errorResponse: HttpErrorResponse) => {

                        const apiError =
                            errorResponse.error as
                            ApiErrorResponse | undefined;

                        const message =
                            apiError?.message ||
                            (
                                typeof errorResponse.error === 'string'
                                    ? errorResponse.error
                                    : null
                            ) ||
                            'Ocorreu um erro inesperado ao cadastrar a empresa.';

                        return throwError(
                            () => new Error(message)
                        );
                    }
                )
            );
    }

    update(company: Company): void {
        // ...
    }


    deleteCompany(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/api/v1/companies/${id}`).pipe(
            catchError((errorResponse: HttpErrorResponse) => {
                const apiError = errorResponse.error as ApiErrorResponse | undefined;

                const message =
                    apiError?.message ||
                    (typeof errorResponse.error === 'string' ? errorResponse.error : null) ||
                    'Ocorreu um erro inesperado ao excluir a empresa.';

                return throwError(() => new Error(message));
            })
        );
    }

    searchCompanies(filter: CompanyFilter, page: number = 0, size: number = 10): Observable<Page<FirmWithScore>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });

        

        // Adiciona os parâmetros de filtro à URL
        if (filter.query) {
            params.set('query', filter.query);
        }
        if (filter.riskBand !== undefined) {
            params.set('riskBand', filter.riskBand);
        }


        return this.http.get<Page<FirmWithScore>>(`${this.API_URL}/api/v1/companies/filter?${params}`)
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
}


