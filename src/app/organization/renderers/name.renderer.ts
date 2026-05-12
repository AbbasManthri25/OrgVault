import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

const TYPE_COLORS: Record<string, string> = {
  IT: '#2563eb', Healthcare: '#16a34a', Finance: '#d97706',
  Education: '#7c3aed', Manufacturing: '#0d9488',
};

@Component({
  selector: 'app-name-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nr-cell">
      <div class="nr-avatar" [style.background]="bg" [style.color]="fg">{{ initial }}</div>
      <div class="nr-meta">
        <span class="nr-name">{{ name }}</span>
        <span class="nr-email" *ngIf="email">{{ email }}</span>
      </div>
    </div>
  `,
  styles: [`
    .nr-cell   { display:flex;align-items:center;gap:10px;height:100%; }
    .nr-avatar { width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0; }
    .nr-meta   { display:flex;flex-direction:column;gap:1px;min-width:0; }
    .nr-name   { font-size:13.5px;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .nr-email  { font-size:11.5px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  `]
})
export class NameRenderer implements ICellRendererAngularComp {
  name = ''; email = ''; initial = ''; bg = ''; fg = '';
  agInit(p: ICellRendererParams): void { this.set(p); }
  refresh(p: ICellRendererParams): boolean { this.set(p); return true; }
  private set(p: ICellRendererParams) {
    const d = p.data;
    this.name    = d?.name    ?? '';
    this.email   = d?.email   ?? '';
    this.initial = this.name.charAt(0).toUpperCase();
    const c  = TYPE_COLORS[d?.orgType] ?? '#6b7280';
    this.bg  = c + '18';
    this.fg  = c;
  }
}
