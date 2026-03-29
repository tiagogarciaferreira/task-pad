import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-modal.html',
  styleUrls: ['./task-modal.scss'],
})
export class TaskModalComponent {

  task = input.required<Task>();

  close = output<void>();

  edit = output<string>();

  onClose() {
    this.close.emit();
  }

  onEdit() {
    this.edit.emit(this.task().id);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  isOverdue(dueDate: string | Date): boolean {
    if (this.task().status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }
}
