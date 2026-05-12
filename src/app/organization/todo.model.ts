export type TodoStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Todo {
  id: number;
  title: string;
  status: TodoStatus;
}
