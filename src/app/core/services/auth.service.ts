import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<UserProfile | null>(null);

  // Expose as a computed value for template bindings.
  user = computed(() => this.userSignal());

  constructor(private supabase: SupabaseService, private router: Router) {
    // Check initial session
    this.supabase.client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        this.fetchProfile(session.user);
      }
    });

    // Listen for auth changes
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.fetchProfile(session.user);

        // Check if the user just arrived from an email confirmation link
        if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
          // Check if we are awaiting confirmation from a previous signup
          if (localStorage.getItem('awaiting_confirmation') === 'true') {
            localStorage.removeItem('awaiting_confirmation');
            setTimeout(() => {
              alert('Email confirmed successfully! You are now logged in.');
              this.router.navigate(['/dashboard']);
            }, 100);
          } else {
            // Fallback for normal logins or confirmations where localStorage wasn't set
            // If the user lands on the root or login page and is signed in, redirect them
            if (this.router.url === '/login' || this.router.url === '/') {
              this.router.navigate(['/dashboard']);
            }
          }
        }
      } else {
        this.userSignal.set(null);
      }
    });
  }

  private async fetchProfile(authUser: any) {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (data && !error) {
      this.userSignal.set({
        id: authUser.id,
        email: authUser.email,
        name: data.name || authUser.user_metadata?.name || '',
        avatar: data.avatar || authUser.user_metadata?.name?.[0]?.toUpperCase() || 'U',
        currency: data.currency
      });
    } else {
      // Fallback if profile not found yet
      this.userSignal.set({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || '',
        avatar: authUser.user_metadata?.name?.[0]?.toUpperCase() || 'U'
      });
    }
  }

  async register(name: string, email: string, password?: string) {
    if (!password) throw new Error('Password is required');
    
    // Set a flag to show the confirmation alert when they return
    if (typeof window !== 'undefined') {
      localStorage.setItem('awaiting_confirmation', 'true');
    }
    
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: { name } // Pass name to user_metadata
      }
    });
    
    if (error) throw error;
    return data;
  }

  async login(email: string, password?: string) {
    if (!password) throw new Error('Password is required');
    
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.supabase.client.auth.signOut();
    this.userSignal.set(null);
  }

  async updateProfile(name: string) {
    const currentUser = this.userSignal();
    if (!currentUser) return;

    // Update profiles table
    const { error } = await this.supabase.client
      .from('profiles')
      .update({ name })
      .eq('id', currentUser.id);

    if (error) throw error;

    // Update auth metadata
    await this.supabase.client.auth.updateUser({
      data: { name }
    });

    this.userSignal.update(u => u ? { ...u, name } : null);
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.client.auth.updateUser({ password });
    if (error) throw error;
  }

  async deleteAccount() {
    // Calls the RPC function 'delete_user' defined in Supabase
    const { error } = await this.supabase.client.rpc('delete_user');
    if (error) throw error;
    
    await this.logout();
  }

  isLoggedIn() {
    return this.userSignal() !== null;
  }
}
