import { getAllPolls } from '@/lib/data/polls';
import PollCard from '@/components/PollCard';
import { createServerSupabaseClient } from '@/app/utils/supabase/server';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const polls = await getAllPolls();

  if (!polls) {
    return <div>Error loading polls.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Polls</h1>
      {
        polls.length === 0 ? (
          <p>No polls available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} user={user} />
            ))}
          </div>
        )
      }
    </div>
  );
}
