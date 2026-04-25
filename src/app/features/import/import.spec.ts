import { TestBed } from '@angular/core/testing';
import { ImportComponent } from './import';
import { ExpenseService } from '../../core/services/expense.service';
import { vi } from 'vitest';

describe('ImportComponent', () => {
  let component: ImportComponent;
  let expenseService: ExpenseService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ImportComponent]
    }).compileComponents();

    expenseService = TestBed.inject(ExpenseService);
    const fixture = TestBed.createComponent(ImportComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with no file selected', () => {
    expect(component.fileName).toBe('');
    expect(component.fileContent).toBe('');
  });

  it('should alert when processing with no file', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.processImport();
    expect(alertSpy).toHaveBeenCalledWith('Please select a file first.');
  });

  it('should process CSV content correctly', () => {
    component.fileName = 'test.csv';
    component.fileContent = 'date,description,amount,category\n2026-04-08,Swiggy Food,450.50,Food & Dining\n2026-04-07,Uber Ride,125.00,Transportation';

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.processImport();

    expect(expenseService.expenses().length).toBe(2);
    expect(expenseService.expenses().find(e => e.description === 'Swiggy Food')).toBeTruthy();
    expect(expenseService.expenses().find(e => e.amount === 125)).toBeTruthy();
  });

  it('should process JSON content correctly', () => {
    component.fileName = 'test.json';
    component.fileContent = JSON.stringify([
      { date: '2026-04-08', description: 'Coffee', amount: 150, category: 'Food & Dining' },
      { date: '2026-04-07', description: 'Bus', amount: 50, category: 'Transportation' }
    ]);

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.processImport();

    expect(expenseService.expenses().length).toBe(2);
  });

  it('should handle CSV with missing category (defaults to "Other")', () => {
    component.fileName = 'test.csv';
    component.fileContent = 'date,description,amount\n2026-04-08,Test,100';

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.processImport();

    expect(expenseService.expenses()[0].category).toBe('Other');
  });

  it('should handle JSON import with missing fields gracefully', () => {
    component.fileName = 'test.json';
    component.fileContent = JSON.stringify([
      { amount: 100 }
    ]);

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.processImport();

    expect(expenseService.expenses().length).toBe(1);
    expect(expenseService.expenses()[0].category).toBe('Other');
    expect(expenseService.expenses()[0].description).toBe('Imported Transaction');
  });

  it('should mark imported expenses with source "import"', () => {
    component.fileName = 'test.json';
    component.fileContent = JSON.stringify([
      { date: '2026-04-08', description: 'Test', amount: 100, category: 'Food & Dining' }
    ]);

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.processImport();

    expect(expenseService.expenses()[0].source).toBe('import');
  });

  it('should handle malformed files gracefully', () => {
    component.fileName = 'test.json';
    component.fileContent = 'not valid json {{{';

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    component.processImport();

    expect(alertSpy).toHaveBeenCalledWith('Error parsing file. Please check the format.');
    expect(consoleSpy).toHaveBeenCalled();
  });
});
