import { CanActivateFn, Router } from '@angular/router';
import { inject } from "@angular/core";
import { AuthService } from '../../services/auth/auth-service';
import { TokenService } from '../../services/token/token-service';
import { JwtDecoderService } from '../../services/jwt-decoder/jwt-decoder-service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const jwtDecoderService = inject(JwtDecoderService);
  const router = inject(Router);

  const token = tokenService.getTokenFromLocalStorage();

  if (authService.isLoggedIn() && token) {
    const currentUser = jwtDecoderService.decodeToken(token);

    if (!currentUser || jwtDecoderService.isTokenExpired(currentUser)) {

      authService.logout();

      return router.createUrlTree(['/login'], {
        queryParams: { expired: 'true' }
      });
    }

    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });


};
