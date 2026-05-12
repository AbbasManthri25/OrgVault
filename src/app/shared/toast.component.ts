import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-portal">
      <div
        *ngFor="let t of toast.toasts(); trackBy: trackById"
        class="toast-item"
        [class]="'toast-item--' + t.type"
        (click)="toast.dismiss(t.id)"
      >
        <span class="toast-icon">
          <svg *ngIf="t.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg *ngIf="t.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <svg *ngIf="t.type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg *ngIf="t.type === 'info'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        <span class="toast-msg">{{ t.message }}</span>
        <button class="toast-close" (click)="toast.dismiss(t.id); $event.stopPropagation()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-portal {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 380px;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 16px;
      border-radius: 12px;
      font-size: 13.5px;
      font-weight: 500;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.1);
      pointer-events: all;
      cursor: pointer;
      animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid transparent;
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(24px) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    .toast-item--success { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .toast-item--error   { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }
    .toast-item--warning { background: #fffbeb; border-color: #fde68a; color: #92400e; }
    .toast-item--info    { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
    .toast-icon { flex-shrink: 0; display: flex; align-items: center; }
    .toast-msg  { flex: 1; line-height: 1.4; }
    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      opacity: 0.5;
      color: inherit;
      padding: 2px;
      display: flex;
      align-items: center;
      transition: opacity 0.15s;
    }
    .toast-close:hover { opacity: 1; }
  `]
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
  trackById(_: number, t: { id: number }) { return t.id; }
}
