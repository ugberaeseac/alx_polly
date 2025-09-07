import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { deletePollAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import PollCard from '@/components/PollCard';

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: polls, error } = await supabase
    .from('polls')
    .select('*');

  if (error) {
    console.error('Error fetching polls:', error.message);
    return <div>Error loading polls.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Polls</h1>
      {
        polls?.length === 0 ? (
          <p>No polls available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls?.map((poll) => (
              <PollCard key={poll.id} poll={{ ...poll, title: poll.question }} user={user} />
            ))}
          </div>
        )
      }
    </div>
  );
}
