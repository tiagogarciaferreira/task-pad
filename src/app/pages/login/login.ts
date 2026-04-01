import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { TitleService } from '../../core/title.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})

export class LoginPage implements OnInit{

  protected titleService = inject(TitleService);

  protected authService = inject(AuthService);

  private router = inject(Router);

  ngOnInit() {
    this.titleService.setTitle('Login');
  }

  async login() {
    const user = await this.authService.loginWithGoogle();
    if (user) {
      await this.router.navigate(['/tasks/dashboard']);
    }
  }
}
