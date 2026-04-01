import { Component, inject, OnInit, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task';
import { TaskModalComponent } from '../detail/task-modal';
import { TitleService } from '../../core/title.service';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TaskModalComponent],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class ListPage implements OnInit, AfterViewInit {

  private titleService = inject(TitleService);

  protected taskService = inject(TaskService);

  private router = inject(Router);

  searchTitle = signal('');

  selectedStatuses = signal<string[]>(['In Progress']);

  selectedPriorities = signal<string[]>(['High']);

  estimatedHoursMin = signal<number | undefined>(undefined);

  estimatedHoursMax = signal<number | undefined>(undefined);

  selectedTags = signal<string[]>([]);

  dueDateMin = signal<Date | undefined>(undefined);

  dueDateMax = signal<Date | undefined>(undefined);

  selectedTask = signal<Task | null>(null);

  showModal = signal(false);

  tagInput = '';
  statusOptions = ['To Do', 'In Progress', 'Review', 'Done'];
  priorityOptions = ['Low', 'Medium', 'High'];

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
      this.selectedTags().length > 0 ||
      this.selectedPriorities().length > 0 ||
      this.dueDateMin() !== undefined ||
      this.dueDateMax() !== undefined
    );
  });

  ngOnInit() {
    this.titleService.setTitle('Tasks');
    this.applyFilters();
  }

  ngAfterViewInit() {
    flatpickr('.date-input', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      locale: 'en',
    });
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

  togglePriorityFilter(priority: string) {
    this.selectedPriorities.update((current) => {
      const index = current.indexOf(priority);
      if (index === -1) {
        return [...current, priority];
      } else {
        return current.filter((s) => s !== priority);
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

  setDueDateMin($event: any) {
    this.dueDateMin.set(new Date($event));
    this.applyFilters();
  }

  setDueDateMax($event: any) {
    this.dueDateMax.set(new Date($event));
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
    this.selectedPriorities.set([]);
    this.tagInput = '';
    this.dueDateMin.set(undefined);
    this.dueDateMax.set(undefined);
    this.applyFilters();
  }

  applyFilters() {
     this.taskService.search(
      this.searchTitle() || undefined,
      this.selectedStatuses().length > 0 ? this.selectedStatuses() : undefined,
      this.estimatedHoursMin(),
      this.estimatedHoursMax(),
      this.selectedTags().length > 0 ? this.selectedTags() : undefined,
      this.selectedPriorities().length > 0 ? this.selectedPriorities() : undefined,
      this.dueDateMin(),
      this.dueDateMax(),
    );
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatuses().includes(status);
  }

  isPrioritySelected(priority: string): boolean {
    return this.selectedPriorities().includes(priority);
  }

  isOverdue(dueDate: string | Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
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

  async confirmDelete(id: string, title: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `Delete "<strong>${title}</strong>"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#1e293b',
      color: '#f1f5f9',
    });

    if (result.isConfirmed) {
      await this.taskService.delete(id);
      await Swal.fire({
        title: 'Deleted!',
        text: 'Task has been deleted.',
        icon: 'success',
        confirmButtonColor: '#818cf8',
        background: '#1e293b',
        color: '#f1f5f9',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }
}
