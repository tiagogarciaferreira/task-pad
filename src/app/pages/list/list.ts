import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class ListPage implements OnInit {
  protected taskService = inject(TaskService);

  searchTitle = signal('');

  selectedStatuses = signal<string[]>([]);

  statusOptions = ['Pending', 'In Progress', 'Review', 'Done'];

  hasActiveFilters = computed(() => {
    return this.searchTitle() !== '' || this.selectedStatuses().length > 0;
  });

  ngOnInit() {
    this.taskService.search();
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

  clearFilters() {
    this.searchTitle.set('');
    this.selectedStatuses.set([]);
    this.applyFilters();
  }

  private applyFilters() {
    const status = this.selectedStatuses().length > 0 ? this.selectedStatuses() : undefined;
    this.taskService.search(this.searchTitle() || undefined, status);
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatuses().includes(status);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}
