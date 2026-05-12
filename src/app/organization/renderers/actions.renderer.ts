import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-actions-renderer',
  standalone: true,
  template: `
    <div class="ar-wrap">
      <button class="ar-btn" (click)="preview($event)" title="Quick view">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button class="ar-btn" (click)="detail()" title="Open details">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </button>
      <button class="ar-btn ar-btn--del" (click)="del($event)" title="Delete">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button>
    </div>
  `,
  styles: [`
    .ar-wrap { display:flex;align-items:center;gap:4px;height:100%; }
    .ar-btn  { width:28px;height:28px;border:1.5px solid #e2e8f0;border-radius:7px;background:#f8fafc;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;padding:0; }
    .ar-btn:hover { background:#f1f5f9;color:#0f172a;border-color:#cbd5e1; }
    .ar-btn--del:hover { background:#fee2e2;color:#dc2626;border-color:#fecaca; }
  `]
})
export class ActionsRenderer implements ICellRendererAngularComp {
  private ctx: any; private row!: Organization;
  agInit(p: ICellRendererParams): void { this.ctx = p.context?.component; this.row = p.data; }
  refresh(p: ICellRendererParams): boolean { this.row = p.data; return true; }
  preview(e: Event) { e.stopPropagation(); this.ctx?.openPreview(this.row, e); }
  detail()          { this.ctx?.openDetail(this.row); }
  del(e: Event)     { e.stopPropagation(); this.ctx?.confirmDelete(this.row.id, e); }
}
