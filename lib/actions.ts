'use server';

import { createServerSupabaseClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitVoteAction(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const pollId = formData.get('pollId') as string;
  const optionId = formData.get('optionId') as string;

  if (!user) {
    // Allow unauthenticated users to view, but restrict voting
    // This case should ideally be handled client-side or by showing a login prompt
    console.log('Unauthenticated user attempted to vote.');
    return { error: 'You must be logged in to vote.' };
  }

  // Check if the user has already voted on this poll
  const { data: existingVote, error: existingVoteError } = await supabase
    .from('votes')
    .select('*')
    .eq('poll_id', pollId)
    .eq('user_id', user.id)
    .single();

  if (existingVoteError && existingVoteError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error checking existing vote:', existingVoteError);
    return { error: 'An error occurred while checking your vote status.' };
  }

  if (existingVote) {
    console.log('User has already voted on this poll.');
    return { error: 'You have already voted on this poll.' };
  }

  const { error: voteError } = await supabase
    .from('votes')
    .insert({ poll_id: pollId, option_id: optionId, user_id: user.id });

  if (voteError) {
    console.error('Error submitting vote:', voteError);
    return { error: voteError.message };
  }

  revalidatePath(`/polls/${pollId}`);
  // After vote submission, we can show a thank you or results placeholder
  // For now, we'll revalidate the path to show updated results.
  return { success: true, message: 'Vote submitted successfully!' };
}