import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockSupabaseClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => {},
      signUp: () => Promise.resolve({ 
        data: { user: { id: '1', email: 'test@example.com', user_metadata: { name: 'Test User' } } }, 
        error: null 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { user: { id: '1', email: 'test@example.com' } }, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    }),
    rpc: () => Promise.resolve({ error: null })
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { 
          provide: SupabaseService, 
          useValue: { client: mockSupabaseClient } 
        }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    mockSupabaseClient.auth.signInWithPassword = () => Promise.resolve({ 
      data: { user: { id: '1', email: 'test@example.com' } }, 
      error: null 
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no user logged in', () => {
    expect(service.user()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should register a new user', async () => {
    const result = await service.register('Test User', 'test@example.com', 'password123');

    expect(result.user).toBeTruthy();
    expect(result.user?.user_metadata?.['name']).toBe('Test User');
    expect(result.user?.email).toBe('test@example.com');
  });

  it('should login with valid credentials', async () => {
    const result = await service.login('test@example.com', 'password123');
    expect(result.user?.email).toBe('test@example.com');
  });

  it('should throw error on invalid login', async () => {
    mockSupabaseClient.auth.signInWithPassword = () => Promise.resolve({
      data: { user: null, session: null } as any,
      error: new Error('Invalid email or password') as any
    });

    await expect(service.login('wrong@example.com', 'password123'))
      .rejects.toThrow('Invalid email or password');
  });

  it('should logout successfully', async () => {
    // Pre-set user
    (service as any).userSignal.set({ id: '1', name: 'Test User', email: 'test@example.com' });
    expect(service.isLoggedIn()).toBe(true);

    await service.logout();
    
    expect(service.isLoggedIn()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('should update profile name', async () => {
    (service as any).userSignal.set({ id: '1', name: 'Old Name', email: 'test@example.com' });
    await service.updateProfile('New Name');
    expect(service.user()?.name).toBe('New Name');
  });

  it('should update password', async () => {
    await expect(service.updatePassword('newpass')).resolves.toBeUndefined();
  });
});
