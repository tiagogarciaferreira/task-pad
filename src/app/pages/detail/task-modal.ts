import { Component, inject, input, output } from '@angular/core';
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
