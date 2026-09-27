import { Service } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';
import { AuthCredentials } from '../../models/auth/auth-credentials';

@Service()
export class AuthService {

    login(authCredentials: AuthCredentials): Observable<boolean> {
        // Simulação de login - substituir por chamada à API real
        return observableOf(true);
    }

}
