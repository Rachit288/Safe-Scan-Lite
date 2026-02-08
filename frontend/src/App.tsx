import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useServerKeepAlive } from './hooks/useServerKeepAlive';
import { ServerStatusIndicator } from './components/ServerStatusIndicator';
import './index.css';

function App() {
  // Keep the server alive by pinging every 10 minutes
  useServerKeepAlive();

  return (
    <>
      <RouterProvider router={router} />
      <ServerStatusIndicator />
    </>
  );
}

export default App;