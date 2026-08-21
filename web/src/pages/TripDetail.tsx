import { Layout } from '@/components/layout/Layout.js';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';

export default function TripDetail() {
  return (
    <Layout>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Trip detail</CardTitle>
          <CardDescription>
            Pack list editor, weight summary, and share link land in task 4.4.
          </CardDescription>
        </CardHeader>
      </Card>
    </Layout>
  );
}
