import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './services/auth.service';
import { getToken } from './session';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = getToken();
  const esRutaPublica = req.url.includes('/login_check') || req.url.includes('/register');

  const peticion =
    token && !esRutaPublica
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;


  console.log(
    'AUTH HEADER',
    peticion.headers.get('Authorization'),
  );
  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !esRutaPublica) {
        auth.cerrarSesion('Tu sesión expiró. Inicia sesión de nuevo.');

        if (router.url !== '/login') {
          void router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    }),
  );
};
