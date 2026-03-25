import { Routes } from '@angular/router';
import { ListPage } from './pages/list/list';
import { FormPage } from './pages/form/form';
import { EditPage } from './pages/edit/edit';
import { DashboardPage } from './pages/dash/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'tasks', component: ListPage },
  { path: 'tasks/new', component: FormPage },
  { path: 'tasks/:id/edit', component: EditPage },
];
