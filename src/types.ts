export interface Task {
  id: string;
  name: string;
  start?: Date;
  end?: Date;
  duration?: number; // in days
  depends: string[];
  status: 'todo' | 'in-progress' | 'done';
}
