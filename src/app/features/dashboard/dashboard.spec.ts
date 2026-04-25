import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard';
import { ExpenseService } from '../../core/services/expense.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let expenseService: ExpenseService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule]
    }).compileComponents();

    expenseService = TestBed.inject(ExpenseService);
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current month name', () => {
    expect(component.currentMonthName).toBeTruthy();
    expect(component.currentMonthName.length).toBeGreaterThan(0);
  });

  it('should return 0 for current month total with no expenses', () => {
    expect(component.currentMonthTotal()).toBe(0);
  });

  it('should calculate current month total correctly', async () => {
    const today = new Date().toISOString().split('T')[0];
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: today, source: 'manual' });
    await expenseService.addExpense({ amount: 200, category: 'Shopping', description: 'B', date: today, source: 'manual' });

    expect(component.currentMonthTotal()).toBe(300);
  });

  it('should return recent expenses sorted by date (newest first)', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'Old', date: '2026-01-01', source: 'manual' });
    await expenseService.addExpense({ amount: 200, category: 'Shopping', description: 'New', date: '2026-04-25', source: 'manual' });

    const recent = component.recentExpenses();
    expect(recent[0].description).toBe('New');
    expect(recent[1].description).toBe('Old');
  });

  it('should limit recent expenses to 5', async () => {
    for (let i = 0; i < 10; i++) {
      await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: `Expense ${i}`, date: '2026-04-25', source: 'manual' });
    }

    expect(component.recentExpenses().length).toBe(5);
  });

  it('should delete an expense', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'ToDelete', date: '2026-04-25', source: 'manual' });
    const id = expenseService.expenses()[0].id;

    component.deleteExpense(id);
    expect(expenseService.expenses().length).toBe(0);
  });
});
