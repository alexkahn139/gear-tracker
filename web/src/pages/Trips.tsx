import { Layout } from '@/components/layout/Layout.js';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';

export default function Trips() {
  return (
    <Layout>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Trips</CardTitle>
          <CardDescription>
            Trip list and creation land in task 4.3.
          </CardDescription>
        </CardHeader>
      </Card>
    </Layout>
  );
}
