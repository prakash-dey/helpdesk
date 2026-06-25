import { AppRouter } from './router';
import { useSessionRestore } from '@/hooks/useSessionRestore';

export default function App() {
  useSessionRestore();
  return <AppRouter />;
}
