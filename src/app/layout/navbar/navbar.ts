import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar" *ngIf="showNavbar()">
      <div class="nav-brand" routerLink="/dashboard">
        <div class="logo-icon">💸</div>
        <span>Expense Tracker</span>
      </div>

      <div class="nav-links">
        <button class="nav-link" routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</button>
        <button class="nav-link" routerLink="/expenses" routerLinkActive="active">📋 Expenses</button>
        <button class="nav-link" routerLink="/analytics" routerLinkActive="active">📈 Analytics</button>
        <button class="nav-link" routerLink="/settings" routerLinkActive="active">⚙️ Settings</button>
      </div>

      <div class="nav-right">
        <button class="theme-toggle" (click)="themeService.toggleTheme()" title="Toggle Theme">
          <span>{{ themeService.theme() === 'dark' ? '🌙' : '☀️' }}</span>
        </button>

        <div class="nav-user" routerLink="/settings">
          <div class="nav-avatar">{{ authService.user()?.avatar }}</div>
          <span>{{ authService.user()?.name }}</span>
        </div>

        <button class="nav-logout" (click)="logout()">
          🚪 Logout
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      padding: 0 32px;
      display: flex; align-items: center;
      height: 64px; gap: 20px;
    }

    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer;
    }

    .nav-brand .logo-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, var(--accent), #00A87A);
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      box-shadow: var(--shadow-accent);
    }

    .nav-brand span {
      font-family: var(--font-display);
      font-size: 1.1rem; font-weight: 600;
      color: var(--text-100);
      white-space: nowrap;
    }

    .nav-links {
      display: flex; align-items: center; gap: 4px;
      flex: 1;
    }

    .nav-link {
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      color: var(--text-300);
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
      display: flex; align-items: center; gap: 6px;
      border: none; background: none;
      font-family: var(--font-body);
    }

    .nav-link:hover { color: var(--text-100); background: rgba(255, 255, 255, 0.06); }
    .nav-link.active { color: var(--accent); background: var(--accent-dim); }

    .nav-right {
      display: flex; align-items: center; gap: 12px; margin-left: auto;
    }

    .theme-toggle {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
        border-radius: 50%;
        width: 36px; height: 36px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        font-size: 16px;
        transition: all var(--transition);
    }

    .theme-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.05);
    }

    .nav-user {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      border-radius: 100px;
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--text-200);
      transition: all var(--transition);
    }

    .nav-user:hover { background: rgba(255, 255, 255, 0.08); }

    .nav-avatar {
      width: 24px; height: 24px;
      background: linear-gradient(135deg, var(--accent), #00A87A);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: #000;
    }

    .nav-logout {
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      background: var(--danger-dim);
      border: 1px solid rgba(255, 94, 120, 0.25);
      color: var(--danger);
      cursor: pointer; font-size: 0.82rem; font-weight: 500;
      font-family: var(--font-body);
      transition: all var(--transition);
      display: flex; align-items: center; gap: 6px;
    }

    .nav-logout:hover { background: rgba(255, 94, 120, 0.25); }
  `]
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showNavbar() {
    return this.router.url !== '/login';
  }
}
