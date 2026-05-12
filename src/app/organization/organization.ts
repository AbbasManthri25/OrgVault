import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
  signal, computed, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  AllCommunityModule, ModuleRegistry, ColDef, GridApi,
  GridReadyEvent, RowClickedEvent, GetRowIdParams,
  RowSelectionOptions
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

import { OrganizationService } from '../services/organization.service';
import { Organization as OrgModel, OrganizationStatus } from '../models/organization.model';
import { I18nService } from '../services/i18n.service';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Todo, TodoStatus } from './todo.model';
import { TodoFilterPipe } from './todo-filter.pipe';
import { StatusRenderer } from './renderers/status.renderer';
import { TypeRenderer } from './renderers/type.renderer';
import { NameRenderer } from './renderers/name.renderer';
import { ActionsRenderer } from './renderers/actions.renderer';

ModuleRegistry.registerModules([AllCommunityModule]);

const ORG_TYPES = ['IT', 'Healthcare', 'Finance', 'Education', 'Manufacturing'];

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TodoFilterPipe, RouterLink, AgGridAngular],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Organization implements OnInit, OnDestroy {
  private cdr      = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  /* ── search & data ── */
  searchCtrl = new FormControl('');
  loading    = signal(false);
  private all = signal<OrgModel[]>([]);

  /* ── filter ── */
  typeFilter   = signal('');
  statusFilter = signal('');

  sortedFiltered = computed(() => {
    let data = this.all();
    const t = (this.searchCtrl.value || '').toLowerCase();
    if (t) data = data.filter(o =>
      o.name.toLowerCase().includes(t) ||
      (o.email ?? '').toLowerCase().includes(t) ||
      o.contact.includes(t)
    );
    const tf = this.typeFilter();
    if (tf) data = data.filter(o => o.orgType === tf);
    const sf = this.statusFilter();
    if (sf) data = data.filter(o => o.status === sf);
    return data;
  });

  /* ── stats ── */
  orgStats = computed(() => {
    const a = this.all();
    return {
      total:      a.length,
      active:     a.filter(o => o.status === 'Active').length,
      inactive:   a.filter(o => o.status === 'Inactive').length,
      pending:    a.filter(o => o.status === 'Pending').length,
      it:         a.filter(o => o.orgType === 'IT').length,
      healthcare: a.filter(o => o.orgType === 'Healthcare').length,
    };
  });

  /* ── view ── */
  viewMode = signal<'table' | 'card'>('table');

  /* ── AG Grid ── */
  private gridApi?: GridApi<OrgModel>;
  gridContext = { component: this };

  defaultColDef: ColDef<OrgModel> = {
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  columnDefs: ColDef<OrgModel>[] = [
    {
      headerName: '#',
      valueGetter: (p) => (p.node?.rowIndex ?? 0) + 1,
      width: 65, minWidth: 65, maxWidth: 70,
      sortable: false, resizable: false,
      cellStyle: { color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center' },
    },
    {
      headerName: 'Organization',
      field: 'name', flex: 2, minWidth: 220,
      cellRenderer: NameRenderer,
    },
    {
      headerName: 'Type', field: 'orgType',
      width: 150, minWidth: 120,
      cellRenderer: TypeRenderer,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
    {
      headerName: 'Status', field: 'status',
      width: 130, minWidth: 110,
      cellRenderer: StatusRenderer,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
    {
      headerName: 'Contact', field: 'contact',
      width: 160, minWidth: 130,
      cellStyle: { fontFamily: 'monospace', fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center' },
    },
    {
      headerName: 'Employees', field: 'employees',
      width: 120, minWidth: 100,
      type: 'numericColumn',
      valueFormatter: (p) => p.value ? Number(p.value).toLocaleString() : '—',
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
    {
      headerName: 'Created', field: 'createdOn',
      width: 130, minWidth: 110,
      cellStyle: { color: '#94a3b8', fontSize: '12.5px', display: 'flex', alignItems: 'center' },
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionsRenderer,
      width: 120, minWidth: 110,
      pinned: 'right', resizable: false, sortable: false,
      suppressMovable: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
  ];

  rowSelection: RowSelectionOptions = {
    mode: 'multiRow',
    headerCheckbox: true,
    checkboxes: true,
  };

  /* ── Pagination ── */
  pageSize   = signal(10);
  currPage   = signal(0);   // 0-indexed (AG Grid)
  totalPages = signal(1);
  totalRows  = signal(0);
  pageSizes  = [10, 25, 50, 100, 250];

  cardPage       = signal(1);
  cardRows       = computed(() => {
    const ps = this.pageSize(), pg = this.cardPage();
    return this.sortedFiltered().slice((pg - 1) * ps, pg * ps);
  });
  cardTotalPages = computed(() => Math.max(1, Math.ceil(this.sortedFiltered().length / this.pageSize())));

  visiblePages = computed<(number | null)[]>(() => {
    const total = this.totalPages(), cur = this.currPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const r: (number | null)[] = [0];
    const left = Math.max(1, cur - 2), right = Math.min(total - 2, cur + 2);
    if (left > 1) r.push(null);
    for (let i = left; i <= right; i++) r.push(i);
    if (right < total - 2) r.push(null);
    r.push(total - 1);
    return r;
  });

  cardVisiblePages = computed<(number | null)[]>(() => {
    const total = this.cardTotalPages(), cur = this.cardPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const r: (number | null)[] = [1];
    const left = Math.max(2, cur - 2), right = Math.min(total - 1, cur + 2);
    if (left > 2) r.push(null);
    for (let i = left; i <= right; i++) r.push(i);
    if (right < total - 1) r.push(null);
    r.push(total);
    return r;
  });

  get startRow(): number { return this.currPage() * this.pageSize() + 1; }
  get endRow():   number { return Math.min((this.currPage() + 1) * this.pageSize(), this.totalRows()); }

  onGridReady(event: GridReadyEvent<OrgModel>): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
    this.currPage.set(this.gridApi.paginationGetCurrentPage());
    this.totalPages.set(this.gridApi.paginationGetTotalPages());
    this.totalRows.set(this.gridApi.paginationGetRowCount());
    this.cdr.markForCheck();
  }

  onPaginationChanged(): void {
    if (!this.gridApi) return;
    this.currPage.set(this.gridApi.paginationGetCurrentPage());
    this.totalPages.set(this.gridApi.paginationGetTotalPages());
    this.totalRows.set(this.gridApi.paginationGetRowCount());
    this.cdr.markForCheck();
  }

  goToPage(page: number): void {
    if (!this.gridApi || page < 0 || page >= this.totalPages()) return;
    this.gridApi.paginationGoToPage(page);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.cardPage.set(1);
    if (this.gridApi) this.gridApi.setGridOption('paginationPageSize', size);
  }

  jumpGridPage(val: string): void {
    const p = parseInt(val, 10);
    if (!isNaN(p) && p >= 1 && p <= this.totalPages()) this.goToPage(p - 1);
  }

  jumpCardPage(val: string): void {
    const p = parseInt(val, 10);
    if (!isNaN(p) && p >= 1 && p <= this.cardTotalPages()) { this.cardPage.set(p); this.cdr.markForCheck(); }
  }

  onSelectionChanged(): void {
    if (!this.gridApi) return;
    const selected = this.gridApi.getSelectedRows();
    this.selectedIds.set(new Set(selected.map(r => r.id)));
    this.cdr.markForCheck();
  }

  onRowClicked(event: RowClickedEvent<OrgModel>): void {
    if (event.data) this.openDetail(event.data);
  }

  getRowId(params: GetRowIdParams<OrgModel>): string {
    return String(params.data.id);
  }

  refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.sortedFiltered());
    }
    this.cdr.markForCheck();
  }

  /* ── selection ── */
  selectedIds = signal<Set<number>>(new Set());

  get allPageSelected(): boolean {
    return this.sortedFiltered().length > 0 && this.sortedFiltered().every(r => this.selectedIds().has(r.id));
  }

  clearSelection(): void {
    this.gridApi?.deselectAll();
    this.selectedIds.set(new Set());
    this.cdr.markForCheck();
  }

  /* ── view toggle ── */
  toggleViewMode(m: 'table' | 'card'): void { this.viewMode.set(m); }

  /* ── ui state ── */
  showSettings    = false;
  showAddModal    = false;
  showBulkConfirm = false;
  showDropdown    = false;
  addError        = '';
  addLoading      = false;

  newOrgName      = '';
  newOrgType      = ORG_TYPES[0];
  newOrgStatus: OrganizationStatus = 'Active';
  newOrgContact   = '';
  newOrgEmail     = '';
  newOrgEmployees = '';

  deleteConfirmId = signal<number | null>(null);
  previewOrg      = signal<OrgModel | null>(null);

  /* ── todos ── */
  todos          = signal<Todo[]>([]);
  newTodo        = '';
  todoSearchCtrl = new FormControl('');
  statusFilter2  = '';

  get todoSearch(): string { return this.todoSearchCtrl.value ?? ''; }

  /* ── search suggestions ── */
  suggestions: OrgModel[] = [];

  readonly orgTypes = ORG_TYPES;

  constructor(
    private service: OrganizationService,
    private router: Router,
    public  theme:  ThemeService,
    public  i18n:   I18nService,
    private auth:   AuthService,
    private toast:  ToastService,
  ) {}

  ngOnInit(): void {
    // Load initial data
    this.loading.set(true);
    this.service.getAll().subscribe(data => {
      this.all.set(data);
      this.loading.set(false);
      this.cdr.markForCheck();
    });

    // Reactive search with debounce
    this.searchCtrl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cardPage.set(1);
      this.refreshGrid();
      this.suggestions = this.sortedFiltered().slice(0, 6);
    });

    this.todos.set(this.loadTodos());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ── search ── */
  search(): void {
    this.loading.set(true);
    this.service.search(this.searchCtrl.value ?? '').subscribe(data => {
      this.all.set(data);
      this.loading.set(false);
      this.refreshGrid();
    });
    this.showDropdown = false;
  }

  reset(): void {
    this.searchCtrl.setValue('');
    this.typeFilter.set('');
    this.statusFilter.set('');
    this.cardPage.set(1);
    this.loading.set(true);
    this.service.getAll().subscribe(data => {
      this.all.set(data);
      this.loading.set(false);
      this.refreshGrid();
    });
  }

  selectSuggestion(name: string): void {
    this.searchCtrl.setValue(name);
    this.showDropdown = false;
    this.search();
  }

  /* ── filters ── */
  toggleTypeFilter(t: string): void {
    this.typeFilter.set(this.typeFilter() === t ? '' : t);
    this.cardPage.set(1);
    this.refreshGrid();
  }

  toggleStatusFilter(s: string): void {
    this.statusFilter.set(this.statusFilter() === s ? '' : s);
    this.cardPage.set(1);
    this.refreshGrid();
  }

  /* ── add modal ── */
  openAddModal(): void {
    this.newOrgName = ''; this.newOrgType = ORG_TYPES[0];
    this.newOrgStatus = 'Active'; this.newOrgContact = '';
    this.newOrgEmail = ''; this.newOrgEmployees = '';
    this.addError = '';
    this.showAddModal = true;
    this.cdr.markForCheck();
  }

  submitAddOrg(): void {
    if (!this.newOrgName.trim())    { this.addError = 'Name is required.';    return; }
    if (!this.newOrgContact.trim()) { this.addError = 'Contact is required.'; return; }
    this.addLoading = true; this.addError = '';
    this.cdr.markForCheck();
    setTimeout(() => {
      const org = this.service.add({
        name: this.newOrgName.trim(), orgType: this.newOrgType,
        contact: this.newOrgContact.trim(), status: this.newOrgStatus,
        email: this.newOrgEmail.trim() || undefined,
        employees: this.newOrgEmployees ? +this.newOrgEmployees : undefined,
      });
      this.all.set([org, ...this.all()]);
      this.addLoading = false; this.showAddModal = false;
      this.toast.show(`"${org.name}" added`, 'success');
      this.refreshGrid();
    }, 350);
  }

  /* ── delete ── */
  confirmDelete(id: number, event?: Event): void {
    event?.stopPropagation();
    this.deleteConfirmId.set(id);
    this.cdr.markForCheck();
  }

  executeDelete(): void {
    const id = this.deleteConfirmId();
    if (!id) return;
    const org = this.all().find(r => r.id === id);
    this.service.delete(id);
    this.all.set(this.all().filter(r => r.id !== id));
    this.selectedIds.update(s => { const n = new Set(s); n.delete(id); return n; });
    this.deleteConfirmId.set(null);
    this.toast.show(`"${org?.name ?? 'Organization'}" deleted`, 'success');
    this.refreshGrid();
  }

  executeBulkDelete(): void {
    const ids = [...this.selectedIds()];
    const count = this.service.deleteMany(ids);
    const set = new Set(ids);
    this.all.set(this.all().filter(o => !set.has(o.id)));
    this.selectedIds.set(new Set());
    this.showBulkConfirm = false;
    this.gridApi?.deselectAll();
    this.toast.show(`${count} organization${count !== 1 ? 's' : ''} deleted`, 'success');
    this.refreshGrid();
  }

  /* ── export ── */
  exportCsv(): void {
    const headers = ['ID','Name','Type','Contact','Email','Status','Employees','Created On'];
    const rows = this.sortedFiltered().map(o =>
      [o.id, `"${o.name}"`, o.orgType, o.contact, o.email ?? '', o.status, o.employees ?? '', o.createdOn].join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'orgvault-export.csv' });
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show(`${rows.length.toLocaleString()} records exported`, 'info');
  }

  /* ── navigation ── */
  openPreview(org: OrgModel, event?: Event): void {
    event?.stopPropagation();
    this.previewOrg.set(org);
    this.cdr.markForCheck();
  }

  openDetail(org: OrgModel): void {
    this.router.navigate(['/organization', org.id]);
  }

  /* ── helpers ── */
  trackById(_: number, item: OrgModel): number { return item.id; }

  copy(text: string): void {
    navigator.clipboard.writeText(text).then(() => this.toast.show('Copied to clipboard', 'info'));
  }

  logout(): void { this.auth.logout(); this.router.navigate(['/login']); }

  typeColor(type: string): string {
    const m: Record<string, string> = { IT:'#2563eb', Healthcare:'#16a34a', Finance:'#d97706', Education:'#7c3aed', Manufacturing:'#0d9488' };
    return m[type] ?? '#6b7280';
  }

  statusColor(s: string): string {
    return s === 'Active' ? '#16a34a' : s === 'Inactive' ? '#dc2626' : '#d97706';
  }

  /* ── todos ── */
  addTodo(): void {
    if (!this.newTodo.trim()) return;
    this.todos.update(t => [...t, { id: Date.now(), title: this.newTodo.trim(), status: 'Pending' }]);
    this.newTodo = ''; this.saveTodos();
  }
  updateTodo(id: number, v: string):       void { this.todos.update(t => t.map(x => x.id === id ? {...x, title: v} : x)); this.saveTodos(); }
  updateStatus(id: number, s: TodoStatus): void { this.todos.update(t => t.map(x => x.id === id ? {...x, status: s} : x)); this.saveTodos(); }
  removeTodo(id: number):                  void { this.todos.update(t => t.filter(x => x.id !== id)); this.saveTodos(); }
  saveTodos():  void { localStorage.setItem('todos', JSON.stringify(this.todos())); }
  loadTodos():  Todo[] { try { return JSON.parse(localStorage.getItem('todos') ?? '[]'); } catch { return []; } }
}
