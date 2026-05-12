import { Injectable, signal, effect } from '@angular/core';

export type ThemeColor = 'default' | 'brand' | 'teal' | 'rose' | 'purple' | 'amber';
export type Scheme = 'light' | 'dark' | 'auto';

const THEME_KEY = 'org_theme';
const SCHEME_KEY = 'org_scheme';

const THEME_COLORS: Record<ThemeColor, string> = {
  default: '#6366f1',
  brand:   '#2563eb',
  teal:    '#0d9488',
  rose:    '#e11d48',
  purple:  '#7c3aed',
  amber:   '#f59e0b',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme  = signal<ThemeColor>((localStorage.getItem(THEME_KEY) as ThemeColor)  || 'default');
  scheme = signal<Scheme>   ((localStorage.getItem(SCHEME_KEY) as Scheme) || 'light');

  constructor() {
    effect(() => {
      const root = document.documentElement;
      const dark =
        this.scheme() === 'dark' ||
        (this.scheme() === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', dark);
      root.style.setProperty('--theme-color', THEME_COLORS[this.theme()]);
      localStorage.setItem(THEME_KEY,  this.theme());
      localStorage.setItem(SCHEME_KEY, this.scheme());
    });
  }

  setTheme(t: ThemeColor) { this.theme.set(t); }
  setScheme(s: Scheme)    { this.scheme.set(s); }

  isDark() { return document.documentElement.classList.contains('dark'); }

  getColor() { return THEME_COLORS[this.theme()]; }
}
