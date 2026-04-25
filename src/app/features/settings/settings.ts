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
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Settings</h2>
        <p class="page-subtitle">Manage your account and preferences</p>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">👤 Profile Information</div>
        <div class="settings-body">
          <div class="settings-row">
            <div class="settings-row-label">Full Name</div>
            <div class="settings-row-val">{{ authService.user()?.name }}</div>
          </div>
          <div class="settings-row">
            <div class="settings-row-label">Email Address</div>
            <div class="settings-row-val">{{ authService.user()?.email }}</div>
          </div>
          <div class="settings-row">
            <div class="settings-row-label">Member Since</div>
            <div class="settings-row-val">April 2026</div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">💱 Currency Preference</div>
        <div class="settings-body">
          <div class="form-group" style="max-width: 320px;">
            <label>Display Currency</label>
            <select class="form-control" [(ngModel)]="selectedCurrency" (change)="saveCurrency()">
              <option *ngFor="let c of expenseService.getAvailableCurrencies()" [value]="c.code">
                {{ c.code }} ({{ expenseService.getSymbol(c.code) }}) — {{ c.name }}
              </option>
            </select>
          </div>
          <p class="text-muted mt-8">All amounts will be displayed in your selected currency.</p>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">🔐 Security</div>
        <div class="settings-body">
          <div class="form-group" style="max-width: 320px;">
            <label>New Password</label>
            <input type="password" class="form-control" [(ngModel)]="newPassword" placeholder="Enter new password">
          </div>
          <div class="form-group" style="max-width: 320px; margin-top: 16px;">
            <label>Confirm Password</label>
            <input type="password" class="form-control" [(ngModel)]="confirmPassword" placeholder="Confirm new password">
          </div>
          <button class="btn btn-secondary" style="margin-top: 20px;" (click)="updatePassword()" [disabled]="!newPassword || newPassword !== confirmPassword">
            Update Password
          </button>
          <p class="text-muted mt-8" *ngIf="newPassword && newPassword !== confirmPassword" style="color: var(--danger);">Passwords do not match.</p>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">🗄️ Data Management</div>
        <div class="settings-body">
          <div class="flex gap-12">
            <button class="btn btn-secondary" (click)="exportData()">⬇️ Export JSON</button>
            <button class="btn btn-danger" (click)="clearData()">🗑️ Clear All Data</button>
          </div>
          <div class="danger-zone">
            <h4>Danger Zone</h4>
            <p class="text-muted" style="margin-bottom: 12px;">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button class="btn btn-danger" (click)="deleteAccount()">🚨 Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { animation: fadeSlide 300ms ease forwards; }
    .page-header { margin-bottom: 32px; }
    .page-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--text-100); }
    .page-subtitle { color: var(--text-300); margin-top: 6px; }

    .settings-section {
      background: var(--bg-glass); backdrop-filter: blur(16px);
      border: 1px solid var(--border); border-radius: var(--radius);
      margin-bottom: 24px; overflow: hidden;
    }
    .settings-section-header {
      padding: 16px 24px; background: rgba(255,255,255,0.02);
      border-bottom: 1px solid var(--border); font-weight: 600; font-size: 0.95rem;
      color: var(--text-100); display: flex; align-items: center; gap: 10px;
    }
    .settings-body { padding: 24px; }

    .settings-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .settings-row:last-child { border-bottom: none; }
    .settings-row-label { font-size: 0.9rem; color: var(--text-200); font-weight: 500; }
    .settings-row-val { font-size: 0.88rem; color: var(--text-300); font-family: var(--font-mono); }

    .form-group label { display: block; font-size: 0.82rem; color: var(--text-200); margin-bottom: 8px; }
    .form-control {
      width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 10px 14px; color: var(--text-100); outline: none;
    }

    .text-muted { color: var(--text-400); font-size: 0.8rem; }
    .mt-8 { margin-top: 8px; }
    .danger-zone { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,94,120,0.2); }
    .danger-zone h4 { color: var(--danger); font-size: 0.95rem; margin-bottom: 4px; }
  `]
})
export class SettingsComponent {
  expenseService = inject(ExpenseService);
  authService = inject(AuthService);
  selectedCurrency = this.expenseService.selectedCurrency();
  
  newPassword = '';
  confirmPassword = '';

  saveCurrency() {
    this.expenseService.setCurrency(this.selectedCurrency);
  }

  updatePassword() {
    if (this.newPassword && this.newPassword === this.confirmPassword) {
      this.authService.updatePassword(this.newPassword);
      this.newPassword = '';
      this.confirmPassword = '';
      alert('Password updated successfully! The data breach notification should no longer appear if you use this unique password.');
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
    if (confirm('Are you sure you want to delete ALL expenses?')) {
      this.expenseService.clearAll();
      alert('All data cleared.');
    }
  }

  async deleteAccount() {
    const isConfirmed = confirm('WARNING: Are you entirely sure you want to delete your account? All your expenses and profile data will be permanently erased. This cannot be undone.');
    
    if (isConfirmed) {
      const doubleCheck = prompt('Type "DELETE" to confirm account deletion:');
      if (doubleCheck === 'DELETE') {
        try {
          await this.authService.deleteAccount();
          alert('Your account has been successfully deleted.');
          // The auth guard will automatically catch the logout and redirect to login
        } catch (error: any) {
          alert('Failed to delete account: ' + (error.message || 'Unknown error. Make sure you ran the SQL function in Supabase.'));
        }
      } else {
        alert('Account deletion cancelled.');
      }
    }
  }
}
