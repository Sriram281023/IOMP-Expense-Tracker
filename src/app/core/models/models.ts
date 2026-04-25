export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  currency: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  source: 'manual' | 'import';
  createdAt: string;
}

export interface Category {
  name: string;
  color: string;
}
