import { computed, DOCUMENT, Injectable, inject, signal } from '@angular/core';

const STORAGE_KEY = 'docs-theme';

function readStored(): 'light' | 'dark' | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemPrefersDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Explicit choice wins; otherwise follows the OS preference (and updates live if it changes). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly stored = signal(readStored());
  private readonly systemDark = signal(systemPrefersDark());

  readonly isDark = computed(() => this.stored() ? this.stored() === 'dark' : this.systemDark());

  constructor() {
    if (typeof matchMedia !== 'undefined') {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => this.systemDark.set(e.matches));
    }
  }

  toggle(): void {
    const next = this.isDark() ? 'light' : 'dark';
    this.stored.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private browsing / storage disabled: theme still applies for this load */
    }
    this.doc.documentElement.setAttribute('data-theme', next);
  }
}
