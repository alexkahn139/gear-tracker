import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card.js';
import { Button } from '@/components/ui/button.js';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <CardHeader className="items-center">
          <CardTitle>404 — Not found</CardTitle>
          <CardDescription>The page or resource you are looking for does not exist.</CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="justify-center">
          <Link to="/">
            <Button variant="outline">Back to inventory</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
