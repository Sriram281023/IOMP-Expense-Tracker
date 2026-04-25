import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SettingsComponent } from './settings';
import { ExpenseService } from '../../core/services/expense.service';
import { AuthService } from '../../core/services/auth.service';
import { vi } from 'vitest';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let expenseService: ExpenseService;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SettingsComponent, RouterTestingModule]
    }).compileComponents();

    expenseService = TestBed.inject(ExpenseService);
    authService = TestBed.inject(AuthService);
    const fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save currency preference', () => {
    component.selectedCurrency = 'USD';
    component.saveCurrency();

    expect(expenseService.selectedCurrency()).toBe('USD');
    expect(expenseService.currencySymbol()).toBe('$');
  });

  it('should update password when passwords match', async () => {
    await authService.register('Test', 'test@test.com', 'oldpass');

    component.newPassword = 'newpass123';
    component.confirmPassword = 'newpass123';

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.updatePassword();

    expect(alertSpy).toHaveBeenCalled();
    expect(component.newPassword).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  it('should not update password when passwords differ', () => {
    component.newPassword = 'pass1';
    component.confirmPassword = 'pass2';

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.updatePassword();

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('should clear all data', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });
    await expenseService.addExpense({ amount: 200, category: 'Shopping', description: 'B', date: '2026-04-25', source: 'manual' });

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.clearData();

    expect(expenseService.expenses().length).toBe(0);
  });

  it('should not clear data when user cancels confirmation', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.clearData();

    expect(expenseService.expenses().length).toBe(1);
  });

  it('should export data as JSON', async () => {
    await expenseService.addExpense({ amount: 100, category: 'Food & Dining', description: 'A', date: '2026-04-25', source: 'manual' });

    const mockUrl = 'blob:test';
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      set href(val: string) {},
      set download(val: string) {},
      click: clickSpy
    } as any);

    component.exportData();
    expect(clickSpy).toHaveBeenCalled();
  });
});
