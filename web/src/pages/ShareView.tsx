import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';

export default function ShareView() {
  return (
    <div className="min-h-full bg-background p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold">Pack list</h1>
        <Card>
          <CardHeader>
            <CardTitle>Shared trip</CardTitle>
            <CardDescription>
              Read-only pack list display (no auth, no sidebar) lands in task 4.5.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
