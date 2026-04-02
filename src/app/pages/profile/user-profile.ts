import { Component, inject, signal, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AuthUser } from '../../core/auth.user';
import { Subscription } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
})
export class UserProfile implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  private router = inject(Router);

  showMenu = signal(false);

  currentUser = signal<AuthUser | null>(null);

  private userSubscription!: Subscription;

  imageError = false;

  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.loadUserData(user);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadUserData(user: User | null) {
    if (user) {
      const initials = user.displayName
        ?.trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      this.currentUser.set({
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        initials: initials,
      });
    }
  }

  userPhoto(): string {
    const user = this.currentUser();
    if (!this.imageError && user?.photo) return user.photo;
    const name = encodeURIComponent(user?.name ?? 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=random`;
  }

  toggleMenu() {
    this.showMenu.update((v) => !v);
    if (this.showMenu()) {
      setTimeout(() => {
        document.addEventListener('click', this.closeMenuOnClickOutside.bind(this));
      }, 0);
    }
  }

  closeMenuOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-info-wrapper')) {
      this.showMenu.set(false);
      document.removeEventListener('click', this.closeMenuOnClickOutside.bind(this));
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onImageError() {
    this.imageError = true;
  }
}
