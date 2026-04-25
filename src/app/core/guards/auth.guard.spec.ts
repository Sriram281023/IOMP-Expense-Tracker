import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect to /login when not authenticated', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access when authenticated', async () => {
    await authService.register('Test', 'test@test.com', 'pass');

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(true);
  });
});
