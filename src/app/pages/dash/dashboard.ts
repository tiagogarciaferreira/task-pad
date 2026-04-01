import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task';
import { TaskModalComponent } from '../detail/task-modal';
import { TitleService } from '../../core/title.service';
import { Auth, authState } from '@angular/fire/auth';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskModalComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardPage implements OnInit {
  protected titleService = inject(TitleService);

  protected taskService = inject(TaskService);

  private router = inject(Router);

  protected auth = inject(Auth);

  selectedTask = signal<Task | null>(null);

  showModal = signal(false);

  ngOnInit() {
    this.titleService.setTitle('Dashboard');
    authState(this.auth).pipe(
      filter((user) => !!user),
      switchMap(() => this.taskService.search()),
    );
  }

  metrics = computed(() => {
    const tasks = this.taskService.tasks();
    return {
      total: tasks().length,
      toDo: tasks().filter((t) => t.status === 'To Do').length,
      inProgress: tasks().filter((t) => t.status === 'In Progress').length,
      review: tasks().filter((t) => t.status === 'Review').length,
      done: tasks().filter((t) => t.status === 'Done').length,
      completionRate:
        tasks().length > 0
          ? Math.round((tasks().filter((t) => t.status === 'Done').length / tasks().length) * 100)
          : 0,
    };
  });

  recentTasks = computed(() => {
    return [...this.taskService.tasks()()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  });

  inProgressTasks = computed(() => {
    return [...this.taskService.tasks()()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((t) => t.status === 'In Progress')
      .slice(0, 5);
  });

  priorityMetrics = computed(() => {
    const tasks = this.taskService.tasks();
    return {
      high: tasks().filter((t) => t.priority === 'High').length,
      medium: tasks().filter((t) => t.priority === 'Medium').length,
      low: tasks().filter((t) => t.priority === 'Low').length,
      highOverdue: tasks().filter(
        (t) => t.priority === 'High' && this.isOverdue(t.dueDate) && t.status !== 'Done',
      ).length,
    };
  });

  overdueMetrics = computed(() => {
    const tasks = this.taskService.tasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      overdue: tasks().filter(
        (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'Done',
      ).length,
      dueToday: tasks().filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due.toDateString() === today.toDateString() && t.status !== 'Done';
      }).length,
      dueThisWeek: tasks().filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays >= 0 && diffDays <= 7 && t.status !== 'Done';
      }).length,
    };
  });

  overdueHighPriorityTasks = computed(() => {
    const tasks = this.taskService.tasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks().filter(
      (t) =>
        t.priority === 'High' && t.dueDate && new Date(t.dueDate) < today && t.status !== 'Done',
    );
  });

  totalTasks = computed(() => {
    return this.taskService
      .tasks()()
      .filter((t) => t.status !== 'Done').length;
  });

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  openTaskModal(task: Task) {
    this.selectedTask.set(task);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedTask.set(null);
  }

  editTask(taskId: string) {
    this.closeModal();
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  isOverdue(dueDate: string | Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }
}
