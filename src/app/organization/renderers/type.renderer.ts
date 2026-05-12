import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

const TYPE_COLORS: Record<string, string> = {
  IT: '#2563eb', Healthcare: '#16a34a', Finance: '#d97706',
  Education: '#7c3aed', Manufacturing: '#0d9488',
};

@Component({
  selector: 'app-type-renderer',
  standalone: true,
  template: `
    <span class="tr-badge"
      [style.background]="color + '15'"
      [style.color]="color"
      [style.border]="'1px solid ' + color + '40'">
      {{ value }}
    </span>
  `,
  styles: [`
    .tr-badge { display:inline-flex;align-items:center;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;white-space:nowrap; }
  `]
})
export class TypeRenderer implements ICellRendererAngularComp {
  value = ''; color = '#6b7280';
  agInit(p: ICellRendererParams): void { this.set(p); }
  refresh(p: ICellRendererParams): boolean { this.set(p); return true; }
  private set(p: ICellRendererParams) {
    this.value = p.value ?? '';
    this.color = TYPE_COLORS[this.value] ?? '#6b7280';
  }
}
