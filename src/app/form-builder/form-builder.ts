import {
  Component, OnInit, OnDestroy, signal, computed,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DragDropModule, CdkDragDrop, moveItemInArray
} from '@angular/cdk/drag-drop';

import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { I18nService } from '../services/i18n.service';
import {
  FormConfig, FormField, FormStep, FormTheme, FormIntegration, FieldType,
  FieldOption, ValidationRule, ConditionalRule, PaletteItem,
  FIELD_GROUPS, ALL_PALETTE_ITEMS, FORM_TEMPLATES, DEFAULT_THEME, AI_SUGGESTION_POOLS
} from './form-builder.models';

const DRAFT_KEY = 'fb_draft';
const HISTORY_MAX = 40;

let _uid = 0;
function uid(prefix = 'f'): string {
  return `${prefix}_${Date.now()}_${++_uid}`;
}

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './form-builder.html',
  styleUrl: './form-builder.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBuilder implements OnInit, OnDestroy {
  protected cdr  = inject(ChangeDetectorRef);
  public    i18n = inject(I18nService);

  /* ── state ── */
  config          = signal<FormConfig>(this.blankForm());
  selectedId      = signal<string | null>(null);
  stepIndex       = signal(0);
  leftTab         = signal<'fields' | 'templates' | 'ai'>('fields');
  rightTab        = signal<'props' | 'validate' | 'logic' | 'analytics' | 'integrations' | 'theme' | 'permissions'>('props');
  showPreview     = signal(false);
  previewDevice   = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  previewStep     = signal(0);
  showTheme       = signal(false);
  saveStatus      = signal<'saved' | 'saving' | 'unsaved'>('saved');
  isAiLoading     = signal(false);
  aiSuggestions   = signal<Partial<FormField>[]>([]);
  expandedGroups  = signal<Set<string>>(new Set(['Basic', 'Choice']));
  paletteSearch   = '';
  aiPrompt        = '';
  newStepTitle    = 'New Step';
  showNewStep     = signal(false);

  private history: FormConfig[] = [];
  private hIdx    = -1;
  private saveTimer?: ReturnType<typeof setTimeout>;

  /* ── refs ── */
  readonly FIELD_GROUPS   = FIELD_GROUPS;
  readonly ALL_ITEMS      = ALL_PALETTE_ITEMS;
  readonly TEMPLATES      = FORM_TEMPLATES;
  readonly OPERATORS      = [
    { v: 'equals',        l: 'equals' },
    { v: 'not_equals',    l: 'does not equal' },
    { v: 'contains',      l: 'contains' },
    { v: 'greater_than',  l: 'is greater than' },
    { v: 'less_than',     l: 'is less than' },
    { v: 'is_empty',      l: 'is empty' },
    { v: 'is_not_empty',  l: 'is not empty' },
  ];
  readonly ACTIONS = [
    { v: 'show', l: 'Show this field' }, { v: 'hide', l: 'Hide this field' },
    { v: 'require', l: 'Make required' }, { v: 'disable', l: 'Disable this field' },
  ];
  readonly INTEGRATIONS_CATALOG: FormIntegration[] = [
    { id: 'wh1', type: 'webhook', name: 'Webhook',       icon: '⛓',  enabled: false, config: { url: '', method: 'POST' } },
    { id: 'em1', type: 'email',   name: 'Email Notify',  icon: '✉',  enabled: false, config: { to: '', subject: 'New submission' } },
    { id: 'sl1', type: 'slack',   name: 'Slack',         icon: '💬', enabled: false, config: { webhookUrl: '' } },
    { id: 'zp1', type: 'zapier',  name: 'Zapier',        icon: '⚡', enabled: false, config: { webhookUrl: '' } },
    { id: 'gs1', type: 'sheets',  name: 'Google Sheets', icon: '📊', enabled: false, config: { sheetId: '' } },
  ];
  readonly FONT_OPTIONS = ['Inter, system-ui, sans-serif','Georgia, serif','Courier New, monospace','Verdana, sans-serif'];
  readonly RADIUS_OPTIONS = [{ l: 'None', v: '0px' },{ l: 'Small', v: '4px' },{ l: 'Medium', v: '8px' },{ l: 'Large', v: '12px' },{ l: 'Pill', v: '999px' }];
  readonly FONT_SIZE_OPTIONS = ['12px','13px','14px','15px','16px'];

  /* ── computed ── */
  currentStep = computed(() => {
    const c = this.config();
    return c.steps[this.stepIndex()] ?? c.steps[0];
  });
  currentFields = computed(() => this.currentStep()?.fields ?? []);
  selectedField = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    for (const step of this.config().steps) {
      const f = step.fields.find(f => f.id === id);
      if (f) return f;
    }
    return null;
  });
  allFields = computed(() => this.config().steps.flatMap(s => s.fields));
  canUndo   = computed(() => this.hIdx > 0);
  canRedo   = computed(() => this.hIdx < this.history.length - 1);
  formStats = computed(() => ({
    fields:   this.allFields().length,
    steps:    this.config().steps.length,
    required: this.allFields().filter(f => f.required).length,
  }));
  mockAnalytics = computed(() => ({
    views: 1284,
    starts: 948,
    completions: 612,
    convRate: '64.6%',
    avgTime: '2m 38s',
    dropOff: [
      { step: 'Step 1', pct: 92 },
      { step: 'Step 2', pct: 74 },
      { step: 'Step 3', pct: 64 },
    ],
    devices: [{ l: 'Desktop', pct: 54, c: '#6366f1' }, { l: 'Mobile', pct: 36, c: '#0d9488' }, { l: 'Tablet', pct: 10, c: '#d97706' }],
  }));
  filteredPalette = computed(() => {
    const q = this.paletteSearch.toLowerCase();
    if (!q) return FIELD_GROUPS;
    return FIELD_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    })).filter(g => g.items.length > 0);
  });

  constructor(
    private router:  Router,
    public  theme:   ThemeService,
    public  auth:    AuthService,
    private toast:   ToastService,
  ) {}

  ngOnInit() { this.loadDraft(); this.pushHistory(); }
  ngOnDestroy() { clearTimeout(this.saveTimer); }

  /* ── helpers ── */
  private blankForm(): FormConfig {
    return {
      id: uid('form'), title: 'Untitled Form', description: '', isMultiStep: false,
      submitLabel: 'Submit', successMessage: 'Thank you! Your response has been submitted.',
      steps: [{ id: uid('step'), title: 'Step 1', description: '', fields: [] }],
      theme: { ...DEFAULT_THEME },
      integrations: [],
      isDraft: true, lastSaved: null,
    };
  }

  private createField(type: FieldType): FormField {
    const label: Record<FieldType, string> = {
      text:'Short Text',email:'Email Address',number:'Number',tel:'Phone Number',
      url:'Website URL',password:'Password',textarea:'Long Text',select:'Dropdown',
      multiselect:'Multi-select',radio:'Multiple Choice',checkbox:'Checkboxes',
      toggle:'Toggle',date:'Date',time:'Time',datetime:'Date & Time',
      file:'File Upload',image:'Image Upload',rating:'Star Rating',slider:'Slider',
      color:'Color Picker',signature:'Signature',heading:'Section Heading',
      paragraph:'Paragraph Text',divider:'Divider',spacer:'Spacer',
    };
    const needsOpts = ['select','multiselect','radio','checkbox'].includes(type);
    return {
      id: uid('f'), type, label: label[type] ?? type, placeholder: '', helpText: '',
      defaultValue: '', options: needsOpts ? [
        { id: uid('o'), label: 'Option 1', value: 'option_1' },
        { id: uid('o'), label: 'Option 2', value: 'option_2' },
      ] : [],
      validation: [], conditions: [], width: 'full', required: false,
      accept: '', multiple: false, min: 0, max: type === 'rating' ? 5 : 100,
      step: 1, rows: 4, level: 2,
      content: type === 'heading' ? 'Section Heading' : type === 'paragraph' ? 'Add your text here...' : '',
      maxRating: 5, maxSize: 10,
    };
  }

  private fieldFromPartial(p: Partial<FormField>): FormField {
    return { ...this.createField(p.type ?? 'text'), ...p, id: uid('f') };
  }

  private setStepFields(idx: number, fields: FormField[]) {
    this.config.update(c => ({
      ...c, steps: c.steps.map((s, i) => i === idx ? { ...s, fields } : s)
    }));
    this.scheduleSave();
    this.cdr.markForCheck();
  }

  private pushHistory() {
    this.history = this.history.slice(0, this.hIdx + 1);
    this.history.push(JSON.parse(JSON.stringify(this.config())));
    if (this.history.length > HISTORY_MAX) this.history.shift();
    this.hIdx = this.history.length - 1;
  }

  /* ── drag & drop ── */
  onCanvasDrop(event: CdkDragDrop<any[]>) {
    const fields = [...this.currentFields()];
    if (event.previousContainer.id === 'fb-palette') {
      const item = event.item.data as PaletteItem;
      const f = this.createField(item.type);
      fields.splice(event.currentIndex, 0, f);
      this.selectedId.set(f.id);
      this.rightTab.set('props');
    } else {
      moveItemInArray(fields, event.previousIndex, event.currentIndex);
    }
    this.setStepFields(this.stepIndex(), fields);
    this.pushHistory();
  }

  /* ── field ops ── */
  addField(type: FieldType) {
    const f = this.createField(type);
    const fields = [...this.currentFields(), f];
    this.setStepFields(this.stepIndex(), fields);
    this.selectedId.set(f.id);
    this.rightTab.set('props');
    this.pushHistory();
  }

  selectField(id: string) {
    this.selectedId.set(id);
    if (this.rightTab() === 'analytics' || this.rightTab() === 'integrations' || this.rightTab() === 'theme' || this.rightTab() === 'permissions') return;
    this.rightTab.set('props');
    this.cdr.markForCheck();
  }

  deselect() { this.selectedId.set(null); this.cdr.markForCheck(); }

  deleteField(id: string, e: Event) {
    e.stopPropagation();
    const fields = this.currentFields().filter(f => f.id !== id);
    this.setStepFields(this.stepIndex(), fields);
    if (this.selectedId() === id) this.selectedId.set(null);
    this.pushHistory();
  }

  duplicateField(id: string, e: Event) {
    e.stopPropagation();
    const orig = this.currentFields().find(f => f.id === id);
    if (!orig) return;
    const copy = { ...JSON.parse(JSON.stringify(orig)), id: uid('f'), label: orig.label + ' (copy)' };
    const idx  = this.currentFields().findIndex(f => f.id === id);
    const fields = [...this.currentFields()];
    fields.splice(idx + 1, 0, copy);
    this.setStepFields(this.stepIndex(), fields);
    this.selectedId.set(copy.id);
    this.pushHistory();
  }

  patchField(patch: Partial<FormField>) {
    const id = this.selectedId();
    if (!id) return;
    this.config.update(c => ({
      ...c, steps: c.steps.map(s => ({
        ...s, fields: s.fields.map(f => f.id === id ? { ...f, ...patch } : f)
      }))
    }));
    this.scheduleSave();
    this.cdr.markForCheck();
  }

  /* ── options ── */
  addOption() {
    const f = this.selectedField();
    if (!f) return;
    const n = f.options.length + 1;
    this.patchField({ options: [...f.options, { id: uid('o'), label: `Option ${n}`, value: `option_${n}` }] });
  }

  updateOption(idx: number, key: 'label' | 'value', val: string) {
    const f = this.selectedField();
    if (!f) return;
    const opts = f.options.map((o, i) => i === idx ? { ...o, [key]: val } : o);
    this.patchField({ options: opts });
  }

  deleteOption(idx: number) {
    const f = this.selectedField();
    if (!f) return;
    this.patchField({ options: f.options.filter((_, i) => i !== idx) });
  }

  /* ── validation rules ── */
  addValidation() {
    const f = this.selectedField();
    if (!f) return;
    this.patchField({ validation: [...f.validation, { id: uid('v'), type: 'required', value: '', message: 'This field is required', enabled: true }] });
  }

  updateValidation(idx: number, patch: Partial<ValidationRule>) {
    const f = this.selectedField();
    if (!f) return;
    this.patchField({ validation: f.validation.map((r, i) => i === idx ? { ...r, ...patch } : r) });
  }

  deleteValidation(idx: number) {
    const f = this.selectedField();
    if (!f) return;
    this.patchField({ validation: f.validation.filter((_, i) => i !== idx) });
  }

  /* ── conditional logic ── */
  addCondition() {
    const f = this.selectedField();
    const others = this.allFields().filter(x => x.id !== f?.id);
    if (!f || !others.length) { this.toast.show('Add at least 2 fields to use conditions', 'warning'); return; }
    this.patchField({ conditions: [...f.conditions, {
      id: uid('c'), sourceFieldId: others[0].id, operator: 'equals', value: '', action: 'show'
    }] });
  }

  updateCondition(idx: number, patch: Partial<ConditionalRule>) {
    const f = this.selectedField();
    if (!f) return;
    this.patchField({ conditions: f.conditions.map((c, i) => i === idx ? { ...c, ...patch } : c) });
  }

  deleteCondition(idx: number) {
    const f = this.selectedField();
    if (!f) return;
    this.patchField({ conditions: f.conditions.filter((_, i) => i !== idx) });
  }

  /* ── steps ── */
  addStep() {
    if (!this.newStepTitle.trim()) return;
    this.config.update(c => ({
      ...c, isMultiStep: true,
      steps: [...c.steps, { id: uid('step'), title: this.newStepTitle.trim(), description: '', fields: [] }]
    }));
    this.stepIndex.set(this.config().steps.length - 1);
    this.showNewStep.set(false);
    this.newStepTitle = 'New Step';
    this.pushHistory();
    this.cdr.markForCheck();
  }

  deleteStep(idx: number, e: Event) {
    e.stopPropagation();
    if (this.config().steps.length <= 1) { this.toast.show('Cannot remove the last step', 'warning'); return; }
    this.config.update(c => ({ ...c, steps: c.steps.filter((_, i) => i !== idx) }));
    if (this.stepIndex() >= this.config().steps.length) {
      this.stepIndex.set(this.config().steps.length - 1);
    }
    this.pushHistory();
    this.cdr.markForCheck();
  }

  renameStep(idx: number, title: string) {
    this.config.update(c => ({
      ...c, steps: c.steps.map((s, i) => i === idx ? { ...s, title } : s)
    }));
    this.scheduleSave();
  }

  updateStepDesc(desc: string) {
    const idx = this.stepIndex();
    this.config.update(c => ({
      ...c, steps: c.steps.map((s, i) => i === idx ? { ...s, description: desc } : s)
    }));
    this.scheduleSave();
  }

  setHeadingLevel(val: string) {
    this.patchField({ level: +val as 1 | 2 | 3 });
  }

  /* ── templates ── */
  loadTemplate(tplId: string) {
    const tpl = FORM_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    const steps = tpl.steps.map(s => ({
      id: uid('step'), title: s.title, description: s.description,
      fields: s.fields.map(p => this.fieldFromPartial(p as Partial<FormField>))
    }));
    this.config.update(c => ({
      ...c, title: tpl.name, isMultiStep: tpl.steps.length > 1,
      steps, description: tpl.description,
    }));
    this.stepIndex.set(0);
    this.selectedId.set(null);
    this.pushHistory();
    this.scheduleSave();
    this.toast.show(`Template "${tpl.name}" loaded`, 'success');
    this.leftTab.set('fields');
    this.cdr.markForCheck();
  }

  /* ── AI suggestions ── */
  runAi() {
    if (!this.aiPrompt.trim()) { this.toast.show('Describe your form to get suggestions', 'warning'); return; }
    this.isAiLoading.set(true);
    this.aiSuggestions.set([]);
    this.cdr.markForCheck();
    setTimeout(() => {
      const pool = AI_SUGGESTION_POOLS[Math.floor(Math.random() * AI_SUGGESTION_POOLS.length)];
      this.aiSuggestions.set(pool.map(p => this.fieldFromPartial(p)));
      this.isAiLoading.set(false);
      this.toast.show(`${pool.length} fields suggested`, 'info');
      this.cdr.markForCheck();
    }, 1600);
  }

  acceptSuggestion(field: Partial<FormField>) {
    const f = this.fieldFromPartial(field);
    const fields = [...this.currentFields(), f];
    this.setStepFields(this.stepIndex(), fields);
    this.selectedId.set(f.id);
    this.aiSuggestions.update(s => s.filter(x => x.id !== (field as FormField).id));
    this.pushHistory();
    this.toast.show('Field added from suggestion', 'success');
  }

  /* ── undo/redo ── */
  undo() {
    if (!this.canUndo()) return;
    this.hIdx--;
    this.config.set(JSON.parse(JSON.stringify(this.history[this.hIdx])));
    this.selectedId.set(null);
    this.cdr.markForCheck();
  }

  redo() {
    if (!this.canRedo()) return;
    this.hIdx++;
    this.config.set(JSON.parse(JSON.stringify(this.history[this.hIdx])));
    this.cdr.markForCheck();
  }

  /* ── save/load ── */
  private scheduleSave() {
    this.saveStatus.set('unsaved');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveDraft(), 1500);
  }

  saveDraft() {
    this.saveStatus.set('saving');
    this.cdr.markForCheck();
    const updated = { ...this.config(), lastSaved: new Date().toLocaleString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
    this.config.set(updated);
    setTimeout(() => { this.saveStatus.set('saved'); this.cdr.markForCheck(); }, 400);
  }

  loadDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as FormConfig;
      if (saved?.id) { this.config.set(saved); this.toast.show('Draft recovered', 'info'); }
    } catch {}
  }

  clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    this.config.set(this.blankForm());
    this.selectedId.set(null);
    this.stepIndex.set(0);
    this.pushHistory();
    this.saveStatus.set('saved');
    this.toast.show('Form cleared', 'info');
    this.cdr.markForCheck();
  }

  publish() {
    this.saveDraft();
    this.config.update(c => ({ ...c, isDraft: false }));
    this.toast.show('Form published successfully!', 'success');
  }

  exportJson() {
    const json = JSON.stringify(this.config(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `${this.config().title.replace(/\s+/g,'_')}.json` });
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show('Form exported as JSON', 'info');
  }

  /* ── theme ── */
  patchTheme(patch: Partial<FormTheme>) {
    this.config.update(c => ({ ...c, theme: { ...c.theme, ...patch } }));
    this.scheduleSave();
    this.cdr.markForCheck();
  }

  /* ── integrations ── */
  toggleIntegration(type: string) {
    const existing = this.config().integrations.find(i => i.type === type);
    if (existing) {
      this.config.update(c => ({ ...c, integrations: c.integrations.map(i => i.type === type ? { ...i, enabled: !i.enabled } : i) }));
    } else {
      const catalog = this.INTEGRATIONS_CATALOG.find(i => i.type === type);
      if (catalog) this.config.update(c => ({ ...c, integrations: [...c.integrations, { ...catalog, enabled: true }] }));
    }
    this.scheduleSave();
    this.cdr.markForCheck();
  }

  isIntegrationEnabled(type: string): boolean {
    return this.config().integrations.some(i => i.type === type && i.enabled);
  }

  /* ── preview ── */
  openPreview() { this.previewStep.set(0); this.showPreview.set(true); this.cdr.markForCheck(); }
  closePreview() { this.showPreview.set(false); this.cdr.markForCheck(); }
  previewNext() { if (this.previewStep() < this.config().steps.length - 1) this.previewStep.update(p => p + 1); }
  previewPrev() { if (this.previewStep() > 0) this.previewStep.update(p => p - 1); }

  get previewCurrentStep() { return this.config().steps[this.previewStep()] ?? this.config().steps[0]; }

  /* ── helpers for template ── */
  toggleGroup(name: string) {
    this.expandedGroups.update(s => {
      const n = new Set(s);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
    this.cdr.markForCheck();
  }

  isLayout(type: FieldType) { return ['heading','paragraph','divider','spacer'].includes(type); }
  needsOptions(type: FieldType) { return ['select','multiselect','radio','checkbox'].includes(type); }
  isNumericRange(type: FieldType) { return ['number','slider','rating'].includes(type); }
  isFileBased(type: FieldType) { return ['file','image'].includes(type); }

  fieldGroupColor(type: FieldType): string {
    const g = FIELD_GROUPS.find(gr => gr.items.some(i => i.type === type));
    return g?.color ?? '#6b7280';
  }

  fieldIcon(type: FieldType): string {
    const item = ALL_PALETTE_ITEMS.find(i => i.type === type);
    return item?.icon ?? '?';
  }

  stars(n: number): number[] { return Array.from({ length: n }, (_, i) => i); }

  patchConfig(patch: Partial<FormConfig>) {
    this.config.update(c => ({ ...c, ...patch }));
    this.scheduleSave();
    this.cdr.markForCheck();
  }

  back() { this.router.navigate(['/organization']); }
  get currentUser() { return this.auth.getCurrentUser(); }
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
  trackByField(_: number, f: FormField) { return f.id; }
  trackByStep(_: number, s: FormStep) { return s.id; }
}
