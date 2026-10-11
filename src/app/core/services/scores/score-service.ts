import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiErrorResponse } from '../../models/api-error-response';
import { ScoreRequest } from '../../models/score/score-request';
import { JwtDecoderService } from '../jwt-decoder/jwt-decoder-service';
import { CalculatedScore } from '../../models/score/calculated-score';
import { environment } from '../../../../environments/environment';

@Service()
export class ScoreService {
    private readonly API_URL = environment.apiUrl;
    private readonly http = inject(HttpClient);
    private readonly jwtService = inject(JwtDecoderService);


    calculateScore(companyId: number): Observable<CalculatedScore> {
        const user = this.jwtService.getUser();

        const scoreRequest: ScoreRequest = {
            firmId: companyId,
            userId: user?.id ?? 1 
        };

        return this.http
            .post<CalculatedScore>(`${this.API_URL}calculated-scores`, scoreRequest)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse | undefined;

                    const message =
                        apiError?.message ||
                        (typeof errorResponse.error === 'string' ? errorResponse.error : null) ||
                        'Ocorreu um erro inesperado ao calcular o score da empresa.'; // <- Texto corrigido

                    return throwError(() => new Error(message));
                })
            );
    }


}
