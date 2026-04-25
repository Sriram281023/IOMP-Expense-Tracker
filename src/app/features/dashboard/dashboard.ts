import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { RouterLink } from '@angular/router';
import { Expense } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-content">
      <header class="page-header">
        <h2 class="page-title">Welcome back! 👋</h2>
        <p class="page-subtitle">Here's your financial overview</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💸</div>
          <div class="stat-label">Total Spent</div>
          <div class="stat-value accent">{{ expenseService.currencySymbol() }}{{ expenseService.totalSpent().toLocaleString('en-IN') }}</div>
          <div class="stat-sub">All time</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-icon">📅</div>
          <div class="stat-label">This Month</div>
          <div class="stat-value gold">{{ expenseService.currencySymbol() }}{{ currentMonthTotal().toLocaleString('en-IN') }}</div>
          <div class="stat-sub">{{ currentMonthName }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🧾</div>
          <div class="stat-label">Transactions</div>
          <div class="stat-value">{{ expenseService.expenses().length }}</div>
          <div class="stat-sub">Total entries</div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="action-btn" [routerLink]="['/expenses']">
          <span class="action-icon">➕</span> Add Expense
        </button>
        <button class="action-btn" [routerLink]="['/analytics']">
          <span class="action-icon">📊</span> Analytics
        </button>
        <button class="action-btn" [routerLink]="['/import']">
          <span class="action-icon">📥</span> Import UPI
        </button>
      </div>

      <div class="table-wrap">
        <div class="table-header">
          <h3>Recent Expenses</h3>
          <button class="btn btn-secondary" style="padding:8px 16px;font-size:0.82rem;" [routerLink]="['/expenses']">View All →</button>
        </div>

        <div class="table-container" *ngIf="expenseService.expenses().length > 0; else emptyState">
          <table class="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of recentExpenses()">
                <td>{{ e.date | date:'dd MMM' }}</td>
                <td><span class="category-badge">{{ e.category }}</span></td>
                <td class="amount-cell">{{ expenseService.currencySymbol() }}{{ e.amount.toLocaleString('en-IN') }}</td>
                <td>{{ e.description }}</td>
                <td class="actions-cell">
                  <button class="btn btn-icon" (click)="deleteExpense(e.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #emptyState>
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>No expenses yet. Add your first one!</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content { animation: fadeSlide 300ms ease forwards; }
    .page-header { margin-bottom: 32px; }
    .page-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--text-100); }
    .page-subtitle { color: var(--text-300); margin-top: 6px; }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
    .stat-card {
      background: var(--bg-glass); backdrop-filter: blur(16px);
      border: 1px solid var(--border); border-radius: var(--radius);
      padding: 24px; position: relative; overflow: hidden;
    }
    .stat-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-300); margin-bottom: 12px; }
    .stat-value { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: var(--text-100); }
    .stat-value.accent { color: var(--accent); }
    .stat-value.gold { color: var(--gold); }
    .stat-icon { position: absolute; right: 20px; top: 20px; font-size: 1.8rem; opacity: 0.1; }

    .quick-actions { display: flex; gap: 12px; margin-bottom: 32px; }
    .action-btn {
      display: flex; align-items: center; gap: 10px; padding: 14px 20px;
      background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border);
      border-radius: var(--radius); color: var(--text-200); cursor: pointer;
      font-size: 0.88rem; font-weight: 500;
    }
    .action-btn:hover { background: var(--accent-dim); border-color: var(--border-accent); color: var(--accent); transform: translateY(-1px); }

    .table-wrap { background: var(--bg-glass); border-radius: var(--radius); border: 1px solid var(--border); }
    .table-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
    .expense-table { width: 100%; border-collapse: collapse; }
    .expense-table th { padding: 12px 24px; text-align: left; font-size: 0.75rem; color: var(--text-400); background: rgba(255,255,255,0.02); }
    .expense-table td { padding: 14px 24px; font-size: 0.88rem; color: var(--text-200); border-bottom: 1px solid rgba(255,255,255,0.03); }
    .amount-cell { font-family: var(--font-mono); font-weight: 600; color: var(--accent); }
    .category-badge { padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; background: rgba(0,200,150,0.15); color: var(--accent); }
    .empty-state { text-align: center; padding: 48px; color: var(--text-400); }
  `]
})
export class DashboardComponent {
  expenseService = inject(ExpenseService);
  currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  currentMonthTotal() {
    const now = new Date();
    return this.expenseService.expenses()
      .filter((e: Expense) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, e: Expense) => sum + e.amount, 0);
  }

  recentExpenses() {
    return [...this.expenseService.expenses()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  deleteExpense(id: string) {
    this.expenseService.deleteExpense(id);
  }
}
