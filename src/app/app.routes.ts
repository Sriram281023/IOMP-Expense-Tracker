import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { DashboardComponent } from './features/dashboard/dashboard';
import { TransactionsComponent } from './features/transactions/transactions';
import { AnalyticsComponent } from './features/analytics/analytics';
import { SettingsComponent } from './features/settings/settings';
import { ImportComponent } from './features/import/import';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'expenses', component: TransactionsComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'import', component: ImportComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
