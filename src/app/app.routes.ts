import { Routes } from '@angular/router';
import { ListPage } from './pages/list/list';
import { FormPage } from './pages/form/form';
import { EditPage } from './pages/edit/edit';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', component: ListPage },
  { path: 'tasks/new', component: FormPage },
  { path: 'tasks/:id/edit', component: EditPage },
];
