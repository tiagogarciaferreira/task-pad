import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardPage implements OnInit {

  protected taskService = inject(TaskService);

  // Métricas computadas
  metrics = computed(() => {
    const tasks = this.taskService.tasks();

    return {
      total: tasks().length,
      pending: tasks().filter((t) => t.status === 'Pending').length,
      inProgress: tasks().filter((t) => t.status === 'In Progress').length,
      review: tasks().filter((t) => t.status === 'Review').length,
      done: tasks().filter((t) => t.status === 'Done').length,
      completionRate:
        tasks().length > 0
          ? Math.round((tasks().filter((t) => t.status === 'Done').length / tasks().length) * 100)
          : 0,
      totalHours: tasks().reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      uniqueTags: new Set(tasks().flatMap((t) => t.tags || [])).size,
    };
  });

  // Últimas 5 tarefas
  recentTasks = computed(() => {
    return [...this.taskService.tasks()()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  });

  ngOnInit() {
    this.taskService.search();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}
