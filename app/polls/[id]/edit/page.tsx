import { createServerSupabaseClient } from '@/app/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { editPollData, getPollById } from '@/lib/data/polls';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface EditPollPageProps {
  params: { id: string };
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: poll } = await supabase
    .from('polls')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!poll || poll.created_by !== user.id) {
    notFound();
  }

  const { data: options } = await supabase
    .from('options')
    .select('option_text')
    .eq('poll_id', params.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Poll</h1>
      <form action={editPollData} className="space-y-4">
        <input type="hidden" name="pollId" value={poll.id} />
        <div>
          <Label htmlFor="title">Poll Title</Label>
          <Input id="title" name="title" defaultValue={poll.title} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" defaultValue={poll.description || ''} />
        </div>
        <div>
          <Label>Options</Label>
          {options?.map((option, index) => (
            <Input key={index} name={`option-${index}`} defaultValue={option.option_text} className="mt-2" required />
          ))}
          <Input name="new-option" placeholder="Add new option (optional)" className="mt-2" />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}