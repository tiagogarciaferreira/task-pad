import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs';

export const loginGuard = () => {

  const auth = inject(Auth);

  const router = inject(Router);

  return authState(auth).pipe(
    map((user) => {
      if (user) return router.parseUrl('/tasks/dashboard');
      return true;
    }),
  );
};
