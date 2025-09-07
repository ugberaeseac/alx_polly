import { signUp, signIn, signOut } from '@/lib/auth-actions';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

// Mock the Supabase client and next/navigation
const mockAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
};

const mockSupabaseClientInstance = {
  auth: mockAuth,
};

jest.mock('@/lib/supabase/server-client', () => ({
  createServerSupabaseClient: jest.fn(() => mockSupabaseClientInstance),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Auth Actions', () => {
  let mockSupabaseClient: typeof mockSupabaseClientInstance;

  beforeEach(() => {
    (createServerSupabaseClient as jest.Mock).mockClear();
    mockAuth.signUp.mockClear();
    mockAuth.signInWithPassword.mockClear();
    mockAuth.signOut.mockClear();
    (redirect as jest.Mock).mockClear();

    mockSupabaseClient = createServerSupabaseClient();
  });

  describe('signUp', () => {
    it('should sign up a user and redirect to login on success', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({ data: { user: { id: '123' } }, error: null });

      await signUp(formData);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
      });
      expect(redirect).toHaveBeenCalledWith('/auth/login?message=Check email to verify account');
    });

    it('should redirect to signup with error message on failure', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Signup failed' } });

      await signUp(formData);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith('/auth/signup?message=Could not authenticate user');
    });
  });

  describe('signIn', () => {
    it('should sign in a user and redirect to polls on success', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({ data: { user: { id: '123' } }, error: null });

      await signIn(formData);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(redirect).toHaveBeenCalledWith('/polls');
    });

    it('should redirect to login with error message on failure', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Login failed' } });

      await signIn(formData);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith('/auth/login?message=Could not authenticate user');
    });
  });

  describe('signOut', () => {
    it('should sign out a user and redirect to login', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });

      await signOut();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should log error if signOut fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: { message: 'Sign out failed' } });

      await signOut();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', { message: 'Sign out failed' });
      expect(redirect).toHaveBeenCalledWith('/auth/login');

      consoleErrorSpy.mockRestore();
    });
  });
});