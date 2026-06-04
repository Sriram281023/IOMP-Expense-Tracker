import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">

      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-sub">Manage your account preferences and security</p>
      </div>

      <div class="settings-layout">

        <!-- Left: Profile + Currency + Security -->
        <div class="settings-main">

          <!-- Profile -->
          <div class="section-card">
            <div class="section-head">
              <div class="section-ico ico-blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2 class="section-title">Profile</h2>
            </div>
            <div class="section-body">
              <div class="info-row"><span class="info-lbl">Full Name</span><span class="info-val">{{ authService.user()?.name || '—' }}</span></div>
              <div class="info-row"><span class="info-lbl">Email</span><span class="info-val mono">{{ authService.user()?.email || '—' }}</span></div>
              <div class="info-row border-none"><span class="info-lbl">Member Since</span><span class="info-val">April 2026</span></div>
            </div>
          </div>

          <!-- Currency -->
          <div class="section-card">
            <div class="section-head">
              <div class="section-ico ico-gold">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h2 class="section-title">Currency</h2>
            </div>
            <div class="section-body">
              <p class="section-desc">Choose how amounts are displayed across the app.</p>
              <div class="field">
                <label>Display Currency</label>
                <select class="inp" [(ngModel)]="selectedCurrency" (change)="saveCurrency()">
                  <option *ngFor="let c of expenseService.getAvailableCurrencies()" [value]="c.code">
                    {{ c.code }} ({{ expenseService.getSymbol(c.code) }}) — {{ c.name }}
                  </option>
                </select>
              </div>
              <div class="currency-preview" *ngIf="selectedCurrency">
                Preview: <strong>{{ expenseService.getSymbol(selectedCurrency) }}10,000</strong>
              </div>
            </div>
          </div>

          <!-- Security -->
          <div class="section-card">
            <div class="section-head">
              <div class="section-ico ico-purple">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 class="section-title">Security</h2>
            </div>
            <div class="section-body">
              <p class="section-desc">Update your password to keep your account secure.</p>
              <div class="field-row">
                <div class="field">
                  <label>New Password</label>
                  <input type="password" class="inp" [(ngModel)]="newPassword" placeholder="Min. 8 characters">
                </div>
                <div class="field">
                  <label>Confirm Password</label>
                  <input type="password" class="inp" [(ngModel)]="confirmPassword" placeholder="Repeat password">
                </div>
              </div>
              <p class="mismatch-warn" *ngIf="newPassword && newPassword !== confirmPassword">Passwords do not match.</p>
              <button class="btn-outline" (click)="updatePassword()" [disabled]="!newPassword || newPassword !== confirmPassword">
                Update Password
              </button>
            </div>
          </div>

        </div>

        <!-- Right: Data management -->
        <div class="settings-side">

          <!-- Data -->
          <div class="section-card">
            <div class="section-head">
              <div class="section-ico ico-green">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              </div>
              <h2 class="section-title">Data</h2>
            </div>
            <div class="section-body">
              <p class="section-desc">Export or reset your expense data.</p>
              <button class="btn-outline" (click)="exportData()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export JSON
              </button>
              <button class="btn-outline btn-warn" style="margin-top: 10px;" (click)="clearData()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                Clear All Data
              </button>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="section-card danger-card">
            <div class="section-head">
              <div class="section-ico ico-danger">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h2 class="section-title danger-title">Danger Zone</h2>
            </div>
            <div class="section-body">
              <p class="section-desc">Permanently delete your account and all data. <strong>This cannot be undone.</strong></p>
              <button class="btn-danger" (click)="deleteAccount()">Delete Account</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    .settings-page {
      padding: 36px 0;
      font-family: 'Inter', 'DM Sans', sans-serif;
      animation: fadeUp 280ms ease forwards;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .page-header { margin-bottom: 28px; }
    .page-title { font-size: 1.9rem; font-weight: 700; color: var(--text-100); letter-spacing: -0.04em; margin-bottom: 5px; }
    .page-sub   { font-size: 0.875rem; color: var(--text-300); }

    /* ── Layout ── */
    .settings-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 20px;
      align-items: start;
    }
    .settings-main { display: flex; flex-direction: column; gap: 20px; }
    .settings-side { display: flex; flex-direction: column; gap: 20px; }

    /* ── Section Card ── */
    .section-card {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      overflow: hidden;
      transition: border-color 200ms ease;
    }
    .section-card:hover { border-color: rgba(255,255,255,0.08); }
    .section-head {
      display: flex; align-items: center; gap: 12px;
      padding: 18px 22px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background: rgba(255,255,255,0.015);
    }
    .section-ico {
      width: 32px; height: 32px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .ico-blue   { background: rgba(56,189,248,0.12); color: #38BDF8; }
    .ico-gold   { background: rgba(240,192,96,0.12); color: #F0C060; }
    .ico-purple { background: rgba(139,92,246,0.12); color: #8B5CF6; }
    .ico-green  { background: rgba(0,200,150,0.12);  color: var(--accent); }
    .ico-danger { background: rgba(255,94,120,0.12); color: var(--danger); }

    .section-title {
      font-size: 0.9rem; font-weight: 600; color: var(--text-100);
      letter-spacing: -0.01em;
    }
    .danger-title { color: var(--danger); }
    .section-body { padding: 20px 22px; }
    .section-desc { font-size: 0.82rem; color: var(--text-300); margin-bottom: 16px; line-height: 1.5; }

    /* ── Info Rows ── */
    .info-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .border-none { border-bottom: none; }
    .info-lbl { font-size: 0.82rem; color: var(--text-300); font-weight: 500; }
    .info-val  { font-size: 0.85rem; color: var(--text-100); font-weight: 500; }
    .mono { font-family: var(--font-mono); font-size: 0.8rem; }

    /* ── Fields ── */
    .field { display: flex; flex-direction: column; gap: 7px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .field label { font-size: 0.77rem; font-weight: 500; color: var(--text-200); }
    .inp {
      width: 100%; padding: 10px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 9px;
      color: var(--text-100); font-size: 0.875rem;
      font-family: 'Inter', 'DM Sans', sans-serif;
      outline: none;
      transition: border-color 180ms ease, box-shadow 180ms ease;
    }
    .inp:focus {
      border-color: rgba(0,200,150,0.4);
      box-shadow: 0 0 0 3px rgba(0,200,150,0.08);
    }
    select.inp option { background: var(--bg-800); color: var(--text-100); }

    .currency-preview {
      margin-top: 10px; padding: 10px 14px;
      background: rgba(0,200,150,0.06);
      border: 1px solid rgba(0,200,150,0.15);
      border-radius: 9px;
      font-size: 0.82rem; color: var(--text-300);
    }
    .currency-preview strong { color: var(--accent); font-variant-numeric: tabular-nums; }

    .mismatch-warn {
      font-size: 0.78rem; color: var(--danger);
      margin-bottom: 12px; margin-top: 4px;
    }

    /* ── Buttons ── */
    .btn-outline {
      display: flex; align-items: center; gap: 8px;
      width: 100%; padding: 10px 16px; border-radius: 9px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-200); font-size: 0.85rem; font-weight: 500;
      cursor: pointer; font-family: 'Inter', 'DM Sans', sans-serif;
      transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
    }
    .btn-outline:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.16); color: var(--text-100); }
    .btn-outline:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-warn { border-color: rgba(255,183,71,0.2); color: var(--warning); }
    .btn-warn:hover { background: rgba(255,183,71,0.08); border-color: rgba(255,183,71,0.3); color: var(--warning); }

    .btn-danger {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 10px 16px; border-radius: 9px;
      background: rgba(255,94,120,0.08);
      border: 1px solid rgba(255,94,120,0.25);
      color: var(--danger); font-size: 0.875rem; font-weight: 600;
      cursor: pointer; font-family: 'Inter', 'DM Sans', sans-serif;
      transition: background 160ms ease, border-color 160ms ease;
    }
    .btn-danger:hover { background: rgba(255,94,120,0.16); border-color: rgba(255,94,120,0.4); }

    .danger-card { border-color: rgba(255,94,120,0.12); }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .settings-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .field-row { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent {
  expenseService   = inject(ExpenseService);
  authService      = inject(AuthService);
  selectedCurrency = this.expenseService.selectedCurrency();
  newPassword      = '';
  confirmPassword  = '';

  saveCurrency() { this.expenseService.setCurrency(this.selectedCurrency); }

  updatePassword() {
    if (this.newPassword && this.newPassword === this.confirmPassword) {
      this.authService.updatePassword(this.newPassword);
      this.newPassword = '';
      this.confirmPassword = '';
      alert('Password updated successfully!');
    }
  }

  exportData() {
    const data = { expenses: this.expenseService.expenses(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'expenses-export.json';
    a.click();
  }

  clearData() {
    if (confirm('Delete ALL expenses? This cannot be undone.')) {
      this.expenseService.clearAll();
    }
  }

  async deleteAccount() {
    if (confirm('Permanently delete your account and all data? This cannot be undone.')) {
      const check = prompt('Type "DELETE" to confirm:');
      if (check === 'DELETE') {
        try {
          await this.authService.deleteAccount();
          alert('Account deleted successfully.');
        } catch (e: any) {
          alert('Failed: ' + (e.message || 'Unknown error.'));
        }
      }
    }
  }
}
