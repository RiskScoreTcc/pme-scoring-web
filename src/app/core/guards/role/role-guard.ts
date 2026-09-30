import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JwtDecoderService } from '../../services/jwt-decoder/jwt-decoder-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const jwtDecoderService = inject(JwtDecoderService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;

  jwtDecoderService.setUser();
  const user = jwtDecoderService.getUser();

  if (user && user.role) {
    const userRole = user.role.toUpperCase();

    const hasPermission = expectedRoles.some(
      (expectedRole) => expectedRole.toUpperCase() === userRole
    );

    if (hasPermission) {
      return true; 
    }
  }

  return router.createUrlTree(['/overview']);
};
