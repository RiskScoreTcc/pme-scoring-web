import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiErrorResponse } from '../../models/api-error-response';
import { WeightResponse } from '../../models/weights/weight-response';
import { WeightRequest } from '../../models/weights/weight-request';

@Service()
export class WeightsService {
    private readonly API_URL = 'http://localhost:8080';
    private readonly http = inject(HttpClient);

    searchWeightsActive(): Observable<WeightResponse> {
        return this.http
            .get<WeightResponse>(`${this.API_URL}/api/v1/weight-configurations/active`)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse;
                    const message =
                        apiError?.message ||
                        'An error occurred while fetching the active weight configuration.';
                    return throwError(() => new Error(message));
                })
            );
    }

    saveConfiguration(payload: Partial<WeightRequest>): Observable<WeightResponse> {
        return this.http
            .post<WeightResponse>(`${this.API_URL}/api/v1/weight-configurations`, payload)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse;
                    const message =
                        apiError?.message ||
                        'An error occurred while saving the weight configuration.';
                    return throwError(() => new Error(message));
                })
            );
    }
}
