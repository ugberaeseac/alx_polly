import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(() => ({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    delete: vi.fn(),
  })),
};

export const createServerSupabaseClient = jest.fn(() => mockSupabaseClient);