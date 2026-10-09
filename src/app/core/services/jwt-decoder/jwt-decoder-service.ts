import { Service, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { CurrentUser } from '../../models/jwt-decoder/current-user';
import { TokenService } from '../token/token-service';

@Service()
export class JwtDecoderService {
    private userSubject = new BehaviorSubject<CurrentUser | null>(null);
    private readonly tokenService = inject(TokenService);
    public user$ = this.userSubject.asObservable();

    decodeToken(token: string): CurrentUser | null {
        try {
            const decodedUser = jwtDecode<CurrentUser>(token);
            if (this.isTokenExpired(decodedUser)) {
                return null;
            }
            return decodedUser;
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            return null;
        }
    }

    /**
     * Método de EFEITO: Atualiza o estado reativo do userSubject.
     * Deve ser chamado apenas na inicialização (AppComponent), login ou logout.
     */
    setUser(): CurrentUser | null {
        const token = this.tokenService.getTokenFromLocalStorage();

        if (!token) {
            this.userSubject.next(null);
            return null;
        }

        try {
            const user = jwtDecode<CurrentUser>(token);

            if (this.isTokenExpired(user)) {
                this.userSubject.next(null);
                return null;
            }

            this.userSubject.next(user);
            return user;
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            this.userSubject.next(null);
            return null;
        }
    }

    /**
     * LEITURA PURA: Não dispara .next() nem efeitos colaterais.
     * Seguro para ser chamado dentro de computed(), getters ou templates HTML.
     */
    getUser(): CurrentUser | null {
        const currentToken = this.userSubject.value;

        // 1. Se já está no Subject e é válido, retorna direto
        if (currentToken && !this.isTokenExpired(currentToken)) {
            return currentToken;
        }

        // 2. Tenta decodificar passivamente do LocalStorage sem alterar estado (.next)
        const token = this.tokenService.getTokenFromLocalStorage();
        if (!token) {
            return null;
        }

        try {
            const user = jwtDecode<CurrentUser>(token);
            if (this.isTokenExpired(user)) {
                return null;
            }
            return user;
        } catch {
            return null;
        }
    }

    isTokenExpired(user: CurrentUser): boolean {
        if (!user?.exp) return false;
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        return user.exp < currentTimeInSeconds;
    }
}
