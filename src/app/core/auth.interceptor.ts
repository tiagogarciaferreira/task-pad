import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(Auth);

  return from(auth.authStateReady()).pipe(
    switchMap(() => {
      const user = auth.currentUser;
      if (!user) return next(req);

      return from(user.getIdToken(false)).pipe(
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
