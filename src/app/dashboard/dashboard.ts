import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrganizationService } from '../services/organization.service';
import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  private auth   = inject(AuthService);
  private router = inject(Router);
  public  i18n   = inject(I18nService);
  public  theme  = inject(ThemeService);
  private orgSvc = inject(OrganizationService);

  currentUser = signal<string>('');

  stats = signal({ total: 0, active: 0, inactive: 0, pending: 0, it: 0, healthcare: 0 });

  readonly workflowStages = [
    { label: 'Draft',    color: '#6366f1', count: 12 },
    { label: 'Review',   color: '#f59e0b', count: 8  },
    { label: 'Approved', color: '#10b981', count: 5  },
    { label: 'Published',color: '#a855f7', count: 3  },
  ];

  readonly gridFeatures = [
    'Virtual scroll — 50,000 records',
    'Multi-row checkbox selection',
    'Custom cell renderers',
    'Live search & filter chips',
    'Bulk delete & CSV export',
    'Advanced pagination engine',
  ];

  readonly formComponents = [
    { label: 'Text Field',  color: '#7c3aed' },
    { label: 'Select',      color: '#ec4899' },
    { label: 'File Upload', color: '#0891b2' },
    { label: 'Date Time',   color: '#f59e0b' },
    { label: 'Data Grid',   color: '#10b981' },
    { label: 'Signature',   color: '#6366f1' },
  ];

  ngOnInit(): void {
    this.currentUser.set(this.auth.getCurrentUser() ?? 'User');

    this.orgSvc.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => this.stats.set(s));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activePercent(): number {
    const t = this.stats().total;
    return t ? Math.round((this.stats().active / t) * 100) : 0;
  }

  get inactivePercent(): number {
    const t = this.stats().total;
    return t ? Math.round((this.stats().inactive / t) * 100) : 0;
  }

  get pendingPercent(): number {
    const t = this.stats().total;
    return t ? Math.round((this.stats().pending / t) * 100) : 0;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
