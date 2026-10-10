import { Service, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthCredentials } from '../../models/auth/auth-credentials';
import { TokenService } from '../token/token-service';
import { AuthResponse } from '../../models/auth/auth-response';
import { JwtDecoderService } from '../jwt-decoder/jwt-decoder-service';
import { MetricsStateService } from '../matric/metrics-state-service';

@Service()
export class AuthService {
    private readonly API_URL = 'http://localhost:8080';
    private readonly http = inject(HttpClient);
    private readonly tokenService = inject(TokenService);
    private readonly jwtDecoderService = inject(JwtDecoderService);
    private readonly isAuthenticated = signal(this.tokenService.hasToken());
    private readonly metricsStateService = inject(MetricsStateService);

    readonly isLoggedIn = this.isAuthenticated.asReadonly();


    login(authCredentials: AuthCredentials): Observable<boolean> {
        return this.http.post<AuthResponse>(`${this.API_URL}/api/v1/users/login`, authCredentials).pipe(
            tap((response) => {
                if (response?.token) {
                    const token = response?.token;
                    this.tokenService.addTokenToLocalStorage(token);
                    this.jwtDecoderService.setUser();
                    this.checkSession();
                    this.isAuthenticated.set(true);
                }
            }),
            map(() => true),
            catchError((err) => {
                this.isAuthenticated.set(false);
                return throwError(() => err);
            })
        );
    }

    validateToken(token: string): Observable<boolean> {
        return this.http.get<void>(`${this.API_URL}/api/v1/users/valid/`, { params: { token } }).pipe(
            tap(() => {
                this.isAuthenticated.set(true);
            }),
            map(() => true),
            catchError((err) => {
                this.tokenService.removeTokenFromLocalStorage();
                this.isAuthenticated.set(false);
                return of(false);
            })
        );
    }

    logout(): void {
        this.tokenService.removeTokenFromLocalStorage();
        this.metricsStateService.clearMetrics();
        this.isAuthenticated.set(false);
    }

    checkSession() {
        this.jwtDecoderService.setUser();
        const user = this.jwtDecoderService.getUser();
        if (user && user.role === 'ADMIN') {
            this.metricsStateService.loadMetricsAdmin().subscribe();
        } else if (user) {
            this.metricsStateService.loadMetricsAnalyst().subscribe();
        }
    }

}
