import { AfterViewInit, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';
import { TitleService } from '../../core/title.service';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
})
export class FormPage implements OnInit, AfterViewInit {

  protected titleService = inject(TitleService);

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

  ngOnInit() {
    this.titleService.setTitle('Create Task');
  }

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

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!this.taskService.error()) {
      await Swal.fire({
        title: '✨ Task Created!',
        html: 'Your task "<strong>' + this.title + '</strong>" has been successfully created.',
        icon: 'success',
        confirmButtonColor: '#818cf8',
        background: '#1e293b',
        color: '#f1f5f9',
        timer: 3000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        this.router.navigate(['/tasks']);
      }, 1000);
    } else {
      await Swal.fire({
        title: '❌ Error!',
        html:
          'Failed to create task "<strong>' +
          this.taskService.error() +
          '</strong>".<br>Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: '#1e293b',
        color: '#f1f5f9',
        confirmButtonText: 'OK',
      });
    }
  }

  protected setDueDate($event: any) {
    this.dueDate = new Date($event);
  }
}
