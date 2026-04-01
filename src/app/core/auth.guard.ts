import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs';

export const authGuard = () => {
  const router = inject(Router);
  const auth = inject(Auth);
  return authState(auth).pipe(map((user) => (user ? true : router.parseUrl('/login'))));
};
