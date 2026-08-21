import { Layout } from '@/components/layout/Layout.js';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';

export default function Loans() {
  return (
    <Layout>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Loans</CardTitle>
          <CardDescription>
            Active, overdue, and historical gear loans land in task 3.2.
          </CardDescription>
        </CardHeader>
      </Card>
    </Layout>
  );
}
