import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon">💰</div>
          <h1>Expense Tracker</h1>
        </div>
        <p class="auth-subtitle">{{ isLogin ? 'Track every rupee, own your finances' : 'Create Your Account' }}</p>

        <div *ngIf="error" class="alert alert-error">⚠️ {{ error }}</div>

        <div class="form-container">
          <div class="form-group" *ngIf="!isLogin">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="name" class="form-control" placeholder="Enter your name">
          </div>

          <div class="form-group" [style.margin-bottom.px]="20">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" class="form-control" autocomplete="off" placeholder="Enter your email">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" class="form-control" autocomplete="new-password" placeholder="Enter your password">
          </div>

          <div class="form-group" *ngIf="!isLogin">
            <label>Confirm Password</label>
            <input type="password" [(ngModel)]="confirmPassword" class="form-control" autocomplete="new-password" placeholder="Confirm your password">
          </div>

          <button (click)="onSubmit()" class="btn btn-primary" style="margin-top: 10px;">
            {{ isLogin ? 'Login' : 'Create Account' }}
          </button>

          <div class="auth-link">
            {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
            <a (click)="isLogin = !isLogin">{{ isLogin ? 'Sign up' : 'Login' }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .auth-card {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 48px 40px;
      width: 100%; max-width: 440px;
      box-shadow: var(--shadow);
    }
    .auth-logo {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 8px; justify-content: center;
    }
    .auth-logo .logo-icon {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, var(--accent), #00A87A);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      box-shadow: var(--shadow-accent);
    }
    .auth-logo h1 {
      font-family: var(--font-display);
      font-size: 1.6rem; font-weight: 700;
    }
    .auth-subtitle {
      text-align: center; color: var(--text-300);
      font-size: 0.9rem; margin-bottom: 32px;
    }
    .form-group { margin-bottom: 20px; }
    .form-group label {
      display: block; font-size: 0.82rem; font-weight: 500;
      color: var(--text-200); margin-bottom: 8px;
    }
    .form-control {
      width: 100%; background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 12px 16px; color: var(--text-100);
      font-family: var(--font-body); font-size: 0.95rem; outline: none;
    }
    .form-control:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent) 0%, #00A87A 100%);
      color: #000; width: 100%; padding: 12px; border: none;
      border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;
    }
    .auth-link {
      text-align: center; margin-top: 20px; color: var(--text-300); font-size: 0.88rem;
    }
    .auth-link a { color: var(--accent); cursor: pointer; text-decoration: none; font-weight: 500; }
    .alert {
      padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem;
    }
    .alert-error { background: var(--danger-dim); border: 1px solid rgba(255,94,120,0.3); color: var(--danger); }
  `]
})
export class AuthComponent {
  isLogin = true;
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';

  constructor(private router: Router, private authService: AuthService) {}

  async onSubmit() {
    this.error = '';
    
    try {
      if (this.isLogin) {
        // Login logic
        await this.authService.login(this.email, this.password);
        this.router.navigate(['/dashboard']);
      } else {
        // Signup logic
        if (!this.name || !this.email || !this.password || !this.confirmPassword) {
          this.error = 'Please fill in all fields.';
          return;
        }

        if (this.password !== this.confirmPassword) {
          this.error = 'Passwords do not match.';
          return;
        }
        
        const data = await this.authService.register(this.name, this.email, this.password);
        
        if (data.session) {
          // Auto logged in
          this.router.navigate(['/dashboard']);
        } else {
          // Email confirmation required
          alert('Signup successful! Please check your email to confirm your account, then log in.');
          this.isLogin = true;
          this.password = '';
          this.confirmPassword = '';
        }
      }
    } catch (err: any) {
      this.error = err.message || 'An error occurred during authentication.';
    }
  }
}
