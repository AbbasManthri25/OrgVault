import {
  Component, OnInit, signal, computed,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from '../services/organization.service';
import { Organization, OrganizationStatus } from '../models/organization.model';
import { ThemeService } from '../services/theme.service';
import { ToastService } from '../services/toast.service';
import { I18nService } from '../services/i18n.service';

const ORG_TYPES = ['IT', 'Healthcare', 'Finance', 'Education', 'Manufacturing'];

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organization-detail.html',
  styleUrl: './organization-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetail implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  org      = signal<Organization | null>(null);
  loading  = signal(true);
  editMode = signal(false);
  showDeleteConfirm = signal(false);
  saveLoading = false;

  /* edit draft */
  draftName      = '';
  draftType      = '';
  draftContact   = '';
  draftEmail     = '';
  draftStatus: OrganizationStatus = 'Active';
  draftEmployees = '';
  draftWebsite   = '';
  draftAddress   = '';
  editError      = '';

  readonly orgTypes   = ORG_TYPES;
  readonly statuses: OrganizationStatus[] = ['Active', 'Inactive', 'Pending'];

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private service: OrganizationService,
    public  theme:   ThemeService,
    private toast:   ToastService,
    public  i18n:    I18nService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe(o => {
      this.org.set(o ?? null);
      this.loading.set(false);
      this.cdr.markForCheck();
    });
  }

  back() { this.router.navigate(['/organization']); }

  get initials(): string {
    return this.org()?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '';
  }

  typeColor(type?: string): string {
    const map: Record<string, string> = {
      IT: '#2563eb', Healthcare: '#16a34a', Finance: '#d97706',
      Education: '#7c3aed', Manufacturing: '#0d9488',
    };
    return map[type ?? ''] ?? '#6b7280';
  }

  statusColor(s?: string): string {
    return s === 'Active' ? '#16a34a' : s === 'Inactive' ? '#dc2626' : '#d97706';
  }

  /* ── Edit ── */
  openEdit() {
    const o = this.org();
    if (!o) return;
    this.draftName      = o.name;
    this.draftType      = o.orgType;
    this.draftContact   = o.contact;
    this.draftEmail     = o.email     ?? '';
    this.draftStatus    = o.status;
    this.draftEmployees = o.employees ? String(o.employees) : '';
    this.draftWebsite   = o.website   ?? '';
    this.draftAddress   = o.address   ?? '';
    this.editError      = '';
    this.editMode.set(true);
    this.cdr.markForCheck();
  }

  cancelEdit() {
    this.editMode.set(false);
    this.editError = '';
    this.cdr.markForCheck();
  }

  saveEdit() {
    if (!this.draftName.trim())    { this.editError = 'Name is required.';    return; }
    if (!this.draftContact.trim()) { this.editError = 'Contact is required.'; return; }
    const o = this.org();
    if (!o) return;

    this.saveLoading = true;
    this.editError   = '';
    this.cdr.markForCheck();

    setTimeout(() => {
      const patch: Partial<Organization> = {
        name:      this.draftName.trim(),
        orgType:   this.draftType,
        contact:   this.draftContact.trim(),
        email:     this.draftEmail.trim()   || undefined,
        status:    this.draftStatus,
        employees: this.draftEmployees ? +this.draftEmployees : undefined,
        website:   this.draftWebsite.trim() || undefined,
        address:   this.draftAddress.trim() || undefined,
      };
      this.service.update(o.id, patch);
      this.org.set({ ...o, ...patch });
      this.saveLoading = false;
      this.editMode.set(false);
      this.toast.show('Organization updated successfully', 'success');
      this.cdr.markForCheck();
    }, 350);
  }

  /* ── Delete ── */
  executeDelete() {
    const o = this.org();
    if (!o) return;
    this.service.delete(o.id);
    this.toast.show(`"${o.name}" deleted`, 'success');
    this.router.navigate(['/organization']);
  }

  /* ── Clipboard ── */
  copy(text: string) {
    navigator.clipboard.writeText(text).then(() => this.toast.show('Copied to clipboard', 'info'));
  }
}
