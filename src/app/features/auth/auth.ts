import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-root">
      <!-- Ambient background blobs -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>

      <div class="auth-shell">
        <!-- Left brand panel -->
        <div class="auth-panel-left">
          <div class="brand-mark">
            <div class="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <span>Fintrek</span>
          </div>
          <h2 class="panel-headline">Your finances,<br><span class="hl">clearly.</span></h2>
          <p class="panel-body">Track every rupee, visualise your spending, and take control of your financial future—all in one place.</p>
          <ul class="feature-list">
            <li><span class="f-dot"></span>Real-time expense tracking</li>
            <li><span class="f-dot"></span>Beautiful analytics & charts</li>
            <li><span class="f-dot"></span>Multi-currency support</li>
            <li><span class="f-dot"></span>Secure cloud sync via Supabase</li>
          </ul>
        </div>

        <!-- Right form panel -->
        <div class="auth-panel-right">
          <div class="auth-card">
            <!-- Tabs -->
            <div class="auth-tabs">
              <button class="auth-tab" [class.active]="isLogin" (click)="isLogin = true; error = ''">Sign In</button>
              <button class="auth-tab" [class.active]="!isLogin" (click)="isLogin = false; error = ''">Create Account</button>
            </div>

            <!-- Error -->
            <div class="auth-alert" *ngIf="error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ error }}
            </div>

            <!-- Form -->
            <div class="auth-form">
              <div class="field" *ngIf="!isLogin">
                <label>Full Name</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" [(ngModel)]="name" placeholder="John Doe" autocomplete="name">
                </div>
              </div>

              <div class="field">
                <label>Email Address</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input type="email" [(ngModel)]="email" placeholder="you@example.com" autocomplete="email">
                </div>
              </div>

              <div class="field">
                <label>Password</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" placeholder="Min. 8 characters" autocomplete="new-password">
                  <button type="button" class="eye-btn" (click)="showPwd = !showPwd" tabindex="-1">
                    <svg *ngIf="!showPwd" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg *ngIf="showPwd" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
              </div>

              <div class="field" *ngIf="!isLogin">
                <label>Confirm Password</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" [(ngModel)]="confirmPassword" placeholder="Repeat your password" autocomplete="new-password">
                </div>
              </div>

              <button class="submit-btn" (click)="onSubmit()" [disabled]="isLoading">
                <span class="spinner" *ngIf="isLoading"></span>
                <span *ngIf="!isLoading">{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
                <span *ngIf="isLoading">Processing…</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    .auth-root {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 24px;
      font-family: 'Inter', 'DM Sans', sans-serif;
    }

    /* Ambient blobs */
    .blob {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }
    .blob-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(0,200,150,0.12), transparent 70%);
      top: -100px; left: -100px;
    }
    .blob-2 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%);
      bottom: -150px; right: -150px;
    }

    /* ── Shell ── */
    .auth-shell {
      position: relative; z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 960px;
      width: 100%;
      gap: 0;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.07);
      box-shadow: 0 40px 80px rgba(0,0,0,0.5);
    }

    /* ── Left Panel ── */
    .auth-panel-left {
      background: linear-gradient(160deg, #0D1A2E 0%, #091324 100%);
      padding: 52px 44px;
      display: flex;
      flex-direction: column;
      gap: 0;
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .brand-mark {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 48px;
    }
    .brand-icon {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, #00C896, #00856A);
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      box-shadow: 0 0 20px rgba(0,200,150,0.35);
    }
    .brand-mark span {
      font-size: 1.1rem; font-weight: 700;
      color: var(--text-100);
      letter-spacing: -0.03em;
    }
    .panel-headline {
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.04em;
      color: var(--text-100);
      margin-bottom: 18px;
    }
    .hl { color: #00C896; }
    .panel-body {
      font-size: 0.875rem;
      color: var(--text-300);
      line-height: 1.65;
      margin-bottom: 36px;
    }
    .feature-list {
      list-style: none;
      display: flex; flex-direction: column; gap: 12px;
      margin-top: auto;
    }
    .feature-list li {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.82rem; color: var(--text-200);
    }
    .f-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #00C896;
      box-shadow: 0 0 5px rgba(0,200,150,0.5);
      flex-shrink: 0;
    }

    /* ── Right Panel ── */
    .auth-panel-right {
      background: var(--bg-800);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 52px 44px;
    }
    .auth-card { width: 100%; }

    /* ── Tabs ── */
    .auth-tabs {
      display: flex;
      background: rgba(255,255,255,0.04);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 28px;
      gap: 4px;
    }
    .auth-tab {
      flex: 1;
      padding: 9px;
      border-radius: 7px;
      border: none;
      background: transparent;
      color: var(--text-300);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 200ms ease;
      font-family: 'Inter', 'DM Sans', sans-serif;
    }
    .auth-tab.active {
      background: rgba(255,255,255,0.08);
      color: var(--text-100);
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }

    /* ── Alert ── */
    .auth-alert {
      display: flex; align-items: center; gap: 8px;
      padding: 11px 14px;
      border-radius: 9px;
      border: 1px solid rgba(255,94,120,0.3);
      background: rgba(255,94,120,0.08);
      color: #FF5E78;
      font-size: 0.83rem;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    /* ── Form ── */
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 7px; }
    .field label {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--text-200);
      letter-spacing: 0.01em;
    }
    .input-wrap {
      position: relative;
      display: flex; align-items: center;
    }
    .input-icon {
      position: absolute; left: 13px;
      color: var(--text-400);
      pointer-events: none;
      flex-shrink: 0;
    }
    .input-wrap input {
      width: 100%;
      padding: 11px 38px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 9px;
      color: var(--text-100);
      font-size: 0.9rem;
      font-family: 'Inter', 'DM Sans', sans-serif;
      outline: none;
      transition: border-color 180ms ease, box-shadow 180ms ease;
    }
    .input-wrap input::placeholder { color: var(--text-400); }
    .input-wrap input:focus {
      border-color: rgba(0,200,150,0.5);
      box-shadow: 0 0 0 3px rgba(0,200,150,0.1);
    }
    .eye-btn {
      position: absolute; right: 12px;
      background: none; border: none;
      color: var(--text-400); cursor: pointer;
      padding: 4px;
      transition: color 150ms ease;
    }
    .eye-btn:hover { color: var(--text-200); }

    /* ── Submit ── */
    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%;
      padding: 12px;
      margin-top: 4px;
      background: linear-gradient(135deg, #00C896 0%, #00A87A 100%);
      border: none;
      border-radius: 10px;
      color: #000;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: -0.01em;
      font-family: 'Inter', 'DM Sans', sans-serif;
      box-shadow: 0 4px 20px rgba(0,200,150,0.3);
      transition: opacity 200ms ease, transform 200ms ease, box-shadow 200ms ease;
    }
    .submit-btn:hover:not(:disabled) {
      opacity: 0.92;
      transform: translateY(-1px);
      box-shadow: 0 6px 28px rgba(0,200,150,0.4);
    }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 15px; height: 15px;
      border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .auth-shell { grid-template-columns: 1fr; }
      .auth-panel-left { display: none; }
      .auth-panel-right { padding: 36px 28px; }
    }
  `]
})
export class AuthComponent {
  isLogin = true;
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  isLoading = false;
  showPwd = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async onSubmit() {
    this.error = '';
    this.isLoading = true;
    try {
      if (this.isLogin) {
        await this.authService.login(this.email, this.password);
        this.router.navigate(['/dashboard']);
      } else {
        if (!this.name || !this.email || !this.password || !this.confirmPassword) {
          this.error = 'Please fill in all fields.';
          this.isLoading = false;
          return;
        }
        if (this.password !== this.confirmPassword) {
          this.error = 'Passwords do not match.';
          this.isLoading = false;
          return;
        }
        const data = await this.authService.register(this.name, this.email, this.password);
        if (data.session) {
          this.router.navigate(['/dashboard']);
        } else {
          alert('Signup successful! Check your email to confirm your account, then sign in.');
          this.isLogin = true;
          this.password = '';
          this.confirmPassword = '';
        }
      }
    } catch (err: any) {
      this.error = err.message || 'An error occurred during authentication.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
