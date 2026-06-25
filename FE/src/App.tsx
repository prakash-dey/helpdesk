import { AppRouter } from '@/app/router/AppRouter';
import { useSessionRestore } from './features/auth/useSessionRestore';

function App() {
  useSessionRestore();
  return <AppRouter />;
}

export default App;