import { Service } from '@angular/core';

@Service()
export class TokenService {
    private readonly TOKEN_KEY = 'authToken';
    
    addTokenToLocalStorage(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    getTokenFromLocalStorage(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    removeTokenFromLocalStorage(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    hasToken(): boolean {
        return this.getTokenFromLocalStorage() !== null;
    }
}
