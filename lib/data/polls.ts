'use server';

import { createServerSupabaseClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { Database } from '@/lib/supabase/database.types';

type Poll = Database['public']['Tables']['polls']['Row'];

export async function getPollsByUserId(userId: string): Promise<{ data: Poll[]; error: Error | null }> {
  if (!userId) {
    console.error('getPollsByUserId: userId is undefined or null');
    return { data: [], error: new Error('User ID is required') };
  }
  const supabase = await createServerSupabaseClient();
  const { data: polls, error } = await supabase
    .from('polls')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching polls by user ID:', error);
    return { data: [], error };
  }
  return { data: polls, error: null };
}

export async function getAllPolls(): Promise<{ data: Poll[]; error: Error | null }> {
  const supabase = await createServerSupabaseClient();
  const { data: polls, error } = await supabase
    .from('polls')
    .select('*');

  if (error) {
    console.error('Error fetching all polls:', error);
    return { data: [], error };
  }
  return { data: polls, error: null };
}

export async function getPollById(pollId: string): Promise<{ data: Poll | null; error: Error | null }> {
  const supabase = await createServerSupabaseClient();
  const { data: poll, error } = await supabase
    .from('polls')
    .select('*, options(*)')
    .eq('id', pollId)
    .single();

  if (error) {
    console.error('Error fetching poll by ID:', error);
    return { data: null, error };
  }
  return { data: poll, error: null };
}

export async function createPollData(formData: FormData) {
  const supabase = await createServerSupabaseClient();

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

export async function editPollData(formData: FormData): Promise<{ data: Poll | null; error: Error | null }> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const pollId = formData.get('pollId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string | null;

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq('id', pollId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (pollError) {
    console.error('Error updating poll:', pollError);
    return { data: null, error: new Error(pollError.message) };
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
      return { data: null, error: new Error(optionsInsertError.message) };
    }
  }

  revalidatePath('/');
  redirect('/');
  return { data: poll, error: null };
}

export async function deletePollData(pollId: string): Promise<{ data: null; error: Error | null }> {
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
    return { data: null, error: new Error(optionsError.message) };
  }

  // Then delete the poll
  const { error: pollError } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId)
    .eq('user_id', user.id);

  if (pollError) {
    console.error('Error deleting poll:', pollError);
    return { data: null, error: new Error(pollError.message) };
  }

  revalidatePath('/');
  redirect('/');
  return { data: null, error: null };
}

export async function deletePollActionData(formData: FormData) {
  const pollId = formData.get('pollId') as string;
  await deletePollData(pollId);
}

export async function getUserVote(pollId: string, userId: string) {
  const supabase = createServerSupabaseClient();
  const { data: userVote, error } = await supabase
    .from('votes')
    .select('option_id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user vote:', error);
    return null;
  }
  return userVote;
}

