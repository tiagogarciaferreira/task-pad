export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  tags: string[];
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  userId: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
