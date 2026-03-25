import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task';
import { TaskModalComponent } from '../detail/task-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskModalComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardPage implements OnInit {

  protected taskService = inject(TaskService);

  private router = inject(Router);

  selectedTask = signal<Task | null>(null);

  showModal = signal(false);

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

  ngOnInit() {
    this.taskService.search();
  }

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
}
