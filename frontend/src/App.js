import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import queryClient from './queryClient';
import root from './router/root';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={root} />
    </QueryClientProvider>
  );
}

export default App;
