import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task';
import { TaskModalComponent } from '../detail/task-modal';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TaskModalComponent],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class ListPage implements OnInit {

  protected taskService = inject(TaskService);

  private router = inject(Router);

  searchTitle = signal('');

  selectedStatuses = signal<string[]>(['In Progress']);

  estimatedHoursMin = signal<number | undefined>(undefined);

  estimatedHoursMax = signal<number | undefined>(undefined);

  selectedTags = signal<string[]>([]);

  selectedTask = signal<Task | null>(null);

  showModal = signal(false);

  tagInput = '';
  statusOptions = ['To Do', 'In Progress', 'Review', 'Done'];

  tasksByStatus = computed(() => {
    const tasks = this.taskService.tasks();
    return {
      toDo: tasks().filter((t: { status: string }) => t.status === 'To Do'),
      inProgress: tasks().filter((t: { status: string }) => t.status === 'In Progress'),
      review: tasks().filter((t: { status: string }) => t.status === 'Review'),
      done: tasks().filter((t: { status: string }) => t.status === 'Done'),
    };
  });

  hasActiveFilters = computed(() => {
    return (
      this.searchTitle() !== '' ||
      this.selectedStatuses().length > 0 ||
      this.estimatedHoursMin() !== undefined ||
      this.estimatedHoursMax() !== undefined ||
      this.selectedTags().length > 0
    );
  });

  ngOnInit() {
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  toggleStatusFilter(status: string) {
    this.selectedStatuses.update((current) => {
      const index = current.indexOf(status);
      if (index === -1) {
        return [...current, status];
      } else {
        return current.filter((s) => s !== status);
      }
    });
    this.applyFilters();
  }

  setHoursMin(value: string) {
    const num = value ? Number(value) : undefined;
    this.estimatedHoursMin.set(num);
    this.applyFilters();
  }

  setHoursMax(value: string) {
    const num = value ? Number(value) : undefined;
    this.estimatedHoursMax.set(num);
    this.applyFilters();
  }

  addTagFilter() {
    const tag = this.tagInput.trim().toUpperCase();
    if (tag && !this.selectedTags().includes(tag) && this.selectedTags().length < 10) {
      this.selectedTags.update((current) => [...current, tag]);
      this.tagInput = '';
      this.applyFilters();
    }
  }

  removeTagFilter(tag: string) {
    this.selectedTags.update((current) => current.filter((t) => t !== tag));
    this.applyFilters();
  }

  onTagKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTagFilter();
    }
  }

  clearFilters() {
    this.searchTitle.set('');
    this.selectedStatuses.set([]);
    this.estimatedHoursMin.set(undefined);
    this.estimatedHoursMax.set(undefined);
    this.selectedTags.set([]);
    this.tagInput = '';
    this.applyFilters();
  }

  private applyFilters() {
    this.taskService.search(
      this.searchTitle() || undefined,
      this.selectedStatuses().length > 0 ? this.selectedStatuses() : undefined,
      this.estimatedHoursMin(),
      this.estimatedHoursMax(),
      this.selectedTags().length > 0 ? this.selectedTags() : undefined,
    );
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatuses().includes(status);
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
