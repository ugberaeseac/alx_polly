import React from 'react';
import { createServerSupabaseClient } from '@/app/utils/supabase/server';
import { getPollsByUserId } from '@/lib/data/polls';
import { redirect } from 'next/navigation';

export default async function PollsPage() {
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: polls, error } = await getPollsByUserId(user.id);

  if (error) {
    console.error('Error fetching polls:', error.message);
    return <div>Error loading polls.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Polls</h1>
      {
        polls?.length === 0 ? (
          <p>No polls created yet. <a href="/create-poll" className="text-blue-500">Create one!</a></p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls?.map((poll) => (
              <div key={poll.id} className="border p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-2">{poll.title}</h2>
                <p className="text-gray-600">{poll.description}</p>
                <a href={`/polls/${poll.id}`} className="text-blue-500 mt-2 block">View Poll</a>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}