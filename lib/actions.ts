'use server';

import { createServerSupabaseClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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