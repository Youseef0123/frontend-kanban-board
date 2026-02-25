export type ColumnId = 'backlog' | 'in_progress' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  column: ColumnId;
  priority: Priority;
  order: number;
  createdAt: string;
}

export type CreateTaskPayload = Omit<Task, 'id' | 'createdAt'>;

export type UpdateTaskPayload = Partial<Omit<Task, 'id' | 'createdAt'>>;

export interface Column {
  id: ColumnId;
  label: string;
  color: string;
}

export const COLUMNS: Column[] = [
  { id: 'backlog',     label: 'TO DO',        color: '#4285f4' },
  { id: 'in_progress', label: 'IN PROGRESS',  color: '#ff9800' },
  { id: 'review',      label: 'IN REVIEW',    color: '#9c27b0' },
  { id: 'done',        label: 'DONE',         color: '#4caf50' },
];
