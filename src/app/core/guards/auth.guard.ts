import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // Fast check: if the signal already has the user, allow
  if (authService.isLoggedIn()) {
    return true;
  }

  // Slower check: ask Supabase directly (handles page refresh & login race conditions)
  const { data: { session } } = await supabase.client.auth.getSession();
  
  if (session) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
