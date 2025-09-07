import { createPoll, submitVoteAction, deletePoll } from '@/lib/actions';
import { createServerSupabaseClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';

// Mock the Supabase client and next/navigation
jest.mock('@/app/utils/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
      select: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Poll Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockSupabaseClient = createServerSupabaseClient();
    jest.clearAllMocks();
  });

  describe('createPoll', () => {
    it('should create a poll and options and redirect', async () => {
      const formData = new FormData();
      formData.append('title', 'Test Poll');
      formData.append('description', 'This is a test poll.');
      formData.append('option', 'Option 1');
      formData.append('option', 'Option 2');

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ data: { id: 'poll-123' }, error: null }),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: { id: 'poll-123' }, error: null }),
      });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
      });

      await createPoll(formData);

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('polls');
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        title: 'Test Poll',
        description: 'This is a test poll.',
        user_id: 'user-123',
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('options');
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith([
        { poll_id: 'poll-123', option_text: 'Option 1' },
        { poll_id: 'poll-123', option_text: 'Option 2' },
      ]);
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('should throw error if user not authenticated', async () => {
      const formData = new FormData();
      formData.append('title', 'Test Poll');

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

      await expect(createPoll(formData)).rejects.toThrow('User not authenticated');
    });

    it('should throw error if poll creation fails', async () => {
      const formData = new FormData();
      formData.append('title', 'Test Poll');

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'Poll creation failed' } }),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'Poll creation failed' } }),
      });

      await expect(createPoll(formData)).rejects.toThrow('Failed to create poll');
    });

    it('should throw error if option creation fails', async () => {
      const formData = new FormData();
      formData.append('title', 'Test Poll');
      formData.append('option', 'Option 1');

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ data: { id: 'poll-123' }, error: null }),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: { id: 'poll-123' }, error: null }),
      });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'Option creation failed' } }),
      });

      await expect(createPoll(formData)).rejects.toThrow('Failed to create poll options');
    });
  });

  describe('submitVoteAction', () => {
    it('should submit a vote for an authenticated user', async () => {
      const formData = new FormData();
      formData.append('pollId', 'poll-123');
      formData.append('optionId', 'option-456');

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }), // No existing vote
      });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ error: null }),
      });

      const result = await submitVoteAction(formData);

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('votes');
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        poll_id: 'poll-123',
        option_id: 'option-456',
        user_id: 'user-123',
      });
      expect(result).toEqual({ success: true, message: 'Vote submitted successfully!' });
    });

    it('should return error if unauthenticated user attempts to vote', async () => {
      const formData = new FormData();
      formData.append('pollId', 'poll-123');
      formData.append('optionId', 'option-456');

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

      const result = await submitVoteAction(formData);

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ error: 'You must be logged in to vote.' });
    });

    it('should return error if user has already voted', async () => {
      const formData = new FormData();
      formData.append('pollId', 'poll-123');
      formData.append('optionId', 'option-456');

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: { id: 'vote-789' }, error: null }), // Existing vote
      });

      const result = await submitVoteAction(formData);

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ error: 'You have already voted on this poll.' });
    });

    it('should return error if vote submission fails', async () => {
      const formData = new FormData();
      formData.append('pollId', 'poll-123');
      formData.append('optionId', 'option-456');

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }),
      });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ error: { message: 'Vote submission failed' } }),
      });

      const result = await submitVoteAction(formData);

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ error: 'Vote submission failed' });
    });
  });

  describe('deletePoll', () => {
    it('should delete a poll and its options and redirect', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockResolvedValueOnce({ error: null }),
        eq: jest.fn().mockReturnThis(),
      });
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockResolvedValueOnce({ error: null }),
        eq: jest.fn().mockReturnThis(),
      });

      await deletePoll('poll-123');

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('options');
      expect(mockSupabaseClient.from().delete).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('polls');
      expect(mockSupabaseClient.from().delete).toHaveBeenCalledTimes(2);
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('should throw error if user not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

      await expect(deletePoll('poll-123')).rejects.toThrow('User not authenticated');
    });

    it('should return error if options deletion fails', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockResolvedValueOnce({ error: { message: 'Options deletion failed' } }),
        eq: jest.fn().mockReturnThis(),
      });

      const result = await deletePoll('poll-123');

      expect(result).toEqual({ error: 'Options deletion failed' });
    });

    it('should return error if poll deletion fails', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } });
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockResolvedValueOnce({ error: null }),
        eq: jest.fn().mockReturnThis(),
      });
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockResolvedValueOnce({ error: { message: 'Poll deletion failed' } }),
        eq: jest.fn().mockReturnThis(),
      });

      const result = await deletePoll('poll-123');

      expect(result).toEqual({ error: 'Poll deletion failed' });
    });
  });
});