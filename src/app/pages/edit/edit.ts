import { AfterViewInit, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
})
export class EditPage implements OnInit, AfterViewInit {
  protected taskService = inject(TaskService);

  private router = inject(Router);

  private route = inject(ActivatedRoute);

  id = '';
  title = '';
  description = '';
  estimatedHours = 0.5;
  status = 'To Do';
  priority = 'Low';
  dueDate = new Date();
  tags: string[] = [];
  tagInput = '';

  statusOptions = ['To Do', 'In Progress', 'Review', 'Done'];
  priorityOptions = ['Low', 'Medium', 'High'];

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.loadTask();
    }
  }

  ngAfterViewInit() {
    flatpickr('#dueDate', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      locale: 'en',
    });
  }

  async loadTask() {
    const task = await this.taskService.getById(this.id);
    if (task) {
      this.title = task.title;
      this.description = task.description || '';
      this.estimatedHours = task.estimatedHours || 0.5;
      this.status = task.status;
      this.tags = task.tags || [];
      this.dueDate = task.dueDate;
      console.log(this.dueDate);
      this.priority = task.priority || 'Low';
    } else {
      await this.router.navigate(['/tasks']);
    }
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

    if (this.tags.length === 0) {
      this.taskService.error.set('At least one tag is required');
      return;
    }

    await this.taskService.update(
      this.id,
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
        title: '✨ Task Edited!',
        html: 'Your task "<strong>' + this.title + '</strong>" has been successfully edited.',
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
          'Failed to edited task "<strong>' +
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
