import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AuthUser } from '../../core/auth.user';

@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
})
export class UserProfile implements OnInit {

  private authService = inject(AuthService);

  private router = inject(Router);

  showMenu = signal(false);

  currentUser = signal<AuthUser | null>(null);

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user) this.currentUser.set(user);
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
    if (!target.closest('.user-profile')) {
      this.showMenu.set(false);
      document.removeEventListener('click', this.closeMenuOnClickOutside.bind(this));
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
