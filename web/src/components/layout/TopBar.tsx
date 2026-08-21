import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api.js';

export function TopBar({ userName }: { userName?: string }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // logout is best-effort; the cookie is cleared server-side on next attempt
    }
    navigate('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="text-sm text-muted-foreground">
        {userName ? `Signed in as ${userName}` : 'Gear Tracker'}
      </div>
      {userName ? (
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-primary hover:underline"
        >
          Log out
        </button>
      ) : null}
    </header>
  );
}
