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

    getUser(): CurrentUser | null {

        const currentToken = this.userSubject.value;

        if (!currentToken) {
            return null;
        }
        if (this.isTokenExpired(currentToken)) {
            this.userSubject.next(null);
            return null;
        }
        return currentToken;
    }

    isTokenExpired(user: CurrentUser): boolean {
        if (!user.exp) return false;
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        return user.exp < currentTimeInSeconds;
    }
}
