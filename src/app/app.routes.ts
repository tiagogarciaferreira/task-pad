import { Routes } from '@angular/router';
import { ListPage } from './pages/list/list';
import { FormPage } from './pages/form/form';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', component: ListPage },
  { path: 'tasks/new', component: FormPage },
];
