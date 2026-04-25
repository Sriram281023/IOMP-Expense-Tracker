import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { vi } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme', 'light-theme');

    // Mock window.matchMedia (not available in jsdom)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    // Flush the initial effect that runs on construction
    TestBed.flushEffects();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme', 'light-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a default theme', () => {
    const theme = service.theme();
    expect(theme === 'light' || theme === 'dark').toBe(true);
  });

  it('should toggle from current theme', () => {
    const initial = service.theme();
    service.toggleTheme();
    const toggled = service.theme();

    expect(toggled).not.toBe(initial);
    expect(toggled === 'light' || toggled === 'dark').toBe(true);
  });

  it('should toggle back to original theme', () => {
    const initial = service.theme();
    service.toggleTheme();
    service.toggleTheme();
    expect(service.theme()).toBe(initial);
  });

  it('should persist theme to localStorage', () => {
    service.toggleTheme();
    const stored = localStorage.getItem('app-theme');
    expect(stored).toBe(service.theme());
  });

  it('should apply dark-theme class when dark', () => {
    // Ensure we're in dark mode
    if (service.theme() !== 'dark') {
      service.toggleTheme();
    }
    // Flush Angular effects so the DOM class gets applied
    TestBed.flushEffects();

    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  });

  it('should apply light-theme class when light', () => {
    // Ensure we're in light mode
    if (service.theme() !== 'light') {
      service.toggleTheme();
    }
    TestBed.flushEffects();

    expect(document.documentElement.classList.contains('light-theme')).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
  });
});
