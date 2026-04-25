import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense } from '../../core/models/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">All Expenses</h2>
        <p class="page-subtitle">Manage your spending records</p>
      </div>

      <!-- Add Expense Form Card -->
      <div class="card mb-24">
        <div class="card-title">Add New Expense</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Amount ({{ expenseService.currencySymbol() }})</label>
            <input type="number" [(ngModel)]="newExpense.amount" class="form-control" placeholder="0.00">
          </div>
          <div class="form-group">
            <label>Category</label>
            <select [(ngModel)]="newExpense.category" class="form-control">
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description (Optional)</label>
            <input type="text" [(ngModel)]="newExpense.description" class="form-control" placeholder="e.g. Coffee (Optional)">
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="newExpense.date" class="form-control">
          </div>
        </div>
        <button (click)="addExpense()" class="btn btn-primary mt-16" style="width: auto; padding: 12px 32px;">
          Add Expense
        </button>
      </div>

      <!-- Expense List -->
      <div class="table-wrap">
        <div class="table-header">
          <h3>Transaction History</h3>
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
              <tr *ngFor="let e of sortedExpenses()">
                <td>{{ e.date | date:'dd MMM yyyy' }}</td>
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
            <div class="empty-icon">🗂️</div>
            <p>No transactions found.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .page { animation: fadeSlide 300ms ease forwards; }
    .page-header { margin-bottom: 32px; }
    .page-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--text-100); }
    .page-subtitle { color: var(--text-300); margin-top: 6px; }

    .card { background: var(--bg-glass); border-radius: var(--radius); border: 1px solid var(--border); padding: 24px; }
    .card-title { font-size: 0.9rem; font-weight: 700; text-transform: uppercase; color: var(--text-200); margin-bottom: 20px; }

    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .form-group label { display: block; font-size: 0.82rem; color: var(--text-200); margin-bottom: 8px; }
    .form-control {
      width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 10px 14px; color: var(--text-100); outline: none;
    }

    .table-wrap { background: var(--bg-glass); border-radius: var(--radius); border: 1px solid var(--border); }
    .table-header { padding: 20px 24px; border-bottom: 1px solid var(--border); }
    .expense-table { width: 100%; border-collapse: collapse; }
    .expense-table th { padding: 12px 24px; text-align: left; font-size: 0.75rem; color: var(--text-400); background: rgba(255,255,255,0.02); }
    .expense-table td { padding: 14px 24px; font-size: 0.88rem; color: var(--text-200); border-bottom: 1px solid rgba(255,255,255,0.03); }
    .amount-cell { font-family: var(--font-mono); font-weight: 600; color: var(--accent); }
    .category-badge { padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; background: rgba(0,200,150,0.15); color: var(--accent); }
    .mb-24 { margin-bottom: 24px; }
    .mt-16 { margin-top: 16px; }
  `]
})
export class TransactionsComponent {
  expenseService = inject(ExpenseService);
  categories = this.expenseService.categories();

  newExpense = {
    amount: 0,
    category: 'Food & Dining',
    description: '',
    date: new Date().toISOString().split('T')[0]
  };

  addExpense() {
    if (this.newExpense.amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    const finalExpense = {
      ...this.newExpense,
      description: this.newExpense.description || 'Unspecified',
      source: 'manual' as const
    };
    this.expenseService.addExpense(finalExpense);
    alert('Expense added successfully!');
    // Reset form
    this.newExpense = {
      amount: 0,
      category: 'Food & Dining',
      description: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  sortedExpenses() {
    return [...this.expenseService.expenses()].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  deleteExpense(id: string) {
    this.expenseService.deleteExpense(id);
  }
}
