import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  standalone: true,
  selector: 'app-action-button-renderer',
  template: `
    <button class="bg-blue-500 text-white px-2 py-1 rounded mr-1">
      Edit
    </button>
    <button class="bg-red-500 text-white px-2 py-1 rounded">
      Delete
    </button>
  `
})
export class ActionButtonRenderer
  implements ICellRendererAngularComp {

  agInit(): void {}
  refresh(): boolean {
    return false;
  }
}
