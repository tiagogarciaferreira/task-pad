import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  browserLocalPersistence,
  setPersistence,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private auth = inject(Auth);

  loading = signal(false);

  error = signal<string | null>(null);

  private userSubject = new BehaviorSubject<User | null>(null);

  user$ = this.userSubject.asObservable();

  constructor() {
    authState(this.auth).subscribe((user) => {
      this.userSubject.next(user);
    });
  }

  async loginWithGoogle(): Promise<User | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await setPersistence(this.auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const credential = await signInWithPopup(this.auth, provider);
      return credential.user;

    } catch (err: any) {
      this.error.set('Login failed');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    this.loading.set(true);
    try {
      await signOut(this.auth);
    } finally {
      this.loading.set(false);
    }
  }
}
