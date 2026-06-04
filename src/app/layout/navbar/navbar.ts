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
      <!-- Brand -->
      <a class="nav-brand" routerLink="/dashboard">
        <div class="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <span class="brand-name">Fintrek</span>
      </a>

      <!-- Nav Links -->
      <div class="nav-links">
        <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a class="nav-link" routerLink="/expenses" routerLinkActive="active">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Expenses
        </a>
        <a class="nav-link" routerLink="/analytics" routerLinkActive="active">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-3-3-4 4"/></svg>
          Analytics
        </a>
        <a class="nav-link" routerLink="/settings" routerLinkActive="active">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          Settings
        </a>
      </div>

      <!-- Right Side -->
      <div class="nav-right">
        <!-- Theme Toggle -->
        <button class="icon-btn" (click)="themeService.toggleTheme()" title="Toggle theme">
          <svg *ngIf="themeService.theme() === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg *ngIf="themeService.theme() !== 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>

        <!-- User chip -->
        <div class="user-chip" routerLink="/settings">
          <div class="user-avatar">{{ (authService.user()?.name || 'U').charAt(0).toUpperCase() }}</div>
          <span class="user-name">{{ authService.user()?.name?.split(' ')[0] || 'Account' }}</span>
        </div>

        <!-- Logout -->
        <button class="logout-btn" (click)="logout()" title="Log out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 200;
      height: 60px;
      display: flex; align-items: center;
      padding: 0 24px;
      gap: 8px;
      background: rgba(8, 12, 18, 0.85);
      backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 1px 0 rgba(255,255,255,0.03);
    }

    /* ── Brand ── */
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; flex-shrink: 0;
    }
    .brand-icon {
      width: 34px; height: 34px;
      background: linear-gradient(135deg, #00C896, #00856A);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      box-shadow: 0 0 16px rgba(0,200,150,0.3);
      flex-shrink: 0;
    }
    .brand-name {
      font-size: 1.05rem; font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text-100);
      font-family: 'Inter', 'DM Sans', sans-serif;
    }

    /* ── Nav Links ── */
    .nav-links {
      display: flex; align-items: center; gap: 2px;
      flex: 1; margin-left: 24px;
    }
    .nav-link {
      display: flex; align-items: center; gap: 7px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.845rem; font-weight: 500;
      color: var(--text-300);
      text-decoration: none;
      transition: color 180ms ease, background 180ms ease;
      white-space: nowrap;
      font-family: 'Inter', 'DM Sans', sans-serif;
    }
    .nav-link svg { flex-shrink: 0; transition: color 180ms ease; }
    .nav-link:hover { color: var(--text-100); background: rgba(255,255,255,0.05); }
    .nav-link.active {
      color: var(--accent);
      background: rgba(0, 200, 150, 0.1);
      font-weight: 600;
    }

    /* ── Right Side ── */
    .nav-right {
      display: flex; align-items: center; gap: 10px;
      margin-left: auto; flex-shrink: 0;
    }

    .icon-btn {
      width: 34px; height: 34px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.04);
      color: var(--text-300);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 180ms ease, color 180ms ease, transform 180ms ease;
    }
    .icon-btn:hover {
      background: rgba(255,255,255,0.09);
      color: var(--text-100);
      transform: scale(1.05);
    }

    .user-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 12px 5px 6px;
      border-radius: 100px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.04);
      cursor: pointer;
      transition: background 180ms ease, border-color 180ms ease;
    }
    .user-chip:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.12);
    }
    .user-avatar {
      width: 24px; height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00C896, #8B5CF6);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: #fff;
      flex-shrink: 0;
    }
    .user-name {
      font-size: 0.82rem; font-weight: 500;
      color: var(--text-200);
      font-family: 'Inter', 'DM Sans', sans-serif;
    }

    .logout-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 13px;
      border-radius: 8px;
      border: 1px solid rgba(255,94,120,0.2);
      background: rgba(255,94,120,0.07);
      color: var(--danger);
      cursor: pointer;
      font-size: 0.82rem; font-weight: 500;
      transition: background 180ms ease, border-color 180ms ease;
      font-family: 'Inter', 'DM Sans', sans-serif;
    }
    .logout-btn:hover {
      background: rgba(255,94,120,0.14);
      border-color: rgba(255,94,120,0.35);
    }

    /* Light theme adjustments */
    :host-context(.light-theme) .navbar {
      background: rgba(248,250,252,0.9);
    }
  `]
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  authService  = inject(AuthService);
  router       = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showNavbar() {
    return this.router.url !== '/login';
  }
}
