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
import { AuthUser } from './auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private auth = inject(Auth);

  user = signal<User | null>(null);

  loading = signal(false);

  error = signal<string | null>(null);

  constructor() {
    authState(this.auth).subscribe((user) => {
      console.log('👤 authState:', user?.email || 'logout');
      this.user.set(user);
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

  getCurrentUser(): AuthUser | null {
    const user = this.user();
    if (!user) return null;

    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
    };
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
