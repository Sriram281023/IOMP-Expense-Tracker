import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense } from '../../core/models/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tx-page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Expenses</h1>
          <p class="page-sub">Manage and log your spending records</p>
        </div>
        <button class="toggle-btn" (click)="showForm.set(!showForm())">
          <svg *ngIf="!showForm()" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <svg *ngIf="showForm()" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          {{ showForm() ? 'Cancel' : 'Add Expense' }}
        </button>
      </div>

      <!-- Add Form -->
      <div class="form-card" *ngIf="showForm()">
        <div class="form-card-header">
          <span class="form-card-title">New Transaction</span>
          <span class="form-card-badge">Manual Entry</span>
        </div>
        <div class="form-grid">
          <div class="field">
            <label>Amount ({{ expenseService.currencySymbol() }})</label>
            <div class="input-wrap">
              <span class="input-prefix">{{ expenseService.currencySymbol() }}</span>
              <input type="number" [(ngModel)]="newExpense.amount" class="inp inp-prefixed" placeholder="0.00" min="0">
            </div>
          </div>
          <div class="field">
            <label>Category</label>
            <select [(ngModel)]="newExpense.category" class="inp">
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="field">
            <label>Description <span class="opt">(optional)</span></label>
            <input type="text" [(ngModel)]="newExpense.description" class="inp" placeholder="e.g. Coffee at Starbucks">
          </div>
          <div class="field">
            <label>Date</label>
            <input type="date" [(ngModel)]="newExpense.date" class="inp">
          </div>
        </div>
        <div class="form-footer">
          <button class="btn-ghost" (click)="showForm.set(false)">Cancel</button>
          <button class="btn-primary" (click)="addExpense()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Save Expense
          </button>
        </div>
      </div>

      <!-- Success Toast -->
      <div class="toast" *ngIf="toastVisible">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Expense saved successfully!
      </div>

      <!-- Transaction List -->
      <div class="table-card">
        <div class="table-head">
          <h3 class="table-title">Transaction History</h3>
          <span class="count-badge">{{ expenseService.expenses().length }} entries</span>
        </div>

        <div *ngIf="expenseService.expenses().length > 0; else empty">
          <table class="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th class="tr">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of sortedExpenses()" class="tx-row">
                <td class="date-col">{{ e.date | date:'dd MMM yyyy' }}</td>
                <td><span class="cat-pill">{{ e.category }}</span></td>
                <td class="desc-col">{{ e.description || '—' }}</td>
                <td class="amt-col tr tabular">{{ expenseService.currencySymbol() }}{{ fmt(e.amount) }}</td>
                <td class="act-col">
                  <button class="del-btn" (click)="deleteExpense(e.id)" title="Delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #empty>
          <div class="empty">
            <div class="empty-ico">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <p>No transactions yet. Click <strong>Add Expense</strong> to get started.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .tx-page {
      padding: 36px 0;
      font-family: 'Inter', 'DM Sans', sans-serif;
      animation: fadeUp 280ms ease forwards;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Header ── */
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
    }
    .page-title { font-size: 1.9rem; font-weight: 700; color: var(--text-100); letter-spacing: -0.04em; margin-bottom: 5px; }
    .page-sub   { font-size: 0.875rem; color: var(--text-300); }

    .toggle-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 18px;
      background: linear-gradient(135deg, #00C896, #00A87A);
      border: none; border-radius: 10px;
      color: #000; font-size: 0.875rem; font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,200,150,0.3);
      transition: opacity 180ms ease, transform 180ms ease;
      font-family: 'Inter', 'DM Sans', sans-serif;
      white-space: nowrap; flex-shrink: 0;
    }
    .toggle-btn:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ── Form Card ── */
    .form-card {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0,200,150,0.2);
      border-radius: 16px;
      margin-bottom: 20px;
      overflow: hidden;
      animation: slideDown 220ms ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .form-card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background: rgba(0,200,150,0.04);
    }
    .form-card-title { font-size: 0.875rem; font-weight: 600; color: var(--text-100); }
    .form-card-badge {
      font-size: 0.7rem; font-weight: 600;
      padding: 3px 9px; border-radius: 100px;
      background: rgba(0,200,150,0.12); color: var(--accent);
    }

    .form-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 16px; padding: 20px 24px;
    }
    .field { display: flex; flex-direction: column; gap: 7px; }
    .field label {
      font-size: 0.77rem; font-weight: 500;
      color: var(--text-200);
    }
    .opt { color: var(--text-400); font-weight: 400; }
    .input-wrap { position: relative; display: flex; align-items: center; }
    .input-prefix {
      position: absolute; left: 13px;
      font-size: 0.85rem; color: var(--text-300);
      pointer-events: none;
    }
    .inp {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 9px;
      color: var(--text-100);
      font-size: 0.875rem;
      font-family: 'Inter', 'DM Sans', sans-serif;
      outline: none;
      transition: border-color 180ms ease, box-shadow 180ms ease;
    }
    .inp:focus {
      border-color: rgba(0,200,150,0.4);
      box-shadow: 0 0 0 3px rgba(0,200,150,0.08);
    }
    .inp-prefixed { padding-left: 28px; }
    .inp::placeholder { color: var(--text-400); }

    select.inp option {
      background: var(--bg-800);
      color: var(--text-100);
    }

    .form-footer {
      display: flex; align-items: center; justify-content: flex-end; gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .btn-ghost {
      padding: 9px 16px; border-radius: 9px;
      background: none; border: 1px solid rgba(255,255,255,0.08);
      color: var(--text-300); font-size: 0.85rem; cursor: pointer;
      font-family: 'Inter', 'DM Sans', sans-serif;
      transition: background 160ms ease;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.05); }
    .btn-primary {
      display: flex; align-items: center; gap: 7px;
      padding: 9px 18px; border-radius: 9px;
      background: linear-gradient(135deg, #00C896, #00A87A);
      border: none; color: #000;
      font-size: 0.875rem; font-weight: 700;
      cursor: pointer; font-family: 'Inter', 'DM Sans', sans-serif;
      transition: opacity 160ms ease;
    }
    .btn-primary:hover { opacity: 0.9; }

    /* ── Toast ── */
    .toast {
      display: flex; align-items: center; gap: 8px;
      padding: 11px 16px;
      background: rgba(0,200,150,0.1);
      border: 1px solid rgba(0,200,150,0.25);
      border-radius: 10px;
      color: var(--accent);
      font-size: 0.83rem; font-weight: 500;
      margin-bottom: 16px;
      animation: fadeUp 200ms ease;
    }

    /* ── Table ── */
    .table-card {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      overflow: hidden;
    }
    .table-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .table-title { font-size: 0.9rem; font-weight: 600; color: var(--text-100); }
    .count-badge {
      font-size: 0.72rem; font-weight: 600;
      padding: 3px 9px; border-radius: 100px;
      background: rgba(255,255,255,0.06); color: var(--text-300);
    }

    .tx-table { width: 100%; border-collapse: collapse; }
    .tx-table th {
      padding: 10px 24px;
      text-align: left; font-size: 0.7rem;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--text-400); font-weight: 500;
      background: rgba(255,255,255,0.02);
    }
    .tx-row { transition: background 140ms ease; }
    .tx-row:hover { background: rgba(255,255,255,0.02); }
    .tx-table td {
      padding: 13px 24px;
      font-size: 0.85rem; color: var(--text-200);
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .tx-row:last-child td { border-bottom: none; }
    .date-col { color: var(--text-300); font-size: 0.8rem; white-space: nowrap; }
    .desc-col { color: var(--text-300); max-width: 220px; }
    .amt-col  { font-weight: 600; color: var(--accent); }
    .tr { text-align: right; }
    .tabular { font-variant-numeric: tabular-nums; }

    .cat-pill {
      padding: 3px 10px; border-radius: 100px;
      font-size: 0.72rem; font-weight: 500;
      background: rgba(0,200,150,0.1); color: var(--accent);
      white-space: nowrap;
    }

    .act-col { width: 44px; }
    .del-btn {
      opacity: 0;
      width: 28px; height: 28px; border-radius: 7px;
      background: rgba(255,94,120,0.08);
      border: 1px solid transparent;
      color: var(--danger);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 140ms ease;
    }
    .tx-row:hover .del-btn { opacity: 1; }
    .del-btn:hover { background: rgba(255,94,120,0.18); border-color: rgba(255,94,120,0.3); }

    .empty {
      padding: 56px 24px; text-align: center;
    }
    .empty-ico {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(255,255,255,0.04);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 14px; color: var(--text-400);
    }
    .empty p { font-size: 0.875rem; color: var(--text-300); }

    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TransactionsComponent {
  expenseService = inject(ExpenseService);
  categories     = this.expenseService.categories();
  showForm       = signal(false);
  toastVisible   = false;

  newExpense = {
    amount: 0,
    category: 'Food & Dining',
    description: '',
    date: new Date().toISOString().split('T')[0]
  };

  fmt(n: number) { return Math.round(n).toLocaleString('en-IN'); }

  addExpense() {
    if (this.newExpense.amount <= 0) return;
    this.expenseService.addExpense({
      ...this.newExpense,
      description: this.newExpense.description || 'Unspecified',
      source: 'manual' as const
    });
    this.showForm.set(false);
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 3000);
    this.newExpense = {
      amount: 0, category: 'Food & Dining', description: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  sortedExpenses() {
    return [...this.expenseService.expenses()].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  deleteExpense(id: string) { this.expenseService.deleteExpense(id); }
}
