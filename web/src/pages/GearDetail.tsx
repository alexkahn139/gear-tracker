import { Layout } from '@/components/layout/Layout.js';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';

export default function GearDetail() {
  return (
    <Layout>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Gear detail</CardTitle>
          <CardDescription>
            Item view, edit form, and loan history land in task 2.4.
          </CardDescription>
        </CardHeader>
      </Card>
    </Layout>
  );
}
