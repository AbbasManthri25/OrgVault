import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-status-renderer',
  standalone: true,
  template: `
    <span class="sr-pill" [class]="'sr-pill--' + css">
      <span class="sr-dot"></span>{{ value }}
    </span>
  `,
  styles: [`
    .sr-pill { display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:.01em;white-space:nowrap; }
    .sr-dot  { width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0; }
    .sr-pill--active   { background:#dcfce7;color:#16a34a; }
    .sr-pill--inactive { background:#fee2e2;color:#dc2626; }
    .sr-pill--pending  { background:#fef3c7;color:#d97706; }
  `]
})
export class StatusRenderer implements ICellRendererAngularComp {
  value = ''; css = '';
  agInit(p: ICellRendererParams): void { this.set(p); }
  refresh(p: ICellRendererParams): boolean { this.set(p); return true; }
  private set(p: ICellRendererParams) {
    this.value = p.value ?? '';
    this.css   = this.value.toLowerCase();
  }
}
