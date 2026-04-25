import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TransactionsComponent } from './transactions';
import { ExpenseService } from '../../core/services/expense.service';
import { vi } from 'vitest';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let expenseService: ExpenseService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TransactionsComponent, RouterTestingModule]
    }).compileComponents();

    expenseService = TestBed.inject(ExpenseService);
    const fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default new expense values', () => {
    expect(component.newExpense.amount).toBe(0);
    expect(component.newExpense.category).toBe('Food & Dining');
    expect(component.newExpense.date).toBeTruthy();
  });

  it('should have categories from service', () => {
    expect(component.categories.length).toBeGreaterThan(0);
    expect(component.categories).toContain('Food & Dining');
  });

  it('should add a valid expense', async () => {
    component.newExpense = {
      amount: 500,
      category: 'Shopping',
      description: 'Test purchase',
      date: '2026-04-25'
    };

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.addExpense();

    expect(expenseService.expenses().length).toBe(1);
    expect(expenseService.expenses()[0].amount).toBe(500);
    expect(alertSpy).toHaveBeenCalledWith('Expense added successfully!');
  });

  it('should reject expense with zero amount', () => {
    component.newExpense.amount = 0;
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.addExpense();

    expect(expenseService.expenses().length).toBe(0);
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid amount.');
  });

  it('should reset form after adding expense', () => {
    component.newExpense = {
      amount: 500,
      category: 'Shopping',
      description: 'Test',
      date: '2026-04-25'
    };

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.addExpense();

    expect(component.newExpense.amount).toBe(0);
    expect(component.newExpense.description).toBe('');
  });

  it('should default description to "Unspecified" when empty', () => {
    component.newExpense = {
      amount: 100,
      category: 'Food & Dining',
      description: '',
      date: '2026-04-25'
    };

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.addExpense();

    expect(expenseService.expenses()[0].description).toBe('Unspecified');
  });

  it('should return sorted expenses (newest first)', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'Old', date: '2026-01-01', source: 'manual' });
    await expenseService.addExpense({ amount: 200, category: 'Shopping', description: 'New', date: '2026-04-25', source: 'manual' });

    const sorted = component.sortedExpenses();
    expect(sorted[0].description).toBe('New');
  });

  it('should delete an expense', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'Test', date: '2026-04-25', source: 'manual' });
    const id = expenseService.expenses()[0].id;

    component.deleteExpense(id);
    expect(expenseService.expenses().length).toBe(0);
  });
});
