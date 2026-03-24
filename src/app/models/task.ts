export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  status: 'Pending' | 'In Progress' | 'Review' | 'Done';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
