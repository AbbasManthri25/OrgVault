import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Organization, OrganizationStatus } from '../models/organization.model';

export interface OrgQuery {
  search: string;
  type: string;
  status: string;
}

const ORG_TYPES = ['IT', 'Healthcare', 'Finance', 'Education', 'Manufacturing'];
const STATUSES: OrganizationStatus[] = ['Active','Active','Active','Active','Inactive','Inactive','Pending'];
const BASE_DATE = new Date(2026, 4, 8);

function seedDate(i: number): string {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - ((i * 7) % 730));
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private store: Organization[] = [];
  private nextId = 50001;

  /* ── Reactive streams ── */
  private store$  = new BehaviorSubject<Organization[]>([]);
  private query$  = new BehaviorSubject<OrgQuery>({ search: '', type: '', status: '' });

  /** Combined reactive filtered stream */
  filtered$ = combineLatest([this.store$, this.query$]).pipe(
    map(([orgs, q]) => {
      let data = orgs;
      const s = q.search.toLowerCase().trim();
      if (s) data = data.filter(o =>
        o.name.toLowerCase().includes(s) ||
        (o.email ?? '').toLowerCase().includes(s) ||
        o.contact.includes(s)
      );
      if (q.type)   data = data.filter(o => o.orgType === q.type);
      if (q.status) data = data.filter(o => o.status  === q.status);
      return data;
    })
  );

  /** Stats stream derived from full store */
  stats$ = this.store$.pipe(
    map(orgs => ({
      total:      orgs.length,
      active:     orgs.filter(o => o.status === 'Active').length,
      inactive:   orgs.filter(o => o.status === 'Inactive').length,
      pending:    orgs.filter(o => o.status === 'Pending').length,
      it:         orgs.filter(o => o.orgType === 'IT').length,
      healthcare: orgs.filter(o => o.orgType === 'Healthcare').length,
    }))
  );

  constructor() {
    // Defer heavy seeding so the login page paints immediately
    setTimeout(() => {
      this.seed();
      this.store$.next([...this.store]);
    }, 0);
  }

  /** Update reactive query filters */
  updateQuery(partial: Partial<OrgQuery>): void {
    this.query$.next({ ...this.query$.value, ...partial });
  }

  /** Snapshot — returns Observable for compatibility */
  search(text: string): Observable<Organization[]> {
    const t = text.toLowerCase().trim();
    const result = t ? this.store.filter(o =>
      o.name.toLowerCase().includes(t) ||
      (o.email ?? '').toLowerCase().includes(t)
    ) : [...this.store];
    return of(result).pipe(delay(80));
  }

  getAll(): Observable<Organization[]> {
    return of([...this.store]).pipe(delay(60));
  }

  getById(id: number): Observable<Organization | undefined> {
    return of(this.store.find(o => o.id === id)).pipe(delay(50));
  }

  add(partial: Omit<Organization, 'id' | 'createdOn'>): Organization {
    const org: Organization = {
      ...partial,
      id: this.nextId++,
      createdOn: new Date().toLocaleDateString('en-US', { month:'2-digit', day:'2-digit', year:'numeric' }),
    };
    this.store.unshift(org);
    this.refresh();
    return org;
  }

  update(id: number, patch: Partial<Organization>): boolean {
    const idx = this.store.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.store[idx] = { ...this.store[idx], ...patch };
    this.refresh();
    return true;
  }

  delete(id: number): boolean {
    const idx = this.store.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.store.splice(idx, 1);
    this.refresh();
    return true;
  }

  deleteMany(ids: number[]): number {
    const set = new Set(ids);
    const before = this.store.length;
    this.store = this.store.filter(o => !set.has(o.id));
    this.refresh();
    return before - this.store.length;
  }

  private refresh(): void {
    this.store$.next([...this.store]);
  }

  private seed(): void {
    const NAMES = ['Acme Corp','Globex','Initech','Umbrella','Cyberdyne','Soylent','Rekall','Tyrell','Weyland','Aperture'];
    const CITIES = ['New York','London','Tokyo','Paris','Singapore','Dubai','Sydney','Toronto','Berlin','Mumbai'];
    for (let i = 1; i <= 50000; i++) {
      const nameBase = NAMES[i % NAMES.length];
      this.store.push({
        id: i,
        name: `${nameBase} ${i}`,
        orgType: ORG_TYPES[i % ORG_TYPES.length],
        contact: `+1-${800 + (i % 200)}-${String(1000000 + i).slice(1)}`,
        email: `contact@${nameBase.toLowerCase().replace(/\s/g,'')}-${i}.com`,
        website: `https://www.${nameBase.toLowerCase().replace(/\s/g,'')}-${i}.com`,
        employees: ((i * 37) % 4990) + 10,
        address: `${i * 3} Business Ave, ${CITIES[i % CITIES.length]}`,
        createdOn: seedDate(i),
        status: STATUSES[i % STATUSES.length],
      });
    }
  }
}
