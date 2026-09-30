import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../../services/token/token-service';
import { JwtDecoderService } from '../../services/jwt-decoder/jwt-decoder-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const jwtDecoderService = inject(JwtDecoderService);
  const token = tokenService.getTokenFromLocalStorage();

  if (!token) {
    return next(req);
  }

  const currentUser = jwtDecoderService.decodeToken(token);

  if (!currentUser || jwtDecoderService.isTokenExpired(currentUser)) {
    tokenService.removeTokenFromLocalStorage();
    return next(req);
  }


  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedReq);
};
