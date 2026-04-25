import { computed, Injectable, signal, effect } from '@angular/core';
import { Expense } from '../models/models';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expensesSignal = signal<Expense[]>([]);

  categories = signal<string[]>([
    'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 
    'Entertainment', 'Healthcare', 'Salary', 'Education', 'Travel', 
    'Groceries', 'Rent', 'Investments', 'Other'
  ]);

  selectedCurrency = signal<string>(this.loadCurrency());
  currencySymbol = computed(() => this.getSymbol(this.selectedCurrency()));

  expenses = computed(() => this.expensesSignal());

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {
    // Automatically load expenses when user logs in
    effect(() => {
      const user = this.auth.user();
      if (user) {
        // Also update currency if user profile has one saved
        if (user.currency) {
          this.selectedCurrency.set(user.currency);
          localStorage.setItem('app_currency', user.currency);
        }
        this.loadExpenses();
      } else {
        this.expensesSignal.set([]);
      }
    });
  }

  private loadCurrency(): string {
    return localStorage.getItem('app_currency') || 'INR';
  }

  async setCurrency(code: string) {
    localStorage.setItem('app_currency', code);
    this.selectedCurrency.set(code);
    
    // Also save to user profile if logged in
    const user = this.auth.user();
    if (user) {
      await this.supabase.client.from('profiles').update({ currency: code }).eq('id', user.id);
    }
  }

  public getSymbol(code: string): string {
    const symbols: { [key: string]: string } = {
      'INR':'₹','USD':'$','EUR':'€','GBP':'£','JPY':'¥','CNY':'¥','RUB':'₽','AUD':'A$','CAD':'C$','CHF':'Fr','SGD':'S$','HKD':'HK$','NOK':'kr','SEK':'kr','DKK':'kr','MYR':'RM','IDR':'Rp','THB':'฿','KRW':'₩','AED':'د.إ','SAR':'﷼','BRL':'R$','MXN':'$','ZAR':'R','NZD':'NZ$','PKR':'₨','BDT':'৳','LKR':'Rs','NPR':'Rs','TRY':'₺','PLN':'zł','CZK':'Kč','HUF':'Ft','RON':'lei','PHP':'₱','VND':'₫','EGP':'£','NGN':'₦','KES':'KSh','GHS':'₵'
    };
    return symbols[code] || '₹';
  }

  getAvailableCurrencies() {
    return [
      {code:'INR',name:'Indian Rupee'},{code:'USD',name:'US Dollar'},{code:'EUR',name:'Euro'},{code:'GBP',name:'British Pound'},{code:'JPY',name:'Japanese Yen'},{code:'CNY',name:'Chinese Yuan'},{code:'RUB',name:'Russian Ruble'},{code:'AUD',name:'Australian Dollar'},{code:'CAD',name:'Canadian Dollar'},{code:'CHF',name:'Swiss Franc'},{code:'SGD',name:'Singapore Dollar'},{code:'HKD',name:'Hong Kong Dollar'},{code:'NOK',name:'Norwegian Krone'},{code:'SEK',name:'Swedish Krona'},{code:'DKK',name:'Danish Krone'},{code:'MYR',name:'Malaysian Ringgit'},{code:'IDR',name:'Indonesian Rupiah'},{code:'THB',name:'Thai Baht'},{code:'KRW',name:'South Korean Won'},{code:'AED',name:'UAE Dirham'},{code:'SAR',name:'Saudi Riyal'},{code:'BRL',name:'Brazilian Real'},{code:'MXN',name:'Mexican Peso'},{code:'ZAR',name:'South African Rand'},{code:'NZD',name:'New Zealand Dollar'},{code:'PKR',name:'Pakistani Rupee'},{code:'BDT',name:'Bangladeshi Taka'},{code:'LKR',name:'Sri Lankan Rupee'},{code:'NPR',name:'Nepalese Rupee'},{code:'TRY',name:'Turkish Lira'},{code:'PLN',name:'Polish Zloty'},{code:'CZK',name:'Czech Koruna'},{code:'HUF',name:'Hungarian Forint'},{code:'RON',name:'Romanian Leu'},{code:'PHP',name:'Philippine Peso'},{code:'VND',name:'Vietnamese Dong'},{code:'EGP',name:'Egyptian Pound'},{code:'NGN',name:'Nigerian Naira'},{code:'KES',name:'Kenyan Shilling'},{code:'GHS',name:'Ghanaian Cedi'}
    ];
  }

  totalSpent = computed(() =>
    this.expensesSignal().reduce((sum, e) => sum + Number(e.amount), 0)
  );

  async loadExpenses() {
    const user = this.auth.user();
    if (!user) return;
    
    const { data, error } = await this.supabase.client
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (data && !error) {
      // Map created_at to createdAt for the frontend model
      const mapped = data.map(d => ({
        ...d,
        createdAt: d.created_at
      }));
      this.expensesSignal.set(mapped);
    }
  }

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
    const user = this.auth.user();
    if (!user) return;
    
    const { data, error } = await this.supabase.client
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
        source: expense.source
      })
      .select()
      .single();
      
    if (data && !error) {
      const newExpense: Expense = { ...data, createdAt: data.created_at };
      this.expensesSignal.update(ex => {
        const updated = [newExpense, ...ex];
        return updated.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    }
  }

  async updateExpense(id: string, patch: Partial<Expense>) {
    const { error } = await this.supabase.client
      .from('expenses')
      .update(patch)
      .eq('id', id);
      
    if (!error) {
      this.expensesSignal.update(ex => ex.map(e => e.id === id ? { ...e, ...patch } : e));
    }
  }

  async deleteExpense(id: string) {
    const { error } = await this.supabase.client
      .from('expenses')
      .delete()
      .eq('id', id);
      
    if (!error) {
      this.expensesSignal.update(ex => ex.filter(e => e.id !== id));
    }
  }

  getExpensesByMonth(year: number, month: number) {
    return computed(() =>
      this.expensesSignal().filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
    );
  }

  async clearAll() {
    const user = this.auth.user();
    if (!user) return;
    
    const { error } = await this.supabase.client
      .from('expenses')
      .delete()
      .eq('user_id', user.id);
      
    if (!error) {
      this.expensesSignal.set([]);
    }
  }
}
