import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { RouterLink } from '@angular/router';
import { Expense } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dash">

      <!-- Header -->
      <div class="dash-header">
        <div>
          <div class="greeting-row">
            <span class="greeting-time">{{ greeting }},</span>
            <span class="greeting-name">{{ authService.user()?.name?.split(' ')[0] || 'there' }} 👋</span>
          </div>
          <p class="dash-subtitle">Here's your financial snapshot for {{ currentMonthName }}</p>
        </div>
        <a class="add-btn" [routerLink]="['/expenses']">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Expense
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-lbl">Total Spent</span>
            <div class="kpi-ico ico-red">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>
            </div>
          </div>
          <div class="kpi-val accent tabular">{{ expenseService.currencySymbol() }}{{ fmt(expenseService.totalSpent()) }}</div>
          <div class="kpi-sub">All time total</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-lbl">This Month</span>
            <div class="kpi-ico ico-gold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
          <div class="kpi-val gold tabular">{{ expenseService.currencySymbol() }}{{ fmt(currentMonthTotal()) }}</div>
          <div class="kpi-sub">{{ currentMonthName }}</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-lbl">Transactions</span>
            <div class="kpi-ico ico-purple">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
          </div>
          <div class="kpi-val purple tabular">{{ expenseService.expenses().length }}</div>
          <div class="kpi-sub">Total entries</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-row">
        <a class="q-btn" [routerLink]="['/expenses']">
          <div class="q-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div>
            <div class="q-title">Add Expense</div>
            <div class="q-sub">Log a new transaction</div>
          </div>
        </a>
        <a class="q-btn" [routerLink]="['/analytics']">
          <div class="q-icon q-icon-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-3-3-4 4"/></svg>
          </div>
          <div>
            <div class="q-title">Analytics</div>
            <div class="q-sub">View spending insights</div>
          </div>
        </a>
        <a class="q-btn" [routerLink]="['/import']">
          <div class="q-icon q-icon-purple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div>
            <div class="q-title">Import UPI</div>
            <div class="q-sub">Bulk import transactions</div>
          </div>
        </a>
        <a class="q-btn" [routerLink]="['/settings']">
          <div class="q-icon q-icon-slate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </div>
          <div>
            <div class="q-title">Settings</div>
            <div class="q-sub">Currency & account</div>
          </div>
        </a>
      </div>

      <!-- Recent Expenses -->
      <div class="table-card">
        <div class="table-head">
          <h3 class="table-title">Recent Transactions</h3>
          <a class="view-all" [routerLink]="['/expenses']">View All
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>

        <div *ngIf="expenseService.expenses().length > 0; else empty">
          <table class="exp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th class="txt-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of recentExpenses()" class="exp-row">
                <td class="date-cell">{{ e.date | date:'dd MMM' }}</td>
                <td><span class="cat-badge">{{ e.category }}</span></td>
                <td class="desc-cell">{{ e.description || '—' }}</td>
                <td class="amt-cell txt-right tabular">{{ expenseService.currencySymbol() }}{{ fmt(e.amount) }}</td>
                <td class="action-cell">
                  <button class="del-btn" (click)="deleteExpense(e.id)" title="Delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #empty>
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <p>No transactions yet. <a [routerLink]="['/expenses']">Add your first one →</a></p>
          </div>
        </ng-template>
      </div>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    .dash {
      padding: 36px 0;
      font-family: 'Inter', 'DM Sans', sans-serif;
      animation: fadeUp 280ms ease forwards;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Header ── */
    .dash-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
    }
    .greeting-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 5px; }
    .greeting-time { font-size: 1.75rem; font-weight: 700; color: var(--text-300); letter-spacing: -0.04em; }
    .greeting-name { font-size: 1.75rem; font-weight: 700; color: var(--text-100); letter-spacing: -0.04em; }
    .dash-subtitle { font-size: 0.875rem; color: var(--text-300); }
    .add-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px;
      background: linear-gradient(135deg, #00C896, #00A87A);
      border-radius: 10px;
      color: #000; font-weight: 700; font-size: 0.875rem;
      text-decoration: none;
      box-shadow: 0 4px 16px rgba(0,200,150,0.3);
      transition: opacity 180ms ease, transform 180ms ease;
      white-space: nowrap; flex-shrink: 0;
    }
    .add-btn:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ── KPI ── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .kpi-card {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 22px;
      transition: transform 200ms ease, border-color 200ms ease;
    }
    .kpi-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.1); }
    .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .kpi-lbl { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-300); }
    .kpi-ico {
      width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .ico-red    { background: rgba(255,94,120,0.12); color: #FF5E78; }
    .ico-gold   { background: rgba(240,192,96,0.12); color: #F0C060; }
    .ico-purple { background: rgba(139,92,246,0.12); color: #8B5CF6; }
    .kpi-val { font-size: 1.7rem; font-weight: 700; letter-spacing: -0.04em; color: var(--text-100); margin-bottom: 6px; }
    .kpi-val.accent { color: var(--accent); }
    .kpi-val.gold   { color: #F0C060; }
    .kpi-val.purple { color: #8B5CF6; }
    .kpi-sub { font-size: 0.72rem; color: var(--text-400); }
    .tabular { font-variant-numeric: tabular-nums; }

    /* ── Quick Actions ── */
    .quick-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .q-btn {
      display: flex; align-items: center; gap: 14px;
      padding: 16px;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 14px;
      text-decoration: none;
      transition: transform 200ms ease, border-color 200ms ease, background 200ms ease;
    }
    .q-btn:hover {
      transform: translateY(-2px);
      border-color: rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
    }
    .q-icon {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,200,150,0.12); color: var(--accent);
    }
    .q-icon-gold   { background: rgba(240,192,96,0.12); color: #F0C060; }
    .q-icon-purple { background: rgba(139,92,246,0.12); color: #8B5CF6; }
    .q-icon-slate  { background: rgba(255,255,255,0.06); color: var(--text-300); }
    .q-title { font-size: 0.85rem; font-weight: 600; color: var(--text-100); margin-bottom: 2px; }
    .q-sub   { font-size: 0.72rem; color: var(--text-400); }

    /* ── Table Card ── */
    .table-card {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      overflow: hidden;
    }
    .table-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .table-title { font-size: 0.9rem; font-weight: 600; color: var(--text-100); }
    .view-all {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.78rem; color: var(--accent); text-decoration: none;
      font-weight: 500;
      transition: gap 150ms ease;
    }
    .view-all:hover { gap: 7px; }

    .exp-table { width: 100%; border-collapse: collapse; }
    .exp-table th {
      padding: 10px 24px;
      text-align: left; font-size: 0.7rem;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--text-400);
      background: rgba(255,255,255,0.02);
      font-weight: 500;
    }
    .exp-row { transition: background 150ms ease; }
    .exp-row:hover { background: rgba(255,255,255,0.02); }
    .exp-table td {
      padding: 13px 24px;
      font-size: 0.85rem; color: var(--text-200);
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .exp-row:last-child td { border-bottom: none; }
    .date-cell { color: var(--text-300); font-size: 0.8rem; white-space: nowrap; }
    .desc-cell { color: var(--text-300); }
    .amt-cell  { font-weight: 600; color: var(--accent); }
    .txt-right { text-align: right; }

    .cat-badge {
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 0.72rem; font-weight: 500;
      background: rgba(0,200,150,0.1);
      color: var(--accent);
      white-space: nowrap;
    }

    .del-btn {
      opacity: 0;
      background: rgba(255,94,120,0.08);
      border: 1px solid transparent;
      border-radius: 7px;
      color: var(--danger);
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 150ms ease;
    }
    .exp-row:hover .del-btn { opacity: 1; }
    .del-btn:hover { background: rgba(255,94,120,0.18); border-color: rgba(255,94,120,0.3); }

    .empty-state {
      padding: 56px 24px;
      text-align: center;
    }
    .empty-icon {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: rgba(255,255,255,0.05);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      color: var(--text-400);
    }
    .empty-state p { font-size: 0.875rem; color: var(--text-300); }
    .empty-state a { color: var(--accent); text-decoration: none; }

    /* ── Responsive ── */
    @media (max-width: 900px) { .quick-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) {
      .kpi-grid  { grid-template-columns: 1fr; }
      .quick-row { grid-template-columns: repeat(2, 1fr); }
      .greeting-time, .greeting-name { font-size: 1.4rem; }
    }
  `]
})
export class DashboardComponent {
  expenseService = inject(ExpenseService);
  authService    = inject(AuthService);
  currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  greeting = this.getGreeting();

  fmt(n: number) { return Math.round(n).toLocaleString('en-IN'); }

  getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  currentMonthTotal() {
    const now = new Date();
    return this.expenseService.expenses()
      .filter((e: Expense) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s: number, e: Expense) => s + e.amount, 0);
  }

  recentExpenses() {
    return [...this.expenseService.expenses()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }

  deleteExpense(id: string) { this.expenseService.deleteExpense(id); }
}
