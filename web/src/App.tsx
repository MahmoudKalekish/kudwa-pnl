import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PnLTablePage from './pages/PnLTablePage';
import DashboardPage from './pages/DashboardPage';

const qc = new QueryClient();
const router = createBrowserRouter([
  { path: '/', element: <PnLTablePage /> },
  { path: '/dashboard', element: <DashboardPage /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
