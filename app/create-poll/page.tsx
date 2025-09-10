import { createPollData } from '@/lib/data/polls';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function CreatePollPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create New Poll</h1>
      <form action={createPollData} className="space-y-4">
        <div>
          <Label htmlFor="title">Poll Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Input id="description" name="description" />
        </div>
        <div>
          <Label>Options (at least 2)</Label>
          <Input name="option" placeholder="Option 1" required />
          <Input name="option" placeholder="Option 2" required className="mt-2" />
          <Input name="option" placeholder="Option 3 (Optional)" className="mt-2" />
          <Input name="option" placeholder="Option 4 (Optional)" className="mt-2" />
        </div>
        <Button type="submit">Create Poll</Button>
      </form>
    </div>
  );
}