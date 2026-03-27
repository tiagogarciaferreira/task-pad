import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';

import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
})
export class FormPage implements AfterViewInit{

  protected taskService = inject(TaskService);

  private router = inject(Router);

  title = '';
  description = '';
  estimatedHours = 1;
  status = 'To Do';
  priority = 'Low';
  dueDate = new Date();
  tags: string[] = [];
  tagInput = '';

  statusOptions = ['To Do', 'In Progress'];
  priorityOptions = ['Low', 'Medium', 'High'];

  ngAfterViewInit() {
    flatpickr('#dueDate', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      locale: 'en',
    });
  }

  onTagKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  addTag() {
    const tag = this.tagInput.trim().toUpperCase();
    if (tag && !this.tags.includes(tag) && this.tags.length < 10) {
      this.tags.push(tag);
      this.tagInput = '';
    }
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  async onSubmit() {
    this.taskService.clearError();
    await this.taskService.create(
      this.title.trim(),
      this.description.trim(),
      this.estimatedHours,
      this.tags,
      this.status,
      this.priority,
      this.dueDate,
    );

    if (!this.taskService.error()) {
      await this.router.navigate(['/tasks']);
    }
  }
}
