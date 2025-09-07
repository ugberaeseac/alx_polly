'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LoginPrompt() {
  const router = useRouter();
  return (
    <div className="text-center">
      <p className="text-xl mb-4">Please log in to vote.</p>
      <Button onClick={() => router.push('/login')}>Log In</Button>
    </div>
  );
}