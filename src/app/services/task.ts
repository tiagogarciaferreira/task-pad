import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { Task } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = inject(ApiService);

  private tasksSignal = signal<Task[]>([]);

  loading = signal(false);

  error = signal<string | null>(null);

  async getById(id: string) {
    this.loading.set(true);

    try {
      return await firstValueFrom(this.api.get<Task>(`/api/tasks/${id}`));
    } catch {
      this.error.set('Failed to load task');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async search(
    title?: string,
    status?: string | string[],
    estimatedHoursMin?: number,
    estimatedHoursMax?: number,
    tags?: string | string[],
  ) {
    this.loading.set(true);

    try {
      const params: Record<string, string | string[] | number> = {};

      if (title) params['title'] = title;
      if (status) params['status'] = status;
      if (tags) params['tags'] = tags;
      if (estimatedHoursMin) params['estimatedHoursMin'] = estimatedHoursMin;
      if (estimatedHoursMax) params['estimatedHoursMax'] = estimatedHoursMax;

      const tasks = await firstValueFrom(
        this.api.getWithParams<Task[]>('/api/tasks/search', params),
      );
      this.tasksSignal.set(tasks);
    } catch {
      this.error.set('Failed to load tasks');
    } finally {
      this.loading.set(false);
    }
  }

  async create(title: string, description: string, estimatedHours: number, tags: string[] = []) {
    this.loading.set(true);

    try {
      const newTask = await firstValueFrom(
        this.api.post<Task>('/api/tasks', { title, description, estimatedHours, tags }),
      );
      this.tasksSignal.update((tasks) => [newTask, ...tasks]);
    } catch {
      this.error.set('Failed to create task');
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus(id: string, status: string) {
    this.loading.set(true);

    try {
      const updated = await firstValueFrom(this.api.patch<Task>(`/api/tasks/${id}`, { status }));
      this.tasksSignal.update((tasks) => tasks.map((task) => (task.id === id ? updated : task)));
    } catch {
      this.error.set('Failed to update task status');
    } finally {
      this.loading.set(false);
    }
  }

  async update(
    id: string,
    title: string,
    description: string,
    estimatedHours: number,
    tags: string[] = [],
    status: string,
  ) {
    this.loading.set(true);

    try {
      const updated = await firstValueFrom(
        this.api.put<Task>(`/api/tasks/${id}`, {
          title,
          description,
          estimatedHours,
          tags,
          status,
        }),
      );
      this.tasksSignal.update((tasks) => tasks.map((task) => (task.id === id ? updated : task)));
    } catch {
      this.error.set('Failed to update task');
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.api.delete(`/api/tasks/${id}`));
      this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
    } catch {
      this.error.set('Failed to delete task');
    } finally {
      this.loading.set(false);
    }
  }

  clearError() {
    this.error.set(null);
  }

  tasks() {
    return this.tasksSignal.asReadonly();
  }
}
