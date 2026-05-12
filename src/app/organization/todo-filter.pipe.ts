import { Pipe, PipeTransform } from '@angular/core';
import { Todo } from './todo.model';

@Pipe({
  name: 'todoFilter',
  standalone: true
})
export class TodoFilterPipe implements PipeTransform {
  transform(
    todos: Todo[],
    search: string,
    status: string
  ): Todo[] {
    return todos.filter(t =>
      (!search || t.title.toLowerCase().includes(search.toLowerCase())) &&
      (!status || t.status === status)
    );
  }
}
