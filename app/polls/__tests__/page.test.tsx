import { createServerSupabaseClient } from '@/app/utils/supabase/server';
import PollsPage from '@/app/polls/page';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';

// Mock the Supabase client and next/navigation
jest.mock('@/app/utils/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
    },
    from: jest.fn(),
  }));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Polls Page', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockSupabaseClient = createServerSupabaseClient();
    jest.clearAllMocks();
  });

  it('should redirect to login if user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

    await PollsPage();

    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('should display polls if user is authenticated and polls exist', async () => {
    const mockUser = { id: 'user-123' };
    const mockPolls = [
      { id: 'poll-1', title: 'Test Poll 1', description: 'Desc 1' },
      { id: 'poll-2', title: 'Test Poll 2', description: 'Desc 2' },
    ];

    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn().mockResolvedValueOnce({ data: mockPolls, error: null }),
      })),
    });

    render(await PollsPage());

    expect(screen.getByText('Test Poll 1')).toBeInTheDocument();
    expect(screen.getByText('Test Poll 2')).toBeInTheDocument();
  });

  it('should display message if no polls exist', async () => {
    const mockUser = { id: 'user-123' };

    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
      })),
    });

    render(await PollsPage());

    expect(screen.getByText('No polls yet. Create one!')).toBeInTheDocument();
  });

  it('should display error message if fetching polls fails', async () => {
    const mockUser = { id: 'user-123' };

    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'Failed to fetch polls' } }),
      })),
    });

    render(await PollsPage());

    expect(screen.getByText('Error fetching polls.')).toBeInTheDocument();
  });
});