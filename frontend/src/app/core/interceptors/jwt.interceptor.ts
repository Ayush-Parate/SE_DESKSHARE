import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { SessionService } from '../services/session.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.token();
  // Only attach real JWTs — demo-token-* strings fail backend validation and force 401s.
  const looksLikeJwt = !!token && token.split('.').length === 3;

  if (looksLikeJwt && req.url.includes('/api/v1')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
