import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './form.html',
  styleUrls: ['./form.scss'],
})
export class FormPage {
  protected taskService = inject(TaskService);

  private router = inject(Router);

  title = '';
  description = '';
  estimatedHours = 0.5;
  status= 'Pending';

  statusOptions = ['Pending', 'In Progress', 'Review', 'Done'];

  async onSubmit() {
    this.taskService.clearError();
    await this.taskService.create(this.title.trim(), this.description.trim(), this.estimatedHours);

    if (!this.taskService.error()) {
      await this.router.navigate(['/tasks']);
    }
  }
}
