import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ListPage } from './pages/list/list';
import { FormPage } from './pages/create/create';
import { EditPage } from './pages/edit/edit';
import { DashboardPage } from './pages/dash/dashboard';
import { LoginPage } from './pages/login/login';
import { loginGuard } from './core/login.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [loginGuard] },
  { path: '', redirectTo: '/tasks/dashboard', pathMatch: 'full' },
  { path: 'tasks/dashboard', component: DashboardPage, canActivate: [authGuard] },
  { path: 'tasks', component: ListPage, canActivate: [authGuard] },
  { path: 'tasks/new', component: FormPage, canActivate: [authGuard] },
  { path: 'tasks/:id/edit', component: EditPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '/tasks/dashboard' },
];
