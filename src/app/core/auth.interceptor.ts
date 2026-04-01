import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { from, switchMap } from 'rxjs';
import { Auth, authState, onAuthStateChanged } from '@angular/fire/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(Auth);

  return authState(auth).pipe(
    switchMap((user) => {
      if (!user) return next(req);
      return from(user.getIdToken()).pipe(
        switchMap((token) => {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next(cloned);
        }),
      );
    }),
  );
};
