import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  theme = signal<'light' | 'dark'>(this.getInitialTheme());

  constructor() {
    // Re-apply theme whenever it changes
    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  private getInitialTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggleTheme() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
    localStorage.setItem(this.THEME_KEY, this.theme());
  }

  private applyTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }
}
