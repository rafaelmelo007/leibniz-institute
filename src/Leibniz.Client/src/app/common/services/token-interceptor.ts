import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../account/services/auth.service';

export function tokenInterceptor(
  req: HttpRequest<any>,
  next: HttpHandlerFn
) {
  const userToken = inject(AuthService).getToken();
  const newReq = req.clone({
    headers: req.headers.set(
      'Authorization',
      `Bearer ${userToken?.accessToken}`
    ),
  });

  return next(newReq);
}
