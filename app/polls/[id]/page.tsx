import { notFound } from 'next/navigation';
import { getPollById, getUserVote } from '@/lib/data/polls';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { submitVoteAction } from '@/lib/actions';
import LoginPrompt from '@/components/LoginPrompt';
import { createServerSupabaseClient } from '@/app/utils/supabase/server';

export default async function PollDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: poll, error } = await getPollById(id);

  if (error || !poll) {
    notFound();
  }




  // Check if the user has already voted
  const supabase = createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const isAuthenticated = !!user;
  const userVote = user ? await getUserVote(params.id, user.id) : null;
  const hasVoted = !!userVote;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6">{poll.question}</h1>

      {!isAuthenticated ? (
        <div className="text-center">
          <LoginPrompt />
        </div>
      ) : hasVoted ? (
        <div className="text-center">
          <p className="text-xl mb-4">Thank you for voting!</p>
          <p className="text-lg">Total Votes: {poll.total_votes}</p>
          <p className="text-lg">Likes: {poll.likes}</p>
        </div>
      ) : (
        <form action={submitVoteAction} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <input type="hidden" name="pollId" value={params.id} />
          <RadioGroup name="optionId">
            {poll.options.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2 mb-4">
                <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                <Label htmlFor={option.id.toString()}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
          <Button type="submit" className="w-full mt-6">Submit Vote</Button>
        </form>
      )}

      <Separator className="my-8" />

      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">Created by: {poll.created_by}</p>
        <p className="text-sm text-gray-500">Created at: {new Date(poll.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}