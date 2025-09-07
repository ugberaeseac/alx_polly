'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from './supabase/server-client';

export async function editPoll(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const pollId = formData.get('pollId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string | null;

  const { error: pollError } = await supabase
    .from('polls')
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq('id', pollId)
    .eq('created_by', user.id);

  if (pollError) {
    console.error('Error updating poll:', pollError);
    return { error: pollError.message };
  }

  // Update existing options and add new ones
  const optionsToUpdate: { id?: string; option_text: string }[] = [];
  const optionsToInsert: { poll_id: string; option_text: string }[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('option-') && typeof value === 'string' && value.trim() !== '') {
      const optionIndex = parseInt(key.split('-')[1]);
      // For simplicity, we are assuming existing options are re-submitted with their original index.
      // A more robust solution would track option IDs.
      optionsToUpdate.push({ option_text: value });
    } else if (key === 'new-option' && typeof value === 'string' && value.trim() !== '') {
      optionsToInsert.push({ poll_id: pollId, option_text: value });
    }
  }

  // This is a simplified update. In a real app, you'd fetch existing options to compare and update/delete.
  // Here, we are just updating the text of the existing number of options that were displayed.
  if (optionsToUpdate.length > 0) {
    const { data: existingOptions } = await supabase
      .from('options')
      .select('id')
      .eq('poll_id', pollId)
      .order('id', { ascending: true });

    if (existingOptions) {
      for (let i = 0; i < optionsToUpdate.length; i++) {
        if (existingOptions[i]) {
          await supabase
            .from('options')
            .update({ option_text: optionsToUpdate[i].option_text })
            .eq('id', existingOptions[i].id);
        }
      }
    }
  }

  if (optionsToInsert.length > 0) {
    const { error: optionsInsertError } = await supabase
      .from('options')
      .insert(optionsToInsert);

    if (optionsInsertError) {
      console.error('Error inserting new options:', optionsInsertError);
      return { error: optionsInsertError.message };
    }
  }

  revalidatePath('/');
  redirect('/');
}

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

export async function deletePollAction(formData: FormData) {
  const pollId = formData.get('pollId') as string;
  await deletePoll(pollId);
}


export async function deletePoll(pollId: string) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Delete associated options first
  const { error: optionsError } = await supabase
    .from('options')
    .delete()
    .eq('poll_id', pollId);

  if (optionsError) {
    console.error('Error deleting options:', optionsError);
    return { error: optionsError.message };
  }

  // Then delete the poll
  const { error: pollError } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId)
    .eq('created_by', user.id);

  if (pollError) {
    console.error('Error deleting poll:', pollError);
    return { error: pollError.message };
  }

  revalidatePath('/');
  redirect('/');
}

export async function createPoll(formData: FormData) {
  const supabase = createServerSupabaseClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const options = formData.getAll('option') as string[];

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({ title, description, user_id: user.id })
    .select()
    .single();

  if (pollError) {
    console.error('Error creating poll:', pollError.message);
    throw new Error('Failed to create poll');
  }

  const optionsToInsert = options.filter(option => option.trim() !== '').map(option => ({
    poll_id: poll.id,
    option_text: option,
  }));

  if (optionsToInsert.length > 0) {
    const { error: optionsError } = await supabase
      .from('options')
      .insert(optionsToInsert);

    if (optionsError) {
      console.error('Error creating options:', optionsError.message);
      throw new Error('Failed to create poll options');
    }
  }

  revalidatePath('/');
  redirect('/');
}