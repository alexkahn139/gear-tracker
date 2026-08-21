import { Layout } from '@/components/layout/Layout.js';

export default function Inventory() {
  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage the shared gear pool.
          </p>
        </div>
        <p className="text-slate-500">No items yet. Item listing coming in task 2.2.</p>
      </div>
    </Layout>
  );
}
