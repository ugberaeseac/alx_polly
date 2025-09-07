'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { deletePollAction } from '@/lib/actions';
import Link from 'next/link';

interface PollCardProps {
  poll: {
    id: string;
    title: string; // Changed from question to title
    description: string | null;
    created_by: string;
  };
  user: {
    id: string;
  } | null;
}

export default function PollCard({ poll, user }: PollCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deletePollAction(new FormData()); // Empty form data for now, actual pollId will be passed via hidden input
      router.refresh();
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>
          <Link href={`/polls/${poll.id}`} className="hover:underline">
            {poll.question}
          </Link>
        </CardTitle>
        {poll.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {poll.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="grow"></CardContent>
      <CardFooter className="flex justify-between">
        {user && user.id === poll.created_by && (
          <div className="flex space-x-2">
            <Button onClick={() => router.push(`/polls/${poll.id}/edit`)} variant="outline">Edit</Button>
            <form onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const formData = new FormData(e.currentTarget);
                await deletePollAction(formData);
                router.refresh();
              });
            }}>
              <input type="hidden" name="pollId" value={poll.id} />
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}