import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty expenses', () => {
    expect(service.expenses()).toEqual([]);
    expect(service.totalSpent()).toBe(0);
  });

  it('should add an expense', async () => {
    await service.addExpense({
      amount: 500,
      category: 'Food & Dining',
      description: 'Lunch',
      date: '2026-04-25',
      source: 'manual'
    });

    expect(service.expenses().length).toBe(1);
    expect(service.expenses()[0].amount).toBe(500);
    expect(service.expenses()[0].category).toBe('Food & Dining');
    expect(service.expenses()[0].description).toBe('Lunch');
    expect(service.expenses()[0].id).toBeTruthy();
    expect(service.expenses()[0].createdAt).toBeTruthy();
  });

  it('should calculate totalSpent correctly', async () => {
    await service.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });
    await service.addExpense({ amount: 250, category: 'Transport', description: 'B', date: '2026-04-25', source: 'manual' });
    await service.addExpense({ amount: 150, category: 'Shopping', description: 'C', date: '2026-04-25', source: 'manual' });

    expect(service.totalSpent()).toBe(500);
  });

  it('should delete an expense', async () => {
    await service.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });
    const id = service.expenses()[0].id;

    await service.deleteExpense(id);
    expect(service.expenses().length).toBe(0);
    expect(service.totalSpent()).toBe(0);
  });

  it('should update an expense', async () => {
    await service.addExpense({ amount: 100, category: 'Food & Dining', description: 'Old', date: '2026-04-25', source: 'manual' });
    const id = service.expenses()[0].id;

    await service.updateExpense(id, { amount: 200, description: 'Updated' });

    expect(service.expenses()[0].amount).toBe(200);
    expect(service.expenses()[0].description).toBe('Updated');
    expect(service.expenses()[0].category).toBe('Food & Dining'); // unchanged
  });

  it('should clear all expenses', async () => {
    await service.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });
    await service.addExpense({ amount: 200, category: 'Shopping', description: 'B', date: '2026-04-25', source: 'manual' });

    service.clearAll();
    expect(service.expenses().length).toBe(0);
    expect(service.totalSpent()).toBe(0);
    expect(localStorage.getItem('app_expenses')).toBeNull();
  });

  it('should persist expenses to localStorage', async () => {
    await service.addExpense({ amount: 300, category: 'Bills & Utilities', description: 'Electric', date: '2026-04-25', source: 'manual' });

    const stored = JSON.parse(localStorage.getItem('app_expenses') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].amount).toBe(300);
  });

  // Currency tests
  it('should default to INR currency', () => {
    expect(service.selectedCurrency()).toBe('INR');
    expect(service.currencySymbol()).toBe('₹');
  });

  it('should change currency', () => {
    service.setCurrency('USD');
    expect(service.selectedCurrency()).toBe('USD');
    expect(service.currencySymbol()).toBe('$');
    expect(localStorage.getItem('app_currency')).toBe('USD');
  });

  it('should return correct symbols for various currencies', () => {
    expect(service.getSymbol('USD')).toBe('$');
    expect(service.getSymbol('EUR')).toBe('€');
    expect(service.getSymbol('GBP')).toBe('£');
    expect(service.getSymbol('JPY')).toBe('¥');
    expect(service.getSymbol('INR')).toBe('₹');
  });

  it('should have predefined categories', () => {
    const categories = service.categories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain('Food & Dining');
    expect(categories).toContain('Transportation');
    expect(categories).toContain('Shopping');
  });

  it('should have available currencies list', () => {
    const currencies = service.getAvailableCurrencies();
    expect(currencies.length).toBeGreaterThan(0);
    expect(currencies.find(c => c.code === 'INR')).toBeTruthy();
    expect(currencies.find(c => c.code === 'USD')).toBeTruthy();
  });

  it('should prepend new expenses (newest first)', async () => {
    await service.addExpense({ amount: 100, category: 'Food & Dining', description: 'First', date: '2026-04-25', source: 'manual' });
    await service.addExpense({ amount: 200, category: 'Shopping', description: 'Second', date: '2026-04-25', source: 'manual' });

    expect(service.expenses()[0].description).toBe('Second');
    expect(service.expenses()[1].description).toBe('First');
  });
});
