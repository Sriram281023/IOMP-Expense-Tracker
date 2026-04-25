import { TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics';
import { ExpenseService } from '../../core/services/expense.service';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let expenseService: ExpenseService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent]
    }).compileComponents();

    expenseService = TestBed.inject(ExpenseService);
    const fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return "None" for top category with no expenses', () => {
    expect(component.topCategory()).toBe('None');
  });

  it('should identify top spending category', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });
    await expenseService.addExpense({ amount: 500, category: 'Shopping', description: 'B', date: '2026-04-25', source: 'manual' });
    await expenseService.addExpense({ amount: 200, category: 'Food & Dining', description: 'C', date: '2026-04-25', source: 'manual' });

    // Food & Dining = 300, Shopping = 500 → Shopping wins
    expect(component.topCategory()).toBe('Shopping');
  });

  it('should calculate monthly average', async () => {
    await expenseService.addExpense({ amount: 300, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });
    await expenseService.addExpense({ amount: 300, category: 'Food & Dining', description: 'B', date: '2026-03-15', source: 'manual' });

    // 600 total across 2 months = 300 avg
    expect(component.monthlyAverage()).toBe(300);
  });

  it('should calculate average per transaction', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });
    await expenseService.addExpense({ amount: 300, category: 'Shopping', description: 'B', date: '2026-04-25', source: 'manual' });

    // 400 total / 2 = 200 avg
    expect(component.avgTransaction()).toBe(200);
  });

  it('should return 0 for avgTransaction with no expenses', () => {
    expect(component.avgTransaction()).toBe(0);
  });
});
