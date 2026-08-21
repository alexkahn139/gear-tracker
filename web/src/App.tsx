import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/hooks/useApi.js';
import Login from '@/pages/Login.js';
import Register from '@/pages/Register.js';
import Inventory from '@/pages/Inventory.js';
import GearDetail from '@/pages/GearDetail.js';
import Loans from '@/pages/Loans.js';
import Trips from '@/pages/Trips.js';
import TripDetail from '@/pages/TripDetail.js';
import ShareView from '@/pages/ShareView.js';
import NotFound from '@/pages/NotFound.js';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Inventory />} />
          <Route path="/gear/:id" element={<GearDetail />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/share/:token" element={<ShareView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
